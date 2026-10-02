# ══════════════════════════════════════════════════════════════════════════════
# PANEL DATA METHODS IN R: a one-page cheat sheet
#
# Companion to https://carlos-mendez.org/post/python_panel_intro/
# Companions:  cheatsheet_python.py   cheatsheet_stata.do   script.py (the post's script)
#
# The R port of cheatsheet_python.py: same CSV, same sections, same comparison
# table at the end, so the three files can be read side by side.
#
# Install:
#   install.packages(c("fixest", "plm"))     # plm brings sandwich and lmtest
#
# Usage:     Rscript cheatsheet_R.R
# Run time:  about 20 seconds (mostly the 2,199-dummy lm()). Plots go to a
#            null device under Rscript, so nothing is written to disk; run
#            interactively to see them.
# Verified with: Python 3.13 / R 4.5 / Stata 19
#                (fixest 0.14, plm 2.6, sandwich 3.1)
#
# Contents
#   0.  Vocabulary in thirty seconds
#   1.  Load the data (local copy, then URL)
#   2.  Panel structure: who switches?
#   3.  Between vs within variance
#   4.  Pooled OLS and the between estimator
#   5.  First differences
#   6.  Fixed effects three ways (and the df trap)
#   7.  Two-way FE and the T = 2 identities
#   8.  Random effects is OLS on quasi-demeaned data
#   9.  The Hausman test: two versions, two verdicts
#   10. Correlated random effects (Mundlak)
#   11. Adding controls
#   12. The within picture
#   13. The window matters: all five waves
#   14. Traps that silently give wrong answers
#   Comparison table (identical in all three cheat sheets)
# ══════════════════════════════════════════════════════════════════════════════

for (p in c("fixest", "plm", "sandwich", "lmtest")) {
  if (!requireNamespace(p, quietly = TRUE)) stop("install.packages(\"", p, "\") first")
}
suppressPackageStartupMessages({ library(fixest); library(plm) })
setFixest_notes(FALSE)     # quiets fixest's estimation NOTEs (e.g. the one trap 4 is about)

f4 <- function(x) sprintf("%.4f", x)
re_vcov <- function(fit) vcovHC(fit, method = "white1", type = "HC1")   # = linearmodels "robust"
re_se   <- function(fit, term) sqrt(diag(re_vcov(fit)))[[term]]


# ── 0. Vocabulary in thirty seconds ──────────────────────────────────────────
#
#   Panel ............... the same units observed repeatedly. Here 2,199
#                         workers x 2 waves (2010, 2012) = 4,398 worker-years.
#   alpha_i ............. the worker effect: everything about worker i that
#                         does not change over the sample (ability, schooling,
#                         gender, family background).
#   Between / within .... variation across workers' means vs variation around
#                         a worker's own mean. FE, FD, TWFE and CRE use ONLY
#                         the within part.
#   Within transform .... x_it - mean_i(x). Kills alpha_i. Identical to adding
#                         one dummy per worker (FWL with N dummies).
#   First difference .... x_it - x_i,t-1. Also kills alpha_i. With T = 2 it
#                         carries exactly the same information as demeaning.
#   Switchers ........... workers whose union status changes. The ONLY workers
#                         that identify the within estimators: 73 of 2,199.
#   Random effects ...... GLS that assumes alpha_i is uncorrelated with x. It is
#                         OLS on quasi-demeaned data z_it - theta * mean_i(z):
#                         theta = 0 is pooled OLS, theta = 1 is FE.
#   Mundlak / CRE ....... RE plus mean_i(x) as an extra regressor. Its x
#                         coefficient is exactly FE; its mean_i(x) coefficient
#                         tests the RE assumption.
#   Hausman ............. (b_FE - b_RE)^2 / (V_FE - V_RE) ~ chi2(1). Valid only
#                         with classical variances (RE efficient under H0).


# ── 1. Load the data (local copy, then URL) ──────────────────────────────────
# NLSY-style wage panel, restricted to 2010 and 2012 (T = 2, balanced).
# lwage = log hourly wage; union = 1 if union member; female = 1 if female.

URL <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_panel_intro/data/"

