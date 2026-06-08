# ══════════════════════════════════════════════════════════════════════════════
# The Augmented Synthetic Control Method (ASCM) for a SINGLE treated unit:
# the 2012 Kansas tax cuts, with the augsynth package.
#
# This script powers the tutorial post `r_augsynth`. It estimates the effect of
# the 2012 Kansas personal-income-tax cuts (Brownback) on log GSP per capita,
# building the counterfactual three ways and stress-testing significance four ways.
#
#   1. Classic SCM            progfunc = "None"   (convex donor weights only)
#   2. Ridge-augmented SCM    progfunc = "Ridge"  (de-biases imperfect pre-fit)
#   3. Covariate-augmented    y ~ trt | Z         (balances 6 auxiliary covariates)
#   (+ short notes: residualized covariates, and a unit fixed-effect model)
#
# Estimand: ATT (average treatment effect on the treated) — the post-2012 gap
#           between Kansas's actual log GSP per capita and its synthetic control.
#
# Inference toolbox (all run on the Ridge-ASCM fit, which supports standard errors):
#   * conformal   — augsynth default: invert a sharp-null test, pointwise CIs + p.
#   * jackknife+   — leave-one-pre-period-out predictive interval for the avg effect.
#   * jackknife    — leave-one-donor-out standard error (Wald CI).
#   * permutation  — classic placebo / RMSPE-ratio test over the donor pool.
#
# Usage:  cd content/post/r_augsynth && Rscript analysis.R 2>&1 | tee execution_log.txt
# Output: r_augsynth_*.png (10 figures), kansas_*.csv, web_app/data/results.json
#
# Data: kansas.csv (50 states x 105 quarters, 1990Q1-2016Q1) is shipped in this
#       folder and loaded from a GitHub raw URL with a local fallback. It is the
#       `kansas` dataset that ships with augsynth, written out once to CSV.
#
# augsynth is NOT on CRAN — install with:
#   remotes::install_github("ebenmichael/augsynth")
# Verified with: R 4.5.2, augsynth 0.2.0.
#
# References:
#   - Abadie, Diamond & Hainmueller (2010). Synthetic Control Methods. JASA.
#   - Ben-Michael, Feller & Rothstein (2021). The Augmented Synthetic Control
#     Method. JASA 116(536), 1789-1803.
#   - Chernozhukov, Wuthrich & Zhu (2021). An exact and robust conformal
#     inference method for counterfactual and synthetic controls. JASA.
# ══════════════════════════════════════════════════════════════════════════════

# ── 0. Setup ──────────────────────────────────────────────────────────────────

required <- c("augsynth", "dplyr", "tidyr", "ggplot2", "readr", "purrr", "jsonlite")
missing  <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop("Missing packages: ", paste(missing, collapse = ", "),
       "\nInstall augsynth with: remotes::install_github('ebenmichael/augsynth')")
}

suppressPackageStartupMessages({
  library(augsynth)
  library(dplyr)
  library(tidyr)
  library(ggplot2)
  library(readr)
  library(purrr)
  library(jsonlite)
})

SEED <- 20260608
set.seed(SEED)

# Site accent palette (data series — bright enough to read on dark navy)
STEEL_BLUE  <- "#6a9bcc"   # synthetic control / SCM
WARM_ORANGE <- "#d97757"   # treated (Kansas) / actual
TEAL        <- "#00d4c8"   # ridge-augmented / highlight
# Dark theme palette (matches the site's dark-mode background, #0f1729)
DARK_BG      <- "#0f1729"  # figure background
DARK_PANEL   <- "#1f2b5e"  # grid lines
LIGHT_TEXT   <- "#c8d0e0"  # axis text, labels, treatment lines, value labels
LIGHTER_TEXT <- "#e8ecf2"  # titles / strip headings
MUTED        <- "#8b9dc3"  # captions, secondary annotations, zero-reference lines
GREY_DONOR   <- "#54618a"  # donor / placebo spaghetti (recessive on navy)

TREAT_TIME <- 2012.25      # Q2 2012 — the tax cut takes effect
KS_FIPS    <- 20           # Kansas FIPS code (the treated unit)

