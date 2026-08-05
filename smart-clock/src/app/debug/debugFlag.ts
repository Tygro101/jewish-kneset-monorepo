/**
 * Debug flag — enables developer tools in the smart-clock app.
 *
 * Activated by adding `debug=true` (or `debug=1`) to the URL:
 *   - As a hash query: `#/tv?debug=true`
 *   - As a regular query: `?debug=true`
 *
 * The flag is evaluated once at module load and never changes during the session.
 */

const TRUTHY_VALUES = new Set(['true', '1', 'yes']);

/**
 * Pure parser — determines whether debug mode should be enabled.
 * Checks both `location.search` and the query portion of `location.hash`.
 */
export function parseDebugFlag(search: string, hash: string): boolean {
  // Check regular query string (?debug=true)
  const searchParams = safeParams(search);
  if (searchParams && TRUTHY_VALUES.has(searchParams.get('debug')?.toLowerCase() ?? '')) {
    return true;
  }

  // Check hash query string (#/tv?debug=true)
  const hashQuery = (hash ?? '').split('?')[1];
  if (hashQuery) {
    const hashParams = safeParams('?' + hashQuery);
    if (hashParams && TRUTHY_VALUES.has(hashParams.get('debug')?.toLowerCase() ?? '')) {
      return true;
    }
  }

  return false;
}

function safeParams(query: string): URLSearchParams | null {
  try {
    return new URLSearchParams(query);
  } catch {
    return null;
  }
}

/** Whether debug mode is active for this session. */
export const DEBUG_ENABLED: boolean =
  typeof window !== 'undefined'
    ? parseDebugFlag(window.location.search, window.location.hash)
    : false;
