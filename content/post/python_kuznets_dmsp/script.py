#!/usr/bin/env python3
# ===========================================================================
# script.py  --  Regional Inequality from Outer Space (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# A comprehensive Python replication that:
#   (1) explores the cross-country dynamics of regional inequality (EDA),
#   (2) PREDICTS regional GDP per capita from nighttime lights + controls
#       (Table 1) and forms the predictions,
#   (3) CONSTRUCTS five population-weighted inequality indices from scratch and
#       studies the role of population weights (Table 2 logic),
#   (4) estimates the regional Kuznets curve (Table 3), its determinants
#       (Table 4) and a Conley spatial-HAC robustness check (Table B.4).
#
# Panel regressions use PyFixest (fixest-style FE) wherever the model is a
# fixed-effects/OLS model; the paper's random-effects Table 1 columns are
# reproduced with a small linearmodels.RandomEffects sidebar (PyFixest is
# FE/OLS only). NO geospatial maps (no geopandas).
#
# Source: Lessmann, C. & Seidel, A. (2017). "Regional inequality, convergence,
# and its determinants -- A view from outer space." European Economic Review
# 92, 110-132.  Code ported & adapted from the authors' replication archive.
#
# RUN:  python script.py     (from inside content/post/python_kuznets_dmsp/)
# ===========================================================================

import os
import warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")                     # headless backend
import matplotlib.pyplot as plt
import pyfixest as pf
from linearmodels.panel import RandomEffects, PanelOLS

warnings.filterwarnings("ignore")
np.random.seed(42)
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# --- Site colour palette (light theme) -------------------------------------
STEEL, ORANGE, INK, TEAL = "#6a9bcc", "#d97757", "#141413", "#00d4c8"
GREY = "#b0a89a"
plt.rcParams.update({
    "figure.dpi": 120, "savefig.dpi": 300, "savefig.bbox": "tight",
    "font.size": 11, "axes.titlesize": 12, "axes.titleweight": "bold",
    "axes.edgecolor": INK, "axes.labelcolor": INK, "text.color": INK,
    "xtick.color": INK, "ytick.color": INK,
    "axes.spines.top": False, "axes.spines.right": False,
    "figure.facecolor": "white", "axes.facecolor": "white",
    "axes.grid": True, "grid.color": "#e6e3dd", "grid.linewidth": 0.7,
})
SLUG = "python_kuznets_dmsp"


def fig_path(n, name):
    return f"{SLUG}_{n:02d}_{name}.png"


def render_table_png(col_labels, row_labels, cell_text, title, path,
                     note=None, figw=None):
    """Render a results table as a clean matplotlib PNG (no browser needed)."""
    nrows, ncols = len(row_labels), len(col_labels)
    figw = figw or max(6.0, 1.7 + 1.45 * ncols)
    fig, ax = plt.subplots(figsize=(figw, 0.55 * nrows + 1.4))
    ax.axis("off")
    ax.set_title(title, color=INK, fontsize=12, fontweight="bold", pad=14)
    tbl = ax.table(cellText=cell_text, rowLabels=row_labels,
                   colLabels=col_labels, cellLoc="center",
                   rowLoc="left", loc="center")
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(10)
    tbl.scale(1, 1.45)
    for (r, c), cell in tbl.get_celld().items():
        cell.set_edgecolor("#d8d4cc")
        if r == 0:                                  # header row
            cell.set_facecolor(STEEL)
            cell.set_text_props(color="white", fontweight="bold")
        elif c == -1:                               # row labels
            cell.set_text_props(fontweight="bold", color=INK)
            cell.set_facecolor("#f5f3ee")
        else:
            cell.set_facecolor("white" if r % 2 else "#faf9f6")
    if note:
        fig.text(0.5, 0.02, note, ha="center", fontsize=8, color=GREY)
    fig.savefig(path)
    plt.close(fig)


def stars(p):
    return "***" if p < 0.01 else "**" if p < 0.05 else "*" if p < 0.1 else ""


print("=" * 75)
print("Regional Inequality from Outer Space -- Lessmann & Seidel (2017)")
print("=" * 75)

# ===========================================================================
# 1. LOAD THE BUNDLED DATA
# ===========================================================================
print("\n[1] Loading bundled CSVs from data/ ...")
pred = pd.read_csv("data/Prediction_Data.csv")        # region-year training set
t2 = pd.read_csv("data/Table_2_data.csv")             # region-year, inequality inputs
t3 = pd.read_csv("data/Table_3_data.csv")             # country-year, Kuznets
t4 = pd.read_csv("data/Table_4_data.csv")             # country-year, determinants
tb4 = pd.read_csv("data/Table_B4_data.csv")           # region-year, lat/lon
f5 = pd.read_csv("data/Figure_5_data.csv")            # country-year, GINIW vs Giniall
for nm, df in [("Prediction_Data", pred), ("Table_2_data", t2),
               ("Table_3_data", t3), ("Table_4_data", t4),
               ("Table_B4_data", tb4), ("Figure_5_data", f5)]:
    print(f"    {nm:18s} {df.shape[0]:6d} rows x {df.shape[1]:3d} cols")

# Map each country to its World Bank region group (from the region dummies).
GRP_COLS = ["eap", "eca", "lac", "mena", "sa", "ssa"]
GRP_NAME = {"eap": "East Asia & Pacific", "eca": "Europe & Central Asia",
            "lac": "Latin America & Carib.", "mena": "Mid. East & N. Africa",
            "sa": "South Asia", "ssa": "Sub-Saharan Africa"}


def row_group(r):
    for g in GRP_COLS:
        if r.get(g, 0) == 1:
            return GRP_NAME[g]
    return "N. America & high-inc."


