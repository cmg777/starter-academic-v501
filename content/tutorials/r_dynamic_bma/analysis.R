# ============================================================
# Dynamic Panel BMA with the bdsm R Package
# Standalone R script for carlos-mendez.org
# ============================================================
#
# Reproduces the full analysis from the blog post:
#   PART 1 — Full BMA analysis (9 regressors, 512 models)
#   PART 2 — Benchmark fixed effects regression
#   PART 3 — Custom dark-theme ggplot visualizations
#
# Run: Rscript analysis.R
# Output: PNG files in the current directory
# ============================================================

# --- 0. Packages ---
required_packages <- c(
  "bdsm",       # Bayesian Dynamic Systems Modeling
  "tidyverse",  # data manipulation and visualization
  "parallel",   # parallel computing for model space estimation
  "scales"      # number formatting for ggplot axes
)

missing <- required_packages[!sapply(required_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(bdsm)
library(tidyverse)
library(parallel)
library(scales)

set.seed(42)


# ============================================================
# PART 1: FULL ANALYSIS - ECONOMIC GROWTH
# ============================================================

cat("\n\n========================================\n")
cat("PART 1: FULL ANALYSIS (9 Regressors, 512 Models)\n")
cat("========================================\n")

# --- 1.1 Load data ---
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

# --- 1.2 Data preparation ---
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

# --- 1.3 Model space ---
cat("\n--- Model Space (Precomputed) ---\n")
cat("Parameters matrix:", dim(full_model_space$params), "\n")
cat("Statistics matrix:", dim(full_model_space$stats), "\n")
cat("Number of models: 2^9 =", ncol(full_model_space$params), "\n")

cat("\nFirst 5 parameter rows, first 3 columns:\n")
print(full_model_space$params[1:5, 1:3])

# --- 1.4 BMA with default prior ---
cat("\n--- Bayesian Model Averaging (EMS = 4.5) ---\n")
bma_results <- bma(full_model_space, df = data_prepared, round = 3)

cat("\n=== BMA Results (Binomial prior) ===\n")
print(bma_results[[1]])

cat("\n=== BMA Results (Binomial-Beta prior) ===\n")
print(bma_results[[2]])

cat("\nExpected model sizes:\n")
print(bma_results[[16]])

# --- 1.5 Visualize model probabilities ---
cat("\n--- Model Probabilities ---\n")

png("r_bdsm_03_model_pmp_combined.png", width = 800, height = 500, res = 100)
pmp_plots <- model_pmp(bma_results)
print(pmp_plots[[3]])
dev.off()

png("r_bdsm_05_model_sizes.png", width = 800, height = 500, res = 100)
size_plots <- model_sizes(bma_results)
print(size_plots[[3]])
dev.off()

cat("Model probability and size plots saved.\n")

# --- 1.6 Best models ---
cat("\n--- Best Models ---\n")

best8 <- best_models(bma_results, criterion = 1, best = 8)
cat("\n=== Best 8 Models (Binomial) - Inclusion ===\n")
print(best8[[1]])

# knitr-formatted estimates
cat("\n=== Best 8 Models (Binomial) - Estimates (regular SE) ===\n")
print(best8[[5]])

# (gTree plots removed from post --- text output above is clearer)

cat("Best model plots saved.\n")

# --- 1.7 Coefficient distributions ---
cat("\n--- Coefficient Distributions ---\n")

coef_plots <- coef_hist(bma_results)

# Save histogram for key variable
png("r_bdsm_09_coef_hist_pop.png", width = 700, height = 450, res = 100)
print(coef_plots[[5]])
dev.off()

# (lnlex, polity histograms and kernel density removed from post)

cat("Coefficient distribution plots saved.\n")

# --- 1.8 Sensitivity to prior specification ---
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

# (EMS model_sizes plots removed from post --- dumbbell chart covers sensitivity)

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

# --- 1.9 Jointness analysis ---
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


# ============================================================
# PART 2: BENCHMARK - STANDARD FIXED EFFECTS MODEL
# ============================================================

cat("\n\n========================================\n")
cat("PART 2: BENCHMARK FIXED EFFECTS MODEL\n")
cat("========================================\n")

# Estimate a standard FE regression with ALL 9 regressors (kitchen-sink)
data("original_economic_growth")

cat("\n=== Kitchen-Sink Fixed Effects Regression ===\n")
fe_full <- lm(gdp ~ lag_gdp + ish + sed + pgrw + pop + ipr + opem + gsh + lnlex + polity + factor(country) + factor(year),
              data = original_economic_growth)
fe_summary <- summary(fe_full)

# Extract coefficients for the 9 regressors + lagged DV (exclude FE dummies)
vars_of_interest <- c("lag_gdp", "ish", "sed", "pgrw", "pop", "ipr", "opem", "gsh", "lnlex", "polity")
fe_coefs <- coef(fe_summary)[vars_of_interest, , drop = FALSE]
cat("\nFE regression coefficients:\n")
print(round(fe_coefs, 4))

# Count significant variables
sig_vars <- rownames(fe_coefs)[fe_coefs[, "Pr(>|t|)"] < 0.05]
cat("\nSignificant at 5%:", paste(sig_vars, collapse = ", "), "\n")
cat("Total significant:", length(sig_vars), "of", length(vars_of_interest), "\n")

cat("\nR-squared:", round(fe_summary$r.squared, 4), "\n")
cat("Adj. R-squared:", round(fe_summary$adj.r.squared, 4), "\n")
cat("N observations:", nobs(fe_full), "\n")


# ============================================================
# PART 3: CUSTOM GGPLOT VISUALIZATIONS (DARK THEME)
# ============================================================

cat("\n\n========================================\n")
cat("PART 3: CUSTOM GGPLOT VISUALIZATIONS\n")
cat("========================================\n")

# --- Site color palette ---
STEEL_BLUE   <- "#6a9bcc"
WARM_ORANGE  <- "#d97757"
NEAR_BLACK   <- "#141413"
TEAL         <- "#00d4c8"

# --- Dark theme palette ---
DARK_BG      <- "#0f1729"
DARK_PANEL   <- "#1f2b5e"
LIGHT_TEXT   <- "#c8d0e0"
LIGHTER_TEXT <- "#e8ecf2"

theme_site <- function(base_size = 14) {
  theme_minimal(base_size = base_size) %+replace%
    theme(
      text = element_text(color = LIGHTER_TEXT),
      plot.title = element_text(color = LIGHTER_TEXT, face = "bold", size = rel(1.1)),
      plot.subtitle = element_text(color = LIGHT_TEXT, size = rel(0.85)),
      plot.background = element_rect(fill = DARK_BG, color = NA),
      panel.background = element_rect(fill = DARK_BG, color = NA),
      panel.grid.major = element_line(color = DARK_PANEL, linewidth = 0.3),
      panel.grid.minor = element_blank(),
      axis.text = element_text(color = LIGHT_TEXT),
      legend.position = "bottom",
      legend.background = element_rect(fill = DARK_BG, color = NA),
      legend.key = element_rect(fill = DARK_BG, color = NA),
      legend.text = element_text(color = LIGHT_TEXT),
      legend.title = element_text(color = LIGHTER_TEXT),
      strip.text = element_text(color = LIGHTER_TEXT, face = "bold")
    )
}

# --- Extract BMA data ---
bma_tab <- bma_results[[1]]  # Binomial prior
pip_df <- data.frame(
  variable = rownames(bma_tab)[-1],  # exclude gdp_lag
  pip      = bma_tab[-1, "PIP"],
  pm       = bma_tab[-1, "PM"],
  psd      = bma_tab[-1, "PSD"],
  sign_pos = bma_tab[-1, "%(+)"],
  stringsAsFactors = FALSE
)

# Variable labels
var_labels <- c(
  ish = "Investment share", sed = "Education", pgrw = "Population growth",
  pop = "Population", ipr = "Investment price", opem = "Trade openness",
  gsh = "Government share", lnlex = "Life expectancy", polity = "Democracy"
)
pip_df$label <- var_labels[pip_df$variable]

# Robustness classification
pip_df$robustness <- cut(pip_df$pip,
  breaks = c(0, 0.50, 0.75, 1),
  labels = c("Weak (PIP < 0.50)", "Moderate (0.50-0.75)", "Positive (PIP >= 0.75)"),
  include.lowest = TRUE
)

# --- Figure A: PIP Bar Chart ---
cat("\nGenerating PIP bar chart...\n")

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
       subtitle = "Binomial prior (EMS = 4.5), 512 models averaged") +
  theme_site()

ggsave("r_dynamic_bma_pip.png", p_pip, width = 9, height = 5.5, dpi = 300, bg = DARK_BG)
cat("PIP bar chart saved.\n")


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
       subtitle = "Points = posterior mean, bars = approximate 95% credible intervals (PM +/- 2*PSD)") +
  theme_site()

