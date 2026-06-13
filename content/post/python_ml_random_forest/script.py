"""
Introduction to Machine Learning: Random Forest Regression (cross-validation edition)

Predicts Bolivia's Municipal Sustainable Development Index (IMDS) from satellite
image embeddings using Random Forest regression. The model is evaluated with
5-fold cross-validation: every one of the 339 municipalities receives an
out-of-fold (OOF) prediction from a forest that never saw it during training.

Data comes from the DS4Bolivia repository
(https://github.com/quarcs-lab/ds4bolivia).

Outputs (written next to this script):
  Figures (main body):
    ml_target_distribution.png
    ml_embedding_correlations.png
    ml_per_fold_metrics.png
    ml_actual_vs_predicted.png          (all 339 OOF points, colored by fold)
    ml_residuals.png                    (OOF residuals, colored by fold)
    ml_distribution_overlap.png
    ml_feature_importance_mdi.png
    ml_feature_importance_permutation.png
    ml_partial_dependence.png
  Figures (appendices):
    ml_appendix_split_variability.png   (Appendix A)
    ml_appendix_optuna_history.png      (Appendix B)
    ml_appendix_tuning_comparison.png   (Appendix B)
  Tables:
    ml_cv_fold_metrics.csv
    ml_rf_results.csv
    ml_distribution_stats.csv
    ml_tuning_comparison.csv
    ml_rf_best_params.csv
  Machine-readable summary (used by the post / slides / web app):
    ml_summary.json

Usage:
    python script.py
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
from scipy.stats import randint, gaussian_kde, ks_2samp
from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import PartialDependenceDisplay, permutation_importance
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import (
    GridSearchCV,
    KFold,
    RandomizedSearchCV,
    cross_val_predict,
    cross_val_score,
    cross_validate,
    train_test_split,
)

import optuna

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
RANDOM_SEED = 42
N_FOLDS = 5
np.random.seed(RANDOM_SEED)

TARGET = "imds"
TARGET_LABEL = "IMDS (Municipal Sustainable Development Index)"
TARGET_SHORT = "IMDS"

FEATURE_COLS = [f"A{i:02d}" for i in range(64)]

OUTPUT_DIR = Path(__file__).parent
DS4BOLIVIA_BASE = "https://raw.githubusercontent.com/quarcs-lab/ds4bolivia/master"

# Site palette + two extra fold colors so all five folds are distinguishable.
COLOR_PRIMARY = "#6a9bcc"   # steel blue
COLOR_ACCENT = "#d97757"    # warm orange
COLOR_DARK = "#141413"      # near black
COLOR_TEAL = "#00d4c8"      # teal
FOLD_COLORS = ["#6a9bcc", "#d97757", "#00d4c8", "#8e6fb0", "#e0a23a"]

# Opt-in dark style for the published blog post (run with RF_FIG_STYLE=dark). The
# default light run produces the canonical ml_*.png that the slide deck reuses; the
# dark run writes ml_*_dark.png on a navy canvas matching the site's dark theme.
DARK = os.environ.get("RF_FIG_STYLE", "").lower() == "dark"
SUFFIX = "_dark" if DARK else ""
LINE = "#c8d0e0" if DARK else COLOR_DARK          # reference lines (45-deg, means, hlines)
BASELINE_BAR = "#9aa6bd" if DARK else COLOR_DARK  # tuning-comparison baseline bar
ANNOT_FC = "#0f1729" if DARK else "white"         # annotation box fill

plt.rcParams.update({
    "figure.dpi": 110,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "grid.alpha": 0.25,
    "font.size": 11,
})
if DARK:
    plt.rcParams.update({
        "figure.facecolor": "#1a2236", "axes.facecolor": "#1a2236", "savefig.facecolor": "#1a2236",
        "text.color": "#e8ecf2", "axes.titlecolor": "#e8ecf2", "axes.labelcolor": "#c8d0e0",
        "axes.edgecolor": "#3a4a6a", "xtick.color": "#c8d0e0", "ytick.color": "#c8d0e0",
        "grid.color": "#33415c", "grid.alpha": 0.4,
        "legend.facecolor": "#0f1729", "legend.edgecolor": "#3a4a6a", "legend.labelcolor": "#e8ecf2",
    })


def rmse(y_true, y_pred) -> float:
    """Root mean squared error (version-proof across scikit-learn releases)."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


summary: dict = {}

# ---------------------------------------------------------------------------
# 4. Data loading  (section numbers below mirror index.md)
# ---------------------------------------------------------------------------
# Three DS4Bolivia tables are merged on asdf_id, which uniquely identifies each
# of Bolivia's 339 municipalities.
print("Downloading data from DS4Bolivia ...")
sdg = pd.read_csv(f"{DS4BOLIVIA_BASE}/sdg/sdg.csv")
embeddings = pd.read_csv(
    f"{DS4BOLIVIA_BASE}/satelliteEmbeddings/satelliteEmbeddings2017.csv"
)
regions = pd.read_csv(f"{DS4BOLIVIA_BASE}/regionNames/regionNames.csv")

