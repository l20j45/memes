# Graph Report - memes  (2026-11-02)

## Corpus Check
- 64 files · ~49,171 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .xml 7, (none) 5, .css 2)

## Summary
- 663 nodes · 1402 edges · 36 communities (17 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8d060b94`
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
- test_app_auth_flow.py
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
- build_auth_router
- ArcticShiftRedditCatalog
- ports/__init__.py
- refresh_graph_docs.py
- assets/sw.js
- public/sw.js

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

## Communities (36 total, 19 thin omitted)

### Community 0 - "meme_catalogs.py"
Cohesion: 0.06
Nodes (19): ImageProxy, WrongImageSource, _http_json(), ImgflipCatalog, build_draft_router(), draft_download(), draft_upload(), build_imgflip_router() (+11 more)

### Community 1 - "public/app.mjs"
Cohesion: 0.06
Nodes (100): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions() (+92 more)

### Community 2 - "extract_subject"
Cohesion: 0.14
Nodes (9): BackgroundMasker, CropBox, extract_subject(), SubjectNotDetected, FakeMasker, _source(), test_el_margen_anti_aliasing_no_sale_de_la_imagen(), test_extrae_bloque_con_crop_box() (+1 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.06
Nodes (100): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions() (+92 more)

### Community 5 - "Meme Studio Pro 🎭"
Cohesion: 0.07
Nodes (27): Actualizar el frontend de la app, Compilar el APK, Meme Studio Pro — Aplicación Android (APK), Notas técnicas, Opción A — Android Studio (recomendada), Opción B — Línea de comandos, Qué funciona y qué no dentro del móvil, Servidor IA opcional (quitar fondo real en Android) (+19 more)

### Community 6 - "memestudio"
Cohesion: 0.10
Nodes (19): interval, retries, start_period, test, timeout, build, container_name, environment (+11 more)

### Community 8 - "Parar"
Cohesion: 0.08
Nodes (26): remove_bg(), 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM), 6. App Android (APK), 🔐 Acceso con usuario y contraseña, 🔌 API del Backend (+18 more)

### Community 13 - "test_app_auth_flow.py"
Cohesion: 0.31
Nodes (8): _client(), _settings(), test_csrf_rechaza_origin_ajeno(), test_modo_abierto_por_defecto(), test_registro_cerrado(), test_registro_duplicado_y_login_mal(), test_registro_login_borrador_logout(), test_require_login_bloquea_api_pero_no_estaticos()

### Community 14 - "account_sqlite.py"
Cohesion: 0.13
Nodes (5): _connect(), InitializationError, SqliteAccountRepository, SqliteSessionStore, UsernameTaken

### Community 16 - "config.py"
Cohesion: 0.17
Nodes (5): _load_dotenv(), load_settings(), _parse_auth_users(), Settings, _truthy()

### Community 17 - "assets/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 18 - "public/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 19 - "test_domain_users.py"
Cohesion: 0.18
Nodes (10): _ensure_re(), hash_password(), validate_credentials(), verify_password(), test_hash_corrupto_no_infla_la_excepcion(), test_hash_sal_unica(), test_hash_verificado_roundtrip(), test_password_invalido() (+2 more)

### Community 21 - "auth_support.py"
Cohesion: 0.13
Nodes (7): check_basic_auth(), ensure_same_origin(), session_user(), create_app(), auth_gate(), _env_tuple(), SessionStore

### Community 22 - "graphify"
Cohesion: 0.29
Nodes (6): command, type, mcp, servers, $schema, graphify

### Community 32 - "build_auth_router"
Cohesion: 0.16
Nodes (9): clear_session_cookie(), client_ip(), set_session_cookie(), RateLimitExceeded, AuthIn, build_auth_router(), login(), logout() (+1 more)

### Community 35 - "refresh_graph_docs.py"
Cohesion: 0.10
Nodes (20): CLI equivalente (útil para scripts), Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, Configuración actual, 🧠 Flujo de Datos y Estado Global (`app.mjs`), 📊 Graphify — Grafo de Conocimiento del Código (contexto primario) (+12 more)

## Knowledge Gaps
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `Meme Studio Pro 🎭`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `create_app()` (e.g. with `InitializationError` and `.init_schema()`) actually correct?**
  _`create_app()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `meme_catalogs.py` be split into smaller, more focused modules?**
  _Cohesion score 0.056107539450613676 - nodes in this community are weakly interconnected._
- **Why does `remove_bg()` connect `Parar` to `extract_subject`, `create_app.py`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `public/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.0575997515913678 - nodes in this community are weakly interconnected._
- **Why does `build_image_router()` connect `create_app.py` to `Parar`, `extract_subject`, `auth_support.py`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `extract_subject` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._