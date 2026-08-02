"""
THE SYNTHETIC-CONTROL LADDER IN PYTHON — the full mlsynth pipeline

    DiD  ->  SC  ->  DSC  ->  SDID  ->  MASC  ->  ASCM

Companion script for https://carlos-mendez.org/post/python_sc_dsc_sdid/
The Python counterpart of the R post's analysis.R, with one difference of
emphasis: analysis.R hand-codes every estimator and then checks it against a
package. This script does not hand-code anything. Every stage is a single
mlsynth class, and the interesting work is in the *options*.

Every estimator comes from mlsynth (Jared Greathouse), which exposes all six
stages behind one config-dict API. The mapping was worked out in mlsynth issue
#312: https://github.com/jgreathouse9/mlsynth/issues/312

Install:
    pip install -U "git+https://github.com/jgreathouse9/mlsynth.git"

Usage:
    python analysis.py 2>&1 | tee execution_log.txt
    FORCE_REFIT=1 python analysis.py      # invalidate the cache
    APP_DATA=1    python analysis.py      # also rebuild web_app/data/results.json

Run time: about 12 minutes cold, under a minute warm.
Outputs:  python_sc_dsc_sdid_*.png (figures) and *.csv (result tables).
          Under APP_DATA=1, four more app_*.csv tables and the interactive
          companion's web_app/data/results.json (section 17).

NAMING HAZARD
    mlsynth ships a class called DSC. It is NOT the estimator in this post.
      mlsynth.DSC     = DISTRIBUTIONAL synthetic control (Gunsilius 2023)
      this post's DSC = DEMEANED synthetic control (Doudchenko & Imbens 2016;
                        Ferman & Pinto 2021), which in mlsynth is
                        TSSC(method="MSCa").
    Importing the wrong one raises no error. It answers a different question.
"""

from __future__ import annotations

import os
import pickle
import sys
import textwrap
import time
import warnings
from pathlib import Path

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

import mlsynth
from mlsynth import FDID, MASC, SDID, TSSC, VanillaSC
from mlsynth.exceptions import MlsynthConfigError, MlsynthDataError

# ══════════════════════════════════════════════════════════════════════════════
# 0. SETUP
# ══════════════════════════════════════════════════════════════════════════════

SLUG = "python_sc_dsc_sdid"
SEED = 20260801
rng = np.random.default_rng(SEED)

# Site palette, dark navy theme — identical to the R post so the two read as a
# pair.
DARK_BG = "#0f1729"       # figure background
DARK_PANEL = "#1f2b5e"    # grid lines
LIGHT_TEXT = "#c8d0e0"    # axis text
LIGHTER_TEXT = "#e8ecf2"  # titles
MUTED = "#8b9dc3"         # captions, zero reference lines
GREY_DONOR = "#54618a"    # donor / placebo spaghetti
STEEL = "#6a9bcc"         # synthetic control
ORANGE = "#d97757"        # the treated unit (UK), and reference values
TEAL = "#00d4c8"          # the highlighted / recommended estimator
GOLD = "#e8b04b"          # a fourth series where three are not enough

plt.rcParams.update({
    "figure.facecolor": DARK_BG,
    "axes.facecolor": DARK_BG,
    "savefig.facecolor": DARK_BG,
    "axes.edgecolor": DARK_PANEL,
    "axes.labelcolor": LIGHT_TEXT,
    "axes.titlecolor": LIGHTER_TEXT,
    "axes.titlesize": 13,
    "axes.titleweight": "bold",
    "axes.grid": True,
    "grid.color": DARK_PANEL,
    "grid.linewidth": 0.3,
    "text.color": LIGHT_TEXT,
    "xtick.color": LIGHT_TEXT,
    "ytick.color": LIGHT_TEXT,
    "legend.facecolor": DARK_BG,
    "legend.edgecolor": DARK_PANEL,
    "legend.framealpha": 0.9,
    "font.size": 11,
    "figure.dpi": 110,
})

METHOD_COLORS = {
    "DiD": MUTED,
    "SC": STEEL,
    "DSC": TEAL,
    "SDID": ORANGE,
    "SDID (i)": ORANGE,
    "SDID (ii)": GOLD,
    "SDID (iii)": "#c47ad0",
    "MASC": "#7fd17f",
    "ASCM": "#e0679a",
}


def rule(txt: str) -> None:
    print("\n" + "=" * 78)
    print(txt)
    print("=" * 78)


def save_fig(fig, name: str, w: float = 9, h: float = 6, dpi: int = 300) -> None:
    fig.set_size_inches(w, h)
    fname = f"{SLUG}_{name}.png"
    fig.savefig(fname, dpi=dpi, bbox_inches="tight", facecolor=DARK_BG)
    plt.close(fig)
    print(f"  [figure] {fname}")


def write_tab(df: pd.DataFrame, name: str) -> None:
    df.to_csv(f"{name}.csv", index=False)
    print(f"  [table]  {name}.csv")


def caption(fig, text: str) -> None:
    fig.text(0.01, -0.02, textwrap.fill(text, 130), color=MUTED, fontsize=8.5,
             ha="left", va="top")


FORCE_REFIT = bool(os.environ.get("FORCE_REFIT", ""))


def cache(key: str, fn):
    """Memoise an expensive fit to cache/<slug>_<key>.pkl.

    The pickle files are written and read by this script alone — the R post's
    analysis.R does the same thing with saveRDS/readRDS. Nothing untrusted is
    ever unpickled here; delete cache/ or set FORCE_REFIT=1 to rebuild.
    """
    path = Path("cache") / f"{SLUG}_{key}.pkl"
    if not FORCE_REFIT and path.exists():
        print(f"  [cache] {key}")
        with path.open("rb") as fh:
            return pickle.load(fh)
    path.parent.mkdir(exist_ok=True)
    t0 = time.time()
    value = fn()
    with path.open("wb") as fh:
        pickle.dump(value, fh)
    print(f"  [fit]   {key}  ({time.time() - t0:.1f}s)")
    return value


# --- Anchors. The reduced index t runs 1..104 over 1995Q1..2020Q4. ---
#
# CAREFUL: the paper's T_0 is the treatment PERIOD; the number of pre-treatment
# periods is one less. For the 2016Q3 specification the treatment period is
# t = 87 and the number of pre-periods is T0 = 86. Every off-by-one bug in this
# literature lives in that sentence.
T0 = 86                                    # pre-treatment quarters, through 2016Q2
T_2018Q4, T_2019Q4 = 96, 100
EVAL = {"2018Q4": T_2018Q4, "2019Q4": T_2019Q4}
TREATED = "United Kingdom"

rule("0. Setup")
print(f"  python         {sys.version.split()[0]}")
print(f"  mlsynth        {mlsynth.__version__}")
for mod in (np, pd, matplotlib):
    print(f"  {mod.__name__:<14s} {mod.__version__}")
import cvxpy  # noqa: E402
print(f"  cvxpy          {cvxpy.__version__}")
print(f"  seed           {SEED}")
print(f"  FORCE_REFIT    {FORCE_REFIT}")
print(f"  estimators exported by mlsynth: {len(mlsynth.__all__)}")

# ══════════════════════════════════════════════════════════════════════════════
# 1. THE DATA
# ══════════════════════════════════════════════════════════════════════════════

rule("1. The data")

URL = ("https://raw.githubusercontent.com/cmg777/starter-academic-v501/"
       "master/content/post/python_sc_dsc_sdid/brexit_analysis.csv")
try:
    panel = pd.read_csv("brexit_analysis.csv")
except FileNotFoundError:
    panel = pd.read_csv(URL)

COVARIATES = ["cons_share", "inv_share", "exp_share", "imp_share",
              "labprod_growth", "emp_pop"]

# Y is [time x country]: 104 quarters by 24 countries. mlsynth never sees this
# wide matrix — it wants long format — but we keep it for the few places where
# we reuse mlsynth's returned weights to build a series by hand.
Y = panel.pivot(index="t", columns="country", values="log_rgdp").sort_index()
DONORS = [c for c in Y.columns if c != TREATED]
QLAB = (panel[panel.country == TREATED].sort_values("t")["quarter_label"]
        .to_numpy())
QDEC = (panel[panel.country == TREATED].sort_values("t")["date_dec"].to_numpy())

print(f"  panel          {panel.shape[0]} rows x {panel.shape[1]} columns")
print(f"  countries      {panel.country.nunique()}  ({len(DONORS)} donors)")
print(f"  quarters       {QLAB[0]} to {QLAB[-1]}  (t = 1..{len(QLAB)})")
print(f"  treated unit   {TREATED}")
print(f"  pre-periods    T0 = {T0}  (last pre-treatment quarter {QLAB[T0 - 1]})")
print(f"  evaluated at   {', '.join(f'{k} (t={v})' for k, v in EVAL.items())}")
print(f"  missing values {int(panel.isna().sum().sum())}")


# ══════════════════════════════════════════════════════════════════════════════
# 2. THE TRICK, AND THE CONFIG BUILDER
#
# Every mlsynth estimator reports an ATT averaged over ALL post-treatment
# periods. We want the shortfall at two specific quarters. So keep the 86
# pre-treatment quarters PLUS the single quarter of interest, renumber time so
# it runs 1..87, and the average over "all post periods" becomes an average
# over one period. The bare .fit() then returns exactly the number we want.
# ══════════════════════════════════════════════════════════════════════════════


def window(post, pre: int = T0) -> pd.DataFrame:
    """`pre` pre-treatment quarters + the given post quarter(s), renumbered."""
    post = [post] if np.isscalar(post) else list(post)
    sub = panel[(panel.t <= pre) | (panel.t.isin(post))].copy()
    sub["tt"] = sub.groupby("country")["t"].rank(method="dense").astype(int)
    sub["treat"] = ((sub.country == TREATED) & (sub.tt > pre)).astype(int)
    return sub


def cfg(post, pre: int = T0, **extra) -> dict:
    """The five fields every mlsynth estimator wants, plus estimator-specific ones."""
    return dict(
        df=window(post, pre),
        outcome="log_rgdp",
        treat="treat",
        unitid="country",
        time="tt",
        display_graphs=False,
        **extra,
    )


def pct(att: float) -> float:
    """mlsynth reports treated minus counterfactual. Flip into a % GDP shortfall."""
    return -100.0 * att


def tssc_att(res, variant: str = "MSCa", n_post: int = 1) -> float:
    """Full-precision ATT for a TSSC variant.

    TSSC rounds its scalar summaries — `variant.att` comes back as exactly
    -0.03 and `rmse_pre` as exactly 0.006 — but the `gap` and `counterfactual`
    SERIES are full precision. Averaging the post-treatment gap recovers the
    unrounded ATT, which is the difference between reporting 3.00 and 2.99.
    """
    gap = np.asarray(res.variants[variant].gap, float).ravel()
    return float(gap[-n_post:].mean())


# The tidy results ledger every section appends to.
LADDER: list[dict] = []


