import { useAppSelector } from '../../../hooks';
import {
  getZmanimCountTvSelector,
  getZmanimCountTabletSelector,
} from '../../store/settings/settingsSelectors';
import type { AppRoute } from '../../../routing/routes';
import type { ZmanimCount } from '@shared/core/display/zmanim-count';

/** The device-local (on-screen settings) zmanim count for the given route. */
export function useDeviceZmanimCount(route: AppRoute): ZmanimCount {
  const tv = useAppSelector(getZmanimCountTvSelector);
  const tablet = useAppSelector(getZmanimCountTabletSelector);
  return route === 'tv' ? tv : tablet;
}
