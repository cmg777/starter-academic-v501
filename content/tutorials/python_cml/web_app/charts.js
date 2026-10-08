// charts.js — D3 chart builders for the Causal ML web app.
//
// Adapted from the canonical charts.js template. Forest-plot and selection-bar
// builders are generalised so they don't hard-code outcome / method labels.

(function () {
  "use strict";

  const C = {
    bg:    "#1f2b5e",
    panel: "#182447",
    steel: "#6a9bcc",
    orange:"#d97757",
    teal:  "#00d4c8",
    text:  "#e8ecf2",
    muted: "#8b9dc3",
    line:  "rgba(232, 236, 242, 0.18)",
    grid:  "rgba(232, 236, 242, 0.08)",
    faint: "rgba(232, 236, 242, 0.15)",
  };

  // Color palette assigned to CML method labels.
  const METHOD_COLORS = {
    "Naive (DiM)":     C.muted,
    "DoubleML (IRM)":  C.steel,
    "CausalForestDML": C.teal,
    "Truth":           C.orange,
    // GATE-by-group labels:
    "Estimated GATE":  C.steel,
    "True GATE":       C.orange,
  };

  function colorFor(name) {
    return METHOD_COLORS[name] || C.text;
  }

  function ensureSVG(container, viewBoxW, viewBoxH) {
    container.innerHTML = "";
    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxW} ${viewBoxH}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    return svg;
  }

  // ------------------------------------------------------------------
  // Concept animation (Tab 1).
  //   Visualises the *confounded* vs *adjusted* gap. A treated cloud and an
  //   untreated cloud orbit slightly; the "naive" gap pulses with confounding
  //   bias; the "DML" gap stays close to the true ATE.
  // ------------------------------------------------------------------
  function ate_bias_animation(container) {
    const W = 720, H = 360;
    // Top margin enlarged so the legend can sit ABOVE the plot area
    // rather than overlapping the animated dots and the true-ATE line.
    const margin = { top: 60, right: 28, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Truth horizontal line.
    const trueATE = 5.628;
    const xScale = d3.scaleLinear().domain([0, 60]).range([0, w]);
    const yScale = d3.scaleLinear().domain([3, 8]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(() => ""))
      .selectAll(".domain, line").attr("stroke", C.muted);
    g.append("g").call(d3.axisLeft(yScale).ticks(6))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Time (animation cycles)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Estimated ATE (months)");

    // True ATE reference line.
    g.append("line")
      .attr("x1", 0).attr("x2", w)
      .attr("y1", yScale(trueATE)).attr("y2", yScale(trueATE))
      .attr("stroke", C.orange).attr("stroke-width", 2).attr("stroke-dasharray", "5 4");
    g.append("text").attr("x", w - 6).attr("y", yScale(trueATE) - 6)
      .attr("text-anchor", "end").attr("fill", C.orange).attr("font-size", 11)
      .text("true ATE = 5.628");

    // Two pulsing dots.
    const naiveDot = g.append("circle").attr("r", 7).attr("fill", C.muted);
    const dmlDot   = g.append("circle").attr("r", 7).attr("fill", C.steel);

    // Pulsing CIs (vertical bars).
    const naiveBar = g.append("line").attr("stroke", C.muted).attr("stroke-width", 2);
    const dmlBar   = g.append("line").attr("stroke", C.steel).attr("stroke-width", 2);

    // Legend — placed in the enlarged top margin (above the plot) so the
    // animated naive/DML dots and the true-ATE line never sit underneath it.
    const lg = g.append("g").attr("transform", `translate(0,${-36})`);
    const e1Label = "Naive — biased toward zero";
    const e2Label = "DoubleML — covers truth";
    const e1W = 18 + e1Label.length * 6.5;
    const e2W = 18 + e2Label.length * 6.5;
    const gap = 24;
    const total = e1W + gap + e2W;
    const x0 = (w - total) / 2;
    lg.append("rect").attr("x", x0 - 8).attr("y", 0).attr("width", total + 16).attr("height", 22)
      .attr("fill", "rgba(15,23,41,0.6)").attr("stroke", C.line).attr("rx", 6);
    lg.append("circle").attr("cx", x0 + 6).attr("cy", 11).attr("r", 5).attr("fill", C.muted);
    lg.append("text").attr("x", x0 + 18).attr("y", 15).attr("fill", C.text).attr("font-size", 12).text(e1Label);
    lg.append("circle").attr("cx", x0 + e1W + gap + 6).attr("cy", 11).attr("r", 5).attr("fill", C.steel);
    lg.append("text").attr("x", x0 + e1W + gap + 18).attr("y", 15).attr("fill", C.text).attr("font-size", 12).text(e2Label);

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      const tNorm   = (elapsed % 12) / 12;       // 12-second loop
      const x       = xScale(tNorm * 60);
      const naive_y = 5.111 + 0.05 * Math.sin(elapsed * 1.3);
      const dml_y   = 5.520 + 0.05 * Math.sin(elapsed * 1.1 + 1);
      const naiveCI = 0.185;
      const dmlCI   = 0.160;

      naiveDot.attr("cx", x).attr("cy", yScale(naive_y));
      dmlDot.attr("cx", x).attr("cy", yScale(dml_y));
      naiveBar.attr("x1", x).attr("x2", x)
        .attr("y1", yScale(naive_y - naiveCI)).attr("y2", yScale(naive_y + naiveCI));
      dmlBar.attr("x1", x).attr("x2", x)
        .attr("y1", yScale(dml_y - dmlCI)).attr("y2", yScale(dml_y + dmlCI));

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Forest plot (Tab 2): ATE method comparison.
  //   data: array of {method, outcome, estimate, ci_lo, ci_hi, n_selected, se}
  //   activeMethods, activeOutcomes: filters
  // Generalised version (no hard-coded outcome labels).
  // ------------------------------------------------------------------
  function forest_plot(container) {
    const W = 880;
    const margin = { top: 28, right: 24, bottom: 36, left: 200 };
    const facetGap = 24;
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 320`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(data, activeMethods, activeOutcomes) {
      // Discover outcomes / methods from the data if not specified.
      const allOutcomes = Array.from(new Set(data.map(d => d.outcome)));
      const allMethods  = Array.from(new Set(data.map(d => d.method)));
      const outcomes = (activeOutcomes && activeOutcomes.length) ? activeOutcomes : allOutcomes;
      const methods  = (activeMethods  && activeMethods.length)  ? activeMethods  : allMethods;

      // Filter data.
      const rows = data.filter(d => outcomes.includes(d.outcome) && methods.includes(d.method));
      const nFacets = outcomes.length;
      const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / nFacets;
      const facetH = 28 * methods.length + 24;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet").remove();
      svg.selectAll("text.facet").remove();

      outcomes.forEach((outcome, oi) => {
        const facet = svg.append("g")
          .attr("class", "facet")
          .attr("transform", `translate(${margin.left + oi * (facetW + facetGap)},${margin.top})`);

        const subset = rows.filter(d => d.outcome === outcome);
        const ext = d3.extent(subset.flatMap(d => [d.ci_lo, d.ci_hi]));
        const lo  = (ext[0] === undefined) ? 0 : ext[0];
        const hi  = (ext[1] === undefined) ? 0 : ext[1];
        const pad = Math.max(0.1, (hi - lo) * 0.08);
        const x = d3.scaleLinear().domain([lo - pad, hi + pad]).range([0, facetW]);
        const y = d3.scaleBand().domain(methods).range([0, facetH]).padding(0.35);

        // Title.
        facet.append("text").attr("x", facetW / 2).attr("y", -10)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13)
          .attr("font-weight", 600).text(outcome);

        // x axis.
        facet.append("g").attr("transform", `translate(0,${facetH})`)
          .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".2f")))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

        // Method labels (only on the leftmost facet).
        if (oi === 0) {
          methods.forEach(m => {
            svg.append("text")
              .attr("class", "facet")
              .attr("x", margin.left - 10)
              .attr("y", margin.top + y(m) + y.bandwidth() / 2 + 4)
              .attr("text-anchor", "end")
              .attr("fill", C.text)
              .attr("font-size", 12)
              .text(m);
          });
        }

        // Error bars + points.
        subset.forEach(d => {
          const yc = y(d.method) + y.bandwidth() / 2;
          const col = colorFor(d.method);
          const grp = facet.append("g").attr("class", "row").style("cursor", "pointer");
          grp.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
            .attr("y1", yc).attr("y2", yc)
            .attr("stroke", col).attr("stroke-width", 2);
          grp.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
            .attr("y1", yc - 4).attr("y2", yc + 4)
            .attr("stroke", col).attr("stroke-width", 2);
          grp.append("line")
            .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
            .attr("y1", yc - 4).attr("y2", yc + 4)
            .attr("stroke", col).attr("stroke-width", 2);
          grp.append("circle")
            .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
            .attr("fill", col).attr("stroke", "#fff").attr("stroke-width", 1);

          grp.on("mousemove", function (ev) {
            const rect = container.getBoundingClientRect();
            const se   = (typeof d.se === "number") ? d.se : null;
            const sel  = (d.n_selected === null || d.n_selected === undefined) ? "n/a" : d.n_selected;
            tooltip.html(
              `<div><strong style="color:${col}">${d.method}</strong></div>` +
              `<div><span class='tooltip-key'>estimate =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${se !== null ? se.toFixed(4) : "n/a"}</span></div>` +
              `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>` +
              `<div><span class='tooltip-key'>n =</span> <span class='tooltip-val'>${sel}</span></div>`
            )
            .classed("show", true)
            .style("left", (ev.clientX - rect.left + 12) + "px")
            .style("top",  (ev.clientY - rect.top  + 12) + "px");
          }).on("mouseleave", function () { tooltip.classed("show", false); });
        });

        // True ATE reference line on the first (only) facet, if "Truth" is a method present.
        const truthRow = subset.find(d => d.method === "Truth");
        if (truthRow) {
          facet.append("line")
            .attr("x1", x(truthRow.estimate)).attr("x2", x(truthRow.estimate))
            .attr("y1", 0).attr("y2", facetH)
            .attr("stroke", C.orange).attr("stroke-width", 1.5).attr("stroke-dasharray", "3 4")
            .attr("opacity", 0.6);
        }
      });
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // GATE bar chart (Tab 3).
  //   Side-by-side bars per group: estimated GATE (steel) vs true GATE (orange).
  //   data: array of { group, estimated, ci_lo, ci_hi, truth, n }
  // ------------------------------------------------------------------
  function gate_bars(container) {
    const W = 720, H = 360;
    // Top margin enlarged to host the legend ABOVE the plot area (was 28).
    const margin = { top: 60, right: 24, bottom: 60, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data, options) {
      g.selectAll("*").remove();
      options = options || {};

      const xGroup = d3.scaleBand().domain(data.map(d => d.group)).range([0, w]).padding(0.3);
      const xInner = d3.scaleBand().domain(["estimated", "truth"]).range([0, xGroup.bandwidth()]).padding(0.08);
      const yMax = d3.max(data, d => Math.max(d.ci_hi || d.estimated, d.truth)) * 1.1 || 1;
      const yScale = d3.scaleLinear().domain([0, yMax]).range([h, 0]);

      // Axes.
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(xGroup))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 11);
      g.append("g").call(d3.axisLeft(yScale).ticks(6))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 11);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 40})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text(options.xLabel || "Subgroup");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-42})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text(options.yLabel || "GATE (months)");

      // Bars.
      data.forEach(d => {
        const x0 = xGroup(d.group);
        // Estimated bar with CI error bar.
        const estX = x0 + xInner("estimated");
        g.append("rect")
          .attr("x", estX).attr("y", yScale(d.estimated))
          .attr("width", xInner.bandwidth()).attr("height", h - yScale(d.estimated))
          .attr("fill", C.steel).attr("opacity", 0.85);
        if (typeof d.ci_lo === "number" && typeof d.ci_hi === "number") {
          const cx = estX + xInner.bandwidth() / 2;
          g.append("line")
            .attr("x1", cx).attr("x2", cx)
            .attr("y1", yScale(d.ci_lo)).attr("y2", yScale(d.ci_hi))
            .attr("stroke", C.text).attr("stroke-width", 1.5);
          g.append("line")
            .attr("x1", cx - 5).attr("x2", cx + 5)
            .attr("y1", yScale(d.ci_lo)).attr("y2", yScale(d.ci_lo))
            .attr("stroke", C.text).attr("stroke-width", 1.5);
          g.append("line")
            .attr("x1", cx - 5).attr("x2", cx + 5)
            .attr("y1", yScale(d.ci_hi)).attr("y2", yScale(d.ci_hi))
            .attr("stroke", C.text).attr("stroke-width", 1.5);
        }
        // Truth bar.
        const trX = x0 + xInner("truth");
        g.append("rect")
          .attr("x", trX).attr("y", yScale(d.truth))
          .attr("width", xInner.bandwidth()).attr("height", h - yScale(d.truth))
          .attr("fill", C.orange).attr("opacity", 0.85);

        // Value labels.
        g.append("text")
          .attr("x", estX + xInner.bandwidth() / 2)
          .attr("y", yScale(d.estimated) - 4)
          .attr("text-anchor", "middle").attr("fill", C.steel).attr("font-size", 10)
          .text(d.estimated.toFixed(2));
        g.append("text")
          .attr("x", trX + xInner.bandwidth() / 2)
          .attr("y", yScale(d.truth) - 4)
          .attr("text-anchor", "middle").attr("fill", C.orange).attr("font-size", 10)
          .text(d.truth.toFixed(2));
      });

      // Legend — placed ABOVE the plot area (in the enlarged top margin) so
      // it never overlaps bars. Horizontal layout, centred.
      const lg = g.append("g").attr("transform", `translate(0,${-36})`);
      // Swatch + label pair widths (computed to keep entries centred).
      const e1Label = "Estimated GATE (DR)";
      const e2Label = "True GATE";
      const e1W = 14 + 6 + e1Label.length * 6.5;
      const e2W = 14 + 6 + e2Label.length * 6.5;
      const gap = 24;
      const total = e1W + gap + e2W;
      const x0 = (w - total) / 2;
      lg.append("rect").attr("x", x0 - 8).attr("y", 0).attr("width", total + 16).attr("height", 22)
        .attr("fill", "rgba(15,23,41,0.6)").attr("stroke", C.line).attr("rx", 6);
      lg.append("rect").attr("x", x0).attr("y", 6).attr("width", 14).attr("height", 10).attr("fill", C.steel);
      lg.append("text").attr("x", x0 + 20).attr("y", 15).attr("fill", C.text).attr("font-size", 12).text(e1Label);
      lg.append("rect").attr("x", x0 + e1W + gap).attr("y", 6).attr("width", 14).attr("height", 10).attr("fill", C.orange);
      lg.append("text").attr("x", x0 + e1W + gap + 20).attr("y", 15).attr("fill", C.text).attr("font-size", 12).text(e2Label);
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // Welfare bar chart (Tab 4): four assignment rules side-by-side.
  //   data: array of { rule, share_treated, avg_welfare }
  // ------------------------------------------------------------------
  function welfare_bars(container) {
    const W = 720, H = 320;
    const margin = { top: 28, right: 24, bottom: 90, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();

      const xScale = d3.scaleBand().domain(data.map(d => d.rule)).range([0, w]).padding(0.35);
      const maxW = d3.max(data, d => d.avg_welfare) * 1.2 || 1;
      const yScale = d3.scaleLinear().domain([0, maxW]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
          .attr("fill", C.muted).attr("font-size", 10)
          .attr("transform", "rotate(-18)")
          .attr("text-anchor", "end")
          .attr("dx", "-0.4em").attr("dy", "0.2em");
      g.append("g").call(d3.axisLeft(yScale).ticks(6))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 11);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Net welfare per individual (months)");

      // Bars with colour depending on rule type.
      data.forEach(d => {
        let color = C.muted;
        if (d.rule.startsWith("IATE"))   color = C.teal;
        if (d.rule.startsWith("Oracle")) color = C.orange;
        if (d.rule.startsWith("Treat all")) color = C.steel;
        g.append("rect")
          .attr("x", xScale(d.rule)).attr("y", yScale(d.avg_welfare))
          .attr("width", xScale.bandwidth()).attr("height", h - yScale(d.avg_welfare))
          .attr("fill", color).attr("opacity", 0.85);
        // Value above bar.
        g.append("text")
          .attr("x", xScale(d.rule) + xScale.bandwidth() / 2)
          .attr("y", yScale(d.avg_welfare) - 6)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
          .attr("font-weight", 600)
          .text(d.avg_welfare.toFixed(3));
        // Share treated under bar.
        g.append("text")
          .attr("x", xScale(d.rule) + xScale.bandwidth() / 2)
          .attr("y", yScale(d.avg_welfare) + 14)
          .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 10)
          .text(`treats ${(d.share_treated * 100).toFixed(1)}%`);
      });
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // Histograms reused from the canonical template (used by DGP simulator).
  // ------------------------------------------------------------------
  function alpha_histograms(container) {
    const W = 720, H = 300;
    // Top margin enlarged to host the legend ABOVE the histogram (was 18).
    const margin = { top: 56, right: 24, bottom: 38, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const all = data.alphas_naive.concat(data.alphas_dml);
      if (all.length === 0) return;
      const ext = d3.extent(all);
      const span = Math.max(0.3, ext[1] - ext[0]);
      const pad = span * 0.05;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const nBins = 24;
      const bin = d3.bin().domain(x.domain()).thresholds(nBins);
      const binsN = bin(data.alphas_naive);
      const binsD = bin(data.alphas_dml);
      const maxC = d3.max(binsN.concat(binsD), d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      function drawBars(bins, color, opacity) {
        g.selectAll(null).data(bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", color).attr("opacity", opacity);
      }
      drawBars(binsN, C.muted, 0.70);
      drawBars(binsD, C.steel, 0.85);

      g.append("line").attr("x1", x(data.alpha_true)).attr("x2", x(data.alpha_true))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.orange).attr("stroke-width", 2);
      // true-ATE label placed just above the top of the plot area (in the
      // enlarged top margin), with anchor flipped if the line is near the right edge
      // so the label never extends off-svg or overlaps the bars below.
      const lblX = x(data.alpha_true);
      const labelText = `true ATE = ${data.alpha_true.toFixed(2)}`;
      const nearRight = lblX > w - 70;
      g.append("text")
        .attr("x", lblX + (nearRight ? -4 : 4))
        .attr("y", -6)
        .attr("text-anchor", nearRight ? "end" : "start")
        .attr("fill", C.orange).attr("font-size", 11).text(labelText);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated ATE across 100 simulated datasets");

      // Legend — placed ABOVE the histogram bars (in the enlarged top margin)
      // so it never sits on top of high-count bins.
      const lg = g.append("g").attr("transform", `translate(0,${-32})`);
      const e1Label = "Naive estimator";
      const e2Label = "Adjusted (regression)";
      const e1W = 14 + 6 + e1Label.length * 6.5;
      const e2W = 14 + 6 + e2Label.length * 6.5;
      const gap = 24;
      const total = e1W + gap + e2W;
      const x0 = (w - total) / 2;
      lg.append("rect").attr("x", x0 - 8).attr("y", 0).attr("width", total + 16).attr("height", 22)
        .attr("fill", "rgba(15,23,41,0.6)").attr("stroke", C.line).attr("rx", 6);
      lg.append("rect").attr("x", x0).attr("y", 6).attr("width", 14).attr("height", 10).attr("fill", C.muted);
      lg.append("text").attr("x", x0 + 20).attr("y", 15).attr("fill", C.text).attr("font-size", 12).text(e1Label);
      lg.append("rect").attr("x", x0 + e1W + gap).attr("y", 6).attr("width", 14).attr("height", 10).attr("fill", C.steel);
      lg.append("text").attr("x", x0 + e1W + gap + 20).attr("y", 15).attr("fill", C.text).attr("font-size", 12).text(e2Label);
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // ATE comparison bar (Tab 3): a single naive-vs-adjusted compare on a draw.
  // data: { naive, dml, alpha_true }
  // ------------------------------------------------------------------
  function ate_compare(container) {
    const W = 720, H = 200;
    const margin = { top: 24, right: 24, bottom: 36, left: 130 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const labels = [
        { name: "Naive",    v: data.naive, color: C.muted },
        { name: "Adjusted", v: data.dml,   color: C.steel },
      ];
      const allVals = labels.map(d => d.v).concat([data.alpha_true, 0]);
      const ext = d3.extent(allVals);
      const span = Math.max(0.5, ext[1] - ext[0]);
      const pad = span * 0.15;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const y = d3.scaleBand().domain(labels.map(d => d.name)).range([0, h]).padding(0.4);

      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      g.append("line").attr("x1", x(data.alpha_true)).attr("x2", x(data.alpha_true))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.orange).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.alpha_true) + 4).attr("y", -8)
        .attr("fill", C.orange).attr("font-size", 11)
        .text(`true ATE = ${data.alpha_true.toFixed(2)}`);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      labels.forEach(d => {
        const yc = y(d.name) + y.bandwidth() / 2;
        g.append("text").attr("x", -10).attr("y", yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(d.name);
        const x0 = x(0);
        const x1 = x(d.v);
        g.append("rect")
          .attr("x", Math.min(x0, x1))
          .attr("y", yc - y.bandwidth() / 2 + y.bandwidth() * 0.15)
          .attr("width", Math.abs(x1 - x0))
          .attr("height", y.bandwidth() * 0.7)
          .attr("fill", d.color).attr("opacity", 0.85);
        g.append("text").attr("x", x1 + (x1 >= x0 ? 6 : -6))
          .attr("text-anchor", x1 >= x0 ? "start" : "end")
          .attr("y", yc + 4)
          .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
          .text(d.v.toFixed(3));
      });
    }
    return { update };
  }

  window.CHARTS = {
    ate_bias_animation,
    forest_plot,
    gate_bars,
    welfare_bars,
    alpha_histograms,
    ate_compare,
    C,
  };
})();
