import { powerSaveBlocker } from 'electron';

let blockerId: number | null = null;

/** Electron equivalent of expo-keep-awake: keeps the TV/monitor awake. */
export function startKeepAwake(): number {
  if (blockerId !== null && powerSaveBlocker.isStarted(blockerId)) return blockerId;
  blockerId = powerSaveBlocker.start('prevent-display-sleep');
  console.log('[KeepAwake] powerSaveBlocker started, id =', blockerId);
  return blockerId;
}

export function stopKeepAwake(): void {
  if (blockerId === null) return;
  if (powerSaveBlocker.isStarted(blockerId)) powerSaveBlocker.stop(blockerId);
  console.log('[KeepAwake] powerSaveBlocker stopped');
  blockerId = null;
}
