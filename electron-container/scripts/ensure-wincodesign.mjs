// Pre-populates electron-builder's winCodeSign cache without the macOS payload.
//
// electron-builder needs `rcedit` (shipped inside winCodeSign) to stamp the app
// icon and version info into the packaged exe. Its own extraction unpacks the
// bundled `darwin/` folder too, which contains symlinks; on Windows without
// Developer Mode / elevation that fails with:
//   "Cannot create symbolic link : A required privilege is not held by the client"
// and packaging aborts. We extract the same archive ourselves, skipping
// `darwin/`, into the exact cache directory electron-builder looks for.
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSION = 'winCodeSign-2.6.0';
const URL = `https://github.com/electron-userland/electron-builder-binaries/releases/download/${VERSION}/${VERSION}.7z`;

const here = dirname(fileURLToPath(import.meta.url));
const sevenZip = resolve(here, '..', 'node_modules', '7zip-bin', 'win', 'x64', '7za.exe');

const cacheRoot =
  process.env.ELECTRON_BUILDER_CACHE ??
  join(process.env.LOCALAPPDATA ?? join(process.env.USERPROFILE ?? '', 'AppData', 'Local'), 'electron-builder', 'Cache');
const target = join(cacheRoot, 'winCodeSign', VERSION);

if (existsSync(join(target, 'rcedit-x64.exe'))) {
  console.log(`winCodeSign already cached: ${target}`);
  process.exit(0);
}

if (!existsSync(sevenZip)) {
  console.error(`7za.exe not found at ${sevenZip} — run npm install first.`);
  process.exit(1);
}

console.log(`Downloading ${URL}`);
const response = await fetch(URL);
if (!response.ok) {
  console.error(`Download failed: ${response.status} ${response.statusText}`);
  process.exit(1);
}

await mkdir(target, { recursive: true });
const archive = join(target, `${VERSION}.7z`);
await writeFile(archive, Buffer.from(await response.arrayBuffer()));

// -x!darwin/* skips the mac-only files whose symlinks we cannot create.
const result = spawnSync(sevenZip, ['x', archive, '-y', '-bd', '-x!darwin/*', `-o${target}`], {
  stdio: 'inherit',
});
await rm(archive, { force: true });

if (result.status !== 0) {
  console.error(`Extraction failed (exit ${result.status}).`);
  process.exit(1);
}

if (!existsSync(join(target, 'rcedit-x64.exe'))) {
  console.error(`rcedit-x64.exe missing after extraction in ${target}.`);
  process.exit(1);
}

console.log(`winCodeSign ready (rcedit available): ${target}`);
