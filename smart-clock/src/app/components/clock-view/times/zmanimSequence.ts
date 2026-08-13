import { TimesKeys } from '@shared/core/services/workers/handlers/constants/times.keys';
import type { ZmanimCount } from '@shared/core/display/zmanim-count';
import type { TimeState } from '../../store/times/timesState';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A zman stays highlighted this long after it has passed. The same grace also
 * delays the window switch, so the last card of a block keeps its highlight for
 * 10 minutes before the block advances.
 */
export const MARKED_TIME_GRACE_MINUTES = 10;
export const MARKED_TIME_GRACE_MS = MARKED_TIME_GRACE_MINUTES * 60 * 1000;

export interface ZmanEntryDef {
  main: TimesKeys;
  /** Secondary times rendered under the main one (6-card mode only). */
  additions?: TimesKeys[];
  /**
   * -1 marks the LEADING ChatzotLailah. ChatzotLailah is calculated as
   * `nadir + 1 day` (~00:48 TOMORROW), so without this shift it would sort last
   * and be treated as "upcoming" all morning. The value shown is today's; only
   * the ordering/passed-check timestamp is shifted back a day.
   */
  dayOffset?: -1;
}

export interface ResolvedZmanEntry {
  /** Unique per position — ChatzotLailah appears twice (last night, tonight). */
  id: string;
  main: TimesKeys;
  additions: TimesKeys[];
  /** Effective timestamp used for ordering and passed-checks. */
  ms: number;
}

/** 4-card mode: every zman gets its own card (no מ"א/גר"א companions). */
const SEQUENCE_4: ZmanEntryDef[] = [
  { main: TimesKeys.ChatzotLailah, dayOffset: -1 },
  { main: TimesKeys.AlotHaShahar },
  { main: TimesKeys.TallitAndTefillin },
  { main: TimesKeys.Netz },
  { main: TimesKeys.SofShemaMagenAvraham },
  { main: TimesKeys.SofShemaGra },
  { main: TimesKeys.SofBirkotKeriatShemaMagenAvraham },
  { main: TimesKeys.SofBirkotKeriatShemaGra },
  { main: TimesKeys.ChatzotYom },
  { main: TimesKeys.MinchaGdola },
  { main: TimesKeys.MinchaKtana },
  { main: TimesKeys.PlagMincha },
  { main: TimesKeys.NerotShabat },
  { main: TimesKeys.Shkiah },
  { main: TimesKeys.TzetCochavimGeonim },
  { main: TimesKeys.TzetTzumKatan },
  { main: TimesKeys.TzetShabat },
  { main: TimesKeys.TzetCochavimRabinoTam },
  { main: TimesKeys.ChatzotLailah },
];

/** 6-card mode: מ"א/גר"א and Geonim/ר"ת share a card (main + addition). */
const SEQUENCE_6: ZmanEntryDef[] = [
  { main: TimesKeys.ChatzotLailah, dayOffset: -1 },
  { main: TimesKeys.AlotHaShahar },
  { main: TimesKeys.TallitAndTefillin },
  { main: TimesKeys.Netz },
  { main: TimesKeys.SofShemaMagenAvraham, additions: [TimesKeys.SofShemaGra] },
  {
    main: TimesKeys.SofBirkotKeriatShemaMagenAvraham,
    additions: [TimesKeys.SofBirkotKeriatShemaGra],
  },
  { main: TimesKeys.ChatzotYom },
  { main: TimesKeys.MinchaGdola },
  { main: TimesKeys.MinchaKtana },
  { main: TimesKeys.PlagMincha },
  { main: TimesKeys.NerotShabat },
  { main: TimesKeys.Shkiah },
  { main: TimesKeys.TzetCochavimGeonim, additions: [TimesKeys.TzetCochavimRabinoTam] },
  { main: TimesKeys.TzetTzumKatan },
  { main: TimesKeys.TzetShabat },
  { main: TimesKeys.ChatzotLailah },
];

function timeMs(times: TimeState, key: TimesKeys): number | null {
  const item = times?.[key as unknown as string];
  if (!item?.date) return null;
  const ms = new Date(item.date).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Chronological list of the zmanim that exist today.
 * Day-type keys (NerotShabat, TzetShabat, TzetTzumKatan, TzetCochavimRabinoTam)
 * are simply absent from state on days they do not apply, so filtering by
 * presence is the day-type detection — same rule as before.
 */
export function buildZmanimSequence(times: TimeState, count: ZmanimCount): ResolvedZmanEntry[] {
  const defs = count === 4 ? SEQUENCE_4 : SEQUENCE_6;
  const resolved: ResolvedZmanEntry[] = [];

  defs.forEach((def, index) => {
    const ms = timeMs(times, def.main);
    if (ms === null) return;
    resolved.push({
      id: `${def.main}#${index}`,
      main: def.main,
      additions: (def.additions ?? []).filter((key) => timeMs(times, key) !== null),
      ms: ms + (def.dayOffset ?? 0) * DAY_MS,
    });
  });

  // The declared order is already chronological for a normal day; sorting keeps
  // unusual day types (a fast ending into Shabbat, etc.) correct as well.
  return resolved.sort((a, b) => a.ms - b.ms);
}

export interface ZmanimWindow {
  entries: ResolvedZmanEntry[];
  /** Index within `entries` of the card to highlight (-1 when empty). */
  currentIndex: number;
}

/**
 * Picks the visible block: `count` consecutive entries, moving in steps of
 * `count / 2`, positioned so the block holds half already-passed times and half
 * upcoming ones. The block advances only once its LAST entry has passed
 * (plus the 10-minute grace).
 *
 *   4 cards → stride 2:  [חצות לילה, עלות, ציצית, הנץ] → [ציצית, הנץ, ס"ז ק"ש מ"א, גר"א] → …
 *   6 cards → stride 3
 */
export function resolveZmanimWindow(
  sequence: ResolvedZmanEntry[],
  nowMs: number,
  count: ZmanimCount,
): ZmanimWindow {
  if (!sequence.length) return { entries: [], currentIndex: -1 };

  const size = count;
  const stride = count / 2;
  const cutoff = nowMs - MARKED_TIME_GRACE_MS;

  // First entry whose effective time is still "upcoming" (hasn't passed + grace)
  let upcoming = sequence.findIndex((entry) => entry.ms > cutoff);
  if (upcoming === -1) upcoming = sequence.length; // everything already passed

  const maxStart = Math.max(0, sequence.length - size);
  const rawStart = (Math.floor(upcoming / stride) - 1) * stride;
  const start = Math.min(Math.max(rawStart, 0), maxStart);

  const entries = sequence.slice(start, start + size);

  // currentIndex: the first entry within the window whose time is still upcoming
  let currentIndex = entries.findIndex((e) => e.ms > cutoff);
  if (currentIndex === -1) currentIndex = entries.length - 1; // all passed → last

  return { entries, currentIndex };
}
