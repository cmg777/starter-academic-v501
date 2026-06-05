# ══════════════════════════════════════════════════════════════════════════════
# Synthetic Control in a Multi-Country Setting: the Augmented Synthetic Control
# Method (ASCM) with the augsynth package
#
# This script powers the tutorial post `r_sc_multi_country`. It has two arcs:
#
#   PART 1 — Teach ASCM on SIMULATED data where the true treatment effect is known.
#            Introduces the three documented augsynth entry points:
#              * single_augsynth   — one treated unit
#              * multisynth        — many treated units, staggered adoption
#              * augsynth_multiout — one treated unit, several outcomes
#            Saves a reusable synthetic panel to CSV and tests the methods'
#            suitability by checking recovery of the known effect.
#
#   PART 2 — Qualitatively REPLICATE Papaioannou (2021, Economics Letters),
#            "European monetary integration, TFP and productivity convergence",
#            with ASCM. Treated = 12 EMU countries; donors = 24 non-EMU economies;
#            outcomes = tfp (primary) and prod_gap; intervention = 1999 (euro),
#            with 1992 (Maastricht) as a robustness check.
#
# Estimand: ATT (average treatment effect on the treated) — the post-treatment
#           gap between the treated unit's outcome and its synthetic counterfactual.
#
# Usage:  Rscript analysis.R 2>&1 | tee execution_log.txt
# Output: r_sc_multi_country_*.png  (16 figures)
#         synthetic_panel_multicountry.csv, synthetic_panel_2country_intuition.csv
#         sim_*.csv, emu_*.csv, paper_vs_ascm_comparison.csv
#         web_app/data/results.json
#
# augsynth is NOT on CRAN — installed from GitHub, pinned to commit 7a90ea4:
#   remotes::install_github("ebenmichael/augsynth@7a90ea48877fae7925a72cb50bc03a315bc7c042")
# Verified with: R 4.5.2, augsynth 0.2.0, Synth 1.1.10.
#
# References:
#   - Abadie, Diamond & Hahn (2010). Synthetic Control Methods. JASA.
#   - Ben-Michael, Feller & Rothstein (2021). The Augmented Synthetic Control
#     Method. JASA 116(536), 1415-1427.
#   - Papaioannou (2021). European monetary integration, TFP and productivity
#     convergence. Economics Letters 199, 109696.
# ══════════════════════════════════════════════════════════════════════════════

# ── 0. Setup ──────────────────────────────────────────────────────────────────

required <- c("augsynth", "Synth", "haven", "dplyr", "tidyr", "ggplot2",
              "purrr", "jsonlite")
missing  <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop("Missing packages: ", paste(missing, collapse = ", "),
       "\nInstall augsynth with: remotes::install_github('ebenmichael/augsynth')")
}

suppressPackageStartupMessages({
  library(augsynth)
  library(haven)
  library(dplyr)
  library(tidyr)
  library(ggplot2)
  library(purrr)
  library(jsonlite)
})

set.seed(20260605)

# Site colour palette
STEEL_BLUE  <- "#6a9bcc"   # synthetic control
WARM_ORANGE <- "#d97757"   # treated / actual
NEAR_BLACK  <- "#141413"   # truth / reference
TEAL        <- "#00d4c8"   # ridge-augmented / highlight
GREY_DONOR  <- "grey78"    # donor pool

theme_site <- function(base = 13) {
  theme_minimal(base_size = base) %+replace%
    theme(
      plot.title       = element_text(face = "bold", colour = NEAR_BLACK,
                                       size = base + 1, hjust = 0,
                                       margin = margin(b = 4)),
      plot.subtitle    = element_text(colour = NEAR_BLACK, size = base - 2,
                                      hjust = 0, margin = margin(b = 8)),
      plot.caption     = element_text(colour = "grey45", size = base - 4,
                                      hjust = 0, margin = margin(t = 8)),
      axis.title       = element_text(colour = NEAR_BLACK, size = base - 2),
      axis.text        = element_text(colour = NEAR_BLACK, size = base - 3),
      panel.grid.major = element_line(colour = "grey90", linewidth = 0.3),
      panel.grid.minor = element_blank(),
      legend.position  = "bottom",
      legend.title     = element_blank(),
      strip.text       = element_text(face = "bold", colour = NEAR_BLACK,
                                      size = base - 3)
    )
}

save_fig <- function(plot, file, w = 8, h = 6) {
  ggsave(file, plot, width = w, height = h, dpi = 300, bg = "white")
  cat("  [figure] ", file, "\n", sep = "")
}

rule <- function(txt) cat("\n", strrep("=", 78), "\n", txt, "\n",
                          strrep("=", 78), "\n", sep = "")

# Extract actual-vs-synthetic level series from a single_augsynth fit.
synth_levels <- function(fit, data, unit_col, time_col, outcome_col, target) {
  syn  <- predict(fit, att = FALSE)                       # synthetic Y(0), named by time
  out  <- data.frame(time = as.numeric(names(syn)),
                     synthetic = as.numeric(syn))
  act  <- data[data[[unit_col]] == target, c(time_col, outcome_col)]
  names(act) <- c("time", "actual")
  merge(act, out, by = "time")
}

# Average post-treatment % effect over a calendar window from a level series.
pct_effect <- function(series, from, to) {
  s <- series[series$time >= from & series$time <= to, ]
  100 * mean((s$actual - s$synthetic) / s$synthetic)
}

dir.create("web_app/data", recursive = TRUE, showWarnings = FALSE)
results <- list()   # collected for the web app's results.json


# ══════════════════════════════════════════════════════════════════════════════
# PART 1 — LEARNING THE METHOD ON SIMULATED DATA
# ══════════════════════════════════════════════════════════════════════════════

# ── 1a. A two-country intuition example ───────────────────────────────────────
rule("PART 1a: Two-country intuition")

years_i <- 2000:2023
t_int_i <- 2012
# A donor that IS a valid counterfactual by construction, plus a treated unit
# equal to that counterfactual + an injected post-2012 effect of +6 units/period.
trend_i <- 40 + 1.2 * (years_i - 2000) + 3 * sin(2 * pi * (years_i - 2000) / 9)
control_i <- trend_i + rnorm(length(years_i), 0, 0.6)
true_eff_i <- ifelse(years_i >= t_int_i, 1.5 * (years_i - t_int_i + 1), 0)
treated_i <- trend_i + rnorm(length(years_i), 0, 0.6) + true_eff_i

intuition <- bind_rows(
  data.frame(country = "Atlantia (treated)", year = years_i,
             outcome = treated_i, treat = as.integer(years_i >= t_int_i),
             role = "treated"),
  data.frame(country = "Borealis (control)", year = years_i,
             outcome = control_i, treat = 0L, role = "control")
)
write.csv(intuition, "synthetic_panel_2country_intuition.csv", row.names = FALSE)
cat("Saved synthetic_panel_2country_intuition.csv (", nrow(intuition), " rows)\n", sep = "")

