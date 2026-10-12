#!/usr/bin/env python3
# ===========================================================================
# Figure_4.py  --  Python replication of Figure 4 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Regional inequality and development: partial-residual scatter of regional
# inequality (GINIW) on log national GDP per capita, with the fitted cubic.
# Panel (a) = all countries; panel (b) = labelled example countries.
#
# Python twin of Figure_4.do / Figure_4.R. Reads the SAME data/Figure_4_data.csv.
#
# REQUIRED PACKAGES (install once):
#   pip install pandas numpy statsmodels matplotlib
#
# RUN:  python Figure_4.py
# OUTPUT: output/Figure_4_a_py.png, output/Figure_4_b_py.png,
#         output/Figure_4_results_py.csv
# ===========================================================================
import os
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
import matplotlib
matplotlib.use("Agg")            # headless backend (no display needed)
import matplotlib.pyplot as plt

# --- 0. portable working directory ----------------------------------------
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("output", exist_ok=True)

# --- 1. read + collapse to 5-year averages --------------------------------
d = pd.read_csv("data/Figure_4_data.csv")
d = d[(d.year >= 1990) & (d.year <= 2014)].copy()
d["p5"] = pd.cut(d.year, [1989,1994,1999,2004,2009,2014], labels=[1,2,3,4,5]).astype(int)
agg = (d.groupby(["Country_ISO","p5"], as_index=False)
         [["GINIW_pred_GDP_pc","GDP_pc_Country"]].mean())
agg["lg"] = np.log(agg["GDP_pc_Country"]); agg["lg2"] = agg.lg**2; agg["lg3"] = agg.lg**3

# --- 2. fixed-effects regression via OLS-with-dummies (= within estimator) -
# Country + period dummies reproduce the `xtreg, fe` cubic coefficients exactly.
m = smf.ols("GINIW_pred_GDP_pc ~ lg + lg2 + lg3 + C(Country_ISO) + C(p5)", agg).fit()
b = {k: m.params[k] for k in ["lg","lg2","lg3"]}

# --- 3. partial residual (remove ONLY the period effect; display variable) -
peff = {1: 0.0}
for k in (2,3,4,5):
    peff[k] = m.params.get(f"C(p5)[T.{k}]", 0.0)
agg["partial"] = agg["GINIW_pred_GDP_pc"] - agg["p5"].map(peff)
cons = (agg["partial"] - (b["lg"]*agg.lg + b["lg2"]*agg.lg2 + b["lg3"]*agg.lg3)).mean()
xs = np.linspace(5, 12, 200)
ys = cons + b["lg"]*xs + b["lg2"]*xs**2 + b["lg3"]*xs**3

# --- 4. Figure 4a: all countries ------------------------------------------
fig, ax = plt.subplots(figsize=(5, 4.2))
ax.scatter(agg.lg, agg.partial, facecolors="none", edgecolors="C0", s=14)
ax.plot(xs, ys, color="black")
ax.set(xlim=(5,12), ylim=(0,0.16), xlabel="log (GDP per capita)",
       ylabel="Partial regional inequality (GINIW)",
       title="Figure 4a (Python): regional inequality vs development")
fig.tight_layout(); fig.savefig("output/Figure_4_a_py.png", dpi=120); plt.close(fig)

# --- 5. Figure 4b: labelled example countries (ITA/IRL, not the ITL/IRE typos) -
sel = ["POL","AUS","SWE","PRY","BGD","CHN","IRN","MOZ","LBR","ITA","IRL","ARE","THA"]
sub = agg[agg.Country_ISO.isin(sel)]
fig, ax = plt.subplots(figsize=(5, 4.2))
ax.scatter(sub.lg, sub.partial, marker="^", s=18)
for _, r in sub.iterrows():
    ax.annotate(r.Country_ISO, (r.lg, r.partial), fontsize=7, xytext=(0,4),
                textcoords="offset points")
ax.plot(xs, ys, color="black")
ax.set(xlim=(5,12), ylim=(0,0.16), xlabel="log (GDP per capita)",
       ylabel="Partial regional inequality (GINIW)",
       title="Figure 4b (Python): selected countries")
fig.tight_layout(); fig.savefig("output/Figure_4_b_py.png", dpi=120); plt.close(fig)

# --- 6. key numbers for the comparison ------------------------------------
res = pd.DataFrame({"metric": ["cubic_lg","cubic_lg2","cubic_lg3","N",
                               "n_countries","labelled_found"],
                    "value": [b["lg"], b["lg2"], b["lg3"], int(m.nobs),
                              agg.Country_ISO.nunique(),
                              int(sum(c in set(agg.Country_ISO) for c in sel))]})
res.to_csv("output/Figure_4_results_py.csv", index=False)
print("PY | cubic %.4f / %.4f / %.5f | labelled found %d/13" % (
    b["lg"], b["lg2"], b["lg3"], sum(c in set(agg.Country_ISO) for c in sel)))
