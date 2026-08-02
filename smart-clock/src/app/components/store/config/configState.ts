/** Day keys matching the structure in config.json weeklySchedule. */
export type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'shabbat';

export interface ScheduleEvent {
  time: string;
  title: string;
  type: 'tefilla' | 'shiur' | 'event';
}

export interface Presentation {
  title: string;
  file: string;
  type: 'pdf' | 'image';
  /**
   * Per-slide display duration in seconds. When absent or invalid,
   * `displaySettings.presentationDurationSeconds` is used instead.
   */
  durationSeconds?: number;
}

/** Category of a full-screen text message. Drives the accent colour on the slide. */
export type MessageType = 'donor' | 'announcement' | 'memorial' | 'mazaltov';

/**
 * A full-screen text message (donor recognition, announcement, memorial, mazal tov).
 * Written by the CMS into `activeMessages`; absent in configs that never used it.
 *
 * `title` may contain newlines — each line renders as its own large name row,
 * which is how multi-name donor slides are expressed.
 */
export interface DisplayMessage {
  type: MessageType;
  title: string;
  body: string;
  /** Per-message duration in seconds. Falls back to presentationDurationSeconds. */
  durationSeconds?: number;
}

export interface TenantConfig {
  tenant: { id: string; displayName: string };
  displaySettings: {
    mainDashboardDurationSeconds: number;
    presentationDurationSeconds: number;
  };
  weeklySchedule: Record<DayKey, ScheduleEvent[]>;
  activePresentations: Presentation[];
  /**
   * Full-screen text messages, derived by the CMS. Optional: configs written
   * before the messages feature existed do not have this key.
   */
  activeMessages?: DisplayMessage[];
}

export interface ConfigState {
  tenantId: string | null;
  data: TenantConfig | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
  /** True while a background refresh (polling) is in flight. Never blanks the display. */
  refreshing: boolean;
  /** Last background-refresh failure. Does not affect `status` — stale data keeps showing. */
  lastRefreshError?: string;
}
