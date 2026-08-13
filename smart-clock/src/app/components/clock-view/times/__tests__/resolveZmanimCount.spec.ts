import { describe, it, expect } from 'vitest';
import { resolveZmanimCount } from '../resolveZmanimCount';
import type { TenantConfig } from '../../../store/config/configState';

function makeConfig(zmanimCount?: TenantConfig['displaySettings']['zmanimCount']): TenantConfig {
  return {
    tenant: { id: 't', displayName: 'T' },
    displaySettings: {
      mainDashboardDurationSeconds: 60,
      presentationDurationSeconds: 20,
      zmanimCount,
    },
    weeklySchedule: {} as TenantConfig['weeklySchedule'],
    activePresentations: [],
  };
}

describe('resolveZmanimCount', () => {
  it('uses the CMS value for the matching route', () => {
    const config = makeConfig({ tv: 4, tablet: 6 });
    expect(resolveZmanimCount(config, 'tv', 6)).toBe(4);
    expect(resolveZmanimCount(config, 'tablet', 4)).toBe(6);
  });

  it('falls back to the device value when the CMS says "screen"', () => {
    const config = makeConfig({ tv: 'screen', tablet: 'screen' });
    expect(resolveZmanimCount(config, 'tv', 4)).toBe(4);
    expect(resolveZmanimCount(config, 'tablet', 6)).toBe(6);
  });

  it('falls back to code defaults with no config and no device value', () => {
    expect(resolveZmanimCount(null, 'tv', undefined)).toBe(6);
    expect(resolveZmanimCount(null, 'tablet', undefined)).toBe(4);
  });

  it('ignores an unusable device value', () => {
    expect(resolveZmanimCount(null, 'tv', 5)).toBe(6);
    expect(resolveZmanimCount(null, 'tablet', 'nonsense')).toBe(4);
  });

  it('still honours a legacy flat number for both screens', () => {
    expect(resolveZmanimCount(makeConfig(4), 'tv', 6)).toBe(4);
    expect(resolveZmanimCount(makeConfig(6), 'tablet', 4)).toBe(6);
  });
});
