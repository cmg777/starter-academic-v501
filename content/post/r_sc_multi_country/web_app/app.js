// app.js — wires index.html controls to CHARTS for the augmented synthetic
// control lab. All data is precomputed in data/results.json by analysis.R.

(function () {
  "use strict";

  // ---- Tab switching --------------------------------------------------------
  function activateTab(paneId) {
    document.querySelectorAll(".tab-strip button").forEach(btn => {
      const on = btn.dataset.pane === paneId;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.toggle("active", p.id === paneId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll(".tab-strip button").forEach(b =>
    b.addEventListener("click", () => activateTab(b.dataset.pane)));
  document.querySelectorAll(".cta-card[data-goto]").forEach(c =>
    c.addEventListener("click", () => activateTab(c.dataset.goto)));

  // ---- helpers --------------------------------------------------------------
  const P = CHARTS.palette;
  const f = (x, p) => (x === null || x === undefined || Number.isNaN(+x)) ? "—" : (+x).toFixed(p);
  const sgn = x => (x >= 0 ? "+" : "") + (+x).toFixed(2);
  const zipXY = (xs, ys) => xs.map((x, i) => ({ x: +x, y: +ys[i] }));
  const zipBand = (xs, lo, hi) => xs
    .map((x, i) => ({ x: +x, lo: +lo[i], hi: +hi[i] }))
    .filter(p => Number.isFinite(p.lo) && Number.isFinite(p.hi));

  // ---- chart instances ------------------------------------------------------
  const heroChart   = CHARTS.lineChart(document.getElementById("intro-chart"));
  const singleChart = CHARTS.lineChart(document.getElementById("single-chart"));
  const recovChart  = CHARTS.groupedBars(document.getElementById("recovery-chart"));
  const multiChart  = CHARTS.lineChart(document.getElementById("multi-chart"));
  const emuScatter  = CHARTS.scatter(document.getElementById("emu-scatter"));

  const state = { data: null };

  // ---- Tab 1: intro ---------------------------------------------------------
  function renderIntro() {
    const d = state.data;
    document.getElementById("hero-recovery").textContent =
      `${f(d.suitability.mean_err_plain, 2)} → ${f(d.suitability.mean_err_ridge, 2)}`;
    const c05 = d.suitability.recovery.find(r => r.unit === "C05");
    document.getElementById("hero-c05").textContent = `${sgn(c05.att_plain)} → ${sgn(c05.att_ridge)}`;
    document.getElementById("hero-spearman").textContent = f(d.emu.comparison.spearman, 2);

    const g = d.single.gap;
    heroChart.update({
      series: [
        { label: "Estimated effect", color: P.steel, width: 2.5, points: zipXY(g.time, g.est) },
        { label: "True effect", color: P.text, dash: "5 4", width: 2, points: zipXY(g.time, g.true) },
      ],
      band: { points: zipBand(g.time, g.lo, g.hi) },
      hline: 0, vline: d.single.adopt, vlabel: "adoption",
      xlab: "Year", ylab: "Effect on outcome",
    });
  }

  // ---- Tab 2: single & suitability -----------------------------------------
  function renderSingle() {
    const d = state.data;
    const unit = (document.querySelector("input[name='unit']:checked") || {}).value || "C01";
    let series, adopt, truth, plain, ridge, l2p, l2r, note;
    if (unit === "C01") {
      const s = d.single.series;
      series = s; adopt = d.single.adopt; truth = d.single.true_att;
      plain = d.single.att_plain; ridge = d.single.att_ridge;
      l2p = d.single.scaled_l2_plain; l2r = d.single.scaled_l2_ridge;
      note = "C01 sits inside the donor hull, so plain SCM fits well and Ridge-ASCM agrees — augmentation is all but switched off.";
    } else {
      const r = d.suitability.recovery.find(x => x.unit === "C05");
      series = d.suitability.c05_series; adopt = r.adopt; truth = r.true_att;
      plain = r.att_plain; ridge = r.att_ridge;
      l2p = d.suitability.c05_prefit_plain; l2r = d.suitability.c05_prefit_ridge;
      note = "C05 is outside the donor hull. Plain SCM leaves a visible pre-treatment gap and even gets the sign wrong; Ridge-ASCM closes the gap and recovers the true negative effect.";
    }
    document.getElementById("s-true").textContent  = sgn(truth);
    document.getElementById("s-plain").textContent = sgn(plain);
    document.getElementById("s-ridge").textContent = sgn(ridge);
    document.getElementById("s-prefit").textContent = `${f(l2p, 2)} → ${f(l2r, 2)}`;
    document.getElementById("s-title").textContent = `Actual vs synthetic control — ${unit}`;
    document.getElementById("s-note").textContent = note;

    singleChart.update({
      series: [
        { label: `Actual ${unit}`, color: P.orange, width: 2.5, points: zipXY(series.time, series.actual) },
        { label: "Synthetic (plain SCM)", color: P.steel, width: 2, points: zipXY(series.time, series.syn_plain) },
        { label: "Synthetic (Ridge-ASCM)", color: P.teal, dash: "5 4", width: 2, points: zipXY(series.time, series.syn_ridge) },
      ],
      vline: adopt, vlabel: "adoption",
      xlab: "Year", ylab: "Outcome (gdp_index)",
    });

    recovChart.update({
      items: d.suitability.recovery.map(r => ({ label: r.unit, a: r.err_plain, b: r.err_ridge })),
      aLabel: "plain SCM", bLabel: "Ridge-ASCM", xlab: "|estimate − truth|",
    });
  }
  document.querySelectorAll("input[name='unit']").forEach(el =>
    el.addEventListener("change", renderSingle));

  // ---- Tab 3: many units ----------------------------------------------------
  function renderMulti() {
    const d = state.data;
    const src = (document.querySelector("input[name='msrc']:checked") || {}).value || "sim";
    const tableCard = document.getElementById("m-table-card");
    if (src === "sim") {
      const pp = d.multi.pooled_path;
      const avgIdx = d.multi.overall.level.indexOf("Average");
      document.getElementById("m-est").textContent = f(d.multi.overall.estimate[avgIdx], 3);
      document.getElementById("m-truth").textContent = f(d.multi.overall.truth[avgIdx], 3);
      document.getElementById("m-truth-lab").textContent = "true pooled effect";
      document.getElementById("m-l2").textContent = f(d.multi.scaled_global_l2, 3);
      document.getElementById("m-title").textContent = "Pooled effect path — simulated (vs known truth)";
      document.getElementById("m-note").textContent =
        "Flat before adoption, rising to meet the true pooled effect (white dashed) after. The pooled estimate recovers the truth within a few percent.";
      multiChart.update({
        series: [
          { label: "Pooled estimate", color: P.steel, width: 2.5, points: zipXY(pp.time, pp.est) },
          { label: "True pooled", color: P.text, dash: "5 4", width: 2, points: zipXY(pp.time, pp.true) },
        ],
        band: { points: zipBand(pp.time, pp.lo, pp.hi) },
        hline: 0, vline: 0, vlabel: "adoption",
        xlab: "Years since adoption", ylab: "Average effect",
      });
      tableCard.style.display = "";
      renderMultiTable();
    } else {
      const pp = d.emu.pooled_path;
      document.getElementById("m-est").textContent = f(d.emu.pooled_att, 3);
      document.getElementById("m-truth").textContent =
        `[${f(d.emu.pooled_ci[0], 2)}, ${f(d.emu.pooled_ci[1], 2)}]`;
      document.getElementById("m-truth-lab").textContent = "95% bootstrap CI";
      document.getElementById("m-l2").textContent = "block design";
      document.getElementById("m-title").textContent = "Pooled euro-area effect on TFP";
      document.getElementById("m-note").textContent =
        "The single average (≈0) hides the dynamics: a positive bump in the early euro years, eroded by the 2008–2014 crisis, recovering by 2017 — the paper's arc.";
      multiChart.update({
        series: [
          { label: "Pooled EMU effect", color: P.steel, width: 2.5, points: zipXY(pp.time, pp.est) },
        ],
        band: { points: zipBand(pp.time, pp.lo, pp.hi) },
        hline: 0, vline: 0, vlabel: "1999",
        xlab: "Years since 1999", ylab: "Average effect on TFP",
      });
      tableCard.style.display = "none";
    }
  }
  function renderMultiTable() {
    const o = state.data.multi.overall;
    let html = "<table class='balance'><thead><tr><th>Unit</th>"
      + "<th style='text-align:right;'>Estimate</th><th style='text-align:right;'>95% CI</th>"
      + "<th style='text-align:right;'>Truth</th></tr></thead><tbody>";
    o.level.forEach((lv, i) => {
      const cls = lv === "Average" ? " class='outlier'" : "";
      html += `<tr${cls}><td><code>${lv}</code></td>`
        + `<td style='text-align:right;'>${f(o.estimate[i], 3)}</td>`
        + `<td style='text-align:right;color:var(--muted,#8b9dc3);'>[${f(o.ci_lo[i], 2)}, ${f(o.ci_hi[i], 2)}]</td>`
        + `<td style='text-align:right;'>${f(o.truth[i], 3)}</td></tr>`;
    });
    html += "</tbody></table>";
    document.getElementById("multi-table").innerHTML = html;
  }
  document.querySelectorAll("input[name='msrc']").forEach(el =>
    el.addEventListener("change", renderMulti));

  // ---- Tab 4: replication ---------------------------------------------------
  function renderEmu() {
    const d = state.data, c = d.emu.comparison;
    document.getElementById("e-spearman").textContent = f(c.spearman, 2);
    document.getElementById("e-pearson").textContent = f(c.pearson, 2);
    document.getElementById("e-germany").textContent = `+${f(d.emu.germany.pct_2008_17, 1)}%`;

    emuScatter.update({
      points: c.country.map((cn, i) => ({ label: cn, x: +c.paper_2000_07[i], y: +c.ascm_2000_07[i] })),
      xlab: "Paper's reported % contribution (2000–07)",
      ylab: "ASCM % effect (this tutorial)",
    });

    let html = "<table class='balance'><thead><tr><th>Country</th>"
      + "<th style='text-align:right;'>ASCM 2000–07</th><th style='text-align:right;'>Paper 2000–07</th>"
      + "<th style='text-align:right;'>ASCM 2008–17</th><th style='text-align:right;'>Paper 2008–17</th>"
      + "</tr></thead><tbody>";
    d.emu.per_country.forEach(r => {
      const neg = r.pct_2008_17 < 0 ? " class='outlier'" : "";
      html += `<tr${neg}><td>${r.country}</td>`
        + `<td style='text-align:right;'>${f(r.pct_2000_07, 1)}%</td>`
        + `<td style='text-align:right;color:var(--muted,#8b9dc3);'>${f(r.paper_2000_07, 1)}%</td>`
        + `<td style='text-align:right;'>${f(r.pct_2008_17, 1)}%</td>`
        + `<td style='text-align:right;color:var(--muted,#8b9dc3);'>${f(r.paper_2008_17, 1)}%</td></tr>`;
    });
    html += "</tbody></table>";
    document.getElementById("emu-table").innerHTML = html;
  }

  // ---- load data ------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    state.data = data;
    renderIntro();
    renderSingle();
    renderMulti();
    renderEmu();
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    ["intro-chart", "single-chart", "multi-chart", "emu-scatter"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err.message}</div>`;
    });
  });

  window.addEventListener("error", e => console.error("[app] uncaught:", e.error));
})();
