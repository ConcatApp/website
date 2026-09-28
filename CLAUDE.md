# Concat website

Landing page for Concat, the free and open-source CapCut replacement (github.com/jub0t/Concat).
Astro 7, Tailwind v4, static output. Product visuals come from the app repo's `assets/` folder, pulled from
jsDelivr by `npm run assets:prepare` (a local clone at `../relay` or `CONCAT_REPO` is used when present).

## Product facts (from the app README)

- Video editor with a native Rust engine and a GPU compositor. Runs 100% locally and offline once the optional
  models are downloaded from Settings: no watermarks, no account, no subscription, no upload.
- Features the README claims, and nothing else: auto-captions (local Whisper), text-to-speech and voice cloning,
  background removal, keyframes with a curve editor, 170+ effects, filters, transitions and text animations,
  multi-track and multi-timeline editing, titles, one-switch voice cleanup, export in H.264, HEVC and AV1 up to
  4K 60 10-bit, a JSON-RPC, gRPC and MCP API plus a CLI, 14 languages.
- Platforms shown on the site are whatever the release manifest ships: Windows (x64, ARM64), macOS (Apple
  Silicon, Intel, unsigned), Linux (AppImage/deb/rpm, x64, ARM64), Android (APK), iOS (IPA, beta, sideload).
- Distribution is GitHub Releases only. Not on the App Store or Google Play; never show store badges.
- Each release ships `manifest.json` with per-platform URLs, sizes and sha256. `src/lib/releases.ts` fetches
  it at build time and falls back to `src/data/release-manifest.json`. Refresh that snapshot occasionally.
- The stats row uses real numbers only: `src/lib/stats.ts` fetches GitHub stars and the download total across
  every release at build time, falling back to `src/data/github-stats.json`. `GITHUB_TOKEN` in the build
  environment lifts the API rate limit (the Pages workflow passes it). "170+ effects" and "14 languages" are
  the README's own figures.
- The app mark is a white two-C glyph on a blue tile. The blue, `#0568fd`, is the app's primary color and
  the site accent (see Design rules). The app repo draws the mark as SVG (`assets/new_concat_logo_512_*.svg`,
  since 2026-09-28); the asset script copies the rounded light tile to `src/assets/mark.svg`, which the header
  and footer inline, and renders the favicons from it. Community: Discord, AGPL-3.0 license.
- Sponsorship: two monthly tiers in `src/lib/sponsor.ts`: Public sponsor ($100 a month, recommended) and
  Enterprise (price shown as "Custom", agreed over a message). Sponsoring starts with a message: every tier
  button leads to the Contact section (Discord, plus email once `CONTACT_EMAIL` in `src/lib/contact.ts` is set).
  No payment links on the page; the old Payoneer links are in git history (e7da0d9). Every sponsor, person or
  company, gets a place on the GitHub repo with name, description, logo and a link for the months they sponsor.
  Enterprise adds custom integration planning.

## Commands

- `astro dev --background` to start the dev server (manage with `astro dev stop|status|logs`)
- `npm run build` production build to `dist/`
- `npm run check` Astro + TypeScript type check
- `npm run format` Prettier with Astro and Tailwind class sorting
- `npm run assets:prepare` downloads the app's `editor-light.png` and logos, crops the window chrome away for
  the hero and cuts the three feature-row crops (`src/assets/feature-*.png`); crop fractions live in the script
- `npm run og:image` re-renders `public/og.png` (the 1200x630 share image) with headless Chrome; run it after
  changing the headline, the mark or the hero screenshot and commit the result

## Structure

- `src/layouts/Base.astro` head/meta (Open Graph, Twitter card, canonical, robots, a `head` slot), fonts,
  ClientRouter, loads the scroll script
- `src/layouts/Docs.astro` long-form page frame for /docs and /guides: sidebar, breadcrumb, prose column,
  "On this page", previous/next, edit link
- `src/layouts/Page.astro` standalone long-form page without a sidebar, the `layout` of MDX pages such as
  `src/pages/roadmap.mdx` (the roadmap moved here from the app repo on 2026-09-28)
