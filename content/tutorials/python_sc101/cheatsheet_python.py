"""
Synthetic Control Method (SCM) in Python with mlsynth: a one-page cheat sheet.

Companion to https://carlos-mendez.org/tutorials/python_sc101/
Companions:  cheatsheet_R.R   cheatsheet_stata.do   script.py (the script of the post)

Every snippet runs on the Proposition 99 panel that ships with the post
(data/smoking_sc.csv). All three cheat sheets fit the specification of Abadie,
Diamond, and Hainmueller (2010) to these same data. The comparison table at the
end is therefore printed, character for character, by the R and Stata cheat
sheets as well.

Install:
    pip install mlsynth==1.0.0 pandas numpy matplotlib

Usage:     python cheatsheet_python.py
           SHOW_PLOTS=1 python cheatsheet_python.py    # also open the figure
Run time:  about 80 seconds, mostly the 38 placebo fits of section 6. The one
           figure goes to the system temp folder; nothing is written next to
           this file.
Verified with: Python 3.13 / R 4.5 / Stata 19
               (mlsynth 1.0.0 from PyPI, numpy 2.3, pandas 3.0, scipy 1.17,
               cvxpy 1.8, matplotlib 3.10; tidysynth 0.2.1; synth2 2.1.0)

Contents
    0.  Vocabulary in thirty seconds
    1.  Load the data (local copy, then URL)
    2.  Prepare the panel
    3.  Fit the synthetic control
    4.  Weights, balance, fit, and ATT
    5.  The rounded Stata weights reproduce −19.0018
    6.  In-space placebo test
    7.  In-time placebo test (fake start in 1985)
    8.  Leave-one-out refits
    9.  The plot (temporary folder only)
    10. Traps that silently give wrong answers
    11. Comparison table (identical in all three cheat sheets)
"""

import os
import tempfile
import warnings
from importlib import metadata
from pathlib import Path

import matplotlib

if os.environ.get("SHOW_PLOTS") != "1":
    matplotlib.use("Agg")                      # no window, no blocking

import matplotlib.pyplot as plt                # noqa: E402
import numpy as np                             # noqa: E402
import pandas as pd                            # noqa: E402

warnings.filterwarnings("ignore", category=DeprecationWarning)  # pydantic notices

from mlsynth import VanillaSC                  # noqa: E402
from mlsynth.exceptions import MlsynthConfigError, MlsynthEstimationError  # noqa: E402
from mlsynth.utils.vanillasc_helpers.config import VanillaSCConfig  # noqa: E402


# ── 0. Vocabulary in thirty seconds ──────────────────────────────────────────
#
#   Synthetic control ....... a weighted average of donor states that tracks
#                             California before 1989. After 1989 the same
#                             average estimates sales without Proposition 99.
#   Donor pool .............. the 38 untreated states that may receive weight.
#   W (donor weights) ....... nonnegative weights that sum to one. Here five
#                             states receive positive weight.
#   Predictors .............. what W must match before 1989: four covariates
#                             averaged over 1980–1988 and sales in 1975, 1980,
#                             and 1988 (lagged outcomes).
#   V (predictor weights) ... how much each predictor counts in the match. V
#                             is chosen to fit sales before 1989, and it is not
#                             identified: very different V give the same W.
#   Gap ..................... observed minus synthetic sales in one year.
#   ATT ..................... the mean gap over 1989–2000, the average
#                             treatment effect on the treated unit, California.
#   RMSE .................... root mean squared gap over 1970–1988 (the fit).
#   MSPE ratio .............. mean squared gap after 1988 divided by the mean
#                             squared gap before 1989.
#   In-space placebo ........ refit with each state treated in turn; p is the
#                             share of the 39 units whose MSPE ratio is at
#                             least that of California.
#   cut(2) .................. keep the placebo states whose MSPE before 1989
#                             is at most twice that of California.
#   In-time placebo ......... move the start to a year without a program
#                             (1985); large fake gaps are a warning sign.
#   Leave-one-out ........... drop each positive-weight donor and refit.


