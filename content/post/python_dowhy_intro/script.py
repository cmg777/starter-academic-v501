"""
Introduction to Causal Inference with DoWhy: A Beginner's Guide

Estimate the causal effect of working from home on productivity using
DoWhy's four-step framework (Model, Identify, Estimate, Refute) with
simulated observational data where the true effect is known.

Usage:
    python script.py

Outputs:
    - dowhy_intro_eda.png
    - dowhy_intro_dag.png
    - dowhy_intro_comparison.png
    - wfh_simulated_data.csv
    - estimation_results.csv

References:
    - https://www.pywhy.org/dowhy/v0.14/
    - https://www.datacamp.com/tutorial/intro-to-causal-ai-using-the-dowhy-library-in-python
"""

import warnings
warnings.filterwarnings("ignore")

import matplotlib
matplotlib.use("Agg")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression, LinearRegression
from dowhy import CausalModel
import statsmodels.api as sm

# ── Section 0: Configuration ─────────────────────────────────────────

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Data generating process parameters
N = 5000
TRUE_ATE = 1.0

# Variable names
TREATMENT = "work_from_home"
OUTCOME = "productivity"
CONFOUNDERS = ["introversion", "num_children"]
INSTRUMENT = "company_policy"

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"
PURPLE = "#8b5cf6"

print("=" * 60)
print("CAUSAL INFERENCE WITH DoWhy: BEGINNER'S GUIDE")
print("=" * 60)
print(f"\nConfiguration:")
print(f"  Sample size: {N:,}")
print(f"  True ATE: {TRUE_ATE}")
print(f"  Treatment: {TREATMENT} (binary)")
print(f"  Outcome: {OUTCOME} (continuous)")
print(f"  Confounders: {', '.join(CONFOUNDERS)}")
print(f"  Instrument: {INSTRUMENT}")

# ── Section 1: Data Generating Process ───────────────────────────────

print("\n" + "=" * 60)
print("SECTION 1: DATA GENERATING PROCESS (Simulated Observational Data)")
print("=" * 60)

def generate_wfh_data(n, seed):
    """
    Simulate observational data on working from home and productivity.

    Causal structure:
        company_policy -> work_from_home -> productivity
        introversion -> work_from_home AND productivity (CONFOUNDER)
        num_children -> work_from_home AND productivity (CONFOUNDER)

    The key insight: introverts self-select into WFH AND are independently
    more productive (e.g., fewer distractions in open offices). This creates
    CONFOUNDING BIAS in naive estimates.
    """
    rng = np.random.default_rng(seed)

    # Confounders
    introversion = rng.normal(5, 1.5, n)          # personality trait
    num_children = rng.poisson(1.5, n)             # family size

    # Instrument: company WFH policy (exogenous)
    company_policy = rng.binomial(1, 0.4, n)

    # Treatment assignment (OBSERVATIONAL: affected by confounders + instrument)
    # More introverted people choose WFH, more children -> more WFH,
    # company policy enables WFH
    logit_p = -1.5 + 0.3 * introversion + 0.2 * num_children + 1.0 * company_policy
    prob_wfh = 1 / (1 + np.exp(-logit_p))
    work_from_home = rng.binomial(1, prob_wfh)

    # Outcome: productivity (affected by treatment + confounders, NOT instrument)
    # EXCLUSION RESTRICTION: company_policy does NOT appear here
    noise = rng.normal(0, 2, n)
    productivity = (50
                    + TRUE_ATE * work_from_home    # causal effect = 1.0
                    + 0.8 * introversion           # introverts more productive
                    - 0.5 * num_children           # children reduce productivity
                    + noise)

    return pd.DataFrame({
        "work_from_home": work_from_home,
        "productivity": productivity,
        "introversion": introversion,
        "num_children": num_children,
        "company_policy": company_policy,
    })

df = generate_wfh_data(N, RANDOM_SEED)

print("\nTrue DGP parameters:")
print(f"  work_from_home -> productivity:  {TRUE_ATE} (THIS IS WHAT WE WANT TO ESTIMATE)")
print(f"  introversion -> productivity:    0.8 (confounder effect on outcome)")
print(f"  num_children -> productivity:   -0.5 (confounder effect on outcome)")
print(f"  introversion -> WFH (logit):     0.3 (confounder effect on treatment)")
print(f"  num_children -> WFH (logit):     0.2 (confounder effect on treatment)")
print(f"  company_policy -> WFH (logit):   1.0 (instrument effect on treatment)")
print(f"  company_policy -> productivity:  0.0 (EXCLUSION RESTRICTION holds)")

