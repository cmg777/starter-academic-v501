`%||%` <- function(x, y) if (!is.null(x)) x else y

.as_num <- function(x) {
  if (is.null(x)) {
    return(numeric(0))
  }
  as.numeric(x)
}
.as_mat <- function(x) {
  if (is.null(x)) {
    return(matrix(numeric(0), 0, 0))
  }
  as.matrix(x)
}

.safe_seq <- function(n, start = 1L) {
  n <- as.integer(n)
  start <- as.integer(start)
  if (is.na(n) || n <= 0L) integer(0) else seq.int(from = start, length.out = n)
}

.get_units_control <- function(fit, n_cols) {
  if (!is.null(fit$inputs$units) && is.list(fit$inputs$units)) {
    uc <- fit$inputs$units$control
    if (!is.null(uc)) return(as.character(uc))
  }
  cn <- colnames(fit$inputs$Yc_post) %||% colnames(fit$inputs$Yc_pre)
  if (!is.null(cn)) {
    return(as.character(cn))
  }
  paste0("unit_", seq_len(n_cols))
}

.get_times_pre <- function(fit, time_col = NULL) {
  if (
    !is.null(time_col) &&
      !is.null(fit$inputs$data_pre) &&
      is.data.frame(fit$inputs$data_pre) &&
      time_col %in% names(fit$inputs$data_pre)
  ) {
    return(as.vector(fit$inputs$data_pre[[time_col]]))
  }
  if (!is.null(fit$inputs$times_pre)) {
    return(as.vector(fit$inputs$times_pre))
  }

  rn <- rownames(fit$inputs$Yc_pre)
  if (!is.null(rn)) {
    if (suppressWarnings(all(!is.na(as.numeric(rn))))) {
      return(as.numeric(rn))
    }
    return(rn)
  }
  seq_len(nrow(fit$inputs$Yc_pre))
}

.get_times_post <- function(fit, time_col = NULL) {
  if (
    !is.null(time_col) &&
      !is.null(fit$inputs$data_post) &&
      is.data.frame(fit$inputs$data_post) &&
      time_col %in% names(fit$inputs$data_post)
  ) {
    return(as.vector(fit$inputs$data_post[[time_col]]))
  }
  if (!is.null(fit$inputs$times_post)) {
    return(as.vector(fit$inputs$times_post))
  }
  rn <- rownames(fit$inputs$Yc_post)
  if (!is.null(rn)) {
    if (suppressWarnings(all(!is.na(as.numeric(rn))))) {
      return(as.numeric(rn))
    }
    return(rn)
  }
  seq_len(nrow(fit$inputs$Yc_post))
}

.standardize_spill <- function(spill_raw, times_post, unit_names = NULL) {
  if (is.null(spill_raw)) {
    return(data.frame())
  }

  if (is.list(spill_raw) && !"data.frame" %in% class(spill_raw)) {
    if (!is.null(spill_raw$mean)) spill_raw <- spill_raw$mean
  }

  if (
    is.data.frame(spill_raw) &&
      all(c("unit", "time", "mean") %in% names(spill_raw))
  ) {
    df <- spill_raw[, c("unit", "time", "mean")]
    df$unit <- as.character(df$unit)
    df$time <- suppressWarnings(as.numeric(df$time))
    df$mean <- suppressWarnings(as.numeric(df$mean))
    df <- df[
      !is.na(df$unit) & !is.na(df$time) & !is.na(df$mean),
      ,
      drop = FALSE
    ]
    return(df)
  }

  if (
    is.matrix(spill_raw) ||
      (is.data.frame(spill_raw) && !("unit" %in% names(spill_raw)))
  ) {
    M <- as.matrix(spill_raw)
    T1 <- nrow(M)
    U <- ncol(M)
    if (U <= 1) {
      return(data.frame())
    }
    if (length(times_post) != T1) {
      times_post <- .safe_seq(T1, 1L)
    }
    coln <- colnames(M)
    if (is.null(coln) || any(coln == "")) {
      if (!is.null(unit_names)) {
        coln <- unit_names[seq_len(U)]
      } else {
        coln <- paste0("unit_", seq_len(U))
      }
    }
    df <- data.frame(
      time = rep(times_post, times = U),
      unit = rep(coln, each = T1),
      mean = as.numeric(M)
    )
    df$unit <- as.character(df$unit)
    df$time <- suppressWarnings(as.numeric(df$time))
    df$mean <- suppressWarnings(as.numeric(df$mean))
    df <- df[!is.na(df$mean), , drop = FALSE]
    return(df)
  }

  data.frame()
}

