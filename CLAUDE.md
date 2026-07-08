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

- Local Hugo binary: `"$HOME/Library/Application Support/Hugo/0.84.2/hugo"` (v0.84.2 Extended)
- Run local dev server: `"$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender`
- Build site: `"$HOME/Library/Application Support/Hugo/0.84.2/hugo" --gc --minify`
- `./update_wowchemy.sh` — update Wowchemy modules and sync Hugo version in netlify.toml

# Content Conventions

> Adding or editing any content type below also requires creating its Spanish (`content/es/…`) and Japanese (`content/ja/…`) counterpart in the same change — see **Internationalization (i18n)**.

## Naming

- Publications: `content/publication/YYYYMMDD-abbreviation/index.md`
- Events: `content/event/YYYYMMDD-abbreviation/index.md`
- Posts & Tutorials: `content/post/descriptive-slug/index.md`
- Authors: `content/authors/firstname-lastname/_index.md`

## Front Matter

- All content uses YAML front matter.
- Publications require: title, authors, date, publication_types (0-8), publication, abstract, tags.
- The `admin` author refers to Carlos Mendez (`content/authors/admin/`).
- `featured: true` highlights a publication on the homepage.
- Data science posts use `image.placement: 3` for full-width featured images above the title.
- Events appear on the live site automatically via `content/event/<slug>/index.md`. `date:` is required (the talk date); future dates are allowed — production builds use `--buildFuture`. Leave `publishDate:` at "now" or earlier; a future `publishDate` hides the event in production.

## Publication Types

0=Uncategorized, 1=Conference paper, 2=Journal article, 3=Preprint, 4=Report, 5=Book, 6=Book section, 7=Thesis, 8=Patent

## Icons

Font Awesome icons in link buttons. Common `icon_pack` values: `fas` (solid), `fab` (brands), `ai` (academicons). Reference: https://fontawesome.com/search

# Homepage Architecture

The homepage is a widget-based layout. Each file in `content/home/` is a section, ordered by its `weight` (lower = higher on the page); toggle `active: true/false` to show/hide.

**Projects widget ordering:** the Projects widget (`content/home/projects.md`) renders via the `showcase` shortcode (`layouts/shortcodes/showcase.html`), which sorts the `projects` section by `.ByLastmod.Reverse` (git commit date of each project's `index.md`; `enableGitInfo: true`). **Convention: committing any change under `content/projects/<slug>/` (plus its ES/JA counterparts) automatically surfaces that project FIRST — no manual `date`/`weight` bump.** The Talks widget uses the same shortcode but keeps `date`-descending order (the projects-only sort is guarded by `if eq $section "projects"`).

# Custom Components

- **`fullwidth-iframe` shortcode** (`layouts/shortcodes/fullwidth-iframe.html`) — full-viewport-width iframe with responsive height + lazy loading. Usage: `{{</* fullwidth-iframe src="…" height="800px" */>}}`. If a new page type using it doesn't break out of margins, add its container class to the overflow reset in `custom.scss`.
- **Page header override** (`layouts/partials/page_header.html`) — renders the featured image **above** the title (image-first). Data science posts use `image.placement: 3` (2560x2560 Fit); Colab/script/notebook buttons come from `links:` front matter, not the body; the image wrapper uses `mb-4`.
- **Custom CSS** (`assets/scss/custom.scss`) — hero fix, iframe breakout, dashboard gallery grid, notebook-style post styling, Python syntax highlighting, left-side ToC. See `README.md` for the section breakdown.
- **Dashboards gallery** (project page) — responsive screenshot-card grid linking out to GEE apps. Trigger: **"Add dashboard app: `<Access App URL>` — `<English title>`"**. See `.claude/docs/dashboards-gallery.md`.
- **AI Podcast Player** — inline audio-player block appended to a post. Trigger: **"Add AI Podcast to `<post slug>`"**. See `.claude/docs/ai-podcast-player.md`.
- **Post resource buttons** — the **Slides (PDF)**, **Slides (HTML)**, and tutorial **`.zip` bundle** `links:` entries (each has a specific relative-vs-absolute URL rule). Triggers: "Add slides to `<post>`" / a new `slides/` deck / a Quarto bundle. See `.claude/docs/post-resource-buttons.md`.

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

- Site color palette: steel blue `#6a9bcc`, warm orange `#d97757`, near black `#141413`, teal `#00d4c8`
- Dark theme palette: `#0f1729`, `#1f2b5e`, `#c8d0e0`, `#e8ecf2`
- Currency dollar signs: `\\$` in `index.md` (MathJax-enabled), `\$` in notebook
- Output blocks: use ` ```text ` (not bare ` ``` `) to prevent highlight.js auto-detection coloring
- Causal posts: explicitly state estimand (ATE/ATT) for each method; distinguish randomized vs observational framing
- PDF reference handling: delegate large PDFs to Explore agents; extract only relevant pages (5–15); clean up before committing
- Reference posts (Python): `python_ml_random_forest` (ML), `python_dowhy` (causal inference), `python_fwl` (dark-theme figures, simulated data), `python_pyfixest` (panel/fixed effects), `python_esda2` (ESDA/LISA), `python_mgwr` (MGWR)
- Reference posts (Stata): `stata_rct` (RCT panel data, RA/IPW/DR/DiD/DRDID, Mermaid diagrams, equations with analogies)

# Internationalization (i18n)

The site is trilingual: **English at `/`** (`content/`), **Spanish at `/es/`** (`content/es/`, neutral Latin American Spanish, formal `usted`), **Japanese at `/ja/`** (`content/ja/`, です・ます). There is no English fallback — untranslated content simply won't appear on `/es/` or `/ja/`.

**Translate new content (REQUIRED):** whenever qualifying content is added or materially edited under `content/<section>/<slug>/`, the SAME change MUST create/update its ES + JA counterparts:
- `publication`, `event`, `projects`, `authors`, and standalone pages (courses/alumni/slides/privacy/terms) → **full translation**.
- `post` tutorials → **stub card only** (translated `title`+`summary`, `card_url: "/post/<slug>/"`, `_build: {render: never, list: always}`, empty body). Posts are the ONLY stub exception.

**Mechanism:** `/project:translate-content <slug> --lang all` (see `.claude/skills/translate-content/SKILL.md`) applies the glossary and copies assets. `scripts/i18n-parity.sh` reports EN items lacking an ES/JA counterpart. Full field-by-field rules, config/layout, geolocation, and the "add another language" recipe are in **`.claude/docs/i18n.md`**.

# Hugo Version Constraints

- The site requires Hugo **≥ 0.96** (`layouts/section/event.html` uses the `continue` keyword). `netlify.toml` pins `HUGO_VERSION = 0.111.3`. There is **no Netlify UI env override** — the `netlify.toml` pin is the actual build version. Keep the pin in the 0.96–0.119 window; do not revert it.
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
