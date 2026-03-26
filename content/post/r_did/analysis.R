# ============================================================
# Difference-in-Differences for Policy Evaluation
# Standalone R script for carlos-mendez.org
# ============================================================
#
# Based on Brantly Callaway's DID Workshop at LSU
# and Callaway (2022) "Difference-in-Differences for Policy Evaluation"
#
# This script generates all figures for the blog post.
# Run: Rscript analysis.R
# Output: 8 PNG files in the current directory
# ============================================================

# --- 0. Packages ---
cran_packages <- c(
  "did",           # Callaway & Sant'Anna DID estimator
  "fixest",        # fast fixed effects estimation (feols)
  "HonestDiD",     # Rambachan & Roth sensitivity analysis
  "DRDID",         # doubly robust DID estimators
  "BMisc",         # utilities for the did package
  "modelsummary",  # regression tables
  "ggplot2",       # visualization
  "dplyr",         # data manipulation
  "pte",           # policy treatment effects (lagged outcomes)
  "qte"            # quantile treatment effects (change-in-changes)
)

missing_cran <- cran_packages[!sapply(cran_packages, requireNamespace, quietly = TRUE)]
if (length(missing_cran) > 0) {
  install.packages(missing_cran, repos = "https://cloud.r-project.org")
}

# twfeweights is GitHub-only
if (!requireNamespace("twfeweights", quietly = TRUE)) {
  if (!requireNamespace("remotes", quietly = TRUE)) {
    install.packages("remotes", repos = "https://cloud.r-project.org")
  }
  remotes::install_github("bcallaway11/twfeweights")
}

library(did)
library(fixest)
library(twfeweights)
library(HonestDiD)
library(DRDID)
library(BMisc)
library(modelsummary)
library(ggplot2)
library(dplyr)
library(pte)
library(qte)

# --- Site color palette ---
STEEL_BLUE   <- "#6a9bcc"
WARM_ORANGE  <- "#d97757"
NEAR_BLACK   <- "#141413"
TEAL         <- "#00d4c8"
HEADING_BLUE <- "#1a3a8a"

# --- Dark navy background palette ---
DARK_BG      <- "#0f1729"
DARK_PANEL   <- "#1f2b5e"
LIGHT_TEXT   <- "#c8d0e0"
LIGHTER_TEXT <- "#e8ecf2"

# --- Custom ggplot theme (dark background) ---
theme_site <- function(base_size = 14) {
  theme_minimal(base_size = base_size) %+replace%
    theme(
      text = element_text(color = LIGHTER_TEXT),
      plot.title = element_text(color = LIGHTER_TEXT, face = "bold", size = rel(1.1)),
      plot.subtitle = element_text(color = LIGHT_TEXT, size = rel(0.85)),
      plot.background = element_rect(fill = DARK_BG, color = NA),
      panel.background = element_rect(fill = DARK_BG, color = NA),
      panel.grid.major = element_line(color = DARK_PANEL, linewidth = 0.3),
      panel.grid.minor = element_blank(),
      axis.text = element_text(color = LIGHT_TEXT),
      legend.position = "bottom",
      legend.background = element_rect(fill = DARK_BG, color = NA),
      legend.key = element_rect(fill = DARK_BG, color = NA),
      legend.text = element_text(color = LIGHT_TEXT),
      legend.title = element_text(color = LIGHTER_TEXT),
      strip.text = element_text(color = LIGHTER_TEXT, face = "bold")
    )
}

# ============================================================
# --- 1. Load and prepare data ---
# ============================================================
cat("Loading minimum wage data from GitHub...\n")
load(url("https://github.com/bcallaway11/did_chapter/raw/master/mw_data_ch2.RData"))

# Filter: drop NE region and keep groups 0, 2004, 2006, 2007
mw_data_ch2 <- subset(mw_data_ch2, (G %in% c(2004, 2006, 2007, 0)) & (region != "1"))

