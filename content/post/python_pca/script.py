"""
Introduction to PCA Analysis for Building Development Indicators

Demonstrates Principal Component Analysis step by step, building a
composite Health Index from Life Expectancy and Infant Mortality using
simulated data for 50 countries.

Usage:
    python script.py

References:
    - Jolliffe & Cadima (2016). Principal Component Analysis: A Review
      and Recent Developments. Phil. Trans. R. Soc. A.
    - scikit-learn PCA documentation:
      https://scikit-learn.org/stable/modules/decomposition.html#pca
"""

import shutil

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

# Reproducibility
RANDOM_SEED = 42

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

def simulate_health_data(n=50, seed=42):
    """Simulate health indicators for n countries.

    True DGP:
        base_health ~ Uniform(0, 1)  -- latent health capacity
        life_exp    = 55 + 30 * base_health + N(0, 2)  -- range ~55-85
        infant_mort = 60 - 55 * base_health + N(0, 3)  -- range ~2-60

    Life expectancy and infant mortality are driven by the same
    latent factor (base_health), creating a strong negative correlation
    in raw form.
    """
    rng = np.random.default_rng(seed)
    base_health = rng.uniform(0, 1, n)
    life_exp = 55 + 30 * base_health + rng.normal(0, 2, n)
    infant_mort = 60 - 55 * base_health + rng.normal(0, 3, n)
    countries = [f"Country_{i+1:02d}" for i in range(n)]
    return pd.DataFrame({
        "country": countries,
        "life_exp": np.round(life_exp, 1),
        "infant_mort": np.round(infant_mort, 1),
    })


# ── Step 0: Generate and explore data ────────────────────────────────

print("=" * 60)
print("DATA GENERATION")
print("=" * 60)

df = simulate_health_data(n=50, seed=RANDOM_SEED)

# Save raw data to CSV (used later in the scikit-learn pipeline)
df.to_csv("health_data.csv", index=False)

print(f"\nDataset shape: {df.shape}")
print(f"\nFirst 5 rows:")
print(df.head().to_string(index=False))
print(f"\nDescriptive statistics:")
print(df[["life_exp", "infant_mort"]].describe().round(2).to_string())

# Raw correlation
raw_corr = df["life_exp"].corr(df["infant_mort"])
print(f"\nPearson correlation (LE vs IM): {raw_corr:.4f}")


# ── Figure 1: Raw scatter ────────────────────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 1: Raw data scatter")
print("=" * 60)

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_linewidth(0)

ax.scatter(df["life_exp"], df["infant_mort"],
           color=STEEL_BLUE, edgecolors=DARK_NAVY, s=60, zorder=3)

# Label top/bottom 5 countries by life_exp
sorted_df = df.sort_values("life_exp")
label_idx = list(sorted_df.head(5).index) + list(sorted_df.tail(5).index)
for i in label_idx:
    ax.annotate(df.loc[i, "country"], (df.loc[i, "life_exp"], df.loc[i, "infant_mort"]),
                fontsize=7, color=LIGHT_TEXT, xytext=(5, 5),
                textcoords="offset points")

ax.set_xlabel("Life Expectancy (years)", fontsize=13)
ax.set_ylabel("Infant Mortality (per 1,000 live births)", fontsize=13)
ax.set_title("Raw health indicators: Life Expectancy vs. Infant Mortality",
             fontsize=14, pad=12)

# Annotate correlation
ax.annotate(f"r = {raw_corr:.2f}", xy=(0.95, 0.95), xycoords="axes fraction",
            fontsize=12, color=WARM_ORANGE, fontweight="bold",
            va="top", ha="right")

plt.savefig("pca_raw_scatter.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca_raw_scatter.png")


# ── Step 1: Polarity adjustment ──────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 1: Polarity Adjustment")
print("=" * 60)

df["infant_mort_adj"] = -1 * df["infant_mort"]
adj_corr = df["life_exp"].corr(df["infant_mort_adj"])
print(f"Correlation after polarity adjustment (LE vs -IM): {adj_corr:.4f}")
print(f"\nFirst 5 rows with adjusted IM:")
print(df[["country", "life_exp", "infant_mort", "infant_mort_adj"]].head().to_string(index=False))

