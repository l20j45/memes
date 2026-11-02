# Graph Report - memes  (2026-11-02)

## Corpus Check
- 16 files · ~33,029 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .xml 7, (none) 5, .css 2)

## Summary
- 349 nodes · 664 edges · 19 communities (12 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `598fa371`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.mjs
- Meme Studio Pro 🎭
- assets/app.mjs
- MainActivity.kt
- Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)
- memestudio
- refresh_graph_docs.py
- Parar
- manifest.json
- meme_search_reddit
- get
- _auth_gate
- remove_bg
- _reddit_populate_cache
- _load_dotenv

## God Nodes (most connected - your core abstractions)
1. `initEvents()` - 30 edges
2. `initEvents()` - 30 edges
3. `schedule()` - 16 edges
4. `toast()` - 16 edges
5. `schedule()` - 16 edges
6. `toast()` - 16 edges
7. `sync()` - 15 edges
8. `sync()` - 15 edges
9. `Parar` - 13 edges
10. `pushHistory()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Conectar un agente al grafo (resumen)` --references--> `graph_stats()`  [INFERRED]
  README.md → tools/refresh_graph_docs.py
- `Herramientas MCP (prefijo `graphify_`)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `Conectarse al grafo por MCP (otros agentes y clientes)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `📊 Graphify — Grafo de Conocimiento del Código (contexto primario)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `⚠️ Invariantes Críticos y Peculiaridades (Gotchas)` --references--> `_auth_gate()`  [INFERRED]
  AGENTS.md → server.py

## Import Cycles
- None detected.

## Communities (19 total, 7 thin omitted)

### Community 1 - "app.mjs"
Cohesion: 0.07
Nodes (75): addImage(), API_BASE, apiUrl(), appendTemplateSet(), applyClean(), applyRatio(), applyWatermarkPreset(), authErrorMessage() (+67 more)

### Community 2 - "Meme Studio Pro 🎭"
Cohesion: 0.11
Nodes (18): 1. Clonar o acceder al repositorio, 1. Docker (modo recomendado), 2. Crear y activar el entorno virtual de Python, 3. Instalar dependencias, 🏛️ Arquitectura del Proyecto, ✨ Características Principales, 🌐 Catálogo y Plantillas Virales, 🖼️ Composición y Edición de Imágenes (+10 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.08
Nodes (74): addImage(), API_BASE, apiUrl(), appendTemplateSet(), applyClean(), applyRatio(), applyWatermarkPreset(), authErrorMessage() (+66 more)

### Community 5 - "Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)"
Cohesion: 0.10
Nodes (18): Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, 🧠 Flujo de Datos y Estado Global (`app.mjs`), 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario), ⚠️ Limitación crítica conocida (v1.1.0), 🏗️ Mapa de Archivos y Responsabilidades, Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md) (+10 more)

### Community 6 - "memestudio"
Cohesion: 0.11
Nodes (18): interval, retries, start_period, test, timeout, build, container_name, environment (+10 more)

### Community 7 - "refresh_graph_docs.py"
Cohesion: 0.14
Nodes (11): CLI equivalente (útil para scripts), Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`), Regla de uso para agentes, graph_stats(), main() (+3 more)

### Community 8 - "Parar"
Cohesion: 0.09
Nodes (23): 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM), 6. App Android (APK), 🔐 Acceso con usuario y contraseña, 🔌 API del Backend, Autoguardado: (+15 more)

### Community 12 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 13 - "meme_search_reddit"
Cohesion: 0.29
Nodes (4): _match_score(), meme_search(), meme_search_reddit(), _normalize()

### Community 14 - "get"
Cohesion: 0.29
Nodes (4): draft_download(), health(), index(), meme_image()

### Community 15 - "_auth_gate"
Cohesion: 0.33
Nodes (3): ⚠️ Invariantes Críticos y Peculiaridades (Gotchas), _auth_gate(), _check_auth()

### Community 16 - "remove_bg"
Cohesion: 0.22
Nodes (5): 🔍 Diagnóstico y Correcciones Recomendadas, _draft_slug(), draft_upload(), _get_rembg_session(), remove_bg()

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `remove_bg`, `Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `server.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `remove_bg()` connect `remove_bg` to `server.py`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07347915242652085 - nodes in this community are weakly interconnected._
- **Why does `🔍 Diagnóstico y Correcciones Recomendadas` connect `remove_bg` to `Parar`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `Meme Studio Pro 🎭` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `assets/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07675675675675675 - nodes in this community are weakly interconnected._