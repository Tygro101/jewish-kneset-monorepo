/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDisplayRotation, resolveSlideDurationMs } from './useDisplayRotation';
import type { TenantConfig, ScheduleEvent, Presentation } from '../../store/config/configState';

// localStorage mock (needed by configSlice indirect import)
const storeMock: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn((key: string) => storeMock[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { storeMock[key] = value; }),
    removeItem: vi.fn((key: string) => { delete storeMock[key]; }),
    clear: vi.fn(() => { Object.keys(storeMock).forEach((k) => delete storeMock[k]); }),
    get length() { return Object.keys(storeMock).length; },
    key: vi.fn((i: number) => Object.keys(storeMock)[i] ?? null),
  },
  writable: true,
});

const PRES_A: Presentation = { title: 'Announcements', file: 'presentations/ann.pdf', type: 'pdf' };
const PRES_B: Presentation = { title: 'Halacha', file: 'presentations/halacha.jpg', type: 'image' };
const PRES_C: Presentation = { title: 'Shiur', file: 'presentations/shiur.png', type: 'image' };

function makeConfig(overrides: Partial<TenantConfig> = {}): TenantConfig {
  return {
    tenant: { id: 'test', displayName: 'Test' },
    displaySettings: { mainDashboardDurationSeconds: 10, presentationDurationSeconds: 5 },
    weeklySchedule: {
      sunday: [] as ScheduleEvent[], monday: [] as ScheduleEvent[],
      tuesday: [] as ScheduleEvent[], wednesday: [] as ScheduleEvent[],
      thursday: [] as ScheduleEvent[], friday: [] as ScheduleEvent[],
      shabbat: [] as ScheduleEvent[],
    },
    activePresentations: [PRES_A, PRES_B],
    ...overrides,
  };
}

/** Config identical to `base` except for the presentations list. */
function withPresentations(base: TenantConfig, activePresentations: Presentation[]): TenantConfig {
  return { ...base, activePresentations };
}

