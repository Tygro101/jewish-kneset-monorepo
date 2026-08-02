import { useCallback, useSyncExternalStore } from 'react'

/**
 * Reads the current route from the URL hash.
 * Always returns a path with a leading slash. '#' or '' becomes '/'.
 */
export function getCurrentRoute(): string {
  const raw = window.location.hash.slice(1)
  return raw === '' ? '/' : raw
}

/** Subscribe to every event that can change the hash. */
function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('hashchange', onStoreChange)
  window.addEventListener('popstate', onStoreChange)
  return () => {
    window.removeEventListener('hashchange', onStoreChange)
    window.removeEventListener('popstate', onStoreChange)
  }
}

export interface NavigateOptions {
  /** Replace the current history entry instead of pushing a new one. */
  replace?: boolean
}

/**
 * Hash-based router for GitHub Pages (no SPA fallback available).
 * Routes are in format: #/path
 *
 * Uses useSyncExternalStore, so the route is re-read from window.location on
 * every render and immediately after subscribing. A hashchange event fired
 * before the listener was attached can no longer be lost.
 * (Previous bug: blank screen after refresh on #/admin/*.)
 */
export function useHashRoute(): [string, (to: string, options?: NavigateOptions) => void] {
  const route = useSyncExternalStore(subscribe, getCurrentRoute, () => '/')

  const navigate = useCallback((to: string, options?: NavigateOptions) => {
    const target = to.startsWith('/') ? to : `/${to}`
    if (getCurrentRoute() === target) return

    if (options?.replace) {
      const url = `${window.location.pathname}${window.location.search}#${target}`
      window.history.replaceState(null, '', url)
      // replaceState does not fire hashchange — notify subscribers manually.
      window.dispatchEvent(new Event('hashchange'))
      return
    }

    window.location.hash = target
  }, [])

  return [route, navigate]
}

/**
 * Parse route segments.
 * Example: '/admin/schedule' → ['admin', 'schedule']
 */
export function parseRoute(route: string): string[] {
  return route.split('/').filter(Boolean)
}
