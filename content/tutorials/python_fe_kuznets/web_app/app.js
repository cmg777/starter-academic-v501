// app.js — wires the DOM controls for python_fe_kuznets to dgp/lasso/charts.
// Topic: panel fixed effects, Kuznets curve, cubic polynomial in log GDP.
// Runs after window.DGP, window.LASSO, window.CHARTS are defined.

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Tab switching.
  // ------------------------------------------------------------------
  function activateTab(paneId) {
    document.querySelectorAll(".tab-strip button").forEach(btn => {
      const isActive = btn.dataset.pane === paneId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === paneId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll(".tab-strip button").forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.pane));
  });
  document.querySelectorAll(".cta-card[data-goto]").forEach(card => {
    card.addEventListener("click", () => activateTab(card.dataset.goto));
  });

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ------------------------------------------------------------------
  // True coefficients (from §7 of the post).
  // ------------------------------------------------------------------
  const TRUE_B1 = 0.2931;
  const TRUE_B2 = -0.0320;
  const TRUE_B3 = 0.00112;

  // ------------------------------------------------------------------
  // Numeric helpers — small OLS / TWFE solver.
  // X is row-major Float64Array of size n*p. y is Float64Array of size n.
  // No standardisation (we want raw coefficients on the cubic).
  // ------------------------------------------------------------------

  // Gauss-Jordan inverse for small symmetric matrices.
  function inv(M, k) {
    // Augment with identity
    const A = new Float64Array(k * 2 * k);
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) A[i * 2 * k + j] = M[i * k + j];
      A[i * 2 * k + k + i] = 1;
    }
    for (let i = 0; i < k; i++) {
      // Find pivot
      let piv = i;
      let best = Math.abs(A[i * 2 * k + i]);
      for (let r = i + 1; r < k; r++) {
        const v = Math.abs(A[r * 2 * k + i]);
        if (v > best) { best = v; piv = r; }
      }
      if (best < 1e-12) return null;
      if (piv !== i) {
        for (let c = 0; c < 2 * k; c++) {
          const tmp = A[i * 2 * k + c];
          A[i * 2 * k + c] = A[piv * 2 * k + c];
          A[piv * 2 * k + c] = tmp;
        }
      }
      const pv = A[i * 2 * k + i];
      for (let c = 0; c < 2 * k; c++) A[i * 2 * k + c] /= pv;
      for (let r = 0; r < k; r++) {
        if (r === i) continue;
        const factor = A[r * 2 * k + i];
        if (factor === 0) continue;
        for (let c = 0; c < 2 * k; c++) {
          A[r * 2 * k + c] -= factor * A[i * 2 * k + c];
        }
      }
    }
    const inv = new Float64Array(k * k);
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) inv[i * k + j] = A[i * 2 * k + k + j];
    }
    return inv;
  }

  // Solve OLS: β̂ = (X'X)⁻¹ X'y. Returns { beta, r2 } or null.
  function ols(X, y, n, k) {
    const XtX = new Float64Array(k * k);
    const Xty = new Float64Array(k);
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < k; a++) {
        const xa = X[i * k + a];
        Xty[a] += xa * y[i];
        for (let b = 0; b < k; b++) {
          XtX[a * k + b] += xa * X[i * k + b];
        }
      }
    }
    const inverse = inv(XtX, k);
    if (!inverse) return null;
    const beta = new Float64Array(k);
    for (let a = 0; a < k; a++) {
      let s = 0;
      for (let b = 0; b < k; b++) s += inverse[a * k + b] * Xty[b];
      beta[a] = s;
    }
    // R²
    let yMean = 0;
    for (let i = 0; i < n; i++) yMean += y[i];
    yMean /= n;
    let sst = 0, sse = 0;
    for (let i = 0; i < n; i++) {
      let yhat = 0;
      for (let a = 0; a < k; a++) yhat += X[i * k + a] * beta[a];
      sst += (y[i] - yMean) * (y[i] - yMean);
      sse += (y[i] - yhat) * (y[i] - yhat);
    }
    const r2 = sst > 0 ? 1 - sse / sst : 0;
    return { beta, r2 };
  }

  // ------------------------------------------------------------------
  // Panel data simulation.
  //   N countries, T periods. Each country has an intercept α_i ~ N(0, h²).
  //   Each period has γ_t ~ N(0, 0.005²) — small global shock.
  //   Country has its own log-GDP base ~ U(5.5, 11.0) plus a small drift over T.
  //   y_{it} = α_i + γ_t + b1*lnY_{it} + b2*lnY_{it}² + b3*lnY_{it}³ + ε_{it}
  //   with ε ~ N(0, sigma²).
  // ------------------------------------------------------------------
  function simulatePanel(opts) {
    const N = opts.N, T = opts.T, h = opts.h, sigma = opts.sigma;
    const seed = opts.seed >>> 0;
    const rng = DGP.mulberry32(seed || 1);
    const normal = DGP.makeNormal(rng);
    const nObs = N * T;
    const lx = new Float64Array(nObs);
    const lx2 = new Float64Array(nObs);
    const lx3 = new Float64Array(nObs);
    const y = new Float64Array(nObs);
    const cid = new Int32Array(nObs);
    const tid = new Int32Array(nObs);
    const country_alpha = new Float64Array(N);
    const country_baseLX = new Float64Array(N);
    const period_gamma = new Float64Array(T);
    for (let i = 0; i < N; i++) {
      country_alpha[i] = h * normal();
      country_baseLX[i] = 5.5 + (11.0 - 5.5) * rng();
    }
    for (let t = 0; t < T; t++) period_gamma[t] = 0.005 * normal();

    let k = 0;
    for (let i = 0; i < N; i++) {
      for (let t = 0; t < T; t++) {
        // Mild within-country drift over time
        const lxv = country_baseLX[i] + t * 0.10 + 0.05 * normal();
        lx[k] = lxv; lx2[k] = lxv * lxv; lx3[k] = lxv * lxv * lxv;
        cid[k] = i; tid[k] = t;
        // The intercept "level" is the country FE.
        const eta = country_alpha[i] + period_gamma[t]
                  + TRUE_B1 * lxv + TRUE_B2 * lx2[k] + TRUE_B3 * lx3[k]
                  + sigma * normal();
        y[k] = eta;
        k++;
      }
    }
    return { lx, lx2, lx3, y, cid, tid, N, T, nObs };
  }

  // Pooled OLS: gini = intercept + b1*lx + b2*lx² + b3*lx³ + ε
  function fitPooledOLS(sim) {
    const n = sim.nObs;
    const k = 4; // intercept, lx, lx2, lx3
    const X = new Float64Array(n * k);
    for (let i = 0; i < n; i++) {
      X[i * k + 0] = 1;
      X[i * k + 1] = sim.lx[i];
      X[i * k + 2] = sim.lx2[i];
      X[i * k + 3] = sim.lx3[i];
    }
    return ols(X, sim.y, n, k);
  }

  // TWFE: demean y and regressors by country and period, then OLS on the cubic
  // (no intercept after demeaning). Uses a two-step iteration so the cross
  // (country × period) effects don't double-count.
  function fitTWFE(sim) {
    const N = sim.N, T = sim.T, n = sim.nObs;
    // Iterative demean (good for unbalanced too, but our sim is balanced)
    function demeanInPlace(vec) {
      const v = new Float64Array(vec);
      // Two passes are usually enough for a balanced panel.
      for (let pass = 0; pass < 6; pass++) {
        // Country means
        const cMean = new Float64Array(N);
        const cN = new Int32Array(N);
        for (let i = 0; i < n; i++) { cMean[sim.cid[i]] += v[i]; cN[sim.cid[i]]++; }
        for (let i = 0; i < N; i++) if (cN[i] > 0) cMean[i] /= cN[i];
        for (let i = 0; i < n; i++) v[i] -= cMean[sim.cid[i]];
        // Period means
        const tMean = new Float64Array(T);
        const tN = new Int32Array(T);
        for (let i = 0; i < n; i++) { tMean[sim.tid[i]] += v[i]; tN[sim.tid[i]]++; }
        for (let i = 0; i < T; i++) if (tN[i] > 0) tMean[i] /= tN[i];
        for (let i = 0; i < n; i++) v[i] -= tMean[sim.tid[i]];
      }
      return v;
    }

    const y_d = demeanInPlace(sim.y);
    const lx_d = demeanInPlace(sim.lx);
    const lx2_d = demeanInPlace(sim.lx2);
    const lx3_d = demeanInPlace(sim.lx3);

    const k = 3; // no intercept after demeaning
    const X = new Float64Array(n * k);
    for (let i = 0; i < n; i++) {
      X[i * k + 0] = lx_d[i];
      X[i * k + 1] = lx2_d[i];
      X[i * k + 2] = lx3_d[i];
    }
    const r = ols(X, y_d, n, k);
    if (!r) return null;
    // Return betas with same order [intercept-NA, b1, b2, b3]
    return {
      beta: [0, r.beta[0], r.beta[1], r.beta[2]],
      r2: r.r2,  // this is the within-R² since we demeaned
    };
  }

  // ------------------------------------------------------------------
  // TAB 1 — Panel pooled-vs-within animation.
  // ------------------------------------------------------------------
  CHARTS.panel_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — Panel FE Simulator.
  // ------------------------------------------------------------------
  const sim2 = {
    N: 60, T: 5, h: 0.80, sigma: 0.025, seed: 11,
    scatter: CHARTS.panel_scatter(document.getElementById("sim-scatter")),
    hist: CHARTS.beta_histograms(document.getElementById("sim-hist")),
  };

  function sim2_refit() {
    const data = simulatePanel({
      N: sim2.N, T: sim2.T, h: sim2.h, sigma: sim2.sigma, seed: sim2.seed,
    });
    sim2.data = data;
    const olsFit = fitPooledOLS(data);
    const feFit = fitTWFE(data);
    sim2.olsFit = olsFit; sim2.feFit = feFit;
    sim2_render();
  }

  function fmt3(x) { return (x === null || !Number.isFinite(x)) ? "—" : x.toFixed(3); }
  function fmt4(x) { return (x === null || !Number.isFinite(x)) ? "—" : x.toFixed(4); }
  function fmt5(x) { return (x === null || !Number.isFinite(x)) ? "—" : x.toFixed(5); }

  function sim2_render() {
    if (!sim2.olsFit) {
      ["sim-ols-b1","sim-ols-b2","sim-ols-b3","sim-ols-r2",
       "sim-fe-b1","sim-fe-b2","sim-fe-b3","sim-fe-r2"].forEach(id => {
        document.getElementById(id).textContent = "—";
      });
      return;
    }
    const o = sim2.olsFit.beta;
    const f = sim2.feFit ? sim2.feFit.beta : [null, null, null, null];
    document.getElementById("sim-ols-b1").textContent = fmt3(o[1]);
    document.getElementById("sim-ols-b2").textContent = fmt4(o[2]);
    document.getElementById("sim-ols-b3").textContent = fmt5(o[3]);
    document.getElementById("sim-ols-r2").textContent = fmt3(sim2.olsFit.r2);
    document.getElementById("sim-fe-b1").textContent = fmt3(f[1]);
    document.getElementById("sim-fe-b2").textContent = fmt4(f[2]);
    document.getElementById("sim-fe-b3").textContent = fmt5(f[3]);
    document.getElementById("sim-fe-r2").textContent = fmt3(sim2.feFit ? sim2.feFit.r2 : null);

    // Build the scatter chart payload.
    const pts = [];
    for (let i = 0; i < sim2.data.nObs; i++) {
      pts.push([sim2.data.lx[i], sim2.data.y[i], sim2.data.cid[i]]);
    }
    const lxArr = Array.from(sim2.data.lx);
    const giArr = Array.from(sim2.data.y);
    const lxRange = [d3.min(lxArr) - 0.2, d3.max(lxArr) + 0.2];
    const giRange = [d3.min(giArr) - 0.05, d3.max(giArr) + 0.05];
    const truth = lx => TRUE_B1 * lx + TRUE_B2 * lx * lx + TRUE_B3 * lx * lx * lx;
    // For OLS, include the fitted intercept.
    const olsB = sim2.olsFit.beta;
    const olsFitFn = lx => olsB[0] + olsB[1] * lx + olsB[2] * lx * lx + olsB[3] * lx * lx * lx;
    // For TWFE: the demeaned slopes — re-add the mean of y to align visually.
    let yMean = 0;
    for (let i = 0; i < sim2.data.nObs; i++) yMean += sim2.data.y[i];
    yMean /= sim2.data.nObs;
    let lxMean = 0;
    for (let i = 0; i < sim2.data.nObs; i++) lxMean += sim2.data.lx[i];
    lxMean /= sim2.data.nObs;
    const fb = sim2.feFit ? sim2.feFit.beta : [0,0,0,0];
    // Build a curve passing through (lxMean, yMean) using the TWFE slopes.
    const cAtMean = yMean - (fb[1] * lxMean + fb[2] * lxMean * lxMean + fb[3] * lxMean * lxMean * lxMean);
    const feFitFn = lx => cAtMean + fb[1] * lx + fb[2] * lx * lx + fb[3] * lx * lx * lx;
    // Similarly shift truth so it's visible inside the data envelope.
    const truthShift = yMean - truth(lxMean);
    const truthFn = lx => truth(lx) + truthShift;

    sim2.scatter.update({
      points: pts,
      truth: truthFn,
      olsFit: olsFitFn,
      feFit: feFitFn,
      lxRange, giRange,
      nCountries: sim2.data.N,
    });
  }

  const onSimChange = debounce(sim2_refit, 100);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim2.N = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim2.N;
    onSimChange();
  });
  document.getElementById("sim-t").addEventListener("input", e => {
    sim2.T = +e.target.value;
    document.getElementById("sim-t-val").textContent = sim2.T;
    onSimChange();
  });
  document.getElementById("sim-h").addEventListener("input", e => {
    sim2.h = +e.target.value;
    document.getElementById("sim-h-val").textContent = sim2.h.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-s").addEventListener("input", e => {
    sim2.sigma = +e.target.value;
    document.getElementById("sim-s-val").textContent = sim2.sigma.toFixed(3);
    onSimChange();
  });
  document.getElementById("sim-reseed").addEventListener("click", () => {
    sim2.seed = Math.floor(Math.random() * 1e9) + 1;
    sim2_refit();
  });
  document.getElementById("sim-reset").addEventListener("click", () => {
    sim2.N = 60; sim2.T = 5; sim2.h = 0.80; sim2.sigma = 0.025; sim2.seed = 11;
    document.getElementById("sim-n").value = sim2.N;
    document.getElementById("sim-t").value = sim2.T;
    document.getElementById("sim-h").value = sim2.h;
    document.getElementById("sim-s").value = sim2.sigma;
    document.getElementById("sim-n-val").textContent = sim2.N;
    document.getElementById("sim-t-val").textContent = sim2.T;
    document.getElementById("sim-h-val").textContent = sim2.h.toFixed(2);
    document.getElementById("sim-s-val").textContent = sim2.sigma.toFixed(3);
    sim2_refit();
  });

  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const histEl = document.getElementById("sim-hist");
    const histStats = document.getElementById("sim-hist-stats");

    const N_SIMS = 100;
    const beta_ols = [];
    const beta_fe = [];

    let i = 0;
    function step() {
      const end = Math.min(N_SIMS, i + 2);
      for (; i < end; i++) {
        const data = simulatePanel({
          N: sim2.N, T: sim2.T, h: sim2.h, sigma: sim2.sigma,
          seed: sim2.seed + i + 1,
        });
        const o = fitPooledOLS(data);
        const f = fitTWFE(data);
        if (o && Number.isFinite(o.beta[1])) beta_ols.push(o.beta[1]);
        if (f && Number.isFinite(f.beta[1])) beta_fe.push(f.beta[1]);
      }
      const pct = (i / N_SIMS) * 100;
      progBar.style.width = pct + "%";
      progLabel.textContent = `simulation ${i} / ${N_SIMS}`;
      if (i < N_SIMS) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = `done (${N_SIMS} simulations)`;
        histEl.style.display = "block";
        histStats.style.display = "grid";
        sim2.hist.update({ beta_ols, beta_fe, beta_true: TRUE_B1 });
        const meanO = d3.mean(beta_ols);
        const meanF = d3.mean(beta_fe);
        const sdO = d3.deviation(beta_ols);
        const sdF = d3.deviation(beta_fe);
        document.getElementById("sim-ols-mean").textContent = (meanO ?? 0).toFixed(3);
        document.getElementById("sim-ols-sd").textContent   = (sdO  ?? 0).toFixed(3);
        document.getElementById("sim-fe-mean").textContent  = (meanF ?? 0).toFixed(3);
        document.getElementById("sim-fe-sd").textContent    = (sdF  ?? 0).toFixed(3);
        btn.disabled = false;
      }
    }
    step();
  });

  sim2_refit();

  // ------------------------------------------------------------------
  // TAB 3 — Turning Points.
  // ------------------------------------------------------------------
  const tp = {
    b0: 0.060, b1: 0.293, b2: -0.032, b3: 0.00112,
    chart: CHARTS.kuznets_curve(document.getElementById("tp-chart")),
  };

  function tp_compute() {
    // Derivative: 3*b3*x² + 2*b2*x + b1 = 0
    const A = 3 * tp.b3, B = 2 * tp.b2, C = tp.b1;
    const real_roots = [];
    let shape = "monotonic";
    if (Math.abs(A) < 1e-12) {
      // Quadratic: derivative = 2*b2*x + b1 = 0  ⇒  x = -b1/(2*b2)
      if (Math.abs(B) > 1e-12) {
        const r = -C / B;
        real_roots.push(r);
        shape = "one turn (∩ or ∪)";
      }
    } else {
      const disc = B * B - 4 * A * C;
      if (disc >= 0) {
        const sq = Math.sqrt(disc);
        const r1 = (-B - sq) / (2 * A);
        const r2 = (-B + sq) / (2 * A);
        real_roots.push(Math.min(r1, r2));
        real_roots.push(Math.max(r1, r2));
        shape = tp.b3 > 0 ? "N-shape" : "inverted-N";
      }
    }
    return { real_roots, shape };
  }

  function tp_render() {
    const { real_roots, shape } = tp_compute();
    tp.chart.update({
      b0: tp.b0, b1: tp.b1, b2: tp.b2, b3: tp.b3, real_roots,
    });

    // Stats
    if (real_roots.length >= 2) {
      const r1 = real_roots[0], r2 = real_roots[1];
      document.getElementById("tp-low-log").textContent = r1.toFixed(3);
      document.getElementById("tp-high-log").textContent = r2.toFixed(3);
      document.getElementById("tp-low-usd").textContent =
        `\$${Math.round(Math.exp(r1)).toLocaleString()}`;
      document.getElementById("tp-high-usd").textContent =
        `\$${Math.round(Math.exp(r2)).toLocaleString()}`;
    } else if (real_roots.length === 1) {
      document.getElementById("tp-low-log").textContent = real_roots[0].toFixed(3);
      document.getElementById("tp-high-log").textContent = "—";
      document.getElementById("tp-low-usd").textContent =
        `\$${Math.round(Math.exp(real_roots[0])).toLocaleString()}`;
      document.getElementById("tp-high-usd").textContent = "—";
    } else {
      document.getElementById("tp-low-log").textContent = "—";
      document.getElementById("tp-high-log").textContent = "—";
      document.getElementById("tp-low-usd").textContent = "no real root";
      document.getElementById("tp-high-usd").textContent = "no real root";
    }
    document.getElementById("tp-shape").textContent = shape;
  }

  function tp_setSliders(b1, b2, b3, b0) {
    tp.b1 = b1; tp.b2 = b2; tp.b3 = b3; tp.b0 = b0;
    document.getElementById("tp-b1").value = b1;
    document.getElementById("tp-b2").value = b2;
    document.getElementById("tp-b3").value = b3;
    document.getElementById("tp-b0").value = b0;
    document.getElementById("tp-b1-val").textContent = b1.toFixed(3);
    document.getElementById("tp-b2-val").textContent = b2.toFixed(4);
    document.getElementById("tp-b3-val").textContent = b3.toFixed(5);
    document.getElementById("tp-b0-val").textContent = b0.toFixed(3);
    tp_render();
  }

  document.getElementById("tp-b1").addEventListener("input", e => {
    tp.b1 = +e.target.value;
    document.getElementById("tp-b1-val").textContent = tp.b1.toFixed(3);
    tp_render();
  });
  document.getElementById("tp-b2").addEventListener("input", e => {
    tp.b2 = +e.target.value;
    document.getElementById("tp-b2-val").textContent = tp.b2.toFixed(4);
    tp_render();
  });
  document.getElementById("tp-b3").addEventListener("input", e => {
    tp.b3 = +e.target.value;
    document.getElementById("tp-b3-val").textContent = tp.b3.toFixed(5);
    tp_render();
  });
  document.getElementById("tp-b0").addEventListener("input", e => {
    tp.b0 = +e.target.value;
    document.getElementById("tp-b0-val").textContent = tp.b0.toFixed(3);
    tp_render();
  });
  document.getElementById("tp-snap").addEventListener("click", () => {
    tp_setSliders(0.293, -0.032, 0.00112, 0.060);
  });
  document.getElementById("tp-quad").addEventListener("click", () => {
    tp_setSliders(0.055, -0.0035, 0.0, 0.060);
  });
  tp_render();

  // ------------------------------------------------------------------
  // TAB 4 — Coefficient Stability forest plot.
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
    detBars: CHARTS.determinant_bars(document.getElementById("fp-det-bars")),
    data: null,
  };

  function fp_refresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, outcomes);
  }

  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
    if (Array.isArray(data.determinants)) {
      fp.detBars.update(data.determinants);
    }
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app/python_fe_kuznets] uncaught error:", e.error);
  });
})();
