"""
Introduction to Causal Inference: Double Machine Learning

Estimates the causal effect of a cash bonus on unemployment duration
using Double Machine Learning (DML) with the Pennsylvania Bonus Experiment.
Compares naive OLS, covariate-adjusted OLS, and DML with Random Forest
and Lasso learners.

Usage:
    pip install doubleml
    python script.py

References:
    - https://docs.doubleml.org/stable/intro/intro.html
    - Chernozhukov et al. (2018). Double/Debiased Machine Learning.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.base import clone
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LassoCV, LinearRegression
from doubleml import DoubleMLData, DoubleMLPLR
from doubleml.datasets import fetch_bonus

# --- Configuration ---
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

OUTCOME = "inuidur1"
OUTCOME_LABEL = "Log Unemployment Duration"
TREATMENT = "tg"
COVARIATES = [
    "female", "black", "othrace", "dep1", "dep2",
    "q2", "q3", "q4", "q5", "q6",
    "agelt35", "agegt54", "durable", "lusd", "husd",
]

# Site color palette
COLOR_PRIMARY = "#6a9bcc"
COLOR_ACCENT = "#d97757"
COLOR_DARK = "#141413"

# --- Data Loading ---
df = fetch_bonus("DataFrame")
print(f"Dataset shape: {df.shape}")
print(f"Treatment groups:\n{df[TREATMENT].value_counts().rename({0: 'Control', 1: 'Bonus'})}")
print(f"\nOutcome summary:\n{df[OUTCOME].describe().round(3)}")

# --- EDA: Outcome Distribution ---
fig, ax = plt.subplots(figsize=(8, 5))
for group, label, color in [(0, "Control", COLOR_PRIMARY), (1, "Bonus", COLOR_ACCENT)]:
    subset = df[df[TREATMENT] == group][OUTCOME]
    ax.hist(subset, bins=30, alpha=0.6, label=f"{label} (mean={subset.mean():.3f})",
            color=color, edgecolor="white")
ax.set_xlabel(OUTCOME_LABEL)
ax.set_ylabel("Count")
ax.set_title(f"Distribution of {OUTCOME_LABEL} by Treatment Group")
ax.legend()
plt.savefig("doubleml_outcome_by_treatment.png", dpi=300, bbox_inches="tight")
plt.show()

# --- EDA: Covariate Balance ---
covariate_means = df.groupby(TREATMENT)[COVARIATES].mean()
fig, ax = plt.subplots(figsize=(12, 6))
x = np.arange(len(COVARIATES))
width = 0.35
ax.bar(x - width / 2, covariate_means.loc[0], width, label="Control",
       color=COLOR_PRIMARY, edgecolor="white")
ax.bar(x + width / 2, covariate_means.loc[1], width, label="Bonus",
       color=COLOR_ACCENT, edgecolor="white")
ax.set_xticks(x)
ax.set_xticklabels(COVARIATES, rotation=45, ha="right")
ax.set_ylabel("Mean Value")
ax.set_title("Covariate Balance: Control vs Bonus Group")
ax.legend()
plt.savefig("doubleml_covariate_balance.png", dpi=300, bbox_inches="tight")
plt.show()

# --- Naive OLS Baseline ---
ols = LinearRegression()
ols.fit(df[[TREATMENT]], df[OUTCOME])
naive_coef = ols.coef_[0]

ols_full = LinearRegression()
ols_full.fit(df[[TREATMENT] + COVARIATES], df[OUTCOME])
ols_full_coef = ols_full.coef_[0]

print(f"\nNaive OLS coefficient (no covariates): {naive_coef:.4f}")
print(f"OLS with covariates coefficient:       {ols_full_coef:.4f}")

# --- DoubleML with Random Forest ---
dml_data = DoubleMLData(df, y_col=OUTCOME, d_cols=TREATMENT, x_cols=COVARIATES)

learner = RandomForestRegressor(n_estimators=500, max_features="sqrt",
                                max_depth=5, random_state=RANDOM_SEED)
ml_l_rf = clone(learner)
ml_m_rf = clone(learner)

np.random.seed(RANDOM_SEED)
dml_plr_rf = DoubleMLPLR(dml_data, ml_l_rf, ml_m_rf, n_folds=5)
dml_plr_rf.fit()

rf_coef = dml_plr_rf.coef[0]
rf_se = dml_plr_rf.se[0]
rf_pval = dml_plr_rf.pval[0]
rf_ci = dml_plr_rf.confint().values[0]

print(f"\nDoubleML (Random Forest):")
print(f"  Coefficient: {rf_coef:.4f}, SE: {rf_se:.4f}, p-value: {rf_pval:.4f}")
print(f"  95% CI: [{rf_ci[0]:.4f}, {rf_ci[1]:.4f}]")

# --- DoubleML with Lasso ---
np.random.seed(RANDOM_SEED)
dml_plr_lasso = DoubleMLPLR(dml_data, LassoCV(), LassoCV(), n_folds=5)
dml_plr_lasso.fit()

lasso_coef = dml_plr_lasso.coef[0]
lasso_se = dml_plr_lasso.se[0]
lasso_pval = dml_plr_lasso.pval[0]
lasso_ci = dml_plr_lasso.confint().values[0]

print(f"\nDoubleML (Lasso):")
print(f"  Coefficient: {lasso_coef:.4f}, SE: {lasso_se:.4f}, p-value: {lasso_pval:.4f}")
print(f"  95% CI: [{lasso_ci[0]:.4f}, {lasso_ci[1]:.4f}]")

# --- Coefficient Comparison Plot ---
fig, ax = plt.subplots(figsize=(8, 5))
methods = ["Naive OLS", "OLS + Covariates", "DoubleML (RF)", "DoubleML (Lasso)"]
coefs = [naive_coef, ols_full_coef, rf_coef, lasso_coef]
colors = ["#999999", "#666666", COLOR_PRIMARY, COLOR_ACCENT]

ax.barh(methods, coefs, color=colors, edgecolor="white", height=0.6)
ax.errorbar(rf_coef, 2, xerr=[[rf_coef - rf_ci[0]], [rf_ci[1] - rf_coef]],
            fmt="none", color=COLOR_DARK, capsize=5, linewidth=2)
ax.errorbar(lasso_coef, 3, xerr=[[lasso_coef - lasso_ci[0]], [lasso_ci[1] - lasso_coef]],
            fmt="none", color=COLOR_DARK, capsize=5, linewidth=2)
ax.axvline(0, color="black", linewidth=0.5, linestyle="--")
ax.set_xlabel("Estimated Coefficient (Effect on Log Unemployment Duration)")
ax.set_title("Naive OLS vs Double Machine Learning Estimates")
plt.savefig("doubleml_coefficient_comparison.png", dpi=300, bbox_inches="tight")
plt.show()

# --- Confidence Intervals Plot ---
fig, ax = plt.subplots(figsize=(8, 4))
labels = ["DoubleML (Random Forest)", "DoubleML (Lasso)"]
point_estimates = [rf_coef, lasso_coef]
ci_low = [rf_ci[0], lasso_ci[0]]
ci_high = [rf_ci[1], lasso_ci[1]]
ci_colors = [COLOR_PRIMARY, COLOR_ACCENT]

for i, (est, lo, hi) in enumerate(zip(point_estimates, ci_low, ci_high)):
    ax.plot([lo, hi], [i, i], color=ci_colors[i], linewidth=3)
    ax.plot(est, i, "o", color=COLOR_DARK, markersize=8, zorder=5)
    ax.text(hi + 0.005, i, f"{est:.4f} [{lo:.4f}, {hi:.4f}]", va="center", fontsize=9)

ax.axvline(0, color="black", linewidth=0.5, linestyle="--")
ax.set_yticks([0, 1])
ax.set_yticklabels(labels)
ax.set_xlabel("Treatment Effect Estimate (95% CI)")
ax.set_title("Confidence Intervals: DoubleML Estimates")
plt.savefig("doubleml_confint.png", dpi=300, bbox_inches="tight")
plt.show()

# --- Summary Table ---
results = pd.DataFrame({
    "Method": methods,
    "Coefficient": [f"{c:.4f}" for c in coefs],
    "Std Error": ["--", "--", f"{rf_se:.4f}", f"{lasso_se:.4f}"],
    "p-value": ["--", "--", f"{rf_pval:.4f}", f"{lasso_pval:.4f}"],
    "95% CI": ["--", "--",
               f"[{rf_ci[0]:.4f}, {rf_ci[1]:.4f}]",
               f"[{lasso_ci[0]:.4f}, {lasso_ci[1]:.4f}]"],
})
print(f"\n{results.to_string(index=False)}")
