"""
Introduction to the Synthetic Control Method in Python with mlsynth

This script is the computational backbone of the post python_sc101. It
replicates the Stata tutorial stata_sc (synth2) on the Proposition 99 case
with the VanillaSC estimator of mlsynth. The steps follow the post: data
checks, raw trends, predictor means, the baseline synthetic California, exact
recomputations of the Stata numbers, in-space and in-time placebo tests, a
leave-one-out check, a replication scorecard, a short tour of three other
estimators, and the answers to the six exercises.

Estimand: the average treatment effect on the treated (ATT) for California,
averaged over 1989–2000. The design is observational, so the estimate is
credible only if the synthetic control reproduces the path that California
would have followed without Proposition 99.

Data:
    smoking_sc.dta (quarcs-lab): 39 states observed every year from 1970 to
    2000. The script reads data/smoking_sc.csv first, then smoking_sc.csv,
    and finally the Stata file at DATA_URL.

Usage:
    python script.py
    The verified stack is Python 3.13 with mlsynth 1.0.0 from PyPI. A full
    run takes about three minutes on a laptop.

Outputs:
    Twelve sc101_*.png figures, eighteen CSV tables, the canonical results
    file sc101_results.json, and PASS or FAIL lines for every benchmark check.

References:
    Abadie, Diamond, and Hainmueller (2010). JASA 105(490): 493–505.
    Abadie (2021). Journal of Economic Literature 59(2): 391–425.
    Yan and Chen (2023). synth2. The Stata Journal 23(3): 597–624.
    mlsynth documentation: https://mlsynth.readthedocs.io
"""

import json
import platform
import sys
import warnings
from importlib import metadata
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.lines import Line2D
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from scipy.optimize import minimize

from mlsynth import CLUSTERSC, SDID, VanillaSC
from mlsynth.exceptions import MlsynthConfigError, MlsynthDataError
from mlsynth.utils.vanillasc_helpers.config import VanillaSCConfig

warnings.filterwarnings("ignore", category=DeprecationWarning)
sys.stdout.reconfigure(line_buffering=True)   # keep the log order stable
pd.set_option("display.width", 120)
pd.set_option("display.max_columns", 20)

# ── Configuration ───────────────────────────────────────────────────────────

RANDOM_SEED = 42                      # also the mscmt and SDID seed
np.random.seed(RANDOM_SEED)

DATA_URL = "https://github.com/quarcs-lab/data-open/raw/master/isds/smoking_sc.dta"
LOCAL_CSV = Path("data") / "smoking_sc.csv"
CSV_CANDIDATES = (LOCAL_CSV, Path("smoking_sc.csv"))
NUMERIC = ["cigsale", "lnincome", "beer", "age15to24", "retprice"]

TREATED = "California"
TREAT_YEAR = 1989
FIRST_YEAR, LAST_YEAR = 1970, 2000
T0 = TREAT_YEAR - FIRST_YEAR          # 19 pre-treatment years (1970–1988)

# Predictor specification ("spec B"): four covariates averaged over
# 1980–1988 and three lagged outcomes, each with its own one-year window.
BASE_COVARIATES = ["lnincome", "age15to24", "retprice", "beer"]
LAG_YEARS = (1988, 1980, 1975)        # Stata order: cigsale(1988) (1980) (1975)
COVARIATES = BASE_COVARIATES + [f"cigsale_{y}" for y in LAG_YEARS]
WINDOWS = {**{c: (1980, 1988) for c in BASE_COVARIATES},
           **{f"cigsale_{y}": (y, y) for y in LAG_YEARS}}
LABELS = {"lnincome": "Log GDP per capita", "age15to24": "Share aged 15–24",
          "retprice": "Retail price", "beer": "Beer per capita",
          "cigsale_1988": "Sales in 1988", "cigsale_1980": "Sales in 1980",
          "cigsale_1975": "Sales in 1975"}

CUTOFF = 2                            # synth2 cut(2)
CUTOFFS = (1, 1.5, 2, 3, 5, 10, 20, None)
FAKE_YEAR = 1985                      # in-time placebo of the Stata post
FAKE_YEARS = (1985, 1986, 1987, 1988)

# ── Stata benchmark (content/post/stata_sc/analysis.log) ───────────────────
# Every number below is copied from the published Stata log of the stata_sc
# post (synth2 2.1.0 with synth 0.0.7). Line numbers refer to that log.
STATA_SOURCE = ("content/post/stata_sc/analysis.log, synth2 2.1.0 with "
                "synth 0.0.7, run of 27 April 2026")
STATA_SUMMARIZE = {                   # summarize, lines 113–122: (N, mean)
    "cigsale": (1209, 118.8932), "lnincome": (1014, 9.861634),
    "beer": (546, 23.4304), "age15to24": (819, 0.175472),
    "retprice": (1209, 108.3419)}
STATA_W = {"Utah": 0.334, "Nevada": 0.235, "Montana": 0.202,
           "Colorado": 0.161, "Connecticut": 0.068}   # lines 485–489
STATA_ATT = -19.0017671585083         # e(att), line 545
STATA_RMSE = 1.755672369538799        # e(rmse), line 543
STATA_R2 = 0.9743364199596987         # e(r2), line 544
STATA_SYNTH_POST = [89.9945, 87.5039, 82.1751, 81.6075, 81.1897, 80.7295,
                    78.5023, 77.4827, 77.7123, 74.3976, 73.5711, 67.3550]
STATA_GAPS = [-7.5945, -9.7039, -13.4751, -14.1075, -17.7897, -22.1295,
              -22.1023, -22.9827, -23.9123, -22.0976, -26.3711, -25.7550]
# X_balance, lines 636–651, in COVARIATES order
STATA_V = [0.00004916, 0.54587094, 0.01741005, 0.0031354, 0.00490342,
           0.00655685, 0.42207419]
STATA_TREATED = [10.076559, 0.17353238, 89.422223, 24.28, 90.099998, 120.2, 127.1]
STATA_SYNTHETIC = [9.8587684, 0.17352193, 89.4108, 24.2278, 91.667698,
                   120.5017, 127.1112]
STATA_AVERAGE = [9.8291968, 0.17251011, 87.266082, 23.655263, 113.82368,
                 138.08947, 136.93158]
# In-space placebo, lines 976–1014: unit, pre MSPE, post MSPE, ratio, pre_rel
STATA_PLACEBO = [
    ("California", 3.1668, 391.2533, 123.5490, 1.0000),
    ("Alabama", 5.4170, 8.2108, 1.5157, 1.7106),
    ("Arkansas", 4.5587, 28.8239, 6.3228, 1.4395),
    ("Colorado", 17.6103, 68.6736, 3.8996, 5.5609),
    ("Connecticut", 20.6396, 118.9189, 5.7617, 6.5175),
    ("Delaware", 30.3949, 499.0694, 16.4195, 9.5980),
    ("Georgia", 1.4610, 116.8893, 80.0074, 0.4613),
    ("Idaho", 5.8142, 39.1830, 6.7392, 1.8360),
    ("Illinois", 4.3146, 89.0552, 20.6406, 1.3624),
    ("Indiana", 14.4145, 469.4150, 32.5654, 4.5518),
    ("Iowa", 14.6527, 31.5816, 2.1553, 4.6270),
    ("Kansas", 14.1121, 9.0349, 0.6402, 4.4563),
    ("Kentucky", 431.7229, 1475.7975, 3.4184, 136.3284),
    ("Louisiana", 2.0183, 94.1070, 46.6279, 0.6373),
    ("Maine", 8.6989, 115.5412, 13.2822, 2.7469),
    ("Minnesota", 14.1736, 52.5217, 3.7056, 4.4757),
    ("Mississippi", 4.0894, 37.2754, 9.1151, 1.2913),
    ("Missouri", 1.2009, 85.1794, 70.9308, 0.3792),
    ("Montana", 5.2861, 54.8978, 10.3853, 1.6692),
    ("Nebraska", 4.8287, 36.5597, 7.5713, 1.5248),
    ("Nevada", 40.6500, 83.4186, 2.0521, 12.8364),
    ("New Hampshire", 3436.5980, 134.9018, 0.0393, 1085.2007),
    ("New Mexico", 5.0577, 63.7459, 12.6036, 1.5971),
    ("North Carolina", 90.2241, 67.3144, 0.7461, 28.4907),
    ("North Dakota", 8.0725, 72.3200, 8.9588, 2.5491),
    ("Ohio", 2.9585, 12.3535, 4.1757, 0.9342),
    ("Oklahoma", 5.7128, 267.8078, 46.8786, 1.8040),
    ("Pennsylvania", 2.7029, 6.7073, 2.4815, 0.8535),
    ("Rhode Island", 87.9904, 242.6697, 2.7579, 27.7854),
    ("South Carolina", 2.1997, 41.2941, 18.7727, 0.6946),
    ("South Dakota", 7.5688, 32.2367, 4.2592, 2.3901),
    ("Tennessee", 5.2043, 123.3097, 23.6938, 1.6434),
    ("Texas", 4.6691, 239.8559, 51.3707, 1.4744),
    ("Utah", 593.7643, 223.2758, 0.3760, 187.4975),
    ("Vermont", 15.3860, 116.8473, 7.5944, 4.8585),
    ("Virginia", 2.7825, 219.8136, 78.9994, 0.8786),
    ("West Virginia", 8.1492, 242.1734, 29.7175, 2.5733),
    ("Wisconsin", 2.8950, 75.2425, 25.9901, 0.9142),
    ("Wyoming", 83.7717, 31.8266, 0.3799, 26.4532)]
STATA_P_ALL, STATA_P_CUT = 0.0256, 0.0500          # lines 1016–1020
# Pointwise p-values at cut(2), lines 1034–1045: two-, right-, left-sided
STATA_P_TWO = [0.05, 0.10, 0.15, 0.10, 0.05, 0.05, 0.05, 0.05, 0.05, 0.10, 0.05, 0.05]
STATA_P_RIGHT = [1.00, 0.95, 0.90, 0.95, 1.00, 1.00, 1.00, 1.00, 1.00, 0.95, 1.00, 1.00]
STATA_P_LEFT = [0.05, 0.10, 0.15, 0.10, 0.05, 0.05, 0.05, 0.05, 0.05, 0.10, 0.05, 0.05]
# The placebo command refits the baseline first (lines 887–961)
STATA_PLACEBO_REFIT = {"rmse": 1.77955, "r2": 0.97411, "att": -18.8261,
                       "weights": {"Utah": 0.345, "Nevada": 0.241, "Montana": 0.207,
                                   "Colorado": 0.148, "Connecticut": 0.059}}
# In-time placebo at 1985, lines 1328–1343, and the reduced specification
# that the same command estimates at 1989 (lines 1248–1320)
STATA_INTIME_SYNTH = [106.1262, 103.2850, 106.1524, 98.4873]
STATA_INTIME_GAPS = [-3.3262, -3.5850, -8.6524, -8.3873]
STATA_INTIME_POST_GAPS = [-14.1237, -14.1127, -15.0156, -13.9730, -16.3911, -19.3078,
                          -19.8193, -20.7010, -21.3958, -19.6437, -25.0260, -25.5861]
STATA_REDUCED = {"rmse": 2.20530, "r2": 0.95253, "att": -17.7131,
                 "weights": {"Utah": 0.360, "Nevada": 0.288, "Connecticut": 0.199,
                             "Colorado": 0.102, "New Mexico": 0.050}}
# Leave-one-out, lines 1506–1621: refit of the baseline and min/max effects
STATA_LOO_REFIT = {"rmse": 1.78329, "r2": 0.97365, "att": -18.8659,
                   "weights": {"Utah": 0.342, "Nevada": 0.238, "Montana": 0.217,
                               "Colorado": 0.145, "Connecticut": 0.058}}
STATA_LOO_EFFECT_MIN = [-9.9509, -11.4205, -13.7889, -14.3815, -18.6592, -24.7112,
                        -24.9864, -26.0833, -30.6150, -26.7314, -30.3396, -28.3503]
STATA_LOO_EFFECT_MAX = [-5.9892, -5.7373, -12.1905, -13.1239, -16.3801, -20.0141,
                        -19.5901, -20.5801, -17.9877, -18.8668, -24.3421, -23.4850]

# ── Figure style (dark theme of the site) ───────────────────────────────────

STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"
GREY_DONOR = "#54618a"                # placebo and donor lines
GOLD = "#e8b04b"                      # Stata benchmark
LIGHT_ORANGE = "#e8956a"
LAVENDER = "#a58fd8"
SAGE = "#8fbf7f"

# Plot defaults: minimal, spine-free, dark background
plt.rcParams.update({
    "figure.facecolor": DARK_NAVY,
    "axes.facecolor": DARK_NAVY,
    "axes.edgecolor": DARK_NAVY,
    "axes.linewidth": 0,
    "axes.labelcolor": LIGHT_TEXT,
    "axes.titlecolor": WHITE_TEXT,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.spines.left": False,
    "axes.spines.bottom": False,
    "axes.grid": True,
    "grid.color": GRID_LINE,
    "grid.linewidth": 0.6,
    "grid.alpha": 0.8,
    "xtick.color": LIGHT_TEXT,
    "ytick.color": LIGHT_TEXT,
    "xtick.major.size": 0,
    "ytick.major.size": 0,
    "text.color": WHITE_TEXT,
    "font.size": 12,
    "legend.frameon": False,
    "legend.fontsize": 11,
    "legend.labelcolor": LIGHT_TEXT,
    "figure.edgecolor": DARK_NAVY,
    "savefig.facecolor": DARK_NAVY,
    "savefig.edgecolor": DARK_NAVY,
})

SAVE_KWARGS = dict(dpi=300, bbox_inches="tight", facecolor=DARK_NAVY,
                   edgecolor=DARK_NAVY, pad_inches=0)

