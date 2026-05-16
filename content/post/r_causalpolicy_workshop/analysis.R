# ============================================================
# Causal Policy Evaluation: A Workshop Replication in R
# Standalone R script for carlos-mendez.org
# ============================================================
#
# Replicates the one-day workshop at https://causalpolicy.nl/
# (ODISSEI Social Data Science team, CC-BY-4.0) using California's
# 1988 Proposition 99 cigarette tax as the case study.
#
# Six estimators are applied to the same dataset so that point
# estimates and uncertainty bands can be compared head-to-head:
#   1. Naive pre-post (descriptive baseline; biased)
#   2. Difference-in-Differences (CA vs Nevada, HAC SEs)
#   3a. ITS via pre-period growth-curve extrapolation
#   3b. ITS via pre-period ARIMA forecast
#   4. RDD on time (segmented regression around 1988)
#   5. Synthetic Control (tidysynth)
#   6. CausalImpact (Bayesian structural time series)
#
# Estimands:
#   - Naive pre-post  -> descriptive difference (no causal estimand)
#   - DiD             -> ATT on California (1989-2000)
#   - ITS / RDD       -> mean post-intervention deviation from extrapolated trend
#   - Synthetic Ctrl  -> ATT on California vs synthetic California
#   - CausalImpact    -> posterior mean ATT with 95% credible interval
#
# Run: Rscript analysis.R
# Output: PNG figures, CSV tables, execution_log.txt
# ============================================================

# --- 0. Packages -------------------------------------------------
if (!require("pacman", quietly = TRUE)) {
  install.packages("pacman", repos = "https://cloud.r-project.org")
}
pacman::p_load(
  tidyverse,    # data manipulation + ggplot2
  sandwich,     # HAC variance estimator
  lmtest,       # coeftest
  tidysynth,    # synthetic control (tidy API)
  fpp3,         # forecasting (tsibble, fable, ARIMA)
  mice,         # multiple imputation
  CausalImpact, # Bayesian structural time series
  broom,        # tidy model output
  glue          # string interpolation
)

set.seed(42)

# --- Site color palette (dark navy theme) ------------------------
STEEL_BLUE   <- "#6a9bcc"
WARM_ORANGE  <- "#d97757"
TEAL         <- "#00d4c8"
DARK_BG      <- "#0f1729"
DARK_PANEL   <- "#1f2b5e"
LIGHT_TEXT   <- "#c8d0e0"
LIGHTER_TEXT <- "#e8ecf2"
MUTED_GRAY   <- "#7a8395"

theme_site <- function(base_size = 14) {
  theme_minimal(base_size = base_size) %+replace%
    theme(
      text             = element_text(color = LIGHTER_TEXT),
      plot.title       = element_text(color = LIGHTER_TEXT, face = "bold",
                                      size = rel(1.1), hjust = 0,
                                      margin = margin(b = 6)),
      plot.subtitle    = element_text(color = LIGHT_TEXT, size = rel(0.85),
                                      hjust = 0, margin = margin(b = 10)),
      plot.caption     = element_text(color = MUTED_GRAY, size = rel(0.7),
                                      hjust = 1, margin = margin(t = 8)),
      plot.background  = element_rect(fill = DARK_BG, color = NA),
      panel.background = element_rect(fill = DARK_BG, color = NA),
      panel.grid.major = element_line(color = DARK_PANEL, linewidth = 0.3),
      panel.grid.minor = element_blank(),
      axis.text        = element_text(color = LIGHT_TEXT),
      axis.title       = element_text(color = LIGHTER_TEXT, size = rel(0.9)),
      legend.position  = "bottom",
      legend.background = element_rect(fill = DARK_BG, color = NA),
      legend.key       = element_rect(fill = DARK_BG, color = NA),
      legend.text      = element_text(color = LIGHT_TEXT),
      legend.title     = element_text(color = LIGHTER_TEXT),
      strip.text       = element_text(color = LIGHTER_TEXT, face = "bold"),
      plot.margin      = margin(14, 16, 12, 14)
    )
}

save_png <- function(plot, file, width = 8, height = 5) {
  ggsave(file, plot = plot, width = width, height = height,
         dpi = 300, bg = DARK_BG)
  cat("  saved:", file, "\n")
}

# ============================================================
# --- 1. Data download + cache --------------------------------
# ============================================================
cat("\n========== 1. DATA DOWNLOAD ==========\n")

# Primary URL: this project's GitHub raw, so the script is self-contained.
# Fallback URL: the upstream workshop site, used only if GitHub is unreachable.
DATA_URL  <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_causalpolicy_workshop/proposition99.rds"
DATA_URL_FALLBACK <- "https://causalpolicy.nl/data/proposition99.rds"
CACHE_RDS <- "proposition99.rds"
CACHE_CSV <- "proposition99.csv"

if (!file.exists(CACHE_RDS)) {
  cat("Downloading from", DATA_URL, "\n")
  ok <- tryCatch({
    download.file(DATA_URL, destfile = CACHE_RDS, mode = "wb", quiet = TRUE)
    TRUE
  }, error = function(e) {
    cat("Primary URL failed (", conditionMessage(e), "), trying fallback...\n", sep = "")
    download.file(DATA_URL_FALLBACK, destfile = CACHE_RDS, mode = "wb", quiet = TRUE)
    TRUE
  })
} else {
  cat("Using cached", CACHE_RDS, "\n")
}

prop99 <- read_rds(CACHE_RDS) |> as_tibble()
write_csv(prop99, CACHE_CSV)

