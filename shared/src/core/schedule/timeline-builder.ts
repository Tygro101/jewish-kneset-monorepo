import { addDays } from 'date-fns';
import { DAY_LABELS, dayKeyFor } from './day-keys';
import { createDayContextResolver } from './day-context';
import { resolveEndMin } from './event-durations';
import { parseHHmm } from './time-utils';
import type { DayContext, DayKey, ScheduleEvent, TimelineDay, TimelineEvent } from './schedule.models';

export const MIN_DAYS_AHEAD = 1;
export const MAX_DAYS_AHEAD = 7;

/** Resolves ends, sorts by start, then clips each end to the next event's start. */
export function buildDayEvents(raw: ScheduleEvent[], ctx: DayContext, idPrefix = 'e'): TimelineEvent[] {
  const parsed = (raw ?? [])
    .map((ev, i) => {
      const startMin = parseHHmm(ev.time);
      if (startMin === null) return null;
      return {
        id: `${idPrefix}-${i}`,
        title: ev.title ?? '',
        subtitle: ev.subtitle,
        type: ev.type ?? 'event',
        startMin,
        endMin: resolveEndMin(ev, startMin, ctx),
        clipped: false,
      } as TimelineEvent;
    })
    .filter((e): e is TimelineEvent => e !== null)
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  // Overlap clipping: if A ends after B starts, clip A to end at B's start.
  for (let i = 0; i < parsed.length - 1; i++) {
    const next = parsed[i + 1];
    if (parsed[i].endMin > next.startMin) {
      parsed[i].endMin = next.startMin;
      parsed[i].clipped = true;
    }
  }
  return parsed;
}

/**
 * Clamps a user/CMS value to a valid range.
 * `max` lets a caller impose a tighter per-screen cap (e.g. 3 on tablet);
 * it is itself clamped to MIN_DAYS_AHEAD…MAX_DAYS_AHEAD.
 * The fallback is clamped too, so a TV default can never leak onto a tablet.
 */
export function clampDaysAhead(value: unknown, fallback: number, max: number = MAX_DAYS_AHEAD): number {
  const upper = Math.min(MAX_DAYS_AHEAD, Math.max(MIN_DAYS_AHEAD, Math.round(max)));
  const fit = (n: number) => Math.min(upper, Math.max(MIN_DAYS_AHEAD, Math.round(n)));
  if (typeof value !== 'number' || !Number.isFinite(value)) return fit(fallback);
  return fit(value);
}

/** Builds the full timeline data for N days starting from `from`. */
export function buildTimelineDays(
  weeklySchedule: Partial<Record<DayKey, ScheduleEvent[]>>,
  daysAhead: number,
  from: Date = new Date(),
): TimelineDay[] {
  const resolveCtx = createDayContextResolver();
  return Array.from({ length: daysAhead }, (_, offset) => {
    const date = addDays(from, offset);
    const dayKey = dayKeyFor(date);
    const dayContext = resolveCtx(date);
    return {
      date,
      dayKey,
      dayContext,
      offset,
      isToday: offset === 0,
      label: offset === 0 ? 'היום' : offset === 1 ? 'מחר' : DAY_LABELS[dayKey],
      sublabel: date.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      events: buildDayEvents(weeklySchedule?.[dayKey] ?? [], dayContext, `d${offset}`),
    };
  });
}