est_gap_i <- mean(treated_i[years_i >= t_int_i] - control_i[years_i >= t_int_i])
true_gap_i <- mean(true_eff_i[years_i >= t_int_i])
cat(sprintf("Mean post-2012 gap (treated - control): %.2f  | true mean effect: %.2f\n",
            est_gap_i, true_gap_i))

p01 <- ggplot(intuition, aes(year, outcome, colour = role)) +
  geom_line(linewidth = 1.1) +
  geom_point(size = 1.3) +
  annotate("rect", xmin = t_int_i, xmax = max(years_i), ymin = -Inf, ymax = Inf,
           alpha = 0.05, fill = WARM_ORANGE) +
  geom_vline(xintercept = t_int_i, linetype = "dashed", colour = NEAR_BLACK) +
  annotate("text", x = t_int_i + 0.3, y = min(intuition$outcome),
           label = "intervention (2012)", hjust = 0, size = 3.3, colour = NEAR_BLACK) +
  scale_colour_manual(values = c(treated = WARM_ORANGE, control = STEEL_BLUE),
                      labels = c(treated = "Atlantia (treated)",
                                 control = "Borealis (synthetic counterfactual)")) +
  labs(title = "The core idea: a counterfactual you can see",
       subtitle = "When one comparison unit tracks the treated unit before treatment, the post-treatment gap is the effect",
       x = "Year", y = "Outcome", caption = "Simulated data. The shaded region is the post-treatment period.") +
  theme_site()
save_fig(p01, "r_sc_multi_country_01_two_country_intuition.png")

results$intuition <- list(t_int = t_int_i,
                          series = lapply(split(intuition, intuition$role), function(d)
                            list(year = d$year, outcome = round(d$outcome, 3))),
                          est_gap = round(est_gap_i, 3), true_gap = round(true_gap_i, 3))


# ── 1b. One reusable multi-country panel (factor model) ───────────────────────
rule("PART 1b: Build & save the reusable multi-country panel")

years   <- 2000:2023
n_t     <- length(years)
s       <- years - 2000
donors  <- sprintf("C%02d", 6:20)          # 15 never-treated donors
treated <- sprintf("C%02d", 1:5)           # 5 treated units
adopt   <- c(C01 = 2010, C02 = 2010, C03 = 2013, C04 = 2016, C05 = 2016)
beta1   <- c(C01 = 0.40, C02 = 0.30, C03 = 0.50, C04 = 0.20, C05 = -0.35)  # outcome-1 ramp
beta2   <- 0.6 * beta1                                                      # outcome-2 ramp

# Three latent common factors
f1 <- sin(2 * pi * s / 12)
f2 <- 0.05 * s
f3 <- cos(2 * pi * s / 7)

# Donor parameters (random); treated interiors are convex blends of donors so a
# good synthetic exists, except C05 which sits OUTSIDE the donor hull on purpose.
donor_mu <- setNames(rnorm(length(donors), 10, 2), donors)
donor_L1 <- setNames(runif(length(donors), 0.3, 1.5), donors)
donor_L2 <- setNames(runif(length(donors), 0.3, 1.5), donors)
donor_L3 <- setNames(runif(length(donors), 0.2, 1.0), donors)
donor_nu <- setNames(rnorm(length(donors), 2, 0.5), donors)
donor_k  <- setNames(runif(length(donors), 0.3, 0.8), donors)

# helper to make Y(0) for given params
y0 <- function(mu, L1, L2, L3) mu + L1 * f1 + L2 * f2 + L3 * f3

panel_rows <- list()

# Donors
for (d in donors) {
  Y1 <- y0(donor_mu[d], donor_L1[d], donor_L2[d], donor_L3[d]) + rnorm(n_t, 0, 0.25)
  Y2 <- 0.6 * Y1 + donor_nu[d] + donor_k[d] * f1 + rnorm(n_t, 0, 0.20)
  panel_rows[[d]] <- data.frame(
    country = d, year = years, treated_unit = 0L, adopt_year = NA_integer_,
    treat_ms = 0L, gdp_index = Y1, trade_index = Y2,
    gdp_index_cf = Y1, trade_index_cf = Y2,
    true_effect_gdp = 0, true_effect_trade = 0)
}

# Treated: C01-C04 convex blends of donors (interior); C05 outside the hull
for (tu in treated) {
  if (tu == "C05") {
    mu <- max(donor_mu) + 1.2; L1 <- max(donor_L1) + 0.5
    L2 <- max(donor_L2) + 0.4; L3 <- max(donor_L3) + 0.3
    nu <- max(donor_nu) + 0.6; kk <- max(donor_k) + 0.3
  } else {
    w  <- as.numeric(MCMCpack_rdirichlet <- {
      g <- rgamma(length(donors), 1); g / sum(g) })   # Dirichlet weights
    mu <- sum(w * donor_mu); L1 <- sum(w * donor_L1)
    L2 <- sum(w * donor_L2); L3 <- sum(w * donor_L3)
    nu <- sum(w * donor_nu); kk <- sum(w * donor_k)
  }
  Y1_0 <- y0(mu, L1, L2, L3) + rnorm(n_t, 0, 0.25)
  Y2_0 <- 0.6 * Y1_0 + nu + kk * f1 + rnorm(n_t, 0, 0.20)
  a    <- adopt[[tu]]
  k    <- pmax(0, years - a)
  eff1 <- beta1[[tu]] * k
  eff2 <- beta2[[tu]] * k
  panel_rows[[tu]] <- data.frame(
    country = tu, year = years, treated_unit = 1L, adopt_year = a,
    treat_ms = as.integer(years >= a),
    gdp_index = Y1_0 + eff1, trade_index = Y2_0 + eff2,
    gdp_index_cf = Y1_0, trade_index_cf = Y2_0,
    true_effect_gdp = eff1, true_effect_trade = eff2)
}

panel <- bind_rows(panel_rows)
panel <- panel[order(panel$country, panel$year), ]
write.csv(panel, "synthetic_panel_multicountry.csv", row.names = FALSE)
cat(sprintf("Saved synthetic_panel_multicountry.csv: %d units x %d years = %d rows\n",
            length(unique(panel$country)), n_t, nrow(panel)))
cat("Adoption schedule: "); print(adopt)
cat("True outcome-1 ramps (per year): "); print(beta1)

# Figure 02 — all unit paths, treated highlighted
panel$kind <- ifelse(panel$treated_unit == 1, "treated", "donor")
p02 <- ggplot() +
  geom_line(data = filter(panel, kind == "donor"),
            aes(year, gdp_index, group = country), colour = GREY_DONOR, linewidth = 0.4) +
  geom_line(data = filter(panel, kind == "treated"),
            aes(year, gdp_index, group = country, colour = country), linewidth = 1) +
  geom_point(data = filter(panel, kind == "treated", year == adopt_year),
             aes(year, gdp_index), colour = NEAR_BLACK, size = 1.6) +
  scale_colour_brewer(palette = "Set1") +
  labs(title = "One simulated panel, three jobs",
       subtitle = "15 donors (grey) and 5 treated units adopting in 2010, 2013 and 2016 (dots mark adoption)",
       x = "Year", y = "Outcome 1 (gdp_index)",
       caption = "synthetic_panel_multicountry.csv — used for single_augsynth, multisynth and augsynth_multiout") +
  theme_site()
