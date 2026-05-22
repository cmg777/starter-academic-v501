// app.js — wires the DOM controls in index.html to dgp/charts.
// Runs after window.DGP, window.LASSO, window.CHARTS and d3 are defined.

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

  // ------------------------------------------------------------------
  // Tab switching.
  // ------------------------------------------------------------------
  function activateTab(paneId) {
    document.querySelectorAll(".tab-strip button").forEach(btn => {
      const isActive = btn.dataset.pane === paneId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === paneId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll(".tab-strip button").forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.pane));
  });
  document.querySelectorAll(".cta-card[data-goto]").forEach(card => {
    card.addEventListener("click", () => activateTab(card.dataset.goto));
  });

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  function ensureSVG(container, W, H) {
    container.innerHTML = "";
    return d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
  }

  // ------------------------------------------------------------------
  // Helper: tiny random-effects AR(1) panel.
  //   y[i,t] = rho*y[i,t-1] + alpha_i + e[i,t]
  //   alpha_i ~ N(0, sigma_alpha^2); e[i,t] ~ N(0, sigma_e^2).
  //   Burn-in 50 periods so initial conditions don't drive the estimator.
  // ------------------------------------------------------------------
  function simulatePanel(N, T, rho, sigma_e, sigma_alpha, seed) {
    const rng = DGP.mulberry32 ? DGP.mulberry32(seed) : (function () {
      // fallback if DGP.mulberry32 not exposed
      let a = seed >>> 0;
      return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })();
    const normal = DGP.makeNormal ? DGP.makeNormal(rng) : (function () {
      let cached = null;
      return function () {
        if (cached !== null) { const r = cached; cached = null; return r; }
        let u, v;
        do { u = rng(); } while (u < 1e-10);
        v = rng();
        const mag = Math.sqrt(-2 * Math.log(u));
        cached = mag * Math.sin(2 * Math.PI * v);
        return mag * Math.cos(2 * Math.PI * v);
      };
    })();

    const burn = 50;
    // y[i*T + t] in row-major (one country block per row).
    const Y = new Float64Array(N * T);
    for (let i = 0; i < N; i++) {
      const a_i = normal() * sigma_alpha;
      // start from stationary mean: a_i/(1-rho).
      let prev = a_i / Math.max(1 - rho, 0.05) + normal() * sigma_e;
      for (let b = 0; b < burn; b++) {
        prev = rho * prev + a_i + normal() * sigma_e;
      }
      for (let t = 0; t < T; t++) {
        prev = rho * prev + a_i + normal() * sigma_e;
        Y[i * T + t] = prev;
      }
    }
    return Y;
  }

  // OLS pooled rho: regress y[i,t] on y[i,t-1] (ignore fixed effects).
  function rho_OLS(Y, N, T) {
    let sxx = 0, sxy = 0, sx = 0, sy = 0, n = 0;
    for (let i = 0; i < N; i++) {
      for (let t = 1; t < T; t++) {
        const x = Y[i * T + t - 1];
        const y = Y[i * T + t];
        sxx += x * x; sxy += x * y; sx += x; sy += y; n++;
      }
    }
    const num = sxy - sx * sy / n;
    const den = sxx - sx * sx / n;
    return den > 1e-12 ? num / den : NaN;
  }

  // Within-FE rho: demean within country, regress y_demeaned[t] on y_demeaned[t-1].
  function rho_FE(Y, N, T) {
    let sxx = 0, sxy = 0;
    for (let i = 0; i < N; i++) {
      // Compute mean of y[i,1..T-1] (regressor) and y[i,2..T-1]?
      // Use within transformation on (y, L.y) pair using the same observations.
      // The standard within estimator uses overall mean of the observations entering the regression.
      let sumY = 0, sumLY = 0;
      let kCount = 0;
      for (let t = 1; t < T; t++) {
        sumY  += Y[i * T + t];
        sumLY += Y[i * T + t - 1];
        kCount++;
      }
      const muY  = sumY  / kCount;
      const muLY = sumLY / kCount;
      for (let t = 1; t < T; t++) {
        const dy = Y[i * T + t] - muY;
        const dx = Y[i * T + t - 1] - muLY;
        sxx += dx * dx;
        sxy += dx * dy;
      }
    }
    return sxx > 1e-12 ? sxy / sxx : NaN;
  }

  // Arellano-Bond simplified: instrument the differenced lag with the level
  // at t-2. For each i, the moment is Δy[i,t] = ρ Δy[i,t-1] + Δε[i,t], where
  // y[i,t-2] (level) is used as the instrument for Δy[i,t-1]. We use a
  // single-instrument 2SLS estimator across the whole panel, treating the
  // y[i,t-2] level as exogenous w.r.t. Δε[i,t]. This is the simplest one-step
  // AB estimator and is sufficient for pedagogy.
  function rho_AB(Y, N, T) {
    // Δy[i,t]   = Y[i,t]   - Y[i,t-1]   for t >= 1
    // Δy[i,t-1] = Y[i,t-1] - Y[i,t-2]   for t >= 2
    // Instrument z[i,t]   = Y[i,t-2]
    // 2SLS:  ρ̂_AB = sum(z * Δy_t) / sum(z * Δy_{t-1})
    let num = 0, den = 0;
    for (let i = 0; i < N; i++) {
      for (let t = 2; t < T; t++) {
        const z = Y[i * T + t - 2];
        const dy   = Y[i * T + t]     - Y[i * T + t - 1];
        const dyL  = Y[i * T + t - 1] - Y[i * T + t - 2];
        num += z * dy;
        den += z * dyL;
      }
    }
    return Math.abs(den) > 1e-12 ? num / den : NaN;
  }

  // ------------------------------------------------------------------
  // TAB 1 — Nickell-bias intuition animation.
  //   Pre-compute average FE-bias and AB-near-truth curves as T grows from
  //   4 to 30, holding ρ = 0.7. Replay the curves with a cycling cursor.
  // ------------------------------------------------------------------
  (function initIntroAnim() {
    const container = document.getElementById("intro-anim");
    if (!container) return;
    const W = 760, H = 320;
    const margin = { top: 28, right: 24, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const trueRho = 0.7;
    // Pre-compute the bias curves averaged over 30 panel draws per T.
    const Ts = [];
    for (let T = 4; T <= 30; T++) Ts.push(T);
    const N = 80;
    const sigma_e = 1.0;
    const sigma_a = 1.0;
    const feCurve = [];
    const abCurve = [];
    for (const T of Ts) {
      let sumFE = 0, sumAB = 0, nFE = 0, nAB = 0;
      for (let s = 0; s < 15; s++) {
        const Y = simulatePanel(N, T, trueRho, sigma_e, sigma_a, 1000 + s);
        const fe = rho_FE(Y, N, T);
        const ab = rho_AB(Y, N, T);
        if (Number.isFinite(fe)) { sumFE += fe; nFE++; }
        if (Number.isFinite(ab)) { sumAB += ab; nAB++; }
      }
      feCurve.push([T, sumFE / Math.max(1, nFE)]);
      abCurve.push([T, sumAB / Math.max(1, nAB)]);
    }

    const xScale = d3.scaleLinear().domain([4, 30]).range([0, w]);
    const yMin = Math.min(d3.min(feCurve, d => d[1]), trueRho) - 0.05;
    const yMax = Math.max(d3.max(abCurve, d => d[1]), trueRho) + 0.05;
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(7).tickFormat(d3.format("d")))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w/2},${h+36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Panel length T (number of time periods)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h/2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Estimated ρ̂ (true ρ = 0.70)");

    // True-rho reference line.
    g.append("line")
      .attr("x1", 0).attr("x2", w)
      .attr("y1", yScale(trueRho)).attr("y2", yScale(trueRho))
      .attr("stroke", C.steel).attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5 5");
    g.append("text")
      .attr("x", w - 6).attr("y", yScale(trueRho) - 6)
      .attr("text-anchor", "end").attr("fill", C.steel).attr("font-size", 11)
      .text("true ρ = 0.70");

    const lineGen = d3.line().x(d => xScale(d[0])).y(d => yScale(d[1])).curve(d3.curveMonotoneX);
    g.append("path").attr("d", lineGen(feCurve)).attr("fill", "none")
      .attr("stroke", C.orange).attr("stroke-width", 2.5);
    g.append("path").attr("d", lineGen(abCurve)).attr("fill", "none")
      .attr("stroke", C.teal).attr("stroke-width", 2.5);

    // Legend.
    const lg = g.append("g").attr("transform", `translate(${w - 240},${10})`);
    lg.append("rect").attr("width", 240).attr("height", 50)
      .attr("fill", "rgba(15,23,41,0.7)").attr("stroke", C.line).attr("rx", 6);
    lg.append("circle").attr("cx", 14).attr("cy", 15).attr("r", 5).attr("fill", C.orange);
    lg.append("text").attr("x", 26).attr("y", 19).attr("fill", C.text).attr("font-size", 12)
      .text("Fixed effects (Nickell bias)");
    lg.append("circle").attr("cx", 14).attr("cy", 35).attr("r", 5).attr("fill", C.teal);
    lg.append("text").attr("x", 26).attr("y", 39).attr("fill", C.text).attr("font-size", 12)
      .text("Arellano-Bond GMM");

    // Cycling cursor.
    const cursor = g.append("line")
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", C.faint).attr("stroke-width", 1.2);
    const feDot = g.append("circle").attr("r", 6).attr("fill", C.orange);
    const abDot = g.append("circle").attr("r", 6).attr("fill", C.teal);
    const tLabel = g.append("text")
      .attr("y", -8).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600);

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      const cycleSeconds = 8;
      const phase = (elapsed % cycleSeconds) / cycleSeconds;
      // sweep T from 4 to 30 then back.
      const sweep = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI);
      const T = 4 + sweep * 26;
      const idx = Math.max(0, Math.min(Ts.length - 1, Math.round(T - 4)));
      cursor.attr("x1", xScale(Ts[idx])).attr("x2", xScale(Ts[idx]));
      feDot.attr("cx", xScale(Ts[idx])).attr("cy", yScale(feCurve[idx][1]));
      abDot.attr("cx", xScale(Ts[idx])).attr("cy", yScale(abCurve[idx][1]));
      tLabel.attr("x", xScale(Ts[idx])).text(`T = ${Ts[idx]}`);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })();

  // ------------------------------------------------------------------
  // TAB 2 — Nickell Bias Simulator
  // ------------------------------------------------------------------
  const nb = {
    T: 10, rho: 0.7, N: 100, sigma: 1.0, sigma_alpha: 1.0, seed: 7,
    el: {
      bar: document.getElementById("nb-bar"),
    },
  };

  function nb_render() {
    if (!nb.el.bar) return;
    const Y = simulatePanel(nb.N, nb.T, nb.rho, nb.sigma, nb.sigma_alpha, nb.seed);
    const rOLS = rho_OLS(Y, nb.N, nb.T);
    const rFE  = rho_FE(Y, nb.N, nb.T);
    const rAB  = rho_AB(Y, nb.N, nb.T);

    document.getElementById("nb-stat-true").textContent = nb.rho.toFixed(2);
    document.getElementById("nb-stat-ols").textContent  = Number.isFinite(rOLS) ? rOLS.toFixed(3) : "—";
    document.getElementById("nb-stat-fe").textContent   = Number.isFinite(rFE)  ? rFE.toFixed(3)  : "—";
    document.getElementById("nb-stat-ab").textContent   = Number.isFinite(rAB)  ? rAB.toFixed(3)  : "—";

    // Draw a simple horizontal bar chart with true-rho reference line.
    const W = 760, H = 240;
    const margin = { top: 20, right: 30, bottom: 36, left: 140 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(nb.el.bar, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const bars = [
      { name: "OLS (pooled)",       v: rOLS, color: C.muted  },
      { name: "FE (within)",        v: rFE,  color: C.orange },
      { name: "Arellano-Bond GMM",  v: rAB,  color: C.teal   },
    ];
    const allVals = bars.map(b => b.v).filter(Number.isFinite).concat([nb.rho, 0]);
    const lo = Math.min.apply(null, allVals);
    const hi = Math.max.apply(null, allVals);
    const span = Math.max(0.4, hi - lo);
    const pad = span * 0.1;
    const x = d3.scaleLinear().domain([lo - pad, hi + pad]).range([0, w]);
    const y = d3.scaleBand().domain(bars.map(b => b.name)).range([0, h]).padding(0.35);

    // Zero line.
    g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
      .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
    // True ρ line.
    g.append("line").attr("x1", x(nb.rho)).attr("x2", x(nb.rho))
      .attr("y1", -8).attr("y2", h)
      .attr("stroke", C.steel).attr("stroke-width", 2);
    g.append("text").attr("x", x(nb.rho)).attr("y", -12)
      .attr("text-anchor", "middle")
      .attr("fill", C.steel).attr("font-size", 11)
      .text(`true ρ = ${nb.rho.toFixed(2)}`);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    bars.forEach(d => {
      const yc = y(d.name) + y.bandwidth() / 2;
      g.append("text").attr("x", -10).attr("y", yc + 4)
        .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
        .text(d.name);
      if (!Number.isFinite(d.v)) return;
      const x0 = x(0);
      const x1 = x(d.v);
      g.append("rect")
        .attr("x", Math.min(x0, x1))
        .attr("y", yc - y.bandwidth() / 2 + y.bandwidth() * 0.15)
        .attr("width", Math.abs(x1 - x0))
        .attr("height", y.bandwidth() * 0.7)
        .attr("fill", d.color).attr("opacity", 0.85);
      g.append("text").attr("x", x1 + (x1 >= x0 ? 6 : -6))
        .attr("text-anchor", x1 >= x0 ? "start" : "end")
        .attr("y", yc + 4)
        .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
        .text(d.v.toFixed(3));
    });
  }

  const onNbParam = debounce(nb_render, 100);
  function bindNb(id, key, prec, formatter) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", e => {
      const v = +e.target.value;
      nb[key] = v;
      const valEl = document.getElementById(id + "-val");
      if (valEl) valEl.textContent = formatter ? formatter(v) : (prec ? v.toFixed(prec) : v);
      onNbParam();
    });
  }
  bindNb("nb-T",   "T",     0);
  bindNb("nb-rho", "rho",   2);
  bindNb("nb-N",   "N",     0);
  bindNb("nb-sig", "sigma", 2);

  const nbReseed = document.getElementById("nb-reseed");
  if (nbReseed) {
    nbReseed.addEventListener("click", () => {
      nb.seed = Math.floor(Math.random() * 1e9) + 1;
      nb_render();
    });
  }
  const nbReset = document.getElementById("nb-reset");
  if (nbReset) {
    nbReset.addEventListener("click", () => {
      nb.T = 10; nb.rho = 0.7; nb.N = 100; nb.sigma = 1.0; nb.seed = 7;
      ["nb-T","nb-rho","nb-N","nb-sig"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const key = { "nb-T":"T","nb-rho":"rho","nb-N":"N","nb-sig":"sigma" }[id];
        el.value = nb[key];
        const valEl = document.getElementById(id + "-val");
        const prec = key === "rho" || key === "sigma" ? 2 : 0;
        if (valEl) valEl.textContent = prec ? nb[key].toFixed(prec) : nb[key];
      });
      nb_render();
    });
  }
  nb_render();

  // ------------------------------------------------------------------
  // TAB 3 — Forest plot from results.json
  // ------------------------------------------------------------------
  const COLOR_MODEL = {
    "Model 1": C.steel,
    "Model 2": C.teal,
    "Model 3": C.orange,
    "Model 4": "#9b6a7c",
  };

  function buildForestPlot(container) {
    const W = 880;
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(data, activeMethods, activeOutcomes) {
      const outcomes = activeOutcomes.length ? activeOutcomes : Array.from(new Set(data.map(d => d.outcome)));
      const methods  = activeMethods.length  ? activeMethods  : Array.from(new Set(data.map(d => d.method)));

      const rows = data.filter(d => outcomes.includes(d.outcome) && methods.includes(d.method));
      const margin = { top: 28, right: 24, bottom: 36, left: 220 };
      const facetGap = 22;
      const nFacets = outcomes.length;
      const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / Math.max(1, nFacets);
      const facetH = 28 * methods.length + 24;
      const totalH = margin.top + facetH + margin.bottom;

      d3.select(container).selectAll("svg").remove();
      const svg = d3.select(container).append("svg")
        .attr("viewBox", `0 0 ${W} ${totalH}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      outcomes.forEach((outcome, oi) => {
        const facet = svg.append("g").attr("class", "facet")
          .attr("transform", `translate(${margin.left + oi * (facetW + facetGap)},${margin.top})`);

        const subset = rows.filter(d => d.outcome === outcome);
        const ext = d3.extent(subset.flatMap(d => [d.ci_lo, d.ci_hi]));
        const xMin = Math.min(0, ext[0] ?? 0);
        const xMax = Math.max(0, ext[1] ?? 0);
        const pad = Math.max(0.05, (xMax - xMin) * 0.1);
        const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, facetW]);
        const y = d3.scaleBand().domain(methods).range([0, facetH]).padding(0.35);

        // Facet title.
        facet.append("text").attr("x", facetW / 2).attr("y", -10)
          .attr("text-anchor", "middle").attr("fill", C.text)
          .attr("font-size", 12).attr("font-weight", 600).text(outcome);

        // Zero line.
        facet.append("line")
          .attr("x1", x(0)).attr("x2", x(0))
          .attr("y1", 0).attr("y2", facetH)
          .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

        facet.append("g").attr("transform", `translate(0,${facetH})`)
          .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".2f")))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

        // Method labels on the leftmost facet only.
        if (oi === 0) {
          methods.forEach(m => {
            svg.append("text")
              .attr("class", "facet")
              .attr("x", margin.left - 10)
              .attr("y", margin.top + y(m) + y.bandwidth() / 2 + 4)
              .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 11)
              .text(m);
          });
        }

        subset.forEach(d => {
          const yc = y(d.method) + y.bandwidth() / 2;
          const grp = facet.append("g").style("cursor", "pointer");
          const color = COLOR_MODEL[d.method] || C.text;
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
              `<div><strong style="color:${color}">${d.method}</strong> · ${d.outcome}</div>` +
              `<div><span class='tooltip-key'>estimate =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>` +
              `<div><span class='tooltip-key'>instruments =</span> <span class='tooltip-val'>${d.n_selected}</span></div>`
            ).classed("show", true)
             .style("left", (ev.clientX - rect.left + 12) + "px")
             .style("top",  (ev.clientY - rect.top  + 12) + "px");
          }).on("mouseleave", function () { tooltip.classed("show", false); });
        });
      });
    }
    return { update };
  }

  const fp = {
    chart: buildForestPlot(document.getElementById("fp-chart")),
    data: null,
  };
  function fp_refresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, outcomes);
  }
  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  // ------------------------------------------------------------------
  // TAB 4 — Diagnostics bars + long-run bars
  // ------------------------------------------------------------------
  function buildDiagBars(container) {
    function update(diagnostics) {
      const W = 540, H = 280;
      const margin = { top: 24, right: 14, bottom: 38, left: 50 };
      const w = W - margin.left - margin.right;
      const h = H - margin.top - margin.bottom;
      d3.select(container).selectAll("svg").remove();
      const svg = d3.select(container).append("svg")
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
      const x0 = d3.scaleBand().domain(diagnostics.map(d => d.method)).range([0, w]).padding(0.2);
      const x1 = d3.scaleBand().domain(["AR(2) p", "Hansen J p"]).range([0, x0.bandwidth()]).padding(0.15);
      const y = d3.scaleLinear().domain([0, 1]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x0).tickSize(0))
        .selectAll("text").attr("fill", C.text).attr("font-size", 11);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // 0.05 reference line.
      g.append("line")
        .attr("x1", 0).attr("x2", w)
        .attr("y1", y(0.05)).attr("y2", y(0.05))
        .attr("stroke", C.orange).attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", w - 4).attr("y", y(0.05) - 4)
        .attr("text-anchor", "end").attr("fill", C.orange).attr("font-size", 10)
        .text("0.05 cutoff");

      diagnostics.forEach(d => {
        const cx = x0(d.method);
        // AR(2)
        const ar2x = cx + x1("AR(2) p");
        g.append("rect")
          .attr("x", ar2x).attr("y", y(d.ar2_p))
          .attr("width", x1.bandwidth()).attr("height", h - y(d.ar2_p))
          .attr("fill", C.steel).attr("opacity", 0.85);
        g.append("text")
          .attr("x", ar2x + x1.bandwidth() / 2).attr("y", y(d.ar2_p) - 4)
          .attr("text-anchor", "middle")
          .attr("fill", C.text).attr("font-size", 10).attr("font-weight", 600)
          .text(d.ar2_p.toFixed(2));
        // Hansen J
        const hsx = cx + x1("Hansen J p");
        g.append("rect")
          .attr("x", hsx).attr("y", y(d.hansen_p))
          .attr("width", x1.bandwidth()).attr("height", h - y(d.hansen_p))
          .attr("fill", C.teal).attr("opacity", 0.85);
        g.append("text")
          .attr("x", hsx + x1.bandwidth() / 2).attr("y", y(d.hansen_p) - 4)
          .attr("text-anchor", "middle")
          .attr("fill", C.text).attr("font-size", 10).attr("font-weight", 600)
          .text(d.hansen_p.toFixed(2));
      });

      // Legend.
      const lg = g.append("g").attr("transform", `translate(${w - 200},${-14})`);
      lg.append("rect").attr("x", -8).attr("y", -10).attr("width", 200).attr("height", 24)
        .attr("fill", "rgba(15,23,41,0.6)").attr("rx", 4);
      lg.append("rect").attr("x", 0).attr("y", -6).attr("width", 14).attr("height", 12).attr("fill", C.steel);
      lg.append("text").attr("x", 18).attr("y", 4).attr("fill", C.text).attr("font-size", 11).text("AR(2)");
      lg.append("rect").attr("x", 70).attr("y", -6).attr("width", 14).attr("height", 12).attr("fill", C.teal);
      lg.append("text").attr("x", 88).attr("y", 4).attr("fill", C.text).attr("font-size", 11).text("Hansen J");
    }
    return { update };
  }

  function buildLongrunBars(container) {
    function update(longrun) {
      const W = 540, H = 280;
      const margin = { top: 24, right: 24, bottom: 38, left: 50 };
      const w = W - margin.left - margin.right;
      const h = H - margin.top - margin.bottom;
      d3.select(container).selectAll("svg").remove();
      const svg = d3.select(container).append("svg")
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
      const x = d3.scaleBand().domain(longrun.map(d => d.method)).range([0, w]).padding(0.35);
      const yMin = Math.min(0, d3.min(longrun, d => d.sswar_lo) - 0.05);
      const yMax = Math.max(0, d3.max(longrun, d => d.sswar_hi) + 0.05);
      const y = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text").attr("fill", C.text).attr("font-size", 11);
      g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Zero line.
      g.append("line").attr("x1", 0).attr("x2", w)
        .attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      longrun.forEach(d => {
        const cx = x(d.method);
        const w0 = x.bandwidth();
        const top = Math.min(y(d.sswar), y(0));
        const bot = Math.max(y(d.sswar), y(0));
        g.append("rect")
          .attr("x", cx).attr("y", top)
          .attr("width", w0).attr("height", bot - top)
          .attr("fill", C.orange).attr("opacity", 0.85);
        // CI whiskers.
        g.append("line")
          .attr("x1", cx + w0 / 2).attr("x2", cx + w0 / 2)
          .attr("y1", y(d.sswar_lo)).attr("y2", y(d.sswar_hi))
          .attr("stroke", C.text).attr("stroke-width", 1.5);
        g.append("line")
          .attr("x1", cx + w0 / 4).attr("x2", cx + 3 * w0 / 4)
          .attr("y1", y(d.sswar_lo)).attr("y2", y(d.sswar_lo))
          .attr("stroke", C.text).attr("stroke-width", 1.5);
        g.append("line")
          .attr("x1", cx + w0 / 4).attr("x2", cx + 3 * w0 / 4)
          .attr("y1", y(d.sswar_hi)).attr("y2", y(d.sswar_hi))
          .attr("stroke", C.text).attr("stroke-width", 1.5);
        // Value label.
        g.append("text")
          .attr("x", cx + w0 / 2)
          .attr("y", Math.min(top, y(d.sswar_hi)) - 6)
          .attr("text-anchor", "middle").attr("fill", C.text)
          .attr("font-size", 11).attr("font-weight", 600)
          .text(d.sswar.toFixed(3));
      });

      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h / 2},${-38})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("Long-run War coefficient (β₀+β₁+β₂)");
    }
    return { update };
  }

  const diag = {
    bars: buildDiagBars(document.getElementById("diag-bars")),
    longrun: buildLongrunBars(document.getElementById("diag-longrun")),
    data: null,
  };

  // ------------------------------------------------------------------
  // Load results.json and populate Tabs 3 & 4.
  // ------------------------------------------------------------------
  fetch("data/results.json")
    .then(r => r.json())
    .then(data => {
      fp.data = data;
      fp_refresh();
      diag.bars.update(data.diagnostics || []);
      diag.longrun.update(data.longrun || []);
    })
    .catch(err => {
      console.error("Failed to load results.json:", err);
      const el = document.getElementById("fp-chart");
      if (el) el.innerHTML =
        `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    });

  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