# rcParams passed to res.plot(theme=...) so that the native mlsynth figure
# stays legible on the dark background of the site
MLSYNTH_DARK_THEME = {
    "figure.facecolor": DARK_NAVY, "axes.facecolor": DARK_NAVY,
    "savefig.facecolor": DARK_NAVY, "text.color": WHITE_TEXT,
    "axes.labelcolor": LIGHT_TEXT, "axes.titlecolor": WHITE_TEXT,
    "xtick.color": LIGHT_TEXT, "ytick.color": LIGHT_TEXT,
    "grid.color": GRID_LINE, "grid.alpha": 0.8,
    "legend.facecolor": DARK_NAVY, "legend.edgecolor": GRID_LINE,
    "legend.labelcolor": LIGHT_TEXT, "font.sans-serif": ["DejaVu Sans"],
    "font.weight": "normal", "axes.titlesize": 13, "axes.labelsize": 12,
    "xtick.labelsize": 11, "ytick.labelsize": 11, "legend.fontsize": 11,
}

FIGURES = []
CHECKS = []
SCORECARD = []


# ── Small utilities ─────────────────────────────────────────────────────────

def section(number, title):
    """Print a section banner."""
    print("\n" + "=" * 60)
    print(f"SECTION {number}: {title}")
    print("=" * 60)


def signed(x, nd=2):
    """Format a number for figure text, with a Unicode minus sign."""
    x = round(float(x), nd) + 0.0           # adding 0.0 turns -0.0 into 0.0
    return f"{x:.{nd}f}".replace("-", "−")


def rmse_of(g):
    """Root mean square of a gap vector, with the same bits on every run.

    mlsynth computes its RMSE with a BLAS dot product, whose last bit can
    change between runs. A numpy mean does not, so the exported files stay
    identical when the script runs again.
    """
    g = np.asarray(g, dtype=float)
    return float(np.sqrt(np.mean(g ** 2)))


def check(name, value, reference, tolerance, stata=False, stata_value=None):
    """Print PASS or FAIL for |value - reference| <= tolerance.

    A tuple reference (low, high) checks that the value lies in that range,
    and a boolean reference checks a yes-or-no condition. With stata=True the
    comparison also enters the replication scorecard; stata_value then
    replaces the reference in the Stata column.
    """
    if isinstance(reference, bool):
        ok = bool(value) == reference
        diff = 0.0 if ok else 1.0
        detail = "yes" if ok else "no"
        ref_value = float(reference)
    elif isinstance(reference, tuple):
        low, high = reference
        ok = bool(low <= value <= high)
        diff = 0.0 if ok else float(min(abs(value - low), abs(value - high)))
        detail = f"{value:g} within [{low:g}, {high:g}]"
        ref_value = f"[{low:g}, {high:g}]"
    else:
        diff = abs(float(value) - float(reference))
        ok = bool(diff <= tolerance)
        if ok and tolerance == 0:
            detail = f"{float(value):.6g} equals {float(reference):.6g}"
        elif ok and tolerance < 1e-6:
            # equality checks: the exact rounding noise is not printed
            detail = f"{float(reference):.6g}, |diff| below {tolerance:g}"
        else:
            detail = (f"{float(value):.6g} vs {float(reference):.6g}, "
                      f"|diff| {diff:.1e} <= {tolerance:g}")
        ref_value = float(reference)
    CHECKS.append({"check": name, "pass": ok})
    if stata:
        shown = ref_value if stata_value is None else float(stata_value)
        SCORECARD.append({
            "quantity": name, "stata": shown, "mlsynth": float(value),
            "abs_diff": diff if stata_value is None else abs(float(value) - shown),
            "tolerance": ref_value if isinstance(reference, tuple) else tolerance,
            "pass": "PASS" if ok else "FAIL"})
    print(f"  {'PASS' if ok else 'FAIL'}  {name}: {detail}")
    return ok


def score_note(name, stata_value, mlsynth_value):
    """Add an informative scorecard row that carries no PASS or FAIL rule."""
    SCORECARD.append({"quantity": name, "stata": stata_value,
                      "mlsynth": mlsynth_value,
                      "abs_diff": abs(float(stata_value) - float(mlsynth_value)),
                      "tolerance": "n/a", "pass": "info"})


def save_figure(fig, name):
    """Save a figure with the dark-theme settings and close it."""
    fig.savefig(name, **SAVE_KWARGS)
    plt.close(fig)
    FIGURES.append(name)
    print(f"Saved: {name}")


def positive_weights(weights, states, tol=1e-6):
    """Return the positive entries of a weight vector, largest first."""
    pairs = [(s, float(v)) for s, v in zip(states, weights) if v > tol]
    return dict(sorted(pairs, key=lambda kv: -kv[1]))


def fmt_weights(weights, nd=3):
    """Format a weight dictionary as one short line."""
    return ", ".join(f"{k} {v:.{nd}f}" for k, v in weights.items())


# ── Helpers shown in the post ───────────────────────────────────────────────

def load_data(candidates=CSV_CANDIDATES, url=DATA_URL):
    """Load the panel: a local CSV copy first, the Stata file otherwise.

    The CSV stores the float32 values of the Stata file at full float64
    precision, so both paths return bit-identical numbers.
    """
    for path in candidates:
        if Path(path).exists():
            return pd.read_csv(path, float_precision="round_trip"), str(path)
    raw = pd.read_stata(url)                       # state is a labeled categorical
    df = raw.assign(state=raw["state"].astype(str), year=raw["year"].astype(int))
    df[NUMERIC] = df[NUMERIC].astype("float64")    # exact float32 to float64
    return df[["state", "year", *NUMERIC]], url


def prepare_panel(df):
    """Add the treatment indicator and the three lagged-outcome columns."""
    out = df.copy()
    out["treated"] = ((out["state"] == TREATED)
                      & (out["year"] >= TREAT_YEAR)).astype(int)
    for y in LAG_YEARS:
        sales = out.loc[out["year"] == y].set_index("state")["cigsale"]
        out[f"cigsale_{y}"] = out["state"].map(sales)
    return out


def predictor_means(panel, covariates=COVARIATES, windows=WINDOWS):
    """Average each predictor over its own window, skipping missing years."""
    cols = {}
    for c in covariates:
        lo, hi = windows[c]
        sub = panel[(panel["year"] >= lo) & (panel["year"] <= hi)]
        cols[c] = sub.groupby("state", sort=False)[c].mean()
    return pd.DataFrame(cols).reindex(panel["state"].unique())


def resolved_years(covariates, windows, start):
    """Years that mlsynth averages for each predictor before a given start."""
    pre = list(range(FIRST_YEAR, start))
    years = []
    for c in covariates:
        lo, hi = windows.get(c, (FIRST_YEAR, start - 1))
        years.append(tuple(t for t in pre if lo <= t <= hi) or tuple(pre))
    return years


def base_config(panel, treated=TREATED, start=TREAT_YEAR):
    """Return the five keys that every mlsynth estimator needs."""
    data = panel.assign(treated=((panel["state"] == treated)
                                 & (panel["year"] >= start)).astype(int))
    return {"df": data, "outcome": "cigsale", "treat": "treated",
            "unitid": "state", "time": "year", "display_graphs": False}


def sc_config(panel, treated=TREATED, start=TREAT_YEAR, covariates=COVARIATES,
              windows=WINDOWS, inference=False, **extra):
    """Build the VanillaSC configuration used in every covariate fit.

    The guard matters: when every predictor window resolves to the same
    years, mlsynth 1.0.0 drops each year with any missing covariate.
    """
    years = resolved_years(covariates, windows, start)
    assert len(covariates) < 2 or len(set(years)) > 1, (
        "mlsynth 1.0.0 drops years listwise when all predictor windows are equal")
    return {**base_config(panel, treated, start),
            "covariates": list(covariates),
            "covariate_windows": {c: windows[c] for c in covariates},
            "backend": "mscmt", "canonical_v": "min.loss.w",
            "seed": RANDOM_SEED, "inference": inference, **extra}


def fit_sc(panel, **kwargs):
    """Fit VanillaSC with the specification of the post."""
    return VanillaSC(sc_config(panel, **kwargs)).fit()


def mspe(gap, t0=T0):
    """Mean squared prediction error before and after the treatment date."""
    gap = np.asarray(gap, dtype=float)
    return float(np.mean(gap[:t0] ** 2)), float(np.mean(gap[t0:] ** 2))


def placebo_in_space(panel, states):
    """Refit the model with each state as the treated unit (synth2 design).

    California stays in the donor pool of every placebo fit, as in synth2 and
    in Abadie, Diamond, and Hainmueller (2010).
    """
    fits = {s: fit_sc(panel, treated=s) for s in states}
    rows = []
    for s, res in fits.items():
        pre, post = mspe(res.gap)
        rows.append({"unit": s, "pre_mspe": pre, "post_mspe": post})
    tab = pd.DataFrame(rows).set_index("unit")
    tab["ratio"] = tab["post_mspe"] / tab["pre_mspe"]
    tab["pre_rel"] = tab["pre_mspe"] / tab.loc[TREATED, "pre_mspe"]
    tab = tab.sort_values("ratio", ascending=False, kind="mergesort")
    tab["rank"] = np.arange(1, len(tab) + 1)
    return tab, fits


def placebo_pvalue(tab, cutoff=None):
    """Share of retained units whose MSPE ratio is at least that of California.

    With a cutoff c, a unit is retained when its pre-period MSPE is at most
    c times the pre-period MSPE of California, as in synth2 cut(c).
    """
    keep = tab if cutoff is None else tab[tab["pre_rel"] <= cutoff]
    return keep, float((keep["ratio"] >= tab.loc[TREATED, "ratio"]).mean())


def pointwise_pvalues(keep_units, gaps, years, t0=T0):
    """Year-by-year placebo p-values with the synth2 tie rules.

    California counts in the numerator and the denominator, so the smallest
    attainable p-value is one over the number of retained units.
    """
    G = np.array([gaps[u] for u in keep_units])[:, t0:]
    g1 = np.asarray(gaps[TREATED])[t0:]
    return pd.DataFrame({"year": np.asarray(years)[t0:], "gap": g1,
                         "p_two": (np.abs(G) >= np.abs(g1)).mean(axis=0),
                         "p_right": (G >= g1).mean(axis=0),
                         "p_left": (G <= g1).mean(axis=0)})


def in_time_spec(fake_year):
    """Predictors for a fake start year: windows end before it, lags precede it."""
    lags = [y for y in LAG_YEARS if y < fake_year]
    covariates = BASE_COVARIATES + [f"cigsale_{y}" for y in lags]
    windows = {**{c: (1980, fake_year - 1) for c in BASE_COVARIATES},
               **{f"cigsale_{y}": (y, y) for y in lags}}
    return covariates, windows


def fit_in_time(panel, fake_year):
    """Fit the model as if Proposition 99 had started in fake_year."""
    covariates, windows = in_time_spec(fake_year)
    return fit_sc(panel, start=fake_year, covariates=covariates, windows=windows)


def leave_one_out(panel, donors):
    """Refit the baseline once without each donor in turn."""
    return {d: fit_sc(panel[panel["state"] != d]) for d in donors}


# ── Section 0: Environment ──────────────────────────────────────────────────

section(0, "Environment")
PACKAGES = ["mlsynth", "numpy", "pandas", "scipy", "matplotlib", "cvxpy",
            "scs", "statsmodels", "pydantic"]
VERSIONS = {"python": platform.python_version(),
            **{p: metadata.version(p) for p in PACKAGES}}
BUILD = "pypi" if "fit_window" not in VanillaSCConfig.model_fields else "git"
print(f"Python {VERSIONS['python']} on {platform.system()} {platform.machine()}")
for p in PACKAGES:
    print(f"  {p:<12} {VERSIONS[p]}")
print(f"mlsynth build fingerprint: {BUILD} "
      "(the PyPI wheel has no fit_window field in VanillaSCConfig)")
print(f"Random seed: {RANDOM_SEED}")
check("mlsynth version is 1.0.0", VERSIONS["mlsynth"] == "1.0.0", True, 0)


# ── Section 1: Data loading and checks ──────────────────────────────────────

section(1, "Data loading and checks")
df, source = load_data()
print(f"Loaded {len(df)} rows from {source}")
if source == DATA_URL:
    # First run only: keep a local copy and confirm the exact round trip.
    LOCAL_CSV.parent.mkdir(exist_ok=True)
    df.to_csv(LOCAL_CSV, index=False)
    back = pd.read_csv(LOCAL_CSV, float_precision="round_trip")
    pd.testing.assert_frame_equal(back, df, check_exact=True)
    print(f"Wrote {LOCAL_CSV}; the CSV round trip is bit-identical")

STATES = df["state"].drop_duplicates().tolist()
DONORS = [s for s in STATES if s != TREATED]
CA = STATES.index(TREATED)
print(f"\nShape: {df.shape}")
print(f"\nColumn types:\n{df.dtypes}")
print(f"\nFirst rows:\n{df.head(6)}")
desc = df[NUMERIC].describe().T
print(f"\nDescriptive statistics:\n{desc.round(4)}")

check("Number of rows", len(df), 1209, 0)
check("Number of states", df["state"].nunique(), 39, 0)
check("Number of years", df["year"].nunique(), 31, 0)
check("Balanced panel (31 years per state)",
      bool(df.groupby("state").size().eq(31).all()), True, 0)
check("California is the third state (Stata code 3)", CA, 2, 0)
for c in NUMERIC:
    n_stata, mean_stata = STATA_SUMMARIZE[c]
    check(f"Observations of {c}", int(df[c].notna().sum()), n_stata, 0)
    check(f"Mean of {c}", df[c].mean(), mean_stata, 1e-4)

coverage = pd.DataFrame([{
    "variable": c,
    "n_obs": int(df[c].notna().sum()),
    "first_year": int(df.loc[df[c].notna(), "year"].min()),
    "last_year": int(df.loc[df[c].notna(), "year"].max()),
    "n_years": int(df.loc[df[c].notna(), "year"].nunique()),
} for c in NUMERIC])
print(f"\nCoverage by variable:\n{coverage.to_string(index=False)}")
print("Beer data begin in 1984, so any predictor window that ends before 1984"
      " has no beer values.")

