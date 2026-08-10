import { describe, it, expect } from 'vitest';
import { buildTimelineDays, resolveDayEvents } from '@shared/core/schedule/timeline-builder';
import type { DayContext, DayKey, ScheduleEvent, WeeklySchedule } from '@shared/core/schedule/schedule.models';

// Sun Sept 13 2026 = 2 Tishrei 5787 — Yom Tov on a weekday. Erev is Sat Sept 12.
const WEEKDAY_YOM_TOV = new Date(2026, 8, 13);
const EREV_YOM_TOV = new Date(2026, 8, 12);
// Mon July 20 2026 — plain weekday.
const PLAIN_WEEKDAY = new Date(2026, 6, 20);

const ctx = (over: Partial<DayContext> = {}): DayContext => ({
  isShabbat: false, isYomTov: false, isErevShabbat: false, isErevYomTov: false, ...over,
});

const weekdayShacharit: ScheduleEvent = {
  time: '06:30', title: 'שחרית', type: 'tefilla', dayScope: 'cholOnly',
};
const shabbatShacharit: ScheduleEvent = {
  time: '08:00', title: 'שחרית', type: 'tefilla', dayScope: 'shabbatYomTov',
};
const chagHallel: ScheduleEvent = {
  time: '09:30', title: 'הלל', type: 'tefilla', dayScope: 'yomTovOnly',
};
const erevChagMincha: ScheduleEvent = {
  time: '18:15', title: 'מנחה ערב חג', type: 'tefilla', dayScope: 'erevYomTovOnly',
};

const schedule: WeeklySchedule = {
  sunday: [weekdayShacharit],
  monday: [weekdayShacharit],
  shabbat: [shabbatShacharit],
  yomTov: [chagHallel],
  erevYomTov: [erevChagMincha],
};

describe('special buckets', () => {
  it('appends the yomTov bucket to the shabbat pattern on a weekday chag', () => {
    const [day] = buildTimelineDays(schedule, 1, WEEKDAY_YOM_TOV);
    expect(day.dayContext.isYomTov).toBe(true);
    expect(day.events.map((e) => e.title)).toEqual(['שחרית', 'הלל']);
  });

  it('appends the erevYomTov bucket on erev chag', () => {
    const [day] = buildTimelineDays(schedule, 1, EREV_YOM_TOV);
    expect(day.dayContext.isErevYomTov).toBe(true);
    expect(day.events.map((e) => e.title)).toContain('מנחה ערב חג');
  });

  it('shows neither special bucket on a plain weekday', () => {
    const [day] = buildTimelineDays(schedule, 1, PLAIN_WEEKDAY);
    expect(day.events.map((e) => e.title)).toEqual(['שחרית']);
  });

  it('resolveDayEvents appends rather than replaces on a chag', () => {
    expect(resolveDayEvents(schedule, 'sunday', ctx({ isYomTov: true }))).toEqual([
      shabbatShacharit,
      chagHallel,
    ]);
  });

  it('returns the base array untouched when no special bucket applies', () => {
    expect(resolveDayEvents(schedule, 'monday', ctx())).toEqual([weekdayShacharit]);
  });
});

describe('dynamic times on the timeline', () => {
  const dynamicSchedule: WeeklySchedule = {
    monday: [
      {
        title: 'שחרית',
        type: 'tefilla',
        dayScope: 'cholOnly',
        dynamicTime: { anchor: 'netz', direction: 'before', offsetMinutes: 80 },
      },
    ],
  };

  it('resolves a netz-anchored start from injected anchors', () => {
    const [day] = buildTimelineDays(dynamicSchedule, 1, PLAIN_WEEKDAY, {
      anchorsFor: () => ({ netz: 6 * 60 + 6 }),
    });
    expect(day.events).toHaveLength(1);
    expect(day.events[0].startMin).toBe(4 * 60 + 45); // 06:06 − 80m = 04:46 → floor to 04:45
  });

  it('drops a dynamic event when anchors are unavailable', () => {
    const [day] = buildTimelineDays(dynamicSchedule, 1, PLAIN_WEEKDAY, { anchorsFor: () => null });
    expect(day.events).toHaveLength(0);
  });

  it('resolves against real zmanim and lands on a 5-minute boundary', () => {
    const days = buildTimelineDays(dynamicSchedule, 7, PLAIN_WEEKDAY);
    const starts = days.flatMap((d) => d.events.map((e) => e.startMin));
    expect(starts.length).toBeGreaterThan(0);
    expect(starts.every((m) => m % 5 === 0)).toBe(true);
  });

  it('does not request anchors for a schedule with no dynamic events', () => {
    let calls = 0;
    buildTimelineDays(schedule, 7, PLAIN_WEEKDAY, {
      anchorsFor: () => { calls += 1; return null; },
    });
    expect(calls).toBe(0);
  });
});
