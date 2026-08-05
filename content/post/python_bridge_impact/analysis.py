"""
Evaluating the Impact of Infrastructure: Difference-in-Differences with the Jamuna Bridge.

A full Python replication of Blankespoor, Emran, Shilpi and Xu (2021), "Bridge to bigpush or
backwash? Market integration, reallocation and productivity effects of Jamuna Bridge in
Bangladesh", Journal of Economic Geography 21(1): 1-33.

The design is a two-group, non-staggered difference-in-differences: the Jamuna hinterland of
northwest Bangladesh is connected to the capital by a bridge that opened in June 1998, while the
Padma hinterland -- an equally isolated region cut off by the other great river -- stays isolated
through 2013 and serves as the comparison. Four data families are analysed: nighttime lights,
Boro rice yield, population census employment shares and density, and DHS/HIES village public
goods. The difference-in-differences estimation runs through the `diff-diff` library, with
pyfixest and a Stata-identical hand-rolled estimator as independent cross-checks.

Usage: python analysis.py

References:
    Paper .............. https://doi.org/10.1093/jeg/lbab028
    diff-diff .......... https://github.com/igerber/diff-diff
    pyfixest ........... https://github.com/py-econometrics/pyfixest
"""

import json
import os
import warnings

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import pyfixest as pf
import scipy.linalg as sla
import statsmodels.api as sm

from diff_diff import (
    DifferenceInDifferences,
    MultiPeriodDiD,
    SurveyDesign,
    check_parallel_trends,
    compute_honest_did,
    equivalence_test_trends,
    placebo_timing_test,
)

warnings.filterwarnings("ignore")
pd.set_option("display.width", 200)
pd.set_option("display.max_columns", 50)

# ── Configuration ─────────────────────────────────────────────────────────────

# Reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# Dark theme palette (consistent with site navbar/dark sections)
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"

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

SLUG = "python_bridge_impact"
RAW_DIR = "referenceMaterials/empirics/data"
DATA_DIR = "data"
FIG = 0  # running figure counter

# Period labels, as the authors coded them (the `year` column is an integer index, not a calendar
# year -- this matters because the controls interact baseline characteristics with that index).
EMP_YEARS = {1: "1991", 2: "2001", 3: "2011"}
NL_YEARS = {1: "1992-94", 2: "1995-97", 3: "1998-00", 4: "2001-04",
            5: "2005-07", 6: "2008-10", 7: "2011-13"}
YLD_YEARS = {1: "1988-91", 2: "1992-94", 3: "1995-97", 4: "1998-00",
             5: "2001-04", 6: "2005-07", 7: "2008-10", 8: "2011-13"}
DHS_YEARS = {1: "1994", 2: "1996", 3: "1997", 4: "2003", 5: "2007", 6: "2011", 7: "2013"}

CONTROLS = ["lpop91_t", "lrainm", "lrainsd", "lmdist_t"]

# The authors' own Stata output (referenceMaterials/empirics/results/*.txt). These are the
# benchmarks the reproduction audit checks against: coefficient, standard error.
# Key: (table, outcome, estimator, term)
STATA = {
    # --- Table 1, mean effect (Employment_mean.txt) ---
    ("T1", "ldensity", "OLS", "mean"): (0.032, 0.015),
    ("T1", "ldensity", "LWDR", "mean"): (0.025, 0.015),
    ("T1", "ldensity", "KOBDR", "mean"): (0.025, 0.015),
    ("T1", "sind", "OLS", "mean"): (-0.010, 0.004),
    ("T1", "sind", "LWDR", "mean"): (-0.009, 0.004),
    ("T1", "sind", "KOBDR", "mean"): (-0.010, 0.004),
    ("T1", "sserv", "OLS", "mean"): (0.017, 0.006),
    ("T1", "sserv", "LWDR", "mean"): (0.022, 0.005),
    ("T1", "sserv", "KOBDR", "mean"): (0.023, 0.005),
    ("T1", "sagr", "OLS", "mean"): (-0.008, 0.007),
    ("T1", "sagr", "LWDR", "mean"): (-0.013, 0.007),
    ("T1", "sagr", "KOBDR", "mean"): (-0.013, 0.007),
    # --- Table 1, yield (Yield_mean.txt) ---
    ("T1", "lyld", "OLS", "mean"): (0.049, 0.031),
    ("T1", "lyld", "LWDR", "mean"): (0.059, 0.026),
    ("T1", "lyld", "KOBDR", "mean"): (0.063, 0.023),
    ("T1", "D_lyld", "OLS", "mean"): (-0.042, 0.085),
    ("T1", "D_lyld", "LWDR", "mean"): (0.049, 0.049),
    ("T1", "D_lyld", "KOBDR", "mean"): (0.053, 0.049),
    # --- Table 1, nightlights (nlite2_mean.txt -- the correct run, see Section 12) ---
    ("T1", "lmn", "OLS", "mean"): (0.088, 0.022),
    ("T1", "lmn", "LWDR", "mean"): (0.106, 0.022),
    ("T1", "lmn", "KOBDR", "mean"): (0.109, 0.022),
    ("T1", "D_lmn", "OLS", "mean"): (0.016, 0.016),
    ("T1", "D_lmn", "LWDR", "mean"): (0.032, 0.016),
    ("T1", "D_lmn", "KOBDR", "mean"): (0.033, 0.016),
    # --- Table 2, short run / long run (Employment_LRSR.txt) ---
    ("T2", "ldensity", "OLS", "SR"): (-0.023, 0.014),
    ("T2", "ldensity", "LWDR", "SR"): (-0.024, 0.014),
    ("T2", "ldensity", "KOBDR", "SR"): (-0.025, 0.014),
    ("T2", "ldensity", "OLS", "LR"): (0.065, 0.016),
    ("T2", "ldensity", "LWDR", "LR"): (0.059, 0.016),
    ("T2", "ldensity", "KOBDR", "LR"): (0.059, 0.016),
    ("T2", "sind", "OLS", "SR"): (-0.006, 0.005),
    ("T2", "sind", "LWDR", "SR"): (-0.006, 0.005),
    ("T2", "sind", "KOBDR", "SR"): (-0.006, 0.005),
    ("T2", "sind", "OLS", "LR"): (-0.012, 0.005),
    ("T2", "sind", "LWDR", "LR"): (-0.012, 0.005),
    ("T2", "sind", "KOBDR", "LR"): (-0.012, 0.005),
    ("T2", "sserv", "OLS", "SR"): (0.017, 0.005),
    ("T2", "sserv", "LWDR", "SR"): (0.020, 0.005),
    ("T2", "sserv", "KOBDR", "SR"): (0.020, 0.005),
    ("T2", "sserv", "OLS", "LR"): (0.018, 0.007),
    ("T2", "sserv", "LWDR", "LR"): (0.024, 0.008),
    ("T2", "sserv", "KOBDR", "LR"): (0.024, 0.008),
    ("T2", "sagr", "OLS", "SR"): (-0.012, 0.006),
    ("T2", "sagr", "LWDR", "SR"): (-0.014, 0.006),
    ("T2", "sagr", "KOBDR", "SR"): (-0.014, 0.006),
    ("T2", "sagr", "OLS", "LR"): (-0.005, 0.008),
    ("T2", "sagr", "LWDR", "LR"): (-0.012, 0.009),
    ("T2", "sagr", "KOBDR", "LR"): (-0.012, 0.009),
    ("T2", "lyld", "OLS", "SR"): (-0.017, 0.030),
    ("T2", "lyld", "LWDR", "SR"): (0.007, 0.027),
    ("T2", "lyld", "KOBDR", "SR"): (0.012, 0.026),
    ("T2", "lyld", "OLS", "LR"): (0.071, 0.027),
    ("T2", "lyld", "LWDR", "LR"): (0.075, 0.026),
    ("T2", "lyld", "KOBDR", "LR"): (0.079, 0.024),
    ("T2", "D_lyld", "OLS", "SR"): (-0.102, 0.097),
    ("T2", "D_lyld", "LWDR", "SR"): (-0.005, 0.079),
    ("T2", "D_lyld", "KOBDR", "SR"): (0.004, 0.079),
    ("T2", "D_lyld", "OLS", "LR"): (-0.039, 0.078),
    ("T2", "D_lyld", "LWDR", "LR"): (0.047, 0.048),
    ("T2", "D_lyld", "KOBDR", "LR"): (0.051, 0.049),
    ("T2", "lmn", "OLS", "SR"): (0.026, 0.018),
    ("T2", "lmn", "LWDR", "SR"): (0.047, 0.018),
    ("T2", "lmn", "KOBDR", "SR"): (0.049, 0.018),
    ("T2", "lmn", "OLS", "LR"): (0.090, 0.023),
    ("T2", "lmn", "LWDR", "LR"): (0.109, 0.023),
    ("T2", "lmn", "KOBDR", "LR"): (0.112, 0.023),
    ("T2", "D_lmn", "OLS", "SR"): (0.004, 0.025),
    ("T2", "D_lmn", "LWDR", "SR"): (0.027, 0.026),
    ("T2", "D_lmn", "KOBDR", "SR"): (0.029, 0.026),
    ("T2", "D_lmn", "OLS", "LR"): (0.015, 0.016),
    ("T2", "D_lmn", "LWDR", "LR"): (0.031, 0.017),
    ("T2", "D_lmn", "KOBDR", "LR"): (0.032, 0.017),
    # --- Table 3, DHS public goods (did_hh.txt) ---
    ("T3", "Electricity", "KOBDR", "SR"): (-0.057, 0.060),
    ("T3", "Electricity", "KOBDR", "LR"): (0.036, 0.047),
    # --- Table 4, heterogeneity by distance band (Employment_het / nlite2_het / Yield_het) ---
    ("T4", "ldensity", "KOBDR", "SR_near"): (-0.037, 0.024),
    ("T4", "ldensity", "KOBDR", "SR_mid"): (-0.071, 0.024),
    ("T4", "ldensity", "KOBDR", "SR_far"): (0.016, 0.017),
    ("T4", "ldensity", "KOBDR", "LR_near"): (0.069, 0.024),
    ("T4", "ldensity", "KOBDR", "LR_mid"): (0.005, 0.029),
    ("T4", "ldensity", "KOBDR", "LR_far"): (0.093, 0.024),
    ("T4", "sind", "KOBDR", "SR_near"): (-0.015, 0.009),
    ("T4", "sind", "KOBDR", "SR_mid"): (0.000, 0.005),
    ("T4", "sind", "KOBDR", "SR_far"): (-0.003, 0.006),
    ("T4", "sind", "KOBDR", "LR_near"): (-0.006, 0.010),
    ("T4", "sind", "KOBDR", "LR_mid"): (-0.025, 0.007),
    ("T4", "sind", "KOBDR", "LR_far"): (-0.001, 0.008),
    ("T4", "sserv", "KOBDR", "SR_near"): (-0.015, 0.010),
    ("T4", "sserv", "KOBDR", "SR_mid"): (0.029, 0.009),
    ("T4", "sserv", "KOBDR", "SR_far"): (0.022, 0.009),
    ("T4", "sserv", "KOBDR", "LR_near"): (-0.026, 0.013),
    ("T4", "sserv", "KOBDR", "LR_mid"): (0.017, 0.012),
    ("T4", "sserv", "KOBDR", "LR_far"): (0.059, 0.016),
    ("T4", "sagr", "KOBDR", "SR_near"): (0.031, 0.011),
    ("T4", "sagr", "KOBDR", "SR_mid"): (-0.029, 0.010),
    ("T4", "sagr", "KOBDR", "SR_far"): (-0.019, 0.010),
    ("T4", "sagr", "KOBDR", "LR_near"): (0.032, 0.015),
    ("T4", "sagr", "KOBDR", "LR_mid"): (0.008, 0.014),
    ("T4", "sagr", "KOBDR", "LR_far"): (-0.057, 0.017),
    ("T4", "lmn", "KOBDR", "SR_near"): (-0.008, 0.024),
    ("T4", "lmn", "KOBDR", "SR_mid"): (0.063, 0.030),
    ("T4", "lmn", "KOBDR", "SR_far"): (0.055, 0.027),
    ("T4", "lmn", "KOBDR", "LR_near"): (0.026, 0.034),
    ("T4", "lmn", "KOBDR", "LR_mid"): (0.149, 0.040),
    ("T4", "lmn", "KOBDR", "LR_far"): (0.102, 0.038),
    ("T4", "D_lmn", "KOBDR", "SR_near"): (-0.015, 0.031),
    ("T4", "D_lmn", "KOBDR", "SR_mid"): (0.043, 0.035),
    ("T4", "D_lmn", "KOBDR", "SR_far"): (0.031, 0.032),
    ("T4", "D_lmn", "KOBDR", "LR_near"): (0.011, 0.024),
    ("T4", "D_lmn", "KOBDR", "LR_mid"): (0.028, 0.025),
    ("T4", "D_lmn", "KOBDR", "LR_far"): (0.038, 0.022),
    ("T4", "lyld", "KOBDR", "SR_near"): (-0.025, 0.019),
    ("T4", "lyld", "KOBDR", "SR_mid"): (0.018, 0.024),
    ("T4", "lyld", "KOBDR", "SR_far"): (0.104, 0.030),
    ("T4", "lyld", "KOBDR", "LR_near"): (0.049, 0.023),
    ("T4", "lyld", "KOBDR", "LR_mid"): (0.065, 0.022),
    ("T4", "lyld", "KOBDR", "LR_far"): (0.265, 0.025),
    ("T4", "D_lyld", "KOBDR", "SR_near"): (-0.028, 0.053),
    ("T4", "D_lyld", "KOBDR", "SR_mid"): (-0.030, 0.063),
    ("T4", "D_lyld", "KOBDR", "SR_far"): (0.227, 0.100),
    ("T4", "D_lyld", "KOBDR", "LR_near"): (0.025, 0.036),
    ("T4", "D_lyld", "KOBDR", "LR_mid"): (0.011, 0.034),
    ("T4", "D_lyld", "KOBDR", "LR_far"): (0.344, 0.091),
}

