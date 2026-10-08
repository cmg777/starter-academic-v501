# Project Overview

Academic portfolio website for Carlos Mendez (carlos-mendez.org). Built with Hugo + Wowchemy v5 theme, deployed on Netlify.

See `README.md` for human-facing docs (directory structure, tech stack, content conventions). Detailed operational recipes live in `.claude/docs/` (loaded on demand). Project history lives in `logs/`.

# Tech Stack

- Hugo Extended — static site generator (version pin: see **Hugo Version Constraints**)
- Wowchemy v5 theme (via Hugo Modules, pinned to commit 20210324 in go.mod)
- Goldmark markdown renderer with `unsafe: true` (inline HTML allowed)
- Mermaid diagrams supported (add `diagram: true` to front matter)
- SCSS for custom styles (`assets/scss/custom.scss`)
- Netlify for deployment (auto-deploy on push to master)

# Key Commands

- Local Hugo binary: `"$HOME/Library/Application Support/Hugo/0.111.3/hugo"` (v0.111.3 Extended — matches the `netlify.toml` pin)
- Run local dev server: `"$HOME/Library/Application Support/Hugo/0.111.3/hugo" server --disableFastRender`
- Build site: `"$HOME/Library/Application Support/Hugo/0.111.3/hugo" --gc --minify`
- **Do not use the 0.84.2 or 0.89.4 binaries also present under that directory.** Both predate the ≥0.96 floor and fail on `layouts/section/presentations.html` with `function "continue" not defined` before rendering any content. See **Hugo Version Constraints**.
- `./update_wowchemy.sh` — update Wowchemy modules and sync Hugo version in netlify.toml

# Content Conventions

> Adding or editing any content type below also requires creating its Spanish (`content/es/…`) and Japanese (`content/ja/…`) counterpart in the same change — see **Internationalization (i18n)**.

## Nav item → content folder

| Nav item | Where to add files |
|----------|--------------------|
| Articles | `content/articles/` (homepage `#featured`; list at `/articles/`) |
| Books | `content/books/` |
| Courses | `content/courses/` |
| Presentations | `content/presentations/` (homepage `#talks`; list at `/presentations/`) |
| Software | `content/software/` |
| WebApps | `content/webapps/` (standalone apps) plus any tutorial `web_app/` folder (auto-listed) |
| Data | `content/data/` |
| Tutorials | `content/tutorials/` (homepage `#posts`; list at `/tutorials/`) |
| AboutMe / ResearchLab / Contact | homepage sections — `data/orbital.json`, `content/home/`, `content/authors/admin/` |
| Events | external (`https://lu.ma/cmg`) |

The nav lives in `config/_default/menus.yaml` (EN) and `config/_default/languages.yaml` (ES/JA). `content/projects/` is retired: only the hidden `ds4ds` bundle remains (`_build: {render: never, list: never}`), and `netlify.toml` redirects `/projects/` → `/software/` and `/post/*`, `/publication/*`, `/event/*`, `/talk/*` (plus `/es/`, `/ja/`) to the new sections. Moved items carry `aliases:`.

## Naming

- Articles (publications): `content/articles/YYYYMMDD-abbreviation/index.md`
- Presentations (events/talks): `content/presentations/YYYYMMDD-abbreviation/index.md`
- Tutorials (posts): `content/tutorials/descriptive-slug/index.md`
- Books / Software / Data / WebApps: `content/{books,software,data,webapps}/<slug>/index.md`
- Authors: `content/authors/firstname-lastname/_index.md`

Folder names differ from the Wowchemy content types, which are set by a `cascade` (`_target: {kind: page}`) in each section `_index.md`: `articles/` pages are type `publication`, `presentations/` pages are type `event`, `tutorials/` pages are type `post`. Section templates are `layouts/section/{articles,presentations,tutorials}.html`. Permalinks: `/articles/<slug>/`, `/presentations/<slug>/` (the old `/talk/<slug>/` is gone), `/tutorials/<slug>/`.

## Catalog sections (Books, Software, Data, WebApps)

