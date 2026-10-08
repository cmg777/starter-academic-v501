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

  // ------------------------------------------------------------------
  // Generic debounce.
  // ------------------------------------------------------------------
  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ------------------------------------------------------------------
  // TAB 1 — BMA concept animation (auto-runs once).
  // ------------------------------------------------------------------
  CHARTS.bma_concept_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — PIP forest plot from real data.
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.pip_forest(document.getElementById("fp-chart")),
    data: null,
  };

  function fp_refresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked"))
      .map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked"))
      .map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, outcomes);
  }
  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  // ------------------------------------------------------------------
  // TAB 3 — Prior sensitivity simulator.
  //   Computes a simulated PIP per variable as a function of EMS and a
  //   dilution penalty. Calibrated to four prior anchors from the post:
  //     EMS=2 (skeptical), EMS=4.5 (Binomial), EMS=8 (generous),
  //     and the binomial-beta "near-everything" case.
  //   At each anchor, the simulated PIP matches the post's reported PIP.
  //   Between anchors, we linearly interpolate.
  // ------------------------------------------------------------------
  // Per-variable PIP at three EMS anchors (taken from §12 of the post).
  // EMS values: 2 (Skeptical), 4.5 (Binomial), 8 (~Binomial-Beta).
  const PIP_ANCHORS = {
    "Population":        { label: "Population",        sign: "+",   ems: [0.964, 0.990, 0.998] },
    "Life expectancy":   { label: "Life expectancy",   sign: "+",   ems: [0.637, 0.864, 0.974] },
    "Investment share":  { label: "Investment share",  sign: "+",   ems: [0.483, 0.773, 0.954] },
    "Trade openness":    { label: "Trade openness",    sign: "+",   ems: [0.468, 0.766, 0.952] },
    "Government share":  { label: "Government share",  sign: "-",   ems: [0.459, 0.751, 0.948] },
    "Education":         { label: "Education",         sign: "+/-", ems: [0.420, 0.717, 0.938] },
    "Population growth": { label: "Population growth", sign: "+",   ems: [0.414, 0.714, 0.938] },
    "Democracy":         { label: "Democracy",         sign: "-",   ems: [0.372, 0.678, 0.929] },
    "Investment price":  { label: "Investment price",  sign: "-",   ems: [0.344, 0.656, 0.924] },
  };

  // Per-variable dilution multiplier (correlation-driven, calibrated to
  // §12.3 of the post). The dilution prior reduces correlated regressors'
  // PIP more than independent ones. Multiplier of 1.0 = no change.
  const DIL_MULT = {
    "Population":        1.000,  // 0.990 -> 0.989  ~ 1.000
    "Life expectancy":   0.935,  // 0.864 -> 0.808
    "Investment share":  0.929,  // 0.773 -> 0.718
    "Trade openness":    0.970,  // 0.766 -> 0.743
    "Government share":  0.985,  // 0.751 -> 0.740
    "Education":         0.893,  // 0.717 -> 0.640
    "Population growth": 0.915,  // 0.714 -> 0.653
    "Democracy":         0.882,  // 0.678 -> 0.598
    "Investment price":  0.973,  // 0.656 -> 0.638
  };

  function interpPIP(emsArr, ems) {
    // Anchors at x = [2, 4.5, 8]; linear interpolation, clamped on edges.
    const xs = [2.0, 4.5, 8.0];
    if (ems <= xs[0]) return emsArr[0];
    if (ems >= xs[xs.length - 1]) return emsArr[emsArr.length - 1];
    for (let i = 0; i < xs.length - 1; i++) {
      if (ems >= xs[i] && ems <= xs[i + 1]) {
        const t = (ems - xs[i]) / (xs[i + 1] - xs[i]);
        return emsArr[i] + t * (emsArr[i + 1] - emsArr[i]);
      }
    }
    return emsArr[1];
  }

  const sim = {
    ems: 4.5,
    dil: 0.0,
    thr: 0.75,
    chart: CHARTS.pip_bars(document.getElementById("sim-bars")),
  };

  function sim_compute() {
    const rows = [];
    for (const key in PIP_ANCHORS) {
      const a = PIP_ANCHORS[key];
      let pip = interpPIP(a.ems, sim.ems);
      // Apply dilution penalty: linearly blend with the dilution multiplier.
      const dilFactor = 1 + sim.dil * (DIL_MULT[key] - 1);
      pip = Math.max(0, Math.min(1, pip * dilFactor));
      rows.push({ label: a.label, pip, sign: a.sign });
    }
    return rows;
  }

  function sim_render() {
    const rows = sim_compute();
    sim.chart.update(rows);

    const survive = rows.filter(r => r.pip >= sim.thr).length;
    const avg = rows.reduce((s, r) => s + r.pip, 0) / rows.length;
    const postEMS = rows.reduce((s, r) => s + r.pip, 0);
    const top = rows.slice().sort((a, b) => b.pip - a.pip)[0];
    document.getElementById("sim-stat-survive").textContent = survive;
    document.getElementById("sim-stat-avg").textContent = avg.toFixed(3);
    document.getElementById("sim-stat-post-ems").textContent = postEMS.toFixed(2);
    document.getElementById("sim-stat-top").textContent = top.label;
  }

  const onSimChange = debounce(sim_render, 30);
  document.getElementById("sim-ems").addEventListener("input", e => {
    sim.ems = +e.target.value;
    document.getElementById("sim-ems-val").textContent = sim.ems.toFixed(1);
    onSimChange();
  });
  document.getElementById("sim-dil").addEventListener("input", e => {
    sim.dil = +e.target.value;
    document.getElementById("sim-dil-val").textContent = sim.dil.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-thr").addEventListener("input", e => {
    sim.thr = +e.target.value;
    document.getElementById("sim-thr-val").textContent = sim.thr.toFixed(2);
    // Threshold only changes the survive count; render is cheap, just call.
    sim_render();
  });
  // Initial render.
  sim_render();

  // ------------------------------------------------------------------
  // TAB 4 — Jointness heatmap.
  // ------------------------------------------------------------------
  const joint = {
    chart: CHARTS.jointness_heatmap(document.getElementById("joint-heat")),
    data: null,
  };

  function joint_refresh() {
    if (!joint.data) return;
    const vars = ["ish", "sed", "pgrw", "pop", "ipr", "opem", "gsh", "lnlex", "polity"];
    joint.chart.update(joint.data, vars);
  }

  // ------------------------------------------------------------------
  // Data loader for Tab 2 + Tab 4.
  // ------------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
    joint.data = data.jointness || [];
    joint_refresh();
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    document.getElementById("joint-heat").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
