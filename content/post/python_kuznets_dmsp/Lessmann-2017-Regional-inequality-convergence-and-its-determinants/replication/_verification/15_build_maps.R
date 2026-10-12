# ============================================================================
# 15_build_maps.R
# ----------------------------------------------------------------------------
# The original maps used Stata `spmap` with a GADM-3.6 coordinate file that is
# no longer downloadable (its S3 bucket is gone). To keep the four map folders
# SELF-CONTAINED and reproducible, we bundle Natural Earth polygons as ESRI
# shapefiles. The Stata .do files convert them in-Stata with `spshape2dta` and
# draw them with `spmap` (no network, no dead resources).
#
#   - Country maps (Figure 2, 3): Natural Earth admin-0, keyed by ISO3.
#   - Region  maps (Figure 1, B1): Natural Earth admin-1, keyed to Lessmann's
#     Region_ISO via NODATA_2 (ISO + region-name match). ~90% of data regions
#     match; the rest display as "no data" (different geometry vintage than the
#     original GADM-3.6 — documented in each README).
#
# Also renders R/ggplot reference PNGs into each folder's expected/ as a visual
# target (the OFFICIAL output is produced by the Stata .do via spmap).
# ============================================================================
suppressMessages({library(sf); library(haven); library(ggplot2); library(readr)})
sf_use_s2(FALSE)

repo <- "/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants"
rep  <- file.path(repo, "replication")
geo  <- file.path(rep, "_verification/geo")

norm <- function(x) tolower(trimws(gsub("[^A-Za-z ]","", iconv(x, to="ASCII//TRANSLIT"))))
write_shp <- function(sfobj, folder, base) {
  d <- file.path(rep, folder, "data"); dir.create(d, showWarnings=FALSE, recursive=TRUE)
  for (ext in c("shp","shx","dbf","prj")) {
    f <- file.path(d, paste0(base, ".", ext)); if (file.exists(f)) file.remove(f)
  }
  suppressWarnings(st_write(sfobj, file.path(d, paste0(base, ".shp")), quiet=TRUE))
}

# ---------------------------------------------------------------------------
# 1. COUNTRY polygons (Figure 2, Figure 3)
# ---------------------------------------------------------------------------
a0 <- st_read(file.path(geo,"ne_admin0.geojson"), quiet=TRUE)
# Fix Natural Earth's ISO_A3 = "-99" quirk (France, Norway, ...) with ADM0_A3.
iso3 <- ifelse(a0$ISO_A3 == "-99" | is.na(a0$ISO_A3), a0$ADM0_A3, a0$ISO_A3)
a0c  <- st_sf(iso3 = iso3, geometry = st_geometry(a0))
a0c  <- a0c[!is.na(a0c$iso3) & a0c$iso3 != "-99", ]
# Dissolve to one (multi)polygon per ISO3 so the spmap id is unique per country.
a0c  <- aggregate(a0c, by = list(a0c$iso3), FUN = function(z) z[1])
a0c$iso3 <- a0c$Group.1; a0c$Group.1 <- NULL
a0c <- st_make_valid(a0c)
write_shp(a0c[,"iso3"], "Figure_2", "worldmap_countries")
write_shp(a0c[,"iso3"], "Figure_3", "worldmap_countries")
cat(sprintf("Country shapefile: %d polygons written to Figure_2 & Figure_3\n", nrow(a0c)))

# ---------------------------------------------------------------------------
# 2. REGION polygons (Figure 1, Figure B.1)
# ---------------------------------------------------------------------------
nd2 <- read_dta(file.path(repo,"Data/NODATA_2.dta"))
nd2 <- data.frame(ISO=as.character(nd2$ISO), NAME_1=as.character(nd2$NAME_1),
                  Region_ISO=as.character(nd2$Region_ISO), stringsAsFactors=FALSE)
nd2$k <- paste(nd2$ISO, norm(nd2$NAME_1))
nd2 <- nd2[!duplicated(nd2$k), ]

a1 <- st_read(file.path(geo,"ne_admin1.geojson"), quiet=TRUE)
# Try several NE name fields; first hit wins.
cand <- list(a1$name, a1$gn_name, a1$woe_name, a1$name_en, a1$name_local, a1$name_alt)
reg <- rep(NA_character_, nrow(a1))
for (nm in cand) {
  k <- paste(a1$adm0_a3, norm(nm))
  hit <- is.na(reg) & (k %in% nd2$k)
  reg[hit] <- nd2$Region_ISO[match(k[hit], nd2$k)]
}
a1r <- st_sf(regiso = reg, geometry = st_geometry(a1))
a1r <- a1r[!is.na(a1r$regiso), ]
a1r <- a1r[!duplicated(a1r$regiso), ]               # one polygon per Region_ISO
# Simplify to keep bundled file small while staying recognizable.
a1r <- st_make_valid(a1r)
a1r <- st_simplify(a1r, dTolerance = 0.02, preserveTopology = TRUE)
a1r <- a1r[!st_is_empty(a1r), ]
write_shp(a1r[,"regiso"], "Figure_1",  "worldmap_regions")
write_shp(a1r[,"regiso"], "Figure_B1", "worldmap_regions")
cat(sprintf("Region shapefile: %d regions keyed by Region_ISO written to Figure_1 & Figure_B1\n", nrow(a1r)))

