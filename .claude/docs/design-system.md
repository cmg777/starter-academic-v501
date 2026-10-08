# Design system

How the site looks and why, for anyone changing templates or styles. `CLAUDE.md`
keeps a short summary; this file holds the detail. History:
`logs/2026-10-03-orbital-landing.md`, `logs/2026-10-04-cinematic-landing.md`,
`logs/2026-10-06-homepage-performance.md`, `logs/2026-10-08-nav-restructure.md`,
`logs/2026-10-08-site-audit.md`.

## 1. Two page systems, one palette

| | Homepage (`/`, `/es/`, `/ja/`) | Every other page |
|---|---|---|
| Template | `layouts/index.html` (standalone, no Wowchemy JS/CSS) | Wowchemy v5 templates + project forks (`.claude/docs/theme-overrides.md`) |
| Copy | `data/orbital.json` (EN/ES/JA; keep the three locales in sync) | Content front matter + `i18n/*.yaml` + section `_index.md` params |
| CSS | `orbital-palette.css` + `orbital.css` + `orbital-cinema.css`, concatenated, minified and **inlined** in `<head>` | Wowchemy CSS, then `custom_head.html` adds `orbital-palette.css` + `orbital-subpages.css` (one fingerprinted bundle); component styles in `assets/scss/custom.scss` |
| JS | `orbital.js`, `lang-pref.js`, `orbital-gallery.js`, `orbital-cinema.js` as one deferred, fingerprinted bundle | Wowchemy bundle + per-component scripts (labs, gallery filters) |
| Menu | `.desktop-nav` row + `.mobile-menu` `<details>` | Wowchemy `#navbar-main` (forked: `navbar-expand-xl`) |

Both read the same menu (`site.Menus.main`: `config/_default/menus.yaml` for EN, `languages.yaml` for ES/JA).

### Tokens (`assets/css/orbital-palette.css`)

| Token | Value | Use |
|---|---|---|
| `--orbital-bg` | `#050a12` | page background |
| `--orbital-panel` | `#0a121d` | cards, panels, collapsed menu |
| `--orbital-ink` | `#edf2f6` | body text, headings |
| `--orbital-muted` | `#9baaba` | secondary text, footer links |
| `--orbital-line` | `#22303e` | borders, dividers |
| `--orbital-blue` | `#88b9de` | links |
| `--orbital-gold` | `#e9c184` | accents, active menu item, kickers |
| `--orbital-font` | system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`) | all text; no web fonts |
| `--orbital-mono` | `"SFMono-Regular", Consolas, "Liberation Mono", monospace` | code |

- **Dark only, rendered on the server:** `params.yaml` sets `theme: nightlights`, `day_night: false`, `show_day_night: false`. `data/themes/nightlights.toml` mirrors the tokens for Wowchemy's build-time styles, so keep the two in sync.
- **Outside this theme:** standalone teaching apps (`web_app/`), Quarto slide decks, scientific figures and syntax highlighting keep their own palettes and semantic colors.

## 2. Homepage

- **Globe:** `assets/js/orbital.js` runs native WebGL with no library or CDN. The NASA Black Marble textures (`assets/media/orbital/`, desktop 3600×1800 and mobile 1800×900) are served as same-size WebP (q88).
  - Never preload the textures.
  - Start the WebGL setup only after the first paint (creating it at startup held the first paint for about 1.2 s).
  - Static fallback: a 53 KiB WebP.
  - `node --test tests/orbital.test.cjs` covers the globe lifecycle.
- **Performance guardrails:** the opening sequence takes about 0.6 s. Never hide content that is already on screen. Google Analytics loads after the page is idle, in production only.
- **Cinematic layer:** `orbital-cinema.css` / `orbital-cinema.js`, about 4 KB gzipped. It covers the starfield, Sentinel-2 craft, 3D orbits, network arcs drawn through `earth.onGlobeDraw`, reveals, tilt cards, the coverflow gallery and the earthrise footer. **Every effect needs a still fallback** for reduced motion, touch, print and no-JS.
- **Headline markup:** `title` / `titleAccent` in `orbital.json` may contain `<span class="kicker">` and `<em>`.
- **Sections and data sources:**
  - **Featured articles (`#featured`):** up to 3 `articles` with `publication_types` 1–3 and `date ≤ now`. Those with `featured: true` come first (newest `date` first), and the newest unflagged papers fill any free slots. The flag must be set in each language bundle. Each row shows year / journal, title, the plain-language `summary:` and the article's buttons as pills (`partials/orbital-paper-links.html`). The partial mirrors Wowchemy `page_links.html`: it has the same order and URL rules (`url_*`, bundle PDF, DOI, then `links:`), but it drops Cite because the homepage does not load the Cite modal JS. Icons are inline Font Awesome 5 SVG paths, with `link` as the fallback, because the homepage loads no icon font. To support a new `links:` icon, add its path to the `$icons` map.
  - **Presentations (`#talks`):** `partials/orbital-talks.html`, the 3 newest by `date`; `date_tba: true` marks an unknown date.
  - **Software (`#projects`, the anchor kept from the old Projects block):** the 3 most recently *committed* `software` bundles (`.ByLastmod.Reverse`, `enableGitInfo`). Committing a change under `content/software/<slug>/` (plus ES/JA) moves that package to the front.
  - **Tutorials (`#posts`):** up to 3 tutorials. Those with `featured: true` come first (newest `date` first; set the flag on the ES/JA stubs too), and the most recently committed (`.ByLastmod`) fill any free slots. Card summaries are cut at 160 characters (`orbital-card.html`).
  - **Students (`#people`):** `partials/orbital-community.html`, using the localized `content/home/people.md` `user_groups`.
  - **Photo carousel:** `partials/orbital-gallery.html`, with photos from `content/home/gallery/gallery/`.
  - **Contact (`#contact`):** the footer.
