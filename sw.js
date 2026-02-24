const CACHE_NAME = "nextlevel-shell-v1";

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png",
];

// Install: cache app-skal
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
});

// Activate: ryd gamle caches
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

// Fetch: data frisk, shell cache
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // ✅ clubs.json skal altid hentes frisk
  if (url.pathname.endsWith("/clubs.json")) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  // ✅ Same-origin: cache-first (hurtig + offline)
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      const res = await fetch(event.request);
      return res;
    })());
    return;
  }

  // Andre origins: normal fetch
  event.respondWith(fetch(event.request));
});