def add(stage: str, command: str, q18: float, q19: float, se=None,
        inference: str = "--", published=None, note: str = "") -> None:
    LADDER.append(dict(method=stage, command=command, loss_2018Q4=q18,
                       loss_2019Q4=q19, se_2018Q4=se, inference=inference,
                       published_2018Q4=published, note=note))
    tail = f"   SE {se:5.2f}" if se is not None else ""
    print(f"  {stage:<11s} {command:<40s} 2018Q4 {q18:5.2f}   2019Q4 {q19:5.2f}{tail}")
    if note:
        print(f"  {'':<11s} {note}")


# ══════════════════════════════════════════════════════════════════════════════
# 3. THE mlsynth SURFACE: what the config accepts and what .fit() returns
# ══════════════════════════════════════════════════════════════════════════════

rule("3. The mlsynth surface")

demo = VanillaSC(cfg(T_2018Q4, inference=False)).fit()
print(f"  type(result)                  {type(demo).__name__}")
print(f"  result.att                    {demo.att:+.6f}")
print(f"  result.pre_rmse               {demo.pre_rmse:.6f}")
print(f"  result.fit_diagnostics.r_squared_pre  {demo.fit_diagnostics.r_squared_pre:.6f}")
print(f"  result.method_details.method_name     {demo.method_details.method_name}")
print(f"  len(result.donor_weights)     {len(demo.donor_weights)}")
print(f"  result.counterfactual.shape   {np.shape(demo.counterfactual)}")
print(f"  result.gap.shape              {np.shape(demo.gap)}")
print(f"  weights.summary_stats         {list(demo.weights.summary_stats)}")

# Pydantic validation: extra='forbid' means a typo raises rather than being
# silently ignored. This is the single most useful property of the config API.
print("\n  Config validation (extra='forbid'):")
for bad, why in [
    (dict(cfg(T_2018Q4), backendd="outcome-only"), "misspelled keyword"),
    (dict(cfg(T_2018Q4), outcome="gdp_log"), "column not in the DataFrame"),
]:
    try:
        VanillaSC(bad).fit()
    except (MlsynthConfigError, MlsynthDataError) as exc:
        first = str(exc).strip().splitlines()[0][:88]
        print(f"    {why:<28s} -> {type(exc).__name__}: {first}")


# ══════════════════════════════════════════════════════════════════════════════
# 4. FIGURE 01 — what the data look like before we assume anything
# ══════════════════════════════════════════════════════════════════════════════

rule("4. The raw paths")

fig, ax = plt.subplots()
for c in DONORS:
    ax.plot(QDEC, Y[c], color=GREY_DONOR, lw=0.8, alpha=0.75)
ax.plot(QDEC, Y[TREATED], color=ORANGE, lw=2.4, label=TREATED, zorder=5)
ax.axvline(QDEC[T0], color=LIGHT_TEXT, ls="--", lw=1.0)
ax.annotate("referendum\n2016Q3", xy=(QDEC[T0], Y[TREATED].min() + 0.05),
            color=LIGHT_TEXT, fontsize=9, ha="right")
ax.plot([], [], color=GREY_DONOR, lw=1.2, label="23 OECD donors")
ax.set_title("Twenty-four OECD economies, 1995Q1–2020Q4")
ax.set_xlabel("year")
ax.set_ylabel("log real GDP")
ax.legend(loc="upper left")
caption(fig, "The UK is one line among twenty-four. Nothing in this picture "
             "tells you what would have happened without the referendum — that "
             "is the whole problem, and every stage of the ladder is a different "
             "answer to it.")
save_fig(fig, "01_gdp_paths", w=9.5, h=6)

print(f"  UK log real GDP {QLAB[0]}: {Y[TREATED].iloc[0]:.4f}"
      f"   {QLAB[-1]}: {Y[TREATED].iloc[-1]:.4f}")


# ══════════════════════════════════════════════════════════════════════════════
# 5. STAGE 0 — DiD
#
# mlsynth has no standalone DiD class. FDID (Forward DiD, Li 2024) fits the
# plain two-way estimator alongside its own and exposes it as `.did`. The
# uniform 1/23 donor weights are the giveaway that nothing was fitted.
# ══════════════════════════════════════════════════════════════════════════════

rule("5. Stage 0 — DiD, via FDID(...).fit().did")

fdid_res = {k: FDID(cfg(e)).fit() for k, e in EVAL.items()}
did = {k: r.did for k, r in fdid_res.items()}
add("DiD", "FDID(...).fit().did",
    pct(did["2018Q4"].att), pct(did["2019Q4"].att),
    se=100 * did["2018Q4"].att_se, inference="analytic (FDID)")

wd = did["2018Q4"].donor_weights
print(f"  DiD donor weights: {len(wd)} donors, all equal to "
      f"{next(iter(wd.values())):.6f} = 1/{len(wd)}")
print(f"  DiD pre-treatment RMSE {did['2018Q4'].pre_rmse:.5f}, "
      f"R^2 {did['2018Q4'].r_squared:.4f}")

# Free bonus stage: FDID itself. Forward selection picks a handful of donors and
# then runs DiD on them. It is not on the paper's ladder, but you get it in the
# same call and it is worth reporting.
f18, f19 = fdid_res["2018Q4"].fdid, fdid_res["2019Q4"].fdid
print(f"  Forward DiD selects {len(f18.selected_names)} donors: "
      f"{', '.join(f18.selected_names)}")
print(f"  Forward DiD          2018Q4 {pct(f18.att):5.2f}   2019Q4 {pct(f19.att):5.2f}"
      f"   (pre-RMSE {f18.pre_rmse:.5f} vs DiD's {did['2018Q4'].pre_rmse:.5f})")
FDID_ROW = dict(method="FDID (bonus)", loss_2018Q4=pct(f18.att),
                loss_2019Q4=pct(f19.att), pre_rmse=f18.pre_rmse,
                n_donors=len(f18.selected_names),
                selected=", ".join(f18.selected_names))


# ══════════════════════════════════════════════════════════════════════════════
# 6. STAGE 1 — SC, and the backend question
# ══════════════════════════════════════════════════════════════════════════════

rule("6. Stage 1 — SC, via VanillaSC")

sc = {k: VanillaSC(cfg(e, inference=False)).fit() for k, e in EVAL.items()}
add("SC", "VanillaSC(...)", pct(sc["2018Q4"].att), pct(sc["2019Q4"].att),
    inference="in-space placebo", published=3.06,
    note="3.04, not R's 3.06 — see the solver section")

s18 = sc["2018Q4"]
print(f"  backend chosen by 'auto': {s18.method_details.method_name}")
print(f"  pre-treatment RMSE {s18.pre_rmse:.6f}   R^2 {s18.fit_diagnostics.r_squared_pre:.5f}")
ss = s18.weights.summary_stats
print(f"  weights: {ss['n_nonzero']} of {ss['n_donors']} nonzero, "
      f"sum {ss['sum_of_weights']:.6f}, {ss['constraint']}")
top = sorted(s18.donor_weights.items(), key=lambda kv: -kv[1])
print("  donors above 0.01:")
for c, w in top:
    if w > 0.01:
        print(f"      {c:<16s} {w:.4f}")

# --- The solver ladder: same estimator, different engines -------------------
# VanillaSC's backend and TSSC's method="SC" solve the same convex problem with
# different machinery, and R's synthdid solves it with Frank-Wolfe on a capped
# iteration budget. The published 3.06 is partly a record of where an optimiser
# stopped.
rule("6a. One estimator, several solvers")

solver_rows = []
for label, klass, kw in [
    ("VanillaSC, backend='auto'", VanillaSC, dict(inference=False)),
    ("VanillaSC, backend='outcome-only'", VanillaSC,
     dict(backend="outcome-only", inference=False)),
    ("VanillaSC, w_constr='simplex'", VanillaSC,
     dict(w_constr="simplex", inference=False)),
    ("TSSC, method='SC'", TSSC, dict(method="SC", inference=False)),
]:
    vals, rmse = [], None
    for e in EVAL.values():
        r = klass(cfg(e, **kw)).fit()
        # TSSC rounds .att; read the unrounded value off its gap series.
        vals.append(pct(tssc_att(r, "SC") if klass is TSSC else r.effects.att))
        rmse = r.fit_diagnostics.rmse_pre if r.fit_diagnostics else rmse
    solver_rows.append(dict(solver=label, loss_2018Q4=vals[0],
                            loss_2019Q4=vals[1], rmse_pre=rmse))
    print(f"  {label:<36s} 2018Q4 {vals[0]:5.3f}   2019Q4 {vals[1]:5.3f}"
          + (f"   pre-RMSE {rmse:.6f}" if rmse is not None else ""))

solver_rows.append(dict(solver="R synthdid (Frank-Wolfe, published)",
                        loss_2018Q4=3.06, loss_2019Q4=4.20, rmse_pre=np.nan))
print(f"  {'R synthdid (Frank-Wolfe, published)':<36s} 2018Q4 3.060   2019Q4 4.200")
solver_df = pd.DataFrame(solver_rows)
write_tab(solver_df, "solver_comparison")

fig, ax = plt.subplots()
sd = solver_df.iloc[::-1].reset_index(drop=True)
cols = [ORANGE if "synthdid" in s else STEEL for s in sd.solver]
ax.barh(sd.solver, sd.loss_2018Q4, color=cols, height=0.6)
for i, v in enumerate(sd.loss_2018Q4):
    ax.text(v + 0.008, i, f"{v:.3f}", va="center", color=LIGHTER_TEXT, fontsize=10)
ax.set_xlim(2.9, 3.15)
ax.set_xlabel("UK GDP shortfall at 2018Q4 (%)")
ax.set_title("The same estimator, four solvers")
caption(fig, "Every bar is plain synthetic control on identical data. The three "
             "convex solvers agree to three decimals at 3.039; R's Frank-Wolfe "
             "on a capped iteration budget stops at 3.06. The gap is the "
             "optimiser, not the estimator.")
save_fig(fig, "03_solver_comparison", w=9.5, h=4.6)


# --- Figure 02: what mlsynth draws for you, unstyled ------------------------
# Every effect result carries .plot(). This is the package's own output with no
# styling from us at all — the point being that you get a publishable figure
# from a five-field config and one method call.
rule("6b. mlsynth's own plotting")

with plt.rc_context(matplotlib.rcParamsDefault):
    fig_native, axes = plt.subplots(1, 2, figsize=(11, 4.2))
    native = VanillaSC(cfg(T_2018Q4, inference=False)).fit()
    # display=False: .plot() ends in `if pc.display: plt.show()` and the result's
    # plot_config is None, so display_graphs=False never reaches it. Harmless under
    # Agg, but it blanks the second panel in a notebook. Kept explicit so the script
    # and the notebook agree.
    native.plot(kind="counterfactual", ax=axes[0], display=False)
    native.plot(kind="gap", ax=axes[1], display=False)
    fig_native.suptitle("mlsynth's built-in plots: result.plot(kind=...)",
                        fontsize=13, fontweight="bold")
    fig_native.tight_layout()
    fig_native.savefig(f"{SLUG}_02_mlsynth_native_plot.png", dpi=300,
                       bbox_inches="tight", facecolor="white")
    plt.close(fig_native)
print(f"  [figure] {SLUG}_02_mlsynth_native_plot.png  (package defaults, light theme)")

