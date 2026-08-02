import { describe, it, expect } from 'vitest';
import { parseRoute, TV_HASH } from './routes';

describe('parseRoute', () => {
  it.each([
    ['', 'tablet'],
    ['#', 'tablet'],
    ['#/', 'tablet'],
    ['#/unknown', 'tablet'],
    ['#/settings', 'tablet'],
    ['#/tv', 'tv'],
    ['#/TV', 'tv'],
    ['#/Tv', 'tv'],
    ['#/tv/', 'tv'],
    ['#/tv?x=1', 'tv'],
    ['#/tv/?foo', 'tv'],
  ] as const)('parseRoute(%j) === %j', (input, expected) => {
    expect(parseRoute(input)).toBe(expected);
  });

  it('handles null/undefined gracefully', () => {
    expect(parseRoute(null as unknown as string)).toBe('tablet');
    expect(parseRoute(undefined as unknown as string)).toBe('tablet');
  });

  it('TV_HASH constant matches the tv route', () => {
    expect(parseRoute(TV_HASH)).toBe('tv');
  });
});
