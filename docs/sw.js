const CACHE = 'cml-atlas-v31';
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './atlas.html', './lab.html', './graph.json', './papers.json', './figures.json', './style.css', './atlas.js', './app.js', './literature.js', './icon.svg'])));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const u = new URL(event.request.url);
  if (u.origin !== location.origin) return;
  const cacheable = /\/(figures\/|graph\.json|papers\.json|figures\.json|atlas\.js|app\.js|literature\.js|style\.css|atlas\.html|lab\.html|index\.html|icon\.svg|manifest\.webmanifest)/.test(u.pathname) || u.pathname.endsWith('/');
  if (!cacheable || event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Figures never change under a name, so they skip the network once cached.
    if (u.pathname.includes('/figures/')) { const hit = await cache.match(event.request); if (hit) return hit; }
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
