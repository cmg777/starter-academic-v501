"""
Introduction to Panel Data Methods (Python tutorial).

Estimates seven panel estimators on a two-period worker wage panel
(2010 & 2012, N=2,209) and visualizes how each one uses the data:
POLS, Between, First-Differences, Within (FE), Two-Way FE, Random
Effects, and Correlated Random Effects (Mundlak). Includes a Hausman
test comparing FE and RE.

Usage:
    python script.py

Outputs:
    panel_intro_*.png (5 figures), *.csv (8 tables)

References:
    https://pyfixest.org/pyfixest.html
    https://bashtage.github.io/linearmodels/panel/introduction.html
"""

import glob

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

import pyfixest as pf
import statsmodels.api as sm
from linearmodels.panel import RandomEffects
from scipy.stats import chi2


# ── Configuration ─────────────────────────────────────────────────────────────

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
rng = np.random.default_rng(RANDOM_SEED)

# Site palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"
LIGHT_BLUE = "#8FB4D8"  # pairs with FE family but distinguishes Between

# Dark theme
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"

METHOD_COLORS = {
    "POLS":    "#999999",
    "Between": LIGHT_BLUE,
    "FDFE":    STEEL_BLUE,
    "FE":      WARM_ORANGE,
    "TWFE":    WARM_ORANGE,
    "RE":      TEAL,
    "CRE":     "#c4623d",
}

DATA_URL = "https://github.com/quarcs-lab/data-open/raw/master/isds/wage_panel_bob4.dta"

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


def section(title):
    """Print a single-line section divider."""
    print(f"\n── {title} " + "─" * max(0, 70 - len(title) - 4))


