/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoute } from './useRoute';

describe('useRoute', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('returns "tablet" when hash is empty', () => {
    window.location.hash = '';
    const { result } = renderHook(() => useRoute());
    expect(result.current).toBe('tablet');
  });

  it('returns "tv" when hash is #/tv', () => {
    window.location.hash = '#/tv';
    const { result } = renderHook(() => useRoute());
    expect(result.current).toBe('tv');
  });

  it('responds to hashchange events', () => {
    window.location.hash = '';
    const { result } = renderHook(() => useRoute());
    expect(result.current).toBe('tablet');

    act(() => {
      window.location.hash = '#/tv';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('tv');

    act(() => {
      window.location.hash = '#/';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('tablet');
  });

  it('cleans up the event listener on unmount', () => {
    const { unmount } = renderHook(() => useRoute());
    const spy = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(spy).toHaveBeenCalledWith('hashchange', expect.any(Function));
    spy.mockRestore();
  });
});
