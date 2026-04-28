"""
Regional Inequality and the Kuznets Curve: Panel Fixed Effects in Python

This script studies the relationship between regional inequality (Gini) and
national development (GDP per capita) using panel data from 180 countries
(1992-2012). We replicate the key findings of Lessmann & Seidel (2017) using
pyfixest for fixed effects estimation and great_tables for publication-quality
regression tables.

The analysis tests whether the inequality-development relationship follows
an inverted-U (classic Kuznets hypothesis) or an N-shaped curve, and
investigates what determinants drive regional inequality.

Usage:
    python script.py

Outputs:
    - 8 PNG figures (dark theme, 300 DPI)
    - 2 Great Tables regression table PNGs
    - 11 CSV data exports
    - execution_log.txt (when run via tee)

References:
    - Lessmann, C., & Seidel, A. (2017). Regional inequality, convergence,
      and its determinants - A view from outer space. European Economic Review.
    - https://pyfixest.org/
    - https://posit-dev.github.io/great-tables/
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import pyfixest as pf
from great_tables import GT, md, style, loc

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

SAVE_KWARGS = dict(dpi=300, bbox_inches="tight", facecolor=DARK_NAVY,
                   edgecolor=DARK_NAVY, pad_inches=0)

# Data URLs
URL_TAB03 = "https://github.com/quarcs-lab/data-open/raw/master/pGDP/simpleTAB03.dta"
URL_TAB04 = "https://github.com/quarcs-lab/data-open/raw/master/pGDP/simpleTAB04.dta"


# ── Helper: significance stars ──────────────────────────────────────────────

def stars(pval):
    """Return significance stars for a p-value."""
    if pval < 0.01:
        return "***"
    elif pval < 0.05:
        return "**"
    elif pval < 0.10:
        return "*"
    return ""



# ── SECTION 1: Data Loading and Exploration ─────────────────────────────────

print("=" * 60)
print("SECTION 1: Data Loading and Exploration")
print("=" * 60)

# Load Table 3 dataset (Kuznets curve)
print("\n--- Loading Table 3 dataset (Kuznets curve) ---")
df3 = pd.read_stata(URL_TAB03)
print(f"Shape: {df3.shape}")
print(f"Columns: {list(df3.columns)}")
print(f"\nFirst 5 rows:")
print(df3.head())
print(f"\nDescriptive statistics:")
print(df3.describe().round(4))
print(f"\nMissing values:\n{df3.isnull().sum()}")

# Panel structure
print(f"\nPanel structure:")
print(f"  Countries: {df3['id'].nunique()}")
print(f"  Time periods: {sorted(df3['year'].unique())}")
print(f"\nObservations per period:")
print(df3.groupby("year")["id"].count())

# Load Table 4 dataset (Determinants)
print("\n--- Loading Table 4 dataset (Determinants) ---")
df4 = pd.read_stata(URL_TAB04)
print(f"Shape: {df4.shape}")
print(f"Columns: {list(df4.columns)}")
print(f"\nDescriptive statistics:")
print(df4.describe().round(4))

# CSV export
df3.describe().round(4).to_csv("kuznets_summary_stats.csv")
print("\nSaved: kuznets_summary_stats.csv")


# ── SECTION 2: Visual Exploration ───────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 2: Visual Exploration — Inequality and Development")
print("=" * 60)

# Figure 1: Scatter with polynomial fit lines
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

x = df3["log_GDPpc"].dropna().values
y = df3.loc[df3["log_GDPpc"].notna(), "gini"].values
mask = np.isfinite(x) & np.isfinite(y)
x, y = x[mask], y[mask]

ax.scatter(x, y, alpha=0.35, s=18, color=STEEL_BLUE, edgecolors=DARK_NAVY,
           linewidth=0.3, zorder=2)

# Fit lines
x_grid = np.linspace(x.min(), x.max(), 200)

# Linear fit
c1 = np.polyfit(x, y, 1)
ax.plot(x_grid, np.polyval(c1, x_grid), color=LIGHT_TEXT, ls="--", lw=1.5,
        alpha=0.7, label="Linear", zorder=3)

# Quadratic fit
c2 = np.polyfit(x, y, 2)
ax.plot(x_grid, np.polyval(c2, x_grid), color=TEAL, ls="--", lw=1.8,
        alpha=0.8, label="Quadratic (inverted-U)", zorder=3)

# Cubic fit
c3 = np.polyfit(x, y, 3)
ax.plot(x_grid, np.polyval(c3, x_grid), color=WARM_ORANGE, ls="-", lw=2.5,
        label="Cubic (N-shape)", zorder=4)

ax.set_xlabel("Log GDP per capita (PPP, constant US$)", fontsize=13)
ax.set_ylabel("Regional Inequality (Population-weighted Gini)", fontsize=13)
ax.set_title("Regional Inequality vs National Development\n"
             "180 Countries, 1992-2012 (pooled)", fontsize=14, fontweight="bold")
ax.legend(fontsize=10, loc="upper right")
plt.tight_layout()
plt.savefig("kuznets_scatter_pooled.png", **SAVE_KWARGS)
plt.show()
plt.close()
print("Saved: kuznets_scatter_pooled.png")

# Figure 2: Scatter by period
periods = sorted(df3["year"].unique())
n_periods = len(periods)
# Map numeric periods to actual year ranges (Lessmann & Seidel 2017, footnote 14)
period_labels = {1: "1990--1994", 2: "1995--1999", 3: "2000--2004",
                 4: "2005--2009", 5: "2010--2013"}
fig, axes = plt.subplots(1, n_periods, figsize=(4 * n_periods, 5), sharey=True)
fig.patch.set_linewidth(0)

if n_periods == 1:
    axes = [axes]

for ax, period in zip(axes, periods):
    sub = df3[df3["year"] == period].dropna(subset=["log_GDPpc", "gini"])
    ax.scatter(sub["log_GDPpc"], sub["gini"], alpha=0.4, s=20,
               color=STEEL_BLUE, edgecolors=DARK_NAVY, linewidth=0.3)
    # Cubic fit for this period
    if len(sub) > 10:
        xp = sub["log_GDPpc"].values
        yp = sub["gini"].values
        cp = np.polyfit(xp, yp, 3)
        xg = np.linspace(xp.min(), xp.max(), 100)
        ax.plot(xg, np.polyval(cp, xg), color=WARM_ORANGE, lw=2)
    label = period_labels.get(int(period), f"Period {int(period)}")
    ax.set_title(label, fontsize=12, fontweight="bold")
    ax.set_xlabel("Log GDP pc", fontsize=11)

axes[0].set_ylabel("Regional Gini", fontsize=12)
fig.suptitle("Inequality-Development Relationship by Period",
             fontsize=14, fontweight="bold", y=1.02, color=WHITE_TEXT)
plt.tight_layout()
plt.savefig("kuznets_scatter_by_period.png", **SAVE_KWARGS)
plt.show()
plt.close()
print("Saved: kuznets_scatter_by_period.png")

# CSV export
period_means = df3.groupby("year")[["gini", "log_GDPpc"]].mean().round(4)
period_means.to_csv("kuznets_period_means.csv")
print("Saved: kuznets_period_means.csv")


# ── SECTION 3: Pooled OLS — Linear, Quadratic, Cubic ───────────────────────

print("\n" + "=" * 60)
print("SECTION 3: Pooled OLS — Linear, Quadratic, Cubic")
print("=" * 60)

print("\n--- Model 1: Pooled OLS — Linear ---")
print("  gini = b0 + b1 * ln(GDPpc) + error")
print("  This assumes inequality changes at a constant rate with development.\n")
ols_linear = pf.feols("gini ~ log_GDPpc", data=df3, vcov={"CRV1": "id"})
print(ols_linear.summary())

print("\n--- Model 2: Pooled OLS — Quadratic ---")
print("  gini = b0 + b1 * ln(GDPpc) + b2 * ln(GDPpc)^2 + error")
print("  This allows the relationship to bend once (inverted-U).\n")
ols_quad = pf.feols("gini ~ log_GDPpc + log_GDPpc2", data=df3,
                     vcov={"CRV1": "id"})
print(ols_quad.summary())

print("\n--- Model 3: Pooled OLS — Cubic ---")
print("  gini = b0 + b1 * ln(GDPpc) + b2 * ln(GDPpc)^2 + b3 * ln(GDPpc)^3 + error")
print("  This allows the relationship to bend twice (N-shape).\n")
ols_cubic = pf.feols("gini ~ log_GDPpc + log_GDPpc2 + log_GDPpc3", data=df3,
                      vcov={"CRV1": "id"})
print(ols_cubic.summary())

# Comparison
print("\n--- Pooled OLS Coefficient Comparison ---")
print(f"{'Variable':<14} {'Linear':>10} {'Quadratic':>12} {'Cubic':>10}")
print("-" * 48)
for var in ["log_GDPpc", "log_GDPpc2", "log_GDPpc3"]:
    vals = []
    for m in [ols_linear, ols_quad, ols_cubic]:
        if var in m.coef().index:
            vals.append(f"{m.coef()[var]:.4f}")
        else:
            vals.append("---")
    print(f"{var:<14} {vals[0]:>10} {vals[1]:>12} {vals[2]:>10}")

# CSV export
pooled_rows = []
for name, m in [("Linear", ols_linear), ("Quadratic", ols_quad), ("Cubic", ols_cubic)]:
    row = {"Model": name, "N": m._N}
    tidy = m.tidy()
    for var in ["log_GDPpc", "log_GDPpc2", "log_GDPpc3"]:
        if var in tidy.index:
            row[f"{var}_coef"] = tidy.loc[var, "Estimate"]
            row[f"{var}_se"] = tidy.loc[var, "Std. Error"]
            row[f"{var}_pval"] = tidy.loc[var, "Pr(>|t|)"]
    pooled_rows.append(row)
pd.DataFrame(pooled_rows).to_csv("kuznets_pooled_ols.csv", index=False)
print("\nSaved: kuznets_pooled_ols.csv")


# ── SECTION 4: Why Fixed Effects? — Omitted Variable Bias ──────────────────

print("\n" + "=" * 60)
print("SECTION 4: Why Fixed Effects? — Country Heterogeneity")
print("=" * 60)

print("""
Pooled OLS treats all country-year observations as independent draws.
But countries differ in geography, institutions, colonial history, and
culture — factors that affect BOTH inequality AND development.