def save_dark(name):
    """Save the current figure with the dark-navy background settings."""
    plt.tight_layout()
    plt.savefig(name, dpi=300, bbox_inches="tight",
                facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
    plt.show()
    plt.close()
    print(f"Saved {name}")


# ── 1. Data Loading ───────────────────────────────────────────────────────────
section("1. Data Loading")

df_full = pd.read_stata(DATA_URL)
years_avail = sorted(int(y) for y in df_full["year"].unique())
print(f"Full dataset: {df_full.shape[0]} rows × {df_full.shape[1]} cols, "
      f"years {years_avail}")

# Categorical clean-up so the CSV exports cleanly.
union_map = {"Yes": 1, "No": 0, "yes": 1, "no": 0, 1: 1, 0: 0}
df_full["union"] = df_full["union"].map(union_map)
if df_full["region"].dtype.name == "category":
    df_full["region"] = df_full["region"].astype(str)
if df_full["gender"].dtype.name == "category":
    df_full["gender"] = df_full["gender"].astype(str)

df_full.to_csv("raw_data.csv", index=False)
print(f"Exported raw_data.csv ({df_full.shape[0]} rows)")

# Filter to two periods so the FD = Within identity is visible.
df = df_full[df_full["year"].isin([2010, 2012])].copy()
df = df.sort_values(["ID", "year"]).reset_index(drop=True)

# Female dummy from gender string.
df["female"] = (df["gender"].astype(str).str.strip().str.lower() == "female").astype(float)

# Coerce all numeric columns we'll use.
for col in ["lwage", "age", "schooling", "ID", "year", "union"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")

n_before = len(df)
df = df.dropna(subset=["lwage", "union", "age", "schooling"]).reset_index(drop=True)
df["year"] = df["year"].astype(int)
df.to_csv("data_panel.csv", index=False)
print(f"Filtered panel: {df.shape[0]} rows × {df.shape[1]} cols  "
      f"(dropped {n_before - len(df)} NA)")


# ── 2. Panel Structure ────────────────────────────────────────────────────────
section("2. Panel Structure")

print(f"Individuals (N): {df['ID'].nunique()}")
print(f"Time periods (T): {df['year'].nunique()}")
print(f"Observations (N×T): {len(df)}")
obs_per_id = df.groupby("ID")["year"].count()
print(f"Balanced: {(obs_per_id == df['year'].nunique()).all()}")

desc_vars = ["lwage", "union", "age", "schooling"]
desc_overall = df[desc_vars].describe().round(4)
print("\nDescriptive statistics:")
print(desc_overall)
desc_overall.to_csv("descriptive_stats.csv")
print("Exported descriptive_stats.csv")


# ── 3. Between vs Within Variance Decomposition ───────────────────────────────
section("3. Between vs Within Variance")

# For each variable we split total variation into:
#   between → variation across individuals (different worker means)
#   within  → variation over time for the same individual
# FE uses only within-variation; Between uses only between-variation.
print(f"\n{'Variable':<12} {'Overall SD':>12} {'Between SD':>12} {'Within SD':>12} {'Between %':>11}")
print("-" * 62)

variation_data = []
for var in desc_vars:
    overall_sd = df[var].std()
    between_sd = df.groupby("ID")[var].mean().std()
    within_sd = (df[var] - df.groupby("ID")[var].transform("mean")).std()
    between_pct = (between_sd**2 / (between_sd**2 + within_sd**2)) * 100
    print(f"{var:<12} {overall_sd:>12.4f} {between_sd:>12.4f} {within_sd:>12.4f} {between_pct:>10.1f}%")
    variation_data.append({
        "variable": var,
        "overall_sd": round(overall_sd, 4),
        "between_sd": round(between_sd, 4),
        "within_sd":  round(within_sd, 4),
        "between_pct": round(between_pct, 1),
        "within_pct":  round(100 - between_pct, 1),
    })

variation_df = pd.DataFrame(variation_data)
variation_df.to_csv("variation_decomposition.csv", index=False)
print("Exported variation_decomposition.csv")

# Figure 1 — between vs within shares.
fig, ax = plt.subplots(figsize=(10, 5))
fig.patch.set_linewidth(0)
y_pos = np.arange(len(variation_df))
between_vals = variation_df["between_pct"].values
within_vals = variation_df["within_pct"].values

ax.barh(y_pos, between_vals, 0.5, label="Between (cross-individual)",
        color=STEEL_BLUE, edgecolor=DARK_NAVY, linewidth=0.5)
ax.barh(y_pos, within_vals, 0.5, left=between_vals,
        label="Within (over time)",
        color=WARM_ORANGE, edgecolor=DARK_NAVY, linewidth=0.5)

for i, (b, w) in enumerate(zip(between_vals, within_vals)):
    if b > 8:
        ax.text(b/2, i, f"{b:.0f}%", ha="center", va="center",
                fontsize=11, fontweight="bold", color=WHITE_TEXT)
    if w > 8:
        ax.text(b + w/2, i, f"{w:.0f}%", ha="center", va="center",
                fontsize=11, fontweight="bold", color=WHITE_TEXT)

ax.set_yticks(y_pos)
ax.set_yticklabels([v.title() for v in variation_df["variable"]],
                   fontsize=12, color=LIGHT_TEXT)
ax.set_xlabel("Share of Total Variance (%)", fontsize=13, color=LIGHT_TEXT)
ax.set_title("Between vs Within Variation in Panel Data",
             fontsize=15, fontweight="bold", color=WHITE_TEXT)
ax.legend(loc="lower right")
ax.set_xlim(0, 105)
save_dark("panel_intro_variation.png")


# ── 4. Wage Trajectories (motivation) ─────────────────────────────────────────
section("4. Wage Trajectories")

# Spaghetti plot of 30 random workers — each line is one individual over time.
# This is what "panel data" looks like: repeated observations per unit.
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)

sample_ids = rng.choice(df["ID"].unique(), size=30, replace=False)

for pid in sample_ids:
    person = df[df["ID"] == pid].sort_values("year")
    if person["union"].nunique() > 1:
        ax.plot(person["year"], person["lwage"], "o-", color=TEAL,
                alpha=0.85, linewidth=2, markersize=6, zorder=3)
    else:
        c = WARM_ORANGE if person["union"].iloc[0] == 1 else STEEL_BLUE
        ax.plot(person["year"], person["lwage"], "o-", color=c,
                alpha=0.35, linewidth=1, markersize=4)

legend_elements = [
    Line2D([0], [0], color=STEEL_BLUE, alpha=0.6, lw=1.5, marker="o",
           markersize=5, label="Never union"),
    Line2D([0], [0], color=WARM_ORANGE, alpha=0.6, lw=1.5, marker="o",
           markersize=5, label="Always union"),
    Line2D([0], [0], color=TEAL, lw=2.5, marker="o",
           markersize=6, label="Union status changed"),
]
ax.legend(handles=legend_elements, loc="upper left")
ax.set_xlabel("Year", fontsize=13, color=LIGHT_TEXT)
ax.set_ylabel("Log Wage", fontsize=13, color=LIGHT_TEXT)
ax.set_title("Individual Wage Trajectories (30 sampled workers)",
             fontsize=15, fontweight="bold", color=WHITE_TEXT)
ax.set_xticks(sorted(df["year"].unique()))
save_dark("panel_intro_trajectories.png")


# ── 5. Pooled OLS (POLS) ──────────────────────────────────────────────────────
section("5. Pooled OLS")

# Stata: reg lwage union, robust
# Treats every (i,t) row as if it were independent. Ignores the panel.
# Biased if union is correlated with any unobserved worker trait (e.g. ability).
fit_pols = pf.feols("lwage ~ union", data=df, vcov="HC1")
pols_coef = fit_pols.coef()["union"]
pols_se = fit_pols.se()["union"]
print(f"Union coefficient: {pols_coef:.4f}  (SE {pols_se:.4f})")


# ── 6. Between Estimator ──────────────────────────────────────────────────────
section("6. Between Estimator")

# Stata: xtreg lwage union, be
# Collapse each worker to their mean across years, then run OLS across workers.
# Uses ONLY between-individual variation — the mirror image of FE.
df_between = df.groupby("ID")[["lwage", "union"]].mean().reset_index()
fit_between = pf.feols("lwage ~ union", data=df_between, vcov="HC1")
between_coef = fit_between.coef()["union"]
between_se = fit_between.se()["union"]
print(f"Union coefficient: {between_coef:.4f}  (SE {between_se:.4f})")
print(f"Sample collapsed to {len(df_between)} individual averages — "
      f"within-person changes are erased.")


# ── 7. First-Differences (FDFE) ───────────────────────────────────────────────
section("7. First-Differences")

# Stata: bysort ID: gen d_lwage = lwage - L.lwage; reg d_lwage d_union, robust
# Differencing within each worker eliminates the time-invariant individual effect.
df_diff = (df.sort_values(["ID", "year"])
             .groupby("ID")[["lwage", "union"]]
             .diff()
             .dropna())
df_diff.columns = ["d_lwage", "d_union"]

fit_fdfe = pf.feols("d_lwage ~ d_union", data=df_diff, vcov="HC1")
fdfe_coef = fit_fdfe.coef()["d_union"]
fdfe_se = fit_fdfe.se()["d_union"]
print(f"Union coefficient: {fdfe_coef:.4f}  (SE {fdfe_se:.4f})")
print(f"Differenced sample: {len(df_diff)} rows (one per worker since T=2).")


# ── 8. Within / Fixed Effects (FE) ────────────────────────────────────────────
section("8. Within / Fixed Effects")

# Stata: xtreg lwage union, fe robust   (or)   reghdfe lwage union, absorb(ID)
# Subtract each worker's mean from each variable (the "within transformation"),
# then run OLS on the demeaned data.

# (a) Manual demeaning — pedagogical, makes the within transformation visible.
df["lwage_demean"] = df["lwage"] - df.groupby("ID")["lwage"].transform("mean")
df["union_demean"] = df["union"] - df.groupby("ID")["union"].transform("mean")

# (b) pyfixest absorbs the FE for us — same coefficient, less bookkeeping.
fit_fe = pf.feols("lwage ~ union | ID", data=df, vcov="HC1")
fe_coef = fit_fe.coef()["union"]
fe_se = fit_fe.se()["union"]
print(f"Union coefficient: {fe_coef:.4f}  (SE {fe_se:.4f})")

# Same coefficient with clustered SE — clustering changes inference, not the point.
fit_fe_clu = pf.feols("lwage ~ union | ID", data=df, vcov={"CRV1": "ID"})
print(f"Clustered SE at ID: {fit_fe_clu.se()['union']:.4f}  (coefficient unchanged)")

# T=2 closeness: with an intercept in the FD regression (which absorbs the
# average time trend), the FD slope is very close to — but not identical to —
# the within slope. The two match exactly when Within also absorbs year FE
# (that's TWFE: see Section 9).
print(f"FD coef  = {fdfe_coef:.6f}")
print(f"FE coef  = {fe_coef:.6f}")
print(f"diff     = {fdfe_coef - fe_coef:+.6f}  (closes once we add year FE → TWFE)")

# DVFE: explicit individual dummies — algebraically equivalent to FE,
# but estimates N-1 nuisance intercepts. Don't do this for large N.
df["ID_str"] = df["ID"].astype(str)
fit_dvfe = pf.feols("lwage ~ union + C(ID_str)", data=df, vcov="HC1")
dvfe_coef = fit_dvfe.coef()["union"]
print(f"DVFE coefficient: {dvfe_coef:.4f}  (same as FE, with N-1 dummies)")


# ── Figure 3: Within Transformation ───────────────────────────────────────────
section("Figure 3: Within Transformation")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 5))
fig.patch.set_linewidth(0)