- `src/content.config.ts` the `docs` and `guides` collections (MDX or Markdown under `src/content/`)
- `src/pages/docs/[...slug].astro`, `src/pages/guides/[...slug].astro` render the collections
- `src/lib/docs.ts` sidebar sections, ordering and prev/next for both collections
- `src/lib/remark-alerts.mjs` turns GitHub-style `> [!TIP]` blockquotes into `.alert` asides
- `src/styles/global.css` all design tokens (`@theme`) and custom utilities (`@utility`), plus the unlayered
  `.prose` and `.alert` rules for long-form pages
- `src/scripts/scroll.ts` Lenis + GSAP ScrollTrigger + Motion reveals, view-transition aware. It also owns in-page
  `#hash` links: Astro's ClientRouter and Lenis `anchors` fight over them, so neither is allowed to handle them.
- `src/scripts/platform.ts` client OS detection shared by the hero button and the picker
- `src/lib/releases.ts` manifest fetch, platform/arch/format model, URLs (repo, releases, Discord)
- `src/lib/stats.ts` GitHub stars and download total for the stats row, with snapshot fallback
- `src/lib/sponsor.ts` sponsor tiers
- `src/lib/contact.ts` public contact channels (the email shown in the Contact section)
- `src/components/` Astro-only: Button, Section (a gridline section with optional title and lead), Container,
  Header (the mark alone as the home link, then three hover/click dropdown menus: Product, Learn,
  Community, left-aligned after it; the wordmark only appears in the footer), Footer, ArrowLink (accent text link with arrow), River (feature row: copy plus screenshot on a gray
  band), DownloadButton (OS-detected hero CTA), Downloader (OS then architecture then files picker),
  GuideList (cards for every guide, used from the guides landing page)
- `src/assets/` editor screenshot (light, chrome cropped), the three feature crops, the app mark (`mark.svg`).
  `public/` favicons (`.ico`, `.svg`, `.png`, Apple touch icon), `og.png` (share image), `robots.txt`.
- `docs/RESOURCES.md` research: the GitHub Sponsors reference and its tokens (section 9), galleries, tools

Path alias: `@/` maps to `src/`.

## Docs and guides

- `/docs` is the developer reference (API, transports, recipes). It was migrated from the app repository's
  `docs/` folder on 2026-09-28 and that folder is gone, so these pages are the source of truth: a change to a
  method, command, event, error or transport in the app updates the page here. `/guides` is for people using
  the app; every claim in a guide comes from the app README, except model names and sizes, which come from
  `models/manifest.toml` in the app repo (Chatterbox is nine files, about 1.1 GB; everything installed is about 3.4 GB).
- Pages are MDX (Markdown works too) in `src/content/docs/` and `src/content/guides/`. Frontmatter: `title`,
  `description` (shown as the lead and used for meta tags), `section` (docs: Start, API, Transports, Recipes;
  guides default to Guides) and `order`. `index.mdx` is the section landing page.
- Links between pages are site-relative (`/docs/api/methods#projectopen`). Use `> [!NOTE]`, `[!TIP]`,
  `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` for callouts. No emoji, including status ticks in tables.
- Markdown runs on the unified processor from `@astrojs/markdown-remark` (set as `markdown.processor` in
  `astro.config.mjs`) because Astro 7's default Sätteri processor takes no remark plugins. Code blocks use
  Shiki's `github-light`.

## Metadata and search

- `site` in `astro.config.mjs` is `https://concatenate.pages.dev`. Canonical URLs, absolute Open Graph image
  URLs and the sitemap (`@astrojs/sitemap`, linked from `public/robots.txt`) derive from it.
- `Base.astro` takes `title`, `description`, `image`, `imageAlt`, `type` and `noindex`. The default image is
  `public/og.png`. The landing page adds JSON-LD (`SoftwareApplication`) through the `head` slot; docs and
  guides pass `type="article"`.

## Design rules

The reference is GitHub's Sponsors page, built on Primer Brand's gridline variants; the tokens and page grammar
are recorded in `docs/RESOURCES.md` section 9. Light only: white page, one gray, 1px rules, one accent.