# The same result, restyled through PlotConfig rather than through matplotlib.
pc = dict(observed_color=ORANGE, counterfactual_colors=[STEEL],
          counterfactual_linestyle="--", intervention_color=MUTED,
          xlabel="quarter index (renumbered 1..87)", ylabel="log real GDP",
          title="VanillaSC via PlotConfig", display=False)
print(f"  PlotConfig fields set: {', '.join(sorted(pc))}")


# --- Figure 04: the fit and the gap, on the full panel ----------------------
# The windowed fits above answer "how big is the shortfall at 2018Q4". To draw
# the whole counterfactual path we fit once on the untruncated panel.
rule("6c. The counterfactual path")

full = cfg(list(range(T0 + 1, len(QLAB) + 1)))
sc_full = VanillaSC(dict(full, inference=False)).fit()
cf_sc = np.asarray(sc_full.counterfactual, float).ravel()
gap_sc = np.asarray(sc_full.gap, float).ravel()

fig, (a1, a2) = plt.subplots(2, 1, sharex=True, gridspec_kw=dict(height_ratios=[2, 1]))
a1.plot(QDEC, Y[TREATED], color=ORANGE, lw=2.2, label="United Kingdom")
a1.plot(QDEC, cf_sc, color=STEEL, lw=2.0, ls="--", label="synthetic UK")
a1.axvline(QDEC[T0], color=LIGHT_TEXT, ls="--", lw=1.0)
a1.set_ylabel("log real GDP")
a1.set_title("Synthetic control: eighty-six quarters of agreement, then a gap")
a1.legend(loc="upper left")
a2.axhline(0, color=MUTED, lw=0.8)
a2.plot(QDEC, gap_sc, color=STEEL, lw=1.8)
a2.fill_between(QDEC[T0:], gap_sc[T0:], 0, color=ORANGE, alpha=0.30)
a2.axvline(QDEC[T0], color=LIGHT_TEXT, ls="--", lw=1.0)
a2.set_ylabel("gap (log points)")
a2.set_xlabel("year")
caption(fig, "Top: the UK against the blend mlsynth fitted on the pre-treatment "
             "path alone. Bottom: the difference, which hovers around zero for "
             "two decades and then turns persistently negative.")
save_fig(fig, "04_sc_fit_gap", w=9.5, h=7)

print(f"  full-panel SC: pre-RMSE {sc_full.pre_rmse:.6f}, "
      f"mean post gap {gap_sc[T0:].mean():+.5f} log points")


# ══════════════════════════════════════════════════════════════════════════════
# 7. STAGE 2 — DSC, via TSSC(method="MSCa")
# ══════════════════════════════════════════════════════════════════════════════

rule("7. Stage 2 — DSC, via TSSC(method='MSCa')")

dsc = {k: TSSC(cfg(e, method="MSCa", inference=False)).fit() for k, e in EVAL.items()}
add("DSC", 'TSSC(..., method="MSCa")',
    pct(tssc_att(dsc["2018Q4"])), pct(tssc_att(dsc["2019Q4"])),
    inference="none (disabled)", published=2.98)

d18 = dsc["2018Q4"].variants["MSCa"]
print(f"  MSCa intercept (the bias adjustment): {d18.intercept:+.6f} log points"
      f"  = {100 * d18.intercept:+.3f}% of GDP")
print(f"  MSCa pre-RMSE {d18.rmse_pre:.6f} vs SC's {s18.pre_rmse:.6f}")

# A precision trap. TSSC rounds every scalar it reports — .att comes back as
# exactly -0.03 and .rmse_pre as exactly 0.006 — while .gap and
# .counterfactual keep full precision. Take the headline number off the
# rounded field and DSC reads 3.00; take it off the gap and it reads 2.99,
# which is what the package's own replication table says.
print(f"  variants['MSCa'].att (rounded)     {d18.att!r}  -> {pct(d18.att):.4f}%")
print(f"  gap[-1] (full precision)           {np.asarray(d18.gap, float)[-1]!r}"
      f"  -> {pct(tssc_att(dsc['2018Q4'])):.4f}%")
print(f"  variants['MSCa'].rmse_pre (rounded){d18.rmse_pre!r}")

# The four variants and the Step-1 selection. Left to itself TSSC fits all four
# and runs subsampling tests to choose; `method=` forces one and skips both.
rule("7a. The four TSSC variants and the Step-1 selection")

t_all = cache("tssc_all_variants",
              lambda: TSSC(cfg(T_2018Q4, draws=500, seed=SEED)).fit())
print(f"  TSSC recommends: {t_all.recommended_method}")
tssc_rows = []
for m in ("SC", "MSCa", "MSCb", "MSCc"):
    v = t_all.variants[m]
    ic = "none" if v.intercept is None else f"{v.intercept:+.5f}"
    exact = tssc_att(t_all, m)
    print(f"    {m:<5s}  ATT {exact:+.6f}   loss {pct(exact):5.3f}%   "
          f"(.att reports {v.att:+.5f})   intercept {ic}")
    tssc_rows.append(dict(variant=m, att=exact, att_as_reported=v.att,
                          loss_2018Q4=pct(exact), rmse_pre=v.rmse_pre,
                          intercept=v.intercept,
                          recommended=(m == t_all.recommended_method)))
write_tab(pd.DataFrame(tssc_rows), "tssc_variants")

if t_all.selection is not None:
    print("  Step-1 restriction tests:")
    for name, test in t_all.selection.tests.items():
        print(f"    {name:<22s} stat {test.statistic:+.5f}   "
              f"CI [{test.ci_lower:+.5f}, {test.ci_upper:+.5f}]   "
              f"rejected {test.rejected}")

# The cost of the convenience: fitting four variants with 500 subsampling draws
# is two orders of magnitude slower than forcing one.
t0 = time.time(); TSSC(cfg(T_2018Q4, method="MSCa", inference=False)).fit()
t_forced = time.time() - t0
print(f"  TSSC(method='MSCa', inference=False): {t_forced:.2f}s per fit")

# --- Figure 05: where the intercept goes -----------------------------------
dsc_full = TSSC(dict(full, method="MSCa", inference=False)).fit()
cf_dsc = np.asarray(dsc_full.variants["MSCa"].counterfactual, float).ravel()
mask = QDEC >= 2010
fig, ax = plt.subplots()
ax.plot(QDEC[mask], Y[TREATED].to_numpy()[mask], color=ORANGE, lw=2.2, label="United Kingdom")
ax.plot(QDEC[mask], cf_sc[mask], color=STEEL, lw=1.9, ls="--", label="SC")
ax.plot(QDEC[mask], cf_dsc[mask], color=TEAL, lw=1.9, ls="-.", label="DSC (MSCa)")
ax.axvline(QDEC[T0], color=LIGHT_TEXT, ls="--", lw=1.0)
ax.annotate(f"MSCa intercept {d18.intercept:+.4f} log points",
            xy=(2011, cf_dsc[mask][4]), color=TEAL, fontsize=9.5)
ax.set_xlabel("year"); ax.set_ylabel("log real GDP")
ax.set_title("Demeaned SC lets the blend sit at its own level")
ax.legend(loc="upper left")
caption(fig, "DSC adds one free parameter: a constant offset, estimated as the "
             "average pre-treatment gap. Here it is worth about a quarter of "
             "one per cent of GDP, which is why DSC and SC land so close "
             "together.")
save_fig(fig, "05_dsc_offset", w=9.5, h=5.6)


# ══════════════════════════════════════════════════════════════════════════════
# 8. STAGE 3 — SDID
# ══════════════════════════════════════════════════════════════════════════════

rule("8. Stage 3 — SDID")

sdid = {k: SDID(cfg(e, zeta=0.0, vce="placebo", B=500, seed=SEED)).fit()
        for k, e in EVAL.items()}
add("SDID", "SDID(..., zeta=0.0)",
    pct(sdid["2018Q4"].effects.att), pct(sdid["2019Q4"].effects.att),
    se=100 * abs(sdid["2018Q4"].inference_detail.se), inference="placebo (B=500)",
    published=2.79)

# The zeta trap: every package in every language penalises the unit weights by
# default; the paper solves the unpenalised problem.
zeta_default = SDID(cfg(T_2018Q4, vce="noinference")).fit()
print(f"  zeta left at its default: {pct(zeta_default.effects.att):.2f}%  "
      f"(against {pct(sdid['2018Q4'].effects.att):.2f}% at zeta=0)")
print("  Same trap as synthdid's zeta.omega in R and sdid's zeta_omega() in Stata.")

# intercept_adjust is a no-op here, and it is worth saying why.
ia = SDID(cfg(T_2018Q4, zeta=0.0, intercept_adjust=True, vce="noinference")).fit()
print(f"  intercept_adjust=True:    {pct(ia.effects.att):.4f}%  "
      f"(identical — with one post period there is nothing to adjust)")

coh = list(sdid["2018Q4"].cohorts.values())[0]
lam = np.asarray(coh.time_weights, float)
omega = np.asarray(coh.unit_weights, float)
print(f"  cohorts: {list(sdid['2018Q4'].cohorts)}  "
      f"(one adoption period, n_treated={coh.n_treated}, n_post={coh.n_post})")
print(f"  lambda: {len(lam)} weights summing to {lam.sum():.6f}; "
      f"{int((lam > 1e-4).sum())} above 1e-4")
print(f"  omega:  {len(omega)} weights summing to {omega.sum():.6f}")

inf18 = sdid["2018Q4"].inference_detail
print(f"  inference: ATT {inf18.att:+.5f}, SE {inf18.se:.5f}, "
      f"CI [{inf18.ci[0]:+.5f}, {inf18.ci[1]:+.5f}], p = {inf18.p_value:.4f}, "
      f"method '{inf18.method}', n_placebo {inf18.n_placebo}")


# --- The three flavours, rebuilt from mlsynth's own omega and lambda ---------
#
# The time weights have to be fitted against SOMETHING in the post period, and
# there are three natural choices. Only variant (iii) falls out of a bare
# .fit(); the other two need the weights the result already hands you.
#
#   ATT_t = (y_UK,t - sum_j w_j y_j,t) - sum_s lambda_s (y_UK,s - sum_j w_j y_j,s)
rule("8a. Three flavours of SDID")


def sdid_weights(post, pre: int = T0):
    """Fit SDID on a given post window and return (omega dict, lambda array)."""
    res = SDID(cfg(post, pre, zeta=0.0, vce="noinference")).fit()
    cohort = list(res.cohorts.values())[0]
    return res.donor_weights, np.asarray(cohort.time_weights, float)


def sdid_loss(w: dict, lam: np.ndarray, t: int, pre: int = T0) -> float:
    """Apply an (omega, lambda) pair at an arbitrary quarter."""
    wv = np.array([w[c] for c in DONORS])
    gap = lambda s: float(Y.loc[s, TREATED] - Y.loc[s, DONORS].to_numpy() @ wv)
    bias = float(sum(lam[s - 1] * gap(s) for s in range(1, pre + 1)))
    return -100.0 * (gap(t) - bias)