PRETTY = {
    "lmn": "Log nightlights",
    "D_lmn": "Nightlights growth",
    "lyld": "Log rice yield",
    "D_lyld": "Rice yield growth",
    "ldensity": "Log population density",
    "sind": "Industry empl. share",
    "sserv": "Services empl. share",
    "sagr": "Agriculture empl. share",
    "Electricity": "Access to electricity",
}


def banner(text):
    """Print a section banner to the execution log."""
    print("\n" + "=" * 78)
    print(text)
    print("=" * 78)


def savefig(name, tight=True):
    """Save the current figure with the house dark-theme settings and a numbered filename."""
    global FIG
    FIG += 1
    fname = f"{SLUG}_{FIG:02d}_{name}.png"
    if tight:
        plt.tight_layout()
    plt.savefig(fname, dpi=300, bbox_inches="tight",
                facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0.1)
    plt.close()
    print(f"    figure -> {fname}")
    return fname


# ── Estimation helpers ────────────────────────────────────────────────────────

def independent_columns(X, tol=1e-9):
    """Return the indices of linearly independent columns, scanning left to right.

    Stata silently drops collinear regressors. The heterogeneity specifications deliberately
    include terms that are collinear with the fixed effects (`treat`) or with the year dummies
    (the band-specific post dummies), so we need the same behaviour. Scanning in column order
    -- rather than using pivoted QR, which reorders by magnitude -- guarantees that the
    coefficients we care about are the ones kept.
    """
    keep, basis = [], np.zeros((X.shape[0], 0))
    for j in range(X.shape[1]):
        v = X[:, j]
        if basis.shape[1]:
            v = v - basis @ (basis.T @ v)
        nrm = np.linalg.norm(v)
        if nrm > tol * max(1.0, np.linalg.norm(X[:, j])):
            keep.append(j)
            basis = np.column_stack([basis, v / nrm])
    return keep


def stata_fe(data, y, rhs, unit, time=None, weight=None, cluster=None):
    """Weighted unit fixed-effects regression with Stata's cluster-robust standard errors.

    This is `xtreg y rhs i.time if ..., fe robust cluster(unit)` with `[aw=weight]`. The
    within transformation uses weighted unit means; the degrees-of-freedom correction is
    (N-1)/(N-K) * G/(G-1) with K counting only the non-absorbed regressors. Getting that last
    detail right is what makes the standard errors match the published tables.
    """
    cluster = cluster or unit
    cols = [y] + list(rhs) + [unit, cluster] + ([time] if time else []) + \
           ([weight] if weight else [])
    d = data.dropna(subset=[c for c in dict.fromkeys(cols)]).copy()

    w = np.ones(len(d)) if weight is None else d[weight].to_numpy(float)
    w = w * len(d) / w.sum()                      # Stata normalises aweights to mean one

    Z = d[list(rhs)].astype(float).reset_index(drop=True)
    names = list(rhs)
    if time is not None:
        dums = pd.get_dummies(d[time].astype(int), prefix="t", drop_first=True).astype(float)
        Z = pd.concat([Z, dums.reset_index(drop=True)], axis=1)
        names += list(dums.columns)

    g = d[unit].to_numpy()
    den = pd.Series(w).groupby(g).transform("sum").to_numpy()

    def demean(a):
        a = np.asarray(a, float)
        num = pd.Series(a * w).groupby(g).transform("sum").to_numpy()
        return a - num / den

    yv = demean(d[y].to_numpy(float))
    Zv = np.column_stack([demean(Z[c].to_numpy(float)) for c in names])

    keep = independent_columns(Zv)
    Zv, names = Zv[:, keep], [names[i] for i in keep]

    fit = sm.WLS(yv, Zv, weights=w).fit(
        cov_type="cluster", cov_kwds={"groups": d[cluster].to_numpy()})
    return {
        "coef": pd.Series(fit.params, index=names),
        "se": pd.Series(fit.bse, index=names),
        "p": pd.Series(fit.pvalues, index=names),
        "n": len(d),
        "g": d[unit].nunique(),
        "r2_within": fit.rsquared,
    }


def stata_ols(data, y, rhs, cluster, time=None, weight=None):
    """Pooled OLS with a constant and Stata's cluster-robust standard errors (`reg ..., cluster()`)."""
    cols = [y] + list(rhs) + [cluster] + ([time] if time else []) + ([weight] if weight else [])
    d = data.dropna(subset=[c for c in dict.fromkeys(cols)]).copy()
    w = np.ones(len(d)) if weight is None else d[weight].to_numpy(float)
    w = w * len(d) / w.sum()

    Z = d[list(rhs)].astype(float).reset_index(drop=True)
    names = list(rhs)
    if time is not None:
        dums = pd.get_dummies(d[time].astype(int), prefix="t", drop_first=True).astype(float)
        Z = pd.concat([Z, dums.reset_index(drop=True)], axis=1)
        names += list(dums.columns)
    Z.insert(0, "const", 1.0)
    names = ["const"] + names

    M = Z[names].to_numpy(float)
    keep = independent_columns(M)
    M, names = M[:, keep], [names[i] for i in keep]
    fit = sm.WLS(d[y].to_numpy(float), M, weights=w).fit(
        cov_type="cluster", cov_kwds={"groups": d[cluster].to_numpy()})
    return {"coef": pd.Series(fit.params, index=names),
            "se": pd.Series(fit.bse, index=names),
            "p": pd.Series(fit.pvalues, index=names),
            "n": len(d), "g": d[cluster].nunique(), "r2": fit.rsquared}


def build_weights(sample, trim_pct=None, label=""):
    """Construct the paper's two doubly-robust weighting schemes.

    LWDR uses the propensity-score odds; KOBDR uses Kline's (2011) Oaxaca-Blinder reweighting.
    Both put weight one on every treated unit -- these are ATT weights, so the treated
    distribution is the target and only the comparison group is reshaped to match it.

    Returns the sample with columns p, ipw1 (logit), ipw2 (OB), and -- when `trim_pct` is
    given -- ipw3 and ipw4, the trimmed versions that drop the comparison units with the
    lowest propensity scores.
    """
    s = sample.dropna(subset=["lpop91", "lmdist"]).copy()
    X = sm.add_constant(s[["lpop91", "lmdist"]].astype(float))
    D = s["treat"].to_numpy(float)

    logit = sm.Logit(D, X).fit(disp=0)
    p = logit.predict(X).to_numpy()
    s["p"] = p
    pi, n1, Xm, nD = D.mean(), D.sum(), X.to_numpy(float), 1.0 - D

    # LWDR: odds-of-treatment weights, rescaled so the comparison group has mean weight one.
    s["ipw1"] = np.where(D == 1, 1.0, p / (1 - p) * (1 - pi) / pi)

    # KOBDR: the linear-regression-implied reweighting of Kline (2011). Solving the treated
    # group's covariate means onto the comparison design produces one weight per comparison
    # unit; negative weights are outside the convex hull and get dropped.
    ob = ((D @ Xm) @ np.linalg.inv(Xm.T @ (Xm * nD[:, None])) @ Xm.T / n1) * nD * n1
    s["ipw2"] = np.where(D == 1, 1.0, np.where(ob < 0, np.nan, ob))

    print(f"  [{label}] logit N={len(s)}  coefs="
          f"{np.array2string(logit.params.to_numpy(), precision=6)}")
    print(f"  [{label}] negative Oaxaca-Blinder weights: "
          f"{int(((ob < 0) & (D == 0)).sum())} obs dropped")

    if trim_pct is not None:
        cut = np.percentile(p, trim_pct)
        s["ipw3"] = np.where((p < cut) & (D == 0), np.nan, s["ipw1"])
        s["ipw4"] = np.where((p < cut) & (D == 0), np.nan, s["ipw2"])
        print(f"  [{label}] {trim_pct}% propensity trim at p={cut:.7f}")

    return s[s["ipw2"].notna()].copy()


def load_or_build(name, builder):
    """Read the tidy CSV if it exists, otherwise build it from the Stata replication package.

    The replication package is not redistributed with the post, so on a reader's machine only
    the CSVs exist. On the author's machine the CSVs are rebuilt from the `.dta` sources.
    """
    csv = os.path.join(DATA_DIR, f"{name}.csv")
    if os.path.isdir(RAW_DIR):
        df = builder()
        os.makedirs(DATA_DIR, exist_ok=True)
        df.to_csv(csv, index=False)
        print(f"  built {csv}  shape={df.shape}")
        return df
    # Inside the downloadable Quarto bundle the CSVs sit beside this script rather
    # than under data/, so fall back to the flat layout before giving up.
    if not os.path.exists(csv):
        csv = f"{name}.csv"
    df = pd.read_csv(csv)
    print(f"  loaded {csv}  shape={df.shape}")
    return df


# ── Section 1: Load the four data families ────────────────────────────────────

banner("SECTION 1: Loading the Jamuna Bridge replication data")


