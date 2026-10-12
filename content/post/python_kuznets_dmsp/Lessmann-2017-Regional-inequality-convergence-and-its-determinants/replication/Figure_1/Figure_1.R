#!/usr/bin/env Rscript
# ===========================================================================
# Figure_1.R  --  R replication of Figure 1 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# SUBNATIONAL world choropleth of predicted regional income (mean
# pred_GDP_pc_Region over 1992-2012), shaded in Blues. R twin of Figure_1.do
# (Stata spmap). Uses the SAME inputs: the region income values in
# data/Figure_1_region_income.csv and the bundled Natural Earth admin-1
# shapefile data/worldmap_regions.shp (key field: regiso).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","sf","ggplot2"))
#   - sf      : read shapefiles + draw maps (geom_sf), the R analogue of spmap
#
# RUN:  Rscript Figure_1.R
# OUTPUT: output/Figure_1_R.png, output/Figure_1_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(sf); library(ggplot2) })
sf_use_s2(FALSE)                                  # planar geometry: faster, robust merges

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])  # path of THIS script
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))
dir.create("output", showWarnings = FALSE)

## --- 1. import the region income values -----------------------------------
# read_csv preserves the original (case-sensitive) column names like the .do's
# import delimited ... case(preserve), so "Region_ISO" stays exactly as written.
d <- read_csv("data/Figure_1_region_income.csv", show_col_types = FALSE)

## --- 2. collapse to a cross-section (mean over 1992-2012) ------------------
d <- d[d$year > 1991 & d$year < 2013, ]          # keep if year>1991 & year<2013
# (mean) each region over the kept years -> one row per region, like collapse.
g <- aggregate(cbind(ssa, pred_GDP_pc_Region) ~ Region_ISO, d,
               function(x) mean(x, na.rm = TRUE))
names(g)[names(g) == "Region_ISO"] <- "regiso"   # rename to match map key field

## --- 3. region polygons (Natural Earth admin-1, keyed by regiso) -----------
shp <- st_read("data/worldmap_regions.shp", quiet = TRUE)
# keep(master match): every map polygon stays; income attaches where matched,
# unmatched polygons get NA and are drawn as "no data".
shp <- merge(shp, g, by = "regiso", all.x = TRUE)

## --- 4. draw the choropleth -----------------------------------------------
p <- ggplot(shp) +
  geom_sf(aes(fill = pred_GDP_pc_Region), colour = "grey60", linewidth = 0.03) +
  # trans="log10": predicted income is right-skewed; log spreads the colours,
  # matching the reference (log scale optional in the .do).
  scale_fill_distiller(palette = "Blues", direction = 1, trans = "log10",
                       na.value = "grey92", name = "Pred. GDP p.c.") +
  labs(title = "Figure 1 (R): predicted regional income (mean 1992-2012)") +
  theme_void(base_size = 10) + theme(plot.title = element_text(hjust = 0.5))
ggsave("output/Figure_1_R.png", p, width = 9, height = 4.6, dpi = 120)

## --- 5. key numbers for the comparison ------------------------------------
matched <- sum(g$regiso %in% shp$regiso)         # data regions that hit a polygon
res <- data.frame(metric = c("regions_with_data","matched_to_map","pct_matched",
                             "pred_GDP_min","pred_GDP_max"),
                  value  = c(nrow(g), matched,
                             round(100 * matched / nrow(g), 1),
                             round(min(g$pred_GDP_pc_Region, na.rm = TRUE), 2),
                             round(max(g$pred_GDP_pc_Region, na.rm = TRUE), 2)))
write_csv(res, "output/Figure_1_results_R.csv")
cat(sprintf("R  | regions=%d matched=%d (%.1f%%) pred_GDP range [%.1f, %.1f]\n",
            nrow(g), matched, 100 * matched / nrow(g),
            min(g$pred_GDP_pc_Region), max(g$pred_GDP_pc_Region)))
