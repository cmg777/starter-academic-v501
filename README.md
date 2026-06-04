# carlos-mendez.org

Academic portfolio website for **Carlos Mendez**, Associate Professor of Development Economics at Nagoya University (GSID), Japan.

**Live site:** <https://carlos-mendez.org/>

## Tech Stack

| Component | Version / Detail |
|-----------|-----------------|
| Static site generator | [Hugo](https://gohugo.io/) 0.111.3 (extended) |
| Theme | [Wowchemy](https://wowchemy.com/) v5 (via Hugo Modules) |
| Markup | Goldmark (with `unsafe: true` for inline HTML, Mermaid diagrams) |
| Styling | SCSS (`assets/scss/custom.scss`) |
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
│   ├── menus.yaml            # Navigation menu (10 items)
│   └── languages.yaml        # Language / i18n settings
│
├── content/                  # All site content (Markdown + YAML front matter)
│   ├── home/                 # Homepage widget sections (~14 active widgets)
│   ├── authors/              # Author profiles (~43 authors)
│   ├── publication/          # Academic publications (~41 entries)
│   ├── event/                # Conference talks & presentations (~30 entries)
│   ├── projects/             # Research projects & dashboards (~5 entries)
│   ├── courses/              # Teaching materials
│   ├── post/                 # Blog posts & tutorials (~30 entries)
│   └── slides/               # Presentation slides
│
├── assets/
│   ├── js/mathjax-config.js  # MathJax override (processEscapes: true)
│   ├── media/                # Site images (covers, icons)
│   └── scss/custom.scss      # Custom CSS overrides
│
├── layouts/
│   ├── partials/             # Hugo template overrides
│   │   └── page_header.html  # Image-first layout (featured image above title)
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

Navigation links: AboutMe, ResearchLab, Publications, Presentations, Projects, Students, Courses, Events, Posts & Tutorials, Contact.

## Homepage Widgets

The homepage is assembled from individual markdown files in `content/home/`, each with a `weight` controlling display order:

| Widget | File | Weight | Type |
|--------|------|--------|------|
| Slider | `slider.md` | 1 | slider |
| Hero banner | `hero2.md` | 2 | blank (Canva embed) |
| About | `about.md` | 10 | about |
| Research Lab | `researchLab.md` | 15 | blank (YouTube + GEE maps) |
| Featured Publications | `featured.md` | 20 | featured |
| Presentations | `talks.md` | 30 | pages |
| Projects | `projects.md` | 35 | portfolio |
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

### Custom CSS: `assets/scss/custom.scss`

Six sections:
1. **Homepage fix** -- Full-width container for Hero2 widget
2. **Full-width iframe breakout** -- Viewport-width breakout class + overflow resets for all ancestor containers
3. **Collapsible dashboards** -- Styling for `<details>` sections on the dashboards project page
4. **Notebook-style post styling** -- Teal-accented code blocks, figure borders, table styling, blockquotes, blue headings, learning objectives lists, mobile adjustments
5. **Python syntax highlighting** -- Site-consistent colors for highlight.js tokens
6. **Left-side Table of Contents** -- Sticky sidebar TOC activated by `toc: true` in front matter

## Content Conventions

### Publications (`content/publication/`)

- **Folder naming:** `YYYYMMDD-abbreviation` (e.g., `20241219-AE`)
- **Front matter:** title, authors, date, DOI, publication_types (0-8), publication name, abstract, tags, links
- **Publication types:** 0=Uncategorized, 1=Conference paper, 2=Journal article, 3=Preprint, 4=Report, 5=Book, 6=Book section, 7=Thesis, 8=Patent

### Events (`content/event/`)

- **Folder naming:** `YYYYMMDD-abbreviation` (e.g., `20241113GDSL`)
- **Front matter:** title, date, event name, location, abstract, links

### Posts & Tutorials (`content/post/`)

- **Folder naming:** `YYYYMMDD-slug` for posts, descriptive slug for tutorials (e.g., `gee_ntl_viirs_like`)
- **Categories:** `Tutorial` for tutorial content, `Post`/`Demo` for blog posts
- **Tags:** world, regional, spatial, causal, python, gee, r, stata (tutorials); Academic, Seminar, etc. (posts)

### Dashboards (`content/projects/dashboards/`)

Uses collapsible `<details>` sections with the `fullwidth-iframe` shortcode:

```html
<details class="dashboard-entry">
<summary>Author (Year). <em>Title.</em> App. <a href="...">Access App</a></summary>

{{</* fullwidth-iframe src="https://..." height="800px" */>}}

</details>
```

### Authors (`content/authors/`)

Each author has a folder with `_index.md` containing name, role, organization, bio, social links, and `avatar.jpg`.

## Internationalization (i18n)

The site is **trilingual**: English at `/` (`content/`), Spanish at `/es/` (`content/es/`), and Japanese at `/ja/` (`content/ja/`). Each language has its own content tree, isolated by Hugo module mounts in `config/_default/config.yaml` (the English mount uses `excludeFiles: '{es,ja}/**'`); languages and menus live in `config/_default/languages.yaml`.

Homepage widgets query the **current language's** pages with **no English fallback** — an item that lacks a `content/es/<section>/<slug>/` or `content/ja/<section>/<slug>/` counterpart simply will not appear on the `/es/` or `/ja/` homepage. As of 2026-06-05, **every page type is translated except the long bodies of tutorial posts**. Publications, events, projects, author profiles, the Courses page (with localized `/es/courses/` and `/ja/courses/` menu items), the Alumni page, the Slides demo, and the draft Privacy/Terms pages are **full translations**; tutorial posts are lightweight **stub cards** whose card links back to the English tutorial (the long body stays in English by design). `scripts/i18n-parity.sh` tracks all of it — per-section bundles **plus** the singleton pages (courses/alumni/privacy/terms) — and currently reports **0 gaps** for both languages.

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
~/Library/Application Support/Hugo/0.84.2/hugo
```

> **Note:** This on-disk binary is v0.84.2, but the site now requires Hugo **≥ 0.96** (the `continue` keyword in `layouts/section/event.html`), so 0.84.2 no longer builds it. Use a 0.96–0.119 **extended** binary for local previews; the project verifies builds with **0.111.3** (the version pinned in `netlify.toml`). The theme minimum is 0.78.

```bash
# Run the dev server
"$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender

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

> **Translate it too.** Any new publication, event, project, author, course, or other page (everything except tutorial-post bodies) MUST also be translated into Spanish and Japanese in the same change, or it will not appear on `/es/` or `/ja/`. Run `/project:translate-content <slug> --lang all` and confirm `bash scripts/i18n-parity.sh` reports 0 gaps. See [Internationalization (i18n)](#internationalization-i18n).

### New Publication

```bash
hugo new content/publication/YYYYMMDD-abbreviation/index.md
```

Add `featured.jpg` to the folder. Fill in front matter fields (see existing publications for examples).

### New Event

```bash
hugo new content/event/YYYYMMDD-abbreviation/index.md
```

### New Tutorial

```bash
hugo new content/post/slug-name/index.md
```

Add `categories: [Tutorial]` to the front matter to categorize it as a tutorial.

### New Dashboard

Add a new `<details>` block to `content/projects/dashboards/index.md` following the pattern documented above.

### Skill Architecture

Thirteen Claude Code skills: ten organized as Write/Review pairs across five artifact stages, plus three standalone companion skills (`write-quarto-notebook` for R/Python/Stata with a lighter chunk-time install pattern, `write-quarto-notebook-python` for Python-only with a friction-free hermetic-venv bundle pattern, and `translate-content` — the trilingual ES/JA translator, see [Internationalization (i18n)](#internationalization-i18n)). Each skill excels at one thing. Skills are independent (can be invoked standalone) but compose naturally into a pipeline: script -> results report -> blog post -> infographic -> web app. All skills follow a three-phase interaction pattern: (1) confirm scope, (2) execute, (3) offer follow-ups. Skills use **progressive disclosure** via `references/` subdirectories. Legacy skills are preserved at `.claude/skills/legacy/`.

| Stage | Write skill | Review skill |
|-------|-------------|--------------|
| Script | `write-script` | `review-script` |
| Results report | `write-results-report` | `review-results-report` |
| Blog post | `write-post` | `review-post` |
| Infographic | `write-infographic` | `review-infographic` |
| Interactive web app (static HTML/CSS/JS, D3) | `write-app` | `review-app` |
| Quarto notebook (R/Python/Stata, lighter) | `write-quarto-notebook` | — |
| Quarto notebook (Python, friction-free bundle) | `write-quarto-notebook-python` | — |

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

Write a notebook-style blog post (`index.md`). Two modes: (A) consume existing script + results report, or (B) standalone with `[VERIFY]` markers. Enforces sandwich pattern, 8+ interpretations, LaTeX escaping.

### Review Data Science Post

**Skill:** `/project:review-post <post slug> [focus: code | structure | math | explanations | interpretations | writing | grammar | rigor | images]`
**Location:** `.claude/skills/review-post/SKILL.md`

Comprehensive review across 12 dimensions (merges deep expert review with proofreading). Produces a scored report with verdict. Read-only.

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

Generate a 4-tab interactive web app for an existing post. The signature behaviour is the **interactive interview**: the skill reads the post's `index.md`, results CSVs, and `data/` folder, then uses `AskUserQuestion` to confirm key takeaways, tab structure, data source, and performance caps before writing any file. Output is a static HTML/CSS/JS bundle (D3.js v7 from CDN) at `content/post/<slug>/web_app/` that opens from a YAML `Web app` button in a new tab. Runs entirely client-side — no backend, no build step. Validated against `content/post/r_double_lasso/web_app/` (the reference implementation).

The widget catalog ships 10 archetypes — 4 READY (concept-animation, penalty-slider, forest-plot, dgp-simulator) and 6 STUB (DiD event-study, feature-importance, Moran's I scatter, train/test split, sensitivity heatmap, Bayesian posterior). The skill picks 3–4 per post based on topic detection (causal-inference / ml / spatial / panel / bayesian / time-series / mixed) and confirms in the interview.

Verification: Hugo dev server + Node `vm.runInThisContext` smoke test on `dgp.js` + `lasso.js` with 7 sanity assertions (qnorm precision, λ_max bound, OLS recovery, performance < 300 ms, results.json schema).

### Review Interactive Web App

**Skill:** `/project:review-app <post slug> [focus: pedagogy | code | accessibility | data | hugo | visual] [--no-browser]`
**Location:** `.claude/skills/review-app/SKILL.md`

Comprehensive audit of a generated web app across 10 non-overlapping dimensions: file completeness, HTML structure, JS correctness, data contract, accessibility, performance, pedagogy, Hugo integration, visual design, and mobile responsiveness. Reuses `write-app`'s `smoke-test.js` under Node `vm`, starts a Hugo dev server for HTTP-200 checks, then drives a headless Chromium via Playwright across all four tabs at desktop (1280×800) and mobile (375×667) viewports. Includes a post↔app **pedagogical alignment** check (n-gram overlap between the post's top 3 takeaways and the app's Tab-1 lede + tab headings). Read-only.

Produces a verdict (ACCEPT / MINOR REVISION / MAJOR REVISION) plus a 1–10 score per dimension and an issues table written to `content/post/<slug>/web_app/REVIEW.md`. Verdict-changing rules cover: missing required files, smoke-test failure, the Hugo trailing-slash YAML bug, 0/3 takeaway alignment, and all-STUB tab sets. First-run Playwright bootstrap auto-downloads Chromium (~200 MB, ~2 min); subsequent runs reuse the cache.

Focus modes for targeted re-reviews: `pedagogy`, `code` (Dim 3+4), `accessibility`, `data`, `hugo`, `visual` (Dim 9+10). Combine with `and`/`,`. `--no-browser` skips the Playwright pass (Dims 9+10 become "not audited").

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

Create `content/authors/firstname-lastname/_index.md` with profile front matter and add `avatar.jpg`.
