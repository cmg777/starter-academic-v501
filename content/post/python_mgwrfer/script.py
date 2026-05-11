"""
Multiscale Geographically Weighted Fixed Effects Regression (MGWFER)

Demonstrates the MGWFER method using simulated panel data with known
spatially varying coefficients and a time-invariant spatial confounder.
Implements the two-stage algorithm from Li & Fotheringham (2026):
    Stage 1 — within-transform + standardise + MGWR + back-transform
              to recover spatially varying slopes beta_bwk(u_i, v_i).
    Stage 2 — recover individual fixed effects alpha_i (Eq. 30) and
              compute t-tests for each unit (Eqs. 32-37).

Compares naive pooled MGWR (PMGWR, biased) with MGWFER (bias-corrected)
to show how fixed effects remove omitted variable bias in local models,
and recovers the intrinsic contextual effects (alpha_i) as a quantity
of substantive interest.

Note on filenames: output PNG/CSV files retain the historical "mgwrfer_"
prefix for URL/asset stability with the existing post slug.

Usage:
    python script.py

Outputs:
    - 7 PNG figures (DPI=300)
    - 6 CSV data files
    - README.md artifact inventory

References:
    - Li, Z. & Fotheringham, A. S. (2026). Spatial Context as a
      Time-Invariant Confounder: A Fixed-Effects Extension of MGWR.
      Annals of the American Association of Geographers.
      https://doi.org/10.1080/24694452.2026.2654481
    - Fotheringham et al. (2017). Multiscale GWR.
    - Oshan et al. (2019). mgwr Python package.
    - GeoZhipengLi/MGWPR — custom mgwr fork with panel data support.
"""

import os
import sys
import subprocess
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.api as sm  # for global OLS / pooled OLS / FE baselines
from matplotlib.patches import Patch
from scipy import stats
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=RuntimeWarning)

# ── 0. Configuration ─────────────────────────────────────────────

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Spatial grid (15x15 for tractable computation; paper uses 30x30)
N_GRID = 15
N_UNITS = N_GRID * N_GRID  # 225
N_TIME = 3
N_OBS = N_UNITS * N_TIME   # 675

# DGP parameters from Li & Fotheringham (2026) Eqs. 40-44:
#   x_kt = SC_COUPLING * sc_i + N(0, SIGMA_X) for k=1..4
#   epsilon ~ N(0, SIGMA_EPS)
# These activate the indirect contextual effect channel sc -> x_k.
SIGMA_X = 0.5
SC_COUPLING = 0.05
SIGMA_EPS = 0.5

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# Dark theme palette
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"

# Plot defaults
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

# ── 1. Install Custom MGWR Package ───────────────────────────────

REPO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mgwpr_repo")

if not os.path.exists(REPO_DIR):
    print("Cloning MGWPR repository...")
    subprocess.run(
        ["git", "clone", "https://github.com/GeoZhipengLi/MGWPR.git", REPO_DIR],
        check=True, capture_output=True
    )
    print(f"Cloned to: {REPO_DIR}")
else:
    print(f"MGWPR repository already exists at: {REPO_DIR}")

# Add to path (takes precedence over any pip-installed mgwr)
sys.path.insert(0, REPO_DIR)

from mgwr.gwr import GWR, MGWR
from mgwr.sel_bw import Sel_BW

print("Custom mgwr package imported successfully")
print(f"  GWR: {GWR}")
print(f"  MGWR: {MGWR}")
print(f"  Sel_BW: {Sel_BW}")

# ── 2. Simulate Panel Data with Spatially Varying Coefficients ───

print("\n" + "=" * 60)
print("DATA GENERATING PROCESS (DGP)")
print("=" * 60)

rng = np.random.default_rng(RANDOM_SEED)

# Create spatial grid
grid_i = np.repeat(np.arange(1, N_GRID + 1), N_GRID)  # row coords
grid_j = np.tile(np.arange(1, N_GRID + 1), N_GRID)    # col coords

# True spatially varying coefficients
# beta_1: quadratic dome pattern (peaks at center)
q = np.ceil(N_GRID / 4)
beta_1_true = 1 + ((q**2 - (q - grid_i / 2)**2) *
                    (q**2 - (q - grid_j / 2)**2)) / q**4

# beta_2: linear gradient (increases with i+j)
beta_2_true = 1 + (grid_i + grid_j) / (2 * N_GRID)

# beta_3: constant across space
beta_3_true = np.full(N_UNITS, 1.5)

# beta_4: null effect (for false positive testing)
beta_4_true = np.zeros(N_UNITS)

# Time-invariant spatial context (paper Eq. 39): sc_i = 30 * (exp(j/N_GRID) - 1)
# We retain the name `alpha_true` for backwards compatibility with downstream
# code/CSVs; conceptually this is sc_i in Li & Fotheringham (2026).
alpha_true = 30 * (np.exp(grid_j / N_GRID) - 1)

print(f"\nSpatial grid: {N_GRID} x {N_GRID} = {N_UNITS} units")
print(f"Time periods: {N_TIME}")
print(f"Total observations: {N_OBS}")

print("\n── True coefficient ranges ──")
print(f"  beta_1 (quadratic): [{beta_1_true.min():.3f}, {beta_1_true.max():.3f}], "
      f"mean={beta_1_true.mean():.3f}")
print(f"  beta_2 (linear):    [{beta_2_true.min():.3f}, {beta_2_true.max():.3f}], "
      f"mean={beta_2_true.mean():.3f}")
print(f"  beta_3 (constant):  [{beta_3_true.min():.3f}, {beta_3_true.max():.3f}], "
      f"mean={beta_3_true.mean():.3f}")
print(f"  beta_4 (null):      [{beta_4_true.min():.3f}, {beta_4_true.max():.3f}], "
      f"mean={beta_4_true.mean():.3f}")
print(f"  sc / alpha (FE):    [{alpha_true.min():.3f}, {alpha_true.max():.3f}], "
      f"mean={alpha_true.mean():.3f}")

# Generate panel observations
unit_ids = np.repeat(np.arange(N_UNITS), N_TIME)
time_ids = np.tile(np.arange(N_TIME), N_UNITS)
coords_i = np.repeat(grid_i, N_TIME)
coords_j = np.repeat(grid_j, N_TIME)
sc_repeat = np.repeat(alpha_true, N_TIME)  # sc_i replicated across t

# Paper Eqs. 40-43: x_kt ~ N(0, SIGMA_X) + SC_COUPLING * sc_i for k=1..4
# This is the INDIRECT CONTEXTUAL EFFECT channel: spatial context drives the
# levels of the covariates. Without this coupling, the bias mechanism the
# paper's MGWFER is built to remove would be absent.
# (SIGMA_X, SC_COUPLING are defined in the Configuration block at the top.)
x1 = SIGMA_X * rng.standard_normal(N_OBS) + SC_COUPLING * sc_repeat
x2 = SIGMA_X * rng.standard_normal(N_OBS) + SC_COUPLING * sc_repeat
x3 = SIGMA_X * rng.standard_normal(N_OBS) + SC_COUPLING * sc_repeat
x4 = SIGMA_X * rng.standard_normal(N_OBS) + SC_COUPLING * sc_repeat  # null effect

# Spatially varying coefficients (repeated for each time period)
b1 = np.repeat(beta_1_true, N_TIME)
b2 = np.repeat(beta_2_true, N_TIME)
b3 = np.repeat(beta_3_true, N_TIME)
b4 = np.repeat(beta_4_true, N_TIME)
alpha_panel = np.repeat(alpha_true, N_TIME)

# Paper Eqs. 44-45: epsilon ~ N(0, SIGMA_EPS) and y = sc + b1*x1 + b2*x2 + b3*x3 + eps
# Note: beta_4 * x4 is DROPPED from y -- x4 has no causal effect, only an
# indirect (correlational) link to y via the shared sc parent.
epsilon = SIGMA_EPS * rng.standard_normal(N_OBS)
y = alpha_panel + b1 * x1 + b2 * x2 + b3 * x3 + epsilon

# Sanity check: Cor(x_k, sc) should be moderate (the indirect channel is active)
print("\n── Indirect contextual effect strength (paper's bias source) ──")
print(f"  Cor(x1, sc) = {np.corrcoef(x1, sc_repeat)[0, 1]:.3f}")
print(f"  Cor(x2, sc) = {np.corrcoef(x2, sc_repeat)[0, 1]:.3f}")
print(f"  Cor(x3, sc) = {np.corrcoef(x3, sc_repeat)[0, 1]:.3f}")
print(f"  Cor(x4, sc) = {np.corrcoef(x4, sc_repeat)[0, 1]:.3f}")
print(f"  Cor(x4, y)  = {np.corrcoef(x4, y)[0, 1]:.3f} "
      f"(non-causal correlation via sc)")

