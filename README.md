# Meme Studio Pro 🎭

> Generador y editor profesional de memes en el navegador con soporte para capas múltiples, eliminación inteligente de fondo mediante IA (Rembg / U2-Net), restaurador/inpainting de imágenes, tipografías clásicas y modernas, marcas de agua personalizadas y exportación de alta fidelidad.

---

## 📋 Índice

- [Características Principales](#-características-principales)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Estructura de Archivos](#-estructura-de-archivos)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Cómo Ejecutar el Proyecto](#-cómo-ejecutar-el-proyecto)
  - [1. Backend de Inteligencia Artificial (Python FastAPI)](#1-backend-de-inteligencia-artificial-python-fastapi)
  - [2. Frontend Web (Navegador)](#2-frontend-web-navegador)
  - [3. Script CLI Independiente](#3-script-cli-independiente)
- [Guía de Uso y Atajos](#-guía-de-uso-y-atajos)
- [API del Backend](#-api-del-backend)
- [Documentación y Contexto para Agentes de IA](#-documentación-y-contexto-para-agentes-de-ia)
- [Diagnóstico y Correcciones Recomendadas](#-diagnóstico-y-correcciones-recomendadas)

---

## ✨ Características Principales

### 🖼️ Composición y Edición de Imágenes
- **Capas Múltiples:** Sube, pega desde el portapapeles o arrastra cualquier cantidad de imágenes (`PNG`, `JPG`, `WebP`, etc.).
- **Transformación Libre:** 8 manejadores interactivos (4 esquinas para escala uniforme y 4 bordes para deformación/estiramiento horizontal y vertical).
- **Ajustes Rápidos:** Botones de encajar (*Fit*), rellenar (*Cover*), estirar (*Stretch*) y volver a la proporción original (*Original Shape*).
- **Filtros Gráficos:** Efectos integrados en tiempo real (Escala de grises, Alto contraste, Sepia vintage y *Deep Fry* meme frito).
- **Composición:** Opciones para cambiar relación de aspecto (1:1, 4:5, 4:3, 16:9, 9:16) y color de fondo.

### 🪄 Eliminación de Fondo (Doble Modo)
1. **Modo Local Rápido (Canvas):** Detección heurística de color de fondo y tolerancia perimetral en el cliente sin necesidad de servidor.
2. **Modo IA Real (Rembg / ONNX):** Integración con el microservicio Python local para recorte preciso de personas, mascotas y objetos complejos utilizando redes neuronales.

### 🧹 Limpiador de Memes e Inpainting
- **Pincel Restaurador:** Permite pintar sobre textos antiguos o marcas no deseadas; el algoritmo de dilatación e *inpainting* reconstruye la textura de fondo.
- **Detección inteligente de texto:** Filtro opcional para actuar únicamente sobre píxeles de texto blanco/negro dentro del área trazada.
- **Recorte Automático de Barras:** Elimina automáticamente barras superiores o inferiores de memes preexistentes.

### 🔤 Tipografía y Capas de Texto
- **Estilos Predefinidos:** Presets instantáneos (*Clásico*, *Moderno*, *Neón*, *Barra Superior*).
- **Tipografías Populares:** `Impact`, `Anton`, `Oswald`, `Montserrat`, `Comic Neue` y `Arial`.
- **Personalización Completa:** Color de relleno, trazo/borde con grosor regulable, sombra con desenfoque, opacidad y alineación (izquierda, centro, derecha).
- **Gestión por Capas:** Crear capas de texto independientes, duplicar, reordenar, bloquear y activar/desactivar mayúsculas automáticas.

### 🏷️ Marca de Agua y Exportación
- **Presets de Marca de Agua:** Esquina inferior, Centro de seguridad o Sutil.
- **Configuración Milimétrica:** Posición X/Y en porcentaje, tamaño, opacidad, desenfoque y colores.
- **Exportación Multiformato:** Descarga directa en `PNG` (máxima fidelidad), `JPG` (tamaño ligero) o `WebP` (optimizado para web).
- **Resoluciones Predefinidas:** Original, 1080×1080 (Instagram Post), 1200×1200, 1080×1920 (TikTok/Reels/Stories) y 1920×1080 (YouTube/Twitter).
- **Copiar al Portapapeles:** Copia directa en memoria como PNG para pegar inmediatamente en Discord, Telegram, WhatsApp Web o redes sociales.

### 🌐 Catálogo y Plantillas Virales
- Plantillas locales integradas listas para usar.
- Buscador conectado en vivo con el catálogo viral de la API de Imgflip.

---

## 🏛️ Arquitectura del Proyecto

```
                     ┌───────────────────────────────────┐
                     │          Navegador Web            │
                     │  (memegnerator.html / app.mjs)    │
                     │  - Motor Canvas 2D                │
                     │  - Estado y Undo/Redo             │
                     │  - Inpainting local               │
                     └─────────────────┬─────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            │ HTTP (fetch)                                        │ HTTP (fetch)
            ▼                                                     ▼
┌───────────────────────────────┐                     ┌───────────────────────────────┐
│     Backend FastAPI           │                     │        API Imgflip            │
│       (server.py)             │                     │   (api.imgflip.com)           │
│  - Endpoint: /api/remove-bg   │                     │  - Catálogo de memes          │
│  - rembg / ONNX Runtime       │                     │    virales en vivo            │
└───────────────────────────────┘                     └───────────────────────────────┘
```

---

## 📁 Estructura de Archivos

```plaintext
memes/
├── app.mjs                     # Lógica completa de frontend (Canvas, eventos, estado, historial)
├── memegnerator.html           # Estructura HTML de la interfaz y controles
├── styles.css                  # Estilos modernos con tema oscuro y diseño responsivo
├── server.py                   # Servidor API FastAPI para eliminación de fondo por IA
├── requirements.txt            # Dependencias de Python (FastAPI, Rembg con backend CPU, Pillow, Uvicorn)
├── opencode.json               # Configuración de OpenCode: registra el servidor MCP del grafo de Graphify
├── .gitattributes              # Merge driver de Graphify para fusionar graph.json sin conflictos
├── tools/
│   ├── remove_bg.py            # Script CLI para procesar imágenes locales desde terminal
│   ├── remove_bg.bat           # Wrapper por lotes para ejecución rápida en Windows
│   └── refresh_graph_docs.py   # Hook helper: sincroniza estadísticas del grafo en AGENTS.md
├── graphify-out/               # Grafo de conocimiento (Graphify): graph.json + GRAPH_REPORT.md
├── .gitignore                  # Archivos y carpetas excluidos del control de versiones
├── AGENTS.md                   # Contexto técnico y directrices para agentes de IA
└── README.md                   # Esta documentación
```

---

## 📦 Requisitos Previos

1. **Python 3.10 o superior** (para ejecutar el servidor de IA y el script CLI).
2. **Navegador web moderno** (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari) con soporte para ES Modules y Canvas 2D.
3. *Opcional:* Node.js (si deseas utilizar servidores estáticos como `serve` o `live-server`).

---

## 🚀 Instalación y Configuración

### 1. Clonar o acceder al repositorio
Abre tu terminal en la carpeta del proyecto:
```powershell
cd <ruta/al/proyecto>  # p. ej. ~/proyectos/memes en Linux, C:\Proyectos\memes en Windows
```

### 2. Crear y activar el entorno virtual de Python
```powershell
# En Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Instalar dependencias
> [!IMPORTANT]
> Es crucial instalar `rembg[cpu]` (o `rembg[gpu]` si cuentas con soporte CUDA) para que se incluya el motor de inferencia ONNX.
```powershell
pip install -r requirements.txt
```

---

## 🖥️ Cómo Ejecutar el Proyecto

### 1. Docker (modo recomendado)

**Toda la aplicación se ejecuta desde un contenedor Docker.** No necesita entorno virtual ni dependencias locales: solo Docker (o Docker Engine + el plugin de compose en Raspberry Pi).

```bash
# Arrancar (construye la imagen la primera vez)
docker compose up -d --build

# Ver logs
docker compose logs -f memestudio

# Parar
docker compose down
```

Abre en tu navegador:
```
http://localhost:5005
```
- API Endpoint: `http://localhost:5005/api/remove-bg`
- Documentación interactiva Swagger: `http://localhost:5005/docs`
- Comprobación de estado: `http://localhost:5005/health`

> [!TIP]
> El archivo `docker-compose.yml` monta el volumen `models` sobre `~/.u2net` y `~/.rembg` del contenedor: los pesos de rembg se descargan **una sola vez** (en la primera petición) y sobreviven a reinicios y actualizaciones de la imagen.

Para forzar un modelo concreto:

```bash
REMBG_MODEL=u2netp docker compose up -d      # Linux/macOS
# o definir REMBG_MODEL antes de: docker compose up -d (PowerShell)
$env:REMBG_MODEL="u2netp"; docker compose up -d --build
```

> [!NOTE]
> En Raspberry Pi no hay que hacer nada especial: la imagen base `python:3.11-slim` es multi-arquitectura y Docker construye la versión ARM de forma nativa. Dentro del contenedor, `platform.machine()` sigue reportando `aarch64`, así que la selección automática de modelo (`u2netp`) funciona igual que fuera del contenedor.

---

### 2. Servidor Local sin Docker (desarrollo)

> **Modo todo-en-uno:** [`server.py`](server.py) sirve tanto la API de eliminación de fondos con IA como la aplicación web del frontend de forma integrada en un solo comando:

```powershell
# Con el entorno virtual activado:
python server.py
```
Abre en tu navegador:
```
http://localhost:5005
```
- API Endpoint: `http://localhost:5005/api/remove-bg`
- Documentación interactiva Swagger: `http://localhost:5005/docs`
- Comprobación de estado: `http://localhost:5005/health`

---

### 3. Frontend Independiente (Obsoleto)

> [!NOTE]
> Ya **no es necesario** iniciar un servidor estático separado (`python -m http.server 8000` o `npx serve`). El frontend y la API ahora viven en la misma app FastAPI: con `python server.py` todo se sirve en `http://localhost:5005`, y la llamada a la API usa una ruta relativa (`/api/remove-bg`) que funciona sin importar el puerto.

> [!WARNING]
> Evita abrir `memegnerator.html` haciendo doble clic directo (`file:///`):
> La aplicación utiliza módulos JavaScript nativos (`<script type="module" src="./app.mjs">`). Los navegadores bloquean la importación de módulos vía `file://` debido a directivas de seguridad CORS. **Debe servirse mediante `python server.py` (un solo comando, un solo puerto).**

---

### 4. Script CLI Independiente

Si deseas eliminar el fondo de una imagen directamente desde la línea de comandos sin abrir el navegador:

```powershell
# Usando el script en Python
python tools/remove_bg.py "ruta/a/entrada.jpg" "ruta/a/salida.png"

# O mediante el ejecutable por lotes en Windows
.\tools\remove_bg.bat "entrada.png" "salida.png"
```

### 5. Ejecución en Raspberry Pi (o ARM)

**Modo principal en la Pi: Docker.** Instala Docker Engine en la Pi (Raspberry Pi OS 64-bit) y arranca con `docker compose up -d --build` desde la raíz del repo — la construcción es nativa ARM, sin emulación.

El backend detecta la arquitectura de la máquina al arrancar:

- **ARM (Raspberry Pi, Jetson...):** usa automáticamente el modelo ligero `u2netp` (~4.7 MB, 4–6× más rápido en CPU ARM).
- **x86/x64 (PC):** usa `u2net` completo con máxima calidad.
- Se puede forzar cualquier modelo con una variable de entorno: `REMBG_MODEL=u2net` (o `u2netp`, `isnet-general-use`, ...).

> [!TIP]
> En una Pi, configura **4 GB de RAM o más** y deja el proyecto en una SD rápida. La primera petición descarga el modelo a `~/.u2net`; a partir de ahí todo es local.

> [!NOTE]
> Los archivos de tooling de agentes (`.kindex/`, `opencode.json`) no son necesarios para ejecutar la app; en un clon para ARM puede eliminarse `.kindex/` (contiene un binario Windows) y regenerar los hooks de Graphify con `graphify hook install`.

---

## ⌨️ Guía de Uso y Atajos

| Atajo de Teclado | Acción |
| :--- | :--- |
| `Ctrl + Z` | Deshacer el último cambio |
| `Ctrl + Y` o `Ctrl + Shift + Z` | Rehacer el cambio deshecho |
| `Ctrl + Enter` | Descargar el meme inmediatamente en el formato seleccionado |
| `Delete` o `Backspace` | Eliminar la imagen o capa de texto actualmente seleccionada |
| `Ctrl + V` | Pegar imagen directamente desde el portapapeles del sistema |
| *Arrastrar y soltar* | Arrastra cualquier archivo de imagen sobre el lienzo para añadirlo |

### Manipulación sobre el lienzo:
- **Arrastre central:** Mueve la imagen o el texto sobre el lienzo.
- **4 Esquinas:** Escala uniforme proporcional.
- **4 Bordes laterales/verticales:** Estiramiento individual de ancho o alto.
- **Modo Limpiar (Borrador):** Pinta con el pincel sobre marcas de agua o texto no deseado y presiona **«Borrar lo pintado»**.

---

## 🔌 API del Backend

### `GET /health`
Verifica la disponibilidad del servicio.
- **Respuesta:** `{"status": "ok"}`

### `POST /api/remove-bg`
Recibe una imagen y devuelve la imagen procesada en formato PNG con fondo transparente.
- **Content-Type:** `multipart/form-data`
- **Body:** `image: <archivo binario>`
- **Respuesta:** Stream de imagen binaria `image/png`.

---

## 🤖 Documentación y Contexto para Agentes de IA

Este repositorio mantiene un **grafo de conocimiento estructural** del código con [Graphify](https://graphify.com), pensado para que agentes de IA (OpenCode, Claude Code, Cursor, Codex, etc.) consulten la arquitectura del proyecto en lugar de adivinarla grepeando archivos. El detalle completo de operaciones está en [`AGENTS.md`](AGENTS.md); aquí va el resumen para agentes que se conecten.

### ¿Qué provisiona el repo?

| Pieza | Descripción |
| :--- | :--- |
| `graphify-out/graph.json` | Grafo de símbolos reales del proyecto (Python y ES modules) con aristas explicadas (`EXTRACTED` / `INFERRED`), comunidades y god nodes. |
| `graphify-out/GRAPH_REPORT.md` | Reporte generativo de la arquitectura (se regenera en cada commit). |
| `opencode.json` | Registra un servidor MCP local `graphify` con 10 herramientas de consulta del grafo. |
| Servidor MCP `graphify` | Acepta múltiples agentes a la vez: todos leen el mismo grafo; lo recarga automáticamente cuando se regenera. |

### Conectar un agente al grafo (resumen)

1. Instalar el servidor MCP en la máquina: `uv tool install "graphifyy[mcp]"`.
2. Registrarlo apuntando al grafo (desde la raíz del repo, ruta relativa `graphify-out/graph.json`):
   - **OpenCode:** `opencode mcp add graphify -- graphify-mcp graphify-out/graph.json`.
   - **Claude Code:** `claude mcp add --transport stdio graphify -- graphify-mcp graphify-out/graph.json`.
   - **Codex:** `codex mcp add graphify -- graphify-mcp graphify-out/graph.json`.
   - **Cursor / genéricos:** usar el bloque `mcpServers` de `AGENTS.md`.
3. Verificar llamando a la herramienta `graph_stats` del servidor; debe devolver el recuento de nodos/aristas/versionado que figura en `AGENTS.md`.

Las instrucciones definitivas (y los comandos exactos por plataforma) están en la sección **«Graphify — Grafo de Conocimiento del Código»** de [`AGENTS.md`](AGENTS.md). Los agentes deben leer ese archivo antes de tocar el código.

### Automatización por hooks de Git

Los hooks instalados en el repositorio mantienen la documentación técnica viva sin intervención manual:

```powershell
graphify hook install   # re-instala los bloques de Graphify en .git/hooks (recomendado tras clonar)
```

- **Tras cada `commit`, `checkout` de rama, `merge` o `rewrite`:**
  1. Graphify reconstruye `graph.json`, `GRAPH_REPORT.md` y el visor HTML de forma incremental (solo archivos cambiados, sin llamadas a LLM).
  2. `tools/refresh_graph_docs.py` sincroniza el bloque de estadísticas `<!-- graphify-stats -->` de `AGENTS.md` con el grafo vigente.
- **Regla para agentes:** ante preguntas de estructura, llamadores o impacto de un cambio, consultar primero el grafo (vía MCP `query_graph`, `get_node`, `shortest_path`) o el CLI (`graphify query/explain/path/affected`), y reservar `grep` para cadenas exactas.

---

## 🔍 Diagnóstico y Correcciones Recomendadas

Durante la auditoría del proyecto se identificaron los siguientes puntos importantes:

1. **Dependencia de ONNX en `requirements.txt` (Resuelto en entorno local):**
   - *Problema:* El paquete base `rembg>=2.0.57` no incluye por defecto el motor de inferencia ONNX Runtime. Al importar `rembg`, el servidor arrojaba `No onnxruntime backend found`.
   - *Solución:* Se instaló `onnxruntime` y se recomienda especificar `rembg[cpu]>=2.0.57` en `requirements.txt`.

2. **Acceso vía `file://` vs `http://` (Resuelto):**
   - *Problema:* Doble clic en `memegnerator.html` provoca un error de CORS en el navegador que impide cargar `app.mjs`.
   - *Solución:* El servicio de archivos estáticos está integrado en `server.py` mediante `FastAPI.mount()`; `python server.py` sirve frontend y API como una sola app.

3. **Nombre del archivo HTML:**
   - *Observación:* `memegnerator.html` contiene una errata tipográfica ("memegnerator" en vez de "memegenerator"). Existe un `index.html` que redirige a la app, así que `http://localhost:5005/` carga el frontend por defecto.

4. **Sincronización de UI en "Borrar objeto":**
   - *Observación:* Al hacer clic en el botón `eraseObjectBtn`, el estado interno `state.cleanOn` se activa, pero la casilla de verificación `#cleanOn` del acordeón "Limpiar meme" no se actualiza ni se despliega el acordeón para mostrar los controles del pincel.

5. **Excepción no controlada en Preset "Barra":**
   - *Observación:* En `app.mjs`, si el usuario elimina todas las capas de texto y pulsa el botón del preset "Barra", el código intenta acceder a `state.layers[0]`, generando un `TypeError: Cannot convert undefined or null to object`. Se debe asegurar que exista al menos una capa antes de asignarle propiedades.

6. **Bloqueo horizontal al alinear texto:**
   - *Observación:* En `draw()`, si el texto está alineado a la izquierda (`left`) o derecha (`right`), la coordenada horizontal de anclaje se fija a un porcentaje estático (12% u 88%), ignorando el valor `l.x` que produce el arrastre con el ratón.

7. **Procesamiento síncrono en FastAPI (`server.py`):**
   - *Observación:* La función `remove_bg` está declarada como `async def`, pero ejecuta `remove(rgba)` que es una llamada síncrona de CPU intensiva. Esto bloquea el hilo principal del Event Loop de FastAPI. Cambiar la firma a `def remove_bg(...)` síncrona permite que FastAPI la ejecute automáticamente en un hilo del *threadpool*.
