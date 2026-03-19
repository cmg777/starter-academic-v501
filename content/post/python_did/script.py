"""
Introduction to Difference-in-Differences in Python

A tutorial on causal policy evaluation using the diff-diff package.
Covers the classic 2x2 DiD design, event studies, staggered adoption
with Callaway-Sant'Anna, Bacon decomposition diagnostics, and
HonestDiD sensitivity analysis.

Usage:
    python script.py          # local: saves PNGs to disk
    # In Google Colab: figures display inline AND save to disk

References:
    - https://diff-diff.readthedocs.io/en/stable/
    - Callaway & Sant'Anna (2021). J. of Econometrics.
    - Goodman-Bacon (2021). J. of Econometrics.
    - Rambachan & Roth (2023). Review of Economic Studies.
"""

import shutil
import subprocess
import sys

# ── Install diff-diff if not available (e.g., Google Colab) ──────────
try:
    import diff_diff
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "diff-diff"])

# ── Detect environment ───────────────────────────────────────────────
IN_COLAB = "google.colab" in sys.modules

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from diff_diff import (
    DifferenceInDifferences,
    MultiPeriodDiD,
    CallawaySantAnna,
    BaconDecomposition,
    HonestDiD,
    generate_did_data,
    generate_staggered_data,
    check_parallel_trends,
)

# ── Reproducibility ──────────────────────────────────────────────────
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# ── Site color palette ───────────────────────────────────────────────
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# ── Matplotlib defaults ─────────────────────────────────────────────
plt.rcParams.update({
    "font.size": 12,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "savefig.facecolor": "white",
})


# =====================================================================
# Section 5: Classic 2x2 DiD Design
# =====================================================================
print("=" * 70)
print("SECTION 5: Classic 2x2 DiD Design")
print("=" * 70)

# 5a. Generate data
data_2x2 = generate_did_data(
    n_units=100,
    n_periods=10,
    treatment_effect=5.0,
    treatment_period=5,
    treatment_fraction=0.5,
    seed=RANDOM_SEED,
)

print(f"Dataset shape: {data_2x2.shape}")
print(f"Columns: {data_2x2.columns.tolist()}")
print(f"\nTreatment groups:")
print(data_2x2.groupby("treated")["unit"].nunique().rename({0: "Control", 1: "Treated"}))
print(f"\nPeriods: {sorted(data_2x2['period'].unique())}")
print(f"Treatment period: 5 (post = 1 for periods >= 5)")
print(f"True treatment effect: 5.0")

# 5a-EDA. Explore the 2x2 dataset
print("\n--- Exploring the 2x2 dataset ---")
print("\nFirst 10 rows:")
print(data_2x2.head(10).to_string(index=False))

print("\nSummary statistics:")
print(data_2x2.describe().to_string())

print("\nCrosstab — observations by treatment group and period type:")
print(pd.crosstab(data_2x2["treated"], data_2x2["post"], margins=True))

print("\nOutcome summary by group × period:")
print(data_2x2.groupby(["treated", "post"])["outcome"].describe().to_string())

# Box plot: outcome distribution by treatment group and period type
fig, ax = plt.subplots(figsize=(9, 5))
groups = [
    ("Control, Pre",  data_2x2[(data_2x2["treated"] == 0) & (data_2x2["post"] == 0)]["outcome"]),
    ("Control, Post", data_2x2[(data_2x2["treated"] == 0) & (data_2x2["post"] == 1)]["outcome"]),
    ("Treated, Pre",  data_2x2[(data_2x2["treated"] == 1) & (data_2x2["post"] == 0)]["outcome"]),
    ("Treated, Post", data_2x2[(data_2x2["treated"] == 1) & (data_2x2["post"] == 1)]["outcome"]),
]
bp = ax.boxplot(
    [g[1] for g in groups],
    tick_labels=[g[0] for g in groups],
    patch_artist=True,
    widths=0.5,
    medianprops=dict(color=NEAR_BLACK, linewidth=2),
)
box_colors = [STEEL_BLUE, STEEL_BLUE, WARM_ORANGE, WARM_ORANGE]
for patch, color in zip(bp["boxes"], box_colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.6)
ax.set_ylabel("Outcome")
ax.set_title("Outcome Distribution by Treatment Group and Period")
plt.savefig("did_outcome_distribution.png", dpi=300, bbox_inches="tight")
if IN_COLAB:
    plt.show()
