# ══════════════════════════════════════════════════════════════════
# Basic Synthetic Control: The Basque Country Case Study
#
# Reproduces Abadie & Gardeazabal (2003): estimates the economic
# cost of conflict in the Basque Country (1970-1997) by building a
# synthetic Basque from a weighted average of 16 other Spanish
# regions whose pre-1970 economy looks like Basque.
#
# Estimand: ATT (Average Treatment effect on the Treated) — the
# GDP-per-capita gap between actual and synthetic Basque after 1970.
#
# Usage:  Rscript analysis.R
# Output: r_basic_synthetic_control_*.png  (4 figures)
#         *.csv                            (5 tables)
#         execution_log.txt                (when piped via tee)
#
# References:
#   - Abadie & Gardeazabal (2003) AER 93(1)
#   - Abadie, Diamond & Hainmueller (2011) JSS 42(13) — Synth package
# ══════════════════════════════════════════════════════════════════


# ── 0. Setup ─────────────────────────────────────────────────────

required_packages <- c("Synth", "tidyverse", "kernlab", "optimx", "readr")
missing <- required_packages[
  !sapply(required_packages, requireNamespace, quietly = TRUE)
]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}

suppressPackageStartupMessages({
  library(Synth)
  library(tidyverse)
})
set.seed(42)

# Site color palette
STEEL_BLUE  <- "#6a9bcc"
WARM_ORANGE <- "#d97757"
NEAR_BLACK  <- "#141413"
TEAL        <- "#00d4c8"
LIGHT_GREY  <- "gray80"

# Shared ggplot theme (light background, near-black text, faint grid)
theme_site <- function() {
  theme_minimal(base_size = 13) %+replace%
    theme(
      plot.title       = element_text(face = "bold", color = NEAR_BLACK,
                                      size = 14, hjust = 0,
                                      margin = margin(b = 4)),
      plot.subtitle    = element_text(color = "gray40", size = 11,
                                      hjust = 0, margin = margin(b = 10)),
      axis.title       = element_text(color = NEAR_BLACK),
      axis.text        = element_text(color = "gray30"),
      panel.grid.major = element_line(color = "gray90", linewidth = 0.4),
      panel.grid.minor = element_blank(),
      legend.position  = "bottom",
      legend.title     = element_blank(),
      plot.background  = element_rect(fill = "white", color = NA),
      panel.background = element_rect(fill = "white", color = NA)
    )
}


# ── 1. Load and inspect Basque data ──────────────────────────────

cat("\n═══════════════════════════════════════════════════════════\n")
cat("1. LOAD AND INSPECT BASQUE DATA\n")
cat("═══════════════════════════════════════════════════════════\n")

# The Synth package ships with the Basque panel: 18 regional units
# (region 1 = Spain national, regions 2-18 = autonomous communities,
# region 17 = Basque Country) observed annually from 1955 to 1997.
data("basque")
basque_tbl <- as_tibble(basque)

cat("Panel shape:", nrow(basque_tbl), "rows ×", ncol(basque_tbl), "cols\n")
cat("Years:      ", min(basque_tbl$year), "to", max(basque_tbl$year), "\n")
cat("Regions:    ", n_distinct(basque_tbl$regionno),
    "(region 1 = Spain national, dropped from analysis)\n")
cat("Treatment:  region 17 (Basque Country) — terrorism onset 1970\n\n")

# Quick glance at the time series for the treated unit
basque_only <- basque_tbl %>% filter(regionno == 17)
cat("First 3 / last 3 rows for the Basque Country:\n")
print(head(basque_only %>% select(year, regionname, gdpcap), 3))
print(tail(basque_only %>% select(year, regionname, gdpcap), 3))
cat("\n")

# Export the source panel for downstream reuse
write_csv(basque_tbl, "source_data.csv")
cat("Saved: source_data.csv (", nrow(basque_tbl), " rows)\n", sep = "")


# ── 2. Helper: prepare_basque() ──────────────────────────────────

