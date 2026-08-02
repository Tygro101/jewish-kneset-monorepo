/** Reload backoff after a failed main-frame load. No 'electron' import. */

export const RETRY_DELAYS_MS = [5_000, 10_000, 30_000, 60_000] as const;

/**
 * @param attempt 1-based failure count (1 = first failure).
 * @returns delay in ms before the next attempt; capped at the last entry.
 */
export function nextRetryDelay(attempt: number): number {
  if (!Number.isFinite(attempt) || attempt < 1) return RETRY_DELAYS_MS[0];
  const index = Math.min(Math.floor(attempt) - 1, RETRY_DELAYS_MS.length - 1);
  return RETRY_DELAYS_MS[index];
}

/** Chromium error codes that must not trigger a retry (user/app-initiated aborts). */
const IGNORED_ERROR_CODES = new Set<number>([-3 /* ERR_ABORTED */, 0]);

export function shouldRetryLoadFailure(errorCode: number, isMainFrame: boolean): boolean {
  if (!isMainFrame) return false;
  return !IGNORED_ERROR_CODES.has(errorCode);
}