state_means = df.groupby("state", sort=False)["cigsale"].mean().sort_values()
print("\nMean cigarette sales 1970–2000, lowest three states:")
print(state_means.head(3).round(2).to_string())
print("Highest three states:")
print(state_means.tail(3).round(2).to_string())

descriptive_stats = desc.rename(columns={"25%": "p25", "50%": "median", "75%": "p75"})
descriptive_stats.insert(0, "variable", descriptive_stats.index)
descriptive_stats["stata_n"] = [STATA_SUMMARIZE[c][0] for c in NUMERIC]
descriptive_stats["stata_mean"] = [STATA_SUMMARIZE[c][1] for c in NUMERIC]


# ── Section 2: Raw trends ───────────────────────────────────────────────────

section(2, "Raw trends")
Y = df.pivot(index="year", columns="state", values="cigsale")[STATES]
YEARS = Y.index.to_numpy()
Y_MAT = Y.to_numpy()                  # 31 years x 39 states
ca_sales = Y[TREATED].to_numpy()
donor_avg = Y[DONORS].mean(axis=1).to_numpy()

trend_years = [1970, 1975, 1980, 1985, 1988, 1989, 1995, 2000]
trend = pd.DataFrame({"year": YEARS, "california": ca_sales,
                      "donor_average": donor_avg,
                      "difference": ca_sales - donor_avg})
print("California and the average of the 38 donor states (packs per capita):")
print(trend[trend["year"].isin(trend_years)].round(2).to_string(index=False))

pre_ca, post_ca = ca_sales[:T0].mean(), ca_sales[T0:].mean()
pre_avg, post_avg = donor_avg[:T0].mean(), donor_avg[T0:].mean()
did_means = (post_ca - pre_ca) - (post_avg - pre_avg)
print(f"\nCalifornia: {pre_ca:.2f} before 1989, {post_ca:.2f} after "
      f"(naive before-after change {post_ca - pre_ca:.2f})")
print(f"Donor average: {pre_avg:.2f} before 1989, {post_avg:.2f} after "
      f"(change {post_avg - pre_avg:.2f})")
print(f"Difference in the two changes (2x2 means DiD): {did_means:.4f}")

# Figure 1: raw trends
fig, ax = plt.subplots(figsize=(11, 6))
fig.patch.set_linewidth(0)
for s in DONORS:
    ax.plot(YEARS, Y[s], color=GREY_DONOR, linewidth=0.8, alpha=0.6, zorder=1)
ax.plot([], [], color=GREY_DONOR, linewidth=1.2, label="Individual donor states")
ax.plot(YEARS, donor_avg, color=STEEL_BLUE, linewidth=2.6, linestyle="--",
        label="Average of the 38 donor states", zorder=3)
ax.plot(YEARS, ca_sales, color=WARM_ORANGE, linewidth=3.0, label="California",
        zorder=4)
ax.axvline(TREAT_YEAR, color=LIGHT_TEXT, linestyle=":", linewidth=1.5, zorder=2)
ax.text(TREAT_YEAR + 0.4, 285, "Proposition 99 (1989)", color=LIGHT_TEXT,
        fontsize=11, va="top")
ax.set_xlim(FIRST_YEAR - 0.5, LAST_YEAR + 0.5)
ax.set_ylim(0, 300)
ax.set_xlabel("Year", fontsize=12)
ax.set_ylabel("Cigarette sales (packs per capita)", fontsize=12)
ax.set_title("Cigarette sales in California and the 38 donor states, 1970–2000",
             fontsize=14, fontweight="bold", pad=12)
ax.legend(loc="lower left", fontsize=11)
plt.tight_layout()
save_figure(fig, "sc101_raw_trends.png")


# ── Section 3: Panel preparation and predictor means ────────────────────────

section(3, "Panel preparation and predictor means")
panel = prepare_panel(df)
print(f"Prepared panel: {panel.shape[0]} rows, columns {list(panel.columns)}")
print(f"Treated observations (California, 1989–2000): {int(panel['treated'].sum())}")
print("\nPredictor windows (inclusive years):")
for c in COVARIATES:
    span = "–".join(str(y) for y in WINDOWS[c])
    print(f"  {c:<13} {span}   {LABELS[c]}")

X = predictor_means(panel)                 # 39 states x 7 predictors, raw units
x_treated = X.loc[TREATED].to_numpy()
x_donor_avg = X.loc[DONORS].mean().to_numpy()
means_tab = pd.DataFrame({"predictor": COVARIATES,
                          "california": x_treated, "stata_treated": STATA_TREATED,
                          "donor_average": x_donor_avg,
                          "stata_average": STATA_AVERAGE})
print(f"\nPredictor means:\n{means_tab.round(6).to_string(index=False)}")
for i, c in enumerate(COVARIATES):
    check(f"California mean of {c} equals Stata", x_treated[i], STATA_TREATED[i], 1e-4)
    check(f"Donor average of {c} equals Stata", x_donor_avg[i], STATA_AVERAGE[i], 1e-4)
max_treated_diff = float(np.max(np.abs(x_treated - np.array(STATA_TREATED))))
max_average_diff = float(np.max(np.abs(x_donor_avg - np.array(STATA_AVERAGE))))
check("Max |diff| of the seven California predictor means", max_treated_diff, 0, 1e-4,
      stata=True)
check("Max |diff| of the seven donor-average predictor means", max_average_diff, 0,
      1e-4, stata=True)

predictors_csv = X.reset_index().rename(columns={"index": "state"})


# ── Section 4: Baseline synthetic California ────────────────────────────────

section(4, "Baseline synthetic California")
res = fit_sc(panel)
w_ml = np.array([res.donor_weights.get(s, 0.0) for s in STATES])
w_stata = np.array([STATA_W.get(s, 0.0) for s in STATES])
synth = np.asarray(res.counterfactual, dtype=float)
gap = np.asarray(res.gap, dtype=float)
att = float(res.att)

print("A tour of the result object:")
print(f"  type(res)                               {type(res).__name__}")
print(f"  res.method_details.method_name          {res.method_details.method_name}")
print(f"  res.att                                 {att:.4f}")
print(f"  res.effects.att_percent                 {res.effects.att_percent:.2f}")
print(f"  res.fit_diagnostics.rmse_pre            {res.fit_diagnostics.rmse_pre:.4f}")
print(f"  res.fit_diagnostics.r_squared_pre       {res.fit_diagnostics.r_squared_pre:.4f}")
print(f"  res.fit_diagnostics.rmse_post           {res.fit_diagnostics.rmse_post:.4f}")
print(f"  res.weights.summary_stats['n_donors']   {res.weights.summary_stats['n_donors']}")
print(f"  len(additional_outputs['donor_names'])  {len(res.additional_outputs['donor_names'])}")
print(f"  res.time_series.intervention_time       {res.time_series.intervention_time}")
print(f"  res.inference                           {res.inference}")

w_pos = positive_weights(w_ml, STATES)
print(f"\nDonor weights (positive only): {fmt_weights(w_pos, 4)}")
print(f"Stata weights:                 {fmt_weights(STATA_W, 4)}")
print(f"Sum of weights: {w_ml.sum():.10f}; positive donors: {len(w_pos)} of 38")
check("Sum of mlsynth weights", w_ml.sum(), 1, 1e-8)
check("Positive donors are the five Stata donors (weight above 0.001)",
      sorted(s for s in STATES if res.donor_weights.get(s, 0) > 1e-3)
      == sorted(STATA_W), True, 0)
for s in STATA_W:
    check(f"Weight of {s}", res.donor_weights.get(s, 0.0), STATA_W[s], 0.005,
          stata=True)
other = max(res.donor_weights.get(s, 0.0) for s in DONORS if s not in STATA_W)
check("Largest weight among the other 33 donors", other, 0, 1e-6, stata=True)

v_ml = np.array([res.weights.summary_stats["predictor_weights"][c] for c in COVARIATES])
v_tab = pd.DataFrame({"predictor": COVARIATES, "v_mlsynth": v_ml, "v_stata": STATA_V})
print(f"\nPredictor weights V (diagonal):\n{v_tab.round(6).to_string(index=False)}")
print(f"v_agreement reported by mlsynth: {res.weights.summary_stats['v_agreement']}")
print("The two V vectors differ, yet the donor weights agree: V is not identified.")

bal = res.additional_outputs["covariate_balance"]
x_donors = X.loc[DONORS].to_numpy()                    # 38 x 7
synth_x_stata_w = x_donors.T @ np.array([STATA_W.get(s, 0.0) for s in DONORS])
balance = pd.DataFrame({
    "predictor": COVARIATES, "label": [LABELS[c] for c in COVARIATES],
    "treated": bal["treated"], "synthetic": bal["synthetic"],
    "synthetic_stata_w": synth_x_stata_w, "donor_average": bal["donor_average"],
    "stata_synthetic": STATA_SYNTHETIC})
balance["pct_gap_synthetic"] = 100 * (balance["synthetic"] - balance["treated"]) / balance["treated"]
balance["pct_gap_average"] = 100 * (balance["donor_average"] - balance["treated"]) / balance["treated"]
print(f"\nPredictor balance:\n{balance.drop(columns='label').round(4).to_string(index=False)}")
check("Max |diff| of synthetic predictors (mlsynth W vs Stata)",
      float(np.max(np.abs(np.array(bal["synthetic"]) - np.array(STATA_SYNTHETIC)))),
      0, 0.05, stata=True)

pre_mspe, post_mspe = mspe(gap)
mspe_ratio = post_mspe / pre_mspe
rmspe_ratio = float(res.effects.additional_effects["rmspe_ratio"])
ssr = float(np.sum(gap[:T0] ** 2))
r2_conventional = 1 - ssr / float(np.sum((ca_sales[:T0] - ca_sales[:T0].mean()) ** 2))
pre_rmse, post_rmse = rmse_of(gap[:T0]), rmse_of(gap[T0:])
r2_stata_def = 1 - ssr / float(np.sum((synth[:T0] - synth[:T0].mean()) ** 2))
gap_2000_pct = 100 * gap[-1] / synth[-1]
print(f"\nATT 1989–2000:                {att:.4f}")
print(f"ATT in percent (mlsynth):      {res.effects.att_percent:.2f}")
print(f"Gap in 2000:                  {gap[-1]:.4f} ({gap_2000_pct:.1f} percent of synthetic)")
print(f"Pre-period RMSE:              {res.pre_rmse:.4f}")
print(f"Post-period RMSE:             {res.fit_diagnostics.rmse_post:.4f}")
print(f"R-squared (conventional):     {r2_conventional:.5f}")
print(f"R-squared (Stata definition): {r2_stata_def:.5f}")
print(f"MSPE pre / post / ratio:      {pre_mspe:.4f} / {post_mspe:.4f} / {mspe_ratio:.4f}")
print(f"RMSPE ratio (mlsynth):        {rmspe_ratio:.4f} (squared: {rmspe_ratio ** 2:.4f})")

paths_post = pd.DataFrame({"year": YEARS[T0:], "actual": ca_sales[T0:],
                           "synthetic": synth[T0:], "gap": gap[T0:],
                           "stata_synthetic": STATA_SYNTH_POST,
                           "stata_gap": STATA_GAPS})
paths_post["gap_diff"] = paths_post["gap"] - paths_post["stata_gap"]
print(f"\nPost-period paths:\n{paths_post.round(4).to_string(index=False)}")

check("ATT", att, STATA_ATT, 0.05, stata=True)
check("Pre-period RMSE", res.pre_rmse, STATA_RMSE, 0.01, stata=True)
check("R-squared (Stata definition)", r2_stata_def, STATA_R2, 0.001, stata=True)
check("Gap in 1989", gap[T0], STATA_GAPS[0], 0.05, stata=True)
check("Gap in 2000", gap[-1], STATA_GAPS[-1], 0.05, stata=True)
check("Max |diff| of the 12 post-period gaps",
      float(np.max(np.abs(paths_post["gap_diff"]))), 0, 0.05, stata=True)
score_note("R-squared (conventional definition)", STATA_R2, r2_conventional)
check("Recomputed pre-period RMSE equals res.pre_rmse", pre_rmse, res.pre_rmse, 1e-12)
check("Recomputed R-squared equals r_squared_pre", r2_conventional,
      res.fit_diagnostics.r_squared_pre, 1e-12)

# Figure 2: the native mlsynth plot, restyled for the dark site
fig, axes = plt.subplots(1, 2, figsize=(14, 5.4))
fig.patch.set_linewidth(0)
res.plot(kind="counterfactual", ax=axes[0], theme=MLSYNTH_DARK_THEME, display=False,
         observed_color=WARM_ORANGE, observed_linewidth=2.4,
         counterfactual_colors=[STEEL_BLUE], counterfactual_linewidth=2.2,
         xlabel="Year", ylabel="Cigarette sales (packs per capita)")
res.plot(kind="gap", ax=axes[1], theme=MLSYNTH_DARK_THEME, display=False,
         counterfactual_colors=[TEAL], counterfactual_linewidth=2.2,
         xlabel="Year", ylabel="Gap (packs per capita)")
axes[1].axhline(0, color=LIGHT_TEXT, linewidth=0.9)   # the native zero line is black
for ax in axes:
    # res.plot draws no intervention line for VanillaSC, so we add one
    ax.axvline(TREAT_YEAR, color=LIGHT_TEXT, linestyle=":", linewidth=1.6,
               label="1989 (added by hand)")
    ax.legend(loc="lower left", fontsize=10, frameon=False)
fig.suptitle("The native res.plot() figures of mlsynth on a dark background",
             fontsize=14, fontweight="bold", color=WHITE_TEXT)
plt.tight_layout()
save_figure(fig, "sc101_mlsynth_plot.png")

