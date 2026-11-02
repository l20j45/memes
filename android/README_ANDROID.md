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

### Opción B — Línea de comandos

Requiere Android SDK (`ANDROID_HOME`) y JDK 17. Como el repo no incluye el JAR del wrapper (binario), genera el wrapper una vez y compila:

```bash
cd android
gradle wrapper            # requiere un Gradle local (`choco install gradle` o manual)
./gradlew assembleDebug
```

El output es el mismo: `app/build/outputs/apk/debug/app-debug.apk`.

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
