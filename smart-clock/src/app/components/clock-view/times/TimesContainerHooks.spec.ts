import { describe, expect, it } from 'vitest';
import { TimesKeys } from '@shared/core/services/workers/handlers/constants/times.keys';
import {
    getClosestKeyIndex,
    MARKED_TIME_GRACE_MINUTES,
    TimesMap,
} from './TimesContainerHooks';
import { TimeState } from '../../store/times/timesState';

const makeTimes = (entries: Array<[TimesKeys, string]>): TimeState =>
    Object.fromEntries(entries.map(([key, date]) => [key, {
        date,
        name: key,
        shortName: key,
    }]));

const relevant = (keys: TimesKeys[]): TimesMap => keys.map((main) => ({ main }));

describe('getClosestKeyIndex', () => {
    it('keeps a zman marked until it has passed by 10 minutes', () => {
        const tzet = '2026-07-14T20:08:00.000Z';
        const next = '2026-07-15T00:48:00.000Z';
        const times = makeTimes([
            [TimesKeys.TzetCochavimGeonim, tzet],
            [TimesKeys.ChatzotLailah, next],
        ]);
        const keys = relevant([TimesKeys.TzetCochavimGeonim, TimesKeys.ChatzotLailah]);

        const nineMinutesLater = new Date('2026-07-14T20:17:59.999Z');
        expect(getClosestKeyIndex(times, keys, nineMinutesLater)).toBe(0);
    });

    it('moves to the next zman once the previous one has passed by 10 minutes', () => {
        const tzet = '2026-07-14T20:08:00.000Z';
        const next = '2026-07-15T00:48:00.000Z';
        const times = makeTimes([
            [TimesKeys.TzetCochavimGeonim, tzet],
            [TimesKeys.ChatzotLailah, next],
        ]);
        const keys = relevant([TimesKeys.TzetCochavimGeonim, TimesKeys.ChatzotLailah]);

        const exactlyTenMinutesLater = new Date(
            new Date(tzet).getTime() + MARKED_TIME_GRACE_MINUTES * 60 * 1000,
        );
        expect(getClosestKeyIndex(times, keys, exactlyTenMinutesLater)).toBe(1);
    });

    it('advances past tzet when the clock is already much later than tzet', () => {
        const times = makeTimes([
            [TimesKeys.Shkiah, '2026-07-14T19:49:00.000Z'],
            [TimesKeys.TzetCochavimGeonim, '2026-07-14T20:08:00.000Z'],
            [TimesKeys.ChatzotLailah, '2026-07-15T00:48:00.000Z'],
        ]);
        const keys = relevant([
            TimesKeys.Shkiah,
            TimesKeys.TzetCochavimGeonim,
            TimesKeys.ChatzotLailah,
        ]);

        expect(getClosestKeyIndex(times, keys, new Date('2026-07-14T21:10:00.000Z'))).toBe(2);
    });
});
