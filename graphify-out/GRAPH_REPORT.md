# Graph Report - memes  (2026-11-01)

## Corpus Check
- 8 files · ~15,126 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .log 1, .css 1)

## Summary
- 171 nodes · 303 edges · 8 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd9acf6e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server.py
- app.mjs
- Meme Studio Pro 🎭
- initEvents
- toast
- Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)
- memestudio
- refresh_graph_docs.py

## God Nodes (most connected - your core abstractions)
1. `initEvents()` - 30 edges
2. `schedule()` - 14 edges
3. `draw()` - 13 edges
4. `sync()` - 13 edges
5. `toast()` - 13 edges
6. `Meme Studio Pro 🎭` - 12 edges
7. `pushHistory()` - 12 edges
8. `memestudio` - 9 edges
9. `Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)` - 8 edges
10. `graph_stats()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Herramientas MCP (prefijo `graphify_`)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `Conectarse al grafo por MCP (otros agentes y clientes)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `Conectar un agente al grafo (resumen)` --references--> `graph_stats()`  [INFERRED]
  README.md → tools/refresh_graph_docs.py
- `⚠️ Invariantes Críticos y Peculiaridades (Gotchas)` --references--> `draw()`  [INFERRED]
  AGENTS.md → app.mjs
- `📊 Graphify — Grafo de Conocimiento del Código (contexto primario)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py

## Import Cycles
- None detected.

## Communities (8 total, 0 thin omitted)

### Community 0 - "server.py"
Cohesion: 0.09
Nodes (6): 🔍 Diagnóstico y Correcciones Recomendadas, _get_rembg_session(), health(), index(), remove_bg(), main()

### Community 1 - "app.mjs"
Cohesion: 0.11
Nodes (29): appendTemplateSet(), buildTemplates(), checkerPattern(), CINEMATIC_MEME_TEMPLATES, clamp(), cv, cx, DEFAULT_MEME_TEMPLATES (+21 more)

### Community 2 - "Meme Studio Pro 🎭"
Cohesion: 0.07
Nodes (27): 1. Clonar o acceder al repositorio, 1. Docker (modo recomendado), 2. Crear y activar el entorno virtual de Python, 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 3. Instalar dependencias, 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM) (+19 more)

### Community 3 - "initEvents"
Cohesion: 0.15
Nodes (29): addImage(), applyRatio(), applyWatermarkPreset(), bindAccordions(), bindControl(), buildSnapshot(), clearSelectedText(), cropBars() (+21 more)

### Community 4 - "toast"
Cohesion: 0.36
Nodes (8): applyClean(), copy(), dilateMask(), download(), inpaint(), render(), toast(), validateExportReady()

### Community 5 - "Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)"
Cohesion: 0.15
Nodes (11): Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, 🧠 Flujo de Datos y Estado Global (`app.mjs`), ⚠️ Invariantes Críticos y Peculiaridades (Gotchas), 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario), ⚠️ Limitación crítica conocida (v1.1.0), 🏗️ Mapa de Archivos y Responsabilidades (+3 more)

### Community 6 - "memestudio"
Cohesion: 0.11
Nodes (17): interval, retries, start_period, test, timeout, build, container_name, environment (+9 more)

### Community 7 - "refresh_graph_docs.py"
Cohesion: 0.14
Nodes (14): CLI equivalente (útil para scripts), Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`), Regla de uso para agentes, Automatización por hooks de Git, Conectar un agente al grafo (resumen) (+6 more)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `draw()` connect `app.mjs` to `server.py`, `initEvents`, `toast`, `Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)`?**
  _High betweenness centrality (0.356) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `draw()` (e.g. with `⚠️ Invariantes Críticos y Peculiaridades (Gotchas)` and `🔍 Diagnóstico y Correcciones Recomendadas`) actually correct?**
  _`draw()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `server.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Why does `🔍 Diagnóstico y Correcciones Recomendadas` connect `server.py` to `app.mjs`, `Meme Studio Pro 🎭`?**
  _High betweenness centrality (0.349) - this node is a cross-community bridge._
- **Should `app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.11494252873563218 - nodes in this community are weakly interconnected._
- **Why does `Meme Studio Pro 🎭` connect `Meme Studio Pro 🎭` to `server.py`, `Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)`, `refresh_graph_docs.py`?**
  _High betweenness centrality (0.281) - this node is a cross-community bridge._
- **Should `Meme Studio Pro 🎭` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._