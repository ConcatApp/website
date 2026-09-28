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
- The app icon is lime `#c6f432`; on the site it appears only as the favicon. The site accent is blue (see
  Design rules). Community: Discord, AGPL-3.0 license.
- Sponsorship: two monthly tiers in `src/lib/sponsor.ts`: Public sponsor ($25 a month, recommended) and
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
- `npm run assets:prepare` re-crops the editor screenshot and copies logos from `../relay/assets`

## Structure

- `src/layouts/Base.astro` head/meta, fonts, ClientRouter, grain overlay, loads the scroll script
- `src/styles/global.css` all design tokens (`@theme`) and custom utilities (`@utility`)
- `src/scripts/scroll.ts` Lenis + GSAP ScrollTrigger + Motion reveals, view-transition aware. It also owns in-page
  `#hash` links: Astro's ClientRouter and Lenis `anchors` fight over them, so neither is allowed to handle them.
- `src/scripts/platform.ts` client OS detection shared by the hero button and the picker
- `src/lib/releases.ts` manifest fetch, platform/arch/format model, URLs (repo, releases, Discord)
- `src/lib/sponsor.ts` sponsor tiers
- `src/lib/contact.ts` public contact channels (the email shown in the Contact section)
- `src/components/` Astro-only: Button, Section, Container, Header, Footer, DeviceFrames,
  DownloadButton (OS-detected hero CTA), Downloader (OS then architecture then files picker)
- `src/assets/` editor screenshot (cropped), phone preview, logos. `public/` favicons.
- `docs/RESOURCES.md` research: galleries, tools, libraries, guidelines

Path alias: `@/` maps to `src/`.

## Design rules

Theme is light only: cool off-white page, white cards, near-black text, one blue accent. Premium and restrained.
Inspiration: linear.app, vercel.com, resend.com, stripe.com.

- Use the tokens: `bg-bg`, `bg-bg-raised`, `bg-bg-overlay`, `text-fg`, `text-fg-muted`, `text-fg-subtle`,
  `border-line`, `border-line-strong`, `bg-accent`/`text-accent`, `bg-accent-soft`, `text-accent-fg`. Do not introduce
  ad-hoc hex colors. Every text step clears 4.5:1 on white and on the page; keep it that way when changing a token.
- No gradients as decoration, no glows, no purple, no lime on the page. Depth comes from `border-line` + `hairline`
  (a 1px contact shadow) + `shadow-raised`.
- One accent color (blue): primary buttons, focus rings, feature icons, links on hover, selected states
  (`border-accent` + `bg-accent-soft`) and a single highlighted word in the hero. Never a section background,
  never a gradient. `bg-accent-soft` is for selected states and the Recommended badge only.
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