- **Legacy files:** `content/home/*.md` widget files are kept for reference only. Their weights and text no longer control the page; `people.md` and the gallery photos are still read.

## 3. Content pages

- **Image-first header:** `layouts/partials/page_header.html` puts the featured image above the title. Data-science posts use `image.placement: 3`.
- **Footer:** `layouts/partials/site_footer.html`. Its text comes from `orbital.json` (`footerTag`, `footerExplore`, `footerResources`, `footer`). The menu is split 6/6 across two columns.
- **List pages:**
  - **Articles** (`section/articles.html` + `publication_showcase.html`): search, type and year filters.
  - **Presentations** (`section/presentations.html`): search and year filter.
  - **Tutorials** (`section/tutorials.html`): topic strips from `data/tutorial_topics.yaml`, language chips, sort and search. ES/JA labels come from `ui:` / `topic_labels:` in the section `_index.md`.
  - **Books, Software, Data and WebApps** (`section/<name>.html`) all use **`partials/catalog.html`**. It renders alternating `.cz-showcase` rows (image | title, summary, `links:` buttons) with a search box, one `<select>` per `filters:` entry in the section `_index.md`, and an optional `year_filter`. Only options with matching items are shown. Rows carry `data-<key>` attributes, written with `safeHTMLAttr` (see the gotcha in `CLAUDE.md`).
- **Learning components and labs:** `.learn-card` (`custom.scss` §24), plus `fwl-lab` / `panel-lab` / `did-lab` / `sc-lab`, each with its own CSS and JS. See `learning-components.md`.

## 4. Responsive rules (enforced by `scripts/audit-nav.cjs`)

- **Menu breakpoint is 1200px on both systems.**
  - **Homepage:** at ≤1199px `.desktop-nav` hides and `.mobile-menu` shows (`orbital.css`).
  - **Content pages:** `navbar-expand-xl`. The forked `partials/navbar.html` uses `d-xl-*` classes. The collapsed-header rules for 992–1199px are in `custom.scss` §7a, and the icon/brand placement below 1200px is in §7.
  - From 1200px up, menu labels are `nowrap` at 0.72rem (`orbital-subpages.css`).
- **Keep menu labels short in all three languages.** At 1200px the gap before the search/language icons is only about 13–25px. A new menu item, or a longer label in any language, can break the row, so re-run `node scripts/audit-nav.cjs` after any menu change.
- **Test widths:** 360, 390 (phones), 768, 1024 (tablets), 1280, 1440 (laptops/desktops), in EN, ES and JA.
- **No horizontal page scroll at any width:**
  - `orbital-subpages.css` cancels the 1px `.row` overflow inside `.universal-wrapper` at ≤991px.
  - Wide display math scrolls inside its own box (`.article-style mjx-container[display="true"]`).
  - Code blocks scroll inside `.code-copy-wrap`.
  - Tutorial topic strips are deliberate horizontal scrollers.
- **Measuring widths:** resizing a window does not give an exact viewport when display scaling or zoom is on, so use Playwright viewports (the audit script) or same-origin iframes of a fixed width.

## 5. Homepage thumbnail quality standard

Treat presentation, research-paper, tutorial, and software thumbnails as product
imagery: they must look crisp, colorful, and immediately legible on first view.

- Add a dedicated `featured.webp`, `featured.png`, or `featured.jpg` to each page
  bundle. Prefer a 16:9 source at 1920×1080 or larger; 1280×720 is the minimum.
  Start from the original export rather than enlarging a small or compressed image.
- Keep titles, charts, diagrams, and logos large enough to remain readable at card
  size. Presentation and publication artwork must keep important content away from
  the edges because the entire image is shown with `object-fit: contain`. Software
  and tutorial artwork uses `object-fit: cover`, so keep essential content inside
  a generous central safe area.
- Paper and presentation rows must use `layouts/partials/orbital-thumbnail.html`:
  a 320×180 WebP at quality 88 plus a 640×360 WebP at quality 92, exposed through
  `srcset` with `sizes="160px"`. Do not reduce these dimensions or quality values.
- Software and tutorial cards must use `layouts/partials/orbital-card.html`: a
  480×293 WebP at quality 86 plus a 960×586 WebP at quality 92, exposed through
  `srcset` with the existing responsive `sizes` rule. Do not revert to a single
  low-quality 720×440 thumbnail.
- Product thumbnails must remain on the pixel grid. Do not apply CSS blur,
  desaturation, reduced opacity, dark image overlays, perspective tilt, moving
  glare, or hover zoom to `.item-thumbnail` or `.card-image img`. The cinematic
  reveal may animate position and opacity, but its product-card override must keep
  `filter: none` so images never resolve from a blur.
- Preserve `loading="lazy"` and `decoding="async"`. These improve loading without
  lowering visual quality.
- After changing thumbnail markup or styles, run the production Hugo build and
  inspect all four homepage groups at desktop and mobile widths. Confirm that the
  browser selects a responsive WebP, computed `filter` and `transform` are `none`,
  text inside the artwork is legible, and no overlay washes out the colors.

**Catalog and WebApps card images:**
- Books, Software and Data use the bundle's `featured.*`, fitted to 1200×900.
- GEE web apps use 1600×900 screenshots from `scripts/capture-dashboard-screenshots.cjs`.
- Streamlit apps reuse their package's `featured.webp`, because headless captures of their maps come out blank.
- Tutorial apps reuse the tutorial's featured image.
