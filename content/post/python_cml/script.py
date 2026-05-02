"""
Causal Machine Learning (CML) for Policy Evaluation
====================================================

A beginner-friendly Python tutorial on Causal Machine Learning, modelled on
the Flemish Active Labour Market Programme (ALMP) case study analysed in:

    Lechner, M. (2023). "Causal Machine Learning and its use for public
    policy". Swiss Journal of Economics and Statistics, 159(8).
    Empirical illustration: Cockx, Lechner & Bollens (2023).

The tutorial walks through the full CML roadmap in four steps:

    1. Average Treatment Effect (ATE)        via DoubleML
    2. Group Average Treatment Effects (GATE) by Dutch language proficiency
    3. Individual Average Treatment Effects (IATE) via Causal Forest DML
    4. A simple welfare-maximising training-assignment rule

Data
----
Synthetic, N = 5,000. The dataset mirrors the structure of the Flanders ALMP
cohort. The true treatment effects are known to the script (stored in
`cml_truth.csv`) so every estimator can be benchmarked against the truth.
The reader does not need to know how the data were generated --- only that
the data are synthetic and the truth is known.

Outputs
-------
    6 PNG figures (cml_*.png, 300 DPI, light theme)
    9 CSV tables  (synthetic data, ground truth, and estimator results)
    README.md     (artifact inventory)

Usage
-----
    cd content/post/python_cml/
    python3 script.py

References
----------
- DoubleML: https://docs.doubleml.org/
- EconML  : https://econml.azurewebsites.net/
- mcf     : the Modified Causal Forest package (Cockx et al. 2023). Mentioned
            here for completeness; not a runtime dependency of this tutorial.
"""

# ── Imports ──────────────────────────────────────────────────────────
import warnings

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LogisticRegression

from doubleml import DoubleMLData, DoubleMLIRM
from econml.dml import CausalForestDML

# Silence only the noise we expect from the third-party CML stack;
# real deprecation / convergence / runtime warnings still surface.
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

# ── Configuration ────────────────────────────────────────────────────
RANDOM_SEED = 42

# Seed the legacy global numpy RNG too: DoubleML's internal cross-fit
# fold assignment uses np.random under the hood, so without this the
# DML ATE drifts by O(1e-3) across runs.
np.random.seed(RANDOM_SEED)

# Site palette (light theme)
COLOR_BLUE         = "#6a9bcc"   # primary
COLOR_ORANGE       = "#d97757"   # secondary / reference
COLOR_BLACK        = "#141413"   # tertiary / annotations
COLOR_TEAL         = "#00d4c8"   # highlight (used sparingly)
COLOR_GRAY         = "#999999"   # naive baseline
COLOR_BLUE_LIGHT   = "#9bbedd"   # light variant — IATE histogram
COLOR_ORANGE_LIGHT = "#e8a583"   # light variant — IATE histogram

plt.rcParams.update({
    "figure.dpi":       100,
    "savefig.dpi":      300,
    "axes.titlesize":   13,
    "axes.labelsize":   11,
    "xtick.labelsize":  10,
    "ytick.labelsize":  10,
    "legend.fontsize":  10,
    "axes.spines.top":   False,
    "axes.spines.right": False,
})

X_COLS = ["age", "edu_years", "prior_emp_months", "dutch_prof", "female", "migrant"]


# ── Helpers ──────────────────────────────────────────────────────────
def welfare(rule, tau_true, cost):
    """Average net welfare per individual under an assignment rule."""
    return float((rule * (tau_true - cost)).mean())


