# Web App Review — r_sc_dsc_sdid

- **Slug:** `r_sc_dsc_sdid`
- **Audit date:** 2026-08-02
- **Focus:** full audit, all 10 dimensions
- **Browser pass:** yes — Chromium headless, desktop (1280×900) and narrow (500×700)
- **Final verdict:** **ACCEPT**

## Dimension scores

| # | Dimension | Score | Note |
|---|---|---|---|
| 1 | File completeness | N/A → 10 | Two "missing" files are lasso-app artefacts; see below |
| 2 | HTML structure | 10 | Doctype, `lang`, viewport meta, one `<header>`/`<main>`/`<footer>`, six `<section>`, single `<h1>` then all `<h2>` |
| 3 | JS correctness | 9 | Both modules `"use strict"`, no stray `console.log`, no globals beyond `Charts`; smoke test N/A (see below) |
| 4 | Data contract | 10 | Every value in `results.json` traced back to the post's CSVs |
| 5 | Accessibility | 9 | 7/7 SVGs carry `role="img"` and `aria-label`; buttons set `aria-pressed`; no colour-only encoding |
| 6 | Performance | 10 | 30.8 KB of hand-written assets, 41.3 KB of data, one pinned external dependency |
| 7 | Pedagogy | 9 | Six panels map onto the post's argument, each with its own teaching sentence |
| 8 | Hugo integration | 10 | All five assets publish; the post's `Web app` button resolves to `/post/r_sc_dsc_sdid/web_app/index.html` |
| 9 | Visual design | 10 | Site dark-navy palette throughout; typographic hierarchy consistent with the post |
| 10 | Mobile responsiveness | 10 | Verified: the body never scrolls horizontally; charts scroll inside their own container |

## Dimension 1 and 3 — recorded as Not Applicable, deliberately

The audit template expects seven files and hard-codes a smoke test that begins:

```js
load("dgp.js");
load("lasso.js");
```

Those two files belong to the **lasso reference app**, which runs a client-side data-generating
process and solves a lasso in the browser. This app has no simulation layer by design: every number
it displays was computed in R by `analysis.R` and shipped in `data/results.json`. There is nothing
for `dgp.js` to generate and nothing for `lasso.js` to solve.

Consequently:

- **Dimension 1** reports `dgp.js` and `lasso.js` absent. Correct, and correct that they are absent.
- **Dimension 3**'s smoke test aborts on its first `load()`. It is testing a different application.

No stub files were created to make the checker pass. Shipping dead JavaScript to satisfy a template
written for another app would be a real defect introduced to hide a fake one. Dimension 3 was
instead audited by hand (strict mode, module scoping, error handling, no leaked globals, no debug
output) and scored on that basis.

## Dimension 10 — a false positive, investigated and dismissed

The first mobile screenshot at 390×844 showed the hero paragraph clipped mid-word and the panels
running past the right edge. That looked like a HIGH-severity horizontal-overflow bug.

It was not. Instrumenting the live page showed:

```text
clientWidth=500 scrollWidth=500
DOC body scrolls horizontally: false
chart-wrap[0..6] overflowX=auto client=437 scroll=520 scrolls=true
```

Headless Chrome clamps its layout viewport to a **500 px floor**, so a screenshot requested at 390 px
captures the leftmost 390 px of a 500 px layout — the clipping was in the capture, not the page.
Removing `min-width: 520px` from the chart SVGs changed nothing, which was the first clue.

The measured behaviour is exactly the site convention: **wide content scrolls inside its own
`overflow-x: auto` container and the page body never scrolls horizontally.** All seven chart
wrappers scroll internally; the document does not. Dimension 10 passes.

Worth recording because the false positive is reproducible and the obvious "fix" — deleting the
chart `min-width` — would have made the charts illegible on small screens for no reason.

## Issues found

**None requiring a change.** The two Dimension 1/3 findings are inapplicable-by-design and the
Dimension 10 finding was a measurement artefact.

One observation, not a defect: `app.js` and `charts.js` are wrapped in `(function (global) {...})`
and `(function () {...})` IIFEs but the opening paren is preceded by a comment block, so a naive
`startsWith('(function')` check reports "no". The scoping is correct.

## Positive highlights

- **Nothing is estimated in the browser.** Every number comes from `results.json`, which is written
  by `analysis.R` in the same run that produces the post's figures. The app cannot drift from the
  post, because there is only one source of truth. Verified: all `att_headline` and `placebo_h1`
  values match the committed CSVs to eight significant figures.
- **Panel 5 carries the post's most original finding into an interaction.** The three-way toggle
  between "graded 1 quarter ahead", "graded 4 quarters ahead" and "as published (mixed horizons)"
  lets a reader *see* the SDID-variant ranking dissolve when the horizons are matched — an argument
  that takes three paragraphs in the post and one click here.
- **The solver panel is honest.** Panel 6 plots the estimate against Frank–Wolfe iterations with the
  package default marked, so the "the published number is where the optimiser stopped" claim is
  inspectable rather than asserted.
- **One pinned, integrity-checked dependency.** D3 is loaded from `d3@7.9.0` on jsDelivr with a
  `sha384` Subresource Integrity hash and `crossorigin="anonymous"` — stricter than the four other
  web apps on this site, which use the floating `d3js.org/d3.v7.min.js`.
- **Graceful failure.** If `results.json` cannot be fetched the app prepends a plain-text error
  naming the file and the command that regenerates it, built with `createElement`/`textContent`
  rather than string-interpolated HTML.

## Priority action items

None.

## Screenshots

Not retained — no HIGH-severity visual issue survived investigation.

## How to re-review

```bash
# Hugo publish + link check
/tmp/hugo-verify/hugo --gc --minify --buildFuture
ls public/post/r_sc_dsc_sdid/web_app/

# Browser pass (note the 500px viewport floor in headless Chrome)
cd content/post/r_sc_dsc_sdid/web_app && python3 -m http.server 8897 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --window-size=1280,900 --screenshot=/tmp/app.png http://localhost:8897/index.html
```

The generic `write-app` smoke test will not run against this app. Use the data-contract check in
this review instead: parse `data/results.json` and compare `results` and `placebo_h1` against
`../att_headline.csv` and `../placebo_h1_summary.csv`.

## Audit metadata

- Dimensions audited: 10 of 10 (1 and 3 partially N/A, documented above)
- Tooling: Chromium headless (`--headless=new`), Hugo 0.111.3, Python 3 static server
- Files written by this review: `web_app/REVIEW.md` only
