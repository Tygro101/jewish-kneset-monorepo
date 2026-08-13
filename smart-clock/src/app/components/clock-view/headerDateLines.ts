/**
 * Builds the two header date lines from a Date and the Hebrew date string.
 * Pure function — no side effects, no Date.now().
 */
export interface HeaderDateLines {
  /** Primary: weekday + Hebrew date, e.g. 'יום רביעי כ״ט אב תשפ״ו' */
  primary: string;
  /** Secondary: Gregorian date without the weekday, e.g. '12 באוגוסט 2026' */
  secondary: string;
}

export function buildHeaderDateLines(date: Date, hebrewDate: string): HeaderDateLines {
  const weekday = date.toLocaleDateString('he-IL', { weekday: 'long' });
  const primary = hebrewDate
    ? `${weekday} ${hebrewDate}`
    : weekday;
  const secondary = date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return { primary, secondary };
}
