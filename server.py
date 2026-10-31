from __future__ import annotations

import io
import os

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image
from rembg import remove

app = FastAPI(title="Meme Studio Background Removal API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/remove-bg")
async def remove_bg(image: UploadFile = File(...)) -> StreamingResponse:
    if not image.filename:
        raise HTTPException(status_code=400, detail="No image file provided")

    try:
        content = await image.read()
        with Image.open(io.BytesIO(content)) as img:
            rgba = img.convert("RGBA")
            result = remove(rgba)
            output = io.BytesIO()
            result.save(output, format="PNG")
            output.seek(0)
            return StreamingResponse(output, media_type="image/png")
    except Exception as exc:  # pragma: no cover - defensive path
        raise HTTPException(status_code=500, detail=f"Error processing image: {exc}")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5005"))
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
