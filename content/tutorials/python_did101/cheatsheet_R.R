# ══════════════════════════════════════════════════════════════════════════════
# DIFFERENCE-IN-DIFFERENCES (DiD) IN R — a one-page cheat sheet
#
# Companion to https://carlos-mendez.org/tutorials/python_did101/
# Companions:  cheatsheet_python.py   cheatsheet_stata.do   script.py (the post's script)
#
# The R port of cheatsheet_python.py: same CSVs, same sections, same comparison
# table at the end, so the three files can be read side by side.
#
# Install:
#   install.packages("fixest")
#
# Usage:     Rscript cheatsheet_R.R
# Run time:  about 2 seconds. The one figure goes to tempdir(); nothing is
#            written next to this file.
# Verified with: Python 3.11 / R 4.5 / Stata 19
#                (fixest 0.14; pyfixest 0.50.1)
#
# Contents
#   0.  Vocabulary in thirty seconds
#   1.  Load the data (local copy, then URL)
#   2.  The naive before-after comparison
#   3.  The 2x2 DiD by hand
#   4.  DiD as a regression: every coefficient is a group mean
#   5.  Two-way fixed effects
#   6.  Adding a covariate
#   7.  Four standard errors (and what CRV3 really computes)
#   8.  Regression tables (text and LaTeX)
#   9.  The event study
#   10. The event-study plot
#   11. Traps that silently give wrong answers
#   Comparison table (identical in all three cheat sheets)
# ══════════════════════════════════════════════════════════════════════════════

suppressPackageStartupMessages(library(fixest))

f4 <- function(x) sprintf("%.4f", x)
b_of  <- function(fit, term) unname(coef(fit)[term])
se_of <- function(fit, term) unname(se(fit)[term])


# ── 0. Vocabulary in thirty seconds ──────────────────────────────────────────
#
#   DiD ................. (treated after - treated before)
#                         - (comparison after - comparison before). The second
#                         difference removes the trend both groups share.
#   ATT ................. average treatment effect on the TREATED schools. DiD
#                         identifies the ATT, not the ATE.
#   Parallel trends ..... without the program, treated schools would have moved
#                         like the comparison schools. Levels may differ; trends
#                         may not. It is an assumption about an unobserved
#                         counterfactual, so no test can prove it.
#   Counterfactual ...... treated pre-period mean + comparison group's change.
#   TWFE ................ y ~ D | unit + period: unit and period fixed effects
#                         absorb `treated` and `post`, leaving the interaction.
#   Event study ......... one coefficient per period relative to adoption,
#                         measured against a reference period (here t = -1).
#   CRV1 / CRV3 ......... cluster-robust variances (clusters = schools). CRV3
#                         is a leave-one-school-out jackknife.
#   Absorbing treatment . once a school starts the program it stays treated.


# ── 1. Load the data (local copy, then URL) ──────────────────────────────────
# Corral & Yang (2024): 35 high schools, 10 adopt an after-school tutoring
# program at the same time. gpa = average GPA of low-income students (nominally 0-100;
# the simulated event-study file reaches 107.68).
#   tutoring_did.csv       35 schools x 2 periods  (the 2x2 design)
#   tutoring_didevent.csv  35 schools x 8 periods  (the event study; adoption
#                          in period 5; timeToTreat is empty for comparison
#                          schools)

BASE <- paste0("https://raw.githubusercontent.com/cmg777/starter-academic-v501/",
               "master/content/tutorials/python_did101/data/")

load_csv <- function(name) {
  for (path in c(name, file.path("data", name)))
    if (file.exists(path)) return(list(d = read.csv(path), src = path))
  list(d = read.csv(paste0(BASE, name)), src = paste0(BASE, name))
}

l1 <- load_csv("tutoring_did.csv");      d  <- l1$d
l2 <- load_csv("tutoring_didevent.csv"); ev <- l2$d
cat("Loaded:", l1$src, nrow(d), "x", ncol(d), "|", l2$src, nrow(ev), "x", ncol(ev), "\n")

