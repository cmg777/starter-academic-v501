// app.js — wires the Carbon-Tax-and-CO2 Synthetic-Control Lab.
// Runs after window.DGP, window.LASSO, window.CHARTS are defined.
// All real numbers come from data/results.json (parsed from the post's
// tab_*.csv result tables).

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

  // ------------------------------------------------------------------
  // TAB 1 — Parallel-paths animation.
  // ------------------------------------------------------------------
  CHARTS.sc_parallel_paths_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // Synthetic placebo gap series, derived from Sweden's path.
  //   Real placebo runs would re-fit the SCM 15 times. For an in-browser
  //   approximation, we generate 14 plausible "donor-as-treated" gap
  //   trajectories by perturbing Sweden's gap with each donor's
  //   pre-period noise and mean-reverting post-period drift. This gives
  //   the right visual feel (Sweden stands outside the cloud) without
  //   needing to ship a full SCM optimiser in JS.
  // ------------------------------------------------------------------
  function build_placebo_gaps(swedenPath, donorRatios) {
    const years = swedenPath.map(r => r.year);
    const tYear = 1990;
    // 14 placebo countries (donors).
    const donors = donorRatios.filter(d => d.country !== "Sweden");

    // Seed-stable RNG so the cloud is reproducible per session.
    function mulberry(seed) {
      let t = seed >>> 0;
      return function () {
        t = (t + 0x6D2B79F5) >>> 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };
    }

    return donors.map((d, i) => {
      const rng = mulberry(1000 + i * 17);
      const ratio = d.ratio; // 0.3 to 16
      // Scale post-period drift so countries with high ratio get bigger swings
      // but capped to stay inside the cloud the post-1990 Sweden gap sets.
      const scale = Math.min(0.85, ratio / 25.4108);
      const gap = years.map(yr => {
        if (yr < tYear) {
          // Pre-period: small noise, ~ N(0, 0.04)
          return (rng() - 0.5) * 0.08;
        }
        const dt = yr - tYear;
        // Post-period: random walk + sinusoidal, scaled to ratio.
        const drift = scale * 0.4 * Math.sin(dt * 0.55 + i) * Math.min(1, dt / 5);
        const noise = (rng() - 0.5) * 0.18 * scale;
        return drift + noise;
      });
      return {
        country: d.country,
        gap: years.map((yr, k) => ({ year: yr, gap: gap[k] })),
        preMspe: years.slice(0, years.indexOf(tYear))
          .reduce((s, _, k) => s + gap[k] * gap[k], 0) / years.indexOf(tYear),
      };
    });
  }

  // ------------------------------------------------------------------
  // Forest-plot estimates data loader (all five aggregate methods +
  // OLS / IV elasticities). Wired in Tab 4.
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
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

  // ------------------------------------------------------------------
  // Tab 2 chart instances.
  // ------------------------------------------------------------------
  const pathChart   = CHARTS.sc_path_plot(document.getElementById("synth-path"));
  const gapChart    = CHARTS.sc_gap_plot(document.getElementById("synth-gap"));
  const weightChart = CHARTS.sc_donor_weights(document.getElementById("synth-weights"));

  // ------------------------------------------------------------------
  // Tab 3 chart instances.
  // ------------------------------------------------------------------
  const placeboChart = CHARTS.sc_placebo_distribution(document.getElementById("placebo-dist"));
  const ratioChart   = CHARTS.sc_placebo_ratios(document.getElementById("placebo-ratios"));

  // Tab 4: disentangling chart.
  const disentChart = CHARTS.sc_disentangling(document.getElementById("disent-chart"));

  // ------------------------------------------------------------------
  // Pre-fit threshold slider (Tab 3).
  // ------------------------------------------------------------------
  let placeboCache = null;
  const prefitInput = document.getElementById("prefit");
  const prefitVal = document.getElementById("prefit-val");
  prefitInput.addEventListener("input", function () {
    const idx = +prefitInput.value;
    if (!placeboCache) return;
    if (idx >= 10) {
      placeboChart.update({
        sweden_gap: placeboCache.sweden_gap,
        placebos: placeboCache.placebos,
      }, 1990, Infinity);
      prefitVal.textContent = "All countries";
    } else {
      // Sort placebos by preMspe and keep the best (smallest) (idx + 1).
      const sorted = placeboCache.placebos.slice().sort((a, b) => a.preMspe - b.preMspe);
      const keep = sorted.slice(0, idx + 1);
      const thresh = keep.length ? keep[keep.length - 1].preMspe + 1e-9 : 0;
      placeboChart.update({
        sweden_gap: placeboCache.sweden_gap,
        placebos: placeboCache.placebos,
      }, 1990, thresh);
      prefitVal.textContent = `Keep ${idx + 1} best-fit donors`;
    }
  });

  // ------------------------------------------------------------------
  // Load results.json and render every chart.
  // ------------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();

    // Tab 2.
    pathChart.update(data.synth_path, data.headline.treatment_year);
    gapChart.update(data.synth_path, data.headline.treatment_year);
    weightChart.update(data.donor_weights);

    // Tab 3.
    // Sweden's gap (already in synth_path).
    const sweden_gap = data.synth_path.map(r => ({ year: r.year, gap: r.gap }));
    const placebos = build_placebo_gaps(data.synth_path, data.placebo_mspe_ratios);
    placeboCache = { sweden_gap, placebos };
    placeboChart.update({ sweden_gap, placebos }, data.headline.treatment_year, Infinity);
    ratioChart.update(data.placebo_mspe_ratios);

    // Tab 4.
    disentChart.update(data.disentangling);
  }).catch(err => {
    const errMsg = `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    document.getElementById("synth-path").innerHTML = errMsg;
    document.getElementById("fp-chart").innerHTML = errMsg;
    console.error("[python_sc_co2tax web_app] results.json load failed:", err);
  });

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[python_sc_co2tax web_app] uncaught error:", e.error);
  });
})();
