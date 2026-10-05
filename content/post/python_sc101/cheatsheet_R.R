# ══════════════════════════════════════════════════════════════════════════════
# SYNTHETIC CONTROL METHOD (SCM) IN R WITH tidysynth: a one-page cheat sheet
#
# Companion to https://carlos-mendez.org/post/python_sc101/
# Companions:  cheatsheet_python.py   cheatsheet_stata.do   script.py (the script of the post)
#
# This file is the R port of cheatsheet_python.py. It uses the same data, the
# same specification, and the same sections, and it prints the same comparison
# table at the end. The three files can therefore be read side by side.
#
# Install:
#   install.packages(c("tidysynth", "dplyr"))   # plus "haven" for the .dta fallback
#
# Usage:     Rscript cheatsheet_R.R
# Run time:  about 80 seconds. The fit with its 38 placebo fits takes about 15
#            seconds, the five leave-one-out refits about 40, and the trap demos
#            about 15. The one figure goes to the system temp folder; nothing is
#            written next to this file.
# Verified with: Python 3.13 / R 4.5 / Stata 19
#                (tidysynth 0.2.1, kernlab 0.9.33, dplyr 1.1.4; mlsynth 1.0.0;
#                synth2 2.1.0)
#
# Contents
#   0.  Vocabulary in thirty seconds
#   1.  Load the data (local copy, then URL)
#   2.  Prepare the panel
#   3.  Fit the synthetic control
#   4.  Weights, balance, fit, and ATT
#   5.  The rounded Stata weights reproduce −19.0018
#   6.  In-space placebo test
#   7.  In-time placebo test (fake start in 1985)
#   8.  Leave-one-out refits
#   9.  The plot (temporary folder only)
#   10. Traps that silently give wrong answers
#   11. Comparison table (identical in all three cheat sheets)
# ══════════════════════════════════════════════════════════════════════════════

suppressPackageStartupMessages({
  library(tidysynth)
  library(dplyr)
})


# ── 0. Vocabulary in thirty seconds ──────────────────────────────────────────
#
#   Synthetic control ....... a weighted average of donor states that tracks
#                             California before 1989. After 1989 the same
#                             average estimates sales without Proposition 99.
#   Donor pool .............. the 38 untreated states that may receive weight.
#   W (donor weights) ....... nonnegative weights that sum to one. Here five
#                             states receive positive weight.
#   Predictors .............. what W must match before 1989: four covariates
#                             averaged over 1980–1988 and sales in 1975, 1980,
#                             and 1988 (lagged outcomes).
#   V (predictor weights) ... how much each predictor counts in the match. V
#                             is chosen to fit sales before 1989, and it is not
#                             identified: very different V give the same W.
#   Gap ..................... observed minus synthetic sales in one year.
#   ATT ..................... the mean gap over 1989–2000, the average
#                             treatment effect on the treated unit, California.
#   RMSE .................... root mean squared gap over 1970–1988 (the fit).
#   MSPE ratio .............. mean squared gap after 1988 divided by the mean
#                             squared gap before 1989.
#   In-space placebo ........ refit with each state treated in turn; p is the
#                             share of the 39 units whose MSPE ratio is at
#                             least that of California.
#   cut(2) .................. keep the placebo states whose MSPE before 1989
#                             is at most twice that of California.
#   In-time placebo ......... move the start to a year without a program
#                             (1985); large fake gaps are a warning sign.
#   Leave-one-out ........... drop each positive-weight donor and refit.


# ── 1. Load the data (local copy, then URL) ──────────────────────────────────
# Abadie, Diamond, and Hainmueller (2010) study cigarette sales in 39 US states
# over 1970–2000. The panel has one row per state and year, 1,209 rows in all.
# California started Proposition 99 in 1989, and the other 38 states form the
# donor pool.
#   cigsale    cigarette sales per capita (packs), the outcome
#   lnincome   log GDP per capita (observed 1972–1997)
#   age15to24  share of the population aged 15–24 (observed 1970–1990)
#   retprice   average retail price of cigarettes
#   beer       beer consumption per capita (observed 1984–1997)
# The loader tries the local CSV first and the same CSV on GitHub second. The
# original Stata file of quarcs-lab is the last resort, read with haven. The
# three sources hold identical values.

CSV_URL <- paste0("https://raw.githubusercontent.com/cmg777/starter-academic-v501/",
                  "master/content/post/python_sc101/data/smoking_sc.csv")
