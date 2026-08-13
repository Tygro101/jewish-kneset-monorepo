import {
    DailyLearning,
    HDate,
    HebrewCalendar,
    HolidayEvent,
    MevarchimChodeshEvent,
    flags,
    gematriya,
    holidayDesc,
} from "@hebcal/core";
import { CitiesEnum, IClockTitle } from "./shared-models";
import { DefaultOptions } from "../constants/calendar.options";
import "@hebcal/learning";
import { addDays } from "date-fns";
import { TitlesTexts } from "../constants/titles.text";
import { getMonthName, replaceAll } from "../methods/shared.methods";

type TitleKey = TitlesKeys | TomorrowTitlesKeys;

export enum TitlesKeys {
    SefiratHaOmer = 'sefirat-haomer',
    BirkatLevana = 'birkat-levana',
    Tachanun = 'tachanun',
    MoridAtal = 'morid-atal',
    MashivAruach = 'mashiv-aruach',
    BarechAlino = 'barech-alino',
    Barechino = 'barechino',
    HebrewDate = 'hebrew-date',
    RoshChodesh = 'rosh-chodesh',
    ErevRoshChodesh = 'erev-rosh-chodesh',
    Parsha = 'parsha',
    SpecialShabbat = 'special-shabbat',
    MinorHoliday = 'minor-holiday',
    YomYerushalayim = 'yom-yerushalayim',
    Hag = 'hag',
    ErevChag = 'erev-chag',
    CholHamoed = 'chol-hamoed',
    ChanukahCandles = 'chanukah-candles',
    Tzum = 'tzum',
    Molad = 'molad',
    ShabbatMevarchim = 'shabbat-mevarchim',
    MevarchimChodesh = 'mevarchim-chodesh',
    DafYomi = 'daf-yomi',
    MishnaYomi = 'mishna-yomi',
    YerushalmiYomi = 'yerushalmi-yomi',
    Rambam = 'rambam',
    KitzurShulchanAruch = 'kitzur-shulchan-aruch',
    PirkeiAvot = 'pirkei-avot',
    YaalehVeYavo = 'yaaleh-ve-yavo',
    AlHaNissim = 'al-ha-nissim',
    Hallel = 'hallel',
    Aneinu = 'aneinu',
    Nachem = 'nachem',
}

export enum TomorrowTitlesKeys {
    Tzum = 'tzum-machar'
}

/** Set a title key to false to suppress it from the calculated title map. */
export type TitlesConfig = Partial<Record<TitleKey, boolean>>;

export class TitlesAiom {
    private city: string;
    private config: TitlesConfig;
    private withRanking: boolean;
    date: Date;
    hDate: HDate;
    titles: Partial<Record<TitleKey, IClockTitle>> = {};

    constructor({
        date,
        city = CitiesEnum.NETIVOT_NEVA_SHARON,
        config = {},
        withRanking = true,
    }: { date: Date; city?: string; config?: TitlesConfig; withRanking?: boolean }) {
        this.hDate = new HDate(date);
        this.date = date;
        this.city = city;
        this.config = config;
        this.withRanking = withRanking;
    }

