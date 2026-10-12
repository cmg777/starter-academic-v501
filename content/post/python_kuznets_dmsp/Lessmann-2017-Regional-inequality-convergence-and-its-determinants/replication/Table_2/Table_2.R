#!/usr/bin/env Rscript
# ===========================================================================
# Table_2.R  --  R replication of Table 2 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Correlation between PREDICTED-income, OBSERVED-income and LIGHT-density
# measures of regional inequality, cross-section mean of 2001-2012. For each of
# FIVE population-weighted inequality indices (Gini, GE(-1), MLD GE(0),
# Theil GE(1), CV) we build three versions per country-year (from predicted GDP
# pc, observed GDP pc, and raw light pc), average each over 2001-2012 to one
# value per country, then correlate the predicted and light versions against the
# observed version across countries.
#
# This is the R twin of Table_2.do. It reads the SAME data/Table_2_data.csv and
# should reproduce the same correlations (see the comparison table in README.md).
# Stata uses `ineqdeco`; here we implement the weighted indices FROM FIRST
# PRINCIPLES (they match ineqdeco for GE(-1),MLD,Theil,CV; the weighted Gini may
# differ slightly from ineqdeco's algorithm - DOCUMENTED in the README).
#
# REQUIRED PACKAGES (install once):
#   install.packages("readr")
#   - readr : fast CSV reader (read_csv / write_csv)
#
# RUN:  Rscript Table_2.R       (from inside this folder, or from anywhere)
# OUTPUT: output/Table_2_R.txt (the five correlation matrices) and
#         output/Table_2_results_R.csv (the 10 key correlations, for README)
# ===========================================================================

suppressMessages({ library(readr) })   # read_csv / write_csv only

## --- 0. Make paths portable: run from this script's own folder -------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))
dir.create("output", showWarnings = FALSE)

## --- 1. Read the data (case-sensitive column names) ------------------------
# read_csv keeps the original column case, matching Stata `import delimited,
# case(preserve)`.
d <- read_csv("data/Table_2_data.csv", show_col_types = FALSE)

## --- 2. Light per capita + restrict to the 2001-2012 window ----------------
d$Light_pc_Region <- d$Light_Region / d$Pop_Region   # raw nightlight proxy
d <- subset(d, year > 2000 & year < 2013)            # manuscript cross-section

## --- 3. Population-weighted inequality indices (from first principles) ------
# For values y with population weights w: weighted mean mu = sum(w*y)/sum(w),
# population shares p = w/sum(w), and relative incomes r = y/mu. Then:
#   GE(-1) = 0.5*(sum p*r^-1 - 1) ; GE(0)=MLD = sum p*(-log r) ;
#   GE(1)=Theil = sum p*r*log r   ; GE(2) = 0.5*(sum p*r^2 - 1) ;
#   CV = sqrt(2*GE(2)).
#   Gini = sum_i sum_j w_i w_j |y_i - y_j| / (2*(sum w)^2 * mu).
# These reproduce ineqdeco's GE class and CV exactly; the weighted Gini follows
# the standard double-sum definition (ineqdeco may use a slightly different
# algorithm - see README).
ineq_indices <- function(y, w) {
  ok <- is.finite(y) & is.finite(w) & w > 0 & y > 0   # ineqdeco needs y>0
  y <- y[ok]; w <- w[ok]
  if (length(y) < 2) return(c(GINIW = NA, GE_m1W = NA, GE_0W = NA,
                              GE_1W = NA, COVW = NA))
  sw <- sum(w)
  mu <- sum(w * y) / sw          # population-weighted mean
  p  <- w / sw                   # population shares
  r  <- y / mu                   # relative incomes
  ge_m1 <- 0.5 * (sum(p * r^(-1)) - 1)        # GE(-1)
  ge_0  <- sum(p * (-log(r)))                 # GE(0) = MLD
  ge_1  <- sum(p * r * log(r))                # GE(1) = Theil
  ge_2  <- 0.5 * (sum(p * r^2) - 1)           # GE(2)
  cv    <- sqrt(2 * ge_2)                      # coefficient of variation
  # weighted Gini via the double-sum of weighted absolute differences
  gini  <- sum(outer(w, w) * abs(outer(y, y, "-"))) / (2 * sw^2 * mu)
  c(GINIW = gini, GE_m1W = ge_m1, GE_0W = ge_0, GE_1W = ge_1, COVW = cv)
}