df = sdg.merge(embeddings, on="asdf_id").merge(regions, on="asdf_id")
print(f"Merged dataset shape: {df.shape}")

X = df[FEATURE_COLS]
y = df[TARGET]
mask = X.notna().all(axis=1) & y.notna()
X = X[mask].reset_index(drop=True)
y = y[mask].reset_index(drop=True)
n_obs = int(len(y))
print(f"Observations after dropping missing values: {n_obs}")
print(f"Target ({TARGET}): mean={y.mean():.2f}, std={y.std():.2f}, "
      f"min={y.min():.2f}, max={y.max():.2f}")

summary["data"] = {
    "n_obs": n_obs,
    "n_features": len(FEATURE_COLS),
    "target_mean": round(float(y.mean()), 2),
    "target_std": round(float(y.std()), 2),
    "target_min": round(float(y.min()), 2),
    "target_max": round(float(y.max()), 2),
    "target_median": round(float(y.median()), 2),
}

# ---------------------------------------------------------------------------
# 5. Exploratory data analysis
# ---------------------------------------------------------------------------
# 5.1 Target distribution
fig, ax = plt.subplots(figsize=(8, 5))
ax.hist(y, bins=30, edgecolor="white", alpha=0.85, color=COLOR_PRIMARY)
ax.axvline(y.mean(), color=COLOR_ACCENT, linestyle="--", linewidth=2,
           label=f"Mean = {y.mean():.1f}")
ax.axvline(y.median(), color=LINE, linestyle=":", linewidth=2,
           label=f"Median = {y.median():.1f}")
ax.set_xlabel(TARGET_LABEL)
ax.set_ylabel("Count")
ax.set_title(f"Distribution of {TARGET_SHORT} across {n_obs} municipalities")
ax.legend()
plt.savefig(OUTPUT_DIR / f"ml_target_distribution{SUFFIX}.png")
plt.close()
print(f"Saved: ml_target_distribution{SUFFIX}.png")

# 5.2 Embedding correlations
correlations = X.corrwith(y).abs().sort_values(ascending=False)
top10_features = correlations.head(10).index.tolist()
corr_matrix = df.loc[mask, top10_features + [TARGET]].corr()
fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(corr_matrix, annot=True, fmt=".2f", cmap="RdBu_r", center=0,
            square=True, ax=ax, vmin=-1, vmax=1)
ax.set_title(f"Correlations: top-10 embeddings & {TARGET_SHORT}")
plt.savefig(OUTPUT_DIR / f"ml_embedding_correlations{SUFFIX}.png")
plt.close()
print(f"Saved: ml_embedding_correlations{SUFFIX}.png")
summary["eda"] = {
    "top_corr_feature": top10_features[0],
    "top_corr_value": round(float(correlations.iloc[0]), 3),
    "top10_features": top10_features,
}

# ---------------------------------------------------------------------------
# 6. Baseline Random Forest model
# ---------------------------------------------------------------------------
# Default hyperparameters (100 trees). We never tune in the main body — the
# appendix shows that tuning barely moves the needle on this problem.
baseline_rf = RandomForestRegressor(n_estimators=100, random_state=RANDOM_SEED)

# ---------------------------------------------------------------------------
# 7. Cross-validation: out-of-fold predictions for every municipality
# ---------------------------------------------------------------------------
kf = KFold(n_splits=N_FOLDS, shuffle=True, random_state=RANDOM_SEED)

# Idiomatic per-fold metrics with three scorers.
cv = cross_validate(
    baseline_rf, X, y, cv=kf,
    scoring=("r2", "neg_root_mean_squared_error", "neg_mean_absolute_error"),
)
fold_r2 = cv["test_r2"]
fold_rmse = -cv["test_neg_root_mean_squared_error"]
fold_mae = -cv["test_neg_mean_absolute_error"]

# Out-of-fold predictions for ALL points, plus the fold that produced each.
oof_pred = cross_val_predict(baseline_rf, X, y, cv=kf)
fold_id = np.empty(n_obs, dtype=int)
for k, (_, test_idx) in enumerate(kf.split(X), start=1):
    fold_id[test_idx] = k

# Self-check: per-fold metrics from grouped OOF predictions must match
# cross_validate exactly (same folds, deterministic forest).
for k in range(1, N_FOLDS + 1):
    m = fold_id == k
    assert np.isclose(r2_score(y[m], oof_pred[m]), fold_r2[k - 1], atol=1e-9), \
        f"fold {k} r2 mismatch"

print("\nPer-fold R²:  ", np.round(fold_r2, 4))
print("Per-fold RMSE:", np.round(fold_rmse, 4))
print("Per-fold MAE: ", np.round(fold_mae, 4))
print(f"Mean R²  = {fold_r2.mean():.4f} ± {fold_r2.std():.4f}")
print(f"Mean RMSE= {fold_rmse.mean():.4f} ± {fold_rmse.std():.4f}")
print(f"Mean MAE = {fold_mae.mean():.4f} ± {fold_mae.std():.4f}")

