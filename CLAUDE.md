# Project Overview

Academic portfolio website for Carlos Mendez (carlos-mendez.org). Built with Hugo + Wowchemy v5 theme, deployed on Netlify.

See `README.md` for human-facing documentation of the directory structure, tech stack, and content conventions.

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

## Projects widget ordering (most-recently-updated first)

The homepage Projects widget (`content/home/projects.md` and its `content/es/` + `content/ja/` counterparts) renders via the `showcase` shortcode (`layouts/shortcodes/showcase.html`), which sorts the `projects` section by `.ByLastmod.Reverse` — most-recently-updated first, where `.Lastmod` is the git commit date of the project's `index.md` (`enableGitInfo: true` in `config/_default/config.yaml`, mirrored by `HUGO_ENABLEGITINFO=true` in `netlify.toml`; falls back to the `date` front matter when no git info). **Convention: whenever you add or edit a project under `content/projects/<slug>/` (plus its ES/JA counterparts), committing the change automatically makes that project appear FIRST in the homepage Projects widget — no manual `date`/`weight` bump needed.** This mirrors the Posts & Tutorials teaser (`tutorial-teaser.html`, `.ByLastmod.Reverse`). The same `showcase` shortcode also renders the Talks/Presentations widget (`content/home/talks.md`, `type=event`), which intentionally keeps `date`-descending order (talk date) — the projects-only sort is guarded by `if eq $section "projects"`.

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
3. Dashboard gallery card grid (`.dashboard-gallery`/`.dashboard-card`, 3/2/1-column responsive + dark mode; the legacy `.dashboard-entry` collapsible styling is retained but unused — see **Dashboards gallery**)
4. Notebook-style post styling (code blocks, figures, tables, blockquotes, headings, learning objectives)
5. Python syntax highlighting colors
6. Left-side Table of Contents

When adding new page types that use the fullwidth-iframe shortcode, check that ancestor containers have `overflow: visible`. If the iframe doesn't break out of margins, the likely fix is adding the new container class to the overflow reset in custom.scss.

## Dashboards gallery (project page)

The dashboards project page (`content/projects/dashboards/index.md` + its `content/es/` and `content/ja/` counterparts) renders a **responsive gallery of screenshot cards** — each card is a thumbnail that links out to the published Google Earth Engine app in a new tab. (This replaced the old collapsible `<details>`/`fullwidth-iframe` embeds on 2026-06-15; see `logs/2026-06-15-dashboards-gallery-view.md`.)

**Architecture (two shortcodes + a capture script):**
- `{{</* dashboard-gallery */>}} … {{</* /dashboard-gallery */>}}` (`layouts/shortcodes/dashboard-gallery.html`) — paired wrapper; emits `<div class="dashboard-gallery">` and renders the nested cards via `.Inner | safeHTML` (so the cards stay inside the grid regardless of Goldmark HTML-block parsing).
- `{{</* dashboard-card title="…" cite="…" url="…" image="…" */>}}` (`layouts/shortcodes/dashboard-card.html`) — one card. Processes the bundle screenshot with `.Fill "800x450 Center webp"` (same idiom as `layouts/partials/tutorial_card.html`), links out `target="_blank" rel="noopener"`, and **localizes the "Access App" label itself** via `site.Language.Lang` (en `Access App` / es `Acceder a la app` / ja `アプリを開く`) — so the markdown stays language-agnostic for that string. Falls back to a placeholder tile if the image is missing.
- Thumbnails are generated by `scripts/capture-dashboard-screenshots.cjs` (Playwright headless Chromium): it loads each public GEE app, waits for the map to paint, and writes a 16:9 **JPEG (q82)** to `content/projects/dashboards/screenshots/<slug>.jpg`, then mirrors it into the ES/JA bundles (page-bundle resources don't cross languages; the app UI is English so one capture serves all three). Hugo downsizes each to an 800×450 webp at render.
- CSS lives in the "Dashboard gallery card grid" section of `assets/scss/custom.scss` (3/2/1-column responsive + dark mode). The legacy `.dashboard-entry`/`<details>` CSS and the `fullwidth-iframe` shortcode remain (used elsewhere) but the dashboards page no longer uses them.

**GEE source-code link is NOT shown publicly.** The published "Access App" link is the only visible link on a card. The app's underlying Earth Engine **source code** link must NOT be rendered — preserve it as an HTML comment on its own line **directly under the corresponding `{{</* dashboard-card */>}}` call**: `<!-- Source code (GEE): https://code.earthengine.google.com/<id>?hideCode=true -->`. Apply in all three bundles. Not every app has one (the two annual VIIRS apps don't). (`--minify` strips comments from the production HTML; the point is to keep the URL in source, not to make it a hard secret.)

