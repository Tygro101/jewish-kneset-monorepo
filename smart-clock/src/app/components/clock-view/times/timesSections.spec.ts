import { describe, expect, it } from 'vitest';
import { TimesKeys } from '@shared/core/services/workers/handlers/constants/times.keys';
import { buildSections, getActiveSection, MAX_VISIBLE_CARDS } from './timesSections';
import { TimeState } from '../../store/times/timesState';

const D = '2026-07-20';

const makeTimes = (entries: Array<[TimesKeys, string]>): TimeState =>
    Object.fromEntries(entries.map(([k, date]) => [k, { date, name: k, shortName: k }]));

const baseWeekday = (): TimeState => makeTimes([
    [TimesKeys.ChatzotLailah, '2026-07-21T00:48:00.000Z'],
    [TimesKeys.AlotHaShahar, `${D}T04:00:00.000Z`],
    [TimesKeys.TallitAndTefillin, `${D}T04:40:00.000Z`],
    [TimesKeys.Netz, `${D}T05:45:00.000Z`],
    [TimesKeys.SofShemaMagenAvraham, `${D}T08:00:00.000Z`],
    [TimesKeys.SofBirkotKeriatShemaMagenAvraham, `${D}T09:00:00.000Z`],
    [TimesKeys.SofShemaGra, `${D}T08:20:00.000Z`],
    [TimesKeys.SofBirkotKeriatShemaGra, `${D}T09:20:00.000Z`],
    [TimesKeys.ChatzotYom, `${D}T12:45:00.000Z`],
    [TimesKeys.MinchaGdola, `${D}T13:15:00.000Z`],
    [TimesKeys.MinchaKtana, `${D}T16:45:00.000Z`],
    [TimesKeys.PlagMincha, `${D}T18:30:00.000Z`],
    [TimesKeys.Shkiah, `${D}T19:45:00.000Z`],
    [TimesKeys.TzetCochavimGeonim, `${D}T20:10:00.000Z`],
    [TimesKeys.TzetCochavimRabinoTam, `${D}T20:55:00.000Z`],
]);

const withShabbat = (): TimeState => ({
    ...baseWeekday(),
    [TimesKeys.TzetShabat]: { date: `${D}T20:25:00.000Z`, name: 'צאת שבת', shortName: 'צאת שבת' },
} as unknown as TimeState);

const withNerot = (): TimeState => ({
    ...baseWeekday(),
    [TimesKeys.NerotShabat]: { date: `${D}T19:25:00.000Z`, name: 'הדלקת נרות', shortName: 'נרות' },
} as unknown as TimeState);

const withTzum = (): TimeState => ({
    ...baseWeekday(),
    [TimesKeys.TzetTzumKatan]: { date: `${D}T20:05:00.000Z`, name: 'צאת צום', shortName: 'צאת צום' },
} as unknown as TimeState);