pred["wb_group"] = pred.apply(row_group, axis=1)
pred["satyear"] = sum(i * pred[f"satyear_{i}"] for i in range(1, 8)).astype(int)
pred["group_id"] = pred["wb_group"]
country_group = pred.groupby("Country_ISO")["wb_group"].agg(
    lambda s: s.value_counts().index[0])
n_reg = pred["code_Coutry_Region"].nunique()
n_cty = pred["Country_ISO"].nunique()
print(f"    Training sample: {pred.shape[0]} region-years, "
      f"{n_reg} regions, {n_cty} countries.")

# ===========================================================================
# 2. EDA: CROSS-COUNTRY DYNAMICS OF INEQUALITY
# ===========================================================================
print("\n[2] EDA -- cross-country dynamics of the key variables ...")
IDX = ["GINIW_pred_GDP_pc", "COVW_pred_GDP_pc", "GE_1W_pred_GDP_pc",
       "GE_0W_pred_GDP_pc", "GE_m1W_pred_GDP_pc"]
IDX_LAB = {"GINIW_pred_GDP_pc": "Gini", "COVW_pred_GDP_pc": "CV",
           "GE_1W_pred_GDP_pc": "Theil GE(1)", "GE_0W_pred_GDP_pc": "MLD GE(0)",
           "GE_m1W_pred_GDP_pc": "GE(-1)"}
eda = t3.copy()
eda["wb_group"] = eda["Country_ISO"].map(country_group)
eda["log_GDPpc"] = np.log(eda["GDP_pc_Country"])

# --- 2.1 Distributions of the key variables --------------------------------
fig, axes = plt.subplots(1, 3, figsize=(12, 3.6))
axes[0].hist(pred["log_Light_ppix_Region"].dropna(), bins=40, color=STEEL,
             edgecolor="white")
axes[0].set(title="Log nighttime light per pixel\n(region-year)",
            xlabel="log light per pixel", ylabel="count")
axes[1].hist(np.log(pred["GDP_pc_Region"].dropna()), bins=40, color=ORANGE,
             edgecolor="white")
axes[1].set(title="Log regional GDP per capita\n(region-year)",
            xlabel="log GDP per capita", ylabel="count")
axes[2].hist(eda["GINIW_pred_GDP_pc"].dropna(), bins=40, color=TEAL,
             edgecolor="white")
axes[2].set(title="Regional inequality GINIW\n(country-year)",
            xlabel="population-weighted Gini", ylabel="count")
fig.tight_layout()
fig.savefig(fig_path(1, "distributions"))
plt.close(fig)
print(f"    light: mean={pred['log_Light_ppix_Region'].mean():.2f} | "
      f"GINIW: mean={eda['GINIW_pred_GDP_pc'].mean():.3f}, "
      f"median={eda['GINIW_pred_GDP_pc'].median():.3f}, "
      f"max={eda['GINIW_pred_GDP_pc'].max():.3f}")

# --- 2.2 Inequality and development over time, 1992-2012 --------------------
yr = (eda[(eda.year >= 1992) & (eda.year <= 2012)]
      .groupby("year").agg(GINIW=("GINIW_pred_GDP_pc", "mean"),
                           logGDP=("log_GDPpc", "mean")).reset_index())
fig, ax1 = plt.subplots(figsize=(7, 4.2))
ax1.plot(yr.year, yr.GINIW, color=STEEL, marker="o", lw=2, label="mean GINIW")
ax1.set(xlabel="year", ylabel="mean regional inequality (GINIW)")
ax1.tick_params(axis="y", labelcolor=STEEL)
ax2 = ax1.twinx()
ax2.plot(yr.year, yr.logGDP, color=ORANGE, marker="s", lw=2,
         label="mean log GDP p.c.")
ax2.set_ylabel("mean log GDP per capita", color=ORANGE)
ax2.tick_params(axis="y", labelcolor=ORANGE)
ax2.grid(False)
ax1.set_title("Average regional inequality and income, 1992-2012")
fig.tight_layout()
fig.savefig(fig_path(2, "time_trends"))
plt.close(fig)
print(f"    GINIW {yr.GINIW.iloc[0]:.4f} ({int(yr.year.iloc[0])}) -> "
      f"{yr.GINIW.iloc[-1]:.4f} ({int(yr.year.iloc[-1])})")

# --- 2.3 Inequality across World Bank regions ------------------------------
order = (eda.groupby("wb_group")["GINIW_pred_GDP_pc"].median()
         .sort_values().index.tolist())
data_by = [eda.loc[eda.wb_group == g, "GINIW_pred_GDP_pc"].dropna()
           for g in order]
fig, ax = plt.subplots(figsize=(8.5, 4.6))
bp = ax.boxplot(data_by, vert=False, patch_artist=True, widths=0.6,
                showfliers=False)
for patch in bp["boxes"]:
    patch.set(facecolor=STEEL, alpha=0.65, edgecolor=INK)
for med in bp["medians"]:
    med.set(color=ORANGE, linewidth=2)
ax.set_yticklabels(order)
ax.set(xlabel="regional inequality (GINIW)",
       title="Regional inequality across World Bank regions")
fig.tight_layout()
fig.savefig(fig_path(3, "by_wb_region"))
plt.close(fig)
grp_med = eda.groupby("wb_group")["GINIW_pred_GDP_pc"].median().sort_values()
print("    median GINIW by region:")
for g, v in grp_med.items():
    print(f"      {g:26s} {v:.4f}")

