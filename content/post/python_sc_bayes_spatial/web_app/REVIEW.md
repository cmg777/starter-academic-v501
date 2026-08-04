# Review: python_sc_bayes_spatial Web App

**Audited:** content/post/python_sc_bayes_spatial/web_app/
**Date:** 2026-08-04
**Audit version:** review-app v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (Playwright 1.61.0, Chromium, desktop 1280×800 + mobile 375×667)

---

## Verdict: MAJOR REVISION

**Overall assessment.** The analytical core of this app is the strongest of any
reviewed on this site: every number it renders reproduces the post's source CSVs
exactly — all four Tab-1 ATTs match `att_ladder.csv` to 5e-7, and the in-browser
ESS estimator reproduces `stage3_summary.csv` (136.1 vs 136.78) and
`r_reconciliation.csv` (66.7 vs 66.86) without shipping a single hard-coded
figure. Hugo integration is flawless and the app runs with zero console errors
and zero uncaught exceptions across all four tabs, both slider extremes, and both
viewports. The verdict is driven by the presentation layer, not the arithmetic:
`styles.css` was shipped as a **verbatim copy of the write-app template** while
`index.html` was written with a different class vocabulary, so six classes the
markup uses (`chart-card`, `control-row`, `slider-row`, `control-label`,
`mini-btn`, `sep`) have no rules at all — the "snap to ρ̂" control renders as a
raw grey Arial UA button on the dark page and both sliders fall back to a 129×16
browser default. That single root cause, plus a tile-map label contrast of 1.6:1,
puts Dimensions 7 and 9 at 4.

