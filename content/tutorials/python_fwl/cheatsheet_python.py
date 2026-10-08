"""
The Frisch-Waugh-Lovell theorem in Python: a one-page cheat sheet.

Companion to https://carlos-mendez.org/tutorials/python_fwl/
Companions:  cheatsheet_R.R   cheatsheet_stata.do
             analysis.do (the full Stata port)   script.py (the post's script)

Every snippet runs against the 50-restaurant CSV that ships with the post, so the
numbers printed here are the post's numbers, and the comparison table at the
end is the same table the R and Stata cheat sheets print.

Install:
    pip install numpy pandas statsmodels matplotlib pyfixest

Usage:     python cheatsheet_python.py
           SHOW_PLOTS=1 python cheatsheet_python.py    # also open the figure
Run time:  under 10 seconds (mostly importing pyfixest). The one figure
           goes to the system temp folder; nothing is written next to this file.
Verified with: Python 3.13 / R 4.5 / Stata 19
               (numpy 2.3, pandas 3.0, statsmodels 0.14, pyfixest 0.50)

Contents
    0.  Vocabulary in thirty seconds
    1.  Load the data (local copy, then URL) or simulate it
    2.  Naive vs full
    3.  The OVB identity (and the direction trap)
    4.  FWL in three lines
    5.  FWL by hand
    6.  Standard errors: the intercept trap and the df correction
    7.  Multiple controls
    8.  The partialled-out plot
    9.  Fixed effects are FWL too
    10. Traps that silently give wrong answers
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
import statsmodels.api as sm                   # noqa: E402
import statsmodels.formula.api as smf          # noqa: E402


# ── 0. Vocabulary in thirty seconds ──────────────────────────────────────────
#
#   Partialling-out ..... regress X1 on the controls and keep the residual: the
#                         part of X1 the controls cannot predict. Also called
#                         residualizing or orthogonalizing.
#   FWL theorem ......... the coefficient on X1 in  y ~ X1 + X2  equals the slope
#                         of resid(y ~ X2) on resid(X1 ~ X2). Exactly, in every
#                         sample, not approximately.
#   Annihilator M2 ...... I - X2 (X2'X2)^-1 X2'. Multiplying by M2 = taking the
#                         residuals on X2 (constant included). Symmetric and
#                         idempotent.
#   OVB ................. naive - full = gamma_hat * delta_hat. gamma_hat is the
#                         omitted variable's coefficient in the full model;
#                         delta_hat is the slope of the OMITTED variable regressed
#                         ON the INCLUDED one.
#   Uncorrelated ........ zero LINEAR association. Residuals are uncorrelated with
#                         the controls by construction, not independent of them.
#   Residual df ......... n minus the parameters estimated. The short FWL
#                         regression does not know you already estimated the
#                         controls, so its df is too large.


# ── 1. Load the data (local copy, then URL) or simulate it ───────────────────
# 50 fast-food restaurants, one per neighborhood; each hands out 100 coupons in
# one day. coupons = % of them redeemed that month; sales = monthly sales ($000).
# income ~ N(50, 10), dayofweek ~ U{1..7},
# coupons = 60 - 0.5 income + N(0, 5),
# sales   = 10 + 0.2 coupons + 0.3 income + 0.5 dayofweek + N(0, 3).
# The true coupon effect is +0.2.

URL = "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/tutorials/python_fwl/data/fwl_store_data.csv"


def simulate_store_data(n=50, seed=42):
    """The post's data-generating process, draw for draw (see script.py)."""
    rng = np.random.default_rng(seed)
    income = rng.normal(50, 10, n)
    dayofweek = rng.integers(1, 8, n)                  # 1..7 inclusive
    coupons = 60 - 0.5 * income + rng.normal(0, 5, n)
    sales = (10 + 0.2 * coupons + 0.3 * income + 0.5 * dayofweek
             + rng.normal(0, 3, n))
    return pd.DataFrame({"sales": np.round(sales, 2),
                         "coupons": np.round(coupons, 2),
                         "income": np.round(income, 2),
                         "dayofweek": dayofweek})


