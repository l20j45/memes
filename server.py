from __future__ import annotations

import io
import os
import platform
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from rembg import remove

# Seleccion de modelo de rembg:
# - ARM (Raspberry Pi, Jetson, etc.): "u2netp" (ligero, ~4.7 MB, 4-6x mas
#   rapido en CPU ARM; calidad ligeramente menor, suficiente para memes).
# - x86/x64 (PC): "u2net" completo (~176 MB, mejor calidad).
# - Se puede forzar cualquier modelo con la variable de entorno REMBG_MODEL
#   (valores validos: u2net, u2netp, isnet-general-use, birefnet-general, ...).
_IS_ARM = platform.machine().lower() in ("aarch64", "armv7l", "armv6l")
_REMBG_MODEL = os.environ.get("REMBG_MODEL") or ("u2netp" if _IS_ARM else "u2net")

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

    try:
        content = image.file.read()
        with Image.open(io.BytesIO(content)) as img:
            rgba = img.convert("RGBA")
            session = _get_rembg_session()
            result = remove(rgba, session=session) if session else remove(rgba)
            output = io.BytesIO()
            result.save(output, format="PNG")
            output.seek(0)
            return StreamingResponse(output, media_type="image/png")
    except Exception as exc:  # pragma: no cover - defensive path
        raise HTTPException(status_code=500, detail=f"Error processing image: {exc}")


@app.get("/")
def index() -> FileResponse:
    html_file = static_dir / "memegnerator.html"
    if not html_file.is_file():
        html_file = static_dir / "index.html"
    return FileResponse(html_file)


# Servir archivos estáticos del frontend (app.mjs, styles.css, etc.)
app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5005"))
    import uvicorn

    print(f"\n==========================================")
    print(f"  Meme Studio Pro iniciando...")
    print(f"  Modelo rembg: {_REMBG_MODEL}{' (ARM)' if _IS_ARM else ''}")
    print(f"  Abre en tu navegador: http://localhost:{port}")
    print(f"==========================================\n")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
