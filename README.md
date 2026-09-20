# Concat website

Landing page for [Concat](https://github.com/jub0t/Concat), the free and open-source CapCut replacement.
Dark, premium, static. Downloads come straight from GitHub Releases.

**Stack**: Astro 7 · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis · Motion · Lucide · Hanken Grotesk (self-hosted via Astro Fonts API)

## Develop

```sh
npm install
npm run dev              # http://localhost:4321
npm run build            # -> dist/
npm run check            # types
npm run format           # prettier (astro + tailwind class sorting)
npm run assets:prepare   # re-crop screenshot + copy logos from ../relay (the app repo)
```

## Layout

```
src/
  layouts/Base.astro          meta, fonts, view transitions, scroll script
  styles/global.css           design tokens (@theme) + utilities (@utility)
  scripts/scroll.ts           Lenis + GSAP ScrollTrigger + Motion reveals
  scripts/platform.ts         client OS detection
  lib/releases.ts             GitHub release manifest -> platforms / architectures / files
  data/release-manifest.json  offline fallback snapshot of the manifest
  components/                 Button, Section, Container, Header, Footer, DeviceFrames,
                              DownloadButton, Downloader
  assets/                     editor screenshot, phone preview, logos
public/                       favicons
docs/RESOURCES.md             research: inspiration, tools, guidelines
```

Design rules and product facts live in `CLAUDE.md`.
