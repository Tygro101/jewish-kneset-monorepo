import { TypedObjectMap } from "@shared/models/core";
import {
    AlotHaShaharKey,
    ChatzotYomKey,
    MinchaGdolaKey,
    NetzKey,
    PlagMinchaKey,
    SofBirkotKeriatShemaGraKey,
    SofBirkotKeriatShemaMagenAvrahamKey,
    SofShemaGraKey,
    SofShemaMagenAvrahamKey,
    TzetCochavimGeonimKey,
} from "@shared/core/services/workers/handlers/constants/times.keys";
import { differenceInMinutes } from "date-fns";
import { IsEnabled, MapProp } from "../TimesContainerHooks";
import { MorningMapKey } from "./constants";

export const MorningSets = new Map();

const morningTrashHold = 4 * 60;
const noonTrashHold = 30;
const defaultFormat = 'k:m';

const generateMorningSets = (): { map: MapProp; isEnabled: IsEnabled } => {
    const isEnabled = (zmanim: TypedObjectMap<Date>): boolean => {
        const netz = zmanim[NetzKey];
        const diffInMinutes = differenceInMinutes(netz, new Date());
        return diffInMinutes >= morningTrashHold;
    };
    const map: MapProp = new Map();
    map.set(AlotHaShaharKey, { format: defaultFormat, key: '' });
    map.set(NetzKey, { format: defaultFormat, key: '' });
    map.set(SofShemaMagenAvrahamKey, { format: defaultFormat, key: '' });
    map.set(SofShemaGraKey, { format: defaultFormat, key: '' });
    map.set(SofBirkotKeriatShemaMagenAvrahamKey, { format: defaultFormat, key: '' });
    map.set(SofBirkotKeriatShemaGraKey, { format: defaultFormat, key: '' });
    return { map, isEnabled };
};

const generateNoonSets = (): { map: MapProp; isEnabled: IsEnabled } => {
    const isEnabled = (zmanim: TypedObjectMap<Date>): boolean => {
        const gra = zmanim[SofBirkotKeriatShemaGraKey];
        const diffInMinutes = differenceInMinutes(gra, new Date());
        return diffInMinutes >= noonTrashHold;
    };
    const map: MapProp = new Map();
    map.set(ChatzotYomKey, { format: defaultFormat, key: '' });
    map.set(MinchaGdolaKey, { format: defaultFormat, key: '' });
    map.set(PlagMinchaKey, { format: defaultFormat, key: '' });
    map.set(TzetCochavimGeonimKey, { format: defaultFormat, key: '' });
    return { map, isEnabled };
};

export const getBottomSets = () => {
    const props = {
        isEnabled: new Map<string, IsEnabled>(),
        map: new Map<string, MapProp>(),
    };
    const { map, isEnabled } = generateMorningSets();
    props.map.set(MorningMapKey, map);
    props.isEnabled.set(MorningMapKey, isEnabled);
    return props;
};

void generateNoonSets;