save_fig(p02, "r_sc_multi_country_02_sim_panel_paths.png")


# ── 1c. single_augsynth: one treated unit ─────────────────────────────────────
rule("PART 1c: single_augsynth on C01 (plain SCM vs Ridge-ASCM)")

# Donor hygiene: one treated unit + the 15 never-treated donors only.
sim_single <- panel %>%
  filter(country %in% c("C01", donors)) %>%
  mutate(trt = as.integer(country == "C01" & year >= adopt[["C01"]])) %>%
  as.data.frame()

sc_plain <- augsynth(gdp_index ~ trt, country, year, sim_single,
                     t_int = adopt[["C01"]], progfunc = "None",  scm = TRUE)
sc_ridge <- augsynth(gdp_index ~ trt, country, year, sim_single,
                     t_int = adopt[["C01"]], progfunc = "ridge", scm = TRUE)

sum_plain <- summary(sc_plain, inf_type = "conformal")
sum_ridge <- summary(sc_ridge, inf_type = "conformal")
att_plain <- sum_plain$average_att$Estimate
att_ridge <- sum_ridge$average_att$Estimate
p_plain   <- sum_plain$average_att$p_val
true_att_c01 <- mean(panel$true_effect_gdp[panel$country == "C01" &
                                             panel$year >= adopt[["C01"]]])

cat(sprintf("C01 true average post ATT      : %+.3f\n", true_att_c01))
cat(sprintf("Plain SCM   estimated avg ATT  : %+.3f  (p=%.3f, scaled L2 pre-fit=%.3f)\n",
            att_plain, p_plain, sc_plain$scaled_l2_imbalance))
cat(sprintf("Ridge-ASCM  estimated avg ATT  : %+.3f  (scaled L2 pre-fit=%.3f, lambda=%.4f)\n",
            att_ridge, sc_ridge$scaled_l2_imbalance, sc_ridge$lambda))

lv_plain <- synth_levels(sc_plain, sim_single, "country", "year", "gdp_index", "C01")
lv_ridge <- synth_levels(sc_ridge, sim_single, "country", "year", "gdp_index", "C01")

# Figure 03 — actual vs synthetic (plain & ridge)
df03 <- bind_rows(
  transform(lv_plain[c("time", "actual")], series = "Actual C01"),
  transform(setNames(lv_plain[c("time", "synthetic")], c("time", "actual")),
            series = "Synthetic (plain SCM)"),
  transform(setNames(lv_ridge[c("time", "synthetic")], c("time", "actual")),
            series = "Synthetic (Ridge-ASCM)"))
p03 <- ggplot(df03, aes(time, actual, colour = series, linetype = series)) +
  geom_vline(xintercept = adopt[["C01"]], linetype = "dashed", colour = NEAR_BLACK) +
  geom_line(linewidth = 1) +
  scale_colour_manual(values = c("Actual C01" = WARM_ORANGE,
                                 "Synthetic (plain SCM)" = STEEL_BLUE,
                                 "Synthetic (Ridge-ASCM)" = TEAL)) +
  scale_linetype_manual(values = c("Actual C01" = "solid",
                                   "Synthetic (plain SCM)" = "solid",
                                   "Synthetic (Ridge-ASCM)" = "22")) +
  labs(title = "single_augsynth: treated unit vs its synthetic control",
       subtitle = sprintf("C01 adopts in %d. Plain SCM and Ridge-ASCM both track the pre-period closely",
                          adopt[["C01"]]),
       x = "Year", y = "Outcome 1 (gdp_index)",
       caption = "Vertical dashed line = adoption year.") +
  theme_site()
save_fig(p03, "r_sc_multi_country_03_single_actual_vs_synth.png")

# Figure 04 — gap with conformal band + true effect overlaid
att04 <- sum_plain$att
att04$true <- panel$true_effect_gdp[match(att04$Time,
              panel$year[panel$country == "C01"])]
p04 <- ggplot(att04, aes(Time)) +
  geom_hline(yintercept = 0, colour = "grey60") +
  geom_vline(xintercept = adopt[["C01"]], linetype = "dashed", colour = NEAR_BLACK) +
  geom_ribbon(data = subset(att04, !is.na(lower_bound)),
              aes(ymin = lower_bound, ymax = upper_bound), fill = STEEL_BLUE, alpha = 0.18) +
  geom_line(aes(y = Estimate, colour = "Estimated effect"), linewidth = 1) +
  geom_line(aes(y = true, colour = "True injected effect"), linewidth = 0.9, linetype = "22") +
  scale_colour_manual(values = c("Estimated effect" = STEEL_BLUE,
                                 "True injected effect" = NEAR_BLACK)) +
  labs(title = "single_augsynth recovers a known effect",
       subtitle = "Estimated treated-minus-synthetic gap (plain SCM) with conformal band vs the true injected ramp",
       x = "Year", y = "Effect on gdp_index",
       caption = "Shaded band = pointwise conformal interval. Pre-period effects hover around zero.") +
  theme_site()
save_fig(p04, "r_sc_multi_country_04_single_gap_conformal.png")

# donor weights for C01 (plain)
w_c01 <- sc_plain$weights[, 1]
w_c01 <- sort(w_c01[w_c01 > 1e-4], decreasing = TRUE)
sim_donor_weights <- data.frame(donor = names(w_c01), weight = round(as.numeric(w_c01), 4))
write.csv(sim_donor_weights, "sim_donor_weights.csv", row.names = FALSE)
cat("Top C01 donor weights:\n"); print(head(sim_donor_weights, 6))

results$single <- list(
  unit = "C01", adopt = adopt[["C01"]], true_att = round(true_att_c01, 3),
  att_plain = round(att_plain, 3), att_ridge = round(att_ridge, 3),
  p_plain = p_plain,
  scaled_l2_plain = round(sc_plain$scaled_l2_imbalance, 3),
  scaled_l2_ridge = round(sc_ridge$scaled_l2_imbalance, 3),
  series = list(time = lv_plain$time, actual = round(lv_plain$actual, 3),
                syn_plain = round(lv_plain$synthetic, 3),
                syn_ridge = round(lv_ridge$synthetic, 3)),
  gap = list(time = att04$Time, est = round(att04$Estimate, 3),
             lo = round(att04$lower_bound, 3), hi = round(att04$upper_bound, 3),
             true = round(att04$true, 3)),
  weights = list(donor = sim_donor_weights$donor, weight = sim_donor_weights$weight))


# ── 1d. multisynth: many treated units, staggered adoption ────────────────────
rule("PART 1d: multisynth on 5 treated units (staggered)")

sim_multi <- panel %>%
  filter(country %in% c(treated, donors)) %>%
  select(country, year, treat_ms, gdp_index) %>%
  as.data.frame()

