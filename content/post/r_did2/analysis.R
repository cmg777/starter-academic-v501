# ============================================================================
# analysis.R                                                                  #
#                                                                             #
# A Streamlined Introduction to Difference-in-Differences for Regional Data   #
#                                                                             #
# AUDIENCE                                                                    #
#   You have heard of "Difference-in-Differences" (DiD) and you work with     #
#   data on regions (counties, states, provinces, prefectures, districts).    #
#   You may have never used the `did` or `DRDID` packages before. The script  #
#   walks you through the full modern DiD pipeline in eleven short sections.  #
#                                                                             #
# THE BIG IDEA                                                                #
#   When the units of analysis are regions of very different sizes, the       #
#   choice of weights does NOT just change the precision of an estimate --    #
#   it changes the *target parameter*. Equal weights give you the average    #
#   effect across the typical TREATED REGION. Population weights give you   #
#   the average effect on the region where the typical TREATED PERSON lives. #
#   The two answers can disagree -- sometimes dramatically.                   #
#                                                                             #
# THE RUNNING EXAMPLE                                                         #
#   Source: Baker, Callaway, Cunningham, Goodman-Bacon & Sant'Anna (2024)     #
#   "Difference-in-Differences Designs: A Practitioner's Guide".              #
#   Question: Did the Affordable Care Act's Medicaid expansion reduce the    #
#   adult mortality rate (deaths per 100,000 adults aged 20-64)?              #
#   Data: 2,604 US counties x 11 years (2009-2019). States that opted into    #
#   the expansion did so in different years (mostly 2014, some later, some    #
#   never).                                                                   #
#                                                                             #
# WHAT YOU WILL SEE                                                           #
#   At every step we report the population-weighted answer next to the        #
#   unweighted answer. The post's headline result is a SIGN REVERSAL in the   #
#   simplest 2x2 comparison: unweighted DiD ~ +0.1 deaths / 100,000           #
#   (suggesting Medicaid did nothing or even raised mortality) vs.            #
#   weighted DiD ~ -2.6 (suggesting it saved lives). Neither weighting is     #
#   "wrong"; they answer different policy questions.                          #
#                                                                             #
# PIPELINE OUTPUTS                                                            #
#   * analysis.R  -- this file (also serves as the post's outline)            #
#   * execution_log.txt  -- captured stdout/stderr from running the script    #
#   * r_did2_01_*.png ... r_did2_08_*.png  -- eight figures, dark theme       #
#   * raw_data.csv, data_prepared.csv  -- inputs and analysis panel           #
#   * table_*.csv x 9  -- every numerical result, ready for the post          #
#   * summary.csv  -- the unweighted-vs-weighted headline summary             #
#   * README.md  -- artifact inventory for downstream skills                  #
# ============================================================================


# ============================================================================
# Section 0. Setup
# ----------------------------------------------------------------------------
# WHAT   We load packages, set a reproducibility seed, define the site's dark
#        color palette, and register a ggplot theme.
# WHY    Reproducibility (same seed -> same answers) and consistent visuals
#        across all eight figures.
# HOW    `pacman::p_load()` installs anything missing from CRAN before loading.
# WATCH  Nothing user-facing yet; just confirm the script reports its R version.
# ============================================================================

set.seed(42)

if (!require("pacman")) install.packages("pacman", repos = "https://cloud.r-project.org")
pacman::p_load(
  tidyverse,    # data manipulation + ggplot
  fixest,       # fast fixed-effects regression (`feols`, `feglm`)
  did,          # Callaway & Sant'Anna group-time ATT(g,t) estimator
  DRDID,        # the doubly-robust DiD engine used inside `did`
  HonestDiD,    # Rambachan-Roth sensitivity analysis
  broom,        # tidy regression output
  scales,       # nice axis labels
  here          # filepath helper (project root anchored)
)

options(knitr.kable.NA = "", dplyr.summarise.inform = FALSE)

# Number of bootstrap replicates inside every `did::att_gt()` call. We keep it
# at 2000 for fast iteration -- enough to give stable standard errors at the
# tutorial level. The manuscript uses 25,000; raise this for a production run.
BITERS <- 2000

# --- Dark-theme palette ------------------------------------------------------
# Site-wide palette for carlos-mendez.org "dark theme" posts. Kept as named
# constants so any color edit happens in one place.
BG_DARK    <- "#0f1729"   # plot + panel background
GRID_DARK  <- "#1f2b5e"   # gridlines (subtle on dark bg)
TEXT_LIGHT <- "#c8d0e0"   # axis text, tick labels
TEXT_WHITE <- "#e8ecf2"   # titles, bold annotations
# Site accent colors -- used to color the two weighting regimes consistently.
BLUE   <- "#6a9bcc"       # UNWEIGHTED series  (steel blue)
ORANGE <- "#d97757"       # POPULATION-WEIGHTED series (warm orange)
TEAL   <- "#00d4c8"       # highlights, annotations
BLACK  <- "#141413"

# A custom ggplot theme. Once you register it with `theme_set()`, every
# subsequent ggplot inherits the dark background and light text.
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

cat("\n=== r_did2: DiD for regional data (R ",
    as.character(getRversion()), ") ===\n", sep = "")


# ============================================================================
# Section 1. Load the raw data
# ----------------------------------------------------------------------------
# WHAT   We read the CDC county-mortality file that ships in `reference/data/`.
# WHY    A "raw_data.csv" copy of the input is exported so a reader can
#        re-run the script without descending into the reference folder.
# HOW    `read_csv()` from `readr` (loaded via `tidyverse`).
# WATCH  Console shows the row x column count of the raw panel.
# ============================================================================

DATA_URL <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_did2/reference/data/county_mortality_data.csv"
df_raw <- read_csv(DATA_URL, show_col_types = FALSE, na = c("", "NA"))
cat(sprintf("Loaded %d rows x %d cols from %s\n",
            nrow(df_raw), ncol(df_raw), basename(DATA_URL)))
write_csv(df_raw, "raw_data.csv")


# ============================================================================
# Section 2. Prepare the analysis panel
# ----------------------------------------------------------------------------
# WHAT   We clean the panel, build the population weight, and assign each
#        county a treatment cohort. Cohort = the year its state expanded
#        Medicaid (or 0 if the state never expanded by 2019).
# WHY    The manuscript's analysis sample is 2,604 counties with full
#        2009-2019 mortality + full 2013-2014 covariates, minus a handful
#        of early-expanding states (DC, DE, MA, NY, VT) that lack a clean
#        comparison group.
# HOW    `dplyr` pipeline; we also build a *single* population weight
#        per county: `set_wt` = its 2013 adult population.
# WATCH  The console prints the cohort counts and population shares.
#        Note how the 2014 expansion cohort holds ~38% of counties but
#        ~46% of the adult population -- weights will matter.
#
# KEY VARIABLES (created here):
#   treat_year  cohort indicator: year of expansion, or 0 if never-treated.
#                The `did` package wants this convention (0 for controls).
#                MUST be *double*, not integer -- `did` internally writes
#                `Inf` for controls and that fails on an integer column.
#   set_wt      population weight = 2013 adult population in the county.
#                Constant within county over all 11 years.
#   Treat_2014  binary indicator: 1 if the state expanded in 2014, 0 if
#                never-treated. Used for the simple 2x2 in Sections 3-6.
#   Post        binary year indicator: 1 if year >= 2014.
# ============================================================================

covs <- c("perc_female", "perc_white", "perc_hispanic",
          "unemp_rate", "poverty_rate", "median_income")

