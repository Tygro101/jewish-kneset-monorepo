import type { TenantConfig } from './configState';

const ORG = 'jewish-kneset';

/**
 * Builds the base URL for a tenant's GitHub Pages site.
 * Seam: swap this function to point at a NestJS backend later.
 */
export function tenantBaseUrl(id: string): string {
  return `https://${ORG}.github.io/${id}/`;
}

/**
 * Fetches the config.json for the given tenant ID from GitHub Pages.
 *
 * A `?t=<timestamp>` cache-buster is appended so neither the GitHub Pages CDN
 * (~10 min max-age) nor the service worker can serve a stale copy. `no-store`
 * additionally prevents the HTTP cache from being read or written.
 * The service worker strips the query string via `cacheKeyWillBeUsed`, so the
 * offline fallback entry stays a single, stable cache key.
 *
 * Throws on HTTP errors (404 = invalid ID, network failure, etc.).
 */
export async function fetchTenantConfig(id: string): Promise<TenantConfig> {
  const url = `${tenantBaseUrl(id)}config.json?t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Config not found for "${id}" (HTTP ${res.status})`);
  }
  return (await res.json()) as TenantConfig;
}
