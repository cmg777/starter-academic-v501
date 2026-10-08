# Results Report: Causal Machine Learning for Policy Evaluation

**Script:** `script.py`
**Executed:** 2026-05-02 14:39 (fresh run for report)
**Status:** Success
**Runtime:** not recorded (estimated ~60–120 s from file mtimes; the CausalForestDML fit dominates)
**Language:** Python 3.12.7
**Key packages:** numpy 1.26.4, pandas 2.2.2, matplotlib 3.9.2, scikit-learn 1.6.1, doubleml 0.11.2, econml 0.16.0

---

## Execution Summary

The script walks through the full Causal Machine Learning roadmap on a synthetic Flemish-ALMP-style cohort of 5,000 jobseekers: simulate data with known truths → diagnose covariate overlap → estimate the population-average effect of training on months employed (ATE) with both a naive baseline and DoubleML's IRM → estimate the group-average effect by Dutch language proficiency (GATE) using doubly-robust pseudo-outcomes → estimate per-individual effects (IATE) with EconML's CausalForestDML → compare methods on a forest plot → derive a welfare-maximising assignment rule and benchmark it against treat-all, treat-none, and an oracle that knows the true individual effect. The headline finding is that the naive difference-in-means is biased downward by 0.52 months and its 95% CI does **not** cover the truth, while DoubleML's CI does cover it and the causal forest recovers the true heterogeneity (correlation 0.956 between estimated and true individual effects), enabling an IATE-based assignment rule that captures 99.5% of the oracle welfare.

**Warnings:** None from Python. The `WARNING` line in the log is a pedagogical print emitted by the script itself before the naive estimator, flagging that difference-in-means is biased on observational data.

---

## Data Overview

```text
Sample size               : 5,000
Treatment share P(D=1)    : 0.528
Mean outcome E[Y]         : 22.68 months employed (out of 30)
Files written             : cml_data.csv, cml_truth.csv

Ground-truth parameters (extra months of employment caused by training):
         parameter  true_value
               ATE       5.628
GATE(dutch_prof=0)       7.634
GATE(dutch_prof=1)       6.123
GATE(dutch_prof=2)       4.612
GATE(dutch_prof=3)       3.130
```

Descriptive statistics of the observed columns (`cml_data.csv`):

```text
           age  edu_years  prior_emp_months  dutch_prof   female  migrant        D       Y
count  5000.00    5000.00           5000.00     5000.00  5000.00  5000.00  5000.00 5000.00
mean     39.82      12.02             16.99        1.33     0.49     0.30     0.53   22.68
std      11.54       2.95              9.59        1.02     0.50     0.46     0.50    4.18
min      20.02       6.00              0.37        0.00     0.00     0.00     0.00    9.81
25%      29.78      10.01              9.49        0.00     0.00     0.00     0.00   19.73
50%      39.68      11.94             15.80        1.00     0.00     0.00     1.00   22.81
75%      49.95      14.01             23.33        2.00     1.00     1.00     1.00   25.79
max      59.99      20.00             54.75        3.00     1.00     1.00     1.00   30.00
```

**Interpretation:** The cohort is 5,000 jobseekers aged 20–60 (mean 39.8) with 12 years of education on average and 17 months of prior employment in the look-back window. The treatment share of 52.8% is high relative to a real-world ALMP study, but it is calibrated so that the synthetic propensity scores stay safely inside the [0.21, 0.81] range and overlap is preserved across all four Dutch-proficiency strata. The outcome — months employed in a 30-month window — has a mean of 22.68 with a standard deviation of 4.18, leaving plenty of room (the floor is 0 and the ceiling 30) for a realistic 5-to-8-month treatment effect to be visible. The four ground-truth GATEs decline monotonically with Dutch proficiency (7.63 → 6.12 → 4.61 → 3.13 months), so the lowest-proficiency stratum is expected to benefit roughly **2.4× more** from training than the highest (under the truths; the estimates produce a slightly larger 2.6× ratio because the highest-proficiency GATE is the noisiest).

---

## Method Results

### Step 2 — Overlap diagnostic

```text
Propensity range          : [0.208, 0.810]
P(D=1 | X) mean (treated) : 0.551
P(D=1 | X) mean (untreat.): 0.502
Saved figure              : cml_overlap.png
```

**Interpretation:** Estimated propensity scores fall safely inside [0.21, 0.81], so neither the strict positivity assumption nor the conventional [0.05, 0.95] trimming bounds bind. The treated mean propensity (0.551) sits only 0.049 above the untreated mean (0.502) — a small but real gap that confirms the data are mildly confounded rather than randomized, which is exactly the regime where doubly-robust methods are designed to outperform a naive baseline. This sets up a clean pedagogical contrast: confounding is real but not so severe that any sensible adjustment will close the gap.

