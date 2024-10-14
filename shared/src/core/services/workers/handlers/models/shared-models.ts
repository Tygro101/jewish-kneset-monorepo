export enum CitiesEnum {
    BEER_SHEVA = "באר שבע",
    NETIVOT = "נתיבות",
    NETIVOT_NEVA_SHARON = "נתיבות נווה שרון",
    OFAKIM = "אופקים",
    JERUSALEM = "ירושלים",
    TEL_AVIV = "תל אביב",
    HIFA = "חיפה",
    TZFAT = "צפת"
  }
  

  export type DayTimes = {
    times: TimesHolder,
    dayTitles: TitlesHolder
  }
  
  export type TimesHolder = { [key: string]: TimeDataHolder };
  
  export type TitlesHolder = { [key: string]: TitleDataHolder };
  
  export interface TitleDataHolder {
    title: string;
    order: number;
    size?: string;
    key?: string;
    notation?: boolean;
  }
  
  export interface TimeDataHolder {
    date: Date;
    name: string;
    shortName?: string;
    highlight?: boolean;
    order: number;
  }

  export interface IClockTitle{
    date: Date;
    title: string;
  }
