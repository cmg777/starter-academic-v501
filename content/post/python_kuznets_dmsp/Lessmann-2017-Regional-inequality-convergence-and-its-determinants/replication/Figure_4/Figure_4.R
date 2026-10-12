#!/usr/bin/env Rscript
# ===========================================================================
# Figure_4.R  --  R replication of Figure 4 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Regional inequality and development: partial-residual scatter of regional
# inequality (GINIW) on log national GDP per capita, with the fitted cubic.
# Panel (a) = all countries; panel (b) = labelled example countries.
#
# R twin of Figure_4.do. Reads the SAME data/Figure_4_data.csv and produces the
# same picture + the same cubic coefficients (see README comparison).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","fixest","ggplot2"))
#
# RUN:  Rscript Figure_4.R
# OUTPUT: output/Figure_4_a_R.png, output/Figure_4_b_R.png,
#         output/Figure_4_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(fixest); library(ggplot2) })

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))
dir.create("output", showWarnings = FALSE)

## --- 1. read + collapse to 5-year averages --------------------------------
d <- read_csv("data/Figure_4_data.csv", show_col_types = FALSE)
d <- subset(d, year >= 1990 & year <= 2014)
d$p5 <- with(d, ifelse(year<=1994,1, ifelse(year<=1999,2, ifelse(year<=2004,3,
              ifelse(year<=2009,4,5)))))
agg <- aggregate(cbind(GINIW_pred_GDP_pc, GDP_pc_Country) ~ Country_ISO + p5,
                 d, function(x) mean(x, na.rm = TRUE))
agg$lg  <- log(agg$GDP_pc_Country); agg$lg2 <- agg$lg^2; agg$lg3 <- agg$lg^3

## --- 2. fixed-effects regression (= Table 3 col 3) ------------------------
m  <- feols(GINIW_pred_GDP_pc ~ lg + lg2 + lg3 | Country_ISO + p5, agg,
            cluster = ~Country_ISO)
b  <- coef(m)                                   # cubic coefficients
fe <- fixef(m)                                  # absorbed FE estimates

## --- 3. partial residual (remove ONLY the period effect; display variable) -
agg$partial <- agg$GINIW_pred_GDP_pc - fe$p5[as.character(agg$p5)]
# place the cubic curve at the cloud's level (intercept is absorbed by the FE)
cons <- mean(agg$partial - (b["lg"]*agg$lg + b["lg2"]*agg$lg2 + b["lg3"]*agg$lg3))
curve_fun <- function(x) cons + b["lg"]*x + b["lg2"]*x^2 + b["lg3"]*x^3

## --- 4. Figure 4a: all countries ------------------------------------------
p_a <- ggplot(agg, aes(lg, partial)) +
  geom_point(shape = 1) +
  geom_function(fun = curve_fun, colour = "black") +
  coord_cartesian(xlim = c(5, 12), ylim = c(0, 0.16)) +
  labs(title = "Figure 4a (R): regional inequality vs development",
       x = "log (GDP per capita)", y = "Partial regional inequality (GINIW)") +
  theme_bw(base_size = 10)
ggsave("output/Figure_4_a_R.png", p_a, width = 5, height = 4.2, dpi = 120)

## --- 5. Figure 4b: labelled example countries (ITA/IRL, not the ITL/IRE typos) -
sel <- c("POL","AUS","SWE","PRY","BGD","CHN","IRN","MOZ","LBR","ITA","IRL","ARE","THA")
sub <- agg[agg$Country_ISO %in% sel, ]
p_b <- ggplot(sub, aes(lg, partial, label = Country_ISO)) +
  geom_point(shape = 2) + geom_text(vjust = -0.6, size = 3) +
  geom_function(fun = curve_fun, colour = "black") +
  coord_cartesian(xlim = c(5, 12), ylim = c(0, 0.16)) +
  labs(title = "Figure 4b (R): selected countries",
       x = "log (GDP per capita)", y = "Partial regional inequality (GINIW)") +
  theme_bw(base_size = 10)
ggsave("output/Figure_4_b_R.png", p_b, width = 5, height = 4.2, dpi = 120)

## --- 6. key numbers for the comparison ------------------------------------
res <- data.frame(metric = c("cubic_lg","cubic_lg2","cubic_lg3","N","n_countries",
                             "labelled_found"),
                  value  = c(b["lg"], b["lg2"], b["lg3"], nobs(m),
                             length(unique(agg$Country_ISO)),
                             sum(sel %in% agg$Country_ISO)))
write_csv(res, "output/Figure_4_results_R.csv")
cat(sprintf("R  | cubic %.4f / %.4f / %.5f | labelled found %d/13\n",
            b["lg"], b["lg2"], b["lg3"], sum(sel %in% agg$Country_ISO)))
