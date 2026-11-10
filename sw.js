// =============================================================================
// Guard Slime Clicker / Personal Vault - Service Worker (sw.js)
// Progressive Web App Offline Caching (Cache-First dengan Network Fallback)
// =============================================================================

const CACHE_NAME = 'guard-slime-vault-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// Event: Install - Simpan aset statis ke Cache Storage
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Event: Activate - Bersihkan cache versi terdahulu
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

// Event: Fetch - Strategi Cache-First dengan fallback network
self.addEventListener('fetch', (event) => {
  // Hanya proses request bertipe GET
  if (event.request.method !== 'GET') return;

  // Jangan cache permintaan ke API eksternal (misal GitHub API)
  if (event.request.url.includes('api.github.com')) {
    return;
  }

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
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
