import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScreenWakeLock } from './useScreenWakeLock';

type ReleaseListener = () => void;

function makeSentinel() {
  const listeners = new Set<ReleaseListener>();
  return {
    release: vi.fn(async () => undefined),
    addEventListener: vi.fn((_t: 'release', l: ReleaseListener) => void listeners.add(l)),
    removeEventListener: vi.fn((_t: 'release', l: ReleaseListener) => void listeners.delete(l)),
    /** Test helper: simulate the browser releasing the lock. */
    emitRelease: () => listeners.forEach((l) => l()),
  };
}

function setVisibility(value: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => value,
  });
}

function installWakeLock(sentinel: ReturnType<typeof makeSentinel>) {
  const request = vi.fn(async () => sentinel);
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    writable: true,
    value: { request },
  });
  return request;
}

function removeWakeLock() {
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    writable: true,
    value: undefined,
  });
}

describe('useScreenWakeLock', () => {
  beforeEach(() => setVisibility('visible'));
  afterEach(() => removeWakeLock());

  it('acquires a screen wake lock on mount', async () => {
    const sentinel = makeSentinel();
    const request = installWakeLock(sentinel);

    renderHook(() => useScreenWakeLock());

    await vi.waitFor(() => expect(request).toHaveBeenCalledWith('screen'));
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('re-acquires when the document becomes visible again', async () => {
    const sentinel = makeSentinel();
    const request = installWakeLock(sentinel);

    renderHook(() => useScreenWakeLock());
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    // Browser hides the page and auto-releases the sentinel.
    setVisibility('hidden');
    sentinel.emitRelease();
    document.dispatchEvent(new Event('visibilitychange'));

    // Page comes back.
    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));

    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it('does not re-acquire while the document is hidden', async () => {
    const sentinel = makeSentinel();
    const request = installWakeLock(sentinel);

    renderHook(() => useScreenWakeLock());
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    setVisibility('hidden');
    sentinel.emitRelease();
    document.dispatchEvent(new Event('visibilitychange'));

    await new Promise((r) => setTimeout(r, 0));
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('releases the lock on unmount', async () => {
    const sentinel = makeSentinel();
    const request = installWakeLock(sentinel);

    const { unmount } = renderHook(() => useScreenWakeLock());
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    unmount();

    expect(sentinel.removeEventListener).toHaveBeenCalled();
    expect(sentinel.release).toHaveBeenCalledTimes(1);
  });

  it('is a silent no-op when the API is unsupported', () => {
    removeWakeLock();
    expect(() => renderHook(() => useScreenWakeLock())).not.toThrow();
  });

  it('does not throw when the request is rejected', async () => {
    const request = vi.fn(async () => {
      throw new Error('denied');
    });
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      writable: true,
      value: { request },
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => renderHook(() => useScreenWakeLock())).not.toThrow();
    await vi.waitFor(() => expect(warn).toHaveBeenCalled());
    warn.mockRestore();
  });
});
