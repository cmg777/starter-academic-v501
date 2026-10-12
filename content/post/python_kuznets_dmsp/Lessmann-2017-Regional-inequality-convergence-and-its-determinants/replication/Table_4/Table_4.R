#!/usr/bin/env Rscript
# ===========================================================================
# Table_4.R  --  R replication of Table 4 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Determinants of regional inequality WITH CONTROLS. Panel fixed-effects
# regressions on 5-year averages: each column keeps the CUBIC in log national
# GDP per capita from Table 3 and adds a different block of structural controls
# (resources+farming / openness / geography+transport / aid+schooling / ethnic).
# Country + period fixed effects, standard errors clustered by country.
#
# This is the R twin of Table_4.do. It reads the SAME data/Table_4_data.csv and
# should reproduce the same coefficients (see the comparison table in README.md).
#
# 5 COLUMNS, NOT 6: published column 4 uses `icrg_bureaucratic_qualitiy`, which
# is NOT in the shipped data, so it cannot be reproduced and is skipped here -
# exactly as in Table_4.do. The 5 columns map to published columns 1, 2, 3, 5, 6.
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","fixest"))
#   - readr   : fast CSV reader
#   - fixest  : fast fixed-effects regressions (feols), the R analogue of
#               Stata's `xtreg, fe` with clustered standard errors
#
# RUN:  Rscript Table_4.R       (from inside this folder, or from anywhere)
# OUTPUT: output/Table_4_R.txt (regression table) and
#         output/Table_4_results_R.csv (key numbers, for the README comparison)
# ===========================================================================

suppressMessages({ library(readr); library(fixest) })

## --- 0. Make paths portable: run from this script's own folder -------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))
dir.create("output", showWarnings = FALSE)

## --- 1. Read the trimmed data ---------------------------------------------
# read_csv keeps the original case-sensitive column names from the CSV header,
# mirroring Stata's `import delimited ... case(preserve)`.
d <- read_csv("data/Table_4_data.csv", show_col_types = FALSE)

## --- 2. Collapse to 5-year averages (country x period) --------------------
# Label each year with its 5-year period, then average within country x period.
d <- subset(d, year >= 1990 & year <= 2014)
d$p5 <- with(d, ifelse(year<=1994,1, ifelse(year<=1999,2, ifelse(year<=2004,3,
              ifelse(year<=2009,4,5)))))
# Variables to average. Per-variable means with na.rm (mirrors Stata
# `collapse (mean)`, which averages each variable over its own non-missing
# values - NOT listwise deletion across variables).
vars <- c("GINIW_pred_GDP_pc","GDP_pc_Country","Pop_Country",
          "Resources_rents_share_of_GDP","Arable_land",
          "Trade_GDP_share","FDI_share_of_GDP",
          "area","price_gasoline","Aid","School_enrollment_secondary",
          "GINIW_Eth_light")
agg <- aggregate(d[vars], by = d[c("Country_ISO","p5")],
                 # mean over non-missing values; NaN (all-missing) handled below
                 FUN = function(x) mean(x, na.rm = TRUE))
# aggregate returns NaN where every value in a group was NA; convert to NA so
# feols treats those cells as missing (and drops them), like Stata.
agg[vars] <- lapply(agg[vars], function(x) { x[is.nan(x)] <- NA; x })

## --- 3. Build the cubic in log GDP per capita -----------------------------
agg$log_GDP_pc_Country   <- log(agg$GDP_pc_Country)
agg$log_GDP_pc_Country_2 <- agg$log_GDP_pc_Country^2
agg$log_GDP_pc_Country_3 <- agg$log_GDP_pc_Country^3

## --- 4. Build the derived control variables (same as Table_4.do) ----------
# aid_GDP : aid as a share of national GDP (Aid is a level; GDP_pc x Pop = GDP).
agg$aid_GDP <- agg$Aid / (agg$GDP_pc_Country * agg$Pop_Country)
# Rescale percentages to shares so coefficients are comparable.
agg$Resources_rents_share_of_GDP <- agg$Resources_rents_share_of_GDP / 100
agg$School_enrollment_secondary  <- agg$School_enrollment_secondary  / 100
# Area x fuel price (transport-cost proxy), scaled by 10e+6 = 1e7 to keep units small.
agg$Area_X_price_gasoline <- agg$area * agg$price_gasoline / 10e+6

