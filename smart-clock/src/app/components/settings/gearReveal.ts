import type { AppRoute } from '../../routing/routes';

/** How long the gear stays visible after being revealed (ms). */
export const GEAR_REVEAL_MS = 20_000;

/**
 * Minimum simultaneous touch count that triggers the 3-finger reveal gesture.
 * We accept 3+ to be forgiving of a staggered fourth finger.
 */
const MIN_REVEAL_TOUCHES = 3;

/** Returns true when the touch count qualifies as a reveal gesture. */
export function isRevealGesture(touchCount: number): boolean {
  return touchCount >= MIN_REVEAL_TOUCHES;
}

/**
 * The primary (non-gesture) trigger type for the corner hotspot:
 * - TV: mouse hover (mouseenter)
 * - Tablet: tap (pointerdown)
 */
export function revealTriggerFor(route: AppRoute): 'hover' | 'tap' {
  return route === 'tv' ? 'hover' : 'tap';
}
