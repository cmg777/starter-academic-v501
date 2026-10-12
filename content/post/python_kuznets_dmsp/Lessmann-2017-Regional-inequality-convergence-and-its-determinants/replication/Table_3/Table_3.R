#!/usr/bin/env Rscript
# ===========================================================================
# Table_3.R  --  R replication of Table 3 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Determinants of sigma-convergence: panel fixed-effects regressions on 5-year
# averages. Each column regresses a regional-inequality index on a CUBIC in log
# national GDP per capita, with country and period fixed effects.
#
# This is the R twin of Table_3.do. It reads the SAME data/Table_3_data.csv and
# should reproduce the same coefficients (see the comparison table in README.md).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","fixest","modelsummary"))
#   - readr        : fast CSV reader
#   - fixest       : fast fixed-effects regressions (feols), the R analogue of
#                    Stata's `xtreg, fe` with clustered standard errors
#   - modelsummary : export a publication-style regression table
#
# RUN:  Rscript Table_3.R      (from inside this folder, or from anywhere)
# OUTPUT: output/Table_3_R.txt (regression table) and
#         output/Table_3_results_R.csv (key numbers, for the README comparison)
# ===========================================================================

suppressMessages({ library(readr); library(fixest) })

## --- 0. Make paths portable: run from this script's own folder -------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))
dir.create("output", showWarnings = FALSE)

## --- 1. Read the trimmed data ---------------------------------------------
d <- read_csv("data/Table_3_data.csv", show_col_types = FALSE)

## --- 2. Collapse to 5-year averages (country x period) --------------------
# Label each year with its 5-year period, then average within country x period.
d <- subset(d, year >= 1990 & year <= 2014)
d$p5 <- with(d, ifelse(year<=1994,1, ifelse(year<=1999,2, ifelse(year<=2004,3,
              ifelse(year<=2009,4,5)))))
# Per-variable means with na.rm (mirrors Stata `collapse (mean)`, which averages
# each variable over its own non-missing values - NOT listwise deletion).
ineq <- c("GDP_pc_Country","GINIW_pred_GDP_pc","COVW_pred_GDP_pc",
          "GE_1W_pred_GDP_pc","GE_0W_pred_GDP_pc","GE_m1W_pred_GDP_pc")
agg <- aggregate(d[ineq], by = d[c("Country_ISO","p5")],
                 FUN = function(x) mean(x, na.rm = TRUE))

## --- 3. Build the cubic in log GDP per capita -----------------------------
agg$lg  <- log(agg$GDP_pc_Country)
agg$lg2 <- agg$lg^2
agg$lg3 <- agg$lg^3

## --- 4. Estimate the 7 columns --------------------------------------------
# feols(y ~ x | fe1 + fe2): the part after "|" are absorbed fixed effects
# (country + period), exactly like Stata's `xtreg, fe` + `i.p5year`.
# cluster = ~Country_ISO  ->  SEs clustered by country.
f_lin  <- GINIW_pred_GDP_pc ~ lg                | Country_ISO + p5
f_quad <- GINIW_pred_GDP_pc ~ lg + lg2          | Country_ISO + p5
cub <- function(dv) as.formula(paste(dv, "~ lg + lg2 + lg3 | Country_ISO + p5"))

m1 <- feols(f_lin,  agg, cluster = ~Country_ISO)
m2 <- feols(f_quad, agg, cluster = ~Country_ISO)
m3 <- feols(cub("GINIW_pred_GDP_pc"), agg, cluster = ~Country_ISO)
m4 <- feols(cub("COVW_pred_GDP_pc"),  agg, cluster = ~Country_ISO)
m5 <- feols(cub("GE_1W_pred_GDP_pc"), agg, cluster = ~Country_ISO)
m6 <- feols(cub("GE_0W_pred_GDP_pc"), agg, cluster = ~Country_ISO)
m7 <- feols(cub("GE_m1W_pred_GDP_pc"),agg, cluster = ~Country_ISO)
models <- list(m1,m2,m3,m4,m5,m6,m7)

## --- 5. Export a regression table -----------------------------------------
setFixest_dict(c(lg="log_GDP_pc_Country", lg2="log_GDP_pc_Country_2",
                 lg3="log_GDP_pc_Country_3", GINIW_pred_GDP_pc="GINIW",
                 COVW_pred_GDP_pc="COVW", GE_1W_pred_GDP_pc="Theil",
                 GE_0W_pred_GDP_pc="MLD", GE_m1W_pred_GDP_pc="GE(-1)"))
sink("output/Table_3_R.txt")
cat("Table 3 (R / fixest) - Determinants of sigma-convergence\n\n")
print(etable(models, se.below = TRUE, digits = 3))
sink()

## --- 6. Save key numbers for the cross-language comparison -----------------
res <- data.frame(
  metric = c("col3_GINIW_lg","col3_GINIW_lg2","col3_GINIW_lg3",
             "col4_COVW_lg","col4_COVW_lg2","col4_COVW_lg3",
             "N_col3","n_countries"),
  value  = c(coef(m3)["lg"], coef(m3)["lg2"], coef(m3)["lg3"],
             coef(m4)["lg"], coef(m4)["lg2"], coef(m4)["lg3"],
             nobs(m3), length(unique(agg$Country_ISO))))
write_csv(res, "output/Table_3_results_R.csv")

cat(sprintf("R  | GINIW cubic: %.3f / %.3f / %.3f | N=%d | countries=%d\n",
    coef(m3)["lg"], coef(m3)["lg2"], coef(m3)["lg3"],
    nobs(m3), length(unique(agg$Country_ISO))))
cat("Wrote output/Table_3_R.txt and output/Table_3_results_R.csv\n")
