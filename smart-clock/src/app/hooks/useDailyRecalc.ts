import { useEffect, useRef } from 'react';
import { now } from '../debug/clock';

/**
 * Returns the number of milliseconds from `now` until the next local midnight (00:00:00.000).
 */
function msUntilMidnight(): number {
  const current = now();
  const midnight = new Date(current);
  midnight.setHours(24, 0, 0, 0); // next day 00:00:00
  return midnight.getTime() - current.getTime();
}

/**
 * Calls `recalculate` immediately on mount, at every local midnight,
 * and whenever the document becomes visible after being hidden (e.g., screen wake).
 *
 * This ensures an always-on kiosk shows correct zmanim/titles after day boundaries.
 */
export function useDailyRecalc(recalculate: () => void): void {
  const recalcRef = useRef(recalculate);
  recalcRef.current = recalculate;

  // --- Midnight scheduling ---
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    function scheduleNextMidnight() {
      const delay = msUntilMidnight();
      timerId = setTimeout(() => {
        recalcRef.current();
        // After firing, re-schedule for the *next* midnight.
        // Recomputing the delay each cycle avoids cumulative drift.
        scheduleNextMidnight();
      }, delay);
    }

    // Initial calculation
    recalcRef.current();
    scheduleNextMidnight();

    return () => clearTimeout(timerId);
  }, []);

  // --- Visibility change (safety net for when device wakes/resumes) ---
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        recalcRef.current();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
}
