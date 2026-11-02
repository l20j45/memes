"""Adaptador HTTP: proxy/caché de imágenes de memes servidas desde nuestro origen.

Sirve la imagen (i.imgflip.com, redd.it, ...) desde este mismo servidor para que
el canvas del navegador nunca se contamine (tainted) y la exportación funcione
incluso si el CDN bloquea CORS.
"""
from __future__ import annotations

import io
import urllib.parse
import urllib.request

from PIL import Image

_HEADERS = {
    "User-Agent": "MemeStudioPro/1.0 (meme editor; +https://localhost:5005)",
    "Accept": "*/*",
}

# Dominios desde los que /api/meme-image acepta servir imágenes (evita usar el
# proxy como foso abierto hacia cualquier URL).
ALLOWED_IMAGE_HOSTS = ("imgflip.com", "redd.it", "redditmedia.com", "imgur.com")

_MEDIA_TYPES = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "GIF": "image/gif",
    "WEBP": "image/webp",
}


class WrongImageSource(Exception):
    """La URL pedida no es de un host permitido."""


class ImageProxy:
    """Caché simple en memoria (se vacía por completo al superar el máximo)."""

    def __init__(self, cache_max: int):
        self._cache_max = cache_max
        self._cache: dict[str, bytes] = {}

    def check_allowed(self, src: str) -> None:
        parsed = urllib.parse.urlparse(src)
        host = parsed.hostname or ""
        if parsed.scheme not in ("http", "https") or not host or not host.endswith(ALLOWED_IMAGE_HOSTS):
            raise WrongImageSource("Solo se permiten imagenes de imgflip/reddit/imgur")

    def fetch(self, src: str) -> bytes:
        data = self._cache.get(src)
        if data is None:
            req = urllib.request.Request(src, headers=_HEADERS)
            with urllib.request.urlopen(req, timeout=15) as response:
                data = response.read()
            if len(self._cache) > self._cache_max:
                self._cache.clear()
            self._cache[src] = data
        return data

    @staticmethod
    def media_type(data: bytes) -> str:
        with Image.open(io.BytesIO(data)) as probe:
            fmt = (probe.format or "PNG").upper()
        return _MEDIA_TYPES.get(fmt, "application/octet-stream")