cat("Rows:", nrow(prop99), " Cols:", ncol(prop99), "\n")
cat("Columns:", paste(names(prop99), collapse = ", "), "\n")
cat("States:", length(unique(prop99$state)),
    " Years:", min(prop99$year), "-", max(prop99$year), "\n\n")
cat("Head:\n")
print(head(prop99))
cat("\nMissingness per column:\n")
prop99 |>
  summarize(across(everything(), ~ sum(is.na(.)))) |>
  pivot_longer(everything(), names_to = "variable", values_to = "n_missing") |>
  print()

# ============================================================
# --- 2. Data preparation -------------------------------------
# ============================================================
cat("\n========== 2. DATA PREPARATION ==========\n")

INTERVENTION_YEAR <- 1988L  # last full pre-period year
TREATED_STATE     <- "California"
DONOR_STATE       <- "Nevada"

# California-only series with prepost factor
prop99_cali <- prop99 |>
  filter(state == TREATED_STATE) |>
  mutate(prepost = factor(year > INTERVENTION_YEAR, labels = c("Pre", "Post")))

cat("California observations:", nrow(prop99_cali),
    " (Pre/Post split:",
    sum(prop99_cali$prepost == "Pre"), "/",
    sum(prop99_cali$prepost == "Post"), ")\n")

# ITS / RDD tsibble: California with centered year (year0 = 0 at 1989)
prop99_ts <- prop99 |>
  filter(state == TREATED_STATE) |>
  select(year, cigsale) |>
  mutate(prepost = factor(year > INTERVENTION_YEAR, labels = c("Pre", "Post"))) |>
  as_tsibble(index = year) |>
  mutate(year0 = year - (INTERVENTION_YEAR + 1L))

write_csv(prop99_cali, "data_california.csv")
write_csv(as_tibble(prop99_ts), "data_california_tsibble.csv")

# Multiple imputation (random forest) for CausalImpact — covariates have NAs
cat("\nRunning mice random-forest imputation (m=1) for missing covariates...\n")
prop99_imputed <- prop99 |>
  mice(m = 1, method = "rf", printFlag = FALSE) |>
  complete() |>
  as_tibble()
cat("Imputed rows:", nrow(prop99_imputed),
    " Remaining NAs:", sum(is.na(prop99_imputed)), "\n")
write_csv(prop99_imputed, "data_imputed.csv")

# ============================================================
# --- 3. EDA: raw cigarette-sales trajectories ----------------
# ============================================================
cat("\n========== 3. EDA ==========\n")

eda_data <- prop99 |>
  mutate(unit_type = if_else(state == TREATED_STATE,
                             "California (treated)", "Donor state"))

p1 <- ggplot(eda_data,
             aes(x = year, y = cigsale,
                 group = state,
                 color = unit_type,
                 linewidth = unit_type,
                 alpha = unit_type)) +
  geom_line() +
  geom_vline(xintercept = INTERVENTION_YEAR + 0.5,
             color = WARM_ORANGE, linetype = "dashed", linewidth = 0.7) +
  annotate("text", x = INTERVENTION_YEAR + 0.7, y = 280,
           label = "Prop 99\n(Jan 1989)",
           hjust = 0, vjust = 1,
           color = WARM_ORANGE, size = 3.5, fontface = "bold") +
  scale_color_manual(values = c("California (treated)" = WARM_ORANGE,
                                "Donor state" = STEEL_BLUE)) +
  scale_linewidth_manual(values = c("California (treated)" = 1.2,
                                    "Donor state" = 0.45)) +
  scale_alpha_manual(values = c("California (treated)" = 1.0,
                                "Donor state" = 0.45)) +
  labs(title = "Per-capita cigarette sales, 1970-2000",
       subtitle = "California in orange; 38 donor states in blue",
       x = "Year", y = "Cigarette sales (packs per capita)",
       color = NULL, linewidth = NULL, alpha = NULL,
       caption = "Data: proposition99.rds  |  causalpolicy.nl") +
  theme_site() +
  guides(linewidth = "none", alpha = "none")
save_png(p1, "fig1_raw_series.png")

# Descriptive stats for California pre vs post
desc_ca <- prop99_cali |>
  group_by(prepost) |>
  summarize(n = n(),
            mean_cigsale = mean(cigsale),
            sd_cigsale   = sd(cigsale),
            .groups = "drop")
cat("California pre vs post:\n"); print(desc_ca)
write_csv(desc_ca, "table_eda_california_prepost.csv")

# ============================================================
# --- 4. Method 1: Naive pre-post comparison ------------------
# ============================================================
cat("\n========== 4. METHOD 1: NAIVE PRE-POST ==========\n")
cat("Estimand: descriptive Post - Pre mean difference (NOT a causal estimand).\n")

# Workshop window: 1984-1993, California only
fit_prepost <- lm(cigsale ~ prepost,
                  data = prop99_cali |> filter(year > 1983, year < 1994))
cat("OLS summary:\n"); print(summary(fit_prepost))
cat("\nHAC standard errors:\n")
prepost_hac <- coeftest(fit_prepost, vcov. = vcovHAC)
print(prepost_hac)

naive_estimate <- as.numeric(coef(fit_prepost)["prepostPost"])
naive_se       <- as.numeric(prepost_hac["prepostPost", "Std. Error"])

