# review-app — r_sc_bayes_spatial

**Audit date:** 2026-05-24
**Focus:** all 10 dimensions
**Browser pass:** enabled
**Verdict (post-fix):** **ACCEPT** — legend repositioned below plot, Tab-2 lede clarified for Stage 3, in-text Tab-3 link added.
**Original verdict:** MINOR REVISION (1 HIGH overlap + 1 MED content gap).

## Dimension scores

| # | Dimension              | Score |
|---|------------------------|-------|
| 1 | File completeness      | 10    |
| 2 | HTML structure         | 9     |
| 3 | JS correctness         | 9     |
| 4 | Data contract          | 10    |
| 5 | Accessibility          | 8     |
| 6 | Performance            | 10    |
| 7 | Pedagogy               | 7     |
| 8 | Hugo integration       | 10    |
| 9 | Visual design          | 6     |
| 10| Mobile responsiveness  | 7     |

## Issues

| # | Severity | Location | Issue | Fix |
|---|----------|----------|-------|-----|
| 1 | HIGH | charts.js `trajectory()` line 625 | Legend box positioned top-right inside plot area (`translate(${w-230},0)`) overlaps the "Prop 99 (1988)" treatment label and sits over the data lines at their pre-1988 peak. Affects Tab 3 (sp-traj) and Tab 4 (fp-traj). | Move legend below the chart (translate to `0, h+50`) or to the lower-right corner where lines have dropped, with a semi-transparent rect. Increase bottom margin to accommodate. |
| 2 | MED | index.html line 122-125 + app.js line 51-78 | Tab-2 radio toggle only offers Stage 1 + Stage 2, but the Tab-1 lede and `pedagogy` panel both reference Stage 3 ("4 → 23 → 27 donors"). Stage 3 data (`spillovers` ranking already shows donor list) is available; need a Stage 3 toggle. | Add `<input type="radio" value="stage3">` and corresponding branch in `dw_render()` using `store.data.spillovers` to derive a 27-donor Stage 3 weights view, or note "(see Tab 3)" if computing Stage 3 weights is non-trivial. |
| 3 | LOW | charts.js lines 37-531 | Six chart factories from r_double_lasso template (`l1_vs_l2_animation`, `coefficient_path`, `forest_plot`, `selection_bars`, `alpha_compare`, `alpha_histograms`) are defined but never called. They contain stale colorMaps ("First diff", "PSL", "DL (rigorous)", "DL (CV)") that would surface wrong colors if accidentally wired up. | Remove dead functions or comment that they are unused for this app. |

## Positive highlights

- Glossary has 8 entries (>= 6 minimum) with clear, concise definitions.
- All three SAR result quantities (mean ρ, 95% CrI, ESS) prominently displayed with an honest caveat ("ESS(ρ)=3 — tutorial budget; paper uses 100k iter").
- Pedagogical alignment: Tab 1 lede explicitly names all three takeaways from the post and maps each to a tab.
- Forest plot tooltip includes `notes` field (ESS warning) which is unusual and pedagogically useful.
- Smoke test passes 8/8 in ~101 ms.

## How to re-review

```
/project:review-app r_sc_bayes_spatial
```