DTA_URL <- "https://github.com/quarcs-lab/data-open/raw/master/isds/smoking_sc.dta"
NUMERIC <- c("cigsale", "lnincome", "beer", "age15to24", "retprice")

load_data <- function() {
  for (path in c("data/smoking_sc.csv", "smoking_sc.csv"))
    if (file.exists(path)) return(list(d = read.csv(path), src = path))
  d <- tryCatch(read.csv(CSV_URL), error = function(e) NULL,
                warning = function(w) NULL)
  if (!is.null(d)) return(list(d = d, src = CSV_URL))
  raw <- haven::read_dta(DTA_URL)                  # state is a labeled number
  d <- data.frame(state = as.character(haven::as_factor(raw$state)),
                  year = as.integer(raw$year))
  for (v in NUMERIC) d[[v]] <- as.numeric(raw[[v]])
  list(d = d, src = DTA_URL)
}

l <- load_data()
d <- l$d[order(l$d$state, l$d$year), c("state", "year", NUMERIC)]
rownames(d) <- NULL
cat("Loaded:", l$src, nrow(d), "x", ncol(d), "\n")         # 1209 x 7
stopifnot(nrow(d) == 1209, all(table(d$state) == 31))      # balanced, 39 x 31

# The package also ships this panel as `smoking`, and the copies are identical.
s <- as.data.frame(tidysynth::smoking)
s <- s[order(s$state, s$year), names(d)]
stopifnot(identical(s$state, d$state), all(s$year == d$year))
for (v in NUMERIC)
  stopifnot(identical(is.na(s[[v]]), is.na(d[[v]])),
            max(abs(s[[v]] - d[[v]]), na.rm = TRUE) == 0)
cat("The bundled tidysynth::smoking data equal the loaded file\n")


# ── 2. Prepare the panel ─────────────────────────────────────────────────────
# The tidysynth package needs no treatment column, because synthetic_control()
# names the treated unit and the last year before treatment. Each predictor is
# a summary over its own window, and na.rm = TRUE skips the missing years. The
# means of California below equal the Treated column of synth2.

ca <- d$state == "California"
w8088 <- d$year %in% 1980:1988
means <- c(sapply(d[ca & w8088, c("lnincome", "age15to24", "retprice", "beer")],
                  mean, na.rm = TRUE),
           cigsale_1988 = d$cigsale[ca & d$year == 1988],
           cigsale_1980 = d$cigsale[ca & d$year == 1980],
           cigsale_1975 = d$cigsale[ca & d$year == 1975])
STATA_TREATED <- c(10.0766, 0.1735, 89.4222, 24.28, 90.1, 120.2, 127.1)
stopifnot(max(abs(means - STATA_TREATED)) < 1e-4)
cat("\nPredictor means of California:", round(means, 4), "\n")


# ── 3. Fit the synthetic control ─────────────────────────────────────────────
# The pipe builds the model step by step: data, predictors, weights, control.
# The argument i_time is the LAST year before treatment, 1988 here (trap 1),
# and the fit window must be explicit (trap 2). The optimizer settings are
# those of the tidysynth README, and they matter (trap 4).

fit_adh <- function(data, last_pre = 1988, placebos = FALSE) {
  out <- data %>%
    synthetic_control(outcome = cigsale, unit = state, time = year,
                      i_unit = "California", i_time = last_pre,
                      generate_placebos = placebos) %>%
    generate_predictor(time_window = 1980:last_pre,
                       lnincome = mean(lnincome, na.rm = TRUE),
                       age15to24 = mean(age15to24, na.rm = TRUE),
                       retprice = mean(retprice, na.rm = TRUE),
                       beer = mean(beer, na.rm = TRUE))
  if (last_pre >= 1988)                       # a lag must precede the start
    out <- out %>% generate_predictor(time_window = 1988, cigsale_1988 = cigsale)
  out %>%
    generate_predictor(time_window = 1980, cigsale_1980 = cigsale) %>%
    generate_predictor(time_window = 1975, cigsale_1975 = cigsale) %>%
    generate_weights(optimization_window = 1970:last_pre,
                     margin_ipop = .02, sigf_ipop = 7, bound_ipop = 6) %>%
    generate_control()
}

fit <- fit_adh(d, placebos = TRUE)       # about 15 seconds, placebos included


# ── 4. Weights, balance, fit, and ATT ────────────────────────────────────────

