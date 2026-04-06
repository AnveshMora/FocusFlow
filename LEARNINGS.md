# FocusFlow — Project Learnings

> A structured daily routine execution app (PWA) built with React/Vite/Tailwind/Zustand + Express backend over ~4 days of iterative development.

---

## 🏗️ Architecture Decisions

### What Worked
- **Zustand + localStorage persistence** — Dead simple state management. No Redux boilerplate, persist middleware just works. Perfect for a single-user app.
- **PWA with `injectManifest`** — Custom service worker gave us full control over caching, offline fallback, and notification scheduling. `generateSW` would've been too limiting.
- **Timestamp-based timer** — Using `Date.now()` instead of `setInterval` counting means the timer survives app backgrounding. When the user returns, it just recalculates elapsed time.
- **JSON file sync backend** — For a single-user app, a JSON file is simpler than a database. Read-modify-write with a mutex lock handled concurrency fine.

### What We'd Do Differently
- **Start with `injectManifest` from day one** — We initially used `generateSW`, then had to migrate when we needed custom SW logic. The migration caused caching headaches.
- **Design the sync protocol upfront** — The merge strategy evolved through 3 iterations (naive overwrite → last-write-wins per activity → timestamp-based settings merge). Should've designed this before writing code.

---

## 🐛 Hardest Bugs & Fixes

### 1. Service Worker Serving Stale Code (Severity: Critical)
**Symptom:** New features not appearing despite rebuilding.  
**Root Cause:** `devOptions: { enabled: true }` in vite-plugin-pwa registered a dev service worker on localhost that cached old bundles and served them even from `vite preview`.  
**Fix:** Removed `devOptions`, added auto-unregister logic on localhost in `main.tsx`.  
**Lesson:** Service workers are powerful but dangerous — a stale SW will silently serve old code and you'll think your changes aren't deploying.

### 2. Cross-Device Sync Race Condition (Severity: High)
**Symptom:** Phone showed 52%, laptop showed 32%. Both syncing but data not converging.  
**Root Cause:** Two concurrent `/merge` requests read the same server state, each merged independently, then wrote back — second write overwrote the first's changes.  
**Fix:** Added a mutex lock around the read-modify-write cycle in the sync endpoint.  
**Lesson:** Any read-modify-write on shared state needs a lock, even in a "simple" single-file backend.

### 3. Sync Feedback Loop (Severity: Medium)
**Symptom:** Infinite sync requests flooding the server.  
**Root Cause:** Applying merged state to the Zustand store triggered the store subscription → which triggered another sync → which applied state → triggered subscription...  
**Fix:** `skipNextSubRef` flag that skips one subscription callback after applying merged data.  
**Lesson:** Bidirectional sync + reactive stores = feedback loops. Always have a "don't react to my own writes" mechanism.

### 4. Settings Overwrite on Sync (Severity: Medium)
**Symptom:** Phone's custom settings reset to defaults after laptop synced.  
**Root Cause:** Merge always took `client.settings ?? server.settings` — laptop's defaults always won because they were non-null.  
**Fix:** Added `updatedAt` timestamp to settings; merge compares timestamps, newer wins.  
**Lesson:** "Use client value if present" is not a merge strategy. Every piece of synced data needs a timestamp or version vector.

### 5. Notifications Not Firing in Background (Severity: Medium)
**Symptom:** Pomodoro completion and activity check-in notifications never appeared when app was minimized.  
**Root Cause:** `window.setTimeout()` gets frozen when browser tab is backgrounded.  
**Fix:** Delegated notification scheduling to Service Worker using `postMessage` + `setTimeout` chain + `event.waitUntil()` to keep SW alive.  
**Lesson:** Main thread timers are unreliable for background work. Service Workers are the right place for time-sensitive background tasks in PWAs.

---

## 📱 PWA-Specific Learnings

1. **ngrok + PWA = tricky** — ngrok returns HTML error pages (not network errors) when tunnel is down. The SW cached these error pages as the app shell. Fix: validate cached HTML contains app markers before serving.

2. **iOS Safari limitations** — Service workers have restricted lifetimes on iOS. `waitUntil` helps but isn't guaranteed for long durations. True background notifications require Web Push (server-side).

3. **Cache busting is essential** — Added `Cache-Control: no-cache` meta tags and version tags in the UI header to verify which bundle is actually running. Without this, debugging caching issues is impossible.

4. **SW registration strategy matters** — Only register service workers on production origins (ngrok/deployed), never on localhost during development. A dev SW will haunt you.

---

## 🎨 UX Learnings

1. **Red ≠ motivation during an active day** — Showing red/penalties for incomplete activities mid-day feels punitive. Changed to amber/orange ("you still have time") and only penalize after the day ends. Small color change, big psychological difference.

2. **Trust-based checkpoints** — Fixed intervals are annoying. The PRD's 5→10→20→40→60 min adaptive pattern rewards engagement with fewer interruptions. Users who respond "Yes" earn longer intervals; ignoring brings more frequent checks.

3. **Morning ritual reduces cold starts** — A greeting + sleep rating + optional meditation on new day helps users transition into their routine instead of staring at a blank checklist.

4. **Version tag in header** — Tiny addition (`v1.0.2` in the app bar) that saved hours of debugging. Always know which build is actually running on each device.

---

## 🔧 Technical Patterns Worth Reusing

| Pattern | Where Used | Why |
|---|---|---|
| Timestamp-based timers | Timer store | Survives backgrounding, no drift |
| Mutex lock on file I/O | Sync endpoint | Prevents concurrent merge corruption |
| `skipNextSubRef` | Zustand sync hook | Breaks reactive feedback loops |
| SW notification chain | Service worker | `setTimeout` chain + `waitUntil` for precise background scheduling |
| `visibilitychange` listener | Timer, day rollover | Catch up on missed work when app returns to foreground |
| `focus` event + interval | Day initialization | Detect midnight rollover on app resume |

---

## 📊 Project Stats

- **Stack:** React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + Zustand 4 / Express 4
- **Frontend pages:** 6 (Home, Activity, Timer, Analytics, Schedule, Settings)
- **Key components:** CheckpointModal, MorningRitualModal, MeditationPlayer, TimelineCard, ProgressRing
- **Custom hooks:** useSync, useNotifications
- **Service worker:** Custom with precaching, offline fallback, notification scheduling
- **Sync protocol:** Bidirectional merge with per-activity last-write-wins + settings timestamp comparison
- **Development time:** ~4 days iterative (PRD → MVP → bug fixes → feature completion)

---

## 🚀 What's Next (Parked Items)

- **Web Push Notifications** — Server-side scheduling for notifications that work even when browser is killed
- **Admin Panel** — Remote schedule management, viewing stats from another device
- **Social Accountability** — Friends/partner visibility (PRD section 5)
- **Visual Guides** — Workout GIFs/images for stretch modules (PRD 3.3A)
- **Travel Mode** — Commute session tracking with podcast logging (PRD 3.3D)
- **DND Mode** — System-level Do Not Disturb during focus sessions
