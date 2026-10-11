# Wealth and weight: trilingual publication and CV addition

Prepared against master `e014303e905fc8ce4112dc1f36002faa2e5687e5`.
Remote master was verified at the same commit after preparation. Carlos
subsequently gave explicit approval to commit and push this scoped addition to
master. The source and all tested article/CV/image files remained unchanged
between preparation and that approval.

## Changes

- Added `content/articles/20261008-EJHE/` and complete ES/JA counterparts.
  The rendered route is `/articles/20261008-ejhe/` and the locale-prefixed routes.
- Verified metadata with Crossref and the complete published PDF:
  Restrepo Gómez, K.; Du, H.; Mendez, C. (2026), *The European Journal of Health
  Economics*, DOI `10.1007/s10198-026-01998-1`, October 8, 2026. Online first,
  with no volume, issue, or page range. First authors' full names are confirmed
  in the paper's funding statement. English abstract matches PDF text verbatim
  after whitespace normalization; citation bytes are identical across locales.
- Explicit `featured: false` in all three new bundles. All four existing
  featured flags in each language remain byte-for-byte unchanged. The actual
  three homepage items remain REGION, Applied Economics, and Social Indicators
  Research (the AE bundle's date is December 20, 2025, despite its folder name).
- Added one CV citation, after REGION and before Economic Modelling. The
  canonical LaTeX diff has four inserted lines and zero deletions. Compiled
  with the repository's class/style files and copied to `static/media/CV.pdf`.
- Original deterministic infographic reconstructs the two BMA income curves
  from Table 2; it does not redraw the paper's descriptive pooled figures.
  Source/data are in `scripts/figures/20261008-EJHE/`; the bundle contains an
  evidence ledger. The vertical axis is a centered income component in
  percentage points, not predicted prevalence. No invented uncertainty band.

## Verification completed

- Pinned Hugo 0.111.3 extended production build with `--gc --minify --buildFuture`:
  exit 0 (EN 1197 pages, ES/JA 587 each). Existing `.Path` deprecation warning.
- Completed-build site audit: 2089 HTML pages parsed; zero broken internal
  references, anchors, or language switches; `RESULT: clean`.
- i18n parity: zero missing, zero stale, zero asset warnings.
- `node --test tests/*.cjs`: 22 passed, zero failed.
- Chromium: all three new pages and image viewers at 360, 390, 768, 1024,
  1280, and 1440 pixels; catalogs, search/type/year filters, and homepages at
  360 and 1440 pixels. No horizontal overflow or uncaught page errors. Image
  viewer opens/closes and preserves each localized alt description. Catalog
  entries are unique. New paper absent from every homepage featured section.
- Screenshots inspected for EN/ES/JA mobile pages, desktop article/catalog,
  and image viewer. The source master, encoded WebP, and 160/96-pixel review
  previews were also inspected. Fine labels require enlargement.
- CV: 10 pages, new entry on page 4, rendered page and whole-document contact
  sheet inspected. Compile exit 0. Template footer/underfull-box warnings
  remain; no unrelated template edits made. No `/cv/` page or LaTeX source
  leaks; built and installed CV PDF hashes match.
- DOI and publisher PDF both return HTTP 200; PDF MIME type is application/pdf.
- `git diff --check`: clean. No pre-existing tracked content changed except
  the additive CV source insertion and rebuilt public CV.

## Image delivery

- Native PNG master: 2560×1440, 212214 bytes; saved as
  `wealth-and-weight-infographic.png` in the user's ChatGPT Library.
- Shared EN/ES/JA lossless WebP: 2560×1440, 79082 bytes;
  SHA-256 `57f9a2b95f9027e269340a4a9e668d582a7f65fa283374ec853d84fb09440146`.
- Actual Hugo catalog image: 1200×675, 33042 bytes. Article image:
  720×405, 18386 bytes. Homepage 320/640 variants are not emitted for this
  non-featured paper; the existing shared thumbnail pipeline is unchanged.

## Supporting materials and publication status

The publisher's data statement makes the full dataset available from the
corresponding author on reasonable request. No public replication notebook,
podcast, video, or slide deck was verified. No links were fabricated and no
NotebookLM or media-platform publishing was initiated. A brief reading guide
points readers to Tables 2, 3–4, and 11 in the open-access paper.

Publication through the existing Git-to-Netlify workflow is explicitly approved.
The scoped commit includes this addition only. After pushing master, verify the
remote commit, exact Netlify production deployment, live EN/ES/JA article pages,
CV bytes, and unchanged featured homepage set. Post-deployment evidence is
reported separately after those checks complete.
