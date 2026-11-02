# Meme Studio Pro — imagen única multi-arquitectura (x86/x64 y ARM/v8).
# Construye igual en un PC o en una Raspberry Pi 4/5 (Raspberry Pi OS 64-bit):
#   docker build -t memestudio .
#   docker run --rm -p 5005:5005 memestudio
#
# La selección del modelo rembg es automática (u2netp en ARM, u2net en x86)
# o se fuerza con REMBG_MODEL (ver docker-compose.yml).
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dependencias primero para aprovechar la caché de capas de Docker
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Frontend + backend (StaticFiles monta /app completo)
COPY server.py memegnerator.html app.mjs styles.css favicon.png manifest.json sw.js icon-192.png icon-512.png apple-touch-icon.png ./
COPY web ./web/
COPY memestudio ./memestudio/

# Puerto interno del servidor (uvicorn ya escucha en 0.0.0.0)
EXPOSE 5005

CMD ["python", "server.py"]
