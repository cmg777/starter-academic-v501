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

> Adding or editing any content type below also requires creating its Spanish (`content/es/…`) and Japanese (`content/ja/…`) counterpart in the same change (full translation for everything except tutorial-post bodies, which are stub cards) — see the **Translate new content (REQUIRED)** rule in the Internationalization (i18n) section.

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
- Events appear on the live site automatically via `content/event/<slug>/index.md`. `date:` is required (the talk date); future dates are allowed — production builds use `--buildFuture` (see netlify.toml). Leave `publishDate:` at "now" or earlier; a future `publishDate` will hide the event in production.

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
- `content/post/r_sc_multi_country/index.md` — podcast only (m4a, stream link; R post)

**Player features:** play/pause, skip ±15s, progress bar with buffering, time display, volume slider, playback speed (0.75x–2x), stream/download button. Dark gradient UI using site colors (`#d97757` orange accent, `#6a9bcc`/`#00d4c8` progress gradient). Slides up from bottom on click, auto-opens if URL hash is `#podcast-player`.

## Slides (PDF) link button

When a post ships a slide deck PDF in its page bundle (`content/post/<slug>/slides.pdf`, served at `/post/<slug>/slides.pdf`), surface it as a resource button.

**When the user adds a `slides.pdf` (or says "Add slides to `<post slug>`")**, add ONE entry to the post's front-matter `links:` section — nothing in the body:

```yaml
- icon: file-pdf
  icon_pack: fas
  name: "Slides (PDF)"
  url: https://carlos-mendez.org/post/<slug>/slides.pdf
```

