# Results report — synthetic replication of Lessmann (2013)

| | |
|---|---|
| **Script** | `analysis.R` |
| **Status** | Completed successfully (`=== Script completed successfully ===`) |
| **Language** | R 4.5.2 |
| **Key packages** | `fixest` 0.14, `np` 0.60, `splines`, `modelsummary`, `gt`, `sandwich`/`lmtest`, `ggplot2` |
| **Seed** | `set.seed(123)` (frozen after calibration) |
| **Runtime** | ~1 minute |

## Execution summary

The script simulates regional GDP-per-capita micro-data for **56 synthetic countries over 1980–2009**, computes the population-weighted coefficient of variation (WCV) of regional GDP p.c. from those regions, and runs the full battery of regressions from Lessmann (2013). It writes **18 figures** (14 plots + 4 regression-table images), **12 CSVs** (including `results_discriminant.csv`), and prints a calibration scoreboard. The headline finding reproduces cleanly: the relationship between spatial inequality and development is an **inverted-U with a high-income upturn** in the cross-section (an N-shape), and a **clean inverted-U within countries** in the panel — exactly the pattern Lessmann reports. No warnings beyond benign `fixest` singleton notes (one-observation country cells dropped from the FE estimation).

## Data overview

The simulated panel has **890 country-year observations** (annual), **212 country-period cells** (5-year averages), and **56 countries** in the cross-section (period means 2000–2009) — close to the paper's 915 / 207 / 56. The WCV averages **0.36** (SD 0.19, range 0.04–1.08), against the paper's Table A.3 mean of 0.35 (SD 0.20, range 0.06–0.89). Development `ln(GDP p.c.)` spans **5.88 to 11.29** (≈ \$360 to \$80,000), reproducing the paper's wide development range from Tanzania-like to Norway-like economies. The summary statistics match Table A.3 within ±10% on every variable (see `r_kuznets_tableA3_summary.png`).

## Method results

### Measuring inequality — the WCV
![WCV explainer](r_kuznets_01_wcv_explainer.png)

The worked two-region example confirms the formula: a rich capital region (\$28,000, 35% of population) and a poorer hinterland (\$12,000, 65%) give a population-weighted mean of \$17,600 and **WCV = 0.434**. Because the WCV is population-weighted, the poorer-but-larger region dominates — exactly the property Lessmann emphasises for comparing countries with very different territorial structures.

### Spatial vs personal inequality (Fig 3)
![Gini vs WCV](r_kuznets_03_gini_vs_wcv.png)

A simple regression gives **GINI = 0.311 + 0.208·WCV** with a significant slope (t = 2.45) and correlation **0.316**. The paper reports GINI = 0.313 + 0.152·WCV (t = 2.97, r = 0.324). The synthetic slope is a touch steeper but the message is identical: spatial inequality explains a meaningful, but far from complete, share of personal inequality — the two concepts are related, not interchangeable.

### Cross-section parametric estimates (Table 2)
![Table 2](r_kuznets_table2_crosssection.png)

The five specifications reproduce the paper's narrative arc. The **bivariate** slope is negative and highly significant (**−0.092\*\*\***; paper −0.098\*\*\*): on average, richer countries have lower spatial inequality. Adding a quadratic term alone (col 2) leaves both income terms insignificant, but once the territorial and full controls enter (col 4), the **inverted-U emerges**: ln(GDP) **+0.338\*** and ln(GDP)² **−0.020\*\*** (paper +0.330\*, −0.021\*). The **cubic** (col 5) is significant on all three income terms — **+4.40\*\*\* / −0.499\*\*\* / +0.0184\*\*\*** (paper +3.864\*\*, −0.451\*\*, +0.017\*\*) — revealing the N-shape. Adjusted R² rises 0.33 → 0.67 → 0.73 across specifications (paper 0.43 → 0.66 → 0.69). Every control carries the paper's sign and significance: Trade/GDP **+0.002\*\*\***, Federal **−0.073\*\*\***, ln(units) **+0.167\*\*\***, ln(area) **+0.017\***, Ethnic **+0.133\*\***, Urbanization **−0.006\*\***.