load_csv <- function(name) {
  # The post folder keeps the CSVs in data/ (and a copy next to script.py).
  local <- c(name, file.path("data", name))
  local <- local[file.exists(local)]
  src <- if (length(local)) local[1] else paste0(URL, name)
  list(d = read.csv(src), src = src)
}

ld <- load_csv("data_panel.csv")
d  <- ld$d[order(ld$d$ID, ld$d$year), ]                  # ALWAYS sort first
rownames(d) <- NULL
cat("Loaded:", ld$src, "-", nrow(d), "x", ncol(d), "\n")
stopifnot(nrow(d) == 4398, !anyNA(d[c("lwage", "union", "age", "schooling")]))


# ── 2. Panel structure: who switches? ────────────────────────────────────────

N <- length(unique(d$ID)); n_t <- length(unique(d$year))   # not T: T means TRUE
balanced <- all(table(d$ID) == n_t)
cat("\nN =", N, " T =", n_t, " N x T =", nrow(d), " balanced =", balanced, "\n")

wide <- reshape(d[c("ID", "year", "union")], idvar = "ID", timevar = "year",
                direction = "wide")
pattern <- with(wide, ifelse(union.2010 == 0 & union.2012 == 0, "never",
                      ifelse(union.2010 == 1 & union.2012 == 1, "always",
                      ifelse(union.2010 == 0, "joiner", "leaver"))))
counts <- table(factor(pattern, levels = c("never", "always", "joiner", "leaver")))
print(counts)                                             # 1805 / 321 / 36 / 37
n_switch <- counts[["joiner"]] + counts[["leaver"]]
cat("Switchers:", n_switch, sprintf("(%.1f%% of workers)", 100 * n_switch / N), "\n")


# ── 3. Between vs within variance ────────────────────────────────────────────
# between = Var(mean_i(x)); within = Var(x_it - mean_i(x)). Share = variance
# ratio, NOT a ratio of standard deviations.

decompose <- function(data, v) {
  c(between = var(tapply(data[[v]], data$ID, mean)),
    within  = var(data[[v]] - ave(data[[v]], data$ID)))
}

cat("\n")
for (v in c("lwage", "union", "age", "schooling")) {
  bw <- decompose(d, v)
  cat(sprintf("  %-10s between SD %.4f  within SD %.4f  within share %5.1f%%\n",
              v, sqrt(bw[1]), sqrt(bw[2]), 100 * bw[2] / sum(bw)))
}
# union: 0.3576 / 0.0911 / 6.1%. schooling: 0.0% -> FE cannot estimate it.


# ── 4. Pooled OLS and the between estimator ──────────────────────────────────

pols  <- feols(lwage ~ union, data = d, vcov = "hetero")            # HC1
means <- aggregate(cbind(lwage, union) ~ ID, data = d, FUN = mean)  # one row per worker
betw  <- feols(lwage ~ union, data = means, vcov = "hetero")
cat("\nPOLS    ", f4(coef(pols)[["union"]]), " SE", f4(se(pols)[["union"]]), "\n")   # 0.0750, 0.0231
cat("Between ", f4(coef(betw)[["union"]]), " SE", f4(se(betw)[["union"]]), "\n")   # 0.0662, 0.0311
# Both compare DIFFERENT workers, so both inherit any selection on alpha_i.


# ── 5. First differences ─────────────────────────────────────────────────────
# fixest's d() differences PERIODS within ID. The waves are two years apart,
# so index them 0, 1, 2, ... (the analogue of Stata's delta(2)); with
# panel.id = ~ID + year fixest guesses the step and prints a NOTE.
# ave(..., FUN = diff) would work too, after sorting.

d$wave <- (d$year - 2010) / 2
fd  <- feols(d(lwage) ~ d(union), data = d, panel.id = ~ID + wave, vcov = "hetero")
fd0 <- feols(d(lwage) ~ 0 + d(union), data = d, panel.id = ~ID + wave, vcov = "hetero")
cat("\nFD      ", f4(coef(fd)[["d(union)"]]), " SE", f4(se(fd)[["d(union)"]]),
    " intercept", f4(coef(fd)[["(Intercept)"]]), "\n")    # 0.2113, 0.0792, 0.0727
cat("FD, no intercept", f4(coef(fd0)[["d(union)"]]), "\n")   # 0.2103
cat("Rows:", nobs(fd), "\n")                              # 2199
# The intercept is the common 2010 -> 2012 wage growth (7.3 log points).


