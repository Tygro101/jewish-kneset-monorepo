import { CalOptions, HDate, HebrewCalendar, HolidayEvent, Locale, flags, gematriya } from "@hebcal/core";
import { CitiesEnum, IClockTitle } from "./shared-models";
import { DefaultOptions } from "../constants/calendar.options";
import '@hebcal/learning';
import { addDays, subDays } from "date-fns";
import { TitlesTexts } from "../constants/titles.text";
import { getMonthName, replaceAll } from "../methods/shared.methods";

export enum TitlesKeys {
    HebrewDate = 'hebrew-date',
    DafYomi = 'daf-yomi',
    Hag = 'hag',
    CholHamoed = 'chol-hamoed',
    ChanukahCandles = 'chanukah-candles',
    Tzum = 'tzum'

}

export enum TomorrowTitlesKeys {
    Tzum = 'tzum-machar'
}

export class TitlesAiom {
    date: Date;
    hDate: HDate;
    titles = new Map<TitlesKeys | TomorrowTitlesKeys, IClockTitle>;
    constructor({ date, city = CitiesEnum.NETIVOT_NEVA_SHARON }: { date: Date, city?: string }) {
        this.hDate = new HDate(date);
        this.date = date;
    }

    calculateTitles(): any {
        const todayCalendar = HebrewCalendar.calendar({ ...DefaultOptions, start: this.date, end: this.date, dailyLearning: { dafYomi: true, yerushalmi: true, rambam1: true } });
        const tomorrowCalendar = HebrewCalendar.calendar({ ...DefaultOptions, start: addDays(this.date, 1), end: addDays(this.date, 1) });
        todayCalendar.forEach((item => {
            switch (item.mask) {
                case (item.mask & flags.HEBREW_DATE):
                    this.titles.set(TitlesKeys.HebrewDate, { date: this.date, title: item.renderBrief('he-x-NoNikud') });
                    break;
                case (item.mask & flags.CHAG):
                    this.titles.set(TitlesKeys.Hag, { date: this.date, title: item.renderBrief('he-x-NoNikud') });
                    break;
                case (item.mask & flags.CHOL_HAMOED):
                    this.titles.set(TitlesKeys.CholHamoed, { date: this.date, title: item.renderBrief('he-x-NoNikud') });
                    break;
                case (item.mask & flags.CHANUKAH_CANDLES):
                    this.titles.set(TitlesKeys.ChanukahCandles, { date: this.date, title: item.renderBrief('he-x-NoNikud') });
                    break;
                case (item.mask & flags.DAF_YOMI):
                    this.titles.set(TitlesKeys.DafYomi, { date: this.date, title: item.renderBrief('he-x-NoNikud') });
                    break;
                case (item.mask & flags.MINOR_FAST || item.mask & flags.MAJOR_FAST):
                    this.titles.set(TitlesKeys.Tzum, { date: this.date, title: item.renderBrief('he-x-NoNikud') });
            }
        }));
        tomorrowCalendar.forEach((item => {
            switch (item.mask) {
                case (item.mask & flags.MINOR_FAST || item.mask & flags.MAJOR_FAST):
                    if (item instanceof HolidayEvent) {
                        this.titles.set(TomorrowTitlesKeys.Tzum, {
                            date: this.date,
                            title: replaceAll(TitlesTexts.FastDate, { ['{יום}']: gematriya(item.date.dd), ['{חודש}']: getMonthName(item.date.getMonthName()) })
                        });
                    }

            }
        }));
        return this.titles;
    }
}