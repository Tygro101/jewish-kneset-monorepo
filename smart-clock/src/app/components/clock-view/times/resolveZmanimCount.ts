import { resolveZmanimCountFor } from '@shared/core/display/zmanim-count';
import type { ZmanimCount } from '@shared/core/display/zmanim-count';
import type { TenantConfig } from '../../store/config/configState';
import type { AppRoute } from '../../../routing/routes';

/**
 * Resolves the effective zmanim card count for a route.
 *
 * Precedence: CMS value → on-screen (device) setting → code default (TV 6, tablet 4).
 * A CMS value wins; 'screen' (or absent) defers to the device's on-screen setting.
 *
 * `deviceValue` comes from the settings slice; see useDeviceZmanimCount().
 */
export function resolveZmanimCount(
  config: TenantConfig | null,
  route: AppRoute,
  deviceValue: unknown,
): ZmanimCount {
  const target = route === 'tv' ? 'tv' : 'tablet';
  return resolveZmanimCountFor(config?.displaySettings?.zmanimCount, deviceValue, target);
}
