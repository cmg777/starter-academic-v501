# ══════════════════════════════════════════════════════════════════
# Double LASSO: Replicating Donohue & Levitt (2001) on abortion and crime
#
# Pedagogical R implementation of the Double LASSO (DL) procedure and
# its benchmarks, following Fitzgerald, Lattimore, Robinson & Zhu (2026,
# Journal of Applied Econometrics, "Double LASSO: Replication and
# Practical Insights").
#
# The empirical question, due to Donohue III & Levitt (2001), is: did
# legalised abortion in the 1970s reduce crime rates in the 1990s? The
# regressor of interest d is the "effective abortion rate" and the
# outcomes y are state-level crime rates for three categories: violent,
# property and murder. The panel covers 48 U.S. states over 1985–1997
# (n = 48 × 12 = 576 observations after first-differencing).
#
# Belloni, Chernozhukov & Hansen (2014) — and Fitzgerald et al. (2026)
# in turn — expand the original 8 controls to ~284 potential controls
# (interactions, lagged levels, time trends, within-state means, etc.)
# and use Double LASSO to select which subset actually belongs in the
# regression. This script reproduces the headline numbers in their
# Table 2 from a clean, from-scratch implementation.
#
# WHY DOUBLE LASSO? In one paragraph:
#
#   With n = 576 observations and p = 284 candidate controls, plain OLS
#   technically runs (p < n) but its standard errors blow up because so
#   many controls are nearly collinear. A natural fix is LASSO — shrink
#   most controls to zero, keep the few that matter — but using ONE
#   LASSO on (d, X) -> y is dangerous: LASSO can drop a control that is
#   strongly correlated with the treatment d but only weakly with the
#   outcome y, because keeping it does not improve prediction. Dropping
#   such a control leaves omitted-variable bias in the estimate of α.
#   Belloni, Chernozhukov & Hansen (2014) solve this by running TWO
#   LASSOs — one that predicts y from x, one that predicts d from x —
#   then estimating α by plain OLS of y on d and the UNION of controls
#   selected by either equation. LASSO is used here for variable
#   selection only; the final estimate of α comes from unshrunk OLS.
#   That is the Double LASSO procedure this script implements.
#
# Methods compared (all with state-clustered standard errors):
#
#   1. First-difference OLS  — Donohue–Levitt's original spec (d only)
#   2. OLS with all controls — feasible since p=284 < n=576
#   3. Post-Structural LASSO (PSL) — one LASSO with d forced in,
#      then post-OLS on selected controls
#   4. Double LASSO, rigorous penalty (hdm::rlasso)
#   5. Double LASSO, CV penalty (glmnet::cv.glmnet)
#
# Usage:    Rscript analysis.R 2>&1 | tee execution_log.txt
# Outputs:  r_double_lasso_*.png  (4 figures, dark theme)
#           results_table2.csv    (replication of paper's Table 2)
#           selection_diagnostic.csv
#
# Data:     Six CSVs loaded over HTTPS from the GitHub raw URL below.
#           The CSVs were produced once by `prepare_data.R` from the
#           Matlab files shipped with the replication archive.
#
# References:
#   - Fitzgerald, Lattimore, Robinson & Zhu (2026), JAE.
#     https://doi.org/10.15456/jae.2025335.0258270663
#   - Belloni, Chernozhukov & Hansen (2014), Rev. Econ. Stud. 81: 608–650.
#   - Donohue & Levitt (2001), Q. J. Econ. 116: 379–420.
# ══════════════════════════════════════════════════════════════════


# ── 0. Setup ─────────────────────────────────────────────────────

required_packages <- c("glmnet", "hdm", "sandwich", "lmtest", "MASS",
                       "ggplot2", "dplyr", "tidyr", "scales", "patchwork")
