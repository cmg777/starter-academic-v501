#' Horseshoe-Gibbs for synthetic weights alpha
#' @keywords internal
hs_alpha_gibbs <- function(y, X, M = 2000, burn = 1000, verbose = TRUE) {
  y <- as.numeric(y)
  X <- as.matrix(X)
  storage.mode(X) <- "double"
  draws <- hs_alpha_gibbs_cpp(y, X, M, burn, verbose)
  colnames(draws) <- paste0("alpha_", seq_len(ncol(X)))
  list(alpha = draws)
}

.rhat_split_vec <- function(chains_list) {
  # chains_list: list of matrices (draws x dim), same number of rows preferred
  m <- length(chains_list)
  stopifnot(m >= 2)
  n <- min(vapply(chains_list, nrow, 1L))
  chains <- lapply(chains_list, function(a) a[seq_len(n), , drop = FALSE])

  # split
  split_chains <- list()
  for (j in seq_len(m)) {
    a <- chains[[j]]
    n2 <- n %/% 2
    split_chains[[length(split_chains) + 1L]] <- a[1:n2, , drop = FALSE]
    split_chains[[length(split_chains) + 1L]] <- a[
      (n2 + 1):(2L * n2),
      ,
      drop = FALSE
    ]
  }
  M <- length(split_chains) # 2m
  N <- n %/% 2 # n/2
  D <- ncol(split_chains[[1]])

  out <- numeric(D)
  for (d in seq_len(D)) {
    means <- vapply(split_chains, function(a) mean(a[, d]), 0.0)
    W <- mean(vapply(split_chains, function(a) var(a[, d]), 0.0))
    B <- N * var(means)
    var_plus <- (N - 1) / N * W + B / N
    out[d] <- sqrt(var_plus / W)
  }
  out
}

#' @keywords internal
run_alpha_step1 <- function(
  Y0_pre,
  Yc_pre,
  iter = 20000,
  burn = 10000,
  chains = 3,
  seeds = NULL,
  a0 = 1.0,
  b0 = 1.0,
  keep_draws = FALSE,
  verbose = FALSE
) {
  stopifnot(is.matrix(Yc_pre), is.numeric(Y0_pre))
  T0 <- nrow(Yc_pre)
  N <- ncol(Yc_pre)
  stopifnot(length(Y0_pre) == T0)

  if (is.null(seeds)) {
    seeds <- sample.int(.Machine$integer.max, chains)
  }

  chain_draws <- vector("list", chains)
  for (m in seq_len(chains)) {
    set.seed(seeds[m])
    chain_draws[[m]] <- hs_alpha_gibbs_cpp(
      Y0_pre = Y0_pre,
      control_outcome_pre = Yc_pre,
      iteration = iter,
      burn = burn,
      verbose = verbose
    )
  }

  draws_all <- do.call(rbind, chain_draws)
  alpha_hat <- colMeans(draws_all)

  rhat <- .rhat_split_vec(chain_draws)
  diag_tab <- data.frame(
    param = paste0("alpha[", seq_len(N), "]"),
    mean = colMeans(draws_all),
    sd = apply(draws_all, 2, sd),
    rhat = rhat,
    stringsAsFactors = FALSE
  )

  out <- list(
    alpha_hat = alpha_hat,
    diagnostics = diag_tab
  )
  if (keep_draws) {
    out$draws <- chain_draws
  }
  out
}
