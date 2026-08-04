"""
BAYESIAN SPATIAL SYNTHETIC CONTROL IN PYTHON — scspill and mlsynth

    classical simplex SC  ->  Bayesian horseshoe SC  ->  Bayesian spatial SC

Companion script for https://carlos-mendez.org/post/python_sc_bayes_spatial/
The Python counterpart of the R post's analysis.R
(https://carlos-mendez.org/post/r_sc_bayes_spatial/), with one difference of
emphasis. The R post fetches the authors' replication helpers from raw GitHub
and calls the C++ samplers directly. This script calls two installed, pinned,
pip-installable packages, and spends the difference on the question the R post
could not answer: whether the credible interval it reported meant anything.

Install (both pins matter; the numbers below are reproducible only under them):
    pip install "scspill[numba]==0.2.1"  || pip install "scspill==0.2.1"
    pip install "mlsynth[bayes] @ git+https://github.com/jgreathouse9/mlsynth.git@15f168bb90487098a7324be00b6663fcab0139ef"

Usage:
    python analysis.py 2>&1 | tee execution_log.txt
    FORCE_REFIT=1 python analysis.py      # invalidate every cached fit
    APP_DATA=1    python analysis.py      # also rebuild web_app/data/results.json
    M_ITER=100000 python analysis.py      # a 5x cheaper headline run
    BENCH_TIER=fast python analysis.py    # skip the three slow benchmark rows
    MC_SIMS=15    python analysis.py      # a coarser Monte Carlo

Run time: about 35 minutes cold, under a minute warm. The three dominant costs
are the benchmark sweep (BVSS alone is ~3.5 min), the Monte Carlo, and the
web-app budget ladder under APP_DATA=1.

Outputs:  python_sc_bayes_spatial_*.png (20 figures) and *.csv (23 tables).
          Under APP_DATA=1, four more app_*.csv tables and the interactive
          companion's web_app/data/results.json (section 13).

NAMING HAZARD
    Four different things in this post are called "a Bayesian synthetic
    control", and three of them are called "the spillover SCM":

      scspill.SCSPILL(method="sar")     Sakaguchi & Tagawa (2026)  <- the post's
                                        headline estimator
      mlsynth.SPILLSYNTH(method="sar")  the SAME paper, independently ported
                                        into mlsynth. Agrees with scspill.
      mlsynth.SPILLSYNTH(method="cd")   Cao & Dowd (2019) -- a DIFFERENT
                                        estimator on a DIFFERENT (demeaned,
                                        leave-one-out) baseline.
      mlsynth.BSCM                      Kim, Lee & Gupta (2020) -- a Bayesian SC
                                        WITH AN EXPLICIT INTERCEPT, which is why
                                        it reports about -18.8 where scspill's
                                        rho = 0 case reports about -15.7. Both
                                        are right; they are not the same model.

    Importing the wrong one raises no error. It answers a different question.

SIGN CONVENTION
    spillover_panel = Yc - Yc(0): observed donor outcome minus its
    no-treatment counterfactual. A NEGATIVE entry means the donor's observed
    sales are BELOW what they would have been absent Proposition 99. Section 6
    asserts the sign rather than assuming it.
"""

from __future__ import annotations

# BLAS reduction order changes the last digits of every matrix product, and at
# N = 38 single-threaded BLAS is also *faster* than multi-threaded. Both reasons
# to pin it, and it must happen before numpy is imported.
import os

for _v in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS",
           "VECLIB_MAXIMUM_THREADS", "NUMEXPR_NUM_THREADS"):
    os.environ.setdefault(_v, "1")
# numpyro-backed mlsynth estimators run in float32 unless told otherwise, and
# x32 vs x64 changes their numbers. Must precede any import that pulls jax.
os.environ.setdefault("JAX_ENABLE_X64", "1")

import hashlib
import importlib.metadata
import json
import pickle
import platform
import sys
import textwrap
import time
import warnings
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, NamedTuple

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import scipy
import scipy.sparse.csgraph
import scipy.stats

warnings.filterwarnings("ignore")

import mlsynth
import scspill
from scspill import SCSPILL
from scspill.data import load_california
from scspill.utils import plotting as _scplot
from scspill.utils.scspill_helpers.sar import _kernels as _sckernels

# ══════════════════════════════════════════════════════════════════════════════
# 0. SETUP
# ══════════════════════════════════════════════════════════════════════════════

SLUG = "python_sc_bayes_spatial"

# The same seed as the R post's analysis.R. The two editions are meant to be
# compared line by line, and a different seed would make every small
# disagreement ambiguous.
SEED = 20251022

TREAT_YEAR = 1988      # scspill's convention; see section 1 for why not 1989
CI_LEVEL = 0.95

