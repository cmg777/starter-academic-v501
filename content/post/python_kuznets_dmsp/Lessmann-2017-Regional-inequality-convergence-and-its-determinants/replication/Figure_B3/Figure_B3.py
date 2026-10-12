#!/usr/bin/env python3
# ===========================================================================
# Figure_B3.py  --  Python replication of Figure B.3 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Regional inequality (GINIW) in Germany, 2000-2012: a single-country
# time-series line plot of within-country regional inequality. It shows how
# Germany's partial regional inequality (the population-weighted Gini of
# predicted regional income) evolves year by year.
#
# Python twin of Figure_B3.do / Figure_B3.R. Reads the SAME
# data/Figure_B3_data.csv, subsets to Germany 2000-2012, draws the 13-point line.
#
# REQUIRED PACKAGES (install once):
#   pip install pandas matplotlib
#
# RUN:  python Figure_B3.py
# OUTPUT: output/Figure_B3_py.png, output/Figure_B3_results_py.csv
# ===========================================================================
import os
import pandas as pd
import matplotlib
matplotlib.use("Agg")            # headless backend (no display needed)
import matplotlib.pyplot as plt

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))   # run from the script's folder
os.makedirs("output", exist_ok=True)                   # ensure output/ exists

# --- 1. read data ---------------------------------------------------------
# Column names are CASE-SENSITIVE and used exactly as in the CSV header
# (Country_ISO, year, GINIW_pred_GDP_pc) -- mirrors import delimited, case(preserve).
d = pd.read_csv("data/Figure_B3_data.csv")

# --- 2. subset to Germany 2000-2012 ---------------------------------------
# keep if Country_ISO=="DEU"  -> the German country panel only
# keep if year>1999 & year<2013 -> the 2000-2012 window (13 yearly rows)
g = d[(d.Country_ISO == "DEU") & (d.year > 1999) & (d.year < 2013)].copy()
g = g.sort_values("year")                              # ensure chronological order

# --- 3. Figure B.3 (line plot) --------------------------------------------
# Line of GINIW against year. Axis limits/breaks mirror the do-file:
#   xlabel(2000(2)2012)            -> x ticks every 2 years
#   ylabel(0.025(0.002)0.035)      -> y window pinned to the paper's band, no grid
fig, ax = plt.subplots(figsize=(3.1, 2.8))             # paper's small panel aspect
ax.plot(g.year, g.GINIW_pred_GDP_pc, color="black")    # single black series (no legend)
ax.set_xticks(range(2000, 2013, 2))                    # ticks every 2 years
ax.set_ylim(0.025, 0.035)                              # pin y-range to paper window
ax.grid(False)                                         # nogrid: no horizontal grid
ax.set_xlabel("Year")
ax.set_ylabel("Partial regional inequality (GINIW)")
ax.set_title("Figure B.3 (Python): Regional inequality in Germany, 2000-2012",
             fontsize=8)
fig.tight_layout()
fig.savefig("output/Figure_B3_py.png", dpi=200)
plt.close(fig)

# --- 4. key numbers for the comparison ------------------------------------
v2000 = float(g.loc[g.year == 2000, "GINIW_pred_GDP_pc"].iloc[0])  # first point
v2012 = float(g.loc[g.year == 2012, "GINIW_pred_GDP_pc"].iloc[0])  # last point
res = pd.DataFrame({"metric": ["n_points","GINIW_2000","GINIW_2012",
                               "GINIW_min","GINIW_max"],
                    "value": [len(g), v2000, v2012,
                              float(g.GINIW_pred_GDP_pc.min()),
                              float(g.GINIW_pred_GDP_pc.max())]})
res.to_csv("output/Figure_B3_results_py.csv", index=False)
print("PY | n_points %d | GINIW 2000 %.5f -> 2012 %.5f" % (len(g), v2000, v2012))
