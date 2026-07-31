# =============================================================================
# Who Are My Neighbors? Bayesian Estimation of Spatial Weight Matrices in R
#
# Replication and extension of:
#   Krisztin, T. & Piribauer, P. (2026) "estimateW: a Bayesian R package for
#   estimating spatial weight matrices, with an application to European
#   regional growth". Springer (open access). R package version 0.2.0.
#
# What this reproduces from the paper:
#   - Section 5 empirical example  -> Table 3 (posterior means and SDs)
#   - Figure 1  -> four stylized spatially structured priors (30-region city)
#   - Table 2   -> three sparsity priors via bbinompdf()
#   - Figure 2  -> region networks and country chord diagrams, for W and for
#                  the spatial multiplier (I - rho W)^-1
#   - Figure 3  -> trace plots of the retained draws
#
# What this adds beyond the paper:
#   - a ground-truth simulation (sim_dgp) showing the sampler recovers a KNOWN W
#   - a taxonomy tour of sarw/sdmw/semw/sdemw/slxw and their exogenous-W twins
#   - a benchmark of the estimated W against queen-contiguity and 7-nearest-
#     neighbour matrices built from real GISCO NUTS-1 geometry, plus a map
#   - multi-chain convergence diagnostics (ESS, Geweke, Gelman-Rubin)
#
# Model (SAR panel, paper eq. 19):
#   y_t = rho W y_t + Z_{t-1} beta + eps_t,   y_t = g_t - g_{t-1}
# where g_t is log real GVA per worker. This is a DESCRIPTIVE / associational
# growth regression, not a causal design: there is no treatment, no estimand of
# the ATE/ATT family, and the coefficients are conditional associations. The
# "impacts" below are model-implied marginal effects under the fitted SAR, not
# causal effects.
#
# MCMC budget: the paper's headline chain is deliberately tiny (niter = 200,
# nretain = 100) so its vignette runs fast. We reproduce it EXACTLY, then run
# two longer chains to show what that budget can and cannot support.
#
# Inputs : estimateW::nuts1growth (built in); GISCO NUTS-1 geometry (cached)
# Outputs: 18 PNG figures, 14 CSV tables, cache/*.rds, execution_log.txt
#
# Reproduce: cd content/post/r_estimateW && Rscript analysis.R 2>&1 | tee execution_log.txt
# =============================================================================


# -- 0. Setup -----------------------------------------------------------------

# Rscript inherits repos = "@CRAN@" from a bare R install, which makes
# install.packages() block on an interactive mirror menu with no TTY.
local({
  r <- getOption("repos")
  if (is.null(r) || is.na(r["CRAN"]) || r["CRAN"] == "@CRAN@") {
    options(repos = c(CRAN = "https://cloud.r-project.org"))
  }
})

pkgs_required <- c("estimateW", "ggplot2", "dplyr", "tidyr", "readr", "tibble",
                   "purrr", "glue", "scales", "patchwork", "coda", "sf")
pkgs_optional <- c("circlize")

missing_req <- pkgs_required[!vapply(pkgs_required, requireNamespace,
                                     logical(1), quietly = TRUE)]
if (length(missing_req)) {
  install.packages(missing_req, quiet = TRUE)
}
missing_opt <- pkgs_optional[!vapply(pkgs_optional, requireNamespace,
                                     logical(1), quietly = TRUE)]
if (length(missing_opt)) {
  try(install.packages(missing_opt, quiet = TRUE), silent = TRUE)
}

suppressPackageStartupMessages({
  library(estimateW); library(ggplot2); library(dplyr); library(tidyr)
  library(readr); library(tibble); library(purrr); library(glue)
  library(scales); library(patchwork); library(coda); library(sf)
})

HAS_CIRCLIZE <- requireNamespace("circlize", quietly = TRUE)
HAS_GEO      <- TRUE   # flipped to FALSE if the geometry cascade fails

# --- Constants ---------------------------------------------------------------
SLUG          <- "r_estimateW"
SEED_PAPER    <- 571L          # the paper's seed; do not change
SEED_LONG_A   <- 20260731L
SEED_LONG_B   <- 20260732L
SEED_PROBE    <- 990001L
SEED_SIM      <- 4242L
SEED_SIMFIT   <- 4243L
SEED_TAX      <- 4301L

NITER_PAPER   <- 200L          # paper's Section 5 call
NRETAIN_PAPER <- 100L
KBAR          <- 7L            # paper's prior expected number of neighbours
N_REG         <- 90L
TT            <- 19L
TOP_GRAPH     <- 0.10          # paper footnote 15: top 10% of links in graphs
TOP_CHORD     <- 0.20          # paper footnote 15: top 20% in chord diagrams

# Simulation and taxonomy sizes (adjusted by the escalation ladder in S4)
N_SIM         <- 40L
TT_SIM        <- 20L
NITER_SIM     <- 2000L
N_TAX         <- 25L
TT_TAX        <- 15L
NITER_TAX     <- 400L
NITER_EXO     <- 2000L         # exogenous-W fits: cheap, W is not sampled

# Environment knobs
BUDGET_LONG_SEC <- as.numeric(Sys.getenv("ESTIMATEW_BUDGET_SEC", "1600"))
FORCE_REFIT     <- isTRUE(as.logical(Sys.getenv("ESTIMATEW_REFIT", "FALSE")))
MAX_MIN         <- as.numeric(Sys.getenv("ESTIMATEW_MAX_MIN", "40"))
ALLOW_SLOW      <- isTRUE(as.logical(Sys.getenv("ESTIMATEW_ALLOW_SLOW", "FALSE")))

CACHE_DIR <- "cache"
dir.create(CACHE_DIR, showWarnings = FALSE, recursive = TRUE)

# --- Dark-theme palette ------------------------------------------------------
BG     <- "#0f1729"
GRID   <- "#1f2b5e"
TEXT   <- "#c8d0e0"
WHITE  <- "#e8ecf2"
STEEL  <- "#6a9bcc"
ORANGE <- "#d97757"
TEAL   <- "#00d4c8"

theme_dark_site <- function(base_size = 12) {
  theme_minimal(base_size = base_size) +
    theme(
      plot.background   = element_rect(fill = BG, colour = NA),
      panel.background  = element_rect(fill = BG, colour = NA),
      panel.grid.major  = element_line(colour = GRID, linewidth = 0.3),
      panel.grid.minor  = element_line(colour = GRID, linewidth = 0.15),
      axis.text         = element_text(colour = TEXT),
      axis.title        = element_text(colour = TEXT),
      plot.title        = element_text(colour = WHITE, face = "bold"),
      plot.subtitle     = element_text(colour = TEXT),
      plot.caption      = element_text(colour = TEXT, size = 8),
      legend.background = element_rect(fill = BG, colour = NA),
      legend.key        = element_rect(fill = BG, colour = NA),
      legend.text       = element_text(colour = TEXT),
      legend.title      = element_text(colour = TEXT),
      strip.background  = element_rect(fill = GRID, colour = NA),
      strip.text        = element_text(colour = WHITE, face = "bold")
    )
}
theme_set(theme_dark_site())

# dpi defaults to the site's 300. The network, chord and map figures override it
# to 170: they are line art built from hundreds of semi-transparent curves, so
# alpha blending generates millions of near-unique colours and PNG compression
# collapses. At 300 dpi the map alone is 2.3 MB; at 170 it is under 0.8 MB with
# no visible difference at any realistic display width, and this post ships 19
# figures on one page.
save_fig <- function(plot, name, w = 9, h = 6, dpi = 300) {
  # patchwork composites need an outer plot.background override, otherwise the
  # wrapper renders a light frame around the assembled figure.
  if (inherits(plot, "patchwork")) {
    plot <- plot + plot_annotation(
      theme = theme(plot.background = element_rect(fill = BG, colour = NA))
    )
  }
  ggsave(glue("{SLUG}_{name}.png"), plot, width = w, height = h, dpi = dpi,
         bg = BG)
  invisible(NULL)
}

# ggsave() cannot save base-graphics output (circlize chord diagrams), so this
# is the base-graphics twin: open a png device with the dark background, set
# every par() colour that base plots read, then evaluate the drawing code.
save_base_fig <- function(name, expr, w = 10, h = 10, res = 200) {
  png(glue("{SLUG}_{name}.png"), width = w * res, height = h * res,
      res = res, bg = BG)
  op <- par(bg = BG, fg = TEXT, col = TEXT, col.axis = TEXT, col.lab = TEXT,
            col.main = WHITE, col.sub = TEXT, family = "sans",
            mar = c(1, 1, 3, 1))
  on.exit({ par(op); dev.off() }, add = TRUE)
  force(expr)
  invisible(NULL)
}

# glue() strips trailing newlines, so cat(glue("...\n")) would concatenate.
# .envir must be forwarded explicitly: glue's default parent.frame() would
# resolve to say()'s own frame, so braces referring to a caller's LOCAL
# variables (inside cached(), get_nuts1_geometry(), ...) would fail to evaluate.
say <- function(..., .envir = parent.frame()) {
  cat(glue(..., .sep = "", .envir = .envir), "\n", sep = "")
}

sec <- function(title) {
  cat("\n", strrep("-", 78), "\n--- ", title, "\n", sep = "")
}

# Memoiser. The argument is called `refit`, NOT `force`, because `force` would
# shadow base::force() inside the body. Every key encodes the settings that
# change the result, so a silently stale cache is impossible.
cached <- function(key, expr, refit = FORCE_REFIT) {
  path <- file.path(CACHE_DIR, glue("{SLUG}_{key}.rds"))
  if (!refit && file.exists(path)) {
    val <- readRDS(path)
    say("[cache] HIT  {key}  (stored runtime {round(attr(val, 'runtime_sec') %||% NA_real_, 1)}s)")
    return(val)
  }
  t0  <- proc.time()[["elapsed"]]
  val <- expr
  el  <- proc.time()[["elapsed"]] - t0
  attr(val, "runtime_sec") <- el
  saveRDS(val, path, compress = "xz")
  say("[cache] MISS {key} - computed in {round(el, 1)}s")
  val
}
`%||%` <- function(a, b) if (is.null(a)) b else a

# estimateW returns parameter blocks as (parameter x draw) matrices and postw as
# a [i, j, draw] array. Everything downstream goes through these normalisers so
# a future change of orientation is a one-line fix.
as_draws <- function(x) {
  if (is.null(dim(x))) return(matrix(x, ncol = 1))
  t(x)                                   # -> draws x parameter
}
n_draws <- function(fit) ncol(fit$postr)

# Silence the txtProgressBar that every estimateW sampler writes to stdout.
# Without this a tee'd execution_log.txt fills with megabytes of \r characters.
quiet_fit <- function(expr) {
  invisible(capture.output(res <- expr))
  res
}

row_std <- function(M) {
  rs <- rowSums(M)
  rs[rs == 0] <- 1
  M / rs
}

cat(strrep("=", 78), "\n", sep = "")
say("  estimateW - Bayesian estimation of spatial weight matrices")
say("  Replication of Krisztin & Piribauer (2026), Section 5")
say("  R {getRversion()}  |  estimateW {packageVersion('estimateW')}")
say("  Paper chain: seed {SEED_PAPER}, niter {NITER_PAPER}, nretain {NRETAIN_PAPER}, kbar {KBAR}")
cat(strrep("=", 78), "\n", sep = "")

RUNTIME_LOG <- list()
log_runtime <- function(step, elapsed, ...) {
  RUNTIME_LOG[[length(RUNTIME_LOG) + 1]] <<- tibble(
    step = step, elapsed_sec = round(elapsed, 2), ...
  )
  invisible(NULL)
}


# -- 1. Data, panel audit, exploratory view -----------------------------------
sec("Section 1: nuts1growth panel, country crosswalk, EDA")

data(nuts1growth)

stopifnot(
  nrow(nuts1growth) == N_REG * TT,
  length(unique(nuts1growth$NUTS1)) == N_REG,
  length(unique(nuts1growth$year))  == TT
)
# The panel must be stacked year-major with an identical region order in every
# time block: estimateW reads Y as [y_1', ..., y_T']' and indexes W by position.
region_order <- nuts1growth$NUTS1[nuts1growth$year == min(nuts1growth$year)]
by_year <- split(nuts1growth$NUTS1, nuts1growth$year)
stopifnot(all(vapply(by_year, function(v) identical(v, region_order), logical(1))))
say("Panel: {N_REG} NUTS-1 regions x {TT} years ({min(nuts1growth$year)}-{max(nuts1growth$year)}) = {nrow(nuts1growth)} observations")
say("Region order is identical in all {TT} year blocks: OK")

# Supranational country groups, exactly as in Krisztin & Piribauer (2026, p.412)
GROUPS <- list(
  Southern = c("CY", "EL", "ES", "IT", "MT", "PT"),
  Northern = c("DK", "FI", "SE"),
  Western  = c("AT", "BE", "DE", "FR", "IE", "LU", "NL"),
  CEE      = c("BG", "CZ", "HU", "PL", "RO", "SI", "SK"),
  Baltics  = c("EE", "LT", "LV")
)
GROUP_LEVELS <- names(GROUPS)
cc_to_group <- unlist(lapply(names(GROUPS), function(g)
  setNames(rep(g, length(GROUPS[[g]])), GROUPS[[g]])))

