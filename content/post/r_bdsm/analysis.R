# ============================================================
# Dynamic Panel BMA with the bdsm R Package
# Standalone R script for carlos-mendez.org
# ============================================================
#
# This script generates all figures and output for the blog post.
# Run: Rscript analysis.R
# Output: PNG files in the current directory
# ============================================================

# --- 0. Packages ---
required_packages <- c(
  "bdsm",       # Bayesian Dynamic Systems Modeling
  "tidyverse",  # data manipulation and visualization
  "parallel"    # parallel computing for model space estimation
)

missing <- required_packages[!sapply(required_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(bdsm)
library(tidyverse)
library(parallel)

set.seed(42)


# ============================================================
# PART 1: WARM-UP WITH A SMALL MODEL SPACE
# ============================================================

cat("\n========================================\n")
cat("PART 1: WARM-UP (3 Regressors, 8 Models)\n")
cat("========================================\n")

# Use the precomputed small_model_space (ish, sed, pgrw only)
data("economic_growth")
data("small_model_space")

# Prepare data subset matching the 3 regressors
data_small <- economic_growth %>%
  select(year, country, gdp, ish, sed, pgrw)

data_small_std <- feature_standardization(
  df = data_small,
  excluded_cols = c(country, year, gdp)
)

data_small_prep <- feature_standardization(
  df = data_small_std,
  group_by_col = year,
  excluded_cols = country,
  scale = FALSE
)

cat("Small model space: 3 regressors -> 2^3 = 8 models\n")
cat("Regressors: ish (investment share), sed (education), pgrw (population growth)\n")

bma_small <- bma(small_model_space, df = data_small_prep, round = 3)
cat("\n=== Small BMA Results (Binomial) ===\n")
print(bma_small[[1]])
cat("\n=== Small BMA Results (Binomial-Beta) ===\n")
print(bma_small[[2]])
cat("\nExpected model sizes:\n")
print(bma_small[[16]])

# Visualize small model space
png("r_bdsm_01_small_pmp.png", width = 800, height = 500, res = 100)
pmp_small <- model_pmp(bma_small)
print(pmp_small[[3]])
dev.off()

png("r_bdsm_02_small_sizes.png", width = 800, height = 500, res = 100)
sizes_small <- model_sizes(bma_small)
print(sizes_small[[3]])
dev.off()

cat("Small model space plots saved.\n")


# ============================================================
# PART 2: FULL ANALYSIS - ECONOMIC GROWTH
# ============================================================

cat("\n\n========================================\n")
cat("PART 2: FULL ANALYSIS (9 Regressors, 512 Models)\n")
cat("========================================\n")

# --- 2.1 Load data ---
data("economic_growth")
data("original_economic_growth")
data("full_model_space")

cat("\n=== economic_growth dataset ===\n")
cat("Dimensions:", dim(economic_growth), "\n")
cat("Countries:", length(unique(economic_growth$country)), "\n")
cat("Years:", sort(unique(economic_growth$year)), "\n")
cat("\nFirst 10 rows:\n")
print(head(economic_growth, 10))

cat("\n=== original_economic_growth dataset ===\n")
cat("Dimensions:", dim(original_economic_growth), "\n")
cat("\nFirst 8 rows:\n")
print(head(original_economic_growth, 8))

cat("\n=== Summary statistics (excluding initial period NAs) ===\n")
print(summary(original_economic_growth))

# --- 2.2 Data preparation ---
cat("\n--- Data Preparation ---\n")

# Demonstrate join_lagged_col
cat("\nUsing join_lagged_col to merge lagged GDP:\n")
eg_joined <- join_lagged_col(
  df = original_economic_growth,
  col = gdp,
  col_lagged = lag_gdp,
  timestamp_col = year,
  entity_col = country,
  timestep = 10
)
cat("Result dimensions:", dim(eg_joined), "\n")
cat("First 10 rows:\n")
print(head(eg_joined, 10))

# Step 1: Standardize (scale) all regressors
data_std <- feature_standardization(
  df = economic_growth,
  excluded_cols = c(country, year, gdp)
)

cat("\nAfter standardization (first 6 rows):\n")
print(head(data_std, 6))

# Step 2: Demean by time period (remove time fixed effects)
data_prepared <- feature_standardization(
  df = data_std,
  group_by_col = year,
  excluded_cols = country,
  scale = FALSE
)

cat("\nAfter demeaning by year (first 6 rows):\n")
print(head(data_prepared, 6))

# --- 2.3 Model space ---
cat("\n--- Model Space (Precomputed) ---\n")
cat("Parameters matrix:", dim(full_model_space$params), "\n")
cat("Statistics matrix:", dim(full_model_space$stats), "\n")
cat("Number of models: 2^9 =", ncol(full_model_space$params), "\n")

cat("\nFirst 5 parameter rows, first 3 columns:\n")
print(full_model_space$params[1:5, 1:3])

# --- 2.4 BMA with default prior ---
cat("\n--- Bayesian Model Averaging (EMS = 4.5) ---\n")
bma_results <- bma(full_model_space, df = data_prepared, round = 3)

cat("\n=== BMA Results (Binomial prior) ===\n")
print(bma_results[[1]])

cat("\n=== BMA Results (Binomial-Beta prior) ===\n")
print(bma_results[[2]])

cat("\nExpected model sizes:\n")
print(bma_results[[16]])

# --- 2.5 Visualize model probabilities ---
cat("\n--- Model Probabilities ---\n")

png("r_bdsm_03_model_pmp_combined.png", width = 800, height = 500, res = 100)
pmp_plots <- model_pmp(bma_results)
print(pmp_plots[[3]])
dev.off()

png("r_bdsm_04_model_pmp_top10.png", width = 800, height = 500, res = 100)
pmp_top <- model_pmp(bma_results, top = 10)
print(pmp_top[[3]])
dev.off()

png("r_bdsm_05_model_sizes.png", width = 800, height = 500, res = 100)
size_plots <- model_sizes(bma_results)
print(size_plots[[3]])
dev.off()

cat("Model probability and size plots saved.\n")

# --- 2.6 Best models ---
cat("\n--- Best Models ---\n")

best8 <- best_models(bma_results, criterion = 1, best = 8)
cat("\n=== Best 8 Models (Binomial) - Inclusion ===\n")
print(best8[[1]])

# knitr-formatted estimates
cat("\n=== Best 8 Models (Binomial) - Estimates (regular SE) ===\n")
print(best8[[5]])

# gTree plots (elements 7=inclusion, 8=estimates regular, 9=estimates robust)
png("r_bdsm_06_best_models_inclusion.png", width = 900, height = 600, res = 100)
grid::grid.draw(best8[[7]])
dev.off()

png("r_bdsm_07_best_models_estimates.png", width = 900, height = 600, res = 100)
grid::grid.draw(best8[[8]])
dev.off()

# Best models with robust SE
best5_robust <- best_models(bma_results, criterion = 1, best = 5, robust = TRUE)
cat("\n=== Best 5 Models (Binomial) - Estimates (robust SE) ===\n")
print(best5_robust[[5]])

cat("Best model plots saved.\n")

# --- 2.7 Coefficient distributions ---
cat("\n--- Coefficient Distributions ---\n")

coef_plots <- coef_hist(bma_results)

# Save histograms for key variables
png("r_bdsm_08_coef_hist_gdplag.png", width = 700, height = 450, res = 100)
print(coef_plots[[1]])
dev.off()

png("r_bdsm_09_coef_hist_pop.png", width = 700, height = 450, res = 100)
print(coef_plots[[5]])
dev.off()

png("r_bdsm_10_coef_hist_lnlex.png", width = 700, height = 450, res = 100)
print(coef_plots[[9]])
dev.off()

png("r_bdsm_11_coef_hist_polity.png", width = 700, height = 450, res = 100)
print(coef_plots[[10]])
dev.off()

# Kernel densities
coef_kern <- coef_hist(bma_results, kernel = 1)

png("r_bdsm_12_coef_kernel_pop.png", width = 700, height = 450, res = 100)
print(coef_kern[[5]])
dev.off()

cat("Coefficient distribution plots saved.\n")

# --- 2.8 Sensitivity to prior specification ---
cat("\n--- Prior Sensitivity Analysis ---\n")

# EMS = 2 (small models)
bma_ems2 <- bma(full_model_space, df = data_prepared, round = 3, EMS = 2)
cat("\n=== BMA with EMS = 2 (Binomial) ===\n")
print(bma_ems2[[1]])
cat("\nExpected model sizes (EMS=2):\n")
print(bma_ems2[[16]])

# EMS = 8 (large models)
bma_ems8 <- bma(full_model_space, df = data_prepared, round = 3, EMS = 8)
cat("\n=== BMA with EMS = 8 (Binomial) ===\n")
print(bma_ems8[[1]])
cat("\nExpected model sizes (EMS=8):\n")
print(bma_ems8[[16]])

# Model sizes comparison plots
png("r_bdsm_14_sizes_ems2.png", width = 800, height = 500, res = 100)
sizes_ems2 <- model_sizes(bma_ems2)
print(sizes_ems2[[3]])
dev.off()

png("r_bdsm_15_sizes_ems8.png", width = 800, height = 500, res = 100)
sizes_ems8 <- model_sizes(bma_ems8)
print(sizes_ems8[[3]])
dev.off()

# Dilution prior (omega = 0.5)
bma_dil <- bma(full_model_space, df = data_prepared, round = 3, dilution = 1)
cat("\n=== BMA with Dilution Prior (omega=0.5) ===\n")
print(bma_dil[[1]])
cat("\nExpected model sizes (dilution):\n")
print(bma_dil[[16]])

png("r_bdsm_16_sizes_dilution.png", width = 800, height = 500, res = 100)
sizes_dil <- model_sizes(bma_dil)
print(sizes_dil[[3]])
dev.off()

# Dilution prior (omega = 2)
bma_dil2 <- bma(full_model_space, df = data_prepared, round = 3, dilution = 1, dil.Par = 2)
cat("\n=== BMA with Dilution Prior (omega=2) ===\n")
print(bma_dil2[[1]])

cat("Prior sensitivity plots saved.\n")

# --- 2.9 Jointness analysis ---
cat("\n--- Jointness Analysis ---\n")

cat("\n=== Jointness (HCGHM, default) ===\n")
j_hcghm <- jointness(bma_results)
print(j_hcghm)

cat("\n=== Jointness (Ley-Strazicich) ===\n")
j_ls <- jointness(bma_results, measure = "LS")
print(j_ls)

cat("\n=== Jointness (Doppelhofer-Weeks) ===\n")
j_dw <- jointness(bma_results, measure = "DW")
print(j_dw)


# --- Summary ---
cat("\n\n========================================\n")
cat("ANALYSIS COMPLETE\n")
cat("========================================\n")
cat("Generated PNG files:\n")
print(list.files(pattern = "r_bdsm_.*\\.png"))