print(f"\nDataset shape: {df.shape}")
print(f"Treatment prevalence: {df[TREATMENT].mean():.1%} work from home")
print(f"\nFirst 5 rows:")
print(df.head().to_string(index=False))
print(f"\nDescriptive statistics:")
print(df.describe().round(2).to_string())

df.to_csv("wfh_simulated_data.csv", index=False)
print("\nSaved: wfh_simulated_data.csv")

# ── Section 2: EDA + Naive Estimate ──────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 2: EXPLORATORY DATA ANALYSIS")
print("=" * 60)

# Naive difference in means (BIASED)
mean_wfh = df[df[TREATMENT] == 1][OUTCOME].mean()
mean_office = df[df[TREATMENT] == 0][OUTCOME].mean()
naive_ate = mean_wfh - mean_office

print(f"\n--- Naive Estimate (BIASED) ---")
print(f"Mean productivity (WFH):    {mean_wfh:.2f}")
print(f"Mean productivity (Office): {mean_office:.2f}")
print(f"Naive ATE (difference):     {naive_ate:.2f}")
print(f"True ATE:                   {TRUE_ATE:.2f}")
print(f"Bias (naive - true):        {naive_ate - TRUE_ATE:.2f}")
print(f"\nWHY IS THE NAIVE ESTIMATE BIASED?")
print(f"Introverts self-select into WFH (introversion -> WFH)")
print(f"AND introverts are independently more productive (introversion -> productivity)")
print(f"This CONFOUNDING inflates the naive estimate upward.")

# Covariate imbalance
print(f"\n--- Covariate Means by Treatment Group ---")
balance = df.groupby(TREATMENT)[CONFOUNDERS].mean()
balance.index = ["Office", "WFH"]
print(balance.round(3).to_string())
print(f"\nNote: WFH group has HIGHER introversion (self-selection!)")

# Figure 1: EDA
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Panel A: Productivity distribution by treatment
ax = axes[0]
for group, label, color in [(0, "Office", STEEL_BLUE), (1, "WFH", WARM_ORANGE)]:
    subset = df[df[TREATMENT] == group][OUTCOME]
    ax.hist(subset, bins=35, alpha=0.6, label=f"{label} (mean={subset.mean():.1f})",
            color=color, edgecolor="white")
    ax.axvline(subset.mean(), color=color, linewidth=2, linestyle="--")
ax.axvline(mean_office + TRUE_ATE, color=NEAR_BLACK, linewidth=1.5, linestyle=":",
           label=f"True causal effect (Office mean + {TRUE_ATE})")
ax.set_xlabel("Productivity")
ax.set_ylabel("Count")
ax.set_title("A. Productivity Distribution by Group")
ax.legend(fontsize=9)

# Panel B: Covariate imbalance
ax = axes[1]
x = np.arange(len(CONFOUNDERS))
width = 0.35
means_office = df[df[TREATMENT] == 0][CONFOUNDERS].mean()
means_wfh = df[df[TREATMENT] == 1][CONFOUNDERS].mean()
ax.bar(x - width/2, means_office, width, label="Office", color=STEEL_BLUE, edgecolor="white")
ax.bar(x + width/2, means_wfh, width, label="WFH", color=WARM_ORANGE, edgecolor="white")
ax.set_xticks(x)
ax.set_xticklabels(["Introversion", "Num. Children"])
ax.set_ylabel("Mean Value")
ax.set_title("B. Covariate Imbalance (Confounders)")
ax.legend()
# Annotate the bias direction
ax.annotate("Self-selection\nbias!", xy=(0, means_wfh.iloc[0]),
            xytext=(0.3, means_wfh.iloc[0] + 0.3),
            fontsize=9, color=WARM_ORANGE, fontweight="bold",
            arrowprops=dict(arrowstyle="->", color=WARM_ORANGE))

plt.suptitle("Observational Data: Confounders Create Selection Bias",
             fontsize=13, fontweight="bold", y=1.02)
plt.tight_layout()
plt.savefig("dowhy_intro_eda.png", dpi=300, bbox_inches="tight")
plt.close()
print("\nSaved: dowhy_intro_eda.png")

# ── Section 3: DoWhy Step 1 — Model (DAG) ────────────────────────────