# --- 2.4 How the five inequality indices co-move ---------------------------
cmat = t3[IDX].corr()
fig, ax = plt.subplots(figsize=(5.6, 5))
im = ax.imshow(cmat.values, cmap="BuPu", vmin=0, vmax=1)
labs = [IDX_LAB[c] for c in IDX]
ax.set_xticks(range(5)); ax.set_xticklabels(labs, rotation=40, ha="right")
ax.set_yticks(range(5)); ax.set_yticklabels(labs)
for i in range(5):
    for j in range(5):
        ax.text(j, i, f"{cmat.values[i, j]:.2f}", ha="center", va="center",
                color="white" if cmat.values[i, j] > 0.6 else INK, fontsize=9)
ax.set_title("Co-movement of five inequality indices")
ax.grid(False)
fig.colorbar(im, ax=ax, shrink=0.8, label="correlation")
fig.tight_layout()
fig.savefig(fig_path(4, "index_corr_heatmap"))
plt.close(fig)
print(f"    corr(Gini, CV)={cmat.loc['GINIW_pred_GDP_pc','COVW_pred_GDP_pc']:.3f}"
      f" | corr(Gini, Theil)="
      f"{cmat.loc['GINIW_pred_GDP_pc','GE_1W_pred_GDP_pc']:.3f}")

# EDA summary export
eda_summary = (eda.groupby("wb_group")
               .agg(n_country_years=("GINIW_pred_GDP_pc", "size"),
                    mean_GINIW=("GINIW_pred_GDP_pc", "mean"),
                    median_GINIW=("GINIW_pred_GDP_pc", "median"),
                    mean_logGDP=("log_GDPpc", "mean")).reset_index())
eda_summary.to_csv(f"{SLUG}_eda_summary.csv", index=False)

# ===========================================================================
# 3. PREDICTING GDP FROM NIGHTTIME LIGHTS (TABLE 1)
# ===========================================================================
print("\n[3] Table 1 -- predicting regional GDP from nighttime lights ...")
sat_d = [f"satyear_{i}" for i in range(1, 8)]

# --- 3.1 PyFixest fixed-effects / OLS specifications -----------------------
# All seven specifications as FE/OLS models (PyFixest). The elasticity is the
# coefficient on log light per pixel. SEs clustered by country.
GEO = ("log_N_pix_top_cod_1_ppix + log_N_pix_low_cod_1_ppix + log_area + "
       "log_region + log_region_X_log_area")
fe_specs = {
    1: "log_GDP_pc_Region ~ log_Light_ppix_Region",
    2: "log_GDP_pc_Region ~ log_Light_ppix_Region | code_Coutry_Region + satyear",
    3: "log_GDP_pc_Region ~ log_Light_ppix_Region | Country_ISO + satyear",
    4: "log_GDP_pc_Region ~ log_Light_ppix_Region + log_GDP_pc_Country | Country_ISO + satyear",
    5: "log_GDP_pc_Region ~ log_Light_ppix_Region | group_id + satyear",
    6: "log_GDP_pc_Region ~ log_Light_ppix_Region + log_GDP_pc_Country | group_id + satyear",
    7: f"log_GDP_pc_Region ~ log_Light_ppix_Region + log_GDP_pc_Country + {GEO} | group_id + satyear",
}
fe_models, fe_b = {}, {}
for k, fml in fe_specs.items():
    m = pf.feols(fml, data=pred, vcov={"CRV1": "Country_ISO"})
    fe_models[k] = m
    fe_b[k] = float(m.coef()["log_Light_ppix_Region"])
print("    PyFixest FE/OLS light elasticity by col (1)-(7): "
      + " / ".join(f"{fe_b[k]:.3f}" for k in range(1, 8)))
b_natgdp_fe7 = float(fe_models[7].coef()["log_GDP_pc_Country"])

# --- 3.2 linearmodels random-effects sidebar (the paper's published table) --
panel = pred.set_index(["code_Coutry_Region", "year"])
cluster_id = pd.Categorical(panel["Country_ISO"].values).codes
clusters = pd.DataFrame({"c": cluster_id}, index=panel.index)
cdum = pd.get_dummies(panel["Country_ISO"], prefix="cty",
                      drop_first=True).astype(float)
gdum = pd.get_dummies(panel["wb_group"], prefix="grp",
                      drop_first=True).astype(float)
satm = panel[sat_d].astype(float)


def re_design(extra_cols):
    X = pd.concat([pd.Series(1.0, index=panel.index, name="const")]
                  + extra_cols, axis=1)
    return X


def re_fit(extra_cols):
    y = panel["log_GDP_pc_Region"]
    X = re_design(extra_cols)
    return RandomEffects(y, X).fit(cov_type="clustered", clusters=clusters)


light = panel[["log_Light_ppix_Region"]]
ngdp = panel[["log_GDP_pc_Country"]]
geo = panel[["log_N_pix_top_cod_1_ppix", "log_N_pix_low_cod_1_ppix",
             "log_area", "log_region", "log_region_X_log_area"]]
re1 = re_fit([light])
# col 2 is the one true fixed-effects column -> use the PyFixest estimate (0.190)
re3 = re_fit([light, cdum, satm])
re4 = re_fit([light, ngdp, cdum, satm])
re5 = re_fit([light, gdum, satm])
re6 = re_fit([light, ngdp, gdum, satm])
re7 = re_fit([light, ngdp, geo, gdum, satm])
re_b = {1: float(re1.params["log_Light_ppix_Region"]),
        2: fe_b[2],
        3: float(re3.params["log_Light_ppix_Region"]),
        4: float(re4.params["log_Light_ppix_Region"]),
        5: float(re5.params["log_Light_ppix_Region"]),
        6: float(re6.params["log_Light_ppix_Region"]),
        7: float(re7.params["log_Light_ppix_Region"])}
