"""Meme Studio Pro — punto de entrada del backend.

La lógica vive en el paquete hexagonal memestudio/ (dominio puro en
memestudio/domain, puertos en memestudio/ports, adaptadores en
memestudio/adapters y la capa FastAPI en memestudio/app). Este módulo solo:

1. Carga Settings (.env + variables de entorno, ver .env.example).
2. Construye la app inyectando los adaptadores.
3. Presenta el banner, hace prewarm opcional del modelo y lanza uvicorn.

Ejecución local:   python server.py          -> http://localhost:5005
Docker:            docker compose up -d --build   (CMD python server.py)
"""
from __future__ import annotations

import threading

from memestudio.config import load_settings
from memestudio.app.create_app import create_app

settings = load_settings()
app = create_app(settings)


def _banner() -> None:
    if settings.auth_users:
        access = f"usuario/contrasena Basic ({len(settings.auth_users)} usuarios)"
    elif settings.require_login and app.state.db_ready():
        access = "login con cuentas (BD data/memestudio.db)"
    elif settings.require_login:
        access = "REQUIRE_LOGIN activo pero la BD fallo; cae a abierto"
    else:
        access = "abierto (REQUIRE_LOGIN=0 para desactivar; por defecto pide login)"
    print("\n==========================================")
    print("  Meme Studio Pro iniciando...")
    print(f"  Modelo rembg: {settings.rembg_model}")
    print(f"  Escuchando en: {settings.host}:{settings.port}")
    print(f"  Acceso: {access}")
    print(f"  Abre en tu navegador: http://localhost:{settings.port}")
    print("==========================================\n")


if __name__ == "__main__":
    import uvicorn

    _banner()
    if settings.prewarm_model:
        print("[remove-bg] PREWARM_MODEL activo: cargando el modelo en segundo plano...")
        threading.Thread(target=app.state.prewarm_masker.prewarm, daemon=True).start()
    uvicorn.run("server:app", host=settings.host, port=settings.port, reload=False)
