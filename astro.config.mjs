// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO: set the production origin once known. Enables canonical URLs,
  // absolute OG image URLs and (if added) @astrojs/sitemap.
  // site: 'https://concat.app',

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
});
