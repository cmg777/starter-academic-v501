#' Prepare Y matrices from long panel
#' @keywords internal
scspill_prep <- function(data, treated_unit, T0) {
  stopifnot(all(c("unit", "time", "y") %in% names(data)))
  d <- data[order(data$time, data$unit), ]
  units <- sort(unique(d$unit))
  controls <- setdiff(units, treated_unit)
  T <- length(unique(d$time))
  times <- sort(unique(d$time))
  N <- length(controls)

  Ywide <- reshape(d[, c("time", "unit", "y")], direction = "wide",
                   idvar = "time", timevar = "unit")
  Ywide <- Ywide[order(Ywide$time), ]
  Y <- as.matrix(Ywide[,-1])
  colnames(Y) <- sub("y\\.", "", colnames(Y))
  idx0 <- which(colnames(Y) == as.character(treated_unit))
  idxc <- setdiff(seq_len(ncol(Y)), idx0)

  Y0 <- Y[, idx0]
  Yc <- Y[, idxc, drop = FALSE]

  list(Y0_pre = Y0[1:T0],
       Yc_pre = Yc[1:T0, , drop = FALSE],
       Y0_post = Y0[(T0+1):T],
       Yc_post = Yc[(T0+1):T, , drop = FALSE],
       units = list(treated = treated_unit, controls = colnames(Y)[idxc]),
       times = times)
}