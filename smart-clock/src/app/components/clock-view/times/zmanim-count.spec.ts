import { describe, it, expect } from 'vitest';
import {
  clampZmanimCount,
  readCmsZmanimCount,
  resolveZmanimCountFor,
  SCREEN_CONFIG,
  ZMANIM_COUNT_DEFAULTS,
} from '@shared/core/display/zmanim-count';

describe('clampZmanimCount', () => {
  it('accepts 4', () => expect(clampZmanimCount(4, 6)).toBe(4));
  it('accepts 6', () => expect(clampZmanimCount(6, 4)).toBe(6));
  it('rejects 5 → fallback', () => expect(clampZmanimCount(5, 4)).toBe(4));
  it('rejects 0 → fallback', () => expect(clampZmanimCount(0, 6)).toBe(6));
  it('rejects string "4" → fallback', () => expect(clampZmanimCount('4', 6)).toBe(6));
  it('rejects null → fallback', () => expect(clampZmanimCount(null, 4)).toBe(4));
  it('rejects undefined → fallback', () => expect(clampZmanimCount(undefined, 6)).toBe(6));
});

describe('readCmsZmanimCount', () => {
  it('nested object per target', () => {
    expect(readCmsZmanimCount({ tv: 6, tablet: 4 }, 'tablet')).toBe(4);
    expect(readCmsZmanimCount({ tv: 6, tablet: 4 }, 'tv')).toBe(6);
  });

  it('flat legacy number applies to both', () => {
    expect(readCmsZmanimCount(4, 'tv')).toBe(4);
    expect(readCmsZmanimCount(4, 'tablet')).toBe(4);
  });

  it('invalid flat number → SCREEN_CONFIG', () => {
    expect(readCmsZmanimCount(5, 'tablet')).toBe(SCREEN_CONFIG);
    expect(readCmsZmanimCount(0, 'tv')).toBe(SCREEN_CONFIG);
  });

  it('missing key → SCREEN_CONFIG', () => {
    expect(readCmsZmanimCount({ tv: 6 }, 'tablet')).toBe(SCREEN_CONFIG);
  });

  it('null/undefined → SCREEN_CONFIG', () => {
    expect(readCmsZmanimCount(null, 'tablet')).toBe(SCREEN_CONFIG);
    expect(readCmsZmanimCount(undefined, 'tv')).toBe(SCREEN_CONFIG);
  });

  it('non-object non-number → SCREEN_CONFIG', () => {
    expect(readCmsZmanimCount('hello', 'tv')).toBe(SCREEN_CONFIG);
  });
});

describe('resolveZmanimCountFor', () => {
  it('CMS number wins over device value', () => {
    expect(resolveZmanimCountFor({ tablet: 6 }, 4, 'tablet')).toBe(6);
  });

  it('SCREEN_CONFIG defers to device value', () => {
    expect(resolveZmanimCountFor({ tablet: SCREEN_CONFIG }, 4, 'tablet')).toBe(4);
  });

  it('absent CMS (null) uses device value', () => {
    expect(resolveZmanimCountFor(null, 6, 'tv')).toBe(6);
  });

  it('garbage device value falls back to target default', () => {
    expect(resolveZmanimCountFor(null, 5, 'tablet')).toBe(ZMANIM_COUNT_DEFAULTS.tablet);
    expect(resolveZmanimCountFor(null, 'abc', 'tv')).toBe(ZMANIM_COUNT_DEFAULTS.tv);
  });

  it('tablet default is 4, tv default is 6', () => {
    expect(resolveZmanimCountFor(undefined, undefined, 'tablet')).toBe(4);
    expect(resolveZmanimCountFor(undefined, undefined, 'tv')).toBe(6);
  });
});