w <- grab_unit_weights(fit) %>% arrange(desc(weight))
cat("\nDonor weights:\n")
print(as.data.frame(head(w, 6)), digits = 4)
# Utah 0.3420, Nevada 0.2384, Montana 0.2088, Colorado 0.1488, Connecticut
# 0.0617, then New Mexico 0.0004 (trap 5)
stopifnot(abs(sum(w$weight) - 1) < 1e-6)

bal <- grab_balance_table(fit)
v <- grab_predictor_weights(fit)                      # diagonal of V
print(as.data.frame(left_join(bal, v, by = "variable")), digits = 5)

sc <- grab_synthetic_control(fit)                     # time_unit, real_y, synth_y
gap <- sc$real_y - sc$synth_y
pre <- sc$time_unit <= 1988
att <- mean(gap[!pre])
rmse <- sqrt(mean(gap[pre]^2))
ssr <- sum(gap[pre]^2)
r2_usual <- 1 - ssr / sum((sc$real_y[pre] - mean(sc$real_y[pre]))^2)
r2_synth2 <- 1 - ssr / sum((sc$synth_y[pre] - mean(sc$synth_y[pre]))^2)
cat(sprintf("\nATT %.4f (%.1f percent), RMSE %.4f, gap in 2000 %.2f\n", att,
            100 * att / mean(sc$synth_y[!pre]), rmse, gap[sc$time_unit == 2000]))
cat(sprintf("R-squared %.4f (usual) and %.4f (synth2)\n", r2_usual, r2_synth2))
# ATT −18.8456 (−23.8 percent), RMSE 1.7794, gap in 2000 −25.58
# R-squared 0.9755 (usual) and 0.9738 (synth2)


# ── 5. The rounded Stata weights reproduce −19.0018 ──────────────────────────
# The synth2 command prints its weights rounded to three decimals and predicts
# with those rounded weights. Multiplying the donor sales by them reproduces
# the Stata ATT to every printed digit. The small differences from section 4
# therefore come from the optimizer, not from the data.

STATA_W <- c(Utah = 0.334, Nevada = 0.235, Montana = 0.202,
             Colorado = 0.161, Connecticut = 0.068)
Y <- tapply(d$cigsale, list(d$year, d$state), sum)       # 31 years x 39 states
synth_stata <- drop(Y[, names(STATA_W)] %*% STATA_W)
gap_stata <- Y[, "California"] - synth_stata
before <- as.integer(rownames(Y)) < 1989
att_stata <- mean(gap_stata[!before])
r2_stata <- 1 - sum(gap_stata[before]^2) /
  sum((synth_stata[before] - mean(synth_stata[before]))^2)
cat(sprintf("\nStata weights by hand: ATT %.4f, R-squared %.5f\n", att_stata, r2_stata))
stopifnot(sprintf("%.4f", att_stata) == "-19.0018",      # e(att) of synth2
          sprintf("%.5f", r2_stata) == "0.97434")         # e(r2) of synth2


# ── 6. In-space placebo test ─────────────────────────────────────────────────
# The option generate_placebos = TRUE refits the model with each donor state
# treated, and California stays in every placebo donor pool, as in synth2. Each
# placebo fit, however, reuses the V of California (trap 6). The function
# grab_significance() ranks the MSPE ratio, and California ranks first among
# 39 units, so its permutation p-value is 1/39.

sig <- as.data.frame(grab_significance(fit))
ca_sig <- sig[sig$unit_name == "California", ]
print(head(sig[, c("unit_name", "pre_mspe", "post_mspe", "mspe_ratio", "rank")], 4),
      digits = 5)
keep <- sig[sig$pre_mspe <= 2 * ca_sig$pre_mspe, ]            # cut(2), by hand
p_cut <- mean(keep$mspe_ratio >= ca_sig$mspe_ratio)
cat(sprintf("California: MSPE ratio %.1f, rank %d of 39, p = %.3f\n",
            ca_sig$mspe_ratio, ca_sig$rank, ca_sig$fishers_exact_pvalue))
cat(sprintf("cut(2): %d units kept, p = %.3f\n", nrow(keep), p_cut))
# MSPE ratio 123.9, rank 1 of 39, p = 0.026; cut(2) keeps 7 units, p = 0.143

