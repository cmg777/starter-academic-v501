#!/usr/bin/env python3
# ===========================================================================
# Table_1.py  --  Python replication of Table 1 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Nighttime lights predict regional GDP (the calibration / first-stage step).
# Seven specifications regress log regional GDP per capita on log average
# nighttime light per pixel, adding ever more fixed effects / controls:
#   (1) random effects, no FE              (4) (3) + national GDP per capita
#   (2) OLS with region FE + satellite FE  (5) RE + country-GROUP FE + sat FE
#   (3) RE + country FE + satellite FE     (6) (5) + national GDP per capita
#                                          (7) (6) + geography/pixel controls
#
# Python twin of Table_1.do / Table_1.R. Reads the SAME data/Table_1_data.csv.
#
# REQUIRED PACKAGES (install once):
#   pip install pandas linearmodels
#   - pandas       : data handling
#   - linearmodels : RandomEffects = the random-effects estimator (Python
#                    analogue of Stata's xtreg default); PanelOLS(EntityEffects)
#                    = region fixed effects for column (2). Clustered SEs.
#
# RUN:  python Table_1.py        (from inside this folder, or from anywhere)
# OUTPUT: output/Table_1_py.txt (regression summaries) and
#         output/Table_1_results_py.csv (key numbers, for the README comparison)
# ===========================================================================

import os
import numpy as np
import pandas as pd
from linearmodels.panel import RandomEffects, PanelOLS

# --- 0. Make paths portable: run from this script's own folder -------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("output", exist_ok=True)

# --- 1. Read the data (case-sensitive names, exactly like Stata) -----------
d = pd.read_csv("data/Table_1_data.csv")

# --- 2. Declare the panel: MultiIndex of (entity, time) --------------------
# linearmodels reads the panel from a (entity, time) MultiIndex. Entity =
# region (code_Coutry_Region); time = year. This mirrors Stata's
# `xtset code_Coutry_Region year`. We keep a flat copy `d` for the country
# clustering id (Country_ISO), which the panel index must drop.
panel = d.set_index(["code_Coutry_Region", "year"])
# Numeric country id aligned to the panel rows, used as the cluster variable.
cluster_id = pd.Categorical(panel["Country_ISO"].values).codes
clusters = pd.DataFrame({"c": cluster_id}, index=panel.index)

# --- 3. Right-hand-side helpers -------------------------------------------
sat = [f"satyear_{i}" for i in range(1, 8)]          # satellite fixed effects
# 81 country dummies (cols 3-4). They sum to 1 in every row (all 81 countries
# present), so with the intercept they are perfectly collinear; Stata's xtreg
# silently drops one. We drop country_dum81 (ZAF) for a full-rank design.
cdum = [f"country_dum{i}" for i in range(1, 81)]
grp = ["eap", "ssa", "mena", "lac", "eca", "sa"]     # World Bank group dummies


def add_const(X):
    """Prepend an intercept column (RandomEffects needs an explicit constant)."""
    return pd.concat([pd.Series(1.0, index=X.index, name="const"), X], axis=1)


def re_fit(rhs):
    """RandomEffects with SEs clustered by country (Stata xtreg RE default)."""
    y = panel["log_GDP_pc_Region"]
    X = add_const(panel[rhs])
    return RandomEffects(y, X).fit(cov_type="clustered", clusters=clusters)


# --- 4. Estimate the 7 columns --------------------------------------------
# (1) Random effects, no fixed effects, no controls
m1 = re_fit(["log_Light_ppix_Region"])

# (2) OLS with REGION fixed effects + satellite FE. PanelOLS(EntityEffects)
#     absorbs the ~1,500 region dummies; SEs clustered by country. Mirrors the
#     do-file's `reg ... _Icode_Cout_* satyear_* , cluster(Country_ISO)`.
m2 = PanelOLS(panel["log_GDP_pc_Region"],
              panel[["log_Light_ppix_Region"] + sat],
              entity_effects=True, drop_absorbed=True).fit(
                  cov_type="clustered", clusters=clusters)

# (3) RE with COUNTRY fixed effects + satellite FE
m3 = re_fit(["log_Light_ppix_Region"] + cdum + sat)

# (4) Column (3) + national GDP per capita
m4 = re_fit(["log_Light_ppix_Region", "log_GDP_pc_Country"] + cdum + sat)

# (5) RE with country-GROUP (World Bank region) FE + satellite FE
m5 = re_fit(["log_Light_ppix_Region"] + sat + grp)

# (6) Column (5) + national GDP per capita
m6 = re_fit(["log_Light_ppix_Region", "log_GDP_pc_Country"] + sat + grp)

# (7) THE PREDICTION MODEL: column (6) + geography & pixel-coding controls.
m7 = re_fit(["log_Light_ppix_Region", "log_GDP_pc_Country",
             "log_N_pix_top_cod_1_ppix", "log_N_pix_low_cod_1_ppix",
             "log_area", "log_region", "log_region_X_log_area"] + sat + grp)

# --- 5. Pull the headline coefficients ------------------------------------
models = [m1, m2, m3, m4, m5, m6, m7]
b_light = [float(m.params["log_Light_ppix_Region"]) for m in models]
b_gdpc7 = float(m7.params["log_GDP_pc_Country"])     # col 7 national GDP elast.
N = int(m1.nobs)                                     # region-years used
ng = int(d["code_Coutry_Region"].nunique())          # number of regions

# --- 6. Export readable regression summaries ------------------------------
with open("output/Table_1_py.txt", "w") as fh:
    fh.write("Table 1 (Python / linearmodels RE + PanelOLS) - lights predict GDP\n\n")
    fh.write("log_Light_ppix_Region by column (1)-(7):\n  %s\n\n" %
             " / ".join("%.3f" % b for b in b_light))
    fh.write("col(7) log_GDP_pc_Country: %.3f\n" % b_gdpc7)
    fh.write("N = %d region-years ; %d regions\n" % (N, ng))

# --- 7. Save key numbers for the cross-language comparison -----------------
res = pd.DataFrame({
    "metric": [f"col{i}_log_Light_ppix_Region" for i in range(1, 8)] +
              ["col7_log_GDP_pc_Country", "N", "n_regions"],
    "value": b_light + [b_gdpc7, N, ng],
})
res.to_csv("output/Table_1_results_py.csv", index=False)

print("PY | log_Light by col: %s | col7 GDPpc=%.3f | N=%d | regions=%d" % (
    "/".join("%.3f" % b for b in b_light), b_gdpc7, N, ng))
print("Wrote output/Table_1_py.txt and output/Table_1_results_py.csv")