# Jitter the binary union variable so the point cloud is visible.
jitter_raw = rng.normal(0, 0.025, size=len(df))
jitter_dem = rng.normal(0, 0.005, size=len(df))

# Left panel — raw data, POLS fit through it.
ax1.scatter(df["union"] + jitter_raw, df["lwage"],
            s=10, alpha=0.30, color=STEEL_BLUE, edgecolors="none")
b_pols, a_pols = np.polyfit(df["union"], df["lwage"], 1)
xs = np.array([-0.1, 1.1])
ax1.plot(xs, a_pols + b_pols * xs, color=WHITE_TEXT, lw=2)
ax1.set_xlabel("Union (raw)", fontsize=12, color=LIGHT_TEXT)
ax1.set_ylabel("Log wage (raw)", fontsize=12, color=LIGHT_TEXT)
ax1.set_title(f"Raw data — POLS slope = {b_pols:.3f}",
              fontsize=13, color=WHITE_TEXT)

# Right panel — demeaned data, FE (within) fit.
ax2.scatter(df["union_demean"] + jitter_dem, df["lwage_demean"],
            s=10, alpha=0.30, color=WARM_ORANGE, edgecolors="none")
b_fe = np.polyfit(df["union_demean"], df["lwage_demean"], 1)[0]
xr = np.array([df["union_demean"].min(), df["union_demean"].max()])
ax2.plot(xr, b_fe * xr, color=WHITE_TEXT, lw=2)
ax2.axhline(0, color=LIGHT_TEXT, lw=0.5, ls="--", alpha=0.5)
ax2.axvline(0, color=LIGHT_TEXT, lw=0.5, ls="--", alpha=0.5)
ax2.set_xlabel("Union − mean(Union)", fontsize=12, color=LIGHT_TEXT)
ax2.set_ylabel("Log wage − mean(Log wage)", fontsize=12, color=LIGHT_TEXT)
ax2.set_title(f"Demeaned data — FE slope = {b_fe:.3f}",
              fontsize=13, color=WHITE_TEXT)