**Use an absolute URL (not relative).** The theme partial that renders these buttons (`layouts/partials/page_links.html` in the pinned Wowchemy module) only adds `target="_blank" rel="noopener"` to a `links:` entry when its `url` has an `http(s)` scheme. A **relative** `url: slides.pdf` resolves correctly (page-bundle resource) but opens in the **same tab**; the **absolute** `https://carlos-mendez.org/post/<slug>/slides.pdf` opens the deck in a **new tab** (and matches the post's other absolute links like "MD version" / "Data (CSV)"). `file-pdf` + `fas` is the site's standard PDF icon (also used by publications).

**Why not the native `url_slides` field:** Wowchemy's `url_slides` also renders a button (it resolves a relative `slides.pdf` and opens a new tab), but it is hard-labeled **"Slides"** via the site-wide `btn_slides` i18n string — *not* customizable per post. Use `url_slides: slides.pdf` only if a plain "Slides" label is fine; use the `links:` entry above when you want the "Slides (PDF)" label + PDF icon.

- No body change, no embed; the PDF lives in the bundle.
- **No i18n change** — the ES/JA counterparts are card-only stubs (`_build: {render: never}`) that link back to the English post.
- Reference implementation: `content/post/r_sc_multi_country/` (ships `slides.pdf` + the `links:` entry).

## Slides (HTML) link button

When a post ships a Quarto reveal.js deck in its page bundle (`content/post/<slug>/slides/`, served at `/post/<slug>/slides/index.html`), surface it as a resource button. The deck is generated by the `write-slides` skill (see **Claude Code Skills**); this is the **HTML** counterpart to the **PDF** button above.

**Add ONE entry to the post's front-matter `links:` section — nothing in the body:**

```yaml
- icon: person-chalkboard
  icon_pack: fas
  name: "Slides (HTML)"
  url: slides/index.html
```

**Use a RELATIVE `url` with no trailing slash.** `url: slides/index.html` resolves as a page-bundle resource via `layouts/partials/page_links.html` (`Resources.GetMatch`/`relURL`) and opens in the same tab — identical to the proven `web_app/index.html`. A trailing-slash `url: slides/` is re-rooted by the Wowchemy theme to an absolute `/slides/` and 404s (the same bug documented for web_app in `.claude/skills/write-app/references/render-and-fix.md`). This is **distinct** from "Slides (PDF)" (root `slides.pdf`, **absolute** URL, new tab) and from Wowchemy's native `url_slides` / `content/slides/` page — all three can coexist on one post.

- No body change, no embed; the deck lives in the bundle (the `slides.qmd` source + the rendered `index.html` + `slides_files/`; rendered by the Quarto CLI — reveal.js bundled locally, MathJax math from a CDN). It has built-in menu, chalkboard, speaker view, and preview-links. Not `embed-resources` (chalkboard is incompatible with self-contained output), so the deck ships `index.html` + `slides_files/` — Hugo serves this like the existing `tutorial.html`.
- The deck reuses the post's figures in place via relative `../<slug>_*.png` paths — they are not copied.
- **No i18n change** — the ES/JA counterparts are card-only stubs (`_build: {render: never}`) that link back to the English post; the deck rides with the English post only.
- Reference implementation: `content/post/r_double_lasso/slides/`.

## Tutorial bundles (`.zip`)

Some Quarto tutorials ship companion files (`setup_env.py`, `_quarto.yml`, `render.command`/`render.bat`, bundle `README.md`) alongside the `.qmd` so students can extract a ZIP and double-click `render.command` (macOS) or `render.bat` (Windows) for a one-click hermetic render. The bundle is generated by the `write-quarto-notebook-python` skill (see "Claude Code Skills" below).

**New convention (post-root `<slug>.zip`)**: bundles built by `write-quarto-notebook-python` live at `content/post/<slug>/<slug>.zip` and are linked from `index.md` with `name: "Quarto project (.zip)"` and `url: <slug>.zip`. Rebuild any of these with `bash content/post/<slug>/build_bundle.sh` after editing the source files.

Tutorials currently shipping a `<slug>.zip` bundle at the post root:

- `content/post/python_sc_co2tax/` (2026-05-15)
- `content/post/python_iv/` (2026-05-09)
- `content/post/python_EconML/` (2026-05-07)
- `content/post/python_dowhy_intro/` (2026-05-05)
- `content/post/python_mgwrfer/` (2026-05-03)
- `content/post/python_doubleml_pension/` (2026-05-03)
- `content/post/python_cml/` (2026-05-01)
- `content/post/python_panel_intro/` (2026-04-27)
- `content/post/python_fe_kuznets/` (2026-04-27)
- `content/post/python_did101/` (2026-04-27)
- `content/post/python_panel_ses/` (2026-03-31)
- `content/post/python_scpi/` (2026-03-22)
- `content/post/python_mgwr/` (2026-03-22)
- `content/post/python_esda2/` (2026-03-22)
- `content/post/python_pca2/` (2026-03-21)
- `content/post/python_pca/` (2026-03-21)
- `content/post/python_did/` (2026-03-19)
- `content/post/python_fwl/` (2026-03-14)
- `content/post/python_partial_identification/` (2026-03-13)
- `content/post/python_dowhy/` (2026-03-12)
- `content/post/python_ml_random_forest/` (2026-03-10)
- `content/post/python_doubleml/` (2026-03-10)

Older Python posts (pre-2025) were evaluated for bundling and **skipped**: they are landing pages linking to external Google Colab notebooks with no executable Python in `index.md` (e.g. `python_esda`, `python_gwr_mgwr`, `python_how_to_build_w`, `python_monitor_*`, `python_gds_spatial_inequality`, `python_intro_spatial_data_science`). To bundle these, port the upstream Colab notebooks into the post body as fenced Python blocks first, then re-run the skill.

**Legacy convention (`static/uploads/` location)**: `content/post/python_pyfixest/` predates the new convention. Its bundle ships as `static/uploads/python_pyfixest_tutorial.zip` and is linked as "Tutorial bundle (.zip)". Whenever `tutorial.qmd`, `setup_env.py`, `_quarto.yml`, `script.py`, or the bundle `README.md` changes, run `bash content/post/python_pyfixest/build_bundle.sh` and commit the regenerated `static/uploads/python_pyfixest_tutorial.zip` in the same commit. This bundle can be migrated to the post-root convention as a separate cleanup task.

# Claude Code Skills

Fifteen skills: ten organized as Write/Review pairs across five artifact stages, plus five standalone companion skills (`write-slides` for a branded Quarto reveal.js slide deck generated from a post, `write-quarto-notebook` for R/Python/Stata with a lighter chunk-time install pattern, `write-quarto-notebook-python` for Python-only with a friction-free hermetic-venv bundle pattern, `translate-content` — the trilingual ES/JA translator documented in the Internationalization (i18n) section below — and `update-author-profile` for tri-lingual author-profile edits/creation). Each skill excels at one thing. Skills are independent (can be invoked standalone) but compose naturally into a pipeline: script -> results report -> blog post -> infographic -> web app. All skills follow a three-phase interaction pattern: (1) confirm scope, (2) execute, (3) offer follow-ups. Skills use progressive disclosure via `references/` subdirectories. Legacy skills are preserved at `.claude/skills/legacy/` for reference.

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
| Slide deck (Quarto reveal.js) | `/project:write-slides` | — |

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
- Abstract first: every post opens with a `## Abstract` section (before Overview) — one ~150-250 word paragraph through six beats (motivation → objective → data → methods → results-with-real-numbers → implication), no bold labels, body-only (no `abstract:` front-matter key)
- Sandwich pattern: explanation -> code -> output -> interpretation
- At least 8 interpretation paragraphs with specific numeric values
- At least 2 display-math equations with plain-language explanations and variable mapping
- `toc: true` and `image.placement: 3` in front matter
- Beginner accessibility: define jargon, explain "why", analogies, concrete before abstract

**Reference files:** `references/latex-escaping.md`, `references/figure-conventions.md`, `references/causal-inference.md`, `references/front-matter-templates.md`, `references/quality-checklist.md`

## review-post

**Location:** `.claude/skills/review-post/SKILL.md`

Comprehensive review of a data science blog post. Merges deep expert review with final proofreading into one thorough pass across 13 dimensions. Produces a scored report with verdict (ACCEPT / MINOR REVISION / MAJOR REVISION), dimension scores, and priority action items. Supports `focus:` for targeted reviews. Read-only.

**Invocation:**
```
/project:review-post <post slug> [focus: code | structure | math | explanations | interpretations | writing | grammar | rigor | images | abstract]
```

**13 review dimensions:** code execution, front matter & links, markdown structure, code quality, sandwich pattern, beginner accessibility, mathematical equations, interpretations, writing clarity & grammar, academic rigor, narrative flow, images/Mermaid/deliverables, abstract (journal-style `## Abstract` section: present and first, single-paragraph six-beat structure, numbers cross-checked against the post body — mismatch is HIGH).

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

## write-quarto-notebook-python

**Location:** `.claude/skills/write-quarto-notebook-python/SKILL.md`

Generate a **friction-free Quarto bundle** for an existing Python tutorial post. Beyond `tutorial.qmd`, the bundle ships a hermetic `.venv` bootstrap (`setup_env.py` with preflight + auto-relaunch + kernel registration), responsive-figure CSS, one-click render wrappers (`render.command` for macOS + `render.bat` for Windows), a bundle `README.md`, a `build_bundle.sh` packager, and a downloadable `<slug>.zip`. Probes pinned versions from the dev machine; applies macOS Intel wheel-availability overrides (e.g. `numba==0.62.1` + `llvmlite==0.45.0`) when the script triggers them.

Runs **parallel** to `write-quarto-notebook` — keep the lighter chunk-time-install pattern (`write-quarto-notebook`) for posts where it suffices; use this skill when you want students to download a ZIP, double-click `render.command`, and have it work with no Python-environment debugging.

**Invocation:**
```
/project:write-quarto-notebook-python <post slug> [--no-render] [--no-link]
```

**Examples:**
```
/project:write-quarto-notebook-python python_pyfixest
/project:write-quarto-notebook-python python_pca
/project:write-quarto-notebook-python python_doubleml --no-render
```

**Deliverables (always):** `references/tutorial.qmd`, `references/setup_env.py`, `references/_quarto.yml`, `references/render.command`, `references/render.bat`, `references/README.md`, `build_bundle.sh`, `<slug>.zip`, plus the `index.md` link update ("Quarto project (.zip)").

**Reference files:** `references/templates/` (canonical templates for each bundle file), `references/intel-wheel-catalog.md` (last Intel-wheel versions for known problem packages), `references/transformations.md`, `references/render-and-fix.md`, `references/verification-checklist.md`

## write-app

**Location:** `.claude/skills/write-app/SKILL.md`

Generate an interactive, pedagogical web app for an existing post. The skill's signature behaviour is the **interactive interview**: after reading the post's content, data, and main results, it uses `AskUserQuestion` to confirm key takeaways, tab structure, data approach, and performance caps before writing any file. Output is a 4-tab single-page app (HTML + CSS + JS + D3) that ships as `content/post/<slug>/web_app/`, opens from a YAML `Web app` button, and runs entirely client-side on GitHub Pages / Netlify. Validated against `r_double_lasso` (the reference implementation).

**Invocation:**
```
/project:write-app <post slug> [--no-link] [--no-verify]
```

**Examples:**
```
/project:write-app r_double_lasso
/project:write-app python_doubleml
/project:write-app r_did --no-verify
```

**Widget archetypes (10):** concept-animation, penalty-slider, forest-plot, dgp-simulator (4 READY); did-event-study, feature-importance, moran-scatter, train-test-split, sensitivity-heatmap, bayesian-posterior (6 STUB). The skill picks 3–4 per post based on topic detection, then confirms in the Phase-2 interview.

**Reference files:** `references/widget-catalog.md`, `references/interview-questions.md`, `references/topic-detection.md`, `references/data-handling.md`, `references/pedagogy-conventions.md`, `references/verification-checklist.md`, `references/render-and-fix.md`, `references/test-cases.md`, `references/templates/` (verbatim JS modules + index.html.tmpl + widgets/).

## review-app

**Location:** `.claude/skills/review-app/SKILL.md`

Comprehensive audit of a generated interactive web app at `content/post/<slug>/web_app/`. Inspects 10 non-overlapping dimensions (file completeness, HTML structure, JS correctness, data contract, accessibility, performance, pedagogy, Hugo integration, visual design, mobile responsiveness). Reuses `write-app`'s `smoke-test.js` under Node `vm`, spins up a Hugo dev server for HTTP-200 checks, then drives a headless Chromium via Playwright across all four tabs in both desktop (1280×800) and mobile (375×667) viewports. Includes a post↔app **pedagogical alignment** check (n-gram overlap between the post's top 3 takeaways and the app's Tab-1 lede + tab headings). Produces a verdict (ACCEPT / MINOR REVISION / MAJOR REVISION), 1–10 score per dimension, and an issues table written to `content/post/<slug>/web_app/REVIEW.md`. Read-only.

**Invocation:**
```
/project:review-app <post slug> [focus: pedagogy | code | accessibility | data | hugo | visual] [--no-browser]
```

**Examples:**
```
/project:review-app r_double_lasso
/project:review-app r_double_lasso focus: pedagogy
/project:review-app python_doubleml focus: code and accessibility
/project:review-app r_did --no-browser
```

**Focus modes:** `pedagogy` (Dim 7), `code` (3+4), `accessibility` (5), `data` (4), `hugo` (8), `visual` (9+10). Combine with `and`/`,`. Omitted ⇒ all 10.

**Reference files:** `references/review-checklist.md` (10 dimensions × per-check severity), `references/scoring-and-criteria.md` (1–10 rubric, verdict-changing rules), `references/report-template.md` (canonical REVIEW.md skeleton), `references/pedagogical-alignment.md` (n-gram overlap algorithm), `references/headless-browser.md` (Playwright bootstrap + audit script), `references/focus-modes.md`, `references/test-cases.md` (10 self-validation tests including 5 deliberate sabotage scenarios).

## write-slides

**Location:** `.claude/skills/write-slides/SKILL.md`

Generate a **Quarto reveal.js slide deck** from an existing post. Signature behaviour: an audience-triage + key-takeaway + **outline-checkpoint** interview (`AskUserQuestion`) that ports Scott Cunningham's "Rhetoric of Decks" (audience ethos·pathos·logos balance, 3-act Tension→Investigation→Resolution arc, assertion titles, one-idea-per-slide, MB/MC pacing, Devil's-Advocate). The skill writes a `slides.qmd` (`format: revealjs`) + a branded SCSS theme + a custom title-slide partial (a **key-result number strip**), then runs `quarto render` → `content/post/<slug>/slides/index.html` + `slides_files/`. Built-in **menu, chalkboard, speaker view, preview-links, overview**; reveal.js bundled locally (MathJax math from a CDN); branded to the **fixed** site palette; opened from a "Slides (HTML)" button. Reuses the post's figures in place (`../<slug>_*.png`). English-only (rides with the English post like `web_app/`; no ES/JA copies). Verification: `quarto render` + Hugo ≥0.96 HTTP-200 + a Node static smoke test. Needs the Quarto CLI to (re)generate. Write-only — no review pair yet.

