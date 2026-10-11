# REGION paper — regular article and CV entry

Scope: the newly published paper by Carlos Mendez, Sujana Kabiraj and Jiaqi Li; approved website/CV addition, infographic, commit and push. Initial checkout was clean at `8c8b5345b81b7f25c317b7ed8fbc7cf10cbabf65` on `master`. No matching article or CV citation existed. Existing publication artwork and hand-curated CV lines were preserved.

## Publication verification

- Publisher landing: https://openjournals.wu.ac.at/ojs/index.php/region/article/view/676
- Final publisher PDF: https://openjournals.wu.ac.at/ojs/index.php/region/article/download/676/542
- DOI https://doi.org/10.18335/region.v13i2.676 resolved with HTTP 200 to the publisher landing.
- REGION 13(2), 173–196 (2026), published October 11, 2026; CC BY 4.0. The visible date and `citation_date` govern; `DC.Date.issued` July 22 is the issue date.
- Crossref works lookup returned 404 at verification time; citation metadata therefore comes from the publisher, PDF, and user-confirmed author order. The replication README's pending-publication citation is stale and was not copied.
- English abstract matches the publisher landing verbatim after whitespace normalization, including **three empirical fronts**. ES/JA contain full translations.
- Preferred Model 4: Table 3, p. 184 (PDF p. 12), 3.0% OLS versus 5.2% SDM annual speed, 23 versus 13 years half-life. Figure 1, p. 179 (PDF p. 7), supplies the unaltered map. Sample: 520 districts, 1996–2010. The explainer preserves the reduced-form/noncausal interpretation and single-period limitation.
- Inspected the actual replication README, rendered article, source map and all six notebook pages. The six notebook links, GitHub repository and Earth Engine application returned HTTP 200. Python's license-link request received a bot-related 403; the canonical Creative Commons page was successfully verified with the web reader.

## Changes

- Full EN/ES/JA bundles at `content/{,es/,ja/}articles/20261011-REGION/`: abstract, plain-language summary, explainer, estimates table, six learning notebooks, publisher PDF, DOI, code and interactive-map links, identical citation and optimized infographic.
- `featured: true` in the new bundles makes the paper visible in the homepage's existing three-slot selection. Existing flags were not changed.
- Four additive lines in `content/cv/main.tex`, at the top of Peer-reviewed Articles; `static/media/CV.pdf` rebuilt to 10 pages. No existing CV citation or hand-maintained section was rewritten.
- Deterministic infographic builder in `scripts/figures/region2026-infographic.py`; evidence and reproduction brief in the EN bundle.
- Infographic native dimensions: 1920×1080. Encoded WebP: 155,928 bytes. Identical SHA-256 across locales: `e272b47adc9cf3fbb96313b144434fdbafdde07fbd93990fb9796cdac2ab6455`.
- Delivered thumbnails: 320×180 q88 = 11,552 bytes; 640×360 q92 = 37,840 bytes. Existing responsive image pipeline retained.

## Validation

- Pinned Hugo 0.111.3 extended production build (`--gc --minify --buildFuture`) passed. Only the existing shared-template `.Path` deprecation warning appeared.
- `scripts/audit-site.py`: 2,049 HTML pages parsed; zero broken internal references, anchors, or language-switch links; RESULT: clean.
- `scripts/i18n-parity.sh`: zero missing, stale, or asset-warning entries in ES and JA.
- All 22 existing Node tests passed.
- Scoped checks: exact English abstract, publication date/DOI/metadata parity, identical locale URLs and citations, six notebook links per locale, image hashes, and additive CV diff.
- Browser checks passed at 360, 390 and 1440 pixels for all three article pages, homepages and article catalogs. No horizontal overflow. Correct resource buttons and localized image alternatives. Native image viewer opened/closed, loaded the 1920px master and fit the viewport.
- Homepage thumbnails measured 96 CSS px on mobile and 160 CSS px on desktop, with `object-fit: contain`, no filter/transform, lazy loading, async decoding and responsive sources. Visual inspection covered the composition, cards, article layouts, tables and image viewer.
- PDF compiled successfully; new citation visually inspected on page 4 and all 10 pages inspected in overview. No public `/cv/` page or LaTeX-source leak; only `/media/CV.pdf` is published. Existing moderncv footer/underfull warnings were left unchanged.
- Library preview saved as `REGION-2026-India-convergence-infographic.png` (`libfile_7bc78b0aa1588191ab6eead9d294b44c`), native image, 1920×1080, 479,722 bytes.

Build outputs, downloaded sources, browser screenshots, verification script and machine-readable receipts remain in the task workspace rather than the website repository. Commit and exact-commit deployment receipts are delivered in the task response after publication.