describe('timesSections', () => {
    describe('buildSections', () => {
        it('returns exactly 3 sections: morning, midday, evening', () => {
            const sections = buildSections(baseWeekday(), new Date(`${D}T06:00:00.000Z`));
            expect(sections).toHaveLength(3);
            expect(sections.map((s) => s.id)).toEqual(['morning', 'midday', 'evening']);
        });

        it('no section exceeds MAX_VISIBLE_CARDS on any day type', () => {
            const dayTypes = [baseWeekday(), withShabbat(), withNerot(), withTzum()];
            for (const t of dayTypes) {
                for (const s of buildSections(t, new Date(`${D}T06:00:00.000Z`))) {
                    expect(s.times.length).toBeLessThanOrEqual(MAX_VISIBLE_CARDS);
                }
            }
        });

        it('morning includes ChatzotLailah before netz + 1h', () => {
            const sections = buildSections(baseWeekday(), new Date(`${D}T06:00:00.000Z`)); // 15m after netz
            const morning = sections.find((s) => s.id === 'morning')!;
            expect(morning.times.some((t) => t.main === TimesKeys.ChatzotLailah)).toBe(true);
        });

        it('morning drops ChatzotLailah after netz + 1h', () => {
            const sections = buildSections(baseWeekday(), new Date(`${D}T07:00:00.000Z`)); // 75m after netz
            const morning = sections.find((s) => s.id === 'morning')!;
            expect(morning.times.some((t) => t.main === TimesKeys.ChatzotLailah)).toBe(false);
        });

        it('every section has exactly 6 cards on every day type', () => {
            const dayTypes = [baseWeekday(), withShabbat(), withNerot(), withTzum()];
            for (const t of dayTypes) {
                for (const s of buildSections(t, new Date(`${D}T06:00:00.000Z`))) {
                    expect(s.times).toHaveLength(6);
                }
            }
        });

        it('midday has 6 cards on a regular weekday, with TzetCochavim (no nerot)', () => {
            const midday = buildSections(baseWeekday()).find((s) => s.id === 'midday')!;
            expect(midday.times).toHaveLength(6);
            expect(midday.times.some((t) => t.main === TimesKeys.NerotShabat)).toBe(false);
            expect(midday.times.some((t) => t.main === TimesKeys.TzetCochavimGeonim)).toBe(true);
        });

        it('midday adds NerotShabat on erev shabbat (6 cards, no tzet preview)', () => {
            const midday = buildSections(withNerot()).find((s) => s.id === 'midday')!;
            expect(midday.times).toHaveLength(6);
            expect(midday.times.some((t) => t.main === TimesKeys.NerotShabat)).toBe(true);
            expect(midday.times.some((t) => t.main === TimesKeys.TzetCochavimGeonim)).toBe(false);
        });

        it('evening includes TzetShabat on shabbat', () => {
            const evening = buildSections(withShabbat()).find((s) => s.id === 'evening')!;
            expect(evening.times.some((t) => t.main === TimesKeys.TzetShabat)).toBe(true);
        });

        it('evening includes TzetTzumKatan on a fast day', () => {
            const evening = buildSections(withTzum()).find((s) => s.id === 'evening')!;
            expect(evening.times.some((t) => t.main === TimesKeys.TzetTzumKatan)).toBe(true);
        });

        it('evening always includes ChatzotLailah as the last card', () => {
            for (const t of [baseWeekday(), withShabbat(), withTzum()]) {
                const evening = buildSections(t).find((s) => s.id === 'evening')!;
                const last = evening.times[evening.times.length - 1];
                expect(last.main).toBe(TimesKeys.ChatzotLailah);
            }
        });
    });

    describe('getActiveSection', () => {
        const times = baseWeekday();

        it('returns morning before chatzotYom', () => {
            const sections = buildSections(times, new Date(`${D}T08:30:00.000Z`));
            expect(getActiveSection(times, sections, new Date(`${D}T08:30:00.000Z`)).id).toBe('morning');
        });

        it('returns midday between chatzotYom and shkiah + 10m', () => {
            const sections = buildSections(times, new Date(`${D}T13:00:00.000Z`));
            expect(getActiveSection(times, sections, new Date(`${D}T13:00:00.000Z`)).id).toBe('midday');
        });

        it('still returns midday at exactly shkiah (within grace)', () => {
            const sections = buildSections(times, new Date(`${D}T19:45:00.000Z`));
            expect(getActiveSection(times, sections, new Date(`${D}T19:45:00.000Z`)).id).toBe('midday');
        });

        it('returns evening after shkiah + 10m', () => {
            const sections = buildSections(times, new Date(`${D}T20:00:00.000Z`));
            expect(getActiveSection(times, sections, new Date(`${D}T20:00:00.000Z`)).id).toBe('evening');
        });

        it('returns morning at very early times (e.g. 03:00)', () => {
            const sections = buildSections(times, new Date(`${D}T03:00:00.000Z`));
            expect(getActiveSection(times, sections, new Date(`${D}T03:00:00.000Z`)).id).toBe('morning');
        });
    });
});
