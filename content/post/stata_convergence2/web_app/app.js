// app.js — wires DOM controls to the convergence-specific CHARTS module.
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

  // ------------------------------------------------------------------
  // TAB 1 — Mean-reversion animation.
  // ------------------------------------------------------------------
  CHARTS.mean_reversion_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // Shared data (loaded from data/results.json once).
  // ------------------------------------------------------------------
  const APP = {
    data: null,
    trend_chart: null,
    sigma_chart: null,
    quartile_chart: null,
    ovb_bars: null,
    ovb_compare: null,
    ovb_hist: null,
    forest_chart: null,
    convergence_twin: null,
    trend_year: 2000,
    ovb: { d: 0.49, l: 0.89, bc: -0.11 },
  };

  // ------------------------------------------------------------------
  // TAB 2 — β & σ Explorer.
  // ------------------------------------------------------------------
  APP.trend_chart = CHARTS.beta_trend_chart(document.getElementById("trend-chart"));
  APP.sigma_chart = CHARTS.sigma_chart(document.getElementById("sigma-chart"));
  APP.quartile_chart = CHARTS.quartile_chart(document.getElementById("quartile-chart"));

  function refreshTrend() {
    if (!APP.data) return;
    APP.trend_chart.update(APP.data.beta_trend, APP.trend_year);
    // Find nearest row.
    let best = APP.data.beta_trend[0], bestDiff = Infinity;
    for (const d of APP.data.beta_trend) {
      const diff = Math.abs(d.year - APP.trend_year);
      if (diff < bestDiff) { bestDiff = diff; best = d; }
    }
    document.getElementById("trend-stat-beta").textContent = best.beta.toFixed(3);
    const sign = best.beta > 0.01 ? "divergence" : (best.beta < -0.01 ? "convergence" : "≈ 0");
    const el = document.getElementById("trend-stat-sign");
    el.textContent = sign;
    el.style.color = best.beta < 0 ? "var(--teal)" : "var(--orange)";
  }

  document.getElementById("trend-year").addEventListener("input", e => {
    APP.trend_year = +e.target.value;
    document.getElementById("trend-year-val").textContent = APP.trend_year;
    refreshTrend();
  });

  // ------------------------------------------------------------------
  // TAB 3 — OVB Simulator.
  // ------------------------------------------------------------------
  APP.ovb_bars = CHARTS.ovb_bars(document.getElementById("ovb-bars"));
  APP.ovb_compare = CHARTS.beta_compare(document.getElementById("ovb-compare"));
  APP.ovb_hist = CHARTS.gap_histogram(document.getElementById("ovb-hist"));

  function fmt(x) { return (x === null || Number.isNaN(x)) ? "—" : x.toFixed(3); }

  function refreshOVB() {
    const { d, l, bc } = APP.ovb;
    const gap = d * l;
    const beta = bc + gap;
    document.getElementById("ovb-d-val").textContent = d.toFixed(2);
    document.getElementById("ovb-l-val").textContent = l.toFixed(2);
    document.getElementById("ovb-bc-val").textContent = bc.toFixed(2);
    document.getElementById("ovb-gap").textContent = fmt(gap);
    document.getElementById("ovb-d-show").textContent = fmt(d);
    document.getElementById("ovb-l-show").textContent = fmt(l);
    document.getElementById("ovb-bu-show").textContent = fmt(beta);
    APP.ovb_bars.update({ delta: d, lambda: l });
    APP.ovb_compare.update({ beta_uncond: beta, beta_cond: bc });
  }

  function setOVB({ d, l, bc }) {
    if (d !== undefined) {
      APP.ovb.d = d; document.getElementById("ovb-d").value = d;
    }
    if (l !== undefined) {
      APP.ovb.l = l; document.getElementById("ovb-l").value = l;
    }
    if (bc !== undefined) {
      APP.ovb.bc = bc; document.getElementById("ovb-bc").value = bc;
    }
    refreshOVB();
  }

  document.getElementById("ovb-d").addEventListener("input", e => {
    APP.ovb.d = +e.target.value;
    refreshOVB();
  });
  document.getElementById("ovb-l").addEventListener("input", e => {
    APP.ovb.l = +e.target.value;
    refreshOVB();
  });
  document.getElementById("ovb-bc").addEventListener("input", e => {
    APP.ovb.bc = +e.target.value;
    refreshOVB();
  });

  document.getElementById("ovb-preset-1985").addEventListener("click", () => {
    setOVB({ d: 0.49, l: 0.89, bc: -0.11 });
  });
  document.getElementById("ovb-preset-2005").addEventListener("click", () => {
    setOVB({ d: 0.22, l: 0.18, bc: -0.81 });
  });
  document.getElementById("ovb-preset-counter").addEventListener("click", () => {
    setOVB({ d: 0.22, l: 0.89, bc: -0.81 });
  });

  // 100 Monte Carlo draws of (d, l) from the post's empirical range.
  document.getElementById("ovb-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#ovb-progress > div");
    const progLabel = document.getElementById("ovb-progress-label");
    const histEl = document.getElementById("ovb-hist");
    const histStats = document.getElementById("ovb-hist-stats");
    const N = 100;
    const gaps = [];
    // Pseudo-random seeded draws via DGP.mulberry32 (already loaded).
    const rng = DGP.mulberry32(13);

    let i = 0;
    function step() {
      const end = Math.min(N, i + 5);
      for (; i < end; i++) {
        // Uniform draws on the post's empirical ranges.
        const d = 0.05 + 0.55 * rng();  // delta in [0.05, 0.60]
        const l = 0.05 + 1.00 * rng();  // lambda in [0.05, 1.05]
        gaps.push(d * l);
      }
      const pct = (i / N) * 100;
      progBar.style.width = pct + "%";
      progLabel.textContent = `simulation ${i} / ${N}`;
      if (i < N) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = `done (${N} draws)`;
        histEl.style.display = "block";
        histStats.style.display = "grid";
        APP.ovb_hist.update({ gaps, targetGap: 0.44 });
        const mean = d3.mean(gaps);
        const sd   = d3.deviation(gaps);
        const share = gaps.filter(g => g > 0.44).length / gaps.length;
        document.getElementById("ovb-mean").textContent  = (mean ?? 0).toFixed(3);
        document.getElementById("ovb-sd").textContent    = (sd   ?? 0).toFixed(3);
        document.getElementById("ovb-share").textContent = (share * 100).toFixed(0) + "%";
        btn.disabled = false;
      }
    }
    step();
  });

  refreshOVB();

  // ------------------------------------------------------------------
  // TAB 4 — Forest plot + conditional-convergence twin lines.
  // ------------------------------------------------------------------
  APP.forest_chart = CHARTS.forest_plot(document.getElementById("fp-chart"));
  APP.convergence_twin = CHARTS.convergence_twin(document.getElementById("fp-twin"));

  function fp_refresh() {
    if (!APP.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    APP.forest_chart.update(APP.data.estimates, methods, outcomes);
  }

  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  // ------------------------------------------------------------------
  // Data loader.
  // ------------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    APP.data = data;
    APP.sigma_chart.update(data.sigma);
    APP.quartile_chart.update(data.quartile_growth);
    APP.convergence_twin.update(data.conditional_convergence);
    refreshTrend();
    fp_refresh();
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    document.getElementById("trend-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