cat("Full dataset:", nrow(mw_data_ch2), "observations\n")
cat("Variables:", paste(names(mw_data_ch2), collapse = ", "), "\n")

# Main analysis subset: drop G=2007, keep year >= 2003
data2 <- subset(mw_data_ch2, G != 2007 & year >= 2003)

cat("\ndata2 subset:", nrow(data2), "observations\n")
cat("Years:", paste(sort(unique(data2$year)), collapse = ", "), "\n")
cat("Groups:", paste(sort(unique(data2$G)), collapse = ", "), "\n")

# Group counts
group_counts <- data2 %>%
  filter(year == 2003) %>%
  group_by(G) %>%
  summarise(n_counties = n(), .groups = "drop")
cat("\nCounties by group:\n")
print(as.data.frame(group_counts))

# Summary statistics
cat("\nSummary statistics for key variables:\n")
cat("lemp (log teen employment):\n")
print(summary(data2$lemp))
cat("\nlpop (log population):\n")
print(summary(data2$lpop))
cat("\nlavg_pay (log average pay):\n")
print(summary(data2$lavg_pay))

# ============================================================
# --- 2. TWFE baseline regression ---
# ============================================================
cat("\n--- TWFE Regression ---\n")
twfe_res <- fixest::feols(lemp ~ post | id + year,
                          data = data2,
                          cluster = "id")
cat("TWFE coefficient on 'post':\n")
print(summary(twfe_res))

# ============================================================
# --- 3. Group-time ATT ---
# ============================================================
cat("\n--- Group-Time ATT (Callaway & Sant'Anna) ---\n")
attgt <- did::att_gt(yname = "lemp",
                     idname = "id",
                     gname = "G",
                     tname = "year",
                     data = data2,
                     control_group = "nevertreated",
                     base_period = "universal")

cat("\nATT(g,t) estimates:\n")
attgt_tidy <- tidy(attgt)[, 1:5]
print(as.data.frame(attgt_tidy))

# ============================================================
# --- 4. Aggregation: Overall ATT and Event Study ---
# ============================================================
cat("\n--- Overall ATT ---\n")
attO <- did::aggte(attgt, type = "group")
summary(attO)

cat("\n--- Event Study ---\n")
attes <- did::aggte(attgt, type = "dynamic")
summary(attes)

# ============================================================
# --- Figure 1: TWFE Event Study ---
# ============================================================
cat("\nGenerating Figure 1: TWFE Event Study...\n")

# Create event-time dummies for TWFE event study
data2_es <- data2 %>%
  mutate(
    event_time = ifelse(G == 0, -Inf, year - G),
    treated = ifelse(G != 0, 1, 0)
  ) %>%
  filter(is.finite(event_time) | G == 0)

# Use fixest sunab for TWFE event study
twfe_es <- fixest::feols(lemp ~ sunab(G, year) | id + year,
                         data = subset(data2, G != 0 | G == 0),
                         cluster = "id")

es_coefs <- as.data.frame(coef(twfe_es))
es_coefs$event_time <- as.numeric(gsub("year::", "", rownames(es_coefs)))
names(es_coefs)[1] <- "estimate"

# Get confidence intervals
ci <- confint(twfe_es)
es_coefs$ci_lower <- ci[, 1]
es_coefs$ci_upper <- ci[, 2]

# Add reference period (e = -1)
ref_row <- data.frame(estimate = 0, event_time = -1, ci_lower = 0, ci_upper = 0)
es_coefs <- rbind(es_coefs, ref_row)
es_coefs <- es_coefs[order(es_coefs$event_time), ]

