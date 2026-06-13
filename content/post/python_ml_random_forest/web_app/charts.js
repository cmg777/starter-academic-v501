/* charts.js — D3 v7 chart functions for the Random Forest + Cross-Validation lab.
   All charts are self-contained: each clears its container and redraws, so they
   are safe to call on tab-switch and on resize. */

const COL = {
  steel: "#6a9bcc", orange: "#d97757", teal: "#00d4c8",
  text: "#e8ecf2", muted: "#8b9dc3", grid: "rgba(232,236,242,0.14)",
  light: "#cdd6e6", panel: "#182447",
};
const FOLD_COLORS = ["#6a9bcc", "#d97757", "#00d4c8", "#8e6fb0", "#e0a23a"];

/* ---- shared tooltip ---- */
const _tip = () => d3.select("#tooltip");
function showTip(html, event) {
  const pad = 14;
  _tip().html(html).classed("show", true)
    .style("left", (event.pageX + pad) + "px")
    .style("top", (event.pageY + pad) + "px");
}
function hideTip() { _tip().classed("show", false); }

/* ---- helper: fresh responsive svg in a container ---- */
function freshSvg(id, width, height) {
  const c = d3.select("#" + id);
  c.select("svg").remove();
  return c.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%");
}
function widthOf(id, fallback) {
  const el = document.getElementById(id);
  const w = el ? el.clientWidth : 0;
  return Math.max(320, (w || fallback) - 2);
}
function axisStyle(g) {
  g.selectAll("text").attr("fill", COL.muted).style("font-size", "11px");
  g.selectAll("line,path").attr("stroke", COL.grid);
}

/* =================================================================
   TAB 1 — cross-validation fold grid (k rounds x k folds)
   round: 1..k to emphasise that round, or 0 for "all rounds"
   ================================================================= */
function cvFoldDiagram(id, round, summary) {
  const k = summary.n_folds;
  const W = widthOf(id, 900);
  const left = 96, top = 34, gap = 8;
  const cell = Math.min(120, (W - left - 16 - (k - 1) * gap) / k);
  const H = top + k * (cell + gap) + 16;
  const svg = freshSvg(id, W, H);

  for (let c = 0; c < k; c++) {
    svg.append("text")
      .attr("x", left + c * (cell + gap) + cell / 2).attr("y", 20)
      .attr("text-anchor", "middle").attr("fill", COL.muted)
      .style("font-size", "12px").text("Fold " + (c + 1));
  }
  for (let r = 0; r < k; r++) {
    const active = (round === 0) || (round === r + 1);
    svg.append("text")
      .attr("x", left - 12).attr("y", top + r * (cell + gap) + cell / 2 + 4)
      .attr("text-anchor", "end").attr("fill", active ? COL.text : COL.muted)
      .style("font-size", "12px").style("font-weight", active ? 700 : 400)
      .text("Round " + (r + 1));
    for (let c = 0; c < k; c++) {
      const isTest = (c === r);
      svg.append("rect")
        .attr("x", left + c * (cell + gap)).attr("y", top + r * (cell + gap))
        .attr("width", cell).attr("height", cell).attr("rx", 6)
        .attr("fill", isTest ? COL.orange : COL.steel)
        .attr("opacity", active ? (isTest ? 0.95 : 0.55) : 0.16)
        .attr("stroke", active && isTest ? "#fff" : "none").attr("stroke-width", 1.5)
        .on("mousemove", (e) => showTip(
          `<b>Round ${r + 1}, Fold ${c + 1}</b><br>` +
          (isTest ? "held out for <b>testing</b>" : "used for <b>training</b>"), e))
        .on("mouseleave", hideTip);
      if (active && cell > 54) {
        svg.append("text")
          .attr("x", left + c * (cell + gap) + cell / 2)
          .attr("y", top + r * (cell + gap) + cell / 2 + 4)
          .attr("text-anchor", "middle").attr("fill", "#fff")
          .style("font-size", "11px").style("font-weight", 600)
          .style("pointer-events", "none")
          .text(isTest ? "test" : "train");
      }
    }
  }
}

/* =================================================================
   TAB 2 — per-fold metric bars with mean line and ±SD band
   ================================================================= */
