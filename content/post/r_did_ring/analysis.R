# ============================================================================
# analysis.R                                                                  #
#                                                                             #
# An Intuitive Introduction to Difference-in-Differences with Geocoded Data   #
# (the "ring" approach)                                                       #
#                                                                             #
# AUDIENCE                                                                    #
#   Advanced undergraduate and early graduate students in economics who have  #
#   seen the classical 2x2 difference-in-differences but have never used      #
#   distance from a treatment point as the running variable. The script       #
#   builds up to the modern nonparametric ring estimator one small idea at a  #
#   time, with simulated data first and a real-world application last.       #
#                                                                             #
# INSPIRATION AND ACKNOWLEDGMENT                                              #
#   This tutorial is inspired by, and follows the methodology of,             #
#                                                                             #
#     Butts, Kyle (2023). "JUE Insight: Difference-in-Differences with        #
#     Geocoded Microdata." Journal of Urban Economics 133, 103493.            #
#     https://doi.org/10.1016/j.jue.2022.103493                               #
#                                                                             #
#   The estimators implemented here (parametric ring DiD, nonparametric ring  #
#   estimator via binsreg) are exactly those proposed by Butts. The empirical #
#   application uses the Linden & Rockoff (2008) data on sex-offender         #
#   arrivals and home prices that ships with Butts's replication archive.    #
#   Original BibTeX:                                                          #
#                                                                             #
#     @article{butts2023jue,                                                  #
#       title   = {JUE Insight: Difference-in-differences with geocoded       #
#                  microdata},                                                #
#       author  = {Butts, Kyle},                                              #
#       journal = {Journal of Urban Economics},                               #
#       volume  = {133},                                                      #
#       pages   = {103493},                                                   #
#       year    = {2023},                                                     #
#       publisher = {Elsevier}                                                #
#     }                                                                       #
#                                                                             #
#   What is different here: presentation. The paper is research-grade and     #
#   compact. This tutorial trades some compactness for pedagogy -- the same   #
#   methods, the same data, but rearranged so a student new to the topic     #
#   can follow the argument step by step.                                     #
#                                                                             #
# THE BIG IDEA                                                                #
#   When a "treatment" happens at a point in space (a new highway interchange,#
#   a hazardous-waste site, a sex offender's address), units close to the    #
#   point are exposed and units far from it are not. The "ring" estimator    #
#   compares the change in outcomes near the point (treated ring) with the   #
#   change in outcomes a little farther away (control ring) -- the same      #
#   logic as 2x2 DiD, but the groups are defined by distance instead of by   #
#   policy assignment. The challenge: the ring boundaries are usually a      #
#   judgement call, and the answer can wobble when you change them.          #
#                                                                             #
# WHAT YOU WILL LEARN                                                         #
#   1. Why distance is a sensible source of exogenous variation              #
#   2. How to write the ring DiD as a one-line first-differences regression  #
#   3. Why arbitrary ring choices can mislead you                            #
#   4. How a binscatter-based nonparametric estimator delivers a treatment-  #
#      effect *curve* instead of a single number                             #
#   5. How the method changes our reading of Linden & Rockoff (2008)         #
#                                                                             #
# PIPELINE OUTPUTS                                                            #
#   * analysis.R          -- this file (also serves as the post's outline)   #
#   * execution_log.txt   -- captured stdout/stderr from running the script  #
#   * r_did_ring_01_*.png ... r_did_ring_10_*.png  -- at least 10 figures    #
#   * raw_data.csv, data_prepared.csv  -- inputs and analysis sample         #
#   * table_*.csv x >= 6 -- every numerical result, ready for the post       #
#   * summary.csv         -- headline numbers across estimators              #
#   * README.md           -- artifact inventory for downstream skills        #
# ============================================================================



# ============================================================================
# Section 0. Setup
# ----------------------------------------------------------------------------
# WHAT   We load packages, set a reproducibility seed, define the site's dark
#        color palette, and register a ggplot theme.
# WHY    Reproducibility (same seed -> same answers) and consistent visuals
#        across all figures.
# HOW    `pacman::p_load()` installs anything missing from CRAN before loading.
# WATCH  Nothing user-facing yet; just confirm the script reports its R version.
# ============================================================================

set.seed(42)

if (!require("pacman")) {
  install.packages("pacman", repos = "https://cloud.r-project.org")
}

pacman::p_load(
  tidyverse,    # data manipulation + ggplot
  fixest,       # fast fixed-effects regression (`feols`)
  haven,        # read Stata `.dta` files
  data.table,   # used inside the inline helpers (keeps the original logic)
  binsreg,      # data-driven binscatter used by the nonparametric estimator
  KernSmooth,   # `locpoly()` local-polynomial smoothing (CRAN, no compile)
  lpridge,      # `lpepa()` local-polynomial with Epanechnikov kernel (CRAN)
  ggplot2,      # plotting
  patchwork,    # combine ggplot panels
  sf,           # simple-features geometry for the toy ring picture
  glue,         # safer string interpolation than `paste0`
  scales,       # dollar / comma formatters
  broom         # tidy regression output
)

options(knitr.kable.NA = "", dplyr.summarise.inform = FALSE)

# --- Dark-theme palette ------------------------------------------------------
# Site-wide palette for carlos-mendez.org "dark theme" posts. Kept as named
# constants so any color edit happens in one place.
BG_DARK    <- "#0f1729"   # plot + panel background
GRID_DARK  <- "#1f2b5e"   # gridlines (subtle on dark bg)
TEXT_LIGHT <- "#c8d0e0"   # axis text, tick labels
TEXT_WHITE <- "#e8ecf2"   # titles, bold annotations

# Site accent colors.
BLUE   <- "#6a9bcc"  # primary series (steel blue)
ORANGE <- "#d97757"  # secondary series (warm orange)
TEAL   <- "#00d4c8"  # highlights, annotations
BLACK  <- "#141413"  # near-black
GREY   <- "#7d8597"  # muted reference lines

