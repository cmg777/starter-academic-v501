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
      // python_fe_kuznets methods:
      "Pooled OLS":    C.muted,
      "TWFE":          C.teal,
      "+ Resources":   C.steel,
      "+ Trade":       "#9bdcc3",
      "+ Mobility":    "#e8956a",
      "+ Aid/Educ":    "#8ec8e8",
      "+ Ethnicity":   C.orange,
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
  // Panel concept animation (Tab 1 for python_fe_kuznets).
  //   Six pre-computed country "trajectories" on a log GDP x Gini plot.
  //   Dashed grey curve = pooled cross-sectional cubic. Coloured lines move
  //   through time; their within-country slopes differ from the pooled slope.
  // ------------------------------------------------------------------
  function panel_animation(container) {
    const W = 720, H = 360;
    // Right margin extended to host the legend OUTSIDE the plot area so
    // it never overlaps the right-most country trajectory (e.g. Qatar).
    const margin = { top: 28, right: 150, bottom: 48, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Domain: log GDP from 5.5 to 11.5 (matches post data).
    const x = d3.scaleLinear().domain([5.5, 11.5]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 0.18]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(7))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 38})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("log GDP per capita");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Regional Gini");

    // Pooled OLS cubic: β = (0.293, -0.032, 0.0011) plus a centering intercept.
    const b1 = 0.293, b2 = -0.0320, b3 = 0.00112, b0 = -1.45;
    const cubic = lx => b0 + b1 * lx + b2 * lx * lx + b3 * lx * lx * lx;
    const grid = d3.range(5.5, 11.55, 0.05);
    const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX);
    g.append("path")
      .attr("d", line(grid.map(lx => [lx, Math.max(0.005, Math.min(0.175, cubic(lx)))])))
      .attr("fill", "none").attr("stroke", C.muted).attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5 4");

    // Six "countries" — each with its own intercept offset and a small upward
    // mean-GDP drift over T=5 periods. Trajectories show the within-country
    // pattern relative to the pooled curve.
    const countries = [
      { name: "Liberia",       baseGDP: 6.0,  ginShift:  0.04, color: C.orange   },
      { name: "Kenya",         baseGDP: 7.4,  ginShift:  0.00, color: C.teal     },
      { name: "Algeria",       baseGDP: 8.8,  ginShift:  0.02, color: C.steel    },
      { name: "Argentina",     baseGDP: 9.3,  ginShift: -0.01, color: "#e8956a"  },
      { name: "Germany",       baseGDP: 10.3, ginShift:  0.00, color: "#8ec8e8"  },
      { name: "Qatar",         baseGDP: 11.2, ginShift:  0.04, color: "#66e8df"  },
    ];

    const trajectories = countries.map(c => {
      const pts = [];
      for (let t = 0; t < 5; t++) {
        const lx = c.baseGDP + t * 0.10;
        const gini = Math.max(0.005, Math.min(0.175, cubic(lx) + c.ginShift));
        pts.push([lx, gini]);
      }
      return { name: c.name, color: c.color, pts };
    });

    // Draw faint background trajectories.
    trajectories.forEach(tr => {
      g.append("path")
        .attr("d", line(tr.pts))
        .attr("fill", "none").attr("stroke", tr.color).attr("stroke-width", 2)
        .attr("opacity", 0.85);
    });

    // Animated cursor on each trajectory.
    const cursors = trajectories.map(tr => ({
      tr,
      circle: g.append("circle").attr("r", 6).attr("fill", tr.color)
        .attr("stroke", "#0f1729").attr("stroke-width", 1.5),
    }));

    // Legend — placed OUTSIDE the plot area (right margin) so it never
    // overlaps country trajectories. The outer 'g' translates by margin.left,
    // so x = w + 8 sits just to the right of the plot.
    const lg = g.append("g").attr("transform", `translate(${w + 8},${0})`);
    lg.append("rect").attr("width", 136).attr("height", 110)
      .attr("fill", "rgba(15,23,41,0.85)").attr("stroke", C.line).attr("rx", 6);
    lg.append("text").attr("x", 8).attr("y", 14)
      .attr("fill", C.muted).attr("font-size", 10).text("pooled cubic ⟶ dashed");
    countries.slice(0, 6).forEach((c, i) => {
      lg.append("circle").attr("cx", 14).attr("cy", 30 + i * 12).attr("r", 4).attr("fill", c.color);
      lg.append("text").attr("x", 24).attr("y", 33 + i * 12)
        .attr("fill", C.text).attr("font-size", 10).text(c.name);
    });

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const cyc = ((ts - t0) / 1000) % 8;
      const frac = cyc / 8; // [0,1)
      const idxF = frac * (5 - 1); // continuous 0..T-1
      const i0 = Math.floor(idxF);
      const i1 = Math.min(4, i0 + 1);
      const u = idxF - i0;
      cursors.forEach(c => {
        const p0 = c.tr.pts[i0];
        const p1 = c.tr.pts[i1];
        const lx = p0[0] + u * (p1[0] - p0[0]);
        const gn = p0[1] + u * (p1[1] - p0[1]);
        c.circle.attr("cx", x(lx)).attr("cy", y(gn));
      });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Panel simulator scatter (Tab 2 for python_fe_kuznets).
  //   Shows simulated country-period points colored by country, with the
  //   true cubic curve (dashed), pooled OLS fit (orange), and TWFE-implied
  //   fit (teal) overlaid.
  // ------------------------------------------------------------------
  function panel_scatter(container) {
    const W = 720, H = 360;
    // Right margin enlarged so the legend sits OUTSIDE the data area,
    // preventing overlap with curves or scatter points.
    const margin = { top: 20, right: 150, bottom: 44, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const root = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      root.selectAll("*").remove();
      // data: { points: [[lx, gini, country_id], ...],
      //         truth: (lx)=>gini, olsFit: (lx)=>gini, feFit: (lx)=>gini,
      //         lxRange: [min, max], giRange: [min, max] }
      const x = d3.scaleLinear().domain(data.lxRange).range([0, w]);
      const y = d3.scaleLinear().domain(data.giRange).range([h, 0]);

      root.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(7))
        .selectAll("text").attr("fill", C.muted);
      root.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      root.selectAll(".domain, .tick line").attr("stroke", C.muted);

      root.append("text")
        .attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("log GDP per capita (simulated)");
      root.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Gini (simulated)");

      // Scatter
      const colorScale = d3.scaleSequential(d3.interpolateCool).domain([0, data.nCountries]);
      root.selectAll("circle.pt").data(data.points).enter().append("circle")
        .attr("class", "pt")
        .attr("cx", d => x(d[0])).attr("cy", d => y(d[1]))
        .attr("r", 2.5)
        .attr("fill", d => colorScale(d[2]))
        .attr("opacity", 0.55);

      // Curves
      const grid = d3.range(data.lxRange[0], data.lxRange[1] + 1e-6, (data.lxRange[1]-data.lxRange[0])/120);
      const lineGen = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX);

      // Track legend entries so they can be drawn outside the plot.
      const legendEntries = [];
      function drawCurve(fn, color, dash, label, lwidth) {
        const pts = grid.map(lx => [lx, fn(lx)]);
        root.append("path")
          .attr("d", lineGen(pts))
          .attr("fill", "none").attr("stroke", color).attr("stroke-width", lwidth || 2)
          .attr("stroke-dasharray", dash || null).attr("opacity", 0.95);
        legendEntries.push({ label, color, dash });
      }
      drawCurve(data.truth,  C.muted,  "5 4", "true cubic", 1.8);
      drawCurve(data.olsFit, C.orange, null,  "pooled OLS", 2.2);
      drawCurve(data.feFit,  C.teal,   null,  "TWFE (within)", 2.2);

      // Legend OUTSIDE the plot, in the right margin band. No overlap
      // with the scatter or the fitted curves.
      const lg = root.append("g").attr("transform", `translate(${w + 8},${4})`);
      lg.append("rect").attr("width", 138).attr("height", 26 + legendEntries.length * 18)
        .attr("fill", "rgba(15,23,41,0.85)").attr("stroke", C.line).attr("rx", 6);
      lg.append("text").attr("x", 8).attr("y", 14)
        .attr("fill", C.muted).attr("font-size", 10).text("fitted curves");
      legendEntries.forEach((e, i) => {
        const yRow = 30 + i * 18;
        lg.append("line")
          .attr("x1", 8).attr("x2", 30)
          .attr("y1", yRow).attr("y2", yRow)
          .attr("stroke", e.color).attr("stroke-width", 2.5)
          .attr("stroke-dasharray", e.dash || null);
        lg.append("text").attr("x", 36).attr("y", yRow + 4)
          .attr("fill", C.text).attr("font-size", 11).text(e.label);
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // β̂₁ histogram (Tab 2 100-sim button).
  //   Two-method histogram of the linear coefficient estimate with the true
  //   value annotated.
  // ------------------------------------------------------------------
  function beta_histograms(container) {
    const W = 720, H = 260;
    const margin = { top: 18, right: 24, bottom: 38, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const all = data.beta_ols.concat(data.beta_fe);
      if (all.length === 0) return;
      const ext = d3.extent(all);
      const span = Math.max(0.3, ext[1] - ext[0]);
      const pad = span * 0.06;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const nBins = 24;
      const bin = d3.bin().domain(x.domain()).thresholds(nBins);
      const binsO = bin(data.beta_ols);
      const binsF = bin(data.beta_fe);
      const maxC = d3.max(binsO.concat(binsF), d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      function drawBars(bins, color, opacity) {
        g.selectAll(null).data(bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", color).attr("opacity", opacity);
      }
      drawBars(binsO, C.orange, 0.65);
      drawBars(binsF, C.teal,   0.85);

      g.append("line").attr("x1", x(data.beta_true)).attr("x2", x(data.beta_true))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.beta_true) + 4).attr("y", 12)
        .attr("fill", C.steel).attr("font-size", 11)
        .text(`true β₁ = ${data.beta_true.toFixed(3)}`);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated β̂₁ across 100 simulated panels (orange = pooled OLS, teal = TWFE)");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Kuznets cubic curve with turning-point markers (Tab 3).
  //   Inputs: b0, b1, b2, b3 — coefficients. Marks the two real roots of the
  //   derivative on the x-axis. Shades the three regions.
  // ------------------------------------------------------------------
  function kuznets_curve(container) {
    const W = 720, H = 360;
    const margin = { top: 30, right: 28, bottom: 56, left: 58 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // log GDP range: data span 5.25 to 11.67. Pad a touch.
    const LX_MIN = 5.0, LX_MAX = 12.0;

    function update(coefs) {
      g.selectAll("*").remove();
      const { b0, b1, b2, b3, real_roots } = coefs;
      const cubic = lx => b0 + b1 * lx + b2 * lx * lx + b3 * lx * lx * lx;
      const grid = d3.range(LX_MIN, LX_MAX + 1e-6, (LX_MAX - LX_MIN) / 200);
      const ys = grid.map(cubic);

      // Auto y-domain centred on data, clamped to [0, 0.25].
      let yMin = d3.min(ys), yMax = d3.max(ys);
      const pad = Math.max(0.005, (yMax - yMin) * 0.10);
      const yDomain = [Math.max(-0.05, yMin - pad), Math.min(0.30, yMax + pad)];

      const x = d3.scaleLinear().domain([LX_MIN, LX_MAX]).range([0, w]);
      const y = d3.scaleLinear().domain(yDomain).range([h, 0]);

      // Axes
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Secondary x-axis labels: dollar values
      const usdTicks = [200, 1000, 5000, 22000, 100000];
      usdTicks.forEach(usd => {
        const lx = Math.log(usd);
        if (lx >= LX_MIN && lx <= LX_MAX) {
          g.append("text")
            .attr("x", x(lx)).attr("y", h + 38)
            .attr("text-anchor", "middle").attr("fill", C.steel).attr("font-size", 10)
            .text(`\$${usd.toLocaleString()}`);
        }
      });

      // x label
      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 52})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("log GDP per capita");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Predicted Gini");

      // Shading: three regions if two real roots
      if (real_roots.length === 2) {
        const [r1, r2] = real_roots;
        const inRange = r => r >= LX_MIN && r <= LX_MAX;
        const r1ok = inRange(r1), r2ok = inRange(r2);
        if (r1ok) {
          g.append("rect").attr("x", 0).attr("y", 0)
            .attr("width", x(r1)).attr("height", h)
            .attr("fill", C.orange).attr("opacity", 0.07);
        }
        if (r1ok && r2ok) {
          g.append("rect").attr("x", x(r1)).attr("y", 0)
            .attr("width", x(r2) - x(r1)).attr("height", h)
            .attr("fill", C.teal).attr("opacity", 0.07);
        }
        if (r2ok) {
          g.append("rect").attr("x", x(r2)).attr("y", 0)
            .attr("width", w - x(r2)).attr("height", h)
            .attr("fill", C.orange).attr("opacity", 0.07);
        }
      }

      // Zero line
      g.append("line").attr("x1", 0).attr("x2", w)
        .attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "2 4");

      // Curve
      const lineGen = d3.line().x((_, i) => x(grid[i])).y(d => y(d)).curve(d3.curveMonotoneX);
      g.append("path").attr("d", lineGen(ys))
        .attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.5);

      // Turning point markers
      real_roots.forEach((r, i) => {
        if (r < LX_MIN || r > LX_MAX) return;
        const gv = cubic(r);
        g.append("line")
          .attr("x1", x(r)).attr("x2", x(r)).attr("y1", 0).attr("y2", h)
          .attr("stroke", C.teal).attr("stroke-width", 1).attr("stroke-dasharray", "3 3");
        g.append("circle").attr("cx", x(r)).attr("cy", y(gv)).attr("r", 6)
          .attr("fill", C.teal).attr("stroke", "#0f1729").attr("stroke-width", 1.5);
        g.append("text").attr("x", x(r)).attr("y", -6)
          .attr("text-anchor", "middle").attr("fill", C.teal).attr("font-size", 10)
          .text(`TP${i + 1}: \$${Math.round(Math.exp(r)).toLocaleString()}`);
      });

      // Data range bracket — sits immediately below the x-axis with short
      // end caps. Label is placed in the LEFT margin (outside the data area)
      // so it never collides with USD ticks below the axis.
      g.append("line").attr("x1", x(5.25)).attr("x2", x(11.67))
        .attr("y1", h + 4).attr("y2", h + 4)
        .attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("line").attr("x1", x(5.25)).attr("x2", x(5.25))
        .attr("y1", h + 1).attr("y2", h + 7)
        .attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("line").attr("x1", x(11.67)).attr("x2", x(11.67))
        .attr("y1", h + 1).attr("y2", h + 7)
        .attr("stroke", C.steel).attr("stroke-width", 2);
      // Label placed to the LEFT of the bracket, in the axis margin gap,
      // anchored to the right edge so it sits flush against the bracket
      // and does not overlap any axis tick or USD label.
      g.append("text").attr("x", x(5.25) - 6).attr("y", h + 8)
        .attr("fill", C.steel).attr("font-size", 10).attr("text-anchor", "end")
        .text("data range");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Determinant bar chart (Tab 4).
  //   Horizontal bars ranked by absolute coefficient. Color by direction
  //   (orange = increases inequality, steel = decreases). Faded if not
  //   significant.
  // ------------------------------------------------------------------
  function determinant_bars(container) {
    const W = 720;
    const margin = { top: 18, right: 60, bottom: 36, left: 160 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 360`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    function update(data) {
      // data: array of {name, coefficient, significant, direction}
      const sorted = [...data].sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
      const facetH = sorted.length * 28 + 16;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.det").remove();
      const g = svg.append("g").attr("class", "det")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const w = W - margin.left - margin.right;
      const ext = d3.extent(sorted, d => d.coefficient);
      const span = Math.max(0.08, ext[1] - ext[0]);
      const xMin = Math.min(0, ext[0] - span * 0.08);
      const xMax = Math.max(0, ext[1] + span * 0.08);
      const x = d3.scaleLinear().domain([xMin, xMax]).range([0, w]);
      const y = d3.scaleBand().domain(sorted.map(d => d.name)).range([0, facetH]).padding(0.30);

      // Zero line
      g.append("line").attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", facetH)
        .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 3");

      // x axis
      g.append("g").attr("transform", `translate(0,${facetH})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      sorted.forEach(d => {
        const yc = y(d.name);
        const color = d.coefficient > 0 ? C.orange : C.steel;
        const opacity = d.significant ? 0.90 : 0.30;
        // Label
        g.append("text").attr("x", -10).attr("y", yc + y.bandwidth() / 2 + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(d.name);
        // Bar
        const x0 = x(0), x1 = x(d.coefficient);
        g.append("rect")
          .attr("x", Math.min(x0, x1)).attr("y", yc)
          .attr("width", Math.abs(x1 - x0)).attr("height", y.bandwidth())
          .attr("fill", color).attr("opacity", opacity);
        // Value label
        g.append("text")
          .attr("x", x1 + (x1 >= x0 ? 6 : -6))
          .attr("y", yc + y.bandwidth() / 2 + 4)
          .attr("text-anchor", x1 >= x0 ? "start" : "end")
          .attr("fill", d.significant ? C.text : C.muted)
          .attr("font-size", 11).attr("font-weight", 600)
          .text(d.coefficient.toFixed(4));
      });

      // x label
      g.append("text").attr("transform", `translate(${w / 2},${facetH + 30})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("TWFE coefficient (solid = significant at p < 0.10)");
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
    panel_animation,
    panel_scatter,
    beta_histograms,
    kuznets_curve,
    determinant_bars,
    C,
  };
})();