function perFoldBars(id, foldMetrics, metric, summary) {
  const W = widthOf(id, 800), H = 360;
  const m = { t: 24, r: 20, b: 40, l: 52 };
  const svg = freshSvg(id, W, H);
  const vals = foldMetrics.map(f => f[metric]);
  const mean = summary["mean_" + metric], sd = summary["std_" + metric];
  const dec = metric === "r2" ? 3 : 2;

  const lo = Math.min(0, d3.min(vals), mean - sd);
  const hi = Math.max(d3.max(vals), mean + sd);
  const pad = (hi - lo) * 0.12 || 1;
  const x = d3.scaleBand().domain(foldMetrics.map(f => f.fold))
    .range([m.l, W - m.r]).padding(0.35);
  const y = d3.scaleLinear().domain([lo - pad, hi + pad]).range([H - m.b, m.t]);

  svg.append("rect").attr("x", m.l).attr("width", W - m.r - m.l)
    .attr("y", y(mean + sd)).attr("height", Math.abs(y(mean - sd) - y(mean + sd)))
    .attr("fill", COL.text).attr("opacity", 0.06);

  svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).tickFormat(d => "Fold " + d)).call(axisStyle);
  svg.append("g").attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(6)).call(axisStyle);

  if (lo - pad < 0 && hi + pad > 0) {
    svg.append("line").attr("x1", m.l).attr("x2", W - m.r)
      .attr("y1", y(0)).attr("y2", y(0)).attr("stroke", COL.muted)
      .attr("stroke-width", 1).attr("opacity", 0.5);
  }

  const color = { r2: COL.steel, rmse: COL.orange, mae: COL.teal }[metric];
  svg.selectAll(".bar").data(foldMetrics).join("rect")
    .attr("x", d => x(d.fold)).attr("width", x.bandwidth())
    .attr("y", d => y(Math.max(0, d[metric])))
    .attr("height", d => Math.abs(y(d[metric]) - y(0)))
    .attr("rx", 4).attr("fill", color).attr("opacity", 0.9)
    .on("mousemove", (e, d) => showTip(
      `<b>Fold ${d.fold}</b> (n = ${d.n})<br>` +
      `<span class="tooltip-key">R²</span> <span class="tooltip-val">${d.r2.toFixed(3)}</span><br>` +
      `<span class="tooltip-key">RMSE</span> <span class="tooltip-val">${d.rmse.toFixed(2)}</span><br>` +
      `<span class="tooltip-key">MAE</span> <span class="tooltip-val">${d.mae.toFixed(2)}</span>`, e))
    .on("mouseleave", hideTip);

  svg.append("line").attr("x1", m.l).attr("x2", W - m.r)
    .attr("y1", y(mean)).attr("y2", y(mean))
    .attr("stroke", COL.light).attr("stroke-dasharray", "6 4").attr("stroke-width", 1.8);
  svg.append("text").attr("x", W - m.r).attr("y", y(mean) - 6)
    .attr("text-anchor", "end").attr("fill", COL.text).style("font-size", "11px")
    .text(`mean = ${mean.toFixed(dec)}  (±${sd.toFixed(dec)})`);
}

/* =================================================================
   TAB 3a — out-of-fold scatter, colored by fold
   ================================================================= */
function oofScatter(id, oof, activeFolds, summary) {
  const W = widthOf(id, 720), H = 520;
  const m = { t: 20, r: 18, b: 46, l: 52 };
  const svg = freshSvg(id, W, H);
  const lo = Math.min(summary.target_min, d3.min(oof, d => d.p)) - 2;
  const hi = Math.max(summary.target_max, d3.max(oof, d => d.p)) + 2;
  const x = d3.scaleLinear().domain([lo, hi]).range([m.l, W - m.r]);
  const y = d3.scaleLinear().domain([lo, hi]).range([H - m.b, m.t]);

  svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).ticks(8)).call(axisStyle);
  svg.append("g").attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(8)).call(axisStyle);
  svg.append("text").attr("x", (m.l + W - m.r) / 2).attr("y", H - 8)
    .attr("text-anchor", "middle").attr("fill", COL.muted).style("font-size", "12px")
    .text("Actual IMDS");
  svg.append("text").attr("transform", "rotate(-90)")
    .attr("x", -(m.t + H - m.b) / 2).attr("y", 14)
    .attr("text-anchor", "middle").attr("fill", COL.muted).style("font-size", "12px")
    .text("Predicted IMDS (out-of-fold)");

  svg.append("line").attr("x1", x(lo)).attr("y1", y(lo)).attr("x2", x(hi)).attr("y2", y(hi))
    .attr("stroke", COL.light).attr("stroke-dasharray", "6 4").attr("stroke-width", 1.6);

  const shown = oof.filter(d => activeFolds.has(d.f));
  svg.selectAll(".pt").data(shown).join("circle")
    .attr("cx", d => x(d.a)).attr("cy", d => y(d.p)).attr("r", 3.6)
    .attr("fill", d => FOLD_COLORS[d.f - 1]).attr("opacity", 0.8)
    .attr("stroke", "#fff").attr("stroke-width", 0.4)
    .on("mousemove", (e, d) => showTip(
      `<b>Fold ${d.f}</b><br>` +
      `<span class="tooltip-key">actual</span> <span class="tooltip-val">${d.a.toFixed(1)}</span><br>` +
      `<span class="tooltip-key">predicted</span> <span class="tooltip-val">${d.p.toFixed(1)}</span><br>` +
      `<span class="tooltip-key">residual</span> <span class="tooltip-val">${(d.a - d.p).toFixed(1)}</span>`, e))
    .on("mouseleave", hideTip);

  svg.append("text").attr("x", m.l + 8).attr("y", m.t + 14)
    .attr("fill", COL.text).style("font-size", "12px")
    .text(`Pooled OOF R² = ${summary.pooled_r2.toFixed(3)}  ·  ${shown.length} of ${oof.length} towns`);
}

