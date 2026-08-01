# ══════════════════════════════════════════════════════════════════════════════
# From DiD to SDID: a ladder of synthetic control estimators, on Brexit
#
# This script powers the tutorial post `r_sc_dsc_sdid`. It climbs the ladder of
# single-treated-unit estimators, one rung at a time, on the same data:
#
#     0. DiD    -- unit weights frozen at 1/J, unit and time fixed effects
#     1. SC     -- unit weights chosen on the simplex, NO intercept
#     2. SC(B)  -- Born et al.'s variant: covariates in BOTH optimisation loops
#     3. DSC    -- SC on demeaned outcomes + a constant bias adjustment
#     4. SDID   -- DSC's unit weights + optimally chosen TIME weights (3 variants)
#     5. MASC   -- a cross-validated blend of m-nearest-neighbour matching and SC
#     6. ASCM   -- SC weights plus a ridge correction; weights may go negative
#
# Every rung is solved TWICE: once from scratch, so the algorithm is visible,
# and once with its package, so the reader learns the production call. Where the
# two disagree we say so and explain why (see section 5 -- the disagreement is
# the single most instructive thing in this script).
#
# Estimand: ATT on the treated unit. For the United Kingdom in quarter t,
#           tau_t = y_UK,t - yhat0_UK,t, the log real-GDP gap between the
#           observed UK and its estimated no-Brexit counterfactual. Reported
#           throughout as a percentage LOSS, -100 * tau_t, so a positive number
#           means UK GDP came in below the counterfactual.
#
# Inference: the source paper reports none at all (its Remark 1 sets inference
#           aside deliberately). Section 16 adds permutation inference as an
#           explicit extension BEYOND the paper, clearly labelled as such.
#
# Usage:  cd content/post/r_sc_dsc_sdid && Rscript analysis.R 2>&1 | tee execution_log.txt
# Output: r_sc_dsc_sdid_*.png (18 figures), *.csv tables, web_app/data/results.json
# Data:   brexit_analysis.csv, built by prepare_data.R, loaded from GitHub raw
#         with a local fallback. See data/README.md for the codebook.
#
# Install:
#   install.packages(c("quadprog","Synth","tidyverse","patchwork","scales","jsonlite"))
#   remotes::install_github("synth-inference/synthdid", upgrade = "never")
#   remotes::install_github("ebenmichael/augsynth",     upgrade = "never")
#   # masc declares a hard dependency on the commercial Gurobi solver, which it
#   # never actually needs on the code path we use. Drop the dependency, then
#   # install from the patched source:
#   #   git clone --depth 1 https://github.com/maxkllgg/masc /tmp/masc_src
#   #   sed -i '' 's/^    gurobi,$//' /tmp/masc_src/DESCRIPTION
#   #   R CMD INSTALL /tmp/masc_src
#
# Verified with: R 4.5.2, synthdid 0.0.9, augsynth 0.2.0, masc 0.1.1 (patched),
#                Synth 1.1-10, quadprog 1.5-8
#
# References:
#   - de Brabander, Juodis & Miyazato Szini (2025), Econometric Reviews 44(10),
#     1617-1646.  https://doi.org/10.1080/07474938.2025.2530649
#   - Born, Muller, Schularick & Sedlacek (2019), Economic Journal 129(623).
#     https://doi.org/10.1093/ej/uez020
#   - Abadie, Diamond & Hainmueller (2010), JASA 105(490), 493-505.
#   - Ferman & Pinto (2021), Quantitative Economics 12(4), 1197-1221.
#   - Arkhangelsky, Athey, Hirshberg, Imbens & Wager (2021), AER 111(12).
#   - Kellogg, Mogstad, Pouliot & Torgovitsky (2021), JASA 116(536), 1804-1816.
#   - Ben-Michael, Feller & Rothstein (2021), JASA 116(536), 1789-1803.
# ══════════════════════════════════════════════════════════════════════════════


# ── 0. Setup ──────────────────────────────────────────────────────────────────

required <- c("quadprog", "synthdid", "Synth", "masc", "augsynth",
              "ggplot2", "tidyr", "readr", "patchwork", "scales", "jsonlite")
missing  <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop("Missing packages: ", paste(missing, collapse = ", "),
       "\nSee the Install block at the top of this script.")
}
suppressPackageStartupMessages({
  library(quadprog); library(synthdid); library(Synth); library(masc)
  library(augsynth); library(ggplot2); library(tidyr)
  library(readr);    library(patchwork); library(scales); library(jsonlite)
})

SEED <- 20260801
set.seed(SEED)
SLUG <- "r_sc_dsc_sdid"

# --- Site palette (dark navy theme) ---
DARK_BG      <- "#0f1729"   # figure background
DARK_PANEL   <- "#1f2b5e"   # grid lines
LIGHT_TEXT   <- "#c8d0e0"   # axis text
LIGHTER_TEXT <- "#e8ecf2"   # titles
MUTED        <- "#8b9dc3"   # captions, zero reference lines
GREY_DONOR   <- "#54618a"   # donor / placebo spaghetti
STEEL        <- "#6a9bcc"   # synthetic control
ORANGE       <- "#d97757"   # the treated unit (UK), and reference values
TEAL         <- "#00d4c8"   # the highlighted / recommended estimator
GOLD         <- "#e8b04b"   # a fourth series where three are not enough

theme_site <- function(base_size = 12) {
  theme_minimal(base_size = base_size) +
    theme(
      plot.background   = element_rect(fill = DARK_BG, colour = NA),
      panel.background  = element_rect(fill = DARK_BG, colour = NA),
      panel.grid.major  = element_line(colour = DARK_PANEL, linewidth = 0.3),
      panel.grid.minor  = element_blank(),
      text              = element_text(colour = LIGHT_TEXT),
      axis.text         = element_text(colour = LIGHT_TEXT),
      plot.title        = element_text(colour = LIGHTER_TEXT, face = "bold", size = base_size + 2),
      plot.subtitle     = element_text(colour = LIGHT_TEXT, size = base_size - 1),
      plot.caption      = element_text(colour = MUTED, size = base_size - 3, hjust = 0),
      legend.text       = element_text(colour = LIGHT_TEXT),
      legend.title      = element_text(colour = LIGHTER_TEXT),
      legend.background = element_rect(fill = DARK_BG, colour = NA),
      legend.key        = element_rect(fill = DARK_BG, colour = NA),
      strip.text        = element_text(colour = LIGHTER_TEXT, face = "bold"),
      strip.background  = element_rect(fill = DARK_PANEL, colour = NA)
    )
}

save_fig <- function(plot, name, w = 9, h = 6, dpi = 300) {
  if (inherits(plot, "patchwork")) {
    plot <- plot + plot_annotation(
      theme = theme(plot.background = element_rect(fill = DARK_BG, colour = NA),
                    plot.title    = element_text(colour = LIGHTER_TEXT, face = "bold", size = 15),
                    plot.subtitle = element_text(colour = LIGHT_TEXT, size = 11),
                    plot.caption  = element_text(colour = MUTED, size = 9, hjust = 0)))
  }
  f <- sprintf("%s_%s.png", SLUG, name)
  ggsave(f, plot, width = w, height = h, dpi = dpi, bg = DARK_BG)
  cat("  [figure] ", f, "\n", sep = "")
  invisible(NULL)
}

rule <- function(txt) cat("\n", strrep("=", 78), "\n", txt, "\n",
                          strrep("=", 78), "\n", sep = "")

write_tab <- function(df, name) {
  write.csv(df, paste0(name, ".csv"), row.names = FALSE)
  cat("  [table]  ", name, ".csv\n", sep = "")
}

# Expensive fits are memoised to cache/*.rds so a re-run takes minutes, not an
# hour. Set FORCE_REFIT=1 in the environment to invalidate everything.
FORCE_REFIT <- nzchar(Sys.getenv("FORCE_REFIT"))
cache_rds <- function(key, expr) {
  f <- file.path("cache", paste0(SLUG, "_", key, ".rds"))
  if (!FORCE_REFIT && file.exists(f)) { cat("  [cache] ", key, "\n", sep = ""); return(readRDS(f)) }
  dir.create("cache", showWarnings = FALSE)
  v <- force(expr); saveRDS(v, f)
  cat("  [fit]   ", key, "\n", sep = "")
  v
}

# --- Anchors. The reduced index t runs 1..104 over 1995Q1..2020Q4. ---
#
# CAREFUL: the paper's T_0 is the treatment PERIOD; synthdid's `T0` argument is
# the NUMBER of pre-treatment periods. For the 2016Q3 specification the
# treatment period is t = 87 and the number of pre-periods is T0 = 86. Every
# off-by-one bug in this literature lives in that sentence.
T0_Q2   <- 85          # pre-periods for the "treatment materialises 2016Q2" spec
T0_Q3   <- 86          # pre-periods for the "treatment materialises 2016Q3" spec (headline)
T_2018Q4 <- 96
T_2019Q4 <- 100
EVAL    <- c("2018Q4" = T_2018Q4, "2019Q4" = T_2019Q4)

rule("0. Setup")
cat("  R              ", R.version.string, "\n")
for (p in c("synthdid", "augsynth", "masc", "Synth", "quadprog"))
  cat(sprintf("  %-14s %s\n", p, as.character(packageVersion(p))))
cat("  seed           ", SEED, "\n")
cat("  FORCE_REFIT    ", FORCE_REFIT, "\n")


# ── 1. Load the panel ─────────────────────────────────────────────────────────

rule("1. Load the Brexit panel")

DATA_URL  <- paste0("https://raw.githubusercontent.com/cmg777/starter-academic-v501/",
                    "master/content/post/", SLUG, "/brexit_analysis.csv")
LOCAL_CSV <- "brexit_analysis.csv"

panel <- tryCatch({
  if (file.exists(LOCAL_CSV)) {
    message("Loading local brexit_analysis.csv"); read_csv(LOCAL_CSV, show_col_types = FALSE)
  } else {
    message("Loading brexit_analysis.csv from GitHub"); read_csv(DATA_URL, show_col_types = FALSE)
  }
}, error = function(e) read_csv(DATA_URL, show_col_types = FALSE))
panel <- as.data.frame(panel)

COUNTRIES <- unique(panel$country[order(panel$unit_id)])
UK        <- which(COUNTRIES == "United Kingdom")
DONORS    <- setdiff(seq_along(COUNTRIES), UK)
DONOR_NM  <- COUNTRIES[DONORS]
N0        <- length(DONORS)

# Y is [time x country]: 104 quarters by 24 countries.
Y <- matrix(panel$log_rgdp[order(panel$unit_id, panel$t)],
            nrow = 104, dimnames = list(NULL, COUNTRIES))
QLAB <- panel$quarter_label[panel$unit_id == 1][order(panel$t[panel$unit_id == 1])]
QDEC <- panel$date_dec[panel$unit_id == 1][order(panel$t[panel$unit_id == 1])]

stopifnot(dim(Y) == c(104, 24), !anyNA(Y), N0 == 23)

cat(sprintf("  panel        : %d countries x %d quarters (%s to %s)\n",
            ncol(Y), nrow(Y), QLAB[1], QLAB[104]))
