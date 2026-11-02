# Graph Report - memes  (2026-11-01)

## Corpus Check
- 8 files · ~15,126 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .log 1, .css 1)

## Summary
- 154 nodes · 273 edges · 8 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d73fd9fb`
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
- appendTemplateSet

## God Nodes (most connected - your core abstractions)
1. `initEvents()` - 30 edges
2. `schedule()` - 14 edges
3. `sync()` - 13 edges
4. `toast()` - 13 edges
5. `draw()` - 13 edges
6. `pushHistory()` - 12 edges
7. `Meme Studio Pro 🎭` - 11 edges
8. `memestudio` - 9 edges
9. `addImage()` - 8 edges
10. `Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)` - 8 edges

## Surprising Connections (you probably didn't know these)
- `⚠️ Invariantes Críticos y Peculiaridades (Gotchas)` --references--> `draw()`  [INFERRED]
  AGENTS.md → app.mjs
- `🔍 Diagnóstico y Correcciones Recomendadas` --references--> `draw()`  [INFERRED]
  README.md → app.mjs
- `🔍 Diagnóstico y Correcciones Recomendadas` --references--> `remove_bg()`  [INFERRED]
  README.md → server.py
- `🧠 Flujo de Datos y Estado Global (`app.mjs`)` --references--> `stroke()`  [INFERRED]
  AGENTS.md → app.mjs

## Import Cycles
- None detected.

## Communities (8 total, 0 thin omitted)

### Community 0 - "server.py"
Cohesion: 0.09
Nodes (6): 🔍 Diagnóstico y Correcciones Recomendadas, _get_rembg_session(), health(), index(), remove_bg(), main()

### Community 1 - "app.mjs"
Cohesion: 0.12
Nodes (31): bindAccordions(), checkerPattern(), CINEMATIC_MEME_TEMPLATES, clamp(), cv, cx, DEFAULT_MEME_TEMPLATES, draw() (+23 more)

### Community 2 - "Meme Studio Pro 🎭"
Cohesion: 0.08
Nodes (25): 1. Clonar o acceder al repositorio, 1. Servidor Completo (Frontend + Backend de IA con FastAPI), 2. Crear y activar el entorno virtual de Python, 2. Frontend Independiente (Obsoleto), 3. Instalar dependencias, 3. Script CLI Independiente, 🔌 API del Backend, 🏛️ Arquitectura del Proyecto (+17 more)

### Community 3 - "initEvents"
Cohesion: 0.20
Nodes (21): addImage(), applyRatio(), applyWatermarkPreset(), bindControl(), buildSnapshot(), clearSelectedText(), cropBars(), cur() (+13 more)

### Community 4 - "toast"
Cohesion: 0.31
Nodes (9): applyClean(), copy(), dilateMask(), download(), fromFile(), inpaint(), render(), toast() (+1 more)

### Community 5 - "Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)"
Cohesion: 0.12
Nodes (16): CLI equivalente (útil para scripts), Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, Configuración actual, 🧠 Flujo de Datos y Estado Global (`app.mjs`), 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`) (+8 more)

### Community 6 - "memestudio"
Cohesion: 0.11
Nodes (17): interval, retries, start_period, test, timeout, build, container_name, environment (+9 more)

### Community 7 - "appendTemplateSet"
Cohesion: 0.60
Nodes (5): appendTemplateSet(), buildTemplates(), fetchMemeCatalog(), loadViralTemplates(), renderTemplateSet()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `🔍 Diagnóstico y Correcciones Recomendadas` connect `server.py` to `app.mjs`, `Meme Studio Pro 🎭`?**
  _High betweenness centrality (0.424) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `draw()` (e.g. with `⚠️ Invariantes Críticos y Peculiaridades (Gotchas)` and `🔍 Diagnóstico y Correcciones Recomendadas`) actually correct?**
  _`draw()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `server.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08615384615384615 - nodes in this community are weakly interconnected._
- **Why does `draw()` connect `app.mjs` to `server.py`, `initEvents`, `toast`, `Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)`?**
  _High betweenness centrality (0.422) - this node is a cross-community bridge._
- **Should `app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.11693548387096774 - nodes in this community are weakly interconnected._
- **Why does `Meme Studio Pro 🎭` connect `Meme Studio Pro 🎭` to `server.py`?**
  _High betweenness centrality (0.259) - this node is a cross-community bridge._
- **Should `Meme Studio Pro 🎭` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._