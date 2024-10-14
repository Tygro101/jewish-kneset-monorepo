

onmessage = (event) => {
  const times = calcDayTimesAndTitle({ date: new Date() });
  console.log(times);
  postMessage(times);
};

import { getTimes } from 'sunCalc';

import * as Hebcal from "hebcal";
import { add, addDays, addMilliseconds, differenceInMilliseconds, parse, subDays, subMilliseconds } from 'date-fns';
import { cities, hagFilter, hagNaming, titlesOrderConfiguration, nameConfiguration, shortNameConfiguration, timeOrderConfiguration, RABINO_TAM_FACTOR, GEONIM_FACTOR, ALOT_ASHAHAR_FACTOR, TALLIT_TEFILLIN_FACTOR, MAGEN_AVRAHAM_TFILA_FACTOR, MAGEN_AVRAHAM_SHMA_FACTOR, GRA_SHEMA_FACTOR, GRA_TFILA_FACTOR, MINCHA_GDOLA, MINCHA_KETANA, PLAG_MINCHA, NEROT_SHABAT, TZET_SHABAT, TZET_TZUM, tzumList } from './consts';
import { DayTimes, TimeDataHolder, TimesHolder, TitlesHolder, CitiesEnum } from '../models/shared-models';
import { getDayName, excludeHagName, msToMinute, tzum } from './help.methods';
import { getHag, getParasha } from './calc.methods';
import { MoladTitles } from '../heb';

//const lat = 31.274849; const long = 34.7935883; //באר שבע
//const lat = 31.421984; const long = 34.590653; //נתיבות



export const calcDayTimesAndTitle = (data: { date: Date, city?: string }): DayTimes => {
  if (!data.city) data.city = CitiesEnum.BEER_SHEVA;
  const date = data.date;
  const hebCalDay = Hebcal.HDate(date);
  var zmanim = getSunCalc(date, data.city);
  const times = calcTimes(zmanim, hebCalDay, date);
  const titles = {};// calcDayTitles(hebCalDay, data.city);
  return { times: times, dayTitles: titles };
}

export const getSunCalc = (date: Date, city: string) => {
  let cityLatLan = cities[city];
  const sunCalc = getTimes(date, cityLatLan.lat, cityLatLan.long); // TODO add elevation
  return sunCalc;
}

export const calcDayTitles = (hebCalDay: any, city: string): TitlesHolder => {
  const titles: TitlesHolder = {};
  setTitleData(titles, getDayName(hebCalDay.getDay())!, 'dayName', "LARGE");
  setTitleData(titles, Hebcal.gematriya(hebCalDay.day) + " " + hebCalDay.getMonthName('h') + " " + Hebcal.gematriya(hebCalDay.year), 'dateTitle', "MED");

  const parasha = getParasha(hebCalDay)
  if (hebCalDay.getDay() == 6 && parasha) {
    parasha.forEach(item => {
      setTitleData(titles, item, 'parasha', "MED");
    });
  }

  setTitleData(titles, "דף היומי - " + hebCalDay.dafyomi('h'), 'dafTitle', "MED");
  setTitleData(titles, 'זמני היום' + '   (' + city + ')', 'defaultTitle', "SMALL");
  if (6 - hebCalDay.getDay() + hebCalDay.getDate() === hebCalDay.daysInMonth()) {
    setTitleData(titles, 'שבת מברכין', 'shabat-mevarchem', "SMALL");
    const month = hebCalDay.getMonthObject().next();
    const molad = month.molad();
    console.log(month);
    console.log(molad);
    console.log(MoladTitles.molad.replace('${חודש}', month.getName(('h')).replace('${זמן}', '54')))
    setTitleData(titles,  MoladTitles.molad.replace('${חודש}', month.getName(('h')).replace('${זמן}', '54')), 'molad', "SMALL");

  }
  return titles;
}
/**
 * 
chalakim
: 
11
day
: 
Mon Sep 02 2024 01:53:36 GMT+0300 (Israel Daylight Time) {}
doy
: 
1
hour
: 
1
minutes
: 
5
 */

