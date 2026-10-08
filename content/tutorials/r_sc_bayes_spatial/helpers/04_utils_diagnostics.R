#' scspill: Diagnostics (trace plots, multi-parameter)
#'
#' @param object scspill object
#' @param what   currently only "trace"
#' @param which_alpha  "all" for all alpha, character/integer vector for column selection, NULL defaults to "all"
#' @param top_n_alpha  number of top units to extract when which_alpha is NULL
#' @param which_beta   "all" for all beta, character/integer vector for column selection, NULL defaults to "all"
#' @param top_n_beta   number of top units to extract when which_beta is NULL
#' @export
diagnostics.scspill <- function(
  object,
  what = c("trace"),
  which_alpha = NULL,
  top_n_alpha = 6,
  which_beta = NULL,
  top_n_beta = 6
) {
  what <- match.arg(what)
  if (what != "trace") {
    stop("Currently only what='trace' is supported.")
  }

  # ------------ helpers ------------
  .safe_quant <- function(x, probs = c(0.025, 0.05, 0.5, 0.95, 0.975)) {
    stats::quantile(
      as.numeric(x),
      probs = probs,
      names = FALSE,
      type = 7,
      na.rm = TRUE
    )
  }
  .ess_acf <- function(x, max_lag = NULL) {
    x <- as.numeric(x)
    x <- x[is.finite(x)]
    n <- length(x)
    if (n < 10) {
      return(NA_real_)
    }
    if (is.null(max_lag)) {
      max_lag <- min(1000L, n - 1L)
    }
    ac <- tryCatch(
      stats::acf(x, type = "correlation", plot = FALSE, lag.max = max_lag)$acf[
        -1
      ],
      error = function(e) NULL
    )
    if (is.null(ac)) {
      return(NA_real_)
    }
    pos <- ac[ac > 0]
    tau <- if (length(pos) == 0) 1 else 1 + 2 * sum(pos)
    ess <- n / tau
    max(1.0, min(ess, n))
  }
  .rhat_split <- function(x, n_splits = 2L) {
    x <- as.numeric(x)
    x <- x[is.finite(x)]
    n <- length(x)
    if (n < 20) {
      return(NA_real_)
    }
    L <- floor(n / n_splits)
    if (L < 10) {
      return(NA_real_)
    }
    mat <- matrix(
      x[seq_len(L * n_splits)],
      nrow = L,
      ncol = n_splits,
      byrow = FALSE
    )
    chain_means <- colMeans(mat)
    W <- mean(apply(mat, 2, stats::var))
    B <- L * stats::var(chain_means)
    var_hat <- ((L - 1) / L) * W + (B / L)
    as.numeric(sqrt(var_hat / W))
  }
  .mcse_from_ess <- function(x, ess) {
    s <- stats::sd(as.numeric(x), na.rm = TRUE)
    if (!is.finite(ess) || ess <= 0) {
      return(NA_real_)
    }
    s / sqrt(ess)
  }
  .geweke_z <- function(x, frac1 = .1, frac2 = .5) {
    x <- as.numeric(x)
    n <- length(x)
    if (n < 30) {
      return(NA_real_)
    }
    nA <- max(5L, floor(n * frac1))
    nB <- max(5L, floor(n * frac2))
    A <- x[seq_len(nA)]
    B <- x[(n - nB + 1):n]
    sv <- function(y) {
      m <- length(y)
      ac <- tryCatch(
        stats::acf(
          y,
          type = "covariance",
          plot = FALSE,
          lag.max = min(1000, m - 1)
        )$acf,
        error = function(e) NULL
      )
      if (is.null(ac)) {
        return(stats::var(y))
      }
      g0 <- ac[1]
      if (length(ac) == 1) {
        return(g0)
      }
      s <- 0
      for (k in 2:length(ac)) {
        if (ac[k] <= 0) {
          break
        }
        w <- 1 - (k - 1) / length(ac)
        s <- s + 2 * w * ac[k]
      }
      max(1e-12, g0 + s)
    }
    (mean(A) - mean(B)) / sqrt(sv(A) / length(A) + sv(B) / length(B))
  }
  .get_units_control <- function(fit, n_cols) {
    uc <- tryCatch(fit$inputs$units$control, error = function(e) NULL)
    if (!is.null(uc)) {
      return(as.character(uc))
    }
    cn <- colnames(fit$inputs$Yc_post)
    if (is.null(cn)) {
      cn <- colnames(fit$inputs$Yc_pre)
    }
    if (!is.null(cn)) {
      return(as.character(cn))
    }
    paste0("unit_", seq_len(n_cols))
  }

  out_list_df <- list() # for plotting
  out_series <- list() # for diagnostics table

  # ----- rho -----
  if (!is.null(object$rho_draws)) {
    vals <- as.numeric(object$rho_draws)
    out_list_df[["rho"]] <- data.frame(
      iter = seq_along(vals),
      value = vals,
      series = "rho"
    )
    out_series[["rho"]] <- vals
  }

  # ----- alpha (all by default) -----
  if (!is.null(object$alpha_draws)) {
    unit_names <- .get_units_control(object, ncol(object$alpha_draws))
    if (
      is.character(which_alpha) &&
        length(which_alpha) == 1L &&
        which_alpha == "all"
    ) {
      sel <- seq_len(ncol(object$alpha_draws))
    } else if (is.character(which_alpha)) {
      m <- match(which_alpha, unit_names)
      if (anyNA(m)) {
        stop(
          "Unknown unit(s) in 'which_alpha': ",
          paste(which_alpha[is.na(m)], collapse = ", ")
        )
      }
      sel <- as.integer(m)
    } else if (is.numeric(which_alpha)) {
      sel <- as.integer(which_alpha)
      if (any(sel < 1 | sel > ncol(object$alpha_draws))) {
        stop("'which_alpha' indices out of range.")
      }
    } else {
      ah <- tryCatch(as.numeric(object$alpha_hat), error = function(e) NULL)
      if (is.null(ah)) {
        ah <- colMeans(object$alpha_draws)
      }
      sel <- head(order(-abs(ah)), n = min(top_n_alpha, length(ah)))
    }
    iters <- seq_len(nrow(object$alpha_draws))
    for (j in sel) {
      nm <- paste0("alpha[", unit_names[j], "]")
      vals <- as.numeric(object$alpha_draws[, j])
      out_list_df[[nm]] <- data.frame(iter = iters, value = vals, series = nm)
      out_series[[nm]] <- vals
    }
  }

  # ----- sigma2 / tau2 -----
  if (!is.null(object$sar) && !is.null(object$sar$sigma2)) {
    vals <- as.numeric(object$sar$sigma2)
    out_list_df[["sigma2"]] <- data.frame(
      iter = seq_along(vals),
      value = vals,
      series = "sigma2"
    )
    out_series[["sigma2"]] <- vals
  }
  if (!is.null(object$sar) && !is.null(object$sar$tau2_draws)) {
    vals <- as.numeric(object$sar$tau2_draws)
    out_list_df[["tau2"]] <- data.frame(
      iter = seq_along(vals),
      value = vals,
      series = "tau2"
    )
    out_series[["tau2"]] <- vals
  }

  # ----- beta (all by default) -----
  if (!is.null(object$sar) && !is.null(object$sar$beta)) {
    beta_draws <- object$sar$beta
    K <- ncol(beta_draws)
    beta_names <- colnames(beta_draws)
    if (is.null(beta_names)) {
      beta_names <- paste0("beta", seq_len(K))
    }

    if (is.null(which_beta)) {
      which_beta <- "all"
    }
    if (
      is.character(which_beta) &&
        length(which_beta) == 1L &&
        which_beta == "all"
    ) {
      selb <- seq_len(K)
    } else if (is.character(which_beta)) {
      mb <- match(which_beta, beta_names)
      if (anyNA(mb)) {
        stop(
          "Unknown name(s) in 'which_beta': ",
          paste(which_beta[is.na(mb)], collapse = ", ")
        )
      }
      selb <- as.integer(mb)
    } else if (is.numeric(which_beta)) {
      selb <- as.integer(which_beta)
      if (any(selb < 1 | selb > K)) stop("'which_beta' indices out of range.")
    } else {
      bm <- colMeans(beta_draws)
      selb <- head(order(-abs(bm)), n = min(top_n_beta, length(bm)))
    }

    iters <- seq_len(nrow(beta_draws))
    for (k in selb) {
      nm <- paste0("beta[", beta_names[k], "]")
      vals <- as.numeric(beta_draws[, k])
      out_list_df[[nm]] <- data.frame(iter = iters, value = vals, series = nm)
      out_series[[nm]] <- vals
    }
  }

  if (length(out_list_df) == 0L) {
    stop("No traceable parameters found in object.")
  }

  # ---- trace plot ----
  df <- do.call(rbind, out_list_df)
  p <- ggplot2::ggplot(df, ggplot2::aes(iter, value)) +
    ggplot2::geom_line(linewidth = 0.3) +
    ggplot2::facet_wrap(~series, scales = "free_y") +
    ggplot2::theme_minimal() +
    ggplot2::labs(
      x = "Iteration",
      y = "Value",
      title = "Trace plots (rho / alpha / beta / sigma2)"
    )

  # ---- summary table ----
  tab <- do.call(
    rbind,
    lapply(names(out_series), function(nm) {
      x <- out_series[[nm]]
      n <- length(x)
      qs <- .safe_quant(x)
      ess <- .ess_acf(x)
      mcse <- .mcse_from_ess(x, ess)
      act <- if (is.finite(ess)) n / ess else NA_real_
      rhat <- .rhat_split(x, 2L)
      gz <- .geweke_z(x)
      data.frame(
        parameter = nm,
        # n = n,
        mean = mean(x),
        sd = stats::sd(x),
        q025 = qs[1],
        # q05 = qs[2],
        q50 = qs[3],
        # q95 = qs[4],
        q975 = qs[5],
        ess = ess,
        # mcse = mcse,
        # act = act,
        rhat_split = rhat,
        # geweke_z = gz,
        row.names = NULL,
        check.names = FALSE
      )
    })
  )
  attr(p, "summary") <- tab
  p
}