describe('useDisplayRotation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays on dashboard when config is null', () => {
    const { result } = renderHook(() => useDisplayRotation(null));
    expect(result.current).toEqual({ kind: 'dashboard' });

    act(() => { vi.advanceTimersByTime(300_000); });
    expect(result.current).toEqual({ kind: 'dashboard' });
  });

  it('stays on dashboard when no active presentations', () => {
    const config = makeConfig({ activePresentations: [] });
    const { result } = renderHook(() => useDisplayRotation(config));
    expect(result.current).toEqual({ kind: 'dashboard' });

    act(() => { vi.advanceTimersByTime(60_000); });
    expect(result.current).toEqual({ kind: 'dashboard' });
  });

  it('starts on dashboard', () => {
    const { result } = renderHook(() => useDisplayRotation(makeConfig()));
    expect(result.current).toEqual({ kind: 'dashboard' });
  });

  it('cycles to the first presentation after the dashboard duration', () => {
    const { result } = renderHook(() => useDisplayRotation(makeConfig()));

    act(() => { vi.advanceTimersByTime(10_000); });
    expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });
  });

  it('cycles through all presentations then back to dashboard', () => {
    const { result } = renderHook(() => useDisplayRotation(makeConfig()));

    act(() => { vi.advanceTimersByTime(10_000); });
    expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });

    act(() => { vi.advanceTimersByTime(5_000); });
    expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_B });

    act(() => { vi.advanceTimersByTime(5_000); });
    expect(result.current).toEqual({ kind: 'dashboard' });
  });

  it('repeats the full cycle', () => {
    const { result } = renderHook(() => useDisplayRotation(makeConfig()));

    // 10 + 5 + 5 = 20s → back to dashboard
    act(() => { vi.advanceTimersByTime(20_000); });
    expect(result.current).toEqual({ kind: 'dashboard' });

    act(() => { vi.advanceTimersByTime(10_000); });
    expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });
  });

  it('cleans up timers on unmount', () => {
    const { unmount } = renderHook(() => useDisplayRotation(makeConfig()));

    unmount();
    // Advancing timers after unmount should not throw or update state
    act(() => { vi.advanceTimersByTime(60_000); });
  });

  it('returns the presentation object, never an index', () => {
    const { result } = renderHook(() => useDisplayRotation(makeConfig()));

    act(() => { vi.advanceTimersByTime(10_000); });
    expect(result.current).not.toHaveProperty('index');
    if (result.current.kind !== 'presentation') throw new Error('expected a presentation');
    expect(result.current.presentation.file).toBe(PRES_A.file);
  });

  describe('config changes mid-cycle', () => {
    it('lets a removed slide finish its turn, then skips it', () => {
      const config = makeConfig(); // [A, B]
      const { result, rerender } = renderHook(
        ({ cfg }) => useDisplayRotation(cfg),
        { initialProps: { cfg: config } },
      );

      // Dashboard → A
      act(() => { vi.advanceTimersByTime(10_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });

      // A is deactivated in the CMS while it is on screen.
      rerender({ cfg: withPresentations(config, [PRES_B]) });
      // It finishes its turn rather than blanking mid-slide.
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });
      act(() => { vi.advanceTimersByTime(4_999); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });

      // At the boundary the cycle is recomputed from the new list — A is gone.
      act(() => { vi.advanceTimersByTime(1); });
      expect(result.current).toEqual({ kind: 'dashboard' });

      // From here on only B is ever shown.
      act(() => { vi.advanceTimersByTime(10_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_B });
      act(() => { vi.advanceTimersByTime(5_000); });
      expect(result.current).toEqual({ kind: 'dashboard' });
      act(() => { vi.advanceTimersByTime(10_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_B });
    });

    it('never shows a removed slide again in later cycles', () => {
      const config = makeConfig(); // [A, B]
      const { result, rerender } = renderHook(
        ({ cfg }) => useDisplayRotation(cfg),
        { initialProps: { cfg: config } },
      );

      rerender({ cfg: withPresentations(config, [PRES_A]) }); // B deactivated

      const seen: string[] = [];
      // Three full cycles of (10s dashboard + 5s slide)
      for (let i = 0; i < 6; i++) {
        act(() => { vi.advanceTimersByTime(i % 2 === 0 ? 10_000 : 5_000); });
        if (result.current.kind === 'presentation') seen.push(result.current.presentation.title);
      }

      expect(seen).not.toContain(PRES_B.title);
      expect(seen).toContain(PRES_A.title);
    });

    it('finishes the current slide then stays on dashboard when the list empties', () => {
      const config = makeConfig(); // [A, B]
      const { result, rerender } = renderHook(
        ({ cfg }) => useDisplayRotation(cfg),
        { initialProps: { cfg: config } },
      );

      act(() => { vi.advanceTimersByTime(10_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });

      // Everything deactivated while A is on screen.
      rerender({ cfg: withPresentations(config, []) });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });

      // A finishes its turn…
      act(() => { vi.advanceTimersByTime(5_000); });
      expect(result.current).toEqual({ kind: 'dashboard' });

      // …and the dashboard stays put indefinitely.
      act(() => { vi.advanceTimersByTime(300_000); });
      expect(result.current).toEqual({ kind: 'dashboard' });
    });

    it('resumes rotation when presentations are added back after emptying', () => {
      const config = makeConfig();
      const { result, rerender } = renderHook(
        ({ cfg }) => useDisplayRotation(cfg),
        { initialProps: { cfg: withPresentations(config, []) } },
      );

      act(() => { vi.advanceTimersByTime(60_000); });
      expect(result.current).toEqual({ kind: 'dashboard' });

      rerender({ cfg: withPresentations(config, [PRES_C]) });

      // Next dashboard boundary picks up the new list.
      act(() => { vi.advanceTimersByTime(10_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_C });
    });

    it('includes a newly added slide in a subsequent cycle', () => {
      const config = withPresentations(makeConfig(), [PRES_A]);
      const { result, rerender } = renderHook(
        ({ cfg }) => useDisplayRotation(cfg),
        { initialProps: { cfg: config } },
      );

      act(() => { vi.advanceTimersByTime(10_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });

      // C is activated in the CMS.
      rerender({ cfg: withPresentations(config, [PRES_A, PRES_C]) });

      const seen: string[] = [];
      // Two full cycles at the new length: (10 + 5 + 5) twice
      for (const ms of [5_000, 10_000, 5_000, 5_000, 10_000, 5_000, 5_000]) {
        act(() => { vi.advanceTimersByTime(ms); });
        if (result.current.kind === 'presentation') seen.push(result.current.presentation.title);
      }

      expect(seen).toContain(PRES_C.title);
      expect(seen).toContain(PRES_A.title);
    });

    it('picks up changed durations at the next boundary', () => {
      const config = withPresentations(makeConfig(), [PRES_A]);
      const { result, rerender } = renderHook(
        ({ cfg }) => useDisplayRotation(cfg),
        { initialProps: { cfg: config } },
      );

      act(() => { vi.advanceTimersByTime(10_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });

      rerender({
        cfg: {
          ...config,
          displaySettings: { mainDashboardDurationSeconds: 2, presentationDurationSeconds: 5 },
        },
      });

      // A finishes at its original 5s, then the shorter dashboard applies.
      act(() => { vi.advanceTimersByTime(5_000); });
      expect(result.current).toEqual({ kind: 'dashboard' });
      act(() => { vi.advanceTimersByTime(2_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });
    });

    it('starts rotating once the config finishes loading', () => {
      const config = makeConfig();
      const { result, rerender } = renderHook(
        ({ cfg }) => useDisplayRotation(cfg),
        { initialProps: { cfg: null as TenantConfig | null } },
      );

      expect(result.current).toEqual({ kind: 'dashboard' });

      rerender({ cfg: config });
      expect(result.current).toEqual({ kind: 'dashboard' });

      act(() => { vi.advanceTimersByTime(10_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });
    });
  });

  describe('per-slide durationSeconds', () => {
    it('uses the slide override for one slide and the global default for another', () => {
      const first: Presentation = { ...PRES_A, durationSeconds: 10 };
      const config = makeConfig({
        displaySettings: { mainDashboardDurationSeconds: 30, presentationDurationSeconds: 20 },
        activePresentations: [first, PRES_B],
      });
      const { result } = renderHook(() => useDisplayRotation(config));

      // Dashboard runs its 30s.
      act(() => { vi.advanceTimersByTime(29_999); });
      expect(result.current).toEqual({ kind: 'dashboard' });
      act(() => { vi.advanceTimersByTime(1); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: first });

      // First slide honours its own 10s, not the global 20s.
      act(() => { vi.advanceTimersByTime(9_999); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: first });
      act(() => { vi.advanceTimersByTime(1); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_B });

      // Second slide has no override → global 20s.
      act(() => { vi.advanceTimersByTime(19_999); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_B });
      act(() => { vi.advanceTimersByTime(1); });
      expect(result.current).toEqual({ kind: 'dashboard' });
    });

    it('applies a duration added mid-rotation only from the next cycle', () => {
      const base = makeConfig({
        displaySettings: { mainDashboardDurationSeconds: 30, presentationDurationSeconds: 20 },
        activePresentations: [PRES_A],
      });
      const { result, rerender } = renderHook(
        ({ cfg }) => useDisplayRotation(cfg),
        { initialProps: { cfg: base } },
      );

      act(() => { vi.advanceTimersByTime(30_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });

      // CMS adds a shorter per-slide duration while the slide is on screen.
      const fasterA: Presentation = { ...PRES_A, durationSeconds: 10 };
      rerender({ cfg: withPresentations(base, [fasterA]) });

      // The current turn still runs out the 20s it was scheduled with, and keeps
      // showing the object captured at the boundary (no durationSeconds yet).
      act(() => { vi.advanceTimersByTime(10_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });
      act(() => { vi.advanceTimersByTime(9_999); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: PRES_A });
      act(() => { vi.advanceTimersByTime(1); });
      expect(result.current).toEqual({ kind: 'dashboard' });

      // Next cycle picks up the 10s override.
      act(() => { vi.advanceTimersByTime(30_000); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: fasterA });
      act(() => { vi.advanceTimersByTime(9_999); });
      expect(result.current).toEqual({ kind: 'presentation', presentation: fasterA });
      act(() => { vi.advanceTimersByTime(1); });
      expect(result.current).toEqual({ kind: 'dashboard' });
    });
  });
});

describe('resolveSlideDurationMs', () => {
  const slide = (durationSeconds?: number): Presentation =>
    durationSeconds === undefined ? { ...PRES_A } : { ...PRES_A, durationSeconds };

  it('honours a valid per-slide override', () => {
    expect(resolveSlideDurationMs(slide(30), 20)).toBe(30_000);
  });

  it('falls back to the global default when absent', () => {
    expect(resolveSlideDurationMs(slide(), 20)).toBe(20_000);
  });

  it('falls back for zero', () => {
    expect(resolveSlideDurationMs(slide(0), 20)).toBe(20_000);
  });

  it('falls back for a negative value', () => {
    expect(resolveSlideDurationMs(slide(-10), 20)).toBe(20_000);
  });

  it('falls back for NaN', () => {
    expect(resolveSlideDurationMs(slide(NaN), 20)).toBe(20_000);
  });

  it('falls back for Infinity', () => {
    expect(resolveSlideDurationMs(slide(Infinity), 20)).toBe(20_000);
  });

  it('falls back for a non-number', () => {
    const bad: Presentation = { ...PRES_A, durationSeconds: '30' as unknown as number };
    expect(resolveSlideDurationMs(bad, 20)).toBe(20_000);
  });

  it('clamps up to the minimum', () => {
    expect(resolveSlideDurationMs(slide(2), 20)).toBe(5_000);
  });

  it('clamps down to the maximum', () => {
    expect(resolveSlideDurationMs(slide(9999), 20)).toBe(300_000);
  });
});
