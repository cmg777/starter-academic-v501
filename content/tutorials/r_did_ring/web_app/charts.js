// charts.js — D3 chart builders for the Ring DiD web app.
//
// Each builder takes a DOM container and returns an object with an `update(...)`
// method so subsequent slider changes can patch the existing SVG instead of
// recreating it.

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
  // Three-numbers bar chart (Tab 1): a hero comparison of the three
  // headline values from the post.
  //   data: array of { name, value_pct, color, sub }
  // ------------------------------------------------------------------
  function three_numbers_bars(container, data) {
    const W = 720, H = 240;
    const margin = { top: 28, right: 60, bottom: 36, left: 230 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const minVal = d3.min(data, d => d.value_pct);
    const x = d3.scaleLinear().domain([Math.min(0, minVal * 1.05), 0]).range([0, w]);
    const y = d3.scaleBand().domain(data.map(d => d.name)).range([0, h]).padding(0.35);

    // Zero line
    g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
      .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

    // Axis
    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => d + "%"))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);
    g.append("text").attr("transform", `translate(${w / 2},${h + 30})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Estimated ATT on log home price (%)");

    data.forEach(d => {
      const yc = y(d.name);
      const x0 = x(0);
      const x1 = x(d.value_pct);
      g.append("text").attr("x", -10).attr("y", yc + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12).text(d.name);
      g.append("text").attr("x", -10).attr("y", yc + y.bandwidth() / 2 + 18)
        .attr("text-anchor", "end").attr("fill", C.muted).attr("font-size", 10).text(d.sub);
      g.append("rect").attr("x", Math.min(x0, x1)).attr("y", yc)
        .attr("width", Math.abs(x1 - x0)).attr("height", y.bandwidth())
        .attr("fill", d.color).attr("opacity", 0.85);
      g.append("text").attr("x", x1 - 6).attr("text-anchor", "end")
        .attr("y", yc + y.bandwidth() / 2 + 4)
        .attr("fill", C.text).attr("font-size", 13).attr("font-weight", 700)
        .text(d.value_pct.toFixed(1) + "%");
    });
  }

  // ------------------------------------------------------------------
  // Ring-choice curve (Tab 2): plot ATT vs cutoff with a slider marker.
  //   data: { points: [{cut_inner, att_pct, ci_lo_pct, ci_hi_pct}], current_cut: number }
  // ------------------------------------------------------------------
  function ringchoice_curve(container) {
    // Bottom margin enlarged to host the legend below the x-axis label,
    // and top margin enlarged so the slider readout sits above the plot
    // area (not on top of the legend).
    const W = 720, H = 420;
    const margin = { top: 46, right: 28, bottom: 110, left: 64 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0.04, 0.16]).range([0, w]);
    const y = d3.scaleLinear().domain([-9, 1]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d => d + "%"))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Inner-ring cutoff d̄ (miles)");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-46})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Parametric ATT (% change in price)");

    // Zero line
    g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
      .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

    const ciArea = g.append("path").attr("fill", C.steel).attr("opacity", 0.18);
    const ciLine = g.append("path").attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2);
    const sliderMarker = g.append("circle").attr("r", 7).attr("fill", C.orange).attr("stroke", "#fff").attr("stroke-width", 1.5);
    const sliderLineV = g.append("line").attr("y1", 0).attr("y2", h).attr("stroke", C.orange).attr("stroke-dasharray", "4 4");
    const sliderText = g.append("text").attr("fill", C.orange).attr("font-size", 12).attr("font-weight", 600).attr("text-anchor", "middle");

    // Three labeled anchors from the post
    const anchors = [
      { cut: 0.05, att: -6.40, label: "0.05 mi · −6.40 %" },
      { cut: 0.10, att: -5.45, label: "0.10 mi · −5.45 %" },
      { cut: 0.15, att: -4.21, label: "0.15 mi · −4.21 %" },
    ];
    anchors.forEach(a => {
      g.append("circle").attr("cx", x(a.cut)).attr("cy", y(a.att)).attr("r", 4).attr("fill", C.teal).attr("opacity", 0.85);
    });

    function update(state) {
      // Build curve via linear interpolation across {0.05, 0.10, 0.15}, with
      // a smooth quadratic-fit between anchors.
      const pts = anchors.slice().sort((a, b) => a.cut - b.cut);
      const grid = d3.range(0.05, 0.1501, 0.005);
      const att_at_cut = (c) => {
        if (c <= pts[0].cut) return pts[0].att;
        if (c >= pts[pts.length - 1].cut) return pts[pts.length - 1].att;
        for (let i = 0; i < pts.length - 1; i++) {
          if (c >= pts[i].cut && c <= pts[i + 1].cut) {
            const t = (c - pts[i].cut) / (pts[i + 1].cut - pts[i].cut);
            return pts[i].att * (1 - t) + pts[i + 1].att * t;
          }
        }
        return 0;
      };
      // CI half-width interpolated similarly (from the 95% CIs in the post).
      const ciHalves = [{cut: 0.05, half: 7.5}, {cut: 0.10, half: 4.7}, {cut: 0.15, half: 3.5}];
      const half_at_cut = (c) => {
        if (c <= ciHalves[0].cut) return ciHalves[0].half;
        if (c >= ciHalves[ciHalves.length - 1].cut) return ciHalves[ciHalves.length - 1].half;
        for (let i = 0; i < ciHalves.length - 1; i++) {
          if (c >= ciHalves[i].cut && c <= ciHalves[i + 1].cut) {
            const t = (c - ciHalves[i].cut) / (ciHalves[i + 1].cut - ciHalves[i].cut);
            return ciHalves[i].half * (1 - t) + ciHalves[i + 1].half * t;
          }
        }
        return 0;
      };

      const curve = grid.map(c => ({ cut: c, att: att_at_cut(c), half: half_at_cut(c) }));
      const lineGen = d3.line().x(d => x(d.cut)).y(d => y(d.att)).curve(d3.curveMonotoneX);
      const areaGen = d3.area().x(d => x(d.cut)).y0(d => y(d.att - d.half)).y1(d => y(d.att + d.half)).curve(d3.curveMonotoneX);

      ciArea.attr("d", areaGen(curve));
      ciLine.attr("d", lineGen(curve));

      const curAtt = att_at_cut(state.current_cut);
      sliderMarker.attr("cx", x(state.current_cut)).attr("cy", y(curAtt));
      sliderLineV.attr("x1", x(state.current_cut)).attr("x2", x(state.current_cut));
      sliderText.attr("x", x(state.current_cut)).attr("y", -10).text(`d̄ = ${state.current_cut.toFixed(2)} mi · ATT = ${curAtt.toFixed(2)} %`);
    }

    // Legend — placed below the x-axis label (outside the plot region) to
    // avoid overlapping the CI band, curve, and slider readout.
    const legendY = h + 56;
    const lg = g.append("g").attr("transform", `translate(0,${legendY})`);
    lg.append("rect").attr("width", w).attr("height", 38).attr("fill", "rgba(15,23,41,0.5)").attr("stroke", C.line).attr("rx", 6);
    lg.append("circle").attr("cx", 16).attr("cy", 14).attr("r", 4).attr("fill", C.teal);
    lg.append("text").attr("x", 28).attr("y", 18).attr("fill", C.text).attr("font-size", 11).text("Post estimates (0.05, 0.10, 0.15 mi)");
    lg.append("rect").attr("x", 230).attr("y", 9).attr("width", 12).attr("height", 8).attr("fill", C.steel).attr("opacity", 0.4);
    lg.append("text").attr("x", 248).attr("y", 18).attr("fill", C.text).attr("font-size", 11).text("Interpolated 95 % CI band");
    lg.append("circle").attr("cx", 16).attr("cy", 30).attr("r", 5).attr("fill", C.orange).attr("stroke", "#fff").attr("stroke-width", 1);
    lg.append("text").attr("x", 28).attr("y", 33).attr("fill", C.text).attr("font-size", 11).text("Your current cutoff");

    return { update };
  }

  // ------------------------------------------------------------------
  // Simulator curve (Tab 3): true τ(d) curve and the cutoff bracket.
  //   state: { A, k, dt, cut, truth_avg, tauhat, n, sigma }
  // ------------------------------------------------------------------
  function simulator_curve(container) {
    // Bottom margin enlarged to host the legend below the x-axis label,
    // and top margin enlarged so the cut/dt labels do not collide with
    // the chart heading.
    const W = 720, H = 420;
    const margin = { top: 46, right: 28, bottom: 110, left: 64 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 1.5]).range([0, w]);
    const yScale = d3.scaleLinear().domain([-0.5, 3.0]).range([h, 0]);

    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");

    g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Distance d (miles)");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-46})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Treatment effect τ(d)");

    const truePath = g.append("path").attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 3);
    const cutLine = g.append("line").attr("y1", 0).attr("y2", h).attr("stroke", C.orange).attr("stroke-width", 2);
    const cutLabel = g.append("text").attr("fill", C.orange).attr("font-size", 12).attr("text-anchor", "middle");
    const dtLine = g.append("line").attr("y1", 0).attr("y2", h).attr("stroke", C.steel).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
    const dtLabel = g.append("text").attr("fill", C.steel).attr("font-size", 12).attr("text-anchor", "middle");
    const tauhatBar = g.append("rect").attr("fill", C.orange).attr("opacity", 0.35).attr("stroke", C.orange).attr("stroke-width", 1.5);
    const truthBar = g.append("rect").attr("fill", C.teal).attr("opacity", 0.18);
    const zeroLine = g.append("line").attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

    function update(state) {
      const yMax = Math.max(0.5, state.A * 1.1);
      yScale.domain([-0.3, yMax]);
      xAxisG.call(d3.axisBottom(x).ticks(7).tickFormat(d3.format(".2f"))).selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(".2f"))).selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      zeroLine.attr("x1", 0).attr("x2", w).attr("y1", yScale(0)).attr("y2", yScale(0));

      // True curve τ(d) = A · exp(−k·d) · 1{d ≤ dt}
      const grid = d3.range(0, 1.501, 0.01);
      const tau = grid.map(d => d <= state.dt ? state.A * Math.exp(-state.k * d) : 0);
      const pts = grid.map((d, i) => [d, tau[i]]);
      const lineGen = d3.line().x(p => x(p[0])).y(p => yScale(p[1])).curve(d3.curveMonotoneX);
      truePath.attr("d", lineGen(pts));

      // Truth bracket: average inside [0, cut]
      truthBar.attr("x", x(0)).attr("y", yScale(state.truth_avg))
        .attr("width", x(state.cut) - x(0))
        .attr("height", Math.max(0, yScale(0) - yScale(state.truth_avg)));

      // τ̂ bracket: estimated horizontal line over [0, cut]
      const tauHatY = yScale(state.tauhat);
      tauhatBar.attr("x", x(0)).attr("y", tauHatY - 2)
        .attr("width", x(state.cut) - x(0))
        .attr("height", 4);

      cutLine.attr("x1", x(state.cut)).attr("x2", x(state.cut));
      dtLine.attr("x1", x(state.dt)).attr("x2", x(state.dt));

      // When cut and dt are close, separate them vertically AND horizontally
      // so labels don't collide. Otherwise centre them above each line.
      const closeXY = Math.abs(state.cut - state.dt) < 0.06;
      if (closeXY) {
        cutLabel.attr("x", x(state.cut) + 22).attr("y", -22).attr("text-anchor", "start").text(`d̄ = ${state.cut.toFixed(2)}`);
        dtLabel.attr("x", x(state.dt) - 22).attr("y", -22).attr("text-anchor", "end").text(`d_t = ${state.dt.toFixed(2)}`);
      } else {
        cutLabel.attr("x", x(state.cut)).attr("y", -10).attr("text-anchor", "middle").text(`d̄ = ${state.cut.toFixed(2)}`);
        dtLabel.attr("x", x(state.dt)).attr("y", -10).attr("text-anchor", "middle").text(`d_t = ${state.dt.toFixed(2)}`);
      }

      // Legend — placed below the x-axis label (outside the plot region)
      // so it never overlaps the true τ(d) curve.
      g.selectAll(".sim-legend").remove();
      const legendY = h + 56;
      const lg = g.append("g").attr("class", "sim-legend").attr("transform", `translate(0,${legendY})`);
      lg.append("rect").attr("width", w).attr("height", 38).attr("fill", "rgba(15,23,41,0.5)").attr("stroke", C.line).attr("rx", 6);
      lg.append("line").attr("x1", 12).attr("x2", 32).attr("y1", 14).attr("y2", 14).attr("stroke", C.teal).attr("stroke-width", 3);
      lg.append("text").attr("x", 40).attr("y", 18).attr("fill", C.text).attr("font-size", 11).text("True τ(d)");
      lg.append("rect").attr("x", 130).attr("y", 10).attr("width", 20).attr("height", 4).attr("fill", C.orange);
      lg.append("text").attr("x", 158).attr("y", 18).attr("fill", C.text).attr("font-size", 11).text(`τ̂ = ${state.tauhat.toFixed(3)}`);
      lg.append("rect").attr("x", 12).attr("y", 26).attr("width", 20).attr("height", 8).attr("fill", C.teal).attr("opacity", 0.18);
      lg.append("text").attr("x", 40).attr("y", 33).attr("fill", C.text).attr("font-size", 11).text(`truth-avg in [0, d̄] = ${state.truth_avg.toFixed(3)}`);
      lg.append("line").attr("x1", 290).attr("x2", 310).attr("y1", 14).attr("y2", 14).attr("stroke", C.orange).attr("stroke-width", 2);
      lg.append("text").attr("x", 318).attr("y", 18).attr("fill", C.text).attr("font-size", 11).text("d̄ (your cutoff)");
      lg.append("line").attr("x1", 290).attr("x2", 310).attr("y1", 30).attr("y2", 30).attr("stroke", C.steel).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
      lg.append("text").attr("x", 318).attr("y", 33).attr("fill", C.text).attr("font-size", 11).text("d_t (true radius)");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Histogram of τ̂ across many sims (Tab 3 "Run 100").
  //   data: { taus, truth, cut, dt }
  // ------------------------------------------------------------------
  function tauhat_histogram(container) {
    const W = 720, H = 240;
    const margin = { top: 18, right: 24, bottom: 38, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      if (!data.taus || data.taus.length === 0) return;
      const all = data.taus.concat([data.truth]);
      const ext = d3.extent(all);
      const span = Math.max(0.3, ext[1] - ext[0]);
      const pad = span * 0.1;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const nBins = 22;
      const bin = d3.bin().domain(x.domain()).thresholds(nBins);
      const bins = bin(data.taus);
      const maxC = d3.max(bins, d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      g.selectAll(null).data(bins).enter().append("rect")
        .attr("x", d => x(d.x0))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length))
        .attr("fill", C.orange).attr("opacity", 0.78);

      // Truth line
      g.append("line").attr("x1", x(data.truth)).attr("x2", x(data.truth))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.teal).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.truth) + 4).attr("y", 12)
        .attr("fill", C.teal).attr("font-size", 11)
        .text(`truth = ${data.truth.toFixed(2)}`);

      // Mean line
      const mean = d3.mean(data.taus);
      g.append("line").attr("x1", x(mean)).attr("x2", x(mean))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.orange).attr("stroke-width", 2).attr("stroke-dasharray", "3 3");
      g.append("text").attr("x", x(mean) + 4).attr("y", 26)
        .attr("fill", C.orange).attr("font-size", 11)
        .text(`mean τ̂ = ${mean.toFixed(2)}`);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated τ̂ across 100 simulated datasets");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Forest plot (Tab 4): 6 estimates on a single outcome.
  //   data.estimates: rows with { method, estimate, se, ci_lo, ci_hi, att_pct }
  // ------------------------------------------------------------------
  function forest_plot(container) {
    const W = 880;
    const margin = { top: 28, right: 100, bottom: 40, left: 280 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 360`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    const colorMap = {
      "Parametric (cut = 0.05 mi)":   C.steel,
      "Parametric (cut = 0.10 mi)":   C.orange,
      "Parametric (cut = 0.15 mi)":   "#66e5de",
      "Nonparametric bin 1 (~300 ft)": C.teal,
      "Nonparametric bin 2 (~400 ft)": "#9bd9d3",
      "Nonparametric ATT (sample-wt., inside 0.1 mi)": "#f5b78a",
    };

    function update(estimates, activeMethods) {
      const subset = estimates.filter(d => activeMethods.includes(d.method));
      const facetH = 36 * subset.length + 24;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.fp").remove();
      const g = svg.append("g").attr("class", "fp")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const facetW = W - margin.left - margin.right;
      const cis = subset.flatMap(d => [d.ci_lo, d.ci_hi]).concat([0]);
      const ext = d3.extent(cis);
      const pad = Math.max(0.05, (ext[1] - ext[0]) * 0.10);
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, facetW]);
      const y = d3.scaleBand().domain(subset.map(d => d.method)).range([0, facetH]).padding(0.35);

      // Zero line
      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", facetH)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      // Axes
      g.append("g").attr("transform", `translate(0,${facetH})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${facetW / 2},${facetH + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("ATT (log points on price)");

      // Method labels + bars
      subset.forEach(d => {
        const yc = y(d.method) + y.bandwidth() / 2;
        svg.append("text").attr("class", "fp")
          .attr("x", margin.left - 12).attr("y", margin.top + yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12).text(d.method);

        const row = g.append("g").attr("class", "fp-row").style("cursor", "pointer");
        row.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc)
          .attr("stroke", colorMap[d.method] || C.text).attr("stroke-width", 2);
        row.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
          .attr("y1", yc - 5).attr("y2", yc + 5)
          .attr("stroke", colorMap[d.method] || C.text).attr("stroke-width", 2);
        row.append("line").attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
          .attr("y1", yc - 5).attr("y2", yc + 5)
          .attr("stroke", colorMap[d.method] || C.text).attr("stroke-width", 2);
        row.append("circle").attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 6)
          .attr("fill", colorMap[d.method] || C.text)
          .attr("stroke", "#fff").attr("stroke-width", 1);

        // ATT % annotation on the right
        g.append("text").attr("x", facetW + 8).attr("y", yc + 4)
          .attr("fill", colorMap[d.method] || C.text).attr("font-size", 12).attr("font-weight", 600)
          .text(`${d.att_pct.toFixed(1)} %`);

        row.on("mousemove", function (ev) {
          const rect = container.getBoundingClientRect();
          tooltip.html(
            `<div><strong style="color:${colorMap[d.method]}">${d.method}</strong></div>` +
            `<div><span class='tooltip-key'>ATT (log) =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>ATT % =</span> <span class='tooltip-val'>${d.att_pct.toFixed(2)} %</span></div>` +
            `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>`
          ).classed("show", true)
          .style("left", (ev.clientX - rect.left + 12) + "px")
          .style("top",  (ev.clientY - rect.top  + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Nonparametric step curve (Tab 4): 23 bins from binsreg, with CI ribbon.
  //   data.rings_lr_curve: rows with { bin, x_lo, x_hi, tau, ci_lo, ci_hi }
  // ------------------------------------------------------------------
  function binsreg_step(container) {
    const W = 880, H = 360;
    const margin = { top: 30, right: 28, bottom: 50, left: 64 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(bins) {
      g.selectAll("*").remove();
      const x = d3.scaleLinear().domain([0, 0.31]).range([0, w]);
      const all = bins.flatMap(b => [b.ci_lo, b.ci_hi]).filter(Number.isFinite);
      const ext = d3.extent(all);
      const yLo = Math.min(-0.4, ext[0] * 1.05);
      const yHi = Math.max(0.2, ext[1] * 1.05);
      const y = d3.scaleLinear().domain([yLo, yHi]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Distance d (miles)");
      g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-46})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated τ̂(d) (log points)");

      // Zero line
      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      // 0.1 mi marker
      g.append("line").attr("x1", x(0.1)).attr("x2", x(0.1)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.orange).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", x(0.1) + 4).attr("y", 14)
        .attr("fill", C.orange).attr("font-size", 11)
        .text("d̄ = 0.1 mi (canonical)");

      // 0.094 mi crossing
      g.append("line").attr("x1", x(0.094)).attr("x2", x(0.094)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.teal).attr("stroke-width", 1).attr("stroke-dasharray", "2 4");
      g.append("text").attr("x", x(0.094) - 4).attr("y", h - 6).attr("text-anchor", "end")
        .attr("fill", C.teal).attr("font-size", 11)
        .text("zero crossing ≈ 0.094 mi");

      // CI ribbon (per-bin rectangles)
      bins.forEach(b => {
        if (!Number.isFinite(b.ci_lo) || !Number.isFinite(b.ci_hi)) return;
        g.append("rect")
          .attr("x", x(b.x_lo))
          .attr("y", y(b.ci_hi))
          .attr("width", x(b.x_hi) - x(b.x_lo))
          .attr("height", Math.max(1, y(b.ci_lo) - y(b.ci_hi)))
          .attr("fill", C.steel).attr("opacity", 0.18);
      });

      // Step segments (one horizontal segment per bin)
      bins.forEach(b => {
        if (!Number.isFinite(b.tau)) return;
        g.append("line")
          .attr("x1", x(b.x_lo)).attr("x2", x(b.x_hi))
          .attr("y1", y(b.tau)).attr("y2", y(b.tau))
          .attr("stroke", b.bin <= 2 ? C.orange : C.steel)
          .attr("stroke-width", b.bin <= 2 ? 3.5 : 2);
      });

      // Highlight bin 1 + bin 2 with labels
      const b1 = bins[0], b2 = bins[1];
      if (b1) {
        g.append("text").attr("x", x((b1.x_lo + b1.x_hi) / 2)).attr("y", y(b1.tau) - 8)
          .attr("text-anchor", "middle").attr("fill", C.orange).attr("font-size", 11).attr("font-weight", 600)
          .text(`bin 1: ${(b1.tau * 100).toFixed(1)} %`);
      }
      if (b2) {
        g.append("text").attr("x", x((b2.x_lo + b2.x_hi) / 2)).attr("y", y(b2.tau) - 8)
          .attr("text-anchor", "middle").attr("fill", C.orange).attr("font-size", 11).attr("font-weight", 600)
          .text(`bin 2: ${(b2.tau * 100).toFixed(1)} %`);
      }
    }
    return { update };
  }

  window.CHARTS = {
    three_numbers_bars,
    ringchoice_curve,
    simulator_curve,
    tauhat_histogram,
    forest_plot,
    binsreg_step,
    C,
  };
})();
