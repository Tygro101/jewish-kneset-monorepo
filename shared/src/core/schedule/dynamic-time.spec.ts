import { describe, it, expect } from 'vitest';
import {
  ANCHOR_RULES,
  describeDynamicTime,
  formatOffsetHe,
  isValidDynamicTime,
  resolveDynamicMin,
  resolveStartMin,
} from './dynamic-time';
import type { AnchorMinutes } from './dynamic-time';
import type { DynamicTime } from './schedule.models';

const hhmm = (h: number, m: number) => h * 60 + m;

describe('resolveDynamicMin — rounding', () => {
  it('floors to 5: netz 06:02 minus one hour is 05:00', () => {
    const anchors: AnchorMinutes = { netz: hhmm(6, 2) };
    const dyn: DynamicTime = { anchor: 'netz', direction: 'before', offsetMinutes: 60 };
    expect(resolveDynamicMin(dyn, anchors)).toBe(hhmm(5, 0));
  });

  it('floors to 5: netz 06:06 minus one hour is 05:05', () => {
    const anchors: AnchorMinutes = { netz: hhmm(6, 6) };
    const dyn: DynamicTime = { anchor: 'netz', direction: 'before', offsetMinutes: 60 };
    expect(resolveDynamicMin(dyn, anchors)).toBe(hhmm(5, 5));
  });

  it('floors an already-aligned value unchanged', () => {
    const anchors: AnchorMinutes = { netz: hhmm(6, 0) };
    const dyn: DynamicTime = { anchor: 'netz', direction: 'before', offsetMinutes: 80 };
    expect(resolveDynamicMin(dyn, anchors)).toBe(hhmm(4, 40));
  });

  it('clamps forward so an after-anchor never resolves earlier than the anchor', () => {
    const anchors: AnchorMinutes = { tzetCochavimGeonim: hhmm(20, 3) };
    const dyn: DynamicTime = { anchor: 'tzetCochavimGeonim', direction: 'after', offsetMinutes: 0 };
    expect(resolveDynamicMin(dyn, anchors)).toBe(hhmm(20, 5));
  });

  it('floors an after-anchor when the result is already past the anchor', () => {
    const anchors: AnchorMinutes = { tzetCochavimGeonim: hhmm(20, 3) };
    const dyn: DynamicTime = { anchor: 'tzetCochavimGeonim', direction: 'after', offsetMinutes: 20 };
    expect(resolveDynamicMin(dyn, anchors)).toBe(hhmm(20, 20));
  });

  it('resolves a plag-anchored mincha', () => {
    const anchors: AnchorMinutes = { plagMincha: hhmm(18, 37) };
    const dyn: DynamicTime = { anchor: 'plagMincha', direction: 'before', offsetMinutes: 15 };
    expect(resolveDynamicMin(dyn, anchors)).toBe(hhmm(18, 20));
  });

  it('resolves a shkiah-anchored mincha', () => {
    const anchors: AnchorMinutes = { shkiah: hhmm(19, 44) };
    const dyn: DynamicTime = { anchor: 'shkiah', direction: 'before', offsetMinutes: 20 };
    expect(resolveDynamicMin(dyn, anchors)).toBe(hhmm(19, 20));
  });
});

describe('resolveDynamicMin — rejection', () => {
  const anchors: AnchorMinutes = { netz: hhmm(6, 2), tzetCochavimGeonim: hhmm(20, 3) };

  it('rejects a direction the anchor does not allow', () => {
    expect(resolveDynamicMin({ anchor: 'netz', direction: 'after', offsetMinutes: 60 }, anchors)).toBeNull();
  });

  it('rejects an offset outside the anchor list', () => {
    expect(resolveDynamicMin({ anchor: 'netz', direction: 'before', offsetMinutes: 37 }, anchors)).toBeNull();
  });

  it('rejects an anchor missing from the date', () => {
    expect(resolveDynamicMin({ anchor: 'plagMincha', direction: 'before', offsetMinutes: 15 }, anchors)).toBeNull();
  });

  it('rejects a null anchors map', () => {
    expect(resolveDynamicMin({ anchor: 'netz', direction: 'before', offsetMinutes: 60 }, null)).toBeNull();
  });

  it('rejects an unknown anchor', () => {
    const bad = { anchor: 'nonsense', direction: 'before', offsetMinutes: 60 } as unknown as DynamicTime;
    expect(isValidDynamicTime(bad)).toBe(false);
    expect(resolveDynamicMin(bad, anchors)).toBeNull();
  });

  it('rejects a resolution that would fall before midnight', () => {
    expect(
      resolveDynamicMin({ anchor: 'netz', direction: 'before', offsetMinutes: 120 }, { netz: hhmm(1, 0) }),
    ).toBeNull();
  });
});

describe('resolveStartMin', () => {
  it('prefers dynamicTime when present', () => {
    const event = {
      time: '09:00',
      dynamicTime: { anchor: 'netz', direction: 'before', offsetMinutes: 60 } as DynamicTime,
    };
    expect(resolveStartMin(event, { netz: hhmm(6, 2) })).toBe(hhmm(5, 0));
  });

  it('falls back to the fixed time', () => {
    expect(resolveStartMin({ time: '06:30' }, null)).toBe(hhmm(6, 30));
  });

  it('returns null when neither is usable', () => {
    expect(resolveStartMin({}, null)).toBeNull();
  });
});

describe('copy helpers', () => {
  it.each([
    [0, 'בזמן'],
    [45, "45 דק'"],
    [60, 'שעה'],
    [80, "שעה ו-20 דק'"],
    [120, '2 שעות'],
  ])('formats %i minutes', (minutes, expected) => {
    expect(formatOffsetHe(minutes as number)).toBe(expected);
  });

  it('describes a before-anchor', () => {
    expect(describeDynamicTime({ anchor: 'netz', direction: 'before', offsetMinutes: 80 })).toBe(
      "שעה ו-20 דק' לפני הנץ",
    );
  });

  it('describes a zero offset as "at the zman"', () => {
    expect(
      describeDynamicTime({ anchor: 'tzetCochavimGeonim', direction: 'after', offsetMinutes: 0 }),
    ).toBe('בזמן צאת הכוכבים');
  });
});

describe('ANCHOR_RULES integrity', () => {
  it('every anchor has ascending, unique, non-negative offsets', () => {
    for (const rule of Object.values(ANCHOR_RULES)) {
      expect(rule.offsets.length).toBeGreaterThan(0);
      expect(new Set(rule.offsets).size).toBe(rule.offsets.length);
      expect([...rule.offsets].sort((a, b) => a - b)).toEqual(rule.offsets);
      expect(rule.offsets.every((o) => o >= 0 && o % 5 === 0)).toBe(true);
    }
  });

  it('clampForward is set exactly on the after-anchors', () => {
    for (const rule of Object.values(ANCHOR_RULES)) {
      expect(rule.clampForward).toBe(rule.direction === 'after');
    }
  });
});
