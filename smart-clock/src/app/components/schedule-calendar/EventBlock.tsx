import { minToLabel } from '@shared/core/schedule/time-utils';
import type { TimelineEvent } from '@shared/core/schedule/schedule.models';
import type { BlockVariant, CalendarDensity } from './density';
import { pillsInlineFor } from './density';
import { TimePill } from './TimePill';

interface EventBlockProps {
  event: TimelineEvent;
  topPct: number;
  /** Duration-proportional size — applied as min-height, not a fixed height. */
  heightPct: number;
  /** Room until the next event starts — applied as max-height so blocks never overlap. */
  maxHeightPct: number;
  variant: BlockVariant;
  isPast: boolean;
  isCurrent: boolean;
  density: CalendarDensity;
}

/** A single event block positioned absolutely inside the day track. */
export const EventBlock = ({
  event,
  topPct,
  heightPct,
  maxHeightPct,
  variant,
  isPast,
  isCurrent,
  density,
}: EventBlockProps) => {
  const showEndPill = density !== 'minimal' && variant !== 'tight';
  const inlinePills = showEndPill && pillsInlineFor(event.endMin - event.startMin);

  const cls = [
    'cal-block',
    `cal-block--${event.type}`,
    isPast ? 'cal-block--past' : '',
    isCurrent ? 'cal-block--current' : '',
    inlinePills ? 'cal-block--pills-inline' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cls}
      style={{
        top: `${topPct}%`,
        minHeight: `${heightPct}%`,
        maxHeight: `${maxHeightPct}%`,
      }}
    >
      {/* Time pills — stacked vertically, or inline on short blocks */}
      <div className="cal-block-pills">
        <TimePill time={minToLabel(event.startMin)} />
        {showEndPill && <TimePill time={minToLabel(event.endMin)} faded />}
      </div>

      {/* Text content — beside the pills, wraps up to 5 lines */}
      <div className="cal-block-text">
        <div className="cal-block-title">{event.title}</div>
        {variant === 'full' && event.subtitle && (
          <div className="cal-block-subtitle">{event.subtitle}</div>
        )}
      </div>

      {/* "עכשיו" badge */}
      {isCurrent && (
        <div className="cal-block-badge">
          <span className="cal-block-badge-dot" />
          <span className="cal-block-badge-text">עכשיו</span>
        </div>
      )}
    </div>
  );
};
