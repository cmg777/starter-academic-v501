#!/usr/bin/env python3
# ===========================================================================
# Figure_2.py  --  Python replication of Figure 2 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# World choropleth of within-country regional inequality (mean GINIW), in Reds.
# Python twin of Figure_2.do (Stata spmap). Uses the SAME inputs: the GINIW
# values in data/Figure_2_data.csv and the bundled Natural Earth country
# shapefile data/worldmap_countries.shp (key field: iso3).
#
# REQUIRED PACKAGES (install once):
#   pip install pandas geopandas matplotlib
#   - geopandas : read shapefiles + plot maps, the Python analogue of spmap
#
# RUN:  python Figure_2.py
# OUTPUT: output/Figure_2_py.png, output/Figure_2_results_py.csv
# ===========================================================================
import os
import pandas as pd
import geopandas as gpd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("output", exist_ok=True)

# --- 1. GINIW per country (mean over all years) ---------------------------
d = pd.read_csv("data/Figure_2_data.csv")
g = d.groupby("Country_ISO", as_index=False)["GINIW_pred_GDP_pc"].mean()

# --- 2. country polygons (Natural Earth, keyed by iso3) --------------------
shp = gpd.read_file("data/worldmap_countries.shp")
shp = shp.merge(g, left_on="iso3", right_on="Country_ISO", how="left")
shp = shp[shp.iso3 != "ATA"]                         # drop Antarctica

# --- 3. draw the choropleth -----------------------------------------------
fig, ax = plt.subplots(figsize=(9, 4.6))
shp.plot(column="GINIW_pred_GDP_pc", cmap="Reds", ax=ax, legend=True,
         edgecolor="grey", linewidth=0.05,
         missing_kwds={"color": "lightgrey"},
         legend_kwds={"label": "GINIW", "shrink": 0.5})
ax.set_title("Figure 2 (Python): regional inequality within countries (mean GINIW)")
ax.axis("off")
fig.tight_layout(); fig.savefig("output/Figure_2_py.png", dpi=120); plt.close(fig)

# --- 4. key numbers for the comparison ------------------------------------
matched = int(g.Country_ISO.isin(shp.iso3).sum())
res = pd.DataFrame({"metric": ["countries_with_data","matched_to_map",
                               "GINIW_min","GINIW_max"],
                    "value": [len(g), matched,
                              round(g.GINIW_pred_GDP_pc.min(), 4),
                              round(g.GINIW_pred_GDP_pc.max(), 4)]})
res.to_csv("output/Figure_2_results_py.csv", index=False)
print("PY | countries=%d matched=%d GINIW range [%.3f, %.3f]" % (
    len(g), matched, g.GINIW_pred_GDP_pc.min(), g.GINIW_pred_GDP_pc.max()))
