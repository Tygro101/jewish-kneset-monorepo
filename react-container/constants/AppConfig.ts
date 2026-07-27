/**
 * Application configuration for the Smart Clock container.
 */

/** Production HTTPS origin where the smart-clock PWA is deployed. */
const PRODUCTION_URL = 'https://tygro101.github.io/jewish-kneset-monorepo/';

/**
 * Development URL — your PC's LAN IP + port.
 * Only used in React Native __DEV__ builds (metro bundler dev mode).
 * Change the IP/port to match your local dev server.
 */
const DEV_URL = 'http://192.168.86.53:3001';

export const AppConfig = {
  /**
   * The URL where the smart-clock PWA is served.
   * In production builds this is always the HTTPS origin;
   * in __DEV__ mode it falls back to the local dev server for convenience.
   */
  SMART_CLOCK_URL: __DEV__ ? DEV_URL : PRODUCTION_URL,

  /**
   * The HTTPS origin used for navigation guards (origin lock).
   * Always points at the production host regardless of build mode.
   */
  SMART_CLOCK_ORIGIN: PRODUCTION_URL,

  /**
   * Custom User-Agent suffix appended by the WebView.
   * The host can inspect this to gate content to the container only (future feature).
   */
  USER_AGENT: 'SmartClockContainer/1.0',
} as const;
