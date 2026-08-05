import * as path from 'node:path';

/** File name of the generated multi-size Windows icon. */
export const ICON_FILE = 'icon.ico';

/** Directory that holds the runtime copy. Must stay inside `build.files`. */
export const ICON_DIR = 'static';

/**
 * Runtime path of the window / taskbar / alt-tab icon.
 *
 * Generated from the monorepo root `icon.svg` by `npm run icon`, which writes
 * two copies: `build/icon.ico` (consumed by electron-builder for the exe and
 * the NSIS installer) and `static/icon.ico` (this one — `static/**` is in
 * `build.files`, so it exists inside the packaged asar as well as in dev).
 */
export function windowIconPath(appPath: string): string {
  return path.join(appPath, ICON_DIR, ICON_FILE);
}