**Invocation:**
```
/project:write-slides <post slug> [--no-link] [--no-verify]
```

**Examples:**
```
/project:write-slides r_double_lasso
/project:write-slides python_did101
/project:write-slides r_did --no-verify
```

**Reference files:** `references/rhetoric-of-decks.md`, `references/slide-archetypes.md`, `references/interview-questions.md`, `references/quarto-revealjs-guide.md`, `references/slide-mapping.md`, `references/verification-checklist.md`, `references/render-and-fix.md`, `references/templates/` (slides.qmd.tmpl, site-brand.scss, title-slide.html, smoke-test.js).

## update-author-profile

**Location:** `.claude/skills/update-author-profile/SKILL.md`

Update an existing author profile under `content/authors/<Folder>/_index.md` (or scaffold a brand-new one) from **pasted YAML or freeform notes**, keeping the Spanish (`content/es/authors/`) and Japanese (`content/ja/authors/`) counterparts in sync in the same run — `social` links / `email` / URLs copied **verbatim**, prose (`bio`, `role`, `interests`, `education`, `organizations.name`) translated via the project glossary (ES formal `usted`; JA です・ます). Fixes YAML programming typos (curly quotes, wrong icon packs, malformed URLs) so the build never breaks, preserves indentation/key-order byte-for-byte, infers the target author from the name and confirms before editing (handling `_Master` / duplicate-name edge cases), then verifies with a full Hugo 0.111.3 build + `scripts/i18n-parity.sh --section authors`. Leaves changes in the working tree for review; never commits. It is the **edit/create counterpart** to `translate-content` and **reuses** that skill's `references/field-rules.md` (§authors) + `references/glossary.md` rather than forking them.

