import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { windowIconPath, ICON_DIR, ICON_FILE } from '../src/main/icon';

const projectRoot = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

describe('windowIconPath', () => {
  it('ends with static/icon.ico', () => {
    const result = windowIconPath('/app');
    expect(result).toBe(path.join('/app', 'static', 'icon.ico'));
  });

  it('uses the ICON_DIR and ICON_FILE constants', () => {
    expect(ICON_DIR).toBe('static');
    expect(ICON_FILE).toBe('icon.ico');
  });
});

describe('icon packaging', () => {
  it('static/ is within build.files so the ico is packaged', () => {
    const files: string[] = pkg.build.files;
    const coversStatic = files.some((f: string) => f.startsWith('static'));
    expect(coversStatic).toBe(true);
  });

  it('build.win.icon points at build/icon.ico', () => {
    expect(pkg.build.win.icon).toBe('build/icon.ico');
  });

  it('static/icon.ico exists on disk', () => {
    expect(fs.existsSync(path.join(projectRoot, 'static', 'icon.ico'))).toBe(true);
  });

  it('build/icon.ico exists on disk', () => {
    expect(fs.existsSync(path.join(projectRoot, 'build', 'icon.ico'))).toBe(true);
  });

  it('static/icon.ico and build/icon.ico are byte-identical', () => {
    const staticIco = fs.readFileSync(path.join(projectRoot, 'static', 'icon.ico'));
    const buildIco = fs.readFileSync(path.join(projectRoot, 'build', 'icon.ico'));
    expect(staticIco.equals(buildIco)).toBe(true);
  });
});
