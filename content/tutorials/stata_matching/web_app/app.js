// app.js — Treatment Effects in Stata, interactive companion.
// Wires DOM controls to dgp/lasso/charts modules. Runs after
// window.DGP, window.LASSO, and window.CHARTS are defined.

(function () {
  "use strict";

  // ---- Tab switching ---------------------------------------------------------
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

  // ---- Generic debounce ------------------------------------------------------
  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ---- Color palette (matches charts.js / styles.css) ------------------------
  const COL = {
    bg:    "#1f2b5e",
    panel: "#182447",
    steel: "#6a9bcc",
    orange:"#d97757",
    teal:  "#00d4c8",
    text:  "#e8ecf2",
    muted: "#8b9dc3",
    line:  "rgba(232, 236, 242, 0.18)",
    grid:  "rgba(232, 236, 242, 0.08)",
    faint: "rgba(232, 236, 242, 0.15)",
  };

  // ---- TAB 1: L1 vs L2 animation --------------------------------------------
  CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));

  // ============================================================================
  // Confounded data-generating process (used by Tabs 2 and 3).
  // -----------------------------------------------------------------------------
  // X ~ N(0,1)
  // logit(P(D=1|X)) = gamma * X        → propensity score e(X) = sigmoid(gamma*X)
  // Y = mu0 + tau * D + delta * X + eps,   eps ~ N(0, sigma_y^2)
  //
  // True ATE = tau. True ATT = tau (because effect is constant in X).
  // ============================================================================
  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

  function simulate_matching(opts) {
    const n = Math.max(50, opts.n | 0);
    const gamma = +opts.gamma;
    const delta = +opts.delta;
    const tau = +opts.tau;
    const mu0 = 3413;   // baseline ~ non-smoker mean in real data
    const sigma_y = 400;
    const seed = (opts.seed >>> 0) || 1;
    const rng = DGP.mulberry32(seed);
    const normal = DGP.makeNormal(rng);

    const X = new Float64Array(n);
    const D = new Uint8Array(n);
    const Y = new Float64Array(n);
    const e = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      X[i] = normal();
      e[i] = sigmoid(gamma * X[i]);
      D[i] = rng() < e[i] ? 1 : 0;
      Y[i] = mu0 + tau * D[i] + delta * X[i] + sigma_y * normal();
    }
    return { X, D, Y, e, n, tau };
  }

  // ---- Estimators -----------------------------------------------------------
  // Naive: difference of means.
  function est_naive(sim) {
    let s1 = 0, n1 = 0, s0 = 0, n0 = 0;
    for (let i = 0; i < sim.n; i++) {
      if (sim.D[i]) { s1 += sim.Y[i]; n1++; }
      else { s0 += sim.Y[i]; n0++; }
    }
    const m1 = n1 ? s1 / n1 : NaN;
    const m0 = n0 ? s0 / n0 : NaN;
    return { tau_hat: m1 - m0, m1, m0, n1, n0 };
  }

  // OLS for outcome model: Y = a0 + a1*D + a2*X + eps.
  // Returns { intercept, beta_D, beta_X } via direct 3-param solve.
  function ols_DX(D, X, Y, n) {
    // Build normal equations sum of x^T x and x^T y.
    let n_ = n, sD = 0, sX = 0, sY = 0;
    let sDD = 0, sXX = 0, sDX = 0, sDY = 0, sXY = 0;
    for (let i = 0; i < n; i++) {
      const d = D[i], x = X[i], y = Y[i];
      sD += d; sX += x; sY += y;
      sDD += d * d; sXX += x * x; sDX += d * x;
      sDY += d * y; sXY += x * y;
    }
    // 3x3 normal equations: [[n, sD, sX], [sD, sDD, sDX], [sX, sDX, sXX]] * b = [sY, sDY, sXY]
    const M = [
      [n_, sD, sX],
      [sD, sDD, sDX],
      [sX, sDX, sXX],
    ];
    const b = [sY, sDY, sXY];
    // Gaussian elimination
    for (let i = 0; i < 3; i++) {
      // Find pivot
      let maxA = Math.abs(M[i][i]), maxR = i;
      for (let r = i + 1; r < 3; r++) if (Math.abs(M[r][i]) > maxA) { maxA = Math.abs(M[r][i]); maxR = r; }
      if (maxA < 1e-12) return null;
      if (maxR !== i) { [M[i], M[maxR]] = [M[maxR], M[i]]; [b[i], b[maxR]] = [b[maxR], b[i]]; }
      for (let r = i + 1; r < 3; r++) {
        const f = M[r][i] / M[i][i];
        for (let c = i; c < 3; c++) M[r][c] -= f * M[i][c];
        b[r] -= f * b[i];
      }
    }
    const beta = [0, 0, 0];
    for (let i = 2; i >= 0; i--) {
      let s = b[i];
      for (let c = i + 1; c < 3; c++) s -= M[i][c] * beta[c];
      beta[i] = s / M[i][i];
    }
    return { a0: beta[0], beta_D: beta[1], beta_X: beta[2] };
  }

  // Logistic regression for propensity: P(D=1|X) = sigmoid(b0 + b1*X)
  // Simple Newton-Raphson, 25 iterations max.
  function logit_X(D, X, n) {
    let b0 = 0, b1 = 0;
    for (let iter = 0; iter < 30; iter++) {
      let g0 = 0, g1 = 0;
      let h00 = 0, h01 = 0, h11 = 0;
      for (let i = 0; i < n; i++) {
        const p = sigmoid(b0 + b1 * X[i]);
        const r = D[i] - p;
        const w = p * (1 - p);
        g0 += r; g1 += r * X[i];
        h00 += w; h01 += w * X[i]; h11 += w * X[i] * X[i];
      }
      const det = h00 * h11 - h01 * h01;
      if (Math.abs(det) < 1e-12) break;
      const d0 = (h11 * g0 - h01 * g1) / det;
      const d1 = (-h01 * g0 + h00 * g1) / det;
      b0 += d0; b1 += d1;
      if (Math.abs(d0) + Math.abs(d1) < 1e-8) break;
    }
    return { b0, b1 };
  }

  // Regression Adjustment: fit Y = a0 + tau*D + beta*X + eps, ATE = tau coefficient.
  // (Equivalent to averaging predicted potential outcomes because the model is linear
  // and additive in D for this DGP.)
  function est_ra(sim) {
    const f = ols_DX(sim.D, sim.X, sim.Y, sim.n);
    return f ? { tau_hat: f.beta_D } : { tau_hat: NaN };
  }

  // IPW with logistic propensity. Trims propensities to [0.02, 0.98] for stability.
  function est_ipw(sim) {
    const { b0, b1 } = logit_X(sim.D, sim.X, sim.n);
    let num1 = 0, w1 = 0, num0 = 0, w0 = 0;
    for (let i = 0; i < sim.n; i++) {
      let p = sigmoid(b0 + b1 * sim.X[i]);
      p = Math.max(0.02, Math.min(0.98, p));
      if (sim.D[i]) { num1 += sim.Y[i] / p; w1 += 1 / p; }
      else { num0 += sim.Y[i] / (1 - p); w0 += 1 / (1 - p); }
    }
    const m1 = w1 ? num1 / w1 : NaN;
    const m0 = w0 ? num0 / w0 : NaN;
    return { tau_hat: m1 - m0 };
  }

  // AIPW: combines RA potential outcomes with IPW residual correction.
  function est_aipw(sim) {
    // Outcome model: fit Y = a0 + tau*D + beta*X separately would be more textbook,
    // but for this simple DGP we use single regression with D and X and impute Y(1), Y(0).
    const f = ols_DX(sim.D, sim.X, sim.Y, sim.n);
    if (!f) return { tau_hat: NaN };
    const { b0, b1 } = logit_X(sim.D, sim.X, sim.n);

    let sum = 0;
    for (let i = 0; i < sim.n; i++) {
      const mu1 = f.a0 + f.beta_D * 1 + f.beta_X * sim.X[i];
      const mu0 = f.a0 + f.beta_D * 0 + f.beta_X * sim.X[i];
      let p = sigmoid(b0 + b1 * sim.X[i]);
      p = Math.max(0.02, Math.min(0.98, p));
      const Di = sim.D[i], Yi = sim.Y[i];
      sum += (mu1 - mu0)
           + (Di / p) * (Yi - mu1)
           - ((1 - Di) / (1 - p)) * (Yi - mu0);
    }
    return { tau_hat: sum / sim.n };
  }

  // ============================================================================
  // TAB 2: Confounding Lab — overlap histogram + bias readouts.
  // ============================================================================
  const ov = { n: 500, gamma: 1.5, delta: 120, seed: 11, tau: -200 };

  function ov_make_chart() {
    const container = document.getElementById("ov-overlap");
    container.innerHTML = "";
    const W = 880, H = 360;
    const margin = { top: 70, right: 24, bottom: 44, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    return { svg, g, w, h };
  }
  const ovChart = ov_make_chart();

  function ov_render() {
    const sim = simulate_matching({ n: ov.n, gamma: ov.gamma, delta: ov.delta, tau: ov.tau, seed: ov.seed });
    const propTreated = [], propControl = [];
    for (let i = 0; i < sim.n; i++) {
      if (sim.D[i]) propTreated.push(sim.e[i]);
      else propControl.push(sim.e[i]);
    }
    const naive = est_naive(sim);
    const pct = (100 * propTreated.length / sim.n);
    const bias = naive.tau_hat - ov.tau;

    document.getElementById("ov-stat-true").textContent  = ov.tau;
    document.getElementById("ov-stat-naive").textContent = naive.tau_hat.toFixed(1);
    document.getElementById("ov-stat-bias").textContent  = (bias >= 0 ? "+" : "") + bias.toFixed(1) + " g";
    document.getElementById("ov-stat-pct").textContent   = pct.toFixed(1) + "%";

    // Color bias readout: red-ish when |bias| > 25, green-ish when small.
    const biasEl = document.getElementById("ov-stat-bias");
    biasEl.style.color = Math.abs(bias) > 25 ? COL.orange : COL.teal;

    // Draw overlap histogram.
    const { g, w, h } = ovChart;
    g.selectAll("*").remove();
    const x = d3.scaleLinear().domain([0, 1]).range([0, w]);
    const nBins = 22;
    const bin = d3.bin().domain([0, 1]).thresholds(nBins);
    const binsT = bin(propTreated);
    const binsC = bin(propControl);
    const maxC = d3.max(binsT.concat(binsC), d => d.length) || 1;
    const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

    function bars(bins, color, opacity) {
      g.selectAll(null).data(bins).enter().append("rect")
        .attr("x", d => x(d.x0))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length))
        .attr("fill", color).attr("opacity", opacity);
    }
    bars(binsC, COL.steel, 0.65);
    bars(binsT, COL.orange, 0.80);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".1f")))
      .selectAll("text").attr("fill", COL.muted);
    g.append("g").call(d3.axisLeft(y).ticks(5))
      .selectAll("text").attr("fill", COL.muted);
    g.selectAll(".domain, .tick line").attr("stroke", COL.muted);

    g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", COL.text).attr("font-size", 12)
      .text("Estimated propensity score  e(X) = P(D = 1 | X)");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-32})`)
      .attr("text-anchor", "middle").attr("fill", COL.text).attr("font-size", 12)
      .text("Count");

    // Legend — placed ABOVE the plot area so it never overlaps histogram bars.
    ovChart.svg.selectAll("g.legend-host").remove();
    const lg = ovChart.svg.append("g").attr("class", "legend-host")
      .attr("transform", `translate(${50},10)`);
    lg.append("rect").attr("width", 360).attr("height", 30).attr("fill", "rgba(15,23,41,0.55)")
      .attr("stroke", COL.line).attr("rx", 6);
    lg.append("rect").attr("x", 12).attr("y", 10).attr("width", 14).attr("height", 10).attr("fill", COL.orange).attr("opacity", 0.8);
    lg.append("text").attr("x", 32).attr("y", 20).attr("fill", COL.text).attr("font-size", 11).text("Treated (smokers)");
    lg.append("rect").attr("x", 180).attr("y", 10).attr("width", 14).attr("height", 10).attr("fill", COL.steel).attr("opacity", 0.65);
    lg.append("text").attr("x", 200).attr("y", 20).attr("fill", COL.text).attr("font-size", 11).text("Control (non-smokers)");
  }

  const ov_debounced = debounce(ov_render, 80);
  document.getElementById("ov-n").addEventListener("input", e => {
    ov.n = +e.target.value;
    document.getElementById("ov-n-val").textContent = ov.n;
    ov_debounced();
  });
  document.getElementById("ov-g").addEventListener("input", e => {
    ov.gamma = +e.target.value;
    document.getElementById("ov-g-val").textContent = ov.gamma.toFixed(2);
    ov_debounced();
  });
  document.getElementById("ov-d").addEventListener("input", e => {
    ov.delta = +e.target.value;
    document.getElementById("ov-d-val").textContent = ov.delta;
    ov_debounced();
  });
  document.getElementById("ov-reseed").addEventListener("click", () => {
    ov.seed = Math.floor(Math.random() * 1e9) + 1;
    ov_render();
  });
  document.getElementById("ov-reset").addEventListener("click", () => {
    ov.n = 500; ov.gamma = 1.5; ov.delta = 120; ov.seed = 11;
    document.getElementById("ov-n").value = ov.n;
    document.getElementById("ov-g").value = ov.gamma;
    document.getElementById("ov-d").value = ov.delta;
    document.getElementById("ov-n-val").textContent = ov.n;
    document.getElementById("ov-g-val").textContent = ov.gamma.toFixed(2);
    document.getElementById("ov-d-val").textContent = ov.delta;
    ov_render();
  });
  ov_render();

  // ============================================================================
  // TAB 3: Estimator Simulator — Naive vs RA vs IPW vs AIPW on simulated DGP.
  // ============================================================================
  const sim_state = { n: 400, gamma: 1.5, delta: 120, tau: -200, seed: 7 };

  // Custom 4-bar comparison chart (richer than alpha_compare which only supports 2 bars).
  function sim_make_chart() {
    const container = document.getElementById("sim-compare");
    container.innerHTML = "";
    const W = 880, H = 300;
    const margin = { top: 24, right: 24, bottom: 44, left: 130 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    return { svg, g, w, h };
  }
  const simChart = sim_make_chart();

  function sim_render_chart(rows, tau) {
    const { g, w, h } = simChart;
    g.selectAll("*").remove();
    const allVals = rows.map(d => d.v).concat([tau, 0]);
    const ext = d3.extent(allVals);
    const span = Math.max(50, ext[1] - ext[0]);
    const pad = span * 0.10;
    const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
    const y = d3.scaleBand().domain(rows.map(d => d.name)).range([0, h]).padding(0.30);

    g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
      .attr("stroke", COL.faint).attr("stroke-dasharray", "3 4");
    g.append("line").attr("x1", x(tau)).attr("x2", x(tau)).attr("y1", 0).attr("y2", h)
      .attr("stroke", COL.steel).attr("stroke-width", 2);
    g.append("text").attr("x", x(tau) + 4).attr("y", -6)
      .attr("fill", COL.steel).attr("font-size", 11)
      .text(`true τ = ${tau} g`);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".0f")))
      .selectAll("text").attr("fill", COL.muted);
    g.selectAll(".domain, .tick line").attr("stroke", COL.muted);
    g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", COL.text).attr("font-size", 12)
      .text("Estimated ATE  τ̂  (grams)");

    rows.forEach(d => {
      const yc = y(d.name) + y.bandwidth() / 2;
      g.append("text").attr("x", -10).attr("y", yc + 4)
        .attr("text-anchor", "end").attr("fill", COL.text).attr("font-size", 12).text(d.name);
      const x0 = x(0), x1 = x(d.v);
      g.append("rect")
        .attr("x", Math.min(x0, x1))
        .attr("y", y(d.name) + y.bandwidth() * 0.15)
        .attr("width", Math.abs(x1 - x0))
        .attr("height", y.bandwidth() * 0.70)
        .attr("fill", d.color).attr("opacity", 0.85);
      g.append("text")
        .attr("x", x1 + (x1 >= x0 ? 6 : -6))
        .attr("text-anchor", x1 >= x0 ? "start" : "end")
        .attr("y", yc + 4)
        .attr("fill", COL.text).attr("font-size", 12).attr("font-weight", 600)
        .text(d.v.toFixed(1));
    });
  }

  function sim_render() {
    const sim = simulate_matching({
      n: sim_state.n, gamma: sim_state.gamma, delta: sim_state.delta,
      tau: sim_state.tau, seed: sim_state.seed,
    });
    const naive = est_naive(sim);
    const ra = est_ra(sim);
    const ipw = est_ipw(sim);
    const aipw = est_aipw(sim);

    document.getElementById("sim-naive").textContent = naive.tau_hat.toFixed(1);
    document.getElementById("sim-ym1").textContent   = naive.m1.toFixed(1);
    document.getElementById("sim-ym0").textContent   = naive.m0.toFixed(1);
    document.getElementById("sim-bias").textContent  = (naive.tau_hat - sim_state.tau).toFixed(1) + " g";
    document.getElementById("sim-ra").textContent    = ra.tau_hat.toFixed(1);
    document.getElementById("sim-ipw").textContent   = ipw.tau_hat.toFixed(1);
    document.getElementById("sim-aipw").textContent  = aipw.tau_hat.toFixed(1);
    document.getElementById("sim-true").textContent  = sim_state.tau.toFixed(1);

    sim_render_chart([
      { name: "Naive",         v: naive.tau_hat, color: COL.orange },
      { name: "RA",            v: ra.tau_hat,    color: COL.steel  },
      { name: "IPW",           v: ipw.tau_hat,   color: "#9bdcc3"  },
      { name: "AIPW",          v: aipw.tau_hat,  color: COL.teal   },
    ], sim_state.tau);
  }

  const sim_debounced = debounce(sim_render, 100);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim_state.n = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim_state.n;
    sim_debounced();
  });
  document.getElementById("sim-g").addEventListener("input", e => {
    sim_state.gamma = +e.target.value;
    document.getElementById("sim-g-val").textContent = sim_state.gamma.toFixed(2);
    sim_debounced();
  });
  document.getElementById("sim-d").addEventListener("input", e => {
    sim_state.delta = +e.target.value;
    document.getElementById("sim-d-val").textContent = sim_state.delta;
    sim_debounced();
  });
  document.getElementById("sim-t").addEventListener("input", e => {
    sim_state.tau = +e.target.value;
    document.getElementById("sim-t-val").textContent = sim_state.tau;
    sim_debounced();
  });

  // 100-sim Monte Carlo (Naive vs AIPW).
  function sim_make_hist() {
    const container = document.getElementById("sim-hist");
    container.innerHTML = "";
    const W = 880, H = 280;
    const margin = { top: 18, right: 24, bottom: 38, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    return { svg, g, w, h };
  }

  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const histEl = document.getElementById("sim-hist");
    const histStats = document.getElementById("sim-hist-stats");

    const N_SIMS = 100;
    const naive_arr = [];
    const aipw_arr = [];

    let i = 0;
    function step() {
      const end = Math.min(N_SIMS, i + 4);
      for (; i < end; i++) {
        const sim = simulate_matching({
          n: sim_state.n, gamma: sim_state.gamma, delta: sim_state.delta,
          tau: sim_state.tau, seed: sim_state.seed + i + 1,
        });
        const n_ = est_naive(sim).tau_hat;
        const a_ = est_aipw(sim).tau_hat;
        if (Number.isFinite(n_)) naive_arr.push(n_);
        if (Number.isFinite(a_)) aipw_arr.push(a_);
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

        // Draw two-distribution histogram of estimates.
        const { g, w, h } = sim_make_hist();
        g.selectAll("*").remove();
        const all = naive_arr.concat(aipw_arr).concat([sim_state.tau]);
        const ext = d3.extent(all);
        const span = Math.max(40, ext[1] - ext[0]);
        const pad = span * 0.05;
        const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
        const nBins = 24;
        const bin = d3.bin().domain(x.domain()).thresholds(nBins);
        const binsN = bin(naive_arr);
        const binsA = bin(aipw_arr);
        const maxC = d3.max(binsN.concat(binsA), d => d.length) || 1;
        const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);
        function bars(bins, color, opacity) {
          g.selectAll(null).data(bins).enter().append("rect")
            .attr("x", d => x(d.x0))
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr("y", d => y(d.length))
            .attr("height", d => y(0) - y(d.length))
            .attr("fill", color).attr("opacity", opacity);
        }
        bars(binsN, COL.orange, 0.65);
        bars(binsA, COL.teal, 0.85);

        g.append("line").attr("x1", x(sim_state.tau)).attr("x2", x(sim_state.tau))
          .attr("y1", 0).attr("y2", h)
          .attr("stroke", COL.steel).attr("stroke-width", 2);
        g.append("text").attr("x", x(sim_state.tau) + 4).attr("y", 10)
          .attr("fill", COL.steel).attr("font-size", 11)
          .text(`true τ = ${sim_state.tau} g`);

        g.append("g").attr("transform", `translate(0,${h})`)
          .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".0f")))
          .selectAll("text").attr("fill", COL.muted);
        g.append("g").call(d3.axisLeft(y).ticks(5))
          .selectAll("text").attr("fill", COL.muted);
        g.selectAll(".domain, .tick line").attr("stroke", COL.muted);
        g.append("text").attr("transform", `translate(${w / 2},${h + 32})`)
          .attr("text-anchor", "middle").attr("fill", COL.text).attr("font-size", 12)
          .text("Estimated τ̂ (grams) across 100 simulated datasets — orange = Naive, teal = AIPW");

        const meanN = d3.mean(naive_arr);
        const meanA = d3.mean(aipw_arr);
        const sdN   = d3.deviation(naive_arr);
        const sdA   = d3.deviation(aipw_arr);
        document.getElementById("sim-naive-mean").textContent = (meanN ?? 0).toFixed(1);
        document.getElementById("sim-naive-sd").textContent   = (sdN  ?? 0).toFixed(1);
        document.getElementById("sim-aipw-mean").textContent  = (meanA ?? 0).toFixed(1);
        document.getElementById("sim-aipw-sd").textContent    = (sdA  ?? 0).toFixed(1);
        btn.disabled = false;
      }
    }
    step();
  });

  sim_render();

  // ============================================================================
  // TAB 4: Forest plot — real data from ate_estimates.csv.
  // ============================================================================
  // Build a small custom forest renderer because the templated forest_plot only
  // colors a fixed set of method names; we have a different set (Naive, RA, IPW,
  // IPWRA, AIPW, NNM, PSM) and the data is bweight (grams), not log change.
  const fp = { chart: null, data: null };

  function fp_make_chart() {
    const container = document.getElementById("fp-chart");
    container.innerHTML = "";
    const W = 880;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} 400`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");
    return { svg, tooltip, W };
  }
  fp.chart = fp_make_chart();

  const FP_COLORS = {
    "Naive":  COL.orange,
    "RA":     COL.steel,
    "IPW":    "#9bdcc3",
    "IPWRA":  COL.teal,
    "AIPW":   COL.teal,
    "NNM":    "#c8d0e0",
    "PSM":    COL.muted,
  };

  function fp_render() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    const rows = fp.data.estimates.filter(d => outcomes.includes(d.outcome) && methods.includes(d.method));

    const { svg, tooltip, W } = fp.chart;
    svg.selectAll("*").remove();

    const margin = { top: 32, right: 24, bottom: 48, left: 130 };
    const facetGap = 24;
    const nFacets = Math.max(1, outcomes.length);
    const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / nFacets;
    const facetH = 30 * methods.length + 24;
    const totalH = margin.top + facetH + margin.bottom;
    svg.attr("viewBox", `0 0 ${W} ${totalH}`);

    const container = document.getElementById("fp-chart");

    outcomes.forEach((outcome, oi) => {
      const facet = svg.append("g")
        .attr("transform", `translate(${margin.left + oi * (facetW + facetGap)},${margin.top})`);

      const subset = rows.filter(d => d.outcome === outcome);
      if (!subset.length) return;
      const flat = subset.flatMap(d => [d.ci_lo, d.ci_hi]);
      const ext = d3.extent(flat);
      const xMin = Math.min(0, ext[0] || 0);
      const xMax = Math.max(0, ext[1] || 0);
      const pad = Math.max(10, (xMax - xMin) * 0.08);
      const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, facetW]);
      const y = d3.scaleBand().domain(methods).range([0, facetH]).padding(0.30);

      // Facet title
      facet.append("text").attr("x", facetW / 2).attr("y", -12)
        .attr("text-anchor", "middle").attr("fill", COL.text).attr("font-size", 13)
        .attr("font-weight", 600).text(`${outcome} — birth-weight effect (grams)`);

      // Zero line.
      facet.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", facetH)
        .attr("stroke", COL.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 4");

      // x axis.
      facet.append("g").attr("transform", `translate(0,${facetH})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0f")))
        .selectAll("text").attr("fill", COL.muted).attr("font-size", 10);
      facet.selectAll(".domain, .tick line").attr("stroke", COL.muted);
      facet.append("text").attr("x", facetW / 2).attr("y", facetH + 32)
        .attr("text-anchor", "middle").attr("fill", COL.text).attr("font-size", 11)
        .text("Estimate ± 95% CI (grams)");

      if (oi === 0) {
        methods.forEach(m => {
          svg.append("text")
            .attr("x", margin.left - 10)
            .attr("y", margin.top + y(m) + y.bandwidth() / 2 + 4)
            .attr("text-anchor", "end")
            .attr("fill", COL.text)
            .attr("font-size", 12)
            .text(m);
        });
      }

      subset.forEach(d => {
        const yc = y(d.method) + y.bandwidth() / 2;
        const c = FP_COLORS[d.method] || COL.text;
        const g = facet.append("g").attr("class", "row").style("cursor", "pointer");
        g.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc).attr("stroke", c).attr("stroke-width", 2.5);
        g.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
          .attr("y1", yc - 4).attr("y2", yc + 4).attr("stroke", c).attr("stroke-width", 2);
        g.append("line").attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
          .attr("y1", yc - 4).attr("y2", yc + 4).attr("stroke", c).attr("stroke-width", 2);
        g.append("circle").attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5.5)
          .attr("fill", c).attr("stroke", "#fff").attr("stroke-width", 1);
        g.on("mousemove", function (ev) {
          const rect = container.getBoundingClientRect();
          tooltip.html(
            `<div><strong style="color:${c}">${d.method}</strong> · ${d.outcome}</div>` +
            `<div><span class='tooltip-key'>τ̂ =</span> <span class='tooltip-val'>${d.estimate.toFixed(2)} g</span></div>` +
            `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(2)}</span></div>` +
            `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(1)}, ${d.ci_hi.toFixed(1)}]</span></div>` +
            `<div><span class='tooltip-key'>covariates =</span> <span class='tooltip-val'>${d.n_selected}</span></div>`
          )
          .classed("show", true)
          .style("left", (ev.clientX - rect.left + 12) + "px")
          .style("top",  (ev.clientY - rect.top  + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });
      });
    });
  }

  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_render);
  });

  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_render();
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[web_app] uncaught error:", e.error);
  });
})();
