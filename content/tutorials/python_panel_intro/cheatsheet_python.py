"""
Panel data methods in Python: a one-page cheat sheet.

Companion to https://carlos-mendez.org/tutorials/python_panel_intro/
Companions:  cheatsheet_R.R   cheatsheet_stata.do   script.py (the post's script)

Every snippet runs against the two-wave wage panel that ships with the post
(data/data_panel.csv: 2,199 workers x 2010, 2012), so the numbers printed here
are the post's numbers, and the comparison table at the end is the same table
the R and Stata cheat sheets print.

Install:
    pip install numpy pandas statsmodels scipy matplotlib pyfixest linearmodels

Usage:     python cheatsheet_python.py
           SHOW_PLOTS=1 python cheatsheet_python.py    # also open the figure
Run time:  about 35 seconds (mostly the 2,199-dummy regression and the
           five-wave fits). The one figure goes to the system temp folder;
           nothing is written next to this file.
Verified with: Python 3.13 / R 4.5 / Stata 19
               (numpy 2.3, pandas 3.0, statsmodels 0.14, pyfixest 0.50,
                linearmodels 7.0)

Contents
    0.  Vocabulary in thirty seconds
    1.  Load the data (local copy, then URL)
    2.  Panel structure: who switches?
    3.  Between vs within variance
    4.  Pooled OLS and the between estimator
    5.  First differences
    6.  Fixed effects three ways (and the df trap)
    7.  Two-way FE and the T = 2 identities
    8.  Random effects is OLS on quasi-demeaned data
    9.  The Hausman test: two versions, two verdicts
    10. Correlated random effects (Mundlak)
    11. Adding controls
    12. The within picture
    13. The window matters: all five waves
    14. Traps that silently give wrong answers
    Comparison table (identical in all three cheat sheets)
"""

import os
import tempfile
import warnings
from pathlib import Path

import matplotlib

if os.environ.get("SHOW_PLOTS") != "1":
    matplotlib.use("Agg")                      # no window, no blocking

import matplotlib.pyplot as plt                # noqa: E402
import numpy as np                             # noqa: E402
import pandas as pd                            # noqa: E402
import pyfixest as pf                          # noqa: E402
import statsmodels.api as sm                   # noqa: E402
import statsmodels.formula.api as smf          # noqa: E402
from linearmodels.panel import RandomEffects   # noqa: E402
from scipy.stats import chi2                   # noqa: E402

warnings.filterwarnings("ignore")              # pyfixest's "dropped" notes


# ── 0. Vocabulary in thirty seconds ──────────────────────────────────────────
#
#   Panel ............... the same units observed repeatedly. Here 2,199
#                         workers x 2 waves (2010, 2012) = 4,398 worker-years.
#   alpha_i ............. the worker effect: everything about worker i that
#                         does not change over the sample (ability, schooling,
#                         gender, family background).
#   Between / within .... variation across workers' means vs variation around
#                         a worker's own mean. FE, FD, TWFE and CRE use ONLY
#                         the within part.
#   Within transform .... x_it - mean_i(x). Kills alpha_i. Identical to adding
#                         one dummy per worker (FWL with N dummies).
#   First difference .... x_it - x_i,t-1. Also kills alpha_i. With T = 2 it
#                         carries exactly the same information as demeaning.
#   Switchers ........... workers whose union status changes. The ONLY workers
#                         that identify the within estimators: 73 of 2,199.
#   Random effects ...... GLS that assumes alpha_i is uncorrelated with x. It is
#                         OLS on quasi-demeaned data z_it - theta * mean_i(z):
#                         theta = 0 is pooled OLS, theta = 1 is FE.
#   Mundlak / CRE ....... RE plus mean_i(x) as an extra regressor. Its x
#                         coefficient is exactly FE; its mean_i(x) coefficient
#                         tests the RE assumption.
#   Hausman ............. (b_FE - b_RE)^2 / (V_FE - V_RE) ~ chi2(1). Valid only
#                         with classical variances (RE efficient under H0).


