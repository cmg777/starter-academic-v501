"""
Introduction to Partial Identification: Bounding Causal Effects Under
Unmeasured Confounding

This script simulates an observational study with an unmeasured confounder
and computes causal bounds using Manski bounds, Tian-Pearl bounds, and
entropy-based methods via the CausalBoundingEngine package.

Usage:
    pip install causalboundingengine
    python script.py

References:
    - Manski (1990). Nonparametric Bounds on Treatment Effects. AER.
    - Tian & Pearl (2000). Probabilities of Causation. Annals of Math & AI.
    - Maringgele (2025). Bounding Causal Effects and Counterfactuals. arXiv:2508.13607.
    - Huntington-Klein (2021). The Effect, Chapter 21.
"""

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import time
from causalboundingengine.scenarios import BinaryConf
import shutil

# ── Configuration ──────────────────────────────────────────────────────────
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
N = 1000

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"
HEADING_BLUE = "#1a3a8a"

# ── 1. Simulate Observational Data ────────────────────────────────────────
print("=" * 65)
print("PARTIAL IDENTIFICATION: Bounding Causal Effects")
print("=" * 65)

U = np.random.binomial(1, 0.3, N)   # Unmeasured confounder (prior experience)
X_prob = 0.3 + 0.4 * U              # Experienced workers more likely to enroll
X = np.random.binomial(1, X_prob, N) # Treatment (job training)

# Outcome probability depends on treatment, confounder, and their interaction
Y_prob = np.clip(0.2 + 0.3 * X + 0.4 * U - 0.1 * X * U, 0, 1)
Y = np.random.binomial(1, Y_prob)   # Outcome (got a job)

print(f"\nDataset: {N} simulated workers")
print(f"Treatment (X):  {X.sum()} trained ({X.mean():.1%})")
print(f"Outcome (Y):    {Y.sum()} got a job ({Y.mean():.1%})")

# ── 2. Contingency Table ──────────────────────────────────────────────────
n_00 = ((X == 0) & (Y == 0)).sum()
n_01 = ((X == 0) & (Y == 1)).sum()
n_10 = ((X == 1) & (Y == 0)).sum()
n_11 = ((X == 1) & (Y == 1)).sum()

print(f"\nContingency Table:")
print(f"{'':>15} {'Y=0':>8} {'Y=1':>8} {'Total':>8}")
print(f"{'X=0 (Control)':>15} {n_00:>8} {n_01:>8} {n_00+n_01:>8}")
print(f"{'X=1 (Trained)':>15} {n_10:>8} {n_11:>8} {n_10+n_11:>8}")
print(f"{'Total':>15} {n_00+n_10:>8} {n_01+n_11:>8} {N:>8}")

# ── 3. Conditional Probabilities ──────────────────────────────────────────
P_Y1_X1 = Y[X == 1].mean()
P_Y1_X0 = Y[X == 0].mean()
P_X1 = X.mean()
P_X0 = 1 - P_X1

print(f"\nConditional Probabilities:")
print(f"  P(Y=1 | X=1) = {P_Y1_X1:.4f}  (trained workers who got jobs)")
print(f"  P(Y=1 | X=0) = {P_Y1_X0:.4f}  (untrained workers who got jobs)")
print(f"  P(X=1)       = {P_X1:.4f}  (fraction trained)")

# ── 4. Figure 1: Observed Probabilities ───────────────────────────────────
fig, ax = plt.subplots(figsize=(7, 5))
groups = ["No Training\n(X = 0)", "Training\n(X = 1)"]
probs = [P_Y1_X0, P_Y1_X1]
colors = [STEEL_BLUE, WARM_ORANGE]
bars = ax.bar(groups, probs, color=colors, width=0.5, edgecolor=NEAR_BLACK, linewidth=0.8)

for bar, prob in zip(bars, probs):
    ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.01,
            f"{prob:.1%}", ha="center", va="bottom", fontsize=13,
            fontweight="bold", color=NEAR_BLACK)

naive_ate = P_Y1_X1 - P_Y1_X0
ax.annotate("", xy=(1, P_Y1_X1), xytext=(0, P_Y1_X0),
            arrowprops=dict(arrowstyle="<->", color=NEAR_BLACK, lw=1.5))
ax.text(0.5, (P_Y1_X1 + P_Y1_X0) / 2, f"Naive ATE = {naive_ate:.2%}",
        ha="center", va="bottom", fontsize=11, color=NEAR_BLACK,
        bbox=dict(boxstyle="round,pad=0.3", facecolor="white", edgecolor=NEAR_BLACK, alpha=0.8))