- Listed by `layouts/section/{books,software,data,webapps}.html` through the shared `layouts/partials/catalog.html` (search box + one dropdown per `filters:` entry in the section `_index.md`, plus an optional `year_filter`). A new filter value needs an option in all three language `_index.md` files.
- **Books** — `book_format: print|online`; former type-5 publications keep `type: publication` + `publication_types`.
- **Data** — `data_type: repository|portal`, `region`.
- **WebApps** — one bundle per standalone app (`app_url`, `platform: gee|streamlit`, `region`, `topic` id from `data/tutorial_topics.yaml`, `_build: {render: never, list: always}` so the card opens the app, `links:`, `featured.jpg` from `scripts/capture-dashboard-screenshots.cjs`). Tutorials with `web_app/index.html` are listed automatically. See `.claude/docs/webapps.md`.

## Front Matter

- All content uses YAML front matter.
- Articles (type `publication`) require: title, authors, date, publication_types (0-8), publication, abstract, tags.
- The `admin` author refers to Carlos Mendez (`content/authors/admin/`).
- `featured: true` is retained for legacy publication widgets; the current homepage selects recent papers automatically by publication date.
- Data science posts use `image.placement: 3` for full-width featured images above the title.
- Presentations (type `event`) appear on the live site automatically via `content/presentations/<slug>/index.md`. `date:` is required (the talk date); future dates are allowed — production builds use `--buildFuture`. Leave `publishDate:` at "now" or earlier; a future `publishDate` hides the event in production.

## Publication Types

0=Uncategorized, 1=Conference paper, 2=Journal article, 3=Preprint, 4=Report, 5=Book, 6=Book section, 7=Thesis, 8=Patent

## Icons

Font Awesome icons in link buttons. Common `icon_pack` values: `fas` (solid), `fab` (brands), `ai` (academicons). Reference: https://fontawesome.com/search

# Homepage Architecture

The landing page uses the standalone `layouts/index.html` template. Its English,
Spanish, and Japanese copy is in `data/orbital.json`; its dedicated design and
interactive NASA Earth-at-night globe are in `assets/css/orbital.css` and
`assets/js/orbital.js`. See README's **Cinematic landing page** section and
`logs/2026-10-03-orbital-landing.md`. The browser has no 3D-library dependency.
The homepage CSS is inlined in `<head>` and its four scripts ship as one deferred
bundle; the globe textures live in `assets/media/orbital/` and are served as
same-size WebP. Keep the hero opening sequence under about 0.6 s and do not hide
content that is already on screen. Keep WebGL setup in `orbital.js` deferred until
after the first paint, and do not preload the globe textures; see
`logs/2026-10-06-homepage-performance.md`.

Both page systems share `assets/css/orbital-palette.css`. Content pages load the
palette plus `assets/css/orbital-subpages.css` after Wowchemy, via `custom_head.html`.
Keep the build-time colors in `data/themes/nightlights.toml` synchronized with the
palette. The site uses server-rendered dark mode (`light = false`, `day_night: false`)
to keep colors consistent across navigation. Standalone teaching apps and slide
decks are explicitly outside this website-only theme change.

The old `content/home/` widget files are retained for reference; their weights
and hero text no longer control the landing page. The localized `people.md`
student-group configuration still supplies the visible student photo cards.
The original gallery photos supply a native scrolling carousel, with behavior
in `assets/js/orbital-gallery.js`. Both desktop and mobile navigation read the
existing localized `site.Menus.main` configuration.
The new template reads articles/presentations/software/tutorials and author images
from existing Hugo content. Keep all three `data/orbital.json` locales synchronized. Run
`node --test tests/orbital.test.cjs` after changing globe behavior.

The cinematic layer (starfield, 3D orbits, network arcs, reveals, tilt cards,
coverflow, earthrise) lives in `assets/css/orbital-cinema.css` and
`assets/js/orbital-cinema.js`; see `logs/2026-10-04-cinematic-landing.md`. Every
effect must keep a still fallback (reduced motion, touch, print, no JS). The hero
headline markup (`.kicker`, `<em>` keywords) is in `data/orbital.json`.

The homepage's **Recent research** section automatically lists the three newest
academic papers by publication `date`, using publication types 1, 2, and 3
(conference papers, journal articles, and preprints). Books and future-dated papers
are excluded. It reads each language's publication content and does not use
`featured` flags or Git modification dates.

