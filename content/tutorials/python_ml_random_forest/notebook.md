---
jupytext:
  formats: ipynb,md:myst
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.13
    jupytext_version: 1.19.1
kernelspec:
  display_name: Python 3 (ipykernel)
  language: python
  name: python3
---

---
title: "N4: Introduction to Machine Learning — Random Forest Regression"
toc: true
toc-depth: 3
---

<a href="https://colab.research.google.com/github/cmg777/claude4data/blob/master/notebooks/notebook-04.ipynb" target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"></a>

## Overview

This notebook introduces machine learning through a practical application: predicting Bolivia's Municipal Sustainable Development Index (IMDS) from satellite image embeddings using Random Forest regression. IMDS is a composite index (0–100 scale) that captures how well each of Bolivia's 339 municipalities is progressing toward sustainable development goals. Satellite embeddings are 64-dimensional feature vectors extracted from 2017 satellite imagery — they compress visual information about land use, urbanization, and terrain into numbers a model can learn from.

**Learning objectives:**

- Understand the Random Forest algorithm and why it works well for tabular data
- Follow ML best practices: train/test split, cross-validation, hyperparameter tuning
- Interpret model performance metrics (R², RMSE, MAE)
- Analyze feature importance and partial dependence plots

```{code-cell} ipython3
import sys
if "google.colab" in sys.modules:
    !git clone --depth 1 https://github.com/cmg777/claude4data.git /content/claude4data 2>/dev/null || true
    %cd /content/claude4data/notebooks
sys.path.insert(0, "..")
from config import set_seeds, RANDOM_SEED, IMAGES_DIR, TABLES_DIR, DATA_DIR

set_seeds()
```

```{code-cell} ipython3
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import randint
from sklearn.model_selection import train_test_split, cross_val_score, RandomizedSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.inspection import PartialDependenceDisplay, permutation_importance
from IPython.display import Markdown

# Configuration
TARGET = "imds"
TARGET_LABEL = "IMDS (Municipal Sustainable Development Index)"
FEATURE_COLS = [f"A{i:02d}" for i in range(64)]

DS4BOLIVIA_BASE = "https://raw.githubusercontent.com/quarcs-lab/ds4bolivia/master"
CACHE_PATH = DATA_DIR / "rawData" / "ds4bolivia_merged.csv"
```

## Data Loading