# ── 1. Load the data (local copy, then URL) ──────────────────────────────────
# Abadie, Diamond, and Hainmueller (2010) study cigarette sales in 39 US states
# over 1970–2000. The panel has one row per state and year, 1,209 rows in all.
# California started Proposition 99 in 1989, and the other 38 states form the
# donor pool.
#   cigsale    cigarette sales per capita (packs), the outcome
#   lnincome   log GDP per capita (observed 1972–1997)
#   age15to24  share of the population aged 15–24 (observed 1970–1990)
#   retprice   average retail price of cigarettes
#   beer       beer consumption per capita (observed 1984–1997)
# The loader tries the local CSV first and the same CSV on GitHub second. The
# original Stata file of quarcs-lab is the last resort. The three sources hold
# identical values.

CSV_URL = ("https://raw.githubusercontent.com/cmg777/starter-academic-v501/"
           "master/content/tutorials/python_sc101/data/smoking_sc.csv")
DTA_URL = "https://github.com/quarcs-lab/data-open/raw/master/isds/smoking_sc.dta"
COLUMNS = ["state", "year", "cigsale", "lnincome", "beer", "age15to24", "retprice"]


def load_data():
    """Return the panel and its source: local CSV, GitHub CSV, or Stata file."""
    # round_trip parsing keeps the float32 values of the Stata file exact.
    for path in ("data/smoking_sc.csv", "smoking_sc.csv"):
        if Path(path).exists():
            return pd.read_csv(path, float_precision="round_trip"), path
    try:
        return pd.read_csv(CSV_URL, float_precision="round_trip"), CSV_URL
    except OSError:                                # GitHub raw files unreachable
        raw = pd.read_stata(DTA_URL)               # state is a labeled category
        df = raw.assign(state=raw["state"].astype(str),
                        year=raw["year"].astype(int))
        df[COLUMNS[2:]] = df[COLUMNS[2:]].astype("float64")
        return df[COLUMNS], DTA_URL


df, src = load_data()
print("Loaded:", src, df.shape)                            # (1209, 7)
assert df.shape == (1209, 7)
assert df.groupby("state").size().eq(31).all()             # balanced, 39 x 31
assert sorted(df["state"].unique()).index("California") == 2   # Stata code 3


# ── 2. Prepare the panel ─────────────────────────────────────────────────────
# The library needs a 0/1 treatment column that switches on in 1989 for
# California only. A lagged outcome, such as sales in 1975, becomes an
# ordinary covariate column with a one-year window. Each covariate is then
# averaged over its own window, and missing years are skipped.

TREATED, TREAT_YEAR, T0 = "California", 1989, 19          # 19 years before 1989
LAGS = (1988, 1980, 1975)
panel = df.copy()
panel["treated"] = ((panel["state"] == TREATED)
                    & (panel["year"] >= TREAT_YEAR)).astype(int)
for y in LAGS:
    sales = panel.loc[panel["year"] == y].set_index("state")["cigsale"]
    panel[f"cigsale_{y}"] = panel["state"].map(sales)

COVARIATES = ["lnincome", "age15to24", "retprice", "beer",
              "cigsale_1988", "cigsale_1980", "cigsale_1975"]
WINDOWS = {**{c: (1980, 1988) for c in COVARIATES[:4]},    # inclusive years
           **{f"cigsale_{y}": (y, y) for y in LAGS}}        # one year each

# The predictor means of California equal the Treated column of synth2.
means = pd.DataFrame({c: panel[panel["year"].between(*WINDOWS[c])]
                      .groupby("state")[c].mean() for c in COVARIATES})
STATA_TREATED = [10.0766, 0.1735, 89.4222, 24.28, 90.1, 120.2, 127.1]
assert np.allclose(means.loc[TREATED], STATA_TREATED, rtol=0, atol=1e-4)
print("\nPredictor means of California:", means.loc[TREATED].round(4).tolist())


