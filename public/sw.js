const CACHE_NAME = "bichridigital-cache-v2-push";

const STATIC_ASSETS = [
  "/",
  "/logo.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (
    requestUrl.origin === self.location.origin &&
    (requestUrl.pathname === "/api/push/subscribe" ||
      requestUrl.pathname === "/api/push/unsubscribe")
  ) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match("/");
        })
      )
  );
});

self.addEventListener("push", (event) => {
  let payload;
  try {
    payload = event.data ? event.data.json() : null;
  } catch {
    return;
  }
  if (!payload || typeof payload.newsId !== "string" || typeof payload.title !== "string" || !payload.newsId || !payload.title) return;
  const target = typeof payload.url === "string" ? payload.url : "";
  let targetUrl;
  try {
    targetUrl = new URL(target, self.location.origin);
    if (targetUrl.origin !== self.location.origin || !targetUrl.pathname.startsWith("/tv/news/")) return;
  } catch { return; }
  event.waitUntil(self.registration.showNotification(payload.title.slice(0, 100), {
    body: typeof payload.summary === "string" ? payload.summary.slice(0, 180) : "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: `tv-news-${payload.newsId}`,
    renotify: payload.isBreaking === true,
    data: { url: targetUrl.href },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const value = event.notification.data?.url;
    if (typeof value !== "string") return;
    let target;
    try { target = new URL(value); } catch { return; }
    if (target.origin !== self.location.origin || !target.pathname.startsWith("/tv/news/")) return;
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if ("navigate" in client) await client.navigate(target.href);
      return client.focus();
    }
    return self.clients.openWindow(target.href);
  })());
});
