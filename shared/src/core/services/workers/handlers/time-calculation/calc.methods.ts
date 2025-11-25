import { addMilliseconds, differenceInMilliseconds, parse, subMilliseconds, setMonth, setDay } from "date-fns";
import { excludeHagName, msToMinute, tzum } from "./help.methods";
import * as ShaaFactors from "../constants/calculations";
import { TypedMap, TimesHolder, CitiesEnum } from "../models/shared-models";
import { getSunCalc } from "./timeCalculations";
import { HebrewCalendar, HDate, Location, Event, gematriya, OmerEvent, CalOptions, Locale } from '@hebcal/core';
import * as Hebcal from "hebcal";
import { omerTodayIs, HDate as hebcalDate } from '@hebcal/hdate';


const temp = new HDate(setDay(setMonth(new Date(), 5), 12))
const calendar = HebrewCalendar.calendar({
    omer: true,
    year: 2024,
    //location: Location.lookup('Jerusalem'),
    //candlelighting: true,
    il: true,
    //start: temp,
    molad: true,
    //end: temp,
    locale: 'ashkenazi'
});

export const getParasha = (hebCalDay: any): string[] | undefined => {
    var parasha = hebCalDay.getSedra('h');
    if (parasha.length > 0 && hebCalDay.getDay() == 6 && excludeHagName(parasha[0])) {
        return parasha;
    }
    return undefined;
}


export const calcShaaZmanitAroch = (zmanim: any, tzatCochavimG: Date, shaaZmanit: number): number => {
    const alotAshaharMaochar = subMilliseconds(zmanim.sunriseEnd, shaaZmanit * ShaaFactors.ALOT_ASHAHAR_FACTOR);
    const shaaZmanitAroch = differenceInMilliseconds(tzatCochavimG, alotAshaharMaochar) / 12;
    return shaaZmanitAroch;
}

export const calcShaaZmanit = (zmanim: any): number => {
    let duration = differenceInMilliseconds(zmanim.sunset, zmanim.sunriseEnd); // already in ms
    return duration / 12;
}


export const calcTzetCochavim = (zmanim: any, shaaZmanit: number, hebCalDay: any): TypedMap<Date> => {
    let date: Date;
    let addFactor: number;
    const res = {};
    if (hebCalDay.getDay() === 6) {
        date = addMilliseconds(zmanim.sunset, shaaZmanit * ShaaFactors.RABINO_TAM_FACTOR);
        addFactor = date.getSeconds() > 30 ? 3 : 2;
        date.setMinutes(date.getMinutes() + addFactor);
        res['tzatCochavimRT'] = date
    }

    date = addMilliseconds(zmanim.sunset, shaaZmanit * ShaaFactors.GEONIM_FACTOR);
    addFactor = date.getSeconds() > 30 ? 4 : 3;
    date.setMinutes(date.getMinutes() + addFactor);
    res['tzatCochavimG'] = date
    return res;
}


export const calcAlotAshahar = (zmanim: any, shaaZmanitAroch: number): TypedMap<Date> => {
    var date: Date = subMilliseconds(zmanim.sunriseEnd, shaaZmanitAroch * ShaaFactors.ALOT_ASHAHAR_FACTOR);
    return { 'alotAshahar': date };
}

export const calcTalitAndTfilinTime = (zmanim: any, shaaZmanitAroch: number): TypedMap<Date> => {
    var date: Date = subMilliseconds(zmanim.sunriseEnd, shaaZmanitAroch * ShaaFactors.TALLIT_TEFILLIN_FACTOR);
    return { 'talitTfilin': date }
}

export const calcShaaZmanitMagenAvraham = (zmanim: any, alotAshahar: Date, shaaZmanit: number) => {
    let date: Date = subMilliseconds(zmanim.sunset, shaaZmanit * ShaaFactors.RABINO_TAM_FACTOR);
    date.setMinutes(date.getMinutes() + 2);
    return differenceInMilliseconds(date, alotAshahar) / 12;
}

export const calcMagenAvrahamTimes = (shaaZmanitMagenAvraham: number, alotAshahar: Date): TypedMap<Date> => {
    const res: TypedMap<Date> = {};
    var date: Date = addMilliseconds(alotAshahar, shaaZmanitMagenAvraham * ShaaFactors.MAGEN_AVRAHAM_TFILA_FACTOR);
    res['sofBirkotSmaMagenAvraham'] = date;

    date = addMilliseconds(alotAshahar, shaaZmanitMagenAvraham * ShaaFactors.MAGEN_AVRAHAM_SHMA_FACTOR);
    res['sofShmaMagenAvraham'] = date;
    return res;
}

export const calcGraTimes = (shaaZmanit: number, netz: Date): TypedMap<Date> => {
    const res: TypedMap<Date> = {};
    var date: Date = addMilliseconds(netz, shaaZmanit * ShaaFactors.GRA_SHEMA_FACTOR);
    date.setMinutes(date.getMinutes() - 4);
    res['sofShmaGra'] = date;

    date = addMilliseconds(netz, shaaZmanit * ShaaFactors.GRA_TFILA_FACTOR);
    date.setMinutes(date.getMinutes() - 4);
    res['sofBirkotShmaGra'] = date;
    return res;
}