# Figure 3: observed and synthetic California
fig, ax = plt.subplots(figsize=(11, 6))
fig.patch.set_linewidth(0)
ax.axvspan(TREAT_YEAR, LAST_YEAR + 0.5, color=GRID_LINE, alpha=0.45, zorder=0)
ax.plot(YEARS, ca_sales, color=WARM_ORANGE, linewidth=3.0,
        label="California (observed)", zorder=3)
ax.plot(YEARS, synth, color=STEEL_BLUE, linewidth=2.6, linestyle="--",
        label="Synthetic California", zorder=4)
ax.axvline(TREAT_YEAR, color=LIGHT_TEXT, linestyle=":", linewidth=1.5)
ax.annotate("", xy=(LAST_YEAR, ca_sales[-1]), xytext=(LAST_YEAR, synth[-1]),
            arrowprops=dict(arrowstyle="<->", color=TEAL, lw=2))
ax.text(LAST_YEAR + 0.3, ca_sales[-1] - 3.5, f"Gap in 2000: {signed(gap[-1])} packs",
        color=TEAL, fontsize=11, ha="right", va="top", fontweight="bold")
ax.text(TREAT_YEAR + 0.4, 135, "Proposition 99 (1989)", color=LIGHT_TEXT,
        fontsize=11)
ax.set_xlim(FIRST_YEAR - 0.5, LAST_YEAR + 0.5)
ax.set_ylim(30, 140)
ax.set_xlabel("Year", fontsize=12)
ax.set_ylabel("Cigarette sales (packs per capita)", fontsize=12)
ax.set_title("Observed and synthetic California, 1970–2000",
             fontsize=14, fontweight="bold", pad=12)
ax.legend(loc="lower left", fontsize=11)
plt.tight_layout()
save_figure(fig, "sc101_synthetic_path.png")

# Figure 4: the gap and the ATT
fig, ax = plt.subplots(figsize=(11, 6))
fig.patch.set_linewidth(0)
ax.axvspan(TREAT_YEAR, LAST_YEAR + 0.5, color=GRID_LINE, alpha=0.45, zorder=0)
ax.axhline(0, color=LIGHT_TEXT, linewidth=0.9)
ax.axvline(TREAT_YEAR, color=LIGHT_TEXT, linestyle=":", linewidth=1.5)
ax.plot(YEARS, gap, color=TEAL, linewidth=2.6, marker="o", markersize=4,
        label="Gap: observed minus synthetic California", zorder=3)
ax.hlines(att, TREAT_YEAR, LAST_YEAR, color=WARM_ORANGE, linestyle="--",
          linewidth=2.2, label=f"ATT over 1989–2000: {signed(att)} packs", zorder=4)
ax.set_xlim(FIRST_YEAR - 0.5, LAST_YEAR + 0.5)
ax.set_ylim(-32, 8)
ax.set_xlabel("Year", fontsize=12)
ax.set_ylabel("Gap (packs per capita)", fontsize=12)
ax.set_title("Gap between observed and synthetic California",
             fontsize=14, fontweight="bold", pad=12)
ax.legend(loc="lower left", fontsize=11)
plt.tight_layout()
save_figure(fig, "sc101_gap.png")

# Figure 5: donor weights, mlsynth and Stata
order = list(w_pos)
fig, ax = plt.subplots(figsize=(10, 5.5))
fig.patch.set_linewidth(0)
yy = np.arange(len(order))
h = 0.38
ax.set_axisbelow(True)
ml_vals = [res.donor_weights[s] for s in order]
st_vals = [STATA_W[s] for s in order]
ax.barh(yy - h / 2, ml_vals, height=h, color=STEEL_BLUE, label="mlsynth (VanillaSC)")
ax.barh(yy + h / 2, st_vals, height=h, color=GOLD, label="Stata (synth2)")
for i, (a, b) in enumerate(zip(ml_vals, st_vals)):
    ax.text(a + 0.004, i - h / 2, f"{a:.3f}", va="center", fontsize=11, color=WHITE_TEXT)
    ax.text(b + 0.004, i + h / 2, f"{b:.3f}", va="center", fontsize=11, color=WHITE_TEXT)
ax.set_yticks(yy)
ax.set_yticklabels(order, fontsize=12)
ax.invert_yaxis()
ax.set_xlim(0, 0.42)
ax.set_xlabel("Weight in synthetic California", fontsize=12)
ax.set_title("Donor weights: mlsynth and Stata", fontsize=14,
             fontweight="bold", pad=12)
ax.legend(loc="lower right", fontsize=11)
ax.text(0.0, -0.16, "The other 33 donor states receive zero weight in both fits.",
        transform=ax.transAxes, fontsize=11, color=LIGHT_TEXT)
plt.tight_layout()
save_figure(fig, "sc101_donor_weights.png")

# Figure 6: predictor balance and the predictor weights V
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6.2), sharey=True)
fig.patch.set_linewidth(0)
yy = np.arange(len(COVARIATES))
ax1.set_axisbelow(True)
ax2.set_axisbelow(True)
ax1.barh(yy - h / 2, balance["pct_gap_synthetic"], height=h, color=STEEL_BLUE,
         label="Synthetic California")
ax1.barh(yy + h / 2, balance["pct_gap_average"], height=h, color=GREY_DONOR,
         label="Average of the 38 donors")
ax1.axvline(0, color=LIGHT_TEXT, linewidth=0.9)
for i, (a, b) in enumerate(zip(balance["pct_gap_synthetic"], balance["pct_gap_average"])):
    ax1.text(max(a, 0) + 0.5, i - h / 2, f"{signed(a, 1)}%", va="center",
             fontsize=10, color=WHITE_TEXT)
    ax1.text(max(b, 0) + 0.5, i + h / 2, f"{signed(b, 1)}%", va="center",
             fontsize=10, color=WHITE_TEXT)
ax1.set_yticks(yy)
ax1.set_yticklabels([LABELS[c] for c in COVARIATES], fontsize=12)
ax1.invert_yaxis()
ax1.set_xlim(-5, 32)
ax1.set_xlabel("Difference from California (percent)", fontsize=12)
ax1.set_title("(a) Predictor balance", fontsize=13, fontweight="bold", pad=10)
ax1.legend(loc="lower right", fontsize=10)
ax2.barh(yy - h / 2, v_ml, height=h, color=STEEL_BLUE, label="mlsynth")
ax2.barh(yy + h / 2, STATA_V, height=h, color=GOLD, label="Stata")
for i, (a, b) in enumerate(zip(v_ml, STATA_V)):
    ax2.text(a + 0.008, i - h / 2, f"{a:.3f}", va="center", fontsize=10, color=WHITE_TEXT)
    ax2.text(b + 0.008, i + h / 2, f"{b:.3f}", va="center", fontsize=10, color=WHITE_TEXT)
ax2.set_xlim(0, 0.7)
ax2.set_xlabel("Weight in the diagonal of V", fontsize=12)
ax2.set_title("(b) Predictor weights V", fontsize=13, fontweight="bold", pad=10)
ax2.legend(loc="lower right", fontsize=10)
fig.suptitle("Predictor balance of synthetic California and the predictor weights V",
             fontsize=14, fontweight="bold", color=WHITE_TEXT)
plt.tight_layout()
save_figure(fig, "sc101_balance.png")

weights_csv = pd.DataFrame({"state": DONORS,
                            "weight_mlsynth": [res.donor_weights.get(s, 0.0) for s in DONORS],
                            "weight_stata": [STATA_W.get(s, 0.0) for s in DONORS]})
predictor_weights_csv = pd.DataFrame({"predictor": COVARIATES,
                                      "label": [LABELS[c] for c in COVARIATES],
                                      "v_mlsynth": v_ml, "v_stata": STATA_V})


# ── Section 5: Exact Stata recomputations ───────────────────────────────────

section(5, "Exact Stata recomputations")
# (a) By hand: synthetic California with the rounded Stata weights
synth_sw = Y_MAT @ w_stata
gap_sw = ca_sales - synth_sw
att_sw = float(gap_sw[T0:].mean())
ssr_sw = float(np.sum(gap_sw[:T0] ** 2))
rmse_sw = float(np.sqrt(ssr_sw / T0))
r2_sw = 1 - ssr_sw / float(np.sum((synth_sw[:T0] - synth_sw[:T0].mean()) ** 2))
print("Synthetic California rebuilt by hand with the Stata weights:")
print(f"  ATT {att_sw:.6f} (Stata e(att) {STATA_ATT:.6f})")
print(f"  Pre-period RMSE {rmse_sw:.5f} (Stata prints {STATA_RMSE:.5f})")
print(f"  R-squared, Stata definition {r2_sw:.8f} (Stata e(r2) {STATA_R2:.8f})")
print(f"  Synthetic predictors: {np.round(synth_x_stata_w, 4).tolist()}")
check("ATT with the Stata W, rebuilt by hand", att_sw, STATA_ATT, 5e-5, stata=True)
check("Max |diff| of the 12 gaps with the Stata W",
      float(np.max(np.abs(gap_sw[T0:] - np.array(STATA_GAPS)))), 0, 5e-5, stata=True)
check("Max |diff| of synthetic predictors with the Stata W",
      float(np.max(np.abs(synth_x_stata_w - np.array(STATA_SYNTHETIC)))), 0, 5e-5,
      stata=True)
check("R-squared (Stata definition) with the Stata W", r2_sw, STATA_R2, 5e-6, stata=True)
score_note("Pre-period RMSE with the Stata W", STATA_RMSE, rmse_sw)

# (b) The same weights through mlsynth: oracle_weights (outcome-only config,
# because oracle_weights with covariates fails in mlsynth 1.0.0)
res_oracle = VanillaSC({**base_config(panel), "oracle_weights": STATA_W,
                        "inference": False}).fit()
gap_oracle = np.asarray(res_oracle.gap, dtype=float)
print("\nmlsynth with oracle_weights set to the Stata weights:")
print(f"  method {res_oracle.method_details.method_name}, ATT {res_oracle.att:.6f}")
print(f"  gaps 1989–2000: {np.round(gap_oracle[T0:], 4).tolist()}")
check("ATT with oracle_weights", res_oracle.att, STATA_ATT, 5e-5, stata=True)
check("Max |diff| of the 12 gaps with oracle_weights",
      float(np.max(np.abs(gap_oracle[T0:] - np.array(STATA_GAPS)))), 0, 5e-5)
check("oracle_weights path equals the hand recomputation",
      float(np.max(np.abs(gap_oracle - gap_sw))), 0, 1e-9)


# ── Section 6: In-space placebo tests ───────────────────────────────────────

section(6, "In-space placebo tests")
# (a) The built-in test: California is left out of every placebo pool and
# the statistic is the post-to-pre RMSPE ratio
res_builtin = fit_sc(panel, inference=True)
assert res_builtin.inference is not None, "an unknown inference mode is ignored silently"
inf = res_builtin.inference
builtin = {"p_value": float(inf.p_value), "rank": int(inf.details["rank"]),
           "n_placebos": int(inf.details["n_placebos"]),
           "rmspe_ratio": float(inf.details["treated_rmspe_ratio"])}
print(f"Built-in placebo ({inf.method}):")
print(f"  RMSPE ratio of California {builtin['rmspe_ratio']:.4f}; "
      f"rank {builtin['rank']} of {builtin['n_placebos'] + 1}; "
      f"p = {builtin['p_value']:.4f}")
check("Built-in placebo: rank of California", builtin["rank"], 1, 0)
check("Built-in placebo: number of placebo fits", builtin["n_placebos"], 38, 0)
check("Built-in placebo: p-value", builtin["p_value"], 1 / 39, 1e-12)

# (b) The synth2 design: a loop that keeps California in every placebo pool
placebo, placebo_fits = placebo_in_space(panel, STATES)
gaps = {s: np.asarray(r.gap, dtype=float) for s, r in placebo_fits.items()}
stata_pl = pd.DataFrame(STATA_PLACEBO, columns=["unit", "stata_pre_mspe",
                                                "stata_post_mspe", "stata_ratio",
                                                "stata_pre_rel"]).set_index("unit")
placebo = placebo.join(stata_pl)
placebo["kept_cut2"] = placebo["pre_rel"] <= CUTOFF
placebo["stata_kept_cut2"] = placebo["stata_pre_rel"] <= CUTOFF
ca_ratio = float(placebo.loc[TREATED, "ratio"])
_, p_all = placebo_pvalue(placebo)
print("\nPlacebo loop with California in every donor pool (sorted by MSPE ratio):")
print(placebo[["pre_mspe", "post_mspe", "ratio", "pre_rel", "rank", "kept_cut2",
               "stata_ratio", "stata_pre_rel"]].round(4).to_string())
print(f"\nMSPE ratio of California: {ca_ratio:.4f} (Stata {STATA_PLACEBO[0][3]:.4f}, "
      "from its refit of the baseline)")
check("Placebo loop: rank of California among 39", int(placebo.loc[TREATED, "rank"]),
      1, 0, stata=True)
check("Placebo loop: p-value over 39 units", p_all, STATA_P_ALL, 5e-4, stata=True)
check("Placebo loop: p equals 1/39 exactly", p_all, 1 / 39, 1e-12)
score_note("MSPE ratio of California", STATA_PLACEBO[0][3], ca_ratio)
score_note("Pre-period MSPE of California", STATA_PLACEBO[0][1], pre_mspe)

keep, p_cut = placebo_pvalue(placebo, CUTOFF)
n_kept = len(keep)
kept_set = sorted(keep.index)
stata_kept = sorted(stata_pl.index[stata_pl["stata_pre_rel"] <= CUTOFF])
print(f"\ncut({CUTOFF}): {n_kept} units kept, p = {p_cut:.4f} "
      f"(Stata: {len(stata_kept)} units, p = {STATA_P_CUT:.4f})")
print(f"Kept: {', '.join(kept_set)}")
if kept_set == stata_kept:
    print("The retained set is identical to the 20 states that Stata keeps.")
else:
    print(f"Only in mlsynth: {sorted(set(kept_set) - set(stata_kept))}")
    print(f"Only in Stata:   {sorted(set(stata_kept) - set(kept_set))}")