**Invocation:**
```
/project:update-author-profile <author name-or-slug> [pasted YAML or freeform notes] [--create] [--no-build]
```

**Examples:**
```
/project:update-author-profile AbdulahRusli          # then paste the new front matter
/project:update-author-profile "Abdulah Rusli"        # inferred from name, then confirmed
/project:update-author-profile YangWenxuan  change github to <url>, role to "PhD student 2024-2028"
/project:update-author-profile "Jane Doe (Kenya)" --create
```

**Reference files:** `references/edit-rules.md` (diff method, typo-fix catalog, author schema + valid icon set, target-author inference), `references/create-new.md` (new-author scaffolding across EN/ES/JA), `references/scope-and-verify.md` (SCOPE block + build/parity verify recipe); plus the reused `../translate-content/references/field-rules.md` and `../translate-content/references/glossary.md`.

# Internationalization (i18n)

The site is trilingual: **English at `/`** (default, `content/`), **Spanish at `/es/`** (`content/es/`), and **Japanese at `/ja/`** (`content/ja/`). Spanish built 2026-06-04 (`logs/2026-06-04-bilingual-spanish-homepage.md`); Japanese added 2026-06-04 (`logs/2026-06-04-japanese-i18n.md`), mirroring the Spanish footprint exactly. Originally only the homepage and the few items it showed were translated, but on 2026-06-04 the **entire publication/event/project/author/post backlog was backfilled** into both ES and JA (`logs/2026-06-04-i18n-auto-translate-and-backfill.md`): `scripts/i18n-parity.sh` now reports **0 gaps** for every section (publications 40, events 30, projects 7, authors 42, post stubs 82). Going forward, new content of those types MUST be translated in the same change (see the "Translate new content (REQUIRED)" rule below and `/project:translate-content`). On 2026-06-05 the remaining standalone pages were translated too — Courses (now linked in the es/ja menus), Alumni, the Slides demo, and the Privacy/Terms drafts — and `scripts/i18n-parity.sh` was extended to track them (a `slides` section plus singleton pages); see `logs/2026-06-05-i18n-remaining-pages.md`. The ONLY content left in English by design is the **body** of tutorial posts (they stay stub cards linking to the English original). The Spanish layer was audited & revised 2026-06-04 (`logs/2026-06-04-spanish-audit.md`): reader-facing text normalized to **neutral Latin American Spanish, formal `usted`**, terminology/calques cleaned up, and the homepage tutorial "browse all" English leak fixed. Japanese remains a first draft (audited separately in `logs/2026-06-04-japanese-audit.md`); that audit also fixed a homepage-breaking edge-function 500 and applied translation polish. EN-sourced content gaps still remain (placeholder student bios; the "north-eastern China" dissertation title still mis-copied onto SuleimanHussein/ChenYilin/MinhThu). The 3 students whose title was clearly wrong (LeivaFavio/RestrepoKaterine/PhonSophat) now show `TBA`, and PrietoLaura's bio was corrected to PhD — resolved 2026-06-04 across EN/ES/JA.

