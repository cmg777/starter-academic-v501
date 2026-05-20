# carlos-mendez.org

Academic portfolio website for **Carlos Mendez**, Associate Professor of Development Economics at Nagoya University (GSID), Japan.

**Live site:** <https://carlos-mendez.org/>

## Tech Stack

| Component | Version / Detail |
|-----------|-----------------|
| Static site generator | [Hugo](https://gohugo.io/) 0.89.4 |
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

## Local Development

**Prerequisites:** Go (1.15+), Git

A local Hugo Extended binary is available at:

```bash
~/Library/Application Support/Hugo/0.84.2/hugo
```

> **Note:** This is v0.84.2 (the Netlify build uses 0.89.4). It works for local previews; the theme minimum is 0.78.

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
- **Hugo version:** 0.89.4 (set via `HUGO_VERSION` env var)
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

Ten Claude Code skills: eight organized as Write/Review pairs across four artifact stages, plus two standalone Quarto-companion skills (`write-quarto-notebook` for R/Python/Stata with a lighter chunk-time install pattern, and `write-quarto-notebook-python` for Python-only with a friction-free hermetic-venv bundle pattern). Each skill excels at one thing. Skills are independent (can be invoked standalone) but compose naturally into a pipeline: script -> results report -> blog post -> infographic. All skills follow a three-phase interaction pattern: (1) confirm scope, (2) execute, (3) offer follow-ups. Skills use **progressive disclosure** via `references/` subdirectories. Legacy skills are preserved at `.claude/skills/legacy/`.

| Stage | Write skill | Review skill |
|-------|-------------|--------------|
| Script | `write-script` | `review-script` |
| Results report | `write-results-report` | `review-results-report` |
| Blog post | `write-post` | `review-post` |
| Infographic | `write-infographic` | `review-infographic` |
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
```

### New Author

Create `content/authors/firstname-lastname/_index.md` with profile front matter and add `avatar.jpg`.
