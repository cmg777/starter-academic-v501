# Scope — synthetic R replication of Lessmann (2013)

**Paper:** Lessmann, C. (2013). "Spatial inequality and development: Is there an inverted-U relationship?" *Journal of Public Economics* 106, 35–51.

**Goal:** A beginner-friendly, comprehensive R tutorial that replicates the paper's main results on a SYNTHETIC dataset (no real data). Regional GDP-per-capita micro-data are simulated for 56 countries (1980–2009); the population-weighted coefficient of variation (WCV) is then *computed* from those regions. The data-generating process is calibrated so the regressions reproduce the paper in direction, significance, and approximate magnitude.

**Language / tools:** R 4.5; `fixest` (two-way fixed effects), `np` (Robinson 1988 semiparametric), `splines`+`fixest` (Baltagi–Li 2002 B-spline FE), `sandwich`/`lmtest` (White/HC1 SE), `ggplot2` (dark site theme), `modelsummary`+`gt` (table images).

**Results covered:**
- Table 2 — cross-section parametric OLS, 5 specs (bivariate → quadratic → +territorial → +full controls inverted-U → cubic N-shape).
- Table 3 — panel two-way FE (annual N≈890, 5-year N≈212), linear/quadratic/cubic.
- Turning points of the cubic (∂WCV/∂Y = 0).
- Table 4 — semiparametric cross-section (Robinson) + partial fit (Fig 4).
- Table 5 — semiparametric panel (Baltagi–Li) + partial fits (Fig 5).
- Table 6 — sectoral channel (non-agricultural GVA/GDP share).
- Fig 3 — spatial vs personal inequality.
- Robustness (Table A.5/A.6, Fig 7): exclude poorest, exclude capital regions, CV / regional-Gini measures, log vs level of income.
- Table A.3 — summary statistics.

**Key design idea:** the *within*-country inverted-U lives in the time-varying regional dispersion; the *between*-country cubic N-shape lives in a time-invariant country term absorbed by country fixed effects. Hence the panel shows a clean inverted-U (cubic n.s.) while the cross-section shows the N-shape.

**Frozen seed:** `set.seed(123)`. Calibration scoreboard printed at the end of `execution_log.txt`.