w_i, lam_i = sdid_weights(T0 + 1)                              # (i)   treatment quarter
w_ii8, lam_ii8 = sdid_weights(range(T0 + 1, T_2018Q4 + 1))     # (ii)  post-block average
w_ii9, lam_ii9 = sdid_weights(range(T0 + 1, T_2019Q4 + 1))
w_iii8, lam_iii8 = sdid_weights(T_2018Q4)                      # (iii) evaluation quarter
w_iii9, lam_iii9 = sdid_weights(T_2019Q4)

variants = {
    "SDID (i)": (sdid_loss(w_i, lam_i, T_2018Q4), sdid_loss(w_i, lam_i, T_2019Q4),
                 "lambda fitted on the treatment quarter", 2.76),
    "SDID (ii)": (sdid_loss(w_ii8, lam_ii8, T_2018Q4), sdid_loss(w_ii9, lam_ii9, T_2019Q4),
                  "lambda fitted on the post-period average", 2.79),
    "SDID (iii)": (sdid_loss(w_iii8, lam_iii8, T_2018Q4), sdid_loss(w_iii9, lam_iii9, T_2019Q4),
                   "lambda fitted on the evaluation quarter", 2.79),
}
for name, (q18, q19, why, pub) in variants.items():
    print(f"  {name:<11s} 2018Q4 {q18:5.3f}   2019Q4 {q19:5.3f}   ({why}; paper {pub})")
write_tab(pd.DataFrame([dict(variant=k, loss_2018Q4=v[0], loss_2019Q4=v[1],
                             lambda_fitted_on=v[2], published_2018Q4=v[3])
                        for k, v in variants.items()]), "sdid_variants")

spread = max(v[0] for v in variants.values()) - min(v[0] for v in variants.values())
print(f"  spread across the three flavours at 2018Q4: {spread:.3f} percentage points")

nz = np.where(lam_i > 1e-4)[0]
print("  lambda(i), weights above 1e-4:")
for i in nz:
    print(f"      {QLAB[i]:<8s} {lam_i[i]:.4f}")

# --- Figure 06: the time weights -------------------------------------------
fig, ax = plt.subplots()
ax.axhline(1 / T0, color=GOLD, ls=(0, (2, 2)), lw=1.0)
ax.annotate("uniform: the two-way fixed-effects correction", xy=(1996, 1 / T0),
            color=GOLD, fontsize=9, va="bottom")
ax.vlines(QDEC[:T0], 0, lam_i, color=STEEL, lw=0.8)
ax.plot(QDEC[:T0], lam_i, "o", color=STEEL, ms=3.4)
big = lam_i > 0.02
ax.plot(QDEC[:T0][big], lam_i[big], "o", color=ORANGE, ms=8)
for i in np.where(big)[0]:
    # The dominant weight is labelled to its left; the small ones sit above the
    # point so they clear the dashed uniform-weight reference line.
    left = lam_i[i] > 0.5
    ax.annotate(f"{QLAB[i]}: {lam_i[i]:.3f}", xy=(QDEC[i], lam_i[i]),
                xytext=(-12, -4) if left else (0, 12),
                textcoords="offset points", color=ORANGE, fontsize=9.5,
                ha="right" if left else "center")
ax.set_ylim(-0.03, 1.08)
ax.set_xlabel("year"); ax.set_ylabel(r"time weight $\lambda_s$")
ax.set_title("SDID's time weights collapse onto the last pre-treatment quarter")
caption(fig, "Read off mlsynth's result.cohorts[a].time_weights. Difference-in-"
             "differences would place the dashed uniform weight on all eighty-"
             "six quarters. SDID puts almost everything on one, which is what a "
             "near-random-walk outcome invites.")
save_fig(fig, "06_sdid_time_weights", w=9.5, h=5.4)

lam_tab = pd.DataFrame({"quarter": QLAB[:T0], "t": np.arange(1, T0 + 1),
                        "lambda_i": lam_i.round(6),
                        "lambda_ii": lam_ii8.round(6),
                        "lambda_iii": lam_iii8.round(6)})
write_tab(lam_tab, "sdid_time_weights")

# --- Figure 07: the event study, which the R post has no equivalent of ------
rule("8b. The event study")

sdid_full = SDID(dict(full, zeta=0.0, vce="placebo", B=200, seed=SEED)).fit()
es = sdid_full.event_study
et = np.asarray(es.event_times, float)
tau = np.asarray(es.tau, float)
ci = np.asarray(es.ci, float)
keep = (et >= -20) & (et <= 18)
fig, ax = plt.subplots()
ax.axhline(0, color=MUTED, lw=0.8)
ax.axvline(0, color=LIGHT_TEXT, ls="--", lw=1.0)
ax.fill_between(et[keep], ci[keep, 0], ci[keep, 1], color=STEEL, alpha=0.22,
                label="95% placebo CI")
ax.plot(et[keep], tau[keep], "o-", color=ORANGE, lw=1.7, ms=4, label=r"$\tau_\ell$")
ax.set_xlabel("quarters since the referendum")
ax.set_ylabel("effect on log real GDP")
ax.set_title("SDID event study, straight from result.event_study")
ax.legend(loc="lower left")
caption(fig, "mlsynth aggregates the Ciccia (2024) event-study estimator "
             "alongside the headline ATT. The pre-treatment path sits on zero, "
             "which is the falsification test the single ATT number cannot "
             "give you.")
save_fig(fig, "07_sdid_event_study", w=9.5, h=5.4)

post_es = et > 0
print(f"  event times {et.min():.0f}..{et.max():.0f}; "
      f"post-treatment tau mean {tau[post_es].mean():+.5f}")
print(f"  pre-treatment tau mean {tau[(et < 0) & (et >= -20)].mean():+.5f} "
      f"(should sit near zero)")
write_tab(pd.DataFrame({"event_time": et, "tau": tau,
                        "ci_lower": ci[:, 0], "ci_upper": ci[:, 1]}),
          "sdid_event_study")


# ══════════════════════════════════════════════════════════════════════════════
# 9. STAGE 4 — MASC
# ══════════════════════════════════════════════════════════════════════════════

rule("9. Stage 4 — MASC")

M_GRID = list(range(1, 11))
SET_F = list(range(6, T0 + 1))
masc = {k: MASC(cfg(e, m_grid=M_GRID, set_f=SET_F)).fit() for k, e in EVAL.items()}
add("MASC", "MASC(..., set_f=range(6, 87))",
    pct(masc["2018Q4"].att), pct(masc["2019Q4"].att),
    inference="none in package", published=2.73)

m18 = masc["2018Q4"]
# MASC's two tuned dials are not in method_details.parameters_used (which is
# None here) — they live in weights.summary_stats as m_hat and phi_hat.
mstats = m18.weights.summary_stats or {}
M_HAT, PHI_HAT = mstats.get("m_hat"), mstats.get("phi_hat")
print(f"  weights.summary_stats: {mstats}")
print(f"  cross-validation picked m = {M_HAT} neighbours and phi = {PHI_HAT:.5f}")
print(f"  -> the estimate is {PHI_HAT:.3f} x matching + {1 - PHI_HAT:.3f} x synthetic control")
print(f"  pre-RMSE {m18.pre_rmse:.6f} vs SC's {s18.pre_rmse:.6f}")

# The fold set decides the answer. Left to its default MASC cross-validates on
# a different fold set and lands on a different blend.
rule("9a. set_f versus min_preperiods")

masc_variants = []
for label, kw in [
    ("set_f=range(6, 87)  [the paper]", dict(m_grid=M_GRID, set_f=SET_F)),
    ("min_preperiods=None [default]", dict(m_grid=M_GRID)),
    ("min_preperiods=43   [ceil(T0/2)]", dict(m_grid=M_GRID, min_preperiods=43)),
]:
    vals = [pct(MASC(cfg(e, **kw)).fit().att) for e in EVAL.values()]
    masc_variants.append(dict(setting=label, loss_2018Q4=vals[0], loss_2019Q4=vals[1]))
    print(f"  {label:<34s} 2018Q4 {vals[0]:5.3f}   2019Q4 {vals[1]:5.3f}")
write_tab(pd.DataFrame(masc_variants), "masc_fold_settings")

# --- Figure 08: the cross-validation, by hand over m ------------------------
# MASC picks m and phi jointly. Refitting with a single-element m_grid traces
# the cross-validation objective the package minimises internally.
rule("9b. Tracing the cross-validation over m")


def masc_by_m():
    rows = []
    for m in M_GRID:
        r = MASC(cfg(T_2018Q4, m_grid=[m], set_f=SET_F)).fit()
        st = r.weights.summary_stats or {}
        rows.append(dict(m=m, loss_2018Q4=pct(r.att), pre_rmse=r.pre_rmse,
                         phi_hat=st.get("phi_hat")))
    return pd.DataFrame(rows)


masc_cv = cache("masc_cv_by_m", masc_by_m)
print(masc_cv.to_string(index=False, float_format=lambda v: f"{v:.5f}"))
write_tab(masc_cv, "masc_cv_table")

fig, ax = plt.subplots()
cols = [ORANGE if m == M_HAT else STEEL for m in masc_cv.m]
ax.bar(masc_cv.m, masc_cv.loss_2018Q4, color=cols, width=0.65)
for _, r in masc_cv.iterrows():
    if pd.notna(r.phi_hat):
        ax.text(r.m, r.loss_2018Q4 + 0.02, f"φ={r.phi_hat:.2f}", ha="center",
                va="bottom", color=LIGHT_TEXT, fontsize=8.5)
ax.axhline(pct(m18.att), color=TEAL, ls="--", lw=1.2)
ax.set_xticks(M_GRID)
ax.set_ylim(2.5, masc_cv.loss_2018Q4.max() + 0.42)
ax.annotate(f"dashed line: cross-validating m and φ jointly lands at "
            f"{pct(m18.att):.2f}%, i.e. m = {M_HAT}",
            xy=(0.5, 0.965), xycoords="axes fraction", color=TEAL,
            fontsize=10, ha="center", va="top")
ax.set_xlabel("m, the number of matched nearest neighbours")
ax.set_ylabel("UK GDP shortfall at 2018Q4 (%)")
ax.set_title("MASC buys the bias trade-off explicitly")
caption(fig, "Each bar refits MASC with the neighbour count forced to a single "
             "value; phi is the weight the cross-validation then puts on "
             "matching rather than on synthetic control. Left free, the "
             f"cross-validation chooses m = {M_HAT} (orange), the extrapolation-"
             "heavy end of the grid.")
save_fig(fig, "08_masc_cv", w=9.5, h=5.2)


# ══════════════════════════════════════════════════════════════════════════════
# 10. STAGE 5 — ASCM
# ══════════════════════════════════════════════════════════════════════════════

rule("10. Stage 5 — ASCM, via VanillaSC(augment='ridge')")

ascm = {k: VanillaSC(cfg(e, augment="ridge", inference=False)).fit()
        for k, e in EVAL.items()}
add("ASCM", 'VanillaSC(..., augment="ridge")',
    pct(ascm["2018Q4"].att), pct(ascm["2019Q4"].att),
    inference="in-space placebo", published=3.04)

a18 = ascm["2018Q4"]
aw = np.array(list(a18.donor_weights.values()))
print(f"  ridge_lambda chosen: "
      f"{(a18.method_details.parameters_used or {}).get('penalized_lambda', 'n/a')}")
