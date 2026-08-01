# ══════════════════════════════════════════════════════════════════════════════
# Seven synthetic-control estimators in one page
#
# The minimum code that produces a treatment effect from each rung of the
# ladder, on the Brexit data. No figures, no diagnostics, no explanation --
# for those, see analysis.R and the post:
#     https://carlos-mendez.org/post/r_sc_dsc_sdid/
#
# Everything loads over HTTPS. Nothing is written to disk.
#
# Usage:    Rscript cheatsheet.R
# Run time: about 30 seconds
# Needs:    quadprog (CRAN); optionally synthdid, masc, augsynth (GitHub)
# ══════════════════════════════════════════════════════════════════════════════

library(quadprog)
has <- function(p) requireNamespace(p, quietly = TRUE)

# ── Data ──────────────────────────────────────────────────────────────────────
URL <- paste0("https://raw.githubusercontent.com/cmg777/starter-academic-v501/",
              "master/content/post/r_sc_dsc_sdid/brexit_analysis.csv")
d <- read.csv(if (file.exists("brexit_analysis.csv")) "brexit_analysis.csv" else URL)

CT  <- unique(d$country[order(d$unit_id)])          # 24 countries, alphabetical
Y   <- matrix(d$log_rgdp[order(d$unit_id, d$t)],    # [104 quarters x 24 countries]
              nrow = 104, dimnames = list(NULL, CT))
UK  <- which(CT == "United Kingdom")                # treated unit
DON <- setdiff(seq_along(CT), UK)                   # 23 donors
T0  <- 86                                           # pre-treatment quarters (to 2016Q2)
E   <- c(`2018Q4` = 96, `2019Q4` = 100)             # evaluation quarters

Z1 <- Y[1:T0, UK]                                   # treated pre-treatment path
Z0 <- Y[1:T0, DON]                                  # donor  pre-treatment paths

# Reported as a percentage GDP LOSS: positive means the UK came in below the
# counterfactual. `b` is the bias-adjustment term, zero for estimators without one.
loss <- function(w, b = 0) -100 * (Y[E, UK] - Y[E, DON] %*% w - b)

out <- function(name, w, b = 0, note = "") {
  v <- loss(w, b)
  cat(sprintf("%-14s  2018Q4 %5.2f   2019Q4 %5.2f   %s\n", name, v[1], v[2], note))
  invisible(NULL)
}

# ── The one solver every rung needs ───────────────────────────────────────────
# minimise ||b - A w||^2  subject to  w >= 0 and sum(w) = 1
simplex_ls <- function(A, b) {
  k <- ncol(A)
  w <- solve.QP(crossprod(A) + 1e-10 * diag(k), crossprod(A, b),
                cbind(rep(1, k), diag(k)), c(1, rep(0, k)), meq = 1)$solution
  w[w < 1e-10] <- 0
  w / sum(w)
}

cat("\nBrexit: estimated shortfall in UK real GDP (%), treatment dated 2016Q3\n")
cat(strrep("-", 74), "\n")

# ── 0. DiD ────────────────────────────────────────────────────────────────────
# Every donor counts the same; a unit fixed effect absorbs the level gap.
w_did <- rep(1 / length(DON), length(DON))
out("DiD", w_did, mean(Z1 - Z0 %*% w_did), "uniform weights")

# ── 1. SC ─────────────────────────────────────────────────────────────────────
# Weights on the simplex, chosen to track the treated unit's pre-treatment path.
# No intercept: the blend must match the UK's level as well as its shape.
w_sc <- simplex_ls(Z0, Z1)
out("SC", w_sc, 0, "simplex least squares")

# ── 2. DSC ────────────────────────────────────────────────────────────────────
# Same problem on demeaned outcomes -- each COUNTRY minus its own pre-period
# mean -- plus the average pre-treatment gap added back as a constant.
w_dsc <- simplex_ls(sweep(Z0, 2, colMeans(Z0)), Z1 - mean(Z1))
b_dsc <- mean(Z1 - Z0 %*% w_dsc)
out("DSC", w_dsc, b_dsc, sprintf("bias adjustment %+.4f", b_dsc))

# ── 3. SDID ───────────────────────────────────────────────────────────────────
# Identical unit weights to DSC. The only change is the bias adjustment: a
# lambda-weighted average of pre-treatment gaps instead of a flat one.
#
# The time weights are the SAME problem on the transpose -- donors as rows,
# quarters as columns -- demeaned across DONORS rather than across quarters.
# A has donors as ROWS and quarters as COLUMNS, each quarter demeaned across donors.
A_lam  <- sweep(t(Z0), 2, colMeans(t(Z0)))
lambda <- simplex_ls(A_lam, Y[T0 + 1, DON] - mean(Y[T0 + 1, DON]))
b_sdid <- drop(lambda %*% (Z1 - Z0 %*% w_dsc))
out("SDID (i)", w_dsc, b_sdid,
    sprintf("%.0f%% of lambda on the last pre-quarter", 100 * lambda[T0]))