# ── Synthetic data (truths known to the script, hidden from the post) ──
def simulate_almp(n=5000, seed=RANDOM_SEED):
    """Generate a synthetic Flanders-ALMP-style cohort with known truth."""
    rng = np.random.default_rng(seed)

    age              = rng.uniform(20, 60, size=n)
    edu_years        = np.clip(rng.normal(12, 3, size=n), 6, 20)
    prior_emp_months = rng.beta(2, 5, size=n) * 60.0
    dutch_prof       = rng.choice([0, 1, 2, 3], size=n, p=[0.25, 0.30, 0.30, 0.15])
    female           = rng.binomial(1, 0.48, size=n)
    migrant          = rng.binomial(1, 0.30, size=n)

    logit_pi = (
        -0.6
        + 0.020 * (40 - age)
        + 0.05  * (12 - edu_years)
        + 0.015 * (30 - prior_emp_months)
        + 0.30  * (3 - dutch_prof)
        + 0.20  * migrant
        - 0.10  * female
    )
    pi_true = 1.0 / (1.0 + np.exp(-logit_pi))
    pi_true = np.clip(pi_true, 0.05, 0.95)
    D       = rng.binomial(1, pi_true)

    tau = (
        3.0
        + 1.5 * (3 - dutch_prof)
        + 0.4 * migrant
        - 0.02 * (age - 40)
        + rng.normal(0, 0.3, size=n)
    )

    Y0 = (
        12.0
        + 0.20 * prior_emp_months
        + 0.30 * edu_years
        + 1.0  * dutch_prof
        - 0.05 * (age - 40) ** 2 / 10
        + rng.normal(0, 2.5, size=n)
    )
    Y0 = np.clip(Y0, 0, 30)

    Y1 = np.clip(Y0 + tau, 0, 30)
    Y_obs = D * Y1 + (1 - D) * Y0

    obs = pd.DataFrame({
        "age": age,
        "edu_years": edu_years,
        "prior_emp_months": prior_emp_months,
        "dutch_prof": dutch_prof.astype(int),
        "female": female.astype(int),
        "migrant": migrant.astype(int),
        "D": D.astype(int),
        "Y": Y_obs,
    })
    truth = pd.DataFrame({
        "Y0": Y0,
        "Y1": Y1,
        "tau": tau,
        "pi_true": pi_true,
    })
    return obs, truth


# ──────────────────────────────────────────────────────────────────────
# Estimands targeted in this tutorial (observational, unconfoundedness)
#   ATE      = E[Y(1) - Y(0)]
#   GATE(z)  = E[Y(1) - Y(0) | Z = z]    (Z = Dutch language proficiency)
#   IATE(x)  = E[Y(1) - Y(0) | X = x]
#
# Framing: observational. Selection-on-observables holds in this DGP.
# The naive difference-in-means is genuinely biased; CML methods address
# confounding using flexible nuisance estimators and orthogonal scores.
# ──────────────────────────────────────────────────────────────────────


print("=" * 70)
print(" Step 1 — Generate the synthetic cohort")
print("=" * 70)

df, truth = simulate_almp(n=5000, seed=RANDOM_SEED)
# Carry dutch_prof into truth so all groupby operations on truth are
# self-contained on a single DataFrame (robust to future subsetting).
truth["dutch_prof"] = df["dutch_prof"].values
df.to_csv("cml_data.csv", index=False)
truth.to_csv("cml_truth.csv", index=False)

print(f"Sample size               : {len(df):,}")
print(f"Treatment share P(D=1)    : {df['D'].mean():.3f}")
print(f"Mean outcome E[Y]         : {df['Y'].mean():.2f} months employed (out of 30)")
print(f"Files written             : cml_data.csv, cml_truth.csv")

# Analytic truth -----------------------------------------------------
true_ate  = float(truth["tau"].mean())
true_gate = truth.groupby("dutch_prof")["tau"].mean()
true_params = pd.DataFrame({
    "parameter":  ["ATE"] + [f"GATE(dutch_prof={z})" for z in [0, 1, 2, 3]],
    "true_value": [true_ate] + [float(true_gate.loc[z]) for z in [0, 1, 2, 3]],
})
true_params.to_csv("true_parameters.csv", index=False)
print("\nGround-truth parameters (extra months of employment caused by training):")
print(true_params.to_string(index=False, float_format=lambda v: f"{v:7.3f}"))


# ── Step 2 — Overlap diagnostic ─────────────────────────────────────
print("\n" + "=" * 70)
print(" Step 2 — Overlap diagnostic (do treated and untreated overlap?)")
print("=" * 70)

# A simple logistic-regression propensity, only for visualisation.
ps_lr  = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED).fit(df[X_COLS], df["D"])
ps_hat = ps_lr.predict_proba(df[X_COLS])[:, 1]

print(f"Propensity range          : [{ps_hat.min():.3f}, {ps_hat.max():.3f}]")
print(f"P(D=1 | X) mean (treated) : {ps_hat[df['D']==1].mean():.3f}")
print(f"P(D=1 | X) mean (untreat.): {ps_hat[df['D']==0].mean():.3f}")