def load_store_data():
    # The Quarto zip ships the CSV flat; the post folder keeps it under data/.
    for path in ("fwl_store_data.csv", "data/fwl_store_data.csv"):
        if Path(path).exists():
            return pd.read_csv(path), path
    try:
        return pd.read_csv(URL), URL
    except OSError:                                    # offline
        return simulate_store_data(), "simulate_store_data() (offline)"


df, SOURCE = load_store_data()
print("Loaded:", SOURCE, df.shape)

# numpy's generator is stable across platforms, so the simulation IS the CSV.
pd.testing.assert_frame_equal(df, simulate_store_data(), check_dtype=False)


# ── 2. Naive vs full ─────────────────────────────────────────────────────────

naive = smf.ols("sales ~ coupons", df).fit()
full = smf.ols("sales ~ coupons + income", df).fit()

print(f"\nNaive  {naive.params['coupons']:.4f}  SE {naive.bse['coupons']:.4f}"
      f"  p {naive.pvalues['coupons']:.3f}")       # -0.1059, 0.1158, 0.365
print(f"Full   {full.params['coupons']:.4f}  SE {full.bse['coupons']:.4f}"
      f"  p {full.pvalues['coupons']:.3f}")        #  0.2673, 0.1203, 0.031
print(f"Income in the full model: {full.params['income']:.4f}")   # 0.3836
# The sign flips: rich neighborhoods use fewer coupons AND buy more.


# ── 3. The OVB identity (and the direction trap) ─────────────────────────────
# naive - full = gamma_hat * delta_hat holds EXACTLY in the sample.

gamma_hat = full.params["income"]
delta_hat = smf.ols("income ~ coupons", df).fit().params["coupons"]   # omitted ON included
gap = naive.params["coupons"] - full.params["coupons"]
assert abs(gap - gamma_hat * delta_hat) < 1e-12
print(f"\nOVB: {gamma_hat:.4f} x {delta_hat:.4f} = {gamma_hat * delta_hat:.4f}"
      f"  =  naive - full = {gap:.4f}")           # 0.3836 x -0.9730 = -0.3732

# THE TRAP: coupons ON income is FWL's first regression, so it is the one you
# have lying around. It is the wrong direction for OVB and reconciles nothing.
wrong = smf.ols("coupons ~ income", df).fit().params["income"]
print(f"Wrong direction: {gamma_hat:.4f} x {wrong:.4f} = {gamma_hat * wrong:.4f}")
# -0.3935 -> -0.151

# Population version: Var(coupons) = 0.25*100 + 25 = 50, Cov(income, coupons)
# = -0.5*100 = -50, so delta = -1.0 and plim naive = 0.2 + 0.3*(-1.0) = -0.10.


# ── 4. FWL in three lines ────────────────────────────────────────────────────

df["c_t"] = smf.ols("coupons ~ income", df).fit().resid   # coupons, income removed
df["s_t"] = smf.ols("sales ~ income", df).fit().resid     # sales, income removed
fwl = smf.ols("s_t ~ c_t - 1", df).fit()                  # residual on residual

assert abs(fwl.params["c_t"] - full.params["coupons"]) < 1e-12
assert np.allclose(fwl.resid, full.resid)                 # same residuals, too
print(f"\nFWL (residualize both): {fwl.params['c_t']:.4f}  SE {fwl.bse['c_t']:.4f}")
# 0.2673, SE 0.1178

# c_t is uncorrelated with income by construction (0 to machine precision):
print(f"corr(c_t, income) = {np.corrcoef(df['c_t'], df['income'])[0, 1]:.1e}")


# ── 5. FWL by hand ───────────────────────────────────────────────────────────
# The constant belongs to the controls: X2 = [1, income].

n = len(df)
y, x1 = df["sales"].to_numpy(), df["coupons"].to_numpy()
X2 = np.column_stack([np.ones(n), df["income"].to_numpy()])
M2 = np.eye(n) - X2 @ np.linalg.solve(X2.T @ X2, X2.T)    # annihilator
assert np.allclose(M2 @ M2, M2) and np.allclose(M2, M2.T)

