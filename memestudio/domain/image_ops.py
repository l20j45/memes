"""Dominio de imágenes: extracción del sujeto con auto-crop (PURO).

Depende de un BackgroundMasker (puerto); la decisión de recorte es un mecanismo
puro que los tests pueden verificar con un masker falso.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


class BackgroundMasker(Protocol):
    def mask(self, rgba): ...  # PIL.Image (RGBA) -> PIL.Image (RGBA)


@dataclass
class CropBox:
    """Acotación del recorte respecto a la imagen original decorada el
    frontend en la cabecera X-Crop-Box: 'left,top,src_w,src_h'."""

    left: int
    top: int
    src_w: int
    src_h: int

    def header_value(self) -> str:
        return f"{self.left},{self.top},{self.src_w},{self.src_h}"


class SubjectNotDetected(Exception):
    """El modelo devolvió una imagen 100% transparente."""


def extract_subject(rgba, masker: BackgroundMasker):
    """Segmenta el sujeto y lo recorta al bounding box del canal alfa.

    Devuelve (imagen_recortada, CropBox). El auto-crop elimina el área 100%
    transparente sobrante (menos píxeles muertos que el canvas sobredimensiona)
    y el CropBox permite al frontend reubicar la capa en su sitio exacto.
    """
    src_w, src_h = rgba.size
    subject = masker.mask(rgba)
    bbox = subject.getchannel("A").getbbox()
    if not bbox:
        raise SubjectNotDetected("El sujeto no fue detectado (resultado transparente).")

    pad = max(1, min(src_w, src_h) // 200)  # margen anti-aliasing
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(src_w, bbox[2] + pad)
    bottom = min(src_h, bbox[3] + pad)
    cropped = subject.crop((left, top, right, bottom))
    return cropped, CropBox(left=left, top=top, src_w=src_w, src_h=src_h)