# ── 4. MASC ───────────────────────────────────────────────────────────────────
# A cross-validated blend of m-nearest-neighbour matching and SC.
nn <- function(Z0, Z1, m) {
  s <- colSums((Z1 - Z0)^2) %in% sort(colSums((Z1 - Z0)^2))[1:m]
  as.numeric(s) / sum(s)
}
# Rolling-origin CV: refit on quarters 1..k, forecast k+1, score. phi is closed form.
# NOTE the fold set. Passing masc's `min_preperiods` argument to current package
# master yields only 5 folds and selects phi = 1 (pure matching), which does not
# reproduce the published result. Folds must run from 6 to T0 - 1.
set_f <- 6:(T0 - 1)
wt    <- rep(1 / length(set_f), length(set_f))
ysc   <- vapply(set_f, function(k) drop(Z0[k+1, ] %*% simplex_ls(Z0[1:k, ], Z1[1:k])), 0)
ytr   <- Z1[set_f + 1]
cv <- do.call(rbind, lapply(1:10, function(m) {
  ymt <- vapply(set_f, function(k) drop(Z0[k+1, ] %*% nn(Z0[1:k, ], Z1[1:k], m)), 0)
  phi <- min(1, max(0, drop((wt*(ytr-ysc)) %*% (ymt-ysc) / ((wt*(ymt-ysc)) %*% (ymt-ysc)))))
  data.frame(m = m, phi = phi, cv = sum(wt * (ytr - phi*ymt - (1-phi)*ysc)^2))
}))
best   <- cv[which.min(cv$cv), ]
w_masc <- best$phi * nn(Z0, Z1, best$m) + (1 - best$phi) * w_sc
out("MASC", w_masc, 0, sprintf("m = %d, phi = %.3f", best$m, best$phi))

# ── 5. ASCM ───────────────────────────────────────────────────────────────────
# SC weights plus a ridge-predicted correction for the residual pre-treatment
# imbalance. Non-negativity is dropped, so weights may go negative.
#
# The ridge parameter is chosen by cross-validation, not by hand. augsynth picks
# it leave-one-period-out; 0.13858 is what it selects here. Feed that value in
# and this closed form reproduces the package exactly.
ascm <- function(lr) {
  Xc  <- sweep(t(Z0), 2, colMeans(t(Z0)))
  x1c <- Z1 - colMeans(t(Z0))
  as.numeric(w_sc + solve(tcrossprod(Xc) + lr * diag(length(DON)),
                          Xc %*% (x1c - crossprod(Xc, w_sc))))
}
w_ascm <- ascm(0.13858)
out("ASCM", w_ascm, 0, sprintf("%d negative weights", sum(w_ascm < 0)))

# ── The same rungs, via their packages ────────────────────────────────────────
cat(strrep("-", 74), "\n")

if (has("synthdid")) {
  Ysd <- t(cbind(Y[1:(T0+1), DON], Y[1:(T0+1), UK]))     # units x time, treated LAST
  # T0 here is the NUMBER of pre-periods, not the period index. zeta.* = 0 turns
  # off the ridge penalty; the intercepts switch SC into DSC/SDID.
  p_sc  <- synthdid::synthdid_estimate(Ysd, N0 = 23, T0 = T0, zeta.omega = 0,
                                       zeta.lambda = 0, omega.intercept = FALSE,
                                       lambda.intercept = FALSE)
  p_sd  <- synthdid::synthdid_estimate(Ysd, N0 = 23, T0 = T0, zeta.omega = 0,
                                       zeta.lambda = 0, omega.intercept = TRUE,
                                       lambda.intercept = TRUE)
  o_sc <- attr(p_sc, "weights")$omega
  o_sd <- attr(p_sd, "weights")$omega
  l_sd <- attr(p_sd, "weights")$lambda
  out("SC   synthdid", o_sc)
  out("DSC  synthdid", o_sd, mean(Z1 - Z0 %*% o_sd))
  out("SDID synthdid", o_sd, drop(l_sd %*% (Z1 - Z0 %*% o_sd)))
} else cat("SC/DSC/SDID  skipped: remotes::install_github('synth-inference/synthdid')\n")

if (has("masc")) {
  # masc's own no-Gurobi path is broken, but sc_est is a documented hook.
  sc_hook <- function(treated, donors, treated.covariates, donors.covariates, treatment, ...)
    list(solution.w = simplex_ls(as.matrix(donors)[1:(treatment-1), , drop = FALSE],
                                 as.numeric(unlist(treated))[1:(treatment-1)]),
         loss.w = NA_real_, solution.v = NULL, loss.v = NULL)
  m <- masc::masc(treated = matrix(Y[, UK], ncol = 1), donors = Y[, DON],
                  treatment = T0 + 1, sc_est = sc_hook,
                  tune_pars_list = list(m = 1:10, set_f = 6:T0))
  out("MASC package", as.numeric(m$weights), 0,
      sprintf("m = %d, phi = %.3f", m$m_hat, m$phi_hat))
} else cat("MASC         skipped: see the install note in analysis.R\n")

if (has("augsynth")) {
  ad <- data.frame(unitnum = rep(1:24, each = T0 + 1), t = rep(1:(T0 + 1), 24),
                   value = as.vector(Y[1:(T0 + 1), c(UK, DON)]))
  ad$treatment <- as.integer(ad$unitnum == 1 & ad$t == T0 + 1)
  a <- suppressMessages(augsynth::augsynth(value ~ treatment, unitnum, t, ad,
                                           progfunc = "Ridge", scm = TRUE))
  out("ASCM package", as.numeric(a$weights), 0,
      sprintf("lambda %.5f, |hand-pkg| %.1e", a$lambda,
              max(abs(ascm(a$lambda) - as.numeric(a$weights)))))
} else cat("ASCM         skipped: remotes::install_github('ebenmichael/augsynth')\n")

cat(strrep("-", 74), "\n")
cat("Born et al. (2019) reported 2.4% at 2018Q4 and 3.6% at 2019Q4.\n")
cat("The hand-coded SC prints about 3.04 where the paper prints 3.06: the package\n")
cat("solves the same problem with a capped Frank-Wolfe budget on a nearly flat\n")
cat("objective. See section 5 of the post -- the gap is the lesson, not a bug.\n\n")
