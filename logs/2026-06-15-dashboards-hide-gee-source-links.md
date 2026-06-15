# 2026-06-15 — Dashboards: hide GEE source-code links (preserve as HTML comments)

## Summary

Reworked the **GeoDevelopment Dashboards** project page so the apps' Google Earth Engine
**source-code** links are no longer publicly visible, while keeping each link in the repository
source for reference. The previously-rendered `| Open in GEE` link (and its localized variants
`| Abrir en GEE`, `| GEEで開く`) was removed from every entry's `<summary>`; the code URL now
lives in an HTML comment on its own line directly under the summary:

```
<summary>… <a href="…/view/<app>">Access App</a></summary>
<!-- Source code (GEE): https://code.earthengine.google.com/<id>?hideCode=true -->
```

Only the visible **"Access App"** link (and the lazy-loaded `fullwidth-iframe` embed) remains —
the published apps stay fully accessible; just the editor/source link is hidden from visitors.

Note: an HTML comment is removed from the *visible* page but still present in the page's HTML
view-source. This was an accepted trade-off — the intent is to not surface the code link to
normal visitors, not to make it a hard secret.

## Scope

`grep` confirmed the GEE link existed **only** on the dashboards page — 7 entries × 3 language
bundles = 21 links — nowhere else on the site. Files touched:

- `content/projects/dashboards/index.md` (EN, `Open in GEE`)
- `content/es/projects/dashboards/index.md` (ES, `Abrir en GEE`)
- `content/ja/projects/dashboards/index.md` (JA, `GEEで開く`)

Applied with a single UTF-8-aware `perl -CSD -i -pe` substitution (the JA pass needed `-Mutf8`
so the multibyte label literal matched the decoded input). No app URLs, titles, iframes, or
entry ordering changed.

## Current state of the dashboards page (7 entries, in order)

1. VIIRS-like **localized** monthly nighttime lights (1992–2024) — added 2026-06-14 (`fec4777`)
2. VIIRS-like **regional** monthly nighttime lights (1992–2024) — added 2026-06-14 (`6e9a1ef`)
3. DMSP-like **localized** annual nighttime lights (1992–2025)
4. DMSP-like **regional** annual nighttime lights (1992–2025)
5. DMSP-like **global split view** nighttime lights (1992–2025) — added 2026-06-14 (`84a68e2`;
   title typo "DMPS-like" corrected to "DMSP-like")
6. Space-time dynamics — Cambodia (2013–2019)
7. Regional GDP disparities — Japan (1990–2022), Kanyama & Mendez

All seven now hide the GEE source link as an HTML comment.

## Convention recorded

Added a note under **Custom Components → Collapsible Dashboards** in `CLAUDE.md`: future
dashboard entries keep only the visible "Access App" link and preserve the GEE source link as
`<!-- Source code (GEE): … -->` under the `<summary>`, across all three language bundles.

## Verification

- Per file: 0 visible GEE links, 7 `Source code (GEE)` comments, 7 `code.earthengine.google.com`
  URLs (now in comments), 7 app links.
- Clean build with the pinned Hugo 0.111.3 verify binary (`--gc --minify --buildFuture`).
- Rendered `public/projects/dashboards/index.html`: `>Open in GEE<` count 0; comment passes
  through (7).
