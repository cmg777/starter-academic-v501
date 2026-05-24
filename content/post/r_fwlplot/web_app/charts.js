// charts.js — D3 chart builders for the FWL web app.
//
// Extends the base library used in r_double_lasso. The forest_plot and
// selection_bars builders are kept verbatim so the Tab 3 forest plot for
// real-data FWL coefficients works out of the box. Three FWL-specific
// builders are added on top:
//
//   - fwl_animation:        a residualization "fog lifts" animation for Tab 1.
//                            Two scatter clouds (raw vs partialled) ease back
//                            and forth as time evolves.
//   - fwl_scatter_pair:     side-by-side naive scatter (left) and FWL scatter
//                            (right), both with their fitted regression lines.
//   - within_panel_scatter: a single scatter showing the wage panel — raw
//                            cross-section (mode="raw") vs individual-FE
//                            demeaning (mode="within"), with the slope label.
//
// All builders accept a DOM container and return an object exposing an
// `update(...)` method.

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
  // OLS slope/intercept on (x, y), for a small array.
  // ------------------------------------------------------------------
  function ols_xy(x, y) {
    const n = x.length;
    let mx = 0, my = 0;
    for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; }
    mx /= n; my /= n;
    let sxy = 0, sxx = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - mx;
      sxy += dx * (y[i] - my);
      sxx += dx * dx;
    }
    const slope = sxx > 0 ? sxy / sxx : 0;
    const intercept = my - slope * mx;
    return { slope, intercept };
  }

  // ------------------------------------------------------------------
  // Generate the store DGP in JS so the simulator runs interactively.
  //   y      = sales
  //   x1     = coupons
  //   x2     = income (confounder)
  //   true_alpha     := coefficient of x1 on y
  //   gamma          := coefficient of x2 on y
  //   delta          := slope of x1 on x2 (negative confounding)
  // ------------------------------------------------------------------
  function simulate_store(opts) {
    opts = opts || {};
    const n = opts.n || 200;
    const true_alpha = opts.true_alpha != null ? opts.true_alpha : 0.2;
    const gamma = opts.gamma != null ? opts.gamma : 0.3;
    const delta = opts.delta != null ? opts.delta : -0.5;
    const seed = opts.seed != null ? opts.seed : 42;

    // Seeded RNG (Mulberry32 — same as dgp.js).
    let a = seed >>> 0;
    function rng() {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    // Box-Muller standard normal.
    let cached = null;
    function rnorm() {
      if (cached !== null) { const r = cached; cached = null; return r; }
      let u, v;
      do { u = rng(); } while (u < 1e-10);
      v = rng();
      const mag = Math.sqrt(-2 * Math.log(u));
      cached = mag * Math.sin(2 * Math.PI * v);
      return mag * Math.cos(2 * Math.PI * v);
    }

    const income = new Array(n);
    const coupons = new Array(n);
    const sales = new Array(n);
    for (let i = 0; i < n; i++) {
      income[i]  = 50 + 10 * rnorm();
      coupons[i] = 60 + delta * income[i] + 5 * rnorm();
      sales[i]   = 10 + true_alpha * coupons[i] + gamma * income[i] + 3 * rnorm();
    }
    return { n, income, coupons, sales, true_alpha, gamma, delta };
  }

  // FWL residualization: regress 'a' on 'b', return residuals.
  function residualize(a, b) {
    const { slope, intercept } = ols_xy(b, a);
    const n = a.length;
    const out = new Array(n);
    for (let i = 0; i < n; i++) out[i] = a[i] - (intercept + slope * b[i]);
    return out;
  }

  // ------------------------------------------------------------------
  // Tab 1 — FWL animation. Two side-by-side panels:
  //   LEFT  panel: raw scatter (sales vs coupons), wrong-sign slope.
  //   RIGHT panel: as time advances, points morph from raw to residualized.
  // A "time slider" t in [0, 1] mixes raw and residualized coordinates.
  // ------------------------------------------------------------------
  function fwl_animation(container) {
    const W = 760, H = 320;
    const margin = { top: 28, right: 16, bottom: 44, left: 50 };
    const gap = 28;
    const panelW = (W - margin.left - margin.right - gap) / 2;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);

    // Generate fixed store data with default confounding.
    const sim = simulate_store({ n: 150, seed: 42 });
    const x_raw = sim.coupons.slice();
    const y_raw = sim.sales.slice();
    const x_res = residualize(sim.coupons, sim.income);
    const y_res = residualize(sim.sales, sim.income);

    // Center raw and residualized for the morphing animation so the
    // RIGHT panel scales nicely.
    function center(arr) {
      let m = 0;
      for (let i = 0; i < arr.length; i++) m += arr[i];
      m /= arr.length;
      return arr.map(v => v - m);
    }
    const x_raw_c = center(x_raw);
    const y_raw_c = center(y_raw);
    // x_res / y_res are already centered by construction (residuals from OLS
    // have mean zero).

    // Fixed axis range covering both raw and residualized.
    const xMin = Math.min(d3.min(x_raw_c), d3.min(x_res)) - 2;
    const xMax = Math.max(d3.max(x_raw_c), d3.max(x_res)) + 2;
    const yMin = Math.min(d3.min(y_raw_c), d3.min(y_res)) - 2;
    const yMax = Math.max(d3.max(y_raw_c), d3.max(y_res)) + 2;

    // LEFT panel: raw.
    const gL = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const xL = d3.scaleLinear().domain([xMin, xMax]).range([0, panelW]);
    const yL = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

    gL.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(xL).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    gL.append("g").call(d3.axisLeft(yL).ticks(5)).selectAll("text").attr("fill", C.muted);
    gL.selectAll(".domain, .tick line").attr("stroke", C.muted);
    gL.append("text").attr("x", panelW / 2).attr("y", -10)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600)
      .text("Raw: sales vs coupons");
    gL.append("text").attr("x", panelW / 2).attr("y", h + 32)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
      .text("coupons (centered)");

    gL.selectAll("circle.raw").data(x_raw_c.map((x, i) => [x, y_raw_c[i]]))
      .enter().append("circle")
      .attr("class", "raw")
      .attr("cx", d => xL(d[0])).attr("cy", d => yL(d[1])).attr("r", 2.8)
      .attr("fill", C.orange).attr("opacity", 0.55);

    const raw_fit = ols_xy(x_raw_c, y_raw_c);
    gL.append("line")
      .attr("x1", xL(xMin)).attr("x2", xL(xMax))
      .attr("y1", yL(raw_fit.intercept + raw_fit.slope * xMin))
      .attr("y2", yL(raw_fit.intercept + raw_fit.slope * xMax))
      .attr("stroke", C.orange).attr("stroke-width", 2);
    gL.append("text").attr("x", panelW - 8).attr("y", 14)
      .attr("text-anchor", "end").attr("fill", C.orange).attr("font-size", 11)
      .attr("paint-order", "stroke").attr("stroke", C.bg).attr("stroke-width", 3)
      .text(`slope = ${raw_fit.slope.toFixed(3)} (wrong sign!)`);

    // RIGHT panel: morphing.
    const gR = svg.append("g").attr("transform", `translate(${margin.left + panelW + gap},${margin.top})`);
    const xR = d3.scaleLinear().domain([xMin, xMax]).range([0, panelW]);
    const yR = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

    gR.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(xR).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    gR.append("g").call(d3.axisLeft(yR).ticks(5)).selectAll("text").attr("fill", C.muted);
    gR.selectAll(".domain, .tick line").attr("stroke", C.muted);
    const titleR = gR.append("text").attr("x", panelW / 2).attr("y", -10)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600);
    const subR = gR.append("text").attr("x", panelW / 2).attr("y", h + 32)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11);

    const circles = gR.selectAll("circle.morph").data(x_raw_c.map((x, i) => i))
      .enter().append("circle")
      .attr("class", "morph")
      .attr("r", 2.8)
      .attr("fill", C.teal).attr("opacity", 0.65);

    const fitLine = gR.append("line")
      .attr("stroke", C.teal).attr("stroke-width", 2);
    const slopeLabel = gR.append("text")
      .attr("x", panelW - 8).attr("y", 14)
      .attr("text-anchor", "end").attr("fill", C.teal).attr("font-size", 11)
      .attr("paint-order", "stroke").attr("stroke", C.bg).attr("stroke-width", 3);

    // Animate t from 0 -> 1 -> 0 ... in a slow cycle.
    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      // Period ~6s, ease in/out: 0 -> 1 -> 0.
      const cycle = (Math.sin(elapsed * (2 * Math.PI / 6) - Math.PI / 2) + 1) / 2;
      const t = cycle;
      circles
        .attr("cx", (d, i) => xR(x_raw_c[i] * (1 - t) + x_res[i] * t))
        .attr("cy", (d, i) => yR(y_raw_c[i] * (1 - t) + y_res[i] * t));
      // Live OLS fit on the morphed cloud.
      const xMor = new Array(x_raw_c.length);
      const yMor = new Array(x_raw_c.length);
      for (let i = 0; i < x_raw_c.length; i++) {
        xMor[i] = x_raw_c[i] * (1 - t) + x_res[i] * t;
        yMor[i] = y_raw_c[i] * (1 - t) + y_res[i] * t;
      }
      const fit = ols_xy(xMor, yMor);
      fitLine
        .attr("x1", xR(xMin)).attr("x2", xR(xMax))
        .attr("y1", yR(fit.intercept + fit.slope * xMin))
        .attr("y2", yR(fit.intercept + fit.slope * xMax));
      slopeLabel.text(`slope = ${fit.slope.toFixed(3)}`);
      titleR.text(t < 0.05 ? "Raw → FWL (residualizing on income)"
        : t > 0.95 ? "After FWL: partialled scatter"
        : `Residualizing on income: t = ${t.toFixed(2)}`);
      subR.text(t < 0.5 ? "fog of confounding still present"
        : "income removed from both axes");
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------------
  // Tab 2 — FWL scatter pair. Two panels side by side:
  //   LEFT  : raw scatter (y vs x_treatment), slope = naive coefficient.
  //   RIGHT : FWL scatter (resid_y vs resid_x_treatment), slope = controlled coefficient.
  //   Both panels overlay OLS line and slope label.
  // Returns { update(sim) } where sim = {coupons, sales, income, ...}.
  // ------------------------------------------------------------------
  function fwl_scatter_pair(container) {
    const W = 760, H = 320;
    const margin = { top: 32, right: 16, bottom: 44, left: 50 };
    const gap = 28;
    const panelW = (W - margin.left - margin.right - gap) / 2;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);

    const gL = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const gR = svg.append("g").attr("transform", `translate(${margin.left + panelW + gap},${margin.top})`);

    function drawPanel(g, x, y, color, title, slope) {
      g.selectAll("*").remove();
      const xMin = d3.min(x) - 1, xMax = d3.max(x) + 1;
      const yMin = d3.min(y) - 1, yMax = d3.max(y) + 1;
      const xs = d3.scaleLinear().domain([xMin, xMax]).range([0, panelW]);
      const ys = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(xs).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(ys).ticks(5)).selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text").attr("x", panelW / 2).attr("y", -10)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600)
        .text(title);

      g.selectAll("circle").data(x.map((d, i) => [d, y[i]])).enter().append("circle")
        .attr("cx", d => xs(d[0])).attr("cy", d => ys(d[1]))
        .attr("r", 2.8).attr("fill", color).attr("opacity", 0.55);

      const fit = ols_xy(x, y);
      g.append("line")
        .attr("x1", xs(xMin)).attr("x2", xs(xMax))
        .attr("y1", ys(fit.intercept + fit.slope * xMin))
        .attr("y2", ys(fit.intercept + fit.slope * xMax))
        .attr("stroke", color).attr("stroke-width", 2);
      g.append("text").attr("x", panelW - 8).attr("y", 14)
        .attr("text-anchor", "end").attr("fill", color).attr("font-size", 11)
        .attr("paint-order", "stroke").attr("stroke", C.bg).attr("stroke-width", 3)
        .text(`slope = ${fit.slope.toFixed(3)}`);
      return fit.slope;
    }

    function update(sim) {
      const x_raw = sim.coupons;
      const y_raw = sim.sales;
      const x_res = residualize(sim.coupons, sim.income);
      const y_res = residualize(sim.sales, sim.income);
      const naive = drawPanel(gL, x_raw, y_raw, C.orange,
                              "Naive: sales vs coupons (confounded)");
      const fwl = drawPanel(gR, x_res, y_res, C.teal,
                            "FWL: residualized on income");
      return { naive, fwl };
    }

    return { update };
  }

  // ------------------------------------------------------------------
  // Tab 4 — Within (panel FE) scatter. A panel of N individuals each
  // observed for T years. Mode "raw" plots lwage vs exper; mode "within"
  // demeans by individual. The slope label updates.
  // Synthetic data with strong unobserved-ability heterogeneity but
  // homogeneous within-person returns. Mimics the wage panel finding.
  // ------------------------------------------------------------------
  function within_panel_scatter(container) {
    const W = 760, H = 360;
    const margin = { top: 32, right: 24, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Build synthetic panel: 60 individuals * 8 years.
    function buildPanel(seed) {
      let a = (seed || 1) >>> 0;
      function rng() {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }
      let cached = null;
      function rnorm() {
        if (cached !== null) { const r = cached; cached = null; return r; }
        let u, v;
        do { u = rng(); } while (u < 1e-10);
        v = rng();
        const mag = Math.sqrt(-2 * Math.log(u));
        cached = mag * Math.sin(2 * Math.PI * v);
        return mag * Math.cos(2 * Math.PI * v);
      }
      const N = 60, T = 8;
      const exper = [], lwage = [], id = [];
      const beta_within = 0.122; // matches post §7.2
      for (let i = 0; i < N; i++) {
        const ability = 0.8 * rnorm();      // unobserved
        const baseExp = 2 + 12 * rng();     // individual baseline experience
        for (let t = 0; t < T; t++) {
          const e = baseExp + t;
          // Higher-ability individuals systematically accumulate experience in
          // higher-paying jobs (positive ability-exper covariance via baseExp
          // assignment) — but at fixed ability, returns are beta_within.
          const lw = 1.4 + ability + beta_within * (e - baseExp) - 0.4 * ability + 0.15 * rnorm();
          exper.push(e); lwage.push(lw); id.push(i);
        }
      }
      return { exper, lwage, id, N, T };
    }
    const panel = buildPanel(7);

    // Per-individual means for within transformation.
    function withinTransform() {
      const sumX = {}, sumY = {}, cnt = {};
      for (let i = 0; i < panel.exper.length; i++) {
        const k = panel.id[i];
        sumX[k] = (sumX[k] || 0) + panel.exper[i];
        sumY[k] = (sumY[k] || 0) + panel.lwage[i];
        cnt[k]  = (cnt[k] || 0) + 1;
      }
      const x = new Array(panel.exper.length);
      const y = new Array(panel.lwage.length);
      for (let i = 0; i < panel.exper.length; i++) {
        const k = panel.id[i];
        x[i] = panel.exper[i] - sumX[k] / cnt[k];
        y[i] = panel.lwage[i] - sumY[k] / cnt[k];
      }
      return { x, y };
    }

    function update(mode) {
      g.selectAll("*").remove();
      let x, y, color, title, sub;
      if (mode === "within") {
        const w = withinTransform();
        x = w.x; y = w.y;
        color = C.teal;
        title = "Individual FE (within-person residualization)";
        sub = "subtract each person's mean from exper and lwage";
      } else {
        x = panel.exper; y = panel.lwage;
        color = C.orange;
        title = "Pooled raw scatter (no FE)";
        sub = "every person's variation mixed together";
      }
      const xMin = d3.min(x) - 0.5, xMax = d3.max(x) + 0.5;
      const yMin = d3.min(y) - 0.2, yMax = d3.max(y) + 0.2;
      const xs = d3.scaleLinear().domain([xMin, xMax]).range([0, w]);
      const ys = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(xs).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(ys).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text").attr("x", w / 2).attr("y", -12)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600)
        .text(title);
      g.append("text").attr("x", w / 2).attr("y", h + 36)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
        .text(mode === "within" ? "experience (deviation from personal mean)" : "experience (years)");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-42})`)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
        .text(mode === "within" ? "log(wage) (deviation from personal mean)" : "log(wage)");

      // Color points by individual id (for raw mode).
      const colorScale = d3.scaleSequential(d3.interpolateCool).domain([0, panel.N]);
      g.selectAll("circle").data(x.map((d, i) => i)).enter().append("circle")
        .attr("cx", i => xs(x[i])).attr("cy", i => ys(y[i]))
        .attr("r", 2.5)
        .attr("fill", i => mode === "within" ? color : colorScale(panel.id[i]))
        .attr("opacity", 0.55);

      const fit = ols_xy(x, y);
      g.append("line")
        .attr("x1", xs(xMin)).attr("x2", xs(xMax))
        .attr("y1", ys(fit.intercept + fit.slope * xMin))
        .attr("y2", ys(fit.intercept + fit.slope * xMax))
        .attr("stroke", color).attr("stroke-width", 2.5);
      g.append("text").attr("x", w - 10).attr("y", 14)
        .attr("text-anchor", "end").attr("fill", color).attr("font-size", 12)
        .attr("paint-order", "stroke").attr("stroke", C.bg).attr("stroke-width", 3)
        .text(`slope = ${fit.slope.toFixed(3)}`);
      g.append("text").attr("x", w - 10).attr("y", 30)
        .attr("text-anchor", "end").attr("fill", C.muted).attr("font-size", 10)
        .attr("paint-order", "stroke").attr("stroke", C.bg).attr("stroke-width", 3)
        .text(sub);
      return fit.slope;
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Forest plot — same as r_double_lasso, kept verbatim for Tab 3.
  // data: array of { method, outcome, estimate, ci_lo, ci_hi, n_selected, se }
  // ------------------------------------------------------------------
  function forest_plot(container) {
    const W = 880;
    const margin = { top: 28, right: 24, bottom: 36, left: 170 };
    const facetGap = 24;
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 320`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const colorMap = {
      "Naive":              C.orange,
      "+ Income":           C.teal,
      "+ Inc + Day":        C.steel,
      "+ Origin FE":        C.teal,
      "+ Orig+Dest":        C.steel,
      "+ Individual FE":    C.teal,
    };
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(data, activeMethods, activeOutcomes) {
      const allOutcomes = Array.from(new Set(data.map(d => d.outcome)));
      const allMethods = Array.from(new Set(data.map(d => d.method)));
      const outcomes = activeOutcomes.length ? activeOutcomes.filter(o => allOutcomes.includes(o)) : allOutcomes;
      const methods = activeMethods.length ? activeMethods.filter(m => allMethods.includes(m)) : allMethods;

      const rows = data.filter(d => outcomes.includes(d.outcome) && methods.includes(d.method));
      const nFacets = outcomes.length;
      const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / nFacets;
      const facetH = 32 * methods.length + 24;
      const totalH = margin.top + facetH + margin.bottom;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.facet, text.facet").remove();

      outcomes.forEach((outcome, oi) => {
        const facet = svg.append("g")
          .attr("class", "facet")
          .attr("transform", `translate(${margin.left + oi * (facetW + facetGap)},${margin.top})`);

        const subset = rows.filter(d => d.outcome === outcome);
        const ext = d3.extent(subset.flatMap(d => [d.ci_lo, d.ci_hi]));
        const xMin = Math.min(0, ext[0] || 0);
        const xMax = Math.max(0, ext[1] || 0);
        const pad = Math.max(0.05, (xMax - xMin) * 0.15);
        const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, facetW]);
        const y = d3.scaleBand().domain(methods).range([0, facetH]).padding(0.35);

        facet.append("text").attr("x", facetW / 2).attr("y", -10)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
          .attr("font-weight", 600).text(outcome);

        facet.append("line").attr("x1", x(0)).attr("x2", x(0))
          .attr("y1", 0).attr("y2", facetH)
          .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 4");

        facet.append("g").attr("transform", `translate(0,${facetH})`)
          .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".3f")))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

        if (oi === 0) {
          methods.forEach(m => {
            svg.append("text")
              .attr("class", "facet")
              .attr("x", margin.left - 10)
              .attr("y", margin.top + y(m) + y.bandwidth() / 2 + 4)
              .attr("text-anchor", "end")
              .attr("fill", C.text)
              .attr("font-size", 12)
              .text(m);
          });
        }

        subset.forEach(d => {
          const yc = y(d.method) + y.bandwidth() / 2;
          const grp = facet.append("g").attr("class", "row").style("cursor", "pointer");
          const color = colorMap[d.method] || C.text;
          grp.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
            .attr("y1", yc).attr("y2", yc)
            .attr("stroke", color).attr("stroke-width", 2);
          grp.append("line")
            .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
            .attr("y1", yc - 4).attr("y2", yc + 4)
            .attr("stroke", color).attr("stroke-width", 2);
          grp.append("line")
            .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
            .attr("y1", yc - 4).attr("y2", yc + 4)
            .attr("stroke", color).attr("stroke-width", 2);
          grp.append("circle")
            .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
            .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 1);

          grp.on("mousemove", function (ev) {
            const rect = container.getBoundingClientRect();
            tooltip.html(
              `<div><strong style="color:${color}">${d.method}</strong></div>` +
              `<div><span class='tooltip-key'>β̂ =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(4)}, ${d.ci_hi.toFixed(4)}]</span></div>` +
              `<div><span class='tooltip-key'>controls/FE used =</span> <span class='tooltip-val'>${d.n_selected === null ? "—" : d.n_selected}</span></div>`
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
  // Side-by-side bar chart: naive estimate vs FWL estimate vs true alpha.
  // Used in Tab 2 to compare the two coefficients under current DGP knobs.
  // ------------------------------------------------------------------
  function fwl_compare(container) {
    const W = 720, H = 200;
    const margin = { top: 24, right: 24, bottom: 36, left: 110 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const labels = [
        { name: "Naive",         v: data.naive,      color: C.orange },
        { name: "FWL (income)",  v: data.fwl,        color: C.teal   },
      ];
      const allVals = labels.map(d => d.v).concat([data.true_alpha, 0]);
      const ext = d3.extent(allVals);
      const span = Math.max(0.3, ext[1] - ext[0]);
      const pad = span * 0.15;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const y = d3.scaleBand().domain(labels.map(d => d.name)).range([0, h]).padding(0.4);

      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      g.append("line").attr("x1", x(data.true_alpha)).attr("x2", x(data.true_alpha))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.true_alpha) + 4).attr("y", -8)
        .attr("fill", C.steel).attr("font-size", 11)
        .attr("paint-order", "stroke").attr("stroke", C.panel).attr("stroke-width", 3)
        .text(`true β = ${data.true_alpha.toFixed(2)}`);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      const xTrue = x(data.true_alpha);
      labels.forEach(d => {
        const yc = y(d.name) + y.bandwidth() / 2;
        g.append("text").attr("x", -10).attr("y", yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(d.name);
        const x0 = x(0);
        const x1 = x(d.v);
        g.append("rect")
          .attr("x", Math.min(x0, x1))
          .attr("y", yc - y.bandwidth() / 2 + y.bandwidth() * 0.15)
          .attr("width", Math.abs(x1 - x0))
          .attr("height", y.bandwidth() * 0.7)
          .attr("fill", d.color).attr("opacity", 0.85);
        // Default: place value label past the bar end.
        // If that puts it within 14px of the vertical true-β line (and the
        // bar end isn't already past it), flip to the inside of the bar so
        // the label and the true-β line don't sit on top of each other.
        let tx = x1 + (x1 >= x0 ? 6 : -6);
        let anchor = x1 >= x0 ? "start" : "end";
        if (Math.abs(tx - xTrue) < 14 && Math.abs(x1 - x0) > 32) {
          // Place inside the bar on the same side as the bar's "growing" direction.
          tx = x1 + (x1 >= x0 ? -6 : 6);
          anchor = x1 >= x0 ? "end" : "start";
        }
        g.append("text").attr("x", tx)
          .attr("text-anchor", anchor)
          .attr("y", yc + 4)
          .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
          .attr("paint-order", "stroke").attr("stroke", C.panel).attr("stroke-width", 3)
          .text(d.v.toFixed(4));
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Histograms (Tab 2 "Run 100 simulations"): naive vs FWL estimates.
  // ------------------------------------------------------------------
  function fwl_histograms(container) {
    const W = 720, H = 260;
    const margin = { top: 18, right: 24, bottom: 38, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(data) {
      g.selectAll("*").remove();
      const all = data.naive_arr.concat(data.fwl_arr);
      if (all.length === 0) return;
      const ext = d3.extent(all);
      const span = Math.max(0.2, ext[1] - ext[0]);
      const pad = span * 0.05;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const bin = d3.bin().domain(x.domain()).thresholds(24);
      const bN = bin(data.naive_arr);
      const bF = bin(data.fwl_arr);
      const maxC = d3.max(bN.concat(bF), d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      function drawBars(bins, color, opacity) {
        g.selectAll(null).data(bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", color).attr("opacity", opacity);
      }
      drawBars(bN, C.orange, 0.65);
      drawBars(bF, C.teal,   0.85);

      g.append("line").attr("x1", x(data.true_alpha)).attr("x2", x(data.true_alpha))
        .attr("y1", 0).attr("y2", h).attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("text").attr("x", x(data.true_alpha) + 4).attr("y", 10)
        .attr("fill", C.steel).attr("font-size", 11)
        .attr("paint-order", "stroke").attr("stroke", C.panel).attr("stroke-width", 3)
        .text(`true β = ${data.true_alpha.toFixed(2)}`);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated β̂ across 100 simulated datasets");
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // Stub: keep the legacy selection_bars name so the smoke loader does not
  // need to know about FWL specifics. Not used by the FWL app, but exposed
  // for parity with the base library.
  // ------------------------------------------------------------------
  function selection_bars(container) {
    const svg = ensureSVG(container, 720, 80);
    svg.append("text").attr("x", 360).attr("y", 40)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
      .text("(selection bars not used in this FWL app)");
    return { update: function () {} };
  }

  // Exports.
  window.CHARTS = {
    fwl_animation,
    fwl_scatter_pair,
    within_panel_scatter,
    forest_plot,
    fwl_compare,
    fwl_histograms,
    selection_bars,
    // Utilities used by app.js for live simulation:
    simulate_store,
    residualize,
    ols_xy,
    C,
  };
})();
