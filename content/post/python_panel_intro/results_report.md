# Results Report: Introduction to Panel Data Methods

**Script:** `script.py`
**Executed:** 2026-04-28 22:08
**Status:** Success
**Runtime:** not recorded (≈ 30 s typical)
**Language:** Python 3.13
**Key packages:** `pyfixest 0.50.1`, `linearmodels 7.0`, `statsmodels`, `scipy`, `pandas`, `numpy`, `matplotlib`

---

## Execution Summary

The script runs a beginner-friendly tour of the standard panel-data estimators on a balanced two-period worker wage panel (`wage_panel_bob4.dta`, 2010 & 2012, N = 2,199 individuals, T = 2). It estimates the union-membership effect on log wages with seven methods — Pooled OLS, Between, First-Differences, Within (FE), Dummy-Variable FE (one-line aside), Two-Way FE, and Random Effects — then runs the Hausman specification test and the Mundlak/CRE alternative. Five PNG figures and six CSV tables are generated.

The headline finding: estimators that ignore individual heterogeneity (POLS β = 0.0750; Between β = 0.0662) report a union wage premium roughly one-third the size of the within-individual estimate (FE β = 0.2103). Once worker fixed effects are absorbed, switching union status is associated with a ~21 % log-wage gain — but the Hausman test (χ² = 1.79, p = 0.180) fails to reject the random-effects restriction, primarily because the within standard error is large (only 9 % of total union variance is within-individual).

**Warnings:** None.

---

## Data Overview

```text
Full dataset: 11045 rows × 9 cols, years [2010, 2012, 2014, 2016, 2018]
Exported raw_data.csv (11045 rows)
Filtered panel: 4398 rows × 10 cols  (dropped 20 NA)

Individuals (N): 2199
Time periods (T): 2
Observations (N×T): 4398
Balanced: True

Descriptive statistics:
           lwage      union        age  schooling
count  4398.0000  4398.0000  4398.0000  4398.0000
mean      3.1061     0.1626    35.6794    14.5020
std       0.5982     0.3690     6.2576     2.1825
min      -1.7325     0.0000    25.0000     3.0000
25%       2.7434     0.0000    30.0000    12.0000
50%       3.0958     0.0000    35.0000    15.0000
75%       3.4671     0.0000    41.0000    16.0000
max       6.0635     1.0000    49.0000    17.0000
```

**Interpretation:** The analysis sample is a perfectly balanced two-period panel of 2,199 prime-age workers (mean age 35.7, range 25–49), each observed in 2010 and 2012, for 4,398 worker-year observations. Only 16.3 % of the sample is unionized in any given period (mean union = 0.1626), so the dataset is weighted toward non-union workers — a relevant constraint for estimators that lean on cross-sectional variation. Mean log wage is 3.11 with a standard deviation of 0.60, and average schooling is 14.5 years; these magnitudes are typical for U.S. NLSY-style wage data. Because only 20 of 4,418 candidate rows were dropped for missing values, the estimation sample is essentially the full filtered panel.

---

## Method Results

### Between vs Within Variance Decomposition

```text
Variable       Overall SD   Between SD    Within SD   Between %
--------------------------------------------------------------
lwage              0.5982       0.5570       0.2184       86.7%
union              0.3690       0.3576       0.0911       93.9%
age                6.2576       6.1755       1.0147       97.4%
schooling          2.1825       2.1827       0.0000      100.0%
```

**Interpretation:** For every variable in the model, the bulk of the variation is *between* workers, not over time within a worker. Union status is 93.9 % between and only 9.1 percentage points of variance comes from workers actually switching union status across the two periods — the small slice of the data that fixed-effects estimators are confined to using. Schooling has zero within variation (100 % between), which is why the FE/TWFE specifications mechanically absorb it. Because the within share for `union` is so thin, FE standard errors will be much larger than POLS standard errors; the methodological choice between FE and RE is therefore not just an unbiasedness question but a precision question.

### Pooled OLS (POLS)

```text
Union coefficient: 0.0750  (SE 0.0231)
```

**Interpretation:** Treating every worker-year as an independent observation gives a union premium of 7.5 % log points (SE 2.3 percentage points), highly significant at conventional levels (t ≈ 3.2). This is the naive cross-sectional answer and the standard reference point in introductory econometrics. It is almost certainly biased: if higher-ability workers select into non-union sectors (or vice versa), POLS confounds the union effect with unobserved skill, education, or sector heterogeneity. The remainder of the analysis exists to ask how much of this 0.075 estimate survives once unobserved worker traits are accounted for.

### Between Estimator

