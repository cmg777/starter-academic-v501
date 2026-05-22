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
    const W = 720, H = 320;
    const margin = { top: 28, right: 28, bottom: 44, left: 56 };
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

    // Legend
    const lg = g.append("g").attr("transform", `translate(${w - 220},${10})`);
    lg.append("rect").attr("width", 220).attr("height", 50).attr("fill", "rgba(15,23,41,0.6)").attr("stroke", C.line).attr("rx", 6);
    lg.append("circle").attr("cx", 14).attr("cy", 15).attr("r", 5).attr("fill", C.orange);
    lg.append("text").attr("x", 26).attr("y", 19).attr("fill", C.text).attr("font-size", 12).text("L1 (LASSO) — exactly zero");
    lg.append("circle").attr("cx", 14).attr("cy", 35).attr("r", 5).attr("fill", C.steel);
    lg.append("text").attr("x", 26).attr("y", 39).attr("fill", C.text).attr("font-size", 12).text("L2 (Ridge) — never zero");

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
    const W = 720, H = 360;
    const margin = { top: 20, right: 24, bottom: 44, left: 56 };
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
    const margin = { top: 28, right: 24, bottom: 36, left: 130 };
    const facetGap = 24;
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 320`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const colorMap = {
      "First diff":    C.steel,
      "OLS (full)":    C.muted,
      "PSL":           "#66e5de",
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
    const W = 720, H = 200;
    const margin = { top: 24, right: 24, bottom: 36, left: 110 };
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
      g.append("text").attr("x", x(data.alpha_true) + 4).attr("y", -8)
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
    const W = 720, H = 260;
    const margin = { top: 18, right: 24, bottom: 38, left: 50 };
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

      g.append("line").attr("x1", x(data.alpha_true)).attr("x2", x(data.alpha_true))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.alpha_true) + 4).attr("y", 10)
        .attr("fill", C.steel).attr("font-size", 11).text(`true α = ${data.alpha_true.toFixed(2)}`);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated α̂ across 100 simulated datasets");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Synthetic-control TAB 1: donor weights pie animation.
  //   A simple animated demonstration that the synthetic Basque is a
  //   sparse, convex combination dominated by 2 of 16 donors.
  //   Static visualisation — no live data needed at init time.
  // ------------------------------------------------------------------
  function donor_weight_animation(container) {
    const W = 720, H = 320;
    const svg = ensureSVG(container, W, H);
    // Final weights: Cataluna 85.1%, Madrid 14.9%, others 0
    const data = [
      { region: "Catalonia", weight: 0.851, color: C.steel },
      { region: "Madrid",    weight: 0.149, color: C.orange },
      { region: "14 other donors (weight = 0)", weight: 0, color: C.muted },
    ];
    const margin = { top: 24, right: 24, bottom: 40, left: 130 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 1]).range([0, w]);
    const y = d3.scaleBand().domain(data.map(d => d.region))
      .range([0, h]).padding(0.3);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".0%")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);
    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 32})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Donor weight in synthetic Basque");

    data.forEach(d => {
      const yc = y(d.region);
      g.append("text").attr("x", -10).attr("y", yc + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
        .text(d.region);
      const targetW = x(d.weight);
      const rect = g.append("rect")
        .attr("x", 0).attr("y", yc).attr("height", y.bandwidth())
        .attr("width", 0).attr("fill", d.color).attr("opacity", 0.88);
      rect.transition().duration(1100).delay(150).attr("width", targetW);
      g.append("text").attr("x", targetW + 6).attr("y", yc + y.bandwidth() / 2 + 4)
        .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
        .style("opacity", 0)
        .text(d3.format(".1%")(d.weight))
        .transition().duration(700).delay(1100).style("opacity", 1);
    });
  }

  // ------------------------------------------------------------------
  // Synthetic-control TAB 2: donor-weight bars (interactive).
  //   Re-uses pattern of selection_bars but for the full donor list.
  //   data: array of { region, weight }
  // ------------------------------------------------------------------
  function donor_weights_bar(container, donorData) {
    const W = 720;
    const margin = { top: 20, right: 24, bottom: 36, left: 200 };
    // Sort by weight descending
    const data = donorData.slice().sort((a, b) => b.weight - a.weight);
    const barH = 22;
    const facetH = data.length * barH + 10;
    const totalH = margin.top + facetH + margin.bottom;
    const w = W - margin.left - margin.right;
    const svg = ensureSVG(container, W, totalH);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xMax = Math.max(0.05, d3.max(data, d => d.weight) || 0.05) * 1.05;
    const x = d3.scaleLinear().domain([0, xMax]).range([0, w]);
    const y = d3.scaleBand().domain(data.map(d => d.region))
      .range([0, facetH]).padding(0.3);

    g.append("g").attr("transform", `translate(0,${facetH})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);
    g.append("text").attr("transform", `translate(${w / 2},${facetH + 32})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Donor weight (%)");

    data.forEach(d => {
      const yc = y(d.region);
      const color = d.weight > 0.5 ? C.steel : (d.weight > 0.01 ? C.orange : C.muted);
      g.append("text").attr("x", -10).attr("y", yc + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end")
        .attr("fill", d.weight > 0.001 ? C.text : C.muted)
        .attr("font-size", 11)
        .text(d.region);
      const targetW = x(d.weight);
      g.append("rect")
        .attr("x", 0).attr("y", yc).attr("height", y.bandwidth())
        .attr("width", Math.max(1, targetW))
        .attr("fill", color).attr("opacity", d.weight > 0.001 ? 0.88 : 0.25);
      if (d.weight > 0.001) {
        g.append("text").attr("x", targetW + 6).attr("y", yc + y.bandwidth() / 2 + 4)
          .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
          .text(d3.format(".1%")(d.weight));
      }
    });
  }

  // ------------------------------------------------------------------
  // Synthetic-control TAB 3: paths chart (actual vs synthetic vs gap).
  //   data: array of { year, actual, synthetic, gap }
  //   options: { showActual, showSynthetic, showGap, treatmentYear }
  // ------------------------------------------------------------------
  function paths_chart(container) {
    const W = 760, H = 380;
    const margin = { top: 24, right: 30, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");
    const linesG = g.append("g");

    g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Year");

    const yLabel = g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12);

    let tooltip = d3.select(container).select(".tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select(container).append("div").attr("class", "tooltip");
    }

    function update(data, opts) {
      opts = opts || { showActual: true, showSynthetic: true, showGap: false, treatmentYear: 1970 };
      linesG.selectAll("*").remove();
      const years = data.map(d => d.year);
      const x = d3.scaleLinear().domain(d3.extent(years)).range([0, w]);

      let yMin, yMax;
      if (opts.showGap) {
        const gaps = data.map(d => d.gap);
        yMin = Math.min(0, d3.min(gaps) || 0) - 0.1;
        yMax = Math.max(0, d3.max(gaps) || 0) + 0.1;
        yLabel.text("Gap = actual − synthetic  (thousand 1986 USD)");
      } else {
        const vals = [];
        if (opts.showActual)    data.forEach(d => vals.push(d.actual));
        if (opts.showSynthetic) data.forEach(d => vals.push(d.synthetic));
        if (vals.length === 0) vals.push(0, 10);
        yMin = d3.min(vals) - 0.4;
        yMax = d3.max(vals) + 0.4;
        yLabel.text("GDP per capita  (thousand 1986 USD)");
      }
      const y = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

      xAxisG.call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(y).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Pre-treatment shading
      const treatX = x(opts.treatmentYear);
      linesG.append("rect")
        .attr("x", 0).attr("y", 0).attr("width", treatX).attr("height", h)
        .attr("fill", C.muted).attr("opacity", 0.07);

      // Treatment line
      linesG.append("line").attr("x1", treatX).attr("x2", treatX)
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.muted).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
      linesG.append("text").attr("x", treatX + 4).attr("y", 12)
        .attr("fill", C.muted).attr("font-size", 10)
        .text("1970 onset →");

      // Zero line for gap mode
      if (opts.showGap) {
        linesG.append("line").attr("x1", 0).attr("x2", w)
          .attr("y1", y(0)).attr("y2", y(0))
          .attr("stroke", C.faint).attr("stroke-dasharray", "2 4");
      }

      const lineGen = d3.line().curve(d3.curveMonotoneX);

      if (opts.showActual && !opts.showGap) {
        linesG.append("path")
          .attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.6)
          .attr("d", lineGen.x(d => x(d.year)).y(d => y(d.actual))(data));
      }
      if (opts.showSynthetic && !opts.showGap) {
        linesG.append("path")
          .attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2.4)
          .attr("stroke-dasharray", "6 4")
          .attr("d", lineGen.x(d => x(d.year)).y(d => y(d.synthetic))(data));
      }
      if (opts.showGap) {
        linesG.append("path")
          .attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 2.6)
          .attr("d", lineGen.x(d => x(d.year)).y(d => y(d.gap))(data));
        // Mark peak gap
        const peak = data.reduce((a, b) => Math.abs(b.gap) > Math.abs(a.gap) ? b : a, data[0]);
        linesG.append("circle").attr("cx", x(peak.year)).attr("cy", y(peak.gap))
          .attr("r", 5).attr("fill", C.orange).attr("stroke", "#fff").attr("stroke-width", 1);
        linesG.append("text").attr("x", x(peak.year) + 8).attr("y", y(peak.gap) + 4)
          .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
          .text(`peak ${peak.year}: ${peak.gap.toFixed(3)}`);
      }

      // Hover dots
      data.forEach(d => {
        if (!opts.showGap) {
          if (opts.showActual) {
            linesG.append("circle").attr("cx", x(d.year)).attr("cy", y(d.actual))
              .attr("r", 3).attr("fill", C.orange).attr("opacity", 0.65)
              .on("mouseover", function (ev) {
                const rect = container.getBoundingClientRect();
                tooltip.html(
                  `<div><strong style="color:${C.orange}">Actual Basque</strong></div>` +
                  `<div><span class='tooltip-key'>year</span> <span class='tooltip-val'>${d.year}</span></div>` +
                  `<div><span class='tooltip-key'>GDP/cap</span> <span class='tooltip-val'>${d.actual.toFixed(3)}</span></div>` +
                  `<div><span class='tooltip-key'>gap</span> <span class='tooltip-val'>${d.gap.toFixed(3)}</span></div>`
                ).classed("show", true)
                  .style("left", (ev.clientX - rect.left + 12) + "px")
                  .style("top",  (ev.clientY - rect.top  + 12) + "px");
              }).on("mouseleave", () => tooltip.classed("show", false));
          }
          if (opts.showSynthetic) {
            linesG.append("circle").attr("cx", x(d.year)).attr("cy", y(d.synthetic))
              .attr("r", 3).attr("fill", C.steel).attr("opacity", 0.55);
          }
        }
      });

      // Legend
      const lg = g.append("g").attr("transform", `translate(${w - 220},${10})`);
      lg.append("rect").attr("width", 220).attr("height", opts.showGap ? 36 : 56)
        .attr("fill", "rgba(15,23,41,0.6)").attr("stroke", C.line).attr("rx", 6);
      if (opts.showGap) {
        lg.append("line").attr("x1", 12).attr("x2", 32).attr("y1", 18).attr("y2", 18)
          .attr("stroke", C.teal).attr("stroke-width", 2.6);
        lg.append("text").attr("x", 40).attr("y", 22).attr("fill", C.text).attr("font-size", 12)
          .text("Gap (actual − synthetic)");
      } else {
        if (opts.showActual) {
          lg.append("line").attr("x1", 12).attr("x2", 32).attr("y1", 18).attr("y2", 18)
            .attr("stroke", C.orange).attr("stroke-width", 2.6);
          lg.append("text").attr("x", 40).attr("y", 22).attr("fill", C.text).attr("font-size", 12)
            .text("Actual Basque (observed)");
        }
        if (opts.showSynthetic) {
          lg.append("line").attr("x1", 12).attr("x2", 32).attr("y1", 38).attr("y2", 38)
            .attr("stroke", C.steel).attr("stroke-width", 2.4).attr("stroke-dasharray", "6 4");
          lg.append("text").attr("x", 40).attr("y", 42).attr("fill", C.text).attr("font-size", 12)
            .text("Synthetic Basque (counterfactual)");
        }
      }
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Synthetic-control TAB 4: in-space placebo chart.
  //   Plots ratio (post/pre MSPE) as horizontal bars; highlights Basque.
  //   data: array of placebo records.
  //   opts: { trimmedOnly: bool }
  // ------------------------------------------------------------------
  function placebo_chart(container) {
    const W = 760;
    const margin = { top: 20, right: 30, bottom: 40, left: 200 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 480`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    let tooltip = d3.select(container).select(".tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select(container).append("div").attr("class", "tooltip");
    }

    function update(data, opts) {
      opts = opts || { trimmedOnly: true };
      svg.selectAll("g").remove();
      const filtered = opts.trimmedOnly
        ? data.filter(d => d.rank_trimmed !== null)
        : data;
      const sorted = filtered.slice().sort((a, b) => b.ratio - a.ratio);
      const barH = 22;
      const facetH = sorted.length * barH + 10;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      const w = W - margin.left - margin.right;
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const xMax = Math.max(1, d3.max(sorted, d => d.ratio) || 1) * 1.05;
      const x = d3.scaleLinear().domain([0, xMax]).range([0, w]);
      const y = d3.scaleBand().domain(sorted.map(d => d.region))
        .range([0, facetH]).padding(0.25);

      g.append("g").attr("transform", `translate(0,${facetH})`)
        .call(d3.axisBottom(x).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${facetH + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Post-1970 MSPE / Pre-1970 MSPE ratio");

      sorted.forEach((d, i) => {
        const yc = y(d.region);
        const isBasque = d.regionno === 17;
        const isCatalonia = d.regionno === 10;
        const color = isBasque ? C.orange : (isCatalonia ? "#9bdcc3" : C.steel);

        g.append("text").attr("x", -10).attr("y", yc + y.bandwidth() / 2 + 4)
          .attr("text-anchor", "end").attr("fill", isBasque ? C.orange : C.text)
          .attr("font-size", 11).attr("font-weight", isBasque ? 700 : 400)
          .text(d.region);

        const targetW = x(d.ratio);
        const rect = g.append("rect")
          .attr("x", 0).attr("y", yc).attr("height", y.bandwidth())
          .attr("width", Math.max(1, targetW))
          .attr("fill", color).attr("opacity", isBasque ? 0.95 : 0.65)
          .style("cursor", "pointer");
        rect.on("mousemove", function (ev) {
          const rectc = container.getBoundingClientRect();
          tooltip.html(
            `<div><strong style="color:${color}">${d.region}</strong></div>` +
            `<div><span class='tooltip-key'>ratio</span> <span class='tooltip-val'>${d.ratio.toFixed(2)}</span></div>` +
            `<div><span class='tooltip-key'>pre-MSPE</span> <span class='tooltip-val'>${d.pre_mspe.toFixed(5)}</span></div>` +
            `<div><span class='tooltip-key'>post-MSPE</span> <span class='tooltip-val'>${d.post_mspe.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>rank (full / trimmed)</span> <span class='tooltip-val'>${d.rank} / ${d.rank_trimmed ?? "—"}</span></div>`
          ).classed("show", true)
            .style("left", (ev.clientX - rectc.left + 12) + "px")
            .style("top",  (ev.clientY - rectc.top  + 12) + "px");
        }).on("mouseleave", () => tooltip.classed("show", false));

        g.append("text").attr("x", targetW + 6).attr("y", yc + y.bandwidth() / 2 + 4)
          .attr("fill", C.text).attr("font-size", 11)
          .attr("font-weight", isBasque ? 700 : 400)
          .text(d.ratio.toFixed(1));
      });
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
    donor_weight_animation,
    donor_weights_bar,
    paths_chart,
    placebo_chart,
    C,
  };
})();
