import { useAppSelector } from '../../../hooks';
import { getConfigDataSelector } from '../../store/config/configSelectors';
import type { ScheduleEvent } from '../../store/config/configState';
import { dayKeyFor, DAY_LABELS } from './dayKey';
import './TodaysSchedule.scss';

/** Icon per event type. */
const TYPE_ICONS: Record<ScheduleEvent['type'], string> = {
  tefilla: '🕊️',
  shiur: '📖',
  event: '🎉',
};

/**
 * Renders today's schedule events from the tenant config.
 * Sorted chronologically by time string (HH:mm).
 */
export const TodaysSchedule = () => {
  const config = useAppSelector(getConfigDataSelector);
  if (!config) return null;

  const today = dayKeyFor();
  const events = [...(config.weeklySchedule[today] || [])].sort((a, b) =>
    a.time.localeCompare(b.time),
  );

  if (events.length === 0) return null;

  return (
    <div className="schedule-panel">
      <div className="schedule-header">
        <span className="schedule-title">לוח זמנים — {DAY_LABELS[today]}</span>
      </div>
      <ul className="schedule-list">
        {events.map((ev, i) => (
          <li key={`${ev.time}-${i}`} className={`schedule-item schedule-item--${ev.type}`}>
            <span className="schedule-icon">{TYPE_ICONS[ev.type]}</span>
            <span className="schedule-time">{ev.time}</span>
            <span className="schedule-event-title">{ev.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