ms_sim <- multisynth(gdp_index ~ treat_ms, country, year, sim_multi)
set.seed(20260605)
ms_sim_sum <- summary(ms_sim, inf_type = "bootstrap")
att_ms <- as.data.frame(ms_sim_sum$att)

# Overall (Time == NA) average ATT per level
overall <- att_ms[is.na(att_ms$Time), c("Level", "Estimate", "Std.Error",
                                        "lower_bound", "upper_bound")]
# True per-unit and pooled averages from the KNOWN effects, computed over the
# SAME common post-treatment window multisynth averages over (leads 0..n_leads-1)
# so the comparison is apples-to-apples.
n_leads_sim <- ms_sim_sum$n_leads
true_unit <- sapply(treated, function(u) {
  yrs <- adopt[[u]] + seq_len(n_leads_sim) - 1
  mean(panel$true_effect_gdp[panel$country == u & panel$year %in% yrs])
})
true_pooled <- mean(unlist(true_unit))

cat(sprintf("multisynth nu (auto) = %.3f ; global scaled L2 = %.3f ; n_leads = %d\n",
            ms_sim$nu, ms_sim_sum$scaled_global_l2, n_leads_sim))
cat("\nEstimated vs TRUE average post-treatment ATT (over the common n_leads window):\n")
ms_compare <- data.frame(
  level = overall$Level,
  estimate = round(overall$Estimate, 3),
  ci_lo = round(overall$lower_bound, 3),
  ci_hi = round(overall$upper_bound, 3),
  truth = round(c(Average = true_pooled, true_unit)[overall$Level], 3))
print(ms_compare, row.names = FALSE)
write.csv(att_ms, "sim_multisynth_att.csv", row.names = FALSE)

# Figure 05 — per-unit estimated vs true effect (relative time small multiples)
att_units <- att_ms[!is.na(att_ms$Time) & att_ms$Level != "Average", ]
att_units$true <- mapply(function(lv, tt) {
  u <- lv; y <- adopt[[u]] + tt
  v <- panel$true_effect_gdp[panel$country == u & panel$year == y]
  if (length(v)) v else NA_real_
}, att_units$Level, att_units$Time)
p05 <- ggplot(att_units, aes(Time)) +
  geom_hline(yintercept = 0, colour = "grey70") +
  geom_vline(xintercept = 0, linetype = "dashed", colour = NEAR_BLACK) +
  geom_ribbon(data = subset(att_units, !is.na(lower_bound)),
              aes(ymin = lower_bound, ymax = upper_bound), fill = STEEL_BLUE, alpha = 0.15) +
  geom_line(aes(y = Estimate, colour = "Estimated"), linewidth = 0.9) +
  geom_line(data = subset(att_units, !is.na(true)),
            aes(y = true, colour = "True"), linetype = "22", linewidth = 0.8) +
  facet_wrap(~ Level, ncol = 5) +
  scale_colour_manual(values = c("Estimated" = STEEL_BLUE, "True" = NEAR_BLACK)) +
  labs(title = "multisynth: per-unit treatment effects, staggered adoption",
       subtitle = "Effect by time relative to each unit's adoption year (0 = adoption). C05's effect is negative by design",
       x = "Years since adoption", y = "Effect on gdp_index",
       caption = "Bands = wild-bootstrap intervals. Each panel is one treated unit.") +
  theme_site()
save_fig(p05, "r_sc_multi_country_05_multisynth_percountry.png", h = 4.5)

# Figure 06 — pooled average effect + bootstrap band vs true pooled
avg_path <- att_ms[att_ms$Level == "Average" & !is.na(att_ms$Time), ]
avg_path$true <- sapply(avg_path$Time, function(tt) {
  vals <- sapply(treated, function(u) {
    y <- adopt[[u]] + tt
    v <- panel$true_effect_gdp[panel$country == u & panel$year == y]
    if (length(v)) v else NA_real_ })
  mean(vals, na.rm = TRUE) })
p06 <- ggplot(avg_path, aes(Time)) +
  geom_hline(yintercept = 0, colour = "grey70") +
  geom_vline(xintercept = 0, linetype = "dashed", colour = NEAR_BLACK) +
  geom_ribbon(aes(ymin = lower_bound, ymax = upper_bound), fill = STEEL_BLUE, alpha = 0.2) +
  geom_line(aes(y = Estimate, colour = "Pooled estimate"), linewidth = 1.1) +
  geom_line(aes(y = true, colour = "True pooled effect"), linetype = "22", linewidth = 0.9) +
  scale_colour_manual(values = c("Pooled estimate" = STEEL_BLUE,
                                 "True pooled effect" = NEAR_BLACK)) +
  labs(title = "multisynth: the pooled average effect across treated units",
       subtitle = "Partially-pooled ATT by time since adoption, with wild-bootstrap confidence band",
       x = "Years since adoption", y = "Average effect on gdp_index",
       caption = "The pooled path averages five heterogeneous units, including C05's negative effect.") +
  theme_site()
save_fig(p06, "r_sc_multi_country_06_multisynth_pooled.png")

results$multi <- list(
  nu = round(ms_sim$nu, 3), scaled_global_l2 = round(ms_sim_sum$scaled_global_l2, 3),
  overall = list(level = ms_compare$level, estimate = ms_compare$estimate,
                 ci_lo = ms_compare$ci_lo, ci_hi = ms_compare$ci_hi,
                 truth = ms_compare$truth),
  pooled_path = list(time = avg_path$Time, est = round(avg_path$Estimate, 3),
                     lo = round(avg_path$lower_bound, 3),
                     hi = round(avg_path$upper_bound, 3),
                     true = round(avg_path$true, 3)))


# ── 1e. augsynth_multiout: one unit, two outcomes ─────────────────────────────
rule("PART 1e: augsynth_multiout on C01 (two outcomes)")

mo_sim <- augsynth_multiout(gdp_index + trade_index ~ trt, country, year,
                            adopt[["C01"]], sim_single,
                            progfunc = "None", scm = TRUE, combine_method = "avg")
mo_sum <- summary(mo_sim)
cat("Joint (multi-outcome) average ATT by outcome:\n"); print(mo_sum$average_att)

true_att_trade_c01 <- mean(panel$true_effect_trade[panel$country == "C01" &
                                                    panel$year >= adopt[["C01"]]])
cat(sprintf("\nTrue gdp_index ATT  : %+.3f  |  multiout estimate: %+.3f\n",
            true_att_c01, mo_sum$average_att$Estimate[mo_sum$average_att$Outcome == "gdp_index"]))
cat(sprintf("True trade_index ATT: %+.3f  |  multiout estimate: %+.3f\n",
            true_att_trade_c01, mo_sum$average_att$Estimate[mo_sum$average_att$Outcome == "trade_index"]))

# Figure 07 — two-panel actual vs synthetic for both outcomes
mo_pred <- predict(mo_sim, att = FALSE)   # matrix: columns per outcome
# Reconstruct level series per outcome via single fits for clean plotting
fit_g <- augsynth(gdp_index   ~ trt, country, year, sim_single, t_int = adopt[["C01"]],
                  progfunc = "None", scm = TRUE)
