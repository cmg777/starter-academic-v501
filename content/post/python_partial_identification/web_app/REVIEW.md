# REVIEW — python_partial_identification web app

**Date:** 2026-05-24
**Focus:** all 10 dimensions
**Browser pass:** enabled (Chromium 1280x800 + 375x667)
**Verdict (initial):** MINOR REVISION
**Verdict (after fixes):** ACCEPT

## Dimension scores (after fixes)

| # | Dimension              | Before | After |
|---|------------------------|--------|-------|
| 1 | File completeness      | 10     | 10    |
| 2 | HTML structure         | 9      | 9     |
| 3 | JS correctness         | 9      | 9     |
| 4 | Data contract          | 10     | 10    |
| 5 | Accessibility          | 9      | 9     |
| 6 | Performance            | 10     | 10    |
| 7 | Pedagogy               | 9      | 9     |
| 8 | Hugo integration       | 10     | 10    |
| 9 | Visual design          | 6      | 9     |
|10 | Mobile responsiveness  | 6      | 8     |

## Issues fixed

| Severity | Dim | Location | Issue | Fix applied |
|----------|-----|----------|-------|-------------|
| HIGH | 9 | charts.js `bounds_widening_animation` | "true ATE = 0.27" annotation collided with entropy bar's mid-bar label when phase shrank entropy near true ATE. | Increased top margin (40→56); lifted true-ATE label to y=-36; moved Manski/entropy/naive bar labels ABOVE their bars (not centred inside); hide entropy mid-bar label when bar narrower than 80px. |
| HIGH | 9 | charts.js `bounds_forest` | "true ATE = 0.27" annotation stacked under facet title. | Increased top margin (28→48), pushed facet title up to y=-30, kept true-ATE annotation at y=-10. |
| HIGH | 9 | charts.js `live_bounds_bar` | "naive" (orange) and "true ATE" (white) labels overlapped horizontally when values were close. | Increased top margin (30→42); stagger labels vertically: true-ATE at y=-26, naive at y=-10. |
| MED  | 9 | charts.js `width_vs_n` | Legend background overlapped Manski line near right edge of plot. | Increased top margin (28→64); moved legend ABOVE plot area (y=-44); inlined the two entries horizontally. |
| MED  | 10 | n/a | Tab strip mobile-clipping reported in initial review was a false positive — strip already has `overflow-x: auto` and active tab scrolls into view; no fix needed. | n/a |

## Positive highlights

- Smoke test passes 8/8.
- No console errors during tab switching or slider interaction.
- All assets HTTP 200; YAML link uses `web_app/index.html` (no trailing-slash bug).
- Strong pedagogy: lede previews 3 layers of certainty; glossary with 10 entries.
- Site color palette preserved.

## How to re-review

```
/project:review-app python_partial_identification
```