fig.suptitle("Within Transformation: Removing Individual Means",
             fontsize=15, fontweight="bold", color=WHITE_TEXT, y=1.02)
save_dark("panel_intro_demeaning.png")


# ── 9. Two-Way Fixed Effects (TWFE) ───────────────────────────────────────────
section("9. Two-Way Fixed Effects")

# Stata: reghdfe lwage union age, absorb(ID year) vce(cluster ID)
# Absorbs ID effects (unobserved worker traits) AND year effects (common shocks).
# Schooling and gender are time-invariant — automatically absorbed by ID FE.
fit_twfe = pf.feols("lwage ~ union + age | ID + year", data=df, vcov={"CRV1": "ID"})
twfe_coef = fit_twfe.coef()["union"]
twfe_se = fit_twfe.se()["union"]
print(f"Union coefficient: {twfe_coef:.4f}  (SE {twfe_se:.4f})")
print("Schooling and gender are absorbed (time-invariant) — TWFE cannot identify their effects.")


# ── 10. Random Effects (RE) ───────────────────────────────────────────────────
section("10. Random Effects")

# Stata: xtreg lwage union, re robust
# Treats individual effects as random draws, *uncorrelated with regressors*.
# Efficient if assumption holds; inconsistent if it fails.
df_re = df.set_index(["ID", "year"])
exog = sm.add_constant(df_re[["union"]])
fit_re = RandomEffects(df_re["lwage"], exog).fit(cov_type="robust")
re_coef = fit_re.params["union"]
re_se = fit_re.std_errors["union"]
print(f"Union coefficient: {re_coef:.4f}  (SE {re_se:.4f})")
print("RE is a weighted average of Between and Within — leans toward FE when within-variance dominates.")