near = placebo[(placebo["pre_rel"] > 1.8) & (placebo["pre_rel"] < 2.2)]
print("States near the cutoff (pre_rel between 1.8 and 2.2):")
print(near[["pre_rel", "kept_cut2"]].round(4).to_string())
check(f"cut({CUTOFF}): number of units kept", n_kept, (19, 22), 0, stata=True,
      stata_value=len(stata_kept))
check(f"cut({CUTOFF}): rank of California among kept",
      int((keep["ratio"] >= ca_ratio).sum()), 1, 0)
check(f"cut({CUTOFF}): p-value", p_cut, STATA_P_CUT, 0.01, stata=True)

pw = pointwise_pvalues(keep.index, gaps, YEARS)
pw["stata_p_two"] = STATA_P_TWO
pw["stata_p_right"] = STATA_P_RIGHT
pw["stata_p_left"] = STATA_P_LEFT
p_min = 1 / n_kept
n_left_min = int((np.rint(pw["p_left"] * n_kept) == 1).sum())
n_two_min = int((np.rint(pw["p_two"] * n_kept) == 1).sum())
stata_left_min = int(sum(abs(p - 0.05) < 1e-9 for p in STATA_P_LEFT))
stata_two_min = int(sum(abs(p - 0.05) < 1e-9 for p in STATA_P_TWO))
print(f"\nPointwise p-values at cut({CUTOFF}) (smallest attainable p = {p_min:.4f}):")
print(pw.round(4).to_string(index=False))
print(f"Years with the left-sided p at its minimum: {n_left_min} of 12 "
      f"(Stata {stata_left_min} of 12)")
print(f"Years with the two-sided p at its minimum: {n_two_min} of 12 "
      f"(Stata {stata_two_min} of 12)")
print("Right-sided p-values range from "
      f"{pw['p_right'].min():.2f} to {pw['p_right'].max():.2f}; the effect is "
      "negative, so the left-sided test is the relevant one.")
check("Left-sided p at most 0.10 in every post year",
      float(pw["p_left"].max()), (0, 0.10), 0)
score_note("Years with left-sided p at its minimum", stata_left_min, n_left_min)
score_note("Years with two-sided p at its minimum", stata_two_min, n_two_min)

# Every cutoff that the lab offers
cut_results = []
for c in CUTOFFS:
    keep_c, p_c = placebo_pvalue(placebo, c)
    pw_c = pointwise_pvalues(keep_c.index, gaps, YEARS)
    n_c = len(keep_c)
    left_min_years = pw_c.loc[np.rint(pw_c["p_left"] * n_c) == 1, "year"].tolist()
    cut_results.append({
        "cutoff": c, "label": "none" if c is None else f"{c:g}",
        "n_kept": n_c, "rank": int((keep_c["ratio"] >= ca_ratio).sum()), "p": p_c,
        "n_left_min": len(left_min_years), "left_min_years": left_min_years,
        "excluded": [s for s in STATES if s not in keep_c.index],
        "pointwise": {"two": pw_c["p_two"].tolist(), "right": pw_c["p_right"].tolist(),
                      "left": pw_c["p_left"].tolist()}})
print("\nResults by cutoff (lab tab 'cutoff'):")
print("  cutoff  kept  rank       p  left-min years")
for r in cut_results:
    print(f"  {r['label']:>6} {r['n_kept']:>5} {r['rank']:>5} {r['p']:>7.4f} "
          f"{r['n_left_min']:>15}")

# Figure 7: MSPE ratios of the 39 states
fig, ax = plt.subplots(figsize=(10, 11))
fig.patch.set_linewidth(0)
units = placebo.index.tolist()
colors = [WARM_ORANGE if u == TREATED else (STEEL_BLUE if placebo.loc[u, "kept_cut2"]
          else GREY_DONOR) for u in units]
yy = np.arange(len(units))
ax.set_axisbelow(True)
ax.barh(yy, placebo["ratio"], color=colors, height=0.72)
for i, u in enumerate(units):
    ax.text(placebo.loc[u, "ratio"] + 1.2, i, f"{placebo.loc[u, 'ratio']:.1f}",
            va="center", fontsize=9, color=WHITE_TEXT if u == TREATED else LIGHT_TEXT)
ax.set_yticks(yy)
ax.set_yticklabels(units, fontsize=10)
ax.invert_yaxis()
ax.set_xlim(0, 145)
ax.set_xlabel("Post-period MSPE divided by pre-period MSPE", fontsize=12)
ax.set_title("In-space placebo test: MSPE ratios of the 39 states",
             fontsize=14, fontweight="bold", pad=12)
ax.legend(handles=[mpatches.Patch(color=WARM_ORANGE, label="California"),
                   mpatches.Patch(color=STEEL_BLUE, label=f"Placebo states kept by cut({CUTOFF})"),
                   mpatches.Patch(color=GREY_DONOR, label=f"Placebo states removed by cut({CUTOFF})")],
          loc="lower right", fontsize=11)
plt.tight_layout()
save_figure(fig, "sc101_placebo_ratios.png")

# Figure 8: gaps of California and the retained placebo states
fig, ax = plt.subplots(figsize=(11, 6))
fig.patch.set_linewidth(0)
for s in keep.index:
    if s != TREATED:
        ax.plot(YEARS, gaps[s], color=GREY_DONOR, linewidth=1.2, alpha=0.95, zorder=1)
ax.plot([], [], color=GREY_DONOR, linewidth=1.4,
        label=f"Placebo states kept by cut({CUTOFF}) ({n_kept - 1})")
ax.plot(YEARS, gaps[TREATED], color=WARM_ORANGE, linewidth=3.0,
        label="California", zorder=3)
ax.axhline(0, color=LIGHT_TEXT, linewidth=0.9)
ax.axvline(TREAT_YEAR, color=LIGHT_TEXT, linestyle=":", linewidth=1.5)
ax.set_xlim(FIRST_YEAR - 0.5, LAST_YEAR + 0.5)
ax.set_ylim(-40, 40)
ax.set_xlabel("Year", fontsize=12)
ax.set_ylabel("Gap (packs per capita)", fontsize=12)
ax.set_title(f"Gaps of California and the {n_kept - 1} retained placebo states",
             fontsize=14, fontweight="bold", pad=12)
ax.legend(loc="lower left", fontsize=11)
plt.tight_layout()
save_figure(fig, "sc101_placebo_gaps.png")

# Figure 9: pointwise p-values by year
fig, axes = plt.subplots(1, 3, figsize=(15, 5.2), sharey=True)
fig.patch.set_linewidth(0)
panels = [("p_two", "stata_p_two", "Two-sided", STEEL_BLUE),
          ("p_right", "stata_p_right", "Right-sided", LIGHT_ORANGE),
          ("p_left", "stata_p_left", "Left-sided", TEAL)]
for ax, (col, scol, title, color) in zip(axes, panels):
    ax.axhline(0.05, color=WARM_ORANGE, linestyle="--", linewidth=1.3, label="p = 0.05")
    ax.axhline(0.10, color=LIGHT_TEXT, linestyle=":", linewidth=1.3, label="p = 0.10")
    ax.plot(pw["year"], pw[col], color=color, marker="o", markersize=7,
            linewidth=2, label="mlsynth", zorder=3)
    ax.plot(pw["year"], pw[scol], linestyle="none", marker="o", markersize=12,
            markerfacecolor="none", markeredgecolor=GOLD, markeredgewidth=1.6,
            label="Stata", zorder=4)
    ax.set_title(title, fontsize=13, fontweight="bold", pad=10)
    ax.set_xlabel("Year", fontsize=12)
    ax.set_xticks([1990, 1993, 1996, 1999])
    ax.set_ylim(-0.03, 1.05)
axes[0].set_ylabel("Placebo p-value", fontsize=12)
axes[1].legend(handles=[
    Line2D([], [], color=WARM_ORANGE, linestyle="--", linewidth=1.3, label="p = 0.05"),
    Line2D([], [], color=LIGHT_TEXT, linestyle=":", linewidth=1.3, label="p = 0.10"),
    Line2D([], [], color=LIGHT_TEXT, marker="o", markersize=7, linewidth=2,
           label="mlsynth (filled markers)"),
    Line2D([], [], linestyle="none", marker="o", markersize=12, markerfacecolor="none",
           markeredgecolor=GOLD, markeredgewidth=1.6, label="Stata (hollow markers)")],
    loc="center", fontsize=11)
fig.suptitle(f"Pointwise placebo p-values, 1989–2000, with cut({CUTOFF}) "
             f"({n_kept} units)", fontsize=14, fontweight="bold", color=WHITE_TEXT)
plt.tight_layout()
save_figure(fig, "sc101_placebo_pvalues.png")

placebo_mspe_csv = placebo.reset_index().rename(columns={"index": "unit"})
placebo_gaps_csv = pd.DataFrame([{"unit": s, "year": int(t), "gap": g}
                                 for s in STATES for t, g in zip(YEARS, gaps[s])])
placebo_pvalues_csv = pw.copy()


# ── Section 7: In-time placebo test ─────────────────────────────────────────

section(7, "In-time placebo test")
covs85, win85 = in_time_spec(FAKE_YEAR)
print(f"Fake start {FAKE_YEAR}: predictors {covs85}")
print(f"Windows: {win85}")
intime = {}
for F in FAKE_YEARS:
    r = fit_in_time(panel, F)
    g = np.asarray(r.gap, dtype=float)
    k = F - FIRST_YEAR
    intime[F] = {"fit": r, "weights": np.array([r.donor_weights.get(s, 0.0) for s in STATES]),
                 "synthetic": np.asarray(r.counterfactual, dtype=float), "gap": g,
                 "pre_rmspe": rmse_of(g[:k]), "fake_gaps": g[k:T0],
                 "fake_gap_mean": float(g[k:T0].mean()),
                 "post_gap_mean": float(g[T0:].mean())}
it85 = intime[FAKE_YEAR]
w85 = positive_weights(it85["weights"], STATES)
print(f"\nWeights with the fake start in {FAKE_YEAR}: {fmt_weights(w85, 4)}")
fit_span = "–".join(str(y) for y in (FIRST_YEAR, FAKE_YEAR - 1))
fake_span = "–".join(str(y) for y in (FAKE_YEAR, TREAT_YEAR - 1))
print(f"Pre-period RMSE ({fit_span}): {it85['pre_rmspe']:.4f}")
fake = pd.DataFrame({"year": YEARS[FAKE_YEAR - FIRST_YEAR:T0],
                     "actual": ca_sales[FAKE_YEAR - FIRST_YEAR:T0],
                     "synthetic": it85["synthetic"][FAKE_YEAR - FIRST_YEAR:T0],
                     "gap": it85["fake_gaps"], "stata_synthetic": STATA_INTIME_SYNTH,
                     "stata_gap": STATA_INTIME_GAPS})
print(f"Fake post-period, {fake_span}:\n{fake.round(4).to_string(index=False)}")
print(f"Mean fake gap {it85['fake_gap_mean']:.4f} (Stata {np.mean(STATA_INTIME_GAPS):.4f}); "
      f"mean gap 1989–2000 {it85['post_gap_mean']:.4f} "
      f"(Stata {np.mean(STATA_INTIME_POST_GAPS):.4f})")
print(f"The mean fake gap is {abs(it85['fake_gap_mean'] / att):.2f} times the size "
      "of the baseline ATT.")
for t, a, b in zip(fake["year"], fake["gap"], STATA_INTIME_GAPS):
    check(f"In-time {FAKE_YEAR}: gap in {t}", a, b, 0.05, stata=True)
check(f"In-time {FAKE_YEAR}: positive donors are Utah, Connecticut, and Nevada",
      sorted(s for s, v in w85.items() if v > 1e-3)
      == ["Connecticut", "Nevada", "Utah"], True, 0)

print("\nAll fake start years for the lab (tab 'intime'):")
print(f"  {'year':>4} {'pre RMSE':>9} {'fake mean':>10} {'post mean':>10}  weights")
for F in FAKE_YEARS:
    d = intime[F]
    print(f"  {F:>4} {d['pre_rmspe']:>9.4f} {d['fake_gap_mean']:>10.4f} "
          f"{d['post_gap_mean']:>10.4f}  {fmt_weights(positive_weights(d['weights'], STATES))}")

# A fake start in 1984 cannot work: the beer window would end in 1983,
# and beer data begin in 1984
try:
    fit_in_time(panel, 1984)
    error_1984 = {"type": "none", "message": "no error"}
    print("\nUnexpected: the 1984 fit ran")
except MlsynthDataError as err:
    error_1984 = {"type": type(err).__name__, "message": str(err)}
    print(f"\nFake start in 1984: {type(err).__name__}: {err}")
check("A fake start in 1984 raises MlsynthDataError",
      error_1984["type"] == "MlsynthDataError", True, 0)

# The Stata in-time command also prints the reduced specification at 1989
res_reduced = fit_sc(panel, covariates=covs85, windows=win85)
gap_red = np.asarray(res_reduced.gap, dtype=float)
synth_red = np.asarray(res_reduced.counterfactual, dtype=float)
r2_red = 1 - float(np.sum(gap_red[:T0] ** 2)) / float(
    np.sum((synth_red[:T0] - synth_red[:T0].mean()) ** 2))
w_red = positive_weights(np.array([res_reduced.donor_weights.get(s, 0.0) for s in STATES]),
                         STATES)
print(f"\nReduced specification estimated at 1989: RMSE {res_reduced.pre_rmse:.5f} "
      f"(Stata {STATA_REDUCED['rmse']:.5f}); R-squared, Stata definition "
      f"{r2_red:.5f} (Stata {STATA_REDUCED['r2']:.5f}); ATT {res_reduced.att:.4f} "
      f"(Stata {STATA_REDUCED['att']:.4f})")
