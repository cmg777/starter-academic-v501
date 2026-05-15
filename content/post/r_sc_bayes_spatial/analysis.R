# =============================================================================
# Bayesian Spatial Synthetic Control — California Proposition 99 tobacco tax
# Replication of Sakaguchi & Tagawa, "Identification and Bayesian Inference for
# Synthetic Control Methods with Spillover Effects", California case study only.
#
# Estimand: ATT on California. Observational setting; the synthetic control
# constructs a counterfactual California from a weighted average of donor states.
# SUTVA (no interference) is RELAXED in Stage 3 via a SAR layer.
#
# Pedagogical progression:
#   Stage 1 — Classical SCM (Abadie 2010 style) via tidysynth
#   Stage 2 — Bayesian SCM with horseshoe priors (no spatial)
#   Stage 3 — Bayesian Spatial SCM with SAR spillovers
#
# MCMC budget (tutorial-scale): M=5000 iter, burn=2500. Paper uses 100,000.
#
# Inputs : helpers/* (R/Cpp/data, fetched at runtime from this repo's raw URLs)
# Outputs: 6 PNG figures, 9 CSV tables, execution_log.txt
# =============================================================================

# ── 0. Setup ─────────────────────────────────────────────────────────────────
local({
  r <- getOption("repos")
  if (is.null(r) || r["CRAN"] == "@CRAN@" || is.na(r["CRAN"])) {
    options(repos = c(CRAN = "https://cloud.r-project.org"))
  }
})
if (!requireNamespace("pacman", quietly = TRUE)) install.packages("pacman")
pacman::p_load(
  tidyverse, tidysynth, Rcpp, RcppArmadillo, Matrix,
  glue, scales, patchwork, coda
)

SEED <- 20251022L
set.seed(SEED)

MCMC_ITER <- 5000L
MCMC_BURN <- 2500L
TREAT_YEAR <- 1988L  # package convention: year >= 1988 is post-treatment

SLUG <- "r_sc_bayes_spatial"
# Helper files (R utils, C++ MCMC kernels, california_smoking.rda) are fetched
# at runtime from this repo's GitHub raw URLs so the script is self-contained.
# The upstream replication-package (148 MB, third-party) is gitignored.
REPL_URL <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_sc_bayes_spatial/helpers"

# Dark-theme palette
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
      plot.background  = element_rect(fill = BG, colour = NA),
      panel.background = element_rect(fill = BG, colour = NA),
      panel.grid.major = element_line(colour = GRID, linewidth = 0.3),
      panel.grid.minor = element_line(colour = GRID, linewidth = 0.15),
      axis.text        = element_text(colour = TEXT),
      axis.title       = element_text(colour = TEXT),
      plot.title       = element_text(colour = WHITE, face = "bold"),
      plot.subtitle    = element_text(colour = TEXT),
      plot.caption     = element_text(colour = TEXT, size = 8),
      legend.background = element_rect(fill = BG, colour = NA),
      legend.text       = element_text(colour = TEXT),
      legend.title      = element_text(colour = TEXT),
      strip.background  = element_rect(fill = GRID, colour = NA),
      strip.text        = element_text(colour = WHITE, face = "bold")
    )
}

save_fig <- function(plot, name, w = 9, h = 6) {
  ggsave(glue("{SLUG}_{name}.png"), plot, width = w, height = h, dpi = 300,
         bg = BG)
}

# Print interpolated message followed by a newline. Necessary because
# glue() strips trailing newlines, so cat(glue("...\n")) concatenates lines.
say <- function(...) cat(glue(..., .sep = ""), "\n", sep = "")

cat("=============================================================\n")
say("  Bayesian Spatial SC — California tobacco replication")
say("  Seed: {SEED}  |  MCMC: {MCMC_ITER} iter / {MCMC_BURN} burn\n")


# ── 1. Source helpers and compile C++ MCMC kernels ───────────────────────────
cat("--- Section 1: Fetch helpers from GitHub and compile C++ kernels ---\n")