plt.close()
print("\nFigure saved: did_outcome_distribution.png")

# 5b. Parallel trends visualization
treated_means = data_2x2[data_2x2["treated"] == 1].groupby("period")["outcome"].mean()
control_means = data_2x2[data_2x2["treated"] == 0].groupby("period")["outcome"].mean()

fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(control_means.index, control_means.values, "o-",
        color=STEEL_BLUE, linewidth=2, markersize=7, label="Control group")
ax.plot(treated_means.index, treated_means.values, "s-",
        color=WARM_ORANGE, linewidth=2, markersize=7, label="Treated group")
ax.axvline(x=4.5, color=NEAR_BLACK, linestyle="--", linewidth=1.5,
           alpha=0.7, label="Treatment onset")
ax.set_xlabel("Period")
ax.set_ylabel("Average Outcome")
ax.set_title("Parallel Trends: Treatment vs Control Groups")
ax.legend(loc="upper left")
ax.set_xticks(range(10))
plt.savefig("did_parallel_trends.png", dpi=300, bbox_inches="tight")
if IN_COLAB:
    plt.show()
plt.close()
print("\nFigure saved: did_parallel_trends.png")

# 5c. Fit classic 2x2 DiD
did = DifferenceInDifferences()
results_2x2 = did.fit(data_2x2, outcome="outcome", treatment="treated", time="post")
results_2x2.print_summary()

# 5d. Counterfactual visualization
fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(control_means.index, control_means.values, "o-",
        color=STEEL_BLUE, linewidth=2, markersize=7, label="Control group")
ax.plot(treated_means.index, treated_means.values, "s-",
        color=WARM_ORANGE, linewidth=2, markersize=7, label="Treated group")

# Counterfactual: treated group without treatment
pre_diff = treated_means.loc[:4].mean() - control_means.loc[:4].mean()
counterfactual = control_means.loc[5:] + pre_diff
ax.plot(counterfactual.index, counterfactual.values, "s--",
        color=TEAL, linewidth=2, markersize=7, label="Counterfactual (no treatment)")
ax.fill_between(counterfactual.index, counterfactual.values,
                treated_means.loc[5:].values, alpha=0.2, color=TEAL,
                label=f"Treatment effect (ATT ≈ {results_2x2.att:.1f})")
ax.axvline(x=4.5, color=NEAR_BLACK, linestyle="--", linewidth=1.5, alpha=0.7)
ax.set_xlabel("Period")
ax.set_ylabel("Average Outcome")
ax.set_title("DiD Treatment Effect: Observed vs Counterfactual")
ax.legend(loc="upper left")
ax.set_xticks(range(10))
plt.savefig("did_treatment_effect.png", dpi=300, bbox_inches="tight")
if IN_COLAB:
    plt.show()
plt.close()
print("\nFigure saved: did_treatment_effect.png")


# =====================================================================
# Section 6: Testing Parallel Trends
# =====================================================================
print("\n" + "=" * 70)
print("SECTION 6: Testing Parallel Trends")
print("=" * 70)

pt_result = check_parallel_trends(
    data_2x2,
    outcome="outcome",
    time="period",
    treatment_group="treated",
    pre_periods=[0, 1, 2, 3, 4],
)

print(f"Treated group pre-trend slope:  {pt_result['treated_trend']:.4f} (SE = {pt_result['treated_trend_se']:.4f})")
print(f"Control group pre-trend slope:  {pt_result['control_trend']:.4f} (SE = {pt_result['control_trend_se']:.4f})")
print(f"Trend difference:               {pt_result['trend_difference']:.4f} (SE = {pt_result['trend_difference_se']:.4f})")
print(f"t-statistic:                    {pt_result['t_statistic']:.4f}")
print(f"p-value:                        {pt_result['p_value']:.4f}")
print(f"Parallel trends plausible:      {pt_result['parallel_trends_plausible']}")


