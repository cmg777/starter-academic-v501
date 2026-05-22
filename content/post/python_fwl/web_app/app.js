// app.js — wires the FWL Interactive Lab DOM to dgp/charts modules.
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
  function fmt(x, dp) {
    if (x === null || x === undefined || !Number.isFinite(x)) return "—";
    return x.toFixed(dp || 3);
  }

  // ------------------------------------------------------------------
  // TAB 1 — Residualisation animation.
  // ------------------------------------------------------------------
  CHARTS.fwl_residualisation_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — Confounding Lab.
  // ------------------------------------------------------------------
  const lab = {
    n: 50, gamma: 0.30, delta: -0.50, alpha: 0.20, seed: 42,
    bars: CHARTS.naive_vs_fwl_bars(document.getElementById("lab-bars")),
  };

  function lab_refit() {
    const sim = CHARTS.simulate_fwl_sample({
      n: lab.n, gamma: lab.gamma, delta: lab.delta,
      alpha: lab.alpha, seed: lab.seed,
    });
    lab.sim = sim;
    document.getElementById("lab-naive-b").textContent  = fmt(sim.naive.b, 3);
    document.getElementById("lab-naive-se").textContent = fmt(sim.naive.se, 3);
    document.getElementById("lab-naive-bias").textContent = fmt(sim.naive.b - lab.alpha, 3);
    document.getElementById("lab-ovb").textContent      = fmt(lab.gamma * lab.delta, 3);
    document.getElementById("lab-fwl-b").textContent    = fmt(sim.fwl.b, 3);
    document.getElementById("lab-fwl-se").textContent   = fmt(sim.fwl.se, 3);
    document.getElementById("lab-fwl-bias").textContent = fmt(sim.fwl.b - lab.alpha, 3);
    lab.bars.update({ naive: sim.naive.b, fwl: sim.fwl.b, alpha_true: lab.alpha });
  }

  const onLabChange = debounce(lab_refit, 80);
  document.getElementById("lab-n").addEventListener("input", e => {
    lab.n = +e.target.value;
    document.getElementById("lab-n-val").textContent = lab.n;
    onLabChange();
  });
  document.getElementById("lab-g").addEventListener("input", e => {
    lab.gamma = +e.target.value;
    document.getElementById("lab-g-val").textContent = lab.gamma.toFixed(2);
    onLabChange();
  });
  document.getElementById("lab-d").addEventListener("input", e => {
    lab.delta = +e.target.value;
    document.getElementById("lab-d-val").textContent = lab.delta.toFixed(2);
    onLabChange();
  });
  document.getElementById("lab-reseed").addEventListener("click", () => {
    lab.seed = Math.floor(Math.random() * 1e9) + 1;
    lab_refit();
  });
  document.getElementById("lab-reset").addEventListener("click", () => {
    lab.n = 50; lab.gamma = 0.30; lab.delta = -0.50; lab.seed = 42;
    document.getElementById("lab-n").value = lab.n;
    document.getElementById("lab-g").value = lab.gamma;
    document.getElementById("lab-d").value = lab.delta;
    document.getElementById("lab-n-val").textContent = lab.n;
    document.getElementById("lab-g-val").textContent = lab.gamma.toFixed(2);
    document.getElementById("lab-d-val").textContent = lab.delta.toFixed(2);
    lab_refit();
  });

  lab_refit();

  // ------------------------------------------------------------------
  // TAB 3 — Forest plot (from baked Pattern-A results.json).
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.fwl_forest_plot(document.getElementById("fp-chart")),
    data: null,
  };

  function fp_refresh() {
    if (!fp.data) return;
    const methods = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, fp.data.alpha_true || 0.20);
  }
  document.querySelectorAll("#fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // TAB 4 — Monte Carlo.
  // ------------------------------------------------------------------
  const mc = {
    n: 100, gamma: 0.30, delta: -0.50, alpha: 0.20,
    hist: CHARTS.naive_vs_fwl_histograms(document.getElementById("mc-hist")),
  };

  document.getElementById("mc-n").addEventListener("input", e => {
    mc.n = +e.target.value;
    document.getElementById("mc-n-val").textContent = mc.n;
  });
  document.getElementById("mc-g").addEventListener("input", e => {
    mc.gamma = +e.target.value;
    document.getElementById("mc-g-val").textContent = mc.gamma.toFixed(2);
  });
  document.getElementById("mc-d").addEventListener("input", e => {
    mc.delta = +e.target.value;
    document.getElementById("mc-d-val").textContent = mc.delta.toFixed(2);
  });

  document.getElementById("mc-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#mc-progress > div");
    const progLabel = document.getElementById("mc-progress-label");
    const histEl = document.getElementById("mc-hist");
    const histStats = document.getElementById("mc-hist-stats");

    const N_SIMS = 100;
    const naiveArr = [];
    const fwlArr = [];

    let i = 0;
    function step() {
      const batch = 4;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const sim = CHARTS.simulate_fwl_sample({
          n: mc.n, gamma: mc.gamma, delta: mc.delta,
          alpha: mc.alpha, seed: 1000 + i,
        });
        if (Number.isFinite(sim.naive.b)) naiveArr.push(sim.naive.b);
        if (Number.isFinite(sim.fwl.b))   fwlArr.push(sim.fwl.b);
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
        mc.hist.update({ naive: naiveArr, fwl: fwlArr, alpha_true: mc.alpha });
        const meanN = d3.mean(naiveArr) ?? 0;
        const meanF = d3.mean(fwlArr) ?? 0;
        const sdN   = d3.deviation(naiveArr) ?? 0;
        const sdF   = d3.deviation(fwlArr) ?? 0;
        const flip  = naiveArr.length === 0 ? 0
                      : naiveArr.filter(v => v < 0).length / naiveArr.length;
        document.getElementById("mc-naive-mean").textContent = meanN.toFixed(3);
        document.getElementById("mc-naive-sd").textContent   = sdN.toFixed(3);
        document.getElementById("mc-fwl-mean").textContent   = meanF.toFixed(3);
        document.getElementById("mc-fwl-sd").textContent     = sdF.toFixed(3);
        document.getElementById("mc-naive-flip").textContent = (flip * 100).toFixed(0) + "%";
        btn.disabled = false;
      }
    }
    step();
  });

  // Global error handler.
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