r_helpers <- c("01_utils.R", "02_utils_data_prep.R", "03_utils_plot.R",
               "04_utils_diagnostics.R", "10_sc_spillover.R",
               "21_mcmc_alpha.R", "22_mcmc_sar.R", "41_robustness_check.R")
for (h in r_helpers) source(file.path(REPL_URL, h), local = FALSE)

# Rcpp::sourceCpp() needs a local file path, so download each .cpp to a tmpdir
# and compile from there.
cpp_dir <- tempfile("rscbs_cpp_"); dir.create(cpp_dir)
ok_cpp <- tryCatch({
  for (cpp in c("20_mcmc.cpp", "40_geweke_latest.cpp")) {
    local_path <- file.path(cpp_dir, cpp)
    download.file(file.path(REPL_URL, cpp), local_path,
                  mode = "wb", quiet = TRUE)
    Rcpp::sourceCpp(local_path)
  }
  TRUE
}, error = function(e) {
  cat("\n[ERROR] Rcpp compilation failed:\n", conditionMessage(e), "\n",
      "Install Xcode CLT (macOS) or Rtools (Windows) and retry.\n", sep = "")
  FALSE
})
stopifnot(ok_cpp)
cat("[OK] R helpers fetched and C++ kernels compiled.\n\n")


# ── 2. Load California panel + spatial weights ───────────────────────────────
cat("--- Section 2: Load california_smoking.rda ---\n")

rda_con <- url(file.path(REPL_URL, "california_smoking.rda"))
load(rda_con); close(rda_con)
panel_df <- california_smoking$panel_df %>%
  mutate(treatment = if_else(state == "California" & year >= TREAT_YEAR, 1L, 0L))

# Control-only spatial structures: w (38-vec) and W (38x38 binary adjacency)
w_vec <- california_smoking$w
W_mat <- california_smoking$W
w <- as.matrix(w_vec[, 2])              # California's row of contiguity, control-only
W <- as.matrix(W_mat[, -1])             # 38x38 binary adjacency among controls
rownames(W) <- W_mat$state
colnames(W) <- W_mat$state

state_order <- sort(unique(panel_df$state))
stopifnot("California" %in% state_order)
donors <- setdiff(state_order, "California")
stopifnot(length(donors) == 38, all(donors == rownames(W)))

say("Panel: {nrow(panel_df)} rows | {length(state_order)} states | ",
    "years {min(panel_df$year)}-{max(panel_df$year)}")
say("Treated: California | Donors: {length(donors)} | ",
    "Pre-period: {min(panel_df$year)}-{TREAT_YEAR-1} | ",
    "Post-period: {TREAT_YEAR}-{max(panel_df$year)}\n")

write_csv(panel_df, glue("{SLUG}_source_data.csv"))


# ── 3. Stage 1: Classical SCM (Abadie 2010 baseline via tidysynth) ───────────
cat("--- Section 3: Stage 1 — Classical SCM (tidysynth) ---\n")

# Two reasons the recovered weights and ATT will differ from Abadie (2010):
#   (a) `tidysynth` uses a slightly different optimizer than Abadie's `Synth`,
#       which can shift weights by a few percent even on identical inputs;
#   (b) the shipped `california_smoking.rda` only carries `cigsale` and
#       `retprice`, whereas Abadie (2010) used additional predictors
#       (ln income, youth share 15-24, beer sales). The narrower predictor
#       set is the dominant cause of the divergence between the classical
#       ATT recovered here (~ -18) and the paper's headline (~ -27).
sc_classic <- panel_df %>%
  synthetic_control(
    outcome     = cigsale,
    unit        = state,
    time        = year,
    i_unit      = "California",
    i_time      = TREAT_YEAR,
    generate_placebos = FALSE
  ) %>%
  generate_predictor(time_window = 1970:(TREAT_YEAR - 1),
                     cigsale_avg_pre = mean(cigsale, na.rm = TRUE),
                     retprice_avg    = mean(retprice, na.rm = TRUE)) %>%
  # Lag-year predictors 1975 and 1980 are calibrated to the 1988 boundary
  # (Abadie 2010, Table 1); they would need adjustment for a different TREAT_YEAR.
  generate_predictor(time_window = 1975, cigsale_1975 = cigsale) %>%
  generate_predictor(time_window = 1980, cigsale_1980 = cigsale) %>%
  generate_predictor(time_window = TREAT_YEAR - 1, cigsale_pre = cigsale) %>%
  generate_weights(optimization_window = 1970:(TREAT_YEAR - 1)) %>%
  generate_control()

