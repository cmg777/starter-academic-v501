"""
Difference-in-differences in Python: a one-page cheat sheet.

Companion to https://carlos-mendez.org/post/python_bridge_impact/
Every snippet below is runnable against the CSVs that ship with that post.

    pip install diff-diff pyfixest

Contents
    0.  Vocabulary in thirty seconds
    1.  The 2x2 by hand
    2.  Two-way fixed effects with diff-diff
    3.  The same regression in pyfixest
    4.  Event studies
    5.  Testing parallel trends
    6.  Doubly robust weights, built from scratch
    7.  Weighted estimation
    8.  Sensitivity: HonestDiD and randomisation inference
    9.  Heterogeneity by subgroup
    10. Staggered adoption (when you need it, and when you do not)
    11. Traps that silently give wrong answers
"""

import numpy as np
import pandas as pd
import statsmodels.api as sm
import pyfixest as pf

from diff_diff import (
    DifferenceInDifferences, MultiPeriodDiD, SurveyDesign,
    CallawaySantAnna, SunAbraham, SyntheticDiD,
    check_parallel_trends, equivalence_test_trends, compute_honest_did,
    placebo_timing_test, run_all_placebo_tests, plot_event_study,
)

BASE = ("https://raw.githubusercontent.com/cmg777/starter-academic-v501/"
        "master/content/post/python_bridge_impact/data/")
df = pd.read_csv(BASE + "bridge_nightlights.csv")


# ── 0. Vocabulary in thirty seconds ──────────────────────────────────────────
#
#   ATT ................ effect on the units that were actually treated.
#                        This is what almost every DiD estimates.
#   ATE ................ effect on a randomly chosen unit. Different question.
#   Parallel trends .... absent treatment, both groups would have MOVED the same
#                        amount. Says nothing about levels. Untestable in principle.
#   Event study ........ one coefficient per period. Pre-periods = test,
#                        post-periods = answer.
#   Doubly robust ...... weight AND regression-adjust. Consistent if either model
#                        is right. No protection against unmeasured confounders.
#   Never-treated ...... units that never get treated. The cleanest comparison.
#   Not-yet-treated .... units treated later. Usable, with care.


# ── 1. The 2x2 by hand ───────────────────────────────────────────────────────
# Always do this before running an estimator. If the regression disagrees wildly
# with the hand computation, one of them is wrong and you need to know which.

cell = df.groupby(["treat", "post"])["y"].mean().unstack()          # noqa: F821
att_2x2 = (cell.loc[1, 1] - cell.loc[1, 0]) - (cell.loc[0, 1] - cell.loc[0, 0])


# ── 2. Two-way fixed effects with diff-diff ──────────────────────────────────

res = DifferenceInDifferences(cluster="unit_id").fit(
    df,
    outcome="y",
    treatment="treat",        # GROUP indicator: 1 if ever treated
    time="post",              # PERIOD indicator: 1 after treatment starts
    covariates=["x1", "x2"],
    absorb=["unit_id", "year"],
    unit="unit_id",
)
print(res)                    # DiDResults(ATT=..., SE=..., p=...)
res.print_summary()           # statsmodels-style table
res.att, res.se, res.conf_int, res.n_obs, res.p_value

# absorb= vs fixed_effects=
#   absorb=        partials the FE out first; K excludes them in the dof
#                  correction. This matches Stata's `xtreg, fe`.
#   fixed_effects= builds explicit dummies and counts them in K, giving a
#                  LARGER standard error. Same coefficient, different inference.

# Inference options
DifferenceInDifferences(cluster="state", inference="wild_bootstrap", n_bootstrap=999)
DifferenceInDifferences(cluster="state", vcov_type="hc2_bm")       # few clusters
DifferenceInDifferences(conley_coords=("lat", "lon"), conley_cutoff_km=100)


# ── 3. The same regression in pyfixest ───────────────────────────────────────
# Do this routinely. A DiD estimate is a small number pulled through several
# transformations; reproducing it in software that shares none of your code is
# the cheapest bug insurance available.

fit = pf.feols("y ~ treat_post + x1 + x2 | unit_id + year",
               data=df, vcov={"CRV1": "unit_id"})
fit.coef()["treat_post"], fit.se()["treat_post"]
fit.summary()

pf.feols("y ~ treat_post | unit_id + year", data=df, weights="w")   # weighted
pf.feols("y ~ i(year, treat, ref=2) | unit_id + year", data=df)     # event study


# ── 4. Event studies ─────────────────────────────────────────────────────────
# One coefficient per period, normalised at the last pre-treatment period.

