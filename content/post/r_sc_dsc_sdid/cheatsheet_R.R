# ══════════════════════════════════════════════════════════════════════════════
# THE SYNTHETIC-CONTROL LADDER IN R — one package call per rung
#
#   DiD  ->  SC  ->  DSC  ->  SDID  ->  MASC  ->  ASCM
#
# Every number below comes straight out of a package function. Nothing is
# hand-coded, nothing is reconstructed from extracted weights. If you want the
# from-scratch versions -- and the reasons each rung exists -- read analysis.R
# and the post:
#     https://carlos-mendez.org/post/r_sc_dsc_sdid/
#
# Companions:  cheatsheet_stata.do   cheatsheet_python.py
#
# Usage:     Rscript cheatsheet_R.R
# Run time:  about 4 minutes, of which 3 are placebo standard errors.
#            Set SE <- FALSE below for a 30-second run.
# Data:      loads over HTTPS. Nothing is written to disk.
# ══════════════════════════════════════════════════════════════════════════════

SE   <- TRUE      # compute placebo standard errors (slow)
SEED <- 20260802  # placebo inference resamples donors, so this matters

# ── Packages ──────────────────────────────────────────────────────────────────
#   install.packages("quadprog")
#   remotes::install_github("synth-inference/synthdid")
#   remotes::install_github("ebenmichael/augsynth")
#
# masc declares a hard dependency on Gurobi, a commercial solver it never
# reaches on the path used here. Strip it first:
#   git clone --depth 1 https://github.com/maxkllgg/masc /tmp/masc_src
#   sed -i '' 's/^    gurobi,$//' /tmp/masc_src/DESCRIPTION
#   R CMD INSTALL /tmp/masc_src

suppressPackageStartupMessages({
  library(synthdid)   # DiD, SC, DSC, SDID
  library(masc)       # MASC
  library(augsynth)   # ASCM
  library(quadprog)   # only for the four-line MASC adapter, see rung 4
})

# ── Data ──────────────────────────────────────────────────────────────────────
# 24 OECD countries x 104 quarters (1995Q1-2020Q4), quarterly log real GDP.
URL <- paste0("https://raw.githubusercontent.com/cmg777/starter-academic-v501/",
              "master/content/post/r_sc_dsc_sdid/brexit_analysis.csv")
d <- read.csv(if (file.exists("brexit_analysis.csv")) "brexit_analysis.csv" else URL)

CT  <- unique(d$country[order(d$unit_id)])
Y   <- matrix(d$log_rgdp[order(d$unit_id, d$t)], nrow = 104, dimnames = list(NULL, CT))
UK  <- which(CT == "United Kingdom")   # the treated unit
DON <- setdiff(seq_along(CT), UK)      # 23 donors
N0  <- length(DON)
T0  <- 86                              # pre-treatment quarters, through 2016Q2
EVAL <- c(`2018Q4` = 96, `2019Q4` = 100)

# ══════════════════════════════════════════════════════════════════════════════
# THE ONE TRICK THAT MAKES THIS A CHEAT SHEET
#
# synthdid returns an ATT averaged over ALL post-treatment periods. The post
# reports the shortfall at two specific quarters instead. Rather than pulling
# weights out of the fitted object and re-deriving the gap by hand, truncate
# the panel to the 86 pre-treatment quarters PLUS the single quarter you care
# about. The average over "all post periods" is then an average over one
# period, and the bare package call returns exactly the number you want.
#
# Every rung below uses this. It is the whole reason there is no arithmetic in
# this file.
# ══════════════════════════════════════════════════════════════════════════════

panel <- function(e) t(cbind(Y[c(1:T0, e), DON], Y[c(1:T0, e), UK]))  # units x time, treated LAST

pct <- function(est) -100 * as.numeric(est)   # ATT in log points -> % GDP shortfall
sef <- function(est) {                        # placebo SE, the right choice with one treated unit
  if (!SE) return(NA_real_)
  set.seed(SEED)
  100 * sqrt(vcov(est, method = "placebo"))
}

R <- list()   # results accumulator: R[[method]] <- c(q2018, q2019, se2018)
say <- function(name, v) {
  cat(sprintf("  %-22s 2018Q4 %5.2f   2019Q4 %5.2f\n", name, v[1], v[2]))
  invisible(v)
}

cat("\nBrexit: shortfall in UK real GDP (%), treatment dated 2016Q3, no covariates\n")
cat(strrep("=", 78), "\n\n")

# ── Rung 0. DiD ───────────────────────────────────────────────────────────────
# Every donor weighted 1/23, every pre-quarter weighted 1/86. A unit fixed
# effect absorbs the level gap. No fitting happens at all.
cat("0. DiD\n")
did <- lapply(EVAL, function(e) did_estimate(panel(e), N0, T0))
R$DiD <- c(sapply(did, pct), sef(did[[1]]))
say("did_estimate()", R$DiD)