# The paper's ramps are Southern oranges/browns, Northern blues, Western greens,
# CEE light reds, Baltics dark red. Southern and CEE are hue-adjacent, so the
# ramps below deliberately push Southern toward amber/brown and CEE toward
# pink/magenta-red; region ordering also carries group identity on every axis.
RAMPS <- list(
  Southern = c("#f7c59f", "#7a4a21"),
  Northern = c("#9ec8ea", "#2f6199"),
  Western  = c("#7fd8cd", "#1d6b4f"),
  CEE      = c("#ff9aa2", "#b8322b"),
  Baltics  = c("#c0504a", "#5e1010")
)
country_cols <- unlist(Map(function(cc, ends)
  setNames(colorRampPalette(ends)(length(cc)), cc), GROUPS, RAMPS))
names(country_cols) <- sub("^[A-Za-z]+\\.", "", names(country_cols))
GROUP_COLS <- c(Southern = "#d97757", Northern = "#6a9bcc", Western = "#00d4c8",
                CEE = "#ff9aa2", Baltics = "#8b2f2f")

regions <- tibble(
  nuts1   = region_order,
  country = sub("^GR", "EL", substr(region_order, 1, 2))   # no-op on this vintage
) |>
  mutate(
    country_group = factor(unname(cc_to_group[country]), levels = GROUP_LEVELS),
    country_col   = unname(country_cols[country])
  )
stopifnot(!any(is.na(regions$country_group)))
say("Countries: {length(unique(regions$country))} | groups: {paste(GROUP_LEVELS, collapse = ', ')}")

# Model matrices, in the paper's exact form (Section 5).
Y <- as.matrix(nuts1growth$growth_gdp_pw)
Z <- cbind(1, nuts1growth$init_gdp_pw, nuts1growth$loweduc, nuts1growth$higheduc)
Z_LABELS <- c("intercept", "log initial GVA per worker",
              "share low education", "share high education")
colnames(Z) <- Z_LABELS
stopifnot(dim(Y) == c(N_REG * TT, 1), ncol(Z) == 4)
say("Y: {nrow(Y)} x 1   Z: {nrow(Z)} x {ncol(Z)}   ({paste(Z_LABELS, collapse = ' | ')})")

panel <- as_tibble(nuts1growth) |>
  left_join(regions, by = c("NUTS1" = "nuts1"))

panel_summary <- panel |>
  group_by(nuts1 = NUTS1, country, country_group) |>
  summarise(
    n_years          = n(),
    mean_growth      = mean(growth_gdp_pw),
    sd_growth        = sd(growth_gdp_pw),
    min_growth       = min(growth_gdp_pw),
    max_growth       = max(growth_gdp_pw),
    init_gdp_pw_2001 = init_gdp_pw[year == 2001],
    mean_loweduc     = mean(loweduc),
    mean_higheduc    = mean(higheduc),
    .groups = "drop"
  ) |>
  arrange(country_group, country, nuts1)
write_csv(panel_summary, glue("{SLUG}_panel_summary.csv"))
say("Wrote {SLUG}_panel_summary.csv ({nrow(panel_summary)} rows)")

cat("\nGrowth of GVA per worker, pooled:\n")
print(summary(panel$growth_gdp_pw))
cat("\nRegions per country group:\n")
print(table(regions$country_group))

# Five reference regions, one per supranational group, for the spaghetti plot.
hi <- regions |> group_by(country_group) |> slice(1) |> pull(nuts1)
p1a <- ggplot(panel, aes(year, growth_gdp_pw, group = NUTS1)) +
  geom_line(colour = TEXT, alpha = 0.16, linewidth = 0.3) +
  geom_line(data = filter(panel, NUTS1 %in% hi),
            aes(colour = country_group), linewidth = 0.9) +
  # dotted grey, not orange: orange is the Southern group colour in this panel
  geom_hline(yintercept = 0, colour = TEXT, linetype = "dotted",
             linewidth = 0.4) +
  scale_colour_manual(values = GROUP_COLS, name = NULL) +
  scale_y_continuous(labels = percent_format(accuracy = 1)) +
  labs(title = "Annual labour-productivity growth, 90 NUTS-1 regions",
       subtitle = glue("Grey: all regions. Coloured: one reference region per supranational group ({paste(hi, collapse = ', ')})"),
       x = NULL, y = "Growth of GVA per worker")

p1b <- ggplot(panel_summary,
              aes(init_gdp_pw_2001, mean_growth, colour = country_group)) +
  geom_point(size = 2.1, alpha = 0.9) +
  geom_smooth(method = "lm", formula = y ~ x, se = FALSE,
              colour = ORANGE, linewidth = 0.8) +
  scale_colour_manual(values = GROUP_COLS, name = NULL) +
  scale_y_continuous(labels = percent_format(accuracy = 0.1)) +
  labs(title = "Unconditional beta-convergence, before any spatial structure",
       subtitle = "Initial log GVA per worker (2001) against mean annual growth 2001-2019",
       x = "log GVA per worker, 2001", y = "Mean annual growth")

save_fig(p1a / p1b, "01_panel_overview", w = 10, h = 8, dpi = 200)
say("Figure 01 (panel overview) saved.")

# The site-mandated simple baseline: pooled OLS with no spatial term at all.
ols <- lm(growth_gdp_pw ~ init_gdp_pw + loweduc + higheduc, data = panel)
cat("\nPooled OLS baseline (no spatial term):\n")
print(summary(ols)$coefficients)
OLS_INIT <- unname(coef(ols)["init_gdp_pw"])


# -- 2. Geometry: GISCO NUTS-1, queen contiguity, 7-nearest neighbours --------
sec("Section 2: NUTS-1 geometry and the exogenous benchmark W matrices")

GISCO_URLS <- c(
  "https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_20M_2021_3035_LEVL_1.geojson",
  "https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_20M_2016_3035_LEVL_1.geojson"
)
GEO_CACHE <- file.path(CACHE_DIR, glue("{SLUG}_nuts1_20m_3035.rds"))

get_nuts1_geometry <- function() {
  if (file.exists(GEO_CACHE)) {
    say("[geo] cache hit: {GEO_CACHE}")
    return(readRDS(GEO_CACHE))
  }
  target_cc <- sort(unique(regions$country))
  for (u in GISCO_URLS) {
    g <- tryCatch(suppressWarnings(st_read(u, quiet = TRUE)),
                  error = function(e) NULL)
    if (is.null(g)) { say("[geo] fetch failed: {basename(u)}"); next }
    # FRY = Regions Ultraperipheriques Francaises; present in GISCO, absent from
    # the panel. Dropping it takes the 26-country subset from 91 to exactly 90.
    gg <- g[g$CNTR_CODE %in% target_cc & g$NUTS_ID != "FRY",
            c("NUTS_ID", "CNTR_CODE", "NAME_LATN", "geometry")]
    if (nrow(gg) == N_REG && length(setdiff(regions$nuts1, gg$NUTS_ID)) == 0) {
      gg <- gg[match(regions$nuts1, gg$NUTS_ID), ]   # CRITICAL: panel order
      saveRDS(gg, GEO_CACHE, compress = "xz")
      say("[geo] fetched {basename(u)} -> {nrow(gg)} regions, cached ({round(file.size(GEO_CACHE)/1024)} KB)")
      return(gg)
    }
    say("[geo] {basename(u)} gave {nrow(gg)} regions; missing: {paste(setdiff(regions$nuts1, gg$NUTS_ID), collapse = ',')}")
  }
  NULL
}

geo <- get_nuts1_geometry()
if (is.null(geo)) {
  HAS_GEO <- FALSE
  say("[WARN] No NUTS-1 geometry available. Sections 8 and 10b will be skipped.")
  say("[WARN] Run once with network access to populate {GEO_CACHE}.")
} else {
  stopifnot(identical(geo$NUTS_ID, regions$nuts1))
  say("[geo] CRS EPSG:{st_crs(geo)$epsg}; geometry aligned to panel region order.")
}

W_queen <- W_knn <- NULL; DIST_KM <- NULL; CENTROIDS <- NULL
if (HAS_GEO) {
  # st_point_on_surface rather than st_centroid: for concave regions the
  # centroid can fall outside the polygon, which looks wrong for map arcs.
  CENTROIDS <- suppressWarnings(st_coordinates(st_point_on_surface(st_geometry(geo))))
  DIST_KM   <- as.matrix(dist(CENTROIDS)) / 1000
  dimnames(DIST_KM) <- list(regions$nuts1, regions$nuts1)

  touch  <- st_touches(geo, sparse = TRUE)
  Om_q   <- matrix(0, N_REG, N_REG,
                   dimnames = list(regions$nuts1, regions$nuts1))
  for (i in seq_len(N_REG)) if (length(touch[[i]])) Om_q[i, touch[[i]]] <- 1

  # Islands and enclaves have no queen neighbour at all. A zero row breaks
  # row-standardization, so each isolate is given its single nearest centroid
  # neighbour. That contiguity needs this repair is itself an argument for
  # estimating W rather than assuming it.
  iso <- which(rowSums(Om_q) == 0)
  for (i in iso) Om_q[i, order(DIST_KM[i, ])[2]] <- 1
  say("[geo] queen isolates repaired with nearest neighbour ({length(iso)}): {paste(regions$nuts1[iso], collapse = ', ')}")

  Om_k <- matrix(0, N_REG, N_REG, dimnames = dimnames(Om_q))
  for (i in seq_len(N_REG)) Om_k[i, order(DIST_KM[i, ])[2:(KBAR + 1)]] <- 1

  W_queen <- row_std(Om_q)
  W_knn   <- row_std(Om_k)
  say("[geo] queen: mean degree {round(mean(rowSums(Om_q)), 2)} | kNN-{KBAR}: mean degree {round(mean(rowSums(Om_k)), 2)}")

  geo_crosswalk <- regions |>
    mutate(
      name_latn     = geo$NAME_LATN,
      centroid_x    = CENTROIDS[, 1],
      centroid_y    = CENTROIDS[, 2],
      area_km2      = round(as.numeric(st_area(geo)) / 1e6, 1),
      queen_degree  = rowSums(Om_q),
      queen_repaired = seq_len(N_REG) %in% iso,
      knn_k         = rowSums(Om_k),
      in_map_frame  = CENTROIDS[, 1] > 2.55e6 & CENTROIDS[, 1] < 6.60e6 &
                      CENTROIDS[, 2] > 1.35e6 & CENTROIDS[, 2] < 5.45e6
    )
  write_csv(geo_crosswalk, glue("{SLUG}_geo_crosswalk.csv"))
  say("Wrote {SLUG}_geo_crosswalk.csv ({nrow(geo_crosswalk)} rows); {sum(!geo_crosswalk$in_map_frame)} regions outside the map frame")
}


# -- 3. The prior architecture: paper Figure 1 and Table 2 --------------------
sec("Section 3: spatially structured priors and sparsity priors")

## 3a. Paper Figure 1 - four stylized spatial priors on a 30-region linear city
NC <- 30
d_lin <- abs(outer(1:NC, 1:NC, "-"))          # distance along the line
mk <- function(m) { diag(m) <- 0; m }
prior_cases <- list(
  "A. All links unknown (the default)"    = mk(matrix(0.5, NC, NC)),
  "B. Known 10-nearest-neighbour W"       = mk((d_lin <= 5) * 1),
  "C. Distance band, unknown inside"      = mk((d_lin <= 8) * 0.5),
  "D. Mixed: forced, unknown, excluded"   = mk(ifelse(d_lin == 1, 1,
                                                ifelse(d_lin <= 8, 0.5, 0)))
)
prior_long <- bind_rows(lapply(names(prior_cases), function(nm) {
  M <- prior_cases[[nm]]
  expand_grid(i = 1:NC, j = 1:NC) |>
    mutate(value = M[cbind(i, j)], case = nm)
}))
# The pedagogical payoff: cells fixed at 0 or 1 are not sampled at all
# (paper footnote 6), so cases C and D are cheaper as well as more informed.
sampled_n <- vapply(prior_cases, function(M) sum(M > 0 & M < 1), numeric(1))
lab_n <- tibble(case = names(prior_cases),
                lab = glue("{format(sampled_n, big.mark = ',')} of {format(NC*NC-NC, big.mark = ',')} cells sampled"))
prior_long <- left_join(prior_long, lab_n, by = "case")

