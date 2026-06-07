// app.js — wires the DOM controls in index.html to the D3 chart builders in
// charts.js. The app is data-driven: it loads the precomputed CSVs in data/
// at runtime with d3.csv (relative paths; Hugo serves this app at
// /post/stata_sdid/web_app/). Nothing is recomputed in the browser.
//
// Runs after window.CHARTS and d3 are defined.

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
  // Static numbers from the post (atts.csv mirrors these; we keep a small
  // lookup so readouts work even before the CSV resolves, then overwrite from
  // the CSV once loaded). Values are the SDID-framework / synth2 estimates.
  // ------------------------------------------------------------------
  const ATT = {
    did:  -27.349,  // 2x2 DiD (= DiD TWFE in the sdid framework); -27.3 at 1 dp
    sc:   -19.48,   // synthetic control (synth2); SDID-framework SC = -19.62
    sdid: -15.60,   // SDID
  };
  const METHOD_SUB = {
    did:  "all controls, equal weight",
    sc:   "6 donors, unit weights ω",
    sdid: "donors ω + time weights λ",
  };
  const METHOD_LABEL = {
    did:  "DiD",
    sc:   "Synthetic control",
    sdid: "SDID",
  };

  // Filled in once the CSVs resolve.
  const store = {
    series: null,      // [{year, ca_actual, did_cf, sc_synth, sdid_cf, sc_effect, ...}]
    scOmega: null,     // [{state, weight}]
    sdidOmega: null,   // [{state, weight}]  (California already dropped)
    placebos: null,    // number[]
    pl: { att: -15.60, se: 9.88, ci_lo: -34.97, ci_hi: 3.76, pval: 0.026 },
    ndonors: { sc: 6, sdid: null },
  };

  function fmt1(x) { return (x === null || Number.isNaN(x)) ? "—" : x.toFixed(1); }

  // ------------------------------------------------------------------
  // Chart instances.
  // ------------------------------------------------------------------
  const explorerChart = CHARTS.counterfactual_lines(document.getElementById("explorer-lines"));
  const scWeights     = CHARTS.weight_bars(document.getElementById("sc-weights"),   { color: CHARTS.C.steel, topN: 6 });
  const sdidWeights   = CHARTS.weight_bars(document.getElementById("sdid-weights"), { color: CHARTS.C.teal,  topN: 12 });

  const gapLines  = CHARTS.counterfactual_lines(document.getElementById("gap-lines"));
  const gapEffect = CHARTS.gap_area(document.getElementById("gap-effect"));

  const placeboHist = CHARTS.placebo_histogram(document.getElementById("placebo-hist"));

  // ------------------------------------------------------------------
  // Generic segmented-control wiring. Calls onPick(methodId) on change.
  // ------------------------------------------------------------------
  function wireSegment(containerId, initial, onPick) {
    const seg = document.getElementById(containerId);
    const buttons = Array.from(seg.querySelectorAll("button"));
    function select(methodId) {
      buttons.forEach(b => {
        const on = b.dataset.method === methodId;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      onPick(methodId);
    }
    buttons.forEach(b => b.addEventListener("click", () => select(b.dataset.method)));
    select(initial);
  }

  // ------------------------------------------------------------------
  // TAB 2 — Weighting-scheme explorer.
  // ------------------------------------------------------------------
  function renderExplorer(methodId) {
    if (store.series) explorerChart.update(store.series, methodId);
    document.getElementById("ex-method").textContent = METHOD_LABEL[methodId];
    document.getElementById("ex-method-sub").textContent = METHOD_SUB[methodId];
    document.getElementById("ex-att").textContent = fmt1(ATT[methodId]);
    // Donor-count readout: DiD uses all 38 equally; SC has 6; SDID is diffuse.
    let nd, sub;
    if (methodId === "did") { nd = "38"; sub = "all controls, equal weight"; }
    else if (methodId === "sc") { nd = String(store.ndonors.sc); sub = "sparse — most states get 0"; }
    else { nd = store.ndonors.sdid === null ? "—" : String(store.ndonors.sdid); sub = "diffuse — weight spread widely"; }
    document.getElementById("ex-ndonors").textContent = nd;
    document.getElementById("ex-ndonors-sub").textContent = sub;
  }

  // ------------------------------------------------------------------
  // TAB 3 — Counterfactual & gap.
  // ------------------------------------------------------------------
  function gapSeries(methodId) {
    // SC has a precomputed gap (sc_effect = ca - sc_synth). For DiD and SDID we
    // compute the gap from the level series the same way: ca_actual - cf.
    const key = CHARTS.METHODS[methodId].series; // did_cf | sc_synth | sdid_cf
    return store.series.map(d => {
      const gap = (methodId === "sc" && d.sc_effect !== undefined && !Number.isNaN(d.sc_effect))
        ? d.sc_effect
        : d.ca_actual - d[key];
      return { year: d.year, gap: gap };
    });
  }

  function renderGap(methodId) {
    if (!store.series) return;
    gapLines.update(store.series, methodId);
    const rows = gapSeries(methodId);
    gapEffect.update(rows, ATT[methodId], methodId);
    document.getElementById("gap-method").textContent = METHOD_LABEL[methodId];
    document.getElementById("gap-att").textContent = fmt1(ATT[methodId]);
    const last = rows[rows.length - 1];
    document.getElementById("gap-final").textContent = last ? fmt1(last.gap) : "—";
  }

  // ------------------------------------------------------------------
  // TAB 4 — Placebo inference (static numbers + histogram).
  // ------------------------------------------------------------------
  function renderPlacebo() {
    if (store.placebos) {
      placeboHist.update(store.placebos, store.pl.att, { lo: store.pl.ci_lo, hi: store.pl.ci_hi });
    }
    document.getElementById("pl-att").textContent  = "−" + Math.abs(store.pl.att).toFixed(1);
    document.getElementById("pl-pval").textContent = store.pl.pval.toFixed(3);
    document.getElementById("pl-se").textContent   = store.pl.se.toFixed(2);
    document.getElementById("pl-ci").textContent   =
      `[−${Math.abs(store.pl.ci_lo).toFixed(1)}, ${store.pl.ci_hi.toFixed(1)}]`;
  }

  // ------------------------------------------------------------------
  // Wire the two segmented controls now; charts fill in once data lands.
  // ------------------------------------------------------------------
  wireSegment("explorer-seg", "did", renderExplorer);
  wireSegment("gap-seg", "sc", renderGap);
  renderPlacebo();

  // ------------------------------------------------------------------
  // Load the CSVs. Numbers are parsed with the unary + (handles Stata's
  // leading-dot decimals like ".366" fine: +".366" === 0.366).
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
    d3.csv("data/series.csv", d => ({
      year:       +d.year,
      ca_actual:  +d.ca_actual,
      did_cf:     +d.did_cf,
      sc_synth:   +d.sc_synth,
      sdid_cf:    +d.sdid_cf,
      sc_effect:  d.sc_effect === undefined || d.sc_effect === "" ? NaN : +d.sc_effect,
      lambda:     d.lambda === undefined || d.lambda === "" ? NaN : +d.lambda,
    })),
    d3.csv("data/sc_omega.csv",   d => ({ state: d.state, weight: +d.weight })),
    d3.csv("data/sdid_omega.csv", d => ({ state: d.state, weight: +d.omega })),
    d3.csv("data/placebo.csv",    d => ({ state: d.pstate, ptau: +d.ptau })),
    d3.csv("data/atts.csv"),
  ]).then(([series, scOmega, sdidOmega, placebo, atts]) => {
    store.series = series.filter(d => Number.isFinite(d.year)).sort((a, b) => a.year - b.year);

    // SC donor weights, descending, nonzero.
    store.scOmega = scOmega
      .filter(d => Number.isFinite(d.weight) && d.weight > 0)
      .sort((a, b) => b.weight - a.weight);
    store.ndonors.sc = store.scOmega.length;

    // SDID donor weights: drop the treated unit (California, omega = 1), keep
    // nonzero donors, descending.
    store.sdidOmega = sdidOmega
      .filter(d => d.state.replace(/\s+/g, "").toLowerCase() !== "california")
      .filter(d => Number.isFinite(d.weight) && d.weight > 0)
      .sort((a, b) => b.weight - a.weight);
    store.ndonors.sdid = store.sdidOmega.length;

    store.placebos = placebo.map(d => d.ptau).filter(Number.isFinite);

    // Override the SDID inference readouts from atts.csv if the SDID row is
    // present (keeps the app honest if the CSV is ever regenerated).
    const sdidRow = atts.find(r => (r.method || "").trim().toUpperCase() === "SDID");
    if (sdidRow) {
      const att = +sdidRow.att, se = +sdidRow.se,
            cil = +sdidRow.ci_l, cir = +sdidRow.ci_r, p = +sdidRow.note_pval;
      if (Number.isFinite(att)) { store.pl.att = att; ATT.sdid = att; }
      if (Number.isFinite(se))  store.pl.se = se;
      if (Number.isFinite(cil)) store.pl.ci_lo = cil;
      if (Number.isFinite(cir)) store.pl.ci_hi = cir;
      if (Number.isFinite(p))   store.pl.pval = p;
    }

    // Draw weight bars (these don't depend on the active method).
    scWeights.update(store.scOmega);
    sdidWeights.update(store.sdidOmega);

    // Re-render everything now that data is present, respecting the currently
    // selected method on each tab.
    renderExplorer(document.querySelector("#explorer-seg button.active").dataset.method);
    renderGap(document.querySelector("#gap-seg button.active").dataset.method);
    renderPlacebo();
  }).catch(err => {
    console.error("[stata_sdid app] data load failed:", err);
    showError("explorer-lines", err.message || err);
    showError("gap-lines", err.message || err);
    showError("placebo-hist", err.message || err);
  });

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[stata_sdid app] uncaught error:", e.error);
  });
})();
