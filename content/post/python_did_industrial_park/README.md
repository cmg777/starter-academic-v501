# The Socioeconomic Impacts of Industrial Parks in Ethiopia — analysis artifacts

A beginner-pedagogical, end-to-end **staggered difference-in-differences (DiD)**
tutorial in Python, replicating the design and headline findings of:

> Huang, G., Wang, M., & Xu, H. (2026). *The socioeconomic impacts of industrial
> parks in Ethiopia.* **Journal of Urban Economics.**
> https://doi.org/10.1016/j.jue.2026.103867

> **SYNTHETIC DATA.** The three CSVs in `data/` are 100% synthetic and
> *calibrated* so that re-running the paper's regressions reproduces its
> findings (signs, significance, approximate magnitudes) — **not** the real,
> confidential micro-data. They teach the methods; do not draw conclusions about
> Ethiopia. See `reference/README.md` for the full data documentation and the
> table-by-table reproduction map.

**Topic:** staggered DiD / event study / Callaway-Sant'Anna on satellite +
DHS data · **Estimand:** ATT under parallel trends · **Framing:** observational
(parks are not randomly placed → FE/covariate adjustment is *confounding
control*, not precision-only) · **Theme:** dark · **Libraries:** `pyfixest`
0.50.1, `diff-diff` 3.5.2.

## Pipeline progress

- [x] **Script** (`script.py`, `execution_log.txt`, 14 figures, 20 CSV tables)
- [ ] Results report (`results_report.md`)
- [ ] Blog post (`index.md`)
- [ ] Infographic
- [ ] Interactive web app
- [ ] Slides

## How to run

```bash
python3 script.py          # exits 0; writes all PNGs + CSVs next to the script
```

The script loads `data/*.csv` if present, else falls back to the GitHub raw
copies (Colab-ready). `pyfixest`/`diff-diff` are auto-installed if missing.

## Datasets (`data/`)

| File | Grain | Rows | Description |
|---|---|---|---|
| `industrial_park_district_panel.csv` | woreda × year | 2,224 | 139 woredas (17 treated + 122 control), 2005–2020; nighttime light + impervious ratio + covariates. |
| `industrial_park_household_rcs.csv` | DHS household | 13,200 | Repeated cross-section, 5 rounds; durables, housing, wealth. |
| `industrial_park_individual_rcs.csv` | DHS individual | 17,900 | Repeated cross-section; non-ag employment + women's empowerment. |

## Figures (dark theme, dpi = 300)

