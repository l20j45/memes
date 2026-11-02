"""PUERTOS (ports & adapters): contratos del dominio con el exterior.

Cada puerto abstracto define lo mínimo que el caso de uso necesita; los
adaptadores concretos viven en adapters/ y se inyectan desde app/.
"""
from __future__ import annotations

from typing import Protocol

from memestudio.domain.users import User


class SessionStore(Protocol):
    """Sesiones de login: tokens aleatorios guardados solo como hash."""

    def create(self, user_id: int, ttl_days: int) -> str:
        """Crea una sesion y devuelve el token crudo (para la cookie)."""
        ...

    def username_for_token(self, token: str) -> str | None:
        """Usuario dueño del token, o None si no existe/ha caducado."""
        ...


class UserRepository(Protocol):
    """Cuentas persistentes (contraseñas ya hasheadas por el dominio)."""

    def create(self, username: str, password_hash: str) -> int:
        """Crea la cuenta y devuelve su id; lanza UsernameTaken si existe."""
        ...

    def find_by_username(self, username: str) -> User | None:
        """Busca por nombre (case-insensitive) para el login."""
        ...


class DraftStore(Protocol):
    """Un borrador remoto de sincronizacion por usuario (JSON)."""

    def save(self, slug: str, data: bytes) -> int:
        """Guarda el borrador y devuelve el tamaño escrito."""
        ...

    def load(self, slug: str) -> bytes | None:
        """Devuelve los bytes del borrador, o None si no existe."""
        ...


class BackgroundMasker(Protocol):
    """Segmetación con IA: RGBA -> RGBA con el sujeto y el resto transparente."""

    def mask(self, image):  # PIL.Image en entrada y salida
        """Aplica el modelo; puede tardar segundos (CPU)."""
        ...

    def prewarm(self) -> None:
        """Carga el modelo en segundo plano (descarga inicial de pesos)."""
        ...
