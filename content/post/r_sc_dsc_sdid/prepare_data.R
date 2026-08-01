# ══════════════════════════════════════════════════════════════════════════════
# prepare_data.R — build the published CSVs for the r_sc_dsc_sdid tutorial
#
# The replication package of de Brabander, Juodis & Miyazato Szini (2025) ships
# its data as a single MATLAB binary. That is fine for the authors and useless
# for a reader who just wants to follow along. This script runs ONCE, offline,
# and turns that binary into two plain CSVs plus a codebook, so that every code
# block in the tutorial can load its data straight from a GitHub raw URL and
# nobody ever needs the .mat file (or MATLAB, or R.matlab) again.
#
# Run it only if you want to regenerate the CSVs from the original source. The
# tutorial itself does NOT depend on this script.
#
# Usage:  cd content/post/r_sc_dsc_sdid && Rscript prepare_data.R
# Input:  replicationReference/brexit_data_raw_eo_nov2018.mat  (gitignored)
# Output: brexit_analysis.csv    — the estimation sample, 24 countries x 104 quarters
#         brexit_panel_long.csv  — the full tidy panel, all 36 countries, all variables
#         data/README.md         — the codebook
#
# Data provenance: OECD Economic Outlook, November 2018 vintage, extended to
#   2020Q4, as assembled by Born, Muller, Schularick & Sedlacek (2019) and
#   redistributed in the replication package of de Brabander et al. (2025).
#
# References:
#   - https://doi.org/10.1080/07474938.2025.2530649   (de Brabander et al. 2025)
#   - https://doi.org/10.1093/ej/uez020               (Born et al. 2019)
# ══════════════════════════════════════════════════════════════════════════════


# ── 0. Setup ──────────────────────────────────────────────────────────────────

required <- c("R.matlab")
missing  <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop("Missing packages: ", paste(missing, collapse = ", "),
       "\nInstall with: install.packages(c('", paste(missing, collapse = "','"), "'))")
}
suppressPackageStartupMessages(library(R.matlab))

MAT_PATH <- file.path("replicationReference", "brexit_data_raw_eo_nov2018.mat")
if (!file.exists(MAT_PATH)) {
  stop("Cannot find ", MAT_PATH, ".\n",
       "This script needs the authors' replication package, which is gitignored.\n",
       "Download it from https://doi.org/10.1080/07474938.2025.2530649")
}

rule <- function(txt) cat("\n", strrep("=", 78), "\n", txt, "\n",
                          strrep("=", 78), "\n", sep = "")


# ── 1. Read the MATLAB file ───────────────────────────────────────────────────
#
# R.matlab::readMat() rewrites underscores to dots in variable names
# (fixNames = TRUE is the default), so MATLAB's `real_gdp` arrives as
# `real.gdp`. Every access below uses the dotted form.

rule("1. Reading the MATLAB source")

mat <- readMat(MAT_PATH)

# Each data matrix is [244 quarters x 36 countries]. `timeline` is a decimal
# year: 1960.00, 1960.25, ..., 2020.75. `country.names` is a 1 x 36 cell array.
timeline      <- as.numeric(mat[["timeline"]])
country_names <- unlist(mat[["country.names"]])

cat("  quarters      :", length(timeline),
    sprintf("(%.2f to %.2f)\n", min(timeline), max(timeline)))
cat("  countries     :", length(country_names), "\n")
cat("  matrices found:", sum(vapply(mat, is.matrix, logical(1))), "\n")

# Quarter labels. idx = 4 * (year - 1960) + quarter, so index 141 is 1995Q1.
year_of    <- floor(timeline)
quarter_of <- round((timeline - year_of) * 4) + 1L
qlabel     <- sprintf("%dQ%d", year_of, quarter_of)


# ── 2. The outcome and the six covariates ─────────────────────────────────────
#
# Outcome. The .mat stores both `real_gdp_raw` (levels, national currency) and
# `real_gdp`, which is the same series divided by that country's 1995 annual
# average — so every country's index equals 1 on average in 1995. The paper
# works with log(real_gdp). Because unit weights sum to one, this per-country
# rescaling shifts each donor's log series by a constant; estimators with an
# intercept (DSC, SDID) absorb it, plain SC does not.
#
# Covariates, exactly as constructed by Born et al. (2019):
#   consumption, investment, exports and imports each as a share of GDP;
#   labour productivity growth as 100 x the quarterly log difference;
#   employment as a share of the working-age population.

rule("2. Building the outcome and covariates")

log_rgdp <- log(mat[["real.gdp"]])

