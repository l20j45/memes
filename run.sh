#!/usr/bin/env bash
# Meme Studio Pro — como correr toda la Aplicacion (frontend + API de IA)
# en un solo puerto. Ideal: uv (project mode via pyproject.toml + uv.lock).
#
#   ./run.sh              # arranca en PRIMER PLANO (Ctrl+C para parar)
#   ./run.sh -b           # arranca en BACKGROUND (log: memesp.log)
#   ./run.sh -s           # parar el servidor en background
#   ./run.sh -k           # matar cualquier servidor en marcha y arrancar de nuevo
#   ./run.sh --check      # solo comprobar el /health del servidor activo
#
# Con uv: `uv sync` instala deps exactas del uv.lock en el .venv del repo y
# `uv run server.py` ejecuta desde ahi. Sin uv: fallback venv+pip.
# Lee el .env de la raiz si existe (REMBG_MODEL, REQUIRE_LOGIN, AUTH_USERS,
# PORT/HOST_PORT...); PORT cambia el puerto.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-5005}"
LOG="memesp.log"
HAVE_UV=0
command -v uv >/dev/null 2>&1 && HAVE_UV=1

RUNPY=()   # prefijo para ejecutar python del entorno activo
pick_python() {
  for c in "$PWD/.venv/bin/python" python3 python; do
    command -v "$c" >/dev/null 2>&1 && { echo "$c"; return 0; }
  done
  return 1
}
PY="$(pick_python)"

ensure_env() {
  if [ "$HAVE_UV" = 1 ]; then
    echo "==> uv: sincronizando deps de pyproject.toml/uv.lock en .venv..."
    uv sync --quiet
    return 0
  fi
  if [ ! -x .venv/bin/python ]; then
    echo "==> No hay uv ni .venv: creando entorno virtual con $PY..."
    "$PY" -m venv .venv
  fi
  if ! .venv/bin/python -c 'import fastapi, uvicorn, rembg, pytest' >/dev/null 2>&1; then
    echo "==> Instalando dependencias con pip..."
    .venv/bin/python -m pip install --quiet --upgrade pip
    .venv/bin/python -m pip install --quiet -r requirements.txt
  fi
}

server_pids() {
  pgrep -f '([.]venv/bin/python server\.py|uv run server\.py|python server\.py)' 2>/dev/null || true
}

health() { curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/health" 2>/dev/null || echo 000; }

case "${1:-}" in
  -s|--stop)
    PIDS=$(server_pids)
    if [ -n "$PIDS" ]; then echo "==> Parando: $PIDS"; kill $PIDS; sleep 1; echo "OK"; else echo "Nada corriendo en el puerto $PORT."; fi
    exit 0 ;;
  --check)
    CODE=$(health)
    [ "$CODE" = "200" ] && echo "HEALTH OK (http://localhost:$PORT)" || echo "health=$CODE"
    exit 0 ;;
  -k|--renew)
    PIDS=$(server_pids); [ -n "$PIDS" ] && { echo "==> Reiniciando (muere $PIDS)"; kill $PIDS; sleep 1; } ;;
esac

ensure_env
if [ "$HAVE_UV" = 1 ]; then
  RUNCMD=(uv run server.py)
else
  RUNCMD=(.venv/bin/python server.py)
fi
echo "==> Python del entorno: $([ "$HAVE_UV" = 1 ] && uv run --no-sync python -c 'import sys; print(sys.executable)' || .venv/bin/python -c 'import sys; print(sys.executable)')"

if [ "${1:-}" = "-b" ]; then
  echo "==> Arrancando en background (log: $LOG)..."
  # OJO: en background NO usamos `uv run` como wrapper (mantiene pipes del
  # caller abiertas y el script no "termina"); uv ya dejo el .venv listo
  # con uv sync, asi que ejecutamos el python del venv directo y detached.
  nohup .venv/bin/python server.py </dev/null >> "$LOG" 2>&1 &
  echo $! > ms_pid
  sleep 1
  for _ in $(seq 1 30); do
    [ "$(health)" = "200" ] && break
    sleep 1
  done
  [ "$(health)" = "200" ] \
    && echo "OK -> http://localhost:$PORT  (API: /api/remove-bg, docs: /docs)" \
    || echo "AUN CALIENTE: mira $LOG (la primera instalacion puede tardar)"
  exit 0
fi

echo "==> Abriendo http://localhost:$PORT  (Ctrl+C para parar)"
exec "${RUNCMD[@]}"
