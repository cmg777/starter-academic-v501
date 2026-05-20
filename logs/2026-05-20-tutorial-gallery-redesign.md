# Tutorial gallery redesign and footer rework

**Date:** 2026-05-20
**Scope:** `/post/` listing, homepage Posts & Tutorials widget, site footer, licensing
**Commit:** 8631dcf

## Summary

Replaced the vertical-stream `/post/` listing (Isotope.js search + left-thumbnail
rows) with a topic-grouped, image-first gallery in the style of Netflix / Apple
Music. Each of nine econometric methods now gets its own labeled, horizontally
scrolling strip of 16:9 cards, governed by a curated taxonomy in
`data/tutorial_topics.yaml`. A sticky control bar offers live search, language
filter chips (Python / R / Stata / GEE), a sort selector, and a topic jump-nav
with scroll-spy. Three announcement posts are demoted to a small "News &
Announcements" strip below the gallery. The homepage `Posts & Tutorials` widget
was converted from Wowchemy's `pages` widget (`view: 2`) to a `blank` widget that
renders six teaser cards via a new shortcode reusing the same partial. In the
same commit, the site footer was overridden to drop the Wowchemy attribution
and surface a CC BY-NC-SA 4.0 license notice plus a "© 2018–{year} Carlos
Mendez" line.

## What changed

### Tutorials gallery

New files:

| Path                                            | Role                                                             |
|-------------------------------------------------|------------------------------------------------------------------|
| `data/tutorial_topics.yaml`                     | 9-topic taxonomy + language palette (single source of truth)     |
| `layouts/partials/tutorial_card.html`           | 16:9 image-first card with bottom-overlay title + topic+lang chips |
| `layouts/partials/tutorial_placeholder.html`    | On-brand SVG fallback (gradient + icon + lang badge)             |
| `layouts/partials/tutorial_topic_row.html`      | One labeled topic section with the horizontal scroll strip       |
| `layouts/partials/tutorial_card_auto.html`      | Helper that auto-resolves topic + lang from a Page               |
| `layouts/shortcodes/tutorial-teaser.html`       | Homepage 6-card teaser strip + "Browse all" link                 |
| `static/js/tutorial-gallery.js`                 | Search, language chips, sort, scroll-spy, drag-to-scroll         |

Modified files:

| Path                                | Change                                                                                                  |
|-------------------------------------|---------------------------------------------------------------------------------------------------------|
| `layouts/section/post.html`         | Full rewrite: page-level bucketing by topic, sticky controls, per-topic strips, announcements strip     |
| `assets/scss/custom.scss`           | Appended sections 12–14 (~486 lines): gallery cards + strips, sticky nav with chips, SVG placeholder, homepage teaser |
| `content/home/posts.md`             | Switched from `pages` widget (view: 2) to `blank` widget invoking `{{< tutorial-teaser count="6" >}}`   |
| `config/_default/config.yaml`       | Extended `ignoreFiles` with `\.venv`, `\.quarto`, `tutorial_files`                                      |

Routing rules: a post is assigned to the **first** topic whose
`category_matches:` list overlaps the post's `categories:`. Posts whose slug
starts with `python_`, `r_`, `stata_`, `gee_`, or `rpy_` and that match no
topic fall to the `foundations` bucket. Posts with the `Announcement` category
are routed to the bottom strip and never appear in the topical grid.

Language is inferred from the slug prefix (Python / R / Stata / GEE / Python+R)
and surfaced as a chip on every card; this is also the axis the language filter
chips operate on.

### Footer & licensing

| Path                                  | Change                                                                                    |
|---------------------------------------|-------------------------------------------------------------------------------------------|
| `layouts/partials/site_footer.html`   | New override; drops "Published with Wowchemy …", keeps translations / privacy / terms / copyright + license partial |
| `config/_default/params.yaml`         | `copyright_license.enable: false → true`; `allow_derivatives: false → true` (CC BY-NC-SA 4.0) |
| `config/_default/config.yaml`         | `copyright: '© 2018–{year} Carlos Mendez'` (auto-substituted by `now.Year`)                |

## Topic taxonomy and bucket counts

Live counts measured against the current `content/post/` after routing:

| # | Topic                          | Posts |
|---|--------------------------------|-------|
| 1 | Difference-in-Differences      | 11    |
| 2 | Causal Machine Learning        | 7     |
| 3 | Panel Data & Fixed Effects     | 9     |
| 4 | Synthetic Control              | 6     |
| 5 | Instrumental Variables         | 3     |
| 6 | Spatial Econometrics           | 17    |
| 7 | RDD & Matching                 | 2     |
| 8 | GIS & Remote Sensing           | 8     |
| 9 | Foundations & Other Methods    | 21    |
|   | Announcements (bottom strip)   | 3     |

## Verification

- Hugo 0.84.2 dev server (`hugo server --disableFastRender`) built site cleanly
  after moving three local `.venv/` directories aside (`content/post/python_iv/`,
  `content/post/python_pca/references/`, `content/post/python_pyfixest/references/`).
- `curl -s http://localhost:1313/post/` returns ~205 KB of HTML containing
  9 `<section class="tg-topic-row" id="topic-…">` elements (one per topic with at
  least one card) and 728 occurrences of the `tg-card` class.
- Homepage `curl -s http://localhost:1313/` contains exactly 1 `tg-teaser-strip`
  and 6 `tg-card` anchors linking to the six most recent non-announcement posts.
- Headless Chrome screenshot of `/post/` (1600×1200) confirms: sticky control
  bar with search + chips + sort, topic jump-nav below, "Difference-in-Differences
  (11 tutorials, scroll →)", "Causal Machine Learning (7 tutorials)", and "Panel
  Data & Fixed Effects" rows rendering image-first cards with overlay titles
  and topic/language chips.

## Known follow-ups

- **Foundations bucket (21 posts)** — several entries would be better routed to
  `panel-fe` or `causal-ml`. Refining only `data/tutorial_topics.yaml`
  (`category_matches:` lists) moves them; no template changes required.
- **Hugo + `.venv/` inside leaf bundles** — `ignoreFiles` regex applies at the
  page-walker level but not inside Hugo's leaf-bundle resource walker, so
  `content/post/<slug>/.venv/…/404.html` still trips the build. Either remove
  the `.venv` dirs before running `hugo server` or revisit with
  `module.mounts.excludeFiles` (Hugo 0.110+) / a pre-server cleanup hook.
- **README staleness** — the homepage widget table lists `posts.md` at weight
  80; the actual file is weight 31. Update on the next README sweep.
