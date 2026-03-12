"""
Introduction to Causal Inference: DoWhy and the Lalonde Dataset

Estimate the causal effect of a job training program (NSW) on earnings
using DoWhy's four-step framework: Model, Identify, Estimate, Refute.

Usage:
    python script.py

References:
    - https://www.pywhy.org/dowhy/
    - LaLonde, R. (1986). Evaluating the Econometric Evaluations of
      Training Programs. American Economic Review, 76(4), 604-620.
"""

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression, LinearRegression as SklearnLR
from dowhy import CausalModel
from dowhy.datasets import lalonde_dataset

# Reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Configuration
OUTCOME = "re78"
OUTCOME_LABEL = "Earnings in 1978 (USD)"
TREATMENT = "treat"
TREATMENT_LABEL = "Job Training (treat)"
COVARIATES = ["age", "educ", "black", "hisp", "married", "nodegr", "re74", "re75"]

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# ── Data Loading ──────────────────────────────────────────────────────

df = lalonde_dataset()

# Convert boolean treat to int for DoWhy compatibility
df[TREATMENT] = df[TREATMENT].astype(int)

# Export for Stata/R cross-validation
df[["treat", "re78", "age", "educ", "black", "hisp", "married", "nodegr", "re74", "re75"]].to_csv("lalonde_dowhy.csv", index=False)
print("Saved: lalonde_dowhy.csv")

print(f"Dataset shape: {df.shape}")
print(f"\nTreatment groups:")
print(df[TREATMENT].value_counts().sort_index().rename({0: "Control", 1: "Training"}))
print(f"\nOutcome ({OUTCOME}) summary:")
print(df[OUTCOME].describe().round(2))
print(f"\nCovariate summary:")
print(df[COVARIATES].describe().round(2))

# ── EDA: Outcome by Treatment ────────────────────────────────────────

fig, ax = plt.subplots(figsize=(8, 5))
for group, label, color in [(0, "Control", STEEL_BLUE), (1, "Training", WARM_ORANGE)]:
    subset = df[df[TREATMENT] == group][OUTCOME]
    ax.hist(subset, bins=30, alpha=0.6, label=f"{label} (mean=${subset.mean():,.0f})",
            color=color, edgecolor="white")
ax.set_xlabel(OUTCOME_LABEL)
ax.set_ylabel("Count")
ax.set_title(f"Distribution of {OUTCOME_LABEL} by Treatment Group")
ax.legend()
plt.savefig("dowhy_outcome_by_treatment.png", dpi=300, bbox_inches="tight")
plt.close()
print("\nSaved: dowhy_outcome_by_treatment.png")

# ── EDA: Covariate Balance ───────────────────────────────────────────

covariate_means = df.groupby(TREATMENT)[COVARIATES].mean()

fig, ax = plt.subplots(figsize=(12, 6))
x = np.arange(len(COVARIATES))
width = 0.35
ax.bar(x - width / 2, covariate_means.loc[0], width, label="Control",
       color=STEEL_BLUE, edgecolor="white")
ax.bar(x + width / 2, covariate_means.loc[1], width, label="Training",
       color=WARM_ORANGE, edgecolor="white")
ax.set_xticks(x)
ax.set_xticklabels(COVARIATES, rotation=45, ha="right")
ax.set_ylabel("Mean Value")
ax.set_title("Covariate Balance: Control vs Training Group")
ax.legend()
plt.savefig("dowhy_covariate_balance.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: dowhy_covariate_balance.png")

# ── Naive ATE ─────────────────────────────────────────────────────────

mean_treated = df[df[TREATMENT] == 1][OUTCOME].mean()
mean_control = df[df[TREATMENT] == 0][OUTCOME].mean()
naive_ate = mean_treated - mean_control

print(f"\nMean earnings (Training): ${mean_treated:,.2f}")
print(f"Mean earnings (Control):  ${mean_control:,.2f}")
print(f"Naive ATE (difference):   ${naive_ate:,.2f}")

# ── Causal Graph Visualization ────────────────────────────────────────

fig, ax = plt.subplots(figsize=(10, 7))
confounders = COVARIATES
n_conf = len(confounders)