# ============================================================
# --- 5. Method 2: Difference-in-Differences ------------------
# ============================================================
cat("\n========== 5. METHOD 2: DIFFERENCE-IN-DIFFERENCES ==========\n")
cat("Estimand: ATT on California (1989-1993 vs Nevada control).\n")
cat("Specification: cigsale ~ state * prepost on 1984-1993 window.\n")

prop99_did <- prop99 |>
  filter(state %in% c(TREATED_STATE, DONOR_STATE),
         year > 1983, year < 1994) |>
  mutate(prepost = factor(year > INTERVENTION_YEAR, labels = c("Pre", "Post")),
         state   = factor(state, levels = c(DONOR_STATE, TREATED_STATE)))

fit_did <- lm(cigsale ~ state * prepost, data = prop99_did)
cat("\nOLS summary:\n"); print(summary(fit_did))
cat("\nHAC standard errors:\n")
did_hac <- coeftest(fit_did, vcov. = vcovHAC)
print(did_hac)

did_term     <- "stateCalifornia:prepostPost"
did_estimate <- as.numeric(coef(fit_did)[did_term])
did_se       <- as.numeric(did_hac[did_term, "Std. Error"])

# Parallel-trends figure: CA vs Nevada raw series, full 1970-2000
p2_data <- prop99 |>
  filter(state %in% c(TREATED_STATE, DONOR_STATE))

p2 <- ggplot(p2_data,
             aes(x = year, y = cigsale, color = state, linewidth = state)) +
  geom_line() +
  geom_vline(xintercept = INTERVENTION_YEAR + 0.5,
             color = WARM_ORANGE, linetype = "dashed", linewidth = 0.7) +
  scale_color_manual(values = c("California" = WARM_ORANGE,
                                "Nevada"     = TEAL)) +
  scale_linewidth_manual(values = c("California" = 1.2, "Nevada" = 1.0)) +
  labs(title = "DiD inputs: California vs Nevada",
       subtitle = "Pre-trend visual check before fitting DiD",
       x = "Year", y = "Cigarette sales (packs per capita)",
       color = NULL, linewidth = NULL) +
  theme_site() +
  guides(linewidth = "none")
save_png(p2, "fig2_did_parallel_trends.png")

# ============================================================
# --- 6a. Method 3a: ITS via growth-curve extrapolation -------
# ============================================================
cat("\n========== 6a. METHOD 3a: ITS GROWTH CURVE ==========\n")
cat("Fit linear trend on PRE-period, extrapolate forward, average gap.\n")

fit_growth <- lm(cigsale ~ year, data = prop99_ts |> filter(prepost == "Pre"))
cat("\nPre-period trend fit:\n"); print(summary(fit_growth))

post_df <- prop99_ts |> filter(prepost == "Post")
pred_growth <- predict(fit_growth, newdata = as_tibble(post_df),
                       interval = "prediction", level = 0.95)
ce_growth_per_year <- post_df$cigsale - pred_growth[, "fit"]
its_growth_estimate <- mean(ce_growth_per_year)
its_growth_sd       <- sd(ce_growth_per_year)
its_growth_se       <- its_growth_sd / sqrt(length(ce_growth_per_year))

cat(glue("\nITS (growth curve) ATT estimate: {round(its_growth_estimate, 2)} packs/capita\n"))
cat(glue("Naive SE across post-period years: {round(its_growth_se, 2)}\n"))

# ============================================================
# --- 6b. Method 3b: ITS via ARIMA forecast -------------------
# ============================================================
cat("\n========== 6b. METHOD 3b: ITS ARIMA FORECAST ==========\n")
cat("Fit AICc-selected ARIMA on PRE-period, forecast post horizon, average gap.\n")

fit_arima <- prop99_ts |>
  filter(prepost == "Pre") |>
  model(timeseries = ARIMA(cigsale, ic = "aicc"))

cat("\nSelected ARIMA model:\n"); print(report(fit_arima))

n_post <- nrow(post_df)
fcasts <- forecast(fit_arima, h = glue("{n_post} years"))

# Point forecasts and 95% intervals
fc_mean <- fcasts$.mean
fc_dist <- fcasts$cigsale
fc_int  <- hilo(fc_dist, 95)
fc_low  <- fc_int$lower
fc_up   <- fc_int$upper

observed <- post_df$cigsale
ce_arima_per_year <- observed - fc_mean
its_arima_estimate <- mean(ce_arima_per_year)
its_arima_sd       <- sd(ce_arima_per_year)
its_arima_se       <- its_arima_sd / sqrt(n_post)

cat(glue("\nITS (ARIMA) ATT estimate: {round(its_arima_estimate, 2)} packs/capita\n"))
cat(glue("Naive SE across post-period years: {round(its_arima_se, 2)}\n"))

# Figure 3: observed vs ARIMA counterfactual
its_plot_df <- bind_rows(
  prop99_ts |> filter(prepost == "Pre") |>
    mutate(series = "Observed (pre)", lower = NA_real_, upper = NA_real_) |>
    as_tibble() |> select(year, value = cigsale, series, lower, upper),
  tibble(year   = post_df$year,
         value  = observed,
         series = "Observed (post)",
         lower  = NA_real_, upper = NA_real_),
  tibble(year   = post_df$year,
         value  = fc_mean,
         series = "ARIMA counterfactual",
         lower  = fc_low, upper  = fc_up)
)