theme_site <- function(base = 13) {
  theme_minimal(base_size = base) %+replace%
    theme(
      text             = element_text(colour = LIGHTER_TEXT),
      plot.title       = element_text(face = "bold", colour = LIGHTER_TEXT,
                                       size = base + 1, hjust = 0,
                                       margin = margin(b = 4)),
      plot.subtitle    = element_text(colour = LIGHT_TEXT, size = base - 2,
                                      hjust = 0, margin = margin(b = 8)),
      plot.caption     = element_text(colour = MUTED, size = base - 4,
                                      hjust = 0, margin = margin(t = 8)),
      plot.background  = element_rect(fill = DARK_BG, colour = NA),
      panel.background = element_rect(fill = DARK_BG, colour = NA),
      axis.title       = element_text(colour = LIGHT_TEXT, size = base - 2),
      axis.text        = element_text(colour = LIGHT_TEXT, size = base - 3),
      panel.grid.major = element_line(colour = DARK_PANEL, linewidth = 0.3),
      panel.grid.minor = element_blank(),
      legend.position  = "bottom",
      legend.title     = element_blank(),
      legend.background = element_rect(fill = DARK_BG, colour = NA),
      legend.key        = element_rect(fill = DARK_BG, colour = NA),
      legend.text      = element_text(colour = LIGHT_TEXT),
      strip.text       = element_text(face = "bold", colour = LIGHTER_TEXT,
                                      size = base - 3)
    )
}

save_fig <- function(plot, file, w = 8, h = 6) {
  ggsave(file, plot, width = w, height = h, dpi = 300, bg = DARK_BG)
  cat("  [figure] ", file, "\n", sep = "")
}

rule <- function(txt) cat("\n", strrep("=", 78), "\n", txt, "\n",
                          strrep("=", 78), "\n", sep = "")

# Pull the per-period ATT table (Time, Estimate, lower_bound, upper_bound, p_val)
# out of a summary.augsynth object and flag post-treatment periods.
att_table <- function(s) {
  d <- s$att
  d$post <- d$Time >= TREAT_TIME
  d
}

# Synthetic-control LEVELS (actual Kansas vs its synthetic Y(0)) from a fit.
synth_levels <- function(fit) {
  syn <- predict(fit, att = FALSE)                      # synthetic Y(0), named by time
  data.frame(time = as.numeric(names(syn)), synthetic = as.numeric(syn))
}

dir.create("web_app/data", recursive = TRUE, showWarnings = FALSE)
results <- list()


# ── 1. Load the Kansas panel ──────────────────────────────────────────────────
rule("1. Load Kansas panel (GitHub raw URL with local fallback)")

data_url  <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_augsynth/kansas.csv"
local_csv <- "kansas.csv"
kansas <- tryCatch({
  if (file.exists(local_csv)) {
    message("Loading local kansas.csv"); read_csv(local_csv, show_col_types = FALSE)
  } else {
    message("Loading kansas.csv from GitHub"); read_csv(data_url, show_col_types = FALSE)
  }
}, error = function(e) {
  message("Falling back to data(kansas) from the augsynth package")
  data(kansas, package = "augsynth"); get("kansas")
})
kansas <- as.data.frame(kansas)

n_states <- length(unique(kansas$fips))
periods  <- sort(unique(kansas$year_qtr))
n_pre    <- sum(periods <  TREAT_TIME)
n_post   <- sum(periods >= TREAT_TIME)
cat(sprintf("Panel: %d states x %d quarters = %d rows (%s to %s)\n",
            n_states, length(periods), nrow(kansas), min(periods), max(periods)))
cat(sprintf("Pre-treatment quarters: %d | Post-treatment quarters: %d\n", n_pre, n_post))
cat(sprintf("Treated unit: %s (fips %d), treated from year_qtr %.2f\n",
            unique(kansas$state[kansas$fips == KS_FIPS]), KS_FIPS, TREAT_TIME))

# The treatment-status rows around the 2012 intervention (reproduces the vignette).
cat("\nKansas around the intervention:\n")
kansas %>%
  select(year, qtr, year_qtr, state, treated, gdp, lngdpcapita) %>%
  filter(state == "Kansas" & year_qtr >= 2012 & year_qtr < 2013) %>%
  print(row.names = FALSE)

state_lookup <- unique(kansas[, c("fips", "state", "abb")])


# ── 2. EDA: raw outcome paths ─────────────────────────────────────────────────
rule("2. EDA — raw log GSP per capita paths")

