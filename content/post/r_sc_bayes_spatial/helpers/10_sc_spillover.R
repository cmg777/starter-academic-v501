#' @export
sc_spillover <- function(
  data,
  treated_unit,
  T0 = NULL,
  w,
  W,
  X = NULL,
  p_factors = 1,
  M = 2000,
  burn = 1000,
  seed = 123,
  verbose = TRUE,
  y = "y",
  unit_col = "unit",
  time_col = "time",
  treatment_dummy,
  step_rho = 0.05
) {
  stopifnot(is.data.frame(data))
  if (!is.character(y)) {
    y <- as.character(substitute(y))
  }

  required_cols <- c(unit_col, time_col, y, treatment_dummy)
  if (!all(required_cols %in% names(data))) {
    stop(sprintf(
      "Required columns missing in data: %s",
      paste0(required_cols, collapse = ", ")
    ))
  }
  set.seed(seed)

  times <- sort(unique(data[[time_col]]))
  treat_series <- data[
    data[[unit_col]] == treated_unit,
    c(time_col, treatment_dummy)
  ]
  t_start <- min(treat_series[[time_col]][treat_series[[treatment_dummy]] == 1])
  T0 <- if (is.null(T0)) sum(times < t_start) else as.integer(T0)

  prep <- scspill_prep_X(
    data,
    treated_unit = treated_unit,
    T0 = T0,
    X = X,
    y_col = y,
    unit_col = unit_col,
    time_col = time_col
  )

  W_use <- row_normalize(W)
  w_use <- as.numeric(w)
  wsum <- sum(w_use)
  if (is.finite(wsum) && wsum > 1e-12) {
    w_use <- w_use / wsum
  }
  Y0_pre <- prep$Y0_pre
  Yc_pre <- prep$Yc_pre
  Y0_post <- prep$Y0_post
  Yc_post <- prep$Yc_post
  Xc_pre <- prep$Xc_pre

  N <- ncol(Yc_pre)
  T1 <- nrow(Yc_post)

  if (verbose) {
    message("[Step 1] Sampling alpha via BSCM (horseshoe prior)...")
  }
  alpha_draws <- hs_alpha_gibbs_cpp(
    Y0_pre = Y0_pre,
    control_outcome_pre = Yc_pre,
    iteration = M,
    burn = burn,
    verbose = verbose
  )
  colnames(alpha_draws) <- colnames(Yc_pre)
  alpha_hat <- colMeans(alpha_draws)

  if (verbose) {
    message("[Step 2] Sampling rho (and others) with fixed alpha_hat...")
  }

  K <- 0L
  Xvec <- NULL
  if (!is.null(Xc_pre)) {
    if (is.array(Xc_pre) && length(dim(Xc_pre)) == 3L) {
      K <- dim(Xc_pre)[3]
      stopifnot(dim(Xc_pre)[1] == T0, dim(Xc_pre)[2] == N)
      Xvec <- as.numeric(aperm(Xc_pre, c(1, 2, 3)))
    } else {
      Xvec <- as.numeric(Xc_pre)
      Ktmp <- length(Xvec) / (T0 * N)
      if (abs(Ktmp - round(Ktmp)) > 1e-8) {
        stop("Xc_pre dimensions do not match (T0*N*K).")
      }
      K <- as.integer(round(Ktmp))
    }
  }

  sar <- sar_full_sampler_cpp_step2(
    Yc_pre = Yc_pre,
    alpha_hat_in = alpha_hat,
    Xc_pre_ = if (!is.null(Xvec)) Xvec else R_NilValue,
    T0 = T0,
    N = N,
    K = K,
    p = as.integer(p_factors),
    w = w_use,
    W = as.matrix(W_use),
    iteration = M,
    burn = burn,
    step_rho = step_rho,
    a0 = 1.0,
    b0 = 1.0,
    verbose = verbose
  )

  rho_draws <- as.numeric(sar$rho)
  rho_hat <- mean(rho_draws)

  IN <- diag(N)
  A_base <- W_use + w_use %*% t(alpha_hat)
  Yc_pre_t <- t(Yc_pre)
  Yc_post_t <- t(Yc_post)
  w_pre <- w_use %o% Y0_pre
  w_post <- w_use %o% Y0_post

  compute_cf_and_spill <- function(rho) {
    M_obs_inv <- solve(IN - rho * A_base)
    B <- (IN - rho * W_use)
    Yc_pre_cf <- M_obs_inv %*% (B %*% Yc_pre_t - rho * w_pre)
    Yc_post_cf <- M_obs_inv %*% (B %*% Yc_post_t - rho * w_post)

    ycf_post <- as.numeric(crossprod(alpha_hat, Yc_post_cf))
    spill_mat <- rbind(
      t(Yc_pre_t - Yc_pre_cf),
      t(Yc_post_t - Yc_post_cf)
    )
    list(ycf_post = ycf_post, spill = spill_mat)
  }

  point_eval <- compute_cf_and_spill(rho_hat)
  ycf_point <- point_eval$ycf_post
  te_point <- as.numeric(Y0_post - ycf_point)
  ate_point <- mean(te_point)

  n_rho <- length(rho_draws)
  if (n_rho < 1L) {
    stop("rho_draws is empty; increase M or reduce burn.")
  }
  spill_sum <- matrix(0, nrow = T0 + T1, ncol = N)
  ate_draws <- numeric(n_rho)
  for (i in seq_len(n_rho)) {
    eval_i <- compute_cf_and_spill(rho_draws[i])
    spill_sum <- spill_sum + eval_i$spill
    ate_draws[i] <- mean(Y0_post - eval_i$ycf_post)
  }
  spill_mean_matrix <- spill_sum / n_rho
  colnames(spill_mean_matrix) <- colnames(Yc_post)
  rownames(spill_mean_matrix) <- c(prep$times_pre, prep$times_post)

  ate_ci95 <- stats::quantile(
    ate_draws,
    c(0.025, 0.975),
    names = FALSE
  )

  eff <- list(
    te_point = te_point,
    ate_point = ate_point,
    ate_ci95 = ate_ci95,
    spill = spill_mean_matrix
  )

  inputs <- list(
    Y0_pre = Y0_pre,
    Y0_post = Y0_post,
    Yc_pre = Yc_pre,
    Yc_post = Yc_post,
    times_pre = prep$times_pre,
    times_post = prep$times_post,
    units = prep$units,
    w = as.matrix(w_use),
    W = as.matrix(W_use)
  )

  structure(
    list(
      alpha_draws = alpha_draws,
      rho_draws = rho_draws,
      alpha_hat = alpha_hat,
      rho_hat = rho_hat,
      effects = eff,
      inputs = inputs,
      sar = sar,
      T0 = T0
    ),
    class = "scspill"
  )
}

