/* charts.js — D3 drawing routines for the Jamuna Bridge explorer.
 *
 * Every chart follows the same contract: it is handed a container selector and a
 * plain data object, it clears whatever was there, and it redraws. No chart holds
 * state; app.js owns all of that. This keeps the interactions trivially correct at
 * the cost of a little redundant DOM work, which at these data sizes is free.
 */

const C = {
  bg: "#0f1729",
  panel: "#1f2b5e",
  steel: "#6a9bcc",
  orange: "#d97757",
  teal: "#00d4c8",
  text: "#e8ecf2",
  muted: "#8b9dc3",
  grid: "rgba(232,236,242,0.10)",
  good: "#00d4c8",
  bad: "#d97757",
};

function clear(sel) {
  d3.select(sel).selectAll("*").remove();
}

function frame(sel, height, margin) {
  const el = document.querySelector(sel);
  const width = Math.max(320, el.clientWidth);
  const svg = d3.select(sel).append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img");
  const g = svg.append("g").attr("transform", `translate(${margin.l},${margin.t})`);
  return { svg, g, w: width - margin.l - margin.r, h: height - margin.t - margin.b, width };
}

function axes(g, x, y, w, h, xLabel, yLabel, opts = {}) {
  const xa = g.append("g")
    .attr("transform", `translate(0,${h})`)
    .call(opts.xAxis || d3.axisBottom(x).ticks(6));
  const ya = g.append("g").call(opts.yAxis || d3.axisLeft(y).ticks(6));
  [xa, ya].forEach(a => {
    a.selectAll("text").attr("fill", C.muted).style("font-size", "11px");
    a.selectAll("line, path").attr("stroke", C.grid);
  });
  if (opts.rotateX) {
    xa.selectAll("text")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end");
  }
  if (xLabel) {
    g.append("text").attr("x", w / 2).attr("y", h + (opts.rotateX ? 56 : 38))
      .attr("text-anchor", "middle").attr("fill", C.muted)
      .style("font-size", "12px").text(xLabel);
  }
  if (yLabel) {
    g.append("text").attr("transform", "rotate(-90)")
      .attr("x", -h / 2).attr("y", -46)
      .attr("text-anchor", "middle").attr("fill", C.muted)
      .style("font-size", "12px").text(yLabel);
  }
  // Horizontal gridlines, but only for continuous y. Band scales (categorical
  // rows in the forest and placebo charts) have no .ticks(), and gridlines
  // between category bands would be noise anyway.
  if (typeof y.ticks === "function") {
    g.selectAll(".gl").data(y.ticks(6)).enter().append("line")
      .attr("class", "gl")
      .attr("x1", 0).attr("x2", w)
      .attr("y1", d => y(d)).attr("y2", d => y(d))
      .attr("stroke", C.grid).attr("stroke-width", 1);
  }
}

/* ---------------------------------------------------------------- tab 1 */

