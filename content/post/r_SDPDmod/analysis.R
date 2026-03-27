# =============================================================================
# Spatial Dynamic Panel Data Modeling in R: Cigarette Demand Across US States
# =============================================================================
# Description: Tutorial on the SDPDmod package for spatial panel data modeling.
#              Covers Bayesian model comparison, static and dynamic SAR/SDM
#              estimation with Lee-Yu bias correction, and impact decomposition.
# Dataset:     Cigar (plm package) -- cigarette consumption in 46 US states,
#              1963-1992, with usa46 binary contiguity matrix from SDPDmod.
# Author:      Carlos Mendez (carlos-mendez.org)
# Date:        2026-03-28
# =============================================================================

# ---- 1. Setup ---------------------------------------------------------------

# Install packages if needed
cran_packages <- c("SDPDmod", "plm", "ggplot2", "reshape2", "dplyr")
missing <- cran_packages[!sapply(cran_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) install.packages(missing, repos = "https://cloud.r-project.org")

library(SDPDmod)
library(plm)
library(ggplot2)
library(reshape2)
library(dplyr)

# Site color palette
steel_blue  <- "#6a9bcc"
warm_orange <- "#d97757"
near_black  <- "#141413"
teal        <- "#00d4c8"
heading_blue <- "#1a3a8a"

# ---- 2. Data Preparation ----------------------------------------------------

# Load Cigar dataset
data("Cigar", package = "plm")
data1 <- Cigar

# Create log-transformed variables
data1$logc <- log(data1$sales)              # log cigarette packs per capita
data1$logp <- log(data1$price / data1$cpi)  # log real price
data1$logy <- log(data1$ndi / data1$cpi)    # log real per capita income
data1$lpm  <- log(data1$pimin / data1$cpi)  # log real minimum price in adjoining states

# Inspect
cat("Panel dimensions:\n")
cat("  States:", length(unique(data1$state)), "\n")
cat("  Years:", length(unique(data1$year)), "\n")
cat("  Observations:", nrow(data1), "\n\n")

cat("First 6 rows:\n")
print(head(data1[, c("state", "year", "sales", "price", "ndi", "logc", "logp", "logy")]))

cat("\nSummary of key variables:\n")
summary(data1[, c("logc", "logp", "logy")])

# ---- 2b. pimin vs W*logp correlation ----------------------------------------

# Load W early so we can compute spatial lags for EDA
data("usa46", package = "SDPDmod")

# Save state names before any modification
state_names_orig <- rownames(usa46)

# State abbreviation mapping (alphabetical order matching usa46)
state_abbr <- c("AL","AZ","AR","CA","CO","CT","DE","FL","GA","ID",
                "IL","IN","IA","KS","KY","LA","ME","MD","MA","MI",
                "MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
                "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN",
                "TX","UT","VT","VA","WA","WI")

W <- rownor(usa46)

# Compute spatial lag of logp for each state-year
# W is 46x46, logp is organized as state-year panels
years <- sort(unique(data1$year))
data1$Wlogp <- NA
for (yr in years) {
  idx <- data1$year == yr
  logp_vec <- data1$logp[idx]
  data1$Wlogp[idx] <- as.numeric(W %*% logp_vec)
}

cat("\n--- pimin vs W*logp correlation ---\n")
cat("Correlation(lpm, Wlogp):", round(cor(data1$lpm, data1$Wlogp, use = "complete.obs"), 4), "\n")

# ---- 3. EDA: Spaghetti Plot (Figure 4) --------------------------------------

# Assign state abbreviations to data
data1$state_abbr <- state_abbr[data1$state]

# Highlight a few states for visual clarity
highlight_states <- c("CA", "NY", "NC", "KY", "UT")
data1$highlight <- ifelse(data1$state_abbr %in% highlight_states,
                           data1$state_abbr, "Other")
data1$highlight <- factor(data1$highlight,
                           levels = c(highlight_states, "Other"))

fig4 <- ggplot(data1, aes(x = year + 1900, y = sales, group = state_abbr)) +
  geom_line(data = subset(data1, highlight == "Other"),
            color = "gray80", linewidth = 0.3, alpha = 0.7) +
  geom_line(data = subset(data1, highlight != "Other"),
            aes(color = highlight), linewidth = 1) +
  scale_color_manual(values = c("CA" = steel_blue, "NY" = warm_orange,
                                 "NC" = teal, "KY" = heading_blue,
                                 "UT" = near_black)) +
  labs(title = "Cigarette Sales per Capita Across 46 US States (1963-1992)",
       subtitle = "Each line is one state; five states highlighted for comparison",
       x = "Year", y = "Packs per Capita", color = "State") +
  theme_minimal(base_size = 13) +
  theme(
    plot.title = element_text(color = heading_blue, face = "bold", size = 14),
    plot.subtitle = element_text(color = "gray40", size = 11),
    legend.position = c(0.85, 0.85),
    legend.background = element_rect(fill = "white", color = "gray90")
  )

ggsave("r_SDPDmod_fig4_eda_spaghetti.png", fig4, width = 9, height = 6, dpi = 300)
cat("\nFigure 4 (EDA spaghetti) saved.\n")

# ---- 4. Spatial Weight Matrix ------------------------------------------------

cat("\nWeight matrix dimensions:", dim(usa46), "\n")
cat("Non-zero entries:", sum(usa46 != 0), "\n")
cat("Average neighbors per state:", round(mean(rowSums(usa46)), 2), "\n")
cat("Row-normalized:", isrownor(W), "\n")

# ---- 4b. Figure 1: Weight Matrix Heatmap (with state abbreviations) ---------

# Use state abbreviations for axes
rownames(usa46) <- state_abbr
colnames(usa46) <- state_abbr
usa46_df <- melt(usa46)
colnames(usa46_df) <- c("State_i", "State_j", "Connection")
usa46_df$Connection <- factor(usa46_df$Connection, levels = c(0, 1),
                               labels = c("Not neighbors", "Neighbors"))

# Preserve alphabetical ordering
usa46_df$State_i <- factor(usa46_df$State_i, levels = rev(state_abbr))
usa46_df$State_j <- factor(usa46_df$State_j, levels = state_abbr)

fig1 <- ggplot(usa46_df, aes(x = State_j, y = State_i, fill = Connection)) +
  geom_tile(color = "white", linewidth = 0.1) +
  scale_fill_manual(values = c("Not neighbors" = "gray95",
                                "Neighbors" = steel_blue)) +
  labs(title = "Binary Contiguity Matrix of 46 US States",
       subtitle = "Spatial neighbors share a common border",
       x = "State j", y = "State i", fill = "") +
  theme_minimal(base_size = 10) +
  theme(
    plot.title = element_text(color = heading_blue, face = "bold", size = 15),
    plot.subtitle = element_text(color = "gray40", size = 11),
    legend.position = "bottom",
    panel.grid = element_blank(),
    axis.text.x = element_text(angle = 90, hjust = 1, vjust = 0.5, size = 7),
    axis.text.y = element_text(size = 7),
    aspect.ratio = 1
  )

ggsave("r_SDPDmod_fig1_weight_matrix.png", fig1, width = 8, height = 8, dpi = 300)
cat("\nFigure 1 saved.\n")

# ---- 4c. Alternative Weight Matrix: 2nd-order contiguity --------------------

# Reload original binary matrix (before abbreviation renaming)
data("usa46", package = "SDPDmod")

# 2nd-order neighbors: states that share a neighbor (friends-of-friends)
W2_raw <- (usa46 %*% usa46) > 0  # indicator for 2-step reachability
W2_raw <- W2_raw * 1             # convert logical to numeric
diag(W2_raw) <- 0                # remove self-connections
# Also remove 1st-order neighbors to get ONLY 2nd-order
W2_only <- W2_raw - usa46
W2_only[W2_only < 0] <- 0
# Combined: 1st + 2nd order
W2_combined <- (W2_raw > 0) * 1
diag(W2_combined) <- 0
W2 <- rownor(W2_combined)

cat("\n--- Alternative W: 2nd-order contiguity ---\n")
cat("Original W non-zero:", sum(usa46 != 0), "\n")
cat("2nd-order W non-zero:", sum(W2_combined != 0), "\n")
cat("Avg neighbors (original):", round(mean(rowSums(usa46)), 2), "\n")
cat("Avg neighbors (2nd-order):", round(mean(rowSums(W2_combined)), 2), "\n")

# Re-estimate the static SDM with 2nd-order W for robustness
cat("\n--- Robustness: Static SDM with 2nd-order W ---\n")
mod_sdm_w2 <- SDPDm(formula = logc ~ logp + logy, data = data1, W = W2,
                     index = c("state", "year"),
                     model = "sdm",
                     effect = "twoways",
                     LYtrans = TRUE)
summary(mod_sdm_w2)

# ---- 5. Non-Spatial Baseline -------------------------------------------------

cat("\n--- Non-Spatial Baseline: Two-way FE (plm) ---\n")
pdata <- pdata.frame(data1, index = c("state", "year"))
mod_fe <- plm(logc ~ logp + logy, data = pdata, model = "within",
              effect = "twoways")
cat("Two-way FE (non-spatial):\n")
print(summary(mod_fe)$coefficients)
cat("R-squared:", round(summary(mod_fe)$r.squared["rsq"], 4), "\n")

# ---- 6. Bayesian Model Comparison -------------------------------------------

cat("\n--- Bayesian Model Comparison: Static, Individual FE ---\n")
res_ind <- blmpSDPD(formula = logc ~ logp + logy, data = data1, W = W,
                    index = c("state", "year"),
                    model = list("ols", "sar", "sdm", "sem", "sdem", "slx"),
                    effect = "individual")
cat("Log-marginal posteriors:\n")
print(res_ind$lmarginal)
cat("\nModel probabilities:\n")
print(round(res_ind$probs, 4))

cat("\n--- Bayesian Model Comparison: Static, Two-way FE ---\n")
res_tw <- blmpSDPD(formula = logc ~ logp + logy, data = data1, W = W,
                   index = c("state", "year"),
                   model = list("ols", "sar", "sdm", "sem", "sdem", "slx"),
                   effect = "twoways",
                   prior = "beta")
cat("Log-marginal posteriors:\n")
print(res_tw$lmarginal)
cat("\nModel probabilities:\n")
print(round(res_tw$probs, 4))

cat("\n--- Bayesian Model Comparison: Dynamic, Two-way FE ---\n")
res_dyn <- blmpSDPD(formula = logc ~ logp + logy, data = data1, W = W,
                    index = c("state", "year"),
                    model = list("sar", "sdm", "sem", "sdem", "slx"),
                    effect = "twoways",
                    ldet = "mc",
                    dynamic = TRUE,
                    prior = "uniform")
cat("Log-marginal posteriors:\n")
print(res_dyn$lmarginal)
cat("\nModel probabilities:\n")
print(round(res_dyn$probs, 4))

# ---- Figure 2: Model Comparison Bar Chart ------------------------------------

probs_ind <- data.frame(Model = names(res_ind$probs),
                         Probability = as.numeric(res_ind$probs),
                         Specification = "Static: Individual FE")
probs_tw <- data.frame(Model = names(res_tw$probs),
                        Probability = as.numeric(res_tw$probs),
                        Specification = "Static: Two-way FE")
probs_dyn <- data.frame(Model = names(res_dyn$probs),
                          Probability = as.numeric(res_dyn$probs),
                          Specification = "Dynamic: Two-way FE")

probs_all <- rbind(probs_ind, probs_tw, probs_dyn)
probs_all$Specification <- factor(probs_all$Specification,
                                   levels = c("Static: Individual FE",
                                              "Static: Two-way FE",
                                              "Dynamic: Two-way FE"))

fig2 <- ggplot(probs_all, aes(x = Model, y = Probability, fill = Model)) +
  geom_col(width = 0.7) +
  facet_wrap(~ Specification, ncol = 1, scales = "free_y") +
  scale_fill_manual(values = c("ols"  = "gray70", "sar"  = steel_blue,
                                "sdm"  = warm_orange, "sem"  = teal,
                                "sdem" = heading_blue, "slx"  = near_black)) +
  labs(title = "Bayesian Model Probabilities Across Specifications",
       subtitle = "Posterior probabilities from blmpSDPD()",
       x = "", y = "Posterior Probability") +
  theme_minimal(base_size = 13) +
  theme(
    plot.title = element_text(color = heading_blue, face = "bold", size = 15),
    plot.subtitle = element_text(color = "gray40", size = 11),
    legend.position = "none",
    strip.text = element_text(face = "bold", size = 12),
    panel.grid.major.x = element_blank()
  ) +
  geom_text(aes(label = ifelse(Probability > 0.01,
                                 sprintf("%.1f%%", Probability * 100), "")),
            vjust = -0.3, size = 3.5)

ggsave("r_SDPDmod_fig2_model_comparison.png", fig2, width = 8, height = 10, dpi = 300)
cat("\nFigure 2 saved.\n")

# ---- 7. Static SAR Model Estimation -----------------------------------------

cat("\n--- Static SAR: Individual FE ---\n")
mod_sar_ind <- SDPDm(formula = logc ~ logp + logy, data = data1, W = W,
                     index = c("state", "year"),
                     model = "sar",
                     effect = "individual")
summary(mod_sar_ind)
cat("R-squared:", round(mod_sar_ind$rsqr, 4), "\n")
cat("Sigma:", round(mod_sar_ind$sige, 6), "\n")

cat("\n--- Static SAR: Two-way FE ---\n")
mod_sar_tw <- SDPDm(formula = logc ~ logp + logy, data = data1, W = W,
                    index = c("state", "year"),
                    model = "sar",
                    effect = "twoways")
summary(mod_sar_tw)
cat("Sigma:", round(mod_sar_tw$sige, 6), "\n")

cat("\n--- Impacts: Static SAR (Two-way FE) ---\n")
imp_sar_tw <- impactsSDPDm(mod_sar_tw)
summary(imp_sar_tw)

# ---- 8. Static SDM with Lee-Yu Correction ------------------------------------

cat("\n--- Static SDM: Two-way FE ---\n")
mod_sdm_tw <- SDPDm(formula = logc ~ logp + logy, data = data1, W = W,
                    index = c("state", "year"),
                    model = "sdm",
                    effect = "twoways")
summary(mod_sdm_tw)
cat("Sigma:", round(mod_sdm_tw$sige, 6), "\n")

cat("\n--- Static SDM: Two-way FE + Lee-Yu ---\n")
mod_sdm_ly <- SDPDm(formula = logc ~ logp + logy, data = data1, W = W,
                    index = c("state", "year"),
                    model = "sdm",
                    effect = "twoways",
                    LYtrans = TRUE)
summary(mod_sdm_ly)
cat("Sigma:", round(mod_sdm_ly$sige, 6), "\n")

cat("\n--- Impacts: Static SDM (Two-way FE, Lee-Yu) ---\n")
imp_sdm_ly <- impactsSDPDm(mod_sdm_ly)
summary(imp_sdm_ly)

# ---- 9. Dynamic Spatial Panel Models -----------------------------------------

cat("\n--- Dynamic SAR: tl=TRUE, stl=FALSE ---\n")
mod_dsar_tl <- SDPDm(formula = logc ~ logp + logy, data = data1, W = W,
                     index = c("state", "year"),
                     model = "sar", effect = "twoways",
                     LYtrans = TRUE, dynamic = TRUE,
                     tlaginfo = list(ind = NULL, tl = TRUE, stl = FALSE))
summary(mod_dsar_tl)
cat("Sigma:", round(mod_dsar_tl$sige, 6), "\n")

cat("\n--- Dynamic SAR: tl=TRUE, stl=TRUE ---\n")
mod_dsar_full <- SDPDm(formula = logc ~ logp + logy, data = data1, W = W,
                       index = c("state", "year"),
                       model = "sar", effect = "twoways",
                       LYtrans = TRUE, dynamic = TRUE,
                       tlaginfo = list(ind = NULL, tl = TRUE, stl = TRUE))
summary(mod_dsar_full)
cat("Sigma:", round(mod_dsar_full$sige, 6), "\n")

cat("\n--- Dynamic SDM: Two-way FE + Lee-Yu ---\n")
mod_dsdm <- SDPDm(formula = logc ~ logp + logy, data = data1, W = W,
                  index = c("state", "year"),
                  model = "sdm", effect = "twoways",
                  LYtrans = TRUE, dynamic = TRUE,
                  tlaginfo = list(ind = NULL, tl = TRUE, stl = TRUE))
summary(mod_dsdm)
cat("Sigma:", round(mod_dsdm$sige, 6), "\n")

cat("\n--- Impacts: Dynamic SDM ---\n")
imp_dsdm <- impactsSDPDm(mod_dsdm)
summary(imp_dsdm)

# ---- 10. Model fit comparison ------------------------------------------------

cat("\n\n=== MODEL FIT COMPARISON (sigma^2) ===\n")
cat("Non-spatial FE:     sigma = ", round(summary(mod_fe)$coefficients[1,2]^2 * nrow(pdata), 6), " (not comparable)\n")
cat("SAR (Ind FE):       sige =", round(mod_sar_ind$sige, 6), "  R2 =", round(mod_sar_ind$rsqr, 4), "\n")
cat("SAR (TW FE):        sige =", round(mod_sar_tw$sige, 6), "\n")
cat("SDM (TW FE):        sige =", round(mod_sdm_tw$sige, 6), "\n")
cat("SDM (TW FE, LY):    sige =", round(mod_sdm_ly$sige, 6), "\n")
cat("Dyn SAR (tl):       sige =", round(mod_dsar_tl$sige, 6), "\n")
cat("Dyn SAR (tl+stl):   sige =", round(mod_dsar_full$sige, 6), "\n")
cat("Dyn SDM (LY):       sige =", round(mod_dsdm$sige, 6), "\n")
cat("Robustness SDM W2:  sige =", round(mod_sdm_w2$sige, 6), "\n")

# ---- Figure 3: Effect Decomposition (pointrange) ----------------------------

# Static SDM (Lee-Yu) impacts
static_dir  <- imp_sdm_ly$DIRECT.tab[, "Estimate"]
static_ind  <- imp_sdm_ly$INDIRECT.tab[, "Estimate"]
static_tot  <- imp_sdm_ly$TOTAL.tab[, "Estimate"]
static_dir_se  <- imp_sdm_ly$DIRECT.tab[, "Std. Error"]
static_ind_se  <- imp_sdm_ly$INDIRECT.tab[, "Std. Error"]
static_tot_se  <- imp_sdm_ly$TOTAL.tab[, "Std. Error"]

# Dynamic SDM: short-term impacts
dyn_st_dir  <- imp_dsdm$DIRECTst.tab[, "Estimate"]
dyn_st_ind  <- imp_dsdm$INDIRECTst.tab[, "Estimate"]
dyn_st_tot  <- imp_dsdm$TOTALst.tab[, "Estimate"]
dyn_st_dir_se  <- imp_dsdm$DIRECTst.tab[, "Std. Error"]
dyn_st_ind_se  <- imp_dsdm$INDIRECTst.tab[, "Std. Error"]
dyn_st_tot_se  <- imp_dsdm$TOTALst.tab[, "Std. Error"]

# Dynamic SDM: long-term impacts
dyn_lt_dir  <- imp_dsdm$DIRECTlt.tab[, "Estimate"]
dyn_lt_ind  <- imp_dsdm$INDIRECTlt.tab[, "Estimate"]
dyn_lt_tot  <- imp_dsdm$TOTALlt.tab[, "Estimate"]
dyn_lt_dir_se  <- imp_dsdm$DIRECTlt.tab[, "Std. Error"]
dyn_lt_ind_se  <- imp_dsdm$INDIRECTlt.tab[, "Std. Error"]
dyn_lt_tot_se  <- imp_dsdm$TOTALlt.tab[, "Std. Error"]

impact_df <- data.frame(
  Variable = rep(c("logp", "logy"), 9),
  Effect = rep(rep(c("Direct", "Indirect", "Total"), each = 2), 3),
  Model = rep(c("Static SDM", "Dynamic SDM\n(Short-run)", "Dynamic SDM\n(Long-run)"), each = 6),
  Estimate = c(static_dir, static_ind, static_tot,
               dyn_st_dir, dyn_st_ind, dyn_st_tot,
               dyn_lt_dir, dyn_lt_ind, dyn_lt_tot),
  SE = c(static_dir_se, static_ind_se, static_tot_se,
         dyn_st_dir_se, dyn_st_ind_se, dyn_st_tot_se,
         dyn_lt_dir_se, dyn_lt_ind_se, dyn_lt_tot_se)
)

impact_df$Model <- factor(impact_df$Model,
                           levels = c("Static SDM", "Dynamic SDM\n(Short-run)", "Dynamic SDM\n(Long-run)"))
impact_df$Effect <- factor(impact_df$Effect, levels = c("Direct", "Indirect", "Total"))

# Pointrange plot (more conventional for econometrics)
fig3 <- ggplot(impact_df, aes(x = Effect, y = Estimate, color = Effect)) +
  geom_hline(yintercept = 0, linetype = "dashed", color = "gray50") +
  geom_pointrange(aes(ymin = Estimate - 1.96 * SE, ymax = Estimate + 1.96 * SE),
                  size = 0.7, linewidth = 0.8) +
  facet_grid(Variable ~ Model, scales = "free_y",
             labeller = labeller(Variable = c("logp" = "Price (logp)",
                                               "logy" = "Income (logy)"))) +
  scale_color_manual(values = c("Direct" = steel_blue,
                                 "Indirect" = warm_orange,
                                 "Total" = near_black)) +
  labs(title = "Effect Decomposition: Static vs. Dynamic SDM",
       subtitle = "Point estimates with 95% confidence intervals",
       x = "", y = "Estimated Effect") +
  theme_minimal(base_size = 13) +
  theme(
    plot.title = element_text(color = heading_blue, face = "bold", size = 15),
    plot.subtitle = element_text(color = "gray40", size = 11),
    legend.position = "none",
    strip.text = element_text(face = "bold", size = 11),
    panel.grid.major.x = element_blank()
  )

ggsave("r_SDPDmod_fig3_impact_decomposition.png", fig3, width = 10, height = 7, dpi = 300)
cat("\nFigure 3 saved.\n")

cat("\nAnalysis complete. All figures generated.\n")
cat("Script finished successfully.\n")