# ── 1. Load the data (local copy, then URL) ──────────────────────────────────
# NLSY-style wage panel, restricted to 2010 and 2012 (T = 2, balanced).
# lwage = log hourly wage; union = 1 if union member; female = 1 if female.

URL = ("https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/"
       "content/tutorials/python_panel_intro/data/")


def load_csv(name):
    # The post folder keeps the CSVs in data/ (and a copy next to script.py).
    for path in (name, f"data/{name}"):
        if Path(path).exists():
            return pd.read_csv(path), path
    return pd.read_csv(URL + name), URL + name


df, SOURCE = load_csv("data_panel.csv")
df = df.sort_values(["ID", "year"]).reset_index(drop=True)   # ALWAYS sort first
print("Loaded:", SOURCE, df.shape)
assert len(df) == 4398 and df[["lwage", "union", "age", "schooling"]].notna().all().all()


# ── 2. Panel structure: who switches? ────────────────────────────────────────

N, T = df["ID"].nunique(), df["year"].nunique()
balanced = (df.groupby("ID").size() == T).all()
print(f"\nN = {N}, T = {T}, N x T = {len(df)}, balanced = {balanced}")   # 2199, 2

wide = df.pivot(index="ID", columns="year", values="union")
pattern = np.select([(wide[2010] == 0) & (wide[2012] == 0),
                     (wide[2010] == 1) & (wide[2012] == 1),
                     (wide[2010] == 0) & (wide[2012] == 1)],
                    ["never", "always", "joiner"], default="leaver")
counts = pd.Series(pattern).value_counts().reindex(["never", "always", "joiner", "leaver"])
print(counts.to_dict())                        # 1805 / 321 / 36 / 37
n_switch = counts["joiner"] + counts["leaver"]
print(f"Switchers: {n_switch} ({100 * n_switch / N:.1f}% of workers)")   # 73, 3.3%


# ── 3. Between vs within variance ────────────────────────────────────────────
# between = Var(mean_i(x)); within = Var(x_it - mean_i(x)). Share = variance
# ratio, NOT a ratio of standard deviations.

def decompose(data, v):
    between = data.groupby("ID")[v].mean().var()
    within = (data[v] - data.groupby("ID")[v].transform("mean")).var()
    return between, within


print()
for v in ["lwage", "union", "age", "schooling"]:
    b, w = decompose(df, v)
    print(f"  {v:<10} between SD {b ** .5:.4f}  within SD {w ** .5:.4f}"
          f"  within share {100 * w / (b + w):5.1f}%")
# union: 0.3576 / 0.0911 / 6.1%. schooling: 0.0% -> FE cannot estimate it.


# ── 4. Pooled OLS and the between estimator ──────────────────────────────────

pols = pf.feols("lwage ~ union", data=df, vcov="HC1")
means = df.groupby("ID")[["lwage", "union"]].mean().reset_index()   # one row per worker
betw = pf.feols("lwage ~ union", data=means, vcov="HC1")
print(f"\nPOLS     {pols.coef()['union']:.4f}  SE {pols.se()['union']:.4f}")   # 0.0750, 0.0231
print(f"Between  {betw.coef()['union']:.4f}  SE {betw.se()['union']:.4f}")   # 0.0662, 0.0311
# Both compare DIFFERENT workers, so both inherit any selection on alpha_i.


# ── 5. First differences ─────────────────────────────────────────────────────
# Difference WITHIN each worker: groupby first, after sorting by year.

d = df.groupby("ID")[["lwage", "union"]].diff().dropna()
d.columns = ["d_lwage", "d_union"]
fd = pf.feols("d_lwage ~ d_union", data=d, vcov="HC1")
fd0 = pf.feols("d_lwage ~ d_union - 1", data=d, vcov="HC1")         # no intercept
print(f"\nFD       {fd.coef()['d_union']:.4f}  SE {fd.se()['d_union']:.4f}"
      f"  intercept {fd.coef()['Intercept']:.4f}")          # 0.2113, 0.0792, 0.0727