print(f"Weights: {fmt_weights(w_red)}")
reduced_w_stata = STATA_REDUCED["weights"]
print(f"Stata:   {fmt_weights(reduced_w_stata)}")
check("Reduced specification at 1989: pre-period RMSE", res_reduced.pre_rmse,
      STATA_REDUCED["rmse"], 0.01, stata=True)

# Figure 10: in-time placebo with a fake start in 1985
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.6))
fig.patch.set_linewidth(0)
for ax in (ax1, ax2):
    ax.axvspan(FAKE_YEAR, TREAT_YEAR, color=GRID_LINE, alpha=0.55, zorder=0)
    ax.axvline(FAKE_YEAR, color=GOLD, linestyle="--", linewidth=1.6,
               label=f"Fake start ({FAKE_YEAR})")
    ax.axvline(TREAT_YEAR, color=LIGHT_TEXT, linestyle=":", linewidth=1.6,
               label="Proposition 99 (1989)")
    ax.set_xlim(FIRST_YEAR - 0.5, LAST_YEAR + 0.5)
    ax.set_xlabel("Year", fontsize=12)
ax1.plot(YEARS, ca_sales, color=WARM_ORANGE, linewidth=3.0, label="California")
ax1.plot(YEARS, it85["synthetic"], color=STEEL_BLUE, linewidth=2.6, linestyle="--",
         label=f"Synthetic California (fit to {FAKE_YEAR - 1})")
ax1.set_ylim(30, 140)
ax1.set_ylabel("Cigarette sales (packs per capita)", fontsize=12)
ax1.set_title("(a) Observed and synthetic paths", fontsize=13, fontweight="bold", pad=10)
ax1.legend(loc="lower left", fontsize=10)
ax2.axhline(0, color=LIGHT_TEXT, linewidth=0.9)
ax2.plot(YEARS, it85["gap"], color=TEAL, linewidth=2.6, marker="o", markersize=4,
         label="Gap with the fake start")
ax2.set_ylim(-30, 8)
ax2.set_ylabel("Gap (packs per capita)", fontsize=12)
ax2.set_title("(b) Gap", fontsize=13, fontweight="bold", pad=10)
ax2.legend(loc="lower left", fontsize=10)
fig.suptitle(f"In-time placebo test with a fake start in {FAKE_YEAR}",
             fontsize=14, fontweight="bold", color=WHITE_TEXT)
plt.tight_layout()
save_figure(fig, "sc101_intime_placebo.png")

intime_summary_csv = pd.DataFrame([{
    "fake_year": F, "predictors": " ".join(in_time_spec(F)[0]),
    "pre_rmspe": intime[F]["pre_rmspe"], "fake_gap_mean": intime[F]["fake_gap_mean"],
    "post_gap_mean": intime[F]["post_gap_mean"],
    "weights": fmt_weights(positive_weights(intime[F]["weights"], STATES), 4)}
    for F in FAKE_YEARS])
intime_paths_csv = pd.DataFrame({"year": YEARS, "actual": ca_sales,
                                 **{f"synthetic_{F}": intime[F]["synthetic"] for F in FAKE_YEARS},
                                 **{f"gap_{F}": intime[F]["gap"] for F in FAKE_YEARS}})


# ── Section 8: Leave-one-out ────────────────────────────────────────────────

section(8, "Leave-one-out")
loo_donors = list(w_pos)              # the five positive-weight donors, largest first
loo_fits = leave_one_out(panel, loo_donors)
loo = {}
for d, r in loo_fits.items():
    g = np.asarray(r.gap, dtype=float)
    loo[d] = {"weights": np.array([r.donor_weights.get(s, 0.0) for s in STATES]),
              "synthetic": np.asarray(r.counterfactual, dtype=float), "gap": g,
              "att": float(r.att), "pre_rmse": rmse_of(g[:T0]),
              "gap_1997": float(g[1997 - FIRST_YEAR]), "gap_2000": float(g[-1])}
print(f"  {'dropped':<12} {'ATT':>8} {'gap 1997':>9} {'gap 2000':>9} {'pre RMSE':>9}  new weights")
for d in loo_donors:
    v = loo[d]
    print(f"  {d:<12} {v['att']:>8.4f} {v['gap_1997']:>9.4f} {v['gap_2000']:>9.4f} "
          f"{v['pre_rmse']:>9.4f}  {fmt_weights(positive_weights(v['weights'], STATES))}")
g2000 = {d: loo[d]["gap_2000"] for d in loo_donors}
atts = {d: loo[d]["att"] for d in loo_donors}
g1997 = {d: loo[d]["gap_1997"] for d in loo_donors}
print(f"\nGap in 2000 ranges from {min(g2000.values()):.4f} (without "
      f"{min(g2000, key=g2000.get)}) to {max(g2000.values()):.4f} (without "
      f"{max(g2000, key=g2000.get)}); baseline {gap[-1]:.4f}")
print(f"ATT ranges from {min(atts.values()):.4f} (without {min(atts, key=atts.get)}) "
      f"to {max(atts.values()):.4f} (without {max(atts, key=atts.get)}); baseline {att:.4f}")
print(f"Gap in 1997 ranges from {min(g1997.values()):.4f} to {max(g1997.values()):.4f}")
loo_gaps = np.array([loo[d]["gap"][T0:] for d in loo_donors])
loo_minmax = pd.DataFrame({"year": YEARS[T0:], "mlsynth_min": loo_gaps.min(axis=0),
                           "mlsynth_max": loo_gaps.max(axis=0),
                           "stata_min": STATA_LOO_EFFECT_MIN,
                           "stata_max": STATA_LOO_EFFECT_MAX})
print(f"\nLeave-one-out minimum and maximum gaps:\n{loo_minmax.round(4).to_string(index=False)}")
check("Leave-one-out drops the five positive donors",
      sorted(loo_donors) == sorted(STATA_W), True, 0)
check("Leave-one-out: largest gap in 2000", max(g2000.values()), STATA_LOO_EFFECT_MAX[-1],
      0.05, stata=True)
check("Leave-one-out: smallest gap in 2000", min(g2000.values()), STATA_LOO_EFFECT_MIN[-1],
      1.5, stata=True)
check("Leave-one-out: every gap in 2000 is below -20", max(g2000.values()), (-100, -20), 0)

# Figure 11: leave-one-out synthetic controls
LOO_COLORS = dict(zip(loo_donors, [GOLD, TEAL, LIGHT_ORANGE, LAVENDER, SAGE]))
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.8))
fig.patch.set_linewidth(0)
for ax in (ax1, ax2):
    ax.axvline(TREAT_YEAR, color=LIGHT_TEXT, linestyle=":", linewidth=1.5)
    ax.set_xlim(FIRST_YEAR - 0.5, LAST_YEAR + 0.5)
    ax.set_xlabel("Year", fontsize=12)
ax1.plot(YEARS, ca_sales, color=WARM_ORANGE, linewidth=3.0, label="California", zorder=4)
ax1.plot(YEARS, synth, color=STEEL_BLUE, linewidth=2.6, linestyle="--",
         label="Baseline synthetic", zorder=3)
for d in loo_donors:
    ax1.plot(YEARS, loo[d]["synthetic"], color=LOO_COLORS[d], linewidth=1.4,
             label=f"Without {d}", zorder=2)
ax1.set_ylim(30, 140)
ax1.set_ylabel("Cigarette sales (packs per capita)", fontsize=12)
ax1.set_title("(a) Synthetic California without each donor", fontsize=13,
              fontweight="bold", pad=10)
ax1.legend(loc="lower left", fontsize=10)
ax2.axhline(0, color=LIGHT_TEXT, linewidth=0.9)
ax2.plot(YEARS, gap, color=STEEL_BLUE, linewidth=2.6, label="Baseline gap", zorder=3)
for d in loo_donors:
    ax2.plot(YEARS, loo[d]["gap"], color=LOO_COLORS[d], linewidth=1.4,
             label=f"Without {d}", zorder=2)
ax2.set_ylim(-34, 8)
ax2.set_ylabel("Gap (packs per capita)", fontsize=12)
ax2.set_title("(b) Gaps", fontsize=13, fontweight="bold", pad=10)
ax2.legend(loc="lower left", fontsize=10)
fig.suptitle("Leave-one-out check: dropping each of the five donors in turn",
             fontsize=14, fontweight="bold", color=WHITE_TEXT)
plt.tight_layout()
save_figure(fig, "sc101_leave_one_out.png")

loo_results_csv = pd.DataFrame([{
    "dropped": d, "att": loo[d]["att"], "gap_1997": loo[d]["gap_1997"],
    "gap_2000": loo[d]["gap_2000"], "pre_rmse": loo[d]["pre_rmse"],
    "weights": fmt_weights(positive_weights(loo[d]["weights"], STATES), 4)}
    for d in loo_donors])
loo_paths_csv = pd.DataFrame({"year": YEARS, "actual": ca_sales, "synthetic_baseline": synth,
                              **{f"synthetic_without_{d.replace(' ', '_').lower()}":
                                 loo[d]["synthetic"] for d in loo_donors},
                              **{f"gap_without_{d.replace(' ', '_').lower()}":
                                 loo[d]["gap"] for d in loo_donors}})


# ── Section 9: Replication scorecard ────────────────────────────────────────

section(9, "Replication scorecard (mlsynth versus Stata synth2)")
scorecard = pd.DataFrame(SCORECARD)
with pd.option_context("display.max_colwidth", 60, "display.float_format", "{:.6g}".format):
    print(scorecard.to_string(index=False))
n_pass = int((scorecard["pass"] == "PASS").sum())
n_info = int((scorecard["pass"] == "info").sum())
print(f"\n{n_pass} of {len(scorecard) - n_info} benchmark rows pass; "
      f"{n_info} rows are informative only.")
print("Notes: Stata rounds W to three decimals before it predicts; V is not")
print("identified, so the two V vectors differ; Stata ranks the MSPE ratio and")
print("mlsynth reports the RMSPE ratio; its placebo and leave-one-out commands")
print("refit the baseline first; placebo fits depend on the optimizer seed.")


# ── Section 10: Estimator tour ──────────────────────────────────────────────

section(10, "Estimator tour")
base = base_config(panel)
# (a) Outcome-only VanillaSC: without covariates, backend "auto" resolves to
# the outcome-only quadratic program on all 19 pre-treatment years
res_outcome = VanillaSC({**base, "inference": True}).fit()
assert res_outcome.inference is not None
w_outcome = np.array([res_outcome.donor_weights.get(s, 0.0) for s in STATES])
outcome_rank = int(res_outcome.inference.details["rank"])
print(f"Outcome-only VanillaSC ({res_outcome.method_details.method_name}): "
      f"ATT {res_outcome.att:.4f}, pre RMSE {res_outcome.pre_rmse:.4f}, "
      f"built-in placebo rank {outcome_rank}, p = {res_outcome.inference.p_value:.4f}")
print(f"  weights: {fmt_weights(positive_weights(w_outcome, STATES), 4)}")

# (b) Synthetic difference-in-differences
res_sdid = SDID({**base, "B": 500, "seed": RANDOM_SEED}).fit()
sdid_cf = np.asarray(res_sdid.time_series.counterfactual_outcome, dtype=float)
sdid_inf = res_sdid.inference_detail
print(f"\nSDID: ATT {res_sdid.att:.4f}, pre RMSE {res_sdid.fit_diagnostics.rmse_pre:.4f}, "
      f"placebo SE {sdid_inf.se:.4f}, 95% CI ({sdid_inf.ci[0]:.2f}, {sdid_inf.ci[1]:.2f}), "
      f"p = {sdid_inf.p_value:.4f}")
print("  unit and time weights are not exposed in mlsynth 1.0.0")

# (c) CLUSTERSC with principal component regression (default settings)
res_clus = CLUSTERSC({**base, "method": "pcr"}).fit()
clus_meta = res_clus.pcr.metadata
clus_w = res_clus.pcr.donor_weights
clus_cf = np.asarray(res_clus.counterfactual, dtype=float)
print(f"\nCLUSTERSC (PCR, defaults): ATT {res_clus.att:.4f}, pre RMSE {res_clus.pre_rmse:.4f}")
print(f"  clusters k = {clus_meta['k_clusters']}, rank {clus_meta['rank']}, "
      f"{len(clus_w)} donors in the California cluster, "
      f"{sum(v < 0 for v in clus_w.values())} negative weights, "
      f"sum of weights {sum(clus_w.values()):.4f}")
res_clus_nc = CLUSTERSC({**base, "method": "pcr", "clustering": False}).fit()
print(f"  with clustering=False: ATT {res_clus_nc.att:.4f} "
      f"(rank {res_clus_nc.pcr.metadata['rank']}); defaults matter")

# (d) Two-way fixed effects DiD for reference (exact by two-way demeaning,
# because the panel is balanced)
def two_way_demean(s, data):
    """Remove state and year means from a series of a balanced panel."""
    return (s - s.groupby(data["state"]).transform("mean")
            - s.groupby(data["year"]).transform("mean") + s.mean())


d_tilde = two_way_demean(panel["treated"].astype(float), panel)
y_tilde = two_way_demean(panel["cigsale"], panel)
twfe_att = float((d_tilde * y_tilde).sum() / (d_tilde ** 2).sum())
print(f"\nTWFE DiD (equal weights on all 38 donors): {twfe_att:.4f}")

