// app.js — HonestDiD interactive lab.
// Wires DOM controls to dgp/lasso/charts modules + custom honestdid charts.

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Color tokens (mirror charts.js).
  // ------------------------------------------------------------------
  const C = {
    bg:    "#0f1729",
    panel: "#1f2b5e",
    steel: "#6a9bcc",
    orange:"#d97757",
    teal:  "#00d4c8",
    text:  "#e8ecf2",
    muted: "#8b9dc3",
    line:  "rgba(232, 236, 242, 0.18)",
    faint: "rgba(232, 236, 242, 0.15)",
  };

  // ------------------------------------------------------------------
  // Tab switching.
  // ------------------------------------------------------------------
  function activateTab(paneId) {
    document.querySelectorAll(".tab-strip button").forEach(btn => {
      const isActive = btn.dataset.pane === paneId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === paneId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll(".tab-strip button").forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.pane));
  });
  document.querySelectorAll(".cta-card").forEach(card => {
    card.addEventListener("click", () => activateTab(card.dataset.goto));
  });

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  function ensureSVG(container, viewBoxW, viewBoxH) {
    container.innerHTML = "";
    return d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${viewBoxW} ${viewBoxH}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
  }

  // ------------------------------------------------------------------
  // Tab 1 — animated sensitivity CI expanding with M.
  // ------------------------------------------------------------------
  function honestdid_animation(container) {
    const W = 720, H = 320;
    const margin = { top: 28, right: 28, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Coefficient: 0.0423 (2014). CI half-width grows from 0.0084 at M=0 up to ~0.05 at M=2.
    const point = 0.0423;
    const x = d3.scaleLinear().domain([0, 2]).range([0, w]);
    const y = d3.scaleLinear().domain([-0.03, 0.10]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".02f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w/2},${h+36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Sensitivity parameter M̄  (relative magnitudes)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h/2},${-42})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Robust 95% CI on 2014 effect");

    // Zero line.
    g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
      .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

    // Pre-baked CI curves (from results.json, Full panel).
    const ci = [
      { M: 0.0,  lo:  0.0270, hi: 0.0580 },
      { M: 0.5,  lo:  0.0210, hi: 0.0630 },
      { M: 1.0,  lo:  0.0130, hi: 0.0710 },
      { M: 1.5,  lo:  0.0030, hi: 0.0810 },
      { M: 2.0,  lo: -0.0070, hi: 0.0910 },
    ];

    function interpCI(m) {
      // Linear interpolate between the grid points.
      for (let i = 0; i < ci.length - 1; i++) {
        if (m >= ci[i].M && m <= ci[i+1].M) {
          const t = (m - ci[i].M) / (ci[i+1].M - ci[i].M);
          return {
            lo: ci[i].lo + t * (ci[i+1].lo - ci[i].lo),
            hi: ci[i].hi + t * (ci[i+1].hi - ci[i].hi),
          };
        }
      }
      return { lo: ci[ci.length-1].lo, hi: ci[ci.length-1].hi };
    }

    // Area between lo and hi curves.
    const grid = d3.range(0, 2.001, 0.02);
    const areaData = grid.map(m => ({ M: m, ...interpCI(m) }));
    const area = d3.area()
      .x(d => x(d.M))
      .y0(d => y(d.lo))
      .y1(d => y(d.hi))
      .curve(d3.curveMonotoneX);
    g.append("path").datum(areaData).attr("d", area)
      .attr("fill", C.orange).attr("opacity", 0.25);

    const lineLo = d3.line().x(d => x(d.M)).y(d => y(d.lo)).curve(d3.curveMonotoneX);
    const lineHi = d3.line().x(d => x(d.M)).y(d => y(d.hi)).curve(d3.curveMonotoneX);
    g.append("path").datum(areaData).attr("d", lineHi)
      .attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2);
    g.append("path").datum(areaData).attr("d", lineLo)
      .attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2);

    // Point estimate line (constant).
    g.append("line").attr("x1", 0).attr("x2", w)
      .attr("y1", y(point)).attr("y2", y(point))
      .attr("stroke", C.teal).attr("stroke-width", 2).attr("stroke-dasharray", "5 5");
    g.append("text").attr("x", w - 6).attr("y", y(point) - 6)
      .attr("text-anchor", "end").attr("fill", C.teal).attr("font-size", 11)
      .text(`point estimate = ${point.toFixed(4)}`);

    // Moving marker.
    const marker = g.append("g");
    marker.append("line").attr("class", "m-line")
      .attr("stroke", C.steel).attr("stroke-width", 2);
    marker.append("circle").attr("class", "m-lo").attr("r", 5)
      .attr("fill", C.orange).attr("stroke", "#fff").attr("stroke-width", 1);
    marker.append("circle").attr("class", "m-hi").attr("r", 5)
      .attr("fill", C.orange).attr("stroke", "#fff").attr("stroke-width", 1);
    const labelLo = marker.append("text").attr("fill", C.text).attr("font-size", 11);
    const labelHi = marker.append("text").attr("fill", C.text).attr("font-size", 11);

    // Legend.
    const lg = g.append("g").attr("transform", `translate(10,8)`);
    lg.append("rect").attr("width", 260).attr("height", 50).attr("fill", "rgba(15,23,41,0.6)")
      .attr("stroke", C.line).attr("rx", 6);
    lg.append("rect").attr("x", 12).attr("y", 12).attr("width", 14).attr("height", 10)
      .attr("fill", C.orange).attr("opacity", 0.6);
    lg.append("text").attr("x", 32).attr("y", 22).attr("fill", C.text).attr("font-size", 11)
      .text("Δᴿᴹ robust CI band");
    lg.append("line").attr("x1", 12).attr("x2", 26).attr("y1", 38).attr("y2", 38)
      .attr("stroke", C.teal).attr("stroke-width", 2).attr("stroke-dasharray", "5 5");
    lg.append("text").attr("x", 32).attr("y", 42).attr("fill", C.text).attr("font-size", 11)
      .text("Point estimate (4.23 pp)");

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      const phase = (Math.sin(elapsed * 0.5) + 1) / 2;
      const m = phase * 2;
      const c = interpCI(m);
      marker.select(".m-line").attr("x1", x(m)).attr("x2", x(m))
        .attr("y1", y(c.lo)).attr("y2", y(c.hi));
      marker.select(".m-lo").attr("cx", x(m)).attr("cy", y(c.lo));
      marker.select(".m-hi").attr("cx", x(m)).attr("cy", y(c.hi));
      labelLo.attr("x", x(m) + 8).attr("y", y(c.lo) + 4).text(`lo=${c.lo.toFixed(3)}`);
      labelHi.attr("x", x(m) + 8).attr("y", y(c.hi) + 4).text(`hi=${c.hi.toFixed(3)}`);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Tab 2 — M-Slider chart: CI sweep for a chosen analysis.
  // ------------------------------------------------------------------
  function m_slider_chart(container) {
    const W = 760, H = 360;
    const margin = { top: 28, right: 28, bottom: 48, left: 64 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");
    g.append("text")
      .attr("transform", `translate(${w/2},${h+38})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("M̄ (relative magnitudes parameter)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h/2},${-46})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Robust 95% CI");
    const titleEl = g.append("text").attr("x", 0).attr("y", -10)
      .attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600);

    function update(rows, currentM, pointEstimate, breakdown, title) {
      // rows: array {M, ci_lo, ci_hi}
      const x = d3.scaleLinear().domain([0, 2]).range([0, w]);
      const allY = rows.flatMap(r => [r.ci_lo, r.ci_hi]).concat([0, pointEstimate]);
      const ext = d3.extent(allY);
      const pad = Math.max(0.005, (ext[1] - ext[0]) * 0.12);
      const y = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([h, 0]);

      titleEl.text(title);

      xAxisG.call(d3.axisBottom(x).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".03f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Clear previous.
      g.selectAll(".plot-content").remove();
      const plot = g.append("g").attr("class", "plot-content");

      // Zero line.
      plot.append("line").attr("x1", 0).attr("x2", w)
        .attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      // CI band (filled area).
      const area = d3.area().x(d => x(d.M)).y0(d => y(d.ci_lo)).y1(d => y(d.ci_hi))
        .curve(d3.curveMonotoneX);
      plot.append("path").datum(rows).attr("d", area)
        .attr("fill", C.orange).attr("opacity", 0.22);

      // CI lines.
      const lineLo = d3.line().x(d => x(d.M)).y(d => y(d.ci_lo)).curve(d3.curveMonotoneX);
      const lineHi = d3.line().x(d => x(d.M)).y(d => y(d.ci_hi)).curve(d3.curveMonotoneX);
      plot.append("path").datum(rows).attr("d", lineLo)
        .attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2);
      plot.append("path").datum(rows).attr("d", lineHi)
        .attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2);

      // Point estimate line.
      plot.append("line").attr("x1", 0).attr("x2", w)
        .attr("y1", y(pointEstimate)).attr("y2", y(pointEstimate))
        .attr("stroke", C.teal).attr("stroke-width", 2).attr("stroke-dasharray", "5 5");
      plot.append("text").attr("x", w - 4).attr("y", y(pointEstimate) - 6)
        .attr("text-anchor", "end").attr("fill", C.teal).attr("font-size", 11)
        .text(`point = ${pointEstimate.toFixed(4)}`);

      // Breakdown vertical line.
      if (breakdown !== null && breakdown <= 2) {
        plot.append("line").attr("x1", x(breakdown)).attr("x2", x(breakdown))
          .attr("y1", 0).attr("y2", h)
          .attr("stroke", C.steel).attr("stroke-width", 2).attr("stroke-dasharray", "4 4");
        plot.append("text").attr("x", x(breakdown) + 4).attr("y", 14)
          .attr("fill", C.steel).attr("font-size", 11)
          .text(`breakdown M̄ ≈ ${breakdown.toFixed(2)}`);
      } else if (breakdown !== null) {
        plot.append("text").attr("x", w - 4).attr("y", 14)
          .attr("text-anchor", "end").attr("fill", C.steel).attr("font-size", 11)
          .text(`breakdown > 2 (off-chart)`);
      }

      // Marker at currentM.
      // Find CI by interpolation.
      function ciAt(m) {
        for (let i = 0; i < rows.length - 1; i++) {
          if (m >= rows[i].M && m <= rows[i+1].M) {
            const t = (m - rows[i].M) / (rows[i+1].M - rows[i].M);
            return {
              lo: rows[i].ci_lo + t * (rows[i+1].ci_lo - rows[i].ci_lo),
              hi: rows[i].ci_hi + t * (rows[i+1].ci_hi - rows[i].ci_hi),
            };
          }
        }
        return { lo: rows[rows.length-1].ci_lo, hi: rows[rows.length-1].ci_hi };
      }
      const c = ciAt(currentM);
      plot.append("line").attr("x1", x(currentM)).attr("x2", x(currentM))
        .attr("y1", y(c.lo)).attr("y2", y(c.hi))
        .attr("stroke", C.steel).attr("stroke-width", 3);
      plot.append("circle").attr("cx", x(currentM)).attr("cy", y(c.lo)).attr("r", 6)
        .attr("fill", C.orange).attr("stroke", "#fff").attr("stroke-width", 1.5);
      plot.append("circle").attr("cx", x(currentM)).attr("cy", y(c.hi)).attr("r", 6)
        .attr("fill", C.orange).attr("stroke", "#fff").attr("stroke-width", 1.5);

      return c;
    }

    return { update };
  }

  // Linearly interpolate breakdown from CI table.
  function interpolateBreakdown(rows) {
    // Walks through M values; finds the M at which ci_lo first crosses zero.
    for (let i = 0; i < rows.length - 1; i++) {
      const lo1 = rows[i].ci_lo, lo2 = rows[i+1].ci_lo;
      if (lo1 > 0 && lo2 <= 0) {
        const t = lo1 / (lo1 - lo2);
        return rows[i].M + t * (rows[i+1].M - rows[i].M);
      }
    }
    return null; // never crosses → breakdown > max M
  }

  // ------------------------------------------------------------------
  // Tab 3 — Event study plot for the simulator.
  // ------------------------------------------------------------------
  function event_study_chart(container) {
    const W = 760, H = 300;
    const margin = { top: 24, right: 24, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(coefs) {
      g.selectAll("*").remove();
      const x = d3.scaleLinear()
        .domain(d3.extent(coefs, d => d.event_time))
        .range([0, w]);
      const allY = coefs.flatMap(d => [d.ci_lo, d.ci_hi]).concat([0]);
      const ext = d3.extent(allY);
      const pad = Math.max(0.005, (ext[1] - ext[0]) * 0.10);
      const y = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(coefs.length).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".03f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text").attr("transform", `translate(${w/2},${h+36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Event time (years from treatment)");
      g.append("text").attr("transform", `rotate(-90) translate(${-h/2},${-42})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Event-study coefficient");

      // Zero & treatment lines.
      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      g.append("line").attr("x1", x(-0.5)).attr("x2", x(-0.5))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.muted).attr("stroke-dasharray", "5 5");
      g.append("text").attr("x", x(-0.5) + 6).attr("y", 12)
        .attr("fill", C.muted).attr("font-size", 11).text("treatment →");

      // CI bars and points.
      coefs.forEach(d => {
        const isPost = d.event_time >= 0;
        const color = isPost ? C.orange : C.steel;
        g.append("line").attr("x1", x(d.event_time)).attr("x2", x(d.event_time))
          .attr("y1", y(d.ci_lo)).attr("y2", y(d.ci_hi))
          .attr("stroke", color).attr("stroke-width", 2);
        g.append("line").attr("x1", x(d.event_time) - 4).attr("x2", x(d.event_time) + 4)
          .attr("y1", y(d.ci_lo)).attr("y2", y(d.ci_lo))
          .attr("stroke", color).attr("stroke-width", 2);
        g.append("line").attr("x1", x(d.event_time) - 4).attr("x2", x(d.event_time) + 4)
          .attr("y1", y(d.ci_hi)).attr("y2", y(d.ci_hi))
          .attr("stroke", color).attr("stroke-width", 2);
        g.append("circle").attr("cx", x(d.event_time)).attr("cy", y(d.coef)).attr("r", 5)
          .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 1);
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 4 — Forest plot of robust CIs at a given M across analyses.
  // ------------------------------------------------------------------
  function honestdid_forest(container) {
    const W = 880;
    const margin = { top: 28, right: 24, bottom: 44, left: 170 };
    const svg = d3.select(container).html("").append("svg")
      .attr("preserveAspectRatio", "xMidYMid meet");

    function update(estimates, currentM, activeAnalyses) {
      // Filter to chosen M and active analyses.
      const rows = estimates.filter(d => activeAnalyses.includes(d.outcome) &&
                                          d.method === "DeltaRM" &&
                                          Math.abs(d.M - currentM) < 1e-6);
      const facetH = 38 * rows.length + 36;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet").remove();

      const facet = svg.append("g").attr("class", "facet")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      const facetW = W - margin.left - margin.right;

      if (rows.length === 0) {
        facet.append("text").attr("x", facetW/2).attr("y", 20).attr("text-anchor","middle")
          .attr("fill", C.muted).attr("font-size", 13).text("Select at least one analysis.");
        return;
      }

      const ext = d3.extent(rows.flatMap(d => [d.ci_lo, d.ci_hi]));
      const xMin = Math.min(0, ext[0]);
      const xMax = Math.max(0, ext[1]);
      const pad = Math.max(0.01, (xMax - xMin) * 0.10);
      const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, facetW]);
      const y = d3.scaleBand().domain(rows.map(d => d.outcome))
        .range([0, facetH]).padding(0.35);

      // Title.
      facet.append("text").attr("x", facetW/2).attr("y", -10)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13)
        .attr("font-weight", 600).text(`Robust CIs at M̄ = ${currentM.toFixed(2)}`);

      // Zero line.
      facet.append("line").attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", facetH)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      // x axis.
      facet.append("g").attr("transform", `translate(0,${facetH})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".03f")))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Method labels.
      rows.forEach(d => {
        const yc = y(d.outcome) + y.bandwidth() / 2;
        svg.append("text").attr("class", "facet")
          .attr("x", margin.left - 10)
          .attr("y", margin.top + yc + 4)
          .attr("text-anchor", "end")
          .attr("fill", C.text).attr("font-size", 12).text(d.outcome);

        // Color: positive (lo > 0) = teal; negative crossing = orange.
        const crossesZero = d.ci_lo <= 0;
        const color = crossesZero ? C.orange : C.teal;

        const grp = facet.append("g").attr("class", "row").style("cursor", "pointer");
        grp.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc)
          .attr("stroke", color).attr("stroke-width", 2.5);
        grp.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
          .attr("y1", yc - 5).attr("y2", yc + 5)
          .attr("stroke", color).attr("stroke-width", 2);
        grp.append("line")
          .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
          .attr("y1", yc - 5).attr("y2", yc + 5)
          .attr("stroke", color).attr("stroke-width", 2);
        grp.append("circle")
          .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
          .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 1);
        grp.append("text")
          .attr("x", x(d.ci_hi) + 8).attr("y", yc + 4)
          .attr("fill", C.text).attr("font-size", 11)
          .text(`[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]`);
      });
    }
    return { update };
  }

  // Compact breakdown bar chart.
  function breakdown_bars(container) {
    const W = 880, margin = { top: 24, right: 24, bottom: 36, left: 170 };
    const svg = d3.select(container).html("").append("svg")
      .attr("preserveAspectRatio", "xMidYMid meet");

    function update(estimates, activeAnalyses) {
      // Compute breakdown for each analysis.
      const records = activeAnalyses.map(name => {
        const rows = estimates.filter(d => d.outcome === name && d.method === "DeltaRM")
          .sort((a, b) => a.M - b.M);
        const bd = interpolateBreakdown(rows);
        return { name, breakdown: bd, beyond: bd === null };
      });
      const facetH = 36 * records.length + 24;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet").remove();
      const facet = svg.append("g").attr("class", "facet")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      const facetW = W - margin.left - margin.right;

      if (records.length === 0) return;

      const xMax = 2.3; // grid up to 2.2 for "beyond"
      const x = d3.scaleLinear().domain([0, xMax]).range([0, facetW]);
      const y = d3.scaleBand().domain(records.map(d => d.name))
        .range([0, facetH]).padding(0.35);

      facet.append("text").attr("x", facetW/2).attr("y", -8)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13)
        .attr("font-weight", 600).text("Breakdown M̄ across analyses (Δᴿᴹ)");

      facet.append("g").attr("transform", `translate(0,${facetH})`)
        .call(d3.axisBottom(x).ticks(6))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

      records.forEach(r => {
        const yc = y(r.name) + y.bandwidth() / 2;
        svg.append("text").attr("class", "facet")
          .attr("x", margin.left - 10).attr("y", margin.top + yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(r.name);
        const bd = r.breakdown === null ? 2.2 : r.breakdown;
        const color = r.breakdown === null ? C.teal :
                     (r.breakdown >= 1.5 ? C.teal :
                      (r.breakdown >= 1 ? C.steel : C.orange));
        facet.append("rect")
          .attr("x", 0).attr("y", yc - y.bandwidth() * 0.35)
          .attr("width", x(bd)).attr("height", y.bandwidth() * 0.7)
          .attr("fill", color).attr("opacity", 0.8);
        facet.append("text")
          .attr("x", x(bd) + 6).attr("y", yc + 4)
          .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
          .text(r.breakdown === null ? "> 2.0" : r.breakdown.toFixed(2));
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Build a 100x bootstrap-style histogram of breakdown values.
  // ------------------------------------------------------------------
  function breakdown_histograms(container) {
    const W = 720, H = 260;
    const margin = { top: 18, right: 24, bottom: 38, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(rmBreakdowns, sdBreakdowns) {
      g.selectAll("*").remove();
      // Two side-by-side: RM (0-2.5) and SD (0-0.04). Stack into one shared dataset by normalising.
      // Show two histograms stacked.
      const W2 = w / 2 - 12;

      function drawOne(values, color, xMin, xMax, xOffset, label) {
        if (!values.length) return;
        const x = d3.scaleLinear().domain([xMin, xMax]).range([xOffset, xOffset + W2]);
        const bin = d3.bin().domain([xMin, xMax]).thresholds(15);
        const bins = bin(values);
        const maxC = d3.max(bins, d => d.length) || 1;
        const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);
        bins.forEach(b => {
          g.append("rect")
            .attr("x", x(b.x0))
            .attr("width", Math.max(0, x(b.x1) - x(b.x0) - 1))
            .attr("y", y(b.length))
            .attr("height", y(0) - y(b.length))
            .attr("fill", color).attr("opacity", 0.85);
        });
        g.append("g").attr("transform", `translate(0,${h})`)
          .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(xMax > 1 ? ".1f" : ".03f")))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        const mean = d3.mean(values) || 0;
        g.append("line").attr("x1", x(mean)).attr("x2", x(mean))
          .attr("y1", 0).attr("y2", h).attr("stroke", C.text).attr("stroke-width", 1.5);
        g.append("text").attr("x", x(mean) + 4).attr("y", 12)
          .attr("fill", C.text).attr("font-size", 11)
          .text(`mean = ${mean.toFixed(xMax > 1 ? 2 : 4)}`);
        g.append("text").attr("x", xOffset + W2/2).attr("y", h + 30)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
          .text(label);
      }

      drawOne(rmBreakdowns, C.teal,   0, 2.5,  0,         "Breakdown M̄ (Δᴿᴹ)");
      drawOne(sdBreakdowns, C.orange, 0, 0.04, W2 + 24,   "Breakdown M (Δˢᴰ)");
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
    }
    return { update };
  }

  // ===================================================================
  // ============================  STATE  ==============================
  // ===================================================================
  let RESULTS_JSON = null;
  honestdid_animation(document.getElementById("intro-anim"));

  // -------------------- TAB 2: M-SLIDER ------------------------------
  const ms = {
    analysis: "Full panel (5 pre)",
    M: 1.0,
    chart: m_slider_chart(document.getElementById("ms-chart")),
  };

  function ms_render() {
    if (!RESULTS_JSON) return;
    const rows = RESULTS_JSON.estimates.filter(d =>
      d.outcome === ms.analysis && d.method === "DeltaRM")
      .sort((a, b) => a.M - b.M);
    if (rows.length === 0) return;
    // Find original point estimate.
    const orig = RESULTS_JSON.estimates.find(d =>
      d.outcome === ms.analysis && d.method === "Original");
    const point = orig ? orig.estimate : rows[0].estimate;
    const breakdown = interpolateBreakdown(rows);
    const title = `${ms.analysis} — Δᴿᴹ sensitivity`;

    const c = ms.chart.update(rows, ms.M, point, breakdown, title);

    document.getElementById("ms-stat-point").textContent = point.toFixed(4);
    document.getElementById("ms-stat-ci").textContent = `[${c.lo.toFixed(4)}, ${c.hi.toFixed(4)}]`;
    document.getElementById("ms-stat-bd").textContent =
      breakdown === null ? "> 2.0" : breakdown.toFixed(2);
    const verdict = c.lo > 0 ? "Significant" : "CI includes 0";
    const verdictEl = document.getElementById("ms-stat-verdict");
    verdictEl.textContent = verdict;
    verdictEl.classList.remove("teal", "orange");
    verdictEl.classList.add(c.lo > 0 ? "teal" : "orange");
  }

  document.getElementById("ms-analysis").addEventListener("change", e => {
    ms.analysis = e.target.value;
    ms_render();
  });
  document.getElementById("ms-m").addEventListener("input", e => {
    ms.M = +e.target.value;
    document.getElementById("ms-m-val").textContent = ms.M.toFixed(2);
    ms_render();
  });

  // -------------------- TAB 3: DGP SIMULATOR -------------------------
  // Simple event-study DGP. n units split 50/50 treated/control. 5 pre + 2 post.
  // True ATT in post; PTA violation v hidden post-period; Gaussian noise σ.
  const sim = {
    n: 200, att: 0.05, violation: 0.02, sigma: 0.02, seed: 1,
    chart: event_study_chart(document.getElementById("sim-eventstudy")),
    hist: breakdown_histograms(document.getElementById("sim-hist")),
  };

  function simulate_event_study(opts) {
    // Returns 8 event-time coefficients with se and CI.
    const { n, att, violation, sigma, seed } = opts;
    const rng = (function () {
      let a = seed >>> 0;
      return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })();
    let cached = null;
    function randn() {
      if (cached !== null) { const v = cached; cached = null; return v; }
      let u; do { u = rng(); } while (u < 1e-10);
      const v = rng();
      const mag = Math.sqrt(-2 * Math.log(u));
      cached = mag * Math.sin(2 * Math.PI * v);
      return mag * Math.cos(2 * Math.PI * v);
    }
    const events = [-6, -5, -4, -3, -2, -1, 0, 1];
    const coefs = events.map(t => {
      let mu;
      if (t === -1) mu = 0;
      else if (t < 0) mu = 0;  // pre-period: no violation by assumption (PTA)
      else mu = att + violation;  // post: true effect plus the hidden bias
      // The estimated coefficient differs from mu by sampling noise.
      const noise = randn() * sigma * Math.sqrt(2 / n);
      const coef = mu + noise;
      const se = sigma * Math.sqrt(2 / n) * 1.05; // approx SE
      return {
        event_time: t,
        year: 2014 + t,
        coef,
        se,
        ci_lo: coef - 1.96 * se,
        ci_hi: coef + 1.96 * se,
      };
    });
    return coefs;
  }

  function breakdown_from_coefs(coefs, mode) {
    // mode in {"RM", "SD"}.
    // For RM: post-period bias bound = M * max(|pre_coef|). Robust CI = original ± 1.96*se + bound.
    // Breakdown is M at which lower CI = original - 1.96*se - M*pre_max - bound_se = 0.
    // For SD: Acceleration of pre-period: |c_{t+1}-2c_t+c_{t-1}|. Bound = M*(post horizon).
    const pre = coefs.filter(d => d.event_time < -1);
    const post = coefs.find(d => d.event_time === 0); // 2014 effect
    if (!post) return null;
    const preMax = d3.max(pre, d => Math.abs(d.coef)) || 1e-6;

    if (mode === "RM") {
      // Lower CI at M̄: post.coef - 1.96*post.se - M̄ * preMax = 0
      // M̄ = (post.coef - 1.96*post.se) / preMax
      const bd = (post.coef - 1.96 * post.se) / preMax;
      return bd > 0 ? bd : null;
    } else {
      // For SD: second differences of pre-trend coefs.
      const accel = [];
      for (let i = 1; i < pre.length - 1; i++) {
        accel.push(Math.abs(pre[i+1].coef - 2*pre[i].coef + pre[i-1].coef));
      }
      const preAccel = accel.length > 0 ? d3.max(accel) : sigma;
      // Use a 2-period horizon: bound ≈ M * 2 for an SD-like calc.
      const bd = (post.coef - 1.96 * post.se) / 2;
      return bd > 0 ? bd : null;
    }
  }

  function ci_from_coefs(coefs, M, mode) {
    const pre = coefs.filter(d => d.event_time < -1);
    const post = coefs.find(d => d.event_time === 0);
    if (!post) return { lo: 0, hi: 0 };
    if (mode === "RM") {
      const preMax = d3.max(pre, d => Math.abs(d.coef)) || 1e-6;
      const bound = M * preMax;
      return {
        lo: post.coef - 1.96 * post.se - bound,
        hi: post.coef + 1.96 * post.se + bound,
      };
    } else {
      const bound = M * 2; // horizon = 2 post periods → quadratic SD bound
      return {
        lo: post.coef - 1.96 * post.se - bound,
        hi: post.coef + 1.96 * post.se + bound,
      };
    }
  }

  function sim_refit() {
    const coefs = simulate_event_study(sim);
    sim.coefs = coefs;
    sim.chart.update(coefs);
    const pre = coefs.filter(d => d.event_time < -1);
    const preMax = d3.max(pre, d => Math.abs(d.coef)) || 1e-6;

    const ciRm1 = ci_from_coefs(coefs, 1.0, "RM");
    const ciRm2 = ci_from_coefs(coefs, 2.0, "RM");
    const bdRm = breakdown_from_coefs(coefs, "RM");

    const accel = [];
    for (let i = 1; i < pre.length - 1; i++) {
      accel.push(Math.abs(pre[i+1].coef - 2*pre[i].coef + pre[i-1].coef));
    }
    const preAccel = accel.length > 0 ? d3.max(accel) : 0;
    const ciSd1 = ci_from_coefs(coefs, 0.01, "SD");
    const ciSd2 = ci_from_coefs(coefs, 0.02, "SD");
    const bdSd = breakdown_from_coefs(coefs, "SD");

    function ciFmt(c) { return `[${c.lo.toFixed(4)}, ${c.hi.toFixed(4)}]`; }
    document.getElementById("sim-rm-premax").textContent = preMax.toFixed(4);
    document.getElementById("sim-rm-ci1").textContent = ciFmt(ciRm1);
    document.getElementById("sim-rm-ci2").textContent = ciFmt(ciRm2);
    document.getElementById("sim-rm-bd").textContent = bdRm === null ? "n/a" : bdRm.toFixed(2);

    document.getElementById("sim-sd-accel").textContent = preAccel.toFixed(5);
    document.getElementById("sim-sd-ci1").textContent = ciFmt(ciSd1);
    document.getElementById("sim-sd-ci2").textContent = ciFmt(ciSd2);
    document.getElementById("sim-sd-bd").textContent = bdSd === null ? "n/a" : bdSd.toFixed(4);
  }

  const onSimChange = debounce(sim_refit, 100);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim.n = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim.n;
    onSimChange();
  });
  document.getElementById("sim-att").addEventListener("input", e => {
    sim.att = +e.target.value;
    document.getElementById("sim-att-val").textContent = sim.att.toFixed(3);
    onSimChange();
  });
  document.getElementById("sim-v").addEventListener("input", e => {
    sim.violation = +e.target.value;
    document.getElementById("sim-v-val").textContent = sim.violation.toFixed(3);
    onSimChange();
  });
  document.getElementById("sim-s").addEventListener("input", e => {
    sim.sigma = +e.target.value;
    document.getElementById("sim-s-val").textContent = sim.sigma.toFixed(3);
    onSimChange();
  });

  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const histEl = document.getElementById("sim-hist");
    const histStats = document.getElementById("sim-hist-stats");

    const N_SIMS = 100;
    const rmBd = [];
    const sdBd = [];
    let i = 0;
    function step() {
      const end = Math.min(N_SIMS, i + 4);
      for (; i < end; i++) {
        const coefs = simulate_event_study({ ...sim, seed: sim.seed + i + 1 });
        const r = breakdown_from_coefs(coefs, "RM");
        const s = breakdown_from_coefs(coefs, "SD");
        if (r !== null && Number.isFinite(r)) rmBd.push(r);
        if (s !== null && Number.isFinite(s)) sdBd.push(s);
      }
      const pct = (i / N_SIMS) * 100;
      progBar.style.width = pct + "%";
      progLabel.textContent = `simulation ${i} / ${N_SIMS}`;
      if (i < N_SIMS) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = `done (${N_SIMS} simulations)`;
        histEl.style.display = "block";
        histStats.style.display = "grid";
        sim.hist.update(rmBd, sdBd);
        document.getElementById("sim-rm-mean").textContent = (d3.mean(rmBd) || 0).toFixed(2);
        document.getElementById("sim-rm-sd").textContent   = (d3.deviation(rmBd) || 0).toFixed(2);
        document.getElementById("sim-sd-mean").textContent = (d3.mean(sdBd) || 0).toFixed(4);
        document.getElementById("sim-sd-sd").textContent   = (d3.deviation(sdBd) || 0).toFixed(4);
        btn.disabled = false;
      }
    }
    step();
  });

  sim_refit();

  // -------------------- TAB 4: BREAKDOWN FOREST ----------------------
  const fp = {
    M: 1.0,
    chart: honestdid_forest(document.getElementById("fp-chart")),
    bars: breakdown_bars(document.getElementById("fp-bars")),
  };

  function fp_refresh() {
    if (!RESULTS_JSON) return;
    const active = Array.from(document.querySelectorAll("#fp-outcomes input:checked"))
      .map(el => el.value);
    fp.chart.update(RESULTS_JSON.estimates, fp.M, active);
    fp.bars.update(RESULTS_JSON.estimates, active);

    // Summary table.
    const records = active.map(name => {
      const rows = RESULTS_JSON.estimates.filter(d => d.outcome === name && d.method === "DeltaRM")
        .sort((a, b) => a.M - b.M);
      const bd = interpolateBreakdown(rows);
      return { name, bd };
    });
    // Add smoothness from breakdown_values list.
    const sdEntry = RESULTS_JSON.breakdown_values.find(d => d.restriction === "DeltaSD");
    let html = `<table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="border-bottom:1px solid var(--line);">
          <th style="text-align:left;padding:8px;color:var(--muted);font-weight:600;">Analysis</th>
          <th style="text-align:left;padding:8px;color:var(--muted);font-weight:600;">Restriction</th>
          <th style="text-align:right;padding:8px;color:var(--muted);font-weight:600;">Breakdown</th>
          <th style="text-align:left;padding:8px;color:var(--muted);font-weight:600;">Robustness</th>
        </tr>
      </thead>
      <tbody>`;
    records.forEach(r => {
      const bdStr = r.bd === null ? "> 2.0" : r.bd.toFixed(2);
      const robust = r.bd === null ? "Very robust" :
                    (r.bd >= 1.5 ? "Robust" :
                     (r.bd >= 1 ? "Moderately robust" : "Sensitive"));
      const color = r.bd === null ? "var(--teal)" :
                    (r.bd >= 1.5 ? "var(--teal)" :
                     (r.bd >= 1 ? "var(--steel)" : "var(--orange)"));
      html += `<tr style="border-bottom:1px solid var(--line);">
        <td style="padding:8px;">${r.name}</td>
        <td style="padding:8px;">Δᴿᴹ</td>
        <td style="padding:8px;text-align:right;color:${color};font-weight:600;">${bdStr}</td>
        <td style="padding:8px;color:var(--muted);">${robust}</td>
      </tr>`;
    });
    if (sdEntry) {
      html += `<tr style="border-bottom:1px solid var(--line);">
        <td style="padding:8px;">Smoothness (SD)</td>
        <td style="padding:8px;">Δˢᴰ</td>
        <td style="padding:8px;text-align:right;color:var(--orange);font-weight:600;">${sdEntry.breakdown.toFixed(3)}</td>
        <td style="padding:8px;color:var(--muted);">${sdEntry.robustness}</td>
      </tr>`;
    }
    html += `</tbody></table>`;
    document.getElementById("fp-table").innerHTML = html;
  }

  document.getElementById("fp-m").addEventListener("input", e => {
    fp.M = +e.target.value;
    document.getElementById("fp-m-val").textContent = fp.M.toFixed(2);
    fp_refresh();
  });
  document.querySelectorAll("#fp-outcomes input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  // -------------------- Data load (results.json) ---------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    RESULTS_JSON = data;
    ms_render();
    fp_refresh();
  }).catch(err => {
    document.getElementById("ms-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // -------------------- Global error handler -------------------------
  window.addEventListener("error", function (e) {
    console.error("[honestdid-app] uncaught error:", e.error);
  });
})();