stopifnot(nrow(d) == 70, ncol(d) == 7, nrow(ev) == 280, ncol(ev) == 8,
          all(table(d$id) == 2),                              # balanced panel
          all(tapply(d$treated, d$id, function(x) length(unique(x))) == 1),
          all(d$txp == d$treated * d$post))
cat("Treated schools:", length(unique(d$id[d$treated == 1])), "of",
    length(unique(d$id)), "\n")                               # 10 of 35


# ── 2. The naive before-after comparison ─────────────────────────────────────

m <- with(d, tapply(gpa, list(treated, post), mean))         # rows treated, cols post
naive <- m["1", "1"] - m["1", "0"]
cat(sprintf("\nTreated schools: %.2f -> %.2f, naive change %.2f\n",
            m["1", "0"], m["1", "1"], naive))
# 60.17 -> 96.37, 36.20

# The same number as a regression on the treated schools only. Its SE is SMALL:
# the naive estimate is precise, just biased.
fit_naive <- feols(gpa ~ post, data = subset(d, treated == 1), vcov = "iid")
stopifnot(abs(b_of(fit_naive, "post") - naive) < 1e-10)
cat("As a regression:", f4(b_of(fit_naive, "post")),
    paste0("(SE ", f4(se_of(fit_naive, "post")), ")\n"))    # 36.2008 (0.5252)


# ── 3. The 2x2 DiD by hand ───────────────────────────────────────────────────

trend <- m["0", "1"] - m["0", "0"]                            # comparison change
counterfactual <- m["1", "0"] + trend
did <- m["1", "1"] - counterfactual
cat(sprintf("\nComparison schools: %.2f -> %.2f, trend %.3f\n",
            m["0", "0"], m["0", "1"], trend))
cat(sprintf("Counterfactual %.2f, DiD %.4f\n", counterfactual, did))
cat(sprintf("Naive overstates DiD by %.0f%%\n", 100 * (naive / did - 1)))
# 71.22 -> 82.10, 10.886; 71.05, 25.3149; 43%

# ROUNDING: the post's 10.88 and 25.32 are differences of means ROUNDED to two
# decimals (82.10 - 71.22, 36.20 - 10.88). Unrounded: 10.886 and 25.315.
stopifnot(round(round(m["0", "1"], 2) - round(m["0", "0"], 2), 2) == 10.88,
          sprintf("%.3f", did) == "25.315")


# ── 4. DiD as a regression: every coefficient is a group mean ────────────────
# fixest "hetero" = HC1 (n / (n - k) small-sample factor), as in pyfixest.

ols <- feols(gpa ~ treated + post + txp, data = d, vcov = "hetero")
b <- coef(ols)
stopifnot(abs(b[["(Intercept)"]] - m["0", "0"]) < 1e-10,          # comparison, pre
          abs(b[["treated"]] - (m["1", "0"] - m["0", "0"])) < 1e-10,  # baseline gap
          abs(b[["post"]] - trend) < 1e-10,                          # common trend
          abs(b[["txp"]] - did) < 1e-10)                             # the DiD
cat(sprintf("\nOLS: intercept %.3f, treated %.3f, post %.3f, txp %.4f (HC1 SE %.4f)\n",
            b[["(Intercept)"]], b[["treated"]], b[["post"]], b[["txp"]],
            se_of(ols, "txp")))
# 71.215, -11.049, 10.886, 25.3149 (0.6150)


# ── 5. Two-way fixed effects ─────────────────────────────────────────────────
# School FE absorb `treated`, period FE absorb `post`. Balanced 2x2: the
# coefficient is IDENTICAL to the OLS interaction; only the SE changes.

twfe <- feols(gpa ~ txp | id + time, data = d, vcov = ~id)
stopifnot(abs(b_of(twfe, "txp") - did) < 1e-10)
cat(sprintf("\nTWFE: %.4f (CRV1 SE %.4f), R2 %.3f, within R2 %.3f\n",
            b_of(twfe, "txp"), se_of(twfe, "txp"), r2(twfe, "r2"), r2(twfe, "wr2")))                 # 25.3149 (0.5851), 0.995, 0.981


# ── 6. Adding a covariate ────────────────────────────────────────────────────

