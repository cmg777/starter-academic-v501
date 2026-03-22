"""
Multiscale Geographically Weighted Regression (MGWR) for Regional
Economic Convergence in Indonesia

Analyzes whether economic catching-up varies across Indonesia's 514
districts using MGWR, which allows each variable to operate at its
own spatial scale.

Usage:
    python script.py

References:
    - Fotheringham et al. (2017). Multiscale GWR.
    - Oshan et al. (2019). mgwr Python package.
    - Mendez & Jiang — GWR/MGWR convergence tutorial.
"""

import numpy as np
import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
import mapclassify
from scipy import stats
from mgwr.gwr import MGWR
from mgwr.sel_bw import Sel_BW
import warnings
warnings.filterwarnings("ignore")

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

# ── Step 1: Load data ────────────────────────────────────────────
CSV_URL = ("https://github.com/quarcs-lab/data-quarcs/raw/refs/heads/"
           "master/indonesia514/dataBeta.csv")
GEO_URL = ("https://github.com/quarcs-lab/data-quarcs/raw/refs/heads/"
           "master/indonesia514/mapIdonesia514-opt.geojson")

df = pd.read_csv(CSV_URL)
geo = gpd.read_file(GEO_URL)
gdf = geo.merge(df, on="districtID", how="left")

print(f"Loaded: {gdf.shape[0]} districts, {gdf.shape[1]} columns")
print(f"CRS: {gdf.crs}")

print("\n── Key variables ──")
print(gdf[["ln_gdppc2010", "g"]].describe().round(4).to_string())

# ── Step 2: Exploratory maps ────────────────────────────────────

# Figure 1: 2-panel choropleth (initial income + growth)
fig, axes = plt.subplots(2, 1, figsize=(14, 14))
fig.patch.set_facecolor(DARK_NAVY)
fig.patch.set_linewidth(0)

for ax, col, title, cmap_name in [
    (axes[0], "ln_gdppc2010", "(a) Log GDP per capita, 2010", "coolwarm"),
    (axes[1], "g", "(b) GDP growth rate, 2010–2018", "coolwarm"),
]:
    # Fisher-Jenks classification
    fj = mapclassify.FisherJenks(gdf[col].dropna().values, k=5)
    breaks = fj.bins.tolist()

    class_labels = []
    lower = round(gdf[col].min(), 2)
    for b in breaks:
        class_labels.append(f"{lower:.2f} – {round(b, 2):.2f}")
        lower = round(b, 2)

    # Classify all values
    classified = mapclassify.UserDefined(gdf[col].values, bins=breaks)
    cmap = plt.cm.coolwarm
    norm = plt.Normalize(vmin=0, vmax=len(breaks) - 1)
    colors = [cmap(norm(c)) for c in classified.yb]

    gdf.plot(ax=ax, color=colors, edgecolor=GRID_LINE, linewidth=0.2)
    ax.set_facecolor(DARK_NAVY)
    ax.set_title(title, fontsize=14, color=WHITE_TEXT, pad=10)
    ax.set_axis_off()

    # Legend with counts
    counts = np.bincount(classified.yb, minlength=len(breaks))
    handles = [Patch(facecolor=cmap(norm(i)), edgecolor=GRID_LINE,
               label=f"{cl}  (n={c})")
               for i, (cl, c) in enumerate(zip(class_labels, counts))]
    leg = ax.legend(handles=handles, loc="lower left",
                    fontsize=9, title_fontsize=10)
    leg.set_frame_on(True)
    leg.get_frame().set_facecolor("#1a1a2e")
    leg.get_frame().set_edgecolor(LIGHT_TEXT)
    leg.get_frame().set_alpha(0.9)
    for text in leg.get_texts():
        text.set_color(WHITE_TEXT)

