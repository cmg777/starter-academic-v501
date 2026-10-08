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
  document.querySelectorAll(".cta-card").forEach(card => {
    card.addEventListener("click", () => activateTab(card.dataset.goto));
  });

  // ------------------------------------------------------------------
  // TAB 1 — L1/L2 animation.
  // ------------------------------------------------------------------
  CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — LASSO Lab.
  // ------------------------------------------------------------------
  const lab = {
    n: 200, p: 40, signal: 0.6, lambdaIdx: 40, seed: 1,
    path: null,
    chart: CHARTS.coefficient_path(document.getElementById("lab-path")),
  };

  function lab_refit() {
    const sim = DGP.simulate_lasso({ n: lab.n, p: lab.p, signal: lab.signal, seed: lab.seed });
    lab.sim = sim;
    lab.path = LASSO.lasso_path(sim.X, sim.y, sim.n, sim.p, { nLam: 80, maxIter: 60, tol: 1e-5 });
    lab_render();
  }

  function lab_render() {
    if (!lab.path) return;
    const K = lab.path.lambdas.length;
    const k = Math.max(0, Math.min(K - 1, lab.lambdaIdx));
    const lambda = lab.path.lambdas[k];
    const beta = lab.path.betas[k];
    lab.chart.update(lab.path, lambda);

    document.getElementById("lab-l-val").textContent = lambda.toExponential(2);
    let nz = 0;
    for (let j = 0; j < beta.length; j++) if (Math.abs(beta[j]) > 1e-9) nz++;
    document.getElementById("lab-stat-nz").textContent = nz;
    document.getElementById("lab-stat-p").textContent = lab.p;
    document.getElementById("lab-stat-alpha-l").textContent = beta[0].toFixed(3);

    // Post-OLS on selected support (including treatment column 0 always).
    const support = [];
    for (let j = 0; j < beta.length; j++) if (Math.abs(beta[j]) > 1e-9) support.push(j);
    if (!support.includes(0)) support.unshift(0);
    const n = lab.sim.n, p = lab.sim.p;
    const d = new Float64Array(n);
    for (let i = 0; i < n; i++) d[i] = lab.sim.X[i * p + 0];
    const rest = support.filter(j => j !== 0);
    const Xs = LASSO.subset_columns(lab.sim.X, n, p, rest);
    const ols = LASSO.ols_with_treatment(d, Xs, lab.sim.y, n, rest.length);
    document.getElementById("lab-stat-alpha-o").textContent = ols ? ols.alpha_hat.toFixed(3) : "—";
  }

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  const onParamChange = debounce(lab_refit, 80);
  document.getElementById("lab-n").addEventListener("input", e => {
    lab.n = +e.target.value;
    document.getElementById("lab-n-val").textContent = lab.n;
    onParamChange();
  });
  document.getElementById("lab-p").addEventListener("input", e => {
    lab.p = +e.target.value;
    document.getElementById("lab-p-val").textContent = lab.p;
    onParamChange();
  });
  document.getElementById("lab-s").addEventListener("input", e => {
    lab.signal = +e.target.value;
    document.getElementById("lab-s-val").textContent = lab.signal.toFixed(2);
    onParamChange();
  });
  document.getElementById("lab-l").addEventListener("input", e => {
    lab.lambdaIdx = +e.target.value;
    lab_render();
  });
  document.getElementById("lab-reseed").addEventListener("click", () => {
    lab.seed = Math.floor(Math.random() * 1e9) + 1;
    lab_refit();
  });
  document.getElementById("lab-reset").addEventListener("click", () => {
    lab.n = 200; lab.p = 40; lab.signal = 0.6; lab.lambdaIdx = 40; lab.seed = 1;
    document.getElementById("lab-n").value = lab.n;
    document.getElementById("lab-p").value = lab.p;
    document.getElementById("lab-s").value = lab.signal;
    document.getElementById("lab-l").value = lab.lambdaIdx;
    document.getElementById("lab-n-val").textContent = lab.n;
    document.getElementById("lab-p-val").textContent = lab.p;
    document.getElementById("lab-s-val").textContent = lab.signal.toFixed(2);
    lab_refit();
  });

  lab_refit();

  // ------------------------------------------------------------------
  // TAB 3 — Sensitivity Simulator (rigorous vs CV).
  // ------------------------------------------------------------------
  const sim = {
    n: 120, p: 12, signal: 0.5, asymmetry: 0.5, seed: 2017,
    cmp: CHARTS.alpha_compare(document.getElementById("sim-compare")),
    hist: CHARTS.alpha_histograms(document.getElementById("sim-hist")),
  };

  function sim_refit() {
    const s = DGP.simulate_dl({
      n: sim.n, p: sim.p, signal: sim.signal,
      asymmetry: sim.asymmetry, seed: sim.seed,
    });
    sim.sim = s;
    const rig = LASSO.double_lasso(s.X, s.d, s.y, s.n, s.p, "rigorous");
    const cvr = LASSO.double_lasso(s.X, s.d, s.y, s.n, s.p, "cv",
                                   { nLam: 50, seed: sim.seed });
    sim.rig = rig; sim.cv = cvr;
    sim_render();
  }

  function fmt(x) { return (x === null || Number.isNaN(x)) ? "—" : x.toFixed(3); }
  function fmt4(x) { return (x === null || Number.isNaN(x)) ? "—" : x.toFixed(4); }

  function sim_render() {
    const r = sim.rig, c = sim.cv;
    document.getElementById("sim-rig-alpha").textContent = fmt(r.alpha_hat);
    document.getElementById("sim-rig-se").textContent    = fmt4(r.se_alpha);
    document.getElementById("sim-rig-iy").textContent    = r.n_Iy;
    document.getElementById("sim-rig-id").textContent    = r.n_Id;
    document.getElementById("sim-rig-un").textContent    = r.n_union;
    document.getElementById("sim-rig-lam").textContent   =
      `${r.lambda_y.toExponential(2)}, ${r.lambda_d.toExponential(2)}`;

    document.getElementById("sim-cv-alpha").textContent = fmt(c.alpha_hat);
    document.getElementById("sim-cv-se").textContent    = fmt4(c.se_alpha);
    document.getElementById("sim-cv-iy").textContent    = c.n_Iy;
    document.getElementById("sim-cv-id").textContent    = c.n_Id;
    document.getElementById("sim-cv-un").textContent    = c.n_union;
    document.getElementById("sim-cv-lam").textContent   =
      `${c.lambda_y.toExponential(2)}, ${c.lambda_d.toExponential(2)}`;

    sim.cmp.update({
      rigorous: r.alpha_hat,
      cv: c.alpha_hat,
      alpha_true: sim.sim.alpha_true,
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
    const alphas_rig = [];
    const alphas_cv = [];

    let i = 0;
    function step() {
      const batch = 2;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const s = DGP.simulate_dl({
          n: sim.n, p: sim.p, signal: sim.signal,
          asymmetry: sim.asymmetry, seed: sim.seed + i + 1,
        });
        const r = LASSO.double_lasso(s.X, s.d, s.y, s.n, s.p, "rigorous");
        const c = LASSO.double_lasso(s.X, s.d, s.y, s.n, s.p, "cv",
                                     { nLam: 40, seed: sim.seed + i + 1 });
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
        sim.hist.update({
          alphas_rig, alphas_cv,
          alpha_true: sim.sim.alpha_true,
        });
        const meanRig = d3.mean(alphas_rig);
        const meanCV  = d3.mean(alphas_cv);
        const sdRig   = d3.deviation(alphas_rig);
        const sdCV    = d3.deviation(alphas_cv);
        document.getElementById("sim-cv-mean").textContent = (meanCV ?? 0).toFixed(3);
        document.getElementById("sim-cv-sd").textContent   = (sdCV  ?? 0).toFixed(3);
        document.getElementById("sim-rig-mean").textContent = (meanRig ?? 0).toFixed(3);
        document.getElementById("sim-rig-sd").textContent   = (sdRig  ?? 0).toFixed(3);
        btn.disabled = false;
      }
    }
    step();
  });

  sim_refit();

  // ------------------------------------------------------------------
  // TAB 4 — Method-agreement forest plot from the post's data.
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
    data: null,
  };

  function fp_refresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    // Filter out null estimates (Post-LASSO for variables LASSO dropped).
    const estimates = fp.data.estimates.filter(e => e.estimate !== null && Number.isFinite(e.estimate));
    fp.chart.update(estimates, methods, outcomes);
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
})();