tour = [
    {"key": "vanillasc_adh", "estimator": "VanillaSC, ADH predictors",
     "call": 'VanillaSC({**base, "covariates": COVARIATES, "backend": "mscmt", ...})',
     "matches": "seven predictors: four covariates and three lagged sales",
     "weight_rule": "simplex (nonnegative, sum to one)",
     "donors": f"{len(w_pos)} of 38 positive", "pre_rmse": pre_rmse,
     "att": att, "gap_2000": float(gap[-1]), "counterfactual": synth,
     "inference": f"built-in placebo rank {builtin['rank']}, p {builtin['p_value']:.4f}"},
    {"key": "vanillasc_outcome", "estimator": "VanillaSC, outcome only",
     "call": 'VanillaSC({**base, "inference": True})',
     "matches": "all 19 pre-treatment outcomes",
     "weight_rule": "simplex (nonnegative, sum to one)",
     "donors": f"{len(positive_weights(w_outcome, STATES))} of 38 positive",
     "pre_rmse": rmse_of(np.asarray(res_outcome.gap)[:T0]), "att": float(res_outcome.att),
     "gap_2000": float(res_outcome.gap[-1]),
     "counterfactual": np.asarray(res_outcome.counterfactual, dtype=float),
     "inference": f"built-in placebo rank {outcome_rank}, "
                  f"p {res_outcome.inference.p_value:.4f}"},
    {"key": "sdid", "estimator": "Synthetic DiD (SDID)",
     "call": 'SDID({**base, "B": 500, "seed": 42})',
     "matches": "pre-treatment outcomes up to a constant, with time weights",
     "weight_rule": "simplex unit and time weights plus an intercept",
     "donors": "not exposed in mlsynth 1.0.0",
     "pre_rmse": rmse_of((ca_sales - sdid_cf)[:T0]), "att": float(res_sdid.att),
     "gap_2000": float(ca_sales[-1] - sdid_cf[-1]), "counterfactual": sdid_cf,
     "inference": f"placebo SE {sdid_inf.se:.4f}, p {sdid_inf.p_value:.4f}"},
    {"key": "clustersc_pcr", "estimator": "CLUSTERSC, PCR",
     "call": 'CLUSTERSC({**base, "method": "pcr"})',
     "matches": "denoised outcomes of the donors in the California cluster",
     "weight_rule": "unconstrained regression weights (negative allowed)",
     "donors": f"{len(clus_w)} in the cluster, {sum(v < 0 for v in clus_w.values())} negative",
     "pre_rmse": rmse_of((ca_sales - clus_cf)[:T0]), "att": float(res_clus.att),
     "gap_2000": float(ca_sales[-1] - clus_cf[-1]), "counterfactual": clus_cf,
     "inference": f"Shen 95% CI ({signed(res_clus.inference.ci_lower)}, "
                  f"{signed(res_clus.inference.ci_upper)})"},
    {"key": "twfe_did", "estimator": "TWFE DiD (reference)",
     "call": "two-way fixed effects regression of cigsale on treated",
     "matches": "average levels of all 38 donors", "weight_rule": "equal weights",
     "donors": "38 equal", "pre_rmse": None, "att": twfe_att, "gap_2000": None,
     "counterfactual": None, "inference": "none (one treated cluster)"},
]
tour_tab = pd.DataFrame([{k: v for k, v in t.items() if k != "counterfactual"} for t in tour])
print("\nEstimator tour:")
print(tour_tab[["estimator", "donors", "pre_rmse", "att", "gap_2000"]].round(4)
      .fillna("n/a").to_string(index=False))
print("The outcome-only fit has the lowest RMSE among the simplex fits, yet its"
      " placebo rank is 3, not 1: a lower RMSE is not more credible.")
check("Tour: SDID pre RMSE uses the level-adjusted counterfactual",
      rmse_of((ca_sales - sdid_cf)[:T0]), res_sdid.fit_diagnostics.rmse_pre, 1e-9)
check("Tour: CLUSTERSC pre RMSE matches its counterfactual",
      rmse_of((ca_sales - clus_cf)[:T0]), res_clus.pre_rmse, 1e-9)
check("Tour: outcome-only ATT", res_outcome.att, -19.5136, 5e-4)
check("Tour: outcome-only placebo rank", outcome_rank, 3, 0)
check("Tour: SDID ATT", res_sdid.att, -15.6054, 5e-4)
check("Tour: CLUSTERSC ATT", res_clus.att, -21.3941, 5e-4)
check("Tour: TWFE DiD", twfe_att, -27.3491, 5e-4)
check("TWFE DiD equals the 2x2 means DiD", twfe_att, did_means, 1e-9)

# Figure 12: estimator tour
TOUR_COLORS = {"vanillasc_adh": STEEL_BLUE, "vanillasc_outcome": TEAL,
               "sdid": GOLD, "clustersc_pcr": LAVENDER, "twfe_did": GREY_DONOR}
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.8),
                               gridspec_kw={"width_ratios": [1.35, 1]})
fig.patch.set_linewidth(0)
ax1.axvline(TREAT_YEAR, color=LIGHT_TEXT, linestyle=":", linewidth=1.5)
ax1.plot(YEARS, ca_sales, color=WARM_ORANGE, linewidth=3.0, label="California", zorder=5)
for t in tour[:4]:
    ax1.plot(YEARS, t["counterfactual"], color=TOUR_COLORS[t["key"]], linewidth=2.0,
             linestyle="--", label=t["estimator"], zorder=3)
ax1.set_xlim(FIRST_YEAR - 0.5, LAST_YEAR + 0.5)
ax1.set_ylim(30, 140)
ax1.set_xlabel("Year", fontsize=12)
ax1.set_ylabel("Cigarette sales (packs per capita)", fontsize=12)
ax1.set_title("(a) Observed and counterfactual paths", fontsize=13,
              fontweight="bold", pad=10)
ax1.legend(loc="lower left", fontsize=10)
yy = np.arange(len(tour))
for i, t in enumerate(tour):
    hollow = t["key"] == "twfe_did"
    ax2.plot(t["att"], i, marker="o", markersize=12, linestyle="none",
             color=TOUR_COLORS[t["key"]], markerfacecolor="none" if hollow else TOUR_COLORS[t["key"]],
             markeredgewidth=2)
    ax2.text(t["att"] + 1.0, i, signed(t["att"]), fontsize=11, color=WHITE_TEXT,
             va="center")
ax2.axvline(0, color=LIGHT_TEXT, linewidth=0.9)
ax2.set_yticks(yy)
ax2.set_yticklabels([t["estimator"] for t in tour], fontsize=11)
ax2.set_ylim(len(tour) - 0.5, -0.5)
ax2.set_xlim(-31, 2)
ax2.set_xlabel("ATT, 1989–2000 (packs per capita)", fontsize=12)
ax2.set_title("(b) Average effect on California", fontsize=13, fontweight="bold", pad=10)
fig.suptitle("One case, four synthetic control estimators, and a DiD reference",
             fontsize=14, fontweight="bold", color=WHITE_TEXT)
plt.tight_layout()
save_figure(fig, "sc101_estimator_tour.png")


# ── Section 11: Exercise answers ────────────────────────────────────────────

section(11, "Exercise answers")
# Exercise 1: read the result object
print("Exercise 1: the result object")
print(f"  res.att = {res.att:.4f}; res.effects.att_percent = {res.effects.att_percent:.2f}")
print(f"  res.fit_diagnostics.rmse_pre = {res.fit_diagnostics.rmse_pre:.4f}; "
      f"r_squared_pre = {res.fit_diagnostics.r_squared_pre:.4f}")
print(f"  res.weights.summary_stats['n_donors'] = {res.weights.summary_stats['n_donors']} "
      "(positive donors only)")
print(f"  len(res.additional_outputs['donor_names']) = "
      f"{len(res.additional_outputs['donor_names'])} (the whole pool)")
print(f"  res.time_series.intervention_time = {res.time_series.intervention_time}")
check("Exercise 1: n_donors counts the positive donors", res.weights.summary_stats["n_donors"],
      5, 0)

# Exercise 2: rebuild synthetic California by hand
synth_hand = Y_MAT @ w_ml
att_hand = float((ca_sales - synth_hand)[T0:].mean())
print("\nExercise 2: synthetic California by hand")
print(f"  max |hand - mlsynth| = {np.max(np.abs(synth_hand - synth)):.2e}; "
      f"ATT by hand {att_hand:.4f}; ATT with the Stata W {att_sw:.4f}")
check("Exercise 2: hand rebuild equals the mlsynth counterfactual",
      float(np.max(np.abs(synth_hand - synth))), 0, 1e-9)
check("Exercise 2: ATT with the Stata W", att_sw, -19.0018, 5e-5)

# Exercise 3: drop beer and age15to24
covs_ex3 = [c for c in COVARIATES if c not in ("beer", "age15to24")]
res_ex3 = fit_sc(panel, covariates=covs_ex3, windows={c: WINDOWS[c] for c in covs_ex3})
w_ex3 = positive_weights(np.array([res_ex3.donor_weights.get(s, 0.0) for s in STATES]), STATES)
v_ex3 = res_ex3.weights.summary_stats["predictor_weights"]
print("\nExercise 3: without beer and age15to24")
print(f"  ATT {res_ex3.att:.4f}; pre RMSE {res_ex3.pre_rmse:.4f}; weights {fmt_weights(w_ex3)}")
print(f"  largest V entry: {max(v_ex3, key=v_ex3.get)} ({max(v_ex3.values()):.4f})")
check("Exercise 3: ATT without beer and age15to24", res_ex3.att, -17.5629, 0.01)

# Exercise 4: cut(5)
keep5, p5 = placebo_pvalue(placebo, 5)
removed5 = [s for s in STATES if s not in keep5.index]
print(f"\nExercise 4: cut(5) keeps {len(keep5)} units, p = {p5:.4f}")
print(f"  removed: {', '.join(removed5)}")
check("Exercise 4: units kept by cut(5)", len(keep5), (29, 33), 0)

# Exercise 5: TWFE DiD with statsmodels, standard errors clustered by state
twfe = smf.ols("cigsale ~ treated + C(state) + C(year)", data=panel).fit(
    cov_type="cluster", cov_kwds={"groups": pd.factorize(panel["state"])[0]})
print(f"\nExercise 5: TWFE coefficient {twfe.params['treated']:.4f}, "
      f"clustered SE {twfe.bse['treated']:.4f} (one treated cluster: unreliable)")
check("Exercise 5: statsmodels TWFE equals the demeaned estimate",
      twfe.params["treated"], twfe_att, 1e-8)

# Exercise 6: feed the Stata V into the inner problem
x_sd = X.std(ddof=1)                               # SD of each predictor across 39 states
x1 = (X.loc[TREATED] / x_sd).to_numpy()
x0 = (X.loc[DONORS] / x_sd).to_numpy()             # 38 x 7
v_stata = np.array(STATA_V)


def inner_loss(w):
    """Weighted distance between California and the synthetic predictors."""
    diff = x1 - x0.T @ w
    return float(diff @ (v_stata * diff))


sol = minimize(inner_loss, np.full(len(DONORS), 1 / len(DONORS)), method="SLSQP",
               bounds=[(0, 1)] * len(DONORS),
               constraints=[{"type": "eq", "fun": lambda w: w.sum() - 1}],
               options={"ftol": 1e-14, "maxiter": 1000})
w_ex6 = dict(sorted(((s, float(v)) for s, v in zip(DONORS, sol.x) if v > 1e-4),
                    key=lambda kv: -kv[1]))
print(f"\nExercise 6: SLSQP with the Stata V ({sol.message})")
print(f"  recovered W: {fmt_weights(w_ex6, 4)}")
print(f"  Stata W:     {fmt_weights(STATA_W, 4)}")
for s in STATA_W:
    check(f"Exercise 6: recovered weight of {s}", w_ex6.get(s, 0.0), STATA_W[s], 0.001)


# ── Section 12: Exports ─────────────────────────────────────────────────────

section(12, "Exports")


