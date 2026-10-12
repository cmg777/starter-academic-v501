#!/usr/bin/env Rscript
# ===========================================================================
# run_all.R  --  R port of the 00_Main_Dataset pipeline (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Rebuilds the master dataset from the raw nighttime-lights panels, mirroring
# config.do + 01/02/03_*.do:
#   STEP 1  estimate lights -> regional GDP (Table 1 col 7) and predict worldwide
#   STEP 2  population-weighted regional inequality per country-year
#   STEP 3  merge with country controls -> Main_Data
#
# R twin of the Stata pipeline. Edit the CONFIG block to point at new lights data.
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","plm"))
#   - plm : random-effects panel estimator (the R analogue of Stata `xtreg, re`)
#
# RUN:  Rscript run_all.R          OUTPUT: output/Main_Data_R.csv (+ spot-checks)
# ===========================================================================
suppressMessages({ library(readr); library(plm) })

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))
dir.create("output", showWarnings = FALSE)

## ====================== CONFIG (edit for new data) ========================
F_TRAIN   <- "data/Prediction_Data.csv"
F_WORLD   <- "data/Regional_Data_SL.csv"
F_COUNTRY <- "data/Country_DATA.csv"
ID_REGION  <- "code_Coutry_Region"; ID_COUNTRY <- "Country_ISO"; TIME <- "year"
LIGHTS  <- "log_Light_ppix_Region"
X_CORE  <- c("log_GDP_pc_Country","log_N_pix_top_cod_1_ppix","log_N_pix_low_cod_1_ppix","log_area","log_region")
X_INTER <- "log_region_X_log_area"          # name in TRAINING file
WORLD_INTER <- "log_region_log_area"        # name in WORLD file
FE_SAT  <- paste0("satyear_", 1:7)
FE_GROUP<- c("eap","ssa","mena","lac","eca","sa")
DEPVAR  <- "log_GDP_pc_Region"
POP_REGION <- "Pop_Region"; POP_COUNTRY <- "Pop_Country"
INEQ_WEIGHT <- "Pop_Region"
## ==========================================================================

RHS <- c(LIGHTS, X_CORE, X_INTER, FE_SAT, FE_GROUP)

## --- STEP 1: estimate lights->GDP (random effects) and predict worldwide ---
cat("STEP 1: prediction model...\n")
train <- read_csv(F_TRAIN, show_col_types = FALSE)
ptr <- pdata.frame(as.data.frame(train), index = c(ID_REGION, TIME))
f1 <- as.formula(paste(DEPVAR, "~", paste(RHS, collapse = " + ")))
m <- plm(f1, ptr, model = "random")          # xtreg ... , re
b <- coef(m)
cat(sprintf("  beta[log lights] = %.4f ; beta[log GDP pc country] = %.4f\n",
            b[LIGHTS], b["log_GDP_pc_Country"]))

# apply coefficients to the whole world (rename the interaction to match)
world <- read_csv(F_WORLD, show_col_types = FALSE)
names(world)[names(world) == WORLD_INTER] <- X_INTER
lp <- rep(b[["(Intercept)"]], nrow(world))
for (v in RHS) lp <- lp + b[[v]] * world[[v]]
world$pred_GDP_pc_Region <- exp(lp)
world <- world[is.finite(world$pred_GDP_pc_Region), ]

## --- STEP 2: population-weighted inequality per country-year --------------
cat("STEP 2: inequality indices (weighted)...\n")
# weighted Gini / GE(-1) / MLD / Theil / CV (CV via GE(2)); same formulas as Stata ineqdeco
winq <- function(y, w) {
  ok <- is.finite(y) & is.finite(w) & y > 0 & w > 0; y <- y[ok]; w <- w[ok]
  if (length(y) < 2) return(c(GINIW=NA, GE_m1W=NA, GE_0W=NA, GE_1W=NA, COVW=NA))
  W <- sum(w); mu <- sum(w*y)/W; r <- y/mu; p <- w/W
  c(GINIW  = sum(outer(w,w)*abs(outer(y,y,"-")))/(2*W^2*mu),
    GE_m1W = 0.5*(sum(p/r)-1), GE_0W = sum(p*-log(r)), GE_1W = sum(p*r*log(r)),
    COVW   = sqrt(2*(0.5*(sum(p*r^2)-1))))
}
grp <- interaction(world[[ID_COUNTRY]], world[[TIME]], drop = TRUE)
idx <- do.call(rbind, by(world, grp, function(s)
  data.frame(Country_ISO = s[[ID_COUNTRY]][1], year = s[[TIME]][1],
             t(winq(s$pred_GDP_pc_Region, s[[INEQ_WEIGHT]])))))
names(idx) <- c("Country_ISO","year","GINIW_pred_GDP_pc","GE_m1W_pred_GDP_pc",
                "GE_0W_pred_GDP_pc","GE_1W_pred_GDP_pc","COVW_pred_GDP_pc")

## --- STEP 3: merge with country controls ----------------------------------
cat("STEP 3: merge with country controls...\n")
ctry <- read_csv(F_COUNTRY, show_col_types = FALSE)
main <- merge(ctry, idx, by = c("Country_ISO","year"))   # keep matches
write_csv(main, "output/Main_Data_R.csv")

## --- spot-checks for the cross-language comparison -------------------------
spot <- main[main$Country_ISO == "DEU" & main$year == 2010, "GINIW_pred_GDP_pc"]
res <- data.frame(metric = c("beta_log_lights","beta_log_gdp_pc_country",
                             "n_country_years","GINIW_DEU_2010"),
                  value = c(b[LIGHTS], b["log_GDP_pc_Country"], nrow(main),
                            ifelse(length(spot), spot[1], NA)))
write_csv(res, "output/Main_Data_results_R.csv")
cat(sprintf("DONE R | rows=%d | GINIW(DEU,2010)=%.4f\n", nrow(main),
            ifelse(length(spot), spot[1], NA)))
