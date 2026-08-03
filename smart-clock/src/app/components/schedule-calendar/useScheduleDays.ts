import { useMemo } from 'react';
import { buildTimelineDays } from '@shared/core/schedule/timeline-builder';
import type { TenantConfig } from '../store/config/configState';
import type { TimelineDay } from '@shared/core/schedule/schedule.models';

/**
 * Builds the timeline days from the tenant config's weeklySchedule.
 * Re-runs when config or daysAhead changes. The `dayStamp` param forces
 * a recalc at midnight (pass a date string that changes daily).
 */
export function useScheduleDays(
  config: TenantConfig | null,
  daysAhead: number,
  dayStamp: string,
): TimelineDay[] {
  return useMemo(
    () => buildTimelineDays(config?.weeklySchedule ?? {}, daysAhead),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config?.weeklySchedule, daysAhead, dayStamp],
  );
}

/** True if any day in the range has at least one event. */
export function hasScheduleInRange(days: TimelineDay[]): boolean {
  return days.some((d) => d.events.length > 0);
}
