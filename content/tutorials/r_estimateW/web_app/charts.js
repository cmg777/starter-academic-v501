/* charts.js — D3 renderers for the estimateW interactive lab.
   All charts are dark-theme, responsive via viewBox, and redraw on demand. */

const PAL = {
  bg: "#0f1729", grid: "#1f2b5e", text: "#c8d0e0", white: "#e8ecf2",
  steel: "#6a9bcc", orange: "#d97757", teal: "#00d4c8", muted: "#8892a8",
  group: { Southern: "#d97757", Northern: "#6a9bcc", Western: "#00d4c8",
           CEE: "#ff9aa2", Baltics: "#8b2f2f" }
};

function svgFrame(sel, w, h, m) {
  d3.select(sel).selectAll("*").remove();
  const svg = d3.select(sel).append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("role", "img");
  const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
  return { svg, g, iw: w - m.l - m.r, ih: h - m.t - m.b };
}

function axes(g, x, y, iw, ih, xlab, ylab, yfmt) {
  g.append("g").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(x).ticks(8))
    .call(s => { s.selectAll("text").attr("fill", PAL.text).style("font-size", "11px");
                 s.selectAll("line,path").attr("stroke", PAL.grid); });
  g.append("g")
    .call(d3.axisLeft(y).ticks(6).tickFormat(yfmt || null))
    .call(s => { s.selectAll("text").attr("fill", PAL.text).style("font-size", "11px");
                 s.selectAll("line,path").attr("stroke", PAL.grid); });
  g.append("g").attr("class", "gridlines")
    .selectAll("line").data(y.ticks(6)).join("line")
    .attr("x1", 0).attr("x2", iw).attr("y1", d => y(d)).attr("y2", d => y(d))
    .attr("stroke", PAL.grid).attr("stroke-width", 0.5).attr("opacity", 0.55);
  if (xlab) g.append("text").attr("x", iw / 2).attr("y", ih + 38)
    .attr("text-anchor", "middle").attr("fill", PAL.text).style("font-size", "12px").text(xlab);
  if (ylab) g.append("text").attr("transform", "rotate(-90)")
    .attr("x", -ih / 2).attr("y", -46).attr("text-anchor", "middle")
    .attr("fill", PAL.text).style("font-size", "12px").text(ylab);
}

function legend(g, items, x, y) {
  const lg = g.append("g").attr("transform", `translate(${x},${y})`);
  items.forEach((it, i) => {
    const row = lg.append("g").attr("transform", `translate(0,${i * 17})`);
    row.append("line").attr("x1", 0).attr("x2", 18).attr("y1", 0).attr("y2", 0)
      .attr("stroke", it.color).attr("stroke-width", 2.5)
      .attr("stroke-dasharray", it.dash || null);
    row.append("text").attr("x", 24).attr("y", 4).attr("fill", PAL.text)
      .style("font-size", "11px").text(it.label);
  });
}

/* ---------- Tab 1: reproduction audit ---------- */
function drawAudit(data) {
  const rows = data.audit.map(d => ({ ...d, absdiff: Math.max(d.diff, 1e-8) }));
  const m = { t: 14, r: 20, b: 46, l: 250 };
  const { g, iw, ih } = svgFrame("#chart-audit", 900, 300, m);
  const y = d3.scaleBand().domain(rows.map(d => d.q)).range([0, ih]).padding(0.28);
  const x = d3.scaleLog().domain([1e-8, 1e-4]).range([0, iw]).clamp(true);

  g.append("g").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(x).ticks(5, "~e"))
    .call(s => { s.selectAll("text").attr("fill", PAL.text).style("font-size", "10px");
                 s.selectAll("line,path").attr("stroke", PAL.grid); });
  g.append("g").call(d3.axisLeft(y))
    .call(s => { s.selectAll("text").attr("fill", PAL.text).style("font-size", "10px");
                 s.selectAll("line,path").attr("stroke", PAL.grid); });

  g.append("line").attr("x1", x(1e-5)).attr("x2", x(1e-5)).attr("y1", 0).attr("y2", ih)
    .attr("stroke", PAL.orange).attr("stroke-dasharray", "4 3").attr("stroke-width", 1.4);
  g.append("text").attr("x", x(1e-5) + 6).attr("y", 12).attr("fill", PAL.orange)
    .style("font-size", "10px").text("printed precision (1e−5)");

  g.selectAll("circle").data(rows).join("circle")
    .attr("cx", d => x(d.absdiff)).attr("cy", d => y(d.q) + y.bandwidth() / 2)
    .attr("r", 5).attr("fill", PAL.teal).attr("stroke", PAL.bg).attr("stroke-width", 1);

  g.append("text").attr("x", iw / 2).attr("y", ih + 40).attr("text-anchor", "middle")
    .attr("fill", PAL.text).style("font-size", "11px")
    .text("| our estimate − published value |   (log scale)");
}