# Pooled OOF metrics (computed once over all 339 predictions) — different from
# the average of the five per-fold numbers.
pooled_r2 = r2_score(y, oof_pred)
pooled_rmse = rmse(y, oof_pred)
pooled_mae = mean_absolute_error(y, oof_pred)
print(f"\nPooled OOF R²   = {pooled_r2:.4f}")
print(f"Pooled OOF RMSE = {pooled_rmse:.4f}")
print(f"Pooled OOF MAE  = {pooled_mae:.4f}")

fold_table = pd.DataFrame({
    "Fold": list(range(1, N_FOLDS + 1)) + ["Mean", "Std"],
    "n": [int((fold_id == k).sum()) for k in range(1, N_FOLDS + 1)] + ["", ""],
    "R2": list(np.round(fold_r2, 4)) + [round(fold_r2.mean(), 4), round(fold_r2.std(), 4)],
    "RMSE": list(np.round(fold_rmse, 4)) + [round(fold_rmse.mean(), 4), round(fold_rmse.std(), 4)],
    "MAE": list(np.round(fold_mae, 4)) + [round(fold_mae.mean(), 4), round(fold_mae.std(), 4)],
})
fold_table.to_csv(OUTPUT_DIR / f"ml_cv_fold_metrics.csv", index=False)
print(f"Saved: ml_cv_fold_metrics.csv")

summary["cv"] = {
    "n_folds": N_FOLDS,
    "fold_sizes": [int((fold_id == k).sum()) for k in range(1, N_FOLDS + 1)],
    "fold_r2": [round(float(v), 4) for v in fold_r2],
    "fold_rmse": [round(float(v), 4) for v in fold_rmse],
    "fold_mae": [round(float(v), 4) for v in fold_mae],
    "mean_r2": round(float(fold_r2.mean()), 4), "std_r2": round(float(fold_r2.std()), 4),
    "mean_rmse": round(float(fold_rmse.mean()), 4), "std_rmse": round(float(fold_rmse.std()), 4),
    "mean_mae": round(float(fold_mae.mean()), 4), "std_mae": round(float(fold_mae.std()), 4),
    "pooled_r2": round(float(pooled_r2), 4),
    "pooled_rmse": round(float(pooled_rmse), 4),
    "pooled_mae": round(float(pooled_mae), 4),
}

# ---------------------------------------------------------------------------
# 8. Evaluating predictions across folds  -> ml_per_fold_metrics.png
# ---------------------------------------------------------------------------
fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))
panels = [
    ("R²", fold_r2, COLOR_PRIMARY),
    ("RMSE", fold_rmse, COLOR_ACCENT),
    ("MAE", fold_mae, COLOR_TEAL),
]
folds = np.arange(1, N_FOLDS + 1)
for ax, (name, vals, color) in zip(axes, panels):
    ax.bar(folds, vals, color=color, edgecolor="white", alpha=0.9, width=0.65)
    m, s = vals.mean(), vals.std()
    ax.axhspan(m - s, m + s, color=LINE, alpha=0.12 if DARK else 0.08)
    ax.axhline(m, color=LINE, linestyle="--", linewidth=1.5)
    ax.set_xticks(folds)
    ax.set_xlabel("Fold")
    ax.set_ylabel(name)
    ax.set_title(f"{name}: {m:.3f} ± {s:.3f}")
fig.suptitle("Performance varies across the five folds (dashed = mean, band = ±1 SD)",
             fontsize=13)
plt.tight_layout(rect=(0, 0, 1, 0.94))
plt.savefig(OUTPUT_DIR / f"ml_per_fold_metrics{SUFFIX}.png")
plt.close()
print(f"Saved: ml_per_fold_metrics{SUFFIX}.png")

# ---------------------------------------------------------------------------
# 9. Actual vs predicted (all 339 points, colored by fold)
# ---------------------------------------------------------------------------
residuals = np.asarray(y) - oof_pred

fig, ax = plt.subplots(figsize=(7.2, 7.2))
for k in range(1, N_FOLDS + 1):
    m = fold_id == k
    ax.scatter(y[m], oof_pred[m], s=34, alpha=0.75, edgecolors="white",
               linewidth=0.4, color=FOLD_COLORS[k - 1], label=f"Fold {k}")
lims = [float(min(y.min(), oof_pred.min())) - 2, float(max(y.max(), oof_pred.max())) + 2]
ax.plot(lims, lims, "--", color=LINE, linewidth=1.8, label="Perfect prediction")
ax.set_xlim(lims)
ax.set_ylim(lims)
ax.set_aspect("equal")
ax.set_xlabel(f"Actual {TARGET_SHORT}")
ax.set_ylabel(f"Predicted {TARGET_SHORT} (out-of-fold)")
ax.set_title(f"Out-of-fold predictions for all {n_obs} municipalities")
ax.text(0.04, 0.95, f"Pooled OOF R² = {pooled_r2:.3f}", transform=ax.transAxes,
        va="top", ha="left", fontsize=11,
        bbox=dict(boxstyle="round", fc=ANNOT_FC, ec=LINE, alpha=0.85))
ax.legend(loc="lower right", fontsize=9, ncol=2)
plt.savefig(OUTPUT_DIR / f"ml_actual_vs_predicted{SUFFIX}.png")
plt.close()
print(f"Saved: ml_actual_vs_predicted{SUFFIX}.png")