cat(sprintf("  treated      : %s (unit_id %d)\n", COUNTRIES[UK], UK))
cat(sprintf("  donors (%d)  : %s\n", N0, paste(DONOR_NM, collapse = ", ")))
cat(sprintf("  headline spec: treatment materialises %s, T0 = %d pre-periods\n",
            QLAB[T0_Q3 + 1], T0_Q3))
cat(sprintf("  evaluated at : %s (t=%d) and %s (t=%d)\n",
            QLAB[T_2018Q4], T_2018Q4, QLAB[T_2019Q4], T_2019Q4))

# Convenience slices for the headline specification.
Z1 <- Y[1:T0_Q3, UK]            # treated pre-treatment path      (86)
Z0 <- Y[1:T0_Q3, DONORS]        # donor  pre-treatment paths      (86 x 23)

# Reported effect: percentage GDP loss = -100 * (y_UK - counterfactual).
pct  <- function(tau) -100 * tau
gap  <- function(w, e, b = 0) Y[e, UK] - drop(Y[e, DONORS] %*% w) - b
loss <- function(w, e, b = 0) pct(gap(w, e, b))

results <- data.frame()
add_result <- function(method, family, tau18, tau19, note = "") {
  results <<- rbind(results, data.frame(
    method = method, family = family,
    loss_2018Q4 = round(tau18, 3), loss_2019Q4 = round(tau19, 3),
    note = note, stringsAsFactors = FALSE))
  cat(sprintf("  %-22s 2018Q4 %6.3f   2019Q4 %6.3f   %s\n", method, tau18, tau19, note))
}


# ── 2. The estimation problem, before any estimator ───────────────────────────

rule("2. Descriptives: the UK inside the donor cloud")

long <- data.frame(
  t = rep(seq_len(104), 24), date = rep(QDEC, 24),
  country = rep(COUNTRIES, each = 104), y = as.vector(Y),
  stringsAsFactors = FALSE)
long$role <- ifelse(long$country == "United Kingdom", "United Kingdom", "Donor")

BREXIT_DEC <- QDEC[T0_Q3 + 1]

p01 <- ggplot(subset(long, role == "Donor"),
              aes(date, y, group = country)) +
  geom_line(colour = GREY_DONOR, linewidth = 0.35, alpha = 0.75) +
  geom_line(data = subset(long, role == "United Kingdom"),
            aes(date, y), colour = ORANGE, linewidth = 1.1) +
  geom_vline(xintercept = BREXIT_DEC, linetype = "dashed", colour = TEAL, linewidth = 0.5) +
  annotate("text", x = BREXIT_DEC - 0.4, y = max(Y) * 0.96, label = "referendum",
           hjust = 1, colour = TEAL, size = 3.3) +
  labs(title = "The United Kingdom is one line in a crowd",
       subtitle = sprintf("Log real GDP (index, 1995 average = 1), %d OECD economies, %s to %s",
                          ncol(Y), QLAB[1], QLAB[104]),
       x = NULL, y = "log real GDP index",
       caption = "Orange: United Kingdom. Grey: the 23 donor countries. No single donor tracks the UK, but the 2008-09 collapse is synchronised across all of them.") +
  theme_site()
save_fig(p01, "01_gdp_paths")

# The equal-weighted donor average IS the difference-in-differences
# counterfactual. Drawing it before naming it makes the next section land.
did_avg <- rowMeans(Y[, DONORS])
cmp <- data.frame(date = QDEC, uk = Y[, UK], avg = did_avg)
cmp$aligned <- cmp$avg + mean(cmp$uk[1:T0_Q3] - cmp$avg[1:T0_Q3])

p02 <- ggplot(cmp, aes(date)) +
  geom_ribbon(aes(ymin = pmin(uk, aligned), ymax = pmax(uk, aligned)),
              fill = ORANGE, alpha = 0.16) +
  geom_line(aes(y = uk),      colour = ORANGE, linewidth = 1.0) +
  geom_line(aes(y = aligned), colour = STEEL,  linewidth = 1.0, linetype = "22") +
  geom_vline(xintercept = BREXIT_DEC, linetype = "dashed", colour = TEAL, linewidth = 0.5) +
  annotate("text", x = 1997, y = max(cmp$uk) * 0.97,
           label = "United Kingdom", colour = ORANGE, hjust = 0, size = 3.5) +
  annotate("text", x = 1997, y = max(cmp$uk) * 0.88,
           label = "equal-weighted donor average\n(level-aligned) = the DiD control",
           colour = STEEL, hjust = 0, size = 3.2, lineheight = 0.95) +
  labs(title = "What difference-in-differences assumes, drawn before we name it",
       subtitle = "Giving Luxembourg and the United States the same vote",
       x = NULL, y = "log real GDP index",
       caption = "The shaded band is the gap the DiD estimator would attribute to Brexit. It is already opening well before 2016, which is parallel trends failing in plain sight.") +
  theme_site()
save_fig(p02, "02_did_counterfactual")

# The six covariates, on wildly different scales -- which is why Abadie's
# method needs a V matrix at all.
covs <- c(cons_share = "Consumption / GDP", inv_share = "Investment / GDP",
          exp_share  = "Exports / GDP",     imp_share = "Imports / GDP",
          labprod_growth = "Labour prod. growth (%)", emp_pop = "Employment / working-age pop.")
cv_long <- do.call(rbind, lapply(names(covs), function(v) {
  M <- matrix(panel[[v]][order(panel$unit_id, panel$t)], nrow = 104)
  data.frame(date = QDEC, variable = covs[[v]],
             uk  = M[, UK],
             lo  = apply(M[, DONORS], 1, quantile, 0.25),
             hi  = apply(M[, DONORS], 1, quantile, 0.75),
             stringsAsFactors = FALSE)
}))
cv_long$variable <- factor(cv_long$variable, levels = unname(covs))

p03 <- ggplot(cv_long, aes(date)) +
  geom_ribbon(aes(ymin = lo, ymax = hi), fill = GREY_DONOR, alpha = 0.45) +
  geom_line(aes(y = uk), colour = ORANGE, linewidth = 0.8) +
  facet_wrap(~ variable, scales = "free_y", ncol = 3) +
  geom_vline(xintercept = BREXIT_DEC, linetype = "dashed", colour = TEAL, linewidth = 0.4) +
  labs(title = "The six covariates Born et al. match on",
       subtitle = "Orange: United Kingdom. Band: interquartile range across the 23 donors",
       x = NULL, y = NULL,
       caption = "The six predictors differ in scale by orders of magnitude, which is exactly why Abadie's method needs a predictor-importance matrix V.") +
  theme_site(11)
save_fig(p03, "03_covariates", w = 10, h = 6)


# ── 3. The two solvers we will use all the way up the ladder ──────────────────
#
# EVERY estimator below reduces to the same problem:
#
#     minimise  || b - A w ||^2   subject to   w >= 0  and  sum(w) = 1
#
# with different A and b. Solve it once, reuse it six times. The only reason we
# carry TWO solvers is that the `synthdid` package uses Frank-Wolfe with a
# finite iteration budget, and on this data that budget bites (section 5).

rule("3. Two simplex solvers")

# (a) Exact. quadprog gives the true minimiser of a positive-definite QP.
#     The 1e-10 ridge is numerical hygiene so the Cholesky never fails; it is
#     NOT the zeta penalty of Arkhangelsky et al., which is a modelling choice.
simplex_ls <- function(A, b, ridge = 1e-10) {
  k <- ncol(A)
  w <- solve.QP(Dmat = crossprod(A) + ridge * diag(k),
                dvec = crossprod(A, b),
                Amat = cbind(rep(1, k), diag(k)),   # col 1: sum(w)=1; rest: w>=0
                bvec = c(1, rep(0, k)),
                meq  = 1)$solution
  w[w < 1e-10] <- 0
  w / sum(w)
}

# (b) Frank-Wolfe, a line-for-line port of synthdid's internal optimiser, so we
#     can show the reader what the package actually runs -- and what it costs.
#     The `zeta` argument is never passed a non-zero value below (the penalised
#     runs in section 14c let synthdid apply its own default instead); it is kept
#     because dropping it would stop this being a faithful port of sc.weight.fw.
fw_step <- function(A, x, b, eta) {
  Ax   <- A %*% x
  half <- t(Ax - b) %*% A + eta * x
  i    <- which.min(half)
  dx   <- -x; dx[i] <- 1 - x[i]
  if (all(dx == 0)) return(x)
  derr <- A[, i] - Ax
  s    <- -drop(half %*% dx) / (sum(derr^2) + eta * sum(dx^2))
  x + min(1, max(0, s)) * dx
}

simplex_fw <- function(A, b, zeta = 0, intercept = FALSE,
                       min.decrease = 1e-5, max.iter = 10000) {
  if (intercept) { A <- sweep(A, 2, colMeans(A)); b <- b - mean(b) }
  eta <- nrow(A) * zeta^2
  run <- function(x, mi) {
    vals <- rep(NA_real_, mi); it <- 0
    while (it < mi && (it < 2 || vals[it - 1] - vals[it] > min.decrease^2)) {
      it <- it + 1
      x  <- fw_step(A, x, b, eta)
      vals[it] <- zeta^2 * sum(x^2) + sum((A %*% x - b)^2) / nrow(A)
    }
    x
  }
  x <- run(rep(1 / ncol(A), ncol(A)), 100)      # short pre-round, then sparsify
  x[x <= max(x) / 4] <- 0; x <- x / sum(x)      # synthdid::sparsify_function
  run(x, max.iter)
}

# synthdid derives its convergence threshold from the data.
NOISE <- sd(apply(t(Z0), 1, diff))   # sd of the donors' quarter-on-quarter changes
MIN_DEC <- 1e-5 * NOISE
cat(sprintf("  noise.level (sd of donor quarterly changes) : %.6f\n", NOISE))
cat(sprintf("  synthdid min.decrease                       : %.3e\n", MIN_DEC))

# The donor Gram matrix is the reason the two solvers disagree. Look at it.
eig <- eigen(crossprod(Z0), only.values = TRUE)$values
cat(sprintf("  donor Gram: smallest eigenvalue %.3e, condition number %.3e\n",
            min(eig), max(eig) / min(eig)))


# ── 4. Rung 0: difference-in-differences ──────────────────────────────────────
#
# Weights frozen at 1/J, plus a unit fixed effect. Three lines of arithmetic.
# Everything above this rung is the same three lines with a smarter w.

rule("4. Rung 0 -- difference-in-differences")

w_did <- rep(1 / N0, N0)
b_did <- mean(Z1 - Z0 %*% w_did)                       # the unit fixed effect
add_result("DiD", "DiD", loss(w_did, T_2018Q4, b_did), loss(w_did, T_2019Q4, b_did),
           "uniform weights")

cat(sprintf("  pre-treatment RMSE vs the donor average : %.5f\n",
            sqrt(mean((Z1 - Z0 %*% w_did - b_did)^2))))


# ── 5. Rung 1: synthetic control -- and the solver lesson ─────────────────────
#
# min over the simplex of the squared pre-treatment prediction error.
# We solve it three ways and get two different answers. That is the point.

rule("5. Rung 1 -- synthetic control (exact QP vs Frank-Wolfe vs package)")