kansas$kind <- ifelse(kansas$fips == KS_FIPS, "Kansas (treated)", "Donor state")
p01 <- ggplot() +
  geom_line(data = filter(kansas, fips != KS_FIPS),
            aes(year_qtr, lngdpcapita, group = fips), colour = GREY_DONOR, linewidth = 0.35) +
  geom_line(data = filter(kansas, fips == KS_FIPS),
            aes(year_qtr, lngdpcapita), colour = WARM_ORANGE, linewidth = 1.1) +
  geom_vline(xintercept = TREAT_TIME, linetype = "dashed", colour = LIGHT_TEXT) +
  annotate("text", x = TREAT_TIME - 0.5, y = min(kansas$lngdpcapita) + 0.05,
           label = "tax cut\n(2012 Q2)", hjust = 1, size = 3.2, colour = LIGHT_TEXT) +
  labs(title = "Kansas sits mid-pack: no single state is its twin",
       subtitle = "Log GSP per capita, 1990 Q1 - 2016 Q1. Kansas (orange) against 49 donor states (grey)",
       x = "Year (quarterly)", y = "log GSP per capita",
       caption = "Source: kansas.csv (augsynth). The dashed line marks the 2012 Q2 tax cut.") +
  theme_site()
save_fig(p01, "r_augsynth_01_raw_paths.png")


# ── 3. Classic SCM (progfunc = "None") ────────────────────────────────────────
rule("3. Classic synthetic control — progfunc = 'None'")

syn <- augsynth(lngdpcapita ~ treated, fips, year_qtr, kansas,
                progfunc = "None", scm = TRUE)
set.seed(SEED)
s_syn <- summary(syn)                                    # conformal inference (default)

scm_att   <- s_syn$average_att$Estimate
scm_p     <- s_syn$average_att$p_val
scm_l2    <- syn$l2_imbalance
scm_pct   <- (1 - syn$scaled_l2_imbalance) * 100
cat(sprintf("Classic SCM | avg ATT %+.4f (joint-null p = %.3f) | L2 imbalance %.3f | %.1f%% better than uniform\n",
            scm_att, scm_p, scm_l2, scm_pct))

# Donor weights (sparse, non-negative): map fips -> state for readability.
w_scm <- data.frame(fips = as.integer(rownames(syn$weights)),
                    weight = as.numeric(syn$weights[, 1]))
w_scm <- merge(w_scm, state_lookup, by = "fips")
w_scm <- w_scm[w_scm$weight > 1e-3, ]
w_scm <- w_scm[order(-w_scm$weight), ]
cat(sprintf("Donor states used: %d (weights %.3f to %.3f)\n",
            nrow(w_scm), min(w_scm$weight), max(w_scm$weight)))
print(w_scm[, c("state", "abb", "weight")], row.names = FALSE)
write_csv(w_scm[, c("fips", "state", "abb", "weight")], "kansas_donor_weights.csv")

scm_tab <- att_table(s_syn)
write_csv(scm_tab[, c("Time", "Estimate", "lower_bound", "upper_bound", "p_val")],
          "kansas_scm_att.csv")

# Figure 02 — actual Kansas vs synthetic control (the counterfactual you can see)
lv_scm <- synth_levels(syn)
act    <- kansas[kansas$fips == KS_FIPS, c("year_qtr", "lngdpcapita")]
names(act) <- c("time", "actual")
lv_merge <- merge(act, lv_scm, by = "time")            # aligned by time (robust to row order)
df02 <- lv_merge %>%
  pivot_longer(c(actual, synthetic), names_to = "series", values_to = "value")
p02 <- ggplot(df02, aes(time, value, colour = series)) +
  geom_vline(xintercept = TREAT_TIME, linetype = "dashed", colour = LIGHT_TEXT) +
  geom_line(linewidth = 1.05) +
  scale_colour_manual(values = c(actual = WARM_ORANGE, synthetic = STEEL_BLUE),
                      labels = c(actual = "Kansas (actual)",
                                 synthetic = "Synthetic Kansas (SCM)")) +
  labs(title = "Building a counterfactual: Kansas vs its synthetic control",
       subtitle = "Before 2012 the synthetic tracks Kansas closely; after 2012 the gap is the estimated effect",
       x = "Year (quarterly)", y = "log GSP per capita",
       caption = "Synthetic Kansas is a weighted blend of donor states matching the pre-2012 path.") +
  theme_site()
save_fig(p02, "r_augsynth_02_actual_vs_synthetic.png")

