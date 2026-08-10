import { describe, it, expect } from 'vitest';
import { effectiveDayScope, isEventVisibleOn } from './event-scope';
import type { DayContext, DayScope } from './schedule.models';

const ctx = (over: Partial<DayContext> = {}): DayContext => ({
  isShabbat: false,
  isYomTov: false,
  isErevShabbat: false,
  isErevYomTov: false,
  ...over,
});

describe('isEventVisibleOn', () => {
  it('shows an event with the flag absent on a weekday', () => {
    expect(isEventVisibleOn({}, ctx())).toBe(true);
  });

  it('shows an event with the flag absent on Yom Tov (backward compatible)', () => {
    expect(isEventVisibleOn({}, ctx({ isYomTov: true }))).toBe(true);
  });

  it('shows an event with the flag absent on Shabbat', () => {
    expect(isEventVisibleOn({}, ctx({ isShabbat: true }))).toBe(true);
  });

  it('shows a chol-only event on a plain weekday', () => {
    expect(isEventVisibleOn({ showOnShabbatAndYomTov: false }, ctx())).toBe(true);
  });

  it('hides a chol-only event on Yom Tov', () => {
    expect(isEventVisibleOn({ showOnShabbatAndYomTov: false }, ctx({ isYomTov: true }))).toBe(false);
  });

  it('hides a chol-only event on Shabbat', () => {
    expect(isEventVisibleOn({ showOnShabbatAndYomTov: false }, ctx({ isShabbat: true }))).toBe(false);
  });

  it('shows an explicitly-enabled event on Yom Tov', () => {
    expect(isEventVisibleOn({ showOnShabbatAndYomTov: true }, ctx({ isYomTov: true }))).toBe(true);
  });

  it('ignores erev flags', () => {
    expect(
      isEventVisibleOn({ showOnShabbatAndYomTov: false }, ctx({ isErevShabbat: true, isErevYomTov: true })),
    ).toBe(true);
  });
});


describe('effectiveDayScope', () => {
  it('prefers an explicit dayScope', () => {
    expect(effectiveDayScope({ dayScope: 'yomTovOnly', showOnShabbatAndYomTov: false })).toBe('yomTovOnly');
  });

  it('maps the legacy false to cholOnly', () => {
    expect(effectiveDayScope({ showOnShabbatAndYomTov: false })).toBe('cholOnly');
  });

  it('maps a legacy true or absent flag to all', () => {
    expect(effectiveDayScope({ showOnShabbatAndYomTov: true })).toBe('all');
    expect(effectiveDayScope({})).toBe('all');
  });
});

describe('isEventVisibleOn — dayScope matrix', () => {
  const CHOL = ctx();
  const EREV_SHABBAT = ctx({ isErevShabbat: true });
  const SHABBAT = ctx({ isShabbat: true });
  const EREV_YOM_TOV = ctx({ isErevYomTov: true });
  const YOM_TOV = ctx({ isYomTov: true });
  const SHABBAT_YOM_TOV = ctx({ isShabbat: true, isYomTov: true });

  const cases: [DayScope, boolean[]][] = [
    //                 chol,  erevShabbat, shabbat, erevYomTov, yomTov, shabbat+yomTov
    ['all',           [true,  true,        true,    true,       true,   true]],
    ['cholOnly',      [true,  true,        false,   true,       false,  false]],
    ['shabbatYomTov', [false, false,       true,    false,      true,   true]],
    ['yomTovOnly',    [false, false,       false,   false,      true,   true]],
    ['erevYomTovOnly',[false, false,       false,   true,       false,  false]],
  ];

  it.each(cases)('%s', (dayScope, expected) => {
    const contexts = [CHOL, EREV_SHABBAT, SHABBAT, EREV_YOM_TOV, YOM_TOV, SHABBAT_YOM_TOV];
    expect(contexts.map((c) => isEventVisibleOn({ dayScope }, c))).toEqual(expected);
  });
});
