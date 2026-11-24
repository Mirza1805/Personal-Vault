// =============================================================================
// TaskFlow & Guard Slime - Service Worker (sw.js)
// Progressive Web App Offline Caching & Update Management
// =============================================================================

const CACHE_NAME = 'guard-slime-vault-v7';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// Event: Install - Simpan aset statis ke Cache Storage dan lewati waktu tunggu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Event: Activate - Bersihkan cache versi lama dan klaim kontrol klien
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Event: Fetch - Network-First untuk file inti & navigasi, Cache-First untuk aset statis lainnya
self.addEventListener('fetch', (event) => {
  // Hanya proses permintaan bertipe GET
  if (event.request.method !== 'GET') return;

  // Lewatkan permintaan API eksternal (misal GitHub API)
  if (event.request.url.includes('api.github.com')) {
    return;
  }

  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate';
  const isCoreFile = isNavigation ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/app.js') ||
    url.pathname.endsWith('/style.css') ||
    url.pathname.endsWith('/manifest.json');

  if (isCoreFile) {
    // Strategi Network-First: Ambil versi terbaru dari jaringan, perbarui cache, fallback ke cache jika offline
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (isNavigation) {
              return caches.match('./index.html') || caches.match('./');
            }
          });
        })
    );
  } else {
    // Strategi Cache-First untuk aset non-inti
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
