# ============================================================
# Three Methods for Robust Variable Selection: BMA, LASSO, WALS
# Standalone R script for carlos-mendez.org
# ============================================================
#
# This script generates all figures for the blog post.
# Run: Rscript script.R
# Output: 15 PNG files in the current directory
# ============================================================

# --- 0. Packages ---
required_packages <- c(
  "tidyverse",   # data manipulation and ggplot2 visualization
  "BMS",         # Bayesian Model Averaging via the bms() function
  "glmnet",      # LASSO and Ridge regression via coordinate descent
  "WALS",        # Weighted Average Least Squares estimation
  "scales",      # nice axis formatting in plots
  "patchwork",   # combine multiple ggplot panels
  "ggrepel",     # non-overlapping text labels on plots
  "corrplot",    # correlation matrix heatmaps
  "broom"        # tidy model summaries
)

missing <- required_packages[!sapply(required_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(tidyverse)
library(BMS)
library(glmnet)
library(WALS)
library(scales)
library(patchwork)
library(ggrepel)
library(corrplot)
library(broom)

# --- Site color palette ---
STEEL_BLUE  <- "#6a9bcc"
WARM_ORANGE <- "#d97757"
NEAR_BLACK  <- "#141413"
TEAL        <- "#00d4c8"
HEADING_BLUE <- "#1a3a8a"

# --- Dark navy background palette ---
DARK_BG     <- "#0f1729"
DARK_PANEL  <- "#1f2b5e"
LIGHT_TEXT  <- "#c8d0e0"
LIGHTER_TEXT <- "#e8ecf2"

# --- Custom ggplot theme (dark background) ---
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

set.seed(2021)

# --- 1. Load data ---
DATA_URL <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_bma_lasso_wals/synthetic-co2-cross-section.csv"
# Fall back to local file if the remote URL is not yet available
synth_data <- tryCatch(
  read.csv(DATA_URL),
  error = function(e) read.csv("synthetic-co2-cross-section.csv")
)
cat("Data loaded:", nrow(synth_data), "rows,", ncol(synth_data), "columns\n")

# Known true coefficients
true_beta_lookup <- c(
  log_gdp = 1.200, industry = 0.008, fossil_fuel = 0.012,
  urban_pop = 0.010, democracy = 0.004, trade_network = 0.500,
  agriculture = 0.005, log_trade = 0, fdi = 0, corruption = 0,
  log_tourism = 0, log_credit = 0
)

# ============================================================
# FIGURE 01: Correlation matrix heatmap
# ============================================================
cat("Generating Figure 01: Correlation matrix...\n")

cor_matrix <- synth_data |>
  select(-country, -log_co2) |>
  cor()

colnames(cor_matrix) <- c("GDP", "Industry", "Fossil fuel", "Urban pop",
                           "Democracy", "Trade net.", "Agriculture",
                           "Trade open.", "FDI", "Corruption", "Tourism", "Credit")
rownames(cor_matrix) <- colnames(cor_matrix)

png("bma_lasso_wals_01_correlation.png", width = 2400, height = 2100, res = 300)
par(bg = DARK_BG)
corrplot(cor_matrix,
         method = "color",
         type = "lower",
         addCoef.col = LIGHTER_TEXT,
         number.cex = 0.7,
         tl.col = LIGHT_TEXT,
         tl.cex = 0.8,
         col = colorRampPalette(c(WARM_ORANGE, DARK_PANEL, STEEL_BLUE))(200),
         diag = FALSE,
         title = "",
         mar = c(0, 0, 0, 0),
         cl.pos = "b",
         cl.cex = 0.7,
         cl.length = 7)
dev.off()

# ============================================================
# FIGURE 02: Bias-variance tradeoff
# ============================================================
cat("Generating Figure 02: Bias-variance tradeoff...\n")

complexity <- seq(0.1, 5, length.out = 200)
bias_sq  <- 2 * exp(-1.2 * complexity)
variance <- 0.15 * complexity^1.8
total    <- bias_sq + variance + 0.3
n_pts <- length(complexity)

bv_data <- tibble(
  complexity = rep(complexity, 3),
  value = c(bias_sq, variance, total),
  component = rep(c("Bias\u00b2", "Variance", "Total MSE"), each = n_pts)
)

opt_idx <- which.min(total)
opt_x   <- complexity[opt_idx]
opt_y   <- total[opt_idx]

p_bv <- ggplot(bv_data, aes(x = complexity, y = value, color = component, linetype = component)) +
  geom_line(linewidth = 1) +
  geom_vline(xintercept = opt_x, linetype = "dashed", color = LIGHT_TEXT) +
  annotate("text", x = opt_x + 0.15, y = max(total) * 0.85,
           label = "Optimal\ncomplexity", hjust = 0, size = 3.5, color = LIGHT_TEXT) +
  scale_color_manual(values = c("Bias\u00b2" = WARM_ORANGE, "Variance" = STEEL_BLUE,
                                 "Total MSE" = LIGHTER_TEXT)) +
  scale_linetype_manual(values = c("Bias\u00b2" = "solid", "Variance" = "solid",
                                    "Total MSE" = "solid")) +
  labs(x = "Model Complexity (more variables, less penalty)",
       y = "Error", color = NULL, linetype = NULL,
       title = "The Bias-Variance Tradeoff") +
  theme_site()

ggsave("bma_lasso_wals_02_bias_variance.png", p_bv, width = 10, height = 6, dpi = 300)

# ============================================================
# FIGURE 03: L1 diamond + L2 circle (side by side)
# ============================================================
cat("Generating Figure 03: L1/L2 geometry...\n")

t_val <- 1.0
theta <- seq(0, 2 * pi, length.out = 400)

# OLS solution (illustrative)
ols_b1 <- 0.3
ols_b2 <- 1.1

# Elliptical contours
contour_data <- map_dfr(c(0.3, 0.6, 0.9, 1.2), function(r) {
  tibble(
    b1 = ols_b1 + r * 0.8 * cos(theta),
    b2 = ols_b2 + r * 0.5 * sin(theta),
    level = r
  )
})

# L1 diamond
diamond_clean <- tibble(
  b1 = c(t_val, 0, -t_val, 0, t_val),
  b2 = c(0, t_val, 0, -t_val, 0)
)

p_l1 <- ggplot() +
  geom_path(data = contour_data, aes(x = b1, y = b2, group = level),
            color = LIGHT_TEXT, linetype = "dashed", alpha = 0.5) +
  geom_polygon(data = diamond_clean, aes(x = b1, y = b2),
               fill = STEEL_BLUE, alpha = 0.25, color = STEEL_BLUE, linewidth = 1) +
  geom_point(aes(x = ols_b1, y = ols_b2), size = 3, color = LIGHT_TEXT) +
  annotate("text", x = ols_b1 + 0.12, y = ols_b2 + 0.08,
           label = "OLS", size = 4, color = LIGHT_TEXT) +
  geom_point(aes(x = 0, y = t_val), size = 4, color = WARM_ORANGE) +
  annotate("text", x = 0.18, y = t_val + 0.08,
           label = expression(paste("LASSO (", beta[1], " = 0)")),
           size = 3.5, color = WARM_ORANGE) +
  geom_hline(yintercept = 0, color = DARK_PANEL) +
  geom_vline(xintercept = 0, color = DARK_PANEL) +
  coord_equal(xlim = c(-1.5, 1.8), ylim = c(-1.5, 1.8)) +
  labs(x = expression(beta[1]), y = expression(beta[2]),
       title = "L1 (LASSO): Diamond",
       subtitle = "Contours hit a corner \u2192 exact zeros") +
  theme_site()

# L2 circle
circle <- tibble(
  b1 = t_val * cos(theta),
  b2 = t_val * sin(theta)
)

ols_norm   <- sqrt(ols_b1^2 + ols_b2^2)
ridge_b1   <- ols_b1 * t_val / ols_norm
ridge_b2   <- ols_b2 * t_val / ols_norm

p_l2 <- ggplot() +
  geom_path(data = contour_data, aes(x = b1, y = b2, group = level),
            color = LIGHT_TEXT, linetype = "dashed", alpha = 0.5) +
  geom_polygon(data = circle, aes(x = b1, y = b2),
               fill = TEAL, alpha = 0.25, color = TEAL, linewidth = 1) +
  geom_point(aes(x = ols_b1, y = ols_b2), size = 3, color = LIGHT_TEXT) +
  annotate("text", x = ols_b1 + 0.12, y = ols_b2 + 0.08,
           label = "OLS", size = 4, color = LIGHT_TEXT) +
  geom_point(aes(x = ridge_b1, y = ridge_b2), size = 4, color = WARM_ORANGE) +
  annotate("text", x = ridge_b1 + 0.18, y = ridge_b2 + 0.08,
           label = "Ridge\n(no zeros)", size = 3.5, color = WARM_ORANGE) +
  geom_hline(yintercept = 0, color = DARK_PANEL) +
  geom_vline(xintercept = 0, color = DARK_PANEL) +
  coord_equal(xlim = c(-1.5, 1.8), ylim = c(-1.5, 1.8)) +
  labs(x = expression(beta[1]), y = expression(beta[2]),
       title = "L2 (Ridge): Circle",
       subtitle = "Contours hit smooth boundary \u2192 no zeros") +
  theme_site()

p_geometry <- p_l1 + p_l2 +
  plot_annotation(title = "Why LASSO Selects Variables and Ridge Does Not",
                  theme = theme(plot.title = element_text(color = LIGHTER_TEXT, face = "bold", size = 16),
                                plot.background = element_rect(fill = DARK_BG, color = NA)))

ggsave("bma_lasso_wals_03_l1_l2_geometry.png", p_geometry, width = 12, height = 6, dpi = 300)

# ============================================================
# BMA: Run the model
# ============================================================
cat("Running BMA (this may take a moment)...\n")

set.seed(2021)
bma_data <- synth_data |>
  select(log_co2, log_gdp, industry, fossil_fuel, urban_pop,
         democracy, trade_network, agriculture,
         log_trade, fdi, corruption, log_tourism, log_credit) |>
  as.data.frame()

bma_fit <- bms(
  X.data   = bma_data,
  burn     = 50000,
  iter     = 200000,
  g        = "BRIC",
  mprior   = "uniform",
  nmodel   = 2000,
  mcmc     = "bd",
  user.int = FALSE
)

# Extract BMA results
bma_coefs <- coef(bma_fit)
bma_df <- as.data.frame(bma_coefs) |>
  rownames_to_column("variable") |>
  as_tibble() |>
  rename(pip = PIP, post_mean = `Post Mean`, post_sd = `Post SD`) |>
  select(variable, pip, post_mean, post_sd) |>
  mutate(
    true_beta = true_beta_lookup[variable],
    robustness = case_when(
      pip >= 0.80 ~ "Robust (PIP >= 0.80)",
      pip >= 0.50 ~ "Borderline",
      TRUE        ~ "Fragile (PIP < 0.50)"
    ),
    ci_low  = post_mean - 2 * post_sd,
    ci_high = post_mean + 2 * post_sd
  )

# ============================================================
# FIGURE 04: BMA PIP bar chart
# ============================================================
cat("Generating Figure 04: BMA PIP bar chart...\n")

p_pip <- ggplot(bma_df, aes(x = reorder(variable, pip), y = pip, fill = robustness)) +
  geom_col(width = 0.65) +
  geom_hline(yintercept = 0.80, linetype = "dashed", color = LIGHT_TEXT, linewidth = 0.5) +
  geom_hline(yintercept = 0.50, linetype = "dotted", color = LIGHT_TEXT, linewidth = 0.5, alpha = 0.6) +
  annotate("text", x = 0.7, y = 0.82, label = "Robust (0.80)", hjust = 0, size = 3, color = LIGHT_TEXT) +
  annotate("text", x = 0.7, y = 0.52, label = "Borderline (0.50)", hjust = 0, size = 3, color = LIGHT_TEXT) +
  coord_flip() +
  scale_fill_manual(values = c("Robust (PIP >= 0.80)" = STEEL_BLUE,
                                "Borderline" = TEAL,
                                "Fragile (PIP < 0.50)" = WARM_ORANGE)) +
  scale_y_continuous(limits = c(0, 1), labels = label_number(accuracy = 0.01)) +
  labs(x = NULL, y = "Posterior Inclusion Probability (PIP)",
       fill = "Classification",
       title = "BMA: Posterior Inclusion Probabilities",
       subtitle = "Based on 200,000 MCMC draws after 50,000 burn-in") +
  theme_site()

ggsave("bma_lasso_wals_04_bma_pip.png", p_pip, width = 10, height = 6, dpi = 300)

# ============================================================
# FIGURE 05: BMA posterior coefficient plot
# ============================================================
cat("Generating Figure 05: BMA posterior coefficients...\n")

p_coefs <- ggplot(bma_df, aes(x = reorder(variable, pip), y = post_mean, color = robustness)) +
  geom_pointrange(aes(ymin = ci_low, ymax = ci_high), size = 0.5) +
  geom_hline(yintercept = 0, linetype = "solid", color = LIGHT_TEXT, alpha = 0.4) +
  coord_flip() +
  scale_color_manual(values = c("Robust (PIP >= 0.80)" = STEEL_BLUE,
                                 "Borderline" = TEAL,
                                 "Fragile (PIP < 0.50)" = WARM_ORANGE)) +
  labs(x = NULL, y = "Posterior Mean Coefficient",
       color = "Classification",
       title = "BMA: Posterior Coefficient Estimates",
       subtitle = "Error bars show approximate 95% credible intervals") +
  theme_site()

ggsave("bma_lasso_wals_05_bma_coefs.png", p_coefs, width = 10, height = 6, dpi = 300)

# ============================================================
# FIGURE 06: BMA model inclusion matrix
# ============================================================
cat("Generating Figure 06: BMA model inclusion matrix...\n")

top_models <- topmodels.bma(bma_fit)[, 1:min(50, ncol(topmodels.bma(bma_fit)))]

inclusion_df <- as.data.frame(top_models != 0) |>
  rownames_to_column("variable") |>
  pivot_longer(-variable, names_to = "model", values_to = "included") |>
  mutate(
    model_num = as.integer(gsub(".*\\.", "", model)),
    included  = as.numeric(included)
  )

var_order <- bma_df |> arrange(pip) |> pull(variable)
inclusion_df$variable <- factor(inclusion_df$variable, levels = var_order)

p_incl <- ggplot(inclusion_df, aes(x = factor(model_num), y = variable, fill = factor(included))) +
  geom_tile(color = DARK_BG, linewidth = 0.2) +
  scale_fill_manual(values = c("0" = DARK_PANEL, "1" = STEEL_BLUE),
                    labels = c("Excluded", "Included")) +
  labs(x = "Model rank (left = highest posterior probability)",
       y = NULL, fill = NULL,
       title = "Model Inclusion Matrix (Top 50 Models)") +
  theme_site(base_size = 12) +
  theme(axis.text.x = element_blank(),
        axis.ticks.x = element_blank(),
        panel.grid = element_blank())

ggsave("bma_lasso_wals_06_bma_inclusion.png", p_incl, width = 12, height = 6, dpi = 300)

# ============================================================
# LASSO: Run the model
# ============================================================
cat("Running LASSO with cross-validation...\n")

set.seed(2021)
X <- synth_data |>
  select(log_gdp, industry, fossil_fuel, urban_pop, democracy,
         trade_network, agriculture, log_trade, fdi, corruption,
         log_tourism, log_credit) |>
  as.matrix()

y <- synth_data$log_co2

lasso_cv <- cv.glmnet(x = X, y = y, alpha = 1, nfolds = 10, standardize = TRUE)
lasso_full <- glmnet(X, y, alpha = 1, standardize = TRUE)

# ============================================================
# FIGURE 07: LASSO regularization path
# ============================================================
cat("Generating Figure 07: LASSO regularization path...\n")

coef_path <- as.matrix(coef(lasso_full))[-1, ]
lambda_vals <- lasso_full$lambda

path_df <- as_tibble(t(coef_path)) |>
  mutate(log_lambda = log(lambda_vals)) |>
  pivot_longer(-log_lambda, names_to = "variable", values_to = "coefficient")

var_colors <- c(
  log_gdp = STEEL_BLUE, industry = STEEL_BLUE, fossil_fuel = STEEL_BLUE,
  urban_pop = STEEL_BLUE, democracy = STEEL_BLUE, trade_network = STEEL_BLUE,
  agriculture = STEEL_BLUE,
  log_trade = WARM_ORANGE, fdi = WARM_ORANGE, corruption = WARM_ORANGE,
  log_tourism = WARM_ORANGE, log_credit = WARM_ORANGE
)

p_path <- ggplot(path_df, aes(x = log_lambda, y = coefficient, color = variable)) +
  geom_line(linewidth = 0.7) +
  geom_vline(xintercept = log(lasso_cv$lambda.min),
             linetype = "dashed", color = LIGHT_TEXT) +
  geom_vline(xintercept = log(lasso_cv$lambda.1se),
             linetype = "dotted", color = LIGHT_TEXT) +
  annotate("text", x = log(lasso_cv$lambda.min), y = max(coef_path) * 0.95,
           label = "lambda.min", hjust = 1.1, size = 3, color = LIGHT_TEXT) +
  annotate("text", x = log(lasso_cv$lambda.1se), y = max(coef_path) * 0.85,
           label = "lambda.1se", hjust = 1.1, size = 3, color = LIGHT_TEXT) +
  scale_color_manual(values = var_colors) +
  labs(x = expression(log(lambda)),
       y = "Coefficient value",
       color = "Variable",
       title = "LASSO Regularization Path",
       subtitle = "Steel blue = true predictors, Orange = noise variables") +
  theme_site() +
  theme(legend.position = "right",
        legend.text = element_text(size = 9))

ggsave("bma_lasso_wals_07_lasso_path.png", p_path, width = 12, height = 6, dpi = 300)

# ============================================================
# FIGURE 08: LASSO cross-validation curve
# ============================================================
cat("Generating Figure 08: LASSO CV curve...\n")

cv_df <- tibble(
  log_lambda = log(lasso_cv$lambda),
  mse        = lasso_cv$cvm,
  mse_lo     = lasso_cv$cvlo,
  mse_hi     = lasso_cv$cvup,
  nzero      = lasso_cv$nzero
)

p_cv <- ggplot(cv_df, aes(x = log_lambda, y = mse)) +
  geom_ribbon(aes(ymin = mse_lo, ymax = mse_hi), fill = DARK_PANEL, alpha = 0.7) +
  geom_line(color = STEEL_BLUE, linewidth = 0.8) +
  geom_point(color = STEEL_BLUE, size = 1) +
  geom_vline(xintercept = log(lasso_cv$lambda.min),
             linetype = "dashed", color = WARM_ORANGE) +
  geom_vline(xintercept = log(lasso_cv$lambda.1se),
             linetype = "dotted", color = WARM_ORANGE) +
  annotate("text", x = log(lasso_cv$lambda.min), y = max(cv_df$mse) * 0.95,
           label = paste0("lambda.min\n(", sum(coef(lasso_cv, s = "lambda.min") != 0) - 1, " vars)"),
           hjust = 1.1, size = 3.5, color = WARM_ORANGE) +
  annotate("text", x = log(lasso_cv$lambda.1se), y = max(cv_df$mse) * 0.85,
           label = paste0("lambda.1se\n(", sum(coef(lasso_cv, s = "lambda.1se") != 0) - 1, " vars)"),
           hjust = 1.1, size = 3.5, color = WARM_ORANGE) +
  labs(x = expression(log(lambda)),
       y = "Mean Squared Error (CV)",
       title = "LASSO Cross-Validation Curve",
       subtitle = "Shaded band shows +/- 1 standard error") +
  theme_site()

ggsave("bma_lasso_wals_08_lasso_cv.png", p_cv, width = 10, height = 6, dpi = 300)

# ============================================================
# FIGURE 09: LASSO selected variables
# ============================================================
cat("Generating Figure 09: LASSO selected variables...\n")

lasso_coefs_1se <- coef(lasso_cv, s = "lambda.1se")
lasso_df <- tibble(
  variable = rownames(lasso_coefs_1se)[-1],
  lasso_coef = as.numeric(lasso_coefs_1se)[-1]
) |>
  mutate(
    selected   = lasso_coef != 0,
    true_beta  = true_beta_lookup[variable],
    is_noise   = true_beta == 0,
    bar_color  = case_when(
      !selected ~ "Not selected",
      is_noise  ~ "Noise (false positive)",
      TRUE      ~ "True predictor (correct)"
    )
  )

p_selected <- ggplot(lasso_df, aes(x = reorder(variable, abs(lasso_coef)), y = lasso_coef, fill = bar_color)) +
  geom_col(width = 0.6) +
  coord_flip() +
  scale_fill_manual(values = c("True predictor (correct)" = STEEL_BLUE,
                                "Noise (false positive)" = WARM_ORANGE,
                                "Not selected" = DARK_PANEL)) +
  labs(x = NULL, y = "LASSO Coefficient (at lambda.1se)",
       fill = NULL,
       title = "LASSO Variable Selection",
       subtitle = paste0("lambda.1se selects ", sum(lasso_df$selected), " of 12 variables")) +
  theme_site()

ggsave("bma_lasso_wals_09_lasso_selected.png", p_selected, width = 10, height = 6, dpi = 300)

# ============================================================
# Post-LASSO
# ============================================================
selected_vars <- lasso_df |> filter(selected) |> pull(variable)
post_lasso_formula <- as.formula(paste("log_co2 ~", paste(selected_vars, collapse = " + ")))
post_lasso_fit <- lm(post_lasso_formula, data = synth_data)

post_lasso_summary <- broom::tidy(post_lasso_fit) |>
  filter(term != "(Intercept)") |>
  rename(variable = term, post_lasso_coef = estimate) |>
  select(variable, post_lasso_coef) |>
  left_join(lasso_df |> select(variable, lasso_coef, true_beta), by = "variable")

# ============================================================
# WALS: Run the model
# ============================================================
cat("Running WALS...\n")

X1_wals <- matrix(1, nrow = nrow(synth_data), ncol = 1)
colnames(X1_wals) <- "(Intercept)"

X2_wals <- synth_data |>
  select(log_gdp, industry, fossil_fuel, urban_pop, democracy,
         trade_network, agriculture, log_trade, fdi, corruption,
         log_tourism, log_credit) |>
  as.matrix()

y_wals <- synth_data$log_co2

wals_fit <- wals(x = X1_wals, x2 = X2_wals, y = y_wals, prior = laplace())
wals_summary <- summary(wals_fit)

aux_coefs <- wals_summary$auxCoefs

wals_df <- tibble(
  variable = rownames(aux_coefs),
  estimate = aux_coefs[, "Estimate"],
  se       = aux_coefs[, "Std. Error"],
  t_stat   = estimate / se
) |>
  mutate(
    true_beta    = true_beta_lookup[variable],
    abs_t        = abs(t_stat),
    wals_robust  = abs_t >= 2,
    true_nonzero = true_beta != 0,
    bar_color = case_when(
      wals_robust & true_nonzero  ~ "True positive",
      wals_robust & !true_nonzero ~ "False positive",
      !wals_robust & true_nonzero ~ "False negative",
      TRUE                        ~ "True negative"
    )
  )

# ============================================================
# FIGURE 10: WALS t-statistic bar chart
# ============================================================
cat("Generating Figure 10: WALS t-statistics...\n")

p_wals <- ggplot(wals_df, aes(x = reorder(variable, abs_t), y = t_stat, fill = bar_color)) +
  geom_col(width = 0.6) +
  geom_hline(yintercept = c(-2, 2), linetype = "dashed", color = LIGHT_TEXT) +
  annotate("text", x = 0.5, y = 2.3, label = "|t| = 2", hjust = 0, size = 3, color = LIGHT_TEXT) +
  coord_flip() +
  scale_fill_manual(values = c("True positive"  = STEEL_BLUE,
                                "False positive" = WARM_ORANGE,
                                "True negative"  = DARK_PANEL,
                                "False negative" = TEAL)) +
  labs(x = NULL, y = "t-statistic",
       fill = "Classification",
       title = "WALS: t-Statistics for All 12 Variables",
       subtitle = "|t| >= 2 threshold for robustness") +
  theme_site()

ggsave("bma_lasso_wals_10_wals_tstat.png", p_wals, width = 10, height = 6, dpi = 300)

# ============================================================
# FIGURE 11: Prior comparison (Laplace, Normal, Uniform)
# ============================================================
cat("Generating Figure 11: Prior comparison...\n")

x_grid <- seq(-5, 5, length.out = 500)

prior_df <- tibble(
  x = rep(x_grid, 3),
  density = c(
    0.5 * exp(-abs(x_grid)),
    dnorm(x_grid, mean = 0, sd = 1.5),
    dunif(x_grid, min = -4, max = 4)
  ),
  prior = rep(c("Laplace (WALS)", "Normal (BMA g-prior)", "Uniform"),
              each = length(x_grid))
)

p_priors <- ggplot(prior_df, aes(x = x, y = density, color = prior, linetype = prior)) +
  geom_line(linewidth = 1) +
  scale_color_manual(values = c("Laplace (WALS)" = STEEL_BLUE,
                                 "Normal (BMA g-prior)" = WARM_ORANGE,
                                 "Uniform" = TEAL)) +
  scale_linetype_manual(values = c("Laplace (WALS)" = "solid",
                                    "Normal (BMA g-prior)" = "dashed",
                                    "Uniform" = "dotted")) +
  labs(x = expression(gamma), y = "Density",
       color = "Prior", linetype = "Prior",
       title = "Prior Distributions for Model Averaging",
       subtitle = "Laplace: peaked at zero with heavy tails (skeptical but open-minded)") +
  theme_site()

ggsave("bma_lasso_wals_11_priors.png", p_priors, width = 10, height = 6, dpi = 300)

# ============================================================
# Grand comparison: merge all results
# ============================================================
bma_compare <- bma_df |>
  select(variable, pip, post_mean, robustness) |>
  rename(bma_pip = pip, bma_postmean = post_mean, bma_class = robustness)

lasso_compare <- lasso_df |>
  select(variable, lasso_coef, selected) |>
  rename(lasso_selected = selected)

wals_compare <- wals_df |>
  select(variable, estimate, t_stat, wals_robust) |>
  rename(wals_estimate = estimate, wals_t = t_stat)

grand_table <- bma_compare |>
  left_join(lasso_compare, by = "variable") |>
  left_join(wals_compare, by = "variable") |>
  mutate(
    true_beta    = true_beta_lookup[variable],
    bma_robust   = bma_pip >= 0.80,
    n_methods    = bma_robust + lasso_selected + wals_robust,
    all_agree    = n_methods == 3 | n_methods == 0,
    triple_robust = n_methods == 3,
    true_nonzero = true_beta != 0
  ) |>
  arrange(desc(n_methods), desc(bma_pip))

# ============================================================
# FIGURE 12: Method agreement heatmap
# ============================================================
cat("Generating Figure 12: Method agreement heatmap...\n")

heatmap_df <- grand_table |>
  select(variable, true_beta, bma_robust, lasso_selected, wals_robust) |>
  pivot_longer(c(bma_robust, lasso_selected, wals_robust),
               names_to = "method", values_to = "identified") |>
  mutate(
    method = recode(method,
                    bma_robust = "BMA",
                    lasso_selected = "LASSO",
                    wals_robust = "WALS"),
    method = factor(method, levels = c("BMA", "LASSO", "WALS")),
    is_noise = true_beta == 0,
    var_order = case_when(
      variable == "log_gdp"       ~ 1,
      variable == "trade_network" ~ 2,
      variable == "fossil_fuel"   ~ 3,
      variable == "urban_pop"     ~ 4,
      variable == "industry"      ~ 5,
      variable == "agriculture"   ~ 6,
      variable == "democracy"     ~ 7,
      variable == "log_trade"     ~ 8,
      variable == "fdi"           ~ 9,
      variable == "corruption"    ~ 10,
      variable == "log_tourism"   ~ 11,
      variable == "log_credit"    ~ 12,
      TRUE                        ~ 13
    )
  )

p_heat <- ggplot(heatmap_df, aes(x = method, y = reorder(variable, -var_order), fill = identified)) +
  geom_tile(color = DARK_BG, linewidth = 1) +
  geom_text(aes(label = ifelse(identified, "Yes", "No")), size = 3.5, color = LIGHTER_TEXT) +
  scale_fill_manual(values = c("TRUE" = STEEL_BLUE, "FALSE" = WARM_ORANGE),
                    labels = c("Not identified", "Identified")) +
  geom_hline(yintercept = 5.5, color = LIGHTER_TEXT, linewidth = 1) +
  annotate("text", x = 3.6, y = 9, label = "True\npredictors",
           size = 3, hjust = 0, fontface = "italic", color = LIGHT_TEXT) +
  annotate("text", x = 3.6, y = 3, label = "Noise\nvariables",
           size = 3, hjust = 0, fontface = "italic", color = LIGHT_TEXT) +
  labs(x = NULL, y = NULL, fill = NULL,
       title = "Variable Identification Across Three Methods") +
  theme_site() +
  theme(panel.grid = element_blank()) +
  coord_cartesian(clip = "off")

ggsave("bma_lasso_wals_12_heatmap.png", p_heat, width = 10, height = 7, dpi = 300)

# ============================================================
# FIGURE 13: BMA PIP vs WALS |t-statistic| scatter
# ============================================================
cat("Generating Figure 13: BMA PIP vs WALS scatter...\n")

grand_table_plot <- grand_table |>
  mutate(
    lasso_shape = ifelse(lasso_selected, "LASSO: Selected", "LASSO: Not selected"),
    true_status = ifelse(true_nonzero, "True predictor", "Noise")
  )

p_scatter <- ggplot(grand_table_plot, aes(x = abs(wals_t), y = bma_pip)) +
  annotate("rect", xmin = 2, xmax = Inf, ymin = 0.80, ymax = 1,
           fill = STEEL_BLUE, alpha = 0.15) +
  annotate("text", x = 5, y = 0.90, label = "Robust by\nboth methods",
           size = 3, color = LIGHT_TEXT) +
  geom_hline(yintercept = 0.80, linetype = "dashed", color = LIGHT_TEXT, alpha = 0.5) +
  geom_vline(xintercept = 2, linetype = "dashed", color = LIGHT_TEXT, alpha = 0.5) +
  geom_point(aes(color = true_status, shape = lasso_shape), size = 4) +
  geom_text_repel(aes(label = variable), size = 3, max.overlaps = 20, color = LIGHTER_TEXT) +
  scale_color_manual(values = c("True predictor" = STEEL_BLUE, "Noise" = WARM_ORANGE)) +
  scale_shape_manual(values = c("LASSO: Selected" = 17, "LASSO: Not selected" = 4)) +
  labs(x = "WALS |t-statistic|",
       y = "BMA Posterior Inclusion Probability",
       color = "True status", shape = "LASSO result",
       title = "BMA PIP vs. WALS |t-statistic|",
       subtitle = "Upper-right = robust by both; triangles = LASSO-selected") +
  theme_site()

ggsave("bma_lasso_wals_13_pip_vs_t.png", p_scatter, width = 10, height = 7, dpi = 300)

# ============================================================
# FIGURE 14: Coefficient comparison (3-panel facet)
# ============================================================
cat("Generating Figure 14: Coefficient comparison...\n")

post_lasso_all <- tibble(
  variable = names(true_beta_lookup),
  post_lasso = 0
)
if (nrow(post_lasso_summary) > 0) {
  post_lasso_all <- post_lasso_all |>
    left_join(post_lasso_summary |> select(variable, post_lasso_coef), by = "variable") |>
    mutate(post_lasso = coalesce(post_lasso_coef, 0)) |>
    select(variable, post_lasso)
}

coef_compare <- grand_table |>
  select(variable, true_beta, bma_postmean, wals_estimate) |>
  left_join(post_lasso_all, by = "variable") |>
  pivot_longer(c(bma_postmean, post_lasso, wals_estimate),
               names_to = "method", values_to = "estimate") |>
  mutate(
    method = recode(method,
                    bma_postmean = "BMA Post. Mean",
                    post_lasso = "Post-LASSO",
                    wals_estimate = "WALS"),
    method = factor(method, levels = c("BMA Post. Mean", "Post-LASSO", "WALS"))
  )

p_coef_compare <- ggplot(coef_compare, aes(x = true_beta, y = estimate, color = method, shape = method)) +
  geom_abline(slope = 1, intercept = 0, linetype = "dashed", color = LIGHT_TEXT, alpha = 0.5) +
  geom_point(size = 3, alpha = 0.8) +
  geom_text_repel(aes(label = variable), size = 2.5, max.overlaps = 20,
                  show.legend = FALSE, color = LIGHTER_TEXT) +
  facet_wrap(~method, nrow = 1) +
  scale_color_manual(values = c("BMA Post. Mean" = STEEL_BLUE,
                                 "Post-LASSO" = TEAL,
                                 "WALS" = WARM_ORANGE)) +
  labs(x = "True Coefficient",
       y = "Estimated Coefficient",
       color = "Method", shape = "Method",
       title = "Coefficient Recovery: Estimated vs. True",
       subtitle = "Points on the dashed line = perfect recovery") +
  theme_site() +
  theme(legend.position = "none")

ggsave("bma_lasso_wals_14_coef_comparison.png", p_coef_compare, width = 14, height = 6, dpi = 300)

# ============================================================
# FIGURE 15: Agreement bar chart
# ============================================================
cat("Generating Figure 15: Agreement bar chart...\n")

p_agree <- grand_table |>
  mutate(bar_fill = ifelse(true_nonzero, "True predictor", "Noise")) |>
  ggplot(aes(x = reorder(variable, n_methods), y = n_methods, fill = bar_fill)) +
  geom_col(width = 0.6) +
  geom_hline(yintercept = 3, linetype = "dashed", color = LIGHT_TEXT) +
  annotate("text", x = 0.5, y = 3.1, label = "Triple-robust", hjust = 0, size = 3, color = LIGHT_TEXT) +
  coord_flip() +
  scale_fill_manual(values = c("True predictor" = STEEL_BLUE, "Noise" = WARM_ORANGE)) +
  scale_y_continuous(breaks = 0:3) +
  labs(x = NULL, y = "Number of methods identifying variable as robust",
       fill = "True status",
       title = "Agreement Across Three Methods",
       subtitle = "How many methods agree that each variable is robust?") +
  theme_site()

ggsave("bma_lasso_wals_15_agreement.png", p_agree, width = 10, height = 6, dpi = 300)

# ============================================================
# Print key results
# ============================================================
cat("\n=== KEY RESULTS ===\n")
cat("\nBMA PIPs:\n")
bma_df |> arrange(desc(pip)) |> select(variable, pip, true_beta) |> print(n = 12)

cat("\nLASSO selected variables (lambda.1se):\n")
lasso_df |> filter(selected) |> select(variable, lasso_coef, true_beta) |> print()

cat("\nWALS t-statistics:\n")
wals_df |> arrange(desc(abs_t)) |> select(variable, t_stat, abs_t, true_beta) |> print(n = 12)

cat("\nTriple-robust variables:\n")
triple_robust_vars <- grand_table |> filter(triple_robust) |> pull(variable)
cat(paste(triple_robust_vars, collapse = ", "), "\n")

cat("\nMethod performance:\n")
results_by_method <- tibble(
  method = c("BMA", "LASSO", "WALS"),
  true_pos = c(
    sum(grand_table$bma_robust & grand_table$true_nonzero),
    sum(grand_table$lasso_selected & grand_table$true_nonzero),
    sum(grand_table$wals_robust & grand_table$true_nonzero)
  ),
  false_pos = c(
    sum(grand_table$bma_robust & !grand_table$true_nonzero),
    sum(grand_table$lasso_selected & !grand_table$true_nonzero),
    sum(grand_table$wals_robust & !grand_table$true_nonzero)
  ),
  sensitivity = true_pos / 7,
  specificity = (5 - false_pos) / 5
)
print(results_by_method)

cat("\nAll 15 figures generated successfully!\n")
