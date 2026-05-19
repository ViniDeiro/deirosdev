const ASSET_VERSION = '20260519-thank-you';
const CACHE_NAME = `deiros-dev-v3-${ASSET_VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './obrigado/',
  './obrigado/index.html',
  `./styles.css?v=${ASSET_VERSION}`,
  `./script.js?v=${ASSET_VERSION}`,
  './manifest.webmanifest',
  './logo transparente.png',
  './assets/rpx.png',
  './assets/buledecha.png',
  './assets/afrodite.png',
  './assets/ygorx.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isVersionedAsset =
    isSameOrigin &&
    (event.request.destination === 'style' ||
      event.request.destination === 'script' ||
      requestUrl.pathname.endsWith('.css') ||
      requestUrl.pathname.endsWith('.js'));

  const isNavigationRequest =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  if (isNavigationRequest) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            const cacheKey = requestUrl.pathname.startsWith('/obrigado') ? './obrigado/index.html' : './index.html';
            caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(requestUrl.pathname.startsWith('/obrigado') ? './obrigado/index.html' : './index.html'))
    );
    return;
  }

  if (isVersionedAsset) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() =>
          new Response('', {
            status: 503,
            statusText: 'Offline',
          })
        );
    })
  );
});
