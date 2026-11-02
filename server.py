from __future__ import annotations

import base64
import difflib
import html as _html
import io
import json
import os
import platform
import random
import re
import secrets
import threading
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from rembg import remove

# --- Configuración (.env opcional + variables de entorno) -------------------
# Precedencia: variable de entorno real > .env > valor por defecto.
# Todas las claves están documentadas en .env.example (cópialo a .env para
# personalizar); Docker las inyecta vía docker-compose.yml.

def _load_dotenv() -> None:
    """Lee KEY=VAL de un .env en la raíz del proyecto (sin dependencias)."""
    env_file = Path(__file__).parent / ".env"
    if not env_file.is_file():
        return
    for raw in env_file.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and value is not None:
            os.environ.setdefault(key, value)


_load_dotenv()

# Seleccion de modelo de rembg:
# - ARM (Raspberry Pi, Jetson, etc.): "u2netp" (ligero, ~4.7 MB, 4-6x mas
#   rapido en CPU ARM; calidad ligeramente menor, suficiente para memes).
# - x86/x64 (PC): "u2net" completo (~176 MB, mejor calidad).
# - Vacio u override con REMBG_MODEL (ver .env.example).
_IS_ARM = platform.machine().lower() in ("aarch64", "armv7l", "armv6l")
_REMBG_MODEL = os.environ.get("REMBG_MODEL") or ("u2netp" if _IS_ARM else "u2net")

# Servidor HTTP local; en Docker el contenedor SIEMPRE escucha en 0.0.0.0:5005
_HOST = os.environ.get("HOST", "0.0.0.0")
_PORT = int(os.environ.get("PORT", "5005"))

# Origenes CORS admitidos, separados por comas ("*" por defecto)
_CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()] or ["*"]

# Cache del catalogo/Busqueda de memes (segundos) y tamano del proxy de imagenes
_MEME_CACHE_TTL = int(os.environ.get("MEME_CACHE_TTL", "300"))
_IMG_CACHE_MAX = int(os.environ.get("IMG_CACHE_MAX", "120"))

# Protecciones del endpoint pesado /api/remove-bg (inference CPU):
# - tamaño maximo de la imagen aceptada (evita peticiones que agoten la RAM)
# - inferencias concurrentes (un modelo U2-Net en CPU por slot)
# - pre-warm opcional del modelo al arrancar (evita la primera descarga lenta
#   mientras el usuario ya esta esperando su primer "quitar fondo")
_MAX_UPLOAD_MB = int(os.environ.get("MAX_UPLOAD_MB", "10"))
_MAX_REMOVAL_CONCURRENCY = int(os.environ.get("MAX_REMOVAL_CONCURRENCY", "2"))
_PREWARM_MODEL = os.environ.get("PREWARM_MODEL", "").lower() in ("1", "true", "yes", "si", "sí")
_removal_slots = threading.BoundedSemaphore(max(1, _MAX_REMOVAL_CONCURRENCY))

# Acceso con usuario/contrasena (Basic Auth del navegador) y borradores remotos
# (sincronizacion movil <-> PC):
# - AUTH_USERS=daniel:mipass,ana:supass -> TODA la app pide login. Ideal al
#   exponer el servidor fuera de casa (Cloudflare Tunnel); vacio = sin login
#   (uso local/LAN, comportamiento igual que antes).
# - Cada usuario autenticado guarda su PROPIO borrador en drafts/<usuario>.json
#   con los botones "Subir borrador"/"Traer borrador" de la interfaz.
_DRAFT_DIR = Path(os.environ.get("DRAFT_DIR") or (Path(__file__).parent / "drafts"))
_DRAFT_MAX_MB = int(os.environ.get("DRAFT_MAX_MB", "25"))

_WWW_AUTH = {"WWW-Authenticate": 'Basic realm="Meme Studio Pro"'}
_AUTH_EXEMPT = ("/health", "/favicon.png")


