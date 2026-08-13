/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfoRotation, INFO_PAGE_SECONDS, FADE_MS } from './useInfoRotation';
import { __resetInfoCursorForTests, advanceCursor, readCursor } from './infoRotationCursor';
import { pagesSignature, type InfoPage } from './infoPages';

const page1: InfoPage = { group: 'prayer', rows: [{ value: 'אין אומרים תחנון' }] };
const page2: InfoPage = { group: 'study', rows: [{ label: 'בבלי', value: 'חולין דף ק״ה' }] };
const page3: InfoPage = { group: 'study', rows: [{ label: 'ירושלמי', value: 'בבא מציעא דף כ״ט' }] };

const twoPages = [page1, page2];
const threePages = [page1, page2, page3];

describe('useInfoRotation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __resetInfoCursorForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the first page (cursor reset)', () => {
    const { result } = renderHook(() => useInfoRotation(twoPages));
    expect(result.current.index).toBe(0);
    expect(result.current.page).toBe(page1);
    expect(result.current.fading).toBe(false);
  });

  it('advances after INFO_PAGE_SECONDS', () => {
    const { result } = renderHook(() => useInfoRotation(twoPages));
    act(() => { vi.advanceTimersByTime(INFO_PAGE_SECONDS * 1000); });
    expect(result.current.index).toBe(1);
    expect(result.current.page).toBe(page2);
  });

  it('wraps back to page 0', () => {
    const { result } = renderHook(() => useInfoRotation(twoPages));
    act(() => { vi.advanceTimersByTime(INFO_PAGE_SECONDS * 1000); }); // -> 1
    act(() => { vi.advanceTimersByTime(INFO_PAGE_SECONDS * 1000); }); // -> 0
    expect(result.current.index).toBe(0);
  });

  it('sets fading 350ms before the swap', () => {
    const { result } = renderHook(() => useInfoRotation(twoPages));
    act(() => { vi.advanceTimersByTime(INFO_PAGE_SECONDS * 1000 - FADE_MS); });
    expect(result.current.fading).toBe(true);
    act(() => { vi.advanceTimersByTime(FADE_MS); });
    expect(result.current.fading).toBe(false);
  });

  it('a single page never advances and never sets fading', () => {
    const { result } = renderHook(() => useInfoRotation([page1]));
    act(() => { vi.advanceTimersByTime(INFO_PAGE_SECONDS * 2000); });
    expect(result.current.index).toBe(0);
    expect(result.current.fading).toBe(false);
  });

  it('paused: true freezes the index', () => {
    const { result, rerender } = renderHook(
      ({ paused }) => useInfoRotation(twoPages, { paused }),
      { initialProps: { paused: false } },
    );
    act(() => { vi.advanceTimersByTime(INFO_PAGE_SECONDS * 1000); }); // -> 1
    expect(result.current.index).toBe(1);
    rerender({ paused: true });
    act(() => { vi.advanceTimersByTime(INFO_PAGE_SECONDS * 2000); });
    expect(result.current.index).toBe(1); // still 1
  });

  it('resumes at the next page after unmount/remount', () => {
    // Prime the cursor
    const sig = pagesSignature(threePages);
    readCursor(sig, 3);
    advanceCursor(sig, 3); // cursor now at 1

    const { result } = renderHook(() => useInfoRotation(threePages));
    expect(result.current.index).toBe(1); // resumes at 1, not 0
  });

  it('resets to 0 when the page signature changes', () => {
    const sig = pagesSignature(twoPages);
    readCursor(sig, 2);
    advanceCursor(sig, 2); // cursor at 1

    // Now render with different pages (different signature)
    const differentPages: InfoPage[] = [
      { group: 'prayer', rows: [{ value: 'עננו' }] },
      { group: 'study', rows: [{ label: 'משנה', value: 'כלים' }] },
    ];
    const { result } = renderHook(() => useInfoRotation(differentPages));
    expect(result.current.index).toBe(0); // reset due to signature mismatch
  });
});
