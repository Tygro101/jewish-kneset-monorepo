import type { TimeResponse } from '@shared/models/times';
import type { ZmanimCount } from '@shared/core/display/zmanim-count';

/**
 * Longest display name allowed before falling back to `shortName`, per mode.
 * 6-card cards are ~1/3 the width of 4-card cards, so the limit is tighter.
 * Every value in `shortNameConfiguration` is <= 12 chars, so both limits are
 * always satisfiable — no third "extra short" name map is needed.
 */
export const ZMAN_NAME_MAX_CHARS: Record<ZmanimCount, number> = { 4: 14, 6: 12 };

export interface ZmanNameOptions {
  /** True when the card also renders a secondary time (מ"א + גר"א on one card). */
  paired: boolean;
  count: ZmanimCount;
}

/**
 * Picks the label for a zman card.
 *
 * `generalName` is the PAIR label ('סוף זמן ק"ש') and is only correct when the
 * card shows both the מ"א and the גר"א time. On its own card the specific
 * `name` ('ס"ז ק"ש מ"א') must be used, otherwise two neighbouring cards would
 * carry the same label.
 */
export function resolveZmanName(
  timeData: Pick<TimeResponse, 'name' | 'generalName' | 'shortName'>,
  options: ZmanNameOptions,
): string {
  const preferred =
    (options.paired ? timeData.generalName : '') || timeData.name || timeData.shortName || '';
  const limit = ZMAN_NAME_MAX_CHARS[options.count] ?? 12;
  if (preferred.length <= limit) return preferred;

  const short = timeData.shortName ?? '';
  return short && short.length < preferred.length ? short : preferred;
}
