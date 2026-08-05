import { parseDebugFlag } from './debugFlag';

describe('parseDebugFlag', () => {
  it('returns true for hash query debug=true', () => {
    expect(parseDebugFlag('', '#/tv?debug=true')).toBe(true);
  });

  it('returns true for hash query debug=1', () => {
    expect(parseDebugFlag('', '#/tv?debug=1')).toBe(true);
  });

  it('returns true for hash query debug=yes', () => {
    expect(parseDebugFlag('', '#/?debug=yes')).toBe(true);
  });

  it('returns true for regular search query debug=true', () => {
    expect(parseDebugFlag('?debug=true', '#/tv')).toBe(true);
  });

  it('returns true for regular search query debug=1', () => {
    expect(parseDebugFlag('?debug=1', '')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(parseDebugFlag('', '#/tv?debug=TRUE')).toBe(true);
    expect(parseDebugFlag('', '#/tv?debug=True')).toBe(true);
  });

  it('returns false when debug=false', () => {
    expect(parseDebugFlag('', '#/tv?debug=false')).toBe(false);
  });

  it('returns false when debug=0', () => {
    expect(parseDebugFlag('', '#/tv?debug=0')).toBe(false);
  });

  it('returns false when no debug param present', () => {
    expect(parseDebugFlag('', '#/tv')).toBe(false);
  });

  it('returns false for empty strings', () => {
    expect(parseDebugFlag('', '')).toBe(false);
  });

  it('returns false for garbage hash', () => {
    expect(parseDebugFlag('', '#/some/garbage?foo=bar')).toBe(false);
  });

  it('returns false when param is present but empty', () => {
    expect(parseDebugFlag('', '#/tv?debug=')).toBe(false);
  });

  it('prefers search over hash (both present, search true)', () => {
    expect(parseDebugFlag('?debug=true', '#/tv?debug=false')).toBe(true);
  });
});