# Figure 03 — SCM gap with conformal pointwise band
p03 <- ggplot(scm_tab, aes(Time)) +
  geom_hline(yintercept = 0, colour = MUTED) +
  geom_vline(xintercept = TREAT_TIME, linetype = "dashed", colour = LIGHT_TEXT) +
  geom_ribbon(data = subset(scm_tab, !is.na(lower_bound)),
              aes(ymin = lower_bound, ymax = upper_bound), fill = STEEL_BLUE, alpha = 0.20) +
  geom_line(aes(y = Estimate), colour = STEEL_BLUE, linewidth = 1) +
  annotate("text", x = TREAT_TIME + 0.3, y = max(scm_tab$Estimate, na.rm = TRUE),
           label = "post-treatment effect", hjust = 0, size = 3.2, colour = LIGHT_TEXT) +
  labs(title = "Classic SCM: the Kansas treatment-effect gap",
       subtitle = sprintf("Actual minus synthetic, with the conformal 95%% band. Average post-2012 ATT = %+.3f", scm_att),
       x = "Year (quarterly)", y = "Gap in log GSP per capita (ATT)",
       caption = "Shaded band = pointwise conformal interval. Pre-2012 the gap hovers around zero (good fit).") +
  theme_site()
save_fig(p03, "r_augsynth_03_scm_gap.png")

# Figure 04 — donor weights
p04 <- ggplot(w_scm, aes(reorder(paste0(state, " (", abb, ")"), weight), weight)) +
  geom_col(fill = STEEL_BLUE) +
  geom_text(aes(label = sprintf("%.3f", weight)), hjust = -0.15, size = 3.2, colour = LIGHT_TEXT) +
  coord_flip() +
  scale_y_continuous(expand = expansion(mult = c(0, 0.12))) +
  labs(title = "Who is in 'Synthetic Kansas'?",
       subtitle = sprintf("Classic SCM uses %d donor states with non-negative weights that sum to one", nrow(w_scm)),
       x = NULL, y = "SCM weight",
       caption = "Only states with weight > 0.001 are shown. Most donors get exactly zero weight (sparsity).") +
  theme_site()
save_fig(p04, "r_augsynth_04_donor_weights.png")


# ── 4. Ridge-augmented SCM (progfunc = "Ridge") ───────────────────────────────
rule("4. Ridge-augmented SCM — progfunc = 'Ridge'")

asyn <- augsynth(lngdpcapita ~ treated, fips, year_qtr, kansas,
                 progfunc = "Ridge", scm = TRUE)
set.seed(SEED)
s_asyn <- summary(asyn)

ridge_att  <- s_asyn$average_att$Estimate
ridge_p    <- s_asyn$average_att$p_val
ridge_l2   <- asyn$l2_imbalance
ridge_pct  <- (1 - asyn$scaled_l2_imbalance) * 100
ridge_bias <- mean(s_asyn$bias_est)
ridge_lam  <- asyn$lambda
cat(sprintf("Ridge ASCM | avg ATT %+.4f (joint-null p = %.3f) | L2 %.3f | %.1f%% | est. bias %+.4f | lambda %.4f\n",
            ridge_att, ridge_p, ridge_l2, ridge_pct, ridge_bias, ridge_lam))

# How far did augmentation move the weights? (paper: RMS difference ~ 0.01)
w_ridge <- as.numeric(asyn$weights[, 1])
w_scm_full <- as.numeric(syn$weights[, 1])
rms_wdiff <- sqrt(mean((w_ridge - w_scm_full)^2))
neg_donors <- sum(w_ridge < -1e-3)
cat(sprintf("RMS weight change SCM -> Ridge: %.4f | donors with negative weight: %d\n",
            rms_wdiff, neg_donors))

ridge_tab <- att_table(s_asyn)
write_csv(ridge_tab[, c("Time", "Estimate", "lower_bound", "upper_bound", "p_val")],
          "kansas_ridge_att.csv")

