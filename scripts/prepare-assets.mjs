/**
 * Pulls product visuals from the Concat app repository and prepares them for the site.
 *   node scripts/prepare-assets.mjs
 *
 * Source, in order: CONCAT_REPO, a clone at ../relay, else the raw files on jsDelivr
 * (https://cdn.jsdelivr.net/gh/jub0t/Concat@main/assets/...) downloaded to a temp folder.
 *
 * Outputs
 *   src/assets/editor-light.png       light editor screenshot with the window chrome cropped away (hero)
 *   src/assets/feature-captions.png   the preview with a generated caption (feature row)
 *   src/assets/feature-titles.png     the preview edge and the text inspector (feature row)
 *   src/assets/feature-timeline.png   the timeline: text, effect, video and speech tracks (feature row)
 *   src/assets/mark.svg               the app mark (white two-C glyph on the rounded blue tile),
 *                                     inlined by the header and footer
 *   public/favicon.svg                the same file
 *   public/favicon.png                64px, rendered from the rounded tile
 *   public/apple-touch-icon.png       180px, rendered from the square tile (iOS rounds it itself)
 *   public/favicon.ico                the app's own, 16 to 256px frames
 */
import sharp from 'sharp';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CDN = 'https://cdn.jsdelivr.net/gh/jub0t/Concat@main/assets';
const FILES = [
  'editor-light.png',
  'new_concat_logo_512_rounded_light_theme.svg',
  'new_concat_logo_512_square_light_theme.svg',
  'icons/concat.ico',
];

async function findAssets() {
  const local = resolve(process.env.CONCAT_REPO ?? '../relay', 'assets');
  if (existsSync(local)) return local;
  const dir = join(tmpdir(), 'concat-assets');
  mkdirSync(join(dir, 'icons'), { recursive: true });
  for (const file of FILES) {
    const res = await fetch(`${CDN}/${file}`);
    if (!res.ok) {
      console.warn(`skip ${file}: HTTP ${res.status}`);
      continue;
    }
    writeFileSync(join(dir, file), Buffer.from(await res.arrayBuffer()));
  }
  console.log(`no local clone, downloaded from jsDelivr to ${dir}`);
  return dir;
}

const ASSETS = await findAssets();
mkdirSync('src/assets', { recursive: true });
mkdirSync('public', { recursive: true });

const shot = resolve(ASSETS, 'editor-light.png');
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
while (left < width && diff(px(left, midY), bg) < 12) left++;
let right = width - 1;
while (right > 0 && diff(px(right, midY), bg) < 12) right--;
let top = 0;
while (top < height && diff(px(midX, top), bg) < 12) top++;
let bottom = height - 1;
while (bottom > 0 && diff(px(midX, bottom), bg) < 12) bottom--;

// Title bar: first horizontal edge below the window top, sampled at 30% of the window width.
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

const inset = 6;
const content = {
  left: left + inset,
  top: top + titleH,
  width: right - left - inset * 2,
  height: bottom - (top + titleH) - inset,
};
await sharp(shot)
  .extract(content)
  .png({ compressionLevel: 9 })
  .toFile('src/assets/editor-light.png');

// Feature crops as fractions of the content area [x, y, width, height], measured on the
// 3024x1922 source on 2026-09-28. Re-measure if the app's layout changes.
const crops = {
  'feature-captions.png': [0.316, 0.007, 0.458, 0.498],
  'feature-titles.png': [0.656, 0.007, 0.337, 0.498],
  'feature-timeline.png': [0.005, 0.519, 0.651, 0.47],
};
for (const [file, [x, y, w, h]] of Object.entries(crops)) {
  await sharp(shot)
    .extract({
      left: content.left + Math.round(content.width * x),
      top: content.top + Math.round(content.height * y),
      width: Math.round(content.width * w),
      height: Math.round(content.height * h),
    })
    .png({ compressionLevel: 9 })
    .toFile(`src/assets/${file}`);
}

// The mark. The app draws it as SVG (a white two-C glyph on the #0568fd tile, since 2026-09-28),
// so the site inlines the rounded tile and renders each favicon from it at its own size instead
// of downscaling a raster. The Apple touch icon comes from the square tile because iOS applies
// its own corner radius.
const rounded = resolve(ASSETS, 'new_concat_logo_512_rounded_light_theme.svg');
const square = resolve(ASSETS, 'new_concat_logo_512_square_light_theme.svg');
if (existsSync(rounded)) {
  copyFileSync(rounded, 'src/assets/mark.svg');
  copyFileSync(rounded, 'public/favicon.svg');
  await sharp(rounded).resize(64, 64).png().toFile('public/favicon.png');
}
if (existsSync(square)) {
  await sharp(square).resize(180, 180).png().toFile('public/apple-touch-icon.png');
}
if (existsSync(resolve(ASSETS, 'icons/concat.ico'))) {
  copyFileSync(resolve(ASSETS, 'icons/concat.ico'), 'public/favicon.ico');
}

for (const f of [
  'src/assets/editor-light.png',
  ...Object.keys(crops).map((c) => `src/assets/${c}`),
]) {
  const m = await sharp(f).metadata();
  console.log(`${f}: ${m.width}x${m.height} (${(m.width / m.height).toFixed(2)})`);
}
console.log('done');
