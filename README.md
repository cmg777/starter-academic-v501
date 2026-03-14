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

### New Data Science Post (via Claude Code Skill)

The `data-science-post` skill automates creating notebook-style data science blog posts. It produces a Hugo page bundle with case-study framing, Python code blocks, matplotlib figures, and interpretation paragraphs.

**Location:** `.claude/skills/data-science-post/SKILL.md`

**Usage** (in Claude Code):

```
/project:data-science-post <topic> dataset: <dataset> [references: <URLs>]
```

**Examples:**

```
/project:data-science-post double machine learning dataset: DS4Bolivia references: https://docs.doubleml.org/stable/intro/intro.html
/project:data-science-post k-means clustering dataset: https://archive.ics.uci.edu/ml/datasets/Iris
/project:data-science-post spatial regression dataset: PySAL example data references: https://pysal.org/spreg/
```

**What it produces:**

| Output | Path |
|--------|------|
| Blog post | `content/post/python_<topic-slug>/index.md` |
| Python script (optional) | `content/post/python_<topic-slug>/script.py` |
| Figures (>= 3) | `content/post/python_<topic-slug>/<slug>_*.png` |

The skill enforces the sandwich pattern (explanation, code, interpretation), uses the site color palette (`#6a9bcc`, `#d97757`, `#141413`, `#00d4c8`), and requires at least 8 interpretation paragraphs with specific numeric values. Posts inherit notebook-style CSS styling from `assets/scss/custom.scss` and use `toc: true` for the left-side table of contents. Currency dollar signs use `\\$` in `index.md` (MathJax-enabled) and `\$` in notebooks. After code changes, re-run `script.py` to regenerate all images.

**Reference posts:**

- ML: `content/post/python_ml_random_forest/index.md`
- Causal inference: `content/post/python_dowhy/index.md`
- Dark theme figures / simulated data: `content/post/python_fwl/index.md`

### Review a Data Science Post (via Claude Code Skill)

The `referee-post` skill reviews data science posts as an expert professor. It produces a structured referee report without modifying the post.

**Location:** `.claude/skills/referee-post/SKILL.md`

**Usage** (in Claude Code):

```
/project:referee-post <post slug>
```

**Examples:**

```
/project:referee-post python_dowhy
/project:referee-post python_doubleml
```

### Generate Infographic Instructions (via Claude Code Skill)

The `infographic-instructions` skill generates an AI-image-generation prompt that creates a chalkboard-style infographic summarizing a blog post into 6 panels. The output is a copy-pasteable prompt optimized for Gemini, DALL-E, Midjourney, or Ideogram. Includes an interactive confirmation step before generation.

**Location:** `.claude/skills/infographic-instructions/SKILL.md`

**Usage** (in Claude Code):

```
/project:infographic-instructions <post slug>
```

**Examples:**

```
/project:infographic-instructions python_partial_identification
/project:infographic-instructions python_dowhy
```

**What it produces:**

| Output             | Path                                                |
|--------------------|-----------------------------------------------------|
| Infographic prompt | `content/post/<slug>/infographic_instructions.md`   |

The file contains four sections: (A) a full flowing-prose image generation prompt with scene description, composition, color system, panel-by-panel visual scenes, enrichment elements, and text rendering guidance; (B) a negative prompt; (C) a condensed ~300-word prompt for token-limited tools; and (D) a structured panel reference data appendix. The skill asks the user to confirm template selection, title, panel topics, target AI tool, and text rendering preference before generating.

**Reference output:** `content/post/python_partial_identification/infographic_instructions.md`

### Proofread a Data Science Post (via Claude Code Skill)

The `proofread-post` skill runs a final proofreading pass on a data science post before publication. It checks correctness, display, and consistency without modifying any files. Lighter and faster than `referee-post`.

**Location:** `.claude/skills/proofread-post/SKILL.md`

**Usage** (in Claude Code):

```
/project:proofread-post <post slug> [focus: frontmatter | markdown | math | code | images | mermaid | refs | style | grammar]
```

**Examples:**

```
/project:proofread-post python_partial_identification
/project:proofread-post python_dowhy
/project:proofread-post python_dowhy focus: math
/project:proofread-post python_doubleml focus: code
```

**10-point checklist:** front matter and `links:` validation, markdown structure (heading hierarchy, callout/shortcode pairing, learning objectives, Colab badge), math (Goldmark escaping + correctness + accessible language with plain-language companions and variable mapping), code/output pairing, images (references + orphans + captions), code consistency and supporting files (CSVs, R/Stata scripts), Mermaid diagrams (syntax + site palette colors), references/links, site conventions, grammar/spelling/typos (prose only). Use `focus:` to run only specific checks.

### New Author

Create `content/authors/firstname-lastname/_index.md` with profile front matter and add `avatar.jpg`.
