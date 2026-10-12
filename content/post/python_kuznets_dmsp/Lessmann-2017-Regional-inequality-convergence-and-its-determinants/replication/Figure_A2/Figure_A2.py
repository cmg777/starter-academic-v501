#!/usr/bin/env python3
# ===========================================================================
# Figure_A2.py  --  Python replication of Figure A.2 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Validation scatter: satellite-PREDICTED regional GDP per capita (x) vs
# directly OBSERVED regional GDP per capita (y), 2001-2010 averages, with each
# region split into three REGIONAL OUTPUT-DENSITY tiers (LDIR/MDIR/HDIR) plus
# the 45-degree (y = x) perfect-prediction line.
#
# Python twin of Figure_A2.do / Figure_A2.R. Reads the SAME
# data/Figure_A2_data.csv and reports the same headline numbers
# (n regions + corr(observed, predicted); see README).
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy matplotlib
#
# RUN:  python Figure_A2.py
# OUTPUT: output/Figure_A2_py.png, output/Figure_A2_results_py.csv
# ===========================================================================
import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")            # headless backend (no display needed)
import matplotlib.pyplot as plt

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))   # run from script's dir
os.makedirs("output", exist_ok=True)

# --- 1. read the region-year panel ----------------------------------------
# case-sensitive headers exactly as the .do reads them (case(preserve)).
d = pd.read_csv("data/Figure_A2_data.csv")

# --- 2. collapse to one cross-section row per region (2001-2010) -----------
# keep the 2001-2010 window, then average each region down to ONE row.
# code_Coutry_Region is the unique region id (original misspelling kept).
d = d[(d.year > 2000) & (d.year < 2011)].copy()        # mirrors keep if year>2000 & <2011
reg = (d.groupby("code_Coutry_Region", as_index=False)
         .agg(Region_NAME=("Region_NAME", "first"),    # (firstnm) carries label through
              Country_ISO=("Country_ISO", "first"),     # (firstnm)
              GDP_pc_Country=("GDP_pc_Country", "mean"), # (mean) averages over 2001-2010
              GDP_pc_Region=("GDP_pc_Region", "mean"),
              log_GDP_pc_Region=("log_GDP_pc_Region", "mean"),            # y-axis
              pred_log_GDP_pc_Region=("pred_log_GDP_pc_Region", "mean"),  # x-axis
              pred_GDP_pc_Region=("pred_GDP_pc_Region", "mean"),
              Pix_Region=("Pix_Region", "mean"),
              Pop_Region=("Pop_Region", "mean")))

# --- 3. build regional output density --------------------------------------
# density = total regional output / lit area = (GDP pc * population) / pixels.
reg["GDP_dens_Region"] = (reg.GDP_pc_Region * reg.Pop_Region) / reg.Pix_Region

# --- 4. assign the three fixed density tiers ------------------------------
# fixed cutoffs from the original: 168071.5 and 1478853.
reg["dtier"] = np.where(reg.GDP_dens_Region < 168071.5, "LDIR",
                np.where(reg.GDP_dens_Region < 1478853, "MDIR", "HDIR"))

# --- 5. Figure A.2 ---------------------------------------------------------
# one scatter per tier (dot/triangle/square) + the y = x line over 5.5-12.
styles = {"LDIR": ("o", "C3"), "MDIR": ("^", "C2"), "HDIR": ("s", "C0")}
fig, ax = plt.subplots(figsize=(6, 5))
for tier, (mk, col) in styles.items():                 # iterate tiers low->high
    s = reg[reg.dtier == tier]
    ax.scatter(s.pred_log_GDP_pc_Region, s.log_GDP_pc_Region,
               marker=mk, c=col, s=14, label=tier)
ax.plot([5.5, 12], [5.5, 12], color="black")           # 45-degree y = x line
ax.set(xlim=(5.5, 12), ylim=(5.5, 12),                 # match Stata range(5.5 12)
       xlabel="log (predicted regional GDP per capita)",
       ylabel="log (observed regional GDP per capita)",
       title="Figure A.2 (Python): predicted vs observed regional GDP by output density")
ax.legend(title="dtier", loc="lower right")            # legend inside, lower-right
fig.tight_layout(); fig.savefig("output/Figure_A2_py.png", dpi=120); plt.close(fig)

# --- 6. headline numbers for the comparison -------------------------------
n_reg = len(reg)                                                       # n regions
corr  = float(np.corrcoef(reg.pred_log_GDP_pc_Region, reg.log_GDP_pc_Region)[0, 1])
res = pd.DataFrame({
    "metric": ["n_regions", "corr_obs_pred", "n_LDIR", "n_MDIR", "n_HDIR"],
    "value":  [n_reg, corr,
               int((reg.dtier == "LDIR").sum()), int((reg.dtier == "MDIR").sum()),
               int((reg.dtier == "HDIR").sum())]})
res.to_csv("output/Figure_A2_results_py.csv", index=False)
print("PY | n_regions %d | corr(obs,pred) %.4f | LDIR/MDIR/HDIR %d/%d/%d" % (
    n_reg, corr, int((reg.dtier == "LDIR").sum()),
    int((reg.dtier == "MDIR").sum()), int((reg.dtier == "HDIR").sum())))
