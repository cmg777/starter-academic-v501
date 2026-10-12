#!/usr/bin/env Rscript
# ===========================================================================
# Figure_A4.R  --  R replication of Figure A.4 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# National PREDICTED vs OBSERVED GDP per capita, a validation scatter. The
# authors' night-lights prediction of national GDP pc (pred_GDP_pc_Country) is
# checked against observed GDP pc, split by data source via the geroli_dum flag:
#   geroli_dum==1 -> has Gennaioli et al. (2014) observed data (a 78-cty subset)
#   geroli_dum==0 -> predicted-only countries
# log(observed) is plotted vs log(predicted) with a 45-degree reference line;
# good prediction => points lie near y = x.
#
# R twin of Figure_A4.do. Reads the SAME data/Figure_A4_data.csv and reproduces
# the same country counts and picture (see README comparison).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","ggplot2"))
#
# RUN:  Rscript Figure_A4.R
# OUTPUT: output/Figure_A4_R.png, output/Figure_A4_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(ggplot2) })  # readr=fast CSV; ggplot2=plot

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)                # capture the --file= arg
fa <- sub("^--file=", "", args[grep("^--file=", args)])  # path of THIS script
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))   # cd to script's folder
dir.create("output", showWarnings = FALSE)               # ensure output/ exists

## --- 1. read CSV ----------------------------------------------------------
# Column names are case-sensitive, exactly as in the header (Stata case(preserve)).
d <- read_csv("data/Figure_A4_data.csv", show_col_types = FALSE)

## --- 2. restrict to 2001-2010 ---------------------------------------------
# Cross-sectional figure: keep the decade of overlap, then average each country.
d <- subset(d, year > 2000 & year < 2011)

## --- 3. collapse to one row per country (means of the three GDP series) ----
# na.rm=TRUE mimics Stata's collapse (mean), which ignores missing "." entries.
agg <- aggregate(cbind(GDP_pc_Country, pred_GDP_pc_Country, GDP_pc_Country_G)
                 ~ Country_ISO, data = d,
                 FUN = function(x) mean(x, na.rm = TRUE),  # per-country mean
                 na.action = na.pass)                      # keep all-NA Gennaioli rows

## --- 4. logs and the data-source flag -------------------------------------
agg$log_GDP_pc_Country      <- log(agg$GDP_pc_Country)        # log observed (WB)
agg$log_pred_GDP_pc_Country <- log(agg$pred_GDP_pc_Country)   # log predicted (lights)
# geroli_dum: 1 if the country HAS Gennaioli observed data, 0 otherwise.
# aggregate() turns the all-missing Gennaioli countries into NaN (not just NA).
agg$geroli_dum <- ifelse(is.finite(agg$GDP_pc_Country_G), 1L, 0L)

## --- 5. headline counts ---------------------------------------------------
n_total     <- nrow(agg)                  # all countries with a prediction
n_gennaioli <- sum(agg$geroli_dum == 1)   # subset with Gennaioli observed data

## --- 6. Figure A.4 --------------------------------------------------------
# Two scatters of log-observed vs log-predicted, split by data source, plus the
# 45-degree reference line y = x drawn over the data range [5.5, 12].
#   - triangles = Gennaioli-observed subset (geroli_dum==1) -> "observed data"
#   - circles   = predicted-only countries  (geroli_dum==0) -> "predicted data"
#   - geom_text labels each marker with its ISO code (small, to stay readable).
agg$grp <- factor(ifelse(agg$geroli_dum == 1, "observed data", "predicted data"))
p <- ggplot(agg, aes(log_pred_GDP_pc_Country, log_GDP_pc_Country,
                     colour = grp, shape = grp, label = Country_ISO)) +
  geom_abline(slope = 1, intercept = 0, colour = "black") +     # 45-degree line y=x
  geom_point(size = 1.4) +                                       # the country points
  geom_text(size = 1.7, vjust = -0.7, show.legend = FALSE) +     # ISO-code labels
  scale_shape_manual(values = c("observed data" = 17,           # 17 = filled triangle
                                "predicted data" = 16)) +        # 16 = filled circle
  coord_cartesian(xlim = c(5.5, 12), ylim = c(5.5, 12)) +        # match Stata range
  labs(title = "Figure A.4 (R): national predicted vs observed GDP pc",
       x = "log (predicted national GDP pc)",
       y = "log (observed national GDP pc)", colour = "", shape = "") +
  theme_bw(base_size = 10) +
  theme(legend.position = c(0.85, 0.15))                         # legend inside, lower-right
ggsave("output/Figure_A4_R.png", p, width = 6, height = 5, dpi = 130)

## --- 7. key numbers for the comparison ------------------------------------
res <- data.frame(metric = c("n_countries_total", "n_gennaioli_observed"),
                  value  = c(n_total, n_gennaioli))
write_csv(res, "output/Figure_A4_results_R.csv")
cat(sprintf("R  | %d countries total | %d with Gennaioli observed data\n",
            n_total, n_gennaioli))
