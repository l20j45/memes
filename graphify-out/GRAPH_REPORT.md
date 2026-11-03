# Graph Report - memes  (2026-11-03)

## Corpus Check
- 69 files · ~57,593 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 42 file(s) not represented in the graph (top: .xml 8, .bin 7, .properties 6)

## Summary
- 738 nodes · 1561 edges · 46 communities (28 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `059611b5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- match_score
- public/app.mjs
- test_app_auth_flow.py
- assets/app.mjs
- MainActivity.kt
- Meme Studio Pro 🎭
- memestudio
- install_graphify_hooks.sh
- Parar
- memes.py
- meme_catalogs.py
- account_sqlite.py
- ports/__init__.py
- assets/manifest.json
- public/manifest.json
- draft_slug
- images.py
- auth_support.py
- graphify
- bump_version.py
- build_apk.sh
- ArcticShiftRedditCatalog
- users.py
- android_bridge.test.mjs
- auth.py
- Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)
- refresh_graph_docs.py
- RembgBackgroundMasker
- podman_publish.sh
- assets/sw.js
- public/sw.js
- Meme Studio Pro — Aplicación Android (APK)
- README.md
- create_app
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
- `Herramientas MCP (prefijo `graphify_`)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `Conectarse al grafo por MCP (otros agentes y clientes)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `📊 Graphify — Grafo de Conocimiento del Código (contexto primario)` --references--> `graph_stats()`  [INFERRED]
  AGENTS.md → tools/refresh_graph_docs.py
- `Auth (`REQUIRE_LOGIN=1`): `POST /api/auth/register` · `/api/auth/login` · `/api/auth/logout` · `GET /api/auth/me`` --references--> `login()`  [INFERRED]
  README.md → memestudio/app/routers/auth.py

## Import Cycles
- None detected.

## Communities (46 total, 18 thin omitted)

### Community 0 - "match_score"
Cohesion: 0.17
Nodes (11): build_imgflip_router(), meme_search(), build_reddit_router(), meme_search_reddit(), match_score(), normalize(), test_match_cero_cuando_ni_tocarse(), test_match_exacto_y_subcadena() (+3 more)

### Community 1 - "public/app.mjs"
Cohesion: 0.05
Nodes (113): addImage(), addShape(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyView(), applyWatermarkPreset() (+105 more)

### Community 2 - "test_app_auth_flow.py"
Cohesion: 0.07
Nodes (22): _load_dotenv(), load_settings(), _parse_auth_users(), Settings, _truthy(), BackgroundMasker, CropBox, extract_subject() (+14 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.05
Nodes (113): addImage(), addShape(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyView(), applyWatermarkPreset() (+105 more)

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
Cohesion: 0.14
Nodes (14): remove_bg(), 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM), 6. App Android (APK / Play Store), 🔐 Acceso con usuario y contraseña, 🔍 Diagnóstico y Correcciones Recomendadas (+6 more)

### Community 14 - "account_sqlite.py"
Cohesion: 0.14
Nodes (5): _connect(), SqliteAccountRepository, SqliteSessionStore, User, UsernameTaken

### Community 15 - "ports/__init__.py"
Cohesion: 0.08
Nodes (4): BackgroundMasker, DraftStore, SessionStore, UserRepository

### Community 17 - "assets/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 18 - "public/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 19 - "draft_slug"
Cohesion: 0.29
Nodes (4): build_draft_router(), draft_download(), draft_upload(), draft_slug()

### Community 20 - "images.py"
Cohesion: 0.10
Nodes (3): RateLimiter, RateLimitExceeded, build_image_router()

### Community 21 - "auth_support.py"
Cohesion: 0.25
Nodes (4): check_basic_auth(), ensure_same_origin(), session_user(), auth_gate()

### Community 22 - "graphify"
Cohesion: 0.29
Nodes (6): command, type, mcp, servers, $schema, graphify

### Community 23 - "bump_version.py"
Cohesion: 0.10
Nodes (13): FileDraftStore, bump_html_asset(), bump_subject_skip(), bump_sw_cache(), head_changed_files(), head_message(), install_hook(), main() (+5 more)

### Community 31 - "users.py"
Cohesion: 0.20
Nodes (10): _ensure_re(), hash_password(), validate_credentials(), verify_password(), test_hash_corrupto_no_infla_la_excepcion(), test_hash_sal_unica(), test_hash_verificado_roundtrip(), test_password_invalido() (+2 more)

### Community 32 - "android_bridge.test.mjs"
Cohesion: 0.29
Nodes (3): kt, mjs, ROOT

### Community 33 - "auth.py"
Cohesion: 0.20
Nodes (10): clear_session_cookie(), client_ip(), set_session_cookie(), AuthIn, build_auth_router(), login(), logout(), me() (+2 more)

### Community 34 - "Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)"
Cohesion: 0.17
Nodes (11): Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, 🏷️ Documentación / Tooling, 🧠 Flujo de Datos y Estado Global (`app.mjs`), ⚠️ Invariantes Críticos y Peculiaridades (Gotchas), 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario), ⚠️ Limitación crítica conocida (v1.1.0) (+3 more)

### Community 35 - "refresh_graph_docs.py"
Cohesion: 0.19
Nodes (10): CLI equivalente (útil para scripts), Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`), Regla de uso para agentes, graph_stats(), main() (+2 more)