w_sc_qp <- simplex_ls(Z0, Z1)
w_sc_fw <- simplex_fw(Z0, Z1, min.decrease = MIN_DEC)

# The package. synthdid wants Y as [units x time] with the treated unit LAST,
# and `T0` = the NUMBER of pre-treatment periods.
Y_sd  <- t(cbind(Y[, DONORS], Y[, UK]))
sd_sc <- synthdid_estimate(Y_sd[, 1:(T0_Q3 + 1)], N0 = N0, T0 = T0_Q3,
                           zeta.omega = 0, zeta.lambda = 0,
                           omega.intercept = FALSE, lambda.intercept = FALSE)
w_sc_pkg <- as.numeric(attr(sd_sc, "weights")$omega)

ssr <- function(w) sum((Z1 - Z0 %*% w)^2)
cat(sprintf("  exact QP    : SSR %.6e   nonzero %2d   loss(2018Q4) %.3f\n",
            ssr(w_sc_qp), sum(w_sc_qp > 1e-6), loss(w_sc_qp, T_2018Q4)))
cat(sprintf("  hand-coded FW: SSR %.6e   nonzero %2d   loss(2018Q4) %.3f\n",
            ssr(w_sc_fw), sum(w_sc_fw > 1e-6), loss(w_sc_fw, T_2018Q4)))
cat(sprintf("  synthdid    : SSR %.6e   nonzero %2d   loss(2018Q4) %.3f\n",
            ssr(w_sc_pkg), sum(w_sc_pkg > 1e-6), loss(w_sc_pkg, T_2018Q4)))
cat(sprintf("  |FW - package| max abs weight difference : %.3e   <-- these agree\n",
            max(abs(w_sc_fw - w_sc_pkg))))
cat(sprintf("  |QP - package| max abs weight difference : %.3e   <-- these do NOT\n",
            max(abs(w_sc_qp - w_sc_pkg))))

# Why? Because the objective is nearly flat, Frank-Wolfe exhausts its iteration
# budget long before the gradient test is satisfied. Watch the estimate drift as
# we let it run longer.
ladder <- cache_rds("fw_ladder", {
  do.call(rbind, lapply(c(100, 300, 1000, 3000, 10000, 30000, 100000), function(it) {
    w <- simplex_fw(Z0, Z1, min.decrease = MIN_DEC, max.iter = it)
    data.frame(iterations = it, ssr = ssr(w),
               loss_2018Q4 = loss(w, T_2018Q4), loss_2019Q4 = loss(w, T_2019Q4))
  }))
})
ladder <- rbind(ladder, data.frame(iterations = NA, ssr = ssr(w_sc_qp),
                                   loss_2018Q4 = loss(w_sc_qp, T_2018Q4),
                                   loss_2019Q4 = loss(w_sc_qp, T_2019Q4)))
ladder$solver <- c(rep("Frank-Wolfe", nrow(ladder) - 1), "exact QP")
print(transform(ladder, ssr = signif(ssr, 6),
                loss_2018Q4 = round(loss_2018Q4, 3), loss_2019Q4 = round(loss_2019Q4, 3)),
      row.names = FALSE)
write_tab(ladder, "sc_solver_ladder")

lad <- subset(ladder, solver == "Frank-Wolfe")
p07 <- ggplot(lad, aes(iterations, loss_2018Q4)) +
  geom_hline(yintercept = ladder$loss_2018Q4[is.na(ladder$iterations)],
             colour = TEAL, linetype = "22", linewidth = 0.7) +
  geom_line(colour = STEEL, linewidth = 0.9) +
  geom_point(colour = STEEL, size = 2.4) +
  geom_point(data = subset(lad, iterations == 10000), colour = ORANGE, size = 4) +
  annotate("text", x = 10000, y = max(lad$loss_2018Q4),
           label = "synthdid's default budget:\nthe published 3.06", colour = ORANGE,
           size = 3.2, vjust = 0, hjust = 0.5, lineheight = 0.95) +
  annotate("text", x = 120, y = ladder$loss_2018Q4[is.na(ladder$iterations)],
           label = "exact optimum", colour = TEAL, size = 3.2, vjust = -0.7, hjust = 0) +
  scale_x_log10(labels = label_comma()) +
  labs(title = "The published synthetic-control estimate is a solver artefact",
       subtitle = "Estimated 2018Q4 GDP loss as Frank-Wolfe is allowed more iterations",
       x = "Frank-Wolfe iterations (log scale)", y = "estimated loss (% of GDP)",
       caption = "With no ridge penalty the objective is nearly flat (condition number ~7e5), so the optimiser stops on its iteration cap rather than on convergence.") +
  theme_site()
save_fig(p07, "07_solver_ladder")

# From here on, SC means the package/Frank-Wolfe answer, so that the ladder is
# comparable with the published tables. The exact QP is carried alongside.
w_sc <- w_sc_pkg
add_result("SC", "SC", loss(w_sc, T_2018Q4), loss(w_sc, T_2019Q4), "synthdid, Frank-Wolfe")
add_result("SC (exact QP)", "SC", loss(w_sc_qp, T_2018Q4), loss(w_sc_qp, T_2019Q4),
           "quadprog, exact")

wt_sc <- data.frame(country = DONOR_NM, omega_fw = round(w_sc, 4), omega_qp = round(w_sc_qp, 4))
print(subset(wt_sc, omega_fw > 1e-4 | omega_qp > 1e-4)[
  order(-subset(wt_sc, omega_fw > 1e-4 | omega_qp > 1e-4)$omega_fw), ], row.names = FALSE)

fit_sc  <- as.vector(Y[, DONORS] %*% w_sc)
rmspe_sc <- sqrt(mean((Z1 - fit_sc[1:T0_Q3])^2))
cat(sprintf("  pre-treatment RMSPE : %.5f  (DiD: %.5f)\n",
            rmspe_sc, sqrt(mean((Z1 - Z0 %*% w_did - b_did)^2))))

sc_df <- data.frame(date = QDEC, uk = Y[, UK], syn = fit_sc)
sc_df$gap <- sc_df$uk - sc_df$syn

pA <- ggplot(sc_df, aes(date)) +
  geom_line(aes(y = uk),  colour = ORANGE, linewidth = 1.0) +
  geom_line(aes(y = syn), colour = STEEL,  linewidth = 1.0, linetype = "22") +
  geom_vline(xintercept = BREXIT_DEC, linetype = "dashed", colour = TEAL, linewidth = 0.5) +
  annotate("text", x = 1996, y = max(sc_df$uk) * 0.97, label = "United Kingdom",
           colour = ORANGE, hjust = 0, size = 3.4) +
  annotate("text", x = 1996, y = max(sc_df$uk) * 0.89, label = "synthetic United Kingdom",
           colour = STEEL, hjust = 0, size = 3.4) +
  labs(title = "Synthetic control: 86 quarters of tracking, then a gap",
       subtitle = sprintf("Pre-treatment RMSPE = %.5f log points", rmspe_sc),
       x = NULL, y = "log real GDP index") +
  theme_site()

pB <- ggplot(sc_df, aes(date, gap)) +
  geom_hline(yintercept = 0, colour = MUTED, linewidth = 0.4) +
  geom_vline(xintercept = BREXIT_DEC, linetype = "dashed", colour = TEAL, linewidth = 0.5) +
  geom_line(colour = STEEL, linewidth = 0.9) +
  geom_point(data = sc_df[EVAL, ], colour = ORANGE, size = 2.8) +
  geom_text(data = sc_df[EVAL, ],
            aes(label = sprintf("%.2f%%", -100 * gap)),
            colour = ORANGE, vjust = 1.9, size = 3.2) +
  labs(x = NULL, y = "UK minus synthetic\n(log points)",
       caption = "The gap is flat and near zero for two decades, then turns persistently negative after the referendum.") +
  theme_site()

save_fig(pA / pB + plot_layout(heights = c(2, 1.2)), "06_sc_fit_gap", w = 9, h = 7.5)


# ── 6. What the simplex actually is ───────────────────────────────────────────
#
# Two pictures that make "constrained optimisation over a simplex" physical.

rule("6. The simplex and the convex hull, made visible")

# (a) The rubber band. Place donors in two pre-treatment coordinates -- their
#     average log GDP over the first and the last five pre-treatment years --
#     and draw the convex hull. Any non-negative blend lands inside it.
coord <- data.frame(
  country = COUNTRIES,
  x = colMeans(Y[1:20, ]),                 # 1995-1999
  y = colMeans(Y[(T0_Q3 - 19):T0_Q3, ]),   # 2011-2016
  stringsAsFactors = FALSE)
coord$role <- ifelse(coord$country == "United Kingdom", "UK", "donor")
dpts <- subset(coord, role == "donor")
hull <- dpts[chull(dpts$x, dpts$y), ]
syn_pt <- data.frame(x = sum(dpts$x[match(DONOR_NM, dpts$country)] * w_sc),
                     y = sum(dpts$y[match(DONOR_NM, dpts$country)] * w_sc))

p04 <- ggplot() +
  geom_polygon(data = hull, aes(x, y), fill = STEEL, alpha = 0.16,
               colour = STEEL, linewidth = 0.6, linetype = "22") +
  geom_point(data = dpts, aes(x, y), colour = GREY_DONOR, size = 2.2) +
  geom_text(data = subset(dpts, country %in% c("United States", "Hungary", "Japan",
                                               "Canada", "Norway", "Luxembourg", "Ireland")),
            aes(x, y, label = country), colour = LIGHT_TEXT, size = 2.9,
            vjust = -1.0) +
  geom_point(data = syn_pt, aes(x, y), colour = STEEL, size = 4, shape = 18) +
  geom_point(data = subset(coord, role == "UK"), aes(x, y), colour = ORANGE, size = 4.2) +
  geom_text(data = subset(coord, role == "UK"), aes(x, y, label = "United Kingdom"),
            colour = ORANGE, size = 3.3, vjust = -1.3) +
  labs(title = "The rubber band: what a non-negative blend can and cannot reach",
       subtitle = "Donors positioned by average log GDP early (1995-1999) and late (2011-2016) in the pre-period",
       x = "mean log real GDP, 1995-1999", y = "mean log real GDP, 2011-2016",
       caption = "Shaded region: the convex hull of the 23 donors. Diamond: the synthetic UK. If the orange point lay outside the band, no recipe of non-negative shares could reach it.") +
  theme_site()
save_fig(p04, "04_convex_hull")

# (b) The search itself. Restrict to the three largest-weight donors and draw
#     the pre-treatment MSPE over their 2-simplex.
TRIO <- c("United States", "Hungary", "Japan")
ti   <- match(TRIO, DONOR_NM)
grid <- expand.grid(a = seq(0, 1, by = 0.01), b = seq(0, 1, by = 0.01))
grid <- subset(grid, a + b <= 1)
grid$c <- 1 - grid$a - grid$b
grid$mspe <- apply(grid[, c("a", "b", "c")], 1, function(w)
  mean((Z1 - Z0[, ti] %*% w)^2))
