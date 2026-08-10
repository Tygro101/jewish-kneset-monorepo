import { describe, it, expect } from 'vitest';
import { buildTimelineDays, resolveDayEvents } from '@shared/core/schedule/timeline-builder';
import type { DayContext, DayKey, ScheduleEvent } from '@shared/core/schedule/schedule.models';

// Sun Sept 13 2026 = 2 Tishrei 5787 — Yom Tov falling on a weekday.
const WEEKDAY_YOM_TOV = new Date(2026, 8, 13);
// Mon July 20 2026 — plain weekday, no holiday.
const PLAIN_WEEKDAY = new Date(2026, 6, 20);

const cholOnly: ScheduleEvent = {
  time: '06:30', title: 'שחרית', type: 'tefilla', showOnShabbatAndYomTov: false,
};
const always: ScheduleEvent = {
  time: '21:00', title: 'ערבית', type: 'tefilla', showOnShabbatAndYomTov: true,
};
const shabbatMorning: ScheduleEvent = { time: '08:00', title: 'שחרית', type: 'tefilla' };

const schedule: Partial<Record<DayKey, ScheduleEvent[]>> = {
  sunday: [cholOnly, always],
  monday: [cholOnly, always],
  shabbat: [shabbatMorning],
};

const ctx = (over: Partial<DayContext> = {}): DayContext => ({
  isShabbat: false, isYomTov: false, isErevShabbat: false, isErevYomTov: false, ...over,
});

describe('schedule scope on the timeline', () => {
  it('a plain weekday keeps both events', () => {
    const [day] = buildTimelineDays(schedule, 1, PLAIN_WEEKDAY);
    expect(day.dayContext.isYomTov).toBe(false);
    expect(day.events.map((e) => e.title)).toEqual(['שחרית', 'ערבית']);
  });

  it('a weekday Yom Tov falls back to the shabbat bucket', () => {
    const [day] = buildTimelineDays(schedule, 1, WEEKDAY_YOM_TOV);
    expect(day.dayContext.isYomTov).toBe(true);
    expect(day.events).toHaveLength(1);
    expect(day.events[0].startMin).toBe(8 * 60);
  });

  it('resolveDayEvents picks the shabbat bucket on a weekday Yom Tov', () => {
    expect(resolveDayEvents(schedule, 'sunday', ctx({ isYomTov: true }))).toEqual([shabbatMorning]);
  });

  it('resolveDayEvents keeps the weekday bucket on a plain weekday', () => {
    expect(resolveDayEvents(schedule, 'monday', ctx())).toEqual([cholOnly, always]);
  });

  it('resolveDayEvents does not redirect Saturday', () => {
    expect(resolveDayEvents(schedule, 'shabbat', ctx({ isShabbat: true, isYomTov: true }))).toEqual([
      shabbatMorning,
    ]);
  });

  it('an authored endTime wins over the keyword heuristic', () => {
    const withEnd: Partial<Record<DayKey, ScheduleEvent[]>> = {
      monday: [{ time: '06:30', endTime: '07:15', title: 'שחרית', type: 'tefilla' }],
    };
    const [day] = buildTimelineDays(withEnd, 1, PLAIN_WEEKDAY);
    expect(day.events[0].endMin).toBe(7 * 60 + 15);
    expect(day.events[0].hasExplicitEnd).toBe(true);
  });

  it('events without explicit end have hasExplicitEnd = false', () => {
    const noEnd: Partial<Record<DayKey, ScheduleEvent[]>> = {
      monday: [{ time: '06:30', title: 'שחרית', type: 'tefilla' }],
    };
    const [day] = buildTimelineDays(noEnd, 1, PLAIN_WEEKDAY);
    expect(day.events[0].hasExplicitEnd).toBe(false);
  });
});
