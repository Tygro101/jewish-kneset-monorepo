import { ClockContainer } from './clock/ClockContainer';
import { IClockTitle } from '@shared/core/services/workers/handlers/models/shared-models';
import { TitlesKeys } from '@shared/core/services/workers/handlers/models/titles-of-aiom';
import { getCalendarHeadline } from './titles/TitlesView';
import { now } from '../../debug/clock';
import type { TitlesState } from '../store/titles/titlesState';

interface DashboardHeaderProps {
  titles: TitlesState;
}

/**
 * Reusable header block: Clock + Hebrew date + calendar headline + Gregorian date + divider.
 * Used by both tablet ClockView and TV dashboard column.
 */
export const DashboardHeader = ({ titles }: DashboardHeaderProps) => {
  const hebrewDate = (titles[TitlesKeys.HebrewDate] as IClockTitle)?.title ?? '';
  const calendarHeadline = getCalendarHeadline(titles);
  const gregorianDate = now().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="header-section">
      <div className="clock-wrapper">
        <ClockContainer />
      </div>
      <div className="date-block">
        <div className="date-hebrew">{hebrewDate}</div>
        {calendarHeadline && (
          <div className="date-calendar">{calendarHeadline}</div>
        )}
        <div className="date-gregorian">{gregorianDate}</div>
      </div>
      <div className="divider" />
    </header>
  );
};
