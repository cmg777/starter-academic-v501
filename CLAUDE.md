# Project Overview

Academic portfolio website for Carlos Mendez (carlos-mendez.org). Built with Hugo + Wowchemy v5 theme, deployed on Netlify.

See @README.md for full documentation of the directory structure, tech stack, and content conventions.

# Tech Stack

- Hugo 0.89.4 (static site generator)
- Wowchemy v5 theme (via Hugo Modules, pinned in go.mod)
- Goldmark markdown renderer with `unsafe: true` (inline HTML allowed)
- Mermaid diagrams supported (add `diagram: true` to front matter)
- SCSS for custom styles (assets/scss/custom.scss)
- Netlify for deployment (auto-deploy on push to master)

# Key Commands

- Local Hugo binary: `"$HOME/Library/Application Support/Hugo/0.84.2/hugo"` (v0.84.2 Extended)
- Run local dev server: `"$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender`
- Build site: `"$HOME/Library/Application Support/Hugo/0.84.2/hugo" --gc --minify`
- `./update_wowchemy.sh` — update Wowchemy modules and sync Hugo version in netlify.toml

# Content Conventions

## Naming

- Publications: `content/publication/YYYYMMDD-abbreviation/index.md`
- Events: `content/event/YYYYMMDD-abbreviation/index.md`
- Posts & Tutorials: `content/post/descriptive-slug/index.md`
- Authors: `content/authors/firstname-lastname/_index.md`

## Front Matter

- All content uses YAML front matter
- Publications require: title, authors, date, publication_types (0-8), publication, abstract, tags
- The `admin` author in the authors field refers to Carlos Mendez (content/authors/admin/)
- Use `featured: true` to highlight important publications on the homepage
- Data science posts use `image.placement: 3` for full-width featured images above the title

## Publication Types

0=Uncategorized, 1=Conference paper, 2=Journal article, 3=Preprint, 4=Report, 5=Book, 6=Book section, 7=Thesis, 8=Patent

## Icons

Font Awesome icons are used in link buttons. Common icon_pack values: `fas` (solid), `fab` (brands), `ai` (academicons). Reference: https://fontawesome.com/search

# Homepage Architecture

The homepage is a widget-based layout. Each file in `content/home/` is a section, ordered by the `weight` field in its front matter. To activate/deactivate a section, toggle `active: true/false`. Lower weight = appears higher on the page.

# Custom Components

## Shortcode: fullwidth-iframe

Located at `layouts/shortcodes/fullwidth-iframe.html`. Renders a full-viewport-width iframe with responsive height and lazy loading.

Usage in content files:
```
{{</* fullwidth-iframe src="https://example.com/app" height="800px" */>}}
```

## Page Header Override

Located at `layouts/partials/page_header.html`. Overrides the Wowchemy theme default to render the **featured image above the title** (image-first layout). The theme default shows title first, then image.

- All data science posts use `image.placement: 3` in front matter for full-width featured images (2560x2560 Fit)
- Colab badges are NOT placed in the post body — the `links:` front matter section provides Colab, script, and notebook buttons in the metadata area
- The image wrapper uses `mb-4` (no top margin) to sit flush against the navbar

## Custom CSS (assets/scss/custom.scss)

Six sections:
1. Hero2 full-width fix
2. Full-width iframe breakout + ancestor overflow resets
3. Collapsible dashboard entry styling
4. Notebook-style post styling (code blocks, figures, tables, blockquotes, headings, learning objectives)
5. Python syntax highlighting colors
6. Left-side Table of Contents

When adding new page types that use the fullwidth-iframe shortcode, check that ancestor containers have `overflow: visible`. If the iframe doesn't break out of margins, the likely fix is adding the new container class to the overflow reset in custom.scss.

## Collapsible Dashboards

The dashboards project page (content/projects/dashboards/index.md) uses native `<details>/<summary>` elements. Each dashboard entry wraps its citation in `<summary>` and the fullwidth-iframe shortcode inside `<details class="dashboard-entry">`. This defers iframe loading until the user expands the section.

## AI Podcast Player

An embedded audio player overlay for AI-generated podcast summaries of blog posts. The player is self-contained inline HTML/CSS/JS appended to each post's `index.md` — no external dependencies or shared templates.

**When the user says "Add AI Podcast to `<post slug>`"**, do the following:

1. **Front matter** — add a podcast link entry to the `links:` section:
   ```yaml
   - icon: podcast
     icon_pack: fas
     name: AI Podcast
     url: "/post/<post-slug>/#podcast-player"
   ```

2. **Post body** — append the podcast player block at the very end of the file, after a `---` separator. Copy the full `<style>` + `<div>` + `<script>` block from an existing post (e.g., `content/post/python_dowhy_intro/index.md`) and customize three things:
   - **Audio `src`**: the URL the user provides (typically a catbox.moe link, `.m4a` or `.wav`)
   - **Title text**: update the `<h4>` inside `.podcast-title-block` (e.g., "AI Podcast: Topic Name")
   - **Stream link `href`**: same audio URL, with `target="_blank"` (no `download` attribute — stream, don't download)

**Reference implementations:**
- `content/post/python_dowhy_intro/index.md` — podcast only (m4a, stream link)
- `content/post/python_did101/index.md` — podcast + video player (wav, download link)

**Player features:** play/pause, skip ±15s, progress bar with buffering, time display, volume slider, playback speed (0.75x–2x), stream/download button. Dark gradient UI using site colors (`#d97757` orange accent, `#6a9bcc`/`#00d4c8` progress gradient). Slides up from bottom on click, auto-opens if URL hash is `#podcast-player`.

## Tutorial bundles (`.zip`)

Some Quarto tutorials need companion files (e.g. `setup_env.py`, `_quarto.yml`) alongside the `.qmd` to render locally. For these we ship a single ZIP via the post's "Tutorial bundle (.zip)" link, served from `static/uploads/`.

Currently this applies only to `content/post/python_pyfixest/`. Whenever `tutorial.qmd`, `setup_env.py`, `_quarto.yml`, `script.py`, or the bundle `README.md` changes, run `bash content/post/python_pyfixest/build_bundle.sh` and commit the regenerated `static/uploads/python_pyfixest_tutorial.zip` in the same commit.

# Claude Code Skills

Nine skills: eight organized as Write/Review pairs across four artifact stages, plus the standalone `write-quarto-notebook` skill that produces an executable companion notebook from an existing post. Each skill excels at one thing. Skills are independent (can be invoked standalone) but compose naturally into a pipeline: script -> results report -> blog post -> infographic. All skills follow a three-phase interaction pattern: (1) confirm scope, (2) execute, (3) offer follow-ups. Skills use progressive disclosure via `references/` subdirectories. Legacy skills are preserved at `.claude/skills/legacy/` for reference.

## Pipeline overview

| Stage | Write | Review |
|-------|-------|--------|
| Script | `/project:write-script` | `/project:review-script` |
| Results report | `/project:write-results-report` | `/project:review-results-report` |
| Blog post | `/project:write-post` | `/project:review-post` |
| Infographic | `/project:write-infographic` | `/project:review-infographic` |
| Quarto notebook (executable companion) | `/project:write-quarto-notebook` | — |

## Shared conventions

- Site color palette: steel blue `#6a9bcc`, warm orange `#d97757`, near black `#141413`, teal `#00d4c8`
- Dark theme palette: `#0f1729`, `#1f2b5e`, `#c8d0e0`, `#e8ecf2`
- Currency dollar signs: `\\$` in `index.md` (MathJax-enabled), `\$` in notebook
- Output blocks: use ` ```text ` (not bare ` ``` `) to prevent highlight.js auto-detection coloring
- Causal posts: explicitly state estimand (ATE/ATT) for each method; distinguish randomized vs observational framing
- PDF reference handling: delegate large PDFs to Explore agents; extract only relevant pages (5--15); clean up before committing
- Reference posts (Python): `content/post/python_ml_random_forest/index.md` (ML), `content/post/python_dowhy/index.md` (causal inference), `content/post/python_fwl/index.md` (dark theme figures, simulated data), `content/post/python_pyfixest/index.md` (panel data, fixed effects, dark theme figures), `content/post/python_esda2/index.md` (ESDA, spatial autocorrelation, LISA), `content/post/python_mgwr/index.md` (MGWR, spatially varying coefficients)
- Reference posts (Stata): `content/post/stata_rct/index.md` (RCT with panel data, RA/IPW/DR/DiD/DRDID, Mermaid diagrams, equations with analogies)