# Encapsulates the dataprep() call plus the school.high consolidation
# and percentage rescaling used by Abadie & Gardeazabal (2003). The
# original Colab script repeated this block three times; here we
# factor it once and parameterize the treated unit and donor pool.
prepare_basque <- function(treated_id, control_ids) {

  # dataprep() packages the four matrices Synth needs:
  #   X1: predictor values for the treated unit       (13 × 1)
  #   X0: predictor values for each control unit      (13 × N_controls)
  #   Z1: pre-treatment outcomes for the treated unit (10 × 1)
  #   Z0: pre-treatment outcomes for each control     (10 × N_controls)
  dp <- dataprep(
    foo                   = as.data.frame(basque),
    predictors            = c("school.illit", "school.prim", "school.med",
                              "school.high",  "school.post.high", "invest"),
    predictors.op         = "mean",
    time.predictors.prior = 1964:1969,
    special.predictors = list(
      list("gdpcap",                1960:1969,           "mean"),
      list("sec.agriculture",       seq(1961, 1969, 2),  "mean"),
      list("sec.energy",            seq(1961, 1969, 2),  "mean"),
      list("sec.industry",          seq(1961, 1969, 2),  "mean"),
      list("sec.construction",      seq(1961, 1969, 2),  "mean"),
      list("sec.services.venta",    seq(1961, 1969, 2),  "mean"),
      list("sec.services.nonventa", seq(1961, 1969, 2),  "mean"),
      list("popdens",               1969,                "mean")
    ),
    dependent             = "gdpcap",
    unit.variable         = "regionno",
    unit.names.variable   = "regionname",
    time.variable         = "year",
    treatment.identifier  = treated_id,
    controls.identifier   = control_ids,
    time.optimize.ssr     = 1960:1969,
    time.plot             = 1955:1997
  )

  # Abadie & Gardeazabal collapse "post.high" into "high" (so the
  # five education levels become four) and convert the four education
  # variables into within-region percentage shares.
  dp$X1["school.high", ] <- dp$X1["school.high", ] +
                            dp$X1["school.post.high", ]
  dp$X1 <- as.matrix(dp$X1[rownames(dp$X1) != "school.post.high", ])

  dp$X0["school.high", ] <- dp$X0["school.high", ] +
                            dp$X0["school.post.high", ]
  dp$X0 <- dp$X0[rownames(dp$X0) != "school.post.high", ]

  edu_lo <- which(rownames(dp$X0) == "school.illit")
  edu_hi <- which(rownames(dp$X0) == "school.high")

  dp$X1[edu_lo:edu_hi, ] <- 100 * dp$X1[edu_lo:edu_hi, ] /
                            sum(dp$X1[edu_lo:edu_hi, ])
  dp$X0[edu_lo:edu_hi, ] <- 100 * scale(
    dp$X0[edu_lo:edu_hi, ],
    center = FALSE,
    scale  = colSums(dp$X0[edu_lo:edu_hi, ])
  )

  dp
}

# Helper: run synth() but quietly (the optimizer prints a lot)
run_synth_quiet <- function(dp) {
  out <- NULL
  invisible(capture.output(
    out <- synth(data.prep.obj = dp, optimxmethod = "BFGS", verbose = FALSE)
  ))
  out
}


# ── 3. Build the synthetic Basque ────────────────────────────────

cat("\n═══════════════════════════════════════════════════════════\n")
cat("3. BUILD THE SYNTHETIC BASQUE\n")
cat("═══════════════════════════════════════════════════════════\n")

# Estimand: ATT (Average Treatment effect on the Treated).
#   We compare actual Basque GDP per capita (1970-1997) against the
#   GDP per capita we would have predicted *had terrorism never
#   started*, proxied by a weighted recipe of other Spanish regions
#   whose pre-1970 economy looked like Basque.
#
# Key terms:
#   • Donor pool — the set of untreated regions that get mixed
#     together to build the counterfactual.
#   • W weights — non-negative weights summing to 1; each region's
#     share in the synthetic Basque "recipe".
#   • V matrix — diagonal "importance dials" on each predictor;
#     chosen so the synthetic unit best matches Basque's pre-1970
#     outcomes.
#   • MSPE — Mean Squared Prediction Error (mean squared gap between
#     actual and synthetic outcomes).

cat("Estimand:    ATT (Average Treatment effect on the Treated)\n")
cat("Donor pool:  16 Spanish autonomous communities (excludes Basque\n")
cat("             and the national region 1)\n\n")

basque_dp    <- prepare_basque(treated_id = 17, control_ids = c(2:16, 18))

# Intent: solve for W weights that minimize pre-1970 outcome distance,
# weighted by V (the diagonal importance dials on each predictor).
basque_synth <- run_synth_quiet(basque_dp)
# Result: solution.w = donor weights; solution.v = predictor weights.

