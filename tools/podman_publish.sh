#!/bin/sh
# Publica Meme Studio Pro en multi-arch con Podman: linux/amd64 (PC x64) y
# linux/arm64 (Raspberry Pi 4/5 con Raspberry Pi OS 64-bit).
#
# Uso:
#   tools/podman_publish.sh <registro/usuario/repo[:tag]> [--no-push]
#   ej: tools/podman_publish.sh ghcr.io/tu-usuario/memestudio:1.0
#       tools/podman_publish.sh docker.io/tu-usuario/memestudio --no-push
#
# Requiere sesion iniciada en el registro (podman login <registro>).
# Al subir, el tag queda como MANIFEST LIST con las dos plataformas.
set -e
IMAGE=${1:?uso: podman_publish.sh <registro/usuario/repo[:tag]> [--no-push]}
case "$IMAGE" in
  *:*) TAG=${IMAGE##*:} ; IMAGE=${IMAGE%:*} ;;
  *)   TAG=latest ;;
esac
case "${2:-}" in
  --no-push) PUSH=0 ;;
  *) PUSH=1 ;;
esac
[ "$(echo "$IMAGE" | cut -d/ -f1)" = "$IMAGE" ] && IMAGE="docker.io/library/$IMAGE"

cd "$(dirname "$0")/.."
LIST="memestudio-list"

echo "==> Contexto: $(pwd)"
echo "==> Imagen:   $IMAGE:$TAG (+latest si aplicable)"
echo "==> Plataformas: linux/amd64 (PC) + linux/arm64 (Raspberry Pi 64-bit)"

# en cada commit sube ?v=N solo de lo tocado... no aplica aqui: Dockerfile
# copia TODO public/ (los ?v quedan grabados en la imagen, no hay runtime).
podman manifest rm "$LIST" >/dev/null 2>&1 || true
podman build --platform linux/amd64,linux/arm64 --manifest "$LIST" .
podman tag "$LIST" "$IMAGE:$TAG"

echo "==> Manifest local:"
podman manifest inspect "$IMAGE:$TAG" | grep -E '"architecture"|platform' | sort -u

if [ "$PUSH" = "1" ]; then
  echo "==> Push de $IMAGE:$TAG (login previo: podman login <registro>)"
  podman manifest push --all "$LIST" "$IMAGE:$TAG"
  echo "OK: $IMAGE:$TAG publicado como manifest list amd64+arm64."
fi
