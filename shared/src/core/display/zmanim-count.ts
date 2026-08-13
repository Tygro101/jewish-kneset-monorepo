/**
 * Zmanim count (card count) resolution.
 *
 * The CMS writes `displaySettings.zmanimCount` as a nested object with one
 * value per physical screen. Each value is either 4 or 6, or the SCREEN_CONFIG
 * sentinel which defers to the device's own on-screen setting.
 *
 * MIRROR: kneset-cms/src/lib/zmanimCount.ts (jk-mono-repos) must stay in sync.
 */

/** Which physical screen a value applies to. Matches smart-clock's AppRoute. */
export type ZmanimCountTarget = 'tv' | 'tablet';

/** Sentinel: no CMS value — the display uses its own on-screen setting. */
export const SCREEN_CONFIG = 'screen' as const;

/** The allowed card-count values. */
export const ZMANIM_COUNT_OPTIONS = [4, 6] as const;

/** A concrete card count. */
export type ZmanimCount = 4 | 6;

/** A single CMS-authored value: a card count, or "use the on-screen config". */
export type ZmanimCountValue = ZmanimCount | typeof SCREEN_CONFIG;

/** The nested `displaySettings.zmanimCount` object written by the CMS. */
export interface ZmanimCountSetting {
  tv?: ZmanimCountValue;
  tablet?: ZmanimCountValue;
}

/** Per-target default (used when nothing else is set). */
export const ZMANIM_COUNT_DEFAULTS: Record<ZmanimCountTarget, ZmanimCount> = {
  tv: 6,
  tablet: 4,
};

/** Hebrew field labels for the settings UI. */
export const ZMANIM_COUNT_LABELS: Record<ZmanimCountTarget, string> = {
  tv: 'מסך טלוויזיה (TV)',
  tablet: 'מסך טאבלט',
};

/**
 * Clamp a raw value into a valid ZmanimCount.
 * Anything not exactly 4 or 6 returns the fallback.
 */
export function clampZmanimCount(value: unknown, fallback: ZmanimCount): ZmanimCount {
  if (value === 4 || value === 6) return value as ZmanimCount;
  return fallback;
}

/**
 * Reads the CMS value for one target out of a raw `zmanimCount`.
 * Accepted shapes:
 *   - nested object: { tv: 6, tablet: 4 }
 *   - legacy flat number: 4 → applies to both targets
 *   - missing / anything else → SCREEN_CONFIG
 */
export function readCmsZmanimCount(raw: unknown, target: ZmanimCountTarget): ZmanimCountValue {
  if (typeof raw === 'number') {
    if (raw === 4 || raw === 6) return raw as ZmanimCount;
    return SCREEN_CONFIG;
  }
  if (raw && typeof raw === 'object') {
    const value = (raw as Record<string, unknown>)[target];
    if (value === 4 || value === 6) return value as ZmanimCount;
  }
  return SCREEN_CONFIG;
}

/**
 * Final card count for a screen.
 * A CMS number wins; SCREEN_CONFIG defers to the device setting; an unusable
 * device setting falls back to the code default.
 */
export function resolveZmanimCountFor(
  rawCmsSetting: unknown,
  deviceValue: unknown,
  target: ZmanimCountTarget,
): ZmanimCount {
  const cms = readCmsZmanimCount(rawCmsSetting, target);
  const fallback = ZMANIM_COUNT_DEFAULTS[target];
  if (cms !== SCREEN_CONFIG) return cms;
  return clampZmanimCount(deviceValue, fallback);
}
