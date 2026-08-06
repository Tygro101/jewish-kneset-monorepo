import { describe, it, expect } from 'vitest';
import {
  SCREEN_CONFIG,
  daysAheadOptions,
  readCmsDaysAhead,
  resolveDaysAheadFor,
} from '@shared/core/schedule/days-ahead';

describe('daysAheadOptions', () => {
  it('offers 1–7 for TV and 1–3 for tablet', () => {
    expect(daysAheadOptions('tv')).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(daysAheadOptions('tablet')).toEqual([1, 2, 3]);
  });
});

describe('readCmsDaysAhead', () => {
  it('reads the nested per-target value', () => {
    expect(readCmsDaysAhead({ tv: 5, tablet: 2 }, 'tv')).toBe(5);
    expect(readCmsDaysAhead({ tv: 5, tablet: 2 }, 'tablet')).toBe(2);
  });

  it('treats a legacy flat number as applying to both targets', () => {
    expect(readCmsDaysAhead(7, 'tv')).toBe(7);
    expect(readCmsDaysAhead(7, 'tablet')).toBe(7);
  });

  it('returns the screen sentinel when missing or explicitly "screen"', () => {
    expect(readCmsDaysAhead(undefined, 'tv')).toBe(SCREEN_CONFIG);
    expect(readCmsDaysAhead({}, 'tv')).toBe(SCREEN_CONFIG);
    expect(readCmsDaysAhead({ tv: SCREEN_CONFIG }, 'tv')).toBe(SCREEN_CONFIG);
    expect(readCmsDaysAhead('nonsense', 'tablet')).toBe(SCREEN_CONFIG);
  });
});

describe('resolveDaysAheadFor', () => {
  it('prefers the CMS number over the device setting', () => {
    expect(resolveDaysAheadFor({ tv: 4 }, 7, 'tv')).toBe(4);
  });

  it('falls back to the device setting on the screen sentinel', () => {
    expect(resolveDaysAheadFor({ tv: SCREEN_CONFIG }, 5, 'tv')).toBe(5);
    expect(resolveDaysAheadFor(undefined, 3, 'tablet')).toBe(3);
  });

  it('falls back to the code default when the device value is unusable', () => {
    expect(resolveDaysAheadFor(undefined, undefined, 'tv')).toBe(6);
    expect(resolveDaysAheadFor(undefined, NaN, 'tablet')).toBe(2);
  });

  it('enforces the tablet cap of 3 even for a hand-edited config', () => {
    expect(resolveDaysAheadFor({ tablet: 7 }, undefined, 'tablet')).toBe(3);
    expect(resolveDaysAheadFor(7, undefined, 'tablet')).toBe(3);
  });

  it('enforces the floor of 1', () => {
    expect(resolveDaysAheadFor({ tv: 0 }, undefined, 'tv')).toBe(1);
  });
});
