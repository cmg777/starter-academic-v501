#!/usr/bin/env python3
# ===========================================================================
# Figure_3.py  --  Python replication of Figure 3 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Diverging world choropleth of the CHANGE in within-country regional
# inequality between 1992-2001 and 2002-2012. Python twin of Figure_3.do
# (Stata spmap). Uses the SAME inputs: the GINIW series in
# data/Figure_3_data.csv and the bundled Natural Earth country shapefile
# data/worldmap_countries.shp (key field: iso3).
#
# D_GINIW = mean(1992-2001) - mean(2002-2012):
#   POSITIVE -> inequality FELL (within-country convergence) -> GREEN
#   NEGATIVE -> inequality ROSE (within-country divergence)  -> RED
#
# REQUIRED PACKAGES (install once):
#   pip install pandas geopandas matplotlib
#   - geopandas : read shapefiles + plot maps, the Python analogue of spmap
#
# RUN:  python Figure_3.py
# OUTPUT: output/Figure_3_py.png, output/Figure_3_results_py.csv
# ===========================================================================
import os
import pandas as pd
import geopandas as gpd
import matplotlib
matplotlib.use("Agg")                                  # headless backend; no display needed
import matplotlib.pyplot as plt
from matplotlib.colors import TwoSlopeNorm             # centres the diverging colourmap at 0

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))   # cd to this script's folder
os.makedirs("output", exist_ok=True)

# --- 1. import the inequality series --------------------------------------
d = pd.read_csv("data/Figure_3_data.csv")

# --- 2. two sub-periods ---------------------------------------------------
# p2year flags the SECOND sub-period (2002-2012); 0 = first sub-period (else).
d["p2year"] = ((d.year >= 2002) & (d.year <= 2012)).astype(int)

# --- 3. per-country sub-period means + the plotted change -----------------
# Mean GINIW in each country x sub-period, pivoted so each country has its
# 1st-period mean and 2nd-period mean side by side (mirrors the .do collapse).
m = (d.groupby(["Country_ISO", "p2year"], as_index=False)["GINIW_pred_GDP_pc"]
       .mean()
       .pivot(index="Country_ISO", columns="p2year", values="GINIW_pred_GDP_pc"))
g = pd.DataFrame({"Country_ISO": m.index,
                  "GINIW_91_01": m.get(0),             # 1992-2001 mean
                  "GINIW_02_12": m.get(1)}).reset_index(drop=True)
g["D_GINIW"] = g.GINIW_91_01 - g.GINIW_02_12           # >0 fell (green); <0 rose (red)

# --- 4. country polygons (Natural Earth, keyed by iso3) --------------------
shp = gpd.read_file("data/worldmap_countries.shp")
shp = shp.merge(g, left_on="iso3", right_on="Country_ISO", how="left")
shp = shp[shp.iso3 != "ATA"]                           # drop Antarctica so map centres on land

# --- 5. draw the diverging choropleth -------------------------------------
# RdYlGn diverging colourmap, normalised so 0 sits at the colour centre:
# red = negative (rising inequality), green = positive (falling inequality).
dd = g.D_GINIW.dropna()
norm = TwoSlopeNorm(vmin=dd.min(), vcenter=0, vmax=dd.max())
fig, ax = plt.subplots(figsize=(9, 4.6))
shp.plot(column="D_GINIW", cmap="RdYlGn", norm=norm, ax=ax, legend=True,
         edgecolor="grey", linewidth=0.05,
         missing_kwds={"color": "lightgrey"},
         legend_kwds={"label": "D_GINIW", "shrink": 0.5})
ax.set_title("Figure 3 (Python): change in regional inequality, 1992-2001 vs 2002-2012")
ax.axis("off")
fig.tight_layout(); fig.savefig("output/Figure_3_py.png", dpi=120); plt.close(fig)

# --- 6. key numbers for the comparison ------------------------------------
matched = int(g.Country_ISO.isin(shp.iso3).sum())      # countries that join the map
res = pd.DataFrame({"metric": ["countries_with_data","matched_to_map",
                               "D_GINIW_min","D_GINIW_max"],
                    "value": [len(g), matched,
                              round(dd.min(), 6), round(dd.max(), 6)]})
res.to_csv("output/Figure_3_results_py.csv", index=False)
print("PY | countries=%d matched=%d D_GINIW range [%.4f, %.4f]" % (
    len(g), matched, dd.min(), dd.max()))
