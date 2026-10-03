"""
Difference-in-Differences (DiD) in Python: a one-page cheat sheet.

Companion to https://carlos-mendez.org/post/python_did101/
Companions:  cheatsheet_R.R   cheatsheet_stata.do   script.py (the post's script)

Every snippet runs against the two CSVs that ship with the post (data/), so the
numbers printed here are the post's numbers, and the comparison table at the
end is the same table the R and Stata cheat sheets print.

Install:
    pip install pyfixest==0.50.1 pandas numpy matplotlib

Usage:     python cheatsheet_python.py
           SHOW_PLOTS=1 python cheatsheet_python.py    # also open the figure
Run time:  about 20 seconds (mostly importing pyfixest and the 35 jackknife
           fits). The one figure goes to the system temp folder; nothing is
           written next to this file.
Verified with: Python 3.11 / R 4.5 / Stata 19
               (pyfixest 0.50.1, pandas 2.2, numpy 1.26; fixest 0.14)

Contents
    0.  Vocabulary in thirty seconds
    1.  Load the data (local copy, then URL)
    2.  The naive before-after comparison
    3.  The 2x2 DiD by hand
    4.  DiD as a regression: every coefficient is a group mean
    5.  Two-way fixed effects
    6.  Adding a covariate
    7.  Four standard errors (and what CRV3 really computes)
    8.  Regression tables (text and LaTeX)
    9.  The event study
    10. The event-study plot
    11. Traps that silently give wrong answers
    Comparison table (identical in all three cheat sheets)
"""

import os
import tempfile
from pathlib import Path

import matplotlib

if os.environ.get("SHOW_PLOTS") != "1":
    matplotlib.use("Agg")                      # no window, no blocking

import matplotlib.pyplot as plt                # noqa: E402
import numpy as np                             # noqa: E402
import pandas as pd                            # noqa: E402
import pyfixest as pf                          # noqa: E402


# ── 0. Vocabulary in thirty seconds ──────────────────────────────────────────
#
#   DiD ................. (treated after - treated before)
#                         - (comparison after - comparison before). The second
#                         difference removes the trend both groups share.
#   ATT ................. average treatment effect on the TREATED schools. DiD
#                         identifies the ATT, not the ATE.
#   Parallel trends ..... without the program, treated schools would have moved
#                         like the comparison schools. Levels may differ; trends
#                         may not. It is an assumption about an unobserved
#                         counterfactual, so no test can prove it.
#   Counterfactual ...... treated pre-period mean + comparison group's change.
#   TWFE ................ y ~ D | unit + period: unit and period fixed effects
#                         absorb `treated` and `post`, leaving the interaction.
#   Event study ......... one coefficient per period relative to adoption,
#                         measured against a reference period (here t = -1).
#   CRV1 / CRV3 ......... cluster-robust variances (clusters = schools). CRV3
#                         is a leave-one-school-out jackknife.
#   Absorbing treatment . once a school starts the program it stays treated.


# ── 1. Load the data (local copy, then URL) ──────────────────────────────────
# Corral & Yang (2024): 35 high schools, 10 adopt an after-school tutoring
# program at the same time. gpa = average GPA of low-income students (nominally 0-100;
# the simulated event-study file reaches 107.68).
#   tutoring_did.csv       35 schools x 2 periods  (the 2x2 design)
#   tutoring_didevent.csv  35 schools x 8 periods  (the event study; adoption
#                          in period 5; timeToTreat is empty for comparison
#                          schools)

BASE = ("https://raw.githubusercontent.com/cmg777/starter-academic-v501/"
        "master/content/post/python_did101/data/")


def load_csv(name):
    # round_trip parsing: pandas' fast float parser can be off by 1e-14,
    # enough to break an exact cross-language check (R and Stata parse exactly).
    for path in (name, f"data/{name}"):
        if Path(path).exists():
            return pd.read_csv(path, float_precision="round_trip"), path
    return pd.read_csv(BASE + name, float_precision="round_trip"), BASE + name


df, src = load_csv("tutoring_did.csv")
ev, src_ev = load_csv("tutoring_didevent.csv")
print("Loaded:", src, df.shape, "|", src_ev, ev.shape)