fig, ax = plt.subplots(figsize=(8.5, 5))
bins = np.linspace(0, 1, 31)
ax.hist(ps_hat[df["D"] == 0], bins=bins, alpha=0.65, color=COLOR_BLUE,
        label="Untreated (D=0)", edgecolor="white")
ax.hist(ps_hat[df["D"] == 1], bins=bins, alpha=0.65, color=COLOR_ORANGE,
        label="Treated (D=1)",  edgecolor="white")
ax.set_xlabel(r"Estimated propensity score $\hat{\pi}(X)$")
ax.set_ylabel("Number of individuals")
ax.set_title("Covariate overlap: propensity-score distribution by treatment status")
ax.legend()
plt.tight_layout()
plt.savefig("cml_overlap.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved figure              : cml_overlap.png")


# ── Step 3 — Naive estimator (ignores confounding) ──────────────────
print("\n" + "=" * 70)
print(" Step 3 — Naive estimator: difference in means")
print("=" * 70)
print("  WARNING: with observational data this estimator IS biased.")

y_treated   = df.loc[df["D"] == 1, "Y"].mean()
y_untreated = df.loc[df["D"] == 0, "Y"].mean()
naive_ate   = y_treated - y_untreated

n1, n0 = int((df["D"] == 1).sum()), int((df["D"] == 0).sum())
s1, s0 = df.loc[df["D"] == 1, "Y"].var(ddof=1), df.loc[df["D"] == 0, "Y"].var(ddof=1)
naive_se = float(np.sqrt(s1 / n1 + s0 / n0))

naive_df = pd.DataFrame({
    "method":     ["Naive (difference-in-means)"],
    "estimate":   [naive_ate],
    "std_error":  [naive_se],
    "ci_low":     [naive_ate - 1.96 * naive_se],
    "ci_high":    [naive_ate + 1.96 * naive_se],
    "true_ate":   [true_ate],
    "bias":       [naive_ate - true_ate],
})
naive_df.to_csv("naive_estimate.csv", index=False)
print(f"True ATE                  : {true_ate:.3f}")
print(f"Naive estimate            : {naive_ate:.3f} "
      f"[95% CI {naive_df['ci_low'][0]:.3f}, {naive_df['ci_high'][0]:.3f}]")
print(f"Bias                      : {naive_ate - true_ate:+.3f} months")


# ── Step 4 — ATE via Double Machine Learning (DoubleML) ─────────────
print("\n" + "=" * 70)
print(" Step 4 — ATE via Double Machine Learning")
print("=" * 70)

# DoubleMLData declares column roles for an Interactive Regression Model.
dml_data = DoubleMLData(df, y_col="Y", d_cols="D", x_cols=X_COLS)

# Two random-forest learners for the nuisance functions:
#   ml_g  estimates  E[Y | X, D]   (outcome regression)
#   ml_m  estimates  P(D = 1 | X)  (propensity score)
ml_g = RandomForestRegressor(n_estimators=200, max_features="sqrt",
                             min_samples_leaf=5, random_state=RANDOM_SEED, n_jobs=-1)
ml_m = RandomForestClassifier(n_estimators=200, max_features="sqrt",
                              min_samples_leaf=5, random_state=RANDOM_SEED, n_jobs=-1)

# DoubleMLIRM: cross-fitted, doubly robust ATE under unconfoundedness.
dml_irm = DoubleMLIRM(
    dml_data,
    ml_g=ml_g,
    ml_m=ml_m,
    n_folds=5,
    score="ATE",
    trimming_threshold=0.01,
)
dml_irm.fit(store_predictions=True)

ate_dml         = float(dml_irm.coef[0])
se_dml          = float(dml_irm.se[0])
ci_dml          = dml_irm.confint(level=0.95).iloc[0]
ci_low, ci_high = float(ci_dml.iloc[0]), float(ci_dml.iloc[1])

