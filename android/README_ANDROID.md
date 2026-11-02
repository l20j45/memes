# Meme Studio Pro — Aplicación Android (APK)

La app Android **no es un port a React Native/Flutter**: es una app WebView (Kotlin) que reutiliza el 100% del editor real (`memegnerator.html` + `app.mjs` + `styles.css`), empaquetados como assets. Así solo existe una única base de código web.

```
android/
├── settings.gradle / build.gradle / gradle.properties   # proyecto raiz (AGP 8.5, Kotlin 1.9)
├── gradle/wrapper/gradle-wrapper.properties             # Gradle 8.7
└── app/
    ├── build.gradle                                     # minSdk 24, targetSdk 35
    └── src/main/
        ├── assets/                                      # ← copia del frontend web
        ├── java/com/memestudiopro/app/MainActivity.kt   # WebView + puente de guardado
        └── res/                                         # icono, tema, red
```

## Compilar el APK

### Opción A — Android Studio (recomendada)

1. Instala [Android Studio](https://developer.android.com/studio) (incluye JDK y SDK necesarios).
2. `File > Open` → selecciona la carpeta `android/` del repo. Studio resolverá Gradle 8.7 automáticamente (si pide "regenerar el wrapper", acéptalo: en el repo solo viaja `gradle-wrapper.properties`).
3. `Build > Build Bundle(s)/APK(s) > Build APK(s)`.
4. El APK sale en `android/app/build/outputs/apk/debug/app-debug.apk`. Cópialo al móvil e instálalo (activa "orígenes desconocidos").

### Opción B — Línea de comandos (probada, sin Android Studio)

Requiere Android SDK (`android/local.properties` o `$ANDROID_HOME`) y JDK 17. El repo **no incluye el JAR del wrapper** ni el binario de Gradle, y el JDK embebido de Android Studio es JDK 25 (Gradle 8.7 lo rechaza), así que la receta completa en una Mac nueva es:

```bash
# 1) JDK 17 (Temurin, tarball sin sudo) y Gradle 8.7 en ~/jdks
mkdir -p ~/jdks && cd ~/jdks
curl -sL -o jdk17.tgz 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jdk_aarch64_mac_hotspot_17.0.13_11.tar.gz'
tar xzf jdk17.tgz && mv jdk-17.0.13+11 jdk17 && rm jdk17.tgz
curl -sL -o gradle.tgz 'https://services.gradle.org/distributions/gradle-8.7-bin.zip'
tar xzf gradle.tgz && rm gradle.tgz

# 2) Compilar (script del repo encapsula todo)
tools/build_apk.sh                 # APK debug
#  o en un tirón manual:
cd android
JAVA_HOME=~/jdks/jdk17/Contents/Home ANDROID_HOME=~/Library/Android/sdk \
  ~/jdks/gradle-8.7/bin/gradle assembleDebug --no-daemon
```

El output es el mismo: `app/build/outputs/apk/debug/app-debug.apk` (firmada con el debug keystore autogenerado: instalable activando "orígenes desconocidos").

## APK de release firmada

El `signingConfig` es **opcional y basado en archivos**: `android/app/build.gradle` carga `android/keystore/memestudio.properties` si existe (git-ignorado, junto con `memestudio.jks`; el `storeFile` es relativo a esa carpeta). Si existe → `app-release.apk` firmada; si no → unsigned para firmar a posteriori.

```bash
# Generar keystore una vez (no se commitea; CONSERVARLO para futuras updates)
mkdir -p android/keystore
PW=$(openssl rand -hex 12)
~/jdks/jdk17/Contents/Home/bin/keytool -genkeypair -v \
  -keystore android/keystore/memestudio.jks -alias memestudio \
  -keyalg RSA -keysize 2048 -validity 10000 -storepass "$PW" -keypass "$PW" \
  -dname "CN=Meme Studio Pro, OU=ReleaseKey, O=MemeStudioPro"
cat > android/keystore/memestudio.properties <<EOF
storeFile=memestudio.jks
storePassword=$PW
keyAlias=memestudio
keyPassword=$PW
EOF

tools/build_apk.sh release      # → android/app/build/outputs/apk/release/app-release.apk

# Verificar firma (apksigner necesita JAVA_HOME apuntando al JDK 17)
JAVA_HOME=~/jdks/jdk17/Contents/Home \
  ~/Library/Android/sdk/build-tools/*/apksigner verify --print-certs \
  android/app/build/outputs/apk/release/app-release.apk
```

> [!WARNING]
> **Backup del keystore obligatorio** (contraseña de `memestudio.properties` incluida): sin ese `.jks` NO se puede publicar ninguna actualización de la app — Android rechaza instalar una APK firmada con otro certificado *sobre* la existente (Android exige siempre la misma firma). Guárdalo además en un password manager o disco aparte y sube `versionCode` con cada release para que el móvil acepte actualizar.

#### Bundle para Google Play (`.aab`)

Google Play exige el formato **Play App Bundle** (a Play Store se le sube un `.aab`, no un `.apk`; Play genera los APK optimizados por dispositivo). Con este setup ya montado es una orden el bundle **firmado con el mismo keystore**:

```bash
tools/build_apk.sh bundle     # → android/app/build/outputs/bundle/release/app-release.aab
                              # (verás la task :app:signReleaseBundle en el log)
```

En la Play Console: Crear app → **Production/Testing → Create release → Upload el .aab**. La primera vez acepta activar **Play App Signing** (Google custodia la firma de instalación; tu `memestudio.jks` queda como signing/como hace ahora). Sube `versionCode` en `android/app/build.gradle` con cada envie.

## Qué funciona y qué no dentro del móvil

| Función | ¿En Android? |
| :--- | :--- |
| Editor completo (textos, fuentes, capas, transformaciones, undo/redo, borrador) | ✅ idéntico al web |
| Plantillas locales, meme clásico/cine | ✅ |
| Exportar PNG/JPG/WebP | ✅ se guarda en **Galería → Pictures/MemeStudioPro** vía bridge nativo (`window.AndroidSaver`) |
| Memes virales (Imgflip) | ✅ vía API directa (el proxy del backend no existe en el móvil) |
| Búsqueda Reddit | ❌ requiere backend (Arctic Shift) |
| "Quitar fondo real" (rembg/U2-Net) | ❌ en el móvil, **a menos que** configures "Servidor IA" (ver abajo) |

## Servidor IA opcional (quitar fondo real en Android)

`/api/remove-bg` corre con Python + rembg, que no existe en Android. Dos formas de conservar la función:

1. **Servidor en tu LAN (recomendado):** deja `python server.py` corriendo en tu PC y en la app Android abre el acordeón de plantillas → campo **"Servidor IA: http://IP-PC:5005"** → Guardar. El backend ya permite CORS (`allow_origins=["*"]`) y HTTP en claro desde Android via `network_security_config`.
2. Sin servidor: usa el borrador manual (gomma), como siempre.

También disponible desde aquí: los botones **"☁ Subir borrador" / "↧ Traer borrador"** (aparecen con "Servidor IA" configurado) — sincronizan tu meme (imagen, capas, ajustes) con el PC vía `POST/GET /api/draft`.

> **Si el servidor usa contraseñas (`AUTH_USERS` en `.env`):** la WebView del APK no muestra el diálogo de login del navegador, así que el APK no podrá autenticarse. En ese caso usa la **PWA** (abre `http://IP-PC:5005` o `https://tu-tunnel/` en Chrome móvil → "Instalar app"), que sí soporta Basic Auth nativo, o deja `AUTH_USERS` vacío.

## Actualizar el frontend de la app

Los assets son una **copia** del frontend (todo lo servible vive en `public/`). Tras cambiar ficheros en `public/` y subir el `?v=N` de cache-busting:

```bash
# macOS / Linux
rm -rf android/app/src/main/assets/*
cp -R public/. android/app/src/main/assets/
```

```powershell
# Windows
Remove-Item android\app\src\main\assets\* -Recurse -Force
Copy-Item public\* android\app\src\main\assets\ -Recurse -Force
```

y recompila el APK.

## Notas técnicas

- `allowFileAccessFromFileURLs/allowUniversalAccessFromFileURLs = true` son necesarios porque los ES modules (`app.mjs`) no cargan sobre `file://` con origen `null` (same invariant que en escritorio: nunca abrir el HTML con doble clic).
- `usesCleartextTraffic` está permitido para poder apuntar al backend por `http://` en la red local. Nada crítico viaja en ese canal (una imagen y un PNG), pero si se comparte públicamente conviene HTTPS.
- Permisos: solo `INTERNET` (MediaStore de Android 10+ no requiere permisos de almacenamiento).