rgdp_raw <- mat[["real.gdp.raw"]]
cons_share <- mat[["real.con.raw"]] / rgdp_raw
inv_share  <- mat[["real.inv.raw"]] / rgdp_raw
exp_share  <- mat[["real.exp.raw"]] / rgdp_raw
imp_share  <- mat[["real.imp.raw"]] / rgdp_raw
emp_pop    <- mat[["tot.emp.pc.raw"]]

# Labour-productivity growth loses its first observation to the differencing;
# pad with NA so the matrix keeps its 244 rows and stays row-aligned.
labprod_growth <- rbind(rep(NA_real_, ncol(rgdp_raw)),
                        100 * diff(log(mat[["lab.prod.raw"]])))

# Confirm the normalisation claim above rather than trusting it.
uk_col <- match("United Kingdom", country_names)
ratio  <- rgdp_raw[, uk_col] / mat[["real.gdp"]][, uk_col]
cat(sprintf("  UK real_gdp_raw / real_gdp is constant : %s\n",
            isTRUE(all.equal(min(ratio, na.rm = TRUE), max(ratio, na.rm = TRUE)))))
cat(sprintf("  and equals the 1995 annual average     : %s\n",
            isTRUE(all.equal(unname(ratio[141]),
                             mean(rgdp_raw[141:144, uk_col]), tolerance = 1e-8))))


# ── 3. The estimation sample: drop the twelve, keep 1995Q1-2020Q4 ─────────────
#
# The authors drop every country with a missing value in ANY of the 51 stored
# series over the estimation window, which removes twelve and leaves 24. Three
# of the twelve (Czech Republic, Estonia, Israel) are dropped only because of a
# gap in the inflation series, which the analysis never uses — a reminder that
# donor-pool construction is itself a researcher degree of freedom.

rule("3. Restricting to the estimation sample")

DROP_IDX <- c(5, 6, 7, 8, 12, 16, 20, 21, 23, 27, 30, 34)
ROWS     <- 141:244                       # 1995Q1 .. 2020Q4

cat("  dropped (12):\n    ", paste(country_names[DROP_IDX], collapse = ", "), "\n")
keep_names <- country_names[-DROP_IDX]
cat("  kept (24):\n    ", paste(keep_names, collapse = ", "), "\n")
cat("  treated unit  : United Kingdom (position",
    match("United Kingdom", keep_names), "of 24)\n")

sub <- function(M) M[ROWS, -DROP_IDX, drop = FALSE]

analysis <- data.frame(
  country        = rep(keep_names, each = length(ROWS)),
  year           = rep(year_of[ROWS], times = length(keep_names)),
  quarter        = rep(quarter_of[ROWS], times = length(keep_names)),
  quarter_label  = rep(qlabel[ROWS], times = length(keep_names)),
  date_dec       = rep(timeline[ROWS], times = length(keep_names)),
  t              = rep(seq_along(ROWS), times = length(keep_names)),
  unit_id        = rep(seq_along(keep_names), each = length(ROWS)),
  log_rgdp       = as.vector(sub(log_rgdp)),
  cons_share     = as.vector(sub(cons_share)),
  inv_share      = as.vector(sub(inv_share)),
  exp_share      = as.vector(sub(exp_share)),
  imp_share      = as.vector(sub(imp_share)),
  labprod_growth = as.vector(sub(labprod_growth)),
  emp_pop        = as.vector(sub(emp_pop)),
  stringsAsFactors = FALSE
)
analysis$is_treated_unit <- as.integer(analysis$country == "United Kingdom")

# The treatment indicator uses the paper's convention: the treatment date is the
# quarter in which the effect materialises. The headline specification puts that
# at 2016Q3, so `treated` switches on from 2016Q3 for the UK only.
analysis$treated <- as.integer(analysis$is_treated_unit == 1L &
                                 analysis$date_dec >= 2016.50)

analysis <- analysis[order(analysis$unit_id, analysis$t), ]
row.names(analysis) <- NULL


# ── 4. The full tidy panel (all 36 countries, all concepts) ───────────────────
#
# Published alongside the estimation sample so readers can rebuild any variant:
# a different donor pool, a different outcome transform, a different window.

rule("4. Building the full tidy panel")

CONCEPTS <- c(
  real_gdp = "real.gdp", real_gdp_raw = "real.gdp.raw",
  real_con_raw = "real.con.raw", real_inv_raw = "real.inv.raw",
  real_exp_raw = "real.exp.raw", real_imp_raw = "real.imp.raw",
  real_gov_raw = "real.gov.raw", tot_emp_raw = "tot.emp.raw",
  tot_emp_pc_raw = "tot.emp.pc.raw", lab_prod_raw = "lab.prod.raw",
  unemp_rate_raw = "unemp.rate.raw", pop_quarterly = "pop.quarterly"
)

