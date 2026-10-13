# Concat website

Landing page for Concat, the free and open-source CapCut replacement (github.com/jub0t/Concat).
Astro 7, Tailwind v4, static output. Product visuals come from the app repo's `assets/` folder, pulled from
jsDelivr by `npm run assets:prepare` (a local clone at `../timeline` or `CONCAT_REPO` is used when present).

## Product facts (from the app README)

- Video editor with a native Rust engine and a GPU compositor. Runs 100% locally and offline once the optional
  models are downloaded from Settings: no watermarks, no account, no subscription, no upload.
- Features the README claims, and nothing else: auto-captions (local Whisper), text-to-speech and voice cloning,
  background removal, keyframes with a curve editor, 170+ effects, filters, transitions and text animations,
  multi-track and multi-timeline editing, titles, one-switch voice cleanup, export in H.264, HEVC and AV1 up to
  4K 60 10-bit, a JSON-RPC, gRPC and MCP API plus a CLI, 14 languages.
- Platforms shown on the site are whatever the release manifest ships: Windows (x64, ARM64), macOS (Apple
  Silicon, Intel, unsigned), Linux (AppImage/deb/rpm, x64, ARM64), Android (APK), iOS (IPA, beta, sideload).
- Distribution is GitHub Releases. Linux also has an Arch package in the manifest and a community Flatpak
  on Flatpark (linked as text in the picker note); 0.2.6 started shipping to the Microsoft Store too, but
  the site has no store link yet. Not on the App Store or Google Play; never show store badges.
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
- The current paid sponsor is Proxyon (name, description, logo, link and discount code copied from the app
  README into `SPONSORS` in `src/lib/sponsor.ts`; the logo is `src/assets/sponsors/proxyon.png`, pulled by
  the asset script). Keep that list in step with the README's "Paid Sponsors" table.
- Sponsorship: one offer, no public price. `src/lib/sponsor.ts` lists what it includes; the price is agreed
  over a message, so the Sponsor section shows no amount and its button leads to the Contact section (Discord,
  plus email once `CONTACT_EMAIL` in `src/lib/contact.ts` is set). No payment links on the page; the old
  Payoneer links are in git history (e7da0d9), as is the removed $100 Public sponsor tier. Every sponsor,
  person or company, gets a place on the repo README and on the website landing page with name, description,
  logo and a link for the months they sponsor, plus custom integration planning.

## Commands

- `astro dev --background` to start the dev server (manage with `astro dev stop|status|logs`)
- `npm run build` production build to `dist/`
- `npm run check` Astro + TypeScript type check
- `npm run format` Prettier with Astro and Tailwind class sorting
- `npm run assets:prepare` downloads the app's `editor-light.png`, logos and sponsor logo, crops the window
  chrome away for the hero (when no dark capture exists) and cuts the feature crops
  (`src/assets/feature-*.png`); crop fractions live in the script. The app's mark SVGs embed a raster since 2026-10,
  so the script keeps the last clean vector `src/assets/mark.svg` from git until upstream is a vector again
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
  It tears down only its own triggers; `Tour` and `Ribbon` clean up theirs on `astro:before-swap`.
- `src/scripts/platform.ts` client OS detection shared by the hero button and the picker
- `src/lib/releases.ts` manifest fetch, platform/arch/format model, URLs (repo, releases, Discord)
- `src/lib/stats.ts` GitHub stars and download total for the stats row, with snapshot fallback
- `src/lib/sponsor.ts` sponsor tiers
- `src/lib/contact.ts` public contact channels (the email shown in the Contact section)
- `src/components/` Astro-only: Button (primary, secondary, ghost, inverse and outline-inverse for the
  accent block), Section (content column with optional title and lead), Container, Header (floating glass
  bar: mark and wordmark as the home link, three hover/click dropdown menus Product, Learn, Community;
  GitHub and Discord icons and the Download button on the right; a menu button opens a sheet below md),
  Footer, ArrowLink (accent text link with arrow), Ribbon (text on a curved path, GSAP loop), Tour
  (sticky screenshot panned to regions as steps scroll by), DownloadButton (OS-detected CTA, any number
  per page, `variant="inverse"` on the accent block), Downloader (OS then architecture then files picker),
  GuideList (cards for every guide grouped by section, used from the guides landing page)
- `src/assets/` `editor.png` (the hero, from `app/hero.png`), the feature and guide crops, `guides/`
  screenshots for the guides, the app mark (`mark.svg`), `sponsors/` logos.
- `src/components/Figure.astro` a framed screenshot with a caption, for MDX guides.
  `public/` favicons (`.ico`, `.svg`, `.png`, Apple touch icon), `og.png` (share image), `robots.txt`.
- `docs/RESOURCES.md` research: the GitHub Sponsors reference and its tokens (section 9), galleries, tools

Path alias: `@/` maps to `src/`.

## Docs and guides

- Guides describe the shipping release (0.2.6). Features that exist only on the app's main branch (Record
  Voiceover, the Styles and Languages shelves, font search, as of 2026-10-10; Enhance did ship in 0.2.6) are marked "next
  release" in the guide rather than described as shipped; drop the marks when the release ships.
- `/docs` is the developer reference (API, transports, recipes). It was migrated from the app repository's
  `docs/` folder on 2026-09-28 and that folder is gone, so these pages are the source of truth: a change to a
  method, command, event, error or transport in the app updates the page here. `/guides` is for people using
  the app; every claim in a guide comes from the app README, except model names and sizes, which come from
  `models/manifest.toml` in the app repo (Chatterbox is nine files, about 1.1 GB; everything installed is about 3.4 GB).