p2 <- ggplot(prior_long, aes(j, i, fill = factor(value))) +
  geom_raster() +
  geom_text(data = distinct(prior_long, case, lab), inherit.aes = FALSE,
            aes(x = NC / 2, y = -2.4, label = lab), colour = TEXT, size = 3) +
  facet_wrap(~case, ncol = 2, labeller = label_wrap_gen(width = 34)) +
  scale_fill_manual(
    values = c("0" = "#16203a", "0.5" = STEEL, "1" = ORANGE),
    labels = c("0 = link excluded a priori", "0.5 = link unknown, estimated",
               "1 = link forced a priori"), name = NULL) +
  scale_y_reverse(expand = expansion(mult = c(0.10, 0.02))) +
  coord_fixed() +
  labs(title = "Four ways to encode prior knowledge about who is a neighbour",
       subtitle = "Replication of Krisztin & Piribauer (2026), Figure 1: prior hyperparameters for a 30-region linear city",
       x = "column j (potential neighbour)", y = "row i (region)") +
  theme(legend.position = "top", axis.text = element_text(size = 7))
save_fig(p2, "02_prior_spatial_cases", w = 9.5, h = 9.5)
say("Figure 02 (paper Figure 1: spatial prior cases) saved.")

## 3b. Paper Table 2 - three sparsity priors on the neighbour count
sparsity_grid <- function(n, kbar) {
  k <- 0:(n - 1)
  b_shrink <- ((n - 1) - kbar) / kbar
  cases <- list(rep(1, n),
                bbinompdf(k, nsize = n - 1, a = 1, b = 1),
                bbinompdf(k, nsize = n - 1, a = 1, b = b_shrink))
  names(cases) <- c(
    "(a) No shrinkage",
    "(b) Package default: a = b = 1",
    sprintf("(c) Strong shrinkage: b = %.2f", b_shrink))
  bind_rows(lapply(names(cases), function(nm) {
    m <- cases[[nm]]
    p <- choose(n - 1, k) * m
    p <- p / sum(p)
    tibble(case = nm, n = n, kbar = kbar, k = k,
           m_k = m / max(m), p_k = p, expected_k = sum(k * p))
  }))
}
sp30 <- sparsity_grid(30, 5)
sp90 <- sparsity_grid(N_REG, KBAR)
write_csv(bind_rows(sp30, sp90), glue("{SLUG}_prior_sparsity.csv"))
say("Wrote {SLUG}_prior_sparsity.csv ({nrow(sp30) + nrow(sp90)} rows)")

# Correctness check on the paper's claim that a = b = 1 is uniform on k_i.
unif_sd <- sp30 |> filter(grepl("^\\(b\\)", case)) |> pull(p_k) |> sd()
say("Case (b) implied p(k) standard deviation = {signif(unif_sd, 3)} (should be ~0: uniform on k)")
cat("\nPrior expected number of neighbours, n = 30 and n = 90:\n")
print(bind_rows(sp30, sp90) |> distinct(case, n, expected_k) |>
        mutate(expected_k = round(expected_k, 2)) |> as.data.frame())

sp_plot <- bind_rows(
  sp30 |> select(case, k, value = m_k) |> mutate(quantity = "Prior weight m(k)"),
  sp30 |> select(case, k, value = p_k) |> mutate(quantity = "Implied prior on k")
) |> mutate(quantity = factor(quantity, levels = c("Prior weight m(k)", "Implied prior on k")))
ek30 <- sp30 |> distinct(case, expected_k)

p3 <- ggplot(sp_plot, aes(k, value)) +
  geom_col(fill = STEEL, width = 0.8) +
  geom_vline(data = ek30, aes(xintercept = expected_k), colour = ORANGE,
             linetype = "dashed", linewidth = 0.5) +
  facet_grid(quantity ~ case, scales = "free_y", switch = "y",
             labeller = label_wrap_gen(width = 20)) +
  labs(title = "Three priors on how many neighbours a region has",
       subtitle = "Replication of Krisztin & Piribauer (2026), Table 2, n = 30. Top row: the weight you supply. Bottom row: the prior it implies. Orange line: prior mean degree.",
       x = "number of neighbours k", y = NULL) +
  theme(strip.placement = "outside", axis.text.y = element_text(size = 7))
save_fig(p3, "03_prior_sparsity", w = 11, h = 6.5)
say("Figure 03 (paper Table 2: sparsity priors) saved.")

p4 <- ggplot(sp90, aes(k, p_k, colour = case)) +
  geom_line(linewidth = 0.9) +
  geom_vline(xintercept = KBAR, colour = ORANGE, linetype = "dashed") +
  annotate("text", x = KBAR + 3, y = Inf, vjust = 1.6, hjust = 0,
           label = glue("k-bar = {KBAR}"), colour = ORANGE, size = 3.4) +
  scale_colour_manual(values = c(TEXT, STEEL, TEAL), name = NULL) +
  labs(title = glue("At n = {N_REG}, the 'non-informative' prior expects 44.5 neighbours per region"),
       subtitle = "Implied prior distribution of the neighbour count under the three Table 2 priors",
       x = "number of neighbours k", y = "prior probability") +
  theme(legend.position = "top", legend.direction = "vertical")
save_fig(p4, "04_prior_k_n90", w = 9, h = 5.5)
say("Figure 04 (implied prior on k at n = 90) saved.")

## 3c. The prior actually used for the 90-region panel (paper Section 5)
Wprior <- matrix(0.5, ncol = N_REG, nrow = N_REG)
diag(Wprior) <- 0
a_pr <- 1
b_pr <- ((N_REG - 1) - KBAR) / KBAR
priorW_hierarchical <- bbinompdf(0:(N_REG - 1), nsize = (N_REG - 1),
                                 a = a_pr, b = b_pr)
AA <- W_priors(n = N_REG, W_prior = Wprior,
               nr_neighbors_prior = priorW_hierarchical)
say("Empirical prior: a = {a_pr}, b = ((n-1)-kbar)/kbar = {round(b_pr, 5)}, prior link probability = {round(KBAR/(N_REG-1), 5)}")
say("Unknown off-diagonal cells: {format(N_REG^2 - N_REG, big.mark = ',')} against {format(N_REG*TT, big.mark = ',')} observations")


# -- 4. The paper-exact fit and the Table 3 reproduction audit ----------------
sec("Section 4: paper-exact sarw() fit and Table 3 audit")

PAPER_KEY <- glue("fit_paper_seed{SEED_PAPER}_n{N_REG}_t{TT}_i{NITER_PAPER}_r{NRETAIN_PAPER}_kbar{KBAR}_full")
paper_cached <- file.exists(file.path(CACHE_DIR, glue("{SLUG}_{PAPER_KEY}.rds"))) && !FORCE_REFIT

c_iter <- NA_real_; f_fix <- NA_real_
if (!paper_cached) {
  # Two-point timing probe: one short run conflates the fixed setup cost with
  # the marginal per-iteration cost, so probe twice and solve the 2x2.
  probe <- function(ni) {
    set.seed(SEED_PROBE)
    t0 <- proc.time()[["elapsed"]]
    quiet_fit(sarw(Y = Y, tt = TT, Z = Z, niter = ni,
                   nretain = max(1L, ni %/% 2L), W_prior = AA))
    proc.time()[["elapsed"]] - t0
  }
  t2 <- probe(2L); t6 <- probe(6L)
  c_iter <- max((t6 - t2) / 4, 1e-6)
  f_fix  <- max(t2 - 2 * c_iter, 0)
  eta    <- f_fix + NITER_PAPER * c_iter
  say("[probe] fixed cost {round(f_fix, 2)}s | {round(c_iter, 3)}s per iteration | ETA for {NITER_PAPER} iterations: {round(eta/60, 1)} min")

  # Escalation ladder. The headline chain is never shortened, thinned or
  # parallelised: all three change the RNG stream and destroy the Table 3
  # comparison, which is the entire point of this section. Other sections
  # degrade instead.
  if (eta / 60 > MAX_MIN && !ALLOW_SLOW) {
    stop(glue("Paper-exact run ETA is {round(eta/60,1)} min, above ESTIMATEW_MAX_MIN={MAX_MIN}. ",
              "Re-run with ESTIMATEW_ALLOW_SLOW=1 to proceed."))
  }
  if (eta / 60 > 15) {
    say("[SLOW] ETA above 15 min: replacing the long chains with two paper-length chains and shrinking the simulation.")
    NITER_SIM <- 800L; N_SIM <- 30L; N_TAX <- 15L; NITER_TAX <- 250L
  } else if (eta / 60 > 6) {
    say("[SLOW] ETA above 6 min: shrinking the simulation and taxonomy panels.")
    N_SIM <- 30L; NITER_SIM <- 1500L; N_TAX <- 20L
  }
}

# --- REPRODUCIBILITY BARRIER -------------------------------------------------
# The RNG state entering sarw() must be exactly the state after set.seed(571),
# as in Krisztin & Piribauer (2026, Section 5). The timing probe above consumed
# random numbers, so we re-seed here. Nothing between this comment and the
# sarw() call may draw a random number.
stopifnot(identical(RNGkind(), c("Mersenne-Twister", "Inversion", "Rejection")))
res_sarw <- cached(PAPER_KEY, {
  set.seed(SEED_PAPER)
  quiet_fit(sarw(Y = Y, tt = TT, Z = Z, niter = NITER_PAPER,
                 nretain = NRETAIN_PAPER, W_prior = AA))
})
# -----------------------------------------------------------------------------
log_runtime("sarw_paper", attr(res_sarw, "runtime_sec") %||% NA_real_,
            n = N_REG, tt = TT, niter = NITER_PAPER, nretain = NRETAIN_PAPER)

cat("\nStructure of the fitted object (first run documents the true shapes):\n")
cat("  class:", paste(class(res_sarw), collapse = ", "), "\n")
for (nm in c("postb", "posts", "postr", "postw", "post.direct", "post.indirect", "post.total")) {
  say("  {formatC(nm, width = -14)} {paste(dim(res_sarw[[nm]]), collapse = ' x ')}")
}
cat("\nsummary(res_sarw) - the package's own quick overview:\n")
print(summary(res_sarw))

draws_b   <- as_draws(res_sarw$postb);         colnames(draws_b) <- Z_LABELS
draws_dir <- as_draws(res_sarw$post.direct);   colnames(draws_dir) <- Z_LABELS
draws_ind <- as_draws(res_sarw$post.indirect); colnames(draws_ind) <- Z_LABELS
draws_tot <- as_draws(res_sarw$post.total);    colnames(draws_tot) <- Z_LABELS
draws_r   <- as.vector(res_sarw$postr)
draws_s   <- as.vector(res_sarw$posts)
NRET <- length(draws_r)
say("Retained draws: {NRET}")

summarise_block <- function(mat, block, labels = colnames(mat)) {
  tibble(
    parameter = labels, block = block,
    mean = apply(mat, 2, mean), sd = apply(mat, 2, sd),
    q025 = apply(mat, 2, quantile, 0.025),
    q500 = apply(mat, 2, median),
    q975 = apply(mat, 2, quantile, 0.975),
    ess  = apply(mat, 2, function(v) as.numeric(coda::effectiveSize(v))),
    geweke_z = apply(mat, 2, function(v)
      as.numeric(coda::geweke.diag(coda::mcmc(v))$z))
  ) |> mutate(mcse = sd / sqrt(pmax(ess, 1)))
}
posterior_params <- bind_rows(
  summarise_block(draws_b, "beta"),
  summarise_block(matrix(draws_r, ncol = 1), "rho", "rho"),
  summarise_block(matrix(draws_s, ncol = 1), "sigma2", "sigma2"),
  summarise_block(draws_dir[, -1, drop = FALSE], "direct"),
  summarise_block(draws_ind[, -1, drop = FALSE], "indirect"),
  summarise_block(draws_tot[, -1, drop = FALSE], "total")
)
write_csv(posterior_params, glue("{SLUG}_posterior_params.csv"))
say("Wrote {SLUG}_posterior_params.csv ({nrow(posterior_params)} rows)")
cat("\nPosterior summary of the paper-exact chain:\n")
print(posterior_params |> mutate(across(where(is.numeric), ~signif(.x, 4))) |> as.data.frame())

## The headline picture: every reported quantity with its credible interval.
cat_levels <- rev(c(Z_LABELS, "rho", "sigma2"))
p5 <- posterior_params |>
  mutate(
    panel = factor(case_when(
      block %in% c("beta", "rho", "sigma2") ~ "Parameters",
      TRUE ~ "Impacts of a one-unit change"),
      levels = c("Parameters", "Impacts of a one-unit change")),
    lab = ifelse(block %in% c("beta", "rho", "sigma2"), parameter,
                 paste0(parameter, "  (", block, ")")),
    lab = factor(lab, levels = rev(unique(lab))),
    # betas, rho and sigma2 live on wildly different scales, and so do the
    # three impact variables; facet-wrapping on free scales is the only way to
    # see the education coefficients at all next to the intercept.
    grp = factor(parameter, levels = c(Z_LABELS, "rho", "sigma2"))
  ) |>
  ggplot(aes(mean, lab, colour = block)) +
  geom_vline(xintercept = 0, colour = TEXT, linetype = "dotted",
             linewidth = 0.4) +
  geom_linerange(aes(xmin = q025, xmax = q975), linewidth = 0.7) +
  geom_point(size = 2.4) +
  facet_wrap(~grp, scales = "free", ncol = 2) +
  scale_colour_manual(
    values = c(beta = STEEL, rho = TEAL, sigma2 = TEXT,
               direct = "#8fd0c8", indirect = ORANGE, total = "#e8b48f"),
    name = NULL) +
  labs(title = "Everything the model says, with 95% credible intervals",
       subtitle = glue("Posterior means from the paper-exact chain ({NITER_PAPER} iterations, {NRETAIN_PAPER} retained, seed {SEED_PAPER}). Each panel has its own scale."),
       x = "posterior mean", y = NULL) +
  theme(legend.position = "top", axis.text.y = element_text(size = 8))
