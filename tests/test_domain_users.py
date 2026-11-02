"""Tests del dominio de usuarios (validación + scrypt)."""
from __future__ import annotations

from memestudio.domain.users import hash_password, validate_credentials, verify_password


def test_usuario_valido_pasa():
    assert validate_credentials("daniel", "contrasenalarga") is None
    assert validate_credentials("a-b.c_1", "contrasenalarga") is None


def test_usuario_invalido():
    assert validate_credentials("ab", "contrasenalarga") is not None        # corto
    assert validate_credentials("mas_de_veinticuatro_caracteres", "contrasenalarga") is not None
    assert validate_credentials("-rustico-", "contrasenalarga") is not None  # borde con guion
    assert validate_credentials("", "contrasenalarga") is not None
    assert validate_credentials("daniel ruiz", "contrasenalarga") is not None


def test_password_invalido():
    assert validate_credentials("daniel", "corta1") is not None     # menos de 8
    assert validate_credentials("daniel", None) is not None
    assert validate_credentials("daniel", "") is not None
    assert validate_credentials("daniel", "con espacios en medio") is not None
    assert validate_credentials("daniel", "x" * 201) is not None


def test_hash_verificado_roundtrip():
    stored = hash_password("superclave123")
    assert stored.startswith("scrypt$")
    assert verify_password("superclave123", stored) is True
    assert verify_password("superclave124", stored) is False
    assert verify_password("", stored) is False


def test_hash_sal_unica():
    assert hash_password("superclave123") != hash_password("superclave123")


def test_hash_corrupto_no_infla_la_excepcion():
    assert verify_password("x", "no-hash") is False
    assert verify_password("x", "scrypt$16384$8$1$zz$zz") is False
