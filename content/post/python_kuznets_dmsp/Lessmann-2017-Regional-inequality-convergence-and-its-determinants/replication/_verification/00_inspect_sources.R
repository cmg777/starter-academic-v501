# ============================================================================
# 00_inspect_sources.R
# Ground-truth inspection of every source .dta used by the replication.
# Prints, for each file: nrow, ncol, and a (name | type | label) table.
# Output is written to _verification/source_metadata.txt for reference.
# READ-ONLY on the source data.
# ============================================================================
suppressMessages({
  library(haven)
})

repo <- "/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants"
data_dir <- file.path(repo, "Data")

sink(file.path(repo, "replication/_verification/source_metadata.txt"))

describe_dta <- function(path, n_max = Inf) {
  cat("\n\n=====================================================================\n")
  cat("FILE:", basename(path), "\n")
  cat("=====================================================================\n")
  if (!file.exists(path)) { cat("  !! NOT FOUND\n"); return(invisible()) }
  d <- tryCatch(read_dta(path, n_max = n_max), error = function(e) { cat("ERROR:", conditionMessage(e), "\n"); NULL })
  if (is.null(d)) return(invisible())
  cat(sprintf("nrow(read)= %d   ncol= %d\n", nrow(d), ncol(d)))
  labs <- vapply(d, function(x) { l <- attr(x, "label"); if (is.null(l)) "" else paste(as.character(l), collapse = " ") }, character(1))
  typs <- vapply(d, function(x) class(x)[1], character(1))
  tab <- data.frame(name = names(d), type = typs, label = labs, row.names = NULL)
  print(tab, right = FALSE, max = 10000)
}

# Small/medium files: read fully
for (f in c("Prediction_Data.dta", "pred_GDP_pc_Region_G.dta", "Main_Data.dta",
            "Country_DATA.dta", "Inequality_Data.dta", "NODATA.dta", "NODATA_2.dta",
            "prediction_coefficients.dta")) {
  describe_dta(file.path(data_dir, f))
}

# Large files: metadata + first rows only
for (f in c("pred_GDP_pc_Region.dta", "Regional_Data_SL.dta")) {
  describe_dta(file.path(data_dir, f), n_max = 5)
}

sink()
cat("DONE. Wrote replication/_verification/source_metadata.txt\n")
