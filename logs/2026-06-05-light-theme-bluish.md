# 2026-06-05 — Light-theme redesign: bluish, hero-matched daytime identity

## Why

The site was built **dark-first** — the SCSS comment at `assets/scss/custom.scss`
(section 22.2) says it outright: *"Default mode = dark … a clean light variant lives
under the un-prefixed selectors."* As a result light mode was the **un-styled
baseline** and looked undercooked:

- All the cinematic atmosphere (the nightlights backdrop + accent glows) was gated
  under `.dark` only; light mode got none of it.
- Section backgrounds alternated between two near-identical pale greys
  (`#f6f8fc` / `#eef2f9`) → flat and monotonous.
- The frosted-glass cards used `backdrop-filter: blur()` over solid fills → the glass
  blurred nothing.
- Accent contrast failed WCAG AA — teal `#00d4c8` (~1.6:1) and steel `#6a9bcc`
  (~2.6:1) as link/subtitle text on near-white.

Goal (per the user): give light mode its own intentional identity — a **bright
daytime canvas with a bluish tone that matches the hero image** — polished across the
whole site, AA-compliant, while leaving the `.dark` cinematic layer **untouched**.

## What changed

CSS-only, all in **`assets/scss/custom.scss`**. Every new rule is guarded
`body:not(.dark)` (the theme toggles `body.dark`; this guard already existed in the
file), so dark mode is byte-for-byte unchanged. The palette was **sampled from the
hero image** (`assets/media/websiteCover5.webp` — a deep-navy field lit by cyan-teal,
cobalt-blue and red/orange nightlights):

- **Daytime sky canvas** — a fixed `.page-wrapper::before` with a soft
  periwinkle→cobalt gradient (`#eef3fd → #dde7f7 → #cdd9f0`) plus hero-matched glows
  (cyan, cobalt, a faint warm wash). The light twin of the dark cinematic backdrop.
- **Sections transparent over the canvas** (replacing the flat grey alternation), a
  whisper of cobalt on even rows → one continuous bright-blue surface.
- **Faint cobalt map graticule** (`.page-wrapper::after`) — echoes the hero's dotted
  world map; subtle enough never to compete with body text.
- **Card shadows refined** (`@mixin cz-card` light base + About profile card) — with
  texture behind them the glass now reads as glass; crisper layered shadow.
- **WCAG-AA text contrast** — section subtitle `#335487`, prose links `#285f9c`,
  article/footer hovers `#0a7d75`. Bright teal `#00d4c8` is kept for **non-text
  accents only** (eyebrow ticks, gradient dividers, large-heading hovers).

Two course-corrections during iteration (both reverted/avoided in the final state):

- **Navbar stays navy.** A white-glass navbar was tried and reverted — the menu labels
  live in nested `<span>`s the theme colours white, so a white bar gave white-on-white
  invisible text. The navbar now keeps section 22.9's navy glass
  (`rgba(10,18,48,.8)` = the hero's `#0a1230`) with the theme's white text in both
  modes — it matches the hero and is always legible.
- **No hero→About "melt" band.** A dark gradient + `overflow:hidden` on the About
  section was tried to dissolve the hero into the page, but the `overflow:hidden`
  clipped the circular profile avatar. Removed — the navy hero now flows into the
  soft-blue canvas naturally (same blue family), so no melt is needed.

## Result / verification

Hugo 0.111.3 `--gc --minify --buildFuture` builds clean (EN/ES/JA). Verified in the
compiled CSS: the bluish canvas, navy navbar (22.9) and the `.dark` backdrop are all
present; the navbar override and melt are gone. **Dark mode is unchanged** — every
change is `body:not(.dark)`-guarded or a light-base shadow that `.dark` overrides, and
`.dark .page-wrapper::before` is byte-for-byte intact. Light-mode QA: navbar letters
visible, About avatar visible, soft-blue daytime feel matching the hero.

Because this is **shared SCSS with no content changes**, `/es/` and `/ja/` inherit the
new light theme automatically — `scripts/i18n-parity.sh` is unaffected (no new gaps).

Gotcha noted: Hugo's `resources/_gen` resource cache served a **stale compiled CSS**
across incremental builds during development. If a rebuild doesn't reflect SCSS edits,
clear `resources/_gen` or build with `--ignoreCache`.

## Not changed

- The `.dark` cinematic layer (hero, backdrop, glass) — untouched.
- No templates, content, config, or `params.yaml` changes — **CSS only**.
- Hero imagery, layout, sections, and motion — unchanged.