def _emp():
    d = pd.read_stata(f"{RAW_DIR}/emp_Final.dta", convert_categoricals=False)
    return d[["geocode", "year", "div", "dist", "pop", "emp", "pop_agr", "pop_ind", "pop_serv",
              "density", "pop91", "rainm", "rainsd", "surban", "prop_elec",
              "jamuna_m", "padma_m", "treat", "smp1", "treatd"]]


def _nl():
    d = pd.read_stata(f"{RAW_DIR}/night_mrm1_Final.dta", convert_categoricals=False)
    return d[["geocode", "year", "mn", "div", "dist", "pop91", "rainm", "rainsd",
              "jamuna_m", "padma_m", "treat", "smp1", "treatd"]]


def _yld():
    d = pd.read_stata(f"{RAW_DIR}/yield_88_13_Final.dta", convert_categoricals=False)
    return d[["former_dis", "dist", "year", "div", "yld", "pop91", "rainm", "rainsd",
              "jamuna_m", "padma_m", "treat", "smp1", "treatd"]]


def _hh():
    d = pd.read_stata(f"{RAW_DIR}/DHS_HIES_HH_Final.dta", convert_categoricals=False)
    return d


def _vill():
    d = pd.read_stata(f"{RAW_DIR}/DHS_infra.dta", convert_categoricals=False)
    return d


emp_raw = load_or_build("bridge_employment", _emp)
nl_raw = load_or_build("bridge_nightlights", _nl)
yld_raw = load_or_build("bridge_yield", _yld)
hh_raw = load_or_build("bridge_dhs_household", _hh)
vill_raw = load_or_build("bridge_dhs_village", _vill)

for nm, d, unit in [("employment", emp_raw, "geocode"), ("nightlights", nl_raw, "geocode"),
                    ("yield", yld_raw, "dist"), ("dhs household", hh_raw, "District"),
                    ("dhs village", vill_raw, "District")]:
    insample = d[d["smp1"].notna()]
    print(f"  {nm:15s} rows={len(d):5d}  units={d[unit].nunique():4d}  periods={d['year'].nunique()}"
          f"  treated units={insample.loc[insample.treat == 1, unit].nunique():4d}"
          f"  comparison units={insample.loc[insample.treat == 0, unit].nunique():4d}")


# ── Section 2: Building the analysis panels ───────────────────────────────────

banner("SECTION 2: Building the analysis panels")


def add_common(d, rain_plus_one=False, dist_scale=1.0):
    """Derived variables shared by all three panel datasets."""
    d = d.copy()
    d["mdist"] = np.minimum(d["jamuna_m"], d["padma_m"]) / 1000.0      # km to the relevant bridge
    d["lmdist"] = np.log(d["mdist"] + 1) / dist_scale
    d["lpop91"] = np.log(d["pop91"])
    d["lrainm"] = np.log(d["rainm"] + 1) if rain_plus_one else np.log(d["rainm"].replace(0, np.nan))
    d["lrainsd"] = np.log(d["rainsd"].replace(0, np.nan))
    return d


# --- Nightlights: the running example --------------------------------------------------------
nl = add_common(nl_raw, rain_plus_one=True)
nl_w = build_weights(nl[nl["smp1"].notna()], trim_pct=5, label="nightlights")
nl = nl.merge(nl_w.groupby(["geocode", "year"])[["p", "ipw1", "ipw2", "ipw3", "ipw4"]].first()
              .reset_index(), on=["geocode", "year"], how="left")
nl["lmn"] = np.log(nl["mn"] + 1)
nl = nl.sort_values(["geocode", "year"])
nl["D_lmn"] = nl.groupby("geocode")["lmn"].diff()
nl["lpop91_t"] = nl["lpop91"] * nl["year"]
nl["lmdist_t"] = nl["lmdist"] * nl["year"]
# `nite_2021.do` runs `xtile nq1 = lmdist if smp1!=., nq(3)` on the merged data, before any
# rows are lost to missing controls -- unlike `employment_2021.do`, which drops first. Getting
# this order wrong moves a handful of upazilas across band boundaries and shifts every
# heterogeneity coefficient in the third decimal.
NL_BANDS = pd.qcut(nl.loc[nl["smp1"].notna(), "lmdist"], 3, labels=["near", "mid", "far"])
NL_BAND_MAP = (nl.loc[nl["smp1"].notna(), ["geocode"]].assign(band=NL_BANDS.to_numpy())
               .drop_duplicates("geocode").set_index("geocode")["band"])
nl = nl.dropna(subset=CONTROLS)
nl["post"] = (nl["year"] > 2).astype(int)
nl["sr"] = ((nl["year"] >= 3) & (nl["year"] <= 4)).astype(int)
nl["lr"] = (nl["year"] > 4).astype(int)
nl["treat_post"] = nl["treat"] * nl["post"]
nl["treat_sr"] = nl["treat"] * nl["sr"]
nl["treat_lr"] = nl["treat"] * nl["lr"]
NL = nl[nl["smp1"].notna()].copy()
NL["year"] = NL["year"].astype(int)
NL["geocode"] = NL["geocode"].astype(int)
NL["treat"] = NL["treat"].astype(int)

# --- Employment / population census -----------------------------------------------------------
emp = add_common(emp_raw)
emp_w = build_weights(emp[emp["smp1"].notna()], trim_pct=5, label="employment")
emp = emp.merge(emp_w.groupby("geocode")[["p", "ipw1", "ipw2", "ipw3", "ipw4"]].first()
                .reset_index(), on="geocode", how="left")
emp["ldensity"] = np.log(emp["density"])
emp["sind"] = emp["pop_ind"] / emp["emp"]
emp["sserv"] = emp["pop_serv"] / emp["emp"]
emp["sagr"] = emp["pop_agr"] / emp["emp"]
emp["lagr"] = np.log(emp["pop_agr"])
emp["lpop91_t"] = emp["lpop91"] * emp["year"]
emp["lmdist_t"] = emp["lmdist"] * emp["year"]
emp = emp.dropna(subset=CONTROLS)
emp["post"] = (emp["year"] > 1).astype(int)
emp["sr"] = (emp["year"] == 2).astype(int)
emp["lr"] = (emp["year"] == 3).astype(int)
emp["treat_post"] = emp["treat"] * emp["post"]
emp["treat_sr"] = emp["treat"] * emp["sr"]
emp["treat_lr"] = emp["treat"] * emp["lr"]
EMP = emp[emp["smp1"].notna()].copy()
EMP["year"] = EMP["year"].astype(int)
EMP["geocode"] = EMP["geocode"].astype(int)
EMP["treat"] = EMP["treat"].astype(int)

# --- Rice yield --------------------------------------------------------------------------------
# The authors' log rescales lmdist by 10 for this dataset. It leaves every treatment coefficient
# untouched (a linear rescaling of a regressor is absorbed by its own coefficient) but is needed
# to reproduce the logit coefficients and lmdist_t exactly.
yld = add_common(yld_raw, dist_scale=10.0)
yld_w = build_weights(yld[yld["smp1"].notna()], trim_pct=None, label="yield")
yld = yld.merge(yld_w.groupby(["dist", "year"])[["p", "ipw1", "ipw2"]].first().reset_index(),
                on=["dist", "year"], how="left")
yld["lyld"] = np.log(yld["yld"])
yld = yld.sort_values(["dist", "year"])
yld["D_lyld"] = yld.groupby("dist")["lyld"].diff()
yld["lpop91_t"] = yld["lpop91"] * yld["year"]
yld["lmdist_t"] = yld["lmdist"] * yld["year"]
yld = yld.dropna(subset=CONTROLS)
yld["post"] = (yld["year"] >= 4).astype(int)
yld["sr"] = ((yld["year"] >= 4) & (yld["year"] <= 5)).astype(int)
yld["lr"] = (yld["year"] > 5).astype(int)
yld["treat_post"] = yld["treat"] * yld["post"]
yld["treat_sr"] = yld["treat"] * yld["sr"]
yld["treat_lr"] = yld["treat"] * yld["lr"]
YLD = yld[yld["smp1"].notna()].copy()
YLD["year"] = YLD["year"].astype(int)
YLD["dist"] = YLD["dist"].astype(int)
YLD["treat"] = YLD["treat"].astype(int)

# --- DHS household and village -----------------------------------------------------------------
HH = hh_raw.copy()
HH["mdist"] = np.minimum(HH["jamuna_m"], HH["padma_m"]) / 1000.0
HH["lmdist"] = np.log(HH["mdist"] + 1)
HH["lmdist_t"] = HH["lmdist"] * HH["year"]
HH["sr"] = (HH["year"] == 4).astype(int)
HH["lr"] = (HH["year"] >= 5).astype(int)
HH["treat_sr"] = HH["treat"] * HH["sr"]
HH["treat_lr"] = HH["treat"] * HH["lr"]
HH["year"] = HH["year"].astype(int)

VILL = vill_raw.copy()
VILL["mdist"] = np.minimum(VILL["jamuna_m"], VILL["padma_m"]) / 1000.0
VILL["lmdist"] = np.log(VILL["mdist"] + 1)
VILL["lmdist_t"] = VILL["lmdist"] * VILL["year"]
VILL["sr"] = (VILL["year"] == 4).astype(int)
VILL["lr"] = (VILL["year"] >= 5).astype(int)
VILL["treat_sr"] = VILL["treat"] * VILL["sr"]
VILL["treat_lr"] = VILL["treat"] * VILL["lr"]
VILL["year"] = VILL["year"].astype(int)

# Distance terciles, reproducing `xtile ... , nq(3)` on each script's own sample.
NL["band"] = NL["geocode"].map(NL_BAND_MAP).astype("category")
for D_, unit in [(NL, "geocode"), (EMP, "geocode"), (YLD, "dist")]:
    if "band" not in D_.columns:
        D_["band"] = pd.qcut(D_["lmdist"], 3, labels=["near", "mid", "far"])
    for b in ["near", "mid", "far"]:
        D_[f"dm_{b}"] = (D_["band"] == b).astype(float)
        D_[f"sr_{b}"] = D_["sr"] * D_[f"dm_{b}"]
        D_[f"lr_{b}"] = D_["lr"] * D_[f"dm_{b}"]
        D_[f"tsr_{b}"] = D_["treat"] * D_["sr"] * D_[f"dm_{b}"]
        D_[f"tlr_{b}"] = D_["treat"] * D_["lr"] * D_[f"dm_{b}"]

cuts = EMP.groupby("band", observed=True)["mdist"].agg(["min", "max", "count"])
print("\n  Distance bands (employment sample, km from bridge foot):")
print(cuts.round(2).to_string())
cuts.to_csv(f"{SLUG}_distance_bands.csv")

print(f"\n  Estimation samples")
print(f"    nightlights  OLS N={len(NL):5d} units={NL.geocode.nunique():4d}"
      f" | weighted N={NL.ipw4.notna().sum():5d}"
      f" units={NL.loc[NL.ipw4.notna(),'geocode'].nunique():4d}")
print(f"    employment   OLS N={len(EMP):5d} units={EMP.geocode.nunique():4d}"
      f" | weighted N={EMP.ipw4.notna().sum():5d}"
      f" units={EMP.loc[EMP.ipw4.notna(),'geocode'].nunique():4d}")
print(f"    yield        OLS N={len(YLD):5d} units={YLD.dist.nunique():4d}"
      f" | weighted N={YLD.ipw2.notna().sum():5d}"
      f" units={YLD.loc[YLD.ipw2.notna(),'dist'].nunique():4d}")
print(f"    dhs hh       N={len(HH):5d} districts={HH.District.nunique():4d}")
print(f"    dhs village  N={len(VILL):5d} districts={VILL.District.nunique():4d}")

