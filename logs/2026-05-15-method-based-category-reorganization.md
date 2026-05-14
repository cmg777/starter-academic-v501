# Method-based category reorganization

**Date:** 2026-05-15
**Commit:** beb5ffe
**Files changed:** 66 post index.md files

## What changed

Reorganized `categories:` front matter across 66 of the 75 posts in
`content/post/` so that categories are now organized **by econometric
or ML method** rather than by mixed methodology / data-structure /
workflow descriptors. The total number of distinct categories dropped
from 57 to 32.

### Categories kept

- **Languages:** Python, R, Stata, GEE
- **Remote-sensing family:** Remote Sensing, Interactive Dashboard
- **Causal-inference methods:** Randomized Controlled Trial (RCT),
  Difference-in-Differences (DiD), Synthetic Control, Instrumental
  Variables (IV), Regression Discontinuity (RDD), Matching and
  Propensity Score, IPW and Doubly Robust, Partial Identification
- **Causal-ML hybrids:** Double Machine Learning, Heterogeneous
  Treatment Effects (CATE)
- **Panel / econometric methods:** Fixed Effects and TWFE, Dynamic
  Panel, FWL Theorem
- **Machine learning / statistical methods:** Random Forest, LASSO,
  Bayesian Model Averaging (BMA), Principal Component Analysis (PCA)
- **Spatial methods:** Spatial Autocorrelation (ESDA), Spatial
  Regression (SAR, SEM, SDM), GWR and MGWR
- **Substantive topics:** Development Economics, Economic Growth,
  Convergence, Resource Curse, Spatial inequality
- **Misc:** Announcement

### Categories dropped (umbrella / workflow / data-structure)

`Causal Inference`, `Econometrics`, `Machine Learning`, `Tutorial`,
`Spatial Analysis`, `Variable Selection`, `Causal Machine Learning`,
`Treatment Effects`, `Policy Evaluation`, `GMM`, `Cross-Country
Analysis`, `Solow Growth Model`, `Convergence Clubs`.

### Moved to `tags:`

`Cross-sectional Data`, `Panel Data`, `Exploratory Data Analysis`.

### Renamed (consolidations)

| Old label(s) | New canonical |
|---|---|
| `Instrumental Variables`, `Instrumental Variables (IV)` | Instrumental Variables (IV) |
| `DiD`, `Difference-in-Differences (DiD)` | Difference-in-Differences (DiD) |
| `Growth`, `Solow Growth Model`, `Cross-Country Analysis` | Economic Growth (+ Convergence where applicable) |
| `Convergence Clubs` | Convergence |
| `Matching`, `Propensity Score`, `Treatment Effects` | Matching and Propensity Score |
| `Heterogeneous Treatment Effects`, `Conditional Average Treatment Effects (CATE)` | Heterogeneous Treatment Effects (CATE) |
| `Causal Machine Learning`, `Policy Evaluation` (on `python_cml`) | Double Machine Learning |
| `GMM` | Dynamic Panel |

### Malformed YAML fixed

`python_did101` and `stata_did` had categories listed with a literal
leading `-` (no indent), which produced spurious `- Python`, `- DiD`,
`- Stata` category pages. Both files now use the 2-space-indented YAML
list style consistent with every other post.

### Per-post mapping

Granularity: **flat** — one primary method category per post. The
language label (Python / R / Stata) is always kept; up to one method
label and any applicable substantive-topic label (`Spatial inequality`,
`Convergence`, etc.) accompany it. Hybrid posts (e.g., `python_doubleml`
uses LASSO + Random Forest as learners) keep only the **primary**
method (Double Machine Learning).

## Why

- The category dropdown was crowded with umbrellas (`Causal Inference`
  on 29 posts, `Machine Learning` on 6) that duplicated the
  method-specific labels right next to them.
- Inconsistent naming (`Instrumental Variables` vs `Instrumental
  Variables (IV)`; `DiD` vs `Difference-in-Differences (DiD)`; `Growth`
  vs `Economic Growth`) split otherwise-identical taxa across two
  `/category/` pages.
- Data-structure descriptors (`Cross-sectional Data`, `Panel Data`) and
  workflow descriptors (`Tutorial`, `Exploratory Data Analysis`) were
  appearing as category chips alongside method labels, diluting the
  category as a navigation primitive. They are now tags.

## Final category inventory (after this overhaul)

32 distinct categories. Top counts: Python (30), Stata (20), R (15),
Spatial inequality (12), Remote Sensing (10), Difference-in-Differences
(DiD) (9), GEE (8), Interactive Dashboard (8), Convergence (4), Spatial
Autocorrelation (ESDA) (4), Spatial Regression (SAR, SEM, SDM) (4),
Synthetic Control (4); then Announcement, BMA, Development Economics,
Double Machine Learning, Economic Growth, FWL Theorem, Fixed Effects
and TWFE, GWR and MGWR, Heterogeneous Treatment Effects (CATE),
Instrumental Variables (IV) at 3 each; PCA, Resource Curse, IPW and
Doubly Robust at 2; Dynamic Panel, LASSO, Matching and Propensity
Score, Partial Identification, Random Forest, RCT, Regression
Discontinuity (RDD) at 1 each.

## Predecessor superseded

This work supersedes `logs/2026-04-06-post-category-overhaul.md`, which
introduced `Panel Data`, `Cross-sectional Data`, and the `Spatial
Analysis` umbrella. Two of those (`Panel Data`, `Cross-sectional Data`)
are now tags; the `Spatial Analysis` umbrella has been replaced by the
specific spatial-method categories.

## Verification

Run locally:

    "$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender

Then visit `/categories/` and a sample of `/category/<slug>/` pages
(e.g. `/category/difference-in-differences-did/`,
`/category/double-machine-learning/`,
`/category/spatial-autocorrelation-esda/`,
`/category/spatial-inequality/`). Each page should list the expected
posts and only those.
