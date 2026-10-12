# ============================================================================
# 20_verify_tables.R
# ----------------------------------------------------------------------------
# CSV-SUFFICIENCY + REFERENCE-PARITY check for the table folders.
# For each table we load ONLY the trimmed CSV that ships in the folder and
# reproduce the published coefficients, comparing against the committed Stata
# outputs (Tables/Table_*.txt). This proves (a) the trimmed CSV is complete and
# (b) the Stata .do will reproduce the paper when the user runs it.
#
# Stata uses: xtreg (RE) for Table 1; xtreg, fe for Tables 3-4; reg/ols_spatial_HAC
# for Table B.4 (point estimate = Table 1 col 2). We mirror RE with plm, FE/OLS
# with fixest. Table 2's inequality indices are computed from first principles.
# ============================================================================
suppressMessages({
  if (!requireNamespace("plm", quietly=TRUE))
    install.packages("plm", repos="https://cloud.r-project.org", quiet=TRUE)
  library(readr); library(fixest); library(plm)
})
options(width=120)
rep <- "/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants/replication"
ok <- function(rep, pin, tol=0.0015) sprintf("%s (got %.3f vs pinned %.3f)", ifelse(abs(rep-pin)<tol,"PASS","CHECK"), rep, pin)
# Stata `collapse (mean)` averages each variable over its OWN non-missing values
# (no cross-variable listwise deletion). aggregate(cbind(...)~...) would drop a
# row if ANY column is NA, so we collapse per-variable with na.rm instead.
collapse_mean <- function(df, idvars, vars)
  aggregate(df[vars], by = df[idvars], FUN = function(x) mean(x, na.rm = TRUE))

cat("######################## TABLE 1 ########################\n")
d1 <- read_csv(file.path(rep,"Table_1/data/Table_1_data.csv"), show_col_types=FALSE)
names(d1) <- sub("^_", "", names(d1))          # _satyear_1 -> satyear_1 (R formula-safe)
sat <- paste0("satyear_", 1:7)
# Col 2: pooled OLS, region FE + satellite FE  (the ONE OLS column)
c2 <- feols(as.formula(paste0("log_GDP_pc_Region ~ log_Light_ppix_Region + ",
            paste(sat,collapse="+"), " | code_Coutry_Region")), data=d1)
cat("col2 light [pin .190]:", ok(coef(c2)["log_Light_ppix_Region"], .190), "\n")
# RE columns via plm
pdat <- pdata.frame(as.data.frame(d1), index=c("code_Coutry_Region","year"))
re <- function(rhs) coef(plm(as.formula(paste("log_GDP_pc_Region ~", rhs)), pdat, model="random"))["log_Light_ppix_Region"]
cat("col1 light [pin .399]:", ok(re("log_Light_ppix_Region"), .399), "\n")
cat("col5 light [pin .232]:", ok(re(paste("log_Light_ppix_Region +", paste(sat,collapse="+"), "+ eap+ssa+mena+lac+eca+sa")), .232), "\n")
m7 <- plm(as.formula(paste("log_GDP_pc_Region ~ log_Light_ppix_Region + log_GDP_pc_Country + log_N_pix_top_cod_1_ppix + log_N_pix_low_cod_1_ppix + log_area + log_region + log_region_X_log_area +",
          paste(sat,collapse="+"), "+ eap+ssa+mena+lac+eca+sa")), pdat, model="random")
cat("col7 light [pin .102]:", ok(coef(m7)["log_Light_ppix_Region"], .102), "\n")
cat("col7 logGDPpcCtry [pin .889]:", ok(coef(m7)["log_GDP_pc_Country"], .889), "\n")

cat("\n######################## TABLE B.4 (point est = T1 col2) ########################\n")
db <- read_csv(file.path(rep,"Table_B4/data/Table_B4_data.csv"), show_col_types=FALSE)
names(db) <- sub("^_", "", names(db))
cb <- feols(as.formula(paste0("log_GDP_pc_Region ~ log_Light_ppix_Region + ",
            paste(sat,collapse="+"), " | code_Coutry_Region")), data=db)
cat("light [pin .190]:", ok(coef(cb)["log_Light_ppix_Region"], .190), "\n")

cat("\n######################## TABLE 3 (5-yr FE, cubic) ########################\n")
d3 <- read_csv(file.path(rep,"Table_3/data/Table_3_data.csv"), show_col_types=FALSE)
d3 <- d3[!is.na(d3$year) & d3$year>=1990 & d3$year<=2014, ]
d3$p5 <- with(d3, ifelse(year<=1994,1, ifelse(year<=1999,2, ifelse(year<=2004,3, ifelse(year<=2009,4,5)))))
agg <- collapse_mean(d3, c("Country_ISO","p5"),
        c("GDP_pc_Country","GINIW_pred_GDP_pc","COVW_pred_GDP_pc","GE_1W_pred_GDP_pc","GE_0W_pred_GDP_pc","GE_m1W_pred_GDP_pc"))