df_prep <- df_raw %>%
  mutate(
    # Convert population counts into shares, scale the unemployment rate to
    # percentage points, and rescale income to thousands so the regression
    # coefficients are readable.
    state_abb     = str_sub(county, nchar(county) - 1, nchar(county)),
    perc_white    = population_20_64_white    / population_20_64 * 100,
    perc_hispanic = population_20_64_hispanic / population_20_64 * 100,
    perc_female   = population_20_64_female   / population_20_64 * 100,
    unemp_rate    = unemp_rate * 100,
    median_income = median_income / 1000,
    # `yaca` (year of ACA expansion) arrives as a string with "NA" sentinels;
    # convert to numeric. Counties whose state never expanded keep NA here.
    yaca          = suppressWarnings(as.numeric(yaca))
  ) %>%
  # Drop the early-expansion states (DC, DE, MA, NY, VT) -- they expanded
  # before 2014 so they cannot serve as either treated or control in our
  # 2014-centred design.
  filter(!(state_abb %in% c("DC", "DE", "MA", "NY", "VT"))) %>%
  select(state_abb, county, county_code, year, population_20_64, yaca,
         crude_rate_20_64, all_of(covs)) %>%
  # Keep counties that have full covariate data (only `yaca` may be missing).
  drop_na(!yaca) %>%
  group_by(county_code) %>%
  # Need both 2013 (pre) and 2014 (post) covariates for the 2x2 design.
  filter(sum(year %in% c(2013, 2014)) == 2) %>%
  # Need every year of mortality data, 2009-2019 inclusive (= 11 rows).
  filter(sum(!is.na(crude_rate_20_64)) == 11) %>%
  ungroup() %>%
  group_by(county_code) %>%
  # The population weight is fixed at its 2013 value -- it stays constant
  # across years so that weighting doesn't conflate weight changes with
  # outcome changes.
  mutate(set_wt = population_20_64[which(year == 2013)]) %>%
  ungroup() %>%
  mutate(
    # `treat_year` follows the `did` package convention:
    #   * a positive integer year if the county is in an expansion state
    #   * 0 if the county is in a never-expansion state
    # The value is a *double* on purpose (see WATCH note above).
    treat_year = if_else(!is.na(yaca) & yaca <= 2019, yaca, 0),
    Treat_2014 = if_else(!is.na(yaca) & yaca == 2014, 1L, 0L),
    Post       = if_else(year >= 2014, 1L, 0L)
  )

n_counties <- n_distinct(df_prep$county_code)
n_years    <- n_distinct(df_prep$year)
cat(sprintf("After cleaning: %d counties x %d years = %d county-year rows\n",
            n_counties, n_years, nrow(df_prep)))
cat("Treatment cohorts (treat_year):\n")
df_prep %>%
  distinct(county_code, treat_year) %>%
  count(treat_year, name = "n_counties") %>%
  print(n = Inf)
write_csv(df_prep, "data_prepared.csv")

# Adoption cohorts (manuscript Table 1) -- shows that the 2014 expansion
# group is the largest cohort, and that its share of the adult population
# differs from its share of counties.
cohort_tbl <- df_prep %>%
  filter(year == 2013) %>%
  group_by(treat_year) %>%
  summarise(
    n_counties = n(),
    n_states   = n_distinct(state_abb),
    pop_adult  = sum(population_20_64, na.rm = TRUE)
  ) %>%
  mutate(
    share_counties = scales::percent(n_counties / sum(n_counties), accuracy = 0.1),
    share_pop      = scales::percent(pop_adult  / sum(pop_adult),  accuracy = 0.1)
  )
cat("\nAdoption cohorts (2013 baseline):\n")
print(cohort_tbl)
write_csv(cohort_tbl, "table_adoption_cohorts.csv")


# ============================================================================
# Section 3. The headline 2x2 DiD -- four cell means
# ----------------------------------------------------------------------------
# WHAT   We compute the canonical "difference of two differences" using just
#        four numbers: mean mortality in (Expansion, Never-Expansion) x
#        (2013, 2014). Done twice: equal-weighted and population-weighted.
# WHY    This is the simplest DiD an applied researcher can write. It uses
#        only sample means and arithmetic -- no regression, no software
#        package. If the headline reversal does NOT appear here, every later
#        result is suspect.
# HOW    `weighted.mean()` for the four cells, then trends, then DiD.
# WATCH  Console will print BOTH 2x2 estimates. Expect:
#          * Unweighted DiD  ~ +0.1 deaths / 100,000  (no effect, or worse)
#          * Weighted   DiD  ~ -2.6 deaths / 100,000  (lives saved)
#        Figure 1 visualises both panels side-by-side.
#
# GLOSSARY
#   ATT(t)      Average Treatment effect on the Treated at time t, for the
#                weight scheme omega used in the expectation.
#   Parallel    The identifying assumption: untreated potential outcomes in
#   trends      treated counties would have moved in lock-step with those in
#                the never-treated counties had treatment not occurred.
# ============================================================================

# Sub-panel: only 2013 and 2014, only the 2014 expansion and never-expansion
# cohorts. `D = 1` for expansion-state counties, `D = 0` for controls.
short_data <- df_prep %>%
  filter(year %in% c(2013, 2014),
         (treat_year == 2014) | (treat_year == 0)) %>%
  mutate(D = Treat_2014)

# Helper: cell_means()
#   Inputs : d  = a data frame with columns `D`, `year`, `crude_rate_20_64`
#            wt = NULL for equal weights, or the name (as a string) of a
#                  weight column for weighted means.
#   Output : a long tibble with one row per (D, year) cell.
#   Why    : we call this twice (once for each weighting), so it pays to
#            wrap the logic in a function with one switch.
cell_means <- function(d, wt = NULL) {
  if (is.null(wt)) {
    d %>%
      group_by(D, year) %>%
      summarise(y = mean(crude_rate_20_64), .groups = "drop")
  } else {
    d %>%
      group_by(D, year) %>%
      summarise(y = weighted.mean(crude_rate_20_64, w = .data[[wt]]),
                .groups = "drop")
  }
}

cells_unw <- cell_means(short_data)              # 4 unweighted cell means
cells_wt  <- cell_means(short_data, wt = "set_wt")  # 4 population-weighted means

# Helper: att_2x2()
#   Inputs : `cells`, a 4-row tibble of cell means (T_pre, T_post, C_pre,
#            C_post). Output: a named list with the four cells, the two
#            within-group trends, and the DiD estimate (trend_T - trend_C).
att_2x2 <- function(cells) {
  T_pre  <- cells$y[cells$D == 1 & cells$year == 2013]  # treated, pre
  T_post <- cells$y[cells$D == 1 & cells$year == 2014]  # treated, post
  C_pre  <- cells$y[cells$D == 0 & cells$year == 2013]  # control, pre
  C_post <- cells$y[cells$D == 0 & cells$year == 2014]  # control, post
  list(
    T_pre   = T_pre,  T_post = T_post,
    C_pre   = C_pre,  C_post = C_post,
    trend_T = T_post - T_pre,    # change in mortality among expansion counties
    trend_C = C_post - C_pre,    # change in mortality among never-expanders
    att     = (T_post - T_pre) - (C_post - C_pre)  # the 2x2 DiD
  )
}
e_unw <- att_2x2(cells_unw)
e_wt  <- att_2x2(cells_wt)

cat(sprintf("Unweighted 2x2 ATT(2014) = %.3f\n", e_unw$att))
cat(sprintf("Weighted   2x2 ATT(2014) = %.3f\n", e_wt$att))