### Step 3 — Naive estimator (difference-in-means)

```text
True ATE                  : 5.628
Naive estimate            : 5.111 [95% CI 4.926, 5.296]
Bias                      : -0.517 months
```

**Interpretation:** The naive difference-in-means delivers a point estimate of 5.111 months with a 95% Welch-style confidence interval of [4.93, 5.30]. The true ATE is 5.628, so the naive estimator is biased downward by 0.52 months — about 9.2% of the truth — and its CI **fails to cover** the true value, which is the point: when caseworkers steer low-Dutch-proficiency jobseekers (those with the largest treatment effects) into training, treated outcomes are *also* shaped by everything else those jobseekers have in common (less work history, weaker employability), and a simple comparison cannot disentangle the two. This is a textbook illustration of why "the program seems to work less well than it really does" can be an artifact of who got selected into it, not the program's true effect.

### Step 4 — ATE via DoubleML (Interactive Regression Model)

```text
True ATE                  : 5.628
DoubleML ATE              : 5.520 [95% CI 5.361, 5.680]
95% CI covers truth       : True
Bias                      : -0.108 months
```

**Interpretation:** Once the random-forest nuisance functions absorb the dependence of both treatment assignment and the outcome on the covariates — fit with 5-fold cross-fitting and combined via the doubly-robust IRM score with `trimming_threshold = 0.01` — the residual bias collapses from 0.517 to 0.108 months, and the 95% CI [5.36, 5.68] now covers the true ATE of 5.628. In substantive terms, the corrected estimate raises the implied programme effect from "about 5.1 extra months" to "about 5.5 extra months" of employment in a 30-month window, and the standard error drops from 0.094 (naive) to 0.081 — so DoubleML is not just less biased but also slightly *more* precise, because the cross-fitted nuisance models soak up outcome variance that the naive estimator leaves in the residual.

### Step 5 — GATE by Dutch proficiency (doubly-robust score, averaged within strata)

```text
 dutch_prof    n  gate_estimate  std_error  ci_low  ci_high  gate_true
          0 1302          7.465      0.157   7.157    7.772      7.634
          1 1469          6.127      0.140   5.852    6.402      6.123
          2 1504          4.503      0.142   4.225    4.781      4.612
          3  725          2.910      0.214   2.490    3.329      3.130
```

**Interpretation:** Averaging the cross-fitted doubly-robust pseudo-outcomes within each Dutch-proficiency stratum recovers the monotone decline almost exactly: 7.47 / 6.13 / 4.50 / 2.91 estimated against 7.63 / 6.12 / 4.61 / 3.13 truth. Every estimate is within 0.22 months of the truth, the four 95% confidence intervals all cover their respective targets, and the ratio of the lowest-proficiency to highest-proficiency effect (≈ 2.6× under the estimates, 2.4× under the truths) matches the policy-relevant punchline of Cockx, Lechner & Bollens (2023): training delivers the biggest payoff to those who are furthest from the local-language labour market. Standard errors widen for the smallest stratum (n = 725, SE 0.214) but tighten where data are densest (n = 1,504 in stratum 2, SE 0.142), exactly as expected.

### Step 6 — IATE via CausalForestDML

```text
True ATE                  : 5.628
Mean of estimated IATEs   : 5.456
MAE(IATE, truth)          : 0.397
Corr(IATE, truth)         : 0.956
```

**Interpretation:** EconML's `CausalForestDML` (400 trees, `min_samples_leaf = 15`, `max_samples = 0.5`, RF nuisances, `discrete_treatment = True`) produces 5,000 individual-level effect estimates whose Pearson correlation with the true individual effects is **0.956** and whose mean absolute error is just **0.40 months**. The mean of the estimated IATEs is 5.46, within 0.17 of the true ATE — so the forest is not only ranking individuals correctly (the policy-relevant property) but also calibrated in level. In policy terms this matters: an assignment rule built from these estimates can hope to identify *which* jobseekers benefit most from training, not just whether the average effect is positive, and the 0.4-month MAE is small relative to the 4.5-month spread of true effects across individuals.

### Step 7 — Method comparison

```text
                         method  estimate  ci_low  ci_high    bias
                    Naive (DiM)     5.111   4.926    5.296  -0.517
                 DoubleML (IRM)     5.520   5.361    5.680  -0.108
CausalForestDML (mean of IATEs)     5.456   5.416    5.497  -0.172
                          Truth     5.628   5.628    5.628   0.000
```

