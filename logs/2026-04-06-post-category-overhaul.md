# Post Category Overhaul for Better Filtering

**Date:** 2026-04-06
**Commit:** 4a92fa9
**Files changed:** 47 post index.md files

## What changed

Reorganized the `categories` front matter across 47 posts to improve the category dropdown filter on the Posts & Tutorials page (`/post/`).

### New categories added

| Category | Posts | Purpose |
|----------|-------|---------|
| Panel Data | 14 | Data structure filter for panel/longitudinal data posts |
| Cross-sectional Data | 20 | Complement to Panel Data for cross-section posts |
| Spatial Analysis | 11 | Unified category replacing Spatial Spillovers + Spatial Heterogeneity |
| Variable Selection | 4 | BMA, LASSO, WALS model selection posts |
| Interactive Dashboard | 8 | Distinguishes GEE interactive map apps from tutorials |

### Renamed categories

| Old | New | Posts |
|-----|-----|-------|
| Spatial Spillovers | Spatial Analysis | 8 |
| Spatial Heterogeneity | Spatial Analysis | 1 |
| Convergence | Growth | 2 |
| Post | Announcement | 3 |

## Why

The category dropdown on `/post/` is the primary filtering mechanism (Isotope.js-based). Several issues existed:
- No data-structure categories (panel vs cross-section) for filtering
- "Spatial Heterogeneity" had only 1 post, "Convergence" only 2
- "Post" was too generic for the 3 announcement-type entries
- GEE interactive dashboards were indistinguishable from tutorials

## Final category inventory (after overhaul)

Python, R, Stata, GEE, Remote Sensing, Tutorial, Econometrics, Causal Inference, Machine Learning, Exploratory Data Analysis, Spatial Analysis, Panel Data, Cross-sectional Data, Variable Selection, Interactive Dashboard, Growth, Announcement