- **Content layout:** `config/_default/config.yaml` `module.mounts` keep English in `content/` and Spanish in `content/es/`, isolated via `excludeFiles: 'es/**'` on the en mount. English is NOT moved to `content/en/` (preserves all `content/post/…`, `content/publication/…` conventions the skills depend on). When any `mounts` are defined, the default component mounts (assets/static/layouts/data/i18n/archetypes) MUST be re-declared — they are.
- **Languages/menu:** `config/_default/languages.yaml` (`en`, `es`, `ja`; a commented `ja` slot for a fourth language is gone — `ja` is now live). The navbar globe switcher is enabled via `params.yaml` `main_menu.show_language: true` and appears only on translated pages. The Spanish and Japanese menus include a localized Courses item (`/es/courses/`, `/ja/courses/`) now that the Courses page is translated.
- **Translated homepage:** `content/es/home/` and `content/ja/home/` mirror the active widgets of `content/home/`; bios from `content/<lang>/authors/admin/_index.md`. Dynamic widgets (featured/showcase/people) query the current language's `site.RegularPages`, so sub-pages under `content/<lang>/<section>/<slug>/` populate `/es/` and `/ja/` automatically. Per-language bundles need their own image copies (avatars, `featured.*`, gallery). The Japanese layer was scaffolded by `cp -R content/es content/ja` then translating each `.md` in place (です・ます polite register); `user_groups` were translated consistently across `content/ja/authors/*` and `content/ja/home/people.md` (e.g. 博士課程学生 / 修士課程学生), and project/event `tags` kept English (query keys).
- **Tutorial cards → English:** `layouts/partials/tutorial_card.html` honours an optional `card_url` front-matter key. Spanish stubs at `content/es/post/<slug>/index.md` set `card_url: "/post/<slug>/"`, verbatim English `categories`, and `_build: {render: never, list: always}`. NEVER use the reserved `url:` key for this (it relocates the page and collides with the English URL). The homepage `tutorial-teaser` shortcode (`layouts/shortcodes/tutorial-teaser.html`) localizes its "browse all" label via a `dict` keyed on `site.Language.Lang` (en default; es/ja set) — add a language key there when introducing a new language.
- **Translate new content (REQUIRED):** whenever qualifying content is added or materially edited under `content/<section>/<slug>/`, the SAME change MUST create/update its ES (`content/es/…`) and JA (`content/ja/…`) counterparts — there is no English fallback, so an untranslated item simply will not appear on `/es/` or `/ja/`. Treatment by section: `publication`, `event`, `projects`, and `authors` get a **full translation** — translate `title`/`subtitle`/`abstract`/`summary`/`bio`/`role`/`interests`/`event`/`location`/`links[].name`/body prose + headings, and copy `featured.*`/`cite.bib`/`avatar.*` verbatim into the translated bundle; keep `authors`/`date`/`doi`/`publication_types`/`tags`/`categories`/all URLs/`icon`/`icon_pack`/`image`/`_build` byte-for-byte. `post` tutorials get a **stub card only** (`content/<lang>/post/<slug>/index.md` with translated `title`+`summary`, verbatim English `categories`, `card_url: "/post/<slug>/"`, `featured: false`, `_build: {render: never, list: always, publishResources: false}`, empty body — never the reserved `url:` key). The standalone pages **courses** (`content/<lang>/courses/_index.md` + menu item), **alumni** (`content/<lang>/alumni/{index.md,people.md}` — keep the Alumni `user_groups` English; fix the `home/alumni-link.md` target to `/<lang>/alumni/`), **slides**, and the root **privacy/terms** pages are likewise **full translations** (Translate-vs-Keep details in `.claude/skills/translate-content/references/field-rules.md`); `scripts/i18n-parity.sh` tracks all of these (a `slides` section + the `SINGLETON_CONFIG` pages). Posts are the ONLY stub-card exception. The four student `user_groups` use the localized forms (so they match `content/<lang>/home/people.md`); `Principal Investigators`/`Alumni *` stay English (People widget doesn't filter them).
- **Translation mechanism & glossary:** run `/project:translate-content <slug> --lang all` (or `--all-missing` to backfill the EN-only backlog). It detects the type, applies the glossary at `.claude/skills/translate-content/references/glossary.md` (neutral Latin American Spanish formal `usted`; Japanese です・ます; ES comma-decimal/space-thousands numbers, JA Western numbers; a DO-NOT-translate list for tags/categories/authors/DOIs/URLs/slugs/journal names), localizes numbers, copies assets, and verifies the build under the pinned Hugo 0.111.3. `scripts/i18n-parity.sh` lists EN items lacking an ES/JA counterpart (exit non-zero on gaps; `--list` emits a TSV worklist); `scripts/hooks/pre-commit` (enable via `git config core.hooksPath scripts/hooks`) reports gaps on commit — report-only until the backlog clears, then flip `GATE=1`.
- **Geolocation:** `netlify/edge-functions/geo-lang.ts` 302-redirects Spanish-speaking countries (Latin America + Spain + Equatorial Guinea) `/ → /es/` and Japan (`JP`) `/ → /ja/` — homepage only, fires once (`geo_seen`), respects the `lang_pref` cookie set by `assets/js/lang-pref.js` (bundled via `params.yaml` `plugins_js`; its `KNOWN` map is `{es, ja}`). `layouts/partials/custom_head.html` adds the `x-default` hreflang. Geo can only be tested on a Netlify deploy preview / `netlify dev`, not `hugo server`.
- **Add another language (e.g. `ko`):** in `languages.yaml` add the block (code/name/weight/menu, omitting Courses); in `config.yaml` add a `content/<lang>` mount, extend the en mount's `excludeFiles` to `'{es,ja,<lang>}/**'`, and (for CJK) keep `hasCJKLanguage: true`; add the country→`/<lang>/` line in `geo-lang.ts` + `<lang>` to its `KNOWN_LANGS`, and `<lang>: 1` in `lang-pref.js`; then `cp -R content/es content/<lang>` and translate each `.md` in place. No template/structural changes. **Hugo build needs ≥0.96** — verify with the pinned 0.111.3 extended binary before pushing.
- **Known minor issue:** thin es post stubs republish the English bundle's small figure/script files under `/es/post/<slug>/` (a few MB; harmless). Publications/projects/events don't leak extra.

# Hugo Version Constraints

- The site requires Hugo **≥ 0.96** (`layouts/section/event.html` uses the `continue` template keyword). `netlify.toml` pins `HUGO_VERSION = 0.111.3` — inside the verified window. **There is no Netlify UI env override** (a previous version of this note wrongly assumed one): on 2026-06-04 the `0.89.4` pin was confirmed to be the actual build version, failing every deploy since the `/event/` commits with `function "continue" not defined`. Bumping the pin to `0.111.3` (commit `ea6a22c`) fixed it and shipped the i18n homepage. Keep this pin in the 0.96–0.119 window; do not revert it.
- Tested/safe window: **0.96–0.119** extended — verified building cleanly on **0.111.3** (local verification binary at `/tmp/hugo-verify/hugo`). Lower bound = `continue`; upper bound ≈ `site.GoogleAnalytics` removal (~0.120) and `paginate` removal (0.128). The 0.100 Blackfriday removal does NOT affect this site (it uses Goldmark). Re-verify Wowchemy v5 template compatibility before moving outside this window.
- Theme minimum: 0.78 (set in theme.toml)
- Hugo 0.91+ requires security policy for `WC_POST_CSS` env var — already configured in `config/_default/config.yaml` under `security.funcs.getenv`
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
