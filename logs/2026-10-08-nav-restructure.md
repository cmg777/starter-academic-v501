# 2026-10-08 — Navigation restructure: Articles, Books, Software, WebApps, Data, Tutorials

## What changed

**Main navigation (EN/ES/JA).** The menu is now AboutMe, ResearchLab, Articles, Books,
Courses, Presentations, Software, WebApps, Data, Tutorials, Events, Contact
(`config/_default/menus.yaml`, `config/_default/languages.yaml`). Articles,
Presentations and Tutorials still scroll to their homepage sections. Books,
Software, WebApps and Data open the new section pages. Projects and Students left the
menu, but the homepage sections are unchanged apart from the former Projects block.

**Folders match the menu.** Content folders were renamed in all three languages, along
with their URLs:

| Nav item | Folder | URL |
|---|---|---|
| Articles | `content/articles/` (was `publication/`) | `/articles/` |
| Books | `content/books/` (new) | `/books/` |
| Courses | `content/courses/` | `/courses/` |
| Presentations | `content/presentations/` (was `event/`, URLs were `/talk/`) | `/presentations/` |
| Software | `content/software/` (new) | `/software/` |
| WebApps | `content/webapps/` (new) + every tutorial `web_app/` | `/webapps/` |
| Data | `content/data/` (new) | `/data/` |
| Tutorials | `content/tutorials/` (was `post/`) | `/tutorials/` |

The Wowchemy content types are unchanged (`publication`, `event`, `post`). A `cascade`
with `_target: {kind: page}` in each section `_index.md` sets them, so single
templates, `page_header.html` and `li_compact.html` behave as before. The section
templates were renamed to `layouts/section/{articles,presentations,tutorials}.html`.
Every hard-coded `"Section"` lookup now uses the new names (homepage, `orbital-talks`,
`publication_showcase`, `tutorial-teaser`, `showcase`). A mechanical rewrite updated
about 970 files that contained `content/post/`-style paths or root-relative
`/post/`, `/publication/`, `/event/` and `/talk/` links. `logs/` was left untouched.

**New catalog pages.** `layouts/partials/catalog.html` provides a search box plus
dropdowns defined by `filters:` in each section `_index.md`, and an optional
`year_filter`. It renders the `/articles/`-style `.cz-showcase` rows. It is used by
`layouts/section/{books,software,data,webapps}.html`.
- Books (5): the three former type-5 publications (`essays-productivity`,
  `convergence-clubs`, and `metricsai`, which was merged with the old metricsAI
  project) plus `ccm` and `intro2causal`. Filters are format and year. Books no longer
  appear on `/articles/`. Book chapters (type 6) stay in Articles.
- Software: expdpy, geometrics, scspill. The filter is tag.
- Data: ds4bolivia, indonesia514, gdo-cambodia. Filters are type and region.
- WebApps: 22 standalone bundles, which are the 9 former dashboards-gallery GEE apps,
  the 7 GEE apps that only tutorials linked to, and the 6 package Streamlit apps.
  They use `_build: render: never` and their cards open `app_url`. The page also
  auto-lists every tutorial that ships `web_app/index.html` (70). Filters are
  platform, region and topic. Topic uses the ids in `data/tutorial_topics.yaml`.
  Thumbnails come from `scripts/capture-dashboard-screenshots.cjs`, which now writes
  `content/{,es/,ja/}webapps/<slug>/featured.jpg`.

**Homepage.** The `#projects` block now shows the three most recently updated
Software packages, under the heading "Software" (`data/orbital.json`, all three
locales).

**Retired.** `content/projects/` keeps only the hidden `ds4ds` bundle
(`_build: never`). Bolivia112 is commented out of `content/cv/main.tex` as a reference
only, and `static/media/CV.pdf` was rebuilt. `static/post/` became `static/tutorials/`.

**Redirects.** Moved items carry `aliases` (written into `_redirects` by Wowchemy,
which takes precedence). `netlify.toml` adds forced 301s for `/projects/` →
`/software/` and for `/post/*`, `/publication/*`, `/event/*` and `/talk/*` to the new
sections, plus their `/es/` and `/ja/` variants.

## Known external impact

GitHub file paths changed (`content/post/…` → `content/tutorials/…`). Any Colab badge
or link outside this repo that points at the old GitHub path will 404 until it is
updated; links inside the repo were rewritten.

## Follow-up: three untranslated articles

`20220808-ARC`, `20230502-APJRS` and `20230802-SCED` had a trailing space in their
folder names, which made their URLs end in `-/` and kept them out of the ES/JA trees.
The folders were renamed without the space (EN `aliases` redirect the old `…-/` URLs)
and full ES/JA translations were added: title, abstract, summary, image alt text and
the SCED body heading. `/articles/` now lists 40 papers in all three languages.
