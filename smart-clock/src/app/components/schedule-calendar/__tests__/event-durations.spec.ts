import { describe, it, expect } from 'vitest';
import {
  fallbackDurationMinutes,
  hasExplicitEnd,
  resolveEndMin,
  PRAYER_DURATION_RULES,
  DEFAULT_DURATIONS,
} from '@shared/core/schedule/event-durations';
import type { DayContext, ScheduleEvent } from '@shared/core/schedule/schedule.models';

const WEEKDAY: DayContext = {
  isShabbat: false,
  isYomTov: false,
  isErevShabbat: false,
  isErevYomTov: false,
};
const SHABBAT: DayContext = {
  isShabbat: true,
  isYomTov: false,
  isErevShabbat: false,
  isErevYomTov: false,
};
const YOM_TOV: DayContext = {
  isShabbat: false,
  isYomTov: true,
  isErevShabbat: false,
  isErevYomTov: false,
};
const EREV_SHABBAT: DayContext = {
  isShabbat: false,
  isYomTov: false,
  isErevShabbat: true,
  isErevYomTov: false,
};
const EREV_YOM_TOV: DayContext = {
  isShabbat: false,
  isYomTov: false,
  isErevShabbat: false,
  isErevYomTov: true,
};

describe('event-durations', () => {
  describe('fallbackDurationMinutes', () => {
    it('שחרית on weekday = 60', () => {
      expect(fallbackDurationMinutes({ title: 'שחרית', type: 'tefilla' }, WEEKDAY)).toBe(60);
    });

    it('שחרית on Shabbat = 120', () => {
      expect(fallbackDurationMinutes({ title: 'שחרית', type: 'tefilla' }, SHABBAT)).toBe(120);
    });

    it('שחרית on Yom Tov = 120', () => {
      expect(fallbackDurationMinutes({ title: 'שחרית', type: 'tefilla' }, YOM_TOV)).toBe(120);
    });

    it('מנחה on weekday = 25', () => {
      expect(fallbackDurationMinutes({ title: 'מנחה גדולה', type: 'tefilla' }, WEEKDAY)).toBe(25);
    });

    it('מנחה on Shabbat = 35', () => {
      expect(fallbackDurationMinutes({ title: 'מנחה', type: 'tefilla' }, SHABBAT)).toBe(35);
    });

    it('מנחה on Yom Tov = 35', () => {
      expect(fallbackDurationMinutes({ title: 'מנחה קטנה', type: 'tefilla' }, YOM_TOV)).toBe(35);
    });

    it('ערבית on weekday = 20', () => {
      expect(fallbackDurationMinutes({ title: 'ערבית', type: 'tefilla' }, WEEKDAY)).toBe(20);
    });

    it('ערבית on Erev Shabbat = 40', () => {
      expect(fallbackDurationMinutes({ title: 'ערבית', type: 'tefilla' }, EREV_SHABBAT)).toBe(40);
    });

    it('ערבית on Erev Yom Tov = 40', () => {
      expect(fallbackDurationMinutes({ title: 'ערבית', type: 'tefilla' }, EREV_YOM_TOV)).toBe(40);
    });

    it('ערבית on Saturday (not erev) = 20', () => {
      expect(fallbackDurationMinutes({ title: 'ערבית', type: 'tefilla' }, SHABBAT)).toBe(20);
    });

    it('מעריב is an alias for ערבית = 20 on weekday', () => {
      expect(fallbackDurationMinutes({ title: 'מעריב', type: 'tefilla' }, WEEKDAY)).toBe(20);
    });

    it('מעריב on Erev Shabbat = 40', () => {
      expect(fallbackDurationMinutes({ title: 'מעריב', type: 'tefilla' }, EREV_SHABBAT)).toBe(40);
    });

    it('unmatched tefilla defaults to 30', () => {
      expect(fallbackDurationMinutes({ title: 'תפילה מיוחדת', type: 'tefilla' }, WEEKDAY)).toBe(30);
    });

    it('shiur defaults to 60', () => {
      expect(fallbackDurationMinutes({ title: 'שיעור גמרא', type: 'shiur' }, WEEKDAY)).toBe(60);
    });

    it('event defaults to 60', () => {
      expect(fallbackDurationMinutes({ title: 'כנס קהילתי', type: 'event' }, WEEKDAY)).toBe(60);
    });

    it('matches a keyword embedded in a longer title', () => {
      expect(fallbackDurationMinutes({ title: 'שחרית וותיקין', type: 'tefilla' }, WEEKDAY)).toBe(60);
    });

    it('keyword rule wins over the per-type default even for non-tefilla types', () => {
      // A shiur whose title happens to contain מנחה still matches the prayer rule.
      expect(fallbackDurationMinutes({ title: 'שיעור לפני מנחה', type: 'shiur' }, WEEKDAY)).toBe(25);
    });

    it('falls back to the type default when title is empty', () => {
      expect(fallbackDurationMinutes({ title: '', type: 'tefilla' }, WEEKDAY)).toBe(
        DEFAULT_DURATIONS.tefilla,
      );
    });

    it('honours a caller-supplied rule table', () => {
      const rules = [
        { keywords: ['סליחות'], base: 45, long: 75, longOn: ['isShabbat' as const] },
      ];
      expect(fallbackDurationMinutes({ title: 'סליחות', type: 'tefilla' }, WEEKDAY, rules)).toBe(45);
      expect(fallbackDurationMinutes({ title: 'סליחות', type: 'tefilla' }, SHABBAT, rules)).toBe(75);
      // A title matching the default table is NOT matched by the custom table.
      expect(fallbackDurationMinutes({ title: 'שחרית', type: 'tefilla' }, WEEKDAY, rules)).toBe(30);
    });
  });

  describe('PRAYER_DURATION_RULES', () => {
    it('has a long duration greater than its base for every rule', () => {
      for (const rule of PRAYER_DURATION_RULES) {
        expect(rule.long).toBeGreaterThan(rule.base);
        expect(rule.keywords.length).toBeGreaterThan(0);
        expect(rule.longOn.length).toBeGreaterThan(0);
      }
    });
  });

  describe('resolveEndMin', () => {
    const makeEvent = (overrides: Partial<ScheduleEvent> = {}): ScheduleEvent => ({
      time: '08:00',
      title: 'שחרית',
      type: 'tefilla',
      ...overrides,
    });

    it('uses endTime when provided and valid', () => {
      const ev = makeEvent({ endTime: '09:30' });
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(570); // 09:30 = 570
    });

    it('endTime takes precedence over durationMinutes', () => {
      const ev = makeEvent({ endTime: '09:30', durationMinutes: 15 });
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(570);
    });

    it('ignores endTime if earlier than start', () => {
      const ev = makeEvent({ endTime: '07:00' });
      // Should fall through to duration rule: שחרית weekday = 60
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(540);
    });

    it('ignores endTime equal to start', () => {
      const ev = makeEvent({ endTime: '08:00' });
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(540);
    });

    it('uses durationMinutes when endTime absent', () => {
      const ev = makeEvent({ durationMinutes: 45 });
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(525); // 480 + 45
    });

    it('durationMinutes takes precedence over keyword rule', () => {
      const ev = makeEvent({ durationMinutes: 90 });
      // Would be 60 by keyword rule, but durationMinutes wins
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(570); // 480 + 90
    });

    it('rounds fractional durationMinutes', () => {
      const ev = makeEvent({ durationMinutes: 44.6 });
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(525);
    });

    it('falls through to keyword rule when no explicit end', () => {
      const ev = makeEvent({});
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(540); // 480 + 60 (שחרית weekday)
    });

    it('falls through to keyword rule with Shabbat context', () => {
      const ev = makeEvent({});
      expect(resolveEndMin(ev, 480, SHABBAT)).toBe(600); // 480 + 120 (שחרית Shabbat)
    });

    it('ignores invalid endTime format', () => {
      const ev = makeEvent({ endTime: 'abc' });
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(540);
    });

    it('ignores out-of-range endTime', () => {
      const ev = makeEvent({ endTime: '25:00' });
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(540);
    });

    it('ignores zero or negative durationMinutes', () => {
      const ev = makeEvent({ durationMinutes: 0 });
      expect(resolveEndMin(ev, 480, WEEKDAY)).toBe(540);
      expect(resolveEndMin(makeEvent({ durationMinutes: -30 }), 480, WEEKDAY)).toBe(540);
    });

    it('uses the per-type default for an unmatched shiur', () => {
      const ev = makeEvent({ title: 'שיעור גמרא', type: 'shiur' });
      expect(resolveEndMin(ev, 1200, WEEKDAY)).toBe(1260); // 20:00 + 60
    });
  });
});


  describe('hasExplicitEnd', () => {
    it('returns true when endTime is valid and after start', () => {
      expect(hasExplicitEnd({ endTime: '09:30' }, 480)).toBe(true);
    });

    it('returns true when durationMinutes is positive', () => {
      expect(hasExplicitEnd({ durationMinutes: 45 }, 480)).toBe(true);
    });

    it('returns false when neither endTime nor durationMinutes is provided', () => {
      expect(hasExplicitEnd({}, 480)).toBe(false);
    });

    it('returns false when endTime is earlier than start', () => {
      expect(hasExplicitEnd({ endTime: '07:00' }, 480)).toBe(false);
    });

    it('returns false when endTime is invalid', () => {
      expect(hasExplicitEnd({ endTime: 'abc' }, 480)).toBe(false);
    });

    it('returns false when durationMinutes is zero', () => {
      expect(hasExplicitEnd({ durationMinutes: 0 }, 480)).toBe(false);
    });

    it('returns false when durationMinutes is negative', () => {
      expect(hasExplicitEnd({ durationMinutes: -10 }, 480)).toBe(false);
    });

    it('endTime wins even if durationMinutes is also provided', () => {
      expect(hasExplicitEnd({ endTime: '09:30', durationMinutes: 15 }, 480)).toBe(true);
    });
  });
