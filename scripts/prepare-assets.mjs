/**
 * Pulls product visuals from the Concat app repository and prepares them for the site.
 *   node scripts/prepare-assets.mjs            (expects ../relay, i.e. a clone of github.com/jub0t/Concat)
 *   CONCAT_REPO=/path/to/Concat node scripts/prepare-assets.mjs
 *
 * Outputs
 *   src/assets/editor-dark.png    editor screenshot with its baked-in window chrome cropped away
 *   src/assets/phone-preview.png  the 9:16 preview area of the same screenshot (phone frame stand-in)
 *   src/assets/logo-lime.png, src/assets/logo-dark.png
 *   public/favicon.ico, public/favicon.png, public/apple-touch-icon.png
 */
import sharp from 'sharp';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO = resolve(process.env.CONCAT_REPO ?? '../relay');
const ASSETS = resolve(REPO, 'assets');
mkdirSync('src/assets', { recursive: true });
mkdirSync('public', { recursive: true });

const shot = resolve(ASSETS, 'editor-dark.png');
const { data, info } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const px = (x, y) => {
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2]];
};
const diff = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

// Window bounds: walk inward from each edge until the pixel stops matching the flat backdrop.
const bg = px(4, 4);
const midY = Math.floor(height / 2);
const midX = Math.floor(width / 2);
let left = 0;
while (left < width && diff(px(left, midY), bg) < 24) left++;
let right = width - 1;
while (right > 0 && diff(px(right, midY), bg) < 24) right--;
let top = 0;
while (top < height && diff(px(midX, top), bg) < 24) top++;
let bottom = height - 1;
while (bottom > 0 && diff(px(midX, bottom), bg) < 24) bottom--;

// Title bar: first horizontal edge below the window top, sampled at 30% width.
const winH = bottom - top;
const sampleX = left + Math.round((right - left) * 0.3);
let titleH = Math.round(winH * 0.048);
for (let y = top + 20; y < top + Math.round(winH * 0.12); y++) {
  if (diff(px(sampleX, y), px(sampleX, y + 3)) > 18) {
    titleH = y - top + 2;
    break;
  }
}
console.log(
  `screenshot ${width}x${height}, window`,
  { left, right, top, bottom },
  'title bar',
  titleH,
);

const inset = 4;
await sharp(shot)
  .extract({
    left: left + inset,
    top: top + titleH,
    width: right - left - inset * 2,
    height: bottom - (top + titleH) - inset,
  })
  .png({ compressionLevel: 9 })
  .toFile('src/assets/editor-dark.png');

// 9:16 preview area (fractions of the full screenshot, measured once on the 3164x1920 source).
await sharp(shot)
  .extract({
    left: Math.round(width * 0.4815),
    top: Math.round(height * 0.146),
    width: Math.round(width * 0.122),
    height: Math.round(height * 0.362),
  })
  .png({ compressionLevel: 9 })
  .toFile('src/assets/phone-preview.png');

copyFileSync(resolve(ASSETS, 'concat_logo_512.png'), 'src/assets/logo-lime.png');
copyFileSync(resolve(ASSETS, 'logo-dark.png'), 'src/assets/logo-dark.png');
copyFileSync(resolve(ASSETS, 'icons/concat.ico'), 'public/favicon.ico');
await sharp(resolve(ASSETS, 'concat_logo_512.png'))
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png');
await sharp(resolve(ASSETS, 'concat_logo_512.png'))
  .resize(64, 64)
  .png()
  .toFile('public/favicon.png');

for (const f of ['src/assets/editor-dark.png', 'src/assets/phone-preview.png']) {
  const m = await sharp(f).metadata();
  console.log(`${f}: ${m.width}x${m.height} (${(m.width / m.height).toFixed(3)})`);
}
console.log('done');
