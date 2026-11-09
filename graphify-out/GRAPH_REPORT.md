# Graph Report - memes  (2026-11-09)

## Corpus Check
- 71 files · ~59,065 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: .xml 8, (none) 5, .aab 5)

## Summary
- 756 nodes · 1590 edges · 46 communities (28 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f83b7593`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- match_score
- public/app.mjs
- extract_subject
- assets/app.mjs
- MainActivity.kt
- Meme Studio Pro — Aplicación Android (APK)
- memestudio
- install_graphify_hooks.sh
- Parar
- config.py
- create_app.py
- account_sqlite.py
- ports/__init__.py
- FileDraftStore
- assets/manifest.json
- public/manifest.json
- run.sh
- auth.py
- auth_support.py
- graphify
- bump_version.py
- build_apk.sh
- memestudio
- users.py
- android_bridge.test.mjs
- draft_slug
- Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)
- meme_catalogs.py
- RembgBackgroundMasker
- README.md
- podman_publish.sh
- Meme Studio Pro 🎭
- assets/sw.js
- public/sw.js
- ArcticShiftRedditCatalog
- 🔌 API del Backend
- 🤖 Documentación y Contexto para Agentes de IA
- ⌨️ Guía de Uso y Atajos

## God Nodes (most connected - your core abstractions)
1. `initEvents()` - 48 edges
2. `initEvents()` - 48 edges
3. `$` - 36 edges
4. `$` - 36 edges
5. `create_app()` - 29 edges
6. `toast()` - 22 edges
7. `toast()` - 22 edges
8. `schedule()` - 21 edges
9. `schedule()` - 21 edges
10. `sync()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Conectar un agente al grafo (resumen)` --references--> `graph_stats()`  [INFERRED]
  README.md → tools/refresh_graph_docs.py
- `Conectarse al grafo por MCP (otros agentes y clientes)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `Herramientas MCP (prefijo `graphify_`)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `🔍 Diagnóstico y Correcciones Recomendadas` --references--> `remove_bg()`  [INFERRED]
  README.md → memestudio/app/routers/images.py
- `📊 Graphify — Grafo de Conocimiento del Código (contexto primario)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py

## Import Cycles
- None detected.

## Communities (46 total, 18 thin omitted)

### Community 0 - "match_score"
Cohesion: 0.18
Nodes (10): build_imgflip_router(), meme_search(), build_reddit_router(), meme_search_reddit(), match_score(), normalize(), test_match_cero_cuando_ni_tocarse(), test_match_exacto_y_subcadena() (+2 more)

### Community 1 - "public/app.mjs"
Cohesion: 0.05
Nodes (113): addImage(), addShape(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyView(), applyWatermarkPreset() (+105 more)

### Community 2 - "extract_subject"
Cohesion: 0.14
Nodes (9): BackgroundMasker, CropBox, extract_subject(), SubjectNotDetected, FakeMasker, _source(), test_el_margen_anti_aliasing_no_sale_de_la_imagen(), test_extrae_bloque_con_crop_box() (+1 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.05
Nodes (113): addImage(), addShape(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyView(), applyWatermarkPreset() (+105 more)

### Community 4 - "MainActivity.kt"
Cohesion: 0.08
Nodes (4): ImageSaverBridge, MainActivity, WebChromeClient, WebViewClient

### Community 5 - "Meme Studio Pro — Aplicación Android (APK)"
Cohesion: 0.18
Nodes (11): Actualizar el frontend de la app, APK de release firmada, Bundle para Google Play (`.aab`), Compilar el APK, Meme Studio Pro — Aplicación Android (APK), Notas técnicas, Opción A — Android Studio (recomendada), Opción B — Línea de comandos (probada, sin Android Studio) (+3 more)

### Community 6 - "memestudio"
Cohesion: 0.10
Nodes (19): interval, retries, start_period, test, timeout, build, container_name, environment (+11 more)

### Community 8 - "Parar"
Cohesion: 0.14
Nodes (14): remove_bg(), 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM), 6. App Android (APK / Play Store), 🔐 Acceso con usuario y contraseña, 🔍 Diagnóstico y Correcciones Recomendadas (+6 more)

### Community 12 - "config.py"
Cohesion: 0.12
Nodes (13): _load_dotenv(), load_settings(), _parse_auth_users(), Settings, _truthy(), _client(), _settings(), test_csrf_rechaza_origin_ajeno() (+5 more)

### Community 14 - "account_sqlite.py"
Cohesion: 0.13
Nodes (5): _connect(), InitializationError, SqliteAccountRepository, SqliteSessionStore, UsernameTaken

### Community 15 - "ports/__init__.py"
Cohesion: 0.08
Nodes (5): User, BackgroundMasker, DraftStore, SessionStore, UserRepository

### Community 17 - "assets/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 18 - "public/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 19 - "run.sh"
Cohesion: 0.60
Nodes (5): ensure_env(), health(), pick_python(), server_pids(), run.sh script

### Community 20 - "auth.py"
Cohesion: 0.18
Nodes (3): RateLimiter, RateLimitExceeded, AuthIn

### Community 21 - "auth_support.py"
Cohesion: 0.18
Nodes (6): check_basic_auth(), ensure_same_origin(), session_user(), create_app(), auth_gate(), _env_tuple()

### Community 22 - "graphify"
Cohesion: 0.29
Nodes (6): command, type, mcp, servers, $schema, graphify

### Community 23 - "bump_version.py"
Cohesion: 0.09
Nodes (22): CLI equivalente (útil para scripts), Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`), Regla de uso para agentes, bump_html_asset(), bump_subject_skip() (+14 more)

### Community 31 - "users.py"
Cohesion: 0.12
Nodes (19): clear_session_cookie(), client_ip(), set_session_cookie(), build_auth_router(), login(), logout(), me(), register() (+11 more)

### Community 32 - "android_bridge.test.mjs"
Cohesion: 0.29
Nodes (3): kt, mjs, ROOT

### Community 33 - "draft_slug"
Cohesion: 0.23
Nodes (5): build_draft_router(), draft_download(), draft_upload(), draft_slug(), test_slug_saneado_para_archivo()

### Community 34 - "Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)"
Cohesion: 0.18
Nodes (11): Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, 🏷️ Documentación / Tooling, 🧠 Flujo de Datos y Estado Global (`app.mjs`), ⚠️ Invariantes Críticos y Peculiaridades (Gotchas), 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario), ⚠️ Limitación crítica conocida (v1.1.0) (+3 more)

### Community 35 - "meme_catalogs.py"
Cohesion: 0.10
Nodes (4): ImageProxy, WrongImageSource, _http_json(), ImgflipCatalog

### Community 37 - "README.md"
Cohesion: 0.25
Nodes (5): Ver logs, Descargar e instalar, Detalles de la build, 📱 Releases de Meme Studio Pro (APK), Verificación de integridad (SHA-256)

### Community 39 - "Meme Studio Pro 🎭"
Cohesion: 0.11
Nodes (19): 0. `./run.sh` — un comando para todo (Linux/macOS), 1. Clonar o acceder al repositorio, 1. Docker (modo recomendado), 2. Crear y activar el entorno virtual, 3. Instalar dependencias, 🏛️ Arquitectura del Proyecto, ✨ Características Principales, 🌐 Catálogo y Plantillas Virales (+11 more)

### Community 43 - "🔌 API del Backend"
Cohesion: 0.29
Nodes (7): 🔌 API del Backend, `GET /api/meme-image`, `GET /api/meme-search`, `GET /api/meme-search-reddit`, `GET /health`, `POST /api/draft` / `GET /api/draft`, `POST /api/remove-bg`

### Community 44 - "🤖 Documentación y Contexto para Agentes de IA"
Cohesion: 0.50
Nodes (4): Automatización por hooks de Git, Conectar un agente al grafo (resumen), 🤖 Documentación y Contexto para Agentes de IA, ¿Qué provisiona el repo?

### Community 45 - "⌨️ Guía de Uso y Atajos"
Cohesion: 0.67
Nodes (3): Autoguardado:, ⌨️ Guía de Uso y Atajos, Manipulación sobre el lienzo:

## Knowledge Gaps
- **1 isolated node(s):** `memestudio`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 267 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `⌨️ Guía de Uso y Atajos`, `🔌 API del Backend`, `🤖 Documentación y Contexto para Agentes de IA`, `README.md`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `create_app()` (e.g. with `InitializationError` and `.init_schema()`) actually correct?**
  _`create_app()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `memestudio` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `public/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.051368578927634044 - nodes in this community are weakly interconnected._
- **Why does `build_image_router()` connect `create_app.py` to `Parar`, `extract_subject`, `auth_support.py`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `extract_subject` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._
- **Why does `remove_bg()` connect `Parar` to `extract_subject`, `create_app.py`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._