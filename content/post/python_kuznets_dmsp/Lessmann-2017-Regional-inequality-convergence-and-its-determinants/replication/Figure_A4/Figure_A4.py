#!/usr/bin/env python3
# ===========================================================================
# Figure_A4.py  --  Python replication of Figure A.4 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# National PREDICTED vs OBSERVED GDP per capita, a validation scatter. The
# authors' night-lights prediction of national GDP pc (pred_GDP_pc_Country) is
# checked against observed GDP pc, split by data source via the geroli_dum flag:
#   geroli_dum==1 -> has Gennaioli et al. (2014) observed data (a 78-cty subset)
#   geroli_dum==0 -> predicted-only countries
# log(observed) is plotted vs log(predicted) with a 45-degree reference line;
# good prediction => points lie near y = x.
#
# Python twin of Figure_A4.do / Figure_A4.R. Reads the SAME data CSV.
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy matplotlib
#
# RUN:  python Figure_A4.py
# OUTPUT: output/Figure_A4_py.png, output/Figure_A4_results_py.csv
# ===========================================================================
import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")            # headless backend (no display needed)
import matplotlib.pyplot as plt

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))   # cd to script's folder
os.makedirs("output", exist_ok=True)                   # ensure output/ exists

# --- 1. read CSV ----------------------------------------------------------
# Column names are case-sensitive, exactly as in the header (Stata case(preserve)).
d = pd.read_csv("data/Figure_A4_data.csv")

# --- 2. restrict to 2001-2010 ---------------------------------------------
# Cross-sectional figure: keep the decade of overlap, then average per country.
d = d[(d.year > 2000) & (d.year < 2011)].copy()

# --- 3. collapse to one row per country (means of the three GDP series) ----
# .mean() ignores NaN, mimicking Stata's collapse (mean) over missing "." values.
agg = (d.groupby("Country_ISO", as_index=False)
         [["GDP_pc_Country", "pred_GDP_pc_Country", "GDP_pc_Country_G"]].mean())

# --- 4. logs and the data-source flag -------------------------------------
agg["log_GDP_pc_Country"]      = np.log(agg["GDP_pc_Country"])       # log observed (WB)
agg["log_pred_GDP_pc_Country"] = np.log(agg["pred_GDP_pc_Country"])  # log predicted (lights)
# geroli_dum: 1 if the country HAS Gennaioli observed data, 0 otherwise
# (all-missing Gennaioli countries collapse to NaN).
agg["geroli_dum"] = agg["GDP_pc_Country_G"].notna().astype(int)

# --- 5. headline counts ---------------------------------------------------
n_total     = len(agg)                          # all countries with a prediction
n_gennaioli = int((agg.geroli_dum == 1).sum())  # subset with Gennaioli observed data

# --- 6. Figure A.4 --------------------------------------------------------
# Two scatters of log-observed vs log-predicted, split by data source, plus the
# 45-degree reference line y = x over the data range [5.5, 12].
#   - triangles = Gennaioli-observed subset (geroli_dum==1) -> "observed data"
#   - circles   = predicted-only countries  (geroli_dum==0) -> "predicted data"
#   - annotate labels each marker with its ISO code (small, to stay readable).
fig, ax = plt.subplots(figsize=(6, 5))
ax.plot([5.5, 12], [5.5, 12], color="black", zorder=1)   # 45-degree line y=x
groups = [(1, "observed data", "^", "#F8766D"),          # triangle, ggplot red
          (0, "predicted data", "o", "#00BFC4")]          # circle, ggplot teal
for flag, lab, marker, col in groups:
    g = agg[agg.geroli_dum == flag]
    ax.scatter(g.log_pred_GDP_pc_Country, g.log_GDP_pc_Country,
               marker=marker, s=14, color=col, label=lab, zorder=2)
    for _, r in g.iterrows():
        ax.annotate(r.Country_ISO, (r.log_pred_GDP_pc_Country, r.log_GDP_pc_Country),
                    fontsize=4, xytext=(0, 3), textcoords="offset points")
ax.set(xlim=(5.5, 12), ylim=(5.5, 12),
       xlabel="log (predicted national GDP pc)",
       ylabel="log (observed national GDP pc)",
       title="Figure A.4 (Python): national predicted vs observed GDP pc")
ax.legend(loc="lower right")                              # key inside, lower-right
fig.tight_layout(); fig.savefig("output/Figure_A4_py.png", dpi=130); plt.close(fig)

# --- 7. key numbers for the comparison ------------------------------------
res = pd.DataFrame({"metric": ["n_countries_total", "n_gennaioli_observed"],
                    "value":  [n_total, n_gennaioli]})
res.to_csv("output/Figure_A4_results_py.csv", index=False)
print("PY | %d countries total | %d with Gennaioli observed data" % (
    n_total, n_gennaioli))
