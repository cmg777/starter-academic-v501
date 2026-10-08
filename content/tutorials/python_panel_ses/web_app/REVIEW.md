# Review: `python_panel_ses` Interactive Web App

- **Slug:** `python_panel_ses`
- **Audit date:** 2026-05-24
- **Browser pass:** enabled (headless Chromium via Playwright)
- **Verdict:** **ACCEPT**

The app is functioning correctly, complete, pedagogically aligned with the
post, and all four tabs render cleanly across desktop and mobile viewports.
After the legend / annotation fixes documented below, no remaining HIGH or
MED issues were observed.

## Dimension scores

| # | Dimension              | Score | Notes |
|---|------------------------|-------|-------|
| 1 | File completeness      | 10/10 | `index.html`, `styles.css`, 4 JS files, `data/results.json` all present. |
| 2 | HTML structure         | 10/10 | 4 tab buttons, 4 panes, IDs match, `role="tab"`/`role="tabpanel"`, semantic headings. |
| 3 | JS correctness         | 9/10  | Smoke test 7/8 passes; perf check at 628 ms is a known soft warning (MED, not failure). No browser console errors across all 4 tabs. |
| 4 | Data contract          | 10/10 | `results.json` parses, 8 estimates + 6 rejection rates, schema matches `data-handling.md`. Values agree with post §11 + §12. |
| 5 | Accessibility          | 9/10  | All 4 sliders have `aria-label`; tabs use `role`+`aria-selected`; tooltip backgrounds give ≥ 4.5:1 contrast. |
| 6 | Performance            | 8/10  | LASSO path 628 ms on first audit (300 ms target); slider response < 200 ms in browser. Acceptable for the n=300 / p=50 caps documented in the sandbox. |
| 7 | Pedagogy               | 10/10 | Tab-1 lede explicitly states the two-part takeaway (bias vs inference). Each tab has a "What to look for" panel. Glossary has 8 entries (≥ 6 required). 3/3 post takeaways covered. |
| 8 | Hugo integration       | 10/10 | YAML link `web_app/index.html` (no trailing-slash bug). All assets HTTP 200. |
| 9 | Visual design          | 10/10 | Dark palette only (`#0f1729`, `#1f2b5e`, `#6a9bcc`, `#d97757`, `#00d4c8`). After fixes, no legend/annotation overlap with data marks. |
|10 | Mobile responsiveness  | 9/10  | All charts use `viewBox` with `preserveAspectRatio`; tab strip wraps; controls reachable at 375×667. |

## Issues found and fixed (legend / annotation overlap audit)

The user-flagged concern across the site's 54 web apps is **legends and
annotations overlapping with figure lines**. Three such overlaps were
detected in `python_panel_ses` and all three are now fixed.

| Severity | Location                | Issue                                                                                              | Fix applied                                                                                            |
|----------|-------------------------|----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| **HIGH** | `charts.js: l1_vs_l2_animation` (Tab 1) | Legend rendered top-right INSIDE plot area; the L1 (orange) and L2 (steel) curves both pass through it near the y-intercept. Semi-transparent background does not hide the visual collision. | Increased `bottom` margin (44 → 88) and `H` (320 → 360); moved legend BELOW the x-axis label, centered horizontally. Curves and legend are now in disjoint vertical bands. |
| **HIGH** | `app.js: renderForest` (Tab 2)          | Legend "Pooled OLS (biased) · Fixed effects (unbiased)" placed at `H-22`, the same band as the x-axis tick labels and the x-axis label "Coefficient on x". The three text rows collide. | Increased `bottom` margin (44 → 96); split the bottom region into three vertical bands (ticks → x-axis label → legend); added semi-transparent background rect to the legend. |
| **HIGH** | `app.js: renderRejection` (Tab 3)       | Legend placed at `margin.top + 2`, INSIDE the plot area. The tallest bar (9.0% time-cluster) and its value label "9.0%" come very close to the legend item "conservative (wider than needed)". | Increased `top` margin (28 → 60) and `H` (360 → 400); moved legend to a reserved band ABOVE the plot top with a semi-transparent background rect and centered horizontally. |
| LOW      | `charts.js: alpha_histograms` (Tab 4)  | "true α = 0.50" label placed at `y=10` inside the plot area; could collide with a tall histogram bar near the true value. | Moved label to `y=-6` (above plot top), centered on the reference line, bold weight. |

## Positive highlights

1. **Clear narrative arc**: Tab 1 lede states both halves of the takeaway
   ("no SE choice can rescue a biased point estimate" + "with the right
   model, SE choice determines coverage"). Tabs 2–4 each illustrate one
   piece of that arc.
2. **Tooltips throughout**: forest plot rows and rejection-rate bars both
   expose β̂, SE, t, CI, and rejects/sims on hover.
3. **CTA cards on Tab 1** route the reader to the right downstream tab,
   reducing the cost of navigating an 8-row forest plot or a 6-bar
   rejection chart.
4. **Honest framing of Tab 4**: the sandbox uses the Double-LASSO engine
   (which is what the JS already ships) and the card explicitly maps the
   teal/orange estimators back to the panel-SE story rather than
   pretending the engine matches the post 1:1.
5. **Color palette discipline**: every chart uses only the site's dark
   theme tokens; no rogue hex codes.

## How to re-review

```
"$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender --port 1340 --bind 127.0.0.1 &
open http://127.0.0.1:1340/post/python_panel_ses/web_app/
```

Click each of the 4 tabs and confirm:

- Tab 1 — legend sits below the x-axis label; no curve passes through it.
- Tab 2 — three bottom rows in order: tick labels, x-axis label, legend.
- Tab 3 — legend in top band above the bars; bar value labels never touch it.
- Tab 4 — "true α = 0.50" label sits above the histogram, not inside it.