print(f"FD, no intercept {fd0.coef()['d_union']:.4f}")       # 0.2103
print(f"Rows: {len(d)}; nonzero d_union: {(d['d_union'] != 0).sum()}")   # 2199; 73
# The intercept is the common 2010 -> 2012 wage growth (7.3 log points).


# ── 6. Fixed effects three ways (and the df trap) ────────────────────────────

# (a) Absorbed: the way to do it.
fe = pf.feols("lwage ~ union | ID", data=df, vcov="HC1")
fe_iid = pf.feols("lwage ~ union | ID", data=df, vcov="iid")
b_fe = fe.coef()["union"]
print(f"\nFE       {b_fe:.4f}  SE {fe.se()['union']:.4f} (HC1)"
      f"  {fe_iid.se()['union']:.4f} (iid)")                # 0.2103, 0.0812, 0.0509

# (b) Demeaned by hand: same coefficient, WRONG standard error. OLS on the
#     demeaned data does not know that 2,199 worker means were estimated, so
#     it divides by NT - 1 = 4397 instead of NT - N - 1 = 2198.
df["lwage_w"] = df["lwage"] - df.groupby("ID")["lwage"].transform("mean")
df["union_w"] = df["union"] - df.groupby("ID")["union"].transform("mean")
hand = smf.ols("lwage_w ~ union_w - 1", data=df).fit()
fix = np.sqrt((len(df) - 1) / (len(df) - N - 1))           # sqrt(4397/2198) = 1.414
assert abs(hand.params["union_w"] - b_fe) < 1e-12
assert abs(hand.bse["union_w"] * fix - fe_iid.se()["union"]) < 1e-12
print(f"By hand  {hand.params['union_w']:.4f}  SE {hand.bse['union_w']:.4f}"
      f"  x {fix:.3f} = {hand.bse['union_w'] * fix:.4f}")   # 0.0360 x 1.414 = 0.0509

# (c) One dummy per worker (2,199 columns): same coefficient, same SE.
dummies = pf.feols("lwage ~ union + C(ID)", data=df, vcov="iid")
assert abs(dummies.coef()["union"] - b_fe) < 1e-10
assert abs(dummies.se()["union"] - fe_iid.se()["union"]) < 1e-10
print(f"Dummies  {dummies.coef()['union']:.4f}  SE {dummies.se()['union']:.4f}")


# ── 7. Two-way FE and the T = 2 identities ───────────────────────────────────
# With T = 2:  FD without intercept == one-way FE;  FD with intercept == TWFE.
# The year effect does the job of the FD intercept (the common wage trend).

twfe = pf.feols("lwage ~ union | ID + year", data=df, vcov={"CRV1": "ID"})
assert abs(fd0.coef()["d_union"] - b_fe) < 1e-10
assert abs(fd.coef()["d_union"] - twfe.coef()["union"]) < 1e-10
print(f"\nTWFE     {twfe.coef()['union']:.4f}  SE {twfe.se()['union']:.4f}"
      " (clustered by ID)")                                 # 0.2113, 0.0792
print(f"FD0 - FE   = {fd0.coef()['d_union'] - b_fe:+.1e}")
print(f"FD - TWFE  = {fd.coef()['d_union'] - twfe.coef()['union']:+.1e}")
# With T > 2 both identities break (section 13).


# ── 8. Random effects is OLS on quasi-demeaned data ──────────────────────────
# theta = 1 - sqrt(s2_e / (s2_e + T s2_u)). Subtract theta x the worker mean
# from every column (the constant becomes 1 - theta) and run OLS.

panel = df.set_index(["ID", "year"])
re = RandomEffects(panel["lwage"], sm.add_constant(panel[["union"]])).fit(cov_type="robust")
re_iid = RandomEffects(panel["lwage"], sm.add_constant(panel[["union"]])).fit()
theta = float(re.theta.iloc[0, 0])
print(f"\nRE       {re.params['union']:.4f}  SE {re.std_errors['union']:.4f}"
      f"  theta {theta:.4f}")                               # 0.1092, 0.0299, 0.6091


