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

  window.CHARTS = {
    l1_vs_l2_animation,
    coefficient_path,
    forest_plot,
    selection_bars,
    alpha_compare,
    alpha_histograms,
    C,
  };
})();

// ============================================================================
// DiD-specific chart builders (appended for r_did web app).
// Reuses the same color tokens defined inside the main IIFE via window.CHARTS.C.
// ============================================================================
(function () {
  "use strict";
  const C = window.CHARTS.C;

  function ensureSVG(container, viewBoxW, viewBoxH) {
    container.innerHTML = "";
    return d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${viewBoxW} ${viewBoxH}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
  }

  // ----------------------------------------------------------------
  // Parallel-trends animation (Tab 1).
  //   Shows treated vs. control mean outcomes over 6 periods. A slider
  //   moves a divergence parameter `delta`; the counterfactual stays parallel
  //   to control, while the observed treated path bends at the treatment date.
  // ----------------------------------------------------------------
  function parallel_trends_animation(container) {
    const W = 720, H = 380;
    const m = { top: 30, right: 24, bottom: 80, left: 56 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const periods = [-2, -1, 0, 1, 2, 3];
    const x = d3.scaleLinear().domain([-2.2, 3.2]).range([0, w]);
    const y = d3.scaleLinear().domain([4.5, 6.2]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).tickValues(periods).tickFormat(d => (d <= 0 ? "t" + d : "t+" + d)))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".1f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Time relative to treatment");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Log teen employment (mean)");

    // Treatment line
    g.append("line").attr("x1", x(-0.5)).attr("x2", x(-0.5)).attr("y1", 0).attr("y2", h)
      .attr("stroke", C.muted).attr("stroke-dasharray", "3 4").attr("stroke-width", 1);
    g.append("text").attr("x", x(-0.5) + 6).attr("y", 14)
      .attr("fill", C.muted).attr("font-size", 11).text("treatment");

    // Control: gentle upward drift
    const controlPath = periods.map(t => [t, 5.55 + 0.015 * t]);

    function buildPaths(delta) {
      // Counterfactual treated = control + initial gap (parallel)
      const gap0 = 0.10;
      const cfPath = periods.map(t => [t, 5.55 + gap0 + 0.015 * t]);
      // Observed treated: same until t<0, then deviates by `delta` per period after treatment
      const obsPath = periods.map(t => {
        const base = 5.55 + gap0 + 0.015 * t;
        return [t, t >= 0 ? base + delta * (t + 1) : base];
      });
      return { controlPath, cfPath, obsPath };
    }

    const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX);

    const pControl = g.append("path").attr("fill", "none")
      .attr("stroke", C.steel).attr("stroke-width", 2.6);
    const pCF = g.append("path").attr("fill", "none")
      .attr("stroke", C.muted).attr("stroke-width", 2)
      .attr("stroke-dasharray", "5 4");
    const pObs = g.append("path").attr("fill", "none")
      .attr("stroke", C.orange).attr("stroke-width", 2.8);

    // Legend (placed below the plot to avoid overlapping lines)
    const legendItems = [
      ["Control (untreated)", C.steel, false],
      ["Counterfactual treated", C.muted, true],
      ["Observed treated", C.orange, false],
    ];
    const legend = svg.append("g")
      .attr("transform", `translate(${m.left},${H - 4})`);
    // Background rect for legibility
    legend.append("rect")
      .attr("x", -4).attr("y", -14)
      .attr("width", w + 8).attr("height", 16)
      .attr("fill", "rgba(15,23,41,0.7)").attr("rx", 4);
    let lx = 0;
    legendItems.forEach((d) => {
      legend.append("line").attr("x1", lx).attr("x2", lx + 22)
        .attr("y1", -6).attr("y2", -6)
        .attr("stroke", d[1]).attr("stroke-width", 2.4)
        .attr("stroke-dasharray", d[2] ? "5 4" : "0");
      legend.append("text").attr("x", lx + 28).attr("y", -2)
        .attr("fill", C.text).attr("font-size", 11).text(d[0]);
      lx += 28 + d[0].length * 6.6 + 14;
    });

    // ATT annotation at t=3 (with background rect for legibility)
    const attBg = g.append("rect")
      .attr("fill", "rgba(15,23,41,0.72)").attr("rx", 3)
      .attr("y", 4).attr("height", 16).attr("width", 180)
      .attr("x", w - 184);
    const attLabel = g.append("text").attr("fill", C.teal)
      .attr("font-size", 12).attr("text-anchor", "end")
      .attr("x", w - 6).attr("y", 16);

    function update({ delta }) {
      const { controlPath, cfPath, obsPath } = buildPaths(delta);
      pControl.attr("d", line(controlPath));
      pCF.attr("d", line(cfPath));
      pObs.attr("d", line(obsPath));
      const att = obsPath[5][1] - cfPath[5][1];
      attLabel.text("DiD effect at t+3:  " + (att >= 0 ? "+" : "") + att.toFixed(3));
    }

    update({ delta: -0.03 });
    return { update };
  }

  // ----------------------------------------------------------------
  // DiD event study line plot (Tab 4 / overlay).
  //   data: { twfe_sa: [...], cs: [...], dr: [...] } where each is
  //   [{ event_time, estimate, se }, ...]
  // ----------------------------------------------------------------
  function did_event_study(container) {
    const W = 760, H = 400;
    const m = { top: 28, right: 24, bottom: 80, left: 60 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const colorMap = { twfe_sa: C.steel, cs: C.orange, dr: C.teal };
    const labelMap = { twfe_sa: "TWFE (Sun-Abraham)", cs: "Callaway-Sant'Anna", dr: "Doubly robust (CS+covariates)" };

    g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Event time (years relative to treatment)");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-42})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("ATT(e):  Log teen-employment effect");

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(payload, selectedSeries) {
      g.selectAll("*").remove();
      const active = selectedSeries && selectedSeries.length
        ? selectedSeries
        : ["twfe_sa", "cs", "dr"];
      const allRows = active.flatMap(k => (payload[k] || []).map(r =>
        ({ ...r, series: k })));

      const xExt = d3.extent(allRows, d => d.event_time);
      const yLo = d3.min(allRows, d => (d.estimate || 0) - 1.96 * (d.se || 0));
      const yHi = d3.max(allRows, d => (d.estimate || 0) + 1.96 * (d.se || 0));
      const x = d3.scaleLinear().domain([xExt[0] - 0.3, xExt[1] + 0.3]).range([0, w]);
      const y = d3.scaleLinear().domain([Math.min(yLo, 0) - 0.01, Math.max(yHi, 0) + 0.01]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // zero line
      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint = "rgba(232,236,242,0.18)")
        .attr("stroke-dasharray", "3 4").attr("stroke-width", 1);
      // treatment line
      g.append("line").attr("x1", x(-0.5)).attr("x2", x(-0.5))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.muted).attr("stroke-dasharray", "3 4");

      const line = d3.line().x(d => x(d.event_time)).y(d => y(d.estimate));

      active.forEach((key, ki) => {
        const rows = (payload[key] || []).filter(r => Number.isFinite(r.estimate));
        const col = colorMap[key] || C.text;
        // CI band
        rows.forEach(r => {
          if (!Number.isFinite(r.se)) return;
          g.append("line")
            .attr("x1", x(r.event_time)).attr("x2", x(r.event_time))
            .attr("y1", y(r.estimate - 1.96 * r.se))
            .attr("y2", y(r.estimate + 1.96 * r.se))
            .attr("stroke", col).attr("stroke-opacity", 0.5).attr("stroke-width", 1.8);
        });
        // Line
        g.append("path").datum(rows)
          .attr("fill", "none").attr("stroke", col).attr("stroke-width", 2.5)
          .attr("d", line);
        // Points
        g.selectAll(".pt-" + key).data(rows).enter().append("circle")
          .attr("class", "pt-" + key)
          .attr("cx", d => x(d.event_time)).attr("cy", d => y(d.estimate))
          .attr("r", 4.5).attr("fill", col).attr("stroke", "#fff").attr("stroke-width", 1)
          .on("mousemove", function (ev, d) {
            const rect = container.getBoundingClientRect();
            tooltip.html(
              `<div><strong style="color:${col}">${labelMap[key] || key}</strong></div>` +
              `<div><span class='tooltip-key'>e =</span> <span class='tooltip-val'>${d.event_time}</span></div>` +
              `<div><span class='tooltip-key'>ATT(e) =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
              (Number.isFinite(d.se)
                ? `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` : "")
            ).classed("show", true)
              .style("left", (ev.clientX - rect.left + 12) + "px")
              .style("top", (ev.clientY - rect.top + 12) + "px");
          }).on("mouseleave", function () { tooltip.classed("show", false); });
      });

      // Legend (placed below x-axis label, outside plot area, with background rect)
      const legend = svg.append("g")
        .attr("transform", `translate(${m.left},${H - 4})`);
      legend.append("rect")
        .attr("x", -4).attr("y", -14)
        .attr("width", w + 8).attr("height", 16)
        .attr("fill", "rgba(15,23,41,0.7)").attr("rx", 4);
      let lx = 0;
      active.forEach((k) => {
        const lbl = labelMap[k] || k;
        legend.append("line").attr("x1", lx).attr("x2", lx + 22)
          .attr("y1", -6).attr("y2", -6)
          .attr("stroke", colorMap[k]).attr("stroke-width", 2.4);
        legend.append("text").attr("x", lx + 28).attr("y", -2)
          .attr("fill", C.text).attr("font-size", 11).text(lbl);
        lx += 28 + lbl.length * 6.6 + 18;
      });
    }

    return { update };
  }

  // ----------------------------------------------------------------
  // DiD forest plot — variant of forest_plot but ranges over DiD methods
  // and does not require an "outcome" axis (single outcome, single facet).
  //   data: array of { method, estimate, se, ci_lo, ci_hi }
  // ----------------------------------------------------------------
  function did_forest_plot(container) {
    const W = 820;
    const m = { top: 28, right: 24, bottom: 40, left: 220 };
    const svg = ensureSVG(container, W, 360);

    const colorMap = {
      "TWFE": C.muted,
      "CS Overall (unconditional)": C.steel,
      "Regression adj.": C.steel,
      "IPW": "#9bdcc3",
      "Doubly robust": C.teal,
      "DR (varying base)": C.teal,
      "DR (not-yet-treated)": C.teal,
      "DR (1-period anticip.)": C.orange,
      "Lagged outcomes (pte)": "#a8c8ea",
      "ATT per dollar (CS)": C.orange,
    };

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(rows, activeMethods) {
      const methods = activeMethods && activeMethods.length
        ? rows.map(d => d.method).filter(m2 => activeMethods.includes(m2))
        : rows.map(d => d.method);
      const filtered = rows.filter(d => methods.includes(d.method));
      const h = Math.max(220, 32 * filtered.length + 20);
      const totalH = m.top + h + m.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet").remove();

      const g = svg.append("g").attr("class", "facet")
        .attr("transform", `translate(${m.left},${m.top})`);

      const w = W - m.left - m.right;
      const ext = d3.extent(filtered.flatMap(d => [d.ci_lo, d.ci_hi, 0]));
      const pad = Math.max(0.005, (ext[1] - ext[0]) * 0.08);
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const y = d3.scaleBand().domain(filtered.map(d => d.method)).range([0, h]).padding(0.32);

      // Zero line
      g.append("line")
        .attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", "rgba(232,236,242,0.18)").attr("stroke-dasharray", "3 4");

      // X axis
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Method labels (left)
      filtered.forEach(d => {
        svg.append("text").attr("class", "facet")
          .attr("x", m.left - 10).attr("y", m.top + y(d.method) + y.bandwidth() / 2 + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(d.method);
      });

      // Error bars and points
      filtered.forEach(d => {
        const yc = y(d.method) + y.bandwidth() / 2;
        const col = colorMap[d.method] || C.text;
        const grp = g.append("g").style("cursor", "pointer");
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
          tooltip.html(
            `<div><strong style="color:${col}">${d.method}</strong></div>` +
            `<div><span class='tooltip-key'>estimate =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>` +
            (d.outcome ? `<div><span class='tooltip-key'>outcome =</span> <span class='tooltip-val'>${d.outcome}</span></div>` : "")
          ).classed("show", true)
            .style("left", (ev.clientX - rect.left + 12) + "px")
            .style("top", (ev.clientY - rect.top + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });
      });
    }

    return { update };
  }

  // ----------------------------------------------------------------
  // DiD 2x2 simulator chart (Tab 3).
  //   Shows true ATT vs. TWFE-bias under user-controlled pre-trend slope
  //   and treatment-effect dynamics. Updates a small bar chart.
  // ----------------------------------------------------------------
  function did_2x2_chart(container) {
    const W = 700, H = 320;
    const m = { top: 28, right: 24, bottom: 40, left: 70 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-46})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Estimated effect");

    function update({ true_att, twfe_est, cs_est }) {
      g.selectAll("*").remove();
      const bars = [
        { label: "True ATT",   value: true_att, col: C.steel },
        { label: "TWFE",       value: twfe_est, col: C.orange },
        { label: "CS-style",   value: cs_est,   col: C.teal },
      ];
      const x = d3.scaleBand().domain(bars.map(b => b.label)).range([0, w]).padding(0.32);
      const yExt = d3.extent(bars.flatMap(b => [b.value, 0]));
      const pad = Math.max(0.01, (yExt[1] - yExt[0]) * 0.15);
      const y = d3.scaleLinear().domain([yExt[0] - pad, yExt[1] + pad]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x)).selectAll("text").attr("fill", C.muted).attr("font-size", 12);
      g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", "rgba(232,236,242,0.18)").attr("stroke-dasharray", "3 4");

      g.selectAll(".bar").data(bars).enter().append("rect")
        .attr("x", b => x(b.label))
        .attr("y", b => y(Math.max(0, b.value)))
        .attr("width", x.bandwidth())
        .attr("height", b => Math.abs(y(b.value) - y(0)))
        .attr("fill", b => b.col).attr("opacity", 0.85);

      g.selectAll(".lbl").data(bars).enter().append("text")
        .attr("x", b => x(b.label) + x.bandwidth() / 2)
        .attr("y", b => y(b.value) + (b.value >= 0 ? -6 : 14))
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text(b => b.value.toFixed(3));
    }

    return { update };
  }

  // ----------------------------------------------------------------
  // Histograms of TWFE vs CS-style estimates across many simulated panels.
  //   data: { twfe: [..], cs: [..], true_att }
  // ----------------------------------------------------------------
  function did_sim_histograms(container) {
    const W = 760, H = 380;
    const m = { top: 28, right: 24, bottom: 80, left: 56 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    function update({ twfe, cs, true_att }) {
      g.selectAll("*").remove();
      const all = (twfe || []).concat(cs || []);
      if (!all.length) return;
      const ext = d3.extent(all.concat([true_att]));
      const pad = Math.max(0.01, (ext[1] - ext[0]) * 0.12);
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const bins = d3.bin().domain(x.domain()).thresholds(20);
      const bTwfe = bins(twfe);
      const bCs = bins(cs);
      const yMax = Math.max(d3.max(bTwfe, d => d.length) || 0, d3.max(bCs, d => d.length) || 0);
      const y = d3.scaleLinear().domain([0, yMax + 1]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      function bars(binData, col) {
        g.selectAll(null).data(binData).enter().append("rect")
          .attr("x", d => x(d.x0) + 1).attr("y", d => y(d.length))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
          .attr("height", d => h - y(d.length))
          .attr("fill", col).attr("opacity", 0.55);
      }
      bars(bTwfe, C.orange);
      bars(bCs, C.teal);

      // True ATT vertical line
      g.append("line").attr("x1", x(true_att)).attr("x2", x(true_att))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.steel)
        .attr("stroke-width", 2).attr("stroke-dasharray", "4 4");

      // True-ATT label with background rect (placed near the top-left of the line)
      const trueLbl = "True ATT = " + true_att.toFixed(3);
      const trueX = x(true_att) + 6;
      g.append("rect")
        .attr("x", trueX - 3).attr("y", 0)
        .attr("width", trueLbl.length * 6.2 + 6).attr("height", 14)
        .attr("fill", "rgba(15,23,41,0.72)").attr("rx", 3);
      g.append("text").attr("x", trueX).attr("y", 11)
        .attr("fill", C.steel).attr("font-size", 11)
        .text(trueLbl);

      g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated ATT across " + (twfe.length || cs.length) + " simulated panels");

      // Mini legend placed below the x-axis label (outside plot area)
      const lg = svg.append("g")
        .attr("transform", `translate(${m.left},${H - 4})`);
      lg.append("rect")
        .attr("x", -4).attr("y", -14)
        .attr("width", w + 8).attr("height", 16)
        .attr("fill", "rgba(15,23,41,0.7)").attr("rx", 4);
      let lx = 0;
      [["TWFE", C.orange], ["CS-style", C.teal]].forEach((d) => {
        lg.append("rect").attr("x", lx).attr("y", -10).attr("width", 14).attr("height", 9)
          .attr("fill", d[1]).attr("opacity", 0.65);
        lg.append("text").attr("x", lx + 20).attr("y", -2)
          .attr("fill", C.text).attr("font-size", 11).text(d[0]);
        lx += 20 + d[0].length * 6.6 + 20;
      });
    }

    return { update };
  }

  // ----------------------------------------------------------------
  // HonestDiD breakdown chart (Tab 4 supplement).
  //   data: array of { Mbar, lb, ub } from results.json.honestdid
  // ----------------------------------------------------------------
  function honestdid_chart(container) {
    const W = 720, H = 320;
    const m = { top: 28, right: 24, bottom: 44, left: 60 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    function update(rows) {
      g.selectAll("*").remove();
      if (!rows || !rows.length) return;
      const x = d3.scaleLinear().domain(d3.extent(rows, d => d.Mbar)).range([0, w]);
      const yExt = d3.extent(rows.flatMap(d => [d.lb, d.ub, 0]));
      const pad = Math.max(0.005, (yExt[1] - yExt[0]) * 0.12);
      const y = d3.scaleLinear().domain([yExt[0] - pad, yExt[1] + pad]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", "rgba(232,236,242,0.18)").attr("stroke-dasharray", "3 4");

      // CI band
      const area = d3.area()
        .x(d => x(d.Mbar)).y0(d => y(d.lb)).y1(d => y(d.ub))
        .curve(d3.curveMonotoneX);
      g.append("path").datum(rows).attr("fill", C.teal).attr("opacity", 0.18)
        .attr("d", area);
      g.append("path").datum(rows).attr("fill", "none").attr("stroke", C.teal)
        .attr("stroke-width", 2)
        .attr("d", d3.line().x(d => x(d.Mbar)).y(d => y(d.lb)).curve(d3.curveMonotoneX));
      g.append("path").datum(rows).attr("fill", "none").attr("stroke", C.teal)
        .attr("stroke-width", 2)
        .attr("d", d3.line().x(d => x(d.Mbar)).y(d => y(d.ub)).curve(d3.curveMonotoneX));

      // Mark breakdown at Mbar ~= 0.67
      g.append("line").attr("x1", x(0.667)).attr("x2", x(0.667))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.orange)
        .attr("stroke-dasharray", "4 4").attr("stroke-width", 1.5);
      const bdLbl = "breakdown  M̄ ≈ 0.67";
      g.append("rect")
        .attr("x", x(0.667) + 3).attr("y", 4)
        .attr("width", bdLbl.length * 6.4 + 6).attr("height", 16)
        .attr("fill", "rgba(15,23,41,0.75)").attr("rx", 3);
      g.append("text").attr("x", x(0.667) + 6).attr("y", 16)
        .attr("fill", C.orange).attr("font-size", 11).text(bdLbl);

      g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("M̄  (allowed parallel-trends violation, relative magnitude)");
      g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Robust 95% CI for ATT(e=0)");
    }
    return { update };
  }

  // Augment the existing window.CHARTS namespace
  Object.assign(window.CHARTS, {
    parallel_trends_animation,
    did_event_study,
    did_forest_plot,
    did_2x2_chart,
    did_sim_histograms,
    honestdid_chart,
  });
})();