# 9.2 Residuals, colored by fold
fig, ax = plt.subplots(figsize=(8, 5))
for k in range(1, N_FOLDS + 1):
    m = fold_id == k
    ax.scatter(oof_pred[m], residuals[m], s=30, alpha=0.7, edgecolors="white",
               linewidth=0.4, color=FOLD_COLORS[k - 1], label=f"Fold {k}")
ax.axhline(0, color=LINE, linestyle="--", linewidth=1.8)
ax.set_xlabel(f"Predicted {TARGET_SHORT} (out-of-fold)")
ax.set_ylabel("Residual (actual − predicted)")
ax.set_title("Out-of-fold residuals vs predicted values")
ax.legend(loc="upper right", fontsize=9, ncol=2)
plt.savefig(OUTPUT_DIR / f"ml_residuals{SUFFIX}.png")
plt.close()
print(f"Saved: ml_residuals{SUFFIX}.png")

# ---------------------------------------------------------------------------
# 10. Comparing distributions: predicted vs actual  -> ml_distribution_overlap.png
# ---------------------------------------------------------------------------
ks_stat, ks_p = ks_2samp(np.asarray(y), oof_pred)
bins = np.linspace(lims[0], lims[1], 28)
grid = np.linspace(lims[0], lims[1], 300)
kde_actual = gaussian_kde(np.asarray(y))(grid)
kde_pred = gaussian_kde(oof_pred)(grid)

fig, ax = plt.subplots(figsize=(8.5, 5))
ax.hist(y, bins=bins, density=True, alpha=0.45, color=COLOR_PRIMARY,
        edgecolor="white", label="Actual")
ax.hist(oof_pred, bins=bins, density=True, alpha=0.45, color=COLOR_ACCENT,
        edgecolor="white", label="Predicted (OOF)")
ax.plot(grid, kde_actual, color=COLOR_PRIMARY, linewidth=2)
ax.plot(grid, kde_pred, color=COLOR_ACCENT, linewidth=2)
ax.axvline(y.mean(), color=COLOR_PRIMARY, linestyle=":", linewidth=1.6)
ax.axvline(oof_pred.mean(), color=COLOR_ACCENT, linestyle=":", linewidth=1.6)
ax.set_xlabel(TARGET_SHORT)
ax.set_ylabel("Density")
ax.set_title(f"Predicted vs actual distribution  (KS = {ks_stat:.3f}, p = {ks_p:.3g})")
ax.legend()
plt.savefig(OUTPUT_DIR / f"ml_distribution_overlap{SUFFIX}.png")
plt.close()
print(f"Saved: ml_distribution_overlap{SUFFIX}.png")

dist_stats = pd.DataFrame({
    "Statistic": ["Mean", "Std", "Min", "Max"],
    "Actual": [round(float(y.mean()), 2), round(float(y.std()), 2),
               round(float(y.min()), 2), round(float(y.max()), 2)],
    "Predicted (OOF)": [round(float(oof_pred.mean()), 2), round(float(oof_pred.std()), 2),
                        round(float(oof_pred.min()), 2), round(float(oof_pred.max()), 2)],
})
dist_stats.to_csv(OUTPUT_DIR / f"ml_distribution_stats.csv", index=False)
print(f"Saved: ml_distribution_stats.csv")
summary["distribution"] = {
    "actual_mean": round(float(y.mean()), 2), "actual_std": round(float(y.std()), 2),
    "pred_mean": round(float(oof_pred.mean()), 2), "pred_std": round(float(oof_pred.std()), 2),
    "pred_min": round(float(oof_pred.min()), 2), "pred_max": round(float(oof_pred.max()), 2),
    "std_shrinkage_pct": round(100 * (1 - float(oof_pred.std()) / float(y.std())), 1),
    "ks_stat": round(float(ks_stat), 4), "ks_p": float(ks_p),
}

# ---------------------------------------------------------------------------
# 11. Feature importance  (baseline RF fit on ALL 339 rows)
# ---------------------------------------------------------------------------
rf_full = RandomForestRegressor(n_estimators=100, random_state=RANDOM_SEED)
rf_full.fit(X, y)

# 11.1 Mean decrease in impurity
mdi = pd.Series(rf_full.feature_importances_, index=FEATURE_COLS)
top20_mdi = mdi.sort_values(ascending=False).head(20)
fig, ax = plt.subplots(figsize=(10, 6))
top20_mdi.sort_values().plot.barh(ax=ax, color=COLOR_PRIMARY, edgecolor="white")
ax.set_xlabel("Mean decrease in impurity")
ax.set_title(f"Top-20 feature importance (MDI) for {TARGET_SHORT}")
plt.savefig(OUTPUT_DIR / f"ml_feature_importance_mdi{SUFFIX}.png")
plt.close()
print(f"Saved: ml_feature_importance_mdi{SUFFIX}.png")

# 11.2 Permutation importance
perm = permutation_importance(rf_full, X, y, n_repeats=10,
                              random_state=RANDOM_SEED, n_jobs=-1)
