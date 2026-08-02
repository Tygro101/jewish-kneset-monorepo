/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// localStorage mock (configSlice reads it at module init).
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

const dispatch = vi.fn(() => Promise.resolve());
let selected: { tenantId: string | null; status: string } = { tenantId: 't1', status: 'ready' };

vi.mock('../hooks', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (fn: (s: unknown) => unknown) => fn({ config: selected }),
}));

import { useConfigAutoRefresh } from './useConfigAutoRefresh';

const FIVE_MIN = 5 * 60 * 1000;

describe('useConfigAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    dispatch.mockClear();
    selected = { tenantId: 't1', status: 'ready' };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not dispatch immediately on mount', () => {
    renderHook(() => useConfigAutoRefresh());
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches a refresh every 5 minutes while ready', async () => {
    renderHook(() => useConfigAutoRefresh());

    await act(async () => { await vi.advanceTimersByTimeAsync(FIVE_MIN); });
    expect(dispatch).toHaveBeenCalledTimes(1);

    await act(async () => { await vi.advanceTimersByTimeAsync(FIVE_MIN); });
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('does nothing when there is no tenant', async () => {
    selected = { tenantId: null, status: 'ready' };
    renderHook(() => useConfigAutoRefresh());

    await act(async () => { await vi.advanceTimersByTimeAsync(FIVE_MIN * 3); });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does nothing while the config is not ready', async () => {
    selected = { tenantId: 't1', status: 'loading' };
    renderHook(() => useConfigAutoRefresh());

    await act(async () => { await vi.advanceTimersByTimeAsync(FIVE_MIN * 3); });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('refreshes when the device comes back online', async () => {
    renderHook(() => useConfigAutoRefresh());

    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await Promise.resolve();
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('stops polling and unsubscribes on unmount', async () => {
    const { unmount } = renderHook(() => useConfigAutoRefresh());
    unmount();

    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await vi.advanceTimersByTimeAsync(FIVE_MIN * 2);
    });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not start a second refresh while one is in flight', async () => {
    let resolveDispatch: (() => void) | undefined;
    dispatch.mockImplementationOnce(() => new Promise<void>((res) => { resolveDispatch = () => res(); }));

    renderHook(() => useConfigAutoRefresh());

    // First tick starts a refresh that never settles yet.
    await act(async () => { await vi.advanceTimersByTimeAsync(FIVE_MIN); });
    expect(dispatch).toHaveBeenCalledTimes(1);

    // Online event while in flight → ignored.
    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await Promise.resolve();
    });
    expect(dispatch).toHaveBeenCalledTimes(1);

    // Once it settles, further triggers work again.
    await act(async () => {
      resolveDispatch?.();
      await Promise.resolve();
    });
    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await Promise.resolve();
    });
    expect(dispatch).toHaveBeenCalledTimes(2);
  });
});
