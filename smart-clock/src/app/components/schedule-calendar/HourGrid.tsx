import { hourMarks, fractionOf } from '@shared/core/schedule/timeline-window';
import { minToLabel } from '@shared/core/schedule/time-utils';
import type { TimelineWindow } from '@shared/core/schedule/schedule.models';

interface HourGridProps {
  window: TimelineWindow;
}

/** Renders horizontal hour guide lines spanning the full column width. */
export const HourGrid = ({ window: w }: HourGridProps) => {
  const marks = hourMarks(w);
  return (
    <>
      {marks.map((m) => (
        <div
          key={m}
          className="cal-hour-line"
          style={{ top: `${fractionOf(m, w) * 100}%` }}
        >
          <span className="cal-hour-label">{minToLabel(m)}</span>
        </div>
      ))}
    </>
  );
};