# Application: Country_01
print(f"\n--- Application: Country_01 ---")
im_raw_01 = df.loc[df["country"] == "Country_01", "infant_mort"].values[0]
im_adj_01 = -1 * im_raw_01
print(f"Country_01: IM = {im_raw_01} -> IM* = -1 x {im_raw_01} = {im_adj_01}")


# ── Step 2: Standardization ──────────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 2: Standardization")
print("=" * 60)

# Manual Z-scores
le_mean = df["life_exp"].mean()
le_std = df["life_exp"].std(ddof=0)
im_mean = df["infant_mort_adj"].mean()
im_std = df["infant_mort_adj"].std(ddof=0)

df["z_le"] = (df["life_exp"] - le_mean) / le_std
df["z_im"] = (df["infant_mort_adj"] - im_mean) / im_std

print(f"Life Expectancy   -- mean: {le_mean:.2f}, std: {le_std:.2f}")
print(f"Infant Mort (adj) -- mean: {im_mean:.2f}, std: {im_std:.2f}")
print(f"\nZ-score statistics:")
print(f"  z_le  mean: {df['z_le'].mean():.6f}, std: {df['z_le'].std(ddof=0):.6f}")
print(f"  z_im  mean: {df['z_im'].mean():.6f}, std: {df['z_im'].std(ddof=0):.6f}")

# Verify with sklearn StandardScaler
scaler = StandardScaler()
Z_sklearn = scaler.fit_transform(df[["life_exp", "infant_mort_adj"]])
max_diff_std = np.max(np.abs(Z_sklearn - df[["z_le", "z_im"]].values))
print(f"\nMax difference from sklearn StandardScaler: {max_diff_std:.2e}")

# Application: Country_01
print(f"\n--- Application: Country_01 ---")
le_val_01 = 79.6
im_adj_val_01 = -18.6
z_le_01 = (le_val_01 - le_mean) / le_std
z_im_01 = (im_adj_val_01 - im_mean) / im_std
print(f"Z_LE = ({le_val_01} - {le_mean:.2f}) / {le_std:.2f} = {le_val_01 - le_mean:.2f} / {le_std:.2f} = {z_le_01:.4f}")
print(f"Z_IM = ({im_adj_val_01} - ({im_mean:.2f})) / {im_std:.2f} = {im_adj_val_01 - im_mean:.2f} / {im_std:.2f} = {z_im_01:.4f}")


# ── Step 3: Covariance matrix ────────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 3: Covariance Matrix")
print("=" * 60)

Z = df[["z_le", "z_im"]].values
cov_matrix = np.cov(Z.T, ddof=0)
print(f"Covariance matrix (2x2):")
print(f"  [{cov_matrix[0, 0]:.4f}  {cov_matrix[0, 1]:.4f}]")
print(f"  [{cov_matrix[1, 0]:.4f}  {cov_matrix[1, 1]:.4f}]")
print(f"\nOff-diagonal (correlation): {cov_matrix[0, 1]:.4f}")

# Application: interpret the matrix entries
print(f"\n--- Application ---")
print(f"  Var(Z_LE)        = {cov_matrix[0, 0]:.4f}  (= 1, by construction after standardization)")
print(f"  Var(Z_IM)        = {cov_matrix[1, 1]:.4f}  (= 1, by construction after standardization)")
print(f"  Cov(Z_LE, Z_IM)  = {cov_matrix[0, 1]:.4f}  (= correlation r, since data is standardized)")


# ── Step 4: Eigen-decomposition ──────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 4: Eigen-Decomposition")
print("=" * 60)

eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)

# Sort in descending order
idx = np.argsort(eigenvalues)[::-1]
eigenvalues = eigenvalues[idx]
eigenvectors = eigenvectors[:, idx]

# Ensure first component weight is positive (sign convention)
if eigenvectors[0, 0] < 0:
    eigenvectors[:, 0] *= -1
if eigenvectors[0, 1] < 0:
    eigenvectors[:, 1] *= -1