If these unobserved factors are correlated with GDP per capita, pooled
OLS coefficients are biased. Fixed effects solve this by focusing on
WITHIN-country variation over time: how does inequality change when the
SAME country becomes richer or poorer?
""")

# Figure 3: Spaghetti plot — individual country trajectories
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

# Select countries with observations in multiple periods and spread of GDP levels
country_obs = df3.groupby("id").agg(
    n_periods=("year", "count"),
    mean_gdp=("log_GDPpc", "mean"),
    gdp_range=("log_GDPpc", lambda x: x.max() - x.min()),
    mean_gini=("gini", "mean")
).reset_index()

# Pick countries across the development spectrum with sufficient observations
country_obs = country_obs[country_obs["n_periods"] >= 3].sort_values("mean_gdp")
n_sel = min(20, len(country_obs))
# Sample evenly across the GDP distribution
idx = np.linspace(0, len(country_obs) - 1, n_sel, dtype=int)
selected_ids = country_obs.iloc[idx]["id"].values

# Plot all selected countries in light color
for cid in selected_ids:
    sub = df3[df3["id"] == cid].sort_values("log_GDPpc")
    ax.plot(sub["log_GDPpc"], sub["gini"], color=LIGHT_TEXT, alpha=0.25,
            lw=1.2, marker="o", ms=3, zorder=2)

# Highlight 6 diverse countries with distinct colors
highlight_colors = [WARM_ORANGE, TEAL, STEEL_BLUE, "#e8956a", "#8ec8e8", "#66e8df"]
highlight_ids = []
# Pick 6 spread across GDP quintiles
quintile_idx = np.linspace(0, len(country_obs) - 1, 6, dtype=int)
for qi in quintile_idx:
    highlight_ids.append(country_obs.iloc[qi]["id"])

for i, cid in enumerate(highlight_ids):
    sub = df3[df3["id"] == cid].sort_values("log_GDPpc")
    country_name = sub["country"].iloc[0]
    ax.plot(sub["log_GDPpc"], sub["gini"], color=highlight_colors[i],
            lw=2.5, marker="o", ms=5, zorder=5, label=country_name)

# Add the pooled cubic fit for reference
ax.plot(x_grid, np.polyval(c3, x_grid), color=WARM_ORANGE, ls="--", lw=2,
        alpha=0.5, label="Pooled cubic fit", zorder=3)

ax.set_xlabel("Log GDP per capita", fontsize=13)
ax.set_ylabel("Regional Gini", fontsize=13)
ax.set_title("Individual Country Trajectories vs Pooled Pattern\n"
             "Each line = one country over time", fontsize=14, fontweight="bold")
ax.legend(fontsize=9, loc="upper right", ncol=2)
plt.tight_layout()
plt.savefig("kuznets_spaghetti.png", **SAVE_KWARGS)
plt.show()
plt.close()
print("Saved: kuznets_spaghetti.png")

print("""
The spaghetti plot reveals the key insight: individual countries follow
their own trajectories that differ from the cross-sectional pattern.
A country at log GDP = 8 may have very different inequality than another
at the same GDP level — because of country-specific factors.