twfe_cov <- feols(gpa ~ txp + female_share | id + time, data = d, vcov = ~id)
cat(sprintf("\n+ female_share: %.4f (SE %.4f); female_share %.3f, p = %.3f\n",
            b_of(twfe_cov, "txp"), se_of(twfe_cov, "txp"),
            b_of(twfe_cov, "female_share"), pvalue(twfe_cov)[["female_share"]]))
# 25.3281 (0.6048); -3.216, p = 0.714. The estimate moves by 0.013.
# Stability is the reassuring part. An insignificant covariate does NOT show
# that the fixed effects "capture everything", and a covariate the program
# itself can move (a bad control) should be measured before treatment.


# ── 7. Four standard errors (and what CRV3 really computes) ──────────────────
# Same coefficient, 25.3149, four variance estimators. N = 70, G = 35 schools.

SE_REF <- c(iid = 0.6071, HC1 = 0.5852, CRV1 = 0.5851, CRV3 = 0.6373)

# CRV3 by hand: drop one school, re-estimate, repeat 35 times. pyfixest centres
# the 35 estimates on the FULL-sample estimate and multiplies by the same
# small-sample factor fixest applies to CRV1:  G/(G-1) x (N-1)/(N-K) =
# 35/34 x 69/67, K = 3 (txp, one period dummy, the constant; school FE are
# nested in the clusters and not counted). fixest has no built-in CRV3.
G <- length(unique(d$id)); N <- nrow(d); K <- 3
b_drop <- sapply(sort(unique(d$id)), function(g)
  coef(feols(gpa ~ txp | id + time, data = subset(d, id != g)))[["txp"]])
ssc_crv <- G / (G - 1) * (N - 1) / (N - K)
# ... and it IS fixest's CRV1 factor: clustered vcov with / without adjustment.
v_adj <- vcov(twfe, vcov = ~id)[1, 1]
v_raw <- vcov(twfe, vcov = ~id, ssc = ssc(adj = FALSE, cluster.adj = FALSE))[1, 1]
stopifnot(abs(v_adj / v_raw - ssc_crv) < 1e-10)
se_crv3 <- sqrt(ssc_crv * sum((b_drop - did)^2))
se_stata_jk <- sqrt((G - 1) / G * sum((b_drop - mean(b_drop))^2))

SE_LIVE <- c(iid  = se(twfe, vcov = "iid")[["txp"]],
             HC1  = se(twfe, vcov = "hetero")[["txp"]],
             CRV1 = se(twfe, vcov = ~id)[["txp"]],
             CRV3 = se_crv3)
cat("\n")
for (k in names(SE_REF)) {
  stopifnot(f4(SE_LIVE[[k]]) == f4(SE_REF[[k]]))             # same in Python and Stata
  cat(sprintf("  %-5s SE %s   t %.2f\n", k, f4(SE_LIVE[[k]]), did / SE_LIVE[[k]]))
}
cat(sprintf("  CRV3 by hand %.4f  (Stata's vce(jackknife) definition: %.4f)\n",
            se_crv3, se_stata_jk))                          # 0.6373 (0.6101)

# What matters for inference is the 10 TREATED schools, not the 35 clusters:
# with few treated clusters CRV1 understates uncertainty. Prefer CRV3 or the
# wild cluster bootstrap (package fwildclusterboot, or summclust for CRV3).


# ── 8. Regression tables (text and LaTeX) ────────────────────────────────────
# etable() prints a text table; tex = TRUE returns LaTeX. Each model keeps the
# vcov it was estimated with (HC1, CRV1, CRV1).

print(etable(ols, twfe, twfe_cov, digits = "r3", fitstat = ~ n + r2))
tex <- etable(ols, twfe, twfe_cov, tex = TRUE, dict = c(txp = "Treatment $\\times$ Post"))
cat("LaTeX table:", length(tex), "lines\n")


# ── 9. The event study ───────────────────────────────────────────────────────
# One dummy per event time, t = -1 omitted. Comparison schools have no event
# time: give them a placeholder (-99) so they STAY in the sample, and list it
# as a second reference level so fixest does not even try to estimate it.

