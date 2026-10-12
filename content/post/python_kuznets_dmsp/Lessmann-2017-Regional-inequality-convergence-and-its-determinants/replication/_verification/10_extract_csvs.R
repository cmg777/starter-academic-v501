# ============================================================================
# 10_extract_csvs.R
# ----------------------------------------------------------------------------
# Build the SELF-CONTAINED, TRIMMED data for every replication folder.
#
# For each table/figure folder we keep ONLY the variables that the folder's
# Stata .do file needs, export them to CSV (an open, Stata-readable format via
# `import delimited`), and write a `data_dictionary.csv` (variable | label |
# stata_type) harvested from the original .dta variable labels (haven).
#
# Design note (future nighttime-lights extension): we ship the *panel* (pre-
# collapse) trimmed to needed columns, and let each .do file perform the
# filtering / collapsing itself. That keeps the data transformations visible
# and pedagogical, and means a new lights dataset only changes the inputs, not
# the per-figure logic.
#
# READ-ONLY on the source .dta files. Writes only inside replication/.
# ============================================================================

suppressMessages({
  library(haven)
  library(readr)
})

repo  <- "/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants"
src   <- file.path(repo, "Data")
rep   <- file.path(repo, "replication")

# ---- helpers ---------------------------------------------------------------

# Read a source .dta once (cache in an environment to avoid re-reading).
.cache <- new.env()
read_src <- function(fname, n_max = Inf) {
  key <- paste0(fname, "_", n_max)
  if (!is.null(.cache[[key]])) return(.cache[[key]])
  d <- read_dta(file.path(src, fname), n_max = n_max)
  .cache[[key]] <- d
  d
}

stata_type <- function(x) if (is.character(x)) "string" else "numeric"
lab_of     <- function(x) { l <- attr(x, "label"); if (is.null(l)) "" else paste(as.character(l), collapse = " ") }

# Write a trimmed CSV + a data_dictionary.csv for one folder.
# - df       : source data.frame (haven tibble, carries labels)
# - cols     : character vector of columns to keep (in order)
# - folder   : folder name under replication/
# - csv_name : output csv file name (in <folder>/data/)
emit <- function(df, cols, folder, csv_name) {
  miss <- setdiff(cols, names(df))
  if (length(miss)) stop(sprintf("[%s] missing cols: %s", folder, paste(miss, collapse = ", ")))
  sub <- df[, cols, drop = FALSE]

  # Build the dictionary from the *labelled* source BEFORE zapping labels.
  dict <- data.frame(
    variable   = cols,
    label      = vapply(sub, lab_of, character(1)),
    stata_type = vapply(sub, stata_type, character(1)),
    row.names  = NULL, stringsAsFactors = FALSE
  )

  # Zap haven labels so CSV holds plain values that Stata imports cleanly.
  sub <- haven::zap_labels(sub)
  sub <- haven::zap_formats(sub)

  # Strip the leading underscore from names like `_satyear_1` so Stata's
  # `import delimited` keeps them verbatim (leading underscores are reserved in
  # Stata). `_satyear_k` -> `satyear_k`; the .do files and dictionaries use the
  # stripped name. No other columns have leading underscores.
  names(sub)   <- sub("^_", "", names(sub))
  dict$variable <- sub("^_", "", dict$variable)

  ddir <- file.path(rep, folder, "data")
  dir.create(ddir, recursive = TRUE, showWarnings = FALSE)
  csv_path  <- file.path(ddir, csv_name)
  dict_path <- file.path(rep, folder, "data_dictionary.csv")

  write_csv(sub, csv_path, na = "")
  write_csv(dict, dict_path, na = "")

  sz <- file.info(csv_path)$size
  cat(sprintf("  %-12s %-34s  rows=%-7d cols=%-3d  %6.1f KB\n",
              folder, csv_name, nrow(sub), ncol(sub), sz / 1024))
  invisible(dict)
}

cat("============================================================\n")
cat("EXTRACTING TRIMMED CSVs\n")
cat("============================================================\n")

# ---------------------------------------------------------------------------
# SOURCE: Prediction_Data.dta  (GDP-subsample; Tables 1 & B.4)
# ---------------------------------------------------------------------------
PD <- read_src("Prediction_Data.dta")

# Table 1 needs: outcome, lights, the col-7 controls, the country-group dummies,
# the satellite-generation dummies, the stored 81 country dummies (country FE in
# cols 3-4), and the region id (region FE in col 2 via `xi i.code_Coutry_Region`).
t1_cols <- c("code_Coutry_Region","Country_ISO","year",
             "log_GDP_pc_Region","log_Light_ppix_Region","log_GDP_pc_Country",
             "log_N_pix_top_cod_1_ppix","log_N_pix_low_cod_1_ppix",
             "log_area","log_region","log_region_X_log_area",
             "eap","eca","lac","mena","sa","ssa",
             paste0("_satyear_", 1:7),
             paste0("country_dum", 1:81))
emit(PD, t1_cols, "Table_1", "Table_1_data.csv")

# Table B.4 needs the region-FE spec + coordinates (for Conley spatial-HAC).
tb4_cols <- c("code_Coutry_Region","Country_ISO","year","Latitude","Longitude",
              "log_GDP_pc_Region","log_Light_ppix_Region", paste0("_satyear_", 1:7))
emit(PD, tb4_cols, "Table_B4", "Table_B4_data.csv")

# ---------------------------------------------------------------------------
# SOURCE: pred_GDP_pc_Region_G.dta  (GDP-subsample WITH predictions; Table 2, Figs A.1-A.3)
# ---------------------------------------------------------------------------
PG <- read_src("pred_GDP_pc_Region_G.dta")

