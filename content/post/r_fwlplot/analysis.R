# =============================================================================
# Visualizing Regression with the FWL Theorem in R
# =============================================================================
# Description: Tutorial on the fwlplot package for visualizing the Frisch-Waugh-
#              Lovell theorem. Covers simulated confounding, manual FWL
#              verification, fixed effects visualization, and panel data.
# Packages:    fwlplot, fixest, ggplot2, patchwork, nycflights13, wooldridge
# Author:      Carlos Mendez (carlos-mendez.org)
# Date:        2026-03-27
# =============================================================================

# ---- 1. Setup ---------------------------------------------------------------

cran_packages <- c("fwlplot", "fixest", "ggplot2", "patchwork",
                    "nycflights13", "wooldridge")
missing <- cran_packages[!sapply(cran_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) install.packages(missing, repos = "https://cloud.r-project.org")

library(fwlplot)
library(fixest)
library(ggplot2)
library(patchwork)
library(nycflights13)
library(wooldridge)

# Site color palette
steel_blue  <- "#6a9bcc"
warm_orange <- "#d97757"
near_black  <- "#141413"
teal        <- "#00d4c8"
heading_blue <- "#1a3a8a"

# Custom ggplot theme for fwl_plot figures
theme_fwl <- theme_minimal(base_size = 13) +
  theme(
    plot.title = element_text(color = heading_blue, face = "bold", size = 14),
    plot.subtitle = element_text(color = "gray40", size = 11)
  )

# ---- 2. Simulated Data (same DGP as Python FWL post) ------------------------

set.seed(42)
n <- 200

income    <- rnorm(n, mean = 50, sd = 10)
dayofweek <- sample(1:7, n, replace = TRUE)
coupons   <- 60 - 0.5 * income + rnorm(n, 0, 5)
sales     <- 10 + 0.2 * coupons + 0.3 * income + 0.5 * dayofweek + rnorm(n, 0, 3)

store_data <- data.frame(
  sales   = round(sales, 2),
  coupons = round(coupons, 2),
  income  = round(income, 2),
  dayofweek = dayofweek
)

# Save dataset for reuse in other tutorials
write.csv(store_data, "store_data.csv", row.names = FALSE)
cat("Saved store_data.csv (", nrow(store_data), "rows )\n")

cat("Simulated data:\n")
print(head(store_data))
cat("\nSummary:\n")
print(summary(store_data[, c("sales", "coupons", "income")]))
cat("\nCorrelations:\n")
print(round(cor(store_data[, c("sales", "coupons", "income")]), 3))

# ---- 3. Naive vs. Controlled with fwl_plot (Figure 1) -----------------------

# Naive regression
fe_naive <- feols(sales ~ coupons, data = store_data)
cat("\n--- Naive (no controls) ---\n")
print(summary(fe_naive)$coefficients)

# Controlled regression
fe_full <- feols(sales ~ coupons + income, data = store_data)
cat("\n--- Controlled (income) ---\n")
print(summary(fe_full)$coefficients)

# Figure 1: fwl_plot() side-by-side using patchwork
p1_naive <- fwl_plot(sales ~ coupons, data = store_data, ggplot = TRUE) +
  labs(title = "A. Naive: No Controls",
       x = "Coupons", y = "Sales") +
  theme_fwl

p1_fwl <- fwl_plot(sales ~ coupons + income, data = store_data, ggplot = TRUE) +
  labs(title = "B. FWL: Controlling for Income",
       x = "Coupons (residualized)", y = "Sales (residualized)") +
  theme_fwl

fig1 <- p1_naive + p1_fwl +
  plot_annotation(
    title = "What Does 'Controlling for Income' Look Like?",
    subtitle = "fwl_plot() reveals the true positive effect hidden by confounding",
    theme = theme(
      plot.title = element_text(color = heading_blue, face = "bold", size = 16),
      plot.subtitle = element_text(color = "gray40", size = 12)
    )
  )

ggsave("r_fwlplot_fig1_naive_vs_controlled.png", fig1,
       width = 12, height = 5.5, dpi = 300)
cat("\nFigure 1 saved.\n")

# ---- 4. fixest comparison table ----------------------------------------------

cat("\n--- fixest comparison ---\n")
etable(fe_naive, fe_full, headers = c("Naive", "Controlled"))

# ---- 5. FWL Manual Verification ----------------------------------------------

# Step-by-step FWL
resid_y <- resid(lm(sales ~ income, data = store_data))
resid_x <- resid(lm(coupons ~ income, data = store_data))
fwl_manual <- lm(resid_y ~ resid_x)

cat("\n--- FWL Verification ---\n")
cat("feols coefficient:     ", round(coef(fe_full)["coupons"], 6), "\n")
cat("Manual FWL coefficient:", round(coef(fwl_manual)["resid_x"], 6), "\n")
cat("Match:", all.equal(coef(fe_full)["coupons"],
                        coef(fwl_manual)["resid_x"],
                        check.attributes = FALSE), "\n")

# ---- 6. OVB Calculation -----------------------------------------------------

# OVB = gamma * delta
# gamma = effect of income on sales (in full model)
gamma_hat <- coef(fe_full)["income"]
# delta = coefficient from regressing coupons on income
delta_hat <- coef(lm(coupons ~ income, data = store_data))["income"]
ovb <- gamma_hat * delta_hat

cat("\n--- Omitted Variable Bias ---\n")
cat("gamma (income -> sales):", round(gamma_hat, 4), "\n")
cat("delta (income -> coupons):", round(delta_hat, 4), "\n")
cat("OVB = gamma * delta:", round(ovb, 4), "\n")
cat("Naive coefficient:", round(coef(fe_naive)["coupons"], 4), "\n")
cat("True coefficient (feols):", round(coef(fe_full)["coupons"], 4), "\n")
cat("Naive ≈ True + OVB:", round(coef(fe_full)["coupons"] + ovb, 4), "\n")

# ---- 7. Three-model comparison (Figure 2) -----------------------------------

fe_full3 <- feols(sales ~ coupons + income + dayofweek, data = store_data)
cat("\n--- Three-model comparison ---\n")
etable(fe_naive, fe_full, fe_full3,
       headers = c("Naive", "+ Income", "+ Income + Day"))

# Figure 2: Three fwl_plot panels
p2a <- fwl_plot(sales ~ coupons, data = store_data, ggplot = TRUE) +
  labs(title = "A. No controls", x = "Coupons", y = "Sales") + theme_fwl

p2b <- fwl_plot(sales ~ coupons + income, data = store_data, ggplot = TRUE) +
  labs(title = "B. + Income", x = "Coupons (resid.)", y = "Sales (resid.)") + theme_fwl

p2c <- fwl_plot(sales ~ coupons + income + dayofweek, data = store_data, ggplot = TRUE) +
  labs(title = "C. + Income + Day", x = "Coupons (resid.)", y = "Sales (resid.)") + theme_fwl

fig2 <- p2a + p2b + p2c +
  plot_annotation(
    title = "Progressive Controls: How the Scatter Changes",
    theme = theme(plot.title = element_text(color = heading_blue, face = "bold", size = 15))
  )

ggsave("r_fwlplot_fig2_fwl_verification.png", fig2,
       width = 14, height = 5, dpi = 300)
cat("Figure 2 saved.\n")

# ---- 8. Fixed Effects with nycflights13 (Figure 3) --------------------------

data("flights", package = "nycflights13")
flights_clean <- flights[complete.cases(flights[, c("dep_delay", "air_time", "origin", "dest")]), ]
flights_clean <- flights_clean[flights_clean$dep_delay < 120 & flights_clean$dep_delay > -30, ]

# Remove singleton origin-dest combos
od_counts <- table(paste(flights_clean$origin, flights_clean$dest))
flights_clean <- flights_clean[paste(flights_clean$origin, flights_clean$dest) %in%
                                names(od_counts[od_counts > 1]), ]

cat("\n--- Flights data ---\n")
cat("Observations:", nrow(flights_clean), "\n")
cat("Origins:", length(unique(flights_clean$origin)), "\n")
cat("Destinations:", length(unique(flights_clean$dest)), "\n")

# Save a sample for reuse
set.seed(123)
flights_sample <- as.data.frame(flights_clean[sample(nrow(flights_clean), 5000), ])
write.csv(flights_sample[, c("dep_delay", "arr_delay", "air_time", "origin", "dest",
                              "carrier", "month", "day", "hour")],
          "flights_sample.csv", row.names = FALSE)
cat("Saved flights_sample.csv (", nrow(flights_sample), "rows )\n")

# Regressions (on full data)
fe_flights_none   <- feols(dep_delay ~ air_time, data = flights_clean)
fe_flights_origin <- feols(dep_delay ~ air_time | origin, data = flights_clean)
fe_flights_both   <- feols(dep_delay ~ air_time | origin + dest, data = flights_clean)

cat("\n--- Flight regressions ---\n")
etable(fe_flights_none, fe_flights_origin, fe_flights_both,
       headers = c("No FE", "Origin FE", "Origin + Dest FE"))

# Figure 3: Progressive fwl_plot with FE (using sample for plotting)
p3a <- fwl_plot(dep_delay ~ air_time, data = flights_sample,
                ggplot = TRUE) +
  labs(title = "A. No Fixed Effects",
       x = "Air Time (min)", y = "Dep. Delay (min)") + theme_fwl

p3b <- fwl_plot(dep_delay ~ air_time | origin, data = flights_sample,
                ggplot = TRUE) +
  labs(title = "B. Origin FE",
       x = "Air Time (resid.)", y = "Dep. Delay (resid.)") + theme_fwl

p3c <- fwl_plot(dep_delay ~ air_time | origin + dest, data = flights_sample,
                ggplot = TRUE) +
  labs(title = "C. Origin + Dest FE",
       x = "Air Time (resid.)", y = "Dep. Delay (resid.)") + theme_fwl

fig3 <- p3a + p3b + p3c +
  plot_annotation(
    title = "What Do Fixed Effects 'Do' to the Data?",
    subtitle = "Each panel adds more fixed effects, residualizing progressively",
    theme = theme(
      plot.title = element_text(color = heading_blue, face = "bold", size = 15),
      plot.subtitle = element_text(color = "gray40", size = 11)
    )
  )

ggsave("r_fwlplot_fig3_fixed_effects.png", fig3,
       width = 14, height = 5, dpi = 300)
cat("Figure 3 saved.\n")

# ---- 9. Panel Data: Wages (Figure 4) ----------------------------------------

data("wagepan", package = "wooldridge")

# Save for reuse
write.csv(wagepan, "wagepan.csv", row.names = FALSE)
cat("Saved wagepan.csv (", nrow(wagepan), "rows )\n")

cat("\n--- Wage panel data ---\n")
cat("Observations:", nrow(wagepan), "\n")
cat("Individuals:", length(unique(wagepan$nr)), "\n")
cat("Years:", length(unique(wagepan$year)), "\n")

# Regressions
fe_pool <- feols(lwage ~ educ + exper + expersq, data = wagepan)
fe_fe   <- feols(lwage ~ exper + expersq | nr, data = wagepan)
fe_twfe <- feols(lwage ~ exper + expersq | nr + year, data = wagepan)

cat("\n--- Wage regressions ---\n")
etable(fe_pool, fe_fe, fe_twfe,
       headers = c("Pooled OLS", "Individual FE", "Individual + Year FE"))

# Figure 4: fwl_plot for wages (sample of individuals for readability)
set.seed(456)
sample_ids <- sample(unique(wagepan$nr), 150)
wage_sample <- wagepan[wagepan$nr %in% sample_ids, ]

p4a <- fwl_plot(lwage ~ exper, data = wage_sample, ggplot = TRUE) +
  labs(title = "A. Raw: Pooled Cross-Section",
       x = "Experience (years)", y = "Log Wage") + theme_fwl

p4b <- fwl_plot(lwage ~ exper | nr, data = wage_sample, ggplot = TRUE) +
  labs(title = "B. FWL: Individual Fixed Effects",
       x = "Experience (demeaned)", y = "Log Wage (demeaned)") + theme_fwl

fig4 <- p4a + p4b +
  plot_annotation(
    title = "Controlling for Unobserved Ability",
    subtitle = "Individual FE removes person-specific wage levels, isolating within-person growth",
    theme = theme(
      plot.title = element_text(color = heading_blue, face = "bold", size = 15),
      plot.subtitle = element_text(color = "gray40", size = 11)
    )
  )

ggsave("r_fwlplot_fig4_panel_data.png", fig4,
       width = 12, height = 5.5, dpi = 300)
cat("Figure 4 saved.\n")

# Print the bivariate slope for reference (used in figure)
bivar_exper <- coef(lm(lwage ~ exper, data = wage_sample))["exper"]
cat("\nBivariate exper slope (sample):", round(bivar_exper, 4), "\n")
cat("FE exper slope (full data):", round(coef(fe_fe)["exper"], 4), "\n")

# ---- 10. ggplot2 Integration (Figure 5) -------------------------------------

fig5 <- fwl_plot(sales ~ coupons + income, data = store_data, ggplot = TRUE) +
  labs(title = "FWL Visualization: Coupons Effect on Sales",
       subtitle = "After residualizing on income (fwlplot + ggplot2)") +
  theme_fwl

ggsave("r_fwlplot_fig5_ggplot_custom.png", fig5, width = 8, height = 6, dpi = 300)
cat("Figure 5 saved.\n")

# ---- 11. Summary of saved datasets ------------------------------------------

cat("\n=== Datasets saved for reuse ===\n")
cat("store_data.csv:     ", nrow(store_data), "rows,", ncol(store_data), "cols\n")
cat("flights_sample.csv: ", nrow(flights_sample), "rows, 9 cols\n")
cat("wagepan.csv:        ", nrow(wagepan), "rows,", ncol(wagepan), "cols\n")

cat("\nAnalysis complete. All figures generated.\n")
cat("Script finished successfully.\n")
