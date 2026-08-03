import { describe, it, expect } from 'vitest';
import {
  buildDayEvents,
  buildTimelineDays,
  clampDaysAhead,
  MIN_DAYS_AHEAD,
  MAX_DAYS_AHEAD,
} from '@shared/core/schedule/timeline-builder';
import { computeWindow, fractionOf, hourMarks, BASE_WINDOW } from '@shared/core/schedule/timeline-window';
import type { DayContext, DayKey, ScheduleEvent, TimelineDay } from '@shared/core/schedule/schedule.models';

const WEEKDAY: DayContext = { isShabbat: false, isYomTov: false, isErevShabbat: false, isErevYomTov: false };

describe('timeline-builder', () => {
  describe('buildDayEvents', () => {
    it('resolves events and sorts by start time', () => {
      const raw: ScheduleEvent[] = [
        { time: '13:00', title: 'מנחה', type: 'tefilla' },
        { time: '06:30', title: 'שחרית', type: 'tefilla' },
      ];
      const result = buildDayEvents(raw, WEEKDAY);
      expect(result).toHaveLength(2);
      expect(result[0].startMin).toBe(390); // 06:30
      expect(result[1].startMin).toBe(780); // 13:00
    });

    it('clips overlapping events', () => {
      const raw: ScheduleEvent[] = [
        { time: '08:00', title: 'שחרית', type: 'tefilla' }, // 08:00–09:00 (60min)
        { time: '08:45', title: 'שיעור גמרא', type: 'shiur' }, // starts before שחרית ends
      ];
      const result = buildDayEvents(raw, WEEKDAY);
      expect(result[0].startMin).toBe(480);
      expect(result[0].endMin).toBe(525); // clipped to 08:45
      expect(result[0].clipped).toBe(true);
      expect(result[1].startMin).toBe(525);
      expect(result[1].clipped).toBe(false);
    });

    it('handles chain of three overlaps', () => {
      const raw: ScheduleEvent[] = [
        { time: '08:00', title: 'שחרית', type: 'tefilla' }, // 08:00-09:00
        { time: '08:30', title: 'שיעור א', type: 'shiur' }, // 08:30-09:30
        { time: '09:00', title: 'שיעור ב', type: 'shiur' }, // 09:00-10:00
      ];
      const result = buildDayEvents(raw, WEEKDAY);
      expect(result[0].endMin).toBe(510); // clipped to 08:30
      expect(result[0].clipped).toBe(true);
      expect(result[1].endMin).toBe(540); // clipped to 09:00
      expect(result[1].clipped).toBe(true);
      expect(result[2].endMin).toBe(600); // not clipped
      expect(result[2].clipped).toBe(false);
    });

    it('drops events with invalid time', () => {
      const raw: ScheduleEvent[] = [
        { time: 'abc', title: 'bad', type: 'event' },
        { time: '10:00', title: 'good', type: 'event' },
      ];
      const result = buildDayEvents(raw, WEEKDAY);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('good');
    });

    it('handles empty array gracefully', () => {
      expect(buildDayEvents([], WEEKDAY)).toEqual([]);
    });

    it('handles null/undefined gracefully', () => {
      expect(buildDayEvents(null as any, WEEKDAY)).toEqual([]);
      expect(buildDayEvents(undefined as any, WEEKDAY)).toEqual([]);
    });

    it('assigns prefixed IDs', () => {
      const raw: ScheduleEvent[] = [
        { time: '08:00', title: 'A', type: 'tefilla' },
        { time: '10:00', title: 'B', type: 'shiur' },
      ];
      const result = buildDayEvents(raw, WEEKDAY, 'day0');
      expect(result[0].id).toBe('day0-0');
      expect(result[1].id).toBe('day0-1');
    });

    it('equal start times are sorted by endMin', () => {
      const raw: ScheduleEvent[] = [
        { time: '08:00', title: 'long', type: 'shiur', durationMinutes: 90 },
        { time: '08:00', title: 'short', type: 'tefilla', durationMinutes: 20 },
      ];
      const result = buildDayEvents(raw, WEEKDAY);
      // shorter endMin first
      expect(result[0].title).toBe('short');
      expect(result[1].title).toBe('long');
    });

    it('does not produce negative spans from clipping equal-start events', () => {
      const raw: ScheduleEvent[] = [
        { time: '08:00', title: 'A', type: 'tefilla', durationMinutes: 5 },
        { time: '08:00', title: 'B', type: 'tefilla', durationMinutes: 60 },
      ];
      const result = buildDayEvents(raw, WEEKDAY);
      // A (08:00–08:05) sorts first, B (08:00–09:00) second. Clipping A to B's
      // start yields a zero-length span, which is acceptable; negative is not.
      for (const ev of result) {
        expect(ev.endMin).toBeGreaterThanOrEqual(ev.startMin);
      }
    });

    it('preserves subtitle and type', () => {
      const raw: ScheduleEvent[] = [{ time: '14:00', title: 'מנחה', subtitle: 'תפילת הציבור', type: 'tefilla' }];
      const result = buildDayEvents(raw, WEEKDAY);
      expect(result[0].subtitle).toBe('תפילת הציבור');
      expect(result[0].type).toBe('tefilla');
    });
  });

  describe('clampDaysAhead', () => {
    it('returns fallback for non-number', () => {
      expect(clampDaysAhead(undefined, 2)).toBe(2);
      expect(clampDaysAhead('7', 2)).toBe(2);
      expect(clampDaysAhead(null, 7)).toBe(7);
    });

    it('clamps below MIN to MIN', () => {
      expect(clampDaysAhead(0, 2)).toBe(MIN_DAYS_AHEAD);
      expect(clampDaysAhead(-5, 2)).toBe(MIN_DAYS_AHEAD);
    });

    it('clamps above MAX to MAX', () => {
      expect(clampDaysAhead(99, 2)).toBe(MAX_DAYS_AHEAD);
      expect(clampDaysAhead(10, 2)).toBe(MAX_DAYS_AHEAD);
    });

    it('rounds to nearest integer', () => {
      expect(clampDaysAhead(2.7, 2)).toBe(3);
      expect(clampDaysAhead(4.2, 2)).toBe(4);
    });

    it('passes through valid values', () => {
      expect(clampDaysAhead(1, 7)).toBe(1);
      expect(clampDaysAhead(7, 2)).toBe(7);
      expect(clampDaysAhead(4, 2)).toBe(4);
    });

    it('returns fallback for NaN/Infinity', () => {
      expect(clampDaysAhead(NaN, 3)).toBe(3);
      expect(clampDaysAhead(Infinity, 3)).toBe(3);
    });
  });

  describe('buildTimelineDays', () => {
    const schedule: Partial<Record<DayKey, ScheduleEvent[]>> = {
      monday: [
        { time: '06:30', title: 'שחרית', type: 'tefilla' },
        { time: '19:30', title: 'ערבית', type: 'tefilla' },
      ],
      tuesday: [
        { time: '06:30', title: 'שחרית', type: 'tefilla' },
        { time: '08:00', title: 'שיעור גמרא', type: 'shiur' },
      ],
    };

    it('returns correct number of days', () => {
      // Use a known Monday: July 20, 2026
      const from = new Date(2026, 6, 20);
      const days = buildTimelineDays(schedule, 7, from);
      expect(days).toHaveLength(7);
    });

    it('first day is always isToday=true, offset=0', () => {
      const from = new Date(2026, 6, 20);
      const days = buildTimelineDays(schedule, 3, from);
      expect(days[0].isToday).toBe(true);
      expect(days[0].offset).toBe(0);
      expect(days[1].isToday).toBe(false);
      expect(days[1].offset).toBe(1);
    });

    it('labels: today=היום, tomorrow=מחר, rest=weekday name', () => {
      const from = new Date(2026, 6, 20); // Monday
      const days = buildTimelineDays(schedule, 4, from);
      expect(days[0].label).toBe('היום');
      expect(days[1].label).toBe('מחר');
      expect(days[2].label).toBe('יום רביעי'); // Wednesday
      expect(days[3].label).toBe('יום חמישי'); // Thursday
    });

    it('wraps dayKey correctly across a week boundary', () => {
      // Start on Friday (July 17, 2026)
      const from = new Date(2026, 6, 17);
      const days = buildTimelineDays(schedule, 4, from);
      expect(days[0].dayKey).toBe('friday');
      expect(days[1].dayKey).toBe('shabbat');
      expect(days[2].dayKey).toBe('sunday');
      expect(days[3].dayKey).toBe('monday');
    });

    it('resolves events for matching days', () => {
      // Start on Monday July 20, 2026
      const from = new Date(2026, 6, 20);
      const days = buildTimelineDays(schedule, 2, from);
      expect(days[0].events).toHaveLength(2); // Monday
      expect(days[1].events).toHaveLength(2); // Tuesday
    });

    it('scopes event IDs per day offset', () => {
      const from = new Date(2026, 6, 20);
      const days = buildTimelineDays(schedule, 2, from);
      days[0].events.forEach((ev) => expect(ev.id.startsWith('d0-')).toBe(true));
      days[1].events.forEach((ev) => expect(ev.id.startsWith('d1-')).toBe(true));
      const allIds = days.flatMap((d) => d.events.map((e) => e.id));
      expect(new Set(allIds).size).toBe(allIds.length);
    });

    it('returns empty events for days not in schedule', () => {
      const from = new Date(2026, 6, 22); // Wednesday — not in our fixture
      const days = buildTimelineDays(schedule, 1, from);
      expect(days[0].events).toHaveLength(0);
    });

    it('handles empty weeklySchedule', () => {
      const days = buildTimelineDays({}, 7, new Date(2026, 6, 20));
      expect(days).toHaveLength(7);
      days.forEach((d) => expect(d.events).toHaveLength(0));
    });

    it('handles undefined weeklySchedule', () => {
      const days = buildTimelineDays(undefined as any, 3, new Date(2026, 6, 20));
      expect(days).toHaveLength(3);
    });

    it('each day has a sublabel in Hebrew format', () => {
      const from = new Date(2026, 6, 20);
      const days = buildTimelineDays(schedule, 1, from);
      expect(days[0].sublabel).toBeTruthy();
      expect(typeof days[0].sublabel).toBe('string');
    });

    it('advances the date by one day per offset', () => {
      const from = new Date(2026, 6, 20);
      const days = buildTimelineDays(schedule, 3, from);
      expect(days[0].date.getDate()).toBe(20);
      expect(days[1].date.getDate()).toBe(21);
      expect(days[2].date.getDate()).toBe(22);
    });

    it('marks Shabbat day context', () => {
      const from = new Date(2026, 6, 18); // Saturday
      const days = buildTimelineDays(schedule, 1, from);
      expect(days[0].dayKey).toBe('shabbat');
      expect(days[0].dayContext.isShabbat).toBe(true);
    });
  });
});

