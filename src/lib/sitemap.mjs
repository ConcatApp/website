/**
 * Enriches the sitemap that @astrojs/sitemap writes after the build, for Google Search Console:
 *
 * - `lastmod`: the date of the last commit that touched the page's source (the MDX file for a
 *   guide or a docs page; the landing page and the components it is built from for `/`). Google
 *   uses lastmod to decide what to recrawl, but only while it stays truthful, so on a shallow
 *   clone, where every file would get the newest commit's date, it is left out instead.
 * - `img`: the image sitemap extension, one entry per picture in the page's <main> (the guide
 *   screenshots, the hero window and the feature crops), so they are found for Google Images.
 *
 * `changefreq` and `priority` are not set: Google ignores both.
 * The serializer runs in `astro:build:done`, so the built HTML in dist/ is there to read.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function git(args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

const shallow = git(['rev-parse', '--is-shallow-repository']) !== 'false';

/** The source files a URL path is built from. */
function sourcesFor(pathname) {
  const path = pathname.replace(/^\/|\/$/g, '');
  if (path === '') {
    return [
      'src/pages/index.astro',
      'src/components',
      'src/lib/sponsor.ts',
      'src/assets/editor.png',
    ];
  }
  const [kind, ...rest] = path.split('/');
  if (kind === 'docs' || kind === 'guides') {
    const slug = rest.length === 0 ? 'index' : rest.join('/');
    const base = `src/content/${kind}/${slug}`;
    return ['.mdx', '.md', '/index.mdx', '/index.md'].map((ext) => base + ext).filter(existsSync);
  }
  return [];
}

function lastmodFor(pathname) {
  if (shallow) return undefined;
  const files = sourcesFor(pathname);
  if (files.length === 0) return undefined;
  const date = git(['log', '-1', '--format=%cI', '--', ...files]);
  return date || undefined;
}

/** Absolute URLs of the images inside the page's <main>, without the mark or icons. */
function imagesFor(outDir, url) {
  const { pathname, origin } = new URL(url);
  const file = join(outDir, pathname, 'index.html');
  if (!existsSync(file)) return [];
  const html = readFileSync(file, 'utf8');
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';
  const seen = new Set();
  const images = [];
  for (const tag of main.match(/<img\b[^>]*>/g) ?? []) {
    const src = tag.match(/\ssrc="([^"]+)"/)?.[1];
    if (!src || src.startsWith('data:') || /\/mark\./.test(src)) continue;
    const abs = new URL(src.replaceAll('&amp;', '&'), origin).toString();
    if (seen.has(abs)) continue;
    seen.add(abs);
    images.push({ url: abs });
  }
  return images;
}

/** The `serialize` hook for @astrojs/sitemap. `outDir` is the build's output folder. */
export function enrich(outDir) {
  return (item) => {
    const { pathname } = new URL(item.url);
    const lastmod = lastmodFor(pathname);
    const img = imagesFor(outDir, item.url);
    return {
      ...item,
      ...(lastmod && { lastmod }),
      ...(img.length > 0 && { img }),
    };
  };
}