# Assemble DataFrame
panel_df = pd.DataFrame({
    "unit_id": unit_ids,
    "time_id": time_ids,
    "coord_i": coords_i,
    "coord_j": coords_j,
    "y": y,
    "x1": x1,
    "x2": x2,
    "x3": x3,
    "x4": x4,
    "alpha_true": alpha_panel,
    "beta1_true": b1,
    "beta2_true": b2,
    "beta3_true": b3,
    "beta4_true": b4,
})

print(f"\nPanel data shape: {panel_df.shape}")
print(panel_df[["y", "x1", "x2", "x3", "x4"]].describe().round(3).to_string())

# Export simulated data
panel_df.to_csv("simulated_panel_data.csv", index=False)
print("\nExported: simulated_panel_data.csv")

# Export true coefficients (one row per unit)
true_coef_df = pd.DataFrame({
    "unit_id": np.arange(N_UNITS),
    "coord_i": grid_i,
    "coord_j": grid_j,
    "beta_1": beta_1_true,
    "beta_2": beta_2_true,
    "beta_3": beta_3_true,
    "beta_4": beta_4_true,
    "alpha": alpha_true,
})
true_coef_df.to_csv("true_coefficients.csv", index=False)
print("Exported: true_coefficients.csv")

# ── 3. Global Model Baselines (paper Table 2 replication) ────────

# Three global models for comparison:
#   (a) cross-sectional OLS  -- uses only one time period
#   (b) pooled OLS           -- treats all 675 obs as independent
#   (c) individual FE        -- within estimator (manual demeaning)
# The paper finds (a) and (b) wildly biased (estimates near 6, true = 1.5)
# and spuriously significant on x4. The FE model corrects these.

print("\n" + "=" * 60)
print("GLOBAL MODEL BASELINES (paper Table 2 replication)")
print("=" * 60)

mask_t0 = panel_df["time_id"].values == 0
y_cs = panel_df.loc[mask_t0, "y"].values
X_cs_raw = panel_df.loc[mask_t0, ["x1", "x2", "x3", "x4"]].values

# (a) Cross-sectional OLS on period 0
ols_cs = sm.OLS(y_cs, sm.add_constant(X_cs_raw)).fit()
print("\n(a) Cross-sectional OLS (period 0, 225 obs)")
print(f"    intercept = {ols_cs.params[0]:>8.3f}   p = {ols_cs.pvalues[0]:.3g}")
for k in range(4):
    print(f"    beta_{k+1}   = {ols_cs.params[k+1]:>8.3f}   "
          f"p = {ols_cs.pvalues[k+1]:.3g}")
print(f"    R^2 = {ols_cs.rsquared:.4f}")

# (b) Pooled OLS on all 675 obs
X_p_raw = panel_df[["x1", "x2", "x3", "x4"]].values
ols_pool = sm.OLS(panel_df["y"].values, sm.add_constant(X_p_raw)).fit()
print("\n(b) Pooled OLS (all 675 obs)")
print(f"    intercept = {ols_pool.params[0]:>8.3f}   p = {ols_pool.pvalues[0]:.3g}")
for k in range(4):
    print(f"    beta_{k+1}   = {ols_pool.params[k+1]:>8.3f}   "
          f"p = {ols_pool.pvalues[k+1]:.3g}")
print(f"    R^2 = {ols_pool.rsquared:.4f}")

# (c) Individual FE via within-transformation (paper Eqs. 16-19)
um = panel_df.groupby("unit_id")[["y", "x1", "x2", "x3", "x4"]].transform("mean")
y_w = panel_df["y"].values - um["y"].values
X_w = panel_df[["x1", "x2", "x3", "x4"]].values - um[["x1", "x2", "x3", "x4"]].values
fe_global = sm.OLS(y_w, X_w).fit()  # no intercept -- demeaning absorbs it

# Recover alpha_i (paper Eq. 19): alpha_hat_i = y_bar_i - x_bar_i * beta_hat
y_bar_i = panel_df.groupby("unit_id")["y"].mean().reindex(np.arange(N_UNITS)).values
x_bar_i = (panel_df.groupby("unit_id")[["x1", "x2", "x3", "x4"]]
           .mean().reindex(np.arange(N_UNITS)).values)
alpha_fe_global = y_bar_i - x_bar_i @ fe_global.params

print("\n(c) Individual FE (within estimator, 675 obs)")
for k in range(4):
    print(f"    beta_{k+1}   = {fe_global.params[k]:>8.3f}   "
          f"p = {fe_global.pvalues[k]:.3g}")
print(f"    R^2 (within) = {fe_global.rsquared:.4f}")
print(f"    mean(alpha_hat) = {alpha_fe_global.mean():.3f} "
      f"(true mean = {alpha_true.mean():.3f})")
print(f"    alpha_hat range = [{alpha_fe_global.min():.3f}, "
      f"{alpha_fe_global.max():.3f}] (true range = "
      f"[{alpha_true.min():.3f}, {alpha_true.max():.3f}])")

# Export Table 2 replication
def _row(name, params, pvals, sc_summary):
    return {
        "model": name,
        "SC_mean": sc_summary,
        "beta_1": params[0],
        "p_1":    pvals[0],
        "beta_2": params[1],
        "p_2":    pvals[1],
        "beta_3": params[2],
        "p_3":    pvals[2],
        "beta_4": params[3],
        "p_4":    pvals[3],
    }
global_rows = [
    _row("TRUE", [beta_1_true.mean(), beta_2_true.mean(),
                  beta_3_true.mean(), 0.0],
         [np.nan]*4, alpha_true.mean()),
    _row("OLS_cs",   ols_cs.params[1:].tolist(),   ols_cs.pvalues[1:].tolist(),
         ols_cs.params[0]),
    _row("OLS_pool", ols_pool.params[1:].tolist(), ols_pool.pvalues[1:].tolist(),
         ols_pool.params[0]),
    _row("FE",       fe_global.params.tolist(),    fe_global.pvalues.tolist(),
         alpha_fe_global.mean()),
]
pd.DataFrame(global_rows).to_csv("global_models_comparison.csv", index=False)
print("\nExported: global_models_comparison.csv")

# ── 4. True Coefficient Surfaces ─────────────────────────────────

print("\n── Plotting true coefficient surfaces ──")

fig, axes = plt.subplots(2, 2, figsize=(12, 11))
fig.patch.set_facecolor(DARK_NAVY)
fig.suptitle("True Data Generating Process: Spatially Varying Coefficients",
             fontsize=14, color=WHITE_TEXT, y=0.98)

surfaces = [
    (beta_1_true, r"$\beta_1$ (quadratic dome)", "coolwarm"),
    (beta_2_true, r"$\beta_2$ (linear gradient)", "coolwarm"),
    (beta_3_true, r"$\beta_3$ (constant = 1.5)", "coolwarm"),
    (alpha_true, r"$\alpha_i$ (fixed effect / confounder)", "viridis"),
]

