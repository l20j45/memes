"""Dominio de borradores: reglas puras de sincronización movil <-> PC.

Un borrador remoto es UN archivo JSON por usuario (imagen totales en dataURL,
capas, posiciones y ajustes del editor). El slug saneado del usuario define
el nombre del fichero y NUNCA se debe construir desde el username crudo.
"""
from __future__ import annotations

import re


def draft_slug(user: str) -> str:
    """Username -> nombre de archivo seguro: 'Ana<3' -> 'ana_3'."""
    return re.sub(r"[^a-z0-9_.-]+", "_", (user or "local").lower())