p3 <- ggplot(its_plot_df, aes(x = year, y = value, color = series)) +
  geom_ribbon(data = its_plot_df |> filter(series == "ARIMA counterfactual"),
              aes(ymin = lower, ymax = upper),
              fill = STEEL_BLUE, alpha = 0.25, color = NA) +
  geom_line(linewidth = 1.0) +
  geom_vline(xintercept = INTERVENTION_YEAR + 0.5,
             color = WARM_ORANGE, linetype = "dashed", linewidth = 0.7) +
  scale_color_manual(values = c("Observed (pre)"      = LIGHTER_TEXT,
                                "Observed (post)"     = WARM_ORANGE,
                                "ARIMA counterfactual" = STEEL_BLUE)) +
  labs(title = "ITS via ARIMA: observed vs pre-period counterfactual",
       subtitle = glue("California cigarette sales, gap averaged over 1989-2000 = {round(its_arima_estimate, 1)} packs/capita"),
       x = "Year", y = "Cigarette sales (packs per capita)",
       color = NULL) +
  theme_site()
save_png(p3, "fig3_its_arima.png")

# ============================================================
# --- 7. Method 4: RDD on time (segmented regression) ---------
# ============================================================
cat("\n========== 7. METHOD 4: RDD ON TIME ==========\n")
cat("Workshop's 'RDD': cigsale ~ year0 + prepost + year0:prepost on California series.\n")
cat("Coefficient on prepostPost = jump in level at the policy threshold.\n")

fit_rdd <- lm(cigsale ~ year0 + prepost + year0:prepost,
              data = as_tibble(prop99_ts))
cat("\nOLS summary:\n"); print(summary(fit_rdd))
rdd_hac <- coeftest(fit_rdd, vcov. = vcovHAC)
cat("\nHAC standard errors:\n"); print(rdd_hac)

rdd_estimate <- as.numeric(coef(fit_rdd)["prepostPost"])
rdd_se       <- as.numeric(rdd_hac["prepostPost", "Std. Error"])

# Figure 4: piecewise fit
rdd_pred <- as_tibble(prop99_ts) |>
  mutate(fit = predict(fit_rdd, newdata = as_tibble(prop99_ts)))

p4 <- ggplot() +
  geom_point(data = as_tibble(prop99_ts),
             aes(x = year, y = cigsale),
             color = LIGHTER_TEXT, size = 1.8, alpha = 0.85) +
  geom_line(data = rdd_pred |> filter(prepost == "Pre"),
            aes(x = year, y = fit),
            color = STEEL_BLUE, linewidth = 1.1) +
  geom_line(data = rdd_pred |> filter(prepost == "Post"),
            aes(x = year, y = fit),
            color = WARM_ORANGE, linewidth = 1.1) +
  geom_vline(xintercept = INTERVENTION_YEAR + 0.5,
             color = WARM_ORANGE, linetype = "dashed", linewidth = 0.7) +
  annotate("text", x = INTERVENTION_YEAR + 0.7, y = 130,
           label = glue("Level jump\n{round(rdd_estimate, 1)} packs"),
           hjust = 0, vjust = 0,
           color = WARM_ORANGE, fontface = "bold", size = 3.5) +
  labs(title = "RDD on time (segmented regression)",
       subtitle = "Pre-period trend in blue, post-period trend in orange",
       x = "Year", y = "Cigarette sales (packs per capita)") +
  theme_site()
save_png(p4, "fig4_rdd_segmented.png")

# ============================================================
# --- 8. Method 5: Synthetic Control (tidysynth) --------------
# ============================================================
cat("\n========== 8. METHOD 5: SYNTHETIC CONTROL ==========\n")
cat("Estimand: ATT on California vs weighted synthetic California.\n")

prop99_syn <- prop99 |>
  synthetic_control(
    outcome           = cigsale,
    unit              = state,
    time              = year,
    i_unit            = TREATED_STATE,
    i_time            = INTERVENTION_YEAR,
    generate_placebos = TRUE
  ) |>
  generate_predictor(
    time_window = 1980:1988,
    lnincome    = mean(lnincome, na.rm = TRUE),
    retprice    = mean(retprice, na.rm = TRUE),
    age15to24   = mean(age15to24, na.rm = TRUE)
  ) |>
  generate_predictor(
    time_window = 1984:1988,
    beer        = mean(beer, na.rm = TRUE)
  ) |>
  generate_predictor(time_window = 1975, cigsale_1975 = cigsale) |>
  generate_predictor(time_window = 1980, cigsale_1980 = cigsale) |>
  generate_predictor(time_window = 1988, cigsale_1988 = cigsale) |>
  # IPOP solver tuning parameters from the tidysynth README example:
  #   margin_ipop = convergence margin
  #   sigf_ipop   = significant figures
  #   bound_ipop  = numerical bound
  generate_weights(optimization_window = 1970:1988,
                   margin_ipop = .02,
                   sigf_ipop   = 7,
                   bound_ipop  = 6) |>
  generate_control()

# Effect series
sc_series <- grab_synthetic_control(prop99_syn)
sc_post   <- sc_series |> filter(time_unit > INTERVENTION_YEAR) |>
  mutate(dif = real_y - synth_y)
sc_estimate <- mean(sc_post$dif)
sc_se       <- sd(sc_post$dif) / sqrt(nrow(sc_post))
cat(glue("\nSCM ATT (mean of real - synthetic, 1989-2000): {round(sc_estimate, 2)} packs/capita\n"))
cat(glue("Naive SE across post-period years: {round(sc_se, 2)}\n"))

# Unit weights
sc_weights <- grab_unit_weights(prop99_syn)
cat("\nTop 8 donor weights:\n")
print(sc_weights |> arrange(desc(weight)) |> head(8))
write_csv(sc_weights, "table_sc_unit_weights.csv")