for ax, (vals, title, cmap) in zip(axes.flat, surfaces):
    img = ax.imshow(vals.reshape(N_GRID, N_GRID), cmap=cmap,
                    origin="lower", aspect="equal")
    ax.set_title(title, fontsize=12, color=WHITE_TEXT, pad=8)
    ax.set_xlabel("j (column)", fontsize=10)
    ax.set_ylabel("i (row)", fontsize=10)
    ax.set_xticks([0, N_GRID // 2, N_GRID - 1])
    ax.set_xticklabels(["1", str(N_GRID // 2 + 1), str(N_GRID)])
    ax.set_yticks([0, N_GRID // 2, N_GRID - 1])
    ax.set_yticklabels(["1", str(N_GRID // 2 + 1), str(N_GRID)])
    cbar = plt.colorbar(img, ax=ax, fraction=0.046, pad=0.04)
    cbar.ax.yaxis.set_tick_params(color=LIGHT_TEXT)
    cbar.outline.set_edgecolor(GRID_LINE)
    for label in cbar.ax.get_yticklabels():
        label.set_color(LIGHT_TEXT)

plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.savefig("mgwrfer_true_coefficients.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: mgwrfer_true_coefficients.png")

# ── 5. Pooled MGWR (PMGWR) — Ignoring Panel Structure ────────────

# ESTIMAND: Local marginal effects beta_k(i,j)
# CAUSAL ASSUMPTION FAILURE: Pooled MGWR treats panel data as cross-sectional.
# The time-invariant spatial confounder (alpha_i) is NOT removed,
# biasing all coefficient estimates.

print("\n" + "=" * 60)
print("POOLED MGWR (NAIVE — ignoring fixed effects)")
print("=" * 60)

# Prepare arrays for the custom mgwr package
Y_raw = panel_df["y"].values.reshape(-1, 1)
X_raw = panel_df[["x1", "x2", "x3", "x4"]].values
coords_panel = list(zip(panel_df["coord_i"].values.astype(float),
                        panel_df["coord_j"].values.astype(float)))

# Standardize
Y_std_pooled = (Y_raw - Y_raw.mean()) / Y_raw.std()
X_std_pooled = (X_raw - X_raw.mean(axis=0)) / X_raw.std(axis=0)

# Store scaling factors for back-transformation
y_mean_pooled = Y_raw.mean()
y_std_pooled = Y_raw.std()
x_means_pooled = X_raw.mean(axis=0)
x_stds_pooled = X_raw.std(axis=0)

print("Selecting bandwidths for pooled MGWR...")
print(f"  N observations: {N_OBS}")
print(f"  N covariates: {X_raw.shape[1]}")

# Bandwidth selection (multi=True for MGWR)
pooled_selector = Sel_BW(
    coords_panel, Y_std_pooled, X_std_pooled,
    multi=True, constant=True, time=N_TIME
)
pooled_bw = pooled_selector.search()

print(f"\nPooled MGWR bandwidths: {pooled_bw}")

# Fit pooled MGWR
print("Fitting pooled MGWR model...")
pooled_model = MGWR(
    coords_panel, Y_std_pooled, X_std_pooled,
    pooled_selector, constant=True, time=N_TIME
).fit()

print(f"Pooled MGWR R-squared: {pooled_model.R2:.4f}")
print(f"Pooled MGWR Adj. R-squared: {pooled_model.adj_R2:.4f}")
print(f"Pooled MGWR AICc: {pooled_model.aicc:.2f}")

# Back-transform parameters to original scale
# For standardized model: beta_orig = beta_std * (y_std / x_std)
# Note on the intercept scale: PMGWR's local intercept here is reported as
# `sigma_y * intercept_std`, i.e. the deviation from the global mean of y.
# It is NOT shifted by `+ y_mean - x_mean @ beta`, so it is centred around
# zero rather than around y's mean (compare with the cross-sectional MGWR
# back-transform below, which DOES include that shift). Both conventions are
# used in the literature; the partial back-transform matches Li & Fotheringham
# (2026) Figure 5, which reports MGWR/PMGWR intercepts in the range ±17
# against a true sc range of 0-50. The post discusses this explicitly.
n_params_pooled = pooled_model.params.shape[1]
print(f"Number of parameter columns: {n_params_pooled}")

# Column 0 is intercept, columns 1-4 are x1-x4
pooled_params_orig = np.zeros_like(pooled_model.params)
pooled_params_orig[:, 0] = pooled_model.params[:, 0] * y_std_pooled  # intercept (zero-centred)
for k in range(4):
    pooled_params_orig[:, k + 1] = (pooled_model.params[:, k + 1] *
                                     y_std_pooled / x_stds_pooled[k])

# Average parameters per unit (across time periods)
pooled_params_by_unit = np.zeros((N_UNITS, n_params_pooled))
for i in range(N_UNITS):
    mask = panel_df["unit_id"].values == i
    pooled_params_by_unit[i] = pooled_params_orig[mask].mean(axis=0)

# Export
pooled_df = pd.DataFrame(
    pooled_params_by_unit,
    columns=["intercept", "beta1_pooled", "beta2_pooled",
             "beta3_pooled", "beta4_pooled"]
)
pooled_df["unit_id"] = np.arange(N_UNITS)
pooled_df.to_csv("pooled_mgwr_params.csv", index=False)
print("\nExported: pooled_mgwr_params.csv")

# Compute RMSE for pooled
rmse_pooled = {}
for k, (col, true_vals) in enumerate(zip(
    ["beta1_pooled", "beta2_pooled", "beta3_pooled", "beta4_pooled"],
    [beta_1_true, beta_2_true, beta_3_true, beta_4_true]
)):
    rmse = np.sqrt(np.mean((pooled_df[col].values - true_vals)**2))
    corr = np.corrcoef(pooled_df[col].values, true_vals)[0, 1]
    rmse_pooled[f"beta_{k+1}"] = {"rmse": rmse, "corr": corr}
    print(f"  {col}: RMSE={rmse:.4f}, Corr={corr:.4f}")

# ── 6. Cross-Sectional MGWR (Single-Period Baseline) ─────────────

# ESTIMAND: Local marginal effects beta_k(u_i, v_i) from a single period.
# CAUSAL ASSUMPTION FAILURE: Cross-sectional MGWR has no panel structure to
# exploit -- it cannot remove time-invariant spatial confounders.
# This is the standard "naive local" baseline in Li & Fotheringham (2026).

print("\n" + "=" * 60)
print("CROSS-SECTIONAL MGWR (single period, ignoring panel)")
print("=" * 60)

mask_t0_full = panel_df["time_id"].values == 0
coords_cs = list(zip(panel_df.loc[mask_t0_full, "coord_i"].values.astype(float),
                     panel_df.loc[mask_t0_full, "coord_j"].values.astype(float)))
Y_cs_raw = panel_df.loc[mask_t0_full, "y"].values.reshape(-1, 1)
X_cs_raw_mat = panel_df.loc[mask_t0_full, ["x1", "x2", "x3", "x4"]].values

# Standardize
Y_cs_std = (Y_cs_raw - Y_cs_raw.mean()) / Y_cs_raw.std()
X_cs_std = (X_cs_raw_mat - X_cs_raw_mat.mean(axis=0)) / X_cs_raw_mat.std(axis=0)

y_std_cs_val = float(Y_cs_raw.std())
x_stds_cs = X_cs_raw_mat.std(axis=0)
y_mean_cs_val = float(Y_cs_raw.mean())
x_means_cs = X_cs_raw_mat.mean(axis=0)

print("Selecting bandwidths for cross-sectional MGWR...")
# The custom GeoZhipengLi/MGWPR fork requires `time` even for single-period
# data; passing time=1 makes each row a separate "panel" of length 1, i.e. a
# pure cross-section.
mgwr_cs_sel = Sel_BW(
    coords_cs, Y_cs_std, X_cs_std,
    multi=True, constant=True, time=1
)
mgwr_cs_bw = mgwr_cs_sel.search()
print(f"\nCross-sectional MGWR bandwidths: {mgwr_cs_bw}")

print("Fitting cross-sectional MGWR model...")
mgwr_cs_model = MGWR(
    coords_cs, Y_cs_std, X_cs_std,
    mgwr_cs_sel, constant=True, time=1
).fit()
print(f"Cross-sectional MGWR R-squared: {mgwr_cs_model.R2:.4f}")
print(f"Cross-sectional MGWR AICc: {mgwr_cs_model.aicc:.2f}")

# Back-transform parameters (intercept + 4 slopes)
mgwr_cs_params_orig = np.zeros_like(mgwr_cs_model.params)
mgwr_cs_params_orig[:, 0] = mgwr_cs_model.params[:, 0] * y_std_cs_val  # intercept (centered)
# Shift intercept back to original location: a = a_centered + y_mean - x_mean @ b
for k in range(4):
    mgwr_cs_params_orig[:, k + 1] = (mgwr_cs_model.params[:, k + 1] *
                                     y_std_cs_val / x_stds_cs[k])
mgwr_cs_params_orig[:, 0] = (mgwr_cs_params_orig[:, 0] + y_mean_cs_val
                             - mgwr_cs_params_orig[:, 1:5] @ x_means_cs)

# Export per-unit (one row per spatial location, one period only)
mgwr_cs_df = pd.DataFrame(
    mgwr_cs_params_orig,
    columns=["intercept_mgwr_cs", "beta1_mgwr_cs", "beta2_mgwr_cs",
             "beta3_mgwr_cs", "beta4_mgwr_cs"],
)
mgwr_cs_df["unit_id"] = np.arange(N_UNITS)
mgwr_cs_df.to_csv("mgwr_cs_params.csv", index=False)
print("\nExported: mgwr_cs_params.csv")

# Compute RMSE for cross-sectional MGWR slopes vs truth
rmse_mgwr_cs = {}
for k, (col, true_vals) in enumerate(zip(
    ["beta1_mgwr_cs", "beta2_mgwr_cs", "beta3_mgwr_cs", "beta4_mgwr_cs"],
    [beta_1_true, beta_2_true, beta_3_true, beta_4_true]
)):
    rmse = np.sqrt(np.mean((mgwr_cs_df[col].values - true_vals)**2))
    corr = np.corrcoef(mgwr_cs_df[col].values, true_vals)[0, 1]
    rmse_mgwr_cs[f"beta_{k+1}"] = {"rmse": rmse, "corr": corr}
    print(f"  {col}: RMSE={rmse:.4f}, Corr={corr:.4f}")

# Cross-sectional MGWR's local intercept is its estimate of intrinsic
# contextual effects (analogous to alpha_i in MGWFER).
alpha_mgwr_cs = mgwr_cs_df["intercept_mgwr_cs"].values
rmse_alpha_mgwr_cs = float(np.sqrt(np.mean((alpha_mgwr_cs - alpha_true)**2)))
corr_alpha_mgwr_cs = float(np.corrcoef(alpha_mgwr_cs, alpha_true)[0, 1])
print(f"\n  MGWR_cs intercept (= intrinsic contextual effect proxy):")
print(f"    range = [{alpha_mgwr_cs.min():.3f}, {alpha_mgwr_cs.max():.3f}]")
print(f"    vs true range [{alpha_true.min():.3f}, {alpha_true.max():.3f}]")
print(f"    Corr with true sc = {corr_alpha_mgwr_cs:.4f}, RMSE = {rmse_alpha_mgwr_cs:.4f}")

# Same for PMGWR (column 0 of pooled_params_by_unit is the intercept).
alpha_pmgwr = pooled_df["intercept"].values
rmse_alpha_pmgwr = float(np.sqrt(np.mean((alpha_pmgwr - alpha_true)**2)))
corr_alpha_pmgwr = float(np.corrcoef(alpha_pmgwr, alpha_true)[0, 1])
print(f"\n  PMGWR intercept (= intrinsic contextual effect proxy):")
print(f"    range = [{alpha_pmgwr.min():.3f}, {alpha_pmgwr.max():.3f}]")
print(f"    vs true range [{alpha_true.min():.3f}, {alpha_true.max():.3f}]")
print(f"    Corr with true sc = {corr_alpha_pmgwr:.4f}, RMSE = {rmse_alpha_pmgwr:.4f}")

# ── 7. MGWFER Stage 1: Within-Transformation + MGWR ──────────────

# ESTIMAND: Local causal effects beta_bwk(u_i, v_i) under fixed effects assumptions.
# IDENTIFICATION: The within-transformation removes time-invariant confounders
# (alpha_i), allowing causal interpretation of spatially varying coefficients
# under the assumption that NO time-varying confounders exist.

print("\n" + "=" * 60)
print("MGWFER Stage 1 (Within-Transformation + MGWR)")
print("=" * 60)

# Within-transformation (demean by unit)
print("\n  Within-transformation (removing fixed effects)...")

# Compute unit means
unit_means = panel_df.groupby("unit_id")[["y", "x1", "x2", "x3", "x4"]].transform("mean")

# Within-deviations
y_within = (panel_df["y"].values - unit_means["y"].values).reshape(-1, 1)
x1_within = panel_df["x1"].values - unit_means["x1"].values
x2_within = panel_df["x2"].values - unit_means["x2"].values
x3_within = panel_df["x3"].values - unit_means["x3"].values
x4_within = panel_df["x4"].values - unit_means["x4"].values
X_within = np.column_stack([x1_within, x2_within, x3_within, x4_within])

print(f"  y_within range: [{y_within.min():.3f}, {y_within.max():.3f}]")
print(f"  Fixed effects removed (mean of y_within per unit ≈ 0)")

# Verify demeaning worked
unit_check = pd.DataFrame({"unit_id": panel_df["unit_id"].values, "y_w": y_within.ravel()})
max_unit_mean = unit_check.groupby("unit_id")["y_w"].mean().abs().max()
print(f"  Max unit mean after demeaning: {max_unit_mean:.2e} (should be ~0)")

# MGWR on demeaned data (no intercept, since demeaning removes the unit-level mean)
print("\n  MGWR on within-transformed data...")

# Standardize the within-transformed data
Y_std_fe = (y_within - y_within.mean()) / y_within.std()
X_std_fe = (X_within - X_within.mean(axis=0)) / X_within.std(axis=0)

# Store scaling for back-transformation
y_std_fe_val = y_within.std()
x_stds_fe = X_within.std(axis=0)

print(f"  Standardized Y range: [{Y_std_fe.min():.3f}, {Y_std_fe.max():.3f}]")

# Bandwidth selection (constant=False because demeaning removes intercept)
print("  Selecting bandwidths...")
fe_selector = Sel_BW(
    coords_panel, Y_std_fe, X_std_fe,
    multi=True, constant=False, time=N_TIME
)
fe_bw = fe_selector.search()

print(f"\n  MGWFER bandwidths: {fe_bw}")

# Fit MGWFER
print("  Fitting MGWFER model...")
fe_model = MGWR(
    coords_panel, Y_std_fe, X_std_fe,
    fe_selector, constant=False, time=N_TIME
).fit()

print(f"\n  MGWFER R-squared: {fe_model.R2:.4f}")
print(f"  MGWFER Adj. R-squared: {fe_model.adj_R2:.4f}")
print(f"  MGWFER AICc: {fe_model.aicc:.2f}")

# Back-transform parameters
n_params_fe = fe_model.params.shape[1]
print(f"  Number of parameter columns: {n_params_fe}")

fe_params_orig = np.zeros_like(fe_model.params)
for k in range(4):
    fe_params_orig[:, k] = (fe_model.params[:, k] *
                            y_std_fe_val / x_stds_fe[k])

# Average parameters per unit
fe_params_by_unit = np.zeros((N_UNITS, 4))
for i in range(N_UNITS):
    mask = panel_df["unit_id"].values == i
    fe_params_by_unit[i] = fe_params_orig[mask].mean(axis=0)

# Export
fe_df = pd.DataFrame(
    fe_params_by_unit,
    columns=["beta1_mgwfer", "beta2_mgwfer", "beta3_mgwfer", "beta4_mgwfer"]
)
fe_df["unit_id"] = np.arange(N_UNITS)
fe_df.to_csv("mgwrfer_params.csv", index=False)
print("\nExported: mgwrfer_params.csv")

# Compute RMSE for MGWFER
rmse_fe = {}
for k, (col, true_vals) in enumerate(zip(
    ["beta1_mgwfer", "beta2_mgwfer", "beta3_mgwfer", "beta4_mgwfer"],
    [beta_1_true, beta_2_true, beta_3_true, beta_4_true]
)):
    rmse = np.sqrt(np.mean((fe_df[col].values - true_vals)**2))
    corr = np.corrcoef(fe_df[col].values, true_vals)[0, 1]
    rmse_fe[f"beta_{k+1}"] = {"rmse": rmse, "corr": corr}
    print(f"  {col}: RMSE={rmse:.4f}, Corr={corr:.4f}")

# ── 8. MGWFER Stage 2: Recover Individual Fixed Effects alpha_i ──

# ESTIMAND: Intrinsic contextual effects alpha_i per location.
# Using Eq. 30 of Li & Fotheringham (2026):
#     alpha_hat_i = y_bar_i - sum_k beta_hat_bwk(u_i, v_i) * x_bar_{ik}
# Variance / t-test formulas: paper Eqs. 32-37.
#     sigma2 = (T / (T-1)) * sigma_Y_dotdot^2 * sigma_s^2
#     Var[beta_i] = S_beta * Var[beta_i^S] * S_beta^T
#     Var[alpha_i] = sigma2 / T + x_bar_i' * Var[beta_i] * x_bar_i
#     t_i = alpha_hat_i / sqrt(Var[alpha_i])
# Degrees of freedom: NT - K - N (paper p. 14).

print("\n" + "=" * 60)
print("MGWFER Stage 2 (Recover Individual Fixed Effects alpha_i)")
print("=" * 60)

# Unit-level means of y and x's (from raw data, NOT demeaned)
unit_y_mean = panel_df.groupby("unit_id")["y"].mean().reindex(np.arange(N_UNITS)).values
unit_x_means = (panel_df.groupby("unit_id")[["x1", "x2", "x3", "x4"]]
                .mean().reindex(np.arange(N_UNITS)).values)

# Per-unit back-transformed slopes (already averaged across time in fe_params_by_unit)
beta_unit = fe_params_by_unit  # shape (N_UNITS, 4)

# Eq. 30: alpha_hat_i = y_bar_i - sum_k beta_hat_k(i) * x_bar_{ik}
alpha_hat = unit_y_mean - np.sum(beta_unit * unit_x_means, axis=1)

# --- Variance computation (Eqs. 32-37) ---

# (a) MGWR residual variance on standardized scale (sigma_s^2). Paper Eq. 34:
#     sigma_s^2 = sum_i (y_i - y_hat_i)^2 / (m - trace(S))
resid_std = fe_model.resid_response.ravel()
trS = fe_model.tr_S if hasattr(fe_model, "tr_S") else np.nan
m = N_OBS
sigma_s_sq = (float(np.sum(resid_std**2) / (m - trS)) if not np.isnan(trS)
              else float(np.var(resid_std, ddof=4)))

# (b) Rescale to original scale (Eq. 35)
sigma_sq = (N_TIME / (N_TIME - 1)) * (y_std_fe_val**2) * sigma_s_sq

# (c) Variance-covariance matrix for the local slopes per unit.
# fe_model.CCT gives diag of (C * C^T) on standardized scale, shape (NT, K).
# We approximate Var[beta_i^S] as diagonal with elements CCT_i * sigma_s_sq,
# then rescale via S_beta = diag(sigma_Y / sigma_X_k).
CCT = fe_model.CCT  # shape (NT, K) — standardised
# Average per unit (rows for the same unit i differ only by the dotted x design;
# since MGWFER uses a single bandwidth per unit, we average over time).
CCT_by_unit = np.zeros((N_UNITS, CCT.shape[1]))
for i in range(N_UNITS):
    mask = panel_df["unit_id"].values == i
    CCT_by_unit[i] = CCT[mask].mean(axis=0)

# Scaling diagonal S_beta = diag(sigma_Y_dotdot / sigma_X_k_dotdot)  -- Eq. 37
S_beta = y_std_fe_val / x_stds_fe  # shape (K,)

# Var[beta_i^S]_kk = CCT_by_unit[i, k] * sigma_s_sq
# Var[beta_i]_kk   = (S_beta_k)^2 * Var[beta_i^S]_kk    (diagonal form of Eq. 36)
var_beta_unit = (CCT_by_unit * sigma_s_sq) * (S_beta**2)  # (N_UNITS, K)

# (d) Var[alpha_i] = sigma_sq / T + x_bar_i' * Var[beta_i] * x_bar_i
# With diagonal Var[beta_i], the quadratic form simplifies to sum_k x_bar_ik^2 * var_beta_ik
var_alpha = (sigma_sq / N_TIME) + np.sum(unit_x_means**2 * var_beta_unit, axis=1)
se_alpha = np.sqrt(np.clip(var_alpha, a_min=1e-12, a_max=None))

# (e) t-test (df = NT - K - N)
t_alpha = alpha_hat / se_alpha
df_alpha = N_OBS - 4 - N_UNITS  # = 675 - 4 - 225 = 446
p_alpha = 2 * (1 - stats.t.cdf(np.abs(t_alpha), df=df_alpha))
sig5 = p_alpha < 0.05

# Recovery metrics vs the true alpha_i
rmse_alpha = float(np.sqrt(np.mean((alpha_hat - alpha_true)**2)))
corr_alpha = float(np.corrcoef(alpha_hat, alpha_true)[0, 1])

print(f"  alpha_hat range: [{alpha_hat.min():.3f}, {alpha_hat.max():.3f}], "
      f"mean={alpha_hat.mean():.3f}")
print(f"  True alpha range: [{alpha_true.min():.3f}, {alpha_true.max():.3f}], "
      f"mean={alpha_true.mean():.3f}")
print(f"  alpha_hat recovery: RMSE={rmse_alpha:.4f}, Corr={corr_alpha:.4f}")
print(f"  Significant at 5%: {int(sig5.sum())}/{N_UNITS} units "
      f"({100 * sig5.mean():.1f}%)")
print(f"  df for t-test: {df_alpha}")

# Export Stage 2 results
alpha_df = pd.DataFrame({
    "unit_id": np.arange(N_UNITS),
    "coord_i": grid_i,
    "coord_j": grid_j,
    "alpha_true": alpha_true,
    "alpha_hat": alpha_hat,
    "se_alpha": se_alpha,
    "t_stat": t_alpha,
    "p_value": p_alpha,
    "significant_5pct": sig5.astype(int),
})
alpha_df.to_csv("mgwrfer_alpha_recovery.csv", index=False)
print("Exported: mgwrfer_alpha_recovery.csv")

# Figure: 2x2 spatial-context surface comparison (paper Figure 5 replication)
# True SC vs MGWFER alpha_hat vs MGWR_cs local intercept vs PMGWR local intercept.
# Shared color scale to make the magnitude underestimate by MGWR/PMGWR visible.
fig, axes = plt.subplots(2, 2, figsize=(13, 11))
fig.patch.set_facecolor(DARK_NAVY)
fig.suptitle("Spatial context surface — recovered by each model "
             r"(true $sc_i$ vs $\hat{\alpha}_i$)",
             fontsize=14, color=WHITE_TEXT, y=0.99)

vmin = float(alpha_true.min())
vmax = float(alpha_true.max())

alpha_panels = [
    (alpha_true,     r"True $sc_i$ (DGP)",
     None, None),
    (alpha_hat,      r"MGWFER $\hat{\alpha}_i$ (Stage 2, Eq. 30)",
     rmse_alpha, corr_alpha),
    (alpha_mgwr_cs,  r"MGWR (cross-sectional) — local intercept",
     rmse_alpha_mgwr_cs, corr_alpha_mgwr_cs),
    (alpha_pmgwr,    r"PMGWR (pooled) — local intercept",
     rmse_alpha_pmgwr, corr_alpha_pmgwr),
]
for ax, (vals, title, rmse_v, corr_v) in zip(axes.flat, alpha_panels):
    img = ax.imshow(vals.reshape(N_GRID, N_GRID), cmap="viridis",
                    origin="lower", aspect="equal", vmin=vmin, vmax=vmax)
    ax.set_title(title, fontsize=12, color=WHITE_TEXT, pad=8)
    ax.set_xlabel("j (column)", fontsize=10)
    ax.set_ylabel("i (row)", fontsize=10)
    ax.set_xticks([0, N_GRID // 2, N_GRID - 1])
    ax.set_xticklabels(["1", str(N_GRID // 2 + 1), str(N_GRID)])
    ax.set_yticks([0, N_GRID // 2, N_GRID - 1])
    ax.set_yticklabels(["1", str(N_GRID // 2 + 1), str(N_GRID)])
    cbar = plt.colorbar(img, ax=ax, fraction=0.046, pad=0.04)
    cbar.outline.set_edgecolor(GRID_LINE)
    for label in cbar.ax.get_yticklabels():
        label.set_color(LIGHT_TEXT)
    # Annotate range and recovery metrics
    range_str = f"range: [{vals.min():.1f}, {vals.max():.1f}]"
    if rmse_v is not None:
        ann = f"{range_str}\nRMSE = {rmse_v:.2f}\nCorr = {corr_v:.3f}"
    else:
        ann = range_str
    ax.text(0.02, 0.98, ann,
            transform=ax.transAxes, fontsize=9, verticalalignment="top",
            bbox=dict(facecolor="#1a1a2e", edgecolor=LIGHT_TEXT, alpha=0.9),
            color=WHITE_TEXT)

plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.savefig("mgwrfer_alpha_map.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: mgwrfer_alpha_map.png (2x2 comparison, paper Fig. 5 replication)")

# Figure: beta_4 surface bias (paper Figure 9 replication)
# MGWR/PMGWR will absorb the indirect-channel contamination into beta_4
# (truly zero), producing a column-aligned "vertical stripe" bias pattern
# that tracks sc. MGWFER should not exhibit this.
fig, axes_b4 = plt.subplots(1, 3, figsize=(15, 5.5))
fig.patch.set_facecolor(DARK_NAVY)
fig.suptitle(r"Spurious $\hat{\beta}_4$ surface — true $\beta_4 \equiv 0$ "
             "(paper Fig. 9 replication)",
             fontsize=14, color=WHITE_TEXT, y=1.02)

b4_panels = [
    (mgwr_cs_df["beta4_mgwr_cs"].values,  "MGWR (cross-sectional)"),
    (pooled_df["beta4_pooled"].values,    "PMGWR (pooled)"),
    (fe_df["beta4_mgwfer"].values,        "MGWFER (within + MGWR)"),
]
b4_vmin = min(v.min() for v, _ in b4_panels + [(np.array([-0.1]), "")])
b4_vmax = max(v.max() for v, _ in b4_panels + [(np.array([0.1]), "")])
b4_lim = max(abs(b4_vmin), abs(b4_vmax))
for ax, (vals, title) in zip(axes_b4, b4_panels):
    img = ax.imshow(vals.reshape(N_GRID, N_GRID), cmap="coolwarm",
                    origin="lower", aspect="equal",
                    vmin=-b4_lim, vmax=b4_lim)
    ax.set_title(title, fontsize=12, color=WHITE_TEXT, pad=8)
    ax.set_xlabel("j (column)", fontsize=10)
    ax.set_ylabel("i (row)", fontsize=10)
    ax.set_xticks([0, N_GRID // 2, N_GRID - 1])
    ax.set_xticklabels(["1", str(N_GRID // 2 + 1), str(N_GRID)])
    ax.set_yticks([0, N_GRID // 2, N_GRID - 1])
    ax.set_yticklabels(["1", str(N_GRID // 2 + 1), str(N_GRID)])
    cbar = plt.colorbar(img, ax=ax, fraction=0.046, pad=0.04)
    cbar.outline.set_edgecolor(GRID_LINE)
    for label in cbar.ax.get_yticklabels():
        label.set_color(LIGHT_TEXT)
    rmse_b4 = float(np.sqrt(np.mean(vals**2)))  # RMSE vs zero
    ax.text(0.02, 0.98,
            f"range: [{vals.min():.2f}, {vals.max():.2f}]\nRMSE vs 0 = {rmse_b4:.3f}",
            transform=ax.transAxes, fontsize=9, verticalalignment="top",
            bbox=dict(facecolor="#1a1a2e", edgecolor=LIGHT_TEXT, alpha=0.9),
            color=WHITE_TEXT)

plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.savefig("mgwrfer_beta4_bias.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: mgwrfer_beta4_bias.png (paper Fig. 9 replication)")

# ── 9. Coefficient Recovery Comparison ───────────────────────────

print("\n" + "=" * 60)
print("COEFFICIENT RECOVERY COMPARISON")
print("=" * 60)

# Figure 2: True vs Pooled MGWR (showing bias)
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.patch.set_facecolor(DARK_NAVY)
fig.suptitle("Pooled MGWR (PMGWR): Biased Estimates (ignoring fixed effects)",
             fontsize=13, color=WHITE_TEXT, y=1.02)

true_arrays = [beta_1_true, beta_2_true, beta_3_true]
pooled_arrays = [pooled_df["beta1_pooled"].values,
                 pooled_df["beta2_pooled"].values,
                 pooled_df["beta3_pooled"].values]
labels = [r"$\beta_1$ (quadratic)", r"$\beta_2$ (linear)", r"$\beta_3$ (constant)"]

for ax, true_vals, est_vals, label in zip(axes, true_arrays, pooled_arrays, labels):
    ax.scatter(true_vals, est_vals, color=STEEL_BLUE, alpha=0.4, s=15, zorder=3)

    # 45-degree reference line
    lims = [min(true_vals.min(), est_vals.min()) - 0.2,
            max(true_vals.max(), est_vals.max()) + 0.2]
    ax.plot(lims, lims, color=WARM_ORANGE, linewidth=2, linestyle="--", zorder=2)

    # Stats
    rmse = np.sqrt(np.mean((est_vals - true_vals)**2))
    corr = np.corrcoef(true_vals, est_vals)[0, 1]
    ax.text(0.05, 0.95, f"RMSE = {rmse:.3f}\nCorr = {corr:.3f}",
            transform=ax.transAxes, fontsize=10, verticalalignment="top",
            bbox=dict(facecolor="#1a1a2e", edgecolor=LIGHT_TEXT, alpha=0.9),
            color=WHITE_TEXT)

    ax.set_xlabel("True coefficient", fontsize=10)
    ax.set_ylabel("Pooled MGWR estimate", fontsize=10)
    ax.set_title(label, fontsize=11, color=WHITE_TEXT)
    ax.set_xlim(lims)
    ax.set_ylim(lims)

plt.tight_layout()
plt.savefig("mgwrfer_bias_pooled.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: mgwrfer_bias_pooled.png")

# Figure 3: True vs MGWFER (showing correction)
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.patch.set_facecolor(DARK_NAVY)
fig.suptitle("MGWFER: Bias-Corrected Estimates (fixed effects removed)",
             fontsize=13, color=WHITE_TEXT, y=1.02)

fe_arrays = [fe_df["beta1_mgwfer"].values,
             fe_df["beta2_mgwfer"].values,
             fe_df["beta3_mgwfer"].values]

for ax, true_vals, est_vals, label in zip(axes, true_arrays, fe_arrays, labels):
    ax.scatter(true_vals, est_vals, color=TEAL, alpha=0.4, s=15, zorder=3)

    # 45-degree reference line
    lims = [min(true_vals.min(), est_vals.min()) - 0.2,
            max(true_vals.max(), est_vals.max()) + 0.2]
    ax.plot(lims, lims, color=WARM_ORANGE, linewidth=2, linestyle="--", zorder=2)

    # Stats
    rmse = np.sqrt(np.mean((est_vals - true_vals)**2))
    corr = np.corrcoef(true_vals, est_vals)[0, 1]
    ax.text(0.05, 0.95, f"RMSE = {rmse:.3f}\nCorr = {corr:.3f}",
            transform=ax.transAxes, fontsize=10, verticalalignment="top",
            bbox=dict(facecolor="#1a1a2e", edgecolor=LIGHT_TEXT, alpha=0.9),
            color=WHITE_TEXT)

    ax.set_xlabel("True coefficient", fontsize=10)
    ax.set_ylabel("MGWFER estimate", fontsize=10)
    ax.set_title(label, fontsize=11, color=WHITE_TEXT)
    ax.set_xlim(lims)
    ax.set_ylim(lims)

plt.tight_layout()
plt.savefig("mgwrfer_recovery_fe.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: mgwrfer_recovery_fe.png")

# Model comparison table
print("\n── Model Comparison ──")
print(f"{'Metric':<25} {'PMGWR':>14} {'MGWFER':>14}")
print(f"{'-'*25} {'-'*14} {'-'*14}")
for k in range(1, 5):
    key = f"beta_{k}"
    print(f"{'RMSE (beta_' + str(k) + ')':<25} "
          f"{rmse_pooled[key]['rmse']:>14.4f} {rmse_fe[key]['rmse']:>14.4f}")
for k in range(1, 5):
    key = f"beta_{k}"
    print(f"{'Corr (beta_' + str(k) + ')':<25} "
          f"{rmse_pooled[key]['corr']:>14.4f} {rmse_fe[key]['corr']:>14.4f}")
print(f"{'R-squared *':<25} {pooled_model.R2:>14.4f} {fe_model.R2:>14.4f}")
print("  * R-squared not directly comparable (different dependent variables)")
print(f"{'AICc':<25} {pooled_model.aicc:>14.2f} {fe_model.aicc:>14.2f}")

# Export comparison: now three local models (MGWR_cs, PMGWR, MGWFER)
comparison_rows = []
for k in range(1, 5):
    key = f"beta_{k}"
    comparison_rows.append({
        "metric": f"RMSE_beta_{k}",
        "mgwr_cs": rmse_mgwr_cs[key]["rmse"],
        "pmgwr": rmse_pooled[key]["rmse"],
        "mgwfer": rmse_fe[key]["rmse"],
    })
    comparison_rows.append({
        "metric": f"Corr_beta_{k}",
        "mgwr_cs": rmse_mgwr_cs[key]["corr"],
        "pmgwr": rmse_pooled[key]["corr"],
        "mgwfer": rmse_fe[key]["corr"],
    })
comparison_rows.append({"metric": "R_squared",
                        "mgwr_cs": mgwr_cs_model.R2,
                        "pmgwr": pooled_model.R2,
                        "mgwfer": fe_model.R2})
comparison_rows.append({"metric": "AICc",
                        "mgwr_cs": mgwr_cs_model.aicc,
                        "pmgwr": pooled_model.aicc,
                        "mgwfer": fe_model.aicc})
comparison_rows.append({"metric": "RMSE_alpha",
                        "mgwr_cs": rmse_alpha_mgwr_cs,
                        "pmgwr": rmse_alpha_pmgwr,
                        "mgwfer": rmse_alpha})
comparison_rows.append({"metric": "Corr_alpha",
                        "mgwr_cs": corr_alpha_mgwr_cs,
                        "pmgwr": corr_alpha_pmgwr,
                        "mgwfer": corr_alpha})

comp_df = pd.DataFrame(comparison_rows)
comp_df.to_csv("model_comparison.csv", index=False)
print("\nExported: model_comparison.csv (three local models)")

# Print as-table to log for easy reading
print("\n── Local model comparison (MGWR_cs / PMGWR / MGWFER) ──")
print(f"{'Metric':<22} {'MGWR_cs':>10} {'PMGWR':>10} {'MGWFER':>10}")
print(f"{'-'*22} {'-'*10} {'-'*10} {'-'*10}")
for row in comparison_rows:
    print(f"{row['metric']:<22} {row['mgwr_cs']:>10.4f} "
          f"{row['pmgwr']:>10.4f} {row['mgwfer']:>10.4f}")

# ── 10. MGWFER Coefficient Maps ──────────────────────────────────

print("\n── Plotting coefficient maps (true vs MGWFER) ──")

fig, axes = plt.subplots(2, 3, figsize=(16, 10))
fig.patch.set_facecolor(DARK_NAVY)
fig.suptitle("Spatial Coefficient Recovery: True (top) vs MGWFER (bottom)",
             fontsize=14, color=WHITE_TEXT, y=0.99)

# Row 1: True coefficients
for col_idx, (vals, title) in enumerate(zip(
    true_arrays, [r"True $\beta_1$", r"True $\beta_2$", r"True $\beta_3$"]
)):
    ax = axes[0, col_idx]
    img = ax.imshow(vals.reshape(N_GRID, N_GRID), cmap="coolwarm",
                    origin="lower", aspect="equal")
    ax.set_title(title, fontsize=11, color=WHITE_TEXT, pad=6)
    ax.set_xticks([])
    ax.set_yticks([])
    cbar = plt.colorbar(img, ax=ax, fraction=0.046, pad=0.04)
    cbar.outline.set_edgecolor(GRID_LINE)
    for label in cbar.ax.get_yticklabels():
        label.set_color(LIGHT_TEXT)

# Row 2: MGWFER estimates
bw_labels = fe_bw if hasattr(fe_bw, '__len__') else [fe_bw] * 3
for col_idx, (vals, title, bw) in enumerate(zip(
    fe_arrays,
    [r"MGWFER $\hat{\beta}_1$", r"MGWFER $\hat{\beta}_2$",
     r"MGWFER $\hat{\beta}_3$"],
    bw_labels[:3]
)):
    ax = axes[1, col_idx]
    # Use same colormap range as true for fair comparison
    vmin = true_arrays[col_idx].min()
    vmax = true_arrays[col_idx].max()
    img = ax.imshow(vals.reshape(N_GRID, N_GRID), cmap="coolwarm",
                    origin="lower", aspect="equal", vmin=vmin, vmax=vmax)
    bw_val = int(bw) if not np.isnan(bw) else "?"
    ax.set_title(f"{title} (bw={bw_val})", fontsize=11, color=WHITE_TEXT, pad=6)
    ax.set_xticks([])
    ax.set_yticks([])
    cbar = plt.colorbar(img, ax=ax, fraction=0.046, pad=0.04)
    cbar.outline.set_edgecolor(GRID_LINE)
    for label in cbar.ax.get_yticklabels():
        label.set_color(LIGHT_TEXT)

plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.savefig("mgwrfer_coefficient_maps.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: mgwrfer_coefficient_maps.png")

# ── 11. Statistical Significance Analysis ────────────────────────

print("\n── Statistical significance analysis ──")

# Compute filtered t-values for MGWFER slopes (Bonferroni / da Silva &
# Fotheringham 2016 multiple-testing correction). The mgwr package guarantees
# this method exists on a fitted MGWR result, so no fallback is needed.
fe_tvalues = fe_model.filter_tvals()
print("  Using filtered t-values (corrected for multiple testing)")

# Significance classification per coefficient (including beta_4 null effect)
fig, axes = plt.subplots(2, 2, figsize=(12, 11))
fig.patch.set_facecolor(DARK_NAVY)
fig.suptitle("MGWFER: Statistical Significance of Spatially Varying Coefficients",
             fontsize=14, color=WHITE_TEXT, y=0.98)

sig_summary = {}
coef_names = [r"$\beta_1$ (quadratic)", r"$\beta_2$ (linear)",
              r"$\beta_3$ (constant)", r"$\beta_4$ (null)"]

# Parse hex colors to RGB once
orange_rgb = np.array([int(WARM_ORANGE[1:3], 16), int(WARM_ORANGE[3:5], 16),
                       int(WARM_ORANGE[5:7], 16)]) / 255
blue_rgb = np.array([int(STEEL_BLUE[1:3], 16), int(STEEL_BLUE[3:5], 16),
                     int(STEEL_BLUE[5:7], 16)]) / 255
grid_rgb = np.array([int(GRID_LINE[1:3], 16), int(GRID_LINE[3:5], 16),
                     int(GRID_LINE[5:7], 16)]) / 255

for col_idx, (ax, name) in enumerate(zip(axes.flat, coef_names)):
    # Get t-values for this coefficient, averaged by unit
    t_col = fe_tvalues[:, col_idx]
    t_by_unit = np.zeros(N_UNITS)
    for i in range(N_UNITS):
        mask = panel_df["unit_id"].values == i
        t_by_unit[i] = t_col[mask].mean()

    # Classify: filtered t-values are 0 where not significant
    sig_pos = t_by_unit > 0
    sig_neg = t_by_unit < 0
    not_sig = t_by_unit == 0

    n_pos = sig_pos.sum()
    n_neg = sig_neg.sum()
    n_ns = not_sig.sum()
    sig_summary[name] = {"positive": n_pos, "negative": n_neg, "not_sig": n_ns}

    # Color map
    color_grid = np.zeros((N_UNITS, 3))
    color_grid[sig_pos] = orange_rgb
    color_grid[sig_neg] = blue_rgb
    color_grid[not_sig] = grid_rgb

    ax.imshow(color_grid.reshape(N_GRID, N_GRID, 3), origin="lower", aspect="equal")
    ax.set_title(f"{name}", fontsize=11, color=WHITE_TEXT, pad=6)
    ax.set_xticks([])
    ax.set_yticks([])

    # Legend
    handles = [
        Patch(facecolor=WARM_ORANGE, label=f"Sig. positive (n={n_pos})"),
        Patch(facecolor=GRID_LINE, label=f"Not significant (n={n_ns})"),
        Patch(facecolor=STEEL_BLUE, label=f"Sig. negative (n={n_neg})"),
    ]
    leg = ax.legend(handles=handles, loc="lower left", fontsize=9)
    leg.get_frame().set_facecolor("#1a1a2e")
    leg.get_frame().set_edgecolor(LIGHT_TEXT)
    leg.get_frame().set_alpha(0.9)
    for text in leg.get_texts():
        text.set_color(WHITE_TEXT)

plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.savefig("mgwrfer_significance_maps.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: mgwrfer_significance_maps.png")

# Print significance summary
print("\n── Significance summary ──")
for name, counts in sig_summary.items():
    print(f"  {name}: positive={counts['positive']}, "
          f"not_sig={counts['not_sig']}, negative={counts['negative']}")

# ── 12. Bandwidth Comparison ─────────────────────────────────────

print("\n── Bandwidth comparison ──")

# Extract bandwidths (intercept + 4 vars where applicable)
mgwr_cs_bw_list = list(mgwr_cs_bw) if hasattr(mgwr_cs_bw, '__len__') else [mgwr_cs_bw]
pooled_bw_list = list(pooled_bw) if hasattr(pooled_bw, '__len__') else [pooled_bw]
fe_bw_list = list(fe_bw) if hasattr(fe_bw, '__len__') else [fe_bw]

# MGWR_cs and PMGWR both have [intercept, x1, x2, x3, x4]; skip intercept.
mgwr_cs_var_bw = mgwr_cs_bw_list[1:5] if len(mgwr_cs_bw_list) >= 5 else mgwr_cs_bw_list
pooled_var_bw = pooled_bw_list[1:5] if len(pooled_bw_list) >= 5 else pooled_bw_list
fe_var_bw = fe_bw_list[:4]

print(f"  MGWR_cs bws (x1-x4): {[int(b) for b in mgwr_cs_var_bw]}")
print(f"  PMGWR bws   (x1-x4): {[int(b) for b in pooled_var_bw]}")
print(f"  MGWFER bws  (x1-x4): {[int(b) for b in fe_var_bw]}")

fig, ax = plt.subplots(figsize=(11, 6))
fig.patch.set_facecolor(DARK_NAVY)

x_pos = np.arange(4)
width = 0.27

bars0 = ax.bar(x_pos - width, mgwr_cs_var_bw, width,
               color=STEEL_BLUE, alpha=0.85, label="MGWR (cross-section)")
bars1 = ax.bar(x_pos, pooled_var_bw, width,
               color=WARM_ORANGE, alpha=0.85, label="PMGWR (pooled)")
bars2 = ax.bar(x_pos + width, fe_var_bw, width,
               color=TEAL, alpha=0.85, label="MGWFER")

for bar in bars0:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 3,
            f"{int(bar.get_height())}", ha="center", fontsize=9, color=STEEL_BLUE)
for bar in bars1:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 3,
            f"{int(bar.get_height())}", ha="center", fontsize=9, color=WARM_ORANGE)
for bar in bars2:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 3,
            f"{int(bar.get_height())}", ha="center", fontsize=9, color=TEAL)

ax.set_xlabel("Covariate", fontsize=11)
ax.set_ylabel("Bandwidth (nearest neighbors)", fontsize=11)
ax.set_title("Bandwidth Comparison: MGWR_cs vs PMGWR vs MGWFER", fontsize=13)
ax.set_xticks(x_pos)
ax.set_xticklabels([r"$x_1$ (quadratic)", r"$x_2$ (linear)",
                    r"$x_3$ (constant)", r"$x_4$ (null)"])
ax.legend(loc="upper right")

plt.tight_layout()
plt.savefig("mgwrfer_bandwidth_comparison.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: mgwrfer_bandwidth_comparison.png (3 models)")

# ── 13. Summary ──────────────────────────────────────────────────

print("\n" + "=" * 60)
print("FINAL SUMMARY")
print("=" * 60)

print("\n── Key Findings (paper Table 2 / 3 / Figs 5, 9 replication) ──")
print("  Global models (paper Table 2):")
print(f"    OLS_cs    : beta_1 = {ols_cs.params[1]:.2f} "
      f"(true = 1.50; expected: severely biased upward)")
print(f"    OLS_pool  : beta_1 = {ols_pool.params[1]:.2f} (similarly biased)")
print(f"    FE        : beta_1 = {fe_global.params[0]:.2f}, "
      f"beta_4 = {fe_global.params[3]:.2f} (p={fe_global.pvalues[3]:.3g}) "
      f"-- expected: near 1.5 / 0")

print("\n  Local models: RMSE on each beta")
for k in range(1, 5):
    key = f"beta_{k}"
    print(f"    beta_{k}: MGWR_cs={rmse_mgwr_cs[key]['rmse']:.4f}, "
          f"PMGWR={rmse_pooled[key]['rmse']:.4f}, "
          f"MGWFER={rmse_fe[key]['rmse']:.4f}")

print("\n  Intrinsic contextual effects recovery (paper Fig. 5):")
print(f"    True sc range:    [{alpha_true.min():.2f}, {alpha_true.max():.2f}]")
print(f"    MGWFER alpha_hat: [{alpha_hat.min():.2f}, {alpha_hat.max():.2f}]  "
      f"Corr={corr_alpha:.3f}, RMSE={rmse_alpha:.2f}")
print(f"    MGWR_cs intercept: [{alpha_mgwr_cs.min():.2f}, {alpha_mgwr_cs.max():.2f}]  "
      f"Corr={corr_alpha_mgwr_cs:.3f}, RMSE={rmse_alpha_mgwr_cs:.2f}")
print(f"    PMGWR intercept:   [{alpha_pmgwr.min():.2f}, {alpha_pmgwr.max():.2f}]  "
      f"Corr={corr_alpha_pmgwr:.3f}, RMSE={rmse_alpha_pmgwr:.2f}")

print(f"\n  Stage 2 t-test: alpha_hat significant at 5% in "
      f"{int(sig5.sum())}/{N_UNITS} ({100 * sig5.mean():.0f}%) units")

print("\n── Interpretation ──")
print("  This run uses the paper's DGP exactly: covariates carry a 0.05*sc term,")
print("  so the indirect contextual effect channel (sc -> x_k) is active.")
print("  Expected pattern of findings:")
print("  - Global OLS / pooled OLS heavily overestimate beta_1..3 and spuriously")
print("    detect beta_4; FE corrects all four.")
print("  - Cross-sectional MGWR and PMGWR cannot remove sc, so their local")
print("    intercepts dramatically UNDERestimate the true sc range, and their")
print("    beta_4 surfaces show a column-aligned vertical-stripe bias pattern.")
print("  - MGWFER recovers all true beta surfaces, the full sc range, and")
print("    correctly nullifies beta_4 -- replicating the paper's headline.")

# Generate README
readme_content = f"""# MGWFER: Multiscale Geographically Weighted Fixed Effects Regression

**Status:** Script executed successfully
**Language:** Python
**Method:** MGWFER (Li & Fotheringham 2026)

## Overview

Faithful Python replication of Li & Fotheringham (2026), *Spatial Context
as a Time-Invariant Confounder: A Fixed-Effects Extension of MGWR*. Uses
the paper's DGP (covariates coupled to spatial context, paper Eqs. 39-45)
at a 15x15 grid scale ({N_UNITS} units x {N_TIME} periods).

Replicates:

- **Paper Table 2** — global model comparison: OLS_cs, pooled OLS, FE.
- **Paper Table 3** — local model comparison: MGWR_cs, PMGWR, MGWFER.
- **Paper Figure 5** — spatial-context surface recovered by each local model.
- **Paper Figure 9** — `beta_4` spurious-coefficient bias pattern.
- **Paper Algorithm 1** — MGWFER's two-stage estimator:
  - **Stage 1**: within-transform + standardise + MGWR + back-transform.
  - **Stage 2**: recover individual fixed effects alpha_i (Eq. 30) with
    per-unit t-tests (Eqs. 32-37).

Filenames retain the historical `mgwrfer_` prefix for URL/asset stability
with the existing post slug.

## Pipeline Progress

- [x] Script — executed (paper-faithful DGP, six estimators)
- [x] Results report — present
- [x] Blog post — index.md
- [ ] Infographic — pending

## Generated Figures

| # | File | Description |
|---|------|-------------|
| 1 | mgwrfer_true_coefficients.png | True DGP coefficient surfaces (2x2 grid) |
| 2 | mgwrfer_bias_pooled.png | True vs PMGWR scatter (showing bias) |
| 3 | mgwrfer_recovery_fe.png | True vs MGWFER scatter (showing correction) |
| 4 | mgwrfer_coefficient_maps.png | True vs MGWFER coefficient maps (2x3) |
| 5 | mgwrfer_significance_maps.png | Statistical significance maps |
| 6 | mgwrfer_bandwidth_comparison.png | Bandwidth bar chart (3 models) |
| 7 | mgwrfer_alpha_map.png | Paper Fig. 5: true sc vs MGWFER, MGWR_cs, PMGWR |
| 8 | mgwrfer_beta4_bias.png | Paper Fig. 9: spurious beta_4 surfaces |

## Generated Tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | simulated_panel_data.csv | Raw panel data ({N_OBS} obs) |
| 2 | true_coefficients.csv | True coefficients ({N_UNITS} units) |
| 3 | global_models_comparison.csv | Paper Table 2: OLS_cs, OLS_pool, FE |
| 4 | mgwr_cs_params.csv | Cross-sectional MGWR estimates |
| 5 | pooled_mgwr_params.csv | PMGWR estimates |
| 6 | mgwrfer_params.csv | MGWFER slope estimates (Stage 1) |
| 7 | mgwrfer_alpha_recovery.csv | MGWFER alpha_hat + t-tests (Stage 2) |
| 8 | model_comparison.csv | Local model headline metrics (3 models) |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| simulated_panel_data.csv | {N_OBS} | 14 | Simulated panel with true coefficients |
| true_coefficients.csv | {N_UNITS} | 8 | True coefficient values per spatial unit |
| mgwrfer_alpha_recovery.csv | {N_UNITS} | 9 | alpha_hat per unit with SE/t/p/sig flag |

## Packages

- `numpy` — numerical computation, DGP simulation
- `pandas` — data management, CSV I/O
- `matplotlib` — visualization (dark theme)
- `scipy` — statistical computations (t-tests for Stage 2)
- `statsmodels` — OLS / pooled OLS / FE (within-transform) baselines
- `mgwr` (custom) — MGWR/MGWFER estimation (from GeoZhipengLi/MGWPR)

## References

- Li, Z. & Fotheringham, A. S. (2026). Spatial Context as a Time-Invariant
  Confounder: A Fixed-Effects Extension of MGWR. *Annals of the AAG*.
  DOI: 10.1080/24694452.2026.2654481
- Fotheringham et al. (2017). Multiscale Geographically Weighted Regression.
- Oshan et al. (2019). mgwr: A Python Implementation of MGWR.
- Wooldridge (2010). *Econometric Analysis of Cross Section and Panel Data*, MIT Press.
"""

with open("README.md", "w") as f:
    f.write(readme_content)
print("\nGenerated: README.md")

print("\n=== Script completed successfully ===")
