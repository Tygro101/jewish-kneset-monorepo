import { useState, useEffect, useRef } from 'react';
import type { Presentation, DisplayMessage, TenantConfig } from '../../store/config/configState';

export type DisplayView =
  | { kind: 'dashboard' }
  | { kind: 'presentation'; presentation: Presentation }
  | { kind: 'messages'; messages: DisplayMessage[] };

/** Fallbacks used when displaySettings carries a missing/invalid duration. */
const DEFAULT_DASHBOARD_SECONDS = 60;
const DEFAULT_PRESENTATION_SECONDS = 20;

function seconds(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Bounds applied to a per-slide `durationSeconds` coming from the CMS. */
const MIN_SLIDE_SECONDS = 5;
const MAX_SLIDE_SECONDS = 300;

/**
 * Core duration rule, shared by presentation slides and text messages.
 * Falls back to the global default when the per-item value is missing or invalid,
 * and clamps a valid value so a CMS typo cannot freeze a wall display.
 */
export function resolveDurationMs(
  durationSeconds: number | undefined,
  defaultSeconds: number,
): number {
  if (
    typeof durationSeconds !== 'number' ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return defaultSeconds * 1000;
  }
  const clamped = Math.max(
    MIN_SLIDE_SECONDS,
    Math.min(MAX_SLIDE_SECONDS, Math.round(durationSeconds)),
  );
  return clamped * 1000;
}

/**
 * Resolves how long a slide should be shown.
 * Falls back to the global default when the per-slide value is missing or invalid.
 */
export function resolveSlideDurationMs(
  presentation: Presentation,
  defaultSeconds: number,
): number {
  return resolveDurationMs(presentation.durationSeconds, defaultSeconds);
}

/**
 * Cycles between the main dashboard view and each active presentation.
 *
 * Sequence: dashboard (N seconds) → presentation[0] (M seconds) → … → last → dashboard → …
 *
 * Config changes are absorbed without restarting the cycle: the latest config is
 * kept in a ref and read at every step boundary, so
 * - a presentation removed mid-cycle finishes its current turn and is then skipped;
 * - if the list becomes empty, the current step finishes and the display settles
 *   on the dashboard (and resumes automatically if presentations come back);
 * - newly added presentations join on the next cycle.
 *
 * The returned view carries the `Presentation` object itself rather than an index,
 * so a shrinking list can never produce an out-of-range lookup.
 *
 * @param config The tenant config (null = not loaded yet, stays on dashboard).
 */
export function useDisplayRotation(config: TenantConfig | null): DisplayView {
  const [view, setView] = useState<DisplayView>({ kind: 'dashboard' });

  // Latest config, readable from inside timer callbacks without re-running the effect.
  const configRef = useRef<TenantConfig | null>(config);
  configRef.current = config;

  // Position in the cycle: 0 = dashboard, 1..N = the Nth presentation of the
  // list as it stood when the step began.
  const stepRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restart the loop only when config appears/disappears entirely; ordinary
  // content changes are picked up from the ref at the next step boundary.
  const hasConfig = config !== null;

  useEffect(() => {
    let cancelled = false;

    /** Resolves the view for a step against the *current* presentations list. */
    function viewForStep(step: number): DisplayView {
      const presentations = configRef.current?.activePresentations ?? [];
      const messages = configRef.current?.activeMessages ?? [];

      if (step === 0) return { kind: 'dashboard' };

      if (step <= presentations.length) {
        const presentation = presentations[step - 1];
        if (!presentation) return { kind: 'dashboard' };
        return { kind: 'presentation', presentation };
      }

      if (messages.length > 0 && step === presentations.length + 1) {
        return { kind: 'messages', messages };
      }

      return { kind: 'dashboard' };
    }

    /**
     * Duration of a step, resolved against the *current* config.
     *
     * A presentation step prefers the slide's own `durationSeconds`; both the
     * slide and the global default are read from the ref at the step boundary,
     * exactly like the presentations list above.
     */
    function durationMsForStep(step: number): number {
      const settings = configRef.current?.displaySettings;
      const presentations = configRef.current?.activePresentations ?? [];
      const messages = configRef.current?.activeMessages ?? [];

      if (step === 0) {
        return seconds(settings?.mainDashboardDurationSeconds, DEFAULT_DASHBOARD_SECONDS) * 1000;
      }

      const presentationDurationSeconds = seconds(
        settings?.presentationDurationSeconds,
        DEFAULT_PRESENTATION_SECONDS,
      );

      if (step <= presentations.length) {
        const currentPresentation = presentations[step - 1];
        if (!currentPresentation) return presentationDurationSeconds * 1000;
        return resolveSlideDurationMs(currentPresentation, presentationDurationSeconds);
      }

      if (messages.length > 0 && step === presentations.length + 1) {
        return messages.reduce(
          (total, message) =>
            total + resolveDurationMs(message.durationSeconds, presentationDurationSeconds),
          0,
        );
      }

      return presentationDurationSeconds * 1000;
    }

    /** Total steps against the current config: dashboard + presentations + messages. */
    function totalSteps(): number {
      const presentations = configRef.current?.activePresentations?.length ?? 0;
      const hasMessages = (configRef.current?.activeMessages?.length ?? 0) > 0;
      return 1 + presentations + (hasMessages ? 1 : 0);
    }

    function scheduleNext() {
      const delay = durationMsForStep(stepRef.current);
      timerRef.current = setTimeout(() => {
        if (cancelled) return;
        // Read the list fresh at the boundary so removals/additions take effect now.
        stepRef.current = (stepRef.current + 1) % totalSteps();
        setView(viewForStep(stepRef.current));
        scheduleNext();
      }, delay);
    }

    // Every (re)start of the loop begins at the dashboard.
    stepRef.current = 0;
    setView({ kind: 'dashboard' });
    scheduleNext();

    return () => {
      cancelled = true;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hasConfig]);

  return view;
}