print(f"  weights: sum {aw.sum():.5f}, {int((aw < -1e-6).sum())} negative, "
      f"min {aw.min():+.4f}, max {aw.max():+.4f}")
print(f"  pre-RMSE {a18.pre_rmse:.6f} vs SC's {s18.pre_rmse:.6f}")

res_ascm = {k: VanillaSC(cfg(e, augment="ridge", residualize=True, inference=False)).fit()
            for k, e in EVAL.items()}
print(f"  residualize=True (the paper's 'ASCM res.'): "
      f"2018Q4 {pct(res_ascm['2018Q4'].att):5.2f}   "
      f"2019Q4 {pct(res_ascm['2019Q4'].att):5.2f}")


# ══════════════════════════════════════════════════════════════════════════════
# 11. THE WHOLE LADDER, SIDE BY SIDE
# ══════════════════════════════════════════════════════════════════════════════

rule("11. The whole ladder")

ladder = pd.DataFrame(LADDER)
R_COLUMN = {"DiD": 4.98, "SC": 3.06, "DSC": 2.98, "SDID": 2.79,
            "MASC": 2.73, "ASCM": 3.04}
ladder["r_post_2018Q4"] = ladder.method.map(R_COLUMN)
write_tab(ladder, "att_headline")
print(ladder[["method", "command", "loss_2018Q4", "loss_2019Q4",
              "r_post_2018Q4", "published_2018Q4"]]
      .to_string(index=False, float_format=lambda v: f"{v:.2f}"))

BORN = 2.4
print(f"\n  Born et al. (2019) reported {BORN}% for this dataset. "
      f"Every stage here is above it.")

# --- Figure 09: donor weights across methods -------------------------------
wt = pd.DataFrame({
    "DiD": pd.Series(did["2018Q4"].donor_weights),
    "SC": pd.Series(sc["2018Q4"].donor_weights),
    "DSC": pd.Series(dsc["2018Q4"].variants["MSCa"].donor_weights),  # rounded to 4 dp by TSSC
    "SDID": pd.Series(sdid["2018Q4"].donor_weights),
    "MASC": pd.Series(masc["2018Q4"].donor_weights),
    "ASCM": pd.Series(ascm["2018Q4"].donor_weights),
}).reindex(DONORS).fillna(0.0)
write_tab(wt.reset_index().rename(columns={"index": "country"}),
          "donor_weights_by_method")

plot_m = ["SC", "DSC", "SDID", "MASC", "ASCM"]
keep_rows = wt[plot_m].abs().max(axis=1) > 0.004
order = wt.loc[keep_rows, plot_m].abs().max(axis=1).sort_values().index
fig, ax = plt.subplots()
ypos = np.arange(len(order))
hgt = 0.16
ax.axvspan(wt[plot_m].to_numpy().min() - 0.004, 0, color=ORANGE, alpha=0.10, zorder=0)
for i, m in enumerate(plot_m):
    ax.barh(ypos + (i - 2) * hgt, wt.loc[order, m].to_numpy(), height=hgt,
            color=METHOD_COLORS[m], label=m, edgecolor="none", zorder=3)
ax.set_yticks(ypos)
ax.set_yticklabels(order, fontsize=9)
ax.axvline(0, color=LIGHT_TEXT, lw=1.0, zorder=4)
ax.set_xlabel("donor weight")
ax.set_ylim(-0.6, len(order) - 0.4)
ax.set_title("Who is in the blend? Donor weights by method")
ax.legend(ncol=5, loc="lower right", fontsize=9.5)
ax.annotate("negative weights\n(outside the simplex)", xy=(-0.006, len(order) - 1.2),
            color=ORANGE, fontsize=9, ha="center", va="top")
caption(fig, f"DiD is omitted: it gives all twenty-three donors 1/23. Donors "
             f"whose largest weight is under 0.004 are dropped. Only ASCM "
             f"enters the shaded negative region, {int((wt['ASCM'] < -1e-6).sum())} "
             f"times — it is the one stage that relaxes the simplex.")
save_fig(fig, "09_donor_weights", w=9.5, h=7)

n_neg = int((wt[plot_m].to_numpy() < -1e-6).sum())
print(f"  negative weights across SC/DSC/SDID/MASC/ASCM: {n_neg} "
      f"(all from ASCM: {int((wt['ASCM'] < -1e-6).sum())})")

# --- Figure 10: all counterfactuals on the full panel -----------------------
rule("11a. Counterfactual paths on the full panel")


def full_counterfactuals():
    out = {"SC": cf_sc, "DSC": cf_dsc}
    out["MASC"] = np.asarray(
        MASC(dict(full, m_grid=M_GRID, set_f=SET_F)).fit().counterfactual, float).ravel()
    out["ASCM"] = np.asarray(
        VanillaSC(dict(full, augment="ridge", inference=False)).fit().counterfactual,
        float).ravel()
    cohort = list(SDID(dict(full, zeta=0.0, vce="noinference")).fit().cohorts.values())[0]
    out["SDID"] = np.asarray(cohort.counterfactual, float).ravel()
    wv = np.full(len(DONORS), 1 / len(DONORS))
    donor_avg = Y[DONORS].to_numpy() @ wv
    out["DiD"] = donor_avg + (Y[TREATED].to_numpy()[:T0] - donor_avg[:T0]).mean()
    return out


cfs = cache("full_counterfactuals", full_counterfactuals)
for k, v in cfs.items():
    print(f"  {k:<6s} counterfactual length {len(v)}")

mask = QDEC >= 2014
fig, ax = plt.subplots()
ax.plot(QDEC[mask], Y[TREATED].to_numpy()[mask], color=ORANGE, lw=2.8,
        label="United Kingdom", zorder=6)
for m in ["DiD", "SC", "DSC", "SDID", "MASC", "ASCM"]:
    v = np.asarray(cfs[m], float)
    if len(v) == len(QDEC):
        ax.plot(QDEC[mask], v[mask], lw=1.7, ls="--",
                color=METHOD_COLORS[m], label=m)
ax.axvline(QDEC[T0], color=LIGHT_TEXT, ls="--", lw=1.0)
ax.set_xlabel("year"); ax.set_ylabel("log real GDP")
ax.set_title("Six counterfactual United Kingdoms")
ax.legend(ncol=4, fontsize=9, loc="lower left")
caption(fig, "Every dashed line is a version of the UK that did not vote to "
             "leave. They agree closely until 2016 and then fan apart, and the "
             "width of that fan is the honest uncertainty in the headline "
             "number.")
save_fig(fig, "10_all_counterfactuals", w=9.5, h=6)

# --- Figure 11: the ATT dot plot -------------------------------------------
dot = ladder[["method", "loss_2018Q4", "loss_2019Q4"]].copy()
dot = pd.concat([dot, pd.DataFrame([
    dict(method=k, loss_2018Q4=v[0], loss_2019Q4=v[1])
    for k, v in variants.items()])], ignore_index=True)
dot = dot[dot.method != "SDID"].sort_values("loss_2018Q4")
fig, ax = plt.subplots()
ypos = np.arange(len(dot))
ax.axvline(BORN, color=GOLD, ls="--", lw=1.2)
ax.annotate("Born et al. (2019): 2.4%", xy=(BORN, len(dot) - 1.15),
            xytext=(8, 0), textcoords="offset points",
            color=GOLD, fontsize=9.5, ha="left", va="center")
ax.hlines(ypos, dot.loss_2018Q4, dot.loss_2019Q4, color=DARK_PANEL, lw=2)
ax.plot(dot.loss_2018Q4, ypos, "o", color=STEEL, ms=9, label="2018Q4")
ax.plot(dot.loss_2019Q4, ypos, "o", color=ORANGE, ms=9, label="2019Q4")
ax.set_yticks(ypos); ax.set_yticklabels(dot.method)
ax.set_xlabel("UK GDP shortfall (%)")
ax.set_title("Every stage puts the cost above the published 2.4%")
ax.legend(loc="lower right")
caption(fig, "The three SDID flavours are shown separately. The spread across "
             "the whole ladder at 2018Q4 is about two percentage points, and "
             "almost all of it is DiD refusing to fit anything.")
save_fig(fig, "11_att_dotplot", w=9.5, h=5.8)


# ══════════════════════════════════════════════════════════════════════════════
# 12. THE IN-SAMPLE PLACEBO TOURNAMENT
#
# Advance the treatment date to a quarter when nothing happened, build the
# counterfactual on data up to that point only, and compare with what actually
# occurred. The true effect is zero, so every estimate is pure error.
#
# One wrinkle the source paper does not flag: its own scripts grade SC, DSC,
# SDID(i), MASC and ASCM one quarter ahead but SDID(ii) and (iii) FOUR quarters
# ahead. Part of the apparent gap is the harder task, not the worse method.
# ══════════════════════════════════════════════════════════════════════════════

rule("12. The in-sample placebo tournament")

K_GRID = list(range(61, 81))       # last pre-treatment quarter, 2010Q1..2014Q4
H_GRID = [1, 4]


def placebo_one(k: int, h: int) -> dict:
    """Every stage refit as if the treatment had happened at quarter k+1."""
    e = k + h
    row = {"k": k, "last_pre": QLAB[k - 1], "horizon": h}
    row["SC"] = VanillaSC(cfg(e, pre=k, inference=False)).fit().effects.att
    row["DSC"] = tssc_att(TSSC(cfg(e, pre=k, method="MSCa", inference=False)).fit())
    w1, l1 = sdid_weights(k + 1, pre=k)
    w2, l2 = sdid_weights(range(k + 1, k + 5), pre=k)
    w3, l3 = sdid_weights(k + 4, pre=k)
    row["SDID (i)"] = -sdid_loss(w1, l1, e, pre=k) / 100.0
    row["SDID (ii)"] = -sdid_loss(w2, l2, e, pre=k) / 100.0
    row["SDID (iii)"] = -sdid_loss(w3, l3, e, pre=k) / 100.0
    row["MASC"] = MASC(cfg(e, pre=k, m_grid=M_GRID,
                           set_f=list(range(6, k + 1)))).fit().effects.att
    row["ASCM"] = VanillaSC(cfg(e, pre=k, augment="ridge",
                                inference=False)).fit().effects.att
    return row


def run_placebo() -> pd.DataFrame:
    rows = []
    for h in H_GRID:
        for k in K_GRID:
            rows.append(placebo_one(k, h))
            print(f"    placebo k={k} ({QLAB[k - 1]}) h={h}", flush=True)
    return pd.DataFrame(rows)


placebo = cache("placebo_insample", run_placebo)
write_tab(placebo, "placebo_insample_errors")

METHODS7 = ["SC", "DSC", "SDID (i)", "SDID (ii)", "SDID (iii)", "MASC", "ASCM"]


def summarise(df: pd.DataFrame) -> pd.DataFrame:
    return pd.DataFrame([
        dict(method=m,
             RMSE=float(np.sqrt(np.mean(df[m].to_numpy() ** 2))),
             MAB=float(np.mean(np.abs(df[m].to_numpy()))),
             MedAB=float(np.median(np.abs(df[m].to_numpy()))))
        for m in METHODS7])


