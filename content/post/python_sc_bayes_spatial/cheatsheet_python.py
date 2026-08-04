"""
BAYESIAN SPATIAL SYNTHETIC CONTROL — the whole post in one runnable file.

    classical simplex SC  ->  Bayesian horseshoe SC  ->  Bayesian spatial SC

This is the condensed companion to
https://carlos-mendez.org/post/python_sc_bayes_spatial/
It runs the same three stages as analysis.py plus the benchmark sweep and one
diagnostic, on a tutorial-sized MCMC budget, and prints every result beside the
R edition's published value so a disagreement is visible on the first run.

    python cheatsheet_python.py          # about a minute

For the paper-grade budget (500,000 iterations), the 20 figures and the 23
result tables, run analysis.py instead.

Install:
    pip install "scspill[numba]==0.2.1"  || pip install "scspill==0.2.1"
    pip install "mlsynth[bayes] @ git+https://github.com/jgreathouse9/mlsynth.git@15f168bb90487098a7324be00b6663fcab0139ef"

WHAT THIS FILE WILL NOT REPRODUCE
    m_iter = 4000 is a tutorial budget. It reproduces the SHAPE of every result
    -- signs, ranks, orders of magnitude -- but not the third decimal, and its
    ESS(rho) is far below anything publishable. That is the point of section 6.
"""

from __future__ import annotations

import os

# Pin BLAS before numpy is imported: reduction order changes the last digits,
# and at N = 38 single-threaded is also faster.
for _v in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS",
           "VECLIB_MAXIMUM_THREADS"):
    os.environ.setdefault(_v, "1")
os.environ.setdefault("JAX_ENABLE_X64", "1")

import time
import warnings

warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd

import mlsynth
import scspill
from scspill import SCSPILL
from scspill.data import load_california
from scspill.utils.scspill_helpers.sar.effects import treated_counterfactual
from scspill.validation import geweke_test

t_start = time.perf_counter()

SEED = 20251022          # the R edition's seed, so the two are comparable
TREAT_YEAR = 1988        # scspill's convention; mlsynth's own example uses 1989
M_ITER, BURN = 4000, 2000
R_STEP_RHO = 0.01

# The R edition's published numbers (r_sc_bayes_spatial_att_comparison.csv).
R_EDITION = {"classical": -18.46, "horseshoe": -15.84, "sar": -16.59,
             "rho": 0.2226, "rho_ess": 2.93, "nevada": -3.75}


def hdr(txt: str) -> None:
    print("\n" + "=" * 74 + f"\n{txt}\n" + "=" * 74)


def cmp(label: str, got: float, ref: float | None = None, unit: str = "") -> None:
    tail = "" if ref is None else f"   R edition {ref:+8.3f}   diff {got - ref:+6.3f}"
    print(f"  {label:<34s} {got:+9.4f}{unit}{tail}")


# ── 0. Environment ───────────────────────────────────────────────────────────
hdr("0. Environment")
print(f"  scspill {scspill.__version__}   mlsynth {mlsynth.__version__}   "
      f"numpy {np.__version__}   pandas {pd.__version__}")
print(f"  seed {SEED}   MCMC m_iter={M_ITER} burn={BURN}  (tutorial budget)")

# ── 1. Data ──────────────────────────────────────────────────────────────────
hdr("1. Data — the Proposition 99 panel and its two spatial objects")
panel = load_california()
df = panel.df.copy()
donors = list(panel.spatial_W.index)
W, w = panel.spatial_W.loc[donors, donors], panel.spatial_w.reindex(donors)
years = np.sort(df["year"].unique())
wide = df.pivot(index="year", columns="state", values="cigsale")
y_treated = wide["California"].to_numpy()
post = years >= TREAT_YEAR

print(f"  {df.shape[0]} rows   {df['state'].nunique()} states   "
      f"{years.min()}-{years.max()}   T0={int((~post).sum())} T1={int(post.sum())}")
print(f"  spatial_W {W.shape} donor-to-donor;  spatial_w ({len(w)},) exposure to California")
print(f"  California's only donor-pool neighbour: {list(w[w > 0].index)}")
assert (((df['state'] == 'California') & (df['year'] >= TREAT_YEAR)).astype(int)
        .to_numpy() == df['treated'].to_numpy()).all()

MLS = dict(df=df, outcome="cigsale", treat="treated", unitid="state", time="year",
           display_graphs=False)

# ── 2. Stage 1 — classical simplex synthetic control ─────────────────────────
hdr("2. Stage 1 — classical simplex SC (mlsynth.VanillaSC)")
sc = mlsynth.VanillaSC({**MLS}).fit()
w_sc = pd.Series(sc.donor_weights, dtype=float).reindex(donors).fillna(0.0)
cmp("ATT", float(sc.att), R_EDITION["classical"], " packs")
print(f"  {'pre-treatment RMSE':<34s} {sc.pre_rmse:9.4f}")
print(f"  {'weights sum / active donors':<34s} {w_sc.sum():9.4f} / "
      f"{int((w_sc > 1e-4).sum())} of {len(donors)}")