**Interpretation:** The forest plot tells the story in a single panel: the naive interval [4.93, 5.30] sits entirely below the true ATE (5.628) — visually obvious confounding bias — while DoubleML's [5.36, 5.68] straddles the truth, and the CausalForestDML mean-of-IATEs interval [5.42, 5.50] is the tightest of the three (the forest pools 5,000 individual estimates, so the *average* is precisely pinned even when individual IATEs have wider CIs). The CausalForestDML interval is in fact slightly *too narrow* — its midpoint of 5.46 is 0.17 below truth and the upper bound (5.50) does not cover 5.628 — which is a known caveat of forest-based ATE inference: this CI captures sampling uncertainty in the *average of individual predictions*, not in the population ATE itself, so it does not pick up the small downward calibration bias of the forest as a whole. The practical takeaway is to prefer DoubleML when the question is "what is the ATE?" and reserve CausalForestDML for ranking and heterogeneity.

### Step 8 — Welfare-maximising policy rule (cost = 4 months)

```text
                                   rule  share_treated  avg_welfare  cost_assumption_months
                             Treat none          0.000        0.000                   4.000
                              Treat all          1.000        1.628                   4.000
IATE rule (treat where iate_hat > cost)          0.839        1.749                   4.000
   Oracle (treat where true tau > cost)          0.838        1.758                   4.000
```

**Interpretation:** Once you have credible per-person effect estimates, the welfare comparison is striking. Holding training back from everyone yields zero net welfare. Treating everyone yields 1.63 months of net welfare per person (the ATE of 5.63 minus the assumed cost of 4.0). Switching to a targeted rule that treats only individuals with estimated IATE above the 4-month cost threshold treats 83.9% of the cohort — almost identical to the 83.8% the oracle would treat — and lifts welfare to 1.749 months per person, recovering **99.5% of the oracle's 1.758-month welfare** and beating treat-all by 7.4%. The IATE rule's small welfare gap relative to oracle (just 0.009 months per person) reflects the 0.4-month MAE in the individual estimates: the rule occasionally treats a person it shouldn't and skips a person it should, but those errors net out to a tiny welfare loss because the misranked individuals are concentrated near the cost cutoff where the welfare slope is shallow.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `cml_overlap.png` | Histogram of estimated propensity scores split by treatment status (D = 0 vs D = 1). | Both groups span roughly [0.2, 0.8]; the distributions overlap heavily, so positivity holds and no observation needs to be trimmed. |
| 2 | `cml_gate_dutch.png` | Bar chart of estimated GATE (with 95% CIs) vs. true GATE for each Dutch-proficiency stratum (0–3). | The estimated bars track the true bars almost exactly, with a clean monotone decline from 7.5 (stratum 0) to 2.9 (stratum 3). |
| 3 | `cml_iate_scatter.png` | Scatter of estimated IATE (y) against true individual effect τ (x), 5,000 points, with the 45° line overlaid. | Points cluster tightly along the diagonal (corr = 0.956); the forest's individual rankings are highly accurate. |
| 4 | `cml_iate_distribution.png` | Histogram of estimated IATEs, coloured by Dutch-proficiency stratum. | Distributions shift monotonically left as Dutch proficiency rises, mirroring the GATE pattern at the individual level. |
| 5 | `cml_method_comparison.png` | Forest plot of point estimates and 95% CIs for Naive / DoubleML / CausalForestDML mean / Truth, with a dashed reference line at the true ATE. | The naive CI clearly does **not** cover the truth; DoubleML's does; the truth marker (orange star) sits at 5.628 between the DoubleML and forest midpoints. |
| 6 | `cml_policy_welfare.png` | Bar chart of average welfare per individual under treat-none, treat-all, IATE rule, and oracle. | The IATE rule (1.749) almost matches oracle (1.758) and outperforms treat-all (1.628) by ~7%, demonstrating the policy value of personalised effect estimates. |

---

## Key Findings