# Figure 05 — cross-validation curve for lambda (rebuilt from the cv plot data)
cv_df <- plot(asyn, plot_type = "cv")$data
min_err   <- min(cv_df$errors)
se_at_min <- cv_df$errors_se[which.min(cv_df$errors)]
thresh    <- min_err + se_at_min
p05 <- ggplot(cv_df, aes(lambdas, errors)) +
  geom_ribbon(aes(ymin = errors - errors_se, ymax = errors + errors_se),
              fill = STEEL_BLUE, alpha = 0.15) +
  geom_line(colour = STEEL_BLUE, linewidth = 0.9) +
  geom_point(colour = STEEL_BLUE, size = 1.4) +
  geom_hline(yintercept = thresh, linetype = "dotted", colour = LIGHT_TEXT) +
  geom_vline(xintercept = ridge_lam, linetype = "dashed", colour = WARM_ORANGE) +
  annotate("text", x = ridge_lam, y = max(cv_df$errors),
           label = sprintf("  chosen lambda = %.3f\n  (1-SE rule)", ridge_lam),
           hjust = 0, size = 3.1, colour = WARM_ORANGE) +
  scale_x_log10() +
  labs(title = "Choosing the ridge dial by cross-validation",
       subtitle = "Leave-one-pre-period-out CV error vs the penalty lambda; the 1-SE rule picks the largest safe lambda",
       x = "lambda (log scale) — larger = closer to plain SCM",
       y = "Cross-validation MSE",
       caption = "Dotted line = minimum CV error + 1 SE. The chosen lambda is the largest within that band.") +
  theme_site()
save_fig(p05, "r_augsynth_05_cv_lambda.png")

# Figure 06 — SCM vs Ridge-ASCM gap overlay
gap_overlay <- bind_rows(
  transform(scm_tab[, c("Time", "Estimate")],   method = "Classic SCM"),
  transform(ridge_tab[, c("Time", "Estimate")], method = "Ridge ASCM"))
p06 <- ggplot(gap_overlay, aes(Time, Estimate, colour = method)) +
  geom_hline(yintercept = 0, colour = MUTED) +
  geom_vline(xintercept = TREAT_TIME, linetype = "dashed", colour = LIGHT_TEXT) +
  geom_line(linewidth = 1.05) +
  scale_colour_manual(values = c("Classic SCM" = STEEL_BLUE, "Ridge ASCM" = TEAL)) +
  labs(title = "Augmentation deepens the estimated effect",
       subtitle = sprintf("Average ATT moves from %+.3f (SCM) to %+.3f (Ridge), after de-biasing imperfect pre-fit",
                          scm_att, ridge_att),
       x = "Year (quarterly)", y = "Gap in log GSP per capita (ATT)",
       caption = "Both gaps share the same donor pool; ridge corrects the residual pre-treatment imbalance.") +
  theme_site()
save_fig(p06, "r_augsynth_06_scm_vs_ascm_gap.png")

# Figure 07 — pre-treatment imbalance (where SCM struggles, ridge corrects)
pre_gap <- subset(gap_overlay, Time < TREAT_TIME)
p07 <- ggplot(pre_gap, aes(Time, Estimate, colour = method)) +
  geom_hline(yintercept = 0, colour = MUTED) +
  geom_line(linewidth = 0.85) +
  scale_colour_manual(values = c("Classic SCM" = STEEL_BLUE, "Ridge ASCM" = TEAL)) +
  labs(title = "Why augment? The pre-treatment imbalance SCM leaves behind",
       subtitle = sprintf("Pre-2012 gap, ideally zero. SCM L2 = %.3f vs Ridge L2 = %.3f; the mid-2000s is hardest",
                          scm_l2, ridge_l2),
       x = "Year (quarterly, pre-treatment only)", y = "Pre-treatment gap (imbalance)",
       caption = "A perfect fit would sit on zero everywhere. Ridge shrinks the largest deviations.") +
  theme_site()
save_fig(p07, "r_augsynth_07_prefit_imbalance.png")


# ── 5. Covariate-augmented ASCM (+ residualized, + fixed effects) ─────────────
rule("5. Covariate-augmented ASCM and two short variants")

cov_formula <- lngdpcapita ~ treated | lngdpcapita + log(revstatecapita) +
  log(revlocalcapita) + log(avgwklywagecapita) + estabscapita + emplvlcapita

covsyn <- augsynth(cov_formula, fips, year_qtr, kansas, progfunc = "ridge", scm = TRUE)
set.seed(SEED)
s_cov <- summary(covsyn)
cov_att   <- s_cov$average_att$Estimate
cov_p     <- s_cov$average_att$p_val
cov_l2    <- covsyn$l2_imbalance
cov_pct   <- (1 - covsyn$scaled_l2_imbalance) * 100
cov_covl2 <- covsyn$covariate_l2_imbalance
cov_covpct<- (1 - covsyn$scaled_covariate_l2_imbalance) * 100
cov_bias  <- mean(s_cov$bias_est)
cat(sprintf("Covariate ASCM | avg ATT %+.4f (p = %.3f) | outcome L2 %.3f (%.1f%%) | covariate L2 %.3f (%.1f%%) | bias %+.4f\n",
            cov_att, cov_p, cov_l2, cov_pct, cov_covl2, cov_covpct, cov_bias))

