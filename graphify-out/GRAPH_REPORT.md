# Graph Report - memes  (2026-11-03)

## Corpus Check
- 71 files · ~58,467 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 43 file(s) not represented in the graph (top: .xml 8, .bin 7, .properties 6)

## Summary
- 746 nodes · 1571 edges · 40 communities (22 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2e68795a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- memes.py
- public/app.mjs
- extract_subject
- assets/app.mjs
- MainActivity.kt
- Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)
- memestudio
- install_graphify_hooks.sh
- Parar
- config.py
- test_app_auth_flow.py
- account_sqlite.py
- ports/__init__.py
- FileDraftStore
- assets/manifest.json
- public/manifest.json
- run.sh
- images.py
- auth_support.py
- graphify
- bump_version.py
- build_apk.sh
- memestudio
- users.py
- android_bridge.test.mjs
- auth.py
- meme_catalogs.py
- RembgBackgroundMasker
- podman_publish.sh
- assets/sw.js
- public/sw.js

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

## Communities (40 total, 18 thin omitted)

### Community 0 - "memes.py"
Cohesion: 0.07
Nodes (17): ImageProxy, WrongImageSource, build_draft_router(), draft_download(), draft_upload(), build_imgflip_router(), meme_search(), build_reddit_router() (+9 more)

### Community 1 - "public/app.mjs"
Cohesion: 0.06
Nodes (111): addImage(), addShape(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyView(), applyWatermarkPreset() (+103 more)

### Community 2 - "extract_subject"
Cohesion: 0.10
Nodes (12): build_image_router(), remove_bg(), BackgroundMasker, CropBox, extract_subject(), SubjectNotDetected, 🔍 Diagnóstico y Correcciones Recomendadas, FakeMasker (+4 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.05
Nodes (113): addImage(), addShape(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyView(), applyWatermarkPreset() (+105 more)

### Community 4 - "MainActivity.kt"
Cohesion: 0.10
Nodes (3): MainActivity, WebChromeClient, saveImage()

### Community 5 - "Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)"
Cohesion: 0.04
Nodes (45): Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, 🏷️ Documentación / Tooling, 🧠 Flujo de Datos y Estado Global (`app.mjs`), ⚠️ Invariantes Críticos y Peculiaridades (Gotchas), 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario), ⚠️ Limitación crítica conocida (v1.1.0) (+37 more)

### Community 6 - "memestudio"
Cohesion: 0.10
Nodes (19): interval, retries, start_period, test, timeout, build, container_name, environment (+11 more)

### Community 8 - "Parar"
Cohesion: 0.08
Nodes (26): 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM), 6. App Android (APK / Play Store), 🔐 Acceso con usuario y contraseña, 🔌 API del Backend, Autoguardado: (+18 more)

### Community 12 - "config.py"
Cohesion: 0.17
Nodes (5): _load_dotenv(), load_settings(), _parse_auth_users(), Settings, _truthy()

### Community 13 - "test_app_auth_flow.py"
Cohesion: 0.31
Nodes (8): _client(), _settings(), test_csrf_rechaza_origin_ajeno(), test_modo_abierto_por_defecto(), test_registro_cerrado(), test_registro_duplicado_y_login_mal(), test_registro_login_borrador_logout(), test_require_login_bloquea_api_pero_no_estaticos()

### Community 14 - "account_sqlite.py"
Cohesion: 0.12
Nodes (6): _connect(), InitializationError, SqliteAccountRepository, SqliteSessionStore, User, UsernameTaken

### Community 15 - "ports/__init__.py"
Cohesion: 0.08
Nodes (4): BackgroundMasker, DraftStore, SessionStore, UserRepository

### Community 17 - "assets/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 18 - "public/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 19 - "run.sh"
Cohesion: 0.60
Nodes (5): ensure_env(), health(), pick_python(), server_pids(), run.sh script

### Community 21 - "auth_support.py"
Cohesion: 0.18
Nodes (6): check_basic_auth(), ensure_same_origin(), session_user(), create_app(), auth_gate(), _env_tuple()

### Community 22 - "graphify"
Cohesion: 0.29
Nodes (6): command, type, mcp, servers, $schema, graphify

### Community 23 - "bump_version.py"
Cohesion: 0.17
Nodes (12): bump_html_asset(), bump_subject_skip(), bump_sw_cache(), head_changed_files(), head_message(), install_hook(), main(), process_head() (+4 more)

### Community 31 - "users.py"
Cohesion: 0.18
Nodes (10): _ensure_re(), hash_password(), validate_credentials(), verify_password(), test_hash_corrupto_no_infla_la_excepcion(), test_hash_sal_unica(), test_hash_verificado_roundtrip(), test_password_invalido() (+2 more)

### Community 32 - "android_bridge.test.mjs"
Cohesion: 0.16
Nodes (5): dilateMask(), inpaint(), kt, mjs, ROOT

### Community 33 - "auth.py"
Cohesion: 0.22
Nodes (10): clear_session_cookie(), client_ip(), set_session_cookie(), AuthIn, build_auth_router(), login(), logout(), me() (+2 more)

### Community 35 - "meme_catalogs.py"
Cohesion: 0.08
Nodes (13): CLI equivalente (útil para scripts), Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`), Regla de uso para agentes, ArcticShiftRedditCatalog, _http_json() (+5 more)

## Knowledge Gaps
- **1 isolated node(s):** `memestudio`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 264 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `extract_subject`, `Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `create_app()` (e.g. with `InitializationError` and `.init_schema()`) actually correct?**
  _`create_app()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `memestudio` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `memes.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07123034227567067 - nodes in this community are weakly interconnected._
- **Why does `build_image_router()` connect `extract_subject` to `images.py`, `auth_support.py`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `public/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05546218487394958 - nodes in this community are weakly interconnected._
- **Should `extract_subject` be split into smaller, more focused modules?**
  _Cohesion score 0.09848484848484848 - nodes in this community are weakly interconnected._