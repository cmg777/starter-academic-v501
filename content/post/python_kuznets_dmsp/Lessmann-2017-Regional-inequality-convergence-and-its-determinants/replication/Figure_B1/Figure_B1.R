#!/usr/bin/env Rscript
# ===========================================================================
# Figure_B1.R  --  R replication of Figure B.1 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Choropleth of PREDICTED regional GDP per capita (1992-2012 mean), restricted
# to Sub-Saharan Africa (ssa==1), shaded in Blues. R twin of Figure_B1.do
# (Stata spmap ... if ssa==1). Same map as Figure 1, just masked to the SSA
# subsample. Uses the SAME inputs: data/Figure_B1_region_income.csv and the
# bundled Natural Earth regions shapefile data/worldmap_regions.shp (key: regiso).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","sf","ggplot2"))
#   - sf      : read shapefiles + draw maps (geom_sf), the R analogue of spmap
#
# RUN:  Rscript Figure_B1.R
# OUTPUT: output/Figure_B1_R.png, output/Figure_B1_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(sf); library(ggplot2) })
sf_use_s2(FALSE)                                       # planar ops; avoids s2 edge errors

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))
dir.create("output", showWarnings = FALSE)

## --- 1. collapse the region-year panel to a cross-section ------------------
# case(preserve) in the .do => column names are case-sensitive (Region_ISO, ssa,
# pred_GDP_pc_Region). Average each region over 1992-2012; keep ssa (constant
# within a region) so we can mask to SSA, exactly like collapse (mean) by(...).
d <- read_csv("data/Figure_B1_region_income.csv", show_col_types = FALSE)
g <- aggregate(cbind(ssa, pred_GDP_pc_Region) ~ Region_ISO, d,
               function(x) mean(x, na.rm = TRUE))

## --- 2. keep Sub-Saharan Africa only (the only change vs Figure 1) ---------
ssa <- g[g$ssa == 1, ]                                 # spmap's "if ssa==1" mask

## --- 3. region polygons (Natural Earth, keyed by regiso) -------------------
shp0 <- st_read("data/worldmap_regions.shp", quiet = TRUE)
matched <- sum(ssa$Region_ISO %in% shp0$regiso)        # SSA codes with a polygon (pre-merge)
shp <- merge(shp0, ssa, by.x = "regiso", by.y = "Region_ISO", all.y = TRUE)  # SSA polygons w/ income

## --- 4. draw the SSA-only choropleth --------------------------------------
p <- ggplot(shp) +
  geom_sf(aes(fill = pred_GDP_pc_Region), colour = "grey60", linewidth = 0.05) +
  scale_fill_distiller(palette = "Blues", direction = 1, na.value = "grey92",
                       name = "Pred. GDP pc") +     # darker blue = richer region
  labs(title = "Figure B.1 (R): predicted regional income, Sub-Saharan Africa (1992-2012)") +
  theme_void(base_size = 10) + theme(plot.title = element_text(hjust = 0.5))
ggsave("output/Figure_B1_R.png", p, width = 7, height = 7, dpi = 120)

## --- 5. key numbers for the comparison ------------------------------------
res <- data.frame(metric = c("ssa_regions_with_data","ssa_matched_to_map",
                             "pred_GDP_pc_min","pred_GDP_pc_max"),
                  value  = c(nrow(ssa), matched,
                             round(min(ssa$pred_GDP_pc_Region, na.rm = TRUE), 4),
                             round(max(ssa$pred_GDP_pc_Region, na.rm = TRUE), 4)))
write_csv(res, "output/Figure_B1_results_R.csv")
cat(sprintf("R  | ssa_regions=%d matched=%d pred_GDP_pc range [%.2f, %.2f]\n",
            nrow(ssa), matched, min(ssa$pred_GDP_pc_Region), max(ssa$pred_GDP_pc_Region)))
