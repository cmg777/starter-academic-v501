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
  // Trajectory chart (gap series): observed, synthetic, optional gap band.
  //   data: { points: [{year, observed, synthetic, gap, gap_lo95, gap_hi95}],
  //           treatYear: 1988, title, hasBand }
  // ------------------------------------------------------------------
  function trajectory(container) {
    const W = 780, H = 420;
    // Extra bottom margin holds the legend OUTSIDE the plot area so it never
    // overlaps the data lines or the "Prop 99 (year)" treatment label.
    const margin = { top: 28, right: 28, bottom: 90, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const pts = data.points;
      if (!pts || pts.length === 0) return;

      const xExt = d3.extent(pts, d => d.year);
      const x = d3.scaleLinear().domain(xExt).range([0, w]);
      const allY = pts.flatMap(d => {
        const a = [d.observed, d.synthetic];
        if (d.gap_lo95 !== undefined && d.gap_lo95 !== null) {
          a.push(d.synthetic + d.gap_lo95, d.synthetic + d.gap_hi95);
        }
        return a;
      }).filter(v => Number.isFinite(v));
      const yExt = d3.extent(allY);
      const pad = (yExt[1] - yExt[0]) * 0.08;
      const y = d3.scaleLinear().domain([yExt[0] - pad, yExt[1] + pad]).range([h, 0]);

      // axes
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // treatment line
      const tx = x(data.treatYear || 1988);
      g.append("line").attr("x1", tx).attr("x2", tx)
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.orange).attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", tx + 4).attr("y", 10)
        .attr("fill", C.orange).attr("font-size", 11)
        .text(`Prop 99 (${data.treatYear || 1988})`);

      // optional credible band around synthetic
      if (data.hasBand) {
        const area = d3.area()
          .defined(d => Number.isFinite(d.gap_lo95) && Number.isFinite(d.gap_hi95))
          .x(d => x(d.year))
          .y0(d => y(d.synthetic + d.gap_lo95))
          .y1(d => y(d.synthetic + d.gap_hi95))
          .curve(d3.curveMonotoneX);
        g.append("path")
          .attr("d", area(pts))
          .attr("fill", C.teal)
          .attr("opacity", 0.15);
      }

      // synthetic line
      const synthLine = d3.line()
        .x(d => x(d.year)).y(d => y(d.synthetic))
        .curve(d3.curveMonotoneX);
      g.append("path").datum(pts)
        .attr("fill", "none").attr("stroke", C.teal)
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "5 3")
        .attr("d", synthLine);

      // observed line
      const obsLine = d3.line()
        .x(d => x(d.year)).y(d => y(d.observed))
        .curve(d3.curveMonotoneX);
      g.append("path").datum(pts)
        .attr("fill", "none").attr("stroke", C.steel)
        .attr("stroke-width", 2.5).attr("d", obsLine);

      // axis labels
      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Year");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Per-capita cigarette sales (packs)");

      // legend (placed BELOW the plot, horizontally centred, to avoid any
      // overlap with the data lines or the "Prop 99 (year)" label).
      const legendY = h + 56;
      const legendItems = [
        { label: "California (observed)",     color: C.steel, dash: null    },
        { label: "Synthetic (counterfactual)", color: C.teal,  dash: "5 3"   },
      ];
      // Estimate width: ~12 swatch + ~190 text + 24 gap per item
      const itemW = 220;
      const totalW = itemW * legendItems.length;
      const lg = g.append("g")
        .attr("transform", `translate(${(w - totalW) / 2},${legendY})`);
      lg.append("rect")
        .attr("x", -10).attr("y", -16)
        .attr("width", totalW + 20).attr("height", 28)
        .attr("fill", "rgba(15,23,41,0.6)")
        .attr("stroke", C.line).attr("rx", 6);
      legendItems.forEach((item, i) => {
        const ox = i * itemW;
        const ln = lg.append("line")
          .attr("x1", ox).attr("x2", ox + 22)
          .attr("y1", 0).attr("y2", 0)
          .attr("stroke", item.color).attr("stroke-width", 2.5);
        if (item.dash) ln.attr("stroke-dasharray", item.dash);
        lg.append("text").attr("x", ox + 30).attr("y", 4)
          .attr("fill", C.text).attr("font-size", 12)
          .text(item.label);
      });
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // Donor weights bar chart: vertical bars for each state.
  //   data: { weights: [{state, weight, lo95?, hi95?}], title, color, showCI }
  // ------------------------------------------------------------------
  function donor_weights(container) {
    const W = 780, H = 360;
    const margin = { top: 24, right: 24, bottom: 90, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const rows = (data.weights || []).slice();
      if (rows.length === 0) return;

      // sort by weight descending
      rows.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
      const x = d3.scaleBand().domain(rows.map(d => d.state)).range([0, w]).padding(0.25);

      const allY = rows.flatMap(d => {
        const a = [d.weight, 0];
        if (d.lo95 !== undefined && d.lo95 !== null) a.push(d.lo95, d.hi95);
        return a;
      });
      const yExt = d3.extent(allY);
      const pad = Math.max(0.02, (yExt[1] - yExt[0]) * 0.1);
      const y = d3.scaleLinear().domain([yExt[0] - pad, yExt[1] + pad]).range([h, 0]);

      // zero line
      g.append("line").attr("x1", 0).attr("x2", w)
        .attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      // bars
      const color = data.color || C.teal;
      rows.forEach(d => {
        const xc = x(d.state);
        const bw = x.bandwidth();
        const y0 = y(0);
        const yv = y(d.weight);
        g.append("rect")
          .attr("x", xc).attr("y", Math.min(y0, yv))
          .attr("width", bw).attr("height", Math.abs(yv - y0))
          .attr("fill", color).attr("opacity", 0.85);
        // CI whiskers (Stage 2)
        if (data.showCI && d.lo95 !== undefined && d.lo95 !== null) {
          const cx = xc + bw / 2;
          g.append("line")
            .attr("x1", cx).attr("x2", cx)
            .attr("y1", y(d.lo95)).attr("y2", y(d.hi95))
            .attr("stroke", C.text).attr("stroke-width", 1.5);
          g.append("line")
            .attr("x1", cx - 4).attr("x2", cx + 4)
            .attr("y1", y(d.lo95)).attr("y2", y(d.lo95))
            .attr("stroke", C.text).attr("stroke-width", 1.5);
          g.append("line")
            .attr("x1", cx - 4).attr("x2", cx + 4)
            .attr("y1", y(d.hi95)).attr("y2", y(d.hi95))
            .attr("stroke", C.text).attr("stroke-width", 1.5);
        }
      });

      // axes
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("fill", C.muted)
        .attr("font-size", 10)
        .attr("transform", "rotate(-40)")
        .attr("text-anchor", "end");
      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text(data.ylabel || "Donor weight αⱼ");
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // Horizontal spillover bar chart: per-state spillover ranked.
  //   data: { spillovers: [{state, avg_spillover}] }
  // ------------------------------------------------------------------
  function spillover_bars(container) {
    const W = 780, H = 340;
    const margin = { top: 24, right: 60, bottom: 36, left: 110 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const rows = (data.spillovers || []).slice();
      if (rows.length === 0) return;

      // sort by abs descending, take top N
      rows.sort((a, b) => Math.abs(b.avg_spillover) - Math.abs(a.avg_spillover));
      const top = rows.slice(0, data.topN || 8);

      const xExt = d3.extent(top, d => d.avg_spillover);
      const xMin = Math.min(0, xExt[0]);
      const xMax = Math.max(0, xExt[1]);
      const pad = Math.max(0.5, (xMax - xMin) * 0.1);
      const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, w]);
      const y = d3.scaleBand().domain(top.map(d => d.state)).range([0, h]).padding(0.25);

      // zero line
      g.append("line").attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      top.forEach(d => {
        const yc = y(d.state);
        const bh = y.bandwidth();
        const x0 = x(0);
        const xv = x(d.avg_spillover);
        const color = d.avg_spillover < 0 ? C.orange : C.teal;
        g.append("rect")
          .attr("x", Math.min(x0, xv)).attr("y", yc)
          .attr("width", Math.abs(xv - x0)).attr("height", bh)
          .attr("fill", color).attr("opacity", 0.85);
        // value label
        g.append("text")
          .attr("x", xv + (d.avg_spillover < 0 ? -6 : 6))
          .attr("y", yc + bh / 2 + 4)
          .attr("text-anchor", d.avg_spillover < 0 ? "end" : "start")
          .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
          .text(d.avg_spillover.toFixed(d.avg_spillover === 0 ? 1 : (Math.abs(d.avg_spillover) < 0.01 ? 4 : 3)));
      });

      // axes
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).tickSize(0))
        .selectAll("text").attr("fill", C.text).attr("font-size", 12);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Average post-treatment spillover effect (packs/capita/year)");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Animation: classical simplex vs horseshoe donor allocation.
  //   Cycles between two stylised pictures: 4 fat bars (classical) and
  //   many smaller bars (horseshoe).
  // ------------------------------------------------------------------
  function simplex_vs_horseshoe(container) {
    const W = 720, H = 320;
    const margin = { top: 28, right: 28, bottom: 50, left: 54 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // 38 donor positions
    const N = 38;
    const x = d3.scaleBand().domain(d3.range(N)).range([0, w]).padding(0.15);
    const y = d3.scaleLinear().domain([0, 0.35]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).tickValues([]))
      .selectAll(".domain").attr("stroke", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 24})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("38 donor states (sorted by classical weight)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Donor weight αⱼ");

    // Classical state: 4 fat bars
    const classical = new Array(N).fill(0);
    classical[0] = 0.327; classical[1] = 0.255; classical[2] = 0.245; classical[3] = 0.148;
    // Horseshoe state: 23 broader donors
    const horseshoe = new Array(N).fill(0);
    const hs = [0.218, 0.198, 0.128, 0.121, 0.109, 0.063, 0.053, 0.044, 0.040, 0.034,
                0.028, 0.024, 0.021, 0.020, 0.019, 0.017, 0.016, 0.015, 0.015, 0.015,
                0.014, 0.013, 0.011, 0.007, 0.004, 0.003];
    for (let i = 0; i < hs.length; i++) horseshoe[i] = hs[i];

    const bars = g.selectAll(".dbar").data(d3.range(N)).enter().append("rect")
      .attr("class", "dbar")
      .attr("x", d => x(d))
      .attr("y", h)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", C.steel)
      .attr("opacity", 0.85);

    const label = g.append("text").attr("x", w / 2).attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", C.orange).attr("font-size", 13).attr("font-weight", 600);

    const subLabel = g.append("text").attr("x", w / 2).attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("fill", C.muted).attr("font-size", 11);

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const t = (ts - t0) / 1000;
      const cycle = (t % 6) / 6;          // 0 → 1 over 6s
      const phase = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2;  // 0→1→0
      const showHS = (Math.floor(t / 3) % 2) === 1;
      const target = showHS ? horseshoe : classical;
      const color  = showHS ? C.teal     : C.orange;
      const ease   = d3.easeCubicInOut(phase);

      // Interpolate from the other state to target
      const other  = showHS ? classical  : horseshoe;
      bars.attr("y", (_, i) => {
          const v = other[i] + (target[i] - other[i]) * ease;
          return y(v);
        })
        .attr("height", (_, i) => {
          const v = other[i] + (target[i] - other[i]) * ease;
          return h - y(v);
        })
        .attr("fill", color);

      const count = target.filter(v => v > 0.01).length;
      label.text(showHS ? "Horseshoe prior — donor mass spreads across many states"
                        : "Classical simplex — donor mass concentrates on a few");
      subLabel.text(`Active donors (αⱼ > 0.01): ${count} of 38`);

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // ATT forest plot (3 stages × 1 outcome) with method-coloured points.
  //   data: array of {method, estimate, ci_lo, ci_hi, n_selected, se, notes}
  //   activeMethods: subset of method labels to render
  // ------------------------------------------------------------------
  function stage_forest(container) {
    const W = 800, H = 280;
    const margin = { top: 30, right: 40, bottom: 50, left: 200 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    const colorMap = {
      "Classical SCM":       C.steel,
      "Bayesian HS":         C.teal,
      "Bayesian Spatial SAR": C.orange,
    };

    function update(rows, activeMethods) {
      g.selectAll("*").remove();
      const filtered = rows.filter(r => activeMethods.includes(r.method));
      if (filtered.length === 0) return;

      const xMin = d3.min(filtered, d => d.ci_lo);
      const xMax = d3.max(filtered, d => d.ci_hi);
      const pad = Math.max(1.0, (xMax - xMin) * 0.08);
      const x = d3.scaleLinear().domain([Math.min(xMin - pad, -2), Math.max(xMax + pad, 1)]).range([0, w]);
      const y = d3.scaleBand().domain(filtered.map(d => d.method)).range([0, h]).padding(0.4);

      // zero line
      g.append("line").attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      g.append("text").attr("x", x(0)).attr("y", -8)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
        .text("null effect");

      // axes
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".1f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("ATT (packs per capita per year)");

      filtered.forEach(d => {
        const yc = y(d.method) + y.bandwidth() / 2;
        const color = colorMap[d.method] || C.text;
        // label
        g.append("text").attr("x", -12).attr("y", yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 13)
          .text(d.method);
        // CI line
        g.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc)
          .attr("stroke", color).attr("stroke-width", 2.5);
        g.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
          .attr("y1", yc - 6).attr("y2", yc + 6)
          .attr("stroke", color).attr("stroke-width", 2);
        g.append("line")
          .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
          .attr("y1", yc - 6).attr("y2", yc + 6)
          .attr("stroke", color).attr("stroke-width", 2);
        // point
        const dot = g.append("circle")
          .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 7)
          .attr("fill", color)
          .attr("stroke", "#fff").attr("stroke-width", 1.5)
          .style("cursor", "pointer");
        // value label
        g.append("text")
          .attr("x", x(d.estimate)).attr("y", yc - 12)
          .attr("text-anchor", "middle")
          .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
          .text(d.estimate.toFixed(2));
        dot.on("mousemove", function (ev) {
          const rect = container.getBoundingClientRect();
          tooltip.html(
            `<div><strong style="color:${color}">${d.method}</strong></div>` +
            `<div><span class='tooltip-key'>ATT =</span> <span class='tooltip-val'>${d.estimate.toFixed(3)}</span></div>` +
            `<div><span class='tooltip-key'>95% interval =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(2)}, ${d.ci_hi.toFixed(2)}]</span></div>` +
            `<div><span class='tooltip-key'>active donors =</span> <span class='tooltip-val'>${d.n_selected}</span></div>` +
            `<div><span class='tooltip-key'>notes =</span> <span class='tooltip-val'>${d.notes || ""}</span></div>`
          ).classed("show", true)
            .style("left", (ev.clientX - rect.left + 12) + "px")
            .style("top",  (ev.clientY - rect.top  + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });
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
    trajectory,
    donor_weights,
    spillover_bars,
    simplex_vs_horseshoe,
    stage_forest,
    C,
  };
})();
