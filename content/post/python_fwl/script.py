"""
The FWL Theorem: Making Multivariate Regressions Intuitive

Demonstrates the Frisch-Waugh-Lovell theorem using a simulated retail
store dataset where coupon usage affects sales but is confounded by
neighborhood income.

Usage:
    python script.py

References:
    - Frisch & Waugh (1933). Partial Time Regressions as Compared with
      Individual Trends. Econometrica.
    - Lovell (1963). Seasonal Adjustment of Economic Time Series and
      Multiple Regression Analysis. JASA.
    - Courthoud (2022). The FWL Theorem, Or How To Make All Regressions
      Intuitive. Towards Data Science.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels.formula.api as smf

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


# ── Data Generating Process ──────────────────────────────────────────

def simulate_store_data(n=50, seed=42):
    """Simulate retail store data with confounding by income.

    True DGP:
        income   ~ N(50, 10)
        dayofweek ~ Uniform{1, ..., 7}
        coupons  = 60 - 0.5 * income + N(0, 5)
        sales    = 10 + 0.2 * coupons + 0.3 * income + 0.5 * dayofweek + N(0, 3)

    The true causal effect of coupons on sales is +0.2.
    """
    rng = np.random.default_rng(seed)
    income = rng.normal(50, 10, n)
    dayofweek = rng.integers(1, 8, n)
    coupons = 60 - 0.5 * income + rng.normal(0, 5, n)
    sales = (10 + 0.2 * coupons + 0.3 * income
             + 0.5 * dayofweek + rng.normal(0, 3, n))
    return pd.DataFrame({
        "sales": np.round(sales, 2),
        "coupons": np.round(coupons, 2),
        "income": np.round(income, 2),
        "dayofweek": dayofweek,
    })


# ── Generate data ────────────────────────────────────────────────────

N = 50
df = simulate_store_data(n=N, seed=RANDOM_SEED)

print("Dataset shape:", df.shape)
print()
print(df.head())
print()
print(df.describe().round(2))

# ── Naive regression ─────────────────────────────────────────────────

naive_model = smf.ols("sales ~ coupons", df).fit()
print("\n=== Naive regression: sales ~ coupons ===")
print(naive_model.summary().tables[1])

# ── Multiple regression (controlling for income) ─────────────────────

full_model = smf.ols("sales ~ coupons + income", df).fit()
print("\n=== Full regression: sales ~ coupons + income ===")
print(full_model.summary().tables[1])

# ── FWL Step 1: residualize coupons only ─────────────────────────────

df["coupons_tilde"] = smf.ols("coupons ~ income", df).fit().resid

fwl_step1 = smf.ols("sales ~ coupons_tilde - 1", df).fit()
print("\n=== FWL Step 1: sales ~ coupons_tilde (no intercept) ===")
print(fwl_step1.summary().tables[1])

# ── FWL Step 2: residualize both ─────────────────────────────────────

df["sales_tilde"] = smf.ols("sales ~ income", df).fit().resid

fwl_step2 = smf.ols("sales_tilde ~ coupons_tilde - 1", df).fit()
print("\n=== FWL Step 2: sales_tilde ~ coupons_tilde (no intercept) ===")
print(fwl_step2.summary().tables[1])

# ── Multiple controls: income + dayofweek ────────────────────────────

full_model_2 = smf.ols("sales ~ coupons + income + dayofweek", df).fit()
print("\n=== Full regression with multiple controls ===")
print(full_model_2.summary().tables[1])

df["coupons_tilde_2"] = smf.ols("coupons ~ income + dayofweek", df).fit().resid
df["sales_tilde_2"] = smf.ols("sales ~ income + dayofweek", df).fit().resid

fwl_multi = smf.ols("sales_tilde_2 ~ coupons_tilde_2 - 1", df).fit()
print("\n=== FWL with multiple controls ===")
print(fwl_multi.summary().tables[1])

# ── Scaled residuals ─────────────────────────────────────────────────

df["coupons_tilde_scaled"] = df["coupons_tilde"] + df["coupons"].mean()
df["sales_tilde_scaled"] = df["sales_tilde"] + df["sales"].mean()

scaled_model = smf.ols("sales_tilde_scaled ~ coupons_tilde_scaled", df).fit()
print("\n=== Scaled residuals regression ===")
print(scaled_model.summary().tables[1])

# ── Predicted values for residual visualization ──────────────────────

df["coupons_hat"] = smf.ols("coupons ~ income", df).fit().predict()


# ── Auxiliary regressions for annotations ───────────────────────────
coupons_on_income = smf.ols("coupons ~ income", df).fit()


def annotate_eq(ax, model, xname="x", yname="y", loc="lower left",
                no_intercept=False):
    """Add equation and R² annotation to an axes."""
    if no_intercept:
        b = model.params.iloc[0]
        sign = "+" if b >= 0 else "−"
        eq = f"{yname} = {sign}{abs(b):.2f}{xname}"
    else:
        b0 = model.params["Intercept"]
        b1 = model.params.iloc[1]
        sign = "+" if b1 >= 0 else "−"
        eq = f"{yname} = {b0:.2f} {sign} {abs(b1):.2f}{xname}"
    r2 = model.rsquared
    txt = f"{eq}\n$R^2$ = {r2:.3f}"
    # Position mapping
    coords = {
        "lower left":  (0.05, 0.05, "left",  "bottom"),
        "lower right": (0.95, 0.05, "right", "bottom"),
        "upper left":  (0.05, 0.95, "left",  "top"),
        "upper right": (0.95, 0.95, "right", "top"),
    }
    x, y, ha, va = coords[loc]
    ax.text(x, y, txt, transform=ax.transAxes, fontsize=11,
            color=WARM_ORANGE, ha=ha, va=va, linespacing=1.5)


# ═══════════════════════════════════════════════════════════════════════
# FIGURES
# ═══════════════════════════════════════════════════════════════════════

# ── Figure 1: Naive regression ───────────────────────────────────────

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_linewidth(0)
ax.scatter(df["coupons"], df["sales"], color=STEEL_BLUE, alpha=0.75,
           edgecolors=DARK_NAVY, s=80, linewidths=0.8, zorder=3,
           label="Stores")
sns.regplot(x="coupons", y="sales", data=df, ci=False, scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5,
                      "label": "Linear fit", "zorder": 2},
            ax=ax)
ax.set_xlabel("Coupon usage (%)")
ax.set_ylabel("Daily sales (thousands $)")
ax.set_title("Naive relationship: Sales vs. coupon usage",
             fontsize=14, fontweight="bold", color=WHITE_TEXT, pad=12)
annotate_eq(ax, naive_model, xname="x", loc="lower left")
ax.legend(loc="upper right")
plt.tight_layout()
plt.savefig("fwl_naive_regression.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
print("Saved: fwl_naive_regression.png")

# ── Figure 2: Residuals visualization ────────────────────────────────

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_linewidth(0)
ax.vlines(df["income"],
          np.minimum(df["coupons"], df["coupons_hat"]),
          np.maximum(df["coupons"], df["coupons_hat"]),
          linestyle="--", color=LIGHT_TEXT, alpha=0.4, linewidth=0.9,
          label="Residuals", zorder=1)
ax.scatter(df["income"], df["coupons"], color=STEEL_BLUE, alpha=0.75,
           edgecolors=DARK_NAVY, s=80, linewidths=0.8, zorder=3,
           label="Stores")
sns.regplot(x="income", y="coupons", data=df, ci=False, scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5,
                      "label": "Linear fit", "zorder": 2},
            ax=ax)
ax.set_xlabel("Neighborhood income (thousands $)")
ax.set_ylabel("Coupon usage (%)")
ax.set_title("Partialling-out: removing income's effect on coupons",
             fontsize=14, fontweight="bold", color=WHITE_TEXT, pad=12)
annotate_eq(ax, coupons_on_income, xname="x", loc="lower left")
ax.legend(loc="upper right")
plt.tight_layout()
plt.savefig("fwl_residuals_income.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
print("Saved: fwl_residuals_income.png")

# ── Figure 3: Partialled-out relationship ────────────────────────────

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_linewidth(0)
ax.scatter(df["coupons_tilde"], df["sales_tilde"], color=STEEL_BLUE,
           alpha=0.75, edgecolors=DARK_NAVY, s=80, linewidths=0.8, zorder=3,
           label="Stores (residualized)")
sns.regplot(x="coupons_tilde", y="sales_tilde", data=df, ci=False,
            scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5,
                      "label": "Linear fit", "zorder": 2},
            ax=ax)
ax.set_xlabel("Residual coupon usage")
ax.set_ylabel("Residual sales")
ax.set_title("Conditional relationship after partialling-out income",
             fontsize=14, fontweight="bold", color=WHITE_TEXT, pad=12)
# Use model with intercept for proper R²
_resid_model = smf.ols("sales_tilde ~ coupons_tilde", df).fit()
annotate_eq(ax, _resid_model, xname="x", loc="lower right")
ax.legend(loc="upper left")
plt.tight_layout()
plt.savefig("fwl_partialled_out.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
print("Saved: fwl_partialled_out.png")

# ── Figure 4: Scaled residuals ───────────────────────────────────────

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_linewidth(0)
ax.scatter(df["coupons_tilde_scaled"], df["sales_tilde_scaled"],
           color=STEEL_BLUE, alpha=0.75, edgecolors=DARK_NAVY, s=80,
           linewidths=0.8, zorder=3,
           label="Stores (residualized + scaled)")
sns.regplot(x="coupons_tilde_scaled", y="sales_tilde_scaled", data=df,
            ci=False, scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5,
                      "label": "Linear fit", "zorder": 2},
            ax=ax)
ax.set_xlabel("Coupon usage (%, residualized + mean)")
ax.set_ylabel("Daily sales (thousands $, residualized + mean)")
ax.set_title("Scaled residuals: interpretable magnitudes",
             fontsize=14, fontweight="bold", color=WHITE_TEXT, pad=12)
annotate_eq(ax, scaled_model, xname="x", loc="lower right")
ax.legend(loc="upper left")
plt.tight_layout()
plt.savefig("fwl_scaled_residuals.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
print("Saved: fwl_scaled_residuals.png")

# ── Figure 5: Side-by-side comparison ────────────────────────────────

fig, axes = plt.subplots(1, 2, figsize=(14, 6))
fig.patch.set_linewidth(0)

# Left panel: naive
axes[0].scatter(df["coupons"], df["sales"], color=STEEL_BLUE, alpha=0.75,
                edgecolors=DARK_NAVY, s=80, linewidths=0.8, zorder=3)
sns.regplot(x="coupons", y="sales", data=df, ci=False, scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5, "zorder": 2},
            ax=axes[0])
axes[0].set_xlabel("Coupon usage (%)")
axes[0].set_ylabel("Daily sales (thousands $)")
axes[0].set_title("Naive (no controls)", fontsize=13, fontweight="bold",
                  color=WHITE_TEXT, pad=10)
annotate_eq(axes[0], naive_model, xname="x", loc="lower left")

# Right panel: partialled-out (scaled)
axes[1].scatter(df["coupons_tilde_scaled"], df["sales_tilde_scaled"],
                color=TEAL, alpha=0.75, edgecolors=DARK_NAVY, s=80,
                linewidths=0.8, zorder=3)
sns.regplot(x="coupons_tilde_scaled", y="sales_tilde_scaled", data=df,
            ci=False, scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5, "zorder": 2},
            ax=axes[1])
axes[1].set_xlabel("Coupon usage (%, after partialling-out)")
axes[1].set_ylabel("Daily sales (thousands $, after partialling-out)")
axes[1].set_title("After partialling-out income (FWL)", fontsize=13,
                  fontweight="bold", color=WHITE_TEXT, pad=10)
annotate_eq(axes[1], scaled_model, xname="x", loc="lower right")

plt.suptitle("Simpson's paradox resolved: the FWL theorem reveals the true relationship",
             fontsize=14, fontweight="bold", color=WHITE_TEXT, y=1.02)
plt.tight_layout()
plt.savefig("fwl_comparison.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()
print("Saved: fwl_comparison.png")

# ── Featured image ───────────────────────────────────────────────────

# Copy comparison figure as featured image
import shutil
shutil.copy("fwl_comparison.png", "featured.png")
print("Saved: featured.png")

print("\n=== All figures generated successfully ===")