ax.set_ylabel("P(Got a Job | Treatment)", fontsize=12)
ax.set_title("Observed Job Rates by Training Status", fontsize=14, color=HEADING_BLUE)
ax.set_ylim(0, 0.75)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
plt.tight_layout()
plt.savefig("partial_id_observed_probs.png", dpi=300, bbox_inches="tight")
plt.close()
print("\nSaved: partial_id_observed_probs.png")

# ── 5. Naive Estimate vs True ATE ─────────────────────────────────────────
naive_ate = P_Y1_X1 - P_Y1_X0
E_Y1_true = 0.7 * 0.5 + 0.3 * 0.8   # E[Y(1)]
E_Y0_true = 0.7 * 0.2 + 0.3 * 0.6   # E[Y(0)]
true_ate = E_Y1_true - E_Y0_true

print(f"\n{'Baseline Comparison':=^65}")
print(f"  Naive ATE (difference in means):  {naive_ate:.4f}")
print(f"  True ATE (from known DGP):        {true_ate:.4f}")
print(f"  Bias (Naive - True):              {naive_ate - true_ate:+.4f}")
print(f"  The naive estimate is {'upward' if naive_ate > true_ate else 'downward'} biased")
print(f"  because the confounder U is positively associated with")
print(f"  both treatment and outcome.")

# ── 6. Manual Manski Bounds ───────────────────────────────────────────────
print(f"\n{'Manual Manski Bounds Computation':=^65}")
print(f"\nStep 1: What we observe")
print(f"  P(Y=1|X=1) = {P_Y1_X1:.4f}")
print(f"  P(Y=1|X=0) = {P_Y1_X0:.4f}")
print(f"  P(X=1) = {P_X1:.4f},  P(X=0) = {P_X0:.4f}")

E_Y1_lower = P_Y1_X1 * P_X1 + 0 * P_X0
E_Y1_upper = P_Y1_X1 * P_X1 + 1 * P_X0
E_Y0_lower = P_Y1_X0 * P_X0 + 0 * P_X1
E_Y0_upper = P_Y1_X0 * P_X0 + 1 * P_X1

print(f"\nStep 2: Bound E[Y(1)] and E[Y(0)]")
print(f"  E[Y(1)] in [{E_Y1_lower:.4f}, {E_Y1_upper:.4f}]")
print(f"  E[Y(0)] in [{E_Y0_lower:.4f}, {E_Y0_upper:.4f}]")

ATE_lower = E_Y1_lower - E_Y0_upper
ATE_upper = E_Y1_upper - E_Y0_lower

print(f"\nStep 3: Compute ATE bounds")
print(f"  ATE_lower = E[Y(1)]_lower - E[Y(0)]_upper")
print(f"            = {E_Y1_lower:.4f} - {E_Y0_upper:.4f} = {ATE_lower:.4f}")
print(f"  ATE_upper = E[Y(1)]_upper - E[Y(0)]_lower")
print(f"            = {E_Y1_upper:.4f} - {E_Y0_lower:.4f} = {ATE_upper:.4f}")
print(f"\n  Manski Bounds: [{ATE_lower:.4f}, {ATE_upper:.4f}]")
print(f"  Width: {ATE_upper - ATE_lower:.4f}")
print(f"  Contains true ATE ({true_ate:.4f})? {ATE_lower <= true_ate <= ATE_upper}")

# ── 7. CausalBoundingEngine: Manski Bounds ────────────────────────────────
print(f"\n{'CausalBoundingEngine Methods':=^65}")

scenario = BinaryConf(X, Y)

start_time = time.time()
manski_bounds = scenario.ATE.manski()
manski_time = time.time() - start_time

print(f"\n1. Manski Bounds (Estimand: Average Treatment Effect)")
print(f"   Range:            [{manski_bounds[0]:.4f}, {manski_bounds[1]:.4f}]")
print(f"   Width:            {manski_bounds[1] - manski_bounds[0]:.4f}")
print(f"   Contains true?    {manski_bounds[0] <= true_ate <= manski_bounds[1]}")
print(f"   Computation Time: {manski_time:.6f} seconds")

# ── 8. CausalBoundingEngine: Autobound ────────────────────────────────────
start_time = time.time()
autobound_ate = scenario.ATE.autobound()
autobound_time = time.time() - start_time

print(f"\n2. Autobound (Estimand: Average Treatment Effect)")
print(f"   Range:            [{autobound_ate[0]:.4f}, {autobound_ate[1]:.4f}]")
print(f"   Width:            {autobound_ate[1] - autobound_ate[0]:.4f}")
print(f"   Contains true?    {autobound_ate[0] <= true_ate <= autobound_ate[1]}")
print(f"   Computation Time: {autobound_time:.6f} seconds")

