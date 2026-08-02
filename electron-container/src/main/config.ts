/**
 * Configuration for the Smart Clock Electron container.
 * Port of react-container/constants/AppConfig.ts.
 *
 * This module MUST NOT import from 'electron' — it is unit-tested in plain Node.
 * The caller passes `app.isPackaged` in.
 */

/** Production HTTPS origin where the smart-clock PWA is deployed. */
export const PRODUCTION_URL = 'https://tygro101.github.io/jewish-kneset-monorepo/';

/** Local Vite dev server (see smart-clock/vite.config.ts -> server.port = 3001). */
export const DEV_URL = 'http://localhost:3001/';

/**
 * Hash route of the landscape dashboard (smart-clock: src/app/routing/routes.ts).
 * A fragment is never sent to the server and is stripped before Workbox
 * precache matching, so this stays offline-safe on GitHub Pages.
 */
export const TV_ROUTE = '#/tv';

/** Appended to the default Chromium UA so the host can gate content to the container. */
export const USER_AGENT_SUFFIX = 'SmartClockContainer/1.0';

/** How often we probe the host to decide online/offline (ms). */
export const CONNECTIVITY_POLL_MS = 30_000;

/** Debounce after an offline -> online edge before reloading (matches the Android hook). */
export const CONNECTIVITY_DEBOUNCE_MS = 3_000;

/** Timeout for a single connectivity probe (ms). */
export const CONNECTIVITY_PROBE_TIMEOUT_MS = 5_000;

/** Base URL without the route — use this for network probes (fragments are not sent over HTTP). */
export function resolveBaseUrl(isPackaged: boolean): string {
  return isPackaged ? PRODUCTION_URL : DEV_URL;
}

/** URL the kiosk window loads: base + landscape route. */
export function resolveTargetUrl(isPackaged: boolean): string {
  return `${resolveBaseUrl(isPackaged)}${TV_ROUTE}`;
}

/**
 * URL prefixes the window is allowed to navigate to.
 * Production is always allowed so a dev build can still open the deployed site.
 */
export function allowedPrefixes(isPackaged: boolean): string[] {
  return isPackaged ? [PRODUCTION_URL] : [PRODUCTION_URL, DEV_URL];
}

/** Appends the container suffix to the default UA exactly once. */
export function buildUserAgent(base: string): string {
  const trimmed = (base ?? '').trim();
  if (trimmed.length === 0) return USER_AGENT_SUFFIX;
  if (trimmed.split(/\s+/).includes(USER_AGENT_SUFFIX)) return trimmed;
  return `${trimmed} ${USER_AGENT_SUFFIX}`;
}