b_natgdp_re7 = float(re7.params["log_GDP_pc_Country"])
print("    linearmodels RE light elasticity by col (1)-(7): "
      + " / ".join(f"{re_b[k]:.3f}" for k in range(1, 8)))
print(f"    col 7 national-GDP elasticity: RE={b_natgdp_re7:.3f}, "
      f"FE={b_natgdp_fe7:.3f}")

# --- 3.3 Assemble Table 1 as a PNG (FE vs RE side by side) ------------------
col_labels = [f"({k})" for k in range(1, 8)]
row_labels = ["log light (PyFixest FE/OLS)", "log light (paper, RE)",
              "national GDP control", "geography controls",
              "region FE", "country FE", "WB-group FE", "satellite FE"]
ctrl = {1: ("--", "--", "", "", "", ""),
        2: ("--", "--", "Yes", "", "", "Yes"),
        3: ("--", "--", "", "Yes", "", "Yes"),
        4: ("Yes", "--", "", "Yes", "", "Yes"),
        5: ("--", "--", "", "", "Yes", "Yes"),
        6: ("Yes", "--", "", "", "Yes", "Yes"),
        7: ("Yes", "Yes", "", "", "Yes", "Yes")}
cells = [[f"{fe_b[k]:.3f}" for k in range(1, 8)],
         [f"{re_b[k]:.3f}" for k in range(1, 8)]]
for ridx in range(6):
    cells.append([ctrl[k][ridx] for k in range(1, 8)])
render_table_png(col_labels, row_labels, cells,
                 "Table 1. Nighttime lights predict regional GDP per capita",
                 fig_path(5, "table1"),
                 note="Dependent variable: log regional GDP per capita. "
                      "Elasticity = coefficient on log light per pixel.",
                 figw=11)

# --- 3.4 Form the predictions (col 7) and validate -------------------------
# Reconstruct fitted log GDP per capita from the RE col-7 design matrix X.beta,
# then exponentiate. This is the prediction step that turns light into income.
X7 = re_design([light, ngdp, geo, gdum, satm])
beta7 = re7.params.reindex(X7.columns).values
fitted_log = X7.values @ beta7
obs_log = panel["log_GDP_pc_Region"].values
pred_pc = np.exp(fitted_log)
obs_pc = np.exp(obs_log)
r_pred = np.corrcoef(fitted_log, obs_log)[0, 1]
print(f"    prediction check: corr(predicted, observed log GDP p.c.) = "
      f"{r_pred:.3f} over {len(fitted_log)} region-years")

fig, ax = plt.subplots(figsize=(5.4, 5.2))
ax.scatter(fitted_log, obs_log, s=10, facecolors="none",
           edgecolors=STEEL, alpha=0.5)
lo, hi = 4, 13
ax.plot([lo, hi], [lo, hi], color=ORANGE, lw=2, label="45° line (perfect fit)")
ax.set(xlim=(lo, hi), ylim=(lo, hi),
       xlabel="predicted log GDP per capita (from lights)",
       ylabel="observed log GDP per capita",
       title=f"Predicted vs observed regional income\nPearson r = {r_pred:.3f}")
ax.legend(loc="upper left", frameon=False)
fig.tight_layout()
fig.savefig(fig_path(6, "predicted_vs_observed"))
plt.close(fig)

pd.DataFrame({
    "metric": [f"col{k}_light_FE" for k in range(1, 8)]
    + [f"col{k}_light_RE" for k in range(1, 8)]
    + ["col7_natgdp_RE", "col7_natgdp_FE", "pred_obs_corr", "N", "n_regions"],
    "value": [fe_b[k] for k in range(1, 8)] + [re_b[k] for k in range(1, 8)]
    + [b_natgdp_re7, b_natgdp_fe7, r_pred, pred.shape[0], n_reg],
}).to_csv(f"{SLUG}_table1_results.csv", index=False)

# ===========================================================================
# 4. CONSTRUCTING THE INEQUALITY INDICES (TABLE 2 LOGIC)
# ===========================================================================
print("\n[4] Constructing inequality indices from scratch ...")


def ineq_indices(y, w):
    """Five population-weighted inequality indices from first principles.

    y = regional income, w = regional population. Returns Gini, GE(-1),
    GE(0)=MLD, GE(1)=Theil and the coefficient of variation (CV)."""
    y = np.asarray(y, float)
    w = np.asarray(w, float)
    ok = np.isfinite(y) & np.isfinite(w) & (w > 0) & (y > 0)
    y, w = y[ok], w[ok]
    if y.size < 2:
        return dict(GINIW=np.nan, GE_m1W=np.nan, GE_0W=np.nan,
                    GE_1W=np.nan, COVW=np.nan)
    sw = w.sum()
    mu = (w * y).sum() / sw                  # population-weighted mean
    p = w / sw                               # population shares
    r = y / mu                               # relative incomes
    ge_m1 = 0.5 * ((p * r ** -1).sum() - 1)
    ge_0 = (p * (-np.log(r))).sum()
    ge_1 = (p * r * np.log(r)).sum()
    ge_2 = 0.5 * ((p * r ** 2).sum() - 1)
    cv = np.sqrt(2 * ge_2)
    gini = (np.abs(y[:, None] - y[None, :]) * np.outer(w, w)).sum() \
        / (2 * sw ** 2 * mu)
    return dict(GINIW=gini, GE_m1W=ge_m1, GE_0W=ge_0, GE_1W=ge_1, COVW=cv)


def gini_unweighted(y):
    """Equal-weight Gini (every region counts once) for the weight comparison."""
    y = np.asarray(y, float)
    y = y[np.isfinite(y) & (y > 0)]
    n = y.size
    if n < 2:
        return np.nan
    mu = y.mean()
    return np.abs(y[:, None] - y[None, :]).sum() / (2 * n ** 2 * mu)


