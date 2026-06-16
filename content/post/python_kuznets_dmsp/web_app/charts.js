// charts.js — D3 v7 chart builders for the "Regional Inequality from Outer
// Space" web app (python_kuznets_dmsp).
//
// One builder per tab. Each takes a DOM container (+ a config object), draws an
// SVG, and returns an object with an update() method so slider moves patch the
// existing chart rather than recreating it. Exposed on window.CHARTS.

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
  };

  function ensureSVG(container, W, H) {
    container.innerHTML = "";
    return d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
  }
  function styleAxis(g) {
    g.selectAll("text").attr("fill", C.muted).attr("font-size", 11);
    g.selectAll(".domain, line").attr("stroke", C.muted);
  }

  // ==================================================================
  // TAB 1 — Lights -> GDP calibration line.
  //   Scatter of (log light, log GDP) plus a prediction line whose slope is
  //   the elasticity beta the user controls. Rotating beta tilts the line.
  // ==================================================================
  function calibration(container, cfg) {
    const W = 760, H = 380;
    const m = { top: 24, right: 24, bottom: 48, left: 60 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    // Fixed scatter cloud (seeded), generated once around the true slope.
    const rng = window.KMATH.mulberry32(123);
    const normal = window.KMATH.makeNormal(rng);
    const trueSlope = 0.102, intercept = 7.4;
    const pts = [];
    for (let i = 0; i < 220; i++) {
      const lx = 1.0 + normal() * 2.2;              // log light per pixel
      const ly = intercept + trueSlope * lx + normal() * 0.55; // log GDP pc
      pts.push({ lx, ly });
    }
    const xExt = d3.extent(pts, d => d.lx);
    const yExt = d3.extent(pts, d => d.ly);
    const x = d3.scaleLinear().domain([xExt[0] - 0.4, xExt[1] + 0.4]).range([0, w]);
    const y = d3.scaleLinear().domain([yExt[0] - 0.5, yExt[1] + 0.5]).range([h, 0]);

    const gx = g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(6));
    const gy = g.append("g").call(d3.axisLeft(y).ticks(6));
    styleAxis(gx); styleAxis(gy);
    g.append("text").attr("transform", `translate(${w / 2},${h + 38})`).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 12).text("log nighttime light per pixel  ℓ");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-44})`).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 12).text("log regional GDP per capita  y");

    g.selectAll("circle.pt").data(pts).enter().append("circle").attr("class", "pt")
      .attr("cx", d => x(d.lx)).attr("cy", d => y(d.ly)).attr("r", 2.6)
      .attr("fill", C.steel).attr("opacity", 0.55);

    // The movable prediction line: yhat = const + beta * lx, with the constant
    // re-centred so the line passes through the cloud's centroid (so rotation
    // looks like a pivot, not a vertical jump).
    const cx = d3.mean(pts, d => d.lx), cy = d3.mean(pts, d => d.ly);
    const line = g.append("line").attr("stroke", C.orange).attr("stroke-width", 3);
    const refLine = g.append("line").attr("stroke", C.teal).attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5 4").attr("opacity", 0.8);
    const betaLabel = g.append("text").attr("fill", C.orange).attr("font-size", 12).attr("font-weight", 700);

    function drawLine(sel, beta, color) {
      const x0 = x.domain()[0], x1 = x.domain()[1];
      const y0 = cy + beta * (x0 - cx);
      const y1 = cy + beta * (x1 - cx);
      sel.attr("x1", x(x0)).attr("y1", y(y0)).attr("x2", x(x1)).attr("y2", y(y1));
    }
    // teal reference at the FE column-2 elasticity (0.190)
    drawLine(refLine, 0.190, C.teal);

    function update(beta) {
      drawLine(line, beta, C.orange);
      const x1 = x.domain()[1];
      betaLabel.attr("x", x(x1) - 4).attr("y", y(cy + beta * (x1 - cx)) - 6)
        .attr("text-anchor", "end").text(`slope β = ${beta.toFixed(3)}`);
    }
    update(cfg.beta);
    return { update };
  }

  // ==================================================================
  // TAB 2 — Lorenz-style inequality bars + the live index readout is in app.js.
  //   This chart draws each region as a bar (height = income), width = pop
  //   share, ordered by income — a population-weighted "income profile".
  // ==================================================================
  function regionProfile(container) {
    const W = 760, H = 320;
    const m = { top: 20, right: 20, bottom: 46, left: 56 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);
    const gx = g.append("g").attr("transform", `translate(0,${h})`);
    const gy = g.append("g");
    g.append("text").attr("transform", `translate(${w / 2},${h + 40})`).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 12).text("cumulative population share  →  (bar width ∝ population)");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-42})`).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 12).text("region income (k$ per capita)");
    const meanLine = g.append("line").attr("stroke", C.orange).attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5 4");
    const meanLabel = g.append("text").attr("fill", C.orange).attr("font-size", 11);

    function update(regions, colors) {
      // sort by income ascending for a Lorenz-like profile
      const order = regions.map((r, i) => ({ ...r, i })).sort((a, b) => a.income - b.income);
      const totPop = d3.sum(order, d => d.pop);
      const mean = d3.sum(order, d => d.income * d.pop) / totPop;
      const yMax = d3.max(order, d => d.income) * 1.12;
      const x = d3.scaleLinear().domain([0, 1]).range([0, w]);
      const y = d3.scaleLinear().domain([0, yMax]).range([h, 0]);
      gx.call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%"))); styleAxis(gx);
      gy.call(d3.axisLeft(y).ticks(6)); styleAxis(gy);

      let cum = 0;
      const bars = order.map(d => {
        const x0 = cum / totPop;
        cum += d.pop;
        const x1 = cum / totPop;
        return { ...d, x0, x1 };
      });
      const sel = g.selectAll("rect.region").data(bars, d => d.i);
      sel.exit().remove();
      sel.enter().append("rect").attr("class", "region")
        .merge(sel)
        .attr("x", d => x(d.x0))
        .attr("width", d => Math.max(1, x(d.x1) - x(d.x0) - 1.5))
        .attr("y", d => y(d.income))
        .attr("height", d => h - y(d.income))
        .attr("fill", d => colors[d.i])
        .attr("opacity", 0.85);

      const lbl = g.selectAll("text.rl").data(bars, d => d.i);
      lbl.exit().remove();
      lbl.enter().append("text").attr("class", "rl")
        .attr("text-anchor", "middle").attr("font-size", 10).attr("fill", C.text)
        .merge(lbl)
        .attr("x", d => x((d.x0 + d.x1) / 2))
        .attr("y", d => y(d.income) - 5)
        .text(d => d.name);

      meanLine.attr("x1", 0).attr("x2", w).attr("y1", y(mean)).attr("y2", y(mean));
      meanLabel.attr("x", 4).attr("y", y(mean) - 5).text(`pop-weighted mean = ${mean.toFixed(1)} k$`);
    }
    return { update };
  }

  // ==================================================================
  // TAB 3 — Kuznets explorer: scatter cloud + fitted curve (linear/quad/cubic).
  // ==================================================================
  function kuznets(container, cfg) {
    const W = 760, H = 400;
    const m = { top: 24, right: 24, bottom: 50, left: 60 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const x = d3.scaleLinear().domain([cfg.lgMin, cfg.lgMax]).range([0, w]);
    const y = d3.scaleLinear().domain([0, cfg.giniMax]).range([h, 0]);
    const gx = g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(6));
    const gy = g.append("g").call(d3.axisLeft(y).ticks(6));
    styleAxis(gx); styleAxis(gy);
    g.append("text").attr("transform", `translate(${w / 2},${h + 40})`).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 12).text("log GDP per capita  ln Y");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-44})`).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 12).text("population-weighted regional Gini");

    g.selectAll("circle.cp").data(cfg.cloud).enter().append("circle").attr("class", "cp")
      .attr("cx", d => x(d.lg)).attr("cy", d => y(d.gini)).attr("r", 2.4)
      .attr("fill", C.steel).attr("opacity", 0.4);

    const path = g.append("path").attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 3);
    const markers = g.append("g");
    const lineGen = d3.line().x(d => x(d.lg)).y(d => y(d.gini)).curve(d3.curveMonotoneX);

    function update(coef, marks) {
      const data = [];
      for (let i = 0; i <= 120; i++) {
        const lg = cfg.lgMin + (cfg.lgMax - cfg.lgMin) * i / 120;
        data.push({ lg, gini: window.KMATH.polyval(coef, lg) });
      }
      path.datum(data).attr("d", lineGen);

      const sel = markers.selectAll("g.mk").data(marks || []);
      sel.exit().remove();
      const ent = sel.enter().append("g").attr("class", "mk");
      ent.append("line").attr("stroke", C.teal).attr("stroke-width", 1).attr("stroke-dasharray", "3 3");
      ent.append("circle").attr("r", 4).attr("fill", C.teal);
      ent.append("text").attr("fill", C.teal).attr("font-size", 10).attr("text-anchor", "middle");
      const all = ent.merge(sel);
      all.select("line").attr("x1", d => x(d.lg)).attr("x2", d => x(d.lg))
        .attr("y1", h).attr("y2", d => y(window.KMATH.polyval(coef, d.lg)));
      all.select("circle").attr("cx", d => x(d.lg)).attr("cy", d => y(window.KMATH.polyval(coef, d.lg)));
      all.select("text").attr("x", d => x(d.lg)).attr("y", d => y(window.KMATH.polyval(coef, d.lg)) - 9)
        .text(d => d.label);
    }
    return { update };
  }

  // ==================================================================
  // TAB 4 — Conley CI: point estimate fixed, CI band widens with the radius.
  //   A horizontal number line for beta with a 95% CI whisker; the naive iid
  //   CI is drawn faint behind it for contrast.
  // ==================================================================
  function conleyCI(container, cfg) {
    const W = 760, H = 260;
    const m = { top: 40, right: 40, bottom: 56, left: 40 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const x = d3.scaleLinear().domain([cfg.xMin, cfg.xMax]).range([0, w]);
    const yMid = h * 0.5;
    const gx = g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(7));
    styleAxis(gx);
    g.append("text").attr("transform", `translate(${w / 2},${h + 42})`).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 12).text("light elasticity  β");

    // zero reference
    g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
      .attr("stroke", C.muted).attr("stroke-dasharray", "4 4").attr("opacity", 0.6);
    g.append("text").attr("x", x(0)).attr("y", -8).attr("text-anchor", "middle")
      .attr("fill", C.muted).attr("font-size", 10).text("β = 0 (no signal)");

    // naive (iid) CI — faint
    const naiveBand = g.append("rect").attr("y", yMid - 26).attr("height", 52)
      .attr("fill", C.muted).attr("opacity", 0.14).attr("rx", 4);
    const naiveLabel = g.append("text").attr("fill", C.muted).attr("font-size", 10).attr("text-anchor", "middle");

    // Conley CI — orange whisker
    const ciLine = g.append("line").attr("stroke", C.orange).attr("stroke-width", 4).attr("y1", yMid).attr("y2", yMid);
    const capLo = g.append("line").attr("stroke", C.orange).attr("stroke-width", 2);
    const capHi = g.append("line").attr("stroke", C.orange).attr("stroke-width", 2);
    const pt = g.append("circle").attr("r", 7).attr("fill", C.teal).attr("stroke", C.bg).attr("stroke-width", 2).attr("cy", yMid);
    const ciLabel = g.append("text").attr("fill", C.orange).attr("font-size", 11).attr("text-anchor", "middle").attr("font-weight", 700);

    function update(beta, se, naiveSe) {
      const lo = beta - 1.96 * se, hi = beta + 1.96 * se;
      const nlo = beta - 1.96 * naiveSe, nhi = beta + 1.96 * naiveSe;
      naiveBand.transition().duration(250).attr("x", x(nlo)).attr("width", Math.max(1, x(nhi) - x(nlo)));
      naiveLabel.attr("x", (x(nlo) + x(nhi)) / 2).attr("y", yMid - 36)
        .text(`naive iid 95% CI (SE ${naiveSe.toFixed(3)})`);
      ciLine.transition().duration(250).attr("x1", x(lo)).attr("x2", x(hi));
      capLo.transition().duration(250).attr("x1", x(lo)).attr("x2", x(lo)).attr("y1", yMid - 10).attr("y2", yMid + 10);
      capHi.transition().duration(250).attr("x1", x(hi)).attr("x2", x(hi)).attr("y1", yMid - 10).attr("y2", yMid + 10);
      pt.transition().duration(250).attr("cx", x(beta));
      ciLabel.attr("x", x(beta)).attr("y", yMid + 30).text(`Conley 95% CI: [${lo.toFixed(3)}, ${hi.toFixed(3)}]`);
    }
    return { update };
  }

  window.CHARTS = { calibration, regionProfile, kuznets, conleyCI, palette: C };
})();
