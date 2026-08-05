# Web App Review: `python_bridge_impact`

**App:** `content/post/python_bridge_impact/web_app/`
**Reviewed:** 2026-08-05 — all 10 dimensions, browser pass enabled (desktop + narrow)

## Verdict: MINOR REVISION

Every chart draws, every control responds, the console is clean, and all 141 displayed values match
the post's CSVs exactly. Three pedagogy/accessibility items keep it off ACCEPT: no glossary, no
"what to look for" panels, and 10 unlabelled `role="img"` SVGs.

## Scores

| # | Dimension | Score | Note |
|---|-----------|------:|------|
| 1 | File completeness | 9 | 5 files + `data/results.json`. The skill's canonical 7-file list (`dgp.js`, `lasso.js`) is specific to the lasso reference app and does not apply to a DiD explorer |
| 2 | HTML structure | 9 | 5 tabs with matching `role="tab"` / `aria-selected` pairs; D3 loads before `app.js`; heading hierarchy clean |
| 3 | JS correctness | 9 | **0 console errors** across all 5 tabs and every control interaction; no `{{…}}` leakage in any file |
| 4 | Data contract | 10 | **141 values verified against the post's CSVs, 0 mismatches** |
| 5 | Accessibility | 6 | All 4 inputs labelled, tabs correct — but 10/10 SVGs are `role="img"` with no `aria-label` or `<title>` |
| 6 | Performance | 9 | Every control tick redraws in well under 300 ms |
| 7 | Pedagogy | 6 | Strong tab-1 lede and theory table, but no glossary and no "what to look for" panels |
| 8 | Hugo integration | 10 | `url: web_app/index.html` (relative, no trailing-slash bug); asset resolves 200; D3 pinned with SRI |
| 9 | Visual design | 10 | 8 distinct hex values, all from the dark-theme palette; no off-palette colors |
|10 | Mobile responsiveness | 9 | All 10 SVGs use `viewBox`; `.chart-area svg { width: 100%; height: auto }`; media queries at 900 px and 720 px; no horizontal body scroll |

## Smoke test

```
[✗] failed to load JS module: ENOENT … web_app/dgp.js
```

**Not an app defect.** `write-app/references/templates/smoke-test.js` is hard-coded to the
`r_double_lasso` template (`dgp.js`, `lasso.js`, `lasso_path`). This app is a DiD explorer with a
different module layout, so the shared smoke test cannot run against it. The browser pass below
substitutes for it, and is a stronger check.

## Browser pass

**Desktop.** Every tab was activated and every visible control exercised:

| Tab | SVGs drawn | Marks rendered |
|---|---:|---:|
| 1 · The Question | 1 | 12 |
| 2 · DiD Lab | 2 | 91 |
| 3 · Event Study | 1 | 37 |
| 4 · Distance | 2 | 34 |
| 5 · Robustness | 4 | 278 |

**10 SVGs, all with `viewBox`, all rendering marks. 0 console errors.**

**Interactivity.** All four controls were driven and produce a redraw:

| Tab | Control | Effect |
|---|---|---|
| 2 · DiD Lab | `lab-violation` | 452 → 442 marks |
| 2 · DiD Lab | `lab-outcome` | 442 → 450 marks |
| 4 · Distance | `space-horizon` | 450 → 456 marks |
| 5 · Robustness | `robust-m` | constant mark count (fixed-geometry band chart) — **verified separately**: 4 distinct readouts across M = 0, 0.5, 1, 2 |

The HonestDiD slider was checked specially because a mark count alone would have looked static. It
is not — the readout tracks the slider through all four positions.

## Data contract

`results.json` carries 16 top-level keys. Every numeric value in `table1`, `table2`, `table4`,
`honest`, `twoByTwo` and `eventStudies.nightlights` was compared against the corresponding post CSV:

```
DATA CONTRACT: 141 values verified against the post CSVs, 0 mismatches
audit claim in app: 122 / 122
```

The app cannot drift from the post without this check failing.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | 5 Accessibility | MEDIUM | `charts.js:33` | Every SVG gets `role="img"` but no accessible name, so a screen reader announces ten bare "image"s | Pass a title through `frame()`: `svg.append("title").text(label)`, or set `aria-label` |
| 2 | 7 Pedagogy | MEDIUM | `index.html` | No glossary. The skill's bar is ≥ 6 entries; the app introduces ATT, parallel trends, event study, LWDR, KOBDR, HonestDiD and the propensity trim with no lookup | Add a collapsible glossary block reusing the post's 8 concept-card definitions |
| 3 | 7 Pedagogy | MEDIUM | tabs 2–5 | No "what to look for" panel on any interactive tab. A reader who moves a slider is not told what change would be meaningful | One sentence per tab, e.g. on tab 5: "Watch the lower bound. Once it crosses zero the result no longer excludes a null effect — that happens just under M = 1." |
| 4 | 7 Pedagogy | LOW | tab 1 | The lede sets up the theory trap well but never surfaces the three headline numbers (+5.9%, −1.2 pp, +26.5%) | Add a three-stat strip under the lede, matching the slide deck's key-result strip |
| 5 | 1 File completeness | LOW | `styles.css:199` | `.chart-caption` is styled but never emitted by any file — dead CSS | Either emit captions from `frame()` (which would also help issue 1) or drop the rule |

## Positive Highlights

- **The data contract is airtight.** 141 values cross-checked against the post's CSVs with zero
  drift. This is the thing most likely to rot silently, and it is exactly right.
- **The tab-1 lede is genuinely good writing.** It poses the question, gives the cost and travel-time
  facts, and then lays out the trap — *"A study that measured only manufacturing would see the share
  fall, write the word 'deindustrialisation', and declare backwash. It would be wrong, and it would
  have no way of knowing."* That is the post's central insight, stated better than most textbooks.
- **Responsive by construction:** every chart uses `viewBox` plus `width: 100%; height: auto`, so the
  charts scale rather than clip, and no tab produces horizontal body scroll.
- **D3 is pinned with a real SRI hash**, not a bare CDN `<script>`.

## Priority Action Items

1. **[MED]** Give each SVG an accessible name (`<title>` or `aria-label`) in `frame()`.
2. **[MED]** Add a glossary with at least 6 entries, reusing the post's concept-card definitions.
3. **[MED]** Add a one-sentence "what to look for" panel to each interactive tab.
4. **[LOW]** Surface the three headline numbers on tab 1.
5. **[LOW]** Emit or remove `.chart-caption`.
