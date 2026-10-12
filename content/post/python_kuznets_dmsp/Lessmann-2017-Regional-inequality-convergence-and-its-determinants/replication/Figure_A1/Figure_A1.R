#!/usr/bin/env Rscript
# ===========================================================================
# Figure_A1.R  --  R replication of Figure A.1 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Validation / goodness-of-fit scatter for the night-lights income model.
# Each point is one region averaged over 2001-2010. X = model PREDICTED log
# regional GDP per capita; Y = OBSERVED log regional GDP per capita; the black
# 45-degree line (y = x) marks perfect prediction. Three overlaid clouds split
# regions by the World-Bank income tier of their COUNTRY (LIC / MIC / HIC).
#
# R twin of Figure_A1.do. Reads the SAME data/Figure_A1_data.csv and produces
# the same picture + the same key numbers (n regions, corr obs vs pred).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","ggplot2"))
#
# RUN:  Rscript Figure_A1.R
# OUTPUT: output/Figure_A1_R.png, output/Figure_A1_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(ggplot2) })  # readr=fast CSV, ggplot2=plot

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)               # capture the Rscript --file= path
fa <- sub("^--file=", "", args[grep("^--file=", args)]) # extract this script's own path
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))  # cd to the folder holding the script
dir.create("output", showWarnings = FALSE)              # ensure output/ exists (no warning if present)

## --- 1. read (case-sensitive headers, incl. source typo "code_Coutry_Region") -
d <- read_csv("data/Figure_A1_data.csv", show_col_types = FALSE)  # keep header names verbatim

## --- 2. decade window 2001-2010 -------------------------------------------
d <- subset(d, year > 2000 & year < 2011)               # same window as the .do (year>2000 & year<2011)

## --- 3. collapse to region means (one point per region) -------------------
# average every numeric series over the decade, grouped by the region id, so each
# region appears exactly once -- mirrors Stata's collapse (mean) ..., by(code_Coutry_Region).
num <- c("GDP_pc_Country","GDP_pc_Region","log_GDP_pc_Region",
         "pred_log_GDP_pc_Region","pred_GDP_pc_Region","Pix_Region","Pop_Region")
agg <- aggregate(d[num], by = list(code_Coutry_Region = d$code_Coutry_Region),
                 FUN = function(x) mean(x, na.rm = TRUE))

## --- 4. income tier from the COUNTRY GDP (World-Bank fixed-$ cutoffs) ------
# < 4089 = LIC ; 4089-12615 = MIC ; > 12615 = HIC (factor ordered for the legend).
agg$tier <- with(agg, ifelse(GDP_pc_Country < 4089, "LIC",
                      ifelse(GDP_pc_Country > 12615, "HIC", "MIC")))
agg$tier <- factor(agg$tier, levels = c("LIC","MIC","HIC"))

## --- 5. key numbers: n regions + corr(observed, predicted) ----------------
n_reg <- nrow(agg)                                      # number of region points plotted
corr  <- cor(agg$log_GDP_pc_Region, agg$pred_log_GDP_pc_Region,
             use = "complete.obs")                      # Pearson corr of obs vs pred log GDP

## --- 6. Figure A.1: three scatters + 45-degree line -----------------------
# shape per tier (triangle/plus/hollow circle echoing the Stata msymbol t/+/O);
# geom_abline(0,1) is the y=x reference; coord 5.5-12 matches the .do range.
p <- ggplot(agg, aes(pred_log_GDP_pc_Region, log_GDP_pc_Region, shape = tier)) +
  geom_abline(slope = 1, intercept = 0, colour = "black") +   # 45-degree line y = x
  geom_point(size = 1.6, alpha = 0.7) +
  scale_shape_manual(values = c(LIC = 2, MIC = 3, HIC = 1)) +  # triangle / plus / hollow circle
  coord_cartesian(xlim = c(5.5, 12), ylim = c(5.5, 12)) +      # same plotting box as Stata
  labs(title = "Figure A.1 (R): Predicted vs observed regional GDP",
       x = "log (predicted regional GDP per capita)",
       y = "log (observed regional GDP per capita)",
       shape = NULL) +
  annotate("text", x = 6, y = 11.5,                            # report the fit on the plot
           label = sprintf("n = %d  |  r = %.3f", n_reg, corr), hjust = 0, size = 3) +
  theme_bw(base_size = 10) +
  theme(legend.position = c(0.88, 0.18))                       # key INSIDE, lower-right (Stata pos 5)
ggsave("output/Figure_A1_R.png", p, width = 5.2, height = 4.6, dpi = 120)

## --- 7. key numbers for the comparison ------------------------------------
res <- data.frame(metric = c("n_regions","corr_obs_pred","n_LIC","n_MIC","n_HIC"),
                  value  = c(n_reg, corr,
                             sum(agg$tier == "LIC"),
                             sum(agg$tier == "MIC"),
                             sum(agg$tier == "HIC")))
write_csv(res, "output/Figure_A1_results_R.csv")
cat(sprintf("R  | n regions = %d | corr(obs,pred) = %.4f | LIC/MIC/HIC = %d/%d/%d\n",
            n_reg, corr, sum(agg$tier=="LIC"), sum(agg$tier=="MIC"), sum(agg$tier=="HIC")))