dml_summary = pd.DataFrame({
    "method":        ["DoubleML (DoubleMLIRM, RF nuisances, 5-fold CF)"],
    "estimate":      [ate_dml],
    "std_error":     [se_dml],
    "ci_low":        [ci_low],
    "ci_high":       [ci_high],
    "true_ate":      [true_ate],
    "covers_truth":  [bool(ci_low <= true_ate <= ci_high)],
})
dml_summary.to_csv("dml_ate.csv", index=False)

print(f"True ATE                  : {true_ate:.3f}")
print(f"DoubleML ATE              : {ate_dml:.3f} [95% CI {ci_low:.3f}, {ci_high:.3f}]")
print(f"95% CI covers truth       : {bool(ci_low <= true_ate <= ci_high)}")
print(f"Bias                      : {ate_dml - true_ate:+.3f} months")


# ── Step 5 — GATE by Dutch language proficiency ─────────────────────
print("\n" + "=" * 70)
print(" Step 5 — GATE by Dutch language proficiency")
print("=" * 70)
print("  Doubly robust scores from DoubleML, averaged within each stratum.")

# Recover the cross-fitted nuisance predictions stored by DoubleML.
# DoubleMLIRM has already trimmed propensities at trimming_threshold=0.01
# (see the constructor above), so no further clipping is needed here.
preds = dml_irm.predictions
g0 = np.asarray(preds["ml_g0"]).squeeze()
g1 = np.asarray(preds["ml_g1"]).squeeze()
m  = np.asarray(preds["ml_m"]).squeeze()

y_arr = df["Y"].values
d_arr = df["D"].values

# Doubly robust pseudo-outcomes: psi_i is unbiased for IATE(x_i).
psi = (
    g1 - g0
    + d_arr * (y_arr - g1) / m
    - (1 - d_arr) * (y_arr - g0) / (1 - m)
)

gate_rows = []
for z in [0, 1, 2, 3]:
    mask  = (df["dutch_prof"] == z).values
    psi_z = psi[mask]
    est   = float(psi_z.mean())
    se    = float(psi_z.std(ddof=1) / np.sqrt(mask.sum()))
    gate_rows.append({
        "dutch_prof":     z,
        "n":              int(mask.sum()),
        "gate_estimate":  est,
        "std_error":      se,
        "ci_low":         est - 1.96 * se,
        "ci_high":        est + 1.96 * se,
        "gate_true":      float(true_gate.loc[z]),
    })
gate_df = pd.DataFrame(gate_rows)
gate_df.to_csv("gate_by_dutch.csv", index=False)
print(gate_df.to_string(index=False, float_format=lambda v: f"{v:7.3f}"))

fig, ax = plt.subplots(figsize=(9, 5.2))
x_pos = np.arange(4)
width = 0.36
ax.bar(x_pos - width / 2, gate_df["gate_estimate"], width,
       yerr=1.96 * gate_df["std_error"], capsize=5,
       color=COLOR_BLUE, edgecolor=COLOR_BLACK, label="DoubleML estimate (95% CI)")
ax.bar(x_pos + width / 2, gate_df["gate_true"], width,
       color=COLOR_ORANGE, edgecolor=COLOR_BLACK, alpha=0.85, label="True GATE")
ax.set_xticks(x_pos)
ax.set_xticklabels(["0\n(no)", "1\n(low)", "2\n(intermediate)", "3\n(native)"])
ax.set_xlabel("Dutch language proficiency")
ax.set_ylabel("GATE — extra months of employment (out of 30)")
ax.set_title("Group Average Treatment Effect by Dutch proficiency")
ax.axhline(0, color=COLOR_BLACK, linewidth=0.8)
ax.legend(loc="upper right")
plt.tight_layout()
plt.savefig("cml_gate_dutch.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved figure              : cml_gate_dutch.png")


# ── Step 6 — IATE via Causal Forest DML (EconML) ────────────────────
print("\n" + "=" * 70)
print(" Step 6 — IATE via Causal Forest DML")
print("=" * 70)
print("  Forest splits on heterogeneity; produces per-individual effects + CIs.")

# CausalForestDML: a causal forest fitted on doubly robust signals.
# For each individual we obtain an IATE estimate plus a 95% CI.
cf = CausalForestDML(
    model_y=RandomForestRegressor(n_estimators=200, min_samples_leaf=5,
                                  random_state=RANDOM_SEED, n_jobs=-1),
    model_t=RandomForestClassifier(n_estimators=200, min_samples_leaf=5,
                                   random_state=RANDOM_SEED, n_jobs=-1),
    discrete_treatment=True,
    n_estimators=400,
    min_samples_leaf=15,
    max_samples=0.5,
    random_state=RANDOM_SEED,
    n_jobs=-1,
)
X_arr = df[X_COLS].values
cf.fit(df["Y"].values, df["D"].values, X=X_arr)