for nm, d in [("nightlights", NL), ("employment", EMP), ("yield", YLD)]:
    d.to_csv(f"{SLUG}_panel_{nm}.csv", index=False)


# ── Section 3: What the raw data look like ────────────────────────────────────

banner("SECTION 3: Exploratory analysis -- the raw series")


def trend_panel(ax, d, y, unit, ylab, years, vline, title):
    """Mean of `y` by period for the treated and comparison groups, with the bridge marked."""
    for grp, color, lab in [(1, WARM_ORANGE, "Jamuna hinterland (treated)"),
                            (0, STEEL_BLUE, "Padma hinterland (comparison)")]:
        m = d[d["treat"] == grp].groupby("year")[y].mean()
        ax.plot(m.index, m.to_numpy(), marker="o", ms=5, lw=2, color=color, label=lab)
    ax.axvline(vline, color=TEAL, ls="--", lw=1.5, alpha=0.9)
    ax.text(vline, ax.get_ylim()[1], "  bridge opens", color=TEAL, va="top", fontsize=10)
    ax.set_xticks(sorted(years))
    ax.set_xticklabels([years[k] for k in sorted(years)], rotation=45, ha="right", fontsize=9)
    ax.set_ylabel(ylab)
    ax.set_title(title, fontweight="bold", fontsize=12)


# The identification geometry, without needing a shapefile: every upazila is a point in
# "distance to Jamuna bridge" by "distance to Padma crossing" space. The watershed line
# separates the two hinterlands, and the excluded core sits away from both.
geo = emp_raw.drop_duplicates("geocode").copy()
geo["grp"] = np.where(geo["treatd"] == 1, "core (excluded)",
                      np.where(geo["treat"] == 1, "Jamuna hinterland (treated)",
                               "Padma hinterland (comparison)"))
fig, ax = plt.subplots(figsize=(9.5, 7.5))
for lab, color, mk in [("Jamuna hinterland (treated)", WARM_ORANGE, "o"),
                       ("Padma hinterland (comparison)", STEEL_BLUE, "o"),
                       ("core (excluded)", "#7a8399", "x")]:
    s = geo[geo["grp"] == lab]
    ax.scatter(s["jamuna_m"] / 1000, s["padma_m"] / 1000,
               s=np.sqrt(s["pop91"]) / 6, color=color, marker=mk, alpha=0.75,
               edgecolors="none", label=f"{lab}  (n={len(s)})")
lim = [0, 400]
ax.plot(lim, lim, color=WHITE_TEXT, ls=":", lw=1.4)
ax.text(330, 318, "equidistant", color=LIGHT_TEXT, fontsize=10, rotation=38)
ax.set_xlabel("Distance to the Jamuna bridge (km)")
ax.set_ylabel("Distance to the Padma crossing (km)")
ax.set_title("Two hinterlands, two rivers, one bridge\n(marker size is 1991 population)",
             fontweight="bold", fontsize=13)
ax.legend(loc="upper right")
ax.set_xlim(0, 300)
ax.set_ylim(0, 400)
FIG_GEO = savefig("hinterland_geography")

fig, ax = plt.subplots(figsize=(10, 6))
trend_panel(ax, NL, "lmn", "geocode", "Mean log(luminosity + 1)", NL_YEARS, 2.5,
            "Nighttime lights: Jamuna vs Padma hinterland, 1992-2013")
ax.legend(loc="upper left")
FIG_TRENDS_NL = savefig("trends_nightlights")

fig, ax = plt.subplots(figsize=(10, 6))
trend_panel(ax, YLD, "lyld", "dist", "Mean log(rice yield, mt/ha)", YLD_YEARS, 3.5,
            "Boro rice yield: Jamuna vs Padma hinterland, 1988-2013")
ax.legend(loc="upper left")
FIG_TRENDS_YLD = savefig("trends_yield")

fig, axes = plt.subplots(2, 2, figsize=(13, 9))
for ax, (col, lab) in zip(axes.ravel(), [
        ("ldensity", "Log population density"), ("sagr", "Agriculture employment share"),
        ("sind", "Industry employment share"), ("sserv", "Services employment share")]):
    trend_panel(ax, EMP, col, "geocode", lab, EMP_YEARS, 1.7, lab)
axes[0, 0].legend(loc="upper left", fontsize=9)
fig.suptitle("Population census outcomes, 1991-2011", fontweight="bold", color=WHITE_TEXT,
             fontsize=14)
FIG_TRENDS_EMP = savefig("trends_census")

# Sectoral composition, treated group only -- the reallocation story in one picture.
fig, axes = plt.subplots(1, 2, figsize=(13, 5.5))
for ax, grp, ttl in [(axes[0], 1, "Jamuna hinterland (treated)"),
                     (axes[1], 0, "Padma hinterland (comparison)")]:
    sub = EMP[EMP["treat"] == grp].groupby("year")[["sagr", "sind", "sserv"]].mean()
    ax.stackplot(sub.index, sub["sagr"], sub["sind"], sub["sserv"],
                 colors=[STEEL_BLUE, WARM_ORANGE, TEAL], alpha=0.9,
                 labels=["Agriculture", "Industry", "Services"])
    ax.set_xticks([1, 2, 3])
    ax.set_xticklabels(["1991", "2001", "2011"])
    ax.set_ylim(0, 1)
    ax.set_title(ttl, fontweight="bold", fontsize=12)
    ax.set_ylabel("Share of employment")
axes[0].legend(loc="lower left")
fig.suptitle("Sectoral composition of employment", fontweight="bold", color=WHITE_TEXT, fontsize=14)
FIG_SECTORS = savefig("sectoral_composition")

# The pre-bridge distance gradient (the paper's Appendix Figure AF.3): the "exposure" argument.
pre = EMP[(EMP["year"] == 1) & (EMP["treat"] == 1)]
fig, axes = plt.subplots(1, 3, figsize=(14, 4.5))
for ax, (col, lab, color) in zip(axes, [("sagr", "Agriculture share", STEEL_BLUE),
                                        ("sind", "Industry share", WARM_ORANGE),
                                        ("sserv", "Services share", TEAL)]):
    ax.scatter(pre["mdist"], pre[col], s=22, color=color, alpha=0.65, edgecolors="none")
    z = np.polyfit(pre["mdist"], pre[col], 1)
    xs = np.linspace(pre["mdist"].min(), pre["mdist"].max(), 50)
    ax.plot(xs, np.polyval(z, xs), color=WHITE_TEXT, lw=2)
    ax.set_xlabel("Distance to bridge foot (km)")
    ax.set_ylabel(lab)
    ax.set_title(f"{lab}: slope {z[0]:+.5f}/km", fontweight="bold", fontsize=11)
fig.suptitle("Pre-bridge (1991) distance gradients in the Jamuna hinterland",
             fontweight="bold", color=WHITE_TEXT, fontsize=13)
FIG_GRADIENT = savefig("pre_bridge_distance_gradient")

grad = {}
for col in ["sagr", "sind", "sserv", "ldensity"]:
    z = np.polyfit(pre["mdist"], pre[col], 1)
    grad[col] = z[0]
print("  Pre-bridge gradients per km (treated upazilas, 1991):")
for k, v in grad.items():
    print(f"    {PRETTY.get(k, k):28s} {v:+.6f}")
pd.Series(grad, name="slope_per_km").to_csv(f"{SLUG}_pre_bridge_gradients.csv")


# ── Section 4: The 2x2 -- the whole idea in four numbers ──────────────────────

banner("SECTION 4: The canonical 2x2 difference-in-differences")

cell = NL.groupby(["treat", "post"])["lmn"].mean().unstack()
d_treated = cell.loc[1, 1] - cell.loc[1, 0]
d_control = cell.loc[0, 1] - cell.loc[0, 0]
print("  Group means of log(nightlights + 1):")
print(f"    treated    pre {cell.loc[1,0]:.4f}   post {cell.loc[1,1]:.4f}   change {d_treated:+.4f}")
print(f"    comparison pre {cell.loc[0,0]:.4f}   post {cell.loc[0,1]:.4f}   change {d_control:+.4f}")
print(f"    difference-in-differences = {d_treated:+.4f} - ({d_control:+.4f}) = "
      f"{d_treated - d_control:+.4f}")

raw_did = DifferenceInDifferences(cluster="geocode").fit(
    NL, outcome="lmn", treatment="treat", time="post", unit="geocode")
print(f"\n  diff-diff, no controls, no fixed effects: ATT={raw_did.att:.4f} (se {raw_did.se:.4f})")

fig, ax = plt.subplots(figsize=(9.5, 6))
xs = [0, 1]
ax.plot(xs, [cell.loc[1, 0], cell.loc[1, 1]], marker="o", ms=9, lw=2.5, color=WARM_ORANGE,
        label="Jamuna hinterland (treated)")
ax.plot(xs, [cell.loc[0, 0], cell.loc[0, 1]], marker="o", ms=9, lw=2.5, color=STEEL_BLUE,
        label="Padma hinterland (comparison)")
counter = cell.loc[1, 0] + d_control
ax.plot(xs, [cell.loc[1, 0], counter], marker="o", ms=9, lw=2.5, ls="--", color=TEAL,
        label="Counterfactual for the treated")
ax.annotate("", xy=(1, cell.loc[1, 1]), xytext=(1, counter),
            arrowprops=dict(arrowstyle="<->", color=WHITE_TEXT, lw=2))
ax.text(1.03, (cell.loc[1, 1] + counter) / 2, f"ATT = {d_treated - d_control:+.4f}",
        color=WHITE_TEXT, va="center", fontweight="bold")
ax.set_xticks(xs)
ax.set_xticklabels(["Before the bridge\n(1992-1997)", "After the bridge\n(1998-2013)"])
ax.set_ylabel("Mean log(luminosity + 1)")
ax.set_title("The difference-in-differences logic in one picture", fontweight="bold", fontsize=13)
ax.legend(loc="upper left")
ax.set_xlim(-0.15, 1.45)
FIG_2X2 = savefig("did_2x2")

pd.DataFrame({"group": ["treated", "comparison"],
              "pre": [cell.loc[1, 0], cell.loc[0, 0]],
              "post": [cell.loc[1, 1], cell.loc[0, 1]],
              "change": [d_treated, d_control]}).to_csv(f"{SLUG}_did_2x2.csv", index=False)


# ── Section 5: The two doubly-robust weighting schemes ────────────────────────

banner("SECTION 5: Doubly-robust reweighting -- propensity scores and Oaxaca-Blinder")

nlp = NL.drop_duplicates("geocode")
fig, axes = plt.subplots(1, 2, figsize=(13, 5))
bins = np.linspace(nlp["p"].min(), nlp["p"].max(), 26)
axes[0].hist(nlp.loc[nlp.treat == 1, "p"], bins=bins, alpha=0.75, color=WARM_ORANGE,
             label="Jamuna (treated)")
axes[0].hist(nlp.loc[nlp.treat == 0, "p"], bins=bins, alpha=0.75, color=STEEL_BLUE,
             label="Padma (comparison)")
cut = np.percentile(NL["p"].dropna(), 5)
axes[0].axvline(cut, color=TEAL, ls="--", lw=2)
axes[0].text(cut, axes[0].get_ylim()[1] * 0.95, "  5% trim", color=TEAL, va="top")
axes[0].set_xlabel("Estimated propensity score")
axes[0].set_ylabel("Upazilas")
axes[0].set_title("Overlap: the two hinterlands are hard to tell apart",
                  fontweight="bold", fontsize=12)
axes[0].legend()

