# 📱 Releases de Meme Studio Pro (APK)

Binarios de Android listos para instalar, construidos desde el código fuente de este repo.

## Descargar e instalar

| Archivo | Para qué |
| :--- | :--- |
| [`MemeStudioPro-1.1.apk`](MemeStudioPro-1.1.apk) | **Instala esto** en el móvil (APK release, firmada) — añade figuras cuadros-de-texto (`versionCode 2`) |
| `MemeStudioPro-1.0.apk` / `MemeStudioPro-1.0.aab` | Release anterior (histórico) |
| `MemeStudioPro-1.1.aab` | Formato de **Google Play** (no instala directo; lo sube la Play Console) |

Instalación del APK:
1. Copia `MemeStudioPro-1.0.apk` al móvil y ábrelo (o `adb install MemeStudioPro-1.0.apk`).
2. Android pedirá autorizar "Instalar apps de origen desconocido" la primera vez.
3. Listo: el editor completo corre local (los exportes van a *Galería → Pictures/MemeStudioPro*).

Features de la build: editor completo con capas, **recorte por nodos**, **marca de agua de imagen (logo)**, **candado de imágenes**, **pinch-zoom del lienzo**, copiar/pegar nativos y sincronización de borradores — ver [README](../README.md).

## Verificación de integridad (SHA-256)

```
a21538ee9a817f141ec38c0baaf7a30b8eef2062388bdc8959df80748acbcb9b  MemeStudioPro-1.1.apk
74e97a584c5f45acd395f7bc1175d221a2f4e84bb7452ee4affcafb08c4f9e0f  MemeStudioPro-1.1.aab
8e1818f6af0aa91548fadbc4170fda266235b897cce3b38aa447fe062f5c9fa3  MemeStudioPro-1.0.apk
908f8c60952110938ca42be8ac7497cf6e821e88c8defa1ad4ad1868687d5f33  MemeStudioPro-1.0.aab
```

Comprueba en el teléfono/máquina: `shasum -a 256 MemeStudioPro-1.0.apk` (Linux/macOS) o `certutil -hashfile MemeStudioPro-1.0.apk SHA256` (Windows).

## Detalles de la build

- **Versión actual:** 1.1 (`versionCode 2`) · **minSdk 24** (Android 7.0+) · targetSdk 35. _1.0 = versión histórica (sin figuras)._
- **Firma:** release, certificado `CN=Meme Studio Pro, OU=ReleaseKey` — las **actualizaciones** de estas APK exigen el mismo certificado (ver warning del keystore en [`android/README_ANDROID.md`](../android/README_ANDROID.md#apk-de-release-firmada)).
- Front incluido: estado del commit indicado abajo; el editor NO se auto-actualiza en la APK (una nueva build de front requiere una APK nueva).
- Construida con `tools/build_apk.sh release` / `bundle` (ver receta en `android/README_ANDROID.md`).

> Para publicar una nueva versión: sube `versionCode`/`versionName` en `android/app/build.gradle`, recompila y copia los nuevos binarios a esta carpeta con el nombre `MemeStudioPro-<versión>.apk`.