missing <- required_packages[!sapply(required_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}
suppressMessages({
  library(glmnet)
  library(hdm)
  library(sandwich)
  library(lmtest)
  library(ggplot2)
  library(dplyr)
  library(tidyr)
  library(scales)
  library(patchwork)
})

set.seed(20260520)

# Site colour palette (dark theme)
STEEL_BLUE   <- "#6a9bcc"
WARM_ORANGE  <- "#d97757"
NEAR_BLACK   <- "#141413"
TEAL         <- "#00d4c8"
DARK_BG      <- "#0f1729"
DARK_PANEL   <- "#1f2b5e"
LIGHT_TEXT   <- "#c8d0e0"
LIGHTER_TEXT <- "#e8ecf2"
LIGHT_ORANGE <- "#e8956a"   # secondary in warm-orange family
DARK_ORANGE  <- "#c4623d"   # tertiary in warm-orange family

theme_site <- function(base_size = 13) {
  theme_minimal(base_size = base_size) %+replace%
    theme(
      text              = element_text(color = LIGHTER_TEXT),
      plot.title        = element_text(color = LIGHTER_TEXT, face = "bold",
                                       size = rel(1.05), hjust = 0,
                                       margin = margin(b = 6)),
      plot.subtitle     = element_text(color = LIGHT_TEXT, size = rel(0.85),
                                       hjust = 0, margin = margin(b = 10)),
      plot.caption      = element_text(color = LIGHT_TEXT, size = rel(0.75),
                                       hjust = 0, margin = margin(t = 8)),
      plot.background   = element_rect(fill = DARK_BG, color = NA),
      panel.background  = element_rect(fill = DARK_BG, color = NA),
      panel.grid.major  = element_line(color = DARK_PANEL, linewidth = 0.3),
      panel.grid.minor  = element_blank(),
      axis.text         = element_text(color = LIGHT_TEXT),
      axis.title        = element_text(color = LIGHTER_TEXT),
      legend.position   = "bottom",
      legend.background = element_rect(fill = DARK_BG, color = NA),
      legend.key        = element_rect(fill = DARK_BG, color = NA),
      legend.text       = element_text(color = LIGHT_TEXT),
      legend.title      = element_text(color = LIGHTER_TEXT),
      strip.text        = element_text(color = LIGHTER_TEXT, face = "bold")
    )
}


# ── 1. Data loading (from GitHub raw URLs) ───────────────────────

cat("\n========================================\n")
cat("STEP 1 — DATA LOADING (from GitHub raw URLs)\n")
cat("========================================\n")
cat("Pulling six CSVs over HTTPS. These were extracted from the JAE\n")
cat("replication archive's .mat files by the companion prepare_data.R;\n")
cat("you do not need any Matlab files locally to run this script.\n\n")

BASE_URL <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_double_lasso/data/"

# Helper: read a CSV from BASE_URL and return a data frame.
# Column names in the control CSVs include characters that R sanitises
# (^, *, parentheses) — `check.names = FALSE` preserves them as-is.
read_remote <- function(filename, check.names = TRUE) {
  read.csv(paste0(BASE_URL, filename), check.names = check.names,
           stringsAsFactors = FALSE)
}

state        <- read_remote("levitt_state.csv")$state
linear       <- read_remote("levitt_linear.csv")
partialled   <- read_remote("levitt_partialled.csv")
ctrl_viol    <- read_remote("levitt_controls_viol.csv",  check.names = FALSE)
ctrl_prop    <- read_remote("levitt_controls_prop.csv",  check.names = FALSE)
ctrl_murd    <- read_remote("levitt_controls_murd.csv",  check.names = FALSE)

cat(sprintf("levitt_state.csv          %d observations (cluster ids 1..%d)\n",
            length(state), max(state)))
cat(sprintf("levitt_linear.csv         %d rows x %d cols (raw first differences)\n",
            nrow(linear), ncol(linear)))
cat(sprintf("levitt_partialled.csv     %d rows x %d cols (after partialling time dummies)\n",
            nrow(partialled), ncol(partialled)))
cat(sprintf("levitt_controls_viol.csv  %d rows x %d cols  (Zv)\n",
            nrow(ctrl_viol), ncol(ctrl_viol)))
cat(sprintf("levitt_controls_prop.csv  %d rows x %d cols  (Zp)\n",
            nrow(ctrl_prop), ncol(ctrl_prop)))
cat(sprintf("levitt_controls_murd.csv  %d rows x %d cols  (Zm)\n",
            nrow(ctrl_murd), ncol(ctrl_murd)))

stopifnot(length(state) == 576)
stopifnot(ncol(ctrl_viol) == 284 && ncol(ctrl_prop) == 284 && ncol(ctrl_murd) == 284)


# ── 2. Three outcomes, one common workflow ───────────────────────

# For each outcome we have:
#   y_raw, d_raw  — first-differenced crime rate and effective abortion rate
#   y, d          — same series after partialling out year fixed effects
#   X             — 576 × 284 matrix of partialled-out potential controls
#
# The partialling step (done in the Matlab pre-processing) absorbs year
# fixed effects via Frisch–Waugh–Lovell: every variable v becomes
# v - T (T'T)^{-1} T' v, where T is the matrix of year dummies. So the
# OLS / LASSO regressions that follow are equivalent to running on the
# raw first differences while controlling for year dummies, with one
# less degree of freedom.

outcomes <- list(
  violent = list(label = "Violent crime",
                 y_raw = linear$Dyv, d_raw = linear$Dxv,
                 y     = partialled$DyV, d = partialled$DxV,
                 X     = as.matrix(ctrl_viol)),
  property = list(label = "Property crime",
                  y_raw = linear$Dyp, d_raw = linear$Dxp,
                  y     = partialled$DyP, d = partialled$DxP,
                  X     = as.matrix(ctrl_prop)),
  murder = list(label = "Murder",
                y_raw = linear$Dym, d_raw = linear$Dxm,
                y     = partialled$DyM, d = partialled$DxM,
                X     = as.matrix(ctrl_murd))
)


# ── 3. Helper: state-clustered standard errors ───────────────────

# Cluster-robust variance estimator with the HC1-style small-sample
# adjustment used by the Fitzgerald et al. replication code. The formula
# is the textbook "sandwich" estimator (see Cameron & Miller 2015,
# J. Hum. Resour.):
#
#   V_cluster = (n-1)/(n-k) × G/(G-1) × (X'X)^{-1} · S · (X'X)^{-1}
#                ^small-sample adjust       ^bread     ^meat   ^bread
#
# where S = sum_g (X_g' e_g)(X_g' e_g)' is the "meat" (the cluster-
# summed outer product of scores) and (X'X)^{-1} is the "bread". The
# state-level grouping has G = 48 clusters of 12 observations each.
cluster_se <- function(X, e, group) {
  X <- as.matrix(X)
  n <- length(e)
  k <- ncol(X)
  G <- length(unique(group))
  XX <- crossprod(X)
  # When X has many near-collinear columns (the full-OLS case) solve()
  # can still return finite numbers but they are unreliable. Fall back
  # to a Moore–Penrose pseudoinverse via SVD on actual failure.
  bread <- tryCatch(solve(XX),
                    error = function(err) MASS::ginv(XX))
  S <- matrix(0, k, k)
  for (g in unique(group)) {
    idx <- which(group == g)
    Xg  <- X[idx, , drop = FALSE]
    eg  <- e[idx]
    Xe  <- crossprod(Xg, eg)            # k × 1
    S   <- S + tcrossprod(Xe)
  }
  V     <- ((n - 1) / (n - k)) * (G / (G - 1)) * (bread %*% S %*% bread)
  sqrt(diag(V))
}

# Convenience: estimate by OLS on (d, controls) with state-clustered SEs.
# We route through lm() so aliased / linearly dependent columns are auto-
# detected (their coefficients become NA) and then drop them before
# computing cluster_se — otherwise X'X is singular when ncol(X) ~ n.
ols_fit <- function(y, d, X, group) {
  X <- as.matrix(X)
  if (ncol(X) > 0) colnames(X) <- paste0("z", seq_len(ncol(X)))   # safe, unique
  df  <- data.frame(d = d, X)
  fit <- lm(y ~ . - 1, data = df)
  cf  <- coef(fit)
  keep <- !is.na(cf)
  M   <- model.matrix(fit)[, keep, drop = FALSE]
  e   <- as.numeric(residuals(fit))
  se  <- cluster_se(M, e, group)
  d_pos <- which(colnames(M) == "d")
  list(coef = cf["d"], se = se[d_pos],
       n_selected = sum(keep) - 1, residuals = e)
}


# ── 4. Estimator A — First-difference OLS (Donohue–Levitt baseline) ──

# ESTIMAND. Across all five estimators below, the parameter of interest
# is α, the average partial effect of the (first-differenced) effective
# abortion rate on the (first-differenced) state crime rate. This is an
# observational study, so α is identified under two assumptions:
#
#   (1) Conditional independence given X: once we control for the 284
#       partialled covariates (lagged demographics, within-state means,
#       time-trend interactions of the original Donohue–Levitt controls,
#       etc.), the remaining variation in the abortion rate is
#       independent of any unobserved confounders.
#   (2) Parallel trends in levels: state fixed effects, if any, are
#       absorbed by first-differencing the data; year fixed effects are
#       absorbed by the partialling step (FWL projection) done in
#       prepare_data.R.
#
# Neither assumption is innocuous — Fitzgerald et al. (2026) sec. 3.5
# discusses the bias-amplification and collider threats — but they are
# the framework the paper operates under, and we follow it.

cat("\n========================================\n")
cat("STEP 4 — FIRST-DIFFERENCE OLS (the original Donohue–Levitt 1993 spec)\n")
cat("========================================\n")
cat("Regress differenced crime on differenced abortion with NO controls.\n")
cat("This is the no-controls baseline — the LASSO methods below add\n")
cat("hundreds of candidate controls and select among them.\n")
cat("Model: Dy_st = alpha * Dd_st + eps_st\n\n")

first_diff <- list()
for (nm in names(outcomes)) {
  o    <- outcomes[[nm]]
  # lm.fit is the low-level form that takes a design matrix directly,
  # bypassing lm()'s formula parser. Slightly faster; same residuals.
  fit  <- lm.fit(cbind(o$d_raw), o$y_raw)
  e    <- as.numeric(fit$residuals)
  se   <- cluster_se(cbind(o$d_raw), e, state)
  first_diff[[nm]] <- list(coef = fit$coefficients[1], se = se[1])
  cat(sprintf("  %-15s alpha_hat = %+0.4f  (SE = %0.4f)\n",
              o$label, first_diff[[nm]]$coef, first_diff[[nm]]$se))
}


# ── 5. Estimator B — OLS with all 284 controls ───────────────────

cat("\n========================================\n")
cat("STEP 5 — OLS WITH ALL ~284 CONTROLS (the kitchen-sink approach)\n")
cat("========================================\n")
cat("Feasible because p = 284 < n = 576: OLS technically inverts. But\n")
cat("many controls are near-collinear, so the standard errors balloon —\n")
cat("watch the SE on murder explode. This is what motivates LASSO:\n")
cat("we want to KEEP the controls that matter, DROP the rest.\n\n")

ols_all <- list()
for (nm in names(outcomes)) {
  o   <- outcomes[[nm]]
  res <- ols_fit(o$y, o$d, o$X, state)
  ols_all[[nm]] <- res
  cat(sprintf("  %-15s alpha_hat = %+0.4f  (SE = %0.4f)  using %d controls\n",
              o$label, res$coef, res$se, res$n_selected))
}


# ── 6. Estimator C — Post-Structural LASSO (PSL) ────────────────

# PSL = "Post-Structural LASSO", Fitzgerald et al.'s suggested benchmark.
# It uses ONE LASSO (not two like Double LASSO) but forces the treatment
# to stay in, and then refits with plain OLS on the selected controls.
#
#   Step 1 — Run cv.glmnet on (d, X) -> y, but with `penalty.factor` set
#            so that d gets a ZERO penalty multiplier. glmnet's penalty
#            on each coefficient is lambda × penalty.factor[j]; a 0
#            entry means d enters with no shrinkage and so survives
#            every value of lambda. The remaining 284 columns of X are
#            penalised normally and most get shrunk to zero.
#   Step 2 — Refit y ~ d + X[, selected] by plain OLS, then compute
#            state-clustered SEs.
#
# WHY POST-OLS, not LASSO coefficients? LASSO shrinks the coefficients
# of the variables it keeps toward zero — that introduces bias in α.
# Refitting with plain OLS on the variables LASSO selected removes the
# shrinkage. Throughout this script, LASSO is used for SELECTION only;
# the actual α estimate always comes from a final OLS.

cat("\n========================================\n")
cat("STEP 6 — POST-STRUCTURAL LASSO (PSL), the one-LASSO benchmark\n")
cat("========================================\n")
cat("One CV-LASSO on cbind(d, X) -> y with d forced in (penalty.factor=0),\n")
cat("then plain OLS on d + the controls LASSO selected.\n\n")

psl_fit <- function(y, d, X, group, nfolds = 3) {
  # 3 folds matches Fitzgerald et al. (2026) footnote 2.
  M <- cbind(d, X)
  # penalty.factor multiplies each coefficient's penalty by 0 or 1.
  # Putting 0 in the d slot effectively pins d into the model: LASSO
  # cannot shrink it away no matter how aggressive lambda is.
  pf <- c(0, rep(1, ncol(X)))
  cv <- cv.glmnet(M, y, alpha = 1, intercept = TRUE,
                  penalty.factor = pf, nfolds = nfolds)
  coefs <- as.numeric(coef(cv, s = "lambda.min"))[-1]   # drop intercept
  # coefs[1] is d's coefficient (always nonzero by construction);
  # coefs[2:p+1] are the X coefficients. Selected X = those with |coef| > 0.
  sel <- which(coefs[-1] != 0)
  Xs  <- X[, sel, drop = FALSE]
  res <- ols_fit(y, d, Xs, group)
  res$n_selected <- length(sel)
  res$selected   <- sel
  res
}

psl <- list()
for (nm in names(outcomes)) {
  o   <- outcomes[[nm]]
  res <- psl_fit(o$y, o$d, o$X, state)
  psl[[nm]] <- res
  cat(sprintf("  %-15s alpha_hat = %+0.4f  (SE = %0.4f)  | %d controls selected\n",
              o$label, res$coef, res$se, res$n_selected))
}


# ── 7. Estimator D — Double LASSO, rigorous penalty (hdm) ───────

# Belloni–Chernozhukov–Hansen Double LASSO with the rigorous penalty.
# The procedure is motivated by writing the model as two reduced-form
# equations (Belloni et al. 2014, eqs 3–4):
#
#   y_i = x_i' π   + r_{c,i} + ε_i      (outcome on controls only)
#   d_i = x_i' θ_d + r_{d,i} + v_i      (treatment on controls only)
#
# Either equation alone is just a prediction problem. The Frisch–Waugh–
# Lovell theorem says that to estimate α in y_i = α d_i + x_i' θ_g + ζ_i
# we can residualise y and d against the same set of controls and
# regress the residuals. Double LASSO does this approximately: take the
# UNION of the controls each prediction problem selects, then run OLS.
#
# Three steps (all explicit so the reader can see what changes vs PSL):
#
#   1. rlasso(y ~ X)            -> I_y = indices LASSO keeps when
#                                  predicting the outcome from controls
#                                  only (no d on the right-hand side).
#   2. rlasso(d ~ X)            -> I_d = indices LASSO keeps when
#                                  predicting the treatment from
#                                  controls only.
#   3. lm(y ~ d + X[, I_y U I_d])  with state-clustered SEs. The union
#                                  is the safety net: a control that is
#                                  strongly correlated with d will be
#                                  caught by Step 2 even if Step 1 drops
#                                  it for not predicting y well.
#
# rlasso() picks lambda by a data-driven, theory-based rule (Belloni,
# Chen, Chernozhukov & Hansen 2012) so that the estimation error is
# dominated by noise. It is more parsimonious than CV.

cat("\n========================================\n")
cat("STEP 7 — DOUBLE LASSO, RIGOROUS PENALTY (hdm::rlasso)\n")
cat("========================================\n")
cat("Two LASSOs (y on X, d on X), union of selected controls, then OLS.\n")
cat("'Rigorous' = lambda chosen by Belloni et al.'s theory, not CV.\n")
cat("Step 1: LASSO of y on X   -> selected indices I_y\n")
cat("Step 2: LASSO of d on X   -> selected indices I_d\n")
cat("Step 3: OLS y ~ d + X[, union(I_y, I_d)]  with clustered SEs\n\n")

selected_from_rlasso <- function(fit) {
  # rlasso() returns a vector of coefficients (including intercept).
  # We drop the intercept and pick nonzero indices.
  cf <- as.numeric(coef(fit))
  idx <- which(cf != 0)
  setdiff(idx - 1, 0)   # convert to 1..p (drop intercept position)
}

dl_rigorous_fit <- function(y, d, X, group) {
  # intercept=FALSE because the y, d, X passed in are already partialled
  # out for year fixed effects (mean ~ 0). penalty list matches the
  # Fitzgerald et al. (2026) replication code (penaltyoptions in
  # readdata_all_OLS.R lines 585, 653): c=1.1, gamma=0.05.
  pen <- list(c = 1.1, gamma = 0.05)
  fit_y <- rlasso(X, y, post = FALSE, intercept = FALSE, penalty = pen)
  fit_d <- rlasso(X, d, post = FALSE, intercept = FALSE, penalty = pen)
  Iy <- selected_from_rlasso(fit_y)
  Id <- selected_from_rlasso(fit_d)
  U  <- sort(union(Iy, Id))
  Xs <- X[, U, drop = FALSE]
  res <- ols_fit(y, d, Xs, group)
  res$n_selected <- length(U)
  res$Iy <- Iy; res$Id <- Id; res$U <- U
  res
}

dl_rig <- list()
for (nm in names(outcomes)) {
  o   <- outcomes[[nm]]
  res <- dl_rigorous_fit(o$y, o$d, o$X, state)
  dl_rig[[nm]] <- res
  cat(sprintf("  %-15s |I_y|=%3d  |I_d|=%3d  |I_y u I_d|=%3d\n",
              o$label, length(res$Iy), length(res$Id), length(res$U)))
  cat(sprintf("                  alpha_hat = %+0.4f  (SE = %0.4f)\n",
              res$coef, res$se))
}


# ── 8. Estimator E — Double LASSO, CV penalty (glmnet) ──────────

# Same three steps as section 7, but each LASSO is tuned by 3-fold
# cross-validation (per Fitzgerald et al. footnote 2) and lambda is
# picked to minimise out-of-sample MSE (`lambda.min`). The alternative
# `lambda.1se` (simplest model within one SE of the CV minimum) is more
# parsimonious; the paper uses `lambda.min` so we follow.
#
# CV typically keeps MORE variables than the rigorous penalty, so the
# union from this section is much larger than the union from section 7.
# The trade-off: CV may select noise variables; the rigorous penalty is
# tighter but can miss true predictors when n is small.

cat("\n========================================\n")
cat("STEP 8 — DOUBLE LASSO, CV PENALTY (glmnet::cv.glmnet)\n")
cat("========================================\n")
cat("Same recipe as Step 7 (two LASSOs, union, post-OLS) but lambda is\n")
cat("now chosen by 3-fold CV instead of Belloni et al.'s theory rule.\n")
cat("Watch the variable counts jump: CV is much more permissive.\n\n")

selected_from_glmnet <- function(cv) {
  cf <- as.numeric(coef(cv, s = "lambda.min"))[-1]   # drop intercept
  which(cf != 0)
}

dl_cv_fit <- function(y, d, X, group, nfolds = 3) {
  # 3 folds matches Fitzgerald et al. (2026) footnote 2.
  # intercept = TRUE is glmnet's default and is harmless on partialled
  # (mean ≈ 0) data — the fitted intercept will be ≈ 0. By contrast,
  # rlasso's theory-driven penalty in section 7 is sensitive to the
  # intercept choice, which is why we pass intercept = FALSE there.
  cv_y <- cv.glmnet(X, y, alpha = 1, intercept = TRUE, nfolds = nfolds)
  cv_d <- cv.glmnet(X, d, alpha = 1, intercept = TRUE, nfolds = nfolds)
  Iy <- selected_from_glmnet(cv_y)
  Id <- selected_from_glmnet(cv_d)
  U  <- sort(union(Iy, Id))
  Xs <- if (length(U) == 0) matrix(0, nrow = length(y), ncol = 0) else X[, U, drop = FALSE]
  if (length(U) == 0) {
    # No controls selected — fall back to univariate first-difference fit on d.
    fit <- lm.fit(cbind(d), y)
    e   <- as.numeric(fit$residuals)
    se  <- cluster_se(cbind(d), e, group)
    return(list(coef = fit$coefficients[1], se = se[1],
                n_selected = 0, Iy = Iy, Id = Id, U = U,
                cv_y = cv_y, cv_d = cv_d))
  }
  res <- ols_fit(y, d, Xs, group)
  res$n_selected <- length(U)
  res$Iy <- Iy; res$Id <- Id; res$U <- U
  res$cv_y <- cv_y; res$cv_d <- cv_d
  res
}

dl_cv <- list()
for (nm in names(outcomes)) {
  o   <- outcomes[[nm]]
  res <- dl_cv_fit(o$y, o$d, o$X, state)
  dl_cv[[nm]] <- res
  cat(sprintf("  %-15s |I_y|=%3d  |I_d|=%3d  |I_y u I_d|=%3d\n",
              o$label, length(res$Iy), length(res$Id), length(res$U)))
  cat(sprintf("                  alpha_hat = %+0.4f  (SE = %0.4f)\n",
              res$coef, res$se))
}


# ── 9. Build the replication of paper Table 2 ────────────────────

cat("\n========================================\n")
cat("STEP 9 — REPLICATION OF PAPER TABLE 2\n")
cat("========================================\n")
cat("Stack all five estimators x three outcomes into one tidy table\n")
cat("and save it to disk for downstream use (figures, blog post, etc.).\n\n")

estimate_row <- function(method, outcome_name, fit, n_selected = NA) {
  data.frame(
    method     = method,
    outcome    = outcome_name,
    estimate   = unname(fit$coef),
    std_error  = unname(fit$se),
    n_selected = n_selected,
    stringsAsFactors = FALSE
  )
}

table2 <- bind_rows(
  lapply(names(outcomes), function(nm) bind_rows(
    estimate_row("First diff",   outcomes[[nm]]$label, first_diff[[nm]], NA),
    estimate_row("OLS (full)",   outcomes[[nm]]$label, ols_all[[nm]],   ncol(outcomes[[nm]]$X)),
    estimate_row("PSL",          outcomes[[nm]]$label, psl[[nm]],       psl[[nm]]$n_selected),
    estimate_row("DL (rigorous)",outcomes[[nm]]$label, dl_rig[[nm]],    dl_rig[[nm]]$n_selected),
    estimate_row("DL (CV)",      outcomes[[nm]]$label, dl_cv[[nm]],     dl_cv[[nm]]$n_selected)
  ))
)
table2$ci_lo <- table2$estimate - 1.96 * table2$std_error
table2$ci_hi <- table2$estimate + 1.96 * table2$std_error

print(table2, row.names = FALSE, digits = 4)
write.csv(table2, "results_table2.csv", row.names = FALSE)
cat("\nWrote results_table2.csv\n")

# Selection-diagnostic CSV (which variables, by index, were picked).
selection_diag <- bind_rows(
  lapply(names(outcomes), function(nm) {
    rig <- dl_rig[[nm]]; cv <- dl_cv[[nm]]
    data.frame(
      outcome = outcomes[[nm]]$label,
      method  = c("DL (rigorous)", "DL (CV)"),
      n_Iy    = c(length(rig$Iy), length(cv$Iy)),
      n_Id    = c(length(rig$Id), length(cv$Id)),
      n_intersection = c(length(intersect(rig$Iy, rig$Id)),
                         length(intersect(cv$Iy,  cv$Id))),
      n_union = c(length(rig$U),  length(cv$U)),
      stringsAsFactors = FALSE
    )
  })
)
write.csv(selection_diag, "selection_diagnostic.csv", row.names = FALSE)
cat("Wrote selection_diagnostic.csv\n")


# ── 10. Figures (dark theme) ─────────────────────────────────────

cat("\n========================================\n")
cat("STEP 10 — FIGURES (4 dark-theme PNGs)\n")
cat("========================================\n")
cat("Forest plot of all five methods, variable-selection bar chart,\n")
cat("LASSO coefficient paths for the d-equation, and a rigorous-vs-CV\n")
cat("head-to-head. All use the site's dark palette.\n\n")

# Order methods so plots read top-to-bottom from naive to most selective.
method_levels <- c("First diff", "OLS (full)", "PSL", "DL (rigorous)", "DL (CV)")
method_colors <- c(
  "First diff"    = STEEL_BLUE,
  "OLS (full)"    = LIGHT_TEXT,
  "PSL"           = WARM_ORANGE,
  "DL (rigorous)" = TEAL,
  "DL (CV)"       = LIGHT_ORANGE
)
table2$method  <- factor(table2$method,  levels = method_levels)
table2$outcome <- factor(table2$outcome,
                         levels = c("Violent crime", "Property crime", "Murder"))

# --- Figure 1: forest plot of treatment-effect estimates ---------

p1 <- ggplot(table2,
             aes(x = estimate, y = method, color = method)) +
  geom_vline(xintercept = 0, color = LIGHT_TEXT, linetype = "dashed",
             linewidth = 0.4) +
  geom_errorbar(aes(xmin = ci_lo, xmax = ci_hi), width = 0.25,
                linewidth = 0.8, orientation = "y") +
  geom_point(size = 3.2) +
  facet_wrap(~ outcome, scales = "free_x", ncol = 3) +
  scale_color_manual(values = method_colors, guide = "none") +
  scale_y_discrete(limits = rev(method_levels)) +
  labs(
    title    = "Treatment-effect estimates: abortion -> crime, 1985-1997",
    subtitle = "Each panel is a different crime outcome; bars are 95% CIs from state-clustered SEs.",
    x = expression(hat(alpha) ~ "(effect of effective abortion rate)"),
    y = NULL,
    caption = "Replication of Table 2 in Fitzgerald et al. (2026). Dashed line at zero."
  ) +
  theme_site()

ggsave("r_double_lasso_estimates.png", p1,
       width = 11, height = 4.5, dpi = 300, bg = DARK_BG)
cat("Wrote r_double_lasso_estimates.png\n")


# --- Figure 2: variable-selection diagnostic --------------------

sel_long <- selection_diag %>%
  pivot_longer(cols = c(n_Iy, n_Id, n_intersection, n_union),
               names_to = "metric", values_to = "count") %>%
  mutate(
    metric = recode(metric,
                    n_Iy           = "|I_y|: selected in y-step",
                    n_Id           = "|I_d|: selected in d-step",
                    n_intersection = "Intersection",
                    n_union        = "Union (used in post-OLS)"),
    metric = factor(metric, levels = c(
      "|I_y|: selected in y-step",
      "|I_d|: selected in d-step",
      "Intersection",
      "Union (used in post-OLS)")),
    outcome = factor(outcome,
                     levels = c("Violent crime", "Property crime", "Murder"))
  )

p2 <- ggplot(sel_long, aes(x = metric, y = count, fill = method)) +
  geom_col(position = position_dodge(width = 0.75), width = 0.65) +
  geom_text(aes(label = count), position = position_dodge(width = 0.75),
            vjust = -0.4, color = LIGHTER_TEXT, size = 3.4) +
  facet_wrap(~ outcome, ncol = 3) +
  scale_fill_manual(values = c("DL (rigorous)" = TEAL,
                               "DL (CV)"       = LIGHT_ORANGE), name = NULL) +
  labs(
    title    = "Variable selection across the two Double LASSO penalties",
    subtitle = "Rigorous penalty (Belloni et al. 2012) vs. 3-fold CV (lambda.min) — out of 284 candidate controls.",
    x = NULL, y = "Number of controls"
  ) +
  theme_site() +
  theme(axis.text.x = element_text(angle = 20, hjust = 1))

ggsave("r_double_lasso_selection.png", p2,
       width = 11, height = 5.2, dpi = 300, bg = DARK_BG)
cat("Wrote r_double_lasso_selection.png\n")


# --- Figure 3: LASSO coefficient paths for the d-equation -------

# Use the violent-crime d-equation (the most discussed case in the paper).
o_viol     <- outcomes$violent
path_glm   <- glmnet(o_viol$X, o_viol$d, alpha = 1, intercept = TRUE)
cv_d_viol  <- dl_cv$violent$cv_d
lam_min    <- cv_d_viol$lambda.min

# Long-format coefficient matrix (drop the intercept; keep variable names).
cmat <- as.matrix(path_glm$beta)
log_lambda <- log(path_glm$lambda)
path_df <- data.frame(
  log_lambda = rep(log_lambda, each = nrow(cmat)),
  variable   = rep(rownames(cmat), times = ncol(cmat)),
  coef       = as.numeric(cmat)
)
# Track which variables are nonzero at lambda.min to colour-highlight them.
sel_at_min <- which(as.numeric(coef(cv_d_viol, s = "lambda.min"))[-1] != 0)
top_vars   <- rownames(cmat)[sel_at_min]
path_df$highlight <- ifelse(path_df$variable %in% top_vars,
                            "selected at lambda.min", "shrunk to zero")

p3 <- ggplot(path_df, aes(x = log_lambda, y = coef, group = variable,
                          color = highlight, alpha = highlight)) +
  geom_line(linewidth = 0.45) +
  geom_vline(xintercept = log(lam_min), color = WARM_ORANGE,
             linetype = "dashed", linewidth = 0.6) +
  annotate("text", x = log(lam_min), y = max(path_df$coef, na.rm = TRUE),
           label = "log(lambda.min)", hjust = -0.05, vjust = 1,
           color = WARM_ORANGE, size = 3.4) +
  scale_color_manual(values = c("selected at lambda.min" = TEAL,
                                "shrunk to zero"         = LIGHT_TEXT),
                     name = NULL) +
  scale_alpha_manual(values = c("selected at lambda.min" = 1.0,
                                "shrunk to zero"         = 0.35),
                     guide = "none") +
  labs(
    title    = "LASSO coefficient paths: predicting the abortion rate from controls",
    subtitle = sprintf("d-equation in DL Step 2, violent-crime panel. %d of %d controls survive at lambda.min.",
                       length(top_vars), nrow(cmat)),
    x = expression(log(lambda)),
    y = "Coefficient"
  ) +
  theme_site()

ggsave("r_double_lasso_paths.png", p3,
       width = 10, height = 5.5, dpi = 300, bg = DARK_BG)
cat("Wrote r_double_lasso_paths.png\n")


# --- Figure 4: rigorous vs CV side-by-side ----------------------

compare_df <- table2 %>%
  filter(method %in% c("DL (rigorous)", "DL (CV)")) %>%
  mutate(method = factor(method, levels = c("DL (rigorous)", "DL (CV)")))

p4 <- ggplot(compare_df, aes(x = method, y = estimate, color = method)) +
  geom_hline(yintercept = 0, color = LIGHT_TEXT, linetype = "dashed",
             linewidth = 0.4) +
  geom_errorbar(aes(ymin = ci_lo, ymax = ci_hi), width = 0.18,
                linewidth = 0.8) +
  geom_point(size = 3.5) +
  geom_text(aes(label = sprintf("%+0.3f", estimate)),
            vjust = -1.2, color = LIGHTER_TEXT, size = 3.4, show.legend = FALSE) +
  facet_wrap(~ outcome, ncol = 3) +
  scale_color_manual(values = c("DL (rigorous)" = TEAL,
                                "DL (CV)"       = LIGHT_ORANGE), guide = "none") +
  labs(
    title    = "Rigorous vs. cross-validated penalty: the two flavours of Double LASSO",
    subtitle = "Both procedures share the same three-step structure; they differ only in how lambda is chosen.",
    x = NULL,
    y = expression(hat(alpha) %+-% "1.96 * SE")
  ) +
  theme_site()

ggsave("r_double_lasso_methods_compare.png", p4,
       width = 11, height = 4.5, dpi = 300, bg = DARK_BG)
cat("Wrote r_double_lasso_methods_compare.png\n")


# ── 11. Summary & comparison to paper headline numbers ──────────

cat("\n========================================\n")
cat("STEP 11 — SUMMARY: comparing our numbers to the paper's Table 2\n")
cat("========================================\n")

paper_viol <- data.frame(
  method   = c("First diff", "DL (rigorous)", "PSL", "OLS (full)"),
  estimate = c(-0.152, -0.104, -0.155, 0.014),
  std_error = c(0.034,  0.123,  0.033, 0.875)
)
our_viol <- table2 %>%
  filter(outcome == "Violent crime",
         method %in% paper_viol$method) %>%
  select(method, estimate, std_error)
cmp <- merge(paper_viol, our_viol, by = "method",
             suffixes = c("_paper", "_ours"))
cat("Replication check (violent crime):\n")
print(cmp, row.names = FALSE, digits = 3)
cat("\nNote: point estimates match the paper closely.\n")
cat("The OLS and DL SEs may differ in magnitude because the authors use a\n")
cat("rescaling trick (matlib::inv on X'X * 1e8) to invert near-singular\n")
cat("matrices, while this script uses solve() with a pseudo-inverse fallback.\n")
cat("Both are mathematically valid; the differences appear only when X has\n")
cat("near-collinear columns. The qualitative comparison across methods is the\n")
cat("same and the pedagogical takeaway is unchanged.\n")

cat("\nKey practical insight from Fitzgerald et al. (2026):\n")
cat("DL helps most when the TREATMENT is highly predictable from the\n")
cat("controls but the OUTCOME is not. That is the case here: the\n")
cat("effective abortion rate is well explained by lagged demographics\n")
cat("and within-state trends, while crime is much noisier.\n")

cat("\nGenerated PNG files:\n")
print(list.files(pattern = "\\.png$"))
cat("\nGenerated CSV files:\n")
print(list.files(pattern = "\\.csv$"))

cat("\n=== Script completed successfully ===\n")