save_fig(p5, "05_posterior_estimates", w = 11, h = 7)
say("Figure 05 (posterior estimates and impacts) saved.")

## Table 3 reproduction audit ------------------------------------------------
paper_table3 <- tribble(
  ~quantity,                              ~paper_mean, ~paper_sd,
  "intercept",                                0.17651,   0.01090,
  "log initial GVA per worker",              -0.01692,   0.00117,
  "share low education",                      0.00004,   0.00005,
  "share high education",                     0.00044,   0.00011,
  "rho",                                      0.71322,   0.01574,
  "sigma2",                                   0.00053,   0.00002,
  "av. direct log initial GVA per worker",   -0.01880,   0.00125,
  "av. direct share low education",           0.00004,   0.00006,
  "av. direct share high education",          0.00049,   0.00012,
  "av. indirect log initial GVA per worker", -0.03972,   0.00386,
  "av. indirect share low education",         0.00008,   0.00012,
  "av. indirect share high education",        0.00104,   0.00026
)
# Every block needs its own label. Without an explicit "total" branch the total
# rows fall through to the bare parameter name, collide with the beta rows, and
# the left_join below silently returns 15 rows instead of 12.
ours <- posterior_params |>
  mutate(quantity = case_when(
    block == "direct"   ~ paste("av. direct", parameter),
    block == "indirect" ~ paste("av. indirect", parameter),
    block == "total"    ~ paste("av. total", parameter),
    TRUE ~ parameter)) |>
  select(quantity, our_mean = mean, our_sd = sd, our_mcse = mcse, our_ess = ess)
stopifnot(!any(duplicated(ours$quantity)))

# The paper prints five decimals, so a quantity like 0.00004 carries a single
# significant digit; PAPER_PREC caps what any agreement claim can mean.
PAPER_PREC <- 1e-5
table3_audit <- paper_table3 |>
  left_join(ours, by = "quantity") |>
  mutate(
    abs_diff      = abs(our_mean - paper_mean),
    rel_diff_pct  = 100 * abs_diff / pmax(abs(paper_mean), .Machine$double.eps),
    paper_sd_units = abs_diff / paper_sd,
    mcse_units    = abs_diff / pmax(our_mcse, .Machine$double.eps),
    sign_match    = sign(our_mean) == sign(paper_mean),
    paper_precision = PAPER_PREC,
    verdict = case_when(
      abs_diff <= PAPER_PREC ~ "exact",
      mcse_units < 2         ~ "within_mc_noise",
      TRUE                   ~ "differs")
  )
stopifnot(nrow(table3_audit) == nrow(paper_table3), !any(is.na(table3_audit$our_mean)))
write_csv(table3_audit, glue("{SLUG}_table3_audit.csv"))
cat("\nReproduction audit against the paper's Table 3:\n")
print(table3_audit |>
        transmute(quantity, paper_mean, our_mean = signif(our_mean, 5),
                  abs_diff = signif(abs_diff, 3),
                  sd_units = round(paper_sd_units, 2),
                  mcse_units = round(mcse_units, 2), verdict) |>
        as.data.frame(), row.names = FALSE)
say("\nAudit verdicts: {paste(names(table(table3_audit$verdict)), table(table3_audit$verdict), sep = ' = ', collapse = ' | ')}")

# Soft guardrails: a failed reproduction is a legitimate finding, never a stop().
rho_ours <- posterior_params$mean[posterior_params$parameter == "rho"]
if (abs(rho_ours - 0.71322) > 0.05)
  say("[WARN] rho differs from Table 3 by more than 0.05 - investigate the RNG stream / BLAS.")
if (any(!table3_audit$sign_match))
  say("[WARN] sign flip vs Table 3 in: {paste(table3_audit$quantity[!table3_audit$sign_match], collapse = ', ')}")


# -- 5. Convergence diagnostics and the longer chains -------------------------
sec("Section 5: trace plots, longer chains, and convergence diagnostics")

trace_tbl <- function(draws_b, draws_r, draws_s, chain) {
  colnames(draws_b) <- Z_LABELS
  bind_cols(as_tibble(draws_b), tibble(rho = draws_r, `sigma^2` = draws_s)) |>
    mutate(draw = row_number(), chain = chain) |>
    pivot_longer(-c(draw, chain), names_to = "parameter", values_to = "value") |>
    mutate(parameter = factor(parameter,
                              levels = c(Z_LABELS, "rho", "sigma^2")))
}
tr_paper <- trace_tbl(draws_b, draws_r, draws_s, "paper (200/100)")
means_paper <- tr_paper |> group_by(parameter) |> summarise(m = mean(value))

p6 <- ggplot(tr_paper, aes(draw, value)) +
  geom_line(colour = STEEL, linewidth = 0.4) +
  geom_hline(data = means_paper, aes(yintercept = m), colour = ORANGE,
             linetype = "dashed", linewidth = 0.5) +
  facet_wrap(~parameter, scales = "free_y", ncol = 2) +
  labs(title = "Trace plots of the retained posterior draws",
       subtitle = glue("Replication of Krisztin & Piribauer (2026), Figure 3. {NRET} retained draws; orange dashed line: posterior mean"),
       x = "retained draw", y = NULL)
save_fig(p6, "06_trace_paper", w = 10, h = 7, dpi = 200)
say("Figure 06 (paper Figure 3: trace plots) saved.")

# Size the two robustness chains from the measured per-iteration cost. Two
# chains rather than one long chain, because Gelman-Rubin R-hat needs at least
# two independent starting points and is the diagnostic that actually answers
# "did this converge?".
if (is.na(c_iter)) c_iter <- (attr(res_sarw, "runtime_sec") %||% 320) / NITER_PAPER
if (is.na(f_fix))  f_fix  <- 3
per_chain_budget <- max(BUDGET_LONG_SEC / 2, 60)
niter_long <- as.integer(max(200, min(3000,
              floor((per_chain_budget - f_fix) / c_iter / 100) * 100)))
nretain_long <- as.integer(niter_long / 2)
say("Robustness chains: 2 x (niter {niter_long} / nretain {nretain_long}); estimated {round(2 * niter_long * c_iter / 60, 1)} min if not cached")

fit_long <- function(seed) {
  key <- glue("fit_long_seed{seed}_n{N_REG}_t{TT}_i{niter_long}_r{nretain_long}_kbar{KBAR}_full")
  cached(key, {
    set.seed(seed)
    quiet_fit(sarw(Y = Y, tt = TT, Z = Z, niter = niter_long,
                   nretain = nretain_long, W_prior = AA))
  })
}
res_long_a <- fit_long(SEED_LONG_A)
res_long_b <- fit_long(SEED_LONG_B)
log_runtime("sarw_long_a", attr(res_long_a, "runtime_sec") %||% NA_real_,
            n = N_REG, tt = TT, niter = niter_long, nretain = nretain_long)
log_runtime("sarw_long_b", attr(res_long_b, "runtime_sec") %||% NA_real_,
            n = N_REG, tt = TT, niter = niter_long, nretain = nretain_long)

scalar_mcmc <- function(fit) {
  m <- cbind(t(fit$postb), rho = as.vector(fit$postr),
             sigma2 = as.vector(fit$posts))
  colnames(m) <- c(Z_LABELS, "rho", "sigma2")
  coda::mcmc(m)
}
mc_a <- scalar_mcmc(res_long_a); mc_b <- scalar_mcmc(res_long_b)
gr   <- coda::gelman.diag(coda::mcmc.list(mc_a, mc_b), autoburnin = FALSE,
                          multivariate = FALSE)
cat("\nGelman-Rubin potential scale reduction factors (2 chains):\n")
print(round(gr$psrf, 4))

chain_rows <- function(fit, label, seed, ni, nr) {
  m <- as.matrix(scalar_mcmc(fit))
  tibble(parameter = colnames(m), chain = label, seed = seed,
         niter = ni, nretain = nr,
         mean = apply(m, 2, mean), sd = apply(m, 2, sd),
         q025 = apply(m, 2, quantile, 0.025),
         q975 = apply(m, 2, quantile, 0.975),
         ess = apply(m, 2, function(v) as.numeric(coda::effectiveSize(v))),
         geweke_z = apply(m, 2, function(v)
           as.numeric(coda::geweke.diag(coda::mcmc(v))$z)),
         runtime_sec = round(attr(fit, "runtime_sec") %||% NA_real_, 1))
}
chain_comparison <- bind_rows(
  chain_rows(res_sarw,   "paper_exact",  SEED_PAPER,  NITER_PAPER, NRETAIN_PAPER),
  chain_rows(res_long_a, "robustness_a", SEED_LONG_A, niter_long,  nretain_long),
  chain_rows(res_long_b, "robustness_b", SEED_LONG_B, niter_long,  nretain_long)
) |>
  left_join(tibble(parameter = rownames(gr$psrf),
                   gelman_psrf = round(gr$psrf[, 1], 4)), by = "parameter")
write_csv(chain_comparison, glue("{SLUG}_chain_comparison.csv"))
say("Wrote {SLUG}_chain_comparison.csv ({nrow(chain_comparison)} rows)")
cat("\nChain comparison:\n")
# signif() must not touch seed/niter/nretain: rounding an integer seed to four
# significant digits prints 20260731 as 20260000.
print(chain_comparison |>
        mutate(across(where(is.numeric) & !c(seed, niter, nretain),
                      ~signif(.x, 4))) |>
        as.data.frame(), row.names = FALSE)

tr_long <- bind_rows(
  trace_tbl(t(res_long_a$postb), as.vector(res_long_a$postr),
            as.vector(res_long_a$posts), glue("chain A ({niter_long}/{nretain_long})")),
  trace_tbl(t(res_long_b$postb), as.vector(res_long_b$postr),
            as.vector(res_long_b$posts), glue("chain B ({niter_long}/{nretain_long})"))
)
p_trace_long <- ggplot(tr_long, aes(draw, value, colour = chain)) +
  geom_line(linewidth = 0.3, alpha = 0.85) +
  facet_wrap(~parameter, scales = "free_y", ncol = 2) +
  scale_colour_manual(values = c(STEEL, TEAL), name = NULL) +
  labs(title = "Two independent robustness chains",
       subtitle = glue("Same model and priors, different seeds ({SEED_LONG_A} and {SEED_LONG_B}). Overlapping traces are what convergence looks like."),
       x = "retained draw", y = NULL) +
  theme(legend.position = "top")
save_fig(p_trace_long, "07_trace_long", w = 10, h = 7, dpi = 200)
say("Figure 07 (robustness chains) saved.")

run_mean <- function(v) cumsum(v) / seq_along(v)
p7a <- bind_rows(
  tibble(draw = seq_len(NRET), value = run_mean(draws_r), chain = "paper (200/100)"),
  tibble(draw = seq_len(nretain_long), value = run_mean(as.vector(res_long_a$postr)), chain = "chain A"),
  tibble(draw = seq_len(nretain_long), value = run_mean(as.vector(res_long_b$postr)), chain = "chain B")
) |>
  ggplot(aes(draw, value, colour = chain)) +
  geom_line(linewidth = 0.7) +
  scale_colour_manual(values = c(TEAL, "#3f7fbf", ORANGE), name = NULL) +
  labs(title = "Running posterior mean of rho", x = "retained draw", y = "running mean") +
  theme(legend.position = "top")

p7b <- chain_comparison |>
  ggplot(aes(reorder(parameter, ess), ess, fill = chain)) +
  geom_col(position = position_dodge(0.8), width = 0.75) +
  geom_hline(yintercept = 100, colour = ORANGE, linetype = "dashed") +
  coord_flip() +
  scale_fill_manual(values = c(TEAL, "#3f7fbf", ORANGE), name = NULL) +
  labs(title = "Effective sample size by parameter and chain",
       subtitle = "Orange line: ESS = 100", x = NULL, y = "ESS") +
  theme(legend.position = "top")

p7c <- chain_comparison |>
  ggplot(aes(reorder(parameter, geweke_z), geweke_z, colour = chain)) +
  geom_hline(yintercept = c(-1.96, 1.96), colour = ORANGE, linetype = "dashed") +
  geom_hline(yintercept = 0, colour = TEXT, linewidth = 0.3) +
  geom_point(size = 2.4, position = position_dodge(0.5)) +
  coord_flip() +
  scale_colour_manual(values = c(TEAL, "#3f7fbf", ORANGE), name = NULL) +
  labs(title = "Geweke z-scores", subtitle = "Inside the dashed band is consistent with a stationary chain",
       x = NULL, y = "z") +
  theme(legend.position = "none")

