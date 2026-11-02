# Graph Report - memes  (2026-11-02)

## Corpus Check
- 64 files · ~46,313 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .xml 7, (none) 5, .css 2)

## Summary
- 653 nodes · 1376 edges · 44 communities (24 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `92e98739`
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
- auth.py
- memes.py
- account_sqlite.py
- auth_support.py
- config.py
- assets/manifest.json
- public/manifest.json
- test_domain_users.py
- FileDraftStore
- auth_support.py
- graphify
- pathlib
- RembgBackgroundMasker
- draft_slug
- meme_catalogs.py
- build_auth_router
- ArcticShiftRedditCatalog
- ports/__init__.py
- refresh_graph_docs.py
- Meme Studio Pro — Aplicación Android (APK)
- 🔌 API del Backend
- ✨ Características Principales
- README.md
- assets/sw.js
- public/sw.js
- 🤖 Documentación y Contexto para Agentes de IA
- ⌨️ Guía de Uso y Atajos

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

## Communities (44 total, 20 thin omitted)

### Community 0 - "meme_catalogs.py"
Cohesion: 0.17
Nodes (11): build_imgflip_router(), meme_search(), build_reddit_router(), meme_search_reddit(), match_score(), normalize(), test_match_cero_cuando_ni_tocarse(), test_match_exacto_y_subcadena() (+3 more)

### Community 1 - "public/app.mjs"
Cohesion: 0.06
Nodes (95): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions() (+87 more)

### Community 2 - "extract_subject"
Cohesion: 0.09
Nodes (12): build_image_router(), remove_bg(), BackgroundMasker, CropBox, extract_subject(), SubjectNotDetected, 🔍 Diagnóstico y Correcciones Recomendadas, FakeMasker (+4 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.06
Nodes (95): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions() (+87 more)

### Community 5 - "Meme Studio Pro 🎭"
Cohesion: 0.18
Nodes (11): 1. Clonar o acceder al repositorio, 1. Docker (modo recomendado), 2. Crear y activar el entorno virtual de Python, 3. Instalar dependencias, 🏛️ Arquitectura del Proyecto, 🖥️ Cómo Ejecutar el Proyecto, 📁 Estructura de Archivos, 🚀 Instalación y Configuración (+3 more)

### Community 6 - "memestudio"
Cohesion: 0.10
Nodes (19): interval, retries, start_period, test, timeout, build, container_name, environment (+11 more)

### Community 8 - "Parar"
Cohesion: 0.20
Nodes (10): 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM), 6. App Android (APK), 🔐 Acceso con usuario y contraseña, 📲 Instalar como App (PWA), 👤 Login con cuentas (registro público; recomendado para despliegues públicos) (+2 more)

### Community 12 - "auth.py"
Cohesion: 0.18
Nodes (3): RateLimiter, RateLimitExceeded, AuthIn

### Community 14 - "account_sqlite.py"
Cohesion: 0.11
Nodes (6): _connect(), InitializationError, SqliteAccountRepository, SqliteSessionStore, User, UsernameTaken

### Community 15 - "auth_support.py"
Cohesion: 0.11
Nodes (3): BackgroundMasker, DraftStore, UserRepository

### Community 16 - "config.py"
Cohesion: 0.11
Nodes (13): _load_dotenv(), load_settings(), _parse_auth_users(), Settings, _truthy(), _client(), _settings(), test_csrf_rechaza_origin_ajeno() (+5 more)

### Community 17 - "assets/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 18 - "public/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 19 - "test_domain_users.py"
Cohesion: 0.20
Nodes (10): _ensure_re(), hash_password(), validate_credentials(), verify_password(), test_hash_corrupto_no_infla_la_excepcion(), test_hash_sal_unica(), test_hash_verificado_roundtrip(), test_password_invalido() (+2 more)

### Community 21 - "auth_support.py"
Cohesion: 0.18
Nodes (6): check_basic_auth(), ensure_same_origin(), session_user(), create_app(), auth_gate(), _env_tuple()

### Community 22 - "graphify"
Cohesion: 0.29
Nodes (6): command, type, mcp, servers, $schema, graphify

### Community 30 - "draft_slug"
Cohesion: 0.27
Nodes (4): build_draft_router(), draft_download(), draft_upload(), draft_slug()

### Community 32 - "build_auth_router"
Cohesion: 0.33
Nodes (7): clear_session_cookie(), client_ip(), set_session_cookie(), build_auth_router(), login(), logout(), register()

### Community 35 - "refresh_graph_docs.py"
Cohesion: 0.10
Nodes (20): CLI equivalente (útil para scripts), Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, Configuración actual, 🧠 Flujo de Datos y Estado Global (`app.mjs`), 📊 Graphify — Grafo de Conocimiento del Código (contexto primario) (+12 more)

### Community 36 - "Meme Studio Pro — Aplicación Android (APK)"
Cohesion: 0.25
Nodes (8): Actualizar el frontend de la app, Compilar el APK, Meme Studio Pro — Aplicación Android (APK), Notas técnicas, Opción A — Android Studio (recomendada), Opción B — Línea de comandos, Qué funciona y qué no dentro del móvil, Servidor IA opcional (quitar fondo real en Android)

### Community 37 - "🔌 API del Backend"
Cohesion: 0.29
Nodes (7): 🔌 API del Backend, `GET /api/meme-image`, `GET /api/meme-search`, `GET /api/meme-search-reddit`, `GET /health`, `POST /api/draft` / `GET /api/draft`, `POST /api/remove-bg`

### Community 38 - "✨ Características Principales"
Cohesion: 0.29
Nodes (7): ✨ Características Principales, 🌐 Catálogo y Plantillas Virales, 🖼️ Composición y Edición de Imágenes, 🪄 Eliminación de Fondo (Doble Modo), 🧹 Limpiador de Memes e Inpainting, 🏷️ Marca de Agua y Exportación, 🔤 Tipografía y Capas de Texto

### Community 42 - "🤖 Documentación y Contexto para Agentes de IA"
Cohesion: 0.50
Nodes (4): Automatización por hooks de Git, Conectar un agente al grafo (resumen), 🤖 Documentación y Contexto para Agentes de IA, ¿Qué provisiona el repo?

### Community 43 - "⌨️ Guía de Uso y Atajos"
Cohesion: 0.67
Nodes (3): Autoguardado:, ⌨️ Guía de Uso y Atajos, Manipulación sobre el lienzo:

## Knowledge Gaps
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `extract_subject`, `🔌 API del Backend`, `README.md`, `🤖 Documentación y Contexto para Agentes de IA`, `⌨️ Guía de Uso y Atajos`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `create_app()` (e.g. with `InitializationError` and `.init_schema()`) actually correct?**
  _`create_app()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `public/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06082229018008835 - nodes in this community are weakly interconnected._
- **Why does `build_image_router()` connect `extract_subject` to `auth_support.py`, `pathlib`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `extract_subject` be split into smaller, more focused modules?**
  _Cohesion score 0.08888888888888889 - nodes in this community are weakly interconnected._
- **Should `assets/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.0638536221060493 - nodes in this community are weakly interconnected._
- **Should `MainActivity.kt` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._