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
  const ci2 = (lo, hi) => `[${f(lo, 2)}, ${f(hi, 2)}]`;
  const badge = (sig, yes, no) => `<span class="sig-badge ${sig ? "yes" : "no"}">${sig ? (yes || "significant") : (no || "not significant")}</span>`;
  const zipXY = (xs, ys) => xs.map((x, i) => ({ x: +x, y: +ys[i] }));
  const zipBand = (xs, lo, hi) => xs
    .map((x, i) => ({ x: +x, lo: +lo[i], hi: +hi[i] }))
    .filter(p => Number.isFinite(p.lo) && Number.isFinite(p.hi));

  // ---- chart instances ------------------------------------------------------
  const heroChart   = CHARTS.lineChart(document.getElementById("intro-chart"));
  const singleChart = CHARTS.lineChart(document.getElementById("single-chart"));
  const recovChart  = CHARTS.groupedBars(document.getElementById("recovery-chart"));
  const multiChart  = CHARTS.lineChart(document.getElementById("multi-chart"));
  const multiForest = CHARTS.forest(document.getElementById("multi-forest"));
  const emuScatter  = CHARTS.scatter(document.getElementById("emu-scatter"));
  const simChart    = CHARTS.lineChart(document.getElementById("sim-chart"));

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
    let series, adopt, truth, plain, ridge, l2p, l2r, note, sig, ci;
    if (unit === "C01") {
      const s = d.single.series;
      series = s; adopt = d.single.adopt; truth = d.single.true_att;
      plain = d.single.att_plain; ridge = d.single.att_ridge;
      l2p = d.single.scaled_l2_plain; l2r = d.single.scaled_l2_ridge;
      sig = d.single.sig_plain; ci = d.single.ci_plain;
      note = "C01 sits inside the donor hull, so plain SCM fits well and Ridge-ASCM agrees — augmentation is all but switched off.";
    } else {
      const r = d.suitability.recovery.find(x => x.unit === "C05");
      series = d.suitability.c05_series; adopt = r.adopt; truth = r.true_att;
      plain = r.att_plain; ridge = r.att_ridge;
      l2p = d.suitability.c05_prefit_plain; l2r = d.suitability.c05_prefit_ridge;
      sig = r.sig_plain; ci = [r.ci_lo, r.ci_hi];
      note = "C05 is outside the donor hull. Plain SCM leaves a visible pre-treatment gap and even gets the sign wrong; Ridge-ASCM closes the gap and recovers the true negative effect.";
    }
    document.getElementById("s-true").textContent  = sgn(truth);
    document.getElementById("s-plain").textContent = sgn(plain);
    document.getElementById("s-ridge").textContent = sgn(ridge);
    document.getElementById("s-prefit").textContent = `${f(l2p, 2)} → ${f(l2r, 2)}`;
    document.getElementById("s-title").textContent = `Actual vs synthetic control — ${unit}`;
    document.getElementById("s-note").textContent = note;
    const sb = document.getElementById("s-sig");
    sb.className = "sig-badge " + (sig ? "yes" : "no");
    sb.textContent = sig ? "plain SCM: significant" : "plain SCM: not significant";
    document.getElementById("s-ci").textContent =
      `plain SCM estimate ${sgn(plain)}, jackknife+ 95% CI ${ci2(ci[0], ci[1])}` +
      (sig ? " — excludes zero." : " — includes zero.");

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
    const forestCard = document.getElementById("m-forest-card");
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
      // forest of per-unit + pooled effects with jackknife CIs
      const o = d.multi.overall;
      forestCard.style.display = "";
      multiForest.update({
        items: o.level.map((lv, i) => ({
          label: lv === "Average" ? "Pooled" : lv,
          est: o.estimate[i], lo: o.ci_lo[i], hi: o.ci_hi[i],
          truth: o.truth[i], sig: o.sig_jack[i],
        })),
        ref: 0, xlab: "Effect on gdp_index (jackknife 95% CI; orange tick = truth)",
      });
      tableCard.style.display = "";
      renderMultiTable();
    } else {
      const pp = d.emu.pooled_path;
      document.getElementById("m-est").textContent = f(d.emu.pooled_att, 3);
      document.getElementById("m-truth").textContent = ci2(d.emu.pooled_ci[0], d.emu.pooled_ci[1]);
      document.getElementById("m-truth-lab").textContent = "95% jackknife CI (includes 0)";
      document.getElementById("m-l2").textContent = "block design";
      document.getElementById("m-title").textContent = "Pooled euro-area effect on TFP";
      document.getElementById("m-note").innerHTML =
        "The near-zero pooled average is <strong>not significant</strong> under either the jackknife "
        + `${ci2(d.emu.pooled_ci[0], d.emu.pooled_ci[1])} or the wild bootstrap `
        + `${ci2(d.emu.pooled_ci_boot[0], d.emu.pooled_ci_boot[1])} — both include zero. But the single average hides the dynamics: `
        + "a positive bump in the early euro years, eroded by the 2008–2014 crisis, recovering by 2017 — the paper's arc.";
      multiChart.update({
        series: [
          { label: "Pooled EMU effect", color: P.steel, width: 2.5, points: zipXY(pp.time, pp.est) },
        ],
        band: { points: zipBand(pp.time, pp.lo, pp.hi) },
        hline: 0, vline: 0, vlabel: "1999",
        xlab: "Years since 1999", ylab: "Average effect on TFP",
      });
      tableCard.style.display = "none";
      forestCard.style.display = "none";
    }
  }
  function renderMultiTable() {
    const o = state.data.multi.overall;
    let html = "<table class='balance'><thead><tr><th>Unit</th>"
      + "<th style='text-align:right;'>Estimate</th><th style='text-align:right;'>Truth</th>"
      + "<th style='text-align:right;'>Jackknife CI</th><th style='text-align:right;'>Bootstrap CI</th>"
      + "<th>Verdict</th></tr></thead><tbody>";
    o.level.forEach((lv, i) => {
      const isAvg = lv === "Average";
      const wt = isAvg ? "font-weight:700;" : "";
      html += `<tr><td style='${wt}'><code>${isAvg ? "Pooled" : lv}</code></td>`
        + `<td style='text-align:right;${wt}'>${f(o.estimate[i], 3)}</td>`
        + `<td style='text-align:right;color:var(--muted,#8b9dc3);'>${f(o.truth[i], 3)}</td>`
        + `<td style='text-align:right;'>${ci2(o.ci_lo[i], o.ci_hi[i])}</td>`
        + `<td style='text-align:right;color:var(--muted,#8b9dc3);'>${ci2(o.boot_lo[i], o.boot_hi[i])}</td>`
        + `<td>${badge(o.sig_jack[i], "jack ✓", "jack —")} ${badge(o.sig_boot[i], "boot ✓", "boot —")}</td></tr>`;
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

  // ---- Tab 5: inference -----------------------------------------------------
  const pfmt = p => (p === 0 || p < 0.001) ? "<0.001" : (+p).toFixed(3);

  function renderInfer() {
    const d = state.data, s = d.single, m = d.multi.overall, mo = d.multiout, e = d.emu;
    const ai = m.level.indexOf("Average");
    const c05 = d.suitability.recovery.find(r => r.unit === "C05");
    const rows = [
      { fn: "<code>single_augsynth</code>", sub: "C01 · jackknife+ CI", est: s.att_plain,
        ci: `95% CI ${ci2(s.ci_plain[0], s.ci_plain[1])}`, sig: s.sig_plain },
      { fn: "<code>multisynth</code>", sub: "pooled · jackknife vs bootstrap", est: m.estimate[ai],
        ci: `jack ${ci2(m.ci_lo[ai], m.ci_hi[ai])} · boot ${ci2(m.boot_lo[ai], m.boot_hi[ai])}`, sig: m.sig_jack[ai] },
      { fn: "<code>augsynth_multiout</code>", sub: "C01 · gdp_index · conformal", est: mo.outcomes.gdp_index,
        ci: `conformal p ${pfmt(mo.pvals.gdp_index)}`, sig: mo.sig.gdp_index },
      { fn: "Suitability: <code>C05</code>", sub: "outside hull · plain SCM", est: c05.att_plain,
        ci: `95% CI ${ci2(c05.ci_lo, c05.ci_hi)} · sign wrong`, sig: c05.sig_plain },
      { fn: "EMU: Germany", sub: "real data · jackknife+ vs conformal", est: e.germany.att_plain,
        ci: `95% CI ${ci2(e.germany.ci_plain[0], e.germany.ci_plain[1])} · conformal p ${pfmt(e.germany.p_plain)}`,
        sig: e.germany.sig_plain, warn: !e.germany.sig_plain && e.germany.p_plain < 0.05 },
      { fn: "EMU: pooled", sub: "real data · 12 members", est: e.pooled_att,
        ci: `jack ${ci2(e.pooled_ci[0], e.pooled_ci[1])} · boot ${ci2(e.pooled_ci_boot[0], e.pooled_ci_boot[1])}`,
        sig: e.pooled_sig_jack },
    ];
    const html = rows.map(r => {
      const cls = r.warn ? "warn" : (r.sig ? "yes" : "no");
      const txt = r.warn ? "borderline" : (r.sig ? "significant" : "not significant");
      return `<div class="score-row"><div class="fn">${r.fn}<br><span class="note" style="font-style:normal;">${r.sub}</span></div>`
        + `<div class="est">${sgn(r.est)}</div><div class="ci">${r.ci}</div>`
        + `<div><span class="sig-badge ${cls}">${txt}</span></div></div>`;
    }).join("");
    document.getElementById("infer-scoreboard").innerHTML = html;
    simUpdate();
  }

  // deterministic standard-normal residuals so the simulator chart is stable
  function seededNormals(n, seed) {
    let st = seed >>> 0;
    const rnd = () => { st = (st * 1664525 + 1013904223) >>> 0; return st / 4294967296; };
    const out = [];
    for (let i = 0; i < n; i++) {
      const u1 = Math.max(rnd(), 1e-9), u2 = rnd();
      out.push(Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2));
    }
    return out;
  }
  const SIM_Z = seededNormals(80, 20260605);
  const normCdf = z => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const dd = 0.3989423 * Math.exp(-z * z / 2);
    const p = dd * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  };

  function simUpdate() {
    const eff = +document.getElementById("sim-eff").value;
    const sigma = +document.getElementById("sim-noise").value;
    const npre = +document.getElementById("sim-pre").value;
    const npost = 10;
    document.getElementById("sim-eff-v").textContent = eff.toFixed(1);
    document.getElementById("sim-noise-v").textContent = sigma.toFixed(1);
    document.getElementById("sim-pre-v").textContent = npre;

    const gap = [];
    for (let i = 0; i < npre; i++) gap.push({ x: i - npre, y: sigma * SIM_Z[i] });
    for (let j = 0; j < npost; j++) gap.push({ x: j, y: eff + sigma * SIM_Z[40 + j] });
    const post = gap.filter(p => p.x >= 0);
    const est = d3.mean(post, p => p.y);
    const se = sigma * Math.sqrt(1 / npost + 1 / npre);   // illustrative SE
    const lo = est - 1.96 * se, hi = est + 1.96 * se;
    const pval = 2 * (1 - normCdf(Math.abs(est) / se));
    const sig = lo > 0 || hi < 0;

    document.getElementById("sim-est").textContent = sgn(est);
    document.getElementById("sim-ci").textContent = ci2(lo, hi);
    const pEl = document.getElementById("sim-p");
    pEl.textContent = pfmt(pval);
    pEl.className = "v " + (sig ? "teal" : "orange");
    const sbb = document.getElementById("sim-badge");
    sbb.className = "sig-badge " + (sig ? "yes" : "no");
    sbb.textContent = sig ? "significant" : "not significant";

    simChart.update({
      series: [
        { label: "period gap", color: P.muted, width: 1.4, points: gap },
        { label: "estimated effect", color: P.steel, width: 2.5, points: post.map(p => ({ x: p.x, y: est })) },
      ],
      band: { points: post.map(p => ({ x: p.x, lo, hi })), color: sig ? "rgba(0,212,200,0.18)" : "rgba(217,119,87,0.16)" },
      hline: 0, vline: 0, vlabel: "adoption",
      xlab: "Time relative to adoption", ylab: "Treated − control gap",
    });
  }
  ["sim-eff", "sim-noise", "sim-pre"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", simUpdate);
  });

  // ---- load data ------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    state.data = data;
    renderIntro();
    renderSingle();
    renderMulti();
    renderEmu();
    renderInfer();
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    ["intro-chart", "single-chart", "multi-chart", "emu-scatter"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err.message}</div>`;
    });
  });

  window.addEventListener("error", e => console.error("[app] uncaught:", e.error));
})();