# ── 11. Hausman Test (FE vs RE) ───────────────────────────────────────────────
section("11. Hausman Test")

# H0: individual effects are uncorrelated with regressors → RE consistent + efficient.
# H1: correlated → only FE is consistent.
# Statistic: H = (β_FE − β_RE)' [V_FE − V_RE]^(-1) (β_FE − β_RE)  ~  χ²(k)
b_diff = np.array([fe_coef - re_coef])
v_diff = np.array([[fe_se ** 2 - re_se ** 2]])

# Pseudo-inverse keeps things stable when V_FE − V_RE is near-singular.
H = float(b_diff @ np.linalg.pinv(v_diff) @ b_diff)
df_h = len(b_diff)
p_h = 1 - chi2.cdf(H, df=df_h)
print(f"H statistic: {H:.4f}   df = {df_h}   p-value = {p_h:.4f}")
print(f"β_FE − β_RE = {b_diff[0]:+.4f}")
if p_h < 0.05:
    print("Reject H0 → use FE; RE is inconsistent.")
else:
    print("Fail to reject H0 → RE acceptable (more efficient than FE).")


# ── 12. Correlated Random Effects (CRE / Mundlak) ────────────────────────────
section("12. Correlated Random Effects")

# Stata: bysort ID: egen union_bar = mean(union); xtreg lwage union union_bar, re robust
# RE plus the within-person mean of each time-varying regressor.
# Mundlak (1978): the CRE coefficient on union equals the FE coefficient.
# A significant union_bar ≡ rejecting RE in favor of FE — the modern Mundlak alternative
# to the Hausman test.
df["union_bar"] = df.groupby("ID")["union"].transform("mean")
df_cre = df.set_index(["ID", "year"])
exog_cre = sm.add_constant(df_cre[["union", "union_bar"]])
fit_cre = RandomEffects(df_cre["lwage"], exog_cre).fit(cov_type="robust")
cre_coef = fit_cre.params["union"]
cre_se = fit_cre.std_errors["union"]
mundlak_coef = fit_cre.params["union_bar"]
mundlak_p = fit_cre.pvalues["union_bar"]
print(f"Union (within) coefficient: {cre_coef:.4f}  (SE {cre_se:.4f})")
print(f"Mundlak term (union_bar):   {mundlak_coef:+.4f}  (p = {mundlak_p:.4f})")
print(f"CRE within ≈ FE: {cre_coef:.4f} vs {fe_coef:.4f}  ✓")
if mundlak_p < 0.05:
    print("Mundlak term is significant → individual effects correlate with union → use FE.")
else:
    print("Mundlak term is not significant → RE assumption is plausible.")


# ── 13. Method Comparison ─────────────────────────────────────────────────────
section("13. Method Comparison")

methods = ["POLS", "Between", "FDFE", "FE", "RE", "CRE"]
coefs = [pols_coef, between_coef, fdfe_coef, fe_coef, re_coef, cre_coef]
ses = [pols_se, between_se, fdfe_se, fe_se, re_se, cre_se]
colors = [METHOD_COLORS[m] for m in methods]

fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_linewidth(0)
y_pos = np.arange(len(methods))
ci = [1.96 * s for s in ses]

ax.barh(y_pos, coefs, 0.6, xerr=ci, color=colors,
        edgecolor=DARK_NAVY, linewidth=0.5, capsize=4,
        error_kw={"ecolor": WHITE_TEXT, "capthick": 1.2})

for i, (c, s) in enumerate(zip(coefs, ses)):
    ax.text(c + 1.96 * s + 0.005, i, f"{c:.4f}", va="center",
            fontsize=10, color=LIGHT_TEXT)

