# ══════════════════════════════════════════════════════════════════════════════
# THE FRISCH-WAUGH-LOVELL THEOREM IN R — a one-page cheat sheet
#
# Companion to https://carlos-mendez.org/post/python_fwl/
# Companions:  cheatsheet_python.py   cheatsheet_stata.do
#              analysis.do (the full Stata port)   script.py (the post's script)
#
# The R port of cheatsheet_python.py: same CSV, same sections, same comparison
# table at the end, so the three files can be read side by side.
#
# Install:
#   install.packages(c("fixest", "fwlplot", "ggplot2"))
#   (all three are optional: the sheet runs on base R and skips what is missing)
#
# Usage:     Rscript cheatsheet_R.R
# Run time:  about 3 seconds. Plots go to a null device under Rscript, so
#            nothing is written to disk; run interactively to see them.
# Verified with: Python 3.13 / R 4.5 / Stata 19
#                (fixest 0.14, fwlplot 0.3, ggplot2 4.0)
#
# Contents
#   0.  Vocabulary in thirty seconds
#   1.  Load the data (local copy, then URL) or simulate it natively
#   2.  Naive vs full
#   3.  The OVB identity (and the direction trap)
#   4.  FWL in three lines
#   5.  FWL by hand
#   6.  Standard errors: the intercept trap and the df correction
#   7.  Multiple controls
#   8.  The partialled-out plot
#   9.  Fixed effects are FWL too
#   10. Traps that silently give wrong answers
#   Comparison table (identical in all three cheat sheets)
# ══════════════════════════════════════════════════════════════════════════════

USE_R_SIMULATION <- FALSE   # TRUE = R's own set.seed(42) draw (numbers will differ)

f4 <- function(x) sprintf("%.4f", x)
se_of <- function(fit, term) summary(fit)$coefficients[term, "Std. Error"]
p_of  <- function(fit, term) summary(fit)$coefficients[term, "Pr(>|t|)"]


# ── 0. Vocabulary in thirty seconds ──────────────────────────────────────────
#
#   Partialling-out ..... regress X1 on the controls and keep the residual: the
#                         part of X1 the controls cannot predict. Also called
#                         residualizing or orthogonalizing.
#   FWL theorem ......... the coefficient on X1 in  y ~ X1 + X2  equals the slope
#                         of resid(y ~ X2) on resid(X1 ~ X2). Exactly, in every
#                         sample, not approximately.
#   Annihilator M2 ...... I - X2 (X2'X2)^-1 X2'. Multiplying by M2 = taking the
#                         residuals on X2 (constant included). Symmetric and
#                         idempotent.
#   OVB ................. naive - full = gamma_hat * delta_hat. gamma_hat is the
#                         omitted variable's coefficient in the full model;
#                         delta_hat is the slope of the OMITTED variable regressed
#                         ON the INCLUDED one.
#   Uncorrelated ........ zero LINEAR association. Residuals are uncorrelated with
#                         the controls by construction, not independent of them.
#   Residual df ......... n minus the parameters estimated. The short FWL
#                         regression does not know you already estimated the
#                         controls, so its df is too large.


# ── 1. Load the data (local copy, then URL) or simulate it natively ──────────
# 50 fast-food restaurants, one per neighborhood; each hands out 100 coupons in
# one day. coupons = % of them redeemed that month; sales = monthly sales ($000).
# income ~ N(50, 10), dayofweek ~ U{1..7},
# coupons = 60 - 0.5 income + N(0, 5),
# sales   = 10 + 0.2 coupons + 0.3 income + 0.5 dayofweek + N(0, 3).
# The true coupon effect is +0.2.

URL <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_fwl/data/fwl_store_data.csv"

# NUMBERS WILL DIFFER. Same DGP, but R's Mersenne Twister is not numpy's PCG64,
# so set.seed(42) here draws different restaurants from the post's. Use it to see
# that FWL holds in ANY sample, not to reproduce the post.
simulate_store_data_r <- function(n = 50, seed = 42) {
  set.seed(seed)
  income    <- rnorm(n, 50, 10)
  dayofweek <- sample.int(7, n, replace = TRUE)
  coupons   <- 60 - 0.5 * income + rnorm(n, 0, 5)
  sales     <- 10 + 0.2 * coupons + 0.3 * income + 0.5 * dayofweek + rnorm(n, 0, 3)
  data.frame(sales = round(sales, 2), coupons = round(coupons, 2),
             income = round(income, 2), dayofweek = dayofweek)
}

