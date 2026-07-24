import { useEffect, useState } from "react";
import { TimeState } from "../../store/times/timesState";
import { TimesKeys } from "@shared/core/services/workers/handlers/constants/times.keys";
import { TypedObjectMap } from "@shared/models/core";
import { buildSections, getActiveSection } from "./timesSections";

export type MapProp = Map<string, { key: string, format: string }>;
export type MultiMapProp = Map<string, MapProp>;
export type IsEnabled = (daytimes: TypedObjectMap<Date>) => boolean;
export type IsEnabledMap = Map<string, IsEnabled>;

export type TimesMap = Array<{ main: TimesKeys, additions?: Array<TimesKeys> }>;

export const MARKED_TIME_GRACE_MINUTES = 10;
const MARKED_TIME_GRACE_MS = MARKED_TIME_GRACE_MINUTES * 60 * 1000;

/**
 * Finds the "current" card index — order-independent.
 *
 * ChatzotLailah is the largest timestamp of the day (next day ~00:48) but may
 * appear first in the array. This algorithm does NOT assume chronological order:
 *
 *  - Among times that haven't passed beyond the 10-minute grace, pick the soonest.
 *  - If every time has already passed, pick the most recently passed one.
 */
export const getClosestKeyIndex = (
    times: TimeState,
    relevantKeys: TimesMap,
    now: Date = new Date(),
): number => {
    const cutoffMs = now.getTime() - MARKED_TIME_GRACE_MS;

    let bestFutureIdx = -1;
    let bestFutureMs = Infinity;
    let lastPassedIdx = -1;
    let lastPassedMs = -Infinity;

    for (const [idx, item] of relevantKeys.entries()) {
        const timeItem = times[item.main as unknown as string];
        if (!timeItem || !timeItem.date) continue;
        const timeMs = new Date(timeItem.date).getTime();
        if (Number.isNaN(timeMs)) continue;

        if (timeMs > cutoffMs) {
            // This time is still upcoming (or within grace)
            if (timeMs < bestFutureMs) {
                bestFutureMs = timeMs;
                bestFutureIdx = idx;
            }
        } else {
            // This time has passed beyond grace
            if (timeMs > lastPassedMs) {
                lastPassedMs = timeMs;
                lastPassedIdx = idx;
            }
        }
    }

    return bestFutureIdx !== -1 ? bestFutureIdx : lastPassedIdx;
};

export const useTimesContainerLogic = (times: TimeState) => {
    const [closestIndex, setClosestIndex] = useState<number>(-1);
    const [relevantKeys, setRelevantKeys] = useState<TimesMap>([]);

    useEffect(() => {
        const compute = () => {
            try {
                const now = new Date();
                const sections = buildSections(times, now);
                const active = getActiveSection(times, sections, now);
                setRelevantKeys(active.times);
                setClosestIndex(getClosestKeyIndex(times, active.times, now));
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
};
