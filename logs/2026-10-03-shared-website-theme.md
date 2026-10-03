# Shared website theme — 2026-10-03

## Request and scope

Bring the landing page's design, at least its colors, to all internal website
pages. The user confirmed **website pages only**: standalone teaching apps and
slide decks retain their existing designs. External course/dashboard sites are
separate projects. Existing scientific imagery and semantic chart/code colors
are preserved.

## Implementation

- Added `assets/css/orbital-palette.css` as the common source of CSS color/font
  tokens. The landing page now consumes those tokens without layout changes.
- Added `assets/css/orbital-subpages.css`, loaded after Wowchemy through
  `layouts/partials/custom_head.html`. Covers archives, article/profile pages,
  courses, cards, project galleries, search, filters, dropdowns, pagination,
  code/table reading surfaces, embedded lab surfaces, and the footer.
- Both templates concatenate their palette and page styles into one minified,
  fingerprinted CSS resource per page type, with integrity attributes.
- Updated `nightlights.toml` to the matching build-time palette; set dark mode
  on the server and disabled the legacy appearance picker. Stored light/auto
  preferences no longer switch internal pages away from the landing palette.
  Removed the old pre-paint/local-storage theme script.
- Kept all ten original navigation links and existing page layouts. Reduced
  navigation spacing and omitted the current-language text label at the narrow
  desktop breakpoint (the labeled globe control still opens language choices).
- Updated README and CLAUDE documentation. No content bundles, standalone apps,
  slide decks, or third-party sites were modified.

## Verification

- Hugo Extended 0.111.3 production build (`--minify --buildFuture`) succeeds for
  English, Spanish, and Japanese. Only the existing `.Path` deprecation warning.
- Audited generated HTML: every Wowchemy page in the preview (1,192 HTML files)
  includes the shared stylesheet and server-rendered dark class.
- Browser checks on archives (publications, projects, presentations), individual
  project/publication pages, courses, author profile, alumni, tutorial, homepage,
  and 404: matching `#050a12` background and `#edf2f6` text.
- Responsive checks at 320, 390, 992, 1024, and 1280 px; no page-level horizontal
  overflow in the sampled mobile pages. All navigation controls fit at 992 px
  in English, Spanish, and Japanese. Mobile menu exposes all ten links.
- Publication keyword and year filters, debounced tutorial search, and search
  overlay remain functional. Publication preview reports no browser errors.
- Verified `#0a121d` card/reading surfaces, blue resource links, and gold focus
  indicators; reset browser viewport after testing.
- Screenshot: `unified-publications-design.png` in the current Codex
  visualizations directory.