# Pack the cell means into a single table for the post.
cells_tbl <- tibble(
  row     = c("2013 (pre)", "2014 (post)", "Trend (post - pre)"),
  unw_T   = c(e_unw$T_pre, e_unw$T_post, e_unw$trend_T),
  unw_C   = c(e_unw$C_pre, e_unw$C_post, e_unw$trend_C),
  unw_gap = c(e_unw$T_pre - e_unw$C_pre,
              e_unw$T_post - e_unw$C_post,
              e_unw$att),
  wt_T    = c(e_wt$T_pre,  e_wt$T_post,  e_wt$trend_T),
  wt_C    = c(e_wt$C_pre,  e_wt$C_post,  e_wt$trend_C),
  wt_gap  = c(e_wt$T_pre - e_wt$C_pre,
              e_wt$T_post - e_wt$C_post,
              e_wt$att)
)
write_csv(cells_tbl, "table_2x2_means.csv")

# --- Figure 1: the headline 2x2 visual --------------------------------------
# Two side-by-side panels (Unweighted | Weighted). Each panel shows mortality
# in 2013 and 2014 for both groups. The DiD is the gap between the slopes.
fig1_df <- bind_rows(
  cells_unw %>% mutate(weighting = "Unweighted"),
  cells_wt  %>% mutate(weighting = "Population-weighted")
) %>%
  mutate(group = if_else(D == 1, "2014 Expansion counties",
                                 "Never-expansion counties"),
         weighting = factor(weighting,
                            levels = c("Unweighted", "Population-weighted")))

annot_df <- bind_rows(
  tibble(weighting = "Unweighted",          label = sprintf("DiD = %.2f", e_unw$att)),
  tibble(weighting = "Population-weighted", label = sprintf("DiD = %.2f", e_wt$att))
) %>%
  mutate(weighting = factor(weighting,
                            levels = c("Unweighted", "Population-weighted")),
         year = 2013.5, y = 460)

p1 <- ggplot(fig1_df, aes(x = year, y = y, color = group, group = group)) +
  geom_line(linewidth = 1.2) +
  geom_point(size = 3.2) +
  geom_text(data = annot_df,
            aes(x = year, y = y, label = label),
            inherit.aes = FALSE,
            color = TEAL, fontface = "bold", size = 5) +
  scale_color_manual(values = c("2014 Expansion counties"  = ORANGE,
                                "Never-expansion counties" = BLUE),
                     name = NULL) +
  scale_x_continuous(breaks = c(2013, 2014)) +
  facet_wrap(~ weighting) +
  labs(title    = "The 2x2 DiD flips sign when you use population weights",
       subtitle = "Mortality (per 100,000 adults aged 20-64): 2014 expanders vs never-expanders",
       x = NULL, y = "Mortality rate",
       caption  = "Source: CDC county mortality 2013-2014; population weight = county adult pop in 2013.")
ggsave("r_did2_01_headline_2x2.png", p1, width = 10, height = 5.5, dpi = 300, bg = BG_DARK)


# ============================================================================
# Section 4. The same 2x2, written as a regression
# ----------------------------------------------------------------------------
# WHAT   Three equivalent ways to recover the 2x2 DiD by regression, each
#        run twice (unweighted and weighted), for a total of six models.
# WHY    Most applied researchers reach for a regression, not cell means.
#        Seeing the three equivalent forms removes mystery from "Two-Way
#        Fixed Effects" (TWFE) and makes clear that the *only* substantive
#        choice in the 2x2 case is the weighting -- not the specification.
# HOW    `fixest::feols()` with cluster-robust SEs at the county level.
# WATCH  All three unweighted models recover the same +0.1 estimate; all
#        three weighted models recover the same -2.6. The CI tells you
#        which one rejects the null.
#
# THE THREE SPECIFICATIONS
#   Levels:           y ~ D * Post                (interaction = DiD)
#   Two-way FE:       y ~ D:Post | county + year  (FE absorb intercepts)
#   Long difference:  (y_2014 - y_2013) ~ D       (collapsed to 1 row/county)
# ============================================================================

# Collapsed long-difference dataset: one row per county; outcome is the
# 2014 - 2013 change in mortality.
short_long_diff <- short_data %>%
  group_by(county_code) %>%
  summarise(state_abb = first(state_abb),
            set_wt    = mean(set_wt),
            diff      = crude_rate_20_64[which(year == 2014)] -
                        crude_rate_20_64[which(year == 2013)],
            D         = mean(D),
            .groups   = "drop")

# Six regressions: three specifications x two weighting choices.
# Self-documenting names make the rest of the script easier to follow.
twfe_levels_unw <- feols(crude_rate_20_64 ~ D * Post,
                          data = short_data, cluster = ~county_code)
twfe_fe_unw     <- feols(crude_rate_20_64 ~ D:Post | county_code + year,
                          data = short_data, cluster = ~county_code)
twfe_long_unw   <- feols(diff ~ D,
                          data = short_long_diff, cluster = ~county_code)
twfe_levels_wt  <- feols(crude_rate_20_64 ~ D * Post,
                          data = short_data, weights = ~set_wt,
                          cluster = ~county_code)
twfe_fe_wt      <- feols(crude_rate_20_64 ~ D:Post | county_code + year,
                          data = short_data, weights = ~set_wt,
                          cluster = ~county_code)
twfe_long_wt    <- feols(diff ~ D,
                          data = short_long_diff, weights = ~set_wt,
                          cluster = ~county_code)

# Helper: extract_did()
#   Pulls out the DiD coefficient from a `feols` model, robustly across the
#   three specifications. In the levels and FE specs the coefficient name is
#   "D:Post"; in the long-difference spec there is no `:Post` term so the
#   DiD lives in the coefficient named "D" itself.
extract_did <- function(m, label, weighting) {
  co <- coef(m); se <- se(m)
  did_name <- if ("D:Post" %in% names(co)) "D:Post" else "D"
  tibble(spec = label, weighting = weighting,
         est  = unname(co[did_name]),
         se   = unname(se[did_name]),
         lo95 = est - 1.96 * se, hi95 = est + 1.96 * se)
}

twfe_tbl <- bind_rows(
  extract_did(twfe_levels_unw, "Levels (D:Post)",     "Unweighted"),
  extract_did(twfe_fe_unw,     "Two-way FE (D:Post)", "Unweighted"),
  extract_did(twfe_long_unw,   "Long difference",     "Unweighted"),
  extract_did(twfe_levels_wt,  "Levels (D:Post)",     "Population-weighted"),
  extract_did(twfe_fe_wt,      "Two-way FE (D:Post)", "Population-weighted"),
  extract_did(twfe_long_wt,    "Long difference",     "Population-weighted")
)
cat("2x2 TWFE estimates:\n"); print(twfe_tbl)
write_csv(twfe_tbl, "table_2x2_twfe.csv")

twfe_tbl <- twfe_tbl %>%
  mutate(spec      = factor(spec, levels = c("Levels (D:Post)",
                                              "Two-way FE (D:Post)",
                                              "Long difference")),
         weighting = factor(weighting,
                            levels = c("Unweighted", "Population-weighted")))

# Figure 2: coefficient plot of the six DiD estimates.
p2 <- ggplot(twfe_tbl, aes(x = est, y = spec, color = weighting)) +
  geom_vline(xintercept = 0, color = TEXT_LIGHT, linetype = "dashed") +
  geom_errorbar(aes(xmin = lo95, xmax = hi95), width = 0.18, linewidth = 0.9,
                orientation = "y",
                position = position_dodge(width = 0.55)) +
  geom_point(size = 3.4, position = position_dodge(width = 0.55)) +
  scale_color_manual(values = c("Unweighted" = BLUE,
                                "Population-weighted" = ORANGE),
                     name = NULL) +
  labs(title    = "Three TWFE specifications, two weighting choices",
       subtitle = "Each specification recovers the same 2x2 estimand; only the weight matters",
       x = "DiD coefficient (deaths per 100,000)", y = NULL)