# ---------------------------------------------------------------------------
# 3. Reference PNG renders (visual targets in expected/)
# ---------------------------------------------------------------------------
ref <- function(p, folder, name, w=9, h=4.6) {
  f <- file.path(rep, folder, "expected", name); dir.create(dirname(f), showWarnings=FALSE, recursive=TRUE)
  ggsave(f, p, width=w, height=h, dpi=120); cat("  ref:", folder, "/expected/", name, "\n")
}
base_theme <- theme_void() + theme(plot.title=element_text(size=11, hjust=.5),
                                   legend.position="right", legend.key.size=unit(.35,"cm"))

md <- read_dta(file.path(repo,"Data/Main_Data.dta"))

# Fig 2: mean GINIW by country, Reds
g2 <- aggregate(GINIW_pred_GDP_pc ~ Country_ISO, md, mean)
m2 <- merge(a0c, g2, by.x="iso3", by.y="Country_ISO", all.x=TRUE)
m2 <- m2[m2$iso3!="ATA",]
ref(ggplot(m2)+geom_sf(aes(fill=GINIW_pred_GDP_pc), color="grey60", linewidth=.05)+
      scale_fill_distiller(palette="Reds", direction=1, na.value="grey92", name="GINIW")+
      labs(title="Figure 2 (R reference): Regional inequality (mean GINIW, 1992-2012)")+base_theme,
    "Figure_2","Figure_2_R_reference.png")

# Fig 3: change in GINIW (1992-2001 minus 2002-2012), diverging
md$p2 <- ifelse(md$year>=2002 & md$year<=2012, 1, 0)
a <- aggregate(GINIW_pred_GDP_pc ~ Country_ISO, md[md$p2==0,], mean); names(a)[2]<-"p1"
b <- aggregate(GINIW_pred_GDP_pc ~ Country_ISO, md[md$p2==1,], mean); names(b)[2]<-"p2v"
d <- merge(a,b,by="Country_ISO"); d$D_GINIW <- d$p1 - d$p2v
m3 <- merge(a0c, d, by.x="iso3", by.y="Country_ISO", all.x=TRUE); m3 <- m3[m3$iso3!="ATA",]
ref(ggplot(m3)+geom_sf(aes(fill=D_GINIW), color="grey60", linewidth=.05)+
      scale_fill_gradient2(low="darkgreen", mid="white", high="firebrick", midpoint=0,
                           na.value="grey92", name="D GINIW")+
      labs(title="Figure 3 (R reference): Change in regional inequality")+base_theme,
    "Figure_3","Figure_3_R_reference.png")

# Fig 1 & B1: mean predicted regional income by region, Blues
pr <- read_dta(file.path(repo,"Data/pred_GDP_pc_Region.dta"))
pr <- pr[pr$year>=1992 & pr$year<=2012, ]
ri <- aggregate(cbind(pred_GDP_pc_Region, ssa) ~ Region_ISO, pr, mean)
m1 <- merge(a1r, ri, by.x="regiso", by.y="Region_ISO", all.x=TRUE)
ref(ggplot(m1)+geom_sf(aes(fill=log(pred_GDP_pc_Region)), color=NA)+
      scale_fill_distiller(palette="Blues", direction=1, na.value="grey92", name="log inc")+
      labs(title="Figure 1 (R reference): Predicted regional income (mean 1992-2012)")+base_theme,
    "Figure_1","Figure_1_R_reference.png")
mb <- m1[!is.na(m1$ssa) & m1$ssa==1, ]
ref(ggplot(mb)+geom_sf(aes(fill=log(pred_GDP_pc_Region)), color="grey70", linewidth=.05)+
      scale_fill_distiller(palette="Blues", direction=1, na.value="grey92", name="log inc")+
      labs(title="Figure B.1 (R reference): Predicted regional income, Sub-Saharan Africa")+base_theme,
    "Figure_B1","Figure_B1_R_reference.png", w=6, h=6)

# ---------------------------------------------------------------------------
# 4. sizes
# ---------------------------------------------------------------------------
cat("\n== bundled shapefile sizes ==\n")
for (fo in c("Figure_1","Figure_2","Figure_3","Figure_B1")) {
  fs <- list.files(file.path(rep,fo,"data"), pattern="worldmap.*\\.(shp|dbf|shx|prj)$", full.names=TRUE)
  cat(sprintf("  %-11s %6.1f KB\n", fo, sum(file.info(fs)$size)/1024))
}
cat("DONE maps.\n")