# Position nodes
treatment_pos = (0.2, 0.5)
outcome_pos = (0.8, 0.5)
conf_positions = []
for i, c in enumerate(confounders):
    y = 0.9 - (i / (n_conf - 1)) * 0.8
    conf_positions.append((0.5, y))

# Draw edges from confounders
for i, (cx, cy) in enumerate(conf_positions):
    ax.annotate("", xy=treatment_pos, xytext=(cx, cy),
                arrowprops=dict(arrowstyle="->", color="#cccccc", lw=1.0))
    ax.annotate("", xy=outcome_pos, xytext=(cx, cy),
                arrowprops=dict(arrowstyle="->", color="#cccccc", lw=1.0))

# Treatment -> Outcome (main causal arrow)
ax.annotate("", xy=outcome_pos, xytext=treatment_pos,
            arrowprops=dict(arrowstyle="->", color=WARM_ORANGE, lw=3.0))

# Draw nodes
for i, c in enumerate(confounders):
    cx, cy = conf_positions[i]
    ax.plot(cx, cy, "o", color=STEEL_BLUE, markersize=20, zorder=5)
    ax.text(cx + 0.06, cy, c, fontsize=9, va="center", ha="left", color=NEAR_BLACK)

ax.plot(*treatment_pos, "s", color=WARM_ORANGE, markersize=30, zorder=5)
ax.text(treatment_pos[0], treatment_pos[1] - 0.07, "treat", fontsize=11,
        ha="center", fontweight="bold", color=NEAR_BLACK)

ax.plot(*outcome_pos, "s", color=TEAL, markersize=30, zorder=5)
ax.text(outcome_pos[0], outcome_pos[1] - 0.07, "re78", fontsize=11,
        ha="center", fontweight="bold", color=NEAR_BLACK)

ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.set_title("Causal Graph: NSW Job Training Program", fontsize=14)
ax.text(0.5, 0.02, "Confounders (blue circles) affect both treatment assignment and earnings outcome",
        ha="center", fontsize=9, color="#666666")
ax.axis("off")
plt.savefig("dowhy_causal_graph.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: dowhy_causal_graph.png")

# ── DoWhy: Model ──────────────────────────────────────────────────────

model = CausalModel(
    data=df,
    treatment=TREATMENT,
    outcome=OUTCOME,
    common_causes=COVARIATES,
)
print("\nCausalModel created successfully.")

# ── DoWhy: Identify ──────────────────────────────────────────────────

identified_estimand = model.identify_effect(proceed_when_unidentifiable=True)
print("\n" + str(identified_estimand))

# ── DoWhy: Estimate ──────────────────────────────────────────────────

# Method 1: Regression Adjustment
estimate_ra = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.linear_regression",
    confidence_intervals=True,
)
print(f"\n--- Regression Adjustment ---")
print(f"Estimated ATE: ${estimate_ra.value:,.2f}")
try:
    ci = estimate_ra.get_confidence_intervals()
    print(f"95% CI: [{ci[0]:,.2f}, {ci[1]:,.2f}]")
except:
    print("CI not available for this method")

# Method 2: Inverse Probability Weighting (IPW)
estimate_ipw = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.propensity_score_weighting",
    method_params={"weighting_scheme": "ips_weight"},
)
print(f"\n--- Inverse Probability Weighting (IPW) ---")
print(f"Estimated ATE: ${estimate_ipw.value:,.2f}")

# Method 3: Doubly Robust (AIPW)
# Manual implementation: combines regression adjustment and IPW
# so the estimate is consistent if either the outcome model or the
# propensity score model is correctly specified.
ps_model = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)
ps_model.fit(df[COVARIATES], df[TREATMENT])
ps = ps_model.predict_proba(df[COVARIATES])[:, 1]

outcome_model_1 = SklearnLR().fit(df[df[TREATMENT] == 1][COVARIATES], df[df[TREATMENT] == 1][OUTCOME])
outcome_model_0 = SklearnLR().fit(df[df[TREATMENT] == 0][COVARIATES], df[df[TREATMENT] == 0][OUTCOME])

