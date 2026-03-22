"""
Exploratory Spatial Data Analysis of Subnational Human Development in South America

Performs ESDA on the Subnational Human Development Index (SHDI) for 153 regions
across 12 South American countries, comparing 2013 and 2019. Covers scatter plots,
choropleth maps, spatial weights, global/local Moran's I, LISA cluster maps, and
space-time dynamics using PySAL.

Usage:
    python script.py

References:
    - Anselin, L. (1995). Local Indicators of Spatial Association — LISA.
    - Rey, S. J. and Anselin, L. (2007). PySAL.
    - https://pysal.org/esda/
    - https://splot.readthedocs.io/
    - https://globaldatalab.org/shdi/
"""

import numpy as np
import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Patch
import mapclassify
from libpysal.weights import Queen
from esda.moran import Moran, Moran_Local
from splot.esda import moran_scatterplot, lisa_cluster
from splot.libpysal import plot_spatial_weights
from libpysal.weights import lag_spatial
from adjustText import adjust_text

# Reproducibility
RANDOM_SEED = 42

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

# ── Step 1: Load data ────────────────────────────────────────────
DATA_URL = "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_esda2/data.geojson"
from pathlib import Path
gdf = gpd.read_file(Path("data.geojson") if Path("data.geojson").exists() else DATA_URL)
print(f"Loaded: {gdf.shape[0]} rows, {gdf.shape[1]} columns")
print(f"Countries: {gdf['country'].nunique()}")
print(f"CRS: {gdf.crs}")

# ── Data transformations ─────────────────────────────────────────

# Country name → ISO 3166-1 alpha-3 code
COUNTRY_ISO = {
    "Argentina": "ARG", "Bolivia": "BOL", "Brazil": "BRA",
    "Chili": "CHL", "Colombia": "COL", "Ecuador": "ECU",
    "Guyana": "GUY", "Paraguay": "PRY", "Peru": "PER",
    "Suriname": "SUR", "Uruguay": "URY", "Venezuela": "VEN",
}
gdf["country_iso"] = gdf["country"].map(COUNTRY_ISO)

# Simplify long region names
RENAME = {
    "Catamarca, La Rioja, San Juan": "Catamarca-La Rioja",
    "Corrientes, Entre Rios, Misiones": "Corrientes-Misiones",
    "Chubut, Neuquen, Rio Negro, Santa Cruz, Tierra del Fuego": "Patagonia",
    "La Pampa, San Luis, Mendoza": "La Pampa-Mendoza",
    "Santiago del Estero, Tucuman": "Tucuman-Sgo Estero",
    "Tarapaca (incl Arica and Parinacota)": "Tarapaca",
    "Valparaiso (former Aconcagua)": "Valparaiso",
    "Los Lagos (incl Los Rios)": "Los Lagos",
    "Magallanes and La Antartica Chilena": "Magallanes",
    "Antioquia (incl Medellin)": "Antioquia",
    "Atlantico (incl Barranquilla)": "Atlantico",
    "Bolivar (Sur and Norte)": "Bolivar",
    "Essequibo Islands-West Demerara": "Essequibo-W Demerara",
    "East Berbice-Corentyne": "E Berbice-Corentyne",
    "Upper Takutu-Upper Essequibo": "Upper Takutu-Essequibo",
    "Upper Demerara-Berbice": "Upper Demerara",
    "Cuyuni-Mazaruni-Upper Essequibo": "Cuyuni-Mazaruni",
    "North (Tumbes, Piura, Lambayeque, Cajamarca, La Libertad)": "North",
    "North East (Amazonas, Loreto, San Martin, Ucayali)": "North East",
    "East (Madre de Dios, Cusco, Puno, Apurimac)": "East",
    "South (Tacna, Moquegua, Arequipa, Ica, Ayacucho)": "South",
    "West (Ancash, Lima, Callao)": "West (Lima)",
    "Central (Huancavelica, Huanuco, Junin, Pasco)": "Central",
    "North-West (Boqueron, Alto Paraguay, Presidente Hayes, Conception, Amambay, San pedro, Cordillera)": "North-West",
    "North-East (Caaguazu, Alto Parana, Canideyu)": "North-East",
    "South-West (Caazapa, Itapua)": "South-West",
    "South-East (Guaira, Misiones, Paraguari, Neembucu)": "South-East",
    "Central (Asuncion, Central)": "Central (Asuncion)",
    "Nickerie, Coronie and Saramacca": "Nickerie-Saramacca",
    "Commewijne and Marowijne": "Commewijne-Marowijne",
    "Brokopondo and Sipaliwini": "Brokopondo-Sipaliwini",
    "Montevideo and Metropolitan area": "Montevideo",
    "Norte (Artigas, Rivera, Cerro Largo and Trienta y Tres)": "Norte",
    "Costa Este (Canelones, Maldonado and Rocha)": "Costa Este",
    "Litoral Sur (Soriano, Colonia and San Jose)": "Litoral Sur",
    "Centro (Durazno and Tacuarembo)": "Centro",
    "Centro Sur (Flores, Florida and Lavalleja)": "Centro Sur",
    "Litoral Norte (Paysandu, Salto and Rio Negro)": "Litoral Norte",
    "Amazonas Federal Territory": "Amazonas FT",
    "Amacuros Delta Federal Territory": "Amacuros Delta FT",
    "Region Metropolitana": "R. Metropolitana",
    "Federal District": "Federal Dist.",
    "City of Buenos Aires": "C. Buenos Aires",
}
gdf["region"] = gdf["region"].replace(RENAME)