# ── Rung 1. SC ────────────────────────────────────────────────────────────────
# Donor weights on the simplex, fitted to the treated unit's pre-treatment path.
# No intercept: the blend has to match the UK's LEVEL as well as its shape.
# sc_estimate() is synthdid_estimate() with lambda fixed at zero and the omega
# intercept switched off -- that is exactly Abadie's estimator.
cat("\n1. SC\n")
sc <- lapply(EVAL, function(e) sc_estimate(panel(e), N0, T0))
R$SC <- c(sapply(sc, pct), sef(sc[[1]]))
say("sc_estimate()", R$SC)

# ── Rung 2. DSC ───────────────────────────────────────────────────────────────
# Demeaned SC. Turn the omega intercept back on -- the blend now only has to
# match the SHAPE, and a constant absorbs the level -- and keep time weights
# uniform. One argument separates this from SDID.
#
# zeta.* = 0 turns off synthdid's ridge penalty, because the paper solves the
# unpenalised problem. See the note under rung 3 for what the default costs.
cat("\n2. DSC\n")
dsc <- lapply(EVAL, function(e)
  synthdid_estimate(panel(e), N0, T0,
                    weights = list(lambda = rep(1 / T0, T0)),   # uniform time weights
                    zeta.omega = 0, zeta.lambda = 0))
R$DSC <- c(sapply(dsc, pct), sef(dsc[[1]]))
say("synthdid_estimate(lambda=unif)", R$DSC)

# ── Rung 3. SDID ──────────────────────────────────────────────────────────────
# Same unit weights as DSC. The one change is that the time weights are now
# fitted too, so the pre/post comparison leans on the pre-treatment quarters
# that actually resemble the post-treatment period.
cat("\n3. SDID\n")
sdid <- lapply(EVAL, function(e) synthdid_estimate(panel(e), N0, T0,
                                                   zeta.omega = 0, zeta.lambda = 0))
R$SDID <- c(sapply(sdid, pct), sef(sdid[[1]]))
say("synthdid_estimate()", R$SDID)

# What the DEFAULTS give you. synthdid adds a small ridge penalty out of the
# box; the paper does not. Worth seeing, because it is the difference between
# reproducing a published table and not.
cat(sprintf("  %-22s 2018Q4 %5.2f   <- package defaults, zeta left alone\n",
            "  (same, no zeta arg)", pct(synthdid_estimate(panel(EVAL[1]), N0, T0))))

# ── Rung 4. MASC ──────────────────────────────────────────────────────────────
# A cross-validated blend of m-nearest-neighbour matching and SC. The blend
# weight phi and the neighbour count m are both chosen by rolling-origin CV.
#
# TWO THINGS THE PACKAGE MAKES YOU DO:
#   (a) masc's own solver calls Gurobi. Its nogurobi = TRUE fallback references
#       an unassigned variable and errors out, so the documented sc_est hook is
#       the only way in without a commercial licence. Those four lines are an
#       upstream workaround, not pedagogy.
#   (b) set_f must be given explicitly. Passing min_preperiods to current
#       package master yields 5 folds and selects phi = 1 (pure matching),
#       which does not reproduce the published result. Folds run 6 to T0.
cat("\n4. MASC\n")

simplex_ls <- function(A, b) {                       # (a) -- the adapter, not the lesson
  k <- ncol(A)
  w <- solve.QP(crossprod(A) + 1e-10 * diag(k), crossprod(A, b),
                cbind(rep(1, k), diag(k)), c(1, rep(0, k)), meq = 1)$solution
  w[w < 1e-10] <- 0
  w / sum(w)
}
sc_hook <- function(treated, donors, treated.covariates, donors.covariates, treatment, ...)
  list(solution.w = simplex_ls(as.matrix(donors)[1:(treatment - 1), , drop = FALSE],
                               as.numeric(unlist(treated))[1:(treatment - 1)]),
       loss.w = NA_real_, solution.v = NULL, loss.v = NULL)

masc_fit <- lapply(EVAL, function(e)
  masc(treated  = matrix(Y[c(1:T0, e), UK], ncol = 1),
       donors   = Y[c(1:T0, e), DON],
       treatment = T0 + 1,
       sc_est   = sc_hook,
       tune_pars_list = list(m = 1:10, set_f = 6:T0)))   # (b)

# masc returns weights but no ATT accessor, so this one gap is closed by hand.
R$MASC <- c(mapply(function(f, e) -100 * (Y[e, UK] - drop(Y[e, DON] %*% as.numeric(f$weights))),
                   masc_fit, EVAL), NA_real_)
say("masc()", R$MASC)
cat(sprintf("  %-22s m = %d neighbours, phi = %.3f (that much weight on matching)\n", "",
            masc_fit[[1]]$m_hat, masc_fit[[1]]$phi_hat))