iate_hat                 = np.asarray(cf.effect(X_arr)).ravel()
iate_low_arr, iate_hi_arr = cf.effect_interval(X_arr, alpha=0.05)
iate_low                 = np.asarray(iate_low_arr).ravel()
iate_high                = np.asarray(iate_hi_arr).ravel()

iate_df = pd.DataFrame({
    "id":            np.arange(len(df)),
    "iate_estimate": iate_hat,
    "ci_low":        iate_low,
    "ci_high":       iate_high,
    "tau_true":      truth["tau"].values,
    "dutch_prof":    df["dutch_prof"].values,
})
iate_df.to_csv("iate_estimates.csv", index=False)

mae  = float(np.abs(iate_hat - truth["tau"].values).mean())
corr = float(np.corrcoef(iate_hat, truth["tau"].values)[0, 1])
cf_mean = float(iate_hat.mean())
cf_se   = float(iate_hat.std(ddof=1) / np.sqrt(len(iate_hat)))

print(f"True ATE                  : {true_ate:.3f}")
print(f"Mean of estimated IATEs   : {cf_mean:.3f}")
print(f"MAE(IATE, truth)          : {mae:.3f}")
print(f"Corr(IATE, truth)         : {corr:.3f}")

# Figure 3: estimated IATE vs true tau (scatter)
fig, ax = plt.subplots(figsize=(7.0, 6.5))
ax.scatter(truth["tau"].values, iate_hat, s=6, alpha=0.35,
           color=COLOR_BLUE, edgecolor="none", label="Individuals")
lim_low  = float(min(iate_hat.min(), truth["tau"].min())) - 0.5
lim_high = float(max(iate_hat.max(), truth["tau"].max())) + 0.5
ax.plot([lim_low, lim_high], [lim_low, lim_high], color=COLOR_ORANGE,
        linewidth=1.8, label="45° reference (perfect estimation)")
ax.set_xlabel(r"True individual effect $\tau_i$")
ax.set_ylabel(r"Causal Forest estimate $\hat{\tau}_i$")
ax.set_title(f"Estimated vs true IATE  —  corr = {corr:.3f},  MAE = {mae:.2f}")
ax.legend(loc="lower right")
ax.set_xlim(lim_low, lim_high)
ax.set_ylim(lim_low, lim_high)
ax.set_aspect("equal", adjustable="box")
plt.tight_layout()
plt.savefig("cml_iate_scatter.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved figure              : cml_iate_scatter.png")

# Figure 4: distribution of estimated IATEs by Dutch proficiency
fig, ax = plt.subplots(figsize=(9, 5.2))
group_colors = [COLOR_ORANGE, COLOR_ORANGE_LIGHT, COLOR_BLUE_LIGHT, COLOR_BLUE]
group_labels = ["0 (no)", "1 (low)", "2 (intermediate)", "3 (native)"]
bins = np.linspace(iate_hat.min(), iate_hat.max(), 31)
for z in [0, 1, 2, 3]:
    mask = df["dutch_prof"].values == z
    ax.hist(iate_hat[mask], bins=bins, alpha=0.65, color=group_colors[z],
            edgecolor="white", label=group_labels[z])
ax.axvline(true_ate, color=COLOR_BLACK, linewidth=1.5, linestyle="--",
           label=f"True ATE = {true_ate:.2f}")
ax.set_xlabel(r"Estimated individual effect $\hat{\tau}_i$")
ax.set_ylabel("Number of individuals")
ax.set_title("Distribution of estimated IATEs by Dutch proficiency")
ax.legend(title="Dutch proficiency", loc="upper right")
plt.tight_layout()
plt.savefig("cml_iate_distribution.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved figure              : cml_iate_distribution.png")


# ── Step 7 — Method comparison ───────────────────────────────────────
print("\n" + "=" * 70)
print(" Step 7 — Method comparison")
print("=" * 70)

