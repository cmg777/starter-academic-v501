// charts.js — D3.js chart library for the python_pyfixest web app.
// Topic: high-dimensional fixed effects (one-way / two-way / three-way),
// the within transformation, clustered standard errors, and the Mincer wage panel.
// All charts share a single dark-navy palette and expose ensureSVG() / update()
// patterns so app.js can swap data without rebuilding the SVG.

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

  // ------------------------------------------------------------------
  // ensureSVG: utility that wipes a container and returns a fresh SVG.
  // ------------------------------------------------------------------
  function ensureSVG(container, viewBoxW, viewBoxH) {
    const node = d3.select(container);
    node.html("");
    return node.append("svg")
      .attr("viewBox", `0 0 ${viewBoxW} ${viewBoxH}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("width", "100%");
  }

  // ------------------------------------------------------------------
  // within_animation (Tab 1) — three workers on a wage panel with two
  // periods. The animation cycles between "raw" coords and "demeaned"
  // coords so the student can SEE the within transformation strip out
  // the worker-specific intercept.
  // ------------------------------------------------------------------
  function within_animation(container) {
    const W = 720, H = 380;
    const margin = { top: 36, right: 28, bottom: 60, left: 64 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Three workers, two periods each: (union_status, lwage).
    // Workers chosen so that POLS slope is steep (positive selection: higher-
    // ability workers select into unions in the Vella-Verbeek panel) but the
    // FE slope is modest. This is the pyfixest post's headline: pooled OLS
    // says union -> +18% wages, one-way FE says union -> +7.8% wages.
    const workers = [
      {
        name: "Alice (low-wage, always non-union)",
        color: C.steel,
        raw:  [[0, 1.1], [0, 1.2]],
      },
      {
        name: "Bob (switcher: non-union to union)",
        color: C.teal,
        raw:  [[0, 1.6], [1, 1.68]],   // ~8% within-worker rise (matches FE union = 0.078)
      },
      {
        name: "Carla (high-wage, always union)",
        color: C.orange,
        raw:  [[1, 2.4], [1, 2.5]],
      },
    ];

    // Compute demeaned coords (subtract worker's two-period mean).
    workers.forEach(wk => {
      const mx = (wk.raw[0][0] + wk.raw[1][0]) / 2;
      const my = (wk.raw[0][1] + wk.raw[1][1]) / 2;
      wk.dem = wk.raw.map(p => [p[0] - mx, p[1] - my]);
    });

    // Static scales: union jittered slightly for visibility.
    const x = d3.scaleLinear().domain([-1.0, 1.5]).range([0, w]);
    const y = d3.scaleLinear().domain([-0.6, 3.2]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 38})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Union status (0 = non-union, 1 = union; demeaning can produce negative values)");

    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-46})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("log(wage)  — demeaning subtracts each worker's two-period mean");

    // Caption that toggles with the animation phase.
    const caption = g.append("text").attr("class", "phase-label")
      .attr("x", 8).attr("y", -14)
      .attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600)
      .text("Raw data — pooled OLS slope = 0.183: looks like unions pay 18% more");

    // Pre-create one circle + one line per worker (the line connects t=2010 to t=2012).
    const elems = workers.map(wk => ({
      wk,
      c1: g.append("circle").attr("r", 7).attr("fill", wk.color).attr("opacity", 0.9)
            .attr("stroke", "#0f1729").attr("stroke-width", 1.5),
      c2: g.append("circle").attr("r", 7).attr("fill", wk.color).attr("opacity", 0.9)
            .attr("stroke", "#0f1729").attr("stroke-width", 1.5),
      seg: g.append("line").attr("stroke", wk.color).attr("stroke-width", 2.2)
            .attr("opacity", 0.85),
      label: g.append("text").attr("fill", wk.color).attr("font-size", 11)
            .attr("font-weight", 600).text(wk.name.split(" ")[0]),
    }));

    // POLS slope through raw points (~0.075 in the post) — flat-ish but positive.
    const polsLine = g.append("line")
      .attr("stroke", C.muted).attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "6 4").attr("opacity", 0.9);
    const polsLabel = g.append("text").attr("fill", C.muted)
      .attr("font-size", 11).attr("font-weight", 600);

    // FE / within slope through demeaned points (~0.21) — steeper.
    const feLine = g.append("line")
      .attr("stroke", C.orange).attr("stroke-width", 2.5).attr("opacity", 0.9);

    // Animation loop: interpolate between raw and demeaned across a 10s cycle.
    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const cyc = ((ts - t0) / 1000) % 10;
      let u, label;
      if (cyc < 1) {
        u = 0; label = "Raw data — pooled OLS slope = 0.183: looks like unions pay 18% more";
      } else if (cyc < 4) {
        // hold raw
        u = 0; label = "Raw data — pooled OLS slope = 0.183: looks like unions pay 18% more";
      } else if (cyc < 5) {
        u = (cyc - 4); // 0 to 1 transition
        label = "Subtracting each worker's mean (the within transformation) ...";
      } else if (cyc < 6) {
        u = 1;
        label = "After demeaning, only the switcher (teal) moves — FE slope drops to 0.078";
      } else if (cyc < 9) {
        u = 1;
        label = "After demeaning, only the switcher (teal) moves — FE slope drops to 0.078";
      } else {
        u = 1 - (cyc - 9); // 1 to 0 transition
        label = "Returning to raw coordinates ...";
      }
      caption.text(label);

      elems.forEach(el => {
        const r0 = el.wk.raw[0], r1 = el.wk.raw[1];
        const d0 = el.wk.dem[0], d1 = el.wk.dem[1];
        const p0 = [r0[0] + u * (d0[0] - r0[0]), r0[1] + u * (d0[1] - r0[1])];
        const p1 = [r1[0] + u * (d1[0] - r1[0]), r1[1] + u * (d1[1] - r1[1])];
        // small horizontal jitter so overlapping (0,0) points do not stack invisibly
        const jit = el.wk.name.startsWith("Alice") ? -0.04
                  : el.wk.name.startsWith("Bob")   ?  0.0
                  :  0.04;
        el.c1.attr("cx", x(p0[0] + jit)).attr("cy", y(p0[1]));
        el.c2.attr("cx", x(p1[0] + jit)).attr("cy", y(p1[1]));
        el.seg.attr("x1", x(p0[0] + jit)).attr("y1", y(p0[1]))
              .attr("x2", x(p1[0] + jit)).attr("y2", y(p1[1]));
        el.label.attr("x", x(p1[0] + jit) + 8).attr("y", y(p1[1]) - 4);
      });

      // POLS line: pass through (0.5, ~1.7) with slope 0.183 — steep, the
      // cross-sectional bias from positive selection into unions.
      // Visible only when looking at raw data (u~0).
      const polsB = 1.0, polsA = 1.4;   // y = polsB + polsA * x ; gives ~1.0 at x=0, ~2.4 at x=1
      const polsAlpha = (1 - u);
      polsLine.attr("opacity", 0.75 * polsAlpha)
        .attr("x1", x(-0.2)).attr("y1", y(polsB + polsA * -0.2))
        .attr("x2", x(1.2)).attr("y2", y(polsB + polsA * 1.2));
      polsLabel.attr("opacity", polsAlpha)
        .attr("x", x(1.1)).attr("y", y(polsB + polsA * 1.1) - 6)
        .text("Pooled OLS slope = 0.183");

      // FE line: through origin in demeaned coords with slope 0.078. Visible when u~1.
      const feA = 0.078;
      const feAlpha = u;
      feLine.attr("opacity", 0.85 * feAlpha)
        .attr("x1", x(-0.6)).attr("y1", y(feA * -0.6))
        .attr("x2", x(0.6)).attr("y2", y(feA * 0.6));

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // variation_bars (Tab 1 helper) — between vs within share for each
  // panel variable. Simple stacked horizontal bars to make the 9% slice
  // visible.
  // ------------------------------------------------------------------
  function variation_bars(container) {
    const W = 720, H = 240;
    const margin = { top: 18, right: 28, bottom: 38, left: 110 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      // data: [{variable, between_pct, within_pct}, ...]
      const y = d3.scaleBand().domain(data.map(d => d.variable))
        .range([0, h]).padding(0.30);
      const x = d3.scaleLinear().domain([0, 100]).range([0, w]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d => d + "%"))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      data.forEach(d => {
        const yc = y(d.variable);
        // Between (steel) on the left
        g.append("rect").attr("x", 0).attr("y", yc)
          .attr("width", x(d.between_pct)).attr("height", y.bandwidth())
          .attr("fill", C.steel).attr("opacity", 0.85);
        // Within (orange) on the right
        g.append("rect").attr("x", x(d.between_pct)).attr("y", yc)
          .attr("width", x(d.within_pct)).attr("height", y.bandwidth())
          .attr("fill", C.orange).attr("opacity", 0.95);
        // Variable label
        g.append("text").attr("x", -10).attr("y", yc + y.bandwidth() / 2 + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(d.variable);
        // Within percentage label
        if (d.within_pct > 5) {
          g.append("text")
            .attr("x", x(d.between_pct) + Math.min(x(d.within_pct) / 2, 30))
            .attr("y", yc + y.bandwidth() / 2 + 4)
            .attr("text-anchor", "middle").attr("fill", "#0f1729")
            .attr("font-size", 11).attr("font-weight", 700)
            .text(`${d.within_pct.toFixed(1)}%`);
        } else {
          g.append("text")
            .attr("x", x(d.between_pct) + 6).attr("y", yc + y.bandwidth() / 2 + 4)
            .attr("text-anchor", "start").attr("fill", C.orange)
            .attr("font-size", 11).attr("font-weight", 700)
            .text(`${d.within_pct.toFixed(1)}% within`);
        }
        // Between% label inside
        g.append("text")
          .attr("x", x(d.between_pct) - 6).attr("y", yc + y.bandwidth() / 2 + 4)
          .attr("text-anchor", "end").attr("fill", "#0f1729")
          .attr("font-size", 11).attr("font-weight", 700)
          .text(`${d.between_pct.toFixed(1)}% between`);
      });

      // Legend
      g.append("rect").attr("x", w - 220).attr("y", -14).attr("width", 10).attr("height", 10).attr("fill", C.steel);
      g.append("text").attr("x", w - 206).attr("y", -5).attr("fill", C.text).attr("font-size", 11)
        .text("between (across workers)");
      g.append("rect").attr("x", w - 90).attr("y", -14).attr("width", 10).attr("height", 10).attr("fill", C.orange);
      g.append("text").attr("x", w - 76).attr("y", -5).attr("fill", C.text).attr("font-size", 11)
        .text("within (over time)");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // panel_scatter (Tab 2) — simulated worker panel as colored dots (one
  // color per worker) with two regression lines: POLS (orange) and FE
  // (teal). True beta is dashed grey.
  // ------------------------------------------------------------------
  function panel_scatter(container) {
    const W = 720, H = 380;
    const margin = { top: 20, right: 24, bottom: 50, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const root = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      root.selectAll("*").remove();
      const x = d3.scaleLinear().domain(data.xRange).range([0, w]);
      const y = d3.scaleLinear().domain(data.yRange).range([h, 0]);

      root.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      root.append("g").call(d3.axisLeft(y).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      root.selectAll(".domain, .tick line").attr("stroke", C.muted);

      root.append("text")
        .attr("transform", `translate(${w / 2},${h + 38})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Treatment x (continuous, jitter applied)");
      root.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Outcome y");

      // Worker dots
      const colorScale = d3.scaleSequential(d3.interpolateCool).domain([0, data.nWorkers]);
      root.selectAll("circle.pt").data(data.points).enter().append("circle")
        .attr("class", "pt")
        .attr("cx", d => x(d[0])).attr("cy", d => y(d[1]))
        .attr("r", 3)
        .attr("fill", d => colorScale(d[2]))
        .attr("opacity", 0.55);

      // Connect each worker's two periods with a thin line so the within
      // segments are visible (teal slope lives "inside" these lines).
      const grouped = d3.group(data.points, d => d[2]);
      grouped.forEach((pts) => {
        if (pts.length < 2) return;
        const sorted = [...pts].sort((a, b) => a[3] - b[3]);
        root.append("line")
          .attr("x1", x(sorted[0][0])).attr("y1", y(sorted[0][1]))
          .attr("x2", x(sorted[1][0])).attr("y2", y(sorted[1][1]))
          .attr("stroke", colorScale(sorted[0][2])).attr("stroke-width", 1)
          .attr("opacity", 0.45);
      });

      const grid = d3.range(data.xRange[0], data.xRange[1] + 1e-6,
        (data.xRange[1] - data.xRange[0]) / 80);
      const lineGen = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveLinear);

      function drawCurve(intercept, slope, color, dash, label, lwidth) {
        const pts = grid.map(xv => [xv, intercept + slope * xv]);
        root.append("path")
          .attr("d", lineGen(pts))
          .attr("fill", "none").attr("stroke", color).attr("stroke-width", lwidth || 2)
          .attr("stroke-dasharray", dash || null).attr("opacity", 0.95);
        root.append("text")
          .attr("x", x(grid[grid.length - 1])).attr("y", y(pts[pts.length - 1][1]) - 6)
          .attr("fill", color).attr("font-size", 11).attr("text-anchor", "end")
          .text(label);
      }
      drawCurve(data.truth_intercept, data.truth_slope,
                C.muted, "6 4", `true beta = ${data.truth_slope.toFixed(2)}`, 1.8);
      drawCurve(data.pols_intercept, data.pols_slope,
                C.orange, null, `POLS = ${data.pols_slope.toFixed(3)}`, 2.2);
      drawCurve(data.fe_intercept, data.fe_slope,
                C.teal, null, `FE = ${data.fe_slope.toFixed(3)}`, 2.2);
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // beta_histograms (Tab 2 100-sim button) — two-method histogram of beta-hat
  // with truth line. POLS = orange, FE = teal.
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
      const all = data.beta_pols.concat(data.beta_fe);
      if (all.length === 0) return;
      const ext = d3.extent(all);
      const span = Math.max(0.25, ext[1] - ext[0]);
      const pad = span * 0.06;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const nBins = 24;
      const bin = d3.bin().domain(x.domain()).thresholds(nBins);
      const binsP = bin(data.beta_pols);
      const binsF = bin(data.beta_fe);
      const maxC = d3.max(binsP.concat(binsF), d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      function drawBars(bins, color, opacity) {
        g.selectAll(null).data(bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", color).attr("opacity", opacity);
      }
      drawBars(binsP, C.orange, 0.65);
      drawBars(binsF, C.teal,   0.85);

      g.append("line").attr("x1", x(data.beta_true)).attr("x2", x(data.beta_true))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.beta_true) + 4).attr("y", 12)
        .attr("fill", C.steel).attr("font-size", 11)
        .text(`true beta = ${data.beta_true.toFixed(2)}`);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated beta across 100 simulated panels  ·  orange = POLS, teal = FE");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // forest_plot (Tab 3) — multi-method horizontal CI bars, faceted by
  // outcome. The 6-method comparison is the post's headline figure.
  // ------------------------------------------------------------------
  function forest_plot(container) {
    const W = 720;
    const margin = { top: 30, right: 60, bottom: 36, left: 140 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 360`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const METHOD_COLOR = {
      "POLS":    C.muted,
      "Between": C.steel,
      "FDFE":    "#c4623d",
      "FE":      C.orange,
      "TWFE":    "#e8956a",
      "RE":      C.teal,
      "CRE":     "#66e8df",
    };

    function update(estimates, activeMethods, activeOutcomes) {
      const filtered = estimates.filter(d =>
        activeMethods.includes(d.method) && activeOutcomes.includes(d.outcome));
      if (filtered.length === 0) {
        svg.selectAll("g.facet").remove();
        svg.selectAll("text.empty").remove();
        svg.append("text").attr("class", "empty").attr("x", W / 2).attr("y", 180)
          .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 14)
          .text("Select at least one outcome and one method");
        return;
      }
      svg.selectAll("text.empty").remove();
      const outcomes = activeOutcomes.filter(o => filtered.some(d => d.outcome === o));
      const rowH = 26;
      const facetGap = 36;

      let totalH = margin.top;
      const facetMeta = outcomes.map(o => {
        const rows = filtered.filter(d => d.outcome === o);
        const meta = { o, rows, top: totalH, h: rowH * rows.length + 44 };
        totalH += meta.h + facetGap;
        return meta;
      });
      totalH += margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet").remove();

      const w = W - margin.left - margin.right;
      const xExt = d3.extent(filtered.flatMap(d => [d.ci_lo, d.ci_hi]));
      const span = Math.max(0.05, xExt[1] - xExt[0]);
      const xPad = span * 0.10;
      const xDomain = [xExt[0] - xPad, xExt[1] + xPad];
      const x = d3.scaleLinear().domain(xDomain).range([0, w]);

      facetMeta.forEach(meta => {
        const g = svg.append("g").attr("class", "facet")
          .attr("transform", `translate(${margin.left},${meta.top})`);

        g.append("text").attr("x", -8).attr("y", -8)
          .attr("text-anchor", "end").attr("fill", C.text)
          .attr("font-size", 13).attr("font-weight", 600)
          .text(meta.o);

        g.append("line").attr("x1", x(0)).attr("x2", x(0))
          .attr("y1", 0).attr("y2", meta.h - 30)
          .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 3");

        meta.rows.forEach((d, i) => {
          const yc = i * rowH + rowH / 2;
          const color = METHOD_COLOR[d.method] || C.steel;
          g.append("text").attr("x", -8).attr("y", yc + 4)
            .attr("text-anchor", "end").attr("fill", C.muted).attr("font-size", 11)
            .text(d.method);
          g.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
            .attr("y1", yc).attr("y2", yc)
            .attr("stroke", color).attr("stroke-width", 3).attr("opacity", 0.85);
          g.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
            .attr("y1", yc - 5).attr("y2", yc + 5).attr("stroke", color).attr("stroke-width", 2);
          g.append("line").attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
            .attr("y1", yc - 5).attr("y2", yc + 5).attr("stroke", color).attr("stroke-width", 2);
          g.append("circle").attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
            .attr("fill", color).attr("stroke", "#0f1729").attr("stroke-width", 1.5);
          g.append("text").attr("x", w + 6).attr("y", yc + 4)
            .attr("fill", C.text).attr("font-size", 11)
            .text(d.estimate.toFixed(3));
          g.append("title")
            .text(`${d.method} on ${d.outcome}\nbeta = ${d.estimate.toFixed(4)}\nSE = ${d.se.toFixed(4)}\n95% CI = [${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]\nn = ${d.n_selected}`);
        });

        g.append("g").attr("transform", `translate(0,${meta.h - 28})`)
          .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format(".3f")))
          .selectAll("text").attr("fill", C.muted);
        g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // hausman_explorer (Tab 4) — chi-square(1) density with the Hausman
  // statistic and a shaded p-value tail. User-controlled inputs (beta_FE,
  // beta_RE, V_FE, V_RE) drive the H computation.
  // ------------------------------------------------------------------
  function hausman_explorer(container) {
    const W = 720, H = 320;
    const margin = { top: 28, right: 28, bottom: 50, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function chi2Pdf1(x) {
      if (x <= 0) return 0;
      return Math.exp(-x / 2) / Math.sqrt(2 * Math.PI * x);
    }

    function update(state) {
      g.selectAll("*").remove();
      const x = d3.scaleLinear().domain([0, 12]).range([0, w]);
      const grid = d3.range(0.05, 12, 0.05);
      const ys = grid.map(chi2Pdf1);
      const yMax = 0.7;
      const y = d3.scaleLinear().domain([0, yMax]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(4))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Hausman statistic H ~ chi-square(1)");

      const lineGen = d3.line().x((_, i) => x(grid[i]))
        .y(d => y(Math.min(yMax, d))).curve(d3.curveMonotoneX);
      g.append("path").attr("d", lineGen(ys))
        .attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2);

      const Hclip = Math.min(12, Math.max(0.001, state.H));
      const tailGrid = d3.range(Hclip, 12, 0.05);
      if (tailGrid.length > 1) {
        const area = d3.area()
          .x((_, i) => x(tailGrid[i]))
          .y0(y(0))
          .y1(d => y(Math.min(yMax, chi2Pdf1(d))))
          .curve(d3.curveMonotoneX);
        g.append("path").attr("d", area(tailGrid))
          .attr("fill", C.orange).attr("opacity", 0.35);
      }

      g.append("line")
        .attr("x1", x(Hclip)).attr("x2", x(Hclip))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.orange).attr("stroke-width", 2);
      g.append("text").attr("x", x(Hclip) + 6).attr("y", 12)
        .attr("fill", C.orange).attr("font-size", 12).attr("font-weight", 600)
        .text(`H = ${state.H.toFixed(3)}  ·  p = ${state.p.toFixed(4)}`);

      const crit = 3.841;
      g.append("line")
        .attr("x1", x(crit)).attr("x2", x(crit))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.muted).attr("stroke-width", 1).attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", x(crit) + 4).attr("y", h - 10)
        .attr("fill", C.muted).attr("font-size", 11)
        .text("5% critical (3.84)");
    }
    return { update };
  }

  window.CHARTS = {
    within_animation,
    variation_bars,
    panel_scatter,
    beta_histograms,
    forest_plot,
    hausman_explorer,
    C,
  };
})();
