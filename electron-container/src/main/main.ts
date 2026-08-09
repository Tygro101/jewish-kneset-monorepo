import { app, BrowserWindow, Menu, globalShortcut, net, powerMonitor, session } from 'electron';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  CONNECTIVITY_DEBOUNCE_MS,
  CONNECTIVITY_POLL_MS,
  CONNECTIVITY_PROBE_TIMEOUT_MS,
  allowedPrefixes,
  buildUserAgent,
  resolveBaseUrl,
  resolveTargetUrl,
} from './config';
import { ConnectivityMonitor } from './connectivity';
import { windowIconPath } from './icon';
import { nextRetryDelay, shouldRetryLoadFailure } from './load-retry';
import { isAllowedNavigation, type OriginLockOptions } from './origin-lock';
import { isKeepAwakeActive, reArmKeepAwake, startKeepAwake, stopKeepAwake } from './power';
import { buildShortcutTable } from './shortcuts';

const TARGET_URL = resolveTargetUrl(app.isPackaged);
const PROBE_URL = resolveBaseUrl(app.isPackaged);
const OFFLINE_PAGE_PATH = path.join(app.getAppPath(), 'static', 'offline.html');
const OFFLINE_PAGE_URL = pathToFileURL(OFFLINE_PAGE_PATH).href;

const lockOptions: OriginLockOptions = {
  allowedPrefixes: allowedPrefixes(app.isPackaged),
  offlineFileUrl: OFFLINE_PAGE_URL,
};

let mainWindow: BrowserWindow | null = null;
let monitor: ConnectivityMonitor | null = null;
let failedAttempts = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

/** HEAD request straight to the host — bypasses the service worker cache. */
function createProbe(url: string): () => Promise<boolean> {
  return () =>
    new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (value: boolean) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      let request: Electron.ClientRequest;
      try {
        request = net.request({ method: 'HEAD', url });
      } catch {
        finish(false);
        return;
      }

      const timeout = setTimeout(() => {
        try {
          request.abort();
        } catch {
          /* ignore */
        }
        finish(false);
      }, CONNECTIVITY_PROBE_TIMEOUT_MS);

      request.on('response', (response) => {
        clearTimeout(timeout);
        response.on('data', () => undefined); // drain
        response.on('end', () => undefined);
        finish(response.statusCode > 0 && response.statusCode < 500);
      });
      request.on('error', () => {
        clearTimeout(timeout);
        finish(false);
      });

      request.setHeader('Cache-Control', 'no-cache');
      request.end();
    });
}

function clearRetryTimer(): void {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
}

function loadTarget(win: BrowserWindow): void {
  clearRetryTimer();
  void win.loadURL(TARGET_URL);
}

function showOfflinePage(win: BrowserWindow, retrySeconds: number, errorCode: number): void {
  void win.loadFile(OFFLINE_PAGE_PATH, {
    query: { retry: String(retrySeconds), code: String(errorCode) },
  });
}

function scheduleRetry(win: BrowserWindow, errorCode: number): void {
  failedAttempts += 1;
  const delay = nextRetryDelay(failedAttempts);
  console.warn(
    `[Load] Failed (code ${errorCode}). Attempt ${failedAttempts}, retrying in ${delay / 1000}s.`,
  );
  showOfflinePage(win, delay / 1000, errorCode);
  clearRetryTimer();
  retryTimer = setTimeout(() => {
    retryTimer = null;
    if (!win.isDestroyed()) void win.loadURL(TARGET_URL);
  }, delay);
}

function registerShortcuts(win: BrowserWindow): void {
  for (const binding of buildShortcutTable(app.isPackaged)) {
    const registered = globalShortcut.register(binding.accelerator, () => {
      switch (binding.action) {
        case 'quit':
          console.log('[Shortcut] Quit requested.');
          app.quit();
          break;
        case 'reload':
          console.log('[Shortcut] Manual reload requested.');
          loadTarget(win);
          break;
        case 'toggle-devtools':
          win.webContents.toggleDevTools();
          break;
      }
    });
    if (!registered) {
      console.warn('[Shortcut] Could not register', binding.accelerator);
    }
  }
}

/** Permissions the kiosk is allowed to hold. Everything else is denied. */
const ALLOWED_PERMISSIONS = new Set(['fullscreen', 'screen-wake-lock']);

