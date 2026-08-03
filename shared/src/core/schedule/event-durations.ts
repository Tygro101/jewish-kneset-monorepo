import type { DayContext, ScheduleEvent, ScheduleEventType } from './schedule.models';
import { parseHHmm } from './time-utils';

/** Per-type duration used when no keyword rule matches. */
export const DEFAULT_DURATIONS: Record<ScheduleEventType, number> = {
  tefilla: 30,
  shiur: 60,
  event: 60,
};

/** Keyword → duration rule. `longOn` lists the DayContext flags that trigger `long`. */
export interface PrayerDurationRule {
  keywords: string[];
  base: number;
  long: number;
  longOn: Array<keyof DayContext>;
}

export const PRAYER_DURATION_RULES: PrayerDurationRule[] = [
  { keywords: ['שחרית'], base: 60, long: 120, longOn: ['isShabbat', 'isYomTov'] },
  { keywords: ['מנחה'], base: 25, long: 35, longOn: ['isShabbat', 'isYomTov'] },
  { keywords: ['ערבית', 'מעריב'], base: 20, long: 40, longOn: ['isErevShabbat', 'isErevYomTov'] },
];

/** Fallback duration — only used when the CMS did NOT supply endTime or durationMinutes. */
export function fallbackDurationMinutes(
  event: Pick<ScheduleEvent, 'title' | 'type'>,
  ctx: DayContext,
  rules: PrayerDurationRule[] = PRAYER_DURATION_RULES,
): number {
  const title = event.title ?? '';
  const rule = rules.find((r) => r.keywords.some((k) => title.includes(k)));
  if (!rule) return DEFAULT_DURATIONS[event.type] ?? DEFAULT_DURATIONS.event;
  return rule.longOn.some((flag) => ctx[flag]) ? rule.long : rule.base;
}

/**
 * Resolves the end minute for an event.
 * Precedence: endTime > durationMinutes > prayer keyword rule > per-type default.
 */
export function resolveEndMin(event: ScheduleEvent, startMin: number, ctx: DayContext): number {
  const explicitEnd = parseHHmm(event.endTime);
  if (explicitEnd !== null && explicitEnd > startMin) return explicitEnd;
  if (typeof event.durationMinutes === 'number' && event.durationMinutes > 0) {
    return startMin + Math.round(event.durationMinutes);
  }
  return startMin + fallbackDurationMinutes(event, ctx);
}