ggsave("r_did2_02_twfe_2x2.png", p2, width = 10, height = 5.5, dpi = 300, bg = BG_DARK)


# ============================================================================
# Section 5. Covariate balance + propensity scores
# ----------------------------------------------------------------------------
# WHAT   Compare expansion vs non-expansion counties on six demographic /
#        economic covariates, and fit a logit model for "P(expansion | X)".
# WHY    Parallel trends is easier to defend if treated and control groups
#        look similar at baseline. The normalized differences flag covariates
#        that are far apart. The propensity score quantifies how predictable
#        treatment is from the covariates.
# HOW    Normalized difference = (mean_T - mean_C) / sqrt((var_T + var_C)/2).
#        Logit = `fixest::feglm(family = "binomial")` with hetero-robust SEs.
# WATCH  Population-weighted normalized differences are LARGER than the
#        unweighted ones for income and unemployment -- a few large counties
#        (e.g., LA County) drive the weighted comparison.
# ============================================================================

# Helper: wtd_var()
#   Base R's `var()` ignores weights. We need a weighted variance for the
#   normalized-difference balance table when we apply population weights.
#   This is the population (not sample) formula, divided by sum(w) - 1 so it
#   behaves analogously to base R's `var()`.
wtd_var <- function(x, w) {
  ok <- !is.na(x + w); x <- x[ok]; w <- w[ok]
  xbar <- weighted.mean(x, w)
  sum(w * (x - xbar)^2) / (sum(w) - 1)
}

# Unweighted balance table at 2013 baseline.
balance_unw <- short_data %>% filter(year == 2013) %>%
  pivot_longer(all_of(covs), names_to = "variable", values_to = "value") %>%
  group_by(variable, D) %>%
  summarise(mean = mean(value), var = var(value), .groups = "drop") %>%
  pivot_wider(names_from = D, values_from = c(mean, var)) %>%
  mutate(weighting = "Unweighted",
         norm_diff = (mean_1 - mean_0) / sqrt((var_1 + var_0) / 2))

# Population-weighted balance table at 2013 baseline.
balance_wt <- short_data %>% filter(year == 2013) %>%
  pivot_longer(all_of(covs), names_to = "variable", values_to = "value") %>%
  group_by(variable, D) %>%
  summarise(mean = weighted.mean(value, set_wt),
            var  = wtd_var(value, set_wt), .groups = "drop") %>%
  pivot_wider(names_from = D, values_from = c(mean, var)) %>%
  mutate(weighting = "Population-weighted",
         norm_diff = (mean_1 - mean_0) / sqrt((var_1 + var_0) / 2))

balance_tbl <- bind_rows(balance_unw, balance_wt) %>%
  select(weighting, variable, mean_C = mean_0, mean_T = mean_1, norm_diff)
cat("Covariate balance (2013):\n"); print(balance_tbl)
write_csv(balance_tbl, "table_covariate_balance.csv")

# Propensity-score logits, unweighted and weighted.
ps_form <- as.formula(paste("D ~", paste(covs, collapse = " + ")))
ps_unw  <- feglm(ps_form, data = short_data %>% filter(year == 2013),
                 family = "binomial", vcov = "hetero")
ps_wt   <- feglm(ps_form, data = short_data %>% filter(year == 2013),
                 family = "binomial", vcov = "hetero", weights = ~set_wt)

ps_tbl <- bind_rows(
  tidy(ps_unw) %>% mutate(weighting = "Unweighted"),
  tidy(ps_wt)  %>% mutate(weighting = "Population-weighted")
) %>% relocate(weighting)
cat("Propensity-score logits:\n"); print(ps_tbl)
write_csv(ps_tbl, "table_propensity_models.csv")

# Figure 3: propensity-score density by expansion status, faceted by weighting.
# Good overlap (densities cover the same support) means the IPW estimator
# in the next section has reliable weights.
ps_plot_df <- bind_rows(
  short_data %>% filter(year == 2013) %>%
    mutate(p = predict(ps_unw, ., type = "response"),
           wt_use = 1, weighting = "Unweighted"),
  short_data %>% filter(year == 2013) %>%
    mutate(p = predict(ps_wt, ., type = "response"),
           wt_use = set_wt, weighting = "Population-weighted")
) %>%
  mutate(group = if_else(D == 1, "Expansion", "Non-expansion"),
         weighting = factor(weighting,
                            levels = c("Unweighted", "Population-weighted")))

p3 <- ggplot(ps_plot_df,
             aes(x = p, fill = group, weight = wt_use)) +
  geom_density(alpha = 0.55, color = NA, adjust = 1.2) +
  scale_fill_manual(values = c("Expansion" = ORANGE,
                               "Non-expansion" = BLUE),
                    name = NULL) +
  facet_wrap(~ weighting) +
  labs(title    = "Propensity-score overlap, by weighting",
       subtitle = "Logit of expansion status on 2013 covariates",
       x = "Estimated propensity score", y = "Density")
ggsave("r_did2_03_propensity.png", p3, width = 10, height = 5.5, dpi = 300, bg = BG_DARK)


# ============================================================================
# Section 6. 2x2 with covariates -- OR, IPW, and Doubly-Robust DiD
# ----------------------------------------------------------------------------
# WHAT   Re-estimate the 2x2 ATT(2014), but adjust for the six baseline
#        covariates using three estimators:
#          OR   = outcome regression (control-group outcome model)
#          IPW  = inverse propensity weighting (control-group balancing)
#          DR   = doubly-robust combination (only one needs to be right)
# WHY    The unweighted 2014 expansion counties differ from the controls
#        on age composition, income, and racial mix (see Section 5). The
#        2x2 estimate above could be confounded by those imbalances.
# HOW    `did::att_gt()` does all three under one roof. We run it six times:
#        three estimators x two weighting choices. The `cs_one()` helper
#        is one function with a single if/else -- no `do.call` magic.
# WATCH  In each weighting regime, the three estimators agree to a few
#        tenths of a death / 100,000. The unweighted-vs-weighted gap is
#        much bigger than the estimator gap. Confounding control buys you
#        less than the weighting choice does.
#
# GLOSSARY
#   never-treated control
#       The comparison group consists of counties whose state has not
#       expanded Medicaid by 2019. Their `treat_year` is 0.
#   universal base period
#       In a multi-period event study we have to choose a baseline year.
#       "Universal" means we compare every other period to the SAME pre-
#       period (-1). This is the convention required for HonestDiD later.
# ============================================================================

# `did` expects (a) a numeric ID column, (b) a `treat_year` that is 0 for
# never-treated and the actual expansion year otherwise.
data_cs_2x2 <- short_data %>%
  mutate(treat_year_cs = if_else(D == 1, 2014, 0),
         id_num        = as.numeric(county_code)) %>%
  select(id_num, year, crude_rate_20_64, treat_year_cs, set_wt, all_of(covs))

xformla <- as.formula(paste("~", paste(covs, collapse = " + ")))

