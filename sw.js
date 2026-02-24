const CACHE = "klubinfo-v14"; // <-- bump version når du ændrer filer
const ASSETS = [
  "./",
  "./index.html",
  "./clubs.json",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png",
  "./logo.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === CACHE ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  const isHTML =
    e.request.mode === "navigate" ||
    url.pathname.endsWith("/index.html");

  const isData = url.pathname.endsWith("/clubs.json");

  // HTML + clubs.json: Network-first (auto-opdater), fallback til cache (offline)
  if (isHTML || isData) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match("./")))
    );
    return;
  }

  // Alt andet: Cache-first
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