/**
 * Re-establishes the display-sleep blocker after OS power transitions.
 * Windows can silently drop the request across resume / session change, and
 * without this the screen starts sleeping again with no visible error.
 */
function registerPowerEvents(): void {
  const reArm = () => reArmKeepAwake();

  powerMonitor.on('resume', () => { console.log('[Power] resume — re-arming keep-awake.'); reArm(); });
  powerMonitor.on('unlock-screen', () => { console.log('[Power] unlock-screen — re-arming keep-awake.'); reArm(); });
  powerMonitor.on('on-ac', () => { console.log('[Power] on-ac — re-arming keep-awake.'); reArm(); });
  powerMonitor.on('on-battery', () => { console.log('[Power] on-battery — re-arming keep-awake.'); reArm(); });

  // Log-only: we do not fight the OS here, we just want it in the field logs.
  powerMonitor.on('suspend', () => console.warn('[Power] System suspend.'));
  powerMonitor.on('lock-screen', () => console.warn('[Power] Screen locked.'));
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    kiosk: true,
    frame: false,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    title: 'Smart Clock',
    icon: windowIconPath(app.getAppPath()),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      // A clock must keep ticking even when the window is occluded.
      backgroundThrottling: false,
      devTools: !app.isPackaged,
    },
  });

  win.setMenuBarVisibility(false);

  // --- Origin lock ---
  win.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedNavigation(url, lockOptions)) {
      event.preventDefault();
      console.warn('[OriginLock] Blocked navigation to', url);
    }
  });
  win.webContents.on('will-redirect', (event, url) => {
    if (!isAllowedNavigation(url, lockOptions)) {
      event.preventDefault();
      console.warn('[OriginLock] Blocked redirect to', url);
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    console.warn('[OriginLock] Blocked window.open to', url);
    return { action: 'deny' };
  });

  // --- Offline resilience ---
  win.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, _validatedURL, isMainFrame) => {
      if (!shouldRetryLoadFailure(errorCode, isMainFrame)) return;
      console.warn('[Load] did-fail-load', errorCode, errorDescription);
      scheduleRetry(win, errorCode);
    },
  );
  win.webContents.on('did-finish-load', () => {
    const current = win.webContents.getURL();
    if (current.startsWith('file://')) return; // fallback page, not a real success
    if (failedAttempts > 0) console.log('[Load] Recovered after', failedAttempts, 'failure(s).');
    failedAttempts = 0;
    clearRetryTimer();
  });
  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Renderer] Process gone:', details.reason);
    loadTarget(win);
  });
  win.webContents.on('unresponsive', () => {
    console.error('[Renderer] Unresponsive — reloading.');
    loadTarget(win);
  });

  loadTarget(win);
  return win;
}

// --- Single instance: auto-launch plus a manual click must not open two kiosks ---
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    app.userAgentFallback = buildUserAgent(app.userAgentFallback);

    // Kiosk needs no device permissions. Deliberate two-item allowlist:
    // `fullscreen` for the kiosk layout and `screen-wake-lock` so the PWA can
    // hold its own wake lock as defence in depth. Camera / mic / geolocation /
    // notifications stay denied.
    session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
      callback(ALLOWED_PERMISSIONS.has(permission));
    });
    // Chromium routes the Wake Lock API through a permission *check*, not a
    // request, so both handlers must agree or the lock silently fails.
    session.defaultSession.setPermissionCheckHandler((_wc, permission) =>
      ALLOWED_PERMISSIONS.has(permission),
    );

    startKeepAwake();
    console.log('[KeepAwake] Active after startup:', isKeepAwakeActive());
    registerPowerEvents();
    mainWindow = createWindow();
    registerShortcuts(mainWindow);

    monitor = new ConnectivityMonitor({
      probe: createProbe(PROBE_URL),
      onReconnect: () => {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.reload();
      },
      pollIntervalMs: CONNECTIVITY_POLL_MS,
      debounceMs: CONNECTIVITY_DEBOUNCE_MS,
      logger: (message) => console.log(message),
    });
    monitor.start();

    console.log('[Startup] Loading', TARGET_URL, '| packaged =', app.isPackaged);
  });

  app.on('will-quit', () => {
    clearRetryTimer();
    monitor?.stop();
    stopKeepAwake();
    powerMonitor.removeAllListeners();
    globalShortcut.unregisterAll();
  });

  app.on('window-all-closed', () => app.quit());
}
