const CACHE = 'cml-atlas-v17';
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './atlas.html', './graph.json', './figures.json', './style.css', './atlas.js'])));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const u = new URL(event.request.url);
  if (u.origin !== location.origin) return;
  const cacheable = /\/(figures\/|graph\.json|figures\.json|atlas\.js|style\.css|atlas\.html|index\.html|icon\.svg|manifest\.webmanifest)/.test(u.pathname) || u.pathname.endsWith('/');
  if (!cacheable || event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(event.request);
      if (res.ok) cache.put(event.request, res.clone());
      return res;
    } catch {
      const hit = await cache.match(event.request);
      if (hit) return hit;
      throw new Error('offline');
    }
  })());
});
