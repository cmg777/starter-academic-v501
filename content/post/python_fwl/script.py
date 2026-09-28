"""
The FWL Theorem: Making Multivariate Regressions Intuitive

Demonstrates the Frisch-Waugh-Lovell theorem using a simulated retail
store dataset where coupon usage affects sales but is confounded by
neighborhood income.

Usage:
    python script.py            (figures are saved, never shown: no window opens)

Outputs (all written next to this file):
    data/fwl_store_data.csv     the seed-42 simulated dataset (50 stores, 4 columns)
    fwl_results.json            canonical numbers quoted in the post, slides, apps
    web_app/data/results.json   forest-plot rows, OVB identity and the 50 stores
                                (only when a web_app/data/ folder exists, so not
                                in the Quarto zip bundle)
    fwl_*.png                   the five dark-theme figures used in the post

References:
    - Frisch & Waugh (1933). Partial Time Regressions as Compared with
      Individual Trends. Econometrica.
    - Lovell (1963). Seasonal Adjustment of Economic Time Series and
      Multiple Regression Analysis. JASA.
    - Courthoud (2022). Understanding the Frisch-Waugh-Lovell Theorem
      (originally "The FWL Theorem, Or How To Make All Regressions
      Intuitive"). Towards Data Science.
"""

import json
import platform
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels
import statsmodels.formula.api as smf

HERE = Path(__file__).resolve().parent

# Reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# Dark theme palette (consistent with site navbar/dark sections)
DARK_NAVY = "#0f1729"
GRID_LINE = "#1f2b5e"
LIGHT_TEXT = "#c8d0e0"
WHITE_TEXT = "#e8ecf2"

# Plot defaults — minimal, spine-free, dark background
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


# ── Data Generating Process ──────────────────────────────────────────

def simulate_store_data(n=50, seed=42):
    """Simulate retail store data with confounding by income.

    True DGP:
        income   ~ N(50, 10)
        dayofweek ~ Uniform{1, ..., 7}
        coupons  = 60 - 0.5 * income + N(0, 5)
        sales    = 10 + 0.2 * coupons + 0.3 * income + 0.5 * dayofweek + N(0, 3)

    The true causal effect of coupons on sales is +0.2.
    """
    rng = np.random.default_rng(seed)
    income = rng.normal(50, 10, n)
    dayofweek = rng.integers(1, 8, n)
    coupons = 60 - 0.5 * income + rng.normal(0, 5, n)
    sales = (10 + 0.2 * coupons + 0.3 * income
             + 0.5 * dayofweek + rng.normal(0, 3, n))
    return pd.DataFrame({
        "sales": np.round(sales, 2),
        "coupons": np.round(coupons, 2),
        "income": np.round(income, 2),
        "dayofweek": dayofweek,
    })


# ── Generate data ────────────────────────────────────────────────────

N = 50
df = simulate_store_data(n=N, seed=RANDOM_SEED)

# Export the raw dataset once, before any derived columns are added, so the
# R and Stata companions can reproduce every number in the post exactly.
DATA_DIR = HERE / "data"
DATA_DIR.mkdir(exist_ok=True)
CSV_PATH = DATA_DIR / "fwl_store_data.csv"
df.to_csv(CSV_PATH, index=False, lineterminator="\n")
pd.testing.assert_frame_equal(pd.read_csv(CSV_PATH), df, check_dtype=False)

print("Dataset shape:", df.shape)
print()
print(df.head())
print()
print(df.describe().round(2))

# ── Naive regression ─────────────────────────────────────────────────

naive_model = smf.ols("sales ~ coupons", df).fit()
print("\n=== Naive regression: sales ~ coupons ===")
print(naive_model.summary().tables[1])

# ── Multiple regression (controlling for income) ─────────────────────

full_model = smf.ols("sales ~ coupons + income", df).fit()
print("\n=== Full regression: sales ~ coupons + income ===")
print(full_model.summary().tables[1])

# ── FWL Step 1: residualize coupons only ─────────────────────────────

df["coupons_tilde"] = smf.ols("coupons ~ income", df).fit().resid