p1 <- ggplot(es_coefs, aes(x = event_time, y = estimate)) +
  geom_hline(yintercept = 0, color = WARM_ORANGE, linewidth = 0.8, linetype = "dashed") +
  geom_vline(xintercept = -0.5, color = LIGHT_TEXT, linewidth = 0.5, linetype = "dotted") +
  geom_errorbar(aes(ymin = ci_lower, ymax = ci_upper), width = 0.2, color = STEEL_BLUE, linewidth = 0.6) +
  geom_line(color = STEEL_BLUE, linewidth = 1) +
  geom_point(color = STEEL_BLUE, size = 3) +
  labs(title = "TWFE Event Study",
       subtitle = "Two-way fixed effects regression with Sun-Abraham correction",
       x = "Event Time (years relative to treatment)",
       y = "Estimate") +
  theme_site()

ggsave("r_did_01_twfe_event_study.png", p1,
       width = 10, height = 6, dpi = 300, bg = DARK_BG)
cat("Saved r_did_01_twfe_event_study.png\n")

# ============================================================
# --- Figure 2: Group-Time ATT Plot ---
# ============================================================
cat("\nGenerating Figure 2: Group-Time ATT Plot...\n")

# Extract ATT(g,t) data for custom plot
attgt_df <- data.frame(
  group = attgt$group,
  time = attgt$t,
  att = attgt$att,
  se = attgt$se,
  ci_lower = attgt$att - 1.96 * attgt$se,
  ci_upper = attgt$att + 1.96 * attgt$se,
  post = ifelse(attgt$t >= attgt$group, "Post-treatment", "Pre-treatment")
)
attgt_df$group_label <- paste0("G = ", attgt_df$group)

p2 <- ggplot(attgt_df, aes(x = time, y = att, color = post)) +
  geom_hline(yintercept = 0, color = WARM_ORANGE, linewidth = 0.8, linetype = "dashed") +
  geom_errorbar(aes(ymin = ci_lower, ymax = ci_upper), width = 0.2, linewidth = 0.6) +
  geom_point(size = 3) +
  facet_wrap(~ group_label, ncol = 1) +
  scale_color_manual(values = c("Post-treatment" = STEEL_BLUE, "Pre-treatment" = LIGHT_TEXT),
                     name = "") +
  labs(title = "Group-Time Average Treatment Effects",
       subtitle = "ATT(g,t) estimated via Callaway & Sant'Anna (2021)",
       x = "Calendar Year",
       y = "ATT(g,t)") +
  theme_site() +
  theme(legend.position = "bottom")

ggsave("r_did_02_attgt.png", p2,
       width = 10, height = 8, dpi = 300, bg = DARK_BG)
cat("Saved r_did_02_attgt.png\n")

# ============================================================
# --- Figure 3: Callaway-Sant'Anna Event Study ---
# ============================================================
cat("\nGenerating Figure 3: CS Event Study...\n")

es_df <- data.frame(
  event_time = attes$egt,
  att = attes$att.egt,
  se = attes$se.egt,
  ci_lower = attes$att.egt - 1.96 * attes$se.egt,
  ci_upper = attes$att.egt + 1.96 * attes$se.egt
)

p3 <- ggplot(es_df, aes(x = event_time, y = att)) +
  geom_hline(yintercept = 0, color = WARM_ORANGE, linewidth = 0.8, linetype = "dashed") +
  geom_vline(xintercept = -0.5, color = LIGHT_TEXT, linewidth = 0.5, linetype = "dotted") +
  geom_errorbar(aes(ymin = ci_lower, ymax = ci_upper), width = 0.2, color = STEEL_BLUE, linewidth = 0.6) +
  geom_line(color = STEEL_BLUE, linewidth = 1) +
  geom_point(color = STEEL_BLUE, size = 3) +
  labs(title = "Event Study: Callaway & Sant'Anna",
       subtitle = "Aggregated ATT(g,t) by event time, never-treated comparison group",
       x = "Event Time (years relative to treatment)",
       y = "ATT") +
  theme_site()

ggsave("r_did_03_cs_event_study.png", p3,
       width = 10, height = 6, dpi = 300, bg = DARK_BG)
cat("Saved r_did_03_cs_event_study.png\n")