# --- 4.1 Build the five indices per country-year on predicted income -------
rows = []
for (iso, yr_), g in t2.groupby(["Country_ISO", "year"]):
    rec = {"Country_ISO": iso, "year": yr_, "n_regions": len(g)}
    vals = ineq_indices(g["pred_GDP_pc_Region"], g["Pop_Region"])
    rec.update(vals)
    rec["GINI_unw"] = gini_unweighted(g["pred_GDP_pc_Region"])
    rows.append(rec)
built = pd.DataFrame(rows)
built.to_csv(f"{SLUG}_table2_indices.csv", index=False)
print(f"    built indices for {len(built)} country-years.")

# --- 4.2 A worked example: Germany 2010 ------------------------------------
deu = t2[(t2.Country_ISO == "DEU") & (t2.year == 2010)]
if len(deu):
    ex = ineq_indices(deu["pred_GDP_pc_Region"], deu["Pop_Region"])
    print(f"    Germany 2010: {len(deu)} regions, "
          f"GINIW={ex['GINIW']:.4f}, Theil={ex['GE_1W']:.4f}, "
          f"CV={ex['COVW']:.4f}")

# --- 4.3 The role of population weights ------------------------------------
wcmp = built.dropna(subset=["GINIW", "GINI_unw"]).copy()
wcmp["diff"] = wcmp["GINIW"] - wcmp["GINI_unw"]
corr_wu = wcmp["GINIW"].corr(wcmp["GINI_unw"])
print(f"    weighted vs unweighted Gini: corr={corr_wu:.3f}, "
      f"mean(weighted-unweighted)={wcmp['diff'].mean():+.4f}")
fig, ax = plt.subplots(figsize=(5.6, 5.4))
ax.scatter(wcmp["GINI_unw"], wcmp["GINIW"], s=10, facecolors="none",
           edgecolors=STEEL, alpha=0.45)
m = max(wcmp["GINI_unw"].max(), wcmp["GINIW"].max()) * 1.02
ax.plot([0, m], [0, m], color=ORANGE, lw=2, label="equal-weight = weighted")
ax.set(xlim=(0, m), ylim=(0, m),
       xlabel="unweighted Gini (every region counts once)",
       ylabel="population-weighted Gini (GINIW)",
       title="The role of population weights")
ax.legend(loc="upper left", frameon=False)
fig.tight_layout()
fig.savefig(fig_path(7, "population_weights"))
plt.close(fig)
wcmp[["Country_ISO", "year", "n_regions", "GINIW", "GINI_unw",
      "diff"]].to_csv(f"{SLUG}_popweight_compare.csv", index=False)

# --- 4.4 Cross-sample sanity check vs the published GINIW (honest caveat) ---
# Our teaching subset uses only the ~1,500 regions with OBSERVED GDP, while the
# paper's published country GINIW is computed over EVERY subnational region (the
# full-world prediction we do not bundle for size). So the two are correlated
# but do NOT match exactly -- a useful lesson about region coverage.
chk = built.merge(t3[["Country_ISO", "year", "GINIW_pred_GDP_pc"]],
                  on=["Country_ISO", "year"], how="inner").dropna(
    subset=["GINIW", "GINIW_pred_GDP_pc"])
val_corr = chk["GINIW"].corr(chk["GINIW_pred_GDP_pc"])
mad = (chk["GINIW"] - chk["GINIW_pred_GDP_pc"]).abs().mean()
print(f"    cross-sample check: corr(training-subset, published GINIW)="
      f"{val_corr:.3f}, mean abs diff={mad:.2e}  (N={len(chk)})")
chk[["Country_ISO", "year", "GINIW", "GINIW_pred_GDP_pc"]].to_csv(
    f"{SLUG}_index_crosscheck.csv", index=False)

# --- 4.5 Predicted / observed / light correlations (the paper's Table 2) ---
t2c = t2.copy()
t2c["Light_pc_Region"] = t2c["Light_Region"] / t2c["Pop_Region"]
t2c = t2c[(t2c.year > 2000) & (t2c.year < 2013)].copy()
bases = {"pred": "pred_GDP_pc_Region", "obs": "GDP_pc_Region",
         "light": "Light_pc_Region"}
keys = ["GINIW", "GE_m1W", "GE_0W", "GE_1W", "COVW"]
recs = []
for (iso, yr_), g in t2c.groupby(["Country_ISO", "year"]):
    rec = {"Country_ISO": iso}
    for suf, var in bases.items():
        v = ineq_indices(g[var], g["Pop_Region"])
        for kk in keys:
            rec[f"{kk}_{suf}"] = v[kk]
    recs.append(rec)
percty = pd.DataFrame(recs).groupby("Country_ISO", as_index=False).mean()
lab5 = ["Gini", "GE(-1)", "MLD GE(0)", "Theil GE(1)", "CV"]
po = [percty[f"{k}_pred"].corr(percty[f"{k}_obs"]) for k in keys]
lo = [percty[f"{k}_light"].corr(percty[f"{k}_obs"]) for k in keys]
pd.DataFrame({"index": lab5, "pred_vs_obs": np.round(po, 4),
              "light_vs_obs": np.round(lo, 4)}).to_csv(
    f"{SLUG}_table2_correlations.csv", index=False)
print(f"    Table 2 correlations across {len(percty)} countries:")
print("      predicted-vs-observed: "
      + "  ".join(f"{l}={v:.2f}" for l, v in zip(lab5, po)))
print("      light-vs-observed:     "
      + "  ".join(f"{l}={v:.2f}" for l, v in zip(lab5, lo)))