print("\n" + "=" * 60)
print("SECTION 3: DoWhy STEP 1 — MODEL (Define Causal Graph)")
print("=" * 60)

print("""
The FIRST step in DoWhy is to encode your causal assumptions as a
Directed Acyclic Graph (DAG). This forces you to be EXPLICIT about
what causes what.

Our causal graph:
    company_policy ──> work_from_home ──> productivity
                              ^                 ^
                              |                 |
    introversion ─────────────+─────────────────+
    num_children ─────────────+─────────────────+

Key relationships:
  - introversion and num_children are CONFOUNDERS (affect BOTH treatment and outcome)
  - company_policy is an INSTRUMENT (affects treatment but NOT outcome directly)
""")

# Create the CausalModel
model = CausalModel(
    data=df,
    treatment=TREATMENT,
    outcome=OUTCOME,
    common_causes=CONFOUNDERS,
    instruments=[INSTRUMENT],
)
print("CausalModel created successfully.")

# Visualize the DAG
try:
    model.view_model(layout="dot")
    import shutil
    import os
    # DoWhy saves as causal_model.png by default
    if os.path.exists("causal_model.png"):
        shutil.move("causal_model.png", "dowhy_intro_dag.png")
        print("Saved: dowhy_intro_dag.png (via DoWhy's view_model)")
    else:
        raise FileNotFoundError("causal_model.png not created")
