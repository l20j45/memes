#!/bin/sh
# Compila la APK/AAB de Meme Studio Pro sin Android Studio.
#
# Uso:
#   tools/build_apk.sh              # APK debug (installable directo)
#   tools/build_apk.sh release      # APK release firmada (keystore en android/keystore/)
#   tools/build_apk.sh bundle       # AAB release firmada (Google Play)
#
# Output: android/app/build/outputs/apk/{debug,release}/...apk
#         android/app/build/outputs/bundle/release/...aab
#
# Requirements:
#   - Android SDK en $HOME/Library/Android/sdk (o $ANDROID_HOME)
#   - JDK 17 en $HOME/jdks/jdk17 (Temurin tarball de adoptium; el JBR de
#     Android Studio es JDK 25 y Gradle 8.7 lo rechaza)
#   - Gradle 8.7 en $HOME/jdks/gradle-8.7
#   - NOTA: el repo no lleva el JAR del wrapper, se invoca el binario directo.
set -e
cd "$(dirname "$0")/../android"

JAVA_HOME="${JAVA_HOME:-$HOME/jdks/jdk17/Contents/Home}"
ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
GRADLE="${GRADLE:-$HOME/jdks/gradle-8.7/bin/gradle}"

[ -x "$GRADLE" ] || GRADLE=$(command -v gradle)
[ -x "$GRADLE" ] || { echo "ERROR: no hay Gradle; descarga gradle-8.7-bin.zip a ~/jdks" >&2; exit 1; }
[ -x "$JAVA_HOME/bin/java" ] || { echo "ERROR: falta JDK 17 en $JAVA_HOME" >&2; exit 1; }

TARGET="${1:-}"
case "$TARGET" in
  release)  TASK="assembleRelease"  ; OUT="apk/release"     ;;
  bundle)   TASK="bundleRelease"    ; OUT="bundle/release"  ;;
  "")       TASK="assembleDebug"    ; OUT="apk/debug"       ;;
  *) echo "uso: tools/build_apk.sh [release|bundle] (default: debug APK)" >&2; exit 1 ;;
esac

echo "==> JAVA_HOME=$JAVA_HOME"
echo "==> ANDROID_HOME=$ANDROID_HOME"
JAVA_HOME="$JAVA_HOME" ANDROID_HOME="$ANDROID_HOME" "$GRADLE" "$TASK" --no-daemon
echo "==> Artefacto en: android/app/build/outputs/$OUT/"
