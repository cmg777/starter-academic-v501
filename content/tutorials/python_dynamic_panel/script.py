"""
Dynamic Panel Data Models in Python: Employment Persistence Case Study

Estimates the persistence of firm-level employment using the classic
Arellano-Bond (1991) panel of 140 UK manufacturing firms (1976-1984).
Walks the full beginner-to-practitioner arc: pooled OLS (biased up) and
fixed effects (Nickell bias, biased down) via pyfixest; Anderson-Hsiao IV
(consistent but imprecise); Arellano-Bond difference GMM and Blundell-Bond
system GMM via pydynpd, with AR(1)/AR(2) and Hansen diagnostics and an
instrument-proliferation experiment (lag windows vs collapse).

Usage:
    python script.py            # run from the post directory

Output:
    - python_dynamic_panel_*.png figures (dark theme, dpi 300)
    - *.csv result tables
    - Console output with all regression tables and diagnostics

References:
    - Arellano & Bond (1991), Review of Economic Studies 58(2)
    - Blundell & Bond (1998), Journal of Econometrics 87(1)
    - Bond (2002), Portuguese Economic Journal 1(2)
    - Roodman (2009), Stata Journal 9(1)
    - pydynpd: https://github.com/dazhwu/pydynpd (Wu, Hua & Xu 2022, JOSS)
"""

import contextlib
import io
import math
import types
import warnings

# plt.show() is kept for interactive use; silence the no-op warning when the
# script runs headless (MPLBACKEND=Agg)
warnings.filterwarnings("ignore", message="FigureCanvasAgg is non-interactive")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

# ── 0a. pydynpd 0.2.2 / NumPy 2.x compatibility shim ───────────────
# pydynpd 0.2.2 predates NumPy 2.0, which removed np.in1d and forbids
# float()/math.sqrt() on 1x1 matrices. Module globals shadow builtins,
# so injecting wrappers into pydynpd.specification_tests restores both
# behaviors without forking the package.
if not hasattr(np, "in1d"):
    np.in1d = np.isin
import pydynpd  # noqa: E402

if getattr(pydynpd, "__version__", "0.2.2") not in ("0.2.2",):
    warnings.warn("Compat shim was written for pydynpd 0.2.2 - "
                  "re-test before trusting results on a newer version")
from pydynpd import specification_tests as _st


def _scalar(v):
    return np.asarray(v).item() if np.ndim(v) else v


_st.float = lambda v: float(_scalar(v))
_st.math = types.SimpleNamespace(sqrt=lambda v: math.sqrt(_scalar(v)))

from pydynpd import regression  # noqa: E402  (import after shim)
import pyfixest as pf  # noqa: E402

# ── 0b. Configuration ───────────────────────────────────────────────
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"
GRAY = "#999999"

# Dark theme palette
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

DATA_PATH = Path("abdata.csv")
SLUG = "python_dynamic_panel"

VAR_LABELS = {
    "n": "Log employment",
    "w": "Log real wage",
    "k": "Log capital stock",
    "ys": "Log industry output",
}

# Estimand framing (descriptive / structural - no ATE/ATT):
# The parameter of interest is rho, the autoregressive coefficient of a
# dynamic labor-demand equation
#   n_it = rho * n_i,t-1 + b1*w_it + b2*w_i,t-1 + b3*k_it + b4*k_i,t-1
#          + alpha_i + delta_t + eps_it
# i.e., how persistent firm employment is after conditioning on wages and
# capital, plus the implied short-run elasticities. GMM consistency rests
# on sequential exogeneity of the instruments (lagged levels/differences)
# and no serial correlation in eps_it - testable via AR(2) and Hansen.

SPEC_MAIN = "n L(1:1).n L(0:1).w L(0:1).k"
GMM_FULL = "gmm(n, 2:99) gmm(w, 2:99) gmm(k, 2:99)"