# ── 6. Fixed effects three ways (and the df trap) ────────────────────────────

# (a) Absorbed: the way to do it.
fe     <- feols(lwage ~ union | ID, data = d, vcov = "hetero")
fe_iid <- feols(lwage ~ union | ID, data = d, vcov = "iid")
b_fe   <- coef(fe)[["union"]]
cat("\nFE      ", f4(b_fe), " SE", f4(se(fe)[["union"]]), "(HC1) ",
    f4(se(fe_iid)[["union"]]), "(iid)\n")                 # 0.2103, 0.0812, 0.0509

# (b) Demeaned by hand: same coefficient, WRONG standard error. lm() on the
#     demeaned data does not know that 2,199 worker means were estimated, so
#     it divides by NT - 1 = 4397 instead of NT - N - 1 = 2198.
d$lwage_w <- d$lwage - ave(d$lwage, d$ID)
d$union_w <- d$union - ave(d$union, d$ID)
hand <- lm(lwage_w ~ 0 + union_w, data = d)
se_hand <- summary(hand)$coefficients["union_w", "Std. Error"]
fix <- sqrt((nrow(d) - 1) / (nrow(d) - N - 1))            # sqrt(4397/2198) = 1.414
stopifnot(abs(coef(hand)[["union_w"]] - b_fe) < 1e-12,
          abs(se_hand * fix - se(fe_iid)[["union"]]) < 1e-12)
cat("By hand ", f4(coef(hand)[["union_w"]]), " SE", f4(se_hand),
    " x", sprintf("%.3f", fix), "=", f4(se_hand * fix), "\n")   # 0.0360 x 1.414 = 0.0509

# (c) One dummy per worker (2,199 columns): same coefficient, same SE.
dummies <- lm(lwage ~ union + factor(ID), data = d)
se_dum  <- summary(dummies)$coefficients["union", "Std. Error"]
stopifnot(abs(coef(dummies)[["union"]] - b_fe) < 1e-10,
          abs(se_dum - se(fe_iid)[["union"]]) < 1e-10)
cat("Dummies ", f4(coef(dummies)[["union"]]), " SE", f4(se_dum), "\n")


# ── 7. Two-way FE and the T = 2 identities ───────────────────────────────────
# With T = 2:  FD without intercept == one-way FE;  FD with intercept == TWFE.
# The year effect does the job of the FD intercept (the common wage trend).

twfe <- feols(lwage ~ union | ID + year, data = d, vcov = ~ID)
stopifnot(abs(coef(fd0)[["d(union)"]] - b_fe) < 1e-10,
          abs(coef(fd)[["d(union)"]] - coef(twfe)[["union"]]) < 1e-10)
cat("\nTWFE    ", f4(coef(twfe)[["union"]]), " SE", f4(se(twfe)[["union"]]),
    "(clustered by ID)\n")                                # 0.2113, 0.0792
cat("FD0 - FE   =", format(coef(fd0)[["d(union)"]] - b_fe, digits = 2), "\n")
cat("FD - TWFE  =", format(coef(fd)[["d(union)"]] - coef(twfe)[["union"]], digits = 2), "\n")
# With T > 2 both identities break (section 13).


# ── 8. Random effects is OLS on quasi-demeaned data ──────────────────────────
# theta = 1 - sqrt(s2_e / (s2_e + T s2_u)). Subtract theta x the worker mean
# from every column (the constant becomes 1 - theta) and run OLS.

pd_ <- pdata.frame(d, index = c("ID", "year"))
re    <- plm(lwage ~ union, data = pd_, model = "random")   # Swamy-Arora
theta <- ercomp(re)$theta[[1]]
cat("\nRE      ", f4(coef(re)[["union"]]), " SE", f4(re_se(re, "union")),
    " theta", f4(theta), "\n")                            # 0.1092, 0.0299, 0.6091