def clean(obj):
    """Convert numpy types to plain Python types and reject NaN or infinity."""
    if isinstance(obj, dict):
        return {str(k): clean(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [clean(v) for v in obj]
    if isinstance(obj, (pd.Series, pd.Index)):
        return clean(obj.to_numpy())
    if isinstance(obj, np.ndarray):
        return [clean(v) for v in obj.tolist()]
    if isinstance(obj, (bool, np.bool_)):
        return bool(obj)
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    if isinstance(obj, (float, np.floating)):
        value = float(obj)
        assert np.isfinite(value), "non-finite number in the results"
        return value
    return obj


def to_json_text(obj, level=0):
    """Serialize with one line per list of scalars (compact and diff friendly)."""
    pad, inner = " " * level, " " * (level + 1)
    if isinstance(obj, dict):
        if not obj:
            return "{}"
        body = ",\n".join(f"{inner}{json.dumps(k, ensure_ascii=False)}: "
                          f"{to_json_text(v, level + 1)}" for k, v in obj.items())
        return "{\n" + body + "\n" + pad + "}"
    if isinstance(obj, list) and any(isinstance(v, (dict, list)) for v in obj):
        body = ",\n".join(inner + to_json_text(v, level + 1) for v in obj)
        return "[\n" + body + "\n" + pad + "]"
    return json.dumps(obj, allow_nan=False, ensure_ascii=False)


def path_stats(w):
    """Statistics of the synthetic path implied by a weight vector over STATES."""
    g = ca_sales - Y_MAT @ np.asarray(w, dtype=float)
    pre, post = mspe(g)
    return {"pre_rmspe": float(np.sqrt(pre)), "att": float(g[T0:].mean()),
            "gap_2000": float(g[-1]), "ratio": post / pre,
            "rmspe_ratio": float(np.sqrt(post / pre))}


def round_tour(entry, nd=10):
    """Round the numbers of a tour entry to ten decimals.

    The SDID fit of mlsynth can differ in the last bit between runs, and the
    rounding keeps sc101_results.json identical from one run to the next.
    """
    out = {}
    for key, value in entry.items():
        if isinstance(value, np.ndarray):
            out[key] = [round(float(v), nd) for v in value]
        elif isinstance(value, (float, np.floating)):
            out[key] = round(float(value), nd)
        else:
            out[key] = value
    return out


def one_hot(state):
    """Weight vector that puts all weight on one state."""
    return np.array([1.0 if s == state else 0.0 for s in STATES])


w_equal_five = np.array([0.2 if s in STATA_W else 0.0 for s in STATES])
w_avg38 = np.array([0.0 if s == TREATED else 1 / 38 for s in STATES])
w_utah_zero = np.where(np.array(STATES) == "Utah", 0.0, w_ml)
w_utah_zero = w_utah_zero / w_utah_zero.sum()
presets = [("mlsynth", "mlsynth fit", w_ml), ("stata", "Stata W", w_stata),
           ("outcome", "Outcome-only fit", w_outcome),
           ("equal_five", "Equal fifths on the five donors", w_equal_five),
           ("utah_only", "Utah only", one_hot("Utah")),
           ("montana_only", "Montana only", one_hot("Montana")),
           ("avg38", "All 38 donors, equal weights", w_avg38),
           ("utah_zero", "Utah set to zero, rest renormalized", w_utah_zero)]
print("Mixer presets (lab tab 'mixer'):")
print(f"  {'preset':<14} {'pre RMSPE':>9} {'ATT':>9} {'gap 2000':>9} {'ratio':>9}")
mixer = []
for key, label, w in presets:
    st = path_stats(w)
    mixer.append({"key": key, "label": label, "weights": w, **st})
    print(f"  {key:<14} {st['pre_rmspe']:>9.4f} {st['att']:>9.4f} {st['gap_2000']:>9.4f} "
          f"{st['ratio']:>9.2f}")

placebo_units = []
for s in STATES:
    r = placebo_fits[s]
    placebo_units.append({
        "state": s, "weights": [r.donor_weights.get(u, 0.0) for u in STATES],
        "gap": gaps[s], "pre_mspe": placebo.loc[s, "pre_mspe"],
        "post_mspe": placebo.loc[s, "post_mspe"], "ratio": placebo.loc[s, "ratio"],
        "pre_rel": placebo.loc[s, "pre_rel"], "rank": int(placebo.loc[s, "rank"]),
        "kept_cut2": bool(placebo.loc[s, "kept_cut2"])})

loo_extremes = {"min_gap_2000_state": min(g2000, key=g2000.get),
                "max_gap_2000_state": max(g2000, key=g2000.get),
                "min_att_state": min(atts, key=atts.get),
                "max_att_state": max(atts, key=atts.get)}

results = {
    "meta": {
        "slug": "python_sc101",
        "title": "Introduction to the Synthetic Control Method in Python with mlsynth",
        "generated_by": "script.py",
        "versions": {**VERSIONS, "mlsynth_build": BUILD},
        "data_url": DATA_URL, "data_file": str(LOCAL_CSV),
        "outcome": "cigsale", "outcome_label": "Cigarette sales (packs per capita)",
        "treated": TREATED, "treated_index": CA, "treat_year": TREAT_YEAR,
        "first_year": FIRST_YEAR, "last_year": LAST_YEAR, "t0": T0,
        "t1": LAST_YEAR - TREAT_YEAR + 1, "seed": RANDOM_SEED, "backend": "mscmt",
        "canonical_v": "min.loss.w", "predictors": COVARIATES,
        "predictor_labels": [LABELS[c] for c in COVARIATES],
        "windows": {c: list(WINDOWS[c]) for c in COVARIATES},
        "cutoff_default": CUTOFF, "fake_year_default": FAKE_YEAR,
        "notes": {
            "arrays": "Arrays over states follow the order of states; arrays over years cover 1970–2000.",
            "ratio": "The ratio is the post-period MSPE divided by the pre-period MSPE.",
            "pre_rel": "The pre_rel value is the pre-period MSPE of a unit divided by that of California.",
            "p_values": "Placebo p-values count California in the numerator and the denominator.",
            "precision": "Numbers keep full float64 precision, except the tour entries, "
                         "which are rounded to ten decimals; round them only for display."},
    },
    "states": STATES,
    "years": YEARS,
    "cigsale": [Y[s].to_numpy() for s in STATES],
    "baseline": {
        "weights": w_ml, "synthetic": synth, "gap": gap, "att": att,
        "att_percent": float(res.effects.att_percent), "gap_2000": float(gap[-1]),
        "gap_2000_percent": float(gap_2000_pct), "pre_rmse": pre_rmse,
        "post_rmse": post_rmse, "r2": r2_conventional,
        "r2_stata_definition": r2_stata_def, "pre_mspe": pre_mspe, "post_mspe": post_mspe,
        "mspe_ratio": mspe_ratio, "rmspe_ratio": rmspe_ratio,
        "v_weights": {"names": COVARIATES, "mlsynth": v_ml, "stata": STATA_V},
        "balance": {"names": COVARIATES, "labels": [LABELS[c] for c in COVARIATES],
                    "treated": bal["treated"], "synthetic": bal["synthetic"],
                    "synthetic_stata_w": synth_x_stata_w,
                    "donor_average": bal["donor_average"],
                    "stata_synthetic": STATA_SYNTHETIC},
        "predictor_means": [X.loc[s].to_numpy() for s in STATES],
        "donor_average_path": donor_avg,
        "builtin_placebo": {**builtin,
                            "design": "California left out of every placebo pool; RMSPE ratio"},
        "stata_w": {"synthetic": synth_sw, "gap": gap_sw, "att": att_sw, "pre_rmse": rmse_sw,
                    "r2_stata_definition": r2_sw, "oracle_att": float(res_oracle.att)},
        "naive": {"california_pre": pre_ca, "california_post": post_ca,
                  "donor_average_pre": pre_avg, "donor_average_post": post_avg,
                  "did_means": did_means},
    },
    "stata": {
        "source": STATA_SOURCE,
        "summarize": {"source": "summarize, log lines 113–122",
                      "n": {c: v[0] for c, v in STATA_SUMMARIZE.items()},
                      "mean": {c: v[1] for c, v in STATA_SUMMARIZE.items()}},
        "baseline": {"source": "synth2 with nested allopt, log lines 433–545 and 632–651",
                     "weights": STATA_W, "att": STATA_ATT, "rmse": STATA_RMSE, "r2": STATA_R2,
                     "synthetic_post": STATA_SYNTH_POST, "gaps": STATA_GAPS,
                     "v_weights": STATA_V, "treated": STATA_TREATED,
                     "synthetic": STATA_SYNTHETIC, "average": STATA_AVERAGE},
        "placebo": {"source": "synth2 placebo(unit cut(2)), log lines 877–1056",
                    "refit": STATA_PLACEBO_REFIT,
                    "table": [{"unit": u, "pre_mspe": a, "post_mspe": b, "ratio": c,
                               "pre_rel": d} for u, a, b, c, d in STATA_PLACEBO],
                    "p_all": STATA_P_ALL, "p_cut": STATA_P_CUT, "n_kept": len(stata_kept),
                    "kept": stata_kept,
                    "pointwise": {"two": STATA_P_TWO, "right": STATA_P_RIGHT,
                                  "left": STATA_P_LEFT}},
        "intime": {"source": "synth2 placebo(period(1985)), log lines 1238–1347",
                   "fake_year": FAKE_YEAR, "fake_synthetic": STATA_INTIME_SYNTH,
                   "fake_gaps": STATA_INTIME_GAPS, "post_gaps": STATA_INTIME_POST_GAPS,
                   "reduced_1989": STATA_REDUCED},
        "loo": {"source": "synth2 loo, log lines 1496–1624", "refit": STATA_LOO_REFIT,
                "effect_min": STATA_LOO_EFFECT_MIN, "effect_max": STATA_LOO_EFFECT_MAX},
    },
    "fits": {"ml": w_ml, "stata": w_stata, "outcome": w_outcome,
             "equal_five": w_equal_five, "utah_only": one_hot("Utah"), "avg38": w_avg38},
    "placebo": {
        "design": "synth2 design: California stays in every placebo donor pool",
        "units": placebo_units, "rank_ca": int(placebo.loc[TREATED, "rank"]),
        "ratio_ca": ca_ratio, "p_all": p_all, "cutoff": CUTOFF, "n_kept": n_kept,
        "kept": kept_set, "p_cut": p_cut, "kept_equals_stata": kept_set == stata_kept,
    },
    "pointwise": {
        "cutoff": CUTOFF, "n_kept": n_kept, "min_p": p_min, "years": pw["year"],
        "gap_ca": pw["gap"], "two": pw["p_two"], "right": pw["p_right"],
        "left": pw["p_left"], "n_left_min": n_left_min, "n_two_min": n_two_min,
        "stata": {"two": STATA_P_TWO, "right": STATA_P_RIGHT, "left": STATA_P_LEFT,
                  "n_left_min": stata_left_min, "n_two_min": stata_two_min},
    },
    "intime": {
        "default": FAKE_YEAR, "fake_years": list(FAKE_YEARS),
        "rule": "Covariates are averaged over 1980 to the year before the fake start; "
                "lagged sales enter only for years before the fake start.",
        "fits": [{"fake_year": F, "predictors": in_time_spec(F)[0],
                  "windows": {c: list(w) for c, w in in_time_spec(F)[1].items()},
                  "weights": intime[F]["weights"], "synthetic": intime[F]["synthetic"],
                  "gap": intime[F]["gap"], "pre_rmspe": intime[F]["pre_rmspe"],
                  "fake_gaps": intime[F]["fake_gaps"],
                  "fake_gap_mean": intime[F]["fake_gap_mean"],
                  "post_gap_mean": intime[F]["post_gap_mean"]} for F in FAKE_YEARS],
        "error_1984": error_1984,
        "reduced_1989": {"weights": [res_reduced.donor_weights.get(s, 0.0) for s in STATES],
                         "pre_rmse": rmse_of(gap_red[:T0]), "r2_stata_definition": r2_red,
                         "att": float(res_reduced.att)},
    },
    "loo": {
        "dropped": loo_donors,
        "fits": [{"dropped": d, "weights": loo[d]["weights"], "synthetic": loo[d]["synthetic"],
                  "gap": loo[d]["gap"], "att": loo[d]["att"], "pre_rmse": loo[d]["pre_rmse"],
                  "gap_1997": loo[d]["gap_1997"], "gap_2000": loo[d]["gap_2000"]}
                 for d in loo_donors],
        "gap_2000_range": [min(g2000.values()), max(g2000.values())],
        "att_range": [min(atts.values()), max(atts.values())],
        "gap_1997_range": [min(g1997.values()), max(g1997.values())],
        **loo_extremes,
    },
    "tour": [round_tour(t) for t in tour],
    "lab_scenarios": {
        "mixer": {"presets": mixer, "default": "mlsynth"},
        "cutoff": {"values": list(CUTOFFS), "default": CUTOFF, "results": cut_results},
        "intime": {"default": FAKE_YEAR, "results": [
            {"fake_year": F, "pre_rmspe": intime[F]["pre_rmspe"],
             "fake_gaps": intime[F]["fake_gaps"], "fake_gap_mean": intime[F]["fake_gap_mean"],
             "post_gap_mean": intime[F]["post_gap_mean"],
             "positive_weights": positive_weights(intime[F]["weights"], STATES)}
            for F in FAKE_YEARS]},
        "loo": {"results": [{"dropped": d, "att": loo[d]["att"], "gap_1997": loo[d]["gap_1997"],
                             "gap_2000": loo[d]["gap_2000"], "pre_rmse": loo[d]["pre_rmse"],
                             "positive_weights": positive_weights(loo[d]["weights"], STATES)}
                            for d in loo_donors],
                "gap_2000_range": [min(g2000.values()), max(g2000.values())],
                "att_range": [min(atts.values()), max(atts.values())], **loo_extremes},
    },
}
results = clean(results)
text = to_json_text(results) + "\n"
assert json.loads(text) == results
json.dumps(results, allow_nan=False)
Path("sc101_results.json").write_text(text, encoding="utf-8")
print(f"\nWrote sc101_results.json ({len(text.encode('utf-8')) // 1024} KB, "
      f"{len(results)} top-level keys: {', '.join(results)})")
if Path("web_app").is_dir():
    Path("web_app/data").mkdir(parents=True, exist_ok=True)
    Path("web_app/data/results.json").write_text(text, encoding="utf-8")
    print("Wrote web_app/data/results.json (identical copy)")

synthetic_path_csv = pd.DataFrame({"year": YEARS, "actual": ca_sales, "synthetic": synth,
                                   "gap": gap, "synthetic_stata_w": synth_sw,
                                   "gap_stata_w": gap_sw, "donor_average": donor_avg})
effects_post_csv = paths_post.copy()
estimator_tour_csv = tour_tab.copy()
stata_benchmark_csv = scorecard.copy()
tables = {
    "descriptive_stats.csv": descriptive_stats, "coverage.csv": coverage,
    "data_prepared.csv": panel, "predictors.csv": predictors_csv,
    "weights.csv": weights_csv, "predictor_weights.csv": predictor_weights_csv,
    "balance.csv": balance, "synthetic_path.csv": synthetic_path_csv,
    "effects_post.csv": effects_post_csv, "placebo_mspe.csv": placebo_mspe_csv,
    "placebo_gaps.csv": placebo_gaps_csv, "placebo_pvalues.csv": placebo_pvalues_csv,
    "intime_summary.csv": intime_summary_csv, "intime_paths.csv": intime_paths_csv,
    "loo_results.csv": loo_results_csv, "loo_paths.csv": loo_paths_csv,
    "estimator_tour.csv": estimator_tour_csv, "stata_benchmark.csv": stata_benchmark_csv,
}
FULL_PRECISION = {"data_prepared.csv", "predictors.csv"}
for name, table in tables.items():
    table.to_csv(name, index=False,
                 float_format=None if name in FULL_PRECISION else "%.8g")
    print(f"Saved: {name} ({table.shape[0]} rows x {table.shape[1]} columns)")

print("\nFigures saved:")
for i, name in enumerate(FIGURES, 1):
    print(f"  {i:>2}. {name}")

n_fail = sum(not c["pass"] for c in CHECKS)
print(f"\nChecks: {len(CHECKS) - n_fail} PASS, {n_fail} FAIL")
if n_fail:
    failed = [c["check"] for c in CHECKS if not c["pass"]]
    raise SystemExit(f"Benchmark checks failed: {failed}")

print("\n=== Script completed successfully ===")
