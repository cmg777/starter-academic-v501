// app.js — wires DOM controls to dgp/charts modules for stata_cate.
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
  // TAB 1 — Heterogeneity animation.
  // ------------------------------------------------------------------
  CHARTS.heterogeneity_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — CATE Simulator.
  // ------------------------------------------------------------------
  const sm = {
    n: 300, sigma: 1.5, beta: 1.0, shape: "linear", seed: 7,
    curve: CHARTS.cate_simulator_curve(document.getElementById("sm-curve")),
  };

  // True τ(x) given the shape and heterogeneity strength.
  // x is in [0, 1]. Mean centred so the ATE depends only on average shape.
  function trueTau(x, shape, beta) {
    let raw;
    if (shape === "linear")   raw = beta * (x - 0.5) * 2.0;
    else if (shape === "ushape") raw = beta * (Math.pow(x - 0.5, 2) * 4 - 0.33);
    else if (shape === "sigmoid") raw = beta * (1 / (1 + Math.exp(-(x - 0.5) * 10)) - 0.5) * 2;
    else /* constant */ raw = 0;
    return 1.0 + raw; // baseline ATE = 1.0
  }

  function sm_refit() {
    const rng = DGP.mulberry32(sm.seed >>> 0);
    const normal = DGP.makeNormal(rng);
    // Generate xs uniformly on [0, 1]; sort for nicer rendering of the true curve.
    const xs = new Array(sm.n);
    for (let i = 0; i < sm.n; i++) xs[i] = rng();
    xs.sort((a, b) => a - b);
    // True tau and noisy estimate. For pedagogy we add measurement-style
    // noise to tau on top of the smooth function so dots scatter.
    const true_tau = xs.map(x => trueTau(x, sm.shape, sm.beta));
    const est_tau  = true_tau.map(t => t + sm.sigma * normal());

    sm.curve.update({
      xs,
      true_tau,
      est_tau,
      ate_true: true_tau.reduce((s, v) => s + v, 0) / true_tau.length,
      ate_hat:  est_tau.reduce((s, v) => s + v, 0) / est_tau.length,
      xLabel: "Covariate x (e.g. standardised income, 0 = low, 1 = high)",
    });

    // Stats
    const ate_true = true_tau.reduce((s, v) => s + v, 0) / true_tau.length;
    const ate_hat  = est_tau.reduce((s, v) => s + v, 0) / est_tau.length;
    const minHat = Math.min.apply(null, est_tau);
    const maxHat = Math.max.apply(null, est_tau);
    // Toy heterogeneity test: F-stat from linear regression of est_tau on x.
    let xm = 0, ym = 0;
    for (let i = 0; i < sm.n; i++) { xm += xs[i]; ym += est_tau[i]; }
    xm /= sm.n; ym /= sm.n;
    let sxx = 0, sxy = 0, sse_full = 0, sse_null = 0;
    for (let i = 0; i < sm.n; i++) {
      const dx = xs[i] - xm, dy = est_tau[i] - ym;
      sxx += dx * dx; sxy += dx * dy;
    }
    const slope = sxx > 0 ? sxy / sxx : 0;
    const intercept = ym - slope * xm;
    for (let i = 0; i < sm.n; i++) {
      const fit = intercept + slope * xs[i];
      sse_full += Math.pow(est_tau[i] - fit, 2);
      sse_null += Math.pow(est_tau[i] - ym, 2);
    }
    const F = sm.n > 2 ? ((sse_null - sse_full) / 1) / (sse_full / (sm.n - 2)) : 0;

    document.getElementById("sm-stat-ate-true").textContent = ate_true.toFixed(2);
    document.getElementById("sm-stat-ate-hat").textContent  = ate_hat.toFixed(2);
    document.getElementById("sm-stat-range").textContent    = `[${minHat.toFixed(2)}, ${maxHat.toFixed(2)}]`;
    document.getElementById("sm-stat-het").textContent      = F.toFixed(2);
  }

  const onSmParam = debounce(sm_refit, 80);
  document.getElementById("sm-n").addEventListener("input", e => {
    sm.n = +e.target.value;
    document.getElementById("sm-n-val").textContent = sm.n;
    onSmParam();
  });
  document.getElementById("sm-sigma").addEventListener("input", e => {
    sm.sigma = +e.target.value;
    document.getElementById("sm-sigma-val").textContent = sm.sigma.toFixed(2);
    onSmParam();
  });
  document.getElementById("sm-beta").addEventListener("input", e => {
    sm.beta = +e.target.value;
    document.getElementById("sm-beta-val").textContent = sm.beta.toFixed(2);
    onSmParam();
  });
  document.getElementById("sm-shape").addEventListener("change", e => {
    sm.shape = e.target.value;
    sm_refit();
  });
  document.getElementById("sm-reseed").addEventListener("click", () => {
    sm.seed = Math.floor(Math.random() * 1e9) + 1;
    sm_refit();
  });
  document.getElementById("sm-reset").addEventListener("click", () => {
    sm.n = 300; sm.sigma = 1.5; sm.beta = 1.0; sm.shape = "linear"; sm.seed = 7;
    document.getElementById("sm-n").value = sm.n;
    document.getElementById("sm-sigma").value = sm.sigma;
    document.getElementById("sm-beta").value = sm.beta;
    document.getElementById("sm-shape").value = sm.shape;
    document.getElementById("sm-n-val").textContent = sm.n;
    document.getElementById("sm-sigma-val").textContent = sm.sigma.toFixed(2);
    document.getElementById("sm-beta-val").textContent = sm.beta.toFixed(2);
    sm_refit();
  });

  sm_refit();

  // ------------------------------------------------------------------
  // TAB 3 — GATE / GATES / Forest plot (real data).
  // ------------------------------------------------------------------
  // Both views share the same container; recreate the chart per view so the
  // active builder owns the live SVG (avoids stale DOM references when the
  // alternate builder calls innerHTML="").
  const gateState = {
    view: "gate",
    data: null,
  };

  const VIEW_NOTES = {
    gate:   "5 prespecified income categories. Teal = significant at 5%; orange = not significant.",
    gates:  "4 data-driven quartiles of predicted τ̂. Q1 = top 25% of predicted effect.",
    forest: "3 ATE estimators on the same data. The naive raw gap is shown for contrast.",
  };

  function gate_render() {
    if (!gateState.data) return;
    const note = document.getElementById("gate-note");
    const stats = document.getElementById("gate-stats");
    note.textContent = VIEW_NOTES[gateState.view];

    const container = document.getElementById("gate-chart");

    if (gateState.view === "forest") {
      stats.style.display = "none";
      // Recreate the forest plot fresh so it owns the container's SVG.
      const forest = CHARTS.forest_plot(container);
      const rows = gateState.data.estimates;
      const outcomes = ["ATE on assets"];
      const methods = rows.map(r => r.method);
      forest.update(rows, methods, outcomes);
      return;
    }

    stats.style.display = "grid";
    let rows, chi2, df, pval, chi2_label;
    if (gateState.view === "gate") {
      rows = gateState.data.gate_incomecat;
      // map to the schema gate_bars expects (label, estimate, ci_lo, ci_hi, se, p_value, n_obs)
      chi2 = 18.44; df = 4; pval = 0.001;
      chi2_label = "estat gatetest";
    } else {
      rows = gateState.data.gates_quartile;
      chi2 = 5.54; df = 1; pval = 0.019;
      chi2_label = "estat heterogeneity (AIPW)";
    }
    // Recreate the gate bars chart fresh so it owns the container's SVG.
    const chart = CHARTS.gate_bars(container);
    chart.update(rows, {
      title: gateState.view === "gate" ? "GATE by income category (PO ML, 95% CI)" : "GATES by data-driven quartile (PO ML, 95% CI)",
      ate: 7937,
    });

    document.getElementById("gate-stat-chi2").textContent = "χ²(" + df + ") = " + chi2.toFixed(2);
    document.getElementById("gate-stat-chi2-sub").textContent = chi2_label + ", p = " + pval.toFixed(3);

    // Find hi and lo by estimate
    const sorted = rows.slice().sort((a, b) => b.estimate - a.estimate);
    const hi = sorted[0], lo = sorted[sorted.length - 1];
    document.getElementById("gate-stat-hi").textContent = "$" + Math.round(hi.estimate).toLocaleString();
    document.getElementById("gate-stat-lo").textContent = "$" + Math.round(lo.estimate).toLocaleString();
    const ratio = (hi.estimate / Math.max(1, lo.estimate));
    document.getElementById("gate-stat-ratio").textContent = ratio.toFixed(1) + "×";
  }

  document.querySelectorAll('#gate-view input[type="radio"]').forEach(el => {
    el.addEventListener("change", () => {
      gateState.view = el.value;
      gate_render();
    });
  });

  // ------------------------------------------------------------------
  // TAB 4 — IATE Explorer.
  // ------------------------------------------------------------------
  const iate = {
    hist: CHARTS.iate_histogram(document.getElementById("iate-hist")),
    cov:  CHARTS.iate_vs_covariate(document.getElementById("iate-cov-chart")),
    covKey: "age",
    data: null,
  };

  const COV_CONFIG = {
    age:    { binnedKey: "iate_by_age",    xKey: "age",    xLabel: "Age (years)", xFormat: d3.format(",.0f") },
    educ:   { binnedKey: "iate_by_educ",   xKey: "educ",   xLabel: "Years of education", xFormat: d3.format(",.0f") },
    income: { binnedKey: "iate_by_income", xKey: "income", xLabel: "Household income (dollars)", xFormat: d => "$" + (d/1000).toFixed(0) + "k" },
  };

  function iate_render_cov() {
    if (!iate.data) return;
    const cfg = COV_CONFIG[iate.covKey];
    const binned = iate.data[cfg.binnedKey] || [];
    // Subset the 800-point scatter to (covKey, iate) tuples.
    const scatter = (iate.data.iate_scatter || []).map(s => ({
      [cfg.xKey]: s[cfg.xKey], iate: s.iate,
    }));
    iate.cov.update({
      binned, scatter,
      xKey: cfg.xKey,
      xLabel: cfg.xLabel,
      xFormat: cfg.xFormat,
    });
  }

  document.querySelectorAll('#iate-cov input[type="radio"]').forEach(el => {
    el.addEventListener("change", () => {
      iate.covKey = el.value;
      iate_render_cov();
    });
  });

  function iate_render_static() {
    if (!iate.data) return;
    iate.hist.update(iate.data.iate_histogram, {
      ate: 7937,
      median: iate.data.meta.iate_median,
    });
    iate_render_cov();

    // Fill classification table
    const tb = document.getElementById("iate-classification-body");
    tb.innerHTML = "";
    iate.data.classification.forEach(r => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--line)";
      tr.innerHTML = `
        <td style="padding:8px 6px;">${r.variable}</td>
        <td style="padding:8px 6px;text-align:right;">${typeof r.top === 'number' && r.top > 100 ? '$' + Math.round(r.top).toLocaleString() : r.top}</td>
        <td style="padding:8px 6px;text-align:right;">${typeof r.bottom === 'number' && r.bottom > 100 ? '$' + Math.round(r.bottom).toLocaleString() : r.bottom}</td>
        <td style="padding:8px 6px;text-align:right;color:#00d4c8;">${typeof r.difference === 'number' && r.difference > 100 ? '$' + Math.round(r.difference).toLocaleString() : r.difference}</td>
        <td style="padding:8px 6px;text-align:right;">${r.t_stat.toFixed(2)}</td>
      `;
      tb.appendChild(tr);
    });

    // Fill heterogeneity tests table
    const tt = document.getElementById("iate-tests-body");
    tt.innerHTML = "";
    iate.data.het_tests.forEach(t => {
      const tr = document.createElement("tr");
      const verdict = t.p_value < 0.05
        ? "<span style='color:#00d4c8'>reject homogeneity</span>"
        : "<span style='color:#d97757'>cannot reject</span>";
      tr.style.borderBottom = "1px solid var(--line)";
      tr.innerHTML = `
        <td style="padding:8px 6px;">${t.name}</td>
        <td style="padding:8px 6px;text-align:right;">${t.chi2.toFixed(2)}</td>
        <td style="padding:8px 6px;text-align:right;">${t.df}</td>
        <td style="padding:8px 6px;text-align:right;">${t.p_value.toFixed(3)}</td>
        <td style="padding:8px 6px;">${verdict}</td>
      `;
      tt.appendChild(tr);
    });
  }

  // ------------------------------------------------------------------
  // Data loader for Tabs 3 + 4.
  // ------------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    gateState.data = data;
    iate.data = data;
    gate_render();
    iate_render_static();
  }).catch(err => {
    document.getElementById("gate-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    document.getElementById("iate-hist").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[stata_cate] uncaught error:", e.error);
  });
})();
