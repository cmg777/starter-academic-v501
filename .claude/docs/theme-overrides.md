# Theme overrides (Wowchemy forks)

The theme is Wowchemy v5, pinned in `go.mod` to `fda9f39d872e` (2021-03-24) and
loaded as a Hugo module. A file in the project's `layouts/` with the same path as
a theme file **replaces** it. Changes to the theme upstream never reach a forked
copy, and a theme update can break the assumptions these forks rely on. **After
any `./update_wowchemy.sh`,** diff each fork below against the new theme file,
then run the build, `python3 scripts/audit-site.py` and `node scripts/audit-nav.cjs`.

The theme source lives in Hugo's module cache:
`hugo config mounts | grep wowchemy@` prints the `dir`.

## Forked theme files

| Project file | Why it is forked | Check after a theme update |
|---|---|---|
| `layouts/index.html` | Fully custom standalone homepage (no theme JS/CSS); see `design-system.md` | — (not derived from the theme any more) |
| `layouts/partials/navbar.html` | `navbar-expand-lg` → **`navbar-expand-xl`** and every `d-lg-*` → `d-xl-*`, because the 12-item menu does not fit on one row below 1200px (ES/JA labels wrap). Pairs with `custom.scss` §7/§7a and `orbital-subpages.css` | Re-apply the lg→xl swap if the theme navbar changed |
| `layouts/publication/single.html` | The "Publication type" link used `site.GetPage "section" "publication"`, which no longer exists (the section is `articles`). Now links to `/publication-type/<n>/` | Section lookups by name |
| `layouts/section/articles.html` (+ `partials/publication_showcase.html`) | Forked from `section/publication.html`: search and type/year filters above showcase rows; Isotope removed | Filter markup |
| `layouts/partials/page_header.html` | Image-first header (featured image above the title); `image.placement: 3` | Header partial structure |
| `layouts/partials/site_footer.html` | Custom two-column footer, localized from `data/orbital.json` | — |
| `layouts/partials/custom_head.html` | Loads `orbital-palette.css` + `orbital-subpages.css` after Wowchemy; `color-scheme: dark` | Hook still called by the theme head |
| `layouts/partials/li_compact.html` | Compact list items (dates localized with `time.Format`) | — |
| `layouts/index.headers` | Netlify headers (CSP, permissions, content types including `/index.webmanifest`) | — |

Project-only templates (no theme counterpart):
- `layouts/section/{presentations,tutorials,books,software,data,webapps,projects}.html`
- `layouts/post/single.html`
- `partials/catalog.html`, `partials/orbital-*.html`, `partials/tutorial_*`, `partials/event_card.html`
- the shortcodes in `layouts/shortcodes/`

## Non-template overrides

- **`i18n/ja.yaml`, `i18n/es.yaml`:** theme strings the theme left in English (search, publication types, contact form, `posts` → Tutorials…). Hugo merges them by `id` over the theme's files. Add any newly found English leak here.
- **`config/_default/config.yaml` → `outputFormats.WebAppManifest.baseName: index`:** Wowchemy links `index.webmanifest`, but Hugo ≥0.9x names that output `manifest.webmanifest`, so the link returned 404 until this was set.
- **`config/_default/languages.yaml` → per-language `copyright`.**
- **Section types by `cascade`:** the folders `articles/`, `presentations/` and `tutorials/` keep the theme types `publication`, `event` and `post` through `cascade: [{_target: {kind: page}, type: …}]` in each section `_index.md`. Theme logic keyed on `.Type` keeps working. **Theme logic that looks a section up by name does not**; that is why `publication/single.html` was forked. When adopting a new theme template, grep it for `GetPage "section"` and `"Section" "post|publication|event"`.

## Known theme quirks

- The build warns that `.Path` is deprecated. This comes from the theme and is harmless.
- Some theme `ja.yaml` / `es.yaml` entries are untranslated. Check the ES/JA pages after adding new theme features.
