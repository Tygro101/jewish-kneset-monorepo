import { Locale } from "@hebcal/core";

export const getMonthName = (englishMonth: string, nikud: boolean = false)=>{
    const monthName0 = Locale.gettext(englishMonth, nikud ? 'he' : 'he-x-nonikud');
    return monthName0.replace(/'/g, '’');
}

export const replaceAll = (str: string, attr: {[key: string]: string}) => {
    return Object.keys(attr).reduce((res, key) => res.replace(key, attr[key]), str);
}