# Barycentric to Cartesian for plotting.
grid$px <- grid$b + 0.5 * grid$c
grid$py <- sqrt(3) / 2 * grid$c
best <- grid[which.min(grid$mspe), ]
corners <- data.frame(px = c(0, 1, 0.5), py = c(0, 0, sqrt(3) / 2), lab = TRIO)

p05 <- ggplot(grid, aes(px, py)) +
  # The barycentric projection puts the grid on a triangular lattice, which
  # geom_raster cannot represent; square points of the right size can.
  geom_point(aes(colour = log10(mspe)), shape = 15, size = 1.15) +
  geom_point(data = best, colour = ORANGE, size = 4) +
  geom_text(data = best, aes(label = sprintf("argmin\n%.2f / %.2f / %.2f", a, b, c)),
            colour = ORANGE, size = 3.0, vjust = -0.6, lineheight = 0.95) +
  geom_text(data = corners, aes(px, py, label = lab), colour = LIGHTER_TEXT, size = 3.4,
            vjust = c(1.8, 1.8, -0.8)) +
  scale_colour_gradientn(colours = c(TEAL, STEEL, DARK_PANEL, "#2b1b3d"),
                         name = "log10 MSPE") +
  coord_equal(clip = "off") +
  labs(title = "Minimising over a simplex is a search over a triangle",
       subtitle = sprintf("Pre-treatment MSPE for blends of %s", paste(TRIO, collapse = ", ")),
       x = NULL, y = NULL,
       caption = "Each point in the triangle is one set of weights summing to one. The full problem is the same picture in 22 dimensions.") +
  theme_site() +
  theme(axis.text = element_blank(), panel.grid = element_blank())
save_fig(p05, "05_simplex_surface", w = 8, h = 7)


# ── 7. Rung 2: demeaned synthetic control ─────────────────────────────────────
#
# SC has no intercept, so it rejects a donor blend that moves in perfect
# parallel but sits at a different level. DSC demeans first and then adds the
# average pre-treatment gap back as a constant.

rule("7. Rung 2 -- demeaned synthetic control (DSC)")

Z0_dm   <- sweep(Z0, 2, colMeans(Z0))       # each COUNTRY's own time-series mean
Z1_dm   <- Z1 - mean(Z1)
w_dsc_qp <- simplex_ls(Z0_dm, Z1_dm)

sd_dsc  <- synthdid_estimate(Y_sd[, 1:(T0_Q3 + 1)], N0 = N0, T0 = T0_Q3,
                             zeta.omega = 0, zeta.lambda = 0,
                             omega.intercept = TRUE, lambda.intercept = TRUE)
w_dsc   <- as.numeric(attr(sd_dsc, "weights")$omega)
b_dsc   <- mean(Z1 - Z0 %*% w_dsc)          # the bias-adjustment constant

cat(sprintf("  bias adjustment b_dsc            : %+.5f log points (%.3f%% of GDP)\n",
            b_dsc, 100 * b_dsc))
cat(sprintf("  |QP - package| max weight diff   : %.3e\n", max(abs(w_dsc_qp - w_dsc))))
cat(sprintf("  correlation of SC and DSC weights: %.4f\n", cor(w_sc, w_dsc)))

add_result("DSC", "DSC", loss(w_dsc, T_2018Q4, b_dsc), loss(w_dsc, T_2019Q4, b_dsc),
           "synthdid, omega.intercept = TRUE")

fit_dsc <- as.vector(Y[, DONORS] %*% w_dsc) + b_dsc
off <- data.frame(date = QDEC, uk = Y[, UK], sc = fit_sc, dsc = fit_dsc)

p08 <- ggplot(subset(off, date >= 2010), aes(date)) +
  geom_line(aes(y = uk),  colour = ORANGE, linewidth = 1.0) +
  geom_line(aes(y = sc),  colour = STEEL,  linewidth = 0.9, linetype = "22") +
  geom_line(aes(y = dsc), colour = TEAL,   linewidth = 0.9, linetype = "42") +
  geom_vline(xintercept = BREXIT_DEC, linetype = "dashed", colour = MUTED, linewidth = 0.5) +
  annotate("text", x = 2010.2, y = max(off$uk) * 0.999, label = "United Kingdom",
           colour = ORANGE, hjust = 0, size = 3.3) +
  annotate("text", x = 2010.2, y = max(off$uk) * 0.985, label = "synthetic control",
           colour = STEEL, hjust = 0, size = 3.3) +
  annotate("text", x = 2010.2, y = max(off$uk) * 0.971,
           label = sprintf("demeaned SC (shifted by %+.4f)", b_dsc),
           colour = TEAL, hjust = 0, size = 3.3) +
  labs(title = "DSC is SC's curve, slid by one number",
       subtitle = "And here that number is small, which is itself the finding",
       x = NULL, y = "log real GDP index",
       caption = "A small bias adjustment means the synthetic control was already level-balanced. When it is large, SC has been sacrificing shape to chase level.") +
  theme_site()
save_fig(p08, "08_dsc_offset")


# ── 8. Rung 3: synthetic difference-in-differences ────────────────────────────
#
# SDID keeps DSC's unit weights and replaces the FLAT pre-treatment average in
# the bias adjustment with an optimally weighted one. The time-weight problem is
# the unit-weight problem run on the transpose:
#
#   omega : which COUNTRIES, blended, reproduce the UK?      (demean by country)
#   lambda: which QUARTERS, blended, reproduce the treatment
#           quarter, judged across all donors?               (demean by quarter)
#
# CAREFUL: "demeaned" means two different things in rung 2 and rung 3.
#   DSC   -> sweep(Z0, 2, colMeans(Z0))   each country's own time-series mean
#   SDID  -> sweep(Z0, 1, rowMeans(Z0))   each quarter's cross-sectional mean

rule("8. Rung 3 -- SDID time weights")

# Three variants, differing only in what the time weights are fitted against.
# The regressors are the donors' pre-treatment paths TRANSPOSED (donors as rows,
# quarters as columns) and the target is the donors' post-block average, both
# demeaned across donors -- that is the cross-sectional demeaning of equation 13.
lambda_for <- function(post_rows, T0 = T0_Q3) {
  A <- t(Y[1:T0, DONORS])                                       # 23 x T0
  b <- rowMeans(t(Y[post_rows, DONORS, drop = FALSE]))          # 23
  simplex_fw(A, b, intercept = TRUE, min.decrease = MIN_DEC)
}

lam_i   <- lambda_for(T0_Q3 + 1)                                # (i)   treatment quarter
lam_ii  <- lambda_for((T0_Q3 + 1):T_2018Q4)                     # (ii)  post block average
lam_iii <- lambda_for(T_2018Q4)                                 # (iii) evaluation quarter
lam_ii19  <- lambda_for((T0_Q3 + 1):T_2019Q4)
lam_iii19 <- lambda_for(T_2019Q4)

# Package cross-check on variant (i).
lam_pkg <- as.numeric(attr(sd_dsc, "weights")$lambda)
cat(sprintf("  |hand-coded lambda - synthdid lambda| : %.3e\n", max(abs(lam_i - lam_pkg))))

bias_adj <- function(lam, w = w_dsc) drop(lam %*% (Z1 - Z0 %*% w))
b_i   <- bias_adj(lam_i)

cat(sprintf("  lambda(i): %d nonzero weights; %.3f on the last pre-period (%s)\n",
            sum(lam_i > 1e-6), lam_i[T0_Q3], QLAB[T0_Q3]))
top_lam <- order(-lam_i)[1:4]
for (k in top_lam) if (lam_i[k] > 1e-4)
  cat(sprintf("      %-8s %.4f\n", QLAB[k], lam_i[k]))
cat(sprintf("  DSC bias adjustment %+.5f  vs  SDID(i) bias adjustment %+.5f\n", b_dsc, b_i))
cat("  Note: SDID reuses DSC's unit weights exactly. identical(w_dsc, w_sdid) is TRUE\n")

add_result("SDID (i)",   "SDID", loss(w_dsc, T_2018Q4, b_i), loss(w_dsc, T_2019Q4, b_i),
           "lambda fitted on the treatment quarter")
add_result("SDID (ii)",  "SDID", loss(w_dsc, T_2018Q4, bias_adj(lam_ii)),
           loss(w_dsc, T_2019Q4, bias_adj(lam_ii19)), "lambda fitted on the post-period average")
add_result("SDID (iii)", "SDID", loss(w_dsc, T_2018Q4, bias_adj(lam_iii)),
           loss(w_dsc, T_2019Q4, bias_adj(lam_iii19)), "lambda fitted on the evaluation quarter")

lam_df <- data.frame(t = 1:T0_Q3, date = QDEC[1:T0_Q3], lambda = lam_i)
write_tab(data.frame(quarter = QLAB[1:T0_Q3], lambda_i = round(lam_i, 6),
                     lambda_ii = round(lam_ii, 6), lambda_iii = round(lam_iii, 6)),
          "sdid_time_weights")

pL <- ggplot(lam_df, aes(date, lambda)) +
  geom_hline(yintercept = 1 / T0_Q3, colour = GOLD, linetype = "22", linewidth = 0.6) +
  annotate("text", x = 1996, y = 1 / T0_Q3, label = "uniform: the two-way fixed-effects correction",
           colour = GOLD, hjust = 0, vjust = -0.8, size = 3.0) +
  geom_segment(aes(xend = date, yend = 0), colour = STEEL, linewidth = 0.6) +
  geom_point(colour = STEEL, size = 1.6) +
  geom_point(data = subset(lam_df, lambda > 0.02), colour = ORANGE, size = 3) +
  geom_text(data = subset(lam_df, lambda > 0.02),
            aes(label = sprintf("%s: %.3f", QLAB[t], lambda)),
            colour = ORANGE, size = 3.0, hjust = 1.1) +
  labs(title = "SDID's time weights collapse onto the last pre-treatment quarter",
       subtitle = "Estimated lambda over the 86 pre-treatment quarters, variant (i)",
       x = NULL, y = expression(lambda[t])) +
  theme_site()

rw <- data.frame(prev = as.vector(Z0[1:(T0_Q3 - 1), ]), cur = as.vector(Z0[2:T0_Q3, ]))
pR <- ggplot(rw, aes(prev, cur)) +
  geom_abline(slope = 1, intercept = 0, colour = ORANGE, linetype = "22", linewidth = 0.7) +
  geom_point(colour = STEEL, alpha = 0.35, size = 0.9) +
  labs(title = "Why: log GDP is nearly a random walk",
       subtitle = sprintf("Donor log GDP at quarter t against quarter t-1 (correlation %.5f)",
                          cor(rw$prev, rw$cur)),
       x = "quarter t-1", y = "quarter t",
       caption = "If the best predictor of next quarter is this quarter, the best weighted blend of past quarters is the most recent one alone. The 'lambda interpolates between DiD and two-way FE' story collapses to the DiD corner.") +
  theme_site()

save_fig(pL / pR + plot_layout(heights = c(1.3, 1)), "09_lambda_weights", w = 9, h = 8)


# ── 9. The pivot: extrapolation bias vs interpolation bias ────────────────────
#
# The paper's theoretical core. For any weighted counterfactual, the total bias
# splits into two pieces that no single weighting scheme could kill before SDID:
#
#   extrapolation bias : same response function, evaluated at the WRONG place
#                        (the blend's characteristics differ from the treated
#                        unit's)
#   interpolation bias : right place, but the response function is CURVED, so
#                        the average of outcomes is not the outcome at the
#                        average
#
# Neither name means what a newcomer will guess. This figure is the definition.