**When the user says "Add dashboard app: `<Access App URL>` — `<English title>`"** (the typical input is the published `…/view/<slug>` URL plus an English title), do the following — defaulting the citation author to Carlos Mendez and asking only if a **co-author** or a **GEE source-code URL** applies:

1. **Slug** = the last path segment of the Access App URL (`…/view/<slug>`); the screenshot filename is `<slug>.jpg`.
2. Add `{ slug: "<slug>" }` to the `APPS` array in `scripts/capture-dashboard-screenshots.cjs` (the single source of truth). The `url` defaults to `https://carlos-mendez.projects.earthengine.app/view/<slug>`; pass an explicit `url` only if the host/form differs (then choose a matching `image` name).
3. Capture the screenshot: `node scripts/capture-dashboard-screenshots.cjs --slug <slug>` (writes the JPEG into all three bundles; needs Playwright — `npx playwright install chromium` if missing). **Eyeball the result**; if the app opens on a spinner/intro panel, re-run with a larger `--wait <ms>` (default 10000).
4. Add a `{{</* dashboard-card */>}}` call at the **TOP** of the grid (newest first — just under `{{</* dashboard-gallery */>}}`) in `content/projects/dashboards/index.md`: `title` = the English title; `cite` = `"Mendez, C. (<year>). Google Earth Engine Application."` (prepend co-authors if given, e.g. `"Kanyama, Y., & Mendez, C. (<year>). …"`); `url` = the Access App URL; `image` = `"<slug>.jpg"`. If a GEE source URL was provided, add the `<!-- Source code (GEE): … -->` line directly under that card.
5. Mirror the card at the **TOP** of the grid in `content/es/projects/dashboards/index.md` and `content/ja/projects/dashboards/index.md`, with `title` + `cite` **translated** (ES = neutral Latin American Spanish, formal `usted`, citation suffix `"Aplicación de Google Earth Engine."`; JA = です・ます, suffix `"Google Earth Engine アプリ。"`) per `.claude/skills/translate-content/references/glossary.md`. Keep `url`/`image` and the GEE comment **identical** across languages; the shortcode handles the "Access App" label.
6. **Verify**: build with the pinned Hugo (0.96–0.119 window) and confirm the grid renders, the new webp thumbnail is present, the link opens in a new tab, no `<iframe>` exists, and all three languages are correct. Then commit the `APPS` edit, the 3× `index.md`, and the 3× `screenshots/<slug>.jpg` together (committing also surfaces the project in the homepage Projects widget via its git-date sort).

**Re-capture / fix a thumbnail**: `node scripts/capture-dashboard-screenshots.cjs --slug <slug>` regenerates just that one across all bundles — use it whenever an app changes, or after a previously-broken app is fixed on the GEE side (e.g. on 2026-06-15 the two annual VIIRS apps were re-shot once their `viirs_like_annual` asset became publicly accessible).

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

- `content/post/python_did_industrial_park/` (2026-06-12)
- `content/post/python_dynamic_panel/` (2026-06-11)
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

Sixteen skills: twelve organized as Write/Review pairs across six artifact stages (the slide deck gained its `review-slides` partner), plus four standalone companion skills (`write-quarto-notebook` for R/Python/Stata with a lighter chunk-time install pattern, `write-quarto-notebook-python` for Python-only with a friction-free hermetic-venv bundle pattern, `translate-content` — the trilingual ES/JA translator documented in the Internationalization (i18n) section below — and `update-author-profile` for tri-lingual author-profile edits/creation). Each skill excels at one thing. Skills are independent (can be invoked standalone) but compose naturally into a pipeline: script -> results report -> blog post -> infographic -> web app. All skills follow a three-phase interaction pattern: (1) confirm scope, (2) execute, (3) offer follow-ups. Skills use progressive disclosure via `references/` subdirectories. Legacy skills are preserved at `.claude/skills/legacy/` for reference.

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

## Shared conventions

