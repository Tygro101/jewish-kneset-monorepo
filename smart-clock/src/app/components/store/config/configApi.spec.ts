import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tenantBaseUrl, fetchTenantConfig } from './configApi';
import type { TenantConfig } from './configState';

describe('configApi', () => {
  describe('tenantBaseUrl', () => {
    it('builds the correct GitHub Pages URL', () => {
      expect(tenantBaseUrl('kneset-or-chaim'))
        .toBe('https://jewish-kneset.github.io/kneset-or-chaim/');
    });

    it('handles IDs with special characters', () => {
      expect(tenantBaseUrl('my-test-repo'))
        .toBe('https://jewish-kneset.github.io/my-test-repo/');
    });
  });

  describe('fetchTenantConfig', () => {
    const mockConfig: TenantConfig = {
      tenant: { id: 'test-tenant', displayName: 'Test Synagogue' },
      displaySettings: { mainDashboardDurationSeconds: 60, presentationDurationSeconds: 20 },
      weeklySchedule: {
        sunday: [{ time: '06:30', title: 'Shacharit', type: 'tefilla' }],
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [],
        shabbat: [{ time: '08:00', title: 'Shacharit', type: 'tefilla' }],
      },
      activePresentations: [],
    };

    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns parsed config on success', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await fetchTenantConfig('test-tenant');

      expect(fetch).toHaveBeenCalledWith(
        'https://jewish-kneset.github.io/test-tenant/config.json',
        { cache: 'no-cache' },
      );
      expect(result).toEqual(mockConfig);
    });

    it('throws on 404 (invalid tenant ID)', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(fetchTenantConfig('bad-id'))
        .rejects.toThrow('Config not found for "bad-id" (HTTP 404)');
    });

    it('throws on network failure', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(fetchTenantConfig('any-id'))
        .rejects.toThrow('Failed to fetch');
    });
  });
});