def quasi_demeaned_ols(th, cov="HC1"):
    y = df["lwage"] - th * df.groupby("ID")["lwage"].transform("mean")
    X = pd.DataFrame({"const": 1 - th,
                      "union": df["union"] - th * df.groupby("ID")["union"].transform("mean")})
    return sm.OLS(y, X).fit(cov_type=cov)


by_hand = quasi_demeaned_ols(theta)
assert abs(by_hand.params["union"] - re.params["union"]) < 1e-10
assert abs(by_hand.bse["union"] - re.std_errors["union"]) < 1e-10
print(f"OLS on quasi-demeaned data, theta = {theta:.4f}: {by_hand.params['union']:.4f}"
      f"  SE {by_hand.bse['union']:.4f}")
print(f"  theta = 0 -> {quasi_demeaned_ols(0).params['union']:.4f} (POLS)"
      f"   theta = 1 -> {quasi_demeaned_ols(1, 'nonrobust').params['union']:.4f} (FE)")
# RE leans toward POLS here because only 6.1% of union's variance is within.


# ── 9. The Hausman test: two versions, two verdicts ──────────────────────────
# H0: alpha_i uncorrelated with union (RE consistent and efficient).

def hausman(b1, se1, b0, se0):
    H = (b1 - b0) ** 2 / (se1 ** 2 - se0 ** 2)
    return H, chi2.sf(H, df=1)


H_txt, p_txt = hausman(b_fe, fe_iid.se()["union"], re_iid.params["union"], re_iid.std_errors["union"])
H_post, p_post = hausman(b_fe, fe.se()["union"], re.params["union"], re.std_errors["union"])
print(f"\nHausman, textbook (classical V): H = {H_txt:.4f}  p = {p_txt:.4f}")    # 5.62, 0.018
print(f"Hausman, robust SEs plugged in (invalid): H = {H_post:.4f}  p = {p_post:.4f}")  # 1.79, 0.180
# The textbook test (Stata -hausman-, plm::phtest) REJECTS RE at 5%; it is the
# one the post reports. Plugging robust SEs into the same formula is not a
# valid Hausman test (RE is no longer the efficient estimator), even though it
# flips the verdict. With robust or clustered errors, use the Mundlak test in
# section 10 instead.


# ── 10. Correlated random effects (Mundlak) ──────────────────────────────────

df["union_bar"] = df.groupby("ID")["union"].transform("mean")
panel = df.set_index(["ID", "year"])
cre = RandomEffects(panel["lwage"],
                    sm.add_constant(panel[["union", "union_bar"]])).fit(cov_type="robust")
assert abs(cre.params["union"] - b_fe) < 1e-10              # within coef == FE, exactly
print(f"\nCRE      {cre.params['union']:.4f}  SE {cre.std_errors['union']:.4f}")   # 0.2103, 0.0703
print(f"Mundlak  {cre.params['union_bar']:+.4f}  SE {cre.std_errors['union_bar']:.4f}"
      f"  p {cre.pvalues['union_bar']:.4f}")              # -0.1441, 0.0800, 0.0717

# Pooled OLS + union_bar, clustered by worker: same coefficients, and the
# robust replacement for Hausman.
mk = pf.feols("lwage ~ union + union_bar", data=df, vcov={"CRV1": "ID"})
assert abs(mk.coef()["union"] - b_fe) < 1e-10
print(f"Pooled Mundlak, clustered: union_bar {mk.coef()['union_bar']:+.4f}"
      f"  SE {mk.se()['union_bar']:.4f}  p {mk.pvalue()['union_bar']:.4f}")   # 0.0891, 0.1059
# gamma < 0: workers with more union exposure earn less than their within
# premium implies, consistent with negative selection. Borderline, not decisive.


# ── 11. Adding controls ──────────────────────────────────────────────────────
# schooling and female never change within a worker -> absorbed by the FE.
# Every model gets year effects; for RE and CRE that is a 2012 dummy (its
# worker mean is 0.5 for everyone, so it needs no Mundlak term).

