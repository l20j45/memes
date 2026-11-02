"""Router de imágenes IA: /api/remove-bg (endpoint pesado con semáforo CPU)."""
from __future__ import annotations

import io
import threading

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

from memestudio.domain.image_ops import extract_subject


def build_image_router(masker, settings) -> APIRouter:
    router = APIRouter()
    # Un slot por inferencia: hasta max a la vez y 429 para las demás en vez
    # de encolar hasta saturar CPU/RAM (un modelo U2-Net en CPU por slot).
    removal_slots = threading.BoundedSemaphore(max(1, settings.max_removal_concurrency))

    @router.post("/api/remove-bg")
    def remove_bg(image: UploadFile = File(...)) -> StreamingResponse:
        if not image.filename:
            raise HTTPException(status_code=400, detail="No image file provided")

        if not removal_slots.acquire(blocking=False):
            raise HTTPException(
                status_code=429,
                detail=f"Servidor ocupado (max {settings.max_removal_concurrency} inferencias en paralelo); reintenta en unos segundos",
            )
        try:
            try:
                content = image.file.read(settings.max_upload_mb * 1024 * 1024 + 1)
                if len(content) > settings.max_upload_mb * 1024 * 1024:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Imagen demasiado grande (max {settings.max_upload_mb} MB)",
                    )
                with Image.open(io.BytesIO(content)) as img:
                    rgba = img.convert("RGBA")
                    cropped, crop = extract_subject(rgba, masker)
                    output = io.BytesIO()
                    cropped.save(output, format="PNG")
                    output.seek(0)
                    return StreamingResponse(
                        output,
                        media_type="image/png",
                        headers={"X-Crop-Box": crop.header_value()},
                    )
            except HTTPException:
                raise  # errores propios (413, ...): no convertirlos en 500
            except Exception as exc:  # pragma: no cover - defensive path
                raise HTTPException(status_code=500, detail=f"Error processing image: {exc}")
        finally:
            removal_slots.release()

    return router