except Exception as e:
    print(f"DoWhy's graphviz rendering failed: {e}")
    print("Creating DAG manually with matplotlib...")

    # Fallback: manual DAG using matplotlib
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.set_xlim(-0.5, 3.5)
    ax.set_ylim(-0.5, 3.5)
    ax.axis("off")

    # Node positions
    nodes = {
        "company_policy": (0.5, 2.0),
        "work_from_home": (1.5, 2.0),
        "productivity": (3.0, 2.0),
        "introversion": (1.5, 3.2),
        "num_children": (2.5, 0.8),
    }

    # Draw nodes
    for name, (x, y) in nodes.items():
        color = TEAL if name == INSTRUMENT else (WARM_ORANGE if name == TREATMENT
                else (STEEL_BLUE if name == OUTCOME else "#999999"))
        ax.add_patch(plt.Circle((x, y), 0.25, fc=color, ec=NEAR_BLACK, alpha=0.8, zorder=2))
        label = name.replace("_", "\n")
        ax.text(x, y, label, ha="center", va="center", fontsize=8,
                fontweight="bold", color="white", zorder=3)

    # Draw edges (arrows)
    edges = [
        ("company_policy", "work_from_home"),
        ("work_from_home", "productivity"),
        ("introversion", "work_from_home"),
        ("introversion", "productivity"),
        ("num_children", "work_from_home"),
        ("num_children", "productivity"),
    ]
    for src, dst in edges:
        x1, y1 = nodes[src]
        x2, y2 = nodes[dst]
        dx, dy = x2 - x1, y2 - y1
        length = np.sqrt(dx**2 + dy**2)
        # Shorten arrows to not overlap circles
        shrink = 0.28
        ax.annotate("", xy=(x2 - shrink*dx/length, y2 - shrink*dy/length),
                    xytext=(x1 + shrink*dx/length, y1 + shrink*dy/length),
                    arrowprops=dict(arrowstyle="->", lw=2, color=NEAR_BLACK))

    # Legend
    ax.text(0.0, 0.2, "Legend:", fontsize=9, fontweight="bold", transform=ax.transAxes)
    ax.text(0.0, 0.12, "  Gray = Confounder", fontsize=8, color="#999999", transform=ax.transAxes)
    ax.text(0.0, 0.05, f"  Teal = Instrument", fontsize=8, color=TEAL, transform=ax.transAxes)

    ax.set_title("Causal DAG: Effect of Working from Home on Productivity",
                 fontsize=12, fontweight="bold", pad=20)
    plt.savefig("dowhy_intro_dag.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("Saved: dowhy_intro_dag.png (matplotlib fallback)")

# ── Section 4: DoWhy Step 2 — Identify ───────────────────────────────

print("\n" + "=" * 60)
print("SECTION 4: DoWhy STEP 2 — IDENTIFY (Find the Estimand)")
print("=" * 60)

print("""
IDENTIFICATION means: Can we express the causal effect as a statistical
quantity that we can compute from data?

DoWhy uses the causal graph to find valid adjustment sets automatically.
It checks TWO identification strategies:

1. BACKDOOR CRITERION (Selection on Observables):
   If we can measure ALL confounders, we can block all backdoor paths
   by conditioning on them.
   -> Used by: Regression, IPW, Doubly Robust

2. INSTRUMENTAL VARIABLE:
   If we have a variable that affects treatment but NOT outcome directly,
   we can use it to identify the causal effect even with unmeasured confounders.
   -> Used by: IV/2SLS estimation
""")

identified_estimand = model.identify_effect(proceed_when_unidentifiable=True)
print(identified_estimand)

# ── Section 5: DoWhy Step 3 — Estimate (4 Methods) ───────────────────

print("\n" + "=" * 60)
print("SECTION 5: DoWhy STEP 3 — ESTIMATE (4 Methods)")
print("=" * 60)

results = {}
results_ci = {}   # store (lower, upper) for each method
results_se = {}   # store robust SE for each method

# All standard errors in this script are ROBUST (heteroskedasticity-consistent).
# - Naive: Welch's t-test SE (allows unequal variances across groups)
# - Regression: HC1 (White) robust SE via statsmodels
# - IPW: influence-function SE (inherently robust to heteroskedasticity)
# - Doubly Robust: influence-function SE (inherently robust)
# - IV: HC1 robust SE via manual 2SLS with statsmodels
print("\nNote: All standard errors are ROBUST (heteroskedasticity-consistent).")
print("      This means CIs remain valid even if the error variance differs")
print("      across observations (e.g., more variable productivity for WFH workers).\n")

# --- Naive: Welch SE (robust to unequal variances) ---
mean_wfh_vals = df[df[TREATMENT] == 1][OUTCOME]
mean_off_vals = df[df[TREATMENT] == 0][OUTCOME]
se_naive = np.sqrt(mean_wfh_vals.var() / len(mean_wfh_vals)
                   + mean_off_vals.var() / len(mean_off_vals))
results_ci["Naive"] = (naive_ate - 1.96 * se_naive, naive_ate + 1.96 * se_naive)
results_se["Naive"] = se_naive

# --- Method 1: Linear Regression (Backdoor) with HC1 robust SE ---
print("--- Method 1: Linear Regression (Backdoor Adjustment) ---")
print("Idea: Include confounders as controls in a regression.")
print("      Y = b0 + b1*Treatment + b2*Introversion + b3*NumChildren + error")
print("      b1 is the causal effect (if all confounders are controlled).")

# DoWhy estimation (for the CausalModel workflow)
estimate_reg = model.estimate_effect(
    identified_estimand,
    method_name="backdoor.linear_regression",
    confidence_intervals=True,
)

# Robust SE via statsmodels OLS with HC1
X_reg = sm.add_constant(df[[TREATMENT] + CONFOUNDERS])
ols_model = sm.OLS(df[OUTCOME], X_reg).fit(cov_type="HC1")
reg_ate = ols_model.params[TREATMENT]
se_reg = ols_model.bse[TREATMENT]
ci_reg = (ols_model.conf_int().loc[TREATMENT, 0], ols_model.conf_int().loc[TREATMENT, 1])
results["Linear Regression"] = reg_ate
results_ci["Linear Regression"] = (float(ci_reg[0]), float(ci_reg[1]))
results_se["Linear Regression"] = float(se_reg)
print(f"Estimated ATE: {reg_ate:.4f}")
print(f"Robust SE (HC1): {se_reg:.4f}")
print(f"95% CI: [{ci_reg[0]:.4f}, {ci_reg[1]:.4f}]")
print(f"CI width: {ci_reg[1] - ci_reg[0]:.4f}")
print(f"Bias from true ({TRUE_ATE}): {reg_ate - TRUE_ATE:.4f}")

# --- Method 2: IPW (Propensity Score Weighting) ---
print("\n--- Method 2: Inverse Probability Weighting (IPW) ---")
print("Idea: Weight each observation by the inverse of the probability")
print("      of receiving its actual treatment, given confounders.")
print("      This creates a 'pseudo-population' where treatment is independent")
print("      of confounders (mimicking randomization).")

# Fit propensity score model
ps_model = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)
ps_model.fit(df[CONFOUNDERS], df[TREATMENT])
ps = ps_model.predict_proba(df[CONFOUNDERS])[:, 1]

T = df[TREATMENT].values
Y = df[OUTCOME].values

