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

// ── Notification Scheduling ─────────────────────────────────────────
interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  fireAt: number; // timestamp
}

let scheduledNotifications: ScheduledNotification[] = [];
let activeTimerId: ReturnType<typeof setTimeout> | null = null;
let keepAliveResolve: (() => void) | null = null;

function showScheduledNotification(n: ScheduledNotification) {
  self.registration.showNotification(n.title, {
    body: n.body,
    icon: '/pwa-192.png',
    tag: n.id,
    badge: '/pwa-192.png',
    requireInteraction: false,
  } as NotificationOptions);
}

// Arm a setTimeout for the nearest notification; chain to the next when it fires
function armNextTimer() {
  if (activeTimerId !== null) {
    clearTimeout(activeTimerId);
    activeTimerId = null;
  }

  if (scheduledNotifications.length === 0) {
    // All done — release the waitUntil promise
    if (keepAliveResolve) {
      keepAliveResolve();
      keepAliveResolve = null;
    }
    return;
  }

  // Sort ascending so nearest is first
  scheduledNotifications.sort((a, b) => a.fireAt - b.fireAt);
  const next = scheduledNotifications[0];
  const delay = Math.max(0, next.fireAt - Date.now());

  activeTimerId = setTimeout(() => {
    activeTimerId = null;
    // Fire all notifications that are due (handles multiple at same time)
    const now = Date.now();
    const due = scheduledNotifications.filter((n) => n.fireAt <= now + 500);
    scheduledNotifications = scheduledNotifications.filter((n) => n.fireAt > now + 500);

    for (const n of due) {
      showScheduledNotification(n);
    }

    // Chain to next
    armNextTimer();
  }, delay);
}

// Create a long-lived promise that keeps the SW alive via waitUntil
function ensureKeepAlive(event: ExtendableMessageEvent) {
  if (!keepAliveResolve) {
    event.waitUntil(
      new Promise<void>((resolve) => {
        keepAliveResolve = resolve;
      }),
    );
  }
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const { type, notifications, id } = event.data || {};

  if (type === 'SCHEDULE_NOTIFICATIONS') {
    scheduledNotifications = (notifications as ScheduledNotification[]).filter(
      (n) => n.fireAt > Date.now(),
    );
    if (scheduledNotifications.length > 0) {
      ensureKeepAlive(event);
      armNextTimer();
    }
  }

  if (type === 'SCHEDULE_TIMER_NOTIFICATION') {
    const existing = scheduledNotifications.findIndex((n) => n.id === id);
    if (existing >= 0) scheduledNotifications.splice(existing, 1);
    scheduledNotifications.push(event.data.notification as ScheduledNotification);
    ensureKeepAlive(event);
    armNextTimer();
  }

  if (type === 'CANCEL_TIMER_NOTIFICATION') {
    scheduledNotifications = scheduledNotifications.filter((n) => n.id !== id);
    armNextTimer();
  }

  if (type === 'CANCEL_ALL_NOTIFICATIONS') {
    scheduledNotifications = [];
    armNextTimer(); // will resolve keepAlive since list is empty
  }
});

// When user clicks notification, focus the app
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    }),
  );
});

// ── Caching & Routing ───────────────────────────────────────────────

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
      if (text.includes('FocusFlow') || text.includes('root')) {
        return cached;
      }
    }
  }

  try {
    const response = await fetch(request, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });
    if (response.ok) return response;
  } catch {
    // Network failed
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

// Intercept all fetch requests — cache-first for static assets
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  if (
    event.request.mode === 'navigate' ||
    url.pathname.startsWith('/api')
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

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
