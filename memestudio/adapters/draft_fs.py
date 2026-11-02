"""Adaptador de borradores sobre el sistema de ficheros (drafts/<usuario>.json)."""
from __future__ import annotations

from pathlib import Path


class FileDraftStore:
    """DraftStore simple: un <slug>.json por usuario en drafts/."""

    def __init__(self, draft_dir: Path):
        self._dir = Path(draft_dir)

    def path(self, slug: str) -> Path:
        """Ruta del archivo (para cabeceras tipo X-Saved-At con stat())."""
        return self._dir / f"{slug}.json"

    def save(self, slug: str, data: bytes) -> int:
        self._dir.mkdir(parents=True, exist_ok=True)
        self.path(slug).write_bytes(data)
        return len(data)

    def load(self, slug: str) -> bytes | None:
        path = self.path(slug)
        if not path.is_file():
            return None
        return path.read_bytes()
