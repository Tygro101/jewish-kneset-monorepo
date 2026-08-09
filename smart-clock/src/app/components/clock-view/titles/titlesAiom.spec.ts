import { HDate } from '@hebcal/core';
import { describe, expect, it } from 'vitest';
import {
    TitlesAiom,
    TitlesKeys,
} from '@shared/core/services/workers/handlers/models/titles-of-aiom';

const titleFor = (day: number, month: string, year = 5786) =>
    new TitlesAiom({ date: new HDate(day, month, year).greg() }).calculateTitles();

describe('TitlesAiom', () => {
    it('includes Rosh Chodesh, Israel learning schedules, and daily prayer additions', () => {
        const titles = titleFor(1, 'Kislev');

        expect(titles[TitlesKeys.RoshChodesh]?.title).toBe('ראש חודש כסלו');
        expect(titles[TitlesKeys.YaalehVeYavo]?.title).toBe('יעלה ויבוא');
        expect(titles[TitlesKeys.Hallel]?.title).toBe('חצי הלל (בלי ברכה)');
        expect(titles[TitlesKeys.DafYomi]).toBeTruthy();
        expect(titles[TitlesKeys.YerushalmiYomi]).toBeTruthy();
        expect(titles[TitlesKeys.MishnaYomi]).toBeTruthy();
        expect(titles[TitlesKeys.Rambam]).toBeTruthy();
        expect(titles[TitlesKeys.KitzurShulchanAruch]).toBeTruthy();
        expect(titles[TitlesKeys.PirkeiAvot]).toBeUndefined();
    });

    it('includes Parashat HaShavua and Pirkei Avot on a summer Shabbat', () => {
        const titles = titleFor(24, 'Nisan');

        expect(titles[TitlesKeys.Parsha]).toBeTruthy();
        expect(titles[TitlesKeys.PirkeiAvot]?.title).toBe('פרקי אבות א׳');
    });

    it('includes minor holidays, Yom Yerushalayim, and Special Shabbat titles', () => {
        const minorHoliday = titleFor(18, 'Iyyar');
        expect(minorHoliday[TitlesKeys.MinorHoliday]?.title).toBe('ל״ג בעומר');

        const yomYerushalayim = titleFor(28, 'Iyyar');
        expect(yomYerushalayim[TitlesKeys.YomYerushalayim]?.title).toBe('יום ירושלים');

        const specialShabbat = titleFor(27, "Sh'vat");
        expect(specialShabbat[TitlesKeys.SpecialShabbat]?.title).toBe('שבת שקלים');
    });

    it('includes Chanukah, Al HaNissim, and full Hallel', () => {
        const titles = titleFor(25, 'Kislev');

        expect(titles[TitlesKeys.ChanukahCandles]).toBeTruthy();
        expect(titles[TitlesKeys.AlHaNissim]?.title).toBe('על הנסים בחנוכה');
        expect(titles[TitlesKeys.Hallel]?.title).toBe('הלל שלם');
    });

    it('uses Edot Mizrach fast-day wording, including Nachem in every Tisha B\'Av prayer', () => {
        const titles = titleFor(9, 'Av');

        expect(titles[TitlesKeys.Tzum]).toBeTruthy();
        expect(titles[TitlesKeys.Aneinu]?.title).toBe('אומרים עננו במנחה');
        expect(titles[TitlesKeys.Nachem]?.title).toBe('אומרים נחם בכל התפילות');
        expect(titles[TitlesKeys.Hallel]).toBeUndefined();
    });

    it('surfaces Shabbat Mevarchim with the announced month and molad', () => {
        const titles = titleFor(23, 'Kislev');

        // Mevarchim title shows the announced month
        const mevarchim = titles[TitlesKeys.ShabbatMevarchim]?.title ?? '';
        expect(mevarchim).toContain('מברכים חודש טבת');

        // Molad is a separate title with time details
        const molad = titles[TitlesKeys.Molad]?.title ?? '';
        expect(molad).toContain('מולד');
        expect(molad).toContain('חלקים');
    });

    it('allows individual title keys to be disabled', () => {
        const titles = new TitlesAiom({
            date: new HDate(25, 'Kislev', 5786).greg(),
            config: {
                [TitlesKeys.Hallel]: false,
                [TitlesKeys.DafYomi]: false,
            },
        }).calculateTitles();

        expect(titles[TitlesKeys.Hallel]).toBeUndefined();
        expect(titles[TitlesKeys.DafYomi]).toBeUndefined();
        expect(titles[TitlesKeys.AlHaNissim]).toBeTruthy();
    });
});


describe('TitlesAiom — tachanun consolidation and ranking', () => {
    it('shows a single "אין אומרים תחנון" on holidays (both prayers skipped)', () => {
        // Rosh Hashana day 1 — tachanun skipped all day.
        const titles = new TitlesAiom({ date: new HDate(1, 'Tishrei', 5786).greg() }).calculateTitles();
        expect(titles[TitlesKeys.Tachanun]?.title).toBe('אין אומרים תחנון');
    });

    it('does not show a tachanun title on a plain weekday (said at both prayers)', () => {
        // 4 Cheshvan 5786 is a plain weekday.
        const titles = new TitlesAiom({ date: new HDate(4, 'Cheshvan', 5786).greg() }).calculateTitles();
        expect(titles[TitlesKeys.Tachanun]).toBeUndefined();
    });

    it('assigns streak: 1 to a brand-new title and streak: 3 to a daily-recurring one', () => {
        // 10 Tevet = a one-day fast. Tzum title is new (not present on 9 Tevet).
        const titles = new TitlesAiom({ date: new HDate(10, 'Tevet', 5786).greg() }).calculateTitles();
        expect(titles[TitlesKeys.Tzum]?.streak).toBe(1);
        // Daf Yomi recurs every day, so its key has appeared 3+ days in a row.
        expect(titles[TitlesKeys.DafYomi]?.streak).toBe(3);
    });
});


describe('TitlesAiom — Birkat HaLevana in Av', () => {
    it('does not show Birkat HaLevana before Motzei Tisha B\'Av (7-9 Av)', () => {
        const titles7 = titleFor(7, 'Av');
        expect(titles7[TitlesKeys.BirkatLevana]).toBeUndefined();

        const titles8 = titleFor(8, 'Av');
        expect(titles8[TitlesKeys.BirkatLevana]).toBeUndefined();

        const titles9 = titleFor(9, 'Av');
        expect(titles9[TitlesKeys.BirkatLevana]).toBeUndefined();
    });

    it('shows Birkat HaLevana from 10 Av (Motzei Tisha B\'Av) onward', () => {
        const titles10 = titleFor(10, 'Av');
        expect(titles10[TitlesKeys.BirkatLevana]?.title).toBe('ברכת הלבנה בערב');

        const titles15 = titleFor(15, 'Av');
        expect(titles15[TitlesKeys.BirkatLevana]?.title).toBe('ברכת הלבנה בערב');
    });

    it('still shows Birkat HaLevana normally in other months (e.g. Kislev)', () => {
        const titles = titleFor(7, 'Kislev');
        expect(titles[TitlesKeys.BirkatLevana]?.title).toBe('ברכת הלבנה בערב');
    });
});