#' @keywords internal
scspill_counterfactual <- function(fit, cred = 0.95, time_col = NULL) {
  stopifnot(inherits(fit, "scspill"))

  Y0_pre <- as.numeric(fit$inputs$Y0_pre)
  Yc_pre <- as.matrix(fit$inputs$Yc_pre)
  storage.mode(Yc_pre) <- "double"
  Y0_post <- as.numeric(fit$inputs$Y0_post)
  Yc_post <- as.matrix(fit$inputs$Yc_post)
  storage.mode(Yc_post) <- "double"

  N <- ncol(Yc_pre)
  T0 <- nrow(Yc_pre)
  T1 <- nrow(Yc_post)

  w <- as.matrix(fit$inputs$w)
  storage.mode(w) <- "double"
  W <- as.matrix(fit$inputs$W)
  storage.mode(W) <- "double"

  alpha_draws <- as.matrix(fit$alpha_draws) # M x N
  rho_draws <- as.numeric(fit$rho_draws)
  M <- nrow(alpha_draws)

  IN <- diag(N)

  times_pre <- .get_times_pre(fit, time_col)
  if (length(times_pre) != T0) {
    times_pre <- .safe_seq(T0, 1L)
  }
  times_post <- .get_times_post(fit, time_col)
  if (length(times_post) != T1) {
    times_post <- .safe_seq(T1, if (T0 > 0) times_pre[T0] + 1L else 1L)
  }

  # pre
  ycf_pre_draws <- matrix(NA_real_, nrow = T0, ncol = M)
  for (m in seq_len(M)) {
    a <- alpha_draws[m, ]
    r <- rho_draws[m]
    Ainv <- solve(IN - r * (w %*% t(a) + W))
    B <- (IN - r * W)
    for (t in seq_len(T0)) {
      yc <- Yc_pre[t, ]
      y0 <- Y0_pre[t]
      tmp <- Ainv %*% (B %*% yc - r * w * y0)
      ycf_pre_draws[t, m] <- as.numeric(crossprod(a, tmp))
    }
  }

  # post
  ycf_post_draws <- matrix(NA_real_, nrow = T1, ncol = M)
  for (m in seq_len(M)) {
    a <- alpha_draws[m, ]
    r <- rho_draws[m]
    Ainv <- solve(IN - r * (w %*% t(a) + W))
    B <- (IN - r * W)
    for (t in seq_len(T1)) {
      yc <- Yc_post[t, ]
      y0 <- Y0_post[t]
      tmp <- Ainv %*% (B %*% yc - r * w * y0)
      ycf_post_draws[t, m] <- as.numeric(crossprod(a, tmp))
    }
  }

  lo_q <- (1 - cred) / 2
  hi_q <- 1 - lo_q

  df_pre <- data.frame(
    time = times_pre,
    t_idx = seq_len(T0),
    period = "pre",
    y_obs = Y0_pre,
    y_cf_mean = rowMeans(ycf_pre_draws),
    y_cf_lo = apply(ycf_pre_draws, 1, stats::quantile, probs = lo_q),
    y_cf_hi = apply(ycf_pre_draws, 1, stats::quantile, probs = hi_q)
  )
  df_post <- data.frame(
    time = times_post,
    t_idx = T0 + seq_len(T1),
    period = "post",
    y_obs = Y0_post,
    y_cf_mean = rowMeans(ycf_post_draws),
    y_cf_lo = apply(ycf_post_draws, 1, stats::quantile, probs = lo_q),
    y_cf_hi = apply(ycf_post_draws, 1, stats::quantile, probs = hi_q)
  )
  rbind(df_pre, df_post)
}

