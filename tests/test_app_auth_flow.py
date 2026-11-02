"""Tests del flujo HTTP de autenticación (TestClient con BD en tmp)."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from memestudio.app.create_app import create_app
from memestudio.config import Settings

# El index se sirve desde public/ (frontend_dir de Settings); la BD y drafts
# sí a tmp (aislados por test).
REPO_ROOT = Settings().root


def _settings(tmp_path, **kw) -> Settings:
    base = dict(
        root=REPO_ROOT,
        draft_dir=tmp_path / "drafts",
        auth_db_path=tmp_path / "data" / "memestudio.db",
        cors_origins=["*"],
        **kw,
    )
    return Settings(**base)


def _client(tmp_path, **kw):
    return TestClient(create_app(_settings(tmp_path, **kw)))


def test_modo_abierto_por_defecto(tmp_path):
    c = _client(tmp_path)
    assert c.get("/health").status_code == 200
    assert c.get("/").status_code == 200  # estaticos y front abiertos
    me = c.get("/api/auth/me").json()
    assert me["user"] is None and me["auth_required"] is False
    # la API no pide sesion en modo abierto
    assert c.get("/api/draft").status_code == 404  # no 401: sin usuario 'local' aun


def test_require_login_bloquea_api_pero_no_estaticos(tmp_path):
    c = _client(tmp_path, require_login=True)
    assert c.get("/").status_code == 200
    assert c.get("/health").status_code == 200

    api = c.get("/api/draft")
    assert api.status_code == 401 and api.json()["detail"] == "login_required"

    me = c.get("/api/auth/me").json()
    assert me["auth_required"] is True and me["user"] is None


def test_registro_login_borrador_logout(tmp_path):
    c = _client(tmp_path, require_login=True)

    bad = c.post("/api/auth/register", json={"username": "tester", "password": "corta"})
    assert bad.status_code == 400

    ok = c.post("/api/auth/register", json={"username": "tester", "password": "superclave123"})
    assert ok.status_code == 201 and ok.json()["user"] == "tester"
    assert "memestudio_session" in c.cookies

    me = c.get("/api/auth/me").json()
    assert me["user"] == "tester"

    up = c.post("/api/draft", json={"img": "meme-test"})
    assert up.status_code == 200 and up.json()["user"] == "tester"
    assert c.get("/api/draft").json() == {"img": "meme-test"}

    assert c.post("/api/auth/logout").status_code == 200
    assert c.get("/api/draft").status_code == 401  # sesion borrada de la cookie

    relogin = c.post("/api/auth/login", json={"username": "tester", "password": "superclave123"})
    assert relogin.status_code == 200
    assert c.get("/api/draft").json() == {"img": "meme-test"}


def test_registro_duplicado_y_login_mal(tmp_path):
    c = _client(tmp_path, require_login=True)
    assert c.post("/api/auth/register", json={"username": "ana", "password": "superclave123"}).status_code == 201
    # duplicado case-insensitive
    assert c.post("/api/auth/register", json={"username": "ANA", "password": "superclave123"}).status_code == 409
    # login fallido con una sesion nueva (sin heredar cookies del registro)
    c2 = _client(tmp_path, require_login=True)
    assert c2.post("/api/auth/login", json={"username": "ana", "password": "incorrrecta"}).status_code == 401
    assert c2.get("/api/draft").status_code == 401


def test_registro_cerrado(tmp_path):
    c = _client(tmp_path, registration_open=False)
    res = c.post("/api/auth/register", json={"username": "tester", "password": "superclave123"})
    assert res.status_code == 403


def test_csrf_rechaza_origin_ajeno(tmp_path):
    c = _client(tmp_path, require_login=True)
    res = c.post(
        "/api/auth/login",
        json={"username": "tester", "password": "superclave123"},
        headers={"Origin": "http://evil.example"},
    )
    assert res.status_code == 403