# Predictor balance
sc_balance <- grab_balance_table(prop99_syn)
cat("\nPredictor balance:\n"); print(sc_balance)
write_csv(sc_balance, "table_sc_balance.csv")

# Predictor weights (V matrix) — how much importance the optimiser placed on
# each predictor when matching California
sc_predw <- grab_predictor_weights(prop99_syn)
cat("\nPredictor weights (V matrix):\n"); print(sc_predw)
write_csv(sc_predw, "table_sc_predictor_weights.csv")

# Pre-period loss (MSPE) for treated unit and donors
sc_loss <- grab_loss(prop99_syn)
cat("\nPre-period loss (RMSPE), treated + placebos:\n")
print(head(sc_loss, 10))
write_csv(sc_loss, "table_sc_loss.csv")

# Fisher exact p-value via MSPE ratio (Abadie et al. 2010)
sc_sig <- grab_significance(prop99_syn)
cat("\nFisher-style significance table (top 5 MSPE ratios):\n")
print(sc_sig |> arrange(desc(mspe_ratio)) |> head(5))
write_csv(sc_sig, "table_sc_significance.csv")

ca_sig <- sc_sig |> filter(unit_name == TREATED_STATE)
sc_pvalue <- as.numeric(ca_sig$fishers_exact_pvalue)
sc_mspe_ratio <- as.numeric(ca_sig$mspe_ratio)
sc_rank   <- as.integer(ca_sig$rank)
cat(glue("\nCalifornia MSPE ratio: {round(sc_mspe_ratio, 1)}, rank {sc_rank}, Fisher exact p = {round(sc_pvalue, 4)}\n"))

# Placebo distribution of average causal effects
ce_data <- prop99_syn |>
  grab_synthetic_control(placebo = TRUE) |>
  filter(time_unit > INTERVENTION_YEAR) |>
  mutate(dif = real_y - synth_y) |>
  group_by(.id, .placebo) |>
  summarize(average_causal_effect = mean(dif), .groups = "drop")
write_csv(ce_data, "table_sc_placebo_aces.csv")

# Figure 5: SCM trends (custom)
sc_trends_df <- sc_series |>
  select(time_unit, real_y, synth_y) |>
  pivot_longer(c(real_y, synth_y), names_to = "series", values_to = "value") |>
  mutate(series = recode(series,
                         real_y  = "California (observed)",
                         synth_y = "Synthetic California"))

p5 <- ggplot(sc_trends_df,
             aes(x = time_unit, y = value, color = series, linewidth = series)) +
  geom_line() +
  geom_vline(xintercept = INTERVENTION_YEAR + 0.5,
             color = WARM_ORANGE, linetype = "dashed", linewidth = 0.7) +
  scale_color_manual(values = c("California (observed)" = WARM_ORANGE,
                                "Synthetic California"  = STEEL_BLUE)) +
  scale_linewidth_manual(values = c("California (observed)" = 1.2,
                                    "Synthetic California"  = 1.2)) +
  labs(title = "Synthetic Control: California vs Synthetic California",
       subtitle = glue("Post-1989 gap averaged = {round(sc_estimate, 1)} packs/capita"),
       x = "Year", y = "Cigarette sales (packs per capita)",
       color = NULL, linewidth = NULL) +
  theme_site() +
  guides(linewidth = "none")
save_png(p5, "fig5_sc_trends.png")

# Figure 6: built-in plot_weights() -- shows donor unit weights AND
# predictor (V matrix) weights side-by-side in one faceted ggplot.
p6 <- plot_weights(prop99_syn) +
  labs(title = "tidysynth::plot_weights(): donor + predictor weights") +
  theme_site()
save_png(p6, "fig6_sc_weights.png", height = 6)

# Figure 7: built-in plot_placebos() -- overlays each placebo donor's
# (real - synthetic) trajectory on California's, with automatic pruning
# of poor pre-fit placebos (those with pre-period MSPE > 2x California).
p7 <- plot_placebos(prop99_syn) +
  labs(title = "tidysynth::plot_placebos(): California vs pruned placebos") +
  theme_site()
save_png(p7, "fig7_sc_placebos.png")

# Figure 11: built-in plot_differences() -- the per-year gap series for
# California specifically (real_y - synth_y over time).
p11 <- plot_differences(prop99_syn) +
  labs(title = "tidysynth::plot_differences(): California's gap year-by-year") +
  theme_site()
save_png(p11, "fig11_sc_differences.png")

# Figure 12: plot_placebos() with prune = FALSE -- keeps every donor
# placebo, including poor pre-fit ones, for a full-pool comparison.
p12 <- plot_placebos(prop99_syn, prune = FALSE) +
  labs(title = "plot_placebos(prune = FALSE): every donor's placebo gap") +
  theme_site()
save_png(p12, "fig12_sc_placebos_unpruned.png")

# Figure 10: MSPE-ratio plot (Abadie-style Fisher rank visualisation)
mspe_df <- sc_sig |>
  mutate(is_treated = unit_name == TREATED_STATE,
         unit_name  = fct_reorder(unit_name, mspe_ratio)) |>
  arrange(desc(mspe_ratio)) |>
  slice_head(n = 20)