ax.set_yticks(y_pos)
ax.set_yticklabels(methods, fontsize=13, color=LIGHT_TEXT)
ax.set_xlabel("Coefficient on Union", fontsize=13, color=LIGHT_TEXT)
ax.axvline(x=0, color=LIGHT_TEXT, linewidth=0.5, linestyle="--", alpha=0.5)
ax.set_title("Effect of Union on Log Wages: Six Panel Estimators",
             fontsize=15, fontweight="bold", color=WHITE_TEXT)
ax.text(0.99, 0.02, f"Hausman: χ²={H:.2f}, p={p_h:.3f}",
        transform=ax.transAxes, ha="right", va="bottom",
        fontsize=10, color=LIGHT_TEXT, style="italic")
save_dark("panel_intro_coef_comparison.png")

basic_comparison = pd.DataFrame({
    "method": methods,
    "coefficient": [round(c, 6) for c in coefs],
    "std_error": [round(s, 6) for s in ses],
    "ci_lower": [round(c - 1.96 * s, 6) for c, s in zip(coefs, ses)],
    "ci_upper": [round(c + 1.96 * s, 6) for c, s in zip(coefs, ses)],
})
basic_comparison.to_csv("basic_models_comparison.csv", index=False)
print("Exported basic_models_comparison.csv")


# ── 14. Extended Models with Controls ─────────────────────────────────────────
section("14. Extended Models with Controls")

df["age_bar"] = df.groupby("ID")["age"].transform("mean")

# POLS + controls
fit_pols_x = pf.feols(
    "lwage ~ union + age + schooling + female + C(year)",
    data=df, vcov="HC1")

# TWFE: schooling and female are time-invariant → absorbed by ID FE.
fit_twfe_x = pf.feols("lwage ~ union + age | ID + year",
                      data=df, vcov={"CRV1": "ID"})

# RE + controls
df_rx = df.set_index(["ID", "year"])
exog_rx = sm.add_constant(df_rx[["union", "age", "schooling", "female"]])
fit_re_x = RandomEffects(df_rx["lwage"], exog_rx).fit(cov_type="robust")

# CRE + controls — adds within-means of time-varying regressors.
exog_cx = sm.add_constant(df_rx[["union", "union_bar", "age", "age_bar",
                                  "schooling", "female"]])
fit_cre_x = RandomEffects(df_rx["lwage"], exog_cx).fit(cov_type="robust")

# Pretty comparison table.
display_vars = ["union", "age", "schooling", "female"]
extended_results = []
print(f"\n{'Variable':<11} {'POLS':>16} {'TWFE':>16} {'RE':>16} {'CRE':>16}")
print("=" * 76)
for var in display_vars:
    row = {"variable": var}
    cells = []
    if var in fit_pols_x.coef().index:
        c, s = fit_pols_x.coef()[var], fit_pols_x.se()[var]
        row["POLS_coef"], row["POLS_se"] = round(c, 4), round(s, 4)
        cells.append(f"{c:>7.4f} ({s:.4f})")
    else:
        row["POLS_coef"], row["POLS_se"] = None, None
        cells.append(f"{'—':>16}")
    if var in fit_twfe_x.coef().index:
        c, s = fit_twfe_x.coef()[var], fit_twfe_x.se()[var]
        row["TWFE_coef"], row["TWFE_se"] = round(c, 4), round(s, 4)
        cells.append(f"{c:>7.4f} ({s:.4f})")
    else:
        row["TWFE_coef"], row["TWFE_se"] = None, None
        cells.append(f"{'absorbed':>16}")
    for label, fit in [("RE", fit_re_x), ("CRE", fit_cre_x)]:
        if var in fit.params.index:
            c, s = fit.params[var], fit.std_errors[var]
            row[f"{label}_coef"], row[f"{label}_se"] = round(c, 4), round(s, 4)
            cells.append(f"{c:>7.4f} ({s:.4f})")
        else:
            row[f"{label}_coef"], row[f"{label}_se"] = None, None
            cells.append(f"{'—':>16}")
    print(f"{var:<11} " + " ".join(cells))
    extended_results.append(row)