perm_imp = pd.Series(perm.importances_mean, index=FEATURE_COLS)
top20_perm = perm_imp.sort_values(ascending=False).head(20)
fig, ax = plt.subplots(figsize=(10, 6))
top20_perm.sort_values().plot.barh(ax=ax, color=COLOR_ACCENT, edgecolor="white")
ax.set_xlabel("Mean decrease in R² (permutation)")
ax.set_title(f"Top-20 feature importance (permutation) for {TARGET_SHORT}")
plt.savefig(OUTPUT_DIR / f"ml_feature_importance_permutation{SUFFIX}.png")
plt.close()
print(f"Saved: ml_feature_importance_permutation{SUFFIX}.png")

summary["importance"] = {
    "mdi_top5": [[f, round(float(mdi[f]), 4)] for f in mdi.sort_values(ascending=False).head(5).index],
    "perm_top5": [[f, round(float(perm_imp[f]), 4)] for f in perm_imp.sort_values(ascending=False).head(5).index],
}

# ---------------------------------------------------------------------------
# 12. Partial dependence plots  (top-6 by permutation importance)
# ---------------------------------------------------------------------------
top6 = perm_imp.sort_values(ascending=False).head(6).index.tolist()
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
PartialDependenceDisplay.from_estimator(
    rf_full, X, top6, ax=axes.ravel(), grid_resolution=50, n_jobs=-1
)
fig.suptitle(f"Partial dependence — top-6 features for {TARGET_SHORT}", fontsize=14)
plt.tight_layout(rect=(0, 0, 1, 0.95))
plt.savefig(OUTPUT_DIR / f"ml_partial_dependence{SUFFIX}.png")
plt.close()
print(f"Saved: ml_partial_dependence{SUFFIX}.png")
summary["pdp_features"] = top6

# ---------------------------------------------------------------------------
# Summary results table (main body)
# ---------------------------------------------------------------------------
results_df = pd.DataFrame({
    "Metric": ["R²", "RMSE", "MAE"],
    "Per-fold mean": [f"{fold_r2.mean():.3f}", f"{fold_rmse.mean():.2f}", f"{fold_mae.mean():.2f}"],
    "Per-fold SD": [f"{fold_r2.std():.3f}", f"{fold_rmse.std():.2f}", f"{fold_mae.std():.2f}"],
    "Pooled OOF": [f"{pooled_r2:.3f}", f"{pooled_rmse:.2f}", f"{pooled_mae:.2f}"],
})
results_df.to_csv(OUTPUT_DIR / f"ml_rf_results.csv", index=False)
print(f"Saved: ml_rf_results.csv")

# ===========================================================================
# APPENDIX A — Why a single train/test split is unreliable
# ===========================================================================
# Repeat an 80/20 split under 200 different seeds and watch the test-R² wander.
split_r2 = []
for seed in range(200):
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=seed)
    m = RandomForestRegressor(n_estimators=100, random_state=RANDOM_SEED).fit(Xtr, ytr)
    split_r2.append(r2_score(yte, m.predict(Xte)))
split_r2 = np.array(split_r2)
# The single split used by the original tutorial (seed = 42).
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=RANDOM_SEED)
single_split_r2 = r2_score(
    yte, RandomForestRegressor(n_estimators=100, random_state=RANDOM_SEED).fit(Xtr, ytr).predict(Xte))

fig, ax = plt.subplots(figsize=(8.5, 5))
ax.hist(split_r2, bins=30, color=COLOR_PRIMARY, alpha=0.8, edgecolor="white")
ax.axvline(single_split_r2, color=LINE, linestyle=":", linewidth=2,
           label=f"One split (seed 42) = {single_split_r2:.3f}")
ax.axvline(pooled_r2, color=COLOR_ACCENT, linestyle="--", linewidth=2,
           label=f"5-fold CV (pooled OOF) = {pooled_r2:.3f}")
ax.set_xlabel("Test R²")
ax.set_ylabel("Count")
ax.set_title(f"Test R² over 200 random 80/20 splits "
             f"(range {split_r2.min():.2f} to {split_r2.max():.2f})")
ax.legend()
plt.savefig(OUTPUT_DIR / f"ml_appendix_split_variability{SUFFIX}.png")
plt.close()
print(f"Saved: ml_appendix_split_variability{SUFFIX}.png")
summary["appendix_split"] = {
    "n_splits": 200,
    "split_r2_min": round(float(split_r2.min()), 3),
    "split_r2_max": round(float(split_r2.max()), 3),
    "split_r2_mean": round(float(split_r2.mean()), 3),
    "split_r2_std": round(float(split_r2.std()), 3),
    "single_split_r2": round(float(single_split_r2), 3),
}

# ===========================================================================
# APPENDIX B — Hyperparameter tuning: grid vs random vs Optuna
# ===========================================================================
baseline_cv_r2 = float(fold_r2.mean())

# B.2 Grid search (small, exhaustive grid).
grid = GridSearchCV(
    RandomForestRegressor(random_state=RANDOM_SEED),
    param_grid={
        "n_estimators": [100, 300],
        "max_depth": [None, 20],
        "max_features": ["sqrt", 1.0],
    },
    cv=kf, scoring="r2", n_jobs=-1,
)
grid.fit(X, y)
print(f"\n[Grid]   best CV R² = {grid.best_score_:.4f}  params={grid.best_params_}")