# A custom ggplot theme. Once registered with `theme_set()`, every subsequent
# ggplot inherits the dark background and light text.
theme_dark_dampoostle <- function(base_size = 12) {
  theme_minimal(base_size = base_size) +
    theme(
      plot.background     = element_rect(fill = BG_DARK, color = NA),
      panel.background    = element_rect(fill = BG_DARK, color = NA),
      panel.grid.major    = element_line(color = GRID_DARK, linewidth = 0.35),
      panel.grid.minor    = element_line(color = GRID_DARK, linewidth = 0.18),
      panel.border        = element_rect(color = GRID_DARK, fill = NA, linewidth = 0.6),
      axis.text           = element_text(color = TEXT_LIGHT),
      axis.title          = element_text(color = TEXT_WHITE),
      axis.ticks          = element_line(color = TEXT_LIGHT),
      plot.title          = element_text(color = TEXT_WHITE, face = "bold"),
      plot.subtitle       = element_text(color = TEXT_LIGHT),
      plot.caption        = element_text(color = TEXT_LIGHT, size = base_size - 3),
      legend.background   = element_rect(fill = BG_DARK, color = NA),
      legend.key          = element_rect(fill = BG_DARK, color = NA),
      legend.text         = element_text(color = TEXT_LIGHT),
      legend.title        = element_text(color = TEXT_WHITE),
      legend.position     = "bottom",
      strip.background    = element_rect(fill = GRID_DARK, color = NA),
      strip.text          = element_text(color = TEXT_WHITE, face = "bold")
    )
}
theme_set(theme_dark_dampoostle())

cat("\n=== r_did_ring: ring estimator for spatial DiD ===\n")
cat("R version: ", R.version.string, "\n", sep = "")
cat("Working directory: ", getwd(), "\n", sep = "")



# ============================================================================
# Section 1. The intuition -- when does *distance* identify a treatment effect?
# ----------------------------------------------------------------------------
# WHAT   We draw a picture: one treatment point, an inner "treated" ring, an
#        outer "control" ring, and a cloud of random units (think: houses).
# WHY    Before the math, students need to see the geometry. The ring
#        approach trades the usual treated/control split for a near/far split
#        anchored on a point in space.
# HOW    Build the geometry with `sf`, sample points uniformly inside the
#        rectangle, classify by ring membership, plot.
# WATCH  The inner ring is small. The outer ring is the "donut" used as
#        control. Units outside both rings are dropped from the comparison.
# ============================================================================

set.seed(2021)  # reproduce the geometry exactly

# A square study area.
rectangle <- st_sf(
  id = 1,
  geometry = st_sfc(st_polygon(list(
    rbind(c(0, 0), c(1.5, 0), c(1.5, 1.5), c(0, 1.5), c(0, 0))
  )))
)

# The single treatment point (e.g., where the offender's address will be).
treat <- st_sf(id = 1, geometry = st_sfc(st_point(c(0.75, 0.75))))

# Treated ring: a disk of radius 0.2 around the treatment point.
treat_ring   <- st_buffer(treat, dist = 0.2)
# Control ring: the donut from radius 0.2 out to radius 0.5.
control_ring <- st_difference(st_buffer(treat, dist = 0.5), treat_ring)

# A random sample of 2,000 units (homes) in the square.
pts <- st_sf(id = 1:2000, geometry = st_sample(rectangle, 2000)) %>%
  mutate(group = case_when(
    st_within(., treat_ring,   sparse = FALSE) ~ "Treated (inner ring)",
    st_within(., control_ring, sparse = FALSE) ~ "Control (outer ring)",
    TRUE ~ "Not used"
  ))

cat("\n[Section 1] Toy spatial layout\n")
cat("  Total points: ", nrow(pts), "\n", sep = "")
print(table(pts$group))

p1 <- ggplot() +
  geom_sf(data = rectangle,    fill = NA, color = TEXT_LIGHT, linewidth = 0.4) +
  geom_sf(data = control_ring, fill = ORANGE, alpha = 0.10, color = ORANGE, linewidth = 0.6) +
  geom_sf(data = treat_ring,   fill = BLUE,   alpha = 0.15, color = BLUE,   linewidth = 0.6) +
  geom_sf(data = pts, aes(color = group, shape = group), size = 1.1, alpha = 0.85) +
  geom_sf(data = treat, color = TEAL, size = 4, shape = 17) +
  coord_sf(datum = NULL) +
  scale_color_manual(values = c(
    "Treated (inner ring)" = BLUE,
    "Control (outer ring)" = ORANGE,
    "Not used"             = GREY
  )) +
  scale_shape_manual(values = c(
    "Treated (inner ring)" = 19,
    "Control (outer ring)" = 17,
    "Not used"             = 4
  )) +
  labs(
    title    = "The ring approach: groups are defined by distance",
    subtitle = "Treatment is a point in space; comparison is near vs. far",
    color    = NULL, shape = NULL
  ) +
  theme(legend.position = "bottom")

ggsave(
  filename = "r_did_ring_01_ring_geometry.png",
  plot     = p1,
  width    = 8, height = 6, dpi = 300, bg = BG_DARK
)



# ============================================================================
# Section 2. Basic DiD recap -- the 2x2 building block
# ----------------------------------------------------------------------------
# WHAT   We refresh the classical 2x2 DiD on a tiny simulated panel with two
#        periods and a binary treatment indicator.
# WHY    The ring estimator inherits the identifying logic of 2x2 DiD; it is
#        worth re-deriving the formula in five lines before we generalize.
# HOW    Two random groups, a level shift in the treated group between t=0
#        and t=1, then `feols(delta_y ~ treat)` recovers the DiD coefficient.
# WATCH  The first-differences coefficient equals the DiD estimator
#        (Y_T1 - Y_T0) - (Y_C1 - Y_C0). No fancy machinery yet.
# ============================================================================

set.seed(42)
n_2x2  <- 500
true_te_2x2 <- 0.30

df_2x2 <- tibble(
  id    = rep(1:n_2x2, each = 2),
  t     = rep(c(0, 1), times = n_2x2),
  treat = rep(rbinom(n_2x2, 1, 0.5), each = 2)
) %>%
  group_by(id) %>%
  mutate(
    alpha   = rnorm(1, 0, 0.5),                # unit fixed effect
    eps     = rnorm(2, 0, 0.2),                # idiosyncratic noise
    trend   = 0.10 * t,                        # common time trend
    y       = 1 + alpha + trend + true_te_2x2 * treat * t + eps
  ) %>%
  ungroup()

# Two ways to estimate the same DiD coefficient.
# (a) First-differences: regress delta y on treatment indicator.
df_2x2_fd <- df_2x2 %>%
  arrange(id, t) %>%
  group_by(id) %>%
  summarise(delta_y = y[t == 1] - y[t == 0], treat = first(treat), .groups = "drop")

did_fd <- feols(delta_y ~ treat, data = df_2x2_fd)

# (b) Two-way fixed effects: id + t fixed effects, interaction is DiD.
df_2x2 <- df_2x2 %>% mutate(post_treat = treat * t)
did_twfe <- feols(y ~ post_treat | id + t, data = df_2x2)

cat("\n[Section 2] Classical 2x2 DiD (true effect = ", true_te_2x2, ")\n", sep = "")
cat("  (a) first-differences coefficient: ", round(coef(did_fd)["treat"], 3),
    " (SE ", round(se(did_fd)["treat"], 3), ")\n", sep = "")
