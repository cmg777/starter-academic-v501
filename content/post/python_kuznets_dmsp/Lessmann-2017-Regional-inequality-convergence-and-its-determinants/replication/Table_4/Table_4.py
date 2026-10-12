#!/usr/bin/env python3
# ===========================================================================
# Table_4.py  --  Python replication of Table 4 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Determinants of regional inequality WITH CONTROLS. Panel fixed-effects
# regressions on 5-year averages: each column keeps the CUBIC in log national
# GDP per capita from Table 3 and adds a different block of structural controls
# (resources+farming / openness / geography+transport / aid+schooling / ethnic).
# Country + period fixed effects, standard errors clustered by country.
#
# Python twin of Table_4.do / Table_4.R. Reads the SAME data/Table_4_data.csv.
#
# 5 COLUMNS, NOT 6: published column 4 uses `icrg_bureaucratic_qualitiy`, which
# is NOT in the shipped data, so it cannot be reproduced and is skipped here -
# exactly as in Table_4.do. The 5 columns map to published columns 1, 2, 3, 5, 6.
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy linearmodels
#   - pandas/numpy : data handling
#   - linearmodels : PanelOLS = the panel fixed-effects estimator, the Python
#                    analogue of Stata's `xtreg, fe`, with clustered SEs.
#
# RUN:  python Table_4.py        (from inside this folder, or from anywhere)
# OUTPUT: output/Table_4_py.txt (regression table) and
#         output/Table_4_results_py.csv (key numbers, for the README comparison)
# ===========================================================================

import os
import numpy as np
import pandas as pd
from linearmodels.panel import PanelOLS

# --- 0. Make paths portable: run from this script's own folder -------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("output", exist_ok=True)

# --- 1. Read the trimmed data ---------------------------------------------
# pandas keeps the original case-sensitive column names from the CSV header,
# mirroring Stata's `import delimited ... case(preserve)`.
d = pd.read_csv("data/Table_4_data.csv")

# --- 2. Collapse to 5-year averages (country x period) --------------------
d = d[(d.year >= 1990) & (d.year <= 2014)].copy()
bins = [1989, 1994, 1999, 2004, 2009, 2014]
d["p5"] = pd.cut(d.year, bins=bins, labels=[1, 2, 3, 4, 5]).astype(int)
# Variables to average. groupby(...).mean() averages each column over its own
# non-missing values (matching Stata `collapse (mean)`, no listwise deletion).
vars_ = ["GINIW_pred_GDP_pc", "GDP_pc_Country", "Pop_Country",
         "Resources_rents_share_of_GDP", "Arable_land",
         "Trade_GDP_share", "FDI_share_of_GDP",
         "area", "price_gasoline", "Aid", "School_enrollment_secondary",
         "GINIW_Eth_light"]
agg = d.groupby(["Country_ISO", "p5"], as_index=False)[vars_].mean()

# --- 3. Build the cubic in log GDP per capita -----------------------------
agg["log_GDP_pc_Country"] = np.log(agg["GDP_pc_Country"])
agg["log_GDP_pc_Country_2"] = agg["log_GDP_pc_Country"] ** 2
agg["log_GDP_pc_Country_3"] = agg["log_GDP_pc_Country"] ** 3

# --- 4. Build the derived control variables (same as Table_4.do) ----------
# aid_GDP : aid as a share of national GDP (Aid is a level; GDP_pc x Pop = GDP).
agg["aid_GDP"] = agg["Aid"] / (agg["GDP_pc_Country"] * agg["Pop_Country"])
# Rescale percentages to shares so coefficients are comparable.
agg["Resources_rents_share_of_GDP"] = agg["Resources_rents_share_of_GDP"] / 100
agg["School_enrollment_secondary"] = agg["School_enrollment_secondary"] / 100
# Area x fuel price (transport-cost proxy), scaled by 10e+6 = 1e7 to keep units small.
agg["Area_X_price_gasoline"] = agg["area"] * agg["price_gasoline"] / 10e+6

