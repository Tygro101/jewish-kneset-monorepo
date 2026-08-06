import { resolveDaysAheadFor } from '@shared/core/schedule/days-ahead';
import type { TenantConfig } from '../store/config/configState';
import type { AppRoute } from '../../routing/routes';

/**
 * Resolves the effective daysAhead (= number of calendar columns) for a route.
 *
 * Precedence: CMS number → on-screen (device) setting → code default (TV 6, tablet 2).
 * Always clamped to 1–7 on TV and 1–3 on tablet.
 *
 * `deviceDaysAhead` comes from the settings slice; see useDeviceDaysAhead().
 */
export function resolveDaysAhead(
  config: TenantConfig | null,
  route: AppRoute,
  deviceDaysAhead?: number,
): number {
  return resolveDaysAheadFor(config?.displaySettings?.scheduleDaysAhead, deviceDaysAhead, route);
}
