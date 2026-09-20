/**
 * Full-page screenshots of the running site using the locally installed Edge or Chrome.
 *   npm run build && npx astro preview        (or npm run dev)
 *   node scripts/screenshot.mjs [url] [outDir]
 * Defaults: http://127.0.0.1:4321/ and ./.screenshots (git-ignored).
 * Emulates prefers-reduced-motion so scroll reveals render without waiting for animations.
 */
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:4321/';
const outDir = resolve(process.argv[3] ?? '.screenshots');
mkdirSync(outDir, { recursive: true });

const candidates = [
  process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) throw new Error('No Chromium-based browser found. Set BROWSER_PATH.');

const viewports = [
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: 'tablet', width: 834, height: 1112, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

const browser = await puppeteer.launch({ executablePath, headless: true });
try {
  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const file = resolve(outDir, `${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${vp.name.padEnd(8)} ${vp.width}x${vp.height} -> ${file}`);
    await page.close();
  }
} finally {
  await browser.close();
}