quasi_demeaned_ols <- function(th) {
  y <- d$lwage - th * ave(d$lwage, d$ID)
  x <- d$union - th * ave(d$union, d$ID)
  lm(y ~ 0 + I(rep(1 - th, nrow(d))) + x)
}
by_hand <- quasi_demeaned_ols(theta)
se_bh   <- sqrt(diag(sandwich::vcovHC(by_hand, type = "HC1")))[["x"]]
stopifnot(abs(coef(by_hand)[["x"]] - coef(re)[["union"]]) < 1e-10,
          abs(se_bh - re_se(re, "union")) < 1e-10)
cat("OLS on quasi-demeaned data, theta =", f4(theta), ":", f4(coef(by_hand)[["x"]]),
    " SE", f4(se_bh), "\n")
cat("  theta = 0 ->", f4(coef(quasi_demeaned_ols(0))[["x"]]), "(POLS)  ",
    "theta = 1 ->", f4(coef(lm(lwage_w ~ 0 + union_w, data = d))[["union_w"]]), "(FE)\n")
# RE leans toward POLS here because only 6.1% of union's variance is within.


# ── 9. The Hausman test: two versions, two verdicts ──────────────────────────
# H0: alpha_i uncorrelated with union (RE consistent and efficient).

hausman <- function(b1, se1, b0, se0) {
  H <- (b1 - b0)^2 / (se1^2 - se0^2)
  c(H = H, p = pchisq(H, df = 1, lower.tail = FALSE))
}
h_txt  <- hausman(b_fe, se(fe_iid)[["union"]], coef(re)[["union"]],
                  sqrt(diag(vcov(re)))[["union"]])
h_post <- hausman(b_fe, se(fe)[["union"]], coef(re)[["union"]], re_se(re, "union"))
ph <- phtest(plm(lwage ~ union, data = pd_, model = "within"), re)   # the textbook test
stopifnot(abs(ph$statistic[[1]] - h_txt[["H"]]) < 1e-8)
cat("\nHausman, textbook (classical V): H =", f4(h_txt[["H"]]), " p =", f4(h_txt[["p"]]), "\n")
cat("Hausman, robust SEs plugged in (invalid): H =", f4(h_post[["H"]]), " p =", f4(h_post[["p"]]), "\n")
# 5.62, 0.018 and 1.79, 0.180. The textbook test (plm::phtest, Stata
# -hausman-) REJECTS RE at 5%; it is the one the post reports. Plugging robust
# SEs into the same formula is not a valid Hausman test (RE is no longer the
# efficient estimator), even though it flips the verdict. With robust or
# clustered errors, use the Mundlak test in section 10 instead.


# ── 10. Correlated random effects (Mundlak) ──────────────────────────────────

d$union_bar <- ave(d$union, d$ID)
pd_ <- pdata.frame(d, index = c("ID", "year"))
cre <- plm(lwage ~ union + union_bar, data = pd_, model = "random")
ct  <- lmtest::coeftest(cre, vcov = re_vcov(cre))
stopifnot(abs(coef(cre)[["union"]] - b_fe) < 1e-10)        # within coef == FE, exactly
cat("\nCRE     ", f4(coef(cre)[["union"]]), " SE", f4(ct["union", 2]), "\n")   # 0.2103, 0.0703
cat("Mundlak ", f4(coef(cre)[["union_bar"]]), " SE", f4(ct["union_bar", 2]),
    " p", f4(ct["union_bar", 4]), "\n")                     # -0.1441, 0.0800, 0.0717

# Pooled OLS + union_bar, clustered by worker: same coefficients, and the
# robust replacement for Hausman.
mk <- feols(lwage ~ union + union_bar, data = d, vcov = ~ID)
stopifnot(abs(coef(mk)[["union"]] - b_fe) < 1e-10)
cat("Pooled Mundlak, clustered: union_bar", f4(coef(mk)[["union_bar"]]),
    " SE", f4(se(mk)[["union_bar"]]), " p", f4(pvalue(mk)[["union_bar"]]), "\n")   # 0.0891, 0.1059
# gamma < 0: workers with more union exposure earn less than their within
# premium implies, consistent with negative selection. Borderline, not decisive.


# ── 11. Adding controls ──────────────────────────────────────────────────────
# schooling and female never change within a worker -> absorbed by the FE.
# Every model gets year effects; for RE and CRE that is a 2012 dummy (its
# worker mean is 0.5 for everyone, so it needs no Mundlak term).

