// charts.js — D3 chart builders for the Staggered Synthetic Difference-in-
// Differences (SDID) web app on parliamentary gender quotas.
//
// Every builder takes a DOM container, draws an <svg> with a viewBox so it
// scales responsively, and returns an object with an `update(...)` method so
// control changes patch the existing chart. All data arrives as plain arrays
// of objects parsed from the CSVs in data/ by app.js — charts.js never fetches.

(function () {
  "use strict";

  const C = {
    bg:     "#1f2b5e",
    panel:  "#182447",
    steel:  "#6a9bcc",  // control / synthetic / pre-period
    orange: "#d97757",  // treated / post-period
    teal:   "#00d4c8",  // SDID aggregate / positive effect
    ink:    "#141413",
    text:   "#e8ecf2",
    muted:  "#8b9dc3",
    line:   "rgba(232, 236, 242, 0.18)",
    grid:   "rgba(232, 236, 242, 0.08)",
    faint:  "rgba(232, 236, 242, 0.15)",
  };

  function ensureSVG(container, viewBoxW, viewBoxH) {
    container.innerHTML = "";
    return d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxW} ${viewBoxH}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img");
  }

  function styleAxes(g) {
    g.selectAll(".domain").attr("stroke", C.muted);
    g.selectAll(".tick line").attr("stroke", C.muted);
    g.selectAll(".tick text").attr("fill", C.muted).attr("font-size", 11);
  }

  // ------------------------------------------------------------------
  // 1. Cohort-effect chart (Tab 2). Per-cohort SDID effect tau_a with a 95%
  //    CI whisker, sign-colored (teal positive, orange negative), a zero line,
  //    and a horizontal aggregate-ATT line. Hovering a cohort fires onHover.
  //
  //    cohorts: [{cohort, tau, se, lci, uci, n_treated, t_post, agg_weight}]
  //    aggAtt: number (e.g. 8.03)
  // ------------------------------------------------------------------
  function cohort_bars(container, onHover) {
    const W = 760, H = 420;
    const margin = { top: 22, right: 26, bottom: 60, left: 54 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    svg.attr("aria-label", "Cohort-specific SDID effects with 95% confidence intervals.");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 42})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Adoption year (cohort)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Cohort effect on women in parliament (pp)");

    function update(cohorts, aggAtt) {
      g.selectAll(".dyn").remove();
      const x = d3.scaleLinear().domain([1999, 2014]).range([0, w]);
      const lo = d3.min(cohorts, d => d.lci), hi = d3.max(cohorts, d => d.uci);
      const y = d3.scaleLinear().domain([Math.min(0, lo) - 2, hi + 2]).nice().range([h, 0]);

      g.append("g").attr("class", "dyn").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).tickValues(cohorts.map(d => d.cohort)).tickFormat(d3.format("d")));
      g.append("g").attr("class", "dyn").call(d3.axisLeft(y).ticks(7));
      styleAxes(g);

      // zero line
      g.append("line").attr("class", "dyn")
        .attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      // aggregate ATT line (teal)
      g.append("line").attr("class", "dyn")
        .attr("x1", 0).attr("x2", w).attr("y1", y(aggAtt)).attr("y2", y(aggAtt))
        .attr("stroke", C.teal).attr("stroke-width", 2);
      g.append("text").attr("class", "dyn")
        .attr("x", w - 2).attr("y", y(aggAtt) - 6).attr("text-anchor", "end")
        .attr("fill", C.teal).attr("font-size", 11).attr("font-weight", 600)
        .text(`aggregate ATT ${aggAtt.toFixed(1)}`);

      cohorts.forEach(d => {
        const col = d.tau >= 0 ? C.teal : C.orange;
        // CI whisker
        g.append("line").attr("class", "dyn")
          .attr("x1", x(d.cohort)).attr("x2", x(d.cohort))
          .attr("y1", y(d.lci)).attr("y2", y(d.uci))
          .attr("stroke", C.steel).attr("stroke-width", 1.6);
        // caps
        [d.lci, d.uci].forEach(v => {
          g.append("line").attr("class", "dyn")
            .attr("x1", x(d.cohort) - 5).attr("x2", x(d.cohort) + 5)
            .attr("y1", y(v)).attr("y2", y(v))
            .attr("stroke", C.steel).attr("stroke-width", 1.6);
        });
        // diamond marker
        g.append("path").attr("class", "dyn")
          .attr("d", d3.symbol().type(d3.symbolDiamond).size(150))
          .attr("transform", `translate(${x(d.cohort)},${y(d.tau)})`)
          .attr("fill", col)
          .style("cursor", "pointer")
          .on("mouseenter", () => onHover && onHover(d))
          .append("title").text(`${d.cohort}: ${d.tau.toFixed(1)} pp`);
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // 2. Adoption-timeline strip (Tab 2). One row per cohort; a steel pre-period
  //    bar and an orange post-adoption bar from the adoption year to 2015 — the
  //    staggered "staircase" in miniature.
  //
  //    cohorts: [{cohort, n_treated, ...}]  (sorted ascending by cohort)
  // ------------------------------------------------------------------
  function adoption_timeline(container) {
    const W = 760;
    const margin = { top: 16, right: 24, bottom: 36, left: 64 };

    function update(cohorts) {
      const rows = cohorts.slice().sort((a, b) => a.cohort - b.cohort);
      const rowH = 26;
      const h = rowH * rows.length;
      const H = margin.top + h + margin.bottom;
      const w = W - margin.left - margin.right;
      const svg = ensureSVG(container, W, H);
      svg.attr("aria-label", "Adoption timeline: each cohort's pre- and post-treatment periods.");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear().domain([1990, 2015]).range([0, w]);
      const y = d3.scaleBand().domain(rows.map(d => d.cohort)).range([0, h]).padding(0.28);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));
      g.append("g").call(d3.axisLeft(y).tickFormat(d3.format("d")).tickSize(0));
      styleAxes(g);
      g.selectAll(".domain").remove();
      g.selectAll(".tick text").attr("fill", C.text);

      rows.forEach(d => {
        const yy = y(d.cohort), bh = y.bandwidth();
        // pre-period (steel)
        g.append("rect")
          .attr("x", x(1990)).attr("y", yy)
          .attr("width", Math.max(0, x(d.cohort) - x(1990))).attr("height", bh)
          .attr("fill", C.steel).attr("opacity", 0.30).attr("rx", 2);
        // post-period (orange)
        g.append("rect")
          .attr("x", x(d.cohort)).attr("y", yy)
          .attr("width", Math.max(0, x(2015) - x(d.cohort))).attr("height", bh)
          .attr("fill", C.orange).attr("opacity", 0.85).attr("rx", 2);
        // count label
        g.append("text")
          .attr("x", x(2015) + 4).attr("y", yy + bh / 2 + 4)
          .attr("fill", C.muted).attr("font-size", 10.5)
          .text(d.n_treated === 1 ? "1 country" : d.n_treated + " countries");
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // 3. Counterfactual path (Tab 3). Treated cohort (orange) vs its anchored
  //    synthetic control (steel dashed), with a vertical line at adoption.
  //
  //    rows: [{year, y_treated, y_synth_anch}]  (anchored in app.js)
  //    adoptionYear: number
  // ------------------------------------------------------------------
  function cf_path(container) {
    const W = 760, H = 380;
    const margin = { top: 22, right: 26, bottom: 70, left: 52 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    svg.attr("aria-label", "Treated cohort versus its synthetic control over time.");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 38})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Year");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("% women in parliament");

    function update(rows, adoptionYear) {
      g.selectAll(".dyn").remove();
      const x = d3.scaleLinear().domain(d3.extent(rows, d => d.year)).range([0, w]);
      const ys = rows.flatMap(d => [d.y_treated, d.y_synth_anch]);
      const y = d3.scaleLinear().domain([Math.min(0, d3.min(ys)), d3.max(ys) * 1.08]).nice().range([h, 0]);

      g.append("g").attr("class", "dyn").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d")));
      g.append("g").attr("class", "dyn").call(d3.axisLeft(y).ticks(6));
      styleAxes(g);

      // post-adoption shade + ref line
      g.append("rect").attr("class", "dyn")
        .attr("x", x(adoptionYear)).attr("width", Math.max(0, w - x(adoptionYear)))
        .attr("y", 0).attr("height", h).attr("fill", "rgba(217, 119, 87, 0.06)");
      g.append("line").attr("class", "dyn")
        .attr("x1", x(adoptionYear)).attr("x2", x(adoptionYear)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.muted).attr("stroke-dasharray", "4 4");
      g.append("text").attr("class", "dyn")
        .attr("x", x(adoptionYear)).attr("y", 12).attr("text-anchor", "middle")
        .attr("fill", C.muted).attr("font-size", 11).text(`adoption ${adoptionYear}`);

      const lineGen = d3.line().x(d => x(d.year)).curve(d3.curveMonotoneX);
      g.append("path").attr("class", "dyn").attr("fill", "none")
        .attr("stroke", C.steel).attr("stroke-width", 2.2).attr("stroke-dasharray", "5 4")
        .attr("d", lineGen.y(d => y(d.y_synth_anch))(rows));
      g.append("path").attr("class", "dyn").attr("fill", "none")
        .attr("stroke", C.orange).attr("stroke-width", 3.2)
        .attr("d", lineGen.y(d => y(d.y_treated))(rows));

      // legend below
      const items = [
        { label: "Treated cohort", color: C.orange, dash: null, sw: 3.2 },
        { label: "Synthetic control (anchored)", color: C.steel, dash: "5 4", sw: 2.2 },
      ];
      const swLen = 26, txtGap = 7, itemGap = 26, fs = 12;
      const estW = s => s.length * 6.6;
      const widths = items.map(it => swLen + txtGap + estW(it.label));
      const totalW = widths.reduce((a, b) => a + b, 0) + itemGap * (items.length - 1);
      const leg = g.append("g").attr("class", "dyn").attr("transform", `translate(0,${h + 56})`);
      let cx = Math.max(0, (w - totalW) / 2);
      items.forEach((it, i) => {
        const ig = leg.append("g").attr("transform", `translate(${cx},0)`);
        ig.append("line").attr("x1", 0).attr("x2", swLen).attr("y1", 0).attr("y2", 0)
          .attr("stroke", it.color).attr("stroke-width", it.sw).attr("stroke-dasharray", it.dash);
        ig.append("text").attr("x", swLen + txtGap).attr("y", 4)
          .attr("fill", C.text).attr("font-size", fs).text(it.label);
        cx += widths[i] + itemGap;
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // 4. Horizontal weight bars (Tab 3). Donor unit weights omega for one cohort.
  //    rows: [{country, weight}]  (already sorted desc); topN cap.
  // ------------------------------------------------------------------
  function weight_bars(container, opts) {
    opts = opts || {};
    const topN = opts.topN || 12;
    const color = opts.color || C.steel;
    const W = 360;
    const margin = { top: 20, right: 48, bottom: 26, left: 120 };

    function update(rows) {
      const data = (rows || []).filter(d => d.weight > 0).slice(0, topN);
      const rowH = 22;
      const h = Math.max(rowH * data.length, rowH);
      const H = margin.top + h + margin.bottom;
      const w = W - margin.left - margin.right;
      const svg = ensureSVG(container, W, H);
      svg.attr("aria-label", "Donor country weights for the selected cohort.");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      if (data.length === 0) {
        g.append("text").attr("x", 0).attr("y", 14).attr("fill", C.muted)
          .attr("font-size", 12).text("No nonzero donor weights.");
        return;
      }
      const maxW = d3.max(data, d => d.weight) || 1;
      const x = d3.scaleLinear().domain([0, maxW]).range([0, w]);
      const y = d3.scaleBand().domain(data.map(d => d.country)).range([0, h]).padding(0.25);

      g.append("g").call(d3.axisLeft(y).tickSize(0));
      g.selectAll(".domain").remove();
      g.selectAll(".tick text").attr("fill", C.text).attr("font-size", 11);

      data.forEach(d => {
        g.append("rect")
          .attr("x", 0).attr("y", y(d.country))
          .attr("width", Math.max(1, x(d.weight))).attr("height", y.bandwidth())
          .attr("fill", color).attr("opacity", 0.85).attr("rx", 2);
        g.append("text")
          .attr("x", x(d.weight) + 5).attr("y", y(d.country) + y.bandwidth() / 2 + 4)
          .attr("fill", C.muted).attr("font-size", 10.5)
          .text(d.weight.toFixed(3));
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // 5. Event-study chart (Tab 4). Dynamic effects by event time with a 95% CI
  //    ribbon; pre-period (placebo) points in steel, post-period in orange; a
  //    teal zero line and a vertical line at adoption (event time 0).
  //
  //    rows: [{event_time, coef, se, ci_l, ci_u, period_type}]
  // ------------------------------------------------------------------
  function event_study(container) {
    const W = 760, H = 420;
    const margin = { top: 26, right: 26, bottom: 70, left: 52 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    svg.attr("aria-label", "Event-study dynamic effects with 95% confidence intervals.");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Years relative to quota adoption (event time)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Effect on women in parliament (pp)");

    function update(rows) {
      g.selectAll(".dyn").remove();
      const data = rows.slice().sort((a, b) => a.event_time - b.event_time);
      const x = d3.scaleLinear().domain(d3.extent(data, d => d.event_time)).range([0, w]);
      const lo = d3.min(data, d => d.ci_l), hi = d3.max(data, d => d.ci_u);
      const y = d3.scaleLinear().domain([Math.min(0, lo) - 1, hi + 1]).nice().range([h, 0]);

      g.append("g").attr("class", "dyn").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format("d")));
      g.append("g").attr("class", "dyn").call(d3.axisLeft(y).ticks(7));
      styleAxes(g);

      // CI ribbon
      const areaGen = d3.area().x(d => x(d.event_time))
        .y0(d => y(d.ci_l)).y1(d => y(d.ci_u)).curve(d3.curveMonotoneX);
      g.append("path").attr("class", "dyn").attr("d", areaGen(data))
        .attr("fill", C.steel).attr("opacity", 0.18);

      // zero line (teal) + adoption line at -0.5
      g.append("line").attr("class", "dyn")
        .attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.teal).attr("stroke-width", 1.4).attr("stroke-dasharray", "4 4");
      g.append("line").attr("class", "dyn")
        .attr("x1", x(-0.5)).attr("x2", x(-0.5)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.muted).attr("stroke-width", 1);
      g.append("text").attr("class", "dyn")
        .attr("x", x(-0.5)).attr("y", -8).attr("text-anchor", "middle")
        .attr("fill", C.muted).attr("font-size", 11).text("adoption");

      // connecting line
      const lineGen = d3.line().x(d => x(d.event_time)).y(d => y(d.coef)).curve(d3.curveMonotoneX);
      g.append("path").attr("class", "dyn").attr("fill", "none")
        .attr("stroke", C.orange).attr("stroke-width", 1.6).attr("opacity", 0.6)
        .attr("d", lineGen(data.filter(d => d.period_type === "post")));

      // points
      data.forEach(d => {
        const col = d.period_type === "post" ? C.orange : C.steel;
        g.append("circle").attr("class", "dyn")
          .attr("cx", x(d.event_time)).attr("cy", y(d.coef)).attr("r", 3.6)
          .attr("fill", col)
          .style("cursor", "pointer")
          .append("title")
          .text(`event time ${d.event_time}: ${d.coef.toFixed(2)} pp  [${d.ci_l.toFixed(1)}, ${d.ci_u.toFixed(1)}]`);
      });

      // legend
      const items = [
        { label: "post (dynamic effect)", color: C.orange },
        { label: "pre (placebo)", color: C.steel },
      ];
      const swLen = 14, txtGap = 6, itemGap = 24, fs = 12;
      const estW = s => s.length * 6.4;
      const widths = items.map(it => swLen + txtGap + estW(it.label));
      const totalW = widths.reduce((a, b) => a + b, 0) + itemGap * (items.length - 1);
      const leg = g.append("g").attr("class", "dyn").attr("transform", `translate(0,${h + 56})`);
      let cx = Math.max(0, (w - totalW) / 2);
      items.forEach((it, i) => {
        const ig = leg.append("g").attr("transform", `translate(${cx},0)`);
        ig.append("circle").attr("cx", 6).attr("cy", 0).attr("r", 5).attr("fill", it.color);
        ig.append("text").attr("x", swLen + txtGap).attr("y", 4)
          .attr("fill", C.text).attr("font-size", fs).text(it.label);
        cx += widths[i] + itemGap;
      });
    }
    return { update };
  }

  window.CHARTS = {
    cohort_bars,
    adoption_timeline,
    cf_path,
    weight_bars,
    event_study,
    C,
  };
})();