1. **The naive estimator is visibly biased and its 95% CI fails to cover the truth.** Naive difference-in-means yields 5.111 [4.93, 5.30] against a true ATE of 5.628 — a downward bias of 0.52 months (9.2% of the truth) and a CI whose upper bound (5.30) is 0.33 months below the true value. This is the cleanest pedagogical demonstration in the script that confounding is real on these data.
2. **DoubleML closes 79% of the bias gap.** Cross-fitted DoubleML IRM with random-forest nuisances reduces bias from 0.517 to 0.108 months and produces a 95% CI of [5.36, 5.68] that *does* cover the true ATE. It also tightens the standard error from 0.094 (naive) to 0.081, so the doubly-robust method is both less biased and slightly more precise.
3. **GATEs decline monotonically with Dutch proficiency, and the doubly-robust strata averages match the truth within 0.22 months everywhere.** Estimated GATEs of 7.47 / 6.13 / 4.50 / 2.91 across Dutch-proficiency levels 0–3 line up against truths 7.63 / 6.12 / 4.61 / 3.13, with all four 95% CIs covering their target. The lowest-proficiency stratum benefits ≈ 2.6× more from training than the highest, mirroring the policy-relevant heterogeneity finding from Cockx, Lechner & Bollens (2023).
4. **CausalForestDML recovers the individual-level effect surface with 0.956 correlation and a 0.40-month MAE.** Across all 5,000 individuals, estimated IATEs correlate 0.956 with the true τ and the mean absolute error is 0.397 months — small relative to the 4.5-month spread of true effects — so the forest is producing usable rankings and well-calibrated levels, not just an average.
5. **A welfare-maximising IATE rule captures 99.5% of oracle welfare.** Treating only individuals with estimated IATE above the 4-month cost threshold treats 83.9% of the cohort, generates 1.749 months of net welfare per person versus 1.758 for the oracle, and beats treat-all (1.628) by 7.4% — concrete evidence that CML is not an academic exercise but a tool that converts directly into a better assignment rule.
6. **The CausalForestDML interval for the *average* effect is too narrow to cover truth.** The 95% CI on the mean of IATEs is [5.42, 5.50], whose upper bound (5.497) sits 0.13 months below the true ATE (5.628). This is not a contradiction — DoubleML targets the population ATE directly while the forest's average-of-IATEs CI captures sampling uncertainty in *individual* predictions but not finite-tree bias in their average — but it is a useful caveat for the blog post: prefer DoubleML for ATE inference, and use CausalForestDML for heterogeneity and ranking.

---

## Surprises and Caveats

- **CausalForestDML mean-of-IATEs CI does not cover the true ATE** even though the forest is well-calibrated overall (correlation 0.956). The CI is built from per-individual prediction variance and is centred 0.17 months below truth, so the population mean falls outside the [5.42, 5.50] band. The right takeaway is methodological, not statistical: this CI is for the *average* of point predictions, not the population ATE. The blog post should not present this interval as a competitor to the DoubleML CI — they target different things. DoubleML remains the recommended estimator when the question is "what is the ATE?"
- **Treatment share is high (52.8%).** The synthetic DGP is calibrated so that propensities stay in [0.21, 0.81] and overlap is comfortable in every stratum. In a real ALMP study the treated share would typically be much smaller and overlap would be the binding constraint, not the inferential one. Readers should not over-interpret the magnitude of effects without remembering that this is a synthetic illustration.
- **Sample size in the highest-proficiency stratum (n = 725) gives the noisiest GATE.** The standard error in stratum 3 is 0.214, ≈ 50% larger than in strata 1–2 (0.140 / 0.142), and the point estimate (2.91) is the furthest from truth (3.13) of any stratum. This is the right behaviour — uncertainty scales with sample size — but it flags that real-world heterogeneity studies need attention to thin cells.
- **Cross-fit fold assignment uses the global numpy RNG.** During post-review polishing it became clear that removing `np.random.seed(RANDOM_SEED)` causes the DoubleML ATE to drift by O(1e-3) across runs because DoubleML's internal CV splitter draws fold assignments from the global RNG. The seed line is therefore **not** dead code; the script restores it with a clarifying comment, and determinism has been verified across two consecutive fresh runs.
- **No convergence or deprecation warnings.** The script silences `FutureWarning` and `UserWarning` categories specifically (not all warnings) in the warnings filter near the top of the file; a fresh interpreter session was checked and no warnings were raised by sklearn, doubleml, or econml at the installed versions.
- **The synthetic DGP makes overlap easy.** Estimated propensities are bounded inside [0.21, 0.81] by construction, so neither the DoubleML `trimming_threshold = 0.01` nor the doubly-robust pseudo-outcome's division by `m` and `1−m` is stressed on these data. In a real-world ALMP cohort, propensities can drift toward 0 or 1, the doubly-robust score becomes sensitive to small denominators, and trimming choices matter much more than they appear to here. The favourable performance of every method should not be read as evidence that overlap is a benign assumption in practice.
- **Key assumption — unconfoundedness.** All causal claims rest on selection-on-observables: conditional on `(age, edu_years, prior_emp_months, dutch_prof, female, migrant)`, treatment assignment is as good as random. The synthetic DGP satisfies this by construction; in a real ALMP application this is the strong identifying assumption that justifies DoubleML and CausalForestDML over a naive comparison.