# Helper: cs_one()
#   Runs ONE Callaway-Sant'Anna `att_gt()` for the 2x2 design, then collapses
#   it to a single overall ATT via `aggte(type = "simple")`. Two arguments:
#     method   = "reg" (outcome regression) | "ipw" | "dr"
#     weighted = TRUE for population-weighted, FALSE for equal weights.
#   Returns a one-row tibble: method, weighting, est, se.
#
#   We write the two att_gt() calls out explicitly (no do.call) so a beginner
#   can read every argument. The arguments are identical except that the
#   weighted version adds `weightsname = "set_wt"`.
cs_one <- function(method, weighted) {
  if (weighted) {
    res <- did::att_gt(
      yname         = "crude_rate_20_64",
      tname         = "year",
      idname        = "id_num",
      gname         = "treat_year_cs",
      xformla       = xformla,
      data          = data_cs_2x2,
      panel         = TRUE,
      control_group = "nevertreated",
      base_period   = "universal",
      bstrap        = TRUE,
      est_method    = method,
      biters        = BITERS,
      weightsname   = "set_wt"
    )
  } else {
    res <- did::att_gt(
      yname         = "crude_rate_20_64",
      tname         = "year",
      idname        = "id_num",
      gname         = "treat_year_cs",
      xformla       = xformla,
      data          = data_cs_2x2,
      panel         = TRUE,
      control_group = "nevertreated",
      base_period   = "universal",
      bstrap        = TRUE,
      est_method    = method,
      biters        = BITERS
    )
  }
  # `aggte(type = "simple")` averages ATT(g,t) cells into one ATT. The 2x2
  # design has only one pre-period, so `did` prints an informational note
  # "No pre-treatment periods to test"; we suppress it to keep the log clean.
  agg <- suppressMessages(aggte(res, type = "simple", na.rm = TRUE))
  tibble(method    = method,
         weighting = if (weighted) "Population-weighted" else "Unweighted",
         est       = agg$overall.att,
         se        = agg$overall.se)
}

# Six explicit calls -- one row per (estimator x weighting) cell.
cs_2x2_tbl <- bind_rows(
  cs_one("reg", FALSE), cs_one("reg", TRUE),
  cs_one("ipw", FALSE), cs_one("ipw", TRUE),
  cs_one("dr",  FALSE), cs_one("dr",  TRUE)
) %>%
  mutate(method_label = recode(method,
                               reg = "Outcome regression (OR)",
                               ipw = "Inverse propensity weighting (IPW)",
                               dr  = "Doubly robust (DRDID)"),
         lo95 = est - 1.96 * se, hi95 = est + 1.96 * se)
cat("2x2 covariate-adjusted estimates:\n"); print(cs_2x2_tbl)
write_csv(cs_2x2_tbl, "table_2x2_drdid.csv")

# Figure 4: combined forest plot, including the TWFE long-difference
# specification from Section 4 as a "no covariates" baseline. The visual
# message is that the unweighted-vs-weighted vertical split dominates any
# horizontal differences across estimators.
forest_df <- bind_rows(
  twfe_tbl %>% filter(spec == "Long difference") %>%
    transmute(method_label = "TWFE long diff (no covs)",
              weighting, est, se, lo95, hi95),
  cs_2x2_tbl %>%
    select(method_label, weighting, est, se, lo95, hi95)
) %>%
  mutate(method_label = factor(method_label,
           levels = c("TWFE long diff (no covs)",
                      "Outcome regression (OR)",
                      "Inverse propensity weighting (IPW)",
                      "Doubly robust (DRDID)")),
         weighting = factor(weighting,
           levels = c("Unweighted", "Population-weighted")))

p4 <- ggplot(forest_df, aes(x = est, y = method_label, color = weighting)) +
  geom_vline(xintercept = 0, color = TEXT_LIGHT, linetype = "dashed") +
  geom_errorbar(aes(xmin = lo95, xmax = hi95), width = 0.2, linewidth = 0.9,
                orientation = "y",
                position = position_dodge(width = 0.55)) +
  geom_point(size = 3.3, position = position_dodge(width = 0.55)) +
  scale_color_manual(values = c("Unweighted" = BLUE,
                                "Population-weighted" = ORANGE),
                     name = NULL) +
  labs(title    = "Covariate-adjusted 2x2 estimates",
       subtitle = "Three estimators x two weights; the weighting gap is larger than the estimator gap",
       x = "ATT(2014) (deaths per 100,000)", y = NULL)
ggsave("r_did2_04_drdid_forest.png", p4, width = 11, height = 5.5, dpi = 300, bg = BG_DARK)


# ============================================================================
# Section 7. 2xT event study -- one cohort, many years
# ----------------------------------------------------------------------------
# WHAT   Estimate the dynamic ATT(e) for the 2014 expansion cohort, for
#        event time e in {-5, ..., +5}. e = 0 is 2014 itself; e = -1 is the
#        omitted reference period.
# WHY    The pre-treatment leads (e < 0) are an *implicit placebo test*:
#        if the parallel-trends assumption is correct, those coefficients
#        should be near zero. The post-treatment leads/lags (e > 0) show
#        how the effect evolves over time.
# HOW    Two explicit `did::att_gt()` calls (unweighted, weighted), each
#        followed by `aggte(type = "dynamic")` to produce ATT(e).
# WATCH  In Figure 5, the unweighted (blue) and weighted (orange) lines
#        sit close together pre-treatment but diverge after 2014. The blue
#        line stays near zero or drifts positive; the orange line drops
#        below zero -- consistent with the 2x2 result in Section 3.
#
# GLOSSARY
#   event time e
#       e = year - expansion_year. e = 0 is the first treated year; e = -1
#       is the year before treatment (the omitted reference).
# ============================================================================

# Sub-panel: 2014 expanders + never-treated only, all 11 years.
data_2xt <- df_prep %>%
  filter(treat_year %in% c(0, 2014)) %>%
  mutate(id_num = as.numeric(county_code)) %>%
  select(id_num, year, crude_rate_20_64, treat_year, set_wt, all_of(covs))

# Unweighted: doubly-robust ATT(g,t) on the simplified two-cohort panel.
att_2xt_unw <- att_gt(yname = "crude_rate_20_64", tname = "year",
                      idname = "id_num", gname = "treat_year",
                      xformla = xformla, data = data_2xt, panel = TRUE,
                      control_group = "nevertreated",
                      base_period   = "universal",
                      bstrap = TRUE,
                      est_method = "dr", biters = BITERS)
# Population-weighted: same call with `weightsname = "set_wt"`.
att_2xt_wt  <- att_gt(yname = "crude_rate_20_64", tname = "year",
                      idname = "id_num", gname = "treat_year",
                      xformla = xformla, data = data_2xt, panel = TRUE,
                      control_group = "nevertreated",
                      base_period   = "universal",
                      bstrap = TRUE,
                      est_method = "dr",
                      weightsname = "set_wt", biters = BITERS)

# Aggregate group-time ATTs into event-time ATT(e).
es_2xt_unw <- aggte(att_2xt_unw, type = "dynamic", na.rm = TRUE)
es_2xt_wt  <- aggte(att_2xt_wt,  type = "dynamic", na.rm = TRUE)

event_2xt_tbl <- bind_rows(
  tibble(e = es_2xt_unw$egt, est = es_2xt_unw$att.egt,
         se = es_2xt_unw$se.egt, weighting = "Unweighted"),
  tibble(e = es_2xt_wt$egt,  est = es_2xt_wt$att.egt,
         se = es_2xt_wt$se.egt,  weighting = "Population-weighted")
) %>%
  mutate(lo95 = est - 1.96 * se, hi95 = est + 1.96 * se,
         weighting = factor(weighting,
                            levels = c("Unweighted", "Population-weighted")))
cat("2xT event study (ATT(e)):\n"); print(event_2xt_tbl)
write_csv(event_2xt_tbl, "table_event_2xT.csv")