# --- 5. Estimate with PanelOLS (country + period FE, clustered by country) -
# linearmodels needs a MultiIndex of (entity, time). Entity = country code
# (-> EntityEffects = country FE); time = p5 (-> TimeEffects = period FE).
agg["cid"] = agg["Country_ISO"].astype("category").cat.codes
panel = agg.set_index(["cid", "p5"])

CUBIC = "log_GDP_pc_Country + log_GDP_pc_Country_2 + log_GDP_pc_Country_3"


def fe_fit(extra):
    """PanelOLS with country + period fixed effects, SEs clustered by country.

    drop_absorbed handles collinear/absorbed regressors; per-variable NaNs are
    dropped row-wise by linearmodels, matching each column's own sample (so each
    block uses only rows where its own controls are observed)."""
    formula = (f"GINIW_pred_GDP_pc ~ {CUBIC} + {extra}"
               " + EntityEffects + TimeEffects")
    return PanelOLS.from_formula(formula, panel, drop_absorbed=True).fit(
        cov_type="clustered", cluster_entity=True)


m1 = fe_fit("Resources_rents_share_of_GDP + Arable_land")   # col 1: resources + farming
m2 = fe_fit("Trade_GDP_share + FDI_share_of_GDP")           # col 2: openness
m3 = fe_fit("price_gasoline + Area_X_price_gasoline")       # col 3: geography + transport
m4 = fe_fit("aid_GDP + School_enrollment_secondary")        # col 4 (=pub 5): aid + schooling
m5 = fe_fit("GINIW_Eth_light")                              # col 5 (=pub 6): ethnic inequality

# --- 6. Export a regression table -----------------------------------------
with open("output/Table_4_py.txt", "w") as fh:
    fh.write("Table 4 (Python / linearmodels PanelOLS) - regional inequality with controls\n")
    fh.write("5 reproducible columns = published columns 1, 2, 3, 5, 6.\n")
    fh.write("Published column 4 (icrg_bureaucratic_qualitiy) is NOT reproducible - skipped.\n\n")
    for name, m in [("(1) resources + farming", m1), ("(2) openness", m2),
                    ("(3) geography + transport", m3),
                    ("(4=pub5) aid + schooling", m4),
                    ("(5=pub6) ethnic inequality", m5)]:
        fh.write(f"=== {name} ===\n")
        fh.write(m.params.to_string() + "\n")
        fh.write(f"N={int(m.nobs)}\n\n")

# --- 7. Save key numbers for the cross-language comparison -----------------
res = pd.DataFrame({
    "metric": ["col1_rents", "col1_arable", "N_col1",
               "col2_trade", "col2_FDI", "N_col2",
               "col3_gasoline", "col3_Area_X_gasoline", "N_col3",
               "col4_aid_GDP", "col4_school", "N_col4",
               "col5_ethnic", "N_col5"],
    "value": [m1.params["Resources_rents_share_of_GDP"], m1.params["Arable_land"], int(m1.nobs),
              m2.params["Trade_GDP_share"], m2.params["FDI_share_of_GDP"], int(m2.nobs),
              m3.params["price_gasoline"], m3.params["Area_X_price_gasoline"], int(m3.nobs),
              m4.params["aid_GDP"], m4.params["School_enrollment_secondary"], int(m4.nobs),
              m5.params["GINIW_Eth_light"], int(m5.nobs)],
})
res.to_csv("output/Table_4_results_py.csv", index=False)

print("PY | (1) rents %.3f arable %.3f N=%d | (2) trade %.3f FDI %.3f N=%d | "
      "(3) gas %.3f AreaXgas %.3f N=%d | (4) aid %.3f school %.3f N=%d | "
      "(5) ethnic %.3f N=%d" % (
          m1.params["Resources_rents_share_of_GDP"], m1.params["Arable_land"], int(m1.nobs),
          m2.params["Trade_GDP_share"], m2.params["FDI_share_of_GDP"], int(m2.nobs),
          m3.params["price_gasoline"], m3.params["Area_X_price_gasoline"], int(m3.nobs),
          m4.params["aid_GDP"], m4.params["School_enrollment_secondary"], int(m4.nobs),
          m5.params["GINIW_Eth_light"], int(m5.nobs)))
print("Wrote output/Table_4_py.txt and output/Table_4_results_py.csv")
