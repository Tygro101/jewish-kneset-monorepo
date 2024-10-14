import { TimeDataHolder, TimesHolder, TypedMap, CitiesEnum } from "./shared-models";
import { HebrewCalendar, HDate, Location, Event, DailyLearning, flags } from '@hebcal/core';
import '@hebcal/learning';
import { getTimes, GetTimesResult } from 'sunCalc';
import { cities, nameConfiguration, shortNameConfiguration, timeOrderConfiguration } from "../time-calculation/consts";
import { calcAlotAshahar, calcGraSofBirkotShema, calcGraSofShema, calcMagenAvrahamSofBirkotKeriatShema, calcMagenAvrahamSofShema, calcMinchaGdola, calcMinchaKtana, calcNerotShabat, calcPlagMincha, calcShaaZmanit, calcShaaZmanitAroch, calcShaaZmanitMagenAvraham, calcTallitAndTefillin, calcTzetCochavimGeonim, calcTzetCochavimRabbenuTam, CalcTzetTzumKatan, calcTzetShabat, CalcTzetTzumGadol } from "../methods/calculation.methods";
import { AlotHaShaharKey, ChatzotLailahKey, ChatzotYomKey, NetzKey, ShkiahKey, TzetCochavimGeonimKey } from "../constants/times.keys";
import { DefaultOptions } from "../constants/calendar.options";
import { subDays } from "date-fns";



export class ZmaniAiom {
    private hebCalDay: HDate;
    private zmanim: GetTimesResult;
    private dayTimes: TypedMap<TimeDataHolder> = {};
    private shaaZmanit: number;
    private shaaZmanitAroch: number;
    private shaaZmanitMagenAvraham: number;
    private date: Date;

    constructor({ date, city = CitiesEnum.NETIVOT_NEVA_SHARON }: { date: Date, city?: string }) {
        this.hebCalDay = new HDate(date);
        this.zmanim = this.getSunCalc(date, city);
        this.date = date;
    }



    calculateTimes(): TypedMap<TimeDataHolder> {
        const calendar = HebrewCalendar.calendar({
            ...DefaultOptions,
            start: this.date,
            end: this.date,
        })
        //const learning = DailyLearning.lookup('dafYomi', this.hebCalDay, true);
        //const mishnaYomi = DailyLearning.lookup('mishnaYomi', this.hebCalDay, true);
        //const rambam1 = DailyLearning.lookup('rambam1', this.hebCalDay, true);
        //console.log(calendar);
        this.setTimeData(this.zmanim.sunriseEnd, NetzKey, this.dayTimes);
        this.setTimeData(this.zmanim.sunset, ShkiahKey, this.dayTimes);
        this.setTimeData(this.zmanim.solarNoon, ChatzotYomKey, this.dayTimes);
        this.setTimeData(this.zmanim.nadir, ChatzotLailahKey, this.dayTimes);

        this.shaaZmanit = calcShaaZmanit(this.zmanim.sunset, this.zmanim.sunriseEnd);
        this.addToDayTimes(calcTzetCochavimGeonim(this.zmanim.sunset, this.shaaZmanit));


        this.shaaZmanitAroch = calcShaaZmanitAroch(this.zmanim.sunriseEnd, this.dayTimes?.[TzetCochavimGeonimKey].date, this.shaaZmanit);

        this.addToDayTimes(calcAlotAshahar(this.zmanim.sunriseEnd, this.shaaZmanitAroch));
        this.addToDayTimes(calcTallitAndTefillin(this.zmanim.sunriseEnd, this.shaaZmanitAroch));

        this.shaaZmanitMagenAvraham = calcShaaZmanitMagenAvraham(this.zmanim.sunset, this.dayTimes?.[AlotHaShaharKey].date, this.shaaZmanit);

        this.addToDayTimes(calcMagenAvrahamSofShema(this.shaaZmanitMagenAvraham, this.dayTimes?.[AlotHaShaharKey].date));
        this.addToDayTimes(calcMagenAvrahamSofBirkotKeriatShema(this.shaaZmanitMagenAvraham, this.dayTimes?.[AlotHaShaharKey].date));

        this.addToDayTimes(calcGraSofShema(this.shaaZmanit, this.dayTimes?.[NetzKey].date));
        this.addToDayTimes(calcGraSofBirkotShema(this.shaaZmanit, this.dayTimes?.[NetzKey].date));

        this.addToDayTimes(calcMinchaGdola(this.shaaZmanit, this.dayTimes?.[ChatzotYomKey].date));
        this.addToDayTimes(calcMinchaKtana(this.shaaZmanit, this.dayTimes?.[NetzKey].date));
        this.addToDayTimes(calcPlagMincha(this.shaaZmanit, this.dayTimes?.[ShkiahKey].date));


        calendar.forEach(item => {
            if (item.mask & flags.LIGHT_CANDLES) {
                this.addToDayTimes(calcNerotShabat(this.dayTimes?.[ShkiahKey].date));
            }
            if (item.mask & flags.LIGHT_CANDLES_TZEIS) {
                this.addToDayTimes(calcTzetShabat(this.dayTimes?.[ShkiahKey].date));
                this.addToDayTimes(calcTzetCochavimRabbenuTam(this.zmanim.sunset, this.shaaZmanit));
            }
            if(item.mask & flags.MINOR_FAST){
                this.addToDayTimes(CalcTzetTzumKatan(this.dayTimes?.[ShkiahKey].date));
            }
            if(item.mask & flags.MAJOR_FAST){
                this.addToDayTimes(CalcTzetTzumKatan(this.dayTimes?.[ShkiahKey].date));
                this.addToDayTimes(CalcTzetTzumGadol(this.dayTimes?.[ShkiahKey].date, this.shaaZmanit));
            }
        });
        return this.dayTimes;
    }

    private getSunCalc(date: Date, city: string) {
        const cityLatLan = cities[city];
        return getTimes(date, cityLatLan.lat, cityLatLan.long);
    }

    private setTimeData(date: Date, key: string, dayTimes: TimesHolder) {
        dayTimes[key] = { date: date, name: nameConfiguration[key], shortName: shortNameConfiguration[key], order: timeOrderConfiguration[key] };
    }

    private addToDayTimes(res: TypedMap<Date>): void {
        Object.keys(res).forEach(key => {
            this.setTimeData(res[key], key, this.dayTimes);
        })
    }
}