ev = MultiPeriodDiD(cluster="unit_id").fit(
    df, outcome="y", treatment="treat", time="year",
    post_periods=[3, 4, 5, 6, 7],
    covariates=["x1", "x2"],
    absorb=["unit_id"],
    reference_period=2,       # the omitted, normalised-to-zero period
    unit="unit_id",
)
ev.avg_att, ev.avg_se                       # averaged post-treatment effect
for p in sorted(ev.period_effects):
    e = ev.get_effect(p)
    print(p, round(e.effect, 4), round(e.se, 4), e.conf_int)

plot_event_study(ev, title="Event study", color="#6a9bcc", show=False)

# With exactly one pre-period and one post-period, the event-study coefficients
# ARE the short-run/long-run DiD coefficients. With more periods they are not,
# because the pooled dummies average across periods.


# ── 5. Testing parallel trends ───────────────────────────────────────────────

pt = check_parallel_trends(df, outcome="y", time="year",
                           treatment_group="treat", pre_periods=[1, 2])
pt["trend_difference"], pt["p_value"], pt["parallel_trends_plausible"]

# Better: an EQUIVALENCE test. check_parallel_trends failing to reject is weak
# evidence; equivalence testing rejects the hypothesis that the difference is
# LARGE, which is a positive finding rather than an absence of one.
eq = equivalence_test_trends(df, outcome="y", time="year",
                             treatment_group="treat", unit="unit_id",
                             pre_periods=[1, 2])
eq["tost_p_value"], eq["equivalent"]

# Placebo: move treatment into the pre-period and re-estimate.
pl = placebo_timing_test(df, outcome="y", treatment="treat", time="year",
                         fake_treatment_period=2, post_periods=[3, 4, 5],
                         cluster="unit_id")
pl.placebo_effect, pl.se, pl.p_value, pl.is_significant

run_all_placebo_tests(df, outcome="y", treatment="treat", time="year",
                      unit="unit_id", pre_periods=[1, 2], post_periods=[3, 4, 5],
                      n_permutations=500, seed=42)


# ── 6. Doubly robust weights, built from scratch ─────────────────────────────
# Worth writing by hand once. Both schemes put weight 1 on treated units, which
# is what makes them ATT rather than ATE weights.

X = sm.add_constant(df[["x1", "x2"]].astype(float))
D = df["treat"].to_numpy(float)
p = sm.Logit(D, X).fit(disp=0).predict(X)
cut = np.percentile(p, 5)                     # trim the worst-supported controls
pi, n1 = D.mean(), D.sum()

# (a) Propensity-odds weights (IPW / "LWDR")
w_ipw = np.where(D == 1, 1.0, p / (1 - p) * (1 - pi) / pi)

# (b) Kline (2011) Oaxaca-Blinder reweighting ("KOBDR"): project the treated
#     covariate mean onto the comparison design. Negative weights are outside
#     the convex hull and are dropped.
Xm, nD = X.to_numpy(float), 1.0 - D
ob = ((D @ Xm) @ np.linalg.inv(Xm.T @ (Xm * nD[:, None])) @ Xm.T / n1) * nD * n1
w_kob = np.where(D == 1, 1.0, np.where(ob < 0, np.nan, ob))

# Trimmed versions
w_ipw_trim = np.where((p < cut) & (D == 0), np.nan, w_ipw)
w_kob_trim = np.where((p < cut) & (D == 0), np.nan, w_kob)

# Always check that the weights did something: a standardised difference above
# ~0.10 is imbalanced, below is not.
def std_diff(treated, control, weights=None):
    w = np.ones(len(control)) if weights is None else weights
    cm = np.average(control, weights=w)
    return (treated.mean() - cm) / np.sqrt((treated.var() + control.var()) / 2)


# ── 7. Weighted estimation ───────────────────────────────────────────────────
# diff-diff takes external weights through SurveyDesign.
#   weight_type="aweight"  == Stata's [aw=], analytic weights
#   weight_type="pweight"  == sampling weights
#   psu=                   == the clustering unit

design = SurveyDesign(weights="w_kob", weight_type="aweight", psu="unit_id")
DifferenceInDifferences().fit(df, outcome="y", treatment="treat", time="post",
                              covariates=["x1", "x2"], absorb=["unit_id"],
                              unit="unit_id", survey_design=design)

# CAVEAT: diff-diff refuses absorb=[unit, time] together with survey weights.
# Absorb the unit and pass explicit time dummies as covariates instead.
# CAVEAT: the survey path uses a design-based (Taylor-linearised) variance, not
# the classical cluster sandwich. Point estimates match Stata; SEs may not.
# With few clusters the difference can reach 50 percent.


