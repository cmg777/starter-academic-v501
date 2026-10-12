#!/usr/bin/env Rscript
# ===========================================================================
# Figure_5.R  --  R replication of Figure 5a (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Cross-country scatter of INTERPERSONAL inequality (household income Gini,
# Giniall rescaled to 0-1) against INTERREGIONAL inequality (GINIW), each a
# 2001-2012 country mean, with a blue OLS fit line. Countries with wide gaps
# BETWEEN regions also tend to have wide gaps BETWEEN people (positive slope).
#
# R twin of Figure_5.do. Reads the SAME data/Figure_5_data.csv and produces
# the same picture + the same n / OLS slope (see README comparison).
#
# Panel 5b (risk of internal conflict vs GINIW) is NOT reproducible: it needs
# the licensed ICRG internal-conflict series, which ships with no dataset in
# this repo. We do not attempt it here (see do-file Sections 7-8, p.127).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","ggplot2"))
#
# RUN:  Rscript Figure_5.R
# OUTPUT: output/Figure_5_a_R.png, output/Figure_5_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(ggplot2) })   # readr=fast CSV, ggplot2=plot

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)                 # capture the --file= arg Rscript passes
fa <- sub("^--file=", "", args[grep("^--file=", args)])   # strip the prefix to get this script's path
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))    # cd to the script's folder (portable)
dir.create("output", showWarnings = FALSE)                # ensure output/ exists

## --- 1. read the country-year panel ---------------------------------------
d <- read_csv("data/Figure_5_data.csv", show_col_types = FALSE)  # case-preserved headers

## --- 2. restrict to the 2001-2012 window the paper averages over ----------
d <- subset(d, year > 2000 & year < 2013)                 # mirrors `keep if year>2000 & year<2013`

## --- 3. collapse the annual panel to ONE mean per country -----------------
# Stata: collapse (firstnm) Country_NAME (mean) GINIW_pred_GDP_pc Giniall, by(Country_ISO)
# aggregate with na.rm so a partly-missing series still yields the available mean.
agg <- aggregate(cbind(GINIW_pred_GDP_pc, Giniall) ~ Country_ISO, d,
                 function(x) mean(x, na.rm = TRUE), na.action = na.pass)

## --- 4. normalisation to [0,1] --------------------------------------------
# Giniall (household income Gini) is on a 0-100 scale; GINIW is on 0-1. Rescale
# so both axes are comparable. Countries with no household Gini drop out here.
agg$GINIall_100 <- agg$Giniall / 100                      # gen GINIall_100 = Giniall/100
plt <- subset(agg, is.finite(GINIall_100) & is.finite(GINIW_pred_GDP_pc))  # keep complete pairs

## --- 5. OLS fit line (the lfit overlay) -----------------------------------
# Regress interpersonal on interregional inequality; the slope is the headline.
fit   <- lm(GINIall_100 ~ GINIW_pred_GDP_pc, data = plt)  # least-squares fit, same as Stata lfit
slope <- coef(fit)[["GINIW_pred_GDP_pc"]]                 # OLS slope (expected > 0)
icept <- coef(fit)[["(Intercept)"]]                       # OLS intercept

## --- 6. Figure 5a: scatter + blue OLS line --------------------------------
p_a <- ggplot(plt, aes(GINIW_pred_GDP_pc, GINIall_100)) +
  geom_point(shape = 2) +                                 # shape 2 = open triangle (Stata msymbol(t))
  geom_smooth(method = "lm", se = FALSE, colour = "blue") + # blue OLS line, no CI band (lcolor(blue))
  labs(title = "Figure 5a (R): regional vs personal inequality",
       x = "Interregional inequality: GINIW",
       y = "Interpersonal inequality: GINI") +
  theme_bw(base_size = 10)
ggsave("output/Figure_5_a_R.png", p_a, width = 5, height = 4.5, dpi = 120)

## --- 7. key numbers for the comparison ------------------------------------
res <- data.frame(metric = c("n_countries","ols_slope","ols_intercept",
                             "mean_GINIW","mean_GINIall_100"),
                  value  = c(nrow(plt), slope, icept,
                             mean(plt$GINIW_pred_GDP_pc), mean(plt$GINIall_100)))
write_csv(res, "output/Figure_5_results_R.csv")
cat(sprintf("R  | n=%d countries | OLS slope %.4f (intercept %.4f)\n",
            nrow(plt), slope, icept))