assert df.shape == (70, 7) and ev.shape == (280, 8)
assert (df.groupby("id").size() == 2).all()                  # balanced panel
assert df.groupby("id")["treated"].nunique().eq(1).all()     # fixed groups
assert (df["txp"] == df["treated"] * df["post"]).all()
print("Treated schools:", df.loc[df.treated == 1, "id"].nunique(), "of",
      df["id"].nunique())                                    # 10 of 35


# ── 2. The naive before-after comparison ─────────────────────────────────────

m = df.groupby(["treated", "post"])["gpa"].mean()
naive = m[(1, 1)] - m[(1, 0)]
print(f"\nTreated schools: {m[(1, 0)]:.2f} -> {m[(1, 1)]:.2f}, "
      f"naive change {naive:.2f}")                 # 60.17 -> 96.37, 36.20

# The same number as a regression on the treated schools only. Its SE is SMALL:
# the naive estimate is precise, just biased. No variance estimator fixes a
# missing comparison group.
fit_naive = pf.feols("gpa ~ post", data=df[df.treated == 1], vcov="iid")
assert abs(fit_naive.coef()["post"] - naive) < 1e-10
print(f"As a regression: {fit_naive.coef()['post']:.4f} "
      f"(SE {fit_naive.se()['post']:.4f})")        # 36.2008 (0.5252)


# ── 3. The 2x2 DiD by hand ───────────────────────────────────────────────────

trend = m[(0, 1)] - m[(0, 0)]                      # comparison schools' change
counterfactual = m[(1, 0)] + trend
did = m[(1, 1)] - counterfactual
print(f"\nComparison schools: {m[(0, 0)]:.2f} -> {m[(0, 1)]:.2f}, "
      f"trend {trend:.3f}")                         # 71.22 -> 82.10, 10.886
print(f"Counterfactual {counterfactual:.2f}, DiD {did:.4f}")   # 71.05, 25.3149
print(f"Naive overstates DiD by {naive / did - 1:.0%}")         # 43%

# ROUNDING: the post's 10.88 and 25.32 are differences of means ROUNDED to two
# decimals (82.10 - 71.22, 36.20 - 10.88). Unrounded: 10.886 and 25.315.
assert round(round(m[(0, 1)], 2) - round(m[(0, 0)], 2), 2) == 10.88
assert f"{did:.3f}" == "25.315"


# ── 4. DiD as a regression: every coefficient is a group mean ────────────────

ols = pf.feols("gpa ~ treated + post + txp", data=df, vcov="HC1")
b = ols.coef()
assert abs(b["Intercept"] - m[(0, 0)]) < 1e-10               # comparison, pre
assert abs(b["treated"] - (m[(1, 0)] - m[(0, 0)])) < 1e-10   # baseline gap
assert abs(b["post"] - trend) < 1e-10                        # common trend
assert abs(b["txp"] - did) < 1e-10                           # the DiD
print(f"\nOLS: intercept {b['Intercept']:.3f}, treated {b['treated']:.3f}, "
      f"post {b['post']:.3f}, txp {b['txp']:.4f} (HC1 SE {ols.se()['txp']:.4f})")
# 71.215, -11.049, 10.886, 25.3149 (0.6150)


# ── 5. Two-way fixed effects ─────────────────────────────────────────────────
# School FE absorb `treated`, period FE absorb `post`. Balanced 2x2: the
# coefficient is IDENTICAL to the OLS interaction; only the SE changes.

twfe = pf.feols("gpa ~ txp | id + time", data=df, vcov={"CRV1": "id"})
assert abs(twfe.coef()["txp"] - did) < 1e-10
print(f"\nTWFE: {twfe.coef()['txp']:.4f} (CRV1 SE {twfe.se()['txp']:.4f}), "
      f"R2 {twfe._r2:.3f}, within R2 {twfe._r2_within:.3f}")
# 25.3149 (0.5851), 0.995, 0.981


# ── 6. Adding a covariate ────────────────────────────────────────────────────

twfe_cov = pf.feols("gpa ~ txp + female_share | id + time", data=df,
                    vcov={"CRV1": "id"})
print(f"\n+ female_share: {twfe_cov.coef()['txp']:.4f} "
      f"(SE {twfe_cov.se()['txp']:.4f}); female_share "
      f"{twfe_cov.coef()['female_share']:.3f}, "
      f"p = {twfe_cov.pvalue()['female_share']:.3f}")
