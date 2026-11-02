# Graph Report - memes  (2026-11-02)

## Corpus Check
- 67 files · ~52,264 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 36 file(s) not represented in the graph (top: .xml 8, .bin 7, .properties 6)

## Summary
- 698 nodes · 1463 edges · 44 communities (26 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `decb8a9c`
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
- users.py
- account_sqlite.py
- auth_support.py
- config.py
- assets/manifest.json
- public/manifest.json
- auth.py
- images.py
- auth_support.py
- graphify
- bump_version.py
- build_apk.sh
- Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)
- test_app_auth_flow.py
- Meme Studio Pro — Aplicación Android (APK)
- FileDraftStore
- 🔌 API del Backend
- refresh_graph_docs.py
- RembgBackgroundMasker
- README.md
- podman_publish.sh
- 🤖 Documentación y Contexto para Agentes de IA
- assets/sw.js
- public/sw.js
- ⌨️ Guía de Uso y Atajos

## God Nodes (most connected - your core abstractions)
1. `initEvents()` - 42 edges
2. `initEvents()` - 42 edges
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

## Communities (44 total, 18 thin omitted)

### Community 0 - "meme_catalogs.py"
Cohesion: 0.08
Nodes (17): ImageProxy, WrongImageSource, build_draft_router(), draft_download(), draft_upload(), build_imgflip_router(), meme_search(), build_reddit_router() (+9 more)

### Community 1 - "public/app.mjs"
Cohesion: 0.06
Nodes (100): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions() (+92 more)

### Community 2 - "extract_subject"
Cohesion: 0.14
Nodes (9): BackgroundMasker, CropBox, extract_subject(), SubjectNotDetected, FakeMasker, _source(), test_el_margen_anti_aliasing_no_sale_de_la_imagen(), test_extrae_bloque_con_crop_box() (+1 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.06
Nodes (100): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions() (+92 more)

### Community 4 - "MainActivity.kt"
Cohesion: 0.10
Nodes (3): MainActivity, WebChromeClient, saveImage()

### Community 5 - "Meme Studio Pro 🎭"
Cohesion: 0.11
Nodes (18): 1. Clonar o acceder al repositorio, 1. Docker (modo recomendado), 2. Crear y activar el entorno virtual de Python, 3. Instalar dependencias, 🏛️ Arquitectura del Proyecto, ✨ Características Principales, 🌐 Catálogo y Plantillas Virales, 🖼️ Composición y Edición de Imágenes (+10 more)

### Community 6 - "memestudio"
Cohesion: 0.10
Nodes (19): interval, retries, start_period, test, timeout, build, container_name, environment (+11 more)

### Community 8 - "Parar"
Cohesion: 0.15
Nodes (13): remove_bg(), 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM), 6. App Android (APK), 🔐 Acceso con usuario y contraseña, 🔍 Diagnóstico y Correcciones Recomendadas (+5 more)

### Community 12 - "create_app.py"
Cohesion: 0.16
Nodes (3): create_app(), _env_tuple(), RateLimiter

### Community 13 - "users.py"
Cohesion: 0.19
Nodes (9): _ensure_re(), hash_password(), validate_credentials(), test_hash_corrupto_no_infla_la_excepcion(), test_hash_sal_unica(), test_hash_verificado_roundtrip(), test_password_invalido(), test_usuario_invalido() (+1 more)

### Community 14 - "account_sqlite.py"
Cohesion: 0.12
Nodes (6): _connect(), InitializationError, SqliteAccountRepository, SqliteSessionStore, User, UsernameTaken

### Community 15 - "auth_support.py"
Cohesion: 0.10
Nodes (3): BackgroundMasker, DraftStore, UserRepository

### Community 16 - "config.py"
Cohesion: 0.17
Nodes (5): _load_dotenv(), load_settings(), _parse_auth_users(), Settings, _truthy()

### Community 17 - "assets/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 18 - "public/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 19 - "auth.py"
Cohesion: 0.15
Nodes (10): clear_session_cookie(), client_ip(), set_session_cookie(), RateLimitExceeded, AuthIn, build_auth_router(), login(), logout() (+2 more)

### Community 21 - "auth_support.py"
Cohesion: 0.16
Nodes (5): check_basic_auth(), ensure_same_origin(), session_user(), auth_gate(), SessionStore

### Community 22 - "graphify"
Cohesion: 0.29
Nodes (6): command, type, mcp, servers, $schema, graphify

### Community 23 - "bump_version.py"
Cohesion: 0.17
Nodes (12): bump_html_asset(), bump_subject_skip(), bump_sw_cache(), head_changed_files(), head_message(), install_hook(), main(), process_head() (+4 more)

### Community 30 - "Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)"
Cohesion: 0.18
Nodes (11): Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, 🏷️ Documentación / Tooling, 🧠 Flujo de Datos y Estado Global (`app.mjs`), ⚠️ Invariantes Críticos y Peculiaridades (Gotchas), 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario), ⚠️ Limitación crítica conocida (v1.1.0) (+3 more)

### Community 31 - "test_app_auth_flow.py"
Cohesion: 0.31
Nodes (8): _client(), _settings(), test_csrf_rechaza_origin_ajeno(), test_modo_abierto_por_defecto(), test_registro_cerrado(), test_registro_duplicado_y_login_mal(), test_registro_login_borrador_logout(), test_require_login_bloquea_api_pero_no_estaticos()

### Community 32 - "Meme Studio Pro — Aplicación Android (APK)"
Cohesion: 0.20
Nodes (10): Actualizar el frontend de la app, APK de release firmada, Bundle para Google Play (`.aab`), Compilar el APK, Meme Studio Pro — Aplicación Android (APK), Notas técnicas, Opción A — Android Studio (recomendada), Opción B — Línea de comandos (probada, sin Android Studio) (+2 more)

### Community 34 - "🔌 API del Backend"
Cohesion: 0.29
Nodes (7): 🔌 API del Backend, `GET /api/meme-image`, `GET /api/meme-search`, `GET /api/meme-search-reddit`, `GET /health`, `POST /api/draft` / `GET /api/draft`, `POST /api/remove-bg`

### Community 35 - "refresh_graph_docs.py"
Cohesion: 0.08
Nodes (13): CLI equivalente (útil para scripts), Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`), Regla de uso para agentes, ArcticShiftRedditCatalog, _http_json() (+5 more)

### Community 39 - "🤖 Documentación y Contexto para Agentes de IA"
Cohesion: 0.50
Nodes (4): Automatización por hooks de Git, Conectar un agente al grafo (resumen), 🤖 Documentación y Contexto para Agentes de IA, ¿Qué provisiona el repo?

### Community 42 - "⌨️ Guía de Uso y Atajos"
Cohesion: 0.67
Nodes (3): Autoguardado:, ⌨️ Guía de Uso y Atajos, Manipulación sobre el lienzo:

## Knowledge Gaps
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `🔌 API del Backend`, `⌨️ Guía de Uso y Atajos`, `README.md`, `🤖 Documentación y Contexto para Agentes de IA`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `create_app()` (e.g. with `InitializationError` and `.init_schema()`) actually correct?**
  _`create_app()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `meme_catalogs.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07505285412262157 - nodes in this community are weakly interconnected._
- **Why does `remove_bg()` connect `Parar` to `extract_subject`, `images.py`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `public/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.0575997515913678 - nodes in this community are weakly interconnected._
- **Why does `build_image_router()` connect `images.py` to `Parar`, `extract_subject`, `create_app.py`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `extract_subject` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._