w_classic <- grab_unit_weights(sc_classic) %>%
  rename(state = unit) %>%
  arrange(desc(weight))

traj_classic <- grab_synthetic_control(sc_classic) %>%
  rename(year = time_unit, observed = real_y, synthetic = synth_y) %>%
  mutate(gap = observed - synthetic,
         period = if_else(year < TREAT_YEAR, "pre", "post"))

att_classic <- traj_classic %>%
  filter(period == "post") %>%
  summarise(att = mean(gap)) %>%
  pull(att)

# Bootstrap 95% CI for the classical ATT using post-period gaps (no spatial model)
set.seed(SEED)
boot_classic <- replicate(
  2000,
  mean(sample(traj_classic$gap[traj_classic$period == "post"], replace = TRUE))
)
att_classic_ci <- quantile(boot_classic, c(0.025, 0.975), names = FALSE)

say("Stage 1 ATT (Classical SCM): {round(att_classic, 2)} ",
    "packs per capita, 95% boot CI [{round(att_classic_ci[1], 2)}, ",
    "{round(att_classic_ci[2], 2)}]")
cat("Top-5 donor weights (classical):\n"); print(head(w_classic, 5))

write_csv(w_classic, glue("{SLUG}_stage1_weights.csv"))
write_csv(traj_classic, glue("{SLUG}_stage1_gap.csv"))

p1a <- ggplot(traj_classic, aes(x = year)) +
  geom_line(aes(y = observed, colour = "California (observed)"),
            linewidth = 1.1) +
  geom_line(aes(y = synthetic, colour = "Synthetic California"),
            linewidth = 1.1, linetype = "dashed") +
  geom_vline(xintercept = TREAT_YEAR - 0.5, colour = ORANGE,
             linetype = "dotted", linewidth = 0.6) +
  annotate("text", x = TREAT_YEAR, y = 130, label = "Prop 99",
           colour = ORANGE, hjust = 0, size = 3.5) +
  scale_colour_manual(values = c("California (observed)" = STEEL,
                                 "Synthetic California"  = TEAL)) +
  labs(title = "Stage 1 — Classical SCM",
       subtitle = "Per-capita cigarette sales, California vs. synthetic counterfactual",
       x = NULL, y = "Cigarette sales per capita",
       colour = NULL) +
  theme_dark_site() +
  theme(legend.position = "top")

p1b <- ggplot(traj_classic, aes(x = year, y = gap)) +
  geom_hline(yintercept = 0, colour = TEXT, linewidth = 0.4) +
  geom_vline(xintercept = TREAT_YEAR - 0.5, colour = ORANGE,
             linetype = "dotted", linewidth = 0.6) +
  geom_line(colour = STEEL, linewidth = 1.1) +
  labs(title = "Treatment gap (observed − synthetic)",
       x = "Year", y = "Gap (packs per capita)") +
  theme_dark_site()

save_fig(p1a / p1b, "01_classical_paths", w = 9, h = 8)
say("[OK] Saved {SLUG}_01_classical_paths.png\n")


# ── 4. Stage 2: Bayesian SCM with horseshoe priors (no spatial) ──────────────
cat("--- Section 4: Stage 2 — Bayesian SCM with horseshoe priors ---\n")

# Build pre/post matrices in donor order
years_all  <- sort(unique(panel_df$year))
years_pre  <- years_all[years_all <  TREAT_YEAR]
years_post <- years_all[years_all >= TREAT_YEAR]

Y0_pre <- panel_df %>% filter(state == "California", year < TREAT_YEAR) %>%
  arrange(year) %>% pull(cigsale)

Y0_post <- panel_df %>% filter(state == "California", year >= TREAT_YEAR) %>%
  arrange(year) %>% pull(cigsale)

