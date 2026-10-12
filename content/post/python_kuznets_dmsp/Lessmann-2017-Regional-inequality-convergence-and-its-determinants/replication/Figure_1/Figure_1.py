#!/usr/bin/env python3
# ===========================================================================
# Figure_1.py  --  Python replication of Figure 1 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# SUBNATIONAL world choropleth of predicted regional income (mean
# pred_GDP_pc_Region over 1992-2012), shaded in Blues. Python twin of
# Figure_1.do (Stata spmap). Uses the SAME inputs: the region income values in
# data/Figure_1_region_income.csv and the bundled Natural Earth admin-1
# shapefile data/worldmap_regions.shp (key field: regiso).
#
# REQUIRED PACKAGES (install once):
#   pip install pandas geopandas matplotlib
#   - geopandas : read shapefiles + plot maps, the Python analogue of spmap
#
# RUN:  python Figure_1.py
# OUTPUT: output/Figure_1_py.png, output/Figure_1_results_py.csv
# ===========================================================================
import os
import pandas as pd
import geopandas as gpd
import matplotlib
matplotlib.use("Agg")                               # headless backend: write PNG, no display
import matplotlib.pyplot as plt
from matplotlib.colors import LogNorm               # log colour scale for skewed income

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("output", exist_ok=True)

# --- 1. import the region income values -----------------------------------
# read_csv keeps the original (case-sensitive) column names like the .do's
# import delimited ... case(preserve): "Region_ISO" stays exactly as written.
d = pd.read_csv("data/Figure_1_region_income.csv")

# --- 2. collapse to a cross-section (mean over 1992-2012) ------------------
d = d[(d.year > 1991) & (d.year < 2013)]            # keep if year>1991 & year<2013
# mean each region over the kept years -> one row per region, like collapse.
g = d.groupby("Region_ISO", as_index=False)[["ssa", "pred_GDP_pc_Region"]].mean()
g = g.rename(columns={"Region_ISO": "regiso"})      # rename to match map key field

# --- 3. region polygons (Natural Earth admin-1, keyed by regiso) -----------
shp = gpd.read_file("data/worldmap_regions.shp")
# how="left": every map polygon stays; income attaches where matched, unmatched
# polygons get NaN and are drawn as "no data".
shp = shp.merge(g, on="regiso", how="left")

# --- 4. draw the choropleth -----------------------------------------------
fig, ax = plt.subplots(figsize=(9, 4.6))
v = shp["pred_GDP_pc_Region"]
shp.plot(column="pred_GDP_pc_Region", cmap="Blues", ax=ax, legend=True,
         edgecolor="grey", linewidth=0.03,
         norm=LogNorm(vmin=v.min(), vmax=v.max()),  # log scale, as in the reference
         missing_kwds={"color": "lightgrey"},
         legend_kwds={"label": "Pred. GDP p.c.", "shrink": 0.5})
ax.set_title("Figure 1 (Python): predicted regional income (mean 1992-2012)")
ax.axis("off")
fig.tight_layout(); fig.savefig("output/Figure_1_py.png", dpi=120); plt.close(fig)

# --- 5. key numbers for the comparison ------------------------------------
matched = int(g.regiso.isin(shp.regiso).sum())      # data regions that hit a polygon
res = pd.DataFrame({"metric": ["regions_with_data","matched_to_map","pct_matched",
                               "pred_GDP_min","pred_GDP_max"],
                    "value": [len(g), matched,
                              round(100 * matched / len(g), 1),
                              round(g.pred_GDP_pc_Region.min(), 2),
                              round(g.pred_GDP_pc_Region.max(), 2)]})
res.to_csv("output/Figure_1_results_py.csv", index=False)
print("PY | regions=%d matched=%d (%.1f%%) pred_GDP range [%.1f, %.1f]" % (
    len(g), matched, 100 * matched / len(g),
    g.pred_GDP_pc_Region.min(), g.pred_GDP_pc_Region.max()))
