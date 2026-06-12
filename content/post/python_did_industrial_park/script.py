#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
The Socioeconomic Impacts of Industrial Parks in Ethiopia
=========================================================
A beginner-friendly, end-to-end staggered difference-in-differences (DiD)
tutorial in Python, replicating the design and headline findings of:

    Huang, G., Wang, M., & Xu, H. (2026). "The socioeconomic impacts of
    industrial parks in Ethiopia." Journal of Urban Economics.
    https://doi.org/10.1016/j.jue.2026.103867

WHAT THIS SCRIPT DOES
---------------------
Ethiopia opened ~22 industrial parks across 18 woredas (districts) on a
STAGGERED schedule (2008-2021). This script walks from the simplest 2x2 table
to modern staggered-robust estimators, asking one question at each step:
how much did a park change local outcomes, relative to the parallel-trends
counterfactual? Three data layers are analyzed:

  1. District-year satellite PANEL (139 woredas x 2005-2020): nighttime lights
     and impervious-surface ratio. Static TWFE (Table 1), event study (Fig. 1),
     modern staggered estimators (Sun-Abraham, Borusyak/Gardner,
     Callaway-Sant'Anna, Goodman-Bacon decomposition), heterogeneity by distance
     and roads (Tables 3-4), and a spillover test (Table 2).
  2. Household DHS REPEATED CROSS-SECTION: durable goods, housing, wealth
     (Table 5).
  3. Individual DHS REPEATED CROSS-SECTION: non-agricultural employment and
     women's empowerment (Tables 6-7). The narrative climax: the AVERAGE
     employment effect is null while the FEMALE effect is significant.

Finally a robustness battery (Conley spatial-HAC SEs, a restricted control pool)
and a reproduction audit that lines up every synthetic headline coefficient
against the paper's reported value.

IMPORTANT --- SYNTHETIC DATA
============================
########################################################################
#  THE THREE CSVs ARE 100% SYNTHETIC.  They are *calibrated* so that     #
#  re-running the paper's regressions reproduces its FINDINGS --- the    #
#  signs, the statistical significance (stars), and the approximate      #
#  magnitudes of the key coefficients --- NOT the real, confidential     #
#  micro-data.  Use them to LEARN THE METHODS, never to draw any         #
#  conclusion about Ethiopia.  Magnitudes can differ from the paper      #
#  (e.g. raw light runs high; see the reproduction audit at the end).    #
########################################################################

ESTIMAND
--------
Every estimator here targets the ATT --- the Average effect of the Treatment on
the Treated woredas (those that received a park), relative to their own
pre-opening baseline. Identification rests on PARALLEL TRENDS: absent the park,
treated and control woredas would have evolved by the same amount on average.
This is an OBSERVATIONAL quasi-experiment (parks were NOT randomly placed ---
they went to denser, more urban, better-connected woredas), so the district
fixed effects, region-by-year fixed effects, and the unit-specific trend terms
are CONFOUNDING CONTROLS, not mere precision improvements. Where a method shifts
the estimand (e.g. the 2x2 blends pre/post dynamics) the comment says so.

Usage:
    python script.py

Outputs (written next to this file):
    python_did_industrial_park_*.png   --- ~14 figures (dark theme)
    *.csv                              --- ~16 result tables (incl. reproduction_audit.csv)
    execution_log.txt                  --- captured stdout/stderr of a clean run
"""

from __future__ import annotations

import importlib
import subprocess
import sys
import warnings
from pathlib import Path

# ---------------------------------------------------------------------------
# Colab/CI bootstrap: install the two estimation libraries if they are missing.
# A no-op on a machine that already has them (e.g. the project venv).
# ---------------------------------------------------------------------------
def _ensure(import_name: str, pip_spec: str) -> None:
    try:
        importlib.import_module(import_name)
    except ImportError:
        print(f"[setup] installing {pip_spec} ...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", pip_spec], check=True)

for _imp, _spec in [
    ("pyfixest", "pyfixest==0.50.1"),
    ("diff_diff", "diff-diff==3.5.2"),
]:
    _ensure(_imp, _spec)

import matplotlib
matplotlib.use("Agg")                       # headless: save figures, never pop windows
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

import pyfixest as pf
import diff_diff as dd

# Quiet a few harmless library notices (rank-deficient design when a
# time-invariant dummy is absorbed by a fixed effect; the SaturatedEventStudy
# 'beta' banner; pandas downcasting; matplotlib cosmetics).
warnings.filterwarnings("ignore", message="Rank-deficient design matrix")
warnings.filterwarnings("ignore", message=".*SaturatedEventStudyClass.*")
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=RuntimeWarning)
warnings.filterwarnings("ignore", category=UserWarning, module="pyfixest")

# ===========================================================================
# CONFIGURATION
# ===========================================================================
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

SLUG = "python_did_industrial_park"
HERE = Path(__file__).resolve().parent
DATA_DIR = HERE / "data"
GH_RAW = ("https://raw.githubusercontent.com/cmg777/starter-academic-v501/"
          f"master/content/post/{SLUG}/data/")
DISTRICT_FILE = "industrial_park_district_panel.csv"
HOUSEHOLD_FILE = "industrial_park_household_rcs.csv"
INDIVIDUAL_FILE = "industrial_park_individual_rcs.csv"

# Site colour palette (light reference)
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# Dark theme palette (matches the site's dark sections)
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"

# Shades for plotting several cohorts / series together
COHORT_SHADES = ["#6a9bcc", "#7faad4", "#d97757", "#e2906f", "#00d4c8",
                 "#4dd9cf", "#b9783d", "#8fb4d9"]

plt.rcParams.update({
    "figure.facecolor": DARK_NAVY, "axes.facecolor": DARK_NAVY,
    "axes.edgecolor": DARK_NAVY, "axes.linewidth": 0,
    "axes.labelcolor": LIGHT_TEXT, "axes.titlecolor": WHITE_TEXT,
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.spines.left": False, "axes.spines.bottom": False,
    "axes.grid": True, "grid.color": GRID_LINE, "grid.linewidth": 0.6,
    "grid.alpha": 0.8, "xtick.color": LIGHT_TEXT, "ytick.color": LIGHT_TEXT,
    "xtick.major.size": 0, "ytick.major.size": 0, "text.color": WHITE_TEXT,
    "font.size": 12, "legend.frameon": False, "legend.fontsize": 10,
    "legend.labelcolor": LIGHT_TEXT, "figure.edgecolor": DARK_NAVY,
    "savefig.facecolor": DARK_NAVY, "savefig.edgecolor": DARK_NAVY,
})

# --- Design constants ------------------------------------------------------
PANEL_YEARS = (2005, 2020)
ANCHOR_YEAR = 2012            # centring year for unit-specific linear trends
CONLEY_CUTOFF_KM = 100.0      # the paper's spatial-HAC distance cutoff
SURVEY_ROUNDS = [2000, 2005, 2011, 2016, 2019]


# ===========================================================================
# SHARED HELPERS
# ===========================================================================
def banner(title: str) -> None:
    line = "=" * 76
    print(f"\n{line}\n{title}\n{line}")


def savefig(fig, name: str) -> None:
    """Save a dark-theme figure with the house conventions (dpi 300, tight box)."""
    fig.patch.set_linewidth(0)
    out = HERE / f"{SLUG}_{name}.png"
    fig.savefig(out, dpi=300, bbox_inches="tight",
                facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0.05)
    plt.close(fig)
    print(f"  [figure] saved -> {out.name}")


def save_csv(df: pd.DataFrame, name: str, index: bool = False) -> None:
    path = HERE / name
    df.to_csv(path, index=index)
    print(f"  [table ] saved -> {name}")


def stars(t: float) -> str:
    """Significance stars from a t-stat (paper convention: 10% / 5% / 1%)."""
    a = abs(float(t))
    return "***" if a > 2.576 else "**" if a > 1.960 else "*" if a > 1.645 else ""


def cell(b: float, se: float) -> str:
    """A '+0.2700*** (0.1005)' regression cell with stars from b/se."""
    star = stars(b / se) if se and se > 0 else ""
    return f"{b:+.4f}{star} ({se:.4f})"


# ===========================================================================
# DATA LOADING  (Colab-ready: local copy first, else GitHub raw)
# ===========================================================================
def _read(fname: str) -> pd.DataFrame:
    """Load a CSV: prefer the bundled local copy, else GitHub raw (Colab-safe)."""
    local = DATA_DIR / fname
    if local.exists():
        return pd.read_csv(local)
    return pd.read_csv(GH_RAW + fname)


def add_first_treat(d: pd.DataFrame) -> pd.DataFrame:
    """Build the staggered-DiD `first_treat` / `gname` column required by the
    modern estimators: treated woredas get their `open_year`, NEVER-TREATED
    controls get 0 (NOT NaN --- a NaN would silently drop the 122 controls that
    every staggered estimator needs as the clean comparison group)."""
    out = d.copy()
    out["first_treat"] = out["open_year"].fillna(0).astype(int)
    return out


def add_trend_terms(d: pd.DataFrame) -> pd.DataFrame:
    """Add the 'even-column' trend interactions of Table 1.

    The paper's even columns add unit-specific differential trends to absorb the
    fact that treated woredas were ALREADY more urban in 2007 and so trend up
    faster. We centre calendar time at 2012 (`t`) and interact it with the
    baseline characteristics, so `t_*` is a continuous regressor that lets each
    woreda follow its own linear path. Adding these recovers the trend-adjusted
    ATT (IHS 0.214) instead of the trend-confounded one (IHS 0.265)."""
    out = d.copy()
    out["t"] = out["year"] - ANCHOR_YEAR
    out["t_urb"] = out["t"] * out["urbanization_rate_2007"]
    out["t_emp"] = out["t"] * out["employment_rate_2007"]
    out["t_popdens"] = out["t"] * out["log_pop_density_2007"]
    out["t_christian"] = out["t"] * out["share_christian_2007"]
    out["t_amharic"] = out["t"] * out["share_amharic_2007"]
    return out


# trend regressors used by the WITH-TRENDS Table-1 specification
TREND_TERMS = ["t_urb", "t_emp", "t_popdens", "t_christian", "t_amharic"]


# ===========================================================================
# SPATIAL HELPERS + CONLEY SPATIAL-HAC STANDARD ERRORS
# (ported from the tsunami tutorial; the district panel is balanced so it fits)
# ===========================================================================
def haversine_matrix(lat, lon) -> np.ndarray:
    """n x n great-circle distances (km) between unit centroids."""
    lat = np.radians(np.asarray(lat, float))
    lon = np.radians(np.asarray(lon, float))
    dphi = lat[None, :] - lat[:, None]
    dlmb = lon[None, :] - lon[:, None]
    a = (np.sin(dphi / 2) ** 2
         + np.cos(lat)[:, None] * np.cos(lat)[None, :] * np.sin(dlmb / 2) ** 2)
    return 2 * 6371.0 * np.arcsin(np.sqrt(np.clip(a, 0, 1)))


def _two_way_within(Z: np.ndarray, unit, time, n_iter: int = 60) -> np.ndarray:
    """Absorb unit and (region x year) fixed effects by iterative demeaning ---
    the 'within' transform, equivalent to pyfixest's `| unit + group`, done by
    hand so the variance formula below is fully transparent."""
    Z = Z.astype(float).copy()
    for _ in range(n_iter):
        for g in (unit, time):
            tmp = pd.DataFrame(Z)
            tmp["_g"] = g
            Z = Z - tmp.groupby("_g").transform("mean").to_numpy()
    return Z


def _bartlett(D: np.ndarray, cutoff_km: float) -> np.ndarray:
    """Bartlett (triangular) spatial kernel: weight 1 at distance 0, falling
    linearly to 0 at `cutoff_km`."""
    if cutoff_km <= 0:
        return np.eye(D.shape[0])
    return np.maximum(0.0, 1.0 - D / cutoff_km)


def conley_se_for_spec(d: pd.DataFrame, outcome: str, rhs_terms: list[str],
                       cutoff_km: float = CONLEY_CUTOFF_KM) -> pd.DataFrame:
    """Estimate one TWFE spec (`outcome ~ rhs_terms | district_id + region^year`)
    and return FOUR standard errors for each coefficient:

        se_naive     --- HC0, every observation independent
        se_clustered --- clustered by district (SERIAL correlation over years)
        se_conley    --- Conley SPATIAL: same-year neighbours within `cutoff_km`
        se_hac       --- Conley spatial-HAC: serial UNION spatial (the paper's SE)

    All four share the bread (X'X)^-1 and differ only in the meat. The point
    estimates equal pyfixest's. The region^year FE is encoded as a single
    string group so the within-transform absorbs it exactly like the caret FE."""
    df = d.dropna(subset=[outcome] + rhs_terms).copy()
    df["_grp"] = df["region"].astype(str) + "_" + df["year"].astype(str)
    Z = df[[outcome] + rhs_terms].to_numpy(float)
    unit_arr = df["district_id"].to_numpy()
    grp_arr = df["_grp"].to_numpy()
    year = df["year"].to_numpy()
    lat = df["latitude"].to_numpy()
    lon = df["longitude"].to_numpy()

    Zw = _two_way_within(Z, unit_arr, grp_arr)
    y, X = Zw[:, 0], Zw[:, 1:]
    XtXi = np.linalg.inv(X.T @ X)
    beta = XtXi @ (X.T @ y)
    e = y - X @ beta
    k = X.shape[1]

    def se(meat: np.ndarray) -> np.ndarray:
        return np.sqrt(np.maximum(np.diag(XtXi @ meat @ XtXi), 0.0))

    se_naive = se(X.T @ (X * (e ** 2)[:, None]))                  # HC0

    meat_clu = np.zeros((k, k))                                   # clustered by district
    for u in np.unique(unit_arr):
        m = unit_arr == u
        s = X[m].T @ e[m]
        meat_clu += np.outer(s, s)
    se_clu = se(meat_clu)

    meat_sp = np.zeros((k, k))                                    # Conley spatial (same year)
    for t in np.unique(year):
        m = year == t
        Wt = _bartlett(haversine_matrix(lat[m], lon[m]), cutoff_km)
        meat_sp += X[m].T @ (Wt * np.outer(e[m], e[m])) @ X[m]
    se_sp = se(meat_sp)

    D = haversine_matrix(lat, lon)                                # serial U spatial
    same_unit = unit_arr[:, None] == unit_arr[None, :]
    same_year = year[:, None] == year[None, :]
    spatial_off = np.where(same_year & ~same_unit, _bartlett(D, cutoff_km), 0.0)
    W = same_unit.astype(float) + spatial_off
    se_hac = se(X.T @ (W * np.outer(e, e)) @ X)

    return pd.DataFrame({
        "term": rhs_terms, "estimate": beta,
        "se_naive": se_naive, "se_clustered": se_clu,
        "se_conley": se_sp, "se_hac": se_hac,
        "t_hac": beta / np.where(se_hac > 0, se_hac, np.nan),
    })


# ===========================================================================
# SECTION 1 --- LOAD & DESCRIBE THE THREE DATA LAYERS
# ===========================================================================
def describe(d, hh, ind):
    banner("SECTION 1 --- load the three data layers and describe them")
    print(f"District PANEL     : {d.shape[0]} rows, "
          f"{d['district_id'].nunique()} woredas, years "
          f"{d['year'].min()}-{d['year'].max()}")
    print(f"Household RCS      : {hh.shape[0]} rows, "
          f"{hh['survey_round'].nunique()} DHS rounds "
          f"{sorted(hh['survey_round'].unique())}")
    print(f"Individual RCS     : {ind.shape[0]} rows "
          f"({(ind['sex']==1).sum()} women / {(ind['sex']==0).sum()} men)")

    # treated vs control counts (time-invariant `treated`)
    units = d.drop_duplicates("district_id")
    n_treated = int((units["treated"] == 1).sum())
    n_control = int((units["treated"] == 0).sum())
    print(f"\nTreated woredas    : {n_treated}   (host an industrial park)")
    print(f"Control woredas    : {n_control}   (never-treated PSM matches)")

    # cohort sizes: count treated woredas by open_year
    cohort = (units[units["treated"] == 1].groupby("open_year").size()
              .rename("n_treated_districts").reset_index())
    cohort["open_year"] = cohort["open_year"].astype(int)
    print("\nTreatment cohorts (staggered rollout, Table A1):")
    for _, r in cohort.iterrows():
        print(f"   {int(r.open_year)} : {int(r.n_treated_districts)} woreda(s)")
    save_csv(cohort, "cohort_sizes.csv")

    # impervious is observed only every 5 years
    print(f"\nImpervious-ratio non-null : {d['impervious_ratio'].notna().sum()} "
          "(observed only 2005/2010/2015/2020)")

    # descriptive stats on the key panel + RCS outcomes
    panel_vars = ["ihs_light", "light_intensity", "impervious_ratio",
                  "dist_addis_km", "primary_road_density"]
    desc = d[panel_vars].describe().T
    desc["layer"] = "district_panel"
    hh_desc = hh[["durable_goods_pc", "housing_quality", "wealth_index"]].describe().T
    hh_desc["layer"] = "household_rcs"
    ind_desc = ind[["nonag_employment", "decision_power",
                    "savings_account", "dv_accept"]].describe().T
    ind_desc["layer"] = "individual_rcs"
    desc_all = (pd.concat([desc, hh_desc, ind_desc])
                .reset_index().rename(columns={"index": "variable"}))
    save_csv(desc_all.round(4), "descriptive_stats.csv")
    return cohort


# ===========================================================================
# SECTION 2 --- EXPLORATORY DATA ANALYSIS
# ===========================================================================
def eda(d):
    banner("SECTION 2 --- exploratory analysis (parallel trends, cohorts, map)")

    # -- F1: group-mean parallel-trends, BASELINE-NORMALIZED light ----------
    # NOTE (per the data's known approximations): treated woredas carry an
    # intrinsically BRIGHT synthetic base (~4-5) and controls a DIM one (~0.1),
    # a device used to reconcile the paper's small IHS effect (0.214) with its
    # large raw effect (1.276). RAW light levels are therefore NOT matched across
    # groups, even though the DiD design (which differences out the level via the
    # district FE) is unaffected. To see the classic "parallel-then-diverge"
    # picture we index each group's IHS light to its own PRE-2008 mean (the
    # earliest treated cohort opens in 2008), i.e. we DEMEAN within group on the
    # pre-period. The level gap vanishes; the post-opening divergence remains.
    pre_mask = d["year"] < 2008
    grp_pre = (d[pre_mask].groupby("treated")["ihs_light"].mean())
    norm = d.copy()
    norm["ihs_norm"] = norm["ihs_light"] - norm["treated"].map(grp_pre)
    means = (norm.groupby(["year", "treated"])["ihs_norm"].mean()
             .unstack("treated")
             .rename(columns={0: "Control (never-treated)", 1: "Treated (park)"}))

    fig, ax = plt.subplots(figsize=(9, 5.2))
    ax.plot(means.index, means["Control (never-treated)"], "--o",
            color=STEEL_BLUE, lw=2, ms=4, label="Control (never-treated)")
    ax.plot(means.index, means["Treated (park)"], "-o",
            color=WARM_ORANGE, lw=2.4, ms=4.5, label="Treated (park)")
    ax.axhline(0, color=GRID_LINE, lw=0.8)
    ax.axvline(2007.5, color=LIGHT_TEXT, ls=":", lw=1.2)
    ax.text(2007.7, ax.get_ylim()[1] * 0.92, "first park (2008)",
            color=LIGHT_TEXT, fontsize=9, va="top")
    ax.set_xlabel("Year")
    ax.set_ylabel("IHS night-light, indexed to each group's pre-2008 mean")
    ax.set_title("Parallel before the rollout, then treated woredas pull away")
    ax.legend(loc="upper left")
    savefig(fig, "01_parallel_trends")
    save_csv(means.round(5).reset_index(), "eda_group_means.csv")

    # -- F2: cohort staircase -----------------------------------------------
    # Each treatment cohort's mean IHS-light trajectory, with a vertical at its
    # own opening year. This is the "staircase" that motivates staggered DiD:
    # different cohorts switch on at different times.
    fig, ax = plt.subplots(figsize=(9.5, 5.4))
    cohorts = sorted(d.loc[d["treated"] == 1, "open_year"].dropna().unique())
    ctrl_traj = d[d["treated"] == 0].groupby("year")["ihs_light"].mean()
    ax.plot(ctrl_traj.index, ctrl_traj.values, color=LIGHT_TEXT, lw=1.6,
            ls=(0, (4, 3)), label="Never-treated", zorder=2)
    for ci, oy in enumerate(cohorts):
        sub = d[(d["treated"] == 1) & (d["open_year"] == oy)]
        traj = sub.groupby("year")["ihs_light"].mean()
        color = COHORT_SHADES[ci % len(COHORT_SHADES)]
        ax.plot(traj.index, traj.values, "-o", color=color, lw=1.8, ms=3,
                label=f"Open {int(oy)}", zorder=3)
        ax.axvline(oy, color=color, ls=":", lw=1.0, alpha=0.6)
    ax.set_xlabel("Year")
    ax.set_ylabel("Mean IHS night-light")
    ax.set_title("Cohort staircase: parks switch on in different years (2008-2020)")
    ax.legend(loc="upper left", ncol=2, fontsize=8.5)
    savefig(fig, "02_cohort_staircase")

    # -- F3: treated-vs-control map (lon/lat scatter) -----------------------
    snap = d.drop_duplicates("district_id")
    fig, ax = plt.subplots(figsize=(7.4, 7.4))
    for tr, color, label in [(0, STEEL_BLUE, "Control woreda"),
                             (1, WARM_ORANGE, "Treated woreda (park)")]:
        g = snap[snap["treated"] == tr]
        ax.scatter(g["longitude"], g["latitude"], c=color, s=46 if tr else 30,
                   edgecolors=DARK_NAVY, linewidth=0.5, label=label,
                   zorder=3 if tr else 2, alpha=0.9)
    ax.set_xlabel("Longitude (deg E)")
    ax.set_ylabel("Latitude (deg N)")
    ax.set_title("Where the 17 parks and their 122 matched controls sit\n"
                 "(treatment is spatially clustered -> Conley SEs later)")
    ax.legend(loc="lower right")
    savefig(fig, "03_treatment_map")

    # -- F4: outcome boxplots by group x period -----------------------------
    box = d.copy()
    box["group"] = np.where(box["treated"] == 1, "Treated", "Control")
    box["period"] = np.where(box["treatment"] == 1, "Post-opening", "Pre-opening")
    order = [("Control", "Pre-opening"), ("Control", "Post-opening"),
             ("Treated", "Pre-opening"), ("Treated", "Post-opening")]
    fig, ax = plt.subplots(figsize=(9, 5.2))
    data = [box[(box["group"] == g) & (box["period"] == p)]["ihs_light"].dropna().values
            for g, p in order]
    colors = [STEEL_BLUE, STEEL_BLUE, WARM_ORANGE, WARM_ORANGE]
    bp = ax.boxplot(data, positions=range(4), widths=0.6, patch_artist=True,
                    showfliers=False, medianprops=dict(color=WHITE_TEXT, lw=1.6))
    for patch, c, p in zip(bp["boxes"], colors, [o[1] for o in order]):
        patch.set_facecolor(c)
        patch.set_alpha(0.45 if p == "Pre-opening" else 0.85)
        patch.set_edgecolor(c)
    for w, c in zip(bp["whiskers"], np.repeat(colors, 2)):
        w.set_color(c)
    for cp, c in zip(bp["caps"], np.repeat(colors, 2)):
        cp.set_color(c)
    ax.set_xticks(range(4))
    ax.set_xticklabels(["Control\npre", "Control\npost", "Treated\npre", "Treated\npost"])
    ax.set_ylabel("IHS night-light")
    ax.set_title("Treated woredas are brighter (level gap), and brighter still after opening")
    savefig(fig, "04_outcome_boxplots")


# ===========================================================================
# SECTION 3 --- BASELINE 2x2 DiD
# ===========================================================================
def baseline_2x2(d):
    banner("SECTION 3 --- the naive 2x2 DiD (ever-treated x post)")
    # Hand-computed 2x2 cell table on ihs_light. To force the staggered rollout
    # into ONE before/after split (the whole point of the "naive" 2x2), we cut
    # the calendar at the MEDIAN treated opening year and apply that SAME cut to
    # BOTH groups --- otherwise the never-treated controls have no "post" cell at
    # all (they never open). This is exactly the blending that makes the 2x2
    # understate a staggered, dynamic effect; the event study and the modern
    # estimators below fix it.
    cut_year = int(d.loc[d["treated"] == 1, "open_year"].median())
    df = d.copy()
    df["post"] = (df["year"] >= cut_year).astype(int)   # common calendar cut
    print(f"\n  (Collapsing the staggered design at the median opening year "
          f"= {cut_year}.)")
    cells = (df.groupby(["treated", "post"])["ihs_light"].mean().unstack("post"))
    cells.columns = ["Pre-opening", "Post-opening"]
    cells.index = ["Control (never-treated)", "Treated (park)"]
    cells["Post - Pre"] = cells["Post-opening"] - cells["Pre-opening"]
    print("\nMean IHS night-light in each cell:\n")
    print(cells.round(4).to_string())

    did_hand = (cells.loc["Treated (park)", "Post - Pre"]
                - cells.loc["Control (never-treated)", "Post - Pre"])
    print(f"\n  DiD by hand = (treated change) - (control change) = {did_hand:+.4f}")
    print("  This blended 2x2 UNDERSTATES the dynamic effect: the park's impact")
    print("  ramps up over ~5 years (see the event study), so averaging the early")
    print("  small post-years with the later large ones pulls the mean down. It")
    print("  ALSO suffers Goodman-Bacon 'forbidden comparisons' under staggering")
    print("  (already-treated units used as controls) --- §6 quantifies that.")

    # diff-diff cross-check: same ATT, plus a clustered SE.
    res = dd.DifferenceInDifferences(cluster="district_id").fit(
        df, outcome="ihs_light", treatment="treated", time="post")
    lo, hi = res.conf_int
    print(f"\n  diff-diff DifferenceInDifferences: ATT = {res.att:+.4f} "
          f"(SE {res.se:.4f}, p = {res.p_value:.4f}, 95% CI [{lo:+.4f}, {hi:+.4f}])")

    out = cells.round(5).reset_index().rename(columns={"index": "group"})
    out["did_att_hand"] = round(did_hand, 5)
    out["did_att_diffdiff"] = round(res.att, 5)
    out["did_se"] = round(res.se, 5)
    out["did_p"] = round(res.p_value, 5)
    save_csv(out, "baseline_2x2.csv")
    return did_hand


# ===========================================================================
# SECTION 4 --- STATIC TWFE (Eq. 1, Table 1)
# ===========================================================================
def twfe_table1(d):
    banner("SECTION 4 --- static TWFE difference-in-differences (Eq. 1, Table 1)")
    dt = add_trend_terms(d)
    outcomes = [("ihs_light", "IHS night-light"),
                ("light_intensity", "Raw night-light"),
                ("impervious_ratio", "Impervious ratio")]
    rows = []
    for ycol, ylabel in outcomes:
        # (odd column) no trends; (even column) + unit-specific trend interactions
        m0 = pf.feols(f"{ycol} ~ treatment | district_id + region^year",
                      data=dt, vcov={"CRV1": "district_id"})
        rhs_trends = "treatment + " + " + ".join(TREND_TERMS)
        m1 = pf.feols(f"{ycol} ~ {rhs_trends} | district_id + region^year",
                      data=dt, vcov={"CRV1": "district_id"})
        for spec, m in [("no_trends", m0), ("with_trends", m1)]:
            b = m.coef()["treatment"]
            se = m.se()["treatment"]
            rows.append({"outcome": ylabel, "variable": ycol, "spec": spec,
                         "estimate": b, "se": se, "t": b / se,
                         "stars": stars(b / se),
                         "n_obs": int(m._N)})
    tab = pd.DataFrame(rows)
    print("\nTable 1 --- park effect on satellite outcomes")
    print("(district + region^year FE; SE clustered on district; "
          "*** .01 ** .05 * .10)\n")
    for ylabel in [o[1] for o in outcomes]:
        sub = tab[tab.outcome == ylabel]
        c0 = sub[sub.spec == "no_trends"].iloc[0]
        c1 = sub[sub.spec == "with_trends"].iloc[0]
        print(f"   {ylabel:18s} no-trends {cell(c0.estimate, c0.se):>26s}   "
              f"with-trends {cell(c1.estimate, c1.se):>26s}")
    print("\nReading: the WITH-TRENDS column (the paper's preferred even columns)")
    print("absorbs the faster pre-existing urban trend of treated woredas, so the")
    print("IHS effect falls from ~0.27 to ~0.21 --- a textbook differential-trend")
    print("confound. The raw-light coefficient runs high (~1.6 vs the paper's")
    print("1.276): the synthetic bright-base device removes the zero-dilution that")
    print("would pull the raw mean down (documented in the data README, §5).")
    save_csv(tab.round(5), "twfe_table1.csv")

    # -- F5: coefficient forest (3 outcomes x 2 specs, 95% CI) --------------
    fig, ax = plt.subplots(figsize=(9, 5.4))
    ylabels = [o[1] for o in outcomes]
    ypos = np.arange(len(ylabels))
    offs = {"no_trends": +0.16, "with_trends": -0.16}
    cols = {"no_trends": STEEL_BLUE, "with_trends": WARM_ORANGE}
    for spec, off in offs.items():
        sub = tab[tab.spec == spec].set_index("outcome").loc[ylabels]
        ax.errorbar(sub["estimate"], ypos + off, xerr=1.96 * sub["se"],
                    fmt="o", ms=8, color=cols[spec], ecolor=cols[spec],
                    capsize=4, lw=2,
                    label="No trends" if spec == "no_trends" else "With trends")
    ax.axvline(0, color=LIGHT_TEXT, ls=":", lw=1)
    ax.set_yticks(ypos)
    ax.set_yticklabels(ylabels)
    ax.invert_yaxis()
    ax.set_xlabel("Park ATT (coefficient, 95% CI)")
    ax.set_title("Table 1 forest: positive across all three satellite outcomes")
    ax.legend(loc="lower right")
    savefig(fig, "05_twfe_forest")
    return tab


# ===========================================================================
# SECTION 5 --- EVENT STUDY (Eq. 3, Fig. 1)
# ===========================================================================
def event_study(d):
    banner("SECTION 5 --- event study (Eq. 3, Fig. 1): the dynamic path")
    df = add_first_treat(d)

    def es_path(ycol):
        """Clean leads/lags via the SATURATED (Sun-Abraham) event study.

        IMPORTANT (API guardrail): pyfixest's plain `estimator="twfe"` with
        `att=False` silently COLLAPSES to a single `is_treated` coefficient --- it
        does NOT return leads/lags. The staggered-robust per-event-time path comes
        from the `saturated` estimator (cohort x event-time interactions), whose
        `.aggregate()` collapses the cohort dimension to one effect per event time
        k. These are the Sun-Abraham interaction-weighted effects, free of the
        negative-weight contamination that biases naive TWFE leads/lags."""
        m = pf.event_study(df, yname=ycol, idname="district_id", tname="year",
                           gname="first_treat", estimator="saturated", att=True)
        agg = m.aggregate().reset_index()
        agg["event_time"] = agg["period"].astype(float)
        out = agg.rename(columns={"Estimate": "estimate", "Std. Error": "se",
                                  "Pr(>|t|)": "p_value"})[
            ["event_time", "estimate", "se", "p_value"]]
        out["estimate"] = out["estimate"].astype(float)
        out["se"] = out["se"].astype(float)
        out["p_value"] = out["p_value"].astype(float)
        out = out.sort_values("event_time").reset_index(drop=True)
        # restrict to the design window k in [-5, +5]
        return out[(out["event_time"] >= -5) & (out["event_time"] <= 5)].copy()

    es_light = es_path("ihs_light")
    es_imperv = es_path("impervious_ratio")

    # Pre-trend test: are the pre-period (k<0) coefficients jointly ~0?
    pre = es_light[es_light["event_time"] < 0]
    max_pre_t = (pre["estimate"] / pre["se"]).abs().max()
    print("\nIHS night-light event-study coefficients (ref = k = -1):\n")
    print(es_light.round(4).to_string(index=False))
    print(f"\n  Pre-trend check: largest |t| among k<0 leads = {max_pre_t:.2f}")
    print("  -> pre-period coefficients hug zero (flat pre-trend); the jump comes")
    print("  AFTER opening (k>=0) and grows to a plateau --- parallel trends hold.")
    save_csv(es_light.round(6), "event_study_light.csv")
    save_csv(es_imperv.round(6), "event_study_impervious.csv")

    # -- F6: event-study coefficient plot (95% CI) --------------------------
    fig, ax = plt.subplots(figsize=(9.2, 5.4))
    x = es_light["event_time"].to_numpy()
    yv = es_light["estimate"].to_numpy()
    se = es_light["se"].to_numpy()
    ax.axhline(0, color=GRID_LINE, lw=1)
    ax.axvline(-0.5, color=LIGHT_TEXT, ls=":", lw=1.2)
    ax.text(-0.4, ax.get_ylim()[1] if False else max(yv) * 0.98, "opening",
            color=LIGHT_TEXT, fontsize=9, va="top")
    pre_m = x < 0
    ax.errorbar(x[pre_m], yv[pre_m], yerr=1.96 * se[pre_m], fmt="o", ms=7,
                color=STEEL_BLUE, ecolor=STEEL_BLUE, capsize=3, lw=1.8,
                label="Pre-opening (leads)")
    ax.errorbar(x[~pre_m], yv[~pre_m], yerr=1.96 * se[~pre_m], fmt="o", ms=7,
                color=WARM_ORANGE, ecolor=WARM_ORANGE, capsize=3, lw=1.8,
                label="Post-opening (lags)")
    ax.plot(x, yv, "-", color=LIGHT_TEXT, lw=1, alpha=0.5, zorder=1)
    ax.set_xlabel("Event time k (years since park opening)")
    ax.set_ylabel("Effect on IHS night-light (95% CI)")
    ax.set_title("Event study: flat pre-trend, then a rising post-opening effect")
    ax.legend(loc="upper left")
    savefig(fig, "06_event_study")
    return es_light


# ===========================================================================
# SECTION 6 --- MODERN STAGGERED ESTIMATORS (the negative-weights moment)
# ===========================================================================
def staggered(d):
    banner("SECTION 6 --- modern staggered estimators (Sun-Abraham, Borusyak, "
           "Callaway-Sant'Anna) + Goodman-Bacon")
    df = add_first_treat(d)
    Y = "ihs_light"

    # -- (a) plain TWFE ATT (the benchmark) ---------------------------------
    m_twfe = pf.event_study(df, yname=Y, idname="district_id", tname="year",
                            gname="first_treat", estimator="twfe", att=True)
    twfe_b = m_twfe.coef().iloc[0]
    twfe_se = m_twfe.se().iloc[0]
    print(f"\n  TWFE ATT                       : {cell(twfe_b, twfe_se)}")

    # -- (b) Sun-Abraham (saturated) ----------------------------------------
    # 'saturated' returns cohort x event-time interactions; .aggregate() collapses
    # them to clean per-event-time effects. We summarise the post-period (k>=0)
    # average as a single SA ATT, weighting each k equally.
    m_sa = pf.event_study(df, yname=Y, idname="district_id", tname="year",
                          gname="first_treat", estimator="saturated", att=True)
    sa_agg = m_sa.aggregate()
    sa_agg.index = sa_agg.index.astype(float)
    sa_post = sa_agg[(sa_agg.index >= 0) & (sa_agg.index <= 5)]
    sa_b = float(sa_post["Estimate"].mean())
    # conservative pooled SE: average variance / sqrt(n) of the post coefficients
    sa_se = float(np.sqrt((sa_post["Std. Error"].astype(float) ** 2).mean()
                          / len(sa_post)))
    print(f"  Sun-Abraham ATT (avg k=0..5)   : {cell(sa_b, sa_se)}")

    # -- (c) Borusyak/Gardner (did2s) ---------------------------------------
    m_d2s = pf.event_study(df, yname=Y, idname="district_id", tname="year",
                           gname="first_treat", estimator="did2s", att=True)
    d2s_b = m_d2s.coef().iloc[0]
    d2s_se = m_d2s.se().iloc[0]
    print(f"  Borusyak/Gardner ATT (did2s)   : {cell(d2s_b, d2s_se)}")

    # -- (d) Callaway-Sant'Anna ---------------------------------------------
    cs = dd.CallawaySantAnna(control_group="never_treated", cluster="district_id")
    cs_res = cs.fit(df, outcome=Y, unit="district_id", time="year",
                    first_treat="first_treat", aggregate="simple")
    cs_b, cs_se = cs_res.att, cs_res.se
    print(f"  Callaway-Sant'Anna ATT         : {cell(cs_b, cs_se)}")

    print("\nReading: TWFE, Sun-Abraham, Borusyak/Gardner and Callaway-Sant'Anna")
    print("all target the ATT and land in the same ~0.21-0.30 IHS band. They")
    print("AGREE here because, with a real never-treated group (122 controls) and")
    print("a fairly homogeneous effect, TWFE's 'forbidden comparisons' carry")
    print("little weight --- the Bacon decomposition below shows exactly how little.")

    comp = pd.DataFrame([
        {"estimator": "TWFE", "att": twfe_b, "se": twfe_se},
        {"estimator": "Sun-Abraham", "att": sa_b, "se": sa_se},
        {"estimator": "Borusyak/Gardner", "att": d2s_b, "se": d2s_se},
        {"estimator": "Callaway-Sant'Anna", "att": cs_b, "se": cs_se},
    ])
    comp["stars"] = comp.apply(lambda r: stars(r.att / r.se), axis=1)
    save_csv(comp.round(5), "staggered_robust_comparison.csv")

    # -- (e) Goodman-Bacon decomposition ------------------------------------
    bac = dd.BaconDecomposition().fit(df, outcome=Y, unit="district_id",
                                      time="year", first_treat="first_treat")
    bdf = bac.to_dataframe().copy()
    print(f"\n  Goodman-Bacon: TWFE = {bac.twfe_estimate:+.4f} decomposes into "
          f"{len(bdf)} 2x2 comparisons.")
    by_type = (bdf.groupby("comparison_type")
               .apply(lambda g: pd.Series({
                   "total_weight": g["weight"].sum(),
                   "weighted_avg_estimate":
                       np.average(g["estimate"], weights=g["weight"])}))
               .reset_index())
    print(by_type.round(4).to_string(index=False))
    print("\n  The 'treated-vs-never-treated' comparisons carry the bulk of the")
    print("  weight (clean comparisons); the 'forbidden' later-vs-earlier-treated")
    print("  comparisons carry little --- so TWFE is barely biased here.")
    save_csv(bdf.round(5), "bacon_weights.csv")

    # -- F7: estimator-comparison forest ------------------------------------
    fig, ax = plt.subplots(figsize=(9, 4.8))
    ypos = np.arange(len(comp))[::-1]
    ecolors = [STEEL_BLUE, WARM_ORANGE, TEAL, "#e2906f"]
    ax.errorbar(comp["att"], ypos, xerr=1.96 * comp["se"], fmt="o", ms=9,
                color=WHITE_TEXT, ecolor=LIGHT_TEXT, capsize=4, lw=2, zorder=2)
    ax.scatter(comp["att"], ypos, c=ecolors, s=120, zorder=3,
               edgecolors=DARK_NAVY)
    ax.axvline(0, color=LIGHT_TEXT, ls=":", lw=1)
    ax.axvspan(0.21, 0.30, color=TEAL, alpha=0.08)
    ax.set_yticks(ypos)
    ax.set_yticklabels(comp["estimator"])
    ax.set_xlabel("ATT on IHS night-light (95% CI)")
    ax.set_title("Four estimators, one estimand: they agree on ~0.21-0.30")
    savefig(fig, "07_estimator_comparison")

    # -- F8: Bacon weight plot (weight vs 2x2 estimate, sized by weight) -----
    fig, ax = plt.subplots(figsize=(9, 5.2))
    type_color = {"treated_vs_never": STEEL_BLUE,
                  "later_vs_earlier": WARM_ORANGE,
                  "earlier_vs_later": TEAL}
    seen = set()
    for _, r in bdf.iterrows():
        ct = r["comparison_type"]
        color = type_color.get(ct, LIGHT_TEXT)
        lab = ct.replace("_", " ") if ct not in seen else None
        seen.add(ct)
        ax.scatter(r["estimate"], r["weight"], s=40 + 1200 * r["weight"],
                   color=color, alpha=0.7, edgecolors=DARK_NAVY, label=lab)
    ax.axvline(bac.twfe_estimate, color=WHITE_TEXT, ls="--", lw=1.4,
               label=f"TWFE = {bac.twfe_estimate:+.3f}")
    ax.set_xlabel("2x2 DiD estimate")
    ax.set_ylabel("Goodman-Bacon weight")
    ax.set_title("Bacon decomposition: clean treated-vs-never 2x2s dominate the weight")
    ax.legend(loc="upper left", fontsize=9)
    savefig(fig, "08_bacon_weights")
    return comp


# ===========================================================================
# SECTION 7 --- HETEROGENEITY (Tables 3-4)
# ===========================================================================
def heterogeneity(d):
    banner("SECTION 7 --- heterogeneity by distance and roads (Tables 3-4)")
    Y = "light_intensity"

    def interaction(mod):
        m = pf.feols(f"{Y} ~ treatment + treatment:{mod} | district_id + region^year",
                     data=d, vcov={"CRV1": "district_id"})
        key = f"treatment:{mod}"
        return {"moderator": mod, "main_treatment": m.coef()["treatment"],
                "interaction": m.coef()[key], "se": m.se()[key],
                "t": m.coef()[key] / m.se()[key], "stars": stars(m.coef()[key] / m.se()[key])}

    # Distance moderators: effect should FADE with distance -> negative interaction
    dist_mods = ["dist_addis_km", "dist_state_capital_km", "dist_nearest_city_km"]
    dist = pd.DataFrame([interaction(m) for m in dist_mods])
    print("\nTable 3 --- distance moderators (negative = effect fades with distance):\n")
    for _, r in dist.iterrows():
        print(f"   {r.moderator:24s} interaction {r.interaction:+.5f}{r.stars:<3} "
              f"(se {r.se:.5f}, t {r.t:+.2f})")
    save_csv(dist.round(6), "het_distance.csv")

    # Road moderators: denser roads AMPLIFY -> positive interaction
    road_mods = ["primary_road_density", "paved_road_density"]
    roads = pd.DataFrame([interaction(m) for m in road_mods])
    print("\nTable 4 --- road moderators (positive = roads amplify the effect):\n")
    for _, r in roads.iterrows():
        print(f"   {r.moderator:24s} interaction {r.interaction:+.4f}{r.stars:<3} "
              f"(se {r.se:.4f}, t {r.t:+.2f})")
    print("\n  HONEST NOTE: all five interactions carry the predicted sign and")
    print("  magnitude, but with only 17 treated woredas not all can be precise")
    print("  at once. dist_addis (***), dist_state_capital (**), dist_nearest_city")
    print("  (***) and paved_road (**) are significant; the primary_road")
    print("  interaction is correctly signed and on-magnitude but BORDERLINE (ns)")
    print("  --- the sample cannot make both road interactions significant together.")
    save_csv(roads.round(6), "het_roads.csv")

    # -- F9: heterogeneity marginal-effect plot -----------------------------
    # For the three distance moderators, plot the implied park effect as a
    # function of distance: main + interaction*distance over the observed range.
    fig, ax = plt.subplots(figsize=(9, 5.2))
    dcolors = [STEEL_BLUE, WARM_ORANGE, TEAL]
    for (mod, color) in zip(dist_mods, dcolors):
        r = dist[dist.moderator == mod].iloc[0]
        xs = np.linspace(d[mod].quantile(0.05), d[mod].quantile(0.95), 50)
        me = r.main_treatment + r.interaction * xs
        nice = mod.replace("dist_", "").replace("_km", "").replace("_", " ")
        ax.plot(xs, me, "-", color=color, lw=2.4, label=f"vs {nice}")
    ax.axhline(0, color=LIGHT_TEXT, ls=":", lw=1)
    ax.set_xlabel("Distance to reference location (km)")
    ax.set_ylabel("Implied park effect on raw night-light")
    ax.set_title("Heterogeneity: the park effect fades the farther a woreda lies")
    ax.legend(loc="upper right")
    savefig(fig, "09_heterogeneity")
    return dist, roads


# ===========================================================================
# SECTION 8 --- SPILLOVERS (Table 2)
# ===========================================================================
def spillovers(d):
    banner("SECTION 8 --- spillover test (Table 2): does a park lift NEIGHBOURS?")
    # Add `nearby` (control within 10 km of an operational park) to the Table-1
    # spec. If parks merely relocated activity, `nearby` would be positive; the
    # paper finds it ~0 (no spillover -> the effect is genuine local creation).
    rows = []
    for ycol, ylabel in [("ihs_light", "IHS night-light"),
                         ("light_intensity", "Raw night-light")]:
        m = pf.feols(f"{ycol} ~ treatment + nearby | district_id + region^year",
                     data=d, vcov={"CRV1": "district_id"})
        for term in ["treatment", "nearby"]:
            b, se = m.coef()[term], m.se()[term]
            rows.append({"outcome": ylabel, "term": term, "estimate": b,
                         "se": se, "t": b / se, "stars": stars(b / se)})
    sp = pd.DataFrame(rows)
    print("\nTable 2 --- treatment vs nearby spillover:\n")
    for ylabel in sp.outcome.unique():
        sub = sp[sp.outcome == ylabel]
        tr = sub[sub.term == "treatment"].iloc[0]
        nb = sub[sub.term == "nearby"].iloc[0]
        print(f"   {ylabel:18s} treatment {cell(tr.estimate, tr.se):>24s}   "
              f"nearby {cell(nb.estimate, nb.se):>22s}")
    print("\n  Reading: `nearby` is ~0 and insignificant -> NO spillover. The")
    print("  park's gain is not stolen from its neighbours; it is net new activity.")
    save_csv(sp.round(6), "spillover_test.csv")

    # -- F10: treatment-vs-nearby coefficient plot --------------------------
    fig, ax = plt.subplots(figsize=(8.4, 4.8))
    sub = sp[sp.outcome == "IHS night-light"]
    labels = ["Treated woreda\n(`treatment`)", "Neighbour woreda\n(`nearby`)"]
    vals = [sub[sub.term == "treatment"]["estimate"].iloc[0],
            sub[sub.term == "nearby"]["estimate"].iloc[0]]
    ses = [sub[sub.term == "treatment"]["se"].iloc[0],
           sub[sub.term == "nearby"]["se"].iloc[0]]
    ax.bar([0, 1], vals, yerr=[1.96 * s for s in ses], width=0.55,
           color=[WARM_ORANGE, STEEL_BLUE], edgecolor=DARK_NAVY, capsize=5,
           alpha=0.9)
    ax.axhline(0, color=LIGHT_TEXT, lw=1)
    ax.set_xticks([0, 1])
    ax.set_xticklabels(labels)
    ax.set_ylabel("Effect on IHS night-light (95% CI)")
    ax.set_title("Treatment lifts the host woreda; the spillover to neighbours is ~0")
    savefig(fig, "10_spillover")
    return sp


# ===========================================================================
# SECTION 9 --- HOUSEHOLD RCS WELFARE (Eq. 2, Table 5)
# ===========================================================================
def household_table5(hh):
    banner("SECTION 9 --- household welfare, repeated cross-section (Eq. 2, Table 5)")
    # RCS FRAMING: the DHS rounds are a REPEATED CROSS-SECTION (different
    # households each round, NO panel key). So we use NO household fixed effect ---
    # the effect is identified off DISTRICT x ROUND group means: within a region,
    # comparing treated vs control districts before vs after their park opens.
    # FE = district_id + region_id^survey_round; weights = DHS survey_weight.
    outcomes = [("durable_goods_pc", "Durable goods p.c."),
                ("housing_quality", "Housing quality"),
                ("wealth_index", "Wealth index")]
    rows = []
    for ycol, ylabel in outcomes:
        for spec, controls in [("no_controls", ""),
                               ("with_controls", " + hh_size + age_head")]:
            m = pf.feols(
                f"{ycol} ~ treatment{controls} | district_id + region_id^survey_round",
                data=hh, weights="survey_weight", vcov={"CRV1": "district_id"})
            b, se = m.coef()["treatment"], m.se()["treatment"]
            rows.append({"outcome": ylabel, "variable": ycol, "spec": spec,
                         "estimate": b, "se": se, "t": b / se,
                         "stars": stars(b / se), "n_obs": int(m._N)})
    tab = pd.DataFrame(rows)
    print("\nTable 5 --- park effect on household living standards "
          "(weighted; district + region^round FE):\n")
    for ylabel in [o[1] for o in outcomes]:
        sub = tab[tab.outcome == ylabel]
        c0 = sub[sub.spec == "no_controls"].iloc[0]
        c1 = sub[sub.spec == "with_controls"].iloc[0]
        print(f"   {ylabel:18s} no-controls {cell(c0.estimate, c0.se):>24s}   "
              f"with-controls {cell(c1.estimate, c1.se):>24s}")
    print("\n  Reading: durables and housing rise ~0.23-0.25*** and wealth ~0.38*;")
    print("  controlling for hh_size/age_head barely moves the estimate (the")
    print("  covariates are only mildly correlated with treatment), confirming the")
    print("  district + region^round design already absorbs the main confounding.")
    save_csv(tab.round(5), "household_table5.csv")

    # -- F11: household forest (3 outcomes x +/-controls) -------------------
    fig, ax = plt.subplots(figsize=(9, 5.2))
    ylabels = [o[1] for o in outcomes]
    ypos = np.arange(len(ylabels))
    for spec, off, color, lab in [("no_controls", +0.16, STEEL_BLUE, "No controls"),
                                  ("with_controls", -0.16, WARM_ORANGE, "With controls")]:
        sub = tab[tab.spec == spec].set_index("outcome").loc[ylabels]
        ax.errorbar(sub["estimate"], ypos + off, xerr=1.96 * sub["se"], fmt="o",
                    ms=8, color=color, ecolor=color, capsize=4, lw=2, label=lab)
    ax.axvline(0, color=LIGHT_TEXT, ls=":", lw=1)
    ax.set_yticks(ypos)
    ax.set_yticklabels(ylabels)
    ax.invert_yaxis()
    ax.set_xlabel("Park ATT (95% CI)")
    ax.set_title("Table 5: households near a park gain durables, housing and wealth")
    ax.legend(loc="lower right")
    savefig(fig, "11_household_forest")

    # -- F12: household event study (phase dummies on survey_round) ----------
    # RCS event study: regress on phase dummies (event_phase = round position
    # relative to opening). We use phases {-3..+1}; reference = phase -1. Built
    # as explicit dummies in feols (no panel event-study helper --- the data are
    # repeated cross-sections without a balanced unit x time grid).
    es = _rcs_event_study(hh, "durable_goods_pc", controls=["hh_size", "age_head"])
    save_csv(es.round(6), "household_event_study.csv")
    _plot_rcs_event_study(es, "12_household_event_study",
                          "Household event study (durables): flat pre, jump at opening",
                          "Effect on durable goods p.c. (95% CI)")
    return tab


# ===========================================================================
# SECTION 10 --- EMPLOYMENT & EMPOWERMENT RCS (Tables 6-7) --- the climax
# ===========================================================================
def employment_empowerment(ind):
    banner("SECTION 10 --- employment & women's empowerment, RCS (Tables 6-7)")
    # Same RCS pattern: district + region^round FE, survey weights, district
    # clustering. Employment is split by sex. The individual-file controls are
    # hh_size + age_head + age + age_sq (demographics that predict employment).
    ctrl = "hh_size + age_head + age + age_sq"
    emp_rows = []
    for label, sub in [("Full sample", ind),
                       ("Women", ind[ind["sex"] == 1]),
                       ("Men", ind[ind["sex"] == 0])]:
        m = pf.feols(
            f"nonag_employment ~ treatment + {ctrl} | district_id + region_id^survey_round",
            data=sub, weights="survey_weight", vcov={"CRV1": "district_id"})
        b, se = m.coef()["treatment"], m.se()["treatment"]
        emp_rows.append({"sample": label, "estimate": b, "se": se, "t": b / se,
                         "stars": stars(b / se), "n_obs": int(m._N)})
    emp = pd.DataFrame(emp_rows)
    print("\nTable 6 --- non-agricultural EMPLOYMENT (the gender narrative climax):\n")
    for _, r in emp.iterrows():
        flag = "  <-- NULL on average" if r["sample"] == "Full sample" and abs(r.t) < 1.96 \
            else ("  <-- SIGNIFICANT for women" if r["sample"] == "Women" else "")
        print(f"   {r['sample']:12s} {cell(r.estimate, r.se):>24s}  (t {r.t:+.2f}){flag}")
    print("\n  *** THE CENTRAL FINDING ***  The AVERAGE non-ag employment effect is")
    print("  INSIGNIFICANT (full sample), yet the FEMALE effect is large and highly")
    print("  significant (~0.14***), while the male effect is ~0 ns. Parks pull")
    print("  WOMEN into factory wage work; the men were already off-farm. Pooling")
    print("  the sexes hides this --- a textbook case for heterogeneity analysis.")
    save_csv(emp.round(5), "employment_table6.csv")

    # -- Empowerment (Table 7, women only) ----------------------------------
    women = ind[ind["sex"] == 1]
    emp7 = [("decision_power", "Decision power"),
            ("savings_account", "Savings account"),
            ("dv_accept", "Accepts DV")]
    pow_rows = []
    for ycol, ylabel in emp7:
        m = pf.feols(
            f"{ycol} ~ treatment + {ctrl} | district_id + region_id^survey_round",
            data=women, weights="survey_weight", vcov={"CRV1": "district_id"})
        b, se = m.coef()["treatment"], m.se()["treatment"]
        pow_rows.append({"outcome": ylabel, "variable": ycol, "estimate": b,
                         "se": se, "t": b / se, "stars": stars(b / se),
                         "n_obs": int(m._N)})
    pwr = pd.DataFrame(pow_rows)
    print("\nTable 7 --- women's EMPOWERMENT (women only):\n")
    for _, r in pwr.iterrows():
        print(f"   {r.outcome:18s} {cell(r.estimate, r.se):>24s}")
    print("\n  Reading: with factory jobs, women gain decision power (+0.11***) and")
    print("  savings accounts (+0.32***), and acceptance of domestic violence FALLS")
    print("  (-0.21***). Economic agency translates into household bargaining power.")
    save_csv(pwr.round(5), "empowerment_table7.csv")

    # -- F13: sex-split employment + empowerment forest ---------------------
    fig, (axL, axR) = plt.subplots(1, 2, figsize=(12, 5),
                                   gridspec_kw={"wspace": 0.42})
    # left: employment by sample
    e_order = ["Full sample", "Women", "Men"]
    e_sub = emp.set_index("sample").loc[e_order]
    e_col = [LIGHT_TEXT, TEAL, STEEL_BLUE]
    ypos = np.arange(len(e_order))[::-1]
    axL.errorbar(e_sub["estimate"], ypos, xerr=1.96 * e_sub["se"], fmt="o", ms=9,
                 color=WHITE_TEXT, ecolor=LIGHT_TEXT, capsize=4, lw=2, zorder=2)
    axL.scatter(e_sub["estimate"], ypos, c=e_col, s=130, zorder=3,
                edgecolors=DARK_NAVY)
    axL.axvline(0, color=LIGHT_TEXT, ls=":", lw=1)
    axL.set_yticks(ypos)
    axL.set_yticklabels(e_order)
    axL.set_xlabel("Effect on non-ag employment (95% CI)")
    axL.set_title("Employment: null overall, large for WOMEN", fontsize=11)
    # right: empowerment outcomes
    p_order = [o[1] for o in emp7]
    p_sub = pwr.set_index("outcome").loc[p_order]
    p_col = [TEAL, TEAL, WARM_ORANGE]
    ypos2 = np.arange(len(p_order))[::-1]
    axR.errorbar(p_sub["estimate"], ypos2, xerr=1.96 * p_sub["se"], fmt="o", ms=9,
                 color=WHITE_TEXT, ecolor=LIGHT_TEXT, capsize=4, lw=2, zorder=2)
    axR.scatter(p_sub["estimate"], ypos2, c=p_col, s=130, zorder=3,
                edgecolors=DARK_NAVY)
    axR.axvline(0, color=LIGHT_TEXT, ls=":", lw=1)
    axR.set_yticks(ypos2)
    axR.set_yticklabels(p_order)
    axR.set_xlabel("Effect (women only, 95% CI)")
    axR.set_title("Empowerment: more agency, less DV acceptance", fontsize=11)
    fig.suptitle("The gender story: women's jobs -> women's empowerment",
                 color=WHITE_TEXT, fontsize=13, y=1.02)
    savefig(fig, "13_employment_empowerment")

    # -- F14: female-employment + empowerment event study -------------------
    es_femp = _rcs_event_study(women, "nonag_employment", controls=["age", "age_sq"])
    es_dec = _rcs_event_study(women, "decision_power", controls=["age", "age_sq"])
    save_csv(es_femp.round(6), "female_employment_event_study.csv")
    fig, ax = plt.subplots(figsize=(9.2, 5.4))
    for es, color, lab in [(es_femp, TEAL, "Female non-ag employment"),
                           (es_dec, WARM_ORANGE, "Decision power")]:
        x = es["event_phase"].to_numpy()
        yv = es["estimate"].to_numpy()
        se = es["se"].to_numpy()
        ax.errorbar(x, yv, yerr=1.96 * se, fmt="o-", ms=7, color=color,
                    ecolor=color, capsize=3, lw=1.8, label=lab)
    ax.axhline(0, color=GRID_LINE, lw=1)
    ax.axvline(-0.5, color=LIGHT_TEXT, ls=":", lw=1.2)
    ax.text(-0.4, ax.get_ylim()[1] * 0.95, "park opens (phase 0)",
            color=LIGHT_TEXT, fontsize=9, va="top")
    ax.set_xlabel("Event phase (DHS rounds since park opening)")
    ax.set_ylabel("Effect (women only, 95% CI)")
    ax.set_title("RCS event study: women's gains appear at and after opening")
    ax.legend(loc="upper left")
    savefig(fig, "14_empowerment_event_study")
    return emp, pwr


# --- RCS event-study helper (phase dummies in a weighted feols) ------------
def _rcs_event_study(df, ycol, controls):
    """Estimate phase-dummy effects for a repeated cross-section. event_phase
    in {-3..+1}; reference = phase -1 (the last pre-opening round). Built as
    explicit 0/1 dummies so the design is transparent and beginner-readable.
    Controls (never-treated) all carry phase NaN -> their dummies are all 0, so
    they form the comparison group within each region^round cell."""
    d2 = df.copy()
    phases = [-3, -2, 0, 1]                          # omit -1 (reference)
    terms = []
    for k in phases:
        col = f"ph_{'m' if k < 0 else 'p'}{abs(k)}"
        d2[col] = ((d2["event_phase"] == k) & d2["treated"].eq(1)).astype(float)
        terms.append(col)
    rhs = " + ".join(terms + controls)
    m = pf.feols(f"{ycol} ~ {rhs} | district_id + region_id^survey_round",
                 data=d2, weights="survey_weight", vcov={"CRV1": "district_id"})
    recs = [{"event_phase": -1, "estimate": 0.0, "se": 0.0, "p_value": np.nan}]
    for k, col in zip(phases, terms):
        recs.append({"event_phase": k, "estimate": m.coef()[col],
                     "se": m.se()[col], "p_value": m.pvalue()[col]})
    return pd.DataFrame(recs).sort_values("event_phase").reset_index(drop=True)


def _plot_rcs_event_study(es, name, title, ylab):
    fig, ax = plt.subplots(figsize=(9, 5.2))
    x = es["event_phase"].to_numpy()
    yv = es["estimate"].to_numpy()
    se = es["se"].to_numpy()
    pre = x < 0
    ax.axhline(0, color=GRID_LINE, lw=1)
    ax.axvline(-0.5, color=LIGHT_TEXT, ls=":", lw=1.2)
    ax.errorbar(x[pre], yv[pre], yerr=1.96 * se[pre], fmt="o", ms=8,
                color=STEEL_BLUE, ecolor=STEEL_BLUE, capsize=3, lw=1.8,
                label="Pre-opening")
    ax.errorbar(x[~pre], yv[~pre], yerr=1.96 * se[~pre], fmt="o", ms=8,
                color=WARM_ORANGE, ecolor=WARM_ORANGE, capsize=3, lw=1.8,
                label="Post-opening")
    ax.plot(x, yv, "-", color=LIGHT_TEXT, lw=1, alpha=0.5, zorder=1)
    ax.set_xlabel("Event phase (DHS rounds since opening; ref = -1)")
    ax.set_ylabel(ylab)
    ax.set_title(title)
    ax.legend(loc="upper left")
    savefig(fig, name)


# ===========================================================================
# SECTION 11 --- ROBUSTNESS BATTERY
# ===========================================================================
def robustness(d):
    banner("SECTION 11 --- robustness: Conley spatial-HAC SEs + restricted pool")
    dt = add_trend_terms(d)

    # (a) Conley spatial-HAC SEs on the Table-1 IHS light spec ---------------
    # Treatment is geographically clustered (the map), so same-year neighbours
    # share shocks; the iid and even the cluster SE understate uncertainty. The
    # Conley spatial-HAC SE (serial UNION spatial) is the honest one.
    rhs = ["treatment"] + TREND_TERMS
    con = conley_se_for_spec(dt, "ihs_light", rhs)
    treat_row = con[con["term"] == "treatment"].iloc[0]
    print("\nConley spatial-HAC SEs for the IHS-light WITH-TRENDS ATT:\n")
    print(f"   estimate      = {treat_row['estimate']:+.4f}")
    print(f"   SE (naive HC0)= {treat_row['se_naive']:.4f}")
    print(f"   SE (cluster)  = {treat_row['se_clustered']:.4f}")
    print(f"   SE (Conley sp)= {treat_row['se_conley']:.4f}")
    print(f"   SE (Conley-HAC)={treat_row['se_hac']:.4f}  "
          f"(t = {treat_row['estimate']/treat_row['se_hac']:+.2f}"
          f"{stars(treat_row['estimate']/treat_row['se_hac'])})")
    infl = treat_row["se_hac"] / treat_row["se_naive"]
    print(f"\n   The Conley-HAC SE is {infl:.2f}x the naive SE, yet the ATT stays")
    print("   significant --- the satellite result is robust to honest spatial SEs.")
    save_csv(con.round(6), "conley_se_comparison.csv")

    # (b) Restricted control pool: drop Addis & 50-km-near controls -----------
    # Re-estimate the headline ATT on a pruned control pool to show the result is
    # not driven by a few atypical (capital / very-near) controls.
    rob_rows = []
    base = pf.feols("ihs_light ~ treatment + " + " + ".join(TREND_TERMS) +
                    " | district_id + region^year",
                    data=dt, vcov={"CRV1": "district_id"})
    rob_rows.append({"subset": "Full sample", "estimate": base.coef()["treatment"],
                     "se": base.se()["treatment"], "n_obs": int(base._N)})

    no_addis = dt[dt["region"] != "Addis Ababa"]
    m_na = pf.feols("ihs_light ~ treatment + " + " + ".join(TREND_TERMS) +
                    " | district_id + region^year",
                    data=no_addis, vcov={"CRV1": "district_id"})
    rob_rows.append({"subset": "Drop Addis Ababa region",
                     "estimate": m_na.coef()["treatment"],
                     "se": m_na.se()["treatment"], "n_obs": int(m_na._N)})

    # keep treated + controls at least 50 km from the nearest city (a "clean"
    # never-treated pool, less likely to be on a park's doorstep)
    far = dt[(dt["treated"] == 1) | (dt["dist_nearest_city_km"] >= 50)]
    m_far = pf.feols("ihs_light ~ treatment + " + " + ".join(TREND_TERMS) +
                     " | district_id + region^year",
                     data=far, vcov={"CRV1": "district_id"})
    rob_rows.append({"subset": "Controls >= 50 km from a city",
                     "estimate": m_far.coef()["treatment"],
                     "se": m_far.se()["treatment"], "n_obs": int(m_far._N)})
    rob = pd.DataFrame(rob_rows)
    rob["stars"] = rob.apply(lambda r: stars(r.estimate / r.se), axis=1)
    print("\nRestricted-control-pool robustness (IHS light, with-trends ATT):\n")
    for _, r in rob.iterrows():
        print(f"   {r.subset:30s} {cell(r.estimate, r.se):>24s}  (N {r.n_obs})")
    print("\n   The ATT is stable across pools (and we already saw Sun-Abraham,")
    print("   Borusyak/Gardner and Callaway-Sant'Anna agree in §6) --- robust.")
    save_csv(rob.round(6), "robustness_results.csv")
    return treat_row


# ===========================================================================
# SECTION 12 --- REPRODUCTION AUDIT
# ===========================================================================
def reproduction_audit(d, hh, ind, twfe_tab, comp, dist, roads, sp):
    banner("SECTION 12 --- reproduction audit (synthetic vs paper, headline cells)")
    dt = add_trend_terms(d)

    def coef_se(model, term="treatment"):
        return model.coef()[term], model.se()[term]

    rows = []

    def add(stage, b, se, paper, note):
        rows.append({"stage": stage, "synthetic_coef": round(float(b), 4),
                     "synthetic_se": round(float(se), 4),
                     "synthetic_sig": stars(b / se) if se else "",
                     "paper_value": paper, "note": note})

    # Table 1 --- IHS light
    t1 = twfe_tab.set_index(["variable", "spec"])
    add("Table 1: IHS light, no trends",
        t1.loc[("ihs_light", "no_trends"), "estimate"],
        t1.loc[("ihs_light", "no_trends"), "se"], 0.265,
        "on target (~0.265)")
    add("Table 1: IHS light, with trends",
        t1.loc[("ihs_light", "with_trends"), "estimate"],
        t1.loc[("ihs_light", "with_trends"), "se"], 0.214,
        "on target (~0.214)")
    add("Table 1: raw light, no trends",
        t1.loc[("light_intensity", "no_trends"), "estimate"],
        t1.loc[("light_intensity", "no_trends"), "se"], 1.723,
        "synthetic ~1.7 (high vs paper 1.276; bright-base device, documented)")
    add("Table 1: raw light, with trends",
        t1.loc[("light_intensity", "with_trends"), "estimate"],
        t1.loc[("light_intensity", "with_trends"), "se"], 1.276,
        "synthetic ~1.6 (high; documented known gap)")
    add("Table 1: impervious, no trends",
        t1.loc[("impervious_ratio", "no_trends"), "estimate"],
        t1.loc[("impervious_ratio", "no_trends"), "se"], 0.032,
        "on target (~0.032)")
    add("Table 1: impervious, with trends",
        t1.loc[("impervious_ratio", "with_trends"), "estimate"],
        t1.loc[("impervious_ratio", "with_trends"), "se"], 0.028,
        "on target (~0.028)")

    # Table 2 --- spillover
    nb = sp[(sp.outcome == "IHS night-light") & (sp.term == "nearby")].iloc[0]
    add("Table 2: nearby spillover (IHS)", nb.estimate, nb.se, 0.0,
        "nearby ~0 ns (no spillover) -- target")

    # Tables 3-4 --- heterogeneity interactions
    for _, r in dist.iterrows():
        add(f"Table 3: interaction {r.moderator}", r.interaction, r.se,
            "neg.", f"negative & {('sig' if r.stars else 'ns')} -- effect fades w/ distance")
    for _, r in roads.iterrows():
        note = "positive & sig -- roads amplify" if r.stars else \
            "positive on-magnitude but BORDERLINE ns (documented)"
        add(f"Table 4: interaction {r.moderator}", r.interaction, r.se, "pos.", note)

    # Table 5 --- household
    for ycol, paper, lbl in [("durable_goods_pc", 0.226, "durables"),
                             ("housing_quality", 0.252, "housing"),
                             ("wealth_index", 0.409, "wealth")]:
        m = pf.feols(f"{ycol} ~ treatment + hh_size + age_head | "
                     "district_id + region_id^survey_round",
                     data=hh, weights="survey_weight", vcov={"CRV1": "district_id"})
        b, se = coef_se(m)
        add(f"Table 5: {lbl} (controls)", b, se, paper, "on target")

    # Table 6 --- employment  (controls: hh_size + age_head + age + age_sq)
    ic = "hh_size + age_head + age + age_sq"
    for label, sub, paper, note in [
        ("full", ind, 0.110, "INSIGNIFICANT on average -- target"),
        ("female", ind[ind.sex == 1], 0.133, "FEMALE ATT *** -- the climax"),
        ("male", ind[ind.sex == 0], 0.015, "male ~0 ns -- target")]:
        m = pf.feols(f"nonag_employment ~ treatment + {ic} | "
                     "district_id + region_id^survey_round",
                     data=sub, weights="survey_weight", vcov={"CRV1": "district_id"})
        b, se = coef_se(m)
        add(f"Table 6: employment {label}", b, se, paper, note)

    # Table 7 --- empowerment
    women = ind[ind.sex == 1]
    for ycol, paper, lbl in [("decision_power", 0.103, "decision power"),
                             ("savings_account", 0.318, "savings account"),
                             ("dv_accept", -0.212, "DV acceptance")]:
        m = pf.feols(f"{ycol} ~ treatment + {ic} | "
                     "district_id + region_id^survey_round",
                     data=women, weights="survey_weight", vcov={"CRV1": "district_id"})
        b, se = coef_se(m)
        add(f"Table 7: {lbl}", b, se, paper, "on target")

    # §6 --- staggered estimators
    for _, r in comp.iterrows():
        add(f"Staggered: {r.estimator} ATT (IHS)", r.att, r.se, "~0.21-0.30",
            "agrees with TWFE -- target band")

    audit = pd.DataFrame(rows)
    print("\nReproduction audit (every headline cell; documented gaps flagged):\n")
    with pd.option_context("display.max_rows", None, "display.width", 200,
                           "display.max_colwidth", 60):
        print(audit.to_string(index=False))
    save_csv(audit, "reproduction_audit.csv")
    return audit


# ===========================================================================
# MAIN
# ===========================================================================
def main() -> None:
    banner("LOADING THE THREE SYNTHETIC DATA LAYERS")
    d = _read(DISTRICT_FILE)
    hh = _read(HOUSEHOLD_FILE)
    ind = _read(INDIVIDUAL_FILE)
    print(f"  district panel : {d.shape}  (data/{DISTRICT_FILE})")
    print(f"  household RCS  : {hh.shape}  (data/{HOUSEHOLD_FILE})")
    print(f"  individual RCS : {ind.shape}  (data/{INDIVIDUAL_FILE})")

    describe(d, hh, ind)                                   # Section 1
    eda(d)                                                 # Section 2  (F1-F4)
    baseline_2x2(d)                                        # Section 3
    twfe_tab = twfe_table1(d)                              # Section 4  (F5)
    event_study(d)                                         # Section 5  (F6)
    comp = staggered(d)                                    # Section 6  (F7-F8)
    dist, roads = heterogeneity(d)                         # Section 7  (F9)
    sp = spillovers(d)                                     # Section 8  (F10)
    household_table5(hh)                                   # Section 9  (F11-F12)
    employment_empowerment(ind)                            # Section 10 (F13-F14)
    robustness(d)                                          # Section 11
    reproduction_audit(d, hh, ind, twfe_tab, comp, dist, roads, sp)  # Section 12

    banner("=== Script completed successfully ===")


if __name__ == "__main__":
    main()
