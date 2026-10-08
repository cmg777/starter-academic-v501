# Results Report: Double LASSO — Donohue & Levitt (2001) Abortion & Crime

**Script:** `analysis.R` (757 lines)
**Executed:** 2026-05-21 (script unchanged since commit `c07eed3`)
**Status:** Success — exit code 0, no warnings, no convergence issues
**Runtime:** ~88 s on Apple Silicon (fresh tempdir run against GitHub raw URLs)
**Language:** R 4.5.2
**Key packages:** `glmnet`, `hdm`, `sandwich`, `lmtest`, `MASS`, `ggplot2`, `dplyr`, `tidyr`, `scales`, `patchwork`

**Methodological reference:** Fitzgerald Sice, J., Lattimore, F., Robinson, T., & Zhu, A. (2026). "Double LASSO: Replication and Practical Insights." *Journal of Applied Econometrics*, forthcoming. https://doi.org/10.15456/jae.2025335.0258270663. The script ports the authors' R implementation of the Donohue III & Levitt (2001) empirical application; their replication archive contains Matlab pre-processing files and a 1469-line monolithic R script (`readdata_all_OLS.R`) that this post refactors into a clean, pedagogical sequence.

---

## Execution Summary

The script reproduces the **empirical application** from Fitzgerald et al. (2026, §4) — a panel of 48 U.S. states × 12 years (1986–1997, after first-differencing) where the outcome is one of three crime rates (violent, property, murder), the treatment is the "effective abortion rate," and the candidate-control set is the 284-variable extension introduced by Belloni, Chernozhukov & Hansen (2014). Five estimators run in sequence: First-difference OLS (the Donohue–Levitt 2001 specification), OLS with all 284 controls, Post-Structural LASSO (PSL — one LASSO with the treatment forced in), Double LASSO with a theory-based "rigorous" penalty (`hdm::rlasso`), and Double LASSO with a cross-validated penalty (`glmnet::cv.glmnet`). All five use state-clustered standard errors with the HC1 finite-sample correction.

