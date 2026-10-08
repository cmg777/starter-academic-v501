// charts.js — D3 v7 chart builders for the Aceh tsunami interactive lab.
// Each builder takes a container element and returns an object with an
// update()/animate() method. Dark-theme colors are inlined (SVG can't read
// CSS custom properties reliably across browsers).

(function () {
  "use strict";

  const C = {
    steel: "#6a9bcc", orange: "#d97757", teal: "#00d4c8",
    text: "#e8ecf2", muted: "#8b9dc3", grid: "rgba(232,236,242,0.12)",
    panel: "#1f2b5e",
  };
  const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  function makeSvg(container, w, h) {
    d3.select(container).selectAll("*").remove();
    return d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("font-family", FONT);
  }

  function tooltip() {
    let tip = d3.select("body").select(".tooltip.js-tip");
    if (tip.empty()) tip = d3.select("body").append("div").attr("class", "tooltip js-tip");
    return tip;
  }

  // ── 1. Parallel-trends animation (Tab 1) ─────────────────────────────
  function parallel_trends(container, traj) {
    const w = 720, h = 380, m = { t: 24, r: 20, b: 40, l: 52 };
    const svg = makeSvg(container, w, h);
    const years = traj.years;
    const x = d3.scaleLinear().domain([d3.min(years), d3.max(years)]).range([m.l, w - m.r]);
    const y = d3.scaleLinear().domain([-0.06, 0.14]).range([h - m.b, m.t]);

    // axes
    svg.append("g").attr("transform", `translate(0,${y(0)})`)
      .call(d3.axisBottom(x).tickValues([2000, 2004, 2008, 2012]).tickFormat(d3.format("d")))
      .call(g => g.selectAll("text").attr("fill", C.muted).attr("dy", "1.4em"))
      .call(g => g.select(".domain").attr("stroke", C.grid))
      .call(g => g.selectAll(".tick line").attr("stroke", C.grid));
    svg.append("g").attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("+.0%")))
      .call(g => g.selectAll("text").attr("fill", C.muted))
      .call(g => g.select(".domain").attr("stroke", C.grid))
      .call(g => g.selectAll(".tick line").attr("stroke", C.grid));
    // tsunami line
    svg.append("line").attr("x1", x(2004.5)).attr("x2", x(2004.5))
      .attr("y1", m.t).attr("y2", h - m.b).attr("stroke", C.muted)
      .attr("stroke-dasharray", "3,3").attr("opacity", 0.7);
    svg.append("text").attr("x", x(2004.5) + 5).attr("y", m.t + 12)
      .attr("fill", C.muted).attr("font-size", 11).text("tsunami (Dec 2004)");
    svg.append("text").attr("x", w - m.r).attr("y", m.t + 12).attr("text-anchor", "end")
      .attr("fill", C.muted).attr("font-size", 11).text("annual GDP growth");

    const line = d3.line().x((d, i) => x(years[i])).y(d => y(d)).curve(d3.curveMonotoneX);
    const gapArea = d3.area().x((d, i) => x(years[i]))
      .y0((d, i) => y(traj.control[i])).y1((d, i) => y(traj.treated[i])).curve(d3.curveMonotoneX);

    const gap = svg.append("path").attr("fill", C.teal).attr("opacity", 0.15);
    const ctrlPath = svg.append("path").attr("fill", "none").attr("stroke", C.steel)
      .attr("stroke-width", 2.2).attr("stroke-dasharray", "6,4");
    const treatPath = svg.append("path").attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.8);
    const ctrlDot = svg.append("circle").attr("r", 5).attr("fill", C.steel);
    const treatDot = svg.append("circle").attr("r", 5).attr("fill", C.orange);
    // legend
    const lg = svg.append("g").attr("transform", `translate(${m.l + 6},${m.t})`);
    lg.append("circle").attr("r", 4).attr("cy", 2).attr("fill", C.orange);
    lg.append("text").attr("x", 9).attr("y", 6).attr("fill", C.text).attr("font-size", 12).text("Treated (flooded)");
    lg.append("circle").attr("r", 4).attr("cy", 20).attr("fill", C.steel);
    lg.append("text").attr("x", 9).attr("y", 24).attr("fill", C.text).attr("font-size", 12).text("Control");

    let raf = null, start = null;
    const DUR = 9000;
    function frame(ts) {
      if (!start) start = ts;
      let p = ((ts - start) % (DUR + 1600)) / DUR;
      p = Math.min(1, Math.max(0, p));
      const fIdx = p * (years.length - 1);
      const cut = Math.floor(fIdx);
      const subYears = years.slice(0, cut + 2);
      const ctrlSub = traj.control.slice(0, cut + 2);
      const treatSub = traj.treated.slice(0, cut + 2);
      ctrlPath.datum(ctrlSub).attr("d", d3.line().x((d, i) => x(subYears[i])).y(d => y(d)).curve(d3.curveMonotoneX));
      treatPath.datum(treatSub).attr("d", d3.line().x((d, i) => x(subYears[i])).y(d => y(d)).curve(d3.curveMonotoneX));
      // gap fill only for the post-2005 portion revealed so far
      const startGap = years.indexOf(2005);
      if (cut >= startGap) {
        const gy = years.slice(startGap, cut + 2), gc = traj.control.slice(startGap, cut + 2), gt = traj.treated.slice(startGap, cut + 2);
        gap.datum(gy).attr("d", d3.area().x((d, i) => x(gy[i])).y0((d, i) => y(gc[i])).y1((d, i) => y(gt[i])).curve(d3.curveMonotoneX));
      } else {
        gap.attr("d", null);
      }
      const ci = Math.min(years.length - 1, Math.round(fIdx));
      ctrlDot.attr("cx", x(years[ci])).attr("cy", y(traj.control[ci]));
      treatDot.attr("cx", x(years[ci])).attr("cy", y(traj.treated[ci]));
      raf = requestAnimationFrame(frame);
    }
    function play() { if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; start = null; } }
    return { play, stop };
  }

  // ── 2. Forest plot of real estimates (Tab 2) ─────────────────────────
  function forest_plot(container) {
    const tip = tooltip();
    let rows = [];
    function update(estimates, activeGroups) {
      rows = estimates.filter(e => activeGroups.has(e.group));
      const w = 760, rowH = 34, m = { t: 16, r: 28, b: 36, l: 264 };
      const h = m.t + m.b + rows.length * rowH;
      const svg = makeSvg(container, w, h);
      const allLo = d3.min(rows, d => d.estimate - 1.96 * d.se);
      const allHi = d3.max(rows, d => d.estimate + 1.96 * d.se);
      const pad = 0.01;
      const x = d3.scaleLinear().domain([Math.min(allLo, -0.02) - pad, Math.max(allHi, 0.02) + pad]).range([m.l, w - m.r]);
      // zero line
      svg.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", m.t - 4).attr("y2", h - m.b)
        .attr("stroke", C.muted).attr("stroke-dasharray", "3,3");
      svg.append("g").attr("transform", `translate(0,${h - m.b})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("+.2f")))
        .call(g => g.selectAll("text").attr("fill", C.muted))
        .call(g => g.select(".domain").attr("stroke", C.grid))
        .call(g => g.selectAll(".tick line").attr("stroke", C.grid));
      rows.forEach((d, i) => {
        const yc = m.t + i * rowH + rowH / 2;
        const t = Math.abs(d.estimate / d.se);
        const sig = t > 1.96;
        const col = !sig ? C.muted : (d.estimate >= 0 ? C.teal : C.orange);
        const g = svg.append("g").style("cursor", "pointer")
          .on("mousemove", (ev) => {
            const stars = t > 2.576 ? "***" : t > 1.96 ? "**" : t > 1.645 ? "*" : "ns";
            tip.html(`<b>${d.group} — ${d.label}</b><br><span class="tooltip-key">estimate</span> <span class="tooltip-val">${d.estimate >= 0 ? "+" : ""}${d.estimate.toFixed(4)}</span><br><span class="tooltip-key">SE</span> <span class="tooltip-val">${d.se.toFixed(4)}</span><br><span class="tooltip-key">95% CI</span> <span class="tooltip-val">[${(d.estimate - 1.96 * d.se).toFixed(3)}, ${(d.estimate + 1.96 * d.se).toFixed(3)}]</span><br><span class="tooltip-key">t-stat</span> <span class="tooltip-val">${(d.estimate / d.se).toFixed(2)} ${stars}</span>`)
              .style("left", (ev.pageX + 14) + "px").style("top", (ev.pageY - 10) + "px").classed("show", true);
          })
          .on("mouseleave", () => tip.classed("show", false));
        g.append("text").attr("x", m.l - 12).attr("y", yc + 4).attr("text-anchor", "end")
          .attr("fill", C.text).attr("font-size", 11.5).text(`${d.group}: ${d.label}`);
        g.append("line").attr("x1", x(d.estimate - 1.96 * d.se)).attr("x2", x(d.estimate + 1.96 * d.se))
          .attr("y1", yc).attr("y2", yc).attr("stroke", col).attr("stroke-width", 2.4);
        [-1, 1].forEach(s => g.append("line").attr("x1", x(d.estimate + s * 1.96 * d.se)).attr("x2", x(d.estimate + s * 1.96 * d.se))
          .attr("y1", yc - 5).attr("y2", yc + 5).attr("stroke", col).attr("stroke-width", 2));
        g.append("circle").attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5).attr("fill", col)
          .attr("stroke", C.panel).attr("stroke-width", 1.5);
      });
    }
    return { update };
  }

  // ── 3. Estimated-vs-true period effects (Tab 3, one draw) ────────────
  function sim_compare(container) {
    function update(est, truth) {
      const periods = [
        { k: "pre", label: "Pre\n03-04", true: 0.017 },
        { k: "tsunami", label: "Tsunami\n2005", true: truth.shock },
        { k: "recovery", label: "Recovery\n06-08", true: truth.recovery },
        { k: "post", label: "Post\n09-12", true: 0.011 },
      ];
      const w = 640, h = 300, m = { t: 20, r: 20, b: 46, l: 52 };
      const svg = makeSvg(container, w, h);
      const x = d3.scalePoint().domain(periods.map(d => d.k)).range([m.l + 20, w - m.r - 20]).padding(0.5);
      const lo = Math.min(-0.16, d3.min(periods, d => Math.min(d.true, est[d.k]))) - 0.01;
      const hi = Math.max(0.14, d3.max(periods, d => Math.max(d.true, est[d.k]))) + 0.01;
      const y = d3.scaleLinear().domain([lo, hi]).range([h - m.b, m.t]);
      svg.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", C.grid);
      svg.append("g").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("+.0%")))
        .call(g => g.selectAll("text").attr("fill", C.muted)).call(g => g.select(".domain").attr("stroke", C.grid))
        .call(g => g.selectAll(".tick line").attr("stroke", C.grid));
      periods.forEach(p => {
        svg.append("text").attr("x", x(p.k)).attr("y", h - m.b + 14).attr("text-anchor", "middle")
          .attr("fill", C.muted).attr("font-size", 10.5).selectAll("tspan").data(p.label.split("\n")).enter()
          .append("tspan").attr("x", x(p.k)).attr("dy", (d, i) => i === 0 ? 0 : 12).text(d => d);
      });
      // true (steel) line + dots
      const tl = d3.line().x(d => x(d.k)).y(d => y(d.true));
      svg.append("path").datum(periods).attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,4").attr("d", tl);
      periods.forEach(p => svg.append("circle").attr("cx", x(p.k)).attr("cy", y(p.true)).attr("r", 4).attr("fill", C.steel));
      // estimated (orange) line + dots
      const el = d3.line().x(d => x(d.k)).y(d => y(est[d.k]));
      svg.append("path").datum(periods).attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.6).attr("d", el);
      periods.forEach(p => svg.append("circle").attr("cx", x(p.k)).attr("cy", y(est[p.k])).attr("r", 5).attr("fill", C.orange));
      // legend
      const lg = svg.append("g").attr("transform", `translate(${m.l + 6},${m.t - 4})`);
      lg.append("line").attr("x1", 0).attr("x2", 18).attr("y1", 0).attr("y2", 0).attr("stroke", C.orange).attr("stroke-width", 2.6);
      lg.append("text").attr("x", 24).attr("y", 4).attr("fill", C.text).attr("font-size", 11).text("your sim estimate");
      lg.append("line").attr("x1", 150).attr("x2", 168).attr("y1", 0).attr("y2", 0).attr("stroke", C.steel).attr("stroke-width", 2).attr("stroke-dasharray", "5,4");
      lg.append("text").attr("x", 174).attr("y", 4).attr("fill", C.text).attr("font-size", 11).text("true effect");
    }
    return { update };
  }

  // ── 4. Histogram of the recovery estimate across sims (Tab 3) ────────
  function histogram(container) {
    function update(values, trueVal) {
      const w = 640, h = 260, m = { t: 18, r: 20, b: 42, l: 44 };
      const svg = makeSvg(container, w, h);
      const ext = d3.extent(values);
      const lo = Math.min(ext[0], trueVal) - 0.01, hi = Math.max(ext[1], trueVal) + 0.01;
      const x = d3.scaleLinear().domain([lo, hi]).range([m.l, w - m.r]);
      const bins = d3.bin().domain(x.domain()).thresholds(24)(values);
      const y = d3.scaleLinear().domain([0, d3.max(bins, b => b.length) || 1]).range([h - m.b, m.t]);
      svg.append("g").attr("transform", `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("+.2f")))
        .call(g => g.selectAll("text").attr("fill", C.muted)).call(g => g.select(".domain").attr("stroke", C.grid))
        .call(g => g.selectAll(".tick line").attr("stroke", C.grid));
      svg.selectAll("rect").data(bins).enter().append("rect")
        .attr("x", b => x(b.x0) + 1).attr("width", b => Math.max(0, x(b.x1) - x(b.x0) - 1))
        .attr("y", b => y(b.length)).attr("height", b => y(0) - y(b.length))
        .attr("fill", C.teal).attr("opacity", 0.7);
      const mean = d3.mean(values);
      [{ v: trueVal, c: C.orange, t: "true" }, { v: mean, c: C.text, t: "mean" }].forEach(L => {
        svg.append("line").attr("x1", x(L.v)).attr("x2", x(L.v)).attr("y1", m.t).attr("y2", h - m.b)
          .attr("stroke", L.c).attr("stroke-width", 2).attr("stroke-dasharray", L.t === "true" ? "0" : "4,3");
        svg.append("text").attr("x", x(L.v)).attr("y", m.t - 4).attr("text-anchor", "middle").attr("fill", L.c).attr("font-size", 10).text(L.t);
      });
    }
    return { update };
  }

  // ── 5. SE explorer: confidence interval that widens with ρ (Tab 4) ───
  function se_explorer(container) {
    function update(estimate, effSE, seRow) {
      const w = 680, h = 250, m = { t: 28, r: 28, b: 40, l: 28 };
      const svg = makeSvg(container, w, h);
      const maxSE = Math.max(seRow.hac, effSE) * 1.96 * 1.3;
      const x = d3.scaleLinear().domain([estimate - maxSE, estimate + maxSE]).range([m.l, w - m.r]);
      const yc = m.t + 28;
      // zero reference
      svg.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", m.t - 6).attr("y2", h - m.b)
        .attr("stroke", C.muted).attr("stroke-dasharray", "3,3");
      svg.append("text").attr("x", x(0)).attr("y", m.t - 10).attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11).text("null (0)");
      svg.append("g").attr("transform", `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("+.3f")))
        .call(g => g.selectAll("text").attr("fill", C.muted)).call(g => g.select(".domain").attr("stroke", C.grid))
        .call(g => g.selectAll(".tick line").attr("stroke", C.grid));
      const t = Math.abs(estimate / effSE);
      const sig = t > 1.96;
      const col = sig ? C.teal : C.orange;
      // CI bar
      svg.append("line").attr("x1", x(estimate - 1.96 * effSE)).attr("x2", x(estimate + 1.96 * effSE))
        .attr("y1", yc).attr("y2", yc).attr("stroke", col).attr("stroke-width", 4);
      [-1, 1].forEach(s => svg.append("line").attr("x1", x(estimate + s * 1.96 * effSE)).attr("x2", x(estimate + s * 1.96 * effSE))
        .attr("y1", yc - 9).attr("y2", yc + 9).attr("stroke", col).attr("stroke-width", 3));
      svg.append("circle").attr("cx", x(estimate)).attr("cy", yc).attr("r", 7).attr("fill", col).attr("stroke", C.panel).attr("stroke-width", 2);
      svg.append("text").attr("x", x(estimate)).attr("y", yc - 16).attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text(`+${estimate.toFixed(4)} (point estimate — fixed)`);
      // reference bars of the four SE types
      const refY = yc + 64;
      const types = [["naive", seRow.naive], ["clustered", seRow.clustered], ["Conley", seRow.conley], ["Conley-HAC", seRow.hac]];
      const bw = (w - m.l - m.r) / 4 - 14;
      const seMax = d3.max(types, d => d[1]);
      types.forEach((tp, i) => {
        const bx = m.l + i * ((w - m.l - m.r) / 4) + 10;
        const bh = (tp[1] / seMax) * 44;
        svg.append("rect").attr("x", bx).attr("width", bw).attr("y", refY + 50 - bh).attr("height", bh)
          .attr("fill", tp[0] === "Conley-HAC" ? C.teal : C.steel).attr("opacity", tp[0] === "Conley-HAC" ? 0.9 : 0.5);
        svg.append("text").attr("x", bx + bw / 2).attr("y", refY + 64).attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 10).text(tp[0]);
        svg.append("text").attr("x", bx + bw / 2).attr("y", refY + 46 - bh).attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 10).text(tp[1].toFixed(4));
      });
      svg.append("text").attr("x", m.l).attr("y", refY + 36).attr("fill", C.muted).attr("font-size", 11).text("the four standard-error recipes (recovery effect):");
    }
    return { update };
  }

  window.CHARTS = { parallel_trends, forest_plot, sim_compare, histogram, se_explorer };
})();