# ── 3. Fit the synthetic control ─────────────────────────────────────────────
# One dictionary configures the estimator, and pydantic checks it when the
# object is built. The backend "mscmt" searches V and W together, like the
# nested option of synth2. The seed fixes that search, so every run returns
# the same weights.

cfg = {"df": panel, "outcome": "cigsale", "treat": "treated",
       "unitid": "state", "time": "year", "display_graphs": False,
       "covariates": COVARIATES, "covariate_windows": WINDOWS,
       "backend": "mscmt", "canonical_v": "min.loss.w", "seed": 42,
       "inference": False}                     # the default True refits 38 times
res = VanillaSC(cfg).fit()                     # about one second
print("\nMethod:", res.method_details.method_name)          # VanillaSC[mscmt]

# A misspelled key fails at once, which is the helpful kind of failure.
try:
    VanillaSC({**cfg, "covariate_window": WINDOWS})
except MlsynthConfigError as err:
    print("Typo caught:", type(err).__name__)


# ── 4. Weights, balance, fit, and ATT ────────────────────────────────────────

STATES = sorted(panel["state"].unique())
DONORS = [s for s in STATES if s != TREATED]
w = pd.Series({s: res.donor_weights.get(s, 0.0) for s in DONORS})   # trap 8
w_pos = w[w > 1e-6].sort_values(ascending=False)
print("\nDonor weights:", w_pos.round(4).to_dict())
# Utah 0.3351, Nevada 0.2356, Montana 0.2019, Colorado 0.1595, Connecticut 0.0679
assert abs(w.sum() - 1) < 1e-8 and (w >= 0).all()

bal = res.additional_outputs["covariate_balance"]
v = res.weights.summary_stats["predictor_weights"]          # diagonal of V
print(pd.DataFrame({"California": bal["treated"], "synthetic": bal["synthetic"],
                    "donor mean": bal["donor_average"],
                    "V": [v[c] for c in COVARIATES]}, index=COVARIATES).round(4))

gap = np.asarray(res.gap, dtype=float)             # observed minus synthetic
synth = np.asarray(res.counterfactual, dtype=float)
y_ca = panel.loc[panel["state"] == TREATED, "cigsale"].to_numpy()
pre_mspe, post_mspe = np.mean(gap[:T0] ** 2), np.mean(gap[T0:] ** 2)
ssr = np.sum(gap[:T0] ** 2)
r2_usual = 1 - ssr / np.sum((y_ca[:T0] - y_ca[:T0].mean()) ** 2)
r2_synth2 = 1 - ssr / np.sum((synth[:T0] - synth[:T0].mean()) ** 2)  # trap 7
assert abs(np.sqrt(pre_mspe) - res.pre_rmse) < 1e-9
print(f"\nATT {res.att:.4f} ({res.effects.att_percent:.1f} percent), "
      f"RMSE {res.pre_rmse:.4f}, gap in 2000 {gap[-1]:.2f}")
print(f"R-squared {r2_usual:.4f} (usual) and {r2_synth2:.4f} (synth2)")
print(f"MSPE ratio {post_mspe / pre_mspe:.2f}; mlsynth reports the RMSPE ratio "
      f"{res.effects.additional_effects['rmspe_ratio']:.4f}")       # trap 4
# ATT −18.9816 (−23.9 percent), RMSE 1.7540, gap in 2000 −25.73
# R-squared 0.9762 (usual) and 0.9743 (synth2); MSPE ratio 129.04 = 11.3597^2


# ── 5. The rounded Stata weights reproduce −19.0018 ──────────────────────────
# The synth2 command prints its weights rounded to three decimals and predicts
# with those rounded weights. Multiplying the donor sales by them reproduces
# the Stata ATT to every printed digit. The small differences from section 4
# therefore come from the optimizer, not from the data.

