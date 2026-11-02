"""Router de borradores remotos: /api/draft (subir/traer sincronización)."""
from __future__ import annotations

import json
import time

from fastapi import APIRouter, HTTPException, Request, Response

from memestudio.domain.drafts import draft_slug


def build_draft_router(drafts, settings) -> APIRouter:
    router = APIRouter()

    @router.post("/api/draft")
    async def draft_upload(request: Request) -> dict:
        user = getattr(request.state, "user", "") or "local"
        length = int(request.headers.get("content-length") or 0)
        if length > settings.draft_max_mb * 1024 * 1024:
            raise HTTPException(status_code=413, detail=f"Borrador demasiado grande (max {settings.draft_max_mb} MB)")
        raw = await request.body()
        try:
            json.loads(raw.decode("utf-8"))
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Borrador invalido (no es JSON): {exc}")
        written = drafts.save(draft_slug(user), raw)
        return {"ok": True, "user": user, "bytes": written, "saved_at": round(time.time(), 3)}

    @router.get("/api/draft")
    def draft_download(request: Request) -> Response:
        user = getattr(request.state, "user", "") or "local"
        path = drafts.path(draft_slug(user))
        data = drafts.load(draft_slug(user))
        if data is None:
            raise HTTPException(status_code=404, detail="Este usuario todavía no tiene borrador guardado en el servidor")
        return Response(
            content=data,
            media_type="application/json",
            headers={"X-Saved-At": str(int(path.stat().st_mtime))},
        )

    return router