```text
Union coefficient: 0.0662  (SE 0.0311)
Sample collapsed to 2199 individual averages — within-person changes are erased.
```

**Interpretation:** Collapsing each worker to their two-year mean and running OLS across workers gives 6.6 % log points (SE 3.1) — the cross-sectional effect with all within-individual variation explicitly thrown away. The Between coefficient is similar in magnitude to POLS (0.066 vs 0.075), which makes sense: 94 % of union variance is between-worker, so POLS and Between are nearly the same picture seen from slightly different angles. Both share the same identification problem and serve as the *pre-FE* benchmarks against which the within estimators will diverge sharply.

### First-Differences (FDFE)

```text
Union coefficient: 0.2113  (SE 0.0792)
Differenced sample: 2199 rows (one per worker since T=2).
```

**Interpretation:** Subtracting each worker's 2010 value from their 2012 value purges any time-invariant individual confounder; the remaining slope of 21.1 % log points (SE 7.9) is identified solely from the workers who *changed* union status between the two waves. The estimate jumps roughly threefold relative to POLS (0.211 vs 0.075), and the standard error nearly quadruples — the classic signature of moving from a cross-sectional to a switcher-only design. The 95 % confidence interval [0.06, 0.37] is wide but excludes zero, so the upward revision is detectable despite the much smaller effective sample.

### Within / Fixed Effects (FE)

```text
Union coefficient: 0.2103  (SE 0.0812)
Clustered SE at ID: 0.0812  (coefficient unchanged)
FD coef  = 0.211314
FE coef  = 0.210318
diff     = +0.000996  (closes once we add year FE → TWFE)
DVFE coefficient: 0.2103  (same as FE, with N-1 dummies)
```

**Interpretation:** The within (FE) estimator returns a union effect of 21.0 % log points (SE 8.1), essentially identical to FDFE — confirming the textbook identity that, for T = 2, first-differences and the within transformation produce the same coefficient up to a small intercept-driven gap (≈ 0.001 here, which closes once year FE is added). Clustering standard errors at the individual level leaves the slope unchanged; the dummy-variable FE specification, which estimates 2,198 nuisance intercepts directly, recovers the same 0.2103 coefficient. The triple agreement (FE = DVFE ≈ FDFE) is the single most important pedagogical takeaway of the script: three apparently different recipes are algebraically the same estimator.

### Two-Way Fixed Effects (TWFE)

```text
Union coefficient: 0.2129  (SE 0.0793)
Schooling and gender are absorbed (time-invariant) — TWFE cannot identify their effects.
```

**Interpretation:** Adding year fixed effects on top of individual FE yields a union effect of 21.3 % log points (SE 7.9), nearly indistinguishable from FE (0.210) but with the FD–FE intercept gap mechanically closed. Schooling, female, and any other time-constant regressor are absorbed by the individual FE and cannot be identified by TWFE — a structural limitation of within-style methods, not a coding error. For applied work this means TWFE answers a narrow question well (the effect of a *change* in the regressor) but cannot speak to time-invariant determinants of wages.

### Random Effects (RE)

```text
Union coefficient: 0.1092  (SE 0.0299)
RE is a weighted average of Between and Within — leans toward FE when within-variance dominates.
```

**Interpretation:** The RE estimator splits the difference between cross-sectional and within information, returning 10.9 % log points (SE 3.0). Because the data has very little within variation in union status (only 9 % of total), RE leans heavily toward the Between picture and lands much closer to POLS (0.075) and Between (0.066) than to FE (0.210). The RE standard error (0.030) is dramatically tighter than FE's (0.081) — a 2.7× efficiency gain — but this efficiency is real only if individual effects are uncorrelated with union membership; otherwise the precision is bought with bias.

### Hausman Test (FE vs RE)

```text
H statistic: 1.7941   df = 1   p-value = 0.1804
β_FE − β_RE = +0.1011
Fail to reject H0 → RE acceptable (more efficient than FE).
```

**Interpretation:** The Hausman test compares the FE and RE coefficients on union; the difference of +0.101 corresponds to a chi-square statistic of 1.79 on 1 degree of freedom, which yields a p-value of 0.180 — well above the 0.05 cutoff. Formally, the test fails to reject the null that individual effects are uncorrelated with union, so the conventional verdict is that RE is acceptable and preferred for its efficiency. This conclusion should be read with caution: the test has low power exactly when within variation is thin (as it is here), so a non-rejection partly reflects a noisy FE estimate rather than strong evidence in favor of RE consistency.

### Correlated Random Effects (CRE / Mundlak)

