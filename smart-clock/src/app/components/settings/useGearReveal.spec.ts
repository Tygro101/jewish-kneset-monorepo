/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGearReveal } from './useGearReveal';

describe('useGearReveal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts hidden', () => {
    const { result } = renderHook(() => useGearReveal({ route: 'tablet', paused: false }));
    expect(result.current.visible).toBe(false);
  });

  it('becomes visible after reveal()', () => {
    const { result } = renderHook(() => useGearReveal({ route: 'tablet', paused: false }));
    act(() => result.current.reveal());
    expect(result.current.visible).toBe(true);
  });

  it('stays visible at 19 seconds', () => {
    const { result } = renderHook(() => useGearReveal({ route: 'tablet', paused: false }));
    act(() => result.current.reveal());
    act(() => { vi.advanceTimersByTime(19_000); });
    expect(result.current.visible).toBe(true);
  });

  it('hides at 20 seconds', () => {
    const { result } = renderHook(() => useGearReveal({ route: 'tablet', paused: false }));
    act(() => result.current.reveal());
    act(() => { vi.advanceTimersByTime(20_000); });
    expect(result.current.visible).toBe(false);
  });

  it('a second reveal() at 15s keeps it visible until 35s', () => {
    const { result } = renderHook(() => useGearReveal({ route: 'tablet', paused: false }));
    act(() => result.current.reveal());
    act(() => { vi.advanceTimersByTime(15_000); });
    // Re-reveal resets the timer
    act(() => result.current.reveal());
    // At 34s total — only 19s since re-reveal
    act(() => { vi.advanceTimersByTime(19_000); });
    expect(result.current.visible).toBe(true);
    // At 35s total — 20s since re-reveal
    act(() => { vi.advanceTimersByTime(1_000); });
    expect(result.current.visible).toBe(false);
  });

  it('paused: timer never fires past 20s', () => {
    const { result, rerender } = renderHook(
      (props) => useGearReveal(props),
      { initialProps: { route: 'tablet' as const, paused: false } },
    );
    act(() => result.current.reveal());
    // Pause at 5s
    act(() => { vi.advanceTimersByTime(5_000); });
    rerender({ route: 'tablet', paused: true });
    // Way past the original 20s mark
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(result.current.visible).toBe(true);
  });

  it('unpausing restarts the 20s timer from scratch', () => {
    const { result, rerender } = renderHook(
      (props) => useGearReveal(props),
      { initialProps: { route: 'tablet' as const, paused: false } },
    );
    act(() => result.current.reveal());
    // Pause
    rerender({ route: 'tablet', paused: true });
    act(() => { vi.advanceTimersByTime(50_000); });
    // Unpause
    rerender({ route: 'tablet', paused: false });
    // 19s after unpause — still visible
    act(() => { vi.advanceTimersByTime(19_000); });
    expect(result.current.visible).toBe(true);
    // 20s after unpause — hidden
    act(() => { vi.advanceTimersByTime(1_000); });
    expect(result.current.visible).toBe(false);
  });

  it('3-touch touchstart on document reveals the gear', () => {
    const { result } = renderHook(() => useGearReveal({ route: 'tablet', paused: false }));
    const touchEvent = new Event('touchstart', { bubbles: true }) as unknown as TouchEvent;
    Object.defineProperty(touchEvent, 'touches', { value: [1, 2, 3] }); // length = 3
    act(() => { document.dispatchEvent(touchEvent); });
    expect(result.current.visible).toBe(true);
  });

  it('2-touch touchstart does NOT reveal', () => {
    const { result } = renderHook(() => useGearReveal({ route: 'tablet', paused: false }));
    const touchEvent = new Event('touchstart', { bubbles: true }) as unknown as TouchEvent;
    Object.defineProperty(touchEvent, 'touches', { value: [1, 2] }); // length = 2
    act(() => { document.dispatchEvent(touchEvent); });
    expect(result.current.visible).toBe(false);
  });

  it('works the same on tv route', () => {
    const { result } = renderHook(() => useGearReveal({ route: 'tv', paused: false }));
    act(() => result.current.reveal());
    expect(result.current.visible).toBe(true);
    act(() => { vi.advanceTimersByTime(20_000); });
    expect(result.current.visible).toBe(false);
  });
});
