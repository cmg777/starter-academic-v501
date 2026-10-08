# carlos-mendez.org

Academic portfolio website for **Carlos Mendez**, Associate Professor of Development Economics at Nagoya University (GSID), Japan.

**Live site:** <https://carlos-mendez.org/>

## Tech Stack

| Component | Version / Detail |
|-----------|-----------------|
| Static site generator | [Hugo](https://gohugo.io/) 0.111.3 (extended) |
| Theme | [Wowchemy](https://wowchemy.com/) v5 (via Hugo Modules) |
| Markup | Goldmark (with `unsafe: true` for inline HTML, Mermaid diagrams) |
| Styling | Shared palette (`assets/css/orbital-palette.css`), homepage CSS (`orbital.css`), content-page layer (`orbital-subpages.css`), existing component SCSS (`assets/scss/custom.scss`) |
| Deployment | [Netlify](https://www.netlify.com/) with auto-deploy on push |
| CMS | Netlify CMS (optional) |
| Analytics | Google Analytics (`UA-119157933-1`) |
| Comments | Disqus |

## Directory Structure

```
.
├── config/_default/          # Hugo configuration
│   ├── config.yaml           # Site title, baseURL, modules, markup settings
│   ├── params.yaml           # Theme, contact info, features, analytics
│   ├── menus.yaml            # Navigation menu (12 items)
│   └── languages.yaml        # Language / i18n settings
│
├── content/                  # All site content (Markdown + YAML front matter)
│   ├── home/                 # Homepage widget sections (~14 active widgets)
│   ├── authors/              # Author profiles (~43 authors)
│   ├── articles/             # Academic articles (Wowchemy type `publication`)
│   ├── books/                # Books (print + open online books)
│   ├── presentations/        # Conference talks (Wowchemy type `event`)
│   ├── software/             # Python packages (expdpy, geometrics, scspill)
│   ├── webapps/              # Standalone GEE + Streamlit apps (one bundle each)
│   ├── data/                 # Data repositories and portals
│   ├── tutorials/            # Tutorials & blog posts (Wowchemy type `post`)
│   ├── courses/              # Teaching materials
│   ├── projects/             # Retired (only the hidden ds4ds bundle remains)
│   └── slides/               # Presentation slides
│
├── assets/
│   ├── js/mathjax-config.js  # MathJax override (processEscapes: true)
│   ├── media/                # Site images (covers, icons)
│   └── scss/custom.scss      # Custom CSS overrides
│
├── layouts/
│   ├── partials/             # Hugo template overrides
│   │   ├── catalog.html      # Shared search + dropdown list for books/software/data/webapps
│   │   └── page_header.html  # Image-first layout (featured image above title)
│   ├── section/              # Section list templates (articles, presentations, tutorials, books, …)
│   └── shortcodes/           # Custom Hugo shortcodes
│       └── fullwidth-iframe.html
│
├── static/                   # Unprocessed static files
│   ├── uploads/              # CV / resume PDFs
│   └── media/                # Additional media
│
├── data/
│   ├── page_sharer.toml      # Social sharing button config
│   ├── fonts/                # Custom font definitions (empty)
│   └── themes/               # Custom theme definitions (empty)
│
├── netlify.toml              # Netlify build & deploy configuration
├── go.mod / go.sum           # Hugo module dependencies
├── theme.toml                # Theme metadata (min Hugo version: 0.78)
├── update_wowchemy.sh        # Script to update Wowchemy modules
└── view.sh                   # Script to run local dev server
```

## Configuration

### `config/_default/config.yaml`

Core Hugo settings: site title, base URL, module imports, Goldmark renderer, image processing (Lanczos filter, quality 75), taxonomies (tags, categories, publication_types, authors).

### `config/_default/params.yaml`

Site appearance and features:
- **Theme:** `ocean` | **Font:** `Native` | **Font size:** `L`
- **Dark mode toggle:** `show_day_night: true`, `day_night: false`
- **Contact:** Phone, address (Nagoya, Japan), Zoom, Telegram, email
- **Features:** Code highlighting (R), math rendering, Disqus comments
- **Citation style:** APA

### `config/_default/menus.yaml`

Navigation links: AboutMe, ResearchLab, Articles, Books, Courses, Presentations, Software, WebApps, Data, Tutorials, Events, Contact (ES/JA copies in `languages.yaml`). Projects and Students are no longer in the nav.

| Nav item | Where to add files |
|----------|--------------------|
| Articles | `content/articles/` |
| Books | `content/books/` |
| Courses | `content/courses/` |
| Presentations | `content/presentations/` |
| Software | `content/software/` |
| WebApps | `content/webapps/` (standalone apps) plus any tutorial `web_app/` folder (listed automatically) |
| Data | `content/data/` |
| Tutorials | `content/tutorials/` |
| AboutMe / ResearchLab / Contact | homepage sections (`data/orbital.json`, `content/home/`) |
| Events | external (`https://lu.ma/cmg`) |

Every item also needs its Spanish (`content/es/…`) and Japanese (`content/ja/…`) copy. Old URLs (`/post/*`, `/publication/*`, `/event/*`, `/talk/*`, `/projects/`) are redirected in `netlify.toml`, and moved items carry `aliases:`.

## Cinematic landing page

The English, Spanish, and Japanese homepages now use `layouts/index.html`, a
standalone Hugo template with a real Earth-at-night globe. Hugo and Netlify's
existing build remain in place; all academic content keeps its current URLs.
The home template deliberately omits the legacy theme's browser dependencies.

- **Copy and translations:** `data/orbital.json` (EN, ES, JA).
- **Navigation:** `config/_default/menus.yaml` and the localized menus in
  `config/_default/languages.yaml` supply both desktop and mobile navigation.
- **Design:** `assets/css/orbital.css`; only loaded by the landing page.
- **Loading:** the palette, design, and cinema CSS are concatenated, minified, and
  **inlined** in `<head>` (no render-blocking stylesheet request). The four scripts
  (`orbital.js`, `lang-pref.js`, `orbital-gallery.js`, `orbital-cinema.js`) ship as one
  deferred, fingerprinted bundle. The opening sequence completes in about 0.6 s, and
  scroll reveals start just before a section enters the viewport. Content already on
  screen is never hidden. The WebGL globe initializes only after the first frame
  is on screen (creating it at startup intermittently held the first paint for
  ~1.2 s; see `logs/2026-10-06-homepage-performance.md`). Google Analytics is queued at once but loads only after
  the page is idle (production builds only).
- **Shared site theme:** `assets/css/orbital-palette.css` supplies the dark background,
  reading panels, text, blue links, gold accents, and system fonts for both the
  landing page and all Wowchemy content pages. `orbital-subpages.css` applies these
  to archives, profiles, courses, articles, search, filters, and the footer via
  `layouts/partials/custom_head.html`. Each page gets one combined, fingerprinted
  CSS bundle. `data/themes/nightlights.toml` mirrors the colors for Wowchemy's
  build-time styles. Dark mode is server-rendered with `day_night: false` so saved
  legacy preferences cannot produce a different palette on internal pages.
  Standalone teaching apps and slide decks keep their own designs; scientific
  figures and syntax highlighting retain their semantic colors.
- **Globe and navigation:** `assets/js/orbital.js`; native WebGL, no library or CDN.
- **Cinematic layer:** `assets/css/orbital-cinema.css` + `assets/js/orbital-cinema.js`
  (homepage only, ~4 KB gzipped, no library). Depth starfield with meteors, cursor
  spotlight and nebula; opening title sequence; two camera-facing Sentinel-2
  spacecraft on slow orbital paths; 3D orbital rings that pass behind and in front
  of the globe; network arcs from Nagoya to the lab's home regions
  (drawn through `earth.onGlobeDraw`, the projection hook in `orbital.js`); scroll
  reveals, 3D tilt-and-glare cards, magnetic buttons, pillar ticker, coverflow
  gallery, scroll-progress line, and a photorealistic East Asia night-horizon
  footer. Reduced motion, touch screens, older motion-path implementations, print,
  and a missing script all fall back to the still page.
- **Headline:** `title` / `titleAccent` in `data/orbital.json` may carry markup:
  `<span class="kicker">` (small lead-in) and `<em>` (highlighted keywords —
  *Local Development* and *outer space*). Page titles use the plain text.
- **Cards, student directory, presentations:** `layouts/partials/orbital-*.html`.
- **Imagery and attribution:** `static/media/orbital/CREDITS.txt`. The real NASA
  Black Marble 2016 map has desktop (3600×1800) and mobile (1800×900) variants in
  `assets/media/orbital/`. Hugo serves them as same-size WebP (q88, about half the
  JPEG bytes), requested after the hero is in place (never preloaded: a preload
  competed with the hero image), and decoded before the WebGL upload. Hugo generates a 53 KiB
  WebP static fallback from `assets/media/orbital/earth-at-night-asia.png`. The
  Sentinel-2 spacecraft and footer horizon are generated decorative imagery under
  `assets/media/orbital/`; Hugo serves optimized responsive WebP derivatives.
- **Featured research:** three satellite-data papers selected by bundle slug in
  `layouts/index.html`. The Software block (former Projects, anchor `#projects`)
  and tutorials sort by last edit;
  presentations sort by date. Set `date_tba: true` for an unknown event date.
- **Students:** the directory uses the localized `content/home/people.md` group
  configuration and existing author profiles; every matching student has a visible
  photo card, name, and role, without an expandable directory.
- **Photo carousel:** `layouts/partials/orbital-gallery.html` and
  `assets/js/orbital-gallery.js` reuse all photos in `content/home/gallery/gallery/`.
  Native scrolling, swipe, arrow buttons, and keyboard navigation are supported.
  Photos advance on request; no automatic slide changes. All locales share the
  same optimized images, with full frames preserved.
- **Accessibility:** keyboard rotation, region selection, pause and zoom controls,
  system reduced-motion support, ordinary mobile scrolling, and a static fallback
  when JavaScript, WebGL, or the texture is unavailable. Rendering sleeps when
  offscreen or in a background tab. Language preference cookies are preserved.

Run `node --test tests/orbital.test.cjs` for globe lifecycle and overlay-hook checks. Build with
`"$HOME/Library/Application Support/Hugo/0.111.3/hugo" --minify --buildFuture`.
The legacy theme still emits its existing `.Path` deprecation warning.

## Legacy Homepage Widgets

These widget files are retained for reference, their student-group configuration,
and their photo collection. The new `layouts/index.html` controls homepage layout and copy;
changing a widget's weight or hero text no longer changes the landing page:


| Widget | File | Weight | Type |
|--------|------|--------|------|
| Slider | `slider.md` | 1 | slider |
| Hero banner | `hero2.md` | 2 | blank (Canva embed) |
| About | `about.md` | 10 | about |
| Research Lab | `researchLab.md` | 15 | blank (YouTube + GEE maps) |
| Featured Publications | `featured.md` | 20 | featured |
| Presentations | `talks.md` | 30 | pages |
| Projects (now Software) | `projects.md` | 35 | portfolio |
| Gallery | `gallery/` | 66 | blank |
| Events | `eventsOnline.md` | 75 | blank (lu.ma calendar) |
| Posts & Tutorials | `posts.md` | 80 | pages |
| Tag Cloud | `tags.md` | 120 | tag_cloud |
| Contact | `contact.md` | 130 | contact |

Inactive widgets: `hero.md`, `skills.md`, `experience.md`, `accomplishments.md`, `demo.md`.

## Custom Components

### Template Override: `page_header.html`

**File:** `layouts/partials/page_header.html`

Overrides the Wowchemy theme default to render the featured image **above** the title, metadata, and link buttons (image-first layout). The theme default shows the title first. Data science posts use `image.placement: 3` in front matter for full-width rendering (2560x2560 Fit). Colab links go in the `links:` front matter section, not as badges in the post body.

### Shortcode: `fullwidth-iframe`

**File:** `layouts/shortcodes/fullwidth-iframe.html`

Renders an iframe that breaks out of the content container to span the full viewport width. Uses responsive height (`min(height, 70vh)`) for mobile.

**Usage:**
```
{{</* fullwidth-iframe src="https://example.com/app" height="800px" */>}}
```

### Shortcode: `fwl-lab`

**Files:** `layouts/shortcodes/fwl-lab.html` + `assets/js/fwl-lab.js` + `assets/css/fwl-lab.css`

Interactive Frisch-Waugh-Lovell lab embedded in the `python_fwl` tutorial: controls that recompute and redraw the partialled-out regression live. The shortcode loads its own JS (bundled with `js.Build`) and CSS through Hugo Pipes with `fingerprint`, once per page; dark mode comes from CSS variables under `.dark`. It is the reference implementation of the interactive-widget pattern in `.claude/docs/learning-components.md`.

**Usage:**
```
{{</* fwl-lab */>}}
```

### Custom CSS: `assets/scss/custom.scss`

Main sections:
1. **Homepage fix** -- Full-width container for Hero2 widget
2. **Full-width iframe breakout** -- Viewport-width breakout class + overflow resets for all ancestor containers
3. **Dashboards gallery** -- `.dashboard-gallery`/`.dashboard-card` card grid of the retired dashboards page, now unused because the apps moved to `/webapps/` (3/2/1-column responsive + dark mode; the legacy `.dashboard-entry` collapsible styling is retained but unused)
4. **Notebook-style post styling** -- Teal-accented code blocks, figure borders, table styling, blockquotes, blue headings, learning objectives lists, mobile adjustments
5. **Python syntax highlighting** -- Site-consistent colors for highlight.js tokens
6. **Left-side Table of Contents** -- Sticky sidebar TOC activated by `toc: true` in front matter
7. **Learning components (§24)** -- `.learn-card` predict / solution / misconception / proof cards for tutorials (pure HTML `<details>`, colored left accents in light and dark mode, keyboard focus ring); companion to the §20 Key-concepts toggle cards. See `.claude/docs/learning-components.md`

### Post Resource Buttons (AI Podcast, Slides)

Posts can expose extra learning resources as front-matter `links:` buttons. Two conventions are documented in full in `CLAUDE.md`:

- **AI Podcast** -- a self-contained inline audio-player overlay appended to the post's `index.md` (front-matter `icon: podcast` link to `#podcast-player`), or, for an episode hosted on Spotify, a `spotify` link button plus a Spotify embed above the Abstract. See CLAUDE.md -> *AI Podcast Player* and `.claude/docs/ai-podcast-player.md`.
- **Slides (PDF)** -- a `file-pdf` link button to a `slides.pdf` shipped in the post bundle, using an **absolute** URL so the theme opens it in a new tab. See CLAUDE.md -> *Slides (PDF) link button*.
- **Slides (HTML)** -- a `person-chalkboard` link button to a Quarto-rendered reveal.js deck at `content/tutorials/<slug>/slides/` (with menu, chalkboard, and speaker view), using a **relative** `url: slides/index.html`. Generated by the `write-slides` skill. See CLAUDE.md -> *Slides (HTML) link button*.

## Content Conventions

### Articles (`content/articles/`, type `publication`)

- **Folder naming:** `YYYYMMDD-abbreviation` (e.g., `20241219-AE`)
- **Front matter:** title, authors, date, DOI, publication_types (0-8), publication name, abstract, tags, links
- **Publication types:** 0=Uncategorized, 1=Conference paper, 2=Journal article, 3=Preprint, 4=Report, 5=Book, 6=Book section, 7=Thesis, 8=Patent

### Presentations (`content/presentations/`, type `event`)

- **Folder naming:** `YYYYMMDD-abbreviation` (e.g., `20241113GDSL`)
- **Front matter:** title, date, event name, location, abstract, links

### Tutorials (`content/tutorials/`, type `post`)

- **Folder naming:** `YYYYMMDD-slug` for posts, descriptive slug for tutorials (e.g., `gee_ntl_viirs_like`)
- **Categories:** `Tutorial` for tutorial content, `Post`/`Demo` for blog posts
- **Tags:** world, regional, spatial, causal, python, gee, r, stata (tutorials); Academic, Seminar, etc. (posts)

### Books, Software, Data, WebApps

Each is a section of page bundles listed by `layouts/section/<section>.html` through the shared `layouts/partials/catalog.html` (search box + dropdowns defined by `filters:` in the section `_index.md`, plus an optional `year_filter`).

- **Books** (`content/books/`) — `book_format: print|online`; the former type-5 publications keep `type: publication` + `publication_types`.
- **Software** (`content/software/`) — one bundle per package; the homepage Software block shows the three most recently committed packages.
- **Data** (`content/data/`) — `data_type: repository|portal`, `region`.
- **WebApps** (`content/webapps/`) — one bundle per standalone Google Earth Engine or Streamlit app, with `app_url`, `platform: gee|streamlit`, `region`, `topic` (an id from `data/tutorial_topics.yaml`), `links:` and `_build: {render: never, list: always}`, so the card opens the app directly. `featured.jpg` comes from `node scripts/capture-dashboard-screenshots.cjs --slug <slug>` (add the slug to its `APPS` array first). Every tutorial that ships `web_app/index.html` is listed automatically. Full workflow: `.claude/docs/webapps.md`.

### Authors (`content/authors/`)

Each author has a folder with `_index.md` containing name, role, organization, bio, social links, and `avatar.jpg`.

## Internationalization (i18n)

The site is **trilingual**: English at `/` (`content/`), Spanish at `/es/` (`content/es/`), and Japanese at `/ja/` (`content/ja/`). Each language has its own content tree, isolated by Hugo module mounts in `config/_default/config.yaml` (the English mount uses `excludeFiles: '{es,ja}/**'`); languages and menus live in `config/_default/languages.yaml`.

Homepage widgets query the **current language's** pages with **no English fallback** — an item that lacks a `content/es/<section>/<slug>/` or `content/ja/<section>/<slug>/` counterpart simply will not appear on the `/es/` or `/ja/` homepage. As of 2026-06-05, **every page type is translated except the long bodies of tutorial posts**. Articles, presentations, books, software, data, web apps, author profiles, the Courses page (with localized `/es/courses/` and `/ja/courses/` menu items), the Alumni page, the Slides demo, and the draft Privacy/Terms pages are **full translations**; tutorial posts are lightweight **stub cards** whose card links back to the English tutorial (the long body stays in English by design). `scripts/i18n-parity.sh` tracks all of it — per-section bundles **plus** the singleton pages (courses/alumni/privacy/terms) — and currently reports **0 gaps** for both languages.

To keep this sustainable, whenever you add content of those types you must create its ES + JA counterparts in the same change:

```bash
# Translate one item (or backfill every gap) into Spanish + Japanese
/project:translate-content <slug> --lang all
/project:translate-content --all-missing --lang all

# Report any English content lacking an ES/JA counterpart (exit non-zero on gaps)
bash scripts/i18n-parity.sh
```

The `translate-content` skill applies the glossary at `.claude/skills/translate-content/references/glossary.md` (formal Latin American Spanish `usted`; Japanese です・ます; number localization; a do-not-translate list for query keys/URLs/DOIs). See the **Internationalization (i18n)** section of `CLAUDE.md` for the full architecture, conventions, and how to add a fourth language.

## Local Development

**Prerequisites:** Go (1.15+), Git

A local Hugo Extended binary is available at:

```bash
~/Library/Application Support/Hugo/0.111.3/hugo
```

> **Note:** Older binaries (v0.84.2, v0.89.4) also sit under that directory — **do not use them.** The site requires Hugo **≥ 0.96** (the `continue` keyword in `layouts/section/presentations.html`), and both fail with `function "continue" not defined` before rendering any content. Use a 0.96–0.119 **extended** binary; 0.111.3 is installed and matches the `netlify.toml` pin. The theme minimum is 0.78.

```bash
# Run the dev server
"$HOME/Library/Application Support/Hugo/0.111.3/hugo" server --disableFastRender

# Or use the convenience script (requires hugo in PATH)
./view.sh
```

The site will be available at `http://localhost:1313/`.

## Deployment

The site auto-deploys to Netlify on every push to the `master` branch.

**Build configuration** (`netlify.toml`):
- **Command:** `hugo --gc --minify -b $URL`
- **Hugo version:** 0.111.3 (set via `HUGO_VERSION` env var)
- **Deploy previews:** Enabled with `--buildFuture` flag
- **Cache:** `netlify-plugin-hugo-cache-resources` enabled

## Updating the Theme

```bash
./update_wowchemy.sh
```

This script:
1. Runs `hugo mod get -u ./...` to update Wowchemy modules
2. Fetches the recommended Hugo version from the Wowchemy repo
3. Updates `HUGO_VERSION` in `netlify.toml` to match

## Adding Content

> **Translate it too.** Any new article, presentation, book, software package, data resource, web app, author, course, or other page (everything except tutorial-post bodies) MUST also be translated into Spanish and Japanese in the same change, or it will not appear on `/es/` or `/ja/`. Run `/project:translate-content <slug> --lang all` and confirm `bash scripts/i18n-parity.sh` reports 0 gaps. See [Internationalization (i18n)](#internationalization-i18n).

### New Article

```bash
hugo new content/articles/YYYYMMDD-abbreviation/index.md
```

Add `featured.jpg` to the folder. Fill in front matter fields (see existing articles for examples).

### New Presentation

```bash
hugo new content/presentations/YYYYMMDD-abbreviation/index.md
```

### New Tutorial

```bash
hugo new content/tutorials/slug-name/index.md
```

Add `categories: [Tutorial]` to the front matter to categorize it as a tutorial.

### New Book, Software Package, or Data Resource

```bash
hugo new content/books/slug/index.md      # or content/software/… or content/data/…
```

Copy the front matter of an existing bundle in the same section (filter params such as `book_format`, `data_type` and `region` drive the dropdowns) and add a `featured.*` image.

### New Web App

Create `content/webapps/<slug>/index.md` (plus its ES/JA counterparts), add the slug to `APPS` in `scripts/capture-dashboard-screenshots.cjs`, and run `node scripts/capture-dashboard-screenshots.cjs --slug <slug>`. Trigger for Claude: "Add web app: `<App URL>` — `<English title>`". See `.claude/docs/webapps.md`.

### Skill Architecture

Sixteen Claude Code skills: twelve organized as Write/Review pairs across six artifact stages (the slide deck gained its `review-slides` partner), plus four standalone companion skills (`write-quarto-notebook` for R/Python/Stata with a lighter chunk-time install pattern, `write-quarto-notebook-python` for Python-only with a friction-free hermetic-venv bundle pattern, `translate-content` — the trilingual ES/JA translator, see [Internationalization (i18n)](#internationalization-i18n) — and `update-author-profile` for tri-lingual author-profile edits/creation). Each skill excels at one thing. Skills are independent (can be invoked standalone) but compose naturally into a pipeline: script -> results report -> blog post -> infographic -> web app. All skills follow a three-phase interaction pattern: (1) confirm scope, (2) execute, (3) offer follow-ups. Skills use **progressive disclosure** via `references/` subdirectories. Legacy skills are preserved at `.claude/skills/legacy/`.

| Stage | Write skill | Review skill |
|-------|-------------|--------------|
| Script | `write-script` | `review-script` |
| Results report | `write-results-report` | `review-results-report` |
| Blog post | `write-post` | `review-post` |
| Infographic | `write-infographic` | `review-infographic` |
| Interactive web app (static HTML/CSS/JS, D3) | `write-app` | `review-app` |
| Quarto notebook (R/Python/Stata, lighter) | `write-quarto-notebook` | — |
| Quarto notebook (Python, friction-free bundle) | `write-quarto-notebook-python` | — |
| Slide deck (Quarto reveal.js) | `write-slides` | `review-slides` |

### Write Data Science Script

**Skill:** `/project:write-script <topic> dataset: <dataset> [references: <URLs>] [language: python|stata|r] [theme: light|dark]`
**Location:** `.claude/skills/write-script/SKILL.md`

Write and execute a data science script (Python/Stata/R). Produces script.py, execution_log.txt, and PNG figures.

### Review Data Science Script

**Skill:** `/project:review-script <post slug>`
**Location:** `.claude/skills/review-script/SKILL.md`

Expert review of a script across 8 dimensions. Runs the code, checks output, produces a scored report. Read-only.

### Write Results Report

**Skill:** `/project:write-results-report <post slug>`
**Location:** `.claude/skills/write-results-report/SKILL.md`

Execute a script and produce `results_report.md` with structured interpretations. Bridges raw code output and the blog post.

### Review Results Report

**Skill:** `/project:review-results-report <post slug>`
**Location:** `.claude/skills/review-results-report/SKILL.md`

Verify results report accuracy against script output, check interpretation quality. Read-only.

### Write Data Science Post

**Skill:** `/project:write-post <topic> dataset: <dataset> [references: <URLs>]` OR `/project:write-post <post slug>`
**Location:** `.claude/skills/write-post/SKILL.md`

Write a notebook-style blog post (`index.md`). Two modes: (A) consume existing script + results report, or (B) standalone with `[VERIFY]` markers. Opens every post with a journal-style `## Abstract` section (one ~150-250 word, six-beat paragraph before Overview), and enforces the sandwich pattern, 8+ interpretations, and LaTeX escaping.

### Review Data Science Post

**Skill:** `/project:review-post <post slug> [focus: code | structure | math | explanations | interpretations | writing | grammar | rigor | images | abstract]`
**Location:** `.claude/skills/review-post/SKILL.md`

Comprehensive review across 13 dimensions (merges deep expert review with proofreading; the 13th checks the journal-style `## Abstract` section and cross-checks its numbers against the post body). Produces a scored report with verdict. Read-only.

### Write Infographic Instructions

**Skill:** `/project:write-infographic <post slug>`
**Location:** `.claude/skills/write-infographic/SKILL.md`

Generate a chalkboard-style infographic prompt with 4 sections (full prompt, negative prompt, condensed prompt, panel reference data).

### Review Infographic Instructions

**Skill:** `/project:review-infographic <post slug>`
**Location:** `.claude/skills/review-infographic/SKILL.md`

Cross-check infographic accuracy against source post, evaluate quality, suggest variant improvements. Read-only.

### Write Quarto Notebook (executable companion)

**Skill:** `/project:write-quarto-notebook <post slug> [--no-render] [--no-link]`
**Location:** `.claude/skills/write-quarto-notebook/SKILL.md`

Generate a self-contained Quarto notebook (`tutorial.qmd`) from an existing R / Python / Stata post + companion script so readers can render the tutorial locally in Positron or RStudio. Pins exact package versions probed from the developer's machine for reproducibility (R: `pak::pkg_install("pkg@x.y.z")`, Python: `pip install pkg==version` inside the kernel chunk, Stata: not supported by SSC). Renders locally to verify, retries up to 3× with an auto-fix catalog. Adds a "Quarto project (.zip)" link button to the post's front matter on success.

Output paths follow language convention: R → `tutorial.qmd` next to `index.md`; Python and Stata → `references/tutorial.qmd`.

### Write Quarto Notebook (Python, friction-free bundle)

**Skill:** `/project:write-quarto-notebook-python <post slug> [--no-render] [--no-link]`
**Location:** `.claude/skills/write-quarto-notebook-python/SKILL.md`

Parallel to `write-quarto-notebook` but Python-only and bundle-rich. Ships a hermetic `.venv` bootstrap (`setup_env.py` with preflight + auto-relaunch on unfit Python + kernel registration), responsive-figure CSS in `tutorial.qmd`, one-click `render.command` (macOS) + `render.bat` (Windows) wrappers, a bundle `README.md`, and a `build_bundle.sh` packager. Produces a `<slug>.zip` that a student can extract and double-click to render — no Python-environment debugging.

Probes pinned versions from the dev machine; applies a macOS Intel wheel-availability catalog so that scripts using e.g. `pyfixest` get `numba==0.62.1` + `llvmlite==0.45.0` automatically (the last Intel-wheel releases). Renders end-to-end in a tempdir (extracts the ZIP and runs the wrapper) to verify the bundle works as a student would experience it.

Codified from the 8-iteration `python_pyfixest` validation in May 2026.

### Write Interactive Web App

**Skill:** `/project:write-app <post slug> [--no-link] [--no-verify]`
**Location:** `.claude/skills/write-app/SKILL.md`

Generate a 4-tab interactive web app for an existing post. The signature behaviour is the **interactive interview**: the skill reads the post's `index.md`, results CSVs, and `data/` folder, then uses `AskUserQuestion` to confirm key takeaways, tab structure, data source, and performance caps before writing any file. Output is a static HTML/CSS/JS bundle (D3.js v7 from CDN) at `content/tutorials/<slug>/web_app/` that opens from a YAML `Web app` button in a new tab. Runs entirely client-side — no backend, no build step. Validated against `content/tutorials/r_double_lasso/web_app/` (the reference implementation).

The widget catalog ships 10 archetypes — 4 READY (concept-animation, penalty-slider, forest-plot, dgp-simulator) and 6 STUB (DiD event-study, feature-importance, Moran's I scatter, train/test split, sensitivity heatmap, Bayesian posterior). The skill picks 3–4 per post based on topic detection (causal-inference / ml / spatial / panel / bayesian / time-series / mixed) and confirms in the interview.

Verification: Hugo dev server + Node `vm.runInThisContext` smoke test on `dgp.js` + `lasso.js` with 7 sanity assertions (qnorm precision, λ_max bound, OLS recovery, performance < 300 ms, results.json schema).

### Review Interactive Web App

**Skill:** `/project:review-app <post slug> [focus: pedagogy | code | accessibility | data | hugo | visual] [--no-browser]`
**Location:** `.claude/skills/review-app/SKILL.md`

Comprehensive audit of a generated web app across 10 non-overlapping dimensions: file completeness, HTML structure, JS correctness, data contract, accessibility, performance, pedagogy, Hugo integration, visual design, and mobile responsiveness. Reuses `write-app`'s `smoke-test.js` under Node `vm`, starts a Hugo dev server for HTTP-200 checks, then drives a headless Chromium via Playwright across all four tabs at desktop (1280×800) and mobile (375×667) viewports. Includes a post↔app **pedagogical alignment** check (n-gram overlap between the post's top 3 takeaways and the app's Tab-1 lede + tab headings). Read-only.

Produces a verdict (ACCEPT / MINOR REVISION / MAJOR REVISION) plus a 1–10 score per dimension and an issues table written to `content/tutorials/<slug>/web_app/REVIEW.md`. Verdict-changing rules cover: missing required files, smoke-test failure, the Hugo trailing-slash YAML bug, 0/3 takeaway alignment, and all-STUB tab sets. First-run Playwright bootstrap auto-downloads Chromium (~200 MB, ~2 min); subsequent runs reuse the cache.

Focus modes for targeted re-reviews: `pedagogy`, `code` (Dim 3+4), `accessibility`, `data`, `hugo`, `visual` (Dim 9+10). Combine with `and`/`,`. `--no-browser` skips the Playwright pass (Dims 9+10 become "not audited").

### Write Slide Deck (Quarto reveal.js)

**Skill:** `/project:write-slides <post slug> [--no-link] [--no-verify]`
**Location:** `.claude/skills/write-slides/SKILL.md`

Generate a Quarto reveal.js slide deck from an existing post. The signature behaviour is an interview that ports Scott Cunningham's "Rhetoric of Decks": audience triage (teaching / seminar / conference / working-external with an ethos·pathos·logos balance), a 3-act Tension→Investigation→Resolution arc, assertion titles ("Treatment raised K/L by 18%", not "Results"), one-idea-per-slide, the Narrative→Application→Picture→Codeblock→Technical pedagogical movement, an MB/MC pacing pass, and a Devil's-Advocate slide — with an **outline checkpoint** the user approves before any slide is written. The skill writes a `slides.qmd` (`format: revealjs`) + a branded SCSS theme + a title-slide partial (a key-result number strip) and runs `quarto render` → `content/tutorials/<slug>/slides/` (`index.html` + `slides_files/`). Built-in menu / chalkboard / speaker view / preview-links / overview; reveal.js bundled locally (MathJax math from a CDN); branded to the fixed site palette; opened from a "Slides (HTML)" button. Reuses the post's figures in place. English-only (rides with the English post like `web_app/`). Verification: `quarto render` + Hugo ≥0.96 HTTP-200 checks + a Node static smoke test. Needs the Quarto CLI to (re)generate. Paired with `review-slides`.

### Review Slide Deck (Quarto reveal.js)

**Skill:** `/project:review-slides <post slug> [focus: readability | correctness | fidelity | design | render] [--no-browser]`
**Location:** `.claude/skills/review-slides/SKILL.md`

Read-only audit of a generated deck across 10 non-overlapping dimensions: source fidelity, conceptual correctness, technical & render correctness, title↔body consistency, readability & simplicity, typos & grammar, write-slides design adherence, branding integrity, accessibility & legibility, and deliverable completeness. Cross-checks every slide number/figure/table/equation/code snippet against the source post (`index.md` + `results_report.md`) as ground truth — it never re-executes code. Reuses `write-slides`'s `smoke-test.js` for static structure, diffs `site-brand.scss`/`title-slide.html` against the canonical templates to catch theme drift, then drives a headless browser (`slide-audit.cjs`, an extension of `math-check.cjs`) across every slide to flag un-typeset LaTeX, content overflow, and over-dense slides. **Readability is the primary emphasis**: each slide is scanned for long sentences, >5 bullets, complex words, passive voice, and undefined jargon, and every finding ships a concrete simpler rewrite.

Produces a verdict (ACCEPT / MINOR REVISION / MAJOR REVISION) plus a 1–10 score per dimension and an issues table written to `content/tutorials/<slug>/slides/SLIDES_REVIEW.md`. Verdict-changing rules cover: a slide number that contradicts the source post, raw LaTeX on any slide, smoke-test failure, branding-file tampering, and the trailing-slash deck-link bug. Strictly read-only — it offers fixes only as a follow-up (delegated to `write-slides`) and writes nothing but the review file. Focus modes: `fidelity` (Dim 1), `correctness` (2+3), `readability` (5+6), `consistency` (4), `design` (7), `branding` (8), `accessibility` (9), `render` (3+10). `--no-browser` skips the Playwright pass.

### Update Author Profile

**Skill:** `/project:update-author-profile <author name-or-slug> [pasted YAML or freeform notes] [--create] [--no-build]`
**Location:** `.claude/skills/update-author-profile/SKILL.md`

Update an existing author profile under `content/authors/<Folder>/_index.md` (or scaffold a new one) from **pasted YAML or freeform notes**, keeping the Spanish (`content/es/authors/`) and Japanese (`content/ja/authors/`) counterparts in sync in the same run — `social` links/`email`/URLs copied **verbatim**, prose (`bio`, `role`, `interests`, `education`, `organizations.name`) translated via the project glossary (ES formal `usted`; JA です・ます). Fixes YAML programming typos (curly quotes, wrong icon packs, malformed URLs) so the build never breaks, preserves indentation and key order byte-for-byte, infers the target author from the name and confirms before editing (handling `_Master` / duplicate-name edge cases), then verifies with a full Hugo 0.111.3 build + `scripts/i18n-parity.sh --section authors`. Leaves changes in the working tree for review; never commits. The **edit/create counterpart** to `translate-content`, it **reuses** that skill's `references/field-rules.md` (§authors) + `references/glossary.md` instead of forking them.

### Full Pipeline Example

```
/project:write-script double machine learning dataset: DS4Bolivia
/project:review-script python_doubleml
/project:write-results-report python_doubleml
/project:review-results-report python_doubleml
/project:write-post python_doubleml
/project:review-post python_doubleml
/project:write-infographic python_doubleml
/project:review-infographic python_doubleml
/project:write-app python_doubleml
/project:review-app python_doubleml
```

### New Author

Create `content/authors/firstname-lastname/_index.md` with profile front matter and add `avatar.jpg`. To update an existing profile (or scaffold a new one) with the Spanish/Japanese counterparts kept in sync automatically, use the `update-author-profile` skill described above.