load_store_data <- function() {
  # The Quarto zip ships the CSV flat; the post folder keeps it under data/.
  local <- c("fwl_store_data.csv", "data/fwl_store_data.csv")
  local <- local[file.exists(local)]
  src <- if (length(local)) local[1] else URL
  d <- tryCatch(read.csv(src), error = function(e) NULL)
  if (is.null(d)) {
    message("Could not read ", src, "; using simulate_store_data_r() instead")
    return(list(d = simulate_store_data_r(), src = "R simulation (offline)"))
  }
  list(d = d, src = src)
}

if (USE_R_SIMULATION) {
  ld <- list(d = simulate_store_data_r(), src = "R simulation, set.seed(42)")
} else {
  ld <- load_store_data()
}
d <- ld$d
POST_DATA <- !grepl("simulation", ld$src)
cat("Loaded:", ld$src, "-", nrow(d), "x", ncol(d), "\n")
stopifnot(nrow(d) == 50, identical(names(d), c("sales", "coupons", "income", "dayofweek")))

sim <- simulate_store_data_r()
cat("Native R simulation (numbers will differ): naive",
    f4(coef(lm(sales ~ coupons, sim))["coupons"]), " full",
    f4(coef(lm(sales ~ coupons + income, sim))["coupons"]), "\n")


# ── 2. Naive vs full ─────────────────────────────────────────────────────────

naive <- lm(sales ~ coupons, data = d)
full  <- lm(sales ~ coupons + income, data = d)

cat("\nNaive ", f4(coef(naive)["coupons"]), " SE", f4(se_of(naive, "coupons")),
    " p", sprintf("%.3f", p_of(naive, "coupons")), "\n")     # -0.1059, 0.1158, 0.365
cat("Full  ", f4(coef(full)["coupons"]), " SE", f4(se_of(full, "coupons")),
    " p", sprintf("%.3f", p_of(full, "coupons")), "\n")      #  0.2673, 0.1203, 0.031
cat("Income in the full model:", f4(coef(full)["income"]), "\n")   # 0.3836
# The sign flips: rich neighborhoods use fewer coupons AND buy more.


# ── 3. The OVB identity (and the direction trap) ─────────────────────────────
# naive - full = gamma_hat * delta_hat holds EXACTLY in the sample.

gamma_hat <- coef(full)[["income"]]
delta_hat <- coef(lm(income ~ coupons, data = d))[["coupons"]]   # omitted ON included
gap <- coef(naive)[["coupons"]] - coef(full)[["coupons"]]
stopifnot(abs(gap - gamma_hat * delta_hat) < 1e-12)
cat("\nOVB:", f4(gamma_hat), "x", f4(delta_hat), "=", f4(gamma_hat * delta_hat),
    " =  naive - full =", f4(gap), "\n")            # 0.3836 x -0.9730 = -0.3732

# THE TRAP: coupons ON income is FWL's first regression, so it is the one you
# have lying around. It is the wrong direction for OVB and reconciles nothing.
wrong <- coef(lm(coupons ~ income, data = d))[["income"]]
cat("Wrong direction:", f4(gamma_hat), "x", f4(wrong), "=", f4(gamma_hat * wrong), "\n")
# -0.3935 -> -0.151

# Population version: Var(coupons) = 0.25*100 + 25 = 50, Cov(income, coupons)
# = -0.5*100 = -50, so delta = -1.0 and plim naive = 0.2 + 0.3*(-1.0) = -0.10.


# ── 4. FWL in three lines ────────────────────────────────────────────────────

d$c_t <- resid(lm(coupons ~ income, data = d))    # coupons, income removed
d$s_t <- resid(lm(sales ~ income, data = d))      # sales, income removed
fwl   <- lm(s_t ~ 0 + c_t, data = d)              # residual on residual

stopifnot(abs(coef(fwl)[["c_t"]] - coef(full)[["coupons"]]) < 1e-12,
          isTRUE(all.equal(unname(resid(fwl)), unname(resid(full)))))   # same residuals
cat("\nFWL (residualize both):", f4(coef(fwl)[["c_t"]]), " SE", f4(se_of(fwl, "c_t")), "\n")
# 0.2673, SE 0.1178

# c_t is uncorrelated with income by construction (0 to machine precision):
cat("corr(c_t, income) =", format(cor(d$c_t, d$income), digits = 2), "\n")


# ── 5. FWL by hand ───────────────────────────────────────────────────────────
# The constant belongs to the controls: X2 = [1, income].

n  <- nrow(d)
y  <- d$sales
x1 <- d$coupons
X2 <- cbind(1, d$income)
M2 <- diag(n) - X2 %*% solve(crossprod(X2), t(X2))           # annihilator
stopifnot(isTRUE(all.equal(M2 %*% M2, M2)), isTRUE(all.equal(M2, t(M2))))