    calculateTitles(): Partial<Record<TitleKey, IClockTitle>> {
        this.titles = {};

        const todayCalendar = HebrewCalendar.calendar({
            ...DefaultOptions,
            start: this.date,
            end: this.date,
        });

        const tomorrowCalendar = HebrewCalendar.calendar({
            ...DefaultOptions,
            start: addDays(this.date, 1),
            end: addDays(this.date, 1),
        });

        todayCalendar.forEach((item) => {
            if (item.mask & flags.HEBREW_DATE) {
                this.setTitle(TitlesKeys.HebrewDate, item.render('he-x-NoNikud'));
            }
            if ((item.mask & flags.CHAG) && item instanceof HolidayEvent) {
                // RoshHashanaEvent.render() appends the Hebrew year as Latin digits ("ראש השנה 5786").
                // Strip the trailing number so it stays consistent with gematria rendering.
                const text = item.renderBrief('he-x-NoNikud').replace(/\s+\d{4}$/, '');
                this.setTitle(TitlesKeys.Hag, text);
            }
            if ((item.mask & flags.EREV) && item instanceof HolidayEvent) {
                this.setTitle(TitlesKeys.ErevChag, item.renderBrief('he-x-NoNikud'));
            }
            if (item.mask & flags.CHOL_HAMOED) {
                this.setTitle(TitlesKeys.CholHamoed, item.renderBrief('he-x-NoNikud'));
            }
            if (item.mask & flags.CHANUKAH_CANDLES) {
                this.setTitle(TitlesKeys.ChanukahCandles, item.renderBrief('he-x-NoNikud'));
            }
            if ((item.mask & flags.MINOR_FAST || item.mask & flags.MAJOR_FAST) && !(item.mask & flags.CHAG)) {
                // Skip Tzum when CHAG is also set (e.g. Yom Kippur is both CHAG and MAJOR_FAST).
                this.setTitle(TitlesKeys.Tzum, item.renderBrief('he-x-NoNikud'));
            }
            if (item.mask & flags.SHABBAT_MEVARCHIM) {
                this.setTitle(TitlesKeys.ShabbatMevarchim, this.stripNikud(item.renderBrief('he-x-NoNikud')));
                if (item instanceof MevarchimChodeshEvent) {
                    this.setTitle(TitlesKeys.MevarchimChodesh, this.formatMevarchim(item));
                }
            }
            if (item.mask & flags.MOLAD) {
                this.setTitle(TitlesKeys.Molad, item.renderBrief('he-x-NoNikud'));
            }
            if (item.mask & flags.OMER_COUNT) {
                this.setTitle(TitlesKeys.SefiratHaOmer, item.render('he-x-NoNikud'));
            }
            if (item.mask & flags.ROSH_CHODESH) {
                this.setTitle(TitlesKeys.RoshChodesh, item.renderBrief('he-x-NoNikud'));
            }
            if (item.mask & flags.PARSHA_HASHAVUA) {
                this.setTitle(TitlesKeys.Parsha, item.renderBrief('he-x-NoNikud'));
            }
            if (item.mask & flags.SPECIAL_SHABBAT) {
                this.setTitle(TitlesKeys.SpecialShabbat, item.renderBrief('he-x-NoNikud'));
            }
            if ((item.mask & flags.MINOR_HOLIDAY) && !(item.mask & flags.CHANUKAH_CANDLES)) {
                this.setTitle(TitlesKeys.MinorHoliday, item.renderBrief('he-x-NoNikud'));
            }
            if ((item.mask & flags.MODERN_HOLIDAY) && item instanceof HolidayEvent) {
                if (item.getDesc() === holidayDesc.YOM_YERUSHALAYIM) {
                    this.setTitle(TitlesKeys.YomYerushalayim, item.renderBrief('he-x-NoNikud'));
                }
            }
        });

        this.addLearningTitle('dafYomi', TitlesKeys.DafYomi);
        this.addLearningTitle('yerushalmi-vilna', TitlesKeys.YerushalmiYomi);
        this.addLearningTitle('mishnaYomi', TitlesKeys.MishnaYomi, true);
        this.addLearningTitle('rambam1', TitlesKeys.Rambam);
        this.addLearningTitle('kitzurShulchanAruch', TitlesKeys.KitzurShulchanAruch);
        this.addLearningTitle('pirkeiAvotSummer', TitlesKeys.PirkeiAvot);

        tomorrowCalendar.forEach((item) => {
            if (item instanceof HolidayEvent && (item.mask & flags.MINOR_FAST || item.mask & flags.MAJOR_FAST)) {
                this.setTitle(
                    TomorrowTitlesKeys.Tzum,
                    replaceAll(TitlesTexts.FastDate, {
                        ['{יום}']: gematriya(item.date.dd),
                        ['{חודש}']: getMonthName(item.date.getMonthName()),
                    }),
                );
            }
        });

        const birkatLevanaTitle = this.getBirkatLevanaTitle();
        if (birkatLevanaTitle) {
            this.setTitle(TitlesKeys.BirkatLevana, birkatLevanaTitle);
        }

        // Single tachanun title chosen by logic (booleans are TRUE when tachanun IS said):
        //  - not said at shacharit AND mincha  -> "אין אומרים תחנון"
        //  - said at shacharit, skipped mincha  -> "אין אומרים תחנון במנחה" (e.g. erev Rosh Chodesh)
        //  - skipped shacharit, said mincha      -> "אין אומרים תחנון בשחרית"
        //  - said at both (normal weekday)       -> no title
        const { shacharit, mincha } = HebrewCalendar.tachanun(this.hDate, true);
        if (!shacharit && !mincha) {
            this.setTitle(TitlesKeys.Tachanun, 'אין אומרים תחנון');
        } else if (shacharit && !mincha) {
            this.setTitle(TitlesKeys.Tachanun, 'אין אומרים תחנון במנחה');
        } else if (!shacharit && mincha) {
            this.setTitle(TitlesKeys.Tachanun, 'אין אומרים תחנון בשחרית');
        }

        const talRuach = this.getMoridHaGeshemStatus();
        this.setTitle(talRuach.titleKey, talRuach.title);

        const barechinu = this.getBarechAleinuStatus();
        this.setTitle(barechinu.titleKey, barechinu.title);

        const todayHasFlag = (flag: number) => todayCalendar.some((item) => (item.mask & flag) !== 0);
        const hasFast = todayHasFlag(flags.MINOR_FAST) || todayHasFlag(flags.MAJOR_FAST);
        const hasRoshChodesh = todayHasFlag(flags.ROSH_CHODESH);
        const hasChag = todayHasFlag(flags.CHAG) || todayHasFlag(flags.CHOL_HAMOED);

        // Erev Rosh Chodesh: hebcal emits no event for it (flags.EREV covers holidays
        // only), so it is derived from tomorrow's calendar instead of by date arithmetic.
        // Works for 30-day months too: the 29th sees RC on the 30th, and the 30th is
        // itself RC so the !hasRoshChodesh guard suppresses a duplicate.
        // 29 Elul self-excludes because hebcal does not flag 1 Tishrei as Rosh Chodesh.
        const tomorrowIsRoshChodesh = tomorrowCalendar.some(
            (item) => (item.mask & flags.ROSH_CHODESH) !== 0,
        );
        if (tomorrowIsRoshChodesh && !hasRoshChodesh) {
            this.setTitle(TitlesKeys.ErevRoshChodesh, TitlesTexts.ErevRoshChodesh);
        }

        if (hasRoshChodesh || hasChag) {
            this.setTitle(TitlesKeys.YaalehVeYavo, TitlesTexts.YaalehVeYavo);
        }

        const alHaNissim = this.getAlHaNissimTitle(todayCalendar);
        if (alHaNissim) {
            this.setTitle(TitlesKeys.AlHaNissim, alHaNissim);
        }

        const hallel = this.getHallelTitle(todayCalendar);
        if (hallel) {
            this.setTitle(TitlesKeys.Hallel, hallel);
        }

        if (hasFast) {
            this.setTitle(TitlesKeys.Aneinu, TitlesTexts.Aneinu);
        }

        if (todayCalendar.some((item) => item.getDesc() === holidayDesc.TISHA_BAV)) {
            this.setTitle(TitlesKeys.Nachem, TitlesTexts.Nachem);
        }

        if (this.withRanking) {
            this.applyRanking();
        }

        return this.titles;
    }

