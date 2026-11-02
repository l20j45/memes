# Graph Report - memes  (2026-11-02)

## Corpus Check
- 65 files · ~50,150 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .xml 7, (none) 5, .css 2)

## Summary
- 682 nodes · 1444 edges · 32 communities (19 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd375026`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- meme_catalogs.py
- public/app.mjs
- extract_subject
- assets/app.mjs
- MainActivity.kt
- Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)
- memestudio
- install_graphify_hooks.sh
- Parar
- auth.py
- account_sqlite.py
- auth_support.py
- config.py
- assets/manifest.json
- public/manifest.json
- test_domain_users.py
- auth_support.py
- graphify
- bump_version.py
- SessionStore
- build_auth_router
- meme_catalogs.py
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

## Communities (32 total, 13 thin omitted)

### Community 0 - "meme_catalogs.py"
Cohesion: 0.07
Nodes (17): ImageProxy, WrongImageSource, build_draft_router(), draft_download(), draft_upload(), build_imgflip_router(), meme_search(), build_reddit_router() (+9 more)

### Community 1 - "public/app.mjs"
Cohesion: 0.06
Nodes (100): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions() (+92 more)

### Community 2 - "extract_subject"
Cohesion: 0.08
Nodes (13): RembgBackgroundMasker, build_image_router(), remove_bg(), BackgroundMasker, CropBox, extract_subject(), SubjectNotDetected, 🔍 Diagnóstico y Correcciones Recomendadas (+5 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.06
Nodes (100): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyWatermarkPreset(), authErrorMessage(), bindAccordions() (+92 more)

### Community 5 - "Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)"
Cohesion: 0.05
Nodes (37): Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Configuración actual, 🧠 Flujo de Datos y Estado Global (`app.mjs`), ⚠️ Invariantes Críticos y Peculiaridades (Gotchas), 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario), ⚠️ Limitación crítica conocida (v1.1.0), 🏗️ Mapa de Archivos y Responsabilidades (+29 more)

### Community 6 - "memestudio"
Cohesion: 0.10
Nodes (19): interval, retries, start_period, test, timeout, build, container_name, environment (+11 more)

### Community 8 - "Parar"
Cohesion: 0.08
Nodes (24): 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM), 6. App Android (APK), 🔐 Acceso con usuario y contraseña, 🔌 API del Backend, Autoguardado: (+16 more)

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
Nodes (12): _load_dotenv(), load_settings(), _parse_auth_users(), _truthy(), _client(), _settings(), test_csrf_rechaza_origin_ajeno(), test_modo_abierto_por_defecto() (+4 more)

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
Cohesion: 0.15
Nodes (7): check_basic_auth(), ensure_same_origin(), session_user(), create_app(), auth_gate(), _env_tuple(), Settings

### Community 22 - "graphify"
Cohesion: 0.29
Nodes (6): command, type, mcp, servers, $schema, graphify

### Community 23 - "bump_version.py"
Cohesion: 0.10
Nodes (13): FileDraftStore, bump_html_asset(), bump_subject_skip(), bump_sw_cache(), head_changed_files(), head_message(), install_hook(), main() (+5 more)

### Community 32 - "build_auth_router"
Cohesion: 0.33
Nodes (7): clear_session_cookie(), client_ip(), set_session_cookie(), build_auth_router(), login(), logout(), register()

### Community 35 - "meme_catalogs.py"
Cohesion: 0.08
Nodes (13): CLI equivalente (útil para scripts), Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, 📊 Graphify — Grafo de Conocimiento del Código (contexto primario), Herramientas MCP (prefijo `graphify_`), Regla de uso para agentes, ArcticShiftRedditCatalog, _http_json() (+5 more)

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `extract_subject`, `Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `create_app()` (e.g. with `InitializationError` and `.init_schema()`) actually correct?**
  _`create_app()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `meme_catalogs.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07123034227567067 - nodes in this community are weakly interconnected._
- **Why does `build_image_router()` connect `extract_subject` to `auth_support.py`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `public/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.0575997515913678 - nodes in this community are weakly interconnected._
- **Should `extract_subject` be split into smaller, more focused modules?**
  _Cohesion score 0.07560975609756097 - nodes in this community are weakly interconnected._
- **Should `assets/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06031260618416582 - nodes in this community are weakly interconnected._