save_fig(p7a / (p7b | p7c), "08_convergence_diag", w = 11, h = 8)
say("Figure 08 (convergence diagnostics) saved.")


# -- 6. Anatomy of the estimated spatial weight matrix ------------------------
sec("Section 6: posterior mean W, inclusion probabilities, degree distribution")

# The multiplier must be averaged over draws, not computed from the mean W and
# the mean rho: (I - rho W)^-1 is a nonlinear function, so plugging in means is
# a Jensen-inequality error.
slim_fit <- function(fit, label) {
  pw <- fit$postw
  S  <- dim(pw)[3]
  rr <- as.vector(fit$postr)
  W_mean <- apply(pw, c(1, 2), mean)
  W_pip  <- apply(pw > 0, c(1, 2), mean)
  I <- diag(N_REG)
  MULT <- matrix(0, N_REG, N_REG)
  for (s in seq_len(S)) MULT <- MULT + solve(I - rr[s] * pw[, , s])
  MULT <- MULT / S
  deg  <- t(apply(pw > 0, 3, function(m) rowSums(matrix(m, N_REG, N_REG))))
  dimnames(W_mean) <- dimnames(W_pip) <- dimnames(MULT) <-
    list(regions$nuts1, regions$nuts1)
  list(label = label, W_mean = W_mean, W_pip = W_pip, MULT_mean = MULT,
       degree_draws = deg, postb = fit$postb, postr = fit$postr,
       posts = fit$posts, post.direct = fit$post.direct,
       post.indirect = fit$post.indirect, post.total = fit$post.total,
       niter = NITER_PAPER, nretain = S, seed = SEED_PAPER,
       r_version = R.version.string,
       estimateW_version = as.character(packageVersion("estimateW")))
}
slim <- cached(glue("slim_paper_seed{SEED_PAPER}_i{NITER_PAPER}_r{NRETAIN_PAPER}_kbar{KBAR}"),
               slim_fit(res_sarw, "paper"))
W_mean <- slim$W_mean; W_pip <- slim$W_pip; MULT <- slim$MULT_mean

# degree_draws is (draw x region), so the per-region posterior mean degree is a
# COLUMN mean. rowMeans() here would silently average across regions instead.
deg_mean <- colMeans(slim$degree_draws)
say("Estimated degree: mean {round(mean(deg_mean), 2)} | median {round(median(deg_mean), 2)} | min {round(min(deg_mean), 2)} | max {round(max(deg_mean), 2)}  (prior anchor k-bar = {KBAR})")
say("Posterior inclusion probability: mean {round(mean(W_pip[row(W_pip) != col(W_pip)]), 4)} | max {round(max(W_pip), 3)} | share above 0.5: {round(100*mean(W_pip[row(W_pip) != col(W_pip)] > 0.5), 2)}%")

# Order regions by group then country so position carries group identity on
# every axis; colour alone cannot separate 26 countries on a dark background.
ord <- order(regions$country_group, regions$country, regions$nuts1)
reg_ord <- regions[ord, ]
lev <- reg_ord$nuts1
country_breaks <- which(diff(as.integer(factor(reg_ord$country,
                                               levels = unique(reg_ord$country)))) != 0) + 0.5
group_mid <- reg_ord |> mutate(pos = row_number()) |> group_by(country_group) |>
  summarise(mid = mean(pos), .groups = "drop")

W_pip_ord <- W_pip[ord, ord]
pip_long <- expand_grid(ri = seq_len(N_REG), ci = seq_len(N_REG)) |>
  mutate(from = factor(lev[ri], levels = lev),
         to   = factor(lev[ci], levels = lev),
         pip  = W_pip_ord[cbind(ri, ci)])

p8 <- ggplot(pip_long, aes(to, from, fill = pip)) +
  geom_raster() +
  geom_vline(xintercept = country_breaks, colour = BG, linewidth = 0.2) +
  # the y axis is reversed below, so break positions must be mirrored
  geom_hline(yintercept = N_REG + 1 - country_breaks, colour = BG,
             linewidth = 0.2) +
  scale_fill_gradientn(colours = c("#131c33", "#24406b", STEEL, ORANGE, "#ffe0a3"),
                       name = "P(link)", limits = c(0, max(W_pip))) +
  scale_y_discrete(limits = rev(lev)) +
  coord_fixed() +
  labs(title = "Posterior probability that region i treats region j as a neighbour",
       subtitle = glue("All {format(N_REG^2 - N_REG, big.mark = ',')} off-diagonal cells, ordered by supranational group then country. Thin lines are country borders."),
       x = "neighbour j", y = "region i") +
  theme(axis.text = element_blank(), axis.ticks = element_blank(),
        panel.grid = element_blank())
save_fig(p8, "09_W_pip_heatmap", w = 9.5, h = 9)
say("Figure 09 (posterior inclusion probability heatmap) saved.")

W_degree <- tibble(
  nuts1 = regions$nuts1, country = regions$country,
  country_group = regions$country_group,
  deg_mean = deg_mean,
  deg_sd   = apply(slim$degree_draws, 2, sd),
  deg_q025 = apply(slim$degree_draws, 2, quantile, 0.025),
  deg_q975 = apply(slim$degree_draws, 2, quantile, 0.975),
  in_strength  = colSums(W_mean),
  out_strength = rowSums(W_mean),
  mult_in_strength = colSums(MULT) - diag(MULT)
)
if (HAS_GEO) W_degree <- W_degree |>
  mutate(queen_degree = rowSums(W_queen > 0), knn_k = rowSums(W_knn > 0))
write_csv(W_degree, glue("{SLUG}_W_degree.csv"))
say("Wrote {SLUG}_W_degree.csv ({nrow(W_degree)} rows)")

## Identification checks -------------------------------------------------------
# The six sufficient conditions for global identification in De Paula, Rasul &
# Souza (2025, Corollary 3). Four hold by construction; two are genuinely
# testable from the draws; one (the sign of rho) is imposed, not tested.
pw_all <- res_sarw$postw
rr_all <- as.vector(res_sarw$postr)
SS     <- length(rr_all)
diag_max   <- max(vapply(seq_len(SS), function(s) max(abs(diag(pw_all[, , s]))), numeric(1)))
absrow_max <- max(vapply(seq_len(SS), function(s)
  max(rowSums(abs(rr_all[s] * pw_all[, , s]))), numeric(1)))
rowsum_ok  <- all(vapply(seq_len(SS), function(s) {
  rs <- rowSums(pw_all[, , s]); all(abs(rs - 1) < 1e-8 | rs < 1e-12) }, logical(1)))
w2_sd <- vapply(seq_len(SS), function(s) {
  W <- pw_all[, , s]; sd(diag(W %*% W)) }, numeric(1))
rho_beta_init <- rr_all * draws_b[, 2]

identification <- tibble(
  assumption = c("I. zero diagonal of W",
                 "II. row-wise sum of |rho W| < 1",
                 "II. rho < 1",
                 "IV. rows of W sum to 1 (or 0)",
                 "V. diagonal of W^2 not constant",
                 "VI. rho > 0",
                 "III. rho * beta != 0 (initial GVA)"),
  status = c("by construction", "by construction", "by construction",
             "by construction", "TESTED", "IMPOSED by the prior support",
             "TESTED"),
  statistic = c(
    glue("max |W_ii| over draws = {signif(diag_max, 3)}"),
    glue("max row sum = {round(absrow_max, 4)}"),
    glue("max rho = {round(max(rr_all), 4)}"),
    glue("all rows sum to 1 or 0: {rowsum_ok}"),
    glue("sd of diag(W^2) across regions: min {signif(min(w2_sd), 3)}, median {signif(median(w2_sd), 3)}"),
    glue("prior support is (0, 1); min drawn rho = {round(min(rr_all), 4)}"),
    glue("share of draws with |rho*beta| < 1e-4 = {round(mean(abs(rho_beta_init) < 1e-4), 3)}")),
  satisfied = c(diag_max < 1e-12, absrow_max < 1, max(rr_all) < 1, rowsum_ok,
                min(w2_sd) > 1e-8, TRUE, mean(abs(rho_beta_init) < 1e-4) < 0.05)
)
write_csv(identification, glue("{SLUG}_identification.csv"))
cat("\nIdentification conditions (De Paula, Rasul & Souza 2025, Corollary 3):\n")
print(as.data.frame(identification), row.names = FALSE)
say("Wrote {SLUG}_identification.csv ({nrow(identification)} rows)")

p9 <- W_degree |>
  mutate(nuts1 = factor(nuts1, levels = lev)) |>
  ggplot(aes(nuts1, deg_mean, colour = country_group)) +
  geom_hline(yintercept = KBAR, colour = ORANGE, linetype = "dashed") +
  geom_linerange(aes(ymin = deg_q025, ymax = deg_q975), linewidth = 0.4,
                 alpha = 0.7) +
  geom_point(size = 1.4) +
  scale_colour_manual(values = GROUP_COLS, name = NULL) +
  labs(title = "How many neighbours each region ends up with",
       subtitle = glue("Posterior mean degree with 95% credible intervals. Orange line: the prior anchor k-bar = {KBAR}."),
       x = NULL, y = "number of neighbours") +
  theme(axis.text.x = element_text(angle = 90, vjust = 0.5, size = 5),
        legend.position = "top")
save_fig(p9, "10_W_degree", w = 11, h = 6)
say("Figure 10 (estimated degree by region) saved.")

# Long-format edge table: the single source of truth for Sections 7 and 8.
edge <- expand_grid(i = seq_len(N_REG), j = seq_len(N_REG)) |>
  filter(i != j) |>
  mutate(
    from_nuts1 = regions$nuts1[i],       to_nuts1 = regions$nuts1[j],
    from_country = regions$country[i],   to_country = regions$country[j],
    from_group = as.character(regions$country_group[i]),
    to_group   = as.character(regions$country_group[j]),
    same_country = from_country == to_country,
    same_group   = from_group == to_group,
    pip     = W_pip[cbind(i, j)],
    w_mean  = W_mean[cbind(i, j)],
    mult    = MULT[cbind(i, j)]
  )
if (HAS_GEO) edge <- edge |>
  mutate(is_queen = W_queen[cbind(i, j)] > 0,
         is_knn   = W_knn[cbind(i, j)] > 0,
         dist_km  = DIST_KM[cbind(i, j)])
write_csv(edge |> mutate(across(where(is.numeric), ~round(.x, 6))),
          glue("{SLUG}_W_posterior_long.csv"))
say("Wrote {SLUG}_W_posterior_long.csv ({format(nrow(edge), big.mark = ',')} rows)")

share_same_country <- sum(edge$w_mean[edge$same_country]) / sum(edge$w_mean)
share_same_group   <- sum(edge$w_mean[edge$same_group])   / sum(edge$w_mean)
# Random benchmark: link mass allocated in proportion to country sizes.
cs <- as.vector(table(regions$country))
rand_same_country <- sum(cs * (cs - 1)) / (N_REG * (N_REG - 1))
gs <- as.vector(table(regions$country_group))
rand_same_group <- sum(gs * (gs - 1)) / (N_REG * (N_REG - 1))
say("Link mass inside the same country: {round(100*share_same_country, 1)}% (random benchmark {round(100*rand_same_country, 1)}%)")
say("Link mass inside the same supranational group: {round(100*share_same_group, 1)}% (random benchmark {round(100*rand_same_group, 1)}%)")


# -- 7. Paper Figure 2: networks and country chord diagrams -------------------
sec("Section 7: strongest links as networks and country-aggregated chords")

# Non-geographic layout: classical MDS on a dissimilarity built from the
# estimated link probabilities, so proximity on the page means "the data say
# these regions are connected", not "these regions are close on a map".
sim_mat <- (W_pip + t(W_pip)) / 2
D_net <- 1 - sim_mat / max(sim_mat)
diag(D_net) <- 0
lay <- tryCatch(cmdscale(as.dist(D_net), k = 2, add = TRUE)$points,
                error = function(e) NULL)
if (is.null(lay) || any(!is.finite(lay))) {
  say("[WARN] MDS layout degenerate; falling back to geographic centroids.")
  lay <- if (HAS_GEO) CENTROIDS else cbind(runif(N_REG), runif(N_REG))
}
nodes <- regions |>
  mutate(x = lay[, 1], y = lay[, 2],
         in_strength = colSums(W_mean),
         mult_in = colSums(MULT) - diag(MULT))

# Rank-based rather than threshold-based: W is sparse, so a quantile cut can
# land exactly on a tie and return far more than the intended share of links.
top_edges <- function(col, q) {
  keep_n <- ceiling(q * nrow(edge))
  edge |> mutate(value = .data[[col]]) |>
    slice_max(value, n = keep_n, with_ties = FALSE) |>
    mutate(x = lay[i, 1], y = lay[i, 2], xend = lay[j, 1], yend = lay[j, 2])
}
e_w  <- top_edges("w_mean", TOP_GRAPH)
e_m  <- top_edges("mult",   TOP_GRAPH)
say("Network graphs show the strongest {round(100*TOP_GRAPH)}% of links: {nrow(e_w)} of W, {nrow(e_m)} of the multiplier")

