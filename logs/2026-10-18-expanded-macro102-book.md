# 2026-10-18 — Expanded macro102 book entry

Expanded only `books/macro102/index.md` and its ES/JA counterparts, with matching `learning-cycle.svg` assets. Retained the single primary Website button. CV, featured thumbnails, Books section subtitles and other entries are unchanged. Publication authorized by Carlos after review of the expanded entry, resource directory and cycle figure.

## Source and editorial scope

Read the current preface at https://quarcs-lab.github.io/macro102-site/ and its source, then inspected every chapter/appendix page and resolved its actual linked resources. The entry now explains the data → facts → models → comparison → revision cycle, what readers can do, the relationship to Jones (2024), practical study steps, topic progression and intended readers. The current book has 21 chapters and four appendices, including Appendix D on DSGE modeling and estimation with Snowdrop.

## Resource coverage

Each language has a grouped directory with 25 readable chapter/appendix links, 25 executable Colab notebook links and 24 lecture-slide links. All 21 main chapters have all three resources. Appendices A–C have all three; Appendix D has a chapter and computational notebook but no linked slide deck. The public source tree also has no `slides/appD/index.html`; no slide URL was invented.

All 25 readable pages returned HTTP 200. All 25 linked Colab destinations returned HTTP 200. All 25 underlying `.ipynb` files were retrieved and parsed as notebook JSON with code cells (2,247 code cells total); all 24 linked slide destinations returned HTTP 200 and contain Reveal presentation markup. Notebook execution itself was not performed. Validation records are retained in the task workspace at `book-assets/resources.json` and `book-assets/resource-validation.json`.

## Original cycle figure

Source: https://quarcs-lab.github.io/macro102-site/#the-cycle-of-the-book (CC BY-NC 4.0). The live figure is generated from Mermaid. Its original paths, node positions/sizes, labels, feedback arrows and computed dark-theme colors were exported into a self-contained SVG. Optimization removes unused generated Mermaid styling/scaffolding and uses native SVG text with the source label widths. No new artwork or diagram structure was designed. Rendered source SVG: 21,812 bytes; optimized SVG: 4,176 bytes (80.9% reduction). Same asset in all three bundles, with localized alt text and captions. Responsive overview shows the full figure; the figure and caption link to the full-size SVG for detailed reading.

## Verification

Hugo 0.111.3 extended production build passed (known theme `.Path` warning). Translation parity: zero missing/stale/asset warnings. Source/rendered link coverage and single-header-button checks passed; no CV diff. `git diff --check` passed. Desktop/mobile previews at 1440 and 360px confirm the diagram loads and pages have no horizontal overflow. The chapter resource tables wrap within the content column.

The whole-site link audit reports the same six known missing legacy image references under `post/python_dynamic_panel/referenceMaterials`, zero broken anchors and zero broken language-switch links. No new issue relates to this addition.
