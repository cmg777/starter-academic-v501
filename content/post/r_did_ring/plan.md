# r_did_ring — Approved Scope (plan.md)

This document is the approved scope confirmation for the `/project:write-script`
invocation that produced `analysis.R` in this directory. Downstream skills
(`/write-results-report`, `/write-post`, `/write-infographic`,
`/write-quarto-notebook`) consume this scope as input.

## 1. Topic

**Difference-in-Differences with geocoded microdata — the *ring* approach.**
Pedagogically reorganized introduction targeted at advanced undergraduate and
beginning graduate students in economics. Inspired by, and explicitly
acknowledges:

> Butts, Kyle (2023). "JUE Insight: Difference-in-Differences with Geocoded
> Microdata." *Journal of Urban Economics* 133: 103493.

The replication archive that ships with the paper lives in `references/` and is
the source of the parametric and nonparametric ring estimators implemented
here. The empirical application uses the Linden & Rockoff (2008) data on home
prices and sex-offender arrivals included in that archive.

## 2. Language

R (`analysis.R`). The reference implementation is in R; switching languages
would require re-deriving the `binsreg`-based nonparametric estimator and
losing the `fixest` cluster-robust SE machinery.

## 3. Figure theme

**Dark theme** + site palette:

- Background: `#0f1729` (dark navy), gridlines `#1f2b5e`
- Light text `#c8d0e0`, white text `#e8ecf2`
- Accents: steel blue `#6a9bcc`, warm orange `#d97757`, teal `#00d4c8`,
  near-black `#141413`

`kfbmisc` (Kyle Butts's personal package) is **not** used; we register a custom
`theme_dark_dampoostle()` matching the convention in `content/post/r_did2/`.

## 4. Script sections

1. **Setup** — packages, seed, palette, theme
2. **Intuition: when does distance identify a treatment effect?** — `sf` toy
   geometry showing inner / outer rings
3. **Basic DiD recap** — minimal first-differences walk-through on simulated
   panel
4. **Parametric ring estimator** — inline `parametric_ring_panel()` defined and
   applied to a smooth distance-decaying DGP
5. **Problem: ring choice is arbitrary** — three ring choices on the same DGP
6. **Nonparametric ring estimator via binsreg** — inline `nonparametric_ring_cs()`,
   recover the underlying TE curve
7. **Application — Linden & Rockoff (2008)** in seven mini-steps:
   - §7.1 The natural experiment
   - §7.2 Load and inventory the data
   - §7.3 Raw price gradient (kernel smoothing, pre vs. post)
   - §7.4 Bandwidth fragility (1×3 panel)
   - §7.5 Parametric ring DiD
   - §7.6 Ring-choice sensitivity (1×3 panel)
   - §7.7 Nonparametric ring (the TE curve)
8. **Summary** — headline numbers across estimators

## 5. Deliverables

| File | Description |
|------|-------------|
| `analysis.R` | The script (~900 lines, including extensive pedagogical comments) |
| `execution_log.txt` | Captured stdout/stderr from `Rscript analysis.R` |
| `linden_rockoff.dta` | Copy of the Linden-Rockoff data (43 MB) committed for replicability |
| `raw_data.csv` | Full LR data after `haven::read_dta()` |
| `data_prepared.csv` | Post-cleaning analysis sample |
| `r_did_ring_01_*.png` … `r_did_ring_10_*.png` | At least 10 dark-theme PNGs at 300 dpi |
| `table_*.csv` | ≥ 6 per-section result tables |
| `summary.csv` | One-row-per-estimator headline summary |
| `README.md` | Auto-generated artifact inventory |
| `plan.md` | This document |

## 6. Framing

**Causal**, observational. Estimand is the **average treatment effect on the
treated unit-distance bin**: for the parametric estimator, the difference in
log-price changes between homes in the inner ring (treated by proximity) and
homes in the outer ring (donut, acting as the counterfactual). For Linden &
Rockoff, the comparison is homes that transacted before vs. after a registered
sex offender moved into the neighborhood, with the inner ring at ~1/10 mile
and the outer ring out to 3/10 mile. We are explicit about this estimand at
the head of every method section.

## 7. Reproducibility

- The Linden-Rockoff data is committed to this folder so that a clean clone of
  the repo can run the script end-to-end. The script loads it via the GitHub
  raw URL `https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_did_ring/linden_rockoff.dta`
  with a local-file fallback.
- All R dependencies are on CRAN; no GitHub-only packages.
- `set.seed(42)` at the top, and inside each simulated DGP block.

## 8. Out of scope (this turn)

- `results_report.md`, `index.md`, infographic, Quarto notebook
- Monte Carlo simulations (paper Table 1) and Monte Carlo DGP figure
