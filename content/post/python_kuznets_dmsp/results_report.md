# Results report — Regional Inequality from Outer Space

Replication of Lessmann & Seidel (2017). All numbers below come from `script.py`
(`execution_log.txt` and the `python_kuznets_dmsp_*.csv` exports). Estimator: PyFixest
for fixed-effects panels; `linearmodels.RandomEffects` for the paper's Table 1 RE columns;
a from-scratch Conley spatial-HAC variance for Table B.4.

## Key findings

1. **Nighttime lights predict regional income.** In the preferred specification (Table 1,
   column 7: WB-group + satellite fixed effects, national GDP and geography controls), the
   random-effects elasticity of regional GDP per capita with respect to log light per
   pixel is **0.102**, and the national-GDP elasticity is **0.889** — matching the paper.
   The clean within (region fixed effects) elasticity in column 2 is **0.190**.

2. **The predictions are accurate.** Reconstructing fitted log GDP per capita from the
   column-7 coefficients and comparing to observed values gives a Pearson correlation of
   **0.925** across 5,258 region-years (1,504 regions, 81 countries).

3. **Fixed vs random effects differ where it is identified.** The PyFixest FE/OLS
   elasticities (0.359 / 0.190 / 0.134 / 0.131 / 0.268 / 0.094 / 0.049) track the
   random-effects estimates (0.399 / 0.190 / 0.153 / 0.123 / 0.232 / 0.104 / 0.102) but
   diverge once national GDP and geography are absorbed (col 7: FE 0.049 vs RE 0.102),
   illustrating that random effects use between-region variation the within estimator
   discards.

4. **The five inequality indices reproduce the paper's Table 2.** Built from first
   principles and population-weighted, the predicted-income indices correlate with the
   observed-income indices across 78 countries at Gini 0.49, GE(-1) 0.39, MLD 0.45,
   Theil 0.50, CV 0.52 — far above the raw-light correlations (0.21 / 0.11 / 0.21 / 0.30 /
   0.29). Prediction adds real signal over raw luminosity.

5. **Population weights matter.** Population-weighted and equal-weight Gini coefficients
   correlate 0.75 across country-years; weighting lowers measured inequality on average by
   −0.0034, because large, near-average regions receive more weight and small extreme
   regions receive less. The choice of weight changes the level of inequality and some
   country rankings.

6. **The regional Kuznets curve is an N-shape.** With country and period fixed effects on
   5-year averages, the cubic in log national GDP per capita has coefficients **0.293 /
   −0.032 / 0.001** for GINIW (N = 879, 180 countries) — all the same sign as the paper.
   Regional inequality first rises with development, then falls, with a faint upturn at the
   very top.

7. **Determinants: ethnic inequality is the strongest correlate.** Adding controls to the
   cubic, the population-weighted ethnic-inequality measure enters at **0.071**
   (p < 0.001, N = 844). Resource rents enter positively (0.018, p < 0.01) and arable-land
   share negatively (−0.053, p < 0.001); trade openness 0.005 (p < 0.01); aid/GDP 0.015
   (p < 0.05). Published column 4 (ICRG bureaucratic quality) is not reproducible.

8. **The light elasticity survives spatial correlation.** The region-FE point estimate is
   **0.190**; the naive iid standard error (0.013) roughly doubles–triples under Conley
   spatial-HAC inference — **0.026 / 0.034 / 0.037** at 1,000 / 2,500 / 5,000 km — but the
   elasticity stays far from zero (t ≈ 5 even at the widest radius).

9. **Regional and personal inequality move together.** Across 144 countries, the household-
   income Gini rises with the interregional Gini (OLS slope **0.587**): places with wide
   gaps between regions also have wide gaps between people.

## Interpretations

- **0.102 light elasticity (col 7).** A 10% increase in light per pixel maps to about a
  1% increase in predicted regional GDP per capita once national income and geography are
  held fixed. The elasticity is modest because national GDP already absorbs most of the
  cross-country scale; lights then sharpen the *within-country* income map.

- **0.889 national-GDP elasticity (col 7).** Regional income tracks national income almost
  one-for-one; lights add the residual subnational texture. This is why the method works
  even where subnational accounts are missing — the national anchor plus the light gradient
  pins down each region.

- **r = 0.925 predicted vs observed.** The scatter hugs the 45° line across four orders of
  magnitude of income, so the calibration generalises across rich and poor regions rather
  than fitting one income band.

- **FE 0.049 vs RE 0.102 (col 7).** This is not an error: the within estimator throws away
  the between-region differences that random effects exploit. For a beginner this is the
  cleanest illustration in the post of why estimator choice changes the number.

- **Table 2 gap (0.49 vs 0.21 for Gini).** Predicted income more than doubles the
  correlation with observed inequality relative to raw light density. Predicting income
  first — instead of treating light itself as income — is what makes the inequality
  measures trustworthy.