- Pages are MDX (Markdown works too) in `src/content/docs/` and `src/content/guides/`. Frontmatter: `title`,
  `description` (shown as the lead and used for meta tags), `section` (docs: Start, API, Transports, Recipes;
  guides: Start, Captions and voices, Picture, Timeline, Reference) and `order`. `index.mdx` is the section landing page.
- Links between pages are site-relative (`/docs/api/methods#projectopen`). Use `> [!NOTE]`, `[!TIP]`,
  `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` for callouts. No emoji, including status ticks in tables.
- Markdown runs on the unified processor from `@astrojs/markdown-remark` (set as `markdown.processor` in
  `astro.config.mjs`) because Astro 7's default Sätteri processor takes no remark plugins. Code blocks use
  Shiki's `github-light`.

## Metadata and search

- `site` in `astro.config.mjs` is `https://concat.standalones.org` (the domain since 2026-10-10; the Pages
  and Workers hostnames serve the same build). Canonical URLs, absolute Open Graph image URLs and the
  sitemap (`@astrojs/sitemap`, linked from `public/robots.txt`) derive from it.
- `Base.astro` takes `title`, `description`, `image`, `imageAlt`, `type` and `noindex`. The default image is
  `public/og.png`. The landing page adds JSON-LD (`SoftwareApplication`) through the `head` slot; docs and
  guides pass `type="article"`.

## Design rules

Direction since 2026-10-10: the look of the owner's offerwall-site landing (github.com/jub0t/offerwall-site,
`src/components/marketing/`), ported to Astro and the Concat brand. Light only: a white page, hairline
borders, soft deep shadows on cards, one blue accent, Mona Sans. `docs/RESOURCES.md` section 10 records the
patterns borrowed and the ones left out.

- Use the tokens: `bg-bg`, `bg-bg-subtle` (media bands, secondary buttons), `bg-bg-overlay` (hover),
  `text-fg`, `text-fg-muted`, `text-fg-subtle`, `border-line`, `border-line-strong`, `bg-accent`,
  `text-accent-ink`, `bg-accent-soft`, `text-accent-fg`, `shadow-card`, `shadow-frame`. No ad-hoc hex colors.
  Every text step clears 4.5:1 on white and on the gray band; keep it that way when changing a token.
- Surfaces: `card-glass` (hairline, faint radial tint, soft shadow, border darkens on hover) for every card;
  `card-glass-ring` adds the inset second ring on big cards; `frame` for product screenshots; `glass` for the
  floating header. Gradients only as the faint tint inside `card-glass`; never as a section background.
- The accent `#0568fd` is a fill: primary buttons, the CTA block before the footer, the ribbon, selected
  borders, and `bg-accent-soft` for icon wells and selected chips. As text it misses 4.5:1 on the gray band,
  so links, arrow links and stat numbers use `text-accent-ink`. One hue on the page: no lavender, no lime.
- Typeface is Mona Sans only (`font-sans`). `text-display` is the hero headline (weight 600, -0.03em),
  `text-display-sm` section titles (weight 500), `text-title` card titles, `text-stat` the number on a fact
  card. The `eyebrow` utility is the small uppercase label over a big card.
- Radii: controls 10px (`rounded-md`), the large button 12px, small cards 20px, feature cards 24px, big
  cards 34px, the CTA block 36px. Pills are allowed for chips, nav triggers and the hero badge.
- Page grammar, in order: floating glass header; hero (badge, centered headline with the product name in
  accent ink, OS-detected download button, the editor screenshot in a `frame`); the curved text ribbon of
  features; a centered statement over four fact cards (real numbers only); the scroll-driven tour of the
  window (`Tour`, one screenshot panned to each pane); the feature grid (`features`, real crops where one
  exists, an icon well where not); two big cards ("for people who edit" and "for scripts and agents"); the
  download picker; Sponsor (benefits card plus the current sponsors and a "Your logo here" slot); Contact
  (Discord, email, contribute, roadmap); the two-column FAQ; the accent CTA block; a columned footer.
  Sponsor, Contact and Download must stay.
- Never invent UI mocks. Every app screenshot is a capture of the real app in its **dark theme** on the
  current release, and nothing in it may read badly (fix caption text and scripts before capturing; the
  owner was burned by a Whisper misspelling of "Concat"). The hero capture is `src/assets/app/hero.png`;
  `npm run assets:prepare` cuts the hero and feature crops from it. Guide screenshots go through
  `node scripts/guide-shots.mjs <captures dir>` into `src/assets/guides/` and are placed with `Figure`.
  The capture workflow is `docs/RESOURCES.md` section 10. The tour pans the hero; its regions are
  fractions of that image in `index.astro`.
- Never use numbered section labels in headings ("01 — Features") or em dashes in copy. Both read as
  AI-generated. The tour's step counter is the one place a number appears as an eyebrow. No "Now on iOS and
  Android" style availability eyebrows.
- Layout: `container-x` for the content column (1200px), `section-y` for vertical rhythm (80 to 128px).
- Motion: `data-reveal` (or `data-reveal="stagger"`) for the one-shot fade, rise and unblur;
  `data-parallax="0.1"` for drift. Durations under 1s, ease-out-expo. The ribbon is the only loop; it pauses
  on hover and stands still under reduced motion, which is handled automatically.
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
