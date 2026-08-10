import { useRef, useEffect } from 'react';
import { useDailyRecalc } from '../../hooks/useDailyRecalc';
import { useFitToScreen } from '../../hooks/useFitToScreen';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { getTimesSelector } from '../store/times/timesSelectors';
import { getTitlesSelector } from '../store/titles/titlesSelectors';
import { getConfigDataSelector } from '../store/config/configSelectors';
import { calculateTimes } from '../store/times/timesSlice';
import { calculateTitles } from '../store/titles/titlesSlice';
import { resolveCity } from '@shared/core/schedule/zmanim-anchors';
import { SettingsMenu } from '../settings/SettingsMenu';
import { DashboardShell } from '../clock-view/DashboardShell';
import { DashboardHeader } from '../clock-view/DashboardHeader';
import { DashboardBody } from '../clock-view/DashboardBody';
import { ScheduleCalendar } from '../schedule-calendar/ScheduleCalendar';
import { resolveDaysAhead } from '../schedule-calendar/resolveDaysAhead';
import { useDeviceDaysAhead } from '../schedule-calendar/useDeviceDaysAhead';
import { now } from '../../debug/clock';
import './TvClockView.scss';

export interface TvClockViewProps {
  /**
   * When provided, replaces the calendar column (left, 65%).
   * Used by the messages rotation step so the dashboard column — and the
   * clock in it — stays visible.
   */
  calendarOverride?: React.ReactNode;
}

/**
 * Landscape (“TV”) dashboard — route '#/tv', default view of electron-container.
 *
 * Layout: RTL two columns —
 *   Right column (col 1, 35%): full portrait dashboard via DashboardShell
 *   Left column (col 2, 65%): calendar timeline (7 days, always visible)
 *
 * Calendar is permanent on TV (not part of the display rotation).
 */
export const TvClockView = ({ calendarOverride }: TvClockViewProps = {}) => {
  const dispatch = useAppDispatch();
  const times = useAppSelector(getTimesSelector);
  const titles = useAppSelector(getTitlesSelector);
  const config = useAppSelector(getConfigDataSelector);
  const rootRef = useRef<HTMLDivElement>(null);
  const city = resolveCity(config?.tenant?.location);

  // Landscape has less vertical slack — tighter fit guard.
  useFitToScreen(rootRef, [times, titles], { floor: 0.7, ceil: 1.15, cssVar: '--fit-scale' });

  useDailyRecalc(() => {
    dispatch(calculateTimes({ date: now(), location: city }));
    dispatch(calculateTitles({ date: now(), location: city }));
  });

  // Recalc when the city changes after config loads.
  const lastCity = useRef<string | null>(null);
  useEffect(() => {
    if (lastCity.current !== null && lastCity.current !== city) {
      dispatch(calculateTimes({ date: now(), location: city }));
      dispatch(calculateTitles({ date: now(), location: city }));
    }
    lastCity.current = city;
  }, [dispatch, city]);

  const deviceDaysAhead = useDeviceDaysAhead('tv');
  const daysAhead = resolveDaysAhead(config, 'tv', deviceDaysAhead);

  return (
    <div className="tv-app" ref={rootRef} data-route="tv">
      {/* Ambient glow */}
      <div className="ambient-glow" />

      {/* Settings gear — inherits tablet position (top-right, full opacity) */}
      <SettingsMenu />

      {/* Dashboard column (right in RTL) — 35% */}
      <aside className="tv-dashboard">
        <DashboardShell>
          <DashboardHeader titles={titles} />
          <DashboardBody titles={titles} times={times} />
        </DashboardShell>
      </aside>

      {/* Calendar column (left in RTL) — 65%, always visible */}
      <main className="tv-calendar">
        {calendarOverride ?? <ScheduleCalendar daysAhead={daysAhead} title="לוח זמנים" />}
      </main>
    </div>
  );
};
