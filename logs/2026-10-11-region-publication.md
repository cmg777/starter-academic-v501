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

## Homepage resource refinement

At Carlos's request, added seven resource buttons to each locale's existing article front matter: the exact Online article URL (`index-preview.html`) and six separate, descriptively labeled N1–N6 notebooks in the paper's learning order. The homepage and article header use the existing resource-button templates. Journal, DOI, PDF, repository, and map links remain available. No template, styling, CV, slide, or NotebookLM asset was changed.

Validation: pinned production build passed; i18n parity reports zero missing, stale, or asset warnings; all seven destination URLs occur on each generated homepage. Browser checks at 360 and 1440 CSS pixels confirm seven distinct links and no horizontal overflow in EN/ES/JA. Mobile buttons wrap within the existing style. The exact online article destination returned HTTP 200 and its title matches the published paper. Six notebook destinations were verified against the publisher's learning sequence and the earlier source inspection.

## Slides resource

At Carlos's request, published the previously validated 12-slide English deck and its 12-page PDF without regeneration. The unchanged self-contained HTML is hosted in the English article bundle at `slides/index.html`; the unchanged PDF is `slides.pdf`. All three article locales now use the native `url_slides` button and a localized PDF resource button. Their existing homepage resource lists inherit both links. Carlos then requested fewer prominent resource buttons. Removed the six individual N1–N6 buttons and the overlapping Learn by Coding button, replacing the former Online article label with one localized Online article & notebooks button to the exact `index-preview.html` page. The six detailed notebook references remain in the article body. Principal paper, code, map, and slide links are preserved. No media upload, infographic, CV, template, or style change is included.

The slide-deck-generator skill specifies a self-contained HTML deliverable and imposes no separate hosting destination. Existing article/resource-button conventions support the shared English bundle, so no additional hosting service is needed. Validation and deployment receipts are retained in the task workspace.

Validation for the final slides and consolidated-button update: pinned production build passed; 2,052-page site audit clean; i18n parity zero missing/stale/asset warnings; all 22 existing tests passed. Six scoped built pages contain both slide links and exactly one consolidated online article/notebooks link, with no individual notebook buttons. Browser checks passed for all six pages at 360px and 1440px with no horizontal overflow; slide navigation and mobile fit passed. Both published build assets match the previously validated originals byte-for-byte, and the PDF has 12 pages. All three article bodies remain unchanged.


## Quarto tutorial-format slide replacement

Carlos rejected the generic deck and requested the site's genuine Quarto tutorial format, with no public slides PDF. The replacement uses the live FWL tutorial as its reference and copies the canonical write-slides `site-brand.scss` and `title-slide.html` without modification. Quarto 1.8.27 renders the 24-slide English deck, with a slide menu, overview, keyboard navigation, fragments, speaker notes, chalkboard, bundled reveal.js assets and default MathJax. The public address stays `articles/20261011-region/slides/index.html`. Source `.qmd`, deterministic SVG figure builder and rendered assets are committed together because Netlify runs Hugo, not Quarto.

The deck preserves the original published luminosity map and uses explicitly labeled teaching schematics and redraws of Tables 3–4. It distinguishes regression impacts from implied convergence speeds, quotes preferred Model 4's 3.0%/5.2% and 23/13-year estimates, preserves the three empirical fronts, and identifies the cultural analysis as a separate 32-state/territory exercise. Each technical result includes paper-specific speaker notes. No re-estimation, unrelated artwork or media work was performed.

Removed only the public `slides.pdf` and its three localized resource entries; the previous PDF/HTML remain in Git history and task-workspace backups. Existing Library copies were not deleted. The paper PDF, CV PDF, article bodies, infographic, and single consolidated Online article & notebooks resource remain unchanged. The homepage buttons inherit the locale front-matter removal.

Validation: Quarto render and all 15 repository slide smoke checks passed. All 24 settled slides were visually reviewed; equations render via MathJax with no errors and all six figures load. Desktop review used 1440×900; mobile checks used 390×844 and 844×390, with no horizontal overflow and an accessible 300px slide menu. Menu selection, overview, stable named slide URLs and incremental keyboard navigation were exercised. Final Hugo, locale, link and deployment results are recorded below.

The first full site audit exposed Hugo basename collisions in inherited localized slide resources: ES/JA omitted the chalkboard `plugin.js`. Added byte-identical copies of that Quarto-generated file to both locale bundles so even the inherited deck URLs have complete runtime assets; the visible resource buttons continue to target the shared English deck. No audit exemption or global template change was introduced.

Final validation: pinned Hugo 0.111.3 extended production build passed (only the pre-existing `.Path` deprecation warning). The 2,058-page audit is clean: zero broken internal references, anchors or language switches. All 22 existing Node tests pass, and locale parity reports zero missing, stale or asset warnings. Browser checks cover all six article/homepage combinations at 1440px and 390px, with no overflow, no slides-PDF button, and exactly one consolidated learning button per page. All 27 relative HTML asset references resolve; the original map and canonical theme/title partial match byte-for-byte. The published CV bytes and all article bodies are unchanged. Generated Quarto/vendor files retain upstream formatting.


## Homepage journal label

Carlos requested that the REGION homepage listing show only the journal name, consistently with other research items. Set `publication_short: "REGION"` in EN/ES/JA and taught the homepage publication row to prefer this existing field, falling back to `publication` when empty. The full publication field, article-page rendering, CV source/PDF, slide deck and resources are unchanged. Validation compares all three homepage rows with the previous production output and confirms the full journal volume/pages remain on all article pages.

Validation: production Hugo build passed; locale parity reports zero missing, stale or asset warnings; `git diff --check` passed. All three homepages now show `2026 / REGION`; the other two featured journal labels are unchanged. Article HTML bodies retain the complete citation and match the prior build exactly (only generated modification timestamps in the head differ). The CV PDF and Quarto deck HTML match the prior build byte-for-byte.
