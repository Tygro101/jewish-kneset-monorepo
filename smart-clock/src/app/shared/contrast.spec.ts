import { describe, it, expect } from 'vitest';
import { parseColor, blendOver, relativeLuminance, contrastRatio } from '@shared/core/display/contrast';

describe('parseColor', () => {
  it('parses #rrggbb', () => {
    expect(parseColor('#ff8000')).toEqual({ r: 255, g: 128, b: 0, a: 1 });
  });

  it('parses #rgb shorthand', () => {
    expect(parseColor('#f80')).toEqual({ r: 255, g: 136, b: 0, a: 1 });
  });

  it('parses #rrggbbaa', () => {
    expect(parseColor('#ff800080')).toEqual({ r: 255, g: 128, b: 0, a: expect.closeTo(0.502, 2) });
  });

  it('parses rgb()', () => {
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
  });

  it('parses rgba()', () => {
    expect(parseColor('rgba(10, 20, 30, 0.5)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
  });

  it('throws on invalid input', () => {
    expect(() => parseColor('invalid')).toThrow();
    expect(() => parseColor('#gg0000')).toThrow();
  });
});

describe('blendOver', () => {
  it('blends 50% white over black to grey', () => {
    const result = blendOver('rgba(255, 255, 255, 0.5)', '#000000');
    expect(result).toEqual({ r: 128, g: 128, b: 128, a: 1 });
  });

  it('fully opaque fg replaces backdrop', () => {
    const result = blendOver('#ff0000', '#00ff00');
    expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('fully transparent fg shows backdrop', () => {
    const result = blendOver('rgba(255, 0, 0, 0)', '#00ff00');
    expect(result).toEqual({ r: 0, g: 255, b: 0, a: 1 });
  });
});

describe('relativeLuminance', () => {
  it('black = 0', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });

  it('white = 1', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });
});

describe('contrastRatio', () => {
  it('white on black = 21', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });

  it('identical colours = 1', () => {
    expect(contrastRatio('#34d399', '#34d399')).toBeCloseTo(1, 3);
  });

  it('#94a3b8 on #0f1829 ≈ 6.9', () => {
    const ratio = contrastRatio('#94a3b8', '#0f1829');
    expect(ratio).toBeGreaterThan(6.5);
    expect(ratio).toBeLessThan(7.3);
  });
});
