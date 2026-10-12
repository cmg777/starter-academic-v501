#!/usr/bin/env python3
# ===========================================================================
# Table_3.py  --  Python replication of Table 3 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Determinants of sigma-convergence: panel fixed-effects regressions on 5-year
# averages. Each column regresses a regional-inequality index on a CUBIC in log
# national GDP per capita, with country and period fixed effects.
#
# Python twin of Table_3.do / Table_3.R. Reads the SAME data/Table_3_data.csv.
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy linearmodels
#   - pandas/numpy : data handling
#   - linearmodels : PanelOLS = the panel fixed-effects estimator, the Python
#                    analogue of Stata's `xtreg, fe`, with clustered SEs.
#
# RUN:  python Table_3.py        (from inside this folder, or from anywhere)
# OUTPUT: output/Table_3_py.txt (regression table) and
#         output/Table_3_results_py.csv (key numbers, for the README comparison)
# ===========================================================================

import os
import numpy as np
import pandas as pd
from linearmodels.panel import PanelOLS

# --- 0. Make paths portable: run from this script's own folder -------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("output", exist_ok=True)

# --- 1. Read the trimmed data ---------------------------------------------
d = pd.read_csv("data/Table_3_data.csv")

# --- 2. Collapse to 5-year averages (country x period) --------------------
d = d[(d.year >= 1990) & (d.year <= 2014)].copy()
bins = [1989, 1994, 1999, 2004, 2009, 2014]
d["p5"] = pd.cut(d.year, bins=bins, labels=[1, 2, 3, 4, 5]).astype(int)
ineq = ["GDP_pc_Country", "GINIW_pred_GDP_pc", "COVW_pred_GDP_pc",
        "GE_1W_pred_GDP_pc", "GE_0W_pred_GDP_pc", "GE_m1W_pred_GDP_pc"]
# groupby(...).mean() averages each column over its own non-missing values,
# matching Stata `collapse (mean)` (no cross-variable listwise deletion).
agg = d.groupby(["Country_ISO", "p5"], as_index=False)[ineq].mean()

# --- 3. Build the cubic in log GDP per capita -----------------------------
agg["lg"] = np.log(agg["GDP_pc_Country"])
agg["lg2"] = agg["lg"] ** 2
agg["lg3"] = agg["lg"] ** 3

# --- 4. Estimate with PanelOLS (country + period FE, clustered by country) -
# linearmodels needs a MultiIndex of (entity, time). Entity = country
# (-> EntityEffects = country FE); time = p5 (-> TimeEffects = period FE).
agg["cid"] = agg["Country_ISO"].astype("category").cat.codes
panel = agg.set_index(["cid", "p5"])


def fe_fit(dv, rhs):
    """PanelOLS with country + period fixed effects, SEs clustered by country."""
    formula = f"{dv} ~ {rhs} + EntityEffects + TimeEffects"
    return PanelOLS.from_formula(formula, panel, drop_absorbed=True).fit(
        cov_type="clustered", cluster_entity=True)


m1 = fe_fit("GINIW_pred_GDP_pc", "lg")
m2 = fe_fit("GINIW_pred_GDP_pc", "lg + lg2")
m3 = fe_fit("GINIW_pred_GDP_pc", "lg + lg2 + lg3")
m4 = fe_fit("COVW_pred_GDP_pc",  "lg + lg2 + lg3")
m5 = fe_fit("GE_1W_pred_GDP_pc", "lg + lg2 + lg3")
m6 = fe_fit("GE_0W_pred_GDP_pc", "lg + lg2 + lg3")
m7 = fe_fit("GE_m1W_pred_GDP_pc","lg + lg2 + lg3")

# --- 5. Export a regression table -----------------------------------------
with open("output/Table_3_py.txt", "w") as fh:
    fh.write("Table 3 (Python / linearmodels PanelOLS) - sigma-convergence\n\n")
    for name, m in [("(1) GINIW lin", m1), ("(2) GINIW quad", m2),
                    ("(3) GINIW cubic", m3), ("(4) COVW", m4),
                    ("(5) Theil", m5), ("(6) MLD", m6), ("(7) GE(-1)", m7)]:
        fh.write(f"=== {name} ===\n")
        fh.write(m.params.to_string() + "\n")
        fh.write(f"N={int(m.nobs)}\n\n")

# --- 6. Save key numbers for the cross-language comparison -----------------
res = pd.DataFrame({
    "metric": ["col3_GINIW_lg", "col3_GINIW_lg2", "col3_GINIW_lg3",
               "col4_COVW_lg", "col4_COVW_lg2", "col4_COVW_lg3",
               "N_col3", "n_countries"],
    "value": [m3.params["lg"], m3.params["lg2"], m3.params["lg3"],
              m4.params["lg"], m4.params["lg2"], m4.params["lg3"],
              int(m3.nobs), agg["Country_ISO"].nunique()],
})
res.to_csv("output/Table_3_results_py.csv", index=False)

print("PY | GINIW cubic: %.3f / %.3f / %.3f | N=%d | countries=%d" % (
    m3.params["lg"], m3.params["lg2"], m3.params["lg3"],
    int(m3.nobs), agg["Country_ISO"].nunique()))
print("Wrote output/Table_3_py.txt and output/Table_3_results_py.csv")
