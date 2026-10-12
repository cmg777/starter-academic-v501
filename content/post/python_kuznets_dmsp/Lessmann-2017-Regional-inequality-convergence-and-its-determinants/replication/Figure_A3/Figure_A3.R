#!/usr/bin/env Rscript
# ===========================================================================
# Figure_A3.R  --  R replication of Figure A.3 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# USA 2010: night-lights PREDICTED log GDP per capita (x) vs OBSERVED log GDP
# per capita (y) for the 51 US states/regions, split into three price tiers by
# Regional Price Parity (RPP), with a 45-degree (y = x) reference line.
#   LRPP (low  price): RPP < 90.2          MRPP (mid): 90.2 < RPP < 102.8
#   HRPP (high price): RPP > 102.8
#
# R twin of Figure_A3.do. Reads the SAME data/Figure_A3_data.csv and draws the
# same picture (see README comparison).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","ggplot2"))
#
# RUN:  Rscript Figure_A3.R
# OUTPUT: output/Figure_A3_R.png, output/Figure_A3_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(ggplot2) })   # readr=fast CSV, ggplot2=plot

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)                 # capture the --file= arg
fa <- sub("^--file=", "", args[grep("^--file=", args)])   # extract this script's path
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))    # cd to the script's folder
dir.create("output", showWarnings = FALSE)                # ensure output/ exists

## --- 1. read --------------------------------------------------------------
# Column names are CASE-SENSITIVE; the .do reads them with case(preserve), so the
# names below match the CSV header exactly (Country_ISO, log_GDP_pc_Region, ...).
d <- read_csv("data/Figure_A3_data.csv", show_col_types = FALSE)

## --- 2. keep the USA in 2010 ----------------------------------------------
# Single cross-section. RPP is only populated for US states, so this filter also
# drops every row with a missing RPP (the figure plots only states that have one).
d <- subset(d, year == 2010 & Country_ISO == "USA")
n <- nrow(d)                                              # expect 51 states/regions
stopifnot(n == 51)                                        # manuscript sanity check

## --- 3. three price tiers by RPP cut-offs ---------------------------------
# Cut-offs 90.2 and 102.8 split the states into roughly equal thirds (same as .do).
d$tier <- with(d, ifelse(RPP < 90.2, "LRPP",
                  ifelse(RPP < 102.8, "MRPP", "HRPP")))   # < / 90.2-102.8 / >
d$tier <- factor(d$tier, levels = c("LRPP","MRPP","HRPP"))# fix legend order

## --- 4. headline number: correlation (predicted vs observed) --------------
r <- cor(d$pred_log_GDP_pc_Region, d$log_GDP_pc_Region)  # Pearson correlation

## --- 5. Figure A.3 --------------------------------------------------------
# Scatter coloured + shaped by tier, state-name labels, and the 45-degree line.
# slope=1, intercept=0 is exactly Stata's `function y=x`.
rng <- c(10.2, 11.1)                                      # same plotted range as .do
p <- ggplot(d, aes(pred_log_GDP_pc_Region, log_GDP_pc_Region,
                   colour = tier, shape = tier)) +
  geom_abline(slope = 1, intercept = 0, colour = "black") + # 45-degree y = x line
  geom_point(size = 2) +                                  # one point per state
  geom_text(aes(label = Region_NAME), vjust = -0.7, size = 2, show.legend = FALSE) +
  scale_shape_manual(values = c(LRPP = 2, MRPP = 3, HRPP = 1)) + # triangle/plus/circle
  coord_cartesian(xlim = rng, ylim = rng) +              # square 10.2-11.1 window
  labs(title = "Figure A.3 (R): USA 2010 - predicted vs observed regional GDP",
       x = "log (predicted regional GDP per capita)",
       y = "log (observed regional GDP per capita)",
       colour = "RPP tier", shape = "RPP tier") +
  theme_bw(base_size = 9) +
  theme(legend.position = c(0.88, 0.18))                 # legend inside, ~5 o'clock
ggsave("output/Figure_A3_R.png", p, width = 6, height = 5.2, dpi = 130)

## --- 6. key numbers for the comparison ------------------------------------
res <- data.frame(
  metric = c("n", "n_LRPP", "n_MRPP", "n_HRPP", "corr_pred_obs"),
  value  = c(n, sum(d$tier == "LRPP"), sum(d$tier == "MRPP"),
             sum(d$tier == "HRPP"), r))
write_csv(res, "output/Figure_A3_results_R.csv")
cat(sprintf("R  | n=%d | tiers L/M/H = %d/%d/%d | corr=%.4f\n",
            n, sum(d$tier == "LRPP"), sum(d$tier == "MRPP"),
            sum(d$tier == "HRPP"), r))