describe('timeline-window', () => {
  describe('computeWindow', () => {
    const emptyDay: TimelineDay = {
      date: new Date(),
      dayKey: 'monday',
      dayContext: { isShabbat: false, isYomTov: false, isErevShabbat: false, isErevYomTov: false },
      offset: 0,
      isToday: true,
      label: 'היום',
      sublabel: '',
      events: [],
    };

    it('returns base window when no events and no nowMin', () => {
      const w = computeWindow([emptyDay]);
      expect(w).toEqual(BASE_WINDOW);
    });

    it('widens for an event before 06:00', () => {
      const day = {
        ...emptyDay,
        events: [{ id: 'x', title: 't', type: 'tefilla' as const, startMin: 300, endMin: 360, clipped: false }],
      };
      const w = computeWindow([day]);
      expect(w.startMin).toBe(300); // 05:00
      expect(w.endMin).toBe(BASE_WINDOW.endMin);
    });

    it('widens for an event after 22:00', () => {
      const day = {
        ...emptyDay,
        events: [{ id: 'x', title: 't', type: 'tefilla' as const, startMin: 1350, endMin: 1410, clipped: false }],
      };
      const w = computeWindow([day]);
      expect(w.startMin).toBe(BASE_WINDOW.startMin);
      expect(w.endMin).toBe(1440); // 24:00 (capped)
    });

    it('widens for nowMin outside base', () => {
      const w = computeWindow([emptyDay], 300); // 05:00
      expect(w.startMin).toBe(300);
    });

    it('does not shrink below base window', () => {
      const day = {
        ...emptyDay,
        events: [{ id: 'x', title: 't', type: 'tefilla' as const, startMin: 480, endMin: 540, clipped: false }],
      };
      const w = computeWindow([day]);
      expect(w.startMin).toBe(BASE_WINDOW.startMin); // 360
      expect(w.endMin).toBe(BASE_WINDOW.endMin); // 1320
    });

    it('caps endMin at 1440 (24:00)', () => {
      const day = {
        ...emptyDay,
        events: [{ id: 'x', title: 't', type: 'tefilla' as const, startMin: 1430, endMin: 1450, clipped: false }],
      };
      const w = computeWindow([day]);
      expect(w.endMin).toBeLessThanOrEqual(1440);
    });

    it('ensures minimum window of 1 hour', () => {
      const w = computeWindow([], undefined, { startMin: 600, endMin: 600 });
      expect(w.endMin - w.startMin).toBeGreaterThanOrEqual(60);
    });

    it('aggregates across multiple days', () => {
      const early = {
        ...emptyDay,
        events: [{ id: 'a', title: 't', type: 'tefilla' as const, startMin: 305, endMin: 340, clipped: false }],
      };
      const late = {
        ...emptyDay,
        offset: 1,
        events: [{ id: 'b', title: 't', type: 'shiur' as const, startMin: 1330, endMin: 1385, clipped: false }],
      };
      const w = computeWindow([early, late]);
      expect(w.startMin).toBe(300); // floor(305/60)*60
      expect(w.endMin).toBe(1440); // ceil(1385/60)*60
    });

    it('handles an empty days array', () => {
      expect(computeWindow([])).toEqual(BASE_WINDOW);
    });
  });

  describe('fractionOf', () => {
    const w = BASE_WINDOW; // 360–1320 (960 min span)

    it('returns 0 at window start', () => {
      expect(fractionOf(360, w)).toBe(0);
    });

    it('returns 1 at window end', () => {
      expect(fractionOf(1320, w)).toBe(1);
    });

    it('returns 0.5 at midpoint', () => {
      expect(fractionOf(840, w)).toBeCloseTo(0.5);
    });

    it('clamps below 0', () => {
      expect(fractionOf(300, w)).toBe(0);
    });

    it('clamps above 1', () => {
      expect(fractionOf(1400, w)).toBe(1);
    });

    it('returns 0 for zero-span window', () => {
      expect(fractionOf(500, { startMin: 500, endMin: 500 })).toBe(0);
    });

    it('returns 0 for inverted window', () => {
      expect(fractionOf(500, { startMin: 600, endMin: 500 })).toBe(0);
    });
  });

  describe('hourMarks', () => {
    it('returns hour marks for base window', () => {
      const marks = hourMarks(BASE_WINDOW);
      expect(marks[0]).toBe(360); // 06:00
      expect(marks[marks.length - 1]).toBe(1320); // 22:00
      expect(marks).toHaveLength(17); // 06:00 through 22:00 inclusive
    });

    it('handles non-round start', () => {
      const marks = hourMarks({ startMin: 350, endMin: 600 });
      expect(marks[0]).toBe(360); // rounds up to 06:00
    });

    it('includes endMin if it falls on an hour', () => {
      const marks = hourMarks({ startMin: 360, endMin: 420 });
      expect(marks).toContain(420);
    });

    it('excludes a non-hour endMin remainder', () => {
      const marks = hourMarks({ startMin: 360, endMin: 430 });
      expect(marks).toEqual([360, 420]);
    });

    it('spaces marks exactly one hour apart', () => {
      const marks = hourMarks(BASE_WINDOW);
      for (let i = 1; i < marks.length; i++) {
        expect(marks[i] - marks[i - 1]).toBe(60);
      }
    });
  });
});
