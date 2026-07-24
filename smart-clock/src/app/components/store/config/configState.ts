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
}
