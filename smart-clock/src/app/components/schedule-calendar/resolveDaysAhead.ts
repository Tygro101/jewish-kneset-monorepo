import { clampDaysAhead } from '@shared/core/schedule/timeline-builder';
import type { TenantConfig } from '../store/config/configState';
import type { AppRoute } from '../../routing/routes';

const TV_DEFAULT = 7;
const TABLET_DEFAULT = 2;

/**
 * Resolves the effective daysAhead value.
 * CMS value (displaySettings.scheduleDaysAhead) takes priority when valid;
 * otherwise falls back to 7 for TV, 2 for tablet.
 */
export function resolveDaysAhead(config: TenantConfig | null, route: AppRoute): number {
  const fallback = route === 'tv' ? TV_DEFAULT : TABLET_DEFAULT;
  return clampDaysAhead(config?.displaySettings?.scheduleDaysAhead, fallback);
}