fit_t <- augsynth(trade_index ~ trt, country, year, sim_single, t_int = adopt[["C01"]],
                  progfunc = "None", scm = TRUE)
lv_g <- synth_levels(fit_g, sim_single, "country", "year", "gdp_index",   "C01")
lv_t <- synth_levels(fit_t, sim_single, "country", "year", "trade_index", "C01")
df07 <- bind_rows(
  transform(lv_g, outcome = "Outcome 1 (gdp_index)"),
  transform(lv_t, outcome = "Outcome 2 (trade_index)")) %>%
  pivot_longer(c(actual, synthetic), names_to = "series", values_to = "value")
p07 <- ggplot(df07, aes(time, value, colour = series)) +
  geom_vline(xintercept = adopt[["C01"]], linetype = "dashed", colour = NEAR_BLACK) +
  geom_line(linewidth = 1) +
  facet_wrap(~ outcome, scales = "free_y") +
  scale_colour_manual(values = c(actual = WARM_ORANGE, synthetic = STEEL_BLUE),
                      labels = c(actual = "Actual C01", synthetic = "Synthetic control")) +
  labs(title = "augsynth_multiout: one unit, two outcomes at once",
       subtitle = "A single set of donor weights builds a synthetic control that balances both outcomes jointly",
       x = "Year", y = "Value",
       caption = "Both outcomes share the treated unit C01 and the same donor pool.") +
  theme_site()
save_fig(p07, "r_sc_multi_country_07_multiout_two_panel.png", h = 4.5)

results$multiout <- list(
  unit = "C01",
  outcomes = as.list(setNames(round(mo_sum$average_att$Estimate, 3), mo_sum$average_att$Outcome)),
  truth = list(gdp_index = round(true_att_c01, 3), trade_index = round(true_att_trade_c01, 3)))


# ── 1f. Testing suitability: where plain SCM fails and ASCM corrects ──────────
rule("PART 1f: Suitability test — C05 (outside the donor hull)")

sim_c05 <- panel %>%
  filter(country %in% c("C05", donors)) %>%
  mutate(trt = as.integer(country == "C05" & year >= adopt[["C05"]])) %>%
  as.data.frame()
c05_plain <- augsynth(gdp_index ~ trt, country, year, sim_c05, t_int = adopt[["C05"]],
                      progfunc = "None",  scm = TRUE)
c05_ridge <- augsynth(gdp_index ~ trt, country, year, sim_c05, t_int = adopt[["C05"]],
                      progfunc = "ridge", scm = TRUE)
true_att_c05 <- mean(panel$true_effect_gdp[panel$country == "C05" &
                                            panel$year >= adopt[["C05"]]])

# Build a recovery table across all treated units (plain vs ridge)
recovery <- map_dfr(treated, function(u) {
  d <- panel %>% filter(country %in% c(u, donors)) %>%
    mutate(trt = as.integer(country == u & year >= adopt[[u]])) %>% as.data.frame()
  fp <- augsynth(gdp_index ~ trt, country, year, d, t_int = adopt[[u]],
                 progfunc = "None",  scm = TRUE)
  fr <- augsynth(gdp_index ~ trt, country, year, d, t_int = adopt[[u]],
                 progfunc = "ridge", scm = TRUE)
  tr <- mean(panel$true_effect_gdp[panel$country == u & panel$year >= adopt[[u]]])
  data.frame(unit = u, adopt = adopt[[u]], true_att = tr,
             att_plain = summary(fp)$average_att$Estimate,
             att_ridge = summary(fr)$average_att$Estimate,
             prefit_l2_plain = fp$scaled_l2_imbalance,
             prefit_l2_ridge = fr$scaled_l2_imbalance)
})
recovery$err_plain <- abs(recovery$att_plain - recovery$true_att)
recovery$err_ridge <- abs(recovery$att_ridge - recovery$true_att)
recovery[ , -1] <- round(recovery[ , -1], 3)
cat("Recovery table (|estimate - truth| in last two columns):\n")
print(recovery, row.names = FALSE)
write.csv(recovery, "sim_recovery_table.csv", row.names = FALSE)
cat(sprintf("\nMean recovery error  — plain SCM: %.3f  | Ridge-ASCM: %.3f\n",
            mean(recovery$err_plain), mean(recovery$err_ridge)))
cat(sprintf("C05 pre-fit scaled L2 — plain: %.3f  | ridge: %.3f (lower = better fit)\n",
            c05_plain$scaled_l2_imbalance, c05_ridge$scaled_l2_imbalance))

# Figure 08 — C05 plain vs ridge actual-vs-synthetic (pre-fit failure & correction)
lv_c05p <- synth_levels(c05_plain, sim_c05, "country", "year", "gdp_index", "C05")
lv_c05r <- synth_levels(c05_ridge, sim_c05, "country", "year", "gdp_index", "C05")
df08 <- bind_rows(
  transform(lv_c05p, method = sprintf("Plain SCM (pre-fit L2=%.2f)", c05_plain$scaled_l2_imbalance)),
  transform(lv_c05r, method = sprintf("Ridge-ASCM (pre-fit L2=%.2f)", c05_ridge$scaled_l2_imbalance))) %>%
  pivot_longer(c(actual, synthetic), names_to = "series", values_to = "value")
p08 <- ggplot(df08, aes(time, value, colour = series)) +
  geom_vline(xintercept = adopt[["C05"]], linetype = "dashed", colour = NEAR_BLACK) +
  geom_line(linewidth = 1) +
  facet_wrap(~ method) +
  scale_colour_manual(values = c(actual = WARM_ORANGE, synthetic = STEEL_BLUE),
                      labels = c(actual = "Actual C05", synthetic = "Synthetic control")) +
  labs(title = "Suitability test: when plain SCM cannot fit, augmentation helps",
       subtitle = "C05 sits outside the donor hull. Plain SCM leaves a visible pre-treatment gap; Ridge-ASCM closes it",
       x = "Year", y = "Outcome 1 (gdp_index)",
       caption = "Lower pre-fit L2 = better pre-treatment match. Ridge augmentation corrects the residual bias.") +
  theme_site()
save_fig(p08, "r_sc_multi_country_08_suitability_plain_vs_ridge.png", h = 4.5)

results$suitability <- list(
  recovery = lapply(seq_len(nrow(recovery)), function(i) as.list(recovery[i, ])),
  mean_err_plain = round(mean(recovery$err_plain), 3),
  mean_err_ridge = round(mean(recovery$err_ridge), 3),
  c05_prefit_plain = round(c05_plain$scaled_l2_imbalance, 3),
  c05_prefit_ridge = round(c05_ridge$scaled_l2_imbalance, 3),
  c05_series = list(time = lv_c05p$time, actual = round(lv_c05p$actual, 3),
                    syn_plain = round(lv_c05p$synthetic, 3),
                    syn_ridge = round(lv_c05r$synthetic, 3)))


