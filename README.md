# carlos-mendez.org

Academic portfolio website for **Carlos Mendez**, Associate Professor of Development Economics at Nagoya University (GSID), Japan. It is published in English, Spanish and Japanese.

**Live site:** <https://carlos-mendez.org/>

This README is the practical guide for the owner and collaborators: how the site is organised, how it looks, and how to add or change things. Detailed references live in [`.claude/docs/`](.claude/docs/README.md), the rules for Claude Code are in [`CLAUDE.md`](CLAUDE.md), and dated history is in [`logs/`](logs/).

## Tech stack

| Component | Detail |
|---|---|
| Static site generator | [Hugo](https://gohugo.io/) **0.111.3 extended**, pinned in `netlify.toml` (must stay within 0.96–0.119) |
| Theme | [Wowchemy](https://wowchemy.com/) v5 as a Hugo module, pinned to commit `fda9f39d872e` (2021-03-24) in `go.mod`, with project forks of several templates |
| Markup | Goldmark (`unsafe: true` for inline HTML), MathJax, Mermaid (`diagram: true`) |
| Styling | Shared palette `assets/css/orbital-palette.css`; homepage `orbital.css` + `orbital-cinema.css`; content pages `orbital-subpages.css` + `assets/scss/custom.scss` |
| Languages | EN `/`, ES `/es/`, JA `/ja/` (separate content trees) |
| Hosting | [Netlify](https://www.netlify.com/): auto-deploys every push to `master`, edge function for language geolocation |
| Analytics | Google Analytics 4 (`G-8H5LPC98XW`, production only, loaded after idle) |
| Comments | Disabled |

## Site structure

The main menu has 12 items. Each one maps to a content folder (or to a homepage section):

| Menu (EN / ES / JA) | Where the files live | What visitors get |
|---|---|---|
| AboutMe / Perfil / プロフィール | homepage section (`data/orbital.json`, `content/authors/admin/`) | `#about` |
| ResearchLab / Laboratorio / 研究室 | homepage section | `#researchLab` |
| Articles / Artículos / 論文 | `content/articles/` | homepage "Recent research" (`#featured`); `/articles/` with search, type and year filters |
| Books / Libros / 著書 | `content/books/` | `/books/` with search, format and year filters |
| Courses / Cursos / コース | `content/courses/` | `/courses/` |
| Presentations / Presentaciones / 講演 | `content/presentations/` | homepage `#talks`; `/presentations/` with search and year filter |
| Software / Software / ソフトウェア | `content/software/` | homepage Software block; `/software/` with search and topic filter |
| WebApps / Apps web / Webアプリ | `content/webapps/` **plus** every tutorial's `web_app/` folder (listed automatically) | `/webapps/` with platform, region and topic filters; cards open the app |
| Data / Datos / データ | `content/data/` | `/data/` with type and region filters |
| Tutorials / Tutoriales / チュートリアル | `content/tutorials/` | homepage `#posts`; `/tutorials/` with topic strips, language chips, sort and search |
| Events / Eventos / イベント | external | <https://lu.ma/cmg> |
| Contact / Contacto / お問い合わせ | homepage footer | `#contact` |

- **Menu files:** `config/_default/menus.yaml` holds the English menu and `config/_default/languages.yaml` holds the Spanish and Japanese menus.
- **Spanish and Japanese copies:** every folder above has counterparts at `content/es/…` and `content/ja/…`.
- **Wowchemy content types:** folder names differ from the theme's types. Each section's `_index.md` sets the type with a `cascade`: `articles` → `publication`, `presentations` → `event`, `tutorials` → `post`.
- **Retired sections and old URLs:**
  - `content/projects/` was retired on 2026-10-08. Only a hidden `ds4ds` bundle remains, kept for reference.
  - Moved pages carry `aliases:`, and `netlify.toml` permanently redirects the old addresses (`/post/…`, `/publication/…`, `/event/…`, `/talk/…`, `/projects/…`) to their new homes.

## Directory structure

```
.
├── config/_default/        config.yaml (modules, mounts, permalinks, outputs) · params.yaml · menus.yaml · languages.yaml
├── content/                English content (Spanish in content/es/, Japanese in content/ja/)
│   ├── articles/           papers (type publication)        ├── books/      books and open online books
│   ├── presentations/      talks (type event)               ├── software/   Python packages
│   ├── tutorials/          tutorials and posts (type post)  ├── webapps/    standalone GEE + Streamlit apps
│   ├── data/               data repositories and portals    ├── courses/    teaching page
│   ├── authors/            people (profiles, avatars)       ├── home/       legacy widgets (people.md and gallery still used)
│   ├── cv/                 LaTeX CV source (excluded from the build)
│   └── projects/           retired; hidden ds4ds only
├── data/                   orbital.json (homepage + footer copy, 3 languages) · tutorial_topics.yaml · themes/nightlights.toml
├── i18n/                   es.yaml, ja.yaml: fixes for theme strings left in English
├── layouts/
│   ├── index.html          standalone homepage
│   ├── section/            list pages: articles, presentations, tutorials, books, software, data, webapps
│   ├── partials/           catalog.html (filterable lists), navbar.html (fork), page_header.html, site_footer.html, orbital-*.html …
│   ├── publication/        single.html (fork)        └── shortcodes/  fullwidth-iframe, fwl/panel/did/sc-lab, …
├── assets/                 css/orbital-*.css · js/orbital*.js · scss/custom.scss · media/
├── static/                 media/CV.pdf · uploads/ · tutorials/ (legacy static files)
├── scripts/                i18n-parity.sh · audit-site.py · audit-nav.cjs · capture-dashboard-screenshots.cjs · hooks/
├── tests/                  orbital.test.cjs · sc-lab.test.cjs
├── netlify/edge-functions/ geo-lang.ts (first visit to / from Spanish-speaking countries or Japan → /es/ or /ja/)
├── netlify.toml            build command, Hugo pin, headers, redirects
└── .claude/                CLAUDE.md companions: docs/ (references), skills/ (Claude Code skills)
```

## Design

The site is dark, quiet and image-led. The full reference is [`.claude/docs/design-system.md`](.claude/docs/design-system.md).

- **Two page systems, one look:**
  - The **homepage** (`layouts/index.html`) is a standalone template with an interactive NASA Earth-at-night globe and a cinematic layer: starfield, orbits, network arcs, scroll reveals, a photo coverflow and an earthrise footer. Its CSS is inlined and its scripts load deferred.
  - **Every other page** uses Wowchemy templates restyled by `orbital-subpages.css`.
- **Palette** (`assets/css/orbital-palette.css`):

  | Background | Panels | Text | Muted text | Borders | Links | Accents |
  |---|---|---|---|---|---|---|
  | `#050a12` | `#0a121d` | `#edf2f6` | `#9baaba` | `#22303e` | blue `#88b9de` | gold `#e9c184` |

  Fonts are the system font stack. There is no light mode; dark mode is fixed on the server.
- **Performance:** the homepage opening finishes in about 0.6 s, the globe starts after the first paint, and every animation has a still fallback (reduced motion, touch, print, no JavaScript).
- **Thumbnails are treated as product imagery.** Each page bundle has a dedicated 16:9 `featured.*`, at least 1280×720. They are never blurred, darkened, tilted or zoomed.
- **Responsive menu:**
  - At 1200px and wider, all 12 items sit on one row.
  - Below 1200px (tablets and phones), the menu collapses into a toggle on both page systems.
  - No page scrolls sideways at any width from 360 to 1440px.
- **Own palettes:** standalone teaching apps, slide decks and figures keep their own designs.

## Translations (EN · ES · JA)

There is **no English fallback**. An item without a Spanish or Japanese copy simply does not appear on `/es/` or `/ja/`. So **whenever you add or change content, update the Spanish and Japanese copies in the same change**:

- **Full translation:** articles, presentations, books, software, data, web apps, authors, every section `_index.md` (filter labels), and standalone pages (courses, alumni, slides, privacy, terms).
- **Short stub cards only:** tutorials. The Spanish or Japanese stub has a translated title and summary, and its card links to the English tutorial.
- **Interface text** must exist in all three languages: menus, filter labels, footer, Tutorials gallery controls, theme strings in `i18n/`.

```bash
/project:translate-content <slug> --lang all     # Claude Code skill: translate one item (glossary + assets)
/project:translate-content --all-missing --lang all
bash scripts/i18n-parity.sh                      # reports any EN item lacking ES/JA (must be 0)
```

Style: Spanish is neutral Latin American with formal *usted*; Japanese uses です・ます. The glossary is `.claude/skills/translate-content/references/glossary.md`, and the mechanics are in [`.claude/docs/i18n.md`](.claude/docs/i18n.md).

## Adding content

Every new item needs its ES and JA copies (see above). Copy the front matter of an existing item in the same folder as a starting point.

| To add… | Do this |
|---|---|
| **Article** | `content/articles/YYYYMMDD-abbreviation/index.md` with title, authors, date, `publication_types`, publication, abstract (one line), tags, DOI/links, plus a 16:9 `featured.*` (and `cite.bib`). Publication types: 1 conference paper, 2 journal article, 3 preprint, 4 report, 6 book chapter, 7 thesis. Books (type 5) go in `content/books/`. The 3 newest papers of types 1–3 appear on the homepage automatically. |
| **Book** | `content/books/<slug>/index.md` with `book_format: print` or `online` (a published book can keep `type: publication` and its citation fields). |
| **Presentation** | `content/presentations/YYYYMMDD-abbreviation/index.md`. `date:` is the talk date (future dates are fine); keep `publishDate` at today or earlier. |
| **Software package** | `content/software/<slug>/index.md` + `featured.*`. The homepage Software block shows the 3 most recently *committed* packages, so committing an update moves a package to the front. |
| **Data resource** | `content/data/<slug>/index.md` with `data_type: repository` or `portal` and `region`. |
| **Web app** | `content/webapps/<slug>/index.md` (`app_url`, `platform`, `region`, `topic`, `_build: {render: never, list: always}`), then add the slug to `APPS` in `scripts/capture-dashboard-screenshots.cjs` and run `node scripts/capture-dashboard-screenshots.cjs --slug <slug>` for the card image. Recipe: [`.claude/docs/webapps.md`](.claude/docs/webapps.md). Tutorial apps (`content/tutorials/<slug>/web_app/index.html`) need no entry. |
| **Tutorial** | `content/tutorials/<slug>/index.md` with categories matching `data/tutorial_topics.yaml` (topic strips), plus a featured image. Usually written with the Claude Code skills below. |
| **Author** | `content/authors/firstname-lastname/_index.md` + `avatar.jpg`, or use `/project:update-author-profile`. |
| **New filter value** (e.g. a new region) | Add the option to the `filters:` list in the section `_index.md` **in all three languages**. Options only appear when an item uses them. |
| **Menu item** | Edit `menus.yaml` and `languages.yaml`. Keep labels short: at 1200px there is only about 15–25px to spare. Run `node scripts/audit-nav.cjs` afterwards. |

Writing conventions:
- Use em dashes (—).
- In math-enabled posts, write a literal dollar sign as `\\$`.
- Output blocks use ```` ```text ````.
- Every iframe gets `loading="lazy"`.
- No emojis in front matter.

## Local development

```bash
H="$HOME/Library/Application Support/Hugo/0.111.3/hugo"   # the pinned extended binary
"$H" server --disableFastRender                            # http://localhost:1313/
"$H" --gc --minify --buildFuture                           # production build into public/
```

- **Hugo binaries:** do not use the older Hugo binaries (0.84.2, 0.89.4) in the same folder, because the site needs Hugo ≥ 0.96.
- **Dev-server crash:** if the dev server crashes after many files change at once, restart it.
- **Harmless warning:** the build always prints a `.Path` deprecation warning from the theme.

## Quality checks

Run these before pushing larger changes. The full procedure is in [`.claude/docs/site-audit.md`](.claude/docs/site-audit.md).

```bash
node --test tests/*.cjs                       # globe lifecycle + lab data tests
bash scripts/i18n-parity.sh                   # translations complete
python3 scripts/audit-site.py                 # broken links, anchors, language links, redirects
python3 scripts/audit-site.py --old-ref <commit>   # every URL of an older version still resolves
node scripts/audit-nav.cjs                    # menu + horizontal overflow at 360–1440px, EN/ES/JA
```

**Updating the theme** (`./update_wowchemy.sh`) is a deliberate decision. Several Wowchemy templates are forked (navbar, article page, list pages, header, footer). After an update, re-check each one against [`.claude/docs/theme-overrides.md`](.claude/docs/theme-overrides.md) and run the checks above.

## Deployment

- **Deploy:** every push to `master` triggers Netlify. It runs `hugo --gc --minify --buildFuture -b $URL` with Hugo 0.111.3 (from `netlify.toml`; there is no UI override), with the resource-cache plugin enabled.
- **Redirects** combine two sources: Hugo `aliases:` (written to `_redirects`, which take precedence) and the `[[redirects]]` rules in `netlify.toml`.
- **Language geolocation:** `netlify/edge-functions/geo-lang.ts` sends first-time visitors to `/` from Spanish-speaking countries or Japan to `/es/` or `/ja/`. A visitor's own language choice (the `lang_pref` cookie) always wins.

## Components

- **Catalog lists** (`layouts/partials/catalog.html`): the filterable rows on Books, Software, Data and WebApps. Dropdowns are defined in each section's `_index.md` (`filters:`, `year_filter`).
- **Image-first page header** (`layouts/partials/page_header.html`): the featured image sits above the title. Buttons come from `links:` front matter.
- **`fullwidth-iframe` shortcode:** `{{</* fullwidth-iframe src="…" height="800px" */>}}` embeds a viewport-wide iframe.
- **Learning components:** predict, solution, misconception and proof cards (`custom.scss` §24), plus the interactive labs `fwl-lab`, `panel-lab`, `did-lab` and `sc-lab`. See [`.claude/docs/learning-components.md`](.claude/docs/learning-components.md).
- **Post resource buttons** (Slides PDF/HTML, Quarto `.zip`) and **AI podcast player:** [`.claude/docs/post-resource-buttons.md`](.claude/docs/post-resource-buttons.md), [`.claude/docs/ai-podcast-player.md`](.claude/docs/ai-podcast-player.md).
- **AhaSlides decks** (interactive audience layer over real slide images): [`.claude/docs/ahaslides.md`](.claude/docs/ahaslides.md).
- **CV** (English only):
  - The source is `content/cv/main.tex` (moderncv), excluded from the build.
  - Build it with `cd content/cv && latexmk -pdf main.tex`, then copy `main.pdf` to `static/media/CV.pdf`.
  - `/project:update-cv` adds missing publications, talks and software from the site.

## Claude Code skills

There are 20 skills in `.claude/skills/<name>/SKILL.md` (older ones in `.claude/skills/legacy/`). They compose into a pipeline: **script → results report → blog post → infographic → web app / slides**. Each skill confirms the scope first, then does the work, then offers follow-ups.

| Stage | Write | Review (read-only) |
|---|---|---|
| Analysis script (Python/Stata/R) | `/project:write-script <topic> dataset: <data>` | `/project:review-script <slug>` |
| Results report | `/project:write-results-report <slug>` | `/project:review-results-report <slug>` |
| Blog post (notebook-style, journal-style abstract) | `/project:write-post <slug>` | `/project:review-post <slug> [focus: …]` |
| Infographic prompt | `/project:write-infographic <slug>` | `/project:review-infographic <slug>` |
| Interactive web app (static D3, `web_app/`) | `/project:write-app <slug>` | `/project:review-app <slug>` |
| Slide deck (Quarto reveal.js, `slides/`) | `/project:write-slides <slug>` | `/project:review-slides <slug>` |
| Quarto notebook (R/Python/Stata) | `/project:write-quarto-notebook <slug>` | — |
| Quarto notebook (Python, double-click `.zip` bundle) | `/project:write-quarto-notebook-python <slug>` | — |
| Data dictionary (HTML + Stata pipeline) | `/project:write-data-dictionary <slug>` | — |

Standalone skills:
- `translate-content`: ES/JA translation.
- `update-author-profile`: trilingual author profiles.
- `update-cv`: CV sync.
- `write-paper-infographic`: an infographic brief for a paper.
- `draw-sketchy-diagram`: hand-drawn style diagrams.

Example pipeline:

```
/project:write-script double machine learning dataset: DS4Bolivia
/project:write-results-report python_doubleml
/project:write-post python_doubleml
/project:write-infographic python_doubleml
/project:write-app python_doubleml
/project:review-post python_doubleml
```

## Legacy homepage widgets

`content/home/*.md` (slider, about, featured, talks, projects, posts, contact, …) are the old Wowchemy widgets. They are kept for reference, and they **no longer control the homepage**. Two of their files are still read: `people.md` (student groups for the students section) and `gallery/` (photo carousel).