var_explained = eigenvalues / eigenvalues.sum() * 100

print(f"Eigenvalues:  [{eigenvalues[0]:.4f}, {eigenvalues[1]:.4f}]")
print(f"Sum of eigenvalues: {eigenvalues.sum():.4f}")
print(f"\nEigenvector (PC1): [{eigenvectors[0, 0]:.4f}, {eigenvectors[1, 0]:.4f}]")
print(f"Eigenvector (PC2): [{eigenvectors[0, 1]:.4f}, {eigenvectors[1, 1]:.4f}]")
print(f"\nVariance explained:")
print(f"  PC1: {var_explained[0]:.2f}%")
print(f"  PC2: {var_explained[1]:.2f}%")

# Application: show eigenvalue formula for 2x2 correlation matrix
print(f"\n--- Application ---")
r = cov_matrix[0, 1]
lambda_1 = 1 + r
lambda_2 = 1 - r
print(f"For a 2x2 correlation matrix, eigenvalues = 1 + r and 1 - r:")
print(f"  lambda_1 = 1 + {r:.4f} = {lambda_1:.4f}  (actual: {eigenvalues[0]:.4f})")
print(f"  lambda_2 = 1 - {r:.4f} = {lambda_2:.4f}  (actual: {eigenvalues[1]:.4f})")
print(f"  Variance explained by PC1: {lambda_1:.4f} / {lambda_1 + lambda_2:.4f} = {lambda_1 / (lambda_1 + lambda_2) * 100:.2f}%")


# ── Figure 2: Standardized data with eigenvector arrows ──────────────

print("\n" + "=" * 60)
print("FIGURE 2: Standardized data with eigenvector arrows")
print("=" * 60)

fig, ax = plt.subplots(figsize=(8, 8))
fig.patch.set_linewidth(0)

ax.scatter(Z[:, 0], Z[:, 1], color=STEEL_BLUE, edgecolors=DARK_NAVY,
           s=60, zorder=3, alpha=0.8)

# Draw eigenvector arrows scaled by sqrt(eigenvalue) so length reflects variance
vis = 1.5  # visibility multiplier
scale_pc1 = np.sqrt(eigenvalues[0]) * vis
scale_pc2 = np.sqrt(eigenvalues[1]) * vis
ax.annotate("", xy=(eigenvectors[0, 0] * scale_pc1, eigenvectors[1, 0] * scale_pc1),
            xytext=(0, 0),
            arrowprops=dict(arrowstyle="-|>", color=WARM_ORANGE, lw=2.5))
ax.annotate("", xy=(eigenvectors[0, 1] * scale_pc2, eigenvectors[1, 1] * scale_pc2),
            xytext=(0, 0),
            arrowprops=dict(arrowstyle="-|>", color=TEAL, lw=2.0))

# Label arrows
ax.text(eigenvectors[0, 0] * scale_pc1 + 0.15, eigenvectors[1, 0] * scale_pc1 + 0.15,
        f"PC1 ({var_explained[0]:.1f}%)", color=WARM_ORANGE, fontsize=12,
        fontweight="bold")
ax.text(eigenvectors[0, 1] * scale_pc2 + 0.15, eigenvectors[1, 1] * scale_pc2 - 0.15,
        f"PC2 ({var_explained[1]:.1f}%)", color=TEAL, fontsize=12,
        fontweight="bold")

# Mark origin
ax.axhline(0, color=GRID_LINE, linewidth=0.8, zorder=1)
ax.axvline(0, color=GRID_LINE, linewidth=0.8, zorder=1)

ax.set_xlabel("Standardized Life Expectancy (Z-score)", fontsize=13)
ax.set_ylabel("Standardized Infant Survival (Z-score)", fontsize=13)
ax.set_title("Standardized data with principal component directions",
             fontsize=14, pad=12)
ax.set_aspect("equal")

plt.savefig("pca_standardized_eigenvectors.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca_standardized_eigenvectors.png")


# ── Figure 3: Variance explained ─────────────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 3: Variance explained")
print("=" * 60)

fig, ax = plt.subplots(figsize=(6, 4))
fig.patch.set_linewidth(0)

