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

  // ------------------------------------------------------------------
  // RCT-specific: randomization animation (Tab 1)
  //   Grid of dots randomly assigned to treatment (orange) vs control (steel),
  //   stratified by poverty status (top row = poor stratum, bottom = non-poor).
  // ------------------------------------------------------------------
  function rct_randomization_animation(container) {
    const W = 720, H = 320;
    const margin = { top: 30, right: 24, bottom: 60, left: 90 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const cols = 40, rowsPerStratum = 5;
    const cellW = w / cols;
    const cellH = h / (rowsPerStratum * 2 + 1);

    function seedRng(s) {
      let a = s >>> 0;
      return function () {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    // Stratum labels
    g.append("text").attr("x", -8).attr("y", cellH * (rowsPerStratum / 2) + 4)
      .attr("text-anchor", "end").attr("fill", C.muted).attr("font-size", 11)
      .text("Poor stratum");
    g.append("text").attr("x", -8).attr("y", cellH * (rowsPerStratum + 1 + rowsPerStratum / 2) + 4)
      .attr("text-anchor", "end").attr("fill", C.muted).attr("font-size", 11)
      .text("Non-poor stratum");

    function draw(seed) {
      g.selectAll(".dot").remove();
      const rnd = seedRng(seed);
      for (let stratum = 0; stratum < 2; stratum++) {
        const rowOffset = stratum === 0 ? 0 : (rowsPerStratum + 1);
        for (let r = 0; r < rowsPerStratum; r++) {
          for (let c = 0; c < cols; c++) {
            const isTreat = rnd() < 0.5;
            g.append("circle").attr("class", "dot")
              .attr("cx", c * cellW + cellW / 2)
              .attr("cy", (rowOffset + r) * cellH + cellH / 2)
              .attr("r", Math.min(cellW, cellH) * 0.32)
              .attr("fill", isTreat ? C.orange : C.steel)
              .attr("opacity", 0)
              .transition().duration(350).delay((c + r * cols) * 3)
              .attr("opacity", 0.88);
          }
        }
      }
    }

    // Legend
    const lg = g.append("g").attr("transform", `translate(${0},${h + 18})`);
    lg.append("circle").attr("cx", 8).attr("cy", 0).attr("r", 5).attr("fill", C.orange);
    lg.append("text").attr("x", 18).attr("y", 4).attr("fill", C.text).attr("font-size", 11).text("Offered cash transfer (treat = 1)");
    lg.append("circle").attr("cx", 220).attr("cy", 0).attr("r", 5).attr("fill", C.steel);
    lg.append("text").attr("x", 230).attr("y", 4).attr("fill", C.text).attr("font-size", 11).text("Control (treat = 0)");

    let seed = 1;
    draw(seed);
    const interval = setInterval(function () { seed++; draw(seed); }, 4500);
    return { reseed: function () { seed++; draw(seed); }, stop: function () { clearInterval(interval); } };
  }

  // ------------------------------------------------------------------
  // RCT-specific: balance plot (Tab 1)
  // ------------------------------------------------------------------
  function rct_balance_plot(container) {
    const W = 720;
    const margin = { top: 24, right: 28, bottom: 36, left: 170 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 260`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    function update(data) {
      svg.selectAll("g, text").remove();
      const innerW = W - margin.left - margin.right;
      const rowH = 30;
      const innerH = rowH * data.length;
      const totalH = margin.top + innerH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear().domain([0, 0.15]).range([0, innerW]);
      g.append("line").attr("x1", x(0.10)).attr("x2", x(0.10)).attr("y1", -4).attr("y2", innerH + 4)
        .attr("stroke", C.orange).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", x(0.10) + 4).attr("y", -8)
        .attr("fill", C.orange).attr("font-size", 11).text("10% threshold");

      g.append("g").attr("transform", `translate(0,${innerH})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("x", innerW / 2).attr("y", innerH + 28)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("Standardized mean difference (|SMD|)");

      data.forEach(function (d, i) {
        const yc = i * rowH + rowH / 2;
        const color = Math.abs(d.smd) >= 0.10 ? C.orange : C.steel;
        svg.append("text")
          .attr("x", margin.left - 12).attr("y", margin.top + yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(d.variable);
        g.append("rect")
          .attr("x", 0).attr("y", yc - 8)
          .attr("width", x(Math.abs(d.smd))).attr("height", 16)
          .attr("fill", color).attr("opacity", 0.85);
        g.append("text")
          .attr("x", x(Math.abs(d.smd)) + 6).attr("y", yc + 4)
          .attr("fill", C.text).attr("font-size", 11)
          .text(d.smd.toFixed(3));
      });
    }
    return { update: update };
  }

  // ------------------------------------------------------------------
  // RCT-specific: variance-reduction visual (Tab 2)
  //   Two overlaid normal pdfs comparing SE(simple) vs SE(adjusted).
  // ------------------------------------------------------------------
  function rct_variance_animation(container) {
    const W = 720, H = 300;
    const margin = { top: 28, right: 28, bottom: 50, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0.02, 0.22]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 25]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .attr("class", "x-axis")
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Treatment effect α̂ (log monthly consumption)");

    g.append("line").attr("class", "truth").attr("x1", x(0.12)).attr("x2", x(0.12))
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", C.teal).attr("stroke-width", 2).attr("stroke-dasharray", "5 4");
    // Anchor the truth label LEFT of the line so it never collides with the
    // top-right legend box.
    g.append("text").attr("class", "truth-lbl").attr("x", x(0.12) - 5).attr("y", 12)
      .attr("text-anchor", "end")
      .attr("fill", C.teal).attr("font-size", 11).text("true α = 0.12");

    function pdf(mean, sd) {
      return d3.range(0.02, 0.22, 0.001).map(function (xv) {
        return [xv, (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((xv - mean) / sd, 2))];
      });
    }
    const line = d3.line().x(function (d) { return x(d[0]); }).y(function (d) { return y(d[1]); }).curve(d3.curveBasis);

    const p1 = g.append("path").attr("fill", C.orange).attr("fill-opacity", 0.15).attr("stroke", C.orange).attr("stroke-width", 2.5);
    const p2 = g.append("path").attr("fill", C.steel).attr("fill-opacity", 0.15).attr("stroke", C.steel).attr("stroke-width", 2.5);

    function update(meanSimple, seSimple, meanAdj, seAdj) {
      const yMax = Math.max(1 / (seSimple * Math.sqrt(2 * Math.PI)), 1 / (seAdj * Math.sqrt(2 * Math.PI))) * 1.15;
      y.domain([0, yMax]);
      p1.attr("d", line(pdf(meanSimple, seSimple)));
      p2.attr("d", line(pdf(meanAdj, seAdj)));
    }

    // Legend
    const lg = g.append("g").attr("transform", `translate(${w - 260},${4})`);
    lg.append("rect").attr("width", 260).attr("height", 50).attr("fill", "rgba(15,23,41,0.65)").attr("stroke", C.line).attr("rx", 6);
    lg.append("line").attr("x1", 12).attr("x2", 32).attr("y1", 18).attr("y2", 18).attr("stroke", C.orange).attr("stroke-width", 2.5);
    lg.append("text").attr("x", 40).attr("y", 22).attr("fill", C.text).attr("font-size", 11).text("Simple diff-in-means (no controls)");
    lg.append("line").attr("x1", 12).attr("x2", 32).attr("y1", 38).attr("y2", 38).attr("stroke", C.steel).attr("stroke-width", 2.5);
    lg.append("text").attr("x", 40).attr("y", 42).attr("fill", C.text).attr("font-size", 11).text("Covariate-adjusted (RA/IPW/DR)");

    return { update: update };
  }

  // ------------------------------------------------------------------
  // RCT-specific: estimator comparison forest (Tab 3)
  // ------------------------------------------------------------------
  function rct_estimator_compare(container) {
    const W = 720, H = 260;
    const margin = { top: 36, right: 30, bottom: 42, left: 140 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const rows = [
        { name: "Simple",            v: data.simple, se: data.simple_se, color: C.muted },
        { name: "Regression Adj.",   v: data.ra,     se: data.ra_se,     color: C.steel },
        { name: "IPW",               v: data.ipw,    se: data.ipw_se,    color: C.orange },
        { name: "Doubly Robust",     v: data.dr,     se: data.dr_se,     color: C.teal },
      ];
      const allV = rows.flatMap(function (d) { return [d.v - 2 * d.se, d.v + 2 * d.se]; }).concat([data.alpha_true, 0]);
      const ext = d3.extent(allV);
      const pad = Math.max(0.02, (ext[1] - ext[0]) * 0.1);
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const y = d3.scaleBand().domain(rows.map(function (d) { return d.name; })).range([0, h]).padding(0.45);

      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      g.append("line").attr("x1", x(data.alpha_true)).attr("x2", x(data.alpha_true))
        .attr("y1", -10).attr("y2", h + 6)
        .attr("stroke", C.teal).attr("stroke-width", 2).attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", x(data.alpha_true)).attr("y", -14)
        .attr("text-anchor", "middle").attr("fill", C.teal).attr("font-size", 11)
        .text("true α = " + data.alpha_true.toFixed(2));

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("x", w / 2).attr("y", h + 32)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("Estimated treatment effect");

      rows.forEach(function (d) {
        const yc = y(d.name) + y.bandwidth() / 2;
        g.append("text").attr("x", -10).attr("y", yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12).text(d.name);
        const lo = d.v - 1.96 * d.se, hi = d.v + 1.96 * d.se;
        g.append("line").attr("x1", x(lo)).attr("x2", x(hi)).attr("y1", yc).attr("y2", yc)
          .attr("stroke", d.color).attr("stroke-width", 2.5);
        g.append("line").attr("x1", x(lo)).attr("x2", x(lo)).attr("y1", yc - 4).attr("y2", yc + 4).attr("stroke", d.color).attr("stroke-width", 2.5);
        g.append("line").attr("x1", x(hi)).attr("x2", x(hi)).attr("y1", yc - 4).attr("y2", yc + 4).attr("stroke", d.color).attr("stroke-width", 2.5);
        g.append("circle").attr("cx", x(d.v)).attr("cy", yc).attr("r", 5)
          .attr("fill", d.color).attr("stroke", "#fff").attr("stroke-width", 1.2);
        g.append("text").attr("x", x(d.v)).attr("y", yc - 9)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 10)
          .text(d.v.toFixed(3));
      });
    }
    return { update: update };
  }

  // ------------------------------------------------------------------
  // RCT-specific: distribution of estimates over many simulations (Tab 3)
  // ------------------------------------------------------------------
  function rct_estimator_histograms(container) {
    const W = 720, H = 300;
    const margin = { top: 28, right: 28, bottom: 42, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const all = [].concat(data.simple, data.dr);
      const ext = d3.extent(all);
      const pad = (ext[1] - ext[0]) * 0.1;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const bins1 = d3.bin().domain(x.domain()).thresholds(20)(data.simple);
      const bins2 = d3.bin().domain(x.domain()).thresholds(20)(data.dr);
      const yMax = Math.max(d3.max(bins1, function (b) { return b.length; }), d3.max(bins2, function (b) { return b.length; }));
      const y = d3.scaleLinear().domain([0, yMax * 1.1]).range([h, 0]);

      function drawBars(bins, color, opacity) {
        g.selectAll(null).data(bins).enter().append("rect")
          .attr("x", function (b) { return x(b.x0) + 1; })
          .attr("y", function (b) { return y(b.length); })
          .attr("width", function (b) { return Math.max(0, x(b.x1) - x(b.x0) - 1); })
          .attr("height", function (b) { return h - y(b.length); })
          .attr("fill", color).attr("opacity", opacity);
      }
      drawBars(bins1, C.muted, 0.5);
      drawBars(bins2, C.teal, 0.65);

      // Truth line
      g.append("line").attr("x1", x(data.alpha_true)).attr("x2", x(data.alpha_true))
        .attr("y1", -4).attr("y2", h)
        .attr("stroke", C.orange).attr("stroke-width", 2).attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", x(data.alpha_true)).attr("y", -8)
        .attr("text-anchor", "middle").attr("fill", C.orange).attr("font-size", 11)
        .text("true α = " + data.alpha_true.toFixed(2));

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("x", w / 2).attr("y", h + 32)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated α̂ across simulated datasets");

      // Legend
      const lg = g.append("g").attr("transform", `translate(${w - 250},${0})`);
      lg.append("rect").attr("width", 250).attr("height", 50).attr("fill", "rgba(15,23,41,0.65)").attr("stroke", C.line).attr("rx", 6);
      lg.append("rect").attr("x", 12).attr("y", 12).attr("width", 14).attr("height", 10).attr("fill", C.muted).attr("opacity", 0.5);
      lg.append("text").attr("x", 32).attr("y", 22).attr("fill", C.text).attr("font-size", 11).text("Simple diff-in-means");
      lg.append("rect").attr("x", 12).attr("y", 30).attr("width", 14).attr("height", 10).attr("fill", C.teal).attr("opacity", 0.65);
      lg.append("text").attr("x", 32).attr("y", 40).attr("fill", C.text).attr("font-size", 11).text("Doubly Robust (AIPW)");
    }
    return { update: update };
  }

  // ------------------------------------------------------------------
  // RCT-specific: comprehensive forest plot of all 12 estimators (Tab 4)
  // ------------------------------------------------------------------
  function rct_forest_plot(container) {
    const W = 880;
    const margin = { top: 28, right: 30, bottom: 50, left: 270 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 480`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function colorFor(d) {
      if (d.outcome === "Receipt (per-recipient)") return C.orange;
      if (d.data === "Panel") return C.teal;
      return C.steel;
    }

    function update(data, activeMethods) {
      svg.selectAll("g").remove();
      svg.selectAll("text").remove();
      const rows = data.filter(function (d) { return !activeMethods || activeMethods.includes(d.method); });
      const allCI = rows.flatMap(function (d) { return [d.ci_lo, d.ci_hi]; });
      const ext = d3.extent(allCI);
      const xMin = Math.min(0.04, ext[0] - 0.005);
      const xMax = Math.max(0.20, ext[1] + 0.005);
      const innerW = W - margin.left - margin.right;
      const rowH = 30;
      const innerH = rowH * rows.length;
      const totalH = margin.top + innerH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);

      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
      const x = d3.scaleLinear().domain([xMin, xMax]).range([0, innerW]);

      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", -4).attr("y2", innerH + 4)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      g.append("line").attr("x1", x(0.12)).attr("x2", x(0.12)).attr("y1", -4).attr("y2", innerH + 4)
        .attr("stroke", C.teal).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", x(0.12)).attr("y", -10)
        .attr("text-anchor", "middle").attr("fill", C.teal).attr("font-size", 11)
        .text("true α = 0.12");

      g.append("g").attr("transform", `translate(0,${innerH})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("x", innerW / 2).attr("y", innerH + 36)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Treatment effect on log monthly consumption");

      rows.forEach(function (d, i) {
        const yc = i * rowH + rowH / 2;
        const color = colorFor(d);
        svg.append("text")
          .attr("x", margin.left - 12).attr("y", margin.top + yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 11.5)
          .text(d.method + " · " + d.estimand);
        const row = g.append("g").style("cursor", "pointer");
        row.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc)
          .attr("stroke", color).attr("stroke-width", 2);
        row.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
          .attr("y1", yc - 4).attr("y2", yc + 4).attr("stroke", color).attr("stroke-width", 2);
        row.append("line").attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
          .attr("y1", yc - 4).attr("y2", yc + 4).attr("stroke", color).attr("stroke-width", 2);
        row.append("circle").attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
          .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 1);

        row.on("mousemove", function (ev) {
          const rect = container.getBoundingClientRect();
          tooltip.html(
            `<div><strong style="color:${color}">${d.method}</strong></div>` +
            `<div><span class='tooltip-key'>estimand =</span> <span class='tooltip-val'>${d.estimand} (${d.outcome})</span></div>` +
            `<div><span class='tooltip-key'>α̂ =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>` +
            `<div><span class='tooltip-key'>data =</span> <span class='tooltip-val'>${d.data}</span></div>`
          )
          .classed("show", true)
          .style("left", (ev.clientX - rect.left + 12) + "px")
          .style("top", (ev.clientY - rect.top + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });
      });
    }
    return { update: update };
  }

  window.CHARTS = {
    l1_vs_l2_animation: l1_vs_l2_animation,
    coefficient_path: coefficient_path,
    forest_plot: forest_plot,
    selection_bars: selection_bars,
    alpha_compare: alpha_compare,
    alpha_histograms: alpha_histograms,
    rct_randomization_animation: rct_randomization_animation,
    rct_balance_plot: rct_balance_plot,
    rct_variance_animation: rct_variance_animation,
    rct_estimator_compare: rct_estimator_compare,
    rct_estimator_histograms: rct_estimator_histograms,
    rct_forest_plot: rct_forest_plot,
    C: C,
  };
})();
