/** Number of minutes in a full day. */
export const MINUTES_PER_DAY = 24 * 60;

/** Parses 'HH:mm' (also 'H:mm') to minutes from midnight. Returns null on anything invalid. */
export function parseHHmm(value: string | undefined | null): number | null {
  if (typeof value !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Left-pads a number to two digits ('5' -> '05'). */
export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Formats minutes from midnight as 'HH:mm', wrapping past 24h. */
export const minToLabel = (m: number): string =>
  `${pad2(Math.floor(m / 60) % 24)}:${pad2(m % 60)}`;
