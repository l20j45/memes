"""Dominio de texto: normalización y matching difuso de memes (PURO)."""
from __future__ import annotations

import difflib
import unicodedata


def normalize(text: str) -> str:
    """Minúsculas sin acentos: 'camión' -> 'camion'."""
    lowered = unicodedata.normalize("NFKD", text.lower())
    return "".join(ch for ch in lowered if not unicodedata.combining(ch))


def match_score(query: str, name: str) -> float:
    """Puntua la similitud difusa entre la búsqueda y el nombre del meme (0-100).

    - Coincidencia exacta del término: máximo.
    - Coincidencia por palabra completa: alta.
    - Tipeo cercano (difflib >= 0.8): parcial. Devuelve 0 si no hay nada.
    """
    if query == name:
        return 100.0
    if query in name:
        return 90.0 - min(len(name) - len(query), 40) / 4  # nombres más cortos primero
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
