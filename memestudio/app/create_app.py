"""Fábrica de la aplicación FastAPI (wiring hexagonal completo).

Construye adaptadores concretos, los inyecta en el dominio/routers y declara
los middlewares. server.py solo llama a create_app(load_settings()).
"""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from memestudio.adapters.account_sqlite import (
    InitializationError,
    SqliteAccountRepository,
    SqliteSessionStore,
)
from memestudio.adapters.background_rembg import RembgBackgroundMasker
from memestudio.adapters.draft_fs import FileDraftStore
from memestudio.adapters.image_proxy import ImageProxy
from memestudio.adapters.meme_catalogs import ArcticShiftRedditCatalog, ImgflipCatalog
from memestudio.app.auth_support import check_basic_auth, ensure_same_origin, session_user
from memestudio.app.rate_limit import RateLimiter
from memestudio.config import Settings
from memestudio.app.routers.auth import build_auth_router
from memestudio.app.routers.drafts import build_draft_router
from memestudio.app.routers.images import build_image_router
from memestudio.app.routers.memes import build_imgflip_router, build_reddit_router

_REDDIT_SUBS_DEFAULT = ("dankmemes,me_ira,wholesomememes,photoshopbattles,AdviceAnimals")
_REDDIT_TERMS_DEFAULT = "drake,cat,dog,anime,gaming,monday,office,sad,happy,work,school,food"


def _env_tuple(name: str, default: str) -> tuple[str, ...]:
    import os

    raw = os.environ.get(name, default)
    return tuple(s.strip() for s in raw.split(",") if s.strip())


def create_app(settings: Settings) -> FastAPI:
    """Devuelve la app FastAPI lista para servir (configuración inyectada)."""
    # --- Adaptadores (implementaciones de los puertos) ------------------------
    accounts = SqliteAccountRepository(settings.auth_db_path)
    sessions = SqliteSessionStore(settings.auth_db_path)
    db_error: list[str] = []
    try:
        accounts.init_schema()
    except InitializationError as exc:
        db_error.append(str(exc))
        print(f"[auth] No se pudo inicializar la BD de cuentas ({exc}); REQUIRE_LOGIN quedara inactivo")

    db_ready = lambda: not db_error  # noqa: E731 (cierre pequeño y local)

    drafts = FileDraftStore(settings.draft_dir)
    masker = RembgBackgroundMasker(settings.rembg_model)
    proxy = ImageProxy(settings.img_cache_max)
    imgflip = ImgflipCatalog(settings.meme_cache_ttl)
    reddit = ArcticShiftRedditCatalog(
        subs=_env_tuple("REDDIT_SUBS", _REDDIT_SUBS_DEFAULT),
        random_terms=_env_tuple("REDDIT_TERMS", _REDDIT_TERMS_DEFAULT),
        cache_ttl=settings.meme_cache_ttl,
    )
    limiter = RateLimiter()

    app = FastAPI(title="Meme Studio Pro")

    # Puerta de entrada: Basic Auth (legado) o sesiones por cookie (cuentas).
    # Declarada ANTES del CORS middleware para que las respuestas 401 salgan
    # con cabeceras CORS y el navegador no las confunda con fallos de red.
    @app.middleware("http")
    async def auth_gate(request: Request, call_next):
        path = request.url.path
        if request.method != "OPTIONS":
            if settings.auth_users and path not in settings.auth_exempt:
                try:
                    request.state.user = check_basic_auth(request.headers.get("authorization"), settings.auth_users)
                except Exception as exc:
                    headers = getattr(exc, "headers", None)
                    detail = getattr(exc, "detail", "Login requerido")
                    status = getattr(exc, "status_code", 401)
                    return JSONResponse(status_code=status, content={"detail": detail}, headers=headers)
            elif settings.require_login and db_ready():
                request.state.user = session_user(request, sessions) or ""
                needs_auth = path.startswith("/api/")
                if needs_auth:
                    if path.startswith(settings.auth_exempt_api):
                        if request.method in ("POST", "PUT", "DELETE", "PATCH"):
                            try:
                                ensure_same_origin(request)
                            except Exception as exc:
                                return JSONResponse(
                                    status_code=getattr(exc, "status_code", 403),
                                    content={"detail": getattr(exc, "detail", "CSRF")},
                                )
                    else:
                        if not request.state.user:
                            return JSONResponse(status_code=401, content={"detail": "login_required"})
                        if request.method in ("POST", "PUT", "DELETE", "PATCH"):
                            try:
                                ensure_same_origin(request)
                            except Exception as exc:
                                return JSONResponse(
                                    status_code=getattr(exc, "status_code", 403),
                                    content={"detail": getattr(exc, "detail", "CSRF")},
                                )
        return await call_next(request)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    static_dir = settings.frontend_dir

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    @app.get("/")
    def index() -> FileResponse:
        html_file = static_dir / "memegnerator.html"
        if not html_file.is_file():
            html_file = static_dir / "index.html"
        return FileResponse(html_file)

    app.include_router(build_auth_router(accounts, sessions, settings, limiter, db_ready))
    app.include_router(build_image_router(masker, settings))
    app.include_router(build_imgflip_router(imgflip, proxy))
    app.include_router(build_reddit_router(reddit))
    app.include_router(build_draft_router(drafts, settings))

    app.state.prewarm_masker = masker  # para el prewarm del entrypoint (server.py)
    app.state.db_ready = db_ready
    app.state.static_dir = static_dir
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
    return app