# Short variant 1: residualize outcomes on covariates first, then Ridge ASCM.
covsyn_resid <- augsynth(cov_formula, fips, year_qtr, kansas,
                         progfunc = "ridge", scm = TRUE,
                         lambda = asyn$lambda, residualize = TRUE)
set.seed(SEED)
s_resid <- summary(covsyn_resid)
resid_att <- s_resid$average_att$Estimate
resid_p   <- s_resid$average_att$p_val
resid_covl2 <- covsyn_resid$covariate_l2_imbalance
cat(sprintf("Residualized   | avg ATT %+.4f (p = %.3f) | covariate L2 %.4f (perfect balance)\n",
            resid_att, resid_p, resid_covl2))

# Short variant 2: unit fixed-effect outcome model (de-meaning).
desyn <- augsynth(lngdpcapita ~ treated, fips, year_qtr, kansas,
                  progfunc = "none", scm = TRUE, fixedeff = TRUE)
set.seed(SEED)
s_de <- summary(desyn)
de_att <- s_de$average_att$Estimate
de_p   <- s_de$average_att$p_val
cat(sprintf("Fixed effects  | avg ATT %+.4f (p = %.3f) | L2 %.3f\n",
            de_att, de_p, desyn$l2_imbalance))


# ── 6. Inference four ways (all on the Ridge-ASCM fit) ────────────────────────
rule("6. Inference — conformal, jackknife+, jackknife, permutation")

set.seed(SEED); s_jkp  <- summary(asyn, inf_type = "jackknife+")
set.seed(SEED); s_jk   <- summary(asyn, inf_type = "jackknife")
set.seed(SEED); s_perm <- summary(asyn, inf_type = "permutation")

jkp_lo <- s_jkp$average_att$lower_bound
jkp_hi <- s_jkp$average_att$upper_bound
jk_se  <- s_jk$average_att$Std.Error
jk_lo  <- ridge_att - 1.96 * jk_se
jk_hi  <- ridge_att + 1.96 * jk_se

# Permutation / placebo: estimate a synthetic control for every donor as if it
# were treated, then compare Kansas's post/pre RMSPE ratio to that distribution.
placebo <- plot(s_perm, plot_type = "placebo")$data   # ATT per unit/time; trt_status in {Control, Treatment}
ratios <- placebo %>%
  group_by(fips, trt_status) %>%
  summarise(pre_rmspe  = sqrt(mean(ATT[year_qtr <  TREAT_TIME]^2)),
            post_rmspe = sqrt(mean(ATT[year_qtr >= TREAT_TIME]^2)), .groups = "drop") %>%
  mutate(ratio = post_rmspe / pre_rmspe)
ks_ratio <- ratios$ratio[ratios$trt_status == "Treatment"]   # Kansas's post/pre RMSPE ratio
perm_p   <- mean(ratios$ratio >= ks_ratio, na.rm = TRUE)      # rank of Kansas (incl. itself)
cat(sprintf("Conformal   : ATT %+.4f, joint-null p = %.3f (no average CI)\n", ridge_att, ridge_p))
cat(sprintf("Jackknife+  : ATT %+.4f, 95%% CI [%.4f, %.4f] %s\n",
            ridge_att, jkp_lo, jkp_hi, ifelse(sign(jkp_lo) == sign(jkp_hi), "excludes 0", "includes 0")))
cat(sprintf("Jackknife   : ATT %+.4f, SE %.4f, Wald CI [%.4f, %.4f] %s\n",
            ridge_att, jk_se, jk_lo, jk_hi, ifelse(sign(jk_lo) == sign(jk_hi), "excludes 0", "includes 0")))
cat(sprintf("Permutation : RMSPE ratio for Kansas = %.2f, placebo p = %.3f (rank %d of %d)\n",
            ks_ratio, perm_p, sum(ratios$ratio >= ks_ratio), nrow(ratios)))

inf_df <- data.frame(
  method   = c("Conformal", "Jackknife+", "Jackknife (SE)", "Permutation (RMSPE)"),
  estimate = c(ridge_att, ridge_att, ridge_att, ridge_att),
  lower    = c(NA, jkp_lo, jk_lo, NA),
  upper    = c(NA, jkp_hi, jk_hi, NA),
  p_val    = c(ridge_p, NA, NA, perm_p),
  stringsAsFactors = FALSE)
