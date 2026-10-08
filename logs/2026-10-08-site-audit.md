# 2026-10-08 — Site audit after the navigation restructure

Scope: internal links and redirects, navigation and the new pages, ES/JA translations,
visual and behaviour checks, and menu reachability at 360/390/768/1024/1280/1440 px. Local
production build plus the live site. External links and tutorial content were out of
scope.

## Method
- A crawler over `public/` (stdlib `html.parser`) resolved every internal
  `href`/`src`/`srcset` against the build, `public/_redirects` and the `netlify.toml`
  rules. It also checked in-page and homepage anchors and `hreflang` language links.
- Redirects were checked against every URL of the pre-restructure site: commit
  `7ad9d54d` was built in a temporary worktree (1,917 URLs).
- Chrome: each page was loaded in same-origin iframes of exact widths to measure the
  menu (rows, clipping, gap to the icons, horizontal page scroll), to open the
  collapsed menus, and to drive every filter option on Books, Software, Data and
  WebApps in EN/ES/JA. Console errors and homepage thumbnail styles were read.

## Issues found and fixed
1. **"Publication type" link on every article pointed to `#2`.** Wowchemy's
   `publication/single.html` looked up the `publication` section, which no longer
   exists. The template is now forked to `layouts/publication/single.html` and links to
   `/publication-type/<n>/`.
2. **The web-app manifest 404'd on every page** (an older bug). Wowchemy links
   `index.webmanifest`, but Hugo 0.111 writes `manifest.webmanifest`.
   `outputFormats.WebAppManifest.baseName: index` was added to `config.yaml`.
3. **The inner-page menu did not fit at 992–1199 px.** ES "Apps web" wrapped and every
   JA label broke onto two lines. Wowchemy's navbar is forked to
   `layouts/partials/navbar.html` with `navbar-expand-xl` (it collapses below 1200 px,
   like the homepage). The collapsed-header rules for 992–1199 px are in `custom.scss`
   §7a, and labels are `nowrap` from 1200 px up (`orbital-subpages.css`). The menu now
   fits on one row from 1200 px in all three languages, and below that all 12 items
   open in the toggle.
4. **The Data "Type" filter hid everything.** Hugo's escaper rewrote the generated
   attribute `data-type` to `data-zgotmplz`. `catalog.html` now emits the attributes
   with `safeHTMLAttr`. The no-op "Python" option on Software was also removed.
5. **The ES/JA Tutorials gallery UI was English** (search, sort, chips, topic names,
   empty state, news heading). It is localized through `ui:` and `topic_labels:` in
   `content/{es,ja}/tutorials/_index.md`, with English as the fallback.
6. **Japanese theme strings were untranslated** (Search, publication types, contact
   form…). These are overridden in `i18n/ja.yaml`, plus two in `i18n/es.yaml`. The
   ES/JA footer copyright is localized (`languages.yaml`, `data/orbital.json`).
7. **About 1 px of horizontal page scroll** on `/articles/` and the catalog pages
   at ≤991 px (`.row` inside `.universal-wrapper`). Wide display equations widened
   tutorial pages on phones (python_did101 was 584 px at 360 px). Both are fixed in
   `orbital-subpages.css`.
8. **Links:**
   - `/project/intro2causal/` → `/books/intro2causal/` (ccm, EN/ES/JA).
   - The ES/JA WebApps tutorial buttons pointed to never-rendered stubs; they now
     point to the EN tutorial.
   - The ES/JA podcast button on `20260528-EM` now opens its own language's page.
   - stata_did `post/…` resource buttons → `tutorials/…`.
   - python_sc_dsc_sdid deck links → `/tutorials/…`.
   - r_convergence_clubs dataset links → the GitHub raw files (verified 200).
   - Two python_pca2 → python_pca section anchors.
9. **Titles:** the EN section titles "Publications" and "Posts & Tutorials" were
   renamed "Articles" and "Tutorials" to match the menu.
10. **Old `/projects/ds4ds/` links** now redirect to `/data/` (the project stays
    hidden).

## Verified clean
- 0 reachable broken internal links.
- All 1,917 old URLs either exist or redirect to a live page.
- 0 bad language-switch links and no old section paths in HTML, the search index,
  RSS or the sitemap.
- No console errors on the sampled pages.
- Homepage thumbnails use the q88/q92 responsive WebP with `filter`/`transform`
  `none`.
- `node --test tests/*.cjs` passes 22/22, and `scripts/i18n-parity.sh` reports 0
  missing.

## Known, left as is (not reachable from the site)
- Quarto `title-slide.html` template partials published next to each deck contain a
  literal `$deck-author-url$`; nothing links to them.
- `/es|ja/presentations/gsid-ai-2026/slides/` are partial orphan copies that lack
  `plugin.js`. The ES/JA pages link to the complete EN deck.
- `content/tutorials/r_dynamic_bma2/` is an unfinished working folder (no `index.md`).
  Its `web_app/` is published, but its "back to tutorial" link has no target.
- The script-driven `#podcast-player`, `#video-player` and web-app tab hashes are
  intentional; their scripts read the hash.

## Follow-up: docs refresh and reusable audit tools
- **Audit tools:** the audit is now re-runnable. `scripts/audit-site.py` checks links, anchors, language links and redirects (`--old-ref <commit>` adds an old-build comparison), and `scripts/audit-nav.cjs` checks the menu and overflow at six widths with Playwright. Procedure: `.claude/docs/site-audit.md`.
- **Docs:** CLAUDE.md was rewritten lean (about 140 lines). New references: `.claude/docs/design-system.md` (which takes the homepage architecture and the thumbnail standard), `theme-overrides.md` and `site-audit.md`. The README was rewritten as a guide for the owner and collaborators.
- **Footer fix found while writing the docs:** the content-page footer was English on ES/JA pages. Its tagline, column headings and affiliation now come from `data/orbital.json`, and the 12-item menu is split 6/6 under Explore / Resources. Dates in `li_compact.html` and `event_card.html` now use the localized `time.Format`.