cat("Optimization complete.\n")
cat("  W weights sum to:        ",
    round(sum(basque_synth$solution.w), 4), "\n")
cat("  Active donors (w > 0.01):",
    sum(basque_synth$solution.w > 0.01), "\n")
cat("  Pre-treatment loss V:    ",
    format(basque_synth$loss.v, scientific = FALSE, digits = 5), "\n")
cat("  Pre-treatment loss W:    ",
    format(basque_synth$loss.w, scientific = FALSE, digits = 5), "\n")


# ── 4. Inspect weights and predictor balance ─────────────────────

cat("\n═══════════════════════════════════════════════════════════\n")
cat("4. WEIGHTS AND PREDICTOR BALANCE\n")
cat("═══════════════════════════════════════════════════════════\n")

basque_tabs <- synth.tab(dataprep.res = basque_dp, synth.res = basque_synth)

# Predictor balance: how close did the synthetic match on each covariate?
pb <- basque_tabs$tab.pred
predictor_balance <- tibble(
  predictor   = rownames(pb),
  treated     = as.numeric(pb[, 1]),
  synthetic   = as.numeric(pb[, 2]),
  sample_mean = as.numeric(pb[, 3])
)
write_csv(predictor_balance, "predictor_balance.csv")
cat("Saved: predictor_balance.csv (",
    nrow(predictor_balance), " predictors)\n", sep = "")
cat("\nPredictor balance (treated vs synthetic vs sample mean):\n")
print(predictor_balance, n = Inf)

# Donor weights: each control region's share in the synthetic recipe.
donor_weights <- tibble(
  region = as.character(basque_tabs$tab.w$unit.names),
  weight = as.numeric(as.character(basque_tabs$tab.w$w.weights))
) %>% arrange(desc(weight))
write_csv(donor_weights, "donor_weights.csv")
cat("\nSaved: donor_weights.csv (", nrow(donor_weights), " donors)\n",
    sep = "")
cat("Top 5 donor regions (rest receive ~0 weight):\n")
print(head(donor_weights, 5))


# ── 5. Visualize GDP path and gap ────────────────────────────────

cat("\n═══════════════════════════════════════════════════════════\n")
cat("5. VISUALIZE GDP PATH AND GAP\n")
cat("═══════════════════════════════════════════════════════════\n")

# Build the long-format trajectory: actual Basque, synthetic Basque, gap.
year_seq         <- 1955:1997
basque_actual    <- as.numeric(basque_dp$Y1plot)
basque_synthetic <- as.numeric(basque_dp$Y0plot %*% basque_synth$solution.w)
gap_series <- tibble(
  year          = year_seq,
  actual_gdp    = basque_actual,
  synthetic_gdp = basque_synthetic,
  gap           = basque_actual - basque_synthetic
)
write_csv(gap_series, "gap_series.csv")
cat("Saved: gap_series.csv (", nrow(gap_series), " years)\n", sep = "")

# ── Figure 1: raw GDP trajectories of all 17 regions ─────────────
all_regions <- basque_tbl %>%
  filter(regionno != 1) %>%
  mutate(is_basque = regionno == 17)

p1 <- ggplot(all_regions, aes(year, gdpcap, group = regionname,
                              color = is_basque, alpha = is_basque,
                              linewidth = is_basque)) +
  geom_line() +
  geom_vline(xintercept = 1970, linetype = "dashed",
             color = NEAR_BLACK, linewidth = 0.5) +
  annotate("text", x = 1970.5, y = 2.5,
           label = "Terrorism onset (1970)",
           hjust = 0, size = 3.4, color = NEAR_BLACK) +
  scale_color_manual(values = c(`TRUE`  = WARM_ORANGE,
                                `FALSE` = LIGHT_GREY),
                     labels = c(`TRUE`  = "Basque Country",
                                `FALSE` = "Other regions")) +
  scale_alpha_manual(values = c(`TRUE` = 1, `FALSE` = 0.7),
                     guide = "none") +
  scale_linewidth_manual(values = c(`TRUE` = 1.1, `FALSE` = 0.4),
                         guide = "none") +
  labs(title    = "GDP per capita across Spanish regions, 1955–1997",
       subtitle = "Basque Country (orange) vs the 16 other autonomous communities",
       x = "Year",
       y = "Real GDP per capita (1986 thousands USD)") +
  theme_site()

