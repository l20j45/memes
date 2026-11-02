"""Adaptador SQLite de usuarios y sesiones (hash scrypt <-> dominio).

Una conexión nueva por operación con WAL: sin estado compartido entre hilos,
seguro para llamadas concurrentes de FastAPI en threadpool.
"""
from __future__ import annotations

import hashlib
import secrets
import sqlite3
import time

from memestudio.domain.users import User, UsernameTaken

_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at REAL NOT NULL,
    expires_at REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_nc ON users(username COLLATE NOCASE);
"""


class InitializationError(Exception):
    """No se pudo abrir/crear la BD (problema de disco, permisos...)."""


def _connect(path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(path, timeout=10)
    con.execute("PRAGMA journal_mode=WAL")
    return con


class SqliteAccountRepository:
    """UserRepository sobre SQLite."""

    def __init__(self, db_path):
        self._path = db_path

    def init_schema(self) -> None:
        try:
            with _connect(self._path) as con:
                con.executescript(_SCHEMA)
        except Exception as exc:
            raise InitializationError(str(exc)) from exc

    def create(self, username: str, password_hash: str) -> int:
        with _connect(self._path) as con:
            try:
                cursor = con.execute(
                    "INSERT INTO users(username, password_hash, created_at) VALUES (?, ?, ?)",
                    (username, password_hash, time.time()),
                )
                return int(cursor.lastrowid or 0)
            except sqlite3.IntegrityError as exc:
                raise UsernameTaken(username) from exc

    def find_by_username(self, username: str) -> User | None:
        with _connect(self._path) as con:
            row = con.execute(
                "SELECT id, username, password_hash FROM users WHERE username = ? COLLATE NOCASE",
                (username,),
            ).fetchone()
        if not row:
            return None
        return User(id=row[0], username=row[1], password_hash=row[2])


class SqliteSessionStore:
    """SessionStore sobre SQLite: solo se guardan hashes del token."""

    def __init__(self, db_path):
        self._path = db_path

    def create(self, user_id: int, ttl_days: int) -> str:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        now = time.time()
        with _connect(self._path) as con:
            con.execute("DELETE FROM sessions WHERE expires_at < ?", (now,))
            con.execute(
                "INSERT INTO sessions(token_hash, user_id, created_at, expires_at) "
                "VALUES (?, ?, ?, ?)",
                (token_hash, user_id, now, now + ttl_days * 86400),
            )
        return token

    def username_for_token(self, token: str) -> str | None:
        if not token:
            return None
        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        with _connect(self._path) as con:
            row = con.execute(
                "SELECT u.username, s.expires_at FROM sessions s "
                "JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?",
                (token_hash,),
            ).fetchone()
        if not row or not row[1] or row[1] < time.time():
            return None
        return str(row[0])