beta_matrix <- drop(crossprod(x1, M2 %*% y) / crossprod(x1, M2 %*% x1))
cv <- cov(drop(M2 %*% y), drop(M2 %*% x1))
vr <- var(drop(M2 %*% x1))                                    # n - 1, cancels anyway
cat("\nCov / Var =", f4(cv), "/", f4(vr), "=", f4(cv / vr), "\n")   # 3.9380 / 14.7320
stopifnot(abs(beta_matrix - coef(full)[["coupons"]]) < 1e-12,
          abs(cv / vr - coef(full)[["coupons"]]) < 1e-12)


# ── 6. Standard errors: the intercept trap and the df correction ─────────────
# Same coefficient, 0.2673, in every row. Very different standard errors.

s1  <- lm(sales ~ 0 + c_t, data = d)                          # Step 1: X only
s1c <- lm(sales ~ c_t, data = d)                              # ... + intercept
s1d <- lm(I(sales - mean(sales)) ~ 0 + c_t, data = d)         # ... demeaned y
ladder <- c("Step 1, no intercept"     = se_of(s1, "c_t"),    # 1.2715
            "Step 1 + intercept"       = se_of(s1c, "c_t"),   # 0.1437
            "Step 1, demeaned sales"   = se_of(s1d, "c_t"),   # 0.1422
            "Step 2, residualize both" = se_of(fwl, "c_t"),   # 0.1178
            "Full model"               = se_of(full, "coupons"))  # 0.1203
cat("\n")
for (k in names(ladder)) cat(sprintf("  %-26s%s\n", k, f4(ladder[[k]])))

# (a) The blow-up is the DROPPED INTERCEPT, not "outcome variance not yet
#     adjusted": sales has mean 33.6, a no-intercept line must pass through
#     the origin, and the whole level of sales lands in the residuals. Putting
#     the intercept back closes about 98% of the gap.
# (b) Step 2 has the full model's residuals but divides their sum of squares
#     by 49 instead of 47: the full model also estimated an intercept and
#     income. Rescale by sqrt(49/47) and you are back to 0.1203.
se_fixed <- se_of(fwl, "c_t") * sqrt(49 / 47)
stopifnot(abs(se_fixed - se_of(full, "coupons")) < 1e-12)
cat("  Step 2 x sqrt(49/47) =", f4(se_fixed), "\n")             # 0.1203


# ── 7. Multiple controls ─────────────────────────────────────────────────────

full2 <- lm(sales ~ coupons + income + dayofweek, data = d)
c2 <- resid(lm(coupons ~ income + dayofweek, data = d))
s2 <- resid(lm(sales ~ income + dayofweek, data = d))
fwl2 <- lm(s2 ~ 0 + c2)
stopifnot(abs(coef(fwl2)[["c2"]] - coef(full2)[["coupons"]]) < 1e-12,
          abs(se_of(fwl2, "c2") * sqrt(49 / 46) - se_of(full2, "coupons")) < 1e-12)
cat("\nTwo controls: full", f4(coef(full2)[["coupons"]]),
    paste0("(SE ", f4(se_of(full2, "coupons")), "),"),
    "FWL", f4(coef(fwl2)[["c2"]]), paste0("(SE ", f4(se_of(fwl2, "c2")), ")"), "\n")
# 0.2706 both ways; SE 0.1194 vs 0.1157, and 0.1157 x sqrt(49/46) = 0.1194.

# Why 0.2673 -> 0.2706: the OVB identity again, one control up. dayofweek moves
# sales (0.3195) but, holding income fixed, is almost unrelated to coupons
# (slope -0.0101, partial corr -0.021), so the two coefficients differ by only
# 0.3195 x (-0.0101) = -0.0032 = 0.2673 - 0.2706. The raw corr (-0.076) is not
# the relevant quantity.
g_dow <- coef(full2)[["dayofweek"]]
d_dow <- coef(lm(dayofweek ~ coupons + income, data = d))[["coupons"]]
dow_t <- resid(lm(dayofweek ~ income, data = d))
stopifnot(abs(coef(full)[["coupons"]] - coef(full2)[["coupons"]] - g_dow * d_dow) < 1e-12)
cat(f4(coef(full)[["coupons"]]), "-", f4(coef(full2)[["coupons"]]),
    "= gamma_dow x delta_dow =", f4(g_dow), "x", f4(d_dow), "=", f4(g_dow * d_dow), "\n")
cat("partial corr(dayofweek, coupons | income) =",                     # -0.021
    sprintf("%.3f", cor(dow_t, d$c_t)),
    "  (raw corr", sprintf("%.3f)", cor(d$dayofweek, d$coupons)), "\n")  # -0.076