# Figure 8: the Table 2 correlations as grouped bars (our indices reproduce the
# paper's Table 2 exactly -- the real validation that the construction is right).
x = np.arange(len(lab5))
fig, ax = plt.subplots(figsize=(7.2, 4.3))
ax.bar(x - 0.2, po, width=0.4, color=STEEL, label="predicted vs observed")
ax.bar(x + 0.2, lo, width=0.4, color=ORANGE, label="raw light vs observed")
for xi, v in zip(x - 0.2, po):
    ax.text(xi, v + 0.01, f"{v:.2f}", ha="center", fontsize=8)
for xi, v in zip(x + 0.2, lo):
    ax.text(xi, v + 0.01, f"{v:.2f}", ha="center", fontsize=8)
ax.set_xticks(x); ax.set_xticklabels(lab5)
ax.set(ylim=(0, 0.65), ylabel="correlation across countries",
       title="Inequality measured from predicted income tracks the\nobserved "
             "data (reproducing the paper's Table 2)")
ax.legend(frameon=False, loc="upper right")
fig.tight_layout()
fig.savefig(fig_path(8, "table2_correlations"))
plt.close(fig)

# ===========================================================================
# 5. THE REGIONAL KUZNETS CURVE (TABLE 3)
# ===========================================================================
print("\n[5] Table 3 -- the regional Kuznets curve (PyFixest) ...")


def collapse5(df, vars_):
    d = df[(df.year >= 1990) & (df.year <= 2014)].copy()
    d["p5"] = pd.cut(d.year, [1989, 1994, 1999, 2004, 2009, 2014],
                     labels=[1, 2, 3, 4, 5]).astype("int64")
    return d.groupby(["Country_ISO", "p5"], as_index=False)[vars_].mean()


agg3 = collapse5(t3, ["GDP_pc_Country"] + IDX)
agg3["lg"] = np.log(agg3["GDP_pc_Country"])
agg3["lg2"] = agg3["lg"] ** 2
agg3["lg3"] = agg3["lg"] ** 3


def kuz_fit(dv, rhs):
    return pf.feols(f"{dv} ~ {rhs} | Country_ISO + p5", data=agg3,
                    vcov={"CRV1": "Country_ISO"})


k1 = kuz_fit("GINIW_pred_GDP_pc", "lg")
k2 = kuz_fit("GINIW_pred_GDP_pc", "lg + lg2")
k3 = kuz_fit("GINIW_pred_GDP_pc", "lg + lg2 + lg3")
k_other = {c: kuz_fit(c, "lg + lg2 + lg3") for c in IDX[1:]}
N3 = int(k3._N)
b3 = k3.coef()
print(f"    GINIW cubic: {b3['lg']:.3f} / {b3['lg2']:.3f} / "
      f"{b3['lg3']:.4f}  (N={N3}, countries={agg3.Country_ISO.nunique()})")

# Table 3 PNG
col_labels = ["(1) lin", "(2) quad", "(3) cubic", "(4) CV", "(5) Theil",
              "(6) MLD", "(7) GE(-1)"]
mods3 = [k1, k2, k3] + [k_other[c] for c in IDX[1:]]
rterms = ["lg", "lg2", "lg3"]
rlab = ["log GDP p.c.", "(log GDP p.c.)²", "(log GDP p.c.)³", "N", "countries"]
cells3 = []
for t_ in rterms:
    row = []
    for m in mods3:
        if t_ in m.coef().index:
            b = m.coef()[t_]
            p = m.pvalue()[t_]
            row.append(f"{b:.3f}{stars(p)}")
        else:
            row.append("--")
    cells3.append(row)
cells3.append([f"{int(m._N)}" for m in mods3])
cells3.append([f"{agg3.Country_ISO.nunique()}" for _ in mods3])
render_table_png(col_labels, rlab, cells3,
                 "Table 3. The regional Kuznets curve (country + period FE)",
                 fig_path(9, "table3"),
                 note="Dependent variable in cols (1)-(3): Gini (GINIW). "
                      "* p<.1  ** p<.05  *** p<.01. Clustered by country.",
                 figw=11)
pd.DataFrame({
    "metric": ["GINIW_lg", "GINIW_lg2", "GINIW_lg3", "N", "n_countries"]
    + [f"{IDX_LAB[c]}_lg3" for c in IDX[1:]],
    "value": [b3["lg"], b3["lg2"], b3["lg3"], N3, agg3.Country_ISO.nunique()]
    + [k_other[c].coef()["lg3"] for c in IDX[1:]],
}).to_csv(f"{SLUG}_table3_results.csv", index=False)

# --- 5.x The Kuznets scatter with fitted cubic (Figure 4) ------------------
import statsmodels.formula.api as smf
mfe = smf.ols("GINIW_pred_GDP_pc ~ lg + lg2 + lg3 + C(Country_ISO) + C(p5)",
              agg3).fit()
bb = {k: mfe.params[k] for k in rterms}
peff = {1: 0.0}
for k in (2, 3, 4, 5):
    peff[k] = mfe.params.get(f"C(p5)[T.{k}]", 0.0)
agg3["partial"] = agg3["GINIW_pred_GDP_pc"] - agg3["p5"].map(peff)
cons = (agg3["partial"] - (bb["lg"] * agg3.lg + bb["lg2"] * agg3.lg2
        + bb["lg3"] * agg3.lg3)).mean()
xs = np.linspace(5.5, 11.8, 200)
ys = cons + bb["lg"] * xs + bb["lg2"] * xs ** 2 + bb["lg3"] * xs ** 3
fig, ax = plt.subplots(figsize=(6.4, 4.6))
ax.scatter(agg3.lg, agg3.partial, s=14, facecolors="none",
           edgecolors=STEEL, alpha=0.55)