ggsave("r_basic_synthetic_control_01_raw_gdp_paths.png", p1,
       width = 8, height = 6, dpi = 300, bg = "white")
cat("Saved: r_basic_synthetic_control_01_raw_gdp_paths.png\n")

# ── Figure 2: actual vs synthetic Basque ─────────────────────────
path_long <- gap_series %>%
  pivot_longer(c(actual_gdp, synthetic_gdp),
               names_to = "series", values_to = "gdp") %>%
  mutate(series = recode(series,
                         actual_gdp    = "Actual Basque",
                         synthetic_gdp = "Synthetic Basque"))

p2 <- ggplot(path_long, aes(year, gdp,
                            color = series, linetype = series)) +
  annotate("rect", xmin = 1955, xmax = 1969.5,
           ymin = -Inf, ymax = Inf,
           fill = LIGHT_GREY, alpha = 0.25) +
  geom_line(linewidth = 1.1) +
  geom_vline(xintercept = 1970, linetype = "dashed",
             color = NEAR_BLACK, linewidth = 0.5) +
  annotate("text", x = 1970.5, y = 3,
           label = "Terrorism onset (1970)",
           hjust = 0, size = 3.4, color = NEAR_BLACK) +
  scale_color_manual(values = c(`Actual Basque`    = WARM_ORANGE,
                                `Synthetic Basque` = STEEL_BLUE)) +
  scale_linetype_manual(values = c(`Actual Basque`    = "solid",
                                   `Synthetic Basque` = "dashed")) +
  labs(title    = "Actual Basque vs Synthetic Basque",
       subtitle = "The synthetic Basque is a weighted recipe of other Spanish regions",
       x = "Year",
       y = "Real GDP per capita (1986 thousands USD)") +
  theme_site()

ggsave("r_basic_synthetic_control_02_basque_vs_synthetic.png", p2,
       width = 8, height = 6, dpi = 300, bg = "white")
cat("Saved: r_basic_synthetic_control_02_basque_vs_synthetic.png\n")

# ── Figure 3: gap (actual minus synthetic) ───────────────────────
gap_min_year <- gap_series$year[which.min(gap_series$gap)]
gap_min_val  <- min(gap_series$gap)

p3 <- ggplot(gap_series, aes(year, gap)) +
  geom_hline(yintercept = 0, linetype = "solid",
             color = NEAR_BLACK, linewidth = 0.4) +
  geom_vline(xintercept = 1970, linetype = "dashed",
             color = NEAR_BLACK, linewidth = 0.5) +
  geom_line(color = WARM_ORANGE, linewidth = 1.1) +
  annotate("point", x = gap_min_year, y = gap_min_val,
           color = NEAR_BLACK, size = 2) +
  annotate("text",  x = gap_min_year, y = gap_min_val - 0.1,
           label = sprintf("Largest gap: %.2f (%d)",
                           gap_min_val, gap_min_year),
           vjust = 1, hjust = 0.5, size = 3.4, color = NEAR_BLACK) +
  annotate("text", x = 1970.5, y = 0.85,
           label = "Terrorism onset (1970)",
           hjust = 0, size = 3.4, color = NEAR_BLACK) +
  scale_y_continuous(limits = c(-1.5, 1.0)) +
  labs(title    = "Estimated GDP gap: Basque − Synthetic Basque",
       subtitle = "Negative values indicate Basque GDP shortfall attributable to conflict",
       x = "Year",
       y = "Gap in real GDP per capita (1986 thousands USD)") +
  theme_site()

ggsave("r_basic_synthetic_control_03_gap_plot.png", p3,
       width = 8, height = 6, dpi = 300, bg = "white")
cat("Saved: r_basic_synthetic_control_03_gap_plot.png\n")


# ── 6. Catalonia placebo (region 10) ─────────────────────────────

cat("\n═══════════════════════════════════════════════════════════\n")
cat("6. CATALONIA PLACEBO (region 10)\n")
cat("═══════════════════════════════════════════════════════════\n")

# Falsification check: re-run the analysis pretending Catalonia (which
# experienced no terrorism shock) was the treated unit. If the method
# is sound, the post-1970 gap should be small and the post/pre MSPE
# ratio close to 1.

cataluna_dp     <- prepare_basque(treated_id  = 10,
                                  control_ids = setdiff(2:18, 10))
cataluna_synth  <- run_synth_quiet(cataluna_dp)

