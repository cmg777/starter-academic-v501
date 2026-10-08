# Review — r_basic_synthetic_control web app

- **Slug:** r_basic_synthetic_control
- **Audit date:** 2026-05-24
- **Focus:** all 10 dimensions
- **Browser pass:** enabled (Playwright Chromium)
- **Final verdict:** ACCEPT

## Dimension scores

| # | Dimension              | Score | Notes                                                       |
|---|------------------------|-------|-------------------------------------------------------------|
| 1 | File completeness      | 10    | All 7 required files present; no stray files                |
| 2 | HTML structure         | 10    | 4 tabs, matching button/pane IDs, semantic roles            |
| 3 | JS correctness         | 10    | Smoke test 8/8; no console errors in Chromium               |
| 4 | Data contract          | 10    | results.json parses; values match post CSVs                 |
| 5 | Accessibility          | 9     | role="tab" + aria-selected on tab strip                     |
| 6 | Performance            | 10    | Smoke test < 110 ms                                         |
| 7 | Pedagogy               | 9     | Tab-1 lede surfaces ATT, peak, donor recipe; 8 glossary     |
| 8 | Hugo integration       | 10    | YAML link `web_app/index.html` (no trailing slash); 200 OK  |
| 9 | Visual design          | 9     | Dark palette; legend now above plot (was overlapping)       |
|10 | Mobile responsiveness  | 9     | 375×667 viewport: chart scales, no horizontal overflow      |

## Issues fixed

| Severity | Dimension | Location                       | Issue                                                                                                                | Fix                                                                                                                                                       |
|----------|-----------|--------------------------------|----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| HIGH     | 9         | charts.js `paths_chart` legend | In-plot legend at top-right (`translate(${w-220}, 10)`) overlapped the actual + synthetic GDP lines past ~1985 — both series reach the upper-right corner. | Move legend ABOVE the plot area into an enlarged top margin (24 → 60 px); render as a centred horizontal legend in `legendG`; rebuild on every `update`. |
| MED      | 9         | charts.js `paths_chart` peak label | In gap mode, peak label `peak 1989: -1.036` was right-anchored at `peakX + 8` and would have run off the right edge when peak year is late in the series. | Compute side based on remaining horizontal space (`w - peakX > 110`); flip `text-anchor` to `end` and offset `-8` when label would otherwise overflow.  |

## Positive highlights

- All four tabs render error-free under headless Chromium at both desktop and mobile viewports.
- Tab-2 predictor balance table directly maps to `predictor_balance.csv` in the post folder (13 rows, treated/synthetic/sample mean columns) — the data contract is faithful.
- Tab-4 placebo bar chart correctly highlights the Basque row in orange and Catalonia in pale teal, matching the post's narrative that the top placebo is structurally tied to the dominant donor.
- Tab-1 donor weight animation gives a clean visual lede (85.1% Catalonia + 14.9% Madrid).
- Stat-row cards on Tab 3 mirror the post's headline numbers exactly: avg ATT −0.580, peak −1.036, end −0.828, pre-fit MSPE 0.0082.

## How to re-review

```
/project:review-app r_basic_synthetic_control
```