# =====================================================================
# Section 7: Event Study
# =====================================================================
print("\n" + "=" * 70)
print("SECTION 7: Event Study")
print("=" * 70)

event = MultiPeriodDiD()
results_event = event.fit(
    data_2x2,
    outcome="outcome",
    treatment="treated",
    time="period",
    post_periods=[5, 6, 7, 8, 9],
    reference_period=4,
)
results_event.print_summary()

# Event study plot
es_df = results_event.to_dataframe()

fig, ax = plt.subplots(figsize=(9, 5))
pre = es_df[~es_df["is_post"]]
post = es_df[es_df["is_post"]]

ax.errorbar(pre["period"], pre["effect"], yerr=1.96 * pre["se"],
            fmt="o", color=STEEL_BLUE, capsize=4, linewidth=2,
            markersize=8, label="Pre-treatment")
ax.errorbar(post["period"], post["effect"], yerr=1.96 * post["se"],
            fmt="s", color=WARM_ORANGE, capsize=4, linewidth=2,
            markersize=8, label="Post-treatment")

# Reference period
ax.plot(4, 0, "D", color=NEAR_BLACK, markersize=10, zorder=5,
        label="Reference period")

ax.axhline(y=0, color=NEAR_BLACK, linewidth=1, alpha=0.5)
ax.axvline(x=4.5, color=NEAR_BLACK, linestyle="--", linewidth=1.5, alpha=0.5)
ax.axhline(y=5.0, color=TEAL, linestyle=":", linewidth=1.5, alpha=0.7,
           label="True effect (5.0)")
ax.set_xlabel("Period")
ax.set_ylabel("Estimated Effect")
ax.set_title("Event Study: Dynamic Treatment Effects")
ax.legend(loc="upper left")
ax.set_xticks(range(10))
plt.savefig("did_event_study.png", dpi=300, bbox_inches="tight")
if IN_COLAB:
    plt.show()
plt.close()
print("\nFigure saved: did_event_study.png")


# =====================================================================
# Section 8: Staggered Adoption and Bacon Decomposition
# =====================================================================
print("\n" + "=" * 70)
print("SECTION 8: Staggered Adoption and Bacon Decomposition")
print("=" * 70)

data_stag = generate_staggered_data(
    n_units=300,
    n_periods=10,
    seed=RANDOM_SEED,
)

print(f"Dataset shape: {data_stag.shape}")
print(f"Columns: {data_stag.columns.tolist()}")
cohorts = data_stag.groupby("first_treat")["unit"].nunique()
print(f"\nCohort sizes:")
for ft, n in cohorts.items():
    label = "Never-treated" if ft == 0 else f"First treated in period {ft}"
    print(f"  {label}: {n} units")
print(f"\nTotal units: {cohorts.sum()}")

# 8a-EDA. Explore the staggered dataset
print("\n--- Exploring the staggered dataset ---")
print("\nFirst 10 rows:")
print(data_stag.head(10).to_string(index=False))

print("\nSummary statistics:")
print(data_stag.describe().to_string())

print("\nCrosstab — units by cohort × period:")
print(pd.crosstab(data_stag["first_treat"], data_stag["period"]))

print("\nMean outcome by cohort × period:")
print(data_stag.groupby(["first_treat", "period"])["outcome"].mean().unstack().to_string(float_format="%.2f"))

# Line plot: cohort mean outcomes over time
cohort_means = data_stag.groupby(["first_treat", "period"])["outcome"].mean().unstack(level=0)
cohort_colors = {0: STEEL_BLUE, 3: WARM_ORANGE, 5: TEAL, 7: NEAR_BLACK}
cohort_labels = {0: "Never-treated", 3: "Cohort 3", 5: "Cohort 5", 7: "Cohort 7"}

fig, ax = plt.subplots(figsize=(9, 5))
for ft in sorted(cohort_means.columns):
    ax.plot(cohort_means.index, cohort_means[ft], "o-",
            color=cohort_colors[ft], linewidth=2, markersize=6,
            label=cohort_labels[ft])