rule("9. The bias decomposition, drawn")

f0    <- function(x) 1.9 + 0.55 * x - 0.16 * x^2       # a curved response
x1    <- 3.0                                            # the treated unit
x2    <- 1.2; x3 <- 4.6                                 # two donors
w_li  <- (x1 - x2) / (x3 - x2)                          # linear-interpolation weights
xg    <- seq(0.6, 5.2, by = 0.02)
curve_df <- data.frame(x = xg, y = f0(xg))

y_li  <- (1 - w_li) * f0(x2) + w_li * f0(x3)            # average of the outcomes
y_nn  <- f0(x2)                                          # nearest neighbour (x2 is closer)

seg <- data.frame(
  panel = c("Linear-interpolation weights", "Nearest-neighbour weights"),
  x = c(x1, x1), yend = c(f0(x1), f0(x1)), y = c(y_li, y_nn),
  lab = c("interpolation bias", "extrapolation bias"))
pts <- rbind(
  data.frame(panel = "Linear-interpolation weights",
             x = c(x2, x3, x1, x1), y = c(f0(x2), f0(x3), f0(x1), y_li),
             kind = c("donor", "donor", "truth", "estimate")),
  data.frame(panel = "Nearest-neighbour weights",
             x = c(x2, x3, x1, x1), y = c(f0(x2), f0(x3), f0(x1), y_nn),
             kind = c("donor", "donor", "truth", "estimate")))
chord <- data.frame(panel = "Linear-interpolation weights",
                    x = x2, xend = x3, y = f0(x2), yend = f0(x3))

p10 <- ggplot() +
  geom_line(data = transform(rbind(cbind(curve_df, panel = "Linear-interpolation weights"),
                                   cbind(curve_df, panel = "Nearest-neighbour weights"))),
            aes(x, y), colour = STEEL, linewidth = 0.9) +
  geom_segment(data = chord, aes(x = x, xend = xend, y = y, yend = yend),
               colour = MUTED, linetype = "22", linewidth = 0.6) +
  geom_segment(data = seg, aes(x = x, xend = x, y = y, yend = yend),
               colour = ORANGE, linewidth = 1.4, arrow = arrow(length = unit(0.10, "in"),
                                                               ends = "both")) +
  geom_text(data = seg, aes(x = x, y = (y + yend) / 2, label = lab),
            colour = ORANGE, hjust = -0.09, size = 3.3) +
  geom_point(data = pts, aes(x, y, colour = kind, shape = kind), size = 3.2) +
  scale_colour_manual(values = c(donor = GREY_DONOR, truth = TEAL, estimate = ORANGE),
                      name = NULL,
                      labels = c(donor = "donor outcomes", estimate = "weighted estimate",
                                 truth = "true treated outcome")) +
  scale_shape_manual(values = c(donor = 16, truth = 17, estimate = 15), name = NULL,
                     labels = c(donor = "donor outcomes", estimate = "weighted estimate",
                                truth = "true treated outcome")) +
  facet_wrap(~ panel) +
  labs(title = "Two ways to be wrong, and no single weighting kills both",
       subtitle = "A curved response function, two donors, one treated unit",
       x = "characteristic x", y = "untreated outcome y(x)",
       caption = "Left: weights placed so the blend's characteristic equals the treated unit's -- no extrapolation bias, but the chord sits below the curve. Right: copy the nearest donor -- no interpolation bias, but the wrong place on the curve. SC's unit weights attack the left problem; SDID's time weights attack the right one.") +
  theme_site()
save_fig(p10, "10_bias_toy", w = 10, h = 5.6)

# Which estimator targets which piece.
tiles <- expand.grid(
  method = factor(c("ASCM", "MASC", "SDID", "DSC", "SC", "Matching", "DiD"),
                  levels = c("ASCM", "MASC", "SDID", "DSC", "SC", "Matching", "DiD")),
  bias   = factor(c("Extrapolation", "Interpolation", "Imperfect pre-fit"),
                  levels = c("Extrapolation", "Interpolation", "Imperfect pre-fit")))
tiles$level <- c(
  # Extrapolation
  "Targets", "Targets", "Targets", "Targets", "Targets", "No", "No",
  # Interpolation
  "Partly", "Partly", "Targets", "No", "No", "Targets", "No",
  # Imperfect pre-fit
  "Targets", "No", "No", "Partly", "No", "No", "No")
tiles$level <- factor(tiles$level, levels = c("Targets", "Partly", "No"))

p11 <- ggplot(tiles, aes(bias, method, fill = level)) +
  geom_tile(colour = DARK_BG, linewidth = 1.5) +
  geom_text(aes(label = level), colour = "white", size = 3.3, fontface = "bold") +
  scale_fill_manual(values = c(Targets = TEAL, Partly = STEEL, No = DARK_PANEL),
                    guide = "none") +
  labs(title = "Only one row is dark in both of the first two columns",
       subtitle = "Which component of the bias each estimator is built to attack",
       x = NULL, y = NULL,
       caption = "This is the source paper's central claim: SDID's unit weights minimise the extrapolation bias while its time weights minimise the interpolation bias, so it targets both.") +
  theme_site() +
  theme(panel.grid = element_blank())
save_fig(p11, "11_bias_targets", w = 8, h = 5.5)


# ── 10. Rung 4: MASC -- buy the trade-off explicitly ──────────────────────────
#
# A convex blend of m-nearest-neighbour matching and synthetic control, with
# BOTH m and the blend weight phi chosen by rolling-origin cross-validation on
# pre-treatment data only.

rule("10. Rung 4 -- MASC")

nn_weights <- function(Z0, Z1, m) {
  d   <- colSums((Z1 - Z0)^2)
  sel <- d %in% sort(d)[1:m]
  as.numeric(sel) / sum(sel)
}

# Rolling-origin CV. For each fold origin k we refit BOTH estimators on
# quarters 1..k, forecast quarter k+1, and score. phi then has a closed form.
#
# NOTE the fold set. The published scripts pass masc's `min_preperiods`
# argument, but current masc master reads it as the fold START, giving only 5
# folds -- which selects phi = 1 (pure matching) and does NOT reproduce the
# paper. The authors' results correspond to folds running from 6 to T0-1.
masc_cv <- function(Z0, Z1, T0, m_grid = 1:10, set_f = 6:(T0 - 1)) {
  wt  <- rep(1 / length(set_f), length(set_f))
  ysc <- vapply(set_f, function(k) drop(Z0[k + 1, ] %*% simplex_ls(Z0[1:k, , drop = FALSE], Z1[1:k])), 0)
  ytr <- Z1[set_f + 1]
  out <- do.call(rbind, lapply(m_grid, function(m) {
    ymt <- vapply(set_f, function(k)
      drop(Z0[k + 1, ] %*% nn_weights(Z0[1:k, , drop = FALSE], Z1[1:k], m)), 0)
    phi <- drop((wt * (ytr - ysc)) %*% (ymt - ysc) / ((wt * (ymt - ysc)) %*% (ymt - ysc)))
    phi <- min(1, max(0, phi))
    data.frame(m = m, phi = phi,
               cv = sum(wt * (ytr - phi * ymt - (1 - phi) * ysc)^2))
  }))
  out
}

cv_tab  <- cache_rds("masc_cv", masc_cv(Z0, Z1, T0_Q3))
bestrow <- cv_tab[which.min(cv_tab$cv), ]
m_hat   <- bestrow$m; phi_hat <- bestrow$phi
w_masc_hand <- phi_hat * nn_weights(Z0, Z1, m_hat) + (1 - phi_hat) * simplex_ls(Z0, Z1)

cat(sprintf("  hand-coded : m = %d, phi = %.4f\n", m_hat, phi_hat))
print(transform(cv_tab, phi = round(phi, 4), cv = signif(cv, 5)), row.names = FALSE)
write_tab(cv_tab, "masc_cv_table")

# The package, driven onto our own SC solver. masc's own no-Gurobi branch has a
# bug (it references an object it never assigns), but `sc_est` is a documented
# extension point, so we hand it the exact QP we already trust.
sc_est_qp <- function(treated, donors, treated.covariates, donors.covariates, treatment, ...) {
  D <- as.matrix(donors)[1:(treatment - 1), , drop = FALSE]
  y <- as.numeric(unlist(treated))[1:(treatment - 1)]
  list(solution.w = simplex_ls(D, y), loss.w = NA_real_, solution.v = NULL, loss.v = NULL)
}
masc_fit <- cache_rds("masc_pkg", masc(
  treated = matrix(Y[, UK], ncol = 1), donors = Y[, DONORS],
  treatment = T0_Q3 + 1, sc_est = sc_est_qp,
  tune_pars_list = list(m = 1:10, set_f = 6:T0_Q3)))
w_masc <- as.numeric(masc_fit$weights)

cat(sprintf("  masc package: m = %d, phi = %.4f   |hand - package| = %.3e\n",
            masc_fit$m_hat, masc_fit$phi_hat, max(abs(w_masc_hand - w_masc))))

add_result("MASC", "MASC", loss(w_masc, T_2018Q4), loss(w_masc, T_2019Q4),
           sprintf("m = %d, phi = %.3f", masc_fit$m_hat, masc_fit$phi_hat))

p12 <- ggplot(cv_tab, aes(factor(m), cv)) +
  geom_col(fill = STEEL, width = 0.68) +
  geom_col(data = bestrow, aes(factor(m), cv), fill = TEAL, width = 0.68) +
  geom_text(aes(label = sprintf("phi = %.2f", phi)), colour = LIGHT_TEXT,
            vjust = -0.6, size = 3.0) +
  labs(title = "MASC does not guess the blend, it cross-validates it",
       subtitle = sprintf("Rolling-origin CV error by number of matched neighbours; winner m = %d, phi = %.3f",
                          m_hat, phi_hat),
       x = "m (number of matched donors)", y = "rolling-origin CV error",
       caption = "phi is the share of weight given to matching. At phi = 0 MASC collapses to plain synthetic control, so it can never do worse on this criterion.") +
  theme_site()
save_fig(p12, "12_masc_cv")


# ── 11. Rung 5: augmented synthetic control ───────────────────────────────────
#
# Replace the non-negativity constraint with a ridge pull toward the SC weights.
# The weights may now go negative, which is how ASCM reaches a treated unit
# sitting outside the donors' convex hull.

rule("11. Rung 5 -- augmented synthetic control (ASCM)")

ad <- data.frame(unitnum = rep(seq_len(24), each = T0_Q3 + 1),
                 t       = rep(seq_len(T0_Q3 + 1), 24),
                 value   = as.vector(Y[1:(T0_Q3 + 1), c(UK, DONORS)]))
ad$treatment <- as.integer(ad$unitnum == 1 & ad$t == T0_Q3 + 1)
ascm_fit <- cache_rds("ascm_pkg",
                      augsynth(value ~ treatment, unitnum, t, ad,
                               progfunc = "Ridge", scm = TRUE))
w_ascm <- as.numeric(ascm_fit$weights)