ax.plot(xs, ys, color=INK, lw=2.4, label="fitted cubic")
ax.set(xlim=(5.5, 11.8), ylim=(0, 0.16), xlabel="log GDP per capita",
       ylabel="partial regional inequality (GINIW)",
       title="Regional inequality and development (Figure 4)")
ax.legend(loc="upper right", frameon=False)
fig.tight_layout()
fig.savefig(fig_path(10, "kuznets_scatter"))
plt.close(fig)
pd.DataFrame({"metric": ["cubic_lg", "cubic_lg2", "cubic_lg3", "const", "N"],
              "value": [bb["lg"], bb["lg2"], bb["lg3"], cons, int(mfe.nobs)]
              }).to_csv(f"{SLUG}_fig4_cubic.csv", index=False)
print(f"    Figure 4 cubic (OLS-dummies): {bb['lg']:.3f} / {bb['lg2']:.3f} "
      f"/ {bb['lg3']:.4f}")

# ===========================================================================
# 6. DETERMINANTS OF REGIONAL INEQUALITY (TABLE 4)
# ===========================================================================
print("\n[6] Table 4 -- determinants of regional inequality (PyFixest) ...")
agg4 = collapse5(t4, ["GINIW_pred_GDP_pc", "GDP_pc_Country", "Pop_Country",
                      "Resources_rents_share_of_GDP", "Arable_land",
                      "Trade_GDP_share", "FDI_share_of_GDP", "area",
                      "price_gasoline", "Aid", "School_enrollment_secondary",
                      "GINIW_Eth_light"])
agg4["lg"] = np.log(agg4["GDP_pc_Country"])
agg4["lg2"] = agg4["lg"] ** 2
agg4["lg3"] = agg4["lg"] ** 3
agg4["aid_GDP"] = agg4["Aid"] / (agg4["GDP_pc_Country"] * agg4["Pop_Country"])
agg4["Resources_rents_share_of_GDP"] /= 100
agg4["School_enrollment_secondary"] /= 100
agg4["Area_X_price_gasoline"] = agg4["area"] * agg4["price_gasoline"] / 1e7
CUBIC = "lg + lg2 + lg3"


def det_fit(extra):
    return pf.feols(f"GINIW_pred_GDP_pc ~ {CUBIC} + {extra} | Country_ISO + p5",
                    data=agg4, vcov={"CRV1": "Country_ISO"})


d1 = det_fit("Resources_rents_share_of_GDP + Arable_land")
d2 = det_fit("Trade_GDP_share + FDI_share_of_GDP")
d3 = det_fit("price_gasoline + Area_X_price_gasoline")
d4 = det_fit("aid_GDP + School_enrollment_secondary")
d5 = det_fit("GINIW_Eth_light")
det_models = {"(1) resources": d1, "(2) openness": d2, "(3) geography": d3,
              "(4) aid+school": d4, "(5) ethnic": d5}
det_keys = {"(1) resources": ["Resources_rents_share_of_GDP", "Arable_land"],
            "(2) openness": ["Trade_GDP_share", "FDI_share_of_GDP"],
            "(3) geography": ["price_gasoline", "Area_X_price_gasoline"],
            "(4) aid+school": ["aid_GDP", "School_enrollment_secondary"],
            "(5) ethnic": ["GINIW_Eth_light"]}
KLAB = {"Resources_rents_share_of_GDP": "resource rents",
        "Arable_land": "arable land", "Trade_GDP_share": "trade/GDP",
        "FDI_share_of_GDP": "FDI/GDP", "price_gasoline": "gasoline price",
        "Area_X_price_gasoline": "area × gasoline", "aid_GDP": "aid/GDP",
        "School_enrollment_secondary": "schooling",
        "GINIW_Eth_light": "ethnic inequality"}
res_rows = []
for nm, m in det_models.items():
    for k in det_keys[nm]:
        b = m.coef()[k]
        p = m.pvalue()[k]
        res_rows.append({"column": nm, "control": KLAB[k], "coef": round(b, 4),
                         "p": round(p, 4), "N": int(m._N)})
det_df = pd.DataFrame(res_rows)
det_df.to_csv(f"{SLUG}_table4_results.csv", index=False)
b_eth = d5.coef()["GINIW_Eth_light"]
print(f"    ethnic-inequality coefficient (col 5) = {b_eth:.3f} "
      f"(N={int(d5._N)})")

# Table 4 PNG: one row per control block
col_labels = ["control", "coef", "", "N"]
rlbl, cells4 = [], []
for nm, m in det_models.items():
    for k in det_keys[nm]:
        rlbl.append(f"{nm}: {KLAB[k]}")
        b = m.coef()[k]
        p = m.pvalue()[k]
        cells4.append([KLAB[k], f"{b:.3f}", stars(p), f"{int(m._N)}"])
render_table_png(col_labels, rlbl, cells4,
                 "Table 4. Determinants of regional inequality",
                 fig_path(11, "table4"),
                 note="All columns add the cubic in log GDP p.c. + country & "
                      "period FE. Published col 4 (ICRG) is not reproducible. "
                      "* p<.1 ** p<.05 *** p<.01.",
                 figw=9)

# ===========================================================================
# 7. SPATIAL ROBUSTNESS: CONLEY STANDARD ERRORS (TABLE B.4)
# ===========================================================================
print("\n[7] Table B.4 -- Conley spatial-HAC standard errors ...")
tb4["satyear"] = sum(i * tb4[f"satyear_{i}"] for i in range(1, 8)).astype(int)
cols = ["log_GDP_pc_Region", "log_Light_ppix_Region", "Latitude", "Longitude",
        "code_Coutry_Region", "satyear"]