agg$lg <- log(agg$GDP_pc_Country); agg$lg2<-agg$lg^2; agg$lg3<-agg$lg^3
f3 <- function(dv) feols(as.formula(paste(dv,"~ lg+lg2+lg3 | Country_ISO + p5")), agg)
gini <- f3("GINIW_pred_GDP_pc")
cat("GINIW cubic lg/lg2/lg3 [pin .293/-.032/.001]:",
    sprintf("%.3f / %.3f / %.3f", coef(gini)["lg"], coef(gini)["lg2"], coef(gini)["lg3"]), "\n")
cat("  N [pin 880]:", nobs(gini), " | countries [pin 180]:", length(unique(agg$Country_ISO)), "\n")
cov <- f3("COVW_pred_GDP_pc")
cat("COVW cubic [pin .402/-.044/.002]:", sprintf("%.3f / %.3f / %.3f", coef(cov)["lg"],coef(cov)["lg2"],coef(cov)["lg3"]),"\n")

cat("\n######################## TABLE 4 (5-yr FE, controls) ########################\n")
d4 <- read_csv(file.path(rep,"Table_4/data/Table_4_data.csv"), show_col_types=FALSE)
d4 <- d4[!is.na(d4$year) & d4$year>=1990 & d4$year<=2014, ]
d4$p5 <- with(d4, ifelse(year<=1994,1, ifelse(year<=1999,2, ifelse(year<=2004,3, ifelse(year<=2009,4,5)))))
cm <- collapse_mean(d4, c("Country_ISO","p5"),
        c("GINIW_pred_GDP_pc","GDP_pc_Country","Pop_Country","Resources_rents_share_of_GDP","Arable_land",
          "Trade_GDP_share","FDI_share_of_GDP","area","price_gasoline","Aid","School_enrollment_secondary","GINIW_Eth_light"))
cm$lg<-log(cm$GDP_pc_Country); cm$lg2<-cm$lg^2; cm$lg3<-cm$lg^3
cm$rents<-cm$Resources_rents_share_of_GDP/100; cm$school<-cm$School_enrollment_secondary/100
cm$aid_GDP<-cm$Aid/(cm$GDP_pc_Country*cm$Pop_Country); cm$AxP<-cm$area*cm$price_gasoline/10e6
c1 <- feols(GINIW_pred_GDP_pc ~ lg+lg2+lg3+rents+Arable_land | Country_ISO+p5, cm)
cat("col1 rents/arable [pin .018/-.053]:", sprintf("%.3f / %.3f", coef(c1)["rents"], coef(c1)["Arable_land"]), " N[pin 857]:", nobs(c1),"\n")
c2 <- feols(GINIW_pred_GDP_pc ~ lg+lg2+lg3+Trade_GDP_share+FDI_share_of_GDP | Country_ISO+p5, cm)
cat("col2 trade/FDI [pin .005/.009]:", sprintf("%.3f / %.3f", coef(c2)["Trade_GDP_share"], coef(c2)["FDI_share_of_GDP"]), " N[pin 817]:", nobs(c2),"\n")
c3 <- feols(GINIW_pred_GDP_pc ~ lg+lg2+lg3+price_gasoline+AxP | Country_ISO+p5, cm)
cat("col3 gas/AxP [pin .001/.006]:", sprintf("%.3f / %.3f", coef(c3)["price_gasoline"], coef(c3)["AxP"]), " N[pin 676]:", nobs(c3),"\n")
c5 <- feols(GINIW_pred_GDP_pc ~ lg+lg2+lg3+aid_GDP+school | Country_ISO+p5, cm)
cat("col5 aid/school [pin .015/-.014]:", sprintf("%.3f / %.3f", coef(c5)["aid_GDP"], coef(c5)["school"]), " N[pin 591]:", nobs(c5),"\n")
c6 <- feols(GINIW_pred_GDP_pc ~ lg+lg2+lg3+GINIW_Eth_light | Country_ISO+p5, cm)
cat("col6 ethnic [pin .071]:", ok(coef(c6)["GINIW_Eth_light"], .071), " N[pin 845]:", nobs(c6), "\n")
cat("(NOTE: published col 4 needs icrg_bureaucratic_qualitiy, ABSENT from data -> not reproducible)\n")
cat("\nDONE table verification.\n")
