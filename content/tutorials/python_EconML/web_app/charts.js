// charts.js — D3 chart builders for the Double LASSO web app.
//
// Each builder takes a DOM container and a data object, draws an SVG, and
// returns an object with an `update(...)` method so subsequent slider changes
// can patch the existing chart instead of recreating it.

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
  // L1 vs L2 shrinkage animation (Tab 1).
  //   Shows two coefficients beta_1 (L1) and beta_2 (L2) as the penalty knob
  //   sweeps from 0 to a large value. L1 hits zero abruptly; L2 only decays.
  // ------------------------------------------------------------------
  function l1_vs_l2_animation(container) {
    // Bottom margin sized to host axis label + legend below the plot area.
    const W = 720, H = 360;
    const margin = { top: 28, right: 28, bottom: 86, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 5]).range([0, w]);
    const y = d3.scaleLinear().domain([-0.05, 1.05]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle")
      .attr("fill", C.text)
      .attr("font-size", 12)
      .text("Penalty strength  λ");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle")
      .attr("fill", C.text)
      .attr("font-size", 12)
      .text("Estimated coefficient  β̂");

    // True coefficient = 1 for both. As lambda grows:
    //   L1 (LASSO):  β̂ = max(1 - lambda, 0)   — hits zero at λ = 1
    //   L2 (Ridge):  β̂ = 1 / (1 + lambda)     — never hits zero
    const lamArr = d3.range(0, 5.01, 0.05);
    const l1Path = lamArr.map(l => [l, Math.max(1 - l, 0)]);
    const l2Path = lamArr.map(l => [l, 1 / (1 + l)]);
    const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX);

    g.append("path").attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.5).attr("d", line(l1Path));
    g.append("path").attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2.5).attr("stroke-dasharray", "4 4").attr("d", line(l2Path));

    g.append("circle").attr("r", 7).attr("fill", C.orange).attr("id", "anim-l1");
    g.append("circle").attr("r", 7).attr("fill", C.steel).attr("id", "anim-l2");

    // Legend — rendered BELOW the plot, centered on the chart, so it cannot
    // overlap either coefficient curve. Widths use a fixed-em estimate (≈7.2
    // px at 12px font) because getComputedTextLength is unreliable on SVG
    // nodes that may not be in the visible DOM yet.
    const legendY = h + 56;
    const lg = g.append("g");
    const items = [
      { color: C.orange, dash: null,    label: "L1 (LASSO) — exactly zero" },
      { color: C.steel,  dash: "4 4",   label: "L2 (Ridge) — never zero" },
    ];
    const SWATCH_W = 22, GAP_TXT = 6, GAP_ITEM = 28, PX_PER_CHAR = 7.2;
    const itemWidths = items.map(it => SWATCH_W + GAP_TXT + it.label.length * PX_PER_CHAR);
    const totalLegendW = itemWidths.reduce((a, b) => a + b, 0) + GAP_ITEM * (items.length - 1);
    let cursorX = 0;
    items.forEach((item, i) => {
      lg.append("line")
        .attr("x1", cursorX).attr("x2", cursorX + SWATCH_W)
        .attr("y1", 0).attr("y2", 0)
        .attr("stroke", item.color).attr("stroke-width", 2.5)
        .attr("stroke-dasharray", item.dash);
      lg.append("text")
        .attr("x", cursorX + SWATCH_W + GAP_TXT).attr("y", 4)
        .attr("fill", C.text).attr("font-size", 12)
        .text(item.label);
      cursorX += itemWidths[i] + GAP_ITEM;
    });
    lg.attr("transform", `translate(${Math.max(0, (w - totalLegendW) / 2)},${legendY})`);

    const moving_l1 = g.select("#anim-l1");
    const moving_l2 = g.select("#anim-l2");

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      const cycle = (Math.sin(elapsed * 0.6) + 1) / 2; // [0, 1]
      const lam = cycle * 4.5;
      const b1 = Math.max(1 - lam, 0);
      const b2 = 1 / (1 + lam);
      moving_l1.attr("cx", x(lam)).attr("cy", y(b1));
      moving_l2.attr("cx", x(lam)).attr("cy", y(b2));
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Coefficient-path chart (Tab 2).
  //   x-axis: -log(lambda) (so larger penalty is on the left, less on the right).
  //   y-axis: beta_j across lambdas.
  //   - "Treatment" coefficient (column 0) is drawn in orange and thicker.
  //   - Other columns are faint grey; at the *current* lambda, nonzero
  //     coefficients are highlighted teal.
  // ------------------------------------------------------------------
  function coefficient_path(container) {
    // Extra bottom margin reserves space for a color legend below the chart.
    const W = 720, H = 400;
    const margin = { top: 20, right: 24, bottom: 86, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const root = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxisG = root.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = root.append("g");

    root.append("text")
      .attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("log(λ) — larger penalty to the right");
    root.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Coefficient β̂_j(λ)");

    // Color legend — rendered BELOW the chart so it cannot overlap any
    // coefficient path. Three entries: treatment, surviving controls,
    // dropped controls. Widths are estimated with a fixed em (≈6.6 px at 11px
    // font) since text bounding boxes are unreliable for SVG nodes that may
    // not be attached to the DOM at measurement time.
    const legendY = h + 60;
    const lg = root.append("g");
    const items = [
      { color: C.orange, label: "Treatment α(λ) — held in" },
      { color: C.teal,   label: "Active control at current λ" },
      { color: C.faint,  label: "Dropped (β̂ = 0)" },
    ];
    const SWATCH_W = 22, GAP_TXT = 6, GAP_ITEM = 22, PX_PER_CHAR = 6.6;
    const itemWidths = items.map(it => SWATCH_W + GAP_TXT + it.label.length * PX_PER_CHAR);
    const totalLegendW = itemWidths.reduce((a, b) => a + b, 0) + GAP_ITEM * (items.length - 1);
    let cursorX = 0;
    items.forEach((item, i) => {
      lg.append("line")
        .attr("x1", cursorX).attr("x2", cursorX + SWATCH_W)
        .attr("y1", 0).attr("y2", 0)
        .attr("stroke", item.color).attr("stroke-width", 2.5);
      lg.append("text")
        .attr("x", cursorX + SWATCH_W + GAP_TXT).attr("y", 4)
        .attr("fill", C.text).attr("font-size", 11)
        .text(item.label);
      cursorX += itemWidths[i] + GAP_ITEM;
    });
    lg.attr("transform", `translate(${Math.max(0, (w - totalLegendW) / 2)},${legendY})`);

    const linesG = root.append("g").attr("class", "paths");
    const cursor = root.append("line")
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", C.orange).attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 4")
      .style("display", "none");
    const cursorLabel = root.append("text")
      .attr("y", -6).attr("fill", C.orange).attr("font-size", 11)
      .attr("text-anchor", "middle");

    let xScale, yScale, dataCached;

    function update(path, currentLambda) {
      dataCached = { path, currentLambda };
      const { lambdas, betas } = path;
      const K = lambdas.length;
      const p = betas[0].length;
      const logLam = Array.from(lambdas).map(Math.log);

      xScale = d3.scaleLinear().domain(d3.extent(logLam)).range([0, w]);

      // Find y range across all paths.
      let yMin = 0, yMax = 0;
      for (let k = 0; k < K; k++) {
        for (let j = 0; j < p; j++) {
          const v = betas[k][j];
          if (v < yMin) yMin = v;
          if (v > yMax) yMax = v;
        }
      }
      const pad = Math.max(0.05, (yMax - yMin) * 0.05);
      yScale = d3.scaleLinear().domain([yMin - pad, yMax + pad]).range([h, 0]);

      xAxisG.call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format(".1f")))
        .selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(yScale).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      root.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Zero reference line.
      linesG.selectAll(".zeroline").data([0]).join("line")
        .attr("class", "zeroline")
        .attr("x1", 0).attr("x2", w)
        .attr("y1", yScale(0)).attr("y2", yScale(0))
        .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "2 4");

      // Find which lambda index is closest to currentLambda.
      const cur = Math.log(currentLambda);
      let kCur = 0, best = Infinity;
      for (let k = 0; k < K; k++) {
        const d = Math.abs(logLam[k] - cur);
        if (d < best) { best = d; kCur = k; }
      }

      // Render one path per column. Treatment column = j=0 (orange).
      const lineGen = d3.line().x((_, k) => xScale(logLam[k])).curve(d3.curveMonotoneX);
      const paths = [];
      for (let j = 0; j < p; j++) {
        const series = [];
        for (let k = 0; k < K; k++) series.push(betas[k][j]);
        paths.push({ j, series, isTreatment: j === 0, currentVal: series[kCur] });
      }

      const sel = linesG.selectAll(".cpath").data(paths, d => d.j);
      sel.exit().remove();
      const enter = sel.enter().append("path").attr("class", "cpath").attr("fill", "none");
      enter.merge(sel)
        .attr("d", d => lineGen.y(v => yScale(v))(d.series))
        .attr("stroke", d => {
          if (d.isTreatment) return C.orange;
          return Math.abs(d.currentVal) > 1e-8 ? C.teal : C.faint;
        })
        .attr("stroke-width", d => d.isTreatment ? 3 : (Math.abs(d.currentVal) > 1e-8 ? 1.6 : 1))
        .attr("opacity", d => d.isTreatment ? 1 : (Math.abs(d.currentVal) > 1e-8 ? 0.9 : 0.35));

      // Cursor.
      cursor.style("display", null).attr("x1", xScale(cur)).attr("x2", xScale(cur));
      cursorLabel.attr("x", xScale(cur)).text(`λ = ${currentLambda.toFixed(3)}`);
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // Forest plot (Tab 4).
  //   Horizontal CIs with dots, faceted by outcome.
  //   data: array of { method, outcome, estimate, ci_lo, ci_hi, n_selected, se }
  //   activeMethods: Array<string> of methods to show.
  //   activeOutcomes: Array<string> of outcomes to show.
  // ------------------------------------------------------------------
  function forest_plot(container) {
    const W = 880;
    // bottom margin sized for axis + method-color legend below all facets
    const margin = { top: 28, right: 24, bottom: 78, left: 130 };
    const facetGap = 24;
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 320`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const colorMap = {
      "First diff":    C.steel,
      "OLS (full)":    C.muted,
      "PSL":           "#9bdcc3",
      "DL (rigorous)": C.teal,
      "DL (CV)":       C.orange,
    };

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(data, activeMethods, activeOutcomes) {
      const outcomes = activeOutcomes.length ? activeOutcomes : ["Violent crime", "Property crime", "Murder"];
      const methods = activeMethods.length ? activeMethods : ["First diff", "OLS (full)", "PSL", "DL (rigorous)", "DL (CV)"];

      // Filter data.
      const rows = data.filter(d => outcomes.includes(d.outcome) && methods.includes(d.method));
      const nFacets = outcomes.length;
      // Lay out facets as a 1-row strip when <= 3 outcomes; otherwise wrap
      // into a 2- or 3-column grid so facet titles never overlap their
      // neighbours' titles or data marks.
      const cols = nFacets <= 3 ? nFacets : (nFacets <= 6 ? 3 : 4);
      const rowsCount = Math.ceil(nFacets / cols);
      const rowGap = 36;
      const facetW = (W - margin.left - margin.right - (cols - 1) * facetGap) / cols;
      const singleFacetH = 28 * methods.length + 24;
      const facetH = singleFacetH;
      const totalH = margin.top + rowsCount * singleFacetH + (rowsCount - 1) * rowGap + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet").remove();
      svg.selectAll("g.fp-legend").remove();

      outcomes.forEach((outcome, oi) => {
        const col = oi % cols;
        const row = Math.floor(oi / cols);
        const facet = svg.append("g")
          .attr("class", "facet")
          .attr("transform", `translate(${margin.left + col * (facetW + facetGap)},${margin.top + row * (singleFacetH + rowGap)})`);

        const subset = rows.filter(d => d.outcome === outcome);
        const ext = d3.extent(subset.flatMap(d => [d.ci_lo, d.ci_hi]));
        const xMin = Math.min(0, ext[0] || 0);
        const xMax = Math.max(0, ext[1] || 0);
        const pad = Math.max(0.1, (xMax - xMin) * 0.08);
        const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, facetW]);
        const y = d3.scaleBand().domain(methods).range([0, facetH]).padding(0.35);

        // Title.
        facet.append("text").attr("x", facetW / 2).attr("y", -10)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13)
          .attr("font-weight", 600).text(outcome);

        // Zero line.
        facet.append("line")
          .attr("x1", x(0)).attr("x2", x(0))
          .attr("y1", 0).attr("y2", facetH)
          .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 4");

        // x axis.
        facet.append("g").attr("transform", `translate(0,${facetH})`)
          .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".2f")))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

        // Method labels (only on the leftmost facet of each row).
        if (col === 0) {
          methods.forEach(m => {
            svg.append("text")
              .attr("class", "facet")
              .attr("x", margin.left - 10)
              .attr("y", margin.top + row * (singleFacetH + rowGap) + y(m) + y.bandwidth() / 2 + 4)
              .attr("text-anchor", "end")
              .attr("fill", C.text)
              .attr("font-size", 12)
              .text(m);
          });
        }

        // Error bars + points.
        subset.forEach(d => {
          const yc = y(d.method) + y.bandwidth() / 2;
          const g = facet.append("g").attr("class", "row")
            .style("cursor", "pointer");
          g.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
            .attr("y1", yc).attr("y2", yc)
            .attr("stroke", colorMap[d.method] || C.text)
            .attr("stroke-width", 2);
          g.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
            .attr("y1", yc - 4).attr("y2", yc + 4)
            .attr("stroke", colorMap[d.method] || C.text).attr("stroke-width", 2);
          g.append("line")
            .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
            .attr("y1", yc - 4).attr("y2", yc + 4)
            .attr("stroke", colorMap[d.method] || C.text).attr("stroke-width", 2);
          g.append("circle")
            .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
            .attr("fill", colorMap[d.method] || C.text)
            .attr("stroke", "#fff").attr("stroke-width", 1);

          g.on("mousemove", function (ev) {
            const rect = container.getBoundingClientRect();
            tooltip.html(
              `<div><strong style="color:${colorMap[d.method]}">${d.method}</strong></div>` +
              `<div><span class='tooltip-key'>α̂ =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>` +
              `<div><span class='tooltip-key'>controls used =</span> <span class='tooltip-val'>${d.n_selected === null ? "0 (no controls)" : d.n_selected}</span></div>`
            )
            .classed("show", true)
            .style("left", (ev.clientX - rect.left + 12) + "px")
            .style("top",  (ev.clientY - rect.top  + 12) + "px");
          }).on("mouseleave", function () { tooltip.classed("show", false); });
        });
      });

      // ---- method-color legend below all facets (outside plot area) ----
      // Widths estimated with a fixed em (≈6.4 px at 11px font).
      const legendG = svg.append("g").attr("class", "fp-legend");
      const legendW = W - margin.left - margin.right;
      const PX = 6.4, SWATCH = 12, GAP_TXT = 6, GAP_ITEM = 20;
      const widths = methods.map(m => SWATCH + GAP_TXT + (m.length * PX));
      const total = widths.reduce((a, b) => a + b, 0) + GAP_ITEM * (methods.length - 1);
      let lx = 0;
      methods.forEach((m, i) => {
        legendG.append("circle")
          .attr("cx", lx + 6).attr("cy", 0).attr("r", 5)
          .attr("fill", colorMap[m] || C.text)
          .attr("stroke", "#fff").attr("stroke-width", 1);
        legendG.append("text")
          .attr("x", lx + SWATCH + GAP_TXT).attr("y", 4)
          .attr("fill", C.text).attr("font-size", 11)
          .text(m);
        lx += widths[i] + GAP_ITEM;
      });
      const legendY = margin.top + rowsCount * singleFacetH + (rowsCount - 1) * rowGap + 44;
      legendG.attr("transform",
        `translate(${margin.left + Math.max(0, (legendW - total) / 2)},${legendY})`);
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // Variable-selection bar chart (Tab 4).
  // data: precomputed selection records { outcome, method, n_Iy, n_Id, n_union }
  // ------------------------------------------------------------------
  function selection_bars(container) {
    const W = 880;
    const margin = { top: 24, right: 20, bottom: 36, left: 130 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 220`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    function update(data, activeOutcomes) {
      const outcomes = activeOutcomes.length ? activeOutcomes : ["Violent crime", "Property crime", "Murder"];
      const subset = data.filter(d => outcomes.includes(d.outcome));
      const nFacets = outcomes.length;
      const facetGap = 24;
      const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / nFacets;
      const facetH = 130;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet").remove();

      outcomes.forEach((outcome, oi) => {
        const facet = svg.append("g")
          .attr("class", "facet")
          .attr("transform", `translate(${margin.left + oi * (facetW + facetGap)},${margin.top})`);
        const sub = subset.filter(d => d.outcome === outcome);
        const max = d3.max(sub, d => d.n_union) || 1;
        const x = d3.scaleBand().domain(["DL (rigorous)", "DL (CV)"]).range([0, facetW]).padding(0.45);
        const y = d3.scaleLinear().domain([0, max * 1.1]).range([facetH, 0]);

        facet.append("text").attr("x", facetW / 2).attr("y", -8)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13)
          .attr("font-weight", 600).text(outcome);

        facet.append("g").attr("transform", `translate(0,${facetH})`)
          .call(d3.axisBottom(x).tickSize(0))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        if (oi === 0) {
          facet.append("g").call(d3.axisLeft(y).ticks(4))
            .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
          facet.append("text")
            .attr("transform", `rotate(-90) translate(${-facetH / 2},${-44})`)
            .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
            .text("Controls selected (out of 284)");
        }
        facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

        sub.forEach(d => {
          const xc = x(d.method);
          const w  = x.bandwidth();
          facet.append("rect")
            .attr("x", xc).attr("y", y(d.n_union))
            .attr("width", w).attr("height", facetH - y(d.n_union))
            .attr("fill", d.method === "DL (CV)" ? C.orange : C.teal)
            .attr("opacity", 0.85);
          facet.append("text")
            .attr("x", xc + w / 2).attr("y", y(d.n_union) - 4)
            .attr("text-anchor", "middle")
            .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
            .text(d.n_union);
        });
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Side-by-side alpha bars (Tab 3): rigorous vs CV vs true.
  //   data: { rigorous: number, cv: number, alpha_true: number }
  // ------------------------------------------------------------------
  function alpha_compare(container) {
    // Slightly taller top margin so the "true α" caption sits in dedicated
    // whitespace, never above (and therefore never overlapping) a bar.
    const W = 720, H = 220;
    const margin = { top: 36, right: 24, bottom: 36, left: 110 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const labels = [
        { name: "DL (CV)",       v: data.cv,       color: C.orange },
        { name: "DL (rigorous)", v: data.rigorous, color: C.teal   },
      ];
      const allVals = labels.map(d => d.v).concat([data.alpha_true, 0]);
      const ext = d3.extent(allVals);
      const span = Math.max(0.5, ext[1] - ext[0]);
      const pad = span * 0.15;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const y = d3.scaleBand().domain(labels.map(d => d.name)).range([0, h]).padding(0.4);

      // Zero line.
      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      // True alpha line.
      g.append("line").attr("x1", x(data.alpha_true)).attr("x2", x(data.alpha_true))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.steel).attr("stroke-width", 2);
      // Caption sits in dedicated whitespace above the plot. Anchor flips so
      // the text stays inside the SVG when alpha_true is near either edge.
      const lblX = x(data.alpha_true);
      const lblAnchor = lblX > w - 80 ? "end" : (lblX < 80 ? "start" : "middle");
      const lblDx = lblAnchor === "end" ? -4 : (lblAnchor === "start" ? 4 : 0);
      g.append("text").attr("x", lblX + lblDx).attr("y", -14)
        .attr("text-anchor", lblAnchor)
        .attr("fill", C.steel).attr("font-size", 11)
        .text(`true α = ${data.alpha_true.toFixed(2)}`);

      // Axes.
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

  // ------------------------------------------------------------------
  // Histograms (Tab 3 "Run 100 simulations").
  //   alphas_rig: array of estimates from rigorous pipeline
  //   alphas_cv:  array of estimates from CV pipeline
  //   alpha_true: number
  // ------------------------------------------------------------------
  function alpha_histograms(container) {
    // Extra top margin reserves a band above the bars for the legend + true-α
    // label so neither can overlap a histogram bar.
    const W = 720, H = 310;
    const margin = { top: 54, right: 24, bottom: 38, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const all = data.alphas_rig.concat(data.alphas_cv);
      if (all.length === 0) return;
      const ext = d3.extent(all);
      const span = Math.max(0.3, ext[1] - ext[0]);
      const pad = span * 0.05;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const nBins = 24;
      const bin = d3.bin().domain(x.domain()).thresholds(nBins);
      const binsR = bin(data.alphas_rig);
      const binsC = bin(data.alphas_cv);
      const maxC = d3.max(binsR.concat(binsC), d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      function drawBars(bins, color, opacity) {
        g.selectAll(null).data(bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", color).attr("opacity", opacity);
      }
      drawBars(binsC, C.orange, 0.65);
      drawBars(binsR, C.teal,   0.85);

      // Vertical "true α" reference line. Label is rendered ABOVE the plot area
      // (y = -18, in the reserved top margin) so it never overlaps a bar.
      g.append("line").attr("x1", x(data.alpha_true)).attr("x2", x(data.alpha_true))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.alpha_true)).attr("y", -22)
        .attr("text-anchor", "middle")
        .attr("fill", C.steel).attr("font-size", 11)
        .text(`true α = ${data.alpha_true.toFixed(2)}`);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated α̂ across 100 simulated datasets");

      // Legend in the reserved top band (y = -42, above the plot). Widths use
      // a fixed em estimate (≈6.4 px at 11px font).
      const items = [
        { color: C.teal,   label: "DL (rigorous)" },
        { color: C.orange, label: "DL (CV / naive)" },
      ];
      const legendY = -42;
      const lg = g.append("g");
      const SWATCH_W = 14, GAP_TXT = 6, GAP_ITEM = 22, PX_PER_CHAR = 6.4;
      const itemWidths = items.map(it => SWATCH_W + GAP_TXT + it.label.length * PX_PER_CHAR);
      const totalLegendW = itemWidths.reduce((a, b) => a + b, 0) + GAP_ITEM * (items.length - 1);
      let cursorX = 0;
      items.forEach((item, i) => {
        lg.append("rect")
          .attr("x", cursorX).attr("y", legendY - 6)
          .attr("width", SWATCH_W).attr("height", 10)
          .attr("fill", item.color).attr("opacity", 0.85);
        lg.append("text")
          .attr("x", cursorX + SWATCH_W + GAP_TXT).attr("y", legendY + 3)
          .attr("fill", C.text).attr("font-size", 11)
          .text(item.label);
        cursorX += itemWidths[i] + GAP_ITEM;
      });
      lg.attr("transform", `translate(${Math.max(0, (w - totalLegendW) / 2)},0)`);
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // GATE-by-moderator line chart (EconML Tab 4 panel).
  //   data: { "1-0": [{exec_constraints, gate, ci_lo, ci_hi, n}, ...],
  //           "3-1": [...] }
  // Two parallel lines on one axis; CI band per line.
  // ------------------------------------------------------------------
  function gate_lines(container) {
    // Bottom margin enlarged so the series legend can sit below the x-axis
    // without overlapping either line or its CI band.
    const W = 760, H = 380;
    const margin = { top: 18, right: 28, bottom: 110, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const series = [
        { key: "1-0", color: C.teal,   label: "Mining effect (1-0): institutions matter" },
        { key: "3-1", color: C.orange, label: "Price effect (3-1): flat across institutions" },
      ];
      const all = [];
      series.forEach(s => { if (data[s.key]) data[s.key].forEach(r => all.push(r)); });
      if (all.length === 0) return;
      const x = d3.scaleLinear().domain([1, 6]).range([0, w]);
      const yMin = d3.min(all, r => r.ci_lo);
      const yMax = d3.max(all, r => r.ci_hi);
      const yPad = (yMax - yMin) * 0.15;
      const y = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([h, 0]);

      // Axes
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Executive constraints (1 = weakest, 6 = strongest)");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("GATE estimate");

      const line = d3.line()
        .x(d => x(d.exec_constraints))
        .y(d => y(d.gate))
        .curve(d3.curveMonotoneX);

      // CI bands and lines
      series.forEach(s => {
        const rows = data[s.key] || [];
        if (rows.length === 0) return;
        const band = d3.area()
          .x(d => x(d.exec_constraints))
          .y0(d => y(d.ci_lo))
          .y1(d => y(d.ci_hi))
          .curve(d3.curveMonotoneX);
        g.append("path").datum(rows)
          .attr("fill", s.color).attr("opacity", 0.18)
          .attr("d", band);
        g.append("path").datum(rows)
          .attr("fill", "none").attr("stroke", s.color).attr("stroke-width", 2.5)
          .attr("d", line);
        rows.forEach(r => {
          g.append("circle")
            .attr("cx", x(r.exec_constraints)).attr("cy", y(r.gate))
            .attr("r", 4).attr("fill", s.color)
            .attr("stroke", "#fff").attr("stroke-width", 1);
        });
      });

      // Legend — placed BELOW the x-axis label so it cannot overlap a line
      // or CI band. Two stacked rows, centered. Widths use fixed em estimate.
      const legendTopY = h + 64;
      const lg = g.append("g");
      const PX = 6.4;
      const maxLegendW = 30 + Math.max(...series.map(s => s.label.length * PX));
      series.forEach((s, i) => {
        const yy = legendTopY + i * 18;
        lg.append("line")
          .attr("x1", 0).attr("x2", 22)
          .attr("y1", yy).attr("y2", yy)
          .attr("stroke", s.color).attr("stroke-width", 2.5);
        lg.append("circle")
          .attr("cx", 11).attr("cy", yy).attr("r", 4)
          .attr("fill", s.color)
          .attr("stroke", "#fff").attr("stroke-width", 1);
        lg.append("text")
          .attr("x", 30).attr("y", yy + 4)
          .attr("fill", C.text).attr("font-size", 11)
          .text(s.label);
      });
      lg.attr("transform", `translate(${Math.max(0, (w - maxLegendW) / 2)},0)`);
    }
    return { update };
  }

  window.CHARTS = {
    l1_vs_l2_animation,
    coefficient_path,
    forest_plot,
    selection_bars,
    alpha_compare,
    alpha_histograms,
    gate_lines,
    C,
  };
})();