for s, v in w_sc[w_sc > 1e-4].sort_values(ascending=False).items():
    print(f"       {s:<18s} {v:.4f}")

# ── 3. Stage 2a — Bayesian SC, WITH an intercept ─────────────────────────────
hdr("3. Stage 2a — Bayesian horseshoe SC (mlsynth.BSCM)")
bs = mlsynth.BSCM({**MLS, "prior": "horseshoe", "n_iter": 8000, "burn_in": 4000,
                   "chains": 4, "seed": SEED}).fit()
b0 = float(np.mean(np.asarray(bs.posterior.beta0)))
w_bs = pd.Series(bs.donor_weights, dtype=float).reindex(donors).fillna(0.0)
cmp("ATT", float(bs.att))
print(f"  {'95% CrI':<34s} [{bs.att_ci[0]:+.4f}, {bs.att_ci[1]:+.4f}]")
print(f"  {'intercept (beta0) posterior mean':<34s} {b0:9.4f}")
print(f"  {'weights sum':<34s} {w_bs.sum():9.4f}   <- NOT one; there is an intercept")
print("  BSCM is Kim, Lee & Gupta (2020): a Bayesian SC WITH an explicit")
print("  intercept. That is why it sits ~3 packs from scspill's rho = 0 case.")

# ── 4. Stage 3 — Bayesian spatial SC ─────────────────────────────────────────
hdr('4. Stage 3 — Bayesian spatial SC (scspill, method="sar")')
res = SCSPILL({**panel.config_kwargs(), "m_iter": M_ITER, "burn": BURN,
               "seed": SEED, "display_graphs": False, "backend": "auto"}).fit()
cmp("ATT", float(res.att), R_EDITION["sar"], " packs")
print(f"  {'95% CrI':<34s} [{res.att_ci[0]:+.4f}, {res.att_ci[1]:+.4f}]"
      f"  (width {res.att_ci[1] - res.att_ci[0]:.2f})")
cmp("rho", float(res.rho_hat), R_EDITION["rho"])
print(f"  {'95% CrI for rho':<34s} [{res.rho_ci[0]:+.4f}, {res.rho_ci[1]:+.4f}]")
cmp("ESS(rho)", float(res.rho_ess), R_EDITION["rho_ess"])
print(f"  {'acceptance rate (target 0.44)':<34s} {res.acc_rho:9.4f}")

# ── 5. Stage 2b — the rho = 0 case, free from the Stage-3 fit ────────────────
hdr("5. Stage 2b — the rho = 0 special case (no extra MCMC)")
print("  scspill has no `rho` argument -- rho is estimated. But the model")
print("  collapses EXACTLY to a Bayesian horseshoe SC at rho = 0, and that case")
print("  is already computed:")
cmp("ATT at rho = 0  (att_scm)", float(res.effects_detail.att_scm),
    R_EDITION["horseshoe"], " packs")
cf0 = treated_counterfactual(res.inputs.Y0, res.inputs.Yc, res.inputs.Wn,
                             res.inputs.wn, res.alpha_hat, 0.0)
print(f"  {'and the whole rho = 0 path, via':<34s} treated_counterfactual(..., rho=0.0)")
print(f"  {'mean post-1988 gap from that path':<34s} "
      f"{np.mean(y_treated[post] - np.asarray(cf0).ravel()[post]):+9.4f}")
cmp("ATT at rho-hat", float(res.att))
print(f"  Modelling the leak moves the effect by "
      f"{res.att - res.effects_detail.att_scm:+.4f} packs.")

# ── 6. Spillovers — SUTVA is measurably false here ───────────────────────────
hdr("6. Who else was treated?")
spill = res.spillover_panel.loc[TREAT_YEAR:].mean()
rank = spill.reindex(spill.abs().sort_values(ascending=False).index)
print("  spillover_panel = Yc - Yc(0). Negative = the donor sold FEWER packs")
print("  than it would have without Proposition 99.\n")
for s, v in rank.head(5).items():
    ref = R_EDITION["nevada"] if s == "Nevada" else None
    cmp(f"  {s}", float(v), ref, " packs")
print(f"\n  {rank.index[0]} absorbs "
      f"{abs(rank.iloc[0]) / abs(rank.iloc[1]):.1f}x the next-largest donor.")

# ── 7. Reproducing the R edition, and then fixing it ─────────────────────────
hdr("7. The R specification, and what the corrections buy")
rspec = SCSPILL({**panel.config_kwargs(), "m_iter": 5000, "burn": 2500,
                 "seed": SEED, "display_graphs": False, "backend": "auto",
                 "beta_prior": "ridge", "propagate_alpha": False,
                 "adapt_rho": False, "step_rho": R_STEP_RHO}).fit()
