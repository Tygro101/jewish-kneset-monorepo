import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { StateKeys } from '../../../store.models';
import { fetchTenantConfig } from './configApi';
import type { ConfigState } from './configState';

const STORAGE_KEY = 'betKnesetId';

/** Read the persisted tenant ID (returns null if never set). */
export function savedTenantId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Async thunk: fetches config.json for the given tenant ID. */
export const loadConfig = createAsyncThunk(
  'config/loadConfig',
  async (id: string) => fetchTenantConfig(id),
);

const initialState: ConfigState = {
  tenantId: savedTenantId(),
  data: null,
  status: 'idle',
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
        try { localStorage.setItem(STORAGE_KEY, action.payload.tenant.id); } catch { /* noop */ }
      })
      .addCase(loadConfig.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message || 'Failed to load config';
      });
  },
});

export const { clearTenant } = configSlice.actions;
export default configSlice.reducer;