/* ---------- Tab 2: prior over the neighbour count ---------- */
function drawPrior(data, kbar, showFlat) {
  const m = { t: 16, r: 24, b: 52, l: 66 };
  const { g, iw, ih } = svgFrame("#chart-prior", 720, 380, m);
  const cur = data.prior_curves[String(kbar)];
  const flat = data.prior_curves.flat;
  const series = [{ v: cur, color: PAL.teal }];
  if (showFlat) series.push({ v: flat, color: PAL.muted, dash: "4 3" });

  const x = d3.scaleLinear().domain([0, 89]).range([0, iw]);
  const ymax = d3.max(series, s => d3.max(s.v)) * 1.08;
  const y = d3.scaleLinear().domain([0, ymax]).range([ih, 0]);
  axes(g, x, y, iw, ih, "number of neighbours k", "prior probability", d3.format(".3f"));

  const line = d3.line().x((d, i) => x(i)).y(d => y(d)).curve(d3.curveMonotoneX);
  series.forEach(s => {
    g.append("path").datum(s.v).attr("fill", "none").attr("stroke", s.color)
      .attr("stroke-width", 2.2).attr("stroke-dasharray", s.dash || null).attr("d", line);
  });

  g.append("line").attr("x1", x(kbar)).attr("x2", x(kbar)).attr("y1", 0).attr("y2", ih)
    .attr("stroke", PAL.orange).attr("stroke-dasharray", "5 3").attr("stroke-width", 1.5);
  g.append("text").attr("x", x(kbar) + 6).attr("y", 14).attr("fill", PAL.orange)
    .style("font-size", "11px").text(`k̄ = ${kbar}`);

  if (showFlat) {
    g.append("line").attr("x1", x(44.5)).attr("x2", x(44.5)).attr("y1", 0).attr("y2", ih)
      .attr("stroke", PAL.muted).attr("stroke-dasharray", "2 3").attr("stroke-width", 1);
    g.append("text").attr("x", x(44.5) + 6).attr("y", 30).attr("fill", PAL.muted)
      .style("font-size", "11px").text("flat prior expects 44.5");
  }
  const items = [{ label: `anchored at k̄ = ${kbar}`, color: PAL.teal }];
  if (showFlat) items.push({ label: "flat: rep(1, n)", color: PAL.muted, dash: "4 3" });
  legend(g, items, iw - 170, 8);
}

/* ---------- Tab 3: composition vs threshold ---------- */
function drawThreshold(data, thr) {
  const m = { t: 16, r: 24, b: 52, l: 60 };
  const { g, iw, ih } = svgFrame("#chart-threshold", 720, 380, m);
  const rows = data.thresholds.filter(d => d.n > 0);
  const x = d3.scaleLinear().domain([0, 1]).range([0, iw]);
  const y = d3.scaleLinear().domain([0, 1]).range([ih, 0]);
  axes(g, x, y, iw, ih, "minimum posterior link probability", "share of surviving links",
       d3.format(".0%"));

  const series = [
    { key: "same_country", color: PAL.orange, label: "same country", base: data.baseline.same_country },
    { key: "queen",        color: PAL.teal,   label: "shares a border", base: data.baseline.queen },
    { key: "knn",          color: PAL.steel,  label: "7-nearest neighbour", base: data.baseline.knn }
  ];
  series.forEach(s => {
    const line = d3.line().x(d => x(d.t)).y(d => y(d[s.key])).curve(d3.curveMonotoneX);
    g.append("path").datum(rows).attr("fill", "none").attr("stroke", s.color)
      .attr("stroke-width", 2.2).attr("d", line);
    g.append("line").attr("x1", 0).attr("x2", iw).attr("y1", y(s.base)).attr("y2", y(s.base))
      .attr("stroke", s.color).attr("stroke-dasharray", "3 4").attr("stroke-width", 1).attr("opacity", 0.7);
  });

  g.append("line").attr("x1", x(thr)).attr("x2", x(thr)).attr("y1", 0).attr("y2", ih)
    .attr("stroke", PAL.white).attr("stroke-width", 1.2).attr("opacity", 0.65);

  legend(g, series.map(s => ({ label: s.label, color: s.color })), 12, 8);
}

