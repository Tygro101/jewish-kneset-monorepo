import { describe, it, expect } from 'vitest';
import { buildRouteHash } from './routeHash';

describe('buildRouteHash', () => {
  it('returns #/tv for the tv route', () => {
    expect(buildRouteHash('tv', '', '')).toBe('#/tv');
  });

  it('returns #/ for the tablet route', () => {
    expect(buildRouteHash('tablet', '', '')).toBe('#/');
  });

  it('does not duplicate the flag when debug is in the search string', () => {
    expect(buildRouteHash('tv', '?debug=true', '')).toBe('#/tv');
  });

  it('re-appends the flag when debug lives only in the hash', () => {
    expect(buildRouteHash('tablet', '', '#/tv?debug=true')).toBe('#/?debug=true');
  });

  it('carries the flag from hash to the tv route', () => {
    expect(buildRouteHash('tv', '', '#/?debug=1')).toBe('#/tv?debug=true');
  });
});