function drawDiscriminator(sel, revealed) {
  clear(sel);
  const m = { t: 26, r: 24, b: 62, l: 200 };
  const { g, w, h } = frame(sel, 260, m);

  const rows = [
    { label: "Manufacturing share", val: -0.012, se: 0.005,
      note: "both theories predict this" },
    { label: "Population density", val: 0.059, se: 0.016,
      note: "only one theory survives this" },
  ];

  const maxAbs = 0.09;
  const x = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([0, w]);
  const y = d3.scaleBand().domain(rows.map(d => d.label)).range([0, h]).padding(0.45);

  g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
    .attr("stroke", C.text).attr("stroke-width", 1.4);

  axes(g, x, y, w, h, "Long-run effect", null, { yAxis: d3.axisLeft(y) });

  const row = g.selectAll(".row").data(rows).enter().append("g")
    .attr("transform", d => `translate(0,${y(d.label) + y.bandwidth() / 2})`);

  if (revealed) {
    row.append("line")
      .attr("x1", d => x(d.val - 1.96 * d.se))
      .attr("x2", d => x(d.val + 1.96 * d.se))
      .attr("stroke", C.muted).attr("stroke-width", 2)
      .attr("opacity", 0).transition().duration(700).attr("opacity", 1);
    row.append("circle")
      .attr("cx", x(0)).attr("cy", 0).attr("r", 8)
      .attr("fill", d => d.val < 0 ? C.orange : C.teal)
      .transition().duration(900).attr("cx", d => x(d.val));
    row.append("text")
      .attr("x", d => x(d.val) + (d.val < 0 ? -16 : 16))
      .attr("y", -16)
      .attr("text-anchor", d => d.val < 0 ? "end" : "start")
      .attr("fill", C.text).style("font-size", "13px").style("font-weight", "600")
      .text(d => (d.val > 0 ? "+" : "") + d.val.toFixed(3))
      .attr("opacity", 0).transition().delay(700).duration(500).attr("opacity", 1);
  } else {
    row.append("text")
      .attr("x", x(0)).attr("y", 5).attr("text-anchor", "middle")
      .attr("fill", C.muted).style("font-size", "12px").text("?");
  }

  row.append("text")
    .attr("x", 0).attr("y", 26)
    .attr("fill", C.muted).style("font-size", "11px")
    .text(d => revealed ? d.note : "");

  g.selectAll(".domain").remove();
}

/* ---------------------------------------------------------------- tab 2 */

function drawLab(sel, cells, violation, label) {
  clear(sel);
  const m = { t: 24, r: 150, b: 52, l: 66 };
  const { g, w, h } = frame(sel, 330, m);

  const dTreat = cells.post1 - cells.pre1;
  const dCtrl = cells.post0 - cells.pre0;
  const counter = cells.pre1 + dCtrl + violation;
  const att = cells.post1 - counter;

  const all = [cells.pre0, cells.post0, cells.pre1, cells.post1, counter];
  const pad = (d3.max(all) - d3.min(all)) * 0.28 || 0.05;
  const x = d3.scaleLinear().domain([0, 1]).range([0, w]);
  const y = d3.scaleLinear().domain([d3.min(all) - pad, d3.max(all) + pad]).range([h, 0]);

  axes(g, x, y, w, h, null, label, {
    xAxis: d3.axisBottom(x).tickValues([0, 1])
      .tickFormat(d => d === 0 ? "Before the bridge" : "After the bridge"),
  });

  const line = (y0, y1, color, dash) => g.append("line")
    .attr("x1", x(0)).attr("y1", y(y0)).attr("x2", x(1)).attr("y2", y(y1))
    .attr("stroke", color).attr("stroke-width", 2.6)
    .attr("stroke-dasharray", dash || null);

  line(cells.pre0, cells.post0, C.steel);
  line(cells.pre1, cells.post1, C.orange);
  line(cells.pre1, counter, C.teal, "6,5");

  const dot = (cx, cy, color) => g.append("circle")
    .attr("cx", x(cx)).attr("cy", y(cy)).attr("r", 6).attr("fill", color);
  dot(0, cells.pre0, C.steel); dot(1, cells.post0, C.steel);
  dot(0, cells.pre1, C.orange); dot(1, cells.post1, C.orange);
  dot(1, counter, C.teal);

  // the ATT bracket
  g.append("line")
    .attr("x1", x(1)).attr("x2", x(1))
    .attr("y1", y(counter)).attr("y2", y(cells.post1))
    .attr("stroke", C.text).attr("stroke-width", 2);
  g.append("text")
    .attr("x", x(1) + 12).attr("y", (y(counter) + y(cells.post1)) / 2 + 4)
    .attr("fill", C.text).style("font-size", "13px").style("font-weight", "600")
    .text(`ATT = ${att >= 0 ? "+" : ""}${att.toFixed(4)}`);

  const legend = [
    ["Jamuna (treated)", C.orange],
    ["Padma (comparison)", C.steel],
    ["Counterfactual", C.teal],
  ];
  legend.forEach(([t, c], i) => {
    const gy = 8 + i * 20;
    g.append("line").attr("x1", w + 14).attr("x2", w + 32)
      .attr("y1", gy).attr("y2", gy).attr("stroke", c).attr("stroke-width", 3);
    g.append("text").attr("x", w + 38).attr("y", gy + 4)
      .attr("fill", C.muted).style("font-size", "11px").text(t);
  });

  g.selectAll(".domain").remove();
  return att;
}

