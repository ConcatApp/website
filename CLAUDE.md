# Concat website

Landing page for Concat, the free and open-source video editor (github.com/jub0t/Concat).
Astro 7, Tailwind v4, static output. Product visuals come from the app repo's `assets/` folder, pulled from
jsDelivr by `npm run assets:prepare` (a local clone at `../timeline` or `CONCAT_REPO` is used when present).

## Product facts (from the app README)

- Video editor with a native Rust engine and a GPU compositor. Runs 100% locally and offline once the optional
  models are downloaded from Settings: no watermarks, no account, no subscription, no upload.
- Features the README claims, and nothing else: auto-captions (local Whisper), text-to-speech and voice cloning,
  background removal, keyframes with a curve editor, 100 effects, filters and transitions (not "170+ ... and
  text animations", which the README dropped on 2026-10-15), multi-track and multi-timeline editing, titles,
  one-switch voice cleanup, export in H.264, HEVC and AV1 up to 4K 60 10-bit, 26 languages, and a
  built-in MCP server for AI agents.
- The current release is 0.2.11 (tag v0.2.11, commit 6584d349, published 2026-11-13), a release of fixes
  on top of 0.2.10: clips cut between frames meet on the frame grid and can be merged; the preview steps
  down to the processor (without effects, the monitor says so once) when no graphics device lasts; a
  rewritten log (Settings › About › Show the log; Share the log on Android); stills read once per
  export. Its curated notes are `notes/release-notes-0.2.11.md` in the app repo; the manifest, the API
  schema and the version lines were synced from the release on 2026-11-13. The app's own What's new card
  still carries 0.2.10's one-line note in 0.2.11.
- 0.2.10 (tag v0.2.10, commit 71efe1f4, published 2026-11-11; 0.2.9 came out on
  2026-11-05 with no site update). Describe what a tag ships, checked with `git show v0.2.11:<path>` in the app repo, never
  what is only on its main branch. Its curated notes are `notes/release-notes-0.2.10.md` in the app repo.
  New in 0.2.10: In, Out and Loop animations for clips, pictures, titles and shapes; voice isolation (keep or
  remove a clip's voice, each part at its own level); a Shake & Motion shelf; a stack of masks per clip,
  each with a mode and keyframes; editable shapes; fades on a curve; twelve more caption language
  presets; Generate Captions in the Library; titles and captions painted in the background (about 45x
  faster); a new Welcome screen with a What's new card; a rebuilt Audio tab; Settings as a full-window
  page; `concat --schema`. The Audio page's Concat sounds shelf still says the library is coming soon,
  because the sound list is not published yet.
- API: every desktop release serves JSON-RPC over TCP from the window (Settings › Automation, the "Scripts
  and apps" switch; called Remote up to 0.2.7) and, from 0.2.8, is an MCP server over stdio when started as
  `concat --mcp` (through the window's server when Automation is on, headless otherwise; the app repo's
  `docs/MCP.md`). From 0.2.10 `concat --schema` prints the whole API as JSON Schema; the site's copy was
  synced from an installed 0.2.10 on 2026-11-11 (`CONCAT_BIN=/Applications/Concat.app/Contents/MacOS/concat
  npm run api:sync` works on a Mac with the release installed). Live mode, an agent on the project open in the window, is still planned (#337). gRPC and
  `concat-cli` need a build from source; no release ships them. No release check launches `concat --mcp`
  from a packaged build yet; CI tests the server built from source.
- Platforms shown on the site are whatever the release manifest ships. 0.2.10 (the same set as 0.2.8): Windows (x64 only; ARM64 is
  paused, #326; not code-signed, so SmartScreen asks and Smart App Control refuses), macOS (Apple Silicon,
  Intel, unsigned; macOS 12, and on Intel the ONNX Runtime features need 13.4), Linux (AppImage/deb/rpm/Arch,
  x86_64 and aarch64), Android (arm64 APK, Android 8.0+; no CI run has launched the arm64 APK, and the
  OpenGL ES path for phones without Vulkan has only run on an emulator), iOS (arm64 IPA, beta, sideload,
  iOS 15+). The picker builds its list from the manifest, so a paused architecture drops out by itself; the
  Windows card's summary is worked out from the architectures shipped.
- Distribution is GitHub Releases. Linux also has an Arch package in the manifest and a community Flatpak
  on Flatpark (linked as text in the picker note). 0.2.6 shipped to the Microsoft Store; 0.2.7 to 0.2.10 do
  not, and the site has no store link. Not on the App Store or Google Play; never show store badges.
- Each release ships `manifest.json` with per-platform URLs, sizes and sha256. `src/lib/releases.ts` fetches
  the latest one at build time and falls back to `src/data/release-manifest.json` (refreshed to 0.2.10 on
  2026-11-11 from the release's own `manifest.json`; refresh it with each release). The SHA256SUMS link is `checksumsUrl(manifest)`, the
  `releases/download/<tag>/SHA256SUMS` of the same release as the download links; never point it at
  `releases/latest`, which a stale build would pair with an older release's files.
- The app links into this site: the home page opens `https://concat.standalones.org/guides/`,
  `/guides/first-edit/` and `/guides/report-a-problem/`, and from 0.2.10 its What's new card opens
  `/blog/whats-new-in-<version>/` (`src/crates/concat/src/panes/start.rs`). Keep those pages at those
  paths; see "Release posts" below.
- The fact tiles use real numbers only: `src/lib/stats.ts` fetches GitHub stars and the download total
  across every asset of every release at build time (the figure GitHub and the README's Downloads badge
  show; 409K and 13.9K stars on 2026-11-03), falling back to `src/data/github-stats.json`. `GITHUB_TOKEN`
  in the build environment lifts the API rate limit (the Pages workflow passes it); it is never committed,
  and this repository is public. The third tile reads "100s" (hundreds of) effects, filters and transitions, the owner's wording.
  `formatCount` rounds down and keeps one decimal under 100K (13.9K).
- The app mark is the waving cat on a rounded dark tile, at the top of every README since 2026-10-13
  (`assets/concat-mark-dark.png` in the app repo; the blue tile is the older app icon). The app's SVGs only
  wrap a PNG of the cat, so the asset script copies the PNG to `src/assets/mark.png` (the header, hero and
  footer resize it with astro:assets) and renders `favicon.png`, `favicon.ico` and the Apple touch icon (from
  the square dark tile) from it. `#0568fd` is the app's primary color and the site's one colour (see Design
  rules). Community: Discord, X (https://x.com/AppConcat, `X_URL`), AGPL-3.0 license.
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
- `npm run build` production build to `dist/`, then Pagefind indexes it into `dist/pagefind/` (search)
- `npm run check` Astro + TypeScript type check
- `npm run format` Prettier with Astro and Tailwind class sorting
- `npm run assets:prepare` downloads the app's `editor-light.png`, the dark mark and sponsor logo, crops the
  window chrome away for the hero (when no dark capture exists), cuts the feature crops
  (`src/assets/feature-*.png`; crop fractions live in the script) and renders the mark and favicons
- `npm run og:image` re-renders `public/og.png` (the 1200x630 share image) through Puppeteer and the local
  Chrome or Edge; run it after changing the headline, the mark, the band or the hero screenshot and commit
  the result

## Structure

- `src/layouts/Base.astro` head/meta (Open Graph, Twitter card, canonical, robots, a `head` slot), fonts,
  ClientRouter, loads the scroll script
- `src/layouts/Docs.astro` page frame for /docs (since 2026-11-09): search trigger, the `DocsTree`
  sidebar (folds the API reference under Methods, Edit commands and Types, the open branch being the
  page read; the rail scrolls on its own, `data-lenis-prevent`), breadcrumb, a kind badge and a code
  title on reference pages, "On this page", previous/next cards, edit link, the ad slot. Since
  2026-11-11 (the owner asked for "spacious", full width, larger and clearer) it spans the window up to
  1920px (`container-wide`; the header takes the same width through `Header wide`): tree, page and "On
  this page" side by side, the page centred in its track at up to 66rem, running text held to a 46rem
  measure in 17px type while code, tables, field lists and index cards use the full width. "On this
  page" marks the section being read; below 1280px it and (below 1024px) the tree are disclosures.
- API reference, one page per method, edit command and type (about 150), built from the app's contract:
  `src/data/concat-api.schema.json` is what `concat --schema` prints (`npm run api:sync` reads a build in
  `../timeline` or `CONCAT_BIN`; sync it when a release ships). `src/lib/api.ts` reads it (fields,
  types, defaults, descriptions with rustdoc links made readable; groups from `src/data/api-groups.json`,
  anything unplaced listed under "More"). `src/pages/docs/api/[folder]/[name].astro` makes the pages at
  `/docs/api/{methods,edits,types}/<kebab-name>`; `src/components/Api.astro` renders an entry's fields,
  `ApiIndex` an index page's groups, `ApiErrors` the error codes. Hand-written prose for an entry is
  `src/content/reference/<methods|edits|types>/<name>.mdx` (the `reference` collection), which places its
  own `<Api of="kind:name" />`; with no file the page shows the schema's description. Field meanings are
  the app's doc comments: fix wording there, not here. `/concat-api.schema.json` serves the file.
  `npm run build` runs `scripts/check-api-docs.mjs` first (reference files name real entries, events are
  covered, every JSON request example uses only fields the schema has) and `scripts/check-links.mjs`
  after (every internal link and #fragment lands).
- Code blocks are framed by `src/lib/code-frame.mjs` (a Shiki transformer: language label and a Copy
  button, wired by `src/scripts/copy-code.ts`). Keep JSON examples within 72 columns.
- `src/layouts/Guide.astro` a guide as a blog article (since 2026-11-03, the owner asked for "breathable
  full-page-width blog/guides for normal users", not developer docs): no sidebar, a centred head
  (breadcrumb, `text-display` title, description, reading time, a search link), the cover on the band
  when the guide has one, an "In this guide" card for three or more h2s, one 40rem reading column in
  18px type (`.guide-prose` in global.css) with figures and tables stepping out to a wide measure,
  then the AdSense slot, a "Try it in Concat" band with the OS-detected download button, and "Keep
  reading" (`relatedGuides` in `src/lib/docs.ts`). `src/pages/guides/index.astro` is the blog-style
  index: search, section links, the Start section led by a large card, then every section's cards.
  The Docs and Guide articles are the only `data-pagefind-body` on the site
- Blog (since 2026-11-10, the owner asked for one to publish progress): posts are MDX in
  `src/content/blog/` (the `blog` collection: `title`, `description`, `date`, an `icon` from
  `src/lib/guide-icons.ts`, an optional `cover` and `coverAlt`). `src/layouts/Post.astro` is the guide
  article's reading layout with the date (`BlogPosting` JSON-LD with `datePublished`), the download band
  and "More from the blog"; `src/pages/blog/index.astro` lists posts newest first, the newest as a large
  card (`PostCard`); `src/pages/blog/rss.xml.ts` is the feed, written by hand; `src/lib/blog.ts` sorts
  and dates them. Linked from the Learn menu, the footer and the HTML sitemap; Pagefind indexes posts
  (`kind:Blog`). Posts follow the guides' rules (no em dashes, no emoji, no other products' or
  technologies' names) and every number in one is measured, with the machine named.
- `src/layouts/Page.astro` standalone long-form page without a sidebar, the `layout` for MDX pages under
  `src/pages/`: `privacy.mdx` (the roadmap page was removed on 2026-11-02, and nothing links to it)
- `src/pages/privacy.mdx` the privacy policy, linked from the footer. AdSense requires it. It states what the
  code does: no cookies, storage or analytics of the site's own, search and OS detection in the browser,
  self-hosted fonts, AdSense with Google's required cookie disclosures and opt-out links, Cloudflare
  hosting, GitHub downloads. Update it and its date whenever a script, tracker or third party is added
- `src/content.config.ts` the `docs`, `guides` and `reference` collections (MDX or Markdown under `src/content/`)
- `src/pages/docs/[...slug].astro`, `src/pages/guides/[...slug].astro` render the collections
- `src/lib/docs.ts` sidebar sections, ordering and prev/next for both collections
- `src/lib/remark-alerts.mjs` turns GitHub-style `> [!TIP]` blockquotes into `.alert` asides
- `src/styles/global.css` all design tokens (`@theme`) and custom utilities (`@utility`), plus the unlayered
  `.prose` and `.alert` rules for long-form pages
- `src/scripts/scroll.ts` Lenis + GSAP ScrollTrigger + Motion reveals, view-transition aware. It also owns in-page
  `#hash` links: Astro's ClientRouter and Lenis `anchors` fight over them, so neither is allowed to handle them.
  It tears down only its own triggers; `Tour` cleans up its own on `astro:before-swap`.
- `src/scripts/platform.ts` client OS detection shared by the hero button and the picker
- `src/lib/releases.ts` manifest fetch, platform/arch/format model, URLs (repo, releases, Discord, X)
- `src/lib/stats.ts` GitHub stars and download total for the stats row, with snapshot fallback
- `src/lib/sponsor.ts` sponsor tiers
- `src/lib/contact.ts` public contact channels (the email shown in the Contact section)
- Free tools (since 2026-11-03, for search traffic; the owner wants many, and genuinely useful ones):
  `src/lib/tools.ts` lists them (slug, group Video/Writing/Calculators, title, lead, meta description,
  icon); each is `src/pages/tools/<slug>.astro` on `src/layouts/Tool.astro` (head, the tool on a big
  card, the ad slot, an explainer in `.guide-prose` through the `about` slot, the download band,
  three more tools, `WebApplication` JSON-LD); `/tools` is the index (`ItemList` JSON-LD). Every tool
  runs in the browser and uploads nothing. The video tools (compress, convert, trim, extract audio,
  video to GIF, inspector) use `src/scripts/media.ts`: Mediabunny (pinned 1.61.6, with
  `@mediabunny/mp3-encoder`) over the browser's WebCodecs, imported on first use, plus gifenc for
  GIFs; `FileDrop.astro`, `JobStatus.astro` and `src/scripts/media-ui.ts` are their shared UI. Not
  ffmpeg.wasm: its core is over Workers' 25 MiB file limit. Tool scripts call `setup()` at once and
  on `astro:page-load` (a page's module script can run after the first page-load event) and
  `setup()` skips a root marked `data-ready`. Trim offers Exact (re-encodes) and Fast (copies; a
  copy keeps hidden frames back to the key frame, which some apps show). Size targets use a constant
  bitrate with 7% headroom. The script length counter keeps its draft in localStorage, which the
  privacy policy states. Tools are linked from the header's Free tools menu, a landing section
  (`#tools`, the video tools), the footer, the guides index and the HTML sitemap.
- `src/components/` Astro-only: Button (primary: the light pill; secondary: the faint outlined pill;
  ghost), Section (content column with a centred title, `\n` in it is a line break, and lead), Container,
  Header (a plain bar: mark and name as the home link, three hover/click dropdown menus Learn (guides, docs), Free tools (the video tools and the index) and Community;
  GitHub, Discord and X icons and the Download pill on the right; a menu button opens a sheet below md),
  Footer (the outro: a dark panel inside the band sheet with an optional `cta` slot, the link columns and
  the name in band blue), ArrowLink (accent text link with arrow), Tour (sticky screenshot panned to regions
  as steps scroll by), DownloadButton (OS-detected CTA, any number per page), Downloader (OS then
  architecture then files picker), GuideCard (a guide's card: the band with its cover or its icon,
  section, title, description, reading time; `large` for the lead card), GuideIcon (a guide's
  `icon` name to its Lucide icon; the names are in `src/lib/guide-icons.ts`), Search (the Ctrl+K / Cmd+K dialog over the Pagefind index; any `data-search-open`
  element opens it)
- `src/assets/` `editor.png` (the hero, from `app/hero.png`), the feature and guide crops, `guides/`
  screenshots for the guides, the app mark (`mark.png`), `sponsors/` logos.
- `src/components/Figure.astro` a framed screenshot with a caption, for MDX guides; in a guide it takes
  the wide measure, or its `width` when given.
- `src/assets/made-with-slint.svg` Slint's own #MadeWithSlint badge (`logo/MadeWithSlint-logo-dark.svg`
  in slint-ui/slint, the dark-background variant), unaltered as its branding guide asks; the footer
  shows it because Slint's royalty-free licence asks for it on the download page.
  `public/` favicons (`.ico`, `.png`, Apple touch icon), `og.png` (share image), `robots.txt`.
- `docs/RESOURCES.md` research: the GitHub Sponsors reference (section 9), the offerwall-site revamp and
  the screenshot workflow (section 10), the meltkit.com revamp (section 11), galleries, tools

Path alias: `@/` maps to `src/`.

## Docs and guides

- Guides were written for 0.2.8 (20 October 2026) and have not had their 0.2.10 pass yet. The pages that
  need it most: masks (now a stack with modes), the Audio tab and sounds, Settings (a full-window page),
  captions (Generate Captions moved to the Library; more language presets), titles and text (In, Out
  and Loop animations), shapes, Enhance (any scale up to 2K) and the start screen (the Welcome screen).
  Until then the guides index states no version. Earlier history: guides carry no version marks: the 0.2.8 marks and
  the 0.2.7-only text were dropped on 2026-10-20. When the app's main branch has something no release has,
  mark it with a `> [!NOTE]` callout that opens "**New in 0.2.9 (coming in the next release).**" (or a
  "(0.2.9)" tag in a table row), keep the shipping behaviour described beside it, and drop the marks when it
  ships. As of 2026-10-20 main has, beyond 0.2.8, transitions' own knobs, the phone's shelf pills, effect
  cards shipped with the app, the Windows "Concat (safe graphics)" entry and `concat --software`, File ›
  Open closing the open project first, the Direct3D 12 FXC pin and 16 KB Android pages; none is documented.
  Checked again on 2026-11-03 (still no release after 0.2.8): main also has Azerbaijani (26 languages),
  4:5 and 3:4 project shapes, Up and Down to the previous and next cut, linkage (captions, titles and
  sounds move with the main track), fade knobs on a sound's corners, a chroma key with an eyedropper,
  picking the spoken language for captions, and speech reduced to Chatterbox (Kokoro, Pocket TTS and
  sherpa-onnx removed); H.264 and HEVC export only through the platform's own encoders (x264 and x265
  removed); and a dual licence (AGPL or commercial). When 0.2.9 ships, the text-to-speech, models,
  captions, export and shortcuts guides need the most rework. The README's Multi-track line now names
  overlays and picture-in-picture (stacking that 0.2.8 already does); its Patreon "Support Concat" cell
  sits in the sponsors table but is a donation link, not a paid sponsor.
- Many guide screenshots are still 0.2.7 captures (the start screen, editor layout, tray, Library tabs,
  Captions and Text to speech sheets, Audio tab). Their captions say so; retake them on 0.2.8 in the dark
  theme and drop those caption notes. `src/assets/guides/start.png` is the 0.2.7 start screen and is no
  longer used.
- `/docs` is the developer reference (API, transports, recipes). It was migrated from the app repository's
  `docs/` folder on 2026-09-28 and that folder is gone. The reference pages' fields come from the schema
  (see Structure); the prose (overview, transports, recipes, each entry's notes and examples) is the source
  of truth here, and a change to a method, command, event, error or transport in the app updates it. `/guides` is for people using
  the app; every claim in a guide comes from the app README, except model names and sizes, which come from
  `models/manifest.toml` in the app repo (Chatterbox is nine files, about 1.1 GB; everything installed is about 3.4 GB).
- Pages are MDX (Markdown works too) in `src/content/docs/` and `src/content/guides/`. Frontmatter: `title`,
  `description` (shown as the lead and used for meta tags), `section` (docs: Start, API, Transports, Recipes;
  guides: Start, Make something, Captions and voices, Picture, Timeline, Know-how, Reference) and
  `order`. A docs `index.mdx` is the section landing page. Guides also take `icon` (a name from
  `src/lib/guide-icons.ts`, shown on the card when there is no cover) and an optional `cover` (a
  real capture, path relative to the MDX file) with `coverAlt`, and `seoTitle` (the `<title>` for search
  results, phrased the way people search; the h1 stays the plain title).
- Since 2026-11-03 the guides include articles for search traffic: "Make something" walkthroughs
  (a TikTok/Reel/Short, podcast clips, a screen-recording tutorial) and
  "Know-how" explainers (H.264, HEVC or AV1; the editing glossary; editing offline; Linux). They
  follow the same rule as every guide: Concat claims come from the README and the existing guides
  (never main-only behaviour such as linkage), and general video knowledge is stated plainly.
  They link the free tools, and the tools' explainers link back.
- Never use another product's name to sell Concat: no "X alternative" or "X replacement", no
  "as in X", no "coming from X" pages, titles or search titles. The footer's "Not affiliated with CapCut
  or ByteDance" is the one mention.
- Links between pages are site-relative (`/docs/api/methods#projectopen`). Use `> [!NOTE]`, `[!TIP]`,
  `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` for callouts. No emoji, including status ticks in tables.
- Markdown runs on the unified processor from `@astrojs/markdown-remark` (set as `markdown.processor` in
  `astro.config.mjs`) because Astro 7's default Sätteri processor takes no remark plugins. Code blocks use
  Shiki's `github-dark-default`.
- Search: Pagefind indexes every docs and guides article after the build; the dialog shows each result's
  title, its collection (`data-pagefind-meta` kind) and the excerpt. Under `astro dev` there is no index, and
  the dialog says to run `npm run build`. The neighbour links and the edit link are `data-pagefind-ignore`.

## Release posts

- Every release needs a blog post at exactly `src/content/blog/whats-new-in-<version>.mdx`, the
  version's dots turned to dashes (0.2.10 is `whats-new-in-0-2-10`). The app's Welcome screen opens
  `https://concat.standalones.org/blog/whats-new-in-<version>/` from its What's new card, so the post must
  be live the day the release is published; a missing post is a 404 inside the app.
- Write it from the release's curated notes (`notes/release-notes-<version>.md` in the app repo) and
  check each claim against the tag. Title "What's new in Concat <version>", `date` the release day,
  `icon: update`. It holds: a two-line opening that says what the release is about; an h2 for each
  headline feature, saying what a person can now do and where to find it; the measured speed wins as a
  table with bold multipliers (**45x**) and the machine named; a short list of the smaller things that
  got better; and "Get it": the release link and how to update from Settings › Version.
- Good news only: what got better, no known problems, caveats, roadmap or rejected ideas. Say "Concat
  does X", never what it is built on. A cover only from a real capture of that release.

## Metadata and search

- `site` in `astro.config.mjs` is `https://concat.standalones.org` (the domain since 2026-10-10; the Pages
  and Workers hostnames serve the same build). That domain is a custom domain on the Cloudflare Worker
  `concatenate` (its responses carry the Workers headers, not the Pages ones), so it follows the Workers
  Builds deploy of this repo; the jub0t/standalones repo's `website/` is a separate Next.js site with
  nothing for Concat in it. Canonical URLs, absolute Open Graph image URLs and the
  sitemap (`@astrojs/sitemap`, linked from `public/robots.txt`) derive from it.
- The sitemap is for Google Search Console: submit `https://concat.standalones.org/sitemap.xml`, which
  `sitemapXml()` in `src/lib/sitemap.mjs` writes from the integration's single chunk (the index once there
  are several); `robots.txt` and the `<head>` link point at it, and `sitemap-index.xml` still exists. People
  get the HTML sitemap at `/sitemap/` (`src/pages/sitemap.astro`, built from the docs navigation, linked from
  the footer). No XSL stylesheet on the XML: Chromium is removing XSLT and warns visitors who open one.
  `src/lib/sitemap.mjs` adds each page's `lastmod` (the last commit that touched its MDX file, or the
  landing page and its components for `/`). Workers Builds clones shallow, so the first lookup runs
  `git fetch --unshallow` (public repo, no credentials); if that fails lastmod is left out, never guessed.
  The Pages workflow checks out with `fetch-depth: 0`) and an image entry for every picture in its `<main>`. No
  `changefreq` or `priority`: Google ignores them. The 404 page is filtered out.
- `public/robots.txt` blocks AI training crawlers and AI answer bots (GPTBot, ClaudeBot, CCBot,
  Google-Extended, PerplexityBot, ChatGPT-User and the rest listed there) and `/pagefind/`, and allows
  every other crawler. Never block Googlebot, Bingbot, `Mediapartners-Google` or `AdsBot-Google`: search
  traffic and AdSense depend on them. `public/ads.txt` is the AdSense publisher line; keep it.
- `Base.astro` takes `title`, `description`, `image`, `imageAlt`, `type` and `noindex`. The default image is
  `public/og.png`. The landing page adds JSON-LD through the `head` slot: `WebSite`, `SoftwareApplication`
  (with `featureList` from the README's claims and `sameAs` GitHub, Discord and X) and `FAQPage` built from
  the same `faq` array the page renders, so the two never disagree. Docs and guides pass `type="article"`.
- One `h1` per page. On the landing page every section is named by its `h2`, the FAQ questions are `h3`
  inside their `summary`, and the footer's column titles are plain text so they stay out of the outline.
  Every image has alt text that says what is in it.

## Design rules

Direction since 2026-11-02: the look of [meltkit.com](https://meltkit.com/), in Concat's brand. Dark only: a
near-black page, flat true-neutral cards with very round corners and no borders or shadows, Geist at weight
500 with tight tracking, one light pill for the main action, and Concat blue as a grainy band behind product
shots. `docs/RESOURCES.md` section 11 records what was taken and what was left out; section 10 the light
offerwall-site look it replaced.

- Use the tokens: `bg-bg` (the page, `#0b0b0b`), `bg-card` (`#1f1f1f`) and `bg-card-hover`, `bg-bg-subtle`
  and `bg-bg-overlay` (white washes for insets, secondary buttons and hover, the same on the page and on a
  card), `text-fg`, `text-fg-muted`, `text-fg-subtle`, `border-line`, `border-line-strong` (alpha white),
  `bg-primary`/`text-primary-fg` (the light pill), `bg-accent`, `text-accent-ink`, `bg-accent-soft`,
  `shadow-frame`. No ad-hoc hex colors outside `global.css`, the headline gradients and the band. Every
  text step clears 4.5:1 on the page and on a card; keep it that way when changing a token.
- Surfaces: `card` (flat `#1f1f1f`, no border, brightens when it is a link) for every card; `frame` for
  product screenshots (19px corners, a hairline drawn over the edge, a deep shadow; give it `relative` or
  `sticky`); `band` for the blue sheet (Concat blue melted into a lighter and a deeper blue under SVG grain)
  behind the hero window, the download picker, the feature icon tiles, the footer and the footer's name;
  `glass` for the header bar. The band is the only gradient surface; it starts on a clean edge, never a fade.
- The one colour is `#0568fd`: the band, selected borders, and `bg-accent-soft` for selected chips. As text
  it is too deep on this page, so links and arrow links use `text-accent-ink`. The main action is the light
  pill (`Button` primary), not a blue button. One hue on the page: no lavender, no lime, no pastels.
- Type: Geist for everything (`font-sans`; `font-heading` is an alias), self-hosted through Astro's Fonts
  API, weight 500 for headings. `text-display` is the hero headline (40 to 64px, -0.03em), `text-display-sm`
  section titles (34 to 48px), `text-title` big card titles, `text-stat` the number on a fact tile,
  `text-lead` the muted line under a headline. Gamja Flower (`font-hand`) is used once, for the handwritten
  "Free forever" by the hero button. The `eyebrow` utility is the small uppercase label over a big card.
- Radii: controls are pills, the large button 17px, window shots 19px, small cards 22px, contact cards
  32px, cards and tiles 40px (28px on a phone).
- Page grammar, in order: the header bar; hero (the mark, the two-line gradient headline, one line, the
  OS-detected download pill with the handwritten aside); the editor window on the band, which ends in a
  hanging tab ("No watermark, no account"); a centred statement over three fact tiles (real numbers only);
  the feature cards (`features`, an icon tile on the band on every card; the owner asked for no screenshots there on 2026-11-03); the
  scroll-driven tour of the window (`Tour`); two big cards ("for people who edit" and "for scripts and
  agents"); the download picker on the band; Sponsor (benefits card plus the current sponsors and a "Your
  logo here" slot); Contact (Discord, email, contribute); the two-column FAQ; the footer, which carries the
  last call to action. Sponsor, Contact and Download must stay. Section heads are centred.
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
- Layout: `container-x` for the content column (1080px between 24px gutters), `section-y` for the gap
  above each landing section (112px, 160px from 1024px up; the owner asked for more room than meltkit's
  80px).
- Motion: `data-reveal` (or `data-reveal="stagger"`) for the one-shot fade, rise and unblur;
  `data-parallax="0.1"` for drift. Durations under 1s, ease-out-expo. No loops; reduced motion is handled
  automatically.
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
