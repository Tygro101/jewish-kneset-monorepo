/**
 * Clock seam — a single place through which all "current time" reads go.
 *
 * In normal mode, `now()` returns the real wall-clock time.
 * In debug mode (when DEBUG_ENABLED is true and an offset is stored in
 * localStorage), `now()` returns `real time + offset`, so the clock keeps
 * ticking from the chosen point.
 *
 * The offset is persisted in localStorage under `smartclock-debug` so it
 * survives the page reload that "Apply" triggers. It is **only read** when
 * the debug flag is active; without the flag, even a leftover key is inert.
 */

import { DEBUG_ENABLED } from './debugFlag';

const STORAGE_KEY = 'smartclock-debug';

interface DebugStorage {
  offsetMs: number;
}

/** Reads the stored offset. Returns 0 for any failure or when debug is off. */
export function loadOffset(debugEnabled: boolean): number {
  if (!debugEnabled) return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'offsetMs' in parsed &&
      typeof (parsed as DebugStorage).offsetMs === 'number' &&
      Number.isFinite((parsed as DebugStorage).offsetMs)
    ) {
      return (parsed as DebugStorage).offsetMs;
    }
    return 0;
  } catch {
    return 0;
  }
}

/** In-memory offset (loaded once at module init). */
let offsetMs: number = loadOffset(DEBUG_ENABLED);

/**
 * Returns the current time, adjusted by the debug offset when active.
 * This is the **only** function that should be used instead of `new Date()`.
 */
export function now(): Date {
  return new Date(Date.now() + offsetMs);
}

/** Returns `Date.now() + offset` as a millisecond timestamp. */
export function nowMs(): number {
  return Date.now() + offsetMs;
}

/** Returns the active offset in milliseconds. */
export function getOffsetMs(): number {
  return offsetMs;
}

/**
 * Sets the offset and persists it in localStorage.
 * No-op when debug mode is disabled.
 */
export function setOffsetMs(ms: number): void {
  if (!DEBUG_ENABLED) return;
  offsetMs = ms;
  try {
    const value: DebugStorage = { offsetMs: ms };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore — private browsing, quota, etc. */
  }
}

/** Clears the offset (sets to 0) and removes the stored key. */
export function clearOffset(): void {
  offsetMs = 0;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Pure helper: computes the offset needed so that `now()` returns `target`
 * at the moment when real time equals `realNow`.
 *
 *   target = realNow + offset  →  offset = target - realNow
 */
export function computeOffsetFromTarget(target: Date, realNow: Date): number {
  return target.getTime() - realNow.getTime();
}

/**
 * TEST ONLY — reloads the offset from storage. Used in specs to simulate
 * a fresh module evaluation after changing localStorage / mock state.
 * @internal
 */
export function _reloadOffset(debugEnabled: boolean): void {
  offsetMs = loadOffset(debugEnabled);
}