function drawForest(sel, rows, highlight) {
  clear(sel);
  const m = { t: 18, r: 30, b: 48, l: 190 };
  const { g, w, h } = frame(sel, Math.max(220, rows.length * 30 + 66), m);

  const lo = d3.min(rows, d => d.coef - 1.96 * d.se);
  const hi = d3.max(rows, d => d.coef + 1.96 * d.se);
  const pad = (hi - lo) * 0.12;
  const x = d3.scaleLinear().domain([lo - pad, hi + pad]).range([0, w]);
  const y = d3.scaleBand().domain(rows.map(d => d.label)).range([0, h]).padding(0.35);

  axes(g, x, y, w, h, "Effect", null, { yAxis: d3.axisLeft(y) });
  g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
    .attr("stroke", C.text).attr("stroke-width", 1.3);

  const row = g.selectAll(".r").data(rows).enter().append("g")
    .attr("transform", d => `translate(0,${y(d.label) + y.bandwidth() / 2})`)
    .attr("opacity", d => (!highlight || d.estimator === highlight) ? 1 : 0.22);

  row.append("line")
    .attr("x1", d => x(d.coef - 1.96 * d.se))
    .attr("x2", d => x(d.coef + 1.96 * d.se))
    .attr("stroke", C.muted).attr("stroke-width", 1.8);
  row.append("circle")
    .attr("cx", d => x(d.coef)).attr("r", 5.5)
    .attr("fill", d => d.estimator === "OLS" ? C.steel
      : d.estimator === "LWDR" ? C.orange : C.teal);
  row.append("text")
    .attr("x", w + 4).attr("y", 4)
    .attr("fill", C.muted).style("font-size", "10px")
    .text(d => d.coef.toFixed(3));

  g.selectAll(".domain").remove();
}

/* ---------------------------------------------------------------- tab 3 */

function drawEventStudy(sel, rows, firstPost, upTo, yLabel) {
  clear(sel);
  const m = { t: 24, r: 24, b: 70, l: 66 };
  const { g, w, h } = frame(sel, 340, m);

  const visible = rows.filter(d => upTo === null || d.period <= upTo);
  const lo = d3.min(rows, d => d.effect - 1.96 * d.se);
  const hi = d3.max(rows, d => d.effect + 1.96 * d.se);
  const pad = (hi - lo) * 0.12;

  const x = d3.scalePoint().domain(rows.map(d => d.label)).range([0, w]).padding(0.55);
  const y = d3.scaleLinear().domain([lo - pad, hi + pad]).range([h, 0]);

  // shade the pre-treatment window
  const preRows = rows.filter(d => d.period < firstPost);
  if (preRows.length) {
    const edge = x(rows.find(d => d.period === firstPost).label);
    g.append("rect").attr("x", 0).attr("y", 0)
      .attr("width", Math.max(0, edge - x.step() / 2)).attr("height", h)
      .attr("fill", C.panel).attr("opacity", 0.35);
    g.append("line")
      .attr("x1", edge - x.step() / 2).attr("x2", edge - x.step() / 2)
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", C.teal).attr("stroke-width", 1.8).attr("stroke-dasharray", "6,4");
    g.append("text")
      .attr("x", edge - x.step() / 2 + 6).attr("y", 14)
      .attr("fill", C.teal).style("font-size", "11px").text("bridge opens");
  }

  axes(g, x, y, w, h, null, yLabel, { xAxis: d3.axisBottom(x), rotateX: true });
  g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
    .attr("stroke", C.text).attr("stroke-width", 1.2);

  g.append("path")
    .datum(visible)
    .attr("fill", "none").attr("stroke", C.orange)
    .attr("stroke-width", 1.4).attr("opacity", 0.45)
    .attr("d", d3.line().x(d => x(d.label)).y(d => y(d.effect)));

  const pt = g.selectAll(".pt").data(visible, d => d.period).enter().append("g");
  pt.append("line")
    .attr("x1", d => x(d.label)).attr("x2", d => x(d.label))
    .attr("y1", d => y(d.effect - 1.96 * d.se))
    .attr("y2", d => y(d.effect + 1.96 * d.se))
    .attr("stroke", d => d.period >= firstPost ? C.orange : C.steel)
    .attr("stroke-width", 2);
  pt.append("circle")
    .attr("cx", d => x(d.label)).attr("cy", d => y(d.effect)).attr("r", 6)
    .attr("fill", d => d.period >= firstPost ? C.orange : C.steel);

  g.selectAll(".domain").remove();
}