# ── 9. CausalBoundingEngine: Entropy Bounds ───────────────────────────────
start_time = time.time()
entropy_ate = scenario.ATE.entropybounds(theta=0.1)
entropy_time = time.time() - start_time

print(f"\n3. Entropy Bounds (Estimand: ATE, theta=0.1)")
print(f"   Range:            [{entropy_ate[0]:.4f}, {entropy_ate[1]:.4f}]")
print(f"   Width:            {entropy_ate[1] - entropy_ate[0]:.4f}")
print(f"   Contains true?    {entropy_ate[0] <= true_ate <= entropy_ate[1]}")
print(f"   Computation Time: {entropy_time:.6f} seconds")

# ── 10. CausalBoundingEngine: Tian-Pearl PNS ─────────────────────────────
start_time = time.time()
tianpearl_pns = scenario.PNS.tianpearl()
tianpearl_time = time.time() - start_time

print(f"\n4. Tian-Pearl Bounds (Estimand: Prob. of Necessity & Sufficiency)")
print(f"   Range:            [{tianpearl_pns[0]:.4f}, {tianpearl_pns[1]:.4f}]")
print(f"   Width:            {tianpearl_pns[1] - tianpearl_pns[0]:.4f}")
print(f"   Computation Time: {tianpearl_time:.6f} seconds")

# ── 11. PNS: Autobound and Entropy ────────────────────────────────────────
autobound_pns = scenario.PNS.autobound()
entropy_pns = scenario.PNS.entropybounds(theta=0.1)

print(f"\n5. Autobound (Estimand: PNS)")
print(f"   Range:            [{autobound_pns[0]:.4f}, {autobound_pns[1]:.4f}]")
print(f"   Width:            {autobound_pns[1] - autobound_pns[0]:.4f}")

print(f"\n6. Entropy Bounds (Estimand: PNS, theta=0.1)")
print(f"   Range:            [{entropy_pns[0]:.4f}, {entropy_pns[1]:.4f}]")
print(f"   Width:            {entropy_pns[1] - entropy_pns[0]:.4f}")

# ── 12. Figure 2: ATE Bounds Comparison ───────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 5))

methods_ate = [
    ("Entropy\n(\u03b8 = 0.1)", entropy_ate, TEAL),
    ("Autobound\n(LP)", autobound_ate, WARM_ORANGE),
    ("Manski\n(No Assumptions)", manski_bounds, STEEL_BLUE),
]

y_positions = range(len(methods_ate))
for i, (label, bounds, color) in enumerate(methods_ate):
    width = bounds[1] - bounds[0]
    ax.barh(i, width, left=bounds[0], height=0.5, color=color,
            edgecolor=NEAR_BLACK, linewidth=0.8, alpha=0.85)
    ax.text(bounds[1] + 0.01, i, f"[{bounds[0]:.3f}, {bounds[1]:.3f}]",
            va="center", fontsize=9, color=NEAR_BLACK)

ax.axvline(x=true_ate, color=NEAR_BLACK, linestyle="--", linewidth=2,
           label=f"True ATE = {true_ate:.2f}")
ax.axvline(x=naive_ate, color="#999999", linestyle=":", linewidth=1.5,
           label=f"Naive estimate = {naive_ate:.4f}")
ax.axvline(x=0, color=NEAR_BLACK, linestyle="-", linewidth=0.5, alpha=0.3)

ax.set_yticks(list(y_positions))
ax.set_yticklabels([m[0] for m in methods_ate], fontsize=11)
ax.set_xlabel("Average Treatment Effect (ATE)", fontsize=12)
ax.set_title("Comparing Causal Bounds on the ATE", fontsize=14, color=HEADING_BLUE)
ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.12), fontsize=10, ncol=2)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
plt.tight_layout()
plt.savefig("partial_id_bounds_comparison.png", dpi=300, bbox_inches="tight")
plt.close()
print("\nSaved: partial_id_bounds_comparison.png")

# ── 13. Figure 3: PNS Bounds Comparison ──────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 4.5))

methods_pns = [
    ("Entropy\n(\u03b8 = 0.1)", entropy_pns, TEAL),
    ("Autobound\n(LP)", autobound_pns, WARM_ORANGE),
    ("Tian-Pearl\n(Closed Form)", tianpearl_pns, STEEL_BLUE),
]