d$age_bar <- ave(d$age, d$ID)
d$y2012   <- as.numeric(d$year == 2012)
pd_ <- pdata.frame(d, index = c("ID", "year"))
pols_x <- feols(lwage ~ union + age + schooling + female + factor(year), data = d,
                vcov = "hetero")
twfe_x <- feols(lwage ~ union + age | ID + year, data = d, vcov = ~ID)
re_x   <- plm(lwage ~ union + age + schooling + female + y2012, data = pd_, model = "random")
cre_x  <- plm(lwage ~ union + union_bar + age + age_bar + schooling + female + y2012,
              data = pd_, model = "random")

cat(sprintf("\n%-8s%9s%9s%9s%9s\n", "", "POLS", "TWFE", "RE", "CRE"))
for (v in c("union", "age")) {
  cat(sprintf("%-8s%9.4f%9.4f%9.4f%9.4f\n", v, coef(pols_x)[[v]], coef(twfe_x)[[v]],
              coef(re_x)[[v]], coef(cre_x)[[v]]))
}
# union 0.0571 / 0.2129 / 0.0875 / 0.2129;  age 0.0209 / -0.0576 / 0.0205 / -0.0576
# CRE with year effects reproduces TWFE exactly. Drop y2012 and CRE becomes
# one-way FE instead (union 0.2103, age +0.0332: age soaks up the wage trend).
stopifnot(abs(coef(cre_x)[["union"]] - coef(twfe_x)[["union"]]) < 1e-8)
cat("RE theta", f4(ercomp(re_x)$theta[[1]]), "\n")             # 0.5529 (trap 11)

# Why is age NEGATIVE under TWFE? Most workers age exactly 2 years between
# waves, which the year effect absorbs. Only the irregular spacings are left.
cat("Age change between waves:\n")
print(table(diff(d$age)[d$year[-1] == 2012]))             # 164 / 1885 / 150


# ── 12. The within picture ───────────────────────────────────────────────────
# Left: raw data, POLS slope. Right: demeaned data, FE slope. Same 4,398 rows;
# only the 146 switcher rows move off zero on the right.

if (!interactive()) pdf(NULL)          # Rscript: draw to a null device
set.seed(42)
op <- par(mfrow = c(1, 2))
plot(d$union + rnorm(nrow(d), 0, .025), d$lwage, pch = 16, cex = .4,
     col = adjustcolor("#6a9bcc", .3), xlab = "union (jittered)", ylab = "log wage",
     main = paste("Raw: POLS slope", sprintf("%.3f", coef(pols)[["union"]])))
abline(lm(lwage ~ union, data = d), col = "#d97757", lwd = 2.5)
plot(d$union_w + rnorm(nrow(d), 0, .005), d$lwage_w, pch = 16, cex = .4,
     col = adjustcolor("#6a9bcc", .3), xlab = "union - worker mean",
     ylab = "log wage - worker mean",
     main = paste("Demeaned: FE slope", sprintf("%.3f", b_fe)))
abline(0, b_fe, col = "#d97757", lwd = 2.5)
par(op)


# ── 13. The window matters: all five waves ───────────────────────────────────
# 2010-2018, T = 5. FD and FE no longer coincide, and the premium collapses.

d5 <- load_csv("raw_data.csv")$d
d5 <- d5[!is.na(d5$lwage) & !is.na(d5$union), ]
d5 <- d5[order(d5$ID, d5$year), ]
stopifnot(all(diff(d5$year)[d5$ID[-1] == d5$ID[-nrow(d5)]] == 2))   # no gaps

fe5 <- feols(lwage ~ union | ID + year, data = d5, vcov = ~ID)
d5$wave <- (d5$year - 2010) / 2
fd5 <- feols(d(lwage) ~ d(union) | year, data = d5, panel.id = ~ID + wave, vcov = ~ID)
bw5 <- decompose(d5, "union")
cat("\nFive waves:", nrow(d5), "rows,", length(unique(d5$ID)), "workers,",
    sprintf("within share %.1f%%", 100 * bw5[2] / sum(bw5)), "\n")   # 11045, 2209, 16.1%
