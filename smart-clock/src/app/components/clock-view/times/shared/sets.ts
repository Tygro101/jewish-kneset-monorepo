import { TypedMap, TypedObjectMap } from "@shared/models/shared";
import { AlotHaShaharKey, ChatzotYomKey, MinchaGdolaKey, NetzKey, PlagMinchaKey, SofBirkotKeriatShemaGraKey, SofBirkotKeriatShemaMagenAvrahamKey, SofShemaGraKey, SofShemaMagenAvrahamKey, TzetCochavimGeonimKey } from "@shared/core/services/workers/handlers/constants/times.keys";
import { differenceInMinutes } from "date-fns";
import { IsEnabled, MapProp, MultiMapProp, TimesProps } from "../TimesContainer";
import { MorningMapKey } from "./constants";

export const MorningSets = new Map();


const morningTrashHold = 4 * 60; // 4 hours
const noonTrashHold = 30;
const defaultFormat = 'k:m';

const generateMorningSets = (): { map: MapProp, isEnabled: IsEnabled } => {
    const isEnabled = (zmanim: TypedObjectMap<Date>): boolean => {
        const netz = zmanim[NetzKey];
        const diffInMinutes = differenceInMinutes(netz, new Date());
        if (diffInMinutes >= morningTrashHold) {
            return true;
        }
        return false;
    }
    const map: MapProp = new Map();
    map.set(AlotHaShaharKey, { format: defaultFormat, title: '' });
    map.set(NetzKey, { format: defaultFormat, title: '' });
    map.set(SofShemaMagenAvrahamKey, { format: defaultFormat, title: '' });
    map.set(SofShemaGraKey, { format: defaultFormat, title: '' });
    map.set(SofBirkotKeriatShemaMagenAvrahamKey, { format: defaultFormat, title: '' });
    map.set(SofBirkotKeriatShemaGraKey, { format: defaultFormat, title: '' });
    return { map, isEnabled };
}


const generateNoonSets = (): { map: MapProp, isEnabled: IsEnabled } => {
    const isEnabled = (zmanim: TypedObjectMap<Date>): boolean => {
        const gra = zmanim[SofBirkotKeriatShemaGraKey];
        const diffInMinutes = differenceInMinutes(gra, new Date());
        if (diffInMinutes >= noonTrashHold) {
            return true;
        }
        return false;
    }
    const map: MapProp = new Map();
    map.set(ChatzotYomKey, { format: defaultFormat, title: '' });
    map.set(MinchaGdolaKey, { format: defaultFormat, title: '' });
    map.set(PlagMinchaKey, { format: defaultFormat, title: '' });
    map.set(TzetCochavimGeonimKey, { format: defaultFormat, title: '' });
    return { map, isEnabled };
}


export const getBottomSets = () => {
    const props: Partial<TimesProps> = { isEnabled: new Map(), map: new Map()};
    const { map, isEnabled } = generateMorningSets();
    props.map.set(MorningMapKey, map);
    props.isEnabled.set(MorningMapKey, isEnabled);

    
    
}