# ── 8. Sensitivity ───────────────────────────────────────────────────────────
# Rambachan & Roth (2023): allow the post-treatment violation of parallel trends
# to be up to M times the largest PRE-treatment violation, and report the widest
# confidence set consistent with that. The breakdown M is the honest headline.

for M in [0.0, 0.5, 1.0, 1.5, 2.0]:
    h = compute_honest_did(ev, method="relative_magnitude", M=M)
    print(M, round(h.ci_lb, 4), round(h.ci_ub, 4), h.ci_lb > 0 or h.ci_ub < 0)

compute_honest_did(ev, method="smoothness", M=0.02)   # bounds curvature instead

# Randomisation inference: reassign treatment at random, re-estimate, repeat.
# Makes no asymptotic assumptions at all.
rng = np.random.default_rng(42)
units = df.drop_duplicates("unit_id")[["unit_id", "treat"]]
null = []
for _ in range(500):
    perm = units.assign(pt=rng.permutation(units["treat"].to_numpy()))
    tmp = df.merge(perm[["unit_id", "pt"]], on="unit_id")
    tmp["tp"] = tmp["pt"] * tmp["post"]
    null.append(pf.feols("y ~ tp | unit_id + year", data=tmp).coef()["tp"])
p_ri = np.mean(np.abs(null) >= abs(res.att))


# ── 9. Heterogeneity by subgroup ─────────────────────────────────────────────
# Interact the treatment indicator with mutually exclusive subgroup dummies, and
# include the subgroup-specific post main effects.

df["band"] = pd.qcut(df["distance"], 3, labels=["near", "mid", "far"])
for b in ["near", "mid", "far"]:
    dm = (df["band"] == b).astype(float)
    df[f"post_{b}"] = df["post"] * dm
    df[f"treat_post_{b}"] = df["treat"] * df["post"] * dm

pf.feols("y ~ treat_post_near + treat_post_mid + treat_post_far"
         " + post_near + post_mid + post_far | unit_id + year",
         data=df, vcov={"CRV1": "unit_id"})

# Each coefficient is the ATT for treated units IN THAT BAND. It is not a
# subgroup ATE and it does not transport to other bands.


# ── 10. Staggered adoption ───────────────────────────────────────────────────
# NOT needed when every treated unit starts at the same date, as in the Jamuna
# case. Essential the moment treatment timing varies: plain TWFE then makes
# "forbidden comparisons" between already-treated units and gives negative
# weights to some effects.

CallawaySantAnna(control_group="never_treated", estimation_method="dr",
                 cluster="state").fit(df, outcome="y", unit="unit_id",
                                      time="year", first_treat="first_treat",
                                      aggregate="all")
SunAbraham(cluster="state").fit(df, outcome="y", unit="unit_id", time="year",
                                first_treat="first_treat")

# Diagnose whether plain TWFE was safe:
from diff_diff import bacon_decompose            # noqa: E402
bacon_decompose(df, outcome="y", unit="unit_id", time="year", treatment="d")

# No credible comparison group at all? Build one.
SyntheticDiD().fit(df, outcome="y", treatment="treat", unit="unit_id",
                   time="year", post_periods=[3, 4, 5])


# ── 11. Traps that silently give wrong answers ───────────────────────────────
#
#  1. READ THE SAMPLE SIZE FIRST. The single worst bug in the Jamuna replication
#     package dropped every comparison unit and still printed a coefficient. Its
#     only visible symptom was 124 units where there should have been 239.
#
#  2. np.log(0) is -inf; Stata's ln(0) is missing. Replicating a Stata paper
#     without .replace(0, np.nan) keeps rows Stata dropped and nothing matches.
#
#  3. A "year" column may be a period INDEX, not a calendar year. If controls
#     interact baseline traits with it, substituting real years changes
#     every coefficient.
#
#  4. absorb= and fixed_effects= give the same point estimate and different
#     standard errors. Know which convention your benchmark used.
#
#  5. Time-invariant regressors are absorbed by unit fixed effects. If you want
#     them to matter, interact them with the time trend.
#
#  6. Insignificant pre-trends are weak evidence, not strong. Low power looks
#     exactly like parallel trends. Use equivalence tests and HonestDiD.
#
#  7. Trimming and dropping negative weights CHANGE THE ESTIMAND: you are now
#     estimating the ATT on the region of common support. Report the counts.
#
#  8. Cluster at the level of treatment assignment, not the level of the
#     outcome. With fewer than ~40 clusters, use wild bootstrap or CR2-BM.
#
#  9. Average effects hide reversals. Split by time and by subgroup before
#     believing a null.
#
# 10. SUTVA is usually the weakest assumption in a spatial design. If treated
#     units pull people or activity out of comparison units, your comparison
#     group moves the wrong way and the estimates are upper bounds.