- Use the tokens: `bg-bg`, `bg-bg-subtle` (media bands, secondary buttons, the sponsor container),
  `bg-bg-overlay` (hover), `text-fg`, `text-fg-muted`, `text-fg-subtle`, `border-line`, `border-line-strong`,
  `bg-accent`/`border-accent`, `text-accent-ink`, `bg-accent-soft`, `text-accent-fg`. No ad-hoc hex colors.
  Every text step clears 4.5:1 on white and on the gray band; keep it that way when changing a token.
- Gridline frame: every section is `border-t border-line` with a `container-x gridline` column (80rem) that
  carries the vertical padding, so the two vertical rules run through it. The rules appear from 80rem up. Depth
  comes from rules only: no shadows, no gradients, no glows, no grain.
- The accent `#0568fd` is a fill: primary buttons (white text on blue), selected borders, the Recommended
  badge, and `bg-accent-soft` for selected states. As text it misses 4.5:1 on the gray band, so links, arrow
  links, stat numbers and the focus ring use `text-accent-ink`, a deeper blue of the same hue. Never a section
  background, never a gradient. No second hue on the page: no lavender, no lime, no green.
- Typeface is Mona Sans only (`font-sans`). Headlines use `text-display` / `text-display-sm` at weight 450 with
  near-normal tracking; stat numbers use `text-stat`. The `eyebrow` utility is for tiny metadata, not labels.
- Controls: `rounded-md` (6px) buttons, `rounded-lg` (8px) cards, `rounded-xl` (12px) media tiles and the
  sponsor container. No pills. Secondary actions inside rows and cards are `ArrowLink`, not a second button.
- Page grammar, in order: hero (centered copy, then the editor screenshot on a `bg-bg-subtle bg-dots` band),
  stats row, one centered statement, feature rows (`River`, alternating sides, real screenshots only), three
  pillars with rule dividers, the download picker, three cards with rule dividers, the sponsor container, an
  FAQ of native `details` elements, contact cards, a columned footer. Sponsor, Contact and Download must stay.
- Never invent UI mocks. Screenshots are crops of the app's real `editor-light.png` made by the asset script.
- Never use numbered section labels ("01 — Features") or em dashes in copy. Both read as AI-generated.
  Section headers are a plain heading. No "Now on iOS and Android" style availability eyebrows either.
- Layout: `container-x` for the content column, `section-y` for vertical rhythm. Dense rather than airy: the
  reference sits at 64 to 96px of section padding.
- Motion: add `data-reveal` (or `data-reveal="stagger"`) for one-shot entrance, `data-parallax="0.1"` for drift.
  Keep durations under 1s, ease-out-expo. Nothing loops. Reduced motion is handled automatically.
- Copy: short, concrete, outcome-first. Use the README's own claims; do not invent features. No exclamation
  marks, no "unleash", no emoji.

## Conventions

- Astro components only; add a UI framework island only when interactivity truly needs it.
- Class merging via `cn()`. Run `npm run format` before committing.
- Keep `docs/RESOURCES.md` updated when adopting a new tool or reference.
- Commits are authored by the repo owner only. Never add Co-Authored-By or any AI attribution trailers.

## Deploy

Two Cloudflare targets are fed from this repo; the site is fully static and uses no Astro adapter.

- **Workers** (concatenate.jub0t.workers.dev): Workers Builds is connected to GitHub and runs
  `npm run build` then `npx wrangler deploy`. `wrangler.jsonc` serves `dist/` as static assets under the
  Worker name `concatenate`. `npm run deploy` does the same from a logged-in machine.
- **Pages** (concatenate.pages.dev): a direct-upload project, so Git pushes do not reach it on their own.
  `.github/workflows/deploy-pages.yml` publishes `dist/` on every push to main and then checks that
  production serves the new build. The run fails until the repository secret `CLOUDFLARE_API_TOKEN`
  exists (Account > Cloudflare Pages > Edit). `npm run deploy:pages` does it locally.
  `wrangler pages deploy` warns that `wrangler.jsonc` lacks `pages_build_output_dir`; that is expected, the
  file is the Workers config and the warning is harmless.
