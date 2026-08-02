import { useEffect, useState } from 'react';
import { parseRoute, type AppRoute } from './routes';

/**
 * Current route, kept in sync with the URL fragment.
 * Hash-based so GitHub Pages needs no rewrite and the Workbox precache
 * (which matches the URL without its fragment) serves index.html offline.
 */
export function useRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseRoute(typeof window === 'undefined' ? '' : window.location.hash),
  );

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