export const calcColumnTitles = (hebCalDay: any): TitlesHolder => {
  const titles: TitlesHolder = {};
  setTitleData(titles, getDayName(hebCalDay.getDay())!, 'dayName', 'mainHeader');
  setTitleData(titles, Hebcal.gematriya(hebCalDay.day) + " " + hebCalDay.getMonthName('h') + " " + Hebcal.gematriya(hebCalDay.year), 'dateTitle', "header");
  const parasha = getParasha(hebCalDay)
  if (hebCalDay.getDay() == 6 && parasha) {
    parasha.forEach((item: any) => {
      setTitleData(titles, "פרשת שבוע " + item, 'parasha', "header");
    });
  }

  const hag = getHag(hebCalDay);
  if (hag && hag.length) {
    hag.forEach((item, index) => {
      if (!hagFilter.includes(item)) {
        let title = hagNaming[item] ? hagNaming[item] : item;
        titles['hagTitle' + index] = { title: title, order: titlesOrderConfiguration['hagTitle'], size: "header" };
      }
    });
  }
  setTitleData(titles, 'סדר היום', 'defaultTitle', "header");
  return titles;
}






export const hasHagToday = (hebCalDay: any): boolean => {
  let hag = getHag(hebCalDay);
  return hag && !!hag.length;
}

export const filtrerUnHagDays = (array: Array<string>): Array<string> => {
  return array;
}


export const calcTimes = (zmanim: any, hebCalDay: any, date: Date): TimesHolder => {
  let dayTimes: { [key: string]: TimeDataHolder } = {};

  //zmanimObject.netz = { date: zmanim.sunriseEnd, name: "הנץ החמה", order: orderConfiguration['netz'] };
  setTimeData(zmanim.sunriseEnd, 'netz', dayTimes);
  setTimeData(zmanim.sunset, 'shkiha', dayTimes);
  setTimeData(zmanim.solarNoon, 'hatzotYom', dayTimes);
  setTimeData(zmanim.nadir, 'hatzotLila', dayTimes);

  const shaaZmanit = calcShaaZmanit(zmanim)

  calcTzetCochavim(zmanim, dayTimes, shaaZmanit, hebCalDay);

  const shaaZmanitAroch = calcShaaZmanitAroch(zmanim, dayTimes, shaaZmanit);
  calcAlotAshahar(zmanim, dayTimes, shaaZmanitAroch);
  calcTalitAndTfilinTime(zmanim, dayTimes, shaaZmanitAroch);

  const shaaZmanitMagenAvraham = calcShaaZmanitMagenAvraham(zmanim, dayTimes, shaaZmanit);

  calcMagenAvrahamTimes(dayTimes, shaaZmanitMagenAvraham);
  calcGraTimes(dayTimes, shaaZmanit);
  calcMinchaTimes(dayTimes, shaaZmanit);
  calcTzetShabatTime(dayTimes, date, hebCalDay);
  //calcNerotShabatTime(dayTimes, hebCalDay);
  //highlightZmanim(dayTimes);

  return dayTimes;
}

const setTimeData = (date: Date, key: string, dayTimes: TimesHolder) => {
  dayTimes[key] = { date: date, name: nameConfiguration[key], shortName: shortNameConfiguration[key], order: timeOrderConfiguration[key] };
}

const setTitleData = (titles: TitlesHolder, data: string, key: string, titleSize: string): void => {
  titles[key] = { title: data, order: titlesOrderConfiguration[key], size: titleSize, key };
}


