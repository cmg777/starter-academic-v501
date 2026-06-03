# Cinematic dark-theme sitewide redesign

**Date:** 2026-06-03

## Background

With the native hero finally shipped and its transparent-title bug solved (see
[2026-06-03-hero-title-fix.md](2026-06-03-hero-title-fix.md)), the rest of the
site still looked like a stock light-mode Wowchemy page. The hero's
"development-from-space" dark aesthetic — translucent navy glass panels, teal
accents, Cinzel display type, a night-lights atmosphere — stopped at the fold.

This session extends that cinematic language across the **whole** site and
restructures two listing pages (Projects, Presentations) into image-forward
galleries. The site now defaults to dark on a first visit, with a clean light
variant preserved under the day/night toggle.

## What changed

### 1. Dark-by-default theme

- **New `layouts/partials/custom_head.html`** — on a first visit (no stored
  `wcTheme`), sets `localStorage.wcTheme = '1'` (dark) and adds a `wc-pre-dark`
  class to `<html>` so a dark background paints immediately, before the theme's
  JS adds `body.dark` (anti-flash). Returning visitors' explicit choice is never
  overridden; the day/night toggle still works and persists.
- **`assets/scss/custom.scss` — new "Section 22"** (~490 lines): a single
  cinematic system layered on the stable `.home-section` / `.dark` selectors (no
  theme fork). Subsections:
  - 22.0 tokens, 22.1 glass-card mixin (light base + `.dark` override),
    22.2 section backgrounds & atmosphere (continuous navy backdrop, faint
    night-lights texture + accent glows via `.page-wrapper::before/::after`),
  - 22.3 section-header cohesion engine, 22.3b About profile card,
    22.4 featured publications → compact glass cards, 22.5 pages lists → glass
    rows, 22.6 showcase rows, 22.7 people/students cards, 22.8 contact panel,
    22.9 translucent navbar, 22.10 cinematic footer, 22.11 focus rings +
    reduced motion, 22.12 mobile, 22.13 projects gallery grid, 22.14 heading
    casing.

### 2. Projects gallery (`/projects/`)

- **New `layouts/section/projects.html`** — a single responsive grid of
  captioned 16:9 cards, newest first, matching the tutorials-gallery card look.
- **New `layouts/partials/project_card.html`** — 16:9 `Fill 800x450` thumbnail
  with a Cinzel title caption overlaid at the bottom (project images don't embed
  their titles), honoring `external_link` when present.
- **New `content/projects/_index.md`** — title + lead for the gallery.

### 3. Presentations gallery (`/event/`)

- **New `layouts/section/event.html`** + **`layouts/partials/event_card.html`** —
  same card grid as projects, with a `Jan 2006 · location` meta line above the
  title.
- **`content/event/_index.md`** — retitled "Recent & Upcoming Talks" →
  "Presentations" with a lead; dropped the old `view`/`header` front matter.

### 4. Homepage showcase rows

- **New `layouts/shortcodes/showcase.html`** — alternating image/text "showcase"
  rows for the latest N pages of a collection. Args: `type` (project|event),
  `count`, `browse_url`, `browse_label`. Reuses `functions/get_event_dates`,
  `functions/has_attachments`, and `page_links` for event meta + link buttons.
- **`content/home/projects.md`** and **`content/home/talks.md`** — converted from
  the `portfolio` / `pages` widgets to `blank` widgets that call the `showcase`
  shortcode + a "Browse all" link to the full gallery.

### 5. Cinematic footer

- **`layouts/partials/site_footer.html`** — rebuilt as `cz-footer`: brand name +
  tagline + social icons (ORCID, Google Scholar, GitHub, LinkedIn), two menu
  columns (Explore / Connect, split from `site.Menus.main`), and a copyright +
  Nagoya University affiliation line. Styled in SCSS 22.10.

### 6. Cleanups

- **`content/home/hero2.md`** → `active: false` (Canva-GIF hero retired; the
  native `hero2-new.md` is the live hero).
- **`content/home/{featured,contact,gallery/index,researchLab}.md`** — removed
  `text_color_light: true` so the dynamic dark theme controls text color.

## Verification

- `"$HOME/Library/Application Support/Hugo/0.84.2/hugo" --gc --minify` builds
  clean (862 pages, no template errors from the new section/partial/shortcode
  layouts).
- Locally: `hugo server --disableFastRender`, then confirm at
  `http://localhost:1313/` — dark homepage with glass sections, the Projects and
  Presentations showcase rows + "Browse all" links, `/projects/` and `/event/`
  card galleries, and the new footer. Toggle day/night to confirm the light
  variant still reads well; load in a fresh profile to confirm dark-on-first-visit
  with no white flash.

## How to re-verify the theme default

Clear `localStorage` (or use a fresh profile) and reload `/` — it should paint
dark immediately. Set the toggle to light, reload — the choice persists (dark
default only applies when `wcTheme` is unset).