fwl_step1 = smf.ols("sales ~ coupons_tilde - 1", df).fit()
print("\n=== FWL Step 1: sales ~ coupons_tilde (no intercept) ===")
print(fwl_step1.summary().tables[1])

# ── FWL Step 2: residualize both ─────────────────────────────────────

df["sales_tilde"] = smf.ols("sales ~ income", df).fit().resid

fwl_step2 = smf.ols("sales_tilde ~ coupons_tilde - 1", df).fit()
print("\n=== FWL Step 2: sales_tilde ~ coupons_tilde (no intercept) ===")
print(fwl_step2.summary().tables[1])

# ── Multiple controls: income + dayofweek ────────────────────────────

full_model_2 = smf.ols("sales ~ coupons + income + dayofweek", df).fit()
print("\n=== Full regression with multiple controls ===")
print(full_model_2.summary().tables[1])

df["coupons_tilde_2"] = smf.ols("coupons ~ income + dayofweek", df).fit().resid
df["sales_tilde_2"] = smf.ols("sales ~ income + dayofweek", df).fit().resid

fwl_multi = smf.ols("sales_tilde_2 ~ coupons_tilde_2 - 1", df).fit()
print("\n=== FWL with multiple controls ===")
print(fwl_multi.summary().tables[1])

# Why adding dayofweek moves the coupon coefficient only from 0.2673 to 0.2706:
# the same OVB identity, one control up. The one-control coefficient equals the
# two-control one plus gamma_dow * delta_dow, where gamma_dow is dayofweek's
# coefficient in the two-control model and delta_dow is the coupons coefficient
# in dayofweek ~ coupons + income — the PARTIAL association of dayofweek with
# coupons once income is held fixed, not their raw correlation.
gamma_dow = full_model_2.params["dayofweek"]
delta_dow = smf.ols("dayofweek ~ coupons + income", df).fit().params["coupons"]
dow_tilde = smf.ols("dayofweek ~ income", df).fit().resid
pcorr_dow_coupons = np.corrcoef(dow_tilde, df["coupons_tilde"])[0, 1]
one_minus_two = full_model.params["coupons"] - full_model_2.params["coupons"]
print("\n=== Why dayofweek barely moves the coupon coefficient ===")
print(f"one control - two controls = {full_model.params['coupons']:.4f} - "
      f"{full_model_2.params['coupons']:.4f} = {one_minus_two:.4f}")
print(f"gamma_dow x delta_dow      = {gamma_dow:.4f} x {delta_dow:.4f} = "
      f"{gamma_dow * delta_dow:.4f}")
print(f"partial corr(dayofweek, coupons | income) = {pcorr_dow_coupons:.3f}"
      f"   (raw corr {df['dayofweek'].corr(df['coupons']):.3f})")

# ── Scaled residuals ─────────────────────────────────────────────────

df["coupons_tilde_scaled"] = df["coupons_tilde"] + df["coupons"].mean()
df["sales_tilde_scaled"] = df["sales_tilde"] + df["sales"].mean()

scaled_model = smf.ols("sales_tilde_scaled ~ coupons_tilde_scaled", df).fit()
print("\n=== Scaled residuals regression ===")
print(scaled_model.summary().tables[1])

# ── Where the bias comes from: the omitted-variable-bias identity ──────
#
# naive = full + gamma_hat * delta_hat holds EXACTLY in the sample, where
# gamma_hat is income's coefficient in the full regression and delta_hat is
# the slope from regressing the omitted variable (income) ON coupons.

gamma_hat = full_model.params["income"]
ovb_aux = smf.ols("income ~ coupons", df).fit()
delta_hat = ovb_aux.params["coupons"]
wrong_dir = smf.ols("coupons ~ income", df).fit().params["income"]
ovb_hat = gamma_hat * delta_hat
naive_minus_full = naive_model.params["coupons"] - full_model.params["coupons"]
print("\n=== OVB identity ===")
print(f"gamma_hat x delta_hat = {gamma_hat:.4f} x {delta_hat:.4f} = {ovb_hat:.4f}")
print(f"naive - full          = {naive_model.params['coupons']:.4f} - "
      f"{full_model.params['coupons']:.4f} = {naive_minus_full:.4f}")