# The same thing by hand: SC weights plus a ridge-predicted correction for the
# residual pre-treatment imbalance. The ridge parameter is NOT ours to invent --
# augsynth picks it by leave-one-period-out cross-validation and exposes it as
# $lambda. Feed that back in and the closed form reproduces the package exactly.
ascm_hand <- function(lambda_ridge) {
  Xc  <- sweep(t(Z0), 2, colMeans(t(Z0)))            # 23 x T0, period-centred
  x1c <- Z1 - colMeans(t(Z0))
  as.numeric(w_sc_qp + solve(tcrossprod(Xc) + lambda_ridge * diag(N0),
                             Xc %*% (x1c - crossprod(Xc, w_sc_qp))))
}
LAMBDA_RIDGE <- ascm_fit$lambda
w_ascm_hand  <- ascm_hand(LAMBDA_RIDGE)

cat(sprintf("  package : sum(w) = %.4f, min(w) = %+.4f, %d negative weights\n",
            sum(w_ascm), min(w_ascm), sum(w_ascm < 0)))
cat(sprintf("  hand    : ridge lambda = %.5f (chosen by augsynth's own CV)\n", LAMBDA_RIDGE))
cat(sprintf("            loss(2018Q4) = %.3f   |hand - package| max weight diff = %.3e\n",
            loss(w_ascm_hand, T_2018Q4), max(abs(w_ascm_hand - w_ascm))))
neg <- data.frame(country = DONOR_NM, omega = round(w_ascm, 4))
cat("  negative weights (impossible under the simplex):\n")
print(subset(neg, omega < 0)[order(subset(neg, omega < 0)$omega), ], row.names = FALSE)

add_result("ASCM", "ASCM", loss(w_ascm, T_2018Q4), loss(w_ascm, T_2019Q4),
           "augsynth, progfunc = Ridge")


# ── 12. The whole ladder, side by side ────────────────────────────────────────

rule("12. The ladder")

BORN_2018 <- 2.4          # Born et al. (2019), SC(B) with mean covariates
BORN_2019 <- 3.6

print(results, row.names = FALSE)
write_tab(results, "att_headline")
cat(sprintf("\n  Born et al. (2019) benchmark: %.1f%% at 2018Q4, %.1f%% at 2019Q4\n",
            BORN_2018, BORN_2019))

main <- subset(results, !method %in% c("SC (exact QP)"))
mlev <- c("DiD", "SC", "DSC", "SDID (i)", "SDID (ii)", "SDID (iii)", "MASC", "ASCM")
dot  <- pivot_longer(main[main$method %in% mlev, ],
                     c(loss_2018Q4, loss_2019Q4),
                     names_to = "horizon", values_to = "loss")
dot$horizon <- ifelse(dot$horizon == "loss_2018Q4", "2018Q4", "2019Q4")
dot$method  <- factor(dot$method, levels = rev(mlev))

p15 <- ggplot(dot, aes(loss, method, colour = horizon)) +
  geom_vline(xintercept = BORN_2018, colour = ORANGE, linetype = "22", linewidth = 0.6) +
  geom_vline(xintercept = BORN_2019, colour = ORANGE, linetype = "42", linewidth = 0.6) +
  annotate("text", x = BORN_2018, y = "ASCM", label = "Born et al. 2018Q4: 2.4%",
           colour = ORANGE, hjust = 1.03, vjust = 2.4, size = 3.0) +
  geom_point(size = 3.4) +
  geom_text(aes(label = sprintf("%.2f", loss)), vjust = -1.1, size = 2.9, show.legend = FALSE) +
  scale_colour_manual(values = c("2018Q4" = STEEL, "2019Q4" = TEAL), name = NULL) +
  labs(title = "Every rung of the ladder puts the Brexit cost above 2.4%",
       subtitle = "Estimated shortfall in UK GDP, treatment dated 2016Q3, no covariates",
       x = "GDP loss relative to the counterfactual (%)", y = NULL,
       caption = "Dashed lines: the estimates originally reported by Born et al. (2019). DiD is shown for completeness only -- its parallel-trends assumption already failed in figure 02.") +
  theme_site()
save_fig(p15, "15_att_dotplot")

# All counterfactual paths at once, zoomed to where they diverge.
cf <- data.frame(
  date = QDEC,
  `United Kingdom` = Y[, UK],
  SC   = as.vector(Y[, DONORS] %*% w_sc),
  DSC  = as.vector(Y[, DONORS] %*% w_dsc) + b_dsc,
  SDID = as.vector(Y[, DONORS] %*% w_dsc) + b_i,
  MASC = as.vector(Y[, DONORS] %*% w_masc),
  ASCM = as.vector(Y[, DONORS] %*% w_ascm),
  check.names = FALSE)
cf_long <- pivot_longer(cf, -date, names_to = "series", values_to = "y")
cf_long$series <- factor(cf_long$series,
                         levels = c("United Kingdom", "SC", "DSC", "SDID", "MASC", "ASCM"))

p14 <- ggplot(subset(cf_long, date >= 2014), aes(date, y, colour = series, linewidth = series)) +
  geom_vline(xintercept = BREXIT_DEC, linetype = "dashed", colour = MUTED, linewidth = 0.5) +
  geom_line() +
  scale_colour_manual(values = c("United Kingdom" = ORANGE, SC = STEEL, DSC = TEAL,
                                 SDID = GOLD, MASC = "#b98cd6", ASCM = GREY_DONOR),
                      name = NULL) +
  scale_linewidth_manual(values = c("United Kingdom" = 1.3, SC = 0.75, DSC = 0.75,
                                    SDID = 0.75, MASC = 0.75, ASCM = 0.75), guide = "none") +
  labs(title = "Six counterfactual United Kingdoms",
       subtitle = "Indistinguishable before the referendum, fanning out by about half a percentage point after it",
       x = NULL, y = "log real GDP index",
       caption = "The methods disagree only after treatment. Before it they are all fitting the same 86 quarters, and all fitting them well.") +
  theme_site()
save_fig(p14, "14_all_counterfactuals")

# Donor weights across methods, including ASCM's negatives.
wt_all <- data.frame(
  country = rep(DONOR_NM, 5),
  method  = rep(c("SC", "DSC", "SDID", "MASC", "ASCM"), each = N0),
  omega   = c(w_sc, w_dsc, w_dsc, w_masc, w_ascm))
wt_all$method <- factor(wt_all$method, levels = c("SC", "DSC", "SDID", "MASC", "ASCM"))
keep_c <- unique(wt_all$country[abs(wt_all$omega) > 0.01])
wt_all$country <- factor(wt_all$country,
                         levels = rev(sort(unique(wt_all$country))))
write_tab(pivot_wider(wt_all, names_from = method, values_from = omega), "donor_weights_by_method")

p13 <- ggplot(subset(wt_all, country %in% keep_c), aes(omega, country, fill = omega < 0)) +
  geom_col(width = 0.72) +
  geom_vline(xintercept = 0, colour = MUTED, linewidth = 0.4) +
  facet_wrap(~ method, nrow = 1) +
  scale_fill_manual(values = c("FALSE" = STEEL, "TRUE" = ORANGE), guide = "none") +
  labs(title = "Four of the five recipes are nearly the same blend",
       subtitle = "Donor weights above 0.01 in absolute value; orange bars are negative",
       x = expression(omega[j]), y = NULL,
       caption = "SDID reuses DSC's unit weights exactly, so those two panels are identical by construction. Only ASCM, which drops the non-negativity constraint, crosses zero.") +
  theme_site(11)
save_fig(p13, "13_donor_weights", w = 11, h = 5.5)


# ── 13. The in-sample placebo tournament ──────────────────────────────────────
#
# The paper's model-selection device, and the basis for its recommendation.
# Advance the treatment date to a quarter when nothing happened, build the
# counterfactual on data up to that point only, and compare to what actually
# occurred. The true effect is zero, so every estimate is pure error.
#
# One wrinkle the paper does not flag: its own scripts grade SC, DSC, SDID(i),
# MASC and ASCM one quarter ahead but SDID(ii) and (iii) FOUR quarters ahead.
# Part of the apparent gap is therefore the harder task, not the worse method.
# We report both horizons.

rule("13. In-sample placebo across 20 expanding windows")

placebo_one <- function(k, h) {
  # k = index of the last pre-treatment quarter; forecast quarter k + h.
  z1 <- Y[1:k, UK]; z0 <- Y[1:k, DONORS]
  e  <- k + h
  w_s  <- simplex_fw(z0, z1, min.decrease = MIN_DEC)
  w_d  <- simplex_fw(z0, z1, intercept = TRUE, min.decrease = MIN_DEC)
  bd   <- mean(z1 - z0 %*% w_d)
  li   <- simplex_fw(t(z0), Y[k + 1, DONORS], intercept = TRUE, min.decrease = MIN_DEC)
  lii  <- simplex_fw(t(z0), rowMeans(t(Y[(k + 1):(k + 4), DONORS, drop = FALSE])),
                     intercept = TRUE, min.decrease = MIN_DEC)
  liii <- simplex_fw(t(z0), Y[k + 4, DONORS], intercept = TRUE, min.decrease = MIN_DEC)
  bi   <- drop(li   %*% (z1 - z0 %*% w_d))
  bii  <- drop(lii  %*% (z1 - z0 %*% w_d))
  biii <- drop(liii %*% (z1 - z0 %*% w_d))
  cvt  <- masc_cv(z0, z1, k)
  br   <- cvt[which.min(cvt$cv), ]
  w_m  <- br$phi * nn_weights(z0, z1, br$m) + (1 - br$phi) * simplex_ls(z0, z1)
  adk  <- data.frame(unitnum = rep(seq_len(24), each = k + 1),
                     t = rep(seq_len(k + 1), 24),
                     value = as.vector(Y[1:(k + 1), c(UK, DONORS)]))
  adk$treatment <- as.integer(adk$unitnum == 1 & adk$t == k + 1)
  # suppressMessages: augsynth announces "Running single_augsynth" on every call,
  # which would put 40 lines of noise in the log across this loop.
  w_a <- as.numeric(suppressMessages(
    augsynth(value ~ treatment, unitnum, t, adk,
             progfunc = "Ridge", scm = TRUE))$weights)
  g <- function(w, b = 0) Y[e, UK] - drop(Y[e, DONORS] %*% w) - b
  data.frame(k = k, last_pre = QLAB[k], horizon = h,
             SC = g(w_s), DSC = g(w_d, bd),
             `SDID (i)` = g(w_d, bi), `SDID (ii)` = g(w_d, bii), `SDID (iii)` = g(w_d, biii),
             MASC = g(w_m), ASCM = g(w_a), check.names = FALSE)
}

placebo <- cache_rds("placebo_insample", {
  do.call(rbind, lapply(c(1, 4), function(h)
    do.call(rbind, lapply(61:80, function(k) placebo_one(k, h)))))
})
write_tab(placebo, "placebo_insample_errors")

