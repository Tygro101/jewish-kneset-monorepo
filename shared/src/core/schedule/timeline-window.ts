import type { TimelineDay, TimelineWindow } from './schedule.models';

export const BASE_WINDOW: TimelineWindow = { startMin: 6 * 60, endMin: 22 * 60 };
const HOUR = 60;

/** Base 06:00–22:00, widened (on whole hours) to contain every event and `nowMin`. */
export function computeWindow(days: TimelineDay[], nowMin?: number, base = BASE_WINDOW): TimelineWindow {
  let { startMin, endMin } = base;
  for (const day of days) {
    for (const ev of day.events) {
      startMin = Math.min(startMin, Math.floor(ev.startMin / HOUR) * HOUR);
      endMin = Math.max(endMin, Math.ceil(ev.endMin / HOUR) * HOUR);
    }
  }
  if (typeof nowMin === 'number') {
    startMin = Math.min(startMin, Math.floor(nowMin / HOUR) * HOUR);
    endMin = Math.max(endMin, Math.ceil((nowMin + 1) / HOUR) * HOUR);
  }
  return {
    startMin: Math.max(0, startMin),
    endMin: Math.min(24 * HOUR, Math.max(endMin, startMin + HOUR)),
  };
}

/** Fraction 0..1 of a minute value inside the window — the basis of %-based positioning. */
export function fractionOf(min: number, w: TimelineWindow): number {
  const span = w.endMin - w.startMin;
  return span <= 0 ? 0 : Math.min(1, Math.max(0, (min - w.startMin) / span));
}

/** Returns an array of minute values for each hour mark within the window. */
export function hourMarks(w: TimelineWindow): number[] {
  const first = Math.ceil(w.startMin / HOUR) * HOUR;
  const out: number[] = [];
  for (let m = first; m <= w.endMin; m += HOUR) out.push(m);
  return out;
}