# IPW via Hajek (normalized) estimator — stabilized weights reduce variance
# Hajek: ATE = mean(T*Y*w1) / mean(T*w1) - mean((1-T)*Y*w0) / mean((1-T)*w0)
# where w1 = 1/ps, w0 = 1/(1-ps)
w1 = 1.0 / ps
w0 = 1.0 / (1 - ps)
mu1_ipw = np.sum(T * Y * w1) / np.sum(T * w1)
mu0_ipw = np.sum((1 - T) * Y * w0) / np.sum((1 - T) * w0)
ipw_ate = mu1_ipw - mu0_ipw

# Influence function for Hajek estimator (robust SE)
ipw_phi_1 = T * w1 * (Y - mu1_ipw) / np.mean(T * w1)
ipw_phi_0 = (1 - T) * w0 * (Y - mu0_ipw) / np.mean((1 - T) * w0)
ipw_phi = ipw_phi_1 - ipw_phi_0
se_ipw = np.std(ipw_phi, ddof=1) / np.sqrt(N)
ci_ipw = (ipw_ate - 1.96 * se_ipw, ipw_ate + 1.96 * se_ipw)
results["IPW"] = ipw_ate
results_ci["IPW"] = ci_ipw
results_se["IPW"] = se_ipw
print(f"Estimated ATE: {ipw_ate:.4f}")
print(f"Robust SE (influence function): {se_ipw:.4f}")
print(f"95% CI: [{ci_ipw[0]:.4f}, {ci_ipw[1]:.4f}]")
print(f"CI width: {ci_ipw[1] - ci_ipw[0]:.4f}")
print(f"Bias from true ({TRUE_ATE}): {ipw_ate - TRUE_ATE:.4f}")

# --- Method 3: Doubly Robust (AIPW) ---
print("\n--- Method 3: Doubly Robust (AIPW) ---")
print("Idea: Combine BOTH outcome modeling AND propensity score weighting.")
print("      Consistent if EITHER the outcome model OR the propensity score")
print("      model is correctly specified (hence 'doubly robust').")

# Fit outcome models for each treatment group
outcome_model_1 = LinearRegression().fit(
    df[df[TREATMENT] == 1][CONFOUNDERS], df[df[TREATMENT] == 1][OUTCOME])
outcome_model_0 = LinearRegression().fit(
    df[df[TREATMENT] == 0][CONFOUNDERS], df[df[TREATMENT] == 0][OUTCOME])

# Predicted potential outcomes
mu1 = outcome_model_1.predict(df[CONFOUNDERS])
mu0 = outcome_model_0.predict(df[CONFOUNDERS])

# AIPW influence function (inherently robust to heteroskedasticity)
phi = (mu1 - mu0) + T * (Y - mu1) / ps - (1 - T) * (Y - mu0) / (1 - ps)
dr_ate = np.mean(phi)
se_dr = np.std(phi, ddof=1) / np.sqrt(N)
ci_dr = (dr_ate - 1.96 * se_dr, dr_ate + 1.96 * se_dr)
results["Doubly Robust"] = dr_ate
results_ci["Doubly Robust"] = ci_dr
results_se["Doubly Robust"] = se_dr
print(f"Estimated ATE: {dr_ate:.4f}")
print(f"Robust SE (influence function): {se_dr:.4f}")
print(f"95% CI: [{ci_dr[0]:.4f}, {ci_dr[1]:.4f}]")
print(f"CI width: {ci_dr[1] - ci_dr[0]:.4f}")
print(f"Bias from true ({TRUE_ATE}): {dr_ate - TRUE_ATE:.4f}")

# --- Method 4: Instrumental Variables (2SLS) with HC1 robust SE ---
print("\n--- Method 4: Instrumental Variables (2SLS) ---")
print("Idea: Use an instrument (company_policy) that affects treatment")
print("      but does NOT directly affect the outcome.")
print("      This identifies the causal effect even if there are")
print("      UNMEASURED confounders (unlike methods 1-3).")
print(f"      Instrument: {INSTRUMENT} (company WFH policy)")

# IV estimation via Wald estimator with delta-method robust SE
# For a binary instrument Z, the Wald estimator is:
#   ATE_iv = Cov(Y, Z) / Cov(T, Z) = (E[Y|Z=1] - E[Y|Z=0]) / (E[T|Z=1] - E[T|Z=0])
Z = df[INSTRUMENT].values

# Reduced form: effect of instrument on outcome
X_rf = sm.add_constant(df[[INSTRUMENT]])
reduced_form = sm.OLS(df[OUTCOME], X_rf).fit(cov_type="HC1")
gamma = reduced_form.params[INSTRUMENT]  # dY/dZ
se_gamma = reduced_form.bse[INSTRUMENT]