ggsave("r_dynamic_bma_coef.png", p_coef, width = 9, height = 5.5, dpi = 300, bg = DARK_BG)
cat("Coefficient point-range plot saved.\n")


# --- Figure C: Prior Sensitivity Dumbbell Chart ---
cat("Generating prior sensitivity dumbbell chart...\n")

# Extract PIPs from three priors
bma_tab_bb  <- bma_results[[2]]    # Binomial-beta
bma_tab_ems2 <- bma_ems2[[1]]      # EMS = 2

sens_df <- data.frame(
  variable = pip_df$variable,
  label    = pip_df$label,
  Binomial = pip_df$pip,
  BinBeta  = bma_tab_bb[-1, "PIP"],
  EMS2     = bma_tab_ems2[-1, "PIP"],
  stringsAsFactors = FALSE
)

# Pivot to long format
sens_long <- sens_df %>%
  pivot_longer(cols = c(Binomial, BinBeta, EMS2),
               names_to = "prior", values_to = "pip") %>%
  mutate(prior = factor(prior,
    levels = c("EMS2", "Binomial", "BinBeta"),
    labels = c("Skeptical (EMS=2)", "Binomial (EMS=4.5)", "Binomial-Beta")
  ))

# Segment data for connecting lines
seg_df <- sens_df %>%
  mutate(pip_min = pmin(Binomial, BinBeta, EMS2),
         pip_max = pmax(Binomial, BinBeta, EMS2))