ev$timeToTreat[is.na(ev$timeToTreat)] <- -99
es <- feols(gpa ~ i(timeToTreat, ref = c(-1, -99)) | id + time, data = ev, vcov = ~id)
ct <- coeftable(es)
rownames(ct) <- sub("timeToTreat::", "", rownames(ct))      # "-4", "-3", ...
EVENT_TIMES <- c("-4", "-3", "-2", "0", "1", "2", "3")
stopifnot(identical(rownames(ct), EVENT_TIMES))
ci <- confint(es)
cat("\nEvent study (CRV1 by school), N =", nobs(es), "\n")
for (i in seq_along(EVENT_TIMES))
  cat(sprintf("  t = %2s  %7.3f  [%6.2f, %6.2f]  p = %.3f\n", EVENT_TIMES[i],
              ct[i, "Estimate"], ci[i, 1], ci[i, 2], ct[i, "Pr(>|t|)"]))
# Leads 0.342, -0.322, 0.593 (all p > 0.17): CONSISTENT with parallel trends,
# not proof of it. Lags 25.03, 24.71, 24.77, 25.70: roughly flat, no fade-out.

lead_avg <- mean(c(ct[c("-4", "-3", "-2"), "Estimate"], 0))
lag_avg  <- mean(ct[c("0", "1", "2", "3"), "Estimate"])
cat(sprintf("  mean(lags) - mean(leads incl. ref) = %.3f\n", lag_avg - lead_avg))


# ── 10. The event-study plot ─────────────────────────────────────────────────
# fixest's own one-liner is iplot(es); this base-R version mirrors the Python
# figure and is written to tempdir().

times <- c(-4, -3, -2, -1, 0, 1, 2, 3)
est <- c(ct[1:3, "Estimate"], 0, ct[4:7, "Estimate"])
lo  <- c(ci[1:3, 1], 0, ci[4:7, 1])
hi  <- c(ci[1:3, 2], 0, ci[4:7, 2])

png_file <- file.path(tempdir(), "did101_event_study_cheatsheet_R.png")
png(png_file, width = 840, height = 540, res = 120)
plot(times, est, ylim = range(lo, hi), pch = 19, col = "#6a9bcc",
     xlab = "Periods relative to adoption (t = -1 is the reference)",
     ylab = "Effect on GPA (points)", main = "Event study: tutoring and GPA")
k <- times != -1                                   # the reference has no interval
arrows(times[k], lo[k], times[k], hi[k], angle = 90, code = 3, length = 0.04,
       col = "#6a9bcc")
abline(h = 0, col = "#141413"); abline(v = -0.5, lty = 2, col = "#d97757")
invisible(dev.off())
cat("\nFigure saved to", normalizePath(png_file), "\n")


# ── 11. Traps that silently give wrong answers ───────────────────────────────
#
#  1. LEAVING THE COMPARISON SCHOOLS' EVENT TIME MISSING. NA rows are dropped,
#     so the "event study" runs on the 10 treated schools alone; with one
#     adoption date, event time IS calendar time and every event dummy is
#     collinear with the period FE (fixest stops with an error). Fill with a
#     placeholder or interact with the treated indicator. Demo below.
#
#  2. "INSIGNIFICANT LEADS PROVE PARALLEL TRENDS." They are consistent with it.
#     With 10 treated schools a one-point pre-trend would still sit inside the
#     t = -2 interval [-0.27, 1.45] (Roth 2022, "Pretest with caution").
#
#  3. MISREADING THE REFERENCE PERIOD. Every event-study coefficient is a gap
#     RELATIVE TO t = -1. "Immediate effect" means "at t = 0 relative to t = -1".
#
#  4. HC1 IN A PANEL. vcov = "hetero" treats a school's two observations as
#     independent. Cluster by school (~id).
#
#  5. FEW TREATED CLUSTERS. 35 clusters looks comfortable, but only 10 are
#     treated. CRV1 can understate uncertainty; use CRV3 or the wild bootstrap.
#
#  6. "CRV3" IS NOT ONE NUMBER ACROSS PACKAGES. pyfixest: jackknife centred on
#     the full-sample estimate x the CRV1 factor (0.6373). Stata's
#     vce(jackknife): centred on the replicate mean x (G-1)/G (0.6101).
#     sandwich::vcovCL(type = "HC3") on an lm with dummies is a third variant.
#
#  7. FIXEST DEFAULT VCOV. Without vcov =, feols with fixed effects clusters by
#     the FIRST fixed effect (here id), and the default has changed between
#     versions. Always pass vcov explicitly.
#
#  8. ROUNDED MEANS. 36.20 - 10.88 = 25.32 uses means rounded to 2 decimals;
#     the regression says 25.315. Round at the end, not in the middle.
#
#  9. STAGGERED ADOPTION. Here every school adopts in period 5, so TWFE is fine.
#     With staggered adoption AND effects that vary across cohorts or time,
#     TWFE can be badly biased (Goodman-Bacon 2021); use did (Callaway-
#     Sant'Anna), sunab() in fixest (Sun-Abraham) or did2s.
#
# 10. NA IN A REGRESSOR DROPS ROWS QUIETLY. fixest prints "NOTE: n
#     observations removed because of NA values" and carries on; check nobs().

