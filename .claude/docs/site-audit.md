# Site audit (re-runnable)

Run this after structural changes (menu, section folders, templates, theme update,
large content moves) and before pushing them. The first run, and what it found and
fixed, is in `logs/2026-10-08-site-audit.md`.

## 1. Build

```bash
H="$HOME/Library/Application Support/Hugo/0.111.3/hugo"
rm -rf public && "$H" --gc --minify --buildFuture      # production build into public/
```

## 2. Links, anchors, language links, redirects — `scripts/audit-site.py`

```bash
python3 scripts/audit-site.py                          # crawl public/
python3 scripts/audit-site.py --old-ref <commit>       # + every URL of an older build must still resolve
python3 scripts/audit-site.py --show-redirected        # list internal links that only work via a redirect
```

- **What it crawls:** every `public/**/*.html`. Each internal `href`/`src`/`srcset` must exist in `public/`, or reach an existing page through `public/_redirects` (generated from `aliases:`) and the `netlify.toml` `[[redirects]]` rules, simulated in that order: the first match wins, splats are supported, up to 4 hops.
- **Other checks:** `#anchor` links (same page and cross-page) and `hreflang` language-switch links.
- **`--old-ref`:** builds that commit in a temporary `git worktree`, then checks every old page URL. Use the commit just before a restructure; for the 2026-10-08 restructure that is `7ad9d54d`.
- **Exit codes:** 0 clean, 1 problems, 2 no build.
- **Intentional patterns** are skipped by default (the `IGNORE` list at the top of the script):
  - `#podcast-player` / `#video-player`: the page's script opens the player from the hash.
  - Web-app tab hashes (`web_app/index.html#…`).
  - The `$deck-author-url$` placeholder in Quarto `title-slide.html` partials, which nothing links to.
  - Orphan ES/JA copies of presentation decks (translated pages link to the English deck).
  - `tutorials/r_dynamic_bma2/`, an unfinished working folder.

  Add a pattern only when you have confirmed it is unreachable or intentional.
- **Fix to aim for:** link to the final URL. An internal link that only works through a redirect still counts as stale.

## 3. Menu and overflow at every width — `scripts/audit-nav.cjs`

```bash
node scripts/audit-nav.cjs                                   # default pages x 360,390,768,1024,1280,1440
node scripts/audit-nav.cjs --pages /,/es/books/ --widths 1199,1200
```

- **Setup:** it serves `public/` on a free localhost port and drives headless Chromium through Playwright (`npx playwright install chromium` once if needed).
- **Pages:** homepage EN/ES/JA, catalog pages, an article, tutorial lists, a tutorial, presentations and a software page.
- **Checks:**
  - Below 1200px the toggle is shown and opens all 12 items.
  - From 1200px the full row is on one line, with nothing clipped or wrapped and at least 8px before the icons.
  - There is no horizontal page scroll.
- **Exit codes:** 0 pass, 1 failures.

## 4. Repository checks

```bash
node --test tests/*.cjs          # globe lifecycle + sc-lab data
bash scripts/i18n-parity.sh      # every EN item has ES + JA counterparts (0 missing)
```

## 5. Manual browser pass (Chrome)

- **Catalog filters (Books / Software / Data / WebApps, EN/ES/JA):**
  - Every dropdown option narrows the list and never shows 0 rows.
  - An option that matches every row is useless; remove it.
  - Search works.
  - External buttons open in a new tab.
- **Console:** no errors on the homepage, the catalog pages, an article, a tutorial and a presentation.
- **ES/JA pages:** scan for English UI text, for example placeholders, filter labels, footer, search modal, sort options and dates. Sources to fix: the section `_index.md` params, `i18n/*.yaml`, `data/orbital.json`, hard-coded strings in `layouts/`.
- **Homepage thumbnails:** check against the standard in `design-system.md` §5 (responsive WebP selected, computed `filter`/`transform` `none`).
- **Visual check:** screenshots at 390 and 1440 of the new or changed pages.

## 6. After deploy (live)

```bash
for u in / /es/ /ja/ /articles/ /books/ /software/ /webapps/ /data/ /tutorials/ /presentations/; do
  echo "$u $(curl -s -o /dev/null -w '%{http_code}' https://carlos-mendez.org$u)"; done
curl -sIL -o /dev/null -w '%{http_code} %{url_effective}\n' https://carlos-mendez.org/post/python_did101/
```

`/` may answer **302 → `/es/` or `/ja/`**. This is the geolocation edge function (`netlify/edge-functions/geo-lang.ts`) on a first visit from a Spanish-speaking country or Japan, and is expected.
