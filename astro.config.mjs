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
  // from it. The Pages and Workers hosts serve the same build and point their canonicals here.
  site: 'https://concat.standalones.org',

  prefetch: true,

  // Fonts are downloaded at build time and self-hosted (no runtime request to Google).
  // Exposed as CSS variables; Tailwind maps them to `font-sans` and `font-heading` in global.css.
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
    // Headings and display sizes (h1 to h3, section titles, stat numbers); Mona Sans stays the
    // body face. Tailwind maps it to `font-heading` in src/styles/global.css.
    {
      provider: fontProviders.google(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-bricolage',
      weights: ['200 800'],
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