bars = ax.bar(["PC1", "PC2"], var_explained, color=[WARM_ORANGE, STEEL_BLUE],
              edgecolor=DARK_NAVY, width=0.5)

for bar, val in zip(bars, var_explained):
    ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1,
            f"{val:.1f}%", ha="center", va="bottom", fontsize=13,
            fontweight="bold", color=WHITE_TEXT)

ax.set_ylabel("Variance Explained (%)", fontsize=13)
ax.set_title("Variance explained by each principal component",
             fontsize=14, pad=12)
ax.set_ylim(0, 110)

plt.savefig("pca_variance_explained.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca_variance_explained.png")


# ── Step 5: Scoring ──────────────────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 5: Scoring (PC1)")
print("=" * 60)

w1 = eigenvectors[0, 0]
w2 = eigenvectors[1, 0]
df["pc1"] = w1 * df["z_le"] + w2 * df["z_im"]

print(f"Eigenvector weights: w1 = {w1:.4f}, w2 = {w2:.4f}")
print(f"\nPC1 score statistics:")
print(f"  Mean:  {df['pc1'].mean():.4f}")
print(f"  Std:   {df['pc1'].std(ddof=0):.4f}")
print(f"  Min:   {df['pc1'].min():.4f}")
print(f"  Max:   {df['pc1'].max():.4f}")

# Top and bottom 5
print(f"\nTop 5 countries (highest PC1):")
top5 = df.nlargest(5, "pc1")[["country", "life_exp", "infant_mort", "pc1"]]
print(top5.to_string(index=False))
print(f"\nBottom 5 countries (lowest PC1):")
bot5 = df.nsmallest(5, "pc1")[["country", "life_exp", "infant_mort", "pc1"]]
print(bot5.to_string(index=False))

# Application: Country_01
print(f"\n--- Application: Country_01 ---")
z_le_01 = df.loc[df["country"] == "Country_01", "z_le"].values[0]
z_im_01 = df.loc[df["country"] == "Country_01", "z_im"].values[0]
pc1_01 = w1 * z_le_01 + w2 * z_im_01
print(f"PC1 = {w1:.4f} x {z_le_01:.4f} + {w2:.4f} x {z_im_01:.4f}")
print(f"    = {w1 * z_le_01:.4f} + {w2 * z_im_01:.4f}")
print(f"    = {pc1_01:.4f}")


# ── Figure 4: PC1 scores bar chart ───────────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 4: PC1 scores ranked")
print("=" * 60)

df_sorted = df.sort_values("pc1", ascending=True)

fig, ax = plt.subplots(figsize=(10, 14))
fig.patch.set_linewidth(0)

colors = [TEAL if v >= 0 else WARM_ORANGE for v in df_sorted["pc1"]]
ax.barh(range(len(df_sorted)), df_sorted["pc1"], color=colors,
        edgecolor=DARK_NAVY, height=0.7)
ax.set_yticks(range(len(df_sorted)))
ax.set_yticklabels(df_sorted["country"], fontsize=8)
ax.axvline(0, color=LIGHT_TEXT, linewidth=0.8, zorder=1)
ax.set_xlabel("PC1 Score", fontsize=13)
ax.set_title("PC1 scores: countries ranked by health performance",
             fontsize=14, pad=12)

plt.savefig("pca_pc1_scores.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca_pc1_scores.png")


# ── Step 6: Normalization ────────────────────────────────────────────

print("\n" + "=" * 60)
print("STEP 6: Normalization (Min-Max)")
print("=" * 60)

pc1_min = df["pc1"].min()
pc1_max = df["pc1"].max()
df["health_index"] = (df["pc1"] - pc1_min) / (pc1_max - pc1_min)

print(f"PC1 range: [{pc1_min:.4f}, {pc1_max:.4f}]")
print(f"\nHealth Index statistics:")
print(f"  Mean:   {df['health_index'].mean():.4f}")
print(f"  Median: {df['health_index'].median():.4f}")
print(f"  Std:    {df['health_index'].std(ddof=0):.4f}")