write_csv(inf_df, "kansas_inference_summary.csv")
write_csv(ratios %>% left_join(state_lookup %>% mutate(fips = as.character(fips)), by = "fips"),
          "kansas_placebo_distribution.csv")

# Figure 08 — placebo distribution (spaghetti)
p08 <- ggplot() +
  geom_hline(yintercept = 0, colour = MUTED) +
  geom_vline(xintercept = TREAT_TIME, linetype = "dashed", colour = LIGHT_TEXT) +
  geom_line(data = filter(placebo, trt_status == "Control"),
            aes(year_qtr, ATT, group = fips), colour = GREY_DONOR, linewidth = 0.3, alpha = 0.7) +
  geom_line(data = filter(placebo, trt_status == "Treatment"),
            aes(year_qtr, ATT), colour = WARM_ORANGE, linewidth = 1.2) +
  annotate("text", x = 1991, y = max(placebo$ATT) * 0.85,
           label = "each grey line = one donor\ntreated as a placebo", hjust = 0,
           size = 3.0, colour = MUTED) +
  labs(title = "Placebo test: is the Kansas gap unusual?",
       subtitle = sprintf("Kansas (orange) vs %d donor placebos. Permutation p = %.3f", nrow(ratios) - 1, perm_p),
       x = "Year (quarterly)", y = "Estimated gap (ATT)",
       caption = "Re-estimate the effect pretending each donor was treated. A real effect makes Kansas stand out.") +
  theme_site()
save_fig(p08, "r_augsynth_08_placebo_spaghetti.png")

# Figure 09 — the four inference methods side by side
inf_df$method <- factor(inf_df$method, levels = rev(inf_df$method))
p09 <- ggplot(inf_df, aes(estimate, method)) +
  geom_vline(xintercept = 0, linetype = "dashed", colour = LIGHT_TEXT) +
  geom_segment(aes(x = lower, xend = upper, y = method, yend = method),
               colour = STEEL_BLUE, linewidth = 0.9, na.rm = TRUE) +
  geom_point(size = 3, colour = WARM_ORANGE) +
  geom_text(aes(label = ifelse(is.na(p_val), "", sprintf("p = %.3f", p_val))),
            vjust = -1.1, size = 3.1, colour = LIGHT_TEXT, na.rm = TRUE) +
  labs(title = "Same effect, four ways to judge it",
       subtitle = sprintf("Average ATT = %+.3f. Jackknife+ excludes zero; the others are borderline", ridge_att),
       x = "Average treatment effect on the treated (ATT)", y = NULL,
       caption = "Bars = 95% intervals (jackknife+ and jackknife). Conformal and permutation report p-values.") +
  theme_site()
save_fig(p09, "r_augsynth_09_inference_compare.png")


# ── 7. Results comparison across the five specifications ──────────────────────
rule("7. Model comparison across five specifications")

model_comp <- data.frame(
  spec      = c("Classic SCM", "Ridge ASCM", "Covariate ASCM",
                "Residualized", "Fixed effects"),
  att       = c(scm_att, ridge_att, cov_att, resid_att, de_att),
  p_val     = c(scm_p, ridge_p, cov_p, resid_p, de_p),
  l2        = c(syn$l2_imbalance, asyn$l2_imbalance, covsyn$l2_imbalance,
                covsyn_resid$l2_imbalance, desyn$l2_imbalance),
  pct_impr  = c((1 - syn$scaled_l2_imbalance) * 100, (1 - asyn$scaled_l2_imbalance) * 100,
                (1 - covsyn$scaled_l2_imbalance) * 100, (1 - covsyn_resid$scaled_l2_imbalance) * 100,
                (1 - desyn$scaled_l2_imbalance) * 100),
  est_bias  = c(NA, ridge_bias, cov_bias, mean(s_resid$bias_est), NA),
  stringsAsFactors = FALSE)
model_comp[, c("att", "l2", "pct_impr", "est_bias")] <-
  round(model_comp[, c("att", "l2", "pct_impr", "est_bias")], 4)
print(model_comp, row.names = FALSE)
write_csv(model_comp, "kansas_model_comparison.csv")

