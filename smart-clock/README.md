# Smart Clock — Offline-First PWA

A fullscreen clock display for bet knesset showing prayer times (zmanim), Hebrew dates, and daily titles. All computations are performed client-side using `@hebcal/core`, `@hebcal/learning`, and `suncalc` — no runtime server calls needed.

## PWA / Offline Support

The app is configured as a Progressive Web App with a service worker (via `vite-plugin-pwa` / Workbox):

- **Precaching**: All JS, CSS, fonts, web workers, and the HTML shell are precached on first load.
- **Offline**: After the first online load, the app runs entirely offline from the SW cache.
- **Auto-update**: The SW polls the host every 30 minutes for new builds. When detected, assets are downloaded and the page reloads automatically (brief flicker).
- **Daily recalculation**: Zmanim and titles recalculate at local midnight and on visibility-restore, so an always-on device stays correct across days.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server on port 3001 |
| `npm run dev:local` | Dev server exposed on LAN |
| `npm run build` | Production build → `build/` (includes `sw.js`) |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Vitest tests |

## Building for Production

```bash
npm run build
```

Output is in `build/`. Deploy the contents to a static HTTPS host. Devices running the `react-container` app will auto-update via the service worker.

## Configuration

- **Location**: Hardcoded to `CitiesEnum.NETIVOT_NEVA_SHARON` in `ClockView.tsx`. To change location, update the enum value and rebuild.
- **Update interval**: 30 minutes, set in `main.tsx` (`UPDATE_INTERVAL_MS`).
- **Precache patterns**: Configured in `vite.config.ts` under the `VitePWA` plugin options.

## Routes

Hash-based routing — no server-side rewrites needed, offline-safe via Workbox precache.

| Route | Layout | Consumer |
|-------|--------|----------|
| `/` or `#/` (default) | Portrait / tablet stack (3 rows) | `react-container` (Android) |
| `#/tv` | Landscape / TV two-column (rail + zmanim) | `electron-container` (Windows kiosk) |

## Key Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | PWA plugin config (Workbox, manifest, precache patterns) |
| `src/main.tsx` | SW registration, periodic update poll, route → dashboard selection |
| `src/app/routing/routes.ts` | `parseRoute()`, `AppRoute` type, `TV_HASH` constant |
| `src/app/routing/useRoute.ts` | `useRoute()` hook — `hashchange` subscription |
| `src/app/hooks/useDailyRecalc.ts` | Midnight recalculation hook |
| `src/app/components/clock-view/ClockView.tsx` | Tablet/portrait dashboard |
| `src/app/components/tv-view/TvClockView.tsx` | Landscape/TV dashboard |
| `src/app/components/tv-view/TvClockView.scss` | TV layout + scoped leaf overrides |
| `public/icon.svg` | PWA manifest icon |

