/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRef } from 'react';
import { useFitToBox } from './useFitToBox';

// Stub ResizeObserver
let roCallback: (() => void) | null = null;
globalThis.ResizeObserver = class {
  constructor(cb: () => void) { roCallback = cb; }
  observe() {}
  unobserve() {}
  disconnect() { roCallback = null; }
} as unknown as typeof ResizeObserver;

// Stub requestAnimationFrame to run synchronously
let rafCallbacks: (() => void)[] = [];
globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
  rafCallbacks.push(() => cb(performance.now()));
  return rafCallbacks.length;
}) as typeof requestAnimationFrame;
globalThis.cancelAnimationFrame = () => {};

function flushRafs(limit = 50) {
  let count = 0;
  while (rafCallbacks.length > 0 && count < limit) {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb());
    count++;
  }
}

describe('useFitToBox', () => {
  let div: HTMLDivElement;

  beforeEach(() => {
    rafCallbacks = [];
    roCallback = null;
    div = document.createElement('div');
    document.body.appendChild(div);
    // Mock getComputedStyle to return --msg-fit
    let currentVar = '';
    const originalSetProperty = div.style.setProperty.bind(div.style);
    vi.spyOn(div.style, 'setProperty').mockImplementation((prop, value) => {
      if (prop === '--msg-fit') currentVar = value ?? '';
      originalSetProperty(prop, value);
    });
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (prop: string) => prop === '--msg-fit' ? currentVar : '',
    } as CSSStyleDeclaration);
  });

  afterEach(() => {
    document.body.removeChild(div);
    vi.restoreAllMocks();
  });

  it('sets --msg-fit to ceil on mount', () => {
    renderHook(() => {
      const ref = useRef(div);
      useFitToBox(ref, [], { ceil: 1 });
      return ref;
    });
    expect(div.style.setProperty).toHaveBeenCalledWith('--msg-fit', '1');
  });

  it('does not set --fit-scale (only writes to box, not root)', () => {
    renderHook(() => {
      const ref = useRef(div);
      useFitToBox(ref, []);
      return ref;
    });
    flushRafs();
    const calls = (div.style.setProperty as ReturnType<typeof vi.fn>).mock.calls;
    const varNames = calls.map((c: string[]) => c[0]);
    expect(varNames).not.toContain('--fit-scale');
  });

  it('shrinks when box overflows and settles >= floor', () => {
    // Make the box overflow
    Object.defineProperty(div, 'scrollHeight', { value: 500, configurable: true });
    Object.defineProperty(div, 'clientHeight', { value: 200, configurable: true });

    renderHook(() => {
      const ref = useRef(div);
      useFitToBox(ref, [], { ceil: 1, floor: 0.55, step: 0.04 });
      return ref;
    });

    flushRafs();

    // Last written value should be >= floor
    const calls = (div.style.setProperty as ReturnType<typeof vi.fn>).mock.calls;
    const values = calls
      .filter((c: string[]) => c[0] === '--msg-fit')
      .map((c: string[]) => parseFloat(c[1]));
    const lastValue = values[values.length - 1];
    expect(lastValue).toBeGreaterThanOrEqual(0.55);
  });

  it('disconnects ResizeObserver on cleanup', () => {
    const { unmount } = renderHook(() => {
      const ref = useRef(div);
      useFitToBox(ref, []);
      return ref;
    });
    expect(roCallback).not.toBeNull();
    unmount();
    expect(roCallback).toBeNull();
  });
});