comp = pd.DataFrame({
    "method":   ["Naive (DiM)",
                 "DoubleML (IRM)",
                 "CausalForestDML (mean of IATEs)",
                 "Truth"],
    "estimate": [naive_ate, ate_dml, cf_mean, true_ate],
    "ci_low":   [float(naive_df["ci_low"][0]), ci_low,
                 cf_mean - 1.96 * cf_se, true_ate],
    "ci_high":  [float(naive_df["ci_high"][0]), ci_high,
                 cf_mean + 1.96 * cf_se, true_ate],
})
comp["bias"] = comp["estimate"] - true_ate
comp.to_csv("method_comparison.csv", index=False)
print(comp.to_string(index=False, float_format=lambda v: f"{v:7.3f}"))

fig, ax = plt.subplots(figsize=(9.5, 4.8))
y_pos      = np.arange(len(comp))[::-1]
fp_colors  = [COLOR_GRAY, COLOR_BLUE, COLOR_TEAL, COLOR_ORANGE]
for i, (_, row) in enumerate(comp.iterrows()):
    yp = y_pos[i]
    if row["method"] == "Truth":
        ax.scatter(row["estimate"], yp, color=fp_colors[i], s=200,
                   marker="*", zorder=3, edgecolor=COLOR_BLACK, linewidth=0.8)
    else:
        ax.errorbar(
            row["estimate"], yp,
            xerr=[[row["estimate"] - row["ci_low"]],
                  [row["ci_high"] - row["estimate"]]],
            fmt="o", color=fp_colors[i], ecolor=fp_colors[i],
            elinewidth=2, capsize=5, markersize=10,
            markeredgecolor=COLOR_BLACK, markeredgewidth=0.6,
        )
    ax.text(row["estimate"], yp + 0.22, f"{row['estimate']:.2f}",
            ha="center", fontsize=9, color=COLOR_BLACK)

ax.axvline(true_ate, color=COLOR_ORANGE, linewidth=1.0, linestyle="--", alpha=0.6)
ax.set_yticks(y_pos)
ax.set_yticklabels(comp["method"])
ax.set_xlabel("Estimated ATE — extra months of employment")
ax.set_title("ATE estimates with 95% confidence intervals vs the truth")
ax.set_ylim(-0.6, len(comp) - 0.4)
plt.tight_layout()
plt.savefig("cml_method_comparison.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved figure              : cml_method_comparison.png")


# ── Step 8 — Simple welfare-maximising policy rule ──────────────────
print("\n" + "=" * 70)
print(" Step 8 — Simple welfare-maximising policy rule")
print("=" * 70)

COST = 4.0   # training cost in months-of-employment-equivalent

assign_treat_none = np.zeros(len(df), dtype=int)
assign_treat_all  = np.ones(len(df),  dtype=int)
assign_iate_rule  = (iate_hat              > COST).astype(int)
assign_oracle     = (truth["tau"].values   > COST).astype(int)

policy = pd.DataFrame({
    "rule": [
        "Treat none",
        "Treat all",
        "IATE rule (treat where iate_hat > cost)",
        "Oracle (treat where true tau > cost)",
    ],
    "share_treated": [
        float(assign_treat_none.mean()),
        float(assign_treat_all.mean()),
        float(assign_iate_rule.mean()),
        float(assign_oracle.mean()),
    ],
    "avg_welfare": [
        welfare(assign_treat_none, truth["tau"].values, COST),
        welfare(assign_treat_all,  truth["tau"].values, COST),
        welfare(assign_iate_rule,  truth["tau"].values, COST),
        welfare(assign_oracle,     truth["tau"].values, COST),
    ],
    "cost_assumption_months": [COST] * 4,
})
policy.to_csv("policy_welfare.csv", index=False)
print(policy.to_string(index=False, float_format=lambda v: f"{v:7.3f}"))

fig, ax = plt.subplots(figsize=(9.5, 5.6))
pol_colors = [COLOR_GRAY, COLOR_BLUE, COLOR_TEAL, COLOR_ORANGE]
bars = ax.bar(np.arange(len(policy)), policy["avg_welfare"],
              color=pol_colors, edgecolor=COLOR_BLACK, width=0.6)