plt.tight_layout()
plt.savefig("mgwr_map_xy.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# ── Step 3: Global regression baseline ──────────────────────────

slope, intercept, r_value, p_value, std_err = stats.linregress(
    gdf["ln_gdppc2010"], gdf["g"]
)
r_squared = r_value**2

print("\n── Global OLS regression ──")
print(f"Intercept: {intercept:.4f}")
print(f"Slope (convergence coefficient): {slope:.4f}")
print(f"R-squared: {r_squared:.4f}")
print(f"p-value: {p_value:.6f}")

# Figure 2: Scatter + regression line
fig, ax = plt.subplots(figsize=(10, 7))
fig.patch.set_linewidth(0)

ax.scatter(gdf["ln_gdppc2010"], gdf["g"],
           color=STEEL_BLUE, edgecolors=GRID_LINE, s=35, alpha=0.6, zorder=3)

x_range = np.linspace(gdf["ln_gdppc2010"].min(), gdf["ln_gdppc2010"].max(), 100)
ax.plot(x_range, intercept + slope * x_range, color=WARM_ORANGE,
        linewidth=2, zorder=2)

ax.set_xlabel("Log GDP per capita (2010)")
ax.set_ylabel("GDP growth rate (2010–2018)")
ax.set_title("Global convergence regression")

# Stats annotation
stars = "***" if p_value < 0.01 else "**" if p_value < 0.05 else ""
ax.text(0.95, 0.95,
        f"Slope: {slope:.3f}{stars}\nR² = {r_squared:.3f}",
        transform=ax.transAxes, fontsize=13,
        verticalalignment="top", horizontalalignment="right",
        bbox=dict(facecolor="#1a1a2e", edgecolor=LIGHT_TEXT, alpha=0.9),
        color=WHITE_TEXT)

plt.savefig("mgwr_scatter_global.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# ── Step 4: MGWR estimation ─────────────────────────────────────

# Prepare variables
y = gdf["g"].values.reshape((-1, 1))
X = gdf[["ln_gdppc2010"]].values
coords = list(zip(gdf["COORD_X"], gdf["COORD_Y"]))

# Standardize (required for MGWR bandwidth comparability)
Zy = (y - y.mean(axis=0)) / y.std(axis=0)
ZX = (X - X.mean(axis=0)) / X.std(axis=0)

print("\n── MGWR estimation ──")
print("Selecting bandwidths (this may take a moment)...")

# Bandwidth selection
mgwr_selector = Sel_BW(coords, Zy, ZX, multi=True, spherical=True)
mgwr_bw = mgwr_selector.search()

# Fit MGWR
mgwr_results = MGWR(coords, Zy, ZX, mgwr_selector, spherical=True).fit()

# Print summary
mgwr_results.summary()

# Extract key results
print("\n── MGWR key results ──")
print(f"Bandwidths: {mgwr_bw}")
print(f"R-squared: {mgwr_results.R2:.4f}")
print(f"Adjusted R-squared: {mgwr_results.adj_R2:.4f}")
print(f"AICc: {mgwr_results.aicc:.2f}")

# Compare with global
print(f"\nR² improvement: {r_squared:.3f} (global) → {mgwr_results.R2:.3f} (MGWR)")

# ── Step 5: Map MGWR coefficients ───────────────────────────────

# Add coefficients to GeoDataFrame
gdf["mgwr_intercept"] = mgwr_results.params[:, 0]
gdf["mgwr_slope"] = mgwr_results.params[:, 1]

# Figure 3: MGWR intercept map
fig, ax = plt.subplots(figsize=(14, 8))
fig.patch.set_facecolor(DARK_NAVY)
fig.patch.set_linewidth(0)

fj_int = mapclassify.FisherJenks(gdf["mgwr_intercept"].values, k=5)
breaks_int = fj_int.bins.tolist()
class_labels_int = []
lower = round(gdf["mgwr_intercept"].min(), 2)
for b in breaks_int:
    class_labels_int.append(f"{lower:.2f} – {round(b, 2):.2f}")
    lower = round(b, 2)

cmap_div = plt.cm.coolwarm
norm_int = plt.Normalize(vmin=0, vmax=len(breaks_int) - 1)
colors_int = [cmap_div(norm_int(c)) for c in fj_int.yb]

gdf.plot(ax=ax, color=colors_int, edgecolor=GRID_LINE, linewidth=0.2)
ax.set_facecolor(DARK_NAVY)
ax.set_title(f"MGWR intercept (bandwidth = {int(mgwr_bw[0])})",
             fontsize=14, color=WHITE_TEXT, pad=10)
ax.set_axis_off()

counts_int = np.bincount(fj_int.yb, minlength=len(breaks_int))
handles_int = [Patch(facecolor=cmap_div(norm_int(i)), edgecolor=GRID_LINE,
               label=f"{cl}  (n={c})")
               for i, (cl, c) in enumerate(zip(class_labels_int, counts_int))]
leg = ax.legend(handles=handles_int, loc="lower left",
                fontsize=10, title="Intercept", title_fontsize=11)
leg.set_frame_on(True)
leg.get_frame().set_facecolor("#1a1a2e")
leg.get_frame().set_edgecolor(LIGHT_TEXT)
leg.get_frame().set_alpha(0.9)
for text in leg.get_texts():
    text.set_color(WHITE_TEXT)
leg.get_title().set_color(WHITE_TEXT)

plt.savefig("mgwr_mgwr_intercept.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# Figure 4: MGWR slope (convergence coefficient) map
fig, ax = plt.subplots(figsize=(14, 8))
fig.patch.set_facecolor(DARK_NAVY)
fig.patch.set_linewidth(0)

fj_slope = mapclassify.FisherJenks(gdf["mgwr_slope"].values, k=5)
breaks_slope = fj_slope.bins.tolist()
class_labels_slope = []
lower = round(gdf["mgwr_slope"].min(), 2)
for b in breaks_slope:
    class_labels_slope.append(f"{lower:.2f} – {round(b, 2):.2f}")
    lower = round(b, 2)

norm_slope = plt.Normalize(vmin=0, vmax=len(breaks_slope) - 1)
colors_slope = [cmap_div(norm_slope(c)) for c in fj_slope.yb]

gdf.plot(ax=ax, color=colors_slope, edgecolor=GRID_LINE, linewidth=0.2)
ax.set_facecolor(DARK_NAVY)
ax.set_title(f"MGWR convergence coefficient (bandwidth = {int(mgwr_bw[1])})",
             fontsize=14, color=WHITE_TEXT, pad=10)
ax.set_axis_off()

counts_slope = np.bincount(fj_slope.yb, minlength=len(breaks_slope))
handles_slope = [Patch(facecolor=cmap_div(norm_slope(i)), edgecolor=GRID_LINE,
                 label=f"{cl}  (n={c})")
                 for i, (cl, c) in enumerate(zip(class_labels_slope, counts_slope))]
leg = ax.legend(handles=handles_slope, loc="lower left",
                fontsize=10, title="Convergence coeff.", title_fontsize=11)
leg.set_frame_on(True)
leg.get_frame().set_facecolor("#1a1a2e")
leg.get_frame().set_edgecolor(LIGHT_TEXT)
leg.get_frame().set_alpha(0.9)
for text in leg.get_texts():
    text.set_color(WHITE_TEXT)
leg.get_title().set_color(WHITE_TEXT)

plt.savefig("mgwr_mgwr_slope.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# ── Step 6: Statistical significance ────────────────────────────

# Filter t-values for significance (corrected for multiple testing)
mgwr_filtered_t = mgwr_results.filter_tvals()

# Figure 5: Significance map for convergence coefficient
fig, ax = plt.subplots(figsize=(14, 8))
fig.patch.set_facecolor(DARK_NAVY)
fig.patch.set_linewidth(0)

# Classify: significant negative, not significant, significant positive
slope_vals = gdf["mgwr_slope"].values
t_sig = mgwr_filtered_t[:, 1]  # t-values for slope (column 1)

sig_cats = np.where(t_sig < 0, "Negative (catching-up)",
           np.where(t_sig > 0, "Positive (diverging)", "Not significant"))

cat_colors = {
    "Negative (catching-up)": "#2c7bb6",
    "Not significant": GRID_LINE,
    "Positive (diverging)": "#d7191c",
}
colors_sig = [cat_colors[c] for c in sig_cats]

gdf.plot(ax=ax, color=colors_sig, edgecolor=GRID_LINE, linewidth=0.2)
ax.set_facecolor(DARK_NAVY)
ax.set_title("MGWR convergence coefficient: statistical significance",
             fontsize=14, color=WHITE_TEXT, pad=10)
ax.set_axis_off()

handles_sig = [
    Patch(facecolor="#2c7bb6", edgecolor=GRID_LINE,
          label=f"Negative — catching-up (n={(sig_cats == 'Negative (catching-up)').sum()})"),
    Patch(facecolor=GRID_LINE, edgecolor=LIGHT_TEXT,
          label=f"Not significant (n={(sig_cats == 'Not significant').sum()})"),
    Patch(facecolor="#d7191c", edgecolor=GRID_LINE,
          label=f"Positive — diverging (n={(sig_cats == 'Positive (diverging)').sum()})"),
]

leg = ax.legend(handles=handles_sig, loc="lower left",
                fontsize=10, title="Significance (corrected)", title_fontsize=11)
leg.set_frame_on(True)
leg.get_frame().set_facecolor("#1a1a2e")
leg.get_frame().set_edgecolor(LIGHT_TEXT)
leg.get_frame().set_alpha(0.9)
for text in leg.get_texts():
    text.set_color(WHITE_TEXT)
leg.get_title().set_color(WHITE_TEXT)

plt.savefig("mgwr_mgwr_significance.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# Print significance summary
print("\n── Significance summary (corrected) ──")
print(f"  Negative (catching-up): {(sig_cats == 'Negative (catching-up)').sum()}")
print(f"  Not significant: {(sig_cats == 'Not significant').sum()}")
print(f"  Positive (diverging): {(sig_cats == 'Positive (diverging)').sum()}")

# ── Step 7: Model comparison table ──────────────────────────────
print("\n── Model comparison ──")
# Global AICc and Adj. R² from MGWR summary (standardized model)
aicc_global = 1341.25
adj_r2_global = 0.212

print(f"{'Metric':<25} {'Global OLS':>12} {'MGWR':>12}")
print(f"{'-'*25} {'-'*12} {'-'*12}")
print(f"{'R²':<25} {r_squared:>12.4f} {mgwr_results.R2:>12.4f}")
print(f"{'Adj. R²':<25} {adj_r2_global:>12.4f} {mgwr_results.adj_R2:>12.4f}")
print(f"{'AICc':<25} {aicc_global:>12.2f} {mgwr_results.aicc:>12.2f}")
print(f"{'Bandwidth (intercept)':<25} {'all (514)':>12} {int(mgwr_bw[0]):>12}")
print(f"{'Bandwidth (slope)':<25} {'all (514)':>12} {int(mgwr_bw[1]):>12}")

print("\nDone! All figures generated.")
