"""Dominio de usuarios: validación + hashing scrypt (PURO, sin I/O).

Las reglas viven aquí para poder testearlas sin SQLite ni FastAPI. Los
adaptadores (SQLite/hashers alternativos) dependen del output de estas
funciones, nunca al revés.
"""
from __future__ import annotations

import hashlib
import secrets
from dataclasses import dataclass

# El nombre debe empezar/terminar por letra/numero y contener [letras, numeros,
# punto, guion, guion bajo], entre 3 y 24 caracteres (sin espacios).
_USERNAME_RE = None  # compilado en _ensure_re para tests monequillos


def _ensure_re():
    global _USERNAME_RE
    if _USERNAME_RE is None:
        import re

        _USERNAME_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_.-]{1,22}[a-zA-Z0-9]$")
    return _USERNAME_RE


@dataclass
class User:
    """Cuenta de usuario (sin datos sensibles; el hash va aparte)."""

    id: int
    username: str
    password_hash: str


class UsernameTaken(Exception):
    """Unicidad violada (case-insensitive)."""


def validate_credentials(username: str, password: str) -> str | None:
    """Devuelve el motivo de rechazo (None = credenciales aceptables)."""
    if not _ensure_re().match(username or ""):
        return (
            "El nombre debe tener 3-24 caracteres (letras, numeros, punto, "
            "guion o guion bajo) y empezar/terminar con letra o numero."
        )
    if len(password or "") < 8 or " " in password:
        return "La contrasena debe tener al menos 8 caracteres y no contener espacios."
    if len(password) > 200:
        return "La contrasena es demasiado larga (max 200 caracteres)."
    return None


def hash_password(password: str) -> str:
    """scrypt (N=16384, r=8, p=1) con sal aleatoria; formato self-descripto."""
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"), salt=salt,
        n=2 ** 14, r=8, p=1, dklen=32, maxmem=64 * 1024 * 1024,
    )
    return f"scrypt$16384$8$1${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """Verifica la contrasena contra el hash almacenado (tiempo constante)."""
    try:
        algo, n, r, p, salt_hex, digest_hex = stored.split("$")
        if algo != "scrypt":
            return False
        digest = hashlib.scrypt(
            password.encode("utf-8"), salt=bytes.fromhex(salt_hex),
            n=int(n), r=int(r), p=int(p),
            dklen=len(bytes.fromhex(digest_hex)), maxmem=64 * 1024 * 1024,
        )
        return secrets.compare_digest(digest.hex(), digest_hex)
    except Exception:
        return False
