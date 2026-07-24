import type { DayKey } from '../../store/config/configState';

/** Maps JavaScript's Date.getDay() (0=Sunday … 6=Saturday) to config.json DayKey. */
const DAY_KEYS: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'shabbat'];

/**
 * Returns the DayKey for a given date (defaults to now).
 * Note: getDay() returns 0 for Sunday, which maps to index 0 = 'sunday'.
 * Saturday (6) maps to 'shabbat'.
 */
export function dayKeyFor(date: Date = new Date()): DayKey {
  return DAY_KEYS[date.getDay()];
}

/** Hebrew label for each day. */
export const DAY_LABELS: Record<DayKey, string> = {
  sunday: 'יום ראשון',
  monday: 'יום שני',
  tuesday: 'יום שלישי',
  wednesday: 'יום רביעי',
  thursday: 'יום חמישי',
  friday: 'יום שישי',
  shabbat: 'שבת',
};
