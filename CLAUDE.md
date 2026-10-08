# Project Overview

Academic portfolio website for Carlos Mendez (carlos-mendez.org): Hugo + Wowchemy v5 (Hugo module pinned to commit 20210324 in `go.mod`), Goldmark with `unsafe: true`, deployed on Netlify (push to `master` = deploy). Trilingual EN/ES/JA. **Docs map:**
- `README.md`: human guide.
- `.claude/docs/`: recipes and references, loaded on demand; index in `.claude/docs/README.md`.
- `logs/`: dated history. Add or update a log entry for significant changes.

# Key Commands

- Hugo: `H="$HOME/Library/Application Support/Hugo/0.111.3/hugo"` (v0.111.3 extended = the `netlify.toml` pin). **Never use the 0.84.2 / 0.89.4 binaries in the same folder:** they fail on `continue` (Hugo ≥0.96 required).
- Dev server: `"$H" server --disableFastRender`. Production build: `"$H" --gc --minify --buildFuture`.
- Tests: `node --test tests/*.cjs` (globe lifecycle; sc-lab data). Translations: `bash scripts/i18n-parity.sh` (must report 0 missing).
- Audit after structural changes: `python3 scripts/audit-site.py [--old-ref <commit>]` (links, anchors, language links, redirects) and `node scripts/audit-nav.cjs` (menu and overflow at six widths). See `.claude/docs/site-audit.md`.
- `./update_wowchemy.sh` updates the theme; then re-check every fork in `.claude/docs/theme-overrides.md`.

# Site Map (menu → folder)

| Menu (EN) | Folder | URL / list page |
|---|---|---|
| AboutMe, ResearchLab, Contact | homepage sections (`data/orbital.json`, `content/home/`, `content/authors/admin/`) | `#about`, `#researchLab`, `#contact` |
| Articles | `content/articles/` (type `publication`) | homepage `#featured`; `/articles/` (search, type, year) |
| Books | `content/books/` | `/books/` (format, year) |
| Courses | `content/courses/` | `/courses/` |
| Presentations | `content/presentations/` (type `event`) | homepage `#talks`; `/presentations/` (search, year) |
| Software | `content/software/` | `/software/` (topic) |
| WebApps | `content/webapps/` + every tutorial `web_app/index.html` (auto-listed) | `/webapps/` (platform, region, topic) |
| Data | `content/data/` | `/data/` (type, region) |
| Tutorials | `content/tutorials/` (type `post`) | homepage `#posts`; `/tutorials/` (topic strips) |
| Events | external | `https://lu.ma/cmg` |

- **Menus:** `config/_default/menus.yaml` (EN), `config/_default/languages.yaml` (ES/JA, URLs prefixed `/es/`, `/ja/`). Twelve items, so keep labels short (see Design).
- **Types:** folder names differ from Wowchemy types. Each section `_index.md` sets the type with `cascade: [{_target: {kind: page}, type: publication|event|post}]`. Permalinks are `/articles/<slug>/`, `/presentations/<slug>/`, `/tutorials/<slug>/`.
- **Retired:** `content/projects/` (only the hidden `ds4ds`, `_build: {render: never, list: never, publishResources: false}`). `static/tutorials/` holds legacy static files.
- **Redirects:**
  - Moved items carry `aliases:`. Wowchemy writes them to `_redirects`, which **takes precedence over** the `netlify.toml` rules.
  - `netlify.toml` 301s: `/post/*`, `/publication/*`, `/event/*`, `/talk/*` → new sections; `/projects/` → `/software/`; `/projects/ds4ds/*` → `/data/`; old book publication URLs → `/books/…`. Same for `/es/` and `/ja/`.
  - Specific rules must come before the splat rules.

# Content Rules

- **Naming:**
  - Articles: `content/articles/YYYYMMDD-abbreviation/index.md`.
  - Presentations: `content/presentations/YYYYMMDD-abbreviation/index.md`.
  - Tutorials: `content/tutorials/descriptive-slug/index.md`.
  - Books, Software, Data, WebApps: `content/{books,software,data,webapps}/<slug>/index.md`.
  - Authors: `content/authors/firstname-lastname/_index.md`.
  - **Folder names must not contain spaces or trailing spaces.**
- **Front matter:** YAML everywhere.
  - Articles require title, authors, date, `publication_types` (0=Uncategorized, 1=Conference paper, 2=Journal article, 3=Preprint, 4=Report, 5=Book, 6=Book section, 7=Thesis, 8=Patent), publication, abstract, tags.
  - `admin` = Carlos Mendez.
  - `featured: true` is legacy only; the homepage picks papers by date.
  - Data science posts use `image.placement: 3`; Colab/script/notebook buttons go in `links:` front matter, not the body.
  - Mermaid diagrams: add `diagram: true`.
