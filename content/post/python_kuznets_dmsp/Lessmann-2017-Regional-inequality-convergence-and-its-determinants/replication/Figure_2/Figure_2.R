#!/usr/bin/env Rscript
# ===========================================================================
# Figure_2.R  --  R replication of Figure 2 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# World choropleth of within-country regional inequality (mean GINIW), shaded in
# Reds. R twin of Figure_2.do (Stata spmap). Uses the SAME inputs: the GINIW
# values in data/Figure_2_data.csv and the bundled Natural Earth country
# shapefile data/worldmap_countries.shp (key field: iso3).
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","sf","ggplot2"))
#   - sf      : read shapefiles + draw maps (geom_sf), the R analogue of spmap
#
# RUN:  Rscript Figure_2.R
# OUTPUT: output/Figure_2_R.png, output/Figure_2_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(sf); library(ggplot2) })
sf_use_s2(FALSE)

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))
dir.create("output", showWarnings = FALSE)

## --- 1. GINIW per country (mean over all years) ---------------------------
d <- read_csv("data/Figure_2_data.csv", show_col_types = FALSE)
g <- aggregate(GINIW_pred_GDP_pc ~ Country_ISO, d, function(x) mean(x, na.rm = TRUE))

## --- 2. country polygons (Natural Earth, keyed by iso3) --------------------
shp <- st_read("data/worldmap_countries.shp", quiet = TRUE)
shp <- merge(shp, g, by.x = "iso3", by.y = "Country_ISO", all.x = TRUE)
shp <- shp[shp$iso3 != "ATA", ]                       # drop Antarctica

## --- 3. draw the choropleth -----------------------------------------------
p <- ggplot(shp) +
  geom_sf(aes(fill = GINIW_pred_GDP_pc), colour = "grey60", linewidth = 0.05) +
  scale_fill_distiller(palette = "Reds", direction = 1, na.value = "grey92",
                       name = "GINIW") +
  labs(title = "Figure 2 (R): regional inequality within countries (mean GINIW)") +
  theme_void(base_size = 10) + theme(plot.title = element_text(hjust = 0.5))
ggsave("output/Figure_2_R.png", p, width = 9, height = 4.6, dpi = 120)

## --- 4. key numbers for the comparison ------------------------------------
matched <- sum(g$Country_ISO %in% shp$iso3)
res <- data.frame(metric = c("countries_with_data","matched_to_map",
                             "GINIW_min","GINIW_max"),
                  value  = c(nrow(g), matched,
                             round(min(g$GINIW_pred_GDP_pc, na.rm = TRUE), 4),
                             round(max(g$GINIW_pred_GDP_pc, na.rm = TRUE), 4)))
write_csv(res, "output/Figure_2_results_R.csv")
cat(sprintf("R  | countries=%d matched=%d GINIW range [%.3f, %.3f]\n",
            nrow(g), matched, min(g$GINIW_pred_GDP_pc), max(g$GINIW_pred_GDP_pc)))