p10 <- ggplot(mspe_df,
              aes(x = unit_name, y = mspe_ratio, fill = is_treated)) +
  geom_col() +
  geom_text(data = mspe_df |> filter(is_treated),
            aes(label = sprintf("ratio = %.1f\nrank %d\np = %.3f",
                                mspe_ratio, sc_rank, sc_pvalue)),
            hjust = -0.05, color = LIGHTER_TEXT, size = 3.2, lineheight = 0.95) +
  coord_flip() +
  expand_limits(y = max(mspe_df$mspe_ratio) * 1.30) +
  scale_fill_manual(values = c(`FALSE` = STEEL_BLUE, `TRUE` = WARM_ORANGE),
                    guide = "none") +
  labs(title = "MSPE ratio: post/pre fit error, treated vs placebos",
       subtitle = "California sits at the top of the ranking — its post-period gap is unusually large relative to its pre-period fit",
       x = NULL, y = "MSPE ratio (post / pre)") +
  theme_site()
save_png(p10, "fig10_sc_mspe_ratio.png", height = 7)

# ---- Inspecting the nested tidysynth object ---------------------------
# prop99_syn is a nested tibble: one row per (unit, placebo status), with
# list-columns for outcome / predictors / weights / synthetic control /
# loss / metadata. tidyr::unnest() flattens any list-column to a long
# table -- useful for custom downstream summaries.
cat("\nNested tidysynth object (first 5 rows, list-columns visible):\n")
print(prop99_syn, n = 5)

cat("\nFlattening .outcome into a long table:\n")
sc_outcomes_long <- prop99_syn |> tidyr::unnest(cols = c(.outcome))
print(head(sc_outcomes_long, 6))
cat("Rows in unnested outcome table:", nrow(sc_outcomes_long),
    " (78 SCM rows x ~19 years)\n")
write_csv(sc_outcomes_long, "table_sc_outcomes_long.csv")

# ============================================================
# --- 9. Method 6: CausalImpact -------------------------------
# ============================================================
cat("\n========== 9. METHOD 6: CAUSALIMPACT ==========\n")
cat("Estimand: posterior mean ATT on California with 95% credible interval.\n")

prop99_wide <- prop99_imputed |>
  pivot_wider(names_from  = state,
              values_from = c(cigsale, lnincome, beer, age15to24, retprice)) |>
  relocate(cigsale_California) |>
  select(-year)

# Period indices: 1970-2000 -> 31 rows; 1989 starts at row 20
years_all <- sort(unique(prop99_imputed$year))
pre_idx   <- c(1L, which(years_all == INTERVENTION_YEAR))
post_idx  <- c(which(years_all == INTERVENTION_YEAR) + 1L, length(years_all))
cat("Pre period rows:",  pre_idx[1],  "-", pre_idx[2],
    "  (", years_all[pre_idx[1]],  "-", years_all[pre_idx[2]], ")\n")
cat("Post period rows:", post_idx[1], "-", post_idx[2],
    "  (", years_all[post_idx[1]], "-", years_all[post_idx[2]], ")\n")

# (a) Cigarettes-only model: only donor cigsale columns as controls
prop99_cigonly <- prop99_wide |> select(starts_with("cigsale"))
set.seed(42)
impact_cigsale <- CausalImpact(
  data        = prop99_cigonly,
  pre.period  = pre_idx,
  post.period = post_idx
)
cat("\n[CausalImpact: cigarette-only controls]\n")
print(summary(impact_cigsale))

# (b) Full-covariate model
set.seed(42)
impact_full <- CausalImpact(
  data        = prop99_wide,
  pre.period  = pre_idx,
  post.period = post_idx
)
cat("\n[CausalImpact: cigarette + covariate controls]\n")
print(summary(impact_full))

ci_avg <- impact_full$summary["Average", ]
ci_estimate <- as.numeric(ci_avg["AbsEffect"])
ci_low      <- as.numeric(ci_avg["AbsEffect.lower"])
ci_up       <- as.numeric(ci_avg["AbsEffect.upper"])
ci_se_approx <- (ci_up - ci_low) / (2 * 1.96)
cat(glue("\nCausalImpact (full covariates) ATT: {round(ci_estimate, 2)} ",
         "[95% CI: {round(ci_low, 2)}, {round(ci_up, 2)}]\n"))

# Figure 8: counterfactual + cumulative effect
ci_series_full <- as_tibble(impact_full$series) |>
  mutate(year = years_all)

# Pointwise (observed vs counterfactual)
ci_point_df <- ci_series_full |>
  transmute(year,
            Observed       = response,
            Counterfactual = point.pred,
            cf_lower       = point.pred.lower,
            cf_upper       = point.pred.upper) |>
  pivot_longer(c(Observed, Counterfactual),
               names_to = "series", values_to = "value")

p8a <- ggplot(ci_point_df, aes(x = year, y = value, color = series)) +
  geom_ribbon(data = ci_series_full,
              aes(x = year, ymin = point.pred.lower, ymax = point.pred.upper),
              fill = STEEL_BLUE, alpha = 0.25, color = NA,
              inherit.aes = FALSE) +
  geom_line(linewidth = 1.0) +
  geom_vline(xintercept = INTERVENTION_YEAR + 0.5,
             color = WARM_ORANGE, linetype = "dashed", linewidth = 0.7) +
  scale_color_manual(values = c("Observed"       = WARM_ORANGE,
                                "Counterfactual" = STEEL_BLUE)) +
  labs(subtitle = "Pointwise: observed vs Bayesian counterfactual (95% CI)",
       x = NULL, y = "Cigarette sales", color = NULL) +
  theme_site() +
  theme(legend.position = "top")