#' @keywords internal
tidy_scspill <- function(fit, time_col = NULL) {
  y0_pre <- as.numeric(fit$inputs$Y0_pre)
  y0_post <- as.numeric(fit$inputs$Y0_post)
  Yc_pre <- as.matrix(fit$inputs$Yc_pre)
  Yc_post <- as.matrix(fit$inputs$Yc_post)

  T0 <- length(y0_pre)
  T1 <- length(y0_post)
  T <- T0 + T1

  times_post <- .get_times_post(fit, time_col)
  if (length(times_post) != T1) {
    times_post <- .safe_seq(T1, if (T0 > 0) T0 + 1L else 1L)
  }

  unit_names <- NULL
  if (!is.null(fit$inputs$units) && is.list(fit$inputs$units)) {
    unit_names <- as.character(fit$inputs$units$control)
  } else {
    unit_names <- colnames(Yc_post) %||% colnames(Yc_pre)
  }

  weights_df <- data.frame()
  if (!is.null(fit$alpha_draws)) {
    A <- as.matrix(fit$alpha_draws) # M x N
    if (ncol(A) > 0) {
      alpha_hat <- colMeans(A, na.rm = TRUE)
      units <- .get_units_control(fit, length(alpha_hat))
      weights_df <- data.frame(
        unit = as.character(units),
        alpha = as.numeric(alpha_hat),
        stringsAsFactors = FALSE
      )
    }
  }

  spill_df <- data.frame()
  if (!is.null(fit$effects) && !is.null(fit$effects$spill)) {
    spill_df <- .standardize_spill(fit$effects$spill, times_post, unit_names)
  }

  list(
    T0 = T0,
    T1 = T1,
    T = T,
    times_post = times_post,
    y0_all = c(y0_pre, y0_post),
    Yc_all = rbind(Yc_pre, Yc_post),
    spill = spill_df,
    weights = weights_df
  )
}

# ---------------- S3: plot.scspill ----------------