# ── 8. The partialled-out plot ───────────────────────────────────────────────
# Add the means back so the axes are in real units; the slope is unchanged.

if (!interactive()) pdf(NULL)          # Rscript: draw to a null device

d$cs <- d$c_t + mean(d$coupons)
d$ss <- d$s_t + mean(d$sales)
b_scaled <- coef(lm(ss ~ cs, data = d))[["cs"]]
stopifnot(abs(b_scaled - coef(full)[["coupons"]]) < 1e-12)

if (requireNamespace("ggplot2", quietly = TRUE)) {
  library(ggplot2)
  p <- ggplot(d, aes(cs, ss)) +
    geom_point(color = "#6a9bcc", size = 2.5) +
    geom_smooth(method = "lm", formula = y ~ x, se = FALSE, color = "#d97757") +
    labs(x = "Coupon redemption rate (%, income partialled out + mean)",
         y = "Monthly sales (thousands, income partialled out + mean)",
         title = "The FWL plot: what 'controlling for income' looks like",
         subtitle = paste("slope =", f4(b_scaled))) +
    theme_minimal()
  print(p)
} else {
  plot(d$cs, d$ss, pch = 19, col = "#6a9bcc"); abline(lm(ss ~ cs, data = d), col = "#d97757")
}

# fwlplot does the residualizing for you: y ~ x + controls.
if (requireNamespace("fwlplot", quietly = TRUE)) {
  fwlplot::fwl_plot(sales ~ coupons + income, data = d)
  cat("fwlplot::fwl_plot(sales ~ coupons + income) drawn\n")
}


# ── 9. Fixed effects are FWL too ─────────────────────────────────────────────
# Seven day-of-week dummies are just seven controls. Partialling them out is
# subtracting the day mean ("within" transformation), which is what fixest,
# pyfixest and reghdfe do under the hood. This is a DIFFERENT model from
# section 7 (day as categories, not a linear trend), so the coefficient differs.

dummies <- lm(sales ~ coupons + income + factor(dayofweek), data = d)
w <- within(d, {
  sales   <- sales   - ave(sales,   dayofweek)
  coupons <- coupons - ave(coupons, dayofweek)
  income  <- income  - ave(income,  dayofweek)
})
wfit <- lm(sales ~ 0 + coupons + income, data = w)
stopifnot(abs(coef(wfit)[["coupons"]] - coef(dummies)[["coupons"]]) < 1e-12,
          # df trap again: 50 - 2 = 48 within, 50 - 9 = 41 with dummies
          abs(se_of(wfit, "coupons") * sqrt(48 / 41) - se_of(dummies, "coupons")) < 1e-12)
cat("\nDay FE: dummies", f4(coef(dummies)[["coupons"]]),
    paste0("(SE ", f4(se_of(dummies, "coupons")), "),"),
    "within", f4(coef(wfit)[["coupons"]]),
    paste0("(SE ", f4(se_of(wfit, "coupons")), " before df fix)"), "\n")

if (requireNamespace("fixest", quietly = TRUE)) {
  fe <- fixest::feols(sales ~ coupons + income | dayofweek, data = d, vcov = "iid")
  stopifnot(abs(coef(fe)[["coupons"]] - coef(dummies)[["coupons"]]) < 1e-10,
            abs(fixest::se(fe)[["coupons"]] - se_of(dummies, "coupons")) < 1e-10)
  cat("fixest feols(... | dayofweek):", f4(coef(fe)[["coupons"]]),
      paste0("(SE ", f4(fixest::se(fe)[["coupons"]]), "), df already corrected"), "\n")
} else {
  cat("fixest not installed; skipping (install.packages(\"fixest\"))\n")
}