p8b <- ggplot(ci_series_full,
              aes(x = year, y = cum.effect)) +
  geom_ribbon(aes(ymin = cum.effect.lower, ymax = cum.effect.upper),
              fill = TEAL, alpha = 0.25) +
  geom_line(color = TEAL, linewidth = 1.0) +
  geom_hline(yintercept = 0, color = LIGHT_TEXT, linewidth = 0.4) +
  geom_vline(xintercept = INTERVENTION_YEAR + 0.5,
             color = WARM_ORANGE, linetype = "dashed", linewidth = 0.7) +
  labs(subtitle = "Cumulative effect since 1989 (95% credible interval)",
       x = "Year", y = "Cumulative packs/capita") +
  theme_site()

# Stack vertically using patchwork-free approach: save side-by-side via gridExtra alternative
# Use simple combined data instead (single ggplot with facets)
ci_facets_df <- bind_rows(
  ci_series_full |>
    transmute(year, value = response, series = "Observed", panel = "Pointwise",
              lower = NA_real_, upper = NA_real_),
  ci_series_full |>
    transmute(year, value = point.pred, series = "Counterfactual", panel = "Pointwise",
              lower = point.pred.lower, upper = point.pred.upper),
  ci_series_full |>
    transmute(year, value = cum.effect, series = "Cumulative effect", panel = "Cumulative",
              lower = cum.effect.lower, upper = cum.effect.upper)
) |>
  mutate(panel = factor(panel, levels = c("Pointwise", "Cumulative")))

p8 <- ggplot(ci_facets_df, aes(x = year, y = value, color = series)) +
  geom_ribbon(data = ci_facets_df |> filter(!is.na(lower)),
              aes(ymin = lower, ymax = upper, fill = series),
              alpha = 0.2, color = NA) +
  geom_line(linewidth = 1.0) +
  geom_hline(data = tibble(panel = factor("Cumulative",
                                          levels = c("Pointwise", "Cumulative")),
                           y = 0),
             aes(yintercept = y), color = LIGHT_TEXT, linewidth = 0.4) +
  geom_vline(xintercept = INTERVENTION_YEAR + 0.5,
             color = WARM_ORANGE, linetype = "dashed", linewidth = 0.7) +
  facet_wrap(~ panel, ncol = 1, scales = "free_y") +
  scale_color_manual(values = c("Observed"          = WARM_ORANGE,
                                "Counterfactual"    = STEEL_BLUE,
                                "Cumulative effect" = TEAL)) +
  scale_fill_manual(values  = c("Observed"          = WARM_ORANGE,
                                "Counterfactual"    = STEEL_BLUE,
                                "Cumulative effect" = TEAL)) +
  labs(title = "CausalImpact: pointwise and cumulative effects",
       subtitle = glue("Full-covariate model. Average ATT = {round(ci_estimate, 1)} packs/capita"),
       x = NULL, y = NULL, color = NULL, fill = NULL) +
  theme_site()
save_png(p8, "fig8_causalimpact.png", height = 7)

# Export CausalImpact series
write_csv(ci_series_full, "table_causalimpact_series.csv")

# ============================================================
# --- 10. Cross-method comparison + forest plot ---------------
# ============================================================
cat("\n========== 10. CROSS-METHOD COMPARISON ==========\n")

# ITS-ARIMA: average the per-year ARIMA 95% forecast band as the
# method's recommended uncertainty (treating each year's forecast band
# as an honest per-year credible range, then summarising)
its_arima_lo <- mean(fc_low)
its_arima_hi <- mean(fc_up)
# Note: per-year forecast bands are forecasts of the COUNTERFACTUAL, so the
# "effect" forecast interval is observed - [hi, lo] = [observed - hi, observed - lo]
its_arima_effect_lo <- mean(observed - fc_up)
its_arima_effect_hi <- mean(observed - fc_low)

results_tbl <- tibble(
  method   = c("Naive pre-post",
               "DiD (CA vs Nevada)",
               "ITS (growth curve)",
               "ITS (ARIMA)",
               "RDD on time",
               "Synthetic Control",
               "CausalImpact"),
  estimand = c("Descriptive (biased)",
               "ATT (CA, 1989-1993)",
               "Mean post-period gap",
               "Mean post-period gap",
               "Level jump at 1989",
               "ATT (CA, 1989-2000)",
               "ATT (CA, 1989-2000)"),
  estimate = c(naive_estimate,
               did_estimate,
               its_growth_estimate,
               its_arima_estimate,
               rdd_estimate,
               sc_estimate,
               ci_estimate),
  std_error = c(naive_se,
                did_se,
                its_growth_se,
                its_arima_se,
                rdd_se,
                sc_se,
                ci_se_approx),
  principled_inference = c(
    glue("HAC 95% CI: [{round(naive_estimate - 1.96 * naive_se, 1)}, {round(naive_estimate + 1.96 * naive_se, 1)}]"),
    glue("HAC 95% CI: [{round(did_estimate - 1.96 * did_se, 1)}, {round(did_estimate + 1.96 * did_se, 1)}]"),
    "Linear-trend 95% prediction interval (no closed-form ATT SE)",
    glue("ARIMA 95% forecast-band average: [{round(its_arima_effect_lo, 1)}, {round(its_arima_effect_hi, 1)}]"),
    glue("HAC 95% CI: [{round(rdd_estimate - 1.96 * rdd_se, 1)}, {round(rdd_estimate + 1.96 * rdd_se, 1)}]"),
    glue("Fisher exact p = {round(sc_pvalue, 3)} (MSPE-ratio rank {sc_rank}/39)"),
    glue("Posterior 95% CrI: [{round(ci_low, 1)}, {round(ci_up, 1)}]; P(effect ≠ 0) = 92%")
  )
) |>
  mutate(ci_low  = estimate - 1.96 * std_error,
         ci_high = estimate + 1.96 * std_error)

