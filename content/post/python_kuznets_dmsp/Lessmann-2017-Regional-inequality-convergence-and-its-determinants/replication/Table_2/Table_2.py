#!/usr/bin/env python3
# ===========================================================================
# Table_2.py  --  Python replication of Table 2 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Correlation between PREDICTED-income, OBSERVED-income and LIGHT-density
# measures of regional inequality, cross-section mean of 2001-2012. For each of
# FIVE population-weighted inequality indices (Gini, GE(-1), MLD GE(0),
# Theil GE(1), CV) we build three versions per country-year (from predicted GDP
# pc, observed GDP pc, and raw light pc), average each over 2001-2012 to one
# value per country, then correlate the predicted and light versions against the
# observed version across countries.
#
# Python twin of Table_2.do / Table_2.R. Reads the SAME data/Table_2_data.csv.
# Stata uses `ineqdeco`; here we implement the weighted indices FROM FIRST
# PRINCIPLES (they match ineqdeco for GE(-1),MLD,Theil,CV; the weighted Gini may
# differ slightly from ineqdeco's algorithm - DOCUMENTED in the README).
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy
#   - pandas/numpy : data handling and the inequality math
#
# RUN:  python Table_2.py        (from inside this folder, or from anywhere)
# OUTPUT: output/Table_2_py.txt (the five correlation matrices) and
#         output/Table_2_results_py.csv (the 10 key correlations, for README)
# ===========================================================================

import os
import numpy as np
import pandas as pd

# --- 0. Make paths portable: run from this script's own folder -------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("output", exist_ok=True)

# --- 1. Read the data (case-sensitive column names) ------------------------
# pandas keeps the original column case, matching Stata `import delimited,
# case(preserve)`.
d = pd.read_csv("data/Table_2_data.csv")

# --- 2. Light per capita + restrict to the 2001-2012 window ----------------
d["Light_pc_Region"] = d["Light_Region"] / d["Pop_Region"]   # raw light proxy
d = d[(d.year > 2000) & (d.year < 2013)].copy()              # cross-section


# --- 3. Population-weighted inequality indices (from first principles) ------
# For values y with population weights w: weighted mean mu = sum(w*y)/sum(w),
# population shares p = w/sum(w), and relative incomes r = y/mu. Then:
#   GE(-1) = 0.5*(sum p*r^-1 - 1) ; GE(0)=MLD = sum p*(-log r) ;
#   GE(1)=Theil = sum p*r*log r   ; GE(2) = 0.5*(sum p*r^2 - 1) ;
#   CV = sqrt(2*GE(2)).
#   Gini = sum_i sum_j w_i w_j |y_i - y_j| / (2*(sum w)^2 * mu).
# These reproduce ineqdeco's GE class and CV exactly; the weighted Gini follows
# the standard double-sum definition (ineqdeco may differ - see README).
def ineq_indices(y, w):
    y = np.asarray(y, float)
    w = np.asarray(w, float)
    ok = np.isfinite(y) & np.isfinite(w) & (w > 0) & (y > 0)  # ineqdeco needs y>0
    y, w = y[ok], w[ok]
    if y.size < 2:
        return dict(GINIW=np.nan, GE_m1W=np.nan, GE_0W=np.nan,
                    GE_1W=np.nan, COVW=np.nan)
    sw = w.sum()
    mu = (w * y).sum() / sw          # population-weighted mean
    p = w / sw                       # population shares
    r = y / mu                       # relative incomes
    ge_m1 = 0.5 * ((p * r ** -1).sum() - 1)        # GE(-1)
    ge_0 = (p * (-np.log(r))).sum()                # GE(0) = MLD
    ge_1 = (p * r * np.log(r)).sum()               # GE(1) = Theil
    ge_2 = 0.5 * ((p * r ** 2).sum() - 1)          # GE(2)
    cv = np.sqrt(2 * ge_2)                          # coefficient of variation
    # weighted Gini via double-sum of weighted absolute differences
    gini = (np.abs(y[:, None] - y[None, :]) * np.outer(w, w)).sum() \
        / (2 * sw ** 2 * mu)
    return dict(GINIW=gini, GE_m1W=ge_m1, GE_0W=ge_0, GE_1W=ge_1, COVW=cv)


# --- 4. One index set per country-year, per base variable ------------------
# Map each base variable to the suffix used in the Stata output names.
bases = {"pred_GDP_pc": "pred_GDP_pc_Region",   # satellite-predicted income
         "GDP_pc":      "GDP_pc_Region",        # observed income
         "Light_pc":    "Light_pc_Region"}      # raw light density
order = ["GINIW", "GE_m1W", "GE_0W", "GE_1W", "COVW"]

# For each (country, year) group compute the 5 indices for every base variable.
rows = []
for (iso, yr), g in d.groupby(["Country_ISO", "year"]):
    rec = {"Country_ISO": iso, "year": yr}
    for suf, var in bases.items():
        vals = ineq_indices(g[var], g["Pop_Region"])
        for k in order:
            rec[f"{k}_{suf}"] = vals[k]
    rows.append(rec)
per_cy = pd.DataFrame(rows)

# --- 5. Collapse to one row per country (mean over 2001-2012) ---------------
# The indices are constant within a country-year; averaging gives the
# cross-section value used in the manuscript.
val_cols = [c for c in per_cy.columns if c not in ("Country_ISO", "year")]
collapsed = per_cy.groupby("Country_ISO", as_index=False)[val_cols].mean()

# --- 6. The 10 correlations (predicted-vs-observed, light-vs-observed) ------
# For each index, correlate the predicted and light versions against the
# observed version across countries (pairwise complete = Stata pwcorr).
labs = ["Gini", "GE(-1)", "MLD GE(0)", "Theil GE(1)", "CV"]


def corr(a, b):
    return collapsed[a].corr(collapsed[b])   # Pearson, pairwise-complete


pred_obs = [corr(f"{i}_pred_GDP_pc", f"{i}_GDP_pc") for i in order]
light_obs = [corr(f"{i}_Light_pc", f"{i}_GDP_pc") for i in order]

# --- 7. Write the five correlation matrices to a log file ------------------
with open("output/Table_2_py.txt", "w") as fh:
    fh.write("Table 2 (Python, weighted indices from first principles)\n")
    fh.write(f"Cross-section 2001-2012; correlations across "
             f"{len(collapsed)} countries\n\n")
    for i, lab in zip(order, labs):
        cols = [f"{i}_pred_GDP_pc", f"{i}_GDP_pc", f"{i}_Light_pc"]
        m = collapsed[cols].corr()
        m.index = m.columns = ["pred", "obs", "light"]
        fh.write(f"=== {lab} ===\n")
        fh.write(m.round(4).to_string() + "\n\n")

# --- 8. Save key numbers for the cross-language comparison ------------------
res = pd.DataFrame({"index": labs,
                    "pred_vs_obs": np.round(pred_obs, 4),
                    "light_vs_obs": np.round(light_obs, 4)})
res.to_csv("output/Table_2_results_py.csv", index=False)

# --- 9. Console summary ----------------------------------------------------
print(f"PY | countries={len(collapsed)}")
print("PY | predicted-vs-observed:",
      "  ".join(f"{l}={v:.2f}" for l, v in zip(labs, pred_obs)))
print("PY | light-vs-observed:    ",
      "  ".join(f"{l}={v:.2f}" for l, v in zip(labs, light_obs)))
print("Wrote output/Table_2_py.txt and output/Table_2_results_py.csv")
