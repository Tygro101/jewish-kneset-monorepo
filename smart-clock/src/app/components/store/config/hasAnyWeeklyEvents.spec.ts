import { describe, it, expect } from 'vitest';
import { hasAnyWeeklyEvents } from './hasAnyWeeklyEvents';
import type { TenantConfig } from './configState';

const withDays = (days: Record<string, unknown[]>) =>
  ({ weeklySchedule: days } as unknown as TenantConfig);

describe('hasAnyWeeklyEvents', () => {
  it('returns false for null config', () => {
    expect(hasAnyWeeklyEvents(null)).toBe(false);
  });

  it('returns false when weeklySchedule is absent', () => {
    expect(hasAnyWeeklyEvents({} as TenantConfig)).toBe(false);
  });

  it('returns false when every day is empty', () => {
    expect(hasAnyWeeklyEvents(withDays({ sunday: [], monday: [] }))).toBe(false);
  });

  it('returns true when any day has an event', () => {
    expect(hasAnyWeeklyEvents(withDays({ sunday: [], monday: [{ time: '06:30' }] }))).toBe(true);
  });
});