# Table 2: predicted vs observed vs light, per country-year (then collapse+pwcorr).
t2_cols <- c("Country_ISO","year","pred_GDP_pc_Region","GDP_pc_Region",
             "Light_Region","Light_Country","Pop_Region","Pop_Country")
emit(PG, t2_cols, "Table_2", "Table_2_data.csv")

# Figure A.1 (income tier) & A.2 (output density): regional pred vs obs, 2001-2010.
fa12_cols <- c("code_Coutry_Region","Region_NAME","Country_ISO","year",
               "GDP_pc_Country","GDP_pc_Region","log_GDP_pc_Region",
               "pred_log_GDP_pc_Region","pred_GDP_pc_Region","Pix_Region","Pop_Region")
emit(PG, fa12_cols, "Figure_A1", "Figure_A1_data.csv")
emit(PG, fa12_cols, "Figure_A2", "Figure_A2_data.csv")

# Figure A.3: USA 2010 regions, by Regional Price Parity.
fa3_cols <- c("Region_NAME","Country_ISO","year",
              "log_GDP_pc_Region","pred_log_GDP_pc_Region","RPP")
emit(PG, fa3_cols, "Figure_A3", "Figure_A3_data.csv")

# ---------------------------------------------------------------------------
# SOURCE: Main_Data.dta  (country-year panel; Tables 3-4, Figs 2,3,4,5,A.4,B.3)
# ---------------------------------------------------------------------------
MD <- read_src("Main_Data.dta")

# Table 3: Kuznets curve across 5 inequality measures.
t3_cols <- c("Country_NAME","Country_ISO","year","GDP_pc_Country",
             "GINIW_pred_GDP_pc","COVW_pred_GDP_pc","GE_1W_pred_GDP_pc",
             "GE_0W_pred_GDP_pc","GE_m1W_pred_GDP_pc")
emit(MD, t3_cols, "Table_3", "Table_3_data.csv")

# Table 4: determinants with controls (5 reproducible columns + Polity2/fed for teaching).
t4_cols <- c("Country_NAME","Country_ISO","year","GINIW_pred_GDP_pc",
             "GDP_pc_Country","Pop_Country","Resources_rents_share_of_GDP",
             "Arable_land","Trade_GDP_share","FDI_share_of_GDP","area",
             "price_gasoline","Aid","School_enrollment_secondary",
             "GINIW_Eth_light","Polity2","fedelupd2")
emit(MD, t4_cols, "Table_4", "Table_4_data.csv")

# Figure 2: GINIW choropleth (country means).  Ship the panel; .do collapses.
emit(MD, c("Country_ISO","year","GINIW_pred_GDP_pc"), "Figure_2", "Figure_2_data.csv")

# Figure 3: change in GINIW between two periods.  Needs the full panel.
emit(MD, c("Country_ISO","year","GINIW_pred_GDP_pc"), "Figure_3", "Figure_3_data.csv")

# Figure 4: Kuznets partial-residual scatter (recompute FE regression).
emit(MD, c("Country_ISO","Country_NAME","year","GINIW_pred_GDP_pc","GDP_pc_Country"),
     "Figure_4", "Figure_4_data.csv")

# Figure 5a: interregional vs interpersonal inequality.
emit(MD, c("Country_ISO","Country_NAME","year","GINIW_pred_GDP_pc","Giniall"),
     "Figure_5", "Figure_5_data.csv")

# Figure A.4: national predicted vs observed GDP p.c.
emit(MD, c("Country_ISO","year","GDP_pc_Country","pred_GDP_pc_Country","GDP_pc_Country_G"),
     "Figure_A4", "Figure_A4_data.csv")

# Figure B.3: Germany GINIW time series.
emit(MD, c("Country_ISO","year","GINIW_pred_GDP_pc"), "Figure_B3", "Figure_B3_data.csv")

# ---------------------------------------------------------------------------
# SOURCE: pred_GDP_pc_Region.dta  (WORLD predictions; Figs 1 & B.1) -- LARGE
# ---------------------------------------------------------------------------
PR <- read_src("pred_GDP_pc_Region.dta")
f1_cols <- c("Region_ISO","year","ssa","pred_GDP_pc_Region","pred_GDP_pc_Country")
emit(PR, f1_cols, "Figure_1",  "Figure_1_region_income.csv")
emit(PR, f1_cols, "Figure_B1", "Figure_B1_region_income.csv")

# ---------------------------------------------------------------------------
# SOURCE: pipeline raw inputs (00_Main_Dataset) -- training, world, country
# ---------------------------------------------------------------------------
# Training set (estimate lights->GDP coefficients): keep the regression vars +
# ids + population for aggregation.
train_cols <- c("Region_NAME","Country_NAME","Country_ISO","id_t_j",
                "code_Coutry_Region","year","Pop_Region","Pop_Country",
                "GDP_pc_Region","log_GDP_pc_Region","log_Light_ppix_Region",
                "log_GDP_pc_Country","log_N_pix_top_cod_1_ppix","log_N_pix_low_cod_1_ppix",
                "log_area","log_region","log_region_X_log_area",
                "eap","eca","lac","mena","sa","ssa", paste0("_satyear_", 1:7))
emit(PD, train_cols, "00_Main_Dataset", "Prediction_Data.csv")

# Country-level controls (merged in at the end of the pipeline).
CD <- read_src("Country_DATA.dta")
emit(CD, names(CD), "00_Main_Dataset", "Country_DATA.csv")

# World region panel (apply coefficients to predict GDP everywhere). LARGE.
RW <- read_src("Regional_Data_SL.dta")
emit(RW, names(RW), "00_Main_Dataset", "Regional_Data_SL.csv")

cat("\nDONE extracting CSVs.\n")
