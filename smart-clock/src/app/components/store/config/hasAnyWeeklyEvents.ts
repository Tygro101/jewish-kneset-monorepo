import type { TenantConfig } from './configState';

/** True when the tenant config has at least one event in any day of weeklySchedule. */
export function hasAnyWeeklyEvents(data: TenantConfig | null): boolean {
  if (!data?.weeklySchedule) return false;
  return Object.values(data.weeklySchedule).some((events) => events && events.length > 0);
}
