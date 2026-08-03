/** Day of week key as authored in config.json (Saturday is 'shabbat'). */
export type DayKey =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'shabbat';

/** Kind of schedule entry, drives styling on the timeline. */
export type ScheduleEventType = 'tefilla' | 'shiur' | 'event';

/** An event exactly as authored in config.json by the CMS. */
export interface ScheduleEvent {
  /** 'HH:mm' start — required. */
  time: string;
  /** 'HH:mm' end — CMS-authored, wins over every heuristic. */
  endTime?: string;
  /** Alternative to endTime. */
  durationMinutes?: number;
  title: string;
  subtitle?: string;
  type: ScheduleEventType;
}

/** Which "special day" properties hold for a date. */
export interface DayContext {
  isShabbat: boolean;
  isYomTov: boolean;
  isErevShabbat: boolean;
  isErevYomTov: boolean;
}

/** A resolved event, ready to position on a timeline. Minutes from midnight. */
export interface TimelineEvent {
  id: string;
  title: string;
  subtitle?: string;
  type: ScheduleEventType;
  startMin: number;
  endMin: number;
  /** true when endMin was clipped because the next event starts earlier. */
  clipped: boolean;
}

/** One day column of a timeline. */
export interface TimelineDay {
  date: Date;
  dayKey: DayKey;
  dayContext: DayContext;
  /** 0 = today, 1 = tomorrow, … */
  offset: number;
  isToday: boolean;
  /** 'היום' | 'מחר' | 'יום חמישי' */
  label: string;
  /** 'יום שלישי, 14 ביולי 2026' */
  sublabel: string;
  events: TimelineEvent[];
}

/** Visible vertical range of the timeline, in minutes from midnight. */
export interface TimelineWindow {
  startMin: number;
  endMin: number;
}
