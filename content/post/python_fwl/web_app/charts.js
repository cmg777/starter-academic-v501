// charts.js — D3 chart builders for the FWL Interactive Lab.
//
// Every builder takes a container element and returns an object whose
// update(...) / render(...) redraws from data. Charts size their viewBox to
// the container's current width (clamped), so text keeps a readable pixel
// size on phones; app.js re-renders the active pane on tab switch and resize.
//
// Depends on window.d3 and window.DGP (dgp.js). Exported as window.CHARTS.

(function () {
  "use strict";

  const C = {
    bg:    "#1f2b5e",
    panel: "#182447",
    steel: "#6a9bcc",
    orange:"#d97757",
    teal:  "#00d4c8",
    text:  "#e8ecf2",
    soft:  "#c8d0e0",
    muted: "#8b9dc3",
    mint:  "#9bdcc3",
    grid:  "rgba(232, 236, 242, 0.08)",
    faint: "rgba(232, 236, 242, 0.25)",
  };

  // Minus sign (U+2212) for negative numbers in chart text.
  function num(x, dp) {
    if (x === null || x === undefined || !Number.isFinite(x)) return "—";
    const s = Math.abs(x).toFixed(dp);
    return (x < 0 && +s !== 0 ? "−" : "") + s;
  }

  // Width in CSS pixels available to a chart, clamped to [min, max]. Hidden
  // containers report 0, so fall back to the viewport width.
  function chartWidth(container, min, max) {
    let w = (container && container.clientWidth) || 0;
    if (w && typeof getComputedStyle === "function") {
      const cs = getComputedStyle(container);
      w -= (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    }
    if (!w && typeof document !== "undefined" && document.documentElement) {
      w = (document.documentElement.clientWidth || 0) - 64;
    }
    if (!w || !Number.isFinite(w)) w = max;
    return Math.max(min, Math.min(max, Math.round(w)));
  }

  function ensureSVG(container, viewBoxW, viewBoxH, label) {
    container.innerHTML = "";
    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${viewBoxW} ${viewBoxH}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img");
    if (label) svg.attr("aria-label", label);
    return svg;
  }

  function styleAxis(sel) {
    sel.selectAll("text").attr("fill", C.muted).attr("font-size", 11);
    sel.selectAll(".domain, .tick line").attr("stroke", C.muted);
  }

  function olsLine(y, x) {
    const n = x.length;
    let mx = 0, my = 0;
    for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; }
    mx /= n; my /= n;
    let sxy = 0, sxx = 0;
    for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; }
    const b = sxy / sxx;
    return { a: my - b * mx, b };
  }

  // ------------------------------------------------------------------
  // Tab 1 — FWL residualization animation on the post's 50 stores.
  //   Phase 0: naive view, sales vs coupons (the slope has the wrong sign).
  //   Phase 1: partial out income, coupons vs income with the fit and dashed
  //            residuals (sales are residualized the same way, not drawn).
  //   Phase 2: residuals on residuals, residualized sales vs residualized
  //            coupons (the post's FWL Step 2). Phase labels avoid "Step 1":
  //            the post's Step 1 regresses raw sales on residualized coupons.
  //   sample: { sales, coupons, income } arrays (results.json "sample").
  //   ui: { title, note } optional HTML elements for the phase text.
  // ------------------------------------------------------------------
  function fwl_residualization_animation(container, sample, ui) {
    ui = ui || {};
    const sales = Array.from(sample.sales);
    const coupons = Array.from(sample.coupons);
    const income = Array.from(sample.income);
    const N = sales.length;
    const fit = window.DGP.fit_fwl(sales, coupons, income);
    const naiveLine = olsLine(sales, coupons);        // slope = fit.naive.b
    const partialLine = olsLine(coupons, income);       // slope = fit.pi_hat
    const cT = Array.from(fit.coupons_tilde);
    const sT = Array.from(fit.sales_tilde);

    const PHASES = [
      {
        key: "naive",
        title: "Naive view — sales against coupons, income ignored",
        note: () => `Slope of sales on coupons = ${num(fit.naive.b, 4)}: the wrong sign (the true effect is positive).`,
        x: coupons, y: sales, xLab: "Coupon usage (%)", yLab: "Daily sales",
        line: naiveLine, lineColor: C.orange, ptColor: C.steel,
      },
      {
        key: "partial",
        title: "Partial out income — regress coupons (and sales) on income; keep the residuals (dashed)",
        note: () => `Slope of coupons on income = ${num(fit.pi_hat, 4)}: richer neighborhoods use fewer coupons. Sales are residualized on income the same way (not drawn).`,
        x: income, y: coupons, xLab: "Neighborhood income", yLab: "Coupon usage (%)",
        line: partialLine, lineColor: C.soft, ptColor: C.steel,
      },
      {
        key: "resid",
        title: "Residuals on residuals — regress residualized sales on residualized coupons (the post's Step 2)",
        note: () => `Slope of sales residuals on coupon residuals = ${num(fit.fwl.b, 4)}: the same number as the full regression.`,
        x: cT, y: sT, xLab: "Residualized coupons (income removed)", yLab: "Residualized sales",
        line: { a: 0, b: fit.fwl.b }, lineColor: C.teal, ptColor: C.teal,
      },
    ];

    let state = { phase: 0, progress: 0, playing: true, active: true, raf: null, t0: null, lastPhase: -1 };
    const PHASE_SEC = 4.5;
    const reduceMotion = typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) { state.playing = false; state.progress = 1; }

    let W, H, g, w, h, xAxisG, yAxisG, xLabel, yLabel, pts, fitLine, resLines, xS, yS;

    function build() {
      W = chartWidth(container, 300, 1180);
      H = Math.round(Math.max(260, Math.min(420, W * 0.5)));
      const margin = { top: 14, right: 16, bottom: 46, left: W < 480 ? 46 : 58 };
      w = W - margin.left - margin.right;
      h = H - margin.top - margin.bottom;
      const svg = ensureSVG(container, W, H,
        "Animated scatter plots of the post's 50 stores: naive view, partialling out income, residuals on residuals");
      g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
      xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
      yAxisG = g.append("g");
      xLabel = g.append("text").attr("x", w / 2).attr("y", h + 38)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12);
      yLabel = g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-(margin.left - 14)})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12);
      resLines = g.append("g").attr("class", "reslines");
      pts = g.append("g").attr("class", "pts");
      fitLine = g.append("line").attr("stroke-width", 2.5).style("display", "none");
      state.lastPhase = -1;
    }

    function setPhaseChrome(p) {
      const P = PHASES[p];
      const pad = (ext) => { const d = (ext[1] - ext[0]) * 0.06 || 1; return [ext[0] - d, ext[1] + d]; };
      xS = d3.scaleLinear().domain(pad(d3.extent(P.x))).nice().range([0, w]);
      yS = d3.scaleLinear().domain(pad(d3.extent(P.y))).nice().range([h, 0]);
      xAxisG.call(d3.axisBottom(xS).ticks(W < 480 ? 4 : 6)); styleAxis(xAxisG);
      yAxisG.call(d3.axisLeft(yS).ticks(5)); styleAxis(yAxisG);
      xLabel.text(P.xLab);
      yLabel.text(P.yLab);
      if (ui.title) ui.title.textContent = `${p + 1} / 3 · ${P.title}`;
      if (ui.note) ui.note.textContent = P.note();
      if (ui.onPhase) ui.onPhase(p);
      const circles = pts.selectAll("circle").data(d3.range(N));
      circles.enter().append("circle").attr("r", W < 480 ? 3.5 : 4.5)
        .attr("stroke", "#0f1729").attr("stroke-width", 0.8)
        .merge(circles)
        .attr("cx", i => xS(P.x[i])).attr("cy", i => yS(P.y[i]))
        .attr("fill", P.ptColor);
      const lines = resLines.selectAll("line").data(p === 1 ? d3.range(N) : []);
      lines.exit().remove();
      lines.enter().append("line")
        .attr("stroke", C.teal).attr("stroke-width", 1.3).attr("stroke-dasharray", "3 3")
        .merge(lines)
        .attr("x1", i => xS(income[i])).attr("x2", i => xS(income[i]))
        .attr("y1", i => yS(coupons[i]))
        .attr("y2", i => yS(partialLine.a + partialLine.b * income[i]));
      state.lastPhase = p;
    }

    function draw(p, progress) {
      if (p !== state.lastPhase) setPhaseChrome(p);
      const P = PHASES[p];
      pts.selectAll("circle").attr("opacity", Math.min(1, 0.15 + progress / 0.3));
      if (progress > 0.3) {
        const d = xS.domain();
        fitLine.style("display", null)
          .attr("stroke", P.lineColor)
          .attr("x1", xS(d[0])).attr("y1", yS(P.line.a + P.line.b * d[0]))
          .attr("x2", xS(d[1])).attr("y2", yS(P.line.a + P.line.b * d[1]))
          .attr("opacity", Math.min(1, (progress - 0.3) * 4));
      } else {
        fitLine.style("display", "none");
      }
      resLines.selectAll("line").attr("opacity", Math.max(0, Math.min(1, (progress - 0.5) * 3)));
    }

    function frame(ts) {
      state.raf = null;
      if (!state.playing || !state.active) return;
      if (state.t0 === null) state.t0 = ts - (state.phase + state.progress * 0.6) * PHASE_SEC * 1000;
      const u = ((ts - state.t0) / 1000) / PHASE_SEC;
      const total = u % 3;
      state.phase = Math.floor(total);
      // Build-up over the first 60% of a phase, then hold.
      state.progress = Math.min(1, (total - state.phase) / 0.6);
      draw(state.phase, state.progress);
      state.raf = requestAnimationFrame(frame);
    }

    function kick() {
      if (state.raf === null && state.playing && state.active && typeof requestAnimationFrame === "function") {
        state.t0 = null;
        state.raf = requestAnimationFrame(frame);
      }
    }

    build();
    draw(state.phase, state.progress);
    kick();

    return {
      fit,
      phases: PHASES.map(P => P.key),
      setActive(on) {
        state.active = !!on;
        if (!on && state.raf !== null && typeof cancelAnimationFrame === "function") {
          cancelAnimationFrame(state.raf); state.raf = null;
        }
        kick();
      },
      goTo(p) {
        state.playing = false;
        state.phase = Math.max(0, Math.min(2, p | 0));
        state.progress = 1;
        draw(state.phase, 1);
      },
      toggle() {
        state.playing = !state.playing;
        if (!state.playing && state.raf !== null && typeof cancelAnimationFrame === "function") {
          cancelAnimationFrame(state.raf); state.raf = null;
        }
        kick();
        return state.playing;
      },
      isPlaying() { return state.playing; },
      render() { build(); draw(state.phase, state.progress); },
    };
  }

  // ------------------------------------------------------------------
  // Tab 2 — naive vs FWL bars with the true-effect reference line.
  //   data: { naive, fwl, beta_true }
  // ------------------------------------------------------------------
  function naive_vs_fwl_bars(container) {
    let last = null;
    function update(data) {
      last = data;
      const W = chartWidth(container, 300, 1180);
      const narrow = W < 480;
      const H = narrow ? 200 : 220;
      const margin = { top: 40, right: narrow ? 44 : 56, bottom: 34, left: narrow ? 70 : 120 };
      const w = W - margin.left - margin.right;
      const h = H - margin.top - margin.bottom;
      const svg = ensureSVG(container, W, H, "Bar chart comparing the naive and FWL coupon slopes with the true effect");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
      const labels = [
        { name: narrow ? "Naive" : "Naive OLS", v: data.naive, color: C.orange },
        { name: narrow ? "FWL" : "FWL / Full OLS", v: data.fwl, color: C.teal },
      ];
      const allVals = labels.map(d => d.v).concat([data.beta_true, 0]).filter(Number.isFinite);
      const ext = d3.extent(allVals);
      const span = Math.max(0.5, ext[1] - ext[0]);
      const pad = span * 0.2;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const y = d3.scaleBand().domain(labels.map(d => d.name)).range([0, h]).padding(0.4);

      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      g.append("line").attr("x1", x(data.beta_true)).attr("x2", x(data.beta_true))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.beta_true)).attr("y", -16)
        .attr("text-anchor", "middle").attr("fill", C.steel)
        .attr("font-size", 11).attr("font-weight", 600)
        .text(`true β = ${num(data.beta_true, 2)}`);

      const ax = g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(narrow ? 4 : 6).tickFormat(d3.format(".2f")));
      styleAxis(ax);

      labels.forEach(d => {
        const yc = y(d.name) + y.bandwidth() / 2;
        g.append("text").attr("x", -10).attr("y", yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(d.name);
        if (!Number.isFinite(d.v)) return;
        const x0 = x(0), x1 = x(d.v);
        g.append("rect")
          .attr("x", Math.min(x0, x1))
          .attr("y", yc - y.bandwidth() * 0.35)
          .attr("width", Math.abs(x1 - x0))
          .attr("height", y.bandwidth() * 0.7)
          .attr("fill", d.color).attr("opacity", 0.85);
        // Value label outside the bar end; moved inside the bar when it
        // would run into the category labels or past the right edge.
        const label = num(d.v, 3);
        const tw = 7.5 * label.length;
        const pos = x1 >= x0;
        const outside = pos ? x1 + 6 + tw <= w + margin.right - 2 : x1 - 6 - tw >= -4;
        const inside = outside ? false : Math.abs(x1 - x0) > tw + 10;
        g.append("text")
          .attr("x", outside ? x1 + (pos ? 6 : -6) : x1 + (pos ? -6 : 6))
          .attr("text-anchor", (pos === outside) ? "start" : "end")
          .attr("y", yc + 4)
          .attr("fill", inside ? "#0f1729" : C.text).attr("font-size", 12).attr("font-weight", 600)
          .text(label);
      });
    }
    return { update, render() { if (last) update(last); } };
  }

  // ------------------------------------------------------------------
  // Tab 4 — histograms of naive vs FWL estimates across simulated samples.
  //   data: { naive: number[], fwl: number[], beta_true, plim }
  //   plim = beta + gamma * delta, the value naive OLS converges to.
  // ------------------------------------------------------------------
  function naive_vs_fwl_histograms(container) {
    let last = null;
    function update(data) {
      last = data;
      const W = chartWidth(container, 300, 1180);
      const narrow = W < 520;
      const H = narrow ? 300 : 320;
      const stack = (W - 58) / 4 < 195;   // legend items would collide in one row
      const margin = { top: stack ? 84 : 50, right: 18, bottom: 42, left: 40 };
      const w = W - margin.left - margin.right;
      const h = H - margin.top - margin.bottom;
      const svg = ensureSVG(container, W, H, "Histograms of naive and FWL estimates across simulated samples");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
      const all = data.naive.concat(data.fwl, [data.beta_true, data.plim]).filter(Number.isFinite);
      if (!data.naive.length && !data.fwl.length) return;
      const ext = d3.extent(all);
      const span = Math.max(0.4, ext[1] - ext[0]);
      const pad = span * 0.06;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const bin = d3.bin().domain(x.domain()).thresholds(narrow ? 18 : 26);
      const binsN = bin(data.naive);
      const binsF = bin(data.fwl);
      const maxC = d3.max(binsN.concat(binsF), d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      function drawBars(bins, color, opacity) {
        g.selectAll(null).data(bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", color).attr("opacity", opacity);
      }
      drawBars(binsN, C.orange, 0.65);
      drawBars(binsF, C.teal, 0.8);

      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      g.append("line").attr("x1", x(data.beta_true)).attr("x2", x(data.beta_true))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.steel).attr("stroke-width", 2);
      if (Number.isFinite(data.plim)) {
        g.append("line").attr("x1", x(data.plim)).attr("x2", x(data.plim))
          .attr("y1", 0).attr("y2", h).attr("stroke", C.orange).attr("stroke-width", 2)
          .attr("stroke-dasharray", "6 4");
      }

      const ax = g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(narrow ? 5 : 8).tickFormat(d3.format(".2f")));
      styleAxis(ax);
      styleAxis(g.append("g").call(d3.axisLeft(y).ticks(5)));
      g.append("text").attr("x", w / 2).attr("y", h + 36)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text(narrow ? "Coupon estimate in each sample" : "Estimated coupon coefficient across simulated samples");

      // Legend above the plot area (one item per row on narrow screens) so it never
      // overlaps the bars.
      const items = [
        { kind: "rect", color: C.orange, opacity: 0.65, label: "Naive OLS (omits income)" },
        { kind: "rect", color: C.teal, opacity: 0.8, label: "FWL (controls for income)" },
        { kind: "line", color: C.steel, dash: null, label: `True β = ${num(data.beta_true, 2)}` },
        { kind: "line", color: C.orange, dash: "6 4", label: "Predicted naive mean β + γ·δ" },
      ];
      const lg = g.append("g").attr("transform", `translate(0,${-margin.top + 8})`);
      const colW = w / 4;
      items.forEach((it, k) => {
        const col = stack ? 0 : k;
        const row = stack ? k : 0;
        const gi = lg.append("g").attr("transform", `translate(${col * colW},${row * 17})`);
        if (it.kind === "rect") {
          gi.append("rect").attr("width", 14).attr("height", 10)
            .attr("fill", it.color).attr("opacity", it.opacity);
        } else {
          gi.append("line").attr("x1", 0).attr("x2", 14).attr("y1", 5).attr("y2", 5)
            .attr("stroke", it.color).attr("stroke-width", 2)
            .attr("stroke-dasharray", it.dash);
        }
        gi.append("text").attr("x", 19).attr("y", 9).attr("fill", C.text)
          .attr("font-size", narrow ? 10 : 11).text(it.label);
      });
    }
    return { update, render() { if (last) update(last); } };
  }

  // ------------------------------------------------------------------
  // Tab 3 — forest plot of the post's estimates (results.json "estimates").
  //   update(rows, activeMethods, trueEffect)
  //   Wide screens: labels on the left. Narrow screens: label above each row.
  // ------------------------------------------------------------------
  const FOREST_COLORS = {
    "Naive OLS (no controls)":         C.orange,
    "Full OLS (+ income)":             C.teal,
    "FWL Step 1 (residualize X only)": C.steel,
    "FWL Step 1 + intercept":          C.muted,
    "FWL Step 2 (residualize both)":   C.teal,
    "Full OLS (+ income + day)":       C.mint,
    "FWL (+ income + day)":            C.mint,
  };

  function fwl_forest_plot(container) {
    let last = null;
    function update(rows, activeMethods, trueEffect) {
      last = [rows, activeMethods, trueEffect];
      const methods = rows.map(r => r.method).filter(m => activeMethods.includes(m));
      const filtered = methods.map(m => rows.find(r => r.method === m));
      const W = chartWidth(container, 300, 1180);
      const narrow = W < 560;
      const rowH = narrow ? 50 : 36;
      const margin = { top: 30, right: 20, bottom: 46, left: narrow ? 12 : 230 };
      const facetH = Math.max(rowH, rowH * methods.length);
      const H = margin.top + facetH + margin.bottom;
      const w = W - margin.left - margin.right;

      container.innerHTML = "";
      const svg = d3.select(container).append("svg")
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("role", "img")
        .attr("aria-label", "Forest plot of coupon coefficients with 95% confidence intervals");
      const tooltip = d3.select(container).append("div").attr("class", "tooltip");

      if (!filtered.length) {
        svg.append("text").attr("x", W / 2).attr("y", H / 2).attr("text-anchor", "middle")
          .attr("fill", C.muted).attr("font-size", 13).text("Select at least one method above.");
        return;
      }

      const ext = d3.extent(filtered.flatMap(d => [d.ci_lo, d.ci_hi]).concat([0, trueEffect]));
      const pad = Math.max(0.05, (ext[1] - ext[0]) * 0.06);
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const y = d3.scaleBand().domain(methods).range([0, facetH]).padding(narrow ? 0.1 : 0.3);
      const facet = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      facet.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", facetH)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      facet.append("line").attr("x1", x(trueEffect)).attr("x2", x(trueEffect))
        .attr("y1", 0).attr("y2", facetH).attr("stroke", C.steel).attr("stroke-width", 2);
      facet.append("text").attr("x", x(trueEffect)).attr("y", -12)
        .attr("text-anchor", "middle").attr("fill", C.steel).attr("font-size", 11)
        .text(`true β = ${num(trueEffect, 2)}`);

      const ax = facet.append("g").attr("transform", `translate(0,${facetH})`)
        .call(d3.axisBottom(x).ticks(narrow ? 5 : 7).tickFormat(d3.format(".2f")));
      styleAxis(ax);
      facet.append("text").attr("x", w / 2).attr("y", facetH + 38)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Coupon coefficient with 95% CI");

      filtered.forEach(d => {
        const col = FOREST_COLORS[d.method] || C.text;
        const top = y(d.method);
        const yc = narrow ? top + y.bandwidth() * 0.68 : top + y.bandwidth() / 2;
        if (narrow) {
          facet.append("text").attr("x", 0).attr("y", top + 12)
            .attr("fill", C.text).attr("font-size", 11).text(d.method);
        } else {
          svg.append("text").attr("x", margin.left - 12).attr("y", margin.top + yc + 4)
            .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
            .text(d.method);
        }
        const grp = facet.append("g").attr("class", "row").style("cursor", "pointer");
        grp.append("rect").attr("x", 0).attr("width", w)
          .attr("y", top).attr("height", y.bandwidth()).attr("fill", "transparent");
        grp.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc).attr("stroke", col).attr("stroke-width", 2);
        [d.ci_lo, d.ci_hi].forEach(v => grp.append("line")
          .attr("x1", x(v)).attr("x2", x(v)).attr("y1", yc - 5).attr("y2", yc + 5)
          .attr("stroke", col).attr("stroke-width", 2));
        grp.append("circle").attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5.5)
          .attr("fill", col).attr("stroke", "#fff").attr("stroke-width", 1);

        function show(ev) {
          const rect = container.getBoundingClientRect();
          tooltip.html(
            `<div><strong style="color:${col}">${d.method}</strong></div>` +
            `<div><span class='tooltip-key'><span class="hat">β</span> =</span> <span class='tooltip-val'>${num(d.estimate, 4)}</span></div>` +
            `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${num(d.se, 4)}</span></div>` +
            `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${num(d.ci_lo, 3)}, ${num(d.ci_hi, 3)}]</span></div>` +
            `<div><span class='tooltip-key'>p-value =</span> <span class='tooltip-val'>${num(d.p, 3)}</span></div>` +
            `<div><span class='tooltip-key'>residual df =</span> <span class='tooltip-val'>${d.df_resid}</span></div>`
          ).classed("show", true);
          const left = Math.min(ev.clientX - rect.left + 12, rect.width - 250);
          tooltip.style("left", Math.max(4, left) + "px")
            .style("top", (ev.clientY - rect.top + 12) + "px");
        }
        // Mouse: hover shows, leaving hides. Touch/pen: a tap shows the
        // tooltip and it stays until the next tap outside a row.
        grp.on("pointermove", show).on("pointerdown", ev => { ev.stopPropagation(); show(ev); })
          .on("pointerleave", ev => { if (ev.pointerType === "mouse") tooltip.classed("show", false); });
      });
      svg.on("pointerdown", () => tooltip.classed("show", false));
    }
    return { update, render() { if (last) update.apply(null, last); } };
  }

  window.CHARTS = {
    fwl_residualization_animation,
    naive_vs_fwl_bars,
    naive_vs_fwl_histograms,
    fwl_forest_plot,
    num,
    C,
  };
})();