## write-script

**Location:** `.claude/skills/write-script/SKILL.md`

Write and execute a data science script (Python/Stata/R). Produces the script file, execution_log.txt, and PNG figures. Does NOT write the blog post or results report.

**Invocation:**
```
/project:write-script <topic> dataset: <dataset> [references: <URLs>] [language: python|stata|r] [theme: light|dark]
```

**Examples:**
```
/project:write-script double machine learning dataset: DS4Bolivia references: https://docs.doubleml.org/stable/intro/intro.html
/project:write-script k-means clustering dataset: https://archive.ics.uci.edu/ml/datasets/Iris
/project:write-script spatial regression in R dataset: PySAL example data
/project:write-script RCT evaluation in Stata dataset: dataSIM4RCT.dta references: causal.pdf
```

**Reference files:** `references/data-sources.md`, `references/figure-conventions.md`, `references/causal-inference.md`, `references/script-templates.md`, `references/execution-protocol.md`

## review-script

**Location:** `.claude/skills/review-script/SKILL.md`

Expert review of a data science script. Runs the code, checks output, reviews quality across 8 dimensions (execution, structure, code quality, reproducibility, figures, data handling, statistical correctness, causal inference). Produces a scored review report. Read-only.

**Invocation:**
```
/project:review-script <post slug>
```

**Reference files:** `references/review-checklist.md`, `references/scoring-and-criteria.md`

## write-results-report

**Location:** `.claude/skills/write-results-report/SKILL.md`

Execute a data science script and produce a structured results report (`results_report.md`) with interpretations. Bridges the gap between raw code output and the blog post. Every number gets domain context. At least 5 key findings with specific numbers.

**Invocation:**
```
/project:write-results-report <post slug>
```

**Reference files:** `references/report-structure.md`, `references/interpretation-guide.md`

## review-results-report

**Location:** `.claude/skills/review-results-report/SKILL.md`

Expert review of a results report. Verifies accuracy against script output, checks interpretation quality, validates completeness. Read-only.

**Invocation:**
```
/project:review-results-report <post slug>
```

**Reference files:** `references/review-checklist.md`, `references/scoring-and-criteria.md`

## write-post

**Location:** `.claude/skills/write-post/SKILL.md`

Write a notebook-style data science blog post (`index.md`). Has two modes: (A) consume existing script + results_report.md with real numbers, or (B) standalone with inline code blocks and `[VERIFY]` markers. Enforces sandwich pattern, 8+ interpretations, 3+ figures, LaTeX escaping.

**Invocation:**
```
/project:write-post <topic> dataset: <dataset> [references: <URLs>]
/project:write-post <post slug>
```

**Examples:**
```
/project:write-post double machine learning dataset: DS4Bolivia
/project:write-post python_doubleml
/project:write-post k-means clustering dataset: Iris
```

**Key conventions:**
- Sandwich pattern: explanation -> code -> output -> interpretation
- At least 8 interpretation paragraphs with specific numeric values
- At least 2 display-math equations with plain-language explanations and variable mapping
- `toc: true` and `image.placement: 3` in front matter
- Beginner accessibility: define jargon, explain "why", analogies, concrete before abstract

**Reference files:** `references/latex-escaping.md`, `references/figure-conventions.md`, `references/causal-inference.md`, `references/front-matter-templates.md`, `references/quality-checklist.md`

## review-post

**Location:** `.claude/skills/review-post/SKILL.md`

Comprehensive review of a data science blog post. Merges deep expert review with final proofreading into one thorough pass across 12 dimensions. Produces a scored report with verdict (ACCEPT / MINOR REVISION / MAJOR REVISION), dimension scores, and priority action items. Supports `focus:` for targeted reviews. Read-only.

**Invocation:**
```
/project:review-post <post slug> [focus: code | structure | math | explanations | interpretations | writing | grammar | rigor | images]
```

**12 review dimensions:** code execution, front matter & links, markdown structure, code quality, sandwich pattern, beginner accessibility, mathematical equations, interpretations, writing clarity & grammar, academic rigor, narrative flow, images/Mermaid/deliverables.

**Reference files:** `references/report-template.md`, `references/scoring-and-criteria.md`, `references/latex-escaping.md`

## write-infographic

**Location:** `.claude/skills/write-infographic/SKILL.md`

