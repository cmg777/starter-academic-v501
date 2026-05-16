"""
Carbon Taxes and CO2 Emissions: Sweden as a Case Study (Python replication)

Python replication of the R Tutor problem set
`RTutorCarbonTaxesAndCO2Emissions` (Theresa Graefe, 2020), which walks
through Andersson (2019) "Carbon Taxes and CO2 Emissions: Sweden as a Case
Study" (AEJ:EP). The script reproduces all five exercises:
    Ex 1 -- Descriptive overview of gasoline prices, taxes, consumption, CO2
    Ex 2 -- Causal effects: time differences, DiD, Synthetic Control, placebos
    Ex 3 -- Was GDP a confounder? Synthetic GDP for Sweden
    Ex 4 -- Tax incidence, OLS, IV (2SLS), disentangling carbon tax vs VAT
    Ex 5 -- Conclusion (prose only, lives in index.md)

Synthetic control is computed with `pysyncon`; OLS/IV regressions are
estimated with `pyfixest` (HC1 baseline) and standard errors are also
reported using `statsmodels` Newey-West (HAC, 16 lags) to match Andersson's
Stata specification.

Usage:
    python script.py

Outputs:
    - python_sc_co2tax_*.png (>= 12 figures, dark theme, dpi=300)
    - *.csv tables (descriptive, weights, regression, placebos, disentangling)
    - execution_log.txt (captured separately by the runner)

References:
    - Andersson, J. (2019). https://www.aeaweb.org/articles?id=10.1257/pol.20170144
    - R Tutor: https://github.com/TheresaGraefe/RTutorCarbonTaxesAndCO2Emissions
    - pysyncon: https://sdfordham.github.io/pysyncon/synth.html
    - pyfixest: https://pyfixest.org/
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import pyreadr
import statsmodels.api as sm
import pyfixest as pf
from pysyncon import Dataprep, Synth

# ── Configuration ────────────────────────────────────────────────────────────

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# Dark theme palette
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"

plt.rcParams.update({
    "figure.facecolor": DARK_NAVY,
    "axes.facecolor": DARK_NAVY,
    "axes.edgecolor": DARK_NAVY,
    "axes.linewidth": 0,
    "axes.labelcolor": LIGHT_TEXT,
    "axes.titlecolor": WHITE_TEXT,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.spines.left": False,
    "axes.spines.bottom": False,
    "axes.grid": True,
    "grid.color": GRID_LINE,
    "grid.linewidth": 0.6,
    "grid.alpha": 0.8,
    "xtick.color": LIGHT_TEXT,
    "ytick.color": LIGHT_TEXT,
    "xtick.major.size": 0,
    "ytick.major.size": 0,
    "text.color": WHITE_TEXT,
    "font.size": 12,
    "legend.frameon": False,
    "legend.fontsize": 11,
    "legend.labelcolor": LIGHT_TEXT,
    "figure.edgecolor": DARK_NAVY,
    "savefig.facecolor": DARK_NAVY,
    "savefig.edgecolor": DARK_NAVY,
})

SLUG = "python_sc_co2tax"
ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "references" / "RTutorCarbonTax-master" / "inst" / "ps" / "CarbonTaxesAndCO2Emissions" / "material"

SAVE_KW = dict(dpi=300, bbox_inches="tight",
               facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0.05)


def savefig(name: str) -> None:
    """Save the current figure to <SLUG>_<name>.png with site conventions."""
    plt.savefig(ROOT / f"{SLUG}_{name}.png", **SAVE_KW)
    plt.close()


def hline(title: str) -> None:
    print("\n" + "=" * 72)
    print(title)
    print("=" * 72)


# ─────────────────────────────────────────────────────────────────────────────
# Data loading
# ─────────────────────────────────────────────────────────────────────────────

hline("Loading data")

panel = pd.read_stata(DATA_DIR / "carbontax_data.dta")
loo = pd.read_stata(DATA_DIR / "leave_one_out_data.dta")
disent = pd.read_stata(DATA_DIR / "disentangling_data.dta")

descr_sweden = pyreadr.read_r(DATA_DIR / "descr_Sweden.Rds")[None].reset_index(drop=True)
gdp_data = pyreadr.read_r(DATA_DIR / "GDP_data.Rds")[None].reset_index(drop=True)
reg_data = pyreadr.read_r(DATA_DIR / "regression_data.Rds")[None].reset_index(drop=True)

print(f"panel (carbontax_data.dta): {panel.shape}, countries={panel['country'].nunique()}, years={panel['year'].min():.0f}-{panel['year'].max():.0f}")
print(f"descr_Sweden.Rds:          {descr_sweden.shape}")
print(f"GDP_data.Rds:              {gdp_data.shape}, countries={gdp_data['country'].nunique()}")
print(f"regression_data.Rds:       {reg_data.shape}, years={reg_data['year'].min():.0f}-{reg_data['year'].max():.0f}")
print(f"disentangling_data.dta:    {disent.shape}")
print(f"leave_one_out_data.dta:    {loo.shape}")


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 1.1 - Gasoline price components in Sweden
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 1.1: Gasoline price components")

ds = descr_sweden.copy()
print(ds[["year", "VAT", "en_tax", "CO2_tax", "pw_real", "total_tax"]].head().to_string(index=False))

fig, ax = plt.subplots(figsize=(9, 5.4))
ax.plot(ds["year"], ds["pw_real"], color=STEEL_BLUE, lw=2.2, label="Real wholesale price")
ax.plot(ds["year"], ds["en_tax"], color=WARM_ORANGE, lw=2.0, label="Energy tax")
ax.plot(ds["year"], ds["CO2_tax"], color=TEAL, lw=2.0, label="Carbon tax")
ax.plot(ds["year"], ds["VAT"], color="#c179c8", lw=1.8, label="VAT")
ax.axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
ax.set_xlabel("Year")
ax.set_ylabel("Real price components (SEK / litre)")
ax.set_title("Sweden — gasoline price decomposition (1960–2005)")
ax.legend(loc="upper left", ncol=2)
savefig("gasoline_price_components")

fig, ax = plt.subplots(figsize=(9, 5.4))
retail = ds["pw_real"] + ds["total_tax"]
ax.plot(ds["year"], retail, color=TEAL, lw=2.4, label="Retail gasoline price (real)")
ax.plot(ds["year"], ds["total_tax"], color=WARM_ORANGE, lw=2.0, label="Total tax")
ax.plot(ds["year"], ds["pw_real"], color=STEEL_BLUE, lw=2.0, label="Real wholesale price")
ax.axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
ax.set_xlabel("Year")
ax.set_ylabel("SEK / litre (real)")
ax.set_title("Sweden — retail price = wholesale + total tax")
ax.legend(loc="upper left")
savefig("retail_price")


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 1.2 - CO2 emissions and gasoline consumption (Sweden + OECD donor pool)
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 1.2: CO2 emissions & gasoline consumption")

fig, axes = plt.subplots(1, 2, figsize=(12, 4.8))
axes[0].plot(ds["year"], ds["CO2_Sweden"], color=WARM_ORANGE, lw=2.2)
axes[0].plot(ds["year"], ds["CO2_OECD"], color=STEEL_BLUE, lw=2.0, ls="--", label="OECD sample mean")
axes[0].axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
axes[0].set_title("Per-capita CO$_2$ from transport")
axes[0].set_xlabel("Year")
axes[0].set_ylabel("Metric tons / capita")
axes[0].legend(["Sweden", "OECD sample mean"], loc="lower right")

axes[1].plot(ds["year"], ds["gas_cons"], color=TEAL, lw=2.2, label="Gasoline")
axes[1].plot(ds["year"], ds["diesel_cons"], color=WARM_ORANGE, lw=2.0, label="Diesel")
axes[1].axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
axes[1].set_title("Per-capita fuel consumption — Sweden")
axes[1].set_xlabel("Year")
axes[1].set_ylabel("kg oil-equivalent / capita")
axes[1].legend(loc="lower right")

plt.suptitle("Outcomes around the 1990 Swedish energy-tax reform",
             color=WHITE_TEXT, fontsize=13)
savefig("co2_vs_consumption")

countries = sorted(panel["country"].unique())
fig, axes = plt.subplots(3, 5, figsize=(15, 8.5), sharex=True, sharey=True)
for ax, country in zip(axes.ravel(), countries):
    sub = panel[panel["country"] == country].sort_values("year")
    color = WARM_ORANGE if country == "Sweden" else STEEL_BLUE
    lw = 2.4 if country == "Sweden" else 1.4
    ax.plot(sub["year"], sub["CO2_transport_capita"], color=color, lw=lw)
    ax.axvline(1990, color=LIGHT_TEXT, lw=0.6, ls=":")
    ax.set_title(country, color=WHITE_TEXT, fontsize=11)
plt.suptitle("CO$_2$ from transport, per capita — OECD donor pool",
             color=WHITE_TEXT, fontsize=13)
plt.tight_layout(rect=[0, 0, 1, 0.96])
savefig("co2_donor_pool")


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 2 - Time differences and Differences-in-Differences
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 2.0-2.1: Time differences and DiD")

panel = panel.copy()
panel["post"] = (panel["year"] >= 1990).astype(int)
panel["treated"] = (panel["country"] == "Sweden").astype(int)
panel["Sweden_post"] = panel["treated"] * panel["post"]

# Time difference within Sweden alone (Sweden_time)
sw = panel[panel["country"] == "Sweden"].copy()
sw["delta"] = (sw["year"] >= 1990).astype(int)
m_time = pf.feols("CO2_transport_capita ~ delta", data=sw, vcov="HC1")
print("\nSweden time-difference regression:")
print(m_time.tidy().round(4))

# DiD on Sweden vs Denmark only
two = panel[panel["country"].isin(["Sweden", "Denmark"])].copy()
m_did2 = pf.feols(
    "CO2_transport_capita ~ treated + post + Sweden_post",
    data=two, vcov="HC1",
)
print("\nDiD: Sweden vs Denmark (HC1):")
print(m_did2.tidy().round(4))

# DiD on full OECD donor pool (clustered SE by country)
m_did_oecd = pf.feols(
    "CO2_transport_capita ~ treated + post + Sweden_post",
    data=panel, vcov={"CRV1": "country"},
)
print("\nDiD: Sweden vs full OECD donor pool (cluster by country):")
print(m_did_oecd.tidy().round(4))

# Save a tidy DiD comparison table
did_tab = pd.concat(
    [m_did2.tidy().assign(model="Sweden vs Denmark"),
     m_did_oecd.tidy().assign(model="Sweden vs OECD")],
    axis=0
)
did_tab.to_csv(ROOT / "tab_did_comparison.csv")

# Visual DiD: Sweden vs Denmark
fig, ax = plt.subplots(figsize=(9, 5.4))
for cty, col in [("Sweden", WARM_ORANGE), ("Denmark", STEEL_BLUE)]:
    sub = panel[panel["country"] == cty].sort_values("year")
    ax.plot(sub["year"], sub["CO2_transport_capita"], color=col, lw=2.2, label=cty)
ax.axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
ax.set_xlabel("Year")
ax.set_ylabel("Metric tons CO$_2$ / capita (transport)")
ax.set_title("DiD baseline — Sweden vs Denmark")
ax.legend(loc="lower right")
savefig("did_sweden_denmark")


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 2.3 - Synthetic Control: Synthetic Sweden
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 2.3: Synthetic Control — Synthetic Sweden")

# Build with country names (pysyncon accepts unit names directly).
controls = [c for c in countries if c != "Sweden"]
dataprep = Dataprep(
    foo=panel,
    predictors=["GDP_per_capita", "vehicles_capita", "gas_cons_capita", "urban_pop"],
    predictors_op="mean",
    time_predictors_prior=range(1980, 1990),
    special_predictors=[
        ("CO2_transport_capita", [1989], "mean"),
        ("CO2_transport_capita", [1980], "mean"),
        ("CO2_transport_capita", [1970], "mean"),
    ],
    dependent="CO2_transport_capita",
    unit_variable="country",
    time_variable="year",
    treatment_identifier="Sweden",
    controls_identifier=controls,
    time_optimize_ssr=range(1960, 1990),
)

synth = Synth()
synth.fit(dataprep=dataprep, optim_method="Nelder-Mead", optim_initial="equal")

print("\nDonor weights for Synthetic Sweden (top 8):")
w_sorted = synth.weights().sort_values(ascending=False)
print(w_sorted.head(8).round(4))
print(f"\nWeights sum to {w_sorted.sum():.6f}")
v_labels = list(dataprep.predictors) + [f"{name}({yrs[0] if len(yrs)==1 else f'{yrs[0]}-{yrs[-1]}'})"
                                         for (name, yrs, _) in dataprep.special_predictors]
v_diag = np.diag(synth.V) if synth.V.ndim == 2 else np.asarray(synth.V).ravel()
print(f"V (predictor) weights:\n{pd.Series(v_diag, index=v_labels).round(4)}")
print(f"Loss V (MSPE pre): {synth.loss_V:.6f}")
print(f"Loss W:           {synth.loss_W:.6f}")

# Build Sweden actual vs synthetic series
years = np.arange(1960, 2006)
y_sweden = panel[panel["country"] == "Sweden"].set_index("year").loc[years, "CO2_transport_capita"]
panel_wide = panel.pivot(index="year", columns="country", values="CO2_transport_capita")
y_synth = panel_wide.loc[years, controls] @ w_sorted.reindex(controls).fillna(0)

actual_vs_synth = pd.DataFrame({"sweden": y_sweden.values,
                                "synth_sweden": y_synth.values,
                                "gap": y_sweden.values - y_synth.values},
                               index=years)
actual_vs_synth.index.name = "year"
actual_vs_synth.to_csv(ROOT / "tab_synth_sweden.csv")

print(f"\nSweden 2005: {y_sweden.loc[2005]:.4f} t/capita")
print(f"Synth Sweden 2005: {y_synth.loc[2005]:.4f} t/capita")
print(f"Gap 2005: {y_sweden.loc[2005] - y_synth.loc[2005]:.4f} t/capita "
      f"({(y_sweden.loc[2005]-y_synth.loc[2005])/y_synth.loc[2005]*100:.2f}% vs synth)")

post = (years >= 1990)
gap = y_sweden.values - y_synth.values
avg_post_pct = (gap[post] / y_synth.values[post]).mean() * 100
print(f"Average post-treatment gap (1990-2005): {gap[post].mean():.4f} t/capita ({avg_post_pct:.2f}%)")

# Path plot
fig, ax = plt.subplots(figsize=(9, 5.4))
ax.plot(years, y_sweden.values, color=WARM_ORANGE, lw=2.4, label="Sweden")
ax.plot(years, y_synth.values, color=STEEL_BLUE, lw=2.2, ls="--", label="Synthetic Sweden")
ax.axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
ax.set_xlabel("Year")
ax.set_ylabel("Metric tons CO$_2$ / capita (transport)")
ax.set_title("Path plot — Sweden vs Synthetic Sweden")
ax.legend(loc="lower right")
savefig("synth_sweden_fit")

# Weights bar
fig, ax = plt.subplots(figsize=(8.5, 5.4))
nonzero = w_sorted[w_sorted > 1e-4]
ax.barh(nonzero.index[::-1], nonzero.values[::-1], color=TEAL)
ax.set_xlabel("Donor weight in Synthetic Sweden")
ax.set_title("Country weights $w^*$ (Synthetic Sweden)")
for i, (lbl, v) in enumerate(zip(nonzero.index[::-1], nonzero.values[::-1])):
    ax.text(v + 0.005, i, f"{v:.3f}", va="center", color=LIGHT_TEXT, fontsize=10)
savefig("synth_weights")

# Gap plot
fig, ax = plt.subplots(figsize=(9, 5.4))
ax.plot(years, gap, color=WARM_ORANGE, lw=2.4)
ax.fill_between(years, gap, 0, where=(gap < 0), color=WARM_ORANGE, alpha=0.18)
ax.axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
ax.axhline(0, color=LIGHT_TEXT, lw=0.6)
ax.set_xlabel("Year")
ax.set_ylabel("Gap = Sweden − Synthetic Sweden (t CO$_2$ / cap)")
ax.set_title("Treatment gap in CO$_2$ from transport")
savefig("synth_gap")

w_sorted.to_csv(ROOT / "tab_synth_weights.csv")


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 2.4 - Placebo studies
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 2.4: Placebo tests")

# (a) In-time placebo: reassign treatment to 1980
dp_time = Dataprep(
    foo=panel,
    predictors=["GDP_per_capita", "vehicles_capita", "gas_cons_capita", "urban_pop"],
    predictors_op="mean",
    time_predictors_prior=range(1970, 1980),
    special_predictors=[
        ("CO2_transport_capita", [1979], "mean"),
        ("CO2_transport_capita", [1970], "mean"),
        ("CO2_transport_capita", [1965], "mean"),
    ],
    dependent="CO2_transport_capita",
    unit_variable="country",
    time_variable="year",
    treatment_identifier="Sweden",
    controls_identifier=controls,
    time_optimize_ssr=range(1960, 1980),
)
synth_time = Synth()
synth_time.fit(dataprep=dp_time, optim_method="BFGS")
w_time = synth_time.weights()
yrs_time = np.arange(1960, 1991)
y_sw_t = panel_wide.loc[yrs_time, "Sweden"].values
y_sy_t = (panel_wide.loc[yrs_time, controls] @ w_time.reindex(controls).fillna(0)).values

fig, ax = plt.subplots(figsize=(9, 5.4))
ax.plot(yrs_time, y_sw_t, color=WARM_ORANGE, lw=2.4, label="Sweden")
ax.plot(yrs_time, y_sy_t, color=STEEL_BLUE, lw=2.2, ls="--", label="Synthetic Sweden")
ax.axvline(1980, color=LIGHT_TEXT, lw=0.8, ls=":")
ax.set_xlabel("Year")
ax.set_ylabel("Metric tons CO$_2$ / capita (transport)")
ax.set_title("In-time placebo — backdating treatment to 1980")
ax.legend(loc="lower right")
savefig("placebo_in_time")

# (b) In-space placebos: re-run SCM on every donor country
def run_placebo(treated_country: str) -> dict | None:
    co = [c for c in countries if c != treated_country]
    try:
        dp = Dataprep(
            foo=panel,
            predictors=["GDP_per_capita", "vehicles_capita", "gas_cons_capita", "urban_pop"],
            predictors_op="mean",
            time_predictors_prior=range(1980, 1990),
            special_predictors=[
                ("CO2_transport_capita", [1989], "mean"),
                ("CO2_transport_capita", [1980], "mean"),
                ("CO2_transport_capita", [1970], "mean"),
            ],
            dependent="CO2_transport_capita",
            unit_variable="country",
            time_variable="year",
            treatment_identifier=treated_country,
            controls_identifier=co,
            time_optimize_ssr=range(1960, 1990),
        )
        sy = Synth()
        sy.fit(dataprep=dp, optim_method="BFGS")
        w = sy.weights().reindex(co).fillna(0)
        y_actual = panel_wide.loc[years, treated_country].values
        y_syn = (panel_wide.loc[years, co] @ w).values
        gap_p = y_actual - y_syn
        pre_mask = years < 1990
        post_mask = years >= 1990
        mspe_pre = (gap_p[pre_mask] ** 2).mean()
        mspe_post = (gap_p[post_mask] ** 2).mean()
        return {"country": treated_country, "gap": gap_p,
                "mspe_pre": mspe_pre, "mspe_post": mspe_post,
                "ratio": mspe_post / mspe_pre if mspe_pre > 0 else np.nan}
    except Exception as e:
        print(f"  placebo failed for {treated_country}: {e}")
        return None


placebo_results = []
print("\nRunning in-space placebos for each donor country (this takes a moment)...")
for c in countries:
    r = run_placebo(c)
    if r is not None:
        placebo_results.append(r)

# Filter as Andersson/SCtools does: drop placebos with MSPE > 20 × Sweden's
sweden_res = next(r for r in placebo_results if r["country"] == "Sweden")
mspe_limit = 20 * sweden_res["mspe_pre"]
keep = [r for r in placebo_results
        if r["country"] == "Sweden" or r["mspe_pre"] <= mspe_limit]
print(f"Kept {len(keep)} placebos after MSPE-limit filter (limit = {mspe_limit:.4f}).")

fig, ax = plt.subplots(figsize=(9, 5.4))
for r in keep:
    if r["country"] == "Sweden":
        continue
    ax.plot(years, r["gap"], color=LIGHT_TEXT, lw=1.0, alpha=0.55)
ax.plot(years, sweden_res["gap"], color=WARM_ORANGE, lw=2.6, label="Sweden")
ax.axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
ax.axhline(0, color=LIGHT_TEXT, lw=0.6)
ax.set_xlabel("Year")
ax.set_ylabel("Gap in per-capita CO$_2$ from transport")
ax.set_title("In-space placebos — Sweden vs donor-pool placebos")
ax.legend(loc="lower left")
savefig("placebo_in_space")

# Post/pre MSPE ratio plot + p-value
ratios = pd.DataFrame(
    [{"country": r["country"], "ratio": r["ratio"]} for r in placebo_results]
).sort_values("ratio", ascending=False).reset_index(drop=True)
print("\nPost/Pre MSPE ratio per unit:")
print(ratios.round(3).to_string(index=False))
p_val = (ratios["ratio"] >= sweden_res["ratio"]).mean()
print(f"\nPermutation p-value for Sweden = {p_val:.4f}")
ratios.to_csv(ROOT / "tab_placebo_mspe_ratios.csv", index=False)

fig, ax = plt.subplots(figsize=(8.5, 6.0))
colors = [WARM_ORANGE if c == "Sweden" else STEEL_BLUE for c in ratios["country"]]
ax.barh(ratios["country"][::-1], ratios["ratio"][::-1], color=colors[::-1])
ax.set_xlabel("Post-/Pre-treatment MSPE ratio")
ax.set_title(f"Permutation test: MSPE ratios — p = {p_val:.3f}")
savefig("placebo_mspe_ratio")

# (c) Leave-one-out: use pre-computed dta file
fig, ax = plt.subplots(figsize=(9, 5.4))
excl_cols = [c for c in loo.columns if c.startswith("excl_")]
loo_long_labels = {
    "excl_unitedstates": "US excl.", "excl_belgium": "BE excl.",
    "excl_denmark": "DK excl.", "excl_greece": "GR excl.",
    "excl_newzealand": "NZ excl.", "excl_switzerland": "CH excl.",
}
for col in excl_cols:
    ax.plot(loo["Year"], loo[col], color=LIGHT_TEXT, lw=1.1, alpha=0.7,
            label=loo_long_labels.get(col, col))
ax.plot(loo["Year"], loo["synth_sweden"], color=WARM_ORANGE, lw=2.4,
        label="Synthetic Sweden")
ax.plot(loo["Year"], loo["sweden"], color=TEAL, lw=2.2, label="Sweden")
ax.axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
ax.set_xlabel("Year")
ax.set_ylabel("Metric tons CO$_2$ / capita (transport)")
ax.set_title("Leave-one-out robustness — Synthetic Sweden across donor exclusions")
ax.legend(loc="lower right", ncol=2, fontsize=9)
savefig("placebo_leave_one_out")


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 3.1 - Is GDP a relevant confounder?
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 3.1: GDP and CO2 levels & gaps")

fig, axes = plt.subplots(1, 2, figsize=(12, 4.8))
axes[0].plot(ds["year"], ds["GDP_Sweden"], color=STEEL_BLUE, lw=2.2)
axes[0].axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
axes[0].set_title("GDP per capita — Sweden")
axes[0].set_xlabel("Year")
axes[0].set_ylabel("USD per capita (real)")

axes[1].plot(ds["year"], ds["CO2_Sweden"], color=WARM_ORANGE, lw=2.2)
axes[1].axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
axes[1].set_title("CO$_2$ per capita — Sweden")
axes[1].set_xlabel("Year")
axes[1].set_ylabel("Metric tons / capita")
plt.suptitle("Sweden: GDP and CO$_2$ levels", color=WHITE_TEXT, fontsize=13)
savefig("gdp_co2_levels")

fig, axes = plt.subplots(1, 2, figsize=(12, 4.8))
for ax, var, color, lab in [
    (axes[0], "gap_GDP", STEEL_BLUE, "Gap GDP (USD) — Sweden − Synth(CO$_2$)"),
    (axes[1], "gap_CO2", WARM_ORANGE, "Gap CO$_2$ (t / cap) — Sweden − Synth(CO$_2$)"),
]:
    ax.axvspan(1976, 1978, color=GRID_LINE, alpha=0.55)
    ax.axvspan(1991, 1993, color=GRID_LINE, alpha=0.55)
    ax.plot(ds["year"], ds[var], color=color, lw=2.2)
    ax.axhline(0, color=LIGHT_TEXT, lw=0.6)
    ax.set_xlabel("Year")
    ax.set_ylabel(lab)
plt.suptitle("Gaps vs Synthetic Sweden(CO$_2$) — recessions shaded",
             color=WHITE_TEXT, fontsize=13)
savefig("gdp_co2_gaps")


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 3.2 - Synthetic GDP for Sweden
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 3.2: Synthetic GDP for Sweden")

gdp = gdp_data.copy()
# Some rows may have NaNs in predictors; pysyncon will fail if predictor is NaN
# for the years used. We drop schooling NaNs only for the years we average.
gdp_controls = sorted([c for c in gdp["country"].unique() if c != "Sweden"])

dp_gdp = Dataprep(
    foo=gdp,
    predictors=["investrate", "trade", "infrate"],
    predictors_op="mean",
    time_predictors_prior=range(1980, 1990),
    special_predictors=[
        ("gdp_cap", [1975], "mean"),
        ("gdp_cap", [1980], "mean"),
        ("gdp_cap", [1989], "mean"),
        ("schooling", [1975, 1980, 1985], "mean"),
    ],
    dependent="gdp_cap",
    unit_variable="country",
    time_variable="year",
    treatment_identifier="Sweden",
    controls_identifier=gdp_controls,
    time_optimize_ssr=range(1970, 1990),
)
synth_gdp = Synth()
synth_gdp.fit(dataprep=dp_gdp, optim_method="BFGS")

gdp_wide = gdp.pivot(index="year", columns="country", values="gdp_cap")
gdp_years = np.arange(1970, 2006)
w_gdp = synth_gdp.weights().reindex(gdp_controls).fillna(0)
gdp_actual = gdp_wide.loc[gdp_years, "Sweden"].values
gdp_synth = (gdp_wide.loc[gdp_years, gdp_controls] @ w_gdp).values

print("\nSynthetic-GDP donor weights (non-zero):")
print(w_gdp[w_gdp > 1e-4].sort_values(ascending=False).round(4))
print(f"GDP 2005 — Sweden actual: ${gdp_actual[-1]:,.0f} vs Synthetic: ${gdp_synth[-1]:,.0f}")

fig, ax = plt.subplots(figsize=(9, 5.4))
ax.plot(gdp_years, gdp_actual, color=WARM_ORANGE, lw=2.4, label="Sweden")
ax.plot(gdp_years, gdp_synth, color=STEEL_BLUE, lw=2.2, ls="--", label="Synthetic Sweden(GDP)")
ax.axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
ax.set_xlabel("Year")
ax.set_ylabel("GDP per capita (USD, real)")
ax.set_title("Synthetic GDP — did the carbon tax hurt Swedish growth?")
ax.legend(loc="lower right")
savefig("gdp_synth")


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 4 - Tax incidence
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 4 (intro): Tax incidence — pass-through to consumers")

reg = reg_data.copy()
tax_sub = reg[["year", "p_nom", "en_tax", "CO2_tax", "oil_p", "en_CO2_tax"]].copy()
tax_sub["delta_p"] = tax_sub["p_nom"].diff()
tax_sub["delta_oil_p"] = tax_sub["oil_p"].diff()
tax_sub["delta_tax"] = tax_sub["en_CO2_tax"].diff()
m_incid = pf.feols(
    "delta_p ~ delta_oil_p + delta_tax",
    data=tax_sub.dropna(subset=["delta_p", "delta_oil_p", "delta_tax"]),
    vcov="HC1",
)
print("\nTax-incidence regression (HC1):")
print(m_incid.tidy().round(4))


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 4.1 - OLS gasoline-consumption regressions (Newey-West HAC, 16 lags)
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 4.1: OLS gasoline-consumption regressions")

# pyfixest baseline (HC1)
ols_specs = {
    "OLS1": "log_gas_cons ~ p_real_vat + real_CO2_tax_vat + d_CO2_tax + t",
    "OLS2": "log_gas_cons ~ p_real_vat + real_CO2_tax_vat + d_CO2_tax + t + gdp_cap",
    "OLS3": "log_gas_cons ~ p_real_vat + real_CO2_tax_vat + d_CO2_tax + t + gdp_cap + urban_pop",
    "OLS4": "log_gas_cons ~ p_real_vat + real_CO2_tax_vat + d_CO2_tax + t + gdp_cap + urban_pop + unempl",
}
ols_fits = {name: pf.feols(f, data=reg, vcov="HC1") for name, f in ols_specs.items()}
for name, fit in ols_fits.items():
    print(f"\n{name} (HC1):")
    print(fit.tidy()[["Estimate", "Std. Error", "t value", "Pr(>|t|)"]].round(4))

# Newey-West HAC SE via statsmodels, to match Andersson's Stata `newey ... lag(16)`
def newey_west_table(formula: str, data: pd.DataFrame, maxlags: int = 16) -> pd.DataFrame:
    rhs = formula.split("~")[1]
    ys = formula.split("~")[0].strip()
    cols = [v.strip() for v in rhs.split("+")]
    sub = data[[ys] + cols].dropna()
    X = sm.add_constant(sub[cols])
    res = sm.OLS(sub[ys], X).fit(cov_type="HAC", cov_kwds={"maxlags": maxlags})
    return pd.DataFrame({
        "coef": res.params, "se_nw16": res.bse,
        "t": res.tvalues, "p": res.pvalues,
    })

nw_tables = {name: newey_west_table(f, reg) for name, f in ols_specs.items()}
print("\nNewey-West HAC(16) results — OLS4:")
print(nw_tables["OLS4"].round(4))

# Save a wide comparison table
wide = pd.concat({k: v[["coef", "se_nw16"]] for k, v in nw_tables.items()}, axis=1)
wide.to_csv(ROOT / "tab_ols_newey_west.csv")


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 4.2 - Instrumental variable (2SLS)
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 4.2: IV / 2SLS")

iv_data = reg[(reg["year"] >= 1970) & (reg["year"] <= 2011)].copy()

# Single-instrument: crude oil price (real)
iv2 = pf.feols(
    "log_gas_cons ~ real_CO2_tax_vat + d_CO2_tax + t + gdp_cap + urban_pop + unempl "
    "| p_real_vat ~ oil_p_real",
    data=iv_data, vcov="HC1",
)
print("\nIV: oil_p_real instrument (HC1):")
print(iv2.tidy().round(4))

# Single-instrument: energy tax
iv1 = pf.feols(
    "log_gas_cons ~ real_CO2_tax_vat + d_CO2_tax + t + gdp_cap + urban_pop + unempl "
    "| p_real_vat ~ real_en_tax_vat",
    data=iv_data, vcov="HC1",
)
print("\nIV: real_en_tax_vat instrument (HC1):")
print(iv1.tidy().round(4))

# Both instruments together (over-identified)
iv_both = pf.feols(
    "log_gas_cons ~ real_CO2_tax_vat + d_CO2_tax + t + gdp_cap + urban_pop + unempl "
    "| p_real_vat ~ oil_p_real + real_en_tax_vat",
    data=iv_data, vcov="HC1",
)
print("\nIV: both instruments (HC1):")
print(iv_both.tidy().round(4))

# First-stage diagnostic: how strong is each instrument?
fs_both = pf.feols(
    "p_real_vat ~ real_CO2_tax_vat + d_CO2_tax + t + gdp_cap + urban_pop + unempl + "
    "oil_p_real + real_en_tax_vat",
    data=iv_data, vcov="HC1",
)
print("\nFirst-stage regression (HC1):")
print(fs_both.tidy().round(4))


def coef_se(fit, var):
    t = fit.tidy()
    if var in t.index:
        row = t.loc[var]
        return float(row["Estimate"]), float(row["Std. Error"])
    return None, None


iv_summary = pd.DataFrame({
    "model": ["OLS4", "IV (energy tax)", "IV (oil price)", "IV (both)"],
    "beta_p_real_vat": [
        coef_se(ols_fits["OLS4"], "p_real_vat")[0],
        coef_se(iv1, "p_real_vat")[0],
        coef_se(iv2, "p_real_vat")[0],
        coef_se(iv_both, "p_real_vat")[0],
    ],
    "beta_real_CO2_tax_vat": [
        coef_se(ols_fits["OLS4"], "real_CO2_tax_vat")[0],
        coef_se(iv1, "real_CO2_tax_vat")[0],
        coef_se(iv2, "real_CO2_tax_vat")[0],
        coef_se(iv_both, "real_CO2_tax_vat")[0],
    ],
}).round(4)
iv_summary.to_csv(ROOT / "tab_iv_comparison.csv", index=False)
print("\nOLS vs IV comparison:")
print(iv_summary.to_string(index=False))

# Coefficient comparison plot
fig, ax = plt.subplots(figsize=(9, 5.4))
x_lbl = ["price semi-elasticity\n($p^v_t$)", "tax semi-elasticity\n($ct_t$)"]
x = np.arange(2)
bar_w = 0.2
models = iv_summary["model"].tolist()
colors_m = [STEEL_BLUE, WARM_ORANGE, TEAL, "#c179c8"]
for i, m in enumerate(models):
    row = iv_summary[iv_summary["model"] == m].iloc[0]
    ax.bar(x + (i - 1.5) * bar_w,
           [row["beta_p_real_vat"], row["beta_real_CO2_tax_vat"]],
           width=bar_w, color=colors_m[i], label=m)
ax.set_xticks(x)
ax.set_xticklabels(x_lbl)
ax.axhline(0, color=LIGHT_TEXT, lw=0.6)
ax.set_ylabel("Coefficient (log gasoline consumption per SEK / litre)")
ax.set_title("Price and tax semi-elasticities — OLS4 vs IV")
ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.18), ncol=4)
savefig("iv_vs_ols_coefs")


# ─────────────────────────────────────────────────────────────────────────────
# Exercise 4.3 - Disentangling carbon tax from VAT
# ─────────────────────────────────────────────────────────────────────────────

hline("Exercise 4.3: Disentangling carbon tax from VAT")

dis = disent[(disent["year"] >= 1970) & (disent["year"] <= 2005)].copy()
print(dis.tail(6).round(4).to_string(index=False))

# Recompute Andersson's headline number: average carbon-tax-attributable reduction
# in CO2 transport emissions (relative to NoCarbonTax + Synthetic Sweden gap).
mask_post = dis["year"] >= 1990
dis_post = dis[mask_post]
ct_reduction_pct = (
    (dis_post["NoCarbonTaxWithVAT"] - dis_post["CarbonTaxandVAT"])
    / dis_post["NoCarbonTaxWithVAT"]
).mean() * 100
print(f"\nMean post-1990 carbon-tax-attributable reduction "
      f"(rel. to no-carbon-tax-with-VAT scenario): {ct_reduction_pct:.2f}%")

fig, ax = plt.subplots(figsize=(9, 5.4))
ax.plot(dis["year"], dis["NoCarbonTaxNoVAT"], color=TEAL, lw=2.2, ls=":",
        label="No carbon tax, no VAT")
ax.plot(dis["year"], dis["NoCarbonTaxWithVAT"], color=STEEL_BLUE, lw=2.2, ls="--",
        label="No carbon tax, with VAT")
ax.plot(dis["year"], dis["CarbonTaxandVAT"], color=WARM_ORANGE, lw=2.4,
        label="Carbon tax + VAT (actual)")
ax.axvline(1990, color=LIGHT_TEXT, lw=0.8, ls=":")
ax.set_xlabel("Year")
ax.set_ylabel("Metric tons CO$_2$ / capita (transport)")
ax.set_title("Counterfactual CO$_2$ scenarios — disentangling tax components")
ax.legend(loc="upper left")
savefig("disentangling")

dis.to_csv(ROOT / "tab_disentangling.csv", index=False)


# ─────────────────────────────────────────────────────────────────────────────
# Headline summary
# ─────────────────────────────────────────────────────────────────────────────

hline("Headline summary")

summary = {
    "DiD (Sweden vs Denmark) on Sweden_post":
        m_did2.tidy().loc["Sweden_post", "Estimate"],
    "DiD (Sweden vs OECD, cluster SE) on Sweden_post":
        m_did_oecd.tidy().loc["Sweden_post", "Estimate"],
    "Synthetic Sweden — 2005 gap (t CO2/cap)":
        y_sweden.loc[2005] - y_synth.loc[2005],
    "Synthetic Sweden — average post-treatment % reduction":
        avg_post_pct,
    "Permutation placebo p-value (post/pre MSPE ratio)":
        p_val,
    "OLS4 — price semi-elasticity (beta1)":
        ols_fits["OLS4"].tidy().loc["p_real_vat", "Estimate"],
    "OLS4 — tax semi-elasticity (beta2)":
        ols_fits["OLS4"].tidy().loc["real_CO2_tax_vat", "Estimate"],
    "IV (oil) — price semi-elasticity":
        iv2.tidy().loc["p_real_vat", "Estimate"],
    "IV (oil) — tax semi-elasticity":
        iv2.tidy().loc["real_CO2_tax_vat", "Estimate"],
    "Disentangling — mean carbon-tax-only reduction (%)":
        ct_reduction_pct,
}
summary_df = pd.DataFrame({"value": summary}).round(4)
print(summary_df.to_string())
summary_df.to_csv(ROOT / "tab_headline_summary.csv")


print("\n=== Script completed successfully ===")
