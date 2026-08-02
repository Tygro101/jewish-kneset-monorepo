/** Hidden operator shortcuts. No 'electron' import — unit-tested in plain Node. */

export type ShortcutAction = 'quit' | 'reload' | 'toggle-devtools';

export interface ShortcutBinding {
  accelerator: string;
  action: ShortcutAction;
}

/** DevTools are only reachable in unpackaged (developer) builds. */
export function buildShortcutTable(isPackaged: boolean): ShortcutBinding[] {
  const bindings: ShortcutBinding[] = [
    { accelerator: 'Control+Shift+Q', action: 'quit' },
    { accelerator: 'Control+Shift+R', action: 'reload' },
  ];
  if (!isPackaged) {
    bindings.push({ accelerator: 'Control+Shift+I', action: 'toggle-devtools' });
  }
  return bindings;
}