def _parse_auth_users(raw: str) -> dict:
    users = {}
    for pair in (raw or "").split(","):
        user, _, pw = pair.partition(":")
        if user.strip() and pw:
            users[user.strip()] = pw
    return users


AUTH_USERS = _parse_auth_users(os.environ.get("AUTH_USERS", ""))


def _check_auth(header: str | None) -> str:
    """Devuelve el usuario autenticado, o None si la app corre sin contrasena."""
    if not AUTH_USERS:
        return ""
    if not header or not header.lower().startswith("basic "):
        raise HTTPException(status_code=401, detail="Login requerido", headers=_WWW_AUTH)
    try:
        user, _, pw = base64.b64decode(header.split(" ", 1)[1]).decode("utf-8").partition(":")
    except Exception:
        raise HTTPException(status_code=401, detail="Login invalido", headers=_WWW_AUTH)
    expected = AUTH_USERS.get(user)
    if expected and secrets.compare_digest(expected, pw):
        return user
    raise HTTPException(status_code=401, detail="Usuario o contrasena incorrectos", headers=_WWW_AUTH)


def _draft_slug(user: str) -> str:
    return re.sub(r"[^a-z0-9_.-]+", "_", (user or "local").lower())

# Subreddits y terminos aleatorios de la busqueda Reddit (ver .env.example)
_REDDIT_SUBS = tuple(
    s.strip() for s in os.environ.get(
        "REDDIT_SUBS",
        "dankmemes,me_ira,wholesomememes,photoshopbattles,AdviceAnimals",
    ).split(",") if s.strip()
)
_REDDIT_TERMS = tuple(
    s.strip() for s in os.environ.get(
        "REDDIT_TERMS",
        "drake,cat,dog,anime,gaming,monday,office,sad,happy,work,school,food",
    ).split(",") if s.strip()
)

_rembg_session = None  # se crea de forma diferida en la primera peticion


def _get_rembg_session():
    """Crea la sesion de rembg una sola vez (la creacion es costosa y
    descarga el modelo a ~/.u2net si no existe; diferirla evita bloquear
    el arranque si no hay red)."""
    global _rembg_session
    if _rembg_session is None:
        try:
            from rembg import new_session

            _rembg_session = new_session(_REMBG_MODEL)
        except Exception as exc:  # sin red o modelo invalido: fallback al default
            print(f"[remove-bg] No se pudo crear la sesion '{_REMBG_MODEL}' ({exc}); usando modelo por defecto")
            _rembg_session = False
    return _rembg_session or None

app = FastAPI(title="Meme Studio Pro")

