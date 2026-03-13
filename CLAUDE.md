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

# Claude Code Skills

## data-science-post

**Location:** `.claude/skills/data-science-post/SKILL.md`

Generates notebook-style data science blog posts for the site. The user provides a topic, dataset, and optional reference URLs. The skill produces a Hugo page bundle at `content/post/python_<topic-slug>/` with:

- `index.md` -- full tutorial with YAML front matter, case-study framing, code blocks, figures, and interpretation paragraphs
- `script.py` -- standalone Python script (optional)
- `*.png` -- at least 3 matplotlib figures using the site color palette

**Invocation:**
```
/project:data-science-post <topic> dataset: <dataset> [references: <URLs>]
```

**Examples:**
```
/project:data-science-post double machine learning dataset: DS4Bolivia references: https://docs.doubleml.org/stable/intro/intro.html
/project:data-science-post k-means clustering dataset: https://archive.ics.uci.edu/ml/datasets/Iris
/project:data-science-post spatial regression dataset: PySAL example data references: https://pysal.org/spreg/
```

**Key conventions enforced by the skill:**
- Sandwich pattern: conceptual explanation before every code block, interpretation paragraph after
- At least 8 interpretation paragraphs with specific numeric values
- Site color palette: steel blue `#6a9bcc`, warm orange `#d97757`, near black `#141413`, teal `#00d4c8`
- `toc: true` in front matter enables the left-side table of contents
- Currency dollar signs: use `\\$` in `index.md` (MathJax-enabled), `\$` in notebook
- Causal posts: explicitly state estimand (ATE/ATT) for each method; distinguish randomized vs observational framing
- After code changes, re-run script.py to regenerate ALL images; delete orphaned PNGs
- Reference posts: `content/post/python_ml_random_forest/index.md` (ML), `content/post/python_dowhy/index.md` (causal inference)

## referee-post

**Location:** `.claude/skills/referee-post/SKILL.md`

Reviews data science blog posts as an expert professor of data science and econometrics. Produces a structured referee report covering code correctness, pedagogical explanations, result interpretations, and references. Read-only — does not modify the post.

**Invocation:**
```
/project:referee-post <post slug>
```

**Examples:**
```
/project:referee-post python_doubleml
/project:referee-post python_dowhy
/project:referee-post content/post/python_ml_random_forest/
```

**Report includes:**
- Verdict: ACCEPT / MINOR REVISION / MAJOR REVISION
- Five review passes: structure, code quality, sandwich pattern, interpretations, academic rigor
- Issue tables with severity (HIGH/MEDIUM/LOW), location, and suggested fixes
- Priority action items ranked by impact

## infographic-instructions

**Location:** `.claude/skills/infographic-instructions/SKILL.md`

Generates a sketchnote-style infographic instructions file that summarizes an existing blog post into 6 panels with the site color palette. Produces `infographic_instructions.md` in the post's page bundle with design style guidance, color palette, and panel-by-panel text content.

**Invocation:**
```
/project:infographic-instructions <post slug>
```

**Examples:**
```
/project:infographic-instructions python_partial_identification
/project:infographic-instructions python_dowhy
/project:infographic-instructions python_doubleml
```

**Output includes:**
- Title: concise summary of the post topic
- Design style: sketchnote aesthetic with topic-specific illustration suggestions
- Color palette: site colors with role assignments
- 6 panels with 2-3 infographic-ready sentences each, including specific numbers from the post

## proofread-post

**Location:** `.claude/skills/proofread-post/SKILL.md`

Final proofreading pass on a data science post before publication. Checks correctness, display, and consistency without modifying any files. Lighter and faster than `referee-post` -- use this right before committing or publishing.

**Invocation:**
```
/project:proofread-post <post slug>
```

**Examples:**
```
/project:proofread-post python_partial_identification
/project:proofread-post python_dowhy
/project:proofread-post content/post/python_ml_random_forest/
```

**Checks performed (9-point checklist):**

- Front matter completeness (title, authors, date, tags, toc, diagram, featured image)
- Markdown structure (code fences, HTML tags, heading hierarchy)
- Math notation (LaTeX escaping for Goldmark: `\_`, `\\,`, `\\$`)
- Code/output pairing (every `print()` has a matching output block)
- Images (all references valid, alt text present, no orphaned PNGs)
- Code consistency (index.md vs script.py parameter sync)
- Mermaid diagrams (syntax, `diagram: true` in front matter)
- References and links (syntax check, numbered list)
- Site conventions (em dashes, no emojis, color palette)

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
