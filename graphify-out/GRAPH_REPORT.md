# Graph Report - memes  (2026-11-02)

## Corpus Check
- 69 files · ~55,239 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 38 file(s) not represented in the graph (top: .xml 8, .bin 7, .properties 6)

## Summary
- 728 nodes · 1529 edges · 39 communities (19 shown, 20 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5236017d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- match_score
- public/app.mjs
- extract_subject
- assets/app.mjs
- MainActivity.kt
- Meme Studio Pro 🎭
- memestudio
- install_graphify_hooks.sh
- Parar
- memes.py
- meme_catalogs.py
- auth.py
- auth_support.py
- config.py
- assets/manifest.json
- public/manifest.json
- draft_slug
- images.py
- auth_support.py
- graphify
- bump_version.py
- build_apk.sh
- ArcticShiftRedditCatalog
- android_bridge.test.mjs
- refresh_graph_docs.py
- RembgBackgroundMasker
- podman_publish.sh
- assets/sw.js
- public/sw.js

## God Nodes (most connected - your core abstractions)
1. `initEvents()` - 47 edges
2. `initEvents()` - 47 edges
3. `$` - 36 edges
4. `$` - 36 edges
5. `create_app()` - 29 edges
6. `toast()` - 21 edges
7. `toast()` - 21 edges
8. `schedule()` - 20 edges
9. `schedule()` - 20 edges
10. `sync()` - 19 edges

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

## Communities (39 total, 20 thin omitted)

### Community 0 - "match_score"
Cohesion: 0.18
Nodes (10): build_imgflip_router(), meme_search(), build_reddit_router(), meme_search_reddit(), match_score(), normalize(), test_match_cero_cuando_ni_tocarse(), test_match_exacto_y_subcadena() (+2 more)

### Community 1 - "public/app.mjs"
Cohesion: 0.06
Nodes (106): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyView(), applyWatermarkPreset(), authErrorMessage() (+98 more)

### Community 2 - "extract_subject"
Cohesion: 0.14
Nodes (9): BackgroundMasker, CropBox, extract_subject(), SubjectNotDetected, FakeMasker, _source(), test_el_margen_anti_aliasing_no_sale_de_la_imagen(), test_extrae_bloque_con_crop_box() (+1 more)

### Community 3 - "assets/app.mjs"
Cohesion: 0.06
Nodes (108): addImage(), appendTemplateSet(), applyClean(), applyCrop(), applyRatio(), applyView(), applyWatermarkPreset(), authErrorMessage() (+100 more)

### Community 4 - "MainActivity.kt"
Cohesion: 0.10
Nodes (3): MainActivity, WebChromeClient, saveImage()

### Community 5 - "Meme Studio Pro 🎭"
Cohesion: 0.06
Nodes (33): Actualizar el frontend de la app, APK de release firmada, Bundle para Google Play (`.aab`), Compilar el APK, Meme Studio Pro — Aplicación Android (APK), Notas técnicas, Opción A — Android Studio (recomendada), Opción B — Línea de comandos (probada, sin Android Studio) (+25 more)

### Community 6 - "memestudio"
Cohesion: 0.10
Nodes (19): interval, retries, start_period, test, timeout, build, container_name, environment (+11 more)

### Community 8 - "Parar"
Cohesion: 0.07
Nodes (28): remove_bg(), 2. Servidor Local sin Docker (desarrollo), 3. Frontend Independiente (Obsoleto), 4. Script CLI Independiente, 5. Ejecución en Raspberry Pi (o ARM), 6. App Android (APK / Play Store), 🔐 Acceso con usuario y contraseña, 🔌 API del Backend (+20 more)

### Community 14 - "auth.py"
Cohesion: 0.06
Nodes (27): _connect(), InitializationError, SqliteAccountRepository, SqliteSessionStore, clear_session_cookie(), client_ip(), set_session_cookie(), RateLimitExceeded (+19 more)

### Community 15 - "auth_support.py"
Cohesion: 0.08
Nodes (4): BackgroundMasker, DraftStore, SessionStore, UserRepository

### Community 16 - "config.py"
Cohesion: 0.14
Nodes (13): _load_dotenv(), load_settings(), _parse_auth_users(), Settings, _truthy(), _client(), _settings(), test_csrf_rechaza_origin_ajeno() (+5 more)

### Community 17 - "assets/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 18 - "public/manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, lang, name, orientation, scope (+3 more)

### Community 19 - "draft_slug"
Cohesion: 0.28
Nodes (5): build_draft_router(), draft_download(), draft_upload(), draft_slug(), test_slug_saneado_para_archivo()

### Community 21 - "auth_support.py"
Cohesion: 0.18
Nodes (6): check_basic_auth(), ensure_same_origin(), session_user(), create_app(), auth_gate(), _env_tuple()

### Community 22 - "graphify"
Cohesion: 0.29
Nodes (6): command, type, mcp, servers, $schema, graphify

### Community 23 - "bump_version.py"
Cohesion: 0.10
Nodes (13): FileDraftStore, bump_html_asset(), bump_subject_skip(), bump_sw_cache(), head_changed_files(), head_message(), install_hook(), main() (+5 more)

### Community 32 - "android_bridge.test.mjs"
Cohesion: 0.16
Nodes (5): dilateMask(), inpaint(), kt, mjs, ROOT

### Community 35 - "refresh_graph_docs.py"
Cohesion: 0.10
Nodes (21): CLI equivalente (útil para scripts), Comandos, 🛠️ Comandos de Desarrollo Frecuentes, Conectarse al grafo por MCP (otros agentes y clientes), Configuración actual, Configuración actual, 🏷️ Documentación / Tooling, 🧠 Flujo de Datos y Estado Global (`app.mjs`) (+13 more)

## Knowledge Gaps
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Parar` connect `Parar` to `Meme Studio Pro 🎭`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `create_app()` (e.g. with `InitializationError` and `.init_schema()`) actually correct?**
  _`create_app()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `public/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.057971014492753624 - nodes in this community are weakly interconnected._
- **Why does `build_image_router()` connect `images.py` to `Parar`, `extract_subject`, `auth_support.py`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `extract_subject` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._
- **Why does `remove_bg()` connect `Parar` to `extract_subject`, `images.py`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `assets/app.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05585027998821102 - nodes in this community are weakly interconnected._