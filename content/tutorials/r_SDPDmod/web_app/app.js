// app.js — wires the DOM controls in index.html to the charts module.
// Runs after window.CHARTS is defined.

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
  // Spatial-panel utilities (used by Tabs 2 & 4).
  //
  // We use a ring of N states (queen contiguity): each state's two
  // neighbours have row-normalised weight 0.5.
  // ------------------------------------------------------------------
  function buildRingW(N) {
    const W = new Float64Array(N * N);
    for (let i = 0; i < N; i++) {
      const prev = (i - 1 + N) % N;
      const next = (i + 1) % N;
      W[i * N + prev] = 0.5;
      W[i * N + next] = 0.5;
    }
    return W;
  }

  // Solve (I - rho*W) y = b for y by Gauss-Seidel iteration. Works fine
  // because rho < 1 on a row-stochastic W (spectral radius = 1, |rho| < 1
  // ⇒ I - rho*W is strictly diagonally dominant).
  function solveIMinusRhoW(W, N, rho, b, maxIter = 200, tol = 1e-9) {
    const y = new Float64Array(N);
    for (let iter = 0; iter < maxIter; iter++) {
      let maxDelta = 0;
      for (let i = 0; i < N; i++) {
        let s = 0;
        for (let j = 0; j < N; j++) if (j !== i) s += W[i * N + j] * y[j];
        const yNew = b[i] + rho * s; // since W[i,i] = 0
        const d = Math.abs(yNew - y[i]);
        if (d > maxDelta) maxDelta = d;
        y[i] = yNew;
      }
      if (maxDelta < tol) break;
    }
    return y;
  }

  // Compute spatial lag: out[i] = sum_j W[i,j] * v[j]
  function spatialLag(W, N, v) {
    const out = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      let s = 0;
      for (let j = 0; j < N; j++) s += W[i * N + j] * v[j];
      out[i] = s;
    }
    return out;
  }

  // Mulberry32 RNG + Box-Muller for the panel simulator.
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeNormal(rng) {
    let cached = null;
    return function () {
      if (cached !== null) { const r = cached; cached = null; return r; }
      let u1, u2;
      do { u1 = rng(); } while (u1 === 0);
      u2 = rng();
      const r = Math.sqrt(-2 * Math.log(u1));
      const theta = 2 * Math.PI * u2;
      cached = r * Math.sin(theta);
      return r * Math.cos(theta);
    };
  }

  // ------------------------------------------------------------------
  // Simulate a spatial-dynamic panel of N states × T periods.
  //
  // Model:  y_t = rho*W*y_t + tau*y_{t-1} + beta*x_t + phi*W*x_t
  //              + alpha_i + gamma_t + eps_t
  //
  // Returns: { y (N*T flat), x (N*T flat), W (N*N), N, T }
  // ------------------------------------------------------------------
  function simulateSpatialPanel(opts) {
    const { N, T, rho, tau, beta, phi, sigma, seed } = opts;
    const W = buildRingW(N);
    const rng = makeRng(seed);
    const nrm = makeNormal(rng);

    // Fixed effects.
    const alpha = new Float64Array(N);
    for (let i = 0; i < N; i++) alpha[i] = 0.4 * nrm();
    const gamma = new Float64Array(T);
    for (let t = 0; t < T; t++) gamma[t] = 0.2 * nrm();

    // Regressor x_it: AR(1) in time, random across states.
    const x = new Float64Array(N * T);
    for (let i = 0; i < N; i++) {
      let prev = 0.6 * nrm();
      for (let t = 0; t < T; t++) {
        const next = 0.7 * prev + 0.7 * nrm();
        x[i * T + t] = next;
        prev = next;
      }
    }

    // Standardise x to zero mean (per state) to make β interpretable.
    for (let i = 0; i < N; i++) {
      let mean = 0;
      for (let t = 0; t < T; t++) mean += x[i * T + t];
      mean /= T;
      for (let t = 0; t < T; t++) x[i * T + t] -= mean;
    }

    // Simulate y_t period by period.
    const y = new Float64Array(N * T);
    const yLag = new Float64Array(N);
    for (let t = 0; t < T; t++) {
      // x_t vector and W*x_t.
      const xt = new Float64Array(N);
      for (let i = 0; i < N; i++) xt[i] = x[i * T + t];
      const Wxt = spatialLag(W, N, xt);

      // RHS b_i = tau*y_{i,t-1} + beta*x_it + phi*Wx_it + alpha_i + gamma_t + eps_it
      const b = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        b[i] = tau * yLag[i] + beta * xt[i] + phi * Wxt[i]
             + alpha[i] + gamma[t] + sigma * nrm();
      }
      // y_t = (I - rho*W)^-1 * b
      const yt = solveIMinusRhoW(W, N, rho, b);
      for (let i = 0; i < N; i++) {
        y[i * T + t] = yt[i];
        yLag[i] = yt[i];
      }
    }

    return { y, x, W, N, T };
  }

  // ------------------------------------------------------------------
  // Two-way demean (within transformation): subtract state mean and time
  // mean and add overall mean. Mutates the input flat (N*T) array.
  // ------------------------------------------------------------------
  function twoWayDemean(arr, N, T) {
    const out = new Float64Array(arr.length);
    let grand = 0;
    for (let i = 0; i < arr.length; i++) grand += arr[i];
    grand /= arr.length;

    const stateM = new Float64Array(N);
    const timeM = new Float64Array(T);
    for (let i = 0; i < N; i++) {
      let s = 0;
      for (let t = 0; t < T; t++) s += arr[i * T + t];
      stateM[i] = s / T;
    }
    for (let t = 0; t < T; t++) {
      let s = 0;
      for (let i = 0; i < N; i++) s += arr[i * T + t];
      timeM[t] = s / N;
    }
    for (let i = 0; i < N; i++) {
      for (let t = 0; t < T; t++) {
        out[i * T + t] = arr[i * T + t] - stateM[i] - timeM[t] + grand;
      }
    }
    return out;
  }

  // OLS regression of y on columns of X (stored row-major, n rows × k cols).
  // Returns coefficient vector (length k), or null if singular.
  function olsFit(X, y, n, k) {
    // Build XTX (k×k) and XTy (k).
    const XTX = new Float64Array(k * k);
    const XTy = new Float64Array(k);
    for (let r = 0; r < n; r++) {
      for (let a = 0; a < k; a++) {
        const xa = X[r * k + a];
        XTy[a] += xa * y[r];
        for (let b = a; b < k; b++) {
          XTX[a * k + b] += xa * X[r * k + b];
        }
      }
    }
    for (let a = 0; a < k; a++) {
      for (let b = a + 1; b < k; b++) {
        XTX[b * k + a] = XTX[a * k + b];
      }
    }
    // Cholesky decomposition.
    const L = new Float64Array(k * k);
    for (let i = 0; i < k; i++) {
      for (let j = 0; j <= i; j++) {
        let s = XTX[i * k + j];
        for (let m = 0; m < j; m++) s -= L[i * k + m] * L[j * k + m];
        if (i === j) {
          if (s <= 0) return null;
          L[i * k + j] = Math.sqrt(s);
        } else {
          L[i * k + j] = s / L[j * k + j];
        }
      }
    }
    // Solve L u = XTy
    const u = new Float64Array(k);
    for (let i = 0; i < k; i++) {
      let s = XTy[i];
      for (let m = 0; m < i; m++) s -= L[i * k + m] * u[m];
      u[i] = s / L[i * k + i];
    }
    // Solve L^T β = u
    const beta = new Float64Array(k);
    for (let i = k - 1; i >= 0; i--) {
      let s = u[i];
      for (let m = i + 1; m < k; m++) s -= L[m * k + i] * beta[m];
      beta[i] = s / L[i * k + i];
    }
    return beta;
  }

  // ------------------------------------------------------------------
  // Concentrated estimators for the spatial-dynamic panel.
  //
  // We fit three models on (y, x) after two-way demeaning:
  //   1. Non-spatial FE: y_demean ~ x_demean              (β only)
  //   2. Static SDM:    y_demean ~ x_demean + Wx_demean   (β, φ); rho profiled
  //   3. Dynamic SDM:   y_demean ~ y_lag + x + Wx         (β, φ, τ); rho profiled
  //
  // For SDM models we profile rho over a grid and pick the rho with the
  // minimum residual SSR. This mirrors the concentrated MLE that SDPDmod
  // uses but without the log-determinant Jacobian; in our balanced
  // simulation this gives an approximate but reasonable estimate.
  // ------------------------------------------------------------------
  function fitEstimators(sim) {
    const { y, x, W, N, T } = sim;
    const NT = N * T;

    // Two-way demean y and x.
    const yd = twoWayDemean(y, N, T);
    const xd = twoWayDemean(x, N, T);

    // Build W*y and W*x flat arrays (period by period).
    const Wy = new Float64Array(NT);
    const Wx = new Float64Array(NT);
    for (let t = 0; t < T; t++) {
      const yt = new Float64Array(N);
      const xt = new Float64Array(N);
      for (let i = 0; i < N; i++) { yt[i] = y[i * T + t]; xt[i] = x[i * T + t]; }
      const Wyt = spatialLag(W, N, yt);
      const Wxt = spatialLag(W, N, xt);
      for (let i = 0; i < N; i++) {
        Wy[i * T + t] = Wyt[i];
        Wx[i * T + t] = Wxt[i];
      }
    }
    const Wyd = twoWayDemean(Wy, N, T);
    const Wxd = twoWayDemean(Wx, N, T);

    // 1) Non-spatial FE: y_d ~ x_d (and a constant 0 because demeaned).
    const Xfe = new Float64Array(NT * 1);
    for (let r = 0; r < NT; r++) Xfe[r] = xd[r];
    const betaFE = olsFit(Xfe, yd, NT, 1);

    // 2) Static SDM with profiled ρ.
    //    For each ρ, regress (y_d - ρ*Wy_d) ~ x_d + Wx_d. Pick ρ minimising SSR.
    function fitStatic(rhoArr) {
      let best = { rho: 0, beta: 0, phi: 0, ssr: Infinity };
      for (const rho of rhoArr) {
        const yRho = new Float64Array(NT);
        for (let r = 0; r < NT; r++) yRho[r] = yd[r] - rho * Wyd[r];
        const X = new Float64Array(NT * 2);
        for (let r = 0; r < NT; r++) {
          X[r * 2 + 0] = xd[r];
          X[r * 2 + 1] = Wxd[r];
        }
        const b = olsFit(X, yRho, NT, 2);
        if (!b) continue;
        let ssr = 0;
        for (let r = 0; r < NT; r++) {
          const resid = yRho[r] - (b[0] * xd[r] + b[1] * Wxd[r]);
          ssr += resid * resid;
        }
        if (ssr < best.ssr) best = { rho, beta: b[0], phi: b[1], ssr };
      }
      return best;
    }

    // 3) Dynamic SDM with profiled ρ.
    //    Build y_lag column (drop t = 0). The number of rows is N*(T-1).
    function fitDynamic(rhoArr) {
      const Td = T - 1;
      const NTd = N * Td;
      const ydLag = new Float64Array(NTd);
      const ydCur = new Float64Array(NTd);
      const xdCur = new Float64Array(NTd);
      const WxdCur = new Float64Array(NTd);
      const WydCur = new Float64Array(NTd);
      // We need y_{t-1} demeaned analogously. For simplicity demean lag once.
      const yLagFlat = new Float64Array(NT);
      for (let i = 0; i < N; i++) {
        for (let t = 0; t < T; t++) {
          yLagFlat[i * T + t] = t === 0 ? 0 : y[i * T + (t - 1)];
        }
      }
      const ydLagFlat = twoWayDemean(yLagFlat, N, T);
      let idx = 0;
      for (let i = 0; i < N; i++) {
        for (let t = 1; t < T; t++) {
          ydLag[idx] = ydLagFlat[i * T + t];
          ydCur[idx] = yd[i * T + t];
          xdCur[idx] = xd[i * T + t];
          WxdCur[idx] = Wxd[i * T + t];
          WydCur[idx] = Wyd[i * T + t];
          idx++;
        }
      }
      let best = { rho: 0, tau: 0, beta: 0, phi: 0, ssr: Infinity };
      for (const rho of rhoArr) {
        const yRho = new Float64Array(NTd);
        for (let r = 0; r < NTd; r++) yRho[r] = ydCur[r] - rho * WydCur[r];
        const X = new Float64Array(NTd * 3);
        for (let r = 0; r < NTd; r++) {
          X[r * 3 + 0] = ydLag[r];
          X[r * 3 + 1] = xdCur[r];
          X[r * 3 + 2] = WxdCur[r];
        }
        const b = olsFit(X, yRho, NTd, 3);
        if (!b) continue;
        let ssr = 0;
        for (let r = 0; r < NTd; r++) {
          const resid = yRho[r] - (b[0] * ydLag[r] + b[1] * xdCur[r] + b[2] * WxdCur[r]);
          ssr += resid * resid;
        }
        if (ssr < best.ssr) best = { rho, tau: b[0], beta: b[1], phi: b[2], ssr };
      }
      return best;
    }

    // Grid for ρ. Spatial radius on row-stochastic W is 1.
    const rhoArr = d3.range(-0.05, 0.95, 0.025);

    const stat = fitStatic(rhoArr);
    const dyn = fitDynamic(rhoArr);

    return {
      fe:   { rho: null, tau: null, beta: betaFE ? betaFE[0] : NaN, phi: null },
      ssdm: { rho: stat.rho, tau: null, beta: stat.beta, phi: stat.phi },
      dsdm: { rho: dyn.rho, tau: dyn.tau, beta: dyn.beta, phi: dyn.phi },
    };
  }

  // ------------------------------------------------------------------
  // TAB 1 — Spatial ring animation.
  // ------------------------------------------------------------------
  const introAnim = CHARTS.spatial_ring_animation(document.getElementById("intro-anim"));
  document.getElementById("intro-rho").addEventListener("input", e => {
    const v = +e.target.value;
    document.getElementById("intro-rho-val").textContent = v.toFixed(2);
    introAnim.setRho(v);
  });
  document.getElementById("intro-speed").addEventListener("input", e => {
    const v = +e.target.value;
    document.getElementById("intro-speed-val").textContent = v.toFixed(1) + "×";
    introAnim.setSpeed(v);
  });

  // ------------------------------------------------------------------
  // TAB 2 — Spatial-Dynamic Simulator.
  // ------------------------------------------------------------------
  const sim = {
    N: 12, T: 30,
    rho: 0.20, tau: 0.80, beta: -0.30, phi: 0.20,
    sigma: 0.10, seed: 17,
    coefChart: CHARTS.coef_recovery(document.getElementById("sim-coef-chart")),
    mcHist: CHARTS.mc_histograms(document.getElementById("sim-mc-hist")),
  };

  function sim_refit() {
    const data = simulateSpatialPanel({
      N: sim.N, T: sim.T, rho: sim.rho, tau: sim.tau,
      beta: sim.beta, phi: sim.phi, sigma: sim.sigma, seed: sim.seed,
    });
    const est = fitEstimators(data);
    sim.est = est;
    sim_render();
  }

  function fmt(x) { return (x === null || x === undefined || !Number.isFinite(x)) ? "—" : x.toFixed(3); }
  function rmse(estimate, truth) {
    if (!Number.isFinite(estimate)) return "—";
    return Math.abs(estimate - truth).toFixed(3);
  }

  function sim_render() {
    const e = sim.est;
    document.getElementById("sim-fe-beta").textContent    = fmt(e.fe.beta);
    document.getElementById("sim-fe-rmse").textContent    = rmse(e.fe.beta, sim.beta);
    document.getElementById("sim-ssdm-rho").textContent   = fmt(e.ssdm.rho);
    document.getElementById("sim-ssdm-beta").textContent  = fmt(e.ssdm.beta);
    document.getElementById("sim-ssdm-phi").textContent   = fmt(e.ssdm.phi);
    document.getElementById("sim-ssdm-rmse").textContent  = rmse(e.ssdm.beta, sim.beta);
    document.getElementById("sim-dsdm-rho").textContent   = fmt(e.dsdm.rho);
    document.getElementById("sim-dsdm-tau").textContent   = fmt(e.dsdm.tau);
    document.getElementById("sim-dsdm-beta").textContent  = fmt(e.dsdm.beta);
    document.getElementById("sim-dsdm-phi").textContent   = fmt(e.dsdm.phi);
    document.getElementById("sim-dsdm-rmse").textContent  = rmse(e.dsdm.beta, sim.beta);

    sim.coefChart.update({
      params: [
        { name: "ρ (spatial)",      true: sim.rho,  fe: null,    ssdm: e.ssdm.rho,  dsdm: e.dsdm.rho  },
        { name: "τ (temporal)",     true: sim.tau,  fe: null,    ssdm: null,        dsdm: e.dsdm.tau  },
        { name: "β (own x)",        true: sim.beta, fe: e.fe.beta, ssdm: e.ssdm.beta, dsdm: e.dsdm.beta },
        { name: "φ (W·x spillover)",true: sim.phi,  fe: null,    ssdm: e.ssdm.phi,  dsdm: e.dsdm.phi  },
      ],
    });
  }

  const sim_onChange = debounce(sim_refit, 140);
  function bindSlider(id, key, label, prec) {
    const el = document.getElementById(id);
    const lab = document.getElementById(label);
    el.addEventListener("input", e => {
      const v = +e.target.value;
      sim[key] = v;
      lab.textContent = prec === 0 ? v.toString() : v.toFixed(prec);
      sim_onChange();
    });
  }
  bindSlider("sim-rho",  "rho",   "sim-rho-val",  2);
  bindSlider("sim-tau",  "tau",   "sim-tau-val",  2);
  bindSlider("sim-beta", "beta",  "sim-beta-val", 2);
  bindSlider("sim-phi",  "phi",   "sim-phi-val",  2);
  bindSlider("sim-T",    "T",     "sim-T-val",    0);
  bindSlider("sim-sig",  "sigma", "sim-sig-val",  2);

  // Monte-Carlo button.
  document.getElementById("sim-mc").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-mc-progress > div");
    const progLabel = document.getElementById("sim-mc-progress-label");
    const histEl = document.getElementById("sim-mc-hist");
    const N_REPS = 100;
    const feB = [], ssdmB = [], dsdmB = [];
    let i = 0;
    function tick() {
      const end = Math.min(N_REPS, i + 2);
      for (; i < end; i++) {
        const data = simulateSpatialPanel({
          N: sim.N, T: sim.T, rho: sim.rho, tau: sim.tau,
          beta: sim.beta, phi: sim.phi, sigma: sim.sigma,
          seed: sim.seed + i + 1,
        });
        const e = fitEstimators(data);
        if (Number.isFinite(e.fe.beta))   feB.push(e.fe.beta);
        if (Number.isFinite(e.ssdm.beta)) ssdmB.push(e.ssdm.beta);
        if (Number.isFinite(e.dsdm.beta)) dsdmB.push(e.dsdm.beta);
      }
      progBar.style.width = (i / N_REPS * 100) + "%";
      progLabel.textContent = `replication ${i} / ${N_REPS}`;
      if (i < N_REPS) {
        setTimeout(tick, 0);
      } else {
        progLabel.textContent = `done (${N_REPS} reps) · FE mean β̂ = ${d3.mean(feB).toFixed(3)} · static SDM mean β̂ = ${d3.mean(ssdmB).toFixed(3)} · dynamic SDM mean β̂ = ${d3.mean(dsdmB).toFixed(3)}`;
        histEl.style.display = "block";
        sim.mcHist.update({ fe: feB, ssdm: ssdmB, dsdm: dsdmB, beta_true: sim.beta });
        btn.disabled = false;
      }
    }
    tick();
  });

  // Initial fit.
  sim_refit();

  // ------------------------------------------------------------------
  // TAB 3 — Forest plot from real data.
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.decomp_forest(document.getElementById("fp-chart")),
    data: null,
  };

  function fp_refresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    const effects  = Array.from(document.querySelectorAll("#fp-effects input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, effects, outcomes);
  }

  document.querySelectorAll("#fp-outcomes input, #fp-methods input, #fp-effects input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // TAB 4 — Multiplier Explorer.
  // ------------------------------------------------------------------
  const mu = {
    rho: 0.162, tau: 0.864, beta: -0.271, phi: 0.196,
    chart: CHARTS.multiplier_chart(document.getElementById("mu-chart")),
  };

  function mu_refit() {
    // Spatial multiplier (scalar approximation for a ring with row-normalised W
    // and an "average neighbour"): same as 1/(1-rho).
    const spatialMult = 1 / (1 - mu.rho);
    const tempMult = 1 / (1 - mu.tau);

    document.getElementById("mu-spatial").textContent  = spatialMult.toFixed(2) + "×";
    document.getElementById("mu-temporal").textContent = tempMult.toFixed(2) + "×";
    document.getElementById("mu-sr-direct").textContent  = mu.beta.toFixed(3);
    document.getElementById("mu-lr-direct").textContent  = (mu.beta / (1 - mu.tau)).toFixed(3);
    document.getElementById("mu-sr-indirect").textContent = mu.phi.toFixed(3);
    document.getElementById("mu-lr-indirect").textContent = (mu.phi / (1 - mu.tau)).toFixed(3);

    // Build the dynamic impulse response on a ring of N=15 states.
    //   y_t = (I - ρW)^-1 [τ y_{t-1} + (β I + φ W) x_t]
    // We shock x_0 (state 0) by 1 at t=0, then x = 0 afterwards.
    // Track own-state (state 0) and average-neighbour responses over time.
    const N = 15;
    const W = buildRingW(N);
    const T = 25;
    let yLag = new Float64Array(N);
    const own = new Array(T).fill(0);
    const ngh = new Array(T).fill(0);
    for (let t = 0; t < T; t++) {
      // x_t shock: at t=0 only, state 0 receives a unit shock.
      const xt = new Float64Array(N);
      if (t === 0) xt[0] = 1;
      const Wxt = spatialLag(W, N, xt);
      const b = new Float64Array(N);
      for (let i = 0; i < N; i++) b[i] = mu.tau * yLag[i] + mu.beta * xt[i] + mu.phi * Wxt[i];
      const yt = solveIMinusRhoW(W, N, mu.rho, b);
      own[t] = yt[0];
      // Average neighbour (state 1) — by symmetry on the ring this equals state N-1.
      ngh[t] = (yt[1] + yt[N - 1]) / 2;
      yLag = yt;
    }
    // Long-run own and neighbour: solve the steady state where y_t = y_{t-1} = y*.
    //   y* = (1-τ)^-1 (I - ρW)^-1 (β I + φ W) x*
    // For a unit *permanent* shock at state 0 it would be that formula, but here
    // x is a one-period impulse so the long-run is back to zero — instead show
    // the cumulative sum of the impulse response, which equals the permanent-shock
    // response divided by 1 (since shock amplitude is 1).
    let cumOwn = 0, cumNgh = 0;
    for (let t = 0; t < T; t++) { cumOwn += own[t]; cumNgh += ngh[t]; }

    // Permanent-shock long-run reference value (analytic):
    //   y* = (1-τ)^-1 (I - ρW)^-1 (β e_0 + φ W e_0)
    // We approximate "own long-run" as cumOwn for the chart asymptote label.
    mu.chart.update({
      T, own, neighbour: ngh,
      lr_own: cumOwn,
      lr_neighbour: cumNgh,
    });
  }

  function bindMuSlider(id, key, label, prec) {
    const el = document.getElementById(id);
    const lab = document.getElementById(label);
    el.addEventListener("input", e => {
      const v = +e.target.value;
      mu[key] = v;
      lab.textContent = prec === 0 ? v.toString() : v.toFixed(prec === 1 ? 1 : 3);
      mu_refit();
    });
  }
  bindMuSlider("mu-rho",  "rho",  "mu-rho-val",  3);
  bindMuSlider("mu-tau",  "tau",  "mu-tau-val",  3);
  bindMuSlider("mu-beta", "beta", "mu-beta-val", 3);
  bindMuSlider("mu-phi",  "phi",  "mu-phi-val",  3);

  mu_refit();
})();
