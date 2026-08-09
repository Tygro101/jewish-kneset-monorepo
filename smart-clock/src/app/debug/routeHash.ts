import { TV_HASH, type AppRoute } from '../routing/routes';
import { parseDebugFlag } from './debugFlag';

/**
 * Builds the location hash for `route`, preserving debug mode.
 *
 * The debug flag may live in either `location.search` (`?debug=true`) or the hash
 * query (`#/tv?debug=true`). When it is only in the hash, switching routes would
 * drop it, so we re-append it.
 */
export function buildRouteHash(route: AppRoute, search: string, hash: string): string {
  const base = route === 'tv' ? TV_HASH : '#/';
  const debugInSearch = parseDebugFlag(search, '');
  if (debugInSearch) return base;
  const debugInHash = parseDebugFlag('', hash);
  return debugInHash ? `${base}?debug=true` : base;
}