# Figure 5: dynamic event study with weighted vs unweighted overlay. The
# vertical orange dotted line at e = -0.5 marks the boundary between leads
# (placebo region) and lags (treatment region).
p5 <- ggplot(event_2xt_tbl, aes(x = e, y = est,
                                 color = weighting, fill = weighting)) +
  geom_hline(yintercept = 0, color = TEXT_LIGHT, linetype = "dashed") +
  geom_vline(xintercept = -0.5, color = ORANGE, linetype = "dotted",
             linewidth = 0.6) +
  # The reference period (e = -1) has SE = NA by construction; na.rm hides
  # the harmless "Removed 2 rows" warning that geom_ribbon would otherwise
  # emit when it encounters those NA values.
  geom_ribbon(aes(ymin = lo95, ymax = hi95), alpha = 0.18, color = NA,
              na.rm = TRUE) +
  geom_line(linewidth = 1.1) +
  geom_point(size = 2.6) +
  scale_color_manual(values = c("Unweighted" = BLUE,
                                "Population-weighted" = ORANGE),
                     aesthetics = c("color", "fill"), name = NULL) +
  scale_x_continuous(breaks = sort(unique(event_2xt_tbl$e))) +
  labs(title    = "Event study: 2014 expanders vs never-expanders",
       subtitle = "Dynamic ATT(e); pre-period leads serve as the parallel-trends visual test",
       x = "Years since Medicaid expansion (e)",
       y = "ATT(e) (deaths per 100,000)")
ggsave("r_did2_05_event_2xT.png", p5, width = 11, height = 5.5, dpi = 300, bg = BG_DARK)


# ============================================================================
# Section 8. GxT staggered design -- ALL expansion cohorts
# ----------------------------------------------------------------------------
# WHAT   The full Callaway-Sant'Anna design: every county is in either a
#        cohort {2014, 2015, 2016, 2017, 2019} or the never-treated group.
#        We estimate ATT(g, t) for each cohort-year cell, then aggregate.
# WHY    Many regional studies have staggered adoption. TWFE on staggered
#        designs is known to produce biased estimates when effects vary
#        across cohorts -- the modern remedy is to estimate clean 2x2's
#        per cohort and aggregate them transparently.
# HOW    Same two `att_gt()` calls as Section 7, but now on the full panel
#        with multiple non-zero cohorts. We then aggregate two ways:
#          (i)  by COHORT -- one ATT per cohort, averaged across post years
#          (ii) by EVENT TIME -- one ATT per e, pooled across cohorts
# WATCH  In Figure 6, the population-weighted bar for the 2014 cohort is
#        much closer to zero than its unweighted counterpart -- California
#        carries enormous weight and tempers the magnitude of the average.
# ============================================================================

# Full panel for the GxT design. Includes counties from every cohort.
data_gxt <- df_prep %>%
  mutate(id_num = as.numeric(county_code)) %>%
  select(id_num, year, crude_rate_20_64, treat_year, set_wt, all_of(covs))

# Unweighted ATT(g, t) across all cohorts.
att_gxt_unw <- att_gt(yname = "crude_rate_20_64", tname = "year",
                      idname = "id_num", gname = "treat_year",
                      xformla = xformla, data = data_gxt, panel = TRUE,
                      control_group = "nevertreated",
                      base_period   = "universal",
                      bstrap = TRUE,
                      est_method = "dr", biters = BITERS)
# Population-weighted version.
att_gxt_wt  <- att_gt(yname = "crude_rate_20_64", tname = "year",
                      idname = "id_num", gname = "treat_year",
                      xformla = xformla, data = data_gxt, panel = TRUE,
                      control_group = "nevertreated",
                      base_period   = "universal",
                      bstrap = TRUE,
                      est_method = "dr",
                      weightsname = "set_wt", biters = BITERS)

# Raw ATT(g, t) grid, exported for the post.
gxt_raw_tbl <- bind_rows(
  tibble(group = att_gxt_unw$group, t = att_gxt_unw$t,
         est = att_gxt_unw$att, se = att_gxt_unw$se,
         weighting = "Unweighted"),
  tibble(group = att_gxt_wt$group, t = att_gxt_wt$t,
         est = att_gxt_wt$att, se = att_gxt_wt$se,
         weighting = "Population-weighted")
) %>% filter(group > 0)
write_csv(gxt_raw_tbl, "table_attgt_gxt.csv")

# (i) Cohort aggregates: one ATT per expansion year.
agg_grp_unw <- aggte(att_gxt_unw, type = "group", na.rm = TRUE)
agg_grp_wt  <- aggte(att_gxt_wt,  type = "group", na.rm = TRUE)
grp_tbl <- bind_rows(
  tibble(group = agg_grp_unw$egt, est = agg_grp_unw$att.egt,
         se = agg_grp_unw$se.egt, weighting = "Unweighted"),
  tibble(group = agg_grp_wt$egt,  est = agg_grp_wt$att.egt,
         se = agg_grp_wt$se.egt,  weighting = "Population-weighted")
) %>%
  mutate(lo95 = est - 1.96 * se, hi95 = est + 1.96 * se,
         weighting = factor(weighting,
                            levels = c("Unweighted", "Population-weighted")))
cat("Group-specific ATT(g) (averaged over post periods):\n"); print(grp_tbl)
write_csv(grp_tbl, "table_attgt_gxt_grouped.csv")

# Figure 6: by-cohort ATT bar chart.
p6 <- ggplot(grp_tbl, aes(x = factor(group), y = est, fill = weighting)) +
  geom_hline(yintercept = 0, color = TEXT_LIGHT, linetype = "dashed") +
  geom_col(position = position_dodge(width = 0.7), width = 0.6,
           color = NA, alpha = 0.9) +
  geom_errorbar(aes(ymin = lo95, ymax = hi95),
                position = position_dodge(width = 0.7), width = 0.18,
                color = TEXT_WHITE, linewidth = 0.6) +
  scale_fill_manual(values = c("Unweighted" = BLUE,
                               "Population-weighted" = ORANGE),
                    name = NULL) +
  labs(title    = "By-cohort ATT(g), Callaway-Sant'Anna staggered design",
       subtitle = "Averaged across post-expansion periods, unweighted vs weighted",
       x = "Expansion cohort (year)", y = "ATT(g) (deaths per 100,000)")
ggsave("r_did2_06_attgt_groups.png", p6, width = 10, height = 5.5, dpi = 300, bg = BG_DARK)

# (ii) Event-time aggregates: one ATT per e, pooled across cohorts.
es_gxt_unw <- aggte(att_gxt_unw, type = "dynamic", na.rm = TRUE)
es_gxt_wt  <- aggte(att_gxt_wt,  type = "dynamic", na.rm = TRUE)
event_gxt_tbl <- bind_rows(
  tibble(e = es_gxt_unw$egt, est = es_gxt_unw$att.egt,
         se = es_gxt_unw$se.egt, weighting = "Unweighted"),
  tibble(e = es_gxt_wt$egt,  est = es_gxt_wt$att.egt,
         se = es_gxt_wt$se.egt,  weighting = "Population-weighted")
) %>%
  mutate(lo95 = est - 1.96 * se, hi95 = est + 1.96 * se,
         weighting = factor(weighting,
                            levels = c("Unweighted", "Population-weighted")))
cat("GxT dynamic event study:\n"); print(event_gxt_tbl)
write_csv(event_gxt_tbl, "table_event_gxt.csv")

