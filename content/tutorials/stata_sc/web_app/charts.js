// charts.js: D3 chart builders for the synthetic control web app of the
// stata_sc post (Proposition 99 and cigarette sales in California).
//
// Each builder takes a DOM container and draws an SVG. Builders with views
// to switch return an object with an update(...) method that redraws the
// chart from scratch. On wide screens a chart keeps a fixed design width and
// scales up; on phones it draws at the real width of its container, so the
// labels keep their nominal size.

(function () {
  "use strict";

  const C = {
    bg:    "#1f2b5e",
    panel: "#182447",
    steel: "#6a9bcc",
    orange:"#d97757",
    teal:  "#00d4c8",
    mint:  "#9bdcc3",
    text:  "#e8ecf2",
    muted: "#8b9dc3",
    line:  "rgba(232, 236, 242, 0.18)",
    grid:  "rgba(232, 236, 242, 0.08)",
    faint: "rgba(232, 236, 242, 0.15)",
  };

  const reduceMotion = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Drawing width in SVG units. A hidden container reports a width of zero,
  // so it gets the desktop layout until app.js redraws it on display.
  function layout(container, fullWidth) {
    const inner = (container.clientWidth || 0) - 32; // .chart-area padding
    if (inner > 0 && inner < 560) return { W: Math.max(260, Math.round(inner)), compact: true };
    return { W: fullWidth, compact: false };
  }

  function ensureSVG(container, viewBoxW, viewBoxH) {
    container.innerHTML = "";
    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxW} ${viewBoxH}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    return svg;
  }

  // Fixed decimals with a true minus sign; missing values print as "n/a".
  // Rounding works on the decimal digits, so a logged value such as
  // −25.755 prints as −25.76 rather than the −25.75 that toFixed gives.
  function num(x, prec) {
    if (x === null || x === undefined || Number.isNaN(+x)) return "n/a";
    const v = +x;
    const s = String(Math.abs(v));
    const r = s.includes("e")
      ? Math.abs(v)
      : Number(Math.round(Number(s + "e" + prec)) + "e-" + prec);
    const out = r.toFixed(prec);
    return (v < 0 && Number(out) !== 0 ? "−" : "") + out;
  }

  function getTooltip(container) {
    let tooltip = d3.select(container).select(".tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select(container).append("div").attr("class", "tooltip");
    }
    return tooltip;
  }

  // Place the tooltip next to the pointer but keep it inside the container,
  // so it never widens the page on a narrow screen.
  function showTooltip(tooltip, container, ev, html) {
    const rect = container.getBoundingClientRect();
    tooltip.html(html).classed("show", true);
    const tw = tooltip.node().offsetWidth || 180;
    let left = ev.clientX - rect.left + 12;
    if (left + tw > rect.width - 4) left = Math.max(4, ev.clientX - rect.left - tw - 12);
    tooltip
      .style("left", left + "px")
      .style("top", (ev.clientY - rect.top + 12) + "px");
  }

  function hideTooltip(tooltip) {
    tooltip.classed("show", false);
  }

  function largestDonor(donorData) {
    return donorData.reduce((a, b) => (b.weight > a.weight ? b : a), donorData[0]);
  }

  // ------------------------------------------------------------------
  // Tab 1: animated bars for the donors with positive weight.
  //   donorData: array of { region, weight } for all 38 donors.
  //   The largest donor is steel blue, the other positive donors are
  //   orange, and one muted row counts the donors with zero weight.
  // ------------------------------------------------------------------
  function donor_weight_animation(container, donorData) {
    const { W, compact } = layout(container, 720);
    const H = compact ? 250 : 360;
    const fs = compact ? 11 : 12;
    const svg = ensureSVG(container, W, H);
    const top = largestDonor(donorData);
    const positive = donorData.filter(d => d.weight > 0)
      .sort((a, b) => b.weight - a.weight);
    const nZero = donorData.length - positive.length;
    const data = positive.map(d => ({
      region: d.region,
      weight: d.weight,
      color: d.region === top.region ? C.steel : C.orange,
    }));
    if (nZero > 0) {
      data.push({
        region: compact ? `${nZero} with weight 0` : `${nZero} other donors (weight 0)`,
        weight: 0,
        color: C.muted,
      });
    }
    const margin = compact
      ? { top: 14, right: 46, bottom: 40, left: 116 }
      : { top: 24, right: 24, bottom: 40, left: 200 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, Math.max(0.4, top.weight * 1.25)]).range([0, w]);
    const y = d3.scaleBand().domain(data.map(d => d.region))
      .range([0, h]).padding(0.3);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(compact ? 4 : 5).tickFormat(d3.format(".0%")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);
    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 34})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", fs)
      .text(compact ? "Donor weight" : "Donor weight in synthetic California");

    const duration = reduceMotion ? 0 : 1100;
    data.forEach(d => {
      const yc = y(d.region);
      g.append("text").attr("x", -10).attr("y", yc + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end").attr("fill", d.weight > 0 ? C.text : C.muted)
        .attr("font-size", fs)
        .text(d.region);
      const targetW = x(d.weight);
      g.append("rect")
        .attr("class", "donor-anim-bar")
        .attr("x", 0).attr("y", yc).attr("height", y.bandwidth())
        .attr("width", reduceMotion ? targetW : 0).attr("fill", d.color).attr("opacity", 0.88)
        .transition().duration(duration).delay(reduceMotion ? 0 : 150).attr("width", targetW);
      g.append("text").attr("x", targetW + 6).attr("y", yc + y.bandwidth() / 2 + 4)
        .attr("fill", C.text).attr("font-size", fs).attr("font-weight", 600)
        .style("opacity", reduceMotion ? 1 : 0)
        .text(d3.format(".1%")(d.weight))
        .transition().duration(reduceMotion ? 0 : 700).delay(duration).style("opacity", 1);
    });
  }

  // ------------------------------------------------------------------
  // Tab 2: weights of all 38 donors, sorted from largest to smallest.
  //   donorData: array of { region, weight }.
  //   The largest donor is steel blue, other positive donors are orange,
  //   and donors with zero weight are dimmed.
  // ------------------------------------------------------------------
  function donor_weights_bar(container, donorData) {
    const { W, compact } = layout(container, 720);
    const margin = compact
      ? { top: 12, right: 46, bottom: 40, left: 104 }
      : { top: 20, right: 24, bottom: 40, left: 200 };
    const data = donorData.slice().sort((a, b) => b.weight - a.weight
      || a.region.localeCompare(b.region));
    const top = largestDonor(data);
    const barH = compact ? 18 : 22;
    const facetH = data.length * barH + 10;
    const totalH = margin.top + facetH + margin.bottom;
    const w = W - margin.left - margin.right;
    const svg = ensureSVG(container, W, totalH);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xMax = Math.max(0.05, top.weight || 0.05) * 1.12;
    const x = d3.scaleLinear().domain([0, xMax]).range([0, w]);
    const y = d3.scaleBand().domain(data.map(d => d.region))
      .range([0, facetH]).padding(0.3);

    g.append("g").attr("transform", `translate(0,${facetH})`)
      .call(d3.axisBottom(x).ticks(compact ? 4 : 5).tickFormat(d3.format(".0%")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);
    g.append("text").attr("transform", `translate(${w / 2},${facetH + 34})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Donor weight (%)");

    data.forEach(d => {
      const yc = y(d.region);
      const positive = d.weight > 0;
      const color = d.region === top.region ? C.steel : (positive ? C.orange : C.muted);
      g.append("text").attr("x", -10).attr("y", yc + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end")
        .attr("fill", positive ? C.text : C.muted)
        .attr("font-size", 11)
        .text(d.region);
      const targetW = x(d.weight);
      g.append("rect")
        .attr("class", "donor-bar")
        .attr("x", 0).attr("y", yc).attr("height", y.bandwidth())
        .attr("width", Math.max(1, targetW))
        .attr("fill", color).attr("opacity", positive ? 0.88 : 0.25);
      if (positive) {
        g.append("text").attr("x", targetW + 6).attr("y", yc + y.bandwidth() / 2 + 4)
          .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
          .text(d3.format(".1%")(d.weight));
      }
    });
  }

  // ------------------------------------------------------------------
  // Tab 3: actual and synthetic paths, or the gap between them.
  //   data: array of { year, actual, synthetic, gap }
  //   options: { showActual, showSynthetic, showGap, treatmentYear }
  // ------------------------------------------------------------------
  function paths_chart(container) {
    function pointHtml(d, label, color) {
      return `<div><strong style="color:${color}">${label}</strong></div>` +
        `<div><span class='tooltip-key'>year</span> <span class='tooltip-val'>${d.year}</span></div>` +
        `<div><span class='tooltip-key'>actual</span> <span class='tooltip-val'>${num(d.actual, 1)}</span></div>` +
        `<div><span class='tooltip-key'>synthetic</span> <span class='tooltip-val'>${num(d.synthetic, 2)}</span></div>` +
        `<div><span class='tooltip-key'>gap</span> <span class='tooltip-val'>${num(d.gap, 2)}</span></div>`;
    }

    function update(data, opts) {
      opts = opts || { showActual: true, showSynthetic: true, showGap: false, treatmentYear: 1989 };
      const { W, compact } = layout(container, 760);
      const H = compact ? 330 : 420;
      const margin = compact
        ? { top: 18, right: 12, bottom: 88, left: 46 }
        : { top: 24, right: 30, bottom: 84, left: 56 };
      const w = W - margin.left - margin.right;
      const h = H - margin.top - margin.bottom;
      const svg = ensureSVG(container, W, H);
      const tooltip = getTooltip(container);
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
      const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
      const yAxisG = g.append("g");
      const linesG = g.append("g");

      g.append("text").attr("transform", `translate(${w / 2},${h + 34})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Year");
      const yLabel = g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${compact ? -36 : -44})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12);

      const years = data.map(d => d.year);
      const x = d3.scaleLinear().domain(d3.extent(years)).range([0, w]);

      let yMin, yMax;
      if (opts.showGap) {
        const gaps = data.map(d => d.gap);
        yMin = Math.min(0, d3.min(gaps) || 0) - 2;
        yMax = Math.max(0, d3.max(gaps) || 0) + 2;
        yLabel.text(compact ? "Gap (packs per capita)" : "Gap = actual − synthetic (packs per capita)");
      } else {
        const vals = [];
        if (opts.showActual)    data.forEach(d => vals.push(d.actual));
        if (opts.showSynthetic) data.forEach(d => vals.push(d.synthetic));
        if (vals.length === 0) vals.push(0, 100);
        yMin = d3.min(vals) - 5;
        yMax = d3.max(vals) + 5;
        yLabel.text(compact ? "Packs per capita" : "Cigarette sales (packs per capita)");
      }
      const y = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

      xAxisG.call(d3.axisBottom(x).ticks(compact ? 4 : 8).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(y).ticks(compact ? 5 : 6))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Shade the pre-treatment years.
      const treatX = x(opts.treatmentYear);
      linesG.append("rect")
        .attr("x", 0).attr("y", 0).attr("width", treatX).attr("height", h)
        .attr("fill", C.muted).attr("opacity", 0.07);

      // Mark the first treated year.
      linesG.append("line").attr("x1", treatX).attr("x2", treatX)
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.muted).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
      linesG.append("text").attr("x", treatX + 4).attr("y", 12)
        .attr("fill", C.muted).attr("font-size", 10)
        .text(compact ? "Proposition 99" : `Proposition 99 (${opts.treatmentYear})`);

      if (opts.showGap) {
        linesG.append("line").attr("x1", 0).attr("x2", w)
          .attr("y1", y(0)).attr("y2", y(0))
          .attr("stroke", C.faint).attr("stroke-dasharray", "2 4");
      }

      const lineGen = d3.line().curve(d3.curveMonotoneX);

      if (opts.showActual && !opts.showGap) {
        linesG.append("path").attr("class", "series-actual")
          .attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.6)
          .attr("d", lineGen.x(d => x(d.year)).y(d => y(d.actual))(data));
      }
      if (opts.showSynthetic && !opts.showGap) {
        linesG.append("path").attr("class", "series-synthetic")
          .attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2.4)
          .attr("stroke-dasharray", "6 4")
          .attr("d", lineGen.x(d => x(d.year)).y(d => y(d.synthetic))(data));
      }
      if (opts.showGap) {
        linesG.append("path").attr("class", "series-gap")
          .attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 2.6)
          .attr("d", lineGen.x(d => x(d.year)).y(d => y(d.gap))(data));
        const peak = data.reduce((a, b) => (Math.abs(b.gap) > Math.abs(a.gap) ? b : a), data[0]);
        linesG.append("circle").attr("cx", x(peak.year)).attr("cy", y(peak.gap))
          .attr("r", 5).attr("fill", C.orange).attr("stroke", "#fff").attr("stroke-width", 1);
        linesG.append("text").attr("x", x(peak.year) - 8).attr("y", y(peak.gap) + 4)
          .attr("text-anchor", "end")
          .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
          .text(`Peak ${peak.year}: ${num(peak.gap, 2)}`);
      }

      // Hover points for each series that is visible.
      const series = [];
      if (opts.showGap) {
        series.push({ key: "gap", label: "Gap", color: C.teal });
      } else {
        if (opts.showActual)    series.push({ key: "actual", label: "Actual California", color: C.orange });
        if (opts.showSynthetic) series.push({ key: "synthetic", label: "Synthetic California", color: C.steel });
      }
      series.forEach(s => {
        data.forEach(d => {
          linesG.append("circle").attr("cx", x(d.year)).attr("cy", y(d[s.key]))
            .attr("r", compact ? 2.6 : 3.2).attr("fill", s.color).attr("opacity", 0.65)
            .style("cursor", "pointer")
            .on("mousemove", ev => showTooltip(tooltip, container, ev, pointHtml(d, s.label, s.color)))
            .on("mouseleave", () => hideTooltip(tooltip));
        });
      });

      // Legend below the axis title, outside the plot area. On phones the
      // items stack vertically so the labels never run past the edge.
      const legendY = h + 52;
      const lg = g.append("g").attr("class", "paths-legend")
        .attr("transform", `translate(0,${legendY})`);
      const items = [];
      if (opts.showGap) {
        items.push({ label: "Gap (actual − synthetic)", color: C.teal, dashed: false });
      } else {
        if (opts.showActual)    items.push({ label: "Actual California (observed)", color: C.orange, dashed: false });
        if (opts.showSynthetic) items.push({ label: "Synthetic California (counterfactual)", color: C.steel, dashed: true });
      }
      // Approximate text width: about 6.6 px per character at 12 px.
      const itemSpacing = 18;
      const swatchW = 22;
      const widths = items.map(it => swatchW + 6 + it.label.length * 6.6);
      const totalW = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * itemSpacing;
      const stacked = totalW > w;
      let cursorX = stacked ? 0 : Math.max(0, (w - totalW) / 2);
      items.forEach((it, i) => {
        const yOff = stacked ? i * 18 : 0;
        const line = lg.append("line")
          .attr("x1", cursorX).attr("x2", cursorX + swatchW)
          .attr("y1", 6 + yOff).attr("y2", 6 + yOff)
          .attr("stroke", it.color).attr("stroke-width", 2.6);
        if (it.dashed) line.attr("stroke-dasharray", "6 4");
        lg.append("text")
          .attr("x", cursorX + swatchW + 6).attr("y", 10 + yOff)
          .attr("fill", C.text).attr("font-size", 12)
          .text(it.label);
        if (!stacked) cursorX += widths[i] + itemSpacing;
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 4: in-space placebo ranking by the post/pre MSPE ratio.
  //   data: array of { region, ratio, pre_mspe, post_mspe, pre_mspe_rel,
  //                    retained, rank, rank_trimmed }
  //   opts: { trimmedOnly: bool }
  //   California is orange and the runner-up of the current view is mint.
  //   In the full view, the units that cut(2) removes are dimmed.
  // ------------------------------------------------------------------
  function placebo_chart(container) {
    function update(data, opts) {
      opts = opts || { trimmedOnly: true };
      const { W, compact } = layout(container, 760);
      const margin = compact
        ? { top: 12, right: 42, bottom: 40, left: 100 }
        : { top: 20, right: 40, bottom: 40, left: 200 };
      const filtered = opts.trimmedOnly
        ? data.filter(d => d.rank_trimmed !== null && d.rank_trimmed !== undefined)
        : data;
      const sorted = filtered.slice().sort((a, b) => b.ratio - a.ratio);
      const runnerUp = sorted.find(d => d.region !== "California");
      const barH = compact ? 18 : 22;
      const facetH = sorted.length * barH + 10;
      const totalH = margin.top + facetH + margin.bottom;
      const w = W - margin.left - margin.right;
      const svg = ensureSVG(container, W, totalH);
      const tooltip = getTooltip(container);
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const xMax = Math.max(1, d3.max(sorted, d => d.ratio) || 1) * 1.05;
      const x = d3.scaleLinear().domain([0, xMax]).range([0, w]);
      const y = d3.scaleBand().domain(sorted.map(d => d.region))
        .range([0, facetH]).padding(0.25);

      g.append("g").attr("transform", `translate(0,${facetH})`)
        .call(d3.axisBottom(x).ticks(compact ? 4 : 6))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${facetH + 34})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text(compact ? "Post/pre MSPE ratio" : "Ratio of post-1989 MSPE to pre-1989 MSPE");

      sorted.forEach(d => {
        const yc = y(d.region);
        const isCalifornia = d.region === "California";
        const isRunnerUp = runnerUp && d.region === runnerUp.region;
        const dropped = !d.retained;
        const color = isCalifornia ? C.orange : (isRunnerUp ? C.mint : (dropped ? C.muted : C.steel));

        g.append("text").attr("x", -10).attr("y", yc + y.bandwidth() / 2 + 4)
          .attr("text-anchor", "end")
          .attr("fill", isCalifornia ? C.orange : (dropped ? C.muted : C.text))
          .attr("font-size", 11).attr("font-weight", isCalifornia ? 700 : 400)
          .text(d.region);

        const targetW = x(d.ratio);
        g.append("rect")
          .attr("class", "placebo-bar")
          .attr("x", 0).attr("y", yc).attr("height", y.bandwidth())
          .attr("width", Math.max(1, targetW))
          .attr("fill", color).attr("opacity", isCalifornia ? 0.95 : (dropped ? 0.35 : 0.65));

        g.append("text").attr("x", targetW + 6).attr("y", yc + y.bandwidth() / 2 + 4)
          .attr("fill", dropped ? C.muted : C.text).attr("font-size", 11)
          .attr("font-weight", isCalifornia ? 700 : 400)
          .text(num(d.ratio, d.ratio < 1 ? 2 : 1));

        // A transparent target over the whole row, so that the thin bars of
        // poorly fitted states still respond to the pointer.
        g.append("rect")
          .attr("class", "placebo-hit")
          .attr("x", -margin.left).attr("y", yc).attr("height", y.bandwidth())
          .attr("width", margin.left + w)
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("mousemove", ev => showTooltip(tooltip, container, ev,
            `<div><strong style="color:${color}">${d.region}</strong></div>` +
            `<div><span class='tooltip-key'>ratio</span> <span class='tooltip-val'>${num(d.ratio, 2)}</span></div>` +
            `<div><span class='tooltip-key'>pre-MSPE</span> <span class='tooltip-val'>${num(d.pre_mspe, 4)}</span></div>` +
            `<div><span class='tooltip-key'>post-MSPE</span> <span class='tooltip-val'>${num(d.post_mspe, 4)}</span></div>` +
            `<div><span class='tooltip-key'>pre-MSPE relative to California</span> <span class='tooltip-val'>${num(d.pre_mspe_rel, 2)}</span></div>` +
            `<div><span class='tooltip-key'>rank (full / trimmed)</span> <span class='tooltip-val'>${d.rank} / ${d.rank_trimmed ?? "n/a"}</span></div>`))
          .on("mouseleave", () => hideTooltip(tooltip));
      });
    }
    return { update };
  }

  window.CHARTS = {
    donor_weight_animation,
    donor_weights_bar,
    paths_chart,
    placebo_chart,
    num,
    C,
  };
})();
