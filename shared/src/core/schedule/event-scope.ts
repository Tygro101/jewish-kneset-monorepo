import type { DayContext, DayScope, ScheduleEvent } from './schedule.models';

/**
 * The scope actually in force for an event.
 *
 * `dayScope` wins when present. Otherwise the legacy boolean decides:
 * an explicit `false` means chol-only, anything else (including absent)
 * means the event always shows — exactly the pre-dayScope behaviour.
 */
export function effectiveDayScope(
  event: Pick<ScheduleEvent, 'dayScope' | 'showOnShabbatAndYomTov'>,
): DayScope {
  if (event.dayScope) return event.dayScope;
  return event.showOnShabbatAndYomTov === false ? 'cholOnly' : 'all';
}

/** Decides whether an event should render on a given day. */
export function isEventVisibleOn(
  event: Pick<ScheduleEvent, 'dayScope' | 'showOnShabbatAndYomTov'>,
  ctx: DayContext,
): boolean {
  switch (effectiveDayScope(event)) {
    case 'cholOnly':
      return !ctx.isShabbat && !ctx.isYomTov;
    case 'shabbatYomTov':
      return ctx.isShabbat || ctx.isYomTov;
    case 'yomTovOnly':
      return ctx.isYomTov;
    case 'erevYomTovOnly':
      return ctx.isErevYomTov;
    case 'all':
      return true;
    default:
      // An unknown scope from a newer CMS must not hide an event silently.
      return true;
  }
}
