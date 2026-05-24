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
      // r_double_lasso (kept for shared template)
      "First diff":    C.steel,
      "OLS (full)":    C.muted,
      "PSL":           "#9bdcc3",
      "DL (rigorous)": C.teal,
      "DL (CV)":       C.orange,
      // stata_cate methods
      "Naive raw difference":        C.muted,
      "teffects aipw (parametric)":  C.steel,
      "cate po (PO ML)":             C.teal,
      "cate aipw (AIPW ML)":         C.orange,
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

// ============================================================
// CATE-specific chart extensions for stata_cate.
//   * heterogeneity_animation : Tab 1 — animated tau(x) bouncing along a covariate
//   * iate_histogram          : Tab 4 — histogram of household-level IATE
//   * gate_bars               : Tab 3 — GATE / GATES bars with 95% CI whiskers
//   * iate_scatter_binned     : Tab 4 — binned IATE vs covariate with SE band
//   * cate_simulator_panel    : Tab 2 — simulated tau(x) curve + ATE bar
// ============================================================
(function () {
  "use strict";
  if (!window.CHARTS) return;
  const C = window.CHARTS.C;

  function ensureSVG(container, vbW, vbH) {
    container.innerHTML = "";
    return d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${vbW} ${vbH}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
  }

  // ------------------------------------------------------------------
  // Tab 1: heterogeneity_animation
  //   Shows two lines on the same axis:
  //     - The flat ATE (orange dashed) — a single number.
  //     - The true CATE function tau(x) (teal curve) — sinusoidal.
  //   A moving marker on the CATE curve illustrates "the average hides
  //   the variation" — different x values get very different effects.
  // ------------------------------------------------------------------
  function heterogeneity_animation(container) {
    const W = 720, H = 320;
    const m = { top: 28, right: 28, bottom: 44, left: 60 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    // Domain: "income percentile" 0..100, effect 0..22 (thousands)
    const x = d3.scaleLinear().domain([0, 100]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 22]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => d + "%"))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d => "$" + d + "k"))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text").attr("transform", `translate(${w/2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Where you sit in the income distribution");
    g.append("text").attr("transform", `rotate(-90) translate(${-h/2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Treatment effect of 401(k) eligibility");

    // True CATE curve: rises with income, plateaus, jumps at top.
    // Modelled loosely on the post's 5 GATEs (4.1 → 1.4 → 5.2 → 8.5 → 20.5)
    const xs = d3.range(0, 100.1, 1);
    const catePts = xs.map(v => {
      // Smooth ramp roughly matching the post's pattern: dip near 20%, climb steeply > 70%
      const dip = 4 - 3 * Math.exp(-(Math.pow((v - 20)/8, 2)));
      const climb = 0.05 * Math.pow(Math.max(0, v - 40), 1.6) / 8;
      const jump = 14 / (1 + Math.exp(-(v - 80) / 4));
      return [v, Math.max(0.5, dip + climb + jump * 0.5)];
    });

    const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX);
    // ATE flat line at 8
    g.append("line").attr("x1", 0).attr("x2", w)
      .attr("y1", y(8)).attr("y2", y(8))
      .attr("stroke", C.orange).attr("stroke-width", 2.5).attr("stroke-dasharray", "6 4");
    g.append("text").attr("x", w - 8).attr("y", y(8) - 6)
      .attr("text-anchor", "end").attr("fill", C.orange).attr("font-size", 11)
      .text("ATE ≈ $8k (single number)");

    g.append("path").attr("d", line(catePts))
      .attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 2.8);
    g.append("text").attr("x", w - 8).attr("y", y(catePts[catePts.length-1][1]) - 6)
      .attr("text-anchor", "end").attr("fill", C.teal).attr("font-size", 11)
      .text("CATE τ(x) (varies with income)");

    // Moving marker
    const marker = g.append("circle").attr("r", 8).attr("fill", C.teal)
      .attr("stroke", "#fff").attr("stroke-width", 1.5);
    const markerLabel = g.append("text")
      .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
      .attr("text-anchor", "middle");

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      const cycle = (Math.sin(elapsed * 0.5) + 1) / 2; // [0,1]
      const px = cycle * 100;
      // interpolate y from catePts
      const idx = Math.min(catePts.length - 1, Math.max(0, Math.floor(px)));
      const py = catePts[idx][1];
      marker.attr("cx", x(px)).attr("cy", y(py));
      markerLabel.attr("x", x(px)).attr("y", y(py) - 14)
        .text("$" + py.toFixed(1) + "k");
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Tab 4: iate_histogram
  //   data: array of {lo, hi, count}
  //   Renders bars + vertical reference lines at ATE and median.
  // ------------------------------------------------------------------
  function iate_histogram(container) {
    const W = 720, H = 320;
    const m = { top: 24, right: 28, bottom: 44, left: 58 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;
    let svg, g;

    function update(bins, opts) {
      opts = opts || {};
      svg = ensureSVG(container, W, H);
      g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

      const xMin = bins[0].lo;
      const xMax = bins[bins.length - 1].hi;
      const x = d3.scaleLinear().domain([xMin, xMax]).range([0, w]);
      const maxCount = d3.max(bins, d => d.count) || 1;
      const y = d3.scaleLinear().domain([0, maxCount * 1.08]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d => "$" + (d/1000).toFixed(0) + "k"))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text").attr("transform", `translate(${w/2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated individual treatment effect τ̂ᵢ (dollars)");
      g.append("text").attr("transform", `rotate(-90) translate(${-h/2},${-44})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Households");

      // Bars
      bins.forEach(b => {
        g.append("rect")
          .attr("x", x(b.lo))
          .attr("width", Math.max(0, x(b.hi) - x(b.lo) - 1))
          .attr("y", y(b.count))
          .attr("height", h - y(b.count))
          .attr("fill", b.lo < 0 ? C.orange : C.teal)
          .attr("opacity", 0.78);
      });

      // Zero line
      g.append("line").attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.muted).attr("stroke-width", 1)
        .attr("stroke-dasharray", "3 4");
      g.append("text").attr("x", x(0) + 4).attr("y", 10)
        .attr("fill", C.muted).attr("font-size", 11).text("zero");

      // ATE reference line
      if (typeof opts.ate === "number") {
        g.append("line").attr("x1", x(opts.ate)).attr("x2", x(opts.ate))
          .attr("y1", 0).attr("y2", h)
          .attr("stroke", C.steel).attr("stroke-width", 2.2);
        g.append("text").attr("x", x(opts.ate) + 4).attr("y", 22)
          .attr("fill", C.steel).attr("font-size", 11)
          .text("ATE = $" + Math.round(opts.ate).toLocaleString());
      }
      // Median reference line
      if (typeof opts.median === "number") {
        g.append("line").attr("x1", x(opts.median)).attr("x2", x(opts.median))
          .attr("y1", 0).attr("y2", h)
          .attr("stroke", C.text).attr("stroke-width", 1.2)
          .attr("stroke-dasharray", "4 4");
        g.append("text").attr("x", x(opts.median) + 4).attr("y", 38)
          .attr("fill", C.text).attr("font-size", 11)
          .text("median = $" + Math.round(opts.median).toLocaleString());
      }
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 3: gate_bars
  //   Horizontal CI bars for GATE/GATES table. Hover for SE / CI / n_obs.
  //   data: array of {label, estimate, ci_lo, ci_hi, se, p_value, n_obs?}
  // ------------------------------------------------------------------
  function gate_bars(container) {
    const W = 800;
    const m = { top: 32, right: 60, bottom: 50, left: 250 };
    let svg;

    function update(rows, opts) {
      opts = opts || {};
      const rowH = 36;
      const innerH = rows.length * rowH;
      const H = m.top + innerH + m.bottom;
      svg = ensureSVG(container, W, H);
      const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);
      const w = W - m.left - m.right;

      const allVals = rows.flatMap(d => [d.ci_lo, d.ci_hi]);
      const xMin = Math.min(0, d3.min(allVals));
      const xMax = Math.max(0, d3.max(allVals));
      const pad = (xMax - xMin) * 0.08;
      const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, w]);
      const y = d3.scaleBand().domain(rows.map(d => d.label)).range([0, innerH]).padding(0.35);

      // Title
      svg.append("text").attr("x", W/2).attr("y", 20)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13)
        .attr("font-weight", 600).text(opts.title || "Group-level treatment effects (95% CI)");

      // x axis
      g.append("g").attr("transform", `translate(0,${innerH})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d => "$" + (d/1000).toFixed(0) + "k"))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("x", w/2).attr("y", innerH + 38)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated treatment effect (dollars)");

      // Zero line
      g.append("line").attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", innerH)
        .attr("stroke", C.muted).attr("stroke-dasharray", "3 4");

      // ATE reference (vertical steel line)
      if (typeof opts.ate === "number") {
        g.append("line").attr("x1", x(opts.ate)).attr("x2", x(opts.ate))
          .attr("y1", 0).attr("y2", innerH)
          .attr("stroke", C.steel).attr("stroke-width", 2);
        g.append("text").attr("x", x(opts.ate) + 4).attr("y", -8)
          .attr("fill", C.steel).attr("font-size", 11)
          .text("ATE ≈ $" + Math.round(opts.ate).toLocaleString());
      }

      const tooltip = d3.select(container).append("div").attr("class", "tooltip");

      // Group labels (placed to left of plot)
      rows.forEach(d => {
        svg.append("text").attr("x", m.left - 10).attr("y", m.top + y(d.label) + y.bandwidth()/2 + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(d.label);
      });

      // Bars + whiskers + points
      rows.forEach(d => {
        const yc = y(d.label) + y.bandwidth()/2;
        const sig = (typeof d.p_value === "number" && d.p_value < 0.05);
        const colour = sig ? C.teal : C.orange;
        const gg = g.append("g").style("cursor", "pointer");

        gg.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc)
          .attr("stroke", colour).attr("stroke-width", 2.5);
        gg.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
          .attr("y1", yc - 6).attr("y2", yc + 6)
          .attr("stroke", colour).attr("stroke-width", 2.5);
        gg.append("line").attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
          .attr("y1", yc - 6).attr("y2", yc + 6)
          .attr("stroke", colour).attr("stroke-width", 2.5);
        gg.append("circle").attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 6)
          .attr("fill", colour).attr("stroke", "#fff").attr("stroke-width", 1.5);

        // Estimate label to the right of the bar
        gg.append("text").attr("x", x(d.ci_hi) + 8).attr("y", yc + 4)
          .attr("fill", C.text).attr("font-size", 11)
          .text("$" + Math.round(d.estimate).toLocaleString() +
                (sig ? "" : " (n.s.)"));

        gg.on("mousemove", function (ev) {
          const rect = container.getBoundingClientRect();
          let html = `<div><strong style="color:${colour}">${d.label}</strong></div>`
            + `<div><span class='tooltip-key'>τ̂ =</span> <span class='tooltip-val'>$${Math.round(d.estimate).toLocaleString()}</span></div>`
            + `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>$${Math.round(d.se).toLocaleString()}</span></div>`
            + `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[$${Math.round(d.ci_lo).toLocaleString()}, $${Math.round(d.ci_hi).toLocaleString()}]</span></div>`
            + `<div><span class='tooltip-key'>p =</span> <span class='tooltip-val'>${d.p_value.toFixed(3)}</span></div>`;
          if (d.n_obs) html += `<div><span class='tooltip-key'>n =</span> <span class='tooltip-val'>${d.n_obs.toLocaleString()}</span></div>`;
          tooltip.html(html)
            .classed("show", true)
            .style("left", (ev.clientX - rect.left + 12) + "px")
            .style("top",  (ev.clientY - rect.top  + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 4: iate_vs_covariate (binned line + scatter overlay)
  //   binned: array of {x_value, mean_iate, se_iate}
  //   scatter: array of {x: , iate}  (optional, downsampled)
  // ------------------------------------------------------------------
  function iate_vs_covariate(container) {
    const W = 720, H = 320;
    const m = { top: 24, right: 28, bottom: 50, left: 60 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;
    let svg;

    function update(data) {
      svg = ensureSVG(container, W, H);
      const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

      const binned = data.binned || [];
      const scatter = data.scatter || [];
      const xKey = data.xKey || "x";
      const xLabel = data.xLabel || "x";

      const xVals = binned.map(d => d[xKey]).concat(scatter.map(d => d[xKey]));
      const xExt = d3.extent(xVals);
      const xPad = (xExt[1] - xExt[0]) * 0.04;
      const x = d3.scaleLinear().domain([xExt[0] - xPad, xExt[1] + xPad]).range([0, w]);

      // y-axis: include scatter range plus binned CI band
      const yVals = scatter.map(d => d.iate)
        .concat(binned.map(d => d.mean_iate + 2 * (d.se_iate || 0)))
        .concat(binned.map(d => d.mean_iate - 2 * (d.se_iate || 0)));
      const yExt = d3.extent(yVals);
      const yPad = (yExt[1] - yExt[0]) * 0.05;
      const y = d3.scaleLinear().domain([yExt[0] - yPad, yExt[1] + yPad]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(data.xFormat || d3.format(",.0f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d => "$" + (d/1000).toFixed(0) + "k"))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text").attr("transform", `translate(${w/2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text(xLabel);
      g.append("text").attr("transform", `rotate(-90) translate(${-h/2},${-46})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated τ̂ᵢ (dollars)");

      // Zero line
      g.append("line").attr("x1", 0).attr("x2", w)
        .attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.muted).attr("stroke-dasharray", "3 4");

      // Scatter (faint, downsampled)
      scatter.forEach(d => {
        g.append("circle").attr("cx", x(d[xKey])).attr("cy", y(d.iate))
          .attr("r", 1.8).attr("fill", C.steel).attr("opacity", 0.35);
      });

      // 95% CI band on binned means
      if (binned.length > 1) {
        const area = d3.area()
          .x(d => x(d[xKey]))
          .y0(d => y(d.mean_iate - 1.96 * (d.se_iate || 0)))
          .y1(d => y(d.mean_iate + 1.96 * (d.se_iate || 0)))
          .curve(d3.curveMonotoneX);
        g.append("path").attr("d", area(binned))
          .attr("fill", C.teal).attr("opacity", 0.18);
      }

      // Binned mean line
      const line = d3.line()
        .x(d => x(d[xKey]))
        .y(d => y(d.mean_iate))
        .curve(d3.curveMonotoneX);
      g.append("path").attr("d", line(binned))
        .attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 2.5);

      // Markers on binned points
      binned.forEach(d => {
        g.append("circle").attr("cx", x(d[xKey])).attr("cy", y(d.mean_iate))
          .attr("r", 3.5).attr("fill", C.teal).attr("stroke", "#fff").attr("stroke-width", 1);
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 2: cate_simulator_curve
  //   Shows a simulated true CATE curve tau(x) and estimated tau-hat per
  //   household point. Slider-driven; updates on call.
  //   data: { xs, true_tau, est_tau, ate_true, ate_hat, xLabel }
  // ------------------------------------------------------------------
  function cate_simulator_curve(container) {
    const W = 720, H = 320;
    const m = { top: 24, right: 28, bottom: 50, left: 60 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    function update(data) {
      const svg = ensureSVG(container, W, H);
      const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

      const x = d3.scaleLinear().domain(d3.extent(data.xs)).range([0, w]);
      const allY = data.true_tau.concat(data.est_tau);
      const yExt = d3.extent(allY);
      const pad = (yExt[1] - yExt[0]) * 0.1;
      const y = d3.scaleLinear().domain([yExt[0] - pad, yExt[1] + pad]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(7))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text").attr("transform", `translate(${w/2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text(data.xLabel || "Covariate x");
      g.append("text").attr("transform", `rotate(-90) translate(${-h/2},${-46})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Treatment effect τ");

      // Zero line
      g.append("line").attr("x1", 0).attr("x2", w)
        .attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.muted).attr("stroke-dasharray", "3 4");

      // ATE band (flat orange line)
      g.append("line").attr("x1", 0).attr("x2", w)
        .attr("y1", y(data.ate_true)).attr("y2", y(data.ate_true))
        .attr("stroke", C.orange).attr("stroke-width", 2).attr("stroke-dasharray", "6 4");
      g.append("text").attr("x", w - 8).attr("y", y(data.ate_true) - 6)
        .attr("text-anchor", "end").attr("fill", C.orange).attr("font-size", 11)
        .text("true ATE = " + data.ate_true.toFixed(2));

      // True CATE curve
      const truePts = data.xs.map((xv, i) => [xv, data.true_tau[i]]);
      const lineTrue = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX);
      g.append("path").attr("d", lineTrue(truePts))
        .attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2.5);

      // Estimated tau-hat: scatter dots
      data.xs.forEach((xv, i) => {
        g.append("circle").attr("cx", x(xv)).attr("cy", y(data.est_tau[i]))
          .attr("r", 2.5).attr("fill", C.teal).attr("opacity", 0.65);
      });

      // Legend
      const lg = g.append("g").attr("transform", `translate(${w - 240},${10})`);
      lg.append("rect").attr("width", 240).attr("height", 64)
        .attr("fill", "rgba(15,23,41,0.7)").attr("stroke", C.line).attr("rx", 6);
      lg.append("line").attr("x1", 12).attr("x2", 32).attr("y1", 18).attr("y2", 18)
        .attr("stroke", C.steel).attr("stroke-width", 2.5);
      lg.append("text").attr("x", 38).attr("y", 22).attr("fill", C.text).attr("font-size", 11).text("true τ(x)");
      lg.append("circle").attr("cx", 22).attr("cy", 36).attr("r", 4).attr("fill", C.teal);
      lg.append("text").attr("x", 38).attr("y", 40).attr("fill", C.text).attr("font-size", 11).text("estimated τ̂ᵢ");
      lg.append("line").attr("x1", 12).attr("x2", 32).attr("y1", 54).attr("y2", 54)
        .attr("stroke", C.orange).attr("stroke-width", 2).attr("stroke-dasharray", "4 3");
      lg.append("text").attr("x", 38).attr("y", 58).attr("fill", C.text).attr("font-size", 11).text("ATE (flat)");
    }
    return { update };
  }

  window.CHARTS.heterogeneity_animation = heterogeneity_animation;
  window.CHARTS.iate_histogram = iate_histogram;
  window.CHARTS.gate_bars = gate_bars;
  window.CHARTS.iate_vs_covariate = iate_vs_covariate;
  window.CHARTS.cate_simulator_curve = cate_simulator_curve;
})();