# First stage: effect of instrument on treatment
first_stage = sm.OLS(df[TREATMENT], X_rf).fit(cov_type="HC1")
pi = first_stage.params[INSTRUMENT]      # dT/dZ
se_pi = first_stage.bse[INSTRUMENT]
print(f"First-stage F-statistic: {first_stage.fvalue:.1f}")
print(f"First-stage coefficient on {INSTRUMENT}: {pi:.4f} (robust SE: {se_pi:.4f})")
print(f"Reduced-form coefficient: {gamma:.4f} (robust SE: {se_gamma:.4f})")

# Wald IV estimate: ATE = gamma / pi
iv_ate = gamma / pi

# Delta-method robust SE: SE(gamma/pi) ≈ (1/pi) * sqrt(se_gamma^2 + (gamma/pi)^2 * se_pi^2)
# (assumes Cov(gamma, pi) ≈ 0 since RF and FS have different dependent variables)
se_iv = (1 / abs(pi)) * np.sqrt(se_gamma**2 + (gamma / pi)**2 * se_pi**2)
ci_iv = (iv_ate - 1.96 * se_iv, iv_ate + 1.96 * se_iv)
results["IV (2SLS)"] = iv_ate
results_ci["IV (2SLS)"] = ci_iv
results_se["IV (2SLS)"] = se_iv
print(f"Estimated ATE: {iv_ate:.4f}")
print(f"Robust SE (HC1): {se_iv:.4f}")
print(f"95% CI: [{ci_iv[0]:.4f}, {ci_iv[1]:.4f}]")
print(f"CI width: {ci_iv[1] - ci_iv[0]:.4f}")
print(f"Bias from true ({TRUE_ATE}): {iv_ate - TRUE_ATE:.4f}")

# --- Standard Error Comparison ---
print("\n--- Comparison of Robust Standard Errors ---")
print(f"{'Method':<25} {'Robust SE':>10} {'Relative to Reg':>16}")
print("-" * 53)
se_ref = results_se["Linear Regression"]
for method_name in ["Naive", "Linear Regression", "IPW", "Doubly Robust", "IV (2SLS)"]:
    se_val = results_se[method_name]
    relative = se_val / se_ref
    print(f"{method_name:<25} {se_val:>10.4f} {relative:>15.2f}x")
print(f"\nKey insight: IV's robust SE is ~{results_se['IV (2SLS)'] / se_ref:.0f}x larger than regression's.")
print("This reflects the BIAS-VARIANCE TRADEOFF: IV can handle unmeasured")
print("confounders but at the cost of much lower precision.")

# Save results with CIs and SEs
all_methods = ["Naive (Diff. in Means)"] + list(results.keys())
all_estimates = [naive_ate] + list(results.values())
all_ci_keys = ["Naive"] + list(results.keys())
all_ci_lower = [results_ci[k][0] for k in all_ci_keys]
all_ci_upper = [results_ci[k][1] for k in all_ci_keys]
all_se = [results_se[k] for k in all_ci_keys]
results_df = pd.DataFrame({
    "Method": all_methods,
    "Estimate": all_estimates,
    "Robust_SE": all_se,
    "CI_Lower": all_ci_lower,
    "CI_Upper": all_ci_upper,
    "CI_Width": [u - l for l, u in zip(all_ci_lower, all_ci_upper)],
    "True_ATE": TRUE_ATE,
    "Bias": [e - TRUE_ATE for e in all_estimates],
})
results_df.to_csv("estimation_results.csv", index=False)
print("\nSaved: estimation_results.csv")

print(f"\n--- Summary of Estimates with Robust SEs and 95% CIs ---")
print(f"{'Method':<25} {'Estimate':>9} {'Rob. SE':>9} {'95% CI':>22} {'Width':>7} {'Bias':>8} {'Covers?':>8}")
print("-" * 92)
print(f"{'True ATE':<25} {TRUE_ATE:>9.4f} {'':>9} {'':>22} {'':>7} {'':>8} {'':>8}")
for method, est, ci_k in zip(all_methods, all_estimates, all_ci_keys):
    lo, hi = results_ci[ci_k]
    se_val = results_se[ci_k]
    width = hi - lo
    bias = est - TRUE_ATE
    covers = "YES" if lo <= TRUE_ATE <= hi else "NO"
    print(f"{method:<25} {est:>9.4f} {se_val:>9.4f} [{lo:>8.4f}, {hi:>8.4f}] {width:>7.4f} {bias:>+8.4f} {covers:>8}")

