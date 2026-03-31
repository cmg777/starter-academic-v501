"""
Standard Errors in Panel Data: A Beginner's Guide in Python

This tutorial demonstrates why the choice of standard error estimator matters
in panel data regressions. Using a simulated dataset of 100 firms observed
over 10 years, we compare pooled OLS, White (HC), clustered, Driscoll-Kraay,
and Fama-MacBeth standard errors, and show how each choice affects inference.

A Monte Carlo simulation reveals empirical rejection rates, exposing which
SE estimators over-reject (produce too many false positives) and which
correctly control size.

Usage:
    python script.py

References:
    - Petersen, M. A. (2009). Estimating Standard Errors in Finance Panel
      Data Sets. Review of Financial Studies, 22(1), 435-480.
    - Gregoire, V. (2024). Panel OLS Standard Errors. Vincent Codes Finance.
      https://vincent.codes.finance/posts/panel-ols-standard-errors/
    - Driscoll, J. & Kraay, A. (1998). Consistent Covariance Matrix Estimation
      with Spatially Dependent Panel Data. Review of Economics and Statistics.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from linearmodels.panel import PanelOLS

# ── Reproducibility ──────────────────────────────────────────────────────────
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# ── Site color palette ───────────────────────────────────────────────────────
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# ── Dark theme palette ───────────────────────────────────────────────────────
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

# ══════════════════════════════════════════════════════════════════════════════
# 1. DATA GENERATING PROCESS
# ══════════════════════════════════════════════════════════════════════════════

def simulate_panel(n_firms=100, n_years=10, seed=42):
    """Simulate a panel dataset with firm and time effects.

    True DGP:
        y_it = 2.0 + 0.5 * x_it + mu_i + lambda_t + eps_it

    Where:
        - y_it    : firm performance (e.g., return on assets)
        - x_it    : R&D intensity
        - mu_i    : firm fixed effect, correlated with x via firm_ability
        - lambda_t: time fixed effect (business cycle)
        - eps_it  : idiosyncratic error with within-firm AR(1) correlation

    The TRUE causal effect of x on y is beta = 0.5.
    """
    rng = np.random.default_rng(seed)

    firms = np.repeat(np.arange(1, n_firms + 1), n_years)
    years = np.tile(np.arange(2010, 2010 + n_years), n_firms)

    # Firm-level unobserved heterogeneity (ability)
    firm_ability = rng.normal(0, 2, n_firms)
    mu = np.repeat(firm_ability, n_years)

    # Time effects (business cycle)
    time_shocks = rng.normal(0, 0.5, n_years)
    lam = np.tile(time_shocks, n_firms)

    # Treatment: R&D intensity (correlated with firm ability)
    x = 3.0 + 0.8 * mu + rng.normal(0, 1.5, n_firms * n_years)

    # Idiosyncratic errors with within-firm AR(1) serial correlation
    eps = np.zeros(n_firms * n_years)
    rho_ar = 0.5  # AR(1) coefficient
    for i in range(n_firms):
        start = i * n_years
        eps[start] = rng.normal(0, 1.5)
        for t in range(1, n_years):
            eps[start + t] = rho_ar * eps[start + t - 1] + rng.normal(0, 1.5)

    # True model
    TRUE_BETA = 0.5
    TRUE_ALPHA = 2.0
    y = TRUE_ALPHA + TRUE_BETA * x + mu + lam + eps

    df = pd.DataFrame({
        "firm": firms,
        "year": years,
        "y": y,
        "x": x,
    })

    return df


print("=" * 60)
print("SECTION: Data Generating Process")
print("=" * 60)

df = simulate_panel(n_firms=100, n_years=10, seed=42)
print(f"\nDataset shape: {df.shape}")
print(f"Number of firms: {df['firm'].nunique()}")
print(f"Number of years: {df['year'].nunique()}")
print(f"\nFirst 5 rows:")
print(df.head().to_string(index=False))
print(f"\nDescriptive statistics:")
print(df.describe().round(4).to_string())

# ══════════════════════════════════════════════════════════════════════════════
# 2. EDA: EXPLORING THE PANEL STRUCTURE
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("SECTION: EDA")
print("=" * 60)

# Panel balance check
obs_per_firm = df.groupby("firm").size()
print(f"\nObservations per firm: min={obs_per_firm.min()}, "
      f"max={obs_per_firm.max()}, mean={obs_per_firm.mean():.1f}")
print(f"Panel is {'balanced' if obs_per_firm.nunique() == 1 else 'unbalanced'}")

# Within vs between variation
overall_std_y = df["y"].std()
between_std_y = df.groupby("firm")["y"].mean().std()
within_std_y = df.groupby("firm")["y"].transform(lambda g: g - g.mean()).std()
print(f"\nVariation in y:")
print(f"  Overall std:  {overall_std_y:.4f}")
print(f"  Between std:  {between_std_y:.4f}")
print(f"  Within std:   {within_std_y:.4f}")

overall_std_x = df["x"].std()
between_std_x = df.groupby("firm")["x"].mean().std()
within_std_x = df.groupby("firm")["x"].transform(lambda g: g - g.mean()).std()
print(f"\nVariation in x:")
print(f"  Overall std:  {overall_std_x:.4f}")
print(f"  Between std:  {between_std_x:.4f}")
print(f"  Within std:   {within_std_x:.4f}")

# Within-firm correlation
within_corr = (
    df.groupby("firm")
    .apply(lambda g: g["y"].corr(g["x"]), include_groups=False)
)
print(f"\nWithin-firm correlation (y, x):")
print(f"  Mean:   {within_corr.mean():.4f}")
print(f"  Median: {within_corr.median():.4f}")

# ── Figure 1: Panel structure scatter ────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.patch.set_linewidth(0)

# Left: x vs y colored by firm (sample 10 firms)
rng_plot = np.random.default_rng(99)
sample_firms = sorted(rng_plot.choice(df["firm"].unique(), 10, replace=False))
colors_sample = [STEEL_BLUE, WARM_ORANGE, TEAL, "#e8956a", "#c4623d",
                 "#8fbfcc", "#e0a57a", "#5cc8c0", "#b0c4de", "#f0c8a0"]
for i, fid in enumerate(sample_firms):
    sub = df[df["firm"] == fid]
    axes[0].scatter(sub["x"], sub["y"], color=colors_sample[i % len(colors_sample)],
                    alpha=0.7, s=30, edgecolors=DARK_NAVY, linewidths=0.5)
axes[0].set_xlabel("R&D intensity (x)", fontsize=12)
axes[0].set_ylabel("Firm performance (y)", fontsize=12)
axes[0].set_title("10 sampled firms: x vs y", fontsize=13, fontweight="bold")

# Right: within-firm correlation distribution
axes[1].hist(within_corr, bins=20, color=STEEL_BLUE, edgecolor=DARK_NAVY,
             alpha=0.85)
axes[1].axvline(within_corr.mean(), color=WARM_ORANGE, linewidth=2,
                linestyle="--", label=f"Mean = {within_corr.mean():.2f}")
axes[1].set_xlabel("Within-firm correlation (y, x)", fontsize=12)
axes[1].set_ylabel("Number of firms", fontsize=12)
axes[1].set_title("Distribution of within-firm correlations", fontsize=13,
                  fontweight="bold")
axes[1].legend()

plt.tight_layout()
plt.savefig("panel_ses_eda.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()

# ══════════════════════════════════════════════════════════════════════════════
# 3. SET MULTIINDEX FOR linearmodels
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("SECTION: MultiIndex setup")
print("=" * 60)

df_panel = df.set_index(["firm", "year"])
print(f"\nMultiIndex levels: {df_panel.index.names}")
print(f"Index dtype: firm={df_panel.index.get_level_values(0).dtype}, "
      f"year={df_panel.index.get_level_values(1).dtype}")
print(f"\nFirst 3 rows of indexed data:")
print(df_panel.head(3).to_string())

# ══════════════════════════════════════════════════════════════════════════════
# 4. POOLED OLS (BASELINE)
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("SECTION: Pooled OLS (conventional SEs)")
print("=" * 60)

mod_pooled = PanelOLS.from_formula("y ~ 1 + x", data=df_panel)
res_pooled = mod_pooled.fit(cov_type="unadjusted")
print(res_pooled.summary.tables[1])

beta_pooled = res_pooled.params["x"]
se_pooled = res_pooled.std_errors["x"]
t_pooled = res_pooled.tstats["x"]
print(f"\nCoefficient on x: {beta_pooled:.4f}")
print(f"Conventional SE:  {se_pooled:.4f}")
print(f"t-statistic:      {t_pooled:.4f}")

# ══════════════════════════════════════════════════════════════════════════════
# 5. WHITE (HETEROSKEDASTICITY-ROBUST) SEs
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("SECTION: White (HC) standard errors")
print("=" * 60)

res_white = mod_pooled.fit(cov_type="robust")
se_white = res_white.std_errors["x"]
t_white = res_white.tstats["x"]
print(f"White SE:    {se_white:.4f}")
print(f"t-statistic: {t_white:.4f}")

# ══════════════════════════════════════════════════════════════════════════════
# 6. CLUSTERED STANDARD ERRORS
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("SECTION: Clustered standard errors")
print("=" * 60)

# Entity-clustered
res_cl_entity = mod_pooled.fit(cov_type="clustered", cluster_entity=True)
se_cl_entity = res_cl_entity.std_errors["x"]
t_cl_entity = res_cl_entity.tstats["x"]
print(f"Entity-clustered SE: {se_cl_entity:.4f}")
print(f"t-statistic:         {t_cl_entity:.4f}")

# Time-clustered
res_cl_time = mod_pooled.fit(cov_type="clustered", cluster_time=True)
se_cl_time = res_cl_time.std_errors["x"]
t_cl_time = res_cl_time.tstats["x"]
print(f"\nTime-clustered SE:   {se_cl_time:.4f}")
print(f"t-statistic:         {t_cl_time:.4f}")

# Two-way clustered
res_cl_both = mod_pooled.fit(cov_type="clustered",
                             cluster_entity=True, cluster_time=True)
se_cl_both = res_cl_both.std_errors["x"]
t_cl_both = res_cl_both.tstats["x"]
print(f"\nTwo-way clustered SE: {se_cl_both:.4f}")
print(f"t-statistic:          {t_cl_both:.4f}")

# ══════════════════════════════════════════════════════════════════════════════
# 7. ENTITY FIXED EFFECTS + CLUSTERED SEs
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("SECTION: Entity FE + clustered SEs")
print("=" * 60)

mod_fe = PanelOLS.from_formula("y ~ 1 + x + EntityEffects", data=df_panel)
res_fe_cl = mod_fe.fit(cov_type="clustered", cluster_entity=True)
beta_fe = res_fe_cl.params["x"]
se_fe_cl = res_fe_cl.std_errors["x"]
t_fe_cl = res_fe_cl.tstats["x"]
print(f"FE coefficient on x:    {beta_fe:.4f}")
print(f"Entity-clustered SE:    {se_fe_cl:.4f}")
print(f"t-statistic:            {t_fe_cl:.4f}")

# Two-way FE
mod_twfe = PanelOLS.from_formula("y ~ 1 + x + EntityEffects + TimeEffects",
                                 data=df_panel)
res_twfe = mod_twfe.fit(cov_type="clustered", cluster_entity=True)
beta_twfe = res_twfe.params["x"]
se_twfe = res_twfe.std_errors["x"]
t_twfe = res_twfe.tstats["x"]
print(f"\nTWFE coefficient on x:  {beta_twfe:.4f}")
print(f"Entity-clustered SE:    {se_twfe:.4f}")
print(f"t-statistic:            {t_twfe:.4f}")

# ══════════════════════════════════════════════════════════════════════════════
# 8. DRISCOLL-KRAAY STANDARD ERRORS
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("SECTION: Driscoll-Kraay standard errors")
print("=" * 60)

res_dk = mod_pooled.fit(cov_type="kernel", kernel="bartlett", bandwidth=3)
se_dk = res_dk.std_errors["x"]
t_dk = res_dk.tstats["x"]
print(f"Driscoll-Kraay SE (BW=3): {se_dk:.4f}")
print(f"t-statistic:              {t_dk:.4f}")

# ══════════════════════════════════════════════════════════════════════════════
# 9. SUMMARY COMPARISON TABLE
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("SECTION: Summary comparison")
print("=" * 60)

results = {
    "Pooled OLS (conventional)": (beta_pooled, se_pooled, t_pooled),
    "Pooled OLS (White/HC)": (beta_pooled, se_white, t_white),
    "Pooled OLS (cluster: entity)": (beta_pooled, se_cl_entity, t_cl_entity),
    "Pooled OLS (cluster: time)": (beta_pooled, se_cl_time, t_cl_time),
    "Pooled OLS (cluster: both)": (beta_pooled, se_cl_both, t_cl_both),
    "Entity FE (cluster: entity)": (beta_fe, se_fe_cl, t_fe_cl),
    "Two-way FE (cluster: entity)": (beta_twfe, se_twfe, t_twfe),
    "Pooled OLS (Driscoll-Kraay)": (beta_pooled, se_dk, t_dk),
}

summary_df = pd.DataFrame(
    [(name, b, se, t, abs(t) > 1.96)
     for name, (b, se, t) in results.items()],
    columns=["Model / SE Type", "Coefficient", "Std. Error", "t-stat",
             "Reject H0 (5%)"]
)
print(summary_df.to_string(index=False))

# ── Figure 2: SE comparison bar chart ────────────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

se_names = list(results.keys())
se_values = [results[k][1] for k in se_names]
colors_bar = [STEEL_BLUE if "FE" not in k
              else WARM_ORANGE
              for k in se_names]

bars = ax.barh(range(len(se_names)), se_values, color=colors_bar,
               edgecolor=DARK_NAVY, height=0.65)
ax.set_yticks(range(len(se_names)))
ax.set_yticklabels(se_names, fontsize=10)
ax.set_xlabel("Standard error of coefficient on x", fontsize=12)
ax.set_title("How SE estimates vary by method",
             fontsize=14, fontweight="bold", pad=15)

# Add value labels
for bar, val in zip(bars, se_values):
    ax.text(bar.get_width() + 0.002, bar.get_y() + bar.get_height() / 2,
            f"{val:.4f}", va="center", fontsize=10, color=LIGHT_TEXT)

ax.invert_yaxis()
plt.tight_layout()
plt.savefig("panel_ses_comparison.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()

# ── Figure 3: Confidence intervals ──────────────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

for i, (name, (b, se, t)) in enumerate(results.items()):
    ci_lo = b - 1.96 * se
    ci_hi = b + 1.96 * se
    color = (STEEL_BLUE if "FE" not in name and "Fama" not in name
             else WARM_ORANGE if "FE" in name else TEAL)
    ax.plot([ci_lo, ci_hi], [i, i], color=color, linewidth=2.5, solid_capstyle="round")
    ax.scatter([b], [i], color=color, s=60, zorder=5, edgecolors=DARK_NAVY)

ax.axvline(0.5, color=TEAL, linewidth=1.5, linestyle="--", alpha=0.7,
           label="True β = 0.5")
ax.set_yticks(range(len(results)))
ax.set_yticklabels(list(results.keys()), fontsize=10)
ax.set_xlabel("Coefficient on x (with 95% CI)", fontsize=12)
ax.set_title("95% confidence intervals across SE methods",
             fontsize=14, fontweight="bold", pad=15)
ax.legend(loc="upper left")
ax.invert_yaxis()
plt.tight_layout()
plt.savefig("panel_ses_ci.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()

# ══════════════════════════════════════════════════════════════════════════════
# 11. MONTE CARLO: EMPIRICAL REJECTION RATES
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("SECTION: Monte Carlo simulation")
print("=" * 60)

# We run the MC on Entity FE models (which are unbiased for beta = 0.5)
# to isolate the effect of SE choice on inference.
# We compare: FE + conventional, FE + White, FE + cluster entity,
# FE + cluster time, FE + two-way cluster.

N_SIM = 500
reject_counts = {
    "FE + conventional": 0,
    "FE + White (HC)": 0,
    "FE + cluster: entity": 0,
    "FE + cluster: time": 0,
    "FE + cluster: both": 0,
    "TWFE + cluster: entity": 0,
}

print(f"Running {N_SIM} simulations on FE models (H0: beta = 0.5 is true)...")

for sim in range(N_SIM):
    sim_df = simulate_panel(n_firms=100, n_years=10, seed=sim + 1000)
    sim_panel = sim_df.set_index(["firm", "year"])

    # Entity FE model
    mod_fe_sim = PanelOLS.from_formula("y ~ 1 + x + EntityEffects",
                                       data=sim_panel)

    # FE + conventional
    r = mod_fe_sim.fit(cov_type="unadjusted")
    if abs((r.params["x"] - 0.5) / r.std_errors["x"]) > 1.96:
        reject_counts["FE + conventional"] += 1

    # FE + White
    r = mod_fe_sim.fit(cov_type="robust")
    if abs((r.params["x"] - 0.5) / r.std_errors["x"]) > 1.96:
        reject_counts["FE + White (HC)"] += 1

    # FE + cluster entity
    r = mod_fe_sim.fit(cov_type="clustered", cluster_entity=True)
    if abs((r.params["x"] - 0.5) / r.std_errors["x"]) > 1.96:
        reject_counts["FE + cluster: entity"] += 1

    # FE + cluster time
    r = mod_fe_sim.fit(cov_type="clustered", cluster_time=True)
    if abs((r.params["x"] - 0.5) / r.std_errors["x"]) > 1.96:
        reject_counts["FE + cluster: time"] += 1

    # FE + cluster both
    r = mod_fe_sim.fit(cov_type="clustered", cluster_entity=True,
                       cluster_time=True)
    if abs((r.params["x"] - 0.5) / r.std_errors["x"]) > 1.96:
        reject_counts["FE + cluster: both"] += 1

    # TWFE + cluster entity
    mod_twfe_sim = PanelOLS.from_formula(
        "y ~ 1 + x + EntityEffects + TimeEffects", data=sim_panel)
    r = mod_twfe_sim.fit(cov_type="clustered", cluster_entity=True)
    if abs((r.params["x"] - 0.5) / r.std_errors["x"]) > 1.96:
        reject_counts["TWFE + cluster: entity"] += 1

rejection_rates = {k: v / N_SIM for k, v in reject_counts.items()}

print("\nEmpirical rejection rates at 5% level (H0: beta=0.5 is true):")
for method, rate in rejection_rates.items():
    status = ("*** OVER-REJECTS" if rate > 0.10
              else "~correct" if 0.03 <= rate <= 0.08
              else "conservative" if rate < 0.03
              else "")
    print(f"  {method:30s}: {rate:.3f} ({reject_counts[method]}/{N_SIM})  {status}")

# ── Figure 4: Monte Carlo rejection rates ────────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 5))
fig.patch.set_linewidth(0)

mc_names = list(rejection_rates.keys())
mc_rates = [rejection_rates[k] for k in mc_names]
mc_colors = [WARM_ORANGE if r > 0.10 else TEAL if 0.03 <= r <= 0.08
             else STEEL_BLUE for r in mc_rates]

bars = ax.barh(range(len(mc_names)), mc_rates, color=mc_colors,
               edgecolor=DARK_NAVY, height=0.6)
ax.axvline(0.05, color=TEAL, linewidth=2, linestyle="--",
           label="Nominal 5% level")
ax.set_yticks(range(len(mc_names)))
ax.set_yticklabels(mc_names, fontsize=11)
ax.set_xlabel("Empirical rejection rate", fontsize=12)
ax.set_title(f"Monte Carlo rejection rates ({N_SIM} simulations, H0 true)",
             fontsize=14, fontweight="bold", pad=15)
ax.legend(loc="lower right")
ax.xaxis.set_major_formatter(mticker.PercentFormatter(xmax=1, decimals=0))

for bar, val in zip(bars, mc_rates):
    ax.text(bar.get_width() + 0.005, bar.get_y() + bar.get_height() / 2,
            f"{val:.1%}", va="center", fontsize=10, color=LIGHT_TEXT)

ax.invert_yaxis()
plt.tight_layout()
plt.savefig("panel_ses_montecarlo.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()

# ── Figure 5: SE ratio relative to clustered ─────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 5))
fig.patch.set_linewidth(0)

# Use entity-clustered as the benchmark
benchmark_se = se_cl_entity
ratio_names = [k for k in results.keys() if k != "Pooled OLS (cluster: entity)"]
ratio_vals = [results[k][1] / benchmark_se for k in ratio_names]
ratio_colors = [WARM_ORANGE if r < 0.8 else STEEL_BLUE if r <= 1.2
                else TEAL for r in ratio_vals]

bars = ax.barh(range(len(ratio_names)), ratio_vals, color=ratio_colors,
               edgecolor=DARK_NAVY, height=0.6)
ax.axvline(1.0, color=TEAL, linewidth=2, linestyle="--",
           label="Entity-clustered (benchmark)")
ax.set_yticks(range(len(ratio_names)))
ax.set_yticklabels(ratio_names, fontsize=10)
ax.set_xlabel("SE ratio (relative to entity-clustered SE)", fontsize=12)
ax.set_title("Standard error ratios: which methods under- or overstate uncertainty?",
             fontsize=13, fontweight="bold", pad=15)
ax.legend(loc="lower right")

for bar, val in zip(bars, ratio_vals):
    ax.text(bar.get_width() + 0.01, bar.get_y() + bar.get_height() / 2,
            f"{val:.2f}x", va="center", fontsize=10, color=LIGHT_TEXT)

ax.invert_yaxis()
plt.tight_layout()
plt.savefig("panel_ses_ratios.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()

print("\n" + "=" * 60)
print("All figures saved. Script complete.")
print("=" * 60)