pl_h1 = summarise(placebo[placebo.horizon == 1])
pl_h4 = summarise(placebo[placebo.horizon == 4])
print("\n  Horizon h = 1 quarter")
print(pl_h1.to_string(index=False, float_format=lambda v: f"{v:.4f}"))
print("\n  Horizon h = 4 quarters")
print(pl_h4.to_string(index=False, float_format=lambda v: f"{v:.4f}"))
write_tab(pl_h1.assign(horizon=1), "placebo_h1_summary")
write_tab(pl_h4.assign(horizon=4), "placebo_h4_summary")

# The paper's own Table 7 mixes the two horizons.
PUBLISHED_RMSE = {"SC": 0.0089, "DSC": 0.0087, "SDID (i)": 0.0067,
                  "MASC": 0.0080, "ASCM": 0.0086,
                  "SDID (ii)": 0.0134, "SDID (iii)": 0.0134}
mixed = pd.concat([
    pl_h1[~pl_h1.method.isin(["SDID (ii)", "SDID (iii)"])].assign(horizon=1),
    pl_h4[pl_h4.method.isin(["SDID (ii)", "SDID (iii)"])].assign(horizon=4),
], ignore_index=True)
mixed["published_RMSE"] = mixed.method.map(PUBLISHED_RMSE)
print("\n  As the paper reports it (mixed horizons), against the published values")
print(mixed.to_string(index=False, float_format=lambda v: f"{v:.4f}"))
write_tab(mixed, "placebo_insample_summary")

# --- Figure 12 --------------------------------------------------------------
fig, axes = plt.subplots(1, 2, sharey=True)
for ax, h, lab in zip(axes, H_GRID, ["graded 1 quarter ahead",
                                     "graded 4 quarters ahead"]):
    sub = placebo[placebo.horizon == h]
    for i, m in enumerate(METHODS7):
        errs = sub[m].to_numpy()
        jitter = rng.uniform(-0.16, 0.16, size=len(errs))
        ax.scatter(errs, np.full(len(errs), i) + jitter, s=22, color=STEEL,
                   alpha=0.75, edgecolors="none")
        ax.scatter([np.sqrt(np.mean(errs ** 2))], [i], marker="D", s=70,
                   color=ORANGE, zorder=5)
    ax.axvline(0, color=MUTED, lw=0.8)
    ax.set_title(lab, fontsize=11)
    ax.set_xlabel("placebo error (log points)")
axes[0].set_yticks(range(len(METHODS7)))
axes[0].set_yticklabels(METHODS7)
fig.suptitle("A fire drill for estimators: twenty treatment dates when nothing happened",
             fontsize=13, fontweight="bold", color=LIGHTER_TEXT)
caption(fig, "Placebo errors at last pre-treatment quarters 2010Q1 to 2014Q4; "
             "the orange diamond is the RMSE. The source paper grades SDID (ii) "
             "and (iii) four quarters ahead but everyone else one quarter "
             "ahead. Comparing like with like changes the conclusion.")
save_fig(fig, "12_placebo_tournament", w=11, h=5.6)


# ══════════════════════════════════════════════════════════════════════════════
# 13. DO COVARIATES HELP? THREE MEANINGS OF "CONTROL FOR" IN SDID
# ══════════════════════════════════════════════════════════════════════════════

rule("13. Covariates — three routes through SDID")

cov_rows = [dict(spec="outcomes only", method="--",
                 loss_2018Q4=variants["SDID (iii)"][0],
                 loss_2019Q4=variants["SDID (iii)"][1])]
for meth in ("adjust", "match", "optimized"):
    kw = dict(zeta=0.0, vce="noinference", covariates={meth: COVARIATES})
    if meth == "match":
        kw["match_pre_periods"] = "last"
    try:
        vals = [pct(SDID(cfg(e, **kw)).fit().effects.att) for e in EVAL.values()]
        cov_rows.append(dict(spec=f"SDID covariates={{'{meth}': ...}}", method=meth,
                             loss_2018Q4=vals[0], loss_2019Q4=vals[1]))
        print(f"  covariates={{'{meth}':...}}  2018Q4 {vals[0]:5.2f}   "
              f"2019Q4 {vals[1]:5.2f}")
    except Exception as exc:
        print(f"  covariates={{'{meth}':...}}  FAILED: {type(exc).__name__}: "
              f"{str(exc).splitlines()[0][:90]}")

# VanillaSC's own covariate route: the ADH bilevel program, mscmt backend.
rule("13a. VanillaSC with covariates (the ADH bilevel program)")


def vanilla_covariates():
    """Fit the bilevel covariate SC at two optimiser budgets.

    The predictor-weight (V) problem is generically non-identified. Running the
    same fit at two differential-evolution budgets is the cheapest possible
    demonstration of that: if V were well identified, the budget would not
    matter.
    """
    out = []
    for blab, bkw in [("default (maxiter=300, popsize=15)", {}),
                      ("reduced (maxiter=120, popsize=12)",
                       dict(mscmt_maxiter=120, mscmt_popsize=12))]:
        for e_lab, e in EVAL.items():
            r = VanillaSC(cfg(e, covariates=COVARIATES, backend="mscmt",
                              canonical_v="min.loss.w", seed=SEED,
                              inference=False, **bkw)).fit()
            ss = r.weights.summary_stats or {}
            out.append(dict(budget=blab, quarter=e_lab, loss=pct(r.effects.att),
                            rmse_pre=r.fit_diagnostics.rmse_pre,
                            v_agreement=ss.get("v_agreement"),
                            predictor_weights=ss.get("predictor_weights")))
    return out


vsc_cov = cache("vanillasc_covariates", vanilla_covariates)
for row in vsc_cov:
    va = row["v_agreement"]
    print(f"  {row['budget']:<36s} {row['quarter']}  {row['loss']:5.2f}%   "
          f"pre-RMSE {row['rmse_pre']:.6f}   "
          f"v_agreement {va if va is None else round(va, 5)}")
    pw = row["predictor_weights"]
    if pw:
        top_pw = sorted(pw.items(), key=lambda kv: -abs(kv[1]))[:4]
        print("      top predictor weights: "
              + ", ".join(f"{k} {v:.3f}" for k, v in top_pw))
print("  Same estimator, same seed, same data; only the optimiser budget differs.")
print("  A well-identified V would not care. This one does.")
write_tab(pd.DataFrame([{k: v for k, v in r.items() if k != "predictor_weights"}
                        for r in vsc_cov]), "vanillasc_covariates")

_default = [r for r in vsc_cov if r["budget"].startswith("default")]
cov_rows.append(dict(spec="VanillaSC(covariates=..., backend='mscmt')",
                     method="bilevel V",
                     loss_2018Q4=_default[0]["loss"], loss_2019Q4=_default[1]["loss"]))

cov_df = pd.DataFrame(cov_rows)
write_tab(cov_df, "covariate_methods")

fig, ax = plt.subplots()
ypos = np.arange(len(cov_df))[::-1]
ax.barh(ypos + 0.19, cov_df.loss_2018Q4, height=0.36, color=STEEL, label="2018Q4")
ax.barh(ypos - 0.19, cov_df.loss_2019Q4, height=0.36, color=ORANGE, label="2019Q4")
for y, v in zip(ypos + 0.19, cov_df.loss_2018Q4):
    ax.text(v + 0.05, y, f"{v:.2f}", va="center", color=LIGHTER_TEXT, fontsize=9)
for y, v in zip(ypos - 0.19, cov_df.loss_2019Q4):
    ax.text(v + 0.05, y, f"{v:.2f}", va="center", color=LIGHTER_TEXT, fontsize=9)
ax.set_yticks(ypos); ax.set_yticklabels(cov_df.spec, fontsize=9.5)
ax.set_xlim(0, cov_df[["loss_2018Q4", "loss_2019Q4"]].to_numpy().max() + 0.55)
ax.axvline(BORN, color=GOLD, ls="--", lw=1.2)
ax.annotate("Born et al.: 2.4%", xy=(BORN, ypos.max() + 0.52), color=GOLD,
            fontsize=9, ha="center")
ax.set_xlabel("UK GDP shortfall (%)")
ax.set_title("Three meanings of \"control for a covariate\"")
ax.legend(loc="lower right")
caption(fig, "mlsynth's SDID takes covariates as a dict keyed by method, because "
             "the literature contains three different answers: residualise the "
             "outcome first (Kranz), put the covariates in the unit-weight "
             "problem (de Brabander et al.), or estimate everything jointly "
             "(Arkhangelsky et al.). They are different estimators.")
save_fig(fig, "13_covariate_methods", w=10, h=5.2)


# ══════════════════════════════════════════════════════════════════════════════
# 14. ROBUSTNESS
# ══════════════════════════════════════════════════════════════════════════════

rule("14. Robustness")

rob = []

# (a) The other treatment date: the referendum quarter itself, 2016Q2.
for lab, pre in [("2016Q3 (headline)", T0), ("2016Q2", T0 - 1)]:
    v = pct(VanillaSC(cfg(T_2018Q4, pre=pre, inference=False)).fit().att)
    d = pct(tssc_att(TSSC(cfg(T_2018Q4, pre=pre, method="MSCa", inference=False)).fit()))
    w, l = sdid_weights(pre + 1, pre=pre)
    s = sdid_loss(w, l, T_2018Q4, pre=pre)
    rob.append(dict(check="treatment date", setting=lab, SC=v, DSC=d, SDID=s))
    print(f"  treatment date {lab:<20s} SC {v:5.2f}  DSC {d:5.2f}  SDID {s:5.2f}")

# (b) Drop the United States, which carries a fifth of the weight.
no_us = panel[panel.country != "United States"].copy()
_panel_backup, panel = panel, no_us
_Y_backup, Y = Y, Y.drop(columns=["United States"])
_D_backup, DONORS = DONORS, [c for c in DONORS if c != "United States"]
v = pct(VanillaSC(cfg(T_2018Q4, inference=False)).fit().att)
d = pct(tssc_att(TSSC(cfg(T_2018Q4, method="MSCa", inference=False)).fit()))
w, l = sdid_weights(T0 + 1)
s = sdid_loss(w, l, T_2018Q4)
panel, Y, DONORS = _panel_backup, _Y_backup, _D_backup
rob.append(dict(check="donor pool", setting="drop the United States",
                SC=v, DSC=d, SDID=s))
print(f"  {'drop the United States':<34s} SC {v:5.2f}  DSC {d:5.2f}  SDID {s:5.2f}")

# (c) The ridge penalty on the SDID unit weights.
for lab, kw in [("zeta = 0 (the paper)", dict(zeta=0.0)),
                ("zeta at its default", {})]:
    s = pct(SDID(cfg(T_2018Q4, vce="noinference", **kw)).fit().effects.att)
    rob.append(dict(check="SDID penalty", setting=lab, SC=np.nan, DSC=np.nan, SDID=s))
    print(f"  {lab:<34s} {'':>20s} SDID {s:5.2f}")

