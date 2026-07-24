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
 * Throws on HTTP errors (404 = invalid ID, network failure, etc.).
 */
export async function fetchTenantConfig(id: string): Promise<TenantConfig> {
  const url = `${tenantBaseUrl(id)}config.json`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Config not found for "${id}" (HTTP ${res.status})`);
  }
  return (await res.json()) as TenantConfig;
}