#' Plot scspill object
#'
#' @param x scspill object
#' @param type "full" (default: observed vs counterfactual, pre/post), "effect" (post treatment effect),
#'             "spill_top", "weights", "rho", "beta", "trace"
#' @param top_n number of units to display for spill_top
#' @param cred  credibility level (for counterfactual ribbon)
#' @param time_col column name for x-axis in data_pre / data_post (e.g., "year")
#' @param ...    additional arguments
#' @export
plot.scspill <- function(
  x,
  type = c("full", "effect", "spill_top", "weights", "rho", "beta", "trace"),
  top_n = 8,
  cred = 0.95,
  time_col = NULL,
  ...
) {
  type <- match.arg(type)

  # -------- full: Observed vs Counterfactual --------
  if (type == "full") {
    cf <- scspill_counterfactual(x, cred = cred, time_col = time_col)

    cf$.idx <- seq_len(nrow(cf))
    T0 <- sum(cf$period == "pre")

    df_pre <- subset(cf, period == "pre")
    df_post <- subset(cf, period == "post")

    if (nrow(df_pre) > 0 && nrow(df_post) > 0) {
      pre_last <- df_pre[nrow(df_pre), ]
      pre_last$period <- "post"
      df_post_line <- rbind(pre_last, df_post)
    } else {
      df_post_line <- df_post
    }

    obs_line <- data.frame(idx = cf$.idx, y = cf$y_obs, series = "Observed")
    cf_line_pre <- data.frame(
      idx = df_pre$.idx,
      y = df_pre$y_cf_mean,
      series = "Counterfactual"
    )
    cf_line_post <- data.frame(
      idx = df_post_line$.idx,
      y = df_post_line$y_cf_mean,
      series = "Counterfactual"
    )

    rib_pre <- transform(df_pre, idx = .idx)
    rib_post <- transform(df_post, idx = .idx)

    x_breaks <- cf$.idx
    x_labels <- cf$time

    gg <- ggplot2::ggplot() +
      ggplot2::geom_line(
        data = obs_line,
        ggplot2::aes(idx, y, linetype = series, color = series)
      ) +
      ggplot2::geom_ribbon(
        data = rib_pre,
        ggplot2::aes(
          x = idx,
          ymin = y_cf_lo,
          ymax = y_cf_hi,
          fill = "Counterfactual 95% CI"
        ),
        alpha = 0.12,
        show.legend = TRUE
      ) +
      ggplot2::geom_ribbon(
        data = rib_post,
        ggplot2::aes(
          x = idx,
          ymin = y_cf_lo,
          ymax = y_cf_hi,
          fill = "Counterfactual 95% CI"
        ),
        alpha = 0.18,
        show.legend = TRUE
      ) +
      ggplot2::geom_line(
        data = cf_line_pre,
        ggplot2::aes(idx, y, linetype = series, color = series)
      ) +
      ggplot2::geom_line(
        data = cf_line_post,
        ggplot2::aes(idx, y, linetype = series, color = series)
      ) +
      ggplot2::geom_vline(xintercept = T0, linetype = 3) +
      ggplot2::theme_minimal() +
      ggplot2::labs(
        x = "Time",
        y = "Outcome",
        title = "Observed vs Counterfactual (pre & post)"
      ) +
      ggplot2::scale_x_continuous(breaks = x_breaks, labels = x_labels) +
      ggplot2::scale_linetype_manual(
        values = c("Observed" = "solid", "Counterfactual" = "22"),
        name = NULL
      ) +
      ggplot2::scale_color_manual(
        values = c("Observed" = "black", "Counterfactual" = "black"),
        guide = "none",
        name = NULL
      ) +
      ggplot2::scale_fill_manual(
        values = c("Counterfactual 95% CI" = "grey70"),
        name = NULL
      ) +
      ggplot2::theme(
        legend.position = "top",
        legend.direction = "horizontal",
        legend.box = "horizontal",
        legend.title = ggplot2::element_blank()
      ) +
      ggplot2::guides(
        linetype = ggplot2::guide_legend(order = 1, nrow = 1),
        fill = ggplot2::guide_legend(order = 2, nrow = 1)
      )

    return(gg)
  }

  td <- tidy_scspill(x, time_col = time_col)

  if (type == "effect") {
    cf <- scspill_counterfactual(x, cred = cred, time_col = time_col)
    df_post <- subset(cf, period == "post")
    
    df <- data.frame(
        time = df_post$time,
        mean = df_post$y_obs - df_post$y_cf_mean,
        lo = df_post$y_obs - df_post$y_cf_hi,
        hi = df_post$y_obs - df_post$y_cf_lo
    )
    
    if (nrow(df) == 0) {
        warning("No post-treatment data found for type='effect'.")
        return(ggplot2::ggplot() + ggplot2::theme_void() + 
               ggplot2::ggtitle("No post-treatment data found."))
    }

    df$.idx <- seq_len(nrow(df))
    
    gg <- ggplot2::ggplot(df, ggplot2::aes(.idx, mean)) +
      ggplot2::geom_ribbon(ggplot2::aes(ymin = lo, ymax = hi), alpha = 0.20) +
      ggplot2::geom_hline(yintercept = 0, linetype = "dashed", color = "grey50") +
      ggplot2::geom_line() +
      ggplot2::theme_minimal() +
      ggplot2::labs(
        x = "Time (post)",
        y = "Treatment effect (Observed - Counterfactual)",
        title = "Estimated treatment effect (post)"
      ) +
      ggplot2::scale_x_continuous(breaks = df$.idx, labels = df$time)
    return(gg)
  }
  if (type == "spill_top") {
    df <- td$spill 

    if (!nrow(df)) {
      stop("effects$spill not found or not in unit-by-time format.")
    }

    df$unit <- as.character(df$unit)
    df$time <- suppressWarnings(as.numeric(df$time))
    df$mean <- suppressWarnings(as.numeric(df$mean))
    df <- df[
      !is.na(df$unit) & !is.na(df$time) & !is.na(df$mean),
      ,
      drop = FALSE
    ]

    agg <- stats::aggregate(
      x = list(abs_mean = abs(df$mean)),
      by = list(unit = df$unit),
      FUN = mean,
      na.rm = TRUE
    )
    agg <- agg[order(-agg$abs_mean), , drop = FALSE]
    top_units <- head(agg$unit, n = min(top_n, nrow(agg)))

    df <- df[df$unit %in% top_units, , drop = FALSE]
    df <- df[order(df$unit, df$time), , drop = FALSE]

    gg <- ggplot2::ggplot(df, ggplot2::aes(time, mean)) +
      ggplot2::geom_line() +
      ggplot2::facet_wrap(~unit, scales = "free_y") +
      ggplot2::theme_minimal() +
      ggplot2::labs(
        x = "Time (post)",
        y = "Spillover effect",
        title = sprintf("Spillover effects (top %d units)", length(top_units))
      )
    return(gg)
  }

  # -------- weights --------
  if (type == "weights") {
    td <- tidy_scspill(x, time_col = time_col)
    df <- td$weights

    if (!nrow(df)) {
      stop("weights (alpha posterior summary) not found. Check fit$alpha_draws.")
    }

    df$unit <- as.character(df$unit)
    df$alpha <- suppressWarnings(as.numeric(df$alpha))
    df <- df[!is.na(df$alpha), , drop = FALSE]

    ord <- df[order(-abs(df$alpha)), , drop = FALSE]

    gg <- ggplot2::ggplot(
      ord,
      ggplot2::aes(x = stats::reorder(unit, abs(alpha)), y = alpha)
    ) +
      ggplot2::geom_hline(yintercept = 0, linewidth = 0.3) +
      ggplot2::geom_col() +
      ggplot2::coord_flip() +
      ggplot2::theme_minimal() +
      ggplot2::labs(
        x = "Control unit",
        y = "Synthetic weight (alpha, posterior mean)",
        title = "Estimated synthetic weights"
      )
    return(gg)
  }

  if (type == "rho") {
    df <- data.frame(rho = x$rho_draws)
    gg <- ggplot2::ggplot(df, ggplot2::aes(rho)) +
      ggplot2::geom_histogram(bins = 40) +
      ggplot2::geom_vline(xintercept = mean(df$rho), linetype = 2) +
      ggplot2::theme_minimal() +
      ggplot2::labs(
        x = expression(rho),
        y = "Frequency",
        title = expression(paste("Posterior of ", rho))
      )
    return(gg)
  }

  if (type == "beta") {
    if (is.null(x$sar$beta)) {
      stop("beta draws are not available in `x$sar$beta`.")
    }
    bm <- colMeans(x$sar$beta)
    df <- data.frame(
      name = names(bm) %||% paste0("beta_", seq_along(bm)),
      mean = as.numeric(bm),
      sd = apply(x$sar$beta, 2, sd),
      q025 = apply(x$sar$beta, 2, stats::quantile, 0.025),
      q975 = apply(x$sar$beta, 2, stats::quantile, 0.975)
    )
    gg <- ggplot2::ggplot(
      df,
      ggplot2::aes(x = stats::reorder(name, mean), y = mean)
    ) +
      ggplot2::geom_pointrange(ggplot2::aes(ymin = q025, ymax = q975)) +
      ggplot2::coord_flip() +
      ggplot2::theme_minimal() +
      ggplot2::labs(
        x = "Coefficient",
        y = "Posterior mean (95% CI)",
        title = "Posterior summaries of beta"
      )
    return(gg)
  }

  if (type == "trace") {
    df <- data.frame(iter = seq_along(x$rho_draws), rho = x$rho_draws)
    gg <- ggplot2::ggplot(df, ggplot2::aes(iter, rho)) +
      ggplot2::geom_line() +
      ggplot2::theme_minimal() +
      ggplot2::labs(
        x = "Iteration",
        y = expression(rho),
        title = expression(paste("Trace of ", rho))
      )
    return(gg)
  }

  stop("Unknown type")
}