# Puerta de entrada con Basic Auth (solo si AUTH_USERS esta configurado).
# Declarada ANTES del CORS middleware para que las respuestas 401 salgan con
# cabeceras CORS y el navegador no las confunda con fallos de red.
@app.middleware("http")
async def _auth_gate(request: Request, call_next):
    path = request.url.path
    if AUTH_USERS and path not in _AUTH_EXEMPT and request.method != "OPTIONS":
        try:
            request.state.user = _check_auth(request.headers.get("authorization"))
        except HTTPException as exc:
            return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=exc.headers)
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = Path(__file__).parent.resolve()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/remove-bg")
def remove_bg(image: UploadFile = File(...)) -> StreamingResponse:
    if not image.filename:
        raise HTTPException(status_code=400, detail="No image file provided")

    # Una inferencia cuenta aqui: hasta MAX_REMOVAL_CONCURRENCY a la vez y
    # 429 para las demas en vez de encolar hasta saturar CPU/RAM.
    if not _removal_slots.acquire(blocking=False):
        raise HTTPException(
            status_code=429,
            detail=f"Servidor ocupado (max {_MAX_REMOVAL_CONCURRENCY} inferencias en paralelo); reintenta en unos segundos",
        )

    try:
        try:
            content = image.file.read(_MAX_UPLOAD_MB * 1024 * 1024 + 1)
            if len(content) > _MAX_UPLOAD_MB * 1024 * 1024:
                raise HTTPException(
                    status_code=413,
                    detail=f"Imagen demasiado grande (max {_MAX_UPLOAD_MB} MB)",
                )
            with Image.open(io.BytesIO(content)) as img:
                rgba = img.convert("RGBA")
                src_w, src_h = rgba.size
                session = _get_rembg_session()
                subject = remove(rgba, session=session) if session else remove(rgba)

                # Auto-crop: bounding box del canal alfa. Elimina el area 100%
                # transparente sobrante para que el resultado sea mas pequeno
                # (menos pixels muertos que el canvas de la app sobredimensiona).
                # El offset/dimensiones originales viajan en la cabecera
                # X-Crop-Box: "left,top,original_width,original_height" para que
                # el frontend pueda reubicar la capa en su sitio.
                bbox = subject.getchannel("A").getbbox()
                if bbox:
                    pad = max(1, min(src_w, src_h) // 200)  # margen anti-aliasing
                    left = max(0, bbox[0] - pad)
                    top = max(0, bbox[1] - pad)
                    right = min(src_w, bbox[2] + pad)
                    bottom = min(src_h, bbox[3] + pad)
                    result = subject.crop((left, top, right, bottom))
                else:  # resultado totalmente transparente: no habia nada que recortar
                    left, top = 0, 0
                    result = subject

                output = io.BytesIO()
                result.save(output, format="PNG")
                output.seek(0)
                headers = {"X-Crop-Box": f"{left},{top},{src_w},{src_h}"}
                return StreamingResponse(output, media_type="image/png", headers=headers)
        except HTTPException:
            raise  # errores propios (413, ...): no convertirlos en 500
        except Exception as exc:  # pragma: no cover - defensive path
            raise HTTPException(status_code=500, detail=f"Error processing image: {exc}")
    finally:
        _removal_slots.release()


@app.get("/")
def index() -> FileResponse:
    html_file = static_dir / "memegnerator.html"
    if not html_file.is_file():
        html_file = static_dir / "index.html"
    return FileResponse(html_file)


# --- Busqueda de memes (proxy Imgflip + Reddit) ------------------------------

_IMGFLIP_CACHE: dict = {"items": [], "ts": 0.0}  # catalogo top-100 (5 minutos)
_REDDIT_CACHE: dict[str, dict] = {}  # busquedas en Reddit, clave por termino
_MIME_CACHE: dict[str, bytes] = {}  # imagenes servidas por /api/meme-image

# Dominios desde los que /api/meme-image acepta servir imagenes (evita usar el
# proxy como foso abierto hacia cualquier URL).
_ALLOWED_IMAGE_HOSTS = ("imgflip.com", "redd.it", "redditmedia.com", "imgur.com")

_HTTP_HEADERS = {
    "User-Agent": "MemeStudioPro/1.0 (meme editor; +https://localhost:5005)",
    "Accept": "*/*",
}

# Reddit rechaza con 403 User-Agents que no parecen un navegador real.
_REDDIT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
    "Accept": "application/json",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}


def _normalize(text: str) -> str:
    """Minusculas sin acentos: 'camión' -> 'camion'."""
    lowered = unicodedata.normalize("NFKD", text.lower())
    return "".join(ch for ch in lowered if not unicodedata.combining(ch))


