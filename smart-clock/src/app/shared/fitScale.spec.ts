import { describe, it, expect } from 'vitest';
import { isOverflowing, nextShrinkScale } from './fitScale';

describe('isOverflowing', () => {
  it('is false when content fits within tolerance', () => {
    expect(isOverflowing(100, 100)).toBe(false);
    expect(isOverflowing(101, 100)).toBe(false); // within default tolerance 1
  });
  it('is true when content exceeds container beyond tolerance', () => {
    expect(isOverflowing(120, 100)).toBe(true);
  });
});

describe('nextShrinkScale', () => {
  it('does not change scale when there is no overflow', () => {
    expect(nextShrinkScale({ overflow: false, currentScale: 1.2, floor: 0.75, step: 0.02 })).toBe(1.2);
  });
  it('shrinks by step when overflowing', () => {
    expect(nextShrinkScale({ overflow: true, currentScale: 1.2, floor: 0.75, step: 0.02 })).toBe(1.18);
  });
  it('never goes below floor', () => {
    expect(nextShrinkScale({ overflow: true, currentScale: 0.76, floor: 0.75, step: 0.02 })).toBe(0.75);
  });
});
