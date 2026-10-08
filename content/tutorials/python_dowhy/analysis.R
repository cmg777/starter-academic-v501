# ==============================================================================
# Cross-Validation: Causal Inference Methods in R
#
# Replicates the DoWhy (Python) analysis of the Lalonde/NSW dataset using
# R's base regression, manual IPW/AIPW, and MatchIt for PS matching.
#
# Dataset: lalonde_dowhy.csv (exported from Python script)
# Treatment: treat (1=Job Training, 0=Control)
# Outcome: re78 (Real Earnings in 1978, USD)
# Covariates: age educ black hisp married nodegr re74 re75
#
# Usage: Rscript analysis.R
#
# Requirements: R 4.0+, MatchIt package
# ==============================================================================

# Install MatchIt if not available
if (!requireNamespace("MatchIt", quietly = TRUE)) {
  install.packages("MatchIt", repos = "https://cloud.r-project.org")
}

library(MatchIt)

set.seed(42)

# ── Data Loading ─────────────────────────────────────────────────────────

df <- read.csv("lalonde_dowhy.csv")

cat("Dataset shape:", nrow(df), "x", ncol(df), "\n")
cat("\nTreatment groups:\n")
print(table(df$treat))
cat("\nOutcome (re78) summary:\n")
print(summary(df$re78))
cat("\nCovariate summary:\n")
print(summary(df[, c("age", "educ", "black", "hisp", "married", "nodegr", "re74", "re75")]))

# Define covariates
covariates <- c("age", "educ", "black", "hisp", "married", "nodegr", "re74", "re75")

cat("\n")
cat("============================================================\n")
cat("CAUSAL INFERENCE: NSW Job Training Program (R)\n")
cat("============================================================\n")

# ── Method 1: Naive Difference in Means ──────────────────────────────────

cat("\n--- Method 1: Naive Difference in Means ---\n")

mean_treated <- mean(df$re78[df$treat == 1])
mean_control <- mean(df$re78[df$treat == 0])
naive_ate <- mean_treated - mean_control

cat(sprintf("Mean earnings (Training): $%.2f\n", mean_treated))
cat(sprintf("Mean earnings (Control):  $%.2f\n", mean_control))
cat(sprintf("Naive ATE:                $%.2f\n", naive_ate))

# ── Method 2: Regression Adjustment (Pooled OLS) ─────────────────────────

cat("\n--- Method 2: Regression Adjustment (Pooled OLS) ---\n")

formula_ra <- as.formula(paste("re78 ~ treat +", paste(covariates, collapse = " + ")))
model_ra <- lm(formula_ra, data = df)
ra_ate <- coef(model_ra)["treat"]

cat(sprintf("RA ATE (pooled OLS):      $%.2f\n", ra_ate))
cat(sprintf("Std. Error:               $%.2f\n", summary(model_ra)$coefficients["treat", "Std. Error"]))
cat(sprintf("p-value:                  %.4f\n", summary(model_ra)$coefficients["treat", "Pr(>|t|)"]))

# ── Method 3: Inverse Probability Weighting (IPW) ────────────────────────

cat("\n--- Method 3: Inverse Probability Weighting (IPW) ---\n")

# Step 1: Estimate propensity scores via logistic regression
formula_ps <- as.formula(paste("treat ~", paste(covariates, collapse = " + ")))
ps_model <- glm(formula_ps, data = df, family = binomial(link = "logit"))
ps <- predict(ps_model, type = "response")

# Step 2: Compute IPW weights
# Horvitz-Thompson estimator: same formula as DoWhy's ips_weight
ipw_weights <- ifelse(df$treat == 1, 1 / ps, 1 / (1 - ps))

# Step 3: Compute weighted ATE
ipw_ate <- weighted.mean(df$re78[df$treat == 1], 1 / ps[df$treat == 1]) -
           weighted.mean(df$re78[df$treat == 0], 1 / (1 - ps[df$treat == 0]))

# Alternative: Horvitz-Thompson (unnormalized)
n <- nrow(df)
ipw_ate_ht <- (1/n) * sum(df$treat * df$re78 / ps - (1 - df$treat) * df$re78 / (1 - ps))

cat(sprintf("IPW ATE (normalized):     $%.2f\n", ipw_ate))
cat(sprintf("IPW ATE (Horvitz-Thompson): $%.2f\n", ipw_ate_ht))

# ── Method 4: Doubly Robust (AIPW) ───────────────────────────────────────

cat("\n--- Method 4: Doubly Robust (AIPW) ---\n")

