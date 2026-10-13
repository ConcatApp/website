/**
 * Turns raw window captures of the running app (dark theme, current release) into the images the
 * guides use. Captures are made by hand with `screencapture -R x,y,w,h` on a 2x display, so each is
 * 2800x1690 for a 1400x845 window; nothing here is generated or mocked.
 *   node scripts/guide-shots.mjs <captures dir>
 * Outputs src/assets/guides/<name>.png at 1600 px wide, plus the crops listed in CROPS as fractions
 * [x, y, w, h] of the capture, kept at full resolution.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) throw new Error('usage: node scripts/guide-shots.mjs <captures dir>');
const OUT = 'src/assets/guides';
mkdirSync(OUT, { recursive: true });

// Whole-window captures, renamed for the guides.
const FULL = {
  'start.png': 'start.png',
  'demo-editor.png': 'editor.png',
  'menu-file.png': 'menu-file.png',
  'menu-edit.png': 'menu-edit.png',
  'menu-view.png': 'menu-view.png',
  'inspector-audio.png': 'inspector-audio.png',
  'sheet-1.png': 'captions-sheet.png',
  'captions-progress.png': 'captions-progress.png',
  'captions-result.png': 'captions-result.png',
  'tts-sheet.png': 'tts-sheet.png',
  'tts-models.png': 'tts-models.png',
  'tts-progress.png': 'tts-progress.png',
  'tts-result.png': 'tts-result.png',
  'hero.png': 'hero.png',
  'library-text.png': 'library-text.png',
  'library-stickers.png': 'library-stickers.png',
  'library-transitions.png': 'library-transitions.png',
  'library-effects.png': 'library-effects.png',
  'library-filters.png': 'library-filters.png',
  'library-templates.png': 'library-templates.png',
  'export.png': 'export.png',
  'settings-general.png': 'settings-general.png',
  'settings-appearance.png': 'settings-appearance.png',
  'settings-transcriber.png': 'settings-transcriber.png',
  'settings-speech.png': 'settings-speech.png',
  'settings-remote.png': 'settings-remote.png',
  'settings-version.png': 'settings-version.png',
  'settings-about.png': 'settings-about.png',
  'inspector-video.png': 'inspector-video.png',
  'inspector-effects.png': 'inspector-effects.png',
  'inspector-adjust.png': 'inspector-adjust.png',
  'inspector-text.png': 'inspector-text.png',
  'keyframes.png': 'keyframes.png',
  'clip-menu.png': 'clip-menu.png',
  'new-project.png': 'new-project.png',
  'pane-switcher.png': 'pane-switcher.png',
  'remove-background.png': 'remove-background.png',
};

// Crops of a capture: [source, x, y, w, h] as fractions. Full resolution, no resize.
const CROPS = {
  'tray.png': ['demo-editor.png', 0, 0.655, 0.5, 0.045],
  'library-tabs.png': ['demo-editor.png', 0, 0.045, 0.31, 0.06],
  'track-header.png': ['demo-editor.png', 0, 0.735, 0.137, 0.07],
  'monitor-controls.png': ['demo-editor.png', 0.315, 0.555, 0.465, 0.055],
  'title-strip.png': ['demo-editor.png', 0.6, 0, 0.4, 0.038],
};

for (const [src, out] of Object.entries(FULL)) {
  const file = join(dir, src);
  if (!existsSync(file)) continue;
  await sharp(file).resize({ width: 1600 }).png({ compressionLevel: 9 }).toFile(join(OUT, out));
  console.log(`${out}`);
}
for (const [out, [src, x, y, w, h]] of Object.entries(CROPS)) {
  const file = join(dir, src);
  if (!existsSync(file)) continue;
  const { width, height } = await sharp(file).metadata();
  await sharp(file)
    .extract({
      left: Math.round(width * x),
      top: Math.round(height * y),
      width: Math.round(width * w),
      height: Math.round(height * h),
    })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, out));
  console.log(`${out} (crop)`);
}