The data comes from the [DS4Bolivia](https://github.com/quarcs-lab/ds4bolivia) repository, which provides standardized datasets for studying Bolivian development. We merge three tables on `asdf_id` — the unique identifier for each municipality: SDG indices (our target variables), satellite embeddings (our features), and region names (for context).

```{code-cell} ipython3
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

X = df[FEATURE_COLS]
y = df[TARGET]
mask = X.notna().all(axis=1) & y.notna()
X = X[mask]
y = y[mask]

print(f"Dataset shape: {df.shape}")
print(f"Observations after dropping missing: {len(y)}")
print(f"\nTarget variable ({TARGET}) summary:")
print(y.describe().round(2))
```

All 339 Bolivian municipalities loaded successfully with no missing values — the dataset provides complete national coverage. The merged data has 88 columns: the 64 satellite embedding features, SDG indices, and region identifiers. IMDS scores range from 35.70 to 80.20 with a mean of 51.05 and standard deviation of 6.77, meaning most municipalities cluster within about 7 points of the national average on the 0–100 scale.

## Exploratory Data Analysis

Before building any model, we explore the data to understand its structure. EDA helps us spot issues — skewed distributions, outliers, or weak feature correlations — that could affect model performance. It also builds intuition about what patterns the model might find.

### Target Distribution

The histogram below shows how IMDS values are distributed across municipalities. The shape of this distribution matters: a highly skewed target can bias predictions toward the majority range.

```{code-cell} ipython3
#| label: fig-target-distribution
#| fig-cap: "Distribution of IMDS scores across Bolivia's municipalities. The dashed line marks the mean, the dotted line marks the median."

fig, ax = plt.subplots(figsize=(8, 5))
ax.hist(y, bins=30, edgecolor="white", alpha=0.8, color="#6a9bcc")
ax.axvline(y.mean(), color="#d97757", linestyle="--", linewidth=2, label=f"Mean = {y.mean():.1f}")
ax.axvline(y.median(), color="#141413", linestyle=":", linewidth=2, label=f"Median = {y.median():.1f}")
ax.set_xlabel(TARGET_LABEL)
ax.set_ylabel("Count")
ax.set_title(f"Distribution of {TARGET_LABEL}")
ax.legend()
plt.savefig(IMAGES_DIR / "ml_target_distribution.png", dpi=300, bbox_inches="tight")
plt.show()
```

The distribution is roughly bell-shaped with a slight right skew — the mean (51.1) sits just above the median (50.5), indicating a small tail of higher-performing municipalities. Most scores fall between 47 and 55, meaning the majority of Bolivia's municipalities have similar mid-range development levels. The handful of outliers above 70 likely correspond to larger urban centers like La Paz, Santa Cruz, and Cochabamba, which have significantly higher development infrastructure.

### Embedding Correlations

Next we examine which satellite embedding dimensions are most correlated with the target. Strong correlations suggest the model has useful signal to learn from; weak correlations across the board would be a warning sign.

```{code-cell} ipython3
#| label: fig-embedding-correlations
#| fig-cap: "Correlation matrix of the top-10 most correlated satellite embedding dimensions with IMDS."

correlations = X.corrwith(y).abs().sort_values(ascending=False)
top10_features = correlations.head(10).index.tolist()
corr_matrix = df[top10_features + [TARGET]].corr()

fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(corr_matrix, annot=True, fmt=".2f", cmap="RdBu_r", center=0,
            square=True, ax=ax, vmin=-1, vmax=1)
ax.set_title(f"Correlations: Top-10 Embeddings & {TARGET_LABEL}")
plt.savefig(IMAGES_DIR / "ml_embedding_correlations.png", dpi=300, bbox_inches="tight")
plt.show()
```

The heatmap reveals that the strongest individual correlations between embedding dimensions and IMDS are moderate (in the 0.25–0.40 range), which is typical for satellite-derived features predicting complex socioeconomic outcomes. Several embedding dimensions are also correlated with each other, suggesting they capture overlapping spatial patterns — the Random Forest can handle this multicollinearity well since it selects feature subsets at each split.

## Train/Test Split

We split the data into training (80%) and test (20%) sets *before* any model fitting. This is a fundamental ML practice: if the model ever "sees" the test data during training or tuning, our performance estimate will be overly optimistic — a problem called **data leakage**. The `random_state` ensures the same split every time we run the notebook, making results reproducible.

```{code-cell} ipython3
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_SEED
)
print(f"Training set: {len(X_train)} municipalities")
print(f"Test set:     {len(X_test)} municipalities")
```

The split gives us 271 municipalities for training and 68 for testing. With only 339 total observations, this is a relatively small dataset for ML — the test set of 68 means each test prediction represents about 1.5% of the data. This makes cross-validation especially important for getting reliable performance estimates, since a single 68-sample test set could be unrepresentative by chance.

## Baseline Model

Before tuning anything, we establish a baseline using a Random Forest with default hyperparameters. **Random Forest** works by building many decision trees on random subsets of the data and features, then averaging their predictions. This "wisdom of crowds" approach reduces overfitting compared to a single decision tree.

### Cross-Validation

We evaluate the baseline with 5-fold cross-validation on the training set. Instead of a single train/validation split, k-fold CV rotates through 5 different validation sets and averages the scores. This gives a more reliable and stable performance estimate, especially important with smaller datasets like ours.

```{code-cell} ipython3
baseline_rf = RandomForestRegressor(n_estimators=100, random_state=RANDOM_SEED)
cv_scores = cross_val_score(baseline_rf, X_train, y_train, cv=5, scoring="r2")

print(f"5-Fold CV R² scores: {cv_scores.round(4)}")
print(f"Mean CV R²:          {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
```

The 5-fold CV R² scores range from 0.152 to 0.345, with a mean of 0.2526 (+/- 0.0728). This means the baseline model explains about 25% of the variation in IMDS on average, but the high variability across folds (standard deviation of 0.07) reflects the small dataset — different subsets of 271 municipalities can look quite different from each other. An R² around 0.25 is a reasonable starting point for predicting a complex social outcome from satellite imagery alone.

```{code-cell} ipython3
baseline_rf.fit(X_train, y_train)
baseline_pred = baseline_rf.predict(X_test)
baseline_r2 = r2_score(y_test, baseline_pred)
baseline_rmse = np.sqrt(mean_squared_error(y_test, baseline_pred))
baseline_mae = mean_absolute_error(y_test, baseline_pred)

print(f"Baseline Test R²:   {baseline_r2:.4f}")
print(f"Baseline Test RMSE: {baseline_rmse:.2f}")
print(f"Baseline Test MAE:  {baseline_mae:.2f}")
```

On the held-out test set, the baseline achieves R² = 0.2307, RMSE = 6.52, and MAE = 4.68. In practical terms, the model's predictions are typically off by about 4.7 IMDS points (MAE) on a scale where most values fall between 47 and 55. The RMSE of 6.52 is higher than the MAE, indicating some larger errors are pulling it up. This baseline gives us a concrete reference — any improvement from tuning should beat these numbers.

## Hyperparameter Tuning

The baseline model uses scikit-learn's defaults, but we can often do better by searching for optimal hyperparameters. **RandomizedSearchCV** is more efficient than exhaustive grid search — it samples random combinations and evaluates each with cross-validation. Here's what each hyperparameter controls:

- **n_estimators**: Number of trees in the forest (more trees = more stable but slower)
- **max_depth**: How deep each tree can grow (deeper = more complex patterns but risk overfitting)
- **min_samples_split**: Minimum samples needed to split a node (higher = more regularization)
- **min_samples_leaf**: Minimum samples in a leaf node (higher = smoother predictions)
- **max_features**: How many features each tree considers per split (fewer = more diverse trees)

```{code-cell} ipython3
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

print(f"Best CV R²: {search.best_score_:.4f}")
print(f"\nBest parameters:")
for param, value in search.best_params_.items():
    print(f"  {param}: {value}")
```

The best configuration found uses 500 trees with max_depth=30, max_features=sqrt, min_samples_leaf=1, and min_samples_split=4. The best CV R² of 0.2721 is modestly higher than the baseline's 0.2526 — about a 2 percentage point improvement in explained variance. The tuning selected a deeper, more complex model (max_depth=30 vs the default of unlimited) while constraining feature subsampling to sqrt(64)=8 features per split, which encourages tree diversity.

## Model Evaluation

Now we evaluate the tuned model on the held-out test set — data the model has never seen during training or tuning. Three complementary metrics tell us different things:

- **R²** (coefficient of determination): What fraction of the target's variance the model explains. R² = 1.0 is perfect; R² = 0 means the model is no better than predicting the mean.
- **RMSE** (Root Mean Squared Error): Average prediction error in the same units as the target. Penalizes large errors more heavily.
- **MAE** (Mean Absolute Error): Average absolute error. More robust to outliers than RMSE.

```{code-cell} ipython3
best_rf = search.best_estimator_
tuned_pred = best_rf.predict(X_test)
tuned_r2 = r2_score(y_test, tuned_pred)
tuned_rmse = np.sqrt(mean_squared_error(y_test, tuned_pred))
tuned_mae = mean_absolute_error(y_test, tuned_pred)

print(f"Tuned Test R²:   {tuned_r2:.4f}")
print(f"Tuned Test RMSE: {tuned_rmse:.2f}")
print(f"Tuned Test MAE:  {tuned_mae:.2f}")
```

The tuned model achieves R² = 0.2297, RMSE = 6.52, and MAE = 4.72 on the test set — essentially identical to the baseline (R² = 0.2307, RMSE = 6.52, MAE = 4.68). This is a common finding with small datasets: the tuning improved CV performance slightly but the gains didn't transfer to the specific test set. The model explains about 23% of IMDS variation, meaning satellite embeddings capture real but limited predictive signal for municipal development.

### Actual vs Predicted

This scatter plot shows how well the model's predictions match reality. Points falling exactly on the dashed 45° line would indicate perfect predictions; scatter around the line shows prediction error.

```{code-cell} ipython3
#| label: fig-actual-vs-predicted
#| fig-cap: "Actual vs predicted IMDS scores on the test set. The dashed line represents perfect prediction."

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
plt.show()
```

The scatter shows moderate agreement between actual and predicted IMDS values, with noticeable spread around the 45-degree line. Predictions tend to cluster in the 47–55 range (near the training mean), with the model struggling to predict extreme values — municipalities with very high or low IMDS scores are pulled toward the center. This "regression to the mean" effect is typical when the model has limited predictive power.

### Residual Analysis

Residuals (actual − predicted) should ideally be randomly scattered around zero with no obvious pattern. Patterns in residuals can reveal systematic biases — for example, if the model consistently underpredicts high-IMDS municipalities, it suggests the features miss something important about well-developed areas.

```{code-cell} ipython3
#| label: fig-residuals
#| fig-cap: "Residuals (actual minus predicted) vs predicted IMDS values. Random scatter around zero indicates no systematic bias."

residuals = y_test - tuned_pred
fig, ax = plt.subplots(figsize=(8, 5))
ax.scatter(tuned_pred, residuals, alpha=0.6, edgecolors="white", linewidth=0.5, color="#6a9bcc")
ax.axhline(0, color="#d97757", linestyle="--", linewidth=2)
ax.set_xlabel(f"Predicted {TARGET_LABEL}")
ax.set_ylabel("Residuals")
ax.set_title("Residuals vs Predicted Values")
plt.savefig(IMAGES_DIR / "ml_residuals.png", dpi=300, bbox_inches="tight")
plt.show()
```

The residuals appear roughly randomly scattered around zero, which is encouraging — there's no strong systematic bias. However, the spread is wider at the extremes, suggesting the model's errors are larger for municipalities with unusually high or low predicted IMDS. This heteroscedasticity is consistent with the regression-to-the-mean pattern seen in the scatter plot above.

## Feature Importance

Which satellite embedding dimensions matter most for predicting IMDS? We compare two methods that answer this question differently:

### Mean Decrease in Impurity (MDI)

MDI measures how much each feature reduces prediction error across all splits in all trees. It's fast to compute (built into the trained model) but can be biased toward high-cardinality or correlated features.

```{code-cell} ipython3
#| label: fig-importance-mdi
#| fig-cap: "Top-20 satellite embedding features ranked by Mean Decrease in Impurity."

mdi_importance = pd.Series(best_rf.feature_importances_, index=FEATURE_COLS)
top20_mdi = mdi_importance.sort_values(ascending=False).head(20)

fig, ax = plt.subplots(figsize=(10, 6))
top20_mdi.sort_values().plot.barh(ax=ax, color="#6a9bcc", edgecolor="white")
ax.set_xlabel("Mean Decrease in Impurity")
ax.set_title(f"Top-20 Feature Importance (MDI) for {TARGET_LABEL}")
plt.savefig(IMAGES_DIR / "ml_feature_importance_mdi.png", dpi=300, bbox_inches="tight")
plt.show()
```

The MDI plot shows that importance is distributed across many embedding dimensions rather than concentrated in just a few. This suggests the satellite imagery captures multiple independent visual patterns relevant to development — no single dimension dominates. However, MDI can be inflated for continuous features, so we'll cross-check with permutation importance next.

### Permutation Importance

Permutation importance is more reliable: it randomly shuffles each feature and measures how much the model's accuracy drops. A large drop means the feature was important; no drop means the feature could be removed without loss. Unlike MDI, permutation importance is evaluated on the test set and is not biased by feature scale or cardinality.

```{code-cell} ipython3
#| label: fig-importance-permutation
#| fig-cap: "Top-20 satellite embedding features ranked by permutation importance (mean decrease in R² when feature is shuffled)."

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
plt.show()
```

Permutation importance gives a more trustworthy picture: it measures the actual drop in R² when each feature is shuffled. The ranking differs somewhat from MDI, which is expected — permutation importance is less biased and directly measures predictive contribution on the test set. The top features here are the ones that genuinely help the model distinguish between municipalities with different IMDS levels.

## Partial Dependence Plots

Partial dependence plots show the marginal effect of a single feature on predictions, averaging over all other features. They reveal non-linear relationships that a simple correlation coefficient can't capture — for example, a feature might have no effect below a threshold but a strong effect above it. We plot the top-6 most important features (by permutation importance).

```{code-cell} ipython3
#| label: fig-partial-dependence
#| fig-cap: "Partial dependence plots for the top-6 most important satellite embedding features, showing how each feature's value affects the predicted IMDS score."

top6_features = perm_importance.sort_values(ascending=False).head(6).index.tolist()
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
PartialDependenceDisplay.from_estimator(
    best_rf, X_train, top6_features, ax=axes.ravel(),
    grid_resolution=50, n_jobs=-1
)
fig.suptitle(f"Partial Dependence Plots — Top-6 Features for {TARGET_LABEL}", fontsize=14)
plt.tight_layout(rect=[0, 0, 1, 0.95])
plt.savefig(IMAGES_DIR / "ml_partial_dependence.png", dpi=300, bbox_inches="tight")
plt.show()
```

The partial dependence plots reveal non-linear relationships between the top features and predicted IMDS. Some dimensions show threshold effects — the predicted IMDS changes sharply at certain embedding values then levels off. These non-linearities justify using Random Forest over a linear model, as a linear regression would miss these step-like patterns. The embedding dimensions likely correspond to visual landscape features (urbanization, vegetation cover, infrastructure density) that change abruptly between rural and urban municipalities.

## Summary and Results

```{code-cell} ipython3
#| label: tbl-ml-results
#| tbl-cap: "Random Forest regression results: baseline vs tuned model performance on the test set."

results_df = pd.DataFrame({
    "Metric": ["R²", "RMSE", "MAE"],
    "Baseline": [f"{baseline_r2:.4f}", f"{baseline_rmse:.2f}", f"{baseline_mae:.2f}"],
    "Tuned": [f"{tuned_r2:.4f}", f"{tuned_rmse:.2f}", f"{tuned_mae:.2f}"],
})
results_df.to_csv(TABLES_DIR / "ml_rf_results.csv", index=False)

params_df = pd.DataFrame(
    [{"Parameter": k, "Value": v} for k, v in search.best_params_.items()]
)
params_df.to_csv(TABLES_DIR / "ml_rf_best_params.csv", index=False)

Markdown(results_df.to_markdown(index=False))
```

The summary table confirms that tuning provided negligible improvement over the baseline for this dataset: both models achieve R² around 0.23, RMSE of 6.52, and MAE near 4.7. The key takeaway is that satellite embeddings explain roughly a quarter of the variation in Bolivia's Municipal Sustainable Development Index — a meaningful signal that demonstrates remote sensing data captures real development-related patterns, while also highlighting that the majority of development variation is driven by factors not visible from space.

### Limitations and Next Steps

This analysis demonstrates that satellite embeddings contain real predictive signal for municipal development outcomes, but several limitations apply:

- **Moderate R²**: The model captures meaningful patterns but leaves much variation unexplained — development is driven by many factors invisible from space (governance, migration, informal economy).
- **Temporal mismatch**: We use 2017 satellite imagery with SDG indices from a potentially different period.
- **Feature interpretability**: Embedding dimensions (A00–A63) are abstract; connecting them to physical landscape features requires further analysis.
- **Small sample**: With only 339 municipalities, complex models risk overfitting despite cross-validation.

**Next steps** could include: trying other algorithms (gradient boosting, regularized regression), incorporating additional features (geographic, demographic), or using explainability tools like SHAP values for richer interpretation.
