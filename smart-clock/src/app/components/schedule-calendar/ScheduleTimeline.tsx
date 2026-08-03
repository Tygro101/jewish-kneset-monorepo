import type { TimelineDay, TimelineWindow } from '@shared/core/schedule/schedule.models';
import type { CalendarDensity } from './density';
import { DayColumn } from './DayColumn';
import './ScheduleCalendar.scss';

export interface ScheduleTimelineProps {
  days: TimelineDay[];
  window: TimelineWindow;
  nowMin: number | null;
  density: CalendarDensity;
  title?: string;
  className?: string;
}

/**
 * Pure presentational timeline — renders N day columns side-by-side.
 * No Redux, no hooks other than what React provides for rendering.
 * RTL: rightmost column = today.
 */
export const ScheduleTimeline = ({
  days,
  window: w,
  nowMin,
  density,
  title,
  className,
}: ScheduleTimelineProps) => (
  <div className={`cal-root ${className ?? ''}`} style={{ '--cal-cols': days.length } as React.CSSProperties}>
    {title && (
      <div className="cal-header">
        <span className="cal-title">{title}</span>
        <span className="cal-header-rule" />
      </div>
    )}
    <div className="cal-grid">
      {days.map((day) => (
        <DayColumn key={day.offset} day={day} window={w} nowMin={nowMin} density={density} />
      ))}
    </div>
  </div>
);
