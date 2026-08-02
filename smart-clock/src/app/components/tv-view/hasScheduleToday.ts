import type { TenantConfig } from '../store/config/configState';
import { dayKeyFor } from '../clock-view/schedule/dayKey';

/**
 * True when the tenant config has at least one event for `date`'s weekday.
 * Used to skip the rail's schedule row entirely — TodaysSchedule returns null
 * on an empty day, but the wrapper would still consume flex space.
 */
export function hasScheduleToday(config: TenantConfig | null, date: Date = new Date()): boolean {
  if (!config) return false;
  return (config.weeklySchedule?.[dayKeyFor(date)]?.length ?? 0) > 0;
}
