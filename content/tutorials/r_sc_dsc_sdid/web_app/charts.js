/* charts.js — D3 v7 drawing functions for the synthetic-control ladder lab.
   Every function clears its container and redraws responsively (viewBox).
   Colours match the site palette. No external state. */
(function (global) {
  "use strict";

  const C = {
    steel:  "#6a9bcc",
    orange: "#d97757",
    teal:   "#00d4c8",
    gold:   "#e8b04b",
    violet: "#b98cd6",
    text:   "#e8ecf2",
    muted:  "#8b9dc3",
    grid:   "rgba(232,236,242,0.10)",
    donor:  "rgba(232,236,242,0.20)"
  };

  const METHOD_COLOUR = {
    DiD: C.orange, SC: C.steel, DSC: C.teal, SDID: C.gold,
    MASC: C.violet, ASCM: C.muted
  };

  let tip = d3.select("body").select(".tooltip");
  if (tip.empty()) tip = d3.select("body").append("div").attr("class", "tooltip");

  function showTip(html, event) {
    tip.html(html).style("opacity", 1)
       .style("left", (event.pageX + 14) + "px")
       .style("top",  (event.pageY - 12) + "px");
  }
  const hideTip = () => tip.style("opacity", 0);

  // Prepare an <svg> with a viewBox and return the plotting group plus scales' extent.
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
        .attr("x", -ih / 2).attr("y", -44).attr("text-anchor", "middle")
        .attr("fill", C.muted).attr("font-size", 12).text(yLabel);
    }
  }

  /* ---- 1. actual vs synthetic paths ------------------------------------- */
  function paths(sel, dates, uk, syn, treatDate, methodLabel) {
    const W = 900, H = 380, m = { t: 18, r: 20, b: 34, l: 62 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const x = d3.scaleLinear().domain(d3.extent(dates)).range([0, iw]);
    const all = uk.concat(syn);
    const y = d3.scaleLinear().domain(d3.extent(all)).nice().range([ih, 0]);
    axes(g, x, y, iw, ih, "log real GDP index");

    // shade the post-treatment gap
    const post = dates.map((d, i) => ({ d, a: uk[i], b: syn[i] })).filter(p => p.d >= treatDate);
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
        leg.append("line").attr("x1", 0).attr("x2", 22).attr("y1", i * 17).attr("y2", i * 17)
           .attr("stroke", d[1]).attr("stroke-width", 2.4);
        leg.append("text").attr("x", 28).attr("y", i * 17 + 4)
           .attr("fill", C.text).attr("font-size", 12).text(d[0]);
      });
  }

  /* ---- 2. the gap series ------------------------------------------------ */
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

  /* ---- 3. donor weights ------------------------------------------------- */
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
    g.append("g").call(d3.axisLeft(y))
      .call(s => s.selectAll("text").attr("fill", C.text).attr("font-size", 12))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));

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

  /* ---- 4. SDID time weights -------------------------------------------- */
  function lambda(sel, quarters, lam) {
    const W = 900, H = 280, m = { t: 20, r: 20, b: 48, l: 62 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const x = d3.scaleBand().domain(d3.range(lam.length)).range([0, iw]).padding(0.15);
    const y = d3.scaleLinear().domain([0, d3.max(lam)]).nice().range([ih, 0]);

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
    g.append("line").attr("x1", 0).attr("x2", iw).attr("y1", y(unif)).attr("y2", y(unif))
      .attr("stroke", C.gold).attr("stroke-dasharray", "5,4");
    g.append("text").attr("x", 6).attr("y", y(unif) - 6)
      .attr("fill", C.gold).attr("font-size", 11)
      .text("uniform — the two-way fixed-effects correction");

    const bars = lam.map((v, i) => ({ q: quarters[i], v: v, i: i }));
    g.selectAll("rect").data(bars).join("rect")
      .attr("x", d => x(d.i)).attr("y", d => y(d.v))
      .attr("width", x.bandwidth()).attr("height", d => ih - y(d.v))
      .attr("fill", d => d.v > 0.02 ? C.orange : C.steel)
      .on("mousemove", (e, d) => showTip(
        `<b>${d.q}</b><br>lambda ${d.v.toFixed(4)}`, e))
      .on("mouseleave", hideTip);

    g.append("text").attr("x", -ih / 2).attr("y", -44).attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("lambda");
  }

  /* ---- 5. the ladder ---------------------------------------------------- */
  function ladder(sel, rows, key, born) {
    const W = 900, H = 340, m = { t: 18, r: 60, b: 42, l: 130 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const x = d3.scaleLinear().domain([0, d3.max(rows, d => d[key]) * 1.12]).range([0, iw]);
    const y = d3.scaleBand().domain(rows.map(d => d.method)).range([0, ih]).padding(0.24);

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(6))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    g.append("g").call(d3.axisLeft(y))
      .call(s => s.selectAll("text").attr("fill", C.text).attr("font-size", 12))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));

    g.selectAll("rect").data(rows).join("rect")
      .attr("x", 0).attr("y", d => y(d.method))
      .attr("width", d => x(d[key])).attr("height", y.bandwidth())
      .attr("fill", d => METHOD_COLOUR[d.family] || C.steel)
      .on("mousemove", (e, d) => showTip(
        `<b>${d.method}</b><br>${d[key].toFixed(2)}% of GDP` +
        (d.note ? `<br><span class="dim">${d.note}</span>` : ""), e))
      .on("mouseleave", hideTip);

    g.selectAll("text.v").data(rows).join("text").attr("class", "v")
      .attr("x", d => x(d[key]) + 7)
      .attr("y", d => y(d.method) + y.bandwidth() / 2 + 4)
      .attr("fill", C.text).attr("font-size", 12)
      .text(d => d[key].toFixed(2));

    g.append("line").attr("x1", x(born)).attr("x2", x(born))
      .attr("y1", -6).attr("y2", ih)
      .attr("stroke", C.orange).attr("stroke-dasharray", "5,4").attr("stroke-width", 1.6);
    g.append("text").attr("x", x(born)).attr("y", -8)
      .attr("text-anchor", "middle").attr("fill", C.orange).attr("font-size", 11)
      .text(`previously published: ${born}%`);

    g.append("text").attr("x", iw / 2).attr("y", ih + 36)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("estimated GDP shortfall (%)");
  }

  /* ---- 6. placebo tournament -------------------------------------------- */
  function placebo(sel, rows, stat) {
    const W = 900, H = 320, m = { t: 18, r: 40, b: 42, l: 130 };
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
    g.append("g").call(d3.axisLeft(y))
      .call(s => s.selectAll("text").attr("fill", C.text).attr("font-size", 12))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));

    g.selectAll("rect").data(sorted).join("rect")
      .attr("x", 0).attr("y", d => y(d.method))
      .attr("width", d => x(d[stat])).attr("height", y.bandwidth())
      .attr("fill", d => d.method === best ? C.teal : C.steel)
      .on("mousemove", (e, d) => showTip(
        `<b>${d.method}</b><br>RMSE ${d.RMSE.toFixed(4)}` +
        `<br>mean abs ${d.MAB.toFixed(4)}<br>median abs ${d.MedAB.toFixed(4)}`, e))
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

  /* ---- 7. solver convergence -------------------------------------------- */
  function solver(sel, rows) {
    const fw    = rows.filter(d => d.iterations != null);
    const exact = rows.find(d => d.iterations == null);
    const W = 900, H = 300, m = { t: 22, r: 30, b: 46, l: 62 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const g = frame(sel, W, H, m);

    const x = d3.scaleLog().domain(d3.extent(fw, d => d.iterations)).range([0, iw]);
    const ys = fw.map(d => d.loss_2018Q4).concat([exact.loss_2018Q4]);
    const y = d3.scaleLinear().domain(d3.extent(ys)).nice().range([ih, 0]);

    g.append("g").attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(6, "~s"))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));
    g.append("g").call(d3.axisLeft(y).ticks(5))
      .call(s => s.selectAll("text").attr("fill", C.muted))
      .call(s => s.selectAll("line,path").attr("stroke", C.muted));

    g.append("line").attr("x1", 0).attr("x2", iw)
      .attr("y1", y(exact.loss_2018Q4)).attr("y2", y(exact.loss_2018Q4))
      .attr("stroke", C.teal).attr("stroke-dasharray", "5,4");
    g.append("text").attr("x", 6).attr("y", y(exact.loss_2018Q4) - 7)
      .attr("fill", C.teal).attr("font-size", 11)
      .text(`exact optimum: ${exact.loss_2018Q4.toFixed(3)}%`);

    g.append("path").datum(fw).attr("fill", "none")
      .attr("stroke", C.steel).attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.iterations)).y(d => y(d.loss_2018Q4)));

    g.selectAll("circle").data(fw).join("circle")
      .attr("cx", d => x(d.iterations)).attr("cy", d => y(d.loss_2018Q4))
      .attr("r", d => d.iterations === 10000 ? 7 : 4)
      .attr("fill", d => d.iterations === 10000 ? C.orange : C.steel)
      .on("mousemove", (e, d) => showTip(
        `<b>${d3.format(",")(d.iterations)} iterations</b><br>` +
        `estimate ${d.loss_2018Q4.toFixed(3)}%<br>` +
        `<span class="dim">sum of squares ${d.ssr.toExponential(4)}</span>`, e))
      .on("mouseleave", hideTip);

    const def = fw.find(d => d.iterations === 10000);
    if (def) {
      g.append("text").attr("x", x(def.iterations)).attr("y", y(def.loss_2018Q4) - 14)
        .attr("text-anchor", "middle").attr("fill", C.orange).attr("font-size", 11)
        .text("package default — the published number");
    }

    g.append("text").attr("x", iw / 2).attr("y", ih + 38)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("Frank-Wolfe iterations (log scale)");
    g.append("text").attr("x", -ih / 2).attr("y", -44).attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("estimate (%)");
  }

  global.Charts = { paths, gap, weights, lambda, ladder, placebo, solver, METHOD_COLOUR };
})(window);
