#!/usr/bin/env bash
# Meme Studio Pro — como correr toda la Aplicacion (frontend + API de IA)
# en un solo puerto con el venv local. Sin Docker, sin pasos manuales.
#
#   ./run.sh              # arranca en PRIMER PLANO (Ctrl+C para parar)
#   ./run.sh -b           # arranca en BACKGROUND (log: memesp.log)
#   ./run.sh -s           # parar el servidor en background
#   ./run.sh -k           # matar cualquier servidor en marcha y arrancar de nuevo
#   ./run.sh --check      # solo comprobar el /health del servidor activo
#
# Si tienes uv instalado, la instalacion de deps usa `uv pip install
# --python .venv/bin/python -r requirements.txt` (resolucion rapidisima
# apuntando el MISMO .venv). Para correr a mano via uv:
#   uv run --no-project --python .venv/bin/python server.py
#
# Lee el .env de la raiz si existe (REMBG_MODEL, REQUIRE_LOGIN, AUTH_USERS,
# PORT/HOST_PORT...) como `python server.py`; PORT cambia el puerto.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-5005}"
LOG="memesp.log"

pick_python() {
  for c in "$PWD/.venv/bin/python" python3 python; do
    command -v "$c" >/dev/null 2>&1 && { echo "$c"; return 0; }
  done
  return 1
}
PY="$(pick_python)"

ensure_venv() {
  if [ ! -x .venv/bin/python ]; then
    echo "==> No hay .venv: creando entorno virtual..."
    "$PY" -m venv .venv
  fi
  # deps: con uv (resolucion ultrarrapida, apuntando al .venv con --python)
  # o pip clasico como fallback
  if ! .venv/bin/python -c 'import fastapi, uvicorn, rembg' >/dev/null 2>&1; then
    if command -v uv >/dev/null 2>&1; then
      echo "==> Instalando dependencias con uv (rapido)..."
      uv pip install --quiet --python .venv/bin/python -r requirements.txt
    else
      echo "==> Instalando dependencias con pip..."
      .venv/bin/python -m pip install --quiet --upgrade pip
      .venv/bin/python -m pip install --quiet -r requirements.txt
    fi
  fi
}

server_pids() {
  pgrep -f '([.]venv/bin/python server\.py|python server\.py)' 2>/dev/null || true
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

ensure_venv
echo "==> Python: .venv ($( .venv/bin/python --version 2>&1))"

if [ "${1:-}" = "-b" ]; then
  echo "==> Arrancando en background (log: $LOG)..."
  nohup .venv/bin/python server.py >> "$LOG" 2>&1 &
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
exec .venv/bin/python server.py
