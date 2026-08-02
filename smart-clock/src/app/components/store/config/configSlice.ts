import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { StateKeys } from '../../../store.models';
import { fetchTenantConfig } from './configApi';
import { pruneMediaCache } from './mediaCache';
import type { ConfigState, TenantConfig } from './configState';
import type { RootState } from '../../../store';

const STORAGE_KEY = 'betKnesetId';

/** Read the persisted tenant ID (returns null if never set). */
export function savedTenantId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Fetches the config and immediately prunes media cached for presentations that
 * are no longer active, so a deactivated slide cannot be served from the SW cache.
 */
async function fetchAndPrune(id: string): Promise<TenantConfig> {
  const config = await fetchTenantConfig(id);
  await pruneMediaCache(id, config.activePresentations ?? []);
  return config;
}

/** Async thunk: fetches config.json for the given tenant ID (first load). */
export const loadConfig = createAsyncThunk(
  'config/loadConfig',
  async (id: string) => fetchAndPrune(id),
);

/**
 * Async thunk: background re-fetch of the current tenant's config.
 *
 * Unlike `loadConfig` it never sets `status` to 'loading' or 'error', so the
 * display is never blanked — on failure the previously loaded config keeps
 * rendering and the error is recorded in `lastRefreshError`.
 */
export const refreshConfig = createAsyncThunk<
  TenantConfig,
  void,
  { state: RootState; rejectValue: string }
>(
  'config/refreshConfig',
  async (_arg, { getState, rejectWithValue }) => {
    const tenantId = getState().config.tenantId;
    if (!tenantId) {
      return rejectWithValue('No tenant selected');
    }
    return fetchAndPrune(tenantId);
  },
);

const initialState: ConfigState = {
  tenantId: savedTenantId(),
  data: null,
  status: 'idle',
  refreshing: false,
};

export const configSlice = createSlice({
  name: StateKeys.Config,
  initialState,
  reducers: {
    /** Clears the saved tenant, returning to the entrance page. */
    clearTenant: (state) => {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
      state.tenantId = null;
      state.data = null;
      state.status = 'idle';
      state.error = undefined;
      state.refreshing = false;
      state.lastRefreshError = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConfig.pending, (state, action) => {
        state.status = 'loading';
        state.tenantId = action.meta.arg;
        state.error = undefined;
      })
      .addCase(loadConfig.fulfilled, (state, action) => {
        state.status = 'ready';
        state.data = action.payload;
        state.error = undefined;
        state.lastRefreshError = undefined;
        try { localStorage.setItem(STORAGE_KEY, action.payload.tenant.id); } catch { /* noop */ }
      })
      .addCase(loadConfig.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to load config';
      })
      // --- Background refresh: never blanks the display ---
      .addCase(refreshConfig.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(refreshConfig.fulfilled, (state, action) => {
        state.refreshing = false;
        state.data = action.payload;
        state.status = 'ready';
        state.lastRefreshError = undefined;
      })
      .addCase(refreshConfig.rejected, (state, action) => {
        state.refreshing = false;
        state.lastRefreshError =
          (action.payload as string | undefined)
          ?? action.error.message
          ?? 'Failed to refresh config';
        // Keep the existing `data` and stay 'ready' — stale beats blank.
        if (state.data) {
          state.status = 'ready';
        }
      });
  },
});

export const { clearTenant } = configSlice.actions;
export default configSlice.reducer;