# ── Rung 5. ASCM ──────────────────────────────────────────────────────────────
# SC weights plus a ridge-regression correction for whatever pre-treatment
# imbalance SC could not close. Non-negativity is dropped, so weights may go
# negative -- the counterfactual is allowed to leave the convex hull.
# augsynth picks the ridge parameter by cross-validation and reports the ATT
# per period, so no truncation arithmetic is needed at all.
cat("\n5. ASCM\n")
ascm <- lapply(EVAL, function(e) {
  # augsynth wants a long data frame. Do not call the unit column `unit`:
  # augsynth's non-standard evaluation resolves that name to a value and fails.
  ad <- data.frame(unitnum = rep(1:24, each = T0 + 1), t = rep(1:(T0 + 1), 24),
                   value = as.vector(Y[c(1:T0, e), c(UK, DON)]))
  ad$treatment <- as.integer(ad$unitnum == 1 & ad$t == T0 + 1)
  suppressMessages(augsynth(value ~ treatment, unitnum, t, ad, progfunc = "Ridge", scm = TRUE))
})
ascm_se <- NA_real_
if (SE) {
  ascm_se <- 100 * suppressMessages(summary(ascm[[1]], inf_type = "jackknife"))$att$Std.Error[T0 + 1]
}
R$ASCM <- c(sapply(ascm, function(a)
              -100 * suppressMessages(summary(a))$att$Estimate[T0 + 1]), ascm_se)
say("augsynth(progfunc=\"Ridge\")", R$ASCM)
cat(sprintf("  %-22s ridge lambda = %.5f, chosen by augsynth's own CV\n", "", ascm[[1]]$lambda))

# ══════════════════════════════════════════════════════════════════════════════
# COMPARATIVE TABLE
#
# The `Paper` column is de Brabander, Juodis & Miyazato Szini (2025), 2018Q4,
# no covariates. If your run reproduces it, the code above is right.
#
# The SE column is each package's OWN recommended inference, named per row --
# that is what you actually get for free, and the methods are not comparable
# across rows. All of them are wide: one treated unit and 23 donors is not much
# information, whatever the point estimate suggests.
# ══════════════════════════════════════════════════════════════════════════════

PAPER <- c(DiD = NA, SC = 3.06, DSC = 2.98, SDID = 2.79, MASC = 2.73, ASCM = 3.04)
CMD   <- c(DiD  = "did_estimate()",
           SC   = "sc_estimate()",
           DSC  = "synthdid_estimate(lambda = uniform)",
           SDID = "synthdid_estimate()",
           MASC = "masc()",
           ASCM = "augsynth(progfunc = \"Ridge\")")
INF   <- c(DiD  = "placebo x200", SC = "placebo x200", DSC = "placebo x200",
           SDID = "placebo x200", MASC = "none in package", ASCM = "jackknife")

cat("\n\n", strrep("=", 78), "\n", sep = "")
cat("UK GDP shortfall (%), 2016Q3 treatment, outcomes only, 23 donors, 86 pre-quarters\n")
cat(strrep("=", 78), "\n")
cat(sprintf("%-6s %-36s %7s %7s %8s  %-15s %6s\n",
            "Rung", "Command", "2018Q4", "2019Q4", "SE 18Q4", "Inference", "Paper"))
cat(strrep("-", 78), "\n")
for (k in names(CMD)) {
  v <- R[[k]]
  cat(sprintf("%-6s %-36s %7.2f %7.2f %8s  %-15s %6s\n",
              k, CMD[[k]], v[1], v[2],
              if (is.na(v[3])) "--" else sprintf("%.2f", v[3]),
              INF[[k]],
              if (is.na(PAPER[[k]])) "--" else sprintf("%.2f", PAPER[[k]])))
}
cat(strrep("-", 78), "\n")

# ── Reading the table ─────────────────────────────────────────────────────────
cat("
Four things worth noticing.

1. Every rung clears 2.4%, the figure Born et al. (2019) published for this
   dataset. The disagreement between methods (2.7 to 3.1) is much smaller than
   their common disagreement with the earlier number.

2. The placebo standard errors fall steadily down the ladder -- DiD, SC, DSC,
   SDID -- and SDID's is more than five times tighter than DiD's. Each fix that
   makes the counterfactual better also makes it better determined. Even so,
   every one of these intervals is wide enough to contain 0: with one treated
   unit and 23 donors, the point estimates are far better identified than any
   interval around them.

3. DO NOT compare ASCM's standard error with the rest. It is a jackknife SE
   from augsynth, not a placebo SE from synthdid, and the two are not on the
   same scale. That is the price of reporting each package's own inference:
   you get what the authors thought was appropriate, not a common yardstick.

4. DiD is the outlier at ~5%, and it is the only rung that never looks at the
   data to choose its weights.

Not here, deliberately:
  * SC(B) and the other covariate specifications. Synth's nested optimisation
    over 92 predictors runs for minutes -- see analysis.R section 14d.
  * SDID variants (i) and (iii). Truncating the panel fits the time weights on
    the evaluation quarter, which is variant (iii) (= (ii) here, 2.79). Variant
    (i) fits them on the treatment quarter instead and gives 2.76.
  * Everything hand-coded: the simplex QP, the Frank-Wolfe ladder, the bias
    decomposition, the placebo tournament. That is what analysis.R is for.
")
