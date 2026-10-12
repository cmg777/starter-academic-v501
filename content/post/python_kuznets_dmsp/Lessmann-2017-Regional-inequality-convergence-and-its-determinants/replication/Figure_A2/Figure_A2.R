#!/usr/bin/env Rscript
# ===========================================================================
# Figure_A2.R  --  R replication of Figure A.2 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Validation scatter: satellite-PREDICTED regional GDP per capita (x) vs
# directly OBSERVED regional GDP per capita (y), 2001-2010 averages, with each
# region split into three REGIONAL OUTPUT-DENSITY tiers (LDIR/MDIR/HDIR) plus
# the 45-degree (y = x) perfect-prediction line.
#
# R twin of Figure_A2.do. Reads the SAME data/Figure_A2_data.csv and reports the
# same headline numbers (n regions + corr(observed, predicted); see README).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","dplyr","ggplot2"))
#
# RUN:  Rscript Figure_A2.R
# OUTPUT: output/Figure_A2_R.png, output/Figure_A2_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(dplyr); library(ggplot2) })

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))   # run from script's dir
dir.create("output", showWarnings = FALSE)

## --- 1. read the region-year panel ----------------------------------------
# case-sensitive headers exactly as the .do reads them (case(preserve)).
d <- read_csv("data/Figure_A2_data.csv", show_col_types = FALSE)

## --- 2. collapse to one cross-section row per region (2001-2010) -----------
# keep the 2001-2010 window, then average each region down to ONE row.
# code_Coutry_Region is the unique region id (original misspelling kept).
d <- subset(d, year > 2000 & year < 2011)            # mirrors keep if year>2000 & <2011
reg <- d %>%
  group_by(code_Coutry_Region) %>%
  summarise(
    Region_NAME            = first(Region_NAME),      # (firstnm) carries label through
    Country_ISO            = first(Country_ISO),       # (firstnm)
    GDP_pc_Country         = mean(GDP_pc_Country,         na.rm = TRUE),  # (mean)
    GDP_pc_Region          = mean(GDP_pc_Region,          na.rm = TRUE),
    log_GDP_pc_Region      = mean(log_GDP_pc_Region,      na.rm = TRUE),  # y-axis
    pred_log_GDP_pc_Region = mean(pred_log_GDP_pc_Region, na.rm = TRUE),  # x-axis
    pred_GDP_pc_Region     = mean(pred_GDP_pc_Region,     na.rm = TRUE),
    Pix_Region             = mean(Pix_Region,            na.rm = TRUE),
    Pop_Region             = mean(Pop_Region,            na.rm = TRUE),
    .groups = "drop")

## --- 3. build regional output density -------------------------------------
# density = total regional output / lit area = (GDP pc * population) / pixels.
reg$GDP_dens_Region <- (reg$GDP_pc_Region * reg$Pop_Region) / reg$Pix_Region

## --- 4. assign the three fixed density tiers ------------------------------
# fixed cutoffs from the original: 168071.5 and 1478853.
reg$dtier <- factor(
  ifelse(reg$GDP_dens_Region < 168071.5, "LDIR",
  ifelse(reg$GDP_dens_Region < 1478853,  "MDIR", "HDIR")),
  levels = c("LDIR", "MDIR", "HDIR"))                  # order the legend low->high

## --- 5. Figure A.2 ---------------------------------------------------------
# one scatter coloured/shaped by tier + the y = x line over range 5.5-12.
p <- ggplot(reg, aes(pred_log_GDP_pc_Region, log_GDP_pc_Region,
                     colour = dtier, shape = dtier)) +
  geom_point(size = 1.4) +
  scale_shape_manual(values = c(LDIR = 16, MDIR = 17, HDIR = 15)) +  # dot/triangle/square
  geom_abline(slope = 1, intercept = 0, colour = "black") +          # 45-degree y = x line
  coord_cartesian(xlim = c(5.5, 12), ylim = c(5.5, 12)) +            # match Stata range(5.5 12)
  labs(title = "Figure A.2 (R): predicted vs observed regional GDP by output density",
       x = "log (predicted regional GDP per capita)",
       y = "log (observed regional GDP per capita)",
       colour = "dtier", shape = "dtier") +
  theme_bw(base_size = 10)
ggsave("output/Figure_A2_R.png", p, width = 6, height = 5, dpi = 120)

## --- 6. headline numbers for the comparison -------------------------------
n_reg <- nrow(reg)                                                   # n regions
corr  <- cor(reg$pred_log_GDP_pc_Region, reg$log_GDP_pc_Region)      # corr(pred, obs)
res <- data.frame(
  metric = c("n_regions", "corr_obs_pred", "n_LDIR", "n_MDIR", "n_HDIR"),
  value  = c(n_reg, corr,
             sum(reg$dtier == "LDIR"), sum(reg$dtier == "MDIR"),
             sum(reg$dtier == "HDIR")))
write_csv(res, "output/Figure_A2_results_R.csv")
cat(sprintf("R  | n_regions %d | corr(obs,pred) %.4f | LDIR/MDIR/HDIR %d/%d/%d\n",
            n_reg, corr, sum(reg$dtier == "LDIR"),
            sum(reg$dtier == "MDIR"), sum(reg$dtier == "HDIR")))
