// app.js — wires the DOM controls to charts.js for the stata_rd web app.
// Runs after window.CHARTS (and window.DGP from the verbatim template, which we
// reuse only for the seeded RNG primitives) are defined.

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

  // ------------------------------------------------------------------
  // Seeded RNG and standard normal generator. We rebuild a tiny PRNG
  // here because DGP from the verbatim template is set up for the LASSO
  // matrix world; for an RD sim we just need scalars.
  // ------------------------------------------------------------------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeNormal(rng) {
    let cached = null;
    return function () {
      if (cached !== null) { const r = cached; cached = null; return r; }
      let u, v;
      do { u = rng(); } while (u < 1e-10);
      v = rng();
      const mag = Math.sqrt(-2 * Math.log(u));
      cached = mag * Math.sin(2 * Math.PI * v);
      return mag * Math.cos(2 * Math.PI * v);
    };
  }
  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ------------------------------------------------------------------
  // Closed-form OLS on a design matrix X (n by k) and response y.
  // Returns null on near-singular X'X. Uses Cholesky-free normal equations
  // (k is at most ~6 here so straightforward inversion is fine).
  // ------------------------------------------------------------------
  function ols_fit(X, y, n, k) {
    // Build X'X (k by k) and X'y (k).
    const XtX = new Float64Array(k * k);
    const Xty = new Float64Array(k);
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < k; a++) {
        const xa = X[i * k + a];
        Xty[a] += xa * y[i];
        for (let b = a; b < k; b++) {
          XtX[a * k + b] += xa * X[i * k + b];
        }
      }
    }
    for (let a = 0; a < k; a++) for (let b = 0; b < a; b++) XtX[a * k + b] = XtX[b * k + a];

    // Solve via Gauss-Jordan with partial pivoting on [XtX | Xty | I].
    const M = new Float64Array(k * (k + 1));
    for (let a = 0; a < k; a++) {
      for (let b = 0; b < k; b++) M[a * (k + 1) + b] = XtX[a * k + b];
      M[a * (k + 1) + k] = Xty[a];
    }
    for (let col = 0; col < k; col++) {
      // Pivot.
      let pivRow = col, pivVal = Math.abs(M[col * (k + 1) + col]);
      for (let r = col + 1; r < k; r++) {
        const v = Math.abs(M[r * (k + 1) + col]);
        if (v > pivVal) { pivVal = v; pivRow = r; }
      }
      if (pivVal < 1e-12) return null;
      if (pivRow !== col) {
        for (let c = 0; c <= k; c++) {
          const tmp = M[col * (k + 1) + c];
          M[col * (k + 1) + c] = M[pivRow * (k + 1) + c];
          M[pivRow * (k + 1) + c] = tmp;
        }
      }
      const piv = M[col * (k + 1) + col];
      for (let c = col; c <= k; c++) M[col * (k + 1) + c] /= piv;
      for (let r = 0; r < k; r++) {
        if (r === col) continue;
        const f = M[r * (k + 1) + col];
        if (f !== 0) for (let c = col; c <= k; c++) M[r * (k + 1) + c] -= f * M[col * (k + 1) + c];
      }
    }
    const beta = new Float64Array(k);
    for (let a = 0; a < k; a++) beta[a] = M[a * (k + 1) + k];

    // Residuals + heteroskedasticity-robust standard errors (HC0).
    const r = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let yhat = 0;
      for (let a = 0; a < k; a++) yhat += X[i * k + a] * beta[a];
      r[i] = y[i] - yhat;
    }
    // Standard (non-robust) variance for simplicity:
    let rss = 0;
    for (let i = 0; i < n; i++) rss += r[i] * r[i];
    const sigma2 = n > k ? rss / (n - k) : NaN;
    // (X'X)^-1 from the GJ result on identity is omitted; redo by solving k
    // unit-vector RHSes. For small k it's cheap and avoids storing M off above.
    const XtXinv = new Float64Array(k * k);
    for (let col = 0; col < k; col++) {
      // Build [XtX | e_col] and reduce.
      const M2 = new Float64Array(k * (k + 1));
      for (let a = 0; a < k; a++) {
        for (let b = 0; b < k; b++) M2[a * (k + 1) + b] = XtX[a * k + b];
        M2[a * (k + 1) + k] = (a === col) ? 1 : 0;
      }
      for (let c0 = 0; c0 < k; c0++) {
        let pivRow = c0, pivVal = Math.abs(M2[c0 * (k + 1) + c0]);
        for (let r0 = c0 + 1; r0 < k; r0++) {
          const v = Math.abs(M2[r0 * (k + 1) + c0]);
          if (v > pivVal) { pivVal = v; pivRow = r0; }
        }
        if (pivVal < 1e-12) return { beta, se: null, sigma2 };
        if (pivRow !== c0) {
          for (let cc = 0; cc <= k; cc++) {
            const tmp = M2[c0 * (k + 1) + cc];
            M2[c0 * (k + 1) + cc] = M2[pivRow * (k + 1) + cc];
            M2[pivRow * (k + 1) + cc] = tmp;
          }
        }
        const piv = M2[c0 * (k + 1) + c0];
        for (let cc = c0; cc <= k; cc++) M2[c0 * (k + 1) + cc] /= piv;
        for (let r0 = 0; r0 < k; r0++) {
          if (r0 === c0) continue;
          const f = M2[r0 * (k + 1) + c0];
          if (f !== 0) for (let cc = c0; cc <= k; cc++) M2[r0 * (k + 1) + cc] -= f * M2[c0 * (k + 1) + cc];
        }
      }
      for (let a = 0; a < k; a++) XtXinv[a * k + col] = M2[a * (k + 1) + k];
    }
    const se = new Float64Array(k);
    for (let a = 0; a < k; a++) se[a] = Math.sqrt(sigma2 * XtXinv[a * k + a]);
    return { beta, se, sigma2 };
  }

  // ------------------------------------------------------------------
  // RD simulator state + render.
  //   The true DGP:
  //     X_i ~ N(75, 12)         (mimicking the post's entrance_exam)
  //     true LATE  tau = 8.6   (from rdrobust in the post)
  //     mu(x)      = 23.7 + 0.51 * x    (the post's parametric intercept + slope)
  //     Y_i = mu(X_i) + tau * 1{X_i <= 70} + sigma * eps_i,  eps ~ N(0,1)
  //   Estimation:
  //     pick observations with |X - c| <= h
  //     fit two separate local polynomials of order p:
  //       left side: y = a_L + b_L * (x - c) + ... + g_L * (x - c)^p
  //       right side: y = a_R + b_R * (x - c) + ... + g_R * (x - c)^p
  //     tau_hat = a_L - a_R    (left jump UP relative to right)
  // ------------------------------------------------------------------
  const sim = {
    n: 800, sigma: 5.0, h: 10.0, p: 1, seed: 11,
    chart: null,
    cutoff: 70,
    tauTrue: 8.6,
  };
  sim.chart = CHARTS.rd_simulator_scatter(document.getElementById("sim-scatter"));

  function sim_refit() {
    const { n, sigma, h, p: poly, seed, cutoff, tauTrue } = sim;
    const rng = mulberry32(seed);
    const nrm = makeNormal(rng);
    const points = new Array(n);
    for (let i = 0; i < n; i++) {
      const x = 75 + 12 * nrm();
      const noise = sigma * nrm();
      const treated = x <= cutoff;
      const y = 23.7 + 0.51 * x + (treated ? tauTrue : 0) + noise;
      points[i] = { x, y, treated, inBand: Math.abs(x - cutoff) <= h };
    }

    // Fit local polynomial on each side. Design matrix columns:
    //   [1, (x-c), (x-c)^2, ..., (x-c)^p]
    function fitSide(predicate) {
      const subset = points.filter(d => d.inBand && predicate(d));
      const nSub = subset.length;
      const k = poly + 1;
      if (nSub < k + 1) return null;
      const X = new Float64Array(nSub * k);
      const y = new Float64Array(nSub);
      for (let i = 0; i < nSub; i++) {
        const xc = subset[i].x - cutoff;
        let acc = 1;
        for (let a = 0; a < k; a++) {
          X[i * k + a] = acc;
          acc *= xc;
        }
        y[i] = subset[i].y;
      }
      const fit = ols_fit(X, y, nSub, k);
      if (!fit) return null;
      return { fit, nSub };
    }

    const leftRes = fitSide(d => d.treated);
    const rightRes = fitSide(d => !d.treated);

    let tau_hat = NaN, se_tau = NaN, ci_lo = NaN, ci_hi = NaN;
    let nInBand = 0;
    for (let i = 0; i < n; i++) if (points[i].inBand) nInBand++;
    let leftFit = [], rightFit = [];
    if (leftRes && rightRes) {
      const aL = leftRes.fit.beta[0], aR = rightRes.fit.beta[0];
      tau_hat = aL - aR;
      const seL = leftRes.fit.se ? leftRes.fit.se[0] : 0;
      const seR = rightRes.fit.se ? rightRes.fit.se[0] : 0;
      se_tau = Math.sqrt(seL * seL + seR * seR);
      ci_lo = tau_hat - 1.96 * se_tau;
      ci_hi = tau_hat + 1.96 * se_tau;

      // Build fit curves.
      const xL0 = cutoff - h, xL1 = cutoff;
      const xR0 = cutoff,    xR1 = cutoff + h;
      const stepsL = 40, stepsR = 40;
      for (let s = 0; s <= stepsL; s++) {
        const x = xL0 + (xL1 - xL0) * (s / stepsL);
        let yhat = 0, acc = 1;
        for (let a = 0; a < poly + 1; a++) { yhat += leftRes.fit.beta[a] * acc; acc *= (x - cutoff); }
        leftFit.push({ x, y: yhat });
      }
      for (let s = 0; s <= stepsR; s++) {
        const x = xR0 + (xR1 - xR0) * (s / stepsR);
        let yhat = 0, acc = 1;
        for (let a = 0; a < poly + 1; a++) { yhat += rightRes.fit.beta[a] * acc; acc *= (x - cutoff); }
        rightFit.push({ x, y: yhat });
      }
    }

    sim.chart.update({ points, leftFit, rightFit, cutoff, bandwidth: h, tau_hat });
    document.getElementById("sim-stat-tau").textContent = Number.isFinite(tau_hat) ? tau_hat.toFixed(2) : "—";
    document.getElementById("sim-stat-se").textContent  = Number.isFinite(se_tau)  ? se_tau.toFixed(3)  : "—";
    document.getElementById("sim-stat-nb").textContent  = nInBand;
    document.getElementById("sim-stat-n").textContent   = n;
    document.getElementById("sim-stat-ci").textContent  = Number.isFinite(ci_lo)
      ? `[${ci_lo.toFixed(2)}, ${ci_hi.toFixed(2)}]` : "—";
    document.getElementById("sim-stat-true").textContent = tauTrue.toFixed(2);
  }

  const onSimChange = debounce(sim_refit, 60);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim.n = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim.n;
    onSimChange();
  });
  document.getElementById("sim-s").addEventListener("input", e => {
    sim.sigma = +e.target.value;
    document.getElementById("sim-s-val").textContent = sim.sigma.toFixed(1);
    onSimChange();
  });
  document.getElementById("sim-h").addEventListener("input", e => {
    sim.h = +e.target.value;
    document.getElementById("sim-h-val").textContent = sim.h.toFixed(1);
    onSimChange();
  });
  document.getElementById("sim-p").addEventListener("input", e => {
    sim.p = +e.target.value;
    document.getElementById("sim-p-val").textContent = sim.p;
    onSimChange();
  });
  document.getElementById("sim-reseed").addEventListener("click", () => {
    sim.seed = Math.floor(Math.random() * 1e9) + 1;
    sim_refit();
  });
  document.getElementById("sim-reset").addEventListener("click", () => {
    sim.n = 800; sim.sigma = 5.0; sim.h = 10.0; sim.p = 1; sim.seed = 11;
    document.getElementById("sim-n").value = sim.n;
    document.getElementById("sim-s").value = sim.sigma;
    document.getElementById("sim-h").value = sim.h;
    document.getElementById("sim-p").value = sim.p;
    document.getElementById("sim-n-val").textContent = sim.n;
    document.getElementById("sim-s-val").textContent = sim.sigma.toFixed(1);
    document.getElementById("sim-h-val").textContent = sim.h.toFixed(1);
    document.getElementById("sim-p-val").textContent = sim.p;
    sim_refit();
  });
  sim_refit();

  // ------------------------------------------------------------------
  // TAB 3 — Bandwidth Lab on the post's actual numbers.
  //   Six anchors from results_report.md (BW = 5, 7, 10, 12, 15, 20).
  //   For positive presentation we flip sign (post estimate is negative in
  //   rdrobust convention; the LATE on exit scores is positive).
  // ------------------------------------------------------------------
  const bwAnchors = [
    { bw: 5,  tau:  -8.202, se: 2.337 },
    { bw: 7,  tau:  -8.237, se: 1.919 },
    { bw: 10, tau:  -8.581, se: 1.615 },
    { bw: 12, tau:  -8.675, se: 1.486 },
    { bw: 15, tau:  -8.842, se: 1.312 },
    { bw: 20, tau:  -9.157, se: 1.131 },
  ];
  // Build dense sweep with linear interpolation between anchors.
  const bwSweep = [];
  for (let b = 5; b <= 20; b += 0.5) {
    let lo = bwAnchors[0], hi = bwAnchors[bwAnchors.length - 1];
    for (let k = 0; k < bwAnchors.length - 1; k++) {
      if (bwAnchors[k].bw <= b && b <= bwAnchors[k + 1].bw) {
        lo = bwAnchors[k]; hi = bwAnchors[k + 1]; break;
      }
    }
    const t = lo.bw === hi.bw ? 0 : (b - lo.bw) / (hi.bw - lo.bw);
    const tau = lo.tau + t * (hi.tau - lo.tau);
    const se  = lo.se  + t * (hi.se  - lo.se);
    bwSweep.push({ bw: b, tau, se, ci_lo: tau - 1.96 * se, ci_hi: tau + 1.96 * se });
  }

  const bwChart = CHARTS.bw_sweep_chart(document.getElementById("bw-chart"));
  function bw_render(h) {
    // Look up nearest entry in sweep.
    let best = bwSweep[0], bestD = Infinity;
    for (const row of bwSweep) {
      const d = Math.abs(row.bw - h);
      if (d < bestD) { bestD = d; best = row; }
    }
    bwChart.update({ sweep: bwSweep, currentBw: h, currentTau: best.tau });
    document.getElementById("bw-stat-tau").textContent = best.tau.toFixed(2);
    document.getElementById("bw-stat-ci").textContent  = `[${best.ci_lo.toFixed(2)}, ${best.ci_hi.toFixed(2)}]`;
    document.getElementById("bw-stat-se").textContent  = best.se.toFixed(3);
  }
  document.getElementById("bw-h").addEventListener("input", e => {
    const h = +e.target.value;
    document.getElementById("bw-h-val").textContent = h.toFixed(1);
    bw_render(h);
  });
  bw_render(10.0);

  // ------------------------------------------------------------------
  // TAB 4 — Robustness forest from data/results.json.
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.rd_forest_plot(document.getElementById("fp-chart")),
    data: null,
  };
  function fp_refresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, outcomes);
  }
  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // Global error handler for diagnostics.
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });

  // ------------------------------------------------------------------
  // Tab 1 — intro animation.
  // ------------------------------------------------------------------
  CHARTS.rd_jump_animation(document.getElementById("intro-anim"));
})();