- Site color palette: steel blue `#6a9bcc`, warm orange `#d97757`, near black `#141413`, teal `#00d4c8`
- Dark theme palette: `#0f1729`, `#1f2b5e`, `#c8d0e0`, `#e8ecf2`
- Currency dollar signs: `\\$` in `index.md` (MathJax-enabled), `\$` in notebook
- Output blocks: use ` ```text ` (not bare ` ``` `) to prevent highlight.js auto-detection coloring
- Causal posts: explicitly state estimand (ATE/ATT) for each method; distinguish randomized vs observational framing
- PDF reference handling: delegate large PDFs to Explore agents; extract only relevant pages (5--15); clean up before committing
- Reference posts (Python): `content/post/python_ml_random_forest/index.md` (ML), `content/post/python_dowhy/index.md` (causal inference), `content/post/python_fwl/index.md` (dark theme figures, simulated data), `content/post/python_pyfixest/index.md` (panel data, fixed effects, dark theme figures), `content/post/python_esda2/index.md` (ESDA, spatial autocorrelation, LISA), `content/post/python_mgwr/index.md` (MGWR, spatially varying coefficients)
- Reference posts (Stata): `content/post/stata_rct/index.md` (RCT with panel data, RA/IPW/DR/DiD/DRDID, Mermaid diagrams, equations with analogies)

## Skills index

Each skill's full documentation (invocation, examples, reference files, conventions) lives in its own `SKILL.md` and is loaded when the skill is invoked — only this one-line index belongs in `CLAUDE.md`.

- `write-script` — `.claude/skills/write-script/SKILL.md` — write and execute a data science script (Python/Stata/R); produces script, execution log, and PNG figures.
- `review-script` — `.claude/skills/review-script/SKILL.md` — 8-dimension scored review of a script (read-only).
- `write-results-report` — `.claude/skills/write-results-report/SKILL.md` — execute a script and produce `results_report.md` with structured interpretations.
- `review-results-report` — `.claude/skills/review-results-report/SKILL.md` — verify results-report accuracy against script output (read-only).
- `write-post` — `.claude/skills/write-post/SKILL.md` — write a notebook-style blog post (`index.md`); enforces `## Abstract`, sandwich pattern, 8+ interpretations, LaTeX escaping.
- `review-post` — `.claude/skills/review-post/SKILL.md` — 13-dimension scored review of a post with verdict (read-only).
- `write-infographic` — `.claude/skills/write-infographic/SKILL.md` — generate a chalkboard-style infographic prompt (full + negative + condensed + panel reference data).
- `review-infographic` — `.claude/skills/review-infographic/SKILL.md` — cross-check infographic numbers against the source post (read-only).
- `write-app` — `.claude/skills/write-app/SKILL.md` — generate a 4-tab interactive D3 web app for a post; interview-driven, ships to `content/post/<slug>/web_app/`.
- `review-app` — `.claude/skills/review-app/SKILL.md` — 10-dimension Playwright-driven audit of a generated web app (read-only).
- `write-quarto-notebook` — `.claude/skills/write-quarto-notebook/SKILL.md` — generate a `tutorial.qmd` for an R/Python/Stata post (lighter chunk-time install pattern).
- `write-quarto-notebook-python` — `.claude/skills/write-quarto-notebook-python/SKILL.md` — Python-only friction-free Quarto bundle (hermetic `.venv` + one-click render wrappers + `<slug>.zip`).
- `write-slides` — `.claude/skills/write-slides/SKILL.md` — generate a branded Quarto reveal.js deck for a post; interview-driven, ships to `content/post/<slug>/slides/`.
- `review-slides` — `.claude/skills/review-slides/SKILL.md` — read-only 10-dimension scored audit of a write-slides deck (source fidelity, conceptual/technical correctness, title↔body consistency, readability & simplicity, typos, design adherence, branding integrity, accessibility, deliverables); static smoke test + headless browser pass; writes `slides/SLIDES_REVIEW.md`.
- `translate-content` — `.claude/skills/translate-content/SKILL.md` — trilingual ES/JA translator (see Internationalization (i18n) section below).
- `update-author-profile` — `.claude/skills/update-author-profile/SKILL.md` — edit/create an author profile with ES + JA counterparts kept in sync.

Legacy skills are preserved at `.claude/skills/legacy/` for reference.


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
