#!/usr/bin/env Rscript
# ===========================================================================
# Table_B4.R  --  R replication of Table B.4 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Spatial-HAC (Conley) robustness of the nighttime-lights -> GDP regression.
# Re-estimates Table 1 column 2 -- log regional GDP per capita on log regional
# light per pixel, with REGION fixed effects and 7 SATELLITE dummies -- and then
# replaces the standard errors with spatially-robust (Conley/Hsiang) SEs at three
# cutoff radii (1000 / 2500 / 5000 km). The POINT ESTIMATE (0.190) is identical
# to Table 1 col 2; only the standard errors change with the radius.
#
# This is the R twin of Table_B4.do. It reads the SAME data/Table_B4_data.csv and
# reproduces the same point estimate (see the comparison table in README.md).
# The Stata table uses Solomon Hsiang's `ols_spatial_HAC` (NOT on SSC, see §4 of
# the README). That exact estimator has no drop-in R package here (e.g.
# `conleyreg` is not installed), so we (a) get the point estimate from a fast
# within-region OLS and (b) implement a small self-contained Conley spatial-HAC
# variance estimator from the Latitude/Longitude centroids + a Bartlett kernel.
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","fixest"))
#   - readr  : fast CSV reader
#   - fixest : fast fixed-effects regressions (feols), the R analogue of Stata's
#              region-FE OLS; used here to absorb the ~1,500 region dummies.
#
# RUN:  Rscript Table_B4.R       (from inside this folder, or from anywhere)
# OUTPUT: output/Table_B4_R.txt (regression summary) and
#         output/Table_B4_results_R.csv (key numbers, for the README comparison)
# ===========================================================================

suppressMessages({ library(readr); library(fixest) })

## --- 0. Make paths portable: run from this script's own folder -------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))
dir.create("output", showWarnings = FALSE)

## --- 1. Read the trimmed data ---------------------------------------------
# read_csv keeps the original (case-sensitive) column names from the CSV header,
# matching the Stata do-file's `import delimited ... case(preserve)`.
d <- read_csv("data/Table_B4_data.csv", show_col_types = FALSE)

## --- 2. Estimate the point estimate (= Table 1 col 2) ----------------------
# feols(y ~ x + sat dummies | region): the part after "|" are absorbed region
# fixed effects (code_Coutry_Region), exactly Stata's _Icode_Cout_* dummies.
# The 7 satellite dummies enter as ordinary regressors (sensor fixed effects).
sat <- paste0("satyear_", 1:7)                                  # 7 satellite dummies
f <- as.formula(paste("log_GDP_pc_Region ~ log_Light_ppix_Region +",
                      paste(sat, collapse = " + "),
                      "| code_Coutry_Region"))
m <- feols(f, data = d)
b_light <- unname(coef(m)["log_Light_ppix_Region"])             # the headline elasticity

## --- 3. Conley spatial-HAC standard errors --------------------------------
# Hsiang's ols_spatial_HAC builds a spatial-HAC "meat" matrix: residual cross-
# products of observations are weighted by a Bartlett kernel in great-circle
# distance, so errors of regions closer than `dist` km may be correlated.
# We rebuild the SAME OLS by partialling out region FE + satellite dummies
# (Frisch-Waugh) and then form the single-regressor Conley variance ourselves.

# 3a. Partial region FE + satellite dummies out of y and the light variable.
#     resid of feols already nets out the absorbed region FE AND the dummies for
#     the full model; for the FWL-style scalar variance we need the residualised
#     regressor x~ and the model residuals u.
df <- d[complete.cases(d[, c("log_GDP_pc_Region","log_Light_ppix_Region",
                             "Latitude","Longitude", sat, "code_Coutry_Region")]), ]
# Drop singleton regions (observed only once): a within-region estimator gives
# them zero residual weight, and fixest removes them automatically. Removing
# them here keeps the residual/score/id vectors aligned to one estimation sample.
keep <- df$code_Coutry_Region %in%
  names(which(table(df$code_Coutry_Region) > 1))
