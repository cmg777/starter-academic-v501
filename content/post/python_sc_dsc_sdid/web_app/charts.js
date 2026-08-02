/* charts.js — D3 v7 drawing functions for the mlsynth ladder lab.

   Every function clears its container and redraws into a viewBox, so the
   charts scale with the page and never depend on measured pixel widths.
   Colours come from the site's dark palette. No external state, no fetch.

   Five of these (paths, gap, weights, ladder, placebo) are shared with the R
   edition's app at /post/r_sc_dsc_sdid/web_app/ so the two companions read as
   a pair. The rest are specific to what the Python post computed. */
(function (global) {
  "use strict";

  const C = {
    steel:  "#6a9bcc",
    orange: "#d97757",
    teal:   "#00d4c8",
    gold:   "#e8b04b",
    violet: "#b98cd6",
    green:  "#7fd17f",
    text:   "#e8ecf2",
    muted:  "#8b9dc3",
    grid:   "rgba(232,236,242,0.10)",
    donor:  "rgba(232,236,242,0.20)"
  };

  const METHOD_COLOUR = {
    DiD: C.muted, SC: C.steel, DSC: C.teal, SDID: C.orange,
    MASC: C.green, ASCM: C.violet
  };

  let tip = d3.select("body").select(".tooltip");
  if (tip.empty()) tip = d3.select("body").append("div").attr("class", "tooltip");

  function showTip(html, event) {
    tip.html(html).style("opacity", 1)
       .style("left", (event.pageX + 14) + "px")
       .style("top",  (event.pageY - 12) + "px");
  }
  const hideTip = () => tip.style("opacity", 0);

  function frame(sel, W, H, m) {
    const svg = d3.select(sel);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${W} ${H}`)
       .attr("preserveAspectRatio", "xMidYMid meet");
    return svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
  }

  function axes(g, x, y, iw, ih, yLabel, xTickFmt) {
    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(xTickFmt || d3.format("d")))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    g.append("g")
      .call(d3.axisLeft(y).ticks(6))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    g.append("g").attr("class", "gridlines")
      .selectAll("line").data(y.ticks(6)).join("line")
      .attr("x1", 0).attr("x2", iw)
      .attr("y1", d => y(d)).attr("y2", d => y(d))
      .attr("stroke", C.grid);
    if (yLabel) {
      g.append("text").attr("transform", "rotate(-90)")
        .attr("x", -ih / 2).attr("y", -46).attr("text-anchor", "middle")
        .attr("fill", C.muted).attr("font-size", 12).text(yLabel);
    }
  }

  // A left-hand category axis that wraps nothing and never clips: the label
  // column is sized by the caller, not guessed here.
  function catAxis(g, y) {
    g.append("g").call(d3.axisLeft(y))
      .call(s => s.selectAll("text").attr("fill", C.text).attr("font-size", 12))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
  }

  /* ---- 1. actual vs synthetic paths -------------------------------------- */
  function paths(sel, dates, uk, syn, treatDate, methodLabel) {
    const W = 900, H = 380, m = { t: 18, r: 20, b: 34, l: 62 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const x = d3.scaleLinear().domain(d3.extent(dates)).range([0, iw]);
    const y = d3.scaleLinear().domain(d3.extent(uk.concat(syn))).nice().range([ih, 0]);
    axes(g, x, y, iw, ih, "log real GDP");

    const post = dates.map((d, i) => ({ d, a: uk[i], b: syn[i] }))
                      .filter(p => p.d >= treatDate);
    g.append("path").datum(post)
      .attr("fill", C.orange).attr("opacity", 0.18)
      .attr("d", d3.area().x(p => x(p.d)).y0(p => y(p.a)).y1(p => y(p.b)));

    g.append("line").attr("x1", x(treatDate)).attr("x2", x(treatDate))
      .attr("y1", 0).attr("y2", ih)
      .attr("stroke", C.teal).attr("stroke-dasharray", "5,4");
    g.append("text").attr("x", x(treatDate) - 6).attr("y", 14)
      .attr("text-anchor", "end").attr("fill", C.teal).attr("font-size", 11)
      .text("referendum");

    const line = d3.line().x((d, i) => x(dates[i])).y(d => y(d));
    g.append("path").datum(syn).attr("fill", "none")
      .attr("stroke", C.steel).attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,4").attr("d", line);
    g.append("path").datum(uk).attr("fill", "none")
      .attr("stroke", C.orange).attr("stroke-width", 2.4).attr("d", line);

    const leg = g.append("g").attr("transform", "translate(12,10)");
    [["United Kingdom", C.orange], [`synthetic UK — ${methodLabel}`, C.steel]]
      .forEach((d, i) => {
        leg.append("line").attr("x1", 0).attr("x2", 22)
           .attr("y1", i * 17).attr("y2", i * 17)
           .attr("stroke", d[1]).attr("stroke-width", 2.4);
        leg.append("text").attr("x", 28).attr("y", i * 17 + 4)
           .attr("fill", C.text).attr("font-size", 12).text(d[0]);
      });
  }

  /* ---- 2. the gap series ------------------------------------------------- */
  function gap(sel, dates, gaps, treatDate, quarters, evalIdx) {
    const W = 900, H = 220, m = { t: 14, r: 20, b: 34, l: 62 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const x = d3.scaleLinear().domain(d3.extent(dates)).range([0, iw]);
    const y = d3.scaleLinear().domain(d3.extent(gaps)).nice().range([ih, 0]);
    axes(g, x, y, iw, ih, "gap (log points)");

    g.append("line").attr("x1", 0).attr("x2", iw)
      .attr("y1", y(0)).attr("y2", y(0)).attr("stroke", C.muted);
    g.append("line").attr("x1", x(treatDate)).attr("x2", x(treatDate))
      .attr("y1", 0).attr("y2", ih)
      .attr("stroke", C.teal).attr("stroke-dasharray", "5,4");
    g.append("path").datum(gaps).attr("fill", "none")
      .attr("stroke", C.steel).attr("stroke-width", 2)
      .attr("d", d3.line().x((d, i) => x(dates[i])).y(d => y(d)));

    evalIdx.forEach(i => {
      g.append("circle").attr("cx", x(dates[i])).attr("cy", y(gaps[i])).attr("r", 5)
        .attr("fill", C.orange)
        .on("mousemove", e => showTip(
          `<b>${quarters[i]}</b><br>shortfall ${(-100 * gaps[i]).toFixed(2)}%`, e))
        .on("mouseleave", hideTip);
    });
  }

  /* ---- 3. donor weights -------------------------------------------------- */
  function weights(sel, donors, w, methodLabel) {
    const rows = donors.map((d, i) => ({ country: d, w: w[i] }))
                       .filter(d => Math.abs(d.w) > 0.001)
                       .sort((a, b) => b.w - a.w);
    const W = 900, H = Math.max(220, 26 * rows.length + 60);
    const m = { t: 16, r: 60, b: 34, l: 140 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const lo = Math.min(0, d3.min(rows, d => d.w));
    const x = d3.scaleLinear().domain([lo, d3.max(rows, d => d.w)]).nice().range([0, iw]);
    const y = d3.scaleBand().domain(rows.map(d => d.country)).range([0, ih]).padding(0.22);

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(6))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    catAxis(g, y);

    g.selectAll("rect").data(rows).join("rect")
      .attr("x", d => x(Math.min(0, d.w)))
      .attr("y", d => y(d.country))
      .attr("width", d => Math.abs(x(d.w) - x(0)))
      .attr("height", y.bandwidth())
      .attr("fill", d => d.w < 0 ? C.orange : C.steel)
      .on("mousemove", (e, d) => showTip(
        `<b>${d.country}</b><br>${methodLabel} weight ${d.w.toFixed(4)}`, e))
      .on("mouseleave", hideTip);

    g.append("line").attr("x1", x(0)).attr("x2", x(0))
      .attr("y1", 0).attr("y2", ih).attr("stroke", C.muted);

    g.selectAll("text.val").data(rows).join("text").attr("class", "val")
      .attr("x", d => x(d.w) + (d.w < 0 ? -6 : 6))
      .attr("y", d => y(d.country) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", d => d.w < 0 ? "end" : "start")
      .attr("fill", C.muted).attr("font-size", 11)
      .text(d => d.w.toFixed(3));
  }

  /* ---- 4. SDID time weights ----------------------------------------------
     Shared verbatim with the R companion's chart of the same name. */
  function lambda(sel, quarters, lam) {
    const W = 900, H = 300, m = { t: 20, r: 20, b: 52, l: 66 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const x = d3.scaleBand().domain(d3.range(lam.length)).range([0, iw]).padding(0.15);
    const y = d3.scaleLinear().domain([0, Math.max(d3.max(lam), 1 / lam.length * 1.6)])
      .nice().range([ih, 0]);

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x)
        .tickValues(d3.range(0, lam.length, 8))
        .tickFormat(i => quarters[i]))
      .call(s => s.selectAll("text").attr("fill", C.muted)
                  .attr("transform", "rotate(-40)").attr("text-anchor", "end"))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    g.append("g").call(d3.axisLeft(y).ticks(5))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));

    const unif = 1 / lam.length;
    g.append("line").attr("x1", 0).attr("x2", iw)
      .attr("y1", y(unif)).attr("y2", y(unif))
      .attr("stroke", C.gold).attr("stroke-dasharray", "5,4");
    g.append("text").attr("x", 6).attr("y", y(unif) - 7)
      .attr("fill", C.gold).attr("font-size", 11)
      .text("uniform — what difference-in-differences assumes");

    g.selectAll("rect").data(lam.map((v, i) => ({ q: quarters[i], v, i })))
      .join("rect")
      .attr("x", d => x(d.i)).attr("y", d => y(d.v))
      .attr("width", x.bandwidth()).attr("height", d => ih - y(d.v))
      .attr("fill", d => d.v > 0.02 ? C.orange : C.steel)
      .on("mousemove", (e, d) => showTip(
        `<b>${d.q}</b><br>lambda ${d.v.toFixed(4)}` +
        (d.v > 0.02 ? "" : `<br><span class="dim">below the uniform weight</span>`), e))
      .on("mouseleave", hideTip);

    g.append("text").attr("x", -ih / 2).attr("y", -48).attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("time weight");
  }

  /* ---- 5. the ladder ----------------------------------------------------- */
  function ladder(sel, rows, key, born) {
    const W = 900, H = 340, m = { t: 26, r: 60, b: 42, l: 130 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const x = d3.scaleLinear().domain([0, d3.max(rows, d => d[key]) * 1.12]).range([0, iw]);
    const y = d3.scaleBand().domain(rows.map(d => d.method)).range([0, ih]).padding(0.24);

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(6))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    catAxis(g, y);

    g.selectAll("rect").data(rows).join("rect")
      .attr("x", 0).attr("y", d => y(d.method))
      .attr("width", d => x(d[key])).attr("height", y.bandwidth())
      .attr("fill", d => METHOD_COLOUR[d.method] || C.steel)
      .on("mousemove", (e, d) => showTip(
        `<b>${d.method}</b><br><code>${d.command}</code><br>` +
        `${d[key].toFixed(2)}% of GDP` +
        (d.r_post_2018Q4 != null && key === "loss_2018Q4"
          ? `<br><span class="dim">R edition: ${d.r_post_2018Q4.toFixed(2)}%</span>` : "") +
        (d.note ? `<br><span class="dim">${d.note}</span>` : ""), e))
      .on("mouseleave", hideTip);

    g.selectAll("text.v").data(rows).join("text").attr("class", "v")
      .attr("x", d => x(d[key]) + 7)
      .attr("y", d => y(d.method) + y.bandwidth() / 2 + 4)
      .attr("fill", C.text).attr("font-size", 12)
      .text(d => d[key].toFixed(2));

    g.append("line").attr("x1", x(born)).attr("x2", x(born))
      .attr("y1", -8).attr("y2", ih)
      .attr("stroke", C.gold).attr("stroke-dasharray", "5,4").attr("stroke-width", 1.6);
    g.append("text").attr("x", x(born)).attr("y", -12)
      .attr("text-anchor", "middle").attr("fill", C.gold).attr("font-size", 11)
      .text(`previously published: ${born}%`);

    g.append("text").attr("x", iw / 2).attr("y", ih + 36)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("estimated GDP shortfall (%)");
  }

  /* ---- 5. placebo tournament --------------------------------------------- */
  function placebo(sel, rows, stat) {
    const W = 900, H = 320, m = { t: 18, r: 46, b: 42, l: 130 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const sorted = rows.slice().sort((a, b) => a[stat] - b[stat]);
    const x = d3.scaleLinear().domain([0, d3.max(rows, d => d[stat]) * 1.15]).range([0, iw]);
    const y = d3.scaleBand().domain(sorted.map(d => d.method)).range([0, ih]).padding(0.24);
    const best = sorted[0].method;

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".4f")))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    catAxis(g, y);

    g.selectAll("rect").data(sorted).join("rect")
      .attr("x", 0).attr("y", d => y(d.method))
      .attr("width", d => x(d[stat])).attr("height", y.bandwidth())
      .attr("fill", d => d.method === best ? C.teal : C.steel)
      .on("mousemove", (e, d) => showTip(
        `<b>${d.method}</b><br>RMSE ${d.RMSE.toFixed(4)}` +
        `<br>mean abs ${d.MAB.toFixed(4)}<br>median abs ${d.MedAB.toFixed(4)}` +
        (d.published_RMSE != null
          ? `<br><span class="dim">published ${d.published_RMSE.toFixed(4)}</span>` : ""), e))
      .on("mouseleave", hideTip);

    g.selectAll("text.v").data(sorted).join("text").attr("class", "v")
      .attr("x", d => x(d[stat]) + 7)
      .attr("y", d => y(d.method) + y.bandwidth() / 2 + 4)
      .attr("fill", C.text).attr("font-size", 12)
      .text(d => d[stat].toFixed(4));

    g.append("text").attr("x", iw / 2).attr("y", ih + 36)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text(`placebo ${stat} over 20 artificial treatment dates (log points, lower is better)`);
  }

  /* ---- 6. a generic labelled horizontal bar chart -------------------------
     Used by the defaults dial, the covariate panel and the solver panel. The
     three want the same picture — a handful of named settings on one numeric
     axis with a reference line — and differ only in colouring and captions. */
  function hbars(sel, rows, opts) {
    const o = Object.assign({
      valueKey: "value", labelKey: "label", labelWidth: 250, rowHeight: 34,
      fmt: d3.format(".2f"), xLabel: "", refs: [], colour: () => C.steel,
      tooltip: null, minTop: 26, zoom: false
    }, opts);
    const W = 900, m = { t: o.minTop, r: 64, b: 44, l: o.labelWidth };
    const H = Math.max(180, o.rowHeight * rows.length + m.t + m.b);
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const vals = rows.map(d => d[o.valueKey]).concat(o.refs.map(r => r.at));
    // zoom:true drops the zero baseline. Use it when the differences the panel
    // exists to show are small relative to the level — zero-based bars would
    // render five near-identical rectangles.
    const x = d3.scaleLinear()
      .domain(o.zoom
        ? [d3.min(vals) - (d3.max(vals) - d3.min(vals)) * 0.35 - 1e-9,
           d3.max(vals) + (d3.max(vals) - d3.min(vals)) * 0.35 + 1e-9]
        : [0, d3.max(vals) * 1.14])
      .range([0, iw]);
    const y = d3.scaleBand().domain(rows.map(d => d[o.labelKey]))
      .range([0, ih]).padding(0.26);

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(o.fmt))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    catAxis(g, y);

    o.refs.forEach(r => {
      g.append("line").attr("x1", x(r.at)).attr("x2", x(r.at))
        .attr("y1", -8).attr("y2", ih)
        .attr("stroke", r.colour || C.gold)
        .attr("stroke-dasharray", "5,4").attr("stroke-width", 1.5);
      g.append("text").attr("x", x(r.at)).attr("y", -12)
        .attr("text-anchor", "middle").attr("fill", r.colour || C.gold)
        .attr("font-size", 11).text(r.label);
    });

    if (o.zoom) {
      const base = x.domain()[0];
      g.selectAll("line.stem").data(rows).join("line").attr("class", "stem")
        .attr("x1", x(base)).attr("x2", d => x(d[o.valueKey]))
        .attr("y1", d => y(d[o.labelKey]) + y.bandwidth() / 2)
        .attr("y2", d => y(d[o.labelKey]) + y.bandwidth() / 2)
        .attr("stroke", d => o.colour(d)).attr("stroke-width", 3)
        .attr("opacity", 0.45);
      g.selectAll("circle.dot").data(rows).join("circle").attr("class", "dot")
        .attr("cx", d => x(d[o.valueKey]))
        .attr("cy", d => y(d[o.labelKey]) + y.bandwidth() / 2)
        .attr("r", 7).attr("fill", d => o.colour(d))
        .on("mousemove", (e, d) => o.tooltip && showTip(o.tooltip(d), e))
        .on("mouseleave", hideTip);
    } else {
      g.selectAll("rect.bar").data(rows).join("rect").attr("class", "bar")
        .attr("x", 0).attr("y", d => y(d[o.labelKey]))
        .attr("width", d => x(d[o.valueKey])).attr("height", y.bandwidth())
        .attr("fill", d => o.colour(d))
        .on("mousemove", (e, d) => o.tooltip && showTip(o.tooltip(d), e))
        .on("mouseleave", hideTip);
    }

    g.selectAll("text.v").data(rows).join("text").attr("class", "v")
      .attr("x", d => x(d[o.valueKey]) + (o.zoom ? 12 : 7))
      .attr("y", d => y(d[o.labelKey]) + y.bandwidth() / 2 + 4)
      .attr("fill", C.text).attr("font-size", 12)
      .text(d => o.fmt(d[o.valueKey]));

    if (o.xLabel) {
      g.append("text").attr("x", iw / 2).attr("y", ih + 38)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
        .text(o.xLabel);
    }
  }

  /* ---- 7. how far each default moves the answer --------------------------
     One capsule per option, spanning the range it covers, against a shaded
     band showing the spread across the whole ladder. An option whose capsule
     is wider than the band moves the estimate more than the choice of
     estimator does. */
  function spans(sel, rows, band) {
    const W = 900, m = { t: 40, r: 60, b: 46, l: 190 };
    const H = 34 * rows.length + m.t + m.b;
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const lo = Math.min(d3.min(rows, d => d.lo), band.lo) - 0.15;
    const hi = Math.max(d3.max(rows, d => d.hi), band.hi) + 0.25;
    const x = d3.scaleLinear().domain([lo, hi]).range([0, iw]);
    const y = d3.scaleBand().domain(rows.map(d => d.label)).range([0, ih]).padding(0.38);

    g.append("rect")
      .attr("x", x(band.lo)).attr("width", x(band.hi) - x(band.lo))
      .attr("y", -10).attr("height", ih + 10)
      .attr("fill", C.gold).attr("opacity", 0.13);
    g.append("text").attr("x", (x(band.lo) + x(band.hi)) / 2).attr("y", -18)
      .attr("text-anchor", "middle").attr("fill", C.gold).attr("font-size", 11)
      .text(`the whole ladder spans ${(band.hi - band.lo).toFixed(2)}pp`);

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(7))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    catAxis(g, y);

    const rowsG = g.selectAll("g.span").data(rows).join("g").attr("class", "span")
      .attr("transform", d => `translate(0,${y(d.label) + y.bandwidth() / 2})`);

    rowsG.append("line")
      .attr("x1", d => x(d.lo)).attr("x2", d => x(d.hi))
      .attr("y1", 0).attr("y2", 0)
      .attr("stroke", d => d.hi - d.lo > band.hi - band.lo ? C.orange : C.steel)
      .attr("stroke-width", 9).attr("stroke-linecap", "round")
      .on("mousemove", (e, d) => showTip(
        `<b>${d.label}</b><br>${d.lo.toFixed(2)}% to ${d.hi.toFixed(2)}%` +
        `<br>span ${(d.hi - d.lo).toFixed(2)} percentage points` +
        `<br><span class="dim">${d.note}</span>`, e))
      .on("mouseleave", hideTip);

    rowsG.append("text")
      .attr("x", d => x(d.hi) + 10).attr("y", 4)
      .attr("fill", C.text).attr("font-size", 12)
      .text(d => (d.hi - d.lo).toFixed(2) + "pp");

    g.append("text").attr("x", iw / 2).attr("y", ih + 38)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("estimated GDP shortfall at 2018Q4 (%)");
  }

  /* ---- 8. the zeta sweep ------------------------------------------------- */
  function zetaCurve(sel, rows, idx, key) {
    const W = 900, H = 330, m = { t: 30, r: 30, b: 52, l: 66 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    // Pad the domain so the marker at zeta = 0 does not land on the y-axis, where a
    // dashed rule is invisible.
    const mx = d3.extent(rows, d => d.multiple);
    const pad = (mx[1] - mx[0]) * 0.035;
    const x = d3.scaleLinear().domain([mx[0] - pad, mx[1] + pad]).range([0, iw]);
    const y = d3.scaleLinear().domain(d3.extent(rows, d => d[key])).nice().range([ih, 0]);

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(d => d + "x"))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    g.append("g").call(d3.axisLeft(y).ticks(6))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    g.append("g").selectAll("line").data(y.ticks(6)).join("line")
      .attr("x1", 0).attr("x2", iw).attr("y1", d => y(d)).attr("y2", d => y(d))
      .attr("stroke", C.grid);

    g.append("path").datum(rows).attr("fill", "none")
      .attr("stroke", C.steel).attr("stroke-width", 2.2)
      .attr("d", d3.line().x(d => x(d.multiple)).y(d => y(d[key])));

    [{ at: 0, label: "zeta = 0 — the paper", colour: C.teal },
     { at: 1, label: "zeta = None — the default", colour: C.orange }
    ].forEach(mk => {
      g.append("line").attr("x1", x(mk.at)).attr("x2", x(mk.at))
        .attr("y1", 0).attr("y2", ih)
        .attr("stroke", mk.colour).attr("stroke-dasharray", "4,4");
      g.append("text").attr("x", x(mk.at) + (mk.at === 0 ? 6 : -6)).attr("y", -10)
        .attr("text-anchor", mk.at === 0 ? "start" : "end")
        .attr("fill", mk.colour).attr("font-size", 11).text(mk.label);
    });

    g.selectAll("circle.pt").data(rows).join("circle").attr("class", "pt")
      .attr("cx", d => x(d.multiple)).attr("cy", d => y(d[key])).attr("r", 3.4)
      .attr("fill", C.steel);

    const cur = rows[idx];
    g.append("circle").attr("cx", x(cur.multiple)).attr("cy", y(cur[key])).attr("r", 8)
      .attr("fill", C.gold);
    g.append("text").attr("x", x(cur.multiple)).attr("y", y(cur[key]) - 16)
      .attr("text-anchor", "middle").attr("fill", C.gold).attr("font-size", 12)
      .text(`${cur[key].toFixed(2)}%`);

    g.append("text").attr("x", iw / 2).attr("y", ih + 42)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("zeta, as a multiple of the value mlsynth computes for you");
    g.append("text").attr("x", -ih / 2).attr("y", -48).attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("shortfall (%)");
  }

  /* ---- 9. placebo in space ----------------------------------------------- */
  function spaghetti(sel, dates, gaps, treated, treatDate) {
    const W = 900, H = 330, m = { t: 18, r: 20, b: 40, l: 66 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const all = Object.values(gaps).flat();
    const x = d3.scaleLinear().domain(d3.extent(dates)).range([0, iw]);
    const y = d3.scaleLinear().domain(d3.extent(all)).nice().range([ih, 0]);
    axes(g, x, y, iw, ih, "gap (log points)");

    const line = d3.line().x((d, i) => x(dates[i])).y(d => y(d));
    Object.entries(gaps).forEach(([country, series]) => {
      if (country === treated) return;
      g.append("path").datum(series).attr("fill", "none")
        .attr("stroke", C.donor).attr("stroke-width", 1).attr("d", line)
        .on("mousemove", e => showTip(`<b>${country}</b><br>placebo donor`, e))
        .on("mouseleave", hideTip);
    });
    g.append("line").attr("x1", 0).attr("x2", iw)
      .attr("y1", y(0)).attr("y2", y(0)).attr("stroke", C.muted);
    g.append("line").attr("x1", x(treatDate)).attr("x2", x(treatDate))
      .attr("y1", 0).attr("y2", ih)
      .attr("stroke", C.teal).attr("stroke-dasharray", "5,4");
    g.append("path").datum(gaps[treated]).attr("fill", "none")
      .attr("stroke", C.orange).attr("stroke-width", 2.4).attr("d", line);

    const leg = g.append("g").attr("transform", "translate(12,10)");
    [[treated, C.orange], ["23 placebo donors", C.donor]].forEach((d, i) => {
      leg.append("line").attr("x1", 0).attr("x2", 22)
         .attr("y1", i * 17).attr("y2", i * 17)
         .attr("stroke", d[1]).attr("stroke-width", 2.2);
      leg.append("text").attr("x", 28).attr("y", i * 17 + 4)
         .attr("fill", C.text).attr("font-size", 12).text(d[0]);
    });
  }

  function ratios(sel, rows, treated) {
    const W = 900, m = { t: 18, r: 56, b: 44, l: 150 };
    const H = 21 * rows.length + m.t + m.b;
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const x = d3.scaleLinear().domain([0, d3.max(rows, d => d.ratio) * 1.1]).range([0, iw]);
    const y = d3.scaleBand().domain(rows.map(d => d.country)).range([0, ih]).padding(0.2);

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(6))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    g.append("g").call(d3.axisLeft(y))
      .call(s => s.selectAll("text")
        .attr("fill", d => d === treated ? C.orange : C.muted)
        .attr("font-size", 11))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));

    g.selectAll("rect").data(rows).join("rect")
      .attr("x", 0).attr("y", d => y(d.country))
      .attr("width", d => x(d.ratio)).attr("height", y.bandwidth())
      .attr("fill", d => d.country === treated ? C.orange : C.steel)
      .attr("opacity", d => d.country === treated ? 1 : 0.55)
      .on("mousemove", (e, d) => showTip(
        `<b>${d.country}</b><br>rank ${d.rank} of ${rows.length}` +
        `<br>post/pre RMSPE ${d.ratio.toFixed(2)}` +
        `<br><span class="dim">pre ${d.rmspe_pre.toFixed(5)} · ` +
        `post ${d.rmspe_post.toFixed(5)}</span>`, e))
      .on("mouseleave", hideTip);

    g.selectAll("text.v").data(rows.filter(d => d.country === treated))
      .join("text").attr("class", "v")
      .attr("x", d => x(d.ratio) + 7)
      .attr("y", d => y(d.country) + y.bandwidth() / 2 + 4)
      .attr("fill", C.orange).attr("font-size", 12)
      .text(d => d.ratio.toFixed(2));

    g.append("text").attr("x", iw / 2).attr("y", ih + 38)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("post-treatment RMSPE divided by pre-treatment RMSPE");
  }

  /* ---- 10. the SDID event study ------------------------------------------ */
  function eventStudy(sel, rows, halfWindow) {
    const data = rows.filter(d => Math.abs(d.event_time) <= halfWindow);
    const W = 900, H = 340, m = { t: 20, r: 24, b: 46, l: 66 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const x = d3.scaleLinear().domain(d3.extent(data, d => d.event_time)).range([0, iw]);
    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.ci_lower), d3.max(data, d => d.ci_upper)])
      .nice().range([ih, 0]);
    axes(g, x, y, iw, ih, "effect on log real GDP");

    g.append("path").datum(data)
      .attr("fill", C.steel).attr("opacity", 0.22)
      .attr("d", d3.area().x(d => x(d.event_time))
        .y0(d => y(d.ci_lower)).y1(d => y(d.ci_upper)));
    g.append("line").attr("x1", 0).attr("x2", iw)
      .attr("y1", y(0)).attr("y2", y(0)).attr("stroke", C.muted);
    g.append("line").attr("x1", x(0)).attr("x2", x(0))
      .attr("y1", 0).attr("y2", ih)
      .attr("stroke", C.teal).attr("stroke-dasharray", "5,4");
    g.append("path").datum(data).attr("fill", "none")
      .attr("stroke", C.orange).attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.event_time)).y(d => y(d.tau)));

    g.selectAll("circle").data(data).join("circle")
      .attr("cx", d => x(d.event_time)).attr("cy", d => y(d.tau)).attr("r", 3)
      .attr("fill", C.orange)
      .on("mousemove", (e, d) => showTip(
        `<b>${d.event_time > 0 ? "+" : ""}${d.event_time} quarters</b><br>` +
        `tau ${d.tau.toFixed(5)}<br>` +
        `<span class="dim">95% CI [${d.ci_lower.toFixed(4)}, ` +
        `${d.ci_upper.toFixed(4)}]</span>`, e))
      .on("mouseleave", hideTip);

    g.append("text").attr("x", iw / 2).attr("y", ih + 40)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("quarters since the referendum");
  }

  /* ---- 11. the inference menu -------------------------------------------- */
  function forest(sel, rows) {
    const usable = rows.filter(d => d.att != null);
    const W = 900, m = { t: 26, r: 40, b: 46, l: 150 };
    const H = 42 * usable.length + m.t + m.b;
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const lows = usable.map(d => d.ci_lower).filter(v => v != null);
    const highs = usable.map(d => d.ci_upper).filter(v => v != null);
    const x = d3.scaleLinear()
      .domain([d3.min(lows.concat(usable.map(d => d.att))) * 1.08,
               Math.max(0.002, d3.max(highs.concat([0])) * 1.08)])
      .range([0, iw]);
    const y = d3.scaleBand().domain(usable.map(d => d.method)).range([0, ih]).padding(0.4);

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".3f")))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    catAxis(g, y);

    g.append("line").attr("x1", x(0)).attr("x2", x(0))
      .attr("y1", -8).attr("y2", ih)
      .attr("stroke", C.gold).attr("stroke-dasharray", "5,4");
    g.append("text").attr("x", x(0)).attr("y", -12)
      .attr("text-anchor", "middle").attr("fill", C.gold).attr("font-size", 11)
      .text("no effect");

    const rowG = g.selectAll("g.row").data(usable).join("g").attr("class", "row")
      .attr("transform", d => `translate(0,${y(d.method) + y.bandwidth() / 2})`);

    rowG.filter(d => d.ci_lower != null).append("line")
      .attr("x1", d => x(d.ci_lower)).attr("x2", d => x(d.ci_upper))
      .attr("y1", 0).attr("y2", 0)
      .attr("stroke", C.steel).attr("stroke-width", 3).attr("stroke-linecap", "round");
    rowG.filter(d => d.ci_lower == null).append("text")
      .attr("x", d => x(d.att) + 14).attr("y", 4)
      .attr("fill", C.muted).attr("font-size", 11)
      .text("no interval — p-value only");

    rowG.append("circle").attr("cx", d => x(d.att)).attr("cy", 0).attr("r", 6)
      .attr("fill", C.orange)
      .on("mousemove", (e, d) => showTip(
        `<b>${d.method}</b><br>${d.reported_as}` +
        (d.p_value != null ? `<br>p = ${d.p_value.toFixed(4)}` : "") +
        (d.ci_lower != null
          ? `<br>95% CI [${d.ci_lower.toFixed(4)}, ${d.ci_upper.toFixed(4)}]` : "") +
        (d.seconds != null
          ? `<br><span class="dim">${d.seconds.toFixed(2)} s</span>` : ""), e))
      .on("mouseleave", hideTip);

    g.append("text").attr("x", iw / 2).attr("y", ih + 40)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("ATT on log real GDP, with 95% intervals where the method produces one");
  }

  global.Charts = {
    paths, gap, weights, ladder, placebo, hbars, spans, zetaCurve,
    lambda, spaghetti, ratios, eventStudy, forest, C
  };
})(window);