# ── Why Step 1's standard error explodes: the SE ladder ───────────────

step1_int = smf.ols("sales ~ coupons_tilde", df).fit()
step1_dm = smf.ols("I(sales - sales.mean()) ~ coupons_tilde - 1", df).fit()
se_ladder = {
    "step1_no_intercept": fwl_step1.bse["coupons_tilde"],
    "step1_with_intercept": step1_int.bse["coupons_tilde"],
    "step1_demeaned_sales": step1_dm.bse["coupons_tilde"],
    "step2_residualize_both": fwl_step2.bse["coupons_tilde"],
    "full_model": full_model.bse["coupons"],
}
print("\n=== SE ladder (coefficient on coupons is 0.2673 in every row) ===")
for k, v in se_ladder.items():
    print(f"{k:<24s} {v:.4f}")
gap = se_ladder["step1_no_intercept"] - se_ladder["full_model"]
share_intercept_levels = (se_ladder["step1_no_intercept"]
                          - se_ladder["step1_with_intercept"]) / gap

# Heteroskedasticity-robust SEs of the coupon coefficient, full model vs Step 2.
# HC0 matches exactly (same residuals, no df factor); HC1 differs by the same
# sqrt(49/47) as the classical SE; HC2/HC3 differ because the leverages differ.
robust_se = {}
for hc in ["HC0", "HC1", "HC2", "HC3"]:
    se_full_hc = full_model.model.fit(cov_type=hc).bse["coupons"]
    se_step2_hc = fwl_step2.model.fit(cov_type=hc).bse["coupons_tilde"]
    robust_se[hc] = {"full_model": float(se_full_hc),
                     "step2_residualize_both": float(se_step2_hc),
                     "ratio_full_over_step2": float(se_full_hc / se_step2_hc)}
print("\n=== Robust SEs of the coupon coefficient: full model vs Step 2 ===")
for hc, v in robust_se.items():
    print(f"{hc}: full {v['full_model']:.4f}   Step 2 "
          f"{v['step2_residualize_both']:.4f}   ratio {v['ratio_full_over_step2']:.4f}")

# ── FWL by hand in NumPy ─────────────────────────────────────────────

y = df["sales"].to_numpy()
x1 = df["coupons"].to_numpy()
X2 = np.column_stack([np.ones(N), df["income"].to_numpy()])
c_tilde = x1 - X2 @ np.linalg.lstsq(X2, x1, rcond=None)[0]
s_tilde = y - X2 @ np.linalg.lstsq(X2, y, rcond=None)[0]
cov_sc = np.cov(s_tilde, c_tilde)[0, 1]
var_c = np.var(c_tilde, ddof=1)
beta_cov = cov_sc / var_c
M2 = np.eye(N) - X2 @ np.linalg.inv(X2.T @ X2) @ X2.T
beta_matrix = (x1 @ M2 @ y) / (x1 @ M2 @ x1)
print("\n=== FWL by hand ===")
print(f"Cov / Var    = {cov_sc:.4f} / {var_c:.4f} = {beta_cov:.4f}")
print(f"Matrix form  = {beta_matrix:.4f}")

# ── Invariants: the post's claims, checked on every run ──────────────

b_full = full_model.params["coupons"]
assert abs(fwl_step1.params["coupons_tilde"] - b_full) < 1e-12
assert abs(fwl_step2.params["coupons_tilde"] - b_full) < 1e-12
assert abs(step1_int.params["coupons_tilde"] - b_full) < 1e-12
assert abs(beta_cov - b_full) < 1e-12 and abs(beta_matrix - b_full) < 1e-12
assert abs(fwl_multi.params["coupons_tilde_2"]
           - full_model_2.params["coupons"]) < 1e-12
assert abs(scaled_model.params["coupons_tilde_scaled"] - b_full) < 1e-12
assert abs(naive_minus_full - ovb_hat) < 1e-12
assert np.allclose(fwl_step2.resid.to_numpy(), full_model.resid.to_numpy())
assert np.allclose(M2 @ M2, M2) and np.allclose(M2, M2.T)
assert abs(se_ladder["step2_residualize_both"] / se_ladder["full_model"]
           - np.sqrt(47 / 49)) < 1e-12
