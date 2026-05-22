// app.js — wires the SCPI interactive web app's DOM controls to the
// chart builders in charts.js. Runs after window.CHARTS is defined.

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

  // ---- Generic debounce ------------------------------------------------------
  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ---- Shared state ----------------------------------------------------------
  const state = {
    data: null,
    donorAnimMounted: false,
  };

  // ---- Tab 2: trajectory + PI -----------------------------------------------
  const trajectoryChart = CHARTS.scpi_trajectory(document.getElementById("dn-trajectory"));
  let dnMult = 1.0;
  function renderTrajectory() {
    if (!state.data) return;
    trajectoryChart.update({ trajectory: state.data.trajectory, piMult: dnMult });
    // Stats: number of years where actual is outside the PI band (using mult).
    let outside = 0, widthSum = 0;
    state.data.trajectory.forEach(d => {
      const half = (d.pi_hi - d.pi_lo) / 2 * dnMult;
      const lo = d.synthetic - half;
      const hi = d.synthetic + half;
      if (d.actual < lo || d.actual > hi) outside++;
      widthSum += 2 * half;
    });
    const avgWidth = widthSum / state.data.trajectory.length;
    document.getElementById("dn-stat-outside").textContent = `${outside} / 13`;
    document.getElementById("dn-stat-width").textContent = (avgWidth / 2).toFixed(2);
  }
  document.getElementById("dn-mult").addEventListener("input", e => {
    dnMult = +e.target.value;
    document.getElementById("dn-mult-val").textContent = dnMult.toFixed(2);
    renderTrajectory();
  });

  // ---- Tab 3: gap simulator --------------------------------------------------
  const gapChart = CHARTS.scpi_gap(document.getElementById("sm-gap"));
  let smMult = 1.0;
  function renderGap() {
    if (!state.data) return;
    gapChart.update({ trajectory: state.data.trajectory, piMult: smMult });
    let outside = 0;
    let maxGap = 0, maxYear = null;
    state.data.trajectory.forEach(d => {
      const half = (d.pi_hi - d.pi_lo) / 2 * smMult;
      const gap = d.actual - d.synthetic;
      if (gap < -half || gap > half) outside++;
      if (Math.abs(gap) > Math.abs(maxGap)) { maxGap = gap; maxYear = d.year; }
    });
    document.getElementById("sm-stat-outside").textContent = `${outside} / 13`;
    document.getElementById("sm-stat-maxgap").textContent =
      maxYear === null ? "—" : `${maxGap.toFixed(2)}  (${maxYear})`;
  }
  document.getElementById("sm-mult").addEventListener("input", e => {
    smMult = +e.target.value;
    document.getElementById("sm-mult-val").textContent = smMult.toFixed(2);
    renderGap();
  });

  // ---- Tab 4: method forest --------------------------------------------------
  const forestChart = CHARTS.scpi_forest_plot(document.getElementById("mf-forest"));
  const methodBars  = CHARTS.scpi_method_bars(document.getElementById("mf-bars"));
  function renderForest() {
    if (!state.data) return;
    const outcomes = Array.from(document.querySelectorAll("#mf-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#mf-methods input:checked")).map(el => el.value);
    forestChart.update(state.data.estimates, methods, outcomes);
    methodBars.update(state.data.method_comparison);
  }
  document.querySelectorAll("#mf-outcomes input, #mf-methods input").forEach(el => {
    el.addEventListener("change", renderForest);
  });

  // ---- Data loader -----------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    state.data = data;
    // Tab 1: donor pool animation, mount once data is available.
    if (!state.donorAnimMounted) {
      CHARTS.donor_pool_animation(document.getElementById("intro-donor-anim"), data.donor_weights);
      state.donorAnimMounted = true;
    }
    renderTrajectory();
    renderGap();
    renderForest();
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    const msg = `<div style="padding:20px;color:#d97757;">Failed to load data/results.json: ${err}</div>`;
    document.getElementById("intro-donor-anim").innerHTML = msg;
    document.getElementById("dn-trajectory").innerHTML = msg;
    document.getElementById("sm-gap").innerHTML = msg;
    document.getElementById("mf-forest").innerHTML = msg;
  });

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[python_scpi] uncaught error:", e.error);
  });
})();
