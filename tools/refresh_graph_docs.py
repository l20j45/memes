"""Refresca las estadísticas del grafo de Graphify dentro de AGENTS.md.

Lo invoca el hook de Git (post-commit / post-checkout) como proceso detachado,
tras la re-construcción automática de graphify-out/graph.json.

Comportamiento:
- Espera (hasta WAIT_SECONDS) a que graph.json cambie respecto al arranque,
  porque el rebuild de Graphify corre en background tras el commit.
- Si nunca cambia, usa el graph.json vigente (no falla jamás).
- Reescribe SOLO el bloque delimitado por los marcadores
  <!-- graphify-stats:start --> y <!-- graphify-stats:end --> de AGENTS.md.
- Si los marcadores no existen en AGENTS.md, no hace nada (salida silenciosa).
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

START = "<!-- graphify-stats:start -->"
END = "<!-- graphify-stats:end -->"
WAIT_SECONDS = 90          # tiempo máximo esperando el rebuild en background
POLL_SECONDS = 3


def graph_stats(graph_path: Path) -> dict:
    with graph_path.open("r", encoding="utf-8-sig") as fh:
        g = json.load(fh)
    nodes = g.get("nodes") or []
    links = g.get("links") or []
    hyperedges = g.get("hyperedges") or []
    communities = {
        n.get("community") for n in nodes if n.get("community") is not None
    }
    return {
        "nodes": len(nodes),
        "edges": len(links) + len(hyperedges),
        "communities": len(communities),
        "commit": g.get("built_at_commit", "") or "",
    }


def wait_for_change(graph_path: Path, baseline: float) -> None:
    deadline = time.monotonic() + WAIT_SECONDS
    while time.monotonic() < deadline:
        if graph_path.exists() and graph_path.stat().st_mtime > baseline:
            time.sleep(2)  # margen de gracia mientras Graphify termina de escribir
            return
        time.sleep(POLL_SECONDS)


def render(stats: dict) -> str:
    commit = (stats.get("commit") or "")[:9] or "?"
    return (
        f"{START}\n"
        f"> Grafo actualizado automáticamente por Git hooks "
        f"(tools/refresh_graph_docs.py): **{stats['nodes']} nodos · "
        f"{stats['edges']} aristas · {stats['communities']} comunidades** · "
        f"commit de extracción `{commit}`. "
        f"Detalles vivos: `graphify-out/GRAPH_REPORT.md` y `graph_stats` (MCP).\n"
        f"{END}"
    )


def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path.cwd()
    graph_path = root / "graphify-out" / "graph.json"
    agents = root / "AGENTS.md"
    if not graph_path.exists() or not agents.exists():
        return 0

    if "--now" not in sys.argv:
        baseline = graph_path.stat().st_mtime
        wait_for_change(graph_path, baseline)

    try:
        stats = graph_stats(graph_path)
    except Exception as exc:  # el hook nunca debe romper un commit
        print(f"[refresh_graph_docs] graph.json ilegible: {exc}", file=sys.stderr)
        return 0

    text = agents.read_text(encoding="utf-8-sig")
    i, j = text.find(START), text.find(END)
    if i == -1 or j == -1 or j < i:
        return 0  # sin marcadores: no tocar el archivo
    new_text = text[:i] + render(stats) + text[j + len(END) :]

    if new_text != text:
        tmp = agents.with_suffix(".md.tmp")
        tmp.write_text(new_text, encoding="utf-8")
        os.replace(tmp, agents)
        print("[refresh_graph_docs] AGENTS.md stats actualizadas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