Fixed effects remove these country-specific levels and focus only on
how inequality changes WITHIN each country as it develops.
""")


# ── SECTION 5: Two-Way Fixed Effects — Table 3 Replication ─────────────────

print("\n" + "=" * 60)
print("SECTION 5: Two-Way Fixed Effects (Replicating Table 3)")
print("=" * 60)

print("\nCountry FE: absorbs all time-invariant country characteristics")
print("Year FE: absorbs common global shocks (e.g., financial crises)")
print("Clustered SEs: accounts for within-country serial correlation\n")

# Model 1: Linear TWFE
print("--- Model 1: Linear TWFE ---")
fe_linear = pf.feols("gini ~ log_GDPpc | id + year", data=df3,
                      vcov={"CRV1": "id"})
print(fe_linear.summary())

# Model 2: Quadratic TWFE
print("\n--- Model 2: Quadratic TWFE ---")
fe_quad = pf.feols("gini ~ log_GDPpc + log_GDPpc2 | id + year", data=df3,
                    vcov={"CRV1": "id"})
print(fe_quad.summary())

# Model 3: Cubic TWFE
print("\n--- Model 3: Cubic TWFE ---")
fe_cubic = pf.feols("gini ~ log_GDPpc + log_GDPpc2 + log_GDPpc3 | id + year",
                     data=df3, vcov={"CRV1": "id"})
print(fe_cubic.summary())

# Alternative: stepwise syntax in one line
print("\n--- Alternative: PyFixest stepwise specification ---")
print("  pf.feols('gini ~ log_GDPpc + csw0(log_GDPpc2, log_GDPpc3) | id + year')")
print("  This estimates all three models in a single call using csw0().")

# Comparison: Pooled OLS vs TWFE
print("\n--- Pooled OLS vs TWFE: Cubic Model Comparison ---")
print(f"{'Variable':<14} {'Pooled OLS':>12} {'TWFE':>12}")
print("-" * 40)
for var in ["log_GDPpc", "log_GDPpc2", "log_GDPpc3"]:
    ols_val = f"{ols_cubic.coef()[var]:.4f}" if var in ols_cubic.coef().index else "---"
    fe_val = f"{fe_cubic.coef()[var]:.4f}" if var in fe_cubic.coef().index else "---"
    print(f"{var:<14} {ols_val:>12} {fe_val:>12}")

# CSV export
twfe_rows = []
for name, m in [("Linear", fe_linear), ("Quadratic", fe_quad), ("Cubic", fe_cubic)]:
    row = {"Model": name, "N": m._N}
    tidy = m.tidy()
    for var in ["log_GDPpc", "log_GDPpc2", "log_GDPpc3"]:
        if var in tidy.index:
            row[f"{var}_coef"] = tidy.loc[var, "Estimate"]
            row[f"{var}_se"] = tidy.loc[var, "Std. Error"]
            row[f"{var}_pval"] = tidy.loc[var, "Pr(>|t|)"]
    twfe_rows.append(row)
pd.DataFrame(twfe_rows).to_csv("kuznets_twfe_results.csv", index=False)
print("\nSaved: kuznets_twfe_results.csv")


# ── SECTION 6: Publication Table 3 (Great Tables) ──────────────────────────

print("\n" + "=" * 60)
print("SECTION 6: Publication-Quality Table 3 (Great Tables)")
print("=" * 60)

# Build table DataFrame
fe_models = [fe_linear, fe_quad, fe_cubic]
fe_model_names = ["(1) Gini", "(2) Gini", "(3) Gini"]
fe_vars = ["log_GDPpc", "log_GDPpc2", "log_GDPpc3"]
fe_var_labels = {
    "log_GDPpc": "ln(GDP pc)",
    "log_GDPpc2": "ln(GDP pc)\u00b2",
    "log_GDPpc3": "ln(GDP pc)\u00b3",
}

# Manual table construction for full control
table3_rows = []
for var in fe_vars:
    row_coef = {"Variable": fe_var_labels[var]}
    row_se = {"Variable": ""}
    for i, model in enumerate(fe_models):
        col = fe_model_names[i]
        tidy = model.tidy()
        if var in tidy.index:
            c = tidy.loc[var, "Estimate"]
            se = tidy.loc[var, "Std. Error"]
            p = tidy.loc[var, "Pr(>|t|)"]
            row_coef[col] = f"{c:.3f}{stars(p)}"
            row_se[col] = f"({se:.3f})"
        else:
            row_coef[col] = ""
            row_se[col] = ""
    table3_rows.append(row_coef)
    table3_rows.append(row_se)

# Separator
table3_rows.append({k: "" for k in ["Variable"] + fe_model_names})

# Statistics
table3_rows.append({"Variable": "Observations",
                     "(1) Gini": str(fe_linear._N),
                     "(2) Gini": str(fe_quad._N),
                     "(3) Gini": str(fe_cubic._N)})
table3_rows.append({"Variable": "R-squared",
                     "(1) Gini": f"{fe_linear._r2:.3f}" if fe_linear._r2 else "",
                     "(2) Gini": f"{fe_quad._r2:.3f}" if fe_quad._r2 else "",
                     "(3) Gini": f"{fe_cubic._r2:.3f}" if fe_cubic._r2 else ""})
table3_rows.append({"Variable": "Country FE",
                     "(1) Gini": "Yes", "(2) Gini": "Yes", "(3) Gini": "Yes"})
table3_rows.append({"Variable": "Year FE",
                     "(1) Gini": "Yes", "(2) Gini": "Yes", "(3) Gini": "Yes"})

table3_df = pd.DataFrame(table3_rows)

try:
    gt_table3 = (
        GT(table3_df)
        .tab_header(
            title=md("**Table 3: Regional Inequality and Development (Kuznets Curve)**"),
            subtitle="Dependent variable: Population-weighted regional Gini index"
        )
        .tab_source_note(
            "Notes: Two-way fixed effects (country + year). "
            "Robust standard errors clustered at country level in parentheses. "
            "* p<0.10, ** p<0.05, *** p<0.01."
        )
        .tab_style(
            style=style.text(weight="bold"),
            locations=loc.body(columns="Variable")
        )
    )
    gt_table3.save("kuznets_table3.png")
    print("Saved: kuznets_table3.png")
except Exception as e:
    print(f"Warning: Could not save GT table as PNG ({e})")
    print("Saved CSV fallback instead.")

table3_df.to_csv("kuznets_table3_data.csv", index=False)
print("Saved: kuznets_table3_data.csv")


# ── SECTION 7: Interpreting the N-Shaped Curve — Turning Points ─────────────

print("\n" + "=" * 60)
print("SECTION 7: The N-Shaped Kuznets Curve — Turning Points")
print("=" * 60)

# Extract cubic TWFE coefficients
b1 = fe_cubic.coef()["log_GDPpc"]
b2 = fe_cubic.coef()["log_GDPpc2"]
b3 = fe_cubic.coef()["log_GDPpc3"]

print(f"\nCubic TWFE coefficients:")
print(f"  b1 (ln GDP pc)    = {b1:.6f}")
print(f"  b2 (ln GDP pc ^2) = {b2:.6f}")
print(f"  b3 (ln GDP pc ^3) = {b3:.6f}")

# First derivative: d(gini)/d(ln_GDP) = b1 + 2*b2*x + 3*b3*x^2
# Setting to zero: 3*b3*x^2 + 2*b2*x + b1 = 0
print(f"\nFirst derivative: d(Gini)/d(ln GDP) = {b1:.4f} + {2*b2:.4f}*x + {3*b3:.4f}*x^2")
print("Setting the first derivative to zero and solving the quadratic:")

# Solve using np.roots
coeffs = [3 * b3, 2 * b2, b1]
roots = np.roots(coeffs)

# Keep only real roots
real_roots = roots[np.isreal(roots)].real
real_roots = np.sort(real_roots)

print(f"\n  Turning points (log scale): {real_roots}")
turning_usd = np.exp(real_roots)
print(f"  Turning points (USD PPP):   {['${:,.0f}'.format(v) for v in turning_usd]}")

if len(real_roots) >= 2:
    tp1_log, tp2_log = real_roots[0], real_roots[1]
    tp1_usd, tp2_usd = turning_usd[0], turning_usd[1]
    print(f"\n  Peak inequality (local max):    ln(GDP) = {tp1_log:.2f}  =>  ${tp1_usd:,.0f}")
    print(f"  Minimum inequality (local min): ln(GDP) = {tp2_log:.2f}  =>  ${tp2_usd:,.0f}")
    print(f"\n  Interpretation:")
    print(f"  - Below ${tp1_usd:,.0f}: inequality RISES with development")
    print(f"    (initial industrialization concentrates income in leading regions)")
    print(f"  - Between ${tp1_usd:,.0f} and ${tp2_usd:,.0f}: inequality FALLS")
    print(f"    (lagging regions catch up — the convergence story)")
    print(f"  - Above ${tp2_usd:,.0f}: inequality may RISE again")
    print(f"    (knowledge economy re-concentrates in specific regions)")

# Figure 4: Fitted N-shaped curve with turning points
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

# Use the range of the data
x_min, x_max = df3["log_GDPpc"].min(), df3["log_GDPpc"].max()
x_fit = np.linspace(x_min, x_max, 300)
y_fit = b1 * x_fit + b2 * x_fit**2 + b3 * x_fit**3

# Shift y_fit to center around the mean gini for visual purposes
# (FE removes country means, so we add back the overall mean)
y_offset = df3["gini"].mean() - np.mean(y_fit)
y_fit_adj = y_fit + y_offset

# Plot the curve
ax.plot(x_fit, y_fit_adj, color=WARM_ORANGE, lw=3, zorder=5,
        label="Fitted cubic polynomial")

# Shade the three regions (common bottom for consistent fill)
if len(real_roots) >= 2 and x_min < tp1_log < x_max:
    y_bottom = y_fit_adj.min() - 0.005
    # Rising region (left)
    mask_rise1 = x_fit <= tp1_log
    ax.fill_between(x_fit[mask_rise1], y_fit_adj[mask_rise1], y_bottom,
                    alpha=0.15, color=WARM_ORANGE, label="Rising inequality")
    # Falling region (middle)
    mask_fall = (x_fit >= tp1_log) & (x_fit <= min(tp2_log, x_max))
    ax.fill_between(x_fit[mask_fall], y_fit_adj[mask_fall], y_bottom,
                    alpha=0.15, color=STEEL_BLUE, label="Falling inequality")
    # Rising region (right) — only if tp2 is within data range
    if tp2_log < x_max:
        mask_rise2 = x_fit >= tp2_log
        ax.fill_between(x_fit[mask_rise2], y_fit_adj[mask_rise2], y_bottom,
                        alpha=0.15, color=WARM_ORANGE)

    # Vertical lines at turning points
    ax.axvline(tp1_log, color=TEAL, ls="--", lw=1.5, alpha=0.8, zorder=4)
    ax.axvline(tp2_log, color=TEAL, ls="--", lw=1.5, alpha=0.8, zorder=4)

    # Annotations
    y_range = y_fit_adj.max() - y_fit_adj.min()
    ax.annotate(f"Peak: ${tp1_usd:,.0f}",
                xy=(tp1_log, y_fit_adj[mask_rise1][-1] if mask_rise1.any() else y_fit_adj[0]),
                xytext=(tp1_log + 0.3, y_fit_adj.max() - 0.1 * y_range),
                fontsize=11, color=TEAL, fontweight="bold",
                arrowprops=dict(arrowstyle="->", color=TEAL, lw=1.5),
                zorder=6)

    if tp2_log < x_max + 2:
        ax.annotate(f"Trough: ${tp2_usd:,.0f}",
                    xy=(min(tp2_log, x_max), y_fit_adj[np.argmin(np.abs(x_fit - tp2_log))]),
                    xytext=(min(tp2_log, x_max) - 1.5, y_fit_adj.min() + 0.1 * y_range),
                    fontsize=11, color=TEAL, fontweight="bold",
                    arrowprops=dict(arrowstyle="->", color=TEAL, lw=1.5),
                    zorder=6)

# Add secondary x-axis with USD labels
ax2 = ax.twiny()
ax2.set_xlim(ax.get_xlim())
usd_ticks = [5, 6, 7, 8, 9, 10, 11]
usd_labels = [f"${np.exp(v):,.0f}" for v in usd_ticks]
ax2.set_xticks(usd_ticks)
ax2.set_xticklabels(usd_labels, fontsize=9, color=LIGHT_TEXT)
ax2.set_xlabel("GDP per capita (PPP, US$)", fontsize=11, color=LIGHT_TEXT)
ax2.tick_params(axis="x", colors=LIGHT_TEXT, length=0)
ax2.spines["top"].set_visible(False)

ax.set_xlabel("Log GDP per capita", fontsize=13)
ax.set_ylabel("Predicted Regional Gini", fontsize=13)
ax.set_title("The N-Shaped Kuznets Curve\nRegional Inequality and Development",
             fontsize=14, fontweight="bold")
ax.legend(fontsize=10, loc="upper left")
plt.tight_layout()
plt.savefig("kuznets_fitted_curve.png", **SAVE_KWARGS)
plt.show()
plt.close()
print("Saved: kuznets_fitted_curve.png")

# CSV export
turning_df = pd.DataFrame({
    "Turning Point": ["Peak (local max)", "Trough (local min)"] if len(real_roots) >= 2
                     else [f"Root {i+1}" for i in range(len(real_roots))],
    "Log GDP pc": real_roots[:2] if len(real_roots) >= 2 else real_roots,
    "GDP pc (USD)": turning_usd[:2] if len(turning_usd) >= 2 else turning_usd,
})
turning_df.to_csv("kuznets_turning_points.csv", index=False)
print("Saved: kuznets_turning_points.csv")


# ── SECTION 8: Pooled OLS vs TWFE Comparison ───────────────────────────────

print("\n" + "=" * 60)
print("SECTION 8: Pooled OLS vs TWFE — Coefficient Comparison")
print("=" * 60)

# Figure 5: Coefficient comparison plot
fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_linewidth(0)

var_names = ["log_GDPpc", "log_GDPpc2", "log_GDPpc3"]
var_display = ["ln(GDP pc)", "ln(GDP pc)\u00b2", "ln(GDP pc)\u00b3"]
y_positions = np.arange(len(var_names))
bar_height = 0.35

for i, var in enumerate(var_names):
    # Pooled OLS
    ols_tidy = ols_cubic.tidy()
    ols_coef = ols_tidy.loc[var, "Estimate"]
    ols_se = ols_tidy.loc[var, "Std. Error"]
    ax.barh(y_positions[i] + bar_height / 2, ols_coef, height=bar_height,
            color=STEEL_BLUE, alpha=0.8, label="Pooled OLS" if i == 0 else None,
            xerr=1.96 * ols_se, capsize=5,
            error_kw={"ecolor": WHITE_TEXT, "lw": 1.5, "capthick": 1.5})

    # TWFE
    fe_tidy = fe_cubic.tidy()
    fe_coef = fe_tidy.loc[var, "Estimate"]
    fe_se = fe_tidy.loc[var, "Std. Error"]
    ax.barh(y_positions[i] - bar_height / 2, fe_coef, height=bar_height,
            color=WARM_ORANGE, alpha=0.8, label="TWFE" if i == 0 else None,
            xerr=1.96 * fe_se, capsize=5,
            error_kw={"ecolor": WHITE_TEXT, "lw": 1.5, "capthick": 1.5})

ax.axvline(0, color=LIGHT_TEXT, ls="-", lw=0.8, alpha=0.5)
ax.set_yticks(y_positions)
ax.set_yticklabels(var_display, fontsize=12)
ax.set_xlabel("Coefficient Estimate (with 95% CI)", fontsize=12)
ax.set_title("Pooled OLS vs Two-Way Fixed Effects\nCubic Kuznets Specification",
             fontsize=14, fontweight="bold")
ax.legend(fontsize=11, loc="best")
plt.tight_layout()
plt.savefig("kuznets_ols_vs_fe.png", **SAVE_KWARGS)
plt.show()
plt.close()
print("Saved: kuznets_ols_vs_fe.png")

# CSV export
comp_rows = []
for var in var_names:
    ols_t = ols_cubic.tidy()
    fe_t = fe_cubic.tidy()
    comp_rows.append({
        "Variable": var,
        "OLS_coef": ols_t.loc[var, "Estimate"],
        "OLS_se": ols_t.loc[var, "Std. Error"],
        "OLS_pval": ols_t.loc[var, "Pr(>|t|)"],
        "TWFE_coef": fe_t.loc[var, "Estimate"],
        "TWFE_se": fe_t.loc[var, "Std. Error"],
        "TWFE_pval": fe_t.loc[var, "Pr(>|t|)"],
    })
pd.DataFrame(comp_rows).to_csv("kuznets_ols_vs_fe_comparison.csv", index=False)
print("Saved: kuznets_ols_vs_fe_comparison.csv")


# ── SECTION 9: Determinants Dataset EDA ─────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 9: Determinants of Regional Inequality — EDA")
print("=" * 60)

print(f"\nDeterminants dataset shape: {df4.shape}")
print(f"Columns: {list(df4.columns)}")
print(f"\nDescriptive statistics:")
print(df4.describe().round(4))

# Figure 6: Correlation heatmap
det_vars = ["gini", "lnGDPpc", "rents", "land", "trade", "fdi",
            "gasoline", "aid", "school", "ethnic_gini"]
det_labels = ["Gini", "ln(GDP pc)", "Resource\nrents", "Arable\nland",
              "Trade\nopenness", "FDI", "Gasoline\nprice", "Foreign\naid",
              "School\nenroll.", "Ethnic\nGini"]

corr = df4[det_vars].corr()

fig, ax = plt.subplots(figsize=(10, 8))
fig.patch.set_linewidth(0)

im = ax.imshow(corr.values, cmap="RdBu_r", vmin=-1, vmax=1, aspect="auto")
ax.set_xticks(range(len(det_vars)))
ax.set_yticks(range(len(det_vars)))
ax.set_xticklabels(det_labels, fontsize=9, rotation=45, ha="right", color=LIGHT_TEXT)
ax.set_yticklabels(det_labels, fontsize=9, color=LIGHT_TEXT)

# Remove black grid lines from imshow
ax.tick_params(top=False, bottom=False, left=False, right=False)
for spine in ax.spines.values():
    spine.set_visible(False)

# Add correlation values with adaptive text color
for i in range(len(det_vars)):
    for j in range(len(det_vars)):
        val = corr.values[i, j]
        # Use dark text on light cells, light text on dark cells
        text_color = DARK_NAVY if abs(val) < 0.4 else WHITE_TEXT
        ax.text(j, i, f"{val:.2f}", ha="center", va="center",
                fontsize=9, fontweight="bold", color=text_color)

cbar = fig.colorbar(im, ax=ax, shrink=0.8)
cbar.ax.tick_params(labelcolor=LIGHT_TEXT, color=LIGHT_TEXT)

ax.set_title("Correlation Matrix: Determinants of Regional Inequality",
             fontsize=14, fontweight="bold", pad=15)
plt.tight_layout()
plt.savefig("kuznets_correlation_heatmap.png", **SAVE_KWARGS)
plt.show()
plt.close()
print("Saved: kuznets_correlation_heatmap.png")

# CSV export
df4.describe().round(4).to_csv("kuznets_determinants_summary.csv")
print("Saved: kuznets_determinants_summary.csv")


# ── SECTION 10: Determinants — Table 4 Replication ─────────────────────────

print("\n" + "=" * 60)
print("SECTION 10: Determinants of Regional Inequality (Table 4)")
print("=" * 60)

print("""
We now ask: WHAT DRIVES regional inequality, beyond the Kuznets curve?
Each model adds a different group of determinants while keeping the
cubic polynomial and two-way fixed effects.
""")

# Model 1: Resources
print("--- Model 1: Resources (rents, land) ---")
det1 = pf.feols(
    "gini ~ lnGDPpc + lnGDPpc2 + lnGDPpc3 + rents + land | id + year",
    data=df4, vcov={"CRV1": "id"}
)
print(det1.summary())

# Model 2: Trade & Investment
print("\n--- Model 2: Trade & Investment (trade, fdi) ---")
det2 = pf.feols(
    "gini ~ lnGDPpc + lnGDPpc2 + lnGDPpc3 + trade + fdi | id + year",
    data=df4, vcov={"CRV1": "id"}
)
print(det2.summary())

# Model 3: Mobility & Infrastructure
print("\n--- Model 3: Mobility (gasoline, area x gasoline) ---")
det3 = pf.feols(
    "gini ~ lnGDPpc + lnGDPpc2 + lnGDPpc3 + gasoline + areaXgasoline | id + year",
    data=df4, vcov={"CRV1": "id"}
)
print(det3.summary())

# Model 4: Aid & Education
print("\n--- Model 4: Aid & Education (aid, school) ---")
det4 = pf.feols(
    "gini ~ lnGDPpc + lnGDPpc2 + lnGDPpc3 + aid + school | id + year",
    data=df4, vcov={"CRV1": "id"}
)
print(det4.summary())

# Model 5: Ethnicity
print("\n--- Model 5: Ethnicity (ethnic_gini) ---")
det5 = pf.feols(
    "gini ~ lnGDPpc + lnGDPpc2 + lnGDPpc3 + ethnic_gini | id + year",
    data=df4, vcov={"CRV1": "id"}
)
print(det5.summary())

# CSV export
det_models = [det1, det2, det3, det4, det5]
det_names = ["Resources", "Trade", "Mobility", "Aid/Education", "Ethnicity"]
det_all_vars = ["lnGDPpc", "lnGDPpc2", "lnGDPpc3", "rents", "land",
                "trade", "fdi", "gasoline", "areaXgasoline", "aid",
                "school", "ethnic_gini"]

det_result_rows = []
for name, m in zip(det_names, det_models):
    row = {"Model": name, "N": m._N}
    tidy = m.tidy()
    for var in det_all_vars:
        if var in tidy.index:
            row[f"{var}_coef"] = tidy.loc[var, "Estimate"]
            row[f"{var}_se"] = tidy.loc[var, "Std. Error"]
            row[f"{var}_pval"] = tidy.loc[var, "Pr(>|t|)"]
    det_result_rows.append(row)
pd.DataFrame(det_result_rows).to_csv("kuznets_determinants_results.csv", index=False)
print("\nSaved: kuznets_determinants_results.csv")


# ── SECTION 11: Publication Table 4 (Great Tables) ─────────────────────────

print("\n" + "=" * 60)
print("SECTION 11: Publication-Quality Table 4 (Great Tables)")
print("=" * 60)

det_model_cols = ["(1) Gini", "(2) Gini", "(3) Gini", "(4) Gini", "(5) Gini"]

det_var_labels = {
    "lnGDPpc": "ln(GDP pc)",
    "lnGDPpc2": "ln(GDP pc)\u00b2",
    "lnGDPpc3": "ln(GDP pc)\u00b3",
    "rents": "Resource rents",
    "land": "Arable land",
    "trade": "Trade openness",
    "fdi": "FDI",
    "gasoline": "Gasoline price",
    "areaXgasoline": "Area \u00d7 Gasoline",
    "aid": "Foreign aid",
    "school": "School enrollment",
    "ethnic_gini": "Ethnic Gini",
}

table4_rows = []
for var in det_all_vars:
    row_coef = {"Variable": det_var_labels.get(var, var)}
    row_se = {"Variable": ""}
    for i, model in enumerate(det_models):
        col = det_model_cols[i]
        tidy = model.tidy()
        if var in tidy.index:
            c = tidy.loc[var, "Estimate"]
            se = tidy.loc[var, "Std. Error"]
            p = tidy.loc[var, "Pr(>|t|)"]
            row_coef[col] = f"{c:.3f}{stars(p)}"
            row_se[col] = f"({se:.3f})"
        else:
            row_coef[col] = ""
            row_se[col] = ""
    table4_rows.append(row_coef)
    table4_rows.append(row_se)

# Separator
table4_rows.append({k: "" for k in ["Variable"] + det_model_cols})

# Statistics
obs_row = {"Variable": "Observations"}
r2_row = {"Variable": "R-squared"}
cfe_row = {"Variable": "Country FE"}
yfe_row = {"Variable": "Year FE"}
for i, model in enumerate(det_models):
    col = det_model_cols[i]
    obs_row[col] = str(model._N)
    r2_row[col] = f"{model._r2:.3f}" if model._r2 is not None else ""
    cfe_row[col] = "Yes"
    yfe_row[col] = "Yes"

table4_rows.extend([obs_row, r2_row, cfe_row, yfe_row])

table4_df = pd.DataFrame(table4_rows)

try:
    gt_table4 = (
        GT(table4_df)
        .tab_header(
            title=md("**Table 4: Determinants of Regional Inequality**"),
            subtitle="Dependent variable: Population-weighted regional Gini index"
        )
        .tab_source_note(
            "Notes: Two-way fixed effects (country + year). "
            "All models include cubic polynomial of ln(GDP pc). "
            "Robust standard errors clustered at country level in parentheses. "
            "* p<0.10, ** p<0.05, *** p<0.01."
        )
        .tab_style(
            style=style.text(weight="bold"),
            locations=loc.body(columns="Variable")
        )
    )
    gt_table4.save("kuznets_table4.png")
    print("Saved: kuznets_table4.png")
except Exception as e:
    print(f"Warning: Could not save GT table as PNG ({e})")
    print("Saved CSV fallback instead.")

table4_df.to_csv("kuznets_table4_data.csv", index=False)
print("Saved: kuznets_table4_data.csv")


# ── SECTION 12: Coefficient Stability Across Specifications ────────────────

print("\n" + "=" * 60)
print("SECTION 12: Coefficient Stability — Is the N-Shape Robust?")
print("=" * 60)

# Collect cubic polynomial coefficients across all specifications
all_models = [fe_cubic] + det_models
all_spec_names = ["Baseline\n(Table 3)", "Resources", "Trade", "Mobility",
                  "Aid/Educ.", "Ethnicity"]
poly_vars = ["lnGDPpc", "lnGDPpc2", "lnGDPpc3"]
# Note: Table 3 uses log_GDPpc, Table 4 uses lnGDPpc
poly_vars_tab3 = ["log_GDPpc", "log_GDPpc2", "log_GDPpc3"]

# Figure 7: Coefficient stability
fig, axes = plt.subplots(1, 3, figsize=(14, 5), sharey=False)
fig.patch.set_linewidth(0)

poly_labels = ["ln(GDP pc)", "ln(GDP pc)\u00b2", "ln(GDP pc)\u00b3"]

for j, (var4, var3, label) in enumerate(zip(poly_vars, poly_vars_tab3, poly_labels)):
    ax = axes[j]
    coefs = []
    cis_lo = []
    cis_hi = []

    for i, model in enumerate(all_models):
        tidy = model.tidy()
        # Use correct variable name depending on which dataset
        v = var3 if i == 0 else var4
        if v in tidy.index:
            c = tidy.loc[v, "Estimate"]
            se = tidy.loc[v, "Std. Error"]
            coefs.append(c)
            cis_lo.append(c - 1.96 * se)
            cis_hi.append(c + 1.96 * se)
        else:
            coefs.append(np.nan)
            cis_lo.append(np.nan)
            cis_hi.append(np.nan)

    x_pos = np.arange(len(all_models))
    colors = [TEAL] + [STEEL_BLUE] * len(det_models)

    ax.scatter(x_pos, coefs, color=colors, s=60, zorder=5, edgecolors=DARK_NAVY)
    for k in range(len(all_models)):
        ax.plot([x_pos[k], x_pos[k]], [cis_lo[k], cis_hi[k]],
                color=colors[k], lw=2, zorder=4)

    ax.axhline(0, color=LIGHT_TEXT, ls="-", lw=0.5, alpha=0.4)
    ax.set_xticks(x_pos)
    ax.set_xticklabels(all_spec_names, fontsize=8, rotation=30, ha="right")
    ax.set_title(label, fontsize=13, fontweight="bold")
    ax.set_ylabel("Coefficient" if j == 0 else "", fontsize=11)

fig.suptitle("Stability of Kuznets Curve Coefficients Across Specifications",
             fontsize=14, fontweight="bold", y=1.02, color=WHITE_TEXT)
plt.tight_layout()
plt.savefig("kuznets_coefficient_stability.png", **SAVE_KWARGS)
plt.show()
plt.close()
print("Saved: kuznets_coefficient_stability.png")

# Print summary
print("\n--- Coefficient Stability Summary ---")
print(f"{'Specification':<16} {'ln(GDP)':>10} {'ln(GDP)^2':>12} {'ln(GDP)^3':>12}")
print("-" * 52)
for i, (name, model) in enumerate(zip(all_spec_names, all_models)):
    tidy = model.tidy()
    vals = []
    for var4, var3 in zip(poly_vars, poly_vars_tab3):
        v = var3 if i == 0 else var4
        if v in tidy.index:
            vals.append(f"{tidy.loc[v, 'Estimate']:.4f}")
        else:
            vals.append("---")
    name_clean = name.replace("\n", " ")
    print(f"{name_clean:<16} {vals[0]:>10} {vals[1]:>12} {vals[2]:>12}")


# ── SECTION 13: Determinants Summary ───────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 13: Determinants Summary — What Drives Inequality?")
print("=" * 60)

# Collect determinant coefficients (excluding the polynomial terms)
det_only_vars = ["rents", "land", "trade", "fdi", "gasoline",
                 "areaXgasoline", "aid", "school", "ethnic_gini"]
det_only_labels = ["Resource rents", "Arable land", "Trade openness", "FDI",
                   "Gasoline price", "Area \u00d7 Gasoline",
                   "Foreign aid", "School enrollment", "Ethnic Gini"]

# Find which model contains each variable
det_coefs = []
det_sigs = []
det_display = []

for var, label in zip(det_only_vars, det_only_labels):
    for model in det_models:
        tidy = model.tidy()
        if var in tidy.index:
            c = tidy.loc[var, "Estimate"]
            p = tidy.loc[var, "Pr(>|t|)"]
            det_coefs.append(c)
            det_sigs.append(p < 0.10)
            det_display.append(label)
            break

# Figure 8: Determinants bar chart
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

y_pos = np.arange(len(det_display))
colors_bar = [WARM_ORANGE if c > 0 else STEEL_BLUE for c in det_coefs]
alphas = [0.9 if sig else 0.4 for sig in det_sigs]

bars = ax.barh(y_pos, det_coefs, color=colors_bar, height=0.6, zorder=3)
for bar, alpha in zip(bars, alphas):
    bar.set_alpha(alpha)

ax.axvline(0, color=LIGHT_TEXT, ls="-", lw=0.8, alpha=0.5)
ax.set_yticks(y_pos)
ax.set_yticklabels(det_display, fontsize=11)
ax.set_xlabel("Coefficient (effect on regional Gini)", fontsize=12)
ax.set_title("Determinants of Regional Inequality\n"
             "Solid = significant (p<0.10), faded = not significant",
             fontsize=14, fontweight="bold")

# Legend
increase_patch = mpatches.Patch(color=WARM_ORANGE, alpha=0.9, label="Increases inequality")
decrease_patch = mpatches.Patch(color=STEEL_BLUE, alpha=0.9, label="Decreases inequality")
ax.legend(handles=[increase_patch, decrease_patch], fontsize=10, loc="lower right")

plt.tight_layout()
plt.savefig("kuznets_determinants_barplot.png", **SAVE_KWARGS)
plt.show()
plt.close()
print("Saved: kuznets_determinants_barplot.png")

# Print summary
print("\n--- Determinant Effects Summary ---")
print(f"{'Variable':<22} {'Coefficient':>12} {'Significant':>12}")
print("-" * 48)
for label, c, sig in zip(det_display, det_coefs, det_sigs):
    sig_str = "Yes ***" if sig else "No"
    print(f"{label:<22} {c:>12.4f} {sig_str:>12}")

# CSV export
effects_df = pd.DataFrame({
    "Variable": det_display,
    "Coefficient": det_coefs,
    "Significant_10pct": det_sigs,
    "Direction": ["Increases inequality" if c > 0 else "Decreases inequality" for c in det_coefs],
})
effects_df.to_csv("kuznets_determinants_effects.csv", index=False)
print("\nSaved: kuznets_determinants_effects.csv")


# ── SECTION 14: Script Completion ──────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 14: Artifact Inventory")
print("=" * 60)

print("\nFigures saved (8 PNGs, dark theme, 300 DPI):")
print("  1. kuznets_scatter_pooled.png     — Scatter + polynomial fits")
print("  2. kuznets_scatter_by_period.png  — Per-period scatter facets")
print("  3. kuznets_spaghetti.png          — Country trajectories")
print("  4. kuznets_fitted_curve.png       — N-shaped curve + turning points")
print("  5. kuznets_ols_vs_fe.png          — Pooled OLS vs TWFE comparison")
print("  6. kuznets_correlation_heatmap.png — Determinant correlations")
print("  7. kuznets_coefficient_stability.png — Polynomial stability")
print("  8. kuznets_determinants_barplot.png — Determinant effects")

print("\nTables saved (2 PNGs via Great Tables):")
print("  1. kuznets_table3.png — Kuznets curve (3 TWFE models)")
print("  2. kuznets_table4.png — Determinants (5 TWFE models)")

print("\nCSV exports (11 files):")
print("  kuznets_summary_stats.csv, kuznets_period_means.csv,")
print("  kuznets_pooled_ols.csv, kuznets_twfe_results.csv,")
print("  kuznets_table3_data.csv, kuznets_turning_points.csv,")
print("  kuznets_ols_vs_fe_comparison.csv, kuznets_determinants_summary.csv,")
print("  kuznets_determinants_results.csv, kuznets_table4_data.csv,")
print("  kuznets_determinants_effects.csv")

print("\n=== Script completed successfully ===")
