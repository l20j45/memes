/* Contrato del puente nativo Android <-> web (TEST in two layers).
   Guarda 4 acoplamientos fragiles documentados en android/README_ANDROID.md:
     1. cada window.AndroidSaver.<metodo> que llama app.mjs DEBE declararse
        como fun <metodo>( en MainActivity.kt;
     2. MainActivity debe implementar el file chooser (sin el, el WebView
        ignora los <input type="file"> y "Subir imagen"/"Logo..." mueren);
     3. el HTML que carga la APK sigue llamandose memegnerator.html;
     4. res/xml/file_paths.xml (path="meme/") y el cacheDir "meme" de
        MainActivity.copyImage son el MISMO literal de dos capas. */
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const kt = readFileSync(path.join(ROOT, 'android/app/src/main/java/com/memestudiopro/app/MainActivity.kt'), 'utf8');
const mjs = readFileSync(path.join(ROOT, 'public/app.mjs'), 'utf8');

test('todo AndroidSaver.<metodo> usado en app.mjs existe como fun en MainActivity.kt', () => {
  const jsMethods = [...new Set([...mjs.matchAll(/AndroidSaver\.(\w+)/g)].map((m) => m[1]))];
  const ktMethods = new Set([...kt.matchAll(/(?:@JavascriptInterface\s*)?fun (\w+)\(/g)].map((m) => m[1]));
  for (const name of jsMethods) {
    if (!ktMethods.has(name)) {
      throw new Error(`app.mjs llama AndroidSaver.${name} pero MainActivity.kt no declara fun ${name}(`);
    }
  }
});

test('MainActivity implementa onShowFileChooser (file inputs dejan de funcionar sin el)', () => {
  if (!/onShowFileChooser/.test(kt)) {
    throw new Error('MainActivity.perdio onShowFileChooser: los <input type=file> quedarian muertos en la APK');
  }
});

test('la APK carga memegnerator.html (archivo canonico del front)', () => {
  if (!/loadUrl\("file:\/\/\/android_asset\/memegnerator\.html"\)/.test(kt)) {
    throw new Error('loadUrl ya no apunta a memegnerator.html: renombraste el front o el wrapper');
  }
});

test('file_paths.xml y el cacheDir "meme" de copyImage comparten literal', () => {
  const xml = readFileSync(path.join(ROOT, 'android/app/src/main/res/xml/file_paths.xml'), 'utf8');
  const ktPath = kt.match(/cacheDir,\s*"([^"]+)"/) || [];
  const dirFromXml = (xml.match(/cache-path[^>]*path="([^"]+)"/) || [])[1];
  const normalise = (s) => String(s || '').replace(/\/+$/, ''); // "meme/" == "meme"
  if (!dirFromXml) throw new Error('file_paths.xml no tiene cache-path con path=');
  if (normalise(dirFromXml) !== normalise(ktPath[1])) {
    throw new Error(`FileProvider sirve "${dirFromXml}" pero copyImage escribe en cacheDir/"${ktPath[1]}": desacoplados`);
  }
});
