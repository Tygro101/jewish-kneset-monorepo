import { resolveTitlesArgs } from '@shared/core/services/workers/handlers/workers/titles-calculation.worker';
import { CitiesEnum } from '@shared/core/services/workers/handlers/models/shared-models';

describe('resolveTitlesArgs', () => {
  it('returns the provided date and location when both are valid', () => {
    const date = new Date('2026-10-03T10:00:00Z');
    const result = resolveTitlesArgs({ date, location: CitiesEnum.NETIVOT_NEVA_SHARON });
    expect(result.date.getTime()).toBe(date.getTime());
    expect(result.city).toBe(CitiesEnum.NETIVOT_NEVA_SHARON);
  });

  it('parses ISO date strings (structured clone serialisation)', () => {
    const iso = '2026-10-03T10:00:00.000Z';
    const result = resolveTitlesArgs({ date: iso, location: CitiesEnum.NETIVOT_NEVA_SHARON });
    expect(result.date.getTime()).toBe(new Date(iso).getTime());
  });

  it('falls back to current date when date is missing', () => {
    const before = Date.now();
    const result = resolveTitlesArgs({ location: CitiesEnum.NETIVOT_NEVA_SHARON });
    const after = Date.now();
    expect(result.date.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.date.getTime()).toBeLessThanOrEqual(after);
  });

  it('falls back to current date when date is invalid string', () => {
    const before = Date.now();
    const result = resolveTitlesArgs({ date: 'not-a-date', location: CitiesEnum.NETIVOT_NEVA_SHARON });
    const after = Date.now();
    expect(result.date.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.date.getTime()).toBeLessThanOrEqual(after);
  });

  it('falls back to default city when location is missing', () => {
    const result = resolveTitlesArgs({ date: new Date() });
    expect(result.city).toBe(CitiesEnum.NETIVOT_NEVA_SHARON);
  });

  it('falls back to defaults when data is null', () => {
    const before = Date.now();
    const result = resolveTitlesArgs(null);
    const after = Date.now();
    expect(result.date.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.date.getTime()).toBeLessThanOrEqual(after);
    expect(result.city).toBe(CitiesEnum.NETIVOT_NEVA_SHARON);
  });

  it('falls back to defaults when data is undefined', () => {
    const result = resolveTitlesArgs(undefined);
    expect(result.city).toBe(CitiesEnum.NETIVOT_NEVA_SHARON);
  });
});
