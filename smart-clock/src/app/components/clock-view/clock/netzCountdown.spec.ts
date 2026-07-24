import { describe, it, expect } from 'vitest';
import { getNetzCountdown, formatCountdown } from './netzCountdown';

const now = new Date('2026-07-22T05:30:00');

describe('getNetzCountdown', () => {
    it('is inactive when netz is further away than the window', () => {
        const netz = new Date('2026-07-22T05:40:00').toISOString(); // 10 min away, window 5
        const r = getNetzCountdown(netz, now, 5);
        expect(r.active).toBe(false);
        expect(r.remainingMs).toBe(0);
    });

    it('is active when netz is within the window', () => {
        const netz = new Date('2026-07-22T05:33:00').toISOString(); // 3 min away
        const r = getNetzCountdown(netz, now, 5);
        expect(r.active).toBe(true);
        expect(r.remainingMs).toBe(3 * 60 * 1000);
    });

    it('is active at the exact boundary of the window', () => {
        const netz = new Date('2026-07-22T05:35:00').toISOString(); // exactly 5 min
        const r = getNetzCountdown(netz, now, 5);
        expect(r.active).toBe(true);
        expect(r.remainingMs).toBe(5 * 60 * 1000);
    });

    it('is active at exactly 0 remaining (netz time)', () => {
        const netz = new Date('2026-07-22T05:30:00').toISOString();
        const r = getNetzCountdown(netz, now, 5);
        expect(r.active).toBe(true);
        expect(r.remainingMs).toBe(0);
    });

    it('is inactive once netz has passed', () => {
        const netz = new Date('2026-07-22T05:29:59').toISOString();
        const r = getNetzCountdown(netz, now, 5);
        expect(r.active).toBe(false);
    });

    it('handles null netz', () => {
        expect(getNetzCountdown(null, now, 5).active).toBe(false);
    });

    it('handles undefined netz', () => {
        expect(getNetzCountdown(undefined, now, 5).active).toBe(false);
    });

    it('handles invalid netz date string', () => {
        expect(getNetzCountdown('not-a-date', now, 5).active).toBe(false);
    });
});

describe('formatCountdown', () => {
    it('formats minutes and seconds with padding', () => {
        expect(formatCountdown(4 * 60 * 1000 + 32 * 1000)).toBe('04:32');
    });

    it('formats small values', () => {
        expect(formatCountdown(7 * 1000)).toBe('00:07');
    });

    it('formats zero', () => {
        expect(formatCountdown(0)).toBe('00:00');
    });

    it('formats exactly 5 minutes', () => {
        expect(formatCountdown(5 * 60 * 1000)).toBe('05:00');
    });

    it('formats 10 minutes', () => {
        expect(formatCountdown(10 * 60 * 1000)).toBe('10:00');
    });

    it('rounds up partial seconds', () => {
        // 4 min 31.5 sec -> ceil to 272 sec = 4:32
        expect(formatCountdown(4 * 60 * 1000 + 31.5 * 1000)).toBe('04:32');
    });

    it('handles negative (clamps to 00:00)', () => {
        expect(formatCountdown(-1000)).toBe('00:00');
    });
});