# 25.3281 (0.6048); -3.216, p = 0.714. The estimate moves by 0.013.
# Stability is the reassuring part. An insignificant covariate does NOT show
# that the fixed effects "capture everything", and a covariate the program
# itself can move (a bad control) should be measured before treatment.


# ── 7. Four standard errors (and what CRV3 really computes) ──────────────────
# Same coefficient, 25.3149, four variance estimators. N = 70, G = 35 schools.

SE_REF = {"iid": 0.6071, "HC1": 0.5852, "CRV1": 0.5851, "CRV3": 0.6373}
vcovs = {"iid": "iid", "HC1": "HC1", "CRV1": {"CRV1": "id"}, "CRV3": {"CRV3": "id"}}
print()
for name, v in vcovs.items():
    se = pf.feols("gpa ~ txp | id + time", data=df, vcov=v).se()["txp"]
    assert f"{se:.4f}" == f"{SE_REF[name]:.4f}", name    # same in R and Stata
    print(f"  {name:<5} SE {se:.4f}   t {did / se:.2f}")

# CRV3 by hand: drop one school, re-estimate, repeat 35 times. PyFixest centres
# the 35 estimates on the FULL-sample estimate and multiplies by the same
# small-sample factor as CRV1:  G/(G-1) x (N-1)/(N-K) = 35/34 x 69/67,
# K = 3 (txp, one period dummy, the constant; school FE are nested in the
# clusters and not counted). Stata's built-in jackknife centres on the MEAN of
# the 35 estimates and uses (G-1)/G instead, which gives 0.6101 (trap 6).
G, N, K = df["id"].nunique(), len(df), 3
b_drop = np.array([
    pf.feols("gpa ~ txp | id + time", data=df[df.id != g], vcov="iid").coef()["txp"]
    for g in sorted(df["id"].unique())])
ssc = G / (G - 1) * (N - 1) / (N - K)
se_crv3 = np.sqrt(ssc * np.sum((b_drop - did) ** 2))
assert abs(se_crv3 - pf.feols("gpa ~ txp | id + time", data=df,
                              vcov={"CRV3": "id"}).se()["txp"]) < 1e-10
se_stata_jk = np.sqrt((G - 1) / G * np.sum((b_drop - b_drop.mean()) ** 2))
print(f"  CRV3 by hand {se_crv3:.4f}  (Stata's vce(jackknife) definition: "
      f"{se_stata_jk:.4f})")                        # 0.6373 (0.6101)

# What matters for inference is the 10 TREATED schools, not the 35 clusters:
# with few treated clusters CRV1 understates uncertainty. Prefer CRV3 or the
# wild cluster bootstrap (fit.wildboottest(), needs `pip install wildboottest`).


# ── 8. Regression tables (text and LaTeX) ────────────────────────────────────
# etable() returns a Great Tables object by default (renders in notebooks).
# type="df" prints in a terminal; type="tex" writes LaTeX. The "*" in coef_fmt
# turns significance stars on (pyfixest 0.50 no longer adds them by default).

models = [ols, twfe, twfe_cov]
tab = pf.etable(models, type="df", coef_fmt="b* \n (se)")
print("\n" + tab.replace(r"\s*\n\s*", " ", regex=True).to_string())
tex = pf.etable(models, type="tex", coef_fmt="b* \n (se)",
                labels={"txp": "Treatment $\\times$ Post"})
print(f"LaTeX table: {len(tex.splitlines())} lines "
      "(needs booktabs, makecell, tabularx, threeparttable)")


# ── 9. The event study ───────────────────────────────────────────────────────
# One dummy per event time, t = -1 omitted. Comparison schools have no event
# time: give them a placeholder (-99) so they STAY in the sample; their dummy is
# collinear with the school FE and is dropped (pyfixest prints a warning).

ev["timeToTreat"] = ev["timeToTreat"].fillna(-99)
es = pf.feols("gpa ~ i(timeToTreat, ref=-1) | id + time", data=ev,
              vcov={"CRV1": "id"})
# pyfixest 0.50 names coefficients "timeToTreat::-4.0"; older releases used
# "C(timeToTreat, contr.treatment(base=-1))[T.-4.0]". Parse the number, not
# the name.
tidy = es.tidy()
tidy.index = [float(str(i).split("::")[-1].split("T.")[-1].rstrip("]"))
              for i in tidy.index]
