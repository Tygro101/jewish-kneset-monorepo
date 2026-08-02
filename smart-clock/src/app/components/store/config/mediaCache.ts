import { tenantBaseUrl } from './configApi';
import { sanitizePresentationPath } from '../../clock-view/presentation/presentationPath';
import type { Presentation } from './configState';

/** Must match the `cacheName` of the tenant-presentations rule in vite.config.ts. */
const CACHE_NAME = 'tenant-presentations';

/**
 * Removes cached media entries that are no longer in the active presentations list.
 *
 * The service worker caches presentation media CacheFirst for 30 days, which is
 * what makes the clock resilient offline — but it also means a presentation
 * deactivated in the CMS would keep rendering from cache. Pruning against the
 * freshly fetched config is what authoritatively removes it.
 *
 * Compares by pathname only (ignoring query strings), because cache keys may
 * carry cache-busting params.
 *
 * Never throws: a pruning failure must not break config loading.
 */
export async function pruneMediaCache(
  tenantId: string,
  activePresentations: Presentation[],
): Promise<void> {
  if (typeof caches === 'undefined') return;

  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    // Build the allowed set (pathnames only)
    const baseUrl = tenantBaseUrl(tenantId);
    const allowedPaths = new Set<string>();
    for (const pres of activePresentations) {
      const sanitized = sanitizePresentationPath(pres.file);
      if (sanitized) {
        allowedPaths.add(new URL(sanitized, baseUrl).pathname);
      }
    }

    // Delete entries not in the allowed set
    for (const request of keys) {
      const cachedPath = new URL(request.url).pathname;
      if (!allowedPaths.has(cachedPath)) {
        await cache.delete(request);
      }
    }
  } catch {
    /* Cache API unavailable or blocked — nothing we can do, keep going. */
  }
}