# (d) The SC constraint set.
for name in ("simplex", "ols", "ridge", "lasso"):
    try:
        v = pct(VanillaSC(cfg(T_2018Q4, w_constr=name, inference=False)).fit().att)
        rob.append(dict(check="SC constraint", setting=f"w_constr='{name}'",
                        SC=v, DSC=np.nan, SDID=np.nan))
        print(f"  w_constr='{name}'{'':<20s} SC {v:5.2f}")
    except Exception as exc:
        print(f"  w_constr='{name}' FAILED: {type(exc).__name__}")

rob_df = pd.DataFrame(rob)
write_tab(rob_df, "robustness_grid")


# ══════════════════════════════════════════════════════════════════════════════
# 15. INFERENCE
# ══════════════════════════════════════════════════════════════════════════════

rule("15. Inference — what each estimator will tell you")


def inference_menu():
    rows = []
    for meth in ("placebo", "scpi", "lto", "conformal", "ttest", "jackknife_plus"):
        try:
            t0 = time.time()
            r = VanillaSC(cfg(T_2018Q4, inference=meth, alpha=0.05,
                              lto_max_pairs=120, scpi_sims=200)).fit()
            inf = r.inference
            rows.append(dict(method=meth, att=r.att,
                             p_value=None if inf is None else inf.p_value,
                             ci_lower=None if inf is None else inf.ci_lower,
                             ci_upper=None if inf is None else inf.ci_upper,
                             reported_as=None if inf is None else inf.method,
                             seconds=time.time() - t0))
        except Exception as exc:
            rows.append(dict(method=meth, att=np.nan, p_value=None,
                             ci_lower=None, ci_upper=None,
                             reported_as=f"FAILED: {type(exc).__name__}",
                             seconds=np.nan))
    return pd.DataFrame(rows)


inf_df = cache("inference_menu", inference_menu)
print(inf_df.to_string(index=False))
write_tab(inf_df, "inference_summary")

# --- Placebo in space: refit treating each donor as if it were the UK -------
rule("15a. Placebo in space")


def placebo_in_space():
    rows = []
    for country in [TREATED] + DONORS:
        sub = panel.copy()
        sub = sub[(sub.t <= T0) | (sub.t <= len(QLAB))]
        sub["tt"] = sub.groupby("country")["t"].rank(method="dense").astype(int)
        sub["treat"] = ((sub.country == country) & (sub.tt > T0)).astype(int)
        try:
            r = VanillaSC(dict(df=sub, outcome="log_rgdp", treat="treat",
                               unitid="country", time="tt", display_graphs=False,
                               inference=False)).fit()
            gap = np.asarray(r.gap, float).ravel()
            pre = float(np.sqrt(np.mean(gap[:T0] ** 2)))
            post = float(np.sqrt(np.mean(gap[T0:] ** 2)))
            rows.append(dict(country=country, rmspe_pre=pre, rmspe_post=post,
                             ratio=post / pre, gap=gap))
        except Exception as exc:
            print(f"    {country}: {type(exc).__name__}")
    return rows


space = cache("placebo_in_space", placebo_in_space)
space_df = pd.DataFrame([{k: v for k, v in r.items() if k != "gap"} for r in space])
space_df = space_df.sort_values("ratio", ascending=False).reset_index(drop=True)
space_df["rank"] = np.arange(1, len(space_df) + 1)
uk_rank = int(space_df.loc[space_df.country == TREATED, "rank"].iloc[0])
p_perm = uk_rank / len(space_df)
print(f"  UK post/pre RMSPE ratio ranks {uk_rank} of {len(space_df)}  "
      f"-> permutation p = {p_perm:.3f}")
print(space_df.head(6).to_string(index=False, float_format=lambda v: f"{v:.4f}"))
write_tab(space_df, "placebo_in_space_ratios")

fig, ax = plt.subplots()
for r in space:
    g = np.asarray(r["gap"], float)
    xs = QDEC[:len(g)]
    if r["country"] == TREATED:
        continue
    ax.plot(xs, g, color=GREY_DONOR, lw=0.8, alpha=0.6)
uk = next(r for r in space if r["country"] == TREATED)
g = np.asarray(uk["gap"], float)
ax.plot(QDEC[:len(g)], g, color=ORANGE, lw=2.4, label="United Kingdom", zorder=5)
ax.plot([], [], color=GREY_DONOR, lw=1.0, label="23 placebo donors")
ax.axhline(0, color=MUTED, lw=0.8)
ax.axvline(QDEC[T0], color=LIGHT_TEXT, ls="--", lw=1.0)
ax.set_xlabel("year"); ax.set_ylabel("gap (log points)")
ax.set_title("Placebo in space: give every donor the treatment in turn")
ax.legend(loc="lower left")
caption(fig, f"The UK's post/pre RMSPE ratio ranks {uk_rank} of "
             f"{len(space_df)}, a permutation p-value of {p_perm:.3f}. With "
             f"twenty-four units the smallest attainable p-value is "
             f"{1 / len(space_df):.3f}, so this is about as strong as the "
             f"design allows.")
save_fig(fig, "14_placebo_in_space", w=9.5, h=6)


# ══════════════════════════════════════════════════════════════════════════════
# 16. WRAP-UP AND ASSERTIONS
# ══════════════════════════════════════════════════════════════════════════════

rule("16. Assertions")

checks = {
    "SC at 2018Q4 near 3.04":
        abs(ladder.loc[ladder.method == "SC", "loss_2018Q4"].iloc[0] - 3.04) < 0.02,
    "DSC at 2018Q4 near 2.99":
        abs(ladder.loc[ladder.method == "DSC", "loss_2018Q4"].iloc[0] - 2.99) < 0.02,
    "SDID at 2018Q4 near 2.80":
        abs(ladder.loc[ladder.method == "SDID", "loss_2018Q4"].iloc[0] - 2.80) < 0.02,
    "MASC at 2018Q4 near 2.73":
        abs(ladder.loc[ladder.method == "MASC", "loss_2018Q4"].iloc[0] - 2.73) < 0.02,
    "ASCM at 2018Q4 near 3.04":
        abs(ladder.loc[ladder.method == "ASCM", "loss_2018Q4"].iloc[0] - 3.04) < 0.02,
    "DiD at 2018Q4 near 4.98":
        abs(ladder.loc[ladder.method == "DiD", "loss_2018Q4"].iloc[0] - 4.98) < 0.02,
    "every stage exceeds Born et al.'s 2.4%":
        bool(ladder.loss_2018Q4.min() > BORN),
    "SDID time weights sum to one": abs(lam_i.sum() - 1.0) < 1e-6,
    "SC weights lie on the simplex":
        abs(sum(sc["2018Q4"].donor_weights.values()) - 1.0) < 1e-5,
    "DiD weights are uniform":
        abs(max(wd.values()) - min(wd.values())) < 1e-9,
    "the three SDID flavours agree within 0.05pp": spread < 0.05,
    "SDID beats SC in the h=1 placebo":
        pl_h1.loc[pl_h1.method == "SDID (i)", "RMSE"].iloc[0]
        < pl_h1.loc[pl_h1.method == "SC", "RMSE"].iloc[0],
}
for name, ok in checks.items():
    print(f"  [{'ok ' if ok else 'FAIL'}] {name}")
failed = [k for k, v in checks.items() if not v]


# ══════════════════════════════════════════════════════════════════════════════
# 17. WEB-APP DATA  —  guarded, runs only under APP_DATA=1
#
# The interactive companion at web_app/ estimates nothing in the browser: every
# number it draws is computed here and shipped in web_app/data/results.json.
# That is the whole design. There is one source of truth, so the app cannot
# drift from the post.
#
# The section is guarded because a bare `python analysis.py` should stay
# reproducible and cheap: re-running it rewrites all fourteen figures, and
# matplotlib rarely produces byte-identical PNGs. Rebuild the app's data with
#
#     APP_DATA=1 python analysis.py
#
# Most of what the app needs already exists above and is reused as-is. Four
# tables are new, and they exist because the app lets a reader *sweep* an
# option where the post only quotes the two or three settings it discusses.
# ══════════════════════════════════════════════════════════════════════════════

APP_DATA = bool(os.environ.get("APP_DATA", ""))

if APP_DATA and failed:
    print("\n  [skip] web-app data — assertions failed, refusing to publish "
          "numbers from a broken run")
elif not APP_DATA:
    print("\n  [skip] web-app data — rerun with APP_DATA=1 to rebuild "
          "web_app/data/results.json")
