/**
 * Enriches the sitemap that @astrojs/sitemap writes after the build, for Google Search Console:
 *
 * - `lastmod`: the date of the last commit that touched the page's source (the MDX file for a
 *   guide or a docs page; the landing page and the components it is built from for `/`). Google
 *   uses lastmod to decide what to recrawl, but only while it stays truthful. Cloudflare's
 *   Workers Builds checks out a shallow clone, where every file would get the newest commit's
 *   date, so the first lookup fetches the rest of the history (the repository is public, so no
 *   credentials are involved). If that fails, lastmod is left out rather than made up.
 * - `img`: the image sitemap extension, one entry per picture in the page's <main> (the guide
 *   screenshots, the hero window and the feature crops), so they are found for Google Images.
 *
 * `changefreq` and `priority` are not set: Google ignores both.
 * The serializer runs in `astro:build:done`, so the built HTML in dist/ is there to read.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

function git(args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 120_000,
    }).trim();
  } catch {
    return '';
  }
}

const isShallow = () => git(['rev-parse', '--is-shallow-repository']) !== 'false';

/** Whether commit dates can be trusted: checked once, unshallowing the clone first if needed. */
let history;
function hasHistory() {
  if (history === undefined) {
    if (isShallow()) git(['fetch', '--unshallow', '--quiet']);
    history = !isShallow();
  }
  return history;
}

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
    const content = ['.mdx', '.md', '/index.mdx', '/index.md']
      .map((ext) => base + ext)
      .filter(existsSync);
    if (content.length > 0) return content;
  }
  // A standalone page such as /privacy/ (src/pages/privacy.mdx), or a folder's index page such as
  // /guides/ or /tools/ (src/pages/guides/index.astro).
  return ['.mdx', '.md', '.astro', '/index.astro']
    .map((ext) => `src/pages/${path}${ext}`)
    .filter(existsSync);
}

function lastmodFor(pathname) {
  if (!hasHistory()) return undefined;
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

/**
 * Writes /sitemap.xml, the address people and tools try first, next to the sitemap-index.xml and
 * sitemap-N.xml that @astrojs/sitemap writes. While every page fits in one chunk it is that chunk,
 * the full list of URLs; past one chunk it is the index. List it after sitemap() in
 * `integrations`, so it runs once those files exist.
 */
export function sitemapXml() {
  return {
    name: 'concat:sitemap-xml',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const chunks = readdirSync(out).filter((f) => /^sitemap-\d+\.xml$/.test(f));
        const from = chunks.length === 1 ? chunks[0] : 'sitemap-index.xml';
        if (!existsSync(join(out, from))) return;
        copyFileSync(join(out, from), join(out, 'sitemap.xml'));
        logger.info(`sitemap.xml written from ${from}`);
      },
    },
  };
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
