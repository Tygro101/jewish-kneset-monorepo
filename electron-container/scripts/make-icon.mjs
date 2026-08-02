// Generates build/icon.ico from the monorepo-root icon.svg.
// Run: npm run icon   (output is committed, so packaging never needs sharp)
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');
const svgPath = resolve(projectRoot, '..', 'icon.svg');
const outPath = resolve(projectRoot, 'build', 'icon.ico');
const sizes = [256, 128, 64, 48, 32, 16];

const buffers = [];
for (const size of sizes) {
  buffers.push(
    await sharp(svgPath, { density: 384 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer(),
  );
}

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, await pngToIco(buffers));
console.log(`Wrote ${outPath} (${sizes.join(', ')} px)`);
