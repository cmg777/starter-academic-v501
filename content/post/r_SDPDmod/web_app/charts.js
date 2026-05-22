// charts.js — D3 chart builders for the SDPDmod web app.
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
  // Spatial ring animation (Tab 1).
  //   12 states arranged on a circular ring (queen contiguity: each state
  //   has 2 neighbours, the previous and next). One state receives a unit
  //   shock; each frame plays one round of the geometric series I + ρW +
  //   ρ²W² + ... = (I−ρW)⁻¹. The bars show the per-state accumulated impact.
  // ------------------------------------------------------------------
  function spatial_ring_animation(container) {
    const W = 760, H = 360;
    const margin = { top: 16, right: 24, bottom: 36, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);

    // Top half: ring of states. Bottom half: bars.
    const ringH = 170;
    const barsH = h - ringH;

    const N_STATES = 12;
    const shockedState = 0;

    // Build row-normalised W for a 12-cycle (each state's 2 neighbours have weight 0.5).
    const W_row = [];
    for (let i = 0; i < N_STATES; i++) {
      const row = new Float64Array(N_STATES);
      const prev = (i - 1 + N_STATES) % N_STATES;
      const next = (i + 1) % N_STATES;
      row[prev] = 0.5;
      row[next] = 0.5;
      W_row.push(row);
    }

    // Ring centres
    const ringCx = margin.left + w * 0.5;
    const ringCy = margin.top + ringH * 0.5;
    const ringR = Math.min(w * 0.3, ringH * 0.42);
    const ringPositions = [];
    for (let i = 0; i < N_STATES; i++) {
      const a = (i / N_STATES) * 2 * Math.PI - Math.PI / 2;
      ringPositions.push({ x: ringCx + ringR * Math.cos(a), y: ringCy + ringR * Math.sin(a) });
    }

    const ringG = svg.append("g").attr("class", "ring");
    const barsG = svg.append("g").attr("transform", `translate(${margin.left},${margin.top + ringH})`);

    // Draw connecting lines for the ring (neighbour edges).
    for (let i = 0; i < N_STATES; i++) {
      const a = ringPositions[i];
      const b = ringPositions[(i + 1) % N_STATES];
      ringG.append("line")
        .attr("x1", a.x).attr("y1", a.y).attr("x2", b.x).attr("y2", b.y)
        .attr("stroke", C.faint).attr("stroke-width", 1);
    }

    // State circles & labels
    const circles = [];
    const labels = [];
    for (let i = 0; i < N_STATES; i++) {
      const c = ringG.append("circle")
        .attr("cx", ringPositions[i].x).attr("cy", ringPositions[i].y)
        .attr("r", 14)
        .attr("fill", C.panel).attr("stroke", C.muted).attr("stroke-width", 1.5);
      circles.push(c);
      const t = ringG.append("text")
        .attr("x", ringPositions[i].x).attr("y", ringPositions[i].y + 4)
        .attr("text-anchor", "middle")
        .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
        .text(i === shockedState ? "★" : (i + 1));
      labels.push(t);
    }

    // Bars
    const xScale = d3.scaleBand().domain(d3.range(N_STATES)).range([0, w]).padding(0.25);
    const yScale = d3.scaleLinear().domain([0, 1.6]).range([barsH - 36, 8]);
    barsG.append("g")
      .attr("transform", `translate(0,${barsH - 36})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `state ${d + 1}`))
      .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
    const yAxisG = barsG.append("g").call(d3.axisLeft(yScale).ticks(5));
    yAxisG.selectAll("text").attr("fill", C.muted);
    barsG.selectAll(".domain, .tick line").attr("stroke", C.muted);
    barsG.append("text")
      .attr("transform", `rotate(-90) translate(${-(barsH - 36) / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Cumulative response Δy_i");
    barsG.append("text")
      .attr("transform", `translate(${w / 2},${barsH - 4})`)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
      .text("12-state ring · ★ = shocked state");

    const bars = [];
    for (let i = 0; i < N_STATES; i++) {
      const r = barsG.append("rect")
        .attr("x", xScale(i)).attr("width", xScale.bandwidth())
        .attr("y", yScale(0)).attr("height", 0)
        .attr("fill", i === shockedState ? C.orange : C.steel)
        .attr("opacity", 0.85);
      bars.push(r);
    }

    // State 'impact' vector ∑ (ρW)^k · e_shocked, accumulated.
    const y = new Float64Array(N_STATES);
    let prevPower = new Float64Array(N_STATES);
    let kStep = 0;
    let rho = 0.30;
    let speed = 1.0;
    let timer = null;

    function reset() {
      y.fill(0);
      prevPower.fill(0);
      prevPower[shockedState] = 1;
      y[shockedState] = 1;
      kStep = 0;
      render();
    }

    function step() {
      // newPower = ρ · W · prevPower
      const newPower = new Float64Array(N_STATES);
      for (let i = 0; i < N_STATES; i++) {
        let s = 0;
        for (let j = 0; j < N_STATES; j++) s += W_row[i][j] * prevPower[j];
        newPower[i] = rho * s;
      }
      for (let i = 0; i < N_STATES; i++) y[i] += newPower[i];
      prevPower = newPower;
      kStep++;
      render();
      // Stop when changes are tiny or after many rounds.
      const maxChange = d3.max(prevPower, v => Math.abs(v));
      if (maxChange < 1e-4 || kStep > 80) {
        clearInterval(timer);
        timer = null;
      }
    }

    function render() {
      const yMax = Math.max(1.6, d3.max(y) * 1.1);
      yScale.domain([0, yMax]);
      yAxisG.call(d3.axisLeft(yScale).ticks(5));
      yAxisG.selectAll("text").attr("fill", C.muted);
      barsG.selectAll(".domain, .tick line").attr("stroke", C.muted);
      for (let i = 0; i < N_STATES; i++) {
        bars[i].attr("y", yScale(y[i])).attr("height", yScale(0) - yScale(y[i]));
        const r = 14 + Math.min(10, y[i] * 6);
        circles[i].attr("r", r)
          .attr("stroke", i === shockedState ? C.orange : (y[i] > 0.05 ? C.teal : C.muted));
      }
    }

    function start() {
      if (timer) clearInterval(timer);
      reset();
      timer = setInterval(step, 700 / speed);
    }

    function setRho(newRho) {
      rho = +newRho;
      start();
    }
    function setSpeed(newSpeed) {
      speed = +newSpeed;
      if (timer) {
        clearInterval(timer);
        timer = setInterval(step, 700 / speed);
      }
    }

    start();
    return { setRho, setSpeed, restart: start };
  }

  // ------------------------------------------------------------------
  // Coefficient-recovery chart (Tab 2).
  //   Bars: true value (steel) vs three estimators (non-spatial, static SDM,
  //   dynamic SDM) for each of {ρ, τ, β, φ}.
  // ------------------------------------------------------------------
  function coef_recovery(container) {
    const W = 760, H = 280;
    const margin = { top: 24, right: 24, bottom: 60, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      // data: { params: [{name, true, fe, ssdm, dsdm}, ...] }
      const params = data.params;
      const groups = params.map(p => p.name);
      const series = ["true", "fe", "ssdm", "dsdm"];
      const seriesLabel = {
        true: "True value", fe: "Non-spatial FE", ssdm: "Static SDM (LY)", dsdm: "Dynamic SDM (LY)",
      };
      const seriesColor = {
        true: C.muted, fe: "#9bdcc3", ssdm: C.steel, dsdm: C.orange,
      };
      const x0 = d3.scaleBand().domain(groups).range([0, w]).padding(0.18);
      const x1 = d3.scaleBand().domain(series).range([0, x0.bandwidth()]).padding(0.08);
      const allVals = [];
      params.forEach(p => series.forEach(s => {
        const v = p[s];
        if (Number.isFinite(v)) allVals.push(v);
      }));
      const ext = d3.extent(allVals.concat([0]));
      const pad = Math.max(0.05, (ext[1] - ext[0]) * 0.1);
      const y = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${y(0)})`)
        .call(d3.axisBottom(x0).tickSize(0))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 11).attr("dy", "1.2em");
      g.append("g").call(d3.axisLeft(y).ticks(6))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Zero line.
      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      params.forEach(p => {
        const gx0 = x0(p.name);
        series.forEach(s => {
          const v = p[s];
          if (!Number.isFinite(v)) return;
          const bx = gx0 + x1(s);
          const bw = x1.bandwidth();
          const yV = y(v);
          const yZ = y(0);
          g.append("rect")
            .attr("x", bx).attr("y", Math.min(yV, yZ))
            .attr("width", bw).attr("height", Math.abs(yV - yZ))
            .attr("fill", seriesColor[s])
            .attr("opacity", s === "true" ? 0.45 : 0.85);
          g.append("text")
            .attr("x", bx + bw / 2)
            .attr("y", v >= 0 ? yV - 3 : yV + 11)
            .attr("text-anchor", "middle")
            .attr("fill", C.text).attr("font-size", 9).attr("font-variant-numeric", "tabular-nums")
            .text(v.toFixed(2));
        });
      });

      // Legend.
      const lg = g.append("g").attr("transform", `translate(0,${h + 30})`);
      let lx = 0;
      series.forEach(s => {
        lg.append("rect").attr("x", lx).attr("y", 0).attr("width", 12).attr("height", 12)
          .attr("fill", seriesColor[s]).attr("opacity", s === "true" ? 0.45 : 0.85);
        lg.append("text").attr("x", lx + 16).attr("y", 10)
          .attr("fill", C.muted).attr("font-size", 11).text(seriesLabel[s]);
        lx += 140;
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Monte-Carlo bias histogram (Tab 2 — 100 reps).
  // ------------------------------------------------------------------
  function mc_histograms(container) {
    const W = 760, H = 280;
    const margin = { top: 20, right: 24, bottom: 56, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const sets = [
        { name: "Non-spatial FE", vals: data.fe,   color: "#9bdcc3" },
        { name: "Static SDM",     vals: data.ssdm, color: C.steel  },
        { name: "Dynamic SDM",    vals: data.dsdm, color: C.orange },
      ];
      const all = [].concat(...sets.map(s => s.vals));
      if (all.length === 0) {
        g.append("text").attr("x", w / 2).attr("y", h / 2)
          .attr("text-anchor", "middle").attr("fill", C.muted).text("No data — click 'Run 100 Monte-Carlo reps'");
        return;
      }
      const ext = d3.extent(all.concat([data.beta_true]));
      const span = Math.max(0.1, ext[1] - ext[0]);
      const pad = span * 0.08;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const nBins = 22;
      const bin = d3.bin().domain(x.domain()).thresholds(nBins);
      const binSets = sets.map(s => ({ ...s, bins: bin(s.vals) }));
      const maxC = d3.max(binSets, s => d3.max(s.bins, d => d.length)) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      binSets.forEach(s => {
        g.selectAll(null).data(s.bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", s.color).attr("opacity", 0.55);
      });

      // True β line.
      g.append("line").attr("x1", x(data.beta_true)).attr("x2", x(data.beta_true))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.teal).attr("stroke-width", 2).attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", x(data.beta_true) + 4).attr("y", 12)
        .attr("fill", C.teal).attr("font-size", 11).text(`true β = ${data.beta_true.toFixed(2)}`);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("Estimated β̂ across Monte-Carlo replications");

      // Legend.
      const lg = g.append("g").attr("transform", `translate(0,${h + 42})`);
      let lx = 0;
      sets.forEach(s => {
        lg.append("rect").attr("x", lx).attr("y", 0).attr("width", 12).attr("height", 12)
          .attr("fill", s.color).attr("opacity", 0.6);
        lg.append("text").attr("x", lx + 16).attr("y", 10)
          .attr("fill", C.muted).attr("font-size", 11).text(s.name);
        lx += 150;
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Effect-decomposition forest plot (Tab 3).
  //   Rows = (variable × effect_type × model). Faceted by variable.
  //   data: array of { method, outcome, effect_type, estimate, ci_lo, ci_hi, se }
  // ------------------------------------------------------------------
  function decomp_forest(container) {
    const W = 880;
    const margin = { top: 28, right: 28, bottom: 40, left: 170 };
    const facetGap = 28;
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 380`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const colorMap = {
      "Static SDM (LY)":   C.steel,
      "Dyn SDM short-run": C.teal,
      "Dyn SDM long-run":  C.orange,
    };

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(data, activeMethods, activeEffects, activeOutcomes) {
      svg.selectAll("g.facet").remove();
      const outcomes = activeOutcomes.length ? activeOutcomes : ["Price (logp)", "Income (logy)"];
      const methods  = activeMethods.length  ? activeMethods  : ["Static SDM (LY)", "Dyn SDM short-run", "Dyn SDM long-run"];
      const effects  = activeEffects.length  ? activeEffects  : ["Direct", "Indirect", "Total"];

      // Normalise the data: add effect_type = "Direct" if missing.
      const rows = data
        .filter(d => outcomes.includes(d.outcome) && methods.includes(d.method))
        .map(d => ({ ...d, effect_type: d.effect_type || "Direct" }))
        .filter(d => effects.includes(d.effect_type));

      // Row labels: "<effect> · <method>"
      const rowLabel = d => `${d.effect_type} · ${d.method}`;
      const rowKeys = [];
      effects.forEach(e => methods.forEach(m => rowKeys.push(`${e} · ${m}`)));

      const rowH = 22;
      const facetH = rowKeys.length * rowH + 30;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);

      const nFacets = outcomes.length;
      const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / nFacets;

      outcomes.forEach((outcome, oi) => {
        const facet = svg.append("g").attr("class", "facet")
          .attr("transform", `translate(${margin.left + oi * (facetW + facetGap)},${margin.top})`);
        const subset = rows.filter(d => d.outcome === outcome);
        const ext = d3.extent(subset.flatMap(d => [d.ci_lo, d.ci_hi]));
        const xMin = Math.min(0, ext[0] || 0);
        const xMax = Math.max(0, ext[1] || 0);
        const pad = Math.max(0.1, (xMax - xMin) * 0.08);
        const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, facetW]);
        const y = d3.scaleBand().domain(rowKeys).range([0, facetH - 30]).padding(0.25);

        // Title
        facet.append("text").attr("x", facetW / 2).attr("y", -10)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13)
          .attr("font-weight", 600).text(outcome);

        // Zero line
        facet.append("line")
          .attr("x1", x(0)).attr("x2", x(0))
          .attr("y1", 0).attr("y2", facetH - 30)
          .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 4");

        // Effect-group separators (light horizontal lines between effect blocks)
        effects.forEach((e, ei) => {
          if (ei === 0) return;
          const firstKey = `${e} · ${methods[0]}`;
          const yPos = y(firstKey);
          if (yPos != null) {
            facet.append("line").attr("x1", 0).attr("x2", facetW)
              .attr("y1", yPos - 4).attr("y2", yPos - 4)
              .attr("stroke", C.grid);
          }
        });

        // x-axis
        facet.append("g").attr("transform", `translate(0,${facetH - 30})`)
          .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2f")))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

        // Row labels (leftmost facet only)
        if (oi === 0) {
          rowKeys.forEach(k => {
            const [eff, meth] = k.split(" · ");
            svg.append("text").attr("class", "facet")
              .attr("x", margin.left - 10)
              .attr("y", margin.top + y(k) + y.bandwidth() / 2 + 4)
              .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 11)
              .text(k);
          });
        }

        // Plot rows
        subset.forEach(d => {
          const key = rowLabel(d);
          const yc = y(key) + y.bandwidth() / 2;
          if (!Number.isFinite(yc)) return;
          const color = colorMap[d.method] || C.text;
          const g = facet.append("g").style("cursor", "pointer");
          g.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
            .attr("y1", yc).attr("y2", yc)
            .attr("stroke", color).attr("stroke-width", 2);
          g.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
            .attr("y1", yc - 4).attr("y2", yc + 4)
            .attr("stroke", color).attr("stroke-width", 2);
          g.append("line")
            .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
            .attr("y1", yc - 4).attr("y2", yc + 4)
            .attr("stroke", color).attr("stroke-width", 2);
          g.append("circle")
            .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
            .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 1);

          g.on("mousemove", function (ev) {
            const rect = container.getBoundingClientRect();
            tooltip.html(
              `<div><strong style="color:${color}">${d.method}</strong></div>` +
              `<div><span class='tooltip-key'>${d.effect_type} effect on ${d.outcome}</span></div>` +
              `<div><span class='tooltip-key'>estimate =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>`
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
  // Multiplier chart (Tab 4).
  //   Shows how an initial unit shock evolves over time given (ρ, τ, β, φ).
  //   Two lines: own-state response and average-neighbour response.
  // ------------------------------------------------------------------
  function multiplier_chart(container) {
    const W = 760, H = 320;
    const margin = { top: 20, right: 28, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const T = data.T;
      const xs = d3.range(T);
      const allY = data.own.concat(data.neighbour).concat([0]);
      const ext = d3.extent(allY);
      const pad = Math.max(0.05, (ext[1] - ext[0]) * 0.1);
      const y = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([h, 0]);
      const x = d3.scaleLinear().domain([0, T - 1]).range([0, w]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text")
        .attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Time period after the shock");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Cumulative response Δy");

      // Zero line.
      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      const lineGen = d3.line().x((_, i) => x(i)).y(v => y(v)).curve(d3.curveMonotoneX);
      g.append("path").attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 2.5)
        .attr("d", lineGen(data.own));
      g.append("path").attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.5)
        .attr("d", lineGen(data.neighbour));

      // Asymptote lines.
      if (Number.isFinite(data.lr_own)) {
        g.append("line").attr("x1", 0).attr("x2", w)
          .attr("y1", y(data.lr_own)).attr("y2", y(data.lr_own))
          .attr("stroke", C.teal).attr("stroke-dasharray", "5 5").attr("opacity", 0.5);
        g.append("text").attr("x", w - 4).attr("y", y(data.lr_own) - 4)
          .attr("text-anchor", "end").attr("fill", C.teal).attr("font-size", 11)
          .text(`long-run own ≈ ${data.lr_own.toFixed(2)}`);
      }
      if (Number.isFinite(data.lr_neighbour)) {
        g.append("line").attr("x1", 0).attr("x2", w)
          .attr("y1", y(data.lr_neighbour)).attr("y2", y(data.lr_neighbour))
          .attr("stroke", C.orange).attr("stroke-dasharray", "5 5").attr("opacity", 0.5);
        g.append("text").attr("x", w - 4).attr("y", y(data.lr_neighbour) + 14)
          .attr("text-anchor", "end").attr("fill", C.orange).attr("font-size", 11)
          .text(`long-run neighbour ≈ ${data.lr_neighbour.toFixed(2)}`);
      }

      // Legend
      const lg = g.append("g").attr("transform", `translate(${w - 230},${10})`);
      lg.append("rect").attr("width", 230).attr("height", 50)
        .attr("fill", "rgba(15,23,41,0.6)").attr("stroke", C.line).attr("rx", 6);
      lg.append("line").attr("x1", 12).attr("x2", 32).attr("y1", 15).attr("y2", 15)
        .attr("stroke", C.teal).attr("stroke-width", 2.5);
      lg.append("text").attr("x", 38).attr("y", 19)
        .attr("fill", C.text).attr("font-size", 12).text("Own-state response");
      lg.append("line").attr("x1", 12).attr("x2", 32).attr("y1", 35).attr("y2", 35)
        .attr("stroke", C.orange).attr("stroke-width", 2.5);
      lg.append("text").attr("x", 38).attr("y", 39)
        .attr("fill", C.text).attr("font-size", 12).text("Neighbour response");
    }
    return { update };
  }

  window.CHARTS = {
    spatial_ring_animation,
    coef_recovery,
    mc_histograms,
    decomp_forest,
    multiplier_chart,
    C,
  };
})();
