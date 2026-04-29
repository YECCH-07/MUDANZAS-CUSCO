/*
 * Service Worker del panel interno de Expresos Ñan.
 *
 * Estrategias:
 *  - /api/panel/*       → NetworkOnly con background sync. Las escrituras
 *                         fallidas offline se encolan y reintentan cuando
 *                         vuelve la conectividad (solo navegadores con Background
 *                         Sync — Chrome Android sí; iOS Safari no).
 *  - /panel/**          → NetworkFirst (1.5 s timeout), fallback a cache.
 *  - Assets (_astro, /panel/icon-*.png, woff2, css, js) → StaleWhileRevalidate.
 *  - Resto              → pasa directo.
 *
 * Versionar SW_VERSION al actualizar para invalidar caches antiguos.
 */
/* eslint-disable no-restricted-globals */
const SW_VERSION = 'v1-2026-04-24';
const CACHE_SHELL = `nan-panel-shell-${SW_VERSION}`;
const CACHE_ASSETS = `nan-panel-assets-${SW_VERSION}`;
const CACHE_PAGES = `nan-panel-pages-${SW_VERSION}`;

const PRECACHE_SHELL = [
  '/panel/',
  '/panel/login/',
  '/panel/manifest.webmanifest',
  '/panel/icon-192.png',
  '/panel/icon-512.png',
  '/wp-content/uploads/2024/05/NAN-2.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) =>
      cache.addAll(PRECACHE_SHELL).catch((err) => {
        // Tolerante: si una URL del shell no existe (ej. dev), no rompe el install.
        console.warn('[sw] precache partial fail:', err);
      }),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.endsWith(SW_VERSION))
          .filter((k) => k.startsWith('nan-panel-'))
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

function isApiPanel(url) {
  return url.pathname.startsWith('/api/panel/');
}
function isPanelPage(url) {
  return url.pathname.startsWith('/panel/') && !url.pathname.includes('.');
}
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/panel/icon-') ||
    /\.(css|js|woff2|svg|webp|png|jpg)$/.test(url.pathname)
  );
}

async function networkFirstPage(request) {
  const cache = await caches.open(CACHE_PAGES);
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ]);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // fallback al shell raíz si existe
    const shell = await caches.open(CACHE_SHELL);
    const root = await shell.match('/panel/');
    if (root) return root;
    return new Response('Sin conexión y sin página cacheada.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_ASSETS);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || fetch(request);
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    // POST/PATCH/DELETE: pasar al network. Background sync se configura en el
    // cliente JS (fetch con { signal } + retry queue manual). Por ahora no
    // interceptamos para no bloquear.
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isApiPanel(url)) return; // pasa a network
  if (isPanelPage(url)) {
    event.respondWith(networkFirstPage(request));
    return;
  }
  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

// Mensaje para invalidar caches manualmente desde el cliente si hace falta.
self.addEventListener('message', (event) => {
  if (event.data === 'cm-panel-clear-caches') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
});