# B.3 Random search (samples the space; the original tutorial's approach).
rand = RandomizedSearchCV(
    RandomForestRegressor(random_state=RANDOM_SEED),
    param_distributions={
        "n_estimators": [100, 200, 300, 500],
        "max_depth": [None, 10, 20, 30],
        "min_samples_split": randint(2, 11),
        "min_samples_leaf": randint(1, 5),
        "max_features": ["sqrt", "log2", 1.0],
    },
    n_iter=40, cv=kf, scoring="r2", random_state=RANDOM_SEED, n_jobs=-1,
)
rand.fit(X, y)
print(f"[Random] best CV R² = {rand.best_score_:.4f}  params={rand.best_params_}")

# B.4 Bayesian optimization with Optuna (TPE sampler).
optuna.logging.set_verbosity(optuna.logging.WARNING)


def objective(trial: optuna.Trial) -> float:
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 100, 500, step=100),
        "max_depth": trial.suggest_categorical("max_depth", [None, 10, 20, 30]),
        "min_samples_split": trial.suggest_int("min_samples_split", 2, 10),
        "min_samples_leaf": trial.suggest_int("min_samples_leaf", 1, 4),
        "max_features": trial.suggest_categorical("max_features", ["sqrt", "log2", 1.0]),
    }
    model = RandomForestRegressor(random_state=RANDOM_SEED, **params)
    return cross_val_score(model, X, y, cv=kf, scoring="r2", n_jobs=-1).mean()


study = optuna.create_study(direction="maximize",
                            sampler=optuna.samplers.TPESampler(seed=RANDOM_SEED))
study.optimize(objective, n_trials=40, show_progress_bar=False)
print(f"[Optuna] best CV R² = {study.best_value:.4f}  params={study.best_params}")

# Optuna optimization history.
trial_vals = np.array([t.value for t in study.trials if t.value is not None])
running_best = np.maximum.accumulate(trial_vals)
fig, ax = plt.subplots(figsize=(8.5, 5))
ax.scatter(np.arange(1, len(trial_vals) + 1), trial_vals, s=28, alpha=0.6,
           color=COLOR_PRIMARY, label="Trial CV R²")
ax.plot(np.arange(1, len(trial_vals) + 1), running_best, color=COLOR_ACCENT,
        linewidth=2, label="Best so far")
ax.axhline(baseline_cv_r2, color=LINE, linestyle=":", linewidth=1.8,
           label=f"Baseline (untuned) = {baseline_cv_r2:.3f}")
ax.set_xlabel("Optuna trial")
ax.set_ylabel("Mean 5-fold CV R²")
ax.set_title("Optuna search history (TPE sampler)")
ax.legend()
plt.savefig(OUTPUT_DIR / f"ml_appendix_optuna_history{SUFFIX}.png")
plt.close()
print(f"Saved: ml_appendix_optuna_history{SUFFIX}.png")

# Tuning comparison bar chart.
methods = ["Baseline", "Grid", "Random", "Optuna"]
scores = [baseline_cv_r2, float(grid.best_score_), float(rand.best_score_), float(study.best_value)]
colors = [BASELINE_BAR, COLOR_PRIMARY, COLOR_TEAL, COLOR_ACCENT]
fig, ax = plt.subplots(figsize=(8, 5))
bars = ax.bar(methods, scores, color=colors, edgecolor="white", alpha=0.9, width=0.6)
for b, s in zip(bars, scores):
    ax.text(b.get_x() + b.get_width() / 2, s + 0.002, f"{s:.3f}",
            ha="center", va="bottom", fontsize=10)
ax.set_ylabel("Best mean 5-fold CV R²")
ax.set_ylim(0, max(scores) * 1.18)
ax.set_title("Tuning buys almost nothing over the baseline")
plt.savefig(OUTPUT_DIR / f"ml_appendix_tuning_comparison{SUFFIX}.png")
plt.close()
print(f"Saved: ml_appendix_tuning_comparison{SUFFIX}.png")

tuning_df = pd.DataFrame({"Method": methods, "Best CV R2": [round(s, 4) for s in scores]})
tuning_df.to_csv(OUTPUT_DIR / f"ml_tuning_comparison.csv", index=False)
print(f"Saved: ml_tuning_comparison.csv")

best_overall = max(
    [("Grid", grid.best_score_, grid.best_params_),
     ("Random", rand.best_score_, rand.best_params_),
     ("Optuna", study.best_value, study.best_params)],
    key=lambda t: t[1],
)
best_params = {k: ("None" if v is None else v) for k, v in best_overall[2].items()}
params_df = pd.DataFrame(
    [{"Parameter": k, "Value": v} for k, v in best_params.items()]
)
params_df.to_csv(OUTPUT_DIR / f"ml_rf_best_params.csv", index=False)
print(f"Saved: ml_rf_best_params.csv")