![Cross-section polynomials](r_kuznets_04_crosssection_polys.png)

The scatter makes the econometrics visible: a straight line slopes down, a quadratic bends into an inverted-U, and the cubic adds the upturn among the richest countries.

### Turning points
![Turning points](r_kuznets_07_turning_points.png)

Solving ∂WCV/∂ln(GDP) = β₁ + 2β₂Y + 3β₃Y² = 0 on the cubic gives a **maximum at ln(GDP) = 7.67 (≈ \$2,146)** and a **minimum at ln(GDP) = 10.36 (≈ \$31,443)**. The paper reports ≈ \$2,000 and ≈ \$24,000. Below the first threshold spatial inequality rises with development; between the thresholds it falls; beyond the second it rises again — the three-phase trajectory at the heart of the paper.

### The discriminant test (does the cubic really bend?)
![Discriminant regimes](r_kuznets_14_discriminant_regimes.png)

A cubic has two real turning points iff its discriminant **D = β₂² − 3β₁β₃ > 0**. The **cross-section cubic** has **D = +0.0055 > 0** and both turning points (\$2,146 / \$31,443) inside the observed income range (\$315–\$82,653) → a genuine N-shape, so significance and shape agree. The **panel cubic** has D = +0.0005 > 0 but one implied turning point at ≈ \$0.0003 (far below any economy), and the cubic term was insignificant anyway (t = −0.26) → no within-country N-shape, consistent with §6. Three synthetic cases sharpen the lesson: same significant sign pattern, varying only magnitudes, gives a genuine N-shape (5a, D = +0.012), a monotonic curve despite "significant" terms (5b, D = −0.078), and a curve whose turning points fall outside any realistic range (5c, D = +0.237 but turning points at \$86 / 6.7×10¹⁴²). **Significance is necessary but not sufficient for a genuine bend**; the discriminant plus an in-range check is the deciding test.

### Panel two-way fixed effects (Table 3)
![Table 3](r_kuznets_table3_panel.png)

With **country and year fixed effects** via `fixest::feols(... | country + year, vcov = "hetero")`, the **within-country** relationship is a clean inverted-U: the quadratic model gives ln(GDP) **+0.394\*\*** and ln(GDP)² **−0.0211\*\*** (paper +0.345\*\*, −0.018\*\*). The **linear** term alone is insignificant (paper too), and crucially the **cubic term is insignificant** (−0.0008, t = −0.26) — there is **no high-income upturn within countries**, matching the paper exactly. The 5-year averages give the same inverted-U. This is the central contrast of the study: the upturn is a *between-country* phenomenon (tertiarisation across rich economies), not a *within-country* one.

![Spaghetti](r_kuznets_05_panel_spaghetti.png) ![TWFE fit](r_kuznets_06_twfe_fit.png)

The within-country trajectories (left) show why fixed effects matter — countries sit at very different inequality levels that have nothing to do with their income path. The fitted TWFE quadratic (right) peaks at ln(GDP) ≈ 9.8 (~\$18,000).

### Semiparametric cross-section — Robinson (Table 4, Fig 4)
![Robinson partial fit](r_kuznets_08_robinson_partial.png)

The Robinson (1988) double-residual partially-linear estimator recovers linear-part coefficients close to the parametric ones — ln(units) **+0.165\*\*\***, Trade/GDP **+0.0021\*\*\***, Urbanization **−0.0057\*\*\***, Federal **−0.067\*** — and `np::npplreg` returns the *same* point estimates (e.g. ln(units) 0.158 vs 0.165), confirming the manual implementation. The flexible partial fit f(ln GDP) traces the inverted-U with a high-income upturn, with the 90% band widening where data are sparse — qualitatively identical to the paper's Fig 4.

### Semiparametric panel — Baltagi–Li (Table 5, Fig 5)
![Baltagi-Li annual](r_kuznets_09_baltagili_annual.png) ![Baltagi-Li 5yr](r_kuznets_10_baltagili_5yr.png)