# Create region_country label column
gdf["region_country"] = gdf["region"] + " (" + gdf["country_iso"] + ")"

print(f"\nSample region_country labels:")
for i in [0, 50, 100, 150]:
    print(f"  {gdf.loc[i, 'region_country']}")

# Compute change columns
gdf["shdi_change"] = gdf["shdi2019"] - gdf["shdi2013"]
gdf["health_change"] = gdf["healthindex2019"] - gdf["healthindex2013"]
gdf["educ_change"] = gdf["edindex2019"] - gdf["edindex2013"]
gdf["income_change"] = gdf["incindex2019"] - gdf["incindex2013"]

# Descriptive statistics
print("\n── Descriptive statistics ──")
stats_cols = ["shdi2013", "shdi2019", "shdi_change"]
print(gdf[stats_cols].describe().round(4).to_string())

improved = (gdf["shdi_change"] > 0).sum()
declined = (gdf["shdi_change"] < 0).sum()
unchanged = (gdf["shdi_change"] == 0).sum()
print(f"\nRegions improved: {improved}")
print(f"Regions declined: {declined}")
print(f"Regions unchanged: {unchanged}")

income_declined = (gdf["income_change"] < 0).sum()
print(f"Regions with income decline: {income_declined} ({income_declined/len(gdf)*100:.1f}%)")

# ── Step 2: Scatter plots ────────────────────────────────────────

# Figure 1: HDI scatter 2013 vs 2019
fig, ax = plt.subplots(figsize=(8, 7))
fig.patch.set_linewidth(0)

ax.scatter(gdf["shdi2013"], gdf["shdi2019"],
           color=STEEL_BLUE, edgecolors=GRID_LINE, s=45, alpha=0.75, zorder=3)

# 45-degree reference line
lims = [min(gdf["shdi2013"].min(), gdf["shdi2019"].min()) - 0.01,
        max(gdf["shdi2013"].max(), gdf["shdi2019"].max()) + 0.01]
ax.plot(lims, lims, color=WARM_ORANGE, linewidth=1.5, linestyle="--",
        label="45° line (no change)", zorder=2)

ax.set_xlabel("SHDI 2013")
ax.set_ylabel("SHDI 2019")
ax.set_title("Subnational HDI: 2013 vs 2019")
ax.legend()
ax.set_xlim(lims)
ax.set_ylim(lims)

# Label extreme regions (biggest gains, biggest losses, highest, lowest)
residual = gdf["shdi2019"] - gdf["shdi2013"]
extremes = set()
extremes.update(residual.nlargest(3).index.tolist())   # biggest improvers
extremes.update(residual.nsmallest(3).index.tolist())  # biggest decliners
extremes.update(gdf["shdi2019"].nlargest(2).index.tolist())   # highest 2019
extremes.update(gdf["shdi2019"].nsmallest(2).index.tolist())  # lowest 2019

texts = []
for i in extremes:
    texts.append(ax.text(gdf.loc[i, "shdi2013"], gdf.loc[i, "shdi2019"],
                         gdf.loc[i, "region_country"], fontsize=8, color=LIGHT_TEXT))
adjust_text(texts, ax=ax, arrowprops=dict(arrowstyle="-", color=LIGHT_TEXT,
            alpha=0.5, lw=0.5))