# Pointwise p-values follow the synth2 rules. In each year, the left-sided p
# is the share of kept units whose gap is at most that of California. The
# effect is negative, so the left-sided test is the relevant one.
pl <- grab_synthetic_control(fit, placebo = TRUE)        # all 39 units
pl <- pl[pl$.id %in% keep$unit_name & pl$time_unit >= 1989, ]
pl$gap <- pl$real_y - pl$synth_y
p_left <- sapply(1989:2000, function(t) {
  g <- pl$gap[pl$time_unit == t]                         # kept units, year t
  mean(g <= pl$gap[pl$time_unit == t & pl$.id == "California"])
})
cat("Left-sided p, 1989–2000:", round(p_left, 2), "\n")


# ── 7. In-time placebo test (fake start in 1985) ─────────────────────────────
# We pretend that the program began in 1985, so i_time = 1984 and the fit uses
# 1970–1984 only. The covariates are averaged over 1980–1984, and the 1988 lag
# is dropped because it lies after the fake start. Gaps over 1985–1988 measure
# an effect that should not exist, and here they average about one third of
# the ATT.

it <- grab_synthetic_control(fit_adh(d, last_pre = 1984))
fake <- with(it, (real_y - synth_y)[time_unit %in% 1985:1988])
cat(sprintf("\nFake gaps 1985–1988: %s, mean %.2f\n",
            paste(sprintf("%.2f", fake), collapse = " "), mean(fake)))   # mean −5.98


# ── 8. Leave-one-out refits ──────────────────────────────────────────────────
# We drop each positive-weight donor in turn and refit the full model. The
# donors are those whose weight stays positive after rounding to three
# decimals, the five that synth2 keeps (trap 5). Every refit keeps a large
# negative gap in 2000.

five <- w$unit[round(w$weight, 3) > 0]
g2000 <- sapply(five, function(s) {
  sc_s <- grab_synthetic_control(fit_adh(d[d$state != s, ]))
  with(sc_s, real_y[time_unit == 2000] - synth_y[time_unit == 2000])
})                                                        # about 40 seconds
cat("\nGap in 2000 without each donor:\n")
print(round(g2000, 2))
cat(sprintf("Range: %.2f (without %s) to %.2f (without %s)\n", min(g2000),
            names(which.min(g2000)), max(g2000), names(which.max(g2000))))
# −28.25 (without Nevada) to −24.07 (without Montana)


# ── 9. The plot (temporary folder only) ──────────────────────────────────────
# The function plot_trends() draws the observed and synthetic paths with
# ggplot2. Its dashed line sits at i_time, the last year before treatment, so
# it marks 1988. The file goes to the temporary folder of the system, because
# R deletes its own tempdir() when the session ends.

png_file <- file.path(dirname(tempdir()), "sc101_cheatsheet_R.png")
suppressWarnings(           # tidysynth still uses the size aesthetic for lines
  ggplot2::ggsave(png_file, plot_trends(fit), width = 8, height = 4.5, dpi = 120))
cat("\nFigure saved to", normalizePath(png_file), "\n")


# ── 10. Traps that silently give wrong answers ───────────────────────────────
#
#  1. i_time IS THE LAST PRE-TREATMENT YEAR. Proposition 99 starts in 1989, so
#     i_time = 1988. With i_time = 1989 everything runs without a warning, and
#     the weights do not even change, but grab_significance() then counts 1989
#     as a pre-treatment year. The in-time placebo with a fake start in 1985
#     likewise needs i_time = 1984. Demo below.
#
#  2. ALWAYS PASS optimization_window. Without it, generate_weights() fits V
#     to the single year i_time instead of the whole pre-treatment period. The
#     pipe still runs, but the fit before 1989 collapses. Demo below.
#
#  3. plot_placebos(prune = TRUE) PRUNES AT AN RMSPE RATIO OF 2. That is an
#     MSPE ratio of 4, not the cut(2) of synth2, so the pruned plot keeps more
#     placebo states than cut(2) does. Compute cut(2) from pre_mspe by hand, as
#     in section 6. Demo below.
#
#  4. OPTIMIZER SETTINGS MOVE THE WEIGHTS. This file uses the README settings
#     of tidysynth (margin_ipop = .02, sigf_ipop = 7, bound_ipop = 6). The
#     defaults (5e-4, 5, 10) give other weights and another ATT. Report the
#     settings together with the results. Demo below.
#
#  5. TINY POSITIVE WEIGHTS. The interior-point solver leaves small positive
#     weights on most donors (New Mexico 0.0004). Round to three decimals
#     before counting donors or choosing the leave-one-out set, as synth2 does.
#
#  6. PLACEBO FITS REUSE THE V OF CALIFORNIA. generate_weights() searches V
#     for California only and passes it to every placebo fit, while synth2 and
#     mlsynth search a new V for each placebo state. The placebo fits are
#     therefore looser before 1989, and only 7 of 39 units pass cut(2), against
#     20 in synth2 and mlsynth. Demo below.