Yc_pre <- panel_df %>% filter(state != "California", year < TREAT_YEAR) %>%
  pivot_wider(id_cols = year, names_from = state, values_from = cigsale) %>%
  select(-year) %>%
  select(all_of(donors)) %>%
  as.matrix()
stopifnot(ncol(Yc_pre) == 38, nrow(Yc_pre) == length(years_pre))

Yc_post <- panel_df %>% filter(state != "California", year >= TREAT_YEAR) %>%
  pivot_wider(id_cols = year, names_from = state, values_from = cigsale) %>%
  select(-year) %>%
  select(all_of(donors)) %>%
  as.matrix()

# Stage 2: pure horseshoe α-MCMC (no SAR layer)
set.seed(SEED)
alpha_draws_hs <- hs_alpha_gibbs_cpp(
  Y0_pre, Yc_pre, iteration = MCMC_ITER, burn = MCMC_BURN, verbose = FALSE
)
stopifnot(nrow(alpha_draws_hs) == MCMC_ITER - MCMC_BURN,
          ncol(alpha_draws_hs) == 38)
colnames(alpha_draws_hs) <- donors

alpha_hs_summary <- tibble(
  state = donors,
  mean  = colMeans(alpha_draws_hs),
  lo95  = apply(alpha_draws_hs, 2, quantile, probs = 0.025, names = FALSE),
  hi95  = apply(alpha_draws_hs, 2, quantile, probs = 0.975, names = FALSE)
) %>% arrange(desc(mean))

# Synthetic California path (posterior mean weights)
alpha_hat_hs   <- colMeans(alpha_draws_hs)
synth_hs_pre   <- as.numeric(Yc_pre  %*% alpha_hat_hs)
synth_hs_post  <- as.numeric(Yc_post %*% alpha_hat_hs)
gap_hs_pre     <- Y0_pre  - synth_hs_pre
gap_hs_post    <- Y0_post - synth_hs_post

# 95% credible bands on the gap (propagating through α posterior)
gap_pre_draws  <- Y0_pre  - Yc_pre  %*% t(alpha_draws_hs)   # T0 x M_draws
gap_post_draws <- Y0_post - Yc_post %*% t(alpha_draws_hs)
gap_hs_lo_pre  <- apply(gap_pre_draws,  1, quantile, 0.025, names = FALSE)
gap_hs_hi_pre  <- apply(gap_pre_draws,  1, quantile, 0.975, names = FALSE)
gap_hs_lo_post <- apply(gap_post_draws, 1, quantile, 0.025, names = FALSE)
gap_hs_hi_post <- apply(gap_post_draws, 1, quantile, 0.975, names = FALSE)

# Posterior ATT
att_hs_draws <- colMeans(gap_post_draws)
att_hs       <- mean(att_hs_draws)
att_hs_ci    <- quantile(att_hs_draws, c(0.025, 0.975), names = FALSE)

say("Stage 2 ATT (Bayesian HS): {round(att_hs, 2)} packs per capita, ",
    "95% CrI [{round(att_hs_ci[1], 2)}, {round(att_hs_ci[2], 2)}]")
say("Active donors (mean α > 0.01): ",
    "{sum(alpha_hs_summary$mean > 0.01)} of 38")
cat("Top-5 donor weights (Bayesian HS):\n")
print(head(alpha_hs_summary, 5))

write_csv(alpha_hs_summary, glue("{SLUG}_stage2_alpha_posterior.csv"))

stage2_gap_tbl <- tibble(
  year     = c(years_pre, years_post),
  observed = c(Y0_pre, Y0_post),
  synthetic= c(synth_hs_pre, synth_hs_post),
  gap      = c(gap_hs_pre, gap_hs_post),
  gap_lo95 = c(gap_hs_lo_pre, gap_hs_lo_post),
  gap_hi95 = c(gap_hs_hi_pre, gap_hs_hi_post),
  period   = c(rep("pre", length(years_pre)), rep("post", length(years_post)))
)
write_csv(stage2_gap_tbl, glue("{SLUG}_stage2_gap.csv"))

