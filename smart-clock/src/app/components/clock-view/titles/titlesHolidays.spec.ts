import { HDate, HebrewCalendar, flags } from '@hebcal/core';
import { describe, expect, it } from 'vitest';
import {
    TitlesAiom,
    TitlesKeys,
} from '@shared/core/services/workers/handlers/models/titles-of-aiom';
import { DefaultOptions } from '@shared/core/services/workers/handlers/constants/calendar.options';

const titleFor = (day: number, month: string, year = 5786) =>
    new TitlesAiom({ date: new HDate(day, month, year).greg() }).calculateTitles();

describe('Orthodox holiday titles — what the shul display shows', () => {
    // ═══════════════════════════════════════════════════════
    // SEFIRAT HA'OMER
    // ═══════════════════════════════════════════════════════
    describe('Sefirat HaOmer', () => {
        it('Day 1 (16 Nisan) — Chol HaMoed Pesach + Omer in gematria + Ya\'aleh VeYavo + Half Hallel', () => {
            const titles = titleFor(16, 'Nisan');

            // Omer renders in gematria: "א׳ בעומר"
            expect(titles[TitlesKeys.SefiratHaOmer]?.title).toMatch(/בעומר/);
            expect(titles[TitlesKeys.CholHamoed]?.title).toContain('פסח');
            expect(titles[TitlesKeys.YaalehVeYavo]?.title).toBe('יעלה ויבוא');
            expect(titles[TitlesKeys.Hallel]?.title).toBe('חצי הלל (בלי ברכה)');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
        });

        it('Day 33 — Lag BaOmer — gematria ל״ג, minor holiday, no tachanun', () => {
            const titles = titleFor(18, 'Iyyar');

            expect(titles[TitlesKeys.SefiratHaOmer]?.title).toContain('ל״ג');
            expect(titles[TitlesKeys.MinorHoliday]?.title).toBe('ל״ג בעומר');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
            expect(titles[TitlesKeys.Hallel]).toBeUndefined();
        });

        it('Day 49 (5 Sivan) — Erev Shavuot — last Omer day in gematria', () => {
            const titles = titleFor(5, 'Sivan');

            expect(titles[TitlesKeys.SefiratHaOmer]?.title).toContain('מ״ט');
            expect(titles[TitlesKeys.ErevChag]?.title).toContain('שבועות');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
        });

        it('Shavuot (6 Sivan) — Omer is over, full Hallel, Ya\'aleh VeYavo', () => {
            const titles = titleFor(6, 'Sivan');

            expect(titles[TitlesKeys.SefiratHaOmer]).toBeUndefined();
            expect(titles[TitlesKeys.Hag]?.title).toContain('שבועות');
            expect(titles[TitlesKeys.Hallel]?.title).toBe('הלל שלם');
            expect(titles[TitlesKeys.YaalehVeYavo]?.title).toBe('יעלה ויבוא');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
        });
    });

    // ═══════════════════════════════════════════════════════
    // ROSH HASHANA (joined 2-day Chag)
    // ═══════════════════════════════════════════════════════
    describe('Rosh Hashana (joined days)', () => {
        it('Day 1 (1 Tishrei) — Chag without Latin year, Ya\'aleh VeYavo, Morid HaTal still', () => {
            const titles = titleFor(1, 'Tishrei');

            expect(titles[TitlesKeys.Hag]?.title).toContain('ראש השנה');
            // Must not contain Latin digits (e.g. "5786")
            expect(titles[TitlesKeys.Hag]?.title).not.toMatch(/\d/);
            expect(titles[TitlesKeys.YaalehVeYavo]?.title).toBe('יעלה ויבוא');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
            expect(titles[TitlesKeys.MoridAtal]?.title).toBe('מוריד הטל');
        });

        it('Day 2 (2 Tishrei) — still Chag, Ya\'aleh VeYavo', () => {
            const titles = titleFor(2, 'Tishrei');

            expect(titles[TitlesKeys.Hag]?.title).toContain('ראש השנה');
            expect(titles[TitlesKeys.YaalehVeYavo]?.title).toBe('יעלה ויבוא');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
        });
    });

    // ═══════════════════════════════════════════════════════
    // EREV DAYS (previously invisible)
    // ═══════════════════════════════════════════════════════
    describe('Erev days', () => {
        it('Erev Rosh Hashana (29 Elul) — shows ErevChag', () => {
            const titles = titleFor(29, 'Elul');
            expect(titles[TitlesKeys.ErevChag]?.title).toContain('ראש השנה');
        });

        it('Erev Yom Kippur (9 Tishrei) — shows ErevChag', () => {
            const titles = titleFor(9, 'Tishrei');
            expect(titles[TitlesKeys.ErevChag]?.title).toContain('יום כיפור');
        });

        it('Erev Sukkot (14 Tishrei) — shows ErevChag', () => {
            const titles = titleFor(14, 'Tishrei');
            expect(titles[TitlesKeys.ErevChag]?.title).toContain('סוכות');
        });

        it('Erev Pesach (14 Nisan) — shows ErevChag AND Tzum (Ta\'anit Bechorot)', () => {
            const titles = titleFor(14, 'Nisan');
            expect(titles[TitlesKeys.ErevChag]?.title).toContain('פסח');
            expect(titles[TitlesKeys.Tzum]?.title).toContain('תענית בכורות');
        });

        it('Erev Shavuot (5 Sivan) — shows ErevChag', () => {
            const titles = titleFor(5, 'Sivan');
            expect(titles[TitlesKeys.ErevChag]?.title).toContain('שבועות');
        });
    });

    // ═══════════════════════════════════════════════════════
    // YOM KIPPUR — CHAG wins over fast, no duplicate Tzum
    // ═══════════════════════════════════════════════════════
    describe('Yom Kippur', () => {
        it('10 Tishrei — appears as Hag, NOT as Tzum (no duplicate)', () => {
            const titles = titleFor(10, 'Tishrei');
            expect(titles[TitlesKeys.Hag]?.title).toContain('יום כיפור');
            // Tzum should NOT be set because the CHAG flag takes priority
            expect(titles[TitlesKeys.Tzum]).toBeUndefined();
        });
    });

    // ═══════════════════════════════════════════════════════
    // YOM YERUSHALAYIM
    // ═══════════════════════════════════════════════════════
    describe('Yom Yerushalayim', () => {
        it('28 Iyyar — YomYerushalayim + full Hallel', () => {
            const titles = titleFor(28, 'Iyyar');
            expect(titles[TitlesKeys.YomYerushalayim]?.title).toContain('ירושלים');
            expect(titles[TitlesKeys.Hallel]?.title).toBe('הלל שלם');
        });
    });

    // ═══════════════════════════════════════════════════════
    // SUKKOT — through Shmini Atzeret
    // ═══════════════════════════════════════════════════════
    describe('Sukkot + Shmini Atzeret', () => {
        it('Sukkot Day 1 (15 Tishrei) — Chag, full Hallel, Ya\'aleh VeYavo', () => {
            const titles = titleFor(15, 'Tishrei');

            expect(titles[TitlesKeys.Hag]?.title).toContain('סוכות');
            expect(titles[TitlesKeys.Hallel]?.title).toBe('הלל שלם');
            expect(titles[TitlesKeys.YaalehVeYavo]?.title).toBe('יעלה ויבוא');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
        });

        it('Chol HaMoed Sukkot (17 Tishrei) — full Hallel + Ya\'aleh VeYavo', () => {
            const titles = titleFor(17, 'Tishrei');

            expect(titles[TitlesKeys.CholHamoed]?.title).toContain('סוכות');
            expect(titles[TitlesKeys.Hallel]?.title).toBe('הלל שלם');
            expect(titles[TitlesKeys.YaalehVeYavo]?.title).toBe('יעלה ויבוא');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
        });

        it('Shmini Atzeret (22 Tishrei) — Chag, full Hallel, Mashiv HaRuach begins', () => {
            const titles = titleFor(22, 'Tishrei');

            expect(titles[TitlesKeys.Hag]?.title).toContain('שמיני עצרת');
            expect(titles[TitlesKeys.Hallel]?.title).toBe('הלל שלם');
            expect(titles[TitlesKeys.YaalehVeYavo]?.title).toBe('יעלה ויבוא');
            expect(titles[TitlesKeys.MashivAruach]?.title).toBe('משיב הרוח ומריד הגשם');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
        });
    });

    // ═══════════════════════════════════════════════════════
    // PESACH — Erev, Day 1, Last Day
    // ═══════════════════════════════════════════════════════
    describe('Pesach', () => {
        it('Erev Pesach (14 Nisan) — fast of firstborn, Aneinu, no tachanun, ErevChag', () => {
            const titles = titleFor(14, 'Nisan');

            expect(titles[TitlesKeys.Tzum]?.title).toContain('תענית בכורות');
            expect(titles[TitlesKeys.ErevChag]?.title).toContain('פסח');
            expect(titles[TitlesKeys.Aneinu]?.title).toBe('אומרים עננו במנחה');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
        });

        it('Pesach Day 1 (15 Nisan) — Chag, full Hallel, Ya\'aleh VeYavo, Morid HaTal', () => {
            const titles = titleFor(15, 'Nisan');

            expect(titles[TitlesKeys.Hag]?.title).toContain('פסח');
            expect(titles[TitlesKeys.Hallel]?.title).toBe('הלל שלם');
            expect(titles[TitlesKeys.YaalehVeYavo]?.title).toBe('יעלה ויבוא');
            expect(titles[TitlesKeys.MoridAtal]?.title).toBe('מוריד הטל');
            expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
        });

        it('Pesach Day 7 (21 Nisan) — Chag, half Hallel, Omer in gematria, Ya\'aleh VeYavo', () => {
            const titles = titleFor(21, 'Nisan');

            expect(titles[TitlesKeys.Hag]?.title).toContain('פסח');
            expect(titles[TitlesKeys.Hallel]?.title).toBe('חצי הלל (בלי ברכה)');
            expect(titles[TitlesKeys.SefiratHaOmer]?.title).toMatch(/בעומר/);
            expect(titles[TitlesKeys.YaalehVeYavo]?.title).toBe('יעלה ויבוא');
        });
    });

    // ═══════════════════════════════════════════════════════
    // REGULAR SHABBAT (summer) — parsha, Omer, Pirkei Avot
    // ═══════════════════════════════════════════════════════
    describe('Regular Shabbat in summer', () => {
        it('24 Nisan (Shabbat) — Parsha + Omer gematria + Pirkei Avot + Mevarchim', () => {
            const titles = titleFor(24, 'Nisan');

            expect(titles[TitlesKeys.Parsha]?.title).toContain('שמיני');
            expect(titles[TitlesKeys.SefiratHaOmer]?.title).toMatch(/ט׳ בעומר/);
            expect(titles[TitlesKeys.PirkeiAvot]?.title).toContain('פרקי אבות');
            expect(titles[TitlesKeys.ShabbatMevarchim]).toBeTruthy();
            expect(titles[TitlesKeys.MevarchimChodesh]).toBeTruthy();
            expect(titles[TitlesKeys.YaalehVeYavo]).toBeUndefined();
        });
    });

    // ═══════════════════════════════════════════════════════
    // GEMATRIA — Mishna Yomi uses gematria not Arabic numbers
    // ═══════════════════════════════════════════════════════
    describe('Gematria in learning titles', () => {
        it('Mishna Yomi renders chapter:mishna in gematria', () => {
            // 1 Kislev 5786 has Mishna Yomi "חולין 9:7-8"
            const titles = titleFor(1, 'Kislev');
            const mishna = titles[TitlesKeys.MishnaYomi]?.title ?? '';

            // Should NOT contain Arabic numerals
            expect(mishna).not.toMatch(/\d/);
            // Should contain gematria equivalents
            expect(mishna).toContain('חולין');
            expect(mishna).toContain('ט׳');
        });

        it('Omer count uses gematria, not Arabic numbers', () => {
            const titles = titleFor(24, 'Nisan');
            const omer = titles[TitlesKeys.SefiratHaOmer]?.title ?? '';

            expect(omer).not.toMatch(/\d/);
            expect(omer).toContain('ט׳');
        });
    });

    // ═══════════════════════════════════════════════════════
    // FULL-YEAR SWEEP — guarantee no holiday disappears
    // ═══════════════════════════════════════════════════════
    describe('Full-year sweep — every special day produces a title', () => {
        it('every day with a holiday/fast/erev flag generates at least one visible title', () => {
            // Use the same calendar options as calculateTitles() so we only test
            // days that our system actually sees (excludes BeHaB, YKK, modern holidays).
            const RELEVANT_FLAGS =
                flags.CHAG |
                flags.CHOL_HAMOED |
                flags.MINOR_HOLIDAY |
                flags.EREV |
                flags.MAJOR_FAST |
                flags.MINOR_FAST |
                flags.CHANUKAH_CANDLES;

            const EXPECTED_KEYS: string[] = [
                TitlesKeys.Hag,
                TitlesKeys.ErevChag,
                TitlesKeys.CholHamoed,
                TitlesKeys.MinorHoliday,
                TitlesKeys.ChanukahCandles,
                TitlesKeys.Tzum,
            ];

            const failures: string[] = [];
            const startHd = new HDate(1, 'Tishrei', 5786);
            const endHd = new HDate(29, 'Elul', 5786);

            // Generate the full year's events with our DefaultOptions (disable candlelighting
            // which requires a location that may not resolve in test)
            const allEvents = HebrewCalendar.calendar({
                ...DefaultOptions,
                candlelighting: false,
                location: undefined,
                start: startHd.greg(),
                end: endHd.greg(),
            } as Parameters<typeof HebrewCalendar.calendar>[0]);

            // Group events by day (abs day number)
            const eventsByDay = new Map<number, typeof allEvents>();
            for (const ev of allEvents) {
                const abs = ev.getDate().abs();
                if (!eventsByDay.has(abs)) eventsByDay.set(abs, []);
                eventsByDay.get(abs)!.push(ev);
            }

            for (const [abs, dayEvents] of eventsByDay) {
                const hasRelevant = dayEvents.some((ev) => (ev.getFlags() & RELEVANT_FLAGS) !== 0);
                if (!hasRelevant) continue;

                const hd = new HDate(abs);
                const titles = new TitlesAiom({ date: hd.greg(), withRanking: false }).calculateTitles();
                const hasTitle = EXPECTED_KEYS.some((k) => !!titles[k as keyof typeof titles]?.title);
                if (!hasTitle) {
                    const descs = dayEvents
                        .filter((e) => (e.getFlags() & RELEVANT_FLAGS) !== 0)
                        .map((e) => e.getDesc())
                        .join(', ');
                    failures.push(`${hd.toString()} (${descs})`);
                }
            }

            expect(failures, `Days missing a holiday title:\n${failures.join('\n')}`).toHaveLength(0);
        });
    });
});
