import { AlotHaShaharKey, ChatzotLailahKey, ChatzotYomKey, MinchaGdolaKey, MinchaKtanaKey, NerotShabatKey, NetzKey, PlagMinchaKey, ShkiahKey, SofBirkotKeriatShemaGraKey, SofBirkotKeriatShemaMagenAvrahamKey, SofShemaGraKey, SofShemaMagenAvrahamKey, TallitAndTefillinKey, TzetCochavimGeonimKey, TzetCochavimRabinoTamKey, TzetShabatKey, TzetTzumGadolKey, TzetTzumKatanKey } from "../constants/times.keys"
import { CitiesEnum } from "../models/shared-models"

export const cities: { [key: string]: { lat: number, long: number, elevation?: number } } = {
    [CitiesEnum.BEER_SHEVA]: { lat: 31.274849, long: 34.7935883 },
    [CitiesEnum.NETIVOT]: { lat: 31.421984, long: 34.7935883, elevation: 11 },
    [CitiesEnum.NETIVOT_NEVA_SHARON]: { lat: 31.437633, long: 34.580977 },
    [CitiesEnum.JERUSALEM]: { lat: 31.770325, long: 35.213941 },
    [CitiesEnum.HIFA]: { lat: 32.806845, long: 34.988085 },
    [CitiesEnum.OFAKIM]: { lat: 31.310456, long: 34.623100 },
    [CitiesEnum.TEL_AVIV]: { lat: 32.083189, long: 34.781179 },
    [CitiesEnum.TZFAT]: { lat: 32.959801, long: 35.492454 }
}
export const tzumList = ["תענית אסתר", "צום יז' בתמוז", "צום גדליה", "תשעה באב", "עשרה בטבת"]
export const timeOrderConfiguration: { [key: string]: number } = {
    alotAshahar: 1,
    talitTfilin: 2,
    netz: 3,
    sofShmaMagenAvraham: 4,
    sofShmaGra: 5,
    sofBirkotSmaMagenAvraham: 6,
    sofBirkotShmaGra: 7,
    hatzotYom: 8,
    minchaGedola: 9,
    minchaKetana: 10,
    plagMincha: 11,
    nerotShabat: 12,
    shkiha: 13,
    tzatCochavimG: 14,
    tzetTzom: 15,
    tzetShabat: 16,
    tzatCochavimRT: 17,
    hatzotLila: 18

}




export const titlesOrderConfiguration: { [key: string]: number } = {
    dayName: 0,
    dateTitle: 1,
    parasha: 2,
    hagTitle: 4,
    dafTitle: 5,
    defaultTitle: 6,
}

export const nameConfiguration: { [key: string]: string } = {
    [AlotHaShaharKey]: "עלות השחר",
    [TallitAndTefillinKey]: "זמן ציצית ותפילין",
    [NetzKey]: "הנץ החמה",
    [SofShemaMagenAvrahamKey]: 'ס"ז ק"ש מ"א',
    [SofShemaGraKey]: 'סוף זמן ק"ש',
    [SofBirkotKeriatShemaMagenAvrahamKey]: 'ס"ז תפילה מ"א',
    [SofBirkotKeriatShemaGraKey]: 'ס"ז תפילה',
    [MinchaGdolaKey]: "מנחה גדולה",
    [MinchaKtanaKey]: "מנחה קטנה",
    [PlagMinchaKey]: "פלג מנחה",
    [NerotShabatKey]: "הדלקת נרות",
    [ShkiahKey]: "שקיעה",
    [TzetCochavimGeonimKey]: "צאת כוכבים",
    [TzetTzumGadolKey]: "צאת צום",
    [TzetTzumKatanKey]: "צאת צום",
    [TzetShabatKey]: "צאת שבת",
    [TzetCochavimRabinoTamKey]: "רבינו תם",
    [ChatzotYomKey]: "חצות יום",
    [ChatzotLailahKey]: "חצות לילה"
}
export const shortNameConfiguration: { [key: string]: string } = {
    [AlotHaShaharKey]: "עלות השחר",
    [TallitAndTefillinKey]: 'זמן צו"ת',
    [NetzKey]: "הנץ החמה",
    [SofShemaMagenAvrahamKey]: 'ס"ז ק"ש מ"א',
    [SofShemaGraKey]: 'סוף זמן ק"ש',
    [SofBirkotKeriatShemaMagenAvrahamKey]: 'סז"ת מ"א',
    [SofBirkotKeriatShemaGraKey]: 'ס"ז תפילה',
    [MinchaGdolaKey]: "מנחה גדולה",
    [MinchaKtanaKey]: "מנחה קטנה",
    [PlagMinchaKey]: "פלג מנחה",
    [NerotShabatKey]: "הדלקת נרות",
    [ShkiahKey]: "שקיעה",
    [TzetCochavimGeonimKey]: "צאת כוכבים",
    [TzetTzumGadolKey]: "צאת צום",
    [TzetTzumKatanKey]: "צאת צום",
    [TzetShabatKey]: "צאת שבת",
    [TzetCochavimRabinoTamKey]: "רבינו תם",
    [ChatzotYomKey]: "חצות יום",
    [ChatzotLailahKey]: "חצות לילה"
}

