#!/usr/bin/env python3
# ===========================================================================
# Figure_5.py  --  Python replication of Figure 5a (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Cross-country scatter of INTERPERSONAL inequality (household income Gini,
# Giniall rescaled to 0-1) against INTERREGIONAL inequality (GINIW), each a
# 2001-2012 country mean, with a blue OLS fit line. Countries with wide gaps
# BETWEEN regions also tend to have wide gaps BETWEEN people (positive slope).
#
# Python twin of Figure_5.do / Figure_5.R. Reads the SAME data/Figure_5_data.csv.
#
# Panel 5b (risk of internal conflict vs GINIW) is NOT reproducible: it needs
# the licensed ICRG internal-conflict series, which ships with no dataset in
# this repo. We do not attempt it here (see do-file Sections 7-8, p.127).
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy matplotlib
#
# RUN:  python Figure_5.py
# OUTPUT: output/Figure_5_a_py.png, output/Figure_5_results_py.csv
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

# --- 1. read the country-year panel ---------------------------------------
d = pd.read_csv("data/Figure_5_data.csv")              # case-preserved headers

# --- 2. restrict to the 2001-2012 window the paper averages over ----------
d = d[(d.year > 2000) & (d.year < 2013)].copy()        # mirrors `keep if year>2000 & year<2013`

# --- 3. collapse the annual panel to ONE mean per country -----------------
# Stata: collapse (mean) GINIW_pred_GDP_pc Giniall, by(Country_ISO)
# groupby().mean() skips NaN by default, so a partly-missing series still
# yields the available mean (matching Stata's collapse behaviour).
agg = (d.groupby("Country_ISO", as_index=False)
         [["GINIW_pred_GDP_pc", "Giniall"]].mean())

# --- 4. normalisation to [0,1] --------------------------------------------
# Giniall (household income Gini) is on a 0-100 scale; GINIW is on 0-1. Rescale
# so both axes are comparable. Countries with no household Gini drop out here.
agg["GINIall_100"] = agg["Giniall"] / 100              # gen GINIall_100 = Giniall/100
plt_df = agg.dropna(subset=["GINIall_100", "GINIW_pred_GDP_pc"])  # keep complete pairs

# --- 5. OLS fit line (numpy.polyfit, degree 1 = the lfit overlay) ---------
# Regress interpersonal on interregional inequality; the slope is the headline.
slope, icept = np.polyfit(plt_df["GINIW_pred_GDP_pc"], plt_df["GINIall_100"], 1)

# --- 6. Figure 5a: scatter + blue OLS line --------------------------------
fig, ax = plt.subplots(figsize=(5, 4.5))
ax.scatter(plt_df["GINIW_pred_GDP_pc"], plt_df["GINIall_100"],
           marker="^", facecolors="none", edgecolors="black", s=22)  # open triangles (msymbol(t))
xs = np.linspace(plt_df["GINIW_pred_GDP_pc"].min(),
                 plt_df["GINIW_pred_GDP_pc"].max(), 200)
ax.plot(xs, slope * xs + icept, color="blue")          # blue OLS line (lcolor(blue))
ax.set(xlabel="Interregional inequality: GINIW",
       ylabel="Interpersonal inequality: GINI",
       title="Figure 5a (Python): regional vs personal inequality")
fig.tight_layout(); fig.savefig("output/Figure_5_a_py.png", dpi=120); plt.close(fig)

# --- 7. key numbers for the comparison ------------------------------------
res = pd.DataFrame({"metric": ["n_countries","ols_slope","ols_intercept",
                               "mean_GINIW","mean_GINIall_100"],
                    "value": [len(plt_df), slope, icept,
                              plt_df["GINIW_pred_GDP_pc"].mean(),
                              plt_df["GINIall_100"].mean()]})
res.to_csv("output/Figure_5_results_py.csv", index=False)
print("PY | n=%d countries | OLS slope %.4f (intercept %.4f)" % (
    len(plt_df), slope, icept))
