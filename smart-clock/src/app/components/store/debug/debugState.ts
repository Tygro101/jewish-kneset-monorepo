/**
 * Debug slice state — in-memory only (does not survive reload).
 * Controls the view override and rotation freeze for developer mode.
 */

/** A view the developer can jump to. */
export type DebugViewOverride =
  | null
  | { kind: 'dashboard' }
  | { kind: 'schedule' }
  | { kind: 'messages' }
  | { kind: 'presentation'; index: number };

export interface DebugState {
  /** Whether debug mode is active (mirrors DEBUG_ENABLED, stored here for selector access). */
  enabled: boolean;
  /** Active time offset in ms (mirrors the clock seam, for UI display). */
  offsetMs: number;
  /** When set, overrides the rotation cycle and forces this view. */
  viewOverride: DebugViewOverride;
  /** When true, the display rotation timer is suspended. */
  rotationFrozen: boolean;
}
