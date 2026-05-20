# ══════════════════════════════════════════════════════════════════
# prepare_data.R
#
# One-time conversion script: reads the Matlab .mat files shipped with
# the Fitzgerald, Lattimore, Robinson & Zhu (2026) replication package
# and writes CSV equivalents under content/post/r_double_lasso/data/.
#
# WHY a separate file? The references/ folder is gitignored, so the
# main analysis.R cannot depend on it at runtime. This script reads
# the Matlab .mat files locally and emits portable CSVs which ARE
# committed to GitHub. From that point on, analysis.R loads the CSVs
# directly from the GitHub raw URL — no Matlab dependency required.
#
# Run once, then commit the data/ subfolder. Re-run only if the source
# .mat files change.
#
# Usage:   Rscript prepare_data.R
# Inputs:  references/Empirical example data and variables/LevittApplication/
#            State.mat, linear.mat, ML.mat, MLout.mat, Dk.mat
# Outputs: data/levitt_state.csv
#          data/levitt_linear.csv
#          data/levitt_partialled.csv
#          data/levitt_controls_viol.csv
#          data/levitt_controls_prop.csv
#          data/levitt_controls_murd.csv
#          data/levitt_control_names.csv
# ══════════════════════════════════════════════════════════════════

required_packages <- c("R.matlab")
missing <- required_packages[!sapply(required_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}
suppressMessages(library(R.matlab))

# Resolve paths relative to this script's location so it works from any cwd.
script_dir <- tryCatch(
  dirname(normalizePath(sys.frame(1)$ofile)),
  error = function(e) getwd()
)
ref_dir  <- file.path(script_dir, "references", "Empirical example data and variables", "LevittApplication")
data_dir <- file.path(script_dir, "data")
dir.create(data_dir, showWarnings = FALSE, recursive = TRUE)

cat("Reading .mat files from:\n  ", ref_dir, "\n\n")

state_mat  <- readMat(file.path(ref_dir, "State.mat"))
linear_mat <- readMat(file.path(ref_dir, "linear.mat"))
ml_mat     <- readMat(file.path(ref_dir, "ML.mat"))
mlout_mat  <- readMat(file.path(ref_dir, "MLout.mat"))
dk_mat     <- readMat(file.path(ref_dir, "Dk.mat"))

state_id <- as.integer(state_mat$Dstate[, 1])         # 576 cluster ids (1..48)
Dk       <- as.numeric(dk_mat$Dk[1, 1])               # scalar df adjustment

# linear.mat: each of the three is 576 × 2 with columns [Dy, Dx] (first-differenced).
linear_df <- data.frame(
  state = state_id,
  Dyv = linear_mat$linear.v[, 1], Dxv = linear_mat$linear.v[, 2],
  Dyp = linear_mat$linear.p[, 1], Dxp = linear_mat$linear.p[, 2],
  Dym = linear_mat$linear.m[, 1], Dxm = linear_mat$linear.m[, 2]
)

# MLout.mat: partialled-out treatment (Dx*) and outcome (Dy*) — time fixed
# effects already absorbed. These align with the control matrices in ML.mat.
partialled_df <- data.frame(
  state = state_id,
  DxV = mlout_mat$DxV[, 1], DyV = mlout_mat$DyV[, 1],
  DxP = mlout_mat$DxP[, 1], DyP = mlout_mat$DyP[, 1],
  DxM = mlout_mat$DxM[, 1], DyM = mlout_mat$DyM[, 1]
)

# ML.mat: three control matrices (one per outcome), each 576 × 284 after
# time-dummy partial-out and multicollinearity screening. Column names live
# in NameZv / NameZp / NameZm (nested lists of length-1 character cells).
flatten_names <- function(name_mat) as.character(unlist(name_mat))

name_viol <- flatten_names(ml_mat$NameZv)
name_prop <- flatten_names(ml_mat$NameZp)
name_murd <- flatten_names(ml_mat$NameZm)

stopifnot(length(name_viol) == ncol(ml_mat$Zv))
stopifnot(length(name_prop) == ncol(ml_mat$Zp))
stopifnot(length(name_murd) == ncol(ml_mat$Zm))

# read.csv tolerates duplicate / non-syntactic names if we round-trip via a
# data frame with check.names = FALSE — but we write the raw names here so
# downstream code can do its own renaming.
make_control_df <- function(Z, nms) {
  df <- as.data.frame(Z)
  colnames(df) <- nms
  df
}
ctrl_viol <- make_control_df(ml_mat$Zv, name_viol)
ctrl_prop <- make_control_df(ml_mat$Zp, name_prop)
ctrl_murd <- make_control_df(ml_mat$Zm, name_murd)

control_names_df <- data.frame(
  index = seq_len(284),
  viol  = name_viol,
  prop  = name_prop,
  murd  = name_murd
)

cat("Writing CSVs to:\n  ", data_dir, "\n\n")
write.csv(data.frame(state = state_id),
          file.path(data_dir, "levitt_state.csv"),
          row.names = FALSE)
write.csv(linear_df,
          file.path(data_dir, "levitt_linear.csv"),
          row.names = FALSE)
write.csv(partialled_df,
          file.path(data_dir, "levitt_partialled.csv"),
          row.names = FALSE)
write.csv(ctrl_viol,
          file.path(data_dir, "levitt_controls_viol.csv"),
          row.names = FALSE)
write.csv(ctrl_prop,
          file.path(data_dir, "levitt_controls_prop.csv"),
          row.names = FALSE)
write.csv(ctrl_murd,
          file.path(data_dir, "levitt_controls_murd.csv"),
          row.names = FALSE)
write.csv(control_names_df,
          file.path(data_dir, "levitt_control_names.csv"),
          row.names = FALSE)

cat("Summary:\n")
cat(sprintf("  levitt_state.csv          %4d x %2d\n",        nrow(state_mat$Dstate), 1))
cat(sprintf("  levitt_linear.csv         %4d x %2d\n",        nrow(linear_df),  ncol(linear_df)))
cat(sprintf("  levitt_partialled.csv     %4d x %2d\n",        nrow(partialled_df), ncol(partialled_df)))
cat(sprintf("  levitt_controls_viol.csv  %4d x %2d\n",        nrow(ctrl_viol), ncol(ctrl_viol)))
cat(sprintf("  levitt_controls_prop.csv  %4d x %2d\n",        nrow(ctrl_prop), ncol(ctrl_prop)))
cat(sprintf("  levitt_controls_murd.csv  %4d x %2d\n",        nrow(ctrl_murd), ncol(ctrl_murd)))
cat(sprintf("  levitt_control_names.csv  %4d x %2d\n",        nrow(control_names_df), ncol(control_names_df)))
cat(sprintf("\nClustered-SE df adjustment Dk = %s (kept for documentation)\n", Dk))

cat("\n=== prepare_data.R completed successfully ===\n")