# ============================================================
# --- 5. TWFE Weight Decomposition ---
# ============================================================
cat("\n--- TWFE Weight Decomposition ---\n")
tw_obj <- twfeweights::twfe_weights(attgt)
tw <- tw_obj$weights_df  # extract data frame from mp_weights_obj

twfe_est <- sum(tw$weight * tw$attgt)
cat("TWFE estimate from weights:", round(twfe_est, 4), "\n")

# ATT^O weights
wO_obj <- attO_weights(attgt)
wO <- wO_obj$weights_df
attO_est <- sum(wO$weight * wO$attgt)
cat("ATT^O estimate from weights:", round(attO_est, 4), "\n")

# Bias decomposition
twfe_post <- sum(tw$weight[tw$post == 1] * tw$attgt[tw$post == 1])
pre_bias <- sum(tw$weight[tw$post == 0] * tw$attgt[tw$post == 0])
twfe_bias <- twfe_est - attO_est
cat("TWFE post-treatment component:", round(twfe_post, 4), "\n")
cat("Pre-treatment contamination:", round(pre_bias, 4), "\n")
cat("Total TWFE bias:", round(twfe_bias, 4), "\n")
if (abs(twfe_bias) > 1e-10) {
  cat("Fraction of bias from pre-treatment:", round(pre_bias / twfe_bias, 4), "\n")
  cat("Fraction of bias from post-treatment weighting:", round((twfe_post - attO_est) / twfe_bias, 4), "\n")
}

# ============================================================
# --- Figure 4: TWFE Weights Scatter Plot ---
# ============================================================
cat("\nGenerating Figure 4: TWFE Weights Scatter Plot...\n")

plot_df4 <- tw
plot_df4$wOgt <- wO$weight
plot_df4$post_label <- ifelse(plot_df4$post == 1, "Post-treatment", "Pre-treatment")
plot_df4$g_t <- paste0("(", plot_df4$group, ",", plot_df4$time.period, ")")

p4 <- ggplot(plot_df4, aes(x = weight, y = attgt, color = post_label)) +
  geom_hline(yintercept = 0, color = LIGHT_TEXT, linewidth = 0.8) +
  geom_vline(xintercept = 0, color = LIGHT_TEXT, linewidth = 0.8) +
  geom_point(size = 5, alpha = 0.8) +
  geom_point(data = subset(plot_df4, post == 1),
             aes(x = wOgt, y = attgt),
             shape = 18, size = 7, color = TEAL, alpha = 0.7) +
  scale_color_manual(values = c("Post-treatment" = STEEL_BLUE, "Pre-treatment" = WARM_ORANGE),
                     name = "TWFE weights") +
  labs(title = "TWFE Weights vs. Group-Time ATTs",
       subtitle = "Circles = TWFE weights, Teal diamonds = ATT^O weights (post-treatment only)",
       x = "Weight",
       y = "ATT(g,t)") +
  ylim(c(-0.15, 0.05)) +
  xlim(c(-0.4, 0.7)) +
  theme_site()

ggsave("r_did_04_twfe_weights.png", p4,
       width = 10, height = 7, dpi = 300, bg = DARK_BG)
cat("Saved r_did_04_twfe_weights.png\n")

# ============================================================
# --- 6. Conditional Parallel Trends (Doubly Robust) ---
# ============================================================
cat("\n--- Conditional Parallel Trends ---\n")

# Unconditional (baseline, already computed)
cat("Unconditional ATT^O:", round(attO$overall.att, 4),
    "(SE:", round(attO$overall.se, 4), ")\n")

# Regression adjustment
cs_reg <- att_gt(yname = "lemp", tname = "year", idname = "id", gname = "G",
                 xformla = ~lpop + lavg_pay,
                 control_group = "nevertreated", base_period = "universal",
                 est_method = "reg", data = data2)
attO_reg <- aggte(cs_reg, type = "group")
cat("Regression adj. ATT^O:", round(attO_reg$overall.att, 4),
    "(SE:", round(attO_reg$overall.se, 4), ")\n")

