#!/usr/bin/env python3
# ===========================================================================
# run_all.py  --  Python port of the 00_Main_Dataset pipeline (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Rebuilds the master dataset from the raw nighttime-lights panels, mirroring
# config.do + 01/02/03_*.do:
#   STEP 1  estimate lights -> regional GDP (Table 1 col 7) and predict worldwide
#   STEP 2  population-weighted regional inequality per country-year
#   STEP 3  merge with country controls -> Main_Data
#
# Python twin of the Stata pipeline. Edit the CONFIG block to point at new data.
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy linearmodels
#   - linearmodels.RandomEffects : the Python analogue of Stata `xtreg, re`
#
# RUN:  python run_all.py          OUTPUT: output/Main_Data_py.csv (+ spot-checks)
# ===========================================================================
import os
import numpy as np
import pandas as pd
from linearmodels.panel import RandomEffects

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("output", exist_ok=True)

# ====================== CONFIG (edit for new data) ========================
F_TRAIN, F_WORLD, F_COUNTRY = "data/Prediction_Data.csv", "data/Regional_Data_SL.csv", "data/Country_DATA.csv"
ID_REGION, ID_COUNTRY, TIME = "code_Coutry_Region", "Country_ISO", "year"
LIGHTS = "log_Light_ppix_Region"
X_CORE = ["log_GDP_pc_Country", "log_N_pix_top_cod_1_ppix", "log_N_pix_low_cod_1_ppix", "log_area", "log_region"]
X_INTER, WORLD_INTER = "log_region_X_log_area", "log_region_log_area"
FE_SAT = [f"satyear_{i}" for i in range(1, 8)]
FE_GROUP = ["eap", "ssa", "mena", "lac", "eca", "sa"]
DEPVAR, POP_REGION = "log_GDP_pc_Region", "Pop_Region"
INEQ_WEIGHT = "Pop_Region"
# ==========================================================================
RHS = [LIGHTS] + X_CORE + [X_INTER] + FE_SAT + FE_GROUP

# --- STEP 1: estimate lights->GDP (random effects) and predict worldwide ---
print("STEP 1: prediction model...")
train = pd.read_csv(F_TRAIN)
train["_e"] = train[ID_REGION]
panel = train.set_index([ID_REGION, TIME])
mod = RandomEffects(panel[DEPVAR], panel[RHS].assign(const=1.0)).fit()
b = mod.params
print(f"  beta[log lights] = {b[LIGHTS]:.4f} ; beta[log GDP pc country] = {b['log_GDP_pc_Country']:.4f}")

world = pd.read_csv(F_WORLD).rename(columns={WORLD_INTER: X_INTER})
lp = b["const"] + sum(b[v] * world[v] for v in RHS)
world["pred_GDP_pc_Region"] = np.exp(lp)
world = world[np.isfinite(world["pred_GDP_pc_Region"])]

# --- STEP 2: population-weighted inequality per country-year --------------
print("STEP 2: inequality indices (weighted)...")
def winq(y, w):
    """Population-weighted Gini, GE(-1), MLD, Theil, CV - same as Stata ineqdeco."""
    m = np.isfinite(y) & np.isfinite(w) & (y > 0) & (w > 0)
    y, w = y[m], w[m]
    if y.size < 2:
        return pd.Series([np.nan]*5, index=["GINIW","GE_m1W","GE_0W","GE_1W","COVW"])
    W = w.sum(); mu = (w*y).sum()/W; r = y/mu; p = w/W
    gini = (w[:, None]*w[None, :]*np.abs(y[:, None]-y[None, :])).sum() / (2*W**2*mu)  # |y_i - y_j|
    ge2 = 0.5*((p*r**2).sum()-1)
    return pd.Series([gini, 0.5*((p/r).sum()-1), (p*-np.log(r)).sum(),
                      (p*r*np.log(r)).sum(), np.sqrt(2*ge2)],
                     index=["GINIW","GE_m1W","GE_0W","GE_1W","COVW"])

idx = (world.groupby([ID_COUNTRY, TIME])
            .apply(lambda s: winq(s["pred_GDP_pc_Region"].to_numpy(), s[INEQ_WEIGHT].to_numpy()),
                   include_groups=False)
            .reset_index())
idx.columns = [ID_COUNTRY, TIME, "GINIW_pred_GDP_pc", "GE_m1W_pred_GDP_pc",
               "GE_0W_pred_GDP_pc", "GE_1W_pred_GDP_pc", "COVW_pred_GDP_pc"]

# --- STEP 3: merge with country controls ----------------------------------
print("STEP 3: merge with country controls...")
ctry = pd.read_csv(F_COUNTRY)
main = ctry.merge(idx, on=[ID_COUNTRY, TIME], how="inner")
main.to_csv("output/Main_Data_py.csv", index=False)

# --- spot-checks for the cross-language comparison -------------------------
sel = main[(main[ID_COUNTRY] == "DEU") & (main[TIME] == 2010)]["GINIW_pred_GDP_pc"]
res = pd.DataFrame({"metric": ["beta_log_lights", "beta_log_gdp_pc_country",
                               "n_country_years", "GINIW_DEU_2010"],
                    "value": [b[LIGHTS], b["log_GDP_pc_Country"], len(main),
                              float(sel.iloc[0]) if len(sel) else np.nan]})
res.to_csv("output/Main_Data_results_py.csv", index=False)
print(f"DONE PY | rows={len(main)} | GINIW(DEU,2010)={float(sel.iloc[0]) if len(sel) else np.nan:.4f}")
