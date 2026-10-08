"""
Double Machine Learning with 401(k) Pension Data

Estimates the causal effect of 401(k) eligibility and participation on net
total financial assets using three DoubleML models (PLR, IRM, IIVM) with
four ML learners (Lasso, Random Forest, Decision Trees, XGBoost). Uses the
1991 Survey of Income and Program Participation (SIPP) dataset with 9,915
household observations.

Usage:
    pip install doubleml xgboost
    python script.py

Output:
    - pension_*.png figures saved to current directory
    - *.csv tables with all results
    - Console output with summary statistics and results

References:
    - https://docs.doubleml.org/stable/examples/py_double_ml_pension.html
    - Chernozhukov et al. (2018). Double/Debiased Machine Learning.
    - Poterba, Venti, and Wise (1995). Do 401(k) contributions crowd out
      other personal saving?
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import doubleml as dml
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LassoCV, LogisticRegressionCV
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.pipeline import make_pipeline
from xgboost import XGBClassifier, XGBRegressor
from doubleml.datasets import fetch_401K
from matplotlib.patches import Patch
import glob
import warnings
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

# ── Configuration ─────────────────────────────────────────────────
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"
GRAY = "#999999"

# Method color scheme
COLOR_PLR = STEEL_BLUE
COLOR_IRM = WARM_ORANGE
COLOR_IIVM = TEAL
COLOR_NAIVE = GRAY

# Variables
OUTCOME = "net_tfa"
OUTCOME_LABEL = "Net Total Financial Assets ($)"
TREATMENT_ELIG = "e401"
TREATMENT_PART = "p401"
FEATURES_BASE = ["age", "inc", "educ", "fsize", "marr",
                 "twoearn", "db", "pira", "hown"]

# Regularization grid for LogisticRegressionCV (used in get_learners)
Cs = 0.0001 * np.logspace(0, 4, 10)


# ── 1. Data Loading ──────────────────────────────────────────────
print("=" * 60)
print("1. DATA LOADING")
print("=" * 60)

data = fetch_401K(return_type="DataFrame")
print(f"Dataset shape: {data.shape}")
print(f"\nVariable descriptions:")
print(f"  net_tfa  : Net total financial assets (outcome)")
print(f"  e401     : 401(k) eligibility (treatment / instrument)")
print(f"  p401     : 401(k) participation (endogenous treatment)")
print(f"  age      : Age of household head")
print(f"  inc      : Income")
print(f"  educ     : Education level")
print(f"  fsize    : Family size")
print(f"  marr     : Marital status")
print(f"  twoearn  : Two-earner household")
print(f"  db       : Defined benefit pension")
print(f"  pira     : IRA participation")
print(f"  hown     : Home ownership")

print(f"\nOutcome summary (net_tfa):")
print(data[OUTCOME].describe().round(2))

print(f"\nTreatment rates:")
print(f"  Eligible (e401=1): {data[TREATMENT_ELIG].sum()} / {len(data)} "
      f"({data[TREATMENT_ELIG].mean():.1%})")
print(f"  Participating (p401=1): {data[TREATMENT_PART].sum()} / {len(data)} "
      f"({data[TREATMENT_PART].mean():.1%})")

# Export raw data
data.to_csv("pension_raw.csv", index=False)
print("\nExported: pension_raw.csv")


# ── 2. Exploratory Data Analysis ─────────────────────────────────
print("\n" + "=" * 60)
print("2. EXPLORATORY DATA ANALYSIS")
print("=" * 60)

# --- Figure 1: Outcome distribution by eligibility status ---
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Left panel: histograms
for val, label, color in [(1, "Eligible (e401=1)", STEEL_BLUE),
                           (0, "Not eligible (e401=0)", WARM_ORANGE)]:
    subset = data[data[TREATMENT_ELIG] == val][OUTCOME]
    axes[0].hist(subset, bins=50, alpha=0.6, label=label, color=color,
                 edgecolor="white", linewidth=0.5)
axes[0].set_xlabel(OUTCOME_LABEL)
axes[0].set_ylabel("Frequency")
axes[0].set_title("Distribution of Net Financial Assets\nby 401(k) Eligibility")
axes[0].legend(frameon=False)
axes[0].set_xlim(-50000, 200000)

# Right panel: box plots
bp_data = [data[data[TREATMENT_ELIG] == 0][OUTCOME].values,
           data[data[TREATMENT_ELIG] == 1][OUTCOME].values]
bp = axes[1].boxplot(bp_data, tick_labels=["Not Eligible", "Eligible"],
                     patch_artist=True, widths=0.5,
                     medianprops=dict(color=NEAR_BLACK, linewidth=2))
bp["boxes"][0].set_facecolor(WARM_ORANGE)
bp["boxes"][0].set_alpha(0.6)
bp["boxes"][1].set_facecolor(STEEL_BLUE)
bp["boxes"][1].set_alpha(0.6)
axes[1].set_ylabel(OUTCOME_LABEL)
axes[1].set_title("Net Financial Assets\nby 401(k) Eligibility")
axes[1].set_ylim(-50000, 200000)

plt.tight_layout()
plt.savefig("pension_eda_outcome.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved: pension_eda_outcome.png")

# --- Figure 2: Income distribution by eligibility (confounding) ---
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Left: income histograms by eligibility
for val, label, color in [(1, "Eligible (e401=1)", STEEL_BLUE),
                           (0, "Not eligible (e401=0)", WARM_ORANGE)]:
    subset = data[data[TREATMENT_ELIG] == val]["inc"]
    axes[0].hist(subset, bins=50, alpha=0.6, label=label, color=color,
                 edgecolor="white", linewidth=0.5)
axes[0].set_xlabel("Income ($)")
axes[0].set_ylabel("Frequency")
axes[0].set_title("Income Distribution by 401(k) Eligibility\n(Key Confounder)")
axes[0].legend(frameon=False)

# Right: income vs net_tfa colored by eligibility
sample = data.sample(n=min(2000, len(data)), random_state=RANDOM_SEED)
for val, label, color in [(0, "Not eligible", WARM_ORANGE),
                           (1, "Eligible", STEEL_BLUE)]:
    subset = sample[sample[TREATMENT_ELIG] == val]
    axes[1].scatter(subset["inc"], subset[OUTCOME], alpha=0.3,
                    s=15, color=color, label=label)
axes[1].set_xlabel("Income ($)")
axes[1].set_ylabel(OUTCOME_LABEL)
axes[1].set_title("Income vs. Net Financial Assets\n(Confounding Visualized)")
axes[1].legend(frameon=False)
axes[1].set_ylim(-50000, 200000)

plt.tight_layout()
plt.savefig("pension_eda_confounding.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved: pension_eda_confounding.png")

# EDA summary stats
eda_summary = data.groupby(TREATMENT_ELIG).agg(
    n=("net_tfa", "size"),
    mean_net_tfa=("net_tfa", "mean"),
    median_net_tfa=("net_tfa", "median"),
    std_net_tfa=("net_tfa", "std"),
    mean_income=("inc", "mean"),
    mean_age=("age", "mean"),
    mean_educ=("educ", "mean"),
).round(2)
eda_summary.index = eda_summary.index.map({0: "Not Eligible", 1: "Eligible"})
eda_summary.index.name = "Eligibility"
print("\nSummary by eligibility status:")
print(eda_summary.to_string())
eda_summary.to_csv("eda_summary.csv")
print("Exported: eda_summary.csv")


# ── 3. Naive Baselines ──────────────────────────────────────────
print("\n" + "=" * 60)
print("3. NAIVE BASELINES (Difference-in-Means)")
print("=" * 60)

# Estimand note: These are naive comparisons, NOT causal estimates.
# They conflate the causal effect with confounding from income and
# other covariates that predict both 401(k) access and savings.

mean_elig = data[data[TREATMENT_ELIG] == 1][OUTCOME].mean()
mean_noelig = data[data[TREATMENT_ELIG] == 0][OUTCOME].mean()
naive_elig = mean_elig - mean_noelig

mean_part = data[data[TREATMENT_PART] == 1][OUTCOME].mean()
mean_nopart = data[data[TREATMENT_PART] == 0][OUTCOME].mean()
naive_part = mean_part - mean_nopart

print(f"Naive difference (eligibility): ${naive_elig:,.2f}")
print(f"  Eligible mean:     ${mean_elig:,.2f}")
print(f"  Not eligible mean: ${mean_noelig:,.2f}")
print(f"\nNaive difference (participation): ${naive_part:,.2f}")
print(f"  Participating mean:     ${mean_part:,.2f}")
print(f"  Not participating mean: ${mean_nopart:,.2f}")

naive_df = pd.DataFrame({
    "Comparison": ["Eligibility (e401)", "Participation (p401)"],
    "Treated_Mean": [mean_elig, mean_part],
    "Control_Mean": [mean_noelig, mean_nopart],
    "Naive_Difference": [naive_elig, naive_part],
})
naive_df.to_csv("naive_estimates.csv", index=False)
print("\nExported: naive_estimates.csv")


# ── 4. Data Preparation for DoubleML ─────────────────────────────
print("\n" + "=" * 60)
print("4. DATA PREPARATION FOR DoubleML")
print("=" * 60)

# --- Base specification: 9 raw features ---
data_dml_base = dml.DoubleMLData(data,
                                 y_col=OUTCOME,
                                 d_cols=TREATMENT_ELIG,
                                 x_cols=FEATURES_BASE)
print(f"Base specification: {len(FEATURES_BASE)} features")
print(f"  Features: {FEATURES_BASE}")

# --- Flexible specification: polynomial features ---
features_flex = data.copy()[["marr", "twoearn", "db", "pira", "hown"]]
poly_dict = {"age": 2, "inc": 2, "educ": 2, "fsize": 2}
for key, degree in poly_dict.items():
    poly = PolynomialFeatures(degree, include_bias=False)
    data_transf = poly.fit_transform(data[[key]])
    x_cols = poly.get_feature_names_out([key])
    data_transf = pd.DataFrame(data_transf, columns=x_cols)
    features_flex = pd.concat((features_flex, data_transf),
                              axis=1, sort=False)

model_data_elig = pd.concat(
    (data.copy()[[OUTCOME, TREATMENT_ELIG]], features_flex.copy()),
    axis=1, sort=False
)
data_dml_flex = dml.DoubleMLData(model_data_elig,
                                 y_col=OUTCOME,
                                 d_cols=TREATMENT_ELIG)
print(f"\nFlexible specification: {features_flex.shape[1]} features")
print(f"  Includes quadratic terms for: {list(poly_dict.keys())}")

# --- IV data (for IIVM): p401 as treatment, e401 as instrument ---
data_dml_base_iv = dml.DoubleMLData(data,
                                    y_col=OUTCOME,
                                    d_cols=TREATMENT_PART,
                                    z_cols=TREATMENT_ELIG,
                                    x_cols=FEATURES_BASE)

model_data_iv = pd.concat(
    (data.copy()[[OUTCOME, TREATMENT_ELIG, TREATMENT_PART]],
     features_flex.copy()),
    axis=1, sort=False
)
data_dml_iv_flex = dml.DoubleMLData(model_data_iv,
                                    y_col=OUTCOME,
                                    d_cols=TREATMENT_PART,
                                    z_cols=TREATMENT_ELIG)
print(f"\nIV specification: treatment=p401, instrument=e401")


# ── Helper: ML learner definitions ───────────────────────────────

def get_learners():
    """Return dictionaries of regression and classification learners."""
    regressors = {
        "Lasso": make_pipeline(StandardScaler(),
                               LassoCV(cv=5, max_iter=10000)),
        "Random Forest": RandomForestRegressor(
            n_estimators=500, max_depth=7, max_features=3,
            min_samples_leaf=3, random_state=RANDOM_SEED),
        "Decision Tree": DecisionTreeRegressor(
            max_depth=30, ccp_alpha=0.0047,
            min_samples_split=203, min_samples_leaf=67,
            random_state=RANDOM_SEED),
        "XGBoost": XGBRegressor(
            n_jobs=1, objective="reg:squarederror",
            eta=0.1, n_estimators=35, random_state=RANDOM_SEED),
    }
    classifiers = {
        "Lasso": make_pipeline(StandardScaler(),
                               LogisticRegressionCV(
                                   cv=5, penalty="l1", solver="liblinear",
                                   Cs=Cs, max_iter=1000)),
        "Random Forest": RandomForestClassifier(
            n_estimators=500, max_depth=5, max_features=4,
            min_samples_leaf=7, random_state=RANDOM_SEED),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=30, ccp_alpha=0.0042,
            min_samples_split=104, min_samples_leaf=34,
            random_state=RANDOM_SEED),
        "XGBoost": XGBClassifier(
            n_jobs=1, objective="binary:logistic",
            eval_metric="logloss",
            eta=0.1, n_estimators=34, random_state=RANDOM_SEED),
    }
    return regressors, classifiers


# ── 5. PLR Models ────────────────────────────────────────────────
print("\n" + "=" * 60)
print("5. PARTIALLY LINEAR REGRESSION (PLR)")
print("=" * 60)
print("\nEstimand: Average Treatment Effect (ATE) of 401(k) eligibility")
print("Treatment: e401 (eligibility)")
print("PLR assumes: Y = theta * D + g(X) + epsilon")
print("where g(X) is estimated flexibly by ML, theta is the constant ATE.\n")

plr_results = []
regressors, classifiers = get_learners()

for name in regressors:
    np.random.seed(RANDOM_SEED)
    # Use base data for RF, Tree, XGBoost; flex data for Lasso
    dml_data = data_dml_flex if name == "Lasso" else data_dml_base

    model = dml.DoubleMLPLR(dml_data,
                            ml_l=regressors[name],
                            ml_m=classifiers[name],
                            n_folds=3)
    model.fit(store_predictions=True)

    coef = model.coef[0]
    se = model.se[0]
    ci = model.confint(level=0.95).values[0]

    plr_results.append({
        "Model": "PLR",
        "Learner": name,
        "Coefficient": round(coef, 2),
        "Std_Error": round(se, 2),
        "CI_Lower": round(ci[0], 2),
        "CI_Upper": round(ci[1], 2),
        "Estimand": "ATE",
    })
    print(f"PLR-{name}: coef={coef:,.2f}, SE={se:,.2f}, "
          f"95% CI=[{ci[0]:,.2f}, {ci[1]:,.2f}]")

plr_df = pd.DataFrame(plr_results)
plr_df.to_csv("plr_results.csv", index=False)
print("\nExported: plr_results.csv")


# ── 6. IRM Models ────────────────────────────────────────────────
print("\n" + "=" * 60)
print("6. INTERACTIVE REGRESSION MODEL (IRM)")
print("=" * 60)
print("\nEstimand: Average Treatment Effect (ATE) of 401(k) eligibility")
print("Treatment: e401 (eligibility)")
print("IRM allows fully heterogeneous effects via propensity scores.")
print("Uses trimming_threshold=0.01 to handle extreme propensity scores.\n")

irm_results = []
regressors, classifiers = get_learners()

# IRM-specific nuisance parameter tuning (from DoubleML docs)
irm_nuisance_params = {
    "Random Forest": {
        "ml_g0": {"max_depth": 6, "max_features": 4, "min_samples_leaf": 7},
        "ml_g1": {"max_depth": 6, "max_features": 3, "min_samples_leaf": 5},
        "ml_m": {"max_depth": 6, "max_features": 3, "min_samples_leaf": 6},
    },
    "Decision Tree": {
        "ml_g0": {"ccp_alpha": 0.0016, "min_samples_split": 74,
                  "min_samples_leaf": 24},
        "ml_g1": {"ccp_alpha": 0.0018, "min_samples_split": 70,
                  "min_samples_leaf": 23},
        "ml_m": {"ccp_alpha": 0.0028, "min_samples_split": 167,
                 "min_samples_leaf": 55},
    },
    "XGBoost": {
        "ml_g0": {"eta": 0.1, "n_estimators": 8},
        "ml_g1": {"eta": 0.1, "n_estimators": 29},
        "ml_m": {"eta": 0.1, "n_estimators": 23},
    },
}

for name in regressors:
    np.random.seed(RANDOM_SEED)
    # Lasso uses flex data with LassoCV for ml_g (regressor, not classifier)
    if name == "Lasso":
        lasso_reg = make_pipeline(StandardScaler(),
                                  LassoCV(cv=5, max_iter=20000))
        model = dml.DoubleMLIRM(data_dml_flex,
                                ml_g=lasso_reg,
                                ml_m=classifiers[name],
                                trimming_threshold=0.01,
                                n_folds=3)
    else:
        model = dml.DoubleMLIRM(data_dml_base,
                                ml_g=regressors[name],
                                ml_m=classifiers[name],
                                trimming_threshold=0.01,
                                n_folds=3)
        # Apply tuned nuisance parameters
        if name in irm_nuisance_params:
            for nuisance, params in irm_nuisance_params[name].items():
                model.set_ml_nuisance_params(nuisance, TREATMENT_ELIG, params)

    model.fit(store_predictions=True)

    coef = model.coef[0]
    se = model.se[0]
    ci = model.confint(level=0.95).values[0]

    irm_results.append({
        "Model": "IRM",
        "Learner": name,
        "Coefficient": round(coef, 2),
        "Std_Error": round(se, 2),
        "CI_Lower": round(ci[0], 2),
        "CI_Upper": round(ci[1], 2),
        "Estimand": "ATE",
    })
    print(f"IRM-{name}: coef={coef:,.2f}, SE={se:,.2f}, "
          f"95% CI=[{ci[0]:,.2f}, {ci[1]:,.2f}]")

irm_df = pd.DataFrame(irm_results)
irm_df.to_csv("irm_results.csv", index=False)
print("\nExported: irm_results.csv")


# ── 7. IIVM Models ──────────────────────────────────────────────
print("\n" + "=" * 60)
print("7. INTERACTIVE IV MODEL (IIVM)")
print("=" * 60)
print("\nEstimand: Local Average Treatment Effect (LATE) of 401(k) participation")
print("Treatment: p401 (participation) — endogenous")
print("Instrument: e401 (eligibility) — conditionally exogenous")
print("LATE applies to 'compliers': households who participate because eligible.\n")

iivm_results = []
regressors, classifiers = get_learners()

# IIVM-specific nuisance parameter tuning (from DoubleML docs)
iivm_nuisance_params = {
    "Random Forest": {
        "ml_g0": {"max_depth": 6, "max_features": 4, "min_samples_leaf": 7},
        "ml_g1": {"max_depth": 6, "max_features": 3, "min_samples_leaf": 5},
        "ml_m": {"max_depth": 6, "max_features": 3, "min_samples_leaf": 6},
        "ml_r1": {"max_depth": 4, "max_features": 7, "min_samples_leaf": 6},
    },
    "Decision Tree": {
        "ml_g0": {"ccp_alpha": 0.0016, "min_samples_split": 74,
                  "min_samples_leaf": 24},
        "ml_g1": {"ccp_alpha": 0.0018, "min_samples_split": 70,
                  "min_samples_leaf": 23},
        "ml_m": {"ccp_alpha": 0.0028, "min_samples_split": 167,
                 "min_samples_leaf": 55},
        "ml_r1": {"ccp_alpha": 0.0576, "min_samples_split": 55,
                  "min_samples_leaf": 18},
    },
    "XGBoost": {
        "ml_g0": {"eta": 0.1, "n_estimators": 9},
        "ml_g1": {"eta": 0.1, "n_estimators": 33},
        "ml_m": {"eta": 0.1, "n_estimators": 12},
        "ml_r1": {"eta": 0.1, "n_estimators": 25},
    },
}

for name in regressors:
    np.random.seed(RANDOM_SEED)
    if name == "Lasso":
        lasso_reg = make_pipeline(StandardScaler(),
                                  LassoCV(cv=5, max_iter=20000))
        model = dml.DoubleMLIIVM(data_dml_iv_flex,
                                 ml_g=lasso_reg,
                                 ml_m=classifiers[name],
                                 ml_r=classifiers[name],
                                 subgroups={"always_takers": False,
                                            "never_takers": True},
                                 trimming_threshold=0.01,
                                 n_folds=3)
    else:
        model = dml.DoubleMLIIVM(data_dml_base_iv,
                                 ml_g=regressors[name],
                                 ml_m=classifiers[name],
                                 ml_r=classifiers[name],
                                 subgroups={"always_takers": False,
                                            "never_takers": True},
                                 trimming_threshold=0.01,
                                 n_folds=3)
        if name in iivm_nuisance_params:
            for nuisance, params in iivm_nuisance_params[name].items():
                model.set_ml_nuisance_params(nuisance, TREATMENT_PART, params)

    model.fit(store_predictions=True)

    coef = model.coef[0]
    se = model.se[0]
    ci = model.confint(level=0.95).values[0]

    iivm_results.append({
        "Model": "IIVM",
        "Learner": name,
        "Coefficient": round(coef, 2),
        "Std_Error": round(se, 2),
        "CI_Lower": round(ci[0], 2),
        "CI_Upper": round(ci[1], 2),
        "Estimand": "LATE",
    })
    print(f"IIVM-{name}: coef={coef:,.2f}, SE={se:,.2f}, "
          f"95% CI=[{ci[0]:,.2f}, {ci[1]:,.2f}]")

iivm_df = pd.DataFrame(iivm_results)
iivm_df.to_csv("iivm_results.csv", index=False)
print("\nExported: iivm_results.csv")


# ── 8. Grand Comparison ─────────────────────────────────────────
print("\n" + "=" * 60)
print("8. GRAND COMPARISON")
print("=" * 60)

all_results = pd.concat([plr_df, irm_df, iivm_df], ignore_index=True)
all_results.to_csv("all_results.csv", index=False)
print("\nAll DML results:")
print(all_results.to_string(index=False))
print("\nExported: all_results.csv")

# --- Figure 3: PLR comparison across learners ---
fig, ax = plt.subplots(figsize=(8, 5))
y_pos = range(len(plr_df))
ax.barh(y_pos, plr_df["Coefficient"], xerr=[
    plr_df["Coefficient"] - plr_df["CI_Lower"],
    plr_df["CI_Upper"] - plr_df["Coefficient"]],
    color=COLOR_PLR, alpha=0.7, edgecolor="white", capsize=4)
ax.axvline(x=naive_elig, color=COLOR_NAIVE, linestyle="--", linewidth=1.5,
           label=f"Naive difference (${naive_elig:,.0f})")
ax.set_yticks(y_pos)
ax.set_yticklabels(plr_df["Learner"])
ax.set_xlabel("Estimated Effect on Net Financial Assets ($)")
ax.set_title("PLR Estimates: Effect of 401(k) Eligibility (ATE)\nAcross ML Learners")
ax.legend(frameon=False, loc="lower right")
plt.tight_layout()
plt.savefig("pension_plr_comparison.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved: pension_plr_comparison.png")

# --- Figure 4: IRM comparison across learners ---
fig, ax = plt.subplots(figsize=(8, 5))
y_pos = range(len(irm_df))
ax.barh(y_pos, irm_df["Coefficient"], xerr=[
    irm_df["Coefficient"] - irm_df["CI_Lower"],
    irm_df["CI_Upper"] - irm_df["Coefficient"]],
    color=COLOR_IRM, alpha=0.7, edgecolor="white", capsize=4)
ax.axvline(x=naive_elig, color=COLOR_NAIVE, linestyle="--", linewidth=1.5,
           label=f"Naive difference (${naive_elig:,.0f})")
ax.set_yticks(y_pos)
ax.set_yticklabels(irm_df["Learner"])
ax.set_xlabel("Estimated Effect on Net Financial Assets ($)")
ax.set_title("IRM Estimates: Effect of 401(k) Eligibility (ATE)\nAcross ML Learners")
ax.legend(frameon=False, loc="lower right")
plt.tight_layout()
plt.savefig("pension_irm_comparison.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved: pension_irm_comparison.png")

# --- Figure 5: IIVM comparison across learners ---
fig, ax = plt.subplots(figsize=(8, 5))
y_pos = range(len(iivm_df))
ax.barh(y_pos, iivm_df["Coefficient"], xerr=[
    iivm_df["Coefficient"] - iivm_df["CI_Lower"],
    iivm_df["CI_Upper"] - iivm_df["Coefficient"]],
    color=COLOR_IIVM, alpha=0.7, edgecolor="white", capsize=4)
ax.axvline(x=naive_part, color=COLOR_NAIVE, linestyle="--", linewidth=1.5,
           label=f"Naive difference (${naive_part:,.0f})")
ax.set_yticks(y_pos)
ax.set_yticklabels(iivm_df["Learner"])
ax.set_xlabel("Estimated Effect on Net Financial Assets ($)")
ax.set_title("IIVM Estimates: Effect of 401(k) Participation (LATE)\nAcross ML Learners")
ax.legend(frameon=False, loc="lower right")
plt.tight_layout()
plt.savefig("pension_iivm_comparison.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved: pension_iivm_comparison.png")

# --- Figure 6: Grand comparison (all models + naive) ---
fig, ax = plt.subplots(figsize=(10, 7))

# Combine all results with naive benchmarks
labels = []
coefficients = []
errors_lower = []
errors_upper = []
colors = []

# Add naive benchmarks
labels.append("Naive (eligibility)")
coefficients.append(naive_elig)
errors_lower.append(0)
errors_upper.append(0)
colors.append(COLOR_NAIVE)

labels.append("Naive (participation)")
coefficients.append(naive_part)
errors_lower.append(0)
errors_upper.append(0)
colors.append(COLOR_NAIVE)

# Add a spacer
labels.append("")
coefficients.append(0)
errors_lower.append(0)
errors_upper.append(0)
colors.append("white")

# Add PLR results
for _, row in plr_df.iterrows():
    labels.append(f"PLR - {row['Learner']}")
    coefficients.append(row["Coefficient"])
    errors_lower.append(row["Coefficient"] - row["CI_Lower"])
    errors_upper.append(row["CI_Upper"] - row["Coefficient"])
    colors.append(COLOR_PLR)

labels.append("")
coefficients.append(0)
errors_lower.append(0)
errors_upper.append(0)
colors.append("white")

# Add IRM results
for _, row in irm_df.iterrows():
    labels.append(f"IRM - {row['Learner']}")
    coefficients.append(row["Coefficient"])
    errors_lower.append(row["Coefficient"] - row["CI_Lower"])
    errors_upper.append(row["CI_Upper"] - row["Coefficient"])
    colors.append(COLOR_IRM)

labels.append("")
coefficients.append(0)
errors_lower.append(0)
errors_upper.append(0)
colors.append("white")

# Add IIVM results
for _, row in iivm_df.iterrows():
    labels.append(f"IIVM - {row['Learner']}")
    coefficients.append(row["Coefficient"])
    errors_lower.append(row["Coefficient"] - row["CI_Lower"])
    errors_upper.append(row["CI_Upper"] - row["Coefficient"])
    colors.append(COLOR_IIVM)

y_pos = range(len(labels))
ax.barh(y_pos, coefficients,
        xerr=[errors_lower, errors_upper],
        color=colors, alpha=0.7, edgecolor="white", capsize=3)

ax.set_yticks(y_pos)
ax.set_yticklabels(labels)
ax.set_xlabel("Estimated Effect on Net Financial Assets ($)")
ax.set_title("Double Machine Learning: 401(k) Pension Study\n"
             "Comparing PLR (ATE), IRM (ATE), and IIVM (LATE)")
ax.axvline(x=0, color=NEAR_BLACK, linewidth=0.5)

# Add legend manually
legend_elements = [
    Patch(facecolor=COLOR_NAIVE, alpha=0.7, label="Naive (no confounding control)"),
    Patch(facecolor=COLOR_PLR, alpha=0.7, label="PLR (ATE)"),
    Patch(facecolor=COLOR_IRM, alpha=0.7, label="IRM (ATE)"),
    Patch(facecolor=COLOR_IIVM, alpha=0.7, label="IIVM (LATE)"),
]
ax.legend(handles=legend_elements, frameon=False, loc="upper right")

plt.tight_layout()
plt.savefig("pension_grand_comparison.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved: pension_grand_comparison.png")


# ── 9. Summary ──────────────────────────────────────────────────
print("\n" + "=" * 60)
print("9. SUMMARY")
print("=" * 60)

print(f"\n{'='*60}")
print("KEY FINDINGS")
print(f"{'='*60}")
print(f"\nNaive difference-in-means:")
print(f"  Eligibility: ${naive_elig:,.2f}")
print(f"  Participation: ${naive_part:,.2f}")
print(f"\nPLR (ATE of eligibility, 4 learners):")
print(f"  Range: ${plr_df['Coefficient'].min():,.2f} to ${plr_df['Coefficient'].max():,.2f}")
print(f"  Mean:  ${plr_df['Coefficient'].mean():,.2f}")
print(f"\nIRM (ATE of eligibility, 4 learners):")
print(f"  Range: ${irm_df['Coefficient'].min():,.2f} to ${irm_df['Coefficient'].max():,.2f}")
print(f"  Mean:  ${irm_df['Coefficient'].mean():,.2f}")
print(f"\nIIVM (LATE of participation, 4 learners):")
print(f"  Range: ${iivm_df['Coefficient'].min():,.2f} to ${iivm_df['Coefficient'].max():,.2f}")
print(f"  Mean:  ${iivm_df['Coefficient'].mean():,.2f}")
print(f"\nConfounding bias (naive - mean PLR ATE):")
print(f"  ${naive_elig - plr_df['Coefficient'].mean():,.2f} "
      f"(naive overstates by {(naive_elig / plr_df['Coefficient'].mean() - 1) * 100:.0f}%)")

print(f"\nGenerated PNG files:")
for f in sorted(glob.glob("pension_*.png")):
    print(f"  {f}")
print(f"\nGenerated CSV files:")
for f in sorted(glob.glob("*.csv")):
    print(f"  {f}")

print("\n=== Script completed successfully ===")
