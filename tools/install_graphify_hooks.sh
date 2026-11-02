#!/usr/bin/env bash
# tools/install_graphify_hooks.sh
#
# Instalación COMPLETA de Graphify en un clon nuevo del repo (los hooks viven
# en .git/hooks/ y no viajan con git clone). Hace, en orden e idempotente:
#
#   1. `graphify hook install`        -> post-commit/checkout/merge/rewrite + merge driver
#   2. Sección manual `--- AGENTS.md GRAPH STATS REFRESH ---` en post-commit y
#      post-checkout (refresca el bloque de stats de AGENTS.md tras el rebuild
#      en background de graphify, con espera acotada a que graph.json cambie).
#   3. Verificación final (graphify hook status + grep de la sección).
#
# Uso:  bash tools/install_graphify_hooks.sh
# (re-ejecutar no duplica nada; si graphify no está instalado mira
#  https://docs.graphify.com o `uv tool install "graphifyy[mcp]"`)
set -euo pipefail

_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
    echo "✗ No es un repositorio git (o git no disponible)"; exit 1;
}
cd "$_root"

# --- 1. Resolver el launcher de graphify (PATH o entorno uv tool) -----------
GFY=""
if command -v graphify >/dev/null 2>&1; then
    GFY=$(command -v graphify)
else
    for _c in "$HOME/.local/share/uv/tools/graphifyy/bin/graphify" \
              "${UV_TOOL_DIR:-}/graphifyy/bin/graphify"; do
        [ -n "$_c" ] && [ -x "$_c" ] && GFY="$_c" && break
    done
fi
if [ -z "$GFY" ]; then
    echo "✗ graphify no está instalado en esta máquina."
    echo "  Instálalo con: uv tool install \"graphifyy[mcp]\""
    exit 1
fi
echo "→ graphify: $GFY"

# --- 2. Hooks base de graphify (idempotente: reinstala actualizados) -------
"$GFY" hook install
echo

# --- 3. Sección manual de stats en post-commit / post-checkout -------------
MARKER="AGENTS.md GRAPH STATS REFRESH"
SECTION='
# --- AGENTS.md GRAPH STATS REFRESH ---
# (seccion manual no la instala `graphify hook install`; este script la agrega.
#  Re-aplica el bloque graphify-stats de AGENTS.md tras el rebuild en
#  background de graphify: espera acotada a que graph.json cambie de mtime).
(
    _top=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
    cd "$_top" || exit 0
    [ -f tools/refresh_graph_docs.py ] || exit 0
    _gj_antes=$(stat -f %m graphify-out/graph.json 2>/dev/null || stat -c %Y graphify-out/graph.json 2>/dev/null)
    _i=0
    while [ "$_i" -lt 90 ]; do
        sleep 2; _i=$((_i + 1))
        _gj_ahora=$(stat -f %m graphify-out/graph.json 2>/dev/null || stat -c %Y graphify-out/graph.json 2>/dev/null)
        [ -n "$_gj_ahora" ] && [ "$_gj_ahora" != "$_gj_antes" ] && break
    done
    python3 tools/refresh_graph_docs.py "$_top" --now >/dev/null 2>&1
) >/dev/null 2>&1 &
'
for hook in post-commit post-checkout; do
    file=".git/hooks/$hook"
    if [ -f "$file" ] && grep -q "$MARKER" "$file" 2>/dev/null; then
        echo "✓ $hook: sección de stats ya presente (sin cambios)"
    else
        printf '%s\n' "$SECTION" >> "$file"
        echo "✓ $hook: sección de stats agregada"
    fi
    chmod +x "$file"
done

# --- 4. Verificación --------------------------------------------------------
echo
"$GFY" hook status
_missing=0
for hook in post-commit post-checkout; do
    grep -q "$MARKER" ".git/hooks/$hook" || { echo "✗ FALTA sección en $hook"; _missing=1; }
done
[ "$_missing" -eq 0 ] && echo "✓ Instalación completa: grafo + stats de AGENTS.md se mantienen al día en cada commit."
exit "$_missing"
