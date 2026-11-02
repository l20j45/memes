"""Router de cuentas: /api/auth/{me,register,login,logout}."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel

from memestudio.adapters.account_sqlite import InitializationError
from memestudio.app.auth_support import (
    SESSION_COOKIE,
    clear_session_cookie,
    client_ip,
    set_session_cookie,
)
from memestudio.app.rate_limit import RateLimitExceeded
from memestudio.domain.users import (
    UsernameTaken,
    hash_password,
    validate_credentials,
    verify_password,
)


class AuthIn(BaseModel):
    username: str = ""
    password: str = ""


def build_auth_router(users, sessions, settings, rate_limiter, db_ready) -> APIRouter:
    router = APIRouter()

    @router.get("/api/auth/me")
    def me(request: Request) -> dict:
        """Estado de la sesión para la UI: usuario actual o None, si el
        servidor exige login y si el registro está abierto."""
        user = (
            request.state.user
            if hasattr(request.state, "user")
            else (sessions.username_for_token(request.cookies.get(SESSION_COOKIE) or "") or "")
        )
        return {
            "user": user or None,
            "auth_required": settings.require_login and db_ready(),
            "registration_open": settings.registration_open,
        }

    @router.post("/api/auth/register", status_code=201)
    def register(body: AuthIn, request: Request, response: Response) -> dict:
        if not (db_ready() and settings.registration_open):
            raise HTTPException(status_code=403, detail="El registro de cuentas nuevas esta desactivado en este servidor.")
        try:
            rate_limiter.check(f"reg:{client_ip(request)}", 5, 300)
        except RateLimitExceeded as exc:
            raise HTTPException(status_code=429, detail=str(exc))
        reason = validate_credentials(body.username, body.password)
        if reason:
            raise HTTPException(status_code=400, detail=reason)
        try:
            user_id = users.create(body.username, hash_password(body.password))
        except UsernameTaken:
            raise HTTPException(status_code=409, detail="Ese nombre de usuario ya esta en uso.")
        token = sessions.create(user_id, settings.session_days)
        set_session_cookie(response, token, settings)
        return {"user": body.username}

    @router.post("/api/auth/login")
    def login(body: AuthIn, request: Request, response: Response) -> dict:
        if not db_ready():
            raise HTTPException(status_code=503, detail="La BD de cuentas no esta disponible en este servidor.")
        try:
            rate_limiter.check(f"login:{client_ip(request)}", 10, 300)
        except RateLimitExceeded as exc:
            raise HTTPException(status_code=429, detail=str(exc))
        account = users.find_by_username(body.username or "")
        if not account or not verify_password(body.password or "", account.password_hash):
            raise HTTPException(status_code=401, detail="Usuario o contrasena incorrectos.")
        token = sessions.create(account.id, settings.session_days)
        set_session_cookie(response, token, settings)
        return {"user": body.username}

    @router.post("/api/auth/logout")
    def logout(response: Response) -> dict:
        clear_session_cookie(response)
        return {"ok": True}

    return router