plt.savefig("esda2_scatter_hdi.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# Figure 2: Component scatter plots (3-panel)
fig, axes = plt.subplots(1, 3, figsize=(18, 5.5))
fig.patch.set_linewidth(0)

components = [
    ("healthindex2013", "healthindex2019", "Health Index"),
    ("edindex2013", "edindex2019", "Education Index"),
    ("incindex2013", "incindex2019", "Income Index"),
]

for ax, (col13, col19, label) in zip(axes, components):
    ax.scatter(gdf[col13], gdf[col19],
               color=STEEL_BLUE, edgecolors=GRID_LINE, s=40, alpha=0.7, zorder=3)
    lims = [min(gdf[col13].min(), gdf[col19].min()) - 0.02,
            max(gdf[col13].max(), gdf[col19].max()) + 0.02]
    ax.plot(lims, lims, color=WARM_ORANGE, linewidth=1.5, linestyle="--", zorder=2)
    ax.set_xlabel(f"{label} 2013")
    ax.set_ylabel(f"{label} 2019")
    ax.set_title(label)
    ax.set_xlim(lims)
    ax.set_ylim(lims)

    above = (gdf[col19] > gdf[col13]).sum()
    below = (gdf[col19] < gdf[col13]).sum()
    ax.text(0.05, 0.95, f"Improved: {above}\nDeclined: {below}",
            transform=ax.transAxes, fontsize=10, verticalalignment="top",
            color=LIGHT_TEXT)

    # Label extreme regions per component
    comp_residual = gdf[col19] - gdf[col13]
    comp_extremes = set()
    comp_extremes.update(comp_residual.nlargest(2).index.tolist())
    comp_extremes.update(comp_residual.nsmallest(2).index.tolist())
    texts = []
    for i in comp_extremes:
        texts.append(ax.text(gdf.loc[i, col13], gdf.loc[i, col19],
                             gdf.loc[i, "region_country"], fontsize=7, color=LIGHT_TEXT))
    adjust_text(texts, ax=ax, arrowprops=dict(arrowstyle="-", color=LIGHT_TEXT,
                alpha=0.5, lw=0.5))

fig.suptitle("HDI components: 2013 vs 2019", fontsize=14, y=1.02)
plt.tight_layout()

plt.savefig("esda2_scatter_components.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# ── Step 3: Choropleth maps ─────────────────────────────────────

# Figure 3: HDI levels 2013 and 2019 (Fisher-Jenks classification)

# Fisher-Jenks breaks from 2013 (5 classes)
fj = mapclassify.FisherJenks(gdf["shdi2013"].values, k=5)
breaks = fj.bins.tolist()

# Extend upper break to cover 2019 max
max_val = max(gdf["shdi2013"].max(), gdf["shdi2019"].max())
if max_val > breaks[-1]:
    breaks[-1] = float(round(max_val + 0.001, 3))

# Apply same breaks to 2019
fj_2019 = mapclassify.UserDefined(gdf["shdi2019"].values, bins=breaks)

# Class transitions
classes_2013 = fj.yb
classes_2019 = fj_2019.yb
improved = (classes_2019 > classes_2013).sum()
stayed = (classes_2019 == classes_2013).sum()
declined = (classes_2019 < classes_2013).sum()

print("\n── Fisher-Jenks classification ──")
print(f"Breaks (from 2013): {[round(b, 3) for b in breaks]}")
print(f"\nClass transitions (2013 → 2019):")
print(f"  Improved (moved up):   {improved}")
print(f"  Stayed same:           {stayed}")
print(f"  Declined (moved down): {declined}")

# Class labels
class_labels = []
lower = round(gdf["shdi2013"].min(), 2)
for b in breaks:
    class_labels.append(f"{lower:.2f} – {b:.2f}")
    lower = round(b, 2)

fig, axes = plt.subplots(1, 2, figsize=(16, 12))
fig.patch.set_facecolor(DARK_NAVY)
fig.patch.set_linewidth(0)

cmap = plt.cm.coolwarm
norm = plt.Normalize(vmin=0, vmax=len(breaks) - 1)

for ax, year_col, title, year_fj in [
    (axes[0], "shdi2013", "SHDI 2013", fj),
    (axes[1], "shdi2019", "SHDI 2019", fj_2019),
]:
    year_classes = year_fj.yb
    colors = [cmap(norm(c)) for c in year_classes]

    gdf.plot(ax=ax, color=colors, edgecolor=GRID_LINE, linewidth=0.3)
    ax.set_facecolor(DARK_NAVY)
    ax.set_title(title, fontsize=14, color=WHITE_TEXT, pad=10)
    ax.set_axis_off()

    # Legend with region counts per class
    counts = np.bincount(year_fj.yb, minlength=len(breaks))
    handles = []
    for i, (cl, c) in enumerate(zip(class_labels, counts)):
        handles.append(Patch(facecolor=cmap(norm(i)), edgecolor=GRID_LINE,
                             label=f"{cl}  (n={c})"))

    leg = ax.legend(handles=handles, title="SHDI Class", loc="lower right",
                    fontsize=10, title_fontsize=11)
    leg.set_frame_on(True)
    leg.get_frame().set_facecolor("#1a1a2e")
    leg.get_frame().set_edgecolor(LIGHT_TEXT)
    leg.get_frame().set_alpha(0.9)
    leg.get_frame().set_linewidth(1.0)
    for text in leg.get_texts():
        text.set_color(WHITE_TEXT)
    leg.get_title().set_color(WHITE_TEXT)

# Label extreme regions on maps
map_extremes_high = gdf["shdi2019"].nlargest(3).index.tolist()
map_extremes_low = gdf["shdi2019"].nsmallest(3).index.tolist()
map_label_idx = map_extremes_high + map_extremes_low

for ax_map in axes:
    texts = []
    for i in map_label_idx:
        centroid = gdf.geometry.iloc[i].centroid
        texts.append(ax_map.text(centroid.x, centroid.y, gdf.loc[i, "region_country"],
                                 fontsize=7, color=WHITE_TEXT, weight="bold"))
    adjust_text(texts, ax=ax_map, arrowprops=dict(arrowstyle="-|>",
                color=LIGHT_TEXT, alpha=0.9, lw=1.2,
                mutation_scale=8))

plt.savefig("esda2_choropleth_hdi.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# Figure 4: HDI change map (diverging)
fig, ax = plt.subplots(1, 1, figsize=(10, 10))
fig.patch.set_facecolor(DARK_NAVY)
fig.patch.set_linewidth(0)

abs_max = max(abs(gdf["shdi_change"].min()), abs(gdf["shdi_change"].max()))
gdf.plot(column="shdi_change", cmap="RdYlGn", ax=ax, legend=False,
         edgecolor=GRID_LINE, linewidth=0.3, vmin=-abs_max, vmax=abs_max)
ax.set_facecolor(DARK_NAVY)
ax.set_title("Change in SHDI (2019 - 2013)", fontsize=14, color=WHITE_TEXT, pad=10)
ax.set_axis_off()

# Label biggest gainers and losers
change_top = gdf["shdi_change"].nlargest(3).index.tolist()
change_bot = gdf["shdi_change"].nsmallest(3).index.tolist()
texts = []
for i in change_top + change_bot:
    centroid = gdf.geometry.iloc[i].centroid
    texts.append(ax.text(centroid.x, centroid.y, gdf.loc[i, "region_country"],
                         fontsize=7, color=WHITE_TEXT, weight="bold"))
adjust_text(texts, ax=ax, arrowprops=dict(arrowstyle="-|>",
            color=LIGHT_TEXT, alpha=0.9, lw=1.2,
            mutation_scale=8))

sm2 = plt.cm.ScalarMappable(cmap="RdYlGn",
                            norm=plt.Normalize(vmin=-abs_max, vmax=abs_max))
sm2._A = []
cbar2 = fig.colorbar(sm2, ax=ax, orientation="horizontal", fraction=0.03,
                     pad=0.02, aspect=40)
cbar2.set_label("SHDI change (2019 - 2013)", color=LIGHT_TEXT)
cbar2.ax.tick_params(colors=LIGHT_TEXT)

plt.savefig("esda2_choropleth_change.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# ── Step 4: Spatial weights ──────────────────────────────────────
W = Queen.from_dataframe(gdf)
W.transform = "r"

print("\n── Spatial weights (Queen contiguity) ──")
print(f"Number of regions: {W.n}")
print(f"Number of neighbor pairs: {W.s0 / 2:.0f}")
print(f"Min neighbors: {W.min_neighbors}")
print(f"Max neighbors: {W.max_neighbors}")
print(f"Mean neighbors: {W.mean_neighbors:.2f}")

if W.islands:
    print(f"Islands (no neighbors): {W.islands}")
else:
    print("Islands: none")

# Figure 5: Spatial weights network
fig, ax = plt.subplots(figsize=(10, 10))
fig.patch.set_facecolor(DARK_NAVY)
fig.patch.set_linewidth(0)
ax.set_facecolor(DARK_NAVY)

gdf.plot(ax=ax, facecolor="none", edgecolor=GRID_LINE, linewidth=0.5)
plot_spatial_weights(W, gdf, ax=ax)

# Override splot's default colors for dark theme
for child in ax.get_children():
    if hasattr(child, 'set_color'):
        try:
            child.set_color(STEEL_BLUE)
        except Exception:
            pass
    if hasattr(child, 'set_edgecolor') and hasattr(child, 'get_facecolor'):
        try:
            fc = child.get_facecolor()
            if isinstance(fc, np.ndarray) and len(fc) > 0:
                child.set_facecolor(WARM_ORANGE)
                child.set_edgecolor(DARK_NAVY)
        except Exception:
            pass

ax.set_title("Queen contiguity weights", fontsize=14, color=WHITE_TEXT, pad=10)
ax.set_axis_off()

plt.savefig("esda2_spatial_weights.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# ── Step 5: Global Moran's I ────────────────────────────────────
moran_2013 = Moran(gdf["shdi2013"], W, permutations=999)
moran_2019 = Moran(gdf["shdi2019"], W, permutations=999)

print("\n── Global Moran's I ──")
print(f"SHDI 2013: I = {moran_2013.I:.4f}, p-value = {moran_2013.p_sim:.4f}, "
      f"z-score = {moran_2013.z_sim:.4f}")
print(f"SHDI 2019: I = {moran_2019.I:.4f}, p-value = {moran_2019.p_sim:.4f}, "
      f"z-score = {moran_2019.z_sim:.4f}")
print(f"Expected I (random): {moran_2013.EI:.4f}")

# Figure 6: Moran scatter plots (2013 and 2019) — manual for dark theme
fig, axes = plt.subplots(1, 2, figsize=(14, 6))
fig.patch.set_linewidth(0)

from scipy import stats as scipy_stats

for ax, moran_obj, year in [
    (axes[0], moran_2013, "2013"),
    (axes[1], moran_2019, "2019"),
]:
    # Standardize
    y = gdf[f"shdi{year}"].values
    z = (y - y.mean()) / y.std()
    wz = lag_spatial(W, z)

    # Exclude islands (no neighbors → spatial lag = 0)
    has_nb = np.array([W.cardinalities[i] > 0 for i in range(W.n)])

    # Scatter (excluding islands)
    ax.scatter(z[has_nb], wz[has_nb], color=STEEL_BLUE, s=35, alpha=0.7,
               edgecolors=GRID_LINE, linewidths=0.3, zorder=3)

    # Regression line (excluding islands)
    slope, intercept, _, _, _ = scipy_stats.linregress(z[has_nb], wz[has_nb])
    x_range = np.array([z.min(), z.max()])
    ax.plot(x_range, intercept + slope * x_range, color=WARM_ORANGE,
            linewidth=1.5, zorder=2)

    # Quadrant lines at origin — visible on dark background
    ax.axhline(0, color=LIGHT_TEXT, linewidth=0.8, alpha=0.5, zorder=1)
    ax.axvline(0, color=LIGHT_TEXT, linewidth=0.8, alpha=0.5, zorder=1)

    # Quadrant labels
    xlim = ax.get_xlim()
    ylim = ax.get_ylim()
    pad_x = (xlim[1] - xlim[0]) * 0.05
    pad_y = (ylim[1] - ylim[0]) * 0.05
    ax.text(xlim[1] - pad_x, ylim[1] - pad_y, "HH", fontsize=13,
            ha="right", va="top", color=LIGHT_TEXT, alpha=0.5)
    ax.text(xlim[0] + pad_x, ylim[1] - pad_y, "LH", fontsize=13,
            ha="left", va="top", color=LIGHT_TEXT, alpha=0.5)
    ax.text(xlim[0] + pad_x, ylim[0] + pad_y, "LL", fontsize=13,
            ha="left", va="bottom", color=LIGHT_TEXT, alpha=0.5)
    ax.text(xlim[1] - pad_x, ylim[0] + pad_y, "HL", fontsize=13,
            ha="right", va="bottom", color=LIGHT_TEXT, alpha=0.5)

    ax.set_xlabel(f"SHDI {year} (standardized)")
    ax.set_ylabel(f"Spatial lag of SHDI {year}")
    ax.set_title(f"({'a' if year == '2013' else 'b'}) Moran scatter plot "
                 f"— {year} (I = {moran_obj.I:.4f})")

plt.tight_layout()
plt.savefig("esda2_moran_global.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# ── Step 6: Local Moran's I (LISA) ──────────────────────────────

def select_lisa_labels(local_moran, sig_mask, shdi_col):
    """Select extreme regions for LISA labeling:
    3 highest HH, 3 lowest LL, 1 HL, 1 LH (if available)."""
    label_idx = []
    # 3 highest-value HH regions
    hh_mask = (local_moran.q == 1) & sig_mask
    if hh_mask.any():
        hh_idx = gdf.loc[hh_mask, shdi_col].nlargest(3).index.tolist()
        label_idx.extend(hh_idx)
    # 3 lowest-value LL regions
    ll_mask = (local_moran.q == 3) & sig_mask
    if ll_mask.any():
        ll_idx = gdf.loc[ll_mask, shdi_col].nsmallest(3).index.tolist()
        label_idx.extend(ll_idx)
    # 1 HL outlier (highest value among HL)
    hl_mask = (local_moran.q == 4) & sig_mask
    if hl_mask.any():
        label_idx.append(gdf.loc[hl_mask, shdi_col].idxmax())
    # 1 LH outlier (lowest value among LH)
    lh_mask = (local_moran.q == 2) & sig_mask
    if lh_mask.any():
        label_idx.append(gdf.loc[lh_mask, shdi_col].idxmin())
    return label_idx

# LISA colors matching splot's lisa_cluster map
LISA_COLORS = {1: "#d7191c", 2: "#89cff0", 3: "#2c7bb6", 4: "#fdae61"}
LISA_NS_COLOR = "#bababa"

def plot_lisa_scatter(ax, local_moran, sig, shdi_col, wlag, moran_I):
    """Manual LISA scatter plot with colors matching the cluster map."""
    # Exclude islands (no neighbors → spatial lag = 0, not meaningful)
    has_neighbors = np.array([W.cardinalities[i] > 0 for i in range(W.n)])

    # Fit regression line excluding islands
    from scipy import stats
    x_vals = gdf.loc[has_neighbors, shdi_col].values
    y_vals = wlag[has_neighbors]
    slope, intercept, _, _, _ = stats.linregress(x_vals, y_vals)

    # Plot non-significant points first (excluding islands)
    ns_mask = ~sig & has_neighbors
    ax.scatter(gdf.loc[ns_mask, shdi_col], wlag[ns_mask],
               color=LISA_NS_COLOR, s=30, alpha=0.4, edgecolors=GRID_LINE,
               linewidths=0.3, label="ns", zorder=2)

    # Plot significant points by quadrant (excluding islands)
    for q_val, q_name in q_labels.items():
        mask = (local_moran.q == q_val) & sig & has_neighbors
        if mask.any():
            ax.scatter(gdf.loc[mask, shdi_col], wlag[mask],
                       color=LISA_COLORS[q_val], s=40, alpha=0.8,
                       edgecolors=GRID_LINE, linewidths=0.3,
                       label=q_name, zorder=3)

    # Regression line
    x_range = np.array([x_vals.min(), x_vals.max()])
    ax.plot(x_range, intercept + slope * x_range, color=WARM_ORANGE,
            linewidth=1.2, zorder=1)

    # Crosshairs at mean (excluding islands)
    mean_x = x_vals.mean()
    mean_y = y_vals.mean()
    ax.axhline(mean_y, color=LIGHT_TEXT, linewidth=0.8, alpha=0.5, zorder=0)
    ax.axvline(mean_x, color=LIGHT_TEXT, linewidth=0.8, alpha=0.5, zorder=0)

    # Quadrant labels
    xlim = ax.get_xlim()
    ylim = ax.get_ylim()
    pad_x = (xlim[1] - xlim[0]) * 0.04
    pad_y = (ylim[1] - ylim[0]) * 0.04
    ax.text(xlim[1] - pad_x, ylim[1] - pad_y, "HH", fontsize=13,
            ha="right", va="top", color=LIGHT_TEXT, alpha=0.5)
    ax.text(xlim[0] + pad_x, ylim[1] - pad_y, "LH", fontsize=13,
            ha="left", va="top", color=LIGHT_TEXT, alpha=0.5)
    ax.text(xlim[0] + pad_x, ylim[0] + pad_y, "LL", fontsize=13,
            ha="left", va="bottom", color=LIGHT_TEXT, alpha=0.5)
    ax.text(xlim[1] - pad_x, ylim[0] + pad_y, "HL", fontsize=13,
            ha="right", va="bottom", color=LIGHT_TEXT, alpha=0.5)

def label_lisa_scatter(ax, label_idx, shdi_col, wlag):
    """Add adjustText labels to the LISA scatter plot."""
    texts = []
    for i in label_idx:
        texts.append(ax.text(gdf.loc[i, shdi_col], wlag[i],
                             gdf.loc[i, "region_country"], fontsize=7, color=LIGHT_TEXT))
    adjust_text(texts, ax=ax, arrowprops=dict(arrowstyle="-", color=LIGHT_TEXT,
                alpha=0.5, lw=0.5))

def label_lisa_map(ax, label_idx):
    """Add adjustText labels to the LISA cluster map."""
    texts = []
    for i in label_idx:
        centroid = gdf.geometry.iloc[i].centroid
        texts.append(ax.text(centroid.x, centroid.y, gdf.loc[i, "region_country"],
                             fontsize=7, color=WHITE_TEXT, weight="bold"))
    adjust_text(texts, ax=ax, arrowprops=dict(arrowstyle="-|>", color=LIGHT_TEXT,
                alpha=0.9, lw=1.2, mutation_scale=8))

# LISA 2019
localMoran_2019 = Moran_Local(gdf["shdi2019"], W, permutations=999, seed=12345)

print("\n── LISA clusters (p < 0.10) — SHDI 2019 ──")
sig_2019 = localMoran_2019.p_sim < 0.10
q_labels = {1: "HH", 2: "LH", 3: "LL", 4: "HL"}
for q_val, q_name in q_labels.items():
    count = ((localMoran_2019.q == q_val) & sig_2019).sum()
    print(f"  {q_name}: {count}")
print(f"  Not significant: {(~sig_2019).sum()}")

# Compute spatial lag for scatter labeling
wlag_2019 = lag_spatial(W, gdf["shdi2019"].values)
lisa_labels_2019 = select_lisa_labels(localMoran_2019, sig_2019, "shdi2019")

# Print labeled regions
print("\n  Labeled regions:")
for i in lisa_labels_2019:
    q_name = q_labels[localMoran_2019.q[i]]
    print(f"    {q_name}: {gdf.loc[i, 'region_country']} "
          f"— SHDI = {gdf.loc[i, 'shdi2019']:.3f}")

# Figure 7: LISA 2019
fig, axes = plt.subplots(nrows=1, ncols=2, figsize=(14, 6))
fig.patch.set_facecolor(DARK_NAVY)
fig.patch.set_linewidth(0)

plot_lisa_scatter(axes[0], localMoran_2019, sig_2019, "shdi2019", wlag_2019, moran_2019.I)
axes[0].set_xlabel("SHDI 2019")
axes[0].set_ylabel("Spatial lag of SHDI 2019")
axes[0].set_title(f"(a) Moran scatter plot (I = {moran_2019.I:.4f})")
label_lisa_scatter(axes[0], lisa_labels_2019, "shdi2019", wlag_2019)

lisa_cluster(localMoran_2019, gdf, p=0.10,
             legend_kwds={"bbox_to_anchor": (0.02, 0.90)}, ax=axes[1])
axes[1].set_facecolor(DARK_NAVY)
axes[1].set_title("(b) LISA clusters (p < 0.10)")
label_lisa_map(axes[1], lisa_labels_2019)

plt.tight_layout()
plt.savefig("esda2_lisa_2019.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# LISA 2013
localMoran_2013 = Moran_Local(gdf["shdi2013"], W, permutations=999, seed=12345)

print("\n── LISA clusters (p < 0.10) — SHDI 2013 ──")
sig_2013 = localMoran_2013.p_sim < 0.10
for q_val, q_name in q_labels.items():
    count = ((localMoran_2013.q == q_val) & sig_2013).sum()
    print(f"  {q_name}: {count}")
print(f"  Not significant: {(~sig_2013).sum()}")

wlag_2013 = lag_spatial(W, gdf["shdi2013"].values)
lisa_labels_2013 = select_lisa_labels(localMoran_2013, sig_2013, "shdi2013")

print("\n  Labeled regions:")
for i in lisa_labels_2013:
    q_name = q_labels[localMoran_2013.q[i]]
    print(f"    {q_name}: {gdf.loc[i, 'region_country']} "
          f"— SHDI = {gdf.loc[i, 'shdi2013']:.3f}")

# Figure 8: LISA 2013
fig, axes = plt.subplots(nrows=1, ncols=2, figsize=(14, 6))
fig.patch.set_facecolor(DARK_NAVY)
fig.patch.set_linewidth(0)

plot_lisa_scatter(axes[0], localMoran_2013, sig_2013, "shdi2013", wlag_2013, moran_2013.I)
axes[0].set_xlabel("SHDI 2013")
axes[0].set_ylabel("Spatial lag of SHDI 2013")
axes[0].set_title(f"(a) Moran scatter plot (I = {moran_2013.I:.4f})")
label_lisa_scatter(axes[0], lisa_labels_2013, "shdi2013", wlag_2013)

lisa_cluster(localMoran_2013, gdf, p=0.10,
             legend_kwds={"bbox_to_anchor": (0.02, 0.90)}, ax=axes[1])
axes[1].set_facecolor(DARK_NAVY)
axes[1].set_title("(b) LISA clusters (p < 0.10)")
label_lisa_map(axes[1], lisa_labels_2013)

plt.tight_layout()
plt.savefig("esda2_lisa_2013.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# LISA transition table
print("\n── LISA cluster transitions (2013 → 2019, significant at p < 0.10) ──")
labels_2013 = []
labels_2019 = []
for i in range(len(gdf)):
    if sig_2013[i]:
        labels_2013.append(q_labels[localMoran_2013.q[i]])
    else:
        labels_2013.append("ns")
    if sig_2019[i]:
        labels_2019.append(q_labels[localMoran_2019.q[i]])
    else:
        labels_2019.append("ns")

transition_df = pd.crosstab(
    pd.Series(labels_2013, name="2013"),
    pd.Series(labels_2019, name="2019")
)
print(transition_df.to_string())

# ── Step 7: Space-time dynamics (directional Moran) ──────────────
# Standardize SHDI values for both periods
mean_all = np.mean(np.concatenate([gdf["shdi2013"].values, gdf["shdi2019"].values]))
std_all = np.std(np.concatenate([gdf["shdi2013"].values, gdf["shdi2019"].values]))
z_2013 = (gdf["shdi2013"].values - mean_all) / std_all
z_2019 = (gdf["shdi2019"].values - mean_all) / std_all

# Spatial lags
wz_2013 = lag_spatial(W, z_2013)
wz_2019 = lag_spatial(W, z_2019)

# Figure 9: Directional Moran scatter plot (movement vectors)
fig, ax = plt.subplots(figsize=(9, 8))
fig.patch.set_linewidth(0)

# Draw arrows from 2013 position to 2019 position
for i in range(len(gdf)):
    dx = z_2019[i] - z_2013[i]
    dy = wz_2019[i] - wz_2013[i]
    ax.annotate("", xy=(z_2019[i], wz_2019[i]),
                xytext=(z_2013[i], wz_2013[i]),
                arrowprops=dict(arrowstyle="->", color=STEEL_BLUE,
                                alpha=0.5, lw=0.8))

# Mark 2013 positions
ax.scatter(z_2013, wz_2013, color=WARM_ORANGE, s=20, alpha=0.6,
           edgecolors=GRID_LINE, linewidths=0.3, label="2013", zorder=4)
# Mark 2019 positions
ax.scatter(z_2019, wz_2019, color=TEAL, s=20, alpha=0.6,
           edgecolors=GRID_LINE, linewidths=0.3, label="2019", zorder=4)

# Quadrant lines
ax.axhline(0, color=GRID_LINE, linewidth=1, zorder=1)
ax.axvline(0, color=GRID_LINE, linewidth=1, zorder=1)

# Quadrant labels
xlim = ax.get_xlim()
ylim = ax.get_ylim()
offset_x = (xlim[1] - xlim[0]) * 0.05
offset_y = (ylim[1] - ylim[0]) * 0.05
ax.text(xlim[1] - offset_x, ylim[1] - offset_y, "HH", fontsize=14,
        ha="right", va="top", color=LIGHT_TEXT, alpha=0.6)
ax.text(xlim[0] + offset_x, ylim[1] - offset_y, "LH", fontsize=14,
        ha="left", va="top", color=LIGHT_TEXT, alpha=0.6)
ax.text(xlim[0] + offset_x, ylim[0] + offset_y, "LL", fontsize=14,
        ha="left", va="bottom", color=LIGHT_TEXT, alpha=0.6)
ax.text(xlim[1] - offset_x, ylim[0] + offset_y, "HL", fontsize=14,
        ha="right", va="bottom", color=LIGHT_TEXT, alpha=0.6)

ax.set_xlabel("SHDI (standardized)")
ax.set_ylabel("Spatial lag of SHDI")
ax.set_title("Directional Moran scatter plot: movements from 2013 to 2019")
ax.legend()

plt.savefig("esda2_directional_moran.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# Classify movements by quadrant
print("\n── Directional Moran scatter plot ──")
# Quadrant of each region in 2013
q_2013 = np.where((z_2013 >= 0) & (wz_2013 >= 0), "HH",
          np.where((z_2013 < 0) & (wz_2013 >= 0), "LH",
          np.where((z_2013 < 0) & (wz_2013 < 0), "LL", "HL")))
# Quadrant of each region in 2019
q_2019 = np.where((z_2019 >= 0) & (wz_2019 >= 0), "HH",
          np.where((z_2019 < 0) & (wz_2019 >= 0), "LH",
          np.where((z_2019 < 0) & (wz_2019 < 0), "LL", "HL")))

transition_moran = pd.crosstab(
    pd.Series(q_2013, name="2013"),
    pd.Series(q_2019, name="2019")
)
print("Moran scatter plot quadrant transitions (2013 → 2019):")
print(transition_moran.to_string())

stayed = (q_2013 == q_2019).sum()
moved = (q_2013 != q_2019).sum()
print(f"\nStayed in same quadrant: {stayed} ({stayed/len(gdf)*100:.1f}%)")
print(f"Moved to different quadrant: {moved} ({moved/len(gdf)*100:.1f}%)")

# Figure 10: Venezuela vs Bolivia directional Moran (side-by-side)
ven_mask = gdf["country"] == "Venezuela"
bol_mask = gdf["country"] == "Bolivia"

# Shared axis limits (from the full dataset, for comparability)
all_z = np.concatenate([z_2013, z_2019])
all_wz = np.concatenate([wz_2013, wz_2019])
pad = 0.3
shared_xlim = (all_z.min() - pad, all_z.max() + pad)
shared_ylim = (all_wz.min() - pad, all_wz.max() + pad)

fig, axes = plt.subplots(nrows=1, ncols=2, figsize=(16, 7))
fig.patch.set_linewidth(0)

for ax, mask, title in [
    (axes[0], bol_mask, "(a) Bolivia"),
    (axes[1], ven_mask, "(b) Venezuela"),
]:
    # Background: all regions (grey, faded)
    for i in range(len(gdf)):
        ax.annotate("", xy=(z_2019[i], wz_2019[i]),
                    xytext=(z_2013[i], wz_2013[i]),
                    arrowprops=dict(arrowstyle="->", color=GRID_LINE,
                                    alpha=0.15, lw=0.5))
    ax.scatter(z_2013, wz_2013, color=GRID_LINE, s=10, alpha=0.15, zorder=2)
    ax.scatter(z_2019, wz_2019, color=GRID_LINE, s=10, alpha=0.15, zorder=2)

    # Highlighted country
    for i in gdf.index[mask]:
        ax.annotate("", xy=(z_2019[i], wz_2019[i]),
                    xytext=(z_2013[i], wz_2013[i]),
                    arrowprops=dict(arrowstyle="->", color=STEEL_BLUE,
                                    alpha=0.7, lw=1.0))
    ax.scatter(z_2013[mask], wz_2013[mask], color=WARM_ORANGE, s=30,
               alpha=0.8, edgecolors=GRID_LINE, linewidths=0.3,
               label="2013", zorder=5)
    ax.scatter(z_2019[mask], wz_2019[mask], color=TEAL, s=30,
               alpha=0.8, edgecolors=GRID_LINE, linewidths=0.3,
               label="2019", zorder=5)

    # Labels at 2019 positions
    texts = []
    for i in gdf.index[mask]:
        texts.append(ax.text(z_2019[i], wz_2019[i], gdf.loc[i, "region"],
                             fontsize=7, color=LIGHT_TEXT))
    adjust_text(texts, ax=ax, arrowprops=dict(arrowstyle="-", color=LIGHT_TEXT,
                alpha=0.5, lw=0.5))

    # Quadrant lines
    ax.axhline(0, color=GRID_LINE, linewidth=1, zorder=1)
    ax.axvline(0, color=GRID_LINE, linewidth=1, zorder=1)

    # Shared limits
    ax.set_xlim(shared_xlim)
    ax.set_ylim(shared_ylim)

    # Quadrant labels
    ox = (shared_xlim[1] - shared_xlim[0]) * 0.05
    oy = (shared_ylim[1] - shared_ylim[0]) * 0.05
    ax.text(shared_xlim[1] - ox, shared_ylim[1] - oy, "HH", fontsize=14,
            ha="right", va="top", color=LIGHT_TEXT, alpha=0.6)
    ax.text(shared_xlim[0] + ox, shared_ylim[1] - oy, "LH", fontsize=14,
            ha="left", va="top", color=LIGHT_TEXT, alpha=0.6)
    ax.text(shared_xlim[0] + ox, shared_ylim[0] + oy, "LL", fontsize=14,
            ha="left", va="bottom", color=LIGHT_TEXT, alpha=0.6)
    ax.text(shared_xlim[1] - ox, shared_ylim[0] + oy, "HL", fontsize=14,
            ha="right", va="bottom", color=LIGHT_TEXT, alpha=0.6)

    ax.set_xlabel("SHDI (standardized)")
    ax.set_ylabel("Spatial lag of SHDI")
    ax.set_title(title)
    ax.legend(fontsize=8)

plt.tight_layout()
plt.savefig("esda2_directional_ven_bol.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.show()

# Summary statistics for Venezuela and Bolivia
for country, mask in [("Venezuela", ven_mask), ("Bolivia", bol_mask)]:
    n = mask.sum()
    mean_change = gdf.loc[mask, "shdi_change"].mean()
    min_change = gdf.loc[mask, "shdi_change"].min()
    max_change = gdf.loc[mask, "shdi_change"].max()
    q13 = q_2013[mask]
    q19 = q_2019[mask]
    stayed_c = (q13 == q19).sum()
    moved_c = (q13 != q19).sum()
    print(f"\n{country} ({n} regions):")
    print(f"  Mean SHDI change: {mean_change:+.4f}")
    print(f"  Range: [{min_change:+.4f}, {max_change:+.4f}]")
    print(f"  Quadrant stability: {stayed_c} stayed, {moved_c} moved")
    print(f"  2013 quadrants: {', '.join(f'{q}={c}' for q, c in zip(*np.unique(q13, return_counts=True)))}")
    print(f"  2019 quadrants: {', '.join(f'{q}={c}' for q, c in zip(*np.unique(q19, return_counts=True)))}")

print("\nDone! All figures generated.")
