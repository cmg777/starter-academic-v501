// charts.js — D3 v7 chart builders for the Ethiopian industrial-parks lab.
// Each builder takes a container element and returns an object with an
// update() method. Dark-theme colors are inlined (SVG can't reliably read
// CSS custom properties across browsers).

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

  const fmt = (v, d = 4) => (v >= 0 ? "+" : "") + v.toFixed(d);
  const starsOf = (t) => (Math.abs(t) > 2.576 ? "***" : Math.abs(t) > 1.96 ? "**" : Math.abs(t) > 1.645 ? "*" : "ns");

  // ── 1. Event-study path with adjustable post-horizon + sim overlay (Tab 1) ─
  function event_study(container) {
    const tip = tooltip();
    // coefs: [{k, estimate, se}], opts: {horizon, showPre, sim:{ks,estimate}|null}
    function update(coefs, opts) {
      opts = opts || {};
      const horizon = opts.horizon != null ? opts.horizon : 5;
      const sim = opts.sim || null;
      const w = 760, h = 400, m = { t: 26, r: 22, b: 46, l: 56 };
      const svg = makeSvg(container, w, h);

      const shown = coefs.filter((d) => d.k <= horizon);
      const x = d3.scaleLinear().domain([-5.4, 5.4]).range([m.l, w - m.r]);
      const allHi = d3.max(shown, (d) => d.estimate + 1.96 * d.se);
      const allLo = d3.min(shown, (d) => d.estimate - 1.96 * d.se);
      const yHi = Math.max(0.6, allHi + 0.05);
      const yLo = Math.min(-0.1, allLo - 0.03);
      const y = d3.scaleLinear().domain([yLo, yHi]).range([h - m.b, m.t]);

      // axes
      svg.append("g").attr("transform", `translate(0,${y(0)})`)
        .call(d3.axisBottom(x).tickValues([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]).tickFormat(d3.format("d")))
        .call((g) => g.selectAll("text").attr("fill", C.muted).attr("dy", "1.4em"))
        .call((g) => g.select(".domain").attr("stroke", C.grid))
        .call((g) => g.selectAll(".tick line").attr("stroke", C.grid));
      svg.append("g").attr("transform", `translate(${m.l},0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("+.2f")))
        .call((g) => g.selectAll("text").attr("fill", C.muted))
        .call((g) => g.select(".domain").attr("stroke", C.grid))
        .call((g) => g.selectAll(".tick line").attr("stroke", C.grid));

      // opening line at k = -0.5
      svg.append("line").attr("x1", x(-0.5)).attr("x2", x(-0.5)).attr("y1", m.t).attr("y2", h - m.b)
        .attr("stroke", C.muted).attr("stroke-dasharray", "3,3").attr("opacity", 0.7);
      svg.append("text").attr("x", x(-0.5) + 5).attr("y", m.t + 12).attr("fill", C.muted).attr("font-size", 11).text("park opens (k = 0)");
      // pre-period band shading
      svg.append("rect").attr("x", x(-5.4)).attr("width", x(-0.5) - x(-5.4))
        .attr("y", m.t).attr("height", (h - m.b) - m.t).attr("fill", C.steel).attr("opacity", 0.05);
      svg.append("text").attr("x", x(-3)).attr("y", h - m.b - 6).attr("text-anchor", "middle")
        .attr("fill", C.muted).attr("font-size", 10.5).attr("opacity", 0.8).text("pre-trend check");
      svg.append("text").attr("x", w - m.r).attr("y", m.t + 12).attr("text-anchor", "end")
        .attr("fill", C.muted).attr("font-size", 11).text("IHS night-light coefficient");

      // connecting line (real path)
      const line = d3.line().x((d) => x(d.k)).y((d) => y(d.estimate)).curve(d3.curveMonotoneX);
      svg.append("path").datum(shown).attr("fill", "none").attr("stroke", C.orange)
        .attr("stroke-width", 2.6).attr("opacity", 0.9).attr("d", line);

      // sim overlay (steel dashed) if present
      if (sim) {
        const simPts = sim.ks.map((k, i) => ({ k, estimate: sim.estimate[i] })).filter((d) => d.k <= horizon);
        const sl = d3.line().x((d) => x(d.k)).y((d) => y(d.estimate)).curve(d3.curveMonotoneX);
        svg.append("path").datum(simPts).attr("fill", "none").attr("stroke", C.steel)
          .attr("stroke-width", 2).attr("stroke-dasharray", "5,4").attr("opacity", 0.85).attr("d", sl);
        simPts.forEach((d) => svg.append("circle").attr("cx", x(d.k)).attr("cy", y(d.estimate)).attr("r", 3).attr("fill", C.steel));
      }

      // CI whiskers + markers (real)
      shown.forEach((d) => {
        const lo = d.estimate - 1.96 * d.se, hi = d.estimate + 1.96 * d.se;
        const t = d.se > 0 ? d.estimate / d.se : 0;
        const pre = d.k < 0;
        const col = pre ? C.muted : (Math.abs(t) > 1.96 ? C.teal : C.muted);
        if (d.se > 0) {
          svg.append("line").attr("x1", x(d.k)).attr("x2", x(d.k)).attr("y1", y(lo)).attr("y2", y(hi))
            .attr("stroke", col).attr("stroke-width", 2).attr("opacity", 0.85);
          [lo, hi].forEach((v) => svg.append("line").attr("x1", x(d.k) - 4).attr("x2", x(d.k) + 4)
            .attr("y1", y(v)).attr("y2", y(v)).attr("stroke", col).attr("stroke-width", 1.6).attr("opacity", 0.85));
        }
        svg.append("circle").attr("cx", x(d.k)).attr("cy", y(d.estimate)).attr("r", d.k === -1 ? 4 : 5.5)
          .attr("fill", d.k === -1 ? C.panel : col).attr("stroke", d.k === -1 ? C.muted : C.panel).attr("stroke-width", 1.5)
          .style("cursor", "pointer")
          .on("mousemove", (ev) => {
            const ts = d.se > 0 ? starsOf(d.estimate / d.se) : "ref";
            tip.html(`<b>event time k = ${d.k}</b>${d.k === -1 ? " (reference)" : ""}<br><span class="tooltip-key">estimate</span> <span class="tooltip-val">${fmt(d.estimate)}</span><br><span class="tooltip-key">SE</span> <span class="tooltip-val">${d.se.toFixed(4)}</span><br><span class="tooltip-key">t-stat</span> <span class="tooltip-val">${d.se > 0 ? (d.estimate / d.se).toFixed(2) : "—"} ${ts}</span>`)
              .style("left", (ev.pageX + 14) + "px").style("top", (ev.pageY - 10) + "px").classed("show", true);
          })
          .on("mouseleave", () => tip.classed("show", false));
      });

      // legend
      const lg = svg.append("g").attr("transform", `translate(${m.l + 8},${m.t})`);
      lg.append("line").attr("x1", 0).attr("x2", 16).attr("y1", 0).attr("y2", 0).attr("stroke", C.orange).attr("stroke-width", 2.6);
      lg.append("text").attr("x", 22).attr("y", 4).attr("fill", C.text).attr("font-size", 11).text("published estimates");
      if (sim) {
        lg.append("line").attr("x1", 150).attr("x2", 166).attr("y1", 0).attr("y2", 0).attr("stroke", C.steel).attr("stroke-width", 2).attr("stroke-dasharray", "5,4");
        lg.append("text").attr("x", 172).attr("y", 4).attr("fill", C.text).attr("font-size", 11).text("your simulated draw");
      }
    }
    return { update };
  }

  // ── 2. Estimator forest (Tab 2) ──────────────────────────────────────
  function estimator_forest(container) {
    const tip = tooltip();
    function update(estimators) {
      const w = 760, rowH = 50, m = { t: 18, r: 30, b: 40, l: 180 };
      const h = m.t + m.b + estimators.length * rowH;
      const svg = makeSvg(container, w, h);
      const lo = d3.min(estimators, (d) => d.att - 1.96 * d.se);
      const hi = d3.max(estimators, (d) => d.att + 1.96 * d.se);
      const x = d3.scaleLinear().domain([Math.min(0, lo) - 0.03, hi + 0.04]).range([m.l, w - m.r]);

      // band 0.21–0.30 shading (where all four land)
      svg.append("rect").attr("x", x(0.21)).attr("width", x(0.30) - x(0.21))
        .attr("y", m.t - 6).attr("height", h - m.b - m.t + 6).attr("fill", C.teal).attr("opacity", 0.07);
      svg.append("text").attr("x", x(0.255)).attr("y", m.t + 4).attr("text-anchor", "middle")
        .attr("fill", C.teal).attr("font-size", 10).attr("opacity", 0.85).text("0.21–0.30 band");

      svg.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", m.t - 6).attr("y2", h - m.b)
        .attr("stroke", C.muted).attr("stroke-dasharray", "3,3");
      svg.append("g").attr("transform", `translate(0,${h - m.b})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("+.2f")))
        .call((g) => g.selectAll("text").attr("fill", C.muted))
        .call((g) => g.select(".domain").attr("stroke", C.grid))
        .call((g) => g.selectAll(".tick line").attr("stroke", C.grid));

      estimators.forEach((d, i) => {
        const yc = m.t + i * rowH + rowH / 2;
        const lo2 = d.att - 1.96 * d.se, hi2 = d.att + 1.96 * d.se;
        const g = svg.append("g").style("cursor", "pointer")
          .on("mousemove", (ev) => {
            tip.html(`<b>${d.name}</b><br><span class="tooltip-key">ATT</span> <span class="tooltip-val">${fmt(d.att, 4)} ${d.stars}</span><br><span class="tooltip-key">SE</span> <span class="tooltip-val">${d.se.toFixed(4)}</span><br><span class="tooltip-key">95% CI</span> <span class="tooltip-val">[${lo2.toFixed(3)}, ${hi2.toFixed(3)}]</span><br>${d.note}`)
              .style("left", (ev.pageX + 14) + "px").style("top", (ev.pageY - 10) + "px").classed("show", true);
          })
          .on("mouseleave", () => tip.classed("show", false));
        g.append("text").attr("x", m.l - 12).attr("y", yc - 2).attr("text-anchor", "end")
          .attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600).text(d.name);
        g.append("text").attr("x", m.l - 12).attr("y", yc + 14).attr("text-anchor", "end")
          .attr("fill", C.muted).attr("font-size", 10.5).text(`${fmt(d.att, 3)} (${d.se.toFixed(3)}) ${d.stars}`);
        g.append("line").attr("x1", x(lo2)).attr("x2", x(hi2)).attr("y1", yc).attr("y2", yc).attr("stroke", C.teal).attr("stroke-width", 2.6);
        [lo2, hi2].forEach((v) => g.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", yc - 6).attr("y2", yc + 6).attr("stroke", C.teal).attr("stroke-width", 2));
        g.append("circle").attr("cx", x(d.att)).attr("cy", yc).attr("r", 6).attr("fill", C.teal).attr("stroke", C.panel).attr("stroke-width", 1.6);
      });
    }
    return { update };
  }

  // ── 3. Goodman-Bacon weight scatter (Tab 2) ──────────────────────────
  function bacon_scatter(container) {
    const tip = tooltip();
    // bacon = {twfe, points:[{type,estimate,weight}], by_type:[...]}
    function update(bacon, highlightForbidden) {
      const w = 760, h = 360, m = { t: 22, r: 24, b: 50, l: 56 };
      const svg = makeSvg(container, w, h);
      const pts = bacon.points;
      const x = d3.scaleLinear().domain([0, d3.max(pts, (d) => d.weight) * 1.08]).range([m.l, w - m.r]);
      const yex = d3.extent(pts, (d) => d.estimate);
      const y = d3.scaleLinear().domain([Math.min(-0.45, yex[0]) - 0.03, Math.max(0.8, yex[1]) + 0.03]).range([h - m.b, m.t]);

      // axes
      svg.append("g").attr("transform", `translate(0,${h - m.b})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".0%")))
        .call((g) => g.selectAll("text").attr("fill", C.muted))
        .call((g) => g.select(".domain").attr("stroke", C.grid))
        .call((g) => g.selectAll(".tick line").attr("stroke", C.grid));
      svg.append("g").attr("transform", `translate(${m.l},0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("+.2f")))
        .call((g) => g.selectAll("text").attr("fill", C.muted))
        .call((g) => g.select(".domain").attr("stroke", C.grid))
        .call((g) => g.selectAll(".tick line").attr("stroke", C.grid));
      svg.append("text").attr("x", (m.l + w - m.r) / 2).attr("y", h - 8).attr("text-anchor", "middle")
        .attr("fill", C.muted).attr("font-size", 11).text("Goodman-Bacon weight of the 2×2 comparison");
      // TWFE reference line
      svg.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", y(bacon.twfe)).attr("y2", y(bacon.twfe))
        .attr("stroke", C.text).attr("stroke-dasharray", "5,4").attr("opacity", 0.6);
      svg.append("text").attr("x", w - m.r).attr("y", y(bacon.twfe) - 6).attr("text-anchor", "end")
        .attr("fill", C.text).attr("font-size", 10.5).text(`TWFE = ${fmt(bacon.twfe, 3)}`);

      const colOf = (type) => type === "clean_tvn" ? C.teal : type === "clean_evl" ? C.steel : C.orange;
      const nameOf = (type) => type === "clean_tvn" ? "treated vs never (clean)" : type === "clean_evl" ? "earlier vs later (clean)" : "later vs earlier (forbidden)";

      pts.forEach((d) => {
        const isForbidden = d.type === "forbidden_lve";
        const dim = highlightForbidden && !isForbidden;
        svg.append("circle").attr("cx", x(d.weight)).attr("cy", y(d.estimate))
          .attr("r", 4 + Math.sqrt(d.weight) * 14)
          .attr("fill", colOf(d.type)).attr("opacity", dim ? 0.15 : (isForbidden && highlightForbidden ? 0.95 : 0.6))
          .attr("stroke", C.panel).attr("stroke-width", 1).style("cursor", "pointer")
          .on("mousemove", (ev) => {
            tip.html(`<b>${nameOf(d.type)}</b><br><span class="tooltip-key">2×2 estimate</span> <span class="tooltip-val">${fmt(d.estimate)}</span><br><span class="tooltip-key">weight</span> <span class="tooltip-val">${(d.weight * 100).toFixed(2)}%</span>`)
              .style("left", (ev.pageX + 14) + "px").style("top", (ev.pageY - 10) + "px").classed("show", true);
          })
          .on("mouseleave", () => tip.classed("show", false));
      });

      // legend
      const lg = svg.append("g").attr("transform", `translate(${m.l + 8},${m.t})`);
      [["clean_tvn", "treated vs never (95.4%)"], ["clean_evl", "earlier vs later (3.4%)"], ["forbidden_lve", "later vs earlier — forbidden (1.2%)"]].forEach((row, i) => {
        lg.append("circle").attr("cx", 4).attr("cy", i * 16 + 2).attr("r", 5).attr("fill", colOf(row[0])).attr("opacity", 0.7);
        lg.append("text").attr("x", 14).attr("y", i * 16 + 6).attr("fill", C.text).attr("font-size", 10.5).text(row[1]);
      });
    }
    return { update };
  }

  // ── 4. Heterogeneity decay line with a draggable marker (Tab 3) ───────
  function het_decay(container) {
    const tip = tooltip();
    // mod = {main_treatment, interaction, axis_max, label, se, t}; pointX = current x
    function update(mod, pointX, onMove) {
      const w = 760, h = 380, m = { t: 24, r: 26, b: 52, l: 58 };
      const svg = makeSvg(container, w, h);
      const xMax = mod.axis_max;
      const effAt = (xv) => mod.main_treatment + mod.interaction * xv;
      const x = d3.scaleLinear().domain([0, xMax]).range([m.l, w - m.r]);
      const yMax = Math.max(effAt(0), 0) + 0.4;
      const yMin = Math.min(effAt(xMax), 0) - 0.3;
      const y = d3.scaleLinear().domain([yMin, yMax]).range([h - m.b, m.t]);

      svg.append("g").attr("transform", `translate(0,${y(0)})`)
        .call(d3.axisBottom(x).ticks(7))
        .call((g) => g.selectAll("text").attr("fill", C.muted).attr("dy", "1.4em"))
        .call((g) => g.select(".domain").attr("stroke", C.grid))
        .call((g) => g.selectAll(".tick line").attr("stroke", C.grid));
      svg.append("g").attr("transform", `translate(${m.l},0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("+.1f")))
        .call((g) => g.selectAll("text").attr("fill", C.muted))
        .call((g) => g.select(".domain").attr("stroke", C.grid))
        .call((g) => g.selectAll(".tick line").attr("stroke", C.grid));
      svg.append("text").attr("x", (m.l + w - m.r) / 2).attr("y", h - 8).attr("text-anchor", "middle")
        .attr("fill", C.muted).attr("font-size", 11).text(`${mod.unit || mod.label} →`);
      svg.append("text").attr("x", w - m.r).attr("y", m.t + 4).attr("text-anchor", "end")
        .attr("fill", C.muted).attr("font-size", 11).text("implied park effect on raw light");

      // decay line
      const xs = d3.range(0, xMax + 0.001, xMax / 120);
      const lineGen = d3.line().x((d) => x(d)).y((d) => y(effAt(d)));
      svg.append("path").datum(xs).attr("fill", "none").attr("stroke", mod.interaction < 0 ? C.orange : C.teal)
        .attr("stroke-width", 2.8).attr("d", lineGen);

      // zero-crossing marker (only for negative slope that crosses)
      if (mod.interaction < 0) {
        const cross = -mod.main_treatment / mod.interaction;
        if (cross > 0 && cross < xMax) {
          svg.append("circle").attr("cx", x(cross)).attr("cy", y(0)).attr("r", 4).attr("fill", C.muted);
          svg.append("text").attr("x", x(cross)).attr("y", y(0) - 8).attr("text-anchor", "middle")
            .attr("fill", C.muted).attr("font-size", 10).text(`effect → 0 at ${cross.toFixed(0)}`);
        }
      }

      // draggable marker
      const px = Math.max(0, Math.min(xMax, pointX));
      const marker = svg.append("circle").attr("cx", x(px)).attr("cy", y(effAt(px))).attr("r", 8)
        .attr("fill", C.steel).attr("stroke", C.text).attr("stroke-width", 2).style("cursor", "ew-resize");
      svg.append("line").attr("class", "drop").attr("x1", x(px)).attr("x2", x(px)).attr("y1", y(effAt(px))).attr("y2", y(0))
        .attr("stroke", C.steel).attr("stroke-dasharray", "2,3").attr("opacity", 0.6);

      function setFromEvent(ev) {
        const [mx] = d3.pointer(ev, svg.node());
        const xv = Math.max(0, Math.min(xMax, x.invert(mx)));
        if (onMove) onMove(xv);
      }
      const drag = d3.drag().on("start drag", setFromEvent);
      svg.style("cursor", "ew-resize").on("click", setFromEvent).call(drag);

      // current readout
      svg.append("text").attr("x", x(px)).attr("y", y(effAt(px)) - 14).attr("text-anchor", "middle")
        .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
        .text(`effect ${fmt(effAt(px), 2)} @ ${px.toFixed(0)}`);
    }
    return { update };
  }

  // ── 5. Grouped outcome forest (Tab 4) ────────────────────────────────
  function outcome_forest(container) {
    const tip = tooltip();
    // rows: [{group,label,estimate,se,stars,note}]
    function update(rows) {
      const w = 760, rowH = 42, m = { t: 16, r: 30, b: 40, l: 220 };
      const h = m.t + m.b + rows.length * rowH;
      const svg = makeSvg(container, w, h);
      const lo = d3.min(rows, (d) => d.estimate - 1.96 * d.se);
      const hi = d3.max(rows, (d) => d.estimate + 1.96 * d.se);
      const x = d3.scaleLinear().domain([Math.min(-0.05, lo) - 0.03, Math.max(0.05, hi) + 0.04]).range([m.l, w - m.r]);

      svg.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", m.t - 4).attr("y2", h - m.b)
        .attr("stroke", C.muted).attr("stroke-dasharray", "3,3");
      svg.append("g").attr("transform", `translate(0,${h - m.b})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("+.2f")))
        .call((g) => g.selectAll("text").attr("fill", C.muted))
        .call((g) => g.select(".domain").attr("stroke", C.grid))
        .call((g) => g.selectAll(".tick line").attr("stroke", C.grid));

      let lastGroup = null;
      rows.forEach((d, i) => {
        const yc = m.t + i * rowH + rowH / 2;
        const t = d.se > 0 ? Math.abs(d.estimate / d.se) : 99;
        const sig = t > 1.96;
        const col = !sig ? C.muted : (d.estimate >= 0 ? C.teal : C.orange);
        if (d.group !== lastGroup) {
          svg.append("text").attr("x", 8).attr("y", yc - 8).attr("fill", C.steel).attr("font-size", 11)
            .attr("font-weight", 700).attr("letter-spacing", "0.03em").text(d.group.toUpperCase());
          lastGroup = d.group;
        }
        const g = svg.append("g").style("cursor", "pointer")
          .on("mousemove", (ev) => {
            const lo2 = d.estimate - 1.96 * d.se, hi2 = d.estimate + 1.96 * d.se;
            tip.html(`<b>${d.label}</b><br><span class="tooltip-key">estimate</span> <span class="tooltip-val">${fmt(d.estimate)} ${d.stars || "ns"}</span><br><span class="tooltip-key">SE</span> <span class="tooltip-val">${d.se.toFixed(4)}</span><br><span class="tooltip-key">95% CI</span> <span class="tooltip-val">[${lo2.toFixed(3)}, ${hi2.toFixed(3)}]</span><br>${d.note || ""}`)
              .style("left", (ev.pageX + 14) + "px").style("top", (ev.pageY - 10) + "px").classed("show", true);
          })
          .on("mouseleave", () => tip.classed("show", false));
        g.append("text").attr("x", m.l - 12).attr("y", yc + 4).attr("text-anchor", "end")
          .attr("fill", C.text).attr("font-size", 12.5).text(d.label);
        if (d.se > 0) {
          g.append("line").attr("x1", x(d.estimate - 1.96 * d.se)).attr("x2", x(d.estimate + 1.96 * d.se))
            .attr("y1", yc).attr("y2", yc).attr("stroke", col).attr("stroke-width", 2.4);
          [-1, 1].forEach((s) => g.append("line").attr("x1", x(d.estimate + s * 1.96 * d.se)).attr("x2", x(d.estimate + s * 1.96 * d.se))
            .attr("y1", yc - 5).attr("y2", yc + 5).attr("stroke", col).attr("stroke-width", 2));
        }
        g.append("circle").attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5.5).attr("fill", col)
          .attr("stroke", C.panel).attr("stroke-width", 1.5);
        g.append("text").attr("x", x(d.estimate + 1.96 * d.se) + 8).attr("y", yc + 4)
          .attr("fill", col).attr("font-size", 10.5).text(d.stars || "ns");
      });
    }
    return { update };
  }

  // ── 6. Phase event-study (small RCS dynamics chart, Tab 4) ────────────
  function phase_event_study(container) {
    function update(series) {
      // series: [{name, color, points:[{phase,estimate,se}]}]
      const w = 720, h = 300, m = { t: 22, r: 24, b: 44, l: 54 };
      const svg = makeSvg(container, w, h);
      const phases = [-3, -2, -1, 0, 1];
      const x = d3.scalePoint().domain(phases).range([m.l + 16, w - m.r - 16]).padding(0.4);
      let lo = 0, hi = 0;
      series.forEach((s) => s.points.forEach((p) => { lo = Math.min(lo, p.estimate - 1.96 * p.se); hi = Math.max(hi, p.estimate + 1.96 * p.se); }));
      const y = d3.scaleLinear().domain([lo - 0.03, hi + 0.03]).range([h - m.b, m.t]);

      svg.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", C.grid);
      svg.append("line").attr("x1", x(-1)).attr("x2", x(-1)).attr("y1", m.t).attr("y2", h - m.b)
        .attr("stroke", C.muted).attr("stroke-dasharray", "3,3").attr("opacity", 0.6);
      svg.append("text").attr("x", x(-0.5)).attr("y", m.t + 10).attr("fill", C.muted).attr("font-size", 10).text("opens (phase 0)");
      svg.append("g").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("+.2f")))
        .call((g) => g.selectAll("text").attr("fill", C.muted)).call((g) => g.select(".domain").attr("stroke", C.grid))
        .call((g) => g.selectAll(".tick line").attr("stroke", C.grid));
      phases.forEach((p) => svg.append("text").attr("x", x(p)).attr("y", h - m.b + 16).attr("text-anchor", "middle")
        .attr("fill", C.muted).attr("font-size", 11).text(p === -1 ? "−1 (ref)" : (p < 0 ? "−" + Math.abs(p) : "+" + p)));

      series.forEach((s) => {
        const pts = s.points;
        const ln = d3.line().x((d) => x(d.phase)).y((d) => y(d.estimate));
        svg.append("path").datum(pts).attr("fill", "none").attr("stroke", s.color).attr("stroke-width", 2.4).attr("d", ln);
        pts.forEach((d) => {
          if (d.se > 0) svg.append("line").attr("x1", x(d.phase)).attr("x2", x(d.phase)).attr("y1", y(d.estimate - 1.96 * d.se)).attr("y2", y(d.estimate + 1.96 * d.se)).attr("stroke", s.color).attr("opacity", 0.5).attr("stroke-width", 1.6);
          svg.append("circle").attr("cx", x(d.phase)).attr("cy", y(d.estimate)).attr("r", 4.5).attr("fill", s.color).attr("stroke", C.panel).attr("stroke-width", 1.2);
        });
      });
      // legend
      const lg = svg.append("g").attr("transform", `translate(${m.l + 10},${m.t})`);
      series.forEach((s, i) => {
        lg.append("circle").attr("cx", 4).attr("cy", i * 15 + 2).attr("r", 5).attr("fill", s.color);
        lg.append("text").attr("x", 14).attr("y", i * 15 + 6).attr("fill", C.text).attr("font-size", 11).text(s.name);
      });
    }
    return { update };
  }

  window.CHARTS = { event_study, estimator_forest, bacon_scatter, het_decay, outcome_forest, phase_event_study };
})();
