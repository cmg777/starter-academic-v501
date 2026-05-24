# Web App Review — stata_did

**Audit date:** 2026-05-24
**Focus:** all 10 dimensions (with a deep overlap audit)
**Browser pass:** enabled (Playwright 1.x / Chromium, 1280x800 + 375x667)
**Reviewer:** Claude Opus 4.7 via `review-app` skill (manual run; `disable-model-invocation: true`)

## Verdict

**ACCEPT** — after overlap fixes and inherited-template y-axis corrections (see "Fixes applied" below).

## Dimension scores

| # | Dimension              | Score | Notes |
|---|------------------------|------:|-------|
| 1 | File completeness      | 10 | 7/7 expected files present (`index.html`, `styles.css`, `dgp.js`, `lasso.js`, `charts.js`, `app.js`, `data/results.json`). |
| 2 | HTML structure         | 10 | 4 tabs with matching button/pane IDs; `role="tab"`/`aria-selected`; heading hierarchy h1→h2→h3→h4; D3 loaded before app.js. |
| 3 | JS correctness         | 10 | Smoke test 8/8 passes. Browser console: 0 errors across all four tabs (desktop + mobile). |
| 4 | Data contract          | 10 | `results.json` parses; 7 estimate rows, event_study (8 periods), means_2x2, table2, selection — all numbers match the post's `results_report.md` / Table 1 / Table 2 (25.32 ATT, 36.20 ITS, 10.88 drift). |
| 5 | Accessibility          | 9  | All sliders have semantic labels; tabs use `role="tab"`+`aria-selected`. Slider `aria-label` could be added explicitly (currently relies on adjacent `<label>`). |
| 6 | Performance            | 10 | Smoke perf `lasso_path(n=500, p=100)` = 101 ms (well under 300 ms cap). Sliders respond instantly. |
| 7 | Pedagogy               | 9  | Tab-1 lede foregrounds all three post takeaways (43% ITS overstatement, five-estimator convergence on 25.31–25.33, parallel-trends event-study evidence). 8 glossary entries. "What to look for" panel present in Tab 2. |
| 8 | Hugo integration       | 10 | YAML link `web_app/index.html` (no trailing slash); all assets HTTP 200. |
| 9 | Visual design          | 9  | Dark palette tokens only (steel/orange/teal/muted). After overlap fixes, legends and annotations no longer collide with data lines. |
|10 | Mobile responsiveness  | 9  | Tab strip horizontal-scrolls cleanly on 375x667; charts use `viewBox` (`preserveAspectRatio: xMidYMid meet`) so they scale down readably. Legend placement below x-axis remains legible on mobile. |

## Issues found and fixed

| Severity | Dim | Location | Issue | Fix applied |
|----------|-----|----------|-------|-------------|
| **HIGH** | 9 | `app.js` → `initParallelTrends` (Tab 2 chart) | Legend was placed at `translate(W-260, 8)` (top-right inside SVG); the orange "Observed treated" line rises through this region and overlaps both the legend strokes and the orange ATT label "DiD α̂: +50 GPA pts". Y-domain capped at 110 also caused the orange endpoint to be clipped at high δ. | Moved legend to a centered horizontal row BELOW the x-axis label with a semi-transparent rounded background; moved ATT label to the top-LEFT of the plot area (over the low-GPA pre-period region); widened y-domain to [40, 135] so the orange endpoint never clips at max δ+pre-trend (=132). |
| **HIGH** | 9 | `charts.js` → `parallel_trends_animation` (Tab 1 intro) | Same pattern: legend at `translate(W-240, 10)` top-right of plot; the orange "Observed treated" line passes through it at all but the smallest deltas. | Moved legend below x-axis label in a horizontal row with semi-transparent background; moved ATT label to top-LEFT; bumped y-domain to [4.5, 6.4] for more headroom. |
| **HIGH** | 9 | `charts.js` → `did_sim_histograms` (Tab 3, run 100 sims) | "True ATT = 25.000" label was anchored at `(x(true_att)+6, 12)` — directly over the histogram bars in the central peak region. Mini legend at `(w-160, 0)` overlapped the right-edge bars. | Moved the True-ATT label ABOVE the plot area (y=-10) with clamped x in [60, w-60]; moved the legend BELOW the x-axis label with semi-transparent background; renamed legend rows from "TWFE"/"CS-style" to "ITS (naive)"/"DiD" to match this post's actual comparison. Bottom margin grew from 44 to 80 to accommodate. |
| **HIGH** | 9 | `charts.js` → `did_event_study` (Tab 4) | Legend at `translate(w-220, 4)` top-right of plot lacked a background; risked overlap with the steep jump to ~25 at event_time=0. | Moved legend to top-LEFT of plot (over the small pre-treatment leads where the line hovers near 0) and added a semi-transparent rounded background rect for guaranteed text readability. |
| **MED**  | 7 | `charts.js` → `parallel_trends_animation` y-axis label | Said "Log teen employment (mean)" — inherited from a different DiD post (`r_did` minimum-wage employment effects). This post is about GPA in 35 high schools. | Changed to "Outcome (mean, illustrative units)" — neutral phrasing that fits the qualitative animation (which uses a 4.5-6.4 scale unrelated to the GPA numbers). |
| **MED**  | 7 | `charts.js` → `did_event_study` y-axis + x-axis labels | Said "ATT(e): Log teen-employment effect" and "Event time (years relative to treatment)". The Stata post is GPA-points across school-year periods. | Changed to "ATT(e): GPA-point effect" and "periods relative to treatment". |
| **MED**  | 7 | `app.js` → Tab 2 y-axis label | Said "GPA (0-100 scale)" but the y-domain now extends to 135 to accommodate large δ+pre-trend slider values. | Changed to "GPA (0-100+ scale)" to match. |

No HIGH issues remain after fixes.

## Positive highlights

1. **Excellent post-app alignment.** Tab-1 lede directly quotes the 43% overstatement (10.88 / 25.32) finding; Tab 4 reproduces the five-estimator convergence to 25.31-25.33; Tab 2 lets the student feel the parallel-trends assumption.
2. **Pure-client D3 stack.** No backend, no build step. `dgp.js` + `lasso.js` are shared with `r_double_lasso` and pass the smoke test unchanged.
3. **Clear narrative arc across tabs.** Intro story → parallel-trends knob → DiD-vs-ITS Monte Carlo → estimator agreement. Each tab builds on the prior.
4. **Glossary of 8 entries** covering the conceptual heavy lifters: 2x2 DiD, ATT, counterfactual, TWFE, event study, ITS, clustered SE, parallel trends.
5. **Two-route arithmetic explanation in Tab 4** (row-wise vs column-wise differences both yielding 25.32) is one of the cleanest "double-difference" explainers I've seen.

## How to re-review

```
"$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender --port 1352 &
BASE=content/post/stata_did/web_app node .claude/skills/write-app/references/templates/smoke-test.js
# Then open http://127.0.0.1:1352/post/stata_did/web_app/
```

Or via the skill: `/project:review-app stata_did focus: visual`.