assert abs(one_minus_two - gamma_dow * delta_dow) < 1e-12   # dayofweek identity
assert abs(robust_se["HC0"]["ratio_full_over_step2"] - 1) < 1e-10
assert abs(robust_se["HC1"]["ratio_full_over_step2"] - np.sqrt(49 / 47)) < 1e-10


# ── Canonical results ────────────────────────────────────────────────

def summarize(model, term, label, n_controls):
    ci = model.conf_int().loc[term]
    return {
        "method": label,
        "coef": float(model.params[term]),
        "se": float(model.bse[term]),
        "t": float(model.tvalues[term]),
        "p": float(model.pvalues[term]),
        "ci_lo": float(ci[0]),
        "ci_hi": float(ci[1]),
        "df_resid": int(model.df_resid),
        "n_controls": n_controls,
    }


MODELS = [
    summarize(naive_model, "coupons", "Naive OLS (no controls)", 0),
    summarize(full_model, "coupons", "Full OLS (+ income)", 1),
    summarize(fwl_step1, "coupons_tilde", "FWL Step 1 (residualize X only)", 1),
    summarize(step1_int, "coupons_tilde", "FWL Step 1 + intercept", 1),
    summarize(fwl_step2, "coupons_tilde", "FWL Step 2 (residualize both)", 1),
    summarize(full_model_2, "coupons", "Full OLS (+ income + day)", 2),
    summarize(fwl_multi, "coupons_tilde_2", "FWL (+ income + day)", 2),
    summarize(scaled_model, "coupons_tilde_scaled", "Scaled residuals", 1),
]


