import { describe, it, expect } from 'vitest';
import { THEME_FAMILIES, VARIANTS } from './themes';
import { blendOver, contrastRatio } from '@shared/core/display/contrast';

/**
 * Contrast floors per text tier.
 * These are the minimum acceptable WCAG-style contrast ratios for a kiosk
 * display read from 6-10m away on a 12.1" screen.
 */
const FLOORS = {
  textPrimary: 12,
  textSecondary: 8,
  textMuted: 8,
  timeColor: 8,
  accent: 6,
} as const;

type TierKey = keyof typeof FLOORS;

const TIER_KEYS: TierKey[] = Object.keys(FLOORS) as TierKey[];

describe('Theme contrast audit', () => {
  for (const family of THEME_FAMILIES) {
    for (const mode of ['dark', 'light'] as const) {
      const variant = VARIANTS[family.id]?.[mode];
      if (!variant) continue;

      // Compute the effective opaque card surface
      const surface = blendOver(variant.surface, variant.bg);

      describe(`${family.id} / ${mode}`, () => {
        for (const tier of TIER_KEYS) {
          const color = variant[tier];
          if (!color) continue;

          it(`${tier} ≥ ${FLOORS[tier]}:1 against card surface`, () => {
            const ratio = contrastRatio(color, surface);
            expect(
              ratio,
              `${family.id}/${mode} ${tier}: ${color} on surface → ${ratio.toFixed(2)}:1 (need ≥${FLOORS[tier]}:1)`,
            ).toBeGreaterThanOrEqual(FLOORS[tier]);
          });
        }
      });
    }
  }
});