- **Weighting lowers Gini by 0.0034 on average.** Equal weighting lets a tiny, very rich
  (or very poor) region swing the index; population weighting ties the index to where
  people actually live, which is the policy-relevant quantity.

- **Germany 2010 worked example: GINIW = 0.0278** over its 16 regions in the training
  sample (Theil 0.0016, CV 0.0565). A small, transparent case makes the index formula
  concrete before it is applied to 180 countries.

- **N-shape cubic 0.293 / −0.032 / 0.001.** The positive linear, negative quadratic and
  tiny positive cubic terms trace inequality rising through industrialisation, narrowing as
  countries converge internally, then edging up again at the richest incomes — Williamson's
  hump with a modern twist.

- **Ethnic inequality 0.071.** Of all the structural controls, differences in light/income
  across ethnic homelands are the strongest correlate of regional inequality, consistent
  with the paper's emphasis on ethnic geography over pure economic geography.

- **Conley SE 0.026–0.037 vs iid 0.013.** Treating each region-year as independent
  understates uncertainty two- to three-fold because neighbouring regions share shocks; the
  spatially-robust interval is wider but still excludes zero, so the result is real, not an
  artefact of clustered errors.

- **Slope 0.587 (regional vs personal).** Interregional inequality explains a sizeable part
  of cross-country differences in interpersonal inequality, so subnational convergence
  policy is also distributional policy.

## Figure inventory

| Figure | Shows | Headline number |
|--------|-------|-----------------|
| 01 distributions | log lights, log regional GDP, GINIW | GINIW mean 0.064 |
| 02 time trends | inequality and income, 1992–2012 | GINIW 0.070 → 0.061 |
| 03 by WB region | GINIW across 7 region groups | SSA median 0.096 vs N.Am 0.038 |
| 04 index heatmap | co-movement of 5 indices | corr(Gini, CV) = 0.97 |
| 05 Table 1 | lights→GDP, FE vs RE | col 7 RE 0.102 |
| 06 predicted vs observed | calibration fit | r = 0.925 |
| 07 population weights | weighted vs unweighted Gini | corr 0.75, mean diff −0.0034 |
| 08 Table 2 correlations | predicted/light vs observed | Gini 0.49 vs 0.21 |
| 09 Table 3 | Kuznets cubic, 5 indices | 0.293 / −0.032 / 0.001 |
| 10 Kuznets scatter | inequality vs development | N-shape |
| 11 Table 4 | determinants | ethnic 0.071 |
| 12 Conley SE | spatial robustness | β 0.190, SE 0.026–0.037 |
| 13 regional vs personal | two inequalities | slope 0.587 |

## Reproduction audit (vs the paper / archive)

| Quantity | Paper / archive | This replication | Status |
|----------|-----------------|------------------|--------|
| Table 1 RE elasticities | 0.399/0.190/0.153/0.122/0.232/0.104/0.102 | 0.399/0.190/0.153/0.123/0.232/0.104/0.102 | match (±0.001) |
| Table 1 col 7 national GDP | 0.889 | 0.889 | match |
| Table 2 pred-vs-obs (Gini) | 0.49 | 0.4944 | match |
| Table 3 GINIW cubic | 0.293/−0.032/0.001 | 0.293/−0.032/0.001 | match |
| Table 4 ethnic inequality | 0.071 | 0.0709 | match |
| Table B.4 point estimate | 0.190 | 0.190 | match |
| Table B.4 Conley SEs | 0.026/0.034/0.037 | 0.026/0.034/0.037 | match |
| Figure 5a slope | 0.587 | 0.587 | match |

## Surprises and caveats

- **N off by one** (Table 3 N = 879 vs 880; Table 4 col 5 N = 844 vs 845): PyFixest drops a
  singleton country-period the Stata estimator retained. Coefficients are unaffected.
- **Cross-sample GINIW gap.** Our from-scratch GINIW (built on the ~1,500 regions with
  *observed* GDP) correlates 0.88, not 1.00, with the published series, which is computed
  over *every* subnational region (the full-world prediction we do not bundle for size).
  This is a coverage difference, not an error — and it is why the paper had to predict
  income for all regions on Earth.
- **FE vs RE for Table 1.** PyFixest cannot estimate random effects; columns 1 and 3–7 of
  the paper are random-effects models. We show the PyFixest FE/OLS estimate alongside a
  `linearmodels` RE estimate so the table both runs in PyFixest and reproduces the paper.
- **ICRG-blocked results.** Table 4 published column 4 and Figure 5b require licensed ICRG
  data absent from the archive; they are omitted.
- **Descriptive, not causal.** The Kuznets and determinant regressions are associations
  with country and period fixed effects, not causal effects; the lights→GDP step is a
  prediction model, not a structural relationship.
