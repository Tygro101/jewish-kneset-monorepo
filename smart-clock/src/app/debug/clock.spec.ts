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

// Import AFTER localStorage mock is in place.
import {
  computeOffsetFromTarget,
  loadOffset,
  now,
  nowMs,
  getOffsetMs,
  setOffsetMs,
  clearOffset,
  _reloadOffset,
} from './clock';

const STORAGE_KEY = 'smartclock-debug';

describe('computeOffsetFromTarget', () => {
  it('returns 0 when target equals realNow', () => {
    const t = new Date('2026-08-05T12:00:00Z');
    expect(computeOffsetFromTarget(t, t)).toBe(0);
  });

  it('returns positive offset when target is in the future relative to realNow', () => {
    const realNow = new Date('2026-08-05T12:00:00Z');
    const target = new Date('2026-08-05T15:00:00Z');
    expect(computeOffsetFromTarget(target, realNow)).toBe(3 * 60 * 60 * 1000);
  });

  it('returns negative offset when target is in the past relative to realNow', () => {
    const realNow = new Date('2026-08-05T12:00:00Z');
    const target = new Date('2026-08-05T09:00:00Z');
    expect(computeOffsetFromTarget(target, realNow)).toBe(-3 * 60 * 60 * 1000);
  });

  it('handles cross-day offsets', () => {
    const realNow = new Date('2026-08-05T23:00:00Z');
    const target = new Date('2026-08-06T01:00:00Z');
    expect(computeOffsetFromTarget(target, realNow)).toBe(2 * 60 * 60 * 1000);
  });

  it('offset round-trip: applying offset to realNow yields target', () => {
    const realNow = new Date('2026-08-05T10:30:00Z');
    const target = new Date('2026-12-25T18:00:00Z');
    const offset = computeOffsetFromTarget(target, realNow);
    const result = new Date(realNow.getTime() + offset);
    expect(result.getTime()).toBe(target.getTime());
  });
});

describe('loadOffset (pure)', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('returns 0 when debugEnabled is false regardless of storage', () => {
    store[STORAGE_KEY] = JSON.stringify({ offsetMs: 9999 });
    expect(loadOffset(false)).toBe(0);
  });

  it('returns 0 when nothing is stored', () => {
    expect(loadOffset(true)).toBe(0);
  });

  it('returns the stored offset when valid', () => {
    store[STORAGE_KEY] = JSON.stringify({ offsetMs: 3600000 });
    expect(loadOffset(true)).toBe(3600000);
  });

  it('returns 0 for corrupt JSON', () => {
    store[STORAGE_KEY] = 'not-json{{{';
    expect(loadOffset(true)).toBe(0);
  });

  it('returns 0 for wrong shape', () => {
    store[STORAGE_KEY] = JSON.stringify({ something: 'else' });
    expect(loadOffset(true)).toBe(0);
  });

  it('returns 0 for non-number offsetMs', () => {
    store[STORAGE_KEY] = JSON.stringify({ offsetMs: 'hello' });
    expect(loadOffset(true)).toBe(0);
  });

  it('returns 0 for Infinity-like offsetMs', () => {
    store[STORAGE_KEY] = '{"offsetMs":1e999}';
    expect(loadOffset(true)).toBe(0);
  });

  it('returns negative offsets correctly', () => {
    store[STORAGE_KEY] = JSON.stringify({ offsetMs: -7200000 });
    expect(loadOffset(true)).toBe(-7200000);
  });
});

describe('clock seam runtime', () => {
  beforeEach(() => {
    mockStorage.clear();
    clearOffset(); // reset in-memory state to 0
  });

  it('now() returns real time when offset is 0', () => {
    const before = Date.now();
    const result = now().getTime();
    const after = Date.now();
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  it('nowMs() returns real time when offset is 0', () => {
    const before = Date.now();
    const result = nowMs();
    const after = Date.now();
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  it('getOffsetMs() starts at 0 after clearOffset', () => {
    expect(getOffsetMs()).toBe(0);
  });

  it('_reloadOffset picks up a stored value (simulating debug enabled)', () => {
    store[STORAGE_KEY] = JSON.stringify({ offsetMs: 5000 });
    _reloadOffset(true);
    expect(getOffsetMs()).toBe(5000);
    // now() should be shifted
    const before = Date.now() + 5000;
    const result = now().getTime();
    const after = Date.now() + 5000;
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  it('_reloadOffset ignores stored value when debugEnabled is false', () => {
    store[STORAGE_KEY] = JSON.stringify({ offsetMs: 9999 });
    _reloadOffset(false);
    expect(getOffsetMs()).toBe(0);
  });

  it('clearOffset resets to 0 and removes storage', () => {
    store[STORAGE_KEY] = JSON.stringify({ offsetMs: 1000 });
    _reloadOffset(true);
    expect(getOffsetMs()).toBe(1000);
    clearOffset();
    expect(getOffsetMs()).toBe(0);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });
});
