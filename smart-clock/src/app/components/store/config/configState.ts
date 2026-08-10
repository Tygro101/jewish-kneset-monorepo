/** Day keys matching the structure in config.json weeklySchedule. */
export type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'shabbat';

import type { ScheduleDaysAheadSetting } from '@shared/core/schedule/days-ahead';

export interface ScheduleEvent {
  time: string;
  title: string;
  type: 'tefilla' | 'shiur' | 'event';
  /** CMS-authored end time — wins over all heuristics. */
  endTime?: string;
  /** Alternative to endTime: explicit duration in minutes. */
  durationMinutes?: number;
  /** Displayed under the title in comfortable/full density. */
  subtitle?: string;
  /**
   * When false the event is chol-only and is hidden on Shabbat and Yom Tov.
   * Absent is treated as true.
   */
  showOnShabbatAndYomTov?: boolean;
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
  tenant: {
    id: string;
    displayName: string;
    /**
     * Tenant city as a CitiesEnum value (Hebrew), used for all zmanim.
     * Absent or unrecognised falls back to DEFAULT_CITY.
     */
    location?: string;
  };
  displaySettings: {
    mainDashboardDurationSeconds: number;
    presentationDurationSeconds: number;
    /**
     * Calendar columns per screen: { tv: 1–7 | 'screen', tablet: 1–3 | 'screen' }.
     * 'screen' (or a missing value) defers to the device's on-screen setting.
     * A plain number is the legacy form and applies to both screens.
     */
    scheduleDaysAhead?: number | ScheduleDaysAheadSetting;
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