# Figure 7: GxT event study -- same shape as Figure 5 but using every cohort.
p7 <- ggplot(event_gxt_tbl, aes(x = e, y = est,
                                 color = weighting, fill = weighting)) +
  geom_hline(yintercept = 0, color = TEXT_LIGHT, linetype = "dashed") +
  geom_vline(xintercept = -0.5, color = ORANGE, linetype = "dotted",
             linewidth = 0.6) +
  # Same NA-at-reference-period handling as Figure 5; see comment there.
  geom_ribbon(aes(ymin = lo95, ymax = hi95), alpha = 0.18, color = NA,
              na.rm = TRUE) +
  geom_line(linewidth = 1.1) +
  geom_point(size = 2.6) +
  scale_color_manual(values = c("Unweighted" = BLUE,
                                "Population-weighted" = ORANGE),
                     aesthetics = c("color", "fill"), name = NULL) +
  scale_x_continuous(breaks = sort(unique(event_gxt_tbl$e))) +
  labs(title    = "GxT event study: all expansion cohorts pooled",
       subtitle = "Callaway-Sant'Anna dynamic aggregation, unweighted vs population-weighted",
       x = "Years since each cohort's expansion (e)",
       y = "ATT(e) (deaths per 100,000)")
ggsave("r_did2_07_event_gxt.png", p7, width = 11, height = 5.5, dpi = 300, bg = BG_DARK)


# ============================================================================
# Section 9. HonestDiD sensitivity to violations of parallel trends
# ----------------------------------------------------------------------------
# WHAT   For each weighting regime, compute Rambachan-Roth (2023) "relative
#        magnitude" bounds on the average post-treatment ATT under the
#        assumption that any post-treatment violation of parallel trends is
#        at most M-bar times the maximum violation observed in the pre-period.
# WHY    The event-study leads are informative but not decisive. HonestDiD
#        asks: "How big would a post-period violation have to be before our
#        conclusion flips?" The smallest such M-bar is the "breakdown" value.
# HOW    The `did` package returns an `AGGTEobj` while HonestDiD wants raw
#        coefficient vectors and variance-covariance matrices. The S3 method
#        below converts between the two formats. The method is taken (with
#        comments added) from the HonestDiD vignette / reference script
#        `reference/scripts/R/5_honestdid.R`.
# WATCH  In Figure 8, the unweighted CI (blue ribbon) survives much larger
#        M-bar values than the weighted CI before excluding zero. That tells
#        us the WEIGHTED result -- the negative effect -- is more sensitive
#        to pre-trend violations than the (near-zero) unweighted result.
#
# GLOSSARY
#   M-bar
#       Maximum post-treatment deviation from parallel trends, expressed in
#       units of pre-treatment deviations. M-bar = 0 means we believe pre-
#       trends are not informative; M-bar = 1 means the worst post-period
#       violation can be as big as the worst pre-period violation; higher
#       M-bar = more generous (less restrictive) assumption.
# ============================================================================

# Helper: honest_did.AGGTEobj()
#
# Why this exists.
#   `did::aggte()` returns an `AGGTEobj` which packs together event-time
#   coefficients (`att.egt`), their standard errors, and a 3-D influence-
#   function array. HonestDiD's sensitivity functions need the matching
#   variance-covariance matrix in a specific format. This S3 method does the
#   conversion.
#
# What it does.
#   1. Pull the influence function for the dynamic aggregation.
#   2. Construct V = (inf)' (inf) / n^2 -- the sandwich estimator.
#   3. Drop the reference period (e = -1) from both `beta` and `V` because
#      its coefficient is normalised to zero by construction.
#   4. Set `l_vec = (1/npost) * 1` -- the equally-weighted average of post-
#      period coefficients (matches the "overall ATT for the treated").
#   5. Call HonestDiD twice: once for the original CI, once for the
#      relative-magnitudes sensitivity across a grid of M-bar values.
#
# This function is registered as an S3 method on `AGGTEobj`, so we can call
# `honest_did(es_gxt_unw)` and dispatch happens automatically.
honest_did <- function(...) UseMethod("honest_did")
honest_did.AGGTEobj <- function(es,
                                type = c("smoothness", "relative_magnitude"),
                                gridPoints = 100, ...) {
  type <- match.arg(type)
  if (es$type != "dynamic")
    stop("honest_did needs a dynamic event study")
  if (es$DIDparams$base_period != "universal")
    stop("honest_did needs a universal base period")
  inf <- es$inf.function$dynamic.inf.func.e
  n   <- nrow(inf)
  V   <- t(inf) %*% inf / n / n              # sandwich variance
  ref <- -1                                  # reference event time
  has_ref <- any(es$egt == ref)
  if (has_ref) {
    idx  <- which(es$egt == ref)             # row to drop
    V    <- V[-idx, -idx]
    beta <- es$att.egt[-idx]
    egt2 <- es$egt[-idx]
  } else {
    beta <- es$att.egt; egt2 <- es$egt
  }
  npre  <- sum(egt2 < ref)                   # number of leads
  npost <- length(beta) - npre               # number of lags
  l_vec <- matrix(rep(1 / npost, npost))     # equal-weighted average of post lags
  orig  <- HonestDiD::constructOriginalCS(betahat = beta, sigma = V,
                                          numPrePeriods = npre,
                                          numPostPeriods = npost,
                                          l_vec = l_vec)
  if (type == "relative_magnitude") {
    rob <- HonestDiD::createSensitivityResults_relativeMagnitudes(
              betahat       = beta,    sigma         = V,
              numPrePeriods = npre,    numPostPeriods = npost,
              l_vec         = l_vec,   gridPoints    = gridPoints,
              Mbarvec       = c(0, 0.25, 0.5, 0.75, 1, 1.5, 2), ...)
  } else {
    rob <- HonestDiD::createSensitivityResults(
              betahat       = beta,    sigma         = V,
              numPrePeriods = npre,    numPostPeriods = npost,
              l_vec         = l_vec, ...)
  }
  list(robust = rob, orig = orig)
}

# Helper: flatten_hd()
#   HonestDiD returns `lb` / `ub` as one-column matrices. `readr::write_csv()`
#   refuses to write matrix columns, so we coerce them to plain numeric.
flatten_hd <- function(x) {
  as_tibble(x) %>% mutate(lb = as.numeric(lb), ub = as.numeric(ub))
}

# Two sensitivities (one per weighting), each over a grid of M-bar values.
hd_unw <- honest_did(es_gxt_unw, type = "relative_magnitude")
hd_wt  <- honest_did(es_gxt_wt,  type = "relative_magnitude")

hd_tbl <- bind_rows(
  flatten_hd(hd_unw$robust) %>% mutate(weighting = "Unweighted"),
  flatten_hd(hd_wt$robust)  %>% mutate(weighting = "Population-weighted"),
  flatten_hd(hd_unw$orig)   %>% mutate(Mbar = NA_real_,
                                       weighting = "Unweighted",
                                       method = "Original"),
  flatten_hd(hd_wt$orig)    %>% mutate(Mbar = NA_real_,
                                       weighting = "Population-weighted",
                                       method = "Original")
) %>%
  mutate(weighting = factor(weighting,
                            levels = c("Unweighted", "Population-weighted")))
cat("HonestDiD relative-magnitudes sensitivity:\n"); print(hd_tbl)
write_csv(hd_tbl, "table_honestdid.csv")

# Figure 8: sensitivity bounds across M-bar, faceted by weighting. The dotted
# teal lines mark the original confidence interval (M-bar = 0 in spirit) so
# you can see how quickly the bounds inflate as we relax parallel trends.
hd_plot_df <- hd_tbl %>%
  filter(method != "Original" | is.na(method)) %>%
  filter(!is.na(Mbar))

orig_lines <- bind_rows(
  flatten_hd(hd_unw$orig) %>% mutate(weighting = "Unweighted"),
  flatten_hd(hd_wt$orig)  %>% mutate(weighting = "Population-weighted")
) %>%
  mutate(weighting = factor(weighting,
                            levels = c("Unweighted", "Population-weighted")))