- **Presentations:** `date:` (the talk date) is required, and future dates are allowed (builds use `--buildFuture`). Keep `publishDate:` at now or earlier; a future `publishDate` hides the event.
- **Catalog sections:** listed by `layouts/section/<name>.html` through `partials/catalog.html`. Dropdowns come from `filters:` (plus an optional `year_filter`) in each section `_index.md`, and **a new filter value needs its option in all three `_index.md` files**.
  - Books: `book_format: print|online`; former type-5 publications keep `type: publication`. Book chapters (type 6) stay in Articles.
  - Data: `data_type: repository|portal`, `region`.
  - WebApps: `app_url`, `platform: gee|streamlit`, `region`, `topic` (an id from `data/tutorial_topics.yaml`), `_build: {render: never, list: always}` (the card opens the app). GEE source URLs go only in a front-matter comment, never as a public link. Recipe: `.claude/docs/webapps.md`.
- **Style:**
  - No emojis in front matter or config.
  - Abstracts are single-line YAML strings.
  - Use em dashes (—), not `--`.
  - Every iframe gets `loading="lazy"`.
  - Output blocks use ```` ```text ````.
  - Prefer `.webp` for images in `assets/media/`.
  - Icons: `icon_pack` `fas` / `fab` / `ai` (https://fontawesome.com/search).
- **Math and currency:** in math-enabled posts write `\\$` for a literal `$` (MathJax `processEscapes: true` via `assets/js/mathjax-config.js`); notebooks use `\$`; `&#36;` does not work. Causal posts state the estimand (ATE/ATT) for each method and distinguish randomized from observational framing.

# Internationalization (REQUIRED)

EN at `/` (`content/`), ES at `/es/` (`content/es/`, neutral Latin American Spanish, formal *usted*), JA at `/ja/` (`content/ja/`, です・ます). There is no English fallback, so untranslated items do not appear. **The same change that adds or materially edits content must also update its ES + JA counterparts:**
- **Full translation:** articles, presentations, books, software, data, webapps, authors, every section `_index.md` (filter labels, `ui:`), and standalone pages (courses, alumni, slides, privacy, terms).
- **Stub card only (tutorials):** translated `title` + `summary`, `card_url: "/tutorials/<slug>/"`, `_build: {render: never, list: always}`, empty body. Stubs never render, so translated pages link to the English tutorial.
- **UI text:** must exist in all three languages (`data/orbital.json`, `i18n/{es,ja}.yaml`, section `_index.md` params, per-language `copyright`). Use `time.Format` for dates.
- **Tools:** `/project:translate-content <slug> --lang all` (glossary + assets); `scripts/i18n-parity.sh`. Details: `.claude/docs/i18n.md`.

# Design (summary — full reference: `.claude/docs/design-system.md`)

- **Two page systems, one palette:**
  - The homepage is the standalone `layouts/index.html` (copy in `data/orbital.json`; CSS `orbital*.css` inlined; JS `orbital*.js` deferred).
  - Content pages are Wowchemy plus `custom_head.html` → `orbital-palette.css` + `orbital-subpages.css`, with components in `assets/scss/custom.scss`.
- **Tokens:** bg `#050a12`, panel `#0a121d`, ink `#edf2f6`, muted `#9baaba`, line `#22303e`, blue `#88b9de`, gold `#e9c184`; system font stack.
- **Dark mode:** dark only, rendered on the server (`day_night: false`). Keep `data/themes/nightlights.toml` in sync with the tokens.
- **Own palettes:** standalone apps, slide decks, figures and syntax highlighting keep theirs.
- **Homepage guardrails:**
  - Opening under about 0.6 s; never hide content already on screen.
  - WebGL starts after the first paint; never preload the globe textures.
  - Every cinematic effect has a still fallback.
  - Run `node --test tests/orbital.test.cjs` after globe changes.
- **Homepage sections:**
  - Recent research = the 3 newest articles of types 1–3 dated ≤ now. Each row shows the article-page buttons (minus Cite) as pills from `partials/orbital-paper-links.html`, and its `summary:` should be plain language for a general audience.
  - The Software block (anchor `#projects`) = the 3 most recently **committed** `software` bundles (`.ByLastmod`). Committing a package change moves it to the front.
- **Menu:** collapses below **1200px** on both systems. The homepage uses `orbital.css`; content pages use the forked `navbar-expand-xl` (`custom.scss` §7/§7a). From 1200px up it is one `nowrap` row, with only about 13–25px of spare room at 1200px. **Re-run `audit-nav.cjs` after any menu or label change.**
- **No horizontal page scroll** at 360–1440px. Wide math and code scroll inside their own boxes.
- **Thumbnails:** they are product imagery. Use dedicated 16:9 `featured.*` files (≥1280×720) with the `orbital-thumbnail.html` / `orbital-card.html` WebP sizes. Never use blur, overlays, tilt or zoom on thumbnails. Full standard in `design-system.md` §5.

# Components and Recipes