# Figure 02: horseshoe donor weights (shrinkage / sparsity)
p2 <- alpha_hs_summary %>%
  mutate(state = factor(state, levels = rev(state))) %>%
  ggplot(aes(x = mean, y = state)) +
  geom_segment(aes(x = 0, xend = mean, yend = state), colour = TEAL, alpha = 0.6) +
  geom_point(colour = TEAL, size = 2) +
  geom_errorbar(aes(xmin = lo95, xmax = hi95), orientation = "y",
                colour = STEEL, width = 0, alpha = 0.7) +
  geom_vline(xintercept = 0, colour = TEXT, linetype = "dashed", linewidth = 0.3) +
  labs(title = "Stage 2 — Horseshoe posterior on donor weights",
       subtitle = "Posterior mean and 95% credible intervals — most donors shrink toward zero",
       x = expression(paste("Posterior weight ", alpha[j])),
       y = NULL,
       caption = glue("MCMC: {MCMC_ITER} iter, {MCMC_BURN} burn-in (tutorial scale).")) +
  theme_dark_site() +
  theme(axis.text.y = element_text(size = 8))

save_fig(p2, "02_horseshoe_weights", w = 8, h = 9)
say("[OK] Saved {SLUG}_02_horseshoe_weights.png")

# Figure 05: Stage 2 paths + gap with credible band
p5a <- ggplot(stage2_gap_tbl, aes(x = year)) +
  geom_line(aes(y = observed, colour = "California (observed)"),
            linewidth = 1.1) +
  geom_line(aes(y = synthetic, colour = "Synthetic (HS posterior mean)"),
            linewidth = 1.1, linetype = "dashed") +
  geom_vline(xintercept = TREAT_YEAR - 0.5, colour = ORANGE,
             linetype = "dotted", linewidth = 0.6) +
  scale_colour_manual(values = c("California (observed)" = STEEL,
                                 "Synthetic (HS posterior mean)" = TEAL)) +
  labs(title = "Stage 2 — Bayesian SCM with horseshoe priors",
       subtitle = "Per-capita cigarette sales, observed vs. posterior-mean synthetic",
       x = NULL, y = "Cigarette sales per capita", colour = NULL) +
  theme_dark_site() +
  theme(legend.position = "top")

p5b <- ggplot(stage2_gap_tbl, aes(x = year, y = gap)) +
  geom_hline(yintercept = 0, colour = TEXT, linewidth = 0.4) +
  geom_ribbon(aes(ymin = gap_lo95, ymax = gap_hi95),
              fill = STEEL, alpha = 0.25) +
  geom_line(colour = STEEL, linewidth = 1.1) +
  geom_vline(xintercept = TREAT_YEAR - 0.5, colour = ORANGE,
             linetype = "dotted", linewidth = 0.6) +
  labs(title = "Gap (observed − synthetic) with 95% credible band",
       x = "Year", y = "Gap") +
  theme_dark_site()

save_fig(p5a / p5b, "05_stage2_paths", w = 9, h = 8)
say("[OK] Saved {SLUG}_05_stage2_paths.png\n")

cat("[NOTE] Tutorial MCMC = 5k iter; paper uses 100k. ",
    "For inference-grade ESS, increase iterations.\n\n", sep = "")


# ── 5. Stage 3: Bayesian Spatial SCM with SAR spillovers ─────────────────────
cat("--- Section 5: Stage 3 — Bayesian Spatial SCM (SAR) ---\n")

# Use the package's unified entry point: sc_spillover.
# Internally: (a) horseshoe MCMC for α, then (b) SAR ρ MCMC, then (c) post-hoc
# direct/indirect effects from the SAR forward model.
fit_sar <- sc_spillover(
  data            = panel_df,
  treated_unit    = "California",
  w               = w,
  W               = W,
  treatment_dummy = "treatment",
  y               = "cigsale",
  X               = c("retprice"),
  p_factors       = 1,
  M               = MCMC_ITER,
  burn            = MCMC_BURN,
  seed            = SEED,
  step_rho        = 0.01,
  unit_col        = "state",
  time_col        = "year",
  verbose         = FALSE
)