summary["tuning"] = {
    "baseline_cv_r2": round(baseline_cv_r2, 4),
    "grid_cv_r2": round(float(grid.best_score_), 4),
    "random_cv_r2": round(float(rand.best_score_), 4),
    "optuna_cv_r2": round(float(study.best_value), 4),
    "best_method": best_overall[0],
    "best_params": best_params,
    "best_improvement": round(float(best_overall[1]) - baseline_cv_r2, 4),
    "n_trials": 40,
}

# ===========================================================================
# APPENDIX C — Introduction to ML with multivariate (linear) regression
# ===========================================================================
# The same 5-fold CV workflow as the main body, but with the simplest model —
# multiple linear regression — on only the first four embedding features. The
# point is transparency: a model you can write as an equation, evaluated with
# the identical cross_validate / cross_val_predict / partial-dependence tools.
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

LR_FEATURES = FEATURE_COLS[:4]          # A00, A01, A02, A03
X4 = X[LR_FEATURES]
lr = LinearRegression()

# C.2 cross-validation + out-of-fold predictions (same kf / fold_id as the body)
lr_cv = cross_validate(
    lr, X4, y, cv=kf,
    scoring=("r2", "neg_root_mean_squared_error", "neg_mean_absolute_error"),
)
lr_fold_r2 = lr_cv["test_r2"]
lr_fold_rmse = -lr_cv["test_neg_root_mean_squared_error"]
lr_fold_mae = -lr_cv["test_neg_mean_absolute_error"]
lr_oof = cross_val_predict(lr, X4, y, cv=kf)
lr_pooled_r2 = r2_score(y, lr_oof)
lr_pooled_rmse = rmse(y, lr_oof)
lr_pooled_mae = mean_absolute_error(y, lr_oof)
lr_resid = np.asarray(y) - lr_oof
print(f"\n[Linear] per-fold R²: {lr_fold_r2.round(3)}")
print(f"[Linear] mean R² {lr_fold_r2.mean():.3f} ± {lr_fold_r2.std():.3f} | "
      f"pooled OOF R² {lr_pooled_r2:.3f}")

# C.1 fitted model (on all data) + C.5 standardized coefficients
lr_full = LinearRegression().fit(X4, y)
std_pipe = make_pipeline(StandardScaler(), LinearRegression()).fit(X4, y)
std_coefs = std_pipe.named_steps["linearregression"].coef_

# C.4 evaluation plots — OOF actual vs predicted (by fold)
fig, ax = plt.subplots(figsize=(7.2, 7.2))
for k in range(1, N_FOLDS + 1):
    m = fold_id == k
    ax.scatter(y[m], lr_oof[m], s=34, alpha=0.75, edgecolors="white",
               linewidth=0.4, color=FOLD_COLORS[k - 1], label=f"Fold {k}")
lims = [float(y.min()) - 2, float(y.max()) + 2]
ax.plot(lims, lims, "--", color=LINE, linewidth=1.8, label="Perfect prediction")
ax.set_xlim(lims); ax.set_ylim(lims); ax.set_aspect("equal")
ax.set_xlabel("Actual IMDS"); ax.set_ylabel("Predicted IMDS (out-of-fold)")
ax.set_title("Linear regression (4 features): out-of-fold predictions")
ax.text(0.04, 0.95, f"Pooled OOF R² = {lr_pooled_r2:.3f}", transform=ax.transAxes,
        va="top", bbox=dict(boxstyle="round", fc=ANNOT_FC, ec=LINE, alpha=0.85))
ax.legend(loc="lower right", ncol=2, fontsize=9)
plt.savefig(OUTPUT_DIR / f"ml_lr_actual_vs_predicted{SUFFIX}.png")
plt.close()
print(f"Saved: ml_lr_actual_vs_predicted{SUFFIX}.png")

# C.4 residuals
fig, ax = plt.subplots(figsize=(8, 5))
for k in range(1, N_FOLDS + 1):
    m = fold_id == k
    ax.scatter(lr_oof[m], lr_resid[m], s=30, alpha=0.7, edgecolors="white",
               linewidth=0.4, color=FOLD_COLORS[k - 1], label=f"Fold {k}")
ax.axhline(0, color=LINE, linestyle="--", linewidth=1.8)
ax.set_xlabel("Predicted IMDS (out-of-fold)"); ax.set_ylabel("Residual (actual − predicted)")
ax.set_title("Linear regression: out-of-fold residuals")
ax.legend(loc="upper right", ncol=2, fontsize=9)
plt.savefig(OUTPUT_DIR / f"ml_lr_residuals{SUFFIX}.png")
plt.close()
print(f"Saved: ml_lr_residuals{SUFFIX}.png")

# C.5 standardized coefficients (signed importance)
fig, ax = plt.subplots(figsize=(7, 4.5))
bar_colors = [COLOR_PRIMARY if c >= 0 else COLOR_ACCENT for c in std_coefs]
ax.bar(LR_FEATURES, std_coefs, color=bar_colors, edgecolor="white", alpha=0.9, width=0.6)
ax.axhline(0, color=LINE, linewidth=1)
ax.set_ylabel("Standardized coefficient")
ax.set_title("Linear regression: standardized coefficients (signed importance)")
plt.savefig(OUTPUT_DIR / f"ml_lr_importance{SUFFIX}.png")
plt.close()
print(f"Saved: ml_lr_importance{SUFFIX}.png")

