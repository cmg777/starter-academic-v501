// charts.js — D3 chart builders for the PCA web app.
//
// Each builder takes a DOM container and returns an object with an
// `update(...)` method so subsequent slider changes can patch the
// existing chart instead of recreating it.

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
  // Tab 1: PCA rotation animation.
  //   A scatter cloud with strong positive correlation. A candidate
  //   direction sweeps around the origin. We project each point onto
  //   it and visualise (a) the orange candidate arrow, (b) a steel-blue
  //   vertical gauge showing variance along that direction, (c) the
  //   teal PC2 perpendicular when the orange aligns with PC1.
  // ------------------------------------------------------------------
  function pca_rotation_animation(container) {
    const W = 720, H = 360;
    const margin = { top: 24, right: 200, bottom: 44, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Generate a fixed correlated cloud (z-scored, r ≈ 0.96).
    const n = 80;
    const rng = mulberry32(7);
    const normal = makeNormal(rng);
    const z1 = new Float64Array(n);
    const z2 = new Float64Array(n);
    const r = 0.96;
    const c2 = Math.sqrt(1 - r * r);
    for (let i = 0; i < n; i++) {
      const a = normal();
      const b = normal();
      z1[i] = a;
      z2[i] = r * a + c2 * b;
    }
    // Re-standardise so r exact and variances exactly 1.
    let m1 = 0, m2 = 0;
    for (let i = 0; i < n; i++) { m1 += z1[i]; m2 += z2[i]; }
    m1 /= n; m2 /= n;
    let s1 = 0, s2 = 0;
    for (let i = 0; i < n; i++) { s1 += (z1[i]-m1)**2; s2 += (z2[i]-m2)**2; }
    s1 = Math.sqrt(s1 / n); s2 = Math.sqrt(s2 / n);
    for (let i = 0; i < n; i++) { z1[i] = (z1[i]-m1)/s1; z2[i] = (z2[i]-m2)/s2; }

    const x = d3.scaleLinear().domain([-3, 3]).range([0, w]);
    const y = d3.scaleLinear().domain([-3, 3]).range([h, 0]);

    // Axes
    g.append("g").attr("transform", `translate(0,${h/2})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(0))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").attr("transform", `translate(${w/2},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(0))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain").attr("stroke", C.muted).attr("stroke-opacity", 0.4);

    // Cross-hair
    g.append("line").attr("x1", 0).attr("x2", w).attr("y1", h/2).attr("y2", h/2)
      .attr("stroke", C.grid);
    g.append("line").attr("x1", w/2).attr("x2", w/2).attr("y1", 0).attr("y2", h)
      .attr("stroke", C.grid);

    g.append("text").attr("x", w).attr("y", h/2 - 6).attr("fill", C.muted)
      .attr("font-size", 11).attr("text-anchor", "end").text("z₁ (Life expectancy)");
    g.append("text").attr("x", w/2 + 6).attr("y", 12).attr("fill", C.muted)
      .attr("font-size", 11).text("z₂ (Infant survival)");

    // Scatter points
    g.selectAll("circle.country").data(d3.range(n)).enter()
      .append("circle").attr("class", "country")
      .attr("cx", i => x(z1[i])).attr("cy", i => y(z2[i]))
      .attr("r", 3).attr("fill", C.steel).attr("opacity", 0.7);

    // Projected points (will sit on the candidate axis)
    g.selectAll("circle.proj").data(d3.range(n)).enter()
      .append("circle").attr("class", "proj")
      .attr("r", 2).attr("fill", C.orange).attr("opacity", 0.5);

    // Candidate-direction arrow
    const armLen = 2.3;
    const armOrange = g.append("line").attr("stroke", C.orange).attr("stroke-width", 2.5)
      .attr("marker-end", "url(#arrow-orange)");
    const armOrangeBack = g.append("line").attr("stroke", C.orange).attr("stroke-width", 2.5)
      .attr("stroke-opacity", 0.35);
    const armTeal = g.append("line").attr("stroke", C.teal).attr("stroke-width", 1.8)
      .attr("stroke-dasharray", "4 3").attr("opacity", 0);

    // Arrowhead markers
    const defs = svg.append("defs");
    defs.append("marker").attr("id", "arrow-orange").attr("viewBox", "0 0 10 10")
      .attr("refX", 8).attr("refY", 5).attr("markerWidth", 7).attr("markerHeight", 7)
      .attr("orient", "auto-start-reverse")
      .append("path").attr("d", "M0,0 L10,5 L0,10 Z").attr("fill", C.orange);

    // Gauge on the right
    const gaugeX = w + 30;
    const gaugeW = 24;
    const gaugeH = h;
    g.append("rect").attr("x", gaugeX).attr("y", 0).attr("width", gaugeW).attr("height", gaugeH)
      .attr("fill", "rgba(232, 236, 242, 0.06)").attr("rx", 4);
    const gaugeFill = g.append("rect").attr("x", gaugeX).attr("width", gaugeW)
      .attr("fill", C.teal).attr("rx", 4);
    g.append("text").attr("x", gaugeX + gaugeW + 8).attr("y", 12).attr("fill", C.text)
      .attr("font-size", 11).text("variance");
    g.append("text").attr("x", gaugeX + gaugeW + 8).attr("y", 25).attr("fill", C.muted)
      .attr("font-size", 11).text("along arrow");
    const gaugeText = g.append("text").attr("x", gaugeX + gaugeW + 8).attr("y", gaugeH - 6)
      .attr("fill", C.teal).attr("font-size", 13).attr("font-weight", 600);
    const gaugePctText = g.append("text").attr("x", gaugeX + gaugeW + 8).attr("y", gaugeH - 22)
      .attr("fill", C.orange).attr("font-size", 13).attr("font-weight", 600);
    g.append("text").attr("x", gaugeX + gaugeW + 8).attr("y", gaugeH - 36).attr("fill", C.muted)
      .attr("font-size", 10).text("% of total");

    g.append("text").attr("x", gaugeX + gaugeW + 8).attr("y", gaugeH/2)
      .attr("fill", C.muted).attr("font-size", 10).text("max ≈ 2.0");

    // Legend
    const lg = g.append("g").attr("transform", `translate(8, ${h - 56})`);
    lg.append("rect").attr("width", 200).attr("height", 50)
      .attr("fill", "rgba(15,23,41,0.65)").attr("stroke", C.line).attr("rx", 6);
    lg.append("circle").attr("cx", 14).attr("cy", 15).attr("r", 4).attr("fill", C.steel);
    lg.append("text").attr("x", 26).attr("y", 19).attr("fill", C.text).attr("font-size", 11)
      .text("Country (z-scored)");
    lg.append("line").attr("x1", 8).attr("x2", 24).attr("y1", 35).attr("y2", 35)
      .attr("stroke", C.orange).attr("stroke-width", 2.5);
    lg.append("text").attr("x", 30).attr("y", 39).attr("fill", C.text).attr("font-size", 11)
      .text("Candidate direction (PC1 search)");

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      // Sweep slowly, pausing near the peak.
      const phase = (elapsed * 0.35) % (2 * Math.PI);
      const theta = phase; // angle of candidate direction
      const u1 = Math.cos(theta);
      const u2 = Math.sin(theta);

      // variance projected: (1/n) * sum (z1*u1 + z2*u2)^2.
      let v = 0;
      for (let i = 0; i < n; i++) {
        const p = z1[i] * u1 + z2[i] * u2;
        v += p * p;
      }
      v /= n;

      // Update arrow.
      armOrange.attr("x1", x(0)).attr("y1", y(0))
        .attr("x2", x(armLen * u1)).attr("y2", y(armLen * u2));
      armOrangeBack.attr("x1", x(0)).attr("y1", y(0))
        .attr("x2", x(-armLen * u1)).attr("y2", y(-armLen * u2));

      // Update projected points.
      g.selectAll("circle.proj").data(d3.range(n))
        .attr("cx", i => x((z1[i]*u1 + z2[i]*u2) * u1))
        .attr("cy", i => y((z1[i]*u1 + z2[i]*u2) * u2));

      // Update gauge (variance ~ in [0, 2]).
      const frac = Math.min(1, v / 2.0);
      gaugeFill.attr("y", gaugeH * (1 - frac)).attr("height", gaugeH * frac);
      gaugeText.text(v.toFixed(3));
      gaugePctText.text((frac * 100).toFixed(1) + "%");

      // Show PC2 ghost arrow when near alignment with PC1 (45°).
      const alignment = Math.abs(Math.cos(2 * (theta - Math.PI/4)));
      armTeal.attr("x1", x(0)).attr("y1", y(0))
        .attr("x2", x(armLen * 0.6 * (-u2))).attr("y2", y(armLen * 0.6 * u1))
        .attr("opacity", alignment > 0.9 ? (alignment - 0.9) * 8 : 0);

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    return { update: () => {} };
  }

  // ------------------------------------------------------------------
  // Tab 2: PCA simulator scatter — z-scored cloud + PC1/PC2 arrows.
  // ------------------------------------------------------------------
  function pca_scatter(container) {
    const W = 760, H = 420;
    const margin = { top: 24, right: 200, bottom: 40, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([-3, 3]).range([0, w]);
    const y = d3.scaleLinear().domain([-3, 3]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h/2})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(0))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").attr("transform", `translate(${w/2},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(0))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain").attr("stroke", C.muted).attr("stroke-opacity", 0.4);
    g.append("line").attr("x1", 0).attr("x2", w).attr("y1", h/2).attr("y2", h/2).attr("stroke", C.grid);
    g.append("line").attr("x1", w/2).attr("x2", w/2).attr("y1", 0).attr("y2", h).attr("stroke", C.grid);

    g.append("text").attr("x", w - 8).attr("y", h/2 - 6).attr("fill", C.muted)
      .attr("font-size", 11).attr("text-anchor", "end").text("z (Life expectancy)");
    g.append("text").attr("x", w/2 + 6).attr("y", 12).attr("fill", C.muted)
      .attr("font-size", 11).text("z (Infant survival)");

    const pts = g.append("g");
    const pc1Line = g.append("line").attr("stroke", C.orange).attr("stroke-width", 3);
    const pc2Line = g.append("line").attr("stroke", C.teal).attr("stroke-width", 2)
      .attr("stroke-dasharray", "5 3");

    // Side legend with eigenvalue numbers
    const sideX = w + 20;
    const side = g.append("g").attr("transform", `translate(${sideX}, 0)`);
    side.append("rect").attr("width", 170).attr("height", h)
      .attr("fill", "rgba(15,23,41,0.45)").attr("stroke", C.line).attr("rx", 6);
    side.append("text").attr("x", 12).attr("y", 22).attr("fill", C.text)
      .attr("font-size", 13).attr("font-weight", 600).text("Principal components");

    const pc1Box = side.append("g").attr("transform", "translate(12, 44)");
    pc1Box.append("rect").attr("width", 14).attr("height", 14).attr("fill", C.orange).attr("rx", 3);
    pc1Box.append("text").attr("x", 22).attr("y", 12).attr("fill", C.text)
      .attr("font-size", 12).attr("font-weight", 600).text("PC1");

    const pc1Vex = side.append("text").attr("x", 12).attr("y", 80).attr("fill", C.text)
      .attr("font-size", 13).attr("font-weight", 600);
    const pc1Lab = side.append("text").attr("x", 12).attr("y", 96).attr("fill", C.muted)
      .attr("font-size", 11).text("variance explained");
    const pc1L = side.append("text").attr("x", 12).attr("y", 118).attr("fill", C.orange)
      .attr("font-size", 12);

    const pc2Box = side.append("g").attr("transform", "translate(12, 160)");
    pc2Box.append("rect").attr("width", 14).attr("height", 14).attr("fill", C.teal).attr("rx", 3);
    pc2Box.append("text").attr("x", 22).attr("y", 12).attr("fill", C.text)
      .attr("font-size", 12).attr("font-weight", 600).text("PC2");

    const pc2Vex = side.append("text").attr("x", 12).attr("y", 196).attr("fill", C.text)
      .attr("font-size", 13).attr("font-weight", 600);
    side.append("text").attr("x", 12).attr("y", 212).attr("fill", C.muted)
      .attr("font-size", 11).text("variance explained");
    const pc2L = side.append("text").attr("x", 12).attr("y", 234).attr("fill", C.teal)
      .attr("font-size", 12);

    const corrText = side.append("text").attr("x", 12).attr("y", h - 22).attr("fill", C.muted)
      .attr("font-size", 11);

    function update(data) {
      const { z1, z2, n, r, l1, l2, v1, v2 } = data;

      const sel = pts.selectAll("circle").data(d3.range(n));
      sel.enter().append("circle")
        .attr("r", 3).attr("fill", C.steel).attr("opacity", 0.7)
        .merge(sel)
        .attr("cx", i => x(z1[i])).attr("cy", i => y(z2[i]));
      sel.exit().remove();

      const armLen = 2.3;
      pc1Line.attr("x1", x(-armLen * v1[0])).attr("y1", y(-armLen * v1[1]))
        .attr("x2", x(armLen * v1[0])).attr("y2", y(armLen * v1[1]));
      const pc2Scale = Math.max(0.4, Math.sqrt(l2) * 1.4);
      pc2Line.attr("x1", x(-pc2Scale * v2[0])).attr("y1", y(-pc2Scale * v2[1]))
        .attr("x2", x(pc2Scale * v2[0])).attr("y2", y(pc2Scale * v2[1]));

      const total = l1 + l2;
      const p1 = total > 0 ? l1 / total : 0.5;
      const p2 = total > 0 ? l2 / total : 0.5;
      pc1Vex.text((p1 * 100).toFixed(1) + " %");
      pc2Vex.text((p2 * 100).toFixed(1) + " %");
      pc1L.text(`λ₁ = ${l1.toFixed(4)}`);
      pc2L.text(`λ₂ = ${l2.toFixed(4)}`);
      corrText.text(`Sample r = ${r.toFixed(4)}`);
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 2: Histogram of variance-explained over many simulations.
  // ------------------------------------------------------------------
  function variance_histogram(container) {
    const W = 720, H = 280;
    const margin = { top: 20, right: 24, bottom: 40, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const vals = data.values;
      if (!vals.length) return;

      const x = d3.scaleLinear().domain([0, 1]).range([0, w]);
      const bins = d3.bin().domain([0, 1]).thresholds(20)(vals);
      const y = d3.scaleLinear()
        .domain([0, Math.max(1, d3.max(bins, b => b.length))])
        .range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d => (d*100).toFixed(0) + "%"))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, line").attr("stroke", C.muted).attr("stroke-opacity", 0.4);

      g.selectAll("rect.bar").data(bins).enter().append("rect")
        .attr("class", "bar")
        .attr("x", b => x(b.x0) + 1)
        .attr("y", b => y(b.length))
        .attr("width", b => Math.max(0, x(b.x1) - x(b.x0) - 2))
        .attr("height", b => h - y(b.length))
        .attr("fill", C.teal).attr("opacity", 0.75);

      // Mean line
      if (data.mean != null) {
        g.append("line").attr("x1", x(data.mean)).attr("x2", x(data.mean))
          .attr("y1", 0).attr("y2", h).attr("stroke", C.orange).attr("stroke-width", 2);
        g.append("text").attr("x", x(data.mean) + 5).attr("y", 14)
          .attr("fill", C.orange).attr("font-size", 11)
          .text(`mean = ${(data.mean*100).toFixed(1)}%`);
      }

      g.append("text").attr("x", w/2).attr("y", h + 32).attr("fill", C.text)
        .attr("font-size", 12).attr("text-anchor", "middle")
        .text("PC1 variance explained (over 100 simulations)");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 3: Country-ranking horizontal bar chart with hover tooltip.
  // ------------------------------------------------------------------
  function country_bars(container) {
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    function update(data) {
      const rows = data.rows;
      const metric = data.metric;
      const titleMap = {
        health_index: "Health Index (0 = worst, 1 = best)",
        pc1: "PC1 score",
        life_exp: "Life expectancy (years)",
        infant_mort: "Infant mortality (per 1,000)",
      };

      const W = 760, rowH = 14, headerH = 30, footerH = 30;
      const H = headerH + rowH * rows.length + footerH;
      const margin = { top: headerH, right: 80, bottom: footerH, left: 90 };
      const w = W - margin.left - margin.right;
      const h = rowH * rows.length;

      container.innerHTML = "";
      const svg = d3.select(container).append("svg")
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const ext = d3.extent(rows, r => r[metric]);
      const lo = Math.min(0, ext[0]);
      const hi = Math.max(0, ext[1]);
      const x = d3.scaleLinear().domain([lo, hi]).range([0, w]).nice();

      g.append("g").attr("transform", `translate(0,${-4})`)
        .call(d3.axisTop(x).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, line").attr("stroke", C.muted).attr("stroke-opacity", 0.4);

      // Zero baseline
      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.line).attr("stroke-dasharray", "3 3");

      const colorScale = (r) => {
        if (metric === "health_index" || metric === "pc1" || metric === "life_exp") {
          // gradient orange (low) -> teal (high)
          const t = (r[metric] - lo) / (hi - lo);
          return d3.interpolateRgb(C.orange, C.teal)(t);
        }
        // infant_mort: high = bad
        const t = 1 - (r[metric] - lo) / (hi - lo);
        return d3.interpolateRgb(C.orange, C.teal)(t);
      };

      rows.forEach((r, i) => {
        const v = r[metric];
        const x0 = x(Math.min(0, v));
        const xw = Math.abs(x(v) - x(0));
        g.append("rect")
          .attr("x", x0).attr("y", i * rowH + 1)
          .attr("width", xw).attr("height", rowH - 3)
          .attr("fill", colorScale(r))
          .attr("opacity", 0.85)
          .on("mouseenter", (ev) => {
            tooltip.classed("show", true)
              .style("left", (ev.pageX + 12) + "px")
              .style("top", (ev.pageY + 12) + "px")
              .html(
                `<div style="color:${C.text};font-weight:600;margin-bottom:4px;">${r.country}</div>` +
                `<div><span class="tooltip-key">life exp:</span> <span class="tooltip-val">${r.life_exp.toFixed(1)} yrs</span></div>` +
                `<div><span class="tooltip-key">infant mort:</span> <span class="tooltip-val">${r.infant_mort.toFixed(1)} / 1k</span></div>` +
                `<div><span class="tooltip-key">PC1:</span> <span class="tooltip-val">${r.pc1.toFixed(3)}</span></div>` +
                `<div><span class="tooltip-key">Health Index:</span> <span class="tooltip-val">${r.health_index.toFixed(3)}</span></div>`
              );
          })
          .on("mousemove", (ev) => {
            tooltip.style("left", (ev.pageX + 12) + "px")
              .style("top", (ev.pageY + 12) + "px");
          })
          .on("mouseleave", () => tooltip.classed("show", false));

        // Label on the left
        g.append("text").attr("x", -6).attr("y", i * rowH + rowH/2 + 3)
          .attr("text-anchor", "end").attr("fill", C.muted).attr("font-size", 9)
          .text(r.country);
      });

      g.append("text").attr("x", w/2).attr("y", h + 24).attr("fill", C.text)
        .attr("font-size", 12).attr("text-anchor", "middle")
        .text(titleMap[metric] || metric);
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 4: Loadings bar chart — PC1 vs PC2 weights for each indicator.
  // ------------------------------------------------------------------
  function loadings_bars(container) {
    const W = 720, H = 240;
    const margin = { top: 24, right: 28, bottom: 50, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const data = [
      { ind: "Life expectancy", pc1: 0.7071, pc2: 0.7071 },
      { ind: "Infant survival", pc1: 0.7071, pc2: -0.7071 },
    ];

    const x0 = d3.scaleBand().domain(data.map(d => d.ind)).range([0, w]).padding(0.3);
    const x1 = d3.scaleBand().domain(["pc1", "pc2"]).range([0, x0.bandwidth()]).padding(0.1);
    const y = d3.scaleLinear().domain([-1, 1]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${y(0)})`)
      .call(d3.axisBottom(x0))
      .selectAll("text").attr("fill", C.text).attr("font-size", 12);
    g.append("g").call(d3.axisLeft(y).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, line").attr("stroke", C.muted).attr("stroke-opacity", 0.4);

    g.append("text").attr("x", -h/2).attr("y", -42)
      .attr("transform", "rotate(-90)").attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 12).text("Loading (eigenvector entry)");

    data.forEach(d => {
      const grp = g.append("g").attr("transform", `translate(${x0(d.ind)},0)`);
      [["pc1", C.orange, "PC1"], ["pc2", C.teal, "PC2"]].forEach(([k, c, lbl]) => {
        const v = d[k];
        const yy = Math.min(y(0), y(v));
        const hh = Math.abs(y(v) - y(0));
        grp.append("rect")
          .attr("x", x1(k)).attr("y", yy)
          .attr("width", x1.bandwidth()).attr("height", hh)
          .attr("fill", c).attr("opacity", 0.85);
        grp.append("text").attr("x", x1(k) + x1.bandwidth()/2)
          .attr("y", v >= 0 ? yy - 4 : yy + hh + 14)
          .attr("text-anchor", "middle").attr("fill", c).attr("font-size", 11)
          .attr("font-weight", 600).text(v.toFixed(4));
      });
    });

    // Legend
    const lg = g.append("g").attr("transform", `translate(${w - 160}, -8)`);
    lg.append("rect").attr("x", 0).attr("y", 0).attr("width", 12).attr("height", 12)
      .attr("fill", C.orange);
    lg.append("text").attr("x", 18).attr("y", 10).attr("fill", C.text)
      .attr("font-size", 11).text("PC1 (98% variance)");
    lg.append("rect").attr("x", 0).attr("y", 18).attr("width", 12).attr("height", 12)
      .attr("fill", C.teal);
    lg.append("text").attr("x", 18).attr("y", 28).attr("fill", C.text)
      .attr("font-size", 11).text("PC2 (2% variance)");

    return { update: () => {} };
  }

  // ------------------------------------------------------------------
  // Tab 4: Scree plot.
  // ------------------------------------------------------------------
  function scree_plot(container) {
    const W = 720, H = 220;
    const margin = { top: 20, right: 28, bottom: 40, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const data = [
      { name: "PC1", value: 97.97, color: C.orange },
      { name: "PC2", value: 2.03,  color: C.teal },
    ];

    const x = d3.scaleBand().domain(data.map(d => d.name)).range([0, w]).padding(0.5);
    const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x))
      .selectAll("text").attr("fill", C.text).attr("font-size", 13);
    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, line").attr("stroke", C.muted).attr("stroke-opacity", 0.4);

    g.append("text").attr("x", -h/2).attr("y", -42)
      .attr("transform", "rotate(-90)").attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 12).text("Variance explained (%)");

    data.forEach(d => {
      g.append("rect")
        .attr("x", x(d.name)).attr("y", y(d.value))
        .attr("width", x.bandwidth()).attr("height", h - y(d.value))
        .attr("fill", d.color).attr("opacity", 0.9);
      g.append("text").attr("x", x(d.name) + x.bandwidth()/2)
        .attr("y", y(d.value) - 8).attr("text-anchor", "middle")
        .attr("fill", d.color).attr("font-weight", 600).attr("font-size", 14)
        .text(d.value.toFixed(2) + "%");
    });

    // Cumulative line
    let cum = 0;
    const cumData = data.map(d => { cum += d.value; return { name: d.name, value: cum }; });
    const line = d3.line()
      .x(d => x(d.name) + x.bandwidth()/2)
      .y(d => y(d.value));
    g.append("path").datum(cumData)
      .attr("fill", "none").attr("stroke", C.steel)
      .attr("stroke-width", 2).attr("stroke-dasharray", "4 3").attr("d", line);
    cumData.forEach(d => {
      g.append("circle").attr("cx", x(d.name) + x.bandwidth()/2).attr("cy", y(d.value))
        .attr("r", 4).attr("fill", C.steel);
    });

    return { update: () => {} };
  }

  // ------------------------------------------------------------------
  // PCA math helpers used by the simulator.
  // ------------------------------------------------------------------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeNormal(rng) {
    let cached = null;
    return function () {
      if (cached !== null) { const r = cached; cached = null; return r; }
      let u, v;
      do { u = rng(); } while (u < 1e-10);
      v = rng();
      const mag = Math.sqrt(-2 * Math.log(u));
      cached = mag * Math.sin(2 * Math.PI * v);
      return mag * Math.cos(2 * Math.PI * v);
    };
  }

  // Simulate two correlated indicators with a target correlation, after
  // polarity adjustment (so the user-set r corresponds to LE vs IS).
  function simulate_pca_two(opts) {
    const n = Math.max(20, opts.n | 0);
    const seed = (opts.seed >>> 0) || 42;
    const targetR = Math.max(-0.999, Math.min(0.999, +opts.r));
    const noise = Math.max(0.05, +opts.noise);
    const rng = mulberry32(seed);
    const normal = makeNormal(rng);

    // Latent factor + correlated indicators (mimicking the post's DGP).
    const a = new Float64Array(n), b = new Float64Array(n);
    const c2 = Math.sqrt(Math.max(0, 1 - targetR * targetR));
    for (let i = 0; i < n; i++) {
      const u = normal();
      const v = normal();
      // Final z values targeting cor = targetR
      a[i] = u + noise * 0.01 * normal();
      b[i] = targetR * u + c2 * v + noise * 0.01 * normal();
    }
    // Standardise both to mean 0, sd 1 (since we directly construct z-scores).
    function zscore(arr) {
      let m = 0; for (let i = 0; i < n; i++) m += arr[i]; m /= n;
      let s = 0; for (let i = 0; i < n; i++) s += (arr[i]-m)**2;
      s = Math.sqrt(s / n) || 1;
      for (let i = 0; i < n; i++) arr[i] = (arr[i]-m) / s;
    }
    zscore(a); zscore(b);

    // Empirical correlation.
    let cor = 0;
    for (let i = 0; i < n; i++) cor += a[i] * b[i];
    cor /= n;

    // Eigen-decompose [[1, r], [r, 1]] in closed form.
    const l1 = 1 + Math.abs(cor);
    const l2 = 1 - Math.abs(cor);
    // Eigenvectors: when cor > 0, [+1, +1]/√2 and [+1, -1]/√2
    //               when cor < 0, [+1, -1]/√2 and [+1, +1]/√2
    const s = Math.sign(cor) || 1;
    const inv = 1 / Math.sqrt(2);
    const v1 = [inv, s * inv];
    const v2 = [inv, -s * inv];

    return { z1: a, z2: b, n, r: cor, l1, l2, v1, v2 };
  }

  window.CHARTS = {
    pca_rotation_animation,
    pca_scatter,
    variance_histogram,
    country_bars,
    loadings_bars,
    scree_plot,
    simulate_pca_two,
  };
})();
