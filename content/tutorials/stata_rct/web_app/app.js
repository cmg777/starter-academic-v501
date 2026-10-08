// app.js — RCT Interactive Lab.
// Wires the DOM controls in index.html to dgp/lasso/charts modules.
// Runs after window.DGP, window.LASSO, window.CHARTS are defined.

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Tab switching
  // ------------------------------------------------------------------
  function activateTab(paneId) {
    document.querySelectorAll(".tab-strip button").forEach(function (btn) {
      const isActive = btn.dataset.pane === paneId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    document.querySelectorAll(".tab-pane").forEach(function (pane) {
      pane.classList.toggle("active", pane.id === paneId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll(".tab-strip button").forEach(function (btn) {
    btn.addEventListener("click", function () { activateTab(btn.dataset.pane); });
  });
  document.querySelectorAll(".cta-card[data-goto]").forEach(function (card) {
    card.addEventListener("click", function () { activateTab(card.dataset.goto); });
  });

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ------------------------------------------------------------------
  // TAB 1 — Randomization animation + balance plot
  // ------------------------------------------------------------------
  CHARTS.rct_randomization_animation(document.getElementById("intro-anim"));

  const balance = CHARTS.rct_balance_plot(document.getElementById("intro-balance"));
  fetch("data/results.json").then(function (r) { return r.json(); }).then(function (data) {
    balance.update(data.balance);
    // Stash for Tab 4
    window.__resultsData = data;
    if (typeof window.__forestRefresh === "function") window.__forestRefresh();
  }).catch(function (err) {
    document.getElementById("intro-balance").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // TAB 2 — Variance reduction
  //   Two sampling distributions: simple diff-in-means (no controls) vs
  //   covariate-adjusted estimator. Variance ratio = 1 - R^2.
  // ------------------------------------------------------------------
  const varianceChart = CHARTS.rct_variance_animation(document.getElementById("var-pdf"));

  const varState = { r2: 0.30, n: 2000 };
  function varRender() {
    // Outcome variance (log consumption) ≈ 0.435^2 ≈ 0.19 from the post.
    const sigma2 = 0.19;
    // p = 0.5 ⇒ Var(treat) = 0.25
    const pTreat = 0.5;
    // For a simple diff-in-means: SE^2 ≈ sigma2 / (n * Var(treat))
    const seSimple = Math.sqrt(sigma2 / (varState.n * pTreat));
    // For adjusted: variance shrinks by (1 - r2)
    const seAdj = Math.sqrt(sigma2 * (1 - varState.r2) / (varState.n * pTreat));
    varianceChart.update(0.116, seSimple, 0.113, seAdj);

    document.getElementById("var-se-simple").textContent = seSimple.toFixed(4);
    document.getElementById("var-se-adj").textContent = seAdj.toFixed(4);
    const gainPct = (1 - seAdj / seSimple) * 100;
    document.getElementById("var-gain").textContent = gainPct.toFixed(1) + "%";
    // Equivalent n boost: how much bigger an n would the simple estimator need to match the adjusted SE?
    // seSimple(n*) = seAdj(n)  ⇒  n* = n / (1 - r2)
    const equivN = Math.round(varState.n / Math.max(0.01, 1 - varState.r2));
    document.getElementById("var-nboost").textContent = equivN.toLocaleString() + " (vs " + varState.n.toLocaleString() + ")";
  }

  document.getElementById("var-r").addEventListener("input", function (e) {
    varState.r2 = +e.target.value;
    document.getElementById("var-r-val").textContent = varState.r2.toFixed(2);
    varRender();
  });
  document.getElementById("var-n").addEventListener("input", function (e) {
    varState.n = +e.target.value;
    document.getElementById("var-n-val").textContent = varState.n;
    varRender();
  });
  varRender();

  // ------------------------------------------------------------------
  // TAB 3 — RA / IPW / DR Simulator
  //
  // Custom DGP designed to be light-weight (no LASSO needed):
  //   X[i,j] ~ N(0,1) standardised, j = 0..k-1   (k = 4 covariates)
  //   T[i] | X ~ Bernoulli(logit^{-1}(delta * sum(X)))  — δ controls confounding
  //   Y[i]  = alpha * T[i] + gamma * (X[i,0] + X[i,1]) + eps[i]
  //
  // Estimators (closed-form, no iteration needed):
  //   simple : OLS of y on [1, T]
  //   RA     : OLS of y on [1, T, X1..X4]  — coefficient on T
  //   IPW    : Weighted OLS of y on [1, T] with weights 1/p̂ for treated, 1/(1-p̂) for control
  //   DR     : RA estimate + IPW-weighted residual correction (AIPW)
  // ------------------------------------------------------------------

  function logistic(z) { return 1 / (1 + Math.exp(-z)); }

  // Solve a small (k x k) linear system A * x = b via Gaussian elimination with partial pivoting.
  function gaussSolve(A, b, k) {
    const M = new Float64Array((k + 1) * k);
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) M[i * (k + 1) + j] = A[i * k + j];
      M[i * (k + 1) + k] = b[i];
    }
    for (let i = 0; i < k; i++) {
      // pivot
      let maxR = i, maxV = Math.abs(M[i * (k + 1) + i]);
      for (let r = i + 1; r < k; r++) {
        if (Math.abs(M[r * (k + 1) + i]) > maxV) { maxV = Math.abs(M[r * (k + 1) + i]); maxR = r; }
      }
      if (maxV < 1e-12) return null;
      if (maxR !== i) {
        for (let c = 0; c <= k; c++) {
          const t = M[i * (k + 1) + c]; M[i * (k + 1) + c] = M[maxR * (k + 1) + c]; M[maxR * (k + 1) + c] = t;
        }
      }
      for (let r = i + 1; r < k; r++) {
        const f = M[r * (k + 1) + i] / M[i * (k + 1) + i];
        for (let c = i; c <= k; c++) M[r * (k + 1) + c] -= f * M[i * (k + 1) + c];
      }
    }
    const x = new Float64Array(k);
    for (let i = k - 1; i >= 0; i--) {
      let s = M[i * (k + 1) + k];
      for (let j = i + 1; j < k; j++) s -= M[i * (k + 1) + j] * x[j];
      x[i] = s / M[i * (k + 1) + i];
    }
    return x;
  }

  // OLS of y on [intercept, columns of M (n x k_cols, row-major)]. Returns
  // { beta, se }. SE of the coefficient on the FIRST regressor (besides intercept)
  // is in se[1]. M is n x kcols row-major. Optional w[i] weights.
  function ols(M, y, n, kcols, w) {
    const k = kcols + 1; // + intercept
    const A = new Float64Array(k * k);
    const b = new Float64Array(k);
    function getX(i, j) {
      if (j === 0) return 1.0;
      return M[i * kcols + (j - 1)];
    }
    for (let j1 = 0; j1 < k; j1++) {
      for (let j2 = j1; j2 < k; j2++) {
        let s = 0;
        for (let i = 0; i < n; i++) {
          const wi = w ? w[i] : 1.0;
          s += wi * getX(i, j1) * getX(i, j2);
        }
        A[j1 * k + j2] = s;
        A[j2 * k + j1] = s;
      }
      let s = 0;
      for (let i = 0; i < n; i++) {
        const wi = w ? w[i] : 1.0;
        s += wi * getX(i, j1) * y[i];
      }
      b[j1] = s;
    }
    const beta = gaussSolve(A, b, k);
    if (!beta) return null;

    // Residuals and sigma^2
    let rss = 0;
    for (let i = 0; i < n; i++) {
      let yhat = 0;
      for (let j = 0; j < k; j++) yhat += getX(i, j) * beta[j];
      const r = y[i] - yhat;
      rss += (w ? w[i] : 1.0) * r * r;
    }
    const dof = Math.max(1, n - k);
    const sigma2 = rss / dof;

    // (X'WX)^{-1} via solving k columns of identity
    const seArr = new Float64Array(k);
    for (let col = 0; col < k; col++) {
      const e = new Float64Array(k); e[col] = 1;
      const z = gaussSolve(A, e, k);
      if (z) seArr[col] = Math.sqrt(Math.max(0, sigma2 * z[col]));
    }
    return { beta: beta, se: seArr };
  }

  // Fit a logistic regression for T on [1, X[:, 0..kx-1]] via IRLS (a few iterations).
  function logistic_fit(X, T, n, kx, maxIter) {
    maxIter = maxIter || 12;
    const k = kx + 1;
    const beta = new Float64Array(k);
    function getX(i, j) { return j === 0 ? 1.0 : X[i * kx + (j - 1)]; }
    for (let iter = 0; iter < maxIter; iter++) {
      const A = new Float64Array(k * k);
      const b = new Float64Array(k);
      let maxStep = 0;
      for (let i = 0; i < n; i++) {
        let eta = 0;
        for (let j = 0; j < k; j++) eta += getX(i, j) * beta[j];
        const p = logistic(eta);
        const w = Math.max(p * (1 - p), 1e-6);
        const z = eta + (T[i] - p) / w;
        for (let j1 = 0; j1 < k; j1++) {
          const x1 = getX(i, j1);
          for (let j2 = j1; j2 < k; j2++) A[j1 * k + j2] += w * x1 * getX(i, j2);
          b[j1] += w * x1 * z;
        }
      }
      for (let j1 = 0; j1 < k; j1++) for (let j2 = j1 + 1; j2 < k; j2++) A[j2 * k + j1] = A[j1 * k + j2];
      // ridge for stability
      for (let j = 0; j < k; j++) A[j * k + j] += 1e-6;
      const newBeta = gaussSolve(A, b, k);
      if (!newBeta) break;
      for (let j = 0; j < k; j++) {
        const d = newBeta[j] - beta[j];
        maxStep = Math.max(maxStep, Math.abs(d));
        beta[j] = newBeta[j];
      }
      if (maxStep < 1e-6) break;
    }
    // Predicted propensities
    const ps = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let eta = 0;
      for (let j = 0; j < k; j++) eta += getX(i, j) * beta[j];
      ps[i] = Math.max(0.02, Math.min(0.98, logistic(eta)));
    }
    return ps;
  }

  // Simulate one RCT dataset.
  function simulate_rct(opts) {
    const n = opts.n | 0;
    const kx = 4;
    const alpha = +opts.alpha;
    const gamma = +opts.gamma; // covariate strength on Y
    const delta = +opts.delta; // confounding strength (treat depends on X)
    const seed = (opts.seed | 0) || 1;
    const rng = DGP.mulberry32(seed);
    const normal = DGP.makeNormal(rng);

    const X = new Float64Array(n * kx);
    for (let i = 0; i < n * kx; i++) X[i] = normal();

    const T = new Float64Array(n);
    const Y = new Float64Array(n);
    const trueProp = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      // True propensity depends on X via delta
      let xSum = 0;
      for (let j = 0; j < kx; j++) xSum += X[i * kx + j];
      const eta = delta * xSum;
      const p = logistic(eta);
      trueProp[i] = p;
      T[i] = rng() < p ? 1 : 0;
    }
    // Outcome
    for (let i = 0; i < n; i++) {
      let mu = alpha * T[i] + gamma * (X[i * kx + 0] + X[i * kx + 1]);
      // Modest extra noise so SEs are non-trivial
      Y[i] = mu + 0.4 * normal();
    }
    return { X: X, T: T, Y: Y, n: n, kx: kx };
  }

  function dgp_estimate(sim) {
    const n = sim.n, kx = sim.kx;

    // Build [T, X] matrix (n x (1+kx)) for RA
    const TX = new Float64Array(n * (1 + kx));
    for (let i = 0; i < n; i++) {
      TX[i * (1 + kx) + 0] = sim.T[i];
      for (let j = 0; j < kx; j++) TX[i * (1 + kx) + 1 + j] = sim.X[i * kx + j];
    }
    // Build [T] matrix (n x 1) for simple
    const Tonly = new Float64Array(n);
    for (let i = 0; i < n; i++) Tonly[i] = sim.T[i];

    // Simple OLS: y ~ 1 + T
    const fitS = ols(Tonly, sim.Y, n, 1, null);
    const simple = fitS ? { v: fitS.beta[1], se: fitS.se[1] } : { v: NaN, se: NaN };

    // Regression Adjustment: y ~ 1 + T + X
    const fitRA = ols(TX, sim.Y, n, 1 + kx, null);
    const ra = fitRA ? { v: fitRA.beta[1], se: fitRA.se[1] } : { v: NaN, se: NaN };

    // Propensity score via logistic regression
    const ps = logistic_fit(sim.X, sim.T, n, kx);
    const w = new Float64Array(n);
    for (let i = 0; i < n; i++) w[i] = sim.T[i] ? 1 / ps[i] : 1 / (1 - ps[i]);

    // IPW: weighted OLS of y ~ 1 + T
    const fitIPW = ols(Tonly, sim.Y, n, 1, w);
    const ipw = fitIPW ? { v: fitIPW.beta[1], se: fitIPW.se[1] } : { v: NaN, se: NaN };

    // Doubly Robust (AIPW): RA mu_1, mu_0 + IPW correction
    // mu_1(X) and mu_0(X) come from RA fit: predict with T=1 and T=0.
    let dr_sum = 0, dr_sq = 0;
    if (fitRA) {
      const beta = fitRA.beta;
      // beta is [b0, b_T, b_X1, b_X2, b_X3, b_X4]
      const tau_i = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        let xPart = 0;
        for (let j = 0; j < kx; j++) xPart += beta[2 + j] * sim.X[i * kx + j];
        const mu1 = beta[0] + beta[1] * 1 + xPart;
        const mu0 = beta[0] + beta[1] * 0 + xPart;
        const Yhat = beta[0] + beta[1] * sim.T[i] + xPart;
        const resid = sim.Y[i] - Yhat;
        const corr = sim.T[i] ? resid / ps[i] : -resid / (1 - ps[i]);
        tau_i[i] = (mu1 - mu0) + corr;
        dr_sum += tau_i[i];
      }
      const dr_mean = dr_sum / n;
      let v = 0;
      for (let i = 0; i < n; i++) v += (tau_i[i] - dr_mean) * (tau_i[i] - dr_mean);
      const dr_se = Math.sqrt(v / (n * (n - 1)));
      var dr = { v: dr_mean, se: dr_se };
    } else {
      dr = { v: NaN, se: NaN };
    }

    return { simple: simple, ra: ra, ipw: ipw, dr: dr };
  }

  const dgpChart = CHARTS.rct_estimator_compare(document.getElementById("dgp-compare"));
  const dgpHist = CHARTS.rct_estimator_histograms(document.getElementById("dgp-hist"));

  const dgpState = { n: 500, alpha: 0.12, gamma: 0.50, delta: 0.30, seed: 7 };

  function dgp_refit() {
    const sim = simulate_rct(dgpState);
    const est = dgp_estimate(sim);
    dgpChart.update({
      simple: est.simple.v, simple_se: est.simple.se,
      ra: est.ra.v, ra_se: est.ra.se,
      ipw: est.ipw.v, ipw_se: est.ipw.se,
      dr: est.dr.v, dr_se: est.dr.se,
      alpha_true: dgpState.alpha,
    });
  }

  const dgpDebounced = debounce(dgp_refit, 120);
  document.getElementById("dgp-n").addEventListener("input", function (e) {
    dgpState.n = +e.target.value;
    document.getElementById("dgp-n-val").textContent = dgpState.n;
    dgpDebounced();
  });
  document.getElementById("dgp-alpha").addEventListener("input", function (e) {
    dgpState.alpha = +e.target.value;
    document.getElementById("dgp-alpha-val").textContent = dgpState.alpha.toFixed(2);
    dgpDebounced();
  });
  document.getElementById("dgp-gamma").addEventListener("input", function (e) {
    dgpState.gamma = +e.target.value;
    document.getElementById("dgp-gamma-val").textContent = dgpState.gamma.toFixed(2);
    dgpDebounced();
  });
  document.getElementById("dgp-delta").addEventListener("input", function (e) {
    dgpState.delta = +e.target.value;
    document.getElementById("dgp-delta-val").textContent = dgpState.delta.toFixed(2);
    dgpDebounced();
  });
  document.getElementById("dgp-reseed").addEventListener("click", function () {
    dgpState.seed = Math.floor(Math.random() * 1e9) + 1;
    dgp_refit();
  });
  document.getElementById("dgp-reset").addEventListener("click", function () {
    dgpState.n = 500; dgpState.alpha = 0.12; dgpState.gamma = 0.50; dgpState.delta = 0.30; dgpState.seed = 7;
    document.getElementById("dgp-n").value = dgpState.n;
    document.getElementById("dgp-alpha").value = dgpState.alpha;
    document.getElementById("dgp-gamma").value = dgpState.gamma;
    document.getElementById("dgp-delta").value = dgpState.delta;
    document.getElementById("dgp-n-val").textContent = dgpState.n;
    document.getElementById("dgp-alpha-val").textContent = dgpState.alpha.toFixed(2);
    document.getElementById("dgp-gamma-val").textContent = dgpState.gamma.toFixed(2);
    document.getElementById("dgp-delta-val").textContent = dgpState.delta.toFixed(2);
    dgp_refit();
  });

  document.getElementById("dgp-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#dgp-progress > div");
    const progLabel = document.getElementById("dgp-progress-label");
    const histEl = document.getElementById("dgp-hist");
    const histStats = document.getElementById("dgp-hist-stats");
    const N_SIMS = 100;
    const ar_simple = [], ar_dr = [];
    let i = 0;
    function step() {
      const batch = 4;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const sim = simulate_rct({
          n: dgpState.n, alpha: dgpState.alpha, gamma: dgpState.gamma,
          delta: dgpState.delta, seed: dgpState.seed + i + 1,
        });
        const est = dgp_estimate(sim);
        if (Number.isFinite(est.simple.v)) ar_simple.push(est.simple.v);
        if (Number.isFinite(est.dr.v)) ar_dr.push(est.dr.v);
      }
      progBar.style.width = (i / N_SIMS * 100) + "%";
      progLabel.textContent = "simulation " + i + " / " + N_SIMS;
      if (i < N_SIMS) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = "done (" + N_SIMS + " simulations)";
        histEl.style.display = "block";
        histStats.style.display = "grid";
        dgpHist.update({ simple: ar_simple, dr: ar_dr, alpha_true: dgpState.alpha });
        const meanS = d3.mean(ar_simple), sdS = d3.deviation(ar_simple);
        const meanD = d3.mean(ar_dr), sdD = d3.deviation(ar_dr);
        document.getElementById("dgp-simple-mean").textContent = (meanS == null ? "—" : meanS.toFixed(3));
        document.getElementById("dgp-simple-sd").textContent   = (sdS == null   ? "—" : sdS.toFixed(3));
        document.getElementById("dgp-dr-mean").textContent     = (meanD == null ? "—" : meanD.toFixed(3));
        document.getElementById("dgp-dr-sd").textContent       = (sdD == null   ? "—" : sdD.toFixed(3));
        btn.disabled = false;
      }
    }
    step();
  });

  dgp_refit();

  // ------------------------------------------------------------------
  // TAB 4 — Comprehensive forest plot of all 12 estimators
  // ------------------------------------------------------------------
  const fpChart = CHARTS.rct_forest_plot(document.getElementById("fp-chart"));

  function fpRefresh() {
    if (!window.__resultsData) return;
    const methods = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(function (el) { return el.value; });
    fpChart.update(window.__resultsData.estimates, methods);
  }
  window.__forestRefresh = fpRefresh;

  document.querySelectorAll("#fp-methods input").forEach(function (el) {
    el.addEventListener("change", fpRefresh);
  });

  // ------------------------------------------------------------------
  // Global error handler
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });

})();
