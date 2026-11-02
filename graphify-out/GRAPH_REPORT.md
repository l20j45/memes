# Graph Report - memes  (2026-11-02)

## Corpus Check
- 14 files · ~29,354 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .xml 7, (none) 4, .css 2)

## Summary
- 300 nodes · 572 edges · 12 communities (8 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a82f077`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server.py
- app.mjs
- Meme Studio Pro 🎭
- assets/app.mjs
- MainActivity.kt
- Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)
- memestudio
- refresh_graph_docs.py
- Meme Studio Pro — Aplicación Android (APK)

## God Nodes (most connected - your core abstractions)
1. `initEvents()` - 30 edges
2. `initEvents()` - 30 edges
3. `toast()` - 14 edges
4. `schedule()` - 14 edges
5. `sync()` - 14 edges
6. `schedule()` - 14 edges
7. `sync()` - 14 edges
8. `toast()` - 14 edges
9. `draw()` - 13 edges
10. `pushHistory()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Conectar un agente al grafo (resumen)` --references--> `graph_stats()`  [INFERRED]
  README.md → tools/refresh_graph_docs.py
- `Conectarse al grafo por MCP (otros agentes y clientes)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `Herramientas MCP (prefijo `graphify_`)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `📊 Graphify — Grafo de Conocimiento del Código (contexto primario)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `⚠️ Invariantes Críticos y Peculiaridades (Gotchas)` --references--> `draw()`  [INFERRED]
  AGENTS.md → app.mjs

## Import Cycles
- None detected.

## Communities (12 total, 4 thin omitted)

### Community 0 - "server.py"
Cohesion: 0.05
Nodes (13): 🔍 Diagnóstico y Correcciones Recomendadas, _fetch_arctic_sub(), _get_rembg_session(), health(), index(), _load_dotenv(), _match_score(), meme_image() (+5 more)

### Community 1 - "app.mjs"
Cohesion: 0.08
Nodes (67): addImage(), API_BASE, apiUrl(), appendTemplateSet(), applyClean(), applyRatio(), applyWatermarkPreset(), bindAccordions() (+59 more)

### Community 2 - "Meme Studio Pro 🎭"
Cohesion: 0.06
Nodes (31): 1. Clonar o acceder al repositorio, 1. Docker (modo recomendado), 2. Crear y activar el entorno virtual de Python, 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 3. Instalar dependencias, 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM) (+23 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.08
Nodes (68): addImage(), API_BASE, apiUrl(), appendTemplateSet(), applyClean(), applyRatio(), applyWatermarkPreset(), bindAccordions() (+60 more)

### Community 5 - "Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)"
Cohesion: 0.15
Nodes (11): Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, 🧠 Flujo de Datos y Estado Global (`app.mjs`), ⚠️ Invariantes Críticos y Peculiaridades (Gotchas), 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario), ⚠️ Limitación crítica conocida (v1.1.0), 🏗️ Mapa de Archivos y Responsabilidades (+3 more)

### Community 6 - "memestudio"
Cohesion: 0.11
Nodes (17): interval, retries, start_period, test, timeout, build, container_name, environment (+9 more)

### Community 7 - "refresh_graph_docs.py"
Cohesion: 0.14
Nodes (11): CLI equivalente (útil para scripts), Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`), Regla de uso para agentes, graph_stats(), main() (+3 more)

### Community 8 - "Meme Studio Pro — Aplicación Android (APK)"
Cohesion: 0.22
Nodes (8): Actualizar el frontend de la app, Compilar el APK, Meme Studio Pro — Aplicación Android (APK), Notas técnicas, Opción A — Android Studio (recomendada), Opción B — Línea de comandos, Qué funciona y qué no dentro del móvil, Servidor IA opcional (quitar fondo real en Android)

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `🔍 Diagnóstico y Correcciones Recomendadas` connect `server.py` to `app.mjs`, `Meme Studio Pro 🎭`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Should `server.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05410628019323672 - nodes in this community are weakly interconnected._
- **Why does `draw()` connect `app.mjs` to `server.py`, `Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **Should `app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.08208955223880597 - nodes in this community are weakly interconnected._
- **Should `Meme Studio Pro 🎭` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `assets/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.08056265984654731 - nodes in this community are weakly interconnected._
- **Should `MainActivity.kt` be split into smaller, more focused modules?**
  _Cohesion score 0.12554112554112554 - nodes in this community are weakly interconnected._