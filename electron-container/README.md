# electron-container

Windows kiosk container for the Smart Clock PWA. Desktop counterpart to
`react-container` (Android/Expo). Loads the deployed PWA in a fullscreen,
origin-locked Electron window; offline support comes entirely from the
smart-clock service worker.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Build + run against `http://localhost:3001` (start `smart-clock` first) |
| `npm run verify` | Type-check + unit tests |
| `npm run pack:dir` | Unpacked build in `release/win-unpacked` (fast smoke test) |
| `npm run dist:win` | NSIS installer at `release/SmartClockSetup-<version>.exe` |
| `npm run install:local` | Build the installer and install it on this PC (needs admin) |
| `npm run icon` | Regenerate `build/icon.ico` from the repo-root `icon.svg` |

## Behavior

- **URL**: production `https://tygro101.github.io/jewish-kneset-monorepo/#/tv` when
  packaged, `http://localhost:3001/#/tv` otherwise (`src/main/config.ts`). The
  `#/tv` hash route selects the landscape dashboard layout. The connectivity
  probe uses the fragment-free base URL (fragments are not sent over HTTP).
- **Offline**: Electron's default session is persistent, so the Workbox SW,
  Cache Storage, IndexedDB and `localStorage` (tenant id) survive restarts.
  **The first launch requires network** — same limitation as the Android container.
- **Updates**: content updates arrive through the SW (`registration.update()`
  every 30 min, plus a reload on reconnect). The container itself has no
  auto-update; reinstall to update the shell.
- **Origin lock**: navigation is restricted to the target origin *and* path
  prefix, `about:blank`, and the bundled offline page. `window.open` is denied.
- **Kiosk**: fullscreen, frameless, no menu, `powerSaveBlocker` prevents display
  sleep, `backgroundThrottling` disabled, single-instance lock.
- **Auto-launch**: the installer writes
  `HKLM\Software\Microsoft\Windows\CurrentVersion\Run\SmartClock`, so the kiosk
  starts at logon for **any** user on the machine. Uninstall removes it.

## Operator shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+Q` | Quit |
| `Ctrl+Shift+R` | Reload the display |
| `Ctrl+Shift+I` | DevTools (**dev builds only**) |

## Verification checklist

Run on the target PC after `npm run install:local`, and record results here.

- [ ] First launch online: clock renders, tenant selection persists after restart
- [ ] `%APPDATA%\Smart Clock\` contains `Cache`, `Service Worker`, `IndexedDB`,
      `Local Storage`
- [ ] Quit, disconnect network, relaunch: clock renders from cache (no fallback page)
- [ ] Cached presentation images/PDFs still display offline (`tenant-presentations`)
- [ ] Deactivate a presentation in the CMS while online: it disappears within one
      config poll (`config.json` is NetworkFirst)
- [ ] Launch with no network and an empty cache: Hebrew fallback page with
      countdown, then auto-recovery once the network returns
- [ ] Display does not sleep after the Windows sleep timeout
- [ ] Reboot: kiosk starts automatically at logon
- [ ] Uninstall: Run key removed, app no longer autostarts

## Differences vs `react-container`

| | react-container | electron-container |
|---|---|---|
| Orientation | portrait lock | follows the Windows display (landscape) |
| Container updates | rebuild APK + `adb install` | rebuild installer + reinstall |
| Autostart | launcher/kiosk app | HKLM Run key |

## Development

```bash
# Terminal 1 — start the smart-clock dev server
cd ../smart-clock && npm start

# Terminal 2 — run the electron container
cd ../electron-container && npm run dev
```

The dev build loads `http://localhost:3001/` and enables DevTools via `Ctrl+Shift+I`.

## Architecture

```
src/main/
  main.ts          — app lifecycle, window creation, event wiring
  config.ts        — URL constants, resolveTargetUrl(), buildUserAgent()
  origin-lock.ts   — isAllowedNavigation() predicate
  load-retry.ts    — nextRetryDelay() backoff, shouldRetryLoadFailure()
  connectivity.ts  — ConnectivityMonitor class (poll + debounce + onReconnect)
  power.ts         — powerSaveBlocker start/stop
  shortcuts.ts     — buildShortcutTable() (pure, no Electron import)
static/
  offline.html     — Hebrew fallback page with retry countdown
build/
  installer.nsh    — NSIS custom install/uninstall (HKLM Run key)
  icon.ico         — app icon (256/128/64/48/32/16 px)
tests/
  *.test.ts        — vitest unit tests for all pure logic modules
```

All pure logic modules (config, origin-lock, load-retry, connectivity, shortcuts)
have zero Electron imports and are tested with `vitest` in plain Node.
