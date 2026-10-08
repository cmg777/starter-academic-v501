// app.js — wires the DOM controls in index.html to the chart builders
// in charts.js. Runs after window.CHARTS is defined.

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
  document.querySelectorAll(".cta-card").forEach(card => {
    card.addEventListener("click", () => activateTab(card.dataset.goto));
  });

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ------------------------------------------------------------------
  // TAB 1 — rotating-direction animation.
  // ------------------------------------------------------------------
  CHARTS.pca_rotation_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — PCA simulator.
  // ------------------------------------------------------------------
  const sim = {
    n: 50, r: 0.96, noise: 1.0, seed: 42,
    scatter: CHARTS.pca_scatter(document.getElementById("sim-scatter")),
    hist: CHARTS.variance_histogram(document.getElementById("sim-hist")),
  };

  function sim_refit() {
    const d = CHARTS.simulate_pca_two({
      n: sim.n, r: sim.r, noise: sim.noise, seed: sim.seed,
    });
    sim.scatter.update(d);
    document.getElementById("sim-stat-r").textContent = d.r.toFixed(4);
    document.getElementById("sim-stat-l1").textContent = d.l1.toFixed(4);
    document.getElementById("sim-stat-l2").textContent = d.l2.toFixed(4);
    const vex = d.l1 / (d.l1 + d.l2);
    document.getElementById("sim-stat-vex").textContent = (vex * 100).toFixed(2) + "%";
  }

  const onSimChange = debounce(sim_refit, 80);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim.n = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim.n;
    onSimChange();
  });
  document.getElementById("sim-r").addEventListener("input", e => {
    sim.r = +e.target.value;
    document.getElementById("sim-r-val").textContent = sim.r.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-noise").addEventListener("input", e => {
    sim.noise = +e.target.value;
    document.getElementById("sim-noise-val").textContent = sim.noise.toFixed(1);
    onSimChange();
  });
  document.getElementById("sim-seed").addEventListener("input", e => {
    sim.seed = +e.target.value;
    document.getElementById("sim-seed-val").textContent = sim.seed;
    onSimChange();
  });

  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const histEl = document.getElementById("sim-hist");
    const histStats = document.getElementById("sim-hist-stats");

    const N = 100;
    const values = [];
    let i = 0;
    function step() {
      const batch = 5;
      const end = Math.min(N, i + batch);
      for (; i < end; i++) {
        const d = CHARTS.simulate_pca_two({
          n: sim.n, r: sim.r, noise: sim.noise, seed: sim.seed + i + 1,
        });
        const vex = d.l1 / (d.l1 + d.l2);
        if (Number.isFinite(vex)) values.push(vex);
      }
      progBar.style.width = (i / N * 100) + "%";
      progLabel.textContent = `simulation ${i} / ${N}`;
      if (i < N) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = `done (${N} simulations)`;
        histEl.style.display = "block";
        histStats.style.display = "grid";
        const mean = values.reduce((a,b) => a+b, 0) / values.length;
        const sd = Math.sqrt(values.reduce((a,b) => a + (b-mean)**2, 0) / values.length);
        const mn = Math.min(...values);
        const mx = Math.max(...values);
        sim.hist.update({ values, mean });
        document.getElementById("sim-mean-vex").textContent = (mean * 100).toFixed(2) + "%";
        document.getElementById("sim-sd-vex").textContent = (sd * 100).toFixed(2) + "%";
        document.getElementById("sim-min-vex").textContent = (mn * 100).toFixed(2) + "%";
        document.getElementById("sim-max-vex").textContent = (mx * 100).toFixed(2) + "%";
        btn.disabled = false;
      }
    }
    step();
  });

  sim_refit();

  // ------------------------------------------------------------------
  // TAB 3 — Country rankings (from data/results.json).
  // ------------------------------------------------------------------
  const rank = {
    bars: CHARTS.country_bars(document.getElementById("rank-chart")),
    rows: [],
    metric: "health_index",
    minLE: 50,
  };

  function rank_render() {
    const filtered = rank.rows.filter(r => r.life_exp >= rank.minLE);
    const ascending = rank.metric === "infant_mort";
    const sorted = [...filtered].sort((a, b) =>
      ascending ? b[rank.metric] - a[rank.metric] : a[rank.metric] - b[rank.metric]
    );
    rank.bars.update({ rows: sorted, metric: rank.metric });
  }

  document.querySelectorAll('input[name="sort"]').forEach(el => {
    el.addEventListener("change", e => {
      rank.metric = e.target.value;
      rank_render();
    });
  });
  document.getElementById("rank-le").addEventListener("input", e => {
    rank.minLE = +e.target.value;
    document.getElementById("rank-le-val").textContent = rank.minLE;
    rank_render();
  });

  fetch("data/results.json").then(r => r.json()).then(data => {
    rank.rows = data.countries || [];
    rank_render();
  }).catch(err => {
    document.getElementById("rank-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // TAB 4 — Loadings and scree plot (static).
  // ------------------------------------------------------------------
  CHARTS.loadings_bars(document.getElementById("loadings-bars"));
  CHARTS.scree_plot(document.getElementById("loadings-scree"));

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[pca-web-app] uncaught error:", e.error);
  });
})();