**The one change with the highest leverage:** add the six missing CSS rules to
`styles.css` (issue #2). It closes the worst of Dimension 9, restores the 44 px
touch target in Dimension 5, and is the only fix on this list that touches a
single file.

---

## Dimension scores

| # | Dimension              | Score / 10 | Issues  | Notes                                                                 |
|---|------------------------|-----------:|--------:|-----------------------------------------------------------------------|
| 1 | File completeness      | 8          | 0/0/2   | `dgp.js`/`lasso.js` absent by design (Pattern A); bundle 280 KB        |
| 2 | HTML structure         | 8          | 0/0/2   | 4 tabs bind correctly via `aria-controls`; no `<h2>` in any pane       |
| 3 | JS correctness         | 6          | 0/2/2   | Adapted smoke test 13/13; 0 console errors, 0 uncaught exceptions      |
| 4 | Data contract          | 8          | 0/0/3   | All 28 paths resolve; ATT/ESS reproduce source CSVs exactly            |
| 5 | Accessibility          | 5          | 1/2/2   | Tile labels 1.6:1; body text 15.1:1 passes comfortably                 |
| 6 | Performance            | 9          | 0/0/1   | Load 83 ms; slider tick 87–92 ms; kernel 6 ms                          |
| 7 | Pedagogy               | 4          | 0/3/4   | Takeaway alignment **3/3** (exemplary); score driven by 3 MEDs         |
| 8 | Hugo integration       | 10         | 0/0/0   | `web_app/index.html` resolves exactly; all assets HTTP 200             |
| 9 | Visual design          | 4          | 0/5/3   | Template CSS vs bespoke markup: 6 classes undefined                    |
|10 | Mobile responsiveness  | 6          | 0/1/1   | No h-scroll; fixed chart margins collapse the plot area at 375 px      |

---

## Issues found

| #  | Dim | Severity | Location | Issue | Suggested fix |
|---:|----:|----------|----------|-------|---------------|
| 1  | 5   | **HIGH** | `charts.js:394–400` | Tile-map postal codes use `C.muted` (`#8b9dc3`) on a `d3.interpolateYlOrRd` fill whenever `abs(v)/vmax <= 0.45`. Because Nevada is 11× the next donor, **37 of 38 in-pool tiles** land in that band — contrast **1.61:1 to 2.68:1** against WCAG AA's 4.5:1. At ρ = 0 all 38 fail. Visually confirmed: the whole cartogram is pale-blue-grey on cream. | Replace the fill ramp with a palette-native dark→teal scale and pick label colour by measured luminance, not by value: `.attr("fill", isTreated ? "#141413" : (inPool && Number.isFinite(v) ? (d3.hsl(fill).l > 0.5 ? "#141413" : C.bright) : C.muted))`. |
| 2  | 9   | MED | `styles.css` (whole file) vs `index.html:37,45,47,127,131,166` | `styles.css` is the unmodified write-app template. It defines `.chart-area`, `.controls`, `.control`; the markup uses `.chart-card`, `.control-row`, `.slider-row`, `.control-label`, `.mini-btn`, `.sep`. Computed styles confirm: `.chart-card` → `background rgba(0,0,0,0)`, `border 0px none`, `padding 0px`; `.mini-btn` → `rgb(239,239,239)` bg, black **Arial**, `2px outset`, 71×21 px; `#rho-slider` → `appearance:auto`, 129×16 px (the `.control input[type=range]` thumb rules never apply). | Add to `styles.css`: `.chart-card{background:var(--panel-2);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px 8px;margin-bottom:18px}` `.chart-card svg{width:100%;height:auto;display:block}` `.control-row{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-bottom:14px}` `.control-label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;font-weight:600}` `.slider-row input[type=range]{flex:1 1 260px;min-width:200px;height:44px}` `.mini-btn{background:rgba(255,255,255,.08);border:1px solid var(--line);color:var(--text);border-radius:8px;padding:10px 14px;min-height:44px;font-family:inherit;font-size:13px;cursor:pointer}` `.sep{margin-left:18px;padding-left:18px;border-left:1px solid var(--line)}` |
| 3  | 9   | MED | `styles.css:220` (`.stat .stat-label`) | `text-transform: uppercase` maps Greek ρ (U+03C1) to Ρ (U+03A1), which is visually identical to Latin P. Tab 3 renders **"ATT AT THIS P"** and **"ESTIMATED P̂"** — in the tab whose entire subject is ρ. Confirmed in both desktop and mobile screenshots. | Add `.stat .stat-label{text-transform:none;font-variant-caps:all-small-caps}`, or drop the transform and write the labels in the case you want in `app.js:167,171`. |
| 4  | 9   | MED | `charts.js:227–230` | The forest plot's x-domain is set from `d3.min/max` over **all** rows, so ISCM's CI (≈ −133 to +60) drives it. The five core estimates (−18.85 to −15.68) compress into ~14 px of a 1030 px axis — the ladder comparison the tab exists to make is invisible. Worse at 375 px (issue #13). | Scale to the comparable rows and mark the rest as off-scale: set the domain from `rows.filter(d => d.comparable)`, then clamp out-of-domain markers to the edge and draw an arrow glyph, or split non-comparable rows into a second panel with its own axis. |
| 5  | 9   | MED | `charts.js:342–349` | The dumbbell legend is drawn inside the plot area at `translate(6,2)`, overlapping the top two data rows. At the default "sort by simplex weight" that is Utah and Montana — the two largest simplex weights, i.e. the most important rows on the chart. | Move the legend into the top margin or below the axis: change to `.attr("transform", "translate(6," + (f.ih + 26) + ")")` and add ~22 px to the frame height. |
| 6  | 9   | MED | `charts.js:233` vs `app.js:228` | Colour encoding for the same series is inconsistent inside Tab 4: the fixed-step chain is **orange** in the `ESS, fixed step` stat tile but **grey** (`C.muted`) in the trace legend 200 px below. Site convention reserves orange for the treated/highlighted series (correctly used in Tabs 1 and 3). | Use one colour per series in Tab 4. Either drop `accent: "orange"` from the `ESS, fixed step` tile in `app.js:228`, or pass `color: C.orange` for the R-specification series in `app.js:233`. |
| 7  | 3   | MED | `app.js:168` | `vals["Nevada"] \|\| NaN` treats a legitimate `-0` as missing, so at ρ = 0 the **Nevada spillover** tile renders `—` while the tile beside it correctly reads `0.0`, and the pedagogy panel below says "At ρ = 0 every spillover is zero by construction". Confirmed in-browser. The `vals[D.meta.donors[0]] === undefined` guard is also inert. | Replace the whole entry with `{ v: Number.isFinite(vals["Nevada"]) ? fmt(vals["Nevada"]) : "—", l: "Nevada spillover", accent: "orange" }`. |
| 8  | 3   | MED | `app.js:176–181` | At ρ = 0 every spillover is `-0`, so `sort((a,b) => Math.abs(b.value) - Math.abs(a.value))` is a no-op and the original alphabetical key order survives. "The ten largest spillovers at this ρ" then lists Alabama, Arkansas, Colorado, Connecticut, Delaware, Georgia, Idaho, Illinois, Indiana, Iowa — **Nevada is not among them** — all labelled `−0.000` with zero-length bars, directly contradicting the panel below it. | Guard the degenerate case before rendering: `if (Math.max.apply(null, items.map(function(d){return Math.abs(d.value);})) < 1e-9) { window.Charts.hbars("#chart-spillbars", [], {}); }` and have `hbars` show "Every spillover is zero at ρ = 0." Also normalise the sign: use `d3.format("+.3f")(d.value + 0)` so `-0` prints as `+0.000`. |
| 9  | 7   | MED | `index.html:124–125` vs `app.js:140–151` | The Tab-3 lede states "Everything here is precomputed — the browser is looking things up, not running MCMC." Only the ATT tile is looked up. `spilloversAt()` **linearly rescales** the single ρ̂ fit by `rho/rho_hat`, so the map and the bar chart are extrapolations, not model output. At ρ = 0.6 the app reports a Nevada spillover of −10.44 packs, a value no fit produced. The approximation is documented only in a source comment the reader never sees. | Say what the app does. Change the lede's last sentence to: "The ATT is read from a precomputed ρ-grid; the map rescales the fitted spillovers linearly in ρ, which preserves the ranking exactly and the magnitudes approximately." |
| 10 | 7   | MED | `index.html:182` | "Thin the chain and watch the effective sample size fall" is contradicted by the app's own output. Measured: k=1 → 136.1, k=6 → 134.0, k=18 → 135.5 — ESS is **flat**, because thinning removes draws and autocorrelation in equal measure. Past k=24 the Geyer estimator degenerates on the short series, and at **k=44 the fixed-step ESS overtakes the adaptive-step ESS** (k=60: 70 vs 61), inverting the tab's whole lesson. Confirmed in-browser. | Teach the true lesson and cap the range. Set `max="20"` on `index.html:168`, and reword to: "Thin the chain and watch the retained draws collapse while the ESS barely moves — thinning discards information without buying independence. The gap between the two traces, not the thinning, is what an adaptive step buys." Add a guard in `app.js:227` so an ESS computed from fewer than ~200 draws renders as `—`. |
| 11 | 7   | MED | `index.html:221–233` | Glossary cross-check against the post's §2 "Key concepts": 7 of the post's 9 terms are covered. **"Potential outcomes under interference"** — the post's concept #1 and the foundation of the whole SUTVA argument — is absent. (The post's "Spatial autoregressive (SAR) model" is adequately covered by the app's `ρ` entry.) | Add before the `SUTVA` entry: `<dt>Potential outcomes under interference</dt><dd>Y<sub>it</sub>(d<sub>1</sub>,…,d<sub>N</sub>): the outcome unit i would take under the whole <em>vector</em> of assignments. Dropping everyone else's assignment from the notation is exactly SUTVA — which is what Stage 3 tests.</dd>` |
| 12 | 5   | MED | `index.html:129,168,131`; computed styles | Touch targets fail on both viewports: both `input[type=range]` render at **129×16 px** and `.mini-btn` at **71×21 px**, against the 44×44 px minimum. Root cause is issue #2 — `styles.css:156` scopes the styled slider to `.control input[type=range]`, and these sliders live in `.control-row`/`.slider-row`. On mobile the ρ slider is 34% of the viewport width for a 31-step range (~4 px per step). | Covered by the CSS block in issue #2 (`.slider-row input[type=range]{min-width:200px;height:44px}`, `.mini-btn{min-height:44px}`). Also extend `styles.css:156–183` to `.control input[type=range], .slider-row input[type=range]` so the orange thumb applies. |
| 13 | 10  | MED | `charts.js:226, 424, 500, 539` | Chart margins are fixed pixel constants regardless of width. At 375 px the forest plot's `left: 190` on a 320-unit viewBox leaves ~106 px of plot area, and `widths()`'s `left: 200, right: 72` leaves ~48 px. Confirmed in the mobile screenshots: x-axis ticks overprint into unreadable strings (`0246810246` on "What each fix buys"; `−150−100−50 0 50` on the forest plot) and axis titles clip (`…credible interval (pac`, `MC iterations … gold: ESS`). | Scale the label gutter to the frame: in each `frame()` call replace the constant with `Math.min(190, Math.max(70, width * 0.30))` (and `Math.min(200, …)` for `widths`), and truncate row labels to a character budget derived from that gutter rather than the hard-coded 30/32 in `charts.js:267,529`. |
| 14 | 5   | MED | `charts.js:62` (and `charts.js:367`) | 8 of 9 SVGs carry `role="img"` with **no** `aria-label` and no `<title>`. `role="img"` removes the subtree from the accessibility tree, so the axis and series text that would otherwise be readable is suppressed and replaced with nothing — a screen reader announces nine unlabelled graphics. The tile cartogram (`charts.js:367`) has no `role` at all. | Give `frame()` a name parameter and emit both: `svg.attr("role","img").attr("aria-label", opts.label \|\| "")` plus `svg.append("title").text(opts.label)`, then pass a sentence per chart (e.g. `"California's observed cigarette sales against its synthetic counterfactual, 1970–2000"`). Add the same to the `tiles()` SVG. |
| 15 | 1   | LOW | `web_app/` | `dgp.js` and `lasso.js` are absent. This is correct for a Pattern-A app that ships a precomputed grid and runs no in-browser simulation, but the deviation is undocumented, so the skill's own `templates/smoke-test.js` aborts at load (`ENOENT … dgp.js`) and Dimension 1's file list appears to fail. | Add a two-line `web_app/README.md` (or a comment at the top of `app.js`) recording that this is a Pattern-A bundle with no in-browser DGP, so `dgp.js`/`lasso.js` are intentionally omitted and the stock smoke test must be adapted. |
| 16 | 1   | LOW | `data/results.json` | Two top-level payloads are never read by `app.js` or `charts.js`: `rho_sweep[].cf` (31 counterfactual arrays, 9,717 bytes) and `spillovers` (17,711 bytes — the app reads only `spillover_mean`). Together ~27 KB, **13% of the file**. | Either drop both from the `APP_DATA=1` writer in `analysis.py`, or spend `rho_sweep[].cf` — it is exactly what Tab 3 needs to show the counterfactual path moving with ρ, which would make the ρ slider considerably more instructive. |
| 17 | 2   | LOW | `index.html:21–24` | Tab buttons bind to panes with `aria-controls` rather than the template's `data-pane`. `app.js:28` reads `aria-controls`, so the app is internally consistent and the ARIA is more correct than the template's — but the skill's stock Playwright harness resolves `#null` and every downstream tooling assumption breaks. | Keep `aria-controls` and add the mirror attribute so both contracts hold: `<button … aria-controls="tab-stages" data-pane="tab-stages" id="btn-stages">` on all four buttons. |
| 18 | 2   | LOW | `index.html:30,86,120,159` | No `<h2>` in any tab pane — the document goes `<h1>` → `<h3>`, skipping a level, and the panes named by `aria-labelledby` have no heading of their own. | Add a visually-hidden or visible `<h2>` as the first child of each pane, e.g. `<h2>Three nested estimators</h2>`, matching the tab-button label. |
| 19 | 3   | LOW | `app.js:290–318` | There is no guard for a failed D3 load. If jsDelivr is unreachable or the SRI hash mismatches, `d3 is not defined` throws inside the `.then()` and lands in the `results.json` `.catch()`, so the user is told *"Could not load data/results.json (d3 is not defined). Rebuild it with: `APP_DATA=1 python analysis.py`"* — a wrong diagnosis whose suggested remedy is a ~60-minute refit. `render-and-fix.md` §4 prescribes an explicit fallback. | At the top of `boot()`: `if (typeof d3 === "undefined") { /* render a card reading "Failed to load D3 v7.9.0 from cdn.jsdelivr.net — check your connection or the SRI hash." */ return; }` |
| 20 | 3   | LOW | `charts.js:592–605` | Chart factories return `undefined` rather than an object exposing `update(...)`. The teardown-and-redraw approach is deliberate and documented at `charts.js:1–6`, and measured at 87–92 ms per tick, so nothing is broken — but it diverges from the widget contract the checklist assumes. | No change needed for correctness. If the contract matters, return `{ update: function (d, o) { return factory(sel, d, o); } }` from each factory. |
| 21 | 4   | LOW | `data/results.json` | Numeric values carry up to 13 decimal places (8 significant digits) — e.g. `-0.0000026768668`. `data-handling.md` §Pattern A step 5 prescribes rounding to 4 decimal places. | Round in the `APP_DATA=1` writer in `analysis.py`. At 4 dp the file drops roughly a further 15%. |
| 22 | 4   | LOW | `data/results.json` | The bespoke schema (`ladder`, `benchmark`, `reconciliation`, `budget`, `rho_sweep`, `tiles`, `postal`) is undocumented. It is a legitimate departure from `data-handling.md`'s `estimates`/`selection` shape — the app uses none of the template widgets — but nothing records the contract, so the mismatch reads as a defect. All 28 paths `app.js` dereferences resolve. | Document the shape in the `README.md` proposed in issue #15, or add a `"_schema"` string key to `results.json` naming the producing function in `analysis.py`. |
| 23 | 4   | LOW | `app.js:277` | The "snap to ρ̂" handler assigns `String(D.rho.hat)` = `"0.31613591"` to a slider with `step="0.02"`. It happens to work because the browser clamps to 0.32, but it relies on UA snapping rather than stating the intent — and `boot()` (`app.js:302`) already computes the correct value. | Use the same expression as `boot()`: `rs.value = String(Math.round(D.rho.hat * 50) / 50);` |
| 24 | 5   | LOW | `index.html:128,167` | Sliders carry no `aria-label`; the checklist expects one. Both do have a correctly associated `<label for>` ("Spillover intensity ρ", "Keep every k-th draw"), which supplies a proper accessible name — verified in-browser — so this is a convention deviation, not a defect. | Optional. If the `aria-label` convention should hold across apps, add `aria-label="spillover intensity rho"` and `aria-label="thinning interval k"`; the `<label for>` associations should stay either way. |
| 25 | 5   | LOW | `index.html:37–43, 93–99`; `app.js:15–33` | Two grouping/keyboard gaps: (a) the radio groups have no `<fieldset>`/`role="radiogroup"`, so the `<span class="control-label">Estimator</span>` and `Sort by` captions are not programmatically associated with their controls; (b) the tablist implements no arrow-key navigation — verified: `ArrowRight` on a focused tab does nothing. `Tab` + `Enter` do work. | (a) Wrap each row: `<div class="control-row" role="radiogroup" aria-label="Estimator">`. (b) In `initTabs()`, add a `keydown` listener mapping `ArrowRight`/`ArrowLeft` to focus and click the adjacent button, and manage `tabindex` (`0` on the active tab, `-1` on the rest). |
| 26 | 6   | LOW | `app.js:281` | `thin-slider` fires `drawTrust` on every `input` event with no debounce, recomputing both ESS series each time. The resize path at `app.js:284–287` *is* debounced at 180 ms. Currently harmless (6 ms per computation, 87–92 ms per tick measured end to end), but the inconsistency invites a regression if the draw arrays grow. | Wrap in the same debounce the resize handler uses, or memoise ESS by `k` — the values are deterministic and there are only 60 of them. |
| 27 | 7   | LOW | `index.html:31–35, 62` | The Tab-1 lede says "**Three** nested estimators", but the control row offers four options and the pedagogy panel below refers to "the other three", implying four. Three of the four *are* nested; BSCM is the deliberate aside. | Reword the lede's first sentence: "Four estimators on the California Proposition 99 panel — three of them nested, each keeping everything the previous one assumed except a single restriction, plus BSCM as a deliberate aside." |
| 28 | 7   | LOW | `app.js:226` | The `draws retained (adaptive)` tile reads **4,167** at k=1, while the pedagogy panel speaks of "a chain of a quarter of a million". Both are true — the shipped draws are a 1-in-60 subsample of the 250,000 post-burn draws (250,000 / 4,167 = 60.0) — but nothing on screen says so, and the two numbers appear ~300 px apart. | Change the label to make the subsampling visible: `l: "draws retained (of a 1-in-60 subsample of 250,000)"`. |
| 29 | 7   | LOW | `index.html:57–66, 73–82, 108–116, 146–155, 179–188, 195–204, 211–219` | Every `.pedagogy` block uses prose `<p>` — there is not one `<li>` in the app. `styles.css:248–250` styles `.pedagogy ul/li` for the bulleted form the checklist expects (≥ 2 bullets per block). The prose is genuinely well written, so this is presentation only. | Optional. Where a panel already enumerates (Tab 3's "Nevada … Idaho and Utah … everything beyond that second ring"), a `<ul>` would scan faster and would pick up the existing `li strong{color:var(--teal)}` rule. |
| 30 | 7   | LOW | `index.html:221–234` | The glossary is a single `<details class="gloss">` holding a 9-term `<dl>`, and it lives only at the bottom of Tab 4. A reader on Tabs 1–3 — where SUTVA, the simplex and the horseshoe first appear — cannot reach it. The checklist's "≥ 6 `<details class="gloss">`" is met in substance (9 terms) but not in structure. | Move the `<details>` out of `#tab-trust` to a sibling of `<main>` so it renders under every tab, or duplicate the 3–4 terms each tab needs into a per-tab `<details>`. |
| 31 | 9   | LOW | `charts.js:17, 21, 372` | Off-palette colours: `C.donor` `#54618a` and `C.violet` `#c47ad0` are not in `theme-tokens.css`, and `d3.interpolateYlOrRd` is a warm yellow→red sequential ramp on a navy dark theme — the direct cause of issue #1. | Replace the ramp with a palette-native interpolation: `d3.scaleSequential(d3.interpolate("#182447", C.teal))`. Add `#54618a` and `#c47ad0` to `theme-tokens.css` as documented extensions if they are to stay. |
| 32 | 9   | LOW | `charts.js:223, 358, 422, 467, 498, 538`; `app.js:312` | Both files set `className = "muted"` / `.attr("class","muted")` on their fallback and error messages, but `.muted` is not defined in `styles.css` (only the `--muted` custom property exists). Every "No estimates available." / "No tile layout." / data-load-failure message renders in full-strength body text. | Add `.muted{color:var(--muted)}` to `styles.css`. |
| 33 | 9   | LOW | `styles.css` | Roughly 60% of the file is dead template CSS for widgets this app does not use: `.card`, `.chart-area`, `.chart-caption`, `.controls`, `.control*`, `.grid*`, `.cta-*`, `.tag` + 5 variants, `.tooltip*`, `.outcome-toggle`, `.method-toggle`, `.method-row`, `.progress-bar`, `.kbd`, `.note`, `.action*`, `.gloss-body`, `.stat-sub`. | Delete the unused blocks once issue #2's rules are in, keeping only the tokens, layout, tab strip, stat tiles, pedagogy, glossary and footer. |
| 34 | 10  | LOW | `styles.css:51–58` | At 375 px the tab strip shows only tabs 1 and 2; tabs 3 and 4 require a horizontal swipe. It *does* scroll (`overflow-x:auto`, scrollWidth 787 vs client 375) so the checklist's reachability test passes, but there is no fade, shadow or arrow signalling that more tabs exist. | Add a scroll affordance: `nav.tab-strip{-webkit-overflow-scrolling:touch;mask-image:linear-gradient(90deg,#000 88%,transparent)}` at `max-width:600px`, or shorten the tab-4 label ("4 · Trust the Interval?"). |

---

## Pedagogical alignment (Dim 7 deep-dive)

**Post takeaways extracted** (weighted: §19 Summary ×3, §1.1 Learning objectives ×2, abstract ×2):

1. **Three nested estimators on one panel — each stage keeps everything the
   previous one assumed but one thing.** (§19 "Method"; §1.1 objective 2; §1.2)
2. **Modelling the leak makes the estimated effect larger; ρ̂ = 0.316 excludes
   zero and Nevada absorbs −5.50 packs, 11× the next-largest donor — the effect
   survives every relaxation, the clean-donor-pool assumption does not.**
   (§19 "Result"; abstract; §1.1 objective 1)
3. **Report the effective sample size beside every credible interval, or the
   interval is decoration — the R edition's 0.38-wide interval came from an ESS
   of 2.93; the corrected run reports 12.71 from an ESS of 137.**
   (§19 "Inferential lesson"; §1.1 objective 4)

**App messaging extracted:**

- Tab 1 lede: *"Three nested estimators on the California Proposition 99 panel.
  Each keeps everything the previous one assumed except a single restriction.
  Switch between them and watch the counterfactual — and the uncertainty around
  it — change."*
- Tab 1 tab label / pedagogy: "1 · Three Stages" / *"The BSCM path sits apart
  from the other three because it fits an explicit intercept the others do
  not; it is answering a slightly different question, not getting the same
  question wrong."*
- Tab 2 tab label / lede: "2 · Who's in the Blend" / *"The simplex forces donor
  weights to be non-negative and to sum to one. A horseshoe prior only makes
  zero likely."*
- Tab 3 tab label / pedagogy: "3 · Where It Leaked" / *"As ρ rises, Nevada moves
  first and moves furthest — it is the only donor that touches California."*
- Tab 4 tab label / lede: "4 · Can You Trust the Interval?" / *"The published R
  analysis of this model reported a 95% credible interval 0.38 packs wide. The
  corrected configuration reports 12.7."*

**Coverage:**

- Takeaway 1: ✓ covered — Tab 1 lede is a near-verbatim restatement ("three
  nested estimators", "keeps everything the previous one assumed except a
  single restriction"), reinforced by the tab label "Three Stages".
- Takeaway 2: ✓ covered — Tab 3 lede, tab label "Where It Leaked", and the
  pedagogy panel naming Nevada as the only contiguous donor; Tab 1's forest
  pedagogy carries the "survives every relaxation" half.
- Takeaway 3: ✓ covered — Tab 4 lede quotes both interval widths, and the
  pedagogy panel states the distinction explicitly: *"Effective sample size
  asks whether an interval is reliable; what you condition on asks whether it
  is complete."*

**Coverage score: 3/3** (ceiling for Dim 7 = 9; the actual score of 4 is set by
issues #9, #10 and #11, not by misalignment).

**Glossary check:**

- Post §2 lists 9 key concepts; the app glossary covers **7** of them
  (ATT, Donor pool, Simplex, Horseshoe prior, SUTVA, Spillover effect, ESS),
  and its `ρ` entry adequately covers the post's "Spatial autoregressive (SAR)
  model". The app adds one term of its own, `propagate_alpha`.
- Missing: **"Potential outcomes under interference"** (post concept #1) —
  issue #11.

---

## Widget catalog audit

| Tab | Widget archetype | Status | Notes |
|-----|------------------|--------|-------|
| 1 | Estimator-comparison forest plot (#3 READY) + trajectory/gap panels (adapted from DiD event-study #5 STUB) | READY | Fully implemented against real data; the STUB trajectory archetype was hand-promoted. Axis-domain defect at issue #4. |
| 2 | *No catalog match* — simplex-vs-horseshoe dumbbell with credible intervals | READY | Bespoke. Worth adding to `widget-catalog.md` as archetype #11. |
| 3 | Spatial map (#7 STUB) | READY | Hand-promoted from STUB to a working tile cartogram + ranked bars. Label-contrast defect at issue #1. |
| 4 | Bayesian posterior explorer (#10 STUB) | READY | Hand-promoted from STUB to trace + thinning + interval-width + budget ladder. Thinning-lesson defect at issue #10. |

**No STUB placeholder cards ship in any user-facing tab.** Three of the four
tabs promote catalog STUBs to working widgets, which is the opposite of the
failure mode `render-and-fix.md` §8 warns about.

---

## Positive highlights

- **Every displayed number is derived, not transcribed.** The adapted smoke test
  recomputes all four Tab-1 ATTs from `outcome.treated` and `counterfactual.*`
  in JS and matches `att_ladder.csv` to a maximum absolute difference of
  **4.62e-7** across all four stages (`app.js:74–79`). The Tab-4 ESS estimator
  (`app.js:185–206`, Geyer's initial-positive-sequence) independently reproduces
  `stage3_summary.csv` (136.1 vs 136.78) and `r_reconciliation.csv` row 3
  (66.7 vs 66.86) — the app recomputes the post's headline diagnostic in the
  browser rather than shipping it as a constant.
- **The D3 dependency is pinned and verified.** `index.html:248–250` loads
  `d3@7.9.0` from jsDelivr at an exact version with
  `integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i"`
  and `crossorigin="anonymous"`. The hash was recomputed from the live CDN
  artifact during this audit and **matches byte for byte**. The comment above it
  explains why the `d3js.org/d3.v7.min.js` alias the template uses cannot carry
  an SRI hash — this is a genuine improvement on the template, not a deviation.
- **Tab 1's "Reading the forest plot honestly" panel is the best pedagogy in any
  app on this site.** It marks `SPILLSYNTH(cd)`, `SpSyDiD` and `ISCM` grey and
  states *why* each targets a different estimand, then names the failure mode it
  is preventing: "Putting them in one column without that distinction would be
  the easiest way to draw a false conclusion from a tidy-looking table." The
  colour logic backing it is real, not decorative (`charts.js:248`:
  `d.comparable ? (d.core ? C.teal : C.steel) : C.muted`).
- **Hugo integration is exactly right.** `index.md:20` uses
  `url: web_app/index.html`, and the rendered post emits
  `href="/post/python_sc_bayes_spatial/web_app/index.html"` verbatim — the
  trailing-slash rewrite documented in `render-and-fix.md` §1 is avoided. All
  five shipped assets plus `data/results.json` return HTTP 200.
- **Zero runtime defects.** Across 4 tab activations, 6 slider positions
  including both extremes of both sliders, a full mobile pass and a keyboard
  pass: **0 uncaught exceptions, 0 console errors, 0 console warnings, 0 failed
  requests**. Load-to-`load` was 83 ms and the slowest slider tick 92 ms, both
  far inside budget. `app.js:38–57` also builds every stat tile with
  `createElement`/`textContent` rather than `innerHTML`, and `charts.js:46–50`
  escapes tooltip interpolations — neither was necessary for author-generated
  data, and both are correct anyway.

---

## Priority action items

1. **[HIGH]** Fix the tile-map label contrast (issue #1). 37 of 38 in-pool
   tiles are currently 1.6:1–2.7:1 against a 4.5:1 requirement, which makes the
   flagship spatial visual unreadable. Swapping `d3.interpolateYlOrRd` for a
   palette-native dark→teal ramp (issue #31) fixes the contrast and the
   off-palette finding in one change.
2. **[MED]** Add the six missing CSS rules to `styles.css` (issue #2). Highest
   leverage on the list: one file, and it also closes the touch-target failure
   (#12) and much of Dimension 9.
3. **[MED]** Repair the ρ = 0 endpoint (issues #7 and #8). The pedagogy panel
   explicitly invites the reader to that value, and all three of the app's
   Tab-3 surfaces misbehave there.
4. **[MED]** Reconcile Tab 4's thinning claim with what the app actually
   computes, and cap the slider at k = 20 (issue #10) — currently the maximum
   slider position teaches the opposite of the intended lesson.
5. **[MED]** Make the chart margins width-responsive (issue #13) so Tabs 1 and
   4 remain readable at 375 px, where axis ticks presently overprint.

---

## Screenshots (HIGH-severity visual issues only)

None emitted. The single HIGH issue falls under Dimension 5 (accessibility),
not Dimension 9 or 10, so per `headless-browser.md` § "Screenshot retention"
the temporary screenshots were deleted and none were copied into the repo.

---

## How to re-review

After applying the fixes, re-run:

    /project:review-app python_sc_bayes_spatial

To focus on the dimension you just fixed:

    /project:review-app python_sc_bayes_spatial focus: visual
    /project:review-app python_sc_bayes_spatial focus: accessibility
    /project:review-app python_sc_bayes_spatial focus: pedagogy

---

## Audit metadata

- Hugo port used: 1316 (`hugo server --disableFastRender --buildFuture`,
  v0.111.3 extended)
- Node version: v25.9.0
- Playwright: enabled, v1.61.0 (Chromium; already cached, no bootstrap needed)
- Phases run: Phase 2 static ✓ · Phase 3 Node smoke test ✓ (adapted) ·
  Phase 4.1 Hugo HTTP ✓ · Phase 4.2 Playwright desktop 1280×800 ✓ and mobile
  375×667 ✓. No phase was skipped.
- **Tooling note — smoke test adapted.** The stock harness at
  `.claude/skills/write-app/references/templates/smoke-test.js` aborts on this
  app with `[✗] failed to load JS module: ENOENT … dgp.js` (exit 1), because it
  loads `dgp.js` + `lasso.js` and exercises `LASSO.qnorm`,
  `DGP.simulate_lasso` and `LASSO.lasso_path`. This app ships neither file by
  design — it is Pattern A with a precomputed grid and no in-browser
  simulation. An adapted harness preserving each stock assertion's intent
  (module loads and exports its documented surface; no template leakage; the
  numerical kernel is correct; the kernel is fast; `results.json` schema is
  valid) plus data-contract and ground-truth checks was run instead:
  **13 of 13 checks passed, exit 0**. This is an adaptation, not a failure —
  see issue #15.
- **Tooling note — browser harness adapted.** The reference script in
  `references/headless-browser.md` reads `button.getAttribute("data-pane")`;
  this app binds tabs with `aria-controls` (issue #17), so the stock selector
  resolves to `#null`. The pane lookup was changed to `aria-controls`; all
  other logic follows the reference, plus extra probes for computed styles,
  contrast, touch-target boxes and keyboard behaviour.
- Repository state: read-only audit. `REVIEW.md` is the only file written;
  `git status` confirms no modification to `index.html`, `styles.css`,
  `charts.js`, `app.js`, `data/results.json` or `index.md` (all mtimes
  unchanged at 12:24–13:23). All temporary artefacts were written to the
  session scratchpad.

---

*Generated by `/project:review-app`. Skill at `.claude/skills/review-app/`.
Verification rubric at `references/scoring-and-criteria.md`.*

---

# Resolution — 2026-08-04

All findings acted on. The app was re-tested in Chrome afterwards at desktop and
mobile viewports.

## The HIGH, and the root cause behind most of the rest

| Dim | Finding | What changed |
|---|---|---|
| 5 | **HIGH** — tile labels drew in `#8b9dc3` regardless of fill, and the fill threshold was a *value* threshold (`abs(v)/vmax > 0.45`). Nevada is 11× the next donor, so 37 of 38 tiles fell below it and landed at 1.61–2.68:1 contrast. | Label colour now follows the tile's own fill luminance (`d3.hsl(fill).l > 0.55`). Verified in the browser: **38 tiles dark on light, 1 light on Nevada's dark red, 9 muted for non-pool states** |
| 9 | Six classes used in `index.html` had **no rules at all** in `styles.css` — `.chart-card` rendered transparent and unpadded, `.mini-btn` fell back to the OS default button (Arial on a navy page), and the range inputs lost the styled thumb because it is scoped to `.control input[type=range]` | All six defined. Verified computed styles: `.chart-card` background `rgb(31,43,94)` with a 1px border and 14px padding; `.mini-btn` on-palette at **44px** tall; sliders **44px** — both now meeting the WCAG 2.5.5 touch target |
| 9 | `text-transform: uppercase` on `.stat-label` maps Greek ρ to capital Rho, rendering **"ATT AT THIS P"** and **"ESTIMATED P̂"** | First attempt (`font-variant-caps: all-small-caps`) reproduced the same bug and was caught in a browser zoom. Final fix keeps the uppercase look and exempts non-Latin runs: `statTiles()` wraps them in `.nocaps`. Verified rendering as **"ATT AT THIS ρ"** |

## Correctness

| Dim | Finding | What changed |
|---|---|---|
| 3 | `vals["Nevada"] \|\| NaN` — at ρ = 0 the value is `-0`, which is falsy, so Nevada read "—" while the tile beside it read "0.0" | → `Number.isFinite(...)`. Verified at ρ = 0: reads **0.00** |
| 3 | At ρ = 0 every value is `-0`, so the comparator returns 0 for every pair and "the ten largest spillovers" degenerated to ten arbitrary states in JSON order, with Nevada absent | Degenerate case detected and replaced with a sentence explaining that SUTVA is imposed at ρ = 0 and there is no ranking to draw. Verified: **`bars_svg=0` plus the message at ρ = 0**, chart back at ρ > 0 |
| 9 | The forest x-domain was set by `ISCM`'s [−136, +61] interval — a row marked *not comparable* — compressing the five estimates a reader came for into ~14px of 1030 | Domain now taken from the comparable rows. Off-scale values are **clamped to the axis edge, drawn with a dashed stroke and a chevron**, and the tooltip says "off scale — pinned to the axis edge", so nothing reads as an in-range value. Verified: 2 chevrons drawn |
| 9 | The dumbbell legend sat at `translate(6,2)`, over Utah and Montana — the two largest weights | Moved to the bottom-left of the plot area |
| 9 | The fixed-step chain was orange in the stat tile and grey in the trace legend 200px below | One colour per series — orange in both |
| 7 | The ρ tab's lede claimed "everything here is precomputed — the browser is looking things up", but only the ATT is a lookup; the per-state spillovers are a **linear rescale** of the fit at ρ̂ | Lede rewritten to say exactly that: the ranking is exact, the levels away from ρ̂ are an approximation, not a refit |
| 7 | "Thin the chain and watch the effective sample size fall" is false. Measured on the app's own data: ESS is **flat** from k=1 to k=18 (136.1 → 135.5), and at k=44 and k=60 the *fixed-step* chain overtakes the adaptive one (77.8 vs 73.7; 70.0 vs 60.7) — inverting the lesson on estimator noise | Slider capped at **k = 20**, and the text now teaches what actually happens: ESS counts information, not rows, so discarding redundant draws barely moves it. Verified: `max="20"` |
| 7 | The glossary covered 7 of the post's 9 concepts, omitting **potential outcomes under interference** — the one everything else rests on | Added as the first entry |
| 10 | Fixed pixel margins (up to 200px left) left ~48px of plot area at 375px, with overprinting ticks and clipped titles | `frame()` now shrinks left/right margins proportionally on narrow viewports only — no-ops on desktop |
| 5 | 8 of 9 SVGs carried `role="img"` with no accessible name, which hides the subtree from assistive tech and supplies no replacement | `frame()` derives the name from the chart's own visible heading and sets both `aria-label` and `<title>`. Verified: **9 of 9 role=img SVGs now named** across all four tabs |

## Re-verification in Chrome

- 4 tabs, 9 SVGs, **0 page errors, 0 console errors**
- ρ slider driven through 0 → 0.6 → 0.32; thinning slider through its full range
- D3 **v7.9.0** loading from the pinned, SRI-protected CDN entry (unchanged — the pin and
  hash were verified correct in the original audit and were not touched)
- `node --check` clean on both `app.js` and `charts.js`