# ══════════════════════════════════════════════════════════════════════════════
# PART 2 — REPLICATING PAPAIOANNOU (2021) WITH ASCM
# ══════════════════════════════════════════════════════════════════════════════
rule("PART 2: Load EMU data and construct treatment")

emu <- read_dta("reference/dataset_revision_1.dta")
emu <- emu %>%
  mutate(country = as.character(country)) %>%
  zap_labels() %>% as.data.frame()
emu$trt99 <- as.integer(emu$treat == 1 & emu$time1 == 1)   # EMU x post-1999
emu$trt92 <- as.integer(emu$treat == 1 & emu$time2 == 1)   # EMU x post-1992

emu_members <- sort(unique(emu$country[emu$treat == 1]))
donors_emu  <- sort(unique(emu$country[emu$treat == 0]))
cat(sprintf("EMU countries (%d): %s\n", length(emu_members), paste(emu_members, collapse = ", ")))
cat(sprintf("Donor countries (%d): %s\n", length(donors_emu), paste(donors_emu, collapse = ", ")))
covars <- c("hum_cap", "inv_share", "ec_freed", "patents", "agricult")

# Figure 09 — raw TFP paths, EMU highlighted
emu$kind <- ifelse(emu$treat == 1, "EMU member", "Donor (non-EMU)")
p09 <- ggplot() +
  geom_line(data = filter(emu, treat == 0),
            aes(year, tfp, group = country), colour = GREY_DONOR, linewidth = 0.35) +
  geom_line(data = filter(emu, treat == 1),
            aes(year, tfp, group = country), colour = WARM_ORANGE, linewidth = 0.6, alpha = 0.85) +
  geom_vline(xintercept = 1999, linetype = "dashed", colour = NEAR_BLACK) +
  annotate("text", x = 1999.4, y = max(emu$tfp), label = "euro (1999)",
           hjust = 0, size = 3.3, colour = NEAR_BLACK) +
  labs(title = "Total factor productivity, 1980-2017",
       subtitle = "12 EMU members (orange) and 24 non-EMU donor economies (grey)",
       x = "Year", y = "TFP (PWT 9.1, PPP 2011)",
       caption = "Papaioannou (2021) data. The euro launched in 1999.") +
  theme_site()
save_fig(p09, "r_sc_multi_country_09_emu_raw_tfp_paths.png")

# ── 2b/2c. Germany: plain SCM (≈ paper) then Ridge-ASCM ───────────────────────
rule("PART 2b/2c: Germany — plain SCM and Ridge-ASCM")

fit_country <- function(target, outcome = "tfp", progfunc = "None",
                        use_cov = TRUE, t_int = 1999, trt = "trt99") {
  d <- emu %>% filter(country == target | treat == 0) %>% as.data.frame()
  d$.trt <- d[[trt]]
  f <- if (use_cov)
    as.formula(sprintf("%s ~ .trt | %s", outcome, paste(covars, collapse = " + ")))
  else as.formula(sprintf("%s ~ .trt", outcome))
  augsynth(f, country, year, d, t_int = t_int, progfunc = progfunc, scm = TRUE)
}

ger_plain <- fit_country("Germany", progfunc = "None")
ger_ridge <- fit_country("Germany", progfunc = "ridge")
ger_lvp <- synth_levels(ger_plain, emu %>% filter(country == "Germany" | treat == 0),
                        "country", "year", "tfp", "Germany")
ger_lvr <- synth_levels(ger_ridge, emu %>% filter(country == "Germany" | treat == 0),
                        "country", "year", "tfp", "Germany")
cat(sprintf("Germany plain SCM avg ATT (TFP level): %+.3f | scaled L2 pre-fit %.3f\n",
            summary(ger_plain)$average_att$Estimate, ger_plain$scaled_l2_imbalance))
cat(sprintf("Germany Ridge-ASCM avg ATT (TFP level): %+.3f | scaled L2 pre-fit %.3f\n",
            summary(ger_ridge)$average_att$Estimate, ger_ridge$scaled_l2_imbalance))
cat(sprintf("Germany %% effect — 2000-07: %+.1f%%   2008-17: %+.1f%%  (plain SCM)\n",
            pct_effect(ger_lvp, 2000, 2007), pct_effect(ger_lvp, 2008, 2017)))

# Figure 10 — Germany actual vs plain-SCM synthetic
df10 <- ger_lvp %>% pivot_longer(c(actual, synthetic), names_to = "series", values_to = "value")
p10 <- ggplot(df10, aes(time, value, colour = series)) +
  geom_vline(xintercept = 1999, linetype = "dashed", colour = NEAR_BLACK) +
  geom_line(linewidth = 1) +
  scale_colour_manual(values = c(actual = WARM_ORANGE, synthetic = STEEL_BLUE),
                      labels = c(actual = "Germany (actual)", synthetic = "Synthetic Germany")) +
  labs(title = "Replicating the paper: synthetic Germany (plain SCM)",
       subtitle = "Actual German TFP rises above its synthetic counterfactual after the euro, echoing Papaioannou (2021)",
       x = "Year", y = "TFP", caption = "Donor pool = 24 non-EMU economies. Predictors: human capital, investment, economic freedom, patents, agriculture.") +
  theme_site()
save_fig(p10, "r_sc_multi_country_10_germany_plain_scm.png")

# Figure 11 — Germany plain vs ridge synthetic overlaid
df11 <- bind_rows(
  transform(ger_lvp[c("time", "actual")], series = "Germany (actual)"),
  transform(setNames(ger_lvp[c("time", "synthetic")], c("time", "actual")), series = "Synthetic (plain SCM)"),
  transform(setNames(ger_lvr[c("time", "synthetic")], c("time", "actual")), series = "Synthetic (Ridge-ASCM)"))
p11 <- ggplot(df11, aes(time, actual, colour = series, linetype = series)) +
  geom_vline(xintercept = 1999, linetype = "dashed", colour = NEAR_BLACK) +
  geom_line(linewidth = 1) +
  scale_colour_manual(values = c("Germany (actual)" = WARM_ORANGE,
                                 "Synthetic (plain SCM)" = STEEL_BLUE,
                                 "Synthetic (Ridge-ASCM)" = TEAL)) +
  scale_linetype_manual(values = c("Germany (actual)" = "solid",
                                   "Synthetic (plain SCM)" = "solid",
                                   "Synthetic (Ridge-ASCM)" = "22")) +
  labs(title = "Plain SCM vs Ridge-augmented SCM for Germany",
       subtitle = "Augmentation nudges the counterfactual when pre-treatment balance is imperfect",
       x = "Year", y = "TFP", caption = "When pre-fit is already good, the two counterfactuals nearly coincide.") +
  theme_site()
save_fig(p11, "r_sc_multi_country_11_germany_plain_vs_ridge.png")

# ── 2d. multisynth across all 12 EMU + per-country single fits ────────────────
rule("PART 2d: multisynth — pooled 12-country ATT + per-country fits")

