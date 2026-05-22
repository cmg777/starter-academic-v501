// charts.js — D3 chart builders for the ESDA web app.
//
// Builders return { update(...) } so subsequent slider changes patch the
// existing SVG rather than re-creating it.

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
    hh:    "#d7191c",  // High-High (hot spot)
    ll:    "#2c7bb6",  // Low-Low  (cold spot)
    hl:    "#fdae61",  // High-Low outlier
    lh:    "#89cff0",  // Low-High outlier
    ns:    "#bababa",  // Not significant
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
  // L1 vs L2 animation kept for compatibility with the smoke test /
  // any future tab that needs it.
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
    g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(6)).selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(5)).selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, line").attr("stroke", C.muted);
  }

  // ------------------------------------------------------------------
  // Moran clustering animation (Tab 1 intro).
  //   Shows two small region grids (3x3) — one with random shading and
  //   one with clustered (autocorrelated) shading — to visualise what
  //   positive spatial autocorrelation looks like. Loops through three
  //   levels of autocorrelation strength.
  // ------------------------------------------------------------------
  function moran_clustering_animation(container) {
    const W = 720, H = 320;
    const svg = ensureSVG(container, W, H);
    // Two side-by-side 6x6 grids.
    const grid_n = 6;
    const cell = 36;
    const padCell = 4;
    const gridW = grid_n * (cell + padCell);
    const totalGrid = 2 * gridW + 80;
    const offsetX = (W - totalGrid) / 2;
    const offsetY = (H - grid_n * (cell + padCell)) / 2;

    // Static "random" grid (left). Fixed once.
    function randSeed(seed) {
      let s = seed >>> 0;
      return function () {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
      };
    }
    const rng = randSeed(7);
    const randVals = [];
    for (let i = 0; i < grid_n * grid_n; i++) randVals.push(rng());

    // Clustered grid (right). Generated to maximise positive autocorrelation
    // by mostly making the top-left half "high" and the bottom-right half "low",
    // with a smooth gradient. We animate the strength of the gradient.
    function clusteredVals(strength) {
      const out = [];
      for (let r = 0; r < grid_n; r++) {
        for (let c = 0; c < grid_n; c++) {
          // Base gradient (clustered): from corner.
          const grad = (1 - r / (grid_n - 1)) * 0.7 + (1 - c / (grid_n - 1)) * 0.3;
          // Mix with random noise; strength = 0 gives near-random, 1 gives pure cluster.
          const noise = randVals[r * grid_n + c];
          out.push(strength * grad + (1 - strength) * noise);
        }
      }
      return out;
    }

    const color = d3.scaleSequential(d3.interpolateRdBu).domain([1, 0]); // high=red, low=blue

    // Containers.
    const leftG = svg.append("g").attr("transform", `translate(${offsetX},${offsetY})`);
    const rightG = svg.append("g").attr("transform", `translate(${offsetX + gridW + 80},${offsetY})`);

    leftG.append("text").attr("x", gridW / 2).attr("y", -10).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600)
      .text("Random (I ≈ 0)");
    rightG.append("text").attr("x", gridW / 2).attr("y", -10).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600)
      .text("Clustered (I → 1)");

    // Draw random grid (static).
    for (let r = 0; r < grid_n; r++) {
      for (let c = 0; c < grid_n; c++) {
        leftG.append("rect")
          .attr("x", c * (cell + padCell)).attr("y", r * (cell + padCell))
          .attr("width", cell).attr("height", cell)
          .attr("rx", 4).attr("fill", color(randVals[r * grid_n + c]));
      }
    }

    // Draw clustered grid (animated).
    const rightCells = [];
    for (let r = 0; r < grid_n; r++) {
      for (let c = 0; c < grid_n; c++) {
        rightCells.push(rightG.append("rect")
          .attr("x", c * (cell + padCell)).attr("y", r * (cell + padCell))
          .attr("width", cell).attr("height", cell)
          .attr("rx", 4));
      }
    }

    // Caption with current "strength" / I value.
    const cap = svg.append("text")
      .attr("x", W / 2).attr("y", H - 12)
      .attr("text-anchor", "middle")
      .attr("fill", C.muted).attr("font-size", 12);

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      // Strength oscillates 0 -> 1 -> 0 with period ~8s.
      const strength = (Math.sin(elapsed * 0.78) + 1) / 2;
      const vals = clusteredVals(strength);
      for (let i = 0; i < vals.length; i++) {
        rightCells[i].attr("fill", color(vals[i]));
      }
      cap.text(`Strength = ${strength.toFixed(2)} — sliding from random to fully clustered`);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Moran scatter (Tab 2 LASSO Lab analog).
  //   Plots z_i (standardized value) vs Wz_i (spatial lag), with
  //   the four quadrants labelled (HH, LH, LL, HL) and a regression line
  //   whose slope is Moran's I.
  //
  //   data: { z: Float64Array, wz: Float64Array, moranI: number, quadrants: Int8Array (1=HH,2=LH,3=LL,4=HL) }
  // ------------------------------------------------------------------
  function moran_scatter(container) {
    const W = 720, H = 420;
    const margin = { top: 28, right: 24, bottom: 48, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const quadColor = { 1: C.hh, 2: C.lh, 3: C.ll, 4: C.hl };

    function update(data) {
      g.selectAll("*").remove();
      const { z, wz, moranI, quadrants } = data;
      const n = z.length;
      if (n === 0) return;

      const absZ = Math.max(Math.abs(d3.min(z)), Math.abs(d3.max(z))) || 1;
      const absWz = Math.max(Math.abs(d3.min(wz)), Math.abs(d3.max(wz))) || 1;
      const ext = Math.max(absZ, absWz) * 1.1;
      const x = d3.scaleLinear().domain([-ext, ext]).range([0, w]);
      const y = d3.scaleLinear().domain([-ext, ext]).range([h, 0]);

      // Quadrant fills (very faint).
      const halfW = x(0);
      const halfH = y(0);
      g.append("rect").attr("x", halfW).attr("y", 0).attr("width", w - halfW).attr("height", halfH).attr("fill", C.hh).attr("opacity", 0.06);
      g.append("rect").attr("x", 0).attr("y", 0).attr("width", halfW).attr("height", halfH).attr("fill", C.lh).attr("opacity", 0.06);
      g.append("rect").attr("x", 0).attr("y", halfH).attr("width", halfW).attr("height", h - halfH).attr("fill", C.ll).attr("opacity", 0.06);
      g.append("rect").attr("x", halfW).attr("y", halfH).attr("width", w - halfW).attr("height", h - halfH).attr("fill", C.hl).attr("opacity", 0.06);

      // Quadrant lines at zero.
      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h).attr("stroke", C.muted).attr("stroke-dasharray", "3 4").attr("opacity", 0.6);
      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", C.muted).attr("stroke-dasharray", "3 4").attr("opacity", 0.6);

      // Quadrant labels.
      const pad = 14;
      g.append("text").attr("x", w - pad).attr("y", pad + 4).attr("text-anchor", "end").attr("fill", C.hh).attr("font-size", 14).attr("font-weight", 700).text("HH");
      g.append("text").attr("x", pad).attr("y", pad + 4).attr("text-anchor", "start").attr("fill", C.lh).attr("font-size", 14).attr("font-weight", 700).text("LH");
      g.append("text").attr("x", pad).attr("y", h - pad).attr("text-anchor", "start").attr("fill", C.ll).attr("font-size", 14).attr("font-weight", 700).text("LL");
      g.append("text").attr("x", w - pad).attr("y", h - pad).attr("text-anchor", "end").attr("fill", C.hl).attr("font-size", 14).attr("font-weight", 700).text("HL");

      // Axes.
      g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".1f"))).selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".1f"))).selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text").attr("transform", `translate(${w / 2},${h + 36})`).attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12).text("z_i  (standardized region value)");
      g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-42})`).attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12).text("W·z_i  (spatial lag of neighbours)");

      // Regression line through origin with slope = moranI.
      const xR0 = -ext, xR1 = ext;
      g.append("line").attr("x1", x(xR0)).attr("y1", y(moranI * xR0)).attr("x2", x(xR1)).attr("y2", y(moranI * xR1))
        .attr("stroke", C.orange).attr("stroke-width", 2);
      g.append("text").attr("x", w - 8).attr("y", y(moranI * xR1) - 8).attr("text-anchor", "end")
        .attr("fill", C.orange).attr("font-size", 12).attr("font-weight", 600)
        .text(`Moran's I = ${moranI.toFixed(3)}`);

      // Points.
      for (let i = 0; i < n; i++) {
        const q = quadrants ? quadrants[i] : 0;
        const fill = q ? quadColor[q] : C.steel;
        g.append("circle").attr("cx", x(z[i])).attr("cy", y(wz[i])).attr("r", 4)
          .attr("fill", fill).attr("opacity", 0.75)
          .attr("stroke", "rgba(0,0,0,0.4)").attr("stroke-width", 0.5);
      }
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // LISA cluster counts bar chart (Tab 3).
  //   Stacked vertical bars showing how many regions fall into HH/LL/HL/LH/ns
  //   for the current simulation, alongside the post's reported counts for
  //   2013 and 2019 as horizontal reference markers.
  // ------------------------------------------------------------------
  function lisa_bars(container) {
    const W = 720, H = 280;
    const margin = { top: 28, right: 16, bottom: 36, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const cats = ["HH", "LL", "HL", "LH", "ns"];
      const sim = data.sim;       // {HH, LL, HL, LH, ns}
      const colorMap = { HH: C.hh, LL: C.ll, HL: C.hl, LH: C.lh, ns: C.ns };

      const allVals = cats.map(k => sim[k]);
      const maxV = d3.max(allVals) || 1;
      const x = d3.scaleBand().domain(cats).range([0, w]).padding(0.25);
      const y = d3.scaleLinear().domain([0, maxV * 1.18]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0)).selectAll("text").attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600);
      g.append("g").call(d3.axisLeft(y).ticks(5)).selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-36})`).attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12).text("Number of regions");

      cats.forEach(cat => {
        const xc = x(cat);
        const bw = x.bandwidth();
        const v = sim[cat];
        g.append("rect")
          .attr("x", xc).attr("y", y(v))
          .attr("width", bw).attr("height", h - y(v))
          .attr("fill", colorMap[cat]).attr("opacity", 0.85);
        g.append("text")
          .attr("x", xc + bw / 2).attr("y", y(v) - 6)
          .attr("text-anchor", "middle")
          .attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600)
          .text(v);
      });

      // Legend.
      const legend = g.append("g").attr("transform", `translate(${w - 200},${4})`);
      legend.append("text").attr("fill", C.muted).attr("font-size", 11).attr("x", 0).attr("y", 0).text(`n_regions = ${data.n} · ρ = ${data.rho.toFixed(2)}`);
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Moran forest plot (Tab 4).
  //   Horizontal bars: estimate (Moran's I), with 95% CI from the
  //   permutation distribution. One row per (outcome, year) combo.
  //
  //   data: array of { method, outcome, estimate, ci_lo, ci_hi, se, n_selected }
  //   activeOutcomes: array of outcome strings to filter on.
  // ------------------------------------------------------------------
  function forest_plot(container) {
    const W = 880;
    const margin = { top: 28, right: 24, bottom: 36, left: 200 };
    const colorMap = {
      "Moran's I 2013":      C.steel,
      "Moran's I 2019":      C.orange,
      "Moran's I (change)":  C.teal,
      "Permutation null":    C.muted,
    };

    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 360`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(data, activeOutcomes, activeMethods) {
      const outcomes = activeOutcomes && activeOutcomes.length ? activeOutcomes
        : Array.from(new Set(data.map(d => d.outcome)));
      const methods = activeMethods && activeMethods.length ? activeMethods
        : Array.from(new Set(data.map(d => d.method)));
      const rows = data.filter(d => outcomes.includes(d.outcome) && methods.includes(d.method));
      if (rows.length === 0) {
        svg.selectAll("*").remove();
        svg.append("text").attr("x", W / 2).attr("y", 60).attr("text-anchor", "middle")
          .attr("fill", C.muted).attr("font-size", 13).text("No estimates match the current selection.");
        return;
      }
      // Group rows by outcome row (so we render one row per (outcome, method)).
      const rowH = 28;
      const totalH = margin.top + rows.length * rowH + margin.bottom + 20;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("*").remove();

      const xExt = d3.extent(rows.flatMap(d => [d.ci_lo, d.ci_hi]));
      const xMin = Math.min(0, xExt[0]);
      const xMax = Math.max(0, xExt[1]);
      const pad = (xMax - xMin) * 0.1;
      const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, W - margin.left - margin.right]);

      const plotG = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      // Zero line.
      const w = W - margin.left - margin.right;
      plotG.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", rows.length * rowH)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      // Axis.
      plotG.append("g").attr("transform", `translate(0,${rows.length * rowH})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      plotG.selectAll(".domain, .tick line").attr("stroke", C.muted);
      plotG.append("text").attr("x", w / 2).attr("y", rows.length * rowH + 30).attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12).text("Moran's I (with 95% permutation CI)");

      rows.forEach((d, i) => {
        const yc = i * rowH + rowH / 2;
        const col = colorMap[d.method] || C.steel;
        // Row label.
        svg.append("text")
          .attr("x", margin.left - 12).attr("y", margin.top + yc + 4)
          .attr("text-anchor", "end")
          .attr("fill", C.text).attr("font-size", 12)
          .text(`${d.outcome} · ${d.method}`);
        // CI.
        plotG.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc)
          .attr("stroke", col).attr("stroke-width", 2);
        plotG.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo)).attr("y1", yc - 4).attr("y2", yc + 4).attr("stroke", col).attr("stroke-width", 2);
        plotG.append("line").attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi)).attr("y1", yc - 4).attr("y2", yc + 4).attr("stroke", col).attr("stroke-width", 2);
        const dot = plotG.append("circle")
          .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
          .attr("fill", col).attr("stroke", "#fff").attr("stroke-width", 1)
          .style("cursor", "pointer");
        dot.on("mousemove", function (ev) {
          const rect = container.getBoundingClientRect();
          tooltip.html(
            `<div><strong style="color:${col}">${d.method}</strong></div>` +
            `<div><span class='tooltip-key'>outcome:</span> <span class='tooltip-val'>${d.outcome}</span></div>` +
            `<div><span class='tooltip-key'>I =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>` +
            `<div><span class='tooltip-key'>permutation p =</span> <span class='tooltip-val'>${d.n_selected === null ? "—" : d.n_selected}</span></div>`
          )
          .classed("show", true)
          .style("left", (ev.clientX - rect.left + 12) + "px")
          .style("top", (ev.clientY - rect.top + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Selection-bars stub (kept for compatibility with template / tests).
  // Not used in the ESDA app, but exposing the function name avoids
  // accidental breakage of any cross-app code that calls into CHARTS.
  // ------------------------------------------------------------------
  function selection_bars(container) {
    const svg = ensureSVG(container, 600, 100);
    svg.append("text").attr("x", 300).attr("y", 50).attr("text-anchor", "middle")
      .attr("fill", C.muted).attr("font-size", 12)
      .text("(selection bars not used in this app)");
    return { update: function () {} };
  }

  function alpha_compare(container) {
    const svg = ensureSVG(container, 600, 100);
    return { update: function () {} };
  }

  function alpha_histograms(container) {
    const svg = ensureSVG(container, 600, 100);
    return { update: function () {} };
  }

  window.CHARTS = {
    l1_vs_l2_animation,
    moran_clustering_animation,
    moran_scatter,
    lisa_bars,
    forest_plot,
    selection_bars,
    alpha_compare,
    alpha_histograms,
    C,
  };
})();
