// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import remarkAlerts from './src/lib/remark-alerts.mjs';
import { codeFrame } from './src/lib/code-frame.mjs';

import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { enrich, sitemapXml } from './src/lib/sitemap.mjs';

// https://astro.build/config
export default defineConfig({
  // Reference pages whose type was renamed in a release: the old address keeps working.
  redirects: { '/docs/api/types/clip-mask': '/docs/api/types/mask' },
  // Docs and guides are MDX. The unified processor (rather than Astro 7's default Sätteri) so the
  // remark plugin for GitHub-style alerts runs; MDX inherits it. Shiki in a dark theme, like the page.
  markdown: {
    processor: unified({ remarkPlugins: [remarkAlerts] }),
    // Every block framed with its language and a Copy button (src/lib/code-frame.mjs).
    shikiConfig: { theme: 'github-dark-default', transformers: [codeFrame] },
  },

  // Production origin: canonical URLs, absolute Open Graph image URLs and the sitemap all derive
  // from it. The Pages and Workers hosts serve the same build and point their canonicals here.
  site: 'https://concat.standalones.org',

  prefetch: true,

  // Fonts are downloaded at build time and self-hosted (no runtime request to Google).
  // Exposed as CSS variables; Tailwind maps them to `font-sans` and `font-hand` in global.css.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      display: 'swap',
    },
    // The one handwritten aside next to the hero button.
    {
      provider: fontProviders.google(),
      name: 'Gamja Flower',
      cssVariable: '--font-gamja',
      weights: ['400'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Segoe Print', 'cursive'],
      display: 'swap',
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  // The sitemap gets each page's last commit date and its images (src/lib/sitemap.mjs). The 404
  // page is left out: it is noindex. sitemapXml() then writes /sitemap.xml from it. People get
  // the HTML sitemap at /sitemap/ instead (src/pages/sitemap.astro): Chromium is removing XSLT,
  // so a styled XML sitemap would show its visitors a warning.
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page),
      serialize: enrich(fileURLToPath(new URL('./dist/', import.meta.url))),
    }),
    sitemapXml(),
  ],
});
