"""Routers de catálogos de memes: /api/meme-search, /api/meme-search-reddit
y el proxy de imágenes /api/meme-image."""
from __future__ import annotations

import random
import urllib.parse

from fastapi import APIRouter, HTTPException, Response

from memestudio.adapters.image_proxy import ImageProxy, WrongImageSource
from memestudio.domain.text_match import match_score, normalize


def build_imgflip_router(catalog, proxy: ImageProxy, limit_default: int = 24) -> APIRouter:
    router = APIRouter()

    @router.get("/api/meme-search")
    def meme_search(q: str = "", limit: int = limit_default) -> dict:
        """Busca plantillas virales en el top-100 de Imgflip con matching difuso.

        Imgflip solo publica 100 memes publicos (no existe endpoint de busqueda),
        pero normalizar acentos y tolerar tipeos cubre casi todas las busquedas
        reales. Sin termino devuelve una muestra aleatoria.
        """
        items = catalog.top_items()
        if not items:
            raise HTTPException(status_code=503, detail="Catalogo de memes no disponible")

        term = normalize(q or "")
        if not term:
            chosen = random.sample(items, k=min(len(items), max(1, min(limit, 24))))
        else:
            scored = [(score, item) for item in items
                      if (score := match_score(term, normalize(item.get("name", "")))) >= 30.0]
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

    @router.get("/api/meme-image")
    def meme_image(src: str) -> Response:
        try:
            proxy.check_allowed(src)
            data = proxy.fetch(src)
        except WrongImageSource as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        return Response(content=data, media_type=proxy.media_type(data))

    return router


def build_reddit_router(reddit, limit_default: int = 24) -> APIRouter:
    router = APIRouter()

    @router.get("/api/meme-search-reddit")
    def meme_search_reddit(q: str = "", limit: int = limit_default) -> dict:
        """Busca memes publicados en Reddit (subreddits de memes).

        Fuente: archivo público de Reddit (Arctic Shift) consultado por el
        backend (sin clave de API y sin depender de que la red tenga acceso a
        reddit.com). Con término busca el término en el título de los posts
        de cada subreddit de memes; sin término devuelve una muestra
        aleatoria de memes populares.
        """
        term = normalize(q or "")
        items = reddit.items_for(term)
        if not items:
            raise HTTPException(status_code=503, detail="Busqueda en Reddit no disponible")

        if term:
            scored = [
                (score, item) for item in items
                if (score := match_score(term, normalize(item["name"]))) >= 20.0
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

    return router
