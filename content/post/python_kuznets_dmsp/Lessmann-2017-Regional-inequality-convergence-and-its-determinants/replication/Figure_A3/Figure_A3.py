#!/usr/bin/env python3
# ===========================================================================
# Figure_A3.py  --  Python replication of Figure A.3 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# USA 2010: night-lights PREDICTED log GDP per capita (x) vs OBSERVED log GDP
# per capita (y) for the 51 US states/regions, split into three price tiers by
# Regional Price Parity (RPP), with a 45-degree (y = x) reference line.
#   LRPP (low  price): RPP < 90.2          MRPP (mid): 90.2 < RPP < 102.8
#   HRPP (high price): RPP > 102.8
#
# Python twin of Figure_A3.do / Figure_A3.R. Reads the SAME data/Figure_A3_data.csv.
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy matplotlib
#
# RUN:  python Figure_A3.py
# OUTPUT: output/Figure_A3_py.png, output/Figure_A3_results_py.csv
# ===========================================================================
import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")            # headless backend (no display needed)
import matplotlib.pyplot as plt

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))   # cd to this script's folder
os.makedirs("output", exist_ok=True)                   # ensure output/ exists

# --- 1. read --------------------------------------------------------------
# Column names are CASE-SENSITIVE; the .do reads them with case(preserve), so the
# names used below match the CSV header exactly.
d = pd.read_csv("data/Figure_A3_data.csv")

# --- 2. keep the USA in 2010 ----------------------------------------------
# Single cross-section. RPP is only populated for US states, so this filter also
# drops every missing-RPP row (the figure plots only states that have an RPP).
d = d[(d.year == 2010) & (d.Country_ISO == "USA")].copy()
n = len(d)                                              # expect 51 states/regions
assert n == 51, n                                       # manuscript sanity check

# --- 3. three price tiers by RPP cut-offs ---------------------------------
# Cut-offs 90.2 and 102.8 split the states into roughly equal thirds (same as .do).
def tier(rpp):
    return "LRPP" if rpp < 90.2 else ("MRPP" if rpp < 102.8 else "HRPP")
d["tier"] = d.RPP.map(tier)

# --- 4. headline number: correlation (predicted vs observed) --------------
r = np.corrcoef(d.pred_log_GDP_pc_Region, d.log_GDP_pc_Region)[0, 1]  # Pearson

# --- 5. Figure A.3 --------------------------------------------------------
# Scatter coloured + shaped by tier, state-name labels, and the 45-degree line.
rng = (10.2, 11.1)                                      # same plotted range as .do
style = {"LRPP": ("tab:red",   "^"),                   # low  price: triangle
         "MRPP": ("tab:green", "+"),                   # mid  price: plus
         "HRPP": ("tab:blue",  "o")}                   # high price: circle
fig, ax = plt.subplots(figsize=(6, 5.2))
ax.plot(rng, rng, color="black")                       # 45-degree y = x line
for t, (col, mk) in style.items():                     # one scatter call per tier
    g = d[d.tier == t]
    if mk == "o":                                      # hollow circle like Stata msymbol(O)
        ax.scatter(g.pred_log_GDP_pc_Region, g.log_GDP_pc_Region,
                   facecolors="none", edgecolors=col, marker=mk, s=36, label=t)
    else:                                              # filled triangle / plus marker
        ax.scatter(g.pred_log_GDP_pc_Region, g.log_GDP_pc_Region,
                   c=col, marker=mk, s=36, label=t)
for _, row in d.iterrows():                             # state-name labels
    ax.annotate(row.Region_NAME, (row.pred_log_GDP_pc_Region, row.log_GDP_pc_Region),
                fontsize=5, xytext=(0, 4), textcoords="offset points")
ax.set(xlim=rng, ylim=rng,
       xlabel="log (predicted regional GDP per capita)",
       ylabel="log (observed regional GDP per capita)",
       title="Figure A.3 (Python): USA 2010 - predicted vs observed regional GDP")
ax.legend(title="RPP tier", loc="lower right")         # legend inside, ~5 o'clock
fig.tight_layout(); fig.savefig("output/Figure_A3_py.png", dpi=130); plt.close(fig)

# --- 6. key numbers for the comparison ------------------------------------
res = pd.DataFrame({
    "metric": ["n", "n_LRPP", "n_MRPP", "n_HRPP", "corr_pred_obs"],
    "value":  [n, int((d.tier == "LRPP").sum()), int((d.tier == "MRPP").sum()),
               int((d.tier == "HRPP").sum()), r]})
res.to_csv("output/Figure_A3_results_py.csv", index=False)
print("PY | n=%d | tiers L/M/H = %d/%d/%d | corr=%.4f" % (
    n, (d.tier == "LRPP").sum(), (d.tier == "MRPP").sum(),
    (d.tier == "HRPP").sum(), r))
