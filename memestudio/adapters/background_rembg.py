"""Adaptador de rembg (segmentación U2-Net local vía CitizenFX/onnxruntime).

La sesión del modelo se crea de forma diferida en la primera petición porque
la creación es costosa y descarga los pesos (~176 MB) a ~/.u2net si no
existen: diferirla evita bloquear el arranque si no hay red.
"""
from __future__ import annotations

import threading


class RembgBackgroundMasker:
    """BackgroundMasker sobre rembg.remove() (bloqueante en CPU)."""

    def __init__(self, model: str):
        self._model = model
        self._session = None  # None = sin inicializar; False = intento fallido
        self._lock = threading.Lock()

    def mask(self, rgba):
        from rembg import remove

        session = self._get_session()
        return remove(rgba, session=session) if session else remove(rgba)

    def prewarm(self) -> None:
        self._get_session()

    def _get_session(self):
        # Doble check con lock: un solo hilo paga la descarga/carga del modelo.
        with self._lock:
            if self._session is None:
                try:
                    from rembg import new_session

                    self._session = new_session(self._model)
                except Exception as exc:
                    print(f"[remove-bg] No se pudo crear la sesion '{self._model}' ({exc}); usando modelo por defecto")
                    self._session = False
            return self._session or None