print(f"\nTop 10 countries:")
top10 = df.nlargest(10, "health_index")[["country", "life_exp", "infant_mort", "health_index"]]
print(top10.to_string(index=False))

print(f"\nBottom 10 countries:")
bot10 = df.nsmallest(10, "health_index")[["country", "life_exp", "infant_mort", "health_index"]]
print(bot10.to_string(index=False))

# Application: Country_01
print(f"\n--- Application: Country_01 ---")
pc1_01 = df.loc[df["country"] == "Country_01", "pc1"].values[0]
hi_01 = (pc1_01 - pc1_min) / (pc1_max - pc1_min)
print(f"HI = ({pc1_01:.4f} - ({pc1_min:.4f})) / ({pc1_max:.4f} - ({pc1_min:.4f}))")
print(f"   = {pc1_01 - pc1_min:.4f} / {pc1_max - pc1_min:.4f}")
print(f"   = {hi_01:.4f}")


# ── Figure 5: Health Index bar chart ─────────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 5: Health Index (0-1)")
print("=" * 60)

df_sorted_hi = df.sort_values("health_index", ascending=True)

fig, ax = plt.subplots(figsize=(10, 14))
fig.patch.set_linewidth(0)

# Gradient from orange (low) to teal (high)
n = len(df_sorted_hi)
cmap_colors = []
for i, val in enumerate(df_sorted_hi["health_index"]):
    # Interpolate between WARM_ORANGE and TEAL
    r_o, g_o, b_o = int("d9", 16), int("77", 16), int("57", 16)
    r_t, g_t, b_t = int("00", 16), int("d4", 16), int("c8", 16)
    f = val
    r = int(r_o + f * (r_t - r_o))
    g = int(g_o + f * (g_t - g_o))
    b = int(b_o + f * (b_t - b_o))
    cmap_colors.append(f"#{r:02x}{g:02x}{b:02x}")

ax.barh(range(n), df_sorted_hi["health_index"], color=cmap_colors,
        edgecolor=DARK_NAVY, height=0.7)
ax.set_yticks(range(n))
ax.set_yticklabels(df_sorted_hi["country"], fontsize=8)
ax.set_xlabel("Health Index (0 = worst, 1 = best)", fontsize=13)
ax.set_title("Health Index: countries ranked from 0 (worst) to 1 (best)",
             fontsize=14, pad=12)
ax.set_xlim(0, 1.05)

plt.savefig("pca_health_index.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca_health_index.png")


# ── Full PCA pipeline with scikit-learn (from CSV) ───────────────────

print("\n" + "=" * 60)
print("SKLEARN PCA: Full pipeline from CSV")
print("=" * 60)

# Configuration (change these for your own dataset)
CSV_FILE = "health_data.csv"
POSITIVE_COLS = ["life_exp"]
NEGATIVE_COLS = ["infant_mort"]

# Step 1: Load raw data from CSV
df_sk = pd.read_csv(CSV_FILE)
print(f"Loaded: {df_sk.shape[0]} countries, {df_sk.shape[1]} columns")

# Step 2: Polarity adjustment — flip negative indicators
for col in NEGATIVE_COLS:
    df_sk[col + "_adj"] = -1 * df_sk[col]
adj_cols = POSITIVE_COLS + [col + "_adj" for col in NEGATIVE_COLS]

# Step 3: Standardization — Z-scores (mean=0, std=1)
scaler_sk = StandardScaler()
Z_sk = scaler_sk.fit_transform(df_sk[adj_cols])

# Step 4: PCA — fit to find eigenvectors and eigenvalues
pca_sk = PCA(n_components=1)
pca_sk.fit(Z_sk)

# Step 5: Transform — project data onto the first principal component
df_sk["pc1"] = pca_sk.transform(Z_sk)[:, 0]

# Step 6: Normalization — Min-Max scaling to 0-1
df_sk["health_index"] = (
    (df_sk["pc1"] - df_sk["pc1"].min())
    / (df_sk["pc1"].max() - df_sk["pc1"].min())
)

# Export results
df_sk.to_csv("health_index_results.csv", index=False)

