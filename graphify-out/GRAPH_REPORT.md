# Graph Report - memes  (2026-11-02)

## Corpus Check
- 64 files · ~46,111 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .xml 7, (none) 5, .css 2)

## Summary
- 649 nodes · 1374 edges · 35 communities (18 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `92212cd9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- meme_catalogs.py
- public/app.mjs
- extract_subject
- assets/app.mjs
- MainActivity.kt
- Meme Studio Pro 🎭
- memestudio
- install_graphify_hooks.sh
- Parar
- create_app.py
- memes.py
- auth.py
- auth_support.py
- config.py
- assets/manifest.json
- public/manifest.json
- test_app_auth_flow.py
- FileDraftStore
- auth_support.py
- graphify
- pathlib
- RembgBackgroundMasker
- draft_slug
- meme_catalogs.py
- create_app
- ArcticShiftRedditCatalog
- refresh_graph_docs.py

## God Nodes (most connected - your core abstractions)
1. `initEvents()` - 36 edges
2. `initEvents()` - 36 edges
3. `$` - 35 edges
4. `$` - 35 edges
5. `create_app()` - 29 edges
6. `toast()` - 21 edges
7. `toast()` - 21 edges
8. `schedule()` - 19 edges
9. `sync()` - 19 edges
10. `schedule()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Conectar un agente al grafo (resumen)` --references--> `graph_stats()`  [INFERRED]
  README.md → tools/refresh_graph_docs.py
- `Herramientas MCP (prefijo `graphify_`)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `Conectarse al grafo por MCP (otros agentes y clientes)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `📊 Graphify — Grafo de Conocimiento del Código (contexto primario)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `🔍 Diagnóstico y Correcciones Recomendadas` --references--> `remove_bg()`  [INFERRED]
  README.md → memestudio/app/routers/images.py

## Import Cycles
- None detected.

## Communities (35 total, 17 thin omitted)

### Community 0 - "meme_catalogs.py"
Cohesion: 0.18
Nodes (10): build_imgflip_router(), meme_search(), build_reddit_router(), meme_search_reddit(), match_score(), normalize(), test_match_cero_cuando_ni_tocarse(), test_match_exacto_y_subcadena() (+2 more)

### Community 1 - "public/app.mjs"
Cohesion: 0.06
Nodes (96): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions() (+88 more)

### Community 2 - "extract_subject"
Cohesion: 0.10
Nodes (12): build_image_router(), remove_bg(), BackgroundMasker, CropBox, extract_subject(), SubjectNotDetected, 🔍 Diagnóstico y Correcciones Recomendadas, FakeMasker (+4 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.06
Nodes (96): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions() (+88 more)

### Community 5 - "Meme Studio Pro 🎭"
Cohesion: 0.11
Nodes (18): 1. Clonar o acceder al repositorio, 1. Docker (modo recomendado), 2. Crear y activar el entorno virtual de Python, 3. Instalar dependencias, 🏛️ Arquitectura del Proyecto, ✨ Características Principales, 🌐 Catálogo y Plantillas Virales, 🖼️ Composición y Edición de Imágenes (+10 more)

### Community 6 - "memestudio"
Cohesion: 0.10
Nodes (19): interval, retries, start_period, test, timeout, build, container_name, environment (+11 more)

### Community 8 - "Parar"
Cohesion: 0.04
Nodes (43): Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, 🧠 Flujo de Datos y Estado Global (`app.mjs`), ⚠️ Invariantes Críticos y Peculiaridades (Gotchas), 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario), ⚠️ Limitación crítica conocida (v1.1.0), 🏗️ Mapa de Archivos y Responsabilidades (+35 more)

### Community 14 - "auth.py"
Cohesion: 0.06
Nodes (25): _connect(), InitializationError, SqliteAccountRepository, SqliteSessionStore, clear_session_cookie(), client_ip(), set_session_cookie(), RateLimitExceeded (+17 more)

### Community 15 - "auth_support.py"
Cohesion: 0.08
Nodes (4): BackgroundMasker, DraftStore, SessionStore, UserRepository

### Community 16 - "config.py"
Cohesion: 0.17
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

### Community 21 - "auth_support.py"
Cohesion: 0.24
Nodes (4): check_basic_auth(), ensure_same_origin(), session_user(), auth_gate()

### Community 22 - "graphify"
Cohesion: 0.29
Nodes (6): command, type, mcp, servers, $schema, graphify

### Community 30 - "draft_slug"
Cohesion: 0.24
Nodes (5): build_draft_router(), draft_download(), draft_upload(), draft_slug(), test_slug_saneado_para_archivo()

### Community 32 - "create_app"
Cohesion: 0.25
Nodes (3): ImgflipCatalog, create_app(), _env_tuple()

### Community 35 - "refresh_graph_docs.py"
Cohesion: 0.19
Nodes (10): CLI equivalente (útil para scripts), Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`), Regla de uso para agentes, graph_stats(), main() (+2 more)

## Knowledge Gaps
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `extract_subject`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `create_app()` (e.g. with `InitializationError` and `.init_schema()`) actually correct?**
  _`create_app()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `public/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05896805896805897 - nodes in this community are weakly interconnected._
- **Why does `build_image_router()` connect `extract_subject` to `create_app`, `create_app.py`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `extract_subject` be split into smaller, more focused modules?**
  _Cohesion score 0.09848484848484848 - nodes in this community are weakly interconnected._
- **Should `assets/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.061814914645103324 - nodes in this community are weakly interconnected._
- **Should `MainActivity.kt` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._