Research and presentation rows use their own page bundle's `*featured*` image for
small thumbnails, generated by `layouts/partials/orbital-thumbnail.html`. Keep
the full image visible with `object-fit: contain` so figures and slide titles are
not cropped. Their titles share responsive typography in `orbital.css`.

## Homepage Thumbnail Quality Standard

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

**Software ordering:** the homepage block formerly called Projects (anchor `#projects` kept) now shows the three most recently updated **Software** packages, headed "Software" and linking to `/software/`. It and the legacy `showcase` shortcode (`layouts/shortcodes/showcase.html`, which maps type `project` → section `software` and `event` → `presentations`) sort the `software` section by `.ByLastmod.Reverse` (git commit date of each package's `index.md`; `enableGitInfo: true`). **Convention: committing any change under `content/software/<slug>/` (plus its ES/JA counterparts) automatically surfaces that package FIRST — no manual `date`/`weight` bump.** The Talks widget uses the same shortcode but keeps `date`-descending order (the lastmod sort is guarded by `if eq $section "software"`).

# Custom Components

- **`fullwidth-iframe` shortcode** (`layouts/shortcodes/fullwidth-iframe.html`) — full-viewport-width iframe with responsive height + lazy loading. Usage: `{{</* fullwidth-iframe src="…" height="800px" */>}}`. If a new page type using it doesn't break out of margins, add its container class to the overflow reset in `custom.scss`.
- **Page header override** (`layouts/partials/page_header.html`) — renders the featured image **above** the title (image-first). Data science posts use `image.placement: 3` (2560x2560 Fit); Colab/script/notebook buttons come from `links:` front matter, not the body; the image wrapper uses `mb-4`.
- **Custom CSS** (`assets/scss/custom.scss`) — hero fix, iframe breakout, dashboard gallery grid (legacy, unused), notebook-style post styling, Python syntax highlighting, left-side ToC. See `README.md` for the section breakdown.
- **WebApps** (`/webapps/`) — one `content/webapps/<slug>/` bundle per standalone GEE/Streamlit app (card opens the app directly), plus auto-listed tutorial `web_app/` folders. Trigger: **"Add web app: `<App URL>` — `<English title>`"**. See `.claude/docs/webapps.md`. (The old dashboards gallery page and its `dashboard-gallery`/`dashboard-card` shortcodes are retired; the shortcodes remain but are unused.)
- **AI Podcast Player** — inline audio-player block appended to a post (raw audio file), or a Spotify embed above the Abstract (Spotify-hosted episode). Trigger: **"Add AI Podcast to `<post slug>`"**. See `.claude/docs/ai-podcast-player.md`.
- **Post resource buttons** — the **Slides (PDF)**, **Slides (HTML)**, and tutorial **`.zip` bundle** `links:` entries (each has a specific relative-vs-absolute URL rule). Triggers: "Add slides to `<post>`" / a new `slides/` deck / a Quarto bundle. See `.claude/docs/post-resource-buttons.md`.
- **AhaSlides interactive deck** — an existing Quarto reveal.js deck re-published on AhaSlides. **Content slides are images of the real slides** (render `slides.qmd` to PDF, import through the editor UI); AhaSlides supplies only the live audience layer via MCP (quizzes, polls, word clouds, scales, Q&A, spinners, leaderboards and marketplace types; the paid-plan reference is `content/tutorials/python_fwl/ahaslides/activities.py`; a Canva/PDF source split into several lectures, with playable YouTube slides, is `content/courses/slides/ahaslides/`; the self-paced, three-language hero keynote captured from the Canva view is `content/keynote/ahaslides/`). Never build content slides with the API's own text types or `content-v2` — see the doc for why. Trigger: **"Make an AhaSlides deck for `<post slug>`"**. See `.claude/docs/ahaslides.md`.
- **Learning components** — predict-then-reveal checks, worked exercise solutions, common-misconception cards and collapsible proofs (`.learn-card` + `predict-card`/`solution-card`/`misconception-card`/`proof-card`; `custom.scss` §24; pure HTML `<details>`, no JS), plus the interactive shortcodes `fwl-lab` (`layouts/shortcodes/fwl-lab.html` + `assets/js/fwl-lab.js` + `assets/css/fwl-lab.css`) `panel-lab` (same three-file layout; two tabs: selection lab and demeaning lab; used in `python_panel_intro`) `did-lab` (same layout; two tabs: 2×2 parallel-trends lab and event-study lab, both on the post's real data; used in `python_did101`) and `sc-lab` (same layout; four tabs: weight mixer, placebo cutoff, in-time placebo and leave-one-out, all on the Proposition 99 data; used in `python_sc101`; test with `node --test tests/sc-lab.test.cjs`). Trigger: **"Add learning components to `<post slug>`"**. See `.claude/docs/learning-components.md`.

# Curriculum Vitae (CV)

Hand-written **moderncv LaTeX** project at `content/cv/` (`main.tex` + `.cls`/`.sty` + `avatar.png` + `certificates/`). Compiles to `static/media/CV.pdf` (served at `/media/CV.pdf`, linked from each author profile). **English-only** — i18n rules do not apply.

- **`content/cv/` is excluded from the Hugo build** via `excludeFiles: '{es,ja,cv}/**'` in `config/_default/config.yaml`; the only public artifact is `static/media/CV.pdf`. Sources (`.tex`/`.cls`/`.sty`/`avatar.png`/`certificates/`) are committed; LaTeX build artifacts are gitignored.
- **Compile manually:** `cd content/cv && latexmk -pdf main.tex`, then copy `content/cv/main.pdf` to `static/media/CV.pdf`.
- **Sync from website content:** the `update-cv` skill (`/project:update-cv`) additively adds missing publications/talks/software (looks up coauthors via Crossref by DOI), compiles, and copies the PDF — leaving changes uncommitted for review. Never touches the hand-maintained sections. See `.claude/skills/update-cv/SKILL.md`.

# Claude Code Skills

Eighteen skills, each with full docs in its own `SKILL.md` (loaded when invoked). Twelve are Write/Review pairs across six artifact stages; six are standalone. Skills are independent but compose into a pipeline (script → results report → blog post → infographic → web app). All follow: (1) confirm scope, (2) execute, (3) offer follow-ups. Legacy skills preserved at `.claude/skills/legacy/`.

## Pipeline overview

| Stage | Write | Review |
|-------|-------|--------|
| Script | `/project:write-script` | `/project:review-script` |
| Results report | `/project:write-results-report` | `/project:review-results-report` |
| Blog post | `/project:write-post` | `/project:review-post` |
| Infographic | `/project:write-infographic` | `/project:review-infographic` |
| Interactive web app (static HTML/CSS/JS, D3) | `/project:write-app` | `/project:review-app` |
| Quarto notebook (R/Python/Stata, lighter) | `/project:write-quarto-notebook` | — |
| Quarto notebook (Python, friction-free bundle) | `/project:write-quarto-notebook-python` | — |
| Slide deck (Quarto reveal.js) | `/project:write-slides` | `/project:review-slides` |
| Data dictionary (interactive HTML + Stata pipeline) | `/project:write-data-dictionary` | — |

Standalone companions: `write-quarto-notebook`, `write-quarto-notebook-python`, `write-data-dictionary`, `translate-content`, `update-author-profile`, `update-cv`. Each skill's `name`/`description`/invocation lives in its own `.claude/skills/<name>/SKILL.md`.

## Shared conventions

- Website color palette: background `#050a12`, panels `#0a121d`, text `#edf2f6`, secondary text `#9baaba`, borders `#22303e`, blue `#88b9de`, gold `#e9c184` (shared CSS tokens).
- Standalone teaching apps, slides, figures, and syntax highlighting retain their established palettes and semantic color distinctions.
- Currency dollar signs: `\\$` in `index.md` (MathJax-enabled), `\$` in notebook
- Output blocks: use ` ```text ` (not bare ` ``` `) to prevent highlight.js auto-detection coloring
- Causal posts: explicitly state estimand (ATE/ATT) for each method; distinguish randomized vs observational framing
- PDF reference handling: delegate large PDFs to Explore agents; extract only relevant pages (5–15); clean up before committing
- Reference posts (Python): `python_ml_random_forest` (ML), `python_dowhy` (causal inference), `python_fwl` (dark-theme figures, simulated data, learning components, interactive lab), `python_pyfixest` (panel/fixed effects), `python_esda2` (ESDA/LISA), `python_mgwr` (MGWR)
- Reference posts (Stata): `stata_rct` (RCT panel data, RA/IPW/DR/DiD/DRDID, Mermaid diagrams, equations with analogies)

# Internationalization (i18n)

The site is trilingual: **English at `/`** (`content/`), **Spanish at `/es/`** (`content/es/`, neutral Latin American Spanish, formal `usted`), **Japanese at `/ja/`** (`content/ja/`, です・ます). There is no English fallback — untranslated content simply won't appear on `/es/` or `/ja/`.

**Translate new content (REQUIRED):** whenever qualifying content is added or materially edited under `content/<section>/<slug>/`, the SAME change MUST create/update its ES + JA counterparts:
- `articles`, `presentations`, `books`, `software`, `data`, `webapps`, `authors`, each section `_index.md` (translated `filters:` labels), and standalone pages (courses/alumni/slides/privacy/terms) → **full translation**.
- `tutorials` (type `post`) → **stub card only** (translated `title`+`summary`, `card_url: "/tutorials/<slug>/"`, `_build: {render: never, list: always}`, empty body). Tutorials are the ONLY stub exception.

**Mechanism:** `/project:translate-content <slug> --lang all` (see `.claude/skills/translate-content/SKILL.md`) applies the glossary and copies assets. `scripts/i18n-parity.sh` reports EN items lacking an ES/JA counterpart. Full field-by-field rules, config/layout, geolocation, and the "add another language" recipe are in **`.claude/docs/i18n.md`**.

# Hugo Version Constraints

- The site requires Hugo **≥ 0.96** (`layouts/section/presentations.html` uses the `continue` keyword). `netlify.toml` pins `HUGO_VERSION = 0.111.3`. There is **no Netlify UI env override** — the `netlify.toml` pin is the actual build version. Keep the pin in the 0.96–0.119 window; do not revert it.
- **Local install matches the pin:** `$HOME/Library/Application Support/Hugo/0.111.3/hugo` (extended, darwin). Installed from the [v0.111.3 release](https://github.com/gohugoio/hugo/releases/tag/v0.111.3) — `hugo_extended_0.111.3_darwin-universal.tar.gz`. Use the same `<version>/hugo` layout when adding a version, and update **Key Commands** when the working version changes.
- Tested/safe window: **0.96–0.119** extended (verified on 0.111.3). Lower bound = `continue`; upper bound ≈ `site.GoogleAnalytics` removal (~0.120) and `paginate` removal (0.128). Goldmark (not Blackfriday) is used, so the 0.100 Blackfriday removal is irrelevant. Re-verify Wowchemy v5 compatibility before moving outside this window.
- Theme minimum: 0.78 (theme.toml).
- Hugo 0.91+ requires a security policy for `WC_POST_CSS` — already configured in `config/_default/config.yaml` under `security.funcs.getenv`.
- Wowchemy modules are pinned to commit 20210324 in go.mod; updating them is a separate decision from updating Hugo.

# Deployment

- Push to `master` triggers Netlify auto-deploy.
- Build command: `hugo --gc --minify -b $URL`.
- Deploy previews use `--buildFuture` to include future-dated content.
- Netlify cache plugin is enabled for faster rebuilds.

# Logs Directory

The `logs/` directory documents the current status and evolution of the site (dated `YYYY-MM-DD-slug.md` entries). Check it to understand recent changes and ongoing work. When making significant changes, add or update a log entry.

# Style Guidelines

- Do not add emojis to front matter or config files.
- Keep abstracts as single-line strings in YAML (no line breaks).
- Use em dashes (—) not double hyphens (--) in text content.
- Background images for homepage widgets are in `assets/media/` (prefer .webp over .jpg).
- All iframes should include `loading="lazy"` for performance.
- In posts with math enabled, use `\\$` for literal currency dollar signs (e.g., `\\$1,736`). The site overrides MathJax with `processEscapes: true` (`assets/js/mathjax-config.js`), so `\$` renders as a literal `$`. Do NOT use `&#36;` — it does not work.
