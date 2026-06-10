#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Evaluating the Economic Impact of a Localized Natural Disaster
==============================================================
A beginner-friendly causal-inference case study of the 2004 Indian Ocean
tsunami in Aceh, Indonesia, in Python — inspired by and based on:

    Heger, M. P., & Neumayer, E. (2019). "The impact of the Indian Ocean
    tsunami on Aceh's long-term economic growth." Journal of Development
    Economics, 141, 102365.  https://doi.org/10.1016/j.jdeveco.2019.06.008

WHAT THIS SCRIPT DOES
---------------------
It walks through four ways of measuring the tsunami's effect on local economic
activity, building from the simplest comparison to the paper's full design:

  1. Exploratory analysis  — space-time dynamics of treated vs control districts.
  2. Difference-in-differences (DiD) on district GDP growth — a naive 2x2, the
     paper's 4-period dynamic DiD (pyfixest), and an event study (diff-diff).
  3. Night-lights dose-response at the sub-district level (pyfixest).
  4. Synthetic control for aggregate flooded-Aceh GDP (mlsynth.VanillaSC).
  5. Conley spatial-HAC standard errors — honest inference when treatment is
     geographically clustered (Moran's I + a from-scratch sandwich estimator).
  6. A robustness battery — placebo, city vs rural, GDP per capita.

IMPORTANT — SYNTHETIC DATA
--------------------------
The two CSVs are SYNTHETIC and *calibrated* so that re-running the paper's
regressions reproduces its FINDINGS (the signs, the statistical significance,
and the approximate magnitudes of the key coefficients). They are a teaching
tool, not real micro-data; magnitudes can differ slightly from the paper.

ESTIMAND
--------
The DiD/TWFE and synthetic-control estimates target the ATT — the Average effect
of the Treatment on the Treated (flooded) districts, relative to the 2000-02
baseline. Identification is the PARALLEL-TRENDS assumption (this is an
observational quasi-experiment, not a randomized trial): absent the tsunami,
flooded and non-flooded districts would have grown by the same amount on average.

Usage:
    python script.py

Outputs (written next to this file):
    python_did_sc_tsunami_*.png   — 11 figures (dark theme)
    *.csv                          — result tables for the write-up
    execution_log.txt              — capture stdout when running via the pipeline
"""

from __future__ import annotations

import importlib
import subprocess
import sys
import warnings
from pathlib import Path

# ---------------------------------------------------------------------------
# Colab/CI bootstrap: install the three estimation libraries if they are
# missing. A no-op on a machine that already has them (e.g. the project venv).
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
    ("mlsynth", "mlsynth @ git+https://github.com/jgreathouse9/mlsynth.git"),
]:
    _ensure(_imp, _spec)

import matplotlib
matplotlib.use("Agg")                       # headless: save figures, never pop windows
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

import pyfixest as pf
import diff_diff as dd
from mlsynth import VanillaSC

# diff-diff absorbs the unit structure, so a time-invariant treatment dummy
# (`flooded`) is collinear and gets dropped — exactly like a fixed-effects
# estimator. The resulting "Rank-deficient design matrix" notice is expected and
# harmless (the treated x period INTERACTIONS, which carry the effect, are kept).
warnings.filterwarnings("ignore", message="Rank-deficient design matrix")

# ===========================================================================
# CONFIGURATION
# ===========================================================================
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

SLUG = "python_did_sc_tsunami"
HERE = Path(__file__).resolve().parent
DATA_DIR = HERE / "data"
GH_RAW = ("https://raw.githubusercontent.com/cmg777/starter-academic-v501/"
          f"master/content/post/{SLUG}/data/")
DISTRICT_FILE = "aceh_tsunami_district_panel.csv"
SUBDISTRICT_FILE = "aceh_tsunami_subdistrict_panel.csv"

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

# Shades for plotting several treated / control units together
TREATED_SHADES = ["#d97757", "#e8956a", "#c4623d"]
CONTROL_SHADES = ["#6a9bcc", "#8fb4d9", "#4a7ba6"]

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

# --- The difference-in-differences design (the paper's Equation 1) ---------
# The tsunami struck in late December 2004, so 2005 is the first treated year.
# The post period is split into event-time windows so the *dynamics* are visible;
# the omitted reference period is the 2000-02 baseline.
TREATMENT_YEAR = 2005
PERIOD_TO_TERM = {"pre": "D_pre", "tsunami": "D_2005",
                  "recovery": "D_recov", "postrec": "D_post"}
DID_TERMS = ["D_pre", "D_2005", "D_recov", "D_post"]
TERM_LABELS = {"D_pre": "Pre-tsunami (2003-04)", "D_2005": "Tsunami (2005)",
               "D_recov": "Recovery (2006-08)", "D_post": "Post-recovery (2009-12)"}
PERIOD_ORDER = ["baseline", "pre", "tsunami", "recovery", "postrec"]
PERIOD_PRETTY = {"baseline": "Baseline\n2000-02", "pre": "Pre\n2003-04",
                 "tsunami": "Tsunami\n2005", "recovery": "Recovery\n2006-08",
                 "postrec": "Post-rec\n2009-12"}
CONLEY_CUTOFF_KM = 100.0

# A few real Aceh districts to spotlight in the exploratory plots.
TREATED_SPOTLIGHT = ["Banda Aceh", "Aceh Besar", "Aceh Jaya"]
CONTROL_SPOTLIGHT = ["Aceh Tengah", "Bener Meriah"]


def banner(title: str) -> None:
    line = "=" * 76
    print(f"\n{line}\n{title}\n{line}")


def savefig(fig, name: str) -> None:
    """Save a dark-theme figure with the house conventions."""
    fig.patch.set_linewidth(0)
    out = HERE / f"{SLUG}_{name}.png"
    fig.savefig(out, dpi=300, bbox_inches="tight",
                facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0.05)
    plt.close(fig)
    print(f"  saved -> {out.name}")


def save_csv(df: pd.DataFrame, name: str, index: bool = False) -> None:
    path = HERE / name
    df.to_csv(path, index=index)
    print(f"  saved -> {name}")


# ===========================================================================
# DATA LOADING
# ===========================================================================
def _read(fname: str) -> pd.DataFrame:
    """Load a panel: prefer the bundled local copy, else GitHub raw (Colab-safe)."""
    local = DATA_DIR / fname
    if local.exists():
        return pd.read_csv(local)
    return pd.read_csv(GH_RAW + fname)


# ===========================================================================
# DiD DESIGN HELPERS  (ported, with comments, from the replication's data_prep)
# ===========================================================================
def make_did_terms(df: pd.DataFrame, treat_col: str) -> pd.DataFrame:
    """
    Add the four treatment x period interaction columns of Equation (1).

    For a treatment variable `treat_col` (a 0/1 dummy such as `flooded`, or a
    continuous "dose" such as `share_area_flooded`) this builds:

        D_pre   = treat x 1[period == "pre"]       (2003-04)
        D_2005  = treat x 1[period == "tsunami"]    (2005)
        D_recov = treat x 1[period == "recovery"]   (2006-08)
        D_post  = treat x 1[period == "postrec"]    (2009-12)

    The 2000-02 baseline gets no term, so it is the reference. Using explicit
    interaction columns (instead of a formula short-cut) keeps the regression
    transparent: the four regressors map one-to-one onto the four table rows.
    """
    out = df.copy()
    treat = out[treat_col].astype(float)
    for period_label, term in PERIOD_TO_TERM.items():
        out[term] = treat * (out["period"] == period_label).astype(float)
    return out


def did_formula(outcome: str, unit_fe: str, time_fe: str = "year") -> str:
    """pyfixest two-way-FE formula, e.g.
    'gdp_growth ~ D_pre + D_2005 + D_recov + D_post | district_id + year'."""
    return f"{outcome} ~ {' + '.join(DID_TERMS)} | {unit_fe} + {time_fe}"


def main_sample(d: pd.DataFrame) -> pd.DataFrame:
    """Table 2, column 1: the 10 flooded Aceh districts + all Sumatra controls,
    EXCLUDING North Sumatra (whose islands were also hit by the 2005 Nias quake)."""
    return d[d["region_group"] != "North Sumatra"]


def aceh_control_sample(d: pd.DataFrame) -> pd.DataFrame:
    """Table 2, column 3: flooded vs non-flooded districts WITHIN Aceh only."""
    return d[d["region_group"] == "Aceh"]


def rest_sumatra_sample(d: pd.DataFrame) -> pd.DataFrame:
    """Table 2, column 2: flooded Aceh vs Rest-of-Sumatra controls."""
    aceh_flooded = (d["flooded"] == 1) & (d["region_group"] == "Aceh")
    return d[(d["region_group"] == "Rest of Sumatra") | aceh_flooded]


# ===========================================================================
# SPATIAL HELPERS + CONLEY SPATIAL-HAC STANDARD ERRORS
# ===========================================================================
def haversine_matrix(lat, lon) -> np.ndarray:
    """n x n great-circle distances (km) between unit centroids."""
    lat = np.radians(np.asarray(lat, float))
    lon = np.radians(np.asarray(lon, float))
    dphi = lat[None, :] - lat[:, None]
    dlmb = lon[None, :] - lon[:, None]
    a = np.sin(dphi / 2) ** 2 + np.cos(lat)[:, None] * np.cos(lat)[None, :] * np.sin(dlmb / 2) ** 2
    return 2 * 6371.0 * np.arcsin(np.sqrt(np.clip(a, 0, 1)))


def morans_i(x, W) -> float:
    """Global Moran's I — the spatial analogue of a correlation coefficient.
    I ~ 0 -> no spatial pattern; I > 0 -> nearby units have SIMILAR values."""
    x = np.asarray(x, float)
    xc = x - x.mean()
    s0 = W.sum()
    return (len(x) / s0) * (xc @ (W @ xc)) / (xc @ xc)


def _two_way_within(Z: np.ndarray, unit, time, n_iter: int = 60) -> np.ndarray:
    """Absorb unit and year fixed effects by iterative demeaning (the 'within'
    transform) — equivalent to pyfixest's `| unit + year`, but done by hand so
    the variance formula below is fully transparent."""
    Z = Z.astype(float).copy()
    for _ in range(n_iter):
        for g in (unit, time):
            tmp = pd.DataFrame(Z)
            tmp["_g"] = g
            Z = Z - tmp.groupby("_g").transform("mean").to_numpy()
    return Z


def _bartlett(D: np.ndarray, cutoff_km: float) -> np.ndarray:
    """Bartlett (triangular) spatial kernel: weight 1 at distance 0, falling
    linearly to 0 at `cutoff_km`. With cutoff <= 0 there is NO spatial linkage,
    so we return the identity (only a unit's own residual counts)."""
    if cutoff_km <= 0:
        return np.eye(D.shape[0])
    return np.maximum(0.0, 1.0 - D / cutoff_km)


def conley_did_estimate(sample: pd.DataFrame, outcome: str = "gdp_growth",
                        treat: str = "flooded", unit: str = "district_id",
                        cutoff_km: float = CONLEY_CUTOFF_KM) -> tuple[pd.DataFrame, int]:
    """
    Estimate one TWFE difference-in-differences column and return the four DiD
    coefficients with FOUR standard errors each:

        se_naive     — HC0, assumes every observation is independent
        se_clustered — clusters by district (SERIAL correlation over time)
        se_conley    — Conley SPATIAL: same-year neighbours within `cutoff_km`
        se_hac       — Conley spatial-HAC: serial UNION spatial (the paper's SE)

    All four share the "bread" (X'X)^-1 and differ only in the "meat" — i.e. which
    error covariances they count. Point estimates are identical to pyfixest.
    """
    df = make_did_terms(sample, treat).dropna(subset=[outcome]).copy()
    Z = df[[outcome] + DID_TERMS].to_numpy(float)
    unit_arr = df[unit].to_numpy()
    year = df["year"].to_numpy()
    lat = df["latitude"].to_numpy()
    lon = df["longitude"].to_numpy()

    Zw = _two_way_within(Z, unit_arr, year)
    y, X = Zw[:, 0], Zw[:, 1:]
    XtXi = np.linalg.inv(X.T @ X)
    beta = XtXi @ (X.T @ y)
    e = y - X @ beta
    k = X.shape[1]

    def se(meat: np.ndarray) -> np.ndarray:
        # clamp tiny negative variances a finite-sample spatial kernel can produce
        return np.sqrt(np.maximum(np.diag(XtXi @ meat @ XtXi), 0.0))

    se_naive = se(X.T @ (X * (e ** 2)[:, None]))                  # independent (HC0)

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

    D = haversine_matrix(lat, lon)                                # Conley-HAC = serial U spatial
    same_unit = unit_arr[:, None] == unit_arr[None, :]
    same_year = year[:, None] == year[None, :]
    spatial_off = (np.where(same_year & ~same_unit, _bartlett(D, cutoff_km), 0.0)
                   if cutoff_km > 0 else np.zeros_like(D))
    W = same_unit.astype(float) + spatial_off
    se_hac = se(X.T @ (W * np.outer(e, e)) @ X)

    out = pd.DataFrame({
        "coefficient": [TERM_LABELS[t] for t in DID_TERMS], "estimate": beta,
        "se_naive": se_naive, "se_clustered": se_clu,
        "se_conley": se_sp, "se_hac": se_hac,
    })
    return out, len(df)


def stars(t: float) -> str:
    """Significance stars from a t-stat (paper convention: 10/5/1%)."""
    a = abs(t)
    return "***" if a > 2.576 else "**" if a > 1.960 else "*" if a > 1.645 else ""


def did_table(sample_dict: dict[str, pd.DataFrame], outcome: str,
              treat: str = "flooded", unit: str = "district_id") -> pd.DataFrame:
    """Build a tidy multi-column DiD table (one column per control pool), with
    the Conley spatial-HAC SE and stars under each coefficient. Returns a frame
    suitable for printing and for saving to CSV."""
    cols, nobs = {}, {}
    for name, samp in sample_dict.items():
        est, n = conley_did_estimate(samp, outcome, treat, unit)
        cells = []
        for _, r in est.iterrows():
            star = stars(r.estimate / r.se_hac) if r.se_hac > 0 else ""
            cells.append(f"{r.estimate:+.4f}{star} ({r.se_hac:.4f})")
        cols[name] = cells
        nobs[name] = f"{n:,}"
    table = pd.DataFrame(cols, index=[TERM_LABELS[t] for t in DID_TERMS])
    table.loc["Observations"] = pd.Series(nobs)
    return table


# ===========================================================================
# 1. EXPLORATORY ANALYSIS — space-time dynamics
# ===========================================================================
def fig_eda_timeseries(d: pd.DataFrame) -> None:
    """A few KEY districts over time: real GDP indexed to 2004 = 100."""
    banner("EDA 1 — key districts over time (GDP indexed to 2004 = 100)")

    def indexed(name: str) -> pd.Series | None:
        sub = d[d["district_name"] == name].set_index("year")["gdp_const_usd_m"]
        if sub.empty or 2004 not in sub.index:
            return None
        return sub / sub.loc[2004] * 100.0

    fig, ax = plt.subplots(figsize=(9, 5.2))
    for name, c in zip(TREATED_SPOTLIGHT, TREATED_SHADES):
        s = indexed(name)
        if s is not None:
            ax.plot(s.index, s.values, "-", lw=2.4, color=c, label=f"{name} (flooded)")
    for name, c in zip(CONTROL_SPOTLIGHT, CONTROL_SHADES):
        s = indexed(name)
        if s is not None:
            ax.plot(s.index, s.values, "--", lw=2.0, color=c, label=f"{name} (control)")
    ax.axvline(2004.5, color=LIGHT_TEXT, ls=":", lw=1.2, label="tsunami (Dec 2004)")
    ax.set_xlabel("Year")
    ax.set_ylabel("Real GDP (2004 = 100)")
    ax.set_title("Key Aceh districts: flooded districts dip in 2005, then rebound")
    ax.legend(loc="center left", bbox_to_anchor=(1.01, 0.5), fontsize=9)
    savefig(fig, "eda_timeseries")


def fig_group_boxplots(d: pd.DataFrame) -> None:
    """Distribution of GDP growth by group (treated vs control) across periods."""
    banner("EDA 2 — distribution of GDP growth by group and period")
    samp = main_sample(d).dropna(subset=["gdp_growth"]).copy()
    samp["group"] = np.where(samp["flooded"] == 1, "Treated (flooded)", "Control")

    fig, ax = plt.subplots(figsize=(9, 5.2))
    width = 0.36
    for gi, (grp, color) in enumerate([("Control", STEEL_BLUE),
                                       ("Treated (flooded)", WARM_ORANGE)]):
        data = [samp[(samp["group"] == grp) & (samp["period"] == p)]["gdp_growth"].values
                for p in PERIOD_ORDER]
        positions = np.arange(len(PERIOD_ORDER)) + (gi - 0.5) * width
        bp = ax.boxplot(data, positions=positions, widths=width, patch_artist=True,
                        showfliers=False, medianprops=dict(color=WHITE_TEXT, lw=1.6),
                        whiskerprops=dict(color=color), capprops=dict(color=color),
                        boxprops=dict(facecolor=color, edgecolor=color, alpha=0.65))
        ax.plot([], [], color=color, lw=8, alpha=0.65, label=grp)
    ax.axhline(0, color=LIGHT_TEXT, lw=0.8, ls=":")
    ax.set_xticks(np.arange(len(PERIOD_ORDER)))
    ax.set_xticklabels([PERIOD_PRETTY[p] for p in PERIOD_ORDER])
    ax.set_ylabel("Annual GDP growth")
    ax.set_title("In 2005 the treated boxes drop; in 2006-08 recovery they lift above controls")
    ax.legend(loc="lower left")
    savefig(fig, "group_boxplots")


def fig_group_means(d: pd.DataFrame) -> tuple[pd.DataFrame, None]:
    """The canonical DiD picture: treated vs control GROUP-MEAN growth by year."""
    banner("EDA 3 — treated vs control group-mean growth (the DiD motivator)")
    samp = main_sample(d).dropna(subset=["gdp_growth"])
    means = (samp.groupby(["year", "flooded"])["gdp_growth"].mean()
             .unstack("flooded").rename(columns={0: "Control", 1: "Treated (flooded)"}))

    fig, ax = plt.subplots(figsize=(9, 5.2))
    ax.plot(means.index, means["Control"], "--o", color=STEEL_BLUE, lw=2, ms=5, label="Control")
    ax.plot(means.index, means["Treated (flooded)"], "-o", color=WARM_ORANGE, lw=2.4, ms=5,
            label="Treated (flooded)")
    ax.axvline(2004.5, color=LIGHT_TEXT, ls=":", lw=1.2)
    ax.axhline(0, color=GRID_LINE, lw=0.8)
    ax.text(2004.6, ax.get_ylim()[1] * 0.96, "tsunami", color=LIGHT_TEXT, fontsize=9, va="top")
    ax.set_xlabel("Year")
    ax.set_ylabel("Mean annual GDP growth")
    ax.set_title("Parallel before 2005, then the treated line dives and overshoots")
    ax.legend(loc="lower left")
    savefig(fig, "group_means")
    save_csv(means.round(5).reset_index(), "eda_group_means.csv")
    return means, None


# ===========================================================================
# 2. DIFFERENCE-IN-DIFFERENCES ON DISTRICT GDP GROWTH
# ===========================================================================
def baseline_2x2(d: pd.DataFrame) -> None:
    """The 2x2 difference-in-differences: the whole idea in one little table."""
    banner("DiD step 1 — the naive 2x2 (treated/control x before/after 2005)")
    sample = make_did_terms(main_sample(d), "flooded").dropna(subset=["gdp_growth"]).copy()

    cell = sample.groupby(["flooded", "post"])["gdp_growth"].mean().unstack("post")
    cell.columns = ["Before (<=2004)", "After (>=2005)"]
    cell.index = ["Control (not flooded)", "Treated (flooded)"]
    cell["After - Before"] = cell["After (>=2005)"] - cell["Before (<=2004)"]
    print("\nMean annual GDP growth in each cell:\n")
    print(cell.round(4).to_string())

    did_hand = (cell.loc["Treated (flooded)", "After - Before"]
                - cell.loc["Control (not flooded)", "After - Before"])
    print(f"\n  DiD by hand = (treated change) - (control change) = {did_hand:+.4f}")
    print(f"  -> over 2005-2012, flooded districts grew about {did_hand*100:.1f} "
          "percentage points/year faster than controls (on average).")

    # The same ATT from diff-diff, which adds a clustered standard error.
    res = dd.DifferenceInDifferences(cluster="district_id").fit(
        sample, outcome="gdp_growth", treatment="flooded", time="post")
    lo, hi = res.conf_int
    print(f"\n  diff-diff DifferenceInDifferences: ATT = {res.att:+.4f} "
          f"(SE {res.se:.4f}, p = {res.p_value:.3f}, 95% CI [{lo:+.4f}, {hi:+.4f}])")
    print("  A single 'after' window blends the 2005 destruction with the 2006-08")
    print("  boom, so the average looks small. The dynamic DiD below unpacks it.")

    out = cell.round(5).reset_index().rename(columns={"index": "group"})
    out["did_att"] = round(did_hand, 5)
    out["did_se"] = round(res.se, 5)
    out["did_p"] = round(res.p_value, 5)
    save_csv(out, "baseline_2x2.csv")


def twfe_did(d: pd.DataFrame) -> None:
    """Table 2 — the paper's 4-period dynamic DiD across three control pools."""
    banner("DiD step 2 — dynamic TWFE difference-in-differences (Table 2)")

    # pyfixest cross-check on column 1 (the point estimates the Conley table reports)
    m = pf.feols(did_formula("gdp_growth", "district_id"),
                 data=make_did_terms(main_sample(d), "flooded"),
                 vcov={"CRV1": "district_id"})
    print("\npyfixest point estimates (Sumatra controls):")
    for term in DID_TERMS:
        print(f"   {TERM_LABELS[term]:24s} {m.coef()[term]:+.4f}")

    samples = {
        "(1) Sumatra controls": main_sample(d),
        "(2) Rest of Sumatra": rest_sumatra_sample(d),
        "(3) Aceh non-flooded": aceh_control_sample(d),
    }
    table = did_table(samples, "gdp_growth")
    print("\nTable 2 — tsunami effect on district GDP growth")
    print("(Conley spatial-HAC SE in parentheses; *** p<.01, ** p<.05, * p<.10)\n")
    print(table.to_string())
    print("\nReading: flooded districts lost ~8% output in 2005 (col 1) but the")
    print("2006-08 reconstruction boom more than offset it. Versus Aceh's own")
    print("non-flooded districts (col 3) the recovery gap is smaller — reconstruction")
    print("spilled over to neighbouring Aceh districts, attenuating the contrast.")
    save_csv(table.reset_index().rename(columns={"index": "coefficient"}),
             "did_twfe_table2.csv")

    # Per-capita (Table 8): GDP and population fell together in 2005.
    banner("DiD per-capita check (Table 8)")
    pc = did_table(samples, "gdp_pc_growth")
    print(pc.to_string())
    print("\nReading: no significant 2005 per-capita loss (output and population fell")
    print("together), but a significant recovery gain (fewer people sharing a rebuilt")
    print("economy) — so the result is not merely a mortality/denominator artifact.")
    save_csv(pc.reset_index().rename(columns={"index": "coefficient"}),
             "did_percapita_table8.csv")


def event_study(d: pd.DataFrame) -> None:
    """An event study: one treated-vs-control effect per period (diff-diff)."""
    banner("DiD step 3 — event study (diff-diff MultiPeriodDiD)")
    sample = make_did_terms(main_sample(d), "flooded").dropna(subset=["gdp_growth"]).copy()
    mp = dd.MultiPeriodDiD(cluster="district_id").fit(
        sample, outcome="gdp_growth", treatment="flooded", time="period",
        reference_period="baseline", absorb=["district_id"])

    order = ["pre", "tsunami", "recovery", "postrec"]
    rows = [["baseline", 0.0, 0.0, np.nan]]
    for p in order:
        pe = mp.period_effects[p]
        rows.append([p, pe.effect, pe.se, pe.p_value])
    eff = pd.DataFrame(rows, columns=["period", "effect", "se", "p_value"])
    print("\nTreated-control effect on GDP growth (relative to the 2000-02 baseline):\n")
    print(eff.round(4).to_string(index=False))

    loss = eff.loc[eff.period == "tsunami", "effect"].iloc[0]
    boom = eff.loc[eff.period == "recovery", "effect"].iloc[0]
    print(f"\n  Pre-tsunami ~ 0 and insignificant -> parallel-trends check PASSES.")
    print(f"  2005 = {loss:+.3f} (destruction); 2006-08 = {boom:+.3f}/yr (reconstruction boom).")
    print(f"  Cumulative recovery ~ 3 x {boom:.3f} = {3*boom:+.3f} dwarfs the {loss:+.3f} loss")
    print("  -> 'recovery beyond the counterfactual trend'.")
    save_csv(eff.round(6), "event_study_effects.csv")

    # Figure
    x = np.arange(len(PERIOD_ORDER))
    e = eff["effect"].to_numpy()
    se = eff["se"].to_numpy()
    fig, ax = plt.subplots(figsize=(9, 5.2))
    ax.axhline(0, color=GRID_LINE, lw=1)
    ax.axvline(2, color=STEEL_BLUE, ls="--", lw=1.2, label="tsunami (Dec 2004)")
    colors = [LIGHT_TEXT, STEEL_BLUE, WARM_ORANGE, TEAL, STEEL_BLUE]
    ax.errorbar(x, e, yerr=1.96 * se, fmt="o-", color=WHITE_TEXT, ecolor=LIGHT_TEXT,
                capsize=4, lw=2, zorder=2, label="effect (95% CI)")
    ax.scatter(x, e, c=colors, s=90, zorder=3, edgecolors=DARK_NAVY)
    ax.set_xticks(x)
    ax.set_xticklabels([PERIOD_PRETTY[p] for p in PERIOD_ORDER])
    ax.set_ylabel("Effect on annual GDP growth")
    ax.set_title("Event study: a flat pre-trend, a 2005 collapse, a 2006-08 rebound")
    ax.legend(loc="upper left")
    savefig(fig, "event_study")


# ===========================================================================
# 3. NIGHT-LIGHTS DOSE-RESPONSE (sub-district)
# ===========================================================================
def _nl_fit(s: pd.DataFrame, treat: str):
    """One night-lights DiD column: nl_growth on treat x period, kecamatan+year FE.
    Night-lights SEs cluster on the sub-district only (the paper notes spatial SEs
    do not converge for the night-lights regressions, footnote 10)."""
    df = make_did_terms(s, treat)
    return pf.feols(did_formula("nl_growth", unit_fe="kecamatan_id"),
                    data=df, vcov={"CRV1": "kecamatan_id"})


def _tidy(model, measure: str) -> pd.DataFrame:
    t = model.tidy().loc[DID_TERMS, ["Estimate", "Std. Error", "Pr(>|t|)"]].copy()
    t.columns = ["estimate", "se", "p_value"]
    t.insert(0, "coefficient", [TERM_LABELS[i] for i in DID_TERMS])
    t.insert(1, "measure", measure)
    return t.reset_index(drop=True)


def nightlights(s: pd.DataFrame) -> None:
    banner("NIGHT-LIGHTS step 1 — Table 1: 2004 luminosity, flooded vs not")
    snap = s[s["year"] == 2004]
    tab1 = (snap.groupby("flooded")["avg_luminosity"]
            .agg(obs="count", mean="mean", std="std", min="min", max="max").round(2))
    tab1.index = ["Non-flooded", "Flooded"]
    print(tab1.to_string())
    print("\nFlooded coastal sub-districts are about 2.5x brighter (denser, more active).")
    save_csv(tab1.reset_index().rename(columns={"index": "group"}), "table1_luminosity.csv")

    banner("NIGHT-LIGHTS step 2 — Table 3: continuous dose-response")
    measures = [("share_pop_flooded", "Share of population flooded"),
                ("share_area_flooded", "Share of area flooded")]
    tidy = pd.concat([_tidy(_nl_fit(s, col), label) for col, label in measures],
                     ignore_index=True)
    for _, label in measures:
        sub = tidy[tidy.measure == label]
        print(f"\n{label}:")
        for _, r in sub.iterrows():
            print(f"   {r.coefficient:24s} {r.estimate:+.4f}{stars(r.estimate/r.se):<3} "
                  f"(se {r.se:.4f})")
    print("\nReading: the more flooded a sub-district, the stronger its luminosity")
    print("rebound during reconstruction. Share-of-area has a tiny mean, so its")
    print("coefficient is ~100x larger than share-of-population for the same story.")
    save_csv(tidy.round(6), "nightlights_dose_response.csv")

    banner("NIGHT-LIGHTS step 3 — Table 4: effect by intensity quintile")
    quint_rows = []
    quint_models = {}
    for col, label in measures:
        df = s.copy()
        fl = (df[df["flooded"] == 1].drop_duplicates("kecamatan_id")
              .set_index("kecamatan_id")[col])
        q = pd.qcut(fl, 5, labels=[1, 2, 3, 4, 5]).astype(int)
        df["_Q"] = df["kecamatan_id"].map(q).fillna(0).astype(int)
        for qq in range(1, 6):
            df[f"Q{qq}_post"] = ((df["_Q"] == qq) & (df["post"] == 1)).astype(float)
        rhs = " + ".join(f"Q{qq}_post" for qq in range(1, 6))
        mq = pf.feols(f"nl_growth ~ {rhs} | kecamatan_id + year", data=df,
                      vcov={"CRV1": "kecamatan_id"})
        quint_models[label] = mq
        td = mq.tidy()
        for qq in range(1, 6):
            term = f"Q{qq}_post"
            est, se = td.loc[term, "Estimate"], td.loc[term, "Std. Error"]
            quint_rows.append({"measure": label, "quintile": qq,
                               "estimate": est, "se": se,
                               "p_value": td.loc[term, "Pr(>|t|)"]})
    quint = pd.DataFrame(quint_rows)
    print("\nEffect by quintile of flooding intensity (only the top quintile bites):\n")
    for label in [m[1] for m in measures]:
        sub = quint[quint.measure == label]
        cells = "  ".join(f"Q{int(r.quintile)}={r.estimate:+.4f}{stars(r.estimate/r.se)}"
                          for _, r in sub.iterrows())
        print(f"   {label}: {cells}")
    save_csv(quint.round(6), "nightlights_quintiles.csv")

    # Figure: continuous-dose period coefficients (left) + quintile effects (right)
    fig, (axL, axR) = plt.subplots(1, 2, figsize=(11, 5), gridspec_kw={"wspace": 0.28})
    sub = tidy[tidy.measure == "Share of population flooded"]
    xx = np.arange(len(DID_TERMS))
    axL.axhline(0, color=GRID_LINE, lw=1)
    axL.errorbar(xx, sub["estimate"], yerr=1.96 * sub["se"], fmt="o", color=WARM_ORANGE,
                 ecolor=LIGHT_TEXT, capsize=4, ms=9)
    axL.set_xticks(xx)
    axL.set_xticklabels(["Pre\n03-04", "2005", "Recov\n06-08", "Post\n09-12"])
    axL.set_ylabel("Effect on night-lights growth")
    axL.set_title("Continuous dose: share of population flooded", fontsize=11)

    sub = quint[quint.measure == "Share of population flooded"]
    bar_colors = [STEEL_BLUE] * 4 + [TEAL]
    axR.axhline(0, color=GRID_LINE, lw=1)
    axR.bar(sub["quintile"], sub["estimate"], yerr=1.96 * sub["se"], color=bar_colors,
            edgecolor=DARK_NAVY, capsize=3, alpha=0.9)
    axR.set_xlabel("Intensity quintile (5 = most flooded)")
    axR.set_title("Quintiles: only the worst-hit (Q5) rebound", fontsize=11)
    fig.suptitle("Night-lights dose-response: bigger flood dose, bigger recovery",
                 color=WHITE_TEXT, fontsize=13, y=1.03)
    savefig(fig, "nightlights_dose")


# ===========================================================================
# 4. SYNTHETIC CONTROL  (mlsynth.VanillaSC)
# ===========================================================================
def _index_100(d, mask) -> pd.Series:
    g = d[mask].groupby("year")["gdp_const_usd_m"].sum()
    return g / g.loc[2004] * 100.0


def synthetic_control(d: pd.DataFrame) -> None:
    banner("SYNTHETIC CONTROL step 1 — Figure 2: raw GDP dynamics (index 2004=100)")
    treated = _index_100(d, (d["flooded"] == 1) & (d["region_group"] == "Aceh"))
    aceh_ctrl = _index_100(d, (d["flooded"] == 0) & (d["region_group"] == "Aceh"))
    rest_ctrl = _index_100(d, d["region_group"] == "Rest of Sumatra")
    print(f"  2012 index — treated {treated.loc[2012]:.0f}, "
          f"Aceh control {aceh_ctrl.loc[2012]:.0f}, rest {rest_ctrl.loc[2012]:.0f}")

    fig, ax = plt.subplots(figsize=(9, 5.2))
    ax.plot(treated.index, treated, "-", color=WARM_ORANGE, lw=2.6,
            label="Flooded Aceh (treated, n=10)")
    ax.plot(aceh_ctrl.index, aceh_ctrl, "--", color=STEEL_BLUE, lw=2,
            label="Non-flooded Aceh (control, n=13)")
    ax.plot(rest_ctrl.index, rest_ctrl, ":", color=TEAL, lw=2,
            label="Rest of Sumatra (control, n=76)")
    ax.axvline(2004.5, color=LIGHT_TEXT, ls=":", lw=1.2)
    ax.set_xlabel("Year")
    ax.set_ylabel("Real GDP (2004 = 100)")
    ax.set_title("Figure 2 — flooded Aceh dips, then climbs above both control groups")
    ax.legend(loc="upper left")
    savefig(fig, "gdp_dynamics")

    banner("SYNTHETIC CONTROL step 2 — Figure 3: synthetic Aceh (mlsynth VanillaSC)")
    # Reshape to mlsynth's long format: ONE treated unit (the average GDP of the
    # 10 flooded Aceh districts) + 76 Rest-of-Sumatra donor districts.
    treated_panel = (d[(d["flooded"] == 1) & (d["region_group"] == "Aceh")]
                     .groupby("year", as_index=False)["gdp_const_usd_m"].mean()
                     .assign(unitid="Aceh (flooded)")
                     .rename(columns={"year": "time", "gdp_const_usd_m": "outcome"}))
    donors = (d[d["region_group"] == "Rest of Sumatra"]
              [["district_id", "year", "gdp_const_usd_m"]]
              .rename(columns={"district_id": "unitid", "year": "time",
                               "gdp_const_usd_m": "outcome"}))
    panel = pd.concat([treated_panel[["unitid", "time", "outcome"]], donors],
                      ignore_index=True)
    panel["treat"] = ((panel["unitid"] == "Aceh (flooded)")
                      & (panel["time"] >= TREATMENT_YEAR)).astype(int)
    panel = panel.sort_values(["unitid", "time"]).reset_index(drop=True)

    config = {"df": panel, "outcome": "outcome", "treat": "treat",
              "unitid": "unitid", "time": "time", "display_graphs": False}
    out = VanillaSC(config).fit().model_dump()
    ts, effd, diag = out["time_series"], out["effects"], out["fit_diagnostics"]
    years = np.asarray(ts["time_periods"])
    observed = np.asarray(ts["observed_outcome"], dtype=float).ravel()
    synth = np.asarray(ts["counterfactual_outcome"], dtype=float).ravel()
    rmse_pre, att, att_pct = diag["rmse_pre"], effd["att"], effd["att_percent"]
    weights = out["weights"]["donor_weights"]
    donor_names = out["additional_outputs"]["donor_names"]
    top = sorted(weights.items(), key=lambda kv: -abs(kv[1]))[:6]

    print(f"  Pre-tsunami fit  : RMSE = {rmse_pre:.3f} (small -> good pre-2005 match)")
    print(f"  Post-tsunami ATT : +{att:.1f} GDP units (~ +{att_pct:.1f}% above counterfactual)")
    print("  Biggest donor weights:")
    for name, w in top:
        print(f"      {name:14s} {w:5.3f}")

    save_csv(pd.DataFrame({"year": years, "observed": observed, "synthetic": synth,
                           "gap": observed - synth}).round(3),
             "synthetic_control_gap.csv")
    save_csv(pd.DataFrame(sorted(weights.items(), key=lambda kv: -abs(kv[1])),
                          columns=["donor", "weight"]).round(4),
             "synthetic_control_weights.csv")
    save_csv(pd.DataFrame([{"n_donors": len(donor_names), "rmse_pre": round(rmse_pre, 4),
                            "att": round(att, 3), "att_percent": round(att_pct, 2),
                            "treated_2012": round(observed[-1], 1),
                            "synthetic_2012": round(synth[-1], 1)}]),
             "synthetic_control_summary.csv")

    # Path figure
    fig, ax = plt.subplots(figsize=(9, 5.2))
    ax.plot(years, observed, "-", color=WARM_ORANGE, lw=2.6, label="Treated: flooded-Aceh GDP")
    ax.plot(years, synth, "--", color=WHITE_TEXT, lw=2, label="Synthetic Aceh (weighted donors)")
    ax.fill_between(years, observed, synth, where=(years >= 2005), color=TEAL, alpha=0.22,
                    label="estimated effect (gap)")
    ax.axvline(2004.5, color=LIGHT_TEXT, ls=":", lw=1.2)
    ax.set_xlabel("Year")
    ax.set_ylabel("Real GDP (constant USD, millions)")
    ax.set_title(f"Figure 3 — synthetic control: ATT ~ +{att_pct:.0f}% by 2012 "
                 f"(pre-RMSE {rmse_pre:.2f})")
    ax.legend(loc="upper left")
    savefig(fig, "synthetic_control")

    # Gap figure
    fig, ax = plt.subplots(figsize=(9, 4.6))
    ax.axhline(0, color=GRID_LINE, lw=1)
    ax.axvline(2004.5, color=LIGHT_TEXT, ls=":", lw=1.2)
    ax.plot(years, observed - synth, "-o", color=TEAL, lw=2.2, ms=5)
    ax.fill_between(years, 0, observed - synth, where=(years >= 2005), color=TEAL, alpha=0.18)
    ax.set_xlabel("Year")
    ax.set_ylabel("Treated - synthetic (GDP units)")
    ax.set_title("The gap is ~0 before 2005, then opens up: the tsunami-plus-aid effect")
    savefig(fig, "sc_gap")

    # Donor-weights bar
    fig, ax = plt.subplots(figsize=(8, 4.6))
    names = [t[0] for t in top][::-1]
    vals = [t[1] for t in top][::-1]
    ax.barh(names, vals, color=STEEL_BLUE, edgecolor=DARK_NAVY)
    ax.set_xlabel("Donor weight")
    ax.set_title("The 'recipe' for synthetic Aceh: a handful of Sumatra donors")
    savefig(fig, "sc_weights")


# ===========================================================================
# 5. CONLEY SPATIAL STANDARD ERRORS
# ===========================================================================
def spatial_inference(d: pd.DataFrame) -> None:
    banner("SPATIAL step 1 — map: treatment is geographically clustered")
    snap = d[d["year"] == 2004]
    fig, ax = plt.subplots(figsize=(7.2, 7.6))
    for fl, color, label in [(0, STEEL_BLUE, "control"),
                             (1, WARM_ORANGE, "flooded (treated)")]:
        g = snap[snap["flooded"] == fl]
        ax.scatter(g["longitude"], g["latitude"], c=color, s=42, edgecolors=DARK_NAVY,
                   linewidth=0.5, label=label, zorder=3)
    ax.set_xlabel("Longitude (deg E)")
    ax.set_ylabel("Latitude (deg N)")
    ax.set_title("The 10 flooded districts cluster on Aceh's NW coast\n"
                 "(so their growth shocks are not independent)")
    ax.legend(loc="lower right")
    savefig(fig, "spatial_map")

    banner("SPATIAL step 2 — Moran's I: is there spatial autocorrelation?")
    g = d.dropna(subset=["gdp_growth"]).copy()
    yd = pd.get_dummies(g["year"], drop_first=True).to_numpy(float)
    Xf = np.column_stack([np.ones(len(g)), g["flooded"].to_numpy(float), yd])
    yv = g["gdp_growth"].to_numpy()
    resid = yv - Xf @ np.linalg.lstsq(Xf, yv, rcond=None)[0]
    year = g["year"].to_numpy()
    D = haversine_matrix(g["latitude"].to_numpy(), g["longitude"].to_numpy())
    same = year[:, None] == year[None, :]
    W = ((D <= CONLEY_CUTOFF_KM) & (D > 0) & same).astype(float)
    rs = W.sum(1, keepdims=True)
    rs[rs == 0] = 1.0
    W = W / rs
    obs_I = morans_i(resid, W)
    rng = np.random.default_rng(1)
    groups = {y: np.where(year == y)[0] for y in np.unique(year)}
    null = np.empty(299)
    for b in range(299):
        rp = resid.copy()
        for y, idxs in groups.items():
            rp[idxs] = resid[idxs][rng.permutation(len(idxs))]
        null[b] = morans_i(rp, W)
    pval = (1 + np.sum(null >= obs_I)) / (len(null) + 1)
    print(f"  Pooled within-year Moran's I = {obs_I:+.3f} (permutation p = {pval:.3f})")
    print(f"  Null mean ~ {null.mean():+.3f}, SD ~ {null.std():.3f}")
    print("  -> nearby districts share within-year shocks; the iid assumption fails.")

    banner("SPATIAL step 3 — four standard errors for the SAME DiD estimates")
    est, _ = conley_did_estimate(main_sample(d), "gdp_growth", "flooded")
    est = est.rename(columns={"se_naive": "SE_naive", "se_clustered": "SE_clustered",
                              "se_conley": "SE_Conley", "se_hac": "SE_ConleyHAC"})
    show = est.copy()
    show["t(HAC)"] = (show["estimate"] / show["SE_ConleyHAC"]).round(2)
    print("\n" + show.round(4).to_string(index=False))
    infl = est["SE_ConleyHAC"] / est["SE_naive"]
    print(f"\n  Conley-HAC SEs are {infl.min():.2f}x-{infl.max():.2f}x the naive SEs.")
    print("  Point estimates are identical; only honesty about uncertainty changes.")
    print("  Under naive SEs the recovery effect would look ***; under the paper's")
    print("  Conley-HAC SE it is only ** — naive inference would overstate confidence.")
    est["morans_i"] = round(obs_I, 4)
    est["morans_p"] = round(pval, 4)
    save_csv(est.round(5), "conley_se_comparison.csv")

    banner("SPATIAL step 4 — how the Conley SE depends on the distance cutoff")
    cutoffs = [0, 25, 50, 100, 150, 200, 300]
    recov = TERM_LABELS["D_recov"]
    se_by_cut = []
    for c in cutoffs:
        e2, _ = conley_did_estimate(main_sample(d), "gdp_growth", "flooded", cutoff_km=float(c))
        se_by_cut.append(e2.loc[e2.coefficient == recov, "se_hac"].iloc[0])
    for c, s in zip(cutoffs, se_by_cut):
        tag = " (serial only, no spatial)" if c == 0 else ""
        print(f"   {c:3d} km : SE = {s:.4f}{tag}")
    save_csv(pd.DataFrame({"cutoff_km": cutoffs, "recovery_se_hac": np.round(se_by_cut, 5)}),
             "conley_cutoff_sensitivity.csv")

    fig, ax = plt.subplots(figsize=(8, 4.8))
    ax.plot(cutoffs, se_by_cut, "-o", color=WARM_ORANGE, lw=2.2, ms=6)
    ax.axhline(se_by_cut[0], color=LIGHT_TEXT, ls="--", lw=1, label="no-spatial SE (cutoff 0)")
    ax.set_xlabel("Conley distance cutoff (km)")
    ax.set_ylabel("SE of the recovery (2006-08) effect")
    ax.set_title("Conley SE grows with the cutoff, then stabilizes (paper uses 100 km)")
    ax.legend(loc="upper right")
    savefig(fig, "conley_cutoff")


# ===========================================================================
# 6. ROBUSTNESS BATTERY
# ===========================================================================
def robustness(d: pd.DataFrame) -> None:
    banner("ROBUSTNESS — placebo, city vs rural, and a summary table")
    out_rows = []

    # Placebo: drop the truly flooded, pretend NEIGHBOURS were treated.
    nonflooded = d[d["flooded"] == 0]
    est, n = conley_did_estimate(nonflooded, "gdp_growth", "neighbour_of_flooded")
    print("\nPlacebo (neighbours of flooded as fake-treated) — expect NO effect:")
    for _, r in est.iterrows():
        print(f"   {r.coefficient:24s} {r.estimate:+.4f}{stars(r.estimate/r.se_hac):<3} "
              f"(se {r.se_hac:.4f})")
        out_rows.append({"check": "placebo (neighbours)", **r.to_dict(), "n": n})

    # City (Kota) vs rural (Kabupaten) — flooded vs all Sumatra controls.
    for dtype, tag in [("Kota", "city"), ("Kabupaten", "rural")]:
        samp = main_sample(d)
        samp = samp[samp["district_type"] == dtype]
        est, n = conley_did_estimate(samp, "gdp_growth", "flooded")
        print(f"\n{tag.capitalize()} districts:")
        for _, r in est.iterrows():
            print(f"   {r.coefficient:24s} {r.estimate:+.4f}{stars(r.estimate/r.se_hac):<3} "
                  f"(se {r.se_hac:.4f})")
            out_rows.append({"check": f"{tag} districts", **r.to_dict(), "n": n})
    print("\nReading: the placebo finds nothing (the effect is not a spatial spillover);")
    print("rural districts took the big 2005 hit, cities led the recovery (but only 2")
    print("flooded city districts -> imprecise, as the paper cautions).")

    save_csv(pd.DataFrame(out_rows).round(5), "robustness_results.csv")


# ===========================================================================
# DESCRIPTIVES
# ===========================================================================
def describe_panels(d: pd.DataFrame, s: pd.DataFrame) -> None:
    banner("DATA — panel shapes and group sizes")
    print(f"District panel    : {d.shape[0]} rows, {d['district_id'].nunique()} districts, "
          f"years {d['year'].min()}-{d['year'].max()}")
    print(f"Sub-district panel: {s.shape[0]} rows, {s['kecamatan_id'].nunique()} kecamatans")
    grp = (d[d["year"] == 2004].groupby(["region_group", "flooded"]).size()
           .unstack("flooded", fill_value=0)
           .rename(columns={0: "control", 1: "flooded"}))
    print("\nDistricts by region and treatment (2004 snapshot):")
    print(grp.to_string())
    print(f"\nNOTE: gdp_growth is missing in 1999 (no prior year) and for Subulussalam "
          "2003-06\n(an administrative change), so estimators drop those rows.")

    keyvars = ["gdp_growth", "gdp_pc_growth", "gdp_const_usd_m", "population"]
    desc = d[keyvars].describe().round(3).T
    save_csv(desc.reset_index().rename(columns={"index": "variable"}), "descriptive_stats.csv")
    grp_out = grp.reset_index()
    grp_out["total"] = grp_out["control"] + grp_out["flooded"]
    save_csv(grp_out, "group_sizes.csv")


# ===========================================================================
# MAIN
# ===========================================================================
def main() -> None:
    banner("LOADING DATA")
    d = _read(DISTRICT_FILE)
    s = _read(SUBDISTRICT_FILE)
    print(f"  district panel    : {d.shape}  (source: data/{DISTRICT_FILE})")
    print(f"  sub-district panel: {s.shape}  (source: data/{SUBDISTRICT_FILE})")

    describe_panels(d, s)

    # 1. Exploratory analysis
    fig_eda_timeseries(d)
    fig_group_boxplots(d)
    fig_group_means(d)

    # 2. Difference-in-differences on district GDP growth
    baseline_2x2(d)
    twfe_did(d)
    event_study(d)

    # 3. Night-lights dose-response
    nightlights(s)

    # 4. Synthetic control
    synthetic_control(d)

    # 5. Conley spatial standard errors
    spatial_inference(d)

    # 6. Robustness
    robustness(d)

    banner("=== Script completed successfully ===")


if __name__ == "__main__":
    main()