beta_matrix = (x1 @ M2 @ y) / (x1 @ M2 @ x1)
cov = np.cov(M2 @ y, M2 @ x1)[0, 1]
var = np.var(M2 @ x1, ddof=1)                             # n - 1, cancels anyway
print(f"\nCov / Var = {cov:.4f} / {var:.4f} = {cov / var:.4f}")   # 3.9380 / 14.7320
assert abs(beta_matrix - full.params["coupons"]) < 1e-12
assert abs(cov / var - full.params["coupons"]) < 1e-12


# ── 6. Standard errors: the intercept trap and the df correction ─────────────
# Same coefficient, 0.2673, in every row. Very different standard errors.

s1 = smf.ols("sales ~ c_t - 1", df).fit()                     # Step 1: X only
s1c = smf.ols("sales ~ c_t", df).fit()                        # ... + intercept
s1d = smf.ols("I(sales - sales.mean()) ~ c_t - 1", df).fit()  # ... demeaned y
ladder = [("Step 1, no intercept", s1.bse["c_t"]),            # 1.2715
          ("Step 1 + intercept", s1c.bse["c_t"]),             # 0.1437
          ("Step 1, demeaned sales", s1d.bse["c_t"]),         # 0.1422
          ("Step 2, residualize both", fwl.bse["c_t"]),       # 0.1178
          ("Full model", full.bse["coupons"])]                # 0.1203
print()
for label, se in ladder:
    print(f"  {label:<26}{se:.4f}")

# (a) The blow-up is the DROPPED INTERCEPT, not "outcome variance not yet
#     adjusted": sales has mean 33.6, a no-intercept line must pass through
#     the origin, and the whole level of sales lands in the residuals. Putting
#     the intercept back closes about 98% of the gap.
# (b) Step 2 has the full model's residuals but divides their sum of squares
#     by 49 instead of 47: the full model also estimated an intercept and
#     income. Rescale by sqrt(49/47) and you are back to 0.1203.
se_fixed = fwl.bse["c_t"] * np.sqrt(49 / 47)
assert abs(se_fixed - full.bse["coupons"]) < 1e-12
print(f"  Step 2 x sqrt(49/47) = {se_fixed:.4f}")                 # 0.1203


# ── 7. Multiple controls ─────────────────────────────────────────────────────

full2 = smf.ols("sales ~ coupons + income + dayofweek", df).fit()
c2 = smf.ols("coupons ~ income + dayofweek", df).fit().resid
s2 = smf.ols("sales ~ income + dayofweek", df).fit().resid
fwl2 = sm.OLS(s2, c2).fit()                                   # no constant
assert abs(fwl2.params.iloc[0] - full2.params["coupons"]) < 1e-12
assert abs(fwl2.bse.iloc[0] * np.sqrt(49 / 46) - full2.bse["coupons"]) < 1e-12
print(f"\nTwo controls: full {full2.params['coupons']:.4f} (SE {full2.bse['coupons']:.4f}),"
      f" FWL {fwl2.params.iloc[0]:.4f} (SE {fwl2.bse.iloc[0]:.4f})")
# 0.2706 both ways; SE 0.1194 vs 0.1157, and 0.1157 x sqrt(49/46) = 0.1194.

# Why 0.2673 -> 0.2706: the OVB identity again, one control up. dayofweek moves
# sales (0.3195) but, holding income fixed, is almost unrelated to coupons
# (slope -0.0101, partial corr -0.021), so the two coefficients differ by only
# 0.3195 x (-0.0101) = -0.0032 = 0.2673 - 0.2706. The raw corr (-0.076) is not
# the relevant quantity.
g_dow = full2.params["dayofweek"]
d_dow = smf.ols("dayofweek ~ coupons + income", df).fit().params["coupons"]
dow_t = smf.ols("dayofweek ~ income", df).fit().resid
assert abs(full.params["coupons"] - full2.params["coupons"] - g_dow * d_dow) < 1e-12
print(f"{full.params['coupons']:.4f} - {full2.params['coupons']:.4f}"
      f" = gamma_dow x delta_dow = {g_dow:.4f} x {d_dow:.4f}"
      f" = {g_dow * d_dow:.4f}")                               # 0.3195 x -0.0101