## --- 5. Estimate the 5 reproducible columns -------------------------------
# feols(y ~ controls | fe1 + fe2): the part after "|" are absorbed fixed effects
# (country + period), exactly like Stata's `xtreg, fe` + `i.p5year`.
# cluster = ~Country_ISO  ->  SEs clustered by country.
cubic <- "log_GDP_pc_Country + log_GDP_pc_Country_2 + log_GDP_pc_Country_3"
ff <- function(extra) as.formula(paste0(
        "GINIW_pred_GDP_pc ~ ", cubic, " + ", extra,
        " | Country_ISO + p5"))

m1 <- feols(ff("Resources_rents_share_of_GDP + Arable_land"),     agg, cluster=~Country_ISO) # col 1: resources + farming
m2 <- feols(ff("Trade_GDP_share + FDI_share_of_GDP"),             agg, cluster=~Country_ISO) # col 2: openness
m3 <- feols(ff("price_gasoline + Area_X_price_gasoline"),         agg, cluster=~Country_ISO) # col 3: geography + transport
m4 <- feols(ff("aid_GDP + School_enrollment_secondary"),          agg, cluster=~Country_ISO) # col 4 (=pub 5): aid + schooling
m5 <- feols(ff("GINIW_Eth_light"),                                agg, cluster=~Country_ISO) # col 5 (=pub 6): ethnic inequality
models <- list(m1, m2, m3, m4, m5)

## --- 6. Export a regression table -----------------------------------------
sink("output/Table_4_R.txt")
cat("Table 4 (R / fixest) - Determinants of regional inequality with controls\n")
cat("5 reproducible columns = published columns 1, 2, 3, 5, 6.\n")
cat("Published column 4 (icrg_bureaucratic_qualitiy) is NOT reproducible - skipped.\n\n")
print(etable(models, se.below = TRUE, digits = 3))
sink()

## --- 7. Save key numbers for the cross-language comparison -----------------
res <- data.frame(
  metric = c("col1_rents","col1_arable","N_col1",
             "col2_trade","col2_FDI","N_col2",
             "col3_gasoline","col3_Area_X_gasoline","N_col3",
             "col4_aid_GDP","col4_school","N_col4",
             "col5_ethnic","N_col5"),
  value  = c(coef(m1)["Resources_rents_share_of_GDP"], coef(m1)["Arable_land"], nobs(m1),
             coef(m2)["Trade_GDP_share"], coef(m2)["FDI_share_of_GDP"], nobs(m2),
             coef(m3)["price_gasoline"], coef(m3)["Area_X_price_gasoline"], nobs(m3),
             coef(m4)["aid_GDP"], coef(m4)["School_enrollment_secondary"], nobs(m4),
             coef(m5)["GINIW_Eth_light"], nobs(m5)))
write_csv(res, "output/Table_4_results_R.csv")

cat(sprintf("R | (1) rents %.3f arable %.3f N=%d | (2) trade %.3f FDI %.3f N=%d | (3) gas %.3f AreaXgas %.3f N=%d | (4) aid %.3f school %.3f N=%d | (5) ethnic %.3f N=%d\n",
    coef(m1)["Resources_rents_share_of_GDP"], coef(m1)["Arable_land"], nobs(m1),
    coef(m2)["Trade_GDP_share"], coef(m2)["FDI_share_of_GDP"], nobs(m2),
    coef(m3)["price_gasoline"], coef(m3)["Area_X_price_gasoline"], nobs(m3),
    coef(m4)["aid_GDP"], coef(m4)["School_enrollment_secondary"], nobs(m4),
    coef(m5)["GINIW_Eth_light"], nobs(m5)))
cat("Wrote output/Table_4_R.txt and output/Table_4_results_R.csv\n")
