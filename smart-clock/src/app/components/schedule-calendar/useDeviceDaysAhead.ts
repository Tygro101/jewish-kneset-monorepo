import { useAppSelector } from '../../hooks';
import {
  getScheduleDaysAheadTabletSelector,
  getScheduleDaysAheadTvSelector,
} from '../store/settings/settingsSelectors';
import type { AppRoute } from '../../routing/routes';

/** The device-local (on-screen settings) day count for the given route. */
export function useDeviceDaysAhead(route: AppRoute): number {
  const tv = useAppSelector(getScheduleDaysAheadTvSelector);
  const tablet = useAppSelector(getScheduleDaysAheadTabletSelector);
  return route === 'tv' ? tv : tablet;
}