# Outcome models: separate regressions for treated and control
formula_outcome <- as.formula(paste("re78 ~", paste(covariates, collapse = " + ")))
model_treated <- lm(formula_outcome, data = df[df$treat == 1, ])
model_control <- lm(formula_outcome, data = df[df$treat == 0, ])

# Predicted potential outcomes for all observations
mu1 <- predict(model_treated, newdata = df)
mu0 <- predict(model_control, newdata = df)

# AIPW formula (same as Python implementation)
T_i <- df$treat
Y_i <- df$re78
dr_ate <- mean(
  (mu1 - mu0) +
  T_i * (Y_i - mu1) / ps -
  (1 - T_i) * (Y_i - mu0) / (1 - ps)
)

cat(sprintf("DR ATE (AIPW):            $%.2f\n", dr_ate))

# ── Method 5: Propensity Score Stratification ─────────────────────────────

cat("\n--- Method 5: Propensity Score Stratification (5 strata) ---\n")

# Create 5 strata based on PS quintiles
ps_strata <- cut(ps, breaks = quantile(ps, probs = seq(0, 1, 0.2)),
                 include.lowest = TRUE, labels = 1:5)

# Compute within-stratum ATEs
strata_ates <- numeric(5)
strata_weights <- numeric(5)

for (s in 1:5) {
  in_stratum <- ps_strata == s
  n_t <- sum(df$treat == 1 & in_stratum)
  n_c <- sum(df$treat == 0 & in_stratum)

  if (n_t > 0 & n_c > 0) {
    mean_t <- mean(df$re78[df$treat == 1 & in_stratum])
    mean_c <- mean(df$re78[df$treat == 0 & in_stratum])
    strata_ates[s] <- mean_t - mean_c
    strata_weights[s] <- n_t + n_c
    cat(sprintf("  Stratum %d: ATE = $%.2f (n_t=%d, n_c=%d)\n",
                s, strata_ates[s], n_t, n_c))
  } else {
    cat(sprintf("  Stratum %d: SKIPPED (empty treatment or control group)\n", s))
    strata_weights[s] <- 0
  }
}

ps_strat_ate <- sum(strata_ates * strata_weights) / sum(strata_weights)
cat(sprintf("\nPS Stratification ATE:    $%.2f\n", ps_strat_ate))

# ── Method 6: Propensity Score Matching ───────────────────────────────────

cat("\n--- Method 6: Propensity Score Matching ---\n")

# Nearest-neighbor matching on propensity score (1:1, without replacement)
m_out <- matchit(formula_ps, data = df, method = "nearest",
                 distance = "glm", link = "logit")

# Extract matched data and estimate treatment effect
m_data <- match.data(m_out)
match_model <- lm(re78 ~ treat, data = m_data, weights = weights)
match_ate <- coef(match_model)["treat"]

cat(sprintf("PS Matching ATE:          $%.2f\n", match_ate))
cat(sprintf("Matched sample size:      %d\n", nrow(m_data)))

# ── Summary: Cross-Validation Table ──────────────────────────────────────

cat("\n\n")
cat("============================================================\n")
cat("CROSS-VALIDATION: Python (DoWhy) vs R\n")
cat("============================================================\n")
cat(sprintf("%-32s %12s %12s\n", "Method", "Python ATE", "R ATE"))
cat("------------------------------------------------------------\n")
cat(sprintf("%-32s $%10.2f   $%10.2f\n", "Naive (Diff. in Means)",  1794.34, naive_ate))
cat(sprintf("%-32s $%10.2f   $%10.2f\n", "Regression Adj. (OLS)",   1676.34, ra_ate))
cat(sprintf("%-32s $%10.2f   $%10.2f\n", "IPW (Horvitz-Thompson)",  1559.41, ipw_ate_ht))
cat(sprintf("%-32s $%10.2f   $%10.2f\n", "Doubly Robust (AIPW)",    1620.04, dr_ate))
cat(sprintf("%-32s $%10.2f   $%10.2f\n", "PS Stratification",       1617.07, ps_strat_ate))
cat(sprintf("%-32s $%10.2f   $%10.2f\n", "PS Matching",             1735.69, match_ate))
cat("============================================================\n")
cat("\nNotes:\n")
cat("- Naive and OLS should match Python exactly (same arithmetic)\n")
cat("- IPW/DR/Stratification may differ: Python uses L2-regularized\n")
cat("  logit (scikit-learn), R uses MLE logit (no regularization)\n")
cat("- PS Matching differences reflect algorithm implementation\n")
cat("  details (MatchIt vs DoWhy matching)\n")
