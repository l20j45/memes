"""Tests del dominio de imágenes con un BackgroundMasker FALSO (sin rembg)."""
from __future__ import annotations

import pytest
from PIL import Image

from memestudio.domain.image_ops import SubjectNotDetected, extract_subject


class FakeMasker:
    """Segmenta una zona anunciada (simula un modelo real)."""

    def __init__(self, box=None):
        self._box = box

    def mask(self, rgba):
        if self._box is None:  # sujeto desaparecido: imagen 100% transparente
            return Image.new("RGBA", rgba.size, (0, 0, 0, 0))
        out = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
        left, top, right, bottom = self._box
        out.paste((255, 0, 0, 255), (left, top, right, bottom))
        return out


def _source(size=(200, 120)):
    img = Image.new("RGBA", size, (255, 255, 255, 0))
    img.paste((30, 120, 220, 255), (40, 20, 160, 100))
    return img


def test_extrae_bloque_con_crop_box():
    cropped, crop = extract_subject(_source(), FakeMasker(box=(40, 20, 160, 100)))
    # El CropBox referencia la imagen ORIGINAL (no la recortada)
    assert (crop.src_w, crop.src_h) == (200, 120)
    assert crop.header_value() == f"#{crop.left},{crop.top},200,120".replace("#", "")
    # El sujeto recortado nunca excede la imagen original
    assert 0 < cropped.width <= 200
    assert 0 < cropped.height <= 120


def test_el_margen_anti_aliasing_no_sale_de_la_imagen():
    # Sujeto pegado al borde derecho: right + pad se recorta con min()
    cropped, crop = extract_subject(_source(size=(120, 120)), FakeMasker(box=(90, 20, 120, 100)))
    assert crop.header_value().split(",")[2] == "120"  # src_w intacto
    assert cropped.width <= 120


def test_sujeto_no_detectado_lanza():
    with pytest.raises(SubjectNotDetected):
        extract_subject(_source(), FakeMasker(box=None))
