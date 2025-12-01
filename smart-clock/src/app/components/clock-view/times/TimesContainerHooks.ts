import { useEffect, useState } from "react";
import { TimeState } from "../../store/times/timesState";
import { TimesKeys } from "@shared/core/services/workers/handlers/constants/times.keys";
import { TypedObjectMap } from "@shared/models/core";

export type MapProp = Map<string, { key: string, format: string }>;
export type MultiMapProp = Map<string, MapProp>;
export type IsEnabled = (daytimes: TypedObjectMap<Date>) => boolean;
export type IsEnabledMap = Map<string, IsEnabled>;

const MORNING_KEY = 'morning';
const AFTER_NOON_KEY = 'after-noon'

type TimesMap = Array<{ main: TimesKeys, additions?: Array<TimesKeys> }>;

const timesMap: TypedObjectMap<TimesMap> = {
    [MORNING_KEY]: [
        { main: TimesKeys.ChatzotLailah },
        { main: TimesKeys.AlotHaShahar },
        { main: TimesKeys.TallitAndTefillin },
        { main: TimesKeys.Netz },
        { main: TimesKeys.SofShemaMagenAvraham, additions: [TimesKeys.SofShemaGra] },
        { main: TimesKeys.SofBirkotKeriatShemaMagenAvraham, additions: [TimesKeys.SofBirkotKeriatShemaGra] },
        { main: TimesKeys.ChatzotYom },
        { main: TimesKeys.MinchaGdola },
        { main: TimesKeys.MinchaKtana },
    ],
    [AFTER_NOON_KEY]: [
        { main: TimesKeys.ChatzotYom },
        { main: TimesKeys.MinchaGdola },
        { main: TimesKeys.MinchaKtana },
        { main: TimesKeys.PlagMincha },
        { main: TimesKeys.Shkiah },
        { main: TimesKeys.TzetCochavimGeonim, additions: [TimesKeys.TzetCochavimRabinoTam] },
        { main: TimesKeys.TzetShabat, additions: [TimesKeys.TzetCochavimRabinoTam] },
        { main: TimesKeys.ChatzotLailah}
    ]
};

export const getRelevantKey = (times: TimeState): TimesMap => {
    try {
        const now = new Date();
        const sofKey = TimesKeys.SofBirkotKeriatShemaMagenAvraham as unknown as string;
        const sofItem = times?.[sofKey];
        if (sofItem && sofItem.date) {
            const sofDate = new Date(sofItem.date);
            const threshold = new Date(sofDate.getTime() + 40 * 60 * 1000); // +40 minutes
            if (now > threshold) {
                return timesMap[MORNING_KEY];
            }
        }
    } catch (e) {
        // fallback to morning on any error
    }

    return timesMap[MORNING_KEY];
}

export const getClosestKeyIndex = (times: TimeState, relevantKeys: TimesMap): number => {
    const relevant = relevantKeys.length ? relevantKeys : getRelevantKey(times);
    const now = new Date().getTime();
    let closestIndex = -1;
    let smallestDiff = Number.POSITIVE_INFINITY;
    relevant.forEach((item, idx) => {
        const timeItem = times[item.main as unknown as string];
        if (!timeItem || !timeItem.date) return;
        const t = new Date(timeItem.date).getTime();
        const diff = Math.abs(t - now);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closestIndex = idx;
        }
    });
    return closestIndex;
}

export const useTimesContainerLogic = (times: TimeState) => {
    const [closestIndex, setClosestIndex] = useState<number>(-1);
    const [relevantKeys, setRelevantKeys] = useState<TimesMap>([]);

    useEffect(() => {
        const compute = () => {
            try {
                const relevant = getRelevantKey(times);
                setRelevantKeys(relevant);
                const idx = getClosestKeyIndex(times, relevant);
                setClosestIndex(idx);
            } catch (e) {
                setRelevantKeys([]);
                setClosestIndex(-1);
            }
        };
        compute();
        const id = setInterval(compute, 5 * 60 * 1000); // every 5 minutes
        return () => clearInterval(id);
    }, [times]);

    return { relevantKeys, closestIndex } as const;
}
