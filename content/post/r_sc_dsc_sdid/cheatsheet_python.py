"""
THE SYNTHETIC-CONTROL LADDER IN PYTHON — one mlsynth class per rung

    DiD  ->  SC  ->  DSC  ->  SDID  ->  MASC  ->  ASCM

The Python port of cheatsheet_R.R. Same data, same treatment date, same two
evaluation quarters, same comparative table at the end -- so the three files
can be read side by side.

Companion post:  https://carlos-mendez.org/post/r_sc_dsc_sdid/
Companions:      cheatsheet_R.R   cheatsheet_stata.do

Every estimator comes from mlsynth (Jared Greathouse), which exposes all five
of this paper's methods behind one config-dict API. The mapping was worked out
in mlsynth issue #312, which is a reading of the very paper this post
replicates: https://github.com/jgreathouse9/mlsynth/issues/312

Install:
    pip install -U "git+https://github.com/jgreathouse9/mlsynth.git"
    # or, isolated:
    uv venv --python 3.12 mlsynth-env
    uv pip install --python mlsynth-env/bin/python \
        "git+https://github.com/jgreathouse9/mlsynth.git"

Usage:     python cheatsheet_python.py
Run time:  about 90 seconds. Data loads over HTTPS; nothing is written to disk.
Verified with Python 3.12 and mlsynth @ main (2026-08-02).

╔══════════════════════════════════════════════════════════════════════════════╗
║  NAMING HAZARD -- READ THIS BEFORE YOU IMPORT ANYTHING                       ║
║                                                                              ║
║  mlsynth ships a class called DSC. It is NOT the estimator in this post.     ║
║                                                                              ║
║      mlsynth.DSC          = DISTRIBUTIONAL synthetic control (Gunsilius      ║
║                             2023) -- matches whole outcome distributions.    ║
║      this post's DSC      = DEMEANED synthetic control (Doudchenko & Imbens  ║
║                             2016; Ferman & Pinto 2021) -- SC with an         ║
║                             intercept. In mlsynth this is TSSC(method=       ║
║                             "MSCa").                                         ║
║                                                                              ║
║  Same three letters, different estimators. Importing the wrong one will not  ║
║  raise an error; it will just quietly answer a different question.           ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import warnings

import pandas as pd

warnings.filterwarnings("ignore")

from mlsynth import FDID, MASC, SDID, TSSC, VanillaSC  # noqa: E402

# ── Data ──────────────────────────────────────────────────────────────────────
# 24 OECD countries x 104 quarters (1995Q1-2020Q4), quarterly log real GDP.
URL = (
    "https://raw.githubusercontent.com/cmg777/starter-academic-v501/"
    "master/content/post/r_sc_dsc_sdid/brexit_analysis.csv"
)
try:
    panel = pd.read_csv("brexit_analysis.csv")
except FileNotFoundError:
    panel = pd.read_csv(URL)

T0 = 86                                  # pre-treatment quarters, through 2016Q2
EVAL = {"2018Q4": 96, "2019Q4": 100}     # evaluation quarters, as values of `t`
TREATED = "United Kingdom"

# ══════════════════════════════════════════════════════════════════════════════
# THE ONE TRICK THAT MAKES THIS A CHEAT SHEET
#
# Every one of these estimators reports an ATT averaged over ALL post-treatment
# periods. We want the shortfall at two specific quarters. So keep the 86
# pre-treatment quarters PLUS the single quarter of interest, renumber time so
# it runs 1..87, and the average over "all post periods" becomes an average
# over one period. The bare `.fit()` then returns exactly the number we want --
# no post-estimation arithmetic anywhere in this file.
# ══════════════════════════════════════════════════════════════════════════════


def window(eval_t: int) -> pd.DataFrame:
    """86 pre-treatment quarters + one evaluation quarter, time renumbered 1..87."""
    sub = panel[(panel.t <= T0) | (panel.t == eval_t)].copy()
    sub["tt"] = sub.groupby("country")["t"].rank(method="dense").astype(int)
    sub["treat"] = ((sub.country == TREATED) & (sub.tt > T0)).astype(int)
    return sub


def cfg(eval_t: int, **extra) -> dict:
    """The five fields every mlsynth estimator wants, plus estimator-specific ones."""
    return dict(
        df=window(eval_t),
        outcome="log_rgdp",
        treat="treat",
        unitid="country",
        time="tt",
        display_graphs=False,
        **extra,
    )


def pct(att: float) -> float:
    """mlsynth reports treated minus counterfactual. Flip it into a % GDP shortfall."""
    return -100.0 * att


results: dict[str, dict] = {}


def record(rung, command, values, se=None, inference="--", paper=None, note=""):
    results[rung] = dict(
        command=command, q2018=values[0], q2019=values[1],
        se=se, inference=inference, paper=paper,
    )
    print(f"  {command:<38s} 2018Q4 {values[0]:5.2f}   2019Q4 {values[1]:5.2f}")
    if note:
        print(f"  {'':<38s} {note}")


print("\nBrexit: shortfall in UK real GDP (%), treatment dated 2016Q3, no covariates")
print("=" * 78)

# ── Rung 0. DiD ───────────────────────────────────────────────────────────────
# mlsynth has no standalone DiD class, but FDID (Forward DiD, Li 2024) fits the
# plain two-way estimator alongside its own and exposes it as `.did`. Weights
# come back as a uniform 1/23 across every donor, which is the giveaway that
# nothing was fitted.
print("\n0. DiD")
did = {k: FDID(cfg(e)).fit().did for k, e in EVAL.items()}
record(
    "DiD", "FDID(...).fit().did",
    [pct(d.att) for d in did.values()],
    se=100 * did["2018Q4"].att_se, inference="analytic (FDID)",
)

# ── Rung 1. SC ────────────────────────────────────────────────────────────────
# Donor weights on the simplex, fitted to the pre-treatment path, no intercept.
# With no covariates VanillaSC takes the "outcome-only" backend: a plain convex
# QP with a unique solution, no predictor-weight (V) search to go wrong.
print("\n1. SC")
sc = {k: VanillaSC(cfg(e)).fit() for k, e in EVAL.items()}
record(
    "SC", "VanillaSC(...)",
    [pct(r.effects.att) for r in sc.values()],
    inference="in-space placebo", paper=3.06,
    note="note: 3.04, not R's 3.06 -- see 'On the two disagreements' below",
)

# ── Rung 2. DSC ───────────────────────────────────────────────────────────────
# Demeaned SC: SC plus an intercept, so the blend has to match the SHAPE of the
# UK's path but not its level. In mlsynth this is the MSCa variant of the
# two-step estimator. See the naming hazard at the top of this file.
#
# method="MSCa" fits that one variant instead of all four and skipping the
# selection step; inference=False skips the subsampling draws.
print("\n2. DSC")
dsc = {k: TSSC(cfg(e, method="MSCa", inference=False)).fit() for k, e in EVAL.items()}
record(
    "DSC", 'TSSC(..., method="MSCa")',
    [pct(r.effects.att) for r in dsc.values()],
    inference="none (disabled)", paper=2.98,
)

# ── Rung 3. SDID ──────────────────────────────────────────────────────────────
# Same unit weights as DSC, but the time weights are fitted too.
#
# zeta=0 switches off the ridge penalty on the unit weights, because the paper
# solves the unpenalised problem. Leave it at its default and you get 2.67
# rather than 2.80 -- the same trap as synthdid's zeta.omega in R and sdid's
# zeta_omega() in Stata. All three packages penalise by default.
print("\n3. SDID")
sdid = {k: SDID(cfg(e, zeta=0.0)).fit() for k, e in EVAL.items()}
record(
    "SDID", "SDID(..., zeta=0.0)",
    [pct(r.effects.att) for r in sdid.values()],
    se=100 * sdid["2018Q4"].effects.att_std_err, inference="placebo", paper=2.79,
)
print(f"  {'':<38s} defaults (zeta left alone): "
      f"{pct(SDID(cfg(EVAL['2018Q4'])).fit().effects.att):.2f}")

# ── Rung 4. MASC ──────────────────────────────────────────────────────────────
# A cross-validated blend of m-nearest-neighbour matching and SC.
#
# SET set_f EXPLICITLY. Left to its default, the cross-validation uses a
# different fold set and lands on a different blend. Folds running 6..T0 are
# what the paper uses, and passing them makes mlsynth agree with R's masc to
# three decimals. This is the single most important argument in this file.
print("\n4. MASC")
masc = {
    k: MASC(cfg(e, m_grid=list(range(1, 11)), set_f=list(range(6, T0 + 1)))).fit()
    for k, e in EVAL.items()
}
record(
    "MASC", "MASC(..., set_f=range(6, 87))",
    [pct(r.effects.att) for r in masc.values()],
    inference="none in package", paper=2.73,
)

# ── Rung 5. ASCM ──────────────────────────────────────────────────────────────
# SC weights plus a ridge-regression correction for whatever pre-treatment
# imbalance SC could not close. One keyword on the class you already used.
print("\n5. ASCM")
ascm = {k: VanillaSC(cfg(e, augment="ridge")).fit() for k, e in EVAL.items()}
record(
    "ASCM", 'VanillaSC(..., augment="ridge")',
    [pct(r.effects.att) for r in ascm.values()],
    inference="in-space placebo", paper=3.04,
)

# ══════════════════════════════════════════════════════════════════════════════
# COMPARATIVE TABLE
#
# `Paper` is de Brabander, Juodis & Miyazato Szini (2025), 2018Q4, no
# covariates. `R` is what cheatsheet_R.R prints, so the two ports can be
# checked against each other directly.
# ══════════════════════════════════════════════════════════════════════════════

R_COLUMN = {"DiD": 4.98, "SC": 3.06, "DSC": 2.98, "SDID": 2.79, "MASC": 2.73, "ASCM": 3.04}

print("\n\n" + "=" * 98)
print("UK GDP shortfall (%), 2016Q3 treatment, outcomes only, 23 donors, 86 pre-quarters")
print("=" * 98)
print(f"{'Rung':<6}{'Command':<34}{'2018Q4':>8}{'2019Q4':>8}{'SE 18Q4':>9}  "
      f"{'Inference':<18}{'R':>6}{'Paper':>7}")
print("-" * 98)
for rung, r in results.items():
    se = f"{r['se']:.2f}" if r["se"] is not None else "--"
    paper = f"{r['paper']:.2f}" if r["paper"] is not None else "--"
    print(f"{rung:<6}{r['command']:<34}{r['q2018']:>8.2f}{r['q2019']:>8.2f}{se:>9}  "
          f"{r['inference']:<18}{R_COLUMN[rung]:>6.2f}{paper:>7}")
print("-" * 98)

print("""
ON THE TWO DISAGREEMENTS WITH R

