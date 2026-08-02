import { useRef } from 'react';
import { useDailyRecalc } from '../../hooks/useDailyRecalc';
import { useFitToScreen } from '../../hooks/useFitToScreen';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ClockContainer } from '../clock-view/clock/ClockContainer';
import { TimesContainer } from '../clock-view/times/TimesContainer';
import { TitlesContainer, getCalendarHeadline } from '../clock-view/titles/TitlesView';
import { TodaysSchedule } from '../clock-view/schedule/TodaysSchedule';
import { SettingsMenu } from '../settings/SettingsMenu';
import { getTimesSelector } from '../store/times/timesSelectors';
import { getTitlesSelector } from '../store/titles/titlesSelectors';
import { getConfigDataSelector } from '../store/config/configSelectors';
import { calculateTimes } from '../store/times/timesSlice';
import { calculateTitles } from '../store/titles/titlesSlice';
import { CitiesEnum, IClockTitle } from '@shared/core/services/workers/handlers/models/shared-models';
import { TitlesKeys } from '@shared/core/services/workers/handlers/models/titles-of-aiom';
import { hasScheduleToday } from './hasScheduleToday';
import './TvClockView.scss';

/**
 * Landscape ("TV") dashboard — route '#/tv', default view of electron-container.
 *
 * Reuses every leaf component of the tablet dashboard; only the shell and the
 * typography scale differ. Layout: RTL two columns — rail on the right
 * (clock, dates, titles, today's schedule), zmanim grid on the left.
 */
export const TvClockView = () => {
  const dispatch = useAppDispatch();
  const times = useAppSelector(getTimesSelector);
  const titles = useAppSelector(getTitlesSelector);
  const config = useAppSelector(getConfigDataSelector);
  const rootRef = useRef<HTMLDivElement>(null);

  // Landscape has less vertical slack per band than the tablet stack,
  // so allow one extra shrink step (floor 0.7 vs 0.75).
  useFitToScreen(rootRef, [times, titles], { floor: 0.7, ceil: 1.15 });

  useDailyRecalc(() => {
    dispatch(calculateTimes({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
    dispatch(calculateTitles({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON }));
  });

  const hebrewDate = (titles[TitlesKeys.HebrewDate] as IClockTitle)?.title ?? '';
  const calendarHeadline = getCalendarHeadline(titles);
  const gregorianDate = new Date().toLocaleDateString('he-IL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const showSchedule = hasScheduleToday(config);

  return (
    <div className="tv-app" ref={rootRef} data-route="tv">
      {/* Ambient glow */}
      <div className="ambient-glow" />

      {/* Settings (theme) gear — bottom-left, dimmed */}
      <SettingsMenu />

      {/* Main area — zmanim grid (appears on the LEFT in RTL) */}
      <main className="tv-main">
        <div className="tv-main-header">
          <span className="tv-section-title">זמני היום</span>
          <span className="tv-header-rule" />
        </div>
        <div className="tv-zmanim">
          <TimesContainer times={times} />
        </div>
      </main>

      {/* Rail — clock, dates, titles, schedule (appears on the RIGHT in RTL) */}
      <aside className="tv-rail">
        <div className="tv-clock-block">
          <ClockContainer />
        </div>
        <div className="tv-date-block">
          <div className="tv-date-hebrew">{hebrewDate}</div>
          {calendarHeadline && <div className="tv-date-calendar">{calendarHeadline}</div>}
          <div className="tv-date-gregorian">{gregorianDate}</div>
        </div>

        <div className="tv-rail-divider" />

        {/* Prayer / study info cards, stacked vertically */}
        <div className="tv-titles">
          <TitlesContainer titles={titles} />
        </div>

        {/* Today's schedule — only shown when there are events */}
        {showSchedule && (
          <>
            <div className="tv-rail-divider" />
            <div className="tv-schedule">
              <TodaysSchedule />
            </div>
          </>
        )}
      </aside>
    </div>
  );
};
