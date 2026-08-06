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
| `#/tv` | Landscape / TV two-column (dashboard + calendar) | `electron-container` (Windows kiosk) |

## Calendar Timeline

The schedule calendar timeline shows upcoming weekly events from `config.json`. It renders as a multi-day timeline with events positioned as blocks on a vertical time axis.

### config.json additions (CMS)

```jsonc
{
  "displaySettings": {
    // Calendar columns per screen. 'screen' = use that screen's own settings menu.
    // TV accepts 1–7, tablet accepts 1–3. Code defaults: TV=6, tablet=2.
    // A plain number (legacy) applies to both screens.
    "scheduleDaysAhead": { "tv": 6, "tablet": 2 }
  },
  "weeklySchedule": {
    "sunday": [
      {
        "time": "06:30",          // required, HH:mm
        "endTime": "07:45",       // optional — overrides all heuristics
        "durationMinutes": 75,    // optional — used if endTime absent
        "title": "שחרית",
        "subtitle": "תפילת הציבור", // optional — shown in comfortable density
        "type": "tefilla"         // tefilla | shiur | event
      }
    ]
  }
}
```

When `endTime` and `durationMinutes` are both absent, duration is inferred from the event title and day type (Shabbat/Yom Tov awareness).

### Settings

A "לוח זמנים" toggle in the gear menu disables the calendar from the tablet rotation cycle. TV is unaffected (calendar is always visible).

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
| `src/app/debug/debugFlag.ts` | Debug mode activation (URL flag parser) |
| `src/app/debug/clock.ts` | Clock seam — `now()` with offset support |
| `src/app/components/debug/DebugPanel.tsx` | Developer panel UI |
| `public/icon.svg` | PWA manifest icon |

## Developer Mode

A developer/debug mode gives developers the ability to change the clock time, force specific views, and refresh configuration instantly — without waiting for the real clock or the 5-minute config poll.

### Activation

Add `debug=true` to the URL query:

```
http://localhost:3001/#/?debug=true        (tablet)
http://localhost:3001/#/tv?debug=true       (TV)
```

When the flag is absent, all debug features are completely inert — no badge, no panel, no stored offset is read.

### Debug Panel (Ctrl+Shift+D)

A fixed orange **DEBUG** badge appears in the top-left corner. Clicking it (or pressing `Ctrl+Shift+D`) opens a floating panel with three sections:

#### Clock Time
- **datetime-local input** — pick any date/time
- **Apply & Reload** — persists the time offset in `localStorage` then reloads the page. All time-dependent computations (zmanim, titles, schedule, netz countdown) will reflect the new time.
- **±1h / ±1d nudge buttons** — quick offsets relative to the current shifted time
- **Reset** — clears the offset and returns to real time

The clock keeps ticking from the chosen point (it's an offset, not a freeze). The offset is stored under the key `smartclock-debug` in `localStorage` and is only read when the debug flag is present.

#### Config
- **Refresh Config** — dispatches `refreshConfig()` immediately (normally polled every 5 min)
- **Hard Reload** — full page reload

#### Views
- **Dashboard / Schedule / Messages** buttons — jump to any view instantly
- **Presentation dropdown** — select a specific `activePresentations` slide by index/title
- **Freeze rotation** toggle — pauses the display rotation timer without resetting position
- **Clear Override** — returns to the normal rotation cycle

### localStorage key

```json
// smartclock-debug
{ "offsetMs": -3600000 }
```

The key is ignored (and never read) unless `debug=true` is in the URL. A stale key left behind from a previous debugging session has zero effect on production kiosks.