export const highlightZmanim = (dayTimes: TimesHolder): any => {
  if (dayTimes.nerotShabat)
    dayTimes.nerotShabat.highlight = true;
  if (dayTimes.sofBirkotShmaGra)
    dayTimes.sofBirkotShmaGra.highlight = true;
  if (dayTimes.tzetShabat)
    dayTimes.tzetShabat.highlight = true;
  if (dayTimes.tzetTzom)
    dayTimes.tzetTzom.highlight = true;
}


export const calcShaaZmanit = (zmanim: any): number => {
  let duration = differenceInMilliseconds(zmanim.sunset, zmanim.sunriseEnd); // already in ms
  return duration / 12;
}

export const calcTzetCochavim = (zmanim: any, dayTimes: TimesHolder, shaaZmanit: number, hebCalDay: any): void => {
  let date: Date;
  let addFactor: number;
  const hag = getHag(hebCalDay);
  if (hebCalDay.getDay() === 6) {
    date = addMilliseconds(zmanim.sunset, shaaZmanit * RABINO_TAM_FACTOR);
    addFactor = date.getSeconds() > 30 ? 3 : 2;
    date.setMinutes(date.getMinutes() + addFactor);
    setTimeData(date, 'tzatCochavimRT', dayTimes);
  }

  date = addMilliseconds(zmanim.sunset, shaaZmanit * GEONIM_FACTOR);
  addFactor = date.getSeconds() > 30 ? 4 : 3;
  date.setMinutes(date.getMinutes() + addFactor);
  setTimeData(date, 'tzatCochavimG', dayTimes);
}

export const calcShaaZmanitAroch = (zmanim: any, dayTimes: TimesHolder, shaaZmanit: number): number => {
  const alotAshaharMaochar = subMilliseconds(zmanim.sunriseEnd, shaaZmanit * ALOT_ASHAHAR_FACTOR);
  const shaaZmanitAroch = differenceInMilliseconds(dayTimes.tzatCochavimG.date, alotAshaharMaochar) / 12;
  return shaaZmanitAroch;
}

export const calcAlotAshahar = (zmanim: any, dayTimes: TimesHolder, shaaZmanitAroch: number): void => {
  var date: Date = subMilliseconds(zmanim.sunriseEnd, shaaZmanitAroch * ALOT_ASHAHAR_FACTOR);
  setTimeData(date, 'alotAshahar', dayTimes);
}

export const calcTalitAndTfilinTime = (zmanim: any, dayTimes: TimesHolder, shaaZmanitAroch: number): void => {
  var date: Date = subMilliseconds(zmanim.sunriseEnd, shaaZmanitAroch * TALLIT_TEFILLIN_FACTOR);
  setTimeData(date, 'talitTfilin', dayTimes);
}

export const calcShaaZmanitMagenAvraham = (zmanim: any, dayTimes: TimesHolder, shaaZmanit: number) => {
  let date: Date = subMilliseconds(zmanim.sunset, shaaZmanit * RABINO_TAM_FACTOR);
  date.setMinutes(date.getMinutes() + 2);
  return differenceInMilliseconds(date, dayTimes.alotAshahar.date) / 12;
}

export const calcMagenAvrahamTimes = (dayTimes: TimesHolder, shaaZmanitMagenAvraham: number): void => {

  var date: Date = addMilliseconds(dayTimes.alotAshahar.date, shaaZmanitMagenAvraham * MAGEN_AVRAHAM_TFILA_FACTOR);
  setTimeData(date, 'sofBirkotSmaMagenAvraham', dayTimes);

  date = addMilliseconds(dayTimes.alotAshahar.date, shaaZmanitMagenAvraham * MAGEN_AVRAHAM_SHMA_FACTOR);
  setTimeData(date, 'sofShmaMagenAvraham', dayTimes);
}

export const calcGraTimes = (dayTimes: TimesHolder, shaaZmanit: number): void => {
  var date: Date = addMilliseconds(dayTimes.netz.date, shaaZmanit * GRA_SHEMA_FACTOR);
  date.setMinutes(date.getMinutes() - 4);
  setTimeData(date, 'sofShmaGra', dayTimes);

  date = addMilliseconds(dayTimes.netz.date, shaaZmanit * GRA_TFILA_FACTOR);
  date.setMinutes(date.getMinutes() - 4);
  setTimeData(date, 'sofBirkotShmaGra', dayTimes);
}