| File | Paper object | Description |
|---|---|---|
| `python_did_industrial_park_01_parallel_trends.png` | EDA | Group-mean IHS light, **baseline-normalized** (indexed to each group's pre-2008 mean) — parallel before the rollout, then divergence. |
| `python_did_industrial_park_02_cohort_staircase.png` | EDA | Per-cohort mean light trajectory with each cohort's opening vertical (the staggered "staircase"). |
| `python_did_industrial_park_03_treatment_map.png` | EDA / Fig. context | Lon/lat scatter of treated vs control woredas (treatment is spatially clustered). |
| `python_did_industrial_park_04_outcome_boxplots.png` | EDA | IHS-light distribution by group × pre/post period. |
| `python_did_industrial_park_05_twfe_forest.png` | Table 1 | Static TWFE ATT forest, 3 outcomes × {no-trends, with-trends}, 95% CI. |
| `python_did_industrial_park_06_event_study.png` | Fig. 1 / Eq. 3 | Event-study coefficients k ∈ [−5,+5] (Sun-Abraham per-period): flat pre, rising post. |
| `python_did_industrial_park_07_estimator_comparison.png` | Table A6 | TWFE vs Sun-Abraham vs Borusyak/Gardner vs Callaway-Sant'Anna ATT forest. |
| `python_did_industrial_park_08_bacon_weights.png` | — | Goodman-Bacon decomposition: weight vs 2×2 estimate by comparison type. |
| `python_did_industrial_park_09_heterogeneity.png` | Tables 3–4 | Implied park effect vs distance (effect fades with distance). |
| `python_did_industrial_park_10_spillover.png` | Table 2 | Treatment vs `nearby` coefficient (no spillover). |
| `python_did_industrial_park_11_household_forest.png` | Table 5 | Household welfare ATT forest, 3 outcomes × {±controls}. |
| `python_did_industrial_park_12_household_event_study.png` | Fig. 2 | Durables RCS event study (phase dummies). |
| `python_did_industrial_park_13_employment_empowerment.png` | Tables 6–7 | Sex-split employment (null overall, female significant) + women's empowerment forest. |
| `python_did_industrial_park_14_empowerment_event_study.png` | Fig. 3 | Female employment + decision-power RCS event study. |

## Result tables (CSV)

| File | Paper object | Description |
|---|---|---|
| `cohort_sizes.csv` | Table A1 | Treated-woreda counts by opening year. |
| `descriptive_stats.csv` | — | Summary stats for key outcomes across all three layers. |
| `eda_group_means.csv` | — | Baseline-normalized group-mean light by year. |
| `baseline_2x2.csv` | — | Naive 2×2 cell means + hand and diff-diff ATT. |
| `twfe_table1.csv` | **Table 1** | Static TWFE ATT, 3 outcomes × {no-trends, trends}. |
| `event_study_light.csv` | **Fig. 1** | IHS-light event-study coefficients. |
| `event_study_impervious.csv` | Fig. 1 | Impervious-ratio event-study coefficients. |
| `staggered_robust_comparison.csv` | **Table A6** | TWFE / SA / Borusyak / CS ATT comparison. |
| `bacon_weights.csv` | — | Goodman-Bacon 2×2 comparisons and weights. |
| `het_distance.csv` | **Table 3** | Distance-moderator interactions. |
| `het_roads.csv` | **Table 4** | Road-density-moderator interactions. |
| `spillover_test.csv` | **Table 2** | Treatment + `nearby` spillover spec. |
| `household_table5.csv` | **Table 5** | Household welfare ATT, ±controls. |
| `household_event_study.csv` | Fig. 2 | Durables RCS phase-dummy event study. |
| `employment_table6.csv` | **Table 6** | Non-ag employment ATT (full / female / male). |
| `empowerment_table7.csv` | **Table 7** | Women's empowerment ATT (decision / savings / DV). |
| `female_employment_event_study.csv` | Fig. 3 | Female non-ag employment RCS event study. |
| `conley_se_comparison.csv` | robustness | Four SEs (naive / cluster / Conley spatial / Conley-HAC) for the Table-1 light ATT. |
| `robustness_results.csv` | robustness | ATT across restricted control pools. |
| `reproduction_audit.csv` | **all** | Every headline cell: synthetic coef/se/sig vs paper value + honest notes on the documented gaps. |

## Method sequence (12 sections in `script.py`)

1. Load + describe the three layers (cohorts, treated/control counts, rounds).
2. EDA (parallel trends, cohort staircase, map, boxplots).
3. Baseline 2×2 DiD (and why it understates a dynamic, staggered effect).
4. Static TWFE (Eq. 1, **Table 1**), no-trends vs unit-specific-trend specs.
5. Event study (Eq. 3, **Fig. 1**) + pre-trend test.
6. Modern staggered estimators — Sun-Abraham, Borusyak/Gardner,
   Callaway-Sant'Anna — plus the Goodman-Bacon decomposition (negative-weights
   teaching moment). All target the ATT and agree (~0.21–0.30 IHS).
7. Heterogeneity by distance and roads (**Tables 3–4**).
8. Spillover test (**Table 2**).
9. Household RCS welfare (Eq. 2, **Table 5**).
10. Employment & empowerment RCS (**Tables 6–7**) — the gender narrative climax
    (null overall employment, significant for women).
11. Robustness battery (Conley spatial-HAC SEs + restricted control pools).
12. Reproduction audit (`reproduction_audit.csv`).

## Key results (synthetic ≈ paper)

- **Night light** rises ~21% (IHS 0.215 trend-adjusted ***, 0.270 no-trends);
  **impervious surface** +~2.7 pp; **no spillover** to neighbours.
- Effect **fades with distance**, **amplified by paved roads**.
- Households gain **durables (+0.23\*\*\*)**, **housing (+0.25\*\*\*)**,
  **wealth (+0.38\*\*\*)**.
- **Employment:** the average effect is **insignificant**, but the **female**
  effect is large and significant (**+0.14\*\*\***); the male effect is ~0.
- **Women's empowerment:** decision power **+0.11\*\*\***, savings
  **+0.32\*\*\***, acceptance of domestic violence **−0.21\*\*\***.

Documented (honest) gaps surfaced in the audit: raw-light coefficient runs high
(~1.6 vs paper 1.276; a synthetic bright-base device), and the `primary_road`
interaction is correctly signed but borderline (ns) with only 17 treated
woredas.

## Packages used

`pyfixest` (TWFE, event studies, Sun-Abraham `saturated`, Borusyak/Gardner
`did2s`), `diff-diff` (`CallawaySantAnna`, `BaconDecomposition`,
`DifferenceInDifferences`), `pandas`, `numpy`, `matplotlib`.