df["age_bar"] = df.groupby("ID")["age"].transform("mean")
df["y2012"] = (df["year"] == 2012).astype(float)
panel = df.set_index(["ID", "year"])
pols_x = pf.feols("lwage ~ union + age + schooling + female + C(year)", data=df, vcov="HC1")
twfe_x = pf.feols("lwage ~ union + age | ID + year", data=df, vcov={"CRV1": "ID"})
re_x = RandomEffects(panel["lwage"], sm.add_constant(
    panel[["union", "age", "schooling", "female", "y2012"]])).fit(cov_type="robust")
cre_x = RandomEffects(panel["lwage"], sm.add_constant(
    panel[["union", "union_bar", "age", "age_bar", "schooling", "female", "y2012"]])
    ).fit(cov_type="robust")

print(f"\n{'':<8}{'POLS':>9}{'TWFE':>9}{'RE':>9}{'CRE':>9}")
for v in ["union", "age"]:
    print(f"{v:<8}{pols_x.coef()[v]:>9.4f}{twfe_x.coef()[v]:>9.4f}"
          f"{re_x.params[v]:>9.4f}{cre_x.params[v]:>9.4f}")
# union 0.0571 / 0.2129 / 0.0875 / 0.2129;  age 0.0209 / -0.0576 / 0.0205 / -0.0576
# CRE with year effects reproduces TWFE exactly. Drop y2012 and CRE becomes
# one-way FE instead (union 0.2103, age +0.0332: age soaks up the wage trend).
assert abs(cre_x.params["union"] - twfe_x.coef()["union"]) < 1e-8

# Why is age NEGATIVE under TWFE? Most workers age exactly 2 years between
# waves, which the year effect absorbs. Only the irregular spacings are left.
age_step = df.groupby("ID")["age"].diff().dropna().astype(int).value_counts().sort_index()
print("Age change between waves:", age_step.to_dict())      # {1: 164, 2: 1885, 3: 150}


# ── 12. The within picture ───────────────────────────────────────────────────
# Left: raw data, POLS slope. Right: demeaned data, FE slope. Same 4,398 rows;
# only the 146 switcher rows move off zero on the right.

rng = np.random.default_rng(42)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.5))
ax1.scatter(df["union"] + rng.normal(0, .025, len(df)), df["lwage"], s=6, alpha=.3,
            color="#6a9bcc")
ax1.plot([0, 1], np.polyval(np.polyfit(df["union"], df["lwage"], 1), [0, 1]),
         color="#d97757", lw=2.5)
ax1.set(xlabel="union (jittered)", ylabel="log wage",
        title=f"Raw: POLS slope {pols.coef()['union']:.3f}")
ax2.scatter(df["union_w"] + rng.normal(0, .005, len(df)), df["lwage_w"], s=6, alpha=.3,
            color="#6a9bcc")
ax2.plot([-.5, .5], [-.5 * b_fe, .5 * b_fe], color="#d97757", lw=2.5)
ax2.set(xlabel="union - worker mean", ylabel="log wage - worker mean",
        title=f"Demeaned: FE slope {b_fe:.3f}")
fig.tight_layout()
png = Path(tempfile.gettempdir()) / "panel_within_picture.png"
fig.savefig(png, dpi=120)
print(f"\nFigure saved to {png}")
if os.environ.get("SHOW_PLOTS") == "1":
    plt.show()
plt.close(fig)


# ── 13. The window matters: all five waves ───────────────────────────────────
# 2010-2018, T = 5. FD and FE no longer coincide, and the premium collapses.

df5, _ = load_csv("raw_data.csv")
df5 = df5.dropna(subset=["lwage", "union"]).sort_values(["ID", "year"]).reset_index(drop=True)
assert (df5.groupby("ID")["year"].diff().dropna() == 2).all()     # no gaps
d5 = df5.groupby("ID")[["lwage", "union"]].diff()
d5.columns = ["d_lwage", "d_union"]
d5[["ID", "year"]] = df5[["ID", "year"]]
d5 = d5.dropna()

