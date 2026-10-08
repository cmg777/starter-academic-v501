/* charts.js — D3 v7 drawing functions for the Kansas ASCM lab.
   Every function clears its container and redraws responsively (viewBox).
   Colours match the site palette. No external state. */
(function (global) {
  "use strict";

  const C = {
    steel: "#6a9bcc", orange: "#d97757", teal: "#00d4c8",
    text: "#e8ecf2", muted: "#8b9dc3", grid: "rgba(232,236,242,0.10)",
    donor: "rgba(232,236,242,0.18)"
  };
  const TREAT = 2012.25;

  // shared tooltip
  let tip = d3.select("body").select(".tooltip");
  if (tip.empty()) tip = d3.select("body").append("div").attr("class", "tooltip");
  const showTip = (html, ev) => tip.html(html).classed("show", true)
    .style("left", (ev.pageX + 14) + "px").style("top", (ev.pageY - 10) + "px");
  const hideTip = () => tip.classed("show", false);

  // responsive svg frame
  function frame(sel, W, H, m) {
    const el = d3.select(sel);
    el.selectAll("*").remove();
    const svg = el.append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
    return { svg, g, iw: W - m.l - m.r, ih: H - m.t - m.b };
  }
  const axisStyle = (sel) => {
    sel.selectAll("text").attr("fill", C.muted).style("font-size", "11px");
    sel.selectAll("line,path").attr("stroke", C.grid);
  };

  /* ---- 1. Actual vs synthetic levels ---- */
  function levels(sel, d) {
    const W = 760, H = 380, m = { t: 16, r: 18, b: 38, l: 52 };
    const { g, iw, ih } = frame(sel, W, H, m);
    const t = d.time, n = t.length;
    const x = d3.scaleLinear().domain(d3.extent(t)).range([0, iw]);
    const ally = d.actual.concat(d.synthetic);
    const y = d3.scaleLinear().domain(d3.extent(ally)).nice().range([ih, 0]);
    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d"))).call(axisStyle);
    g.append("g").call(d3.axisLeft(y).ticks(6)).call(axisStyle);
    g.append("line").attr("x1", x(TREAT)).attr("x2", x(TREAT)).attr("y1", 0).attr("y2", ih)
      .attr("stroke", C.muted).attr("stroke-dasharray", "4 4");
    g.append("text").attr("x", x(TREAT) + 5).attr("y", 12).attr("fill", C.muted).style("font-size", "10px").text("tax cut 2012");
    const line = (key, col) => d3.line().x((_, i) => x(t[i])).y((_, i) => y(d[key][i]))(d3.range(n));
    g.append("path").attr("d", line("synthetic", C.steel)).attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2);
    g.append("path").attr("d", line("actual", C.orange)).attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2);
    g.append("text").attr("x", iw).attr("y", y(d.actual[n - 1]) - 6).attr("text-anchor", "end").attr("fill", C.orange).style("font-size", "11px").text("Kansas (actual)");
    g.append("text").attr("x", iw).attr("y", y(d.synthetic[n - 1]) + 14).attr("text-anchor", "end").attr("fill", C.steel).style("font-size", "11px").text("synthetic");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -ih / 2).attr("y", -38).attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px").text("log GDP per capita");
  }

  /* ---- 2. Donor weights horizontal bars ---- */
  function weights(sel, d) {
    const W = 760, H = 320, m = { t: 12, r: 60, b: 34, l: 120 };
    const { g, iw, ih } = frame(sel, W, H, m);
    const rows = d.state.map((s, i) => ({ state: s, abb: d.abb[i], w: d.weight[i] }))
      .sort((a, b) => b.w - a.w);
    const x = d3.scaleLinear().domain([0, d3.max(rows, r => r.w) * 1.12]).range([0, iw]);
    const y = d3.scaleBand().domain(rows.map(r => r.state)).range([0, ih]).padding(0.22);
    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(5)).call(axisStyle);
    g.append("g").call(d3.axisLeft(y)).call(axisStyle);
    g.selectAll(".bar").data(rows).join("rect").attr("class", "bar")
      .attr("x", 0).attr("y", r => y(r.state)).attr("height", y.bandwidth())
      .attr("width", r => x(r.w)).attr("fill", C.steel).attr("rx", 2)
      .on("mousemove", (ev, r) => showTip(`<b>${r.state} (${r.abb})</b><br><span class="tooltip-key">weight</span> <span class="tooltip-val">${r.w.toFixed(3)}</span>`, ev))
      .on("mouseleave", hideTip);
    g.selectAll(".lab").data(rows).join("text").attr("class", "lab")
      .attr("x", r => x(r.w) + 6).attr("y", r => y(r.state) + y.bandwidth() / 2 + 4)
      .attr("fill", C.text).style("font-size", "11px").text(r => r.w.toFixed(3));
    g.append("text").attr("x", iw / 2).attr("y", ih + 30).attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px").text("SCM weight");
  }

  /* ---- gap helper: line + optional conformal band ---- */
  function drawGap(g, x, y, d, col, band) {
    const t = d.time;
    if (band) {
      const idx = d3.range(t.length).filter(i => d.lo[i] != null && d.hi[i] != null);
      if (idx.length) {
        const area = d3.area().x(i => x(t[i])).y0(i => y(d.lo[i])).y1(i => y(d.hi[i]));
        g.append("path").datum(idx).attr("d", area).attr("fill", col).attr("opacity", 0.18);
      }
    }
    const line = d3.line().x(i => x(t[i])).y(i => y(d.est[i]));
    g.append("path").datum(d3.range(t.length)).attr("d", line).attr("fill", "none").attr("stroke", col).attr("stroke-width", 2);
  }

  /* ---- 3. Single gap with conformal band ---- */
  function gap(sel, d) {
    const W = 760, H = 360, m = { t: 16, r: 18, b: 38, l: 52 };
    const { g, iw, ih } = frame(sel, W, H, m);
    const t = d.time;
    const x = d3.scaleLinear().domain(d3.extent(t)).range([0, iw]);
    const lo = d.lo.filter(v => v != null), hi = d.hi.filter(v => v != null);
    const yd = d.est.concat(lo, hi);
    const y = d3.scaleLinear().domain(d3.extent(yd)).nice().range([ih, 0]);
    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d"))).call(axisStyle);
    g.append("g").call(d3.axisLeft(y).ticks(6)).call(axisStyle);
    g.append("line").attr("x1", 0).attr("x2", iw).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", C.muted).attr("opacity", 0.5);
    g.append("line").attr("x1", x(TREAT)).attr("x2", x(TREAT)).attr("y1", 0).attr("y2", ih).attr("stroke", C.muted).attr("stroke-dasharray", "4 4");
    drawGap(g, x, y, d, C.steel, true);
    g.append("text").attr("transform", "rotate(-90)").attr("x", -ih / 2).attr("y", -38).attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px").text("gap (ATT), log GDP per capita");
  }

  /* ---- 4. SCM vs Ridge gap overlay ---- */
  function overlay(sel, scm, ridge) {
    const W = 760, H = 360, m = { t: 16, r: 18, b: 38, l: 52 };
    const { g, iw, ih } = frame(sel, W, H, m);
    const t = scm.time;
    const x = d3.scaleLinear().domain(d3.extent(t)).range([0, iw]);
    const yd = scm.est.concat(ridge.est);
    const y = d3.scaleLinear().domain(d3.extent(yd)).nice().range([ih, 0]);
    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d"))).call(axisStyle);
    g.append("g").call(d3.axisLeft(y).ticks(6)).call(axisStyle);
    g.append("line").attr("x1", 0).attr("x2", iw).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", C.muted).attr("opacity", 0.5);
    g.append("line").attr("x1", x(TREAT)).attr("x2", x(TREAT)).attr("y1", 0).attr("y2", ih).attr("stroke", C.muted).attr("stroke-dasharray", "4 4");
    const line = (d) => d3.line().x(i => x(t[i])).y(i => y(d.est[i]))(d3.range(t.length));
    g.append("path").attr("d", line(scm)).attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2);
    g.append("path").attr("d", line(ridge)).attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 2);
    g.append("text").attr("x", iw).attr("y", 12).attr("text-anchor", "end").attr("fill", C.steel).style("font-size", "11px").text("Classic SCM");
    g.append("text").attr("x", iw).attr("y", 26).attr("text-anchor", "end").attr("fill", C.teal).style("font-size", "11px").text("Ridge ASCM");
  }

  /* ---- 5. CV curve (log-x) ---- */
  function cv(sel, d) {
    const W = 740, H = 320, m = { t: 16, r: 18, b: 40, l: 56 };
    const { g, iw, ih } = frame(sel, W, H, m);
    const lam = d.lambdas, err = d.errors;
    const valid = d3.range(lam.length).filter(i => lam[i] > 0 && isFinite(err[i]));
    const x = d3.scaleLog().domain(d3.extent(valid, i => lam[i])).range([0, iw]);
    const y = d3.scaleLinear().domain(d3.extent(valid, i => err[i])).nice().range([ih, 0]);
    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(5, "~g")).call(axisStyle);
    g.append("g").call(d3.axisLeft(y).ticks(5, "~e")).call(axisStyle);
    const order = valid.slice().sort((a, b) => lam[a] - lam[b]);
    const line = d3.line().x(i => x(lam[i])).y(i => y(err[i]));
    g.append("path").datum(order).attr("d", line).attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2);
    g.selectAll(".pt").data(order).join("circle").attr("class", "pt").attr("cx", i => x(lam[i])).attr("cy", i => y(err[i])).attr("r", 3).attr("fill", C.steel);
    g.append("line").attr("x1", x(d.chosen)).attr("x2", x(d.chosen)).attr("y1", 0).attr("y2", ih).attr("stroke", C.orange).attr("stroke-dasharray", "5 4");
    g.append("text").attr("x", x(d.chosen) + 5).attr("y", 14).attr("fill", C.orange).style("font-size", "10px").text(`λ = ${d.chosen.toFixed(3)} (1-SE)`);
    g.append("text").attr("x", iw / 2).attr("y", ih + 33).attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px").text("λ (log scale) — larger = closer to plain SCM");
  }

  /* ---- 6. Model-comparison forest (5 specs) ---- */
  function modelForest(sel, rows) {
    const W = 740, H = 300, m = { t: 16, r: 120, b: 38, l: 120 };
    const { g, iw, ih } = frame(sel, W, H, m);
    const x = d3.scaleLinear().domain([d3.min(rows, r => r.att) * 1.15, 0.002]).range([0, iw]);
    const y = d3.scaleBand().domain(rows.map(r => r.spec)).range([0, ih]).padding(0.4);
    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(5)).call(axisStyle);
    g.append("g").call(d3.axisLeft(y)).call(axisStyle);
    g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", ih).attr("stroke", C.muted).attr("stroke-dasharray", "4 4");
    const col = d3.scaleLinear().domain([d3.min(rows, r => r.att), 0]).range([C.orange, C.steel]);
    rows.forEach(r => {
      const yc = y(r.spec) + y.bandwidth() / 2;
      g.append("line").attr("x1", x(0)).attr("x2", x(r.att)).attr("y1", yc).attr("y2", yc).attr("stroke", C.grid).attr("stroke-width", 1);
      g.append("circle").attr("cx", x(r.att)).attr("cy", yc).attr("r", 6).attr("fill", col(r.att))
        .on("mousemove", (ev) => showTip(`<b>${r.spec}</b><br><span class="tooltip-key">ATT</span> <span class="tooltip-val">${r.att.toFixed(3)}</span><br><span class="tooltip-key">pre-fit L2</span> <span class="tooltip-val">${r.l2.toFixed(3)}</span>`, ev))
        .on("mouseleave", hideTip);
      g.append("text").attr("x", x(r.att) - 10).attr("y", yc + 4).attr("text-anchor", "end").attr("fill", C.text).style("font-size", "11px").text(r.att.toFixed(3));
    });
    g.append("text").attr("x", iw / 2).attr("y", ih + 32).attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px").text("average ATT (log GDP per capita)");
  }

  /* ---- 7. Inference forest (4 methods) ---- */
  function infForest(sel, inf) {
    const rows = inf.method.map((mname, i) => ({
      method: mname, est: inf.estimate[i],
      lo: inf.lower[i], hi: inf.upper[i], p: inf.p_val[i]
    }));
    const W = 760, H = 300, m = { t: 16, r: 120, b: 38, l: 150 };
    const { g, iw, ih } = frame(sel, W, H, m);
    const xs = rows.flatMap(r => [r.lo, r.hi, r.est]).filter(v => v != null);
    const x = d3.scaleLinear().domain([d3.min(xs) * 1.1, Math.max(0.02, d3.max(xs))]).nice().range([0, iw]);
    const y = d3.scaleBand().domain(rows.map(r => r.method)).range([0, ih]).padding(0.45);
    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(6)).call(axisStyle);
    g.append("g").call(d3.axisLeft(y)).call(axisStyle);
    g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", ih).attr("stroke", C.muted).attr("stroke-dasharray", "4 4");
    rows.forEach(r => {
      const yc = y(r.method) + y.bandwidth() / 2;
      if (r.lo != null && r.hi != null) {
        const sig = Math.sign(r.lo) === Math.sign(r.hi);
        g.append("line").attr("x1", x(r.lo)).attr("x2", x(r.hi)).attr("y1", yc).attr("y2", yc).attr("stroke", sig ? C.teal : C.steel).attr("stroke-width", 3);
        ["x1", "x2"].forEach((a, k) => g.append("line").attr("x1", x(k ? r.hi : r.lo)).attr("x2", x(k ? r.hi : r.lo)).attr("y1", yc - 5).attr("y2", yc + 5).attr("stroke", sig ? C.teal : C.steel).attr("stroke-width", 2));
      }
      g.append("circle").attr("cx", x(r.est)).attr("cy", yc).attr("r", 6).attr("fill", C.orange);
      const lbl = (r.p != null) ? `p = ${r.p.toFixed(3)}` : (Math.sign(r.lo) === Math.sign(r.hi) ? "excludes 0" : "includes 0");
      g.append("text").attr("x", iw + 6).attr("y", yc + 4).attr("fill", C.muted).style("font-size", "11px").text(lbl);
    });
    g.append("text").attr("x", iw / 2).attr("y", ih + 32).attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px").text("average ATT with 95% interval / p-value");
  }

  /* ---- 8. Placebo ratio strip ---- */
  function placebo(sel, d) {
    const rows = d.fips.map((f, i) => ({ fips: f, trt: d.trt[i], ratio: d.ratio[i] }))
      .filter(r => isFinite(r.ratio));
    const W = 760, H = 200, m = { t: 24, r: 24, b: 40, l: 24 };
    const { g, iw, ih } = frame(sel, W, H, m);
    const x = d3.scaleLinear().domain([0, d3.max(rows, r => r.ratio) * 1.05]).range([0, iw]);
    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(6)).call(axisStyle);
    // deterministic vertical placement by index (a tidy strip, not random jitter)
    rows.forEach((r, i) => {
      const yc = ih * 0.28 + ((i * 37) % Math.floor(ih * 0.5));
      const treated = r.trt === "Treatment";
      g.append("circle").attr("cx", x(r.ratio)).attr("cy", yc).attr("r", treated ? 7 : 4)
        .attr("fill", treated ? C.orange : C.donor).attr("stroke", treated ? "#fff" : "none").attr("stroke-width", treated ? 1.5 : 0)
        .on("mousemove", (ev) => showTip(`${treated ? "<b>Kansas</b>" : "donor placebo"}<br><span class="tooltip-key">RMSPE ratio</span> <span class="tooltip-val">${r.ratio.toFixed(2)}</span>`, ev))
        .on("mouseleave", hideTip);
    });
    const ks = rows.find(r => r.trt === "Treatment");
    if (ks) g.append("text").attr("x", x(ks.ratio)).attr("y", ih * 0.20).attr("text-anchor", "middle").attr("fill", C.orange).style("font-size", "11px").text("Kansas");
    g.append("text").attr("x", iw / 2).attr("y", ih + 34).attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px").text("post / pre RMSPE ratio (larger = bigger divergence after 2012)");
  }

  /* ---- 9. Significance simulator ---- */
  function sim(sel, p) {
    // p: {eff, noise, pre} ; returns {est, se, lo, hi, pval, sig}
    const post = 16, pre = p.pre;
    const se = p.noise / Math.sqrt(post) * Math.sqrt(1 + 1 / pre); // illustrative
    const est = p.eff;
    const lo = est - 1.96 * se, hi = est + 1.96 * se;
    const z = est / se;
    const pval = 2 * (1 - normcdf(Math.abs(z)));
    const sig = lo > 0 || hi < 0;
    // draw an illustrative gap path
    const W = 760, H = 300, m = { t: 16, r: 18, b: 36, l: 48 };
    const { g, iw, ih } = frame(sel, W, H, m);
    const T = pre + post, x = d3.scaleLinear().domain([0, T - 1]).range([0, iw]);
    const seed = Math.round(p.eff * 7 + p.noise * 13 + p.pre);
    const rnd = mulberry(seed);
    const pts = d3.range(T).map(i => {
      const isPost = i >= pre;
      const mean = isPost ? est : 0;
      return { i, v: mean + (rnd() - 0.5) * 2 * p.noise * 0.9 };
    });
    const yd = pts.map(d => d.v).concat([lo, hi, 0]);
    const y = d3.scaleLinear().domain(d3.extent(yd)).nice().range([ih, 0]);
    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(6)).call(axisStyle);
    g.append("g").call(d3.axisLeft(y).ticks(6)).call(axisStyle);
    g.append("line").attr("x1", 0).attr("x2", iw).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", C.muted).attr("opacity", 0.5);
    g.append("line").attr("x1", x(pre)).attr("x2", x(pre)).attr("y1", 0).attr("y2", ih).attr("stroke", C.muted).attr("stroke-dasharray", "4 4");
    // CI band on post mean
    g.append("rect").attr("x", x(pre)).attr("width", iw - x(pre)).attr("y", y(hi)).attr("height", Math.abs(y(lo) - y(hi))).attr("fill", sig ? C.teal : C.steel).attr("opacity", 0.15);
    g.append("line").attr("x1", x(pre)).attr("x2", iw).attr("y1", y(est)).attr("y2", y(est)).attr("stroke", sig ? C.teal : C.steel).attr("stroke-width", 2);
    g.append("path").datum(pts).attr("d", d3.line().x(d => x(d.i)).y(d => y(d.v))).attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 1.3).attr("opacity", 0.85);
    g.append("text").attr("x", x(pre / 2)).attr("y", 12).attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "10px").text("pre-treatment");
    g.append("text").attr("x", x(pre + post / 2)).attr("y", 12).attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "10px").text("post-treatment");
    return { est, lo, hi, pval, sig };
  }

  function normcdf(z) { // Abramowitz-Stegun
    const t = 1 / (1 + 0.2316419 * z);
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return 1 - p;
  }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  global.Charts = { levels, weights, gap, overlay, cv, modelForest, infForest, placebo, sim };
})(window);