cat("  (b) two-way FE coefficient       : ", round(coef(did_twfe)["post_treat"], 3),
    " (SE ", round(se(did_twfe)["post_treat"], 3), ")\n", sep = "")

# Both numbers should be close to 0.30. The ring estimator below is a
# distance-based version of the same idea.
write_csv(
  tibble(
    estimator = c("first_differences", "two_way_FE"),
    estimate  = c(coef(did_fd)["treat"], coef(did_twfe)["post_treat"]),
    se        = c(se(did_fd)["treat"],   se(did_twfe)["post_treat"]),
    true_te   = true_te_2x2
  ),
  "table_2x2_recap.csv"
)



# ============================================================================
# Section 3. The parametric ring estimator
# ----------------------------------------------------------------------------
# WHAT   We define a small inline function that runs the parametric ring DiD:
#        regress first-differenced outcomes on a categorical "which ring" with
#        the outer ring as the reference category. The coefficient on the
#        inner ring is the ring-DiD estimate.
# WHY    This is exactly the workhorse estimator used in the spatial-DiD
#        literature -- now in one self-contained function with comments you
#        can read line by line.
# HOW    Simulate a smooth treatment effect that decays with distance, then
#        apply the inline `parametric_ring_panel()`. Plot the implied step
#        function over distance.
# WATCH  Estimand: the *difference* between the change-in-outcome in the
#        treated ring and the change-in-outcome in the outer (control) ring.
#        The outer ring is the counterfactual.
# ============================================================================

# Inline definition -- equivalent in logic to
# references/helper-parametric_rings_estimator.R but rewritten with verbose
# comments and using only base R + data.table.
parametric_ring_panel <- function(y, dist, rings) {
  # y      : first-differenced outcome (one obs per unit, the post - pre change)
  # dist   : numeric distance to the treatment point
  # rings  : numeric vector of ring boundaries, e.g. c(0, 0.1, 0.3)
  #          -> treated ring = (0, 0.1], control ring = (0.1, 0.3]
  #          The OUTER-MOST ring is used as the reference (its coefficient is
  #          fixed at 0). Its mean change captures the counterfactual trend.

  df <- data.table::data.table(y = y, dist = dist)
  df <- df[dist <= max(rings) & dist >= min(rings), ]

  # Cut into ring categories using the supplied breaks.
  df[, rings := as.character(cut(dist, breaks = rings))]

  # Build the name of the reference (outer) ring; `feols(..., ref = ...)`
  # needs this as a string.
  last_ring <- as.character(glue::glue(
    "({rings[length(rings)-1]},{rings[length(rings)]}]"
  ))

  # The actual regression: change in y on ring dummies, with the outer ring
  # as the omitted category. Coefficient on each inner ring = mean change in
  # that ring MINUS the mean change in the outer ring (the DiD logic).
  est <- fixest::feols(y ~ i(rings, ref = last_ring), df)

  coefs <- coef(est, keep = "rings::.*")
  sdes  <- se(est,   keep = "rings::.*")

  # Convert coefficients into a tidy step-function representation for plotting.
  results <- purrr::map_df(seq_along(coefs), function(i) {
    interval <- stringr::str_match(names(coefs)[i], r"(rings::\((.*?),(.*?)\].*)")
    data.table::data.table(
      bin = i,
      x   = as.numeric(c(interval[2:3], interval[3])),
      tau = c(coefs[i], coefs[i], NA),
      se  = c(sdes[i],  sdes[i],  sdes[i])
    )
  })

  # Append the zero step for the outer (reference) ring.
  results <- rbind(results, data.table::data.table(
    bin = length(rings) - 1,
    x   = c(rings[length(rings) - 1], rings[length(rings)], rings[length(rings)]),
    tau = c(0, 0, NA),
    se  = c(0, 0, 0)
  ))

  results[, `:=`(
    ci_lower = tau - 1.96 * se,
    ci_upper = tau + 1.96 * se
  )]

  return(results)
}

# --- Simulated DGP with a smooth, distance-decaying treatment effect --------
# Mirrors the toy DGP in `references/figure-example_problems.R:80-103`. The
# treatment effect is a decaying exponential that dies out beyond 0.75 mi.
set.seed(20210708)
n_sim <- 10000

df_sim <- tibble(id = 1:n_sim) %>%
  mutate(
    dist    = runif(n(), 0, 1.5),
    te      = 1.5 * exp(-2.3 * dist) * (dist <= 0.75),
    counter = 0,                                          # counterfactual trend
    eps     = rnorm(n(), 0, 0.05),
    delta_y = te + counter + eps                           # observed change
  )

cat("\n[Section 3] Simulated DGP for the parametric ring estimator\n")
cat("  n units: ", n_sim, "\n", sep = "")
cat("  Average true TE among d <= 0.75 mi: ",
    round(mean(df_sim$te[df_sim$dist <= 0.75]), 3), "\n", sep = "")

# Plot the TRUE TE curve (what we are trying to recover).
df_truth <- df_sim %>%
  select(dist, `Treatment Effect` = te, `Counterfactual Trend` = counter) %>%
  pivot_longer(-dist) %>%
  # Insert a NA at the discontinuity at d = 0.75 so the line does not
  # cosmetically "drop" through it.
  bind_rows(tibble(dist = 0.75, name = "Treatment Effect", value = NA_real_)) %>%
  arrange(name, dist)

p2 <- ggplot(df_truth, aes(x = dist, y = value, color = name)) +
  geom_line(linewidth = 1.5) +
  scale_color_manual(values = c(
    "Counterfactual Trend" = TEXT_LIGHT,
    "Treatment Effect"     = ORANGE
  )) +
  labs(
    title    = "The data-generating process we will try to recover",
    subtitle = "True treatment effect decays smoothly with distance; vanishes at 0.75 mi",
    x = "Distance from treatment", y = "Change in outcome", color = NULL
  )

ggsave("r_did_ring_02_dgp_curve.png", p2,
       width = 8, height = 5, dpi = 300, bg = BG_DARK)

# --- Apply the parametric ring estimator with one *correct* ring choice ----
line_correct <- parametric_ring_panel(
  y     = df_sim$delta_y,
  dist  = df_sim$dist,
  rings = c(0, 0.75, 1.5)  # treated = (0, 0.75], control = (0.75, 1.5]
)

# Headline estimate from the inner-ring coefficient.
parametric_sim_estimate <- line_correct$tau[1]
parametric_sim_se       <- line_correct$se[1]

cat("  Parametric ring DiD (rings = 0, 0.75, 1.5):\n")
cat("    tau_hat = ", round(parametric_sim_estimate, 3),
    "  SE = ",     round(parametric_sim_se, 3),
    "  truth = ", round(mean(df_sim$te[df_sim$dist <= 0.75]), 3), "\n", sep = "")

