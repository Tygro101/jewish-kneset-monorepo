import { describe, it, expect } from 'vitest';
import { hasScheduleToday } from './hasScheduleToday';
import type { TenantConfig } from '../store/config/configState';

function makeConfig(schedule: Partial<TenantConfig['weeklySchedule']> = {}): TenantConfig {
  return {
    tenant: { id: 'test', displayName: 'Test' },
    displaySettings: { mainDashboardDurationSeconds: 60, presentationDurationSeconds: 20 },
    weeklySchedule: {
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      shabbat: [],
      ...schedule,
    },
    activePresentations: [],
  };
}

describe('hasScheduleToday', () => {
  it('returns false when config is null', () => {
    expect(hasScheduleToday(null)).toBe(false);
  });

  it('returns false when today has no events', () => {
    // Sunday July 19, 2026 is a Sunday
    const date = new Date(2026, 6, 19);
    const config = makeConfig({ sunday: [] });
    expect(hasScheduleToday(config, date)).toBe(false);
  });

  it('returns true when today has events', () => {
    const date = new Date(2026, 6, 19); // Sunday
    const config = makeConfig({
      sunday: [{ time: '06:00', title: 'שחרית', type: 'tefilla' }],
    });
    expect(hasScheduleToday(config, date)).toBe(true);
  });

  it('returns false when a different day has events but not today', () => {
    const date = new Date(2026, 6, 19); // Sunday
    const config = makeConfig({
      monday: [{ time: '06:00', title: 'שחרית', type: 'tefilla' }],
    });
    expect(hasScheduleToday(config, date)).toBe(false);
  });

  it('handles missing weeklySchedule gracefully', () => {
    const config = {
      tenant: { id: 'test', displayName: 'Test' },
      displaySettings: { mainDashboardDurationSeconds: 60, presentationDurationSeconds: 20 },
      weeklySchedule: undefined as unknown as TenantConfig['weeklySchedule'],
      activePresentations: [] as TenantConfig['activePresentations'],
    };
    expect(hasScheduleToday(config)).toBe(false);
  });
});
