#!/usr/bin/env python3
# ===========================================================================
# Figure_B1.py  --  Python replication of Figure B.1 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Choropleth of PREDICTED regional GDP per capita (1992-2012 mean), restricted
# to Sub-Saharan Africa (ssa==1), shaded in Blues. Python twin of Figure_B1.do
# (Stata spmap ... if ssa==1). Same map as Figure 1, just masked to the SSA
# subsample. Uses the SAME inputs: data/Figure_B1_region_income.csv and the
# bundled Natural Earth regions shapefile data/worldmap_regions.shp (key: regiso).
#
# REQUIRED PACKAGES (install once):
#   pip install pandas geopandas matplotlib
#   - geopandas : read shapefiles + plot maps, the Python analogue of spmap
#
# RUN:  python Figure_B1.py
# OUTPUT: output/Figure_B1_py.png, output/Figure_B1_results_py.csv
# ===========================================================================
import os
import pandas as pd
import geopandas as gpd
import matplotlib
matplotlib.use("Agg")                                  # headless backend (no display)
import matplotlib.pyplot as plt

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("output", exist_ok=True)

# --- 1. collapse the region-year panel to a cross-section ------------------
# case(preserve) in the .do => column names are case-sensitive (Region_ISO, ssa,
# pred_GDP_pc_Region). Average each region over 1992-2012; keep ssa (constant
# within a region) so we can mask to SSA, exactly like collapse (mean) by(...).
d = pd.read_csv("data/Figure_B1_region_income.csv")
g = d.groupby("Region_ISO", as_index=False)[["ssa", "pred_GDP_pc_Region"]].mean()

# --- 2. keep Sub-Saharan Africa only (the only change vs Figure 1) ---------
ssa = g[g.ssa == 1]                                    # spmap's "if ssa==1" mask

# --- 3. region polygons (Natural Earth, keyed by regiso) -------------------
shp = gpd.read_file("data/worldmap_regions.shp")
shp = shp.merge(ssa, left_on="regiso", right_on="Region_ISO", how="right")  # SSA polygons w/ income

# --- 4. draw the SSA-only choropleth --------------------------------------
fig, ax = plt.subplots(figsize=(7, 7))
shp.plot(column="pred_GDP_pc_Region", cmap="Blues", ax=ax, legend=True,
         edgecolor="grey", linewidth=0.05,           # darker blue = richer region
         missing_kwds={"color": "lightgrey"},
         legend_kwds={"label": "Pred. GDP pc", "shrink": 0.5})
ax.set_title("Figure B.1 (Python): predicted regional income, Sub-Saharan Africa (1992-2012)")
ax.axis("off")
fig.tight_layout(); fig.savefig("output/Figure_B1_py.png", dpi=120); plt.close(fig)

# --- 5. key numbers for the comparison ------------------------------------
matched = int(ssa.Region_ISO.isin(shp.regiso).sum())   # SSA regions with a polygon
res = pd.DataFrame({"metric": ["ssa_regions_with_data","ssa_matched_to_map",
                               "pred_GDP_pc_min","pred_GDP_pc_max"],
                    "value": [len(ssa), matched,
                              round(ssa.pred_GDP_pc_Region.min(), 4),
                              round(ssa.pred_GDP_pc_Region.max(), 4)]})
res.to_csv("output/Figure_B1_results_py.csv", index=False)
print("PY | ssa_regions=%d matched=%d pred_GDP_pc range [%.2f, %.2f]" % (
    len(ssa), matched, ssa.pred_GDP_pc_Region.min(), ssa.pred_GDP_pc_Region.max()))
