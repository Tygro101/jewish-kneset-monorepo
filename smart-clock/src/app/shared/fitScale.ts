export function isOverflowing(scrollSize: number, clientSize: number, tolerance = 1): boolean {
  return scrollSize > clientSize + tolerance;
}

export interface ShrinkInput {
  overflow: boolean;
  currentScale: number;
  floor: number;
  step: number;
}

/** Returns the next scale. Shrinks by `step` (never below `floor`) only when overflowing. */
export function nextShrinkScale({ overflow, currentScale, floor, step }: ShrinkInput): number {
  if (!overflow) return currentScale;
  return Math.max(floor, +(currentScale - step).toFixed(4));
}
