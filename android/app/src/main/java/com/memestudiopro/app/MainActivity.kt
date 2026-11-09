package com.memestudiopro.app

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipboardManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File

/**
 * Meme Studio Pro — WebView wrapper del editor (memegnerator.html + app.mjs).
 *
 * La WebView carga la app alojada en HOME_URL (https://memes.l20j45.us/), de
 * modo que el login con cuentas del backend (activo por defecto) funcione con
 * cookies same-origin igual que en Chrome. El puente window.AndroidSaver esta
 * inyectado en TODA pagina cargada en esta WebView, incluida la remota:
 * guardar en galeria, copiar y pegar siguen siendo nativos.
 *
 * Si no hay red al arrancar (o cae al cargar la home), cae a los assets
 * locales (file:///android_asset/), que ofrecen el editor basico sin IA ni
 * borradores remotos.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var uploadCallback: ValueCallback<Array<Uri>>? = null

    companion object {
        private const val RC_FILE_CHOOSER = 1001
        // App alojada (PWA del servidor): misma base de codigo que la web y el
        // login con cuentas funciona por cookies same-origin. Cambiar aqui todo.
        private const val HOME_URL = "https://memes.l20j45.us/"
        // Reserva offline: editor basico empaquetado como assets.
        private const val ASSETS_HOME = "file:///android_asset/memegnerator.html"
    }

    private var usedAssetsFallback = false

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
        // targetSdk 35: Android 15+ FUERZA edge-to-edge y la WebView se pintaba
        // DETRAS de la barra de estado y de navegacion (bug reportado: el
        // lienzo salia desfazado y tapado por el reloj/botoneria del sistema).
        // Edge-to-edge explicito en todas las versiones + insets aplicados como
        // padding para que el contenido quede dentro del area segura (incluye
        // el recorte del IME: con adjustResize solo, el teclado tapaba).
        WindowCompat.setDecorFitsSystemWindows(window, false)
        ViewCompat.setOnApplyWindowInsetsListener(webView) { view, insets ->
            val safe = insets.getInsets(
                WindowInsetsCompat.Type.systemBars()
                    or WindowInsetsCompat.Type.displayCutout()
                    or WindowInsetsCompat.Type.ime()
            )
            view.setPadding(safe.left, safe.top, safe.right, safe.bottom)
            WindowInsetsCompat.CONSUMED
        }
        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(
                view: WebView,
                request: android.webkit.WebResourceRequest,
                error: android.webkit.WebResourceError
            ) {
                // Solo si el fallo es del frame principal (un subrecurso roto,
                // p.ej. una miniatura de Imgflip, no debe cambiar de pagina) y
                // aun no hemos caido a los assets: sin red al arrancar abrimos
                // el editor local basico para no quedar en pantalla en blanco.
                if (request.isForMainFrame && !usedAssetsFallback) {
                    usedAssetsFallback = true
                    view.loadUrl(ASSETS_HOME)
                }
            }
        }
        // imprescindible: sin WebChromeClient.onShowFileChooser el WebView
        // IGNORA los <input type="file"> y los botones "Subir imagen" y el
        // logo de la marca de agua quedan muertos (bug reportado).
        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                view: WebView,
                callback: ValueCallback<Array<Uri>>,
                params: FileChooserParams
            ): Boolean {
                uploadCallback?.onReceiveValue(null)      // cancela un picker previo
                uploadCallback = callback
                val accept = params.acceptTypes?.filter { it.isNotBlank() } ?: emptyList()
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = if (accept.isEmpty()) "*/*" else accept.first()
                    if (accept.size > 1) putExtra(Intent.EXTRA_MIME_TYPES, accept.toTypedArray())
                }
                return try {
                    startActivityForResult(
                        Intent.createChooser(intent, "Selecciona una imagen"),
                        RC_FILE_CHOOSER
                    )
                    true
                } catch (e: ActivityNotFoundException) {
                    uploadCallback = null
                    callback.onReceiveValue(null)
                    false
                }
            }
        }
        webView.addJavascriptInterface(ImageSaverBridge(this), "AndroidSaver")
        // Shell remota (PWA del servidor: el front se actualiza sin publicar APK
        // y el login con cuentas funciona por cookies same-origin). Sin red al
        // arrancar, onReceivedError de arriba cae a los assets locales.
        // (Antes cargaba los assets SIEMPRE: la 1.4 se distribuyo como shell
        // remota pero el codigo nunca visitaba HOME_URL.)
        webView.loadUrl(HOME_URL)

        setContentView(webView)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == RC_FILE_CHOOSER) {
            val callback = uploadCallback
            uploadCallback = null
            callback?.onReceiveValue(
                WebChromeClient.FileChooserParams.parseResult(resultCode, data)
            )
        } else {
            super.onActivityResult(requestCode, resultCode, data)
        }
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

    /**
     * Copia INTEGRA el meme (PNG dataURL) al portapapeles del sistema con su
     * URI FileProvider: otras apps (WhatsApp, Telegram...) pueden pegarla.
     * Necesario porque en la WebView sobre file:// no existe
     * navigator.clipboard (origen no seguro).
     */
    @JavascriptInterface
    fun copyImage(dataUrl: String): String {
        return try {
            if (!dataUrl.startsWith("data:image/")) return "No es una imagen"
            val base64 = dataUrl.substringAfter(",", "")
            if (base64.isEmpty()) return "DataURL vacio"
            val bytes = Base64.decode(base64, Base64.DEFAULT)
            val mime = dataUrl.substringAfter("data:", "").substringBefore(";")
            val ext = when {
                mime.contains("jpeg") -> "jpg"
                mime.contains("webp") -> "webp"
                else -> "png"
            }
            val dir = File(context.cacheDir, "meme")
            if (!dir.exists()) dir.mkdirs()
            val file = File(dir, "clipboard.$ext")
            file.writeBytes(bytes)
            val uri = FileProvider.getUriForFile(
                context,
                context.packageName + ".fileprovider",
                file
            )
            val clip = ClipData.newUri(context.contentResolver, "Meme Studio Pro", uri)
            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            cm.setPrimaryClip(clip)
            "ok"
        } catch (e: Exception) {
            e.message ?: e.javaClass.simpleName
        }
    }

    /**
     * Lee el portapapeles del sistema y devuelve data:image/...;base64,... si
     * hay una imagen (o "" si no) — sustituye a navigator.clipboard.read()
     * (inexistente sobre file://) para el boton Pegar.
     */
    @JavascriptInterface
    fun readImage(): String {
        return try {
            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = cm.primaryClip ?: return ""
            for (i in 0 until clip.itemCount) {
                val item = clip.getItemAt(i)
                // 1) texto con dataURL (algunas apps copian asi)
                val text = item.text?.toString()
                if (text != null && text.startsWith("data:image/")) return text
                // 2) clip con URI de imagen (incluido el case nuestro FileProvider)
                val uri = item.uri ?: continue
                val mime = context.contentResolver.getType(uri) ?: continue
                if (!mime.startsWith("image/")) continue
                val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                    ?: continue
                return "data:$mime;base64," + Base64.encodeToString(bytes, Base64.DEFAULT)
            }
            ""
        } catch (e: Exception) {
            ""
        }
    }

    private fun saveToGallery(bytes: ByteArray, filename: String) {        val mime = when {
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
