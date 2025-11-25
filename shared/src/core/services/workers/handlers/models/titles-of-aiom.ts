import { CalOptions, HDate, HebrewCalendar, HolidayEvent, Locale, flags, gematriya } from "@hebcal/core";
import { CitiesEnum, IClockTitle } from "./shared-models";
import { DefaultOptions } from "../constants/calendar.options";
import '@hebcal/learning';
import { addDays, subDays } from "date-fns";
import { TitlesTexts } from "../constants/titles.text";
import { getMonthName, replaceAll } from "../methods/shared.methods";

export enum TitlesKeys {
    SefiratHaOmer = 'sefirat-haomer',
    BirkatLevana = 'birkat-levana',
    TachanunShacharit = 'tachanun-shacharit',
    TachanunMincha = 'tachanun-mincha',
    TachanunAll = 'tachanun-all',
    Tachanun = 'tachanun',
    TalRuach = 'tal-ruach',
    HebrewDate = 'hebrew-date',
    DafYomi = 'daf-yomi',
    Hag = 'hag',
    CholHamoed = 'chol-hamoed',
    ChanukahCandles = 'chanukah-candles',
    Tzum = 'tzum',
    Molad = 'molad',
    ShabbatMevarchim = 'shabbat-mevarchim',
    MishnaYomi = 'mishna-yomi',
    YerushalmiYomi = 'yerushalmi-yomi'

}

export enum TomorrowTitlesKeys {
    Tzum = 'tzum-machar'
}

export class TitlesAiom {
    private getBirkatLevanaTitle(): string {
        // Birkat HaLevana is recited from 7th to 15th of most Hebrew months, except Nisan and Tishrei
        const month = this.hDate.getMonth();
        const day = this.hDate.getDate();
        // Tishrei = 1, Nisan = 7 (hebcal months)
        if ((month !== 1 && month !== 7) && (day >= 7 && day <= 15)) {
            return 'אפשר לומר ברכת הלבנה';
        } else {
            return 'אין לומר ברכת הלבנה';
        }
    }
    private getTalRuachTitle(): string {
        const month = this.hDate.getMonth();
        const day = this.hDate.getDate();
        // Mashiv HaRuach: 22 Tishrei (Shemini Atzeret) to 15 Nisan (Pesach)
        // Morid HaTal: 15 Nisan to 22 Tishrei
        // Tishrei = 1, Nisan = 7 (hebcal months)
        if ((month > 1 && month < 7) || (month === 1 && day >= 22) || (month === 7 && day < 15)) {
            return 'משיב הרוח ומוריד הגשם';
        } else {
            return 'מוריד הטל';
        }
    }
    date: Date;
    hDate: HDate;
    titles: Partial<Record<TitlesKeys | TomorrowTitlesKeys, IClockTitle>> = {};
    constructor({ date, city = CitiesEnum.NETIVOT_NEVA_SHARON }: { date: Date, city?: string }) {
        this.hDate = new HDate(date);
        this.date = date;
    }

    calculateTitles(): any {
        // Add Birkat HaLevana detection
        const birkatLevanaTitle = this.getBirkatLevanaTitle();
        this.titles[TitlesKeys.BirkatLevana] = { date: this.date, title: birkatLevanaTitle };
        const todayCalendar = HebrewCalendar.calendar({ ...DefaultOptions, start: this.date, end: this.date, dailyLearning: { dafYomi: true, yerushalmi: true, rambam1: true } });
        const tomorrowCalendar = HebrewCalendar.calendar({ ...DefaultOptions, start: addDays(this.date, 1), end: addDays(this.date, 1) });

        const tachanunResult = HebrewCalendar.tachanun(this.hDate, true);
        const tachanunTitle = tachanunResult ? 'אומרים תחנון' : 'אין אומרים תחנון';
        this.titles[TitlesKeys.Tachanun] = { date: this.date, title: tachanunTitle };

        const shacharitTitle = tachanunResult.shacharit ? 'אומרים תחנון בשחרית' : 'אין אומרים תחנון בשחרית';
        this.titles[TitlesKeys.TachanunShacharit] = { date: this.date, title: shacharitTitle };

        const minchaTitle = tachanunResult.mincha ? 'אומרים תחנון במנחה' : 'אין אומרים תחנון במנחה';
        this.titles[TitlesKeys.TachanunMincha] = { date: this.date, title: minchaTitle };

        const allTitle = tachanunResult.allCongs ? 'אומרים תחנון בכל התפילות' : 'אין אומרים תחנון בכל התפילות';
        this.titles[TitlesKeys.TachanunAll] = { date: this.date, title: allTitle };

        const talRuachTitle = this.getTalRuachTitle();
        this.titles[TitlesKeys.TalRuach] = { date: this.date, title: talRuachTitle };

        todayCalendar.forEach((item => {
            if (item.mask & flags.HEBREW_DATE) {
                this.titles[TitlesKeys.HebrewDate] = { date: this.date, title: item.render('he-x-NoNikud') };
            }
            if (item.mask & flags.CHAG) {
                this.titles[TitlesKeys.Hag] = { date: this.date, title: item.renderBrief('he-x-NoNikud') };
            }
            if (item.mask & flags.CHOL_HAMOED) {
                this.titles[TitlesKeys.CholHamoed] = { date: this.date, title: item.renderBrief('he-x-NoNikud') };
            }
            if (item.mask & flags.CHANUKAH_CANDLES) {
                this.titles[TitlesKeys.ChanukahCandles] = { date: this.date, title: item.renderBrief('he-x-NoNikud') };
            }
            if (item.mask & flags.DAF_YOMI) {
                this.titles[TitlesKeys.DafYomi] = { date: this.date, title: item.renderBrief('he-x-NoNikud') };
            }
            if (item.mask & flags.MINOR_FAST || item.mask & flags.MAJOR_FAST) {
                this.titles[TitlesKeys.Tzum] = { date: this.date, title: item.renderBrief('he-x-NoNikud') };
            }
            if (item.mask & flags.MOLAD) {
                this.titles[TitlesKeys.Molad] = { date: this.date, title: item.renderBrief('he-x-NoNikud') };
            }
            if (item.mask & flags.SHABBAT_MEVARCHIM) {
                this.titles[TitlesKeys.ShabbatMevarchim] = { date: this.date, title: item.renderBrief('he-x-NoNikud') };
            }
            if (item.mask & flags.MISHNA_YOMI) {
                this.titles[TitlesKeys.MishnaYomi] = { date: this.date, title: item.renderBrief('he-x-NoNikud') };
            }
            if (item.mask & flags.YERUSHALMI_YOMI) {
                this.titles[TitlesKeys.YerushalmiYomi] = { date: this.date, title: item.renderBrief('he-x-NoNikud') };
            }
            if (item.mask & flags.OMER_COUNT) {
                this.titles[TitlesKeys.SefiratHaOmer] = { date: this.date, title: item.renderBrief('he-x-NoNikud') };
            }
        }));
        tomorrowCalendar.forEach((item => {
            switch (item.mask) {
                case (item.mask & flags.MINOR_FAST || item.mask & flags.MAJOR_FAST):
                    if (item instanceof HolidayEvent) {
                        this.titles[TomorrowTitlesKeys.Tzum] = {
                            date: this.date,
                            title: replaceAll(TitlesTexts.FastDate, { ['{יום}']: gematriya(item.date.dd), ['{חודש}']: getMonthName(item.date.getMonthName()) })
                        };
                    }

            }
        }));
        return this.titles;
    }
}