# Graph Report - memes  (2026-11-02)

## Corpus Check
- 64 files · ~40,924 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .xml 7, (none) 5, .css 2)

## Summary
- 629 nodes · 1302 edges · 29 communities (14 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3bd773c0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- meme_catalogs.py
- public/app.mjs
- ports/__init__.py
- assets/app.mjs
- MainActivity.kt
- Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)
- memestudio
- install_graphify_hooks.sh
- Parar
- create_app.py
- auth.py
- create_app
- config.py
- assets/manifest.json
- public/manifest.json
- test_app_auth_flow.py
- FileDraftStore
- ArcticShiftRedditCatalog
- graphify
- pathlib
- RembgBackgroundMasker

## God Nodes (most connected - your core abstractions)
1. `$` - 33 edges
2. `$` - 33 edges
3. `initEvents()` - 32 edges
4. `initEvents()` - 32 edges
5. `create_app()` - 29 edges
6. `toast()` - 19 edges
7. `toast()` - 19 edges
8. `build_auth_router()` - 16 edges
9. `schedule()` - 16 edges
10. `sync()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Herramientas MCP (prefijo `graphify_`)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `Conectarse al grafo por MCP (otros agentes y clientes)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `Conectar un agente al grafo (resumen)` --references--> `graph_stats()`  [INFERRED]
  README.md → tools/refresh_graph_docs.py
- `📊 Graphify — Grafo de Conocimiento del Código (contexto primario)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `🔍 Diagnóstico y Correcciones Recomendadas` --references--> `remove_bg()`  [INFERRED]
  README.md → memestudio/app/routers/images.py

## Import Cycles
- None detected.

## Communities (29 total, 15 thin omitted)

### Community 0 - "meme_catalogs.py"
Cohesion: 0.06
Nodes (19): ImageProxy, WrongImageSource, _http_json(), ImgflipCatalog, build_draft_router(), draft_download(), draft_upload(), build_imgflip_router() (+11 more)

### Community 1 - "public/app.mjs"
Cohesion: 0.06
Nodes (87): addImage(), appendTemplateSet(), applyClean(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions(), bindControl() (+79 more)

### Community 2 - "ports/__init__.py"
Cohesion: 0.05
Nodes (13): BackgroundMasker, CropBox, extract_subject(), SubjectNotDetected, BackgroundMasker, DraftStore, SessionStore, UserRepository (+5 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.07
Nodes (87): addImage(), appendTemplateSet(), applyClean(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions(), bindControl() (+79 more)

### Community 5 - "Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)"
Cohesion: 0.05
Nodes (37): Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, 🧠 Flujo de Datos y Estado Global (`app.mjs`), ⚠️ Invariantes Críticos y Peculiaridades (Gotchas), 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario), ⚠️ Limitación crítica conocida (v1.1.0), 🏗️ Mapa de Archivos y Responsabilidades (+29 more)

### Community 6 - "memestudio"
Cohesion: 0.10
Nodes (19): interval, retries, start_period, test, timeout, build, container_name, environment (+11 more)

### Community 8 - "Parar"
Cohesion: 0.06
Nodes (36): CLI equivalente (útil para scripts), Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`), Regla de uso para agentes, remove_bg(), 2. Servidor Local sin Docker (desarrollo) (+28 more)

### Community 14 - "auth.py"
Cohesion: 0.06
Nodes (25): _connect(), InitializationError, SqliteAccountRepository, SqliteSessionStore, clear_session_cookie(), client_ip(), set_session_cookie(), RateLimitExceeded (+17 more)

### Community 15 - "create_app"
Cohesion: 0.18
Nodes (6): check_basic_auth(), ensure_same_origin(), session_user(), create_app(), auth_gate(), _env_tuple()

### Community 16 - "config.py"
Cohesion: 0.16
Nodes (5): _load_dotenv(), load_settings(), _parse_auth_users(), Settings, _truthy()

### Community 17 - "assets/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 18 - "public/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 19 - "test_app_auth_flow.py"
Cohesion: 0.31
Nodes (8): _client(), _settings(), test_csrf_rechaza_origin_ajeno(), test_modo_abierto_por_defecto(), test_registro_cerrado(), test_registro_duplicado_y_login_mal(), test_registro_login_borrador_logout(), test_require_login_bloquea_api_pero_no_estaticos()

### Community 22 - "graphify"
Cohesion: 0.29
Nodes (6): command, type, mcp, servers, $schema, graphify

## Knowledge Gaps
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `create_app()` (e.g. with `InitializationError` and `.init_schema()`) actually correct?**
  _`create_app()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `meme_catalogs.py` be split into smaller, more focused modules?**
  _Cohesion score 0.056107539450613676 - nodes in this community are weakly interconnected._
- **Why does `remove_bg()` connect `Parar` to `ports/__init__.py`, `create_app.py`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `public/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06415841584158416 - nodes in this community are weakly interconnected._
- **Why does `build_image_router()` connect `create_app.py` to `Parar`, `ports/__init__.py`, `create_app`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `ports/__init__.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05279034690799397 - nodes in this community are weakly interconnected._