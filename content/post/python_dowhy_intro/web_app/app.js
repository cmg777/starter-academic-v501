// app.js — wires DOM controls in index.html to dgp/lasso/charts.
// Runs after window.DGP, window.LASSO, window.CHARTS are defined.

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

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ============================================================
  // TAB 1 — Confounder DAG animation
  // ============================================================
  CHARTS.confounder_dag_animation(document.getElementById("intro-anim"));

  // ============================================================
  // TAB 2 — Methods Showdown (real-data forest plot)
  // ============================================================
  const fp = {
    chart: CHARTS.estimate_forest(document.getElementById("fp-chart")),
    data:  null,
  };

  function fp_refresh() {
    if (!fp.data) return;
    const methods = Array.from(document.querySelectorAll("#fp-methods input:checked"))
      .map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, fp.data.true_ate);
    // Update stats card.
    const shown = fp.data.estimates.filter(d => methods.includes(d.method));
    const covering = shown.filter(d => d.covers_truth).length;
    document.getElementById("fp-cover").textContent = covering;
    document.getElementById("fp-total").textContent = shown.length;
    document.getElementById("fp-true").textContent  = fp.data.true_ate.toFixed(2);
    document.getElementById("fp-n").textContent     = fp.data.n.toLocaleString();
  }
  document.querySelectorAll("#fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
    // Also hand the refutation data to Tab 4.
    refute_init(data);
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ============================================================
  // TAB 3 — Confounding Simulator
  // ============================================================
  // Minimal WFH-style DGP and three estimators (Naive, Backdoor OLS, Wald IV).
  // Builds on DGP.mulberry32 + DGP.makeNormal from the shared module so the
  // smoke test still passes.

  function simulate_wfh(opts) {
    const n = Math.max(50, opts.n | 0);
    const by = +opts.by;     // confounder -> outcome
    const bt = +opts.bt;     // confounder -> treatment (logit)
    const ivStrength = +opts.iv;  // instrument -> treatment (logit)
    const trueAte = 1.0;
    const seed = opts.seed >>> 0;
    const rng = DGP.mulberry32(seed || 1);
    const normal = DGP.makeNormal(rng);

    const introversion = new Float64Array(n);
    const children     = new Float64Array(n);
    const subway       = new Float64Array(n);
    const T            = new Float64Array(n);
    const Y            = new Float64Array(n);

    let n_treated = 0;
    let sum_z = 0;

    for (let i = 0; i < n; i++) {
      introversion[i] = 5 + 1.5 * normal();
      // Poisson(1.5) via rough normal approx (light shortcut to keep things fast).
      let c = 0; let exp_sum = 0; const target = 1.5;
      // Quick truncated Poisson approximation: round Max(0, N(1.5, sqrt(1.5))).
      c = Math.max(0, Math.round(target + Math.sqrt(target) * normal()));
      children[i] = c;
      subway[i] = (rng() < 0.4) ? 1 : 0;
      const logit = -1.5 + bt * introversion[i] + 0.2 * children[i] + ivStrength * subway[i];
      const pT = 1 / (1 + Math.exp(-logit));
      T[i] = (rng() < pT) ? 1 : 0;
      n_treated += T[i];
      sum_z += subway[i];
      const noise = 2 * normal();
      Y[i] = 50 + trueAte * T[i] + by * introversion[i] - 0.5 * children[i] + noise;
    }
    return { n, introversion, children, subway, T, Y, trueAte };
  }

  // Naive estimator: mean(Y | T = 1) - mean(Y | T = 0) with Welch SE.
  function estimateNaive(sim) {
    let n1 = 0, n0 = 0, m1 = 0, m0 = 0, ss1 = 0, ss0 = 0;
    for (let i = 0; i < sim.n; i++) {
      if (sim.T[i] === 1) { n1++; m1 += sim.Y[i]; }
      else                { n0++; m0 += sim.Y[i]; }
    }
    m1 /= Math.max(1, n1); m0 /= Math.max(1, n0);
    for (let i = 0; i < sim.n; i++) {
      const d = sim.Y[i] - (sim.T[i] === 1 ? m1 : m0);
      if (sim.T[i] === 1) ss1 += d * d; else ss0 += d * d;
    }
    const v1 = ss1 / Math.max(1, n1 - 1);
    const v0 = ss0 / Math.max(1, n0 - 1);
    const est = m1 - m0;
    const se = Math.sqrt(v1 / Math.max(1, n1) + v0 / Math.max(1, n0));
    return { est, se, ci_lo: est - 1.96 * se, ci_hi: est + 1.96 * se };
  }

  // 3x3 symmetric solve helper (for OLS with [intercept, T, introversion, children]
  // — collapse to 4x4 here).
  function olsBackdoor(sim) {
    // Design matrix M = [1, T, introversion, children]. k = 4.
    const n = sim.n;
    const k = 4;
    const A = new Float64Array(k * k);
    const b = new Float64Array(k);
    function getM(i, j) {
      if (j === 0) return 1;
      if (j === 1) return sim.T[i];
      if (j === 2) return sim.introversion[i];
      return sim.children[i];
    }
    for (let j1 = 0; j1 < k; j1++) {
      for (let j2 = j1; j2 < k; j2++) {
        let s = 0;
        for (let i = 0; i < n; i++) s += getM(i, j1) * getM(i, j2);
        A[j1 * k + j2] = s;
        A[j2 * k + j1] = s;
      }
      let s = 0;
      for (let i = 0; i < n; i++) s += getM(i, j1) * sim.Y[i];
      b[j1] = s;
    }
    // Solve A beta = b via Cholesky (using lasso.js helpers indirectly).
    // Inline a small Cholesky.
    const L = new Float64Array(k * k);
    for (let i = 0; i < k; i++) {
      for (let j = 0; j <= i; j++) {
        let s = A[i * k + j];
        for (let kk = 0; kk < j; kk++) s -= L[i * k + kk] * L[j * k + kk];
        if (i === j) {
          if (s <= 1e-12) return { est: NaN, se: NaN, ci_lo: NaN, ci_hi: NaN };
          L[i * k + j] = Math.sqrt(s);
        } else {
          L[i * k + j] = s / L[j * k + j];
        }
      }
    }
    const z = new Float64Array(k);
    for (let i = 0; i < k; i++) {
      let s = b[i];
      for (let j = 0; j < i; j++) s -= L[i * k + j] * z[j];
      z[i] = s / L[i * k + i];
    }
    const beta = new Float64Array(k);
    for (let i = k - 1; i >= 0; i--) {
      let s = z[i];
      for (let j = i + 1; j < k; j++) s -= L[j * k + i] * beta[j];
      beta[i] = s / L[i * k + i];
    }
    // Residuals + HC1 robust SE on T (index 1).
    let rss = 0;
    const e = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let yhat = 0;
      for (let j = 0; j < k; j++) yhat += getM(i, j) * beta[j];
      e[i] = sim.Y[i] - yhat;
      rss += e[i] * e[i];
    }
    const dof = Math.max(1, n - k);
    // (X'X)^{-1} via L: invert L'L. We need diag element [1,1].
    // Solve L L' v = e_1 for v; v[1] = (X'X)^{-1}[1,1].
    const ej = new Float64Array(k); ej[1] = 1;
    const yv = new Float64Array(k);
    for (let i = 0; i < k; i++) {
      let s = ej[i];
      for (let j = 0; j < i; j++) s -= L[i * k + j] * yv[j];
      yv[i] = s / L[i * k + i];
    }
    const v = new Float64Array(k);
    for (let i = k - 1; i >= 0; i--) {
      let s = yv[i];
      for (let j = i + 1; j < k; j++) s -= L[j * k + i] * v[j];
      v[i] = s / L[i * k + i];
    }
    const sigma2 = rss / dof;
    const se_classical = Math.sqrt(Math.max(0, sigma2 * v[1]));
    // For simplicity, use classical SE (HC1 here would inflate slightly).
    const est = beta[1];
    return { est, se: se_classical, ci_lo: est - 1.96 * se_classical, ci_hi: est + 1.96 * se_classical };
  }

  // Wald IV: Cov(Z, Y) / Cov(Z, T). SE via delta method.
  function estimateIV(sim) {
    let mz = 0, mt = 0, my = 0;
    for (let i = 0; i < sim.n; i++) { mz += sim.subway[i]; mt += sim.T[i]; my += sim.Y[i]; }
    mz /= sim.n; mt /= sim.n; my /= sim.n;
    let cov_zy = 0, cov_zt = 0, var_z = 0;
    for (let i = 0; i < sim.n; i++) {
      const dz = sim.subway[i] - mz;
      cov_zy += dz * (sim.Y[i] - my);
      cov_zt += dz * (sim.T[i] - mt);
      var_z  += dz * dz;
    }
    cov_zy /= sim.n; cov_zt /= sim.n; var_z /= sim.n;
    const est = cov_zy / cov_zt;
    // First-stage slope b1 = cov_zt / var_z. Then F = (b1^2 * var_z * (n-2)) / sigma2_t (rough).
    const b1 = cov_zt / Math.max(1e-9, var_z);
    // Compute residuals from T = a + b1 * Z.
    const a1 = mt - b1 * mz;
    let ss = 0;
    for (let i = 0; i < sim.n; i++) {
      const e = sim.T[i] - (a1 + b1 * sim.subway[i]);
      ss += e * e;
    }
    const s2 = ss / Math.max(1, sim.n - 2);
    const f = (b1 * b1 * sim.n * var_z) / Math.max(1e-12, s2);
    // SE of IV: residual variance from second stage divided by first-stage variation
    let resid_y_T = 0;
    // Compute residuals from y = a + est * T (ignoring confounders -- this is the
    // reduced-form IV SE, intentionally simplified for live UI).
    let ay = 0;
    ay = my - est * mt;
    for (let i = 0; i < sim.n; i++) {
      const e = sim.Y[i] - (ay + est * sim.T[i]);
      resid_y_T += e * e;
    }
    const s2y = resid_y_T / Math.max(1, sim.n - 2);
    // Delta-method approximation: Var(est) ≈ s2y / (n * Var(Z) * b1^2)
    const var_iv = s2y / (sim.n * var_z * Math.max(1e-12, b1 * b1));
    const se = Math.sqrt(Math.max(0, var_iv));
    return { est, se, ci_lo: est - 1.96 * se, ci_hi: est + 1.96 * se, first_stage_F: f };
  }

  const sim_state = { n: 2000, by: 0.80, bt: 0.30, iv: 1.00, seed: 42 };
  const sim_chart = CHARTS.confounding_chart(document.getElementById("sim-chart"));

  function sim_run() {
    const sim = simulate_wfh({
      n: sim_state.n, by: sim_state.by, bt: sim_state.bt,
      iv: sim_state.iv, seed: sim_state.seed,
    });
    const naive = estimateNaive(sim);
    const bd    = olsBackdoor(sim);
    const iv    = estimateIV(sim);

    sim_chart.update({
      naive: { est: naive.est, ci_lo: naive.ci_lo, ci_hi: naive.ci_hi },
      backdoor: { est: bd.est, ci_lo: bd.ci_lo, ci_hi: bd.ci_hi },
      iv: { est: iv.est, ci_lo: iv.ci_lo, ci_hi: iv.ci_hi },
      true_ate: 1.0,
    });

    function fmt(x) { return Number.isFinite(x) ? x.toFixed(3) : "—"; }
    function fmt4(x) { return Number.isFinite(x) ? x.toFixed(4) : "—"; }
    function covers(est) {
      return Number.isFinite(est.ci_lo) && est.ci_lo <= 1.0 && est.ci_hi >= 1.0;
    }

    document.getElementById("sim-naive-est").textContent  = fmt(naive.est);
    document.getElementById("sim-naive-se").textContent   = fmt4(naive.se);
    document.getElementById("sim-naive-bias").textContent = fmt(naive.est - 1.0);
    document.getElementById("sim-naive-cov").textContent  = covers(naive) ? "yes" : "NO";
    document.getElementById("sim-naive-cov").style.color  = covers(naive) ? "var(--teal)" : "#ff7777";

    document.getElementById("sim-bd-est").textContent  = fmt(bd.est);
    document.getElementById("sim-bd-se").textContent   = fmt4(bd.se);
    document.getElementById("sim-bd-bias").textContent = fmt(bd.est - 1.0);
    document.getElementById("sim-bd-cov").textContent  = covers(bd) ? "yes" : "NO";
    document.getElementById("sim-bd-cov").style.color  = covers(bd) ? "var(--teal)" : "#ff7777";

    document.getElementById("sim-iv-est").textContent  = fmt(iv.est);
    document.getElementById("sim-iv-se").textContent   = fmt4(iv.se);
    document.getElementById("sim-iv-bias").textContent = fmt(iv.est - 1.0);
    document.getElementById("sim-iv-f").textContent    = Number.isFinite(iv.first_stage_F)
      ? iv.first_stage_F.toFixed(1)
      : "—";
  }
  const sim_refit = debounce(sim_run, 80);

  function bindSlider(id, key, valId, format) {
    document.getElementById(id).addEventListener("input", e => {
      sim_state[key] = +e.target.value;
      document.getElementById(valId).textContent = format(sim_state[key]);
      sim_refit();
    });
  }
  bindSlider("sim-n",  "n",  "sim-n-val",  v => v);
  bindSlider("sim-by", "by", "sim-by-val", v => v.toFixed(2));
  bindSlider("sim-bt", "bt", "sim-bt-val", v => v.toFixed(2));
  bindSlider("sim-iv", "iv", "sim-iv-val", v => v.toFixed(2));

  document.getElementById("sim-reseed").addEventListener("click", () => {
    sim_state.seed = Math.floor(Math.random() * 1e9) + 1;
    sim_run();
  });
  document.getElementById("sim-reset").addEventListener("click", () => {
    sim_state.n = 2000; sim_state.by = 0.80; sim_state.bt = 0.30;
    sim_state.iv = 1.00; sim_state.seed = 42;
    document.getElementById("sim-n").value  = sim_state.n;
    document.getElementById("sim-by").value = sim_state.by;
    document.getElementById("sim-bt").value = sim_state.bt;
    document.getElementById("sim-iv").value = sim_state.iv;
    document.getElementById("sim-n-val").textContent  = sim_state.n;
    document.getElementById("sim-by-val").textContent = sim_state.by.toFixed(2);
    document.getElementById("sim-bt-val").textContent = sim_state.bt.toFixed(2);
    document.getElementById("sim-iv-val").textContent = sim_state.iv.toFixed(2);
    sim_run();
  });
  sim_run();

  // ============================================================
  // TAB 4 — Refutation Lab
  // ============================================================
  function refute_init(data) {
    if (!data || !Array.isArray(data.refutation)) return;
    const refute_chart = CHARTS.refutation_chart(document.getElementById("refute-chart"));
    const original = data.refutation[0].original;
    refute_chart.update({
      original,
      true_ate: data.true_ate,
      tests: data.refutation.map(r => ({
        name:  r.test,
        value: r.new_effect,
        pass:  r.pass,
      })),
    });
  }

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