df <- df[keep, ]
# Residualise the regressor on region FE + satellite dummies (x tilde):
xfit <- feols(as.formula(paste("log_Light_ppix_Region ~",
                               paste(sat, collapse = " + "),
                               "| code_Coutry_Region")), data = df)
xt <- resid(xfit)                                              # x with FE+sat removed
# Model residuals u for the SAME estimation sample:
mf <- feols(f, data = df)
u  <- resid(mf)
xu <- xt * u                                                   # score contributions
sxx <- sum(xt^2)                                              # bread denominator (X'X)

# 3b. Great-circle distance (km) between region centroids (Haversine).
#     One row per region (centroids are constant within region).
ids   <- df$code_Coutry_Region
lat_r <- df$Latitude  * pi/180
lon_r <- df$Longitude * pi/180
R_EARTH <- 6371                                              # mean Earth radius, km

# 3c. Conley variance: sum over obs pairs i,j of x~_i u_i * x~_j u_j * k(d_ij),
#     with a Bartlett kernel k = max(0, 1 - d/dist). To keep this O(n^2) over
#     ~5,200 obs tractable, we aggregate scores to the region level first (the
#     spatial structure is at the region centroid) and weight region-pair sums.
agg <- tapply(xu, ids, sum)                                   # region-summed scores
ulat <- tapply(lat_r, ids, function(z) z[1])                  # one centroid per region
ulon <- tapply(lon_r, ids, function(z) z[1])
nr <- length(agg)

conley_var <- function(dist_km) {
  v <- 0
  for (i in seq_len(nr)) {
    # Haversine distance from region i to all regions (vectorised inner loop).
    dlat <- ulat - ulat[i]; dlon <- ulon - ulon[i]
    a <- sin(dlat/2)^2 + cos(ulat[i]) * cos(ulat) * sin(dlon/2)^2
    dij <- 2 * R_EARTH * asin(pmin(1, sqrt(a)))               # great-circle km
    w <- pmax(0, 1 - dij / dist_km)                           # Bartlett kernel weights
    v <- v + agg[i] * sum(w * agg)                            # weighted score cross-products
  }
  v / (sxx^2)                                                 # sandwich: bread * meat * bread
}

radii <- c(1000, 2500, 5000)
se_conley <- sqrt(vapply(radii, conley_var, numeric(1)))     # Conley SE per radius
names(se_conley) <- paste0("r", radii)

## --- 4. Export a short summary --------------------------------------------
sink("output/Table_B4_R.txt")
cat("Table B.4 (R) - Conley spatial-HAC robustness of lights -> GDP\n\n")
cat(sprintf("log_Light_ppix_Region point estimate: %.3f\n", b_light))
cat(sprintf("N (estimation sample): %d\n\n", nobs(mf)))
cat("Conley spatial-HAC standard errors (Bartlett kernel):\n")
for (k in seq_along(radii))
  cat(sprintf("  r:%d km : SE = %.3f\n", radii[k], se_conley[k]))
sink()

## --- 5. Save key numbers for the cross-language comparison -----------------
res <- data.frame(
  metric = c("light_coef_r1000","light_coef_r2500","light_coef_r5000",
             "conley_se_r1000","conley_se_r2500","conley_se_r5000","N"),
  value  = c(b_light, b_light, b_light,
             se_conley["r1000"], se_conley["r2500"], se_conley["r5000"],
             nobs(mf)))
write_csv(res, "output/Table_B4_results_R.csv")

cat(sprintf("R  | log_Light coef = %.3f (all 3 cols) | Conley SE: %.3f / %.3f / %.3f | N=%d\n",
    b_light, se_conley["r1000"], se_conley["r2500"], se_conley["r5000"], nobs(mf)))
cat("Wrote output/Table_B4_R.txt and output/Table_B4_results_R.csv\n")
