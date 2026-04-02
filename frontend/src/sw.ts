/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

// Take control immediately
self.skipWaiting();
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});

// Clean up old caches from previous versions
cleanupOutdatedCaches();

// Precache all build assets (injected by vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST);

// Cache API calls with network-first strategy
registerRoute(
  /^https?:\/\/.*\/api\/.*/i,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 3600 })],
  }),
  'GET'
);

// Hardcoded minimal offline fallback HTML
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FocusFlow – Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; color: #e0e0e0; font-family: -apple-system, system-ui, sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
    .card { text-align: center; max-width: 360px; }
    h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    p { color: #a0a0a0; margin-bottom: 1.5rem; line-height: 1.5; }
    button { background: #6c63ff; color: white; border: none; padding: 0.75rem 2rem;
             border-radius: 0.5rem; font-size: 1rem; cursor: pointer; }
    button:active { opacity: 0.8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📵 You're Offline</h1>
    <p>FocusFlow can't load right now. Please connect to the internet and try again.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</body>
</html>`;

// Custom navigation handler — serves cached index.html, validates it's actually our app
const navigationHandler = async ({ request }: { request: Request }) => {
  // Try to get our precached index.html
  const cache = await caches.open('workbox-precache-v2-' + self.registration.scope);
  const keys = await cache.keys();
  const indexKey = keys.find((k) => {
    const url = new URL(k.url);
    return url.pathname === '/' || url.pathname.endsWith('/index.html');
  });

  if (indexKey) {
    const cached = await cache.match(indexKey);
    if (cached) {
      const text = await cached.clone().text();
      // Validate it's actually our app, not an ngrok error page
      if (text.includes('FocusFlow') || text.includes('root')) {
        return cached;
      }
    }
  }

  // Fallback: try network (for initial install / fresh visit)
  try {
    const response = await fetch(request, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });
    if (response.ok) return response;
  } catch {
    // Network failed — serve offline page
  }

  return new Response(OFFLINE_HTML, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};

const navRoute = new NavigationRoute(navigationHandler as any, {
  allowlist: [/^\/(?!api)/],
});
registerRoute(navRoute);

// Intercept all fetch requests — if we get an ngrok error page, try cache
self.addEventListener('fetch', (event: FetchEvent) => {
  // Only handle non-navigation, non-API requests that workbox doesn't handle
  const url = new URL(event.request.url);
  if (
    event.request.mode === 'navigate' ||
    url.pathname.startsWith('/api')
  ) {
    return; // Handled by routes above
  }

  // For static assets: try cache first, then network
  event.respondWith(
    (async () => {
      // Check all caches for this asset
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      // Try network
      try {
        const response = await fetch(event.request);
        if (response.ok) return response;
      } catch {
        // Network failed
      }

      return new Response('', { status: 503 });
    })()
  );
});
