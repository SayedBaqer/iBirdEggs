// iBird Eggs — Service Worker
// Network-first for navigation: always fetches latest HTML when online,
// falls back to cache when offline.
const CACHE = 'ibird-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    // Always try network first for the main page — gets latest code automatically
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' })
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