# IPW
cs_ipw <- att_gt(yname = "lemp", tname = "year", idname = "id", gname = "G",
                 xformla = ~lpop + lavg_pay,
                 control_group = "nevertreated", base_period = "universal",
                 est_method = "ipw", data = data2)
attO_ipw <- aggte(cs_ipw, type = "group")
cat("IPW ATT^O:", round(attO_ipw$overall.att, 4),
    "(SE:", round(attO_ipw$overall.se, 4), ")\n")

# Doubly robust
cs_dr <- att_gt(yname = "lemp", tname = "year", idname = "id", gname = "G",
                xformla = ~lpop + lavg_pay,
                control_group = "nevertreated", base_period = "universal",
                est_method = "dr", data = data2)
attO_dr <- aggte(cs_dr, type = "group")
cat("Doubly robust ATT^O:", round(attO_dr$overall.att, 4),
    "(SE:", round(attO_dr$overall.se, 4), ")\n")

# DR event study
cs_dr_dyn <- aggte(cs_dr, type = "dynamic")
summary(cs_dr_dyn)

# ============================================================
# --- Figure 5: Doubly Robust Event Study ---
# ============================================================
cat("\nGenerating Figure 5: Doubly Robust Event Study...\n")

dr_es_df <- data.frame(
  event_time = cs_dr_dyn$egt,
  att = cs_dr_dyn$att.egt,
  se = cs_dr_dyn$se.egt,
  ci_lower = cs_dr_dyn$att.egt - 1.96 * cs_dr_dyn$se.egt,
  ci_upper = cs_dr_dyn$att.egt + 1.96 * cs_dr_dyn$se.egt
)

p5 <- ggplot(dr_es_df, aes(x = event_time, y = att)) +
  geom_hline(yintercept = 0, color = WARM_ORANGE, linewidth = 0.8, linetype = "dashed") +
  geom_vline(xintercept = -0.5, color = LIGHT_TEXT, linewidth = 0.5, linetype = "dotted") +
  geom_errorbar(aes(ymin = ci_lower, ymax = ci_upper), width = 0.2, color = STEEL_BLUE, linewidth = 0.6) +
  geom_line(color = STEEL_BLUE, linewidth = 1) +
  geom_point(color = STEEL_BLUE, size = 3) +
  labs(title = "Doubly Robust Event Study",
       subtitle = "Conditional on region, log population, and log average pay",
       x = "Event Time (years relative to treatment)",
       y = "ATT") +
  theme_site()

ggsave("r_did_05_dr_event_study.png", p5,
       width = 10, height = 6, dpi = 300, bg = DARK_BG)
cat("Saved r_did_05_dr_event_study.png\n")

# ============================================================
# --- 7. Robustness Checks ---
# ============================================================
cat("\n--- Robustness Checks ---\n")

# Varying base period
cs_varying <- att_gt(yname = "lemp", tname = "year", idname = "id", gname = "G",
                     xformla = ~lpop + lavg_pay,
                     control_group = "nevertreated", base_period = "varying",
                     est_method = "dr", data = data2)
attO_varying <- aggte(cs_varying, type = "group")
cat("Varying base period ATT^O:", round(attO_varying$overall.att, 4),
    "(SE:", round(attO_varying$overall.se, 4), ")\n")

# Not-yet-treated
cs_nyt <- att_gt(yname = "lemp", tname = "year", idname = "id", gname = "G",
                 xformla = ~lpop + lavg_pay,
                 control_group = "notyettreated", base_period = "universal",
                 est_method = "dr", data = data2)
attO_nyt <- aggte(cs_nyt, type = "group")
cat("Not-yet-treated ATT^O:", round(attO_nyt$overall.att, 4),
    "(SE:", round(attO_nyt$overall.se, 4), ")\n")

# Anticipation
cs_antic <- att_gt(yname = "lemp", tname = "year", idname = "id", gname = "G",
                   xformla = ~lpop + lavg_pay,
                   control_group = "nevertreated", base_period = "universal",
                   est_method = "dr", anticipation = 1, data = data2)