/* ---------- Tab 3: degree by region ---------- */
function drawDegree(data) {
  const order = ["Southern", "Northern", "Western", "CEE", "Baltics"];
  const rows = data.degree.slice().sort((a, b) =>
    order.indexOf(a.group) - order.indexOf(b.group) ||
    a.country.localeCompare(b.country) || a.id.localeCompare(b.id));
  const m = { t: 16, r: 20, b: 68, l: 56 };
  const { g, iw, ih } = svgFrame("#chart-degree", 960, 330, m);
  const x = d3.scaleBand().domain(rows.map(d => d.id)).range([0, iw]).padding(0.35);
  const y = d3.scaleLinear().domain([0, d3.max(rows, d => d.hi) * 1.05]).range([ih, 0]);

  g.append("g").call(d3.axisLeft(y).ticks(6))
    .call(s => { s.selectAll("text").attr("fill", PAL.text).style("font-size", "11px");
                 s.selectAll("line,path").attr("stroke", PAL.grid); });
  g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x))
    .call(s => { s.selectAll("text").attr("fill", PAL.text).style("font-size", "7px")
                   .attr("transform", "rotate(-90)").attr("text-anchor", "end")
                   .attr("dx", "-0.6em").attr("dy", "-0.5em");
                 s.selectAll("line,path").attr("stroke", PAL.grid); });

  g.append("line").attr("x1", 0).attr("x2", iw).attr("y1", y(7)).attr("y2", y(7))
    .attr("stroke", PAL.orange).attr("stroke-dasharray", "5 3").attr("stroke-width", 1.3);
  g.append("text").attr("x", 4).attr("y", y(7) - 5).attr("fill", PAL.orange)
    .style("font-size", "10px").text("prior anchor k̄ = 7");

  g.selectAll("line.ci").data(rows).join("line").attr("class", "ci")
    .attr("x1", d => x(d.id) + x.bandwidth() / 2).attr("x2", d => x(d.id) + x.bandwidth() / 2)
    .attr("y1", d => y(d.lo)).attr("y2", d => y(d.hi))
    .attr("stroke", d => PAL.group[d.group] || PAL.steel).attr("stroke-width", 1.4).attr("opacity", 0.55);
  g.selectAll("circle").data(rows).join("circle")
    .attr("cx", d => x(d.id) + x.bandwidth() / 2).attr("cy", d => y(d.mean)).attr("r", 2.6)
    .attr("fill", d => PAL.group[d.group] || PAL.steel)
    .append("title").text(d => `${d.id} (${d.country}) — mean ${d.mean}, 95% [${d.lo}, ${d.hi}], queen ${d.queen}`);

  const lg = g.append("g").attr("transform", `translate(${iw - 340},4)`);
  order.forEach((grp, i) => {
    const row = lg.append("g").attr("transform", `translate(${i * 68},0)`);
    row.append("circle").attr("r", 4).attr("fill", PAL.group[grp]);
    row.append("text").attr("x", 8).attr("y", 4).attr("fill", PAL.text)
      .style("font-size", "10px").text(grp);
  });
}

/* ---------- Tab 3: top links table ---------- */
// Values come from our own generated results.json, but the table is still built
// with DOM nodes and textContent rather than innerHTML, so no field can inject
// markup regardless of what ends up in the data file.
function drawLinksTable(data, thr) {
  const el = document.getElementById("table-links");
  el.replaceChildren();
  const rows = data.top_links.filter(d => d.pip >= thr).slice(0, 15);
  if (!rows.length) {
    const p = document.createElement("p");
    p.className = "note";
    p.textContent = `No links reach a posterior probability of ${thr.toFixed(2)}.`;
    el.appendChild(p);
    return;
  }
  const table = document.createElement("table");
  table.className = "link-table";
  const thead = table.createTHead().insertRow();
  ["#", "From", "To", "Weight", "P(link)", "Same country", "Shares border", "Distance"]
    .forEach(h => { const th = document.createElement("th"); th.textContent = h; thead.appendChild(th); });
  const tbody = table.createTBody();
  rows.forEach((d, i) => {
    const tr = tbody.insertRow();
    const cells = [
      [String(i + 1), null], [d.from, null], [d.to, null],
      [d.w.toFixed(4), null], [d.pip.toFixed(2), null],
      [d.same_country ? "yes" : "no", d.same_country ? "yes" : "no"],
      [d.queen ? "yes" : "no", d.queen ? "yes" : "no"],
      [`${d.dist.toLocaleString()} km`, null]
    ];
    cells.forEach(([txt, cls]) => {
      const td = tr.insertCell();
      td.textContent = txt;
      if (cls) td.className = cls;
    });
  });
  el.appendChild(table);
}