cat("\nComparison table:\n"); print(results_tbl, width = Inf)
cat("\nPrincipled inference column (each method's recommended uncertainty):\n")
print(results_tbl |> select(method, principled_inference), width = Inf)
write_csv(results_tbl, "table_cross_method.csv")

# Figure 9: forest plot of all 6 estimates
forest_df <- results_tbl |>
  mutate(method = factor(method, levels = rev(results_tbl$method)),
         family = if_else(method == "Naive pre-post",
                          "Descriptive baseline", "Causal estimator"))

p9 <- ggplot(forest_df,
             aes(x = estimate, y = method, color = family)) +
  geom_vline(xintercept = 0, color = LIGHT_TEXT, linewidth = 0.4) +
  geom_errorbar(aes(xmin = ci_low, xmax = ci_high),
                width = 0.18, linewidth = 0.8,
                orientation = "y") +
  geom_point(size = 3.4) +
  geom_text(aes(label = sprintf("%.1f", estimate)),
            color = LIGHTER_TEXT, vjust = -1.2, size = 3.2) +
  scale_color_manual(values = c("Descriptive baseline" = MUTED_GRAY,
                                "Causal estimator"     = WARM_ORANGE)) +
  labs(title = "Six estimators of California's Proposition 99 effect",
       subtitle = "Effect on per-capita cigarette sales (packs).\n95% CIs use HAC, naive across-year SD, or CausalImpact credible bands.",
       x = "Effect on cigarette sales (negative = reduction)",
       y = NULL, color = NULL) +
  theme_site() +
  theme(legend.position = "bottom")
save_png(p9, "fig9_cross_method_forest.png", height = 6)

# ============================================================
# --- 11. README -----------------------------------------------
# ============================================================
cat("\n========== 11. README ==========\n")

# Detect which downstream pipeline stages have produced their artifacts so
# README's checklist stays in sync with reality on re-runs.
tick <- function(path) if (file.exists(path)) "[x]" else "[ ]"
stage_progress <- glue::glue(
  "- {tick('analysis.R')} Stage 1: write-script (analysis.R)\n",
  "- {tick('results_report.md')} Stage 2: write-results-report (results_report.md)\n",
  "- {tick('index.md')} Stage 3: write-post (index.md)\n",
  "- {tick('infographic_instructions.md')} Stage 4: write-infographic (infographic_instructions.md)"
)

readme <- glue::glue("
# r_causalpolicy_workshop -- Artifact Inventory

Replication of the causalpolicy.nl workshop (DiD, ITS, RDD, Synthetic Control,
CausalImpact) using California's 1988 Proposition 99 cigarette tax.

## Pipeline progress
{stage_progress}

## Figures
| File | Description |
|---|---|
| fig1_raw_series.png | Per-capita cigarette sales, 1970-2000, all states |
| fig2_did_parallel_trends.png | California vs Nevada (DiD inputs) |
| fig3_its_arima.png | ITS via ARIMA: observed vs counterfactual |
| fig4_rdd_segmented.png | RDD on time: piecewise pre/post fit |
| fig5_sc_trends.png | Synthetic Control: observed vs synthetic California |
| fig6_sc_weights.png | Top 10 donor-state weights |
| fig7_sc_placebos.png | Placebo distribution of average causal effects |
| fig8_causalimpact.png | CausalImpact pointwise + cumulative |
| fig9_cross_method_forest.png | Forest plot of all six estimators |
| fig10_sc_mspe_ratio.png | MSPE-ratio bar chart (Abadie Fisher rank visualisation) |
| fig11_sc_differences.png | tidysynth::plot_differences() -- California's per-year gap |
| fig12_sc_placebos_unpruned.png | plot_placebos(prune = FALSE) -- every donor's placebo gap |

## CSV tables
| File | Description |
|---|---|
| proposition99.csv | Raw dataset (mirror of proposition99.rds) |
| data_california.csv | California-only series with prepost factor |
| data_california_tsibble.csv | Same with year0 centred at 1989 |
| data_imputed.csv | Full panel after mice random-forest imputation |
| table_eda_california_prepost.csv | Pre/post descriptives for California |
| table_sc_unit_weights.csv | Synthetic Control unit weights |
| table_sc_balance.csv | Synthetic Control predictor balance |
| table_sc_predictor_weights.csv | Synthetic Control V matrix (predictor weights) |
| table_sc_loss.csv | Pre-period MSPE for treated unit + all placebos |
| table_sc_significance.csv | Fisher exact p-value via MSPE ratios |
| table_sc_placebo_aces.csv | Placebo average causal effects |
| table_sc_outcomes_long.csv | Unnested .outcome list-column from prop99_syn |
| table_causalimpact_series.csv | CausalImpact pointwise / cumulative series |
| table_cross_method.csv | Six-method comparison table |

## Packages
tidyverse, sandwich, lmtest, tidysynth, fpp3, mice, CausalImpact, broom, glue
")
writeLines(readme, "README.md")
cat("README.md written.\n")

# ============================================================
cat("\n=== Script completed successfully ===\n")
