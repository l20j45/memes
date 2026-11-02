"""Configuración central (.env opcional + variables de entorno).

Precedencia: variable de entorno real > .env > valor por defecto.
Todas las claves están documentadas en .env.example (cópialo a .env para
personalizar); Docker las inyecta vía docker-compose.yml.
"""
from __future__ import annotations

import os
import platform
from dataclasses import dataclass, field
from pathlib import Path


def _load_dotenv() -> None:
    """Lee KEY=VAL de un .env en la raíz del proyecto (sin dependencias)."""
    env_file = Path(__file__).resolve().parent.parent / ".env"
    if not env_file.is_file():
        return
    for raw in env_file.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and value is not None:
            os.environ.setdefault(key, value)


def _truthy(raw: str | None) -> bool:
    return (raw or "").strip().lower() in ("1", "true", "yes", "si", "sí")


def _parse_auth_users(raw: str) -> dict:
    """AUTH_USERS=usuario:pass,otro:pass2 -> {usuario: pass, ...}."""
    users = {}
    for pair in (raw or "").split(","):
        user, _, pw = pair.partition(":")
        if user.strip() and pw:
            users[user.strip()] = pw
    return users


@dataclass
class Settings:
    """Configuración inmutable de la aplicación (una instancia por proceso)."""

    # Ruta de la raíz del proyecto (para sirver el frontend y ficheros local)
    root: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent)

    # Servidor HTTP local; en Docker el contenedor SIEMPRE escucha en 0.0.0.0:5005
    host: str = "0.0.0.0"
    port: int = 5005

    # Orígenes CORS admitidos, separados por comas ("*" por defecto)
    cors_origins: list[str] = field(default_factory=lambda: ["*"])

    # Modelo de rembg: u2netp (ARM, ~4.7 MB) o u2net (x86, ~176 MB). Vacío
    # automático, override con REMBG_MODEL (ver .env.example).
    rembg_model: str = ""

    # Caché del catálogo/búsqueda de memes (segundos) y tamaño del proxy
    meme_cache_ttl: int = 300
    img_cache_max: int = 120

    # Protecciones de /api/remove-bg (inferencia CPU)
    max_upload_mb: int = 10
    max_removal_concurrency: int = 2
    prewarm_model: bool = False

    # Borradores remotos (sincronización móvil <-> PC)
    draft_dir: Path = field(default_factory=lambda: Path("drafts"))
    draft_max_mb: int = 25

    # Basic Auth clásico (AUTH_USERS). Privando: es el modo de ANTES; tiene
    # prioridad sobre el login con cuentas para no romper despliegues legados.
    auth_users: dict = field(default_factory=dict)

    # Login con cuentas (registro en la UI; ver .env.example relacionadas)
    require_login: bool = False
    registration_open: bool = True
    session_days: int = 30
    auth_db_path: Path = field(default_factory=lambda: Path("data") / "memestudio.db")
    secure_cookies: bool = False

    # Comodines para el middleware de autenticación (no configurar aquí:
    # derivados de require_login/auth_users en el arranque)
    auth_exempt: tuple = ("/health", "/favicon.png")
    auth_exempt_api: str = "/api/auth/"  # prefijo sin sesion (login/registro)


def load_settings() -> Settings:
    """Construye Settings leyendo (.env + variables de entorno)."""
    _load_dotenv()

    is_arm = platform.machine().lower() in ("aarch64", "armv7l", "armv6l")
    root = Path(__file__).resolve().parent.parent

    model = os.environ.get("REMBG_MODEL") or ("u2netp" if is_arm else "u2net")
    cors = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()] or ["*"]

    return Settings(
        root=root,
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", "5005")),
        cors_origins=cors,
        rembg_model=model,
        meme_cache_ttl=int(os.environ.get("MEME_CACHE_TTL", "300")),
        img_cache_max=int(os.environ.get("IMG_CACHE_MAX", "120")),
        max_upload_mb=int(os.environ.get("MAX_UPLOAD_MB", "10")),
        max_removal_concurrency=int(os.environ.get("MAX_REMOVAL_CONCURRENCY", "2")),
        prewarm_model=_truthy(os.environ.get("PREWARM_MODEL")),
        draft_dir=Path(os.environ.get("DRAFT_DIR") or (root / "drafts")),
        draft_max_mb=int(os.environ.get("DRAFT_MAX_MB", "25")),
        auth_users=_parse_auth_users(os.environ.get("AUTH_USERS", "")),
        require_login=_truthy(os.environ.get("REQUIRE_LOGIN")),
        registration_open=os.environ.get("REGISTRATION_OPEN", "1").lower() not in ("0", "false", "no"),
        session_days=int(os.environ.get("SESSION_DAYS", "30")),
        auth_db_path=Path(os.environ.get("AUTH_DB") or (root / "data" / "memestudio.db")),
        secure_cookies=_truthy(os.environ.get("PUBLIC_HTTPS")),
    )