def r10(obj):
    """Round every float to 10 decimals so the JSON is byte-stable."""
    if isinstance(obj, float):
        return round(obj, 10)
    if isinstance(obj, dict):
        return {k: r10(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [r10(v) for v in obj]
    return obj


RESULTS = r10({
    "_comment": "Canonical numbers for python_fwl. Generated by script.py; do not edit by hand.",
    "seed": RANDOM_SEED,
    "n": N,
    "true_effect": 0.2,
    "dgp": {"income_mean": 50, "income_sd": 10, "coupons_intercept": 60,
            "coupons_on_income": -0.5, "coupons_noise_sd": 5,
            "sales_intercept": 10, "sales_on_coupons": 0.2,
            "sales_on_income": 0.3, "sales_on_dayofweek": 0.5,
            "sales_noise_sd": 3},
    "describe": {c: {s: float(v) for s, v in df[c].describe().items()}
                 for c in ["sales", "coupons", "income", "dayofweek"]},
    "models": MODELS,
    "full_income_coef": float(gamma_hat),
    "full_income_se": float(full_model.bse["income"]),
    "full_income_p": float(full_model.pvalues["income"]),
    "full2_income_coef": float(full_model_2.params["income"]),
    "full2_dayofweek_coef": float(full_model_2.params["dayofweek"]),
    "full2_dayofweek_p": float(full_model_2.pvalues["dayofweek"]),
    "ovb": {
        "gamma_hat": float(gamma_hat),
        "delta_hat_income_on_coupons": float(delta_hat),
        "product": float(ovb_hat),
        "naive_minus_full": float(naive_minus_full),
        "wrong_direction_coupons_on_income": float(wrong_dir),
        "wrong_direction_product": float(gamma_hat * wrong_dir),
        "population_delta": -1.0,
        "population_naive_plim": 0.2 + 0.3 * -1.0,
    },
    "se_ladder": {k: float(v) for k, v in se_ladder.items()},
    "se_ladder_share_closed_by_intercept_levels": float(share_intercept_levels),
    "se_ratio_step2_over_full": float(se_ladder["step2_residualize_both"]
                                      / se_ladder["full_model"]),
    "sqrt_47_over_49": float(np.sqrt(47 / 49)),
    "by_hand": {"cov": float(cov_sc), "var": float(var_c),
                "beta_cov_over_var": float(beta_cov),
                "beta_matrix": float(beta_matrix)},
    "correlations": {
        "coupons_tilde_income": float(np.corrcoef(c_tilde, df["income"])[0, 1]),
        "dayofweek_coupons": float(np.corrcoef(df["dayofweek"], df["coupons"])[0, 1]),
    },
    "extra": {
        "dayofweek_decomposition": {
            "_comment": ("OVB identity one control up: full coef (+ income) = "
                         "full2 coef (+ income + day) + gamma_dow * delta_dow_partial. "
                         "delta_dow_partial is the coupons coefficient in "
                         "dayofweek ~ coupons + income (partial, not raw, association). "
                         "shift = gamma_dow * delta_dow_partial = one-control minus "
                         "two-control coefficient, so the coefficient RISES by -shift "
                         "when dayofweek is added."),
            "coef_one_control": float(full_model.params["coupons"]),
            "coef_two_controls": float(full_model_2.params["coupons"]),
            "gamma_dow": float(gamma_dow),
            "delta_dow_partial": float(delta_dow),
            "partial_corr_dow_coupons_given_income": float(pcorr_dow_coupons),
            "shift": float(gamma_dow * delta_dow),
            "one_control_minus_two_controls": float(one_minus_two),
            "identity_holds": bool(abs(one_minus_two - gamma_dow * delta_dow) < 1e-12),
        },
        "robust_se_coupons": robust_se,
    },
    "versions": {"python": platform.python_version(), "numpy": np.__version__,
                 "pandas": pd.__version__, "statsmodels": statsmodels.__version__,
                 "matplotlib": matplotlib.__version__, "seaborn": sns.__version__},
})
with open(HERE / "fwl_results.json", "w") as f:
    json.dump(RESULTS, f, indent=2)
    f.write("\n")

# Web app payload: forest-plot rows (display precision), the OVB identity,
# the SE ladder, and the 50 stores so the app's animation and quiz use the
# post's own data. The app binds every number it prints to these fields.
WEB_ROWS = [m for m in MODELS if m["method"] != "Scaled residuals"]
SCALED = next(m for m in MODELS if m["method"] == "Scaled residuals")
WEB = {
    "_comment": "Generated by ../../script.py from the seed-42 store data; do not edit by hand.",
    "true_effect": 0.2,
    "n_obs": N,
    "estimates": [{
        "method": m["method"], "outcome": "Daily sales",
        "estimate": round(m["coef"], 4), "se": round(m["se"], 4),
        "ci_lo": round(m["ci_lo"], 3), "ci_hi": round(m["ci_hi"], 3),
        "p": round(m["p"], 3), "df_resid": m["df_resid"],
        "n_controls": m["n_controls"]} for m in WEB_ROWS],
    "scaled_residuals": {"estimate": round(SCALED["coef"], 4),
                         "se": round(SCALED["se"], 4)},
    "ovb": {"gamma_hat": round(float(gamma_hat), 4),
            "delta_hat": round(float(delta_hat), 4),
            "product": round(float(ovb_hat), 4),
            "naive_minus_full": round(float(naive_minus_full), 4),
            "wrong_direction_coupons_on_income": round(float(wrong_dir), 4),
            "wrong_direction_product": round(float(gamma_hat * wrong_dir), 4),
            "population_delta": -1.0,
            "population_naive_plim": round(0.2 + 0.3 * -1.0, 4)},
    "se_ladder": {k: round(float(v), 4) for k, v in se_ladder.items()},
    "se_ratio_step2_over_full": round(float(se_ladder["step2_residualize_both"]
                                            / se_ladder["full_model"]), 4),
    "sample": {c: [float(v) for v in df[c]] for c in
               ["sales", "coupons", "income", "dayofweek"]},
}
saved = ["data/fwl_store_data.csv", "fwl_results.json"]
if (HERE / "web_app" / "data").is_dir():  # absent in the Quarto zip bundle
    with open(HERE / "web_app" / "data" / "results.json", "w") as f:
        json.dump(WEB, f, indent=2)
        f.write("\n")
    saved.append("web_app/data/results.json")
print("\nSaved: " + ", ".join(saved))

# ── Predicted values for residual visualization ──────────────────────

df["coupons_hat"] = smf.ols("coupons ~ income", df).fit().predict()


# ── Auxiliary regressions for annotations ───────────────────────────
coupons_on_income = smf.ols("coupons ~ income", df).fit()


def annotate_eq(ax, model, xname="x", yname="y", loc="lower left",
                no_intercept=False):
    """Add equation and R² annotation to an axes."""
    if no_intercept:
        b = model.params.iloc[0]
        sign = "+" if b >= 0 else "−"
        eq = f"{yname} = {sign}{abs(b):.2f}{xname}"
    else:
        b0 = model.params["Intercept"]
        b1 = model.params.iloc[1]
        sign = "+" if b1 >= 0 else "−"
        eq = f"{yname} = {b0:.2f} {sign} {abs(b1):.2f}{xname}"
    r2 = model.rsquared
    txt = f"{eq}\n$R^2$ = {r2:.3f}"
    # Position mapping
    coords = {
        "lower left":  (0.05, 0.05, "left",  "bottom"),
        "lower right": (0.95, 0.05, "right", "bottom"),
        "upper left":  (0.05, 0.95, "left",  "top"),
        "upper right": (0.95, 0.95, "right", "top"),
    }
    x, y, ha, va = coords[loc]
    ax.text(x, y, txt, transform=ax.transAxes, fontsize=11,
            color=WARM_ORANGE, ha=ha, va=va, linespacing=1.5)


# ═══════════════════════════════════════════════════════════════════════
# FIGURES
# ═══════════════════════════════════════════════════════════════════════

# ── Figure 1: Naive regression ───────────────────────────────────────

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_linewidth(0)
ax.scatter(df["coupons"], df["sales"], color=STEEL_BLUE, alpha=0.75,
           edgecolors=DARK_NAVY, s=80, linewidths=0.8, zorder=3,
           label="Stores")
sns.regplot(x="coupons", y="sales", data=df, ci=None, scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5,
                      "label": "Linear fit", "zorder": 2},
            ax=ax)
ax.set_xlabel("Coupon usage (%)")
ax.set_ylabel("Daily sales (thousands $)")
ax.set_title("Naive relationship: Sales vs. coupon usage",
             fontsize=14, fontweight="bold", color=WHITE_TEXT, pad=12)
annotate_eq(ax, naive_model, xname="x", loc="lower left")
ax.legend(loc="upper right")
plt.tight_layout()
plt.savefig(HERE / "fwl_naive_regression.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close(fig)
print("Saved: fwl_naive_regression.png")

# ── Figure 2: Residuals visualization ────────────────────────────────

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_linewidth(0)
ax.vlines(df["income"],
          np.minimum(df["coupons"], df["coupons_hat"]),
          np.maximum(df["coupons"], df["coupons_hat"]),
          linestyle="--", color=LIGHT_TEXT, alpha=0.4, linewidth=0.9,
          label="Residuals", zorder=1)
ax.scatter(df["income"], df["coupons"], color=STEEL_BLUE, alpha=0.75,
           edgecolors=DARK_NAVY, s=80, linewidths=0.8, zorder=3,
           label="Stores")
sns.regplot(x="income", y="coupons", data=df, ci=None, scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5,
                      "label": "Linear fit", "zorder": 2},
            ax=ax)
ax.set_xlabel("Neighborhood income (thousands $)")
ax.set_ylabel("Coupon usage (%)")
ax.set_title("Partialling-out: removing income's effect on coupons",
             fontsize=14, fontweight="bold", color=WHITE_TEXT, pad=12)
annotate_eq(ax, coupons_on_income, xname="x", loc="lower left")
ax.legend(loc="upper right")
plt.tight_layout()
plt.savefig(HERE / "fwl_residuals_income.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close(fig)
print("Saved: fwl_residuals_income.png")

# ── Figure 3: Partialled-out relationship ────────────────────────────

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_linewidth(0)
ax.scatter(df["coupons_tilde"], df["sales_tilde"], color=STEEL_BLUE,
           alpha=0.75, edgecolors=DARK_NAVY, s=80, linewidths=0.8, zorder=3,
           label="Stores (residualized)")
sns.regplot(x="coupons_tilde", y="sales_tilde", data=df, ci=None,
            scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5,
                      "label": "Linear fit", "zorder": 2},
            ax=ax)
ax.set_xlabel("Residual coupon usage")
ax.set_ylabel("Residual sales")
ax.set_title("Conditional relationship after partialling-out income",
             fontsize=14, fontweight="bold", color=WHITE_TEXT, pad=12)
# Use model with intercept for proper R²
_resid_model = smf.ols("sales_tilde ~ coupons_tilde", df).fit()
annotate_eq(ax, _resid_model, xname="x", loc="lower right")
ax.legend(loc="upper left")
plt.tight_layout()
plt.savefig(HERE / "fwl_partialled_out.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close(fig)
print("Saved: fwl_partialled_out.png")

# ── Figure 4: Scaled residuals ───────────────────────────────────────

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_linewidth(0)
ax.scatter(df["coupons_tilde_scaled"], df["sales_tilde_scaled"],
           color=STEEL_BLUE, alpha=0.75, edgecolors=DARK_NAVY, s=80,
           linewidths=0.8, zorder=3,
           label="Stores (residualized + scaled)")
sns.regplot(x="coupons_tilde_scaled", y="sales_tilde_scaled", data=df,
            ci=None, scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5,
                      "label": "Linear fit", "zorder": 2},
            ax=ax)
ax.set_xlabel("Coupon usage (%, residualized + mean)")
ax.set_ylabel("Daily sales (thousands $, residualized + mean)")
ax.set_title("Scaled residuals: interpretable magnitudes",
             fontsize=14, fontweight="bold", color=WHITE_TEXT, pad=12)
annotate_eq(ax, scaled_model, xname="x", loc="lower right")
ax.legend(loc="upper left")
plt.tight_layout()
plt.savefig(HERE / "fwl_scaled_residuals.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close(fig)
print("Saved: fwl_scaled_residuals.png")

# ── Figure 5: Side-by-side comparison ────────────────────────────────

fig, axes = plt.subplots(1, 2, figsize=(14, 6))
fig.patch.set_linewidth(0)

# Left panel: naive
axes[0].scatter(df["coupons"], df["sales"], color=STEEL_BLUE, alpha=0.75,
                edgecolors=DARK_NAVY, s=80, linewidths=0.8, zorder=3)
sns.regplot(x="coupons", y="sales", data=df, ci=None, scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5, "zorder": 2},
            ax=axes[0])
axes[0].set_xlabel("Coupon usage (%)")
axes[0].set_ylabel("Daily sales (thousands $)")
axes[0].set_title("Naive (no controls)", fontsize=13, fontweight="bold",
                  color=WHITE_TEXT, pad=10)
annotate_eq(axes[0], naive_model, xname="x", loc="lower left")

# Right panel: partialled-out (scaled)
axes[1].scatter(df["coupons_tilde_scaled"], df["sales_tilde_scaled"],
                color=TEAL, alpha=0.75, edgecolors=DARK_NAVY, s=80,
                linewidths=0.8, zorder=3)
sns.regplot(x="coupons_tilde_scaled", y="sales_tilde_scaled", data=df,
            ci=None, scatter=False,
            line_kws={"color": WARM_ORANGE, "linewidth": 2.5, "zorder": 2},
            ax=axes[1])
axes[1].set_xlabel("Coupon usage (%, after partialling-out)")
axes[1].set_ylabel("Daily sales (thousands $, after partialling-out)")
axes[1].set_title("After partialling-out income (FWL)", fontsize=13,
                  fontweight="bold", color=WHITE_TEXT, pad=10)
annotate_eq(axes[1], scaled_model, xname="x", loc="lower right")

plt.suptitle("Simpson's paradox resolved: the FWL theorem reveals the conditional relationship",
             fontsize=14, fontweight="bold", color=WHITE_TEXT, y=1.02)
plt.tight_layout()
plt.savefig(HERE / "fwl_comparison.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close(fig)
print("Saved: fwl_comparison.png")

print("\n=== All figures generated successfully ===")