cataluna_actual     <- as.numeric(cataluna_dp$Y1plot)
cataluna_synth_path <- as.numeric(
  cataluna_dp$Y0plot %*% cataluna_synth$solution.w
)
cataluna_gap <- cataluna_actual - cataluna_synth_path

pre_idx  <- year_seq <= 1969
post_idx <- year_seq >= 1970
cataluna_pre_mspe  <- mean(cataluna_gap[pre_idx]^2)
cataluna_post_mspe <- mean(cataluna_gap[post_idx]^2)

cat("Catalonia placebo MSPE:\n")
cat("  Pre-1970:   ", format(cataluna_pre_mspe,  digits = 4), "\n")
cat("  Post-1970:  ", format(cataluna_post_mspe, digits = 4), "\n")
cat("  Ratio:      ",
    format(cataluna_post_mspe / cataluna_pre_mspe, digits = 3),
    "  (small ratio = no detectable effect, as expected)\n")


# ── 7. In-space placebo across all 17 regions ────────────────────

cat("\n═══════════════════════════════════════════════════════════\n")
cat("7. IN-SPACE PLACEBO ACROSS ALL 17 REGIONS\n")
cat("═══════════════════════════════════════════════════════════\n")

# Pretend each of the 17 regions was treated. Then compare Basque's
# post/pre MSPE ratio against the placebo distribution. If Basque
# ranks at the top, it is unlikely the gap arose by chance — this is
# the inferential workhorse of synthetic control ("how loud is the
# Basque signal vs the placebo chorus?").

placebo_results <- list()
gap_traces  <- matrix(NA_real_, nrow = length(year_seq), ncol = 17)
trace_names <- character(17)
trace_idx   <- 1L

for (treated in 2:18) {
  controls   <- setdiff(2:18, treated)
  dp_iter    <- prepare_basque(treated_id = treated, control_ids = controls)
  synth_iter <- run_synth_quiet(dp_iter)

  iter_gap <- as.numeric(dp_iter$Y1plot) -
              as.numeric(dp_iter$Y0plot %*% synth_iter$solution.w)

  region_name <- unique(
    basque_tbl$regionname[basque_tbl$regionno == treated]
  )
  pre_mspe  <- mean(iter_gap[pre_idx]^2)
  post_mspe <- mean(iter_gap[post_idx]^2)

  placebo_results[[length(placebo_results) + 1L]] <- tibble(
    regionno  = treated,
    region    = region_name,
    pre_mspe  = pre_mspe,
    post_mspe = post_mspe,
    ratio     = post_mspe / pre_mspe
  )
  gap_traces[, trace_idx] <- iter_gap
  trace_names[trace_idx]  <- region_name
  trace_idx <- trace_idx + 1L

  cat(sprintf("  region %2d (%-25s): pre=%7.4f post=%7.4f ratio=%7.2f\n",
              treated, region_name, pre_mspe, post_mspe,
              post_mspe / pre_mspe))
}

placebo_tbl <- bind_rows(placebo_results) %>%
  arrange(desc(ratio)) %>%
  mutate(rank = row_number())

# Trimmed comparison: regions with very small pre-MSPE divide by tiny
# numbers and produce huge ratios (Andalucia, Asturias, Navarra in this
# sample). Following Abadie & Gardeazabal's exposition, we restrict the
# placebo distribution to regions whose pre-treatment fit is comparable
# to Basque's — pre-MSPE within a factor of 5.
basque_pre_mspe <- placebo_tbl %>%
  filter(regionno == 17) %>%
  pull(pre_mspe)
placebo_trimmed <- placebo_tbl %>%
  filter(pre_mspe <= 5 * basque_pre_mspe,
         pre_mspe >= basque_pre_mspe / 5) %>%
  arrange(desc(ratio)) %>%
  mutate(rank_trimmed = row_number())

placebo_export <- placebo_tbl %>%
  left_join(placebo_trimmed %>% select(regionno, rank_trimmed),
            by = "regionno")
write_csv(placebo_export, "placebo_mspe_ratios.csv")
cat("\nSaved: placebo_mspe_ratios.csv\n")

basque_rank     <- placebo_tbl %>% filter(regionno == 17) %>% pull(rank)
basque_pseudo_p <- basque_rank / nrow(placebo_tbl)
basque_rank_t   <- placebo_trimmed %>% filter(regionno == 17) %>%
                    pull(rank_trimmed)