# C.6 partial dependence — straight lines for a linear model
fig, axes = plt.subplots(1, 4, figsize=(16, 4))
PartialDependenceDisplay.from_estimator(lr_full, X4, LR_FEATURES, ax=axes.ravel(),
                                        grid_resolution=50)
fig.suptitle("Linear regression: partial dependence is a straight line", fontsize=13)
plt.tight_layout(rect=[0, 0, 1, 0.93])
plt.savefig(OUTPUT_DIR / f"ml_lr_partial_dependence{SUFFIX}.png")
plt.close()
print(f"Saved: ml_lr_partial_dependence{SUFFIX}.png")

# Results table + summary
lr_results = pd.DataFrame({
    "Fold": list(range(1, N_FOLDS + 1)) + ["Mean", "Std"],
    "R2": list(lr_fold_r2.round(4)) + [round(lr_fold_r2.mean(), 4), round(lr_fold_r2.std(), 4)],
    "RMSE": list(lr_fold_rmse.round(2)) + [round(lr_fold_rmse.mean(), 2), round(lr_fold_rmse.std(), 2)],
    "MAE": list(lr_fold_mae.round(2)) + [round(lr_fold_mae.mean(), 2), round(lr_fold_mae.std(), 2)],
})
lr_results.to_csv(OUTPUT_DIR / f"ml_lr_results.csv", index=False)
print(f"Saved: ml_lr_results.csv")

summary["linear"] = {
    "features": LR_FEATURES,
    "fold_r2": [round(float(v), 4) for v in lr_fold_r2],
    "mean_r2": round(float(lr_fold_r2.mean()), 4), "std_r2": round(float(lr_fold_r2.std()), 4),
    "mean_rmse": round(float(lr_fold_rmse.mean()), 4), "std_rmse": round(float(lr_fold_rmse.std()), 4),
    "mean_mae": round(float(lr_fold_mae.mean()), 4), "std_mae": round(float(lr_fold_mae.std()), 4),
    "pooled_r2": round(float(lr_pooled_r2), 4),
    "pooled_rmse": round(float(lr_pooled_rmse), 4),
    "pooled_mae": round(float(lr_pooled_mae), 4),
    "intercept": round(float(lr_full.intercept_), 4),
    "coefficients": {f: round(float(c), 4) for f, c in zip(LR_FEATURES, lr_full.coef_)},
    "std_coefficients": {f: round(float(c), 4) for f, c in zip(LR_FEATURES, std_coefs)},
    "rf_pooled_r2": round(float(pooled_r2), 4),
}

# ---------------------------------------------------------------------------
# Per-municipality out-of-fold predictions (for the web app)
# ---------------------------------------------------------------------------
region_col = "regionName" if "regionName" in df.columns else None
names = (df.loc[mask, region_col].reset_index(drop=True).tolist()
         if region_col else [str(i) for i in range(n_obs)])
summary["oof_predictions"] = [
    {"id": int(i), "name": str(names[i]),
     "actual": round(float(y[i]), 2),
     "predicted": round(float(oof_pred[i]), 2),
     "fold": int(fold_id[i]),
     "residual": round(float(residuals[i]), 2)}
    for i in range(n_obs)
]
summary["importance_full"] = {
    "mdi": [{"feature": f, "importance": round(float(mdi[f]), 5)}
            for f in mdi.sort_values(ascending=False).head(20).index],
    "permutation": [{"feature": f, "importance": round(float(perm_imp[f]), 5)}
                    for f in perm_imp.sort_values(ascending=False).head(20).index],
}

with open(OUTPUT_DIR / f"ml_summary.json", "w") as fh:
    json.dump(summary, fh, indent=2)
print(f"Saved: ml_summary.json")

# ---------------------------------------------------------------------------
# Console summary
# ---------------------------------------------------------------------------
print("\n" + "=" * 64)
print(f"  Random Forest Regression (5-fold CV) — {TARGET_SHORT}")
print("=" * 64)
print(f"  Observations:        {n_obs}")
print(f"  Features:            {len(FEATURE_COLS)} satellite embedding dims")
print(f"  CV R²  (mean ± SD):  {fold_r2.mean():.3f} ± {fold_r2.std():.3f}")
print(f"  CV RMSE(mean ± SD):  {fold_rmse.mean():.2f} ± {fold_rmse.std():.2f}")
print(f"  CV MAE (mean ± SD):  {fold_mae.mean():.2f} ± {fold_mae.std():.2f}")
print(f"  Pooled OOF R²:       {pooled_r2:.3f}")
print(f"  Actual std:          {y.std():.2f}   Predicted std: {oof_pred.std():.2f}")
print(f"  KS (actual vs pred): {ks_stat:.3f} (p = {ks_p:.3g})")
print(f"  Baseline CV R²:      {baseline_cv_r2:.3f}")
print(f"  Best tuned CV R²:    {best_overall[1]:.3f} ({best_overall[0]})")
print("=" * 64)
