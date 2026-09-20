# Resources for the Concat landing page

Concat: the free, open-source CapCut replacement. Native Rust engine, 100% local, distributed via GitHub Releases.

Curated from research on 2026-09-20. Direction: dark, premium, restrained. No cheap gradients,
no purple glow, no template feel. Inspiration named by the team: [spline.design](https://spline.design/)
and [diffusion.studio](https://diffusion.studio/).

## 1. Installed stack

| Package                                               | Version | Role                                                                          | Docs                                                             |
| ----------------------------------------------------- | ------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| astro                                                 | 7.3     | Framework, static output, Fonts API, View Transitions                         | https://docs.astro.build                                         |
| tailwindcss + @tailwindcss/vite                       | 4.3     | Styling, CSS-first tokens in `src/styles/global.css`                          | https://tailwindcss.com/docs/installation/framework-guides/astro |
| gsap (incl. ScrollTrigger, SplitText, ScrollSmoother) | 3.15    | Scroll-linked and timeline animation. All plugins are free on npm since 2025  | https://gsap.com/docs/v3/Installation/                           |
| lenis                                                 | 1.3     | Smooth inertial scroll, drives ScrollTrigger                                  | https://github.com/darkroomengineering/lenis                     |
| motion                                                | 13.4    | `inView` reveals, `animate`, springs. 0.5 kB `inView` on IntersectionObserver | https://motion.dev/docs/inview                                   |
| @lucide/astro                                         | 1.47    | Official Lucide icons as Astro components (inline SVG, zero runtime)          | https://lucide.dev/guide/astro/                                  |
| clsx + tailwind-merge                                 |         | `cn()` helper in `src/lib/cn.ts`                                              |                                                                  |
| prettier + astro + tailwind plugins                   |         | Formatting and class sorting (`npm run format`)                               |                                                                  |
| @astrojs/check + typescript                           |         | `npm run check`                                                               |                                                                  |

Wiring lives in `src/scripts/scroll.ts` (Lenis + GSAP ticker sync, Motion reveals, view-transition
lifecycle) and `src/layouts/Base.astro`.

## 2. Inspiration (dark, premium)

Galleries, filter to dark:

- Godly: https://godly.website/
- landing.love, dark mode + animation: https://www.landing.love/style/dark-mode/
- Saaspo, dark mode SaaS: https://saaspo.com/style/dark-mode
- Dark Mode Design: https://www.darkmodedesign.com/
- a1.gallery, dark landing: https://www.a1.gallery/websites/dark-landing
- One Page Love, dark: https://onepagelove.com/dark-schemed-landing-pages
- Refero (UX flows and real product screens): https://refero.design/
- Landingfolio, mobile app category: https://www.landingfolio.com/inspiration/landing-page/mobile-app
- AppLaunchFlow, 12 mobile app landing pages 2026: https://www.applaunchflow.com/blog/mobile-app-landing-page-examples-2026

Reference sites worth studying directly (type, spacing, restraint): linear.app, vercel.com, raycast.com,
arc.net, resend.com, family.co, cursor.com, spline.design, diffusion.studio. Open-source desktop apps with
strong download pages: obsidian.md, zed.dev, blender.org/download, signal.org/download.

## 3. Typography

- **Hanken Grotesk** (chosen). Google Fonts, variable 100 to 900 with italics. Self-hosted via Astro's
  Fonts API, no runtime Google request. https://fonts.google.com/specimen/Hanken+Grotesk
- Pairing options if a second voice is needed: Instrument Serif italic for a single accent word
  (https://fonts.google.com/specimen/Instrument+Serif), or a mono for metadata (currently a system mono
  stack; JetBrains Mono / Geist Mono are one config line away).
- Fontshare faces (Satoshi, General Sans) are free for web but not on Google Fonts. Use
  `fontProviders.local()` with the downloaded files if wanted.
- Untitled UI, best free UI fonts and practices: https://www.untitledui.com/blog/best-free-fonts
- Astro Fonts API reference: https://docs.astro.build/en/guides/fonts/

## 4. Motion

- Motion docs: `inView` https://motion.dev/docs/inview, `scroll` https://motion.dev/docs/scroll
- Motion with Astro (Netlify guide): https://developers.netlify.com/guides/motion-animation-library-with-astro/
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- GSAP SplitText (free now, for line/word reveals on the hero headline): https://gsap.com/docs/v3/Plugins/SplitText/
- Lenis + GSAP integration pattern: https://github.com/darkroomengineering/lenis#gsap-scrolltrigger
- Astro View Transitions and lifecycle events: https://docs.astro.build/en/guides/view-transitions/
- Production pitfalls with Astro + GSAP + Lenis: https://dev.to/keymelgaston/4-motion-design-bugs-that-break-astro-gsap-lenis-sites-in-production-31ac
- Codrops, minimalist Astro + GSAP build (reveals, flip transitions): https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/
- AstroAnimate, Astro-specific animation patterns: https://www.astroanimate.com/

## 5. Components (optional, not installed)

- **Starwind UI**: shadcn-style components written for Astro + Tailwind v4, copied into the repo.
  `npx starwind@latest init --defaults` then `npx starwind@latest add button`. https://starwind.dev/docs/
- **Basecoat**: shadcn look as plain CSS + vanilla JS, framework-agnostic. https://github.com/hunvreus/basecoat
- **shadcn/ui on Astro** (needs `@astrojs/react` islands): https://ui.shadcn.com/docs/installation/astro
- React-only animated kits (only if React islands are added; they ship JS): Aceternity https://ui.aceternity.com/,
  Magic UI https://magicui.design/, React Bits https://reactbits.dev/

Recommendation: stay Astro-native for the landing page. Add Starwind only if we need dialogs/tabs/accordion.

## 6. Visual assets

- **Product screenshots**: the app repo ships `assets/editor-dark.png` (macOS window, 3164x1920).
  `npm run assets:prepare` crops the chrome away and extracts the 9:16 preview for the phone frame.
  Replace `src/assets/phone-preview.png` with a real mobile screenshot when one exists.
- **Device mockups**: Rotato (3D animated iPhone/Android renders, 4K) https://rotato.app/,
  Shots.so https://shots.so/, Mockuuups Studio https://mockuuups.studio/,
  Apple Design Resources (official bezels, Figma/Sketch) https://developer.apple.com/design/resources/
- **App demo video**: Screen Studio https://screen.studio/ (or record an export in Concat itself)
- **WebGL / 3D backgrounds**: Unicorn Studio (Figma-like shader editor, exports an embed) https://www.unicorn.studio/,
  Spline (3D scenes, `@splinetool/viewer` web component) https://spline.design/
- **Grain and noise**: CSS-Tricks grainy gradients (feTurbulence) https://css-tricks.com/grainy-gradients/,
  MagicPattern noise generator https://www.magicpattern.design/tools/add-grain-to-images.
  A `grain-overlay` utility is already in `global.css`.
- **OG image**: generate at build time with `astro-og-canvas` or satori once copy is final.

## 7. Distribution: GitHub Releases (no app stores)

Concat is not on the App Store or Google Play. Every platform build is a GitHub Releases asset, so the site
must never show store badges. What we use instead:

- Release manifest: `https://github.com/jub0t/Concat/releases/latest/download/manifest.json` lists every
  binary with URL, size and sha256 (schema 2: `binaries.<os>.<arch>.<kind>`). Fetched at build time in
  `src/lib/releases.ts`, snapshot in `src/data/release-manifest.json`.
- Stable per-file links: `releases/latest/download/<asset>` (needs the exact versioned filename, hence the manifest).
- Two-step picker (`src/components/Downloader.astro`): operating system, then architecture, then the files
  for that pair. Windows: x64 / ARM64, installer or MSI. macOS: Apple Silicon / Intel, dmg. Linux: x86_64 /
  ARM64, AppImage / deb / rpm. Android and iOS have one build each.
- OS detection for defaults: `navigator.userAgentData?.platform`, then `navigator.platform` / UA string.
  iPadOS reports as Mac with touch points, handled in `src/scripts/platform.ts`.
- macOS builds are unsigned: show the quarantine command from the README next to the download.
- iOS is a beta IPA installed by sideloading. Say so plainly; do not imply store availability.
- Android APK: mention the "allow installs from this source" prompt.
- Checksums: link `SHA256SUMS` from the release for people who verify downloads.
- Nice to have later: release notes excerpt, download counts from the GitHub API
  (`/repos/jub0t/Concat/releases`, `download_count` per asset), a "copy sha256" button.

## 8. Design rules we are following

- Backgrounds near-black (oklch 13%), never #000. Text off-white, never #fff for body.
- Depth from hairlines and one-pixel top highlights, not glows or gradients.
- One accent color (brand lime `#c6f432`), used sparingly. Type and spacing carry the brand.
- Big, tight-tracked headline; generous section rhythm; max ~76rem content width.
- Motion is short, eased (expo-out), and mostly one-shot reveals. Respect `prefers-reduced-motion`.
- No numbered section labels, no em dashes, no availability eyebrows. They read as generated.
- References: Anti-slop frontend framework https://moelkholy1995.medium.com/beyond-make-it-beautiful-the-anti-slop-framework-for-ai-frontend-craftsmanship-c99bbee6c994,
  premium dark UI with Tailwind v4 https://www.toilatung.com/en/blog/bi-quyet-thiet-ke-premium-dark-ui-bang-tailwind-css-va-claude