for i, (label, bounds, color) in enumerate(methods_pns):
    width = bounds[1] - bounds[0]
    ax.barh(i, width, left=bounds[0], height=0.5, color=color,
            edgecolor=NEAR_BLACK, linewidth=0.8, alpha=0.85)
    ax.text(bounds[1] + 0.01, i, f"[{bounds[0]:.3f}, {bounds[1]:.3f}]",
            va="center", fontsize=9, color=NEAR_BLACK)

ax.axvline(x=0, color=NEAR_BLACK, linestyle="-", linewidth=0.5, alpha=0.3)
ax.set_yticks(list(range(len(methods_pns))))
ax.set_yticklabels([m[0] for m in methods_pns], fontsize=11)
ax.set_xlabel("Probability of Necessity & Sufficiency (PNS)", fontsize=12)
ax.set_title("Comparing Causal Bounds on the PNS", fontsize=14, color=HEADING_BLUE)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
plt.tight_layout()
plt.savefig("partial_id_pns_bounds.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: partial_id_pns_bounds.png")

# ── 14. Figure 4: Coverage Simulation ─────────────────────────────────────
print(f"\n{'Coverage Simulation (100 replications)':=^65}")

n_sims = 100
coverage_manski = 0
coverage_autobound = 0
coverage_entropy = 0

for sim in range(n_sims):
    np.random.seed(sim)
    U_s = np.random.binomial(1, 0.3, N)
    X_prob_s = 0.3 + 0.4 * U_s
    X_s = np.random.binomial(1, X_prob_s, N)
    Y_prob_s = np.clip(0.2 + 0.3 * X_s + 0.4 * U_s - 0.1 * X_s * U_s, 0, 1)
    Y_s = np.random.binomial(1, Y_prob_s)

    sc = BinaryConf(X_s, Y_s)
    m = sc.ATE.manski()
    a = sc.ATE.autobound()
    e = sc.ATE.entropybounds(theta=0.1)

    if m[0] <= true_ate <= m[1]:
        coverage_manski += 1
    if a[0] <= true_ate <= a[1]:
        coverage_autobound += 1
    if e[0] <= true_ate <= e[1]:
        coverage_entropy += 1

print(f"  Manski coverage:    {coverage_manski}/{n_sims} ({coverage_manski/n_sims:.0%})")
print(f"  Autobound coverage: {coverage_autobound}/{n_sims} ({coverage_autobound/n_sims:.0%})")
print(f"  Entropy coverage:   {coverage_entropy}/{n_sims} ({coverage_entropy/n_sims:.0%})")

fig, ax = plt.subplots(figsize=(7, 4.5))
methods = ["Manski", "Autobound", "Entropy\n(\u03b8 = 0.1)"]
coverages = [coverage_manski / n_sims * 100,
             coverage_autobound / n_sims * 100,
             coverage_entropy / n_sims * 100]
colors = [STEEL_BLUE, WARM_ORANGE, TEAL]

bars = ax.bar(methods, coverages, color=colors, width=0.5,
              edgecolor=NEAR_BLACK, linewidth=0.8)
for bar, cov in zip(bars, coverages):
    ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.5,
            f"{cov:.0f}%", ha="center", va="bottom", fontsize=13,
            fontweight="bold", color=NEAR_BLACK)

ax.axhline(y=100, color=NEAR_BLACK, linestyle="--", linewidth=1, alpha=0.5)
ax.set_ylabel("Coverage Rate (%)", fontsize=12)
ax.set_title("Do Bounds Contain the True ATE?\n(100 Simulations)",
             fontsize=14, color=HEADING_BLUE)
ax.set_ylim(0, 110)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
plt.tight_layout()
plt.savefig("partial_id_coverage.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: partial_id_coverage.png")

# ── 15. Figure 5: Sample Size Sensitivity ─────────────────────────────────
print(f"\n{'Sample Size Sensitivity':=^65}")

sample_sizes = [100, 250, 500, 1000, 2500, 5000]
n_reps = 30

manski_widths = {n: [] for n in sample_sizes}
entropy_widths = {n: [] for n in sample_sizes}