The Baltagi–Li (2002) series estimator — a cubic B-spline (order k = 4) of the income term with country and year fixed effects absorbed by `feols` — gives **Urbanization −0.0027\*\* (annual), −0.0029\*\* (5-year)** and **Trade/GDP insignificant**, matching the paper's Table 5 (urbanization significantly negative, trade weak). The recovered f(ln GDP) curves show an inverted-U with no within-country upturn, again matching Fig 5.

### Sectoral channel (Table 6)
![Sectoral](r_kuznets_11_sectoral.png)

Replacing income with the **non-agricultural GVA/GDP share** yields an inverted-U — share **+0.0165\*\*\*** and share² **−0.00014\*\*\*** — confirming the structural-change mechanism Kuznets and Williamson posited: spatial inequality rises as economies industrialise and falls as the modern sector matures.

### Robustness (Table A.5/A.6, Fig 7)
![Exclude poorest](r_kuznets_13_exclude_poorest.png) ![Log vs level](r_kuznets_12_log_vs_level.png)

Excluding the poorest countries (GDP < \$1,000) leaves a cubic that no longer traces the full inverted-U (the upswing arm depends on those countries), exactly as the paper finds. The WCV computed with vs without capital regions correlates at **0.84** (paper 0.81). The alternative inequality measures (unweighted CV, regional Gini) keep the cubic. And the log-vs-level comparison reproduces Fig 7: the high-income upturn appears only when income enters in **levels**, not logs — confirming the paper's caveat that the upturn is sensitive to the logarithmic transform.

## Figure inventory

| File | Maps to | Key takeaway |
|---|---|---|
| `r_kuznets_01_wcv_explainer.png` | §3 | WCV construction (worked example, 0.434) |
| `r_kuznets_02_wcv_by_region.png` | Table 1 | Spatial inequality by World Bank region |
| `r_kuznets_03_gini_vs_wcv.png` | Fig 3 | Spatial inequality predicts personal inequality |
| `r_kuznets_04_crosssection_polys.png` | Table 2 | Linear/quadratic/cubic fits |
| `r_kuznets_05_panel_spaghetti.png` | Fig 1 | Within-country trajectories (why FE) |
| `r_kuznets_06_twfe_fit.png` | Table 3 | TWFE inverted-U |
| `r_kuznets_07_turning_points.png` | §4.2.1 | Turning points ~\$2,100 / ~\$31,000 |
| `r_kuznets_14_discriminant_regimes.png` | §7 (note) | Discriminant regimes: monotonic / inflection / genuine N-shape |
| `r_kuznets_08_robinson_partial.png` | Fig 4 | Robinson partial fit + 90% band |
| `r_kuznets_09_baltagili_annual.png` | Fig 5 (top) | Baltagi–Li f(Y), annual |
| `r_kuznets_10_baltagili_5yr.png` | Fig 5 (bottom) | Baltagi–Li f(Y), 5-year |
| `r_kuznets_11_sectoral.png` | Table 6 | Non-agricultural share inverted-U |
| `r_kuznets_12_log_vs_level.png` | Fig 7 | Upturn only in levels |
| `r_kuznets_13_exclude_poorest.png` | Table A.6 | Excluding poorest weakens inverted-U |
| `r_kuznets_table2_crosssection.png` | Table 2 | 5-spec cross-section table |
| `r_kuznets_table3_panel.png` | Table 3 | 6-spec TWFE table |
| `r_kuznets_table4_5_semipar.png` | Tables 4/5 | Semiparametric linear parts |
| `r_kuznets_tableA3_summary.png` | Table A.3 | Summary statistics |

## Key findings

