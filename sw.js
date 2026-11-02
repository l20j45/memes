// Service worker mínimo de Meme Studio Pro: permite instalar la PWA
// (Chrome/Edge) y cargar la interfaz offline. La API (/api/*) siempre va
// a la red: la inferencia de IA no tiene sentido sin servidor.
const CACHE = 'memestudio-v1';
const ASSETS = [
  './',
  './memegnerator.html',
  './styles.css',
  './app.mjs',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Anton&family=Comic+Neue:wght@700&family=Montserrat:wght@800&family=Oswald:wght@700&family=Space+Grotesk:wght@500;700&display=swap',
  'https://fonts.gstatic.com/'
];

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

  // Estáticos y fuentes: cache-first (si cambia el '?v=N' del HTML la URL ya
  // es distinta y se re-descarga sola).
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
      return cached || network;
    })
  );
});