attO_antic <- aggte(cs_antic, type = "group")
cat("With anticipation (1 period) ATT^O:", round(attO_antic$overall.att, 4),
    "(SE:", round(attO_antic$overall.se, 4), ")\n")

# ============================================================
# --- 8. HonestDiD Sensitivity Analysis ---
# ============================================================
cat("\n--- HonestDiD Sensitivity Analysis ---\n")

# Source the helper function
source("references/honest_did.R")

# Re-estimate unconditional for clean sensitivity analysis
attgt_hd <- did::att_gt(yname = "lemp", idname = "id", gname = "G", tname = "year",
                        data = data2, control_group = "nevertreated",
                        base_period = "universal")

cs_es_hd <- aggte(attgt_hd, type = "dynamic")

# Relative magnitude
hd_rm <- honest_did(es = cs_es_hd, e = 0, type = "relative_magnitude")
cat("\nHonestDiD Relative Magnitude Results:\n")
cat("Original CI:\n")
print(hd_rm$orig_ci)
cat("Robust CIs:\n")
print(hd_rm$robust_ci)

# Smoothness (may fail with newer package versions)
tryCatch({
  hd_sm <- honest_did(es = cs_es_hd, e = 0, type = "smoothness")
  cat("\nHonestDiD Smoothness Results:\n")
  print(hd_sm$robust_ci)
}, error = function(e) {
  cat("\nSmootness test skipped (compatibility issue):", e$message, "\n")
})

# ============================================================
# --- Figure 6: HonestDiD Sensitivity Plot ---
# ============================================================
cat("\nGenerating Figure 6: HonestDiD Sensitivity Plot...\n")

# Extract data for custom plot
rm_df <- as.data.frame(hd_rm$robust_ci)
# Mbar column may already be numeric
if (is.character(rm_df$Mbar)) rm_df$Mbar <- as.numeric(gsub("Mbar=", "", rm_df$Mbar))
orig_ci_df <- as.data.frame(hd_rm$orig_ci)
orig_lower <- orig_ci_df$lb[1]
orig_upper <- orig_ci_df$ub[1]
cat("Original CI: [", round(orig_lower, 4), ",", round(orig_upper, 4), "]\n")
cat("Breakdown: CI includes 0 at Mbar =", round(rm_df$Mbar[min(which(rm_df$ub >= 0))], 2), "\n")

p6 <- ggplot(rm_df, aes(x = Mbar)) +
  geom_hline(yintercept = 0, color = WARM_ORANGE, linewidth = 0.8, linetype = "dashed") +
  geom_ribbon(aes(ymin = lb, ymax = ub), fill = STEEL_BLUE, alpha = 0.15) +
  geom_line(aes(y = lb), color = STEEL_BLUE, linewidth = 0.8) +
  geom_line(aes(y = ub), color = STEEL_BLUE, linewidth = 0.8) +
  # Original CI as horizontal band at Mbar = 0
  annotate("rect", xmin = -0.1, xmax = 0.15, ymin = orig_lower, ymax = orig_upper,
           fill = TEAL, alpha = 0.3) +
  annotate("segment", x = 0, xend = 0, y = orig_lower, yend = orig_upper,
           color = TEAL, linewidth = 2) +
  labs(title = "HonestDiD: Relative Magnitude Sensitivity",
       subtitle = "How robust is the on-impact effect to violations of parallel trends?",
       x = expression(bar(M) ~ "(relative magnitude of PT violations)"),
       y = "Confidence Interval for ATT(e=0)") +
  theme_site()

ggsave("r_did_06_honestdid.png", p6,
       width = 10, height = 6, dpi = 300, bg = DARK_BG)
cat("Saved r_did_06_honestdid.png\n")

# ============================================================
# --- 9. More Complicated Treatment Regimes ---
# ============================================================
cat("\n--- Treatment Dose Heterogeneity ---\n")

