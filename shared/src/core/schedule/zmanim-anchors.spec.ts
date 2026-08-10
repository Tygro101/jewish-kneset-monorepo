import { describe, it, expect, beforeEach } from 'vitest';
import { anchorMinutesFor, clearAnchorCache, resolveCity, DEFAULT_CITY, isKnownCity } from './zmanim-anchors';
import { CitiesEnum } from '../services/workers/handlers/models/shared-models';

// Mon July 20 2026 — a plain summer weekday.
const SUMMER_DAY = new Date(2026, 6, 20);

describe('resolveCity', () => {
  it('accepts a known city', () => {
    expect(resolveCity(CitiesEnum.JERUSALEM)).toBe(CitiesEnum.JERUSALEM);
  });

  it.each([undefined, null, '', 'Atlantis', 42])('falls back for %s', (value) => {
    expect(resolveCity(value)).toBe(DEFAULT_CITY);
  });

  it('reports whether a city is known', () => {
    expect(isKnownCity(CitiesEnum.NETIVOT)).toBe(true);
    expect(isKnownCity('Atlantis')).toBe(false);
  });
});

describe('anchorMinutesFor', () => {
  beforeEach(() => clearAnchorCache());

  it('resolves every anchor for a normal day', () => {
    const anchors = anchorMinutesFor(SUMMER_DAY, DEFAULT_CITY);
    expect(anchors).not.toBeNull();
    for (const key of ['netz', 'shkiah', 'plagMincha', 'minchaGdola', 'minchaKtana', 'tzetCochavimGeonim'] as const) {
      expect(typeof anchors![key]).toBe('number');
    }
  });

  it('orders the anchors sensibly through the day', () => {
    const a = anchorMinutesFor(SUMMER_DAY, DEFAULT_CITY)!;
    expect(a.netz!).toBeLessThan(a.minchaGdola!);
    expect(a.minchaGdola!).toBeLessThan(a.minchaKtana!);
    expect(a.minchaKtana!).toBeLessThan(a.plagMincha!);
    expect(a.plagMincha!).toBeLessThan(a.shkiah!);
    expect(a.shkiah!).toBeLessThan(a.tzetCochavimGeonim!);
  });

  it('returns the same object for a repeat call (memoized)', () => {
    const first = anchorMinutesFor(SUMMER_DAY, DEFAULT_CITY);
    const second = anchorMinutesFor(SUMMER_DAY, DEFAULT_CITY);
    expect(second).toBe(first);
  });

  it('keys the cache by city', () => {
    const netivot = anchorMinutesFor(SUMMER_DAY, DEFAULT_CITY)!;
    const tzfat = anchorMinutesFor(SUMMER_DAY, CitiesEnum.TZFAT)!;
    expect(tzfat).not.toBe(netivot);
  });

  it('falls back to the default city instead of throwing', () => {
    expect(anchorMinutesFor(SUMMER_DAY, 'Atlantis')).not.toBeNull();
  });
});