p_sens <- ggplot() +
  # Threshold lines
  geom_vline(xintercept = 0.75, linetype = "dashed", color = LIGHT_TEXT, linewidth = 0.5) +
  geom_vline(xintercept = 0.50, linetype = "dotted", color = LIGHT_TEXT, linewidth = 0.5, alpha = 0.6) +
  # Connecting segments
  geom_segment(data = seg_df,
    aes(x = pip_min, xend = pip_max,
        y = reorder(label, Binomial), yend = reorder(label, Binomial)),
    color = LIGHT_TEXT, alpha = 0.3, linewidth = 1.5) +
  # Points for each prior
  geom_point(data = sens_long,
    aes(x = pip, y = reorder(label, pip), color = prior),
    size = 3.5) +
  scale_color_manual(values = c(
    "Skeptical (EMS=2)"     = WARM_ORANGE,
    "Binomial (EMS=4.5)"    = STEEL_BLUE,
    "Binomial-Beta"         = TEAL
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
       subtitle = "Same data, three different prior specifications") +
  theme_site()

ggsave("r_dynamic_bma_sensitivity.png", p_sens, width = 9, height = 5.5, dpi = 300, bg = DARK_BG)
cat("Prior sensitivity dumbbell chart saved.\n")


# --- Summary ---
cat("\n\n========================================\n")
cat("ANALYSIS COMPLETE\n")
cat("========================================\n")
cat("Generated PNG files:\n")
print(list.files(pattern = "\\.png$"))