def _match_score(query: str, name: str) -> float:
    """Puntua la similitud difusa entre la busqueda y el nombre del meme (0-100).

    - Coincidencia exacta del termino: maximo.
    - Coincidencia por palabra completa: alta.
    - Tipeo cercano (difflib >= 0.8): parcial. Devuelve 0 si no hay nada.
    """
    if query == name:
        return 100.0
    if query in name:
        return 90.0 - min(len(name) - len(query), 40) / 4  # nombres mas cortos primero
    q_tokens = set(query.split())
    n_tokens = set(name.split())
    if not q_tokens:
        return 0.0
    score = 0.0
    for q_token in q_tokens:
        if q_token in n_tokens:
            score += 45.0
            continue
        best = max(
            (difflib.SequenceMatcher(None, q_token, n_token).ratio() for n_token in n_tokens),
            default=0.0,
        )
        if best >= 0.8:
            score += 30.0 * best
    return score / len(q_tokens)


@app.get("/api/meme-search")
def meme_search(q: str = "", limit: int = 24) -> dict:
    """Busca plantillas virales en el top-100 de Imgflip con matching difuso.

    Imgflip solo publica 100 memes publicos (no existe endpoint de busqueda),
    pero normalizar acentos y tolerar tipeos cubre casi todas las busquedas
    reales. Sin termino devuelve una muestra aleatoria.
    """
    now = time.time()
    if not _IMGFLIP_CACHE["items"] or now - _IMGFLIP_CACHE["ts"] > _MEME_CACHE_TTL:
        try:
            req = urllib.request.Request(
                "https://api.imgflip.com/get_memes", headers=_HTTP_HEADERS
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                payload = json.loads(response.read().decode("utf-8"))
            items = payload.get("data", {}).get("memes", []) or []
            if items:
                _IMGFLIP_CACHE["items"] = items
                _IMGFLIP_CACHE["ts"] = now
        except Exception as exc:
            print(f"[meme-search] No se pudo refrescar el catalogo: {exc}")

    items = _IMGFLIP_CACHE["items"]  # ante fallo de red se recicla el anterior
    if not items:
        raise HTTPException(status_code=503, detail="Catalogo de memes no disponible")

    term = _normalize(q or "")
    if not term:
        chosen = random.sample(items, k=min(len(items), max(1, min(limit, 24))))
    else:
        scored = [(score, item) for item in items
                  if (score := _match_score(term, _normalize(item.get("name", "")))) >= 30.0]
        scored.sort(key=lambda pair: -pair[0])
        chosen = [item for _, item in scored[:max(1, min(limit, 24))]]

    return {
        "data": {
            "memes": [
                {
                    "name": item.get("name", "Meme viral"),
                    "url": "/api/meme-image?src=" + urllib.parse.quote(item.get("url", ""), safe=""),
                    "width": item.get("width"),
                    "height": item.get("height"),
                }
                for item in chosen
                if item.get("url")
            ]
        }
    }


@app.get("/api/meme-image")
def meme_image(src: str) -> Response:
    """Proxy de la imagen del meme servido desde NUESTRO origen.

    Sirve la imagen de i.imgflip.com desde este mismo servidor para que el
    canvas del navegador nunca se contamine (tainted) y la exportacion
    funcione incluso si el CDN bloquea CORS.
    """
    parsed = urllib.parse.urlparse(src)
    host = parsed.hostname or ""
    scheme = parsed.scheme
    if scheme not in ("http", "https") or not host or not host.endswith(_ALLOWED_IMAGE_HOSTS):
        raise HTTPException(status_code=400, detail="Solo se permiten imagenes de imgflip/reddit/imgur")

    data = _MIME_CACHE.get(src)
    if data is None:
        req = urllib.request.Request(src, headers=_HTTP_HEADERS)
        with urllib.request.urlopen(req, timeout=15) as response:
            data = response.read()
        if len(_MIME_CACHE) > _IMG_CACHE_MAX:  # cache simple: se vacia por completo
            _MIME_CACHE.clear()
        _MIME_CACHE[src] = data

    with Image.open(io.BytesIO(data)) as probe:
        fmt = (probe.format or "PNG").upper()
    media = {
        "JPEG": "image/jpeg",
        "PNG": "image/png",
        "GIF": "image/gif",
        "WEBP": "image/webp",
    }.get(fmt, "application/octet-stream")
    return Response(content=data, media_type=media)


# --- Sincronizacion de borradores (movil <-> PC via el servidor) --------------
# Cada usuario autenticado (o "local" si corre sin contrasena) tiene UN borrador
# remoto: drafts/<usuario>.json con el meme completo (imagen en dataURL, capas,
# posicion, filtros, marca de agua...). Subir en un sitio, traer en el otro.

@app.post("/api/draft")
async def draft_upload(request: Request) -> dict:
    user = getattr(request.state, "user", "") or "local"
    length = int(request.headers.get("content-length") or 0)
    if length > _DRAFT_MAX_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Borrador demasiado grande (max {_DRAFT_MAX_MB} MB)")
    raw = await request.body()
    try:
        json.loads(raw.decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Borrador invalido (no es JSON): {exc}")
    _DRAFT_DIR.mkdir(parents=True, exist_ok=True)
    (_DRAFT_DIR / f"{_draft_slug(user)}.json").write_bytes(raw)
    return {"ok": True, "user": user, "bytes": len(raw), "saved_at": round(time.time(), 3)}


@app.get("/api/draft")
def draft_download(request: Request) -> Response:
    user = getattr(request.state, "user", "") or "local"
    path = _DRAFT_DIR / f"{_draft_slug(user)}.json"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Este usuario todavia no tiene borrador guardado en el servidor")
    return Response(
        content=path.read_bytes(),
        media_type="application/json",
        headers={"X-Saved-At": str(int(path.stat().st_mtime))},
    )


# Reddit: la API JSON de reddit.com + Cloudflare bloquea este tipo de red (403
# sin importar el User-Agent), asi que usamos Arctic Shift (archivo publico de
# Reddit, sin clave de API) con busqueda por titulo por subreddit.
# OJO: Arctic Shift rechaza (400/422) la keyword-search en subreddits demasiado
# activos (r/memes); por eso iteramos varios y los que fallen se saltan.
_ARCTIC_BASE = "https://arctic-shift.photon-reddit.com/api/posts/search"
_MEME_SUBS = _REDDIT_SUBS  # configurado arriba via REDDIT_SUBS (.env)

# Terminos aleatorios para el boton sin texto (memes de verdad, no posts nuevos
# con score ~0, que es lo que devuelve una vista 'hot' del archivo).
_REDDIT_RANDOM_TERMS = _REDDIT_TERMS  # configurado arriba via REDDIT_TERMS (.env)

_IMAGE_EXT_RE = re.compile(r"\.(jpe?g|png|webp)$", re.IGNORECASE)


def _fetch_arctic_sub(sub: str, term: str, limit: int) -> list[dict] | None:
    """Posts con imagen de un subreddit (por titulo si hay termino).

    Devuelve [] si el sub respondio sin resultados (400/422 de Arctic Shift)
    y None si la API nos rate-limito (429) para cortar el bucle de subs.
    """
    params = {"subreddit": sub, "limit": limit, "sort_type": "created_utc", "sort": "desc"}
    if term:
        params["title"] = term
    url = _ARCTIC_BASE + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=_REDDIT_HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code == 429:
            print(f"[meme-search-reddit] Arctic Shift rate-limit (429) en r/{sub}")
            return None  # las siguientes peticiones tambien lo seran: cortar
        return []
    except Exception:
        return []
    out: list[dict] = []
    for data in payload.get("data", []) or []:
        if data.get("over_18"):
            continue
        image = (data.get("url") or "") or None
        if image and not _IMAGE_EXT_RE.search(image):
            preview = ((data.get("preview") or {}).get("images") or [])
            source_url = (preview[0].get("source") if preview else {}).get("url") or ""
            image = source_url or None
            if image and not _IMAGE_EXT_RE.search(urllib.parse.urlsplit(image).path):
                image = None
        if not image:
            continue
        title = " ".join((data.get("title") or "Meme de Reddit").split())[:80]
        out.append({"name": title, "image": _html.unescape(image)})
    return out


def _reddit_populate_cache(term: str) -> None:
    """Rellena _REDDIT_CACHE[term] con posts con imagen.

    Un acierto en un cache con TTL largo (300 s) y otro corto para busquedas
    vacias (60 s, p. ej. por rate-limit) para no bloquear de golpe reintentos.
    Con termino: busca el termino en el titulo de 2 subreddits de memes.
    Sin termino: prueba hasta 3 terminos populares al azar hasta conseguir
    resultados (la vista 'hot' del archivo trae posts con score ~0, inutiles
    para el editor).
    """
    now = time.time()
    entry = _REDDIT_CACHE.get(term)
    if entry and now - entry["ts"] < (60 if not entry["items"] else _MEME_CACHE_TTL):
        return
    queries = [term] if term else random.sample(_REDDIT_RANDOM_TERMS, k=3)
    items: list[dict] = []
    for query in queries:
        for sub in _MEME_SUBS:
            posts = _fetch_arctic_sub(sub, query, 30)
            time.sleep(0.3)  # pacing anti-429
            if posts is None:  # rate-limited: no insistir con los demas subs
                break
            if posts:
                items.extend(p for p in posts if p not in items)
        if items:
            break

    _REDDIT_CACHE[term] = {"items": items, "ts": now}
    if len(_REDDIT_CACHE) > 40:
        _REDDIT_CACHE.clear()


@app.get("/api/meme-search-reddit")
def meme_search_reddit(q: str = "", limit: int = 24) -> dict:
    """Busca memes publicados en Reddit (subreddits de memes).

    Fuente: archivo publico de Reddit (Arctic Shift) consultado por el backend
    (sin clave de API y sin depender de que la red tenga acceso a reddit.com).
    Con termino busca el termino en el titulo de los posts de cada subreddit
    de memes; sin termino devuelve una muestra aleatoria de memes populares.
    """
    term = _normalize(q or "")
    _reddit_populate_cache(term)

    entry = _REDDIT_CACHE.get(term)
    items = entry["items"] if entry else []
    if not items:
        raise HTTPException(status_code=503, detail="Busqueda en Reddit no disponible")

    if term:
        scored = [
            (score, item) for item in items
            if (score := _match_score(term, _normalize(item["name"]))) >= 20.0
        ]
        scored.sort(key=lambda pair: -pair[0])
        chosen = [item for _, item in scored[:max(1, min(limit, 24))]]
    else:
        chosen = random.sample(items, k=min(len(items), max(1, min(limit, 24))))

    return {
        "data": {
            "memes": [
                {
                    "name": item["name"],
                    "url": "/api/meme-image?src=" + urllib.parse.quote(item["image"], safe=""),
                }
                for item in chosen
            ]
        }
    }


# Servir archivos estáticos del frontend (app.mjs, styles.css, etc.)
app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    print(f"\n==========================================")
    print(f"  Meme Studio Pro iniciando...")
    print(f"  Modelo rembg: {_REMBG_MODEL}{' (ARM)' if _IS_ARM else ''}")
    print(f"  Escuchando en: {_HOST}:{_PORT}")
    if AUTH_USERS:
        print(f"  Acceso: usuario/contrasena ({len(AUTH_USERS)} usuarios)")
    else:
        print(f"  Acceso: abierto (sin contrasena; config AUTH_USERS para protegerlo)")
    print(f"  Abre en tu navegador: http://localhost:{_PORT}")
    print(f"==========================================\n")
    if _PREWARM_MODEL:
        print("[remove-bg] PREWARM_MODEL activo: cargando el modelo en segundo plano...")
        threading.Thread(target=_get_rembg_session, daemon=True).start()
    uvicorn.run("server:app", host=_HOST, port=_PORT, reload=False)
