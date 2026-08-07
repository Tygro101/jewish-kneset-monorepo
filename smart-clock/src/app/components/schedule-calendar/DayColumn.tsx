import { fractionOf } from '@shared/core/schedule/timeline-window';
import { minToLabel } from '@shared/core/schedule/time-utils';
import type { TimelineDay, TimelineWindow } from '@shared/core/schedule/schedule.models';
import type { CalendarDensity } from './density';
import { blockVariantFor } from './density';
import { HourGrid } from './HourGrid';
import { EventBlock } from './EventBlock';
import { NowLine } from './NowLine';

interface DayColumnProps {
  day: TimelineDay;
  window: TimelineWindow;
  nowMin: number | null;
  density: CalendarDensity;
}

/** A single day column in the timeline — header + body (hour grid + event track). */
export const DayColumn = ({ day, window: w, nowMin, density }: DayColumnProps) => {
  const span = w.endMin - w.startMin;

  return (
    <div className={`cal-day ${day.isToday ? 'cal-day--today' : ''}`}>
      {/* Day header */}
      <div className="cal-day-head">
        <div className="cal-day-head-row">
          <span className="cal-day-label">{day.label}</span>
          {day.isToday && nowMin != null && (
            <span className="cal-day-now-pill">{minToLabel(nowMin)}</span>
          )}
        </div>
        <span className="cal-day-sub">{day.sublabel}</span>
      </div>

      {/* Body: 2-track grid — event track + hour-label gutter */}
      <div className="cal-day-body">
        <HourGrid window={w} />
        <div className="cal-track">
          {day.events.map((ev, i) => {
            const topPct = fractionOf(ev.startMin, w) * 100;
            const duration = ev.endMin - ev.startMin;
            const heightPct = (duration / span) * 100;
            // timeline-builder sorts by start and clips each end to the next
            // start, so the next event's start is the exact ceiling this block
            // may grow to. Falls back to the window end for the last event.
            const nextStartMin = day.events[i + 1]?.startMin ?? w.endMin;
            const maxHeightPct = Math.max(
              heightPct,
              Math.min(((nextStartMin - ev.startMin) / span) * 100, 100 - topPct),
            );
            return (
              <EventBlock
                key={ev.id}
                event={ev}
                topPct={topPct}
                heightPct={heightPct}
                maxHeightPct={maxHeightPct}
                variant={blockVariantFor(duration, density)}
                isPast={day.isToday && nowMin != null && ev.endMin < nowMin}
                isCurrent={day.isToday && nowMin != null && ev.startMin <= nowMin && ev.endMin > nowMin}
                density={density}
              />
            );
          })}
          {day.isToday && nowMin != null && fractionOf(nowMin, w) > 0 && (
            <NowLine topPct={fractionOf(nowMin, w) * 100} />
          )}
        </div>
      </div>
    </div>
  );
};