# Figure 10 — average ATT across specifications
model_comp$spec <- factor(model_comp$spec, levels = rev(model_comp$spec))
p10 <- ggplot(model_comp, aes(att, spec)) +
  geom_vline(xintercept = 0, linetype = "dashed", colour = LIGHT_TEXT) +
  geom_segment(aes(x = 0, xend = att, y = spec, yend = spec), colour = GREY_DONOR) +
  geom_point(aes(colour = att), size = 4) +
  geom_text(aes(label = sprintf("%+.3f  (L2 %.3f)", att, l2)),
            vjust = -1.4, size = 3.0, colour = LIGHT_TEXT) +
  scale_colour_gradient(low = WARM_ORANGE, high = STEEL_BLUE, guide = "none") +
  scale_x_continuous(expand = expansion(mult = c(0.14, 0.12))) +
  labs(title = "The estimate grows as we augment and balance",
       subtitle = "Average ATT (log GSP per capita) across the five specifications, with pre-fit L2 imbalance",
       x = "Average treatment effect on the treated (ATT)", y = NULL,
       caption = "More de-biasing (ridge, then covariates) pushes the estimate more negative while improving pre-fit.") +
  theme_site()
save_fig(p10, "r_augsynth_10_model_comparison.png")


# ── 8. Collect results for the web app + final summary ────────────────────────
rule("8. Summary")

results$meta <- list(treated = "Kansas", t_int = TREAT_TIME, outcome = "lngdpcapita",
                     n_states = n_states, n_pre = n_pre, n_post = n_post,
                     n_donors_scm = nrow(w_scm))
results$scm   <- list(att = round(scm_att, 4), p = round(scm_p, 3),
                      l2 = round(scm_l2, 4), pct = round(scm_pct, 1))
results$ridge <- list(att = round(ridge_att, 4), p = round(ridge_p, 3),
                      l2 = round(ridge_l2, 4), pct = round(ridge_pct, 1),
                      bias = round(ridge_bias, 4), lambda = round(ridge_lam, 4),
                      rms_wdiff = round(rms_wdiff, 4))
results$weights <- list(state = w_scm$state, abb = w_scm$abb, weight = round(w_scm$weight, 4))
results$scm_gap   <- list(time = scm_tab$Time, est = round(scm_tab$Estimate, 4),
                          lo = round(scm_tab$lower_bound, 4), hi = round(scm_tab$upper_bound, 4))
results$ridge_gap <- list(time = ridge_tab$Time, est = round(ridge_tab$Estimate, 4),
                          lo = round(ridge_tab$lower_bound, 4), hi = round(ridge_tab$upper_bound, 4))
results$levels    <- list(time = lv_merge$time,
                          actual = round(lv_merge$actual, 4),
                          synthetic = round(lv_merge$synthetic, 4))
results$inference <- list(method = inf_df$method, estimate = round(inf_df$estimate, 4),
                          lower = round(inf_df$lower, 4), upper = round(inf_df$upper, 4),
                          p_val = round(inf_df$p_val, 4), perm_p = round(perm_p, 4),
                          ks_ratio = round(ks_ratio, 3))
results$placebo   <- list(fips = ratios$fips, trt = ratios$trt_status,
                          ratio = round(ratios$ratio, 3))
results$model_comparison <- lapply(seq_len(nrow(model_comp)), function(i) as.list(model_comp[i, ]))
results$cv <- list(lambdas = signif(cv_df$lambdas, 5), errors = signif(cv_df$errors, 5),
                   chosen = round(ridge_lam, 4))
write_json(results, "web_app/data/results.json", auto_unbox = TRUE, digits = 6,
           pretty = TRUE, na = "null")   # NA -> JSON null (so the web app reads real nulls)
cat("Saved web_app/data/results.json\n")

if (file.exists("Rplots.pdf")) file.remove("Rplots.pdf")

cat(sprintf("\nHEADLINE: the 2012 Kansas tax cut is associated with a persistent shortfall in\n"))
cat(sprintf("log GSP per capita. Classic SCM: %+.3f (p %.3f). Ridge ASCM: %+.3f (p %.3f).\n",
            scm_att, scm_p, ridge_att, ridge_p))
cat(sprintf("Covariate-augmented: %+.3f. Jackknife+ CI [%.3f, %.3f]; permutation p = %.3f.\n",
            cov_att, jkp_lo, jkp_hi, perm_p))
cat("\nDONE. 10 figures + 6 CSVs + results.json written.\n")
sessionInfo()