p8 <- ggplot(hd_plot_df, aes(x = Mbar, y = (lb + ub) / 2)) +
  geom_hline(yintercept = 0, color = TEXT_LIGHT, linetype = "dashed") +
  geom_ribbon(aes(ymin = lb, ymax = ub, fill = weighting), alpha = 0.4) +
  geom_line(aes(color = weighting), linewidth = 1.1) +
  geom_hline(data = orig_lines, aes(yintercept = lb),
             linetype = "dotted", color = TEAL) +
  geom_hline(data = orig_lines, aes(yintercept = ub),
             linetype = "dotted", color = TEAL) +
  scale_color_manual(values = c("Unweighted" = BLUE,
                                "Population-weighted" = ORANGE),
                     aesthetics = c("color", "fill"), name = NULL) +
  facet_wrap(~ weighting) +
  labs(title    = "HonestDiD: how robust is the post-period ATT to pre-trend violations?",
       subtitle = "Relative-magnitudes bound (Rambachan-Roth 2023); teal dashed = original CI",
       x = expression(bar(M) ~ " (max post-period deviation, in units of pre-trend deviations)"),
       y = "ATT bound (deaths per 100,000)",
       caption = "Bounds become uninformative as Mbar grows; the saturation near +/- 66 is the HonestDiD grid limit, not a feature of the data.")
ggsave("r_did2_08_honestdid.png", p8, width = 11, height = 5.5, dpi = 300, bg = BG_DARK)


# ============================================================================
# Section 10. Headline summary + README
# ----------------------------------------------------------------------------
# WHAT   One small table that surfaces THE numbers a reader will quote: the
#        2x2 cell-means ATT, the long-difference TWFE estimate, the DRDID
#        estimate, and the dynamic event-study averages -- each unweighted
#        and weighted.
# WHY    Downstream skills (`write-results-report`, `write-post`) read
#        `summary.csv` to compose the narrative.
# HOW    Plain `tribble()` plus a couple of `mean()`s.
# WATCH  The unweighted column should be near zero throughout; the weighted
#        column should be consistently negative (around -2 to -4).
# ============================================================================

dr_2x2 <- cs_2x2_tbl %>% filter(method == "dr") %>%
  select(weighting, est) %>%
  pivot_wider(names_from = weighting, values_from = est)

summary_tbl <- tribble(
  ~stage,                                       ~unweighted,        ~weighted,
  "2x2 cell-means ATT(2014)",                   e_unw$att,          e_wt$att,
  "2x2 TWFE long-difference",                   coef(twfe_long_unw)[["D"]],
                                                coef(twfe_long_wt)[["D"]],
  "2x2 DRDID (Callaway-Sant'Anna)",             dr_2x2$Unweighted,
                                                dr_2x2$`Population-weighted`,
  "2xT dynamic ATT (avg over e>=0)",
      mean(filter(event_2xt_tbl, e >= 0, weighting == "Unweighted")$est),
      mean(filter(event_2xt_tbl, e >= 0, weighting == "Population-weighted")$est),
  "GxT dynamic ATT (avg over e>=0)",
      mean(filter(event_gxt_tbl, e >= 0, weighting == "Unweighted")$est),
      mean(filter(event_gxt_tbl, e >= 0, weighting == "Population-weighted")$est)
)
cat("Summary of headline estimates (deaths per 100,000):\n"); print(summary_tbl)
write_csv(summary_tbl, "summary.csv")

# --- README -----------------------------------------------------------------
# Inventory file that downstream skills consume. Pipeline checkboxes track
# which post-creation stages have been completed.
readme <- c(
  "# r_did2 -- A streamlined introduction to DiD for regional data",
  "",
  "**Source:** Baker, Callaway, Cunningham, Goodman-Bacon & Sant'Anna (2024),",
  "*Difference-in-Differences Designs: A Practitioner's Guide* (manuscript in `reference/`).",
  "",
  "**Pedagogical focus:** every estimator is reported population-weighted and unweighted,",
  "side-by-side, to make clear that weighting changes the *target parameter* (not just",
  "its variance) when the units of analysis are regions of very different sizes.",
  "",
  "## Pipeline progress",
  "",
  "- [x] Script (`analysis.R`)",
  "- [ ] Results report (`results_report.md`)",
  "- [ ] Blog post (`index.md`)",
  "- [ ] Infographic (`infographic_instructions.md`)",
  "- [ ] Quarto notebook (`references/tutorial.qmd`)",
  "",
  "## Figures",
  "",
  "| File | Description |",
  "|---|---|",
  "| r_did2_01_headline_2x2.png   | 2x2 cell-means plot; unweighted vs weighted side-by-side. |",
  "| r_did2_02_twfe_2x2.png       | Three TWFE specifications, two weighting choices. |",
  "| r_did2_03_propensity.png     | Propensity-score densities by expansion status. |",
  "| r_did2_04_drdid_forest.png   | OR / IPW / DRDID + TWFE baseline forest plot. |",
  "| r_did2_05_event_2xT.png      | 2xT event study for 2014 expanders vs never-expanders. |",
  "| r_did2_06_attgt_groups.png   | By-cohort ATT(g) under the full GxT design. |",
  "| r_did2_07_event_gxt.png      | GxT dynamic event-study aggregation. |",
  "| r_did2_08_honestdid.png      | HonestDiD relative-magnitudes sensitivity. |",
  "",
  "## CSV tables",
  "",
  "| File | Description |",
  "|---|---|",
  "| raw_data.csv                 | Copy of the curated source CSV (input). |",
  "| data_prepared.csv            | Analysis-ready county-year panel after filtering. |",
  "| table_adoption_cohorts.csv   | Expansion cohort counts and population shares. |",
  "| table_2x2_means.csv          | 2x2 cell-means + DiD, unweighted and weighted. |",
  "| table_2x2_twfe.csv           | Six TWFE specifications. |",
  "| table_covariate_balance.csv  | Normalized differences for covariates in 2013. |",
  "| table_propensity_models.csv  | Propensity-score logit coefficients. |",
  "| table_2x2_drdid.csv          | OR / IPW / DRDID 2x2 estimates. |",
  "| table_event_2xT.csv          | 2xT event-study ATT(e). |",
  "| table_attgt_gxt.csv          | Raw group-by-time ATT(g,t). |",
  "| table_attgt_gxt_grouped.csv  | Cohort-aggregated ATT(g). |",
  "| table_event_gxt.csv          | GxT dynamic event-study ATT(e). |",
  "| table_honestdid.csv          | HonestDiD bounds across Mbar values. |",
  "| summary.csv                  | Headline estimates table (unweighted vs weighted). |",
  "",
  "## Review reports",
  "",
  "| File | Description |",
  "|---|---|",
  "| script-review.md             | Expert review of `analysis.R` across 8 quality dimensions. |",
  "",
  "## Datasets",
  "",
  sprintf("| county_mortality_data.csv (input) | %d rows x %d cols | CDC county mortality 2009-2019 + ACA expansion timing. |",
          nrow(df_raw), ncol(df_raw)),
  sprintf("| data_prepared.csv                 | %d rows x %d cols | Analysis panel: 2,604 counties x 11 years. |",
          nrow(df_prep), ncol(df_prep)),
  "",
  "## R packages used",
  "",
  "tidyverse, fixest, did, DRDID, HonestDiD, broom, scales, here, pacman.",
  ""
)
writeLines(readme, "README.md")

cat("\n=== Script completed successfully ===\n")
