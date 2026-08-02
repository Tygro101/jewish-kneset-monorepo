/** Recognised dashboard layouts. Anything unrecognised falls back to 'tablet'. */
export type AppRoute = 'tablet' | 'tv';

/** Canonical hash for the landscape/TV dashboard. Electron loads <base> + this. */
export const TV_HASH = '#/tv';

/**
 * Maps `location.hash` to a route.
 * Tolerant on purpose — a kiosk URL may be typed by hand or carry a query:
 *   '', '#', '#/', '#/unknown'        -> 'tablet'
 *   '#/tv', '#/TV', '#/tv/', '#/tv?x' -> 'tv'
 */
export function parseRoute(hash: string): AppRoute {
  const normalized = (hash ?? '')
    .replace(/^#/, '')       // drop the leading '#'
    .split('?')[0]           // drop a query part
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, ''); // drop leading/trailing slashes
  return normalized === 'tv' ? 'tv' : 'tablet';
}
