/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDisplayRotation } from './useDisplayRotation';
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
    activePresentations: [
      { title: 'Announcements', file: '/presentations/ann.pdf', type: 'pdf' },
      { title: 'Halacha', file: '/presentations/halacha.jpg', type: 'image' },
    ] as Presentation[],
    ...overrides,
  };
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
  });

  it('stays on dashboard when no active presentations', () => {
    const config = makeConfig({ activePresentations: [] as Presentation[] });
    const { result } = renderHook(() => useDisplayRotation(config));
    expect(result.current).toEqual({ kind: 'dashboard' });

    act(() => { vi.advanceTimersByTime(60_000); });
    expect(result.current).toEqual({ kind: 'dashboard' });
  });

  it('starts on dashboard', () => {
    const config = makeConfig();
    const { result } = renderHook(() => useDisplayRotation(config));
    expect(result.current).toEqual({ kind: 'dashboard' });
  });

  it('cycles to first presentation after dashboard duration', () => {
    const config = makeConfig(); // 10s dashboard, 5s per presentation
    const { result } = renderHook(() => useDisplayRotation(config));

    // After 10s (dashboard duration), should switch to presentation 0
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(result.current).toEqual({ kind: 'presentation', index: 0 });
  });

  it('cycles through all presentations then back to dashboard', () => {
    const config = makeConfig(); // 10s dashboard, 5s per pres, 2 presentations
    const { result } = renderHook(() => useDisplayRotation(config));

    // Dashboard → pres[0]
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(result.current).toEqual({ kind: 'presentation', index: 0 });

    // pres[0] → pres[1]
    act(() => { vi.advanceTimersByTime(5_000); });
    expect(result.current).toEqual({ kind: 'presentation', index: 1 });

    // pres[1] → dashboard (cycle restarts)
    act(() => { vi.advanceTimersByTime(5_000); });
    expect(result.current).toEqual({ kind: 'dashboard' });
  });

  it('full cycle repeats', () => {
    const config = makeConfig();
    const { result } = renderHook(() => useDisplayRotation(config));

    // One full cycle: 10 + 5 + 5 = 20s
    act(() => { vi.advanceTimersByTime(20_000); });
    expect(result.current).toEqual({ kind: 'dashboard' });

    // Second cycle: another 10s → pres[0]
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(result.current).toEqual({ kind: 'presentation', index: 0 });
  });

  it('cleans up timers on unmount', () => {
    const config = makeConfig();
    const { result, unmount } = renderHook(() => useDisplayRotation(config));

    unmount();
    // Advancing timers after unmount should not throw
    act(() => { vi.advanceTimersByTime(60_000); });
    // No assertion needed — verifying no error/leak
  });

  it('resets when config changes', () => {
    const config1 = makeConfig();
    const config2 = makeConfig({
      activePresentations: [
        { title: 'Only One', file: '/presentations/one.jpg', type: 'image' },
      ],
    });

    const { result, rerender } = renderHook(
      ({ cfg }) => useDisplayRotation(cfg),
      { initialProps: { cfg: config1 } },
    );

    // Advance to first presentation of config1
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(result.current).toEqual({ kind: 'presentation', index: 0 });

    // Switch config → should reset to dashboard
    rerender({ cfg: config2 });
    expect(result.current).toEqual({ kind: 'dashboard' });
  });
});
