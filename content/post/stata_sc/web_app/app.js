// app.js — wires index.html DOM controls to CHARTS for the SC stata_sc web app.
// Runs after window.CHARTS is defined.

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
  // Tab 1: Donor-weights bar animation (California 5-state recipe).
  // ------------------------------------------------------------------
  CHARTS.donor_weight_animation(document.getElementById("intro-donor-anim"));

  // ------------------------------------------------------------------
  // Load results.json and bind tabs 2–4 once data is available.
  // ------------------------------------------------------------------
  const state = { data: null };

  function fmt(x, prec) {
    if (x === null || x === undefined || Number.isNaN(x)) return "—";
    return prec === undefined ? String(x) : (+x).toFixed(prec);
  }

  function renderDonorBars() {
    if (!state.data) return;
    CHARTS.donor_weights_bar(
      document.getElementById("donor-bars"),
      state.data.donor_weights
    );
  }

  function renderBalanceTable() {
    if (!state.data) return;
    const host = document.getElementById("balance-table");
    if (!host) return;
    const rows = state.data.predictor_balance;
    let html = '<table class="balance">';
    html += "<thead><tr>"
         + "<th>Predictor</th>"
         + "<th style='text-align:right;'>Treated California</th>"
         + "<th style='text-align:right;'>Synthetic California</th>"
         + "<th style='text-align:right;'>Donor pool mean</th>"
         + "</tr></thead><tbody>";
    rows.forEach(r => {
      const treated = (+r.treated).toFixed(2);
      const synthetic = (+r.synthetic).toFixed(2);
      const sample = (+r.sample_mean).toFixed(2);
      // Highlight when sample mean is far from treated (predictor where
      // California is a clear outlier vs the donor pool).
      const outlier = Math.abs(r.treated - r.sample_mean)
                      > 0.2 * Math.abs(r.treated || 1);
      html += `<tr${outlier ? " class='outlier'" : ""}>`
            + `<td><code>${r.predictor}</code></td>`
            + `<td style='text-align:right;'>${treated}</td>`
            + `<td style='text-align:right;'>${synthetic}</td>`
            + `<td style='text-align:right;color:var(--muted,#8b9dc3);'>${sample}</td>`
            + "</tr>";
    });
    html += "</tbody></table>";
    host.innerHTML = html;
  }

  // ------------------------------------------------------------------
  // Tab 3: The Gap (paths chart + view toggle).
  // ------------------------------------------------------------------
  const gapChart = CHARTS.paths_chart(document.getElementById("gap-chart"));
  function renderGap() {
    if (!state.data) return;
    const view = (document.querySelector("input[name='gap-view']:checked") || {}).value || "paths";
    const opts = { treatmentYear: state.data.headline.treatment_year };
    if (view === "paths")          { opts.showActual = true;  opts.showSynthetic = true;  opts.showGap = false; }
    else if (view === "actual-only")    { opts.showActual = true;  opts.showSynthetic = false; opts.showGap = false; }
    else if (view === "synthetic-only") { opts.showActual = false; opts.showSynthetic = true;  opts.showGap = false; }
    else if (view === "gap")            { opts.showActual = false; opts.showSynthetic = false; opts.showGap = true; }
    gapChart.update(state.data.gap_series, opts);
  }
  document.querySelectorAll("input[name='gap-view']").forEach(el => {
    el.addEventListener("change", renderGap);
  });

  // Populate headline stats
  function renderGapStats() {
    if (!state.data) return;
    const h = state.data.headline;
    document.getElementById("stat-att-avg").textContent  = fmt(h.att_avg, 2);
    document.getElementById("stat-att-peak").textContent = fmt(h.att_peak_value, 2);
    document.getElementById("stat-att-end").textContent  = fmt(
      state.data.gap_series[state.data.gap_series.length - 1].gap, 2
    );
    document.getElementById("stat-prefit").textContent   = fmt(h.rmse_pre, 2);
  }

  // ------------------------------------------------------------------
  // Tab 4: Placebo chart + filter toggle.
  // ------------------------------------------------------------------
  const placeboChart = CHARTS.placebo_chart(document.getElementById("placebo-chart"));
  function renderPlacebo() {
    if (!state.data) return;
    const view = (document.querySelector("input[name='placebo-view']:checked") || {}).value || "trimmed";
    placeboChart.update(state.data.placebos, { trimmedOnly: view === "trimmed" });
  }
  document.querySelectorAll("input[name='placebo-view']").forEach(el => {
    el.addEventListener("change", renderPlacebo);
  });

  // ------------------------------------------------------------------
  // Load data and bind.
  // ------------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    state.data = data;
    renderDonorBars();
    renderBalanceTable();
    renderGapStats();
    renderGap();
    renderPlacebo();
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    ["donor-bars", "gap-chart", "placebo-chart"].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML =
          `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err.message}</div>`;
      }
    });
  });

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