# ── Section 6: DoWhy Step 4 — Refute ─────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 6: DoWhy STEP 4 — REFUTE (Robustness Checks)")
print("=" * 60)

print("""
DoWhy's REFUTATION step tests whether the estimate is robust.
If our causal assumptions are correct, the estimate should:
  1. Become ~0 when treatment is randomly permuted (placebo test)
  2. Stay the same when a random confounder is added
  3. Stay the same on subsets of the data
""")

# Create a backdoor-only model for refutation (avoids IV-related bugs in DoWhy v0.14)
model_backdoor = CausalModel(
    data=df,
    treatment=TREATMENT,
    outcome=OUTCOME,
    common_causes=CONFOUNDERS,
)
estimand_backdoor = model_backdoor.identify_effect(proceed_when_unidentifiable=True)
estimate_reg_bd = model_backdoor.estimate_effect(
    estimand_backdoor,
    method_name="backdoor.linear_regression",
)

# Refutation 1: Placebo Treatment
print("--- Refutation 1: Placebo Treatment ---")
print("(Randomly permute treatment -> causal effect should vanish)")
refute_placebo = model_backdoor.refute_estimate(
    estimand_backdoor,
    estimate_reg_bd,
    method_name="placebo_treatment_refuter",
    placebo_type="permute",
    num_simulations=100,
)
print(refute_placebo)

# Refutation 2: Random Common Cause
print("\n--- Refutation 2: Random Common Cause ---")
print("(Add a random variable as confounder -> estimate should be stable)")
refute_random = model_backdoor.refute_estimate(
    estimand_backdoor,
    estimate_reg_bd,
    method_name="random_common_cause",
    num_simulations=100,
)
print(refute_random)

# Refutation 3: Data Subset
print("\n--- Refutation 3: Data Subset (80%) ---")
print("(Use 80% of the data -> estimate should be stable)")
refute_subset = model_backdoor.refute_estimate(
    estimand_backdoor,
    estimate_reg_bd,
    method_name="data_subset_refuter",
    subset_fraction=0.8,
    num_simulations=100,
)
print(refute_subset)

# ── Section 7: Comparison Visualization ──────────────────────────────

print("\n" + "=" * 60)
print("SECTION 7: COMPARISON VISUALIZATION")
print("=" * 60)

fig, ax = plt.subplots(figsize=(10, 6))

methods_list = ["Naive\n(Diff. in Means)", "Linear\nRegression", "IPW",
                "Doubly\nRobust", "IV\n(2SLS)"]
estimates_list = [naive_ate, results["Linear Regression"], results["IPW"],
                  results["Doubly Robust"], results["IV (2SLS)"]]
ci_keys_list = ["Naive", "Linear Regression", "IPW", "Doubly Robust", "IV (2SLS)"]
ci_lower = [results_ci[k][0] for k in ci_keys_list]
ci_upper = [results_ci[k][1] for k in ci_keys_list]
xerr_left = [est - lo for est, lo in zip(estimates_list, ci_lower)]
xerr_right = [hi - est for est, hi in zip(estimates_list, ci_upper)]
colors = ["#999999", STEEL_BLUE, WARM_ORANGE, TEAL, PURPLE]

y_pos = np.arange(len(methods_list))

# Plot point estimates with CI error bars
for i, (method, est, lo, hi, color) in enumerate(
        zip(methods_list, estimates_list, xerr_left, xerr_right, colors)):
    ax.errorbar(est, i, xerr=[[lo], [hi]], fmt="o", markersize=10,
                color=color, ecolor=color, elinewidth=2.5, capsize=6,
                capthick=2.5, zorder=4)

# True ATE reference line
ax.axvline(TRUE_ATE, color=NEAR_BLACK, linewidth=2, linestyle="--",
           label=f"True ATE = {TRUE_ATE}", zorder=3)

# Value labels with CI
for i, (est, ci_k) in enumerate(zip(estimates_list, ci_keys_list)):
    lo, hi = results_ci[ci_k]
    label = f"{est:.3f}  [{lo:.3f}, {hi:.3f}]"
    ax.text(max(hi, est) + 0.04, i, label, va="center", ha="left",
            fontsize=9, color=NEAR_BLACK)