for n in sample_sizes:
    for rep in range(n_reps):
        np.random.seed(rep + 1000)
        U_s = np.random.binomial(1, 0.3, n)
        X_prob_s = 0.3 + 0.4 * U_s
        X_s = np.random.binomial(1, X_prob_s, n)
        Y_prob_s = np.clip(0.2 + 0.3 * X_s + 0.4 * U_s - 0.1 * X_s * U_s, 0, 1)
        Y_s = np.random.binomial(1, Y_prob_s)

        sc = BinaryConf(X_s, Y_s)
        m = sc.ATE.manski()
        e = sc.ATE.entropybounds(theta=0.1)

        manski_widths[n].append(m[1] - m[0])
        entropy_widths[n].append(e[1] - e[0])

    print(f"  N={n:>5}: Manski width = {np.mean(manski_widths[n]):.4f} "
          f"(+/- {np.std(manski_widths[n]):.4f}), "
          f"Entropy width = {np.mean(entropy_widths[n]):.4f} "
          f"(+/- {np.std(entropy_widths[n]):.4f})")

fig, ax = plt.subplots(figsize=(8, 5))
manski_means = [np.mean(manski_widths[n]) for n in sample_sizes]
manski_stds = [np.std(manski_widths[n]) for n in sample_sizes]
entropy_means = [np.mean(entropy_widths[n]) for n in sample_sizes]
entropy_stds = [np.std(entropy_widths[n]) for n in sample_sizes]

ax.plot(sample_sizes, manski_means, "o-", color=STEEL_BLUE, linewidth=2,
        markersize=7, label="Manski Bounds", zorder=3)
ax.fill_between(sample_sizes,
                [m - s for m, s in zip(manski_means, manski_stds)],
                [m + s for m, s in zip(manski_means, manski_stds)],
                color=STEEL_BLUE, alpha=0.15)

ax.plot(sample_sizes, entropy_means, "s-", color=TEAL, linewidth=2,
        markersize=7, label="Entropy Bounds (\u03b8 = 0.1)", zorder=3)
ax.fill_between(sample_sizes,
                [m - s for m, s in zip(entropy_means, entropy_stds)],
                [m + s for m, s in zip(entropy_means, entropy_stds)],
                color=TEAL, alpha=0.15)

ax.set_xlabel("Sample Size (N)", fontsize=12)
ax.set_ylabel("Bound Width (Upper - Lower)", fontsize=12)
ax.set_title("Bound Width vs. Sample Size", fontsize=14, color=HEADING_BLUE)
ax.legend(loc="center right", fontsize=11)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.set_xscale("log")
ax.set_xticks(sample_sizes)
ax.set_xticklabels([str(n) for n in sample_sizes])
plt.tight_layout()
plt.savefig("partial_id_sample_size.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: partial_id_sample_size.png")

# ── 16. Summary Table ─────────────────────────────────────────────────────
print(f"\n{'Summary Table':=^65}")
print(f"{'Method':<22} {'Estimand':<8} {'Lower':>8} {'Upper':>8} {'Width':>8} {'True?':>8}")
print("-" * 65)
print(f"{'Manski':<22} {'ATE':<8} {manski_bounds[0]:>8.4f} {manski_bounds[1]:>8.4f} "
      f"{manski_bounds[1]-manski_bounds[0]:>8.4f} {'Yes':>8}")
print(f"{'Autobound':<22} {'ATE':<8} {autobound_ate[0]:>8.4f} {autobound_ate[1]:>8.4f} "
      f"{autobound_ate[1]-autobound_ate[0]:>8.4f} {'Yes':>8}")
print(f"{'Entropy (theta=0.1)':<22} {'ATE':<8} {entropy_ate[0]:>8.4f} {entropy_ate[1]:>8.4f} "
      f"{entropy_ate[1]-entropy_ate[0]:>8.4f} {'Yes':>8}")
print(f"{'Tian-Pearl':<22} {'PNS':<8} {tianpearl_pns[0]:>8.4f} {tianpearl_pns[1]:>8.4f} "
      f"{tianpearl_pns[1]-tianpearl_pns[0]:>8.4f} {'--':>8}")
print(f"{'Autobound':<22} {'PNS':<8} {autobound_pns[0]:>8.4f} {autobound_pns[1]:>8.4f} "
      f"{autobound_pns[1]-autobound_pns[0]:>8.4f} {'--':>8}")
print(f"{'Entropy (theta=0.1)':<22} {'PNS':<8} {entropy_pns[0]:>8.4f} {entropy_pns[1]:>8.4f} "
      f"{entropy_pns[1]-entropy_pns[0]:>8.4f} {'--':>8}")
print("-" * 65)
print(f"True ATE = {true_ate:.4f}  |  Naive ATE = {naive_ate:.4f}")

# ── 17. Copy featured image ──────────────────────────────────────────────
shutil.copy("partial_id_bounds_comparison.png", "featured.png")
print("\nCopied partial_id_bounds_comparison.png -> featured.png")
print("\nDone. All figures generated.")