#' Row-normalize a spatial weights matrix W
#'
#' Ensures that the sum of each row is 1.
#' Sets the diagonal to 0 and handles rows that sum to 0.
#'
#' @param W A numeric matrix.
#' @param tol Tolerance for checking if a row sum is zero.
#' @param zero_policy How to handle rows that sum to zero (or are close to it).
#'   "keep" (default): leaves the row as all zeros.
#'   "uniform": (not implemented here, but common) sets to 1/N.
#' @return A row-normalized matrix.
#'
row_normalize <- function(W, tol = 1e-12, zero_policy = c("keep")) {
  zero_policy <- match.arg(zero_policy)

  if (!is.matrix(W) || !is.numeric(W)) {
    stop("W must be a numeric matrix.")
  }

  # Ensure diagonal is zero (no self-loops)
  diag(W) <- 0

  # Calculate row sums
  rs <- rowSums(W, na.rm = TRUE)

  # Find rows that are not zero (or very close to it)
  nz <- rs > tol

  # Normalize non-zero rows
  if (any(nz)) {
    W[nz, ] <- W[nz, , drop = FALSE] / rs[nz]
  }

  # Handle zero-sum rows (if any)
  if (any(!nz)) {
    if (zero_policy == "keep") {
      # Do nothing, leave the row as all zeros
      W[!nz, ] <- 0 # Ensure it's clean
    }
  }

  W
}