# Headline MCMC budget. Section 14 shows the evidence for this choice: the ATT
# and its interval are stable from 100k on, but ESS(rho) does not clear the
# conventional 100 threshold until about 500k. rho is the weakly identified
# parameter of this model, and it sets the budget.
M_ITER = int(os.environ.get("M_ITER", "500000"))
BURN = int(os.environ.get("BURN", str(M_ITER // 2)))

# The R post's own budget, used verbatim in section 7 to reproduce its numbers.
R_M_ITER, R_BURN, R_STEP_RHO = 5000, 2500, 0.01

FORCE_REFIT = bool(os.environ.get("FORCE_REFIT", ""))
APP_DATA = bool(os.environ.get("APP_DATA", ""))
BENCH_TIER = os.environ.get("BENCH_TIER", "full").lower()
MC_SIMS = int(os.environ.get("MC_SIMS", "60"))
MC_JOBS = int(os.environ.get("MC_JOBS", "1"))
BACKEND_REQ = os.environ.get("SCSPILL_BACKEND", "auto")

# The frozen R edition, for every comparison in this script. Sources:
#   content/post/r_sc_bayes_spatial/r_sc_bayes_spatial_att_comparison.csv
#   content/post/r_sc_bayes_spatial/execution_log.txt
R_EDITION = {
    "att_classical": -18.46, "att_classical_lo": -22.21, "att_classical_hi": -14.45,
    "att_horseshoe": -15.84, "att_horseshoe_lo": -21.76, "att_horseshoe_hi": -9.48,
    "att_sar": -16.59, "att_sar_lo": -16.777, "att_sar_hi": -16.393,
    "rho_hat": 0.2226, "rho_lo": 0.1685, "rho_hi": 0.2715, "rho_ess": 2.93,
    "spill_nevada": -3.75, "spill_idaho": -0.228,
    "n_active_classical": 4, "n_active_horseshoe": 23, "n_active_sar": 27,
    "w_utah": 0.327, "w_nevada": 0.255, "w_montana": 0.245, "w_connecticut": 0.148,
}

# Site palette, dark navy theme — identical to the R post so the two read as a
# pair.
DARK_BG = "#0f1729"       # figure background
DARK_PANEL = "#1f2b5e"    # grid lines
LIGHT_TEXT = "#c8d0e0"    # axis text
LIGHTER_TEXT = "#e8ecf2"  # titles
MUTED = "#8b9dc3"         # captions, zero reference lines
GREY_DONOR = "#54618a"    # donor spaghetti
STEEL = "#6a9bcc"         # observed California, and the classical estimator
ORANGE = "#d97757"        # the R edition's reference values, negative spillovers
TEAL = "#00d4c8"          # the recommended estimator (SCSPILL / sar)
GOLD = "#e8b04b"          # a fourth series
VIOLET = "#c47ad0"        # a fifth

STAGE_COLORS = {
    "Classical SC": STEEL,
    "Bayesian SC (BSCM)": GOLD,
    "Bayesian SC (rho=0)": VIOLET,
    "Bayesian spatial SC": TEAL,
    "R edition": ORANGE,
}

DARK_RC = {
    "figure.facecolor": DARK_BG, "axes.facecolor": DARK_BG,
    "savefig.facecolor": DARK_BG, "savefig.edgecolor": DARK_BG,
    "figure.edgecolor": DARK_BG,
    "axes.edgecolor": DARK_PANEL, "axes.linewidth": 0,
    "axes.labelcolor": LIGHT_TEXT, "axes.titlecolor": LIGHTER_TEXT,
    "axes.titlesize": 13, "axes.titleweight": "bold",
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.spines.left": False, "axes.spines.bottom": False,
    "axes.grid": True, "grid.color": DARK_PANEL,
    "grid.linewidth": 0.6, "grid.alpha": 0.8, "grid.linestyle": "-",
    "text.color": LIGHT_TEXT, "xtick.color": LIGHT_TEXT, "ytick.color": LIGHT_TEXT,
    "xtick.major.size": 0, "ytick.major.size": 0,
    "legend.frameon": False, "legend.fontsize": 10,
    "legend.facecolor": DARK_BG, "legend.edgecolor": DARK_PANEL,
    "font.size": 11, "figure.dpi": 110,
}
plt.rcParams.update(DARK_RC)

# scspill wraps every figure it draws in its own house style, whose background
# is white. Three hooks are needed to override it:
#   (a) config-level, for result.plot(...)      -> the DARK_PLOT dict below
#   (b) module-level, for scspill.validation    -> these plotters accept no
#       theme argument, so the house style itself has to be mutated
#   (c) restyle_dark(fig) as belt and braces before every save
_scplot.SCSPILL_RC.update(DARK_RC)

# PlotConfig is extra="forbid", so a mistyped key raises at construction time
# rather than being silently ignored. These are its real field names.
DARK_PLOT = {
    "theme": DARK_RC,
    "observed_color": STEEL,
    "observed_linewidth": 2.0,
    "counterfactual_colors": [TEAL, GOLD, VIOLET],
    "intervention_color": MUTED,
    "display": False,
}

CACHE = Path("cache")
# Bump when the shape of a cached payload changes; old entries then fall out
# instead of being served with missing keys.
CACHE_SCHEMA = 2
FIGURES: list[str] = []
TABLES: list[str] = []
LADDER: list[dict] = []


def rule(txt: str) -> None:
    print("\n" + "=" * 78)
    print(txt)
    print("=" * 78)


def save_fig(fig, name: str, w: float = 9, h: float = 6, dpi: int = 300) -> None:
    fig.set_size_inches(w, h)
    fig.patch.set_linewidth(0)
    fname = f"{SLUG}_{name}.png"
    fig.savefig(fname, dpi=dpi, bbox_inches="tight", facecolor=DARK_BG,
                edgecolor=DARK_BG, pad_inches=0.02)
    plt.close(fig)
    FIGURES.append(fname)
    print(f"  [figure] {fname}")


def write_tab(df: pd.DataFrame, name: str) -> None:
    df.to_csv(f"{name}.csv", index=False)
    TABLES.append(f"{name}.csv")
    print(f"  [table]  {name}.csv  ({len(df)} rows x {df.shape[1]} cols)")


def caption(fig, text: str) -> None:
    fig.text(0.01, -0.02, textwrap.fill(text, 130), color=MUTED, fontsize=8.5,
             ha="left", va="top")


def restyle_dark(fig):
    """Force the site's dark theme onto a figure drawn by someone else's style."""
    fig.patch.set_facecolor(DARK_BG)
    fig.patch.set_linewidth(0)
    for ax in fig.get_axes():
        ax.set_facecolor(DARK_BG)
        for s in ax.spines.values():
            s.set_visible(False)
        ax.tick_params(colors=LIGHT_TEXT, length=0)
        ax.xaxis.label.set_color(LIGHT_TEXT)
        ax.yaxis.label.set_color(LIGHT_TEXT)
        ax.title.set_color(LIGHTER_TEXT)
        ax.grid(True, color=DARK_PANEL, lw=0.6, alpha=0.8)
        for t in ax.texts:
            t.set_color(LIGHT_TEXT)
        leg = ax.get_legend()
        if leg is not None:
            leg.set_frame_on(False)
            for t in leg.get_texts():
                t.set_color(LIGHT_TEXT)
    return fig


def as_fig(obj):
    """scspill's result.plot returns Axes; its validation plotters return Figures."""
    if obj is None:
        return plt.gcf()
    if hasattr(obj, "savefig"):
        return obj
    arr = np.ravel(np.asarray(obj, dtype=object))
    return arr[0].figure


def _jsonable(o):
    if isinstance(o, pd.DataFrame):
        return ["df", list(map(str, o.columns)), list(o.shape),
                hashlib.blake2b(pd.util.hash_pandas_object(o, index=True).values.tobytes(),
                                digest_size=8).hexdigest()]
    if isinstance(o, pd.Series):
        return ["sr", str(o.name), list(o.shape),
                hashlib.blake2b(pd.util.hash_pandas_object(o, index=True).values.tobytes(),
                                digest_size=8).hexdigest()]
    if isinstance(o, np.ndarray):
        return ["nd", list(o.shape), str(o.dtype),
                hashlib.blake2b(np.ascontiguousarray(o).tobytes(), digest_size=8).hexdigest()]
    if isinstance(o, (np.integer, np.floating, np.bool_)):
        return o.item()
    if callable(o) or isinstance(o, type):
        return f"{getattr(o, '__module__', '?')}.{getattr(o, '__qualname__', repr(o))}"
    return repr(o)


def fp(obj) -> str:
    """A stable 16-hex fingerprint of anything that can go in a cache key."""
    return hashlib.blake2b(
        json.dumps(obj, sort_keys=True, default=_jsonable).encode(),
        digest_size=8).hexdigest()


def _pkg_version(name: str) -> str | None:
    try:
        return importlib.metadata.version(name)
    except Exception:
        return None


def _mlsynth_sha() -> str:
    try:
        du = importlib.metadata.distribution("mlsynth").read_text("direct_url.json")
        return json.loads(du or "{}").get("vcs_info", {}).get("commit_id", "unknown")
    except Exception:
        return "unknown"


NUMBA_VERSION = _pkg_version("numba")
NUMPYRO_VERSION = _pkg_version("numpyro")
MLSYNTH_SHA = _mlsynth_sha()

try:
    BACKEND = _sckernels.resolve_backend(BACKEND_REQ).name
except Exception:
    BACKEND = "numpy"

# One environment fingerprint, computed once. A pin change invalidates every
# cached fit, which is the point: cached numbers from a different scspill are
# not this post's numbers.
ENV = {
    "schema": CACHE_SCHEMA,
    "python": platform.python_version(),
    "scspill": scspill.__version__,
    "mlsynth": f"{mlsynth.__version__}+{MLSYNTH_SHA[:12]}",
    "numpy": np.__version__, "pandas": pd.__version__,
    "scipy": scipy.__version__, "numba": NUMBA_VERSION,
    "backend": BACKEND, "jax_x64": os.environ.get("JAX_ENABLE_X64"),
    "seed": SEED,
}
ENV_KEY = fp(ENV)


def cached(name: str, spec: dict, fn: Callable):
    """Memoise fn() -> a plain-python payload under cache/.

    Deliberately caches EXTRACTED dicts, never the frozen pydantic result
    object: SCSPILLResults holds an (m_iter - burn, 38) alpha chain, so a whole
    object pickle runs to tens of megabytes and breaks on any class-layout
    change upstream. The extracted payloads are a few hundred kilobytes and
    survive a version bump.

    On pickle and trust: the only files unpickled here are ones this same
    script wrote, in a gitignored cache/ directory beside it. Nothing is
    fetched, downloaded or shared, so the usual arbitrary-code-execution
    concern with pickle does not apply. The cache is a speed optimisation and
    is safe to delete at any time; FORCE_REFIT=1 bypasses it entirely.
    """
    path = CACHE / f"{SLUG}_{name}_{ENV_KEY}_{fp(spec)}.pkl"
    if not FORCE_REFIT and path.exists():
        try:
            with path.open("rb") as fh:
                blob = pickle.load(fh)
            if blob.get("_schema") == CACHE_SCHEMA:
                print(f"  [cache] {name}  (took {blob['_seconds']:.1f}s when fitted)")
                return blob["value"]
            print(f"  [stale] {name}  (schema {blob.get('_schema')} != {CACHE_SCHEMA})")
        except Exception as exc:
            print(f"  [stale] {name}  (unreadable: {type(exc).__name__})")
    CACHE.mkdir(exist_ok=True)
    t0 = time.time()
    value = fn()
    dt = time.time() - t0
    with path.open("wb") as fh:
        pickle.dump({"_schema": CACHE_SCHEMA, "_env": ENV, "_spec": spec,
                     "_seconds": dt, "value": value}, fh, protocol=5)
    print(f"  [fit]   {name}  ({dt:.1f}s)")
    return value


def ladder(stage: str, engine: str, command: str, att: float,
           lo: float = np.nan, hi: float = np.nan, n_active: float = np.nan,
           rho_hat: float = np.nan, rho_ess: float = np.nan,
           r_reference: float = np.nan, note: str = "") -> None:
    LADDER.append(dict(stage=stage, engine=engine, command=command, att=att,
                       lo95=lo, hi95=hi, n_active=n_active, rho_hat=rho_hat,
                       rho_ess=rho_ess, r_reference=r_reference, note=note))


rule("0. Setup")
print(f"  python          {sys.version.split()[0]} ({platform.machine()}, {sys.platform})")
print(f"  scspill         {scspill.__version__}")
print(f"  mlsynth         {mlsynth.__version__}  @ {MLSYNTH_SHA[:12]}")
for _m in (np, pd, scipy, matplotlib):
    print(f"  {_m.__name__:<15s} {_m.__version__}")
print(f"  numba           {NUMBA_VERSION or 'not installed -> scspill falls back to numpy'}")
print(f"  numpyro         {NUMPYRO_VERSION or 'not installed -> 4 benchmark rows will error'}")
print(f"  scspill backend requested={BACKEND_REQ}  resolved={BACKEND}")
if BACKEND != "numba":
    print("  [WARN] the numpy backend is 5-6x slower; consider M_ITER=100000")
print(f"  BLAS threads    {os.environ.get('OMP_NUM_THREADS')}")
print(f"  JAX_ENABLE_X64  {os.environ.get('JAX_ENABLE_X64')}")
print(f"  seed            {SEED}")
print(f"  MCMC            m_iter={M_ITER:,}  burn={BURN:,}"
      f"  ({'headline' if M_ITER >= 100_000 else 'tutorial'})")
print(f"  FORCE_REFIT     {FORCE_REFIT}     APP_DATA {APP_DATA}")
print(f"  BENCH_TIER      {BENCH_TIER}      MC_SIMS {MC_SIMS}   MC_JOBS {MC_JOBS}")
print(f"  cache env key   {ENV_KEY}")
print(f"  mlsynth exports {len(mlsynth.__all__)} names; this post touches 10 estimators")

if scspill.__version__ != "0.2.1":
    print(f"  [WARN] this post's numbers were produced with scspill 0.2.1, "
          f"not {scspill.__version__}. Expect drift.")

# ══════════════════════════════════════════════════════════════════════════════
# 1. THE DATA
# ══════════════════════════════════════════════════════════════════════════════

rule("1. The data")

panel = load_california()
df = panel.df.copy()
donors = list(panel.spatial_W.index)
treated_unit = panel.treated_unit

print(f"  source          scspill.data.load_california()")
print(f"  description     {panel.description}")
print(f"  shape           {df.shape[0]} rows x {df.shape[1]} cols")
print(f"  units           {df['state'].nunique()} states  ({treated_unit} treated, "
      f"{len(donors)} donors)")
print(f"  period          {df['year'].min()}-{df['year'].max()} "
      f"({df['year'].nunique()} years)")
print(f"  outcome         {panel.outcome} (packs per capita per year)")
print(f"  covariates      {list(panel.covariates)}")
print(f"  treatment time  {panel.treatment_time}")
print(f"  treated rows    {int(df['treated'].sum())}")
print(f"  missing values  {int(df.isna().sum().sum())}")

T0 = int((df.loc[df["state"] == treated_unit, "year"] < TREAT_YEAR).sum())
T1 = int((df.loc[df["state"] == treated_unit, "year"] >= TREAT_YEAR).sum())
print(f"  pre / post      T0={T0}  T1={T1}")

# The shipped `treated` column is the thing every estimator conditions on, so
# rebuild it from the stated rule and assert the two agree. mlsynth's own
# Proposition 99 example uses year >= 1989 (the tax took effect 1 January 1989);
# scspill uses year >= 1988 (the R replication package's convention). Mixing
# them would silently give the three stages different post-periods.
rebuilt = ((df["state"] == treated_unit) & (df["year"] >= TREAT_YEAR)).astype(int)
assert (rebuilt.to_numpy() == df["treated"].to_numpy()).all(), \
    "the shipped treated column does not match year >= TREAT_YEAR"
print(f"  [check] treated == (state == '{treated_unit}') & (year >= {TREAT_YEAR})  OK")

write_tab(df, "source_data")

years = np.sort(df["year"].unique())
wide = df.pivot(index="year", columns="state", values="cigsale")
y_treated = wide[treated_unit].to_numpy()

fig, ax = plt.subplots()
for s in donors:
    ax.plot(years, wide[s], color=GREY_DONOR, lw=0.7, alpha=0.55)
ax.plot(years, y_treated, color=ORANGE, lw=2.6, label=treated_unit, zorder=5)
ax.axvline(TREAT_YEAR - 0.5, color=MUTED, ls="--", lw=1.2)
ax.annotate("Proposition 99", xy=(TREAT_YEAR - 0.5, 285), xytext=(TREAT_YEAR + 0.7, 285),
            color=LIGHTER_TEXT, fontsize=10, va="center")
ax.plot([], [], color=GREY_DONOR, lw=0.9, label=f"{len(donors)} donor states")
ax.set_xlabel("Year")
ax.set_ylabel("Cigarette sales (packs per capita)")
ax.set_title("California leaves the pack after 1988")
ax.legend(loc="upper right")
caption(fig, "Annual per-capita cigarette sales, 39 US states, 1970-2000. California "
             "(orange) is already declining before Proposition 99; the question the "
             "rest of this script answers is how much of the post-1988 decline the "
             "policy caused, and how much of the donor pool it contaminated.")
save_fig(fig, "01_panel_paths", 9.5, 6)

# ══════════════════════════════════════════════════════════════════════════════
# 2. THE SPATIAL STRUCTURE
# ══════════════════════════════════════════════════════════════════════════════

rule("2. The spatial structure")

W = panel.spatial_W.loc[donors, donors]
w = panel.spatial_w.reindex(donors)

print(f"  spatial_W       {W.shape}  donor-to-donor rook contiguity")
print(f"  spatial_w       ({len(w)},)  each donor's exposure to {treated_unit}")
print(f"  symmetric       {bool(np.allclose(W.values, W.values.T))}")
print(f"  zero diagonal   {bool(np.allclose(np.diag(W.values), 0))}")

degree = W.sum(axis=1)
print(f"  degree          min={degree.min():.0f} max={degree.max():.0f} "
      f"mean={degree.mean():.2f}")
nbrs = w[w > 0]
print(f"  {treated_unit}'s neighbours in the donor pool: {dict(nbrs.round(3))}")
print("  Oregon and Arizona border California but are not in the ADH donor pool,")
print("  so rook contiguity leaves exactly one channel out of the treated state.")

# Row-normalisation happens inside the estimator; recompute it here only to
# report the admissible support for rho that the sampler will use.
Wn = W.values.astype(float).copy()
np.fill_diagonal(Wn, 0.0)
rs = Wn.sum(axis=1)
Wn[rs > 0] /= rs[rs > 0, None]
eig = np.linalg.eigvals(Wn)
max_abs_eig = float(np.max(np.abs(eig)))
rho_bound = 0.95 / max(1.0, max_abs_eig)
print(f"  max |eig(Wn)|   {max_abs_eig:.4f}")
print(f"  rho support     |rho| < {rho_bound:.4f}")

spatial_summary = pd.DataFrame({
    "state": donors,
    "degree": degree.reindex(donors).to_numpy(),
    "w_california": w.to_numpy(),
    "neighbours": [", ".join(sorted(W.columns[W.loc[s] > 0])) for s in donors],
})
write_tab(spatial_summary, "spatial_weights_summary")
write_tab(W.rename_axis("state").reset_index(), "spatial_W")

order = list(degree.sort_values(ascending=False).index)
fig, axes = plt.subplots(1, 3, figsize=(13.5, 4.4))
axes[0].imshow(W.loc[order, order].values, cmap="mako" if False else "viridis",
               interpolation="nearest", aspect="auto")
axes[0].set_title("Rook contiguity among donors")
axes[0].set_xticks([]); axes[0].set_yticks([])
axes[0].grid(False)

cols = [ORANGE if s in nbrs.index else STEEL for s in order]
axes[1].barh(range(len(order)), degree.reindex(order).to_numpy(), color=cols)
axes[1].set_yticks(range(len(order)))
axes[1].set_yticklabels(order, fontsize=5.5)
axes[1].invert_yaxis()
axes[1].set_xlabel("Number of neighbours")
axes[1].set_title(f"Degree ({', '.join(nbrs.index)} in orange)")

axes[2].plot(np.sort(np.real(eig)), "o", ms=3.5, color=TEAL)
axes[2].axhspan(-rho_bound, rho_bound, color=STEEL, alpha=0.16)
axes[2].axhline(0, color=MUTED, lw=0.8)
axes[2].set_xlabel("Index")
axes[2].set_ylabel("Re(eigenvalue)")
axes[2].set_title(f"Spectrum of $W_n$; $|\\rho| < {rho_bound:.3f}$")
fig.tight_layout()
caption(fig, f"The two spatial objects the SAR layer needs. W (left, right) is "
             f"donor-to-donor contiguity; the shaded band (right) is the stability "
             f"region the Metropolis step for rho is confined to. {', '.join(nbrs.index)} "
             f"is the only donor that touches California.")
save_fig(fig, "02_spatial_structure", 13.5, 4.4)

# ══════════════════════════════════════════════════════════════════════════════
# 3. STAGE 1 — CLASSICAL SIMPLEX SYNTHETIC CONTROL
# ══════════════════════════════════════════════════════════════════════════════

rule("3. Stage 1 — classical simplex synthetic control (Abadie et al. 2010)")

MLS_COMMON = dict(df=df, outcome="cigsale", treat="treated", unitid="state",
                  time="year", display_graphs=False)

t0 = time.time()
sc = mlsynth.VanillaSC({**MLS_COMMON}).fit()
print(f"  mlsynth.VanillaSC fitted in {time.time() - t0:.2f}s")

w_sc = pd.Series(sc.donor_weights, dtype=float).reindex(donors).fillna(0.0)
active_sc = w_sc[w_sc > 1e-4]
att_sc = float(sc.att)
print(f"  ATT             {att_sc:.4f} packs per capita per year")
print(f"  pre-treatment RMSE {sc.pre_rmse:.4f}   R^2 {sc.fit_diagnostics.r_squared_pre:.4f}")
print(f"  weights sum     {w_sc.sum():.6f}   active donors (>1e-4): {len(active_sc)}")
print("  donor weights:")
for s, v in active_sc.sort_values(ascending=False).items():
    print(f"     {s:<16s} {v:.4f}")
print(f"  top-4 share     {active_sc.sort_values(ascending=False).head(4).sum():.4f}")
print(f"  [R edition]     ATT {R_EDITION['att_classical']:.2f}; Utah "
      f"{R_EDITION['w_utah']:.3f} Nevada {R_EDITION['w_nevada']:.3f} "
      f"Montana {R_EDITION['w_montana']:.3f} Connecticut {R_EDITION['w_connecticut']:.3f}")

cf_sc = np.asarray(sc.time_series.counterfactual_outcome, dtype=float).ravel()
gap_sc = y_treated - cf_sc

# The R post bootstraps the post-period gap 2000 times; do the same, with the
# same seed, so the two intervals are comparable.
boot_rng = np.random.default_rng(SEED)
post_mask = years >= TREAT_YEAR
gap_post = gap_sc[post_mask]
boot = np.array([boot_rng.choice(gap_post, size=gap_post.size, replace=True).mean()
                 for _ in range(2000)])
att_sc_lo, att_sc_hi = np.quantile(boot, [0.025, 0.975])
print(f"  bootstrap 95% CI [{att_sc_lo:.4f}, {att_sc_hi:.4f}]  (2000 replicates)")

write_tab(pd.DataFrame({
    "state": donors,
    "weight": w_sc.to_numpy(),
    "r_tidysynth": [R_EDITION.get(f"w_{s.lower().replace(' ', '_')}", np.nan) for s in donors],
}), "stage1_weights")
write_tab(pd.DataFrame({
    "year": years, "observed": y_treated, "synthetic": cf_sc, "gap": gap_sc,
    "period": np.where(post_mask, "post", "pre"),
}), "stage1_gap")

ladder("1. Classical SC", "mlsynth", "VanillaSC(cfg).fit()", att_sc,
       att_sc_lo, att_sc_hi, len(active_sc),
       r_reference=R_EDITION["att_classical"],
       note="simplex constraint; weights non-negative and sum to one")

fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True, gridspec_kw={"height_ratios": [2, 1]})
ax1.plot(years, y_treated, color=STEEL, lw=2.2, label=f"{treated_unit} (observed)")
ax1.plot(years, cf_sc, color=TEAL, lw=2.0, ls="--", label="Synthetic California")
ax1.axvline(TREAT_YEAR - 0.5, color=MUTED, ls="--", lw=1.1)
ax1.set_ylabel("Packs per capita")
ax1.set_title("Stage 1: the simplex fits the pre-period well and diverges after 1988")
ax1.legend(loc="upper right")
ax2.plot(years, gap_sc, color=ORANGE, lw=2.0)
ax2.axhline(0, color=MUTED, lw=1.0)
ax2.axvline(TREAT_YEAR - 0.5, color=MUTED, ls="--", lw=1.1)
ax2.fill_between(years, gap_sc, 0, where=post_mask, color=ORANGE, alpha=0.18)
ax2.set_xlabel("Year")
ax2.set_ylabel("Gap")
caption(fig, f"Classical synthetic control. ATT = {att_sc:.2f} packs per capita per "
             f"year against the R edition's {R_EDITION['att_classical']:.2f}. "
             f"Pre-treatment RMSE {sc.pre_rmse:.2f} on an outcome averaging about "
             f"{y_treated[:T0].mean():.0f} packs.")
save_fig(fig, "03_stage1_fit_gap", 9, 8)

srt = active_sc.sort_values(ascending=False)
fig, ax = plt.subplots()
ax.bar(range(len(srt)), srt.to_numpy(), color=STEEL)
ax.set_xticks(range(len(srt)))
ax.set_xticklabels(srt.index, rotation=25, ha="right")
ax.set_ylabel("Weight")
ax.set_title(f"The simplex puts all the weight on {len(srt)} of {len(donors)} donors")
for i, (s, v) in enumerate(srt.items()):
    ax.text(i, v + 0.006, f"{v:.3f}", ha="center", color=LIGHT_TEXT, fontsize=9)
caption(fig, f"{len(srt)} of {len(donors)} donors carry the entire synthetic control; "
             f"the remaining {len(donors) - len(srt)} receive exactly zero. That "
             f"sparsity is the constraint talking, not the data. Stage 2 asks what "
             f"happens when the constraint is replaced by a prior.")
save_fig(fig, "04_stage1_weights", 9, 5.5)

# ══════════════════════════════════════════════════════════════════════════════
# 4. STAGE 2a — BAYESIAN SYNTHETIC CONTROL WITH mlsynth.BSCM
# ══════════════════════════════════════════════════════════════════════════════

rule("4. Stage 2a — Bayesian synthetic control (mlsynth.BSCM, horseshoe prior)")

BSCM_ITER, BSCM_BURN, BSCM_CHAINS = 20000, 10000, 4


def _fit_bscm(prior: str) -> dict:
    r = mlsynth.BSCM({**MLS_COMMON, "prior": prior, "n_iter": BSCM_ITER,
                      "burn_in": BSCM_BURN, "chains": BSCM_CHAINS,
                      "seed": SEED}).fit()
    post = getattr(r, "posterior", None)
    ci = getattr(r, "att_ci", None)
    weights = dict(getattr(r, "donor_weights", {}) or {})

    # The posterior arrays are in mlsynth's internal donor order, which is not
    # guaranteed to match scspill's spatial_W index. Align by name through
    # donor_weights (an insertion-ordered dict in mlsynth's own order); fall
    # back to NaN rather than silently mislabelling a donor.
    names = list(weights.keys())
    nan_d = np.full(len(donors), np.nan)

    def _align(vec) -> np.ndarray:
        vec = np.asarray(vec, dtype=float).ravel()
        if vec.size == len(names):
            return pd.Series(vec, index=names).reindex(donors).to_numpy()
        return nan_d

    def _summarise(arr) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """mlsynth stores chains as (n_donors, n_draws), not (n_draws, n_donors).
        Collapse whichever axis is NOT the donor axis rather than assuming."""
        if arr is None:
            return nan_d, nan_d, nan_d
        arr = np.asarray(arr, dtype=float)
        # The horseshoe prior has no `gamma`, and what it does expose can be
        # scalar or absent; only a genuine 2-D chain is summarisable.
        if arr.ndim < 2 or arr.size == 0:
            return nan_d, nan_d, nan_d
        arr = arr.reshape(arr.shape[0], -1) if arr.shape[0] == len(names) \
            else arr.reshape(-1, arr.shape[-1]).T
        if arr.shape[0] != len(names):
            return nan_d, nan_d, nan_d
        return (_align(arr.mean(axis=1)),
                _align(np.quantile(arr, 0.025, axis=1)),
                _align(np.quantile(arr, 0.975, axis=1)))

    beta_mean, beta_lo, beta_hi = _summarise(getattr(post, "beta", None))
    beta0 = np.asarray(getattr(post, "beta0", []), dtype=float).ravel()
    # The spike-and-slab prior exposes its inclusion indicators as `gamma`;
    # their posterior mean IS P(donor in the model).
    gamma_mean, _, _ = _summarise(getattr(post, "gamma", None))

    return dict(
        att=float(r.att),
        att_ci=(float(ci[0]), float(ci[1])) if ci is not None else (np.nan, np.nan),
        weights=weights, posterior_donor_order=names,
        beta_mean=beta_mean, beta_lo=beta_lo, beta_hi=beta_hi,
        beta0_mean=float(beta0.mean()) if beta0.size else np.nan,
        inclusion=gamma_mean,
        counterfactual=np.asarray(r.time_series.counterfactual_outcome, float).ravel(),
        pre_rmse=float(r.pre_rmse),
    )


bscm = cached("bscm_horseshoe",
              dict(prior="horseshoe", n_iter=BSCM_ITER, burn=BSCM_BURN,
                   chains=BSCM_CHAINS, seed=SEED),
              lambda: _fit_bscm("horseshoe"))
bscm_ss = cached("bscm_spikeslab",
                 dict(prior="spike_slab", n_iter=BSCM_ITER, burn=BSCM_BURN,
                      chains=BSCM_CHAINS, seed=SEED),
                 lambda: _fit_bscm("spike_slab"))

w_bscm = pd.Series(bscm["weights"], dtype=float).reindex(donors).fillna(0.0)
n_active_bscm = int((w_bscm.abs() > 0.01).sum())
print(f"  ATT             {bscm['att']:.4f}  95% CrI "
      f"[{bscm['att_ci'][0]:.4f}, {bscm['att_ci'][1]:.4f}]")
print(f"  pre-treatment RMSE {bscm['pre_rmse']:.4f}")
print(f"  weights sum     {w_bscm.sum():.4f}   active donors (|w|>0.01): {n_active_bscm}")
print(f"  intercept       beta0 posterior mean = {bscm['beta0_mean']:.4f}")
print("  BSCM (Kim, Lee & Gupta 2020) fits WITH an explicit intercept, so its")
print("  weights are not required to sum to one and are not comparable, term by")
print("  term, with either the simplex weights or scspill's alpha. Section 6")
print("  quantifies what that intercept is worth.")
print("  top donors by |posterior mean|:")
_top_b = w_bscm.reindex(w_bscm.abs().sort_values(ascending=False).index).head(6)
for s, v in _top_b.items():
    print(f"     {s:<16s} {v:+.4f}")
print(f"  [spike-and-slab] ATT {bscm_ss['att']:.4f}  "
      f"[{bscm_ss['att_ci'][0]:.4f}, {bscm_ss['att_ci'][1]:.4f}]")
_incl = np.asarray(bscm_ss["inclusion"], dtype=float)
if np.isfinite(_incl).any():
    print(f"  [spike-and-slab] donors with P(inclusion) > 0.5: "
          f"{int((_incl > 0.5).sum())}")

print(f"  [R edition]      Stage 2 horseshoe ATT {R_EDITION['att_horseshoe']:.2f} "
      f"[{R_EDITION['att_horseshoe_lo']:.2f}, {R_EDITION['att_horseshoe_hi']:.2f}]")

write_tab(pd.DataFrame({
    "state": donors, "mean": bscm["beta_mean"], "lo95": bscm["beta_lo"],
    "hi95": bscm["beta_hi"], "weight": w_bscm.to_numpy(),
    "inclusion_prob": _incl,
}), "stage2_bscm_posterior")

ladder("2a. Bayesian SC (BSCM)", "mlsynth", 'BSCM(prior="horseshoe").fit()',
       bscm["att"], bscm["att_ci"][0], bscm["att_ci"][1], n_active_bscm,
       note="horseshoe prior on unconstrained weights, WITH an intercept")

_ordb = list(w_bscm.reindex(w_bscm.abs().sort_values(ascending=False).index).index)[:24]
fig, ax = plt.subplots()
ypos = np.arange(len(_ordb))
mean_b = w_bscm.reindex(_ordb).to_numpy()
idx = [donors.index(s) for s in _ordb]
lo_b, hi_b = bscm["beta_lo"][idx], bscm["beta_hi"][idx]
ax.errorbar(mean_b, ypos, xerr=[mean_b - lo_b, hi_b - mean_b], fmt="o", ms=4.5,
            color=GOLD, ecolor=MUTED, elinewidth=1.1, capsize=0)
ax.axvline(0, color=MUTED, lw=1.0)
ax.set_yticks(ypos)
ax.set_yticklabels(_ordb, fontsize=7.5)
ax.invert_yaxis()
ax.set_xlabel("Posterior weight")
ax.set_title("Stage 2: the horseshoe lets a few donors escape zero")
caption(fig, "Posterior mean donor weight with 95% credible intervals, top 24 by "
             "magnitude, from mlsynth.BSCM. Unlike the simplex, weights may be "
             "negative; unlike a flat prior, the overwhelming majority are shrunk "
             "hard toward zero.")
save_fig(fig, "05_stage2_horseshoe_weights", 8.5, 9)

# ══════════════════════════════════════════════════════════════════════════════
# 5. STAGE 3 — BAYESIAN SPATIAL SYNTHETIC CONTROL (scspill, method="sar")
# ══════════════════════════════════════════════════════════════════════════════

rule('5. Stage 3 — Bayesian spatial synthetic control (scspill, method="sar")')

from scspill.utils.scspill_helpers.sar.effects import treated_counterfactual

SC_BASE = {**panel.config_kwargs(), "display_graphs": False, "backend": BACKEND_REQ,
           "seed": SEED, "plot": DARK_PLOT, "ci": CI_LEVEL}

# Effects are a Python loop over retained draws, so at 250k kept draws the
# sweep would dominate the fit. Thinning to 5000 evenly spaced draws leaves the
# ATT unchanged and only adds Monte Carlo error to the interval's tails.
MAX_EFFECT_DRAWS = 5000


def _extract(res) -> dict:
    e, s, inp = res.effects_detail, res.sar_posterior, res.inputs
    rho = np.asarray(s.rho, dtype=np.float32).ravel()
    thin = max(1, rho.size // 20000)
    alpha_draws = np.asarray(res.alpha_posterior.draws, dtype=float)
    return dict(
        att=float(res.att), att_ci=(float(res.att_ci[0]), float(res.att_ci[1])),
        att_plugin=float(e.att_plugin), att_scm=float(e.att_scm),
        n_draws_used=int(e.n_draws_used),
        rho_hat=float(res.rho_hat), rho_ci=(float(res.rho_ci[0]), float(res.rho_ci[1])),
        rho_ess=float(res.rho_ess), acc_rho=float(res.acc_rho),
        rho_draws=rho[::thin], rho_thin=thin,
        step_rho_final=float(s.step_rho_final), rho_bound=float(s.rho_bound),
        beta_prior=str(s.beta_prior), p_factors=int(s.p_factors),
        iters=int(s.iters), burn=int(s.burn),
        alpha_hat=np.asarray(res.alpha_hat, dtype=float),
        alpha_mean=alpha_draws.mean(axis=0),
        alpha_lo=np.quantile(alpha_draws, 0.025, axis=0),
        alpha_hi=np.quantile(alpha_draws, 0.975, axis=0),
        cf_mean=np.asarray(e.cf_mean, float), cf_lower=np.asarray(e.cf_lower, float),
        cf_upper=np.asarray(e.cf_upper, float),
        cf_rho0=treated_counterfactual(inp.Y0, inp.Yc, inp.Wn, inp.wn,
                                       res.alpha_hat, 0.0),
        spill_mean=np.asarray(e.spill_mean, float),
        spill_lower=np.asarray(e.spill_lower, float),
        spill_upper=np.asarray(e.spill_upper, float),
        spillover_panel=res.spillover_panel.copy(),
        scm_weights=dict(res.scm_weights or {}),
        pre_rmse=float(res.pre_rmse),
        control_labels=list(inp.control_labels), time_labels=np.asarray(inp.time_labels),
        T0=int(inp.T0), N=int(inp.N), K=int(inp.K),
        Y0=np.asarray(inp.Y0, dtype=float), Yc=np.asarray(inp.Yc, dtype=float),
        X=None if inp.X is None else np.asarray(inp.X, dtype=float),
        Wn=np.asarray(inp.Wn, dtype=float), wn=np.asarray(inp.wn, dtype=float),
        W_raw=np.asarray(inp.W_raw, dtype=float), w_raw=np.asarray(inp.w_raw, dtype=float),
        diagnostics=res.diagnostics(top_n_alpha=6),
        mcmc_summary=res.mcmc_summary_table,
    )


class ScspillFit(NamedTuple):
    """One scspill fit, with its two halves named.

    `payload` is the plain-dict extract that `cached()` pickles. `live` is the
    frozen pydantic result, which is 20-40 MB and version-fragile, so it is
    never cached -- it exists only for the native `result.plot(...)` figures
    and is therefore unavailable on a cache hit.
    """
    payload: dict
    live: Any


def _fit_scspill(**kw) -> ScspillFit:
    res = SCSPILL({**SC_BASE, **kw}).fit()
    return ScspillFit(_extract(res), res)


SAR_SPEC = dict(m_iter=M_ITER, burn=BURN, max_effect_draws=MAX_EFFECT_DRAWS,
                seed=SEED, backend=BACKEND, spec="corrected")
_live_sar = None


def _fit_sar_cached():
    # `cached()` calls this only on a miss, which makes it the one place the
    # live result can be captured. The module global is structural, not
    # incidental: the callback signature is fixed by cached(), and the live
    # object cannot travel through the pickle it returns.
    global _live_sar
    fit = _fit_scspill(m_iter=M_ITER, burn=BURN,
                       max_effect_draws=MAX_EFFECT_DRAWS)
    _live_sar = fit.live
    return fit.payload


sar = cached("sar_corrected", SAR_SPEC, _fit_sar_cached)

print(f"  configuration   m_iter={sar['iters']:,}  burn={sar['burn']:,}  "
      f"beta_prior={sar['beta_prior']}  p_factors={sar['p_factors']}")
print(f"  ATT             {sar['att']:.4f}  95% CrI "
      f"[{sar['att_ci'][0]:.4f}, {sar['att_ci'][1]:.4f}]  "
      f"(width {sar['att_ci'][1] - sar['att_ci'][0]:.2f})")
print(f"  ATT (plug-in)   {sar['att_plugin']:.4f}   effect draws used: {sar['n_draws_used']:,}")
print(f"  ATT at rho = 0  {sar['att_scm']:.4f}   <- the no-spillover comparator")
print(f"  rho             {sar['rho_hat']:.4f}  95% CrI "
      f"[{sar['rho_ci'][0]:.4f}, {sar['rho_ci'][1]:.4f}]")
print(f"  ESS(rho)        {sar['rho_ess']:.1f}   acceptance {sar['acc_rho']:.3f} "
      f"(target 0.44)   final step {sar['step_rho_final']:.5f}")
print(f"  rho support     |rho| < {sar['rho_bound']:.4f}")
print(f"  pre-treatment RMSE {sar['pre_rmse']:.4f}")
if sar["rho_ess"] < 100:
    print("  [WARN] ESS(rho) < 100: the rho interval is not publication grade.")
print(f"  [R edition]     ATT {R_EDITION['att_sar']:.2f} "
      f"[{R_EDITION['att_sar_lo']:.3f}, {R_EDITION['att_sar_hi']:.3f}], "
      f"rho {R_EDITION['rho_hat']:.4f}, ESS {R_EDITION['rho_ess']:.2f}")
print("\n  posterior summary (scspill's own diagnostics table):")
print(textwrap.indent(sar["diagnostics"].round(4).to_string(), "    "))

alpha_active = int((np.abs(sar["alpha_hat"]) > 0.01).sum())
print(f"\n  active donors (|alpha| > 0.01): {alpha_active}")

write_tab(pd.DataFrame({
    "quantity": ["att", "att_plugin", "att_scm", "rho_hat", "rho_ess", "acc_rho",
                 "step_rho_final", "rho_bound", "pre_rmse", "m_iter", "burn",
                 "n_draws_used", "n_active_alpha"],
    "value": [sar["att"], sar["att_plugin"], sar["att_scm"], sar["rho_hat"],
              sar["rho_ess"], sar["acc_rho"], sar["step_rho_final"], sar["rho_bound"],
              sar["pre_rmse"], sar["iters"], sar["burn"], sar["n_draws_used"],
              alpha_active],
    "lo95": [sar["att_ci"][0], np.nan, np.nan, sar["rho_ci"][0]] + [np.nan] * 9,
    "hi95": [sar["att_ci"][1], np.nan, np.nan, sar["rho_ci"][1]] + [np.nan] * 9,
}), "stage3_summary")

write_tab(pd.DataFrame({
    "state": donors, "alpha_hat": sar["alpha_hat"], "mean": sar["alpha_mean"],
    "lo95": sar["alpha_lo"], "hi95": sar["alpha_hi"],
}), "stage2_alpha_posterior")

_tl = sar["time_labels"]
write_tab(pd.DataFrame({
    "year": _tl, "observed": y_treated,
    "cf_mean": sar["cf_mean"], "cf_lower": sar["cf_lower"], "cf_upper": sar["cf_upper"],
    "cf_rho0": sar["cf_rho0"],
    "gap": y_treated - sar["cf_mean"],
    "period": np.where(_tl >= TREAT_YEAR, "post", "pre"),
}), "stage3_gap")

ladder("3. Bayesian spatial SC", "scspill", 'SCSPILL(method="sar").fit()',
       sar["att"], sar["att_ci"][0], sar["att_ci"][1], alpha_active,
       sar["rho_hat"], sar["rho_ess"], R_EDITION["att_sar"],
       note="SAR layer on donor outcomes; SUTVA on the donor pool dropped")

# --- native package figures -------------------------------------------------
# These are the point of a Python-package post: what the library draws for you.
# They need the live result object, so they are skipped on a cache hit unless
# the PNG is missing.
def _need(fig_name: str) -> bool:
    return not Path(f"{SLUG}_{fig_name}.png").exists()


if _live_sar is None and (_need("07_stage3_panel") or _need("08_stage3_weights")
                          or _need("09_rho_posterior")):
    print("  [refit] native figures need the live result object; refitting once")
    _live_sar = SCSPILL({**SC_BASE, "m_iter": M_ITER, "burn": BURN,
                         "max_effect_draws": MAX_EFFECT_DRAWS}).fit()

if _live_sar is not None:
    ax = _live_sar.plot(kind="panel")
    save_fig(restyle_dark(as_fig(ax)), "07_stage3_panel", 16, 4.8)

    ax = _live_sar.plot(kind="weights", top_n=14)
    save_fig(restyle_dark(as_fig(ax)), "08_stage3_weights", 9.5, 5.8)

    fig, (axa, axb) = plt.subplots(1, 2, figsize=(11, 4.4))
    _live_sar.plot(kind="rho", ax=axa)
    _live_sar.plot(kind="trace", ax=axb)
    axa.set_title(r"Posterior of $\rho$")
    axb.set_title(r"$\rho$ trace")
    axa.text(0.03, 0.95,
             f"$\\hat\\rho$ = {sar['rho_hat']:.3f}\n"
             f"95% CrI [{sar['rho_ci'][0]:.3f}, {sar['rho_ci'][1]:.3f}]\n"
             f"ESS = {sar['rho_ess']:.0f}\nacc = {sar['acc_rho']:.3f}",
             transform=axa.transAxes, va="top", ha="left", color=LIGHTER_TEXT,
             fontsize=9)
    fig.tight_layout()
    save_fig(restyle_dark(fig), "09_rho_posterior", 11, 4.4)
else:
    print("  [skip] native figures — served from cache, PNGs already present")

# ══════════════════════════════════════════════════════════════════════════════
# 6. STAGE 2b — THE rho = 0 SPECIAL CASE, AND WHAT AN INTERCEPT IS WORTH
# ══════════════════════════════════════════════════════════════════════════════

rule("6. Stage 2b — the rho = 0 case, read off the Stage-3 fit")

print("  scspill has no `rho` argument: rho is estimated, not set. But the model")
print("  collapses EXACTLY to a Bayesian horseshoe synthetic control at rho = 0,")
print("  and scspill exposes that case directly, so Stage 2b costs no extra MCMC:")
print("     result.effects_detail.att_scm")
print("     treated_counterfactual(Y0, Yc, Wn, wn, alpha_hat, rho=0.0)")

att_rho0 = sar["att_scm"]
print(f"\n  ATT at rho = 0  {att_rho0:.4f}")
print(f"  ATT at rho-hat  {sar['att']:.4f}   (difference "
      f"{sar['att'] - att_rho0:+.4f})")

cmp2 = pd.DataFrame([
    dict(method="Classical SC (simplex)", engine="mlsynth.VanillaSC",
         att=att_sc, lo95=att_sc_lo, hi95=att_sc_hi,
         intercept=0.0, weight_sum=float(w_sc.sum()),
         n_active=len(active_sc), r_reference=R_EDITION["att_classical"],
         note="weights on the simplex"),
    dict(method="Bayesian SC (BSCM)", engine="mlsynth.BSCM",
         att=bscm["att"], lo95=bscm["att_ci"][0], hi95=bscm["att_ci"][1],
         intercept=bscm["beta0_mean"], weight_sum=float(w_bscm.sum()),
         n_active=n_active_bscm, r_reference=np.nan,
         note="horseshoe WITH an explicit intercept"),
    dict(method="Bayesian SC (scspill, rho = 0)", engine="scspill.SCSPILL",
         att=att_rho0, lo95=np.nan, hi95=np.nan,
         intercept=0.0, weight_sum=float(sar["alpha_hat"].sum()),
         n_active=alpha_active, r_reference=R_EDITION["att_horseshoe"],
         note="horseshoe WITHOUT an intercept; standardised"),
    dict(method="Bayesian spatial SC", engine="scspill.SCSPILL",
         att=sar["att"], lo95=sar["att_ci"][0], hi95=sar["att_ci"][1],
         intercept=0.0, weight_sum=float(sar["alpha_hat"].sum()),
         n_active=alpha_active, r_reference=R_EDITION["att_sar"],
         note="SAR layer active"),
])
print("\n" + textwrap.indent(cmp2.round(4).to_string(index=False), "  "))
write_tab(cmp2, "stage2_comparison")

print(f"\n  The two Bayesian synthetic controls disagree by "
      f"{abs(bscm['att'] - att_rho0):.2f} packs. They are not the same model:")
print(f"  BSCM carries an intercept whose posterior mean is {bscm['beta0_mean']:.2f} "
      f"packs and its")
print(f"  weights sum to {w_bscm.sum():.3f}, not 1; scspill's Step 1 has no intercept.")
print(f"  scspill's rho = 0 case reproduces the R edition's Stage 2 "
      f"({R_EDITION['att_horseshoe']:.2f}) to "
      f"{abs(att_rho0 - R_EDITION['att_horseshoe']):.2f} packs.")

ladder("2b. Bayesian SC (rho = 0)", "scspill",
       "result.effects_detail.att_scm", att_rho0,
       n_active=alpha_active, r_reference=R_EDITION["att_horseshoe"],
       note="the SAR model's rho = 0 special case; no extra MCMC")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.6),
                               gridspec_kw={"width_ratios": [2, 1]})
ax1.plot(years, y_treated, color=STEEL, lw=2.3, label="California (observed)")
ax1.plot(years, cf_sc, color=MUTED, lw=1.7, ls=":", label="Classical simplex")
ax1.plot(years, bscm["counterfactual"], color=GOLD, lw=1.9, ls="--",
         label="Bayesian SC (BSCM)")
ax1.plot(_tl, sar["cf_rho0"], color=VIOLET, lw=1.9, ls="-.",
         label=r"Bayesian SC (scspill, $\rho=0$)")
ax1.plot(_tl, sar["cf_mean"], color=TEAL, lw=2.3, label="Bayesian spatial SC")
ax1.fill_between(_tl, sar["cf_lower"], sar["cf_upper"], color=TEAL, alpha=0.15)
ax1.axvline(TREAT_YEAR - 0.5, color=MUTED, ls="--", lw=1.1)
ax1.set_xlabel("Year"); ax1.set_ylabel("Packs per capita")
ax1.set_title("Four counterfactual Californias")
ax1.legend(loc="lower left", fontsize=8.5)

rows = cmp2.iloc[::-1]
ypos = np.arange(len(rows))
for i, (_, r) in enumerate(rows.iterrows()):
    col = STAGE_COLORS.get(
        {"Classical SC (simplex)": "Classical SC",
         "Bayesian SC (BSCM)": "Bayesian SC (BSCM)",
         "Bayesian SC (scspill, rho = 0)": "Bayesian SC (rho=0)",
         "Bayesian spatial SC": "Bayesian spatial SC"}[r["method"]], STEEL)
    if np.isfinite(r["lo95"]):
        ax2.plot([r["lo95"], r["hi95"]], [i, i], color=col, lw=2.2, alpha=0.75)
    ax2.plot(r["att"], i, "o", ms=8, color=col)
    if np.isfinite(r["r_reference"]):
        ax2.plot(r["r_reference"], i, "D", ms=6, mfc="none", mec=ORANGE, mew=1.6)
ax2.set_yticks(ypos)
ax2.set_yticklabels([m.replace(" (", "\n(") for m in rows["method"]], fontsize=8)
ax2.axvline(0, color=MUTED, lw=1.0)
ax2.set_xlabel("ATT (packs per capita)")
ax2.set_title("Point estimates and intervals")
ax2.plot([], [], "D", mfc="none", mec=ORANGE, mew=1.6, label="R edition")
ax2.legend(loc="lower left", fontsize=8)
fig.tight_layout()
caption(fig, "Every estimator agrees California's sales fell; they disagree about "
             "which counterfactual to compare against. The BSCM path sits apart "
             "because it fits an intercept the other three do not. Hollow diamonds "
             "are the R edition's published values.")
save_fig(fig, "06_stage2_two_bayesian", 13, 5.6)

# ══════════════════════════════════════════════════════════════════════════════
# 7. THE SPILLOVER RECEIVED BY EACH DONOR
# ══════════════════════════════════════════════════════════════════════════════

rule("7. The spillover received by each donor")

spill_panel = sar["spillover_panel"]
spill_post = spill_panel.loc[TREAT_YEAR:]
spill_mean = spill_post.mean()
spill_rank = spill_mean.reindex(spill_mean.abs().sort_values(ascending=False).index)

print("  spillover_panel = Yc - Yc(0): observed donor outcome minus its")
print("  no-treatment counterfactual. Negative = the donor sold FEWER packs than")
print("  it would have without Proposition 99.")
print(f"  panel shape     {spill_panel.shape}  (years x donors)")
print(f"  post-1988 rows  {spill_post.shape[0]}")
print("\n  top 8 donors by mean post-1988 |spillover|:")
# An empty float Series, not None: `.reindex(donors)` then yields the all-NaN
# fallback for free, and `s in _lo.index` is simply False.
_lo = (pd.Series(sar["spill_lower"], index=donors)
       if np.size(sar["spill_lower"]) == len(donors) else pd.Series(dtype=float))
_hi = (pd.Series(sar["spill_upper"], index=donors)
       if np.size(sar["spill_upper"]) == len(donors) else pd.Series(dtype=float))
for s, v in spill_rank.head(8).items():
    band = ""
    if s in _lo.index:
        band = f"   95% CrI [{_lo[s]:+.4f}, {_hi[s]:+.4f}]"
    print(f"     {s:<16s} {v:+.4f}{band}")

top1, top2 = spill_rank.index[0], spill_rank.index[1]
ratio = float(abs(spill_rank.iloc[0]) / max(abs(spill_rank.iloc[1]), 1e-12))
print(f"\n  {top1} absorbs {ratio:.1f}x the next-largest donor ({top2}).")
print(f"  [R edition]  Nevada {R_EDITION['spill_nevada']:.2f}, "
      f"Idaho {R_EDITION['spill_idaho']:.3f}")

_lov = _lo.reindex(donors).to_numpy()
_hiv = _hi.reindex(donors).to_numpy()
write_tab(pd.DataFrame({
    "state": donors,
    "avg_spillover": spill_mean.reindex(donors).to_numpy(),
    "lo95": _lov, "hi95": _hiv,
    "degree": degree.reindex(donors).to_numpy(),
    "w_california": w.to_numpy(),
    "abs_rank": spill_mean.reindex(donors).abs().rank(ascending=False).to_numpy(),
}), "stage3_spillover_effects")

write_tab(spill_panel.rename_axis("year").reset_index()
          .melt(id_vars="year", var_name="state", value_name="spillover"),
          "stage3_spillover_panel")

# --- a tile-grid cartogram --------------------------------------------------
# A hard-coded (row, col) layout rather than a shapefile: no geo dependency, no
# download, deterministic rendering, and the same coordinates are reused by the
# web app. Rows run north to south; Alaska and Hawaii are omitted because
# neither is in the panel.
STATE_TILES = {
    "Maine": (0, 10),
    "Vermont": (1, 9), "New Hampshire": (1, 10),
    "Washington": (2, 0), "Idaho": (2, 1), "Montana": (2, 2), "North Dakota": (2, 3),
    "Minnesota": (2, 4), "Illinois": (2, 5), "Wisconsin": (2, 6), "Michigan": (2, 7),
    "New York": (2, 8), "Rhode Island": (2, 9), "Massachusetts": (2, 10),
    "Oregon": (3, 0), "Nevada": (3, 1), "Wyoming": (3, 2), "South Dakota": (3, 3),
    "Iowa": (3, 4), "Indiana": (3, 5), "Ohio": (3, 6), "Pennsylvania": (3, 7),
    "New Jersey": (3, 8), "Connecticut": (3, 9),
    "California": (4, 0), "Utah": (4, 1), "Colorado": (4, 2), "Nebraska": (4, 3),
    "Missouri": (4, 4), "Kentucky": (4, 5), "West Virginia": (4, 6),
    "Virginia": (4, 7), "Maryland": (4, 8), "Delaware": (4, 9),
    "Arizona": (5, 1), "New Mexico": (5, 2), "Kansas": (5, 3), "Arkansas": (5, 4),
    "Tennessee": (5, 5), "North Carolina": (5, 6), "South Carolina": (5, 7),
    "Oklahoma": (6, 3), "Louisiana": (6, 4), "Mississippi": (6, 5),
    "Alabama": (6, 6), "Georgia": (6, 7),
    "Texas": (7, 3), "Florida": (7, 8),
}
# Two-letter name prefixes collide badly (four states begin "Ne"), so use real
# postal abbreviations.
POSTAL = {
    "Alabama": "AL", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL",
    "Georgia": "GA", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN",
    "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA",
    "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI",
    "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT",
    "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
    "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
    "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR",
    "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
    "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
}
_missing_tiles = sorted(set(donors) - set(STATE_TILES))
if _missing_tiles:
    print(f"  [WARN] donors with no tile: {_missing_tiles}")
_excluded = sorted(set(STATE_TILES) - set(donors) - {treated_unit})
print(f"  states drawn but outside the donor pool ({len(_excluded)}): "
      f"{', '.join(POSTAL[s] for s in _excluded)}")

fig, ax = plt.subplots()
vals = spill_mean.reindex(donors)
vmax = float(np.nanmax(np.abs(vals.to_numpy())))
cmap = plt.get_cmap("YlOrRd")
# A LINEAR ramp, deliberately. A power transform would make Idaho's 0.49 look
# like 2.3 on a colourbar that says otherwise, and the whole point of the figure
# is that one state dominates. Letting 37 tiles sit at the pale end IS the
# result; figure 11 resolves the ranking among them.
norm = plt.Normalize(0.0, vmax)
for st, (r_, c_) in STATE_TILES.items():
    if st == treated_unit:
        face, txt, lw, ec = ORANGE, "#141413", 2.0, LIGHTER_TEXT
    elif st in vals.index and np.isfinite(vals.get(st, np.nan)):
        inten = abs(vals[st]) / vmax if vmax > 0 else 0.0
        face = cmap(norm(abs(vals[st])))
        txt, lw, ec = ("#141413" if inten > 0.45 else "#3b3b38"), 0.6, DARK_PANEL
    else:
        face, txt, lw, ec = DARK_PANEL, MUTED, 0.6, DARK_BG
    ax.add_patch(plt.Rectangle((c_, -r_), 0.92, 0.92, facecolor=face,
                               edgecolor=ec, linewidth=lw))
    ax.text(c_ + 0.46, -r_ + 0.46, POSTAL[st], ha="center", va="center",
            fontsize=8, color=txt, weight="bold")
ax.set_xlim(-0.4, 11.4); ax.set_ylim(-7.6, 1.3)
ax.set_aspect("equal"); ax.axis("off"); ax.grid(False)
ax.set_title("Where Proposition 99 leaked: mean post-1988 spillover by state")
ax.text(0.0, -6.6, f"orange = treated (CA)\ndark = not in the donor pool\n"
                   f"({', '.join(POSTAL[s] for s in _excluded)})",
        fontsize=8, color=MUTED, va="top")
sm = plt.cm.ScalarMappable(cmap=cmap, norm=norm)
cb = fig.colorbar(sm, ax=ax, fraction=0.03, pad=0.02)
cb.set_label("|spillover| (packs per capita per year)", color=LIGHT_TEXT, fontsize=9)
cb.ax.tick_params(colors=LIGHT_TEXT)
cb.outline.set_visible(False)
caption(fig, f"Every shaded tile is a donor state, coloured on a linear scale by the "
             f"magnitude of the spillover it absorbed. {top1} is the only donor that "
             f"borders California inside the ADH pool, and it absorbs {ratio:.0f}x the "
             f"next-largest effect — which is why almost every other tile sits at the "
             f"pale end. That concentration is the finding, not a rendering artefact.")
save_fig(fig, "10_spillover_map", 10, 7)

fig, ax = plt.subplots()
top8 = spill_rank.head(8).iloc[::-1]
cols = [ORANGE if v < 0 else TEAL for v in top8]
ax.barh(range(len(top8)), top8.to_numpy(), color=cols)
if not _lo.empty:
    err_lo = np.array([top8[s] - _lo.get(s, np.nan) for s in top8.index])
    err_hi = np.array([_hi.get(s, np.nan) - top8[s] for s in top8.index])
    ok = np.isfinite(err_lo) & np.isfinite(err_hi)
    if ok.any():
        ax.errorbar(top8.to_numpy()[ok], np.arange(len(top8))[ok],
                    xerr=[np.clip(err_lo[ok], 0, None), np.clip(err_hi[ok], 0, None)],
                    fmt="none", ecolor=LIGHT_TEXT, elinewidth=1.1, capsize=2)
ax.axvline(0, color=MUTED, lw=1.0)
ax.set_yticks(range(len(top8)))
ax.set_yticklabels(top8.index)
ax.set_xlabel("Mean post-1988 spillover (packs per capita)")
ax.set_title("SUTVA is not merely doubtful here — it is measurably false")
for i, (s, v) in enumerate(top8.items()):
    ax.text(v + (0.06 * np.sign(v) * vmax * 0.1), i, f"{v:+.2f}",
            va="center", ha="left" if v > 0 else "right", fontsize=9, color=LIGHT_TEXT)
caption(fig, "The eight donors with the largest estimated spillover, by posterior "
             "mean. A negative value means the donor sold fewer packs than it would "
             "have absent Proposition 99. scspill returns the effects panel as means "
             "rather than per-draw, so no per-donor interval is available; every "
             "other donor's mean is below 0.06 packs in absolute value.")
save_fig(fig, "11_spillover_bars", 9, 6)

# ══════════════════════════════════════════════════════════════════════════════
# 8. THE R RECONCILIATION
# ══════════════════════════════════════════════════════════════════════════════

rule("8. Reconciling with the R edition")

print("  scspill departs from the authors' R replication code in six documented")
print("  ways. Three have escape hatches, so an 'R specification' mode exists;")
print("  three do not, so the reproduction is close but not exact.")

R_SPEC = dict(beta_prior="ridge", propagate_alpha=False, adapt_rho=False,
              step_rho=R_STEP_RHO)

rspec_r = cached("sar_rspec_rbudget",
                 dict(**R_SPEC, m_iter=R_M_ITER, burn=R_BURN, spec="rspec@rbudget"),
                 lambda: _fit_scspill(m_iter=R_M_ITER, burn=R_BURN, **R_SPEC).payload)
rspec_h = cached("sar_rspec_headline",
                 dict(**R_SPEC, m_iter=M_ITER, burn=BURN, spec="rspec@headline",
                      max_effect_draws=MAX_EFFECT_DRAWS),
                 lambda: _fit_scspill(m_iter=M_ITER, burn=BURN,
                                      max_effect_draws=MAX_EFFECT_DRAWS, **R_SPEC).payload)


def _fit_mlsynth_sar():
    r = mlsynth.SPILLSYNTH({**MLS_COMMON, "method": "sar", "spatial_W": W,
                            "spatial_w": w, "p_factors": 1, "mcmc_iter": M_ITER,
                            "mcmc_burn": BURN, "step_rho": R_STEP_RHO,
                            "mcmc_seed": SEED}).fit()
    s = getattr(r, "sar", None)
    sp = getattr(r, "spillover_effects", None)
    return dict(
        att=float(r.att), att_scm=float(getattr(r, "att_scm", np.nan)),
        att_ci=(tuple(map(float, s.ate_ci)) if s is not None and getattr(s, "ate_ci", None) is not None
                else (np.nan, np.nan)),
        rho_hat=float(getattr(s, "rho_hat", np.nan)) if s is not None else np.nan,
        rho_ess=float(getattr(s, "rho_ess", np.nan)) if s is not None else np.nan,
        spill_nevada=float(np.mean(sp["Nevada"])) if sp is not None and "Nevada" in sp else np.nan,
    )


mls_sar = cached("mlsynth_spillsynth_sar",
                 dict(method="sar", m_iter=M_ITER, burn=BURN, step_rho=R_STEP_RHO,
                      seed=SEED, sha=MLSYNTH_SHA[:12]),
                 _fit_mlsynth_sar)

recon = pd.DataFrame([
    dict(spec="R edition (published)", engine="R + Rcpp", m_iter=R_M_ITER, burn=R_BURN,
         att=R_EDITION["att_sar"], lo95=R_EDITION["att_sar_lo"], hi95=R_EDITION["att_sar_hi"],
         att_scm=R_EDITION["att_horseshoe"], rho_hat=R_EDITION["rho_hat"],
         rho_lo=R_EDITION["rho_lo"], rho_hi=R_EDITION["rho_hi"],
         rho_ess=R_EDITION["rho_ess"], acc_rho=np.nan, seconds=np.nan,
         spill_nevada=R_EDITION["spill_nevada"],
         note="sc_spillover() from the authors' replication helpers"),
    dict(spec="scspill, R spec, R budget", engine="scspill", m_iter=R_M_ITER, burn=R_BURN,
         att=rspec_r["att"], lo95=rspec_r["att_ci"][0], hi95=rspec_r["att_ci"][1],
         att_scm=rspec_r["att_scm"], rho_hat=rspec_r["rho_hat"],
         rho_lo=rspec_r["rho_ci"][0], rho_hi=rspec_r["rho_ci"][1],
         rho_ess=rspec_r["rho_ess"], acc_rho=rspec_r["acc_rho"], seconds=np.nan,
         spill_nevada=float(rspec_r["spillover_panel"].loc[TREAT_YEAR:].mean().get("Nevada", np.nan)),
         note="ridge beta, alpha fixed at posterior mean, fixed rho step"),
    dict(spec="scspill, R spec, headline budget", engine="scspill",
         m_iter=M_ITER, burn=BURN,
         att=rspec_h["att"], lo95=rspec_h["att_ci"][0], hi95=rspec_h["att_ci"][1],
         att_scm=rspec_h["att_scm"], rho_hat=rspec_h["rho_hat"],
         rho_lo=rspec_h["rho_ci"][0], rho_hi=rspec_h["rho_ci"][1],
         rho_ess=rspec_h["rho_ess"], acc_rho=rspec_h["acc_rho"], seconds=np.nan,
         spill_nevada=float(rspec_h["spillover_panel"].loc[TREAT_YEAR:].mean().get("Nevada", np.nan)),
         note="same specification, 100x the iterations"),
    dict(spec="scspill, corrected defaults", engine="scspill", m_iter=M_ITER, burn=BURN,
         att=sar["att"], lo95=sar["att_ci"][0], hi95=sar["att_ci"][1],
         att_scm=sar["att_scm"], rho_hat=sar["rho_hat"],
         rho_lo=sar["rho_ci"][0], rho_hi=sar["rho_ci"][1],
         rho_ess=sar["rho_ess"], acc_rho=sar["acc_rho"], seconds=np.nan,
         spill_nevada=float(spill_mean.get("Nevada", np.nan)),
         note="horseshoe beta, paired (alpha, rho) draws, adaptive rho step"),
    dict(spec="mlsynth SPILLSYNTH(sar)", engine="mlsynth", m_iter=M_ITER, burn=BURN,
         att=mls_sar["att"], lo95=mls_sar["att_ci"][0], hi95=mls_sar["att_ci"][1],
         att_scm=mls_sar["att_scm"], rho_hat=mls_sar["rho_hat"],
         rho_lo=np.nan, rho_hi=np.nan, rho_ess=mls_sar["rho_ess"], acc_rho=np.nan,
         seconds=np.nan, spill_nevada=mls_sar["spill_nevada"],
         note="an INDEPENDENT port of the same paper, inside mlsynth"),
])
print("\n" + textwrap.indent(recon.drop(columns=["note"]).round(4).to_string(index=False), "  "))
print("\n  notes:")
for _, r_ in recon.iterrows():
    print(f"    {r_['spec']:<34s} {r_['note']}")
write_tab(recon, "r_reconciliation")

_r_width = R_EDITION["att_sar_hi"] - R_EDITION["att_sar_lo"]
_c_width = sar["att_ci"][1] - sar["att_ci"][0]
print(f"\n  The R edition's 95% credible interval is {_r_width:.2f} packs wide.")
print(f"  The corrected interval is {_c_width:.2f} packs wide — a factor of "
      f"{_c_width / _r_width:.0f}.")
print(f"  ESS(rho): R {R_EDITION['rho_ess']:.1f} -> R spec at R budget "
      f"{rspec_r['rho_ess']:.1f} -> R spec at {M_ITER:,} {rspec_h['rho_ess']:.1f} "
      f"-> corrected {sar['rho_ess']:.1f}")
print(f"  Acceptance rate: fixed step {rspec_h['acc_rho']:.3f} vs adaptive "
      f"{sar['acc_rho']:.3f} (target 0.44)")

DEPARTURES = pd.DataFrame([
    dict(n=1, area="Covariates",
         r_code="scrambled by a (T,N,K) vs (N,T,K) memory-layout mismatch",
         scspill="a proper (T, N, K) array throughout",
         escape_hatch="drop covariates", changes_the_answer="yes — this is the big one"),
    dict(n=2, area="Prior on beta", r_code="flat-plus-ridge conditional",
         scspill="the paper's horseshoe", escape_hatch='beta_prior="ridge"',
         changes_the_answer="modestly"),
    dict(n=3, area="ATT bands",
         r_code="vary rho only, alpha held at its posterior mean",
         scspill="paired (alpha, rho) draws",
         escape_hatch="propagate_alpha=False",
         changes_the_answer="yes — this is why the R interval is narrow"),
    dict(n=4, area="rho sampler", r_code="fixed Metropolis step",
         scspill="Robbins-Monro adaptation toward 44% acceptance",
         escape_hatch="adapt_rho=False", changes_the_answer="the interval, not the point"),
    dict(n=5, area="Factor scales",
         r_code="inconsistent omega_k conditionals; C+(0,1) hyperprior",
         scspill="N(0, sigma_eta^2 omega_k) with C+(0,10)",
         escape_hatch="none", changes_the_answer="little, but the sampler was invalid"),
    dict(n=6, area="FFBS initialisation",
         r_code="gamma_1 inconsistent with its own conditionals",
         scspill="coherent gamma_0 = 0",
         escape_hatch="none", changes_the_answer="little, but the sampler was invalid"),
])
write_tab(DEPARTURES, "scspill_departures")
print("\n  the six departures:")
print(textwrap.indent(DEPARTURES.to_string(index=False), "    "))

fig, (axa, axb) = plt.subplots(1, 2, figsize=(12.5, 5))
for lab, d, col in [("R spec, R budget", rspec_r, MUTED),
                    ("R spec, headline budget", rspec_h, GOLD),
                    ("Corrected defaults", sar, TEAL)]:
    dr = np.asarray(d["rho_draws"], dtype=float)
    axa.plot(np.arange(dr.size), dr, color=col, lw=0.6, alpha=0.85, label=lab)
axa.axhline(R_EDITION["rho_hat"], color=ORANGE, ls="--", lw=1.4,
            label=f"R edition $\\hat\\rho$ = {R_EDITION['rho_hat']:.3f}")
axa.set_xlabel("Retained draw (thinned)")
axa.set_ylabel(r"$\rho$")
axa.set_title(r"The $\rho$ chain, three specifications")
axa.legend(fontsize=8, loc="lower right")

labels = ["R edition", "R spec\nR budget", "R spec\nheadline", "Corrected\ndefaults"]
ess = [R_EDITION["rho_ess"], rspec_r["rho_ess"], rspec_h["rho_ess"], sar["rho_ess"]]
cols = [ORANGE, MUTED, GOLD, TEAL]
axb.bar(range(4), ess, color=cols)
axb.axhline(100, color=LIGHT_TEXT, ls="--", lw=1.2)
axb.text(3.45, 105, "ESS = 100", color=LIGHT_TEXT, fontsize=9, ha="right")
axb.set_xticks(range(4)); axb.set_xticklabels(labels, fontsize=8.5)
axb.set_ylabel(r"ESS($\rho$)")
axb.set_title("Effective sample size for the one weakly identified parameter")
for i, v in enumerate(ess):
    axb.text(i, v + max(ess) * 0.02, f"{v:.0f}", ha="center", color=LIGHT_TEXT, fontsize=9)
fig.tight_layout()
caption(fig, f"Left: the same parameter, three samplers. Right: what each buys in "
             f"effective sample size. The R edition reported a 95% interval "
             f"{_r_width:.2f} packs wide from {R_EDITION['rho_ess']:.0f} effectively "
             f"independent draws; the corrected run reports {_c_width:.1f} packs from "
             f"{sar['rho_ess']:.0f}.")
save_fig(fig, "12_r_reconciliation", 12.5, 5)

# ══════════════════════════════════════════════════════════════════════════════
# 9. PRIOR AND SAMPLER VALIDATION
# ══════════════════════════════════════════════════════════════════════════════

rule("9. Prior and sampler validation")

from scspill.validation import (geweke_test, plot_geweke, plot_prior_predictive,
                                prior_predictive, prior_sensitivity)

Y0_all = np.asarray(sar["Y0"], dtype=float).ravel()
Yc_all = np.asarray(sar["Yc"], dtype=float)
if Yc_all.shape[0] != Y0_all.size:      # (N, T) -> (T, N)
    Yc_all = Yc_all.T
_T0 = sar["T0"]
Y0_pre, Yc_pre = Y0_all[:_T0], Yc_all[:_T0]
X_all = sar["X"]
X_pre = None if X_all is None else np.asarray(X_all, dtype=float)[:_T0]
print(f"  Y0_pre {Y0_pre.shape}   Yc_pre {Yc_pre.shape}   "
      f"X_pre {None if X_pre is None else X_pre.shape}")

# --- 9.1 prior predictive ---------------------------------------------------
def _run_ppc():
    return prior_predictive(Y0_pre, sar["W_raw"], sar["w_raw"], sar["alpha_hat"],
                            Yc_obs=Yc_pre, X=X_pre, p=0, a0=3.0, b0=1.0,
                            n_draws=2000, seed=SEED)


try:
    ppc = cached("prior_predictive",
                 dict(n_draws=2000, a0=3.0, b0=1.0, p=0, seed=SEED,
                      alpha=sar["alpha_hat"]), _run_ppc)
    # PriorPredictiveResult exposes `observed`, `stats` and `p_values`, not a
    # ready-made table.
    ppc_tab = pd.DataFrame({
        "statistic": list(ppc.p_values),
        "observed": [float(ppc.observed[k]) for k in ppc.p_values],
        "p_value": list(ppc.p_values.values()),
    })
    print("  prior predictive check (observed statistic vs its prior distribution):")
    print(textwrap.indent(ppc_tab.round(4).to_string(index=False), "    "))
    write_tab(ppc_tab, "prior_predictive")
    fig = as_fig(plot_prior_predictive(ppc, show=False))
    save_fig(restyle_dark(fig), "13_prior_predictive", 12.6, 9)
except Exception as exc:
    print(f"  [ERROR] prior_predictive: {type(exc).__name__}: {exc}")
    ppc = None

# --- 9.2 Geweke joint distribution test -------------------------------------
# This is the test that caught departures 5 and 6 in section 8: it compares the
# marginal-conditional simulator (draw from the prior, then simulate data) with
# the successive-conditional one (run the sampler). If every conditional is
# coherent the two target the SAME joint distribution, so any statistic's mean
# must agree.
#
# Two design constraints come straight from the function's own Notes:
#   * keep T0 * N small -- an informative panel makes the rho chain diffuse
#     slowly and produces SPURIOUS failures. T0 = 4, N = 4 is what it prescribes.
#   * do not test the "production" kernel. Its half-Cauchy scale hierarchies are
#     funnel-shaped and "effectively untestable at feasible chain lengths" --
#     the reason the replication package only ever tested the simplified kernel,
#     and then at two million draws. Running it here produces |z| in the
#     hundreds, which says nothing about coherence.
#
# The Notes also give the way to tell a real problem from a mixing artifact:
# "a genuine incoherence shows up as a stable, sign-consistent z across seeds
# and scales; mixing artifacts flip sign and shrink as the chain grows."
# So run the simplified kernel at two chain lengths and watch what happens.
GEWEKE_LENGTHS = (20_000, 200_000)

geweke_rows, geweke_reports = [], {}
for _m in GEWEKE_LENGTHS:
    try:
        rep = cached(f"geweke_simple_{_m}",
                     dict(kernel="simple", T0=4, N=4, K=0, p=1, m=_m,
                          burn=5000, seed=SEED),
                     lambda mm=_m: geweke_test(kernel="simple", T0=4, N=4, K=0, p=1,
                                               m_iid=mm, m_mcmc=mm, burn=5000,
                                               seed=SEED))
        geweke_reports[_m] = rep
        tab = pd.DataFrame(rep.table)
        tab["kernel"], tab["m"] = "simple", _m
        tab["z_crit"], tab["passed"] = rep.z_crit, rep.passed
        geweke_rows.append(tab)
        # GewekeReport does its own Bonferroni bookkeeping; use it rather than
        # recomputing a threshold that could drift from the library's.
        print(f"  geweke_test(kernel='simple', m={_m:,}): "
              f"max |z| = {tab['z'].abs().max():.2f}, "
              f"flagged {rep.n_flagged} of {len(tab)} at |z| > {rep.z_crit:.2f}, "
              f"passed = {rep.passed}")
        print(textwrap.indent(tab.drop(columns=["kernel", "m"]).round(4)
                              .to_string(index=False), "    "))
    except Exception as exc:
        print(f"  [ERROR] geweke_test(m={_m}): {type(exc).__name__}: {exc}")

if geweke_rows:
    gk = pd.concat(geweke_rows, ignore_index=True)
    write_tab(gk, "geweke")
    piv = gk.pivot_table(index="g", columns="m", values="z")
    if piv.shape[1] == 2:
        a_, b_ = piv.columns[0], piv.columns[1]
        shrank = int((piv[b_].abs() < piv[a_].abs()).sum())
        print(f"\n  |z| shrinks for {shrank} of {len(piv)} statistics when the chain "
              f"grows {a_:,} -> {b_:,}.")
        print("  That is the signature of a mixing artifact, not an incoherent")
        print("  conditional: a genuine error is stable across chain lengths.")

        fig, ax = plt.subplots()
        ypos = np.arange(len(piv))
        ax.plot(piv[a_].abs(), ypos, "o", ms=8, color=GOLD, label=f"m = {a_:,}")
        ax.plot(piv[b_].abs(), ypos, "o", ms=8, color=TEAL, label=f"m = {b_:,}")
        for i in range(len(piv)):
            ax.annotate("", xy=(piv[b_].abs().iloc[i], i),
                        xytext=(piv[a_].abs().iloc[i], i),
                        arrowprops=dict(arrowstyle="->", color=MUTED, lw=1.1))
        crit_z = float(scipy.stats.norm.ppf(1 - 0.05 / (2 * len(piv))))
        ax.axvline(crit_z, color=ORANGE, ls="--", lw=1.3,
                   label=f"Bonferroni |z| = {crit_z:.2f}")
        ax.set_yticks(ypos); ax.set_yticklabels(piv.index, fontsize=9)
        ax.set_xlabel("|z| (marginal-conditional vs successive-conditional)")
        ax.set_title("Geweke joint distribution test: artifacts shrink, errors do not")
        ax.legend(fontsize=9)
        caption(fig, "Each statistic's test score at two chain lengths. Scores that "
                     "fall as the chain grows are slow mixing in the successive-"
                     "conditional simulator; a genuinely incoherent conditional would "
                     "hold its position. This is the test that caught two of the six "
                     "departures in the previous section.")
        save_fig(fig, "14_geweke", 9, 6)
    elif geweke_reports:
        fig = as_fig(plot_geweke(list(geweke_reports.values())[-1], show=False))
        save_fig(restyle_dark(fig), "14_geweke", 8.5, 6)

# --- 9.3 prior sensitivity --------------------------------------------------
PRIOR_GRID = pd.DataFrame([
    dict(a0=1.0, b0=1.0, rho_lo=-0.99, rho_hi=0.99, step_rho=0.05),
    dict(a0=3.0, b0=1.0, rho_lo=-0.99, rho_hi=0.99, step_rho=0.05),
    dict(a0=0.1, b0=0.1, rho_lo=-0.99, rho_hi=0.99, step_rho=0.05),
    dict(a0=1.0, b0=1.0, rho_lo=-0.50, rho_hi=0.50, step_rho=0.05),
    dict(a0=1.0, b0=1.0, rho_lo=-0.99, rho_hi=0.99, step_rho=0.01),
    dict(a0=5.0, b0=2.0, rho_lo=-0.99, rho_hi=0.99, step_rho=0.05),
])
try:
    sens = cached("prior_sensitivity",
                  dict(grid=PRIOR_GRID, m_burn=5000, m_keep=20000, seed=SEED,
                       alpha=sar["alpha_hat"], p=1, window="full"),
                  lambda: prior_sensitivity(Yc_all, sar["W_raw"], sar["w_raw"],
                                            sar["alpha_hat"], PRIOR_GRID,
                                            X=X_all, p=1, m_burn=5000, m_keep=20000,
                                            base_seed=SEED))
    sens_tab = pd.DataFrame(getattr(sens, "table", sens))
    write_tab(sens_tab, "prior_sensitivity")

    # The result is long: one row per (grid setting, parameter). rho is the one
    # that matters -- sigma2 and beta are nuisance blocks.
    sens_rho = sens_tab[sens_tab["parameter"] == "rho"].reset_index(drop=True) \
        if "parameter" in sens_tab else sens_tab
    print("  prior sensitivity, posterior for rho across six settings:")
    print(textwrap.indent(sens_rho.round(4).to_string(index=False), "    "))
    print("\n  NOTE: prior_sensitivity re-runs the SIMPLIFIED Step-2 kernel")
    print("  (kernel='simple'), not the production sampler, so its rho level is not")
    print("  the headline rho. What is informative is the VARIATION across rows.")

    _free = sens_rho[(sens_rho["rho_lo"] <= -0.9) & (sens_rho["rho_hi"] >= 0.9)]
    _bound = sens_rho[(sens_rho["rho_lo"] > -0.9) | (sens_rho["rho_hi"] < 0.9)]
    _free_spread = float(_free["mean"].max() - _free["mean"].min()) if len(_free) > 1 else np.nan
    if len(_free) > 1:
        print(f"\n  across the {len(_free)} rows with an unrestricted support, varying "
              f"a0 from {_free['a0'].min():g} to {_free['a0'].max():g}, b0 from "
              f"{_free['b0'].min():g} to {_free['b0'].max():g} and the Metropolis step")
        print(f"  by a factor of 5 moves the posterior mean of rho by "
              f"{_free_spread:.4f} ({_free['mean'].min():.4f} to "
              f"{_free['mean'].max():.4f}).")
    for _, r_ in _bound.iterrows():
        _shift = abs(float(r_["mean"]) - float(_free["mean"].mean())) if len(_free) else np.nan
        print(f"  Restricting the support to [{r_['rho_lo']:g}, {r_['rho_hi']:g}] pins it "
              f"at {r_['mean']:.4f}, hard against the bound -- a shift of {_shift:.4f},")
        print(f"  about {_shift / _free_spread:.0f}x what every conventional prior "
              f"setting did combined.")
        print("  The support IS a prior, and here it is the one that actually binds.")

    fig, ax = plt.subplots()
    xs = np.arange(len(sens_rho))
    binds = ((sens_rho["rho_lo"] > -0.9) | (sens_rho["rho_hi"] < 0.9)).to_numpy()
    cols = [ORANGE if b else TEAL for b in binds]
    ax.errorbar(xs, sens_rho["mean"],
                yerr=[sens_rho["mean"] - sens_rho["q025"],
                      sens_rho["q975"] - sens_rho["mean"]],
                fmt="none", ecolor=MUTED, elinewidth=1.4, capsize=3)
    ax.scatter(xs, sens_rho["mean"], s=70, c=cols, zorder=4)
    if len(_free):
        ax.axhline(_free["mean"].mean(), color=TEAL, ls="--", lw=1.1, alpha=0.6)
    ax.set_xticks(xs)
    ax.set_xticklabels(
        [f"$a_0$={r.a0:g}\n$b_0$={r.b0:g}\nstep={r.step_rho:g}\n"
         f"[{r.rho_lo:g}, {r.rho_hi:g}]" for r in PRIOR_GRID.itertuples()],
        fontsize=7.5)
    ax.set_ylabel(r"posterior mean of $\rho$ (simplified kernel)")
    ax.set_title(r"The only prior that moves $\rho$ is the one nobody calls a prior")
    ax.scatter([], [], s=70, c=TEAL, label="unrestricted support")
    ax.scatter([], [], s=70, c=ORANGE, label="support binds")
    ax.legend(fontsize=9)
    caption(fig, "Posterior mean of the spatial autoregressive parameter across six "
                 "prior settings, with 95% credible intervals. Changing the inverse-"
                 "gamma hyperparameters or the Metropolis step size does essentially "
                 "nothing; truncating the support does everything. Levels are not "
                 "comparable to the headline fit because this routine runs the "
                 "simplified kernel.")
    save_fig(fig, "15_prior_sensitivity", 9.5, 6)
except Exception as exc:
    print(f"  [ERROR] prior_sensitivity: {type(exc).__name__}: {exc}")

# ══════════════════════════════════════════════════════════════════════════════
# 10. THE BENCHMARK SWEEP — EIGHT MORE mlsynth ESTIMATORS
# ══════════════════════════════════════════════════════════════════════════════

rule("10. Eight more Bayesian and spillover estimators from mlsynth")

# SpSyDiD wants the UNIT-INCLUSIVE matrix (39x39), not the donor block (38x38).
_units = [treated_unit] + donors
W39 = pd.DataFrame(0.0, index=_units, columns=_units)
W39.loc[donors, donors] = W.values
W39.loc[treated_unit, donors] = w.reindex(donors).to_numpy()
W39.loc[donors, treated_unit] = w.reindex(donors).to_numpy()

# BPSCS wants point coordinates. Rather than hard-coding state centroids (real
# geography, but a second source of truth that could disagree with W), embed the
# rook graph itself in 2-D by classical MDS on its shortest-path distances.
# These are NOT geographic coordinates and the table says so.
_D = scipy.sparse.csgraph.shortest_path(W39.to_numpy(), unweighted=True)
_D[~np.isfinite(_D)] = np.nanmax(_D[np.isfinite(_D)]) + 1.0
_J = np.eye(len(_units)) - np.ones((len(_units), len(_units))) / len(_units)
_Bm = -0.5 * _J @ (_D ** 2) @ _J
_ev, _evec = np.linalg.eigh(_Bm)
_pick = np.argsort(_ev)[::-1][:2]
_coords = pd.DataFrame(_evec[:, _pick] * np.sqrt(np.clip(_ev[_pick], 0, None)),
                       index=_units, columns=["mds_1", "mds_2"])
df_coords = df.merge(_coords.rename_axis("state").reset_index(), on="state", how="left")
print(f"  BPSCS coordinates: 2-D classical MDS of the rook graph "
      f"(stress-free axes, NOT geographic)")


@dataclass(frozen=True)
class Bench:
    key: str
    label: str
    cls: type
    kwargs: dict
    family: str          # "bayesian" | "spillover"
    estimand: str        # a sentence, not a label — this is the honesty column
    comparable: bool     # does it target the SAME ATT as stages 1 and 3?
    extract: Callable
    budget: str = "fast"
    note: str = ""
    use_coords: bool = False


def _plain(r) -> dict:
    ci = getattr(r, "att_ci", None)
    return dict(att=float(r.att),
                lo95=float(ci[0]) if ci is not None else np.nan,
                hi95=float(ci[1]) if ci is not None else np.nan,
                extra="")


def _spill_sar_x(r) -> dict:
    s = getattr(r, "sar", None)
    ci = getattr(s, "ate_ci", None) if s is not None else None
    return dict(att=float(r.att),
                lo95=float(ci[0]) if ci is not None else np.nan,
                hi95=float(ci[1]) if ci is not None else np.nan,
                extra=(f"rho={s.rho_hat:.4f} ESS={s.rho_ess:.1f} "
                       f"att_scm={r.att_scm:.3f}") if s is not None else "")


def _spill_cd_x(r) -> dict:
    sp = getattr(r, "spillover_effects", None)
    nv = float(np.mean(sp["Nevada"])) if sp is not None and "Nevada" in sp else np.nan
    return dict(att=float(r.att), lo95=np.nan, hi95=np.nan,
                extra=f"att_scm={float(r.att_scm):.3f} Nevada spill={nv:+.3f}")


def _spsydid_x(r) -> dict:
    return dict(att=float(r.att), lo95=np.nan, hi95=np.nan,
                extra=f"ate={float(r.ate):+.3f} aite={float(r.aite):+.3f}")


BENCH = [
    Bench("bvss", "BVSS — soft simplex, spike-and-slab", mlsynth.BVSS,
          dict(n_iter=1000, burn_in=500, seed=SEED), "bayesian",
          "ATT on the treated, weights shrunk toward the simplex", True, _plain,
          budget="slow",
          note="~0.2 s per iteration; the headline budget would take about 28 hours"),
    Bench("mvbbsc", "MVBBSC — Martinez & Vives-i-Bastida", mlsynth.MVBBSC,
          dict(n_warmup=1000, n_samples=1000, n_chains=4, seed=SEED), "bayesian",
          "ATT on the treated, hard simplex with a Bernstein-von Mises interval",
          True, _plain),
    Bench("bfsc", "BFSC — Bayesian factor SC", mlsynth.BFSC,
          dict(n_factors=8, n_warmup=500, n_samples=500, n_chains=4, seed=SEED),
          "bayesian", "ATT on the treated via a latent-factor counterfactual",
          True, _plain, budget="slow",
          note="8 NUTS factors on 18 pre-periods; its interval spans zero"),
    Bench("bpscs", "BPSCS — penalised SC under spillovers", mlsynth.BPSCS,
          dict(covariates=["retprice"], coords=["mds_1", "mds_2"],
               n_warmup=1000, n_samples=1000, n_chains=4, seed=SEED), "spillover",
          "ATT on the treated under a distance-decay prior that down-weights "
          "neighbours", True, _plain, use_coords=True,
          note="needs point coordinates; supplied as an MDS embedding of the rook graph"),
    Bench("spill_sar", "SPILLSYNTH(sar) — the same paper, inside mlsynth",
          mlsynth.SPILLSYNTH,
          dict(method="sar", spatial_W=W, spatial_w=w, p_factors=1,
               mcmc_iter=M_ITER, mcmc_burn=BURN, step_rho=R_STEP_RHO,
               mcmc_seed=SEED), "spillover",
          "spillover-adjusted ATT (Sakaguchi & Tagawa 2026)", True, _spill_sar_x,
          budget="slow", note="an independent port; the cross-implementation check"),
    Bench("spill_cd", "SPILLSYNTH(cd) — Cao & Dowd", mlsynth.SPILLSYNTH,
          dict(method="cd", affected_units=["Nevada"]), "spillover",
          "spillover-adjusted ATT measured against a DEMEANED leave-one-out "
          "baseline", False, _spill_cd_x,
          note="its own no-spillover baseline is about -10.5, not -18.4: a different "
               "baseline, not a different answer to the same question"),
    Bench("spsydid", "SpSyDiD — spatial synthetic DiD", mlsynth.SpSyDiD,
          dict(spatial_matrix=W39), "spillover",
          "three estimands at once: direct (att), total (ate), average indirect "
          "(aite)", False, _spsydid_x,
          note="needs the 39x39 unit-inclusive matrix, not the 38x38 donor block"),
    Bench("iscm", "ISCM — imperfect/inclusive SC", mlsynth.ISCM,
          dict(inference=True, n_draws=2000, random_state=SEED), "spillover",
          "ATT under an imperfect-fit correction, on its own normalisation",
          False, _plain,
          note="its interval spans zero by a wide margin; reported for completeness"),
    Bench("spotsynth", "SPOTSYNTH — spillover-detecting SC", mlsynth.SPOTSYNTH,
          dict(selection="S1", forecast="loo", n_samples=2000, n_warmup=1000,
               seed=SEED), "spillover",
          "ATT after screening contaminated donors out of the pool entirely",
          True, _plain),
]


def run_bench(spec: Bench) -> dict:
    row = dict(key=spec.key, label=spec.label, family=spec.family,
               estimand=spec.estimand, comparable=spec.comparable,
               budget=spec.budget, note=spec.note, att=np.nan, lo95=np.nan,
               hi95=np.nan, extra="", status="", error_type="", error_msg="",
               seconds=np.nan)
    if BENCH_TIER == "fast" and spec.budget == "slow":
        row["status"] = "skipped"
        row["error_msg"] = "BENCH_TIER=fast; rerun with BENCH_TIER=full"
        return row
    base = {**MLS_COMMON, "df": df_coords} if spec.use_coords else MLS_COMMON
    t0 = time.time()
    try:
        res = spec.cls({**base, **spec.kwargs}).fit()
        row.update(spec.extract(res))
        row["status"] = "ok"
    except Exception as exc:          # deliberately broad: a failure is content
        row["status"] = "error"
        row["error_type"] = type(exc).__name__
        row["error_msg"] = str(exc).strip().splitlines()[0][:160]
    row["seconds"] = time.time() - t0
    return row


bench = pd.DataFrame(cached(
    "benchmark",
    dict(tier=BENCH_TIER, m_iter=M_ITER, burn=BURN, seed=SEED,
         specs=[(b.key, sorted(b.kwargs.keys())) for b in BENCH]),
    lambda: [run_bench(s) for s in BENCH]))

n_ok = int((bench["status"] == "ok").sum())
n_err = int((bench["status"] == "error").sum())
n_skip = int((bench["status"] == "skipped").sum())
print(f"\n  {n_ok} of {len(BENCH)} returned an ATT; {n_err} errored; {n_skip} skipped")
print(textwrap.indent(
    bench[["label", "family", "comparable", "att", "lo95", "hi95", "extra",
           "status", "seconds"]].round(3).to_string(index=False), "  "))
if n_err:
    print("\n  failures (reported, not hidden):")
    for _, r_ in bench[bench["status"] == "error"].iterrows():
        print(f"    {r_['key']:<10s} {r_['error_type']}: {r_['error_msg']}")
print("\n  estimands — the column that keeps this table from lying:")
for _, r_ in bench.iterrows():
    mark = "comparable  " if r_["comparable"] else "NOT compar. "
    print(f"    {mark}{r_['key']:<10s} {r_['estimand']}")
_ok = bench[(bench["status"] == "ok")]
if len(_ok):
    print(f"\n  runtime spread: {_ok['seconds'].min():.2f}s ({_ok.loc[_ok['seconds'].idxmin(), 'key']}) "
          f"to {_ok['seconds'].max():.1f}s ({_ok.loc[_ok['seconds'].idxmax(), 'key']})")
write_tab(bench, "benchmark")

_cmp = bench[(bench["status"] == "ok") & bench["comparable"]].copy()
_ncmp = bench[(bench["status"] == "ok") & ~bench["comparable"]].copy()
fig, ax = plt.subplots()
rows_b = pd.concat([_cmp, _ncmp])
ypos = np.arange(len(rows_b))[::-1]
for yv, (_, r_) in zip(ypos, rows_b.iterrows()):
    col = TEAL if r_["comparable"] else MUTED
    if np.isfinite(r_["lo95"]):
        ax.plot([r_["lo95"], r_["hi95"]], [yv, yv], color=col, lw=2.0, alpha=0.7)
    ax.plot(r_["att"], yv, "o", ms=7, color=col)
for v, lab, col in [(att_sc, "Stage 1 (simplex)", STEEL),
                    (sar["att"], "Stage 3 (SAR)", ORANGE)]:
    ax.axvline(v, color=col, ls="--", lw=1.3, alpha=0.9, label=lab)
ax.set_yticks(ypos)
ax.set_yticklabels([r_["label"].split(" — ")[0] for _, r_ in rows_b.iterrows()],
                   fontsize=9)
ax.axvline(0, color=MUTED, lw=1.0)
ax.set_xlabel("ATT (packs per capita per year)")
ax.set_title("Eight more estimators — teal targets the same ATT, grey does not")
ax.legend(fontsize=9, loc="lower left")
caption(fig, "Teal markers target the same estimand as Stages 1 and 3 and can be read "
             "against the dashed reference lines. Grey markers do not: SPILLSYNTH(cd) "
             "uses a demeaned leave-one-out baseline, SpSyDiD reports three effects at "
             "once, and ISCM uses a different normalisation. Putting them in one column "
             "without that distinction would be the easiest way to mislead a reader.")
save_fig(fig, "16_benchmark", 10, 7.5)

# ══════════════════════════════════════════════════════════════════════════════
# 11. MONTE CARLO — WHAT IGNORING THE LEAK COSTS
# ══════════════════════════════════════════════════════════════════════════════

rule("11. Monte Carlo — does modelling the leak pay?")

from scspill.simulate import mc_grid

MC_RHOS = (-0.6, -0.3, -0.1, 0.0, 0.1, 0.3, 0.6)
print(f"  design: N=16 (4x4 rook lattice), T0=20, T1=10, rho in {MC_RHOS}")
print(f"  {MC_SIMS} replications per cell  ({len(MC_RHOS) * MC_SIMS} fits), "
      f"n_jobs={MC_JOBS}")
print("  NOTE: mc_grid's inner sampler fixes adapt_rho=False and p=0 to mirror the")
print("  reference study, so this section cannot demonstrate the adaptation fix.")
if MC_JOBS > 1:
    print("  [WARN] MC_JOBS > 1 uses ProcessPoolExecutor; on macOS spawn this "
          "re-imports the module in every worker unless the script body is under "
          "a main() guard. MC_JOBS=1 is the safe default.")

try:
    mc = cached("mc_grid",
                dict(Ns=(16,), T0s=(20,), T1=10, rhos=MC_RHOS, sims=MC_SIMS,
                     m_iter=3000, burn=1000, step_rho=0.05, backend=BACKEND,
                     seed=SEED),
                lambda: mc_grid(Ns=(16,), T0s=(20,), T1=10, rhos=MC_RHOS,
                                sims_per=MC_SIMS, K=1, beta=(1.0,), sigma2=0.1,
                                treated=(0, 1, 2, 3), m_iter=3000, burn=1000,
                                step_rho=0.05, n_jobs=MC_JOBS, seed=SEED,
                                backend=BACKEND, progress=False))
    mc = pd.DataFrame(mc)
    print(textwrap.indent(mc.round(4).to_string(index=False), "  "))
    write_tab(mc, "mc_grid")

    _mcol = "method" if "method" in mc else None
    _bcol = next((c for c in ("bias_point", "bias", "bias_ate") if c in mc), None)
    if _mcol and _bcol:
        fig, axes = plt.subplots(1, 2, figsize=(12, 4.8))
        _ccol = next((c for c in ("cover95_point", "cover95", "cover95_ate")
                      if c in mc), None)
        pal = {}
        for i, m_ in enumerate(sorted(mc[_mcol].unique())):
            pal[m_] = [MUTED, STEEL, TEAL, GOLD, VIOLET][i % 5]
        for m_, g in mc.groupby(_mcol):
            g = g.sort_values("rho")
            axes[0].plot(g["rho"], g[_bcol], "o-", ms=5, color=pal[m_], label=str(m_))
            if _ccol:
                axes[1].plot(g["rho"], g[_ccol], "o-", ms=5, color=pal[m_], label=str(m_))
        axes[0].axhline(0, color=LIGHT_TEXT, ls="--", lw=1.1)
        axes[0].axvline(sar["rho_hat"], color=ORANGE, ls=":", lw=1.4)
        axes[0].text(sar["rho_hat"], axes[0].get_ylim()[1] * 0.92,
                     f"  $\\hat\\rho$ = {sar['rho_hat']:.2f}\n  (California)",
                     color=ORANGE, fontsize=8.5, va="top")
        axes[0].set_xlabel(r"true $\rho$"); axes[0].set_ylabel("bias of the estimated effect")
        axes[0].set_title("Ignoring the leak buys bias that grows with the leak")
        axes[0].legend(fontsize=9)
        if _ccol:
            axes[1].axhline(0.95, color=LIGHT_TEXT, ls="--", lw=1.1)
            axes[1].set_ylim(0, 1.02)
            axes[1].set_xlabel(r"true $\rho$")
            axes[1].set_ylabel("coverage of the nominal 95% interval")
            axes[1].set_title("And intervals that stop covering")
            axes[1].legend(fontsize=9)
        fig.tight_layout()
        caption(fig, f"{MC_SIMS} replications per cell on a 4x4 rook lattice with a "
                     f"planted spillover intensity. Monte Carlo standard error on a "
                     f"coverage of 0.95 at n={MC_SIMS} is about "
                     f"{np.sqrt(0.95 * 0.05 / MC_SIMS):.3f}. The paper's own design "
                     f"uses 1000 replications; MC_SIMS buys that precision.")
        save_fig(fig, "17_mc_bias", 12, 4.8)
except Exception as exc:
    print(f"  [ERROR] mc_grid: {type(exc).__name__}: {exc}")
    mc = pd.DataFrame()

# ══════════════════════════════════════════════════════════════════════════════
# 12. THE WHOLE LADDER
# ══════════════════════════════════════════════════════════════════════════════

rule("12. The whole ladder, side by side")

ladder("3'. Bayesian spatial SC", "mlsynth", 'SPILLSYNTH(method="sar").fit()',
       mls_sar["att"], mls_sar["att_ci"][0], mls_sar["att_ci"][1],
       rho_hat=mls_sar["rho_hat"], rho_ess=mls_sar["rho_ess"],
       r_reference=R_EDITION["att_sar"],
       note="independent implementation of the same model")

lad = pd.DataFrame(LADDER)
lad["r_gap"] = lad["att"] - lad["r_reference"]
print(textwrap.indent(lad.round(4).to_string(index=False), "  "))
write_tab(lad, "att_ladder")

_fin = lad[np.isfinite(lad["att"])]
print(f"\n  every estimator on the ladder agrees on the sign.")
print(f"  range: {_fin['att'].min():.2f} to {_fin['att'].max():.2f} packs "
      f"(spread {_fin['att'].max() - _fin['att'].min():.2f})")
_wr = lad.dropna(subset=["r_reference"])
if len(_wr):
    print(f"  max |Python - R| across the {len(_wr)} comparable stages: "
          f"{_wr['r_gap'].abs().max():.3f} packs")

fig, ax = plt.subplots()
rows_l = lad.iloc[::-1]
ypos = np.arange(len(rows_l))
for i, (_, r_) in enumerate(rows_l.iterrows()):
    col = TEAL if "spatial" in r_["stage"] else (
        STEEL if r_["stage"].startswith("1") else GOLD)
    if np.isfinite(r_["lo95"]):
        ax.plot([r_["lo95"], r_["hi95"]], [i, i], color=col, lw=2.4, alpha=0.75)
    ax.plot(r_["att"], i, "o", ms=9, color=col, zorder=4)
    if np.isfinite(r_["r_reference"]):
        ax.plot(r_["r_reference"], i, "D", ms=6.5, mfc="none", mec=ORANGE, mew=1.7,
                zorder=5)
ax.set_yticks(ypos)
ax.set_yticklabels([f"{r_['stage']}\n{r_['engine']}" for _, r_ in rows_l.iterrows()],
                   fontsize=8.5)
ax.axvline(0, color=MUTED, lw=1.0)
ax.set_xlabel("ATT (packs per capita per year)")
ax.set_title("Every relaxation moves the donor pool; none rescues the null")
ax.plot([], [], "D", mfc="none", mec=ORANGE, mew=1.7, label="R edition")
ax.legend(fontsize=9, loc="lower left")
caption(fig, f"The whole ladder. Point estimates span "
             f"{_fin['att'].min():.1f} to {_fin['att'].max():.1f} packs per capita per "
             f"year across two libraries, four prior structures and one spatial layer. "
             f"Hollow diamonds are the R edition's published values.")
save_fig(fig, "18_att_ladder", 9.5, 7)

# ══════════════════════════════════════════════════════════════════════════════
# 13. ASSERTIONS
# ══════════════════════════════════════════════════════════════════════════════

rule("13. Assertions")

checks = {
    "classical ATT within 0.20 of R's -18.46":
        abs(att_sc - R_EDITION["att_classical"]) < 0.20,
    "classical weights lie on the simplex":
        abs(w_sc.sum() - 1.0) < 1e-5 and bool((w_sc >= -1e-9).all()),
    "Nevada is California's only donor-pool neighbour":
        int((w > 0).sum()) == 1 and float(w.get("Nevada", 0.0)) > 0,
    "scspill rho=0 within 0.60 of R's Stage 2 -15.84":
        abs(att_rho0 - R_EDITION["att_horseshoe"]) < 0.60,
    "scspill SAR within 0.60 of R's -16.59":
        abs(sar["att"] - R_EDITION["att_sar"]) < 0.60,
    "scspill and mlsynth SAR agree within 1.00 packs":
        abs(sar["att"] - mls_sar["att"]) < 1.00,
    "R-spec at the R budget reproduces R's ESS(rho) < 10":
        rspec_r["rho_ess"] < 10.0,
    "R-spec at the R budget within 0.60 of R's ATT":
        abs(rspec_r["att"] - R_EDITION["att_sar"]) < 0.60,
    "rho_hat lies inside the identified support":
        0.0 < sar["rho_hat"] < sar["rho_bound"],
    "adaptation improves ESS(rho)":
        sar["rho_ess"] > rspec_h["rho_ess"],
    "adaptation lands acceptance near the 0.44 target":
        abs(sar["acc_rho"] - 0.44) < 0.10,
    "the corrected interval is wider than the R edition's":
        _c_width > _r_width,
    "Nevada absorbs the largest spillover":
        spill_rank.index[0] == "Nevada",
    "Nevada's spillover is negative":
        float(spill_mean["Nevada"]) < 0,
    "spillover shrinks with graph distance (Idaho < Nevada)":
        abs(float(spill_mean["Idaho"])) < abs(float(spill_mean["Nevada"])),
    "purging the spillover deepens the estimated effect":
        sar["att"] < att_rho0,
    "every ladder stage agrees on the sign":
        bool((_fin["att"] < 0).all()),
    "every benchmark row has a status":
        bool((bench["status"] != "").all()),
}
failed = False
for name, ok in checks.items():
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
    failed |= not bool(ok)

write_tab(pd.DataFrame({"check": list(checks.keys()),
                        "passed": [bool(v) for v in checks.values()]}),
          "assertions")

# ══════════════════════════════════════════════════════════════════════════════
# 14. HOW LONG MUST THE CHAIN BE?
# ══════════════════════════════════════════════════════════════════════════════

rule("14. How long must the chain be?")

print("  The estimand converges long before the nuisance parameter does. This is")
print("  the evidence behind the headline budget: the ATT is stable from 100k on,")
print("  but ESS(rho) does not clear the conventional 100 until roughly 500k.")

BUDGETS = (5_000, 20_000, 50_000, 100_000, 250_000, 500_000)


def _one_budget(m: int) -> dict:
    d = cached(f"budget_{m}",
               dict(m_iter=m, burn=m // 2, seed=SEED, backend=BACKEND,
                    max_effect_draws=MAX_EFFECT_DRAWS),
               lambda mm=m: _fit_scspill(m_iter=mm, burn=mm // 2,
                                         max_effect_draws=MAX_EFFECT_DRAWS).payload)
    return dict(m_iter=m, burn=m // 2, att=d["att"], lo95=d["att_ci"][0],
                hi95=d["att_ci"][1], ci_width=d["att_ci"][1] - d["att_ci"][0],
                att_scm=d["att_scm"], rho_hat=d["rho_hat"],
                rho_lo=d["rho_ci"][0], rho_hi=d["rho_ci"][1],
                rho_ess=d["rho_ess"], acc_rho=d["acc_rho"])


budget = pd.DataFrame([_one_budget(m) for m in BUDGETS])
print(textwrap.indent(budget.round(4).to_string(index=False), "  "))
write_tab(budget, "mcmc_budget_ladder")

_reach = budget.loc[budget["rho_ess"] >= 100, "m_iter"]
print(f"\n  ATT range across the ladder: {budget['att'].min():.3f} to "
      f"{budget['att'].max():.3f} (spread {budget['att'].max() - budget['att'].min():.3f})")
print(f"  ESS(rho) range: {budget['rho_ess'].min():.1f} to {budget['rho_ess'].max():.1f}")
print(f"  first budget with ESS(rho) >= 100: "
      f"{int(_reach.min()) if len(_reach) else 'none in this ladder'}")

fig, (axa, axb) = plt.subplots(1, 2, figsize=(12, 4.6))
axa.errorbar(budget["m_iter"], budget["att"],
             yerr=[budget["att"] - budget["lo95"], budget["hi95"] - budget["att"]],
             fmt="o-", ms=6, color=TEAL, ecolor=MUTED, elinewidth=1.3, capsize=3)
axa.axhline(R_EDITION["att_sar"], color=ORANGE, ls="--", lw=1.3,
            label=f"R edition = {R_EDITION['att_sar']:.2f}")
axa.set_xscale("log")
axa.set_xlabel("MCMC iterations")
axa.set_ylabel("ATT (packs per capita)")
axa.set_title("The estimand settles early")
axa.legend(fontsize=9)

axb.plot(budget["m_iter"], budget["rho_ess"], "o-", ms=6, color=GOLD)
axb.axhline(100, color=LIGHT_TEXT, ls="--", lw=1.2)
axb.text(budget["m_iter"].min() * 1.2, 108, "conventional floor, ESS = 100",
         color=LIGHT_TEXT, fontsize=8.5)
axb.axvline(M_ITER, color=TEAL, ls=":", lw=1.5)
axb.text(M_ITER, axb.get_ylim()[1] * 0.45, f"  headline\n  {M_ITER:,}",
         color=TEAL, fontsize=8.5, va="top")
axb.set_xscale("log")
axb.set_xlabel("MCMC iterations")
axb.set_ylabel(r"ESS($\rho$)")
axb.set_title("The nuisance parameter does not")
fig.tight_layout()
caption(fig, "Why this post runs half a million iterations for a 13-year effect. The "
             "ATT and its credible interval are stable from about 100,000 draws; the "
             "spatial autoregressive parameter needs roughly five times that to reach "
             "an effective sample size anyone would report.")
save_fig(fig, "19_mcmc_budget", 12, 4.6)

# ══════════════════════════════════════════════════════════════════════════════
# 15. WEB-APP DATA
# ══════════════════════════════════════════════════════════════════════════════


def clean(x):
    """JSON-safe, 8 significant figures, NaN -> null."""
    if isinstance(x, dict):
        return {str(k): clean(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [clean(v) for v in x]
    if isinstance(x, np.ndarray):
        return [clean(v) for v in x.tolist()]
    if isinstance(x, (np.floating, float)):
        return None if not np.isfinite(float(x)) else float(f"{float(x):.8g}")
    if isinstance(x, (np.integer, int)):
        return int(x)
    if isinstance(x, (np.bool_, bool)):
        return bool(x)
    if x is None or (isinstance(x, float) and not np.isfinite(x)):
        return None
    return str(x)


def recs(frame: pd.DataFrame) -> list:
    return [clean(r) for r in frame.to_dict(orient="records")]


rule("15. Web-app data")

if not APP_DATA:
    print("  [skip] APP_DATA is unset. Rerun with APP_DATA=1 to rebuild "
          "web_app/data/results.json")
elif failed:
    print("  [refuse] assertions failed; not writing app data from a broken run")
else:
    app_dir = Path("web_app/data")
    app_dir.mkdir(parents=True, exist_ok=True)

    # A rho sweep the app's slider reads, so the browser never runs MCMC.
    rho_grid = np.round(np.arange(0.0, 0.601, 0.02), 3)
    Y0i, Yci = sar["Y0"], sar["Yc"]
    Wni, wni, ahat = sar["Wn"], sar["wn"], sar["alpha_hat"]
    sweep = []
    for rv in rho_grid:
        cf = treated_counterfactual(Y0i, Yci, Wni, wni, ahat, float(rv))
        gap = Y0_all - np.asarray(cf, dtype=float).ravel()
        post = np.asarray(_tl) >= TREAT_YEAR
        sweep.append(dict(rho=float(rv), att=float(gap[post].mean()),
                          cf=clean(np.asarray(cf, dtype=float).ravel())))
    app_sweep = pd.DataFrame([{k: v for k, v in s.items() if k != "cf"} for s in sweep])
    write_tab(app_sweep, "app_rho_sweep")

    payload = {
        "meta": clean(dict(
            treated=treated_unit, donors=donors, years=years.tolist(),
            T0=T0, T1=T1, treat_year=TREAT_YEAR, n_units=int(df["state"].nunique()),
            rho_bound=sar["rho_bound"], scspill_version=scspill.__version__,
            mlsynth_version=mlsynth.__version__, mlsynth_sha=MLSYNTH_SHA[:12],
            backend=BACKEND, m_iter=sar["iters"], burn=sar["burn"], seed=SEED,
            r_reference=R_EDITION)),
        "outcome": clean({"treated": y_treated,
                          "donors": {s: wide[s].to_numpy() for s in donors}}),
        "counterfactual": clean({
            "classical": cf_sc, "bscm": bscm["counterfactual"],
            "scspill_rho0": sar["cf_rho0"], "scspill_sar": sar["cf_mean"]}),
        "bands": clean({"scspill_sar": {"lower": sar["cf_lower"],
                                        "upper": sar["cf_upper"]}}),
        "weights": clean({
            "classical": w_sc.to_dict(), "bscm_mean": dict(zip(donors, bscm["beta_mean"])),
            "alpha_mean": dict(zip(donors, sar["alpha_mean"])),
            "alpha_lo": dict(zip(donors, sar["alpha_lo"])),
            "alpha_hi": dict(zip(donors, sar["alpha_hi"]))}),
        "spillovers": clean({s: spill_panel[s].to_numpy() for s in donors}),
        "spillover_mean": clean(spill_mean.reindex(donors).to_dict()),
        "rho": clean(dict(draws=np.asarray(sar["rho_draws"], float)[::5],
                          rspec_draws=np.asarray(rspec_h["rho_draws"], float)[::5],
                          hat=sar["rho_hat"], ci=list(sar["rho_ci"]),
                          ess=sar["rho_ess"], acc=sar["acc_rho"],
                          bound=sar["rho_bound"])),
        "rho_sweep": [clean(s) for s in sweep],
        "tiles": {k: list(v) for k, v in STATE_TILES.items()},
        # Two-letter name prefixes collide (four states begin "Ne"), so the app
        # gets the same postal codes figure 10 uses.
        "postal": POSTAL,
        "ladder": recs(lad),
        "reconciliation": recs(recon),
        "departures": recs(DEPARTURES),
        "benchmark": recs(bench),
        "budget": recs(budget),
        "mc": recs(mc) if len(mc) else [],
    }
    out = app_dir / "results.json"
    out.write_text(json.dumps(payload, indent=1))
    print(f"  [app]    {out}  ({out.stat().st_size / 1024:.0f} KB, "
          f"{len(payload)} top-level keys)")

# ══════════════════════════════════════════════════════════════════════════════

rule("Done")
print(f"  figures  {len(FIGURES)}")
print(f"  tables   {len(TABLES)}")
print(f"  headline ATT {sar['att']:.3f} [{sar['att_ci'][0]:.3f}, {sar['att_ci'][1]:.3f}]"
      f"   rho {sar['rho_hat']:.4f}  ESS {sar['rho_ess']:.0f}")
print(f"  Nevada spillover {float(spill_mean['Nevada']):+.3f} packs per capita")
if failed:
    print("\n=== Script FAILED: one or more assertions did not hold ===")
    sys.exit(1)
print("\n=== Script completed successfully ===")