STATA_W = {"Utah": 0.334, "Nevada": 0.235, "Montana": 0.202,
           "Colorado": 0.161, "Connecticut": 0.068}
Y = panel.pivot(index="year", columns="state", values="cigsale")
synth_stata = Y[list(STATA_W)] @ pd.Series(STATA_W)
gap_stata = Y[TREATED] - synth_stata
att_stata = gap_stata.loc[TREAT_YEAR:].mean()
pre_synth, pre_gap = synth_stata.loc[:TREAT_YEAR - 1], gap_stata.loc[:TREAT_YEAR - 1]
r2_stata = 1 - np.sum(pre_gap ** 2) / np.sum((pre_synth - pre_synth.mean()) ** 2)
print(f"\nStata weights by hand: ATT {att_stata:.4f}, R-squared {r2_stata:.5f}")
assert f"{att_stata:.4f}" == "-19.0018"            # e(att) of synth2
assert f"{r2_stata:.5f}" == "0.97434"              # e(r2) of synth2


# ── 6. In-space placebo test ─────────────────────────────────────────────────
# Each donor state is treated in turn from 1989, and California stays in every
# placebo donor pool, as in synth2 and in ADH (2010). The statistic is the MSPE
# ratio, and California ranks first among 39 units. Its permutation p-value is
# therefore 1/39, the smallest value that 39 units allow.

def fit_as_treated(unit, start=TREAT_YEAR, covariates=COVARIATES,
                   windows=WINDOWS, data=panel):
    """Refit the model with one unit treated from a given year."""
    d = data.assign(treated=((data["state"] == unit)
                             & (data["year"] >= start)).astype(int))
    return VanillaSC({**cfg, "df": d, "covariates": covariates,
                      "covariate_windows": windows}).fit()


gaps = {TREATED: gap}
gaps.update({s: np.asarray(fit_as_treated(s).gap, dtype=float)
             for s in DONORS})                                # about 45 seconds
tab = pd.DataFrame({"pre": {s: np.mean(g[:T0] ** 2) for s, g in gaps.items()},
                    "post": {s: np.mean(g[T0:] ** 2) for s, g in gaps.items()}})
tab["ratio"] = tab["post"] / tab["pre"]
tab["pre_rel"] = tab["pre"] / tab.loc[TREATED, "pre"]         # for cut(2)
tab = tab.sort_values("ratio", ascending=False)
ratio_ca = tab.loc[TREATED, "ratio"]
rank_ca = list(tab.index).index(TREATED) + 1
p_all = (tab["ratio"] >= ratio_ca).mean()
keep = tab[tab["pre_rel"] <= 2]                               # cut(2)
p_cut = (keep["ratio"] >= ratio_ca).mean()
print("\n", tab.head(4).round(2), sep="")
print(f"California: MSPE ratio {ratio_ca:.1f}, rank {rank_ca} of 39, "
      f"p = {p_all:.3f}")                          # 129.0, rank 1, p = 0.026
print(f"cut(2): {len(keep)} units kept, p = {p_cut:.3f}")   # 20 units, p = 0.050

# Pointwise p-values follow the synth2 rules. In each year, the left-sided p
# is the share of kept units whose gap is at most that of California. The
# effect is negative, so the left-sided test is the relevant one. With 20
# kept units, the smallest attainable value is 1/20 = 0.05.
G = np.array([gaps[s][T0:] for s in keep.index])
p_left = (G <= gaps[TREATED][T0:]).mean(axis=0)
print("Left-sided p, 1989–2000:", np.round(p_left, 2).tolist())
# 0.05 in 9 of 12 years; 0.10 in 1990, 1991, and 1998


# ── 7. In-time placebo test (fake start in 1985) ─────────────────────────────
# We pretend that the program began in 1985 and fit on 1970–1984 only. The
# covariates are averaged over 1980–1984, and the 1988 lag is dropped because
# it lies after the fake start. Gaps over 1985–1988 then measure an effect
# that should not exist, and here they average about one third of the ATT.