export const calcMinchaTimes = (shaaZmanit: number, hatzotYom: Date, netz: Date, shkiha: Date): TypedMap<Date> => {
    const res: TypedMap<Date> = {};
    let date: Date = addMilliseconds(hatzotYom, (msToMinute(shaaZmanit)) * 0.5 > 30 ? msToMinute(shaaZmanit) * 0.5 : ShaaFactors.MINCHA_GDOLA);
    res['minchaGedola'] = date;

    date = addMilliseconds(netz, shaaZmanit * ShaaFactors.MINCHA_KETANA);
    res['minchaKetana'] = date;

    date = subMilliseconds(shkiha, shaaZmanit * ShaaFactors.PLAG_MINCHA);
    res['plagMincha'] = date;
    return res;
}

export const calcNerotShabatTime = (hebCalDay: any, shkiha: Date): TypedMap<Date> => {
    const res: TypedMap<Date> = {};
    if (hebCalDay?.candleLighting?.() !== null) {
        const date = subMilliseconds(shkiha, ShaaFactors.NEROT_SHABAT);
        res['nerotShabat'] = date;
    }
    return res;
}

export const calcTzetShabatTime = (date: Date, shkiha: Date, hebCalDay: any): TypedMap<Date> => {
    const res: TypedMap<Date> = {};
    if (date.getDay() === 6) {
        var date: Date = addMilliseconds(shkiha, ShaaFactors.TZET_SHABAT);
        res['tzetShabat'] = date;
    }

    if (hasTzum(hebCalDay, date)) {
        if (hebCalDay.getMonthName() !== "תשרי" || hebCalDay.getDate() != 10) {
            date = addMilliseconds(shkiha, ShaaFactors.TZET_TZUM);
            res['tzetTzom'] = date;
        }
    }
    return res;
}

export const roundUp = (date: Date, factor: number): Date => {// do this in pipe??
    if (date && date.getSeconds() > 20) {
        date.setMinutes(date.getMinutes() + 1);
    }
    date.setMinutes(date.getMinutes() + factor);
    return date;
}

export function hasTzum(hebCalDay: any, date: Date): boolean {
    let flag = false;
    const holidays = hebCalDay?.holidays?.() ?? [];
    holidays.forEach((item: any) => {
        let hag = item.desc[2];
        if (ShaaFactors.tzumList.includes(hag)) flag = true;
    })
    return flag;
    let tzumValue: boolean = tzum(hebCalDay.getMonthName(), gematriya(hebCalDay.getDate() - 1)) || tzum(hebCalDay.getMonthName(), gematriya(hebCalDay.getDate() - 2));
    if (tzumValue && date.getDay() === 0) {
        return true;
    }
    if (hebCalDay.getMonthName() === "אדר" || hebCalDay.getMonthName() === "אדר ב'") {
        if (hebCalDay.getDate() === 11 && date.getDay() == 5) {
            return true;
        }
    }
    return tzum(hebCalDay.getMonthName(), gematriya(hebCalDay.getDate()))
}


export const getDayHebDate = (date: string) => {
    const dateObject: Date = parse(date, 'dd-MM-yyyy', 0);
    const hebCalDate = new HDate(dateObject);
    return gematriya(hebCalDate.getDay()) + " " + hebCalDate.getMonthName();
}
//output functions

export const getTzetKochavimGihunim = (date: Date, city: string = CitiesEnum.BEER_SHEVA): Date => {
    const zmanim = getSunCalc(date, city);
    const shaaZmanit = calcShaaZmanit(zmanim);
    date = addMilliseconds(zmanim.sunset, shaaZmanit * ShaaFactors.GEONIM_FACTOR);
    const addFactor = date.getSeconds() > 30 ? 4 : 3;
    date.setMinutes(date.getMinutes() + addFactor);
    return date;
}

export const getNetzTime = (date: Date, city: string = CitiesEnum.BEER_SHEVA): Date => {
    return getSunCalc(date, city).sunriseEnd;
}

export const getHatzotTime = (date: Date, city: string = CitiesEnum.BEER_SHEVA): Date => {
    return getSunCalc(date, city).solarNoon;
}

export const getShkeaaTime = (date: Date, city: string = CitiesEnum.BEER_SHEVA): Date => {
    return getSunCalc(date, city).sunset;
}


export const getHag = (hebCalDay: any): string[] => {


    let hag;
    try {
        hag = hebCalDay.holidays('h');
    } catch (e) {
        hag = HebrewCalendar.getHolidaysOnDate(hebCalDay) ?? [];
    }

    let res: string[] = [];
    hag = hag.reverse();
    hag.forEach((element: any) => {
        if (!ShaaFactors.hagFilter.includes(element.desc[2]) && element.desc[2].indexOf("שבת") == -1 && res.indexOf(element.desc[2]) == -1 && excludeHagName(element.desc[2])) {
            res.push(element.desc[2]);
        }
    });
    try {
        if (hebCalDay.omer() !== 0) {
            res.push(Hebcal.gematriya(hebCalDay.omer()) + " לעומר")
        }
    } catch (e) {


        console.log(calendar);
    }

    return res;
}