cat("TWFE     ", f4(coef(fe5)[["union"]]), " SE", f4(se(fe5)[["union"]]), "\n")       # 0.0396, 0.0255
cat("FD + year", f4(coef(fd5)[["d(union)"]]), " SE", f4(se(fd5)[["d(union)"]]), "\n")  # 0.0566, 0.0322


# ── 14. Traps that silently give wrong answers ───────────────────────────────
#
#  1. DIFFERENCING ACROSS WORKERS. diff(d$lwage) on the stacked data subtracts
#     one worker from the next: 4,397 rows instead of 2,199 and a slope of
#     0.0783 instead of 0.2113. No error. Use d() with panel.id, or
#     ave(x, ID, FUN = function(z) c(NA, diff(z))) after sorting.
#
#  2. DIFFERENCING ROWS, NOT PERIODS. That ave() recipe subtracts the previous
#     ROW; with a missing wave it silently spans the gap (2016 - 2012).
#     fixest's d() and plm's diff() use the time index and return NA instead.
#     Check the time step, as section 13 does.
#
#  3. DEMEANING BY HAND UNDERSTATES THE SE. Section 6: iid SE 0.0360 instead
#     of 0.0509, because the 2,199 worker means are not counted as estimated
#     parameters. Multiply by sqrt((NT-1)/(NT-N-1)) or let fixest absorb.
#
#  4. TIME-INVARIANT REGRESSORS DISAPPEAR. In lwage ~ union + schooling +
#     female | ID, fixest removes schooling and female with a NOTE. FE cannot
#     estimate them; CRE can (section 11).
#
#  5. "ROBUST" MEANS DIFFERENT THINGS. vcovHC(re) on a plm model defaults to
#     method = "arellano" (clustered, RE SE 0.0314); the post's 0.0299 is
#     method = "white1". Stata's xtreg ..., vce(robust) also clusters. Name
#     the variance you want.
#
#  6. DEFAULT SEs CHANGE BETWEEN VERSIONS. fixest 0.14 and pyfixest 0.50
#     default to iid (0.0509) for lwage ~ union | ID; older versions
#     clustered by the first fixed effect (0.0812). Always pass vcov =.
#
#  7. WHICH HAUSMAN? phtest() gives H = 5.62, p = 0.018 (reject RE). Robust
#     SEs plugged into the same formula give H = 1.79, p = 0.180, but that is
#     not a valid test. With robust errors, report the clustered Mundlak test
#     (p = 0.106) and say which one you ran.
#
#  8. NOT REJECTING IS NOT ACCEPTING. With 6.1% of union's variance within
#     workers, V_FE is large and any FE-vs-RE test has little power. RE's
#     smaller SE is worth nothing if its assumption fails.
#
#  9. FE IS AN AVERAGE OVER SWITCHERS. 73 workers identify 0.21; joiners alone
#     give 0.345 and leavers 0.081 (post Exercise 5). It is not the premium
#     of the 2,126 workers who never switch.
#
# 10. A REGRESSOR NEARLY COLLINEAR WITH THE FEs IS IDENTIFIED BY NOISE. TWFE's
#     age coefficient (-0.0576) rests on the 314 workers whose interviews were
#     not exactly two years apart. Do not read it as an age profile.
#
# 11. RE IS NOT ONE ESTIMATOR. The variance components set theta, and tools
#     differ slightly: with controls, plm and Stata get theta 0.5529 and
#     linearmodels 0.5528 (union 0.0875 in all three at four decimals; without
#     the year dummy the gap shows up as 0.0862 vs 0.0861). random.method =
#     "amemiya" or "nerlove" moves union to 0.116 or 0.146. Demo below.
#
# 12. FE REMOVES ONLY TIME-CONSTANT CONFOUNDING, IN THIS WINDOW. All five
#     waves: TWFE 0.0396, FD 0.0566. The 0.21 is a 2010-2012 number.
#
# 13. STATA FLOAT IMPORT. import delimited without asdouble stores lwage as
#     float; the POLS slope moves by 2e-9. Invisible at 4 decimals, fatal
#     to exact cross-language checks.

bad <- data.frame(dl = diff(d$lwage), du = diff(d$union))     # no grouping!
cat("\nTrap 1: ungrouped diff ->", nrow(bad), "rows, slope",
    f4(coef(lm(dl ~ du, data = bad))[["du"]]), "\n")