/* =================================================================
   TAB 3b — distribution overlay (actual vs predicted, density)
   ================================================================= */
function distOverlay(id, oof, summary) {
  const W = widthOf(id, 760), H = 460;
  const m = { t: 20, r: 18, b: 46, l: 52 };
  const svg = freshSvg(id, W, H);
  const actual = oof.map(d => d.a), pred = oof.map(d => d.p);
  const lo = Math.min(d3.min(actual), d3.min(pred)) - 2;
  const hi = Math.max(d3.max(actual), d3.max(pred)) + 2;
  const x = d3.scaleLinear().domain([lo, hi]).range([m.l, W - m.r]);
  const bin = d3.bin().domain([lo, hi]).thresholds(26);
  const dens = (arr) => bin(arr).map(d => ({ x0: d.x0, x1: d.x1,
    v: d.length / (arr.length * (d.x1 - d.x0)) }));
  const da = dens(actual), dp = dens(pred);
  const ymax = d3.max([...da, ...dp], d => d.v) * 1.12;
  const y = d3.scaleLinear().domain([0, ymax]).range([H - m.b, m.t]);

  svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).ticks(8)).call(axisStyle);
  svg.append("g").attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5)).call(axisStyle);
  svg.append("text").attr("x", (m.l + W - m.r) / 2).attr("y", H - 8)
    .attr("text-anchor", "middle").attr("fill", COL.muted).style("font-size", "12px").text("IMDS");
  svg.append("text").attr("transform", "rotate(-90)")
    .attr("x", -(m.t + H - m.b) / 2).attr("y", 14)
    .attr("text-anchor", "middle").attr("fill", COL.muted).style("font-size", "12px").text("Density");

  const drawBars = (data, color) => svg.append("g").selectAll("rect").data(data).join("rect")
    .attr("x", d => x(d.x0) + 1).attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
    .attr("y", d => y(d.v)).attr("height", d => y(0) - y(d.v))
    .attr("fill", color).attr("opacity", 0.45);
  drawBars(da, COL.steel);
  drawBars(dp, COL.orange);

  const meanLine = (val, color) => svg.append("line")
    .attr("x1", x(val)).attr("x2", x(val)).attr("y1", y(0)).attr("y2", m.t)
    .attr("stroke", color).attr("stroke-dasharray", "4 3").attr("stroke-width", 1.6).attr("opacity", 0.9);
  meanLine(summary.target_mean, COL.steel);
  meanLine(summary.pred_mean, COL.orange);

  const lg = svg.append("g").attr("transform", `translate(${W - m.r - 168},${m.t})`);
  [["Actual", COL.steel], ["Predicted (OOF)", COL.orange]].forEach((d, i) => {
    lg.append("rect").attr("x", 0).attr("y", i * 20).attr("width", 14).attr("height", 14)
      .attr("rx", 3).attr("fill", d[1]).attr("opacity", 0.6);
    lg.append("text").attr("x", 20).attr("y", i * 20 + 11).attr("fill", COL.text)
      .style("font-size", "12px").text(d[0]);
  });
  svg.append("text").attr("x", m.l + 8).attr("y", m.t + 14).attr("fill", COL.text)
    .style("font-size", "12px")
    .text(`actual SD ${summary.target_std.toFixed(2)} · predicted SD ${summary.pred_std.toFixed(2)} · KS p ${fmtP(summary.ks_p)}`);
}

