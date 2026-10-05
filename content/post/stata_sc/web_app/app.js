// app.js: connects the controls of index.html to the chart builders in
// charts.js and fills every readout from data/results.json. It runs after
// window.CHARTS is defined.

(function () {
  "use strict";

  const DATA_URL = "data/results.json?v=20261005";

  // ------------------------------------------------------------------
  // Tabs: click, arrow keys, and the call-to-action cards of the intro.
  // ------------------------------------------------------------------
  const tabs = Array.from(document.querySelectorAll(".tab-strip [role='tab']"));

  function activateTab(paneId, moveFocus) {
    tabs.forEach(btn => {
      const isActive = btn.dataset.pane === paneId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
      if (isActive && moveFocus) btn.focus();
    });
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === paneId);
    });
    // A hidden pane has no width, so its charts are redrawn once visible.
    renderPane(paneId);
  }

  tabs.forEach((btn, i) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.pane, false));
    btn.addEventListener("keydown", ev => {
      let j = null;
      if (ev.key === "ArrowRight") j = (i + 1) % tabs.length;
      else if (ev.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
      else if (ev.key === "Home") j = 0;
      else if (ev.key === "End") j = tabs.length - 1;
      if (j !== null) {
        ev.preventDefault();
        activateTab(tabs[j].dataset.pane, true);
      }
    });
  });

  document.querySelectorAll(".cta-card[data-goto]").forEach(card => {
    const go = () => {
      activateTab(card.dataset.goto, false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    card.addEventListener("click", go);
    card.addEventListener("keydown", ev => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        go();
      }
    });
  });

  // ------------------------------------------------------------------
  // Formatting helpers.
  // ------------------------------------------------------------------
  const state = { data: null };

  // Fixed decimals with a true minus sign; missing values print as "n/a".
  // CHARTS.num rounds on the decimal digits that the Stata log prints.
  function fmt(x, prec) {
    if (x === null || x === undefined || Number.isNaN(+x)) return "n/a";
    if (prec === undefined) return String(x).replace(/^-/, "−");
    return CHARTS.num(x, prec);
  }

  // Percent difference with an explicit sign, as in the Bias columns of synth2.
  function pct(x) {
    if (x === null || x === undefined || Number.isNaN(+x)) return "n/a";
    return (x > 0 ? "+" : "") + fmt(x, 2) + "%";
  }

  // Shares such as age15to24 need four decimals; other predictors need two.
  function value(x) {
    return fmt(x, Math.abs(x) < 1 ? 4 : 2);
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ------------------------------------------------------------------
  // Tab 1 and Tab 2: donor weights and predictor balance.
  // ------------------------------------------------------------------
  function renderIntroChart() {
    CHARTS.donor_weight_animation(document.getElementById("intro-donor-anim"), state.data.donor_weights);
  }

  function renderDonorChart() {
    CHARTS.donor_weights_bar(document.getElementById("donor-bars"), state.data.donor_weights);
  }

  function renderBalanceTable() {
    const host = document.getElementById("balance-table");
    if (!host) return;
    const rows = state.data.predictor_balance;
    let html = '<table class="balance">';
    html += "<thead><tr>"
         + "<th>Predictor</th>"
         + "<th class='num'>V-weight</th>"
         + "<th class='num'>California</th>"
         + "<th class='num'>Synthetic</th>"
         + "<th class='num'>Donor average</th>"
         + "</tr></thead><tbody>";
    rows.forEach(r => {
      // Highlight the donor average when it misses California by over 20%.
      const outlier = Math.abs(r.bias_sample_pct) > 20;
      html += `<tr${outlier ? " class='outlier'" : ""}>`
            + `<td><code>${r.predictor}</code></td>`
            + `<td class='num'>${fmt(r.v_weight, 4)}</td>`
            + `<td class='num'>${value(r.treated)}</td>`
            + `<td class='num'>${value(r.synthetic)} <span class='pct'>(${pct(r.bias_synthetic_pct)})</span></td>`
            + `<td class='num'>${value(r.sample_mean)} <span class='pct'>(${pct(r.bias_sample_pct)})</span></td>`
            + "</tr>";
    });
    html += "</tbody></table>";
    host.innerHTML = html;
  }

  // ------------------------------------------------------------------
  // Tab 3: paths chart, view toggle, and readouts.
  // ------------------------------------------------------------------
  const gapChart = CHARTS.paths_chart(document.getElementById("gap-chart"));

  function renderGap() {
    if (!state.data) return;
    const view = (document.querySelector("input[name='gap-view']:checked") || {}).value || "paths";
    const opts = { treatmentYear: state.data.headline.treatment_year };
    if (view === "paths")               { opts.showActual = true;  opts.showSynthetic = true;  opts.showGap = false; }
    else if (view === "actual-only")    { opts.showActual = true;  opts.showSynthetic = false; opts.showGap = false; }
    else if (view === "synthetic-only") { opts.showActual = false; opts.showSynthetic = true;  opts.showGap = false; }
    else if (view === "gap")            { opts.showActual = false; opts.showSynthetic = false; opts.showGap = true; }
    gapChart.update(state.data.gap_series, opts);
  }
  document.querySelectorAll("input[name='gap-view']").forEach(el => {
    el.addEventListener("change", renderGap);
  });

  function renderGapStats() {
    const h = state.data.headline;
    setText("stat-att-avg", fmt(h.att_avg, 2));
    setText("stat-peak-year", String(h.att_peak_year));
    setText("stat-att-peak", fmt(h.att_peak_value, 2));
    setText("stat-att-end", fmt(h.gap_2000, 2));
    setText("stat-end-pct", `${fmt(Math.abs(h.pct_gap_2000), 1)}% below the synthetic path`);
    setText("stat-prefit", fmt(h.rmse_pre, 3));
    setText("stat-r2", `R² ${fmt(h.r2_pre, 3)} (synth2 definition)`);
  }

  // ------------------------------------------------------------------
  // Tab 4: placebo chart, filter toggle, and readouts.
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

  function renderPlaceboStats() {
    const h = state.data.headline;
    setText("stat-ratio", fmt(h.ratio, 1));
    setText("stat-ratio-sub", `pre ${fmt(h.pre_mspe, 2)}, post ${fmt(h.post_mspe, 2)} (placebo refit)`);
    setText("stat-rank-trim", `${h.rank_trimmed} of ${h.rank_trimmed_n}`);
    setText("stat-p-trim", `p = ${fmt(h.p_trimmed, 3)}`);
    setText("stat-rank-full", `${h.rank_full} of ${h.rank_full_n}`);
    setText("stat-p-full", `p = ${fmt(h.p_full, 3)}`);
    setText("stat-runner-label", `Runner-up ratio (${h.runner_up.region})`);
    setText("stat-runner", fmt(h.runner_up.ratio, 1));
    setText("stat-runner-sub", `California exceeds it by ${fmt(h.ratio - h.runner_up.ratio, 1)}`);
  }

  // ------------------------------------------------------------------
  // Chart redraws by pane, on display and after a change in width.
  // ------------------------------------------------------------------
  function renderPane(paneId) {
    if (!state.data) return;
    if (paneId === "pane-intro") renderIntroChart();
    else if (paneId === "pane-donors") renderDonorChart();
    else if (paneId === "pane-gap") renderGap();
    else if (paneId === "pane-placebo") renderPlacebo();
  }

  let lastWidth = window.innerWidth;
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      const active = document.querySelector(".tab-pane.active");
      if (active) renderPane(active.id);
    }, 150);
  });

  // ------------------------------------------------------------------
  // Load the data and draw everything.
  // ------------------------------------------------------------------
  fetch(DATA_URL).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }).then(data => {
    state.data = data;
    renderBalanceTable();
    renderGapStats();
    renderPlaceboStats();
    ["pane-intro", "pane-donors", "pane-gap", "pane-placebo"].forEach(renderPane);
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    ["intro-donor-anim", "donor-bars", "gap-chart", "placebo-chart"].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML =
          `<div class="load-error">The file data/results.json could not be loaded (${err.message}).</div>`;
      }
    });
  });

  window.addEventListener("error", function (e) {
    console.error("[stata_sc web app] uncaught error:", e.error);
  });
})();