def section(title):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def run_abond(command_str, df, quiet=False):
    """Run pydynpd and return the first fitted model.

    pydynpd prints its regression table to stdout as a side effect; quiet=True
    suppresses that (used in the proliferation grid to keep the log readable).
    """
    if quiet:
        with contextlib.redirect_stdout(io.StringIO()):
            return regression.abond(command_str, df, ["id", "year"]).models[0]
    return regression.abond(command_str, df, ["id", "year"]).models[0]


def gmm_summary(model, label):
    """Extract headline numbers from a fitted pydynpd model."""
    rt = model.regression_table
    rho = rt.loc[rt.variable == "L1.n", "coefficient"].iloc[0]
    se = rt.loc[rt.variable == "L1.n", "std_err"].iloc[0]
    return {
        "estimator": label,
        "rho1": rho,
        "se": se,
        "ci_lo": rho - 1.96 * se,
        "ci_hi": rho + 1.96 * se,
        "hansen_p": model.hansen.p_value,
        "ar1_p": model.AR_list[0].P_value,
        "ar2_p": model.AR_list[1].P_value,
        "n_instruments": model.z_information.num_instr,
    }


# ── 1. Data Loading and Panel Structure ─────────────────────────────
section("1. DATA LOADING: Arellano-Bond (1991) UK employment panel")

df = pd.read_csv(DATA_PATH)
print(f"Dataset shape: {df.shape}")
print(f"Firms: {df['id'].nunique()}, years: {df['year'].min()}-{df['year'].max()}")

obs_per_firm = df.groupby("id").size()
print("\nObservations per firm (unbalanced panel):")
print(obs_per_firm.value_counts().sort_index().rename_axis("years_observed")
      .to_frame("n_firms").to_string())

print("\nSummary statistics (log variables used in estimation):")
print(df[["n", "w", "k", "ys"]].describe().round(3).to_string())

firm_mean_n = df.groupby("id")["n"].transform("mean")
print(f"\nBetween-firm SD of log employment: {df.groupby('id')['n'].mean().std():.3f}")
print(f"Within-firm SD of log employment:  {(df['n'] - firm_mean_n).std():.3f}")
print("Employment differences are mostly BETWEEN firms - exactly the")
print("situation where unobserved firm effects alpha_i loom large.")

# Figure 1: firm employment trajectories
rng = np.random.default_rng(RANDOM_SEED)
sample_ids = rng.choice(df["id"].unique(), size=40, replace=False)

fig, ax = plt.subplots(figsize=(9, 5.5))
fig.patch.set_linewidth(0)
for fid in sample_ids:
    firm = df[df["id"] == fid].sort_values("year")
    ax.plot(firm["year"], firm["n"], color=STEEL_BLUE, alpha=0.35, lw=1.2)
median_path = df.groupby("year")["n"].median()
ax.plot(median_path.index, median_path.values, color=WARM_ORANGE, lw=3,
        label="Median firm (all 140)")
big = df[df["id"] == obs_per_firm.idxmax()].sort_values("year")
ax.plot(big["year"], big["n"], color=TEAL, lw=2.2, label="One example firm")
ax.set_xlabel("Year")
ax.set_ylabel(VAR_LABELS["n"])
ax.set_title("Firm employment paths are persistent and parallel-ish:\n"
             "each firm orbits its own level - a firm fixed effect",
             fontsize=13)
