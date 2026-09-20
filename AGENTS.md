# Concat website

Landing page for Concat, the free and open-source CapCut replacement (github.com/jub0t/Concat).
Astro 7, Tailwind v4, static output. The app repo is checked out locally at `../relay`.

## Product facts (from the app README)

- Video editor with a native Rust engine. Runs 100% locally: no watermarks, no account, no subscription.
- Platforms: Windows (x64, ARM64), macOS (Apple Silicon, Intel, unsigned), Linux (AppImage/deb/rpm, x64, ARM64),
  Android (APK), iOS (IPA, beta, sideload).
- Distribution is GitHub Releases only. Not on the App Store or Google Play; never show store badges.
- Each release ships `manifest.json` with per-platform URLs, sizes and sha256. `src/lib/releases.ts` fetches
  it at build time and falls back to `src/data/release-manifest.json`. Refresh that snapshot occasionally.
- Brand accent is lime `#c6f432` (app icon). Community: Discord, AGPL-3.0 license.

## Commands

- `astro dev --background` to start the dev server (manage with `astro dev stop|status|logs`)
- `npm run build` production build to `dist/`
- `npm run check` Astro + TypeScript type check
- `npm run format` Prettier with Astro and Tailwind class sorting
- `npm run assets:prepare` re-crops the editor screenshot and copies logos from `../relay/assets`

## Structure

- `src/layouts/Base.astro` head/meta, fonts, ClientRouter, grain overlay, loads the scroll script
- `src/styles/global.css` all design tokens (`@theme`) and custom utilities (`@utility`)
- `src/scripts/scroll.ts` Lenis + GSAP ScrollTrigger + Motion reveals, view-transition aware
- `src/scripts/platform.ts` client OS detection shared by the hero button and the picker
- `src/lib/releases.ts` manifest fetch, platform/arch/format model, URLs (repo, releases, Discord)
- `src/components/` Astro-only: Button, Section, Container, Header, Footer, DeviceFrames,
  DownloadButton (OS-detected hero CTA), Downloader (OS then architecture then files picker)
- `src/assets/` editor screenshot (cropped), phone preview, logos. `public/` favicons.
- `docs/RESOURCES.md` research: galleries, tools, libraries, guidelines

Path alias: `@/` maps to `src/`.

## Design rules

Theme is dark only. Premium and restrained. Inspiration: spline.design, diffusion.studio.

- Use the tokens: `bg-bg`, `bg-bg-raised`, `bg-bg-overlay`, `text-fg`, `text-fg-muted`, `text-fg-subtle`,
  `border-line`, `border-line-strong`, `text-accent`. Do not introduce ad-hoc hex colors.
- No gradients as decoration, no glows, no purple. Depth comes from `border-line` + `hairline` + `shadow-raised`.
- One accent color (brand lime), sparingly: focus, a single highlighted word, live indicators. Never large fills.
- Typeface is Hanken Grotesk only (`font-sans`). Headlines use `text-display` / `text-display-sm`, weight 500,
  tight tracking. The `eyebrow` utility is for tiny metadata, not section labels.
- Never use numbered section labels ("01 — Features") or em dashes in copy. Both read as AI-generated.
  Section headers are a plain heading. No "Now on iOS and Android" style availability eyebrows either.
- Layout: `container-x` for the content column, `section-y` for vertical rhythm. Generous whitespace.
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

Cloudflare Workers via Workers Builds (GitHub-connected). Build command `npm run build`, deploy command
`npx wrangler deploy`. `wrangler.jsonc` serves `dist/` as static assets under the Worker name `concat-website`;
that name must match the Worker in the Cloudflare dashboard. No Astro adapter is used and none should be
added: the site is fully static. `npm run deploy` does the same from a machine that is logged in to Wrangler.
