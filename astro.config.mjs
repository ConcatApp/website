// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import remarkAlerts from './src/lib/remark-alerts.mjs';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Docs and guides are MDX. The unified processor (rather than Astro 7's default Sätteri) so the
  // remark plugin for GitHub-style alerts runs; MDX inherits it. Shiki in a light theme.
  markdown: {
    processor: unified({ remarkPlugins: [remarkAlerts] }),
    shikiConfig: { theme: 'github-light' },
  },

  // Production origin: canonical URLs, absolute Open Graph image URLs and the sitemap all derive
  // from it. The Workers host serves the same build and points its canonicals here.
  site: 'https://concatenate.pages.dev',

  prefetch: true,

  // Fonts are downloaded at build time and self-hosted (no runtime request to Google).
  // Exposed as the CSS variable below; Tailwind maps it to `font-sans` in src/styles/global.css.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Mona Sans',
      cssVariable: '--font-mona',
      weights: ['200 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      display: 'swap',
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx(), sitemap()],
});
