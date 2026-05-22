// app.js — wires DOM controls for the IV-with-Panel-Data web app.
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
  // TAB 1 — IV path animation.
  // ------------------------------------------------------------------
  CHARTS.iv_path_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — First-Stage Lab.
  // ------------------------------------------------------------------
  const fs = {
    pi: 0.40, n: 300, rho: 0.60, seed: 17,
    chart: CHARTS.first_stage_scatter(document.getElementById("fs-scatter")),
  };

  function fs_refit() {
    const sim = DGP.simulate_iv({
      n: fs.n, pi: fs.pi, rho: fs.rho, tau: 0, me_sd: 0.5,
      delta_true: -0.30, seed: fs.seed,
    });
    fs.sim = sim;
    const points = [];
    for (let i = 0; i < sim.n; i++) points.push({ z: sim.z[i], d: sim.d[i] });
    const binned = DGP.binned_scatter(sim.z, sim.d, sim.n, 30);
    // Slope via OLS of d on z (univariate).
    let szz = 0, szd = 0, zbar = 0, dbar = 0;
    for (let i = 0; i < sim.n; i++) { zbar += sim.z[i]; dbar += sim.d[i]; }
    zbar /= sim.n; dbar /= sim.n;
    for (let i = 0; i < sim.n; i++) {
      szz += (sim.z[i] - zbar) * (sim.z[i] - zbar);
      szd += (sim.z[i] - zbar) * (sim.d[i] - dbar);
    }
    const slope = szd / Math.max(szz, 1e-12);
    const intercept = dbar - slope * zbar;
    fs.chart.update({
      points, binned, slope, intercept, F: sim.F_first_stage,
    });
    fs_render(sim, slope);
  }

  function fs_render(sim, slope) {
    document.getElementById("fs-stat-slope").textContent = slope.toFixed(3);
    document.getElementById("fs-stat-F").textContent = sim.F_first_stage.toFixed(2);
    let verd, verdColor;
    if (sim.F_first_stage > 16.38) { verd = "Strong"; verdColor = "#00d4c8"; }
    else if (sim.F_first_stage > 10) { verd = "Borderline"; verdColor = "#d97757"; }
    else { verd = "WEAK"; verdColor = "#ff6b6b"; }
    const verdEl = document.getElementById("fs-stat-verdict");
    verdEl.textContent = verd;
    verdEl.style.color = verdColor;
    document.getElementById("fs-stat-n").textContent = sim.n;
  }

  const onFsParam = debounce(fs_refit, 80);
  document.getElementById("fs-pi").addEventListener("input", e => {
    fs.pi = +e.target.value;
    document.getElementById("fs-pi-val").textContent = fs.pi.toFixed(2);
    onFsParam();
  });
  document.getElementById("fs-n").addEventListener("input", e => {
    fs.n = +e.target.value;
    document.getElementById("fs-n-val").textContent = fs.n;
    onFsParam();
  });
  document.getElementById("fs-rho").addEventListener("input", e => {
    fs.rho = +e.target.value;
    document.getElementById("fs-rho-val").textContent = fs.rho.toFixed(2);
    onFsParam();
  });
  document.getElementById("fs-reseed").addEventListener("click", () => {
    fs.seed = (Math.floor(Math.random() * 1e9) + 1) >>> 0;
    fs_refit();
  });
  document.getElementById("fs-reset").addEventListener("click", () => {
    fs.pi = 0.40; fs.n = 300; fs.rho = 0.60; fs.seed = 17;
    document.getElementById("fs-pi").value = fs.pi;
    document.getElementById("fs-n").value = fs.n;
    document.getElementById("fs-rho").value = fs.rho;
    document.getElementById("fs-pi-val").textContent = fs.pi.toFixed(2);
    document.getElementById("fs-n-val").textContent = fs.n;
    document.getElementById("fs-rho-val").textContent = fs.rho.toFixed(2);
    fs_refit();
  });

  fs_refit();

  // ------------------------------------------------------------------
  // TAB 3 — OLS vs 2SLS Showdown.
  // ------------------------------------------------------------------
  const sh = {
    delta: -0.30, me: 1.00, rho: 0.60, tau: 0.40,
    pi: 0.50, n: 300, seed: 7,
    cmp: CHARTS.ols_vs_iv_compare(document.getElementById("sh-compare")),
    hist: CHARTS.ols_iv_histograms(document.getElementById("sh-hist")),
  };

  function sh_refit() {
    const sim = DGP.simulate_iv({
      n: sh.n, pi: sh.pi, rho: sh.rho, tau: sh.tau,
      me_sd: sh.me, delta_true: sh.delta, seed: sh.seed,
    });
    sh.sim = sim;
    const ols = DGP.ols_uni(sim.d, sim.y, sim.n);
    const iv  = DGP.tsls_uni(sim.z, sim.d, sim.y, sim.n);
    sh.ols = ols; sh.iv = iv;
    sh_render();
  }

  function fmt(x) { return (x === null || x === undefined || Number.isNaN(x)) ? "—" : x.toFixed(3); }
  function fmt4(x) { return (x === null || x === undefined || Number.isNaN(x)) ? "—" : x.toFixed(4); }

  function sh_render() {
    document.getElementById("sh-ols-alpha").textContent = fmt(sh.ols.slope);
    document.getElementById("sh-ols-se").textContent    = fmt4(sh.ols.se);
    document.getElementById("sh-ols-bias").textContent  = fmt(sh.ols.slope - sh.sim.delta_true);

    document.getElementById("sh-iv-alpha").textContent = fmt(sh.iv.slope);
    document.getElementById("sh-iv-se").textContent    = fmt4(sh.iv.se);
    document.getElementById("sh-iv-F").textContent     = sh.sim.F_first_stage.toFixed(2);
    document.getElementById("sh-iv-bias").textContent  = fmt(sh.iv.slope - sh.sim.delta_true);

    sh.cmp.update({
      ols: sh.ols.slope,
      iv:  sh.iv.slope,
      alpha_true: sh.sim.delta_true,
    });
  }

  const onShParam = debounce(sh_refit, 100);
  document.getElementById("sh-delta").addEventListener("input", e => {
    sh.delta = +e.target.value;
    document.getElementById("sh-delta-val").textContent = sh.delta.toFixed(2);
    onShParam();
  });
  document.getElementById("sh-me").addEventListener("input", e => {
    sh.me = +e.target.value;
    document.getElementById("sh-me-val").textContent = sh.me.toFixed(2);
    onShParam();
  });
  document.getElementById("sh-rho").addEventListener("input", e => {
    sh.rho = +e.target.value;
    document.getElementById("sh-rho-val").textContent = sh.rho.toFixed(2);
    onShParam();
  });
  document.getElementById("sh-tau").addEventListener("input", e => {
    sh.tau = +e.target.value;
    document.getElementById("sh-tau-val").textContent = sh.tau.toFixed(2);
    onShParam();
  });
  document.getElementById("sh-pi").addEventListener("input", e => {
    sh.pi = +e.target.value;
    document.getElementById("sh-pi-val").textContent = sh.pi.toFixed(2);
    onShParam();
  });
  document.getElementById("sh-n").addEventListener("input", e => {
    sh.n = +e.target.value;
    document.getElementById("sh-n-val").textContent = sh.n;
    onShParam();
  });

  document.getElementById("sh-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sh-progress > div");
    const progLabel = document.getElementById("sh-progress-label");
    const histEl = document.getElementById("sh-hist");
    const histStats = document.getElementById("sh-hist-stats");

    const N_SIMS = 100;
    const alphas_ols = [];
    const alphas_iv  = [];
    let i = 0;
    function step() {
      const end = Math.min(N_SIMS, i + 4);
      for (; i < end; i++) {
        const sim = DGP.simulate_iv({
          n: sh.n, pi: sh.pi, rho: sh.rho, tau: sh.tau,
          me_sd: sh.me, delta_true: sh.delta, seed: sh.seed + i + 1,
        });
        const o = DGP.ols_uni(sim.d, sim.y, sim.n);
        const v = DGP.tsls_uni(sim.z, sim.d, sim.y, sim.n);
        if (Number.isFinite(o.slope)) alphas_ols.push(o.slope);
        if (Number.isFinite(v.slope)) alphas_iv.push(v.slope);
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
        sh.hist.update({
          alphas_ols, alphas_iv,
          alpha_true: sh.sim.delta_true,
        });
        const meanO = d3.mean(alphas_ols);
        const meanI = d3.mean(alphas_iv);
        const sdO   = d3.deviation(alphas_ols);
        const sdI   = d3.deviation(alphas_iv);
        document.getElementById("sh-ols-mean").textContent = (meanO ?? 0).toFixed(3);
        document.getElementById("sh-ols-sd").textContent   = (sdO   ?? 0).toFixed(3);
        document.getElementById("sh-iv-mean").textContent  = (meanI ?? 0).toFixed(3);
        document.getElementById("sh-iv-sd").textContent    = (sdI   ?? 0).toFixed(3);
        btn.disabled = false;
      }
    }
    step();
  });

  sh_refit();

  // ------------------------------------------------------------------
  // TAB 4 — Forest plot from real data.
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.forest_plot_iv(document.getElementById("fp-chart")),
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

  window.addEventListener("error", function (e) {
    console.error("[stata_iv_panel web_app] uncaught error:", e.error);
  });
})();
