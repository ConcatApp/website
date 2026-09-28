/**
 * Renders the social share image (public/og.png, 1200x630) with headless Chrome so it uses the
 * site's real typeface and tokens. Run it after changing the headline, the mark or the hero
 * screenshot:
 *   node scripts/og-image.mjs
 *   CHROME=/path/to/chrome node scripts/og-image.mjs
 * The result is committed; the build never runs this.
 */
import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = resolve('public/og.png');
const shot = pathToFileURL(resolve('src/assets/editor-light.png')).href;
const mark = readFileSync(resolve('src/assets/mark.svg'), 'utf8');

// Mona Sans: the copy Astro's Fonts API cached for the build when there is one (no network,
// deterministic), otherwise the Google Fonts stylesheet.
function findCachedFont() {
  for (const dir of ['.astro/fonts', 'node_modules/.astro/fonts']) {
    if (!existsSync(dir)) continue;
    const file = readdirSync(dir).find((f) => /mona/i.test(f) && f.endsWith('.woff2'));
    if (file) return pathToFileURL(resolve(dir, file)).href;
  }
  return undefined;
}
const cached = findCachedFont();
const fontCss = cached
  ? `@font-face { font-family: 'Mona Sans'; src: url('${cached}') format('woff2'); font-weight: 200 900; font-display: block; }`
  : `@import url('https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400..600&display=block');`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  ${fontCss}
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    position: relative;
    font-family: 'Mona Sans', system-ui, sans-serif;
    color: oklch(16% 0.012 262);
    background: #fff;
    -webkit-font-smoothing: antialiased;
  }
  .rule { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(23, 26, 38, 0.1); }
  .rule.l { left: 64px; } .rule.r { right: 64px; }
  .copy { position: absolute; left: 112px; top: 44px; width: 760px; }
  .brand { display: flex; align-items: center; gap: 12px; font-size: 22px; font-weight: 500; }
  .brand svg { width: 40px; height: 40px; }
  h1 { margin-top: 22px; font-size: 60px; font-weight: 450; letter-spacing: -0.015em; line-height: 1.04; }
  p { margin-top: 16px; font-size: 23px; line-height: 1.4; color: oklch(45% 0.018 262); max-width: 640px; }
  .tag {
    display: inline-flex; align-items: center; margin-top: 22px;
    height: 42px; padding: 0 16px; border-radius: 8px; background: #0568fd; color: #fff;
    font-size: 19px; font-weight: 500;
  }
  .band {
    position: absolute; left: 65px; right: 65px; bottom: 0; height: 236px; overflow: hidden;
    background-color: oklch(97.4% 0.003 250);
    background-image: radial-gradient(rgba(23, 26, 38, 0.09) 1px, transparent 1px);
    background-size: 20px 20px;
    border-top: 1px solid rgba(23, 26, 38, 0.1);
  }
  .shot {
    position: absolute; left: 112px; right: 112px; top: 28px;
    border: 1px solid rgba(23, 26, 38, 0.12); border-radius: 10px 10px 0 0;
    overflow: hidden; background: #fff;
  }
  .shot img { display: block; width: 100%; }
</style>
</head>
<body>
  <div class="rule l"></div><div class="rule r"></div>
  <div class="copy">
    <div class="brand">${mark}<span>Concat</span></div>
    <h1>The free, open-source CapCut replacement.</h1>
    <p>Auto-captions, voices, effects and 4K export, all on your machine. No watermark, no account, no subscription.</p>
    <span class="tag">concatenate.pages.dev</span>
  </div>
  <div class="band">
    <div class="shot"><img src="${shot}" alt=""></div>
  </div>
</body>
</html>`;

const dir = mkdtempSync(join(tmpdir(), 'concat-og-'));
const page = join(dir, 'og.html');
writeFileSync(page, html);
rmSync(OUT, { force: true });

// Headless Chrome writes the screenshot but does not exit on file:// pages, so wait for the
// file to appear and settle, then stop the browser ourselves.
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--allow-file-access-from-files',
    `--user-data-dir=${join(dir, 'profile')}`,
    // Virtual time lets the font and the screenshot load fully before the capture.
    '--virtual-time-budget=10000',
    '--window-size=1200,630',
    `--screenshot=${OUT}`,
    pathToFileURL(page).href,
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const deadline = Date.now() + 60_000;
let size = 0;
try {
  while (Date.now() < deadline) {
    await sleep(500);
    if (!existsSync(OUT)) continue;
    const now = statSync(OUT).size;
    if (now > 0 && now === size) break;
    size = now;
  }
  if (size === 0) throw new Error('Chrome did not write the screenshot within 60s');
  console.log(`wrote ${OUT} (${Math.round(size / 1024)} kB)`);
} finally {
  // Let Chrome exit before removing its profile folder, or the folder is still being written.
  const exited = new Promise((r) => chrome.once('exit', r));
  chrome.kill();
  await Promise.race([exited, sleep(5000)]);
  rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