ctl = nlp[nlp.treat == 0]
axes[1].scatter(ctl["ipw1"], ctl["ipw2"], s=28, color=STEEL_BLUE, alpha=0.7, edgecolors="none")
lim = [0, max(ctl["ipw1"].max(), ctl["ipw2"].max()) * 1.05]
axes[1].plot(lim, lim, color=WHITE_TEXT, lw=1.2, ls=":")
axes[1].set_xlabel("LWDR weight (propensity odds)")
axes[1].set_ylabel("KOBDR weight (Oaxaca-Blinder)")
axes[1].set_title("The two schemes agree on which comparison\nupazilas matter",
                  fontweight="bold", fontsize=12)
FIG_WEIGHTS = savefig("propensity_and_weights")

print(f"  comparison-group weight summary (nightlights, one row per upazila)")
print(ctl[["ipw1", "ipw2", "ipw3", "ipw4"]].describe().T.round(4).to_string())
print(f"\n  correlation between the two weighting schemes: "
      f"{ctl['ipw1'].corr(ctl['ipw2']):.4f}")

# Do the weights actually balance the covariates? This is the point of reweighting.
bal_rows = []
for var in ["lpop91", "lmdist"]:
    t = nlp.loc[nlp.treat == 1, var]
    for lab, wcol in [("unweighted", None), ("LWDR", "ipw3"), ("KOBDR", "ipw4")]:
        c = nlp[nlp.treat == 0].dropna(subset=[var] + ([wcol] if wcol else []))
        w = np.ones(len(c)) if wcol is None else c[wcol].to_numpy(float)
        cm = np.average(c[var], weights=w)
        sd = np.sqrt((t.var() + c[var].var()) / 2)
        bal_rows.append({"variable": var, "weighting": lab, "treated_mean": t.mean(),
                         "comparison_mean": cm, "std_diff": (t.mean() - cm) / sd})
bal = pd.DataFrame(bal_rows)
print("\n  Covariate balance (standardised difference):")
print(bal.round(4).to_string(index=False))
bal.to_csv(f"{SLUG}_covariate_balance.csv", index=False)

fig, ax = plt.subplots(figsize=(9, 5))
for i, (lab, color) in enumerate([("unweighted", STEEL_BLUE), ("LWDR", WARM_ORANGE),
                                  ("KOBDR", TEAL)]):
    sub = bal[bal.weighting == lab]
    ax.barh(np.arange(len(sub)) + i * 0.26, sub["std_diff"], height=0.24, color=color, label=lab)
ax.axvline(0, color=WHITE_TEXT, lw=1)
ax.set_yticks(np.arange(2) + 0.26)
ax.set_yticklabels(["log population 1991", "log distance to bridge"])
ax.set_xlabel("Standardised difference (treated minus comparison)")
ax.set_title("Reweighting closes the covariate gap", fontweight="bold", fontsize=13)
ax.legend()
FIG_BALANCE = savefig("covariate_balance")


# ── Section 6: Table 1 -- the mean post-bridge effect ─────────────────────────

banner("SECTION 6: Table 1 -- mean effects of the bridge")

SPECS = {
    "nightlights": dict(data=NL, unit="geocode", time="year", outcomes=["lmn", "D_lmn"],
                        w={"LWDR": "ipw3", "KOBDR": "ipw4"}, extra_post=["post"],
                        extra_lrsr=["sr", "lr"], het_time=True),
    "employment": dict(data=EMP, unit="geocode", time="year",
                       outcomes=["ldensity", "sind", "sserv", "sagr"],
                       w={"LWDR": "ipw3", "KOBDR": "ipw4"}, extra_post=[], extra_lrsr=[],
                       het_time=False),
    "yield": dict(data=YLD, unit="dist", time="year", outcomes=["lyld", "D_lyld"],
                  w={"LWDR": "ipw1", "KOBDR": "ipw2"}, extra_post=[], extra_lrsr=[],
                  het_time=False),
}

t1_rows = []
for ds, cfg in SPECS.items():
    for y in cfg["outcomes"]:
        for est in ["OLS", "LWDR", "KOBDR"]:
            wcol = None if est == "OLS" else cfg["w"][est]
            r = stata_fe(cfg["data"], y, ["treat_post"] + cfg["extra_post"] + CONTROLS,
                         unit=cfg["unit"], time=cfg["time"], weight=wcol)
            t1_rows.append({"dataset": ds, "outcome": y, "estimator": est,
                            "coef": r["coef"]["treat_post"], "se": r["se"]["treat_post"],
                            "p": r["p"]["treat_post"], "n": r["n"], "units": r["g"],
                            "r2_within": r["r2_within"]})
table1 = pd.DataFrame(t1_rows)
print(table1.round(4).to_string(index=False))
table1.to_csv(f"{SLUG}_table1_mean_effects.csv", index=False)


# ── Section 7: Table 2 -- short run versus long run ──────────────────────────

banner("SECTION 7: Table 2 -- short-run and long-run effects")

t2_rows = []
for ds, cfg in SPECS.items():
    for y in cfg["outcomes"]:
        for est in ["OLS", "LWDR", "KOBDR"]:
            wcol = None if est == "OLS" else cfg["w"][est]
            r = stata_fe(cfg["data"], y, ["treat_sr", "treat_lr"] + cfg["extra_lrsr"] + CONTROLS,
                         unit=cfg["unit"], time=cfg["time"], weight=wcol)
            for term, key in [("treat_sr", "SR"), ("treat_lr", "LR")]:
                t2_rows.append({"dataset": ds, "outcome": y, "estimator": est, "horizon": key,
                                "coef": r["coef"][term], "se": r["se"][term], "p": r["p"][term],
                                "n": r["n"], "units": r["g"]})
table2 = pd.DataFrame(t2_rows)
print(table2.round(4).to_string(index=False))
table2.to_csv(f"{SLUG}_table2_short_long_run.csv", index=False)


# ── Section 8: Event studies with diff-diff ──────────────────────────────────

banner("SECTION 8: Event studies -- letting every period speak")


def event_study(data, outcome, unit, post_periods, ref, label, years):
    """Period-by-period treatment effects via diff-diff's MultiPeriodDiD."""
    res = MultiPeriodDiD(cluster=unit).fit(
        data, outcome=outcome, treatment="treat", time="year", post_periods=post_periods,
        covariates=CONTROLS, absorb=[unit], reference_period=ref, unit=unit)
    rows = []
    for p in sorted(res.period_effects):
        e = res.get_effect(p)
        rows.append({"period": p, "label": years[p], "effect": e.effect, "se": e.se,
                     "is_post": p in post_periods})
    rows.append({"period": ref, "label": years[ref], "effect": 0.0, "se": 0.0, "is_post": False})
    df = pd.DataFrame(rows).sort_values("period").reset_index(drop=True)
    print(f"\n  {label}: average post-treatment ATT = {res.avg_att:+.4f} (se {res.avg_se:.4f})")
    print(df.round(4).to_string(index=False))
    return df, res


es_nl, es_nl_res = event_study(NL, "lmn", "geocode", [3, 4, 5, 6, 7], 2,
                               "Nightlights", NL_YEARS)
es_yld, es_yld_res = event_study(YLD, "lyld", "dist", [4, 5, 6, 7, 8], 3,
                                 "Rice yield", YLD_YEARS)
es_dens, es_dens_res = event_study(EMP, "ldensity", "geocode", [2, 3], 1,
                                   "Population density", EMP_YEARS)
es_serv, _ = event_study(EMP, "sserv", "geocode", [2, 3], 1, "Services share", EMP_YEARS)

for nm, d in [("nightlights", es_nl), ("yield", es_yld), ("density", es_dens),
              ("services", es_serv)]:
    d.to_csv(f"{SLUG}_event_study_{nm}.csv", index=False)


def plot_event(ax, df, ref, first_post, title, ylab, note=True):
    """Event-study plot. `ref` is the normalised period; `first_post` is when treatment starts."""
    ax.axhline(0, color=WHITE_TEXT, lw=1)
    ax.axvspan(df["period"].min() - 0.45, first_post - 0.5, color=GRID_LINE, alpha=0.35)
    ax.axvline(first_post - 0.5, color=TEAL, ls="--", lw=1.8)
    for _, r in df.iterrows():
        color = WARM_ORANGE if r["period"] >= first_post else STEEL_BLUE
        ax.errorbar(r["period"], r["effect"], yerr=1.96 * r["se"], fmt="o", ms=8,
                    color=color, capsize=4, lw=1.8)
    ax.plot(df["period"], df["effect"], color=WARM_ORANGE, lw=1.2, alpha=0.5)
    ax.annotate("reference", xy=(ref, 0), xytext=(ref, 0), color=LIGHT_TEXT, fontsize=8,
                ha="center", va="bottom")
    if note:
        ax.text(first_post - 0.42, ax.get_ylim()[1] * 0.92, " bridge opens", color=TEAL,
                fontsize=10, va="top")
    ax.set_xticks(df["period"])
    ax.set_xticklabels(df["label"], rotation=45, ha="right", fontsize=9)
    ax.set_ylabel(ylab)
    ax.set_title(title, fontweight="bold", fontsize=12)


fig, ax = plt.subplots(figsize=(10, 6))
plot_event(ax, es_nl, 2, 3, "Nighttime lights: no pre-trend, then a steady climb",
           "Effect on log(luminosity + 1)")
FIG_ES_NL = savefig("event_study_nightlights")

fig, axes = plt.subplots(1, 3, figsize=(15, 4.8))
plot_event(axes[0], es_yld, 3, 4, "Rice yield", "Effect on log yield")
plot_event(axes[1], es_dens, 1, 2, "Population density", "Effect on log density", note=False)
plot_event(axes[2], es_serv, 1, 2, "Services employment share", "Effect on share", note=False)
fig.suptitle("Event studies for the remaining outcomes", fontweight="bold", color=WHITE_TEXT,
             fontsize=14)
FIG_ES_REST = savefig("event_study_others")


# ── Section 9: Table 4 -- spatial heterogeneity ──────────────────────────────

banner("SECTION 9: Table 4 -- effects by distance from the bridge")

het_terms = ["tsr_near", "tsr_mid", "tsr_far", "tlr_near", "tlr_mid", "tlr_far"]
main_terms = ["sr_near", "sr_mid", "sr_far", "lr_near", "lr_mid", "lr_far"]

t4_rows = []
for ds, cfg in SPECS.items():
    wcol = cfg["w"]["KOBDR"]
    for y in cfg["outcomes"]:
        r = stata_fe(cfg["data"], y, het_terms + main_terms + CONTROLS,
                     unit=cfg["unit"], time=cfg["time"] if cfg["het_time"] else None,
                     weight=wcol)
        for term in het_terms:
            if term in r["coef"].index:
                horizon = "SR" if term.startswith("tsr") else "LR"
                band = term.split("_")[1]
                t4_rows.append({"dataset": ds, "outcome": y, "horizon": horizon, "band": band,
                                "coef": r["coef"][term], "se": r["se"][term], "p": r["p"][term],
                                "n": r["n"], "units": r["g"]})
table4 = pd.DataFrame(t4_rows)
print(table4.round(4).to_string(index=False))
table4.to_csv(f"{SLUG}_table4_heterogeneity.csv", index=False)

BAND_LAB = {"near": "Nearest\n(<84 km)", "mid": "Middle\n(84-128 km)", "far": "Farthest\n(128-270 km)"}
fig, axes = plt.subplots(2, 4, figsize=(16, 8.5), sharex=True)
order = [("employment", "ldensity"), ("employment", "sind"), ("employment", "sserv"),
         ("employment", "sagr"), ("yield", "lyld"), ("yield", "D_lyld"),
         ("nightlights", "lmn"), ("nightlights", "D_lmn")]