# Summary
print(f"\nPC1 weights: {pca_sk.components_[0].round(4)}")
print(f"Variance explained: {pca_sk.explained_variance_ratio_.round(4)}")
print(f"\nTop 5 countries:")
print(df_sk.nlargest(5, "health_index")[
    ["country", "life_exp", "infant_mort", "health_index"]
].to_string(index=False))
print(f"\nBottom 5 countries:")
print(df_sk.nsmallest(5, "health_index")[
    ["country", "life_exp", "infant_mort", "health_index"]
].to_string(index=False))
print(f"\nSaved: health_index_results.csv")


# ── Comparison: Manual vs scikit-learn ───────────────────────────────

print("\n" + "=" * 60)
print("COMPARISON: Manual vs scikit-learn")
print("=" * 60)

sklearn_pc1 = df_sk["pc1"].values

# Handle sign ambiguity: eigenvectors can point in either direction
sign_corr = np.corrcoef(df["pc1"], sklearn_pc1)[0, 1]
if sign_corr < 0:
    sklearn_pc1 = -sklearn_pc1
    df_sk["pc1"] = sklearn_pc1
    print("Note: sklearn returned opposite sign (normal). Flipped for comparison.")

max_diff_pca = np.max(np.abs(sklearn_pc1 - df["pc1"].values))
corr_manual_sklearn = np.corrcoef(df["pc1"], sklearn_pc1)[0, 1]
print(f"Max absolute difference in PC1 scores: {max_diff_pca:.2e}")
print(f"Correlation between manual and sklearn: {corr_manual_sklearn:.6f}")


# ── Figure 6: Manual vs sklearn comparison ───────────────────────────

print("\n" + "=" * 60)
print("FIGURE 6: Manual vs sklearn comparison")
print("=" * 60)

fig, ax = plt.subplots(figsize=(6, 6))
fig.patch.set_linewidth(0)

ax.scatter(df["pc1"], sklearn_pc1, color=STEEL_BLUE, edgecolors=DARK_NAVY,
           s=60, zorder=3)

# Perfect agreement line
lim_min = min(df["pc1"].min(), sklearn_pc1.min()) - 0.2
lim_max = max(df["pc1"].max(), sklearn_pc1.max()) + 0.2
ax.plot([lim_min, lim_max], [lim_min, lim_max], color=WARM_ORANGE,
        linewidth=2, linestyle="--", label="Perfect agreement", zorder=2)

ax.set_xlabel("Manual PC1 Score", fontsize=13)
ax.set_ylabel("scikit-learn PC1 Score", fontsize=13)
ax.set_title("Manual vs. scikit-learn PCA: verification",
             fontsize=14, pad=12)
ax.legend(loc="upper left")
ax.set_aspect("equal")
ax.set_xlim(lim_min, lim_max)
ax.set_ylim(lim_min, lim_max)

plt.savefig("pca_sklearn_comparison.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca_sklearn_comparison.png")


# ── Summary table ────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("SUMMARY TABLE")
print("=" * 60)

print(f"\n| Step | Input | Output | Key Result |")
print(f"|------|-------|--------|------------|")
print(f"| Polarity | IM (raw) | IM* = -IM | Correlation: {raw_corr:.2f} to {adj_corr:+.2f} |")
print(f"| Standardization | LE, IM* | Z_LE, Z_IM | Mean=0, SD=1 for both |")
print(f"| Covariance | Z matrix | 2x2 matrix | Off-diagonal r = {cov_matrix[0,1]:.2f} |")
print(f"| Eigen-decomposition | Cov matrix | eigenvalues, eigenvectors | PC1 captures {var_explained[0]:.1f}% |")
print(f"| Scoring | Z * eigvec | PC1 scores | Range: [{df['pc1'].min():.2f}, {df['pc1'].max():.2f}] |")
print(f"| Normalization | PC1 | Health Index | Range: [0.00, 1.00] |")


# ── Featured image ───────────────────────────────────────────────────

shutil.copy("pca_health_index.png", "featured.png")
print("\nSaved: featured.png")

print("\n" + "=" * 60)
print("DONE -- all figures generated successfully")
print("=" * 60)
