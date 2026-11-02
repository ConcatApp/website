/**
 * Renders the social share image (public/og.png, 1200x630) with headless Chrome so it uses the
 * site's real typeface and look: the dark page, the mark, the two-line gradient headline and the
 * editor window on the blue band. Run it after changing the headline, the mark or the hero
 * screenshot:
 *   node scripts/og-image.mjs
 *   CHROME=/path/to/chrome node scripts/og-image.mjs
 * Without CHROME it looks for Chrome or Edge in their usual places. The result is committed; the
 * build never runs this.
 */
import puppeteer from 'puppeteer-core';
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

const CHROME = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p));
if (!CHROME) throw new Error('No Chrome or Edge found. Set CHROME.');
const OUT = resolve('public/og.png');
const shot = pathToFileURL(resolve('src/assets/editor.png')).href;
const mark = `data:image/png;base64,${readFileSync(resolve('src/assets/mark.png')).toString('base64')}`;

// Geist: the copy Astro's Fonts API cached for the build when there is one (no network,
// deterministic), otherwise the Google Fonts stylesheet.
function findCachedFont() {
  for (const dir of ['.astro/fonts', 'node_modules/.astro/fonts']) {
    if (!existsSync(dir)) continue;
    const file = readdirSync(dir).find((f) => /geist/i.test(f) && f.endsWith('.woff2'));
    if (file) return pathToFileURL(resolve(dir, file)).href;
  }
  return undefined;
}
const cached = findCachedFont();
const fontCss = cached
  ? `@font-face { font-family: 'Geist'; src: url('${cached}') format('woff2'); font-weight: 100 900; font-display: block; }`
  : `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400..600&display=block');`;

// The band and the headline gradients are the ones in src/styles/global.css and index.astro.
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
    font-family: 'Geist', system-ui, sans-serif;
    color: #efefef;
    background: #0b0b0b;
    -webkit-font-smoothing: antialiased;
  }
  .copy { position: absolute; left: 0; right: 0; top: 52px; text-align: center; }
  .brand { display: inline-flex; align-items: center; gap: 12px; font-size: 22px; font-weight: 500; letter-spacing: -0.01em; }
  .brand img { width: 40px; height: 40px; border-radius: 18.5%; box-shadow: 0 0 0 1px rgba(255,255,255,0.12); }
  h1 { margin-top: 26px; font-size: 64px; font-weight: 500; letter-spacing: -0.03em; line-height: 1.016; }
  .grad { display: inline-block; padding-bottom: 0.08em; margin-bottom: -0.08em; -webkit-background-clip: text; background-clip: text; color: transparent; }
  .grad-a { background-image: linear-gradient(90deg, #f6f9ff 0%, #dbe8ff 40%, #9ec4ff 75%, #7cb0ff 100%); }
  .grad-b { background-image: linear-gradient(90deg, #b9d4ff 0%, #79adff 45%, #3d8bff 100%); }
  .band {
    position: absolute; left: 0; right: 0; top: 330px; bottom: 0;
    border-radius: 40px 40px 0 0;
    background-color: #0568fd;
    background-image:
      radial-gradient(60% 75% at 18% 16%, #4a90ff 0%, transparent 70%),
      radial-gradient(50% 65% at 86% 18%, #2a7bff 0%, transparent 70%),
      radial-gradient(70% 80% at 55% 60%, #0a5cf0 0%, transparent 75%),
      radial-gradient(60% 75% at 86% 100%, #04268a 0%, transparent 70%),
      radial-gradient(50% 65% at 8% 100%, #062f9c 0%, transparent 70%),
      linear-gradient(170deg, #1a6dff, #0557e6 50%, #0438a8);
  }
  .shot {
    position: absolute; left: 110px; right: 110px; top: 368px;
    border-radius: 16px 16px 0 0; overflow: hidden; background: #171717;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.14), 0 30px 80px -24px rgba(0,0,0,0.45);
  }
  .shot img { display: block; width: 100%; }
</style>
</head>
<body>
  <div class="copy">
    <div class="brand"><img src="${mark}" alt=""><span>Concat</span></div>
    <h1><span class="grad grad-a">The free, open-source</span><br><span class="grad grad-b">CapCut replacement.</span></h1>
  </div>
  <div class="band"></div>
  <div class="shot"><img src="${shot}" alt=""></div>
</body>
</html>`;

const dir = mkdtempSync(join(tmpdir(), 'concat-og-'));
const page = join(dir, 'og.html');
writeFileSync(page, html);

// Puppeteer sets the viewport to exactly 1200x630; a bare --window-size leaves the page short
// by the height of the browser's own chrome on some builds.
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--allow-file-access-from-files'],
});
try {
  const tab = await browser.newPage();
  await tab.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await tab.goto(pathToFileURL(page).href, { waitUntil: 'networkidle0' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`wrote ${OUT} (${Math.round(statSync(OUT).size / 1024)} kB)`);
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
