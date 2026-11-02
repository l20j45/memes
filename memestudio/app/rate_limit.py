"""Rate-limit simple en memoria por clave: N intentos por ventana deslizante.

Suficiente para un proceso único (uvicorn sin workers múltiples); se reinicia
con cada despliegue y no comparte estado entre instancias.
"""
from __future__ import annotations

import threading
import time

from fastapi import HTTPException


class RateLimitExceeded(Exception):
    pass


class RateLimiter:
    def __init__(self):
        self._lock = threading.Lock()
        self._buckets: dict[str, list[float]] = {}

    def check(self, key: str, limit: int, window_s: float) -> None:
        """Registra el intento o lanza RateLimitExceeded al exceder el límite."""
        now = time.time()
        with self._lock:
            bucket = [t for t in self._buckets.get(key, []) if now - t < window_s]
            if len(bucket) >= limit:
                raise RateLimitExceeded(
                    f"Demasiados intentos; espera {int(window_s / 60)} minutos y vuelve a probar."
                )
            bucket.append(now)
            self._buckets[key] = bucket
            if len(self._buckets) > 5000:  # evita crecimiento indefinido por spam de IPs
                self._buckets.clear()