cov85 = ["lnincome", "age15to24", "retprice", "beer", "cigsale_1980", "cigsale_1975"]
win85 = {**{c: (1980, 1984) for c in cov85[:4]},
         "cigsale_1980": (1980, 1980), "cigsale_1975": (1975, 1975)}
fit85 = fit_as_treated(TREATED, start=1985, covariates=cov85, windows=win85)
fake = np.asarray(fit85.gap, dtype=float)[1985 - 1970:T0]    # 1985–1988
print(f"\nFake gaps 1985–1988: {np.round(fake, 2).tolist()}, "
      f"mean {fake.mean():.2f}")                     # mean −5.97


# ── 8. Leave-one-out refits ──────────────────────────────────────────────────
# We drop each of the five positive-weight donors in turn and refit the full
# model. Every refit keeps a large negative gap in 2000, so no single donor
# drives the result. Without Utah, New Mexico takes the largest weight.

loo = {d: np.asarray(VanillaSC({**cfg, "df": panel[panel["state"] != d]})
                     .fit().gap, dtype=float) for d in w_pos.index}
g2000 = pd.Series({d: g[-1] for d, g in loo.items()})
print("\nGap in 2000 without each donor:", g2000.round(2).to_dict())
print(f"Range: {g2000.min():.2f} (without {g2000.idxmin()}) to "
      f"{g2000.max():.2f} (without {g2000.idxmax()})")   # −27.15 to −23.48


# ── 9. The plot (temporary folder only) ──────────────────────────────────────
# The method res.plot() draws the observed and synthetic paths from the stored
# result. It draws no line at the treatment date for VanillaSC, so we add one
# (trap 9). The file goes to the temporary folder of the system, never next to
# this file.

fig, ax = plt.subplots(figsize=(8, 4.5))
res.plot(kind="counterfactual", ax=ax, display=False, xlabel="Year",
         ylabel="Cigarette sales (packs per capita)")
ax.axvline(TREAT_YEAR, color="grey", linestyle=":", label="Proposition 99 (1989)")
ax.legend(loc="lower left")
fig.tight_layout()
png = Path(tempfile.gettempdir()) / "sc101_cheatsheet_python.png"
fig.savefig(png, dpi=120)
print(f"\nFigure saved to {png}")
if os.environ.get("SHOW_PLOTS") == "1":
    plt.show()
plt.close(fig)


# ── 10. Traps that silently give wrong answers ───────────────────────────────
#
#  1. IDENTICAL PREDICTOR WINDOWS. When every covariate window covers the same
#     years, mlsynth 1.0.0 drops each year in which any covariate is missing.
#     Beer starts in 1984, so every covariate is then averaged over 1984–1988
#     only: the ATT becomes −18.55, and New Mexico and New Hampshire enter W.
#     Give each lag its own one-year window, as in section 2. Demo below.
#
#  2. UNKNOWN INFERENCE STRINGS ARE IGNORED. A call with inference="plaecbo"
#     raises no error and leaves res.inference at None. Check that
#     res.inference is not None whenever a test was requested. Demo below.
#
#  3. inference DEFAULTS TO True. Each fit then adds 38 placebo refits, which
#     turns a one-second fit into a one-minute fit. Pass inference=False in
#     every loop, as in sections 6 to 8.
#
#  4. MSPE VERSUS RMSPE RATIO. The library mlsynth reports the RMSPE ratio,
#     11.36 here, which is the square root of the MSPE ratio, 129.04. The
#     synth2 and tidysynth packages print the MSPE ratio, so the ranking is the
#     same but the numbers are not.
#
#  5. PLACEBO POOLS WITH OR WITHOUT CALIFORNIA. The built-in test leaves
#     California out of every placebo pool, while synth2, tidysynth, and
#     section 6 keep it in. Both designs rank California first of 39 here, but
#     the placebo fits, and hence the cut(2) set, can differ.
#
#  6. STATA ROUNDS W TO THREE DECIMALS. The synth2 command predicts with the
#     rounded weights, so its ATT of −19.0018 belongs to the rounded W
#     (section 5). Compare weights at three decimals and effects at two.
#
#  7. TWO R-SQUARED DEFINITIONS. The value fit_diagnostics.r_squared_pre
#     divides by the variance of observed sales (0.976). The synth2 command
#     divides by the variance of the synthetic series (0.974). Compare like
#     with like (section 4).
#
#  8. donor_weights LISTS POSITIVE DONORS ONLY. A state that is absent has
#     weight 0, so read weights with .get(state, 0.0). Likewise,
#     summary_stats["n_donors"] counts 5 positive donors, not the pool of 38.
#
#  9. res.plot() DRAWS NO INTERVENTION LINE. The VanillaSC result stores no
#     intervention time, so the 1989 line must be added by hand (section 9).
#     A figure without it hides where the comparison starts.
#
# 10. oracle_weights WITH COVARIATES FAILS IN 1.0.0. Fixed weights work only
#     in an outcome-only configuration; with covariates the fit stops with an
#     internal error. Demo below, with the working outcome-only call.
#
# 11. PyPI AND GIT BUILDS SHARE THE VERSION STRING. Both report 1.0.0, but
#     only the git build has a fit_window field and averages shared windows
#     covariate by covariate. Pin mlsynth==1.0.0 from PyPI and check the field.

