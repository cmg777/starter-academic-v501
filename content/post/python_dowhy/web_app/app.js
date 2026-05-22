// app.js — wires the DOM controls in index.html to dgp/lasso/charts.
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

  function fmt(x, prec) {
    if (typeof x !== "number" || !Number.isFinite(x)) return "—";
    return x.toFixed(prec == null ? 3 : prec);
  }

  // ------------------------------------------------------------------
  // TAB 1 — DAG concept animation.
  // ------------------------------------------------------------------
  CHARTS.dowhy_dag_animation(document.getElementById("intro-dag"));

  // ------------------------------------------------------------------
  // TAB 2 — Confounder Lab.
  //
  // Uses DGP.simulate_dl for the (X, d, y) draw, then fits:
  //   - Naive:    OLS of y on d alone (one regressor).
  //   - Adjusted: OLS of y on [d, X] (backdoor adjustment, p+1 regressors).
  //
  // Both use LASSO.ols_with_treatment for the Cholesky solve and SE on the
  // treatment coefficient.
  // ------------------------------------------------------------------
  const cf = {
    n: 200, p: 20, signal: 0.7, asymmetry: 0.3, seed: 7,
    chart: CHARTS.ate_compare(document.getElementById("cf-compare")),
    hist:  CHARTS.alpha_histograms(document.getElementById("cf-hist")),
  };

  // Helper: build an empty Float64Array of length n*0 as a (n x 0) matrix.
  function emptyMatrix(n) { return new Float64Array(0); }

  function fitNaive(sim) {
    // OLS of y on d, no controls.
    return LASSO.ols_with_treatment(sim.d, emptyMatrix(sim.n), sim.y, sim.n, 0);
  }
  function fitAdjusted(sim) {
    // OLS of y on [d, X_1..X_p] (backdoor adjustment with all covariates).
    return LASSO.ols_with_treatment(sim.d, sim.X, sim.y, sim.n, sim.p);
  }

  function cf_refit() {
    const sim = DGP.simulate_dl({
      n: cf.n, p: cf.p, signal: cf.signal,
      asymmetry: cf.asymmetry, seed: cf.seed,
    });
    cf.sim = sim;
    const naive = fitNaive(sim);
    const adj   = fitAdjusted(sim);
    const a_true = sim.alpha_true;

    const set = (id, val) => { document.getElementById(id).textContent = val; };
    set("cf-naive-alpha", naive ? fmt(naive.alpha_hat) : "—");
    set("cf-naive-se",    naive ? fmt(naive.se_alpha)   : "—");
    set("cf-naive-bias",  naive ? fmt(naive.alpha_hat - a_true, 3) : "—");
    set("cf-adj-alpha",   adj ? fmt(adj.alpha_hat) : "—");
    set("cf-adj-se",      adj ? fmt(adj.se_alpha)  : "—");
    set("cf-adj-bias",    adj ? fmt(adj.alpha_hat - a_true, 3) : "—");

    cf.chart.update({
      naive:    naive ? naive.alpha_hat : 0,
      adjusted: adj   ? adj.alpha_hat   : 0,
      alpha_true: a_true,
    });
  }

  const onCfChange = debounce(cf_refit, 100);
  function bindRange(id, key, valId, prec) {
    document.getElementById(id).addEventListener("input", e => {
      const v = +e.target.value;
      cf[key] = v;
      document.getElementById(valId).textContent = prec ? v.toFixed(prec) : v;
      onCfChange();
    });
  }
  bindRange("cf-n", "n",         "cf-n-val", 0);
  bindRange("cf-p", "p",         "cf-p-val", 0);
  bindRange("cf-s", "signal",    "cf-s-val", 2);
  bindRange("cf-a", "asymmetry", "cf-a-val", 2);

  // 100-simulation Monte Carlo button.
  document.getElementById("cf-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const N = 100;
    const arN = [], arA = [];
    let i = 0;
    const progressEl  = document.querySelector("#cf-progress > div");
    const progressLbl = document.getElementById("cf-progress-label");
    progressLbl.textContent = "Running…";
    const tick = () => {
      const end = Math.min(N, i + 2);
      for (; i < end; i++) {
        const s = DGP.simulate_dl({
          n: cf.n, p: cf.p, signal: cf.signal,
          asymmetry: cf.asymmetry, seed: cf.seed + i + 1,
        });
        const naive = fitNaive(s);
        const adj   = fitAdjusted(s);
        if (naive && Number.isFinite(naive.alpha_hat)) arN.push(naive.alpha_hat);
        if (adj   && Number.isFinite(adj.alpha_hat))   arA.push(adj.alpha_hat);
      }
      progressEl.style.width = (i / N * 100) + "%";
      if (i < N) setTimeout(tick, 0);
      else {
        progressLbl.textContent = `Done — ${arN.length} / ${arA.length} valid fits`;
        document.getElementById("cf-hist").style.display = "block";
        document.getElementById("cf-hist-stats").style.display = "grid";
        cf.hist.update({
          alphas_rig: arA, alphas_cv: arN,
          alpha_true: cf.sim.alpha_true,
        });
        const mean = a => a.reduce((s,x) => s+x, 0) / a.length;
        const sd   = (a, m) => Math.sqrt(a.reduce((s,x) => s + (x-m)*(x-m), 0) / a.length);
        const mN = mean(arN), mA = mean(arA);
        document.getElementById("cf-naive-mean").textContent = fmt(mN);
        document.getElementById("cf-naive-sd").textContent   = fmt(sd(arN, mN));
        document.getElementById("cf-adj-mean").textContent   = fmt(mA);
        document.getElementById("cf-adj-sd").textContent     = fmt(sd(arA, mA));
        btn.disabled = false;
      }
    };
    tick();
  });

  cf_refit();

  // ------------------------------------------------------------------
  // TAB 3 — Forest plot of ATE estimates (Pattern-A, real data).
  // ------------------------------------------------------------------
  const forest = CHARTS.ate_forest_plot(document.getElementById("fp-chart"));
  let fpData = null;

  function fp_refresh() {
    if (!fpData) return;
    const methods = Array.from(document.querySelectorAll("#fp-methods input:checked"))
      .map(el => el.value);
    forest.update(fpData.estimates || [], methods);
  }
  document.querySelectorAll("#fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  // ------------------------------------------------------------------
  // TAB 4 — Refutation bars (Pattern-A).
  // ------------------------------------------------------------------
  const refChart = CHARTS.refutation_bars(document.getElementById("ref-chart"));
  let refData = null;
  function ref_refresh() {
    if (!refData) return;
    refChart.update(refData.refutation || []);
  }

  // ------------------------------------------------------------------
  // Data loader — fetch results.json once and feed both Tab 3 + Tab 4.
  // ------------------------------------------------------------------
  fetch("data/results.json")
    .then(r => r.json())
    .then(data => {
      fpData  = data;
      refData = data;
      fp_refresh();
      ref_refresh();
    })
    .catch(err => {
      console.error("Failed to load results.json:", err);
      const el = document.getElementById("fp-chart");
      if (el) el.innerHTML =
        '<div style="padding:20px;color:#d97757;">Could not load results.json. Use the simulator tab.</div>';
    });

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