# ── 10. Traps that silently give wrong answers ───────────────────────────────
#
#  1. WRONG OVB DIRECTION. delta_hat is the omitted variable ON the included
#     one (income ~ coupons: -0.9730). The FWL-shaped regression coupons ~
#     income (-0.3935) gives -0.151 and reconciles nothing. See section 3.
#
#  2. DROPPING THE INTERCEPT WHEN THE OUTCOME IS NOT RESIDUALIZED.
#     lm(sales ~ 0 + c_t) returns the right coefficient with a standard error
#     ten times too big (1.2715 vs 0.1203). Keep the intercept or residualize
#     y as well.
#
#  3. FORGETTING THE DF CORRECTION. Residual-on-residual SEs divide by n - 1;
#     the full model divides by n - k. Harmless with one control (0.1178 vs
#     0.1203), severe with many fixed effects. Multiply by sqrt((n-1)/(n-k)),
#     or let fixest/pyfixest/reghdfe do it.
#
#  4. "UNCORRELATED" IS NOT "INDEPENDENT". Residualizing removes the LINEAR
#     association with the controls and nothing else. Demo below: a pure
#     function of income, residualized on income, is uncorrelated with income
#     yet still almost entirely determined by it.
#
#  5. LINEAR RESIDUALIZATION CANNOT FIX A MISSPECIFIED OUTCOME EQUATION. If
#     sales has a nonlinear income term that the linear control misses AND
#     that term moves with coupons beyond linear income, FWL reproduces the
#     misspecified full regression exactly, bias included (post Exercise 7b:
#     0.127 vs 0.2). A curve only in the coupon equation is harmless (7a:
#     0.200). FWL is algebra, not identification. Add the missing term, or let
#     Double Machine Learning do both partialling-out regressions with
#     flexible learners and cross-fitting.
#
#  6. THE CONSTANT IS A CONTROL. Residualize with the same control set as the
#     full model, intercept included. lm(coupons ~ 0 + income) answers a
#     different question.
#
#  7. SAME ROWS EVERYWHERE. A missing value in ANY model variable makes the
#     auxiliary regressions run on different samples: coupons ~ income keeps
#     rows that sales ~ income drops. With na.action = na.exclude the
#     residuals line up by row and the slope is silently wrong; with the
#     default na.omit you get a length error at best. Drop incomplete rows
#     once, before step 1.
#
#  8. STATA FLOAT IMPORT. import delimited without asdouble stores 37.37 as
#     37.369998931884766. Coefficients drift in the 7th decimal: invisible at
#     4 decimals, fatal to any exact cross-language check.
#
#  9. FE DEFAULT STANDARD ERRORS HAVE CHANGED BETWEEN VERSIONS (older fixest
#     clustered by the first fixed effect). Always pass vcov = explicitly.

q   <- (d$income - mean(d$income))^2                 # a function of income
q_t <- resid(lm(q ~ d$income))
cat("\nTrap 4: corr(q_t, income) =", format(cor(q_t, d$income), digits = 2),
    " corr(q_t, q) =", sprintf("%.3f", cor(q_t, q)), "\n")


# ── Comparison table (identical in all three cheat sheets) ───────────────────
# The Python and Stata columns are what cheatsheet_python.py and
# cheatsheet_stata.do print. They equal the R column to every printed digit
# because all three read the same CSV; this file checks its own column
# against them.

REFERENCE <- data.frame(   # row, coefficient, SE (fwl_results.json)
  row  = c("Naive (no controls)", "Full (+ income)", "Step 1 (no intercept)",
           "Step 1 + intercept", "Step 2 (resid. both)", "Two controls (full)"),
  coef = c(-0.1059, 0.2673, 0.2673, 0.2673, 0.2673, 0.2706),
  se   = c(0.1158, 0.1203, 1.2715, 0.1437, 0.1178, 0.1194))
LIVE <- rbind(c(coef(naive)[["coupons"]], se_of(naive, "coupons")),
              c(coef(full)[["coupons"]],  se_of(full, "coupons")),
              c(coef(s1)[["c_t"]],        se_of(s1, "c_t")),
              c(coef(s1c)[["c_t"]],       se_of(s1c, "c_t")),
              c(coef(fwl)[["c_t"]],       se_of(fwl, "c_t")),
              c(coef(full2)[["coupons"]], se_of(full2, "coupons")))

cell <- function(b, se) sprintf("%7.4f (%6.4f)", b, se)

cat("\nCoupon coefficient (SE): 50 restaurants, one CSV, three languages\n")
cat(strrep("-", 78), "\n", sep = "")
cat(sprintf("%-24s%-18s%-18s%s\n", "Row", "Python", "R", "Stata"))
cat(strrep("-", 78), "\n", sep = "")
for (i in seq_len(nrow(REFERENCE))) {
  ref  <- cell(REFERENCE$coef[i], REFERENCE$se[i])
  live <- cell(LIVE[i, 1], LIVE[i, 2])
  if (POST_DATA) stopifnot(identical(live, ref))
  cat(sprintf("%-24s%-18s%-18s%s\n", REFERENCE$row[i], ref, live, ref))
}
cat(strrep("-", 78), "\n", sep = "")
cat("Every row: the same coefficient in all three languages. Rows 2-5: the\n")
cat("same coefficient, four different standard errors (sections 4 and 6).\n")
if (!POST_DATA) cat("(R simulation in use: the R column is NOT the post's data.)\n")
