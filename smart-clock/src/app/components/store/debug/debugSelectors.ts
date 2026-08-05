import type { RootState } from '../../../store';

export const getDebugEnabled = (state: RootState) => state.debug.enabled;
export const getDebugViewOverride = (state: RootState) => state.debug.viewOverride;
export const getDebugRotationFrozen = (state: RootState) => state.debug.rotationFrozen;
export const getDebugOffsetMs = (state: RootState) => state.debug.offsetMs;
