#!/usr/bin/env Rscript
# ===========================================================================
# Figure_B3.R  --  R replication of Figure B.3 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Regional inequality (GINIW) in Germany, 2000-2012: a single-country
# time-series line plot of within-country regional inequality. It shows how
# Germany's partial regional inequality (the population-weighted Gini of
# predicted regional income) evolves year by year.
#
# R twin of Figure_B3.do. Reads the SAME data/Figure_B3_data.csv, subsets to
# Germany 2000-2012, and draws the same 13-point line (see README comparison).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","ggplot2"))
#
# RUN:  Rscript Figure_B3.R
# OUTPUT: output/Figure_B3_R.png, output/Figure_B3_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(ggplot2) })  # readr=fast CSV; ggplot2=plot

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)               # capture full call incl. --file=
fa <- sub("^--file=", "", args[grep("^--file=", args)]) # extract this script's path
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))  # run from the script's folder
dir.create("output", showWarnings = FALSE)              # ensure output/ exists

## --- 1. read data ---------------------------------------------------------
# Column names are CASE-SENSITIVE and preserved exactly as in the CSV header
# (Country_ISO, year, GINIW_pred_GDP_pc) -- mirrors import delimited, case(preserve).
d <- read_csv("data/Figure_B3_data.csv", show_col_types = FALSE)

## --- 2. subset to Germany 2000-2012 ---------------------------------------
# keep if Country_ISO=="DEU"  -> the German country panel only
# keep if year>1999 & year<2013 -> the 2000-2012 window (13 yearly rows)
g <- subset(d, Country_ISO == "DEU" & year > 1999 & year < 2013)
g <- g[order(g$year), ]                                 # ensure chronological order

## --- 3. Figure B.3 (line plot) --------------------------------------------
# twoway line of GINIW against year. Axis limits/breaks mirror the do-file:
#   xlabel(2000(2)2012)            -> x ticks every 2 years
#   ylabel(0.025(0.002)0.035)      -> y window pinned to the paper's band, no grid
p <- ggplot(g, aes(year, GINIW_pred_GDP_pc)) +
  geom_line(colour = "black") +                         # single black series (no legend)
  scale_x_continuous(breaks = seq(2000, 2012, 2)) +     # ticks every 2 years
  coord_cartesian(ylim = c(0.025, 0.035)) +             # pin y-range to paper window
  labs(title = "Figure B.3 (R): Regional inequality in Germany, 2000-2012",
       x = "Year", y = "Partial regional inequality (GINIW)") +
  theme_bw(base_size = 10) +
  theme(panel.grid.major.y = element_blank(),           # nogrid: drop horizontal grid
        panel.grid.minor.y = element_blank())
ggsave("output/Figure_B3_R.png", p, width = 3.1, height = 2.8, dpi = 200)  # paper aspect

## --- 4. key numbers for the comparison ------------------------------------
v2000 <- g$GINIW_pred_GDP_pc[g$year == 2000]            # first plotted point
v2012 <- g$GINIW_pred_GDP_pc[g$year == 2012]            # last plotted point
res <- data.frame(metric = c("n_points","GINIW_2000","GINIW_2012","GINIW_min","GINIW_max"),
                  value  = c(nrow(g), v2000, v2012, min(g$GINIW_pred_GDP_pc),
                             max(g$GINIW_pred_GDP_pc)))
write_csv(res, "output/Figure_B3_results_R.csv")
cat(sprintf("R  | n_points %d | GINIW 2000 %.5f -> 2012 %.5f\n",
            nrow(g), v2000, v2012))