/* ---------------------------------------------------------------- tab 4 */

function drawBands(sel, rows, yLabel) {
  clear(sel);
  const m = { t: 22, r: 24, b: 62, l: 70 };
  const { g, w, h } = frame(sel, 300, m);

  const order = ["near", "mid", "far"];
  const labels = { near: "Nearest\n(<84 km)", mid: "Middle\n(84–128 km)", far: "Farthest\n(128–270 km)" };
  const lo = Math.min(0, d3.min(rows, d => d.coef - 1.96 * d.se));
  const hi = Math.max(0, d3.max(rows, d => d.coef + 1.96 * d.se));
  const pad = (hi - lo) * 0.14;

  const x = d3.scaleBand().domain(order).range([0, w]).padding(0.42);
  const y = d3.scaleLinear().domain([lo - pad, hi + pad]).range([h, 0]);

  axes(g, x, y, w, h, null, yLabel, {
    xAxis: d3.axisBottom(x).tickFormat(d => labels[d].split("\n")[0]),
  });

  const byBand = new Map(rows.map(r => [r.band, r]));
  order.forEach(b => {
    const r = byBand.get(b);
    if (!r) return;
    const cx = x(b) + x.bandwidth() / 2;
    g.append("rect")
      .attr("x", x(b)).attr("width", x.bandwidth())
      .attr("y", y(Math.max(0, r.coef)))
      .attr("height", Math.abs(y(r.coef) - y(0)))
      .attr("fill", r.coef >= 0 ? C.teal : C.orange).attr("opacity", 0.85);
    g.append("line")
      .attr("x1", cx).attr("x2", cx)
      .attr("y1", y(r.coef - 1.96 * r.se)).attr("y2", y(r.coef + 1.96 * r.se))
      .attr("stroke", C.text).attr("stroke-width", 1.6);
    g.append("text")
      .attr("x", cx).attr("y", y(r.coef) + (r.coef >= 0 ? -12 : 20))
      .attr("text-anchor", "middle").attr("fill", C.text)
      .style("font-size", "12px").style("font-weight", "600")
      .text((r.coef > 0 ? "+" : "") + r.coef.toFixed(3));
    g.append("text")
      .attr("x", cx).attr("y", h + 34).attr("text-anchor", "middle")
      .attr("fill", C.muted).style("font-size", "10px")
      .text(labels[b].split("\n")[1]);
  });

  g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
    .attr("stroke", C.text).attr("stroke-width", 1.2);
  g.selectAll(".domain").remove();
}

function drawGradient(sel, gradients) {
  clear(sel);
  const m = { t: 18, r: 26, b: 52, l: 190 };
  const { g, w, h } = frame(sel, 190, m);

  const pretty = {
    sagr: "Agriculture share", sind: "Industry share",
    sserv: "Services share", ldensity: "Log population density",
  };
  const rows = gradients.filter(d => d.variable !== "ldensity");
  const maxAbs = d3.max(rows, d => Math.abs(d.slope_per_km)) * 1.25;
  const x = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([0, w]);
  const y = d3.scaleBand().domain(rows.map(d => pretty[d.variable])).range([0, h]).padding(0.4);

  axes(g, x, y, w, h, "Change per km of distance, 1991", null, { yAxis: d3.axisLeft(y) });
  g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
    .attr("stroke", C.text).attr("stroke-width", 1.2);

  g.selectAll(".b").data(rows).enter().append("rect")
    .attr("y", d => y(pretty[d.variable]))
    .attr("height", y.bandwidth())
    .attr("x", d => Math.min(x(0), x(d.slope_per_km)))
    .attr("width", d => Math.abs(x(d.slope_per_km) - x(0)))
    .attr("fill", d => d.slope_per_km >= 0 ? C.teal : C.orange).attr("opacity", 0.85);

  g.selectAll(".domain").remove();
}

