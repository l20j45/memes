# Meme Studio Pro - Directrices y Contexto para Agentes (AGENTS.md)

Este documento describe la arquitectura, flujo de datos, convenciones y peculiaridades técnicas de este repositorio para asistir a agentes de inteligencia artificial y desarrolladores en futuras modificaciones.

---

## 🧭 Visión General del Proyecto

**Meme Studio Pro** es una aplicación web interactiva que funciona como una estación completa para diseñar, personalizar, restaurar y exportar memes. Combina un cliente ligero en JavaScript nativo con Canvas 2D y un microservicio en Python para inferencia con modelos de visión por computador (segmentación de fondos).

- **Frontend:** Vanilla HTML5, CSS3 y JavaScript moderno con ES Modules (`app.mjs`). No utiliza frameworks pesados ni empaquetadores (webpack, vite, rollup).
- **Backend:** Python con FastAPI y `rembg` (respaldado por el runtime ONNX de U2-Net) corriendo en el puerto 5005.

---

## 🏗️ Mapa de Archivos y Responsabilidades

| Archivo | Responsabilidad Principal |
| :--- | :--- |
| `memegnerator.html` | Estructura de la aplicación, panel lateral de acordeones, controles y canvas. |
| `app.mjs` | Núcleo de lógica: bucle de dibujo de Canvas, manejador de transformaciones (handles), historial Undo/Redo, inpainting de trazos y comunicación con APIs. |
| `styles.css` | Esquema de diseño en modo oscuro, estilos de botones, acordeones y media queries responsivas. |
| `server.py` | Servidor FastAPI con el endpoint `/api/remove-bg` para quitar fondos mediante IA. |
| `requirements.txt` | Dependencias Python requeridas (`fastapi`, `uvicorn[standard]`, `rembg[cpu]`, `pillow`). |
| `Dockerfile` | Imagen única multi-arch (x86/ARM, base `python:3.11-slim`); CMD `python server.py`. |
| `docker-compose.yml` | Servicio `memestudio`: mapeo `${HOST_PORT:-5005}:5005`, volumen `models` (persistencia del caché de modelos rembg en `~/.u2net` y `~/.rembg`), healthcheck vía `/health` e inyección de la config desde `.env` (REMBG_MODEL, CORS_ORIGINS, REDDIT_SUBS, REDDIT_TERMS, MEME_CACHE_TTL, IMG_CACHE_MAX). |
| `.dockerignore` | Excluye del contexto de build: `.git`, `.venv`, `.kindex/`, `graphify-out/`, `tools/`, docs, cachés. |
| `.env.example` | Plantilla de configuración: REMBG_MODEL, PORT/HOST/HOST_PORT, CORS_ORIGINS, REDDIT_SUBS, REDDIT_TERMS, MEME_CACHE_TTL, IMG_CACHE_MAX. Copiar a `.env` (ignorado por Git); lo leen `server.py` (loader propio sin deps) y `docker compose`. En Docker el contenedor siempre escucha 0.0.0.0:5005; `HOST_PORT` cambia solo el mapeo. |
| `android/` | App Android (APK): WebView Kotlin que empaqueta el frontend web como assets (una sola base de código, sin port RN/Flutter). Ver `android/README_ANDROID.md`. |
| `android/app/src/main/java/.../MainActivity.kt` | WebView con ES modules sobre `file://` (flags de acceso a archivos) + bridge `window.AndroidSaver.saveImage(dataUrl, filename)` que guarda en la galería via MediaStore. |
| `android/app/src/main/assets/` | Copia del frontend: re-sincronizar con `Copy-Item memegnerator.html, app.mjs, styles.css, index.html android\app\src\main\assets\ -Force` tras cada cambio web (y subir `?v=N`). |
| `tools/remove_bg.py` | Script de línea de comandos para quitar fondos a imágenes individuales. |
| `tools/remove_bg.bat` | Script batch para invocar `tools/remove_bg.py` en entornos Windows. |
| `tools/refresh_graph_docs.py` | Hook helper: sincroniza el bloque de estadísticas de Graphify en `AGENTS.md` con `graphify-out/graph.json` tras cada commit/cambio de rama. |
| `README.md` | Documentación para usuarios finales y desarrolladores humanos. |
| `AGENTS.md` | Guía de contexto, arquitectura e invariantes para agentes de IA. |
| `.kindex/` | Índice de conocimiento de código (KIndex): base de datos de símbolos, grafos arquitectónicos y binario CLI. Regenerable; ignorado por Git. |
| `graphify-out/` | Grafo de conocimiento del proyecto (Graphify): `graph.json` (grafo indexado vía MCP), `GRAPH_REPORT.md` y cachés. Se actualiza automáticamente con hooks de Git. |
| `opencode.json` | Configuración de OpenCode del proyecto: registra el servidor MCP `graphify` (grafo local, 10 herramientas). |