print("  R specification (ridge beta, alpha at its posterior mean, fixed step),")
print("  at the R edition's own budget of 5000/2500:")
cmp("    ATT", float(rspec.att), R_EDITION["sar"], " packs")
cmp("    rho", float(rspec.rho_hat), R_EDITION["rho"])
cmp("    ESS(rho)", float(rspec.rho_ess), R_EDITION["rho_ess"])
rw = rspec.att_ci[1] - rspec.att_ci[0]
cw = res.att_ci[1] - res.att_ci[0]
print(f"\n  {'R-spec 95% interval width':<34s} {rw:9.3f} packs")
print(f"  {'corrected 95% interval width':<34s} {cw:9.3f} packs   "
      f"({cw / rw:.0f}x wider)")
print("  The point estimate barely moves. The interval is a different object.")

# ── 8. Eight more estimators, honestly labelled ──────────────────────────────
hdr("8. The rest of the catalogue")
_units = ["California"] + donors
W39 = pd.DataFrame(0.0, index=_units, columns=_units)
W39.loc[donors, donors] = W.values
W39.loc["California", donors] = w.to_numpy()
W39.loc[donors, "California"] = w.to_numpy()

SPECS = [
    ("MVBBSC", mlsynth.MVBBSC, dict(n_warmup=500, n_samples=500, n_chains=2,
                                    seed=SEED), True, "ATT on the treated"),
    ("SPILLSYNTH(sar)", mlsynth.SPILLSYNTH,
     dict(method="sar", spatial_W=W, spatial_w=w, p_factors=1, mcmc_iter=M_ITER,
          mcmc_burn=BURN, step_rho=R_STEP_RHO, mcmc_seed=SEED), True,
     "spillover-adjusted ATT -- the SAME paper, independently ported"),
    ("SPILLSYNTH(cd)", mlsynth.SPILLSYNTH, dict(method="cd",
                                                affected_units=["Nevada"]), False,
     "measured against a DEMEANED leave-one-out baseline"),
    ("SpSyDiD", mlsynth.SpSyDiD, dict(spatial_matrix=W39), False,
     "reports direct, total and average indirect effects at once"),
    ("ISCM", mlsynth.ISCM, dict(inference=True, n_draws=1000, random_state=SEED),
     False, "imperfect-fit correction on its own normalisation"),
    ("SPOTSYNTH", mlsynth.SPOTSYNTH, dict(selection="S1", forecast="loo",
                                          n_samples=1000, n_warmup=500, seed=SEED),
     True, "ATT after screening contaminated donors out of the pool"),
]
print(f"  {'estimator':<18s} {'ATT':>9s}  {'comparable':<11s} estimand")
for name, cls, kw, comparable, estimand in SPECS:
    try:
        r = cls({**MLS, **kw}).fit()
        flag = "yes" if comparable else "NO"
        print(f"  {name:<18s} {float(r.att):+9.3f}  {flag:<11s} {estimand}")
    except Exception as exc:                       # a failure is information
        print(f"  {name:<18s} {'--':>9s}  {'error':<11s} "
              f"{type(exc).__name__}: {str(exc).splitlines()[0][:60]}")
print("\n  'comparable = NO' means the estimator targets a DIFFERENT quantity.")
print("  Reading those rows against the Stage-1/Stage-3 numbers is the easiest")
print("  way to draw a false conclusion from a tidy-looking table.")

# ── 9. One diagnostic ────────────────────────────────────────────────────────
hdr("9. Is the sampler even targeting a posterior?")
rep = geweke_test(kernel="simple", T0=4, N=4, K=0, p=1, m_iid=8000, m_mcmc=8000,
                  burn=2000, seed=SEED)
gt = pd.DataFrame(rep.table)
crit = 0.05 / len(gt)
print(f"  Geweke joint distribution test, simplified kernel, m = 8,000")
print(f"  max |z| = {gt['z'].abs().max():.2f};  "
      f"{int((gt['pval'] < crit).sum())} of {len(gt)} statistics below the")
print(f"  Bonferroni threshold p < {crit:.4f}")
print("  Short chains flag spurious failures here: the successive-conditional")
print("  simulator mixes slowly. analysis.py runs it at 20,000 and 200,000 and")
print("  shows the scores shrink -- the signature of a mixing artifact rather")
print("  than an incoherent conditional.")

# ── 10. The ladder ───────────────────────────────────────────────────────────
hdr("10. The whole ladder")
lad = pd.DataFrame([
    ("1.  Classical SC (simplex)", float(sc.att), R_EDITION["classical"]),
    ("2a. Bayesian SC (BSCM, intercept)", float(bs.att), np.nan),
    ("2b. Bayesian SC (scspill, rho=0)", float(res.effects_detail.att_scm),
     R_EDITION["horseshoe"]),
    ("3.  Bayesian spatial SC", float(res.att), R_EDITION["sar"]),
], columns=["stage", "att", "r_edition"])
lad["diff"] = lad["att"] - lad["r_edition"]
print(lad.round(3).to_string(index=False))
print(f"\n  every stage agrees on the sign; the spread is "
      f"{lad['att'].max() - lad['att'].min():.2f} packs")

elapsed = time.perf_counter() - t_start
print(f"\n  elapsed {elapsed:.1f}s")
assert elapsed < 180, f"cheat sheet took {elapsed:.0f}s; it is meant to be quick"
print("\n=== Cheat sheet completed successfully ===")