tidy = tidy.drop(index=[t for t in tidy.index if t < -90], errors="ignore")
EVENT_TIMES = [-4.0, -3.0, -2.0, 0.0, 1.0, 2.0, 3.0]
assert list(tidy.index) == EVENT_TIMES
print("\nEvent study (CRV1 by school), N =", es._N)
for t, r in tidy.iterrows():
    print(f"  t = {int(t):>2}  {r['Estimate']:7.3f}  "
          f"[{r['2.5%']:6.2f}, {r['97.5%']:6.2f}]  p = {r['Pr(>|t|)']:.3f}")
# Leads 0.342, -0.322, 0.593 (all p > 0.17): CONSISTENT with parallel trends,
# not proof of it. Lags 25.03, 24.71, 24.77, 25.70: roughly flat, no fade-out.

# Averaging the post lags and the pre leads (reference = 0) gives the DiD of
# the collapsed 8-period panel, 24.897 - a different dataset from the 2x2.
lead_avg = np.mean([*tidy.loc[[-4.0, -3.0, -2.0], "Estimate"], 0.0])
lag_avg = tidy.loc[[0.0, 1.0, 2.0, 3.0], "Estimate"].mean()
print(f"  mean(lags) - mean(leads incl. ref) = {lag_avg - lead_avg:.3f}")


# ── 10. The event-study plot ─────────────────────────────────────────────────

times = [-4, -3, -2, -1, 0, 1, 2, 3]
est = [*tidy.loc[[-4.0, -3.0, -2.0], "Estimate"], 0.0, *tidy.loc[[0.0, 1.0, 2.0, 3.0], "Estimate"]]
lo = [*tidy.loc[[-4.0, -3.0, -2.0], "2.5%"], 0.0, *tidy.loc[[0.0, 1.0, 2.0, 3.0], "2.5%"]]
hi = [*tidy.loc[[-4.0, -3.0, -2.0], "97.5%"], 0.0, *tidy.loc[[0.0, 1.0, 2.0, 3.0], "97.5%"]]

fig, ax = plt.subplots(figsize=(7, 4.5))
ax.axhline(0, color="#141413", lw=0.8)
ax.axvline(-0.5, color="#d97757", ls="--", lw=1.2, label="Program starts")
ax.errorbar(times, est, yerr=[np.subtract(est, lo), np.subtract(hi, est)],
            fmt="o", color="#6a9bcc", ecolor="#6a9bcc", capsize=4,
            label="Estimate and 95% CI (CRV1)")
ax.set(xlabel="Periods relative to adoption (t = -1 is the reference)",
       ylabel="Effect on GPA (points)", title="Event study: tutoring and GPA")
ax.legend(loc="upper left")
fig.tight_layout()
png = Path(tempfile.gettempdir()) / "did101_event_study_cheatsheet.png"
fig.savefig(png, dpi=120)
print(f"\nFigure saved to {png}")
if os.environ.get("SHOW_PLOTS") == "1":
    plt.show()
plt.close(fig)


