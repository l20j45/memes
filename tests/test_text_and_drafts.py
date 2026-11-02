"""Tests del matching difuso y de slugs de borradores (dominio puro)."""
from __future__ import annotations

from memestudio.domain.drafts import draft_slug
from memestudio.domain.text_match import match_score, normalize


def test_normaliza_acentos_y_minusculas():
    assert normalize("Camión") == "camion"
    assert normalize("  ÁGUILA ") == "  aguila "


def test_match_exacto_y_subcadena():
    assert match_score("drake", "drake") == 100.0
    assert match_score("drake", "drakeposting") > 80.0


def test_match_cero_cuando_ni_tocarse():
    assert match_score("zzzz", "banana split") == 0.0


def test_match_palabra_completa():
    assert match_score("sad cat", "sad cat cigarette") > match_score("sad cat", "cat")


def test_slug_saneado_para_archivo():
    assert draft_slug("Ana") == "ana"
    assert draft_slug("Ana<3") == "ana_3"
    assert draft_slug("") == "local"
    assert draft_slug("../../etc/passwd") == ".._.._etc_passwd"
    assert "/" not in draft_slug("../../etc/passwd")