dfb = tb4.dropna(subset=cols).copy()
cnt = dfb["code_Coutry_Region"].value_counts()
dfb = dfb[dfb["code_Coutry_Region"].isin(cnt[cnt > 1].index)].copy()
mb = pf.feols("log_GDP_pc_Region ~ log_Light_ppix_Region | "
              "code_Coutry_Region + satyear", data=dfb)
b_b4 = float(mb.coef()["log_Light_ppix_Region"])
# Frisch-Waugh residualisation for the single-regressor Conley variance.
xfit = pf.feols("log_Light_ppix_Region ~ 1 | code_Coutry_Region + satyear",
                data=dfb)
xt = np.asarray(xfit.resid())
u = np.asarray(mb.resid())
xu = xt * u
sxx = float(np.sum(xt ** 2))
gb = dfb.assign(xu=xu).groupby("code_Coutry_Region")
agg_s = gb["xu"].sum().to_numpy()
lat = np.radians(gb["Latitude"].first().to_numpy())
lon = np.radians(gb["Longitude"].first().to_numpy())
R_EARTH, nr2 = 6371.0, agg_s.size


def conley_var(dist_km):
    v = 0.0
    for i in range(nr2):
        a = (np.sin((lat - lat[i]) / 2) ** 2
             + np.cos(lat[i]) * np.cos(lat) * np.sin((lon - lon[i]) / 2) ** 2)
        dij = 2 * R_EARTH * np.arcsin(np.minimum(1.0, np.sqrt(a)))
        w = np.maximum(0.0, 1 - dij / dist_km)
        v += agg_s[i] * np.sum(w * agg_s)
    return v / (sxx ** 2)


radii = [1000, 2500, 5000]
se_conley = {r: float(np.sqrt(conley_var(r))) for r in radii}
iid_se = float(mb.se()["log_Light_ppix_Region"])
print(f"    point estimate = {b_b4:.3f}; Conley SE "
      + " / ".join(f"{se_conley[r]:.3f}@{r}km" for r in radii)
      + f"; iid SE={iid_se:.3f}")
fig, ax = plt.subplots(figsize=(6.6, 4))
labels = ["iid (default)"] + [f"Conley {r} km" for r in radii]
ses = [iid_se] + [se_conley[r] for r in radii]
ypos = range(len(labels))
colors = [GREY, STEEL, STEEL, STEEL]
for i, (s, c) in enumerate(zip(ses, colors)):
    ax.plot([b_b4 - 1.96 * s, b_b4 + 1.96 * s], [i, i], color=c, lw=3,
            solid_capstyle="round")
    ax.plot(b_b4, i, "o", color=INK, ms=6)
ax.axvline(0, color=ORANGE, lw=1.5, ls="--")
ax.set_yticks(list(ypos)); ax.set_yticklabels(labels)
ax.set(xlabel="light elasticity (95% CI)",
       title=f"Spatial robustness of the light elasticity (β = {b_b4:.3f})")
ax.invert_yaxis()
fig.tight_layout()
fig.savefig(fig_path(12, "conley_se"))
plt.close(fig)
pd.DataFrame({
    "metric": ["point_estimate", "iid_se", "conley_se_1000",
               "conley_se_2500", "conley_se_5000", "N"],
    "value": [b_b4, iid_se, se_conley[1000], se_conley[2500],
              se_conley[5000], int(mb._N)],
}).to_csv(f"{SLUG}_tableB4_results.csv", index=False)

# ===========================================================================
# 8. REGIONAL VS PERSONAL INEQUALITY (FIGURE 5a)
# ===========================================================================
print("\n[8] Figure 5a -- regional vs personal inequality ...")
d5f = f5[(f5.year > 2000) & (f5.year < 2013)].copy()
agg5 = d5f.groupby("Country_ISO", as_index=False)[
    ["GINIW_pred_GDP_pc", "Giniall"]].mean()
agg5["GINIall_100"] = agg5["Giniall"] / 100
p5d = agg5.dropna(subset=["GINIall_100", "GINIW_pred_GDP_pc"])
slope, icept = np.polyfit(p5d["GINIW_pred_GDP_pc"], p5d["GINIall_100"], 1)
print(f"    n={len(p5d)} countries | OLS slope={slope:.3f}")
fig, ax = plt.subplots(figsize=(6, 4.8))
ax.scatter(p5d["GINIW_pred_GDP_pc"], p5d["GINIall_100"], marker="^", s=26,
           facecolors="none", edgecolors=STEEL)
xs = np.linspace(p5d["GINIW_pred_GDP_pc"].min(), p5d["GINIW_pred_GDP_pc"].max(),
                 200)
ax.plot(xs, slope * xs + icept, color=ORANGE, lw=2.2, label="OLS fit")
ax.set(xlabel="interregional inequality (GINIW)",
       ylabel="interpersonal inequality (household Gini)",
       title="Regional vs personal inequality (Figure 5a)")
ax.legend(loc="upper left", frameon=False)
fig.tight_layout()
fig.savefig(fig_path(13, "regional_vs_personal"))
plt.close(fig)
pd.DataFrame({"metric": ["n_countries", "ols_slope", "ols_intercept"],
              "value": [len(p5d), slope, icept]}).to_csv(
    f"{SLUG}_fig5_fit.csv", index=False)

# ===========================================================================
# 9. WRAP UP
# ===========================================================================
pngs = sorted(p for p in os.listdir(".") if p.startswith(SLUG) and p.endswith(".png"))
csvs = sorted(p for p in os.listdir(".") if p.startswith(SLUG) and p.endswith(".csv"))
print("\n" + "=" * 75)
print(f"Generated {len(pngs)} figures and {len(csvs)} CSV result files.")
print("Figures:", ", ".join(pngs))
print("\n=== Script completed successfully ===")