predictors_adh <- function(x) {
  x %>%
    generate_predictor(time_window = 1980:1988,
                       lnincome = mean(lnincome, na.rm = TRUE),
                       age15to24 = mean(age15to24, na.rm = TRUE),
                       retprice = mean(retprice, na.rm = TRUE),
                       beer = mean(beer, na.rm = TRUE)) %>%
    generate_predictor(time_window = 1988, cigsale_1988 = cigsale) %>%
    generate_predictor(time_window = 1980, cigsale_1980 = cigsale) %>%
    generate_predictor(time_window = 1975, cigsale_1975 = cigsale)
}
quick_fit <- function(i_time = 1988, window = 1970:1988, readme = TRUE) {
  x <- d %>%
    synthetic_control(outcome = cigsale, unit = state, time = year,
                      i_unit = "California", i_time = i_time,
                      generate_placebos = FALSE) %>%
    predictors_adh()
  x <- if (readme) {
    generate_weights(x, optimization_window = window,
                     margin_ipop = .02, sigf_ipop = 7, bound_ipop = 6)
  } else {
    generate_weights(x, optimization_window = window)
  }
  generate_control(x)
}
top_weight <- function(f) {
  wf <- grab_unit_weights(f) %>% arrange(desc(weight))
  sprintf("%s %.3f", wf$unit[1], wf$weight[1])
}
weight_of <- function(f, state) {
  wf <- grab_unit_weights(f)
  wf$weight[wf$unit == state]
}

sig89 <- grab_significance(quick_fit(i_time = 1989))
cat(sprintf("\nTrap 1: i_time = 1989 gives an MSPE ratio of %.1f instead of %.1f\n",
            sig89$mspe_ratio[1], ca_sig$mspe_ratio))
f_nowin <- quick_fit(window = NULL)
cat(sprintf("Trap 2: no optimization_window: top weight %s, pre-1989 MSPE %.2f\n",
            top_weight(f_nowin), grab_significance(f_nowin)$pre_mspe[1]))
n_prune <- sum(sqrt(sig$pre_mspe) <= 2 * sqrt(ca_sig$pre_mspe))
cat(sprintf("Trap 3: prune = TRUE keeps %d units; cut(2) keeps %d\n",
            n_prune, nrow(keep)))
f_def <- quick_fit(readme = FALSE)
sc_def <- grab_synthetic_control(f_def)
cat(sprintf("Trap 4: default settings give Montana %.3f and an ATT of %.2f\n",
            weight_of(f_def, "Montana"),
            with(sc_def, mean((real_y - synth_y)[time_unit >= 1989]))))
v_all <- grab_predictor_weights(fit, placebo = TRUE)
same_v <- all(tapply(v_all$weight, v_all$variable, function(x) diff(range(x))) == 0)
cat("Trap 6: every placebo fit uses the V of California:", same_v, "\n")


# ── 11. Comparison table (identical in all three cheat sheets) ───────────────
# The table lists one row per tool, and every file prints the same text. Each
# file computes its own row live and checks it against the reference row
# within stated tolerances. The other two rows are what cheatsheet_python.py
# and cheatsheet_stata.do print.

TOOLS <- c("Python mlsynth 1.0.0", "R tidysynth 0.2.1", "Stata synth2 2.1.0")
FIVE <- c("Utah", "Nevada", "Montana", "Colorado", "Connecticut")
REF <- list(  # weights of FIVE, ATT, RMSE, MSPE ratio, p (39), cut(2) n, cut(2) p
  "Python mlsynth 1.0.0" = c(0.335, 0.236, 0.202, 0.160, 0.068,
                             -18.98, 1.754, 129.0, 0.026, 20, 0.050),
  "R tidysynth 0.2.1" = c(0.342, 0.238, 0.209, 0.149, 0.062,
                          -18.85, 1.779, 123.9, 0.026, 7, 0.143),
  "Stata synth2 2.1.0" = c(0.334, 0.235, 0.202, 0.161, 0.068,
                           -19.00, 1.756, 123.5, 0.026, 20, 0.050))
