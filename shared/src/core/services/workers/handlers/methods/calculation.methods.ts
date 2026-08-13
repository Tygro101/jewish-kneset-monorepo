import { addMilliseconds, differenceInMilliseconds, subMilliseconds } from "date-fns";
import { HDate } from '@hebcal/core'
import { TypedMap } from "../models/shared-models";
import * as ShaaFactors from "../constants/calculations";
import { TzetCochavimGeonimKey, TzetCochavimRabinoTamKey, AlotHaShaharKey, TallitAndTefillinKey, SofShemaMagenAvrahamKey, SofBirkotKeriatShemaMagenAvrahamKey, SofShemaGraKey, SofBirkotKeriatShemaGraKey, MinchaGdolaKey, MinchaKtanaKey, PlagMinchaKey, TzetShabatKey, TzetTzumKatanKey, NerotShabatKey, TzetTzumGadolKey } from "../constants/times.keys";



// shaa zmanit

export const calcShaaZmanit = (sunset: Date, sunriseEnd: Date): number => {
    let duration = differenceInMilliseconds(sunset, sunriseEnd); // already in ms
    return duration / 12;
}

export const calcShaaZmanitAroch = (sunriseEnd: Date, tzatCochavimGeonim: Date, shaaZmanit: number): number => {
    const alotAshaharMaochar = subMilliseconds(sunriseEnd, shaaZmanit * ShaaFactors.ALOT_ASHAHAR_FACTOR);
    const shaaZmanitAroch = differenceInMilliseconds(tzatCochavimGeonim, alotAshaharMaochar) / 12;
    return shaaZmanitAroch;
}

export const calcShaaZmanitMagenAvraham = (sunset: Date, alotAshahar: Date, shaaZmanit: number) => {
    let date: Date = addMilliseconds(sunset, shaaZmanit * ShaaFactors.RABINO_TAM_FACTOR);
    date.setMinutes(date.getMinutes() + 2);
    return differenceInMilliseconds(date, alotAshahar) / 12;
}

//Tzet Cochavim

export const calcTzetCochavimRabbenuTam = (sunset: Date, shaaZmanit: number): TypedMap<Date> => {
    const date = addMilliseconds(sunset, shaaZmanit * ShaaFactors.RABINO_TAM_FACTOR);
    const addFactor = date.getSeconds() > 30 ? 3 : 2;
    date.setMinutes(date.getMinutes() + addFactor);
    return { [TzetCochavimRabinoTamKey]: date };
}

export const calcTzetCochavimGeonim = (sunset: Date, shaaZmanit: number): TypedMap<Date> => {
    const date = addMilliseconds(sunset, shaaZmanit * ShaaFactors.GEONIM_FACTOR);
    const addFactor = date.getSeconds() > 30 ? 4 : 3;
    date.setMinutes(date.getMinutes() + addFactor);
    return { [TzetCochavimGeonimKey]: date };
}


// alot Ha shahar
export const calcAlotAshahar = (sunriseEnd: Date, shaaZmanitAroch: number): TypedMap<Date> => {
    return { [AlotHaShaharKey]: subMilliseconds(sunriseEnd, shaaZmanitAroch * ShaaFactors.ALOT_ASHAHAR_FACTOR) };
}


// zman Tallit and Tefillin
export const calcTallitAndTefillin = (sunriseEnd: Date, shaaZmanitAroch: number): TypedMap<Date> => {
    return { [TallitAndTefillinKey]: subMilliseconds(sunriseEnd, ShaaFactors.TALLIT_TEFILLIN_FACTOR) }
}

// sof shema
export const calcMagenAvrahamSofShema = (shaaZmanitMagenAvraham: number, alotAshahar: Date): TypedMap<Date> => {
    return { [SofShemaMagenAvrahamKey]: addMilliseconds(alotAshahar, shaaZmanitMagenAvraham * ShaaFactors.MAGEN_AVRAHAM_SHMA_FACTOR) };
}
export const calcGraSofShema = (shaaZmanit: number, netz: Date): TypedMap<Date> => {
    const date: Date = addMilliseconds(netz, shaaZmanit * ShaaFactors.GRA_SHEMA_FACTOR);
    date.setMinutes(date.getMinutes() - 4);
    return { [SofShemaGraKey]: date }
}

// sof birkot shema
export const calcMagenAvrahamSofBirkotKeriatShema = (shaaZmanitMagenAvraham: number, alotAshahar: Date): TypedMap<Date> => {
    return { [SofBirkotKeriatShemaMagenAvrahamKey]: addMilliseconds(alotAshahar, shaaZmanitMagenAvraham * ShaaFactors.MAGEN_AVRAHAM_TFILA_FACTOR) };
}

export const calcGraSofBirkotShema = (shaaZmanit: number, netz: Date): TypedMap<Date> => {
    const date = addMilliseconds(netz, shaaZmanit * ShaaFactors.GRA_TFILA_FACTOR);
    date.setMinutes(date.getMinutes() - 4);
    return { [SofBirkotKeriatShemaGraKey]: date };
}


// Mincha 

export const calcMinchaGdola = (shaaZmanit: number, hatzotYom: Date): TypedMap<Date> => {
    const halfShaaMs = shaaZmanit * 0.5;
    const thirtyMinMs = ShaaFactors.MINCHA_GDOLA; // 30 * 60 * 1000
    return { [MinchaGdolaKey]: addMilliseconds(hatzotYom, Math.max(halfShaaMs, thirtyMinMs)) };
}

export const calcMinchaKtana = (shaaZmanit: number, netz: Date): TypedMap<Date> => {
    return { [MinchaKtanaKey]: addMilliseconds(netz, shaaZmanit * ShaaFactors.MINCHA_KETANA) };
}

export const calcPlagMincha = (shaaZmanit: number, shkiha: Date): TypedMap<Date> => {
    return { [PlagMinchaKey]: subMilliseconds(shkiha, shaaZmanit * ShaaFactors.PLAG_MINCHA) };
}


// nerot

export const calcNerotShabat = (shkiha: Date): TypedMap<Date> => {
    return {[NerotShabatKey]: subMilliseconds(shkiha, ShaaFactors.NEROT_SHABAT)};
}



// tzet 

export const calcTzetShabat = (shkiha: Date): TypedMap<Date> => {
    return { [TzetShabatKey]: addMilliseconds(shkiha, ShaaFactors.TZET_SHABAT) };
}
export const calcTzetShabatRabinoTam = (sunset: Date, shaaZmanit: number): TypedMap<Date> => {
    return calcTzetCochavimRabbenuTam(sunset, shaaZmanit);
}

export const CalcTzetTzumKatan = (shkiha: Date): TypedMap<Date> => {
    return {[TzetTzumKatanKey]: addMilliseconds(shkiha, ShaaFactors.TZET_TZUM)};
}

export const CalcTzetTzumGadol = (sunset: Date, shaaZmanit: number): TypedMap<Date> => {
    return {[TzetTzumGadolKey]: calcTzetCochavimRabbenuTam(sunset, shaaZmanit)[TzetCochavimRabinoTamKey]}
}


// helpers 

export const msToMinute = (ms: number): number => {
    return ms / 60000;
}