for ax, (ds, y) in zip(axes.ravel(), order):
    sub = table4[(table4.dataset == ds) & (table4.outcome == y)]
    x = np.arange(3)
    for i, (hz, color) in enumerate([("SR", STEEL_BLUE), ("LR", WARM_ORANGE)]):
        s = sub[sub.horizon == hz].set_index("band").reindex(["near", "mid", "far"])
        ax.bar(x + i * 0.38 - 0.19, s["coef"], 0.36, yerr=1.96 * s["se"], color=color,
               capsize=3, label="Short run" if hz == "SR" else "Long run",
               error_kw=dict(ecolor=LIGHT_TEXT, lw=1.2))
    ax.axhline(0, color=WHITE_TEXT, lw=1)
    ax.set_xticks(x)
    ax.set_xticklabels([BAND_LAB[b] for b in ["near", "mid", "far"]], fontsize=8)
    ax.set_title(PRETTY.get(y, y), fontweight="bold", fontsize=11)
axes[0, 0].legend(fontsize=9)
fig.suptitle("The average effect hides everything: impacts by distance from the bridge",
             fontweight="bold", color=WHITE_TEXT, fontsize=14)
FIG_HET = savefig("heterogeneity_by_distance")


# ── Section 10: Table 3 -- the public-goods placebo ──────────────────────────

banner("SECTION 10: Table 3 -- ruling out the political-economy story")

VILL_VARS = ["dist_Thana", "dist_district", "dist_satellite_clinic", "dist_hos",
             "primary_school", "high_school", "madrassa_school",
             "grameen_bank", "cinema", "post_office", "co_operative_soc", "NGO"]

t3_rows = []
r = stata_fe(HH, "Electricity", ["treat_sr", "treat_lr", "lmdist_t", "rural"],
             unit="District", time="year")
for term, key in [("treat_sr", "SR"), ("treat_lr", "LR")]:
    t3_rows.append({"source": "household", "outcome": "Electricity", "horizon": key,
                    "coef": r["coef"][term], "se": r["se"][term], "p": r["p"][term],
                    "n": r["n"], "units": r["g"]})

for v in VILL_VARS:
    r = stata_fe(VILL, v, ["treat_sr", "treat_lr", "lmdist_t"], unit="District", time="year")
    for term, key in [("treat_sr", "SR"), ("treat_lr", "LR")]:
        if term in r["coef"].index:
            t3_rows.append({"source": "village", "outcome": v, "horizon": key,
                            "coef": r["coef"][term], "se": r["se"][term], "p": r["p"][term],
                            "n": r["n"], "units": r["g"]})
        else:
            t3_rows.append({"source": "village", "outcome": v, "horizon": key,
                            "coef": np.nan, "se": np.nan, "p": np.nan,
                            "n": r["n"], "units": r["g"]})
table3 = pd.DataFrame(t3_rows)
print(table3.round(4).to_string(index=False))
table3.to_csv(f"{SLUG}_table3_public_goods.csv", index=False)

sig = table3.dropna(subset=["p"]).query("p < 0.05")
print(f"\n  Public-goods outcomes significant at 5%: {len(sig)} of "
      f"{table3['p'].notna().sum()} estimates")

plot3 = table3.dropna(subset=["coef"]).copy()
plot3["z"] = plot3["coef"] / plot3["se"]
fig, ax = plt.subplots(figsize=(10, 7))
ypos = np.arange(len(plot3))
colors = [WARM_ORANGE if h == "LR" else STEEL_BLUE for h in plot3["horizon"]]
ax.errorbar(plot3["z"], ypos, xerr=1.96, fmt="o", ms=6, capsize=3, lw=1.4,
            ecolor=LIGHT_TEXT, linestyle="none", markerfacecolor="none")
ax.scatter(plot3["z"], ypos, c=colors, s=44, zorder=3)
ax.axvline(0, color=WHITE_TEXT, lw=1.2)
for v in (-1.96, 1.96):
    ax.axvline(v, color=TEAL, ls="--", lw=1, alpha=0.8)
ax.set_yticks(ypos)
ax.set_yticklabels([f"{r.outcome} ({r.horizon})" for r in plot3.itertuples()], fontsize=9)
ax.set_xlabel("t-statistic")
ax.set_title("Public goods: no bridge effect anywhere\n(the dashed lines are the 5% critical values)",
             fontweight="bold", fontsize=13)
ax.invert_yaxis()
FIG_PLACEBO_PG = savefig("public_goods_placebo")


# ── Section 11: Balance and pre-trends ───────────────────────────────────────

banner("SECTION 11: Balance tests and pre-trends (Appendix Table AT.3)")

bal_rows = []
pre_emp = EMP[EMP["year"] == 1]
for y in ["ldensity", "sind", "sserv", "sagr"]:
    for est, wcol, rhs in [("naive", None, ["treat"]),
                           ("OLS", None, ["treat", "lpop91", "lrainm", "lrainsd", "lmdist"]),
                           ("LWDR", "ipw3", ["treat", "lpop91", "lrainm", "lrainsd", "lmdist"]),
                           ("KOBDR", "ipw4", ["treat", "lpop91", "lrainm", "lrainsd", "lmdist"])]:
        r = stata_ols(pre_emp, y, rhs, cluster="geocode", weight=wcol)
        bal_rows.append({"dataset": "employment", "test": "level", "outcome": y,
                         "estimator": est, "coef": r["coef"]["treat"], "se": r["se"]["treat"],
                         "p": r["p"]["treat"], "n": r["n"]})

pre_nl = NL[NL["year"] <= 2].copy()
pre_nl["treat_t"] = pre_nl["treat"] * pre_nl["year"]
for est, wcol in [("naive", None), ("OLS", None), ("LWDR", "ipw3"), ("KOBDR", "ipw4")]:
    rhs = ["treat"] if est == "naive" else ["treat"] + CONTROLS
    r = stata_ols(pre_nl, "lmn", rhs, cluster="geocode", time="year", weight=wcol)
    bal_rows.append({"dataset": "nightlights", "test": "level", "outcome": "lmn",
                     "estimator": est, "coef": r["coef"]["treat"], "se": r["se"]["treat"],
                     "p": r["p"]["treat"], "n": r["n"]})
    rhs_t = ["treat_t", "lmdist_t"] if est == "naive" else ["treat_t"] + CONTROLS
    rt = stata_fe(pre_nl, "lmn", rhs_t, unit="geocode", time="year", weight=wcol)
    bal_rows.append({"dataset": "nightlights", "test": "trend", "outcome": "lmn",
                     "estimator": est, "coef": rt["coef"]["treat_t"], "se": rt["se"]["treat_t"],
                     "p": rt["p"]["treat_t"], "n": rt["n"]})

pre_yld = YLD[YLD["year"] <= 3].copy()
pre_yld["treat_t"] = pre_yld["treat"] * pre_yld["year"]
for est, wcol in [("naive", None), ("OLS", None), ("LWDR", "ipw1"), ("KOBDR", "ipw2")]:
    rhs = ["treat"] if est == "naive" else ["treat"] + CONTROLS
    r = stata_ols(pre_yld, "lyld", rhs, cluster="dist", time="year", weight=wcol)
    bal_rows.append({"dataset": "yield", "test": "level", "outcome": "lyld", "estimator": est,
                     "coef": r["coef"]["treat"], "se": r["se"]["treat"], "p": r["p"]["treat"],
                     "n": r["n"]})
    rhs_t = ["treat_t"] if est == "naive" else ["treat_t"] + CONTROLS
    rt = stata_fe(pre_yld, "lyld", rhs_t, unit="dist", time="year", weight=wcol)
    bal_rows.append({"dataset": "yield", "test": "trend", "outcome": "lyld", "estimator": est,
                     "coef": rt["coef"]["treat_t"], "se": rt["se"]["treat_t"],
                     "p": rt["p"]["treat_t"], "n": rt["n"]})

balance = pd.DataFrame(bal_rows)
print(balance.round(4).to_string(index=False))
balance.to_csv(f"{SLUG}_balance_pretrends.csv", index=False)

fig, ax = plt.subplots(figsize=(10, 7.5))
b = balance.reset_index(drop=True)
ypos = np.arange(len(b))
cmap = {"naive": LIGHT_TEXT, "OLS": STEEL_BLUE, "LWDR": WARM_ORANGE, "KOBDR": TEAL}
ax.errorbar(b["coef"], ypos, xerr=1.96 * b["se"], fmt="none", ecolor=LIGHT_TEXT, lw=1.2,
            capsize=3)
ax.scatter(b["coef"], ypos, c=[cmap[e] for e in b["estimator"]], s=46, zorder=3)
ax.axvline(0, color=WHITE_TEXT, lw=1.2)
ax.set_yticks(ypos)
ax.set_yticklabels([f"{r.outcome} {r.test} [{r.estimator}]" for r in b.itertuples()], fontsize=8)
ax.set_xlabel("Pre-bridge treated-comparison difference")
ax.set_title("Balance and pre-trends: conditioning removes the level gaps,\nand no trend gap survives",
             fontweight="bold", fontsize=13)
ax.invert_yaxis()
handles = [plt.Line2D([], [], marker="o", ls="none", color=c, label=k) for k, c in cmap.items()]
ax.legend(handles=handles, loc="lower right")
FIG_BALANCE_FOREST = savefig("balance_pretrends")


# ── Section 12: diff-diff diagnostics ────────────────────────────────────────

banner("SECTION 12: diff-diff diagnostics -- parallel trends, placebo, HonestDiD")

pt = check_parallel_trends(NL, outcome="lmn", time="year", treatment_group="treat",
                           pre_periods=[1, 2])
print("  check_parallel_trends (nightlights, 1992-97):")
for k, v in pt.items():
    print(f"    {k:28s} {v if isinstance(v, (bool, str)) else round(float(v), 5)}")

eq = equivalence_test_trends(NL, outcome="lmn", time="year", treatment_group="treat",
                             unit="geocode", pre_periods=[1, 2])
print("\n  equivalence_test_trends:")
for k, v in eq.items():
    print(f"    {k:28s} {v if isinstance(v, (bool, str)) else round(float(v), 5)}")

diag = {"parallel_trends": pt, "equivalence": eq}

print("\n  placebo_timing_test (pretend the bridge opened in 1995-97, one period early):")
pl = placebo_timing_test(NL, outcome="lmn", treatment="treat", time="year",
                         fake_treatment_period=2, post_periods=[3, 4, 5, 6, 7],
                         cluster="geocode")
print(f"    placebo effect = {pl.placebo_effect:+.5f} (se {pl.se:.5f}), "
      f"p = {pl.p_value:.4f}, significant = {pl.is_significant}")
print(f"    for comparison, the real effect is {pl.original_effect:+.5f} "
      f"(se {pl.original_se:.5f})")
diag["placebo"] = {"effect": float(pl.placebo_effect), "se": float(pl.se),
                   "p": float(pl.p_value), "significant": bool(pl.is_significant)}

print("\n  HonestDiD sensitivity (Rambachan and Roth relative-magnitude bounds):")
honest_rows = []
for M in [0.0, 0.25, 0.5, 1.0, 1.5, 2.0]:
    h = compute_honest_did(es_nl_res, method="relative_magnitude", M=M)
    honest_rows.append({"M": M, "lb": h.ci_lb, "ub": h.ci_ub,
                        "significant": bool(h.ci_lb > 0 or h.ci_ub < 0)})
    print(f"    M={M:<4} CI = [{h.ci_lb:+.4f}, {h.ci_ub:+.4f}]  "
          f"{'excludes zero' if honest_rows[-1]['significant'] else 'includes zero'}")
