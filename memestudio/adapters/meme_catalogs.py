"""Adaptadores HTTP de catálogos de memes (Imgflip top-100 + Arctic Shift/Reddit)."""
from __future__ import annotations

import html as _html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import random

_HEADERS = {
    "User-Agent": "MemeStudioPro/1.0 (meme editor; +https://localhost:5005)",
    "Accept": "*/*",
}

# Reddit rechaza con 403 User-Agents que no parecen un navegador real.
_REDDIT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
    "Accept": "application/json",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}

_IMAGE_EXT_RE = re.compile(r"\.(jpe?g|png|webp)$", re.IGNORECASE)


def _http_json(url: str, headers: dict, timeout: int = 10):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


class ImgflipCatalog:
    """Endpoints de Imgflip.

    Imgflip solo publica 100 memes públicos (no existe endpoint de búsqueda);
    el matching difuso es tarea del DOMINIO (text_match), no de este
    adaptador: aquí solo conseguimos el catálogo crudo.
    """

    def __init__(self, cache_ttl: int):
        self._ttl = cache_ttl
        self._cache: dict = {"items": [], "ts": 0.0}

    def top_items(self) -> list[dict]:
        """Catálogo visto de Imgflip (sin parseo más allá de data.memes).

        Ante fallo de red se recicla el último catálogo conocidido; si nunca
        hubo, devuelve [] (el router mapea a 503).
        """
        now = time.time()
        if not self._cache["items"] or now - self._cache["ts"] > self._ttl:
            try:
                payload = _http_json("https://api.imgflip.com/get_memes", _HEADERS)
                items = payload.get("data", {}).get("memes", []) or []
                if items:
                    self._cache["items"] = items
                    self._cache["ts"] = now
            except Exception as exc:
                print(f"[meme-search] No se pudo refrescar el catálogo: {exc}")
        return list(self._cache["items"])


class ArcticShiftRedditCatalog:
    """Busca posts con imagen en subreddits de memes via Arctic Shift.

    Reddit directo (reddit.com JSON) responde 403 a este tipo de cliente,
    así que usamos su archivo público Arctic Shift (sin clave de API), con
    búsqueda por título por subreddit.
    OJO: Arctic Shift rechaza (400/422) la keyword-search en subreddits
    demasiado activos (r/memes); los que fallen se saltan solos.
    """

    BASE = "https://arctic-shift.photon-reddit.com/api/posts/search"

    def __init__(self, subs: tuple[str, ...], random_terms: tuple[str, ...], cache_ttl: int):
        self._subs = subs
        self._random_terms = random_terms
        self._ttl = cache_ttl
        self._cache: dict[str, dict] = {}

    def items_for(self, term: str) -> list[dict]:
        """Posts {name, image} del término (o muestra aleatoria si no hay)."""
        now = time.time()
        entry = self._cache.get(term)
        if entry and now - entry["ts"] < (60 if not entry["items"] else self._ttl):
            return list(entry["items"])

        queries = [term] if term else random.sample(self._random_terms, k=3)
        items: list[dict] = []
        for query in queries:
            for sub in self._subs:
                posts = self._fetch_sub(sub, query, 30)
                time.sleep(0.3)  # pacing anti-429
                if posts is None:  # rate-limited: no insistir con los demás subs
                    break
                if posts:
                    items.extend(p for p in posts if p not in items)
            if items:
                break

        self._cache[term] = {"items": items, "ts": now}
        if len(self._cache) > 40:
            self._cache.clear()
        return list(items)

    def _fetch_sub(self, sub: str, term: str, limit: int) -> list[dict] | None:
        """Posts con imagen de un subreddit (por título si hay término).

        Devuelve [] si el sub respondió sin resultados (400/422) y None si la
        API nos rate-limitó (429) para cortar el bucle de subs.
        """
        params = {"subreddit": sub, "limit": limit, "sort_type": "created_utc", "sort": "desc"}
        if term:
            params["title"] = term
        url = self.BASE + "?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers=_REDDIT_HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            if exc.code == 429:
                print(f"[meme-search-reddit] Arctic Shift rate-limit (429) en r/{sub}")
                return None  # las siguientes peticiones también lo serán: cortar
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