### Community 44 - "Meme Studio Pro — Aplicación Android (APK)"
Cohesion: 0.20
Nodes (10): Actualizar el frontend de la app, APK de release firmada, Bundle para Google Play (`.aab`), Compilar el APK, Meme Studio Pro — Aplicación Android (APK), Notas técnicas, Opción A — Android Studio (recomendada), Opción B — Línea de comandos (probada, sin Android Studio) (+2 more)

### Community 45 - "README.md"
Cohesion: 0.29
Nodes (5): Ver logs, Descargar e instalar, Detalles de la build, 📱 Releases de Meme Studio Pro (APK), Verificación de integridad (SHA-256)

### Community 46 - "create_app"
Cohesion: 0.18
Nodes (4): InitializationError, ImgflipCatalog, create_app(), _env_tuple()

### Community 47 - "🔌 API del Backend"
Cohesion: 0.29
Nodes (7): 🔌 API del Backend, `GET /api/meme-image`, `GET /api/meme-search`, `GET /api/meme-search-reddit`, `GET /health`, `POST /api/draft` / `GET /api/draft`, `POST /api/remove-bg`

### Community 49 - "🤖 Documentación y Contexto para Agentes de IA"
Cohesion: 0.50
Nodes (4): Automatización por hooks de Git, Conectar un agente al grafo (resumen), 🤖 Documentación y Contexto para Agentes de IA, ¿Qué provisiona el repo?

### Community 50 - "⌨️ Guía de Uso y Atajos"
Cohesion: 0.67
Nodes (3): Autoguardado:, ⌨️ Guía de Uso y Atajos, Manipulación sobre el lienzo:

## Knowledge Gaps
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `🤖 Documentación y Contexto para Agentes de IA`, `⌨️ Guía de Uso y Atajos`, `README.md`, `🔌 API del Backend`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `create_app()` (e.g. with `InitializationError` and `.init_schema()`) actually correct?**
  _`create_app()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `public/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.051368578927634044 - nodes in this community are weakly interconnected._
- **Why does `build_image_router()` connect `images.py` to `Parar`, `test_app_auth_flow.py`, `create_app`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `test_app_auth_flow.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06914893617021277 - nodes in this community are weakly interconnected._
- **Why does `remove_bg()` connect `Parar` to `test_app_auth_flow.py`, `images.py`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `assets/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.053515783769136974 - nodes in this community are weakly interconnected._