/* ---------- Tab 4: three maps ---------- */
function drawMaps(data, variable) {
  const rows = data.three_maps.filter(d => d.var === variable);
  const maps = rows.map(d => d.map);
  const kinds = ["direct", "indirect", "total"];
  const m = { t: 16, r: 20, b: 60, l: 78 };
  const { g, iw, ih } = svgFrame("#chart-maps", 760, 360, m);

  const x0 = d3.scaleBand().domain(kinds).range([0, iw]).padding(0.22);
  const x1 = d3.scaleBand().domain(maps).range([0, x0.bandwidth()]).padding(0.12);
  const vals = rows.flatMap(d => kinds.map(k => d[k]));
  const lo = Math.min(0, d3.min(vals)), hi = Math.max(0, d3.max(vals));
  const pad = (hi - lo) * 0.12;
  const y = d3.scaleLinear().domain([lo - pad, hi + pad]).range([ih, 0]);

  g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".4f")))
    .call(s => { s.selectAll("text").attr("fill", PAL.text).style("font-size", "10px");
                 s.selectAll("line,path").attr("stroke", PAL.grid); });
  g.append("g").attr("transform", `translate(0,${y(0)})`).call(d3.axisBottom(x0))
    .call(s => { s.selectAll("text").attr("fill", PAL.text).style("font-size", "12px")
                   .attr("dy", hi > 0 ? "1.4em" : "-1em");
                 s.selectAll("line,path").attr("stroke", PAL.grid); });

  const colors = { "Estimated W": PAL.teal, "Queen contiguity": PAL.steel,
                   "7-nearest-neighbour": PAL.orange };
  kinds.forEach(k => {
    g.selectAll(`rect.${k}`).data(rows).join("rect").attr("class", k)
      .attr("x", d => x0(k) + x1(d.map)).attr("width", x1.bandwidth())
      .attr("y", d => y(Math.max(0, d[k]))).attr("height", d => Math.abs(y(d[k]) - y(0)))
      .attr("fill", d => colors[d.map])
      .append("title").text(d => `${d.map} — ${k}: ${d[k].toPrecision(4)}`);
  });

  legend(g, maps.map(mm => ({ label: mm, color: colors[mm] })), 8, 6);
  g.append("text").attr("transform", "rotate(-90)").attr("x", -ih / 2).attr("y", -60)
    .attr("text-anchor", "middle").attr("fill", PAL.text).style("font-size", "12px")
    .text("impact on annual growth");
}

/* ---------- Tab 4: AUC comparison ---------- */
function drawAuc(data) {
  const label = { same_country: "Same country", queen_contiguity: "Queen contiguity",
                  same_group: "Same supranational group", knn7: "7-nearest neighbours" };
  const rows = data.comparators.filter(d => d.auc != null)
    .map(d => ({ ...d, label: label[d.name] || d.name }))
    .sort((a, b) => b.auc - a.auc);
  const m = { t: 14, r: 60, b: 46, l: 190 };
  const { g, iw, ih } = svgFrame("#chart-auc", 780, 230, m);
  const y = d3.scaleBand().domain(rows.map(d => d.label)).range([0, ih]).padding(0.3);
  const x = d3.scaleLinear().domain([0.5, 0.8]).range([0, iw]);

  g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(6))
    .call(s => { s.selectAll("text").attr("fill", PAL.text).style("font-size", "11px");
                 s.selectAll("line,path").attr("stroke", PAL.grid); });
  g.append("g").call(d3.axisLeft(y))
    .call(s => { s.selectAll("text").attr("fill", PAL.text).style("font-size", "11px");
                 s.selectAll("line,path").attr("stroke", PAL.grid); });

  g.selectAll("rect").data(rows).join("rect")
    .attr("x", 0).attr("y", d => y(d.label)).attr("height", y.bandwidth())
    .attr("width", d => x(d.auc))
    .attr("fill", (d, i) => i === 0 ? PAL.orange : PAL.steel).attr("opacity", 0.9);
  g.selectAll("text.val").data(rows).join("text").attr("class", "val")
    .attr("x", d => x(d.auc) + 8).attr("y", d => y(d.label) + y.bandwidth() / 2 + 4)
    .attr("fill", PAL.white).style("font-size", "12px").style("font-weight", "600")
    .text(d => d.auc.toFixed(3));
  g.append("text").attr("x", iw / 2).attr("y", ih + 38).attr("text-anchor", "middle")
    .attr("fill", PAL.text).style("font-size", "11px")
    .text("area under the ROC curve");
}
