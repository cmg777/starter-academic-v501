// lasso.js — coordinate-descent LASSO solver, 3-fold CV, rigorous penalty,
// and a small QR/Cholesky OLS helper used for the post-LASSO refit.
//
// Conventions:
//   - X is stored row-major as a Float64Array of length n*p.
//   - y is a Float64Array of length n.
//   - We assume X columns are already standardised (mean 0, sd 1) and y centred,
//     so we fit no intercept. This matches the "after partialling" step in the
//     post and keeps the CD update very fast (column norms ≈ n).
//
// Objective minimised by lasso_one:
//     (1 / 2n) * ||y - X b||_2^2  +  lambda * ||b||_1
//
// Exports on window.LASSO.

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Inverse standard-normal CDF (Acklam's algorithm — accurate to ~1e-9).
  // ------------------------------------------------------------------
  function qnorm(p) {
    if (p <= 0 || p >= 1) return p <= 0 ? -Infinity : Infinity;
    const a = [-3.969683028665376e+01,  2.209460984245205e+02,
               -2.759285104469687e+02,  1.383577518672690e+02,
               -3.066479806614716e+01,  2.506628277459239e+00];
    const b = [-5.447609879822406e+01,  1.615858368580409e+02,
               -1.556989798598866e+02,  6.680131188771972e+01,
               -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01,
               -2.400758277161838e+00, -2.549732539343734e+00,
                4.374664141464968e+00,  2.938163982698783e+00];
    const d = [ 7.784695709041462e-03,  3.224671290700398e-01,
                2.445134137142996e+00,  3.754408661907416e+00];
    const plow = 0.02425, phigh = 1 - plow;
    let q, r;
    if (p < plow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
             ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p <= phigh) {
      q = p - 0.5; r = q * q;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
             (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    }
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  // Soft-threshold operator.
  function soft(z, t) {
    if (z > t) return z - t;
    if (z < -t) return z + t;
    return 0;
  }

  // ------------------------------------------------------------------
  // Coordinate descent for one lambda. b is initial guess (warm start).
  // r is the current residual y - X*b (recomputed if not supplied).
  // Returns {b, r, iter}.
  // ------------------------------------------------------------------
  function lasso_one(X, y, n, p, lambda, b0, r0, opts) {
    opts = opts || {};
    const maxIter = opts.maxIter || 60;
    const tol = opts.tol || 1e-5;

    const b = new Float64Array(p);
    if (b0) for (let j = 0; j < p; j++) b[j] = b0[j];
    const r = new Float64Array(n);
    if (r0) {
      for (let i = 0; i < n; i++) r[i] = r0[i];
    } else {
      for (let i = 0; i < n; i++) {
        let s = y[i];
        for (let j = 0; j < p; j++) s -= X[i * p + j] * b[j];
        r[i] = s;
      }
    }

    // Active set strategy: in early iters allow any column to enter; once
    // converged on the active set, sweep the full set once to check.
    let active = new Uint8Array(p);
    for (let j = 0; j < p; j++) if (b[j] !== 0) active[j] = 1;

    let iter = 0;
    for (; iter < maxIter; iter++) {
      let maxDelta = 0;

      // Sweep all columns on first iter, then mostly active sweeps.
      const fullSweep = (iter === 0) || (iter % 5 === 0);
      for (let j = 0; j < p; j++) {
        if (!fullSweep && !active[j]) continue;

        let xtr = 0;
        const offset = j; // j is column index
        for (let i = 0; i < n; i++) xtr += X[i * p + offset] * r[i];
        const z = xtr / n + b[j]; // standardised column ⇒ ||x_j||^2/n ≈ 1
        const bj_new = soft(z, lambda);
        const delta = bj_new - b[j];
        if (delta !== 0) {
          // Update residual: r ← r - delta * x_j
          for (let i = 0; i < n; i++) r[i] -= delta * X[i * p + offset];
          b[j] = bj_new;
          active[j] = bj_new !== 0 ? 1 : 0;
          if (Math.abs(delta) > maxDelta) maxDelta = Math.abs(delta);
        } else if (bj_new === 0) {
          active[j] = 0;
        }
      }

      if (maxDelta < tol) break;
    }
    return { b, r, iter };
  }

  // ------------------------------------------------------------------
  // Compute lambda_max so that all coefficients are exactly zero.
  //   lambda_max = max_j |X_j' y| / n
  // ------------------------------------------------------------------
  function lambda_max(X, y, n, p) {
    let m = 0;
    for (let j = 0; j < p; j++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += X[i * p + j] * y[i];
      const v = Math.abs(s) / n;
      if (v > m) m = v;
    }
    return m;
  }

  // ------------------------------------------------------------------
  // Fit a full LASSO path. Returns lambdas[K] descending, and beta[K x p]
  // (an array of Float64Array(p)).
  // ------------------------------------------------------------------
  function lasso_path(X, y, n, p, opts) {
    opts = opts || {};
    const nLam = opts.nLam || 80;
    const lmax = lambda_max(X, y, n, p);
    const eps = opts.eps || 0.005;
    const lmin = Math.max(eps * lmax, 1e-6);
    const log_lmax = Math.log(lmax), log_lmin = Math.log(lmin);

    const lambdas = new Float64Array(nLam);
    for (let k = 0; k < nLam; k++) {
      lambdas[k] = Math.exp(log_lmax + (log_lmin - log_lmax) * (k / (nLam - 1)));
    }

    const betas = new Array(nLam);
    let b_warm = new Float64Array(p);
    let r_warm = null;
    for (let k = 0; k < nLam; k++) {
      const out = lasso_one(X, y, n, p, lambdas[k], b_warm, r_warm, opts);
      betas[k] = out.b;
      b_warm = out.b;
      r_warm = out.r;
    }
    return { lambdas, betas, lambda_max: lmax };
  }

  // ------------------------------------------------------------------
  // 3-fold cross-validation for the LASSO. Returns the lambda that minimises
  // out-of-fold mean squared error, the corresponding selected support, and
  // diagnostic info (the CV MSE curve).
  // ------------------------------------------------------------------
  function cv_lasso(X, y, n, p, opts) {
    opts = opts || {};
    const nfolds = opts.nfolds || 3;
    const fold = new Int32Array(n);
    // Pseudo-random fold assignment using a tiny LCG seeded from opts.seed.
    let s = (opts.seed || 12345) >>> 0;
    for (let i = 0; i < n; i++) {
      s = (Math.imul(s, 1103515245) + 12345) >>> 0;
      fold[i] = s % nfolds;
    }

    // First pass: lambda grid from the full data fit.
    const fullPath = lasso_path(X, y, n, p, opts);
    const lambdas = fullPath.lambdas;
    const K = lambdas.length;

    const cvSums = new Float64Array(K);
    const cvCounts = new Int32Array(K);

    for (let f = 0; f < nfolds; f++) {
      // Build train and test indices.
      const train_idx = [];
      const test_idx = [];
      for (let i = 0; i < n; i++) {
        if (fold[i] === f) test_idx.push(i); else train_idx.push(i);
      }
      const ntr = train_idx.length;
      const nte = test_idx.length;
      if (ntr < 5 || nte < 1) continue;

      const Xtr = new Float64Array(ntr * p);
      const ytr = new Float64Array(ntr);
      for (let ii = 0; ii < ntr; ii++) {
        const r = train_idx[ii];
        ytr[ii] = y[r];
        for (let j = 0; j < p; j++) Xtr[ii * p + j] = X[r * p + j];
      }
      const Xte = new Float64Array(nte * p);
      const yte = new Float64Array(nte);
      for (let ii = 0; ii < nte; ii++) {
        const r = test_idx[ii];
        yte[ii] = y[r];
        for (let j = 0; j < p; j++) Xte[ii * p + j] = X[r * p + j];
      }

      // Fit at the same lambda grid (warm starts).
      let b_warm = new Float64Array(p);
      let r_warm = null;
      for (let k = 0; k < K; k++) {
        const out = lasso_one(Xtr, ytr, ntr, p, lambdas[k], b_warm, r_warm, opts);
        b_warm = out.b;
        r_warm = out.r;
        // Score on test fold.
        let mse = 0;
        for (let ii = 0; ii < nte; ii++) {
          let yhat = 0;
          for (let j = 0; j < p; j++) yhat += Xte[ii * p + j] * out.b[j];
          const e = yte[ii] - yhat;
          mse += e * e;
        }
        cvSums[k] += mse;
        cvCounts[k] += nte;
      }
    }

    let bestK = 0, bestMSE = Infinity;
    const cvMSE = new Float64Array(K);
    for (let k = 0; k < K; k++) {
      cvMSE[k] = cvSums[k] / Math.max(1, cvCounts[k]);
      if (cvMSE[k] < bestMSE) { bestMSE = cvMSE[k]; bestK = k; }
    }

    const lambda_min = lambdas[bestK];
    const beta_min = fullPath.betas[bestK];

    return {
      lambdas, cvMSE, lambda_min, beta_min, bestK,
      betas: fullPath.betas,
    };
  }

  // ------------------------------------------------------------------
  // Rigorous penalty in the Belloni-Chen-Chernozhukov-Hansen sense:
  //   lambda^rig = (2 * c * sigma_hat / sqrt(n)) * Phi^{-1}(1 - gamma / (2p))
  //
  // sigma_hat: pilot estimate of the residual standard deviation. We use the
  // refinement-loop strategy from the hdm package:
  //   start with sd(y), fit LASSO at the corresponding penalty, refit OLS on
  //   the selected support, update sigma_hat, repeat up to a few iterations.
  // ------------------------------------------------------------------
  function rigorous_lambda(n, p, sigma_hat, c, gamma) {
    c = c || 1.1; gamma = gamma || 0.05;
    const tail = 1 - gamma / (2 * p);
    return (2 * c * sigma_hat / Math.sqrt(n)) * qnorm(tail);
  }

  function rlasso(X, y, n, p, opts) {
    opts = opts || {};
    const c = opts.c || 1.1;
    const gamma = opts.gamma || 0.05;
    // Initial sigma: standard deviation of y.
    let m = 0;
    for (let i = 0; i < n; i++) m += y[i];
    m /= n;
    let s2 = 0;
    for (let i = 0; i < n; i++) { const d = y[i] - m; s2 += d * d; }
    let sigma = Math.sqrt(s2 / Math.max(1, n - 1));
    let b_warm = new Float64Array(p);
    let r_warm = null;
    let beta = null;
    let lam = 0;
    for (let it = 0; it < 6; it++) {
      lam = rigorous_lambda(n, p, sigma, c, gamma);
      const out = lasso_one(X, y, n, p, lam, b_warm, r_warm, { maxIter: 100, tol: 1e-6 });
      beta = out.b;
      b_warm = out.b;
      r_warm = out.r;
      // Update sigma from residuals.
      let ss = 0; let nz = 0;
      for (let j = 0; j < p; j++) if (beta[j] !== 0) nz++;
      for (let i = 0; i < n; i++) ss += out.r[i] * out.r[i];
      const dof = Math.max(1, n - nz);
      const newSigma = Math.sqrt(ss / dof);
      if (Math.abs(newSigma - sigma) < 1e-4) { sigma = newSigma; break; }
      sigma = newSigma;
    }
    return { beta, lambda: lam, sigma_hat: sigma };
  }

  // ------------------------------------------------------------------
  // Symmetric solve via Cholesky (returns null on failure). A is k*k, b is k.
  // ------------------------------------------------------------------
  function cholSolve(A, b, k) {
    const L = new Float64Array(k * k);
    for (let i = 0; i < k; i++) {
      for (let j = 0; j <= i; j++) {
        let s = A[i * k + j];
        for (let kk = 0; kk < j; kk++) s -= L[i * k + kk] * L[j * k + kk];
        if (i === j) {
          if (s <= 1e-12) return null;
          L[i * k + j] = Math.sqrt(s);
        } else {
          L[i * k + j] = s / L[j * k + j];
        }
      }
    }
    // Forward solve L * z = b
    const z = new Float64Array(k);
    for (let i = 0; i < k; i++) {
      let s = b[i];
      for (let j = 0; j < i; j++) s -= L[i * k + j] * z[j];
      z[i] = s / L[i * k + i];
    }
    // Back solve L^T * x = z
    const x = new Float64Array(k);
    for (let i = k - 1; i >= 0; i--) {
      let s = z[i];
      for (let j = i + 1; j < k; j++) s -= L[j * k + i] * x[j];
      x[i] = s / L[i * k + i];
    }
    return { x, L };
  }

  // ------------------------------------------------------------------
  // OLS by Cholesky on the design matrix [d | Xs]. Returns
  //   {alpha_hat, se_alpha, beta, residuals}
  // where alpha is the coefficient on the FIRST column (i.e., d), and the
  // remaining columns are the selected controls.
  //
  // We compute the homoskedasticity-robust SE on alpha:
  //   se_alpha = sqrt( sigma^2 * (X'X)^{-1}[0,0] )
  // ------------------------------------------------------------------
  function ols_with_treatment(d, X_selected, y, n, k_sel) {
    const k = 1 + k_sel; // [d, X_selected]
    // Build A = M' M where M = [d, X_selected]. Row-major M is implicit.
    const A = new Float64Array(k * k);
    const b = new Float64Array(k);

    // Helper: get column j of M for observation i.
    // j = 0 -> d[i]; j >= 1 -> X_selected[i * k_sel + (j - 1)]
    function getM(i, j) {
      if (j === 0) return d[i];
      return X_selected[i * k_sel + (j - 1)];
    }

    for (let j1 = 0; j1 < k; j1++) {
      for (let j2 = j1; j2 < k; j2++) {
        let s = 0;
        for (let i = 0; i < n; i++) s += getM(i, j1) * getM(i, j2);
        A[j1 * k + j2] = s;
        A[j2 * k + j1] = s;
      }
      let s = 0;
      for (let i = 0; i < n; i++) s += getM(i, j1) * y[i];
      b[j1] = s;
    }

    // Solve A * beta = b
    let sol = cholSolve(A, b, k);
    if (!sol) {
      // Tiny ridge to stabilise singular A.
      for (let j = 0; j < k; j++) A[j * k + j] += 1e-8;
      sol = cholSolve(A, b, k);
      if (!sol) return null;
    }
    const beta = sol.x;
    const L = sol.L;

    // Residuals and sigma^2.
    let rss = 0;
    const e = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let yhat = 0;
      for (let j = 0; j < k; j++) yhat += getM(i, j) * beta[j];
      const r = y[i] - yhat;
      e[i] = r;
      rss += r * r;
    }
    const dof = Math.max(1, n - k);
    const sigma2 = rss / dof;

    // (X'X)^{-1}[0,0] from the Cholesky factor: solve L L' z = e_0 for z, then [0,0] = z[0].
    const e0 = new Float64Array(k); e0[0] = 1;
    // Forward solve L * y = e0
    const yv = new Float64Array(k);
    for (let i = 0; i < k; i++) {
      let s = e0[i];
      for (let j = 0; j < i; j++) s -= L[i * k + j] * yv[j];
      yv[i] = s / L[i * k + i];
    }
    // Back solve L^T * z = y
    const z = new Float64Array(k);
    for (let i = k - 1; i >= 0; i--) {
      let s = yv[i];
      for (let j = i + 1; j < k; j++) s -= L[j * k + i] * z[j];
      z[i] = s / L[i * k + i];
    }
    const var_alpha = sigma2 * z[0];
    const se_alpha = Math.sqrt(Math.max(0, var_alpha));

    return { alpha_hat: beta[0], se_alpha, beta, residuals: e, sigma2 };
  }

  // ------------------------------------------------------------------
  // Build a Float64Array of the columns of X listed in 'support' (1D array of
  // column indices). Returned matrix is n x |support| row-major.
  // ------------------------------------------------------------------
  function subset_columns(X, n, p, support) {
    const k = support.length;
    const out = new Float64Array(n * k);
    for (let i = 0; i < n; i++) {
      for (let s = 0; s < k; s++) {
        out[i * k + s] = X[i * p + support[s]];
      }
    }
    return out;
  }

  function nonzero_indices(beta, eps) {
    eps = eps || 1e-9;
    const out = [];
    for (let j = 0; j < beta.length; j++) if (Math.abs(beta[j]) > eps) out.push(j);
    return out;
  }

  // ------------------------------------------------------------------
  // Convenience: run a full DL pipeline (two LASSOs + union + post-OLS).
  // mode: "rigorous" or "cv".
  // Returns {alpha_hat, se_alpha, n_Iy, n_Id, n_intersection, n_union, lambda_y, lambda_d}
  // ------------------------------------------------------------------
  function double_lasso(X, d, y, n, p, mode, opts) {
    opts = opts || {};
    let Iy, Id, lambda_y = null, lambda_d = null;
    if (mode === "rigorous") {
      const fy = rlasso(X, y, n, p, opts);
      const fd = rlasso(X, d, n, p, opts);
      Iy = nonzero_indices(fy.beta);
      Id = nonzero_indices(fd.beta);
      lambda_y = fy.lambda;
      lambda_d = fd.lambda;
    } else {
      const fy = cv_lasso(X, y, n, p, opts);
      const fd = cv_lasso(X, d, n, p, opts);
      Iy = nonzero_indices(fy.beta_min);
      Id = nonzero_indices(fd.beta_min);
      lambda_y = fy.lambda_min;
      lambda_d = fd.lambda_min;
    }
    const set = new Set();
    Iy.forEach(j => set.add(j));
    Id.forEach(j => set.add(j));
    const union = Array.from(set).sort((a, b) => a - b);

    const inter = new Set(Id);
    const intersection = Iy.filter(j => inter.has(j));

    const Xs = subset_columns(X, n, p, union);
    const ols = ols_with_treatment(d, Xs, y, n, union.length);

    return {
      alpha_hat: ols ? ols.alpha_hat : NaN,
      se_alpha: ols ? ols.se_alpha : NaN,
      n_Iy: Iy.length,
      n_Id: Id.length,
      n_intersection: intersection.length,
      n_union: union.length,
      lambda_y, lambda_d,
      Iy, Id, union,
    };
  }

  window.LASSO = {
    qnorm,
    lasso_one,
    lasso_path,
    cv_lasso,
    rlasso,
    rigorous_lambda,
    ols_with_treatment,
    double_lasso,
    nonzero_indices,
    subset_columns,
    lambda_max,
  };
})();
