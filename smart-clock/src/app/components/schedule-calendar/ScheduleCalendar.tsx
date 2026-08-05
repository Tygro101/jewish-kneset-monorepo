import { useAppSelector } from '../../hooks';
import { getConfigDataSelector } from '../store/config/configSelectors';
import { useRoute } from '../../routing/useRoute';
import { computeWindow } from '@shared/core/schedule/timeline-window';
import { densityForColumns } from './density';
import { resolveDaysAhead } from './resolveDaysAhead';
import { useNowMinutes } from './useNowMinutes';
import { useScheduleDays } from './useScheduleDays';
import { ScheduleTimeline } from './ScheduleTimeline';
import { now } from '../../debug/clock';

export interface ScheduleCalendarProps {
  /** Override the CMS/route-based daysAhead (used by TV to force 7). */
  daysAhead?: number;
  title?: string;
  className?: string;
}

/**
 * Container component: reads the store, builds timeline data, delegates rendering
 * to the pure ScheduleTimeline component. Always renders (even with zero events —
 * shows day headers + hour grid). The tablet rotation in main.tsx gates inclusion
 * on hasAnyWeeklyEvents, so an empty calendar only appears on TV where it's permanent.
 */
export const ScheduleCalendar = ({ daysAhead: daysAheadProp, title, className }: ScheduleCalendarProps) => {
  const config = useAppSelector(getConfigDataSelector);
  const route = useRoute();
  const nowMin = useNowMinutes();

  const effectiveDays = daysAheadProp ?? resolveDaysAhead(config, route);

  // Day stamp: forces useMemo recalc at midnight
  const dayStamp = now().toISOString().slice(0, 10);

  const days = useScheduleDays(config, effectiveDays, dayStamp);

  const window = computeWindow(days, nowMin);
  const density = densityForColumns(days.length);

  return (
    <ScheduleTimeline
      days={days}
      window={window}
      nowMin={nowMin}
      density={density}
      title={title}
      className={className}
    />
  );
};