Four rungs agree with R to two decimals. Two do not, and both are worth
understanding rather than rounding away.

SC: 3.04 here, 3.06 in R. This is not a bug in either package -- it is the
    post's section 5 finding, arriving from a third direction. R's synthdid
    solves the simplex problem with Frank-Wolfe and a capped iteration budget,
    on an objective whose condition number here is about 7.5e5. It stops at
    3.06. mlsynth hands the same problem to a convex solver, which runs it to
    optimality and returns 3.04 -- exactly the "SC (exact QP)" row in
    analysis.R's headline table. The published 3.06 is partly a record of where
    an optimiser stopped.

SDID: 2.80 here, 2.79 in R. Same story, smaller gap. Tighten sdid's convergence
    in Stata and it drifts to 2.80 as well. Three independent implementations
    converging on 2.80 while synthdid's default budget stops at 2.79 tells you
    which number is the artefact.

DSC is 3.00 against R's 2.98, within the same solver tolerance. MASC and ASCM
match R exactly once set_f is passed.

The lesson is not that one library is right. It is that a synthetic control
estimate carries a solver's fingerprint, and differences in the second decimal
between implementations are normal rather than alarming.

NOT HERE, DELIBERATELY
  * SC(B) and the covariate specifications. mlsynth can fit covariate SC, but
    the paper's SDID-with-covariates is the ADH nested route, which is a
    different estimator from the Kranz two-step; see mlsynth issue #312.
  * SDID variants (i) and (iii). Truncating the panel fits the time weights on
    the evaluation quarter, which is variant (iii).
  * Everything hand-coded. That is what analysis.R is for.
""")