/* ---------------------------------------------------------------- tab 5 */

function drawHonest(sel, rows, mSel) {
  clear(sel);
  const m = { t: 20, r: 28, b: 54, l: 66 };
  const { g, w, h } = frame(sel, 300, m);

  const x = d3.scaleLinear().domain([0, d3.max(rows, d => d.M)]).range([0, w]);
  const lo = d3.min(rows, d => d.lb), hi = d3.max(rows, d => d.ub);
  const pad = (hi - lo) * 0.18;
  const y = d3.scaleLinear().domain([lo - pad, hi + pad]).range([h, 0]);

  axes(g, x, y, w, h, "M — allowed violation, as a multiple of the largest pre-trend",
       "Effect on log(luminosity + 1)");

  g.append("path").datum(rows)
    .attr("fill", C.steel).attr("opacity", 0.32)
    .attr("d", d3.area().x(d => x(d.M)).y0(d => y(d.lb)).y1(d => y(d.ub)));
  [["lb", C.steel], ["ub", C.steel]].forEach(([k, c]) => {
    g.append("path").datum(rows).attr("fill", "none")
      .attr("stroke", c).attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.M)).y(d => y(d[k])));
  });

  g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
    .attr("stroke", C.orange).attr("stroke-width", 2).attr("stroke-dasharray", "7,5");
  g.append("text").attr("x", w - 4).attr("y", y(0) - 8)
    .attr("text-anchor", "end").attr("fill", C.orange)
    .style("font-size", "11px").text("no effect");

  const sel_ = rows.reduce((a, b) => Math.abs(b.M - mSel) < Math.abs(a.M - mSel) ? b : a);
  g.append("line")
    .attr("x1", x(sel_.M)).attr("x2", x(sel_.M)).attr("y1", 0).attr("y2", h)
    .attr("stroke", C.teal).attr("stroke-width", 2);
  g.append("circle").attr("cx", x(sel_.M)).attr("cy", y(sel_.lb)).attr("r", 5).attr("fill", C.teal);
  g.append("circle").attr("cx", x(sel_.M)).attr("cy", y(sel_.ub)).attr("r", 5).attr("fill", C.teal);

  g.selectAll(".domain").remove();
  return sel_;
}

function drawPlacebo(sel, rows) {
  clear(sel);
  const m = { t: 18, r: 26, b: 50, l: 210 };
  const { g, w, h } = frame(sel, Math.max(260, rows.length * 20 + 60), m);

  const t = rows.map(d => ({ ...d, z: d.coef / d.se,
    label: `${d.outcome} (${d.horizon})` }));
  const maxAbs = Math.max(3, d3.max(t, d => Math.abs(d.z)) * 1.15);
  const x = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([0, w]);
  const y = d3.scaleBand().domain(t.map(d => d.label)).range([0, h]).padding(0.3);

  axes(g, x, y, w, h, "t-statistic", null, { yAxis: d3.axisLeft(y) });

  [-1.96, 1.96].forEach(v => {
    g.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", 0).attr("y2", h)
      .attr("stroke", C.teal).attr("stroke-width", 1).attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.8);
  });
  g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
    .attr("stroke", C.text).attr("stroke-width", 1.3);

  const row = g.selectAll(".r").data(t).enter().append("g")
    .attr("transform", d => `translate(0,${y(d.label) + y.bandwidth() / 2})`);
  row.append("line")
    .attr("x1", d => x(d.z - 1.96)).attr("x2", d => x(d.z + 1.96))
    .attr("stroke", C.muted).attr("stroke-width", 1.4);
  row.append("circle").attr("cx", d => x(d.z)).attr("r", 4.5)
    .attr("fill", d => Math.abs(d.z) > 1.96 ? C.orange : C.steel);

  g.selectAll(".domain").remove();
}