y_max_pol = float(max(policy["avg_welfare"].max(), 0.01))
ax.set_ylim(top=y_max_pol * 1.30)
for bar, val, sh in zip(bars, policy["avg_welfare"], policy["share_treated"]):
    h = bar.get_height()
    offset = y_max_pol * 0.04 if h >= 0 else -y_max_pol * 0.12
    ax.text(bar.get_x() + bar.get_width() / 2, h + offset,
            f"{val:.2f}\n({sh*100:.0f}% treated)",
            ha="center", va="bottom", fontsize=9, color=COLOR_BLACK)
ax.axhline(0, color=COLOR_BLACK, linewidth=0.8)
ax.set_xticks(np.arange(len(policy)))
ax.set_xticklabels(["Treat\nnone", "Treat\nall", "IATE\nrule", "Oracle"], fontsize=10)
ax.set_ylabel(f"Average net welfare per individual\n"
              f"(true effect minus cost = {COST:.0f} months)")
ax.set_title("Welfare under alternative training-assignment rules", pad=12)
plt.tight_layout()
plt.savefig("cml_policy_welfare.png", dpi=300, bbox_inches="tight")
plt.show()
plt.close()
print("Saved figure              : cml_policy_welfare.png")


# ── Step 9 — README + final summary ─────────────────────────────────
readme = """# Python CML Tutorial — Artifact Inventory

Topic: Causal Machine Learning (CML) for policy evaluation.
Dataset: synthetic Flanders-ALMP-style cohort (N = 5,000); true effects known.
Source paper: Lechner (2023); empirical illustration from Cockx, Lechner & Bollens (2023).

## Pipeline progress

- [x] Script (`script.py` + `execution_log.txt`)
- [ ] Results report (`results_report.md`)
- [ ] Blog post (`index.md`)
- [ ] Infographic (`infographic_instructions.md`)

## Figures

| File | Description |
|------|-------------|
| cml_overlap.png | Propensity-score overlap by treatment status |
| cml_gate_dutch.png | Estimated vs true GATE by Dutch proficiency |
| cml_iate_scatter.png | Estimated IATE vs true individual effect |
| cml_iate_distribution.png | Distribution of estimated IATEs by Dutch level |
| cml_method_comparison.png | Forest plot: Naive / DML / Causal Forest / Truth |
| cml_policy_welfare.png | Welfare under treat-none / treat-all / IATE / oracle |

## CSV tables

| File | Description |
|------|-------------|
| cml_data.csv | Observed columns of the synthetic cohort (X, D, Y) |
| cml_truth.csv | Hidden ground truth: Y0, Y1, individual effect tau, true propensity |
| true_parameters.csv | Analytic ATE and GATE-by-stratum |
| naive_estimate.csv | Naive difference-in-means ATE |
| dml_ate.csv | DoubleML ATE estimate with 95% CI |
| gate_by_dutch.csv | GATE estimate per Dutch-proficiency stratum |
| iate_estimates.csv | Causal Forest individual effects with 95% CIs |
| method_comparison.csv | Side-by-side comparison of methods vs truth |
| policy_welfare.csv | Welfare comparison across assignment rules |

## Packages used

- numpy, pandas, matplotlib, scikit-learn
- doubleml — `DoubleMLIRM`
- econml — `CausalForestDML`

The Modified Causal Forest (`mcf`) is the package used in the source case
study (Cockx et al. 2023). It is mentioned for reference only and is not a
runtime dependency of this tutorial.
"""
with open("README.md", "w") as f:
    f.write(readme)

print("\n" + "=" * 70)
print(" Summary")
print("=" * 70)
print(f"True ATE                                : {true_ate:.3f}")
print(f"Naive (DiM)                             : {naive_ate:.3f}  "
      f"(bias {naive_ate - true_ate:+.3f})")
print(f"DoubleML (IRM)                          : {ate_dml:.3f}  "
      f"(bias {ate_dml - true_ate:+.3f})")
print(f"CausalForestDML (mean of IATEs)         : {cf_mean:.3f}  "
      f"(bias {cf_mean - true_ate:+.3f})")
print(f"Best policy rule (welfare)              : "
      f"{policy.loc[policy['avg_welfare'].idxmax(), 'rule']}")
print(f"README.md written                       : yes")
print("\n=== Script completed successfully ===")
