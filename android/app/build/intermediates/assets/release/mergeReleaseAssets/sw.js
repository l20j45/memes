// Service worker mínimo de Meme Studio Pro: permite instalar la PWA
// (Chrome/Edge) y cargar la interfaz offline. La API (/api/*) siempre va
// a la red: la inferencia de IA no tiene sentido sin servidor.
//
// v2: los documentos app (HTML/CSS/JS) son network-first — si el navegador
// online siempre tiene la version del servidor; el cache queda como fallback
// offline. Cache-first solo para fuentes/iconos (contenido estable). Esto
// evita que el SW sirva para siempre un HTML antiguo (bug del login: el
// modal cacheado mostraba un modo registro desactualizado).
const CACHE = 'memestudio-v2';
const ASSETS = [
  './',
  './memegnerator.html',
  './styles.css',
  './favicon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];
const STABLE = [
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/'
];

const fetchAndCache = (request) => {
  const network = fetch(request).then((response) => {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  });
  return network.catch(() => caches.match(request));
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  // API: siempre red (fallback a cache si estamos offline, por si acaso)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Fuentes (origen externo): cache-first, no cambian nunca.
  if (STABLE.some((base) => url.href.startsWith(base))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetchAndCache(event.request))
    );
    return;
  }

  // Documentos app y assets del propio origen: network-first con fallback
  // a cache para poder seguir usandolo sin conexion. El '?v=N' del HTML
  // sigue rompiendo la URL del JS en cada version.
  event.respondWith(fetchAndCache(event.request));
});
