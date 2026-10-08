#' Full SAR MCMC (joint over rho & alpha, + optional covariates/factors)
#' @keywords internal
sar_gibbs_sampler <- function(
  Y0_pre,
  Yc_pre,
  Xc_pre,
  W,
  w,
  M = 2000,
  burn = 1000,
  verbose = TRUE,
  p_factors = 0,
  step_rho = 0.01,
  step_alpha = 0.01,
  a0 = 1,
  b0 = 1
) {
  Yc_pre <- as.matrix(Yc_pre)
  storage.mode(Yc_pre) <- "double"
  Y0_pre <- as.numeric(Y0_pre)
  W <- as.matrix(W)
  storage.mode(W) <- "double"
  w <- as.numeric(w)

  T0 <- nrow(Yc_pre)
  N <- ncol(Yc_pre)

  if (!is.null(Xc_pre)) {
    if (length(dim(Xc_pre)) != 3L) {
      stop("Xc_pre must be T0 x N x K array or NULL.")
    }
    if (dim(Xc_pre)[1] != T0 || dim(Xc_pre)[2] != N) {
      stop("Xc_pre dims mismatch.")
    }
    K <- dim(Xc_pre)[3]
    Xvec <- as.numeric(aperm(Xc_pre, c(1, 2, 3)))
  } else {
    K <- 0L
    Xvec <- numeric()
  }
  p <- as.integer(max(0, p_factors))

  out <- sar_full_sampler_cpp(
    Y0_pre,
    Yc_pre,
    if (K > 0) Xvec else NULL,
    T0,
    N,
    K,
    p,
    w,
    W,
    M,
    burn,
    step_rho,
    step_alpha,
    a0,
    b0,
    verbose
  )

  list(
    rho = out$rho, # length M
    alpha = out$alpha, # M x N
    beta = if (K > 0) out$beta else NULL,
    sigma2 = out$sigma2,
    Lambda = if (p > 0) out$Lambda else NULL, # N x p x M
    F = if (p > 0) out$F else NULL, # p x T0 x M
    acc_rate = list(
      rho = out$acc_rho,
      alpha = out$acc_alpha
    )
  )
}

#' @keywords internal
.rhat_basic <- function(ch_list_num) {
  # ch_list_num: list of numeric vectors (draws for each chain)
  m <- length(ch_list_num)
  stopifnot(m >= 2)
  n <- min(vapply(ch_list_num, length, 1L))
  xs <- lapply(ch_list_num, function(v) v[seq_len(n)])
  # split
  split <- list()
  for (j in seq_len(m)) {
    n2 <- n %/% 2
    split[[length(split) + 1L]] <- xs[[j]][1:n2]
    split[[length(split) + 1L]] <- xs[[j]][(n2 + 1):(2L * n2)]
  }
  M <- length(split)
  N <- length(split[[1]])
  means <- vapply(split, mean, 0.0)
  W <- mean(vapply(split, var, 0.0))
  B <- N * var(means)
  var_plus <- (N - 1) / N * W + B / N
  sqrt(var_plus / W)
}

#' @keywords internal
run_sar_step2 <- function(
  Yc_pre,
  alpha_hat,
  W,
  w,
  Xc_pre = NULL,
  K = 0,
  p = 0,
  iter = 20000,
  burn = 10000,
  chains = 3,
  seeds = NULL,
  step_rho = 0.02,
  a0 = 1.0,
  b0 = 1.0,
  keep_draws = FALSE,
  verbose = FALSE
) {
  stopifnot(
    is.matrix(Yc_pre),
    is.matrix(W),
    is.numeric(w),
    is.numeric(alpha_hat)
  )
  T0 <- nrow(Yc_pre)
  N <- ncol(Yc_pre)
  stopifnot(length(w) == N, length(alpha_hat) == N, nrow(W) == N, ncol(W) == N)

  # X handling: C++ expects (T0*N*K) NumericVector
  if (is.null(Xc_pre) || K <= 0) {
    Xvec <- NULL
    K <- 0L
  } else {
    # if Xc_pre is array(T0,N,K), flatten it
    if (length(dim(Xc_pre)) == 3L) {
      stopifnot(dim(Xc_pre)[1] == T0, dim(Xc_pre)[2] == N, dim(Xc_pre)[3] == K)
      Xvec <- as.numeric(aperm(Xc_pre, c(1, 2, 3)))
    } else {
      # if already (T0*N*K) vector, check length only
      stopifnot(length(Xc_pre) == T0 * N * K)
      Xvec <- as.numeric(Xc_pre)
    }
  }

  if (is.null(seeds)) {
    seeds <- sample.int(.Machine$integer.max, chains)
  }

  rho_list <- vector("list", chains)
  s2_list <- vector("list", chains)
  acc_rho <- numeric(chains)

  for (m in seq_len(chains)) {
    set.seed(seeds[m])
    fit <- sar_full_sampler_cpp_step2(
      Yc_pre = Yc_pre,
      alpha_hat_in = alpha_hat,
      Xc_pre_ = if (K > 0) Xvec else R_NilValue,
      T0 = T0,
      N = N,
      K = K,
      p = p,
      w_in = as.numeric(w),
      W = W,
      iteration = iter,
      burn = burn,
      step_rho = step_rho,
      a0 = a0,
      b0 = b0,
      verbose = verbose
    )
    rho_list[[m]] <- as.numeric(fit$rho)
    s2_list[[m]] <- as.numeric(fit$sigma2)
    acc_rho[m] <- as.numeric(fit$acc_rho)
  }

  rho_all <- unlist(rho_list, use.names = FALSE)
  s2_all <- unlist(s2_list, use.names = FALSE)

  rho_summary <- c(
    mean = mean(rho_all),
    q025 = as.numeric(quantile(rho_all, 0.025, names = FALSE, type = 8)),
    q975 = as.numeric(quantile(rho_all, 0.975, names = FALSE, type = 8)),
    rhat = .rhat_basic(rho_list)
  )
  s2_summary <- c(
    mean = mean(s2_all),
    q025 = as.numeric(quantile(s2_all, 0.025, names = FALSE, type = 8)),
    q975 = as.numeric(quantile(s2_all, 0.975, names = FALSE, type = 8)),
    rhat = .rhat_basic(s2_list)
  )

  out <- list(
    rho_summary = rho_summary,
    sigma2_summary = s2_summary,
    acc_rho_mean = mean(acc_rho),
    acc_rho_by_chain = acc_rho
  )
  if (keep_draws) {
    out$draws <- list(rho = rho_list, sigma2 = s2_list)
  }
  out
}
