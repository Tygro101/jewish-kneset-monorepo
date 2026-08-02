/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// jsdom in this vitest config doesn't provide localStorage; mock it.
const store: Record<string, string> = {};
const mockStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
};
Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true });

// Import AFTER localStorage mock is in place (configSlice reads it at module init).
import configReducer, { loadConfig, refreshConfig, clearTenant, savedTenantId } from './configSlice';
import type { ConfigState, TenantConfig } from './configState';

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

describe('configSlice', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('has correct initial state with no saved ID', () => {
    const state = configReducer(undefined, { type: '@@INIT' });
    expect(state.status).toBe('idle');
    expect(state.tenantId).toBeNull();
    expect(state.data).toBeNull();
    expect(state.refreshing).toBe(false);
    expect(state.lastRefreshError).toBeUndefined();
  });

  describe('loadConfig thunk', () => {
    it('sets status to loading on pending', () => {
      const state = configReducer(
        undefined,
        loadConfig.pending('req1', 'my-tenant'),
      );
      expect(state.status).toBe('loading');
      expect(state.tenantId).toBe('my-tenant');
      expect(state.error).toBeUndefined();
    });

    it('sets status to ready and stores data on fulfilled', () => {
      const state = configReducer(
        undefined,
        loadConfig.fulfilled(mockConfig, 'req1', 'test-tenant'),
      );
      expect(state.status).toBe('ready');
      expect(state.data).toEqual(mockConfig);
      expect(state.error).toBeUndefined();
      // Persisted to localStorage
      expect(mockStorage.setItem).toHaveBeenCalledWith('betKnesetId', 'test-tenant');
    });

    it('sets status to error on rejected', () => {
      const state = configReducer(
        undefined,
        loadConfig.rejected(
          new Error('Config not found for "bad" (HTTP 404)'),
          'req1',
          'bad',
        ),
      );
      expect(state.status).toBe('error');
      expect(state.error).toBe('Config not found for "bad" (HTTP 404)');
    });
  });

  describe('refreshConfig thunk', () => {
    const readyState = (): ConfigState => ({
      tenantId: 'test-tenant',
      data: mockConfig,
      status: 'ready',
      refreshing: false,
    });

    it('sets refreshing on pending without touching status or data', () => {
      const state = configReducer(readyState(), refreshConfig.pending('req1'));
      expect(state.refreshing).toBe(true);
      expect(state.status).toBe('ready');
      expect(state.data).toEqual(mockConfig);
    });

    it('replaces data on fulfilled and clears the refresh error', () => {
      const updated: TenantConfig = {
        ...mockConfig,
        activePresentations: [
          { title: 'New', file: 'presentations/new.pdf', type: 'pdf' },
        ],
      };
      const state = configReducer(
        { ...readyState(), refreshing: true, lastRefreshError: 'earlier failure' },
        refreshConfig.fulfilled(updated, 'req1'),
      );
      expect(state.refreshing).toBe(false);
      expect(state.status).toBe('ready');
      expect(state.data).toEqual(updated);
      expect(state.lastRefreshError).toBeUndefined();
    });

    it('preserves existing data and stays ready on rejected', () => {
      const state = configReducer(
        { ...readyState(), refreshing: true },
        refreshConfig.rejected(new Error('Failed to fetch'), 'req1'),
      );
      expect(state.refreshing).toBe(false);
      expect(state.status).toBe('ready');
      expect(state.data).toEqual(mockConfig);
      expect(state.error).toBeUndefined();
      expect(state.lastRefreshError).toBe('Failed to fetch');
    });

    it('does not blank the display on repeated failures', () => {
      let state = configReducer(readyState(), refreshConfig.pending('a'));
      state = configReducer(state, refreshConfig.rejected(new Error('offline'), 'a'));
      state = configReducer(state, refreshConfig.pending('b'));
      state = configReducer(state, refreshConfig.rejected(new Error('offline'), 'b'));

      expect(state.data).toEqual(mockConfig);
      expect(state.status).toBe('ready');
    });

    it('uses rejectWithValue payload as the refresh error when present', () => {
      const state = configReducer(
        readyState(),
        refreshConfig.rejected(null, 'req1', undefined, 'No tenant selected'),
      );
      expect(state.lastRefreshError).toBe('No tenant selected');
      expect(state.data).toEqual(mockConfig);
    });
  });

  describe('clearTenant', () => {
    it('resets state and removes localStorage entry', () => {
      store['betKnesetId'] = 'old-tenant';
      const readyState: ConfigState = {
        tenantId: 'old-tenant',
        data: mockConfig,
        status: 'ready',
        refreshing: false,
      };

      const state = configReducer(readyState, clearTenant());
      expect(state.tenantId).toBeNull();
      expect(state.data).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.refreshing).toBe(false);
      expect(mockStorage.removeItem).toHaveBeenCalledWith('betKnesetId');
    });
  });

  describe('savedTenantId', () => {
    it('returns null when nothing saved', () => {
      expect(savedTenantId()).toBeNull();
    });

    it('returns the persisted ID', () => {
      store['betKnesetId'] = 'saved-one';
      expect(savedTenantId()).toBe('saved-one');
    });
  });
});
