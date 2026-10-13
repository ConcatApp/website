/**
 * Pulls product visuals from the Concat app repository and prepares them for the site.
 *   node scripts/prepare-assets.mjs
 *
 * Source, in order: CONCAT_REPO, a clone at ../timeline, else the raw files on jsDelivr
 * (https://cdn.jsdelivr.net/gh/jub0t/Concat@main/assets/...) downloaded to a temp folder.
 *
 * Outputs
 *   src/assets/editor.png             the hero: the dark capture in src/assets/app/hero.png, or the repo's
 *                                     light screenshot with its chrome cropped away when there is none
 *   src/assets/feature-captions.png   the preview with a generated caption (feature row)
 *   src/assets/feature-titles.png     the preview edge and the text inspector (feature row)
 *   src/assets/feature-timeline.png   the timeline: text, effect, video and speech tracks (feature row)
 *   src/assets/feature-library.png    the Library pane: page tabs, Media filters, Import, the bin
 *   src/assets/sponsors/proxyon.png   the current paid sponsor's logo (README lists it)
 *   src/assets/mark.svg               the app mark (white two-C glyph on the rounded blue tile),
 *                                     inlined by the header and footer
 *   public/favicon.svg                the same file
 *   public/favicon.png                64px, rendered from the rounded tile
 *   public/apple-touch-icon.png       180px, rendered from the square tile (iOS rounds it itself)
 *   public/favicon.ico                the app's own, 16 to 256px frames
 */
import sharp from 'sharp';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CDN = 'https://cdn.jsdelivr.net/gh/jub0t/Concat@main/assets';
const FILES = [
  'editor-light.png',
  'new_concat_logo_512_rounded_light_theme.svg',
  'new_concat_logo_512_square_light_theme.svg',
  'icons/concat.ico',
  'proxyon_sponsor_logo.png',
];

async function findAssets() {
  const local = resolve(process.env.CONCAT_REPO ?? '../timeline', 'assets');
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

// The hero and the feature crops come from a capture of the running app in its dark theme on the
// current release: src/assets/app/hero.png, a 2800x1690 window capture made by hand (see
// docs/RESOURCES.md section 10). The repo's own editor-light.png is only a fallback for a checkout
// without a capture, and it is the older light theme, so prefer the capture.
const capture = 'src/assets/app/hero.png';
let heroSource;
let crops;
if (existsSync(capture)) {
  heroSource = capture;
  // Crops: [capture in src/assets/app, x, y, width, height] as fractions of that capture; measured
  // on 2026-10-10 (0.2.6, 1400x845 window). Each capture is the real app in its dark theme.
  crops = {
    'feature-library.png': ['hero.png', 0.006, 0.045, 0.305, 0.56],
    'feature-captions.png': ['hero.png', 0.0, 0.62, 0.6, 0.38],
    'feature-voices.png': ['tts-sheet.png', 0.31, 0.2, 0.38, 0.6],
    'feature-titles.png': ['text-inspector.png', 0.78, 0.045, 0.215, 0.56],
  };
  await sharp(capture).png({ compressionLevel: 9 }).toFile('src/assets/editor.png');
  console.log('hero from the dark capture', capture);
} else {
  console.warn('no src/assets/app/hero.png capture; falling back to the repo editor-light.png');
  const shot = resolve(ASSETS, 'editor-light.png');
  const { data, info } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const px = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const diff = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
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
  const winH = bottom - top;
  const sampleX = left + Math.round((right - left) * 0.3);
  let titleH = Math.round(winH * 0.048);
  for (let y = top + 20; y < top + Math.round(winH * 0.12); y++) {
    if (diff(px(sampleX, y), px(sampleX, y + 3)) > 18) {
      titleH = y - top + 2;
      break;
    }
  }
  const inset = 6;
  await sharp(shot)
    .extract({
      left: left + inset,
      top: top + titleH,
      width: right - left - inset * 2,
      height: bottom - (top + titleH) - inset,
    })
    .png({ compressionLevel: 9 })
    .toFile('src/assets/editor.png');
  heroSource = 'src/assets/editor.png';
  crops = {
    'feature-captions.png': ['editor.png', 0.316, 0.007, 0.458, 0.498],
    'feature-titles.png': ['editor.png', 0.656, 0.007, 0.337, 0.498],
    'feature-voices.png': ['editor.png', 0.005, 0.519, 0.651, 0.47],
    'feature-library.png': ['editor.png', 0.0, 0.0, 0.312, 0.505],
  };
}
for (const [file, [source, x, y, w, h]] of Object.entries(crops)) {
  const from = existsSync(capture) ? `src/assets/app/${source}` : heroSource;
  if (!existsSync(from)) {
    console.warn(`skip ${file}: no ${from}`);
    continue;
  }
  const { width, height } = await sharp(from).metadata();
  {
    await sharp(from)
      .extract({
        left: Math.round(width * x),
        top: Math.round(height * y),
        width: Math.round(width * w),
        height: Math.round(height * h),
      })
      .png({ compressionLevel: 9 })
      .toFile(`src/assets/${file}`);
  }
}

// The mark. The app draws it as SVG (a white two-C glyph on the #0568fd tile, since 2026-09-28),
// so the site inlines the rounded tile and renders each favicon from it at its own size instead
// of downscaling a raster. The Apple touch icon comes from the square tile because iOS applies
// its own corner radius.
const rounded = resolve(ASSETS, 'new_concat_logo_512_rounded_light_theme.svg');
const square = resolve(ASSETS, 'new_concat_logo_512_square_light_theme.svg');
// Since 2026-10 the app's SVGs embed a PNG of the glyph (a 40 kB data URI). The site inlines the
// mark twice per page and uses it as the favicon, so those are kept at the last clean vector in
// git until the upstream file is a vector again.
const isVector = (f) => existsSync(f) && !readFileSync(f, 'utf8').includes('data:image');
if (!isVector(rounded))
  console.warn('mark: upstream SVG embeds a raster, keeping src/assets/mark.svg');
if (isVector(rounded)) {
  copyFileSync(rounded, 'src/assets/mark.svg');
  copyFileSync(rounded, 'public/favicon.svg');
  await sharp(rounded).resize(64, 64).png().toFile('public/favicon.png');
}
if (isVector(square)) {
  await sharp(square).resize(180, 180).png().toFile('public/apple-touch-icon.png');
}
if (existsSync(resolve(ASSETS, 'icons/concat.ico'))) {
  copyFileSync(resolve(ASSETS, 'icons/concat.ico'), 'public/favicon.ico');
}

// Sponsor logos, as the README ships them.
mkdirSync('src/assets/sponsors', { recursive: true });
if (existsSync(resolve(ASSETS, 'proxyon_sponsor_logo.png'))) {
  await sharp(resolve(ASSETS, 'proxyon_sponsor_logo.png'))
    .resize(256, 256)
    .png({ compressionLevel: 9 })
    .toFile('src/assets/sponsors/proxyon.png');
}

for (const f of ['src/assets/editor.png', ...Object.keys(crops).map((c) => `src/assets/${c}`)]) {
  const m = await sharp(f).metadata();
  console.log(`${f}: ${m.width}x${m.height} (${(m.width / m.height).toFixed(2)})`);
}
console.log('done');
