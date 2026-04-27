"""
Introduction to Difference-in-Differences (DiD) in Python

This script demonstrates DiD estimation using PyFixest and Great Tables.
Case study: after-school tutoring program in 10 of 35 high schools.

Datasets:
    - tutoring_did.dta      (35 schools × 2 periods, 2×2 design)
    - tutoring_didevent.dta  (35 schools × 8 periods, event study)

Usage:
    python script.py

References:
    - Corral & Yang (2024). Asia Pacific Education Review.
    - https://pyfixest.org/
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import pyfixest as pf
from great_tables import GT, md, style, loc

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

SAVE_KWARGS = dict(dpi=300, bbox_inches="tight", facecolor=DARK_NAVY,
                   edgecolor=DARK_NAVY, pad_inches=0)

# ── Section 3: Data Loading and Exploration ─────────────────────────────────

print("=" * 60)
print("SECTION 3: Data Loading and Exploration")
print("=" * 60)

url_did = "https://github.com/quarcs-lab/data-open/raw/master/isds/tutoring_did.dta"
df = pd.read_stata(url_did).astype(float)

print(f"\nShape: {df.shape}")
print(f"\nColumn types:\n{df.dtypes}")
print(f"\nDescriptive statistics:\n{df.describe().round(2)}")
print(f"\nFirst 5 rows:\n{df.head()}")

# Crosstab: treatment × time
ct = pd.crosstab(df["treated"], df["post"], margins=True)
ct.index = ["Comparison (0)", "Treated (1)", "Total"]
ct.columns = ["Pre (0)", "Post (1)", "Total"]
print(f"\nCrosstab (treated × post):\n{ct}")

# Figure 1: Panel view heatmap
fig, ax = plt.subplots(figsize=(10, 7))
schools = sorted(df["id"].unique())
times = sorted(df["time"].unique())

for i, school in enumerate(schools):
    for j, t in enumerate(times):
        row = df[(df["id"] == school) & (df["time"] == t)]
        if len(row) > 0:
            is_treated = row["treated"].values[0] == 1
            is_post = row["post"].values[0] == 1
            if is_treated and is_post:
                color = WARM_ORANGE
            elif is_treated:
                color = "#e8956a"  # lighter orange for treated-pre
            else:
                color = STEEL_BLUE
            ax.add_patch(plt.Rectangle((j - 0.4, i - 0.4), 0.8, 0.8,
                                       facecolor=color, edgecolor=DARK_NAVY,
                                       linewidth=0.5))

ax.set_xlim(-0.5, len(times) - 0.5)
ax.set_ylim(-0.5, len(schools) - 0.5)
ax.set_xticks(range(len(times)))
ax.set_xticklabels([f"Period {int(t)}" for t in times], fontsize=11)
ax.set_yticks(range(0, len(schools), 5))
ax.set_yticklabels([f"School {schools[i]:.0f}" for i in range(0, len(schools), 5)],
                   fontsize=10)
ax.set_xlabel("Time Period", fontsize=12)
ax.set_ylabel("School ID", fontsize=12)
ax.set_title("Panel Structure: 2×2 DiD Design", fontsize=14, fontweight="bold",
             pad=12)

legend_patches = [
    mpatches.Patch(facecolor=STEEL_BLUE, label="Comparison group"),
    mpatches.Patch(facecolor="#e8956a", label="Treated (pre-program)"),
    mpatches.Patch(facecolor=WARM_ORANGE, label="Treated (post-program)"),
]
ax.legend(handles=legend_patches, loc="lower center", bbox_to_anchor=(0.5, -0.12),
          ncol=3, fontsize=10)
ax.invert_yaxis()
plt.tight_layout()
plt.savefig("did101_panelview.png", **SAVE_KWARGS)
plt.close()
print("\nSaved: did101_panelview.png")


# ── Section 4: The Problem with Naive Comparisons ──────────────────────────

print("\n" + "=" * 60)
print("SECTION 4: The Problem with Naive Comparisons")
print("=" * 60)

treated_means = df[df["treated"] == 1].groupby("post")["gpa"].mean()
print(f"\nTreated group means:")
print(f"  Pre-program (post=0):  {treated_means[0]:.2f}")
print(f"  Post-program (post=1): {treated_means[1]:.2f}")
print(f"  Naive change:          {treated_means[1] - treated_means[0]:.2f}")

# Figure 2: Interrupted time series (treated only)
fig, ax = plt.subplots(figsize=(9, 5))
ax.plot([0, 1], [treated_means[0], treated_means[1]], color=WARM_ORANGE,
        marker="o", markersize=10, linewidth=2.5, label="Treated group", zorder=5)
ax.axvline(x=0.5, color="#ff6b6b", linestyle="--", linewidth=1.5, alpha=0.7,
           label="Program starts")
ax.annotate(f"{treated_means[0]:.2f}", (0, treated_means[0]),
            textcoords="offset points", xytext=(-15, 12), fontsize=12,
            color=WARM_ORANGE, fontweight="bold")
ax.annotate(f"{treated_means[1]:.2f}", (1, treated_means[1]),
            textcoords="offset points", xytext=(10, -12), fontsize=12,
            color=WARM_ORANGE, fontweight="bold")
ax.annotate(f"Naive change = {treated_means[1] - treated_means[0]:.2f}",
            xy=(0.35, 96), fontsize=12, color="#ff6b6b", ha="center",
            bbox=dict(boxstyle="round,pad=0.3", facecolor=DARK_NAVY,
                      edgecolor="#ff6b6b", alpha=0.9), zorder=10)
ax.set_xticks([0, 1])
ax.set_xticklabels(["Pre-Program", "Post-Program"], fontsize=12)
ax.set_ylabel("Average GPA", fontsize=12)
ax.set_title("Naive Before-After Comparison (Treated Group Only)",
             fontsize=14, fontweight="bold", pad=12)
ax.legend(loc="lower right", fontsize=11)
ax.set_ylim(50, 105)
plt.tight_layout()
plt.savefig("did101_its.png", **SAVE_KWARGS)
plt.close()
print("Saved: did101_its.png")


# ── Section 5: The DiD Design ──────────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 5: The DiD Design")
print("=" * 60)

means = df.groupby(["treated", "post"])["gpa"].mean()
# Round group means to 2dp for consistent manual arithmetic
pre_control = round(means[(0, 0)], 2)
post_control = round(means[(0, 1)], 2)
pre_treated = round(means[(1, 0)], 2)
post_treated = round(means[(1, 1)], 2)

print(f"\nGroup means:")
print(f"  Comparison Pre:  {pre_control:.2f}")
print(f"  Comparison Post: {post_control:.2f}")
print(f"  Treated Pre:     {pre_treated:.2f}")
print(f"  Treated Post:    {post_treated:.2f}")

counterfactual = pre_treated + (post_control - pre_control)
did_manual = post_treated - counterfactual
print(f"\nCounterfactual: {pre_treated:.2f} + ({post_control:.2f} - {pre_control:.2f}) = {counterfactual:.2f}")
print(f"DiD estimate:   {post_treated:.2f} - {counterfactual:.2f} = {did_manual:.2f}")

# Figure 3: Counterfactual plot
fig, ax = plt.subplots(figsize=(11, 6))

# Comparison group
ax.plot([0, 1], [pre_control, post_control], color=STEEL_BLUE, marker="o",
        markersize=10, linewidth=2.5, label="Comparison group", zorder=5)
# Treated group
ax.plot([0, 1], [pre_treated, post_treated], color=WARM_ORANGE, marker="o",
        markersize=10, linewidth=2.5, label="Treated group", zorder=5)
# Counterfactual
ax.plot([0, 1], [pre_treated, counterfactual], color=TEAL, marker="D",
        markersize=8, linewidth=2, linestyle="--", label="Counterfactual", zorder=4)

# DiD gap annotation
mid_y = (post_treated + counterfactual) / 2
ax.annotate("", xy=(1.08, post_treated), xytext=(1.08, counterfactual),
            arrowprops=dict(arrowstyle="<->", color=TEAL, lw=2))
ax.text(1.16, mid_y, f"DiD = {did_manual:.2f}", fontsize=13, color=TEAL,
        fontweight="bold", va="center")

# Value labels — position each carefully to avoid overlaps
ax.annotate(f"{pre_control:.2f}", (0, pre_control), textcoords="offset points",
            xytext=(-40, -5), fontsize=11, color=WHITE_TEXT, fontweight="bold")
ax.annotate(f"{post_control:.2f}", (1, post_control), textcoords="offset points",
            xytext=(-45, 5), fontsize=11, color=WHITE_TEXT, fontweight="bold")
ax.annotate(f"{pre_treated:.2f}", (0, pre_treated), textcoords="offset points",
            xytext=(-40, -15), fontsize=11, color=WHITE_TEXT, fontweight="bold")
ax.annotate(f"{post_treated:.2f}", (1, post_treated), textcoords="offset points",
            xytext=(12, 5), fontsize=11, color=WHITE_TEXT, fontweight="bold")
ax.annotate(f"{counterfactual:.2f}", (1, counterfactual), textcoords="offset points",
            xytext=(12, -12), fontsize=11, color=TEAL, fontweight="bold")

ax.set_xticks([0, 1])
ax.set_xticklabels(["Pre-Program", "Post-Program"], fontsize=12)
ax.set_ylabel("Average GPA", fontsize=12)
ax.set_title("Difference-in-Differences: Identifying the Causal Effect",
             fontsize=14, fontweight="bold", pad=12)
ax.legend(loc="upper left", fontsize=11)
ax.set_ylim(50, 105)
ax.set_xlim(-0.15, 1.45)
plt.tight_layout()
plt.savefig("did101_counterfactual.png", **SAVE_KWARGS)
plt.close()
print("Saved: did101_counterfactual.png")


# ── Section 6: Manual DiD Calculation ──────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 6: Manual DiD Calculation")
print("=" * 60)

means_table = df.groupby(["treated", "post"])["gpa"].mean().round(2).unstack()
means_table.index = ["Comparison (0)", "Treated (1)"]
means_table.columns = ["Pre (0)", "Post (1)"]
means_table["Difference"] = means_table["Post (1)"] - means_table["Pre (0)"]
print(f"\n2×2 Means Table:\n{means_table}")

did_calc = (post_treated - pre_treated) - (post_control - pre_control)
print(f"\nDiD = ({post_treated:.2f} - {pre_treated:.2f}) - ({post_control:.2f} - {pre_control:.2f})")
print(f"    = {post_treated - pre_treated:.2f} - {post_control - pre_control:.2f}")
print(f"    = {did_calc:.2f}")

# Figure 4: Annotated difference plot — redesigned for clarity
fig, ax = plt.subplots(figsize=(12, 7))

# Lines
ax.plot([0, 1], [pre_control, post_control], color=STEEL_BLUE, marker="o",
        markersize=10, linewidth=2.5, label="Comparison", zorder=5)
ax.plot([0, 1], [pre_treated, post_treated], color=WARM_ORANGE, marker="o",
        markersize=10, linewidth=2.5, label="Treated", zorder=5)
ax.plot([0, 1], [pre_treated, counterfactual], color=TEAL, marker="D",
        markersize=8, linewidth=2, linestyle="--", label="Counterfactual", zorder=4)

# Comparison change arrow — far left, outside the data lines
ax.annotate("", xy=(-0.08, post_control), xytext=(-0.08, pre_control),
            arrowprops=dict(arrowstyle="<->", color=STEEL_BLUE, lw=1.5))
ax.text(-0.13, (post_control + pre_control) / 2,
        f"Δ Comparison\n= {post_control - pre_control:.2f}",
        fontsize=10, color=STEEL_BLUE, ha="right", va="center")

# Treated change arrow — far right of data area
ax.annotate("", xy=(1.12, post_treated), xytext=(1.12, pre_treated),
            arrowprops=dict(arrowstyle="<->", color=WARM_ORANGE, lw=1.5))
ax.text(1.18, (post_treated + pre_treated) / 2,
        f"Δ Treated\n= {post_treated - pre_treated:.2f}",
        fontsize=10, color=WARM_ORANGE, ha="left", va="center")

# DiD arrow — furthest right
mid_y_did = (post_treated + counterfactual) / 2
ax.annotate("", xy=(1.35, post_treated), xytext=(1.35, counterfactual),
            arrowprops=dict(arrowstyle="<->", color=TEAL, lw=2.5))
ax.text(1.41, mid_y_did, f"DiD\n= {did_calc:.2f}",
        fontsize=13, color=TEAL, fontweight="bold", va="center")

# Value labels — positioned to avoid overlaps
ax.annotate(f"{pre_control:.2f}", (0, pre_control), textcoords="offset points",
            xytext=(8, 8), fontsize=11, color=WHITE_TEXT, fontweight="bold")
ax.annotate(f"{post_control:.2f}", (1, post_control), textcoords="offset points",
            xytext=(8, 8), fontsize=11, color=WHITE_TEXT, fontweight="bold")
ax.annotate(f"{pre_treated:.2f}", (0, pre_treated), textcoords="offset points",
            xytext=(8, -15), fontsize=11, color=WHITE_TEXT, fontweight="bold")
ax.annotate(f"{post_treated:.2f}", (1, post_treated), textcoords="offset points",
            xytext=(8, 8), fontsize=11, color=WHITE_TEXT, fontweight="bold")

ax.set_xticks([0, 1])
ax.set_xticklabels(["Pre-Program", "Post-Program"], fontsize=12)
ax.set_ylabel("Average GPA", fontsize=12)
ax.set_title("Manual DiD: Double-Difference Calculation",
             fontsize=14, fontweight="bold", pad=12)
ax.legend(loc="lower center", bbox_to_anchor=(0.4, -0.12), ncol=3, fontsize=11)
ax.set_ylim(48, 105)
ax.set_xlim(-0.25, 1.55)
plt.tight_layout()
plt.savefig("did101_diff_plot.png", **SAVE_KWARGS)
plt.close()
print("Saved: did101_diff_plot.png")


# ── Section 7: DiD via Regression ──────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 7: DiD via Regression")
print("=" * 60)

# 7.1: Classical OLS interaction
print("\n--- 7.1: Classical OLS with Interaction ---")
fit_ols = pf.feols("gpa ~ treated + post + txp", data=df, vcov="HC1")
print(fit_ols.summary())

# 7.2: TWFE with fixed effects
print("\n--- 7.2: TWFE with Unit and Time Fixed Effects ---")
fit_twfe = pf.feols("gpa ~ txp | id + time", data=df, vcov={"CRV1": "id"})
print(fit_twfe.summary())

# 7.3: TWFE with covariate
print("\n--- 7.3: TWFE with Covariate (female_share) ---")
fit_cov = pf.feols("gpa ~ txp + female_share | id + time", data=df,
                    vcov={"CRV1": "id"})
print(fit_cov.summary())

# 7.4: Programmatic access to results
print("\n--- 7.4: Programmatic Access to Results ---")
print(f"Coefficients:\n{fit_twfe.coef()}")
print(f"\nStandard errors:\n{fit_twfe.se()}")
print(f"\nt-statistics:\n{fit_twfe.tstat()}")
print(f"\np-values:\n{fit_twfe.pvalue()}")
print(f"\nConfidence intervals:\n{fit_twfe.confint()}")
print(f"\nTidy DataFrame:\n{fit_twfe.tidy()}")

# 7.5: Comparison table
print("\n--- 7.5: Comparison of Three Specifications ---")
specs = {
    "OLS/HC1": fit_ols,
    "TWFE/CRV1": fit_twfe,
    "TWFE+cov/CRV1": fit_cov,
}
for name, fit in specs.items():
    tidy = fit.tidy()
    txp_row = tidy[tidy.index == "txp"].iloc[0]
    print(f"  {name:18s}: β = {txp_row['Estimate']:.4f}, "
          f"SE = {txp_row['Std. Error']:.4f}, "
          f"95% CI = [{txp_row['2.5%']:.2f}, {txp_row['97.5%']:.2f}]")


# ── Section 8: Inference Comparison ────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 8: Inference Comparison")
print("=" * 60)

vcov_types = {
    "iid": "iid",
    "HC1": "HC1",
    "CRV1": {"CRV1": "id"},
    "CRV3": {"CRV3": "id"},
}

se_results = {}
for label, vcov_spec in vcov_types.items():
    fit_tmp = pf.feols("gpa ~ txp | id + time", data=df, vcov=vcov_spec)
    tidy = fit_tmp.tidy()
    txp_row = tidy[tidy.index == "txp"].iloc[0]
    se_results[label] = {
        "estimate": txp_row["Estimate"],
        "se": txp_row["Std. Error"],
        "tstat": txp_row["t value"],
        "pvalue": txp_row["Pr(>|t|)"],
    }
    print(f"  {label:5s}: SE = {txp_row['Std. Error']:.4f}, "
          f"t = {txp_row['t value']:.2f}, "
          f"p = {txp_row['Pr(>|t|)']:.4f}")

# Figure 5: SE comparison bar chart
fig, ax = plt.subplots(figsize=(9, 5))
labels = list(se_results.keys())
ses = [se_results[l]["se"] for l in labels]
colors = [STEEL_BLUE, WARM_ORANGE, TEAL, "#e8956a"]
bars = ax.barh(labels, ses, color=colors, height=0.45, edgecolor=DARK_NAVY)
for bar, se_val in zip(bars, ses):
    ax.text(bar.get_width() + 0.015, bar.get_y() + bar.get_height() / 2,
            f"{se_val:.4f}", va="center", fontsize=12, color=WHITE_TEXT,
            fontweight="bold")
ax.set_xlabel("Standard Error of DiD Estimate (txp)", fontsize=12)
ax.set_title("Standard Errors Across Inference Methods",
             fontsize=14, fontweight="bold", pad=12)
ax.set_xlim(0, max(ses) * 1.4)
plt.tight_layout()
plt.savefig("did101_se_comparison.png", **SAVE_KWARGS)
plt.close()
print("Saved: did101_se_comparison.png")


# ── Section 9: Publication-Quality Tables ──────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 9: Publication-Quality Tables")
print("=" * 60)

# 9.1: Stepwise specifications with csw0()
print("\n--- 9.1: Stepwise Specifications with csw0() ---")
fit_multi = pf.feols("gpa ~ txp + csw0(female_share) | id + time", data=df,
                     vcov={"CRV1": "id"})
models_list = fit_multi.to_list()
print(f"Number of models: {len(models_list)}")
for i, f in enumerate(models_list):
    print(f"\nModel {i+1}:")
    print(f.summary())

# 9.2: etable() output
print("\n--- 9.2: etable() Output ---")
etable_result = fit_multi.etable()
print(etable_result)

# 9.3: Custom Great Tables table
print("\n--- 9.3: Building Great Tables Table ---")
rows = []
for i, (name, fit) in enumerate(
    [("(1) OLS", fit_ols), ("(2) TWFE", fit_twfe), ("(3) TWFE + Cov", fit_cov)],
    start=1
):
    tidy = fit.tidy()
    txp_row = tidy[tidy.index == "txp"].iloc[0]
    rows.append({
        "Model": name,
        "Estimate": txp_row["Estimate"],
        "Std. Error": txp_row["Std. Error"],
        "t value": txp_row["t value"],
        "p-value": txp_row["Pr(>|t|)"],
        "95% CI Lower": txp_row["2.5%"],
        "95% CI Upper": txp_row["97.5%"],
        "N": fit._N,
    })

gt_df = pd.DataFrame(rows)
gt_table = (
    GT(gt_df)
    .tab_header(
        title=md("**Table 2: DiD Estimates Across Specifications**"),
        subtitle="Dependent variable: GPA"
    )
    .fmt_number(columns=["Estimate", "Std. Error", "t value",
                         "95% CI Lower", "95% CI Upper"], decimals=3)
    .fmt_number(columns=["p-value"], decimals=4)
    .fmt_integer(columns=["N"])
    .cols_label(
        **{"95% CI Lower": "CI Lower", "95% CI Upper": "CI Upper"}
    )
    .tab_source_note(
        "Notes: (1) OLS with HC1 robust SE. (2) TWFE with CRV1 clustered at school level. "
        "(3) TWFE with female_share covariate and CRV1."
    )
    .tab_style(
        style=style.text(weight="bold"),
        locations=loc.body(columns="Estimate")
    )
)
gt_table.save("did101_table2.png")
print("Saved: did101_table2.png")


# ── Section 10: Coefficient Comparison ─────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 10: Coefficient Comparison")
print("=" * 60)

fig, ax = plt.subplots(figsize=(9, 5))
model_names = ["(1) OLS\nHC1", "(2) TWFE\nCRV1", "(3) TWFE+Cov\nCRV1"]
estimates = []
ci_lower = []
ci_upper = []
for fit in [fit_ols, fit_twfe, fit_cov]:
    tidy = fit.tidy()
    txp_row = tidy[tidy.index == "txp"].iloc[0]
    estimates.append(txp_row["Estimate"])
    ci_lower.append(txp_row["2.5%"])
    ci_upper.append(txp_row["97.5%"])

estimates = np.array(estimates)
ci_lower = np.array(ci_lower)
ci_upper = np.array(ci_upper)
errors_lower = estimates - ci_lower
errors_upper = ci_upper - estimates
y_pos = np.arange(len(model_names))

ax.errorbar(estimates, y_pos, xerr=[errors_lower, errors_upper],
            fmt="o", color=TEAL, markersize=10, capsize=6, capthick=2,
            elinewidth=2, ecolor=STEEL_BLUE, zorder=5)

for i, (est, lo, hi) in enumerate(zip(estimates, ci_lower, ci_upper)):
    ax.text(est, i - 0.3, f"{est:.2f}", ha="center", fontsize=11,
            color=WHITE_TEXT, fontweight="bold")

ax.axvline(x=estimates[0], color=GRID_LINE, linestyle=":", linewidth=1, alpha=0.5)
ax.set_yticks(y_pos)
ax.set_yticklabels(model_names, fontsize=11)
ax.set_ylim(-0.6, 2.6)
ax.set_xlabel("DiD Estimate (txp coefficient)", fontsize=12)
ax.set_title("Coefficient Comparison Across Specifications",
             fontsize=14, fontweight="bold", pad=12)
plt.tight_layout()
plt.savefig("did101_coefplot.png", **SAVE_KWARGS)
plt.close()
print("Saved: did101_coefplot.png")


# ── Section 11: Event Study ────────────────────────────────────────────────

print("\n" + "=" * 60)
print("SECTION 11: Event Study — Dynamic Treatment Effects")
print("=" * 60)

# 11.1: Load event study data
url_event = "https://github.com/quarcs-lab/data-open/raw/master/isds/tutoring_didevent.dta"
df_event = pd.read_stata(url_event).astype(float)

print(f"\nEvent study data shape: {df_event.shape}")
print(f"\nColumn types:\n{df_event.dtypes}")
print(f"\nDescriptive statistics:\n{df_event.describe().round(2)}")
print(f"\ntimeToTreat values:\n{df_event['timeToTreat'].value_counts().sort_index()}")

# Figure 8: Panel view for event study data
fig, ax = plt.subplots(figsize=(12, 8))
schools_ev = sorted(df_event["id"].unique())
times_ev = sorted(df_event["time"].unique())

for i, school in enumerate(schools_ev):
    for j, t in enumerate(times_ev):
        row = df_event[(df_event["id"] == school) & (df_event["time"] == t)]
        if len(row) > 0:
            is_treated = row["treated"].values[0] == 1
            is_post = row["post"].values[0] == 1
            if is_treated and is_post:
                color = WARM_ORANGE
            elif is_treated:
                color = "#e8956a"
            else:
                color = STEEL_BLUE
            ax.add_patch(plt.Rectangle((j - 0.4, i - 0.4), 0.8, 0.8,
                                       facecolor=color, edgecolor=DARK_NAVY,
                                       linewidth=0.5))

ax.set_xlim(-0.5, len(times_ev) - 0.5)
ax.set_ylim(-0.5, len(schools_ev) - 0.5)
ax.set_xticks(range(len(times_ev)))
ax.set_xticklabels([f"{int(t)}" for t in times_ev], fontsize=10)
ax.set_yticks(range(0, len(schools_ev), 5))
ax.set_yticklabels([f"School {schools_ev[i]:.0f}" for i in range(0, len(schools_ev), 5)],
                   fontsize=10)
ax.set_xlabel("Time Period", fontsize=12)
ax.set_ylabel("School ID", fontsize=12)
ax.set_title("Panel Structure: Event Study Design (35 Schools × 8 Periods)",
             fontsize=14, fontweight="bold", pad=12)
ax.axvline(x=3.5, color="#ff6b6b", linestyle="--", linewidth=1.5, alpha=0.7,
           label="Treatment onset (Period 5)")
legend_patches = [
    mpatches.Patch(facecolor=STEEL_BLUE, label="Comparison group"),
    mpatches.Patch(facecolor="#e8956a", label="Treated (pre)"),
    mpatches.Patch(facecolor=WARM_ORANGE, label="Treated (post)"),
]
ax.legend(handles=legend_patches, loc="lower center", bbox_to_anchor=(0.5, -0.1),
          ncol=3, fontsize=10)
ax.invert_yaxis()
plt.tight_layout()
plt.savefig("did101_panelview_event.png", **SAVE_KWARGS)
plt.close()
print("Saved: did101_panelview_event.png")

# 11.3: Event study estimation
print("\n--- 11.3: Event Study Estimation ---")
# Fill NaN timeToTreat (untreated units) with -99 so i() creates a dummy that gets
# absorbed, keeping the coefficient interpretation clean
df_event["timeToTreat"] = df_event["timeToTreat"].fillna(-99)
fit_event = pf.feols("gpa ~ i(timeToTreat, ref=-1) | id + time", data=df_event,
                     vcov={"CRV1": "id"})
print(fit_event.summary())

# 11.4: Event study plot
print("\n--- 11.4: Event Study Plot ---")
tidy_event = fit_event.tidy()
print(f"\nEvent study coefficients:\n{tidy_event}")

# Build manual event study plot for full control
coef_names = tidy_event.index.tolist()
coefs = tidy_event["Estimate"].values
ci_lo = tidy_event["2.5%"].values
ci_hi = tidy_event["97.5%"].values

# Extract numeric time from coefficient names like "C(timeToTreat, -1.0)[T.-4.0]"
import re
time_vals = []
for name in coef_names:
    match = re.search(r'T\.([-\d.]+)', name)
    if match:
        time_vals.append(float(match.group(1)))
    else:
        time_vals.append(np.nan)

time_vals = np.array(time_vals)

# Filter out the -99 dummy (untreated placeholder)
valid_mask = (time_vals > -90) & ~np.isnan(time_vals)
time_vals = time_vals[valid_mask]
coefs = coefs[valid_mask]
ci_lo = ci_lo[valid_mask]
ci_hi = ci_hi[valid_mask]

# Add reference period (timeToTreat = -1)
ref_time = -1.0
time_plot = np.concatenate([time_vals[time_vals < ref_time],
                            [ref_time],
                            time_vals[time_vals > ref_time]])
coefs_plot = np.concatenate([coefs[time_vals < ref_time],
                             [0],
                             coefs[time_vals > ref_time]])
ci_lo_plot = np.concatenate([ci_lo[time_vals < ref_time],
                             [0],
                             ci_lo[time_vals > ref_time]])
ci_hi_plot = np.concatenate([ci_hi[time_vals < ref_time],
                             [0],
                             ci_hi[time_vals > ref_time]])

sort_idx = np.argsort(time_plot)
time_plot = time_plot[sort_idx]
coefs_plot = coefs_plot[sort_idx]
ci_lo_plot = ci_lo_plot[sort_idx]
ci_hi_plot = ci_hi_plot[sort_idx]

fig, ax = plt.subplots(figsize=(10, 6))
ax.fill_between(time_plot, ci_lo_plot, ci_hi_plot, alpha=0.2, color=STEEL_BLUE)
ax.plot(time_plot, coefs_plot, color=TEAL, marker="o", markersize=8,
        linewidth=2, zorder=5)
ax.axhline(y=0, color=LIGHT_TEXT, linewidth=0.8, alpha=0.5)
ax.axvline(x=-0.5, color="#ff6b6b", linestyle="--", linewidth=1.5, alpha=0.7,
           label="Treatment onset")

# Annotate pre-treatment and post-treatment regions
ax.text(-2.5, max(coefs_plot) * 0.85, "Pre-treatment\n(should be ≈ 0)",
        fontsize=11, color=LIGHT_TEXT, ha="center", style="italic")
ax.text(1.5, max(coefs_plot) * 0.85, "Post-treatment\n(causal effect)",
        fontsize=11, color=WARM_ORANGE, ha="center", style="italic")

ax.set_xlabel("Periods Relative to Treatment", fontsize=12)
ax.set_ylabel("Estimated Coefficient", fontsize=12)
ax.set_title("Event Study: Dynamic Treatment Effects",
             fontsize=14, fontweight="bold", pad=12)
ax.set_xticks(time_plot.astype(int))
ax.legend(loc="upper left", fontsize=11)
plt.tight_layout()
plt.savefig("did101_event_study.png", **SAVE_KWARGS)
plt.close()
print("Saved: did101_event_study.png")

# 11.5: Event study coefficients table
print("\n--- 11.5: Event Study Coefficients Table ---")
event_rows = []
for t, c, lo, hi in zip(time_plot, coefs_plot, ci_lo_plot, ci_hi_plot):
    period_label = f"t = {int(t)}" if t != ref_time else f"t = {int(t)} (ref)"
    sig = ""
    if t == ref_time:
        sig = "(reference)"
    elif abs(c) / max(abs(hi - c), 0.001) > 1.96:
        # Check if CI excludes zero
        if lo > 0 or hi < 0:
            sig = "***"
    event_rows.append({
        "Period": period_label,
        "Estimate": c,
        "CI Lower": lo,
        "CI Upper": hi,
        "Significant": sig,
    })

event_df = pd.DataFrame(event_rows)

gt_event = (
    GT(event_df)
    .tab_header(
        title=md("**Table 4: Event Study Coefficients**"),
        subtitle="Reference period: t = −1 (one period before treatment)"
    )
    .fmt_number(columns=["Estimate", "CI Lower", "CI Upper"], decimals=3)
    .cols_label(
        **{"CI Lower": "95% CI Lower", "CI Upper": "95% CI Upper"}
    )
    .tab_source_note(
        "Notes: TWFE with school and time FE. CRV1 clustered SE at school level. "
        "*** p < 0.001."
    )
    .tab_style(
        style=style.text(weight="bold"),
        locations=loc.body(columns="Estimate")
    )
)
gt_event.save("did101_event_table.png")
print("Saved: did101_event_table.png")

print("\n" + "=" * 60)
print("ALL FIGURES GENERATED SUCCESSFULLY")
print("=" * 60)
print("\nFigures saved:")
print("  1. did101_panelview.png")
print("  2. did101_its.png")
print("  3. did101_counterfactual.png")
print("  4. did101_diff_plot.png")
print("  5. did101_se_comparison.png")
print("  6. did101_table2.png")
print("  7. did101_coefplot.png")
print("  8. did101_panelview_event.png")
print("  9. did101_event_study.png")
print("  10. did101_event_table.png")