rho_draws <- fit_sar$rho_draws
rho_hat   <- fit_sar$rho_hat
ess_rho   <- coda::effectiveSize(coda::as.mcmc(rho_draws))[[1]]

say("Posterior mean ρ (spatial autocorrelation): {round(rho_hat, 3)} | ",
    "ESS = {round(ess_rho, 0)}")
if (ess_rho < 200) {
  cat("[WARN] ESS(ρ) < 200 — tutorial-scale MCMC; increase to 100k for paper-grade.\n")
}

att_sar       <- fit_sar$effects$ate_point
att_sar_ci    <- fit_sar$effects$ate_ci95
te_sar_series <- fit_sar$effects$te_point   # post-treatment treatment effect over time

say("Stage 3 ATT (Bayesian Spatial SAR): {round(att_sar, 2)} packs per capita, ",
    "95% CrI [{round(att_sar_ci[1], 2)}, {round(att_sar_ci[2], 2)}]")

# CSV: ρ posterior summary
rho_tbl <- tibble(
  parameter = "rho",
  mean      = mean(rho_draws),
  sd        = sd(rho_draws),
  q025      = quantile(rho_draws, 0.025, names = FALSE),
  q500      = quantile(rho_draws, 0.5,   names = FALSE),
  q975      = quantile(rho_draws, 0.975, names = FALSE),
  ess       = ess_rho
)
write_csv(rho_tbl, glue("{SLUG}_stage3_rho_posterior.csv"))

# Spillover effects on donor states (averaged over post-treatment period)
spill_mat   <- fit_sar$effects$spill              # (T0+T1) x N
times_all   <- as.numeric(rownames(spill_mat))
post_idx    <- which(times_all >= TREAT_YEAR)
spill_post  <- spill_mat[post_idx, , drop = FALSE]
spill_state <- colnames(spill_mat)

# Posterior-mean average spillover per donor over the post-treatment period
spill_avg <- colMeans(spill_post)
spill_df  <- tibble(state = spill_state, avg_spillover = spill_avg) %>%
  arrange(avg_spillover)
write_csv(spill_df, glue("{SLUG}_stage3_spillover_effects.csv"))

# Top-8 by absolute magnitude
top8 <- spill_df %>%
  mutate(abs_eff = abs(avg_spillover)) %>%
  slice_max(abs_eff, n = 8) %>%
  arrange(avg_spillover)
cat("Top-8 spillover-receiving donor states (post-period mean effect):\n")
print(top8)

# Figure 03: spillover bar chart
p3 <- top8 %>%
  mutate(state = factor(state, levels = state),
         sign  = if_else(avg_spillover >= 0, "positive", "negative")) %>%
  ggplot(aes(x = avg_spillover, y = state, fill = sign)) +
  geom_col(width = 0.65, alpha = 0.95) +
  geom_vline(xintercept = 0, colour = TEXT, linewidth = 0.4) +
  scale_fill_manual(values = c(positive = TEAL, negative = ORANGE), guide = "none") +
  labs(title = "Stage 3 — Top spillover effects on donor states (SAR posterior)",
       subtitle = glue("Post-treatment mean effect ({TREAT_YEAR}-{max(years_all)}). ",
                       "Teal = positive (consumption rose), orange = negative (consumption fell)."),
       x = "Average post-treatment spillover (packs per capita)",
       y = NULL,
       caption = glue("ρ posterior mean = {round(rho_hat, 3)}.")) +
  theme_dark_site()

save_fig(p3, "03_spillover_effects")
say("[OK] Saved {SLUG}_03_spillover_effects.png")

# Stage 3 trajectory: observed vs SAR-synthetic
ycf_post <- Y0_post - te_sar_series              # synthetic California (post)
stage3_gap_tbl <- tibble(
  year      = years_post,
  observed  = Y0_post,
  synthetic = as.numeric(ycf_post),
  gap       = as.numeric(te_sar_series)
)
write_csv(stage3_gap_tbl, glue("{SLUG}_stage3_gap.csv"))