p3 <- ggplot() +
  geom_hline(yintercept = 0, linetype = "dashed", color = GREY) +
  geom_ribbon(data = line_correct,
              aes(x = x, ymin = ci_lower, ymax = ci_upper),
              fill = BLUE, alpha = 0.25) +
  geom_line(data = line_correct,
            aes(x = x, y = tau), color = BLUE, linewidth = 1.2) +
  geom_line(data = df_truth %>% filter(name == "Treatment Effect"),
            aes(x = dist, y = value), color = ORANGE,
            linewidth = 1.0, linetype = "longdash") +
  annotate("text", x = 0.55, y = 1.0, label = "true TE",
           color = ORANGE, hjust = 0) +
  annotate("text", x = 0.40, y = parametric_sim_estimate + 0.05,
           label = "estimated tau (constant within ring)",
           color = BLUE, hjust = 0) +
  labs(
    title    = "Parametric ring DiD recovers a single number",
    subtitle = paste0("Inner ring (0, 0.75] gets one tau; outer ring (0.75, 1.5] anchors the counterfactual"),
    x = "Distance from treatment", y = "Estimated TE"
  )

# `tau = NA` break rows in the step-function data trigger benign
# `Removed N rows containing missing values` warnings -- suppress at render
# time so real warnings stay visible.
suppressWarnings(
  ggsave("r_did_ring_03_parametric_estimate.png", p3,
         width = 8, height = 5, dpi = 300, bg = BG_DARK)
)

write_csv(
  line_correct %>% as_tibble() %>% select(bin, x, tau, se, ci_lower, ci_upper),
  "table_parametric_sim.csv"
)



# ============================================================================
# Section 4. The problem -- ring choice is arbitrary
# ----------------------------------------------------------------------------
# WHAT   Re-run the parametric estimator on the same simulated data under
#        three different ring choices.
# WHY    In practice nobody knows the true treatment radius. If our headline
#        number wobbles with the cut points, the estimator is fragile.
# HOW    Three calls to `parametric_ring_panel()` with different `rings`
#        arguments; combine into a 1x3 patchwork.
# WATCH  Compare each panel's flat step to the dashed curve (the truth).
#        A too-narrow treated ring averages too few units; a too-wide ring
#        averages units with very different true effects.
# ============================================================================

ring_choices <- list(
  "Correct: (0, 0.75]"       = c(0, 0.75, 1.5),
  "Too narrow: (0, 0.30]"    = c(0, 0.30, 1.5),
  "Too wide:   (0, 1.20]"    = c(0, 1.20, 1.5)
)

ring_panels <- imap(ring_choices, function(rings, label) {
  est_line <- parametric_ring_panel(df_sim$delta_y, df_sim$dist, rings)
  tau_hat  <- est_line$tau[1]

  ggplot() +
    geom_hline(yintercept = 0, linetype = "dashed", color = GREY) +
    geom_ribbon(data = est_line,
                aes(x = x, ymin = ci_lower, ymax = ci_upper),
                fill = BLUE, alpha = 0.25) +
    geom_line(data = est_line,
              aes(x = x, y = tau), color = BLUE, linewidth = 1.2) +
    geom_line(data = df_truth %>% filter(name == "Treatment Effect"),
              aes(x = dist, y = value), color = ORANGE,
              linewidth = 0.9, linetype = "longdash") +
    coord_cartesian(xlim = c(0, 1.5), ylim = c(-0.1, 1.7)) +
    labs(
      title    = label,
      subtitle = paste0("tau_hat = ", sprintf("%.3f", tau_hat)),
      x = "Distance from treatment", y = "Estimated TE"
    )
})

p4 <- wrap_plots(ring_panels, nrow = 1) +
  plot_annotation(
    title    = "The headline number wobbles with the ring choice",
    subtitle = "Same data, three ring boundaries -- three different answers",
    theme    = theme(
      plot.title    = element_text(color = TEXT_WHITE, face = "bold"),
      plot.subtitle = element_text(color = TEXT_LIGHT),
      plot.background = element_rect(fill = BG_DARK, color = NA)
    )
  )

suppressWarnings(
  ggsave("r_did_ring_04_ringchoice_problem.png", p4,
         width = 12, height = 4.5, dpi = 300, bg = BG_DARK)
)

# Write a CSV that downstream skills can quote directly.
ringchoice_summary <- imap_dfr(ring_choices, function(rings, label) {
  est_line <- parametric_ring_panel(df_sim$delta_y, df_sim$dist, rings)
  tibble(
    choice   = label,
    tau_hat  = est_line$tau[1],
    se       = est_line$se[1],
    ci_lower = est_line$ci_lower[1],
    ci_upper = est_line$ci_upper[1]
  )
})

write_csv(ringchoice_summary, "table_ringchoice_sim.csv")

cat("\n[Section 4] Ring-choice sensitivity on simulated data\n")
print(ringchoice_summary)



# ============================================================================
# Section 5. The nonparametric ring estimator (binsreg)
# ----------------------------------------------------------------------------
# WHAT   Define an inline `nonparametric_ring_cs()` that recovers an entire
#        treatment-effect curve over distance, not a single number.
# WHY    A curve is the right object when treatment effects can vary with
#        distance. We no longer have to guess where the "treated" ring ends.
# HOW    Use binsreg (Cattaneo, Crump, Farrell, Feng) to partition distance
#        into adaptive bins, fit a 0th-degree polynomial inside each bin,
#        and use the right-most bin as the counterfactual baseline.
# WATCH  This is the paper's main contribution. The estimator is run twice
#        (pre and post) and the difference IS the spatial DiD curve.
# ============================================================================

