import { describe, it, expect } from 'vitest';
import { buildHeaderDateLines } from './headerDateLines';

// Wednesday, 12 August 2026 (local time)
const WED = new Date(2026, 7, 12, 12, 0, 0);

describe('buildHeaderDateLines', () => {
  it('primary = weekday + Hebrew date', () => {
    const { primary } = buildHeaderDateLines(WED, 'כ״ט אב תשפ״ו');
    expect(primary).toBe('יום רביעי כ״ט אב תשפ״ו');
  });

  it('primary falls back to the weekday alone when the Hebrew date is empty', () => {
    expect(buildHeaderDateLines(WED, '').primary).toBe('יום רביעי');
  });

  it('secondary is the Gregorian date without the weekday', () => {
    const { secondary } = buildHeaderDateLines(WED, 'כ״ט אב תשפ״ו');
    expect(secondary).toContain('2026');
    expect(secondary).toContain('12');
    expect(secondary).not.toContain('יום רביעי');
  });

  it('is pure — same input yields the same output', () => {
    expect(buildHeaderDateLines(WED, 'א')).toEqual(buildHeaderDateLines(WED, 'א'));
  });
});