net_plot <- function(ed, nd, size_var, ttl, sub) {
  ggplot() +
    geom_curve(data = ed, aes(x, y, xend = xend, yend = yend, alpha = value),
               curvature = 0.18, colour = STEEL, linewidth = 0.28) +
    geom_point(data = nd, aes(x, y, colour = country_group,
                              size = .data[[size_var]])) +
    geom_text(data = nd, aes(x, y, label = nuts1), colour = WHITE, size = 1.5,
              vjust = -1.05) +
    scale_colour_manual(values = GROUP_COLS, name = NULL) +
    scale_alpha(range = c(0.10, 0.75), guide = "none") +
    scale_size(range = c(1, 5.5), guide = "none") +
    coord_equal() +
    labs(title = ttl, subtitle = sub, x = NULL, y = NULL) +
    theme(axis.text = element_blank(), axis.ticks = element_blank(),
          panel.grid = element_blank(), legend.position = "top")
}
p10 <- net_plot(e_w, nodes, "in_strength",
  "The estimated network of direct links, W",
  glue("Strongest {round(100*TOP_GRAPH)}% of posterior-mean links. Layout is MDS on link similarity, not geography. Node size: in-strength."))
save_fig(p10, "11_network_W", w = 9.5, h = 9, dpi = 170)
p11 <- net_plot(e_m, nodes, "mult_in",
  "The network of total spillovers, the multiplier (I - rho W)^-1",
  glue("Strongest {round(100*TOP_GRAPH)}% of off-diagonal multiplier entries, same layout as the previous figure. Node size: multiplier in-strength."))
save_fig(p11, "12_network_multiplier", w = 9.5, h = 9, dpi = 170)
say("Figures 11-12 (networks for W and the multiplier) saved.")

top_links <- bind_rows(
  e_w |> mutate(object = "W")          |> arrange(desc(value)) |> mutate(rank = row_number()),
  e_m |> mutate(object = "multiplier") |> arrange(desc(value)) |> mutate(rank = row_number())
) |>
  select(object, rank, from_nuts1, to_nuts1, from_country, to_country,
         same_country, same_group, value, pip, any_of(c("is_queen", "dist_km")))
write_csv(top_links |> mutate(across(where(is.numeric), ~round(.x, 6))),
          glue("{SLUG}_top_links.csv"))
say("Wrote {SLUG}_top_links.csv ({nrow(top_links)} rows)")
cat("\nTen strongest estimated links of W:\n")
print(top_links |> filter(object == "W") |> slice_head(n = 10) |>
        transmute(rank, from = from_nuts1, to = to_nuts1, same_country,
                  w_mean = round(value, 4), pip = round(pip, 3)) |>
        as.data.frame(), row.names = FALSE)

# Country aggregation. The diagonal is RETAINED: the paper's own reading of the
# chord diagrams is that the largest inflows are typically from the same
# country, which is a statement about the diagonal.
agg_country <- function(M) {
  cc <- regions$country
  a <- rowsum(M, cc)
  t(rowsum(t(a), cc))
}
C_w <- agg_country(W_mean)
C_m <- agg_country(MULT - diag(diag(MULT)))
cc_lab <- rownames(C_w)
country_flows <- expand_grid(from_country = cc_lab, to_country = cc_lab) |>
  mutate(
    from_group = unname(cc_to_group[from_country]),
    to_group   = unname(cc_to_group[to_country]),
    w_flow    = C_w[cbind(from_country, to_country)],
    mult_flow = C_m[cbind(from_country, to_country)]
  ) |>
  mutate(w_share = w_flow / sum(w_flow), mult_share = mult_flow / sum(mult_flow),
         in_top_w = w_flow >= quantile(w_flow, 1 - TOP_CHORD),
         in_top_mult = mult_flow >= quantile(mult_flow, 1 - TOP_CHORD))
write_csv(country_flows |> mutate(across(where(is.numeric), ~round(.x, 6))),
          glue("{SLUG}_country_flows.csv"))
say("Wrote {SLUG}_country_flows.csv ({nrow(country_flows)} rows)")

chord_mat <- function(M, q) {
  keep_n <- ceiling(q * length(M))
  cut <- sort(as.vector(M), decreasing = TRUE)[keep_n]
  M[M < cut] <- 0
  M
}
if (HAS_CIRCLIZE) {
  draw_chord <- function(M, ttl) {
    # After thresholding, a country can be left with no surviving flow in either
    # direction; chordDiagram errors on an all-zero sector, so drop those first.
    keep <- (rowSums(M) + colSums(M)) > 0
    M <- M[keep, keep, drop = FALSE]
    circlize::circos.clear()
    circlize::circos.par(gap.after = 2, start.degree = 90,
                         track.margin = c(0, 0.02),
                         points.overflow.warning = FALSE)
    circlize::chordDiagram(
      M, grid.col = country_cols[rownames(M)], transparency = 0.35,
      directional = 1, direction.type = c("diffHeight", "arrows"),
      link.arr.type = "big.arrow", link.border = NA,
      annotationTrack = "grid",
      preAllocateTracks = list(track.height = 0.10))
    circlize::circos.trackPlotRegion(track.index = 1, bg.border = NA,
      panel.fun = function(x, y) {
        s  <- circlize::get.cell.meta.data("sector.index")
        xl <- circlize::get.cell.meta.data("xlim")
        circlize::circos.text(mean(xl), 0.55, s, facing = "clockwise",
                              niceFacing = TRUE, adj = c(0, 0.5),
                              cex = 0.8, col = TEXT)
      })
    title(main = ttl, col.main = WHITE, cex.main = 1.1, line = 0)
    circlize::circos.clear()
  }
  save_base_fig("13_chord_W", res = 150, expr = draw_chord(chord_mat(C_w, TOP_CHORD),
    glue("Country-aggregated W, strongest {round(100*TOP_CHORD)}% of flows")))
  save_base_fig("14_chord_multiplier", res = 150, expr = draw_chord(chord_mat(C_m, TOP_CHORD),
    glue("Country-aggregated spillover multiplier, strongest {round(100*TOP_CHORD)}% of flows")))
  say("Figures 13-14 (chord diagrams) saved.")
} else {
  say("[SKIP] circlize unavailable; drawing country-flow heatmaps instead.")
  cf <- country_flows |>
    mutate(from_country = factor(from_country, levels = cc_lab),
           to_country = factor(to_country, levels = cc_lab))
  flow_hm <- function(fill_var, ttl) {
    ggplot(cf, aes(to_country, from_country, fill = .data[[fill_var]])) +
      geom_raster() + coord_fixed() +
      scale_fill_gradientn(colours = c("#131c33", STEEL, ORANGE), name = "flow") +
      labs(title = ttl, x = "to", y = "from")
  }
  save_fig(flow_hm("w_flow", "Country-aggregated W"), "13_chord_W", w = 9, h = 8)
  save_fig(flow_hm("mult_flow", "Country-aggregated spillover multiplier"),
           "14_chord_multiplier", w = 9, h = 8)
}

# How much denser is the multiplier network than W?
dens_w <- mean(edge$w_mean > 0); dens_m <- mean(edge$mult > 1e-8)
rk <- cor(rank(edge$w_mean), rank(edge$mult), method = "pearson")
say("Density: W {round(100*dens_w, 1)}% of off-diagonal cells non-zero, multiplier {round(100*dens_m, 1)}%; Spearman rank correlation of the two link rankings = {round(rk, 3)}")


# -- 8. Estimated W against the maps we would otherwise have assumed ----------
sec("Section 8: estimated W versus queen contiguity and 7-nearest neighbours")

W_comparison_metrics <- NULL
if (!HAS_GEO) {
  say("[SKIP] Section 8 requires NUTS-1 geometry, which is unavailable.")
} else {
  # Self-contained ROC/AUC so no extra dependency is needed.
  # AUC comes from the Mann-Whitney form on AVERAGED ranks, not from the
  # trapezoid over a sorted list. With 100 retained draws a posterior link
  # probability is quantized to 0.01, so thousands of cells tie exactly; a
  # sort-based AUC would silently reward whatever order the ties happen to
  # fall in. The step curve is still fine for plotting.
  roc_auc <- function(score, label) {
    label <- as.logical(label)
    npos <- sum(label); nneg <- sum(!label)
    auc <- if (npos == 0 || nneg == 0) NA_real_ else
      (mean(rank(score)[label]) - (npos + 1) / 2) / nneg
    o <- order(score, decreasing = TRUE); lab <- label[o]
    list(auc = auc, tpr = c(0, cumsum(lab) / npos),
         fpr = c(0, cumsum(!lab) / nneg))
  }
  jac <- function(a, b) sum(a & b) / sum(a | b)
  topq <- edge$w_mean >= quantile(edge$w_mean, 1 - TOP_GRAPH)

  comp_row <- function(name, label_vec) {
    r <- roc_auc(edge$pip, label_vec)
    tibble(comparator = name, n_links = sum(label_vec),
           pearson_r  = cor(edge$pip, as.numeric(label_vec)),
           spearman_r = cor(edge$pip, as.numeric(label_vec), method = "spearman"),
           auc_pip    = r$auc,
           jaccard_top = jac(topq, label_vec),
           share_top_matched = mean(label_vec[topq]),
           mean_link_dist_km = mean(edge$dist_km[label_vec]))
  }
  W_comparison_metrics <- bind_rows(
    comp_row("queen_contiguity", edge$is_queen),
    comp_row("knn7",             edge$is_knn),
    comp_row("same_country",     edge$same_country),
    comp_row("same_group",       edge$same_group)
  ) |>
    bind_rows(tibble(
      comparator = "estimated_top10pct", n_links = sum(topq),
      pearson_r = NA_real_, spearman_r = NA_real_, auc_pip = NA_real_,
      jaccard_top = 1, share_top_matched = 1,
      mean_link_dist_km = mean(edge$dist_km[topq]))) |>
    bind_rows(tibble(
      comparator = "all_pairs_baseline", n_links = nrow(edge),
      pearson_r = NA_real_, spearman_r = NA_real_, auc_pip = NA_real_,
      jaccard_top = NA_real_, share_top_matched = NA_real_,
      mean_link_dist_km = mean(edge$dist_km)))
  write_csv(W_comparison_metrics, glue("{SLUG}_W_comparison_metrics.csv"))
  cat("\nEstimated W against exogenous alternatives:\n")
  print(W_comparison_metrics |> mutate(across(where(is.numeric), ~signif(.x, 4))) |>
          as.data.frame(), row.names = FALSE)

  exo_long <- bind_rows(
    tibble(from = rep(regions$nuts1, N_REG), to = rep(regions$nuts1, each = N_REG),
           value = as.vector(W_queen), map = "Queen contiguity"),
    tibble(from = rep(regions$nuts1, N_REG), to = rep(regions$nuts1, each = N_REG),
           value = as.vector(W_knn), map = glue("{KBAR}-nearest neighbours"))
  ) |> mutate(from = factor(from, levels = lev), to = factor(to, levels = lev))
  p14 <- ggplot(exo_long, aes(to, from, fill = value > 0)) +
    geom_raster() + facet_wrap(~map) + coord_fixed() +
    scale_fill_manual(values = c("FALSE" = "#131c33", "TRUE" = ORANGE),
                      guide = "none") +
    scale_y_discrete(limits = rev(lev)) +
    labs(title = "The two neighbourhood maps we would have assumed",
         subtitle = "Same region ordering as the posterior heatmap, so the three matrices are directly comparable",
         x = "neighbour j", y = "region i") +
    theme(axis.text = element_blank(), axis.ticks = element_blank(),
          panel.grid = element_blank())
  save_fig(p14, "15_exogenous_W", w = 11, h = 5.8)
  say("Figure 15 (exogenous W matrices) saved.")

  bins <- edge |>
    mutate(dbin = cut(dist_km, breaks = c(seq(0, 3000, by = 250), Inf))) |>
    group_by(dbin) |>
    summarise(d = mean(dist_km), pip = mean(pip), n = n(), .groups = "drop")
  p15a <- ggplot(bins, aes(d, pip)) +
    geom_hline(yintercept = KBAR / (N_REG - 1), colour = ORANGE,
               linetype = "dashed") +
    geom_line(colour = STEEL, linewidth = 0.8) +
    geom_point(colour = TEAL, size = 1.8) +
    labs(title = "Do estimated links decay with distance?",
         subtitle = "Mean posterior link probability by centroid-distance bin; orange line: the prior probability 7/89",
         x = "centroid distance (km)", y = "mean P(link)")

  rocs <- bind_rows(
    { r <- roc_auc(edge$pip, edge$is_queen)
      tibble(fpr = r$fpr, tpr = r$tpr,
             map = glue("Queen contiguity (AUC {round(r$auc, 3)})")) },
    { r <- roc_auc(edge$pip, edge$is_knn)
      tibble(fpr = r$fpr, tpr = r$tpr,
             map = glue("{KBAR}-nearest neighbours (AUC {round(r$auc, 3)})")) },
    { r <- roc_auc(edge$pip, edge$same_country)
      tibble(fpr = r$fpr, tpr = r$tpr,
             map = glue("Same country (AUC {round(r$auc, 3)})")) }
  )
  p15b <- ggplot(rocs, aes(fpr, tpr, colour = map)) +
    geom_abline(slope = 1, colour = TEXT, linetype = "dotted") +
    geom_line(linewidth = 0.8) + coord_equal() +
    scale_colour_manual(values = c(STEEL, TEAL, ORANGE), name = NULL) +
    labs(title = "Does the posterior recover the assumed maps?",
         subtitle = "Posterior link probability used as a classifier of each exogenous map",
         x = "false-positive rate", y = "true-positive rate") +
    theme(legend.position = "top", legend.direction = "vertical")

  shares <- tibble(
    category = c("Same country", "Same supranational group", "Queen neighbour",
                 glue("{KBAR}-nearest neighbour")),
    estimated = c(mean(edge$same_country[topq]), mean(edge$same_group[topq]),
                  mean(edge$is_queen[topq]), mean(edge$is_knn[topq])),
    baseline  = c(mean(edge$same_country), mean(edge$same_group),
                  mean(edge$is_queen), mean(edge$is_knn))
  ) |> pivot_longer(-category, names_to = "set", values_to = "share")
  p15c <- ggplot(shares, aes(reorder(category, share), share, fill = set)) +
    geom_col(position = position_dodge(0.75), width = 0.7) +
    coord_flip() +
    scale_fill_manual(values = c(estimated = TEAL, baseline = TEXT),
                      labels = c("all region pairs", glue("top {round(100*TOP_GRAPH)}% estimated links")),
                      name = NULL) +
    scale_y_continuous(labels = percent_format(accuracy = 1)) +
    labs(title = "What kind of pairs does the estimated network favour?",
         x = NULL, y = "share of links") +
    theme(legend.position = "top")

  save_fig(p15a / (p15b | p15c), "16_W_vs_geography", w = 11.5, h = 9)
  say("Figure 16 (estimated W versus geography) saved.")

  # Map arcs. geom_curve is not CRS-aware, so the sf object is already in
  # EPSG:3035 and coord_sf() is called WITHOUT crs=, keeping default_crs NULL.
  in_frame <- geo_crosswalk$in_map_frame
  arc <- e_w |>
    mutate(x = CENTROIDS[i, 1], y = CENTROIDS[i, 2],
           xend = CENTROIDS[j, 1], yend = CENTROIDS[j, 2]) |>
    filter(in_frame[i], in_frame[j])
  geo_plot <- geo |> mutate(in_strength = colSums(W_mean))
  p16 <- ggplot() +
    geom_sf(data = geo_plot, aes(fill = in_strength), colour = GRID,
            linewidth = 0.15) +
    geom_curve(data = filter(arc, !is_queen),
               aes(x, y, xend = xend, yend = yend, alpha = value),
               curvature = 0.2, colour = ORANGE, linewidth = 0.3) +
    geom_curve(data = filter(arc, is_queen),
               aes(x, y, xend = xend, yend = yend, alpha = value),
               curvature = 0.2, colour = TEAL, linewidth = 0.3) +
    scale_fill_gradientn(colours = c("#131c33", "#24406b", STEEL),
                         name = "incoming\nweight") +
    scale_alpha(range = c(0.12, 0.85), guide = "none") +
    coord_sf(xlim = c(2.55e6, 6.60e6), ylim = c(1.35e6, 5.45e6),
             expand = FALSE, datum = NA) +
    labs(title = "The estimated neighbourhood map, drawn over the real one",
         subtitle = glue("Strongest {round(100*TOP_GRAPH)}% of estimated links. Teal: the pair also shares a border. Orange: it does not."),
         caption = glue("Canarias (ES7), Azores (PT2) and Madeira (PT3) are estimated but lie outside the frame; their links are in {SLUG}_top_links.csv."),
         x = NULL, y = NULL) +
    theme(axis.text = element_blank(), panel.grid = element_blank())
  save_fig(p16, "17_map_arcs", w = 11, h = 10, dpi = 170)
  say("Figure 17 (map with estimated links) saved.")
  say("Of the top {round(100*TOP_GRAPH)}% estimated links, {round(100*mean(e_w$is_queen), 1)}% also share a border and {round(100*mean(e_w$same_country), 1)}% are within the same country.")
}


