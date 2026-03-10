"""
Introduction to Machine Learning: Random Forest Regression

Predicts Bolivia's Municipal Sustainable Development Index (IMDS) from
satellite image embeddings using Random Forest regression. Data comes from
the DS4Bolivia repository (https://github.com/quarcs-lab/ds4bolivia).

Usage:
    uv run python code/ml_intro_rf.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import set_seeds, RANDOM_SEED, IMAGES_DIR, TABLES_DIR, DATA_DIR

set_seeds()

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import randint
from sklearn.model_selection import train_test_split, cross_val_score, RandomizedSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.inspection import PartialDependenceDisplay, permutation_importance

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
TARGET = "imds"
TARGET_LABEL = "IMDS (Municipal Sustainable Development Index)"

FEATURE_COLS = [f"A{i:02d}" for i in range(64)]

DS4BOLIVIA_BASE = "https://raw.githubusercontent.com/quarcs-lab/ds4bolivia/master"
CACHE_PATH = DATA_DIR / "rawData" / "ds4bolivia_merged.csv"

# ---------------------------------------------------------------------------
# 1. Data Loading
# ---------------------------------------------------------------------------
# We load three datasets from DS4Bolivia and merge them on asdf_id, which
# uniquely identifies each of Bolivia's 339 municipalities. Caching the
# merged file avoids repeated network requests on subsequent runs.

if CACHE_PATH.exists():
    print(f"Loading cached data from {CACHE_PATH}")
    df = pd.read_csv(CACHE_PATH)
else:
    print("Downloading data from DS4Bolivia...")
    sdg = pd.read_csv(f"{DS4BOLIVIA_BASE}/sdg/sdg.csv")
    embeddings = pd.read_csv(
        f"{DS4BOLIVIA_BASE}/satelliteEmbeddings/satelliteEmbeddings2017.csv"
    )
    regions = pd.read_csv(f"{DS4BOLIVIA_BASE}/regionNames/regionNames.csv")

    df = sdg.merge(embeddings, on="asdf_id").merge(regions, on="asdf_id")
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(CACHE_PATH, index=False)
    print(f"Cached merged data to {CACHE_PATH}")

print(f"Dataset shape: {df.shape}")

# Extract features and target, dropping any rows with missing values
X = df[FEATURE_COLS]
y = df[TARGET]
mask = X.notna().all(axis=1) & y.notna()
X = X[mask]
y = y[mask]
print(f"Observations after dropping missing values: {len(y)}")
print(f"Target ({TARGET}): mean={y.mean():.2f}, std={y.std():.2f}, "
      f"min={y.min():.2f}, max={y.max():.2f}")

# ---------------------------------------------------------------------------
# 2. Exploratory Data Analysis
# ---------------------------------------------------------------------------
# EDA helps us understand data distributions and relationships before
# building models — catching issues early saves wasted computation later.

# Target distribution
fig, ax = plt.subplots(figsize=(8, 5))
ax.hist(y, bins=30, edgecolor="white", alpha=0.8, color="#6a9bcc")
ax.axvline(y.mean(), color="#d97757", linestyle="--", linewidth=2, label=f"Mean = {y.mean():.1f}")
ax.axvline(y.median(), color="#141413", linestyle=":", linewidth=2, label=f"Median = {y.median():.1f}")
ax.set_xlabel(TARGET_LABEL)
ax.set_ylabel("Count")
ax.set_title(f"Distribution of {TARGET_LABEL}")
ax.legend()
plt.savefig(IMAGES_DIR / "ml_target_distribution.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: images/ml_target_distribution.png")

# Correlation heatmap of top-10 correlated embeddings with target
correlations = X.corrwith(y).abs().sort_values(ascending=False)
top10_features = correlations.head(10).index.tolist()
corr_matrix = df[top10_features + [TARGET]].corr()

fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(corr_matrix, annot=True, fmt=".2f", cmap="RdBu_r", center=0,
            square=True, ax=ax, vmin=-1, vmax=1)
ax.set_title(f"Correlations: Top-10 Embeddings & {TARGET_LABEL}")
plt.savefig(IMAGES_DIR / "ml_embedding_correlations.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: images/ml_embedding_correlations.png")

# ---------------------------------------------------------------------------
# 3. Train/Test Split
# ---------------------------------------------------------------------------
# We split BEFORE any model fitting to prevent data leakage — the test set
# must be completely unseen during training and tuning.

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_SEED
)
print(f"\nTrain set: {len(X_train)} samples")
print(f"Test set:  {len(X_test)} samples")

# ---------------------------------------------------------------------------
# 4. Baseline Model with Cross-Validation
# ---------------------------------------------------------------------------
# A baseline model with default hyperparameters gives us a reference point.
# Cross-validation (k-fold) provides a more reliable estimate of performance
# than a single train/test split by averaging across multiple folds.

baseline_rf = RandomForestRegressor(n_estimators=100, random_state=RANDOM_SEED)
cv_scores = cross_val_score(baseline_rf, X_train, y_train, cv=5, scoring="r2")
print(f"\nBaseline CV R² scores: {cv_scores}")
print(f"Baseline CV R² mean:  {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# Fit baseline and evaluate on test set
baseline_rf.fit(X_train, y_train)
baseline_pred = baseline_rf.predict(X_test)
baseline_r2 = r2_score(y_test, baseline_pred)
baseline_rmse = np.sqrt(mean_squared_error(y_test, baseline_pred))
baseline_mae = mean_absolute_error(y_test, baseline_pred)
print(f"Baseline Test R²:   {baseline_r2:.4f}")
print(f"Baseline Test RMSE: {baseline_rmse:.2f}")
print(f"Baseline Test MAE:  {baseline_mae:.2f}")

# ---------------------------------------------------------------------------
# 5. Hyperparameter Tuning
# ---------------------------------------------------------------------------
# RandomizedSearchCV explores the hyperparameter space more efficiently than
# grid search by sampling random combinations. Each combination is evaluated
# with cross-validation to find the best settings.

param_distributions = {
    "n_estimators": [100, 200, 300, 500],
    "max_depth": [None, 10, 20, 30],
    "min_samples_split": randint(2, 11),
    "min_samples_leaf": randint(1, 5),
    "max_features": ["sqrt", "log2", None],
}

search = RandomizedSearchCV(
    RandomForestRegressor(random_state=RANDOM_SEED),
    param_distributions=param_distributions,
    n_iter=50,
    cv=5,
    scoring="r2",
    random_state=RANDOM_SEED,
    n_jobs=-1,
)
search.fit(X_train, y_train)
print(f"\nBest CV R²: {search.best_score_:.4f}")
print(f"Best parameters: {search.best_params_}")

# ---------------------------------------------------------------------------
# 6. Evaluation on Test Set
# ---------------------------------------------------------------------------
best_rf = search.best_estimator_
tuned_pred = best_rf.predict(X_test)
tuned_r2 = r2_score(y_test, tuned_pred)
tuned_rmse = np.sqrt(mean_squared_error(y_test, tuned_pred))
tuned_mae = mean_absolute_error(y_test, tuned_pred)

print(f"\nTuned Test R²:   {tuned_r2:.4f}")
print(f"Tuned Test RMSE: {tuned_rmse:.2f}")
print(f"Tuned Test MAE:  {tuned_mae:.2f}")

# Actual vs Predicted scatter
fig, ax = plt.subplots(figsize=(7, 7))
ax.scatter(y_test, tuned_pred, alpha=0.6, edgecolors="white", linewidth=0.5, color="#6a9bcc")
lims = [min(y_test.min(), tuned_pred.min()) - 2, max(y_test.max(), tuned_pred.max()) + 2]
ax.plot(lims, lims, "--", color="#d97757", linewidth=2, label="Perfect prediction")
ax.set_xlim(lims)
ax.set_ylim(lims)
ax.set_xlabel(f"Actual {TARGET_LABEL}")
ax.set_ylabel(f"Predicted {TARGET_LABEL}")
ax.set_title(f"Actual vs Predicted {TARGET_LABEL}")
ax.legend()
ax.set_aspect("equal")
plt.savefig(IMAGES_DIR / "ml_actual_vs_predicted.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: images/ml_actual_vs_predicted.png")

# Residuals plot
residuals = y_test - tuned_pred
fig, ax = plt.subplots(figsize=(8, 5))
ax.scatter(tuned_pred, residuals, alpha=0.6, edgecolors="white", linewidth=0.5, color="#6a9bcc")
ax.axhline(0, color="#d97757", linestyle="--", linewidth=2)
ax.set_xlabel(f"Predicted {TARGET_LABEL}")
ax.set_ylabel("Residuals")
ax.set_title("Residuals vs Predicted Values")
plt.savefig(IMAGES_DIR / "ml_residuals.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: images/ml_residuals.png")

# ---------------------------------------------------------------------------
# 7. Feature Importance
# ---------------------------------------------------------------------------

# Mean Decrease in Impurity (MDI) — built into the trained forest
mdi_importance = pd.Series(best_rf.feature_importances_, index=FEATURE_COLS)
top20_mdi = mdi_importance.sort_values(ascending=False).head(20)

fig, ax = plt.subplots(figsize=(10, 6))
top20_mdi.sort_values().plot.barh(ax=ax, color="#6a9bcc", edgecolor="white")
ax.set_xlabel("Mean Decrease in Impurity")
ax.set_title(f"Top-20 Feature Importance (MDI) for {TARGET_LABEL}")
plt.savefig(IMAGES_DIR / "ml_feature_importance_mdi.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: images/ml_feature_importance_mdi.png")

# Permutation importance — more reliable, measures actual predictive impact
perm_result = permutation_importance(
    best_rf, X_test, y_test, n_repeats=10, random_state=RANDOM_SEED, n_jobs=-1
)
perm_importance = pd.Series(perm_result.importances_mean, index=FEATURE_COLS)
top20_perm = perm_importance.sort_values(ascending=False).head(20)

fig, ax = plt.subplots(figsize=(10, 6))
top20_perm.sort_values().plot.barh(ax=ax, color="#d97757", edgecolor="white")
ax.set_xlabel("Mean Decrease in R² (Permutation)")
ax.set_title(f"Top-20 Feature Importance (Permutation) for {TARGET_LABEL}")
plt.savefig(IMAGES_DIR / "ml_feature_importance_permutation.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: images/ml_feature_importance_permutation.png")

# ---------------------------------------------------------------------------
# 8. Partial Dependence Plots
# ---------------------------------------------------------------------------
# Partial dependence shows the marginal effect of a feature on the prediction,
# averaging over the values of all other features. This reveals non-linear
# relationships that a simple correlation can't capture.

top6_features = perm_importance.sort_values(ascending=False).head(6).index.tolist()
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
PartialDependenceDisplay.from_estimator(
    best_rf, X_train, top6_features, ax=axes.ravel(),
    grid_resolution=50, n_jobs=-1
)
fig.suptitle(f"Partial Dependence Plots — Top-6 Features for {TARGET_LABEL}", fontsize=14)
plt.tight_layout(rect=[0, 0, 1, 0.95])
plt.savefig(IMAGES_DIR / "ml_partial_dependence.png", dpi=300, bbox_inches="tight")
plt.close()
print("Saved: images/ml_partial_dependence.png")

# ---------------------------------------------------------------------------
# 9. Save Results
# ---------------------------------------------------------------------------
results_df = pd.DataFrame({
    "Metric": ["R²", "RMSE", "MAE"],
    "Baseline": [f"{baseline_r2:.4f}", f"{baseline_rmse:.2f}", f"{baseline_mae:.2f}"],
    "Tuned": [f"{tuned_r2:.4f}", f"{tuned_rmse:.2f}", f"{tuned_mae:.2f}"],
})
results_df.to_csv(TABLES_DIR / "ml_rf_results.csv", index=False)
print(f"\nSaved: tables/ml_rf_results.csv")

params_df = pd.DataFrame(
    [{"Parameter": k, "Value": v} for k, v in search.best_params_.items()]
)
params_df.to_csv(TABLES_DIR / "ml_rf_best_params.csv", index=False)
print(f"Saved: tables/ml_rf_best_params.csv")

# ---------------------------------------------------------------------------
# 10. Summary
# ---------------------------------------------------------------------------
print("\n" + "=" * 60)
print(f"  Random Forest Regression — {TARGET_LABEL}")
print("=" * 60)
print(f"  Observations:       {len(y)}")
print(f"  Features:           {len(FEATURE_COLS)} satellite embedding dimensions")
print(f"  Train/Test split:   {len(X_train)}/{len(X_test)}")
print(f"  Baseline CV R²:     {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
print(f"  Tuned Test R²:      {tuned_r2:.4f}")
print(f"  Tuned Test RMSE:    {tuned_rmse:.2f}")
print(f"  Tuned Test MAE:     {tuned_mae:.2f}")
print(f"  Best parameters:    {search.best_params_}")
print("=" * 60)
