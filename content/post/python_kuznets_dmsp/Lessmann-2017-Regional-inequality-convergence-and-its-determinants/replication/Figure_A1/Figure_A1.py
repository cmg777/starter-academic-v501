#!/usr/bin/env python3
# ===========================================================================
# Figure_A1.py  --  Python replication of Figure A.1 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Validation / goodness-of-fit scatter for the night-lights income model.
# Each point is one region averaged over 2001-2010. X = model PREDICTED log
# regional GDP per capita; Y = OBSERVED log regional GDP per capita; the black
# 45-degree line (y = x) marks perfect prediction. Three overlaid clouds split
# regions by the World-Bank income tier of their COUNTRY (LIC / MIC / HIC).
#
# Python twin of Figure_A1.do / Figure_A1.R. Reads the SAME data/Figure_A1_data.csv.
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy matplotlib
#
# RUN:  python Figure_A1.py
# OUTPUT: output/Figure_A1_py.png, output/Figure_A1_results_py.csv
# ===========================================================================
import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")                 # headless backend (no display needed)
import matplotlib.pyplot as plt

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))   # cd to this script's folder
os.makedirs("output", exist_ok=True)                   # ensure output/ exists

# --- 1. read (case-sensitive headers, incl. source typo "code_Coutry_Region") -
d = pd.read_csv("data/Figure_A1_data.csv")             # pandas preserves the exact header names

# --- 2. decade window 2001-2010 -------------------------------------------
d = d[(d.year > 2000) & (d.year < 2011)].copy()        # same window as the .do

# --- 3. collapse to region means (one point per region) -------------------
# average every numeric series over the decade, grouped by the region id, so each
# region appears exactly once -- mirrors Stata's collapse (mean) ..., by(code_Coutry_Region).
num = ["GDP_pc_Country","GDP_pc_Region","log_GDP_pc_Region",
       "pred_log_GDP_pc_Region","pred_GDP_pc_Region","Pix_Region","Pop_Region"]
agg = d.groupby("code_Coutry_Region", as_index=False)[num].mean()

# --- 4. income tier from the COUNTRY GDP (World-Bank fixed-$ cutoffs) ------
# < 4089 = LIC ; 4089-12615 = MIC ; > 12615 = HIC.
def tier(g):
    return "LIC" if g < 4089 else ("HIC" if g > 12615 else "MIC")
agg["tier"] = agg["GDP_pc_Country"].map(tier)

# --- 5. key numbers: n regions + corr(observed, predicted) ----------------
n_reg = len(agg)                                       # number of region points plotted
corr  = agg["log_GDP_pc_Region"].corr(agg["pred_log_GDP_pc_Region"])  # Pearson corr obs vs pred

# --- 6. Figure A.1: three scatters + 45-degree line -----------------------
# marker per tier (triangle/plus/hollow circle echoing Stata msymbol t/+/O).
styles = {"LIC": dict(marker="^", facecolors="none", edgecolors="C0", s=18),
          "MIC": dict(marker="+", c="C1", s=24),
          "HIC": dict(marker="o", facecolors="none", edgecolors="C2", s=22)}
fig, ax = plt.subplots(figsize=(5.2, 4.6))
ax.plot([5.5, 12], [5.5, 12], color="black")           # 45-degree line y = x
for t in ["LIC", "MIC", "HIC"]:
    s = agg[agg.tier == t]
    ax.scatter(s.pred_log_GDP_pc_Region, s.log_GDP_pc_Region, label=t, alpha=0.7, **styles[t])
ax.set(xlim=(5.5, 12), ylim=(5.5, 12),                 # same plotting box as Stata
       xlabel="log (predicted regional GDP per capita)",
       ylabel="log (observed regional GDP per capita)",
       title="Figure A.1 (Python): Predicted vs observed regional GDP")
ax.text(6, 11.5, "n = %d  |  r = %.3f" % (n_reg, corr), fontsize=8)  # report the fit on the plot
ax.legend(loc="lower right")                           # key INSIDE, lower-right (Stata pos 5)
fig.tight_layout(); fig.savefig("output/Figure_A1_py.png", dpi=120); plt.close(fig)

# --- 7. key numbers for the comparison ------------------------------------
res = pd.DataFrame({"metric": ["n_regions","corr_obs_pred","n_LIC","n_MIC","n_HIC"],
                    "value":  [n_reg, corr,
                               int((agg.tier == "LIC").sum()),
                               int((agg.tier == "MIC").sum()),
                               int((agg.tier == "HIC").sum())]})
res.to_csv("output/Figure_A1_results_py.csv", index=False)
print("PY | n regions = %d | corr(obs,pred) = %.4f | LIC/MIC/HIC = %d/%d/%d" % (
    n_reg, corr, (agg.tier=="LIC").sum(), (agg.tier=="MIC").sum(), (agg.tier=="HIC").sum()))