# Inline definition -- equivalent in logic to
# references/helper-nonparametric_rings_estimator.R but with explanatory
# comments and a quiet wrapper around `binsreg::binsreg`.
nonparametric_ring_cs <- function(y, dist, post) {
  # y     : outcome (e.g., log_price) -- cross-sectional version
  # dist  : distance to treatment
  # post  : logical vector, TRUE = post-treatment observation
  #
  # The function fits binsreg separately to the pre and post samples,
  # subtracts (post - pre) to remove unit-invariant trends, and uses the
  # right-most bin as the counterfactual baseline so the curve is anchored
  # at zero where treatment effects are assumed to vanish.

  # binsreg draws plots to a graphics device by default; we capture them to
  # a null device so the function is silent inside our script.
  pdf(NULL)
  est <- binsreg::binsreg(
    y          = y,
    x          = dist,
    by         = as.logical(post),
    samebinsby = TRUE,
    line       = c(0, 0),  # 0-th degree polynomial, 0-th degree SE
    ci         = c(0, 0)
  )
  dev.off()

  # Pull the binned fits for pre and post, plus their CI half-widths.
  post_line <- data.table::as.data.table(est$data.plot$`Group TRUE`$data.line)
  post_line <- post_line[, .(x, bin, post_fit = fit)]
  pre_line  <- data.table::as.data.table(est$data.plot$`Group FALSE`$data.line)
  pre_line  <- pre_line[, .(x, bin, pre_fit = fit)]

  post_se <- data.table::as.data.table(est$data.plot$`Group TRUE`$data.ci)
  post_se <- post_se[, post_se := (ci.r - ci.l) / 2 / 1.96][, .(bin, post_se)]
  pre_se  <- data.table::as.data.table(est$data.plot$`Group FALSE`$data.ci)
  pre_se  <- pre_se [, pre_se  := (ci.r - ci.l) / 2 / 1.96][, .(bin, pre_se)]

  post_line <- merge(post_line, post_se, by = "bin")
  pre_line  <- merge(pre_line,  pre_se,  by = "bin")
  line      <- merge(pre_line, post_line, by = c("x", "bin"))

  # The DiD at each distance bin: difference of binned post and pre.
  line[, `:=`(
    tau = post_fit - pre_fit,
    se  = sqrt(pre_se^2 + post_se^2)
  )][, `:=`(
    ci_lower = tau - 1.96 * se,
    ci_upper = tau + 1.96 * se
  )]

  # Right-most bin is the counterfactual baseline; subtract it from
  # everything so the curve crosses zero where the data say it should.
  count_trend <- line[bin == max(bin) & !is.na(tau)][1, ]$tau
  line[, `:=`(
    tau      = tau      - count_trend,
    ci_lower = ci_lower - count_trend,
    ci_upper = ci_upper - count_trend
  )]
  line[bin == max(bin), `:=`(se = 0, ci_lower = 0, ci_upper = 0)]

  # Append an NA "break" row at the right endpoint for clean ggplot lines.
  line <- rbind(
    line[, .(bin, x, tau, se, ci_lower, ci_upper)],
    data.table::data.table(
      bin = max(line$bin), x = max(line$x),
      tau = NA_real_, se = 0, ci_lower = NA_real_, ci_upper = NA_real_
    )
  )

  # Subset to ring endpoints (this is what makes the plot look like a
  # step function rather than connecting bin midpoints).
  line <- line[, .SD[c(1, .N - 1, .N), ], by = bin]
  return(line[])
}

# --- Apply the nonparametric estimator to the simulated DGP ----------------
# To use the cross-sectional version, build a fake pre/post dataset by
# duplicating df_sim and re-randomizing the noise for "pre". This keeps the
# pedagogical thread (same DGP, both estimators) and is enough for the
# tutorial; the panel version in the helper file does an analogous job on
# first-differences.
set.seed(123)
df_sim_cs <- bind_rows(
  df_sim %>% mutate(
    post = FALSE,
    y_obs = 1 + counter + rnorm(n(), 0, 0.05)         # no treatment yet
  ),
  df_sim %>% mutate(
    post = TRUE,
    y_obs = 1 + counter + te + rnorm(n(), 0, 0.05)    # treatment + noise
  )
)

line_np_sim <- nonparametric_ring_cs(
  y    = df_sim_cs$y_obs,
  dist = df_sim_cs$dist,
  post = df_sim_cs$post
)

p5 <- ggplot() +
  geom_hline(yintercept = 0, linetype = "dashed", color = GREY) +
  geom_ribbon(data = line_np_sim,
              aes(x = x, ymin = ci_lower, ymax = ci_upper),
              fill = TEAL, alpha = 0.25) +
  geom_line(data = line_np_sim,
            aes(x = x, y = tau), color = TEAL, linewidth = 1.2) +
  geom_line(data = df_truth %>% filter(name == "Treatment Effect"),
            aes(x = dist, y = value), color = ORANGE,
            linewidth = 1.0, linetype = "longdash") +
  annotate("text", x = 0.55, y = 1.05, label = "true TE",
           color = ORANGE, hjust = 0) +
  annotate("text", x = 0.55, y = -0.25,
           label = "estimated TE curve (data-driven binning)",
           color = TEAL, hjust = 0) +
  labs(
    title    = "Nonparametric ring DiD recovers the WHOLE curve",
    subtitle = "Step function: one estimate per data-driven bin; teal ribbon = pointwise 95% CI",
    x = "Distance from treatment", y = "Estimated TE"
  )

suppressWarnings(
  ggsave("r_did_ring_05_nonparametric_sim.png", p5,
         width = 8, height = 5, dpi = 300, bg = BG_DARK)
)

write_csv(
  line_np_sim %>% as_tibble() %>% select(bin, x, tau, se, ci_lower, ci_upper),
  "table_nonparametric_sim.csv"
)

cat("\n[Section 5] Nonparametric ring estimator on simulated DGP\n")
cat("  Number of distance bins: ", length(unique(line_np_sim$bin)), "\n", sep = "")
cat("  TE estimate in left-most bin: ",
    round(line_np_sim$tau[1], 3), "\n", sep = "")



# ============================================================================
# Section 6. Application -- Linden & Rockoff (offender arrivals)
# ----------------------------------------------------------------------------
# WHAT   We apply both estimators to the data from Linden & Rockoff (2008):
#        North Carolina home sales near addresses where registered sex
#        offenders later moved in.
# WHY    The simulated DGP showed the mechanics. The real data show that the
#        problem -- and the value of the nonparametric estimator -- is not
#        academic. The headline number depends on where you draw the ring.
# HOW    Seven mini-steps (6.1 to 6.7). Each step prints a result and saves
#        a figure or table.
# WATCH  All sub-sections refer to homes within 3/10 mile of the offender's
#        future address. `close_offender` (1/0) flags homes within 1/10 mile.
#        `post_move` (1/0) flags sales that took place after the offender
#        moved in.
# ============================================================================

# --- 6.1 The natural experiment ---------------------------------------------
# Setting (Linden & Rockoff 2008): the North Carolina Sex Offender Registry
# publishes the address where each offender will live. After publication, the
# address becomes a publicly known point in space. Home sales close to that
# address after publication may transact at a discount relative to homes
# close to the address before publication. Sales slightly further away (still
# in the same neighborhood) act as a within-neighborhood control.
#
# Estimand: the average treatment effect on the treated unit-distance bin --
# the difference in log-price changes for homes within (0, 0.1] mile vs.
# homes within (0.1, 0.3] mile of the offender's address.
#
# Why this is plausibly identifying: the offender's *exact* address is
# essentially random within the small neighborhood (the same school district,
# the same housing stock, the same amenities). Comparing inner-ring sales to
# outer-ring sales nets out neighborhood-level shocks; comparing post to pre
# nets out time trends.