    /**
     * Assigns a `streak` to each title based on how many consecutive days
     * (including today) its key has appeared, capped at 3:
     *   1 = new today (not present yesterday)
     *   2 = also present yesterday (but not the day before)
     *   3 = present today, yesterday, and the day before (3+ days in a row)
     */
    private applyRanking(): void {
        const MAX_STREAK = 3;
        const yesterdayKeys = this.titleKeysForDate(addDays(this.date, -1));
        const dayBeforeKeys = this.titleKeysForDate(addDays(this.date, -2));

        (Object.keys(this.titles) as TitleKey[]).forEach((key) => {
            const title = this.titles[key];
            if (!title) return;
            let streak = 1;
            if (yesterdayKeys.has(key)) {
                streak = dayBeforeKeys.has(key) ? MAX_STREAK : 2;
            }
            title.streak = streak;
        });
    }

    /** Returns the set of title keys produced for a given date (without ranking, to avoid recursion). */
    private titleKeysForDate(date: Date): Set<string> {
        const historical = new TitlesAiom({
            date,
            city: this.city,
            config: this.config,
            withRanking: false,
        }).calculateTitles();
        return new Set(Object.keys(historical));
    }

    private setTitle(key: TitleKey, title: string, prefix?: string): void {
        if (this.config[key] === false || !title) {
            return;
        }
        this.titles[key] = { date: this.date, title, ...(prefix ? { prefix } : {}) };
    }

    private addLearningTitle(name: string, key: TitlesKeys, useGematria = false): void {
        if (this.config[key] === false) {
            return;
        }
        const event = DailyLearning.lookup(name, this.hDate, true);
        if (event) {
            let text = event.renderBrief('he-x-NoNikud');
            if (useGematria) {
                text = text.replace(/\d+/g, (n) => gematriya(Number(n)));
            }
            this.setTitle(key, text);
        }
    }

    private getBirkatLevanaTitle(): string {
        // Birkat HaLevana is recited from 7th to 15th of most Hebrew months, except Nisan and Tishrei.
        // In Av it is postponed until Motzei Tisha B'Av (night of 10 Av).
        const month = this.hDate.getMonth();
        const day = this.hDate.getDate();
        // Hebcal months: Nisan=1, Av=5, Tishrei=7.
        if (month === 1 || month === 7) {
            return '';
        }
        if (day < 7 || day > 15) {
            return '';
        }
        // In Av, only from the 10th (Motzei Tisha B'Av) onward.
        if (month === 5 && day < 10) {
            return '';
        }
        return 'ברכת הלבנה בערב';
    }