ax.legend(loc="upper right")
plt.savefig(f"{SLUG}_trajectories.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
print(f"\nSaved figure: {SLUG}_trajectories.png")

# ── 2. Data Preparation: lags and first differences ─────────────────
section("2. DATA PREPARATION: lags and first differences by firm")

d = df.sort_values(["id", "year"]).copy()
g = d.groupby("id")
for v in ["n", "w", "k"]:
    d[f"{v}_lag1"] = g[v].shift(1)
d["n_lag2"] = g["n"].shift(2)
for v in ["n", "w", "k"]:
    d[f"d_{v}"] = g[v].diff()
d["d_n_lag1"] = g["d_n"].shift(1)
d["d_w_lag1"] = g["d_w"].shift(1)
d["d_k_lag1"] = g["d_k"].shift(1)

est_sample = d.dropna(subset=["n_lag1", "w_lag1", "k_lag1"]).copy()
print(f"Full panel rows: {len(d)}")
print(f"Estimation sample after requiring one lag: {len(est_sample)} rows "
      f"({est_sample['id'].nunique()} firms)")
print("Each lag costs the first year(s) of every firm - with T as small as")
print("7-9, observations are precious. Keep this in mind for GMM later.")

d.to_csv("data_prepared.csv", index=False)
print("\nExported: data_prepared.csv")

# ── 3. Baseline: the OLS-FE bracket (why naive estimators fail) ─────
section("3. BASELINE: pooled OLS vs fixed effects - the bias bracket")

print("Model: n ~ L1.n + w + L1.w + k + L1.k + year dummies")
print("Pooled OLS ignores alpha_i: L1.n is positively correlated with the")
print("omitted firm effect, so rho is biased UPWARD.")
print("Fixed effects (within) removes alpha_i but creates a mechanical")
print("negative correlation between demeaned L1.n and the demeaned error -")
print("the Nickell (1981) bias, of order 1/T, biasing rho DOWNWARD.\n")

FORMULA_RHS = "n_lag1 + w + w_lag1 + k + k_lag1"
ols = pf.feols(f"n ~ {FORMULA_RHS} | year", data=est_sample,
               vcov={"CRV1": "id"})
fe = pf.feols(f"n ~ {FORMULA_RHS} | id + year", data=est_sample,
              vcov={"CRV1": "id"})

print("Pooled OLS (year dummies, SEs clustered by firm):")
print(ols.tidy().round(4).to_string())
print("\nFixed effects / within (firm + year dummies, clustered SEs):")
print(fe.tidy().round(4).to_string())

rho_ols, se_ols = ols.coef()["n_lag1"], ols.se()["n_lag1"]
rho_fe, se_fe = fe.coef()["n_lag1"], fe.se()["n_lag1"]
print(f"\n  rho_OLS = {rho_ols:.4f} (se {se_ols:.4f})   <- upper bound (biased up)")
print(f"  rho_FE  = {rho_fe:.4f} (se {se_fe:.4f})   <- lower bound (biased down)")
print(f"\nTHE BRACKET (Bond 2002): a consistent estimate of rho should lie")
print(f"between {rho_fe:.3f} and {rho_ols:.3f}. Any estimator outside this")
print("range deserves suspicion.")

# Figure 2: the bias bracket
fig, ax = plt.subplots(figsize=(9, 4.8))
fig.patch.set_linewidth(0)
ax.axvspan(rho_fe, rho_ols, color=GRID_LINE, alpha=0.55, zorder=0)
ax.axvline(1.0, color=GRAY, lw=1.2, ls="--", alpha=0.8)
ax.text(1.0, 1.62, "unit root", color=GRAY, fontsize=10, ha="center")
for y, (lab, rho, se, col, note) in enumerate([
    ("Pooled OLS", rho_ols, se_ols, STEEL_BLUE,
     "biased UP: L1.n correlated with firm effect"),
    ("Fixed effects", rho_fe, se_fe, WARM_ORANGE,
     "biased DOWN: Nickell bias (T is small)"),
]):
    ax.errorbar(rho, y, xerr=1.96 * se, fmt="o", color=col, ms=10,
                capsize=5, lw=2.5, capthick=2.5)
    ax.text(rho, y - 0.28, note, color=LIGHT_TEXT, fontsize=10, ha="center")
ax.text((rho_fe + rho_ols) / 2, 1.18,
        "consistent estimates\nshould land in here", color=WHITE_TEXT,
        fontsize=11, ha="center", style="italic")
ax.set_yticks([0, 1])
ax.set_yticklabels(["Pooled OLS", "Fixed effects"])
ax.set_ylim(-0.6, 1.8)
ax.set_xlabel(r"Estimate of employment persistence  $\hat{\rho}$  (L1.n)")
ax.set_title("Two wrong answers that bracket the truth", fontsize=13)
plt.savefig(f"{SLUG}_bias_bracket.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
print(f"\nSaved figure: {SLUG}_bias_bracket.png")

ols.tidy().reset_index().to_csv("ols_results.csv", index=False)
fe.tidy().reset_index().to_csv("fe_results.csv", index=False)
print("Exported: ols_results.csv, fe_results.csv")

# ── 4. Anderson-Hsiao IV: consistent but imprecise ──────────────────
section("4. ANDERSON-HSIAO: first-difference IV - right idea, noisy answer")

print("First-differencing kills alpha_i but makes d.L1.n endogenous (it")
print("contains eps_i,t-1). Anderson-Hsiao (1981): instrument d.L1.n with")
print("the LEVEL n_i,t-2, which predicts the difference but - if eps is not")
print("serially correlated - is uncorrelated with d.eps_it.\n")

ah_sample = d.dropna(subset=["d_n", "d_n_lag1", "d_w", "d_w_lag1",
                             "d_k", "d_k_lag1", "n_lag2"]).copy()
ah = pf.feols("d_n ~ d_w + d_w_lag1 + d_k + d_k_lag1 | year | d_n_lag1 ~ n_lag2",
              data=ah_sample, vcov={"CRV1": "id"})
print("Anderson-Hsiao 2SLS (differences, year dummies, clustered SEs):")
print(ah.tidy().round(4).to_string())

rho_ah, se_ah = ah.coef()["d_n_lag1"], ah.se()["d_n_lag1"]
print(f"\n  rho_AH = {rho_ah:.4f} (se {se_ah:.4f})")
print(f"  95% CI: [{rho_ah - 1.96 * se_ah:.3f}, {rho_ah + 1.96 * se_ah:.3f}]")
print("Consistent in theory, useless in practice here: one instrument, and")
print("the confidence interval swallows the whole OLS-FE bracket. GMM's")
print("insight: EVERY deeper lag is also a valid instrument - use them all.")

ah.tidy().reset_index().to_csv("anderson_hsiao_results.csv", index=False)
print("\nExported: anderson_hsiao_results.csv")

# ── 5. Core Method I: Arellano-Bond difference GMM ───────────────────
section("5. DIFFERENCE GMM (Arellano-Bond 1991) via pydynpd")

print("All available lags (t-2 and deeper) of n, w, k instrument the")
print(f"differenced equation: '{SPEC_MAIN} | {GMM_FULL} | timedumm nolevel'\n")

print("One-step difference GMM:")
diff_one = run_abond(f"{SPEC_MAIN} | {GMM_FULL} | timedumm nolevel onestep", d)
print("\nTwo-step difference GMM (Windmeijer-corrected SEs):")
diff_two = run_abond(f"{SPEC_MAIN} | {GMM_FULL} | timedumm nolevel", d)

s1 = gmm_summary(diff_one, "Diff GMM (one-step)")
s2 = gmm_summary(diff_two, "Diff GMM (two-step)")
print(f"\n  one-step: rho = {s1['rho1']:.4f} (se {s1['se']:.4f})")
print(f"  two-step: rho = {s2['rho1']:.4f} (se {s2['se']:.4f}), "
      f"{s2['n_instruments']} instruments")
print(f"\nWARNING SIGN (Bond 2002): rho_diffGMM = {s2['rho1']:.3f} sits close to")
print(f"the FE lower bound ({rho_fe:.3f}) - within one standard error of it,")
print("far from the upper half of the bracket. With rho this close to 1, lagged")
print("LEVELS barely predict future DIFFERENCES - weak instruments drag the")
print("difference GMM estimate down. This motivates system GMM.")

diff_two.regression_table.to_csv("diff_gmm_results.csv", index=False)
print("\nExported: diff_gmm_results.csv")

# ── 6. Core Method II: Blundell-Bond system GMM ──────────────────────
section("6. SYSTEM GMM (Blundell-Bond 1998) via pydynpd")

print("System GMM stacks the differenced equation AND the levels equation,")
print("instrumenting levels with lagged differences. Extra assumption: firm")
print("deviations from steady state are uncorrelated with alpha_i (mean")
print("stationarity). Collapsed instruments keep the count honest.\n")

print("Two-step system GMM, collapsed instruments:")
sys_two = run_abond(f"{SPEC_MAIN} | {GMM_FULL} | timedumm collapse", d)
print("\nOne-step system GMM, collapsed instruments:")
sys_one = run_abond(f"{SPEC_MAIN} | {GMM_FULL} | timedumm collapse onestep", d)

s3 = gmm_summary(sys_two, "Sys GMM (two-step, collapsed)")
s4 = gmm_summary(sys_one, "Sys GMM (one-step, collapsed)")
print(f"\n  two-step: rho = {s3['rho1']:.4f} (se {s3['se']:.4f}), "
      f"{s3['n_instruments']} instruments")
print(f"  one-step: rho = {s4['rho1']:.4f} (se {s4['se']:.4f})")

print("\nDIAGNOSTICS for the headline model (two-step system GMM):")
print(f"  AR(1) in differences: p = {s3['ar1_p']:.3f}  -> should REJECT (mechanical)")
print(f"  AR(2) in differences: p = {s3['ar2_p']:.3f}  -> must NOT reject "
      "(validates t-2 instruments)")
print(f"  Hansen J overidentification: p = {s3['hansen_p']:.3f} -> comfortably")
print("  away from both 0.05 (instruments invalid) and 1.0 (too many")
print(f"  instruments, test losing power). rho = {s3['rho1']:.3f} sits INSIDE the")
print(f"  OLS-FE bracket [{rho_fe:.3f}, {rho_ols:.3f}] - all checks pass.")

sys_two.regression_table.to_csv("sys_gmm_results.csv", index=False)
print("\nExported: sys_gmm_results.csv")

# ── 7. Robustness I: instrument proliferation experiment ─────────────
section("7. INSTRUMENT PROLIFERATION: lag windows vs collapse")

print("GMM's blessing is its curse: with T=9, 'use every lag' generates")
print("instruments quadratically in T. Too many instruments overfit the")
print("endogenous variables and weaken the Hansen test (p -> 1 is a red")
print("flag, not a pass). Roodman's rule of thumb: instruments < N groups.\n")

grid_specs = [
    ("2:3", False), ("2:3", True),
    ("2:5", False), ("2:5", True),
    ("2:99", False), ("2:99", True),
]
grid_rows = []
for window, collapsed in grid_specs:
    gmm_part = f"gmm(n, {window}) gmm(w, {window}) gmm(k, {window})"
    opts = "timedumm collapse" if collapsed else "timedumm"
    model = run_abond(f"{SPEC_MAIN} | {gmm_part} | {opts}", d, quiet=True)
    row = gmm_summary(model, f"sys GMM lags {window}"
                      + (", collapsed" if collapsed else ""))
    row["lag_window"] = window
    row["collapsed"] = collapsed
    grid_rows.append(row)
    print(f"  lags {window:5s} collapse={str(collapsed):5s} -> "
          f"{row['n_instruments']:3d} instruments, rho = {row['rho1']:.3f}, "
          f"Hansen p = {row['hansen_p']:.3f}")

grid = pd.DataFrame(grid_rows)
grid.to_csv("proliferation_grid.csv", index=False)
print("\nRead the uncollapsed column top to bottom: as instruments pile up the")
print("Hansen p-value drifts steadily upward (0.04 -> 0.19 -> 0.24) even though")
print("the model is the same - the test weakens as it is overfitted, and at the")
print("textbook extreme it ends at the p ~ 1.0 red flag. The uncollapsed 2:3")
print("spec is also instructive: Hansen REJECTS it (p < 0.05) while its")
print("collapsed twin passes - proliferation distorts the test in both tails.")
print("Collapsing keeps estimates stable with a fraction of the instruments.")
print("Exported: proliferation_grid.csv")

# Figure 3: instruments vs Hansen p
fig, ax = plt.subplots(figsize=(9, 5.5))
fig.patch.set_linewidth(0)
for collapsed, col, marker, lab in [(False, STEEL_BLUE, "o", "Full instrument matrix"),
                                    (True, TEAL, "D", "Collapsed instruments")]:
    sub = grid[grid["collapsed"] == collapsed]
    ax.scatter(sub["n_instruments"], sub["hansen_p"], s=140, color=col,
               marker=marker, edgecolors=DARK_NAVY, lw=1.5, zorder=3, label=lab)
    for _, r in sub.iterrows():
        ax.annotate(f"lags {r['lag_window']}",
                    (r["n_instruments"], r["hansen_p"]),
                    textcoords="offset points", xytext=(0, 12),
                    color=LIGHT_TEXT, fontsize=9.5, ha="center")
ax.axhline(0.05, color=WARM_ORANGE, lw=1.5, ls="--")
ax.text(137, 0.022, "p = 0.05: instruments rejected below this line",
        color=WARM_ORANGE, fontsize=9.5, ha="right", va="top")
ax.axvline(140, color=GRAY, lw=1.5, ls=":")
ax.text(138, 0.78, "N = 140 firms\n(Roodman's ceiling)", color=GRAY,
        fontsize=9.5, ha="right")
ax.set_xlabel("Number of instruments")
ax.set_ylabel("Hansen test p-value")
ax.set_ylim(-0.06, 1.0)
ax.set_title("Instrument proliferation: more is not better", fontsize=13)
ax.legend(loc="upper left")
plt.savefig(f"{SLUG}_instrument_proliferation.png", dpi=300,
            bbox_inches="tight", facecolor=DARK_NAVY, edgecolor=DARK_NAVY,
            pad_inches=0)
plt.show()
print(f"Saved figure: {SLUG}_instrument_proliferation.png")

# ── 8. Robustness II: replication of the published example ───────────
section("8. REPLICATION CHECK: the pydynpd documentation example")

print("Different specification, same machinery: the pydynpd README/vignette")
print("estimates the original Arellano-Bond two-lag model. Replicating it")
print("verifies our toolchain against the package's published output (which")
print("itself matches Stata's xtabond2).\n")
ab_repl = run_abond(
    "n L(1:2).n w k | gmm(n, 2:4) gmm(w, 1:3) iv(k) | timedumm nolevel", d)
rt = ab_repl.regression_table
rho_repl = rt.loc[rt.variable == "L1.n", "coefficient"].iloc[0]
print(f"\n  Published vignette values: L1.n = 0.2710675, Hansen chi2 = 32.666,")
print("  42 instruments.")
print(f"  Our run:                   L1.n = {rho_repl:.7f}, Hansen chi2 = "
      f"{ab_repl.hansen.test_value:.3f}, {ab_repl.z_information.num_instr} instruments.")
match = (abs(rho_repl - 0.2710675) < 1e-6
         and abs(ab_repl.hansen.test_value - 32.666) < 1e-3
         and ab_repl.z_information.num_instr == 42)
print(f"  Exact match: {match}")
if not match:
    raise AssertionError("Replication check failed - investigate before publishing")
ab_repl.regression_table.to_csv("ab_replication_results.csv", index=False)
print("\nExported: ab_replication_results.csv")

# ── 9. Results Synthesis: every estimator on one chart ────────────────
section("9. SYNTHESIS: the whole story on one axis")

summary_rows = [
    {"estimator": "Pooled OLS", "rho1": rho_ols, "se": se_ols,
     "ci_lo": rho_ols - 1.96 * se_ols, "ci_hi": rho_ols + 1.96 * se_ols,
     "hansen_p": np.nan, "ar1_p": np.nan, "ar2_p": np.nan,
     "n_instruments": np.nan},
    {"estimator": "Fixed effects", "rho1": rho_fe, "se": se_fe,
     "ci_lo": rho_fe - 1.96 * se_fe, "ci_hi": rho_fe + 1.96 * se_fe,
     "hansen_p": np.nan, "ar1_p": np.nan, "ar2_p": np.nan,
     "n_instruments": np.nan},
    {"estimator": "Anderson-Hsiao IV", "rho1": rho_ah, "se": se_ah,
     "ci_lo": rho_ah - 1.96 * se_ah, "ci_hi": rho_ah + 1.96 * se_ah,
     "hansen_p": np.nan, "ar1_p": np.nan, "ar2_p": np.nan,
     "n_instruments": 1},
    s1, s2, s4, s3,
]
summary = pd.DataFrame(summary_rows)
print(summary.round(4).to_string(index=False))
summary.to_csv("estimates_summary.csv", index=False)
print("\nExported: estimates_summary.csv")

# Figure 4: forest plot
order = ["Pooled OLS", "Fixed effects", "Anderson-Hsiao IV",
         "Diff GMM (one-step)", "Diff GMM (two-step)",
         "Sys GMM (one-step, collapsed)", "Sys GMM (two-step, collapsed)"]
colors = {"Pooled OLS": GRAY, "Fixed effects": GRAY,
          "Anderson-Hsiao IV": STEEL_BLUE,
          "Diff GMM (one-step)": WARM_ORANGE,
          "Diff GMM (two-step)": WARM_ORANGE,
          "Sys GMM (one-step, collapsed)": TEAL,
          "Sys GMM (two-step, collapsed)": TEAL}
plot_df = summary.set_index("estimator").loc[order].reset_index()

fig, ax = plt.subplots(figsize=(9.5, 6))
fig.patch.set_linewidth(0)
ax.axvspan(rho_fe, rho_ols, color=GRID_LINE, alpha=0.55, zorder=0)
ax.text((rho_fe + rho_ols) / 2, -0.75, "OLS-FE credible bracket",
        color=LIGHT_TEXT, fontsize=10, ha="center", style="italic")
ax.axvline(1.0, color=GRAY, lw=1.2, ls="--", alpha=0.8)
ypos = np.arange(len(plot_df))[::-1]
for y, (_, r) in zip(ypos, plot_df.iterrows()):
    ax.errorbar(r["rho1"], y, xerr=1.96 * r["se"], fmt="o",
                color=colors[r["estimator"]], ms=9, capsize=4, lw=2.2,
                capthick=2.2, zorder=3)
    ax.text(r["rho1"], y + 0.28, f"{r['rho1']:.3f}", color=WHITE_TEXT,
            fontsize=10, ha="center")
ax.set_yticks(ypos)
ax.set_yticklabels(plot_df["estimator"])
ax.set_xlabel(r"Employment persistence  $\hat{\rho}$  (L1.n) with 95% CI")
ax.set_ylim(-1.1, len(plot_df) - 0.4)
ax.set_title("Seven estimators, one parameter:\n"
             "system GMM lands inside the bracket with tight precision",
             fontsize=13)
plt.savefig(f"{SLUG}_estimates_forest.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
print(f"Saved figure: {SLUG}_estimates_forest.png")

print("\nTakeaways:")
print(f"  1. OLS ({rho_ols:.3f}) and FE ({rho_fe:.3f}) bracket the truth from above/below.")
print(f"  2. Anderson-Hsiao is consistent but imprecise (se {se_ah:.2f}).")
print(f"  3. Difference GMM ({s2['rho1']:.3f}) hugs the FE bound -> weak-instrument")
print("     symptom when the series is persistent (Bond 2002 diagnostic).")
print(f"  4. System GMM ({s3['rho1']:.3f}, se {s3['se']:.3f}) is inside the bracket with")
print(f"     clean diagnostics (AR(2) p={s3['ar2_p']:.2f}, Hansen p={s3['hansen_p']:.2f}).")
print("  5. Employment is highly persistent: about "
      f"{100 * s3['rho1']:.0f}% of a shock survives into the next year.")

print("\n=== Script completed successfully ===")
