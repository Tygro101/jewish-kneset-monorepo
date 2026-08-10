import { MINUTES_PER_DAY, parseHHmm } from './time-utils';
import type { DynamicTime, ScheduleEvent, ZmanAnchor } from './schedule.models';

/** Every resolved dynamic time lands on a multiple of this many minutes. */
export const ROUND_STEP_MINUTES = 5;

/** Authoring rule for one anchor. Single source of truth for the CMS table too. */
export interface AnchorRule {
  /** Hebrew label. */
  label: string;
  /** The only direction that may be authored for this anchor. */
  direction: 'before' | 'after';
  /** Allowed offsets in minutes, ascending. The first entry is the default. */
  offsets: number[];
  /**
   * When true the resolved time may never fall earlier than the anchor itself.
   * Rounding down would otherwise put ערבית a few minutes before צאת הכוכבים.
   */
  clampForward: boolean;
}

/**
 * The authoring table. Mirrored (as data only) in
 * kneset-cms/src/lib/zmanim.ts — change both together.
 */
export const ANCHOR_RULES: Record<ZmanAnchor, AnchorRule> = {
  netz: {
    label: 'הנץ',
    direction: 'before',
    offsets: [35, 40, 45, 50, 55, 60, 70, 75, 80, 90, 100, 110, 120],
    clampForward: false,
  },
  minchaGdola: {
    label: 'מנחה גדולה',
    direction: 'after',
    offsets: [0, 5, 10, 15, 20, 30, 45, 60],
    clampForward: true,
  },
  minchaKtana: {
    label: 'מנחה קטנה',
    direction: 'after',
    offsets: [0, 5, 10, 15, 20, 30, 45, 60],
    clampForward: true,
  },
  plagMincha: {
    label: 'פלג המנחה',
    direction: 'before',
    offsets: [0, 5, 10, 15, 20, 25, 30, 35, 40],
    clampForward: false,
  },
  shkiah: {
    label: 'שקיעה',
    direction: 'before',
    offsets: [5, 10, 15, 20, 25, 30, 40, 50, 60],
    clampForward: false,
  },
  tzetCochavimGeonim: {
    label: 'צאת הכוכבים',
    direction: 'after',
    offsets: [0, 5, 10, 15, 20, 25, 30],
    clampForward: true,
  },
};

/** Anchors in authoring order. */
export const ZMAN_ANCHORS = Object.keys(ANCHOR_RULES) as ZmanAnchor[];

/** Resolved zmanim for one date, as minutes from midnight. */
export type AnchorMinutes = Partial<Record<ZmanAnchor, number>>;

/** Largest multiple of `step` that is <= minutes. */
export function floorToStep(minutes: number, step: number = ROUND_STEP_MINUTES): number {
  return Math.floor(minutes / step) * step;
}

/** Smallest multiple of `step` that is >= minutes. */
export function ceilToStep(minutes: number, step: number = ROUND_STEP_MINUTES): number {
  return Math.ceil(minutes / step) * step;
}

/** True when the authored dynamic time matches its anchor's rule. */
export function isValidDynamicTime(dyn: DynamicTime | undefined | null): boolean {
  if (!dyn) return false;
  const rule = ANCHOR_RULES[dyn.anchor];
  if (!rule) return false;
  if (dyn.direction !== rule.direction) return false;
  if (typeof dyn.offsetMinutes !== 'number' || !Number.isFinite(dyn.offsetMinutes)) return false;
  return rule.offsets.includes(dyn.offsetMinutes);
}

/**
 * Resolves a dynamic time to minutes from midnight, or null when it cannot
 * be resolved (invalid authoring, missing anchor for the date, out of range).
 *
 * Rounding: always floor to ROUND_STEP_MINUTES, so a "before" anchor is never
 * late. For a clampForward anchor, a floored result that lands before the
 * anchor is pushed up to the next step instead.
 */
export function resolveDynamicMin(
  dyn: DynamicTime | undefined | null,
  anchors: AnchorMinutes | null | undefined,
): number | null {
  if (!isValidDynamicTime(dyn) || !dyn) return null;
  const anchorMin = anchors?.[dyn.anchor];
  if (typeof anchorMin !== 'number' || !Number.isFinite(anchorMin)) return null;

  const rule = ANCHOR_RULES[dyn.anchor];
  const raw =
    rule.direction === 'before' ? anchorMin - dyn.offsetMinutes : anchorMin + dyn.offsetMinutes;

  let rounded = floorToStep(raw);
  if (rule.clampForward && rounded < anchorMin) rounded = ceilToStep(anchorMin);

  if (rounded < 0 || rounded >= MINUTES_PER_DAY) return null;
  return rounded;
}

/** Resolves an event's start: dynamic when authored, else the fixed 'HH:mm'. */
export function resolveStartMin(
  event: Pick<ScheduleEvent, 'time' | 'dynamicTime'>,
  anchors: AnchorMinutes | null | undefined,
): number | null {
  if (event.dynamicTime) return resolveDynamicMin(event.dynamicTime, anchors);
  return parseHHmm(event.time);
}

/** 'שעה ו-20 דק'' / '45 דק'' / 'בזמן' — for human-facing copy. */
export function formatOffsetHe(minutes: number): string {
  if (minutes === 0) return 'בזמן';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} דק'`;
  const hourPart = hours === 1 ? 'שעה' : `${hours} שעות`;
  return mins === 0 ? hourPart : `${hourPart} ו-${mins} דק'`;
}

/** 'שעה ו-20 דק' לפני הנץ' — one line describing an authored dynamic time. */
export function describeDynamicTime(dyn: DynamicTime): string {
  const rule = ANCHOR_RULES[dyn.anchor];
  if (!rule) return '';
  if (dyn.offsetMinutes === 0) return `בזמן ${rule.label}`;
  const word = rule.direction === 'before' ? 'לפני' : 'אחרי';
  return `${formatOffsetHe(dyn.offsetMinutes)} ${word} ${rule.label}`;
}