print(f"partial corr(dayofweek, coupons | income) = "
      f"{np.corrcoef(dow_t, df['c_t'])[0, 1]:.3f}"             # -0.021
      f"   (raw corr {df['dayofweek'].corr(df['coupons']):.3f})")   # -0.076


# ── 8. The partialled-out plot ───────────────────────────────────────────────
# Add the means back so the axes are in real units; the slope is unchanged.

cs = df["c_t"] + df["coupons"].mean()
ss = df["s_t"] + df["sales"].mean()
b_scaled = smf.ols("ss ~ cs", pd.DataFrame({"cs": cs, "ss": ss})).fit().params["cs"]
assert abs(b_scaled - full.params["coupons"]) < 1e-12

fig, ax = plt.subplots(figsize=(7, 5))
ax.scatter(cs, ss, color="#6a9bcc", edgecolor="#141413", label="Restaurants")
grid = np.linspace(cs.min(), cs.max(), 2)
ax.plot(grid, ss.mean() + b_scaled * (grid - cs.mean()), color="#d97757",
        lw=2.5, label=f"slope = {b_scaled:.4f}")
ax.set(xlabel="Coupon redemption rate (%, income partialled out + mean)",
       ylabel="Monthly sales (thousands, income partialled out + mean)",
       title="The FWL plot: what 'controlling for income' looks like")
ax.legend()
fig.tight_layout()
png = Path(tempfile.gettempdir()) / "fwl_partialled_out.png"
fig.savefig(png, dpi=120)
print(f"\nFigure saved to {png}")
if os.environ.get("SHOW_PLOTS") == "1":
    plt.show()
plt.close(fig)


# ── 9. Fixed effects are FWL too ─────────────────────────────────────────────
# Seven day-of-week dummies are just seven controls. Partialling them out is
# subtracting the day mean ("within" transformation), which is what pyfixest,
# fixest and reghdfe do under the hood. This is a DIFFERENT model from
# section 7 (day as categories, not a linear trend), so the coefficient differs.

dummies = smf.ols("sales ~ coupons + income + C(dayofweek)", df).fit()
cols = ["sales", "coupons", "income"]
within = df[cols] - df.groupby("dayofweek")[cols].transform("mean")
wfit = smf.ols("sales ~ coupons + income - 1", within).fit()
assert abs(wfit.params["coupons"] - dummies.params["coupons"]) < 1e-12
# df trap again: 50 - 2 = 48 in the within regression, 50 - 9 = 41 with dummies.
assert abs(wfit.bse["coupons"] * np.sqrt(48 / 41) - dummies.bse["coupons"]) < 1e-12
print(f"\nDay FE: dummies {dummies.params['coupons']:.4f} (SE {dummies.bse['coupons']:.4f}),"
      f" within {wfit.params['coupons']:.4f} (SE {wfit.bse['coupons']:.4f} before df fix)")

try:
    import pyfixest as pf
except ImportError:
    print("pyfixest not installed; skipping (pip install pyfixest)")
else:
    fe = pf.feols("sales ~ coupons + income | dayofweek", data=df, vcov="iid")
    assert abs(fe.coef()["coupons"] - dummies.params["coupons"]) < 1e-10
    assert abs(fe.se()["coupons"] - dummies.bse["coupons"]) < 1e-10
    print(f"pyfixest feols(... | dayofweek): {fe.coef()['coupons']:.4f}"
          f" (SE {fe.se()['coupons']:.4f}), df already corrected")


