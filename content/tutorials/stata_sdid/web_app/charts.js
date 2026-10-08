// charts.js — D3 chart builders for the Synthetic Difference-in-Differences
// (SDID) web app on California's Proposition 99.
//
// Every builder takes a DOM container, draws an <svg> with a viewBox so it
// scales responsively, and returns an object with an `update(...)` method so
// subsequent control changes patch the existing chart instead of recreating
// the whole DOM each time. All data arrives as plain arrays of objects that
// app.js parses from the CSVs in data/ via d3.csv — charts.js never fetches.

(function () {
  "use strict";

  // Concept -> color. California / observed = warm orange; control / synthetic
  // = steel blue; SDID accent = teal; ink for neutral gap strokes.
  const C = {
    bg:     "#1f2b5e",
    panel:  "#182447",
    steel:  "#6a9bcc",  // synthetic control / control units
    orange: "#d97757",  // California (observed / treated)
    teal:   "#00d4c8",  // SDID
    ink:    "#141413",
    text:   "#e8ecf2",
    muted:  "#8b9dc3",
    line:   "rgba(232, 236, 242, 0.18)",
    grid:   "rgba(232, 236, 242, 0.08)",
    faint:  "rgba(232, 236, 242, 0.15)",
  };

  // Per-method styling for the counterfactual line + readouts. The keys match
  // the method ids used throughout app.js ("did" | "sc" | "sdid").
  const METHODS = {
    did:  { label: "DiD counterfactual",              color: C.muted,  dash: "6 5", series: "did_cf"   },
    sc:   { label: "Synthetic control (synth2)",      color: C.steel,  dash: "5 4", series: "sc_synth" },
    sdid: { label: "SDID counterfactual",             color: C.teal,   dash: null,  series: "sdid_cf"  },
  };

  const TREAT_YEAR = 1989;

  function ensureSVG(container, viewBoxW, viewBoxH) {
    container.innerHTML = "";
    return d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxW} ${viewBoxH}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img");
  }

  function styleAxes(g) {
    g.selectAll(".domain").attr("stroke", C.muted);
    g.selectAll(".tick line").attr("stroke", C.muted);
    g.selectAll(".tick text").attr("fill", C.muted).attr("font-size", 11);
  }

  // ------------------------------------------------------------------
  // 1. Counterfactual line chart (Weighting-scheme explorer + Counterfactual
  //    tab). Draws California observed (thick orange) against one chosen
  //    counterfactual, with a dashed 1989 reference line and a shaded
  //    post-treatment band.
  //
  //    series: [{year, ca_actual, did_cf, sc_synth, sdid_cf}, ...]
  //    methodId: "did" | "sc" | "sdid"
  // ------------------------------------------------------------------
  function counterfactual_lines(container) {
    const W = 760, H = 418;
    const margin = { top: 22, right: 26, bottom: 84, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    svg.attr("aria-label", "Cigarette packs per capita in California versus its counterfactual, 1970 to 2000.");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");
    const shade  = g.append("rect").attr("y", 0).attr("height", h)
      .attr("fill", "rgba(217, 119, 87, 0.06)");
    const refLine = g.append("line").attr("y1", 0).attr("y2", h)
      .attr("stroke", C.muted).attr("stroke-width", 1).attr("stroke-dasharray", "4 4");
    const refLabel = g.append("text").attr("y", 12).attr("fill", C.muted)
      .attr("font-size", 11).attr("text-anchor", "middle").text("Prop 99 (1989)");

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 38})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Year");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-42})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Cigarette packs per capita");

    const cfPath   = g.append("path").attr("fill", "none").attr("stroke-width", 2.4);
    const caPath   = g.append("path").attr("fill", "none")
      .attr("stroke", C.orange).attr("stroke-width", 3.2);
    const legend   = g.append("g");

    function update(series, methodId) {
      const m = METHODS[methodId] || METHODS.sdid;
      const years = series.map(d => d.year);
      const x = d3.scaleLinear().domain(d3.extent(years)).range([0, w]);
      const ys = series.flatMap(d => [d.ca_actual, d[m.series]]);
      const yMin = Math.min(0, d3.min(ys));
      const yMax = d3.max(ys);
      const y = d3.scaleLinear().domain([Math.max(0, yMin), yMax * 1.05]).nice().range([h, 0]);

      xAxisG.call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d")));
      yAxisG.call(d3.axisLeft(y).ticks(6));
      styleAxes(g);

      // Shade the post-1989 region.
      shade.attr("x", x(TREAT_YEAR)).attr("width", Math.max(0, w - x(TREAT_YEAR)));
      refLine.attr("x1", x(TREAT_YEAR)).attr("x2", x(TREAT_YEAR));
      refLabel.attr("x", x(TREAT_YEAR));

      const lineGen = d3.line().x(d => x(d.year)).curve(d3.curveMonotoneX);
      caPath.attr("d", lineGen.y(d => y(d.ca_actual))(series));
      cfPath
        .attr("stroke", m.color)
        .attr("stroke-dasharray", m.dash)
        .attr("d", lineGen.y(d => y(d[m.series]))(series));

      // Legend: a horizontal, centered row BELOW the x-axis (clear of the
      // falling lines). Widths are estimated (not measured) because these charts
      // can be rendered while their tab is display:none, where getBBox() == 0.
      legend.selectAll("*").remove();
      const items = [
        { label: "California (observed)", color: C.orange, sw: 3.2, dash: null },
        { label: m.label,                 color: m.color,  sw: 2.4, dash: m.dash },
      ];
      const swLen = 26, txtGap = 7, itemGap = 28, fs = 12;
      const estW = s => s.length * 6.6;
      const widths = items.map(it => swLen + txtGap + estW(it.label));
      const totalW = widths.reduce((a, b) => a + b, 0) + itemGap * (items.length - 1);
      legend.attr("transform", `translate(0,${h + 60})`);
      let cx = Math.max(0, (w - totalW) / 2);
      items.forEach((it, i) => {
        const ig = legend.append("g").attr("transform", `translate(${cx},0)`);
        ig.append("line").attr("x1", 0).attr("x2", swLen).attr("y1", 0).attr("y2", 0)
          .attr("stroke", it.color).attr("stroke-width", it.sw).attr("stroke-dasharray", it.dash);
        ig.append("text").attr("x", swLen + txtGap).attr("y", 4)
          .attr("fill", C.text).attr("font-size", fs).text(it.label);
        cx += widths[i] + itemGap;
      });
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // 2. Gap chart (Counterfactual & gap tab). Plots the treatment-effect gap
  //    (California minus the chosen counterfactual) as a filled area below a
  //    zero line, with the post-1989 region emphasised and the ATT labelled.
  //
  //    rows: [{year, gap}, ...]
  //    att: number (e.g. -15.6) ; methodId for coloring.
  // ------------------------------------------------------------------
  function gap_area(container) {
    const W = 760, H = 300;
    const margin = { top: 22, right: 26, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    svg.attr("aria-label", "Estimated gap between California and its counterfactual over time.");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxisG = g.append("g");
    const yAxisG = g.append("g");
    const shade  = g.append("rect").attr("y", 0).attr("height", h)
      .attr("fill", "rgba(217, 119, 87, 0.06)");

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 38})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Year");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-42})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Gap: California − counterfactual");

    const area    = g.append("path");
    const gapLine = g.append("path").attr("fill", "none").attr("stroke-width", 2.2);
    const zeroLn  = g.append("line").attr("stroke", C.faint).attr("stroke-width", 1);
    const refLine = g.append("line").attr("stroke", C.muted).attr("stroke-width", 1).attr("stroke-dasharray", "4 4");
    const attG    = g.append("g");

    function update(rows, att, methodId) {
      const m = METHODS[methodId] || METHODS.sdid;
      const years = rows.map(d => d.year);
      const x = d3.scaleLinear().domain(d3.extent(years)).range([0, w]);
      const gaps = rows.map(d => d.gap);
      const yMin = Math.min(0, d3.min(gaps));
      const yMax = Math.max(0, d3.max(gaps));
      const pad = Math.max(2, (yMax - yMin) * 0.08);
      const y = d3.scaleLinear().domain([yMin - pad, yMax + pad]).nice().range([h, 0]);

      xAxisG.attr("transform", `translate(0,${y(0)})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d")));
      yAxisG.call(d3.axisLeft(y).ticks(6));
      styleAxes(g);
      // Keep the x tick labels legible where the axis sits on the zero line.
      xAxisG.selectAll(".tick text").attr("fill", C.muted).attr("dy", "1.2em");

      shade.attr("x", x(TREAT_YEAR)).attr("width", Math.max(0, w - x(TREAT_YEAR)));
      zeroLn.attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0));
      refLine.attr("x1", x(TREAT_YEAR)).attr("x2", x(TREAT_YEAR)).attr("y1", 0).attr("y2", h);

      const areaGen = d3.area().x(d => x(d.year)).y0(y(0)).y1(d => y(d.gap)).curve(d3.curveMonotoneX);
      const lineGen = d3.line().x(d => x(d.year)).y(d => y(d.gap)).curve(d3.curveMonotoneX);
      area.attr("d", areaGen(rows)).attr("fill", m.color).attr("opacity", 0.16);
      gapLine.attr("d", lineGen(rows)).attr("stroke", m.color);

      // ATT: a horizontal marker across the post-period at the mean effect.
      attG.selectAll("*").remove();
      const xPost0 = x(TREAT_YEAR);
      const xPost1 = w;
      attG.append("line")
        .attr("x1", xPost0).attr("x2", xPost1)
        .attr("y1", y(att)).attr("y2", y(att))
        .attr("stroke", m.color).attr("stroke-width", 1.6).attr("stroke-dasharray", "2 3").attr("opacity", 0.9);
      attG.append("text")
        .attr("x", xPost1 - 4).attr("y", y(att) + (att < 0 ? 16 : -8))
        .attr("text-anchor", "end").attr("fill", m.color)
        .attr("font-size", 12).attr("font-weight", 600)
        .text(`ATT ≈ ${att.toFixed(1)} packs`);
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // 3. Placebo histogram (Placebo inference tab). Distribution of placebo ATTs
  //    (each control state treated as if it were California) with a vertical
  //    marker at California's observed effect.
  //
  //    placebos: number[]  (the 38 placebo ATTs)
  //    caEffect: number    (e.g. -15.6)
  //    ci: {lo, hi}        (normal-approx 95% interval, for shading)
  // ------------------------------------------------------------------
  function placebo_histogram(container) {
    const W = 760, H = 368;
    const margin = { top: 40, right: 26, bottom: 76, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    svg.attr("aria-label", "Histogram of placebo treatment effects with California marked.");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(placebos, caEffect, ci) {
      g.selectAll("*").remove();
      if (!placebos || placebos.length === 0) return;

      const all = placebos.concat([caEffect, ci ? ci.lo : caEffect, ci ? ci.hi : caEffect]);
      const ext = d3.extent(all);
      const span = ext[1] - ext[0];
      const pad = Math.max(2, span * 0.06);
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).nice().range([0, w]);

      const bin = d3.bin().domain(x.domain()).thresholds(18);
      const bins = bin(placebos);
      const maxC = d3.max(bins, d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      // Normal-approx 95% CI band (wide, SE-based).
      if (ci) {
        g.append("rect")
          .attr("x", x(ci.lo)).attr("width", Math.max(0, x(ci.hi) - x(ci.lo)))
          .attr("y", 0).attr("height", h)
          .attr("fill", "rgba(217, 119, 87, 0.08)");
      }

      // Zero reference line (no effect).
      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 4");
      g.append("text").attr("x", x(0)).attr("y", h + 30)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 10)
        .text("no effect");

      // Placebo bars (steel — these are the control states).
      g.selectAll("rect.bar").data(bins).enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1.5))
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length))
        .attr("fill", C.steel).attr("opacity", 0.55);

      // California marker (orange vertical line).
      g.append("line").attr("x1", x(caEffect)).attr("x2", x(caEffect))
        .attr("y1", -6).attr("y2", h)
        .attr("stroke", C.orange).attr("stroke-width", 2.6);
      g.append("text").attr("x", x(caEffect)).attr("y", -12)
        .attr("text-anchor", "middle").attr("fill", C.orange)
        .attr("font-size", 12).attr("font-weight", 600)
        .text(`California ${caEffect.toFixed(1)}`);

      // Axes.
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")));
      g.append("g").call(d3.axisLeft(y).ticks(Math.min(maxC, 5)).tickFormat(d3.format("d")));
      styleAxes(g);

      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 42})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Placebo ATT (each control state treated at 1989)");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Number of states");

      // Legend: a centered horizontal row at the BOTTOM, below the x-title.
      const legItems = [{ color: C.steel, opacity: 0.55, label: "placebo states" }];
      if (ci) legItems.push({ color: "rgba(217, 119, 87, 0.30)", opacity: 1, label: "95% CI (SE-based)" });
      const pSw = 14, pTg = 6, pGap = 28, pFs = 11;
      const pEst = s => s.length * 6.0;
      const pWid = legItems.map(it => pSw + pTg + pEst(it.label));
      const pTotal = pWid.reduce((a, b) => a + b, 0) + pGap * (legItems.length - 1);
      const lg = g.append("g").attr("transform", `translate(0,${h + 62})`);
      let pcx = Math.max(0, (w - pTotal) / 2);
      legItems.forEach((it, i) => {
        const gg = lg.append("g").attr("transform", `translate(${pcx},0)`);
        gg.append("rect").attr("x", 0).attr("y", -9).attr("width", pSw).attr("height", 11)
          .attr("fill", it.color).attr("opacity", it.opacity);
        gg.append("text").attr("x", pSw + pTg).attr("y", 0)
          .attr("fill", C.text).attr("font-size", pFs).text(it.label);
        pcx += pWid[i] + pGap;
      });
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // 4. Horizontal weight bars (Weighting-scheme explorer). Donor unit weights
  //    for SC (sparse: 6 donors) versus SDID (diffuse: many small weights).
  //
  //    rows: [{state, weight}, ...]  (already sorted desc, California dropped)
  //    color: bar color ; topN: how many to show.
  // ------------------------------------------------------------------
  function weight_bars(container, opts) {
    opts = opts || {};
    const topN = opts.topN || 12;
    const color = opts.color || C.steel;
    const W = 360;
    const margin = { top: 24, right: 44, bottom: 30, left: 110 };

    function update(rows) {
      const data = rows.filter(d => d.weight > 0).slice(0, topN);
      const rowH = 22;
      const h = Math.max(rowH * data.length, rowH);
      const H = margin.top + h + margin.bottom;
      const w = W - margin.left - margin.right;
      const svg = ensureSVG(container, W, H);
      svg.attr("aria-label", "Donor unit weights bar chart.");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const maxW = d3.max(data, d => d.weight) || 1;
      const x = d3.scaleLinear().domain([0, maxW]).range([0, w]);
      const y = d3.scaleBand().domain(data.map(d => d.state)).range([0, h]).padding(0.25);

      g.append("g").call(d3.axisLeft(y).tickSize(0));
      g.selectAll(".domain").remove();
      g.selectAll(".tick text").attr("fill", C.text).attr("font-size", 11);

      data.forEach(d => {
        g.append("rect")
          .attr("x", 0).attr("y", y(d.state))
          .attr("width", Math.max(1, x(d.weight))).attr("height", y.bandwidth())
          .attr("fill", color).attr("opacity", 0.85).attr("rx", 2);
        g.append("text")
          .attr("x", x(d.weight) + 5).attr("y", y(d.state) + y.bandwidth() / 2 + 4)
          .attr("fill", C.muted).attr("font-size", 10.5)
          .text(d.weight.toFixed(3));
      });
    }

    return { update };
  }

  window.CHARTS = {
    counterfactual_lines,
    gap_area,
    placebo_histogram,
    weight_bars,
    METHODS,
    C,
    TREAT_YEAR,
  };
})();