## --- 4. One index set per country-year, per base variable ------------------
# Map each base variable to the suffix used in the Stata output names.
bases <- c(pred_GDP_pc = "pred_GDP_pc_Region",   # satellite-predicted income
           GDP_pc      = "GDP_pc_Region",        # observed income
           Light_pc    = "Light_pc_Region")      # raw light density

# Build a country-year key, then for each base compute the 5 indices per group.
key <- interaction(d$Country_ISO, d$year, drop = TRUE)
per_cy <- data.frame(Country_ISO = tapply(d$Country_ISO, key, `[`, 1),
                     stringsAsFactors = FALSE)
for (suf in names(bases)) {
  var <- bases[[suf]]
  # split each base variable and the weight by country-year, apply the indices
  ys <- split(d[[var]], key)
  ws <- split(d$Pop_Region, key)
  mat <- t(mapply(ineq_indices, ys, ws))        # rows = country-years, 5 cols
  colnames(mat) <- paste0(c("GINIW", "GE_m1W", "GE_0W", "GE_1W", "COVW"),
                          "_", suf)
  per_cy <- cbind(per_cy, mat)
}

## --- 5. Collapse to one row per country (mean over 2001-2012) ---------------
# The indices are constant within a country-year; averaging across years gives
# the cross-section value used in the manuscript.
val_cols <- setdiff(names(per_cy), "Country_ISO")
collapsed <- aggregate(per_cy[val_cols], by = list(Country_ISO = per_cy$Country_ISO),
                       FUN = function(x) mean(x, na.rm = TRUE))

## --- 6. The 10 correlations (predicted-vs-observed, light-vs-observed) ------
# For each index, correlate the predicted version and the light version against
# the observed version across countries (pairwise complete = Stata pwcorr).
idx <- c("GINIW", "GE_m1W", "GE_0W", "GE_1W", "COVW")
labs <- c("Gini", "GE(-1)", "MLD GE(0)", "Theil GE(1)", "CV")
corr <- function(a, b) cor(collapsed[[a]], collapsed[[b]], use = "pairwise.complete.obs")
pred_obs  <- sapply(idx, function(i) corr(paste0(i, "_pred_GDP_pc"), paste0(i, "_GDP_pc")))
light_obs <- sapply(idx, function(i) corr(paste0(i, "_Light_pc"),    paste0(i, "_GDP_pc")))

## --- 7. Write the five correlation matrices to a log file ------------------
sink("output/Table_2_R.txt")
cat("Table 2 (R, weighted indices from first principles)\n")
cat("Cross-section 2001-2012; correlations across", nrow(collapsed), "countries\n\n")
for (k in seq_along(idx)) {
  cat(sprintf("=== %s ===\n", labs[k]))
  cols <- paste0(idx[k], c("_pred_GDP_pc", "_GDP_pc", "_Light_pc"))
  m <- cor(collapsed[cols], use = "pairwise.complete.obs")
  dimnames(m) <- list(c("pred", "obs", "light"), c("pred", "obs", "light"))
  print(round(m, 4))
  cat("\n")
}
sink()

## --- 8. Save key numbers for the cross-language comparison ------------------
res <- data.frame(
  index        = labs,
  pred_vs_obs  = round(as.numeric(pred_obs),  4),
  light_vs_obs = round(as.numeric(light_obs), 4))
write_csv(res, "output/Table_2_results_R.csv")

## --- 9. Console summary ----------------------------------------------------
cat(sprintf("R  | countries=%d\n", nrow(collapsed)))
cat("R  | predicted-vs-observed:",
    paste(sprintf("%s=%.2f", labs, pred_obs), collapse = "  "), "\n")
cat("R  | light-vs-observed:    ",
    paste(sprintf("%s=%.2f", labs, light_obs), collapse = "  "), "\n")
cat("Wrote output/Table_2_R.txt and output/Table_2_results_R.csv\n")
