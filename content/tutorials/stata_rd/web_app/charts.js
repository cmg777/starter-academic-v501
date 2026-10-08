// charts.js — D3 chart builders for the Regression Discontinuity (RDD) web app.
//
// Each builder takes a DOM container and returns an object with an `update(...)`
// method so subsequent slider changes patch the existing chart instead of
// recreating it from scratch.

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

  function ensureSVG(container, viewBoxW, viewBoxH) {
    container.innerHTML = "";
    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxW} ${viewBoxH}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    return svg;
  }

  // ------------------------------------------------------------------
  // Cutoff-jump animation (Tab 1).
  //   Shows two regression lines — one on each side of a cutoff —
  //   with the treatment effect tau growing then shrinking, so the
  //   reader sees the discontinuity *as a jump* at the cutoff.
  // ------------------------------------------------------------------
  function rd_jump_animation(container) {
    const W = 720, H = 320;
    const margin = { top: 28, right: 28, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([30, 100]).range([0, w]);
    const yScale = d3.scaleLinear().domain([40, 85]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(7))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle")
      .attr("fill", C.text)
      .attr("font-size", 12)
      .text("Entrance exam score (running variable)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle")
      .attr("fill", C.text)
      .attr("font-size", 12)
      .text("Exit exam score");

    const cutoff = 70;

    // Cutoff line.
    g.append("line")
      .attr("x1", xScale(cutoff)).attr("x2", xScale(cutoff))
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", C.text).attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 4")
      .attr("opacity", 0.55);
    g.append("text")
      .attr("x", xScale(cutoff)).attr("y", -8)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
      .text("cutoff c = 70");

    // Two regression-line paths: tutored (left, blue) and not (right, orange).
    // The slope of exit on entrance is ~0.5 in the actual data; intercept moves
    // up by tau on the LEFT side (because tutored students do better).
    const slope = 0.40;
    const baseAtCutoff = 65;   // E[Y | X=70-, no tutoring] baseline
    const leftPath = g.append("path")
      .attr("fill", "none").attr("stroke", C.steel)
      .attr("stroke-width", 3);
    const rightPath = g.append("path")
      .attr("fill", "none").attr("stroke", C.orange)
      .attr("stroke-width", 3);

    // The tau marker (vertical double-arrow at the cutoff)
    const tauLine = g.append("line")
      .attr("x1", xScale(cutoff) + 1).attr("x2", xScale(cutoff) + 1)
      .attr("stroke", C.teal).attr("stroke-width", 2.5)
      .attr("marker-end", "url(#arrowUp)").attr("marker-start", "url(#arrowDown)");
    // Background rect for the tau label so the regression lines don't crowd it.
    const tauLabelBg = g.append("rect")
      .attr("fill", "rgba(31, 43, 94, 0.85)").attr("rx", 3);
    const tauLabel = g.append("text")
      .attr("x", xScale(cutoff) + 8).attr("fill", C.teal)
      .attr("font-size", 12).attr("font-weight", 600);

    // Arrow markers (defs)
    const defs = svg.append("defs");
    function arrow(id, refX) {
      defs.append("marker")
        .attr("id", id).attr("viewBox", "0 0 10 10")
        .attr("refX", refX).attr("refY", 5)
        .attr("markerWidth", 6).attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", C.teal);
    }
    arrow("arrowUp", 9);
    arrow("arrowDown", 1);

    // Legend.
    const lg = g.append("g").attr("transform", `translate(${w - 230},${4})`);
    lg.append("rect").attr("width", 220).attr("height", 48).attr("fill", "rgba(15,23,41,0.6)").attr("stroke", C.line).attr("rx", 6);
    lg.append("rect").attr("x", 10).attr("y", 10).attr("width", 14).attr("height", 4).attr("fill", C.steel);
    lg.append("text").attr("x", 30).attr("y", 16).attr("fill", C.text).attr("font-size", 11).text("Tutored  (x ≤ 70)");
    lg.append("rect").attr("x", 10).attr("y", 30).attr("width", 14).attr("height", 4).attr("fill", C.orange);
    lg.append("text").attr("x", 30).attr("y", 36).attr("fill", C.text).attr("font-size", 11).text("Not tutored  (x > 70)");

    function render(tau) {
      // Left line: y = baseAtCutoff + tau + slope*(x - 70), for x in [40, 70]
      const lx0 = 40, lx1 = cutoff;
      const ly0 = baseAtCutoff + tau + slope * (lx0 - cutoff);
      const ly1 = baseAtCutoff + tau + slope * (lx1 - cutoff);
      leftPath.attr("d", `M ${xScale(lx0)} ${yScale(ly0)} L ${xScale(lx1)} ${yScale(ly1)}`);

      // Right line: y = baseAtCutoff + slope*(x - 70), for x in [70, 95]
      const rx0 = cutoff, rx1 = 95;
      const ry0 = baseAtCutoff + slope * (rx0 - cutoff);
      const ry1 = baseAtCutoff + slope * (rx1 - cutoff);
      rightPath.attr("d", `M ${xScale(rx0)} ${yScale(ry0)} L ${xScale(rx1)} ${yScale(ry1)}`);

      // tau marker: from (cutoff, ry0) up to (cutoff, ly1)
      const yLo = yScale(ry0);
      const yHi = yScale(ly1);
      tauLine.attr("y1", yLo).attr("y2", yHi);
      const labelY = (yLo + yHi) / 2 + 4;
      tauLabel.attr("y", labelY).text(`τ = ${tau.toFixed(1)}`);
      // Size the background rect to cover the text so the orange right-side line
      // does not visually cross the τ readout.
      try {
        const bb = tauLabel.node().getBBox();
        tauLabelBg
          .attr("x", bb.x - 3).attr("y", bb.y - 1)
          .attr("width", bb.width + 6).attr("height", bb.height + 2);
      } catch (_) { /* ignore if not in DOM yet */ }
    }

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      // tau oscillates between 0 and 12; gently
      const tau = 6 + 5.5 * Math.sin(elapsed * 0.6);
      render(tau);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // RD scatter + local-linear fit (Tab 2 simulator).
  //   data: { points: [{x, y, treated}], leftFit: [{x, y}], rightFit: [{x, y}],
  //           cutoff, bandwidth, tau_hat }
  // ------------------------------------------------------------------
  function rd_simulator_scatter(container) {
    const W = 760, H = 360;
    const margin = { top: 28, right: 28, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Running variable  X");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Outcome  Y");

    const ptsG = g.append("g").attr("class", "pts");
    const fitsG = g.append("g").attr("class", "fits");
    const cutoffG = g.append("g").attr("class", "cutoff");

    function update(data) {
      const { points, leftFit, rightFit, cutoff, bandwidth, tau_hat } = data;
      if (!points || points.length === 0) return;

      const xs = points.map(d => d.x);
      const ys = points.map(d => d.y);
      const xExt = d3.extent(xs);
      const yExt = d3.extent(ys);
      const xPad = (xExt[1] - xExt[0]) * 0.04;
      const yPad = (yExt[1] - yExt[0]) * 0.07;
      const x = d3.scaleLinear().domain([xExt[0] - xPad, xExt[1] + xPad]).range([0, w]);
      const y = d3.scaleLinear().domain([yExt[0] - yPad, yExt[1] + yPad]).range([h, 0]);

      xAxisG.call(d3.axisBottom(x).ticks(7)).selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(y).ticks(6)).selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Points.
      ptsG.selectAll("circle").remove();
      ptsG.selectAll("circle").data(points).enter().append("circle")
        .attr("cx", d => x(d.x)).attr("cy", d => y(d.y))
        .attr("r", 2.4)
        .attr("fill", d => d.treated ? C.steel : C.orange)
        .attr("opacity", d => d.inBand ? 0.85 : 0.18);

      // Bandwidth shading.
      fitsG.selectAll("rect.band").remove();
      fitsG.append("rect").attr("class", "band")
        .attr("x", x(cutoff - bandwidth)).attr("y", 0)
        .attr("width", Math.max(0, x(cutoff + bandwidth) - x(cutoff - bandwidth)))
        .attr("height", h)
        .attr("fill", C.teal).attr("opacity", 0.06)
        .lower();

      // Cutoff vertical line.
      cutoffG.selectAll("*").remove();
      cutoffG.append("line")
        .attr("x1", x(cutoff)).attr("x2", x(cutoff))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.text).attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 4").attr("opacity", 0.55);
      cutoffG.append("text")
        .attr("x", x(cutoff)).attr("y", -8).attr("text-anchor", "middle")
        .attr("fill", C.text).attr("font-size", 11)
        .text(`c = ${cutoff}`);

      // Local-poly fits.
      fitsG.selectAll("path.fit").remove();
      const lineGen = d3.line().x(d => x(d.x)).y(d => y(d.y)).curve(d3.curveMonotoneX);
      if (leftFit && leftFit.length > 0) {
        fitsG.append("path").attr("class", "fit")
          .attr("d", lineGen(leftFit))
          .attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 3.2);
      }
      if (rightFit && rightFit.length > 0) {
        fitsG.append("path").attr("class", "fit")
          .attr("d", lineGen(rightFit))
          .attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 3.2);
      }

      // Tau marker.
      if (leftFit && rightFit && leftFit.length && rightFit.length && Number.isFinite(tau_hat)) {
        const lY = leftFit[leftFit.length - 1].y;
        const rY = rightFit[0].y;
        const yLo = y(Math.min(lY, rY));
        const yHi = y(Math.max(lY, rY));
        cutoffG.append("line")
          .attr("x1", x(cutoff) + 4).attr("x2", x(cutoff) + 4)
          .attr("y1", yLo).attr("y2", yHi)
          .attr("stroke", C.teal).attr("stroke-width", 2.5);
        // Background rect placed BEFORE the label so it masks the orange right-side
        // fit line behind the readout.
        const labelBg = cutoffG.append("rect")
          .attr("fill", "rgba(31, 43, 94, 0.85)").attr("rx", 3);
        const tauText = cutoffG.append("text")
          .attr("x", x(cutoff) + 10).attr("y", (yLo + yHi) / 2 + 4)
          .attr("fill", C.teal).attr("font-size", 12).attr("font-weight", 600)
          .text(`τ̂ = ${tau_hat.toFixed(2)}`);
        try {
          const bb = tauText.node().getBBox();
          labelBg
            .attr("x", bb.x - 3).attr("y", bb.y - 1)
            .attr("width", bb.width + 6).attr("height", bb.height + 2);
        } catch (_) { /* no-op */ }
      }
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // Forest plot for stata_rd (Tab 4).
  //   Same horizontal-CI design as r_double_lasso, generalised to take a
  //   palette so non-LASSO method names colour correctly.
  // ------------------------------------------------------------------
  function rd_forest_plot(container) {
    const W = 880;
    const margin = { top: 28, right: 36, bottom: 36, left: 200 };
    const facetGap = 28;
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 320`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function colorFor(method) {
      if (method.includes("TRUE")) return C.orange;
      if (method.startsWith("Cutoff")) return C.muted;
      if (method.startsWith("BW = 10")) return C.orange;
      if (method.startsWith("BW")) return C.steel;
      if (method.startsWith("Triangular")) return C.teal;
      if (method.startsWith("Uniform")) return C.steel;
      if (method.startsWith("Epanechnikov")) return C.orange;
      if (method.startsWith("rdrobust")) return C.teal;
      if (method.startsWith("Linear")) return C.steel;
      if (method.startsWith("Quadratic")) return C.orange;
      return C.text;
    }

    function update(data, activeMethods, activeOutcomes) {
      const allOutcomes = Array.from(new Set(data.map(d => d.outcome)));
      const outcomes = activeOutcomes && activeOutcomes.length ? activeOutcomes : allOutcomes;
      const methods = activeMethods && activeMethods.length
        ? activeMethods
        : Array.from(new Set(data.map(d => d.method)));

      const rows = data.filter(d => outcomes.includes(d.outcome) && methods.includes(d.method));
      if (rows.length === 0) {
        svg.selectAll("*").remove();
        svg.append("text").attr("x", W / 2).attr("y", 160)
          .attr("text-anchor", "middle").attr("fill", C.muted)
          .text("Select at least one outcome and one method.");
        return;
      }

      // Methods present in any selected outcome.
      const methodsHere = Array.from(new Set(rows.map(d => d.method)));
      const nFacets = outcomes.length;
      const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / nFacets;
      const facetH = 28 * methodsHere.length + 18;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("*").remove();

      outcomes.forEach((outcome, oi) => {
        const facet = svg.append("g")
          .attr("class", "facet")
          .attr("transform", `translate(${margin.left + oi * (facetW + facetGap)},${margin.top})`);

        const subset = rows.filter(d => d.outcome === outcome);
        if (subset.length === 0) return;
        const ext = d3.extent(subset.flatMap(d => [d.ci_lo, d.ci_hi]));
        const xMin = Math.min(0, ext[0] || 0);
        const xMax = Math.max(0, ext[1] || 0);
        const pad = Math.max(0.5, (xMax - xMin) * 0.06);
        const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, facetW]);
        const methodsThisFacet = methodsHere.filter(m => subset.some(d => d.method === m));
        const y = d3.scaleBand().domain(methodsThisFacet).range([0, facetH]).padding(0.35);

        facet.append("text").attr("x", facetW / 2).attr("y", -10)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13)
          .attr("font-weight", 600).text(outcome);

        facet.append("line")
          .attr("x1", x(0)).attr("x2", x(0))
          .attr("y1", 0).attr("y2", facetH)
          .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 4");

        facet.append("g").attr("transform", `translate(0,${facetH})`)
          .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".1f")))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

        if (oi === 0) {
          methodsThisFacet.forEach(m => {
            svg.append("text")
              .attr("x", margin.left - 10)
              .attr("y", margin.top + y(m) + y.bandwidth() / 2 + 4)
              .attr("text-anchor", "end")
              .attr("fill", m.includes("TRUE") ? C.orange : C.text)
              .attr("font-size", 12)
              .attr("font-weight", m.includes("TRUE") ? 700 : 400)
              .text(m);
          });
        }

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
            .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", d.method.includes("TRUE") ? 6 : 5)
            .attr("fill", col).attr("stroke", "#fff").attr("stroke-width", 1);

          grp.on("mousemove", function (ev) {
            const rect = container.getBoundingClientRect();
            tooltip.html(
              `<div><strong style="color:${col}">${d.method}</strong></div>` +
              `<div><span class='tooltip-key'>τ̂ =</span> <span class='tooltip-val'>${d.estimate.toFixed(3)}</span></div>` +
              `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(3)}</span></div>` +
              `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(2)}, ${d.ci_hi.toFixed(2)}]</span></div>` +
              (d.n_selected !== null ? `<div><span class='tooltip-key'>obs used =</span> <span class='tooltip-val'>${d.n_selected}</span></div>` : "")
            )
            .classed("show", true)
            .style("left", (ev.clientX - rect.left + 12) + "px")
            .style("top",  (ev.clientY - rect.top  + 12) + "px");
          }).on("mouseleave", function () { tooltip.classed("show", false); });
        });
      });
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // Bandwidth-sweep curve (Tab 3).
  //   Plots tau_hat across bandwidths as a continuous curve (with shaded CI).
  // ------------------------------------------------------------------
  function bw_sweep_chart(container) {
    const W = 760, H = 280;
    const margin = { top: 24, right: 32, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");
    const bandG = g.append("g").attr("class", "band");
    const lineG = g.append("g").attr("class", "line");
    const cursorG = g.append("g").attr("class", "cursor");
    const refG = g.append("g").attr("class", "ref");

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Bandwidth  h  (points around the cutoff)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Estimated LATE  τ̂  (exit-exam points)");

    function update(data) {
      const { sweep, currentBw, currentTau } = data;
      if (!sweep || sweep.length === 0) return;
      const xs = sweep.map(d => d.bw);
      const lows = sweep.map(d => d.ci_lo);
      const his = sweep.map(d => d.ci_hi);
      const xExt = d3.extent(xs);
      const yExt = [d3.min(lows), d3.max(his)];
      const yPad = (yExt[1] - yExt[0]) * 0.08;

      const x = d3.scaleLinear().domain([xExt[0] - 0.5, xExt[1] + 0.5]).range([0, w]);
      const y = d3.scaleLinear().domain([yExt[0] - yPad, yExt[1] + yPad]).range([h, 0]);

      xAxisG.call(d3.axisBottom(x).ticks(8)).selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(y).ticks(6)).selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // CI band.
      const area = d3.area()
        .x(d => x(d.bw))
        .y0(d => y(d.ci_lo))
        .y1(d => y(d.ci_hi))
        .curve(d3.curveMonotoneX);
      bandG.selectAll("path").remove();
      bandG.append("path").attr("d", area(sweep))
        .attr("fill", C.teal).attr("opacity", 0.18);

      // Tau line.
      const line = d3.line().x(d => x(d.bw)).y(d => y(d.tau)).curve(d3.curveMonotoneX);
      lineG.selectAll("path").remove();
      lineG.append("path").attr("d", line(sweep))
        .attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 2.5);
      lineG.selectAll("circle").remove();
      lineG.selectAll("circle").data(sweep).enter().append("circle")
        .attr("cx", d => x(d.bw)).attr("cy", d => y(d.tau)).attr("r", 3.5)
        .attr("fill", C.teal);

      // Zero reference line.
      refG.selectAll("*").remove();
      refG.append("line")
        .attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      // Cursor for current bandwidth.
      cursorG.selectAll("*").remove();
      if (Number.isFinite(currentBw)) {
        cursorG.append("line")
          .attr("x1", x(currentBw)).attr("x2", x(currentBw))
          .attr("y1", 0).attr("y2", h)
          .attr("stroke", C.orange).attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "3 3");
        cursorG.append("circle")
          .attr("cx", x(currentBw)).attr("cy", y(currentTau))
          .attr("r", 6).attr("fill", C.orange)
          .attr("stroke", "#fff").attr("stroke-width", 1.5);
        // Background rect for the cursor readout so the teal τ̂(h) line and CI band
        // don't crowd the text when the cursor is mid-curve.
        const cursorLabelBg = cursorG.append("rect")
          .attr("fill", "rgba(31, 43, 94, 0.85)").attr("rx", 3);
        // If the cursor is near the right edge, anchor the label to the left of the
        // dot so it stays inside the plotting area.
        const nearRight = x(currentBw) > w - 130;
        const lx = nearRight ? x(currentBw) - 8 : x(currentBw) + 8;
        const ly = y(currentTau) - 10;
        const cursorText = cursorG.append("text")
          .attr("x", lx).attr("y", ly)
          .attr("text-anchor", nearRight ? "end" : "start")
          .attr("fill", C.orange).attr("font-size", 11).attr("font-weight", 600)
          .text(`h = ${currentBw.toFixed(1)}, τ̂ = ${currentTau.toFixed(2)}`);
        try {
          const bb = cursorText.node().getBBox();
          cursorLabelBg
            .attr("x", bb.x - 3).attr("y", bb.y - 1)
            .attr("width", bb.width + 6).attr("height", bb.height + 2);
        } catch (_) { /* no-op */ }
      }
    }
    return { update };
  }

  window.CHARTS = {
    rd_jump_animation,
    rd_simulator_scatter,
    rd_forest_plot,
    bw_sweep_chart,
    C,
  };
})();
