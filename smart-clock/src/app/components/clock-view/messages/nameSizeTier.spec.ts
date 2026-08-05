import { describe, it, expect } from 'vitest';
import { nameSizeTier } from './nameSizeTier';

describe('nameSizeTier', () => {
  it('short single name → xl', () => {
    expect(nameSizeTier(['מזל טוב'])).toBe('xl');
  });

  it('medium single name (14 chars) → lg', () => {
    expect(nameSizeTier(['משפחת כהן ולוי'])).toBe('lg');
  });

  it('long single name (22 chars) → md', () => {
    expect(nameSizeTier(['הילולת אור החיים הקדוש'])).toBe('md');
  });

  it('2 lines → md', () => {
    expect(nameSizeTier(['משפחת כהן', 'משפחת לוי'])).toBe('md');
  });

  it('3+ lines → sm', () => {
    expect(nameSizeTier(['א', 'ב', 'ג'])).toBe('sm');
  });

  it('40-char single line → sm', () => {
    expect(nameSizeTier(['א'.repeat(40)])).toBe('sm');
  });

  it('empty array → xl', () => {
    expect(nameSizeTier([])).toBe('xl');
  });

  it('whitespace-only entries → xl', () => {
    expect(nameSizeTier(['   ', '  '])).toBe('xl');
  });

  it('tier driven by longest line, not first', () => {
    expect(nameSizeTier(['אב', 'א'.repeat(30)])).toBe('sm');
  });
});