# --- 6.2 Load and inventory the data ----------------------------------------
DATA_URL <- paste0(
  "https://raw.githubusercontent.com/cmg777/starter-academic-v501/",
  "master/content/post/r_did_ring/linden_rockoff.dta"
)
LOCAL_DATA <- "linden_rockoff.dta"

raw <- tryCatch(
  haven::read_dta(DATA_URL),
  error = function(e) {
    message("URL load failed; falling back to local file: ", LOCAL_DATA)
    haven::read_dta(LOCAL_DATA)
  }
)

cat("\n[Section 6.2] Linden-Rockoff data\n")
cat("  Rows: ", nrow(raw), "  Cols: ", ncol(raw), "\n", sep = "")

# Build the analysis sample exactly as in references/analysis-linden_rockoff.R.
df <- raw %>%
  filter(offender == 1) %>%
  mutate(
    distance     = distance / 3,                  # rescale to miles
    dist_post    = distance * 10 * close_post_move,
    post         = ifelse(post_move == 1, "Post", "Pre"),
    srn_year     = paste(srn, sale_year, sep = "-"),
    offdays      = as.numeric(sale_date - offender_address_date)
  )

cat("  Analysis sample (offender == 1): ", nrow(df), "\n", sep = "")
cat("  Mean log price: ", round(mean(df$log_price, na.rm = TRUE), 3), "\n", sep = "")
cat("  Distance summary (miles): ",
    "min ", round(min(df$distance), 3),
    "  median ", round(median(df$distance), 3),
    "  max ", round(max(df$distance), 3), "\n", sep = "")

# Cell counts for the 2x2 inner/outer x pre/post comparison.
cells <- df %>%
  mutate(
    ring = ifelse(distance <= 0.1, "Inner (<=0.1 mi)", "Outer (0.1-0.3 mi)"),
    period = ifelse(post_move == 1, "Post-arrival", "Pre-arrival")
  ) %>%
  count(ring, period) %>%
  pivot_wider(names_from = period, values_from = n, values_fill = 0)

cat("\n  Cell counts (ring x period):\n")
print(cells)

write_csv(raw,   "raw_data.csv")
write_csv(df,    "data_prepared.csv")
write_csv(cells, "table_lr_cells.csv")


# --- 6.3 Raw price gradient (descriptive picture, no estimator yet) ---------
# Use a local polynomial smoother to visualize average home price as a
# function of distance, separately for pre- and post-arrival sales within
# +/- 365 days of the offender's address date.
window <- df %>% filter(abs(offdays) <= 365)

bw_main <- 0.075
pre_curve <- with(window %>% filter(offdays <  0),
                  KernSmooth::locpoly(distance, amt_Price, bandwidth = bw_main))
post_curve <- with(window %>% filter(offdays >= 0),
                   KernSmooth::locpoly(distance, amt_Price, bandwidth = bw_main))

gradient_df <- bind_rows(
  tibble(x = pre_curve$x,  y = pre_curve$y,  period = "Pre-arrival sales"),
  tibble(x = post_curve$x, y = post_curve$y, period = "Post-arrival sales")
) %>% filter(x <= 0.5)

p6 <- ggplot(gradient_df, aes(x = x, y = y / 1000, color = period, linetype = period)) +
  geom_vline(xintercept = 0.1, linetype = "dotted", color = TEAL) +
  geom_line(linewidth = 1.3) +
  scale_color_manual(values = c(
    "Pre-arrival sales"  = BLUE,
    "Post-arrival sales" = ORANGE
  )) +
  scale_linetype_manual(values = c(
    "Pre-arrival sales"  = "solid",
    "Post-arrival sales" = "longdash"
  )) +
  scale_y_continuous(
    breaks = seq(120, 160, by = 10),
    labels = function(z) paste0("$", z, "K")
  ) +
  coord_cartesian(ylim = c(120, 160)) +
  annotate("text", x = 0.105, y = 158, label = "treated ring boundary (0.1 mi)",
           color = TEAL, hjust = 0) +
  labs(
    title    = "Home prices dip near the offender AFTER the arrival",
    subtitle = "Local-polynomial smoother (Epanechnikov, bw = 0.075), within 365 days of arrival",
    x = "Distance from offender (miles)",
    y = "Average sale price (thousands)",
    color = NULL, linetype = NULL
  )

ggsave("r_did_ring_06_lr_gradient.png", p6,
       width = 8, height = 5, dpi = 300, bg = BG_DARK)


# --- 6.4 Bandwidth fragility ------------------------------------------------
# Re-smooth at three bandwidths: 0.025, 0.075, 0.125. Use the same data set
# and the same axes so the eye can compare.
plot_bw <- function(bw) {
  pre_smooth <- with(window %>% filter(offdays <  0),
                     lpridge::lpepa(distance, amt_Price, bandwidth = bw))
  post_smooth <- with(window %>% filter(offdays >= 0),
                      lpridge::lpepa(distance, amt_Price, bandwidth = bw))

  df_smooth <- bind_rows(
    tibble(x = pre_smooth$x.out,  y = pre_smooth$est,  period = "Pre"),
    tibble(x = post_smooth$x.out, y = post_smooth$est, period = "Post")
  ) %>% filter(x <= 0.5)

  ggplot(df_smooth, aes(x = x, y = y / 1000, color = period, linetype = period)) +
    geom_vline(xintercept = 0.1, linetype = "dotted", color = TEAL) +
    geom_line(linewidth = 1.2) +
    scale_color_manual(values = c("Pre" = BLUE, "Post" = ORANGE)) +
    scale_linetype_manual(values = c("Pre" = "solid", "Post" = "longdash")) +
    scale_y_continuous(
      breaks = seq(120, 160, by = 10),
      labels = function(z) paste0("$", z, "K")
    ) +
    coord_cartesian(ylim = c(120, 160)) +
    labs(
      title = paste0("Bandwidth = ", bw),
      x = "Distance (miles)", y = NULL,
      color = NULL, linetype = NULL
    )
}

p_bw_small  <- plot_bw(0.025) + labs(y = "Average price ($K)")
p_bw_main   <- plot_bw(0.075)
p_bw_large  <- plot_bw(0.125)

# Strip y-axis from second and third panels so they line up cleanly.
strip_y <- theme(axis.text.y = element_blank(),
                 axis.ticks.y = element_blank(),
                 axis.title.y = element_blank())

