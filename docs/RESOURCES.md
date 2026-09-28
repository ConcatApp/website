# Resources for the Concat landing page

Concat: the free, open-source CapCut replacement. Native Rust engine, 100% local, distributed via GitHub Releases.

Curated from research on 2026-09-20; direction revised on 2026-09-27. Direction: light, premium,
restrained, one blue accent. No cheap gradients, no purple, no template feel. The first dark version took its
cues from [spline.design](https://spline.design/) and [diffusion.studio](https://diffusion.studio/); the light
version takes them from linear.app, vercel.com, resend.com and stripe.com.

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

## 2. Inspiration (light, premium)

Galleries, filter to light or minimal:

- Godly: https://godly.website/
- landing.love: https://www.landing.love/
- Saaspo, SaaS landing pages: https://saaspo.com/
- One Page Love: https://onepagelove.com/
- Refero (UX flows and real product screens): https://refero.design/
- Landingfolio, mobile app category: https://www.landingfolio.com/inspiration/landing-page/mobile-app
- AppLaunchFlow, 12 mobile app landing pages 2026: https://www.applaunchflow.com/blog/mobile-app-landing-page-examples-2026

Reference sites worth studying directly (type, spacing, restraint, all light or with a light mode): linear.app,
vercel.com, stripe.com, resend.com, raycast.com, cal.com, cursor.com, apple.com. Open-source desktop apps with
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
- Pitfall found here (2026-09-27): Astro's ClientRouter handles same-page `#hash` links by setting `location.href`
  (a native jump). Lenis's `anchors` option then measures the target from the new viewport position and scrolls the
  page back to the top whenever that position is fractional. `src/scripts/scroll.ts` catches the click in the
  capture phase, prevents the default (ClientRouter skips prevented clicks) and scrolls through Lenis itself.

## 5. Components (optional, not installed)

- **Starwind UI**: shadcn-style components written for Astro + Tailwind v4, copied into the repo.
  `npx starwind@latest init --defaults` then `npx starwind@latest add button`. https://starwind.dev/docs/
- **Basecoat**: shadcn look as plain CSS + vanilla JS, framework-agnostic. https://github.com/hunvreus/basecoat
- **shadcn/ui on Astro** (needs `@astrojs/react` islands): https://ui.shadcn.com/docs/installation/astro
- React-only animated kits (only if React islands are added; they ship JS): Aceternity https://ui.aceternity.com/,
  Magic UI https://magicui.design/, React Bits https://reactbits.dev/

Recommendation: stay Astro-native for the landing page. Add Starwind only if we need dialogs/tabs/accordion.

## 6. Visual assets

- **Product screenshots**: the app repo ships `assets/editor-light.png` and `assets/editor-dark.png` (macOS
  windows, about 3000x1900). `npm run assets:prepare` downloads the light one from jsDelivr, crops the window
  chrome away for the hero and cuts the three feature-row crops. A real mobile screenshot is still missing.
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

## 8. Design rules we are following (revised 2026-09-28, after section 9)

- White page, one gray (`bg-bg-subtle`, oklch 97.4%) for media bands and secondary buttons, text a cool
  near-black (oklch 16%), never #000. Mona Sans throughout, headlines at weight 450 with near-normal tracking.
- Structure from 1px rules only: a top rule per section and the two vertical "gridline" rules on the 80rem
  column from 1280px up. No shadows, gradients, glows or grain.
- One accent, the app's lavender #b394ff, used as a fill (primary buttons with dark text, selected borders, the
  Recommended badge). Text in the accent hue uses `accent-ink` (oklch 46% 0.2 300) because #b394ff is only
  2.2:1 on white. The app icon stays lime and appears only as the favicon.
- Every text token clears WCAG AA (4.5:1) on white and on the gray band. Check before changing one.
- Controls 6px, cards 8px, media tiles 12px. No pills. Arrow links for secondary actions.
- Real screenshots only, cropped from the app repo's `editor-light.png` by `scripts/prepare-assets.mjs`.
- Section rhythm 64 to 96px; the reference is dense, not airy.
- Motion is short, eased (expo-out), and mostly one-shot reveals. Respect `prefers-reduced-motion`.
- No numbered section labels, no em dashes, no availability eyebrows. They read as generated.
- References: Anti-slop frontend framework https://moelkholy1995.medium.com/beyond-make-it-beautiful-the-anti-slop-framework-for-ai-frontend-craftsmanship-c99bbee6c994

## 9. Reference: GitHub Sponsors page (researched 2026-09-28)

https://github.com/open-source/sponsors is a GitHub marketing page, not a repo. It is composed from Primer Brand,
GitHub's marketing design system (repo https://github.com/primer/brand, docs https://primer.style/brand), using the
2026 "gridline" variants (Section gridline PR: https://github.com/primer/brand/pull/1477). Light mode only.

- Page order: SubNav, Hero (gridline, centered, product mock block-end), Statistic row (3 cells), SectionIntro
  (one big centered statement, max 24ch), three River sections (40/60, text and UI mock alternating), Testimonial
  (expressive, monospace quote), CTABanner (rounded canvas-subtle container), three minimal Cards with arrow links,
  FAQ (gridline accordion), footer.
- Gridline: 1px `border-muted` vertical rules at the edges of a 1280px container, drawn with `::before`/`::after`
  so they run through section padding; adjacent sections share one rule; rules only appear from 1280px up
  (`@container (min-width: 1280px)`). Horizontal rules separate sections. No shadows anywhere.
- Color tokens (light): canvas `#ffffff`, canvas-subtle `#F2F5F3`, border-muted `#E4EBE6`, border-default gray-4,
  text default `#000000`, text muted gray-7, link blue-6 `#0055D5`. Accent on this page is green (Sponsors);
  ours stays blue.
- Type: Mona Sans (SIL OFL 1.1, variable wght 200 to 900, wdth 75 to 125, on Google Fonts;
  https://github.com/github/mona-sans). Heading weights 425 to 480, letter-spacing 0, line-height 1.0 to 1.1 for
  display sizes. Text scale 14/16/18/20/22/24/28/32/36/40px. Subhead 16 to 18px at weight 475 to 550. Stats,
  labels and the testimonial use Mona Sans Mono.
- Controls: buttons 6px radius, 40 to 48px tall, primary solid plus secondary gray fill with border; cards 8px
  radius, media tiles 16px; arrow links ("Learn more" with an expandable arrow) instead of secondary buttons.
- Media: UI mocks sit in a white, bordered frame on a soft pastel tile (lavender, mint, peach). That is the one
  element that conflicts with the no-gradient rule here; a flat canvas-subtle band with the `bg-dots` utility is
  the restrained equivalent.
- Motion: `reveal-in-up` / `slide-in-up` at 1000ms, a typewriter label in the hero. Same class as our reveals.
- Screenshots for comparison were taken with headless Chrome:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --screenshot=out.png --window-size=1440,4600 --timeout=20000 URL`
  wrapped in `perl -e 'alarm 75; exec @ARGV'`. `--virtual-time-budget` never settles on github.com; avoid it.
