// app.js — FWL Interactive Lab wiring.
// Loaded after dgp.js, lasso.js, charts.js. Uses CHARTS.* helpers exclusively;
// dgp.js / lasso.js are loaded so the smoke-test contract (qnorm + lasso_path)
// keeps passing, but the FWL app itself only needs the FWL helpers in charts.js.

(function () {
  "use strict";

  // ----------------------------------------------------------------
  // Tab switching.
  // ----------------------------------------------------------------
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
  document.querySelectorAll(".cta-card").forEach(card => {
    card.addEventListener("click", () => activateTab(card.dataset.goto));
  });

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ----------------------------------------------------------------
  // TAB 1 — fog-lifts animation.
  // ----------------------------------------------------------------
  CHARTS.fwl_animation(document.getElementById("intro-anim"));

  // ----------------------------------------------------------------
  // TAB 2 — Confounding Lab.
  // ----------------------------------------------------------------
  const sim = {
    n: 200, true_alpha: 0.20, gamma: 0.30, delta: -0.50, seed: 42,
    pair:    CHARTS.fwl_scatter_pair(document.getElementById("sim-pair")),
    compare: CHARTS.fwl_compare(document.getElementById("sim-compare")),
    hist:    CHARTS.fwl_histograms(document.getElementById("sim-hist")),
  };

  function sim_refit() {
    const data = CHARTS.simulate_store({
      n: sim.n, true_alpha: sim.true_alpha, gamma: sim.gamma,
      delta: sim.delta, seed: sim.seed,
    });
    sim.data = data;
    const slopes = sim.pair.update(data);

    document.getElementById("sim-stat-naive").textContent = slopes.naive.toFixed(4);
    document.getElementById("sim-stat-fwl").textContent   = slopes.fwl.toFixed(4);
    document.getElementById("sim-stat-true").textContent  = sim.true_alpha.toFixed(3);

    // OVB = gamma * delta (approximate predicted bias on the naive slope).
    const ovb = sim.gamma * sim.delta;
    document.getElementById("sim-stat-ovb").textContent = ovb.toFixed(4);

    sim.compare.update({
      naive: slopes.naive,
      fwl: slopes.fwl,
      true_alpha: sim.true_alpha,
    });
  }

  const onSimChange = debounce(sim_refit, 100);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim.n = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim.n;
    onSimChange();
  });
  document.getElementById("sim-b").addEventListener("input", e => {
    sim.true_alpha = +e.target.value;
    document.getElementById("sim-b-val").textContent = sim.true_alpha.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-g").addEventListener("input", e => {
    sim.gamma = +e.target.value;
    document.getElementById("sim-g-val").textContent = sim.gamma.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-d").addEventListener("input", e => {
    sim.delta = +e.target.value;
    document.getElementById("sim-d-val").textContent = sim.delta.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-reseed").addEventListener("click", () => {
    sim.seed = Math.floor(Math.random() * 1e9) + 1;
    sim_refit();
  });
  document.getElementById("sim-reset").addEventListener("click", () => {
    sim.n = 200; sim.true_alpha = 0.20; sim.gamma = 0.30; sim.delta = -0.50; sim.seed = 42;
    document.getElementById("sim-n").value = sim.n;
    document.getElementById("sim-b").value = sim.true_alpha;
    document.getElementById("sim-g").value = sim.gamma;
    document.getElementById("sim-d").value = sim.delta;
    document.getElementById("sim-n-val").textContent = sim.n;
    document.getElementById("sim-b-val").textContent = sim.true_alpha.toFixed(2);
    document.getElementById("sim-g-val").textContent = sim.gamma.toFixed(2);
    document.getElementById("sim-d-val").textContent = sim.delta.toFixed(2);
    sim_refit();
  });

  // Run 100 simulations: each draw gets a different seed; record naive & FWL.
  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const histEl = document.getElementById("sim-hist");
    const histStats = document.getElementById("sim-hist-stats");
    progBar.style.width = "0%";

    const N_SIMS = 100;
    const naive_arr = [];
    const fwl_arr   = [];
    let i = 0;
    function tick() {
      const batch = 4;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const d = CHARTS.simulate_store({
          n: sim.n, true_alpha: sim.true_alpha, gamma: sim.gamma,
          delta: sim.delta, seed: sim.seed + i + 1,
        });
        const naive = CHARTS.ols_xy(d.coupons, d.sales).slope;
        const xr = CHARTS.residualize(d.coupons, d.income);
        const yr = CHARTS.residualize(d.sales, d.income);
        const fwl = CHARTS.ols_xy(xr, yr).slope;
        if (Number.isFinite(naive)) naive_arr.push(naive);
        if (Number.isFinite(fwl))   fwl_arr.push(fwl);
      }
      const pct = (i / N_SIMS) * 100;
      progBar.style.width = pct + "%";
      progLabel.textContent = `simulation ${i} / ${N_SIMS}`;
      if (i < N_SIMS) {
        setTimeout(tick, 0);
      } else {
        progLabel.textContent = `done (${N_SIMS} simulations)`;
        histEl.style.display = "block";
        histStats.style.display = "grid";
        sim.hist.update({ naive_arr, fwl_arr, true_alpha: sim.true_alpha });
        const m = (a) => a.reduce((s, v) => s + v, 0) / a.length;
        const sd = (a, mean) => Math.sqrt(a.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, a.length - 1));
        const mN = m(naive_arr), mF = m(fwl_arr);
        document.getElementById("sim-naive-mean").textContent = mN.toFixed(4);
        document.getElementById("sim-naive-sd").textContent   = sd(naive_arr, mN).toFixed(4);
        document.getElementById("sim-fwl-mean").textContent   = mF.toFixed(4);
        document.getElementById("sim-fwl-sd").textContent     = sd(fwl_arr, mF).toFixed(4);
        btn.disabled = false;
      }
    }
    tick();
  });

  // Initial fit.
  sim_refit();

  // ----------------------------------------------------------------
  // TAB 3 — Forest plot from results.json.
  // ----------------------------------------------------------------
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
    data:  null,
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

  // ----------------------------------------------------------------
  // TAB 4 — Panel FE within-person residualization.
  // ----------------------------------------------------------------
  const panel = {
    chart: CHARTS.within_panel_scatter(document.getElementById("panel-scatter")),
  };
  function panel_refit() {
    const mode = document.querySelector("#panel-mode input:checked").value;
    const slope = panel.chart.update(mode);
    document.getElementById("panel-stat-slope").textContent = slope.toFixed(4);
  }
  document.querySelectorAll("#panel-mode input").forEach(el => {
    el.addEventListener("change", panel_refit);
  });
  panel_refit();

})();
