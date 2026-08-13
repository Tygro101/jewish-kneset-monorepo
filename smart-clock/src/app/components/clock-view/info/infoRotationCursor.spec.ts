import { describe, it, expect, beforeEach } from 'vitest';
import {
  readCursor,
  advanceCursor,
  __resetInfoCursorForTests,
} from './infoRotationCursor';

beforeEach(() => {
  __resetInfoCursorForTests();
});

describe('infoRotationCursor', () => {
  it('starts at 0 for a new signature', () => {
    expect(readCursor('sig-a', 4)).toBe(0);
  });

  it('advancing wraps modulo the page count', () => {
    readCursor('sig-a', 3); // init
    expect(advanceCursor('sig-a', 3)).toBe(1);
    expect(advanceCursor('sig-a', 3)).toBe(2);
    expect(advanceCursor('sig-a', 3)).toBe(0); // wraps
  });

  it('a changed signature resets to 0', () => {
    readCursor('sig-a', 3);
    advanceCursor('sig-a', 3); // now 1
    expect(readCursor('sig-b', 3)).toBe(0); // reset
  });

  it('a shrinking page count never returns out-of-range', () => {
    readCursor('sig-a', 5);
    advanceCursor('sig-a', 5); // 1
    advanceCursor('sig-a', 5); // 2
    advanceCursor('sig-a', 5); // 3
    // Now pageCount shrinks to 2
    expect(readCursor('sig-a', 2)).toBeLessThan(2);
  });

  it('cursor survives across calls (simulating unmount/remount)', () => {
    readCursor('sig-a', 4);
    advanceCursor('sig-a', 4); // 1
    advanceCursor('sig-a', 4); // 2
    // "unmount" - nothing happens
    // "remount" - read again
    expect(readCursor('sig-a', 4)).toBe(2);
  });

  it('pageCount 0 returns 0', () => {
    expect(readCursor('sig-a', 0)).toBe(0);
    expect(advanceCursor('sig-a', 0)).toBe(0);
  });
});
