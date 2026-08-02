import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { refreshConfig } from '../components/store/config/configSlice';
import { getConfigSelector } from '../components/store/config/configSelectors';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Re-fetches the tenant config every 5 minutes (and whenever the device comes
 * back online), so presentations deactivated in the CMS disappear from the
 * display without needing a reload.
 *
 * Failures are non-fatal: `refreshConfig` keeps the previously loaded config,
 * so the clock never blanks.
 */
export function useConfigAutoRefresh(): void {
  const dispatch = useAppDispatch();
  const { tenantId, status } = useAppSelector(getConfigSelector);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!tenantId || status !== 'ready') return;

    const doRefresh = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await dispatch(refreshConfig());
      } finally {
        inFlightRef.current = false;
      }
    };

    const interval = setInterval(doRefresh, POLL_INTERVAL_MS);
    const onOnline = () => { void doRefresh(); };
    window.addEventListener('online', onOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', onOnline);
    };
  }, [tenantId, status, dispatch]);
}
