// app.js — Causal ML interactive companion.
// Wires the DOM controls in index.html to dgp/lasso/charts.
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
  // TAB 1 — concept animation.
  // ------------------------------------------------------------------
  CHARTS.ate_bias_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — Forest plot of ATE estimators (real numbers from results.json).
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
    data: null,
  };

  function fp_refresh() {
    if (!fp.data) return;
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, ["ATE (months employed)"]);
  }
  document.querySelectorAll("#fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  // ------------------------------------------------------------------
  // TAB 3 — Confounding sim.
  //   Uses DGP.simulate_dl() (treatment d + covariates X + outcome y).
  //   Naive estimator: mean(y | d=1) - mean(y | d=0).
  //   Adjusted estimator: OLS regression of y on [d, X], coefficient on d.
  //   alpha_true = DGP.ALPHA_TRUE = 0.5.
  // ------------------------------------------------------------------
  const sim = {
    n: 300, p: 20, signal: 0.6, asymmetry: 0.70, seed: 7,
    cmp: CHARTS.ate_compare(document.getElementById("sim-compare")),
    hist: CHARTS.alpha_histograms(document.getElementById("sim-hist")),
  };

  function fmt(x) { return (x === null || Number.isNaN(x) || !Number.isFinite(x)) ? "—" : x.toFixed(3); }

  function naive_from(sim_obj) {
    const { d, y, n } = sim_obj;
    let s1 = 0, n1 = 0, s0 = 0, n0 = 0;
    // d is standardised in DGP.simulate_dl, so 'treated' means d > 0 (above mean).
    for (let i = 0; i < n; i++) {
      if (d[i] > 0) { s1 += y[i]; n1++; }
      else          { s0 += y[i]; n0++; }
    }
    if (n1 === 0 || n0 === 0) return NaN;
    return (s1 / n1) - (s0 / n0);
  }

  function adjusted_from(sim_obj) {
    // OLS on [d, X] -> alpha is coefficient on d (first column).
    const { d, y, X, n, p } = sim_obj;
    // Use all p columns of X.
    const Xfull = new Float64Array(n * p);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < p; j++)
        Xfull[i * p + j] = X[i * p + j];
    const ols = LASSO.ols_with_treatment(d, Xfull, y, n, p);
    return ols ? ols.alpha_hat : NaN;
  }

  function sim_refit() {
    const draw = DGP.simulate_dl({
      n: sim.n, p: sim.p, signal: sim.signal,
      asymmetry: sim.asymmetry, seed: sim.seed,
    });
    sim.draw = draw;
    // For Tab 3, the "true ATE" is the simulator's alpha_true (0.5).
    // We rescale conceptually: naive bias should grow with asymmetry.
    const naive_hat = naive_from(draw);
    const dml_hat   = adjusted_from(draw);
    sim.naive = naive_hat;
    sim.dml   = dml_hat;
    sim_render();
  }

  function sim_render() {
    const truth = DGP.ALPHA_TRUE;
    document.getElementById("sim-naive").textContent     = fmt(sim.naive);
    document.getElementById("sim-naive-bias").textContent = fmt(sim.naive - truth);
    document.getElementById("sim-dml").textContent       = fmt(sim.dml);
    document.getElementById("sim-dml-bias").textContent   = fmt(sim.dml - truth);
    sim.cmp.update({
      naive:     Number.isFinite(sim.naive) ? sim.naive : 0,
      dml:       Number.isFinite(sim.dml)   ? sim.dml   : 0,
      alpha_true: truth,
    });
  }

  const onSimParamChange = debounce(sim_refit, 120);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim.n = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim.n;
    onSimParamChange();
  });
  document.getElementById("sim-p").addEventListener("input", e => {
    sim.p = +e.target.value;
    document.getElementById("sim-p-val").textContent = sim.p;
    onSimParamChange();
  });
  document.getElementById("sim-s").addEventListener("input", e => {
    sim.signal = +e.target.value;
    document.getElementById("sim-s-val").textContent = sim.signal.toFixed(2);
    onSimParamChange();
  });
  document.getElementById("sim-a").addEventListener("input", e => {
    sim.asymmetry = +e.target.value;
    document.getElementById("sim-a-val").textContent = sim.asymmetry.toFixed(2);
    onSimParamChange();
  });

  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const histEl = document.getElementById("sim-hist");
    const histStats = document.getElementById("sim-hist-stats");

    const N_SIMS = 100;
    const alphas_naive = [];
    const alphas_dml   = [];

    let i = 0;
    function step() {
      const batch = 2;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const draw = DGP.simulate_dl({
          n: sim.n, p: sim.p, signal: sim.signal,
          asymmetry: sim.asymmetry, seed: sim.seed + i + 1,
        });
        const nh = naive_from(draw);
        const dh = adjusted_from(draw);
        if (Number.isFinite(nh)) alphas_naive.push(nh);
        if (Number.isFinite(dh)) alphas_dml.push(dh);
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
        sim.hist.update({
          alphas_naive, alphas_dml,
          alpha_true: DGP.ALPHA_TRUE,
        });
        const meanN = d3.mean(alphas_naive);
        const meanD = d3.mean(alphas_dml);
        const sdN   = d3.deviation(alphas_naive);
        const sdD   = d3.deviation(alphas_dml);
        document.getElementById("sim-naive-mean").textContent = (meanN ?? 0).toFixed(3);
        document.getElementById("sim-naive-sd").textContent   = (sdN   ?? 0).toFixed(3);
        document.getElementById("sim-dml-mean").textContent   = (meanD ?? 0).toFixed(3);
        document.getElementById("sim-dml-sd").textContent     = (sdD   ?? 0).toFixed(3);
        btn.disabled = false;
      }
    }
    step();
  });

  // Initial fit for Tab 3.
  sim_refit();

  // ------------------------------------------------------------------
  // TAB 4 — GATE bar chart + welfare bar chart (from results.json).
  // ------------------------------------------------------------------
  const tab4 = {
    gate: CHARTS.gate_bars(document.getElementById("gate-chart")),
    welfare: CHARTS.welfare_bars(document.getElementById("welfare-chart")),
  };

  function tab4_refresh(data) {
    if (data.gate) {
      tab4.gate.update(data.gate, { xLabel: "Dutch proficiency stratum", yLabel: "GATE (months)" });
    }
    if (data.welfare) {
      tab4.welfare.update(data.welfare);
    }
  }

  // ------------------------------------------------------------------
  // Data loader — populates Tab 2 forest plot and Tab 4 charts.
  // ------------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
    tab4_refresh(data);
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    const fpEl = document.getElementById("fp-chart");
    if (fpEl) fpEl.innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[python_cml app] uncaught error:", e.error);
  });
})();