p6a <- bind_rows(
    tibble(year = years_pre, observed = Y0_pre,
           synthetic = as.numeric(Yc_pre %*% fit_sar$alpha_hat)),
    tibble(year = years_post, observed = Y0_post,
           synthetic = as.numeric(ycf_post))
  ) %>%
  ggplot(aes(x = year)) +
  geom_line(aes(y = observed, colour = "California (observed)"),
            linewidth = 1.1) +
  geom_line(aes(y = synthetic, colour = "Synthetic (SAR + horseshoe)"),
            linewidth = 1.1, linetype = "dashed") +
  geom_vline(xintercept = TREAT_YEAR - 0.5, colour = ORANGE,
             linetype = "dotted", linewidth = 0.6) +
  scale_colour_manual(values = c("California (observed)" = STEEL,
                                 "Synthetic (SAR + horseshoe)" = TEAL)) +
  labs(title = "Stage 3 — Bayesian Spatial Synthetic Control",
       subtitle = "Per-capita cigarette sales, observed vs. SAR-spillover-corrected synthetic",
       x = NULL, y = "Cigarette sales per capita", colour = NULL) +
  theme_dark_site() +
  theme(legend.position = "top")

p6b <- ggplot(stage3_gap_tbl, aes(x = year, y = gap)) +
  geom_hline(yintercept = 0, colour = TEXT, linewidth = 0.4) +
  geom_line(colour = STEEL, linewidth = 1.1) +
  geom_vline(xintercept = TREAT_YEAR - 0.5, colour = ORANGE,
             linetype = "dotted", linewidth = 0.6) +
  labs(title = glue("Treatment effect over time (ATT = {round(att_sar, 2)})"),
       x = "Year", y = "Treatment effect (packs per capita)") +
  theme_dark_site()

save_fig(p6a / p6b, "06_stage3_paths", w = 9, h = 8)
say("[OK] Saved {SLUG}_06_stage3_paths.png\n")

# Prior predictive check using the package's prior_predictive() function.
# Note: that helper references W and w from the enclosing R environment (a
# package quirk); we have already bound them globally, so the call works.
cat("--- Prior predictive check (Stage 2/3 prior compatibility) ---\n")
Xc_pre_arr <- panel_df %>%
  filter(state != "California", year < TREAT_YEAR) %>%
  pivot_wider(id_cols = year, names_from = state, values_from = retprice) %>%
  select(-year) %>% select(all_of(donors)) %>% as.matrix()
dim(Xc_pre_arr) <- c(nrow(Xc_pre_arr), ncol(Xc_pre_arr), 1)

alpha_hat_for_ppc <- colMeans(fit_sar$alpha_draws)

ppc <- prior_predictive(
  Y0_pre           = as.matrix(Y0_pre),
  Yc_obs           = Yc_pre,
  W_raw            = W,
  w_raw            = w,
  alpha_hat_scaled = alpha_hat_for_ppc,
  Xc_pre           = Xc_pre_arr,
  p                = 0L,
  a0               = 3,
  b0               = 1,
  rho_support      = c(-0.99, 0.99),
  R                = 1000L,
  seed             = SEED
)

# Tidy long format for plotting
keep_stats <- c("yc_mean", "spatial_quadratic", "ac1", "pve_pc1")
clean_names <- function(x) gsub("\\\\", "", x)
sim_long <- ppc$stat %>%
  as_tibble(.name_repair = "minimal") %>%
  rename_with(clean_names) %>%
  select(all_of(keep_stats)) %>%
  pivot_longer(everything(), names_to = "statistic", values_to = "value")

obs_vec <- ppc$observed
names(obs_vec) <- clean_names(names(obs_vec))
obs_long <- tibble(statistic = names(obs_vec), value = as.numeric(obs_vec)) %>%
  filter(statistic %in% keep_stats)

stat_labels <- c(yc_mean = "Mean of donor outcomes",
                 spatial_quadratic = "Spatial quadratic form",
                 ac1 = "Lag-1 autocorrelation",
                 pve_pc1 = "PVE of PC1")

