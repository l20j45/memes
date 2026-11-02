package com.memestudiopro.app

import android.annotation.SuppressLint
import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import java.io.File

/**
 * Meme Studio Pro — WebView wrapper del editor (memegnerator.html + app.mjs).
 *
 * El frontend viaja como assets locales; el backend Python (rembg) NO corre en
 * el movil: la app lo detecta via window.AndroidSaver y, si el usuario
 * configura "Servidor IA" en la UI, usa ese http://IP:5005 de su red local.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true                      // localStorage (apiBase, borrador)
            mediaPlaybackRequiresUserGesture = false
            // Los ES modules (app.mjs) sobre file:// se bloquean por CORS si el
            // origen es null; estos flags le dan acceso al bundle de assets.
            allowFileAccess = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true       // fetch a apiBase (LAN)
            useWideViewPort = true
            loadWithOverviewMode = true
        }
        webView.setBackgroundColor(0xFF0B1020.toInt())
        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(ImageSaverBridge(this), "AndroidSaver")
        webView.loadUrl("file:///android_asset/memegnerator.html")

        setContentView(webView)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }
}

/**
 * Puente JS <-> nativo. Llamable desde app.mjs como:
 *   window.AndroidSaver.saveImage(dataUrlBase64, "meme-123.png")
 * -> "ok" | mensaje de error.
 */
class ImageSaverBridge(private val context: Context) {

    @JavascriptInterface
    fun saveImage(dataUrl: String, filename: String): String {
        return try {
            if (!dataUrl.startsWith("data:image/")) return "No es una imagen"
            val base64 = dataUrl.substringAfter(",", "")
            if (base64.isEmpty()) return "DataURL vacio"
            val bytes = Base64.decode(base64, Base64.DEFAULT)
            if (bytes.size < 100) return "Imagen demasiado pequena"

            saveToGallery(bytes, filename)
            "ok"
        } catch (e: Exception) {
            e.message ?: e.javaClass.simpleName
        }
    }

    private fun saveToGallery(bytes: ByteArray, filename: String) {
        val mime = when {
            filename.endsWith(".jpg", true) || filename.endsWith(".jpeg", true) -> "image/jpeg"
            filename.endsWith(".webp", true) -> "image/webp"
            else -> "image/png"
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 10+: MediaStore, sin permisos de almacenamiento
            val values = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                put(MediaStore.MediaColumns.MIME_TYPE, mime)
                put(MediaStore.MediaColumns.RELATIVE_PATH, "Pictures/MemeStudioPro")
                put(MediaStore.MediaColumns.IS_PENDING, 1)
            }
            val resolver = context.contentResolver
            val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
                ?: throw IllegalStateException("MediaStore no acepto el archivo")
            resolver.openOutputStream(uri)?.use { it.write(bytes) }
                ?: throw IllegalStateException("No se pudo abrir el stream de salida")
            values.clear()
            values.put(MediaStore.MediaColumns.IS_PENDING, 0)
            resolver.update(uri, values, null, null)
        } else {
            // Android < 10: carpeta de la app (sin permisos; visible por USB)
            val dir = File(context.getExternalFilesDir(null), "MemeStudioPro")
            if (!dir.exists()) dir.mkdirs()
            File(dir, filename).writeBytes(bytes)
        }
    }
}
