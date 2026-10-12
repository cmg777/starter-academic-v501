#!/usr/bin/env python3
# ===========================================================================
# Table_B4.py  --  Python replication of Table B.4 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Spatial-HAC (Conley) robustness of the nighttime-lights -> GDP regression.
# Re-estimates Table 1 column 2 -- log regional GDP per capita on log regional
# light per pixel, with REGION fixed effects and 7 SATELLITE dummies -- and then
# replaces the standard errors with spatially-robust (Conley/Hsiang) SEs at three
# cutoff radii (1000 / 2500 / 5000 km). The POINT ESTIMATE (0.190) is identical
# to Table 1 col 2; only the standard errors change with the radius.
#
# Python twin of Table_B4.do / Table_B4.R. Reads the SAME data/Table_B4_data.csv.
# The Stata table uses Solomon Hsiang's `ols_spatial_HAC` (NOT on SSC, see §4 of
# the README); there is no exact drop-in for it here, so we (a) get the point
# estimate from a within-region PanelOLS and (b) implement a small self-contained
# Conley spatial-HAC variance from the Latitude/Longitude centroids + Bartlett.
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy linearmodels
#   - pandas/numpy : data handling and the Conley distance/kernel math
#   - linearmodels : PanelOLS = the panel fixed-effects estimator, the Python
#                    analogue of Stata's region-FE OLS, used for the point estimate.
#
# RUN:  python Table_B4.py       (from inside this folder, or from anywhere)
# OUTPUT: output/Table_B4_py.txt (regression summary) and
#         output/Table_B4_results_py.csv (key numbers, for the README comparison)
# ===========================================================================

import os
import numpy as np
import pandas as pd
from linearmodels.panel import PanelOLS

# --- 0. Make paths portable: run from this script's own folder -------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("output", exist_ok=True)

# --- 1. Read the trimmed data ---------------------------------------------
# pd.read_csv keeps the original (case-sensitive) header names from the CSV,
# matching the Stata do-file's `import delimited ... case(preserve)`.
d = pd.read_csv("data/Table_B4_data.csv")
sat = [f"satyear_{i}" for i in range(1, 8)]                    # 7 satellite dummies

# --- 2. Build the estimation sample ----------------------------------------
cols = ["log_GDP_pc_Region", "log_Light_ppix_Region", "Latitude",
        "Longitude", "code_Coutry_Region"] + sat
df = d.dropna(subset=cols).copy()
# Drop singleton regions (observed only once): a within-region estimator gives
# them zero weight; dropping keeps the residual/score/id arrays aligned and
# matches what the FE estimators do internally.
cnt = df["code_Coutry_Region"].value_counts()
df = df[df["code_Coutry_Region"].isin(cnt[cnt > 1].index)].copy()

# --- 3. Point estimate (= Table 1 col 2) via region-FE PanelOLS ------------
# linearmodels needs a MultiIndex of (entity, time). Entity = region
# (-> EntityEffects = region FE). We add a within-region observation counter as
# the "time" level so each region-year is a unique panel cell.
df["t"] = df.groupby("code_Coutry_Region").cumcount()
panel = df.set_index(["code_Coutry_Region", "t"])
rhs = "log_Light_ppix_Region + " + " + ".join(sat)
m = PanelOLS.from_formula(
    f"log_GDP_pc_Region ~ {rhs} + EntityEffects", panel,
    drop_absorbed=True).fit()                                  # region FE absorbed
b_light = float(m.params["log_Light_ppix_Region"])            # the headline elasticity

# --- 4. Conley spatial-HAC standard errors ---------------------------------
# Hsiang's ols_spatial_HAC weights residual cross-products of observations by a
# Bartlett kernel in great-circle distance, so errors of regions within `dist`
# km may be correlated. We rebuild the single-regressor Conley variance from the
# Frisch-Waugh residualised regressor x~ and the model residuals u.

# 4a. Residualise the light regressor on region FE + satellite dummies (x tilde).
xfit = PanelOLS.from_formula(
    f"log_Light_ppix_Region ~ {' + '.join(sat)} + EntityEffects", panel,
    drop_absorbed=True).fit()
xt = np.asarray(xfit.resids)                                  # x with FE+sat removed
u = np.asarray(m.resids)                                      # model residuals
xu = xt * u                                                   # score contributions
sxx = float(np.sum(xt ** 2))                                  # bread denominator (X'X)

# 4b. Aggregate scores to the region level (the spatial unit is the centroid).
g = df.assign(xu=xu).groupby("code_Coutry_Region")
agg = g["xu"].sum().to_numpy()                                # region-summed scores
lat = np.radians(g["Latitude"].first().to_numpy())           # one centroid per region
lon = np.radians(g["Longitude"].first().to_numpy())
R_EARTH = 6371.0                                             # mean Earth radius, km
nr = agg.size

# 4c. Conley variance: sum over region pairs of score_i * score_j * k(d_ij) with
#     a Bartlett kernel k = max(0, 1 - d/dist), divided by (X'X)^2 (sandwich).
def conley_var(dist_km):
    v = 0.0
    for i in range(nr):
        dlat = lat - lat[i]
        dlon = lon - lon[i]
        a = np.sin(dlat / 2) ** 2 + np.cos(lat[i]) * np.cos(lat) * np.sin(dlon / 2) ** 2
        dij = 2 * R_EARTH * np.arcsin(np.minimum(1.0, np.sqrt(a)))   # great-circle km
        w = np.maximum(0.0, 1 - dij / dist_km)                       # Bartlett weights
        v += agg[i] * np.sum(w * agg)                                # weighted cross-products
    return v / (sxx ** 2)

radii = [1000, 2500, 5000]
se_conley = {r: float(np.sqrt(conley_var(r))) for r in radii}        # Conley SE per radius

# --- 5. Export a short summary ---------------------------------------------
with open("output/Table_B4_py.txt", "w") as fh:
    fh.write("Table B.4 (Python) - Conley spatial-HAC robustness of lights -> GDP\n\n")
    fh.write(f"log_Light_ppix_Region point estimate: {b_light:.3f}\n")
    fh.write(f"N (estimation sample): {int(m.nobs)}\n\n")
    fh.write("Conley spatial-HAC standard errors (Bartlett kernel):\n")
    for r in radii:
        fh.write(f"  r:{r} km : SE = {se_conley[r]:.3f}\n")

# --- 6. Save key numbers for the cross-language comparison ------------------
res = pd.DataFrame({
    "metric": ["light_coef_r1000", "light_coef_r2500", "light_coef_r5000",
               "conley_se_r1000", "conley_se_r2500", "conley_se_r5000", "N"],
    "value": [b_light, b_light, b_light,
              se_conley[1000], se_conley[2500], se_conley[5000], int(m.nobs)],
})
res.to_csv("output/Table_B4_results_py.csv", index=False)

print("PY | log_Light coef = %.3f (all 3 cols) | Conley SE: %.3f / %.3f / %.3f | N=%d" % (
    b_light, se_conley[1000], se_conley[2500], se_conley[5000], int(m.nobs)))
print("Wrote output/Table_B4_py.txt and output/Table_B4_results_py.csv")