ROB <- list(  # in-time 1985 mean fake gap; leave-one-out min and max gap in 2000
  "Python mlsynth 1.0.0" = c(-5.97, -27.15, -23.48),
  "R tidysynth 0.2.1" = c(-5.98, -28.25, -24.07),
  "Stata synth2 2.1.0" = c(-5.99, -28.35, -23.49))
NOTES <- c(
  "Notes. ATT: mean gap over 1989–2000, in packs per capita. RMSE: fit over",
  "1970–1988. MSPE ratio: mean squared gap after 1988 over that before 1989.",
  "p (39): share of the 39 units with a ratio at least that of California.",
  "cut(2) n: units whose MSPE before 1989 is at most twice that of California,",
  "and p is the same share among them. In-time 1985: mean fake gap over",
  "1985–1988. LOO: smallest and largest gap in 2000 across the five refits.",
  "Why the rows differ: V is not identified, so each optimizer stops at its own",
  "W. Stata rounds W to three decimals and takes its MSPE ratio from a refit",
  "inside its placebo command. In tidysynth, every placebo fit reuses the V of",
  "California, so its placebo fits are looser and fewer states pass cut(2).")

show_table <- function() {
  rule <- strrep("=", 78)
  cat(rule, "\n", sep = "")
  cat("Synthetic California in three languages: one specification, one panel\n")
  cat(rule, "\n", sep = "")
  cat(sprintf("%-22s%8s%8s%9s%10s%13s\n", "Donor weights", "Utah", "Nevada",
              "Montana", "Colorado", "Connecticut"))
  for (t in TOOLS)
    cat(sprintf("%-22s%8.3f%8.3f%9.3f%10.3f%13.3f\n", t, REF[[t]][1],
                REF[[t]][2], REF[[t]][3], REF[[t]][4], REF[[t]][5]))
  cat(strrep("-", 78), "\n", sep = "")
  cat(sprintf("%-22s%8s%8s%12s%8s%10s%8s\n", "Effect and inference", "ATT",
              "RMSE", "MSPE ratio", "p (39)", "cut(2) n", "p"))
  for (t in TOOLS)
    cat(sprintf("%-22s%8.2f%8.3f%12.1f%8.3f%10d%8.3f\n", t, REF[[t]][6],
                REF[[t]][7], REF[[t]][8], REF[[t]][9], as.integer(REF[[t]][10]),
                REF[[t]][11]))
  cat(strrep("-", 78), "\n", sep = "")
  cat(sprintf("%-22s%14s%14s%14s\n", "Robustness", "In-time 1985",
              "LOO min 2000", "LOO max 2000"))
  for (t in TOOLS)
    cat(sprintf("%-22s%14.2f%14.2f%14.2f\n", t, ROB[[t]][1], ROB[[t]][2],
                ROB[[t]][3]))
  cat(rule, "\n", sep = "")
  cat(NOTES, sep = "\n")
}

wt <- setNames(w$weight, w$unit)
live <- c(wt[FIVE], att, rmse, ca_sig$mspe_ratio, ca_sig$fishers_exact_pvalue,
          nrow(keep), p_cut)
live_rob <- c(mean(fake), min(g2000), max(g2000))
ref <- REF[[TOOLS[2]]]
ref_rob <- ROB[[TOOLS[2]]]
stopifnot("weights" = all(abs(live[1:5] - ref[1:5]) <= 0.005),
          "ATT" = abs(live[6] - ref[6]) <= 0.05,
          "RMSE" = abs(live[7] - ref[7]) <= 0.01,
          "MSPE ratio" = abs(live[8] - ref[8]) <= 1,
          "p over 39 units" = ca_sig$rank == 1 &&
            sprintf("%.3f", live[9]) == sprintf("%.3f", ref[9]),
          "cut(2)" = abs(live[10] - ref[10]) <= 2 &&
            abs(live[11] - 1 / live[10]) < 1e-12,
          "robustness" = all(abs(live_rob - ref_rob) <= 0.05))
cat(sprintf("\nThis run: %s | ATT %.2f | RMSE %.3f | ratio %.1f | p %.3f | cut(2) %d, p %.3f\n",
            paste(sprintf("%.3f", live[1:5]), collapse = " "), live[6], live[7],
            live[8], live[9], as.integer(live[10]), live[11]))
cat(sprintf("          in-time %.2f | LOO %.2f to %.2f; all within tolerance of the R rows\n\n",
            live_rob[1], live_rob[2], live_rob[3]))
show_table()