# ── 10. Traps that silently give wrong answers ───────────────────────────────
#
#  1. WRONG OVB DIRECTION. delta_hat is the omitted variable ON the included
#     one (income ~ coupons: -0.9730). The FWL-shaped regression coupons ~
#     income (-0.3935) gives -0.151 and reconciles nothing. See section 3.
#
#  2. DROPPING THE INTERCEPT WHEN THE OUTCOME IS NOT RESIDUALIZED. sales ~ c_t - 1
#     returns the right coefficient with a standard error ten times too big
#     (1.2715 vs 0.1203). Either keep the intercept or residualize y as well.
#
#  3. FORGETTING THE DF CORRECTION. Residual-on-residual SEs divide by n - 1;
#     the full model divides by n - k. Harmless with one control (0.1178 vs
#     0.1203), severe with many fixed effects. Multiply by sqrt((n-1)/(n-k)),
#     or let pyfixest/fixest/reghdfe do it.
#
#  4. "UNCORRELATED" IS NOT "INDEPENDENT". Residualizing removes the LINEAR
#     association with the controls and nothing else. Demo below: a pure
#     function of income, residualized on income, is uncorrelated with income
#     yet still almost entirely determined by it.
#
#  5. LINEAR RESIDUALIZATION CANNOT FIX A MISSPECIFIED OUTCOME EQUATION. If
#     sales has a nonlinear income term that the linear control misses AND
#     that term moves with coupons beyond linear income, FWL reproduces the
#     misspecified full regression exactly, bias included (post Exercise 7b:
#     0.127 vs 0.2). A curve only in the coupon equation is harmless (7a:
#     0.200). FWL is algebra, not identification. Add the missing term, or let
#     Double Machine Learning do both partialling-out regressions with
#     flexible learners and cross-fitting.
#
#  6. THE CONSTANT IS A CONTROL. Residualize with the same control set as the
#     full model, intercept included. coupons ~ income - 1 answers a different
#     question.
#
#  7. SAME ROWS EVERYWHERE. A missing value in ANY model variable makes the
#     auxiliary regressions run on different samples: coupons ~ income keeps
#     rows that sales ~ income drops, pandas aligns the residuals by index,
#     and the slope is wrong without an error. Drop incomplete rows once,
#     before step 1.
#
#  8. STATA FLOAT IMPORT. import delimited without asdouble stores 37.37 as
#     37.369998931884766. Coefficients drift in the 7th decimal: invisible at
#     4 decimals, fatal to any exact cross-language check.
#
#  9. FE DEFAULT STANDARD ERRORS HAVE CHANGED BETWEEN VERSIONS (older fixest
#     clustered by the first fixed effect). Always pass vcov= explicitly.

q = (df["income"] - df["income"].mean()) ** 2              # a function of income
q_t = sm.OLS(q, sm.add_constant(df["income"])).fit().resid
print(f"\nTrap 4: corr(q_t, income) = {np.corrcoef(q_t, df['income'])[0, 1]:.1e},"
      f" corr(q_t, q) = {np.corrcoef(q_t, q)[0, 1]:.3f}")


# ── Comparison table (identical in all three cheat sheets) ───────────────────
# The R and Stata columns are what cheatsheet_R.R and cheatsheet_stata.do
# print. They equal the Python column to every printed digit because all three
# read the same CSV; this file checks its own column against them.

REFERENCE = [  # row, coefficient, SE (fwl_results.json)
    ("Naive (no controls)", -0.1059, 0.1158),
    ("Full (+ income)", 0.2673, 0.1203),
    ("Step 1 (no intercept)", 0.2673, 1.2715),
    ("Step 1 + intercept", 0.2673, 0.1437),
    ("Step 2 (resid. both)", 0.2673, 0.1178),
    ("Two controls (full)", 0.2706, 0.1194),
]
LIVE = [(naive.params["coupons"], naive.bse["coupons"]),
        (full.params["coupons"], full.bse["coupons"]),
        (s1.params["c_t"], s1.bse["c_t"]),
        (s1c.params["c_t"], s1c.bse["c_t"]),
        (fwl.params["c_t"], fwl.bse["c_t"]),
        (full2.params["coupons"], full2.bse["coupons"])]


def cell(b, se):
    return f"{b:7.4f} ({se:6.4f})"


print("\nCoupon coefficient (SE): 50 restaurants, one CSV, three languages")
print("-" * 78)
print(f"{'Row':<24}{'Python':<18}{'R':<18}Stata")
print("-" * 78)
for (label, b_ref, se_ref), (b, se) in zip(REFERENCE, LIVE):
    assert cell(b, se) == cell(b_ref, se_ref), label
    print(f"{label:<24}{cell(b, se):<18}{cell(b_ref, se_ref):<18}"
          f"{cell(b_ref, se_ref)}")
print("-" * 78)
print("Every row: the same coefficient in all three languages. Rows 2-5: the")
print("same coefficient, four different standard errors (sections 4 and 6).")