# Vertical lines at treatment onsets
for ft in [3, 5, 7]:
    ax.axvline(x=ft - 0.5, color=cohort_colors[ft], linestyle="--",
               linewidth=1.2, alpha=0.5)
ax.set_xlabel("Period")
ax.set_ylabel("Mean Outcome")
ax.set_title("Staggered Adoption: Cohort Mean Outcomes Over Time")
ax.legend(loc="upper left")
ax.set_xticks(range(10))
plt.savefig("did_staggered_trends.png", dpi=300, bbox_inches="tight")
if IN_COLAB:
    plt.show()
plt.close()
print("\nFigure saved: did_staggered_trends.png")

# Bacon decomposition
bacon = BaconDecomposition()
bacon_results = bacon.fit(
    data_stag, outcome="outcome", unit="unit",
    time="period", first_treat="first_treat",
)
bacon_results.print_summary()

# Bacon decomposition plot
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Left: scatter by comparison type
bacon_df = bacon_results.to_dataframe()
type_colors = {
    "Treated vs Never-treated": STEEL_BLUE,
    "Earlier vs Later treated": WARM_ORANGE,
    "Later vs Earlier (forbidden)": "#c4623d",
}
for comp_type in bacon_df["comparison_type"].unique():
    subset = bacon_df[bacon_df["comparison_type"] == comp_type]
    color = type_colors.get(comp_type, NEAR_BLACK)
    axes[0].scatter(subset["weight"], subset["estimate"],
                    s=80, color=color, alpha=0.7, edgecolors="white",
                    label=comp_type)
axes[0].axhline(y=bacon_results.twfe_estimate, color=NEAR_BLACK,
                linestyle="--", linewidth=1.5, alpha=0.7,
                label=f"TWFE = {bacon_results.twfe_estimate:.2f}")
axes[0].set_xlabel("Weight")
axes[0].set_ylabel("2×2 DiD Estimate")
axes[0].set_title("Bacon Decomposition: Individual Comparisons")
axes[0].legend(fontsize=9, loc="lower right")

# Right: bar chart of weights by type
type_summary = bacon_df.groupby("comparison_type").agg(
    weight=("weight", "sum"),
    avg_effect=("estimate", lambda x: np.average(x, weights=bacon_df.loc[x.index, "weight"])),
).reset_index()
bar_colors = [type_colors.get(t, NEAR_BLACK) for t in type_summary["comparison_type"]]
bars = axes[1].barh(range(len(type_summary)), type_summary["weight"],
                    color=bar_colors, edgecolor="white", height=0.6)
axes[1].set_yticks(range(len(type_summary)))
axes[1].set_yticklabels(type_summary["comparison_type"], fontsize=10)
axes[1].set_xlabel("Total Weight")
axes[1].set_title("Weight Distribution by Comparison Type")

# Add weight labels
for i, (w, e) in enumerate(zip(type_summary["weight"], type_summary["avg_effect"])):
    axes[1].text(w + 0.01, i, f"{w:.1%} (avg = {e:.2f})", va="center", fontsize=10)

plt.tight_layout()
plt.savefig("did_bacon_decomposition.png", dpi=300, bbox_inches="tight")
if IN_COLAB:
    plt.show()
plt.close()
print("\nFigure saved: did_bacon_decomposition.png")


# =====================================================================
# Section 9: Callaway-Sant'Anna
# =====================================================================
print("\n" + "=" * 70)
print("SECTION 9: Callaway-Sant'Anna")
print("=" * 70)

cs = CallawaySantAnna(control_group="never_treated")
results_cs = cs.fit(
    data_stag, outcome="outcome", unit="unit",
    time="period", first_treat="first_treat",
    aggregate="event_study",
)
results_cs.print_summary()

# CS event study plot
cs_df = results_cs.to_dataframe("event_study")

fig, ax = plt.subplots(figsize=(9, 5))
pre_cs = cs_df[cs_df["relative_period"] < 0]
post_cs = cs_df[cs_df["relative_period"] >= 0]

ax.errorbar(pre_cs["relative_period"], pre_cs["effect"],
            yerr=1.96 * pre_cs["se"], fmt="o", color=STEEL_BLUE,
            capsize=4, linewidth=2, markersize=8, label="Pre-treatment")
