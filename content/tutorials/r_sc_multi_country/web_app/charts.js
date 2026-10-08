// charts.js — D3 v7 chart builders for the Augmented Synthetic Control web app.
// Each builder takes a DOM container and returns an object with `update(cfg)`.
// All data comes from data/results.json (precomputed by analysis.R).

(function () {
  "use strict";

  const C = {
    steel:  "#6a9bcc",
    orange: "#d97757",
    teal:   "#00d4c8",
    black:  "#141413",
    text:   "#e8ecf2",
    muted:  "#8b9dc3",
    grid:   "rgba(232, 236, 242, 0.09)",
    band:   "rgba(106, 155, 204, 0.20)",
  };

  function ensureSVG(container, W, H) {
    container.innerHTML = "";
    return d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img");
  }

  function styleAxis(sel) {
    sel.selectAll("text").attr("fill", C.muted).attr("font-size", "12px");
    sel.selectAll(".domain, line").attr("stroke", "rgba(232,236,242,0.25)");
  }

  // ==================================================================
  // lineChart — flexible multi-series line chart with optional CI band,
  // zero line and vertical treatment marker. Drives every time-series view.
  //   cfg = {
  //     series: [{label, color, dash?, width?, points:[{x,y}]}],
  //     band?:  {points:[{x,lo,hi}], color?},
  //     vline?: number, vlabel?: string,
  //     hline?: number,            // e.g. 0 for an effect chart
  //     xlab, ylab, title?
  //   }
  // ==================================================================
  function lineChart(container) {
    const W = 840, H = 460, m = { top: 30, right: 26, bottom: 50, left: 66 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    return {
      update(cfg) {
        g.selectAll("*").remove();
        const allPts = cfg.series.flatMap(s => s.points);
        const bandPts = cfg.band ? cfg.band.points : [];
        const xs = allPts.map(p => p.x).concat(bandPts.map(p => p.x));
        const ys = allPts.map(p => p.y)
          .concat(bandPts.flatMap(p => [p.lo, p.hi]))
          .concat(cfg.hline !== undefined ? [cfg.hline] : []);
        const x = d3.scaleLinear().domain(d3.extent(xs)).range([0, w]).nice();
        const yPad = (d3.max(ys) - d3.min(ys)) * 0.08 || 1;
        const y = d3.scaleLinear()
          .domain([d3.min(ys) - yPad, d3.max(ys) + yPad]).range([h, 0]).nice();

        // grid
        g.append("g").attr("class", "grid")
          .call(d3.axisLeft(y).tickSize(-w).tickFormat(""))
          .selectAll("line").attr("stroke", C.grid);
        g.select(".grid .domain").remove();

        // axes
        g.append("g").attr("transform", `translate(0,${h})`)
          .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d"))).call(styleAxis);
        g.append("g").call(d3.axisLeft(y).ticks(6)).call(styleAxis);

        // labels
        g.append("text").attr("x", w / 2).attr("y", h + 40)
          .attr("text-anchor", "middle").attr("fill", C.muted)
          .attr("font-size", "13px").text(cfg.xlab || "");
        g.append("text").attr("transform", "rotate(-90)")
          .attr("x", -h / 2).attr("y", -48).attr("text-anchor", "middle")
          .attr("fill", C.muted).attr("font-size", "13px").text(cfg.ylab || "");

        // CI band
        if (cfg.band) {
          g.append("path").datum(cfg.band.points)
            .attr("fill", cfg.band.color || C.band)
            .attr("d", d3.area().x(p => x(p.x)).y0(p => y(p.lo)).y1(p => y(p.hi))
              .curve(d3.curveMonotoneX));
        }

        // zero / horizontal line
        if (cfg.hline !== undefined) {
          g.append("line").attr("x1", 0).attr("x2", w)
            .attr("y1", y(cfg.hline)).attr("y2", y(cfg.hline))
            .attr("stroke", C.muted).attr("stroke-width", 1).attr("opacity", 0.6);
        }

        // vertical treatment marker
        if (cfg.vline !== undefined) {
          g.append("line").attr("x1", x(cfg.vline)).attr("x2", x(cfg.vline))
            .attr("y1", 0).attr("y2", h)
            .attr("stroke", C.text).attr("stroke-dasharray", "5 4").attr("opacity", 0.7);
          if (cfg.vlabel) {
            g.append("text").attr("x", x(cfg.vline) + 5).attr("y", 12)
              .attr("fill", C.muted).attr("font-size", "11px").text(cfg.vlabel);
          }
        }

        // lines
        const line = d3.line().x(p => x(p.x)).y(p => y(p.y)).curve(d3.curveMonotoneX);
        cfg.series.forEach(s => {
          g.append("path").datum(s.points).attr("fill", "none")
            .attr("stroke", s.color).attr("stroke-width", s.width || 2)
            .attr("stroke-dasharray", s.dash || null)
            .attr("d", line);
        });

        // legend (top-right inside plot)
        const lg = g.append("g").attr("transform", `translate(${w - 8},6)`);
        cfg.series.forEach((s, i) => {
          const row = lg.append("g").attr("transform", `translate(0,${i * 18})`);
          row.append("line").attr("x1", -34).attr("x2", -14).attr("y1", 0).attr("y2", 0)
            .attr("stroke", s.color).attr("stroke-width", 2.5)
            .attr("stroke-dasharray", s.dash || null);
          row.append("text").attr("x", -38).attr("y", 4).attr("text-anchor", "end")
            .attr("fill", C.text).attr("font-size", "12px").text(s.label);
        });
      }
    };
  }

  // ==================================================================
  // scatter — paper % vs ASCM % with a 45-degree reference line, axes through
  // zero, country labels and hover highlight.
  //   cfg = {points:[{label, x, y}], xlab, ylab}
  // ==================================================================
  function scatter(container) {
    const W = 760, H = 560, m = { top: 24, right: 24, bottom: 56, left: 64 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);
    const tip = d3.select(container).append("div").attr("class", "tooltip").style("opacity", 0);

    return {
      update(cfg) {
        g.selectAll("*").remove();
        const vals = cfg.points.flatMap(p => [p.x, p.y]);
        const lo = Math.min(0, d3.min(vals)) - 5, hi = d3.max(vals) + 6;
        const x = d3.scaleLinear().domain([lo, hi]).range([0, w]);
        const y = d3.scaleLinear().domain([lo, hi]).range([h, 0]);

        g.append("g").attr("class", "grid").call(d3.axisLeft(y).tickSize(-w).tickFormat(""))
          .selectAll("line").attr("stroke", C.grid);
        g.select(".grid .domain").remove();
        g.append("g").attr("transform", `translate(0,${h})`)
          .call(d3.axisBottom(x).ticks(7)).call(styleAxis);
        g.append("g").call(d3.axisLeft(y).ticks(7)).call(styleAxis);

        // 45-degree line
        g.append("line").attr("x1", x(lo)).attr("y1", y(lo)).attr("x2", x(hi)).attr("y2", y(hi))
          .attr("stroke", C.muted).attr("stroke-dasharray", "6 5").attr("opacity", 0.8);
        g.append("text").attr("x", x(hi) - 4).attr("y", y(hi) + 16).attr("text-anchor", "end")
          .attr("fill", C.muted).attr("font-size", "11px").text("agreement (45°)");

        // zero axes
        [["x", 0]].forEach(() => {});
        g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
          .attr("stroke", C.muted).attr("opacity", 0.3);
        g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
          .attr("stroke", C.muted).attr("opacity", 0.3);

        // labels
        g.append("text").attr("x", w / 2).attr("y", h + 44).attr("text-anchor", "middle")
          .attr("fill", C.muted).attr("font-size", "13px").text(cfg.xlab);
        g.append("text").attr("transform", "rotate(-90)").attr("x", -h / 2).attr("y", -46)
          .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", "13px").text(cfg.ylab);

        // points
        const pts = g.selectAll(".pt").data(cfg.points).enter().append("g");
        pts.append("circle").attr("cx", p => x(p.x)).attr("cy", p => y(p.y)).attr("r", 6)
          .attr("fill", C.orange).attr("stroke", C.black).attr("stroke-width", 1)
          .style("cursor", "pointer")
          .on("mouseover", function (e, p) {
            d3.select(this).attr("r", 9).attr("fill", C.teal);
            tip.style("opacity", 1)
              .html(`<strong>${p.label}</strong><br>paper ${p.x.toFixed(1)}% · ASCM ${p.y.toFixed(1)}%`)
              .style("left", (e.offsetX + 14) + "px").style("top", (e.offsetY - 6) + "px");
          })
          .on("mouseout", function () {
            d3.select(this).attr("r", 6).attr("fill", C.orange);
            tip.style("opacity", 0);
          });
        pts.append("text").attr("x", p => x(p.x)).attr("y", p => y(p.y) - 10)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", "11px")
          .text(p => p.label);
      }
    };
  }

  // ==================================================================
  // groupedBars — two bars per item (e.g. plain vs ridge recovery error).
  //   cfg = {items:[{label, a, b}], aLabel, bLabel, xlab}
  // ==================================================================
  function groupedBars(container) {
    const W = 760, H = 380, m = { top: 28, right: 24, bottom: 46, left: 64 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    return {
      update(cfg) {
        g.selectAll("*").remove();
        const x = d3.scaleLinear()
          .domain([0, d3.max(cfg.items, d => Math.max(d.a, d.b)) * 1.1]).range([0, w]);
        const y0 = d3.scaleBand().domain(cfg.items.map(d => d.label)).range([0, h]).padding(0.25);
        const y1 = d3.scaleBand().domain(["a", "b"]).range([0, y0.bandwidth()]).padding(0.12);

        g.append("g").attr("transform", `translate(0,${h})`)
          .call(d3.axisBottom(x).ticks(6)).call(styleAxis);
        g.append("g").call(d3.axisLeft(y0)).call(styleAxis);
        g.append("text").attr("x", w / 2).attr("y", h + 40).attr("text-anchor", "middle")
          .attr("fill", C.muted).attr("font-size", "13px").text(cfg.xlab);

        cfg.items.forEach(d => {
          const grp = g.append("g").attr("transform", `translate(0,${y0(d.label)})`);
          grp.append("rect").attr("x", 0).attr("y", y1("a")).attr("height", y1.bandwidth())
            .attr("width", x(d.a)).attr("fill", C.orange).attr("rx", 2);
          grp.append("rect").attr("x", 0).attr("y", y1("b")).attr("height", y1.bandwidth())
            .attr("width", x(d.b)).attr("fill", C.teal).attr("rx", 2);
          grp.append("text").attr("x", x(d.a) + 4).attr("y", y1("a") + y1.bandwidth() / 2 + 4)
            .attr("fill", C.muted).attr("font-size", "10px").text(d.a.toFixed(2));
          grp.append("text").attr("x", x(d.b) + 4).attr("y", y1("b") + y1.bandwidth() / 2 + 4)
            .attr("fill", C.muted).attr("font-size", "10px").text(d.b.toFixed(2));
        });

        // legend
        const lg = g.append("g").attr("transform", `translate(${w - 150},-6)`);
        [["a", cfg.aLabel, C.orange], ["b", cfg.bLabel, C.teal]].forEach((s, i) => {
          const row = lg.append("g").attr("transform", `translate(${i * 78},0)`);
          row.append("rect").attr("width", 12).attr("height", 12).attr("fill", s[2]).attr("rx", 2);
          row.append("text").attr("x", 16).attr("y", 11).attr("fill", C.text)
            .attr("font-size", "11px").text(s[1]);
        });
      }
    };
  }

  // ==================================================================
  // forest — horizontal point-and-CI plot (one row per item), coloured by
  // significance, with a vertical reference line (usually zero). Used to show
  // per-unit and pooled effects with their confidence intervals.
  //   cfg = { items:[{label, est, lo, hi, sig, truth?}], ref?:0, xlab }
  // ==================================================================
  function forest(container) {
    const W = 760, m = { top: 16, right: 26, bottom: 44, left: 92 };
    const svg = ensureSVG(container, W, 320);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);
    return {
      update(cfg) {
        const rowH = 30, H = m.top + m.bottom + cfg.items.length * rowH;
        svg.attr("viewBox", `0 0 ${W} ${H}`);
        const w = W - m.left - m.right, h = cfg.items.length * rowH;
        g.selectAll("*").remove();
        const ref = cfg.ref !== undefined ? cfg.ref : 0;
        const vals = cfg.items.flatMap(d => [d.lo, d.hi, d.truth]).filter(Number.isFinite).concat([ref]);
        const pad = (d3.max(vals) - d3.min(vals)) * 0.08 || 1;
        const x = d3.scaleLinear().domain([d3.min(vals) - pad, d3.max(vals) + pad]).range([0, w]).nice();
        const y = d3.scaleBand().domain(cfg.items.map(d => d.label)).range([0, h]).padding(0.35);

        // x grid + axis
        g.append("g").attr("transform", `translate(0,${h})`)
          .call(d3.axisBottom(x).ticks(6)).call(styleAxis);
        g.append("text").attr("x", w / 2).attr("y", h + 38).attr("text-anchor", "middle")
          .attr("fill", C.muted).attr("font-size", "13px").text(cfg.xlab || "");
        // reference line (zero)
        g.append("line").attr("x1", x(ref)).attr("x2", x(ref)).attr("y1", -4).attr("y2", h)
          .attr("stroke", C.muted).attr("stroke-dasharray", "4 4").attr("opacity", 0.7);

        cfg.items.forEach(d => {
          const yc = y(d.label) + y.bandwidth() / 2;
          const col = d.sig ? C.teal : C.muted;
          // row label
          g.append("text").attr("x", -10).attr("y", yc + 4).attr("text-anchor", "end")
            .attr("fill", C.text).attr("font-size", "13px").attr("font-weight", d.label === "Pooled" || d.label === "Average" ? 700 : 400)
            .text(d.label);
          // CI bar
          g.append("line").attr("x1", x(d.lo)).attr("x2", x(d.hi)).attr("y1", yc).attr("y2", yc)
            .attr("stroke", col).attr("stroke-width", 2.5).attr("opacity", 0.85);
          ["lo", "hi"].forEach(k => g.append("line").attr("x1", x(d[k])).attr("x2", x(d[k]))
            .attr("y1", yc - 5).attr("y2", yc + 5).attr("stroke", col).attr("stroke-width", 2));
          // point estimate
          g.append("circle").attr("cx", x(d.est)).attr("cy", yc).attr("r", 5)
            .attr("fill", col).attr("stroke", C.black).attr("stroke-width", 1);
          // truth marker
          if (Number.isFinite(d.truth)) {
            g.append("line").attr("x1", x(d.truth)).attr("x2", x(d.truth))
              .attr("y1", yc - 8).attr("y2", yc + 8).attr("stroke", C.orange)
              .attr("stroke-width", 2).attr("stroke-dasharray", "2 2");
          }
        });
      }
    };
  }

  window.CHARTS = { lineChart, scatter, groupedBars, forest, palette: C };
})();
