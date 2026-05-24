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

  // ==================================================================
  // r_dynamic_bma specific chart builders (appended by /project:write-app)
  // ==================================================================

  // ------------------------------------------------------------------
  // Tab 1: BMA concept animation.
  //   Visualises the posterior model probability (PMP) concentration.
  //   A grid of small squares (one per model) starts uniform (flat prior)
  //   then concentrates on a few dominant models (data-weighted posterior),
  //   mirroring the §9.1 "prior vs posterior" figure from the post.
  // ------------------------------------------------------------------
  function bma_concept_animation(container) {
    const W = 720, H = 320;
    const margin = { top: 18, right: 18, bottom: 44, left: 18 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const cols = 32, rows = 16, nModels = cols * rows;  // 512
    const cellW = w / cols, cellH = (h - 30) / rows;

    // "True" posterior mass: exponential decay so a handful of models
    // hold most of the probability (matches §9.1's spike pattern).
    const pmpRank = d3.range(nModels).map(k => Math.exp(-k * 0.045));
    const pmpSum = d3.sum(pmpRank);
    const targetPMP = pmpRank.map(v => v / pmpSum);
    // Randomise positions so the dominant cells are scattered, not banded.
    const positionOfRank = d3.shuffle(d3.range(nModels));

    const color = d3.scaleSequential(d3.interpolateRgbBasis([
      C.bg, C.steel, C.orange,
    ])).domain([0, d3.max(targetPMP)]);

    const cells = g.append("g");
    for (let k = 0; k < nModels; k++) {
      const r = Math.floor(k / cols), c = k % cols;
      // For DOM index k, find which rank lands here.
      const rankHere = positionOfRank.indexOf(k);
      cells.append("rect")
        .attr("class", "model-cell")
        .attr("x", c * cellW + 1)
        .attr("y", r * cellH + 1)
        .attr("width", cellW - 2)
        .attr("height", cellH - 2)
        .attr("rx", 2)
        .attr("fill", C.bg)
        .attr("data-rankhere", rankHere);
    }

    const phaseText = g.append("text")
      .attr("x", w / 2).attr("y", h - 8)
      .attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600);

    let phase = "prior";       // "prior" => "posterior"
    let phaseStart = null;

    function step(ts) {
      if (phaseStart === null) phaseStart = ts;
      const elapsed = (ts - phaseStart) / 1000;
      const T = 2.8;
      const t = Math.min(1, elapsed / T);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const flatP = 1 / nModels;

      cells.selectAll("rect.model-cell").each(function () {
        const rankHere = +this.getAttribute("data-rankhere");
        const finalP = targetPMP[rankHere];
        const v = phase === "prior"
          ? flatP + (finalP - flatP) * eased
          : finalP + (flatP - finalP) * eased;
        d3.select(this).attr("fill", color(v));
      });

      if (phase === "prior") {
        phaseText.text(eased < 0.5
          ? "Prior: uniform over 2⁹ = 512 models (every recipe equally weighted)"
          : "Posterior: a handful of models dominate (top PMP ≈ 8.9%)");
      } else {
        phaseText.text(eased < 0.5
          ? "Posterior: a handful of models dominate (top PMP ≈ 8.9%)"
          : "Prior: uniform over 2⁹ = 512 models (every recipe equally weighted)");
      }

      if (t >= 1) {
        phase = (phase === "prior") ? "posterior" : "prior";
        phaseStart = ts + 700;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return { update: () => {} };
  }

  // ------------------------------------------------------------------
  // Tab 2: PIP forest plot.
  //   Repurposes the forest-plot pattern: each "outcome" is a regressor;
  //   each "method" is a prior. Domain fixed to [0, 1] so PIPs compare
  //   across priors. Threshold lines at 0.50, 0.75, 0.95.
  // ------------------------------------------------------------------
  function pip_forest(container) {
    const W = 880;
    const margin = { top: 56, right: 20, bottom: 44, left: 140 };
    const facetGap = 26;
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 480`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const colorMap = {
      "Binomial":       C.steel,
      "Binomial-Beta":  C.teal,
      "Skeptical EMS2": C.orange,
      "Dilution":       "#c8b8ff",
    };
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(data, activeMethods, activeOutcomes) {
      const allMethods = ["Binomial", "Binomial-Beta", "Skeptical EMS2", "Dilution"];
      const methods = activeMethods.length ? activeMethods : allMethods;
      const allOutcomes = Array.from(new Set(data.map(d => d.outcome)));
      const outcomes = activeOutcomes.length ? activeOutcomes : allOutcomes;
      const rows = data.filter(d => methods.includes(d.method) && outcomes.includes(d.outcome));

      const nFacets = methods.length;
      const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / nFacets;
      const facetH = Math.max(220, 26 * outcomes.length);
      const totalH = margin.top + facetH + margin.bottom + 18;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet, text.facet, text.global-title").remove();

      svg.append("text").attr("class", "global-title")
        .attr("x", W / 2).attr("y", 22)
        .attr("text-anchor", "middle").attr("fill", C.text)
        .attr("font-size", 13).attr("font-weight", 600)
        .text("Posterior Inclusion Probability across 9 candidates and up to 4 priors");

      methods.forEach((method, oi) => {
        const facet = svg.append("g")
          .attr("class", "facet")
          .attr("transform", `translate(${margin.left + oi * (facetW + facetGap)},${margin.top})`);

        const subset = rows.filter(d => d.method === method);
        const x = d3.scaleLinear().domain([0, 1]).range([0, facetW]);
        const y = d3.scaleBand().domain(outcomes).range([0, facetH]).padding(0.30);

        facet.append("text").attr("x", facetW / 2).attr("y", -10)
          .attr("text-anchor", "middle").attr("fill", C.text)
          .attr("font-size", 12).attr("font-weight", 600).text(method);

        [0.5, 0.75, 0.95].forEach((thr, k) => {
          facet.append("line")
            .attr("x1", x(thr)).attr("x2", x(thr))
            .attr("y1", 0).attr("y2", facetH)
            .attr("stroke", k === 2 ? C.teal : C.faint)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", k === 0 ? "2 4" : (k === 1 ? "4 4" : null));
        });

        facet.append("g").attr("transform", `translate(0,${facetH})`)
          .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".1f")))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

        if (oi === 0) {
          outcomes.forEach(name => {
            svg.append("text").attr("class", "facet")
              .attr("x", margin.left - 10)
              .attr("y", margin.top + y(name) + y.bandwidth() / 2 + 4)
              .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
              .text(name);
          });
        }

        subset.forEach(d => {
          const yc = y(d.outcome) + y.bandwidth() / 2;
          const xc = x(d.pip);
          const robust = d.pip >= 0.95 ? "very strong"
                       : d.pip >= 0.75 ? "positive"
                       : d.pip >= 0.50 ? "weak"
                       : "below 0.5";
          facet.append("rect")
            .attr("x", 0).attr("y", yc - 4)
            .attr("width", xc).attr("height", 8)
            .attr("fill", colorMap[method] || C.text).attr("opacity", 0.15);
          const c = facet.append("circle")
            .attr("cx", xc).attr("cy", yc).attr("r", 5)
            .attr("fill", colorMap[method] || C.text)
            .attr("stroke", "#fff").attr("stroke-width", 1).style("cursor", "pointer");
          c.on("mousemove", function (ev) {
            const rect = container.getBoundingClientRect();
            tooltip.html(
              `<div><strong style="color:${colorMap[method]}">${d.outcome}</strong></div>` +
              `<div><span class='tooltip-key'>prior:</span> <span class='tooltip-val'>${method}</span></div>` +
              `<div><span class='tooltip-key'>PIP =</span> <span class='tooltip-val'>${d.pip.toFixed(3)}</span></div>` +
              `<div><span class='tooltip-key'>PM =</span> <span class='tooltip-val'>${d.estimate.toFixed(3)}</span></div>` +
              `<div><span class='tooltip-key'>PSD =</span> <span class='tooltip-val'>${d.se.toFixed(3)}</span></div>` +
              `<div><span class='tooltip-key'>evidence:</span> <span class='tooltip-val'>${robust}</span></div>`
            ).classed("show", true)
              .style("left", (ev.clientX - rect.left + 12) + "px")
              .style("top",  (ev.clientY - rect.top  + 12) + "px");
          }).on("mouseleave", function () { tooltip.classed("show", false); });
        });
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 3: prior-sensitivity bars.
  //   Live response to the EMS slider. Each bar = PIP for one variable
  //   under the user's chosen prior. Coloured by evidence tier.
  // ------------------------------------------------------------------
  function pip_bars(container) {
    const W = 820, H = 380;
    const margin = { top: 56, right: 60, bottom: 56, left: 130 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 1]).range([0, w]);

    function update(rows) {
      g.selectAll("*").remove();
      rows = rows.slice().sort((a, b) => b.pip - a.pip);
      const y = d3.scaleBand().domain(rows.map(r => r.label)).range([0, h]).padding(0.25);

      // Threshold lines extend slightly above the plot so labels sit clearly
      // above any bar value labels.
      [0.5, 0.75, 0.95].forEach((thr, k) => {
        g.append("line")
          .attr("x1", x(thr)).attr("x2", x(thr))
          .attr("y1", -18).attr("y2", h)
          .attr("stroke", k === 2 ? C.teal : C.faint)
          .attr("stroke-width", k === 2 ? 1.5 : 1)
          .attr("stroke-dasharray", k === 0 ? "2 4" : (k === 1 ? "4 4" : null));
        // Semi-transparent background pill behind the threshold label so it
        // remains legible even if a bar value sits close to it.
        const labelText = thr === 0.5 ? "0.50 weak" : thr === 0.75 ? "0.75 positive" : "0.95 strong";
        const tw = labelText.length * 5.5 + 8;
        g.append("rect")
          .attr("x", x(thr) - tw / 2).attr("y", -34)
          .attr("width", tw).attr("height", 16)
          .attr("fill", "rgba(15,23,41,0.75)").attr("rx", 3);
        g.append("text").attr("x", x(thr)).attr("y", -22)
          .attr("text-anchor", "middle")
          .attr("fill", k === 2 ? C.teal : C.muted)
          .attr("font-size", 10)
          .text(labelText);
      });

      rows.forEach(r => {
        const color = r.pip >= 0.95 ? C.teal
                    : r.pip >= 0.75 ? C.steel
                    : r.pip >= 0.50 ? "#c8b8ff"
                    : C.orange;
        g.append("rect")
          .attr("x", 0).attr("y", y(r.label))
          .attr("width", x(r.pip)).attr("height", y.bandwidth())
          .attr("fill", color).attr("opacity", 0.85).attr("rx", 3);
        // Place the PIP value label inside the bar (right-aligned) when there
        // is enough room; otherwise place it just outside the bar's right
        // edge. This guarantees it never collides with the threshold legend
        // markers along the top edge of the plot.
        const labelStr = r.pip.toFixed(3) + (r.sign ? "  (" + r.sign + ")" : "");
        const approxWidth = labelStr.length * 6.2 + 12;
        const insideOK = x(r.pip) >= approxWidth + 8;
        const tx = insideOK ? x(r.pip) - 6 : x(r.pip) + 6;
        const tAnchor = insideOK ? "end" : "start";
        const tFill = insideOK ? "#0f1729" : C.text;
        const tWeight = insideOK ? 600 : 400;
        g.append("text")
          .attr("x", tx).attr("y", y(r.label) + y.bandwidth() / 2 + 4)
          .attr("text-anchor", tAnchor)
          .attr("fill", tFill).attr("font-size", 11).attr("font-weight", tWeight)
          .text(labelStr);
        g.append("text")
          .attr("x", -8).attr("y", y(r.label) + y.bandwidth() / 2 + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(r.label);
      });

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".1f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Simulated PIP under the chosen prior");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 4: jointness heatmap.
  //   Symmetric matrix of HCGHM jointness values, hover for details.
  // ------------------------------------------------------------------
  function jointness_heatmap(container) {
    const W = 720, H = 560;
    const margin = { top: 100, right: 70, bottom: 36, left: 100 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(pairs, vars) {
      g.selectAll("*").remove();
      svg.selectAll("g.legend").remove();

      const cell = Math.min(w, h) / vars.length;
      const x = d3.scaleBand().domain(vars).range([0, cell * vars.length]).padding(0.02);
      const y = d3.scaleBand().domain(vars).range([0, cell * vars.length]).padding(0.02);

      const vmax = d3.max(pairs, d => d.value) || 1;
      const color = d3.scaleSequential(d3.interpolateRgbBasis([
        C.bg, C.steel, C.teal, "#fff8c8",
      ])).domain([0, Math.max(0.5, vmax)]);

      const lookup = new Map();
      pairs.forEach(p => {
        lookup.set(p.row + "|" + p.col, p.value);
        lookup.set(p.col + "|" + p.row, p.value);
      });

      vars.forEach(r => {
        vars.forEach(c => {
          if (r === c) {
            g.append("rect")
              .attr("x", x(c)).attr("y", y(r))
              .attr("width", x.bandwidth()).attr("height", y.bandwidth())
              .attr("fill", C.faint).attr("stroke", C.muted).attr("stroke-width", 0.5);
            return;
          }
          const v = lookup.get(r + "|" + c);
          if (v === undefined) return;
          const cellG = g.append("g");
          cellG.append("rect")
            .attr("x", x(c)).attr("y", y(r))
            .attr("width", x.bandwidth()).attr("height", y.bandwidth())
            .attr("fill", color(v)).style("cursor", "pointer");
          if (v >= 0.35) {
            cellG.append("text")
              .attr("x", x(c) + x.bandwidth() / 2).attr("y", y(r) + y.bandwidth() / 2 + 4)
              .attr("text-anchor", "middle").attr("fill", "#141413")
              .attr("font-size", 10).attr("font-weight", 600)
              .text(v.toFixed(2));
          }
          cellG.on("mousemove", function (ev) {
            const rect = container.getBoundingClientRect();
            const type = v >= 0.4 ? "strong complements"
                       : v > 0   ? "weak complements"
                                 : "substitutes";
            tooltip.html(
              `<div><strong>${r} × ${c}</strong></div>` +
              `<div><span class='tooltip-key'>HCGHM =</span> <span class='tooltip-val'>${v.toFixed(3)}</span></div>` +
              `<div><span class='tooltip-key'>type:</span> <span class='tooltip-val'>${type}</span></div>`
            ).classed("show", true)
              .style("left", (ev.clientX - rect.left + 12) + "px")
              .style("top",  (ev.clientY - rect.top  + 12) + "px");
          }).on("mouseleave", function () { tooltip.classed("show", false); });
        });
      });

      vars.forEach(v => {
        g.append("text").attr("x", x(v) + x.bandwidth() / 2).attr("y", -8)
          .attr("text-anchor", "start").attr("fill", C.text).attr("font-size", 11)
          .attr("transform", `rotate(-45, ${x(v) + x.bandwidth() / 2}, -8)`)
          .text(v);
        g.append("text").attr("x", -8).attr("y", y(v) + y.bandwidth() / 2 + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 11)
          .text(v);
      });

      // Colour-scale legend (vertical).
      const legendH = cell * vars.length;
      const legendG = svg.append("g").attr("class", "legend")
        .attr("transform", `translate(${margin.left + cell * vars.length + 18},${margin.top})`);
      const stops = 30;
      for (let i = 0; i < stops; i++) {
        const t = i / (stops - 1);
        legendG.append("rect")
          .attr("x", 0).attr("y", (1 - t) * (legendH - 10))
          .attr("width", 14).attr("height", legendH / stops + 1)
          .attr("fill", color(t * vmax));
      }
      legendG.append("text").attr("x", 18).attr("y", 6)
        .attr("fill", C.muted).attr("font-size", 10).text(vmax.toFixed(2));
      legendG.append("text").attr("x", 18).attr("y", legendH - 4)
        .attr("fill", C.muted).attr("font-size", 10).text("0.00");
      legendG.append("text").attr("x", 7).attr("y", legendH + 14)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 10)
        .text("HCGHM");
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
    bma_concept_animation,
    pip_forest,
    pip_bars,
    jointness_heatmap,
    C,
  };
})();