honest = pd.DataFrame(honest_rows)
honest.to_csv(f"{SLUG}_honest_did.csv", index=False)

breakdown = honest.loc[~honest["significant"], "M"].min() if (~honest["significant"]).any() else None
print(f"\n  Breakdown value: the nightlights result survives until M = "
      f"{breakdown if breakdown is not None else '> 2.0'}")

fig, ax = plt.subplots(figsize=(9.5, 5.5))
ax.fill_between(honest["M"], honest["lb"], honest["ub"], color=STEEL_BLUE, alpha=0.35,
                label="HonestDiD confidence set")
ax.plot(honest["M"], honest["lb"], color=STEEL_BLUE, lw=2)
ax.plot(honest["M"], honest["ub"], color=STEEL_BLUE, lw=2)
ax.axhline(0, color=WARM_ORANGE, lw=2, ls="--", label="No effect")
ax.set_xlabel("M -- allowed post-treatment violation, as a multiple of the largest pre-trend")
ax.set_ylabel("Effect on log(luminosity + 1)")
ax.set_title("How wrong could parallel trends be before the nightlights result dies?",
             fontweight="bold", fontsize=13)
ax.legend()
FIG_HONEST = savefig("honest_did_sensitivity")

# Randomisation inference: reassign treatment across upazilas and see how often we beat the truth.
rng = np.random.default_rng(RANDOM_SEED)
units = NL.drop_duplicates("geocode")[["geocode", "treat"]].reset_index(drop=True)
truth = table1.query("dataset == 'nightlights' and outcome == 'lmn' and estimator == 'OLS'")["coef"].iloc[0]
null = []
for _ in range(500):
    perm = units.copy()
    perm["ptreat"] = rng.permutation(perm["treat"].to_numpy())
    tmp = NL.merge(perm[["geocode", "ptreat"]], on="geocode")
    tmp["treat_post"] = tmp["ptreat"] * tmp["post"]
    r = stata_fe(tmp, "lmn", ["treat_post", "post"] + CONTROLS, unit="geocode", time="year")
    null.append(r["coef"]["treat_post"])
null = np.array(null)
p_ri = float((np.abs(null) >= abs(truth)).mean())
print(f"\n  Randomisation inference over 500 placebo assignments:")
print(f"    true estimate {truth:+.4f}; placebo |effect| >= |true| in {p_ri:.1%} of draws")
diag["randomization_p"] = p_ri
pd.DataFrame({"placebo_effect": null}).to_csv(f"{SLUG}_randomization_null.csv", index=False)

fig, ax = plt.subplots(figsize=(9.5, 5.5))
ax.hist(null, bins=34, color=STEEL_BLUE, alpha=0.85)
ax.axvline(truth, color=WARM_ORANGE, lw=2.5, label=f"Actual estimate {truth:+.4f}")
ax.axvline(-truth, color=WARM_ORANGE, lw=1.2, ls=":")
ax.set_xlabel("Placebo difference-in-differences estimate")
ax.set_ylabel("Draws")
ax.set_title(f"Randomisation inference: p = {p_ri:.3f}", fontweight="bold", fontsize=13)
ax.legend()
FIG_RI = savefig("randomization_inference")


# ── Section 13: Three engines, one specification ─────────────────────────────

banner("SECTION 13: Estimator agreement -- diff-diff, pyfixest, and Stata's recipe")


def diffdiff_mean(data, outcome, unit, wcol=None):
    """Run the mean-effect specification through diff-diff.

    Unweighted, the library reproduces Stata exactly when both fixed effects are absorbed.
    Weighted, diff-diff refuses to absorb two dimensions at once, so the year effects go in as
    covariates and inference switches to the design-based survey path -- same point estimate,
    a different (Taylor-linearised) standard error.
    """
    need = [outcome] + CONTROLS + ([wcol] if wcol else [])
    d = data.dropna(subset=need).copy()
    if wcol is None:
        r = DifferenceInDifferences(cluster=unit).fit(
            d, outcome=outcome, treatment="treat", time="post", covariates=CONTROLS,
            absorb=[unit, "year"], unit=unit)
    else:
        d = d.copy()
        dums = pd.get_dummies(d["year"], prefix="yd", drop_first=True).astype(float)
        for c in dums.columns:
            d[c] = dums[c].to_numpy()
        r = DifferenceInDifferences(cluster=unit).fit(
            d, outcome=outcome, treatment="treat", time="post",
            covariates=CONTROLS + list(dums.columns), absorb=[unit], unit=unit,
            survey_design=SurveyDesign(weights=wcol, weight_type="aweight", psu=unit))
    return r.att, r.se, r.n_obs


agree_rows = []
for ds, cfg in SPECS.items():
    unit = cfg["unit"]
    for y in cfg["outcomes"]:
        for est in ["OLS", "LWDR", "KOBDR"]:
            wcol = None if est == "OLS" else cfg["w"][est]
            rhs = ["treat_post"] + cfg["extra_post"] + CONTROLS
            man = stata_fe(cfg["data"], y, rhs, unit=unit, time="year", weight=wcol)
            fml = f"{y} ~ " + " + ".join(rhs) + f" | {unit} + year"
            sub = cfg["data"] if wcol is None else cfg["data"][cfg["data"][wcol].notna()]
            fe = pf.feols(fml, data=sub.dropna(subset=[y] + rhs), weights=wcol,
                          vcov={"CRV1": unit})
            dd_b, dd_se, dd_n = diffdiff_mean(cfg["data"], y, unit, wcol)
            agree_rows.append({
                "dataset": ds, "outcome": y, "estimator": est,
                "stata_recipe_coef": man["coef"]["treat_post"], "stata_recipe_se": man["se"]["treat_post"],
                "pyfixest_coef": float(fe.coef()["treat_post"]), "pyfixest_se": float(fe.se()["treat_post"]),
                "diffdiff_coef": dd_b, "diffdiff_se": dd_se,
            })
agree = pd.DataFrame(agree_rows)
agree["max_coef_gap"] = agree[["stata_recipe_coef", "pyfixest_coef", "diffdiff_coef"]].max(axis=1) - \
    agree[["stata_recipe_coef", "pyfixest_coef", "diffdiff_coef"]].min(axis=1)
agree["max_se_gap"] = agree[["stata_recipe_se", "pyfixest_se", "diffdiff_se"]].max(axis=1) - \
    agree[["stata_recipe_se", "pyfixest_se", "diffdiff_se"]].min(axis=1)
print(agree.round(5).to_string(index=False))
agree.to_csv(f"{SLUG}_estimator_agreement.csv", index=False)
print(f"\n  Largest coefficient disagreement across the three engines: "
      f"{agree['max_coef_gap'].max():.6f}")
print(f"  Largest standard-error disagreement: {agree['max_se_gap'].max():.6f}")

fig, axes = plt.subplots(1, 2, figsize=(13, 5.5))
axes[0].scatter(agree["stata_recipe_coef"], agree["pyfixest_coef"], s=55, color=STEEL_BLUE,
                label="pyfixest", alpha=0.85, edgecolors="none")
axes[0].scatter(agree["stata_recipe_coef"], agree["diffdiff_coef"], s=55, color=WARM_ORANGE,
                marker="s", label="diff-diff", alpha=0.85, edgecolors="none")
lim = [agree["stata_recipe_coef"].min() - 0.02, agree["stata_recipe_coef"].max() + 0.02]
axes[0].plot(lim, lim, color=WHITE_TEXT, ls=":", lw=1.3)
axes[0].set_xlabel("Stata recipe, coefficient")
axes[0].set_ylabel("Library coefficient")
axes[0].set_title("Point estimates: all three agree", fontweight="bold", fontsize=12)
axes[0].legend()

axes[1].scatter(agree["stata_recipe_se"], agree["pyfixest_se"], s=55, color=STEEL_BLUE,
                label="pyfixest", alpha=0.85, edgecolors="none")
axes[1].scatter(agree["stata_recipe_se"], agree["diffdiff_se"], s=55, color=WARM_ORANGE,
                marker="s", label="diff-diff (survey path)", alpha=0.85, edgecolors="none")
lim = [0, agree[["stata_recipe_se", "pyfixest_se", "diffdiff_se"]].to_numpy().max() * 1.08]
axes[1].plot(lim, lim, color=WHITE_TEXT, ls=":", lw=1.3)
axes[1].set_xlabel("Stata recipe, standard error")
axes[1].set_ylabel("Library standard error")
axes[1].set_title("Standard errors: the survey path differs by design",
                  fontweight="bold", fontsize=12)
axes[1].legend()
FIG_AGREE = savefig("estimator_agreement")


# ── Section 14: Forensics -- the macro that was never defined ────────────────

banner("SECTION 14: Reproducing the $trimL bug in nite_2021.do")

# `employment_2021.do` sets `global trimL 5`. `nite_2021.do` never does, but still writes
# `gen cut11 = r(p$trimL)`, which expands to the non-existent `r(p)`. Every cut11 is missing.
# The next line, `replace ipw4 = . if p < cut11 & treat == 0`, then fires for every control,
# because in Stata a missing value is larger than any number. The regression that follows runs
# on treated upazilas only -- and prints a coefficient without a single warning.
nl_bug = nl.drop(columns=["p", "ipw1", "ipw2", "ipw3", "ipw4"]).merge(
    nl_w.assign(ipw3_bug=lambda d: np.where(d["treat"] == 0, np.nan, d["ipw1"]),
                ipw4_bug=lambda d: np.where(d["treat"] == 0, np.nan, d["ipw2"]))
        .groupby(["geocode", "year"])[["ipw3_bug", "ipw4_bug"]].first().reset_index(),
    on=["geocode", "year"], how="left")
NL_BUG = nl_bug[nl_bug["smp1"].notna()].copy()
NL_BUG["year"] = NL_BUG["year"].astype(int)

forensics = []
for label, data, wcol in [("published (trim = 5th pctile)", NL, "ipw4"),
                          ("as shipped (trimL undefined)", NL_BUG, "ipw4_bug")]:
    for y in ["lmn", "D_lmn"]:
        r = stata_fe(data, y, ["treat_post", "post"] + CONTROLS, unit="geocode", time="year",
                     weight=wcol)
        forensics.append({"run": label, "outcome": y, "coef": r["coef"]["treat_post"],
                          "se": r["se"]["treat_post"], "n": r["n"], "units": r["g"]})
        print(f"  {label:32s} {y:7s} {r['coef']['treat_post']:+.4f} "
              f"({r['se']['treat_post']:.4f})  N={r['n']:5d}  upazilas={r['g']}")
forensics = pd.DataFrame(forensics)
forensics.to_csv(f"{SLUG}_trimL_forensics.csv", index=False)
print("\n  The authors' own archived output records both runs: nlite_mean.txt carries the")
print("  degenerate numbers, nlite2_mean.txt the correct ones. Only the latter reached print.")

fig, axes = plt.subplots(1, 2, figsize=(13, 5.2))
sub = forensics[forensics.outcome == "lmn"]
for i, r in enumerate(sub.itertuples()):
    color = TEAL if "published" in r.run else WARM_ORANGE
    axes[0].errorbar(r.coef, i, xerr=1.96 * r.se, fmt="o", ms=11, color=color, capsize=6, lw=2.2)
    axes[0].text(r.coef, i + 0.18, f"{r.coef:.3f} ({r.se:.3f})", color=color, ha="center",
                 fontsize=10, fontweight="bold")