long <- do.call(rbind, lapply(names(CONCEPTS), function(nm) {
  M <- mat[[CONCEPTS[[nm]]]]
  data.frame(
    country       = rep(country_names, each = nrow(M)),
    year          = rep(year_of, times = ncol(M)),
    quarter       = rep(quarter_of, times = ncol(M)),
    quarter_label = rep(qlabel, times = ncol(M)),
    date_dec      = rep(timeline, times = ncol(M)),
    variable      = nm,
    value         = as.vector(M),
    stringsAsFactors = FALSE
  )
}))
long <- long[!is.na(long$value), ]
long <- long[order(long$variable, long$country, long$date_dec), ]
row.names(long) <- NULL


# ── 5. Verification ───────────────────────────────────────────────────────────

rule("5. Verification")

stopifnot(
  "analysis sample must be 24 countries"      = length(unique(analysis$country)) == 24L,
  "analysis sample must be 104 quarters"      = length(unique(analysis$t)) == 104L,
  "analysis sample must have 2496 rows"       = nrow(analysis) == 24L * 104L,
  "outcome must have no missing values"       = !anyNA(analysis$log_rgdp),
  "covariates must have no missing values"    = !anyNA(analysis[, c("cons_share", "inv_share",
                                                                    "exp_share", "imp_share",
                                                                    "labprod_growth", "emp_pop")]),
  "exactly one treated unit"                  = length(unique(analysis$country[analysis$is_treated_unit == 1L])) == 1L
)

uk_2016q1 <- analysis$log_rgdp[analysis$country == "United Kingdom" &
                                 analysis$quarter_label == "2016Q1"]
cat(sprintf("  UK log real GDP index at 2016Q1 : %.4f  (expected 0.4412)\n", uk_2016q1))
stopifnot("UK 2016Q1 outcome off target" = abs(uk_2016q1 - 0.4412) < 0.001)

cat(sprintf("  analysis rows                   : %d\n", nrow(analysis)))
cat(sprintf("  long-panel rows                 : %d across %d variables\n",
            nrow(long), length(unique(long$variable))))
cat(sprintf("  pre-treatment quarters (2016Q3) : %d\n",
            sum(analysis$date_dec < 2016.50 & analysis$unit_id == 1L)))
cat(sprintf("  pre-treatment quarters (2016Q2) : %d\n",
            sum(analysis$date_dec < 2016.25 & analysis$unit_id == 1L)))


# ── 6. Write the CSVs and the codebook ────────────────────────────────────────

rule("6. Writing output")

# Ten significant digits is far beyond anything these national accounts support,
# and it keeps the long panel from bloating the repository.
analysis[] <- lapply(analysis, function(x) if (is.double(x)) signif(x, 10) else x)
long$value <- signif(long$value, 10)

write.csv(analysis, "brexit_analysis.csv", row.names = FALSE)
write.csv(long,     "brexit_panel_long.csv", row.names = FALSE)
cat(sprintf("  brexit_analysis.csv   %8.1f KB\n",
            file.size("brexit_analysis.csv") / 1024))
cat(sprintf("  brexit_panel_long.csv %8.1f KB\n",
            file.size("brexit_panel_long.csv") / 1024))