# ── 11. Traps that silently give wrong answers ───────────────────────────────
#
#  1. LEAVING THE COMPARISON SCHOOLS' EVENT TIME MISSING. NaN rows are dropped,
#     so the "event study" runs on the 10 treated schools alone; with one
#     adoption date, event time IS calendar time and the dummies are collinear
#     with the period FE (pyfixest stops with an error). Fill with a placeholder
#     or interact with the treated indicator. Demo below.
#
#  2. "INSIGNIFICANT LEADS PROVE PARALLEL TRENDS." They are consistent with it.
#     With 10 treated schools a one-point pre-trend would still sit inside the
#     t = -2 interval [-0.27, 1.45] (Roth 2022, "Pretest with caution").
#
#  3. MISREADING THE REFERENCE PERIOD. Every event-study coefficient is a gap
#     RELATIVE TO t = -1. "Immediate effect" means "at t = 0 relative to t = -1".
#
#  4. HC1 IN A PANEL. vcov="HC1" treats a school's two observations as
#     independent. Cluster by school (CRV1/CRV3). Stata's xtreg, fe vce(robust)
#     silently CLUSTERS; regress ..., vce(robust) does not.
#
#  5. FEW TREATED CLUSTERS. 35 clusters looks comfortable, but only 10 are
#     treated. CRV1 can understate uncertainty; use CRV3 or the wild bootstrap.
#
#  6. "CRV3" IS NOT ONE NUMBER ACROSS PACKAGES. pyfixest: jackknife centred on
#     the full-sample estimate x the CRV1 factor (0.6373). Stata's
#     vce(jackknife): centred on the replicate mean x (G-1)/G (0.6101).
#     Section 7 reproduces both.
#
#  7. PYFIXEST VERSION DRIFT. 0.50 rejects csw0(x) with one argument (use
#     csw(txp, female_share)), renames event-study coefficients
#     (timeToTreat::-4.0) and drops etable stars unless coef_fmt has "*".
#     Pin the version and parse coefficient names defensively (section 9).
#
#  8. ROUNDED MEANS. 36.20 - 10.88 = 25.32 uses means rounded to 2 decimals;
#     the regression says 25.315. Round at the end, not in the middle.
#
#  9. STAGGERED ADOPTION. Here every school adopts in period 5, so TWFE is fine.
#     With staggered adoption AND effects that vary across cohorts or time,
#     TWFE compares late adopters with already-treated schools and can be badly
#     biased (Goodman-Bacon 2021); use Callaway-Sant'Anna, Sun-Abraham, did2s.
#
# 10. STATA FLOAT IMPORT AND FACTOR LEVELS. import delimited without asdouble
#     stores gpa as float (7th-decimal drift); Stata factor variables cannot be
#     negative, so i.timeToTreat fails: build the event dummies by hand.

try:
    pf.feols("gpa ~ i(timeToTreat, ref=-1) | id + time",
             data=ev.assign(timeToTreat=ev["timeToTreat"].replace(-99, np.nan)),
             vcov={"CRV1": "id"})
except ValueError as err:
    print("\nTrap 1:", str(err).strip().splitlines()[0])   # all collinear


# ── Comparison table (identical in all three cheat sheets) ───────────────────
# The R and Stata columns are what cheatsheet_R.R and cheatsheet_stata.do
# print. They equal the Python column to every printed digit because all three
# read the same CSVs; this file checks its own column against them.

REFERENCE = [  # row, coefficient, SE (None = no SE)
    ("Naive before-after", 36.2008, 0.5252),
    ("Manual 2x2 DiD", 25.3149, None),
    ("OLS interaction, HC1", 25.3149, 0.6150),
    ("TWFE, CRV1", 25.3149, 0.5851),
    ("TWFE + female_share", 25.3281, 0.6048),
    ("Event study t = -4", 0.3420, 0.4013),
    ("Event study t = -3", -0.3220, 0.4413),
    ("Event study t = -2", 0.5933, 0.4235),
    ("Event study t =  0", 25.0276, 0.4451),
    ("Event study t =  1", 24.7052, 0.5593),
    ("Event study t =  2", 24.7685, 0.7386),
    ("Event study t =  3", 25.7015, 0.7965),
]
LIVE = [(fit_naive.coef()["post"], fit_naive.se()["post"]),
        (did, None),
        (ols.coef()["txp"], ols.se()["txp"]),
        (twfe.coef()["txp"], twfe.se()["txp"]),
        (twfe_cov.coef()["txp"], twfe_cov.se()["txp"])]
LIVE += [(tidy.loc[t, "Estimate"], tidy.loc[t, "Std. Error"]) for t in EVENT_TIMES]


def cell(b, se):
    return f"{b:8.4f} ({se:6.4f})" if se is not None else f"{b:8.4f} (   -  )"


print("\nDiD estimate (SE): 35 schools, one pair of CSVs, three languages")
print("-" * 78)
print(f"{'Row':<24}{'Python':<18}{'R':<18}Stata")
print("-" * 78)
for (label, b_ref, se_ref), (b, se) in zip(REFERENCE, LIVE):
    assert cell(b, se) == cell(b_ref, se_ref), label
    print(f"{label:<24}{cell(b, se):<18}{cell(b_ref, se_ref):<18}"
          f"{cell(b_ref, se_ref)}")
print("-" * 78)
print("Naive: treated schools only, iid SE. 2x2 rows: N = 70. Event study:")
print("N = 280, t = -1 omitted, CRV1 by school. Section 7 adds iid/HC1/CRV3.")