summarise_placebo <- function(df) {
  m <- setdiff(names(df), c("k", "last_pre", "horizon"))
  do.call(rbind, lapply(m, function(v) data.frame(
    method = v,
    RMSE   = sqrt(mean(df[[v]]^2)),
    MAB    = mean(abs(df[[v]])),
    MedAB  = median(abs(df[[v]])))))
}
pl_h1 <- summarise_placebo(subset(placebo, horizon == 1))
pl_h4 <- summarise_placebo(subset(placebo, horizon == 4))

cat("\n  Horizon h = 1 quarter\n")
print(transform(pl_h1, RMSE = round(RMSE, 4), MAB = round(MAB, 4), MedAB = round(MedAB, 4)),
      row.names = FALSE)
cat("\n  Horizon h = 4 quarters\n")
print(transform(pl_h4, RMSE = round(RMSE, 4), MAB = round(MAB, 4), MedAB = round(MedAB, 4)),
      row.names = FALSE)

# The paper's own Table 7 mixes the two horizons: h = 1 for SC/DSC/SDID(i)/MASC/ASCM,
# h = 4 for SDID(ii) and SDID(iii).
paper_tab <- rbind(subset(pl_h1, !method %in% c("SDID (ii)", "SDID (iii)")),
                   subset(pl_h4,  method %in% c("SDID (ii)", "SDID (iii)")))
paper_tab$published_RMSE <- c(0.0089, 0.0087, 0.0067, 0.0080, 0.0086, 0.0134, 0.0134)[
  match(paper_tab$method, c("SC", "DSC", "SDID (i)", "MASC", "ASCM", "SDID (ii)", "SDID (iii)"))]
cat("\n  As the paper reports it (mixed horizons), against the published values\n")
print(transform(paper_tab, RMSE = round(RMSE, 4), MAB = round(MAB, 4), MedAB = round(MedAB, 4)),
      row.names = FALSE)
write_tab(paper_tab, "placebo_insample_summary")
write_tab(cbind(horizon = 1, pl_h1), "placebo_h1_summary")
write_tab(cbind(horizon = 4, pl_h4), "placebo_h4_summary")

pl_long <- pivot_longer(placebo, -c(k, last_pre, horizon),
                        names_to = "method", values_to = "err")
pl_long$method <- factor(pl_long$method,
                         levels = c("SC", "DSC", "SDID (i)", "SDID (ii)", "SDID (iii)",
                                    "MASC", "ASCM"))
pl_long$hlab <- factor(ifelse(pl_long$horizon == 1, "graded 1 quarter ahead",
                              "graded 4 quarters ahead"))

p16 <- ggplot(pl_long, aes(err, method)) +
  geom_vline(xintercept = 0, colour = MUTED, linewidth = 0.4) +
  geom_jitter(height = 0.16, colour = STEEL, alpha = 0.75, size = 1.9) +
  geom_point(data = aggregate(err ~ method + hlab, pl_long,
                              function(z) sqrt(mean(z^2))),
             aes(x = err), colour = ORANGE, size = 3.2, shape = 18) +
  facet_wrap(~ hlab) +
  labs(title = "A fire drill for estimators: 20 treatment dates when nothing happened",
       subtitle = "Placebo errors at last pre-treatment quarters 2010Q1 to 2014Q4; orange diamond is the RMSE",
       x = "placebo error (log points)", y = NULL,
       caption = "The paper grades SDID (ii) and (iii) four quarters ahead but everyone else one quarter ahead. Comparing like with like, their disadvantage shrinks but does not vanish.") +
  theme_site()
save_fig(p16, "16_placebo_tournament", w = 10, h = 6)


# ── 14. Curated robustness ────────────────────────────────────────────────────

rule("14. Robustness")

# (a) The other treatment date.
Z1b <- Y[1:T0_Q2, UK]; Z0b <- Y[1:T0_Q2, DONORS]
w_sc_q2  <- simplex_fw(Z0b, Z1b, min.decrease = MIN_DEC)
w_dsc_q2 <- simplex_fw(Z0b, Z1b, intercept = TRUE, min.decrease = MIN_DEC)
b_dsc_q2 <- mean(Z1b - Z0b %*% w_dsc_q2)
lam_q2   <- simplex_fw(t(Z0b), Y[T0_Q2 + 1, DONORS], intercept = TRUE, min.decrease = MIN_DEC)
b_i_q2   <- drop(lam_q2 %*% (Z1b - Z0b %*% w_dsc_q2))
cv_q2    <- cache_rds("masc_cv_q2", masc_cv(Z0b, Z1b, T0_Q2))
br_q2    <- cv_q2[which.min(cv_q2$cv), ]
w_masc_q2 <- br_q2$phi * nn_weights(Z0b, Z1b, br_q2$m) + (1 - br_q2$phi) * simplex_ls(Z0b, Z1b)

date_tab <- data.frame(
  method = c("SC", "DSC", "SDID (i)", "MASC"),
  `2016Q2_2018Q4` = c(loss(w_sc_q2, T_2018Q4), loss(w_dsc_q2, T_2018Q4, b_dsc_q2),
                      loss(w_dsc_q2, T_2018Q4, b_i_q2), loss(w_masc_q2, T_2018Q4)),
  `2016Q3_2018Q4` = c(loss(w_sc, T_2018Q4), loss(w_dsc, T_2018Q4, b_dsc),
                      loss(w_dsc, T_2018Q4, b_i), loss(w_masc, T_2018Q4)),
  check.names = FALSE)
date_tab[, -1] <- round(date_tab[, -1], 3)
cat("\n  (a) Treatment date\n"); print(date_tab, row.names = FALSE)
write_tab(date_tab, "robustness_treatment_date")

# (b) Dropping the United States, which carries about a fifth of the weight.
US   <- which(DONOR_NM == "United States")
D2   <- DONORS[-US]
Z0n  <- Y[1:T0_Q3, D2]
w_scn  <- simplex_fw(Z0n, Z1, min.decrease = MIN_DEC)
w_dscn <- simplex_fw(Z0n, Z1, intercept = TRUE, min.decrease = MIN_DEC)
b_dscn <- mean(Z1 - Z0n %*% w_dscn)
lam_n  <- simplex_fw(t(Z0n), Y[T0_Q3 + 1, D2], intercept = TRUE, min.decrease = MIN_DEC)
b_in   <- drop(lam_n %*% (Z1 - Z0n %*% w_dscn))
lossn  <- function(w, e, b = 0) pct(Y[e, UK] - drop(Y[e, D2] %*% w) - b)

us_tab <- data.frame(
  method = c("SC", "DSC", "SDID (i)"),
  with_US    = round(c(loss(w_sc, T_2018Q4), loss(w_dsc, T_2018Q4, b_dsc),
                       loss(w_dsc, T_2018Q4, b_i)), 3),
  without_US = round(c(lossn(w_scn, T_2018Q4), lossn(w_dscn, T_2018Q4, b_dscn),
                       lossn(w_dscn, T_2018Q4, b_in)), 3))
cat(sprintf("\n  (b) Donor pool without the United States (US weight was %.3f)\n", w_sc[US]))
print(us_tab, row.names = FALSE)
write_tab(us_tab, "robustness_no_us")

# (c) The Arkhangelsky et al. ridge penalty, switched on.
sd_sc_p  <- synthdid_estimate(Y_sd[, 1:(T0_Q3 + 1)], N0, T0_Q3, zeta.lambda = 0,
                              omega.intercept = FALSE, lambda.intercept = FALSE)
sd_dsc_p <- synthdid_estimate(Y_sd[, 1:(T0_Q3 + 1)], N0, T0_Q3, zeta.lambda = 0,
                              omega.intercept = TRUE, lambda.intercept = TRUE)
w_scp  <- as.numeric(attr(sd_sc_p,  "weights")$omega)
w_dscp <- as.numeric(attr(sd_dsc_p, "weights")$omega)
b_dscp <- mean(Z1 - Z0 %*% w_dscp)
lam_p  <- as.numeric(attr(sd_dsc_p, "weights")$lambda)
pen_tab <- data.frame(
  method = c("SC", "DSC", "SDID (i)"),
  no_penalty = round(c(loss(w_sc, T_2018Q4), loss(w_dsc, T_2018Q4, b_dsc),
                       loss(w_dsc, T_2018Q4, b_i)), 3),
  with_penalty = round(c(loss(w_scp, T_2018Q4), loss(w_dscp, T_2018Q4, b_dscp),
                         loss(w_dscp, T_2018Q4, drop(lam_p %*% (Z1 - Z0 %*% w_dscp)))), 3))
cat("\n  (c) With the automatic ridge penalty on the unit weights\n")
print(pen_tab, row.names = FALSE)
write_tab(pen_tab, "robustness_penalty")

# (d) Covariates. This is the slow one: Synth optimises a 92-dimensional
#     predictor-importance vector, and every objective evaluation solves a QP.
rule("14d. Covariates (Synth nested optimisation -- slow, cached)")

cov_means <- sapply(c("cons_share", "inv_share", "exp_share", "imp_share",
                      "labprod_growth", "emp_pop"), function(v) {
  M <- matrix(panel[[v]][order(panel$unit_id, panel$t)], nrow = 104)
  colMeans(M[1:T0_Q3, ])
})
X1 <- as.matrix(c(Z1, cov_means[UK, ]))
X0 <- rbind(Z0, t(cov_means[DONORS, ]))
X1d <- as.matrix(c(Z1_dm, cov_means[UK, ]))
X0d <- rbind(Z0_dm, t(cov_means[DONORS, ]))

fit_synth <- function(key, X1, X0, Z1a, Z0a) cache_rds(key, {
  set.seed(SEED)
  invisible(capture.output(s <- synth(X1 = X1, X0 = X0, Z1 = as.matrix(Z1a), Z0 = Z0a)))
  s
})
s_born <- fit_synth("synth_born", X1,  X0,  X1,  X0)     # SC(B): covariates in BOTH loops
s_sc   <- fit_synth("synth_sc",   X1,  X0,  Z1,  Z0)     # SC cov: outcomes in the outer loop
s_dsc  <- fit_synth("synth_dsc",  X1d, X0d, Z1_dm, Z0_dm)

w_born  <- as.numeric(s_born$solution.w)
w_sccov <- as.numeric(s_sc$solution.w)
w_dsccv <- as.numeric(s_dsc$solution.w)
b_dsccv <- mean(Z1 - Z0 %*% w_dsccv)
b_i_cv  <- drop(lam_i %*% (Z1 - Z0 %*% w_dsccv))

cov_tab <- data.frame(
  method = c("SC(B)", "SC cov.", "DSC cov.", "SDID cov. (i)",
             "SC no cov.", "DSC no cov.", "SDID no cov. (i)"),
  loss_2018Q4 = round(c(loss(w_born, T_2018Q4), loss(w_sccov, T_2018Q4),
                        loss(w_dsccv, T_2018Q4, b_dsccv), loss(w_dsccv, T_2018Q4, b_i_cv),
                        loss(w_sc, T_2018Q4), loss(w_dsc, T_2018Q4, b_dsc),
                        loss(w_dsc, T_2018Q4, b_i)), 3),
  loss_2019Q4 = round(c(loss(w_born, T_2019Q4), loss(w_sccov, T_2019Q4),
                        loss(w_dsccv, T_2019Q4, b_dsccv), loss(w_dsccv, T_2019Q4, b_i_cv),
                        loss(w_sc, T_2019Q4), loss(w_dsc, T_2019Q4, b_dsc),
                        loss(w_dsc, T_2019Q4, b_i)), 3),
  published = c(2.43, 3.11, 2.90, 2.75, 3.06, 2.98, 2.76))
