import { useState, useEffect, useRef, useCallback } from 'react';
import type { TenantConfig } from '../../store/config/configState';

export type DisplayView =
  | { kind: 'dashboard' }
  | { kind: 'presentation'; index: number };

/**
 * Cycles between the main dashboard view and each active presentation.
 *
 * Sequence: dashboard (N seconds) → presentation[0] (M seconds) → … → presentation[last] → dashboard → …
 *
 * If there are no active presentations, stays permanently on 'dashboard'.
 *
 * @param config The tenant config (null = not loaded yet, stays on dashboard).
 * @returns The current DisplayView.
 */
export function useDisplayRotation(config: TenantConfig | null): DisplayView {
  const [view, setView] = useState<DisplayView>({ kind: 'dashboard' });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any running timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!config) {
      setView({ kind: 'dashboard' });
      return;
    }

    const { mainDashboardDurationSeconds, presentationDurationSeconds } = config.displaySettings;
    const presentations = config.activePresentations;

    if (presentations.length === 0) {
      setView({ kind: 'dashboard' });
      return;
    }

    // Total steps: 1 (dashboard) + presentations.length
    const totalSteps = presentations.length + 1;
    let step = 0; // 0 = dashboard, 1..N = presentations[step-1]

    function getViewForStep(s: number): DisplayView {
      return s === 0 ? { kind: 'dashboard' } : { kind: 'presentation', index: s - 1 };
    }

    function getDurationForStep(s: number): number {
      return (s === 0 ? mainDashboardDurationSeconds : presentationDurationSeconds) * 1000;
    }

    // Start the cycle
    setView(getViewForStep(step));

    function scheduleNext() {
      const delay = getDurationForStep(step);
      timerRef.current = setTimeout(() => {
        step = (step + 1) % totalSteps;
        setView(getViewForStep(step));
        scheduleNext();
      }, delay);
    }

    scheduleNext();

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [config]);

  return view;
}