fe5 = pf.feols("lwage ~ union | ID + year", data=df5, vcov={"CRV1": "ID"})
fd5 = pf.feols("d_lwage ~ d_union | year", data=d5, vcov={"CRV1": "ID"})
b5, w5 = decompose(df5, "union")
print(f"\nFive waves: {len(df5)} rows, {df5['ID'].nunique()} workers,"
      f" within share {100 * w5 / (b5 + w5):.1f}%")          # 11045, 2209, 16.1%
print(f"TWFE      {fe5.coef()['union']:.4f}  SE {fe5.se()['union']:.4f}")       # 0.0396, 0.0255
print(f"FD + year {fd5.coef()['d_union']:.4f}  SE {fd5.se()['d_union']:.4f}")    # 0.0566, 0.0322


# ── 14. Traps that silently give wrong answers ───────────────────────────────
#
#  1. DIFFERENCING ACROSS WORKERS. df["lwage"].diff() without groupby("ID")
#     subtracts one worker from the next: 4,397 rows instead of 2,199 and a
#     slope of 0.0783 instead of 0.2113. No error. Sort by (ID, year), then
#     group by ID. Demo below.
#
#  2. DIFFERENCING ROWS, NOT PERIODS. groupby().diff() subtracts the previous
#     ROW. In a panel with a missing wave it silently spans the gap (2016 -
#     2012). Stata's D. and fixest's d() difference PERIODS and return missing
#     instead. Check the time step, as section 13 does.
#
#  3. DEMEANING BY HAND UNDERSTATES THE SE. Section 6: iid SE 0.0360 instead
#     of 0.0509, because the 2,199 worker means are not counted as estimated
#     parameters. Multiply by sqrt((NT-1)/(NT-N-1)) or let pyfixest absorb.
#
#  4. TIME-INVARIANT REGRESSORS DISAPPEAR. In "lwage ~ union + schooling +
#     female | ID" pyfixest drops schooling and female with a warning, which
#     this file silences. FE cannot estimate them; CRE can (section 11).
#
#  5. "ROBUST" MEANS DIFFERENT THINGS. linearmodels cov_type="robust" is White
#     on the quasi-demeaned data (RE SE 0.0299); Stata's xtreg ..., vce(robust)
#     clusters by panel (0.0314). Name the variance you want.
#
#  6. DEFAULT SEs CHANGE BETWEEN VERSIONS. pyfixest 0.50 and fixest 0.14
#     default to iid (0.0509) for "lwage ~ union | ID"; older versions
#     clustered by the first fixed effect (0.0812). Always pass vcov=.
#
#  7. WHICH HAUSMAN? The textbook test gives H = 5.62, p = 0.018 (reject RE).
#     Robust SEs plugged into the same formula give H = 1.79, p = 0.180, but
#     that is not a valid test. With robust errors, report the clustered
#     Mundlak test (p = 0.106) and say which one you ran.
#
#  8. NOT REJECTING IS NOT ACCEPTING. With 6.1% of union's variance within
#     workers, V_FE is large and any FE-vs-RE test has little power. RE's
#     smaller SE is worth nothing if its assumption fails.
#
#  9. FE IS AN AVERAGE OVER SWITCHERS. 73 workers identify 0.21; joiners alone
#     give 0.345 and leavers 0.081 (post Exercise 5). It is not the premium
#     of the 2,126 workers who never switch.
#
# 10. A REGRESSOR NEARLY COLLINEAR WITH THE FEs IS IDENTIFIED BY NOISE. TWFE's
#     age coefficient (-0.0576) rests on the 314 workers whose interviews were
#     not exactly two years apart. Do not read it as an age profile.
#
# 11. RE IS NOT ONE ESTIMATOR. The variance components set theta, and tools
#     differ slightly: with controls, linearmodels gets theta 0.5528 and
#     Stata/plm 0.5529 (union 0.0875 in all three at four decimals; without
#     the year dummy the gap shows up as 0.0861 vs 0.0862). plm's Amemiya or
#     Nerlove methods move union to 0.116 or 0.146.
#
# 12. FE REMOVES ONLY TIME-CONSTANT CONFOUNDING, IN THIS WINDOW. All five
#     waves: TWFE 0.0396, FD 0.0566. The 0.21 is a 2010-2012 number.
#
# 13. STATA FLOAT IMPORT. import delimited without asdouble stores lwage as
#     float; the POLS slope moves by 2e-9. Invisible at 4 decimals, fatal
#     to exact cross-language checks.