# -- 9. Ground truth: can the sampler recover a network we built ourselves? ---
sec("Section 9: recovering a KNOWN spatial weight matrix with sim_dgp()")

sim <- cached(glue("sim_dgp_n{N_SIM}_t{TT_SIM}_seed{SEED_SIM}"), {
  set.seed(SEED_SIM)
  sim_dgp(n = N_SIM, tt = TT_SIM, rho = 0.6, beta3 = c(0.5, -1),
          sigma2 = 0.05, n_neighbor = 4, intercept = TRUE)
})
W_true   <- sim$W
Om_true  <- (W_true > 0) * 1
say("Simulated panel: n = {N_SIM}, T = {TT_SIM}, true rho = {sim$para$rho[[1]]}, true sigma2 = {sim$para$sigma2}, {mean(rowSums(Om_true))} neighbours per unit by construction")
say("Unknown off-diagonal cells: {format(N_SIM^2 - N_SIM, big.mark = ',')} against {format(N_SIM*TT_SIM, big.mark = ',')} observations")

kbar_sim <- 4
prior_sim <- W_priors(
  n = N_SIM,
  W_prior = { m <- matrix(0.5, N_SIM, N_SIM); diag(m) <- 0; m },
  nr_neighbors_prior = bbinompdf(0:(N_SIM - 1), nsize = N_SIM - 1, a = 1,
                                 b = ((N_SIM - 1) - kbar_sim) / kbar_sim))
res_sim <- cached(glue("fit_sim_n{N_SIM}_t{TT_SIM}_i{NITER_SIM}_seed{SEED_SIMFIT}"), {
  set.seed(SEED_SIMFIT)
  quiet_fit(sarw(Y = sim$Y, tt = TT_SIM, Z = sim$Z, niter = NITER_SIM,
                 nretain = as.integer(NITER_SIM / 2), W_prior = prior_sim))
})
log_runtime("sarw_sim", attr(res_sim, "runtime_sec") %||% NA_real_,
            n = N_SIM, tt = TT_SIM, niter = NITER_SIM,
            nretain = as.integer(NITER_SIM / 2))

pip_sim  <- apply(res_sim$postw > 0, c(1, 2), mean)
off      <- row(pip_sim) != col(pip_sim)
score    <- pip_sim[off]; truth <- Om_true[off] == 1
# Same tie-safe Mann-Whitney AUC as Section 8 (see the comment there).
roc_auc2 <- function(score, label) {
  label <- as.logical(label)
  npos <- sum(label); nneg <- sum(!label)
  auc <- if (npos == 0 || nneg == 0) NA_real_ else
    (mean(rank(score)[label]) - (npos + 1) / 2) / nneg
  o <- order(score, decreasing = TRUE); lab <- label[o]
  list(auc = auc, tpr = c(0, cumsum(lab) / npos),
       fpr = c(0, cumsum(!lab) / nneg))
}
rs <- roc_auc2(score, truth)
pred_half <- score >= 0.5
prec <- sum(pred_half & truth) / max(sum(pred_half), 1)
rec  <- sum(pred_half & truth) / sum(truth)
youden_cuts <- sort(unique(score))
yj <- vapply(youden_cuts, function(cut) {
  p <- score >= cut
  sum(p & truth) / sum(truth) - sum(p & !truth) / sum(!truth)
}, numeric(1))
cut_star <- youden_cuts[which.max(yj)]
pred_star <- score >= cut_star

# With intercept = TRUE and only beta3 supplied, sim_dgp returns Z = [1, x] and
# beta3 = (intercept coefficient, slope on x). X is empty.
sim_truth <- c(intercept = sim$para$beta3[1], beta_x = sim$para$beta3[2],
               rho = sim$para$rho[[1]], sigma2 = sim$para$sigma2)
sim_post <- cbind(t(res_sim$postb), rho = as.vector(res_sim$postr),
                  sigma2 = as.vector(res_sim$posts))
colnames(sim_post) <- c("intercept", "beta_x", "rho", "sigma2")

sim_recovery <- bind_rows(
  tibble(metric = "auc",              value = rs$auc,  truth = NA_real_),
  tibble(metric = "precision_at_0.5", value = prec,    truth = NA_real_),
  tibble(metric = "recall_at_0.5",    value = rec,     truth = NA_real_),
  tibble(metric = "accuracy_at_0.5",  value = mean(pred_half == truth), truth = NA_real_),
  tibble(metric = "youden_cut",       value = cut_star, truth = NA_real_),
  tibble(metric = "recall_at_youden", value = sum(pred_star & truth)/sum(truth), truth = NA_real_),
  tibble(metric = "precision_at_youden", value = sum(pred_star & truth)/max(sum(pred_star),1), truth = NA_real_),
  tibble(metric = "hamming_at_0.5",   value = sum(pred_half != truth), truth = NA_real_),
  tibble(metric = "mean_degree",      value = mean(rowMeans(apply(res_sim$postw > 0, 3, function(m) rowSums(matrix(m, N_SIM, N_SIM))))),
         truth = mean(rowSums(Om_true))),
  map_dfr(names(sim_truth), function(p) {
    v <- sim_post[, p]
    tibble(metric = p, value = mean(v), truth = unname(sim_truth[p]),
           q025 = quantile(v, 0.025), q975 = quantile(v, 0.975),
           covered = unname(sim_truth[p]) >= quantile(v, 0.025) &
                     unname(sim_truth[p]) <= quantile(v, 0.975))
  })
)
write_csv(sim_recovery, glue("{SLUG}_sim_recovery.csv"))
cat("\nGround-truth recovery scorecard:\n")
print(sim_recovery |> mutate(across(where(is.numeric), ~signif(.x, 4))) |>
        as.data.frame(), row.names = FALSE)
say("AUC = {round(rs$auc, 3)} | recall at 0.5 = {round(rec, 3)} | precision at 0.5 = {round(prec, 3)}")

hm <- function(M, ttl) {
  nn <- nrow(M)
  expand_grid(i = seq_len(nn), j = seq_len(nn)) |>
    mutate(v = M[cbind(i, j)]) |>
    ggplot(aes(j, i, fill = v)) + geom_raster() +
    scale_fill_gradientn(colours = c("#131c33", STEEL, ORANGE), name = NULL) +
    scale_y_reverse() + coord_fixed() + labs(title = ttl, x = NULL, y = NULL) +
    theme(axis.text = element_blank(), axis.ticks = element_blank(),
          panel.grid = element_blank(), legend.position = "none")
}
p17a <- hm(Om_true, "The true adjacency matrix")
p17b <- hm(pip_sim, "Posterior link probabilities")
p17c <- tibble(pip = score, link = ifelse(truth, "true link", "true non-link")) |>
  ggplot(aes(pip, fill = link)) +
  geom_histogram(bins = 30, position = "identity", alpha = 0.75) +
  scale_fill_manual(values = c("true link" = ORANGE, "true non-link" = STEEL),
                    name = NULL) +
  scale_y_continuous(transform = "log1p", breaks = c(0, 10, 100, 1000)) +
  labs(title = glue("Separation (AUC = {round(rs$auc, 3)})"),
       x = "posterior link probability", y = "cells (log1p scale)") +
  theme(legend.position = "top")
p17d <- as_tibble(sim_post) |>
  pivot_longer(everything(), names_to = "parameter", values_to = "value") |>
  ggplot(aes(value)) +
  geom_density(fill = STEEL, colour = STEEL, alpha = 0.45) +
  geom_vline(data = tibble(parameter = names(sim_truth),
                           truth = unname(sim_truth)),
             aes(xintercept = truth), colour = ORANGE, linetype = "dashed") +
  facet_wrap(~parameter, scales = "free", nrow = 1) +
  labs(title = "Parameter recovery", subtitle = "Orange dashed line: the true value",
       x = NULL, y = NULL) +
  theme(axis.text.y = element_blank())
save_fig(((p17a | p17b | p17c) / p17d) +
           plot_annotation(
             title = glue("Recovering a network we built ourselves (n = {N_SIM}, T = {TT_SIM}, {NITER_SIM} iterations)"),
             theme = theme(plot.title = element_text(colour = WHITE, face = "bold"))),
         "18_sim_recovery", w = 12.5, h = 8)
say("Figure 18 (ground-truth recovery) saved.")


# -- 10. The rest of the family: the paper's Table 1 taxonomy -----------------
sec("Section 10: model taxonomy, estimated W and exogenous W")

