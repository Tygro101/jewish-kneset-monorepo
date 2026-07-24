/**
 * Application configuration for the Smart Clock container.
 * Change SMART_CLOCK_URL to point at the deployed smart-clock host.
 */
export const AppConfig = {
  /**
   * The URL where the smart-clock PWA is served.
   *
   * For local development: use your PC's LAN IP + port (not localhost, which
   * refers to the device itself).
   *
   * For production: use the public HTTPS URL where smart-clock/build/ is deployed.
   */
  SMART_CLOCK_URL: 'http://192.168.86.53:3001',

  /**
   * Custom User-Agent suffix appended by the WebView.
   * The host can inspect this to gate content to the container only (future feature).
   */
  USER_AGENT: 'SmartClockContainer/1.0',
} as const;
