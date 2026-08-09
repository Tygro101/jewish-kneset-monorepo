import { Provider } from "react-redux"
import { registerSW } from 'virtual:pwa-register'
import { store } from "./app/store"
import { App } from "./App"
import { ErrorBoundary } from "./app/components/ErrorBoundary"
import { mountAppRoot } from "./app/bootstrap/mountAppRoot"
import { applyTheme, loadTheme } from "./app/shared/themes"
import "./index.scss"

// NOTE: this module must NOT declare React components. A component declaration
// here makes the entry a React Refresh boundary, which lets Vite re-execute it
// on HMR — calling createRoot() a second time on #root and corrupting the DOM
// ("Failed to execute 'removeChild' on 'Node'"). Components live in App.tsx.

// Apply the persisted theme (family + dark/light) before the app renders.
const savedTheme = loadTheme();
applyTheme(savedTheme.familyId, savedTheme.mode);

// --- Service Worker Registration ---
// Poll the host every 30 minutes for a new build; apply immediately on detection.
const UPDATE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

declare global {
  interface Window {
    __smartClockSwRegistered?: boolean;
  }
}

/** Registers the service worker at most once per page, even if this module re-runs. */
function registerServiceWorkerOnce(): void {
  if (window.__smartClockSwRegistered) return;
  window.__smartClockSwRegistered = true;

  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      setInterval(() => {
        registration.update();
      }, UPDATE_INTERVAL_MS);
    },
    onNeedRefresh() {
      updateSW(true);
    },
    onOfflineReady() {
      console.log('[SW] App is ready for offline use.');
    },
  });
}

registerServiceWorkerOnce();

mountAppRoot(
  <Provider store={store}>
    <ErrorBoundary autoReloadMs={30000}>
      <App />
    </ErrorBoundary>
  </Provider>,
);