export const calcMinchaTimes = (dayTimes: TimesHolder, shaaZmanit: number): void => {
  let date: Date = addMilliseconds(dayTimes.hatzotYom.date, (msToMinute(shaaZmanit)) * 0.5 > 30 ? msToMinute(shaaZmanit) * 0.5 : MINCHA_GDOLA);
  setTimeData(date, 'minchaGedola', dayTimes);

  date = addMilliseconds(dayTimes.netz.date, shaaZmanit * MINCHA_KETANA);
  setTimeData(date, 'minchaKetana', dayTimes);

  date = subMilliseconds(dayTimes.shkiha.date, shaaZmanit * PLAG_MINCHA);
  setTimeData(date, 'plagMincha', dayTimes);
}

export const calcNerotShabatTime = (dayTimes: TimesHolder, hebCalDay: any): void => {
  if (hebCalDay.candleLighting() !== null) {
    const date = subMilliseconds(dayTimes.shkiha.date, NEROT_SHABAT);
    setTimeData(date, 'nerotShabat', dayTimes);
  }
}

export const calcTzetShabatTime = (dayTimes: TimesHolder, date: Date, hebCalDay: any): void => {
  if (date.getDay() === 6) {
    var date: Date = addMilliseconds(dayTimes.shkiha.date, TZET_SHABAT);
    setTimeData(date, 'tzetShabat', dayTimes);
  }

  if (hasTzum(hebCalDay, date)) {
    if (hebCalDay.getMonthName() !== "תשרי" || hebCalDay.getDate() != 10) {
      date = addMilliseconds(dayTimes.shkiha.date, TZET_TZUM);
      setTimeData(date, 'tzetTzom', dayTimes);
    }
  }
}

export const roundUp = (date: Date, factor: number): Date => {// do this in pipe??
  if (date && date.getSeconds() > 20) {
    date.setMinutes(date.getMinutes() + 1);
  }
  date.setMinutes(date.getMinutes() + factor);
  return date;
}

export function hasTzum(hebCalDay: any, date: Date): boolean {
  return false;
  let flag = false;
  const holidays = hebCalDay.holidays();
  holidays.forEach((item: any) => {
    let hag = item.desc[2];
    if (tzumList.includes(hag)) flag = true;
  })
  return flag;
  let tzumValue: boolean = tzum(hebCalDay.getMonthName(), Hebcal.gematriya(hebCalDay.getDate() - 1)) || tzum(hebCalDay.getMonthName(), Hebcal.gematriya(hebCalDay.getDate() - 2));
  if (tzumValue && date.getDay() === 0) {
    return true;
  }
  if (hebCalDay.getMonthName() === "אדר" || hebCalDay.getMonthName() === "אדר ב'") {
    if (hebCalDay.getDate() === 11 && date.getDay() == 5) {
      return true;
    }
  }
  return tzum(hebCalDay.getMonthName(), Hebcal.gematriya(hebCalDay.getDate()))
}


export const getDayHebDate = (date: string) => {
  const dateObject: Date = parse(date, 'dd-MM-yyyy', 0);
  const hebCalDate = Hebcal.HDate(dateObject);
  return Hebcal.gematriya(hebCalDate.day) + " " + hebCalDate.getMonthName('h');
}
//output functions

export const getTzetKochavimGihunim = (date: Date, city: string = CitiesEnum.BEER_SHEVA): Date => {
  const zmanim = getSunCalc(date, city);
  const shaaZmanit = calcShaaZmanit(zmanim);
  date = addMilliseconds(zmanim.sunset, shaaZmanit * GEONIM_FACTOR);
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