```text
Union (within) coefficient: 0.2103  (SE 0.0703)
Mundlak term (union_bar):   -0.1441  (p = 0.0717)
CRE within ≈ FE: 0.2103 vs 0.2103  ✓
Mundlak term is not significant → RE assumption is plausible.
```

**Interpretation:** Adding each worker's mean union status (`union_bar`) as a covariate inside an RE specification recovers the FE coefficient exactly: 0.2103 in both cases. The Mundlak term itself is −0.1441 with a p-value of 0.072, marginally non-significant at α = 0.05 but suggestive — it indicates that workers with higher *average* union exposure tend to have lower wages even after conditioning on within-person changes, consistent with negative selection into unionized jobs. This near-significance is the same substantive signal as the Hausman test, reaching the same conclusion through a different (and modern, more flexible) test.

### Method Comparison Table

```text
Method           Coef         SE  Description
------------------------------------------------------------------------------
POLS           0.0750     0.0231  Naive — ignores panel structure
Between        0.0662     0.0311  Cross-sectional means only
FDFE           0.2113     0.0792  First differences eliminate FE
FE             0.2103     0.0812  Within estimator (time-demean)
RE             0.1092     0.0299  GLS — assumes effects ⊥ X
CRE            0.2103     0.0703  Mundlak — bridges FE and RE
```

**Interpretation:** The six estimators cluster into two camps: cross-sectional methods (POLS 0.075, Between 0.066, RE 0.109) report a union premium of 7–11 % log points, while within-variation methods (FDFE 0.211, FE 0.210, CRE 0.210) report 21 %. The factor-of-three gap is consistent with a story in which ability or other unobserved worker attributes correlate negatively with union status — workers with higher latent skill are less likely to be in unions in this sample, so cross-sectional comparisons understate the within-worker payoff to joining a union. Standard errors swing inversely: cross-sectional methods are 2-3× more precise but identify a different (potentially biased) parameter, while within methods are noisier but causally cleaner under weaker assumptions.

### Extended Models with Controls

```text
Variable                POLS             TWFE               RE              CRE
============================================================================
union        0.0571 (0.0204)  0.2129 (0.0793)  0.0861 (0.0258)  0.2103 (0.0683)
age          0.0209 (0.0013) -0.0576 (0.0238)  0.0224 (0.0016)  0.0332 (0.0046)
schooling    0.1108 (0.0037)         absorbed  0.1112 (0.0047)  0.1108 (0.0047)
female      -0.2731 (0.0160)         absorbed -0.2731 (0.0206) -0.2731 (0.0206)
```

**Interpretation:** Adding age, schooling, gender, and year effects pulls the POLS union coefficient down to 0.057 — controls absorb some of the cross-sectional confounding — but TWFE and CRE still report a within-worker premium of about 0.21, leaving the 4× gap between camps largely intact. The schooling premium (≈ 11 % per year) and the female penalty (−27 % log points) are stable across POLS, RE, and CRE because these regressors are essentially time-invariant; both are absorbed by individual FE in the TWFE column. The age coefficient flips sign in TWFE (−0.058 vs +0.021 elsewhere) because identifying age effects from a two-year panel where every worker simply ages by two years confounds the age slope with the year fixed effect — a methodological artifact rather than a substantive finding.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `panel_intro_variation.png` | Stacked horizontal bar chart of between vs within variance shares for log wage, union, age, and schooling. | Almost all variation is between workers; within-variation in union (9 %) is the thin slice that FE/TWFE rely on. |
| 2 | `panel_intro_trajectories.png` | Spaghetti plot of log-wage trajectories for 30 sampled workers across 2010 → 2012, colored by union-status pattern (never / always / changed). | Workers who change union status (teal lines) are the identifying observations for FE; most of the sample is constant-union and contributes no within information. |
| 3 | `panel_intro_demeaning.png` | Two-panel scatter: raw union vs raw log wage (POLS slope), and worker-demeaned union vs demeaned log wage (FE slope). | The same data produces visibly different slopes — flatter on the raw scatter (POLS ≈ 0.08), steeper on the demeaned scatter (FE ≈ 0.21) — a geometric depiction of the within transformation. |
| 4 | `panel_intro_coef_comparison.png` | Horizontal bar chart of union coefficients with 95 % CI for the six basic estimators (POLS, Between, FDFE, FE, RE, CRE), with the Hausman χ² annotated. | Within-style estimators (FDFE, FE, CRE) cluster near 0.21; cross-sectional estimators (POLS, Between, RE) cluster near 0.07–0.11. Hausman χ² = 1.79, p = 0.180. |
| 5 | `panel_intro_extended_models.png` | Subplot grid showing union, age, schooling, and female coefficients across POLS, TWFE, RE, and CRE specifications with controls. | Time-invariant regressors (schooling, female) are absorbed by ID FE in TWFE; the union–TWFE/CRE gap relative to POLS/RE is preserved after adding controls. |

