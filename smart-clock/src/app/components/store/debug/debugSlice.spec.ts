/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';

// Mock localStorage (module evaluates DEBUG_ENABLED → loadOffset at import time)
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

import reducer, {
  setViewOverride,
  clearViewOverride,
  setRotationFrozen,
  syncOffsetMs,
} from './debugSlice';
import type { DebugState } from './debugState';

describe('debugSlice', () => {
  const initial: DebugState = reducer(undefined, { type: '@@init' });

  it('starts with viewOverride null and rotationFrozen false', () => {
    expect(initial.viewOverride).toBeNull();
    expect(initial.rotationFrozen).toBe(false);
  });

  it('setViewOverride sets the override', () => {
    const state = reducer(initial, setViewOverride({ kind: 'dashboard' }));
    expect(state.viewOverride).toEqual({ kind: 'dashboard' });
  });

  it('setViewOverride with presentation index', () => {
    const state = reducer(initial, setViewOverride({ kind: 'presentation', index: 2 }));
    expect(state.viewOverride).toEqual({ kind: 'presentation', index: 2 });
  });

  it('clearViewOverride resets to null', () => {
    const withOverride = reducer(initial, setViewOverride({ kind: 'messages' }));
    const cleared = reducer(withOverride, clearViewOverride());
    expect(cleared.viewOverride).toBeNull();
  });

  it('setRotationFrozen toggles the flag', () => {
    const frozen = reducer(initial, setRotationFrozen(true));
    expect(frozen.rotationFrozen).toBe(true);
    const unfrozen = reducer(frozen, setRotationFrozen(false));
    expect(unfrozen.rotationFrozen).toBe(false);
  });

  it('syncOffsetMs updates the offset readout', () => {
    const state = reducer(initial, syncOffsetMs(3600000));
    expect(state.offsetMs).toBe(3600000);
  });
});
