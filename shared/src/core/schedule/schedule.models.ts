/** Day of week key as authored in config.json (Saturday is 'shabbat'). */
export type DayKey =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'shabbat';

/** Extra, non-weekday buckets a config.json weeklySchedule may carry. */
export type SpecialBucketKey = 'yomTov' | 'erevYomTov';

/** Every bucket key weeklySchedule may contain. */
export type ScheduleBucketKey = DayKey | SpecialBucketKey;

/** weeklySchedule as authored: any bucket may be missing. */
export type WeeklySchedule = Partial<Record<ScheduleBucketKey, ScheduleEvent[]>>;

/** Kind of schedule entry, drives styling on the timeline. */
export type ScheduleEventType = 'tefilla' | 'shiur' | 'event';

/**
 * Which classes of day an event may appear on.
 *
 * 'all'            — every day the event's bucket is read on
 * 'cholOnly'       — hidden on Shabbat and Yom Tov
 * 'shabbatYomTov'  — only Shabbat or Yom Tov
 * 'yomTovOnly'     — only Yom Tov (not a plain Shabbat)
 * 'erevYomTovOnly' — only the day before a Yom Tov
 */
export type DayScope =
  | 'all'
  | 'cholOnly'
  | 'shabbatYomTov'
  | 'yomTovOnly'
  | 'erevYomTovOnly';

/** A zman an event's start time may be anchored to. */
export type ZmanAnchor =
  | 'netz'
  | 'minchaGdola'
  | 'minchaKtana'
  | 'plagMincha'
  | 'shkiah'
  | 'tzetCochavimGeonim';

/**
 * A start time derived from a zman instead of a fixed clock time.
 * `direction` must match the anchor's rule in dynamic-time.ts — the CMS
 * only ever authors the allowed direction, and resolution rejects the rest.
 */
export interface DynamicTime {
  anchor: ZmanAnchor;
  direction: 'before' | 'after';
  /** Non-negative magnitude in minutes. */
  offsetMinutes: number;
}

/** An event exactly as authored in config.json by the CMS. */
export interface ScheduleEvent {
  /**
   * 'HH:mm' start. Optional: absent when `dynamicTime` supplies the start.
   * When both are absent the event is dropped from the timeline.
   */
  time?: string;
  /** 'HH:mm' end — CMS-authored, wins over every heuristic. */
  endTime?: string;
  /** Alternative to endTime. */
  durationMinutes?: number;
  title: string;
  subtitle?: string;
  type: ScheduleEventType;
  /**
   * @deprecated superseded by `dayScope`. Still honoured when `dayScope` is
   * absent so configs written before this field keep their behaviour.
   */
  showOnShabbatAndYomTov?: boolean;
  /** Which classes of day this event appears on. Absent falls back to the legacy boolean. */
  dayScope?: DayScope;
  /** When present the start time is derived from a zman. */
  dynamicTime?: DynamicTime;
  /** CMS-only: stable per-bucket id. Ignored by the renderer. */
  id?: string;
  /** CMS-only: series identity shared by every copy of a recurring event. */
  groupId?: string;
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
  /** true when endMin was derived from an explicit CMS endTime or durationMinutes. */
  hasExplicitEnd: boolean;
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