p7 <- (p_bw_small + (p_bw_main + strip_y) + (p_bw_large + strip_y)) +
  plot_layout(guides = "collect") +
  plot_annotation(
    title    = "What you SEE depends on how much you smooth",
    subtitle = "Same data, three bandwidths -- the implied treated radius shifts",
    theme    = theme(
      plot.title    = element_text(color = TEXT_WHITE, face = "bold"),
      plot.subtitle = element_text(color = TEXT_LIGHT),
      plot.background = element_rect(fill = BG_DARK, color = NA)
    )
  ) &
  theme(legend.position = "bottom",
        plot.background = element_rect(fill = BG_DARK, color = NA))

ggsave("r_did_ring_07_lr_bandwidth.png", p7,
       width = 12, height = 5, dpi = 300, bg = BG_DARK)


# --- 6.5 Parametric ring DiD on the real data -------------------------------
# Recreate Table 3 column (5) of Butts (2023). The interaction term
# `close_post_move` IS the ring-DiD estimate: it is the differential change in
# log price for homes near the offender (<= 0.1 mi) after arrival, relative to
# homes between 0.1 and 0.3 mi. Identification: srn_year fixed effects absorb
# neighborhood-year shocks; SEs are clustered at the neighborhood level.
did_lr <- feols(
  log_price ~ close_offender + post_move + close_post_move | srn_year,
  data = df, cluster = "neighborhood"
)

coef_lr <- coef(did_lr)[["close_post_move"]]
se_lr   <- se(did_lr)[["close_post_move"]]

cat("\n[Section 6.5] Parametric ring DiD on Linden-Rockoff\n")
cat("  close_post_move coefficient: ", round(coef_lr, 4),
    "  SE = ", round(se_lr, 4), "\n", sep = "")
cat("  Interpreted as a percent change: ",
    round((exp(coef_lr) - 1) * 100, 2), "%\n", sep = "")

# Step function representation for plotting (one segment in each ring).
step_lr <- tibble(
  x         = c(0, 0.1, 0.1, 0.1, 0.3),
  diff      = c(coef_lr, coef_lr, NA, 0, 0),
  ci_lower  = c(coef_lr - 1.96 * se_lr, coef_lr - 1.96 * se_lr, NA, 0, 0),
  ci_upper  = c(coef_lr + 1.96 * se_lr, coef_lr + 1.96 * se_lr, NA, 0, 0)
)

p8 <- ggplot(step_lr) +
  geom_hline(yintercept = 0, linetype = "dashed", color = GREY) +
  geom_ribbon(aes(x = x, ymin = ci_lower, ymax = ci_upper),
              fill = BLUE, alpha = 0.25) +
  geom_line(aes(x = x, y = diff), color = BLUE, linewidth = 1.3) +
  geom_vline(xintercept = 0.1, linetype = "dotted", color = TEAL) +
  scale_y_continuous(labels = scales::percent_format(accuracy = 1)) +
  labs(
    title    = "Parametric ring DiD: one number for the whole inner ring",
    subtitle = paste0(
      "tau_hat = ", sprintf("%.3f", coef_lr),
      " (", sprintf("%.1f%%", (exp(coef_lr) - 1) * 100), ")",
      "   SE = ", sprintf("%.3f", se_lr)
    ),
    x = "Distance from offender (miles)",
    y = "Change in log(price) (relative to outer ring)"
  )

suppressWarnings(
  ggsave("r_did_ring_08_lr_parametric.png", p8,
         width = 8, height = 4, dpi = 300, bg = BG_DARK)
)

write_csv(
  tibble(
    estimator = "parametric_ring_default",
    inner = "[0, 0.1]", outer = "(0.1, 0.3]",
    att_log = coef_lr, att_pct = (exp(coef_lr) - 1) * 100,
    se = se_lr,
    ci_lower = coef_lr - 1.96 * se_lr,
    ci_upper = coef_lr + 1.96 * se_lr,
    n = nobs(did_lr)
  ),
  "table_lr_parametric.csv"
)


# --- 6.6 Ring-choice sensitivity on the real data ---------------------------
# Same regression specification, but redraw the "close" boundary at three
# different cut points: 0.05, 0.10 (default), and 0.15. Outer ring is fixed
# at 0.30 throughout.
run_one_ring <- function(cut_inner) {
  df_v <- df %>%
    mutate(
      close_offender_v  = as.numeric(distance <= cut_inner),
      close_post_move_v = close_offender_v * post_move
    )
  est <- feols(
    log_price ~ close_offender_v + post_move + close_post_move_v | srn_year,
    data = df_v %>% filter(distance <= 0.3), cluster = "neighborhood"
  )
  coef_v <- coef(est)[["close_post_move_v"]]
  se_v   <- se(est)[["close_post_move_v"]]
  tibble(
    cut_inner = cut_inner,
    att_log   = coef_v,
    att_pct   = (exp(coef_v) - 1) * 100,
    se        = se_v,
    ci_lower  = coef_v - 1.96 * se_v,
    ci_upper  = coef_v + 1.96 * se_v,
    n         = nobs(est)
  )
}

ringchoice_lr <- map_dfr(c(0.05, 0.10, 0.15), run_one_ring)

cat("\n[Section 6.6] Ring-choice sensitivity (Linden-Rockoff)\n")
print(ringchoice_lr)
write_csv(ringchoice_lr, "table_lr_ringchoice.csv")

# Plot three panels side by side.
plot_one_ring <- function(row) {
  step <- tibble(
    x        = c(0, row$cut_inner, row$cut_inner, row$cut_inner, 0.3),
    diff     = c(row$att_log, row$att_log, NA, 0, 0),
    ci_lower = c(row$ci_lower, row$ci_lower, NA, 0, 0),
    ci_upper = c(row$ci_upper, row$ci_upper, NA, 0, 0)
  )
  ggplot(step) +
    geom_hline(yintercept = 0, linetype = "dashed", color = GREY) +
    geom_ribbon(aes(x = x, ymin = ci_lower, ymax = ci_upper),
                fill = BLUE, alpha = 0.25) +
    geom_line(aes(x = x, y = diff), color = BLUE, linewidth = 1.3) +
    geom_vline(xintercept = row$cut_inner, linetype = "dotted", color = TEAL) +
    coord_cartesian(xlim = c(0, 0.3), ylim = c(-0.30, 0.10)) +
    scale_y_continuous(labels = scales::percent_format(accuracy = 1)) +
    labs(
      title    = paste0("Inner ring = (0, ", row$cut_inner, "]"),
      subtitle = paste0(
        "tau = ", sprintf("%.3f", row$att_log),
        "  (", sprintf("%.1f%%", row$att_pct), ")",
        "  SE = ", sprintf("%.3f", row$se)
      ),
      x = "Distance from offender (miles)", y = NULL
    )
}

rings_plots <- map(seq_len(nrow(ringchoice_lr)),
                   ~ plot_one_ring(ringchoice_lr[.x, ]))

