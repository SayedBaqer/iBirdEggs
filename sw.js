// iBird Eggs — Service Worker
// Network-first for navigation: always fetches latest HTML when online,
// falls back to cache when offline.
const CACHE = 'ibird-v4'; // Eggs Track rename

self.addEventListener('install', () => {
  // Do NOT skipWaiting here — wait for page to post SKIP_WAITING after user
  // taps Refresh on the update banner. Calling it here bypasses the waiting
  // state, so the banner detection never fires.
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
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
