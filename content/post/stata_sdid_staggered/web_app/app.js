// app.js — wires the DOM controls in index.html to the D3 chart builders in
// charts.js. Data-driven: loads the precomputed CSVs in data/ at runtime with
// d3.csv (relative paths; Hugo serves this app at
// /post/stata_sdid_staggered/web_app/). Nothing is recomputed in the browser.

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Tab switching (keyboard-accessible).
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
    const go = () => activateTab(card.dataset.goto);
    card.addEventListener("click", go);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
    });
  });

  // ------------------------------------------------------------------
  // Store, filled in once the CSVs resolve.
  // ------------------------------------------------------------------
  const store = {
    cohorts: null,     // [{cohort, tau, se, lci, uci, n_treated, t_post, agg_weight}]
    series: null,      // [{cohort, year, y_treated, y_synth}]
    lambda: null,      // [{cohort, year, lambda}]
    omega: null,       // [{cohort, country, omega}]
    event: null,       // [{event_time, coef, se, ci_l, ci_u, period_type}]
    aggAtt: 8.03,
  };

  function fmt1(x) { return (x === null || x === undefined || Number.isNaN(x)) ? "—" : (x >= 0 ? "+" : "") + x.toFixed(1); }
  function fmt2(x) { return (x === null || x === undefined || Number.isNaN(x)) ? "—" : x.toFixed(2); }

  // ------------------------------------------------------------------
  // Chart instances.
  // ------------------------------------------------------------------
  const cohortBars = CHARTS.cohort_bars(document.getElementById("cohort-bars"), onCohortHover);
  const timeline   = CHARTS.adoption_timeline(document.getElementById("adoption-timeline"));
  const cfPath     = CHARTS.cf_path(document.getElementById("cf-path"));
  const omegaBars  = CHARTS.weight_bars(document.getElementById("omega-bars"), { color: CHARTS.C.steel, topN: 12 });
  const eventChart = CHARTS.event_study(document.getElementById("event-study"));

  // ------------------------------------------------------------------
  // TAB 2 — Cohort effects: hover readout.
  // ------------------------------------------------------------------
  function onCohortHover(d) {
    document.getElementById("co-year").textContent = d.cohort;
    document.getElementById("co-n").textContent = d.n_treated === 1 ? "1 country" : d.n_treated + " countries";
    document.getElementById("co-tau").textContent = fmt1(d.tau);
    document.getElementById("co-tau").className = "stat-value " + (d.tau >= 0 ? "teal" : "orange");
    document.getElementById("co-se").textContent = "SE " + fmt2(d.se);
    document.getElementById("co-tpost").textContent = d.t_post;
    document.getElementById("co-w").textContent = (d.agg_weight * 100).toFixed(1) + "%";
  }

  // ------------------------------------------------------------------
  // TAB 3 — Weights & counterfactual: cohort segmented control.
  // ------------------------------------------------------------------
  function anchoredSeries(cohort) {
    const ser = store.series.filter(d => d.cohort === cohort).sort((a, b) => a.year - b.year);
    const lamByYear = {};
    store.lambda.filter(d => d.cohort === cohort).forEach(d => { lamByYear[d.year] = d.lambda; });
    // anchor: offset = sum_t lambda_t (y_synth - y_treated) over pre-adoption years
    let offset = 0;
    ser.forEach(d => {
      if (d.year < cohort && lamByYear[d.year] != null) {
        offset += lamByYear[d.year] * (d.y_synth - d.y_treated);
      }
    });
    return ser.map(d => ({ year: d.year, y_treated: d.y_treated, y_synth_anch: d.y_synth - offset }));
  }

  function renderWeights(cohort) {
    if (!store.series) return;
    const rows = anchoredSeries(cohort);
    cfPath.update(rows, cohort);
    const donors = store.omega
      .filter(d => d.cohort === cohort && d.omega > 0)
      .sort((a, b) => b.omega - a.omega)
      .map(d => ({ country: d.country.replace(/_/g, " "), weight: d.omega }));
    omegaBars.update(donors);

    const co = store.cohorts.find(d => d.cohort === cohort) || {};
    document.getElementById("w-year").textContent = cohort;
    document.getElementById("w-n").textContent = co.n_treated === 1 ? "1 country" : (co.n_treated || "—") + " countries";
    document.getElementById("w-tau").textContent = fmt1(co.tau);
    document.getElementById("w-tau").className = "stat-value " + ((co.tau || 0) >= 0 ? "teal" : "orange");
    document.getElementById("w-ndonors").textContent = donors.length;
  }

  function wireCohortSeg() {
    const seg = document.getElementById("cohort-seg");
    const buttons = Array.from(seg.querySelectorAll("button"));
    function select(cohort) {
      buttons.forEach(b => {
        const on = +b.dataset.cohort === cohort;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      renderWeights(cohort);
    }
    buttons.forEach(b => b.addEventListener("click", () => select(+b.dataset.cohort)));
    select(2002); // default to the 2002 cohort (the worked example)
  }

  // ------------------------------------------------------------------
  // TAB 4 — Event study readouts.
  // ------------------------------------------------------------------
  function renderEvent() {
    if (!store.event) return;
    eventChart.update(store.event);
    const pre = store.event.filter(d => d.period_type === "pre");
    const post = store.event.filter(d => d.period_type === "post");
    const preMax = pre.length ? d3.max(pre, d => Math.abs(d.coef)) : NaN;
    const t0 = (store.event.find(d => d.event_time === 0) || {}).coef;
    const postAvg = post.length ? d3.mean(post, d => d.coef) : NaN;
    document.getElementById("ev-pre").textContent = Number.isFinite(preMax) ? preMax.toFixed(2) : "—";
    document.getElementById("ev-t0").textContent = fmt1(t0);
    document.getElementById("ev-post").textContent = fmt1(postAvg);
  }

  // ------------------------------------------------------------------
  // Load the CSVs. Numbers parsed with unary + (handles Stata's leading-dot
  // decimals like ".366" fine: +".366" === 0.366).
  // ------------------------------------------------------------------
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML =
        '<div style="padding:20px;color:#d97757;font-size:13px;">Could not load data (' +
        String(msg).replace(/</g, "&lt;") + '). Open this app through the site (Hugo / Netlify), not the raw file system.</div>';
    }
  }

  Promise.all([
    d3.csv("data/cohorts.csv", d => ({
      cohort: +d.cohort, tau: +d.tau, se: +d.se, lci: +d.lci, uci: +d.uci,
      n_treated: +d.n_treated, t_post: +d.t_post, agg_weight: +d.agg_weight,
    })),
    d3.csv("data/series_by_cohort.csv", d => ({
      cohort: +d.cohort, year: +d.year, y_treated: +d.y_treated, y_synth: +d.y_synth,
    })),
    d3.csv("data/lambda_by_cohort.csv", d => ({
      cohort: +d.cohort, year: +d.year, lambda: +d.lambda,
    })),
    d3.csv("data/omega_by_cohort.csv", d => ({
      cohort: +d.cohort, country: d.country, omega: +d.omega,
    })),
    d3.csv("data/event_study.csv", d => ({
      event_time: +d.event_time, coef: +d.coef, se: +d.se,
      ci_l: +d.ci_l, ci_u: +d.ci_u, period_type: (d.period_type || "").trim(),
    })),
    d3.csv("data/atts.csv"),
  ]).then(([cohorts, series, lambda, omega, event, atts]) => {
    store.cohorts = cohorts.filter(d => Number.isFinite(d.cohort)).sort((a, b) => a.cohort - b.cohort);
    store.series = series.filter(d => Number.isFinite(d.year));
    store.lambda = lambda.filter(d => Number.isFinite(d.year));
    store.omega = omega.filter(d => Number.isFinite(d.omega));
    store.event = event.filter(d => Number.isFinite(d.event_time)).sort((a, b) => a.event_time - b.event_time);

    // aggregate ATT from atts.csv (SDID no-covariates row), else weighted mean.
    const sdidRow = atts.find(r => (r.spec || "").toLowerCase().includes("no covariates"));
    if (sdidRow && Number.isFinite(+sdidRow.att)) store.aggAtt = +sdidRow.att;

    // Tab 2
    cohortBars.update(store.cohorts, store.aggAtt);
    timeline.update(store.cohorts);
    // seed the cohort readout with the 2002 cohort
    const seed = store.cohorts.find(d => d.cohort === 2002) || store.cohorts[0];
    if (seed) onCohortHover(seed);

    // Tab 3
    wireCohortSeg();

    // Tab 4
    renderEvent();
  }).catch(err => {
    console.error("[stata_sdid_staggered app] data load failed:", err);
    showError("cohort-bars", err.message || err);
    showError("cf-path", err.message || err);
    showError("event-study", err.message || err);
  });

  window.addEventListener("error", function (e) {
    console.error("[stata_sdid_staggered app] uncaught error:", e.error);
  });
})();