ev_na <- ev
ev_na$timeToTreat[ev_na$timeToTreat == -99] <- NA
msg <- tryCatch({
  feols(gpa ~ i(timeToTreat, ref = -1) | id + time, data = ev_na, vcov = ~id,
        notes = FALSE)
  "no error"
}, error = function(e) "all event dummies are collinear with the fixed effects")
cat("\nTrap 1:", msg, "\n")


# ── Comparison table (identical in all three cheat sheets) ───────────────────
# The Python and Stata columns are what cheatsheet_python.py and
# cheatsheet_stata.do print. They equal the R column to every printed digit
# because all three read the same CSVs; this file checks its own column
# against them.

REFERENCE <- data.frame(   # row, coefficient, SE (NA = no SE)
  row  = c("Naive before-after", "Manual 2x2 DiD", "OLS interaction, HC1",
           "TWFE, CRV1", "TWFE + female_share",
           "Event study t = -4", "Event study t = -3", "Event study t = -2",
           "Event study t =  0", "Event study t =  1", "Event study t =  2",
           "Event study t =  3"),
  coef = c(36.2008, 25.3149, 25.3149, 25.3149, 25.3281,
           0.3420, -0.3220, 0.5933, 25.0276, 24.7052, 24.7685, 25.7015),
  se   = c(0.5252, NA, 0.6150, 0.5851, 0.6048,
           0.4013, 0.4413, 0.4235, 0.4451, 0.5593, 0.7386, 0.7965))
LIVE <- rbind(c(b_of(fit_naive, "post"), se_of(fit_naive, "post")),
              c(did, NA),
              c(b_of(ols, "txp"), se_of(ols, "txp")),
              c(b_of(twfe, "txp"), se_of(twfe, "txp")),
              c(b_of(twfe_cov, "txp"), se_of(twfe_cov, "txp")),
              unname(ct[EVENT_TIMES, c("Estimate", "Std. Error")]))

cell <- function(b, se) if (is.na(se)) sprintf("%8.4f (   -  )", b) else
  sprintf("%8.4f (%6.4f)", b, se)

cat("\nDiD estimate (SE): 35 schools, one pair of CSVs, three languages\n")
cat(strrep("-", 78), "\n", sep = "")
cat(sprintf("%-24s%-18s%-18s%s\n", "Row", "Python", "R", "Stata"))
cat(strrep("-", 78), "\n", sep = "")
for (i in seq_len(nrow(REFERENCE))) {
  ref  <- cell(REFERENCE$coef[i], REFERENCE$se[i])
  live <- cell(LIVE[i, 1], LIVE[i, 2])
  stopifnot(identical(live, ref))
  cat(sprintf("%-24s%-18s%-18s%s\n", REFERENCE$row[i], ref, live, ref))
}
cat(strrep("-", 78), "\n", sep = "")
cat("Naive: treated schools only, iid SE. 2x2 rows: N = 70. Event study:\n")
cat("N = 280, t = -1 omitted, CRV1 by school. Section 7 adds iid/HC1/CRV3.\n")
