import { describe, expect, it } from 'vitest';
import { buildShortcutTable } from '../src/main/shortcuts';

describe('buildShortcutTable', () => {
  it('always exposes quit and reload', () => {
    for (const packaged of [true, false]) {
      const actions = buildShortcutTable(packaged).map((b) => b.action);
      expect(actions).toContain('quit');
      expect(actions).toContain('reload');
    }
  });

  it('exposes devtools only in dev builds', () => {
    expect(buildShortcutTable(false).map((b) => b.action)).toContain('toggle-devtools');
    expect(buildShortcutTable(true).map((b) => b.action)).not.toContain('toggle-devtools');
  });

  it('has unique accelerators', () => {
    const accelerators = buildShortcutTable(false).map((b) => b.accelerator);
    expect(new Set(accelerators).size).toBe(accelerators.length);
  });
});
