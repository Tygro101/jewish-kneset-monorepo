import { HebrewCalendar, flags } from '@hebcal/core';
import { addDays } from 'date-fns';
import { DefaultOptions } from '../services/workers/handlers/constants/calendar.options';
import type { DayContext } from './schedule.models';

/** Yom Tov = a CHAG day that is not Chol HaMoed. */
export function isYomTovDate(date: Date): boolean {
  const events = HebrewCalendar.calendar({ ...DefaultOptions, start: date, end: date });
  return events.some((item) => {
    if (item.mask & flags.CHOL_HAMOED) return false;
    return Boolean(item.mask & flags.CHAG);
  });
}

/** Resolves the "special day" flags that hold for a date. */
export function resolveDayContext(date: Date): DayContext {
  const dow = date.getDay();
  return {
    isShabbat: dow === 6,
    isYomTov: isYomTovDate(date),
    isErevShabbat: dow === 5,
    isErevYomTov: isYomTovDate(addDays(date, 1)),
  };
}

/** Memoized resolver — avoids repeated hebcal calls within a single render cycle. */
export function createDayContextResolver(): (date: Date) => DayContext {
  const cache = new Map<string, DayContext>();
  return (date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const ctx = resolveDayContext(date);
    cache.set(key, ctx);
    return ctx;
  };
}