emu_multi <- emu %>% select(country, year, trt99, tfp) %>% as.data.frame()
ms_emu <- multisynth(tfp ~ trt99, country, year, emu_multi)
set.seed(20260605)
ms_emu_sum <- summary(ms_emu, inf_type = "bootstrap")
att_emu <- as.data.frame(ms_emu_sum$att)
pooled_emu <- att_emu[att_emu$Level == "Average" & is.na(att_emu$Time), ]
cat(sprintf("Pooled EMU average ATT (TFP level): %+.3f  [%.3f, %.3f]; scaled global L2 = %.3f\n",
            pooled_emu$Estimate, pooled_emu$lower_bound, pooled_emu$upper_bound,
            ms_emu_sum$scaled_global_l2))
write.csv(att_emu, "emu_multisynth_att.csv", row.names = FALSE)

# Per-country single fits → ATT, % effects, donor weights, level series
paper_tfp_2000_07 <- c(Austria = 17.13, Belgium = 33.22, Finland = 3.32, France = 43.61,
                       Germany = 34.34, Greece = 9.13, Ireland = 47.73, Italy = 25.50,
                       Luxembourg = -5.07, Netherlands = 38.18, Portugal = 6.80, Spain = 26.88)
paper_tfp_2008_17 <- c(Austria = 5.05, Belgium = 9.72, Finland = -4.66, France = 14.68,
                       Germany = 35.56, Greece = -7.14, Ireland = 20.41, Italy = 1.10,
                       Luxembourg = -3.50, Netherlands = 16.46, Portugal = -11.30, Spain = 0.47)

emu_levels <- list(); emu_weights <- list()
emu_single <- map_dfr(emu_members, function(cn) {
  fp <- fit_country(cn, progfunc = "None")
  lv <- synth_levels(fp, emu %>% filter(country == cn | treat == 0),
                     "country", "year", "tfp", cn)
  emu_levels[[cn]] <<- lv
  w <- fp$weights[, 1]; w <- sort(w[w > 1e-3], decreasing = TRUE)
  emu_weights[[cn]] <<- data.frame(target = cn, donor = names(w), weight = round(as.numeric(w), 4))
  data.frame(country = cn,
             att_tfp = summary(fp)$average_att$Estimate,
             prefit_l2 = fp$scaled_l2_imbalance,
             pct_2000_07 = pct_effect(lv, 2000, 2007),
             pct_2008_17 = pct_effect(lv, 2008, 2017),
             paper_2000_07 = paper_tfp_2000_07[[cn]],
             paper_2008_17 = paper_tfp_2008_17[[cn]])
})
emu_single[ , -1] <- lapply(emu_single[ , -1], function(x) round(x, 3))
cat("\nPer-country ASCM (plain SCM) vs paper TFP % contributions:\n")
print(emu_single, row.names = FALSE)
write.csv(emu_single, "emu_single_att.csv", row.names = FALSE)
write.csv(bind_rows(emu_weights), "emu_donor_weights.csv", row.names = FALSE)

# Figure 12 — pooled EMU average ATT by lead
emu_path <- att_emu[att_emu$Level == "Average" & !is.na(att_emu$Time), ]
p12 <- ggplot(emu_path, aes(Time)) +
  geom_hline(yintercept = 0, colour = "grey70") +
  geom_vline(xintercept = 0, linetype = "dashed", colour = NEAR_BLACK) +
  geom_ribbon(aes(ymin = lower_bound, ymax = upper_bound), fill = STEEL_BLUE, alpha = 0.2) +
  geom_line(aes(y = Estimate), colour = STEEL_BLUE, linewidth = 1.1) +
  labs(title = "multisynth: the pooled EMU effect on TFP",
       subtitle = "Average treatment effect across all 12 EMU members by years since the 1999 euro launch",
       x = "Years since 1999", y = "Average effect on TFP",
       caption = "Wild-bootstrap confidence band. All 12 members adopt simultaneously (a block design).") +
  theme_site()
save_fig(p12, "r_sc_multi_country_12_emu_pooled_att.png")

# Figure 13 — per-country small multiples (actual vs synthetic TFP)
df13 <- map_dfr(emu_members, function(cn)
  transform(emu_levels[[cn]], country = cn)) %>%
  pivot_longer(c(actual, synthetic), names_to = "series", values_to = "value")
p13 <- ggplot(df13, aes(time, value, colour = series)) +
  geom_vline(xintercept = 1999, linetype = "dashed", colour = NEAR_BLACK, linewidth = 0.3) +
  geom_line(linewidth = 0.6) +
  facet_wrap(~ country, ncol = 4, scales = "free_y") +
  scale_colour_manual(values = c(actual = WARM_ORANGE, synthetic = STEEL_BLUE),
                      labels = c(actual = "Actual", synthetic = "Synthetic")) +
  labs(title = "Synthetic control for every EMU member (TFP)",
       subtitle = "Actual TFP (orange) vs synthetic counterfactual (blue); vertical line = 1999",
       x = "Year", y = "TFP",
       caption = "12 separate single_augsynth fits, each against the 24 non-EMU donors.") +
  theme_site(11)
save_fig(p13, "r_sc_multi_country_13_emu_percountry.png", h = 7)

# ── 2e. augsynth_multiout: TFP + prod_gap jointly for Germany ──────────────────
rule("PART 2e: augsynth_multiout — TFP and prod_gap together")

d_ger <- emu %>% filter(country == "Germany" | treat == 0) %>% as.data.frame()
d_ger$.trt <- d_ger$trt99
ger_mo <- augsynth_multiout(tfp + prod_gap ~ .trt, country, year, 1999, d_ger,
                            progfunc = "None", scm = TRUE, combine_method = "concat")
ger_mo_sum <- summary(ger_mo)
cat("Germany joint TFP + prod_gap average ATT:\n"); print(ger_mo_sum$average_att)
write.csv(ger_mo_sum$average_att, "emu_multiout_att.csv", row.names = FALSE)

fit_pg <- augsynth(prod_gap ~ .trt, country, year, d_ger, t_int = 1999,
                   progfunc = "None", scm = TRUE)
lv_tfp <- synth_levels(ger_plain, d_ger, "country", "year", "tfp", "Germany")
lv_pg  <- synth_levels(fit_pg,    d_ger, "country", "year", "prod_gap", "Germany")
df14 <- bind_rows(
  transform(lv_tfp, outcome = "TFP (higher = more productive)"),
  transform(lv_pg,  outcome = "Productivity gap vs USA (lower = closer)")) %>%
  pivot_longer(c(actual, synthetic), names_to = "series", values_to = "value")
p14 <- ggplot(df14, aes(time, value, colour = series)) +
  geom_vline(xintercept = 1999, linetype = "dashed", colour = NEAR_BLACK) +
  geom_line(linewidth = 1) +
  facet_wrap(~ outcome, scales = "free_y") +
  scale_colour_manual(values = c(actual = WARM_ORANGE, synthetic = STEEL_BLUE),
                      labels = c(actual = "Germany (actual)", synthetic = "Synthetic Germany")) +
  labs(title = "Two outcomes, one story: TFP up and the USA gap down",
       subtitle = "After 1999, German TFP exceeds its synthetic control while its productivity gap narrows",
       x = "Year", y = "Value",
       caption = "Productivity gap is a log ratio of US to German TFP — lower means closer to the US frontier.") +
  theme_site()