# Use full data with G=2007 for dose analysis
data3 <- subset(mw_data_ch2, year >= 2003)

# Get list of treated states
treated_state_list <- unique(subset(data3, G != 0)$state_name)
cat("Treated states:", paste(treated_state_list, collapse = ", "), "\n")

# ============================================================
# --- Figure 7: State Minimum Wage Trajectories ---
# ============================================================
cat("\nGenerating Figure 7: State Minimum Wage Trajectories...\n")

plot_df7 <- unique(select(subset(data3, G != 0 & !is.na(state_mw)), state_name, state_mw, year))

# Color palette for states
n_states <- length(unique(plot_df7$state_name))
state_colors <- c(STEEL_BLUE, WARM_ORANGE, TEAL, LIGHTER_TEXT, "#9b59b6",
                  "#f39c12", "#e74c3c", "#2ecc71", "#3498db", "#e67e22",
                  "#1abc9c", "#95a5a6")[1:n_states]

p7 <- ggplot(plot_df7, aes(x = year, y = state_mw, color = state_name)) +
  geom_hline(yintercept = 5.15, color = WARM_ORANGE, linewidth = 0.8, linetype = "dashed") +
  geom_line(linewidth = 1) +
  geom_point(size = 2) +
  annotate("text", x = 2003.2, y = 5.25, label = "Federal MW ($5.15)",
           color = WARM_ORANGE, hjust = 0, size = 3.5) +
  scale_color_manual(values = state_colors, name = "State") +
  labs(title = "State Minimum Wage Trajectories",
       subtitle = "Treated states raised their MW above the federal level at different times",
       x = "Year",
       y = "State Minimum Wage ($)") +
  theme_site() +
  theme(legend.position = "right",
        legend.text = element_text(size = 8))

ggsave("r_did_07_state_mw.png", p7,
       width = 12, height = 7, dpi = 300, bg = DARK_BG)
cat("Saved r_did_07_state_mw.png\n")

# ============================================================
# --- 10. ATT per dollar computation ---
# ============================================================
cat("\n--- ATT Per Dollar Computation ---\n")

res <- list()
counter <- 1
for (i in seq_along(treated_state_list)) {
  state <- treated_state_list[i]
  g <- unique(subset(data3, state_name == state)$G)
  base_period_yr <- g - 1
  for (period in 2004:2007) {
    Y1_treated <- subset(data3, state_name == state & year == period)$lemp
    Y1_untreated <- subset(data3, G == 0 & year == period)$lemp
    Y0_treated <- subset(data3, state_name == state & year == base_period_yr)$lemp
    Y0_untreated <- subset(data3, G == 0 & year == base_period_yr)$lemp
    Y1 <- c(Y1_treated, Y1_untreated)
    Y0 <- c(Y0_treated, Y0_untreated)
    D <- c(rep(1, length(Y1_treated)), rep(0, length(Y1_untreated)))
    if (length(Y1_treated) > 0 && length(Y0_treated) > 0) {
      attst <- DRDID::drdid_panel(Y1, Y0, D, covariates = NULL)
      state_mw_val <- unique(subset(data3, state_name == state & year == period)$state_mw)
      treat_amount <- state_mw_val - 5.15
      if (!is.na(treat_amount) && length(treat_amount) == 1 && treat_amount > 0) {
        res[[counter]] <- data.frame(
          state = state, year = period, attst = attst$ATT, attst.se = attst$se,
          treat_amount = treat_amount,
          attst.per = attst$ATT / treat_amount,
          attst.per.se = attst$se / treat_amount,
          g = g, state_size = sum(D == 1)
        )
        counter <- counter + 1
      }
    }
  }
}

result_df <- do.call(rbind.data.frame, res)
post_res <- subset(result_df, year >= g)
post_res$event_time <- post_res$year - post_res$g

cat("\nATT per dollar by state and year:\n")
print(post_res[, c("state", "year", "event_time", "attst.per", "attst.per.se")])