axes[0].axvline(0, color=WHITE_TEXT, lw=1.2)
axes[0].set_yticks(range(len(sub)))
axes[0].set_yticklabels([r.run for r in sub.itertuples()], fontsize=10)
axes[0].set_ylim(-0.6, len(sub) - 0.2)
axes[0].set_xlabel("Effect on log(luminosity + 1)")
axes[0].set_title("One undefined macro, two different papers", fontweight="bold", fontsize=12)

axes[1].bar(range(len(sub)), sub["units"], color=[TEAL, WARM_ORANGE], width=0.55)
for i, r in enumerate(sub.itertuples()):
    axes[1].text(i, r.units + 4, f"{r.units} upazilas\nN = {r.n:,}", ha="center",
                 color=WHITE_TEXT, fontsize=10, fontweight="bold")
axes[1].set_xticks(range(len(sub)))
axes[1].set_xticklabels(["published", "as shipped"], fontsize=10)
axes[1].set_ylabel("Upazilas in the regression")
axes[1].set_ylim(0, sub["units"].max() * 1.25)
axes[1].set_title("The tell is in the footer, not the coefficient", fontweight="bold", fontsize=12)
FIG_TRIM = savefig("trimL_forensics")


# ── Section 15: The reproduction audit ───────────────────────────────────────

banner("SECTION 15: Reproduction audit against the authors' Stata output")

audit = []


def add_audit(table, outcome, estimator, term, coef, se):
    key = (table, outcome, estimator, term)
    if key not in STATA:
        return
    pc, ps = STATA[key]
    audit.append({"table": table, "outcome": outcome, "estimator": estimator, "term": term,
                  "stata_coef": pc, "stata_se": ps, "python_coef": coef, "python_se": se,
                  "abs_diff_coef": abs(coef - pc), "abs_diff_se": abs(se - ps)})


for r in table1.itertuples():
    add_audit("T1", r.outcome, r.estimator, "mean", r.coef, r.se)
for r in table2.itertuples():
    add_audit("T2", r.outcome, r.estimator, r.horizon, r.coef, r.se)
for r in table3.dropna(subset=["coef"]).itertuples():
    add_audit("T3", r.outcome, "KOBDR", r.horizon, r.coef, r.se)
for r in table4.itertuples():
    add_audit("T4", r.outcome, "KOBDR", f"{r.horizon}_{r.band}", r.coef, r.se)

audit = pd.DataFrame(audit)
# The Stata tables are printed to three decimals, so a match means "rounds to the same number".
audit["match_coef"] = audit["abs_diff_coef"] <= 0.0006
audit["match_se"] = audit["abs_diff_se"] <= 0.0006
audit["match_flag"] = np.where(audit["match_coef"] & audit["match_se"], "exact",
                               np.where(audit["match_coef"], "coef only", "differs"))
audit = audit.sort_values(["table", "outcome", "estimator", "term"]).reset_index(drop=True)
print(audit.round(5).to_string(index=False))
audit.to_csv(f"{SLUG}_audit_reproduction.csv", index=False)

n_tot = len(audit)
n_exact = int((audit["match_flag"] == "exact").sum())
n_coef = int(audit["match_coef"].sum())
print(f"\n  {n_coef} of {n_tot} coefficients reproduce to the printed precision "
      f"({n_coef / n_tot:.1%})")
print(f"  {n_exact} of {n_tot} reproduce both the coefficient and the standard error "
      f"({n_exact / n_tot:.1%})")
if (audit["match_flag"] == "differs").any():
    print("\n  Rows that do not reproduce:")
    print(audit[audit.match_flag == "differs"].round(5).to_string(index=False))

fig, axes = plt.subplots(1, 2, figsize=(13, 5.5))
for ax, (a, b, lab) in zip(axes, [("stata_coef", "python_coef", "Coefficients"),
                                  ("stata_se", "python_se", "Standard errors")]):
    for tbl, color, mk in [("T1", STEEL_BLUE, "o"), ("T2", WARM_ORANGE, "s"),
                           ("T3", TEAL, "^"), ("T4", LIGHT_TEXT, "D")]:
        sub = audit[audit.table == tbl]
        ax.scatter(sub[a], sub[b], s=42, color=color, marker=mk, alpha=0.85,
                   edgecolors="none", label=f"Table {tbl[1]}")
    lo, hi = audit[[a, b]].to_numpy().min(), audit[[a, b]].to_numpy().max()
    pad = (hi - lo) * 0.06
    ax.plot([lo - pad, hi + pad], [lo - pad, hi + pad], color=WHITE_TEXT, ls=":", lw=1.3)
    ax.set_xlabel(f"Published Stata {lab.lower()}")
    ax.set_ylabel(f"Python {lab.lower()}")
    ax.set_title(lab, fontweight="bold", fontsize=12)
axes[0].legend(fontsize=9)
fig.suptitle(f"Reproduction audit: {n_coef}/{n_tot} coefficients match to three decimals",
             fontweight="bold", color=WHITE_TEXT, fontsize=14)
FIG_AUDIT = savefig("reproduction_audit")


# ── Section 16: Headline coefficient plots ───────────────────────────────────

banner("SECTION 16: Headline results")

fig, ax = plt.subplots(figsize=(10, 7))
plot1 = table1.copy()
plot1["lab"] = plot1["outcome"].map(lambda s: PRETTY.get(s, s)) + " [" + plot1["estimator"] + "]"
ypos = np.arange(len(plot1))
cmap = {"OLS": STEEL_BLUE, "LWDR": WARM_ORANGE, "KOBDR": TEAL}
ax.errorbar(plot1["coef"], ypos, xerr=1.96 * plot1["se"], fmt="none", ecolor=LIGHT_TEXT,
            lw=1.2, capsize=3)
ax.scatter(plot1["coef"], ypos, c=[cmap[e] for e in plot1["estimator"]], s=46, zorder=3)
ax.axvline(0, color=WHITE_TEXT, lw=1.2)
ax.set_yticks(ypos)
ax.set_yticklabels(plot1["lab"], fontsize=8)
ax.set_xlabel("Mean post-bridge effect")
ax.set_title("Table 1: the average effect of the Jamuna Bridge", fontweight="bold", fontsize=13)
ax.invert_yaxis()
handles = [plt.Line2D([], [], marker="o", ls="none", color=c, label=k) for k, c in cmap.items()]
ax.legend(handles=handles, loc="lower right")
FIG_T1 = savefig("forest_table1")

kob = table2[table2.estimator == "KOBDR"].copy()
fig, ax = plt.subplots(figsize=(10, 6.5))
outs = list(dict.fromkeys(kob["outcome"]))
ypos = np.arange(len(outs))
for i, (hz, color, off) in enumerate([("SR", STEEL_BLUE, -0.16), ("LR", WARM_ORANGE, 0.16)]):
    s = kob[kob.horizon == hz].set_index("outcome").reindex(outs)
    ax.errorbar(s["coef"], ypos + off, xerr=1.96 * s["se"], fmt="o", ms=7, color=color,
                capsize=3, lw=1.5, label="Short run" if hz == "SR" else "Long run")
ax.axvline(0, color=WHITE_TEXT, lw=1.2)
ax.set_yticks(ypos)
ax.set_yticklabels([PRETTY.get(o, o) for o in outs], fontsize=10)
ax.set_xlabel("Effect (KOBDR)")
ax.set_title("Table 2: the story changes completely between the short and the long run",
             fontweight="bold", fontsize=13)
ax.invert_yaxis()
ax.legend()
FIG_T2 = savefig("forest_table2")


# ── Section 17: Summary ──────────────────────────────────────────────────────

banner("SECTION 17: Summary")

kob1 = table1[table1.estimator == "KOBDR"].set_index("outcome")
kob2 = table2[table2.estimator == "KOBDR"].set_index(["outcome", "horizon"])
summary = {
    "n_figures": FIG,
    "audit_rows": n_tot,
    "audit_coef_matches": n_coef,
    "audit_exact_matches": n_exact,
    "nightlights_mean_kobdr": float(kob1.loc["lmn", "coef"]),
    "nightlights_lr_kobdr": float(kob2.loc[("lmn", "LR"), "coef"]),
    "yield_lr_kobdr": float(kob2.loc[("lyld", "LR"), "coef"]),
    "density_sr_kobdr": float(kob2.loc[("ldensity", "SR"), "coef"]),
    "density_lr_kobdr": float(kob2.loc[("ldensity", "LR"), "coef"]),
    "industry_lr_kobdr": float(kob2.loc[("sind", "LR"), "coef"]),
    "services_lr_kobdr": float(kob2.loc[("sserv", "LR"), "coef"]),
    "yield_lr_far_band": float(table4.query(
        "outcome == 'lyld' and horizon == 'LR' and band == 'far'")["coef"].iloc[0]),
    "randomization_p": p_ri,
    "honest_breakdown_M": None if breakdown is None else float(breakdown),
    "estimator_max_coef_gap": float(agree["max_coef_gap"].max()),
}
print(json.dumps(summary, indent=2))
with open(f"{SLUG}_summary.json", "w") as fh:
    json.dump(summary, fh, indent=2)

print(f"""
  The bridge did not hollow out the Jamuna hinterland.
    Population density   {summary['density_sr_kobdr']:+.3f} short run, then \
{summary['density_lr_kobdr']:+.3f} long run
    Industry share       {summary['industry_lr_kobdr']:+.3f} in the long run
    Services share       {summary['services_lr_kobdr']:+.3f} in the long run
    Rice yield           {summary['yield_lr_kobdr']:+.3f} in the long run
    Nightlights          {summary['nightlights_lr_kobdr']:+.3f} in the long run
  Manufacturing fell, but density rose -- which is exactly the pattern the core-periphery
  backwash story cannot produce, and the comparative-advantage story predicts.
""")

with open("README.md", "w") as fh:
    fh.write(f"""# {SLUG} -- artifact inventory

Replication of Blankespoor, Emran, Shilpi and Xu (2021), *Bridge to bigpush or backwash?*

Run with `python analysis.py 2>&1 | tee execution_log.txt`.

## Data (`data/`)
| File | Rows | Description |
|---|---|---|
| `bridge_nightlights.csv` | {len(nl_raw)} | DMSP-OLS luminosity, upazila x 3-year period, 1992-2013 |
| `bridge_employment.csv` | {len(emp_raw)} | Population censuses 1991/2001/2011, upazila |
| `bridge_yield.csv` | {len(yld_raw)} | Boro rice yield, former district x period, 1988-2013 |
| `bridge_dhs_household.csv` | {len(hh_raw)} | DHS/HIES household questionnaire, village-year |
| `bridge_dhs_village.csv` | {len(vill_raw)} | DHS village questionnaire, village-year |

## Figures
{FIG} PNGs named `{SLUG}_NN_<name>.png`, 300 dpi, dark navy.

## Result tables
`{SLUG}_table1_mean_effects.csv`, `_table2_short_long_run.csv`, `_table3_public_goods.csv`,
`_table4_heterogeneity.csv`, `_balance_pretrends.csv`, `_event_study_*.csv`,
`_estimator_agreement.csv`, `_audit_reproduction.csv`, `_honest_did.csv`,
`_randomization_null.csv`, `_covariate_balance.csv`, `_distance_bands.csv`,
`_pre_bridge_gradients.csv`, `_did_2x2.csv`, `_summary.json`.

## Reproduction
{n_coef} of {n_tot} published coefficients reproduce to the printed three decimals.
""")

print("\n=== Script completed successfully ===")
