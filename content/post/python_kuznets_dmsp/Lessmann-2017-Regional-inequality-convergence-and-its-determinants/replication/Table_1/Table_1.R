#!/usr/bin/env Rscript
# ===========================================================================
# Table_1.R  --  R replication of Table 1 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Nighttime lights predict regional GDP (the calibration / first-stage step).
# Seven specifications regress log regional GDP per capita on log average
# nighttime light per pixel, adding ever more fixed effects / controls:
#   (1) random effects, no FE              (4) (3) + national GDP per capita
#   (2) OLS with region FE + satellite FE  (5) RE + country-GROUP FE + sat FE
#   (3) RE + country FE + satellite FE     (6) (5) + national GDP per capita
#                                          (7) (6) + geography/pixel controls
#
# This is the R twin of Table_1.do. It reads the SAME data/Table_1_data.csv and
# should reproduce the same coefficients (see the comparison table in README.md).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","plm","fixest"))
#   - readr  : fast CSV reader
#   - plm    : panel models (loaded for context; the RE columns are estimated
#              with an explicit Swamy-Arora GLS step - see note below)
#   - fixest : fast fixed-effects regressions (feols), used for column (2)'s
#              ~1,500-region-dummy OLS - the R analogue of Stata's region FE
#
# WHY A MANUAL RANDOM-EFFECTS STEP? Stata's `xtreg, re` (default) is a
# Swamy-Arora GLS estimator that happily carries time-invariant regressors
# (the 81 country dummies, the World Bank group dummies) - they enter only the
# between part. plm's `plm(model="random")` cannot invert its variance-component
# system when such time-invariant dummies are present (it errors with
# "system is exactly singular"). So columns (1) and (3)-(7) use `xtreg_re()`
# below, a faithful re-implementation of Stata's Swamy-Arora RE: it (a) drops
# perfectly collinear columns, (b) estimates the idiosyncratic variance from the
# within regression (dropping time-invariant cols there), (c) estimates the
# group-effect variance from the between regression, (d) forms per-group theta,
# (e) quasi-demeans and runs OLS. This reproduces Stata to 3+ decimals.
#
# RUN:  Rscript Table_1.R      (from inside this folder, or from anywhere)
# OUTPUT: output/Table_1_R.txt (regression summaries) and
#         output/Table_1_results_R.csv (key numbers, for the README comparison)
# ===========================================================================

suppressMessages({ library(readr); library(plm); library(fixest) })

## --- 0. Make paths portable: run from this script's own folder -------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))
dir.create("output", showWarnings = FALSE)

## --- 1. Read the data (case-preserving names, exactly like Stata) ----------
# read_csv keeps the original upper/lower case of the column names, matching
# the do-file's `import delimited ... case(preserve)`.
d <- as.data.frame(read_csv("data/Table_1_data.csv", show_col_types = FALSE))
# Panel id = region (code_Coutry_Region); Stata's `xtset code_Coutry_Region year`.
id <- d$code_Coutry_Region

## --- 2. Swamy-Arora random-effects estimator (= Stata `xtreg, re`) ---------
# y: numeric vector; X: design matrix WITHOUT intercept; id: group (region) id.
# Returns the named coefficient vector (clustering handled separately).
xtreg_re <- function(y, X, id) {
  Xc <- cbind(`(Intercept)` = 1, X)                  # add the constant
  # Drop perfectly collinear columns (Stata silently omits them).
  qrX <- qr(Xc); Xc <- Xc[, sort(qrX$pivot[seq_len(qrX$rank)]), drop = FALSE]
  g <- as.integer(factor(id)); n <- length(y); ng <- max(g)
  Ti <- as.numeric(table(g)); Tbar <- n / ng         # group sizes, mean size
  gm <- function(v) ave(v, g)                         # within-group mean
  ybar <- gm(y); Xbar <- apply(Xc, 2, gm)
  # (a) WITHIN regression: demeaned data, dropping time-invariant cols (whose
  #     within variation is 0). Gives the idiosyncratic variance s2e.
  yw <- y - ybar; Xw <- Xc - Xbar
  wkeep <- which(apply(Xw, 2, function(c) sqrt(sum(c^2))) > 1e-8)
  fitw <- lm.fit(Xw[, wkeep, drop = FALSE], yw)
  s2e <- sum(fitw$residuals^2) / (n - ng - length(wkeep))
  # (b) BETWEEN regression on the one-row-per-group means. Gives s2b.
  ub <- !duplicated(g); yb <- ybar[ub]; Xb <- Xbar[ub, , drop = FALSE]
  bkeep <- which(apply(Xb, 2, sd) > 1e-8 | colnames(Xb) == "(Intercept)")
  fitb <- lm.fit(Xb[, bkeep, drop = FALSE], yb)
  s2b <- sum(fitb$residuals^2) / (ng - length(bkeep))
  # (c) group-effect variance and (d) per-group theta (Swamy-Arora)
  s2u   <- max(s2b - s2e / Tbar, 0)
  theta <- 1 - sqrt(s2e / (Ti * s2u + s2e))
  th    <- theta[g]
  # (e) quasi-demean by theta and run OLS -> the GLS (RE) coefficients
  coef(lm.fit(Xc - th * Xbar, y - th * ybar))
}

