import { ZmaniAiom } from '../services/workers/handlers/models/zmani-aiom';
import { CitiesEnum } from '../services/workers/handlers/models/shared-models';
import { cities } from '../services/workers/handlers/constants/calculations';
import {
  MinchaGdolaKey,
  MinchaKtanaKey,
  NetzKey,
  PlagMinchaKey,
  ShkiahKey,
  TzetCochavimGeonimKey,
} from '../services/workers/handlers/constants/times.keys';
import type { AnchorMinutes } from './dynamic-time';
import type { ZmanAnchor } from './schedule.models';

/** Used when a tenant has no location, or an unrecognised one. */
export const DEFAULT_CITY: CitiesEnum = CitiesEnum.NETIVOT_NEVA_SHARON;

/** Maps an anchor to the key ZmaniAiom emits for it. */
const ANCHOR_TIME_KEYS: Record<ZmanAnchor, string> = {
  netz: NetzKey,
  shkiah: ShkiahKey,
  plagMincha: PlagMinchaKey,
  minchaGdola: MinchaGdolaKey,
  minchaKtana: MinchaKtanaKey,
  tzetCochavimGeonim: TzetCochavimGeonimKey,
};

/** True when the value names a city we have coordinates for. */
export function isKnownCity(value: unknown): boolean {
  return typeof value === 'string' && Boolean(cities[value]);
}

/** A usable city for any input — falls back to DEFAULT_CITY. */
export function resolveCity(value: unknown): CitiesEnum {
  return isKnownCity(value) ? (value as CitiesEnum) : DEFAULT_CITY;
}

const cache = new Map<string, AnchorMinutes | null>();

function cacheKey(date: Date, city: string): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}|${city}`;
}

/** Local minutes from midnight for an ISO timestamp, or null when unusable. */
function isoToMinutes(iso: string | undefined): number | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getHours() * 60 + parsed.getMinutes();
}

/**
 * Resolved anchor minutes for a date and city, memoized per date+city.
 * Returns null when the calculation fails — callers must treat that as
 * "no dynamic event can be placed today" rather than throwing.
 */
export function anchorMinutesFor(date: Date, city: unknown = DEFAULT_CITY): AnchorMinutes | null {
  const resolvedCity = resolveCity(city);
  const key = cacheKey(date, resolvedCity);
  if (cache.has(key)) return cache.get(key) ?? null;

  let result: AnchorMinutes | null = null;
  try {
    const times = new ZmaniAiom({ date, city: resolvedCity }).calculateTimes();
    const out: AnchorMinutes = {};
    for (const anchor of Object.keys(ANCHOR_TIME_KEYS) as ZmanAnchor[]) {
      const minutes = isoToMinutes(times?.[ANCHOR_TIME_KEYS[anchor]]?.date);
      if (minutes !== null) out[anchor] = minutes;
    }
    result = Object.keys(out).length > 0 ? out : null;
  } catch {
    result = null;
  }

  cache.set(key, result);
  return result;
}

/** Drops the memo. Call from tests, or after a manual clock change. */
export function clearAnchorCache(): void {
  cache.clear();
}
