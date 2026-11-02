"""Soporte de autenticación para la capa HTTP (cookies, Basic Auth, CSRF).

Reglas de activación:
- AUTH_USERS (Basic Auth): privado; el middleware rechaza todo salvo /health
  y /favicon.png usando el diálogo nativo del navegador.
- REQUIRE_LOGIN=1 (cuentas): solo se protege /api/* (los estáticos quedan
  abiertos para poder renderizar el formulario de login); la sesión viaja
  en una cookie HttpOnly.
- Sin ninguno: app abierta (uso LAN; los drafts van al usuario "local").
"""
from __future__ import annotations

import base64
import secrets

import urllib.parse
from fastapi import HTTPException, Request, Response

from memestudio.config import Settings
from memestudio.ports import SessionStore

SESSION_COOKIE = "memestudio_session"
WWW_AUTH = {"WWW-Authenticate": 'Basic realm="Meme Studio Pro"'}


def session_user(request: Request, sessions: SessionStore) -> str:
    """Usuario dueño de la cookie de sesión ('' si no hay sesión válida)."""
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return ""
    return sessions.username_for_token(token) or ""


def set_session_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        SESSION_COOKIE, token,
        max_age=max(1, settings.session_days) * 86400,
        httponly=True, samesite="lax", secure=settings.secure_cookies, path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/")


def ensure_same_origin(request: Request) -> None:
    """Mitiga CSRF en peticiones con cookie: el Origin (si viene) debe apuntar
    al propio servidor. Con SameSite=Lax cubre a los navegadores modernos; esto
    lo refuerza para clientes que aún lo permitan.
    """
    origin = request.headers.get("origin") or ""
    if not origin:
        return  # clientes sin Origin (curl, WebView file://): la sesión válida manda
    try:
        origin_host = urllib.parse.urlparse(origin).hostname or ""
        host_host = urllib.parse.urlparse(f"//{request.headers.get('host', '')}").hostname or ""
    except ValueError:
        origin_host, host_host = "?", "?"
    if origin == "null" or (origin_host and host_host and origin_host != host_host):
        raise HTTPException(status_code=403, detail="Origen no permitido (CSRF)")


def check_basic_auth(header: str | None, auth_users: dict) -> str:
    """Devuelve el usuario autenticado por header Basic, o lanza 401."""
    if not auth_users:
        return ""
    if not header or not header.lower().startswith("basic "):
        raise HTTPException(status_code=401, detail="Login requerido", headers=WWW_AUTH)
    try:
        user, _, pw = base64.b64decode(header.split(" ", 1)[1]).decode("utf-8").partition(":")
    except Exception:
        raise HTTPException(status_code=401, detail="Login invalido", headers=WWW_AUTH)
    expected = auth_users.get(user)
    if expected and secrets.compare_digest(expected, pw):
        return user
    raise HTTPException(status_code=401, detail="Usuario o contrasena incorrectos", headers=WWW_AUTH)


def client_ip(request: Request) -> str:
    client = request.client
    return client.host if client else "desconocida"
