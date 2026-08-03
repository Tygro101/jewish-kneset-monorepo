import { describe, it, expect } from 'vitest';
import {
  resolveDayContext,
  isYomTovDate,
  createDayContextResolver,
} from '@shared/core/schedule/day-context';

// All dates below were verified against @hebcal/core with the project's
// DefaultOptions (Jerusalem, il: true).

describe('day-context', () => {
  describe('resolveDayContext', () => {
    it('Saturday is Shabbat', () => {
      // Sat July 18, 2026 (4 Av 5786) — plain Shabbat, no holiday.
      const ctx = resolveDayContext(new Date(2026, 6, 18));
      expect(ctx.isShabbat).toBe(true);
      expect(ctx.isErevShabbat).toBe(false);
    });

    it('Friday is Erev Shabbat', () => {
      // Fri July 17, 2026 (3 Av 5786) — plain Erev Shabbat.
      const ctx = resolveDayContext(new Date(2026, 6, 17));
      expect(ctx.isErevShabbat).toBe(true);
      expect(ctx.isShabbat).toBe(false);
    });

    it('regular weekday has all flags false', () => {
      // Mon July 20, 2026 (6 Av 5786) — no holiday, and July 21 is not Yom Tov.
      const ctx = resolveDayContext(new Date(2026, 6, 20));
      expect(ctx).toEqual({
        isShabbat: false,
        isYomTov: false,
        isErevShabbat: false,
        isErevYomTov: false,
      });
    });

    it('Rosh Hashana is Yom Tov', () => {
      // Sat Sept 12, 2026 = 1 Tishrei 5787 = Rosh Hashana I.
      const ctx = resolveDayContext(new Date(2026, 8, 12));
      expect(ctx.isYomTov).toBe(true);
    });

    it('flags Yom Tov on a weekday Yom Tov (Rosh Hashana II)', () => {
      // Sun Sept 13, 2026 = 2 Tishrei 5787 — Yom Tov but not Shabbat.
      const ctx = resolveDayContext(new Date(2026, 8, 13));
      expect(ctx.isYomTov).toBe(true);
      expect(ctx.isShabbat).toBe(false);
    });

    it('Erev Rosh Hashana flags isErevYomTov', () => {
      // Fri Sept 11, 2026 = 29 Elul 5786 = Erev Rosh Hashana (also Erev Shabbat).
      const ctx = resolveDayContext(new Date(2026, 8, 11));
      expect(ctx.isErevYomTov).toBe(true);
      expect(ctx.isYomTov).toBe(false);
    });

    it('flags isErevYomTov without Erev Shabbat (Erev Yom Kippur)', () => {
      // Sun Sept 20, 2026 = 9 Tishrei 5787 = Erev Yom Kippur.
      const ctx = resolveDayContext(new Date(2026, 8, 20));
      expect(ctx.isErevYomTov).toBe(true);
      expect(ctx.isErevShabbat).toBe(false);
      expect(ctx.isYomTov).toBe(false);
    });

    it('Chol HaMoed Sukkot is NOT Yom Tov', () => {
      // Mon Sept 28, 2026 = 17 Tishrei 5787 = Chol HaMoed Sukkot.
      // (Sukkot I 5787 falls on Sat Sept 26, 2026.)
      const ctx = resolveDayContext(new Date(2026, 8, 28));
      expect(ctx.isYomTov).toBe(false);
    });

    it('Chol HaMoed Pesach is NOT Yom Tov', () => {
      // Mon Apr 6, 2026 = 19 Nisan 5786 = Chol HaMoed Pesach.
      const ctx = resolveDayContext(new Date(2026, 3, 6));
      expect(ctx.isYomTov).toBe(false);
    });
  });

  describe('isYomTovDate', () => {
    it('returns true for Shavuot', () => {
      // Fri May 22, 2026 = 6 Sivan 5786 = Shavuot (Israel, one day).
      expect(isYomTovDate(new Date(2026, 4, 22))).toBe(true);
    });

    it('returns true for Yom Kippur', () => {
      // Mon Sept 21, 2026 = 10 Tishrei 5787.
      expect(isYomTovDate(new Date(2026, 8, 21))).toBe(true);
    });

    it('returns true for Pesach I', () => {
      // Thu Apr 2, 2026 = 15 Nisan 5786.
      expect(isYomTovDate(new Date(2026, 3, 2))).toBe(true);
    });

    it('returns false for a regular day', () => {
      expect(isYomTovDate(new Date(2026, 6, 20))).toBe(false);
    });

    it('returns false for a plain Shabbat', () => {
      expect(isYomTovDate(new Date(2026, 6, 18))).toBe(false);
    });
  });

  describe('createDayContextResolver', () => {
    it('caches results for the same date', () => {
      const resolver = createDayContextResolver();
      const d = new Date(2026, 6, 18);
      const first = resolver(d);
      const second = resolver(d);
      expect(first).toBe(second); // same reference = cache hit
    });

    it('caches by calendar day, so different Date objects for the same day share a result', () => {
      const resolver = createDayContextResolver();
      const morning = new Date(2026, 6, 18, 8, 0);
      const evening = new Date(2026, 6, 18, 21, 30);
      expect(resolver(morning)).toBe(resolver(evening));
    });

    it('returns distinct results for different days', () => {
      const resolver = createDayContextResolver();
      const saturday = resolver(new Date(2026, 6, 18));
      const friday = resolver(new Date(2026, 6, 17));
      expect(saturday).not.toBe(friday);
      expect(saturday.isShabbat).toBe(true);
      expect(friday.isErevShabbat).toBe(true);
    });

    it('agrees with the uncached resolver', () => {
      const resolver = createDayContextResolver();
      const d = new Date(2026, 8, 11);
      expect(resolver(d)).toEqual(resolveDayContext(d));
    });
  });
});