shared = {c: (1980, 1988) for c in COVARIATES}            # one window for all
same = VanillaSC({**cfg, "covariate_windows": shared}).fit()
print(f"\nTrap 1: identical windows give ATT {same.att:.2f} with "
      f"{sorted(same.donor_weights)}")                # −18.55, six donors
typo = VanillaSC({**cfg, "inference": "plaecbo"}).fit()
print("Trap 2: res.inference after a misspelled mode:", typo.inference)   # None
outcome_only = {k: cfg[k] for k in ("df", "outcome", "treat", "unitid", "time",
                                    "display_graphs", "inference")}
oracle = VanillaSC({**outcome_only, "oracle_weights": STATA_W}).fit()
try:
    VanillaSC({**cfg, "oracle_weights": STATA_W}).fit()
except MlsynthEstimationError as err:
    print(f"Trap 10: {type(err).__name__} with covariates; outcome-only "
          f"oracle ATT {oracle.att:.4f}")             # −19.0018
else:
    print("Trap 10: this build accepts oracle_weights with covariates")
build = "pypi" if "fit_window" not in VanillaSCConfig.model_fields else "git"
print(f"Trap 11: mlsynth {metadata.version('mlsynth')}, {build} build")


# ── 11. Comparison table (identical in all three cheat sheets) ───────────────
# The table lists one row per tool, and every file prints the same text. Each
# file computes its own row live and checks it against the reference row
# within stated tolerances. The other two rows are what cheatsheet_R.R and
# cheatsheet_stata.do print.

TOOLS = ["Python mlsynth 1.0.0", "R tidysynth 0.2.1", "Stata synth2 2.1.0"]
FIVE = ["Utah", "Nevada", "Montana", "Colorado", "Connecticut"]
REF = {   # weights of FIVE, ATT, RMSE, MSPE ratio, p (39), cut(2) n, cut(2) p
    "Python mlsynth 1.0.0": (0.335, 0.236, 0.202, 0.160, 0.068,
                             -18.98, 1.754, 129.0, 0.026, 20, 0.050),
    "R tidysynth 0.2.1": (0.342, 0.238, 0.209, 0.149, 0.062,
                          -18.85, 1.779, 123.9, 0.026, 7, 0.143),
    "Stata synth2 2.1.0": (0.334, 0.235, 0.202, 0.161, 0.068,
                           -19.00, 1.756, 123.5, 0.026, 20, 0.050)}
