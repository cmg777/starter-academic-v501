// app.js — wires DOM controls to dgp/lasso/charts for stata_bma_dsl.
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
  // TAB 1 — L1 vs L2 animation.
  // ------------------------------------------------------------------
  CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — BMA vs DSL Simulator (DGP-driven).
  // ------------------------------------------------------------------
  const sh = {
    n: 200, p: 40, signal: 0.5, asymmetry: 0.80, seed: 17,
    cmp: CHARTS.alpha_compare(document.getElementById("sh-compare")),
    hist: CHARTS.alpha_histograms(document.getElementById("sh-hist")),
  };

  function fmt(x) { return (x === null || Number.isNaN(x) || !Number.isFinite(x)) ? "—" : x.toFixed(3); }
  function fmt4(x) { return (x === null || Number.isNaN(x) || !Number.isFinite(x)) ? "—" : x.toFixed(4); }

  function sh_refit() {
    const sim = DGP.simulate_dl({
      n: sh.n, p: sh.p, signal: sh.signal,
      asymmetry: sh.asymmetry, seed: sh.seed,
    });
    sh.sim = sim;
    const rig = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "rigorous");
    const cvr = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "cv",
                                   { nLam: 50, seed: sh.seed });
    sh.rig = rig; sh.cv = cvr;
    sh_render();
  }

  function sh_render() {
    const r = sh.rig, c = sh.cv;
    document.getElementById("sh-rig-alpha").textContent = fmt(r.alpha_hat);
    document.getElementById("sh-rig-se").textContent    = fmt4(r.se_alpha);
    document.getElementById("sh-rig-iy").textContent    = r.n_Iy;
    document.getElementById("sh-rig-id").textContent    = r.n_Id;
    document.getElementById("sh-rig-un").textContent    = r.n_union;
    document.getElementById("sh-rig-lam").textContent   =
      `${r.lambda_y.toExponential(2)}, ${r.lambda_d.toExponential(2)}`;

    document.getElementById("sh-cv-alpha").textContent = fmt(c.alpha_hat);
    document.getElementById("sh-cv-se").textContent    = fmt4(c.se_alpha);
    document.getElementById("sh-cv-iy").textContent    = c.n_Iy;
    document.getElementById("sh-cv-id").textContent    = c.n_Id;
    document.getElementById("sh-cv-un").textContent    = c.n_union;
    document.getElementById("sh-cv-lam").textContent   =
      `${c.lambda_y.toExponential(2)}, ${c.lambda_d.toExponential(2)}`;

    sh.cmp.update({
      rigorous: r.alpha_hat,
      cv: c.alpha_hat,
      alpha_true: sh.sim.alpha_true,
    });
  }

  const onShParamChange = debounce(sh_refit, 120);
  document.getElementById("sh-n").addEventListener("input", e => {
    sh.n = +e.target.value;
    document.getElementById("sh-n-val").textContent = sh.n;
    onShParamChange();
  });
  document.getElementById("sh-p").addEventListener("input", e => {
    sh.p = +e.target.value;
    document.getElementById("sh-p-val").textContent = sh.p;
    onShParamChange();
  });
  document.getElementById("sh-s").addEventListener("input", e => {
    sh.signal = +e.target.value;
    document.getElementById("sh-s-val").textContent = sh.signal.toFixed(2);
    onShParamChange();
  });
  document.getElementById("sh-a").addEventListener("input", e => {
    sh.asymmetry = +e.target.value;
    document.getElementById("sh-a-val").textContent = sh.asymmetry.toFixed(2);
    onShParamChange();
  });

  document.getElementById("sh-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sh-progress > div");
    const progLabel = document.getElementById("sh-progress-label");
    const histEl = document.getElementById("sh-hist");
    const histStats = document.getElementById("sh-hist-stats");

    const N_SIMS = 100;
    const alphas_rig = [];
    const alphas_cv = [];

    let i = 0;
    function step() {
      const batch = 2;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const sim = DGP.simulate_dl({
          n: sh.n, p: sh.p, signal: sh.signal,
          asymmetry: sh.asymmetry, seed: sh.seed + i + 1,
        });
        const r = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "rigorous");
        const c = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "cv",
                                     { nLam: 40, seed: sh.seed + i + 1 });
        if (Number.isFinite(r.alpha_hat)) alphas_rig.push(r.alpha_hat);
        if (Number.isFinite(c.alpha_hat)) alphas_cv.push(c.alpha_hat);
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
          alphas_rig, alphas_cv,
          alpha_true: sh.sim.alpha_true,
        });
        const meanRig = d3.mean(alphas_rig);
        const meanCV  = d3.mean(alphas_cv);
        const sdRig   = d3.deviation(alphas_rig);
        const sdCV    = d3.deviation(alphas_cv);
        document.getElementById("sh-cv-mean").textContent = (meanCV ?? 0).toFixed(3);
        document.getElementById("sh-cv-sd").textContent   = (sdCV  ?? 0).toFixed(3);
        document.getElementById("sh-rig-mean").textContent = (meanRig ?? 0).toFixed(3);
        document.getElementById("sh-rig-sd").textContent   = (sdRig  ?? 0).toFixed(3);
        btn.disabled = false;
      }
    }
    step();
  });

  sh_refit();

  // ------------------------------------------------------------------
  // TAB 3 — Forest plot of 7 estimators × 3 GDP coefficients.
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
    bars:  CHARTS.selection_bars(document.getElementById("fp-bars")),
    data:  null,
  };

  function fp_refresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, outcomes);
    // For selection bars, use the post's BMA/DSL FE vs pooled selection counts.
    // The selection_bars chart expects records like { outcome, method, n_Iy, n_Id, n_union };
    // we feed it the four-row selection summary if at least one method below is on.
    const showBars = methods.some(m => m.indexOf("BMA") === 0 || m.indexOf("DSL") === 0);
    if (showBars && fp.data.selection) {
      // selection records use 'outcome' field as the method label
      // (so the chart shows one row per BMA/DSL specification)
      const selOutcomes = fp.data.selection.map(s => s.outcome);
      fp.bars.update(fp.data.selection, selOutcomes);
      document.getElementById("fp-bars").style.display = "block";
    } else {
      document.getElementById("fp-bars").style.display = "none";
    }
  }

  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  // ------------------------------------------------------------------
  // TAB 4 — PIP chart.
  // ------------------------------------------------------------------
  const pip = {
    chart: CHARTS.pip_chart(document.getElementById("pip-chart")),
    data:  null,
    spec:  "fe",
  };

  function pip_refresh() {
    if (!pip.data) return;
    const rows = (pip.spec === "fe") ? pip.data.pips_fe : pip.data.pips_pooled;
    pip.chart.update(rows, 0.80);

    // Compute confusion-matrix style stats.
    let tp = 0, fp_count = 0, fn_count = 0, tn = 0;
    rows.forEach(d => {
      const above = d.pip >= 0.80;
      if (above && d.is_true) tp++;
      else if (above && !d.is_true) fp_count++;
      else if (!above && d.is_true) fn_count++;
      else tn++;
    });
    document.getElementById("pip-tp").textContent = tp;
    document.getElementById("pip-fp").textContent = fp_count;
    document.getElementById("pip-fn").textContent = fn_count;
    document.getElementById("pip-tn").textContent = tn;
  }

  document.querySelectorAll('#pip-spec input[type="radio"]').forEach(el => {
    el.addEventListener("change", () => {
      pip.spec = el.value;
      pip_refresh();
    });
  });

  // ------------------------------------------------------------------
  // Data loader for Tabs 3 + 4.
  // ------------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    pip.data = data;
    fp_refresh();
    pip_refresh();
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    document.getElementById("pip-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[stata_bma_dsl] uncaught error:", e.error);
  });
})();