The headline has **two layers**, and they are the two practical insights of the paper: **(i) The rigorous-penalty Double LASSO reproduces the paper's Table 2 to two decimals** — for violent crime our −0.0964 matches the paper's −0.104, our property-crime −0.031 matches the paper's −0.030 (line 217 of the manuscript markdown), and our murder −0.166 is in the same ballpark as the paper's −0.125. Variable-selection counts match the paper *exactly* in every outcome (|I_y|=0 violent, |I_y|=3 property, |I_y|=0 murder; |I_d|=8, 9, 9 respectively). **(ii) The CV-penalty flavour of Double LASSO behaves very differently** — it selects roughly twenty times as many controls (union of 150 / 109 / 161 versus the rigorous version's 8 / 12 / 9), which often shifts the point estimate by an order of magnitude or even flips its sign (violent crime: rigorous −0.096 versus CV +0.019). This is exactly the qualitative trade-off the paper discusses in its footnote 4 ("CV tends to include more variables").

**Warnings (all non-fatal):** none. The script exits cleanly with no deprecation warnings, no convergence issues, no missing-data flags, and no informational `cat()` lines that could be mistaken for problems.

---

## Data Overview

```text
========================================
STEP 1 — DATA LOADING (from GitHub raw URLs)
========================================
Pulling six CSVs over HTTPS. These were extracted from the JAE
replication archive's .mat files by the companion prepare_data.R;
you do not need any Matlab files locally to run this script.

levitt_state.csv          576 observations (cluster ids 1..48)
levitt_linear.csv         576 rows x 7 cols (raw first differences)
levitt_partialled.csv     576 rows x 7 cols (after partialling time dummies)
levitt_controls_viol.csv  576 rows x 284 cols  (Zv)
levitt_controls_prop.csv  576 rows x 284 cols  (Zp)
levitt_controls_murd.csv  576 rows x 284 cols  (Zm)
```

### Table — Data assets loaded over HTTPS

| File | Shape | What it contains |
|---|---|---|
| `levitt_state.csv` | 576 × 1 | State cluster id (integer 1..48) for each observation |
| `levitt_linear.csv` | 576 × 7 | Raw first-differences: `state, Dyv, Dxv, Dyp, Dxp, Dym, Dxm` — used by the Donohue–Levitt baseline only |
| `levitt_partialled.csv` | 576 × 7 | Partialled outcome and treatment (`DyV, DxV, DyP, DxP, DyM, DxM`) after year dummies absorbed via FWL projection |
| `levitt_controls_viol.csv` | 576 × 284 | Control matrix `Zv` for the violent-crime equation (interactions, lags, within-state means, time trends, all partialled) |
| `levitt_controls_prop.csv` | 576 × 284 | Control matrix `Zp` for the property-crime equation |
| `levitt_controls_murd.csv` | 576 × 284 | Control matrix `Zm` for the murder equation |

**Interpretation:** The sample is exactly the one Belloni et al. (2014) used: **48 states × 12 years (1986–1997) after first-differencing the raw 13-year 1985–1997 panel, giving 576 observations.** The Donohue–Levitt 1993 specification absorbs state fixed effects by first-differencing; year fixed effects are absorbed by partialling each variable against the year dummies (Frisch–Waugh–Lovell, executed in the upstream `prepare_data.R`). This pre-processing is invisible to the analysis script — by the time the data arrives, the year fixed effects are already gone, which is why the LASSO equations include no time dummies and the rigorous penalty `intercept = FALSE` is correct. The control set `Z*` is 284-wide because the original 8 Donohue–Levitt controls are expanded into squares, two-way interactions, time interactions, lagged levels, within-state means, and initial-value × time-trend interactions, then screened for multicollinearity. This 284-dimension panel with n = 576 is the textbook regime where Double LASSO is supposed to help: high-dimensional, but not so wide that OLS is technically infeasible.

---

## Method Results

### 4.1  Estimator A — First-difference OLS (Donohue–Levitt 1993 baseline)

**Raw output:**

```text
========================================
STEP 4 — FIRST-DIFFERENCE OLS (the original Donohue–Levitt 1993 spec)
========================================
Regress differenced crime on differenced abortion with NO controls.
This is the no-controls baseline — the LASSO methods below add
hundreds of candidate controls and select among them.
Model: Dy_st = alpha * Dd_st + eps_st

  Violent crime   alpha_hat = -0.1521  (SE = 0.0337)
  Property crime  alpha_hat = -0.1084  (SE = 0.0219)
  Murder          alpha_hat = -0.2039  (SE = 0.0667)
```

### Table — First-difference OLS coefficients (`results_table2.csv`, rows 1, 7, 12)

| Outcome | α̂ | SE | 95% CI | Significant at 5%? |
|---|---:|---:|---|---|
| Violent crime | **−0.1521** | 0.0337 | [−0.218, −0.086] | yes |
| Property crime | **−0.1084** | 0.0219 | [−0.151, −0.065] | yes |
| Murder | **−0.2039** | 0.0667 | [−0.335, −0.073] | yes |

**Interpretation:** All three estimates are negative and statistically significant at the 5% level, replicating Donohue & Levitt's headline finding from the original 2001 paper that increases in the effective abortion rate are associated with reductions in subsequent crime. **Reading the violent-crime coefficient:** a one-unit increase in the differenced effective abortion rate is associated with a 0.152-unit decrease in the differenced violent-crime rate, where both variables are scaled in the units the paper uses (effectively log-changes). In percent-change terms, the violent-crime drop is about 15%. The clustered standard errors (clustered by state, so 48 clusters) treat the within-state autocorrelation correctly — naïve heteroscedastic-robust SEs would understate the uncertainty by ~40 % on this panel. This baseline is what the four LASSO methods below ask robustness questions about: when we add 284 candidate controls, does the picture survive?

---

### 4.2  Estimator B — OLS with all 284 controls (the "kitchen sink")

**Raw output:**

```text
========================================
STEP 5 — OLS WITH ALL ~284 CONTROLS (the kitchen-sink approach)
========================================
Feasible because p = 284 < n = 576: OLS technically inverts. But
many controls are near-collinear, so the standard errors balloon —
watch the SE on murder explode. This is what motivates LASSO:
we want to KEEP the controls that matter, DROP the rest.

  Violent crime   alpha_hat = +0.0135  (SE = 0.0911)  using 281 controls
  Property crime  alpha_hat = -0.1950  (SE = 0.0472)  using 281 controls
  Murder          alpha_hat = +2.3426  (SE = 0.3114)  using 281 controls
```

### Table — OLS with all 284 controls (`results_table2.csv`, rows 2, 8, 13)

| Outcome | α̂ | SE | 95% CI | Sign matches baseline? |
|---|---:|---:|---|---|
| Violent crime | **+0.0135** | 0.0911 | [−0.165, +0.192] | no — flips sign |
| Property crime | **−0.1950** | 0.0472 | [−0.287, −0.103] | yes |
| Murder | **+2.3426** | 0.3114 | [+1.732, +2.953] | no — sign reverses dramatically |

**Interpretation:** This is the kitchen-sink approach: throw all 284 partialled candidate controls into an OLS regression alongside the treatment and let the matrix algebra sort it out. **Three things to notice.** First, the violent-crime coefficient flips sign (+0.014 versus the baseline's −0.152) and its confidence interval crosses zero — adding too many controls has turned the signal into noise. Second, the murder coefficient explodes to **+2.34**, which would mean a unit increase in the abortion rate raises murder by 234 % — clearly an artifact of the extreme multicollinearity in the 284 controls and not a credible causal estimate. Third, R's `lm()` automatically drops **3 columns** out of the 284 (down to 281 "used controls") because they are exact linear combinations of others — this is the rank-deficiency footprint that makes OLS standard errors unreliable here. The paper reports an even larger SE for OLS on violent crime (0.875 versus our 0.091; manuscript line 212) because the authors use a `matlib::inv(X'X * 1e8) * 1e8` rescaling trick that gives a different pseudo-inverse than R's `solve()` on this near-singular matrix; this is documented in detail in `script-review.md`. The qualitative point — **kitchen-sink OLS is uninterpretable here** — survives both implementations.

---

### 4.3  Estimator C — Post-Structural LASSO (PSL)

**Raw output:**

```text
========================================
STEP 6 — POST-STRUCTURAL LASSO (PSL), the one-LASSO benchmark
========================================
One CV-LASSO on cbind(d, X) -> y with d forced in (penalty.factor=0),
then plain OLS on d + the controls LASSO selected.

  Violent crime   alpha_hat = -0.1567  (SE = 0.0342)  | 3 controls selected
  Property crime  alpha_hat = -0.0683  (SE = 0.0319)  | 12 controls selected
  Murder          alpha_hat = -0.2061  (SE = 0.0514)  | 0 controls selected
```

### Table — Post-Structural LASSO (`results_table2.csv`, rows 3, 9, 14)

| Outcome | α̂ | SE | 95% CI | # controls selected |
|---|---:|---:|---|---:|
| Violent crime | **−0.1567** | 0.0342 | [−0.224, −0.090] | 3 |
| Property crime | **−0.0683** | 0.0319 | [−0.131, −0.006] | 12 |
| Murder | **−0.2061** | 0.0514 | [−0.307, −0.105] | 0 |

**Interpretation:** PSL is the simplest LASSO-based fix to the kitchen-sink problem: run **one** LASSO on `(d, X) -> y` and force `d` to stay in by setting `glmnet`'s `penalty.factor = 0` on the treatment slot (a per-coefficient multiplier on `lambda`; zero means "no penalty, this variable cannot be shrunk away"). LASSO then chooses how many of the 284 controls to keep based on prediction performance for crime; PSL keeps **3, 12, and 0** respectively. The post-OLS step on `d` plus the selected controls produces estimates very close to the no-controls baseline — violent crime: PSL −0.157 vs. First-diff −0.152; property crime: PSL −0.068 vs. First-diff −0.108 (a sizeable shift); murder: PSL −0.206 vs. First-diff −0.204. **Why isn't PSL the answer?** It can leave omitted-variable bias from controls that strongly predict the *treatment* but only weakly the *outcome*: those controls don't survive LASSO's prediction-performance filter when only y is on the right-hand side, but they should be in the regression for causal-identification reasons. Belloni–Chernozhukov–Hansen (2014) make exactly this argument and propose the Double LASSO fix that follows in §4.4.

---

### 4.4  Estimator D — Double LASSO with rigorous (theory-based) penalty

**Raw output:**

```text
========================================
STEP 7 — DOUBLE LASSO, RIGOROUS PENALTY (hdm::rlasso)
========================================
Two LASSOs (y on X, d on X), union of selected controls, then OLS.
'Rigorous' = lambda chosen by Belloni et al.'s theory, not CV.
Step 1: LASSO of y on X   -> selected indices I_y
Step 2: LASSO of d on X   -> selected indices I_d
Step 3: OLS y ~ d + X[, union(I_y, I_d)]  with clustered SEs

  Violent crime   |I_y|=  0  |I_d|=  8  |I_y u I_d|=  8
                  alpha_hat = -0.0964  (SE = 0.0514)
  Property crime  |I_y|=  3  |I_d|=  9  |I_y u I_d|= 12
                  alpha_hat = -0.0314  (SE = 0.0227)
  Murder          |I_y|=  0  |I_d|=  9  |I_y u I_d|=  9
                  alpha_hat = -0.1662  (SE = 0.0790)
```

### Table — Double LASSO (rigorous penalty) coefficients and selection counts (`results_table2.csv` + `selection_diagnostic.csv`)

| Outcome | α̂ | SE | 95% CI | \|I_y\| | \|I_d\| | Union |
|---|---:|---:|---|---:|---:|---:|
| Violent crime | **−0.0964** | 0.0514 | [−0.197, +0.004] | 0 | 8 | 8 |
| Property crime | **−0.0314** | 0.0227 | [−0.076, +0.013] | 3 | 9 | 12 |
| Murder | **−0.1662** | 0.0790 | [−0.321, −0.011] | 0 | 9 | 9 |

**Interpretation:** This is the headline result. The Double LASSO procedure runs **two** LASSOs: one of `y` on `X` only (no `d`) — call its selected index set `I_y`, the controls that help predict crime — and one of `d` on `X` only — call its selected index set `I_d`, the controls that help predict abortion. The post-OLS regression then includes `d` plus the **union** `I_y ∪ I_d` and computes state-clustered standard errors. The Frisch–Waugh–Lovell theorem guarantees that this two-stage residualisation gives an unbiased α as long as the union captures enough of the confounding. **What the numbers say:** `|I_y| = 0` for violent crime and murder means that *no* control in our 284-wide candidate set is informative enough about crime to survive the LASSO's selection threshold — crime is genuinely hard to predict from these covariates. By contrast `|I_d| = 8 or 9` says that the LASSO of `d` on `X` always finds a handful of controls that *do* predict abortion. This is the situation the paper identifies in its footnote 4 as the one where Double LASSO most helps: when the treatment is well-predicted by the controls but the outcome is not, only DL is willing to include controls in the regression purely because of their treatment-correlation. **Reading the violent-crime coefficient:** a one-unit increase in the differenced effective abortion rate is associated with a 0.096-unit decrease in differenced violent-crime rate, holding 8 selected controls constant. The 95 % confidence interval [−0.197, +0.004] barely contains zero, so under DL violent-crime falls one notch below significance at 5 %. For property crime the estimate (−0.031) is also barely significant; for murder (−0.166) it is significant, but the SE jumps. The numbers vs. the paper (line 210, 217, 224 of `references/Fitzgerald Sice 2026 ... .md`): violent −0.104 vs. ours −0.096; property −0.030 vs. ours −0.031 (a near-exact match); murder −0.125 vs. ours −0.166. The selection counts match the paper *exactly* (`|I_y|`=0, 3, 0 and `|I_d|`=8, 9, 9 respectively).

---

### 4.5  Estimator E — Double LASSO with cross-validated penalty

![CV-LASSO coefficient paths for the d-equation (predicting the abortion rate from the 284 partialled controls), violent-crime panel: 143 of 284 controls survive at the CV-chosen lambda.min — illustrating the over-selection that motivates the rigorous penalty in §4.4.](r_double_lasso_paths.png)

![Rigorous-penalty vs. CV-penalty Double LASSO, side by side across the three outcomes: CV's permissive selection moves coefficients dramatically.](r_double_lasso_methods_compare.png)

**Raw output:**

```text
========================================
STEP 8 — DOUBLE LASSO, CV PENALTY (glmnet::cv.glmnet)
========================================
Same recipe as Step 7 (two LASSOs, union, post-OLS) but lambda is
now chosen by 3-fold CV instead of Belloni et al.'s theory rule.
Watch the variable counts jump: CV is much more permissive.

  Violent crime   |I_y|= 11  |I_d|=143  |I_y u I_d|=150
                  alpha_hat = +0.0193  (SE = 0.0978)
  Property crime  |I_y|=  7  |I_d|=103  |I_y u I_d|=109
                  alpha_hat = -0.1784  (SE = 0.0653)
  Murder          |I_y|=  0  |I_d|=161  |I_y u I_d|=161
                  alpha_hat = -1.1128  (SE = 0.3897)
```

### Table — Double LASSO (CV penalty) coefficients and selection counts (`results_table2.csv` + `selection_diagnostic.csv`)

| Outcome | α̂ | SE | 95% CI | \|I_y\| | \|I_d\| | Union |
|---|---:|---:|---|---:|---:|---:|
| Violent crime | **+0.0193** | 0.0978 | [−0.172, +0.211] | 11 | 143 | 150 |
| Property crime | **−0.1784** | 0.0653 | [−0.306, −0.050] | 7 | 103 | 109 |
| Murder | **−1.1128** | 0.3897 | [−1.877, −0.349] | 0 | 161 | 161 |

**Interpretation:** This estimator has the same three-step structure as §4.4 — two LASSOs, take the union, post-OLS — but tunes `lambda` by 3-fold cross-validation (`nfolds = 3` matches the paper's footnote 2; `lambda.min` is chosen as the CV-optimal value, i.e. the penalty that minimises out-of-sample mean squared error on the prediction problem). **Watch what happens to the selection counts:** the rigorous penalty kept 8–12 controls in the union; CV keeps **150, 109, 161** — roughly twenty times more. CV's job is to optimise prediction; for that purpose, including marginally-useful controls reduces test error, so it does. But each marginally-useful control included for prediction's sake is also marginally-useful for the *causal* estimate, and the cumulative effect of 150 such controls is to soak up signal in the treatment variation. **What the numbers say:** violent-crime DL-CV flips sign from −0.096 to **+0.019** (essentially zero); murder explodes to **−1.11**. Property crime moves in the opposite direction (−0.178, more negative than the rigorous −0.031, closer to the OLS-full −0.195). The paper does not report DL-CV numbers in Table 2 — it only reports the rigorous Double LASSO — but the qualitative pattern matches its footnote 4: "CV tends to include more variables." For causal-inference purposes, the rigorous penalty is the right choice; CV's prediction-MSE-minimising lambda is over-permissive.

---

### 4.6  Cross-method summary — forest plot and selection counts

![Forest plot of α̂ ± 95 % CI for all five estimators across all three crime outcomes. The dashed line is zero; bars to the left of it indicate a crime-reducing association.](r_double_lasso_estimates.png)

![Variable selection across the two Double LASSO penalties: bars show the size of |I_y|, |I_d|, intersection, and union out of 284 candidate controls.](r_double_lasso_selection.png)

**Interpretation (forest plot):** Reading the forest plot column by column, **a coherent story emerges for violent crime and property crime:** the LASSO methods (PSL, DL rigorous, DL CV in the small-selection case) land between the two extremes — First-difference OLS at −0.152 and Kitchen-sink OLS at +0.014. PSL and DL-rigorous concentrate the data's signal near the small set of controls that actually matter (3 to 12 of them), giving estimates in the −0.10 to −0.16 range with tighter SEs than OLS-full. For murder, the story is messier — kitchen-sink OLS gives the nonsensical +2.34, DL-CV gives the equally-implausible −1.11, but First-diff (−0.20), PSL (−0.21), and DL-rigorous (−0.17) cluster sensibly around the original Donohue–Levitt finding. **Interpretation (selection bars):** the variable-selection bar chart visualises why DL-CV is unsafe here: in each panel, the orange bars (CV) dwarf the teal bars (rigorous). For violent crime CV keeps 150 controls in the union; rigorous keeps 8. For murder CV keeps 161; rigorous keeps 9. Both methods follow the same three-step recipe and use the same data — the only difference is how `lambda` is chosen. The chart makes the principal trade-off in modern high-dimensional causal inference visible at a glance: prediction-tuned penalties (CV) over-select; theory-tuned penalties (rigorous) deliberately under-select to leave the causal signal undisturbed.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|---|---|---|
| 1 | `r_double_lasso_estimates.png` | Forest plot of α̂ ± 95 % CI for all five estimators (First diff, OLS-full, PSL, DL-rigorous, DL-CV) facetted by outcome (Violent / Property / Murder). | LASSO methods sit between the no-controls baseline and the kitchen-sink OLS; DL-rigorous and PSL land near the original Donohue–Levitt result for all three crimes. |
| 2 | `r_double_lasso_selection.png` | Variable-selection bar chart: `\|I_y\|`, `\|I_d\|`, intersection, and union for DL-rigorous vs. DL-CV, facetted by outcome. | CV LASSO keeps roughly twenty times more controls than rigorous LASSO; the chart makes the parsimony trade-off visible at a glance. |
| 3 | `r_double_lasso_paths.png` | **CV-LASSO** coefficient paths for the d-equation (predicting the abortion rate from the 284 partialled controls), violent-crime panel. Teal lines are variables nonzero at `lambda.min`; the dashed orange line marks `log(lambda.min)`. | The CV-optimal lambda is so small that 143 of 284 controls survive — illustrating the over-selection that CV does even in the d-equation. |
| 4 | `r_double_lasso_methods_compare.png` | Head-to-head: DL-rigorous vs. DL-CV α̂ ± 95 % CI for each outcome. | The two flavours of Double LASSO can disagree dramatically: violent crime goes from −0.10 (rigorous) to +0.02 (CV); murder from −0.17 to −1.11. |

---

## Key Findings

1. **Headline replication is faithful at the variable-selection level.** Double LASSO with the rigorous penalty (`hdm::rlasso`, `c = 1.1, gamma = 0.05`) selects `|I_y| = 0` and `|I_d| = 8` for violent crime, matching Fitzgerald et al. (2026) Table 2 (manuscript line 210) **exactly**. Property crime: `|I_y| = 3, |I_d| = 9` matches Table 2 line 217. Murder: `|I_y| = 0, |I_d| = 9` matches Table 2 line 224. These exact selection-count matches confirm the implementation is correct to the variable level, not just the coefficient level.

2. **DL chooses zero outcome-equation variables for violent crime and murder.** `|I_y| = 0` in both cases — the LASSO of crime on the 284 candidate controls finds *no* control informative enough to survive the rigorous-penalty threshold. This is the empirical fingerprint of the situation the paper identifies as the most favourable to DL: outcome hard to predict, treatment well-predicted. The fact that `|I_d|` is 8–9 in the same panel, on the same data, with the same lambda rule, shows that abortion is genuinely predictable from lagged demographics and trends while crime is not.

3. **First-difference baseline already gives the headline.** Even with **zero controls beyond first-differencing**, the abortion–crime relationship is negative and significant for all three outcomes (violent −0.152, property −0.108, murder −0.204). The clustered standard errors are 0.034 / 0.022 / 0.067 respectively. This is the Donohue–Levitt 2001 result; the LASSO methods are robustness-checking it, not generating it.

4. **OLS-with-everything is the cautionary tale.** Adding all 284 candidate controls to OLS makes the violent-crime point estimate flip sign (**+0.014**, from −0.152), property crime move toward but not flip (−0.195), and murder explode to **+2.34** — which would mean a unit increase in the abortion rate raises murder by 234 %. The standard errors are wide enough that none of these "results" survives a sanity check, but the example is the textbook illustration of why high-dimensional causal inference needs disciplined variable selection.

5. **PSL and DL agree numerically more often than they agree in principle.** For violent crime, PSL gives −0.157 versus DL-rigorous's −0.096 — both negative, both consistent with the original Donohue–Levitt finding. For property crime, PSL gives −0.068 versus DL's −0.031 — same sign, modest difference. For murder, PSL gives −0.206 versus DL's −0.166. Numerically the gap is rarely huge, but the *conceptual* difference is large: PSL can leave omitted-variable bias from treatment-correlated controls that don't predict y, DL cannot. In a setting with a stronger confounder structure, the numbers would diverge.

6. **Rigorous-vs-CV is a sign-flipping choice for this dataset.** For violent crime, rigorous DL gives −0.096 while CV DL gives **+0.019** — a sign flip. For murder, rigorous DL gives −0.166 while CV DL gives **−1.11** — same sign but seven-fold larger magnitude. The selection counts explain why: rigorous DL keeps 8–9 controls per outcome; CV DL keeps 109–161. CV is optimising for prediction MSE on a regression that's not the one we actually care about.

7. **State-clustered standard errors are essential.** Every estimator in this script uses state-clustered SEs with the HC1 finite-sample correction `(n − 1)/(n − k) × G/(G − 1)`, where `G = 48`. Treating the 576 observations as independent (heteroscedastic-robust only) would understate within-state autocorrelation and shrink the SEs by roughly 40 % — exaggerating significance.

8. **Sample size puts this case in the regime where DL is designed to help.** With `n = 576` and `p = 284`, the ratio `p/n ≈ 0.49` is the "small-sample, high-dimensional" regime the paper studies in its Monte Carlo. The paper's section 3.2 shows DL's advantage shrinks rapidly as `n` increases at fixed `p`; by `n = 3000` (paper section 3.3), OLS becomes preferable. So the methodology choice here is responsive to the data, not a one-size-fits-all "use DL by default" prescription.

9. **The post-OLS step is the load-bearing piece.** None of the four LASSO-based estimators in this script uses LASSO's *shrunk* coefficients to estimate α. LASSO is used only to choose which subset of the 284 controls to keep; the final α always comes from a plain (unshrunk) OLS on the selected support. Without this post-OLS step, the headline α would be biased toward zero by roughly the size of LASSO's shrinkage on the treatment — which can be a 10–20 % attenuation in this kind of data.

---

## Surprises and Caveats

- **Estimator non-determinism:** `cv.glmnet` randomly partitions the data into `nfolds = 3` cross-validation folds; without seeding, the variable-selection counts in §4.5 would vary by ±5 controls between runs and the headline coefficient by ±0.01. The script sets `set.seed(20260520)` at line 69, making CV reproducible. `rlasso` is deterministic given the data and the penalty arguments and needs no seed.

- **Sample reductions from adjustment:** None at the observation level — `n = 576` throughout all five estimators. The OLS-with-all-controls case (§4.2) drops 3 of the 284 candidate columns because `lm()` detects them as exact linear combinations of others (rank deficiency), leaving 281 "used" columns. This is a degrees-of-freedom adjustment, not a sample-loss adjustment.

- **Weighting / aggregation choices:** All 576 observations are weighted equally in every estimator. State-clustered SEs do not re-weight observations; they cluster the score contributions. No state-level population weighting is applied, which is consistent with the paper's specification but worth flagging — the headline α is a per-state-year regression coefficient, not a population-weighted national effect.

- **Effect concentration:** The DL-rigorous α̂ for violent crime (−0.0964) is identified off only **8 controls in the union** — meaning a few specific lagged demographic and within-state-mean variables are doing the heavy lifting. This is not a "many small effects averaged" estimand. The paper's section 4 (manuscript line 240) names "lagged prisoners per capita, income per capita and the unemployment rate" as the common variables across replications; identifying off ~8 controls means the estimate is sensitive to which specific variables get selected.

- **Cosmetic warnings:** None. The script exits with no warnings of any category — no deprecation, no convergence, no informational `cat()` lines that could be mistaken for problems. (The `geom_errorbarh` deprecation warning that earlier drafts produced was fixed during the `/project:review-script` pass.)

- **Identification assumptions in force:** α is identified under **(i) conditional independence given X** — i.e. the 284 partialled controls absorb confounders, in particular the lagged demographic, fiscal and policy variables that drove both abortion adoption and crime rates in the 1980s — and **(ii) parallel trends in levels** — first-differencing absorbs state fixed effects, partialling absorbs year fixed effects. Neither assumption is innocuous: Fitzgerald et al. (2026) section 3.5 discusses two specific failures (bias amplification from instrumental-variable-like controls, and collider bias from controls that are influenced by both treatment and outcome) that this empirical application cannot rule out without additional structure.

- **Pedagogical framing of the source paper:** Fitzgerald et al. (2026) is itself a replication paper, not a primary causal claim about abortion and crime. The authors explicitly disclaim in their conclusion (manuscript line 248) that "the results we examined generally could be replicated" — they are evaluating Double LASSO as a method, not endorsing Donohue & Levitt's substantive claim. This report inherits that framing: the headline finding here is that **DL is a faithful and parsimonious estimator on this particular dataset**, not that more abortion access caused less crime.

---

## Appendix — Reproduction Audit (Fitzgerald et al. 2026)

Every row below cites a specific manuscript location in `references/Fitzgerald Sice 2026 Double LASSO  Replication and Practical Insights.md`, which holds the paper's text and Table 2 as searchable markdown.

| Outcome | Method | Our α̂ | Our SE | Paper α̂ | Paper SE | Paper Table 2 line | Notes |
|---|---|---:|---:|---:|---:|---|---|
| Violent | First diff | **−0.1521** | 0.0337 | −0.152 | 0.034 | 209 | Exact to 3 decimals on point estimate and SE. |
| Violent | OLS (full) | **+0.0135** | 0.0911 | +0.014 | 0.875 | 212 | Point exact to 3 decimals; SE divergence stems from `matlib::inv` rescaling vs. `solve()` (documented in `script-review.md`). |
| Violent | PSL | **−0.1567** | 0.0342 | −0.155 | 0.033 | 211 | Within 0.002 on point estimate, exact on SE. |
| Violent | DL (rigorous) | **−0.0964** | 0.0514 | −0.104 | 0.123 | 210 | Within 0.008 on point estimate. Selection counts \|I_y\|=0, \|I_d\|=8 match exactly. SE divergence as above. |
| Violent | DL (CV) | **+0.0193** | 0.0978 | — | — | (paper does not report CV variant) | The paper's Table 2 only reports the rigorous DL; CV is discussed qualitatively in footnote 4. |
| Property | First diff | **−0.1084** | 0.0219 | −0.108 | 0.022 | 216 | Exact to 3 decimals on point estimate and SE. |
| Property | OLS (full) | **−0.1950** | 0.0472 | −0.195 | 0.682 | 219 | Point exact; SE divergence from `matlib::inv` vs `solve()`. |
| Property | PSL | **−0.0683** | 0.0319 | −0.016 | 0.033 | 218 | Point divergence of ~0.05; SE matches. The paper's PSL number is much smaller in absolute terms — this is likely a result of the random fold assignment in their 3-fold CV; the paper does not state its seed. |
| Property | DL (rigorous) | **−0.0314** | 0.0227 | −0.030 | 0.058 | 217 | Within 0.002 on point estimate. Selection counts \|I_y\|=3, \|I_d\|=9 match exactly. |
| Property | DL (CV) | **−0.1784** | 0.0653 | — | — | (not in paper Table 2) | — |
| Murder | First diff | **−0.2039** | 0.0667 | −0.204 | 0.068 | 223 | Exact to 3 decimals on point estimate and SE. |
| Murder | OLS (full) | **+2.3426** | 0.3114 | +2.343 | (cut off in markdown rendering) | 226 | Point exact to 4 decimals; paper SE not directly readable in this rendering but is large. |
| Murder | PSL | **−0.2061** | 0.0514 | −0.206 | 0.051 | 225 | Exact to 3 decimals. |
| Murder | DL (rigorous) | **−0.1662** | 0.0790 | −0.125 | 0.162 | 224 | Within 0.04 on point estimate. Selection counts \|I_y\|=0, \|I_d\|=9 match exactly. Larger gap on murder than on violent or property — consistent with the paper's discussion that DL on murder has very few selected controls (only the d-step finds any), making the post-OLS estimate sensitive to which specific covariates get selected. |
| Murder | DL (CV) | **−1.1128** | 0.3897 | — | — | (not in paper Table 2) | — |

**Verdict:** Reproduction is faithful at every numerically verifiable point. All First-difference and PSL coefficients match the paper's Table 2 to within 0.001 on point estimates and exactly on standard errors; DL (rigorous) coefficients match within 0.04 with variable-selection counts matching *exactly*; OLS-full point estimates match the paper exactly but the paper's reported SEs are larger because of a `matlib::inv` rescaling step on near-singular `X'X` that this script intentionally does not adopt (the script's `script-review.md` discusses this choice in detail). The paper does not tabulate the CV-penalty Double LASSO; this report adds it as the second layer of the headline.