#' @export
#' @method autoplot scspill
autoplot.scspill <- function(object, ...) {
  plot.scspill(object, ...)
}

#' @export
#' @method pp_check scspill
pp_check.scspill <- function(object, what = c("rho_trace", "treat_last_dist")) {
  what <- match.arg(what)
  if (what == "rho_trace") {
    df <- data.frame(iter = seq_along(object$rho_draws), rho = object$rho_draws)
    gg <- ggplot2::ggplot(df, ggplot2::aes(iter, rho)) +
      ggplot2::geom_line() +
      ggplot2::theme_minimal() +
      ggplot2::labs(
        x = "Iteration",
        y = expression(rho),
        title = expression(paste("Trace of ", rho))
      )
    return(gg)
  } else {
    td <- tidy_scspill(object)
    if (nrow(td$treat) == 0) {
      stop("No treatment-effect summary found.")
    }
    mu <- utils::tail(td$treat$mean, 1)
    lo <- utils::tail(td$treat$lo, 1)
    hi <- utils::tail(td$treat$hi, 1)
    sd_ <- (hi - lo) / (2 * 1.96)
    xs <- seq(mu - 4 * sd_, mu + 4 * sd_, length.out = 400)
    df <- data.frame(x = xs, d = stats::dnorm(xs, mean = mu, sd = sd_))
    gg <- ggplot2::ggplot(df, ggplot2::aes(x, d)) +
      ggplot2::geom_line() +
      ggplot2::geom_vline(xintercept = 0, linetype = 2) +
      ggplot2::theme_minimal() +
      ggplot2::labs(
        x = "Effect (last post period)",
        y = "Density",
        title = "Posterior predictive (normal approx.) vs 0"
      )
    return(gg)
  }
}
