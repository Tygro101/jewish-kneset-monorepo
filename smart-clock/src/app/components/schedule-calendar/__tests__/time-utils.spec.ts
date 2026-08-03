import { describe, it, expect } from 'vitest';
import { parseHHmm, minToLabel, pad2, MINUTES_PER_DAY } from '@shared/core/schedule/time-utils';
import { dayKeyFor, DAY_LABELS } from '@shared/core/schedule/day-keys';

describe('time-utils', () => {
  describe('parseHHmm', () => {
    it('parses standard HH:mm', () => {
      expect(parseHHmm('06:30')).toBe(390);
      expect(parseHHmm('00:00')).toBe(0);
      expect(parseHHmm('23:59')).toBe(1439);
    });

    it('parses single-digit hour H:mm', () => {
      expect(parseHHmm('6:30')).toBe(390);
    });

    it('returns null for invalid inputs', () => {
      expect(parseHHmm('24:00')).toBeNull();
      expect(parseHHmm('12:60')).toBeNull();
      expect(parseHHmm('')).toBeNull();
      expect(parseHHmm(undefined)).toBeNull();
      expect(parseHHmm(null)).toBeNull();
      expect(parseHHmm('abc')).toBeNull();
      expect(parseHHmm('12')).toBeNull();
      expect(parseHHmm('12:5')).toBeNull();
      expect(parseHHmm('1:2:3')).toBeNull();
    });

    it('trims whitespace', () => {
      expect(parseHHmm(' 08:15 ')).toBe(495);
    });
  });

  describe('minToLabel', () => {
    it('formats minutes as HH:mm', () => {
      expect(minToLabel(390)).toBe('06:30');
      expect(minToLabel(0)).toBe('00:00');
      expect(minToLabel(1439)).toBe('23:59');
    });

    it('wraps past 24h', () => {
      expect(minToLabel(1470)).toBe('00:30');
    });
  });

  describe('pad2', () => {
    it('pads single digits', () => {
      expect(pad2(0)).toBe('00');
      expect(pad2(5)).toBe('05');
      expect(pad2(12)).toBe('12');
    });
  });

  describe('MINUTES_PER_DAY', () => {
    it('equals 1440', () => {
      expect(MINUTES_PER_DAY).toBe(1440);
    });
  });
});

describe('day-keys', () => {
  describe('dayKeyFor', () => {
    it('returns correct key for known dates', () => {
      // July 18, 2026 is a Saturday
      expect(dayKeyFor(new Date(2026, 6, 18))).toBe('shabbat');
      // July 19, 2026 is a Sunday
      expect(dayKeyFor(new Date(2026, 6, 19))).toBe('sunday');
      // July 20, 2026 is a Monday
      expect(dayKeyFor(new Date(2026, 6, 20))).toBe('monday');
    });

    it('defaults to current date', () => {
      const key = dayKeyFor();
      expect(Object.keys(DAY_LABELS)).toContain(key);
    });
  });

  describe('DAY_LABELS', () => {
    it('has all 7 days', () => {
      expect(Object.keys(DAY_LABELS)).toHaveLength(7);
    });

    it('uses Hebrew labels', () => {
      expect(DAY_LABELS.shabbat).toBe('שבת');
      expect(DAY_LABELS.sunday).toBe('יום ראשון');
    });
  });
});
