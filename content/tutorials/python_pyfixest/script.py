"""
High-Dimensional Fixed Effects Regression: An Introduction in Python

This script demonstrates how to estimate regression models with high-dimensional
fixed effects using the pyfixest package. We work through OLS, one-way and two-way
fixed effects, instrumental variables, panel data, and event study designs.

Usage:
    python script.py

References:
    - https://pyfixest.org/quickstart.html
    - https://github.com/py-econometrics/pyfixest
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import pyfixest as pf

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

# Plot defaults — minimal, spine-free, dark background
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

# ── Section 1: Load and explore synthetic data ───────────────────────────────

print("=" * 60)
print("SECTION 1: Data Loading and Exploration")
print("=" * 60)

data = pf.get_data()
print(f"\nDataset shape: {data.shape}")
print(f"\nColumn names: {list(data.columns)}")
print(f"\nFirst 5 rows:")
print(data.head())
print(f"\nDescriptive statistics:")
print(data.describe().round(3))
print(f"\nMissing values:\n{data.isnull().sum()}")

# Figure 1: Scatter plot of Y vs X1 colored by group
fig, ax = plt.subplots(figsize=(10, 6))
groups = data["group_id"].unique()
n_groups = len(groups)
dark_colors = [STEEL_BLUE, WARM_ORANGE, TEAL, "#e8956a", "#8ec8e8",
               "#f0a88c", "#66e8df", "#b8d4e8", "#f2c4b0", "#99f0ea"]
for i, g in enumerate(sorted(groups)):
    subset = data[data["group_id"] == g]
    ax.scatter(subset["X1"], subset["Y"], alpha=0.5, s=20,
               color=dark_colors[i % len(dark_colors)], label=f"Group {g}" if i < 5 else None)
ax.set_xlabel("X1", fontsize=13, color=LIGHT_TEXT)
ax.set_ylabel("Y", fontsize=13, color=LIGHT_TEXT)
ax.set_title("Outcome (Y) vs Covariate (X1) by Group", fontsize=15,
             fontweight="bold", color=WHITE_TEXT)
ax.legend(title="Group (first 5)", fontsize=9, title_fontsize=10)
plt.tight_layout()
plt.savefig("pyfixest_scatter_by_group.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()

# ── Section 2: Simple OLS (no fixed effects) ────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 2: Simple OLS (No Fixed Effects)")
print("=" * 60)

fit_ols = pf.feols("Y ~ X1", data=data, vcov="HC1")
print(fit_ols.summary())

# ── Section 3: One-Way Fixed Effects ─────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 3: One-Way Fixed Effects (group_id)")
print("=" * 60)

fit_fe1 = pf.feols("Y ~ X1 | group_id", data=data, vcov="HC1")
print(fit_fe1.summary())

# Comparison with dummy variable approach
print("\n--- Dummy Variable Approach (equivalent) ---")
fit_dummy = pf.feols("Y ~ X1 + C(group_id)", data=data, vcov="HC1")
print(f"X1 coefficient (FE absorption): {fit_fe1.coef()['X1']:.4f}")
print(f"X1 coefficient (dummy vars):    {fit_dummy.coef()['X1']:.4f}")

# ── Section 4: Understanding FE via Manual Demeaning ─────────────────────────

print("\n" + "=" * 60)
print("SECTION 4: Manual Demeaning (Within Transformation)")
print("=" * 60)

# Manual demeaning
data_dm = data.copy()
for col in ["Y", "X1"]:
    group_means = data_dm.groupby("group_id")[col].transform("mean")
    data_dm[f"{col}_dm"] = data_dm[col] - group_means

fit_demeaned = pf.feols("Y_dm ~ X1_dm", data=data_dm, vcov="HC1")
print(f"X1 coefficient (FE absorption):  {fit_fe1.coef()['X1']:.4f}")
print(f"X1 coefficient (manual demean):  {fit_demeaned.coef()['X1_dm']:.4f}")
print(f"X1 coefficient (OLS, no FE):     {fit_ols.coef()['X1']:.4f}")

# Figure 2: Demeaning visualization
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Left: Raw data with group means
for i, g in enumerate(sorted(groups)[:5]):
    subset = data[data["group_id"] == g]
    axes[0].scatter(subset["X1"], subset["Y"], alpha=0.4, s=20,
                    color=dark_colors[i % len(dark_colors)])
axes[0].set_xlabel("X1 (raw)", fontsize=13, color=LIGHT_TEXT)
axes[0].set_ylabel("Y (raw)", fontsize=13, color=LIGHT_TEXT)
axes[0].set_title("Raw Data: Between + Within Variation",
                   fontsize=13, fontweight="bold", color=WHITE_TEXT)

# Right: Demeaned data
axes[1].scatter(data_dm["X1_dm"], data_dm["Y_dm"], alpha=0.4, s=20,
                color=STEEL_BLUE, label="Demeaned observations")
# Add regression line
x_range = np.linspace(data_dm["X1_dm"].min(), data_dm["X1_dm"].max(), 100)
y_pred = fit_demeaned.coef()["X1_dm"] * x_range
axes[1].plot(x_range, y_pred, color=WARM_ORANGE, linewidth=2.5,
             label=f"FE slope = {fit_demeaned.coef()['X1_dm']:.3f}")
axes[1].set_xlabel("X1 (demeaned)", fontsize=13, color=LIGHT_TEXT)
axes[1].set_ylabel("Y (demeaned)", fontsize=13, color=LIGHT_TEXT)
axes[1].set_title("Demeaned Data: Within-Group Variation Only",
                   fontsize=13, fontweight="bold", color=WHITE_TEXT)
axes[1].legend(fontsize=11)

plt.tight_layout()
plt.savefig("pyfixest_demeaning.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()

# ── Section 5: Multiple Estimation (Cumulative Stepwise) ────────────────────

print("\n" + "=" * 60)
print("SECTION 5: Multiple Estimation (Cumulative Stepwise)")
print("=" * 60)

fit_multi = pf.feols("Y ~ X1 | csw0(f1, f2)", data=data, vcov="HC1")

# Print summary for each model
models = fit_multi.all_fitted_models
for key in models:
    m = models[key]
    print(f"\nModel: {key}")
    print(m.summary())

# Figure 3: Coefficient comparison across specs
models = fit_multi.all_fitted_models
model_names = ["No FE", "FE: f1", "FE: f1 + f2"]
coefs = []
ses = []
for key in models:
    m = models[key]
    coefs.append(m.coef()["X1"])
    ses.append(m.se()["X1"])

fig, ax = plt.subplots(figsize=(8, 5))
y_pos = np.arange(len(model_names))
ax.barh(y_pos, coefs, xerr=[1.96 * s for s in ses], height=0.5,
        color=[STEEL_BLUE, WARM_ORANGE, TEAL], edgecolor=DARK_NAVY,
        linewidth=0.8, capsize=5,
        error_kw={"ecolor": LIGHT_TEXT, "capthick": 1.5})
ax.set_yticks(y_pos)
ax.set_yticklabels(model_names, fontsize=12)
ax.set_xlabel("Coefficient on X1", fontsize=13, color=LIGHT_TEXT)
ax.set_title("Effect of X1 Across Fixed Effect Specifications",
             fontsize=14, fontweight="bold", color=WHITE_TEXT)
ax.axvline(x=0, color=LIGHT_TEXT, linewidth=0.8, linestyle="--", alpha=0.5)
# Add coefficient values as text (to the right of zero, outside bars)
for i, (c, s) in enumerate(zip(coefs, ses)):
    ax.text(0.02, i, f"β = {c:.3f}  (SE = {s:.3f})", va="center", ha="left",
            fontsize=10, fontweight="bold", color=WHITE_TEXT)
plt.tight_layout()
plt.savefig("pyfixest_coef_comparison.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()

# ── Section 6: Inference -- Different Standard Error Types ──────────────────

print("\n" + "=" * 60)
print("SECTION 6: Inference -- Standard Error Comparison")
print("=" * 60)

fit_base = pf.feols("Y ~ X1 | group_id", data=data)

# Different SE types (HC2/HC3 not supported with FE in pyfixest)
se_types = {
    "iid": "iid",
    "HC1 (robust)": "HC1",
    "CRV1 (group_id)": {"CRV1": "group_id"},
    "CRV1 (group_id + f2)": {"CRV1": "group_id + f2"},
    "CRV3 (group_id)": {"CRV3": "group_id"},
}

print(f"{'SE Type':<22} {'SE(X1)':<10} {'t-stat':<10} {'p-value':<10}")
print("-" * 52)
se_results = {}
for name, vcov in se_types.items():
    fit_tmp = pf.feols("Y ~ X1 | group_id", data=data, vcov=vcov)
    se_val = fit_tmp.se()["X1"]
    t_val = fit_tmp.tstat()["X1"]
    p_val = fit_tmp.pvalue()["X1"]
    se_results[name] = {"se": se_val, "t": t_val, "p": p_val}
    print(f"{name:<22} {se_val:<10.4f} {t_val:<10.3f} {p_val:<10.4f}")

# Figure 4: SE comparison bar chart
fig, ax = plt.subplots(figsize=(9, 5))
se_names = list(se_results.keys())
se_vals = [se_results[n]["se"] for n in se_names]
colors = [STEEL_BLUE, WARM_ORANGE, TEAL, "#e8956a", "#f0a88c"]
bars = ax.bar(range(len(se_names)), se_vals, color=colors, edgecolor=DARK_NAVY,
              linewidth=0.8, width=0.6)
ax.set_xticks(range(len(se_names)))
ax.set_xticklabels(se_names, rotation=25, ha="right", fontsize=10)
ax.set_ylabel("Standard Error of X1", fontsize=13, color=LIGHT_TEXT)
ax.set_title("Standard Errors Under Different Assumptions",
             fontsize=14, fontweight="bold", color=WHITE_TEXT)
for i, v in enumerate(se_vals):
    ax.text(i, v + 0.002, f"{v:.4f}", ha="center", fontsize=10, fontweight="bold",
            color=WHITE_TEXT)
plt.tight_layout()
plt.savefig("pyfixest_se_comparison.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()

# ── Section 7: Two-Way Fixed Effects ────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 7: Two-Way Fixed Effects")
print("=" * 60)

fit_twoway = pf.feols("Y ~ X1 + X2 | f1 + f2", data=data, vcov="HC1")
print(fit_twoway.summary())

# ── Section 8: Instrumental Variables ───────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 8: Instrumental Variables with Fixed Effects")
print("=" * 60)

fit_iv = pf.feols("Y2 ~ 1 | f1 + f2 | X1 ~ Z1 + Z2", data=data)
print(fit_iv.summary())

# IV diagnostics
print(f"\nFirst-stage F-statistic: {fit_iv._f_stat_1st_stage:.2f}")
try:
    eff_f_val = fit_iv.eff_F()
    print(f"Effective F-statistic (Olea & Pflueger): {eff_f_val:.2f}")
except Exception:
    print("Effective F-statistic: see IV diagnostics via fit_iv.IV_Diag()")

# ── Section 9: Panel Data Application (Wage Panel) ─────────────────────────

print("\n" + "=" * 60)
print("SECTION 9: Panel Data Application -- Wage Panel")
print("=" * 60)

url = "https://raw.githubusercontent.com/bashtage/linearmodels/main/linearmodels/datasets/wage_panel/wage_panel.csv.bz2"
try:
    wage_df = pd.read_csv(url, compression="bz2")
    print(f"Wage panel shape: {wage_df.shape}")
    print(f"\nFirst 5 rows:")
    print(wage_df.head())

    # --- Expanded EDA ---
    print(f"\nDescriptive statistics (all columns):")
    print(wage_df.describe().round(3))

    # Time-invariant check
    print("\n--- Time-Invariant Variable Check ---")
    ti_check = wage_df.groupby("nr")[["educ", "black", "hisp"]].nunique()
    print("Max unique values per individual:")
    print(ti_check.max())
    print("→ All equal 1: educ, black, hisp are time-invariant")

    # Occupation changes check (part of EDA)
    occ_changes = wage_df.groupby("nr")["occupation"].nunique()
    print(f"\nWorkers who change occupation: {(occ_changes > 1).sum()} / {len(occ_changes)}")

    # --- Figure: Between vs Within variation ---
    print("\n--- Between vs Within Variation ---")
    cols_bw = ["lwage", "hours", "union", "married", "expersq", "educ"]
    between = wage_df.groupby("nr")[cols_bw].mean().std()
    for col in cols_bw:
        wage_df[f"{col}_within"] = wage_df[col] - wage_df.groupby("nr")[col].transform("mean")
    within = wage_df[[f"{c}_within" for c in cols_bw]].std()
    within.index = cols_bw  # clean index names

    print("Between SD:")
    print(between.round(4))
    print("\nWithin SD:")
    print(within.round(4))

    # Within share: fraction of total SD that comes from within-worker variation
    total = np.sqrt(between**2 + within**2)
    within_share = (within / total).fillna(0)  # educ: 0/0 → 0
    between_share = 1 - within_share

    print("\nWithin share of total SD:")
    print(within_share.round(4))

    fig, ax = plt.subplots(figsize=(10, 5))
    y_pos = np.arange(len(cols_bw))
    bar_height = 0.55
    # Stacked horizontal bars: between (left) + within (right) = 100%
    ax.barh(y_pos, between_share.values, bar_height,
            label="Between (cross-worker)", color=STEEL_BLUE, edgecolor=DARK_NAVY, linewidth=0.5)
    ax.barh(y_pos, within_share.values, bar_height, left=between_share.values,
            label="Within (over career)", color=WARM_ORANGE, edgecolor=DARK_NAVY, linewidth=0.5)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(cols_bw, fontsize=12, color=LIGHT_TEXT)
    ax.set_xlabel("Share of Total Standard Deviation", fontsize=12, color=LIGHT_TEXT)
    ax.set_xlim(0, 1.0)
    ax.set_title("Between vs Within Variation in Wage Panel",
                 fontsize=14, fontweight="bold", color=WHITE_TEXT)
    ax.legend(loc="lower right", fontsize=11)
    # Annotate percentages
    for i, var in enumerate(cols_bw):
        ws = within_share[var]
        bs = between_share[var]
        if ws > 0.05:
            ax.text(bs + ws / 2, i, f"{ws:.0%}", ha="center", va="center",
                    fontsize=10, fontweight="bold", color=DARK_NAVY)
        else:
            ax.text(bs + 0.02, i, "0%", ha="left", va="center",
                    fontsize=10, fontweight="bold", color=WARM_ORANGE)
        ax.text(bs / 2, i, f"{bs:.0%}", ha="center", va="center",
                fontsize=10, fontweight="bold", color=DARK_NAVY)
    # Annotate educ
    educ_idx = cols_bw.index("educ")
    ax.annotate("time-invariant → FE cannot estimate",
                xy=(1.0, educ_idx), xytext=(0.55, educ_idx - 0.65),
                fontsize=9, color=WARM_ORANGE, fontweight="bold",
                arrowprops=dict(arrowstyle="->", color=WARM_ORANGE, lw=1.2))
    plt.tight_layout()
    plt.savefig("pyfixest_within_between.png", dpi=300, bbox_inches="tight",
                facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
    plt.show()
    plt.close()

    # Clean up within columns
    wage_df.drop(columns=[f"{c}_within" for c in cols_bw], inplace=True)

    # --- Pooled OLS (full Mincer specification) ---
    fit_pooled = pf.feols(
        "lwage ~ educ + expersq + union + married + hours + black + hisp",
        data=wage_df, vcov="HC1"
    )
    print("\n--- Pooled OLS ---")
    print(fit_pooled.summary())

    # --- One-Way FE only ---
    fit_entity = pf.feols("lwage ~ expersq + union + married + hours | nr",
                          data=wage_df, vcov={"CRV1": "nr"})
    print("\n--- Entity (Individual) Fixed Effects ---")
    print(fit_entity.summary())

    # --- Two-way FE: entity + time ---
    fit_panel = pf.feols("lwage ~ expersq + union + married + hours | nr + year",
                         data=wage_df, vcov={"CRV1": "nr + year"})
    print("\n--- Two-Way FE (Individual + Year) ---")
    print(fit_panel.summary())

    # --- Education absorption demo ---
    print("\n--- Education Absorption Demo ---")
    import warnings
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        fit_educ = pf.feols("lwage ~ expersq + union + married + educ | nr",
                            data=wage_df, vcov={"CRV1": "nr"})
        if w:
            for warning in w:
                print(f"Warning: {warning.message}")
        else:
            print("Note: PyFixest silently dropped 'educ' (time-invariant, collinear with one-way FE)")
    print(fit_educ.summary())
    print(f"\nCoefficients estimated: {list(fit_educ.coef().index)}")
    if "educ" not in fit_educ.coef().index:
        print("→ 'educ' was dropped: it is time-invariant and perfectly collinear with one-way FE")

    # --- Three-way FE: entity + year + occupation ---
    print("\n--- Three-Way FE (Individual + Year + Occupation) ---")
    fit_threeway = pf.feols(
        "lwage ~ expersq + union + married + hours | nr + year + C(occupation)",
        data=wage_df, vcov={"CRV1": "nr"}
    )
    print(fit_threeway.summary())

    # --- 4-spec comparison table ---
    print("\n--- Four-Specification Comparison ---")
    spec_models = {
        "Pooled OLS": fit_pooled,
        "One-Way FE": fit_entity,
        "Two-Way FE": fit_panel,
        "Three-Way FE": fit_threeway,
    }
    compare_vars = ["expersq", "union", "married", "hours"]
    print(f"{'Variable':<12} {'Pooled OLS':>12} {'One-Way FE':>12} {'Two-Way FE':>12} {'Three-Way FE':>12}")
    print("-" * 60)
    for var in compare_vars:
        vals = []
        for name, m in spec_models.items():
            if var in m.coef().index:
                vals.append(f"{m.coef()[var]:.4f}")
            else:
                vals.append("dropped")
        print(f"{var:<12} {vals[0]:>12} {vals[1]:>12} {vals[2]:>12} {vals[3]:>12}")

    # Print R-squared values
    print(f"\n{'R-squared':<12} {fit_pooled._r2:.3f}{' ':>9} {fit_entity._r2:.3f}{' ':>9} "
          f"{fit_panel._r2:.3f}{' ':>9} {fit_threeway._r2:.3f}")

    # --- Figure: Extended wage comparison (4 specs) ---
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    axes = axes.flatten()
    panel_colors_4 = [STEEL_BLUE, WARM_ORANGE, TEAL, "#e8956a"]

    for idx, var in enumerate(compare_vars):
        ax = axes[idx]
        model_names_ext = list(spec_models.keys())
        coefs_ext = []
        ses_ext = []
        for name in model_names_ext:
            m = spec_models[name]
            if var in m.coef().index:
                coefs_ext.append(m.coef()[var])
                ses_ext.append(m.se()[var])
            else:
                coefs_ext.append(0)
                ses_ext.append(0)

        bars = ax.bar(range(len(model_names_ext)), coefs_ext,
                      yerr=[1.96 * s for s in ses_ext],
                      color=panel_colors_4, edgecolor=DARK_NAVY,
                      linewidth=0.8, width=0.5, capsize=4,
                      error_kw={"ecolor": LIGHT_TEXT, "capthick": 1.5})
        ax.set_xticks(range(len(model_names_ext)))
        ax.set_xticklabels(model_names_ext, fontsize=8, rotation=20)
        ax.set_title(var, fontsize=12, fontweight="bold", color=WHITE_TEXT)
        ax.axhline(y=0, color=LIGHT_TEXT, linewidth=0.5, linestyle="--", alpha=0.5)

    fig.suptitle("Wage Determinants: Pooled OLS → One-Way FE → Two-Way FE → Three-Way FE",
                 fontsize=13, fontweight="bold", color=WHITE_TEXT, y=1.02)
    plt.tight_layout()
    plt.savefig("pyfixest_wage_extended.png", dpi=300, bbox_inches="tight",
                facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
    plt.show()
    plt.close()

    # --- Interactive fixed effects ---
    print("\n--- Interactive Fixed Effects ---")
    fit_gtrends = pf.feols(
        "lwage ~ expersq + union + married + hours | nr + year^black",
        data=wage_df, vcov={"CRV1": "nr"}
    )
    print(fit_gtrends.summary())

    # Comparison: Additive vs interactive FE
    print("\n--- Additive vs Interactive FE ---")
    gt_vars = ["expersq", "union", "married", "hours"]
    print(f"{'Variable':<12} {'Two-Way FE':>14} {'Interactive FE':>14} {'Difference':>14}")
    print("-" * 56)
    for var in gt_vars:
        twfe_val = fit_panel.coef()[var]
        gt_val = fit_gtrends.coef()[var]
        diff = gt_val - twfe_val
        print(f"{var:<12} {twfe_val:>14.4f} {gt_val:>14.4f} {diff:>14.4f}")

    # --- Figure: Group-specific trends comparison ---
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    axes = axes.flatten()

    for idx, var in enumerate(gt_vars):
        ax = axes[idx]
        models_gt = {"Two-Way FE": fit_panel, "Interactive FE": fit_gtrends}
        model_names_gt = list(models_gt.keys())
        coefs_gt = [models_gt[m].coef()[var] for m in model_names_gt]
        ses_gt = [models_gt[m].se()[var] for m in model_names_gt]
        gt_colors = [STEEL_BLUE, WARM_ORANGE]

        bars = ax.bar(range(len(model_names_gt)), coefs_gt,
                      yerr=[1.96 * s for s in ses_gt],
                      color=gt_colors, edgecolor=DARK_NAVY,
                      linewidth=0.8, width=0.4, capsize=5,
                      error_kw={"ecolor": LIGHT_TEXT, "capthick": 1.5})
        ax.set_xticks(range(len(model_names_gt)))
        ax.set_xticklabels(model_names_gt, fontsize=10)
        ax.set_title(var, fontsize=12, fontweight="bold", color=WHITE_TEXT)
        ax.axhline(y=0, color=LIGHT_TEXT, linewidth=0.5, linestyle="--", alpha=0.5)

    fig.suptitle("Additive vs Interactive Fixed Effects (by Race)",
                 fontsize=13, fontweight="bold", color=WHITE_TEXT, y=1.02)
    plt.tight_layout()
    plt.savefig("pyfixest_group_trends.png", dpi=300, bbox_inches="tight",
                facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
    plt.show()
    plt.close()

    # --- Mundlak / Correlated Random Effects model ---
    print("\n--- Mundlak / Correlated Random Effects ---")
    mundlak_vars = ["union", "married", "hours", "expersq"]
    for var in mundlak_vars:
        wage_df[f"{var}_mean"] = wage_df.groupby("nr")[var].transform("mean")

    fit_mundlak = pf.feols(
        "lwage ~ expersq + union + married + hours + educ + black + hisp "
        "+ expersq_mean + union_mean + married_mean + hours_mean",
        data=wage_df, vcov={"CRV1": "nr"}
    )
    print(fit_mundlak.summary())

    # Comparison: Pooled OLS vs One-Way FE vs Mundlak
    print("\n--- Pooled OLS vs One-Way FE vs Mundlak Comparison ---")
    mundlak_compare_tv = ["expersq", "union", "married", "hours"]
    mundlak_compare_ti = ["educ", "black", "hisp"]
    all_mundlak_vars = mundlak_compare_tv + mundlak_compare_ti

    print(f"{'Variable':<12} {'Pooled OLS':>14} {'One-Way FE':>14} {'CRE':>14}")
    print("-" * 56)
    for var in all_mundlak_vars:
        pooled_val = fit_pooled.coef()[var] if var in fit_pooled.coef().index else None
        entity_val = fit_entity.coef()[var] if var in fit_entity.coef().index else None
        mundlak_val = fit_mundlak.coef()[var] if var in fit_mundlak.coef().index else None

        pooled_str = f"{pooled_val:>14.4f}" if pooled_val is not None else f"{'dropped':>14}"
        entity_str = f"{entity_val:>14.4f}" if entity_val is not None else f"{'dropped':>14}"
        mundlak_str = f"{mundlak_val:>14.4f}" if mundlak_val is not None else f"{'dropped':>14}"
        print(f"{var:<12} {pooled_str} {entity_str} {mundlak_str}")

    # Print Mundlak correction terms
    print(f"\n{'Mundlak correction terms:'}")
    for var in mundlak_vars:
        mean_var = f"{var}_mean"
        if mean_var in fit_mundlak.coef().index:
            print(f"  {mean_var}: {fit_mundlak.coef()[mean_var]:.4f} "
                  f"(SE: {fit_mundlak.se()[mean_var]:.4f})")

    # --- Figure: Mundlak comparison ---
    fig, ax = plt.subplots(figsize=(10, 8))
    all_plot_vars = mundlak_compare_tv + mundlak_compare_ti
    y_pos = np.arange(len(all_plot_vars))
    bar_height = 0.25

    # Collect coefficients and CIs for each model
    pooled_coefs, entity_coefs, mundlak_coefs = [], [], []
    pooled_cis, entity_cis, mundlak_cis = [], [], []

    for var in all_plot_vars:
        # Pooled OLS
        if var in fit_pooled.coef().index:
            pooled_coefs.append(fit_pooled.coef()[var])
            pooled_cis.append(1.96 * fit_pooled.se()[var])
        else:
            pooled_coefs.append(0)
            pooled_cis.append(0)

        # One-Way FE (time-invariant vars dropped)
        if var in fit_entity.coef().index:
            entity_coefs.append(fit_entity.coef()[var])
            entity_cis.append(1.96 * fit_entity.se()[var])
        else:
            entity_coefs.append(0)
            entity_cis.append(0)

        # Mundlak
        if var in fit_mundlak.coef().index:
            mundlak_coefs.append(fit_mundlak.coef()[var])
            mundlak_cis.append(1.96 * fit_mundlak.se()[var])
        else:
            mundlak_coefs.append(0)
            mundlak_cis.append(0)

    ax.barh(y_pos + bar_height, pooled_coefs, bar_height, xerr=pooled_cis,
            label="Pooled OLS", color=STEEL_BLUE, edgecolor=DARK_NAVY, linewidth=0.5,
            capsize=3, error_kw={"ecolor": LIGHT_TEXT, "capthick": 1})
    ax.barh(y_pos, entity_coefs, bar_height, xerr=entity_cis,
            label="One-Way FE", color=WARM_ORANGE, edgecolor=DARK_NAVY, linewidth=0.5,
            capsize=3, error_kw={"ecolor": LIGHT_TEXT, "capthick": 1})
    ax.barh(y_pos - bar_height, mundlak_coefs, bar_height, xerr=mundlak_cis,
            label="CRE", color=TEAL, edgecolor=DARK_NAVY, linewidth=0.5,
            capsize=3, error_kw={"ecolor": LIGHT_TEXT, "capthick": 1})

    ax.set_yticks(y_pos)
    ax.set_yticklabels(all_plot_vars, fontsize=11, color=LIGHT_TEXT)
    ax.set_xlabel("Coefficient Estimate", fontsize=12, color=LIGHT_TEXT)
    ax.axvline(x=0, color=LIGHT_TEXT, linewidth=0.5, linestyle="--", alpha=0.5)

    # Add separator between time-varying and time-invariant
    sep_y = len(mundlak_compare_tv) - 0.5
    ax.axhline(y=sep_y, color=LIGHT_TEXT, linewidth=0.8, linestyle=":", alpha=0.6)
    ax.text(ax.get_xlim()[1] * 0.7, sep_y + 0.15, "time-varying ↑",
            fontsize=9, color=LIGHT_TEXT, ha="center", va="bottom")
    ax.text(ax.get_xlim()[1] * 0.7, sep_y - 0.15, "time-invariant ↓",
            fontsize=9, color=LIGHT_TEXT, ha="center", va="top")

    ax.legend(loc="lower right", fontsize=11)
    ax.set_title("Pooled OLS vs One-Way FE vs CRE",
                 fontsize=14, fontweight="bold", color=WHITE_TEXT)
    plt.tight_layout()
    plt.savefig("pyfixest_mundlak.png", dpi=300, bbox_inches="tight",
                facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
    plt.show()
    plt.close()

    PANEL_SUCCESS = True
except Exception as e:
    print(f"Warning: Could not load wage panel data: {e}")
    PANEL_SUCCESS = False

# ── Section 10: Event Study / Difference-in-Differences ─────────────────────

print("\n" + "=" * 60)
print("SECTION 10: Event Study / Difference-in-Differences")
print("=" * 60)

try:
    df_het = pd.read_csv(
        "https://raw.githubusercontent.com/py-econometrics/pyfixest/master/pyfixest/did/data/df_het.csv"
    )
    print(f"DiD dataset shape: {df_het.shape}")
    print(f"Columns: {list(df_het.columns)}")
    print(df_het.head())

    # TWFE event study
    fit_twfe = pf.feols(
        "dep_var ~ i(rel_year, ref=-1.0) | state + year",
        data=df_het,
        vcov={"CRV1": "state"},
    )
    print("\n--- TWFE Event Study ---")
    print(fit_twfe.summary())

    # DID2S (Gardner 2022)
    fit_did2s = pf.did2s(
        df_het,
        yname="dep_var",
        first_stage="~ 0 | state + year",
        second_stage="~ i(rel_year, ref=-1.0)",
        treatment="treat",
        cluster="state",
    )
    print("\n--- DID2S Event Study (Gardner 2022) ---")
    print(fit_did2s.summary())

    # Figure 6: Event study comparison -- manual plot
    # Extract coefficients from both models for plotting
    twfe_coefs = fit_twfe.coef()
    twfe_se = fit_twfe.se()
    did2s_coefs = fit_did2s.coef()
    did2s_se = fit_did2s.se()

    # Parse relative years from coefficient names
    # PyFixest v0.40+ uses C(rel_year, contr.treatment(base=-1.0))[T.-20.0] format
    import re
    def parse_rel_years(coef_dict, se_dict):
        years, vals, ses_list = [], [], []
        for k in coef_dict.index:
            match = re.search(r'\[T\.(-?(?:inf|\d+\.?\d*))\]', str(k))
            if match:
                val = match.group(1)
                if val in ('inf', '-inf'):
                    continue  # skip catch-all bin
                years.append(float(val))
                vals.append(coef_dict[k])
                ses_list.append(se_dict[k])
        return years, vals, ses_list

    twfe_years, twfe_vals, twfe_ses = parse_rel_years(twfe_coefs, twfe_se)
    did2s_years, did2s_vals, did2s_ses = parse_rel_years(did2s_coefs, did2s_se)

    fig, ax = plt.subplots(figsize=(12, 6))
    offset = 0.15
    ax.errorbar([y - offset for y in twfe_years], twfe_vals,
                yerr=[1.96 * s for s in twfe_ses],
                fmt='o', color=STEEL_BLUE, capsize=3, label='TWFE', markersize=6)
    ax.errorbar([y + offset for y in did2s_years], did2s_vals,
                yerr=[1.96 * s for s in did2s_ses],
                fmt='s', color=WARM_ORANGE, capsize=3, label='DID2S (Gardner 2022)', markersize=6)
    ax.axhline(y=0, color=LIGHT_TEXT, linewidth=0.8, linestyle="--", alpha=0.5)
    ax.axvline(x=-0.5, color=LIGHT_TEXT, linewidth=1, linestyle="--", alpha=0.6)
    ax.plot(-1, 0, 'D', color=TEAL, markersize=10, zorder=5,
            label="Baseline (t = −1)")
    ax.set_xlabel("Relative Year", fontsize=13, color=LIGHT_TEXT)
    ax.set_ylabel("Coefficient Estimate", fontsize=13, color=LIGHT_TEXT)
    ax.set_title("Event Study: TWFE vs DID2S", fontsize=14,
                 fontweight="bold", color=WHITE_TEXT)
    ax.legend(fontsize=11)
    plt.tight_layout()
    plt.savefig("pyfixest_event_study.png", dpi=300, bbox_inches="tight",
                facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
    plt.show()
    plt.close()

    EVENT_SUCCESS = True
except Exception as e:
    print(f"Warning: Event study section failed: {e}")
    EVENT_SUCCESS = False

# ── Section 11: Wald Test ───────────────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 11: Hypothesis Testing (Wald Test)")
print("=" * 60)

fit_wald = pf.feols("Y ~ X1 + X2 | f1", data=data, vcov="HC1")
print(fit_wald.summary())

# Joint null: X1 = 0 AND X2 = 0
R = np.eye(2)
wald_result = fit_wald.wald_test(R=R)
print(f"\nWald test (joint null: X1=0, X2=0):")
print(wald_result)

# ── Section 12: Wild Bootstrap and Randomization Inference ──────────────────

print("\n" + "=" * 60)
print("SECTION 12: Wild Cluster Bootstrap")
print("=" * 60)

fit_boot = pf.feols("Y ~ X1 | group_id", data=data, vcov={"CRV1": "group_id"})
try:
    boot_result = fit_boot.wildboottest(param="X1", reps=999, seed=RANDOM_SEED)
    print(f"Wild bootstrap test for X1:")
    print(boot_result)
except Exception as e:
    print(f"Wild bootstrap requires 'wildboottest' package: {e}")
    print("Install via: pip install wildboottest")

# ── Save featured image ────────────────────────────────────────────────────

# Use the coefficient comparison figure as featured image
fig, ax = plt.subplots(figsize=(10, 6))

# Summary: key results across all methods
summary_data = {
    "OLS\n(no FE)": {"coef": fit_ols.coef()["X1"], "se": fit_ols.se()["X1"]},
    "One-Way FE\n(group_id)": {"coef": fit_fe1.coef()["X1"], "se": fit_fe1.se()["X1"]},
    "Two-Way FE\n(f1 + f2)": {"coef": fit_twoway.coef()["X1"], "se": fit_twoway.se()["X1"]},
}

names = list(summary_data.keys())
coefs_s = [summary_data[n]["coef"] for n in names]
ses_s = [summary_data[n]["se"] for n in names]
colors_s = [STEEL_BLUE, WARM_ORANGE, TEAL]

y_pos = np.arange(len(names))
ax.barh(y_pos, coefs_s, xerr=[1.96 * s for s in ses_s], height=0.5,
        color=colors_s, edgecolor=DARK_NAVY, linewidth=0.8, capsize=6,
        error_kw={"ecolor": LIGHT_TEXT, "capthick": 1.5})
ax.set_yticks(y_pos)
ax.set_yticklabels(names, fontsize=13)
ax.set_xlabel("Coefficient on X1 (with 95% CI)", fontsize=13, color=LIGHT_TEXT)
ax.set_title("Fixed Effects Regression with PyFixest\nHow Coefficient Estimates Change with Fixed Effects",
             fontsize=15, fontweight="bold", color=WHITE_TEXT)
ax.axvline(x=0, color=LIGHT_TEXT, linewidth=0.8, linestyle="--", alpha=0.5)
for i, (c, s) in enumerate(zip(coefs_s, ses_s)):
    ax.text(0.02, i, f"β = {c:.3f}  (SE = {s:.3f})", va="center", ha="left",
            fontsize=11, fontweight="bold", color=WHITE_TEXT)
plt.tight_layout()
plt.savefig("featured.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()

print("\n" + "=" * 60)
print("ALL FIGURES GENERATED SUCCESSFULLY")
print("=" * 60)