save_fig(p14, "r_sc_multi_country_14_emu_multiout.png", h = 4.5)

# ── 2f. Robustness: 1992 Maastricht threshold ─────────────────────────────────
rule("PART 2f: Robustness — 1992 Maastricht anticipation")

ger_92 <- fit_country("Germany", progfunc = "None", t_int = 1992, trt = "trt92")
ger_lv92 <- synth_levels(ger_92, emu %>% filter(country == "Germany" | treat == 0),
                         "country", "year", "tfp", "Germany")
cat(sprintf("Germany avg ATT — 1999 spec: %+.3f | 1992 spec: %+.3f\n",
            summary(ger_plain)$average_att$Estimate, summary(ger_92)$average_att$Estimate))
df15 <- bind_rows(
  transform(ger_lvp[c("time", "actual")], series = "Germany (actual)"),
  transform(setNames(ger_lvp[c("time", "synthetic")], c("time", "actual")), series = "Synthetic (1999 threshold)"),
  transform(setNames(ger_lv92[c("time", "synthetic")], c("time", "actual")), series = "Synthetic (1992 threshold)"))
p15 <- ggplot(df15, aes(time, actual, colour = series, linetype = series)) +
  geom_vline(xintercept = c(1992, 1999), linetype = "dotted", colour = "grey55") +
  geom_line(linewidth = 1) +
  scale_colour_manual(values = c("Germany (actual)" = WARM_ORANGE,
                                 "Synthetic (1999 threshold)" = STEEL_BLUE,
                                 "Synthetic (1992 threshold)" = TEAL)) +
  scale_linetype_manual(values = c("Germany (actual)" = "solid",
                                   "Synthetic (1999 threshold)" = "solid",
                                   "Synthetic (1992 threshold)" = "22")) +
  labs(title = "Robustness: 1992 (Maastricht) vs 1999 (euro) intervention dates",
       subtitle = "Moving the treatment date earlier to capture anticipation effects barely changes the verdict",
       x = "Year", y = "TFP", caption = "Dotted lines mark 1992 and 1999.") +
  theme_site()
save_fig(p15, "r_sc_multi_country_15_robustness_1992.png")

# ── 2g. Compare to the paper ───────────────────────────────────────────────────
rule("PART 2g: Paper vs ASCM comparison")

comp <- data.frame(country = emu_single$country,
                   paper_2000_07 = emu_single$paper_2000_07,
                   ascm_2000_07  = emu_single$pct_2000_07,
                   paper_2008_17 = emu_single$paper_2008_17,
                   ascm_2008_17  = emu_single$pct_2008_17)
write.csv(comp, "paper_vs_ascm_comparison.csv", row.names = FALSE)
rho <- cor(comp$paper_2000_07, comp$ascm_2000_07, method = "spearman")
pear <- cor(comp$paper_2000_07, comp$ascm_2000_07)
cat(sprintf("Correlation paper vs ASCM (2000-07 TFP %% effect): Spearman %.2f | Pearson %.2f\n",
            rho, pear))
cat(sprintf("Both agree TFP rose for %d of 12 members (ASCM) vs paper's pattern.\n",
            sum(comp$ascm_2000_07 > 0)))

p16 <- ggplot(comp, aes(paper_2000_07, ascm_2000_07)) +
  geom_abline(slope = 1, intercept = 0, linetype = "dashed", colour = "grey55") +
  geom_hline(yintercept = 0, colour = "grey80") + geom_vline(xintercept = 0, colour = "grey80") +
  geom_point(colour = WARM_ORANGE, size = 3) +
  geom_text(aes(label = country), vjust = -0.8, size = 3, colour = NEAR_BLACK) +
  labs(title = "ASCM reproduces the paper's qualitative ranking",
       subtitle = sprintf("TFP %% contribution, 2000-2007: Papaioannou (2021) vs our ASCM estimate (Spearman %.2f)", rho),
       x = "Paper's reported % contribution", y = "ASCM % effect (this tutorial)",
       caption = "Points near the 45-degree line agree; the augsynth donor pool and estimator differ from the paper's.") +
  theme_site()
save_fig(p16, "r_sc_multi_country_16_paper_vs_ascm_scatter.png")

results$emu <- list(
  members = emu_members, donors = donors_emu,
  pooled_att = round(pooled_emu$Estimate, 3),
  pooled_ci = c(round(pooled_emu$lower_bound, 3), round(pooled_emu$upper_bound, 3)),
  pooled_path = list(time = emu_path$Time, est = round(emu_path$Estimate, 3),
                     lo = round(emu_path$lower_bound, 3), hi = round(emu_path$upper_bound, 3)),
  germany = list(att_plain = round(summary(ger_plain)$average_att$Estimate, 3),
                 att_ridge = round(summary(ger_ridge)$average_att$Estimate, 3),
                 pct_2000_07 = round(pct_effect(ger_lvp, 2000, 2007), 1),
                 pct_2008_17 = round(pct_effect(ger_lvp, 2008, 2017), 1),
                 series = list(time = ger_lvp$time, actual = round(ger_lvp$actual, 3),
                               syn_plain = round(ger_lvp$synthetic, 3),
                               syn_ridge = round(ger_lvr$synthetic, 3))),
  per_country = lapply(seq_len(nrow(emu_single)), function(i) as.list(emu_single[i, ])),
  comparison = list(country = comp$country,
                    paper_2000_07 = comp$paper_2000_07, ascm_2000_07 = comp$ascm_2000_07,
                    paper_2008_17 = comp$paper_2008_17, ascm_2008_17 = comp$ascm_2008_17,
                    spearman = round(rho, 2), pearson = round(pear, 2)),
  level_series = lapply(emu_members, function(cn)
    list(country = cn, time = emu_levels[[cn]]$time,
         actual = round(emu_levels[[cn]]$actual, 3),
         synthetic = round(emu_levels[[cn]]$synthetic, 3))))


# ── 3. Write results.json for the web app ─────────────────────────────────────
rule("Writing web_app/data/results.json")
results$meta <- list(generated_by = "analysis.R", seed = 20260605,
                     augsynth_commit = "7a90ea4",
                     palette = list(steel = STEEL_BLUE, orange = WARM_ORANGE,
                                    black = NEAR_BLACK, teal = TEAL))
write_json(results, "web_app/data/results.json", auto_unbox = TRUE,
           digits = 5, pretty = TRUE, null = "null")
cat("Wrote web_app/data/results.json\n")

# Clean up stray Rplots.pdf
if (file.exists("Rplots.pdf")) file.remove("Rplots.pdf")

rule("DONE")
cat("Figures, CSVs and results.json generated successfully.\n")
cat("\nSession info:\n"); print(sessionInfo())
