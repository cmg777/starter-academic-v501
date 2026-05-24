// charts.js — D3 chart builders for the Convergence v2 web app.
//
// Custom widgets:
//   - mean_reversion_animation: Tab 1 concept animation (divergence -> convergence flip)
//   - beta_trend_chart: Tab 2 (rolling beta with CI band)
//   - sigma_quartile_chart: Tab 2 small-multiples (sigma + quartile growth)
//   - ovb_simulator_chart: Tab 3 (delta x lambda decomposition bars)
//   - forest_plot: Tab 4 (CIs for beta-by-decade and OVB rows)
//   - correlate_bars: Tab 4 (correlate convergence bars)

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
  // Tab 1: Mean-reversion animation.
  //   Animates two narratives at once:
  //   (a) the rolling beta crossing zero around 2000 (line + dot),
  //   (b) two countries — poor & rich — whose growth gap flips sign.
  // ------------------------------------------------------------------
  function mean_reversion_animation(container) {
    const W = 720, H = 340;
    const margin = { top: 28, right: 28, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Synthetic but matched-to-post beta trajectory.
    const years = d3.range(1960, 2009);
    const truth = years.map(y => {
      // Smoothed approximation of the rolling beta from the post.
      const t = (y - 1960) / (2008 - 1960);
      // Logistic-ish curve from +0.5 to -0.8.
      return 0.50 - 1.30 / (1 + Math.exp(-9 * (t - 0.62)));
    });

    const x = d3.scaleLinear().domain([1960, 2008]).range([0, w]);
    const y = d3.scaleLinear().domain([-1.0, 0.7]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(6))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Year");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Beta-convergence coefficient");

    // Zero line.
    g.append("line").attr("x1", 0).attr("x2", w)
      .attr("y1", y(0)).attr("y2", y(0))
      .attr("stroke", C.orange).attr("stroke-dasharray", "4 4").attr("stroke-width", 1.5);
    g.append("text")
      .attr("x", w - 4).attr("y", y(0) - 6)
      .attr("text-anchor", "end")
      .attr("fill", C.orange).attr("font-size", 11)
      .text("β = 0 (no catch-up)");

    // Static line (full trajectory, faint).
    const line = d3.line().x((_, i) => x(years[i])).y(v => y(v)).curve(d3.curveMonotoneX);
    g.append("path")
      .attr("d", line(truth))
      .attr("fill", "none")
      .attr("stroke", C.faint)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 4");

    // Animated overlay (drawn left-to-right).
    const animPath = g.append("path")
      .attr("fill", "none")
      .attr("stroke", C.steel)
      .attr("stroke-width", 2.8);

    const dot = g.append("circle").attr("r", 7).attr("fill", C.teal);
    const dotLabel = g.append("text")
      .attr("fill", C.teal).attr("font-size", 12).attr("font-weight", 600)
      .attr("text-anchor", "middle");

    // Legend (bottom-left corner of the plot area, where the line stays
    // far above zero throughout the divergence era — no overlap with the
    // rolling-β trajectory).
    const lgW = 270, lgH = 50;
    const lg = g.append("g").attr("transform", `translate(${4},${h - lgH - 6})`);
    lg.append("rect").attr("width", lgW).attr("height", lgH).attr("fill", "rgba(15,23,41,0.78)").attr("stroke", C.line).attr("rx", 6);
    lg.append("circle").attr("cx", 14).attr("cy", 15).attr("r", 5).attr("fill", C.steel);
    lg.append("text").attr("x", 26).attr("y", 19).attr("fill", C.text).attr("font-size", 12).text("Rolling β (divergence → convergence)");
    lg.append("circle").attr("cx", 14).attr("cy", 35).attr("r", 5).attr("fill", C.orange);
    lg.append("text").attr("x", 26).attr("y", 39).attr("fill", C.text).attr("font-size", 12).text("β = 0 reference");

    // Animation loop.
    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      const period = 7.0;
      const cycle = (elapsed % period) / period; // 0 → 1
      const k = Math.max(1, Math.floor(cycle * years.length));
      const partial = truth.slice(0, k);
      animPath.attr("d", line(partial));
      const yr = years[k - 1];
      const v  = truth[k - 1];
      dot.attr("cx", x(yr)).attr("cy", y(v));
      // Anchor the label below the dot when it's high in the chart so it
      // never collides with the title row; above the dot otherwise.
      const labelDy = v > 0.25 ? 20 : -12;
      dotLabel.attr("x", x(yr)).attr("y", y(v) + labelDy).text(`${yr}: β = ${v.toFixed(2)}`);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Tab 2: Beta-trend chart (with CI band + zero line + cursor).
  //   data = [{ year, beta, ci_lo, ci_hi }, ...]
  // ------------------------------------------------------------------
  function beta_trend_chart(container) {
    const W = 720, H = 340;
    const margin = { top: 24, right: 28, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");
    const band   = g.append("path").attr("fill", "rgba(106,155,204,0.20)");
    const trend  = g.append("path").attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2.4);
    const zeroLn = g.append("line").attr("stroke", C.orange).attr("stroke-dasharray", "4 4").attr("stroke-width", 1.4);
    const cursor = g.append("line").attr("stroke", C.teal).attr("stroke-dasharray", "3 3").attr("stroke-width", 1.5).style("display", "none");
    const dot    = g.append("circle").attr("r", 5).attr("fill", C.teal).style("display", "none");
    const dotLab = g.append("text").attr("fill", C.teal).attr("font-size", 12).attr("font-weight", 600).attr("text-anchor", "middle").style("display", "none");

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Year");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("β̂ for 10-year forward growth");

    function update(data, year) {
      const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, w]);
      const yMin = d3.min(data, d => d.ci_lower);
      const yMax = d3.max(data, d => d.ci_upper);
      const yScale = d3.scaleLinear().domain([yMin - 0.05, yMax + 0.05]).range([h, 0]);

      xAxisG.call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(yScale).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      const area = d3.area()
        .x(d => x(d.year))
        .y0(d => yScale(d.ci_lower))
        .y1(d => yScale(d.ci_upper))
        .curve(d3.curveMonotoneX);
      band.attr("d", area(data));

      const line = d3.line().x(d => x(d.year)).y(d => yScale(d.beta)).curve(d3.curveMonotoneX);
      trend.attr("d", line(data));

      zeroLn.attr("x1", 0).attr("x2", w).attr("y1", yScale(0)).attr("y2", yScale(0));

      // Find row nearest to year.
      let best = data[0], bestDiff = Infinity;
      for (const d of data) {
        const diff = Math.abs(d.year - year);
        if (diff < bestDiff) { bestDiff = diff; best = d; }
      }
      cursor.style("display", null).attr("x1", x(best.year)).attr("x2", x(best.year))
        .attr("y1", 0).attr("y2", h);
      dot.style("display", null).attr("cx", x(best.year)).attr("cy", yScale(best.beta));
      dotLab.style("display", null)
        .attr("x", x(best.year)).attr("y", yScale(best.beta) - 12)
        .text(`${best.year}: β = ${best.beta.toFixed(3)}`);
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 2: Sigma chart (single line).
  //   data = [{ year, sigma }, ...]
  // ------------------------------------------------------------------
  function sigma_chart(container) {
    const W = 720, H = 280;
    const margin = { top: 24, right: 28, bottom: 40, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, w]);
      const yMin = d3.min(data, d => d.sigma);
      const yMax = d3.max(data, d => d.sigma);
      const yScale = d3.scaleLinear().domain([yMin - 0.03, yMax + 0.03]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(yScale).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("Year");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("σ — SD of log GDP per capita");

      const line = d3.line().x(d => x(d.year)).y(d => yScale(d.sigma)).curve(d3.curveMonotoneX);
      g.append("path").attr("d", line(data)).attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 2.4);

      // Peak marker (2000).
      const peak = data.reduce((a, b) => b.sigma > a.sigma ? b : a, data[0]);
      g.append("circle").attr("cx", x(peak.year)).attr("cy", yScale(peak.sigma))
        .attr("r", 5).attr("fill", C.orange).attr("stroke", "#fff").attr("stroke-width", 1.5);
      g.append("text").attr("x", x(peak.year)).attr("y", yScale(peak.sigma) - 12)
        .attr("text-anchor", "middle").attr("fill", C.orange).attr("font-size", 11).attr("font-weight", 600)
        .text(`peak σ = ${peak.sigma.toFixed(2)} (${peak.year})`);
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 2: Quartile growth chart (four lines).
  //   data = [{ year, q1, q2, q3, q4 }, ...]
  // ------------------------------------------------------------------
  function quartile_chart(container) {
    const W = 720, H = 320;
    const margin = { top: 24, right: 110, bottom: 40, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, w]);
      const all = data.flatMap(d => [d.q1, d.q2, d.q3, d.q4]);
      const yScale = d3.scaleLinear().domain([d3.min(all) - 0.3, d3.max(all) + 0.3]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(yScale).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("Year");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("10-year growth (% per year)");

      const series = [
        { key: "q1", color: C.orange,        label: "Q1 (Poorest)" },
        { key: "q2", color: "#f0c860",       label: "Q2"           },
        { key: "q3", color: "#92c333",       label: "Q3"           },
        { key: "q4", color: C.steel,         label: "Q4 (Richest)" },
      ];
      series.forEach(s => {
        const line = d3.line().x(d => x(d.year)).y(d => yScale(d[s.key])).curve(d3.curveMonotoneX);
        g.append("path").attr("d", line(data)).attr("fill", "none").attr("stroke", s.color).attr("stroke-width", 2.2);
      });
      // Legend.
      const lg = g.append("g").attr("transform", `translate(${w + 12},0)`);
      series.forEach((s, i) => {
        lg.append("circle").attr("cx", 6).attr("cy", 6 + i * 20).attr("r", 5).attr("fill", s.color);
        lg.append("text").attr("x", 16).attr("y", 10 + i * 20).attr("fill", C.text).attr("font-size", 11).text(s.label);
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 3: OVB decomposition bars.
  //   data = { delta: x, lambda: y, beta_uncond: z, beta_cond: w }
  //   Visualises the identity gap = delta * lambda.
  // ------------------------------------------------------------------
  function ovb_bars(container) {
    const W = 720, H = 260;
    const margin = { top: 28, right: 60, bottom: 36, left: 200 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const rows = [
        { name: "δ × λ (predicted gap)",   v: data.delta * data.lambda,         color: C.teal,   bold: true },
        { name: "δ (corr.-income slope)",  v: data.delta,                       color: C.steel,  bold: false },
        { name: "λ (growth slope)",        v: data.lambda,                      color: C.orange, bold: false },
      ];
      const ext = d3.extent(rows.map(r => r.v).concat([0]));
      const span = Math.max(0.8, ext[1] - ext[0]);
      const pad = span * 0.15;
      const x = d3.scaleLinear().domain([Math.min(0, ext[0] - pad), ext[1] + pad]).range([0, w]);
      const y = d3.scaleBand().domain(rows.map(r => r.name)).range([0, h]).padding(0.35);

      g.append("line").attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      rows.forEach(r => {
        const yc = y(r.name) + y.bandwidth() / 2;
        g.append("text").attr("x", -10).attr("y", yc + 4)
          .attr("text-anchor", "end").attr("fill", r.bold ? C.teal : C.text)
          .attr("font-size", 12).attr("font-weight", r.bold ? 700 : 500)
          .text(r.name);
        const x0 = x(0), x1 = x(r.v);
        g.append("rect")
          .attr("x", Math.min(x0, x1))
          .attr("y", yc - y.bandwidth() * 0.32)
          .attr("width", Math.abs(x1 - x0))
          .attr("height", y.bandwidth() * 0.64)
          .attr("fill", r.color).attr("opacity", 0.88);
        g.append("text").attr("x", x1 + (x1 >= x0 ? 6 : -6))
          .attr("text-anchor", x1 >= x0 ? "start" : "end").attr("y", yc + 4)
          .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
          .text(r.v.toFixed(3));
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 3: Beta vs. beta-star comparison (small chart).
  //   data = { beta_uncond, beta_cond, alpha_true (=0 reference) }
  // ------------------------------------------------------------------
  function beta_compare(container) {
    const W = 720, H = 180;
    const margin = { top: 22, right: 60, bottom: 32, left: 160 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const rows = [
        { name: "β  (unconditional)", v: data.beta_uncond, color: C.orange },
        { name: "β* (conditional)",   v: data.beta_cond,   color: C.teal },
      ];
      const ext = d3.extent(rows.map(r => r.v).concat([0]));
      const span = Math.max(0.5, ext[1] - ext[0]);
      const pad = span * 0.15;
      const x = d3.scaleLinear().domain([Math.min(0, ext[0] - pad), Math.max(0.1, ext[1] + pad)]).range([0, w]);
      const y = d3.scaleBand().domain(rows.map(r => r.name)).range([0, h]).padding(0.4);

      g.append("line").attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      rows.forEach(r => {
        const yc = y(r.name) + y.bandwidth() / 2;
        g.append("text").attr("x", -10).attr("y", yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12).text(r.name);
        const x0 = x(0), x1 = x(r.v);
        g.append("rect")
          .attr("x", Math.min(x0, x1)).attr("y", yc - y.bandwidth() * 0.32)
          .attr("width", Math.abs(x1 - x0)).attr("height", y.bandwidth() * 0.64)
          .attr("fill", r.color).attr("opacity", 0.88);
        g.append("text").attr("x", x1 + (x1 >= x0 ? 6 : -6))
          .attr("text-anchor", x1 >= x0 ? "start" : "end").attr("y", yc + 4)
          .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
          .text(r.v.toFixed(3));
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 3: Simulation histograms for many draws of (delta, lambda).
  //   data = { gaps: number[], targetGap: number }
  // ------------------------------------------------------------------
  function gap_histogram(container) {
    const W = 720, H = 240;
    const margin = { top: 22, right: 28, bottom: 36, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      if (!data.gaps || data.gaps.length === 0) return;
      const ext = d3.extent(data.gaps);
      const span = Math.max(0.3, ext[1] - ext[0]);
      const pad = span * 0.06;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const bin = d3.bin().domain(x.domain()).thresholds(24);
      const bins = bin(data.gaps);
      const maxCount = d3.max(bins, d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxCount]).range([h, 0]);

      g.selectAll(null).data(bins).enter().append("rect")
        .attr("x", d => x(d.x0))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length))
        .attr("fill", C.teal).attr("opacity", 0.78);

      if (data.targetGap !== undefined) {
        g.append("line").attr("x1", x(data.targetGap)).attr("x2", x(data.targetGap))
          .attr("y1", 0).attr("y2", h).attr("stroke", C.orange).attr("stroke-width", 2);
        g.append("text").attr("x", x(data.targetGap) + 4).attr("y", 12)
          .attr("fill", C.orange).attr("font-size", 11)
          .text(`paper's gap = ${data.targetGap.toFixed(2)}`);
      }
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 30})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Simulated δ × λ across 100 random parameter draws");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 4: Forest plot — adapted from r_double_lasso, but the data
  //   are convergence rows (decade β with CI).
  // ------------------------------------------------------------------
  function forest_plot(container) {
    // Wider canvas so each facet can carry its own row labels (methods
    // differ per facet in this app — e.g. decades for β, Polity2 years
    // for OVB — so a single leftmost label column would mis-align).
    const W = 1180;
    const margin = { top: 28, right: 24, bottom: 36, left: 24 };
    const facetGap = 16;
    const labelGutter = 110; // px of label space at the left of each facet
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 380`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function colorFor(method) {
      if (method.includes("1960") || method.includes("1970") || method.includes("1980")) return C.orange;
      if (method.includes("1990")) return "#f0c860";
      if (method.includes("2000") || method.includes("2005") || method.includes("2007") || method.includes("2008")) return C.teal;
      if (method.includes("lambda")) return C.orange;
      if (method.includes("delta")) return C.steel;
      return C.muted;
    }

    function update(data, activeMethods, activeOutcomes) {
      const allMethods = Array.from(new Set(data.map(d => d.method)));
      const allOutcomes = Array.from(new Set(data.map(d => d.outcome)));
      const outcomes = activeOutcomes.length ? activeOutcomes : allOutcomes;
      const methods  = activeMethods.length  ? activeMethods  : allMethods;
      const rows = data.filter(d => outcomes.includes(d.outcome) && methods.includes(d.method));

      const nFacets = outcomes.length;
      const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / nFacets;

      // Per-facet method list (only methods present in that facet).
      const perFacetMethods = outcomes.map(o => methods.filter(m => rows.some(r => r.outcome === o && r.method === m)));
      const facetH = 28 * Math.max(1, d3.max(perFacetMethods, lst => lst.length) || 1) + 24;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet").remove();

      outcomes.forEach((outcome, oi) => {
        const subset = rows.filter(d => d.outcome === outcome);
        const facetMethods = perFacetMethods[oi];
        if (facetMethods.length === 0) return;

        const facet = svg.append("g")
          .attr("class", "facet")
          .attr("transform", `translate(${margin.left + oi * (facetW + facetGap)},${margin.top})`);

        // Plot area sits to the right of this facet's own label gutter.
        const plotW = Math.max(40, facetW - labelGutter);
        const ext = d3.extent(subset.flatMap(d => [d.ci_lo, d.ci_hi]));
        const xMin = Math.min(0, ext[0] || 0);
        const xMax = Math.max(0, ext[1] || 0);
        const pad = Math.max(0.1, (xMax - xMin) * 0.08);
        const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([labelGutter, facetW]);
        const y = d3.scaleBand().domain(facetMethods).range([0, facetH]).padding(0.35);

        // Title — centred over the plot area, not the whole facet.
        facet.append("text").attr("x", labelGutter + plotW / 2).attr("y", -10)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13)
          .attr("font-weight", 600).text(outcome);

        // Zero line.
        facet.append("line")
          .attr("x1", x(0)).attr("x2", x(0))
          .attr("y1", 0).attr("y2", facetH)
          .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 4");

        // x axis (covers only the plot area, not the gutter).
        facet.append("g").attr("transform", `translate(0,${facetH})`)
          .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".2f")))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

        // Per-facet row labels in the gutter — methods differ across facets
        // (decade IDs for β, Polity2 years for OVB/λ/δ, correlate names for
        // the correlate-convergence facet), so a single leftmost column would
        // mis-align rows in non-leftmost facets.
        facetMethods.forEach(m => {
          facet.append("text")
            .attr("x", labelGutter - 8)
            .attr("y", y(m) + y.bandwidth() / 2 + 4)
            .attr("text-anchor", "end")
            .attr("fill", C.text).attr("font-size", 11)
            .text(m);
        });

        subset.forEach(d => {
          const yc = y(d.method) + y.bandwidth() / 2;
          const c = colorFor(d.method);
          const grp = facet.append("g").attr("class", "row").style("cursor", "pointer");
          grp.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
            .attr("y1", yc).attr("y2", yc)
            .attr("stroke", c).attr("stroke-width", 2);
          grp.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
            .attr("y1", yc - 4).attr("y2", yc + 4)
            .attr("stroke", c).attr("stroke-width", 2);
          grp.append("line")
            .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
            .attr("y1", yc - 4).attr("y2", yc + 4)
            .attr("stroke", c).attr("stroke-width", 2);
          grp.append("circle")
            .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
            .attr("fill", c).attr("stroke", "#fff").attr("stroke-width", 1);

          grp.on("mousemove", function (ev) {
            const rect = container.getBoundingClientRect();
            tooltip.html(
              `<div><strong style="color:${c}">${d.method}</strong></div>` +
              `<div><span class='tooltip-key'>estimate =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>` +
              `<div><span class='tooltip-key'>N =</span> <span class='tooltip-val'>${d.n_selected === null ? "—" : d.n_selected}</span></div>`
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
  // Tab 4: Conditional-convergence twin lines.
  //   data = [{ year, beta_uncond, beta_cond }, ...]
  // ------------------------------------------------------------------
  function convergence_twin(container) {
    const W = 720, H = 280;
    const margin = { top: 24, right: 110, bottom: 36, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, w]);
      const all = data.flatMap(d => [d.beta_uncond, d.beta_cond]);
      const yScale = d3.scaleLinear().domain([d3.min(all) - 0.1, d3.max(all) + 0.1]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(yScale).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 30})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("Year");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("β coefficient (10-yr growth)");

      g.append("line").attr("x1", 0).attr("x2", w)
        .attr("y1", yScale(0)).attr("y2", yScale(0))
        .attr("stroke", C.orange).attr("stroke-dasharray", "3 4");

      const lUn = d3.line().x(d => x(d.year)).y(d => yScale(d.beta_uncond)).curve(d3.curveMonotoneX);
      const lCo = d3.line().x(d => x(d.year)).y(d => yScale(d.beta_cond)).curve(d3.curveMonotoneX);
      g.append("path").attr("d", lUn(data)).attr("fill", "none").attr("stroke", C.text).attr("stroke-width", 2.5);
      g.append("path").attr("d", lCo(data)).attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2.5);

      // Legend.
      const lg = g.append("g").attr("transform", `translate(${w + 12},10)`);
      lg.append("circle").attr("cx", 6).attr("cy", 6).attr("r", 5).attr("fill", C.text);
      lg.append("text").attr("x", 16).attr("y", 10).attr("fill", C.text).attr("font-size", 11).text("β (abs.)");
      lg.append("circle").attr("cx", 6).attr("cy", 26).attr("r", 5).attr("fill", C.steel);
      lg.append("text").attr("x", 16).attr("y", 30).attr("fill", C.text).attr("font-size", 11).text("β* (cond.)");
    }
    return { update };
  }

  window.CHARTS = {
    mean_reversion_animation,
    beta_trend_chart,
    sigma_chart,
    quartile_chart,
    ovb_bars,
    beta_compare,
    gap_histogram,
    forest_plot,
    convergence_twin,
    C,
  };
})();