---

## 🧠 Flujo de Datos y Estado Global (`app.mjs`)

El estado de la aplicación reside en el objeto singleton `state`:
- `state.art`: Dimensiones efectivas del lienzo de dibujo (`{ w, h }`).
- `state.orig`: Dimensiones de la imagen base original.
- `state.imgs`: Lista de capas de imágenes cargadas. Cada imagen almacena su propio canvas auxiliar `m.c`, posición normalizada `m.x`, `m.y` (0 a 1), ancho relativo `m.w`, factor de escala vertical `m.sy`, máscara de borrador `m.mask` y filtro visual.
- `state.layers`: Lista de capas de texto. Cada una contiene texto `t`, posición `x, y`, tamaño base `s`, fuente `f`, relleno `fill`, borde `stroke`, ancho de borde `sw`, alineación `align`, sombra, opacidad y bloqueo `locked`.
- `state.wm`: Configuración de la marca de agua (habilitada, texto, posición relativa, estilo).
- `state.history` / `state.hIndex`: Cola circular de estados serializados en JSON para el sistema de Deshacer/Rehacer (capacidad máxima: 25 estados).

---

## ⚠️ Invariantes Críticos y Peculiaridades (Gotchas)

1. **Servidor HTTP obligatorio (no `file://`); despliegue en Docker:**
   - La aplicación no debe probarse abriendo directamente el HTML con el protocolo `file://`, ya que los navegadores bloquean la importación de `<script type="module" src="./app.mjs">`. Debe ejecutarse como una única app vía `python server.py`, que sirve el frontend y la API integrados en FastAPI (puerto 5005).
   - **El despliegue previsto es en contenedor Docker**: `docker compose up -d --build` (ver `Dockerfile` y `docker-compose.yml`). El Dockerfile copia solo `server.py`, `memegnerator.html`, `app.mjs`, `styles.css` y `requirements.txt`; si se añade un nuevo archivo de frontend hay que incluirlo en el `COPY` (o relajar el `.dockerignore`).
   - Dentro del contenedor la detección ARM sigue funcionando (`platform.machine()` no se virtualiza en Docker sin emulación); el caché de modelos debe persistirse con el volumen `models` (montado en `/root/.u2net` y `/root/.rembg`) o cada reinicio re-descargará los pesos.

2. **Canvas y CORS (Tainted Canvas):**
   - Cuando se cargan imágenes externas (como las de la API de Imgflip), es obligatorio asignar `img.crossOrigin = 'anonymous'` antes de asignar `src`. De lo contrario, el lienzo de Canvas se contamina (*tainted*) y cualquier llamada posterior a `canvas.toBlob()` o `canvas.toDataURL()` fallará con un `SecurityError`.

3. **Backend de Inferencia en rembg:**
   - En versiones recientes de `rembg`, el paquete base no incluye `onnxruntime`. Para entornos CPU es imperativo instalar `rembg[cpu]` o explícitamente `onnxruntime`.

4. **Concurrencia en FastAPI (`server.py`):**
   - Las operaciones de inferencia de `rembg.remove()` son bloqueantes en CPU. En FastAPI, una ruta declarada con `async def` que ejecute código síncrono intensivo en CPU bloqueará el hilo principal del bucle de eventos. Las rutas de este tipo deben definirse como síncronas (`def`) o usar `asyncio.to_thread()`.

5. **Coordenadas Normalizadas:**
   - Casi todas las posiciones (`x`, `y`) en el estado están normalizadas en el rango `[0.0, 1.0]` respecto a las dimensiones de Canvas (`W`, `H`). Al renderizar en `draw()`, se multiplican por las dimensiones reales.