mu1 = outcome_model_1.predict(df[COVARIATES])
mu0 = outcome_model_0.predict(df[COVARIATES])
T = df[TREATMENT].values
Y = df[OUTCOME].values

dr_ate = np.mean(
    (mu1 - mu0)
    + T * (Y - mu1) / ps
    - (1 - T) * (Y - mu0) / (1 - ps)
)
print(f"\n--- Doubly Robust (AIPW) ---")
print(f"Estimated ATE: ${dr_ate:,.2f}")

# Method 4: Propensity Score Stratification
estimate_ps_strat = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.propensity_score_stratification",
    method_params={"num_strata": 5, "clipping_threshold": 5},
)
print(f"\n--- Propensity Score Stratification ---")
print(f"Estimated ATE: ${estimate_ps_strat.value:,.2f}")

# Method 5: Propensity Score Matching
estimate_ps_match = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.propensity_score_matching",
)
print(f"\n--- Propensity Score Matching ---")
print(f"Estimated ATE: ${estimate_ps_match.value:,.2f}")

# ── Comparison Chart ──────────────────────────────────────────────────

fig, ax = plt.subplots(figsize=(9, 6))
methods = ["Naive\n(Diff. in Means)", "Regression\nAdjustment", "IPW",
           "Doubly Robust\n(AIPW)", "PS\nStratification", "PS\nMatching"]
estimates = [naive_ate, estimate_ra.value, estimate_ipw.value,
             dr_ate, estimate_ps_strat.value, estimate_ps_match.value]
colors = ["#999999", STEEL_BLUE, WARM_ORANGE, TEAL, "#8b5cf6", "#f59e0b"]

bars = ax.barh(methods, estimates, color=colors, edgecolor="white", height=0.6)

# Add value labels
for bar, val in zip(bars, estimates):
    offset = 50 if val >= 0 else -50
    ha = "left" if val >= 0 else "right"
    ax.text(val + offset, bar.get_y() + bar.get_height() / 2,
            f"${val:,.0f}", va="center", ha=ha, fontsize=10, color=NEAR_BLACK)

ax.axvline(0, color="black", linewidth=0.5, linestyle="--")
ax.set_xlabel("Estimated Average Treatment Effect (USD)")
ax.set_title("Causal Effect Estimates: NSW Job Training on 1978 Earnings")
plt.savefig("dowhy_estimate_comparison.png", dpi=300, bbox_inches="tight")
plt.close()
print("\nSaved: dowhy_estimate_comparison.png")

# ── DoWhy: Refute ─────────────────────────────────────────────────────

print("\n--- Refutation: Placebo Treatment ---")
refute_placebo = model.refute_estimate(
    identified_estimand,
    estimate_ra,
    method_name="placebo_treatment_refuter",
    placebo_type="permute",
    num_simulations=100,
)
print(refute_placebo)

print("\n--- Refutation: Random Common Cause ---")
refute_random = model.refute_estimate(
    identified_estimand,
    estimate_ra,
    method_name="random_common_cause",
    num_simulations=100,
)
print(refute_random)

print("\n--- Refutation: Data Subset ---")
refute_subset = model.refute_estimate(
    identified_estimand,
    estimate_ra,
    method_name="data_subset_refuter",
    subset_fraction=0.8,
    num_simulations=100,
)
print(refute_subset)

# ── Summary ───────────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print(f"{'Method':<30} {'ATE':>12}")
print("-" * 42)
print(f"{'Naive (Diff. in Means)':<30} ${naive_ate:>10,.2f}")
print(f"{'Regression Adjustment':<30} ${estimate_ra.value:>10,.2f}")
print(f"{'IPW':<30} ${estimate_ipw.value:>10,.2f}")
print(f"{'Doubly Robust (AIPW)':<30} ${dr_ate:>10,.2f}")
print(f"{'PS Stratification':<30} ${estimate_ps_strat.value:>10,.2f}")
print(f"{'PS Matching':<30} ${estimate_ps_match.value:>10,.2f}")

# Copy best figure as featured image
import shutil
shutil.copy("dowhy_estimate_comparison.png", "featured.png")
print("\nCopied dowhy_estimate_comparison.png -> featured.png")