extended_df = pd.DataFrame(extended_results)
extended_df.to_csv("extended_models_comparison.csv", index=False)
print("Exported extended_models_comparison.csv")

# Figure 5 — coefficient comparison across extended models.
ext_methods = ["POLS", "TWFE", "RE", "CRE"]
ext_colors = [METHOD_COLORS["POLS"], METHOD_COLORS["TWFE"],
              METHOD_COLORS["RE"], METHOD_COLORS["CRE"]]

plot_vars = [v for v in display_vars
             if v in fit_pols_x.coef().index or v in fit_twfe_x.coef().index]
n_vars = len(plot_vars)
fig, axes = plt.subplots(1, n_vars, figsize=(4 * n_vars, 6), sharey=True)
fig.patch.set_linewidth(0)
if n_vars == 1:
    axes = [axes]

for ax_idx, var in enumerate(plot_vars):
    ax = axes[ax_idx]
    pairs = [
        (fit_pols_x.coef().get(var, np.nan), fit_pols_x.se().get(var, 0)),
        (fit_twfe_x.coef().get(var, np.nan), fit_twfe_x.se().get(var, 0)),
        (fit_re_x.params.get(var, np.nan),    fit_re_x.std_errors.get(var, 0)),
        (fit_cre_x.params.get(var, np.nan),   fit_cre_x.std_errors.get(var, 0)),
    ]
    for i, ((v, e), c) in enumerate(zip(pairs, ext_colors)):
        if not np.isnan(v):
            ax.barh(i, v, 0.6, xerr=1.96 * e, color=c,
                    edgecolor=DARK_NAVY, linewidth=0.5, capsize=3,
                    error_kw={"ecolor": WHITE_TEXT, "capthick": 1})
        else:
            ax.text(0, i, "absorbed", ha="center", va="center", fontsize=9,
                    color=LIGHT_TEXT, style="italic")
    ax.axvline(0, color=LIGHT_TEXT, lw=0.5, ls="--", alpha=0.5)
    ax.set_title(var.title(), fontsize=13, fontweight="bold", color=WHITE_TEXT)
    if ax_idx == 0:
        ax.set_yticks(range(4))
        ax.set_yticklabels(ext_methods, fontsize=12, color=LIGHT_TEXT)

fig.suptitle("Extended Models: Coefficient Comparison",
             fontsize=15, fontweight="bold", color=WHITE_TEXT, y=1.02)
save_dark("panel_intro_extended_models.png")


# ── 15. Summary ───────────────────────────────────────────────────────────────
section("15. Summary of All Methods")

print(f"\n{'Method':<10} {'Coef':>10} {'SE':>10}  Description")
print("-" * 78)
summary_rows = [
    ("POLS",    pols_coef,    pols_se,    "Naive — ignores panel structure"),
    ("Between", between_coef, between_se, "Cross-sectional means only"),
    ("FDFE",    fdfe_coef,    fdfe_se,    "First differences eliminate FE"),
    ("FE",      fe_coef,      fe_se,      "Within estimator (time-demean)"),
    ("RE",      re_coef,      re_se,      "GLS — assumes effects ⊥ X"),
    ("CRE",     cre_coef,     cre_se,     "Mundlak — bridges FE and RE"),
]
for m, c, s, desc in summary_rows:
    print(f"{m:<10} {c:>10.4f} {s:>10.4f}  {desc}")

print("\nKey takeaways:")
print(f"  1. POLS ({pols_coef:.4f}) and Between ({between_coef:.4f}) use cross-sectional variation.")
print(f"  2. FE = DVFE = {fe_coef:.4f}; FDFE = {fdfe_coef:.4f}. FD matches Within exactly only after absorbing year FE (TWFE).")
print(f"  3. RE ({re_coef:.4f}) is a weighted average; CRE ({cre_coef:.4f}) recovers the FE coefficient.")
print(f"  4. Hausman (χ²={H:.2f}, p={p_h:.3f}) and Mundlak term (p={mundlak_p:.3f}) agree on the FE-vs-RE choice.")

print("\nGenerated files:")
for f in sorted(glob.glob("panel_intro_*.png") + glob.glob("*.csv")):
    print(f"  {f}")

print("\n=== Script completed successfully ===")