p4 <- ggplot(sim_long, aes(x = value)) +
  geom_histogram(bins = 40, fill = STEEL, colour = NA, alpha = 0.75) +
  geom_vline(data = obs_long, aes(xintercept = value),
             colour = ORANGE, linewidth = 1) +
  facet_wrap(~ statistic, scales = "free", ncol = 2,
             labeller = labeller(statistic = stat_labels)) +
  labs(title = "Stage 2/3 — Prior predictive check",
       subtitle = "Simulated statistics under the prior (blue) vs. observed value (orange)",
       x = "Statistic value", y = "Frequency",
       caption = glue("R = 1000 prior draws. Observed value should sit within the prior cloud.")) +
  theme_dark_site() +
  theme(strip.text = element_text(size = 10))

save_fig(p4, "04_prior_predictive", w = 9, h = 7)
say("[OK] Saved {SLUG}_04_prior_predictive.png\n")


# ── 6. Cross-stage ATT comparison table ──────────────────────────────────────
cat("--- Section 6: Cross-stage ATT comparison ---\n")

n_active_classic <- sum(w_classic$weight > 0.01)
n_active_hs      <- sum(alpha_hs_summary$mean > 0.01)
n_active_sar     <- sum(abs(fit_sar$alpha_hat) > 0.01)

# Build the SAR note before constructing the tibble — referencing `ess_rho`
# inside a `tibble()` call that also defines an `ess_rho` column would let the
# column (length 3) shadow the scalar via tibble's left-to-right data masking.
sar_note <- paste0("SAR ρ=", round(rho_hat, 3),
                   "; SUTVA relaxed; CrI artificially narrow ",
                   "because ESS(ρ)=", round(ess_rho, 0))

att_table <- tibble(
  stage              = c("Classical SCM (tidysynth)",
                         "Bayesian HS (no spillovers)",
                         "Bayesian Spatial SAR (with spillovers)"),
  att                = c(att_classic, att_hs, att_sar),
  lo95               = c(att_classic_ci[1], att_hs_ci[1], att_sar_ci[1]),
  hi95               = c(att_classic_ci[2], att_hs_ci[2], att_sar_ci[2]),
  active_donors_n    = c(n_active_classic, n_active_hs, n_active_sar),
  ess_rho            = c(NA_real_, NA_real_, round(ess_rho, 0)),
  notes              = c("Quadratic programming on simplex (Abadie 2010)",
                         "Horseshoe shrinkage; SUTVA imposed",
                         sar_note)
)
write_csv(att_table, glue("{SLUG}_att_comparison.csv"))
cat("ATT comparison across the three stages:\n")
print(att_table %>%
        mutate(across(c(att, lo95, hi95), ~ round(.x, 2))))


# ── 7. Summary and cleanup ───────────────────────────────────────────────────
cat("\n--- Section 7: Summary ---\n")
say("\nHEADLINE (California Prop 99, ATT on per-capita cigarette sales):")
say("  Classical SCM       : {round(att_classic, 2)} ",
    "[{round(att_classic_ci[1], 2)}, {round(att_classic_ci[2], 2)}]")
say("  Bayesian Horseshoe  : {round(att_hs, 2)} ",
    "[{round(att_hs_ci[1], 2)}, {round(att_hs_ci[2], 2)}]")
say("  Bayesian Spatial SAR: {round(att_sar, 2)} ",
    "[{round(att_sar_ci[1], 2)}, {round(att_sar_ci[2], 2)}]  ",
    "ESS(ρ) = {round(ess_rho, 0)}")
say("\nSpatial autocorrelation: ρ̂ = {round(rho_hat, 3)} ",
    "(95% CrI [{round(quantile(rho_draws, 0.025), 3)}, ",
    "{round(quantile(rho_draws, 0.975), 3)}])")

cat("\n[CAVEAT] This run used 5,000 MCMC iterations (2,500 burn-in) for ",
    "tutorial speed.\nThe published paper uses 100,000 iterations. ",
    "Posterior credible intervals from this script should be interpreted as ",
    "illustrative; rerun with M=100000, burn=50000 for inference-grade ",
    "reproducibility.\n", sep = "")

if (file.exists("Rplots.pdf")) {
  file.remove("Rplots.pdf")
  cat("[OK] Cleaned up Rplots.pdf\n")
}

cat("\n=== Script completed successfully ===\n")