# Event study ATT per dollar
es_att_per <- c()
es_se_per <- c()
event_times_avail <- sort(unique(post_res$event_time))
for (e in event_times_avail) {
  this_res <- subset(post_res, event_time == e)
  es_att_per <- c(es_att_per, weighted.mean(this_res$attst.per, this_res$state_size))
  es_se_per <- c(es_se_per, weighted.mean(this_res$attst.per.se, this_res$state_size))
}

es_per_df <- data.frame(
  event_time = event_times_avail,
  att = es_att_per,
  se = es_se_per,
  ci_lower = es_att_per - 1.96 * es_se_per,
  ci_upper = es_att_per + 1.96 * es_se_per
)

cat("\nEvent study ATT per dollar:\n")
print(es_per_df)

# Overall ATT per dollar
state_res <- lapply(treated_state_list, function(this_state) {
  this_res <- subset(post_res, state == this_state)
  if (nrow(this_res) > 0) {
    data.frame(state = this_state,
               att.per = mean(this_res$attst.per),
               att.per.se = mean(this_res$attst.per.se),
               state_size = unique(this_res$state_size)[1])
  } else {
    NULL
  }
})
state_df <- do.call(rbind.data.frame, Filter(Negate(is.null), state_res))
att_perO <- weighted.mean(state_df$att.per, state_df$state_size)
att_perO_se <- weighted.mean(state_df$att.per.se, state_df$state_size)
cat("\nOverall ATT per dollar:", round(att_perO, 4), "\n")
cat("SE:", round(att_perO_se, 4), "\n")

# ============================================================
# --- Figure 8: ATT Per Dollar Event Study ---
# ============================================================
cat("\nGenerating Figure 8: ATT Per Dollar Event Study...\n")

p8 <- ggplot(es_per_df, aes(x = event_time, y = att)) +
  geom_hline(yintercept = 0, color = WARM_ORANGE, linewidth = 0.8, linetype = "dashed") +
  geom_errorbar(aes(ymin = ci_lower, ymax = ci_upper), width = 0.2, color = STEEL_BLUE, linewidth = 0.6) +
  geom_line(color = STEEL_BLUE, linewidth = 1.2) +
  geom_point(color = STEEL_BLUE, size = 4) +
  labs(title = "ATT Per Dollar of Minimum Wage Increase",
       subtitle = "Employment effect normalized by the size of the minimum wage increase",
       x = "Event Time (years relative to treatment)",
       y = "ATT per Dollar") +
  ylim(c(-0.2, 0.05)) +
  theme_site()

ggsave("r_did_08_att_per_dollar.png", p8,
       width = 10, height = 6, dpi = 300, bg = DARK_BG)
cat("Saved r_did_08_att_per_dollar.png\n")

# ============================================================
# --- 11. Alternative Identification Strategies ---
# ============================================================
cat("\n--- Alternative Identification Strategies ---\n")

# Lagged outcomes
cat("\nLagged Outcomes (pte package):\n")
data2_lo <- data2
data2_lo$G2 <- data2_lo$G
tryCatch({
  lo_res <- pte::pte_default(yname = "lemp", tname = "year", idname = "id",
                             gname = "G2", data = data2_lo,
                             d_outcome = FALSE, lagged_outcome_cov = TRUE)
  summary(lo_res)
}, error = function(e) {
  cat("Lagged outcomes error:", e$message, "\n")
})

# Change-in-changes
cat("\nChange-in-Changes (qte package):\n")
data2_cic <- data2
data2_cic$G2 <- data2_cic$G
tryCatch({
  cic_res <- qte::cic2(yname = "lemp", gname = "G2", tname = "year",
                       idname = "id", data = data2_cic,
                       boot_type = "empirical", cl = 4)
  summary(cic_res)
}, error = function(e) {
  cat("CIC error:", e$message, "\n")
})

cat("\n===== All figures generated successfully =====\n")