bad = df[["lwage", "union"]].diff().dropna()                  # no groupby!
bad_fit = pf.feols("lwage ~ union", data=bad, vcov="HC1")
print(f"\nTrap 1: ungrouped diff -> {len(bad)} rows, slope {bad_fit.coef()['union']:.4f}")
print("Trap 4:", list(pf.feols("lwage ~ union + schooling + female | ID",
                                data=df, vcov="HC1").coef().index), "survive")


# ── Comparison table (identical in all three cheat sheets) ───────────────────
# The R and Stata columns are what cheatsheet_R.R and cheatsheet_stata.do
# print. They equal the Python column to every printed digit because all three
# read the same CSV (trap 11 explains the fifth-decimal RE differences). This
# file checks its own column against the reference.

REFERENCE = [  # row, Python, R, Stata: (coef, SE); Hausman rows: (H, p)
    ("Pooled OLS",            (0.0750, 0.0231), None, None),
    ("Between",               (0.0662, 0.0311), None, None),
    ("First differences",     (0.2113, 0.0792), None, None),
    ("FE (within)",           (0.2103, 0.0812), None, None),
    ("Two-way FE",            (0.2113, 0.0792), None, None),
    ("Random effects",        (0.1092, 0.0299), None, None),
    ("CRE: union",            (0.2103, 0.0703), None, None),
    ("CRE: union_bar",        (-0.1441, 0.0800), None, None),
    ("RE + controls",         (0.0875, 0.0258), None, None),
    ("TWFE + age",            (0.2129, 0.0793), None, None),
    ("Five waves: TWFE",      (0.0396, 0.0255), None, None),
    ("Five waves: FD + year", (0.0566, 0.0322), None, None),
    ("Hausman textbook H (p)", (5.6209, 0.0177), None, None),
    ("Hausman plug-in H (p)", (1.7941, 0.1804), None, None),
]
LIVE = [(pols.coef()["union"], pols.se()["union"]),
        (betw.coef()["union"], betw.se()["union"]),
        (fd.coef()["d_union"], fd.se()["d_union"]),
        (fe.coef()["union"], fe.se()["union"]),
        (twfe.coef()["union"], twfe.se()["union"]),
        (re.params["union"], re.std_errors["union"]),
        (cre.params["union"], cre.std_errors["union"]),
        (cre.params["union_bar"], cre.std_errors["union_bar"]),
        (re_x.params["union"], re_x.std_errors["union"]),
        (twfe_x.coef()["union"], twfe_x.se()["union"]),
        (fe5.coef()["union"], fe5.se()["union"]),
        (fd5.coef()["d_union"], fd5.se()["d_union"]),
        (H_txt, p_txt),
        (H_post, p_post)]


def cell(b, se):
    return f"{b:7.4f} ({se:6.4f})"


print("\nUnion coefficient (SE): 2,199 workers, one CSV, three languages")
print("-" * 78)
print(f"{'Row':<24}{'Python':<18}{'R':<18}Stata")
print("-" * 78)
for (label, py, r, st), (b, se) in zip(REFERENCE, LIVE):
    r, st = r or py, st or py
    assert cell(b, se) == cell(*py), label
    print(f"{label:<24}{cell(b, se):<18}{cell(*r):<18}{cell(*st)}")
print("-" * 78)
print("SEs: HC1 for POLS, between, FD, FE; clustered by worker for TWFE and five")
print("waves; White on quasi-demeaned data for RE and CRE. Within rows ~0.21,")
print("cross-sectional rows 0.07-0.11; with five waves the 0.21 disappears.")
print("Hausman plug-in = robust SEs in the textbook formula: NOT a valid test.")
