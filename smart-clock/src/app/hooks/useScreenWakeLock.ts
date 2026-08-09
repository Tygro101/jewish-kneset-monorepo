import { useEffect } from 'react';

/** Minimal shape of the WakeLockSentinel we rely on. */
interface WakeLockSentinelLike {
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
  removeEventListener(type: 'release', listener: () => void): void;
}

interface WakeLockLike {
  request(type: 'screen'): Promise<WakeLockSentinelLike>;
}

function getWakeLock(): WakeLockLike | undefined {
  return (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock;
}

/**
 * Holds a Screen Wake Lock for as long as the component is mounted, so an
 * always-on wall display never blanks.
 *
 * The browser releases the sentinel every time the document is hidden, so we
 * re-acquire on `visibilitychange` and on the sentinel's own `release` event.
 * Unsupported browsers are a silent no-op.
 *
 * Call this ONCE, from the app root — not per view.
 */
export function useScreenWakeLock(): void {
  useEffect(() => {
    const wakeLock = getWakeLock();
    if (!wakeLock) return; // Not supported — nothing to do.

    let cancelled = false;
    let sentinel: WakeLockSentinelLike | null = null;
    let warned = false;

    const onRelease = (): void => {
      sentinel = null;
      if (!cancelled && document.visibilityState === 'visible') void acquire();
    };

    const acquire = async (): Promise<void> => {
      if (cancelled || sentinel) return;
      // A request while hidden always rejects; wait for visibilitychange instead.
      if (document.visibilityState !== 'visible') return;
      try {
        const next = await wakeLock.request('screen');
        if (cancelled) {
          void next.release().catch((): undefined => undefined);
          return;
        }
        sentinel = next;
        next.addEventListener('release', onRelease);
      } catch (error) {
        // Warn once, not on every retry, so the console stays usable.
        if (!warned) {
          warned = true;
          console.warn('[WakeLock] Could not acquire screen wake lock:', error);
        }
      }
    };

    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (sentinel) {
        // Remove the listener first so releasing does not trigger a re-acquire.
        sentinel.removeEventListener('release', onRelease);
        void sentinel.release().catch((): undefined => undefined);
        sentinel = null;
      }
    };
  }, []);
}
