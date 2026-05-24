// charts.js — D3 chart builders for the FWL Interactive Lab.
//
// This bundle extends the write-app baseline with FWL-specific builders that
// visualise residualisation, naive-vs-FWL coefficient comparisons, and the
// summary forest plot from the post's table.

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
  // FWL residualisation animation (Tab 1).
  //   A scrolling demo of partialling-out: scatter of x_1 vs x_2 with the
  //   regression line and growing dashed residuals; then a flip into the
  //   residual space (tilde scatter) where the conditional slope appears.
  //
  //   No user input — the loop pulses between "raw view" and "residual view".
  // ------------------------------------------------------------------
  function fwl_residualisation_animation(container) {
    const W = 720, H = 380;
    // Extra top margin keeps both the title (titleLabel) and the live slope
    // annotation (slopeNote) ABOVE the plot area, so neither overlaps points.
    const margin = { top: 48, right: 28, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Pre-generate a tiny synthetic dataset where x2 (income) confounds x1 (coupons) -> y (sales).
    // True causal effect of x1 on y = +0.6 (positive); marginal slope appears negative.
    const N = 24;
    const seedRng = (function () { let a = 11; return function () { a = (a * 9301 + 49297) % 233280; return a / 233280; }; })();
    function normal() {
      let u = 0, v = 0;
      while (u === 0) u = seedRng();
      while (v === 0) v = seedRng();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
    const x2 = new Array(N), x1 = new Array(N), y = new Array(N);
    for (let i = 0; i < N; i++) {
      x2[i] = 50 + 10 * normal();                                  // income
      x1[i] = 60 - 0.6 * x2[i] + 5 * normal();                     // coupons (income lowers coupons)
      y[i]  = 10 + 0.4 * x1[i] + 0.45 * x2[i] + 3 * normal();      // sales (income raises sales)
    }
    // OLS slope of x1 on x2, and y on x2 (closed form).
    function slope(yy, xx) {
      let mx = 0, my = 0;
      for (let i = 0; i < N; i++) { mx += xx[i]; my += yy[i]; }
      mx /= N; my /= N;
      let num = 0, den = 0;
      for (let i = 0; i < N; i++) { num += (xx[i] - mx) * (yy[i] - my); den += (xx[i] - mx) ** 2; }
      return { a: my - (num / den) * mx, b: num / den, mx, my };
    }
    const s_x1_x2 = slope(x1, x2);
    const s_y_x2  = slope(y,  x2);
    // Residuals.
    const x1_tilde = x1.map((v, i) => v - (s_x1_x2.a + s_x1_x2.b * x2[i]));
    const y_tilde  = y.map((v, i) => v - (s_y_x2.a  + s_y_x2.b  * x2[i]));
    // Slope of y_tilde on x1_tilde (the FWL slope).
    const sFWL = slope(y_tilde, x1_tilde);

    // Two scales: raw view (x2 vs x1) and residual view (x1_tilde vs y_tilde).
    const xRaw = d3.scaleLinear().domain(d3.extent(x2)).nice().range([0, w]);
    const yRaw = d3.scaleLinear().domain(d3.extent(x1)).nice().range([h, 0]);
    const xRes = d3.scaleLinear().domain(d3.extent(x1_tilde)).nice().range([0, w]);
    const yRes = d3.scaleLinear().domain(d3.extent(y_tilde)).nice().range([h, 0]);

    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");
    const xLabel = g.append("text")
      .attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12);
    const yLabel = g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12);
    const titleLabel = g.append("text")
      .attr("x", w / 2).attr("y", -28)
      .attr("text-anchor", "middle").attr("fill", C.teal)
      .attr("font-size", 13).attr("font-weight", 600);

    const pts = g.append("g").attr("class", "pts");
    const fitLine = g.append("line")
      .attr("stroke", C.orange).attr("stroke-width", 2.5).style("display", "none");
    const resLines = g.append("g").attr("class", "reslines");
    // Live slope annotation lives ABOVE the plot area (negative y in the top
    // margin) so it cannot overlap the scatter points or fit line.
    const slopeNote = g.append("text")
      .attr("x", w - 8).attr("y", -10)
      .attr("text-anchor", "end").attr("fill", C.muted).attr("font-size", 11);

    function drawRaw(progress) {
      // progress 0..1: 0 = bare scatter, 0.4 = fitted line drawn, 0.7+ = residuals appearing.
      xAxisG.call(d3.axisBottom(xRaw).ticks(5)).selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(yRaw).ticks(5)).selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      xLabel.text("Income x₂  (the confounder)");
      yLabel.text("Coupons x₁  (the treatment)");
      titleLabel.text("Step 1 of FWL — regress treatment on the confounder");

      const sel = pts.selectAll("circle").data(d3.range(N), d => d);
      sel.exit().remove();
      sel.enter().append("circle").merge(sel)
        .attr("cx", i => xRaw(x2[i]))
        .attr("cy", i => yRaw(x1[i]))
        .attr("r", 5)
        .attr("fill", C.steel).attr("stroke", "#fff").attr("stroke-width", 1);

      if (progress > 0.4) {
        fitLine.style("display", null)
          .attr("x1", xRaw(xRaw.domain()[0])).attr("y1", yRaw(s_x1_x2.a + s_x1_x2.b * xRaw.domain()[0]))
          .attr("x2", xRaw(xRaw.domain()[1])).attr("y2", yRaw(s_x1_x2.a + s_x1_x2.b * xRaw.domain()[1]))
          .attr("opacity", Math.min(1, (progress - 0.4) * 3));
      } else {
        fitLine.style("display", "none");
      }

      const showRes = Math.max(0, (progress - 0.55) * (1 / 0.45));
      const lines = resLines.selectAll("line").data(d3.range(N), d => d);
      lines.exit().remove();
      lines.enter().append("line").merge(lines)
        .attr("x1", i => xRaw(x2[i]))
        .attr("x2", i => xRaw(x2[i]))
        .attr("y1", i => yRaw(x1[i]))
        .attr("y2", i => yRaw(s_x1_x2.a + s_x1_x2.b * x2[i]))
        .attr("stroke", C.teal)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3 3")
        .attr("opacity", showRes);

      slopeNote.text(`slope x₁ on x₂ = ${s_x1_x2.b.toFixed(2)}  (negative ⇒ confounding)`);
    }

    function drawResidual(progress) {
      // progress 0..1: 0 = empty, 0.4 = scatter, 0.7 = line.
      xAxisG.call(d3.axisBottom(xRes).ticks(5)).selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(yRes).ticks(5)).selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      xLabel.text("Residualised coupons  x̃₁");
      yLabel.text("Residualised sales  ỹ");
      titleLabel.text("Step 2 of FWL — regress the cleaned outcome on the cleaned treatment");

      const showPts = Math.min(1, progress / 0.35);
      const sel = pts.selectAll("circle").data(d3.range(N), d => d);
      sel.exit().remove();
      sel.enter().append("circle").merge(sel)
        .attr("cx", i => xRes(x1_tilde[i]))
        .attr("cy", i => yRes(y_tilde[i]))
        .attr("r", 5)
        .attr("fill", C.teal).attr("stroke", "#fff").attr("stroke-width", 1)
        .attr("opacity", showPts);

      resLines.selectAll("line").remove();

      if (progress > 0.5) {
        fitLine.style("display", null)
          .attr("x1", xRes(xRes.domain()[0])).attr("y1", yRes(sFWL.a + sFWL.b * xRes.domain()[0]))
          .attr("x2", xRes(xRes.domain()[1])).attr("y2", yRes(sFWL.a + sFWL.b * xRes.domain()[1]))
          .attr("opacity", Math.min(1, (progress - 0.5) * 3));
      } else {
        fitLine.style("display", "none");
      }
      slopeNote.text(`slope ỹ on x̃₁ = ${sFWL.b.toFixed(2)}  (positive ⇒ true causal effect)`);
    }

    // Cycle: 0..1 raw build-up, 1..1.5 hold, 1.5..2.5 residual build-up, 2.5..3 hold.
    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      const cycleLen = 8;
      const u = (elapsed % cycleLen) / cycleLen;       // 0..1
      if (u < 0.5) {
        const p = u / 0.5;                              // 0..1 within raw view
        drawRaw(Math.min(1, p));
      } else {
        const p = (u - 0.5) / 0.5;                      // 0..1 within residual view
        drawResidual(Math.min(1, p));
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Naive-vs-FWL bar chart (Tab 2).
  //   Two horizontal bars: naive OLS slope and FWL slope, plus a vertical
  //   line at the true causal effect.
  // ------------------------------------------------------------------
  function naive_vs_fwl_bars(container) {
    const W = 720, H = 240;
    // Extra top margin reserves space for the "true α" annotation ABOVE the
    // plot so it cannot overlap any bar value label inside the chart.
    const margin = { top: 44, right: 48, bottom: 36, left: 130 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const labels = [
        { name: "Naive OLS",       v: data.naive,    color: C.orange },
        { name: "FWL / Full OLS",  v: data.fwl,      color: C.teal   },
      ];
      const allVals = labels.map(d => d.v).concat([data.alpha_true, 0]);
      const ext = d3.extent(allVals);
      const span = Math.max(0.5, ext[1] - ext[0]);
      const pad = span * 0.18;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const y = d3.scaleBand().domain(labels.map(d => d.name)).range([0, h]).padding(0.4);

      // Zero line.
      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      // True alpha line. Label lives in the top margin (y=-18) so it cannot
      // collide with any in-plot bar value text.
      g.append("line").attr("x1", x(data.alpha_true)).attr("x2", x(data.alpha_true))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.alpha_true)).attr("y", -18)
        .attr("text-anchor", "middle")
        .attr("fill", C.steel).attr("font-size", 11).attr("font-weight", 600)
        .text(`true α = ${data.alpha_true.toFixed(2)}`);

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
  // Histograms of naive vs FWL estimates across simulated datasets (Tab 4).
  //   data: { naive: number[], fwl: number[], alpha_true: number }
  // ------------------------------------------------------------------
  function naive_vs_fwl_histograms(container) {
    const W = 720, H = 320;
    // Extra top margin reserves space for the legend ABOVE the plot area
    // so it never overlaps the histogram bars.
    const margin = { top: 56, right: 24, bottom: 40, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const all = data.naive.concat(data.fwl);
      if (all.length === 0) return;
      const ext = d3.extent(all);
      const span = Math.max(0.4, ext[1] - ext[0]);
      const pad = span * 0.06;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const nBins = 26;
      const bin = d3.bin().domain(x.domain()).thresholds(nBins);
      const binsN = bin(data.naive);
      const binsF = bin(data.fwl);
      const maxC = d3.max(binsN.concat(binsF), d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      function drawBars(bins, color, opacity) {
        g.selectAll(null).data(bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", color).attr("opacity", opacity);
      }
      drawBars(binsN, C.orange, 0.65);
      drawBars(binsF, C.teal,   0.85);

      // Zero line (since naive can flip sign).
      g.append("line").attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      // True alpha line. Label is rendered ABOVE the plot area (in the top
      // margin) so it cannot overlap any histogram bar.
      g.append("line").attr("x1", x(data.alpha_true)).attr("x2", x(data.alpha_true))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.alpha_true) + 4).attr("y", -6)
        .attr("fill", C.steel).attr("font-size", 11)
        .text(`true α = ${data.alpha_true.toFixed(2)}`);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 34})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated α̂ across simulated datasets");

      // Legend — placed ABOVE the plot area (in the top margin) as an inline
      // horizontal strip so it never overlaps histogram bars. Anchored to the
      // top-left of the plot region, with two swatch+label groups separated by
      // a small gap.
      const lg = g.append("g").attr("transform", `translate(0,${-28})`);
      // Swatch 1: Naive
      lg.append("rect").attr("x", 0).attr("y", 0).attr("width", 14).attr("height", 10)
        .attr("fill", C.orange).attr("opacity", 0.65);
      lg.append("text").attr("x", 20).attr("y", 9).attr("fill", C.text).attr("font-size", 11)
        .text("Naive OLS (omits income)");
      // Swatch 2: FWL — positioned to the right with a gap.
      const naiveLabelWidth = 175; // approximate width including swatch
      lg.append("rect").attr("x", naiveLabelWidth).attr("y", 0).attr("width", 14).attr("height", 10)
        .attr("fill", C.teal).attr("opacity", 0.85);
      lg.append("text").attr("x", naiveLabelWidth + 20).attr("y", 9).attr("fill", C.text).attr("font-size", 11)
        .text("FWL (controls for income)");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Forest plot for FWL methods (Tab 3).
  //   Single-outcome (sales) plot listing the 6 estimators from the post's
  //   summary table with CIs and the vertical reference line at true α = 0.20.
  // ------------------------------------------------------------------
  function fwl_forest_plot(container) {
    const W = 820;
    const margin = { top: 32, right: 28, bottom: 44, left: 220 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 340`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const colorMap = {
      "Naive OLS (no controls)":     C.orange,
      "Full OLS (+ income)":         C.teal,
      "FWL Step 1 (residualise X)":  C.steel,
      "FWL Step 2 (residualise both)": C.teal,
      "Full OLS (+ income + day)":   "#9bdcc3",
      "FWL (+ income + day)":        "#9bdcc3",
    };

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(rows, activeMethods, alphaTrue) {
      const methods = activeMethods.length ? activeMethods : rows.map(r => r.method);
      const filtered = rows.filter(d => methods.includes(d.method));

      const facetH = 34 * methods.length + 24;
      const totalH = margin.top + facetH + margin.bottom;
      const w = W - margin.left - margin.right;

      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet, text.title").remove();

      const ext = d3.extent(filtered.flatMap(d => [d.ci_lo, d.ci_hi, 0, alphaTrue]));
      const xMin = ext[0];
      const xMax = ext[1];
      const pad = Math.max(0.05, (xMax - xMin) * 0.08);
      const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, w]);
      const y = d3.scaleBand().domain(methods).range([0, facetH]).padding(0.35);

      const facet = svg.append("g")
        .attr("class", "facet")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Zero line.
      facet.append("line")
        .attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", facetH)
        .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 4");

      // True alpha line.
      facet.append("line")
        .attr("x1", x(alphaTrue)).attr("x2", x(alphaTrue))
        .attr("y1", 0).attr("y2", facetH)
        .attr("stroke", C.steel).attr("stroke-width", 2);
      facet.append("text").attr("x", x(alphaTrue) + 4).attr("y", -12)
        .attr("fill", C.steel).attr("font-size", 11)
        .text(`true α = ${alphaTrue.toFixed(2)}`);

      // x axis.
      facet.append("g").attr("transform", `translate(0,${facetH})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      facet.append("text")
        .attr("transform", `translate(${w / 2},${facetH + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated coupon coefficient α̂");
      facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Method labels (left).
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

      // Bars + points.
      filtered.forEach(d => {
        const yc = y(d.method) + y.bandwidth() / 2;
        const grp = facet.append("g").attr("class", "row").style("cursor", "pointer");
        const col = colorMap[d.method] || C.text;
        grp.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc)
          .attr("stroke", col).attr("stroke-width", 2);
        grp.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
          .attr("y1", yc - 5).attr("y2", yc + 5)
          .attr("stroke", col).attr("stroke-width", 2);
        grp.append("line")
          .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
          .attr("y1", yc - 5).attr("y2", yc + 5)
          .attr("stroke", col).attr("stroke-width", 2);
        grp.append("circle")
          .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5.5)
          .attr("fill", col).attr("stroke", "#fff").attr("stroke-width", 1);

        grp.on("mousemove", function (ev) {
          const rect = container.getBoundingClientRect();
          tooltip.html(
            `<div><strong style="color:${col}">${d.method}</strong></div>` +
            `<div><span class='tooltip-key'>α̂ =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(3)}</span></div>` +
            `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>` +
            `<div><span class='tooltip-key'>p-value =</span> <span class='tooltip-val'>${d.p.toFixed(3)}</span></div>`
          )
          .classed("show", true)
          .style("left", (ev.clientX - rect.left + 12) + "px")
          .style("top",  (ev.clientY - rect.top  + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // DGP helper for the FWL post (used by Tabs 2 and 4).
  //   Generates a single sample mimicking the post's simulate_store_data():
  //   income, coupons (negatively related to income), sales (positively
  //   related to both income and coupons). Returns vectors plus closed-form
  //   naive and FWL slopes.
  //
  //   gamma: income -> sales coefficient (default 0.3)
  //   delta: income -> coupons slope (default -0.5)
  //   alpha: TRUE coupons -> sales coefficient (default 0.2)
  //   n: sample size
  //   sigma_y: residual sd on sales (default 3)
  //   sigma_c: residual sd on coupons (default 5)
  // ------------------------------------------------------------------
  function simulate_fwl_sample(opts) {
    const n = Math.max(20, opts.n | 0);
    const gamma = +opts.gamma;
    const delta = +opts.delta;
    const alpha = +opts.alpha;
    const sigY = +opts.sigma_y || 3;
    const sigC = +opts.sigma_c || 5;
    const seed = (opts.seed >>> 0) || 1;
    const rng = window.DGP.mulberry32(seed);
    const normal = window.DGP.makeNormal(rng);

    const income = new Float64Array(n);
    const coupons = new Float64Array(n);
    const sales = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      income[i] = 50 + 10 * normal();
      coupons[i] = 60 + delta * income[i] + sigC * normal();
      sales[i] = 10 + alpha * coupons[i] + gamma * income[i] + sigY * normal();
    }

    // Slope of sales on coupons (NAIVE).
    function slopeXY(yvec, xvec) {
      let mx = 0, my = 0;
      for (let i = 0; i < n; i++) { mx += xvec[i]; my += yvec[i]; }
      mx /= n; my /= n;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) {
        const dx = xvec[i] - mx;
        num += dx * (yvec[i] - my);
        den += dx * dx;
      }
      const b = num / den;
      const a = my - b * mx;
      // residual sd, se.
      let ss = 0;
      for (let i = 0; i < n; i++) {
        const r = yvec[i] - (a + b * xvec[i]);
        ss += r * r;
      }
      const sig2 = ss / Math.max(1, n - 2);
      const se = Math.sqrt(sig2 / den);
      return { b, a, se };
    }
    const naive = slopeXY(sales, coupons);

    // FWL: residualise coupons on income and sales on income; slope of residuals.
    const r_ci = slopeXY(coupons, income);                  // coupons = a + b*income
    const r_si = slopeXY(sales, income);                    // sales   = a + b*income
    const c_til = new Float64Array(n);
    const s_til = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      c_til[i] = coupons[i] - (r_ci.a + r_ci.b * income[i]);
      s_til[i] = sales[i]   - (r_si.a + r_si.b * income[i]);
    }
    // Slope of s_til on c_til (no intercept, residuals are mean-zero by construction).
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += c_til[i] * s_til[i]; den += c_til[i] * c_til[i]; }
    const bFWL = num / den;
    let ss = 0;
    for (let i = 0; i < n; i++) {
      const r = s_til[i] - bFWL * c_til[i];
      ss += r * r;
    }
    // For a two-control regression DOF = n - 3 (intercept, coupons, income).
    const dof = Math.max(1, n - 3);
    const sig2 = ss / dof;
    const seFWL = Math.sqrt(sig2 / den);

    return {
      income, coupons, sales,
      coupons_tilde: c_til, sales_tilde: s_til,
      naive: { b: naive.b, se: naive.se },
      fwl:   { b: bFWL, se: seFWL },
      alpha_true: alpha,
    };
  }

  window.CHARTS = {
    fwl_residualisation_animation,
    naive_vs_fwl_bars,
    naive_vs_fwl_histograms,
    fwl_forest_plot,
    simulate_fwl_sample,
    C,
  };
})();