cat("\n  (d) Mean covariates, all pre-treatment outcomes\n")
print(cov_tab, row.names = FALSE)
write_tab(cov_tab, "robustness_covariates")

rob_all <- rbind(
  data.frame(check = "Treatment date 2016Q2", method = date_tab$method,
             loss = date_tab$`2016Q2_2018Q4`),
  data.frame(check = "Treatment date 2016Q3", method = date_tab$method,
             loss = date_tab$`2016Q3_2018Q4`),
  data.frame(check = "Without the US",        method = us_tab$method,  loss = us_tab$without_US),
  data.frame(check = "With ridge penalty",    method = pen_tab$method, loss = pen_tab$with_penalty),
  data.frame(check = "With mean covariates",  method = c("SC", "DSC", "SDID (i)"),
             loss = cov_tab$loss_2018Q4[2:4]))

p17 <- ggplot(rob_all, aes(loss, check, colour = method)) +
  geom_vline(xintercept = BORN_2018, colour = ORANGE, linetype = "22", linewidth = 0.6) +
  geom_point(size = 3.2, alpha = 0.9) +
  scale_colour_manual(values = c(SC = STEEL, DSC = TEAL, `SDID (i)` = GOLD,
                                 MASC = "#b98cd6"), name = NULL) +
  labs(title = "The specification zoo",
       subtitle = "Estimated 2018Q4 GDP loss under five departures from the headline specification",
       x = "GDP loss (%)", y = NULL,
       caption = "Dashed line: Born et al.'s 2.4%. Only the covariate specifications and the SC(B) variant approach it; every no-covariate estimate sits well above.") +
  theme_site()
save_fig(p17, "17_robustness_grid", w = 10, h = 5.5)


# ── 15. Inference -- an extension beyond the paper ────────────────────────────
#
# The source paper deliberately reports no inference at all. That is a defensible
# choice for a methods comparison and a poor place for a first-time learner to
# stop. Everything in this section is our addition.

rule("15. Inference: placebo in space (extension beyond the paper)")

placebo_space <- cache_rds("placebo_in_space", {
  do.call(rbind, lapply(seq_len(N0), function(j) {
    pseudo <- DONORS[j]; pool <- setdiff(DONORS, pseudo)
    z1 <- Y[1:T0_Q3, pseudo]; z0 <- Y[1:T0_Q3, pool]
    w  <- simplex_fw(z0, z1, min.decrease = MIN_DEC)
    g  <- Y[, pseudo] - as.vector(Y[, pool] %*% w)
    data.frame(country = COUNTRIES[pseudo], t = seq_len(104), gap = g,
               stringsAsFactors = FALSE)
  }))
})
uk_gap <- Y[, UK] - as.vector(Y[, DONORS] %*% w_sc)
placebo_space <- rbind(placebo_space,
                       data.frame(country = "United Kingdom", t = seq_len(104), gap = uk_gap))

ratio_of <- function(g) sqrt(mean(g[(T0_Q3 + 1):104]^2)) / sqrt(mean(g[1:T0_Q3]^2))
ratios <- aggregate(gap ~ country, placebo_space, ratio_of)
names(ratios)[2] <- "rmspe_ratio"
ratios <- ratios[order(-ratios$rmspe_ratio), ]
ratios$rank <- seq_len(nrow(ratios))
uk_rank  <- ratios$rank[ratios$country == "United Kingdom"]
p_perm   <- uk_rank / nrow(ratios)

cat(sprintf("  UK post/pre RMSPE ratio : %.2f\n",
            ratios$rmspe_ratio[ratios$country == "United Kingdom"]))
cat(sprintf("  rank among %d countries : %d\n", nrow(ratios), uk_rank))
cat(sprintf("  permutation p-value     : %.3f  (finest attainable: %.3f)\n",
            p_perm, 1 / nrow(ratios)))
write_tab(ratios, "placebo_in_space_ratios")

se_placebo <- tryCatch(sqrt(vcov(sd_dsc, method = "placebo"))[1, 1],
                       error = function(e) NA_real_)
cat(sprintf("  synthdid placebo standard error (SDID): %s\n",
            ifelse(is.na(se_placebo), "unavailable", sprintf("%.5f log points", se_placebo))))

inf_tab <- data.frame(
  quantity = c("UK RMSPE ratio", "Rank among 24 countries", "Permutation p-value",
               "synthdid placebo SE (log points)"),
  value = c(sprintf("%.2f", ratios$rmspe_ratio[ratios$country == "United Kingdom"]),
            sprintf("%d of %d", uk_rank, nrow(ratios)), sprintf("%.3f", p_perm),
            ifelse(is.na(se_placebo), "NA", sprintf("%.5f", se_placebo))))
write_tab(inf_tab, "inference_summary")

ps <- merge(placebo_space, data.frame(t = seq_len(104), date = QDEC), by = "t")
ps$role <- ifelse(ps$country == "United Kingdom", "United Kingdom", "placebo donor")

p18 <- ggplot(subset(ps, role == "placebo donor"), aes(date, gap, group = country)) +
  geom_hline(yintercept = 0, colour = MUTED, linewidth = 0.4) +
  geom_vline(xintercept = BREXIT_DEC, linetype = "dashed", colour = TEAL, linewidth = 0.5) +
  geom_line(colour = GREY_DONOR, linewidth = 0.35, alpha = 0.8) +
  geom_line(data = subset(ps, role == "United Kingdom"), colour = ORANGE, linewidth = 1.2) +
  labs(title = "What if the referendum had happened somewhere else?",
       subtitle = sprintf("Synthetic-control gaps with each donor in turn cast as the treated unit (permutation p = %.3f)",
                          p_perm),
       x = NULL, y = "gap: actual minus synthetic (log points)",
       caption = "Orange: the United Kingdom. Grey: the 23 placebo runs. With 23 donors the smallest attainable p-value is 1/24, so this test cannot reject at conventional levels no matter how extreme the UK looks.") +
  theme_site()
save_fig(p18, "18_placebo_in_space")


# ── 16. Assertions, web-app payload, wrap-up ──────────────────────────────────

rule("16. Verification against the published tables")

published <- c("SC" = 3.06, "DSC" = 2.98, "SDID (i)" = 2.76,
               "SDID (ii)" = 2.79, "SDID (iii)" = 2.79, "MASC" = 2.73, "ASCM" = 3.04)
chk <- results[match(names(published), results$method), c("method", "loss_2018Q4")]
chk$published <- as.numeric(published)
chk$diff      <- round(chk$loss_2018Q4 - chk$published, 3)
print(chk, row.names = FALSE)
write_tab(chk, "replication_check")

stopifnot(
  "SC off target"        = abs(chk$diff[chk$method == "SC"])         < 0.02,
  "DSC off target"       = abs(chk$diff[chk$method == "DSC"])        < 0.02,
  "SDID(i) off target"   = abs(chk$diff[chk$method == "SDID (i)"])   < 0.02,
  "MASC off target"      = abs(chk$diff[chk$method == "MASC"])       < 0.02,
  "ASCM off target"      = abs(chk$diff[chk$method == "ASCM"])       < 0.02,
  "MASC tuning off"      = masc_fit$m_hat == 10 && abs(masc_fit$phi_hat - 0.1577) < 0.01,
  "placebo SDID(i) off"  = abs(pl_h1$RMSE[pl_h1$method == "SDID (i)"] - 0.0067) < 0.0004,
  "placebo SC off"       = abs(pl_h1$RMSE[pl_h1$method == "SC"]       - 0.0089) < 0.0004,
  "FW must not beat QP"  = ssr(w_sc_qp) <= ssr(w_sc_pkg) + 1e-12
)
cat("  All replication assertions passed.\n")

dir.create("web_app/data", recursive = TRUE, showWarnings = FALSE)
write_json(list(
  meta = list(slug = SLUG, treated = COUNTRIES[UK], donors = DONOR_NM,
              quarters = QLAB, t0 = T0_Q3, eval = as.list(EVAL),
              born_2018 = BORN_2018, born_2019 = BORN_2019),
  outcome = list(uk = as.numeric(Y[, UK]),
                 donors = lapply(DONOR_NM, function(c) as.numeric(Y[, c]))),
  weights = list(SC = as.numeric(w_sc), DSC = as.numeric(w_dsc),
                 SDID = as.numeric(w_dsc), MASC = as.numeric(w_masc),
                 ASCM = as.numeric(w_ascm), DiD = as.numeric(w_did)),
  bias_adjustment = list(DiD = b_did, SC = 0, DSC = b_dsc, SDID = b_i, MASC = 0, ASCM = 0),
  lambda = list(`i` = as.numeric(lam_i), `ii` = as.numeric(lam_ii), `iii` = as.numeric(lam_iii)),
  results = results, placebo = paper_tab, placebo_h1 = pl_h1, placebo_h4 = pl_h4,
  solver_ladder = ladder, inference = inf_tab,
  robustness = list(date = date_tab, no_us = us_tab, penalty = pen_tab, covariates = cov_tab)
), "web_app/data/results.json", auto_unbox = TRUE, digits = 8, pretty = TRUE)
cat("  [json]   web_app/data/results.json\n")

if (file.exists("Rplots.pdf")) file.remove("Rplots.pdf")

rule("HEADLINE")
cat(sprintf("
  Treatment dated %s, no covariates, %d donors, %d pre-treatment quarters.

  Estimated shortfall in UK real GDP versus the no-Brexit counterfactual:

      at 2018Q4 :  %.2f%% (SC)   %.2f%% (DSC)   %.2f%% (SDID i)   %.2f%% (MASC)   %.2f%% (ASCM)
      at 2019Q4 :  %.2f%% (SC)   %.2f%% (DSC)   %.2f%% (SDID i)   %.2f%% (MASC)   %.2f%% (ASCM)

  Born et al. (2019) reported %.1f%% at 2018Q4. Every rung of the ladder is larger.

  In-sample placebo over 20 artificial treatment dates, graded like for like at
  one quarter ahead, ranks SDID (i) first on all three error measures
  (RMSE %.4f versus %.4f for plain synthetic control).
",
  QLAB[T0_Q3 + 1], N0, T0_Q3,
  results$loss_2018Q4[results$method == "SC"],
  results$loss_2018Q4[results$method == "DSC"],
  results$loss_2018Q4[results$method == "SDID (i)"],
  results$loss_2018Q4[results$method == "MASC"],
  results$loss_2018Q4[results$method == "ASCM"],
  results$loss_2019Q4[results$method == "SC"],
  results$loss_2019Q4[results$method == "DSC"],
  results$loss_2019Q4[results$method == "SDID (i)"],
  results$loss_2019Q4[results$method == "MASC"],
  results$loss_2019Q4[results$method == "ASCM"],
  BORN_2018,
  pl_h1$RMSE[pl_h1$method == "SDID (i)"], pl_h1$RMSE[pl_h1$method == "SC"]))

sessionInfo()
cat("\n=== Script completed successfully ===\n")
