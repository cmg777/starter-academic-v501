"""
Pooled PCA for Building Development Indicators Across Time

Demonstrates pooled PCA for constructing a composite development index
from Education, Health, and Income sub-indices across two time periods
(2013 and 2019) for 153 sub-national regions of South America, using
the Global Data Lab's Subnational Human Development Index data.

Usage:
    python script.py

References:
    - Smits, J. & Permanyer, I. (2019). The Subnational Human Development
      Database. Scientific Data, 6, 190038.
    - Jolliffe & Cadima (2016). Principal Component Analysis: A Review
      and Recent Developments. Phil. Trans. R. Soc. A.
    - Peiro-Palomino, Picazo-Tadeo, and Rios (2023). Social Progress
      around the World. Oxford Economic Papers.
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

# Dark theme palette
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

INDICATORS = ["education", "health", "income"]


# ── Data Loading and Reshaping ───────────────────────────────────────

print("=" * 60)
print("DATA LOADING AND RESHAPING")
print("=" * 60)

raw = pd.read_csv("data.csv")
print(f"\nRaw dataset: {raw.shape[0]} regions, {raw.shape[1]} columns")
print(f"Countries: {raw['country'].nunique()} ({', '.join(sorted(raw['country'].unique()))})")

# Reshape wide → long
rows = []
for _, r in raw.iterrows():
    for year in [2013, 2019]:
        rows.append({
            "GDLcode": r["GDLcode"],
            "region": r["region"],
            "country": r["country"],
            "period": f"Y{year}",
            "education": round(r[f"edindex{year}"], 4),
            "health": round(r[f"healthindex{year}"], 4),
            "income": round(r[f"incindex{year}"], 4),
            "shdi_official": round(r[f"shdi{year}"], 4),
            "pop": round(r[f"pop{year}"], 1),
        })

df = pd.DataFrame(rows)

# Create informative label: shortened region + country abbreviation
COUNTRY_ABBR = {
    "Argentina": "ARG", "Bolivia": "BOL", "Brazil": "BRA",
    "Chile": "CHL", "Colombia": "COL", "Ecuador": "ECU",
    "Guyana": "GUY", "Paraguay": "PRY", "Peru": "PER",
    "Suriname": "SUR", "Uruguay": "URY", "Venezuela": "VEN",
}


def make_label(region, country, max_len=25):
    """Shorten region name and append country abbreviation."""
    abbr = COUNTRY_ABBR.get(country, country[:3].upper())
    short = region[:max_len].rstrip(", ") if len(region) > max_len else region
    return f"{short} ({abbr})"


df["region_country"] = df.apply(
    lambda r: make_label(r["region"], r["country"]), axis=1
)

df.to_csv("hdi_panel_data.csv", index=False)

print(f"\nPanel dataset: {df.shape[0]} rows (= {raw.shape[0]} regions x 2 periods)")
print(f"\nFirst 6 rows:")
print(df[["region_country", "period", "education", "health", "income"]].head(6).to_string(index=False))

# Regions per country
print(f"\nRegions per country:")
regions_per_country = raw["country"].value_counts().sort_index()
print(regions_per_country.to_string())

print(f"\nDescriptive statistics (all periods):")
print(df[INDICATORS].describe().round(4).to_string())

# Period means
print(f"\nPeriod means:")
period_means = df.groupby("period")[INDICATORS].mean().round(4)
print(period_means.to_string())

# Period mean changes
p1_means = df[df["period"] == "Y2013"][INDICATORS].mean()
p2_means = df[df["period"] == "Y2019"][INDICATORS].mean()
changes = p2_means - p1_means
print(f"\nMean changes (2019 - 2013):")
print(f"  Education: {changes['education']:+.4f}")
print(f"  Health:    {changes['health']:+.4f}")
print(f"  Income:    {changes['income']:+.4f}")


# ── Exploring the raw data ───────────────────────────────────────────

print("\n" + "=" * 60)
print("EXPLORING RAW DATA")
print("=" * 60)

# Country-level means by period
print(f"\nCountry-level means by period:")
country_means = (df.groupby(["country", "period"])[INDICATORS]
                 .mean().round(3).unstack("period"))
country_means.columns = [f"{col[0]}_{col[1]}" for col in country_means.columns]
print(country_means.to_string())

corr_matrix = df[INDICATORS].corr().round(4)
print(f"\nPooled correlation matrix:")
print(corr_matrix.to_string())


# ── Figure 1: Correlation heatmap ────────────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 1: Correlation heatmap")
print("=" * 60)

fig, ax = plt.subplots(figsize=(6, 5))
fig.patch.set_linewidth(0)

corr_vals = corr_matrix.values
labels = ["Education", "Health", "Income"]
im = ax.imshow(corr_vals, cmap="Blues", vmin=0.5, vmax=1.0)

ax.set_xticks(range(3))
ax.set_yticks(range(3))
ax.set_xticklabels(labels, fontsize=12)
ax.set_yticklabels(labels, fontsize=12)

for i in range(3):
    for j in range(3):
        color = WHITE_TEXT if corr_vals[i, j] > 0.85 else NEAR_BLACK
        ax.text(j, i, f"{corr_vals[i, j]:.3f}", ha="center", va="center",
                fontsize=14, fontweight="bold", color=color)

ax.set_title("Pooled correlation matrix (2013 + 2019)", fontsize=14, pad=12)

plt.savefig("pca2_correlation_heatmap.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_correlation_heatmap.png")


# ── Figure 2: Period shift scatter ───────────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 2: Period shift scatter")
print("=" * 60)

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_linewidth(0)

p1 = df[df["period"] == "Y2013"]
p2 = df[df["period"] == "Y2019"]

ax.scatter(p1["education"], p1["income"], color=STEEL_BLUE,
           edgecolors=DARK_NAVY, s=40, zorder=3, alpha=0.7, label="2013")
ax.scatter(p2["education"], p2["income"], color=WARM_ORANGE,
           edgecolors=DARK_NAVY, s=40, zorder=3, alpha=0.7, label="2019")

# Centroid arrows
c1_edu, c1_inc = p1["education"].mean(), p1["income"].mean()
c2_edu, c2_inc = p2["education"].mean(), p2["income"].mean()
ax.annotate("", xy=(c2_edu, c2_inc), xytext=(c1_edu, c1_inc),
            arrowprops=dict(arrowstyle="-|>", color=TEAL, lw=2.5))
ax.text(c2_edu + 0.01, c2_inc + 0.01, "Education up,\nIncome down",
        color=TEAL, fontsize=10, fontweight="bold")

ax.set_xlabel("Education Index", fontsize=13)
ax.set_ylabel("Income Index", fontsize=13)
ax.set_title("Education vs. Income by period (153 South American regions)",
             fontsize=14, pad=12)
ax.legend(loc="lower right")

plt.savefig("pca2_period_shift_scatter.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_period_shift_scatter.png")


# ── Per-period PCA (the WRONG approach) ──────────────────────────────

print("\n" + "=" * 60)
print("PER-PERIOD PCA (the problem)")
print("=" * 60)


def run_single_period_pca(df_period, indicators):
    """Run the full PCA pipeline on a single-period DataFrame."""
    X = df_period[indicators].values
    means = X.mean(axis=0)
    stds = X.std(axis=0, ddof=0)
    Z = (X - means) / stds
    cov = np.cov(Z.T, ddof=0)
    eigenvalues, eigenvectors = np.linalg.eigh(cov)
    idx = np.argsort(eigenvalues)[::-1]
    eigenvalues = eigenvalues[idx]
    eigenvectors = eigenvectors[:, idx]
    if eigenvectors[0, 0] < 0:
        eigenvectors[:, 0] *= -1
    pc1 = Z @ eigenvectors[:, 0]
    hdi = (pc1 - pc1.min()) / (pc1.max() - pc1.min())
    return {"pc1": pc1, "hdi": hdi, "weights": eigenvectors[:, 0],
            "eigenvalues": eigenvalues,
            "var_explained": eigenvalues / eigenvalues.sum() * 100,
            "means": means, "stds": stds}


pp_p1 = run_single_period_pca(df[df["period"] == "Y2013"], INDICATORS)
pp_p2 = run_single_period_pca(df[df["period"] == "Y2019"], INDICATORS)

print(f"\nPer-period eigenvector weights (PC1):")
print(f"  2013: [{pp_p1['weights'][0]:.4f}, {pp_p1['weights'][1]:.4f}, {pp_p1['weights'][2]:.4f}]")
print(f"  2019: [{pp_p2['weights'][0]:.4f}, {pp_p2['weights'][1]:.4f}, {pp_p2['weights'][2]:.4f}]")
print(f"  Shift: [{pp_p2['weights'][0] - pp_p1['weights'][0]:+.4f}, "
      f"{pp_p2['weights'][1] - pp_p1['weights'][1]:+.4f}, "
      f"{pp_p2['weights'][2] - pp_p1['weights'][2]:+.4f}]")

print(f"\nPer-period variance explained (PC1):")
print(f"  2013: {pp_p1['var_explained'][0]:.2f}%")
print(f"  2019: {pp_p2['var_explained'][0]:.2f}%")

print(f"\nPer-period standardization parameters:")
print(f"  2013 means: [{pp_p1['means'][0]:.4f}, {pp_p1['means'][1]:.4f}, {pp_p1['means'][2]:.4f}]")
print(f"  2019 means: [{pp_p2['means'][0]:.4f}, {pp_p2['means'][1]:.4f}, {pp_p2['means'][2]:.4f}]")
print(f"  2013 stds:  [{pp_p1['stds'][0]:.4f}, {pp_p1['stds'][1]:.4f}, {pp_p1['stds'][2]:.4f}]")
print(f"  2019 stds:  [{pp_p2['stds'][0]:.4f}, {pp_p2['stds'][1]:.4f}, {pp_p2['stds'][2]:.4f}]")

# Store per-period HDI
df_p1 = df[df["period"] == "Y2013"].copy()
df_p2 = df[df["period"] == "Y2019"].copy()
df_p1["pp_hdi"] = pp_p1["hdi"]
df_p2["pp_hdi"] = pp_p2["hdi"]
df_p1["pp_rank"] = df_p1["pp_hdi"].rank(ascending=False).astype(int)
df_p2["pp_rank"] = df_p2["pp_hdi"].rank(ascending=False).astype(int)

# Per-period HDI change statistics
pp_change = df_p2["pp_hdi"].values - df_p1["pp_hdi"].values
print(f"\nPer-period HDI change statistics:")
print(f"  Mean change: {pp_change.mean():.4f}")
print(f"  Countries declining: {(pp_change < 0).sum()} / {len(pp_change)}")

# Find a good running example: region where per-period says decline but pooled says improvement
# We'll identify this after pooled PCA is computed


# ── Figure 3: Per-period weight comparison ───────────────────────────

print("\n" + "=" * 60)
print("FIGURE 3: Per-period weight comparison")
print("=" * 60)

fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_linewidth(0)

x = np.arange(3)
width = 0.3
bars1 = ax.bar(x - width/2, pp_p1["weights"], width, color=STEEL_BLUE,
               edgecolor=DARK_NAVY, label="2013")
bars2 = ax.bar(x + width/2, pp_p2["weights"], width, color=WARM_ORANGE,
               edgecolor=DARK_NAVY, label="2019")

for bar in bars1:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
            f"{bar.get_height():.3f}", ha="center", va="bottom",
            fontsize=10, color=LIGHT_TEXT)
for bar in bars2:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
            f"{bar.get_height():.3f}", ha="center", va="bottom",
            fontsize=10, color=LIGHT_TEXT)

ax.set_xticks(x)
ax.set_xticklabels(["Education", "Health", "Income"], fontsize=12)
ax.set_ylabel("Eigenvector weight (PC1)", fontsize=13)
ax.set_title("Per-period PCA: eigenvector weights shift between 2013 and 2019",
             fontsize=14, pad=12)
ax.legend()
ax.set_ylim(0, ax.get_ylim()[1] * 1.15)

plt.savefig("pca2_perperiod_weights.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_perperiod_weights.png")


# ── Figure 4: Per-period rank slopegraph ─────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 4: Per-period rank slopegraph")
print("=" * 60)

fig, ax = plt.subplots(figsize=(8, 10))
fig.patch.set_linewidth(0)

rank_change = df_p2["pp_rank"].values - df_p1["pp_rank"].values
abs_change = np.abs(rank_change)
top_changers_idx = np.argsort(abs_change)[-10:]

for i in top_changers_idx:
    r1 = df_p1.iloc[i]["pp_rank"]
    r2 = df_p2.iloc[i]["pp_rank"]
    label = df_p1.iloc[i]["region_country"]

    color = TEAL if r2 < r1 else WARM_ORANGE
    ax.plot([0, 1], [r1, r2], color=color, linewidth=2, alpha=0.8)
    ax.text(-0.05, r1, f"{label} (#{int(r1)})", ha="right", va="center",
            fontsize=7, color=LIGHT_TEXT)
    ax.text(1.05, r2, f"{label} (#{int(r2)})", ha="left", va="center",
            fontsize=7, color=LIGHT_TEXT)

ax.set_xlim(-0.6, 1.6)
ax.set_ylim(160, -5)
ax.set_xticks([0, 1])
ax.set_xticklabels(["2013 Rank", "2019 Rank"], fontsize=13)
ax.set_ylabel("Rank (1 = best)", fontsize=13)
ax.set_title("Per-period PCA: rank shifts for 10 regions\n(teal = improved, orange = declined)",
             fontsize=14, pad=12)

plt.savefig("pca2_perperiod_rank_shift.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_perperiod_rank_shift.png")


# ── Pooled PCA ───────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("POOLED PCA")
print("=" * 60)

# Step 2: Pooled standardization
X_all = df[INDICATORS].values  # 306 rows
pooled_means = X_all.mean(axis=0)
pooled_stds = X_all.std(axis=0, ddof=0)
Z_pooled = (X_all - pooled_means) / pooled_stds

print(f"\nPooled standardization parameters:")
print(f"  Means: [{pooled_means[0]:.4f}, {pooled_means[1]:.4f}, {pooled_means[2]:.4f}]")
print(f"  Stds:  [{pooled_stds[0]:.4f}, {pooled_stds[1]:.4f}, {pooled_stds[2]:.4f}]")

print(f"\nZ-score statistics (pooled):")
print(f"  Means: [{Z_pooled[:, 0].mean():.6f}, {Z_pooled[:, 1].mean():.6f}, {Z_pooled[:, 2].mean():.6f}]")
print(f"  Stds:  [{Z_pooled[:, 0].std(ddof=0):.6f}, {Z_pooled[:, 1].std(ddof=0):.6f}, {Z_pooled[:, 2].std(ddof=0):.6f}]")

# Verify with sklearn
scaler = StandardScaler()
Z_sklearn = scaler.fit_transform(X_all)
max_diff_std = np.max(np.abs(Z_sklearn - Z_pooled))
print(f"\nMax difference from sklearn StandardScaler: {max_diff_std:.2e}")

# Step 3: Pooled covariance matrix
cov_pooled = np.cov(Z_pooled.T, ddof=0)
print(f"\nPooled covariance matrix (3x3):")
for i in range(3):
    row = "  [" + "  ".join(f"{cov_pooled[i, j]:.4f}" for j in range(3)) + "]"
    print(row)

# Step 4: Pooled eigen-decomposition
eigenvalues, eigenvectors = np.linalg.eigh(cov_pooled)
idx = np.argsort(eigenvalues)[::-1]
eigenvalues = eigenvalues[idx]
eigenvectors = eigenvectors[:, idx]

if eigenvectors[0, 0] < 0:
    eigenvectors[:, 0] *= -1

var_explained = eigenvalues / eigenvalues.sum() * 100

print(f"\nPooled eigenvalues: [{eigenvalues[0]:.4f}, {eigenvalues[1]:.4f}, {eigenvalues[2]:.4f}]")
print(f"Sum of eigenvalues: {eigenvalues.sum():.4f}")
print(f"\nPooled eigenvector (PC1): [{eigenvectors[0, 0]:.4f}, {eigenvectors[1, 0]:.4f}, {eigenvectors[2, 0]:.4f}]")
print(f"\nVariance explained:")
print(f"  PC1: {var_explained[0]:.2f}%")
print(f"  PC2: {var_explained[1]:.2f}%")
print(f"  PC3: {var_explained[2]:.2f}%")

# Step 5: Scoring
w = eigenvectors[:, 0]
df["pc1"] = Z_pooled @ w

print(f"\nPooled PC1 score statistics:")
print(f"  Mean:  {df['pc1'].mean():.4f}")
print(f"  Std:   {df['pc1'].std(ddof=0):.4f}")
print(f"  Min:   {df['pc1'].min():.4f}")
print(f"  Max:   {df['pc1'].max():.4f}")

pc1_p1 = df[df["period"] == "Y2013"]["pc1"]
pc1_p2 = df[df["period"] == "Y2019"]["pc1"]
print(f"\n  2013 mean: {pc1_p1.mean():.4f}")
print(f"  2019 mean: {pc1_p2.mean():.4f}")
print(f"  Shift:     {pc1_p2.mean() - pc1_p1.mean():+.4f}")

# Step 6: Pooled normalization
pc1_min = df["pc1"].min()
pc1_max = df["pc1"].max()
df["hdi"] = (df["pc1"] - pc1_min) / (pc1_max - pc1_min)

print(f"\nPooled HDI statistics:")
print(f"  Mean:   {df['hdi'].mean():.4f}")
print(f"  Median: {df['hdi'].median():.4f}")
print(f"  Std:    {df['hdi'].std(ddof=0):.4f}")

# Top/bottom by period
df_pooled_p1 = df[df["period"] == "Y2013"].copy()
df_pooled_p2 = df[df["period"] == "Y2019"].copy()

print(f"\nPooled HDI — 2013 top 5:")
print(df_pooled_p1.nlargest(5, "hdi")[["region_country", "education", "health", "income", "hdi"]].to_string(index=False))
print(f"\nPooled HDI — 2019 top 5:")
print(df_pooled_p2.nlargest(5, "hdi")[["region_country", "education", "health", "income", "hdi"]].to_string(index=False))
print(f"\nPooled HDI — 2013 bottom 5:")
print(df_pooled_p1.nsmallest(5, "hdi")[["region_country", "education", "health", "income", "hdi"]].to_string(index=False))
print(f"\nPooled HDI — 2019 bottom 5:")
print(df_pooled_p2.nsmallest(5, "hdi")[["region_country", "education", "health", "income", "hdi"]].to_string(index=False))


# ── Find running example region ──────────────────────────────────────

print("\n" + "=" * 60)
print("RUNNING EXAMPLE REGION")
print("=" * 60)

# Build comparison for all regions
df_wide = df_pooled_p1[["region", "country", "region_country", "hdi"]].rename(columns={"hdi": "hdi_p1"}).merge(
    df_pooled_p2[["region", "country", "hdi"]].rename(columns={"hdi": "hdi_p2"}),
    on=["region", "country"]
)
df_wide["hdi_change"] = df_wide["hdi_p2"] - df_wide["hdi_p1"]

pp_wide = df_p1[["region", "country", "pp_hdi"]].rename(columns={"pp_hdi": "pp_p1"}).merge(
    df_p2[["region", "country", "pp_hdi"]].rename(columns={"pp_hdi": "pp_p2"}),
    on=["region", "country"]
)
pp_wide["pp_change"] = pp_wide["pp_p2"] - pp_wide["pp_p1"]

compare = df_wide.merge(pp_wide, on=["region", "country"])
compare["method_diff"] = compare["hdi_change"] - compare["pp_change"]

# Direction disagreement
disagree = ((compare["hdi_change"] > 0) & (compare["pp_change"] < 0)) | \
           ((compare["hdi_change"] < 0) & (compare["pp_change"] > 0))
print(f"Regions where methods disagree on direction: {disagree.sum()} / {len(compare)}")

# Find regions where per-period says decline but pooled says improvement
reversal = (compare["hdi_change"] > 0) & (compare["pp_change"] < 0)
reversals = compare[reversal].sort_values("method_diff", ascending=False)
print(f"\nRegions with reversal (pooled=up, per-period=down): {reversal.sum()}")
if len(reversals) > 0:
    print(f"\nTop 5 reversal regions:")
    print(reversals.head()[["region_country", "hdi_p1", "hdi_p2", "hdi_change",
                            "pp_p1", "pp_p2", "pp_change"]].round(4).to_string(index=False))

# Pick the most interesting running example
# (largest positive method_diff with reversal, or just the biggest method_diff)
example = compare.sort_values("method_diff", ascending=False).iloc[0]
EXAMPLE_LABEL = example["region_country"]
print(f"\nRunning example: {EXAMPLE_LABEL}")
print(f"  Per-period: 2013={example['pp_p1']:.4f}, 2019={example['pp_p2']:.4f}, Change={example['pp_change']:+.4f}")
print(f"  Pooled:     2013={example['hdi_p1']:.4f}, 2019={example['hdi_p2']:.4f}, Change={example['hdi_change']:+.4f}")


# ── Figure 5: Pooled variance explained ──────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 5: Pooled variance explained")
print("=" * 60)

fig, ax = plt.subplots(figsize=(6, 4))
fig.patch.set_linewidth(0)

bars = ax.bar(["PC1", "PC2", "PC3"], var_explained,
              color=[WARM_ORANGE, STEEL_BLUE, TEAL],
              edgecolor=DARK_NAVY, width=0.5)

for bar, val in zip(bars, var_explained):
    ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1,
            f"{val:.1f}%", ha="center", va="bottom", fontsize=13,
            fontweight="bold", color=WHITE_TEXT)

ax.set_ylabel("Variance Explained (%)", fontsize=13)
ax.set_title("Pooled PCA: variance explained by each component", fontsize=14, pad=12)
ax.set_ylim(0, 110)

plt.savefig("pca2_pooled_variance_explained.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_pooled_variance_explained.png")


# ── Figure 6: Pooled HDI paired bars (top/bottom 15) ────────────────

print("\n" + "=" * 60)
print("FIGURE 6: Pooled HDI paired bars")
print("=" * 60)

df_wide_sorted = df_wide.sort_values("hdi_p2", ascending=True)

# Top 15 and bottom 15
top15 = df_wide_sorted.tail(15)
bot15 = df_wide_sorted.head(15)
show_df = pd.concat([bot15, top15])

fig, ax = plt.subplots(figsize=(10, 12))
fig.patch.set_linewidth(0)

y = np.arange(len(show_df))
height = 0.35

# Truncate long region names
labels = list(show_df["region_country"])

ax.barh(y - height/2, show_df["hdi_p1"], height, color=STEEL_BLUE,
        edgecolor=DARK_NAVY, label="2013", alpha=0.9)
ax.barh(y + height/2, show_df["hdi_p2"], height, color=WARM_ORANGE,
        edgecolor=DARK_NAVY, label="2019", alpha=0.9)

ax.set_yticks(y)
ax.set_yticklabels(labels, fontsize=7)
ax.set_xlabel("Pooled HDI (0 = worst, 1 = best)", fontsize=13)
ax.set_title("Pooled HDI: top and bottom 15 regions (2013 vs 2019)", fontsize=14, pad=12)
ax.set_xlim(0, 1.05)
ax.legend(loc="lower right")

# Separator line between bottom and top groups
ax.axhline(y=14.5, color=GRID_LINE, linewidth=1, linestyle="--")

plt.savefig("pca2_pooled_hdi_bars.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_pooled_hdi_bars.png")


# ── The contrast: pooled vs per-period ───────────────────────────────

print("\n" + "=" * 60)
print("CONTRAST: Pooled vs Per-period PCA")
print("=" * 60)

from scipy.stats import spearmanr

# Level rank correlation
rho_level, _ = spearmanr(compare["hdi_p2"], compare["pp_p2"])
print(f"\nSpearman rank correlation (2019 levels): rho = {rho_level:.4f}")

# Change rank correlation
rho_change, _ = spearmanr(compare["hdi_change"], compare["pp_change"])
print(f"Spearman rank correlation (HDI change): rho = {rho_change:.4f}")

print(f"\nRegions where methods disagree on direction: {disagree.sum()} / {len(compare)}")

# Show 10 most discrepant regions
compare_sorted = compare.sort_values("method_diff")
print(f"\n5 regions with largest negative discrepancy (pooled < per-period change):")
show_cols = ["region_country", "hdi_change", "pp_change", "method_diff"]
print(compare_sorted.head(5)[show_cols].round(4).to_string(index=False))
print(f"\n5 regions with largest positive discrepancy (pooled > per-period change):")
print(compare_sorted.tail(5)[show_cols].round(4).to_string(index=False))


# ── Figure 7: Pooled vs per-period change scatter ────────────────────

print("\n" + "=" * 60)
print("FIGURE 7: Pooled vs per-period change scatter")
print("=" * 60)

fig, ax = plt.subplots(figsize=(7, 7))
fig.patch.set_linewidth(0)

ax.scatter(compare["hdi_change"], compare["pp_change"],
           color=STEEL_BLUE, edgecolors=DARK_NAVY, s=40, zorder=3, alpha=0.7)

lim_min = min(compare["hdi_change"].min(), compare["pp_change"].min()) - 0.02
lim_max = max(compare["hdi_change"].max(), compare["pp_change"].max()) + 0.02
ax.plot([lim_min, lim_max], [lim_min, lim_max], color=WARM_ORANGE,
        linewidth=2, linestyle="--", label="Perfect agreement", zorder=2)
ax.axhline(0, color=GRID_LINE, linewidth=0.8, zorder=1)
ax.axvline(0, color=GRID_LINE, linewidth=0.8, zorder=1)

# Label extreme outliers
top_outliers = compare.nlargest(3, "method_diff")
bot_outliers = compare.nsmallest(3, "method_diff")
for _, row in pd.concat([top_outliers, bot_outliers]).iterrows():
    label = row["region_country"]
    ax.annotate(label, (row["hdi_change"], row["pp_change"]),
                fontsize=6, color=TEAL, xytext=(5, 5),
                textcoords="offset points")

ax.set_xlabel("Pooled HDI change (2019 - 2013)", fontsize=13)
ax.set_ylabel("Per-period HDI change (2019 - 2013)", fontsize=13)
ax.set_title("Pooled vs. per-period PCA: HDI change comparison", fontsize=14, pad=12)
ax.legend(loc="upper left")
ax.set_aspect("equal")

plt.savefig("pca2_pooled_vs_perperiod_change.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_pooled_vs_perperiod_change.png")


# ── Figure 8: Change-rank comparison bump chart ──────────────────────

print("\n" + "=" * 60)
print("FIGURE 8: Change-rank comparison bump chart")
print("=" * 60)

compare["pooled_change_rank"] = compare["hdi_change"].rank(ascending=False).astype(int)
compare["pp_change_rank"] = compare["pp_change"].rank(ascending=False).astype(int)
compare["change_rank_diff"] = np.abs(compare["pooled_change_rank"] - compare["pp_change_rank"])

fig, ax = plt.subplots(figsize=(8, 10))
fig.patch.set_linewidth(0)

top_change_rank_diff = compare.nlargest(10, "change_rank_diff")

for _, row in top_change_rank_diff.iterrows():
    r_pooled = row["pooled_change_rank"]
    r_pp = row["pp_change_rank"]
    label = row["region_country"]

    color = TEAL if r_pooled < r_pp else WARM_ORANGE
    ax.plot([0, 1], [r_pooled, r_pp], color=color, linewidth=2, alpha=0.8)
    ax.text(-0.05, r_pooled, f"{label} (#{int(r_pooled)})", ha="right",
            va="center", fontsize=7, color=LIGHT_TEXT)
    ax.text(1.05, r_pp, f"{label} (#{int(r_pp)})", ha="left",
            va="center", fontsize=7, color=LIGHT_TEXT)

ax.set_xlim(-0.6, 1.6)
ax.set_ylim(160, -5)
ax.set_xticks([0, 1])
ax.set_xticklabels(["Pooled Improvement Rank", "Per-period Improvement Rank"], fontsize=11)
ax.set_ylabel("Rank (1 = most improved)", fontsize=13)
ax.set_title("Who improved the most? Pooled vs. per-period rankings\n(teal = ranked higher by pooled, orange = ranked lower)",
             fontsize=13, pad=12)

plt.savefig("pca2_rank_comparison_bump.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_rank_comparison_bump.png")


# ── Validation: Pooled vs Per-period PCA against Official SHDI ───────

print("\n" + "=" * 60)
print("VALIDATION: Pooled vs Per-period PCA against Official SHDI")
print("=" * 60)

# Add per-period HDI to main DataFrame for comparison
# Must sort by index because df interleaves Y2013/Y2019 rows
df["pp_hdi"] = pd.concat([df_p1["pp_hdi"], df_p2["pp_hdi"]]).sort_index().values

# Pooled PCA vs official SHDI
corr_pooled = df["hdi"].corr(df["shdi_official"])
r2_pooled = corr_pooled ** 2

# Per-period PCA vs official SHDI
corr_pp = df["pp_hdi"].corr(df["shdi_official"])
r2_pp = corr_pp ** 2

print(f"\nPooled PCA vs official SHDI:")
print(f"  Pearson r:  {corr_pooled:.4f}")
print(f"  R-squared:  {r2_pooled:.4f}")

print(f"\nPer-period PCA vs official SHDI:")
print(f"  Pearson r:  {corr_pp:.4f}")
print(f"  R-squared:  {r2_pp:.4f}")

print(f"\nR-squared difference (pooled - per-period): {r2_pooled - r2_pp:+.4f}")


# ── Figure 9: Pooled vs Per-period PCA against Official SHDI ────────

print("\n" + "=" * 60)
print("FIGURE 9: Pooled vs Per-period PCA against Official SHDI")
print("=" * 60)

from numpy.polynomial.polynomial import polyfit

fig, axes = plt.subplots(1, 2, figsize=(14, 6), sharey=False)
fig.patch.set_linewidth(0)

p1_mask = df["period"] == "Y2013"
p2_mask = df["period"] == "Y2019"

# Panel A: Pooled PCA vs SHDI
ax = axes[0]
ax.scatter(df.loc[p1_mask, "shdi_official"], df.loc[p1_mask, "hdi"],
           color=STEEL_BLUE, edgecolors=DARK_NAVY, s=30, alpha=0.7,
           zorder=3, label="2013")
ax.scatter(df.loc[p2_mask, "shdi_official"], df.loc[p2_mask, "hdi"],
           color=WARM_ORANGE, edgecolors=DARK_NAVY, s=30, alpha=0.7,
           zorder=3, label="2019")
b, m = polyfit(df["shdi_official"], df["hdi"], 1)
x_line = np.linspace(df["shdi_official"].min(), df["shdi_official"].max(), 100)
ax.plot(x_line, b + m * x_line, color=TEAL, linewidth=2, zorder=2)
ax.set_xlabel("Official SHDI", fontsize=12)
ax.set_ylabel("Pooled PCA HDI", fontsize=12)
ax.set_title(f"Pooled PCA  (R² = {r2_pooled:.4f})", fontsize=13, pad=10)
ax.legend(loc="upper left", fontsize=9)

# Panel B: Per-period PCA vs SHDI
ax = axes[1]
ax.scatter(df.loc[p1_mask, "shdi_official"], df.loc[p1_mask, "pp_hdi"],
           color=STEEL_BLUE, edgecolors=DARK_NAVY, s=30, alpha=0.7,
           zorder=3, label="2013")
ax.scatter(df.loc[p2_mask, "shdi_official"], df.loc[p2_mask, "pp_hdi"],
           color=WARM_ORANGE, edgecolors=DARK_NAVY, s=30, alpha=0.7,
           zorder=3, label="2019")
b2, m2 = polyfit(df["shdi_official"], df["pp_hdi"], 1)
ax.plot(x_line, b2 + m2 * x_line, color=TEAL, linewidth=2, zorder=2)
ax.set_xlabel("Official SHDI", fontsize=12)
ax.set_ylabel("Per-period PCA HDI", fontsize=12)
ax.set_title(f"Per-period PCA  (R² = {r2_pp:.4f})", fontsize=13, pad=10)
ax.legend(loc="upper left", fontsize=9)

fig.suptitle("Validation: which PCA method tracks the official SHDI better?",
             fontsize=14, y=1.02)
plt.tight_layout()

plt.savefig("pca2_validation_vs_shdi.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_validation_vs_shdi.png")


# ── Validation: Changes ──────────────────────────────────────────────

print("\n" + "=" * 60)
print("VALIDATION: Changes — PCA HDI change vs official SHDI change")
print("=" * 60)

# Compute official SHDI change per region
shdi_wide = (df.loc[p1_mask, ["region", "country", "shdi_official"]]
             .rename(columns={"shdi_official": "shdi_p1"}))
shdi_wide = shdi_wide.merge(
    df.loc[p2_mask, ["region", "country", "shdi_official"]]
    .rename(columns={"shdi_official": "shdi_p2"}),
    on=["region", "country"]
)
shdi_wide["shdi_change"] = shdi_wide["shdi_p2"] - shdi_wide["shdi_p1"]

# Merge with existing comparison table
compare_val = compare.merge(shdi_wide[["region", "country", "shdi_change"]],
                            on=["region", "country"])

# R² for changes
corr_pooled_change = compare_val["hdi_change"].corr(compare_val["shdi_change"])
r2_pooled_change = corr_pooled_change ** 2

corr_pp_change = compare_val["pp_change"].corr(compare_val["shdi_change"])
r2_pp_change = corr_pp_change ** 2

print(f"\nPooled PCA change vs official SHDI change:")
print(f"  Pearson r:  {corr_pooled_change:.4f}")
print(f"  R-squared:  {r2_pooled_change:.4f}")

print(f"\nPer-period PCA change vs official SHDI change:")
print(f"  Pearson r:  {corr_pp_change:.4f}")
print(f"  R-squared:  {r2_pp_change:.4f}")

print(f"\nR-squared difference (pooled - per-period): {r2_pooled_change - r2_pp_change:+.4f}")


# ── Figure 10: Change validation ─────────────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 10: Change validation — PCA HDI change vs SHDI change")
print("=" * 60)

fig, axes = plt.subplots(1, 2, figsize=(14, 6))
fig.patch.set_linewidth(0)

# Panel A: Pooled PCA change vs SHDI change
ax = axes[0]
ax.scatter(compare_val["shdi_change"], compare_val["hdi_change"],
           color=STEEL_BLUE, edgecolors=DARK_NAVY, s=40, alpha=0.7, zorder=3)
b_c, m_c = polyfit(compare_val["shdi_change"], compare_val["hdi_change"], 1)
x_change = np.linspace(compare_val["shdi_change"].min(), compare_val["shdi_change"].max(), 100)
ax.plot(x_change, b_c + m_c * x_change, color=TEAL, linewidth=2, zorder=2)
ax.axhline(0, color=GRID_LINE, linewidth=0.8, zorder=1)
ax.axvline(0, color=GRID_LINE, linewidth=0.8, zorder=1)
ax.set_xlabel("Official SHDI change (2019 - 2013)", fontsize=12)
ax.set_ylabel("Pooled PCA HDI change", fontsize=12)
ax.set_title(f"Pooled PCA  (R² = {r2_pooled_change:.4f})", fontsize=13, pad=10)

# Panel B: Per-period PCA change vs SHDI change
ax = axes[1]
ax.scatter(compare_val["shdi_change"], compare_val["pp_change"],
           color=STEEL_BLUE, edgecolors=DARK_NAVY, s=40, alpha=0.7, zorder=3)
b_c2, m_c2 = polyfit(compare_val["shdi_change"], compare_val["pp_change"], 1)
ax.plot(x_change, b_c2 + m_c2 * x_change, color=TEAL, linewidth=2, zorder=2)
ax.axhline(0, color=GRID_LINE, linewidth=0.8, zorder=1)
ax.axvline(0, color=GRID_LINE, linewidth=0.8, zorder=1)
ax.set_xlabel("Official SHDI change (2019 - 2013)", fontsize=12)
ax.set_ylabel("Per-period PCA HDI change", fontsize=12)
ax.set_title(f"Per-period PCA  (R² = {r2_pp_change:.4f})", fontsize=13, pad=10)

fig.suptitle("Validation: which PCA method better captures development dynamics?",
             fontsize=14, y=1.02)
plt.tight_layout()

plt.savefig("pca2_validation_changes.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_validation_changes.png")


# ── Reusable sklearn pipeline ────────────────────────────────────────

print("\n" + "=" * 60)
print("SKLEARN PIPELINE: Pooled PCA for panel data")
print("=" * 60)

CSV_FILE = "hdi_panel_data.csv"
ID_COL = "region_country"
PERIOD_COL = "period"
POSITIVE_COLS = ["education", "health", "income"]
NEGATIVE_COLS = []

df_sk = pd.read_csv(CSV_FILE)
print(f"Loaded: {df_sk.shape[0]} rows, {df_sk.shape[1]} columns")

for col in NEGATIVE_COLS:
    df_sk[col + "_adj"] = -1 * df_sk[col]
adj_cols = POSITIVE_COLS + [col + "_adj" for col in NEGATIVE_COLS]

scaler_sk = StandardScaler()
Z_sk = scaler_sk.fit_transform(df_sk[adj_cols])

pca_sk = PCA(n_components=1)
df_sk["pc1"] = pca_sk.fit_transform(Z_sk)[:, 0]

df_sk["pc1_index"] = (
    (df_sk["pc1"] - df_sk["pc1"].min())
    / (df_sk["pc1"].max() - df_sk["pc1"].min())
)

df_sk.to_csv("pc1_index_results.csv", index=False)

indicator_cols = POSITIVE_COLS + NEGATIVE_COLS
print(f"\nPC1 weights: {pca_sk.components_[0].round(4)}")
print(f"Variance explained: {pca_sk.explained_variance_ratio_.round(4)}")
print(f"\nTop 5:")
print(df_sk.nlargest(5, "pc1_index")[
    [ID_COL, PERIOD_COL] + indicator_cols + ["pc1_index"]
].to_string(index=False))
print(f"\nBottom 5:")
print(df_sk.nsmallest(5, "pc1_index")[
    [ID_COL, PERIOD_COL] + indicator_cols + ["pc1_index"]
].to_string(index=False))
print(f"\nSaved: pc1_index_results.csv")


# ── Comparison: Manual vs sklearn ────────────────────────────────────

print("\n" + "=" * 60)
print("COMPARISON: Manual vs sklearn")
print("=" * 60)

sklearn_pc1 = df_sk["pc1"].values
manual_pc1 = df["pc1"].values

sign_corr = np.corrcoef(manual_pc1, sklearn_pc1)[0, 1]
if sign_corr < 0:
    sklearn_pc1 = -sklearn_pc1
    print("Note: sklearn returned opposite sign (normal). Flipped for comparison.")

max_diff_pca = np.max(np.abs(sklearn_pc1 - manual_pc1))
corr_manual_sklearn = np.corrcoef(manual_pc1, sklearn_pc1)[0, 1]
print(f"Max absolute difference in PC1 scores: {max_diff_pca:.2e}")
print(f"Correlation between manual and sklearn: {corr_manual_sklearn:.6f}")


# ── Application: Spatial Distribution Dynamics (Choropleth) ──────────

print("\n" + "=" * 60)
print("APPLICATION: Spatial Distribution Dynamics (Choropleth Maps)")
print("=" * 60)

import geopandas as gpd
import mapclassify
import contextily as cx

# Load GeoJSON and merge pooled HDI
gdf = gpd.read_file("data.geojson")

# Merge HDI for both periods
hdi_2013 = df_pooled_p1[["GDLcode", "hdi"]].rename(columns={"hdi": "hdi_2013"})
hdi_2019 = df_pooled_p2[["GDLcode", "hdi"]].rename(columns={"hdi": "hdi_2019"})
gdf = gdf.merge(hdi_2013, on="GDLcode")
gdf = gdf.merge(hdi_2019, on="GDLcode")

# Reproject to Web Mercator for contextily basemap
gdf_3857 = gdf.to_crs(epsg=3857)

# Fisher-Jenks breaks from 2013 (held constant for 2019)
fj = mapclassify.FisherJenks(gdf_3857["hdi_2013"].values, k=5)
breaks = fj.bins.tolist()
print(f"\nFisher-Jenks breaks (from 2013): {[round(b, 3) for b in breaks]}")

# Extend upper break to cover 2019 max (which may exceed 2013 max)
max_val = max(gdf_3857["hdi_2013"].max(), gdf_3857["hdi_2019"].max())
if max_val > breaks[-1]:
    breaks[-1] = float(round(max_val + 0.001, 3))

# Apply adjusted breaks to 2019
fj_2019 = mapclassify.UserDefined(gdf_3857["hdi_2019"].values, bins=breaks)

# Class labels for legend
class_labels = []
lower = 0.0
for b in breaks:
    class_labels.append(f"{lower:.2f} – {b:.2f}")
    lower = b

print(f"Fisher-Jenks breaks (adjusted): {[round(b, 3) for b in breaks]}")
print(f"Class labels: {class_labels}")

# Count transitions (regions that moved up at least one class)
classes_2013 = fj.yb
classes_2019 = fj_2019.yb
improved = (classes_2019 > classes_2013).sum()
declined = (classes_2019 < classes_2013).sum()
stayed = (classes_2019 == classes_2013).sum()
print(f"\nClass transitions (2013 → 2019):")
print(f"  Improved (moved up):  {improved}")
print(f"  Stayed same:          {stayed}")
print(f"  Declined (moved down): {declined}")


# ── Figure 11: Choropleth maps ──────────────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 11: Choropleth maps (2013 vs 2019)")
print("=" * 60)

fig, axes = plt.subplots(1, 2, figsize=(16, 12))
fig.patch.set_facecolor(DARK_NAVY)
fig.patch.set_linewidth(0)

vmin = 0.0
vmax = max(breaks)

from matplotlib.patches import Patch

cmap = plt.cm.coolwarm
norm = plt.Normalize(vmin=0, vmax=len(breaks) - 1)

for ax, year_col, title, year_fj in [
    (axes[0], "hdi_2013", "Pooled PCA HDI — 2013", fj),
    (axes[1], "hdi_2019", "Pooled PCA HDI — 2019", fj_2019),
]:
    # Classify and assign colors manually
    year_classes = year_fj.yb
    colors = [cmap(norm(c)) for c in year_classes]

    gdf_3857.plot(
        ax=ax, color=colors,
        edgecolor=DARK_NAVY, linewidth=0.3,
        missing_kwds={"color": "lightgray"},
    )
    cx.add_basemap(ax, source=cx.providers.CartoDB.DarkMatter, zoom=4, attribution="")
    ax.set_title(title, fontsize=14, color=WHITE_TEXT, pad=10)
    ax.set_axis_off()

    # Build legend manually with correct counts
    counts = np.bincount(year_fj.yb, minlength=len(breaks))
    handles = []
    for i, (cl, c) in enumerate(zip(class_labels, counts)):
        handles.append(Patch(facecolor=cmap(norm(i)), edgecolor=DARK_NAVY,
                             label=f"{cl}  (n={c})"))

    leg = ax.legend(handles=handles, title="HDI Class", loc="lower right",
                    fontsize=16, title_fontsize=17)
    leg.set_frame_on(True)
    leg.get_frame().set_facecolor("#1a1a2e")
    leg.get_frame().set_edgecolor(LIGHT_TEXT)
    leg.get_frame().set_alpha(0.9)
    leg.get_frame().set_linewidth(1.5)
    for text in leg.get_texts():
        text.set_color(WHITE_TEXT)
    leg.get_title().set_color(WHITE_TEXT)

fig.suptitle("Spatial distribution dynamics: Pooled PCA HDI\n(Fisher-Jenks breaks from 2013 held constant)",
             fontsize=15, color=WHITE_TEXT, y=0.95)
plt.tight_layout(rect=[0, 0, 1, 0.93])

plt.savefig("pca2_choropleth_hdi.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_choropleth_hdi.png")


# ── Application: Spatial Inequality Dynamics (Gini) ──────────────────

print("\n" + "=" * 60)
print("APPLICATION: Spatial Inequality Dynamics (Gini Index)")
print("=" * 60)


from inequality.gini import Gini

# Compute Gini for each indicator and pooled HDI, per period
gini_rows = []
for period_label in ["Y2013", "Y2019"]:
    mask = df["period"] == period_label
    row = {"period": period_label}
    for col in INDICATORS + ["hdi"]:
        row[col] = round(Gini(df.loc[mask, col].values).g, 4)
    gini_rows.append(row)

gini_df = pd.DataFrame(gini_rows).set_index("period")

# Add change row
change_row = gini_df.loc["Y2019"] - gini_df.loc["Y2013"]
change_row.name = "Change"
gini_df = pd.concat([gini_df, change_row.to_frame().T])

print(f"\nGini index by indicator and period:")
print(gini_df.to_string())


# ── Figure 11: Gini inequality dynamics ──────────────────────────────

print("\n" + "=" * 60)
print("FIGURE 11: Gini inequality dynamics")
print("=" * 60)

fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_linewidth(0)

labels = ["Education", "Health", "Income", "Pooled HDI"]
cols = INDICATORS + ["hdi"]
vals_2013 = [gini_df.loc["Y2013", c] for c in cols]
vals_2019 = [gini_df.loc["Y2019", c] for c in cols]

x = np.arange(len(labels))
width = 0.3

bars1 = ax.bar(x - width/2, vals_2013, width, color=STEEL_BLUE,
               edgecolor=DARK_NAVY, label="2013")
bars2 = ax.bar(x + width/2, vals_2019, width, color=WARM_ORANGE,
               edgecolor=DARK_NAVY, label="2019")

for bar in bars1:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.002,
            f"{bar.get_height():.4f}", ha="center", va="bottom",
            fontsize=9, color=LIGHT_TEXT)
for bar in bars2:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.002,
            f"{bar.get_height():.4f}", ha="center", va="bottom",
            fontsize=9, color=LIGHT_TEXT)

ax.set_xticks(x)
ax.set_xticklabels(labels, fontsize=12)
ax.set_ylabel("Gini Index", fontsize=13)
ax.set_title("Spatial inequality dynamics: Gini index by indicator (2013 vs 2019)",
             fontsize=14, pad=12)
ax.legend()
ax.set_ylim(0, ax.get_ylim()[1] * 1.15)

plt.savefig("pca2_gini_dynamics.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_gini_dynamics.png")


# ── Population-weighted Gini ─────────────────────────────────────────

print("\n" + "=" * 60)
print("POPULATION-WEIGHTED GINI")
print("=" * 60)


def weighted_gini(values, weights):
    """Compute the population-weighted Gini index using the Lorenz curve.

    Parameters
    ----------
    values : array-like — indicator values (e.g., HDI per region)
    weights : array-like — population weights (e.g., region population)

    Returns
    -------
    float — weighted Gini coefficient in [0, 1]
    """
    v = np.asarray(values, dtype=float)
    w = np.asarray(weights, dtype=float)
    # Sort by values
    order = np.argsort(v)
    v = v[order]
    w = w[order]
    # Cumulative population and value shares
    cum_w = np.cumsum(w) / np.sum(w)
    cum_vw = np.cumsum(v * w) / np.sum(v * w)
    # Prepend zero for trapezoidal integration
    cum_w = np.concatenate(([0], cum_w))
    cum_vw = np.concatenate(([0], cum_vw))
    # Area under Lorenz curve (trapezoidal rule)
    B = np.sum((cum_w[1:] - cum_w[:-1]) * (cum_vw[1:] + cum_vw[:-1]) / 2)
    return 1 - 2 * B


# Compute weighted Gini for each indicator and pooled HDI, per period
wgini_rows = []
for period_label in ["Y2013", "Y2019"]:
    mask = df["period"] == period_label
    row = {"period": period_label}
    for col in INDICATORS + ["hdi"]:
        row[col] = round(weighted_gini(
            df.loc[mask, col].values, df.loc[mask, "pop"].values
        ), 4)
    wgini_rows.append(row)

wgini_df = pd.DataFrame(wgini_rows).set_index("period")
wchange_row = wgini_df.loc["Y2019"] - wgini_df.loc["Y2013"]
wchange_row.name = "Change"
wgini_df = pd.concat([wgini_df, wchange_row.to_frame().T])

print(f"\nPopulation-weighted Gini index:")
print(wgini_df.to_string())

# Comparison table: unweighted vs weighted
print(f"\nComparison: unweighted vs population-weighted Gini")
for col in INDICATORS + ["hdi"]:
    uw_13 = gini_df.loc["Y2013", col]
    uw_19 = gini_df.loc["Y2019", col]
    pw_13 = wgini_df.loc["Y2013", col]
    pw_19 = wgini_df.loc["Y2019", col]
    print(f"  {col:12s}  Unweighted: {uw_13:.4f} -> {uw_19:.4f} ({uw_19 - uw_13:+.4f})  "
          f"Weighted: {pw_13:.4f} -> {pw_19:.4f} ({pw_19 - pw_13:+.4f})")


# ── Figure 12: Unweighted vs weighted Gini ───────────────────────────

print("\n" + "=" * 60)
print("FIGURE 12: Unweighted vs weighted Gini comparison")
print("=" * 60)

fig, axes = plt.subplots(1, 2, figsize=(14, 5), sharey=True)
fig.patch.set_linewidth(0)

labels = ["Education", "Health", "Income", "Pooled HDI"]
cols = INDICATORS + ["hdi"]
x = np.arange(len(labels))
width = 0.3

# Panel A: Unweighted Gini
ax = axes[0]
uw_13 = [gini_df.loc["Y2013", c] for c in cols]
uw_19 = [gini_df.loc["Y2019", c] for c in cols]
ax.bar(x - width/2, uw_13, width, color=STEEL_BLUE, edgecolor=DARK_NAVY, label="2013")
ax.bar(x + width/2, uw_19, width, color=WARM_ORANGE, edgecolor=DARK_NAVY, label="2019")
for i, (v13, v19) in enumerate(zip(uw_13, uw_19)):
    ax.text(i - width/2, v13 + 0.002, f"{v13:.4f}", ha="center", va="bottom",
            fontsize=8, color=LIGHT_TEXT)
    ax.text(i + width/2, v19 + 0.002, f"{v19:.4f}", ha="center", va="bottom",
            fontsize=8, color=LIGHT_TEXT)
ax.set_xticks(x)
ax.set_xticklabels(labels, fontsize=11)
ax.set_ylabel("Gini Index", fontsize=13)
ax.set_title("Unweighted Gini", fontsize=13, pad=10)
ax.legend(fontsize=9)

# Panel B: Population-weighted Gini
ax = axes[1]
pw_13 = [wgini_df.loc["Y2013", c] for c in cols]
pw_19 = [wgini_df.loc["Y2019", c] for c in cols]
ax.bar(x - width/2, pw_13, width, color=STEEL_BLUE, edgecolor=DARK_NAVY, label="2013")
ax.bar(x + width/2, pw_19, width, color=WARM_ORANGE, edgecolor=DARK_NAVY, label="2019")
for i, (v13, v19) in enumerate(zip(pw_13, pw_19)):
    ax.text(i - width/2, v13 + 0.002, f"{v13:.4f}", ha="center", va="bottom",
            fontsize=8, color=LIGHT_TEXT)
    ax.text(i + width/2, v19 + 0.002, f"{v19:.4f}", ha="center", va="bottom",
            fontsize=8, color=LIGHT_TEXT)
ax.set_xticks(x)
ax.set_xticklabels(labels, fontsize=11)
ax.set_title("Population-weighted Gini", fontsize=13, pad=10)
ax.legend(fontsize=9)

fig.suptitle("Spatial inequality: unweighted vs. population-weighted Gini",
             fontsize=14, y=1.02)
plt.tight_layout()

plt.savefig("pca2_gini_weighted_comparison.png", dpi=300, bbox_inches="tight",
            facecolor=DARK_NAVY, edgecolor=DARK_NAVY, pad_inches=0)
plt.close()
print("Saved: pca2_gini_weighted_comparison.png")


# ── Summary table ────────────────────────────────────────────────────

print("\n" + "=" * 60)
print("SUMMARY TABLE")
print("=" * 60)

print(f"\n| Step | Input | Output | Key Result |")
print(f"|------|-------|--------|------------|")
print(f"| Stack | 2 periods x 153 regions | 306-row DataFrame | Panel format ready |")
print(f"| Polarity | Raw indicators | Aligned indicators | All positive (no flip needed) |")
print(f"| Pooled Standardization | 306 rows | Z-scores (pooled) | Fixed baseline across periods |")
print(f"| Pooled Covariance | Z matrix | 3x3 matrix | Off-diagonals: see above |")
print(f"| Pooled Eigen-decomposition | Cov matrix | eigenvalues, eigenvectors | PC1 captures {var_explained[0]:.1f}% |")
print(f"| Scoring | Z * eigvec | PC1 scores | 2019 mean > 2013 mean |")
print(f"| Pooled Normalization | PC1 | HDI (0-1) | Comparable across periods |")


# ── Featured image ───────────────────────────────────────────────────

shutil.copy("pca2_pooled_hdi_bars.png", "featured.png")
print("\nSaved: featured.png")

print("\n" + "=" * 60)
print("DONE -- all figures generated successfully")
print("=" * 60)
