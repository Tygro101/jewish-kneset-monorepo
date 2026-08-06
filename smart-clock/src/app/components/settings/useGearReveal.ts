import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppRoute } from '../../routing/routes';
import { GEAR_REVEAL_MS, isRevealGesture } from './gearReveal';

export interface UseGearRevealOptions {
  /** Current app route — determines hotspot trigger type. */
  route: AppRoute;
  /** When true the auto-hide timer is paused (e.g. dialog is open). */
  paused: boolean;
}

export interface UseGearRevealResult {
  /** Whether the gear icon should be visible right now. */
  visible: boolean;
  /** Call to reveal the gear and (re)start the 20 s auto-hide timer. */
  reveal: () => void;
}

/**
 * Manages gear-icon visibility state with a 20 s auto-hide timer and
 * a document-level 3-finger touch reveal listener.
 */
export function useGearReveal({ route, paused }: UseGearRevealOptions): UseGearRevealResult {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track paused to avoid stale closure in the timer callback.
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!pausedRef.current) {
        setVisible(false);
      }
    }, GEAR_REVEAL_MS);
  }, [clearTimer]);

  const reveal = useCallback(() => {
    setVisible(true);
    if (!pausedRef.current) {
      startTimer();
    }
  }, [startTimer]);

  // Pause / unpause effect: clear timer while paused, restart when unpaused.
  useEffect(() => {
    if (paused) {
      clearTimer();
    } else if (visible) {
      // Unpaused while visible — start a fresh 20 s window.
      startTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // 3-finger touch reveal — works on both routes, fires even when overlays are up.
  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (isRevealGesture(e.touches.length)) {
        reveal();
      }
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    return () => document.removeEventListener('touchstart', onTouchStart);
  }, [reveal]);

  // Cleanup on unmount.
  useEffect(() => clearTimer, [clearTimer]);

  return { visible, reveal };
}