## --- 3. Right-hand-side helpers -------------------------------------------
# Satellite fixed effects: different satellites/sensors read light on slightly
# different scales, so each satellite-era gets its own intercept.
sat <- paste0("satyear_", 1:7)
# Country fixed effects (columns 3-4): 81 pre-built country dummies. The 81
# dummies sum to 1 in every row (all 81 countries present), so together with the
# intercept they are perfectly collinear; Stata's xtreg silently drops one. We
# drop country_dum81 (ZAF) to make the design full rank, identically to Stata.
cdum <- paste0("country_dum", 1:80)
# World Bank country-GROUP dummies (columns 5-7); omitted group = high income.
grp <- c("eap", "ssa", "mena", "lac", "eca", "sa")

# Response and a convenience wrapper that builds X from column names and fits RE.
y <- d$log_GDP_pc_Region
re <- function(vars) xtreg_re(y, as.matrix(d[vars]), id)

## --- 4. Estimate the 7 columns --------------------------------------------
# (1) Random effects, no fixed effects, no controls
b1 <- re("log_Light_ppix_Region")

# (2) OLS with REGION fixed effects + satellite FE. feols absorbs the ~1,500
#     region dummies after the "|"; cluster by country. This mirrors Stata's
#     `reg ... _Icode_Cout_* satyear_* , cluster(Country_ISO)`.
m2 <- feols(as.formula(paste(
        "log_GDP_pc_Region ~ log_Light_ppix_Region +",
        paste(sat, collapse = " + "), "| code_Coutry_Region")),
        data = d, cluster = ~Country_ISO)

# (3) RE with COUNTRY fixed effects + satellite FE
b3 <- re(c("log_Light_ppix_Region", cdum, sat))

# (4) Column (3) + national GDP per capita
b4 <- re(c("log_Light_ppix_Region", "log_GDP_pc_Country", cdum, sat))

# (5) RE with country-GROUP (World Bank region) FE + satellite FE
b5 <- re(c("log_Light_ppix_Region", sat, grp))

# (6) Column (5) + national GDP per capita
b6 <- re(c("log_Light_ppix_Region", "log_GDP_pc_Country", sat, grp))

# (7) THE PREDICTION MODEL: column (6) + geography & pixel-coding controls.
b7 <- re(c("log_Light_ppix_Region", "log_GDP_pc_Country",
           "log_N_pix_top_cod_1_ppix", "log_N_pix_low_cod_1_ppix",
           "log_area", "log_region", "log_region_X_log_area", sat, grp))

## --- 5. Pull the headline coefficients ------------------------------------
# log_Light_ppix_Region coefficient in each of the 7 columns (col 2 from feols).
v <- "log_Light_ppix_Region"
b_light <- c(b1[v], coef(m2)[v], b3[v], b4[v], b5[v], b6[v], b7[v])
b_gdpc7 <- b7["log_GDP_pc_Country"]           # col 7 national GDP elasticity
N  <- length(y)                               # region-years used
ng <- length(unique(d$code_Coutry_Region))    # number of regions

## --- 6. Export readable regression summaries ------------------------------
sink("output/Table_1_R.txt")
cat("Table 1 (R / Swamy-Arora RE + fixest FE) - lights predict regional GDP\n\n")
cat(sprintf("log_Light_ppix_Region by column (1)-(7):\n  %s\n\n",
            paste(sprintf("%.3f", b_light), collapse = " / ")))
cat(sprintf("col(7) log_GDP_pc_Country: %.3f\n", b_gdpc7))
cat(sprintf("N = %d region-years ; %d regions\n", N, ng))
sink()

## --- 7. Save key numbers for the cross-language comparison -----------------
res <- data.frame(
  metric = c(paste0("col", 1:7, "_log_Light_ppix_Region"),
             "col7_log_GDP_pc_Country", "N", "n_regions"),
  value  = c(b_light, b_gdpc7, N, ng))
write_csv(res, "output/Table_1_results_R.csv")

cat(sprintf("R  | log_Light by col: %s | col7 GDPpc=%.3f | N=%d | regions=%d\n",
    paste(sprintf("%.3f", b_light), collapse = "/"), b_gdpc7, N, ng))
cat("Wrote output/Table_1_R.txt and output/Table_1_results_R.csv\n")
