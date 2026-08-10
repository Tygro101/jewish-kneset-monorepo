import { addDays } from 'date-fns';
import { DAY_LABELS, dayKeyFor } from './day-keys';
import { createDayContextResolver } from './day-context';
import { resolveEndMin } from './event-durations';
import { isEventVisibleOn } from './event-scope';
import { resolveStartMin, type AnchorMinutes } from './dynamic-time';
import { anchorMinutesFor, DEFAULT_CITY } from './zmanim-anchors';
import type {
  DayContext,
  DayKey,
  ScheduleEvent,
  TimelineDay,
  TimelineEvent,
  WeeklySchedule,
} from './schedule.models';

export const MIN_DAYS_AHEAD = 1;
export const MAX_DAYS_AHEAD = 7;

/**
 * Picks the events that apply to a day.
 *
 * Base bucket: on a Yom Tov that falls on a weekday the weekday bucket holds
 * chol times, which are wrong — davening follows the Shabbat pattern — so the
 * 'shabbat' bucket is read instead. A Yom Tov on Saturday already resolves to
 * 'shabbat', so nothing changes there.
 *
 * On top of the base bucket the special buckets are appended, never substituted:
 * a חג card renders alongside the Shabbat pattern, an ערב חג card alongside the
 * weekday list. Per-event dayScope then filters what is actually visible.
 */
export function resolveDayEvents(
  weeklySchedule: WeeklySchedule,
  dayKey: DayKey,
  ctx: DayContext,
): ScheduleEvent[] {
  const base =
    ctx.isYomTov && dayKey !== 'shabbat'
      ? weeklySchedule?.shabbat ?? []
      : weeklySchedule?.[dayKey] ?? [];

  const extras: ScheduleEvent[] = [];
  if (ctx.isYomTov) extras.push(...(weeklySchedule?.yomTov ?? []));
  if (ctx.isErevYomTov) extras.push(...(weeklySchedule?.erevYomTov ?? []));

  return extras.length === 0 ? base : [...base, ...extras];
}

/** Extra inputs a day's events may need beyond the day context. */
export interface BuildDayEventsOptions {
  /** Resolved zmanim for this date. Required only for dynamic events. */
  anchors?: AnchorMinutes | null;
}

/** Resolves starts and ends, sorts by start, then clips each end to the next start. */
export function buildDayEvents(
  raw: ScheduleEvent[],
  ctx: DayContext,
  idPrefix = 'e',
  options: BuildDayEventsOptions = {},
): TimelineEvent[] {
  const anchors = options.anchors ?? null;

  const parsed = (raw ?? [])
    .filter((ev) => isEventVisibleOn(ev, ctx))
    .map((ev, i) => {
      const startMin = resolveStartMin(ev, anchors);
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

/** Options for building a timeline. */
export interface BuildTimelineOptions {
  /** Tenant city, used to resolve zmanim. Defaults to DEFAULT_CITY. */
  city?: unknown;
  /** Override the anchor source. Tests inject a fixed map here. */
  anchorsFor?: (date: Date) => AnchorMinutes | null;
}

/** Builds the full timeline data for N days starting from `from`. */
export function buildTimelineDays(
  weeklySchedule: WeeklySchedule,
  daysAhead: number,
  from: Date = new Date(),
  options: BuildTimelineOptions = {},
): TimelineDay[] {
  const resolveCtx = createDayContextResolver();
  const city = options.city ?? DEFAULT_CITY;
  const anchorsFor = options.anchorsFor ?? ((date: Date) => anchorMinutesFor(date, city));

  return Array.from({ length: daysAhead }, (_, offset) => {
    const date = addDays(from, offset);
    const dayKey = dayKeyFor(date);
    const dayContext = resolveCtx(date);
    const dayEvents = resolveDayEvents(weeklySchedule, dayKey, dayContext);

    // Only pay for zmanim on days that actually place a dynamic event.
    const needsAnchors = dayEvents.some((ev) => Boolean(ev.dynamicTime));

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
      events: buildDayEvents(dayEvents, dayContext, `d${offset}`, {
        anchors: needsAnchors ? anchorsFor(date) : null,
      }),
    };
  });
}
