// charts.js — D3 chart builders for the python_did101 (DiD-101) web app.
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
  // Parallel-trends animation (Tab 1).
  //   Two periods (pre, post) with the post's group means. The comparison
  //   line and the treated counterfactual rise by the same 10.88-point trend.
  //   A "treatment" factor k sweeps 0 -> 1 -> 0: at k = 0 the treated line
  //   follows the counterfactual (parallel to the comparison line); at k = 1
  //   it reaches the observed post mean, and the vertical gap is the ATT.
  // ------------------------------------------------------------------
  function parallel_trends_animation(container) {
    const W = 720, H = 340;
    const margin = { top: 28, right: 180, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const M = { cPre: 71.22, cPost: 82.10, tPre: 60.17, tPost: 96.37 };
    const cf = M.tPre + (M.cPost - M.cPre);   // 71.05
    const att = M.tPost - cf;                 // 25.32

    const x = d3.scalePoint().domain(["Pre-program", "Post-program"]).range([40, w - 40]);
    const y = d3.scaleLinear().domain([55, 100]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, line").attr("stroke", C.muted);
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle")
      .attr("fill", C.text)
      .attr("font-size", 12)
      .text("Average GPA");

    const x0 = x("Pre-program"), x1 = x("Post-program");

    // Comparison schools (observed) and treated counterfactual (dashed).
    g.append("line").attr("x1", x0).attr("y1", y(M.cPre)).attr("x2", x1).attr("y2", y(M.cPost))
      .attr("stroke", C.steel).attr("stroke-width", 2.5);
    g.append("line").attr("x1", x0).attr("y1", y(M.tPre)).attr("x2", x1).attr("y2", y(cf))
      .attr("stroke", C.teal).attr("stroke-width", 2).attr("stroke-dasharray", "5 5");
    [[x0, M.cPre], [x1, M.cPost]].forEach(([px, py]) =>
      g.append("circle").attr("cx", px).attr("cy", y(py)).attr("r", 5).attr("fill", C.steel));

    // Treated schools: the post-period end point moves with the treatment factor.
    const tLine = g.append("line").attr("x1", x0).attr("y1", y(M.tPre)).attr("x2", x1)
      .attr("stroke", C.orange).attr("stroke-width", 2.5);
    g.append("circle").attr("cx", x0).attr("cy", y(M.tPre)).attr("r", 5).attr("fill", C.orange);
    const tDot = g.append("circle").attr("cx", x1).attr("r", 6).attr("fill", C.orange);

    // ATT bracket between counterfactual and treated post point.
    const gap = g.append("line").attr("x1", x1 + 14).attr("x2", x1 + 14).attr("y1", y(cf))
      .attr("stroke", C.text).attr("stroke-width", 1.5);
    const gapLabel = g.append("text").attr("x", x1 + 22).attr("fill", C.text).attr("font-size", 12);

    // Legend, right of the plot area so it never covers the lines.
    const lg = g.append("g").attr("transform", `translate(${w + 12},${8})`);
    [["Comparison schools", C.steel, null], ["Treated schools", C.orange, null],
     ["Treated counterfactual", C.teal, "5 5"]].forEach(([label, col, dash], i) => {
      lg.append("line").attr("x1", 0).attr("x2", 18).attr("y1", 8 + i * 20).attr("y2", 8 + i * 20)
        .attr("stroke", col).attr("stroke-width", 2.5).attr("stroke-dasharray", dash);
      lg.append("text").attr("x", 24).attr("y", 12 + i * 20).attr("fill", C.text).attr("font-size", 11).text(label);
    });

    function draw(k) {
      const yPost = cf + k * att;
      tLine.attr("y2", y(yPost));
      tDot.attr("cy", y(yPost));
      gap.attr("y2", y(yPost));
      gapLabel.attr("y", y((cf + yPost) / 2) + 4).text(`gap = ${(k * att).toFixed(2)}`);
    }

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { draw(1); return; }
    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      // Hold at each end briefly: clamp a slow sine to [0, 1].
      const k = Math.min(1, Math.max(0, (Math.sin(elapsed * 0.8) + 1) / 2 * 1.3 - 0.15));
      draw(k);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Forest plot (Tab 3).
  //   Horizontal CIs with dots, faceted by outcome.
  //   data: array of { method, outcome, estimate, ci_lo, ci_hi, n_selected, se }
  //   activeMethods: Array<string> of methods to show.
  //   activeOutcomes: Array<string> of outcomes to show.
  // ------------------------------------------------------------------
  function forest_plot(container) {
    const W = 880;
    const margin = { top: 28, right: 24, bottom: 36, left: 130 };
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
      const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / nFacets;
      const facetH = 28 * methods.length + 24;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet").remove();

      outcomes.forEach((outcome, oi) => {
        const facet = svg.append("g")
          .attr("class", "facet")
          .attr("transform", `translate(${margin.left + oi * (facetW + facetGap)},${margin.top})`);

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
              `<div><span class='tooltip-key'>Estimate =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
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
    }

    return { update };
  }

  window.CHARTS = {
    parallel_trends_animation,
    forest_plot,
    C,
  };
})();
