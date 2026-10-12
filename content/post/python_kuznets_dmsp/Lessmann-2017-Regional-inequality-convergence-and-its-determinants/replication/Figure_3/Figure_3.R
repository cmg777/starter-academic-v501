#!/usr/bin/env Rscript
# ===========================================================================
# Figure_3.R  --  R replication of Figure 3 (Lessmann & Seidel 2017)
# ---------------------------------------------------------------------------
# Diverging world choropleth of the CHANGE in within-country regional
# inequality between 1992-2001 and 2002-2012. R twin of Figure_3.do (Stata
# spmap). Uses the SAME inputs: the GINIW series in data/Figure_3_data.csv and
# the bundled Natural Earth country shapefile data/worldmap_countries.shp
# (key field: iso3).
#
# D_GINIW = mean(1992-2001) - mean(2002-2012):
#   POSITIVE -> inequality FELL (within-country convergence) -> GREEN
#   NEGATIVE -> inequality ROSE (within-country divergence)  -> RED
#
# REQUIRED PACKAGES (install once):
#   install.packages(c("readr","sf","ggplot2"))
#   - sf      : read shapefiles + draw maps (geom_sf), the R analogue of spmap
#
# RUN:  Rscript Figure_3.R
# OUTPUT: output/Figure_3_R.png, output/Figure_3_results_R.csv
# ===========================================================================
suppressMessages({ library(readr); library(sf); library(ggplot2) })
sf_use_s2(FALSE)                                       # planar geometry; avoids s2 edge errors

## --- 0. portable working directory ----------------------------------------
args <- commandArgs(trailingOnly = FALSE)
fa <- sub("^--file=", "", args[grep("^--file=", args)])
if (length(fa) == 1) setwd(dirname(normalizePath(fa)))  # cd to this script's folder
dir.create("output", showWarnings = FALSE)

## --- 1. import the inequality series --------------------------------------
d <- read_csv("data/Figure_3_data.csv", show_col_types = FALSE)

## --- 2. two sub-periods ---------------------------------------------------
# p2year flags the SECOND sub-period (2002-2012); 0 = first sub-period (else).
d$p2year <- ifelse(d$year >= 2002 & d$year <= 2012, 1L, 0L)

## --- 3. per-country sub-period means + the plotted change -----------------
# Mean GINIW in each country x sub-period, then reshape so each country has its
# 1st-period mean and 2nd-period mean side by side (mirrors the .do collapse).
m  <- aggregate(GINIW_pred_GDP_pc ~ Country_ISO + p2year, d,
                function(x) mean(x, na.rm = TRUE))
p1 <- m[m$p2year == 0, c("Country_ISO", "GINIW_pred_GDP_pc")]   # 1992-2001 mean
p2 <- m[m$p2year == 1, c("Country_ISO", "GINIW_pred_GDP_pc")]   # 2002-2012 mean
names(p1)[2] <- "GINIW_91_01"
names(p2)[2] <- "GINIW_02_12"
g <- merge(p1, p2, by = "Country_ISO", all = TRUE)             # one row per country
g$D_GINIW <- g$GINIW_91_01 - g$GINIW_02_12                     # >0 fell (green); <0 rose (red)

## --- 4. country polygons (Natural Earth, keyed by iso3) --------------------
shp <- st_read("data/worldmap_countries.shp", quiet = TRUE)
shp <- merge(shp, g, by.x = "iso3", by.y = "Country_ISO", all.x = TRUE)
shp <- shp[shp$iso3 != "ATA", ]                       # drop Antarctica so map centres on land

## --- 5. draw the diverging choropleth -------------------------------------
# scale_fill_gradient2 anchors white at 0: red (firebrick) for negative
# (rising inequality), green (darkgreen) for positive (falling inequality).
p <- ggplot(shp) +
  geom_sf(aes(fill = D_GINIW), colour = "grey60", linewidth = 0.05) +
  scale_fill_gradient2(low = "firebrick", mid = "white", high = "darkgreen",
                       midpoint = 0, na.value = "grey92", name = "D_GINIW") +
  labs(title = "Figure 3 (R): change in regional inequality, 1992-2001 vs 2002-2012") +
  theme_void(base_size = 10) + theme(plot.title = element_text(hjust = 0.5))
ggsave("output/Figure_3_R.png", p, width = 9, height = 4.6, dpi = 120)

## --- 6. key numbers for the comparison ------------------------------------
matched <- sum(g$Country_ISO %in% shp$iso3)           # countries that join the map
dd <- g$D_GINIW[!is.na(g$D_GINIW)]
res <- data.frame(metric = c("countries_with_data","matched_to_map",
                             "D_GINIW_min","D_GINIW_max"),
                  value  = c(nrow(g), matched,
                             round(min(dd), 6), round(max(dd), 6)))
write_csv(res, "output/Figure_3_results_R.csv")
cat(sprintf("R  | countries=%d matched=%d D_GINIW range [%.4f, %.4f]\n",
            nrow(g), matched, min(dd), max(dd)))
