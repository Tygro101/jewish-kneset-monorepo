/**
 * Module-level singleton cursor for the info panel rotation.
 * Survives component unmount/remount so the panel resumes at the next page
 * instead of restarting, even when the display rotates to a presentation.
 */

let _signature = '';
let _index = 0;

/**
 * Reads the current cursor position.
 * If the signature differs (day changed), resets to 0.
 * Always clamps to [0, pageCount-1].
 */
export function readCursor(signature: string, pageCount: number): number {
  if (pageCount <= 0) return 0;
  if (signature !== _signature) {
    _signature = signature;
    _index = 0;
  }
  // Clamp in case pageCount shrank
  if (_index >= pageCount) _index = _index % pageCount;
  return _index;
}

/**
 * Advances the cursor to the next page and returns the new index.
 * Wraps modulo pageCount.
 */
export function advanceCursor(signature: string, pageCount: number): number {
  if (pageCount <= 0) return 0;
  if (signature !== _signature) {
    _signature = signature;
    _index = 0;
    return 0;
  }
  _index = (_index + 1) % pageCount;
  return _index;
}

/** Reset for testing only. */
export function __resetInfoCursorForTests(): void {
  _signature = '';
  _index = 0;
}
