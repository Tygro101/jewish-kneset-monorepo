/**
 * Days-ahead (schedule column count) resolution.
 *
 * The CMS writes `displaySettings.scheduleDaysAhead` as a nested object with one
 * value per physical screen. Each value is either a number of days or the
 * SCREEN_CONFIG sentinel, which defers to the device's own on-screen setting.
 *
 * MIRROR: kneset-cms/src/lib/daysAhead.ts (jk-mono-repos) must stay in sync.
 */
import { MIN_DAYS_AHEAD, clampDaysAhead } from './timeline-builder';

/** Which physical screen a days-ahead value applies to. Matches smart-clock's AppRoute. */
export type DaysAheadTarget = 'tv' | 'tablet';

/** Sentinel: no CMS value — the display uses its own on-screen setting. */
export const SCREEN_CONFIG = 'screen';

/** A single CMS-authored value: a day count, or "use the on-screen config". */
export type ScheduleDaysAheadValue = number | typeof SCREEN_CONFIG;

/** The nested `displaySettings.scheduleDaysAhead` object written by the CMS. */
export interface ScheduleDaysAheadSetting {
  tv?: ScheduleDaysAheadValue;
  tablet?: ScheduleDaysAheadValue;
}

/** Per-target upper bound and code default (used when nothing else is set). */
export const DAYS_AHEAD_LIMITS: Record<DaysAheadTarget, { max: number; default: number }> = {
  tv: { max: 7, default: 6 },
  tablet: { max: 3, default: 2 },
};

export function maxDaysAheadFor(target: DaysAheadTarget): number {
  return DAYS_AHEAD_LIMITS[target].max;
}

export function defaultDaysAheadFor(target: DaysAheadTarget): number {
  return DAYS_AHEAD_LIMITS[target].default;
}

/** Ordered dropdown options for a target: [1 … max]. */
export function daysAheadOptions(target: DaysAheadTarget): number[] {
  const options: number[] = [];
  for (let n = MIN_DAYS_AHEAD; n <= maxDaysAheadFor(target); n++) options.push(n);
  return options;
}

/**
 * Reads the CMS value for one target out of a raw `scheduleDaysAhead`.
 * Accepted shapes:
 *   - nested object: { tv: 5, tablet: 'screen' }
 *   - legacy flat number: 5  → applies to both targets
 *   - missing / anything else → SCREEN_CONFIG
 */
export function readCmsDaysAhead(raw: unknown, target: DaysAheadTarget): ScheduleDaysAheadValue {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw; // legacy flat value
  if (raw && typeof raw === 'object') {
    const value = (raw as Record<string, unknown>)[target];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return SCREEN_CONFIG;
}

/**
 * Final column count for a screen.
 * A CMS number wins; SCREEN_CONFIG defers to the device setting; an unusable
 * device setting falls back to the code default. Always clamped to 1…max(target).
 */
export function resolveDaysAheadFor(
  rawCmsSetting: unknown,
  deviceValue: unknown,
  target: DaysAheadTarget,
): number {
  const cms = readCmsDaysAhead(rawCmsSetting, target);
  const fallback = defaultDaysAheadFor(target);
  const max = maxDaysAheadFor(target);
  return cms === SCREEN_CONFIG
    ? clampDaysAhead(deviceValue, fallback, max)
    : clampDaysAhead(cms, fallback, max);
}