ROB = {   # in-time 1985 mean fake gap; leave-one-out min and max gap in 2000
    "Python mlsynth 1.0.0": (-5.97, -27.15, -23.48),
    "R tidysynth 0.2.1": (-5.98, -28.25, -24.07),
    "Stata synth2 2.1.0": (-5.99, -28.35, -23.49)}
NOTES = [
    "Notes. ATT: mean gap over 1989–2000, in packs per capita. RMSE: fit over",
    "1970–1988. MSPE ratio: mean squared gap after 1988 over that before 1989.",
    "p (39): share of the 39 units with a ratio at least that of California.",
    "cut(2) n: units whose MSPE before 1989 is at most twice that of California,",
    "and p is the same share among them. In-time 1985: mean fake gap over",
    "1985–1988. LOO: smallest and largest gap in 2000 across the five refits.",
    "Why the rows differ: V is not identified, so each optimizer stops at its own",
    "W. Stata rounds W to three decimals and takes its MSPE ratio from a refit",
    "inside its placebo command. In tidysynth, every placebo fit reuses the V of",
    "California, so its placebo fits are looser and fewer states pass cut(2).",
]


def row(label, cells, widths):
    """Left-align the label in 22 columns and right-align each cell."""
    return f"{label:<22}" + "".join(f"{c:>{w}}" for c, w in zip(cells, widths))


def show_table():
    """Print the comparison table; the same text appears in all three files."""
    w1, w2, w3 = (8, 8, 9, 10, 13), (8, 8, 12, 8, 10, 8), (14, 14, 14)
    fmt2 = (".2f", ".3f", ".1f", ".3f", ".0f", ".3f")
    print("=" * 78)
    print("Synthetic California in three languages: one specification, one panel")
    print("=" * 78)
    print(row("Donor weights", FIVE, w1))
    for t in TOOLS:
        print(row(t, [f"{x:.3f}" for x in REF[t][:5]], w1))
    print("-" * 78)
    print(row("Effect and inference",
              ["ATT", "RMSE", "MSPE ratio", "p (39)", "cut(2) n", "p"], w2))
    for t in TOOLS:
        print(row(t, [format(x, f) for x, f in zip(REF[t][5:], fmt2)], w2))
    print("-" * 78)
    print(row("Robustness", ["In-time 1985", "LOO min 2000", "LOO max 2000"], w3))
    for t in TOOLS:
        print(row(t, [f"{x:.2f}" for x in ROB[t]], w3))
    print("=" * 78)
    print("\n".join(NOTES))


live = (*(w[s] for s in FIVE), res.att, res.pre_rmse, ratio_ca, p_all,
        len(keep), p_cut)
live_rob = (fake.mean(), g2000.min(), g2000.max())
ref, ref_rob = REF[TOOLS[0]], ROB[TOOLS[0]]
assert all(abs(a - b) <= 0.005 for a, b in zip(live[:5], ref[:5])), "weights"
assert abs(live[5] - ref[5]) <= 0.05, "ATT"
assert abs(live[6] - ref[6]) <= 0.01, "RMSE"
assert abs(live[7] - ref[7]) <= 1, "MSPE ratio"
assert rank_ca == 1 and f"{live[8]:.3f}" == f"{ref[8]:.3f}", "p over 39 units"
assert abs(live[9] - ref[9]) <= 2 and abs(live[10] - 1 / live[9]) < 1e-12, "cut(2)"
assert all(abs(a - b) <= 0.05 for a, b in zip(live_rob, ref_rob)), "robustness"
print("\nThis run:", " ".join(f"{x:.3f}" for x in live[:5]),
      f"| ATT {live[5]:.2f} | RMSE {live[6]:.3f} | ratio {live[7]:.1f} | "
      f"p {live[8]:.3f} | cut(2) {live[9]}, p {live[10]:.3f}")
print(f"          in-time {live_rob[0]:.2f} | LOO {live_rob[1]:.2f} to "
      f"{live_rob[2]:.2f}; all within tolerance of the Python rows\n")
show_table()
