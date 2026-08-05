import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateKeys } from '../../../store.models';
import { DEBUG_ENABLED } from '../../../debug/debugFlag';
import { getOffsetMs } from '../../../debug/clock';
import type { DebugState, DebugViewOverride } from './debugState';

const initialState: DebugState = {
  enabled: DEBUG_ENABLED,
  offsetMs: getOffsetMs(),
  viewOverride: null,
  rotationFrozen: false,
};

export const debugSlice = createSlice({
  name: StateKeys.Debug,
  initialState,
  reducers: {
    setViewOverride: (state, action: PayloadAction<DebugViewOverride>) => {
      state.viewOverride = action.payload;
    },
    clearViewOverride: (state) => {
      state.viewOverride = null;
    },
    setRotationFrozen: (state, action: PayloadAction<boolean>) => {
      state.rotationFrozen = action.payload;
    },
    /** Updates the offset readout in the slice (after setOffsetMs + reload). */
    syncOffsetMs: (state, action: PayloadAction<number>) => {
      state.offsetMs = action.payload;
    },
  },
});

export const {
  setViewOverride,
  clearViewOverride,
  setRotationFrozen,
  syncOffsetMs,
} = debugSlice.actions;

export default debugSlice.reducer;