basque_pseudo_p_t <- basque_rank_t / nrow(placebo_trimmed)
cat(sprintf("Basque MSPE-ratio rank (full):    %d of %d (pseudo p = %.3f)\n",
            basque_rank, nrow(placebo_tbl), basque_pseudo_p))
cat(sprintf("Basque MSPE-ratio rank (trimmed): %d of %d (pseudo p = %.3f)\n",
            basque_rank_t, nrow(placebo_trimmed), basque_pseudo_p_t))
cat(sprintf("  Trimmed = pre-MSPE within factor 5 of Basque (%.4f).\n",
            basque_pre_mspe))

# ── Figure 4: in-space placebo gap distribution ──────────────────
# Plot only regions whose pre-treatment fit is comparable to Basque,
# matching the trimmed inference above. This avoids "noisy" placebo
# traces from regions with very small or very large pre-MSPE.
keep_regions <- placebo_trimmed$region

colnames(gap_traces) <- trace_names
gap_long <- as_tibble(gap_traces) %>%
  mutate(year = year_seq) %>%
  pivot_longer(-year, names_to = "region", values_to = "gap") %>%
  filter(region %in% keep_regions) %>%
  mutate(is_basque = grepl("Basque", region))

p4 <- ggplot(gap_long, aes(year, gap, group = region,
                           color = is_basque, alpha = is_basque,
                           linewidth = is_basque)) +
  geom_hline(yintercept = 0, color = NEAR_BLACK, linewidth = 0.4) +
  geom_vline(xintercept = 1970, linetype = "dashed",
             color = NEAR_BLACK, linewidth = 0.5) +
  geom_line() +
  scale_color_manual(values = c(`TRUE`  = WARM_ORANGE,
                                `FALSE` = LIGHT_GREY),
                     labels = c(`TRUE`  = "Basque Country",
                                `FALSE` = "Placebo regions")) +
  scale_alpha_manual(values = c(`TRUE` = 1, `FALSE` = 0.6),
                     guide = "none") +
  scale_linewidth_manual(values = c(`TRUE` = 1.2, `FALSE` = 0.4),
                         guide = "none") +
  scale_y_continuous(limits = c(-2, 2)) +
  labs(
    title    = "In-space placebo: gap traces for comparable-fit regions",
    subtitle = sprintf(
      "Basque ranks %d of %d by post/pre MSPE ratio (pseudo p = %.3f); regions with extreme pre-fit excluded",
      basque_rank_t, nrow(placebo_trimmed), basque_pseudo_p_t
    ),
    x = "Year",
    y = "Gap in real GDP per capita (1986 thousands USD)"
  ) +
  theme_site()

ggsave("r_basic_synthetic_control_04_inspace_placebo.png", p4,
       width = 8, height = 6, dpi = 300, bg = "white")
cat("Saved: r_basic_synthetic_control_04_inspace_placebo.png\n")


# ── 8. Concluding summary ────────────────────────────────────────

cat("\n═══════════════════════════════════════════════════════════\n")
cat("8. SUMMARY\n")
cat("═══════════════════════════════════════════════════════════\n")

# Headline ATT: mean post-1970 gap, in 1986 thousands USD per capita
att_estimate <- mean(gap_series$gap[gap_series$year >= 1970])

cat(sprintf("Estimated ATT (1970-1997 mean gap): %+.3f thousand 1986 USD per capita\n",
            att_estimate))
cat(sprintf("Largest single-year gap:            %+.3f thousand USD in %d\n",
            gap_min_val, gap_min_year))
cat(sprintf("Top donor regions:                  %s (%.0f%%) and %s (%.0f%%)\n",
            donor_weights$region[1], 100 * donor_weights$weight[1],
            donor_weights$region[2], 100 * donor_weights$weight[2]))
cat(sprintf("Basque MSPE-ratio rank (trimmed):   %d of %d (pseudo p = %.3f)\n",
            basque_rank_t, nrow(placebo_trimmed), basque_pseudo_p_t))

cat("\nInterpretation: the Basque Country experienced a sustained GDP\n")
cat("shortfall after 1970 that no weighted recipe of other Spanish\n")
cat("regions can replicate, consistent with terrorism-driven economic\n")
cat("damage as documented by Abadie & Gardeazabal (2003).\n")

cat("\n=== Script completed successfully ===\n")