- **WebApps:** "Add web app: `<App URL>` — `<English title>`" → `.claude/docs/webapps.md` (bundle + ES/JA + `scripts/capture-dashboard-screenshots.cjs`).
- **AI Podcast Player:** "Add AI Podcast to `<post slug>`" → `.claude/docs/ai-podcast-player.md`.
- **Post resource buttons** (Slides PDF/HTML, tutorial `.zip`; relative vs absolute URL rules) → `.claude/docs/post-resource-buttons.md`.
- **AhaSlides deck:** "Make an AhaSlides deck for `<post slug>`". Content slides are **images of the real slides** (never API text types or `content-v2`). → `.claude/docs/ahaslides.md`.
- **Learning components and labs** (`.learn-card` in `custom.scss` §24; `fwl-lab`, `panel-lab`, `did-lab`, `sc-lab` shortcodes + JS/CSS; `node --test tests/sc-lab.test.cjs`): "Add learning components to `<post slug>`" → `.claude/docs/learning-components.md`.
- **Other components:**
  - `layouts/partials/page_header.html` (image above the title).
  - The `fullwidth-iframe` shortcode. If a new page type does not break out of the margins, add its container to the overflow reset in `custom.scss`.
- **CV (English only):**
  - `content/cv/main.tex` (moderncv) is excluded from the build. Compile it with `cd content/cv && latexmk -pdf main.tex`, then copy the PDF to `static/media/CV.pdf`.
  - `/project:update-cv` syncs it additively.
  - Commented-out items (such as Bolivia112) are kept as references only.

# Skills (`.claude/skills/<name>/SKILL.md`; legacy in `.claude/skills/legacy/`)

Pipeline: script → results report → post → infographic → web app. Each skill follows the same steps: confirm scope, execute, offer follow-ups.

| Stage | Write | Review |
|---|---|---|
| Script / Results report / Blog post | `write-script` / `write-results-report` / `write-post` | `review-script` / `review-results-report` / `review-post` |
| Infographic / Web app (static D3) / Slides (Quarto reveal.js) | `write-infographic` / `write-app` / `write-slides` | `review-infographic` / `review-app` / `review-slides` |
| Quarto notebook (R/Py/Stata; Python bundle) / Data dictionary | `write-quarto-notebook`, `write-quarto-notebook-python` / `write-data-dictionary` | — |

- **Standalone skills:** `translate-content`, `update-author-profile`, `update-cv`, `write-paper-infographic` (paper infographic brief), `draw-sketchy-diagram`.
- **Reference posts:**
  - Python: `python_ml_random_forest`, `python_dowhy`, `python_fwl` (dark figures, learning components, lab), `python_pyfixest`, `python_esda2`, `python_mgwr`.
  - Stata: `stata_rct`.
- **Large PDFs:** delegate to Explore agents and extract only the relevant 5–15 pages.

# Gotchas (learned the hard way)

- **Hugo HTML escaping:** an attribute *name* built in a template from a value such as `type` becomes `data-zgotmplz`. Emit generated attributes with `printf … | safeHTMLAttr` (see `catalog.html`).
- **Theme lookups by section name** (`site.GetPage "section" "publication"`) break after folder renames; `.Type` lookups survive. Grep new theme templates and see `.claude/docs/theme-overrides.md`.
- **`_build: {render: never}` still publishes bundle resources;** add `publishResources: false` to keep them out.
- **Folder renames:** also rename the paths in `.gitignore` (it has no extension, so search-and-replace tools skip it). Otherwise `git add -A` stages ignored PDFs, venvs and nested repos. Check `git ls-files -ci --exclude-standard` before committing.
- **Hugo dev server:** it can panic when many files change while it serves (screenshot scripts, mass moves). Restart it, and trust the production build.
- **Width tests:** at non-100% zoom or with display scaling, resizing the window does not give an exact viewport. Use Playwright viewports or fixed-width iframes.
- **Section titles:** keep each section `_index.md` `title` equal to its menu label (Articles, Tutorials, …).

# Hugo Version Constraints

- Pin `HUGO_VERSION = 0.111.3` in `netlify.toml`. There is no Netlify UI override, so this pin is the build. Keep it in the **0.96–0.119** window: `continue` in `section/presentations.html` needs ≥0.96; `site.GoogleAnalytics` disappears around 0.120 and `paginate` in 0.128.
- The local binary at `$HOME/Library/Application Support/Hugo/<version>/hugo` matches the pin. Update **Key Commands** if it changes.
- The theme minimum is 0.78. `WC_POST_CSS` needs the `security.funcs.getenv` policy, which is set in `config.yaml`. Updating Wowchemy is a separate decision from updating Hugo.
- **Netlify:** builds run `hugo --gc --minify --buildFuture -b $URL`, with the cache plugin on. `netlify/edge-functions/geo-lang.ts` sends a first visit to `/` from Spanish-speaking countries or Japan (302) to `/es/` or `/ja/`.
