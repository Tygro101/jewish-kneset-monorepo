import { useEffect, useState } from 'react';
import { TimeState } from '../../store/times/timesState';
import { TimesKeys } from '@shared/core/services/workers/handlers/constants/times.keys';
import { TypedObjectMap } from '@shared/models/core';
import type { ZmanimCount } from '@shared/core/display/zmanim-count';
import { buildZmanimSequence, resolveZmanimWindow, type ResolvedZmanEntry } from './zmanimSequence';
import { now } from '../../../debug/clock';

export type MapProp = Map<string, { key: string; format: string }>;
export type MultiMapProp = Map<string, MapProp>;
export type IsEnabled = (daytimes: TypedObjectMap<Date>) => boolean;
export type IsEnabledMap = Map<string, IsEnabled>;

export type TimesMap = Array<{ main: TimesKeys; additions?: Array<TimesKeys> }>;

export { MARKED_TIME_GRACE_MINUTES } from './zmanimSequence';

/**
 * How often the visible block and the highlight are re-evaluated.
 * The block now advances on any zman boundary (not just 3 per day), so this is
 * much tighter than the old 5-minute tick.
 */
const RECOMPUTE_MS = 30 * 1000;

export const useTimesContainerLogic = (times: TimeState, count: ZmanimCount = 6) => {
    const [entries, setEntries] = useState<ResolvedZmanEntry[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    useEffect(() => {
        const compute = () => {
            try {
                const sequence = buildZmanimSequence(times, count);
                const window_ = resolveZmanimWindow(sequence, now().getTime(), count);
                setEntries(window_.entries);
                setCurrentIndex(window_.currentIndex);
            } catch {
                setEntries([]);
                setCurrentIndex(-1);
            }
        };
        compute();
        const id = setInterval(compute, RECOMPUTE_MS);
        return () => clearInterval(id);
    }, [times, count]);

    return { entries, currentIndex } as const;
};