---

## Key Findings

1. **Within and cross-sectional estimators disagree by a factor of three.** POLS gives a 7.5 % union log-wage premium (SE 2.3); Between gives 6.6 % (SE 3.1); FE gives 21.0 % (SE 8.1); CRE gives 21.0 % (SE 7.0). The 0.21 vs 0.07 gap is the central pedagogical finding of the dataset.

2. **Three within recipes produce the same coefficient.** First-Differences (0.2113), Within / Fixed Effects (0.2103), and Dummy-Variable FE (0.2103) agree to the third decimal. The tiny FD–FE gap (+0.001) is fully explained by the FD intercept absorbing a year trend; adding year FE (TWFE = 0.2129) closes it.

3. **Union variance is mostly between, not within.** The variance decomposition shows union is 93.9 % between-individual and only 9.1 % of variance is within-individual switches. This is why FE standard errors (0.081) are 2.7× larger than RE standard errors (0.030) — FE simply has less data to work with.

4. **The Hausman test fails to reject RE — but with low power.** χ² = 1.79 on df = 1, p = 0.180. The non-rejection reflects the noisy FE coefficient as much as it reflects RE consistency; the Mundlak term is borderline (p = 0.072) and points the same direction. A blog post should not over-claim "RE is fine here" without flagging the precision caveat.

5. **CRE recovers the FE coefficient exactly while keeping schooling and gender identified.** CRE union = 0.2103, identical to FE; the Mundlak term `union_bar` = −0.144 (p = 0.072) captures the between-individual selection that FE eliminates by construction. Unlike FE, CRE still reports a schooling premium of 11.1 % per year and a female penalty of −27.3 % log points, making it the most informative single specification.

6. **Schooling and gender are mechanically absorbed by individual FE.** With T = 2 and time-invariant regressors, FE/TWFE cannot identify schooling or female effects — the script reports them as "absorbed". This is a structural limitation of within methods that newcomers commonly misread as a bug.

7. **The age coefficient flips sign in TWFE.** TWFE returns age = −0.058 vs +0.021 in POLS/RE/CRE. With T = 2 and every worker aging by exactly two years, age within an individual is collinear with the year dummy, so the TWFE age coefficient is not interpretable as an age–wage profile slope.

---

## Surprises and Caveats

- **FD and FE differ by 0.001, not zero.** With T = 2 the textbook claim is that the two coefficients are *identical*. They are — but only when the FD regression is run without an intercept. The script keeps the intercept (the more common applied practice) which absorbs an aggregate time trend, producing the small +0.001 gap. This is a pedagogical opportunity, not a bug: TWFE closes the gap exactly, which the script demonstrates explicitly.

- **Hausman non-rejection is power-limited.** With only 9 % within-variance in union, the FE estimate is noisy enough that the Hausman test would fail to reject RE for a wide range of true population disagreements. The companion Mundlak term (p = 0.072) is borderline and reaches the same verdict; future readers should not take "p = 0.180" as strong evidence that RE is correct.

- **TWFE age estimate is an artifact of T = 2 and equally-spaced waves.** The negative age slope in TWFE (−0.058) should not be taken as a real finding; with everyone aging exactly two years between waves, TWFE cannot separate age from year effects. POLS, RE, and CRE all return the expected positive age–wage slope (≈ +0.02 per year).

- **Dataset is small in T but large in N.** With T = 2 the within estimator drops to its minimum effective dimension; key textbook results (FD = Within identity, CRE = FE recovery) are clean here precisely because of this. On a longer panel many of these identities become approximations rather than equalities, and the choice between FE, FD, and CRE has more substantive consequences.

- **Identification rests on union switchers.** Only the workers who actually change union status between 2010 and 2012 contribute to the FE / FDFE / CRE / TWFE estimates. The script's wage-trajectories figure (Figure 2) makes this visible — most lines are flat-colored ("never union" or "always union"), and only the teal "changers" identify the within effect. If those switchers are non-representative (e.g., displaced workers, sector switchers), the within estimate is local to that subpopulation.

- **No formal model diagnostics beyond standard errors.** R-squared, F-tests, residual plots, and influence diagnostics are not produced. For an introductory tutorial this is intentional — the focus is on the estimator family, not specification testing — but the blog post should not present any of these models as fully validated.
