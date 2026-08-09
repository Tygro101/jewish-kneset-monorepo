import { powerSaveBlocker } from 'electron';
import { KeepAwakeGuard } from './keep-awake';

let guard: KeepAwakeGuard | null = null;

function getGuard(): KeepAwakeGuard {
  if (!guard) {
    guard = new KeepAwakeGuard({
      blocker: powerSaveBlocker,
      logger: (message) => console.log(message),
    });
  }
  return guard;
}

/**
 * Electron equivalent of expo-keep-awake: keeps the TV/monitor awake.
 * Idempotent, and arms a watchdog that re-establishes the blocker if the OS drops it.
 */
export function startKeepAwake(): number | null {
  return getGuard().start();
}

/** Forces a fresh blocker. Call after OS power events (resume, unlock, AC change). */
export function reArmKeepAwake(): number | null {
  return getGuard().reArm();
}

export function stopKeepAwake(): void {
  guard?.stop();
}

/** True when a live display-sleep blocker is held. Used for startup logging. */
export function isKeepAwakeActive(): boolean {
  return guard?.isActive() ?? false;
}