dir.create("data", showWarnings = FALSE)
writeLines(c(
  "# Data for `r_sc_dsc_sdid` — the Brexit synthetic-control tutorial",
  "",
  "Two CSVs, both loadable directly over HTTPS:",
  "",
  "```r",
  'base <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_sc_dsc_sdid/"',
  'panel <- read.csv(paste0(base, "brexit_analysis.csv"))',
  "```",
  "",
  "## Provenance",
  "",
  "Quarterly national accounts for 36 OECD economies, 1960Q1-2020Q4, from the OECD",
  "Economic Outlook (November 2018 vintage, extended). Assembled by Born, Muller,",
  "Schularick and Sedlacek (2019), <https://doi.org/10.1093/ej/uez020>, and",
  "redistributed in the replication package of de Brabander, Juodis and Miyazato",
  "Szini (2025), <https://doi.org/10.1080/07474938.2025.2530649>. These CSVs are a",
  "faithful re-encoding of that package's `brexit_data_raw_eo_nov2018.mat`,",
  "produced by `prepare_data.R` in this directory.",
  "",
  "## `brexit_analysis.csv` — the estimation sample",
  "",
  "24 countries x 104 quarters (1995Q1-2020Q4) = 2,496 rows. No missing values.",
  "",
  "| Column | Type | Definition |",
  "|---|---|---|",
  "| `country` | character | Country name |",
  "| `year` | integer | Calendar year |",
  "| `quarter` | integer | Quarter, 1-4 |",
  "| `quarter_label` | character | e.g. `2016Q3` |",
  "| `date_dec` | numeric | Decimal year: 2016Q3 is `2016.50` |",
  "| `t` | integer | Period index, 1 = 1995Q1 ... 104 = 2020Q4 |",
  "| `unit_id` | integer | Country index, 1-24, alphabetical |",
  "| `log_rgdp` | numeric | **Outcome.** Natural log of real GDP, indexed so each country's 1995 annual average equals 1 |",
  "| `cons_share` | numeric | Real private consumption / real GDP |",
  "| `inv_share` | numeric | Real investment / real GDP |",
  "| `exp_share` | numeric | Real exports / real GDP |",
  "| `imp_share` | numeric | Real imports / real GDP |",
  "| `labprod_growth` | numeric | 100 x quarterly log change in real GDP per worker |",
  "| `emp_pop` | numeric | Total employment / working-age population |",
  "| `is_treated_unit` | integer | 1 for the United Kingdom in every quarter |",
  "| `treated` | integer | 1 for the United Kingdom from 2016Q3 onward (the headline treatment date) |",
  "",
  "### The donor pool",
  "",
  "Twelve of the original 36 countries are dropped because at least one stored",
  "series is incomplete over the window: Chile, Czech Republic, Denmark, Estonia,",
  "Greece, Israel, Latvia, Lithuania, Mexico, Poland, Slovenia, Turkey. This",
  "reproduces the donor pool of Born et al. (2019). Note that Czech Republic,",
  "Estonia and Israel are excluded only because of a gap in the inflation series,",
  "which no specification in the paper actually uses.",
  "",
  "The 24 that remain are Australia, Austria, Belgium, Canada, Finland, France,",
  "Germany, Hungary, Iceland, Ireland, Italy, Japan, Korea, Luxembourg,",
  "Netherlands, New Zealand, Norway, Portugal, Slovak Republic, Spain, Sweden,",
  "Switzerland, **United Kingdom** (treated) and United States. That leaves 23",
  "donors.",
  "",
  "### Key dates",
  "",
  "| Event | `quarter_label` | `date_dec` | `t` |",
  "|---|---|---|---|",
  "| Sample start | 1995Q1 | 1995.00 | 1 |",
  "| Last pre-treatment quarter, 2016Q2 specification | 2016Q1 | 2016.00 | 85 |",
  "| Treatment quarter, 2016Q2 specification | 2016Q2 | 2016.25 | 86 |",
  "| Treatment quarter, 2016Q3 specification (headline) | 2016Q3 | 2016.50 | 87 |",
  "| First evaluation quarter | 2018Q4 | 2018.75 | 96 |",
  "| Second evaluation quarter | 2019Q4 | 2019.75 | 100 |",
  "| Sample end | 2020Q4 | 2020.75 | 104 |",
  "",
  "The referendum was held on 23 June 2016, at the very end of 2016Q2. The paper",
  "dates treatment by the quarter in which the effect materialises, and reports",
  "both 2016Q2 and 2016Q3 because the timing is genuinely ambiguous and because",
  "anticipation cannot be ruled out.",
  "",
  "## `brexit_panel_long.csv` — the full tidy panel",
  "",
  "All 36 countries, 1960Q1-2020Q4, twelve underlying concepts in long format",
  "(`country`, `year`, `quarter`, `quarter_label`, `date_dec`, `variable`,",
  "`value`), with missing values dropped. Use it to rebuild a different donor",
  "pool, outcome transform or window.",
  "",
  "Variables: `real_gdp` (index, 1995 average = 1), `real_gdp_raw`,",
  "`real_con_raw`, `real_inv_raw`, `real_exp_raw`, `real_imp_raw`,",
  "`real_gov_raw`, `tot_emp_raw`, `tot_emp_pc_raw`, `lab_prod_raw`,",
  "`unemp_rate_raw`, `pop_quarterly`. Series suffixed `_raw` are levels in",
  "national currency or persons; coverage before 1995 is uneven.",
  "",
  "## Licence and citation",
  "",
  "Please cite the original sources when using these files:",
  "",
  "> de Brabander, E., Juodis, A., & Miyazato Szini, G. (2025). On the use of",
  "> synthetic difference-in-differences approach with (-out) covariates: The case",
  "> study of Brexit referendum. *Econometric Reviews*, 44(10), 1617-1646.",
  "",
  "> Born, B., Muller, G. J., Schularick, M., & Sedlacek, P. (2019). The costs of",
  "> economic nationalism: Evidence from the Brexit experiment. *The Economic",
  "> Journal*, 129(623), 2722-2744."
), file.path("data", "README.md"))
cat("  data/README.md written\n")

cat("\n=== Script completed successfully ===\n")
