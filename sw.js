self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ✅ clubs.json skal altid hentes frisk (ingen cache)
  if (url.pathname.endsWith("/clubs.json")) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  // Default: lad browseren håndtere alt andet normalt
  event.respondWith(fetch(event.request));
});