function drawForensics(sel, rows) {
  clear(sel);
  const m = { t: 26, r: 30, b: 62, l: 190 };
  const { g, w, h } = frame(sel, 220, m);

  const t = rows.filter(d => d.outcome === "lmn").map(d => ({
    ...d, label: d.run.includes("published") ? "published (correct trim)" : "as shipped (bug)",
  }));
  const lo = d3.min(t, d => d.coef - 1.96 * d.se);
  const hi = d3.max(t, d => d.coef + 1.96 * d.se);
  const x = d3.scaleLinear().domain([Math.min(0, lo) - 0.1, hi + 0.1]).range([0, w]);
  const y = d3.scaleBand().domain(t.map(d => d.label)).range([0, h]).padding(0.5);

  axes(g, x, y, w, h, "Estimated effect on log(luminosity + 1)", null, { yAxis: d3.axisLeft(y) });
  g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
    .attr("stroke", C.text).attr("stroke-width", 1.3);

  const row = g.selectAll(".r").data(t).enter().append("g")
    .attr("transform", d => `translate(0,${y(d.label) + y.bandwidth() / 2})`);
  row.append("line")
    .attr("x1", d => x(d.coef - 1.96 * d.se)).attr("x2", d => x(d.coef + 1.96 * d.se))
    .attr("stroke", C.muted).attr("stroke-width", 2.2);
  row.append("circle").attr("cx", d => x(d.coef)).attr("r", 7)
    .attr("fill", d => d.label.includes("bug") ? C.orange : C.teal);
  row.append("text")
    .attr("x", d => x(d.coef)).attr("y", -16).attr("text-anchor", "middle")
    .attr("fill", C.text).style("font-size", "12px").style("font-weight", "600")
    .text(d => `${d.coef.toFixed(3)} (${d.se.toFixed(3)})`);
  row.append("text")
    .attr("x", d => x(d.coef)).attr("y", 22).attr("text-anchor", "middle")
    .attr("fill", C.muted).style("font-size", "11px")
    .text(d => `${d.units} upazilas · N = ${d.n.toLocaleString()}`);

  g.selectAll(".domain").remove();
}

function drawAudit(sel, rows) {
  clear(sel);
  const m = { t: 20, r: 26, b: 52, l: 66 };
  const { g, w, h } = frame(sel, 320, m);

  const lo = d3.min(rows, d => Math.min(d.stata_coef, d.python_coef));
  const hi = d3.max(rows, d => Math.max(d.stata_coef, d.python_coef));
  const pad = (hi - lo) * 0.08;
  const x = d3.scaleLinear().domain([lo - pad, hi + pad]).range([0, w]);
  const y = d3.scaleLinear().domain([lo - pad, hi + pad]).range([h, 0]);

  axes(g, x, y, w, h, "Published Stata coefficient", "Python replication");

  g.append("line")
    .attr("x1", x(lo - pad)).attr("y1", y(lo - pad))
    .attr("x2", x(hi + pad)).attr("y2", y(hi + pad))
    .attr("stroke", C.text).attr("stroke-width", 1.2).attr("stroke-dasharray", "5,4");

  const colors = { T1: C.steel, T2: C.orange, T3: C.teal, T4: C.muted };
  g.selectAll(".p").data(rows).enter().append("circle")
    .attr("cx", d => x(d.stata_coef)).attr("cy", d => y(d.python_coef))
    .attr("r", 4).attr("fill", d => colors[d.table] || C.steel)
    .attr("opacity", 0.8);

  Object.entries(colors).forEach(([k, c], i) => {
    g.append("circle").attr("cx", 12).attr("cy", 14 + i * 18).attr("r", 4).attr("fill", c);
    g.append("text").attr("x", 22).attr("y", 18 + i * 18)
      .attr("fill", C.muted).style("font-size", "11px").text("Table " + k[1]);
  });

  g.selectAll(".domain").remove();
}