else:
    import json

    # mlsynth's own penalty formula, so the sweep below is anchored on the value
    # the package would have chosen rather than on a number typed in here.
    from mlsynth.utils.sdid_helpers.weights import compute_regularization

    rule("17. Web-app data")

    # --- (a) The zeta sweep -------------------------------------------------
    #
    # SDIDConfig.zeta defaults to None, which means "compute it for me":
    #     zeta* = (N_treated * T_post)^(1/4) * sd(first differences of donors)
    # There is no number to sweep around until that is evaluated, so evaluate
    # it, then sweep in multiples of it. Multiple 0 is the paper's
    # specification; multiple 1 is what you get by leaving the field alone.
    ZETA_STAR = float(compute_regularization(Y.loc[1:T0, DONORS].to_numpy(), 1))
    ZETA_MULTIPLES = [0.0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.65, 0.8,
                      1.0, 1.25, 1.5, 1.75, 2.0]

    def _rmse_of(res):
        """rmse_pre if the result carries fit diagnostics, else None."""
        fd = getattr(res, "fit_diagnostics", None)
        return None if fd is None else getattr(fd, "rmse_pre", None)

    def app_zeta_sweep():
        rows = []
        for mult in ZETA_MULTIPLES:
            z = mult * ZETA_STAR
            vals, rmse = [], None
            for e in EVAL.values():
                r = SDID(cfg(e, zeta=z, vce="noinference")).fit()
                vals.append(pct(r.effects.att))
                rmse = _rmse_of(r) or rmse
            rows.append(dict(multiple=mult, zeta=z, loss_2018Q4=vals[0],
                             loss_2019Q4=vals[1], pre_rmse=rmse))
        return pd.DataFrame(rows)

    zeta_df = cache("app_zeta_sweep", app_zeta_sweep)
    print(f"  zeta* = {ZETA_STAR:.6f}  (what SDID picks when you leave zeta=None)")
    print(zeta_df.to_string(index=False, float_format=lambda v: f"{v:.4f}"))
    write_tab(zeta_df, "app_zeta_sweep")

    # --- (b) The constraint set --------------------------------------------
    # robustness_grid.csv has these at 2018Q4 only and without the fit error.
    # The app needs both horizons and the RMSE, because the point of the panel
    # is that the loosest constraint buys the best pre-treatment fit and the
    # worst answer.
    def app_wconstr_grid():
        rows = []
        for lab, kw in [("default (backend='auto')", {}),
                        ("w_constr='simplex'", dict(w_constr="simplex")),
                        ("w_constr='ols'", dict(w_constr="ols")),
                        ("w_constr='ridge'", dict(w_constr="ridge")),
                        ("w_constr='lasso'", dict(w_constr="lasso"))]:
            vals, rmse = [], None
            for e in EVAL.values():
                r = VanillaSC(cfg(e, inference=False, **kw)).fit()
                vals.append(pct(r.att))
                rmse = _rmse_of(r) or rmse
            rows.append(dict(setting=lab, loss_2018Q4=vals[0],
                             loss_2019Q4=vals[1], pre_rmse=rmse))
        return pd.DataFrame(rows)

    wconstr_df = cache("app_wconstr_grid", app_wconstr_grid)
    print(wconstr_df.to_string(index=False, float_format=lambda v: f"{v:.4f}"))
    write_tab(wconstr_df, "app_wconstr_grid")

    # --- (c) MASC's fold set ------------------------------------------------
    # masc_fold_settings.csv already has the three settings; this adds the
    # cross-validated m and phi so the panel can say what actually changed.
    def app_setf_grid():
        rows = []
        for lab, kw in [("set_f=range(6, 87)  [the paper]",
                         dict(m_grid=M_GRID, set_f=SET_F)),
                        ("min_preperiods=None [default]", dict(m_grid=M_GRID)),
                        ("min_preperiods=43   [ceil(T0/2)]",
                         dict(m_grid=M_GRID, min_preperiods=43))]:
            vals, rmse, m_hat, phi_hat = [], None, None, None
            for e in EVAL.values():
                r = MASC(cfg(e, **kw)).fit()
                vals.append(pct(r.att))
                rmse = r.pre_rmse
                ss = r.weights.summary_stats or {}
                m_hat, phi_hat = ss.get("m_hat"), ss.get("phi_hat")
            rows.append(dict(setting=lab, loss_2018Q4=vals[0],
                             loss_2019Q4=vals[1], pre_rmse=rmse,
                             m_hat=m_hat, phi_hat=phi_hat))
        return pd.DataFrame(rows)

    setf_df = cache("app_setf_grid", app_setf_grid)
    print(setf_df.to_string(index=False, float_format=lambda v: f"{v:.4f}"))
    write_tab(setf_df, "app_setf_grid")

    # --- (d) The covariate routes, with their fit errors --------------------
    # covariate_methods.csv has the estimates. The honest version of that panel
    # needs the pre-treatment RMSE beside them, because the specification that
    # lands closest to the published 2.4% is also the one that fits worst.
    def app_covariates():
        base = SDID(cfg(T_2018Q4, zeta=0.0, vce="noinference")).fit()
        rows = [dict(spec="outcomes only", method="--",
                     loss_2018Q4=variants["SDID (iii)"][0],
                     loss_2019Q4=variants["SDID (iii)"][1],
                     pre_rmse=_rmse_of(base), v_agreement=None)]
        for meth in ("adjust", "match", "optimized"):
            kw = dict(zeta=0.0, vce="noinference", covariates={meth: COVARIATES})
            if meth == "match":
                kw["match_pre_periods"] = "last"
            vals, rmse = [], None
            for e in EVAL.values():
                r = SDID(cfg(e, **kw)).fit()
                vals.append(pct(r.effects.att))
                rmse = _rmse_of(r) or rmse
            rows.append(dict(spec=f"SDID covariates={{'{meth}': ...}}",
                             method=meth, loss_2018Q4=vals[0],
                             loss_2019Q4=vals[1], pre_rmse=rmse,
                             v_agreement=None))
        d = [r for r in vsc_cov if r["budget"].startswith("default")]
        rows.append(dict(spec="VanillaSC(covariates=..., backend='mscmt')",
                         method="bilevel V", loss_2018Q4=d[0]["loss"],
                         loss_2019Q4=d[1]["loss"], pre_rmse=d[0]["rmse_pre"],
                         v_agreement=d[0]["v_agreement"]))
        return pd.DataFrame(rows)

    app_cov_df = cache("app_covariates", app_covariates)
    print(app_cov_df.to_string(index=False, float_format=lambda v: f"{v:.4f}"))
    write_tab(app_cov_df, "app_covariates")

    # --- The ladder's own spread, which the defaults panel measures against --
    _non_did = ladder[ladder.method != "DiD"]
    LADDER_SPREAD = float(_non_did.loss_2018Q4.max() - _non_did.loss_2018Q4.min())
    print(f"  ladder spread at 2018Q4, excluding DiD: {LADDER_SPREAD:.3f}pp")
    for lab, lo, hi in [
        ("zeta", zeta_df.loss_2018Q4.min(), zeta_df.loss_2018Q4.max()),
        ("set_f", setf_df.loss_2018Q4.min(), setf_df.loss_2018Q4.max()),
        ("w_constr", wconstr_df.loss_2018Q4.min(), wconstr_df.loss_2018Q4.max()),
        ("covariates", app_cov_df.loss_2018Q4.min(), app_cov_df.loss_2018Q4.max()),
    ]:
        print(f"    {lab:<11s} spans {hi - lo:5.2f}pp "
              f"({'clears' if hi - lo > LADDER_SPREAD else 'inside'} the ladder)")

    # --- What a fit looks like, for the anatomy panel -----------------------
    _w = window(T_2018Q4)
    _ss = demo.weights.summary_stats or {}
    anatomy = {
        "config": [
            dict(field="df", value=f"DataFrame, {_w.shape[0]} x {_w.shape[1]}",
                 note="long format: one row per unit-period"),
            dict(field="outcome", value='"log_rgdp"', note="the column to explain"),
            dict(field="treat", value='"treat"',
                 note="0/1, one for the treated unit after adoption"),
            dict(field="unitid", value='"country"', note="the panel's unit key"),
            dict(field="time", value='"tt"', note="the panel's period key"),
            dict(field="display_graphs", value="False",
                 note="True pops mlsynth's own matplotlib window"),
            dict(field="inference", value="False",
                 note="VanillaSC only; skips the placebo distribution"),
        ],
        "result": [
            dict(accessor="res.att", value=f"{demo.att:+.6f}",
                 note="treated minus counterfactual, averaged over post periods"),
            dict(accessor="res.pre_rmse", value=f"{demo.pre_rmse:.6f}",
                 note="pre-treatment fit error, the only honest quality signal"),
            dict(accessor="res.fit_diagnostics.r_squared_pre",
                 value=f"{demo.fit_diagnostics.r_squared_pre:.6f}",
                 note="near 1 on any trending panel; do not be impressed by it"),
            dict(accessor="res.method_details.method_name",
                 value=f'"{demo.method_details.method_name}"',
                 note="which backend 'auto' actually chose"),
            dict(accessor="len(res.donor_weights)",
                 value=f"{len(demo.donor_weights)}",
                 note="nonzero donors only, not the full pool"),
            dict(accessor="res.counterfactual.shape",
                 value=f"{tuple(np.shape(demo.counterfactual))}",
                 note="the synthetic unit, over the fitted window"),
            dict(accessor="res.gap.shape", value=f"{tuple(np.shape(demo.gap))}",
                 note="treated minus counterfactual, period by period"),
            dict(accessor="res.weights.summary_stats",
                 value=", ".join(sorted(_ss)),
                 note="where the estimator-specific dials hide"),
        ],
        "deviations": [
            dict(cls="FDIDResults", extra=".fdid  .did",
                 note="two estimators in one result; .did is the plain two-way fit"),
            dict(cls="TSSCResults",
                 extra=".variants  .selection  .recommended_method",
                 note="four MSC variants plus the Step-1 restriction tests"),
            dict(cls="SDIDResults",
                 extra=".inference_detail  .event_study  .cohorts",
                 note="time weights live in cohorts[a].time_weights"),
        ],
        "rounding": dict(
            reported=float(t_all.variants["MSCa"].att),
            exact=float(tssc_att(t_all, "MSCa")),
            reported_rmse=float(t_all.variants["MSCa"].rmse_pre),
            loss_from_reported=pct(float(t_all.variants["MSCa"].att)),
            loss_from_exact=pct(float(tssc_att(t_all, "MSCa"))),
        ),
    }

    # --- Assemble results.json ---------------------------------------------
    def clean(o):
        """JSON-safe, 8 significant figures, NaN -> null."""
        if isinstance(o, dict):
            return {str(k): clean(v) for k, v in o.items()}
        if isinstance(o, (list, tuple)):
            return [clean(v) for v in o]
        if isinstance(o, np.ndarray):
            return [clean(v) for v in o.tolist()]
        if isinstance(o, (bool, np.bool_)):
            return bool(o)
        if isinstance(o, (int, np.integer)):
            return int(o)
        if isinstance(o, (float, np.floating)):
            v = float(o)
            return None if not np.isfinite(v) else float(f"{v:.8g}")
        if o is None or isinstance(o, str):
            return o
        try:
            return None if pd.isna(o) else o
        except (TypeError, ValueError):
            return o

    def recs(df):
        return clean(df.replace({np.nan: None}).to_dict(orient="records"))

    METHODS6 = ["DiD", "SC", "DSC", "SDID", "MASC", "ASCM"]
    space_by_country = {r["country"]: np.asarray(r["gap"], float) for r in space}

    payload = clean({
        "meta": dict(
            slug=SLUG, treated=TREATED, donors=DONORS,
            quarters=list(QLAB), t0=T0, eval=EVAL,
            born_2018=BORN, born_2019=3.6,
            mlsynth_version=mlsynth.__version__,
            ladder_spread=LADDER_SPREAD,
            zeta_star=ZETA_STAR,
            n_units=len(space),
            p_floor=1.0 / len(space),
            uk_rank=uk_rank,
            p_permutation=p_perm,
        ),
        "outcome": dict(uk=Y[TREATED].to_numpy()),
        "counterfactual": {m: np.asarray(cfs[m], float) for m in METHODS6},
        "weights": {m: wt[m].to_numpy() for m in METHODS6},
        "results": recs(ladder),
        "variants": [dict(variant=k, loss_2018Q4=v[0], loss_2019Q4=v[1],
                          lambda_fitted_on=v[2], published_2018Q4=v[3])
                     for k, v in variants.items()],
        "lambda": dict(i=lam_i, ii=lam_ii8, iii=lam_iii8),
        "placebo_h1": recs(pl_h1), "placebo_h4": recs(pl_h4),
        "placebo_published": recs(mixed),
        "zeta_sweep": recs(zeta_df),
        "wconstr": recs(wconstr_df),
        "setf": recs(setf_df),
        "covariates": recs(app_cov_df),
        "inference": recs(inf_df),
        "event_study": [dict(event_time=a, tau=b, ci_lower=c, ci_upper=d)
                        for a, b, c, d in zip(et, tau, ci[:, 0], ci[:, 1])],
        "in_space": recs(space_df),
        "in_space_gaps": space_by_country,
        "solvers": recs(solver_df),
        "tssc": recs(pd.DataFrame(tssc_rows)),
        "masc_cv": recs(masc_cv),
        "anatomy": anatomy,
    })

    app_dir = Path("web_app") / "data"
    app_dir.mkdir(parents=True, exist_ok=True)
    app_json = app_dir / "results.json"
    with app_json.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"  [app]    {app_json}  ({app_json.stat().st_size / 1024:.1f} KB, "
          f"{len(payload)} top-level keys)")


rule("Done")
print(f"  figures written: {len(list(Path('.').glob(f'{SLUG}_*.png')))}")
print(f"  tables  written: {len(list(Path('.').glob('*.csv'))) - 1}")
if failed:
    print(f"\n  {len(failed)} assertion(s) FAILED: {failed}")
    sys.exit(1)
print("  all assertions passed")
