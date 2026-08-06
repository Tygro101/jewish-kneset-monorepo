import { describe, it, expect } from 'vitest';
import { resolveDaysAhead } from '../resolveDaysAhead';
import type { TenantConfig } from '../../store/config/configState';

function makeConfig(scheduleDaysAhead?: TenantConfig['displaySettings']['scheduleDaysAhead']): TenantConfig {
  return {
    tenant: { id: 't', displayName: 'T' },
    displaySettings: { mainDashboardDurationSeconds: 60, presentationDurationSeconds: 20, scheduleDaysAhead },
    weeklySchedule: {} as TenantConfig['weeklySchedule'],
    activePresentations: [],
  };
}

describe('resolveDaysAhead', () => {
  it('uses the CMS value for the matching route', () => {
    const config = makeConfig({ tv: 5, tablet: 1 });
    expect(resolveDaysAhead(config, 'tv', 7)).toBe(5);
    expect(resolveDaysAhead(config, 'tablet', 3)).toBe(1);
  });

  it('falls back to the device value when the CMS says "screen"', () => {
    const config = makeConfig({ tv: 'screen', tablet: 'screen' });
    expect(resolveDaysAhead(config, 'tv', 4)).toBe(4);
    expect(resolveDaysAhead(config, 'tablet', 3)).toBe(3);
  });

  it('falls back to code defaults with no config and no device value', () => {
    expect(resolveDaysAhead(null, 'tv')).toBe(6);
    expect(resolveDaysAhead(null, 'tablet')).toBe(2);
  });

  it('still honours a legacy flat number', () => {
    expect(resolveDaysAhead(makeConfig(7), 'tv', 2)).toBe(7);
    expect(resolveDaysAhead(makeConfig(7), 'tablet', 2)).toBe(3); // tablet cap
  });
});
