#!/usr/bin/env node
// Every link from one page of the built site to another lands: the page exists in dist/, and a
// #fragment names an id on it. Run after `astro build`; the reference pages moved from anchors
// to pages of their own once, and a stale /docs/api/types#x link should fail, not 404.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const pages = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? pages(path) : name.endsWith('.html') ? [path] : [];
  });

const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file)) {
    const html = readFileSync(file, 'utf8');
    ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return ids.get(file);
};
const target = (path) => {
  const clean = decodeURIComponent(path).replace(/^\//, '');
  for (const candidate of [clean, join(clean, 'index.html'), `${clean}.html`]) {
    const file = join(dist, candidate);
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return undefined;
};

const broken = [];
for (const file of pages(dist)) {
  const html = readFileSync(file, 'utf8');
  for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
    if (!href.startsWith('/') || href.startsWith('//')) {
      if (
        href.startsWith('#') &&
        href.length > 1 &&
        !idsOf(file).has(decodeURIComponent(href.slice(1)))
      ) {
        broken.push(`${relative(dist, file)}: ${href}`);
      }
      continue;
    }
    const [path, fragment] = href.split('#');
    if (path.startsWith('/_astro/') || path.startsWith('/pagefind/')) continue;
    const page = target(path.split('?')[0]);
    if (!page) broken.push(`${relative(dist, file)}: ${href} (no such page)`);
    else if (fragment && page.endsWith('.html') && !idsOf(page).has(decodeURIComponent(fragment))) {
      broken.push(`${relative(dist, file)}: ${href} (no #${fragment} there)`);
    }
  }
}
if (broken.length) {
  console.error([...new Set(broken)].join('\n'));
  console.error(`${new Set(broken).size} broken internal links.`);
  process.exit(1);
}
console.log('Every internal link lands.');