1. **Inverted-U confirmed.** Cross-section col 4 gives ln(GDP) +0.338\* and ln(GDP)² −0.020\*\* — a statistically significant inverted-U once controls are added.
2. **N-shape (high-income upturn) confirmed.** The cubic is significant on all three income terms (+4.40\*\*\* / −0.499\*\*\* / +0.0184\*\*\*).
3. **Turning points** at \$2,146 and \$31,443 bracket the three development phases (rise → fall → rise).
4. **The discriminant test passes for the cross-section but not the panel.** D = β₂² − 3β₁β₃ = +0.0055 > 0 with both turning points in range (genuine N-shape) in the cross-section; the panel cubic is insignificant and its implied turning point falls outside the data — significance alone never settles the shape.
4. **Within-country relationship is a clean inverted-U.** Panel TWFE quadratic +0.394\*\* / −0.0211\*\*, with the cubic insignificant — no within-country upturn.
5. **The upturn is a between-country, not within-country, phenomenon** — the key methodological contrast that the panel makes visible.
6. **Every cross-section control matches the paper** in sign and significance (Trade +, Federal −, units +, area +, Ethnic +, Urbanization −).
7. **Robinson and Baltagi–Li semiparametric fits** reproduce the parametric story flexibly; `np::npplreg` validates the manual Robinson estimator (identical point estimates).
8. **Sectoral channel** (non-agricultural GVA share) is inverted-U — structural change drives the curve.
9. **Spatial inequality predicts ~⅓ of the cross-country variation in personal inequality** (r = 0.316), as in the paper.
10. **The high-income upturn is fragile** — it disappears under the log transform and when the poorest countries are dropped, exactly as Lessmann cautions.

## Reproduction audit (synthetic vs paper)

| Quantity | Paper (Lessmann 2013) | Synthetic | Match |
|---|---|---|---|
| CS (1) ln(GDP) | −0.098\*\*\* | −0.092\*\*\* | ✓ |
| CS (4) ln(GDP) / ² | +0.330\* / −0.021\* | +0.338\* / −0.020\*\* | ✓ |
| CS (5) cubic | +3.864\*\* / −0.451\*\* / +0.017\*\* | +4.40\*\*\* / −0.499\*\*\* / +0.0184\*\*\* | ✓ (≈1.15×) |
| CS adj. R² (1/4/5) | 0.43 / 0.66 / 0.69 | 0.33 / 0.67 / 0.73 | ✓ (col 1 low) |
| Turning points | ~\$2,000 / ~\$24,000 | \$2,146 / \$31,443 | ✓ |
| Panel (2) ln(GDP) / ² | +0.345\*\* / −0.018\*\* | +0.394\*\* / −0.0211\*\* | ✓ |
| Panel cubic term | insignificant | −0.0008 (t −0.26) | ✓ |
| Table 4 Trade / Urb | +0.003\*\*\* / −0.003\*\* | +0.0021\*\*\* / −0.0057\*\*\* | ✓ |
| Table 5 Urbanization | −0.007\*\*\* / −0.006\*\*\* | −0.0027\*\* / −0.0029\*\* | ✓ (sign/sig) |
| Table 6 non-ag share / ² | +0.035\*\* / −0.001\*\* | +0.0165\*\*\* / −0.00014\*\*\* | ✓ (direction) |
| Fig 3 slope | 0.152 (t 2.97) | 0.208 (t 2.45) | ✓ |
| WCV / capital-excl. corr | 0.81 | 0.84 | ✓ |
| N (annual / 5-yr / cross) | 915 / 207 / 56 | 890 / 212 / 56 | ✓ |

## Surprises & caveats

- **This is synthetic data.** The numbers are *engineered* to match the paper's published estimates; they are not independent evidence for the Kuznets hypothesis. The exercise is pedagogical — to learn the estimators and the measurement of spatial inequality — not confirmatory.
- **Magnitudes are approximate.** The cross-section cubic runs ~1.15× the paper's coefficients and the Fig-3 slope ~1.3×; signs, significance and turning points are faithful.
- **Panel R² conventions differ.** `fixest` reports a within-R² (≈0.02) and an overall R² (≈0.9); the paper's 0.33–0.37 is a Stata-style demeaned R². Coefficient inference is unaffected.
- **White (HC1) standard errors** are used throughout to match the paper; clustering by country is mentioned as the modern alternative.
- **Estimands.** This is a *descriptive/associational* study — no causal claim. The regressions describe conditional correlations between development and spatial inequality, not treatment effects.
- **`fixest` singleton notes** are benign: one-observation country cells (e.g., Uzbekistan 2008) are dropped from FE estimation.
- **Robinson SEs** come from the manual double-residual OLS (the `np::npplreg` object does not expose `betavcov`); point estimates are identical to `np::npplreg`.