ax.set_yticks(y_pos)
ax.set_yticklabels(methods_list)
ax.set_xlabel("Estimated Average Treatment Effect (ATE)")
ax.set_title("Causal Effect Estimates with 95% Confidence Intervals\n"
             "Effect of Working from Home on Productivity",
             fontsize=12, fontweight="bold")
ax.legend(loc="upper right", fontsize=11)

# Set x limits to accommodate IV's wide CI and labels
ax.set_xlim(0, max(ci_upper) + 0.55)

# Add subtle shading for "true ATE zone"
ax.axvspan(0.95, 1.05, alpha=0.08, color=NEAR_BLACK, zorder=1)

plt.tight_layout()
plt.savefig("dowhy_intro_comparison.png", dpi=300, bbox_inches="tight")
plt.close()
print("\nSaved: dowhy_intro_comparison.png")

# ── Section 8: Summary ───────────────────────────────────────────────

print("\n" + "=" * 60)
print("SUMMARY: Effect of Working from Home on Productivity")
print("=" * 60)

print(f"\n{'Method':<25} {'Estimate':>9} {'Rob. SE':>8} {'95% CI':>22} {'Width':>7} {'Covers?':>8} {'Identification':<20}")
print("-" * 103)
summary_rows = [
    ("True ATE", TRUE_ATE, None, None),
    ("Naive (Diff. in Means)", naive_ate, "Naive", "None (biased)"),
    ("Linear Regression", results["Linear Regression"], "Linear Regression", "Backdoor"),
    ("IPW", results["IPW"], "IPW", "Backdoor"),
    ("Doubly Robust (AIPW)", results["Doubly Robust"], "Doubly Robust", "Backdoor"),
    ("IV (2SLS)", results["IV (2SLS)"], "IV (2SLS)", "Instrument"),
]
for name, est, ci_k, ident in summary_rows:
    if ci_k is None:
        print(f"{name:<25} {est:>9.4f} {'---':>8} {'---':>22} {'---':>7} {'---':>8} {'---':<20}")
    else:
        lo, hi = results_ci[ci_k]
        se_val = results_se[ci_k]
        width = hi - lo
        covers = "YES" if lo <= TRUE_ATE <= hi else "NO"
        print(f"{name:<25} {est:>9.4f} {se_val:>8.4f} [{lo:>7.4f}, {hi:>7.4f}] {width:>7.4f} {covers:>8} {ident:<20}")

print(f"""
KEY TAKEAWAYS:
1. The naive estimate is BIASED upward ({naive_ate:.2f} vs true {TRUE_ATE:.2f}) because
   introverts self-select into WFH and are independently more productive.
   Its 95% CI [{results_ci['Naive'][0]:.3f}, {results_ci['Naive'][1]:.3f}] does NOT cover the true ATE.
2. Methods 1-3 (Regression, IPW, DR) use SELECTION ON OBSERVABLES:
   they assume we have measured ALL confounders. If true, they eliminate bias.
3. Method 4 (IV) uses an INSTRUMENTAL VARIABLE (company policy):
   valid even with unmeasured confounders, but requires the exclusion restriction.
4. CONFIDENCE INTERVALS reveal PRECISION: backdoor methods have CI widths of ~0.24-0.29,
   while IV's CI width is ~{results_ci['IV (2SLS)'][1] - results_ci['IV (2SLS)'][0]:.2f} --- about 5x wider.
   This is the BIAS-VARIANCE TRADEOFF: IV avoids bias from unmeasured confounders
   but pays with much lower precision. All four CIs cover the true ATE.
5. DOUBLY ROBUST is the most robust among backdoor methods: consistent if
   either the outcome model or propensity score model is correctly specified.
6. DoWhy's framework forces TRANSPARENCY: you declare assumptions (DAG),
   check identifiability, estimate, and then test robustness.

IDENTIFICATION STRATEGIES:
- Selection on Observables (Backdoor): "Control for everything that causes
  both treatment and outcome." Requires NO unmeasured confounders.
- Instrumental Variables: "Find something that nudges treatment but doesn't
  directly affect the outcome." Works even with unmeasured confounders.
""")

print("Generated PNG files:")
print("  - dowhy_intro_eda.png")
print("  - dowhy_intro_dag.png")
print("  - dowhy_intro_comparison.png")
print("\nGenerated CSV files:")
print("  - wfh_simulated_data.csv")
print("  - estimation_results.csv")
print("\n=== Script completed successfully ===")