ax.errorbar(post_cs["relative_period"], post_cs["effect"],
            yerr=1.96 * post_cs["se"], fmt="s", color=TEAL,
            capsize=4, linewidth=2, markersize=8, label="Post-treatment")

ax.axhline(y=0, color=NEAR_BLACK, linewidth=1, alpha=0.5)
ax.axvline(x=-0.5, color=NEAR_BLACK, linestyle="--", linewidth=1.5, alpha=0.5)
ax.set_xlabel("Periods Relative to Treatment")
ax.set_ylabel("Estimated ATT")
ax.set_title("Callaway-Sant'Anna: Event Study for Staggered Adoption")
ax.legend(loc="upper left")
plt.savefig("did_staggered_att.png", dpi=300, bbox_inches="tight")
if IN_COLAB:
    plt.show()
plt.close()
print("\nFigure saved: did_staggered_att.png")


# =====================================================================
# Section 11: HonestDiD Sensitivity Analysis
# =====================================================================
print("\n" + "=" * 70)
print("SECTION 11: HonestDiD Sensitivity Analysis")
print("=" * 70)

M_values = [0.0, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 7.0, 10.0, 12.0, 15.0]
sensitivity = []
for M in M_values:
    honest = HonestDiD(method="relative_magnitude", M=M)
    hres = honest.fit(results_cs)
    sensitivity.append({
        "M": M,
        "ci_lb": hres.ci_lb,
        "ci_ub": hres.ci_ub,
        "significant": hres.ci_lb > 0,
    })
    print(f"M = {M:.1f}: CI = [{hres.ci_lb:.4f}, {hres.ci_ub:.4f}]"
          f"  {'significant' if hres.ci_lb > 0 else 'includes zero'}")

sens_df = pd.DataFrame(sensitivity)

# Find breakdown point
breakdown_M = sens_df[~sens_df["significant"]]["M"].min() if not sens_df["significant"].all() else sens_df["M"].max()
print(f"\nBreakdown value of M: {breakdown_M:.1f}")
print(f"(Effect remains significant for M < {breakdown_M:.1f})")

# Sensitivity plot
fig, ax = plt.subplots(figsize=(9, 5))
ax.fill_between(sens_df["M"], sens_df["ci_lb"], sens_df["ci_ub"],
                alpha=0.25, color=STEEL_BLUE, label="95% Robust CI")
ax.plot(sens_df["M"], sens_df["ci_lb"], "-", color=STEEL_BLUE,
        linewidth=2)
ax.plot(sens_df["M"], sens_df["ci_ub"], "-", color=STEEL_BLUE,
        linewidth=2)
ax.axhline(y=0, color=NEAR_BLACK, linewidth=1.5, alpha=0.7)

# Mark the overall ATT
att_val = results_cs.overall_att
ax.axhline(y=att_val, color=TEAL, linestyle=":", linewidth=1.5,
           alpha=0.7, label=f"Overall ATT = {att_val:.2f}")

# Mark breakdown point if it exists within range
if breakdown_M <= sens_df["M"].max():
    ax.axvline(x=breakdown_M, color=WARM_ORANGE, linestyle="--",
               linewidth=2, alpha=0.8, label=f"Breakdown (M = {breakdown_M:.1f})")

ax.set_xlabel("Sensitivity Parameter M\n(maximum post-treatment violation relative to largest pre-treatment violation)")
ax.set_ylabel("Treatment Effect (ATT)")
ax.set_title("HonestDiD Sensitivity Analysis: Robustness of the ATT")
ax.legend(loc="upper left")
plt.savefig("did_honest_sensitivity.png", dpi=300, bbox_inches="tight")
if IN_COLAB:
    plt.show()
plt.close()
print("\nFigure saved: did_honest_sensitivity.png")


# =====================================================================
# Copy featured image
# =====================================================================
shutil.copy("did_treatment_effect.png", "featured.png")
print("\nFigure saved: featured.png (copy of did_treatment_effect.png)")

print("\n" + "=" * 70)
print("All figures generated successfully.")
print("=" * 70)