/* =================================================================
   TAB 4 — top-20 feature importance (horizontal bars)
   ================================================================= */
function importanceBars(id, items, color, xlabel) {
  const W = widthOf(id, 800), rowH = 22, m = { t: 16, r: 24, b: 40, l: 56 };
  const H = m.t + m.b + items.length * rowH;
  const svg = freshSvg(id, W, H);
  const y = d3.scaleBand().domain(items.map(d => d.feature)).range([m.t, H - m.b]).padding(0.18);
  const x = d3.scaleLinear().domain([0, d3.max(items, d => d.importance) * 1.05]).range([m.l, W - m.r]);

  svg.append("g").attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y)).call(axisStyle);
  svg.append("g").attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).ticks(6)).call(axisStyle);
  svg.append("text").attr("x", (m.l + W - m.r) / 2).attr("y", H - 6)
    .attr("text-anchor", "middle").attr("fill", COL.muted).style("font-size", "12px").text(xlabel);

  svg.selectAll(".bar").data(items).join("rect")
    .attr("y", d => y(d.feature)).attr("height", y.bandwidth())
    .attr("x", m.l).attr("width", d => x(d.importance) - m.l)
    .attr("rx", 3).attr("fill", color).attr("opacity", 0.9)
    .on("mousemove", (e, d) => showTip(
      `<b>${d.feature}</b><br><span class="tooltip-key">${xlabel}</span> ` +
      `<span class="tooltip-val">${d.importance.toFixed(4)}</span>`, e))
    .on("mouseleave", hideTip);
}

/* =================================================================
   TAB 4 — tuning comparison bars (baseline vs grid/random/optuna)
   ================================================================= */
function tuningBars(id, tuning) {
  const W = widthOf(id, 760), H = 300, m = { t: 20, r: 20, b: 40, l: 52 };
  const svg = freshSvg(id, W, H);
  const baseline = tuning[0].cv_r2;
  const x = d3.scaleBand().domain(tuning.map(d => d.method)).range([m.l, W - m.r]).padding(0.4);
  const y = d3.scaleLinear().domain([0, d3.max(tuning, d => d.cv_r2) * 1.18]).range([H - m.b, m.t]);
  const colors = { Baseline: COL.muted, Grid: COL.steel, Random: COL.teal, Optuna: COL.orange };

  svg.append("g").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x)).call(axisStyle);
  svg.append("g").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5)).call(axisStyle);
  svg.append("text").attr("transform", "rotate(-90)").attr("x", -(m.t + H - m.b) / 2).attr("y", 14)
    .attr("text-anchor", "middle").attr("fill", COL.muted).style("font-size", "11px").text("Best 5-fold CV R²");

  svg.selectAll(".bar").data(tuning).join("rect")
    .attr("x", d => x(d.method)).attr("width", x.bandwidth())
    .attr("y", d => y(d.cv_r2)).attr("height", d => y(0) - y(d.cv_r2))
    .attr("rx", 4).attr("fill", d => colors[d.method] || COL.steel).attr("opacity", 0.92)
    .on("mousemove", (e, d) => showTip(
      `<b>${d.method}</b><br><span class="tooltip-key">CV R²</span> ` +
      `<span class="tooltip-val">${d.cv_r2.toFixed(3)}</span>` +
      (d.method === "Baseline" ? "" : `<br>+${(d.cv_r2 - baseline).toFixed(3)} vs baseline`), e))
    .on("mouseleave", hideTip);

  svg.selectAll(".lbl").data(tuning).join("text")
    .attr("x", d => x(d.method) + x.bandwidth() / 2).attr("y", d => y(d.cv_r2) - 6)
    .attr("text-anchor", "middle").attr("fill", COL.text).style("font-size", "12px")
    .text(d => d.cv_r2.toFixed(3));

  svg.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(baseline)).attr("y2", y(baseline))
    .attr("stroke", COL.muted).attr("stroke-dasharray", "5 4").attr("opacity", 0.6);
}

function fmtP(p) { return p < 1e-4 ? "< 0.001" : p.toFixed(3); }