## 10a. Estimated-W half, on a small simulated panel (cost is superlinear in n)
sim_tax <- cached(glue("sim_tax_n{N_TAX}_t{TT_TAX}"), {
  set.seed(SEED_TAX)
  sim_dgp(n = N_TAX, tt = TT_TAX, rho = 0.5, beta1 = 1, beta2 = -0.5,
          beta3 = c(0.5, 1), sigma2 = 0.05, n_neighbor = 3, intercept = TRUE)
})
Yt <- sim_tax$Y; Zt <- sim_tax$Z; Xt <- sim_tax$X
# X and Z must be DISJOINT. estimateW builds U = [X, WX, Z], so a variable
# present in both appears twice and the design is rank deficient -- sdm() does
# not error on that, it just returns collinear draws.
if (ncol(Xt) == 0) { Xt <- Zt[, 2, drop = FALSE]; Zt <- Zt[, 1, drop = FALSE] }
prior_tax <- W_priors(
  n = N_TAX,
  W_prior = { m <- matrix(0.5, N_TAX, N_TAX); diag(m) <- 0; m },
  nr_neighbors_prior = bbinompdf(0:(N_TAX - 1), nsize = N_TAX - 1, a = 1,
                                 b = ((N_TAX - 1) - 3) / 3))

tax_estimated <- list(
  SAR  = function() sarw(Y = Yt, tt = TT_TAX, Z = Zt, niter = NITER_TAX,
                         nretain = NITER_TAX / 2, W_prior = prior_tax),
  SDM  = function() sdmw(Y = Yt, tt = TT_TAX, X = Xt, Z = Zt, niter = NITER_TAX,
                         nretain = NITER_TAX / 2, W_prior = prior_tax),
  SEM  = function() semw(Y = Yt, tt = TT_TAX, Z = Zt, niter = NITER_TAX,
                         nretain = NITER_TAX / 2, W_prior = prior_tax),
  SDEM = function() sdemw(Y = Yt, tt = TT_TAX, X = Xt, Z = Zt, niter = NITER_TAX,
                          nretain = NITER_TAX / 2, W_prior = prior_tax),
  SLX  = function() slxw(Y = Yt, tt = TT_TAX, X = Xt, Z = Zt, niter = NITER_TAX,
                         nretain = NITER_TAX / 2, W_prior = prior_tax)
)
tax_rows <- list()
for (nm in names(tax_estimated)) {
  fit <- cached(glue("tax_est_{nm}_n{N_TAX}_t{TT_TAX}_i{NITER_TAX}"), {
    set.seed(SEED_TAX + which(names(tax_estimated) == nm))
    quiet_fit(tax_estimated[[nm]]())
  })
  # slxw has no rho at all; semw/sdemw/slxw report no impact decomposition.
  has_rho <- "postr" %in% names(fit)
  deg <- mean(rowMeans(apply(fit$postw > 0, 3,
                             function(m) rowSums(matrix(m, N_TAX, N_TAX)))))
  tax_rows[[length(tax_rows) + 1]] <- tibble(
    half = "estimated_W", model = nm, fn = paste0(tolower(nm), "w()"),
    dataset = glue("simulated n={N_TAX}, T={TT_TAX}"), W_source = "estimated",
    n = N_TAX, tt = TT_TAX, niter = NITER_TAX,
    rho_mean = if (has_rho) mean(fit$postr) else NA_real_,
    rho_sd   = if (has_rho) sd(as.vector(fit$postr)) else NA_real_,
    sigma2_mean = mean(fit$posts),
    n_beta = nrow(fit$postb), mean_degree = deg,
    has_impacts = "post.direct" %in% names(fit),
    runtime_sec = round(attr(fit, "runtime_sec") %||% NA_real_, 1))
  say("  {nm} (estimated W): rho = {ifelse(has_rho, round(mean(fit$postr), 3), 'n/a')} | mean degree {round(deg, 2)} | {nrow(fit$postb)} slope parameters")
}

## 10b. Exogenous-W half, on the real panel. W is not sampled here, so these
## fits cost seconds rather than minutes and can afford a proper chain.
if (HAS_GEO) {
  # For the Durbin/SLX families the spatially lagged regressors go in X and only
  # the intercept stays in Z, so that U = [X, WX, Z] is full rank.
  X_dur <- Z[, 2:4, drop = FALSE]
  Z_dur <- Z[, 1, drop = FALSE]
  exo_specs <- list(
    list(nm = "SAR",  W = "queen", f = function(W) sar(Y = Y, tt = TT, W = W, Z = Z, niter = NITER_EXO, nretain = NITER_EXO/2)),
    list(nm = "SAR",  W = "knn7",  f = function(W) sar(Y = Y, tt = TT, W = W, Z = Z, niter = NITER_EXO, nretain = NITER_EXO/2)),
    list(nm = "SDM",  W = "queen", f = function(W) sdm(Y = Y, tt = TT, W = W, X = X_dur, Z = Z_dur, niter = NITER_EXO, nretain = NITER_EXO/2)),
    list(nm = "SEM",  W = "queen", f = function(W) sem(Y = Y, tt = TT, W = W, Z = Z, niter = NITER_EXO, nretain = NITER_EXO/2)),
    list(nm = "SDEM", W = "queen", f = function(W) sdem(Y = Y, tt = TT, W = W, X = X_dur, Z = Z_dur, niter = NITER_EXO, nretain = NITER_EXO/2)),
    list(nm = "SLX",  W = "queen", f = function(W) slx(Y = Y, tt = TT, W = W, X = X_dur, Z = Z_dur, niter = NITER_EXO, nretain = NITER_EXO/2))
  )
  exo_fits <- list()
  for (k in seq_along(exo_specs)) {
    sp <- exo_specs[[k]]
    Wm <- if (sp$W == "queen") W_queen else W_knn
    fit <- cached(glue("tax_exo_{sp$nm}_{sp$W}_i{NITER_EXO}"), {
      set.seed(5100L + k)
      quiet_fit(sp$f(Wm))
    })
    exo_fits[[glue("{sp$nm}_{sp$W}")]] <- fit
    has_rho <- "postr" %in% names(fit)
    tax_rows[[length(tax_rows) + 1]] <- tibble(
      half = "exogenous_W", model = sp$nm, fn = paste0(tolower(sp$nm), "()"),
      dataset = "nuts1growth n=90, T=19", W_source = sp$W,
      n = N_REG, tt = TT, niter = NITER_EXO,
      rho_mean = if (has_rho) mean(fit$postr) else NA_real_,
      rho_sd   = if (has_rho) sd(as.vector(fit$postr)) else NA_real_,
      sigma2_mean = mean(fit$posts),
      n_beta = nrow(fit$postb),
      mean_degree = if (sp$W == "queen") mean(rowSums(W_queen > 0)) else KBAR,
      has_impacts = "post.direct" %in% names(fit),
      runtime_sec = round(attr(fit, "runtime_sec") %||% NA_real_, 1))
    say("  {sp$nm} (exogenous {sp$W} W): rho = {ifelse(has_rho, round(mean(fit$postr), 3), 'n/a')} | {round(attr(fit, 'runtime_sec') %||% NA_real_, 1)}s")
  }
}
model_taxonomy <- bind_rows(tax_rows)
write_csv(model_taxonomy, glue("{SLUG}_model_taxonomy.csv"))
say("Wrote {SLUG}_model_taxonomy.csv ({nrow(model_taxonomy)} rows)")
cat("\nModel taxonomy:\n")
print(model_taxonomy |> mutate(across(where(is.numeric), ~signif(.x, 4))) |>
        as.data.frame(), row.names = FALSE)

## 10c. The payoff comparison: one model, three neighbourhood maps
impact_row <- function(fit, map_label, var_index = 2L, var_label = "log initial GVA per worker") {
  tibble(map = map_label, variable = var_label,
         direct   = mean(fit$post.direct[var_index, ]),
         indirect = mean(fit$post.indirect[var_index, ]),
         total    = mean(fit$post.total[var_index, ]),
         rho      = if ("postr" %in% names(fit)) mean(fit$postr) else NA_real_)
}
three_maps <- NULL
if (HAS_GEO) {
  three_maps <- bind_rows(
    impact_row(res_sarw, "Estimated W"),
    impact_row(exo_fits[["SAR_queen"]], "Queen contiguity W"),
    impact_row(exo_fits[["SAR_knn7"]], glue("{KBAR}-nearest-neighbour W")),
    impact_row(res_sarw, "Estimated W", 4L, "share high education"),
    impact_row(exo_fits[["SAR_queen"]], "Queen contiguity W", 4L, "share high education"),
    impact_row(exo_fits[["SAR_knn7"]], glue("{KBAR}-nearest-neighbour W"), 4L, "share high education")
  ) |> mutate(ratio_ind_dir = indirect / direct)
  cat("\nOne model, three neighbourhood maps:\n")
  print(three_maps |> mutate(across(where(is.numeric), ~signif(.x, 4))) |>
          as.data.frame(), row.names = FALSE)

  p18 <- three_maps |>
    select(map, variable, Direct = direct, Indirect = indirect, Total = total) |>
    pivot_longer(c(Direct, Indirect, Total), names_to = "impact",
                 values_to = "value") |>
    mutate(impact = factor(impact, levels = c("Direct", "Indirect", "Total"))) |>
    ggplot(aes(impact, value, fill = map)) +
    geom_col(position = position_dodge(0.8), width = 0.72) +
    geom_hline(yintercept = 0, colour = TEXT, linewidth = 0.3) +
    facet_wrap(~variable, scales = "free_y") +
    scale_fill_manual(values = c(TEAL, STEEL, ORANGE), name = NULL) +
    labs(title = "The same SAR model gives different answers under different maps",
         subtitle = glue("Posterior mean impacts. Estimated W: {NITER_PAPER}/{NRETAIN_PAPER} draws. Exogenous W: {NITER_EXO}/{NITER_EXO/2} draws."),
         x = NULL, y = "impact on annual growth") +
    theme(legend.position = "top")
  save_fig(p18, "19_three_maps_impacts", w = 11, h = 6)
  say("Figure 19 (three maps, one model) saved.")
} else {
  say("[SKIP] Figure 19 requires the geometry-based benchmark matrices.")
}


# -- 11. Summary, runtime ledger, cleanup ------------------------------------
sec("Section 11: summary")

runtime_tbl <- bind_rows(RUNTIME_LOG) |>
  mutate(r_version = R.version.string,
         estimateW_version = as.character(packageVersion("estimateW")),
         blas = sessionInfo()$BLAS %||% NA_character_,
         rngkind = paste(RNGkind(), collapse = "/"))
write_csv(runtime_tbl, glue("{SLUG}_runtime.csv"))
say("Wrote {SLUG}_runtime.csv ({nrow(runtime_tbl)} rows)")

n_exact <- sum(table3_audit$verdict == "exact")
n_noise <- sum(table3_audit$verdict == "within_mc_noise")
n_diff  <- sum(table3_audit$verdict == "differs")

cat("\n", strrep("=", 78), "\n", sep = "")
say("HEADLINE")
say("  rho = {round(rho_ours, 5)} (posterior SD {round(posterior_params$sd[posterior_params$parameter == 'rho'], 5)}); paper reports 0.71322 (0.01574)")
say("  Direct impact of initial productivity  = {round(table3_audit$our_mean[table3_audit$quantity == 'av. direct log initial GVA per worker'], 5)}")
say("  Indirect impact of initial productivity = {round(table3_audit$our_mean[table3_audit$quantity == 'av. indirect log initial GVA per worker'], 5)}")
say("  Spillover-to-direct ratio = {round(table3_audit$our_mean[table3_audit$quantity == 'av. indirect log initial GVA per worker'] / table3_audit$our_mean[table3_audit$quantity == 'av. direct log initial GVA per worker'], 3)}x")
say("  Estimated mean degree = {round(mean(deg_mean), 2)} against the prior anchor k-bar = {KBAR}")
say("  Link mass inside the same country = {round(100*share_same_country, 1)}% (random benchmark {round(100*rand_same_country, 1)}%)")
say("REPRODUCTION AUDIT: {n_exact} exact, {n_noise} within Monte Carlo noise, {n_diff} differing (of {nrow(table3_audit)} quantities)")
cat("\n[CAVEAT] The headline chain retains ", NRETAIN_PAPER, " draws. Posterior means are\n",
    "stable at that budget, but posterior standard deviations, credible intervals\n",
    "and individual link rankings are not: with ", NRETAIN_PAPER, " retained draws a link\n",
    "probability is quantized to ", round(1/NRETAIN_PAPER, 2), ", so a link seen in 3 draws is not\n",
    "distinguishable from one seen in 1. The robustness chains in Section 5\n",
    "quantify the gap. estimateW is designed for n up to roughly 300.\n", sep = "")
cat(strrep("=", 78), "\n", sep = "")

if (file.exists("Rplots.pdf")) file.remove("Rplots.pdf")
n_png <- length(list.files(pattern = glue("^{SLUG}_.*\\.png$")))
n_csv <- length(list.files(pattern = glue("^{SLUG}_.*\\.csv$")))
say("\nArtifacts: {n_png} PNG figures, {n_csv} CSV tables, {length(list.files(CACHE_DIR))} cache objects")

cat("\n=== Script completed successfully ===\n")
