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

export interface TenantConfig {
  tenant: { id: string; displayName: string };
  displaySettings: {
    mainDashboardDurationSeconds: number;
    presentationDurationSeconds: number;
  };
  weeklySchedule: Record<DayKey, ScheduleEvent[]>;
  activePresentations: Presentation[];
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