export const generalNameConfiguration: { [key: string]: string } = {
    [SofShemaMagenAvrahamKey]: 'סוף זמן ק"ש',
    [SofShemaGraKey]: 'סוף זמן ק"ש',
    [SofBirkotKeriatShemaMagenAvrahamKey]:'ס"ז תפילה',
    [SofBirkotKeriatShemaGraKey]: 'ס"ז תפילה',
}


export const MILLISECONDS: number = 1000;
export const GEONIM_FACTOR: number = 0.225;
export const RABINO_TAM_FACTOR: number = 1.2;
export const ALOT_ASHAHAR_FACTOR: number = 1.2;
export const TALLIT_TEFILLIN_FACTOR: number = 60 * 60 * MILLISECONDS;
export const MAGEN_AVRAHAM_SHMA_FACTOR: number = 3; // the day starts from alot ashahar.
export const GRA_SHEMA_FACTOR: number = 3; // the day starts from anitz.
export const MAGEN_AVRAHAM_TFILA_FACTOR: number = 4; // the day starts from alot ashahar.
export const GRA_TFILA_FACTOR: number = 4; // the day starts from anitz.
export const MINCHA_GDOLA: number = 30 * 60 * MILLISECONDS; // static time not (timed time) after solar noon.
export const MINCHA_KETANA: number = 9.5;
export const PLAG_MINCHA: number = 1.025; // befor sunset (shkiaa). (culd be 1.025?)
export const NEROT_SHABAT: number = 20 * 60 * MILLISECONDS; // static time.
export const TZET_SHABAT: number = 32 * 60 * MILLISECONDS; // static time (maybe need to be timed time).
export const TZET_TZUM: number = 20 * 60 * MILLISECONDS; // static time.



export const hagFilter = ['ט"ו בשבט', 'שבת', "פסח יום ב'", "פסח יום א'", "סוכות יום ב'"]

export const hagNaming: { [key: string]: string } = {}
hagNaming[`פסח יום ב' )חוה"מ(`] = `פסח יום ב' (חוה"מ)`;
hagNaming[`פסח יום ג' )חוה"מ(`] = `פסח יום ג' (חוה"מ)`;
hagNaming[`פסח יום ד' )חוה"מ(`] = `פסח יום ד' (חוה"מ)`;
hagNaming[`פסח יום ה' )חוה"מ(`] = `פסח יום ה' (חוה"מ)`;
hagNaming[`פסח יום ו' )חוה"מ(`] = `פסח יום ו' (חוה"מ)`;
hagNaming[`סוכות יום ב' )חוה"מ(`] = `סוכות יום ב' (חוה"מ)`;
hagNaming[`סוכות יום ג' )חוה"מ(`] = `סוכות יום ג' (חוה"מ)`;
hagNaming[`סוכות יום ד' )חוה"מ(`] = `סוכות יום ד' (חוה"מ)`;
hagNaming[`סוכות יום ה' )חוה"מ(`] = `סוכות יום ה' (חוה"מ)`;
hagNaming[`סוכות יום ו' )חוה"מ(`] = `סוכות יום ו' (חוה"מ)`;

