# Web App Review — r_sc_multi_country

**Verdict: ACCEPT** · Reviewed 2026-06-05 (revised for the inference update) · App at
`content/post/r_sc_multi_country/web_app/`

Comprehensive audit across 10 dimensions. `node --check` on charts.js + app.js, local
HTTP-200 serve, and headless Chromium across **all 5 tabs** at desktop (1280×800) and
mobile (375×667).

## What changed in this revision

The simulated effects were enlarged and made statistically significant, and the app gained
a full **inference layer**:

- **New 5th tab — "Inference"**: a significance scoreboard (six headline results with CIs /
  p-values and significant / not-significant / borderline badges) and an interactive
  simulator (effect-size / noise / pre-period sliders that widen or narrow the CI and flip
  the verdict at the 5% line).
- **Significance badges** on the Single tab (C01 significant; C05 not) and a new **forest
  plot** on the Many-Units tab (per-unit + pooled jackknife CIs, coloured by significance,
  with truth ticks).
- The Many-Units table now shows **both** the jackknife and wild-bootstrap CIs with per-row
  badges, surfacing the inference-method-disagreement lesson.
- A new D3 `forest()` chart factory in `charts.js`.

## Dimension scores

| # | Dimension | Score | Notes |
|---|-----------|------:|-------|
| 1 | File completeness | 10 | index.html, styles.css, charts.js, app.js, data/results.json all present |
| 2 | HTML structure | 10 | 5 tabs, semantic header/nav/main/footer, valid tab/tabpanel roles |
| 3 | JS correctness | 10 | `node --check` passes both JS files; simulator uses a deterministic seeded RNG (no `Math.random`) |
| 4 | Data contract | 10 | results.json schema matches all accessors incl. new sig_jack/sig_boot/ci_plain/multiout/pooled_sig fields |
| 5 | Accessibility | 10 | html lang=en, tabs role=tab + aria-selected, panes role=tabpanel, radios/sliders label-wrapped, SVG role=img |
| 6 | Performance | 10 | load < 1 s; 24 KB JSON, D3 from CDN; simulator recompute is O(40) per slider input |
| 7 | Pedagogy | 10 | Inference tab teaches significance directly; scoreboard + simulator align with the post's Section 9 |
| 8 | Hugo integration | 10 | Opens from the post's "Web app" YAML link; relative `data/results.json` fetch resolves; no trailing-slash bug |
| 9 | Visual design | 10 | Dark palette consistent with site; badges reuse the teal/muted/orange scheme; forest + bands legible |
| 10 | Mobile responsiveness | 10 | 0 per-tab overflow at 375 px; scoreboard collapses to 2 columns; tables wrapped in `overflow-x:auto` |

## Headless browser results (desktop 1280×800 + mobile 375×667)

- **All 5 tabs render with 0 console / page errors** on both viewports.
- **Inference tab:** scoreboard renders 6 rows; simulator chart renders; badge logic verified —
  low noise → **significant** (p < 0.001), noise = 4 → **not significant** (p = 0.087), noise = 0.5 → **significant** (the badge flips live).
- **Many-Units tab:** forest plot renders (6 points), table shows 12 jack/boot badges.
- **Single tab:** C01 badge = "plain SCM: significant", CI [6.00, 6.51] (excludes zero);
  C05 badge = "plain SCM: not significant".
- **Dynamic readouts verified:** hero Spearman 0.74; C05 sign-flip (+1.90 → −1.15); EMU pooled
  −0.016 reported as not significant under both methods.

## Issues

No HIGH, MED, or LOW issues outstanding. All dimensions = 10. **ACCEPT.**
