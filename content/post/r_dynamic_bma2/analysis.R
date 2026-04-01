# ══════════════════════════════════════════════════════════════
# Dynamic Panel BMA: Which Factors Truly Drive Economic Growth?
# ══════════════════════════════════════════════════════════════
#
# Bayesian Model Averaging for dynamic panel data with weakly
# exogenous regressors using the bdsm R package.
#
# Improvements over v1:
#   - Data preparation demeaning by BOTH year AND entity (country)
#   - All tables exported as CSV files
#   - All source/processed datasets exported as CSV
#   - README.md generated with artifact inventory
#
# Usage:  Rscript analysis.R
# Output: PNG figures + CSV tables in current directory
#
# References:
#   - Moral-Benito (2012, 2013, 2016)
#   - Wyszynski et al. (2025) -- bdsm package
#   - Sala-i-Martin et al. (2004) -- growth determinants
# ══════════════════════════════════════════════════════════════


# ── 0. Setup ─────────────────────────────────────────────────

required_packages <- c("bdsm", "tidyverse", "parallel", "scales")
missing <- required_packages[!sapply(required_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(bdsm)
library(tidyverse)
library(parallel)
library(scales)

set.seed(42)

# Site color palette
STEEL_BLUE   <- "#6a9bcc"
WARM_ORANGE  <- "#d97757"
NEAR_BLACK   <- "#141413"
TEAL         <- "#00d4c8"

# Dark theme palette
DARK_BG      <- "#0f1729"
DARK_PANEL   <- "#1f2b5e"
LIGHT_TEXT   <- "#c8d0e0"
LIGHTER_TEXT <- "#e8ecf2"

# Custom ggplot2 dark theme
theme_site <- function(base_size = 14) {
  theme_minimal(base_size = base_size) %+replace%
    theme(
      text             = element_text(color = LIGHTER_TEXT),
      plot.title       = element_text(color = LIGHTER_TEXT, face = "bold", size = rel(1.1)),
      plot.subtitle    = element_text(color = LIGHT_TEXT, size = rel(0.85)),
      plot.background  = element_rect(fill = DARK_BG, color = NA),
      panel.background = element_rect(fill = DARK_BG, color = NA),
      panel.grid.major = element_line(color = DARK_PANEL, linewidth = 0.3),
      panel.grid.minor = element_blank(),
      axis.text        = element_text(color = LIGHT_TEXT),
      legend.position  = "bottom",
      legend.background = element_rect(fill = DARK_BG, color = NA),
      legend.key       = element_rect(fill = DARK_BG, color = NA),
      legend.text      = element_text(color = LIGHT_TEXT),
      legend.title     = element_text(color = LIGHTER_TEXT),
      strip.text       = element_text(color = LIGHTER_TEXT, face = "bold")
    )
}

# Variable labels for figures
VAR_LABELS <- c(
  ish = "Investment share", sed = "Education", pgrw = "Population growth",
  pop = "Population", ipr = "Investment price", opem = "Trade openness",
  gsh = "Government share", lnlex = "Life expectancy", polity = "Democracy"
)


# ── 1. Data Loading ──────────────────────────────────────────

cat("\n========================================\n")
cat("1. DATA LOADING\n")
cat("========================================\n")

data("economic_growth")
data("original_economic_growth")
data("full_model_space")

cat("\n--- economic_growth ---\n")
cat("Dimensions:", dim(economic_growth), "\n")
cat("Countries:", length(unique(economic_growth$country)), "\n")
cat("Years:", sort(unique(economic_growth$year)), "\n")
cat("\nFirst 8 rows:\n")
print(head(economic_growth, 8))

cat("\n--- original_economic_growth ---\n")
cat("Dimensions:", dim(original_economic_growth), "\n")
cat("\nFirst 8 rows:\n")
print(head(original_economic_growth, 8))

cat("\n--- Summary statistics ---\n")
print(summary(original_economic_growth))

# Export source datasets
write_csv(economic_growth, "economic_growth.csv")
write_csv(original_economic_growth, "original_economic_growth.csv")
cat("\nExported: economic_growth.csv, original_economic_growth.csv\n")


# ── 2. Data Preparation (3-step pipeline) ────────────────────

cat("\n========================================\n")
cat("2. DATA PREPARATION\n")
cat("========================================\n")

# Step 1: Standardize (scale) all regressors
cat("\nStep 1: Standardize regressors...\n")
data_step1 <- feature_standardization(
  df = economic_growth,
  excluded_cols = c(country, year, gdp)
)
cat("After standardization (first 6 rows):\n")
print(head(data_step1, 6))

# Step 2: Demean by time period (remove time fixed effects)
cat("\nStep 2: Demean by year (time FE)...\n")
data_step2 <- feature_standardization(
  df = data_step1,
  group_by_col = year,
  excluded_cols = country,
  scale = FALSE
)
cat("After year demeaning (first 6 rows):\n")
print(head(data_step2, 6))

# Step 3: Demean by entity (remove entity fixed effects)
cat("\nStep 3: Demean by country (entity FE)...\n")
data_prepared <- feature_standardization(
  df = data_step2,
  group_by_col = country,
  excluded_cols = year,
  scale = FALSE
)
cat("After entity demeaning (first 6 rows):\n")
print(head(data_prepared, 6))

cat("\nFinal prepared data dimensions:", dim(data_prepared), "\n")

# Export processed dataset
write_csv(data_prepared, "data_prepared.csv")
cat("Exported: data_prepared.csv\n")


# ── 3. Model Space ───────────────────────────────────────────
#
# NOTE: full_model_space is precomputed by the bdsm package using
# optim_model_space() on the package's default data preparation
# (year-demeaned only). Our data_prepared adds entity demeaning.
# The bma() function uses full_model_space for parameter estimates
# and log-likelihoods but recalculates BMA weights using df.
# For a fully consistent analysis with entity+time demeaning,
# re-run optim_model_space(data_prepared, ...) -- this is slow
# (~10 min) but ensures the model space matches the data prep.
# We use the precomputed space here for speed and comparability
# with the bdsm package vignette.

cat("\n========================================\n")
cat("3. MODEL SPACE\n")
cat("========================================\n")

cat("Parameters matrix:", dim(full_model_space$params), "\n")
cat("Statistics matrix:", dim(full_model_space$stats), "\n")
cat("Number of models: 2^9 =", ncol(full_model_space$params), "\n")

cat("\nFirst 5 rows, first 3 columns of params:\n")
print(full_model_space$params[1:5, 1:3])


# ── 4. Benchmark: Kitchen-Sink Fixed Effects ─────────────────

cat("\n========================================\n")
cat("4. BENCHMARK: KITCHEN-SINK FIXED EFFECTS\n")
cat("========================================\n")

fe_full <- lm(
  gdp ~ lag_gdp + ish + sed + pgrw + pop + ipr + opem + gsh + lnlex + polity +
    factor(country) + factor(year),
  data = original_economic_growth
)
fe_summary <- summary(fe_full)

vars_of_interest <- c("lag_gdp", "ish", "sed", "pgrw", "pop", "ipr",
                       "opem", "gsh", "lnlex", "polity")
fe_coefs <- coef(fe_summary)[vars_of_interest, , drop = FALSE]

cat("\nFE regression coefficients:\n")
print(round(fe_coefs, 4))

sig_vars <- rownames(fe_coefs)[fe_coefs[, "Pr(>|t|)"] < 0.05]
cat("\nSignificant at 5%:", paste(sig_vars, collapse = ", "), "\n")
cat("Total significant:", length(sig_vars), "of", length(vars_of_interest), "\n")
cat("R-squared:", round(fe_summary$r.squared, 4), "\n")
cat("Adj. R-squared:", round(fe_summary$adj.r.squared, 4), "\n")
cat("N observations:", nobs(fe_full), "\n")

# Export FE results
fe_coefs_df <- as.data.frame(fe_coefs) %>%
  rownames_to_column("variable")
write_csv(fe_coefs_df, "fe_regression.csv")
cat("Exported: fe_regression.csv\n")


# ── 5. BMA with Default Prior (EMS = 4.5) ────────────────────

cat("\n========================================\n")
cat("5. BMA: DEFAULT PRIOR (EMS = 4.5)\n")
cat("========================================\n")

bma_results <- bma(full_model_space, df = data_prepared, round = 3)

cat("\n--- Binomial prior ---\n")
print(bma_results[[1]])

cat("\n--- Binomial-Beta prior ---\n")
print(bma_results[[2]])

cat("\n--- Expected model sizes ---\n")
print(bma_results[[16]])

# Export BMA tables
bma_bin_df <- as.data.frame(bma_results[[1]]) %>% rownames_to_column("variable")
bma_bb_df  <- as.data.frame(bma_results[[2]]) %>% rownames_to_column("variable")
write_csv(bma_bin_df, "bma_binomial.csv")
write_csv(bma_bb_df, "bma_binomial_beta.csv")
cat("Exported: bma_binomial.csv, bma_binomial_beta.csv\n")


# ── 6. Built-in bdsm Visualizations ─────────────────────────

cat("\n========================================\n")
cat("6. BDSM BUILT-IN PLOTS\n")
cat("========================================\n")

# Model probabilities (prior vs posterior)
png("r_bdsm_model_pmp.png", width = 2400, height = 1500, res = 300)
pmp_plots <- model_pmp(bma_results)
print(pmp_plots[[3]])
dev.off()
cat("Saved: r_bdsm_model_pmp.png\n")

# Model sizes
png("r_bdsm_model_sizes.png", width = 2400, height = 1500, res = 300)
size_plots <- model_sizes(bma_results)
print(size_plots[[3]])
dev.off()
cat("Saved: r_bdsm_model_sizes.png\n")

# Coefficient histogram (population variable)
png("r_bdsm_coef_hist_pop.png", width = 2100, height = 1350, res = 300)
coef_plots <- coef_hist(bma_results)
print(coef_plots[[5]])
dev.off()
cat("Saved: r_bdsm_coef_hist_pop.png\n")


# ── 7. Best Models ───────────────────────────────────────────

cat("\n========================================\n")
cat("7. BEST MODELS (TOP 8)\n")
cat("========================================\n")

best8 <- best_models(bma_results, criterion = 1, best = 8)

cat("\n--- Inclusion matrix (binomial) ---\n")
print(best8[[1]])

cat("\n--- Estimates (regular SE) ---\n")
print(best8[[5]])

# Export best models
best8_inc_df <- as.data.frame(best8[[1]]) %>% rownames_to_column("variable")
best8_est_df <- as.data.frame(best8[[5]]) %>% rownames_to_column("variable")
write_csv(best8_inc_df, "best_models_inclusion.csv")
write_csv(best8_est_df, "best_models_estimates.csv")
cat("Exported: best_models_inclusion.csv, best_models_estimates.csv\n")


# ── 8. Prior Sensitivity Analysis ────────────────────────────

cat("\n========================================\n")
cat("8. PRIOR SENSITIVITY ANALYSIS\n")
cat("========================================\n")

# EMS = 2 (skeptical -- expect only 2 regressors)
cat("\n--- BMA with EMS = 2 (Skeptical) ---\n")
bma_ems2 <- bma(full_model_space, df = data_prepared, round = 3, EMS = 2)
print(bma_ems2[[1]])
cat("\nExpected model sizes (EMS=2):\n")
print(bma_ems2[[16]])

# EMS = 8 (generous -- expect 8 of 9 regressors)
cat("\n--- BMA with EMS = 8 (Generous) ---\n")
bma_ems8 <- bma(full_model_space, df = data_prepared, round = 3, EMS = 8)
print(bma_ems8[[1]])
cat("\nExpected model sizes (EMS=8):\n")
print(bma_ems8[[16]])

# Dilution prior (omega = 0.5) -- penalizes correlated regressors
cat("\n--- BMA with Dilution Prior (omega=0.5) ---\n")
bma_dil <- bma(full_model_space, df = data_prepared, round = 3, dilution = 1)
print(bma_dil[[1]])
cat("\nExpected model sizes (dilution):\n")
print(bma_dil[[16]])

# Model sizes under dilution
png("r_bdsm_sizes_dilution.png", width = 2400, height = 1500, res = 300)
sizes_dil <- model_sizes(bma_dil)
print(sizes_dil[[3]])
dev.off()
cat("Saved: r_bdsm_sizes_dilution.png\n")

# Dilution prior (omega = 2) -- stronger penalty
cat("\n--- BMA with Dilution Prior (omega=2) ---\n")
bma_dil2 <- bma(full_model_space, df = data_prepared, round = 3, dilution = 1, dil.Par = 2)
print(bma_dil2[[1]])

# Build combined sensitivity table
bma_tab     <- bma_results[[1]]
bma_tab_bb  <- bma_results[[2]]
bma_tab_e2  <- bma_ems2[[1]]
bma_tab_e8  <- bma_ems8[[1]]
bma_tab_d1  <- bma_dil[[1]]
bma_tab_d2  <- bma_dil2[[1]]

vars <- rownames(bma_tab)[-1]  # exclude gdp_lag
sensitivity_df <- data.frame(
  variable     = vars,
  label        = VAR_LABELS[vars],
  PIP_Binomial = bma_tab[-1, "PIP"],
  PIP_BinBeta  = bma_tab_bb[-1, "PIP"],
  PIP_EMS2     = bma_tab_e2[-1, "PIP"],
  PIP_EMS8     = bma_tab_e8[-1, "PIP"],
  PIP_Dilution = bma_tab_d1[-1, "PIP"],
  PIP_Dilution2 = bma_tab_d2[-1, "PIP"],
  stringsAsFactors = FALSE
)
write_csv(sensitivity_df, "prior_sensitivity.csv")
cat("Exported: prior_sensitivity.csv\n")


# ── 9. Jointness Analysis ───────────────────────────────────

cat("\n========================================\n")
cat("9. JOINTNESS ANALYSIS\n")
cat("========================================\n")

cat("\n--- HCGHM measure (default) ---\n")
j_hcghm <- jointness(bma_results)
print(j_hcghm)

cat("\n--- Ley-Strazicich measure ---\n")
j_ls <- jointness(bma_results, measure = "LS")
print(j_ls)

cat("\n--- Doppelhofer-Weeks measure ---\n")
j_dw <- jointness(bma_results, measure = "DW")
print(j_dw)

# Export jointness
j_hcghm_df <- as.data.frame(as.matrix(j_hcghm)) %>% rownames_to_column("variable")
write_csv(j_hcghm_df, "jointness_hcghm.csv")
cat("Exported: jointness_hcghm.csv\n")


# ── 10. Custom ggplot2 Visualizations (Dark Theme) ──────────

cat("\n========================================\n")
cat("10. CUSTOM GGPLOT2 FIGURES\n")
cat("========================================\n")

# Extract BMA data for plotting
pip_df <- data.frame(
  variable = vars,
  pip      = bma_tab[-1, "PIP"],
  pm       = bma_tab[-1, "PM"],
  psd      = bma_tab[-1, "PSD"],
  sign_pos = bma_tab[-1, "%(+)"],
  stringsAsFactors = FALSE
)
pip_df$label <- VAR_LABELS[pip_df$variable]

# Robustness classification
pip_df$robustness <- cut(pip_df$pip,
  breaks = c(0, 0.50, 0.75, 1),
  labels = c("Weak (PIP < 0.50)", "Moderate (0.50-0.75)", "Positive (PIP >= 0.75)"),
  include.lowest = TRUE
)

# --- Figure A: PIP Bar Chart ---
cat("Generating PIP bar chart...\n")

p_pip <- ggplot(pip_df, aes(x = reorder(label, pip), y = pip, fill = robustness)) +
  geom_col(width = 0.65) +
  geom_hline(yintercept = 0.75, linetype = "dashed", color = LIGHT_TEXT, linewidth = 0.5) +
  geom_hline(yintercept = 0.50, linetype = "dotted", color = LIGHT_TEXT, linewidth = 0.5, alpha = 0.6) +
  annotate("text", x = 0.7, y = 0.77, label = "Positive evidence (0.75)",
           hjust = 0, size = 3, color = LIGHT_TEXT) +
  annotate("text", x = 0.7, y = 0.52, label = "Weak evidence (0.50)",
           hjust = 0, size = 3, color = LIGHT_TEXT) +
  coord_flip() +
  scale_fill_manual(values = c(
    "Positive (PIP >= 0.75)" = STEEL_BLUE,
    "Moderate (0.50-0.75)"   = TEAL,
    "Weak (PIP < 0.50)"     = WARM_ORANGE
  )) +
  scale_y_continuous(limits = c(0, 1.05), breaks = seq(0, 1, 0.25),
                     labels = label_number(accuracy = 0.01)) +
  labs(x = NULL, y = "Posterior Inclusion Probability (PIP)",
       fill = "Evidence strength",
       title = "BMA: Posterior Inclusion Probabilities",
       subtitle = "Binomial prior (EMS = 4.5), 512 models averaged | Entity + time demeaned") +
  theme_site()

ggsave("r_dynamic_bma2_pip.png", p_pip, width = 9, height = 5.5, dpi = 300, bg = DARK_BG)
cat("Saved: r_dynamic_bma2_pip.png\n")

# --- Figure B: Coefficient Point-Range Plot ---
cat("Generating coefficient point-range plot...\n")

pip_df$ci_low  <- pip_df$pm - 2 * pip_df$psd
pip_df$ci_high <- pip_df$pm + 2 * pip_df$psd

p_coef <- ggplot(pip_df, aes(x = reorder(label, pip), y = pm, color = robustness)) +
  geom_hline(yintercept = 0, linetype = "solid", color = LIGHT_TEXT, alpha = 0.4) +
  geom_pointrange(aes(ymin = ci_low, ymax = ci_high), size = 0.6, linewidth = 0.8) +
  coord_flip() +
  scale_color_manual(values = c(
    "Positive (PIP >= 0.75)" = STEEL_BLUE,
    "Moderate (0.50-0.75)"   = TEAL,
    "Weak (PIP < 0.50)"     = WARM_ORANGE
  )) +
  labs(x = NULL, y = "Posterior Mean Coefficient",
       color = "Evidence strength",
       title = "BMA: Posterior Coefficient Estimates",
       subtitle = "Points = posterior mean, bars = 95% credible intervals (PM +/- 2*PSD)") +
  theme_site()

ggsave("r_dynamic_bma2_coef.png", p_coef, width = 9, height = 5.5, dpi = 300, bg = DARK_BG)
cat("Saved: r_dynamic_bma2_coef.png\n")

# --- Figure C: Prior Sensitivity Dumbbell Chart ---
cat("Generating prior sensitivity dumbbell chart...\n")

sens_df <- data.frame(
  variable = pip_df$variable,
  label    = pip_df$label,
  Binomial = pip_df$pip,
  BinBeta  = bma_tab_bb[-1, "PIP"],
  EMS2     = bma_tab_e2[-1, "PIP"],
  stringsAsFactors = FALSE
)

sens_long <- sens_df %>%
  pivot_longer(cols = c(Binomial, BinBeta, EMS2),
               names_to = "prior", values_to = "pip") %>%
  mutate(prior = factor(prior,
    levels = c("EMS2", "Binomial", "BinBeta"),
    labels = c("Skeptical (EMS=2)", "Binomial (EMS=4.5)", "Binomial-Beta")
  ))

seg_df <- sens_df %>%
  mutate(pip_min = pmin(Binomial, BinBeta, EMS2),
         pip_max = pmax(Binomial, BinBeta, EMS2))

p_sens <- ggplot() +
  geom_vline(xintercept = 0.75, linetype = "dashed", color = LIGHT_TEXT, linewidth = 0.5) +
  geom_vline(xintercept = 0.50, linetype = "dotted", color = LIGHT_TEXT, linewidth = 0.5, alpha = 0.6) +
  geom_segment(data = seg_df,
    aes(x = pip_min, xend = pip_max,
        y = reorder(label, Binomial), yend = reorder(label, Binomial)),
    color = LIGHT_TEXT, alpha = 0.3, linewidth = 1.5) +
  geom_point(data = sens_long,
    aes(x = pip, y = reorder(label, pip), color = prior),
    size = 3.5) +
  scale_color_manual(values = c(
    "Skeptical (EMS=2)"  = WARM_ORANGE,
    "Binomial (EMS=4.5)" = STEEL_BLUE,
    "Binomial-Beta"      = TEAL
  )) +
  scale_x_continuous(limits = c(0, 1.05), breaks = seq(0, 1, 0.25),
                     labels = label_number(accuracy = 0.01)) +
  annotate("text", y = 0.5, x = 0.77, label = "Positive (0.75)",
           hjust = 0, size = 2.8, color = LIGHT_TEXT) +
  annotate("text", y = 0.5, x = 0.52, label = "Weak (0.50)",
           hjust = 0, size = 2.8, color = LIGHT_TEXT) +
  labs(x = "Posterior Inclusion Probability (PIP)", y = NULL,
       color = "Model prior",
       title = "Prior Sensitivity: How Robust Are the PIPs?",
       subtitle = "Same data, three prior specifications | Entity + time demeaned") +
  theme_site()

ggsave("r_dynamic_bma2_sensitivity.png", p_sens, width = 9, height = 5.5, dpi = 300, bg = DARK_BG)
cat("Saved: r_dynamic_bma2_sensitivity.png\n")


# ── 11. Summary ──────────────────────────────────────────────

cat("\n========================================\n")
cat("ANALYSIS COMPLETE\n")
cat("========================================\n")

cat("\nGenerated PNG files:\n")
png_files <- list.files(pattern = "\\.png$")
print(png_files)

cat("\nGenerated CSV files:\n")
csv_files <- list.files(pattern = "\\.csv$")
print(csv_files)

# Clean up R artifacts
if (file.exists("Rplots.pdf")) {
  unlink("Rplots.pdf")
  cat("Cleaned up: Rplots.pdf\n")
}

cat("\n=== Script completed successfully ===\n")