Generate a storyboard-first chalkboard infographic prompt for a blog post. Uses a Story Spine narrative arc and simple sketch metaphors (not precise charts) that Gemini can render well. Produces `infographic_instructions.md` with 4 sections: (A) lean flowing-prose AI image prompt (~800-1,000 words), (B) negative prompt, (C) condensed ~200-word prompt, (D) panel reference data with body text for manual overlay. Confirms Story Spine, story beats, and 3 BIG numbers before generating.

**Invocation:**
```
/project:write-infographic <post slug>
```

**Reference files:** `references/panel-templates.md`, `references/static-sections.md`, `references/visual-metaphor-vocabulary.md`

## review-infographic

**Location:** `.claude/skills/review-infographic/SKILL.md`

Expert review of infographic instructions. Cross-checks every number against the source post, evaluates storyboard coherence and sketch quality (metaphorical vs precise), verifies narrative arc and Story Spine, and suggests variant improvements. Read-only.

**Invocation:**
```
/project:review-infographic <post slug>
```

**Reference files:** `references/review-checklist.md`, `references/panel-templates.md`

## write-quarto-notebook

**Location:** `.claude/skills/write-quarto-notebook/SKILL.md`

Generate a self-contained Quarto notebook (`tutorial.qmd`) from an existing R / Python / Stata post + companion script so readers can render the tutorial locally in Positron or RStudio. Pins exact package versions probed from the developer's machine for reproducibility (R: `pak::pkg_install("pkg@x.y.z")`, Python: `pip install pkg==version`, Stata: not supported by SSC). Renders locally to verify, retries up to 3× with an auto-fix catalog on common errors. Adds a "Quarto (.qmd)" link button to the post's front matter on success.

**Invocation:**
```
/project:write-quarto-notebook <post slug> [--no-render] [--no-link]
```

**Examples:**
```
/project:write-quarto-notebook r_causalpolicy_workshop
/project:write-quarto-notebook python_doubleml
/project:write-quarto-notebook stata_cate2 --no-render
```

**Output paths (language-specific):**
- R → `content/post/<slug>/tutorial.qmd` (theme: darkly)
- Python → `content/post/<slug>/references/tutorial.qmd` (theme: cosmo, `jupyter: python3`)
- Stata → `content/post/<slug>/references/tutorial.qmd` (theme: cosmo, `jupyter: nbstata`)

**Reference files:** `references/language-conventions.md`, `references/transformations.md`, `references/render-and-fix.md`, `references/verification-checklist.md`

# Hugo Version Constraints

- Netlify: Hugo 0.89.4 (set in netlify.toml)
- Local: Hugo 0.109.0 Extended (at `~/Library/Application Support/Hugo/0.109.0/hugo`)
- Theme minimum: 0.78 (set in theme.toml)
- Hugo 0.91+ requires security policy for `WC_POST_CSS` env var — already configured in `config/_default/config.yaml` under `security.funcs.getenv`
- Do NOT upgrade past 0.99.x without verifying Wowchemy v5 template compatibility (Hugo 0.100+ removed Blackfriday renderer)
- Wowchemy modules are pinned to commit 20210324 in go.mod; updating them is a separate decision from updating Hugo

# Deployment

- Push to `master` triggers Netlify auto-deploy
- Build command: `hugo --gc --minify -b $URL`
- Deploy previews use `--buildFuture` to include future-dated content
- Netlify cache plugin is enabled for faster rebuilds

# Logs Directory

The `logs/` directory documents the current status and evolution of this website. Check this directory to understand recent changes, ongoing work, and the overall trajectory of the site. When making significant changes, update or add entries in `logs/` to maintain a clear record.

# Style Guidelines

- Do not add emojis to front matter or config files
- Keep abstracts as single-line strings in YAML (no line breaks)
- Use em dashes (—) not double hyphens (--) in text content
- Background images for homepage widgets are in assets/media/ (prefer .webp over .jpg)
- All iframes should include `loading="lazy"` for performance
- In posts with math enabled, use `\\$` for literal currency dollar signs (e.g., `\\$1,736`). The site overrides MathJax with `processEscapes: true` (`assets/js/mathjax-config.js`), so `\$` in HTML renders as a literal `$`. Do NOT use `&#36;` — it does not work.