    private stripNikud(value: string): string {
        return value.replace(/[\u0591-\u05C7]/g, '');
    }

    private formatMevarchim(event: MevarchimChodeshEvent): string {
        const rendered = this.stripNikud(event.renderBrief('he-x-NoNikud'));
        const memo = event.memo;
        if (!memo) {
            return rendered;
        }

        const weekdays: Record<string, string> = {
            Sunday: 'ראשון',
            Monday: 'שני',
            Tuesday: 'שלישי',
            Wednesday: 'רביעי',
            Thursday: 'חמישי',
            Friday: 'שישי',
            Saturday: 'שבת',
        };
        const translatedMemo = this.stripNikud(memo
            .replace(/^Molad\s+[^:]+:\s*/, `מולד ${getMonthName(event.monthName)}: `)
            .replace(/\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/g, (day) => weekdays[day])
            .replace(/\band\b/g, 'ו-')
            .replace(/\bchalakim\b/g, 'חלקים'));
        return `${rendered} — ${translatedMemo}`;
    }

    private getAlHaNissimTitle(events: ReturnType<typeof HebrewCalendar.calendar>): string {
        if (events.some((item) => (item.mask & flags.CHANUKAH_CANDLES) !== 0)) {
            return TitlesTexts.AlHaNissimChanukah;
        }
        // Use basename() to match Purim / Erev Purim / Shushan Purim under one name.
        // Exclude Purim Katan using the holidayDesc constant.
        const isPurim = events.some((item) => {
            if (!(item instanceof HolidayEvent)) return false;
            const base = item.basename();
            return base === 'Purim' || item.getDesc() === holidayDesc.SHUSHAN_PURIM;
        });
        return isPurim ? TitlesTexts.AlHaNissimPurim : '';
    }

    private getHallelTitle(events: ReturnType<typeof HebrewCalendar.calendar>): string {
        // Use hebcal's built-in hallel logic (returns 0=none, 1=half, 2=whole).
        let level = HebrewCalendar.hallel(this.hDate, true);

        // hebcal's hallel_() recognizes descs starting with 'Sukkot'/'Chanukah'/'Shavuot' but
        // 'Shmini Atzeret' does NOT start with 'Sukkot', so hebcal returns 0 for 22 Tishrei.
        // Override: Shmini Atzeret has whole Hallel in Israel.
        if (level === 0 && events.some((item) => item instanceof HolidayEvent && item.getDesc() === holidayDesc.SHMINI_ATZERET)) {
            level = 2;
        }

        if (level === 2) return TitlesTexts.HallelFull;
        if (level === 1) return TitlesTexts.HallelHalf;
        return '';
    }

    getMoridHaGeshemStatus(): { title: 'מוריד הטל' | 'משיב הרוח ומריד הגשם'; titleKey: TitlesKeys } {
        const month = this.hDate.getMonth();
        const day = this.hDate.getDate();

        // Mashiv HaRuach: from Musaf of Shmini Atzeret (22 Tishrei)
        // through Musaf of first day of Pesach (15 Nisan).
        // Hebcal months: Nisan=1, Iyyar=2, ..., Elul=6, Tishrei=7, Cheshvan=8, ..., Adar=12, AdarII=13
        const isWinter =
            (month === 7 && day >= 22) ||   // Tishrei from 22
            (month >= 8 && month <= 13) ||  // Cheshvan through Adar/Adar II
            (month === 1 && day < 15);      // Nisan before 15

        if (isWinter) {
            return { title: 'משיב הרוח ומריד הגשם', titleKey: TitlesKeys.MashivAruach };
        }
        return { title: 'מוריד הטל', titleKey: TitlesKeys.MoridAtal };
    }

    getBarechAleinuStatus(): { title: 'ברך עלינו' | 'ברכנו'; titleKey: TitlesKeys } {
        const month = this.hDate.getMonth();
        const day = this.hDate.getDate();

        // Barech Aleinu (ברך עלינו) is said from 7 Cheshvan through 14 Nisan (Israel).
        // Hebcal months: Nisan=1, Cheshvan=8, Kislev=9, ..., Adar=12, AdarII=13
        const isWinter =
            (month === 8 && day >= 7) ||    // Cheshvan from 7
            (month >= 9 && month <= 13) ||  // Kislev through Adar/Adar II
            (month === 1 && day < 15);      // Nisan before 15

        if (isWinter) {
            return { title: 'ברך עלינו', titleKey: TitlesKeys.BarechAlino };
        }
        return { title: 'ברכנו', titleKey: TitlesKeys.Barechino };
    }
}
