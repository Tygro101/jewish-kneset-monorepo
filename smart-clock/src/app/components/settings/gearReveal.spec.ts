import { describe, it, expect } from 'vitest';
import { GEAR_REVEAL_MS, isRevealGesture, revealTriggerFor } from './gearReveal';

describe('gearReveal', () => {
  describe('GEAR_REVEAL_MS', () => {
    it('is exactly 20 000 ms', () => {
      expect(GEAR_REVEAL_MS).toBe(20_000);
    });
  });

  describe('isRevealGesture', () => {
    it('returns false for 0 touches', () => {
      expect(isRevealGesture(0)).toBe(false);
    });

    it('returns false for 1 touch', () => {
      expect(isRevealGesture(1)).toBe(false);
    });

    it('returns false for 2 touches', () => {
      expect(isRevealGesture(2)).toBe(false);
    });

    it('returns true for 3 touches', () => {
      expect(isRevealGesture(3)).toBe(true);
    });

    it('returns true for 4 touches (forgiving of extra finger)', () => {
      expect(isRevealGesture(4)).toBe(true);
    });

    it('returns true for 5 touches', () => {
      expect(isRevealGesture(5)).toBe(true);
    });
  });

  describe('revealTriggerFor', () => {
    it('returns "hover" for tv route', () => {
      expect(revealTriggerFor('tv')).toBe('hover');
    });

    it('returns "tap" for tablet route', () => {
      expect(revealTriggerFor('tablet')).toBe('tap');
    });
  });
});
