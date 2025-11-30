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
    MoridAtal = 'morid-atal',
    MashivAruach = 'mashiv-aruach',
    BarechAlino = 'barech-alino',
    Barechino = 'barechino',
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


    private city: string;
    date: Date;
    hDate: HDate;
    titles: Partial<Record<TitlesKeys | TomorrowTitlesKeys, IClockTitle>> = {};
    constructor({ date, city = CitiesEnum.NETIVOT_NEVA_SHARON }: { date: Date, city?: string }) {
        this.hDate = new HDate(date);
        this.date = date;
        this.city = city;
    }

    calculateTitles(): any {

        const todayCalendar = HebrewCalendar.calendar({ ...DefaultOptions, start: this.date, end: this.date, dailyLearning: { dafYomi: true, yerushalmi: true, rambam1: true } });
        const tomorrowCalendar = HebrewCalendar.calendar({ ...DefaultOptions, start: addDays(this.date, 1), end: addDays(this.date, 1) });


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
                this.titles[TitlesKeys.DafYomi] = { prefix: "בבלי יומי", date: this.date, title: item.renderBrief('he-x-NoNikud') };
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
                this.titles[TitlesKeys.YerushalmiYomi] = {prefix: "ירושלמי יומי", date: this.date, title: item.renderBrief('he-x-NoNikud') };
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
        // Add Birkat HaLevana detection
        const birkatLevanaTitle = this.getBirkatLevanaTitle();
        if (birkatLevanaTitle)
            this.titles[TitlesKeys.BirkatLevana] = { date: this.date, title: birkatLevanaTitle };
        const tachanunResult = HebrewCalendar.tachanun(this.hDate, true);
        const tachanunTitle = tachanunResult ? 'אומרים תחנון' : 'אין אומרים תחנון';
        if (!tachanunResult)
            this.titles[TitlesKeys.Tachanun] = { date: this.date, title: tachanunTitle };

        const shacharitTitle = tachanunResult.shacharit ? 'אומרים תחנון בשחרית' : 'אין אומרים תחנון בשחרית';
        if (!tachanunResult.shacharit)
            this.titles[TitlesKeys.TachanunShacharit] = { date: this.date, title: shacharitTitle };

        const minchaTitle = tachanunResult.mincha ? 'אומרים תחנון במנחה' : 'אין אומרים תחנון במנחה';
        if (!tachanunResult.mincha)
            this.titles[TitlesKeys.TachanunMincha] = { date: this.date, title: minchaTitle };

        const allTitle = tachanunResult.allCongs ? 'אומרים תחנון בכל התפילות' : 'אין אומרים תחנון בכל התפילות';
        if (!tachanunResult.allCongs)
            this.titles[TitlesKeys.TachanunAll] = { date: this.date, title: allTitle };

        const talRuach = this.getMoridHaGeshemStatus();
        // set specific key and legacy TalRuach for compatibility
        this.titles[talRuach.titleKey] = { date: this.date, title: talRuach.title };

        const barechinu = this.getBarechAleinuStatus();
        // set specific key and legacy BarechAlinoOrBarechino for compatibility
        this.titles[barechinu.titleKey] = { date: this.date, title: barechinu.title };
        return this.titles;
    }

    private getBirkatLevanaTitle(): string {
        // Birkat HaLevana is recited from 7th to 15th of most Hebrew months, except Nisan and Tishrei
        const month = this.hDate.getMonth();
        const day = this.hDate.getDate();
        // Tishrei = 1, Nisan = 7 (hebcal months)
        if ((month !== 1 && month !== 7) && (day >= 7 && day <= 15)) {
            return 'אפשר לומר ברכת הלבנה בערב';
        } else {
            return '';
        }
    }

    getMoridHaGeshemStatus(): { title: "מוריד הטל" | "משיב הרוח ומריד הגשם", titleKey: TitlesKeys } {

        const tishrei22 = new HDate(22, "Tishrei", this.hDate.getFullYear());
        const nisan15 = new HDate(15, "Nisan", this.hDate.getFullYear());

        if (this.hDate >= tishrei22 || this.hDate < nisan15) {
            return { title: "משיב הרוח ומריד הגשם", titleKey: TitlesKeys.MashivAruach };
        }

        return { title: "מוריד הטל", titleKey: TitlesKeys.MoridAtal };
    }

    getBarechAleinuStatus(): { title: "ברך עלינו" | "ברכנו", titleKey: TitlesKeys } {

        const cheshvan7 = new HDate(7, "Cheshvan", this.hDate.getFullYear());
        const nisan15 = new HDate(15, "Nisan", this.hDate.getFullYear());

        if (this.hDate >= cheshvan7 || this.hDate < nisan15) {
            return { title: "ברך עלינו", titleKey: TitlesKeys.BarechAlino };
        }

        return { title: "ברכנו", titleKey: TitlesKeys.Barechino };
    }


}