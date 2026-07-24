import { TimesKeys } from '@shared/core/services/workers/handlers/constants/times.keys';
import { TimeState } from '../../store/times/timesState';
import { TimesMap } from './TimesContainerHooks';

export type SectionId = 'morning' | 'midday' | 'evening';

export interface TimeSection {
    id: SectionId;
    times: TimesMap;
}

/** Maximum number of time cards displayed at once (3 columns × 2 rows). */
export const MAX_VISIBLE_CARDS = 6;

/** Keep ChatzotLailah visible in the morning until this long after netz. */
const NETZ_GRACE_MS = 60 * 60 * 1000; // 1 hour

/** Keep the midday section visible this long after shkiah before switching to evening. */
const SHKIAH_GRACE_MS = 10 * 60 * 1000; // 10 minutes

/** Reads a Date (ms) from the times state, or null when missing/invalid. */
function timeMs(times: TimeState, key: TimesKeys): number | null {
    const item = times?.[key as unknown as string];
    if (!item?.date) return null;
    const ms = new Date(item.date).getTime();
    return Number.isNaN(ms) ? null : ms;
}

/** True when the given time key exists in the state with a valid date. */
function has(times: TimeState, key: TimesKeys): boolean {
    return timeMs(times, key) !== null;
}

/**
 * Morning section: shown from midnight until ChatzotYom.
 * ChatzotLailah is included only until 1 hour after Netz (it's the *last*
 * timestamp of the day — next day ~00:48 — so it becomes stale quickly).
 */
/**
 * Morning section: shown from midnight until ChatzotYom. Always 6 cards.
 * ChatzotLailah is included only until 1 hour after Netz (it is the last
 * timestamp of the day). Once dropped, ChatzotYom takes its place so the
 * grid stays full.
 */
function buildMorning(times: TimeState, nowMs: number): TimesMap {
    const netz = timeMs(times, TimesKeys.Netz);
    const keepChatzot = netz === null || nowMs < netz + NETZ_GRACE_MS;

    const core: TimesMap = [
        { main: TimesKeys.AlotHaShahar },
        { main: TimesKeys.TallitAndTefillin },
        { main: TimesKeys.Netz },
        { main: TimesKeys.SofShemaMagenAvraham, additions: [TimesKeys.SofShemaGra] },
        { main: TimesKeys.SofBirkotKeriatShemaMagenAvraham, additions: [TimesKeys.SofBirkotKeriatShemaGra] },
    ];

    const result: TimesMap = keepChatzot
        ? [{ main: TimesKeys.ChatzotLailah }, ...core]
        : [...core, { main: TimesKeys.ChatzotYom }];

    return result.slice(0, MAX_VISIBLE_CARDS);
}

/**
 * Midday section: shown from ChatzotYom until Shkiah + 10 min. Always 6 cards.
 * On candle-lighting days (erev shabbat / erev yom tov) NerotShabat takes the
 * 6th slot; otherwise TzetCochavim fills it as a preview of the evening.
 */
function buildMidday(times: TimeState): TimesMap {
    const result: TimesMap = [
        { main: TimesKeys.ChatzotYom },
        { main: TimesKeys.MinchaGdola },
        { main: TimesKeys.MinchaKtana },
        { main: TimesKeys.PlagMincha },
        { main: TimesKeys.Shkiah },
    ];
    result.push(
        has(times, TimesKeys.NerotShabat)
            ? { main: TimesKeys.NerotShabat }
            : { main: TimesKeys.TzetCochavimGeonim, additions: [TimesKeys.TzetCochavimRabinoTam] },
    );
    return result.slice(0, MAX_VISIBLE_CARDS);
}

/**
 * Evening section: shown from Shkiah + 10 min until next midnight. Always 6 cards.
 * On motzei shabbat/yom tov TzetShabat is included; on fast days TzetTzumKatan;
 * on a regular evening MinchaGdola fills the extra slot.
 */
function buildEvening(times: TimeState): TimesMap {
    const geonim = { main: TimesKeys.TzetCochavimGeonim, additions: [TimesKeys.TzetCochavimRabinoTam] };

    let result: TimesMap;
    if (has(times, TimesKeys.TzetShabat)) {
        result = [
            { main: TimesKeys.MinchaKtana },
            { main: TimesKeys.PlagMincha },
            { main: TimesKeys.Shkiah },
            geonim,
            { main: TimesKeys.TzetShabat },
            { main: TimesKeys.ChatzotLailah },
        ];
    } else if (has(times, TimesKeys.TzetTzumKatan)) {
        result = [
            { main: TimesKeys.MinchaKtana },
            { main: TimesKeys.PlagMincha },
            { main: TimesKeys.Shkiah },
            geonim,
            { main: TimesKeys.TzetTzumKatan },
            { main: TimesKeys.ChatzotLailah },
        ];
    } else {
        result = [
            { main: TimesKeys.MinchaGdola },
            { main: TimesKeys.MinchaKtana },
            { main: TimesKeys.PlagMincha },
            { main: TimesKeys.Shkiah },
            geonim,
            { main: TimesKeys.ChatzotLailah },
        ];
    }
    return result.slice(0, MAX_VISIBLE_CARDS);
}

/** Builds the 3 sections for the current moment and day type. */
export function buildSections(times: TimeState, now: Date = new Date()): TimeSection[] {
    const nowMs = now.getTime();
    return [
        { id: 'morning', times: buildMorning(times, nowMs) },
        { id: 'midday', times: buildMidday(times) },
        { id: 'evening', times: buildEvening(times) },
    ];
}

/**
 * Picks the active section:
 *   now < ChatzotYom               -> morning
 *   ChatzotYom <= now < Shkiah+10m -> midday
 *   otherwise                      -> evening
 *
 * Falls back to midday if boundary times are unavailable.
 */
export function getActiveSection(
    times: TimeState,
    sections: TimeSection[],
    now: Date = new Date(),
): TimeSection {
    const nowMs = now.getTime();
    const byId = (id: SectionId) => sections.find((s) => s.id === id);

    const chatzotYom = timeMs(times, TimesKeys.ChatzotYom);
    if (chatzotYom !== null && nowMs < chatzotYom) {
        return byId('morning') ?? sections[0];
    }

    const shkiah = timeMs(times, TimesKeys.Shkiah);
    if (shkiah !== null && nowMs < shkiah + SHKIAH_GRACE_MS) {
        return byId('midday') ?? sections[1];
    }

    return byId('evening') ?? sections[sections.length - 1];
}
