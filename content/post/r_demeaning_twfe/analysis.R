# ══════════════════════════════════════════════════════════════════
# Manual Demeaning vs Two-Way Fixed Effects
#
# This script demonstrates the algebraic equivalence between
# two-way fixed effects (TWFE) estimation and OLS on manually
# demeaned data, grounded in the Frisch-Waugh-Lovell (FWL) theorem.
# It uses a balanced panel of ~150 countries over 8 time periods
# from the Barro convergence dataset.
#
# Usage:  Rscript analysis.R
# Output: r_demeaning_twfe_*.png figures + *.csv tables
#
# References:
#   - Frisch-Waugh-Lovell theorem
#   - referenceMaterials/manual_demeaning_twfe_tutorial.qmd
# ══════════════════════════════════════════════════════════════════


# ── 0. Setup ─────────────────────────────────────────────────────

required_packages <- c("fixest", "tidyverse", "scales")
missing <- required_packages[!sapply(required_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(fixest)
library(tidyverse)
library(scales)
set.seed(42)

# Site color palette
STEEL_BLUE   <- "#6a9bcc"
WARM_ORANGE  <- "#d97757"
NEAR_BLACK   <- "#141413"
TEAL         <- "#00d4c8"

# Variable labels for human-readable axis text
VAR_LABELS <- c(
  growth       = "GDP per Capita Growth",
  ln_y_initial = "Log Initial Income",
  log_s_k      = "Log Investment Share",
  log_n_gd     = "Log(n + g + d)",
  log_hcap     = "Log Human Capital",
  gov_cons     = "Gov. Consumption Share"
)

# Variables to demean (dependent + all regressors)
VARS_TO_DEMEAN <- c("growth", "ln_y_initial", "log_s_k",
                     "log_n_gd", "log_hcap", "gov_cons")


# ── 1. Data Loading and Panel Structure ──────────────────────────

cat("\n========================================\n")
cat("1. DATA LOADING AND PANEL STRUCTURE\n")
cat("========================================\n")

panel_data <- read.csv("referenceMaterials/barro_convergence_panel.csv")
panel_data$id   <- factor(panel_data$id)
panel_data$time <- factor(panel_data$time)

n_countries <- nlevels(panel_data$id)
n_periods   <- nlevels(panel_data$time)

cat("Countries:", n_countries, "\n")
cat("Time periods:", n_periods, "\n")
cat("Total observations:", nrow(panel_data), "\n")
cat("Balanced panel:", all(table(panel_data$id) == n_periods), "\n\n")

cat("Summary of key variables:\n")
print(summary(panel_data[VARS_TO_DEMEAN]))

# Export source data
write_csv(panel_data, "source_data.csv")

# Figure 1: Panel structure heatmap
panel_grid <- expand.grid(
  id   = levels(panel_data$id),
  time = levels(panel_data$time)
)
panel_grid$present <- 1

p1 <- ggplot(panel_grid, aes(x = time, y = id, fill = factor(present))) +
  geom_tile(color = "white", linewidth = 0.05) +
  scale_fill_manual(values = c("1" = STEEL_BLUE), guide = "none") +
  labs(
    title = "Panel Structure: Countries x Time Periods",
    subtitle = paste0("Balanced panel: ", n_countries, " countries x ",
                      n_periods, " periods = ", nrow(panel_data), " obs"),
    x = "Time Period",
    y = NULL
  ) +
  theme_minimal(base_size = 13) +
  theme(
    axis.text.y      = element_blank(),
    axis.ticks.y     = element_blank(),
    panel.grid       = element_blank(),
    plot.title       = element_text(face = "bold", color = NEAR_BLACK),
    plot.subtitle    = element_text(color = "gray40")
  )

ggsave("r_demeaning_twfe_panel_structure.png", p1,
       width = 8, height = 6, dpi = 300, bg = "white")
cat("\nSaved: r_demeaning_twfe_panel_structure.png\n")


# ── 2. TWFE Estimation with fixest ──────────────────────────────

cat("\n========================================\n")
cat("2. TWFE ESTIMATION WITH FIXEST\n")
cat("========================================\n")

twfe_model <- feols(
  growth ~ ln_y_initial + log_s_k + log_n_gd + log_hcap + gov_cons | id + time,
  data = panel_data
)

cat("\nTWFE model summary:\n")
print(summary(twfe_model))

# Extract coefficients and standard errors
twfe_coefs <- coef(twfe_model)
twfe_se    <- se(twfe_model)

twfe_results <- tibble(
  variable    = names(twfe_coefs),
  label       = VAR_LABELS[names(twfe_coefs)],
  coefficient = twfe_coefs,
  std_error   = twfe_se,
  t_value     = twfe_coefs / twfe_se,
  p_value     = fixest::pvalue(twfe_model)
)

cat("\nTWFE coefficients:\n")
print(as.data.frame(twfe_results), digits = 6)

write_csv(twfe_results, "twfe_results.csv")
cat("Saved: twfe_results.csv\n")


# ── 3. Manual Demeaning Step-by-Step ─────────────────────────────

cat("\n========================================\n")
cat("3. MANUAL DEMEANING STEP-BY-STEP\n")
cat("========================================\n")

# Step 3a: Country means (average over all periods for each country)
cat("\nStep 3a: Computing country means...\n")
country_means <- panel_data |>
  group_by(id) |>
  summarise(across(all_of(VARS_TO_DEMEAN), mean), .groups = "drop")

cat("First 5 country means:\n")
print(head(country_means, 5))

write_csv(country_means, "country_means.csv")

# Step 3b: Time means (average over all countries for each period)
cat("\nStep 3b: Computing time means...\n")
time_means <- panel_data |>
  group_by(time) |>
  summarise(across(all_of(VARS_TO_DEMEAN), mean), .groups = "drop")

cat("All time period means:\n")
print(time_means)

write_csv(time_means, "time_means.csv")

# Step 3c: Grand mean (overall average)
cat("\nStep 3c: Computing grand means...\n")
grand_means <- colMeans(panel_data[VARS_TO_DEMEAN])
cat("Grand means:\n")
print(grand_means)

# Step 3d: Apply the demeaning formula
# x_tilde_it = x_it - x_bar_i - x_bar_t + x_bar_grand
cat("\nStep 3d: Applying the demeaning formula...\n")
cat("Formula: x_tilde_it = x_it - x_bar_i. - x_bar_.t + x_bar_..\n\n")

# Merge country means
panel_dm <- panel_data |>
  left_join(
    country_means |> rename_with(~ paste0(.x, "_cmean"), all_of(VARS_TO_DEMEAN)),
    by = "id"
  ) |>
  left_join(
    time_means |> rename_with(~ paste0(.x, "_tmean"), all_of(VARS_TO_DEMEAN)),
    by = "time"
  )

# Apply demeaning formula programmatically
for (v in VARS_TO_DEMEAN) {
  panel_dm[[paste0(v, "_dm")]] <-
    panel_dm[[v]] -
    panel_dm[[paste0(v, "_cmean")]] -
    panel_dm[[paste0(v, "_tmean")]] +
    grand_means[v]
}

# Verify demeaned means are approximately zero
cat("Mean of demeaned variables (should be ~0):\n")
dm_vars <- paste0(VARS_TO_DEMEAN, "_dm")
for (v in dm_vars) {
  cat(sprintf("  %-20s: %e\n", v, mean(panel_dm[[v]])))
}

# Show a few rows of original vs demeaned
cat("\nOriginal vs demeaned (first 8 rows, country 1):\n")
panel_dm |>
  filter(id == "1") |>
  select(id, time, growth, growth_dm, ln_y_initial, ln_y_initial_dm) |>
  as_tibble() |>
  print(n = 8)

# Export demeaned data
demeaned_export <- panel_dm |>
  select(id, time, all_of(VARS_TO_DEMEAN), all_of(dm_vars))
write_csv(demeaned_export, "data_demeaned.csv")
cat("Saved: data_demeaned.csv\n")


# ── 4. OLS on Demeaned Data ──────────────────────────────────────

cat("\n========================================\n")
cat("4. OLS ON DEMEANED DATA\n")
cat("========================================\n")

manual_model <- lm(
  growth_dm ~ ln_y_initial_dm + log_s_k_dm + log_n_gd_dm + log_hcap_dm + gov_cons_dm,
  data = panel_dm
)

cat("\nOLS on demeaned data summary:\n")
print(summary(manual_model))

# Check intercept
intercept_val <- coef(manual_model)["(Intercept)"]
cat(sprintf("\nIntercept value: %e (should be ~0)\n", intercept_val))
cat(sprintf("Intercept is effectively zero: %s\n", abs(intercept_val) < 1e-10))

# Extract coefficients (drop intercept)
manual_coefs <- coef(manual_model)[-1]
names(manual_coefs) <- names(twfe_coefs)

manual_se_naive <- summary(manual_model)$coefficients[-1, "Std. Error"]
names(manual_se_naive) <- names(twfe_coefs)

ols_results <- tibble(
  variable    = names(manual_coefs),
  label       = VAR_LABELS[names(manual_coefs)],
  coefficient = manual_coefs,
  std_error   = manual_se_naive
)

write_csv(ols_results, "ols_demeaned_results.csv")
cat("Saved: ols_demeaned_results.csv\n")


# ── 5. Coefficient Comparison and Equivalence Proof ──────────────

cat("\n========================================\n")
cat("5. COEFFICIENT COMPARISON\n")
cat("========================================\n")

comparison <- tibble(
  variable      = names(twfe_coefs),
  label         = VAR_LABELS[names(twfe_coefs)],
  feols_TWFE    = twfe_coefs,
  manual_OLS    = manual_coefs,
  difference    = twfe_coefs - manual_coefs
)

cat("\nSide-by-side coefficient comparison:\n")
print(as.data.frame(comparison), digits = 10)

cat(sprintf("\nMaximum absolute difference: %e\n", max(abs(comparison$difference))))
cat("all.equal() test:", all.equal(unname(twfe_coefs), unname(manual_coefs)), "\n")

write_csv(comparison, "coefficient_comparison.csv")
cat("Saved: coefficient_comparison.csv\n")

# Figure 2: Coefficient comparison dot plot
comp_plot_data <- comparison |>
  pivot_longer(
    cols = c(feols_TWFE, manual_OLS),
    names_to = "method",
    values_to = "estimate"
  ) |>
  mutate(
    method = if_else(method == "feols_TWFE", "feols (TWFE)", "Manual Demeaning (OLS)"),
    label  = factor(label, levels = rev(VAR_LABELS[names(twfe_coefs)]))
  )

p2 <- ggplot(comp_plot_data, aes(x = estimate, y = label, color = method, shape = method)) +
  geom_point(size = 4, position = position_dodge(width = 0.4)) +
  scale_color_manual(values = c("feols (TWFE)" = STEEL_BLUE,
                                "Manual Demeaning (OLS)" = WARM_ORANGE)) +
  scale_shape_manual(values = c("feols (TWFE)" = 16,
                                "Manual Demeaning (OLS)" = 17)) +
  geom_vline(xintercept = 0, linetype = "dashed", color = "gray60") +
  labs(
    title = "Coefficient Comparison: TWFE vs Manual Demeaning",
    subtitle = "Coefficients are identical (FWL theorem)",
    x = "Coefficient Estimate",
    y = NULL,
    color = NULL,
    shape = NULL
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title    = element_text(face = "bold", color = NEAR_BLACK),
    plot.subtitle = element_text(color = "gray40"),
    legend.position = "bottom"
  )

ggsave("r_demeaning_twfe_coef_comparison.png", p2,
       width = 9, height = 5.5, dpi = 300, bg = "white")
cat("Saved: r_demeaning_twfe_coef_comparison.png\n")


# ── 6. Visualizing What Demeaning Does ───────────────────────────

cat("\n========================================\n")
cat("6. VISUALIZING WHAT DEMEANING DOES\n")
cat("========================================\n")

# Figure 3: Before vs after demeaning scatter (subset of 10 countries)
subset_ids <- levels(panel_dm$id)[1:10]
subset_data <- panel_dm |>
  filter(id %in% subset_ids)

# Build long-form data for faceted plot (avoids patchwork guide issues)
raw_panel <- subset_data |>
  select(id, time, x = ln_y_initial, y = growth) |>
  mutate(panel = "Raw Data")

dm_panel <- subset_data |>
  select(id, time, x = ln_y_initial_dm, y = growth_dm) |>
  mutate(panel = "After Two-Way Demeaning")

scatter_long <- bind_rows(raw_panel, dm_panel) |>
  mutate(panel = factor(panel, levels = c("Raw Data", "After Two-Way Demeaning")))

p3 <- ggplot(scatter_long, aes(x = x, y = y, color = id)) +
  geom_point(size = 2, alpha = 0.8) +
  facet_wrap(~ panel, scales = "free") +
  scale_color_viridis_d(option = "turbo", guide = "none") +
  labs(
    title = "What Demeaning Does: Raw vs Two-Way Demeaned Data",
    subtitle = "Demeaning strips between-country levels and common time trends, leaving only within-variation",
    x = "Log Initial Income (raw / demeaned)",
    y = "GDP Growth (raw / demeaned)"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title    = element_text(face = "bold", color = NEAR_BLACK, size = 14),
    plot.subtitle = element_text(color = "gray40", size = 11),
    strip.text    = element_text(face = "bold", size = 12)
  )

ggsave("r_demeaning_twfe_scatter_before_after.png", p3,
       width = 12, height = 5.5, dpi = 300, bg = "white")
cat("Saved: r_demeaning_twfe_scatter_before_after.png\n")

# Figure 4: Demeaning decomposition for one country
country_id <- "1"
country_sub <- panel_dm |> filter(id == country_id)

# Get the means for this country
c_mean <- country_means |> filter(id == country_id) |> pull(growth)
t_means_vec <- time_means$growth
g_mean <- grand_means["growth"]

decomp_data <- tibble(
  period       = as.numeric(as.character(country_sub$time)),
  observed     = country_sub$growth,
  country_mean = c_mean,
  time_mean    = t_means_vec,
  grand_mean   = g_mean,
  demeaned     = country_sub$growth_dm
)

p4 <- ggplot(decomp_data, aes(x = period)) +
  geom_line(aes(y = observed, color = "Observed (x_it)"),
            linewidth = 1.2) +
  geom_point(aes(y = observed, color = "Observed (x_it)"), size = 3) +
  geom_hline(aes(yintercept = country_mean, color = "Country mean (x_i.)"),
             linetype = "dashed", linewidth = 0.9) +
  geom_line(aes(y = time_mean, color = "Time mean (x_.t)"),
            linetype = "dotdash", linewidth = 0.9) +
  geom_point(aes(y = time_mean, color = "Time mean (x_.t)"), size = 2) +
  geom_hline(aes(yintercept = grand_mean, color = "Grand mean (x_..)"),
             linetype = "dotted", linewidth = 0.9) +
  geom_line(aes(y = demeaned, color = "Demeaned (x_tilde_it)"),
            linewidth = 1.2) +
  geom_point(aes(y = demeaned, color = "Demeaned (x_tilde_it)"), size = 3) +
  scale_color_manual(
    values = c(
      "Observed (x_it)"          = STEEL_BLUE,
      "Country mean (x_i.)"      = WARM_ORANGE,
      "Time mean (x_.t)"         = TEAL,
      "Grand mean (x_..)"        = "gray50",
      "Demeaned (x_tilde_it)"    = NEAR_BLACK
    )
  ) +
  scale_x_continuous(breaks = 1:8) +
  labs(
    title = paste("Demeaning Decomposition: Country", country_id, "(Growth)"),
    subtitle = expression(tilde(x)[it] == x[it] - bar(x)[i.] - bar(x)[.t] + bar(x)[..]),
    x = "Time Period",
    y = "Growth Rate",
    color = NULL
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title    = element_text(face = "bold", color = NEAR_BLACK),
    plot.subtitle = element_text(color = "gray40", size = 12),
    legend.position = "bottom"
  ) +
  guides(color = guide_legend(nrow = 2))

ggsave("r_demeaning_twfe_decomposition.png", p4,
       width = 9, height = 6, dpi = 300, bg = "white")
cat("Saved: r_demeaning_twfe_decomposition.png\n")


# ── 7. Standard Error Comparison ─────────────────────────────────

cat("\n========================================\n")
cat("7. STANDARD ERROR COMPARISON\n")
cat("========================================\n")

# Three types of SEs:
# 1. Naive lm() SEs (incorrect -- ignores absorbed df)
# 2. feols() IID SEs (correct df, no clustering)
# 3. feols() clustered SEs (correct df + within-entity correlation)

se_naive     <- manual_se_naive
se_feols_iid <- se(twfe_model, se = "iid")
se_feols_cl  <- se(twfe_model)  # default is clustered by first FE

se_comparison <- tibble(
  variable         = names(twfe_coefs),
  label            = VAR_LABELS[names(twfe_coefs)],
  se_naive_lm      = se_naive,
  se_feols_iid     = se_feols_iid,
  se_feols_cluster = se_feols_cl
)

cat("\nStandard error comparison:\n")
print(as.data.frame(se_comparison), digits = 6)

# Explain the differences
cat("\nWhy SEs differ:\n")
cat("- Naive lm() uses df = N*T - K =", nrow(panel_data) - length(manual_coefs), "\n")
cat("- Correct df = N*T - N - T + 1 - K =",
    nrow(panel_data) - n_countries - n_periods + 1 - length(twfe_coefs), "\n")
cat("- feols() clustered SEs also account for within-entity correlation\n")

write_csv(se_comparison, "se_comparison.csv")
cat("Saved: se_comparison.csv\n")

# Figure 5: SE comparison grouped bar chart
se_plot_data <- se_comparison |>
  pivot_longer(
    cols = starts_with("se_"),
    names_to = "se_type",
    values_to = "se_value"
  ) |>
  mutate(
    se_type = case_match(
      se_type,
      "se_naive_lm"      ~ "Naive lm()",
      "se_feols_iid"     ~ "feols (IID)",
      "se_feols_cluster"  ~ "feols (Clustered)"
    ),
    se_type = factor(se_type, levels = c("Naive lm()", "feols (IID)", "feols (Clustered)")),
    label   = factor(label, levels = VAR_LABELS[names(twfe_coefs)])
  )

p5 <- ggplot(se_plot_data, aes(x = label, y = se_value, fill = se_type)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  scale_fill_manual(values = c(
    "Naive lm()"        = "gray70",
    "feols (IID)"       = WARM_ORANGE,
    "feols (Clustered)" = STEEL_BLUE
  )) +
  labs(
    title = "Standard Error Comparison: Why Naive SEs Are Wrong",
    subtitle = "Naive lm() ignores absorbed degrees of freedom; clustering accounts for within-entity correlation",
    x = NULL,
    y = "Standard Error",
    fill = NULL
  ) +
  theme_minimal(base_size = 13) +
  theme(
    plot.title    = element_text(face = "bold", color = NEAR_BLACK),
    plot.subtitle = element_text(color = "gray40", size = 10),
    axis.text.x   = element_text(angle = 25, hjust = 1),
    legend.position = "bottom"
  )

ggsave("r_demeaning_twfe_se_comparison.png", p5,
       width = 9, height = 6, dpi = 300, bg = "white")
cat("Saved: r_demeaning_twfe_se_comparison.png\n")


# ── 8. Summary ───────────────────────────────────────────────────

cat("\n========================================\n")
cat("8. SUMMARY\n")
cat("========================================\n")

cat("\nGenerated PNG files:\n")
print(list.files(pattern = "\\.png$"))

cat("\nGenerated CSV files:\n")
print(list.files(pattern = "\\.csv$"))

cat("\n=== Script completed successfully ===\n")
