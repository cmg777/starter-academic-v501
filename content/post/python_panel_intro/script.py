"""
Introduction to Panel Data Methods: A Python Tutorial

This script demonstrates how to estimate panel data models using the pyfixest
and linearmodels packages. We progressively work through Pooled OLS, first-
differencing, fixed effects (within estimator, reghdfe-style, dummy variable),
random effects, correlated random effects (Mundlak), and extended models with
controls. The tutorial translates a classic Stata panel data workflow into Python.

Dataset: wage_panel_bob4.dta — a panel of workers observed in 2010 and 2012,
with variables for log wages, union membership, age, schooling, and gender.

Usage:
    python script.py

Output:
    - panel_intro_*.png figures saved to current directory
    - *.csv data and results tables
    - Console output with summary statistics and regression results

References:
    - https://pyfixest.org/pyfixest.html
    - https://github.com/py-econometrics/pyfixest
    - https://bashtage.github.io/linearmodels/panel/introduction.html
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import pyfixest as pf
from linearmodels.panel import RandomEffects
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

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

# Method color family
METHOD_COLORS = {
    "POLS": "#999999",
    "FDFE": STEEL_BLUE,
    "TDFE": WARM_ORANGE,
    "DVFE": "#e8956a",
    "RE": TEAL,
    "CRE": "#c4623d",
    "TWFE": WARM_ORANGE,
}

# Data config
DATA_URL = "https://github.com/quarcs-lab/data-open/raw/master/isds/wage_panel_bob4.dta"

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


# ── Section 1: Data Loading ──────────────────────────────────────────────────

print("=" * 60)
print("SECTION 1: Data Loading")
print("=" * 60)

# Load Stata .dta file directly from URL
df_full = pd.read_stata(DATA_URL)
print(f"\nFull dataset shape: {df_full.shape}")
print(f"Columns: {list(df_full.columns)}")
print(f"\nYears available: {sorted(df_full['year'].unique())}")
print(f"\nFirst 5 rows:")
print(df_full.head())

# Convert categoricals in full dataset for clean CSV export
if df_full["union"].dtype.name == "category" or df_full["union"].dtype == object:
    union_map_full = {"Yes": 1, "No": 0, "yes": 1, "no": 0, 1: 1, 0: 0}
    df_full["union"] = df_full["union"].map(union_map_full)
if "region" in df_full.columns and df_full["region"].dtype.name == "category":
    df_full["region"] = df_full["region"].astype(str)
if "gender" in df_full.columns and df_full["gender"].dtype.name == "category":
    df_full["gender"] = df_full["gender"].astype(str)

# Export raw data
df_full.to_csv("raw_data.csv", index=False)
print(f"Exported raw_data.csv ({df_full.shape[0]} rows, {df_full.shape[1]} cols)")

# Filter to 2010 and 2012 (two-period panel)
df = df_full[df_full["year"].isin([2010, 2012])].copy()
df = df.sort_values(["ID", "year"]).reset_index(drop=True)
print(f"\nFiltered panel shape: {df.shape}")
print(f"Individuals (N): {df['ID'].nunique()}")
print(f"Time periods (T): {df['year'].nunique()}")
print(f"Total observations (N*T): {len(df)}")

# Convert categorical variables to numeric
# union: "Yes"/"No" -> 1/0 (or similar)
if df["union"].dtype.name == "category" or df["union"].dtype == object:
    union_map = {"Yes": 1, "No": 0, "yes": 1, "no": 0, 1: 1, 0: 0}
    df["union"] = df["union"].map(union_map).astype(float)
    print(f"\nConverted union to numeric: {df['union'].value_counts().to_dict()}")

# gender: "Female"/"Male" -> 1/0
gender_var = None
for candidate in ["gender", "female", "sex", "male"]:
    if candidate in df.columns:
        gender_var = candidate
        break

if gender_var:
    # Convert categorical/string gender to numeric female dummy
    raw_vals = df[gender_var].astype(str).str.strip()
    female_map = {"Female": 1, "Male": 0, "female": 1, "male": 0, "1": 1, "0": 0,
                  "1.0": 1, "0.0": 0}
    df["female"] = raw_vals.map(female_map).astype(float)
    print(f"Converted {gender_var} to female dummy: {df['female'].value_counts().to_dict()}")
else:
    df["female"] = 0.0

# region: convert if categorical
if "region" in df.columns and df["region"].dtype.name == "category":
    df["region"] = df["region"].astype(str)

# Ensure numeric types for key variables
for col in ["lwage", "age", "schooling", "ID", "year"]:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

# Drop rows with missing values in key variables
key_vars_clean = ["lwage", "union", "age", "schooling"]
n_before = len(df)
df = df.dropna(subset=key_vars_clean).reset_index(drop=True)
print(f"Dropped {n_before - len(df)} rows with missing values")

# Export filtered panel
df.to_csv("data_panel.csv", index=False)
print(f"Exported data_panel.csv ({df.shape[0]} rows, {df.shape[1]} cols)")

# Check key variables
key_vars = ["lwage", "union", "age", "schooling"]
print(f"\nKey variables check:")
for var in key_vars:
    if var in df.columns:
        print(f"  {var}: {df[var].dtype}, range [{df[var].min():.2f}, {df[var].max():.2f}]")
print(f"Gender variable: female (from '{gender_var}')")


# ── Section 2: Descriptive Statistics ──────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 2: Descriptive Statistics")
print("=" * 60)

# Panel structure summary
print(f"\nPanel structure:")
print(f"  Individuals (N): {df['ID'].nunique()}")
print(f"  Periods (T): {df['year'].nunique()}")
print(f"  Observations (N*T): {len(df)}")

# Check panel balance
obs_per_id = df.groupby("ID")["year"].count()
print(f"  Balanced: {(obs_per_id == df['year'].nunique()).all()}")
print(f"  Min obs per individual: {obs_per_id.min()}")
print(f"  Max obs per individual: {obs_per_id.max()}")

# Descriptive statistics by year
desc_vars = ["lwage", "union", "age", "schooling"]
available_desc_vars = [v for v in desc_vars if v in df.columns]

print(f"\nDescriptive statistics by year:")
desc_by_year = df.groupby("year")[available_desc_vars].describe().round(4)
print(desc_by_year)

# Overall descriptive statistics
print(f"\nOverall descriptive statistics:")
desc_overall = df[available_desc_vars].describe().round(4)
print(desc_overall)
desc_overall.to_csv("descriptive_stats.csv")
print("Exported descriptive_stats.csv")

# Between vs Within variation decomposition (Stata's xtsum equivalent)
print(f"\nBetween vs Within variation decomposition:")
print(f"{'Variable':<12} {'Overall SD':>12} {'Between SD':>12} {'Within SD':>12} {'Between %':>12}")
print("-" * 62)

variation_data = []
for var in available_desc_vars:
    overall_sd = df[var].std()
    group_means = df.groupby("ID")[var].mean()
    between_sd = group_means.std()
    within_vals = df[var] - df.groupby("ID")[var].transform("mean")
    within_sd = within_vals.std()
    between_pct = (between_sd**2 / (between_sd**2 + within_sd**2)) * 100

    print(f"{var:<12} {overall_sd:>12.4f} {between_sd:>12.4f} {within_sd:>12.4f} {between_pct:>11.1f}%")
    variation_data.append({
        "variable": var,
        "overall_sd": round(overall_sd, 4),
        "between_sd": round(between_sd, 4),
        "within_sd": round(within_sd, 4),
        "between_pct": round(between_pct, 1),
        "within_pct": round(100 - between_pct, 1),
    })

variation_df = pd.DataFrame(variation_data)
variation_df.to_csv("variation_decomposition.csv", index=False)
print("\nExported variation_decomposition.csv")

# Figure 1: Between vs Within variation
fig, ax = plt.subplots(figsize=(10, 5))
fig.patch.set_linewidth(0)

y_pos = np.arange(len(variation_df))
bar_height = 0.5

between_vals = variation_df["between_pct"].values
within_vals_pct = variation_df["within_pct"].values
var_labels = variation_df["variable"].values

ax.barh(y_pos, between_vals, bar_height, label="Between (cross-individual)",
        color=STEEL_BLUE, edgecolor=DARK_NAVY, linewidth=0.5)
ax.barh(y_pos, within_vals_pct, bar_height, left=between_vals,
        label="Within (over time)", color=WARM_ORANGE, edgecolor=DARK_NAVY, linewidth=0.5)

for i, (b, w) in enumerate(zip(between_vals, within_vals_pct)):
    if b > 8:
        ax.text(b / 2, i, f"{b:.0f}%", ha="center", va="center", fontsize=11,
                fontweight="bold", color=WHITE_TEXT)
    if w > 8:
        ax.text(b + w / 2, i, f"{w:.0f}%", ha="center", va="center", fontsize=11,
                fontweight="bold", color=WHITE_TEXT)

ax.set_yticks(y_pos)
ax.set_yticklabels([v.replace("_", " ").title() for v in var_labels],
                   fontsize=12, color=LIGHT_TEXT)
ax.set_xlabel("Share of Total Variance (%)", fontsize=13, color=LIGHT_TEXT)
ax.set_title("Between vs Within Variation in Panel Data",
             fontsize=15, fontweight="bold", color=WHITE_TEXT)
ax.legend(loc="lower right", fontsize=11)
ax.set_xlim(0, 105)

plt.tight_layout()
plt.savefig("panel_intro_variation.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()
print("Saved panel_intro_variation.png")


# ── Section 3: Pooled OLS (POLS) ─────────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 3: Pooled OLS (POLS)")
print("=" * 60)

# Stata: reg lwage union, robust
fit_pols = pf.feols("lwage ~ union", data=df, vcov="HC1")
print("\nPooled OLS: lwage ~ union (robust SE)")
print(fit_pols.summary())

pols_coef = fit_pols.coef()["union"]
pols_se = fit_pols.se()["union"]
print(f"\nUnion coefficient: {pols_coef:.4f} (SE: {pols_se:.4f})")
print("Note: POLS ignores the panel structure entirely.")


# ── Section 4: First-Differencing Fixed Effects (FDFE) ────────────────────────

print("\n" + "=" * 60)
print("SECTION 4: First-Differencing Fixed Effects (FDFE)")
print("=" * 60)

# Stata: bysort ID: gen d_lwage = lwage[_n] - lwage[_n-1]
#         bysort ID: gen d_union = union[_n] - union[_n-1]
#         reg d_lwage d_union, robust

df_sorted = df.sort_values(["ID", "year"])
df_diff = df_sorted.groupby("ID")[["lwage", "union"]].diff()
df_diff = df_diff.dropna().reset_index(drop=True)
df_diff.columns = ["d_lwage", "d_union"]

print(f"\nFirst-differenced data shape: {df_diff.shape}")
print(f"First 5 rows of differenced data:")
print(df_diff.head())

fit_fdfe = pf.feols("d_lwage ~ d_union", data=df_diff, vcov="HC1")
print("\nFirst-Differencing FE: d_lwage ~ d_union (robust SE)")
print(fit_fdfe.summary())

fdfe_coef = fit_fdfe.coef()["d_union"]
fdfe_se = fit_fdfe.se()["d_union"]
print(f"\nUnion coefficient (FD): {fdfe_coef:.4f} (SE: {fdfe_se:.4f})")
print("Note: With T=2, first-differencing is numerically equivalent to the within estimator.")


# ── Section 5: Time-Demeaning Fixed Effects (TDFE) ────────────────────────────

print("\n" + "=" * 60)
print("SECTION 5: Time-Demeaning Fixed Effects (TDFE — Within Estimator)")
print("=" * 60)

# Manual demeaning (pedagogical)
print("\n--- Manual demeaning (pedagogical) ---")
df["lwage_mean"] = df.groupby("ID")["lwage"].transform("mean")
df["union_mean_demean"] = df.groupby("ID")["union"].transform("mean")
df["lwage_demeaned"] = df["lwage"] - df["lwage_mean"]
df["union_demeaned"] = df["union"] - df["union_mean_demean"]

fit_manual_demean = pf.feols("lwage_demeaned ~ union_demeaned", data=df, vcov="HC1")
print("Manual demeaning: lwage_demeaned ~ union_demeaned")
manual_coef = fit_manual_demean.coef()["union_demeaned"]
manual_se = fit_manual_demean.se()["union_demeaned"]
print(f"Union coefficient (manual): {manual_coef:.4f} (SE: {manual_se:.4f})")

# Stata: xtreg lwage union, fe robust
print("\n--- pyfixest with absorbed FE ---")
fit_tdfe = pf.feols("lwage ~ union | ID", data=df, vcov="HC1")
print("TDFE: lwage ~ union | ID (robust SE)")
print(fit_tdfe.summary())

tdfe_coef = fit_tdfe.coef()["union"]
tdfe_se = fit_tdfe.se()["union"]
print(f"\nUnion coefficient (TDFE): {tdfe_coef:.4f} (SE: {tdfe_se:.4f})")

# Verify FD == TDFE with T=2
print(f"\n--- Verification: FD == TDFE with T=2 ---")
print(f"FD coefficient:   {fdfe_coef:.6f}")
print(f"TDFE coefficient: {tdfe_coef:.6f}")
print(f"Difference:       {abs(fdfe_coef - tdfe_coef):.10f}")
print(f"Match: {np.isclose(fdfe_coef, tdfe_coef, atol=1e-6)}")


# ── Section 6: TDFE v2 (reghdfe-style with clustered SE) ─────────────────────

print("\n" + "=" * 60)
print("SECTION 6: TDFE v2 (reghdfe-style — Clustered SE)")
print("=" * 60)

# Stata: reghdfe lwage union, absorb(ID) vce(robust)
# With clustered SE at the individual level
fit_tdfe_cluster = pf.feols("lwage ~ union | ID", data=df, vcov={"CRV1": "ID"})
print("TDFE v2: lwage ~ union | ID (clustered SE at ID)")
print(fit_tdfe_cluster.summary())

tdfe_cluster_coef = fit_tdfe_cluster.coef()["union"]
tdfe_cluster_se = fit_tdfe_cluster.se()["union"]
print(f"\nUnion coefficient: {tdfe_cluster_coef:.4f}")
print(f"Robust SE:    {tdfe_se:.4f}")
print(f"Clustered SE: {tdfe_cluster_se:.4f}")
print("Note: Coefficients are identical; only standard errors differ.")


# ── Section 7: Dummy Variable Fixed Effects (DVFE) ───────────────────────────

print("\n" + "=" * 60)
print("SECTION 7: Dummy Variable Fixed Effects (DVFE)")
print("=" * 60)

# Stata: reg lwage union i.ID
# Convert ID to string for C() notation
df["ID_str"] = df["ID"].astype(str)

print("Estimating DVFE (may take a moment with many dummies)...")
fit_dvfe = pf.feols("lwage ~ union + C(ID_str)", data=df, vcov="HC1")

# Extract only the union coefficient (not the N-1 dummy coefficients)
dvfe_coef = fit_dvfe.coef()["union"]
dvfe_se = fit_dvfe.se()["union"]
print(f"\nUnion coefficient (DVFE): {dvfe_coef:.4f} (SE: {dvfe_se:.4f})")
print(f"Number of individual dummies estimated: {sum(1 for k in fit_dvfe.coef().index if 'C(ID_str)' in k)}")

# Verify DVFE == TDFE
print(f"\n--- Verification: DVFE == TDFE ---")
print(f"TDFE coefficient: {tdfe_coef:.6f}")
print(f"DVFE coefficient: {dvfe_coef:.6f}")
print(f"Difference:       {abs(dvfe_coef - tdfe_coef):.10f}")
print(f"Match: {np.isclose(dvfe_coef, tdfe_coef, atol=1e-6)}")
print("Note: DVFE and within estimator produce identical slope coefficients.")
print("DVFE is impractical for large N (estimates N-1 individual intercepts).")


# ── Section 8: Random Effects (RE) ───────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 8: Random Effects (RE)")
print("=" * 60)

# Stata: xtreg lwage union, re robust
# pyfixest does not support RE natively, so we use linearmodels
df_re = df.set_index(["ID", "year"])

# Add constant for linearmodels
from linearmodels.panel import RandomEffects
import statsmodels.api as sm

exog = sm.add_constant(df_re[["union"]])
re_model = RandomEffects(df_re["lwage"], exog)
fit_re = re_model.fit(cov_type="robust")
print("Random Effects: lwage ~ union (robust SE)")
print(fit_re.summary)

re_coef = fit_re.params["union"]
re_se = fit_re.std_errors["union"]
print(f"\nUnion coefficient (RE): {re_coef:.4f} (SE: {re_se:.4f})")
print("Note: RE assumes individual effects are uncorrelated with regressors.")
print("If this assumption fails, RE estimates are inconsistent (use FE instead).")


# ── Section 9: Correlated Random Effects (CRE / Mundlak) ─────────────────────

print("\n" + "=" * 60)
print("SECTION 9: Correlated Random Effects (CRE / Mundlak)")
print("=" * 60)

# Stata: bysort ID: egen a_union = mean(union)
#         xtreg lwage union a_union, re robust

# Compute individual means of time-varying regressors
df["union_bar"] = df.groupby("ID")["union"].transform("mean")

# CRE via linearmodels RE (Mundlak approach)
df_cre = df.set_index(["ID", "year"])
exog_cre = sm.add_constant(df_cre[["union", "union_bar"]])
cre_model = RandomEffects(df_cre["lwage"], exog_cre)
fit_cre = cre_model.fit(cov_type="robust")
print("CRE (Mundlak): lwage ~ union + union_bar (RE, robust SE)")
print(fit_cre.summary)

cre_coef = fit_cre.params["union"]
cre_se = fit_cre.std_errors["union"]
cre_bar_coef = fit_cre.params["union_bar"]
cre_bar_se = fit_cre.std_errors["union_bar"]
print(f"\nUnion coefficient (CRE):       {cre_coef:.4f} (SE: {cre_se:.4f})")
print(f"Union_bar (Mundlak term):      {cre_bar_coef:.4f} (SE: {cre_bar_se:.4f})")

# Key insight: CRE union coefficient should approximate FE
print(f"\n--- CRE vs FE comparison ---")
print(f"FE (within) coefficient:  {tdfe_coef:.6f}")
print(f"CRE union coefficient:    {cre_coef:.6f}")
print(f"Difference:               {abs(cre_coef - tdfe_coef):.6f}")
print("Insight: The CRE union coefficient approximates the FE estimate.")
print("The Mundlak term (union_bar) captures between-individual correlation.")
print("If union_bar is significant, individual effects are correlated with union")
print("=> RE is inconsistent, and FE should be preferred.")


# ── Figure 2: Coefficient comparison across basic methods ─────────────────────

print("\n" + "=" * 60)
print("FIGURE 2: Basic Methods — Union Coefficient Comparison")
print("=" * 60)

methods = ["POLS", "FDFE", "TDFE", "DVFE", "RE", "CRE"]
coefs = [pols_coef, fdfe_coef, tdfe_coef, dvfe_coef, re_coef, cre_coef]
ses = [pols_se, fdfe_se, tdfe_se, dvfe_se, re_se, cre_se]
colors = [METHOD_COLORS[m] for m in methods]

fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

y_pos = np.arange(len(methods))
ci_95 = [1.96 * s for s in ses]

ax.barh(y_pos, coefs, 0.6, xerr=ci_95, color=colors,
        edgecolor=DARK_NAVY, linewidth=0.5, capsize=4,
        error_kw={"ecolor": WHITE_TEXT, "capthick": 1.2})

# Add coefficient labels
for i, (c, s) in enumerate(zip(coefs, ses)):
    ax.text(c + 1.96 * s + 0.005, i, f"{c:.4f}", va="center",
            fontsize=10, color=LIGHT_TEXT)

ax.set_yticks(y_pos)
ax.set_yticklabels(methods, fontsize=13, color=LIGHT_TEXT)
ax.set_xlabel("Coefficient on Union", fontsize=13, color=LIGHT_TEXT)
ax.axvline(x=0, color=LIGHT_TEXT, linewidth=0.5, linestyle="--", alpha=0.5)
ax.set_title("Effect of Union on Log Wages: Six Panel Estimators",
             fontsize=15, fontweight="bold", color=WHITE_TEXT)

# Add annotation grouping FE methods
ax.axhline(y=3.5, color=LIGHT_TEXT, linewidth=0.6, linestyle=":", alpha=0.5)
ax.text(ax.get_xlim()[1] * 0.85, 1.5, "FE family", fontsize=9, color=LIGHT_TEXT,
        ha="center", style="italic")
ax.text(ax.get_xlim()[1] * 0.85, 4.5, "RE family", fontsize=9, color=LIGHT_TEXT,
        ha="center", style="italic")

plt.tight_layout()
plt.savefig("panel_intro_coef_comparison.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()
print("Saved panel_intro_coef_comparison.png")

# Export basic models comparison
basic_comparison = pd.DataFrame({
    "method": methods,
    "coefficient": [round(c, 6) for c in coefs],
    "std_error": [round(s, 6) for s in ses],
    "ci_lower": [round(c - 1.96 * s, 6) for c, s in zip(coefs, ses)],
    "ci_upper": [round(c + 1.96 * s, 6) for c, s in zip(coefs, ses)],
})
basic_comparison.to_csv("basic_models_comparison.csv", index=False)
print("Exported basic_models_comparison.csv")


# ── Section 10: Extended Models with Controls ─────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 10: Extended Models with Controls")
print("=" * 60)

# Identify available control variables
print("\nAvailable columns for controls:")
print(list(df.columns))

# Year as factor for POLS specification
df["year_factor"] = df["year"].astype(int).astype(str)

# ---- POLS with controls ----
print("\n--- POLS with controls ---")
# Stata: reg lwage union age schooling i.gender i.year, robust
pols_formula = "lwage ~ union + age + schooling + female + C(year_factor)"
fit_pols_ctrl = pf.feols(pols_formula, data=df, vcov="HC1")
print(f"POLS: {pols_formula}")
print(fit_pols_ctrl.summary())

# ---- TWFE (Two-Way Fixed Effects) with controls ----
print("\n--- TWFE with controls ---")
# Stata: reghdfe lwage union age schooling i.gender, absorb(ID year) vce(robust)
# Note: gender and schooling are time-invariant and will be absorbed by ID FE
twfe_formula = "lwage ~ union + age | ID + year"
fit_twfe_ctrl = pf.feols(twfe_formula, data=df, vcov={"CRV1": "ID"})
print(f"TWFE: {twfe_formula}")
print(fit_twfe_ctrl.summary())
print("Note: schooling and gender are absorbed by individual FE (time-invariant).")

# ---- RE with controls ----
print("\n--- RE with controls ---")
# Stata: xtreg lwage union age schooling i.gender i.year, re robust
df_re_ctrl = df.set_index(["ID", "year"])
re_ctrl_vars = ["union", "age", "schooling", "female"]
exog_re_ctrl = sm.add_constant(df_re_ctrl[re_ctrl_vars])
re_ctrl_model = RandomEffects(df_re_ctrl["lwage"], exog_re_ctrl)
fit_re_ctrl = re_ctrl_model.fit(cov_type="robust")
print("RE with controls:")
print(fit_re_ctrl.summary)

# ---- CRE with controls ----
print("\n--- CRE with controls ---")
# Stata: bysort ID: egen a_age=mean(age)
#         xtreg lwage union a_union age a_age schooling i.gender i.year, re robust
df["age_bar"] = df.groupby("ID")["age"].transform("mean")

df_cre_ctrl = df.set_index(["ID", "year"])
cre_ctrl_vars = ["union", "union_bar", "age", "age_bar", "schooling", "female"]
exog_cre_ctrl = sm.add_constant(df_cre_ctrl[cre_ctrl_vars])
cre_ctrl_model = RandomEffects(df_cre_ctrl["lwage"], exog_cre_ctrl)
fit_cre_ctrl = cre_ctrl_model.fit(cov_type="robust")
print("CRE with controls:")
print(fit_cre_ctrl.summary)

# ---- Comparison table (esttab equivalent) ----
print("\n" + "-" * 80)
print("COMPARISON TABLE: Extended Models")
print("-" * 80)

display_vars = ["union", "age", "schooling", "female"]
var_labels_map = {
    "union": "Union",
    "age": "Age",
    "schooling": "Schooling",
    "female": "Female",
}

print(f"{'Variable':<14} {'POLS':>14} {'TWFE':>14} {'RE':>14} {'CRE':>14}")
print("=" * 72)

extended_results = []
for var in display_vars:
    row = {"variable": var_labels_map.get(var, var)}

    # POLS
    if var in fit_pols_ctrl.coef().index:
        c, s = fit_pols_ctrl.coef()[var], fit_pols_ctrl.se()[var]
        row["POLS_coef"] = round(c, 4)
        row["POLS_se"] = round(s, 4)
        pols_str = f"{c:>7.4f} ({s:.4f})"
    else:
        row["POLS_coef"], row["POLS_se"] = None, None
        pols_str = f"{'—':>14}"

    # TWFE (time-invariant vars are absorbed)
    if var in fit_twfe_ctrl.coef().index:
        c, s = fit_twfe_ctrl.coef()[var], fit_twfe_ctrl.se()[var]
        row["TWFE_coef"] = round(c, 4)
        row["TWFE_se"] = round(s, 4)
        twfe_str = f"{c:>7.4f} ({s:.4f})"
    else:
        row["TWFE_coef"], row["TWFE_se"] = None, None
        twfe_str = f"{'absorbed':>14}"

    # RE
    if var in fit_re_ctrl.params.index:
        c, s = fit_re_ctrl.params[var], fit_re_ctrl.std_errors[var]
        row["RE_coef"] = round(c, 4)
        row["RE_se"] = round(s, 4)
        re_str = f"{c:>7.4f} ({s:.4f})"
    else:
        row["RE_coef"], row["RE_se"] = None, None
        re_str = f"{'—':>14}"

    # CRE
    if var in fit_cre_ctrl.params.index:
        c, s = fit_cre_ctrl.params[var], fit_cre_ctrl.std_errors[var]
        row["CRE_coef"] = round(c, 4)
        row["CRE_se"] = round(s, 4)
        cre_str = f"{c:>7.4f} ({s:.4f})"
    else:
        row["CRE_coef"], row["CRE_se"] = None, None
        cre_str = f"{'—':>14}"

    print(f"{var_labels_map.get(var, var):<14} {pols_str} {twfe_str} {re_str} {cre_str}")
    extended_results.append(row)

print("=" * 72)
print(f"{'N':<14} {len(df):>14} {len(df):>14} {len(df):>14} {len(df):>14}")

# Export extended comparison
extended_df = pd.DataFrame(extended_results)
extended_df.to_csv("extended_models_comparison.csv", index=False)
print("\nExported extended_models_comparison.csv")


# ── Figure 3: Extended Model Comparison ───────────────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 3: Extended Models — Key Variable Coefficients")
print("=" * 60)

# Collect coefficients for plotting
ext_methods = ["POLS", "TWFE", "RE", "CRE"]
ext_colors = [METHOD_COLORS["POLS"], METHOD_COLORS["TWFE"], METHOD_COLORS["RE"],
              METHOD_COLORS["CRE"]]

# Variables to plot (union and age are the key time-varying ones)
plot_vars = []
for var in display_vars:
    has_data = False
    if var in fit_pols_ctrl.coef().index:
        has_data = True
    if var in fit_twfe_ctrl.coef().index:
        has_data = True
    if has_data:
        plot_vars.append(var)

n_vars = len(plot_vars)
fig, axes = plt.subplots(1, n_vars, figsize=(4 * n_vars, 6), sharey=True)
fig.patch.set_linewidth(0)
if n_vars == 1:
    axes = [axes]

for ax_idx, var in enumerate(plot_vars):
    ax = axes[ax_idx]
    vals = []
    errs = []

    # POLS
    if var in fit_pols_ctrl.coef().index:
        vals.append(fit_pols_ctrl.coef()[var])
        errs.append(1.96 * fit_pols_ctrl.se()[var])
    else:
        vals.append(np.nan)
        errs.append(0)

    # TWFE
    if var in fit_twfe_ctrl.coef().index:
        vals.append(fit_twfe_ctrl.coef()[var])
        errs.append(1.96 * fit_twfe_ctrl.se()[var])
    else:
        vals.append(np.nan)
        errs.append(0)

    # RE
    if var in fit_re_ctrl.params.index:
        vals.append(fit_re_ctrl.params[var])
        errs.append(1.96 * fit_re_ctrl.std_errors[var])
    else:
        vals.append(np.nan)
        errs.append(0)

    # CRE
    if var in fit_cre_ctrl.params.index:
        vals.append(fit_cre_ctrl.params[var])
        errs.append(1.96 * fit_cre_ctrl.std_errors[var])
    else:
        vals.append(np.nan)
        errs.append(0)

    y_pos = np.arange(len(ext_methods))
    for i, (v, e, c) in enumerate(zip(vals, errs, ext_colors)):
        if not np.isnan(v):
            ax.barh(i, v, 0.6, xerr=e, color=c, edgecolor=DARK_NAVY,
                    linewidth=0.5, capsize=3,
                    error_kw={"ecolor": WHITE_TEXT, "capthick": 1})
        else:
            ax.text(0, i, "absorbed", ha="center", va="center",
                    fontsize=9, color=LIGHT_TEXT, style="italic")

    ax.axvline(x=0, color=LIGHT_TEXT, linewidth=0.5, linestyle="--", alpha=0.5)
    ax.set_title(var_labels_map.get(var, var), fontsize=13, fontweight="bold",
                 color=WHITE_TEXT)
    if ax_idx == 0:
        ax.set_yticks(y_pos)
        ax.set_yticklabels(ext_methods, fontsize=12, color=LIGHT_TEXT)

fig.suptitle("Extended Models: Coefficient Comparison",
             fontsize=15, fontweight="bold", color=WHITE_TEXT, y=1.02)
plt.tight_layout()
plt.savefig("panel_intro_extended_models.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()
print("Saved panel_intro_extended_models.png")


# ── Figure 4: Individual Wage Trajectories ────────────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 4: Individual Wage Trajectories")
print("=" * 60)

fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

# Select a random subset of individuals for readability
rng = np.random.default_rng(RANDOM_SEED)
all_ids = df["ID"].unique()
sample_ids = rng.choice(all_ids, size=min(30, len(all_ids)), replace=False)

for pid in sample_ids:
    person = df[df["ID"] == pid].sort_values("year")
    is_union_changer = person["union"].nunique() > 1
    if is_union_changer:
        ax.plot(person["year"], person["lwage"], "o-", color=TEAL,
                alpha=0.7, linewidth=2, markersize=6, zorder=3)
    else:
        union_status = person["union"].iloc[0]
        color = WARM_ORANGE if union_status == 1 else STEEL_BLUE
        ax.plot(person["year"], person["lwage"], "o-", color=color,
                alpha=0.3, linewidth=1, markersize=4)

# Custom legend
from matplotlib.lines import Line2D
legend_elements = [
    Line2D([0], [0], color=STEEL_BLUE, alpha=0.5, lw=1.5, marker="o",
           markersize=5, label="Never union"),
    Line2D([0], [0], color=WARM_ORANGE, alpha=0.5, lw=1.5, marker="o",
           markersize=5, label="Always union"),
    Line2D([0], [0], color=TEAL, alpha=0.8, lw=2.5, marker="o",
           markersize=6, label="Union status changed"),
]
ax.legend(handles=legend_elements, loc="upper left", fontsize=11)

ax.set_xlabel("Year", fontsize=13, color=LIGHT_TEXT)
ax.set_ylabel("Log Wage", fontsize=13, color=LIGHT_TEXT)
ax.set_title("Individual Wage Trajectories (Sample of 30 Workers)",
             fontsize=15, fontweight="bold", color=WHITE_TEXT)
ax.set_xticks(df["year"].unique())

plt.tight_layout()
plt.savefig("panel_intro_wage_trajectories.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
plt.close()
print("Saved panel_intro_wage_trajectories.png")


# ── Section 11: Summary ──────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 11: Summary of All Methods")
print("=" * 60)

print(f"\n{'Method':<8} {'Coef':>10} {'SE':>10} {'Description'}")
print("-" * 70)
summary_rows = [
    ("POLS",  pols_coef,  pols_se,  "Pooled OLS — ignores panel structure"),
    ("FDFE",  fdfe_coef,  fdfe_se,  "First-differencing — eliminates individual FE"),
    ("TDFE",  tdfe_coef,  tdfe_se,  "Within estimator — time-demeaned FE"),
    ("DVFE",  dvfe_coef,  dvfe_se,  "Dummy variable — explicit individual dummies"),
    ("RE",    re_coef,    re_se,    "Random effects — GLS (assumes no correlation)"),
    ("CRE",   cre_coef,   cre_se,   "Correlated RE — Mundlak approach"),
]
for method, coef, se, desc in summary_rows:
    print(f"{method:<8} {coef:>10.4f} {se:>10.4f}  {desc}")

print(f"\nKey takeaways:")
print(f"  1. FD, TDFE, and DVFE produce identical coefficients ({tdfe_coef:.4f}) — three")
print(f"     ways to implement the same within estimator.")
print(f"  2. POLS ({pols_coef:.4f}) ignores unobserved heterogeneity and is likely biased.")
print(f"  3. RE ({re_coef:.4f}) is a weighted average of between and within estimators.")
print(f"  4. CRE ({cre_coef:.4f}) bridges FE and RE — its within coefficient approximates FE.")

# List generated files
print("\n" + "=" * 60)
print("Generated PNG files:")
import glob
for f in sorted(glob.glob("panel_intro_*.png")):
    print(f"  {f}")
print("\nGenerated CSV files:")
for f in sorted(glob.glob("*.csv")):
    print(f"  {f}")

print("\n=== Script completed successfully ===")