cat("Trap 4:", names(coef(feols(lwage ~ union + schooling + female | ID, data = d))),
    "survive\n")
cat("Trap 5: vcovHC(re) default SE", f4(sqrt(diag(vcovHC(re)))[["union"]]), "\n")
cat("Trap 11: RE + controls by random.method:",
    sapply(c("swar", "walhus", "amemiya", "nerlove"), function(m)
      sprintf("%s %.4f", m, coef(plm(lwage ~ union + age + schooling + female + y2012, data = pd_,
                                     model = "random", random.method = m))[["union"]])), "\n")


# ── Comparison table (identical in all three cheat sheets) ───────────────────
# The Python and Stata columns are what cheatsheet_python.py and
# cheatsheet_stata.do print. They equal the R column to every printed digit
# because all three read the same CSV (trap 11 explains the fifth-decimal RE
# differences). This file checks its own column against the reference.

REFERENCE <- list(   # row, Python, R, Stata: c(coef, SE); Hausman rows: c(H, p)
  list("Pooled OLS",             c(0.0750, 0.0231)),
  list("Between",                c(0.0662, 0.0311)),
  list("First differences",      c(0.2113, 0.0792)),
  list("FE (within)",            c(0.2103, 0.0812)),
  list("Two-way FE",             c(0.2113, 0.0792)),
  list("Random effects",         c(0.1092, 0.0299)),
  list("CRE: union",             c(0.2103, 0.0703)),
  list("CRE: union_bar",         c(-0.1441, 0.0800)),
  list("RE + controls",          c(0.0875, 0.0258)),
  list("TWFE + age",             c(0.2129, 0.0793)),
  list("Five waves: TWFE",       c(0.0396, 0.0255)),
  list("Five waves: FD + year",  c(0.0566, 0.0322)),
  list("Hausman textbook H (p)", c(5.6209, 0.0177)),
  list("Hausman plug-in H (p)",  c(1.7941, 0.1804)))
LIVE <- list(c(coef(pols)[["union"]],    se(pols)[["union"]]),
             c(coef(betw)[["union"]],    se(betw)[["union"]]),
             c(coef(fd)[["d(union)"]],   se(fd)[["d(union)"]]),
             c(coef(fe)[["union"]],      se(fe)[["union"]]),
             c(coef(twfe)[["union"]],    se(twfe)[["union"]]),
             c(coef(re)[["union"]],      re_se(re, "union")),
             c(coef(cre)[["union"]],     re_se(cre, "union")),
             c(coef(cre)[["union_bar"]], re_se(cre, "union_bar")),
             c(coef(re_x)[["union"]],    re_se(re_x, "union")),
             c(coef(twfe_x)[["union"]],  se(twfe_x)[["union"]]),
             c(coef(fe5)[["union"]],     se(fe5)[["union"]]),
             c(coef(fd5)[["d(union)"]],  se(fd5)[["d(union)"]]),
             unname(h_txt),
             unname(h_post))

cell <- function(x) sprintf("%7.4f (%6.4f)", x[1], x[2])

cat("\nUnion coefficient (SE): 2,199 workers, one CSV, three languages\n")
cat(strrep("-", 78), "\n", sep = "")
cat(sprintf("%-24s%-18s%-18s%s\n", "Row", "Python", "R", "Stata"))
cat(strrep("-", 78), "\n", sep = "")
for (i in seq_along(REFERENCE)) {
  ref <- REFERENCE[[i]]
  py <- ref[[2]]; r <- if (length(ref) > 2) ref[[3]] else py; st <- if (length(ref) > 3) ref[[4]] else py
  live <- cell(LIVE[[i]])
  stopifnot(identical(live, cell(r)))
  cat(sprintf("%-24s%-18s%-18s%s\n", ref[[1]], cell(py), live, cell(st)))
}
cat(strrep("-", 78), "\n", sep = "")
cat("SEs: HC1 for POLS, between, FD, FE; clustered by worker for TWFE and five\n")
cat("waves; White on quasi-demeaned data for RE and CRE. Within rows ~0.21,\n")
cat("cross-sectional rows 0.07-0.11; with five waves the 0.21 disappears.\n")
cat("Hausman plug-in = robust SEs in the textbook formula: NOT a valid test.\n")