# Restore y-axis on the first panel only.
rings_plots[[1]] <- rings_plots[[1]] + labs(y = "Change in log(price)")
rings_plots[[2]] <- rings_plots[[2]] + strip_y
rings_plots[[3]] <- rings_plots[[3]] + strip_y

p9 <- wrap_plots(rings_plots, nrow = 1) +
  plot_annotation(
    title    = "Same data, three ring choices -- three different answers",
    subtitle = "Real Linden-Rockoff sample; outer ring fixed at 0.30 mi",
    theme    = theme(
      plot.title    = element_text(color = TEXT_WHITE, face = "bold"),
      plot.subtitle = element_text(color = TEXT_LIGHT),
      plot.background = element_rect(fill = BG_DARK, color = NA)
    )
  ) &
  theme(plot.background = element_rect(fill = BG_DARK, color = NA))

suppressWarnings(
  ggsave("r_did_ring_09_lr_ringchoice.png", p9,
         width = 12, height = 5, dpi = 300, bg = BG_DARK)
)


# --- 6.7 Nonparametric ring: the treatment-effect curve ---------------------
# Restrict to homes within 0.3 mi and apply the inline nonparametric
# estimator. The output IS a treatment-effect curve over distance; the right-
# most bin is normalized to zero (the implicit counterfactual baseline).
df_short <- df %>% filter(distance <= 0.3)

line_np_lr <- nonparametric_ring_cs(
  y    = df_short$log_price,
  dist = df_short$distance,
  post = (df_short$post_move == 1)
)

# Headline number: sample-weighted ATT for homes inside 0.1 mi.
# We average tau across OBSERVATIONS, not across bins. This matters because
# binsreg uses data-driven (non-equal-width) bins -- a row-average over the
# step function gives equal weight to every bin and can drift from the
# population-relevant ATT when bin sizes vary with distance.
bin_summary <- as_tibble(line_np_lr) %>%
  filter(!is.na(tau)) %>%
  group_by(bin) %>%
  summarise(
    x_left  = min(x),
    x_right = max(x),
    tau     = first(tau),
    .groups = "drop"
  ) %>%
  arrange(x_left)

inner_np <- df_short %>%
  filter(distance <= 0.1) %>%
  mutate(bin_idx = findInterval(distance, bin_summary$x_left,
                                all.inside = TRUE)) %>%
  left_join(bin_summary %>% mutate(bin_idx = row_number()) %>%
              select(bin_idx, tau_bin = tau),
            by = "bin_idx") %>%
  summarise(att_log = mean(tau_bin, na.rm = TRUE)) %>%
  pull(att_log)

cat("\n[Section 6.7] Nonparametric ring on Linden-Rockoff\n")
cat("  Number of distance bins: ", length(unique(line_np_lr$bin)), "\n", sep = "")
cat("  Estimated TE averaged inside d <= 0.1 mi: ",
    round(inner_np, 3),
    "  (", round((exp(inner_np) - 1) * 100, 1), "%)\n", sep = "")

p10 <- ggplot() +
  geom_hline(yintercept = 0, linetype = "dashed", color = GREY) +
  geom_ribbon(data = line_np_lr,
              aes(x = x, ymin = ci_lower, ymax = ci_upper),
              fill = TEAL, alpha = 0.25) +
  geom_line(data = line_np_lr,
            aes(x = x, y = tau), color = TEAL, linewidth = 1.3) +
  geom_vline(xintercept = 0.1, linetype = "dotted", color = ORANGE) +
  annotate("text", x = 0.105, y = 0.25,
           label = "default treated-ring boundary",
           color = ORANGE, hjust = 0) +
  scale_y_continuous(labels = scales::percent_format(accuracy = 1)) +
  coord_cartesian(ylim = c(-0.35, 0.30)) +
  labs(
    title    = "Nonparametric ring DiD recovers a whole curve",
    subtitle = paste0(
      "Step function across data-driven bins; ribbon = pointwise 95% CI. ",
      "Avg TE inside 0.1 mi = ", sprintf("%.1f%%", (exp(inner_np) - 1) * 100)
    ),
    x = "Distance from offender (miles)",
    y = "Change in log(price)"
  )

suppressWarnings(
  ggsave("r_did_ring_10_lr_nonparametric.png", p10,
         width = 8, height = 5, dpi = 300, bg = BG_DARK)
)

write_csv(
  line_np_lr %>% as_tibble() %>% select(bin, x, tau, se, ci_lower, ci_upper),
  "table_lr_nonparametric.csv"
)



# ============================================================================
# Section 7. Summary -- headline numbers across estimators
# ----------------------------------------------------------------------------
# WHAT   Stack the three estimators (parametric default, ring-choice
#        sensitivity range, nonparametric) into a single summary table.
# WHY    This is the table the blog post and the infographic will quote.
# HOW    Convert log-price changes to percent for human readability.
# WATCH  All three estimators speak to the same estimand (ATT on homes within
#        0.1 mi after arrival), but they differ in the assumptions they make
#        about treatment effects beyond 0.1 mi.
# ============================================================================

summary_tbl <- bind_rows(
  tibble(
    estimator = "parametric_ring_default",
    inner = "[0, 0.1]", outer = "(0.1, 0.3]",
    att_log = coef_lr,
    att_pct = (exp(coef_lr) - 1) * 100,
    se = se_lr,
    ci_lower = coef_lr - 1.96 * se_lr,
    ci_upper = coef_lr + 1.96 * se_lr,
    n_obs = nobs(did_lr)
  ),
  ringchoice_lr %>% transmute(
    estimator = paste0("parametric_ring_inner_", cut_inner),
    inner = paste0("[0, ", cut_inner, "]"), outer = "(cut, 0.3]",
    att_log, att_pct, se, ci_lower, ci_upper,
    n_obs = n
  ),
  tibble(
    estimator = "nonparametric_ring_avg_inside_0.1",
    inner = "[0, 0.1] (avg of curve)", outer = "(0.1, 0.3] (data-driven)",
    att_log = inner_np,
    att_pct = (exp(inner_np) - 1) * 100,
    se = NA_real_,
    ci_lower = NA_real_,
    ci_upper = NA_real_,
    n_obs = nrow(df_short)
  )
)

cat("\n[Section 7] Headline summary\n")
print(summary_tbl)

write_csv(summary_tbl, "summary.csv")



# ============================================================================
# Clean-up
# ============================================================================
# R's `pdf(NULL)` inside the binsreg helper plus base ggsave can sometimes
# leave a stray Rplots.pdf. Remove it if present.
if (file.exists("Rplots.pdf")) file.remove("Rplots.pdf")

cat("\n=== Script completed successfully ===\n")