6. **KIndex limita su alcance al repositorio local:**
   - El binario de KIndex restringe el alcance al repositorio local que se escanea (Security Error ante cualquier path externo). Todas sus operaciones (`scan`, `query`, `deps`, etc.) se ejecutan sobre ese repositorio y fallarán con error si se le pide otro. En un clon en otra plataforma (Linux/ARM) este binario de Windows no correrá: borrar `.kindex/` y desinstalar sus hooks.

7. **Android (`android/`): una sola base de código web, backend ausente en el móvil:**
   - El APK es un WebView con el frontend web como assets; NO es un port a React Native/Flutter y **no debe duplicarse la lógica**: el mismo `app.mjs` detecta `window.AndroidSaver` (`NATIVE_ANDROID`) y usa `HAS_BACKEND`/`apiUrl()` para decidir dónde llamar a la API.
   - En Android el backend de rembg no existe: "Quitar fondo real" exige configurar "Servidor IA" (http://IP-PC:5005 del PC en la misma red, guardado en `localStorage.apiBase`); la búsqueda Imgflip va por la API directa (fallback ya existente) y Reddit no está disponible sin backend.
   - Los assets son una copia: tras cambios web hay que re-copiar con el comando de la tabla de archivos y re-subir el cache-busting `?v=N`; compila con Android Studio (ver `android/README_ANDROID.md`).

---

## 🛠️ Comandos de Desarrollo Frecuentes

```powershell
# MODO PRINCIPAL: ejecutar la app completa en Docker (frontend + API de IA)
docker compose up -d --build
# → http://localhost:5005  (frontend integrado)
# → http://localhost:5005/api/remove-bg  (endpoint de IA)
docker compose logs -f memestudio       # ver logs (incluye el anuncio del modelo rembg)
docker compose down                     # parar

# Forzar un modelo concreto en el contenedor
$env:REMBG_MODEL="u2netp"; docker compose up -d --build   # PowerShell
REMBG_MODEL=u2netp docker compose up -d                   # bash

# MODO DESARROLLO LOCAL (sin Docker, requiere venv)
# Activar entorno virtual
.\.venv\Scripts\Activate.ps1

# Ejecutar la app completa (frontend + API de IA en un solo servidor FastAPI)
python server.py
# → http://localhost:5005  (frontend integrado)
# → http://localhost:5005/api/remove-bg  (endpoint de IA)

# Probar la herramienta CLI de remoción de fondo
python tools/remove_bg.py "entrada.jpg" "salida.png"
```

---

## 🗂️ KIndex — Índice de Conocimiento de Código (contexto secundario)

> **Nota:** desde la integración de Graphify (sección siguiente), Graphify es la herramienta **primaria** de contexto estructural del código. KIndex queda como contexto secundario; esta sección se conserva por si se actualiza a una build con soporte Python/ESM.

KIndex (v1.1.0) es un indexador de símbolos que mantiene un grafo de conocimiento del repositorio en `.kindex/`. Está integrado de la siguiente manera:

### Configuración actual

- **Índice:** `.kindex/index.db` + grafos exportados en `.kindex/graph.{json,dot,mmd}`.
- **Hooks de Git instalados** (no bloqueantes): `post-commit`, `post-checkout`, `post-merge`, `post-rewrite` re-indexan automáticamente en segundo plano tras cada operación de Git.
- **Git:** todo `.kindex/` está ignorado; regenerar es trivial (ver más abajo).
- **Re-carga incremental:** `kindex scan .` solo procesa archivos modificados; es barato ejecutarlo tras cambios de código.

### Comandos

```powershell
.\.kindex\kindex.exe scan .          # Re-indexar (incremental; solo procesa cambios)
.\.kindex\kindex.exe query <termo>   # Buscar símbolos indexados
.\.kindex\kindex.exe deps <archivo>  # Dependencias salientes/entrantes del símbolo o archivo
.\.kindex\kindex.exe flow            # Puntos de entrada, capas arquitectónicas y wiring
.\.kindex\kindex.exe stats           # Resumen estructural
.\.kindex\kindex.exe dead            # Código no referenciado
.\.kindex\kindex.exe export          # Exportar grafos a .kindex/graph.{mmd,dot,json}
.\.kindex\kindex.exe hook status     # Verificar hooks de Git
```

### ⚠️ Limitación crítica conocida (v1.1.0)

El parser de esta versión **no extrae símbolos de archivos `.py` ni `.mjs`** (los reconoce como candidatos pero no produce entradas). Como este proyecto es 100% Python + ES modules + HTML/CSS, los símbolos del código propio de Meme Studio Pro **no aparecen en el índice**; `query`, `deps`, `dead` y `flow` no los encontrarán. Además, el escaneo recursivo incluye `.venv/`, por lo que la mayoría de entradas del índice corresponden a fuentes C/C++ de numpy/numba/etc. (ruido de terceros).

**Por ello:** usa las herramientas de Graphify (sección siguiente) para estructura, llamadores e impacto. No confíes en `kindex query` para localizar funciones Python o de `app.mjs`: usa `grep`/`glob`. Si KIndex publica una versión con soporte de Python/ESM, re-instalar el flujo equivale a: eliminar `.kindex/index.db` y ejecutar `scan .` (los hooks ya quedan instalados y activos).

---

## 📊 Graphify — Grafo de Conocimiento del Código (contexto primario)

Graphify (v0.9.100) construye y mantiene el grafo de conocimiento **real** del proyecto con tree-sitter AST (sí compiló `server.py`, `app.mjs`, `tools/remove_bg.py`; respeta `.gitignore`, así que `.venv/` y `.kindex/` están excluidos). Almacena el grafo en modo local/offline; el código se parsea sin LLM.

<!-- graphify-stats:start -->
> Grafo actualizado automáticamente por Git hooks (tools/refresh_graph_docs.py): **300 nodos · 572 aristas · 12 comunidades** · commit de extracción `7a82f077d`. Detalles vivos: `graphify-out/GRAPH_REPORT.md` y `graph_stats` (MCP).
<!-- graphify-stats:end -->

### Configuración actual

- **Grafo:** `graphify-out/graph.json` — versionado en Git (merge driver `graphify` registrado por `graphify hook install`); `graphify-out/cache/` está ignorado.
- **MCP:** servidor `graphify` registrado en `opencode.json` del proyecto (stdio, 10 herramientas, rutas relativas: `graphify-mcp graphify-out/graph.json`). Si el PATH del cliente no resuelve el shim `graphify-mcp` (ha pasado con OpenCode), usar el Python absoluto del entorno uv de esa máquina como se indica en «Conectarse al grafo por MCP». Cualquier agente conectado por MCP comparte el mismo grafo; el servidor re-carga `graph.json` al detectar cambios del archivo.
- **Hooks de Git** (además de los de KIndex): `post-commit`, `post-checkout`, `post-merge`, `post-rewrite` ejecutan `graphify update .` para mantener al día el grafo y la documentación que produce (`GRAPH_REPORT.md`, HTML). Una sección extra añadida manualmente a `.git/hooks/post-commit` y `post-checkout` lanza `tools/refresh_graph_docs.py` en background, que actualiza el bloque `<!-- graphify-stats -->` de este documento con el recuento vigente de nodos/aristas/comunidades.
- **Skill OpenCode:** instalada en `~\.config\opencode\skills\graphify\` + plugin `~\.config\opencode\plugins\graphify.js`.
- **En un clon nuevo** los hooks no viajan con el repositorio (viven en `.git/hooks/`): ejecutar `graphify hook install` para regenerar los bloques de Graphify, y reaplicar las secciones `--- AGENTS.md GRAPH STATS REFRESH ---` de este repo (o simplemente aceptar que solo el grafo se regenere y ejecutar `python tools/refresh_graph_docs.py . --now` manualmente cuando haga falta).

### Herramientas MCP (prefijo `graphify_`)

| Herramienta | Uso |
| :-- | :-- |
| `query_graph` | Subgrafo acotado por tokens para una pregunta de código (BFS/DFS, depth 1–6) |
| `get_node` / `get_neighbors` | Detalle de un símbolo; sus conexiones etiquetadas (calls/imports/inherits, `EXTRACTED` vs `INFERRED`) |
| `get_community` / `god_nodes` / `graph_stats` | Subsistemas; hubs de mayor grado; estadísticas |
| `shortest_path` | Ruta entre dos símbolos |
| `list_prs` / `get_pr_impact` / `triage_prs` | Impacto de PRs sobre las comunidades del grafo |

Nota: las preguntas deben usar palabras de etiquetas (nombres de funciones/archivos), no lenguaje natural en español.

### CLI equivalente (útil para scripts)

```powershell
graphify extract . --code-only     # Re-construcción completa (local, sin LLM)
graphify update .                  # Incremental tras cambios de código
graphify query "<tema>"            # Subgrafo por tema
graphify explain "<símbolo>"       # Resumen de un nodo y sus vecinos
graphify path "<A>" "<B>"          # Camino más corto entre símbolos
graphify affected "<símbolo>"      # Qué depende del símbolo (impacto)
```

### Conectarse al grafo por MCP (otros agentes y clientes)

El mismo `graph.json` sirve a **cualquier** cliente MCP: cada agente conectado lee el mismo grafo del proyecto, que los hooks de Git mantienen al día. Requisito previo en la máquina: `uv tool install "graphifyy[mcp]"`.

Todas las rutas de esta sección son **relativas a la raíz del repositorio** (`<raiz-repo>/graphify-out/graph.json`); en clientes que ejecutan el comando local desde el workspace (caso OpenCode) eso es lo que se pasa tal cual. En clientes que no resuelven el shim `graphify-mcp` por PATH, usar el Python absoluto del entorno uv de esa máquina: Windows `%APPDATA%\uv\tools\graphifyy\Scripts\python.exe`, Linux/macOS `$(uv tool dir)/graphifyy/bin/python`.

**OpenCode (desde otro proyecto o global):**

```powershell
opencode mcp add graphify --global -- graphify-mcp graphify-out/graph.json
```

Si el PATH del cliente no resuelve el shim (ocurrió en OpenCode), usa el Python absoluto del entorno uv:

```jsonc
{
  "mcp": {
    "servers": {
      "graphify": {
        "type": "local",
        "cwd": "<raiz-repo>",
        "command": [
          "<ruta-uv>/graphifyy/python",   // Windows: ...\\graphifyy\\Scripts\\python.exe
          "-m", "graphify.serve",
          "graphify-out/graph.json"
        ]
      }
    }
  }
}
```

**Claude Code:**

```powershell
claude mcp add --transport stdio graphify -- graphify-mcp graphify-out/graph.json
```

**Codex / Gemini CLI:**

```powershell
codex mcp add graphify -- graphify-mcp graphify-out/graph.json
```

**Cursor y clientes JSON genéricos** (`~/.cursor/mcp.json` o equivalente):

```jsonc
{
  "mcpServers": {
    "graphify": {
      "command": "graphify-mcp",
      "args": ["graphify-out/graph.json"],
      "cwd": "<raiz-repo>"
    }
  }
}
```

**Equipo en varias máquinas:** sirve el grafo por HTTP y conéctalo como servidor remoto:

```powershell
graphify-mcp graphify-out/graph.json --transport http --port 8099 --api-key "<clave>"
```

Los clientes se registran con `type: "remote"`, `url: "http://<host>:8099/mcp"` y cabecera `Authorization: Bearer <clave>` (o `X-API-Key`). El servidor escucha en `127.0.0.1` salvo que se indique `--host`.

**Verificación (cualquier cliente):** tras conectar, ejecuta la herramienta `graph_stats` del servidor `graphify`; debe responder el recuento de nodos/aristas del bloque de estadísticas de esta sección. El servidor también publica los recursos MCP `graphify://report` (texto de `GRAPH_REPORT.md`) y `graphify://god-nodes`.

### Regla de uso para agentes

Para preguntas de **estructura, llamadores, dependencias o impacto** de un cambio, usa primero Graphify (`query_graph`, `get_node`, `shortest_path`, `affected`) antes de `grep` o lectura de archivos uno a uno. Reserva `grep` para cadenas exactas (mensajes de error, claves de config). Si una herramienta de Graphify falla o el grafo está desactualizado, dilo y recurre a `grep`; refresca con `graphify update .`.
