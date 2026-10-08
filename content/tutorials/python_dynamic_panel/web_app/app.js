// app.js — wires the DOM controls in index.html to dgp/charts.
// Runs after window.DGP, window.LASSO, window.CHARTS and d3 are defined.
//
// Tabs:
//   1. The Bias Bracket    — animated bias-vs-T curves + live OLS/FE simulator
//   2. The Estimator Ladder — forest plot of the post's 7 real estimates
//   3. Diagnostics Decoder  — AR(1)/AR(2)/Hansen bars + proliferation scatter + quiz
//   4. Method Chooser       — 3-question decision tree + recommendation
//
// Real numbers are loaded from data/results.json (baked from
// estimates_summary.csv and proliferation_grid.csv).

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
  // Dynamic-panel DGP:  n[i,t] = rho * n[i,t-1] + alpha_i + e[i,t]
  //   alpha_i ~ N(0, sigma_alpha^2); e[i,t] ~ N(0, sigma_e^2).
  //   Burn-in 50 periods so initial conditions don't drive the estimators.
  // ------------------------------------------------------------------
  function simulatePanel(N, T, rho, sigma_e, sigma_alpha, seed) {
    const rng = DGP.mulberry32(seed);
    const normal = DGP.makeNormal(rng);
    const burn = 50;
    const Y = new Float64Array(N * T);
    for (let i = 0; i < N; i++) {
      const a_i = normal() * sigma_alpha;
      let prev = a_i / Math.max(1 - rho, 0.02) + normal() * sigma_e;
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

  // Pooled-OLS rho-hat: regress y[i,t] on y[i,t-1], ignoring alpha_i.
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

  // Within-FE rho-hat: demean (y, L.y) within firm over the estimation rows.
  function rho_FE(Y, N, T) {
    let sxx = 0, sxy = 0;
    for (let i = 0; i < N; i++) {
      let sumY = 0, sumLY = 0, kCount = 0;
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

  // ------------------------------------------------------------------
  // TAB 1a — bias-vs-T animation. OLS (up, doesn't heal) vs FE (Nickell,
  // heals as T grows), averaged over panel draws, true rho = 0.80.
  // ------------------------------------------------------------------
  (function initBracketAnim() {
    const container = document.getElementById("bb-anim");
    if (!container) return;
    const W = 760, H = 380;
    const margin = { top: 28, right: 24, bottom: 96, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const trueRho = 0.80;
    const Ts = [];
    for (let T = 3; T <= 20; T++) Ts.push(T);
    const N = 80, sigma_e = 1.0, sigma_a = 1.0;
    const olsCurve = [], feCurve = [];
    for (const T of Ts) {
      let sOLS = 0, sFE = 0, nOLS = 0, nFE = 0;
      for (let s = 0; s < 12; s++) {
        const Y = simulatePanel(N, T, trueRho, sigma_e, sigma_a, 2000 + s);
        const ro = rho_OLS(Y, N, T);
        const rf = rho_FE(Y, N, T);
        if (Number.isFinite(ro)) { sOLS += ro; nOLS++; }
        if (Number.isFinite(rf)) { sFE += rf; nFE++; }
      }
      olsCurve.push([T, sOLS / Math.max(1, nOLS)]);
      feCurve.push([T, sFE / Math.max(1, nFE)]);
    }

    const xScale = d3.scaleLinear().domain([3, 20]).range([0, w]);
    const yMin = Math.min(d3.min(feCurve, d => d[1]), trueRho) - 0.05;
    const yMax = Math.max(d3.max(olsCurve, d => d[1]), trueRho) + 0.05;
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(9).tickFormat(d3.format("d")))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w/2},${h+36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Years per firm T");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h/2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Average ρ̂ (true ρ = 0.80)");

    // Shaded bracket region between the two curves.
    const areaGen = d3.area()
      .x((d, i) => xScale(d[0]))
      .y0((d, i) => yScale(feCurve[i][1]))
      .y1((d, i) => yScale(olsCurve[i][1]))
      .curve(d3.curveMonotoneX);
    g.append("path").attr("d", areaGen(olsCurve))
      .attr("fill", C.steel).attr("opacity", 0.10);

    // True-rho reference line.
    g.append("line")
      .attr("x1", 0).attr("x2", w)
      .attr("y1", yScale(trueRho)).attr("y2", yScale(trueRho))
      .attr("stroke", C.steel).attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5 5");
    const trLabelG = g.append("g").attr("transform", `translate(4,${yScale(trueRho) - 18})`);
    trLabelG.append("rect")
      .attr("width", 86).attr("height", 14)
      .attr("fill", "rgba(15,23,41,0.75)").attr("rx", 3);
    trLabelG.append("text")
      .attr("x", 4).attr("y", 10)
      .attr("fill", C.steel).attr("font-size", 11)
      .text("true ρ = 0.80");

    const lineGen = d3.line().x(d => xScale(d[0])).y(d => yScale(d[1])).curve(d3.curveMonotoneX);
    g.append("path").attr("d", lineGen(olsCurve)).attr("fill", "none")
      .attr("stroke", C.muted).attr("stroke-width", 2.5);
    g.append("path").attr("d", lineGen(feCurve)).attr("fill", "none")
      .attr("stroke", C.orange).attr("stroke-width", 2.5);

    // Highlight the post's T = 7–9 zone.
    g.append("rect")
      .attr("x", xScale(7)).attr("width", xScale(9) - xScale(7))
      .attr("y", 0).attr("height", h)
      .attr("fill", C.teal).attr("opacity", 0.07);
    g.append("text")
      .attr("x", xScale(8)).attr("y", 14)
      .attr("text-anchor", "middle").attr("fill", C.teal).attr("font-size", 10)
      .text("post's data: T = 7–9");

    // Legend below the plot.
    const legendW = 470;
    const legendX = (w - legendW) / 2;
    const lg = g.append("g").attr("transform", `translate(${legendX},${h + 56})`);
    lg.append("rect").attr("width", legendW).attr("height", 28)
      .attr("fill", "rgba(15,23,41,0.7)").attr("stroke", C.line).attr("rx", 6);
    lg.append("circle").attr("cx", 14).attr("cy", 14).attr("r", 5).attr("fill", C.muted);
    lg.append("text").attr("x", 26).attr("y", 18).attr("fill", C.text).attr("font-size", 12)
      .text("Pooled OLS (biased up, never heals)");
    lg.append("circle").attr("cx", 270).attr("cy", 14).attr("r", 5).attr("fill", C.orange);
    lg.append("text").attr("x", 282).attr("y", 18).attr("fill", C.text).attr("font-size", 12)
      .text("FE (Nickell bias, heals as T grows)");

    // Cycling cursor.
    const cursor = g.append("line")
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", C.faint).attr("stroke-width", 1.2);
    const olsDot = g.append("circle").attr("r", 6).attr("fill", C.muted);
    const feDot  = g.append("circle").attr("r", 6).attr("fill", C.orange);
    const tLabel = g.append("text")
      .attr("y", -8).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600);

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      const cycleSeconds = 9;
      const phase = (elapsed % cycleSeconds) / cycleSeconds;
      const sweep = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI);
      const T = 3 + sweep * 17;
      const idx = Math.max(0, Math.min(Ts.length - 1, Math.round(T - 3)));
      cursor.attr("x1", xScale(Ts[idx])).attr("x2", xScale(Ts[idx]));
      olsDot.attr("cx", xScale(Ts[idx])).attr("cy", yScale(olsCurve[idx][1]));
      feDot.attr("cx", xScale(Ts[idx])).attr("cy", yScale(feCurve[idx][1]));
      tLabel.attr("x", xScale(Ts[idx])).text(`T = ${Ts[idx]}`);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })();

  // ------------------------------------------------------------------
  // TAB 1b — live Bias Bracket simulator.
  // ------------------------------------------------------------------
  const bb = {
    rho: 0.80, T: 8, N: 140, sigma: 1.0, sigma_alpha: 1.0, seed: 7,
    el: { bar: document.getElementById("bb-bar") },
  };

  function bb_render() {
    if (!bb.el.bar) return;
    const Y = simulatePanel(bb.N, bb.T, bb.rho, bb.sigma, bb.sigma_alpha, bb.seed);
    const rOLS = rho_OLS(Y, bb.N, bb.T);
    const rFE  = rho_FE(Y, bb.N, bb.T);

    document.getElementById("bb-stat-true").textContent = bb.rho.toFixed(2);
    document.getElementById("bb-stat-ols").textContent  = Number.isFinite(rOLS) ? rOLS.toFixed(3) : "—";
    document.getElementById("bb-stat-fe").textContent   = Number.isFinite(rFE)  ? rFE.toFixed(3)  : "—";
    document.getElementById("bb-stat-width").textContent =
      (Number.isFinite(rOLS) && Number.isFinite(rFE)) ? (rOLS - rFE).toFixed(3) : "—";

    const W = 760, H = 250;
    const margin = { top: 30, right: 30, bottom: 36, left: 140 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(bb.el.bar, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const bars = [
      { name: "Pooled OLS",   v: rOLS, color: C.muted,  note: "biased up"   },
      { name: "FE (within)",  v: rFE,  color: C.orange, note: "biased down" },
    ];
    const allVals = bars.map(b => b.v).filter(Number.isFinite).concat([bb.rho, 0, 1]);
    const lo = Math.min.apply(null, allVals);
    const hi = Math.max.apply(null, allVals);
    const span = Math.max(0.4, hi - lo);
    const pad = span * 0.08;
    const x = d3.scaleLinear().domain([lo - pad, hi + pad]).range([0, w]);
    const y = d3.scaleBand().domain(bars.map(b => b.name)).range([0, h]).padding(0.4);

    // Simulated bracket band between FE-hat and OLS-hat.
    if (Number.isFinite(rOLS) && Number.isFinite(rFE)) {
      g.append("rect")
        .attr("x", x(Math.min(rFE, rOLS))).attr("y", 0)
        .attr("width", Math.abs(x(rOLS) - x(rFE))).attr("height", h)
        .attr("fill", C.teal).attr("opacity", 0.08);
      g.append("text")
        .attr("x", x((rFE + rOLS) / 2)).attr("y", h - 6)
        .attr("text-anchor", "middle").attr("fill", C.teal).attr("font-size", 10)
        .text("your simulated bracket");
    }

    // Unit-root line at 1 (if visible).
    if (1 <= hi + pad && 1 >= lo - pad) {
      g.append("line").attr("x1", x(1)).attr("x2", x(1)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      g.append("text").attr("x", x(1)).attr("y", h + 26)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 10)
        .text("ρ = 1");
    }

    // True rho line.
    g.append("line").attr("x1", x(bb.rho)).attr("x2", x(bb.rho))
      .attr("y1", -10).attr("y2", h)
      .attr("stroke", C.steel).attr("stroke-width", 2);
    g.append("text").attr("x", x(bb.rho)).attr("y", -14)
      .attr("text-anchor", "middle")
      .attr("fill", C.steel).attr("font-size", 11)
      .text(`true ρ = ${bb.rho.toFixed(2)}`);

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
      const x0 = x(lo - pad);
      const x1 = x(d.v);
      g.append("rect")
        .attr("x", Math.min(x0, x1))
        .attr("y", yc - y.bandwidth() / 2 + y.bandwidth() * 0.15)
        .attr("width", Math.abs(x1 - x0))
        .attr("height", y.bandwidth() * 0.7)
        .attr("fill", d.color).attr("opacity", 0.85);
      g.append("text").attr("x", x1 + 6)
        .attr("text-anchor", "start")
        .attr("y", yc + 4)
        .attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
        .text(`${d.v.toFixed(3)} (${d.note})`);
    });
  }

  const onBbParam = debounce(bb_render, 100);
  function bindBb(id, key, prec) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", e => {
      const v = +e.target.value;
      bb[key] = v;
      const valEl = document.getElementById(id + "-val");
      if (valEl) valEl.textContent = prec ? v.toFixed(prec) : v;
      onBbParam();
    });
  }
  bindBb("bb-rho", "rho", 2);
  bindBb("bb-T",   "T",   0);
  bindBb("bb-N",   "N",   0);

  const bbReseed = document.getElementById("bb-reseed");
  if (bbReseed) {
    bbReseed.addEventListener("click", () => {
      bb.seed = Math.floor(Math.random() * 1e9) + 1;
      bb_render();
    });
  }
  const bbReset = document.getElementById("bb-reset");
  if (bbReset) {
    bbReset.addEventListener("click", () => {
      bb.rho = 0.80; bb.T = 8; bb.N = 140; bb.seed = 7;
      [["bb-rho", "rho", 2], ["bb-T", "T", 0], ["bb-N", "N", 0]].forEach(([id, key, prec]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = bb[key];
        const valEl = document.getElementById(id + "-val");
        if (valEl) valEl.textContent = prec ? bb[key].toFixed(prec) : bb[key];
      });
      bb_render();
    });
  }
  bb_render();

  // ------------------------------------------------------------------
  // TAB 2 — The Estimator Ladder (forest plot of the post's real results).
  // ------------------------------------------------------------------
  const LADDER_COLOR = {
    "Pooled OLS":                    C.muted,
    "Fixed effects":                 C.muted,
    "Anderson-Hsiao IV":             C.steel,
    "Diff GMM (one-step)":           C.orange,
    "Diff GMM (two-step)":           C.orange,
    "Sys GMM (one-step, collapsed)": C.teal,
    "Sys GMM (two-step, collapsed)": C.teal,
  };

  const LADDER_STORY = {
    "Pooled OLS": {
      title: "Pooled OLS — ρ̂ = 0.9617 (SE 0.0084): the seductive upper bound",
      body: "Pooled OLS ignores the firm effect αᵢ entirely, so last year's employment — which obviously depends on αᵢ — absorbs it and ρ̂ is biased upward by construction. The tiny SE makes it look authoritative; the bias makes it wrong. Taken literally it implies an 18-year shock half-life. Its real job is to define the bracket's ceiling: no consistent estimate can sit above 0.962."
    },
    "Fixed effects": {
      title: "Fixed effects — ρ̂ = 0.6262 (SE 0.0515): Nickell bias in action",
      body: "Within-demeaning removes αᵢ but creates a new problem: the demeaned lag is mechanically negatively correlated with the demeaned error (Nickell 1981), biasing ρ̂ down by order 1/T — and T is only 7–9 here. Taken literally it implies shocks fade in 1.5 years. Its real job is the bracket's floor: 0.626. With OLS, the two known-sign biases bracket the truth before any GMM is run."
    },
    "Anderson-Hsiao IV": {
      title: "Anderson-Hsiao IV — ρ̂ = 1.2327 (SE 0.4782): consistent but useless",
      body: "First-differencing kills αᵢ, and instrumenting Δn[i,t−1] with the level n[i,t−2] restores consistency — but with exactly ONE instrument the estimate lands above the unit root with a 95% CI of [0.296, 2.170]: 1.87 units wide, swallowing the whole bracket, the unit root, and explosive dynamics at once. The motivating failure for GMM: if t−2 is a valid instrument, so is every deeper lag — use them all."
    },
    "Diff GMM (one-step)": {
      title: "Diff GMM, one-step — ρ̂ = 0.7075 (SE 0.0842): better, still on the floor",
      body: "Arellano-Bond (1991) uses all available lagged levels as instruments for the differenced equation — 91 of them here. The one-step estimate improves on Anderson-Hsiao's precision enormously, but at 0.708 it sits in the bottom quarter of the bracket. When the series is persistent, lagged levels barely predict future differences: the instruments are valid but weak, and the estimate is dragged toward the biased FE bound."
    },
    "Diff GMM (two-step)": {
      title: "Diff GMM, two-step — ρ̂ = 0.6788 (SE 0.0891): passes every test, trust it anyway?",
      body: "The optimally-weighted two-step version (Windmeijer-corrected SEs) lands at 0.679 — only 0.053 above the FE floor, within one SE of it. Hansen p = 0.211 and AR(2) p = 0.866 both pass. This is the post's single most valuable lesson: an estimator can pass every PRINTED test and still fail the bracket check. Bond (2002): a diff-GMM estimate hugging the FE bound is a weak-instrument symptom, not an answer."
    },
    "Sys GMM (one-step, collapsed)": {
      title: "Sys GMM, one-step — ρ̂ = 0.9025 (SE 0.0634): the fix, first pass",
      body: "Blundell-Bond (1998) adds the LEVELS equation, instrumented by lagged differences — informative even when ρ is near 1 — at the price of one extra untestable assumption (mean stationarity of initial conditions). With collapsed instruments (32 total against 140 firms), the one-step estimate lands at 0.902: inside the bracket, in its upper half, where Blundell and Bond's own analysis of this data says the truth lives."
    },
    "Sys GMM (two-step, collapsed)": {
      title: "Sys GMM, two-step — ρ̂ = 0.9270 (SE 0.0785): the defended headline",
      body: "The headline model: two-step system GMM, 32 collapsed instruments, Windmeijer SEs. ρ̂ = 0.927 sits inside the bracket with clean diagnostics — AR(1) p = 0.000 (must reject, does), AR(2) p = 0.994 (must not reject, doesn't), Hansen p = 0.462 (away from both 0.05 and the p ≈ 1 flag). About 93% of an employment shock survives into the next year; half-life ≈ 9 years. One honest caveat: the CI [0.773, 1.081] includes the unit root."
    },
  };

  const BRACKET = { fe: 0.6262, ols: 0.9617 }; // overwritten by results.json if present

  function buildLadder(container) {
    const W = 880;
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(data, activeMethods) {
      const order = Object.keys(LADDER_COLOR);
      const rows = data
        .filter(d => activeMethods.includes(d.method))
        .sort((a, b) => order.indexOf(a.method) - order.indexOf(b.method));

      const margin = { top: 34, right: 24, bottom: 44, left: 230 };
      const rowH = 40;
      const plotH = Math.max(rowH * rows.length, rowH);
      const totalH = margin.top + plotH + margin.bottom;

      d3.select(container).selectAll("svg").remove();
      const svg = d3.select(container).append("svg")
        .attr("viewBox", `0 0 ${W} ${totalH}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
      const w = W - margin.left - margin.right;

      const ext = d3.extent(rows.flatMap(d => [d.ci_lo, d.ci_hi]).concat([BRACKET.fe, BRACKET.ols, 1]));
      const pad = Math.max(0.05, (ext[1] - ext[0]) * 0.06);
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const y = d3.scaleBand().domain(rows.map(d => d.method)).range([0, plotH]).padding(0.35);

      // Bracket band.
      g.append("rect")
        .attr("x", x(BRACKET.fe)).attr("y", 0)
        .attr("width", x(BRACKET.ols) - x(BRACKET.fe)).attr("height", plotH)
        .attr("fill", C.steel).attr("opacity", 0.10);
      g.append("text")
        .attr("x", x((BRACKET.fe + BRACKET.ols) / 2)).attr("y", -10)
        .attr("text-anchor", "middle").attr("fill", C.steel).attr("font-size", 11)
        .text(`OLS–FE bracket [${BRACKET.fe.toFixed(3)}, ${BRACKET.ols.toFixed(3)}]`);

      // Unit-root line.
      g.append("line")
        .attr("x1", x(1)).attr("x2", x(1)).attr("y1", -4).attr("y2", plotH)
        .attr("stroke", C.orange).attr("stroke-width", 1.5).attr("stroke-dasharray", "5 4");
      g.append("text")
        .attr("x", x(1)).attr("y", plotH + 30)
        .attr("text-anchor", "middle").attr("fill", C.orange).attr("font-size", 10)
        .text("unit root ρ = 1");

      g.append("g").attr("transform", `translate(0,${plotH})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      rows.forEach(d => {
        const yc = y(d.method) + y.bandwidth() / 2;
        const color = LADDER_COLOR[d.method] || C.text;

        g.append("text")
          .attr("x", -10).attr("y", yc + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12)
          .text(d.method);

        const grp = g.append("g").style("cursor", "pointer");
        grp.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc)
          .attr("stroke", color).attr("stroke-width", 2.5);
        [d.ci_lo, d.ci_hi].forEach(v => {
          grp.append("line")
            .attr("x1", x(v)).attr("x2", x(v))
            .attr("y1", yc - 5).attr("y2", yc + 5)
            .attr("stroke", color).attr("stroke-width", 2.5);
        });
        grp.append("circle")
          .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 6)
          .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 1.2);
        grp.append("text")
          .attr("x", x(d.estimate)).attr("y", yc - 12)
          .attr("text-anchor", "middle")
          .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
          .text(d.estimate.toFixed(3));

        grp.on("mousemove", function (ev) {
          const rect = container.getBoundingClientRect();
          tooltip.html(
            `<div><strong style="color:${color}">${d.method}</strong></div>` +
            `<div><span class='tooltip-key'>ρ̂ =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>` +
            `<div><span class='tooltip-key'>instruments =</span> <span class='tooltip-val'>${d.n_selected == null ? "—" : d.n_selected}</span></div>` +
            (d.hansen_p != null ? `<div><span class='tooltip-key'>Hansen p =</span> <span class='tooltip-val'>${d.hansen_p.toFixed(3)}</span></div>` : "") +
            (d.ar2_p != null ? `<div><span class='tooltip-key'>AR(2) p =</span> <span class='tooltip-val'>${d.ar2_p.toFixed(3)}</span></div>` : "") +
            `<div class='tooltip-key' style='margin-top:4px;'>click for the story</div>`
          ).classed("show", true)
           .style("left", (ev.clientX - rect.left + 12) + "px")
           .style("top",  (ev.clientY - rect.top  + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });

        grp.on("click", function () {
          const story = LADDER_STORY[d.method];
          if (!story) return;
          const t = document.getElementById("lad-story-title");
          const b = document.getElementById("lad-story-body");
          if (t) t.textContent = story.title;
          if (b) b.textContent = story.body;
          const card = document.getElementById("lad-story");
          if (card) card.style.borderColor = color;
        });
      });
    }
    return { update };
  }

  const lad = {
    chart: buildLadder(document.getElementById("lad-chart")),
    data: null,
  };
  function lad_refresh() {
    if (!lad.data) return;
    const methods = Array.from(document.querySelectorAll("#lad-methods input:checked")).map(el => el.value);
    lad.chart.update(lad.data.estimates, methods);
  }
  document.querySelectorAll("#lad-methods input").forEach(el => {
    el.addEventListener("change", lad_refresh);
  });

  // ------------------------------------------------------------------
  // TAB 3a — the three tests, grouped bars per model.
  // ------------------------------------------------------------------
  function buildTestBars(container) {
    function update(diagnostics) {
      const W = 540, H = 300;
      const margin = { top: 30, right: 14, bottom: 56, left: 50 };
      const w = W - margin.left - margin.right;
      const h = H - margin.top - margin.bottom;
      d3.select(container).selectAll("svg").remove();
      const svg = d3.select(container).append("svg")
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const tests = ["AR(1) p", "AR(2) p", "Hansen p"];
      const testColor = { "AR(1) p": C.muted, "AR(2) p": C.steel, "Hansen p": C.teal };
      const x0 = d3.scaleBand().domain(diagnostics.map(d => d.model)).range([0, w]).padding(0.22);
      const x1 = d3.scaleBand().domain(tests).range([0, x0.bandwidth()]).padding(0.18);
      const y = d3.scaleLinear().domain([0, 1.05]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x0).tickSize(0))
        .selectAll("text").attr("fill", C.text).attr("font-size", 10)
        .call(sel => sel.each(function (d) {
          const self = d3.select(this);
          const words = d.split(" ");
          self.text("");
          self.append("tspan").attr("x", 0).attr("dy", "0.9em").text(words.slice(0, 2).join(" "));
          if (words.length > 2) self.append("tspan").attr("x", 0).attr("dy", "1.1em").text(words.slice(2).join(" "));
        }));
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // 0.05 rejection line.
      g.append("line")
        .attr("x1", 0).attr("x2", w)
        .attr("y1", y(0.05)).attr("y2", y(0.05))
        .attr("stroke", C.orange).attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 4");
      const cutoffG = g.append("g").attr("transform", `translate(${w - 84},${y(0.05) - 18})`);
      cutoffG.append("rect")
        .attr("width", 80).attr("height", 14)
        .attr("fill", "rgba(15,23,41,0.75)").attr("rx", 3);
      cutoffG.append("text").attr("x", 4).attr("y", 10)
        .attr("fill", C.orange).attr("font-size", 10).text("p = 0.05 line");

      diagnostics.forEach(d => {
        const cx = x0(d.model);
        const vals = { "AR(1) p": d.ar1_p, "AR(2) p": d.ar2_p, "Hansen p": d.hansen_p };
        tests.forEach(tn => {
          const v = vals[tn];
          const bx = cx + x1(tn);
          const barH = Math.max(1.5, h - y(v)); // ensure p=0.000 is still visible
          g.append("rect")
            .attr("x", bx).attr("y", h - barH)
            .attr("width", x1.bandwidth()).attr("height", barH)
            .attr("fill", testColor[tn]).attr("opacity", 0.85);
          g.append("text")
            .attr("x", bx + x1.bandwidth() / 2).attr("y", h - barH - 4)
            .attr("text-anchor", "middle")
            .attr("fill", C.text).attr("font-size", 10).attr("font-weight", 600)
            .text(v.toFixed(3));
        });
      });

      // Legend with the reading attached.
      const lg = g.append("g").attr("transform", `translate(0,${-24})`);
      let lx = 0;
      [["AR(1): must reject", C.muted], ["AR(2): must NOT reject", C.steel], ["Hansen: two-tailed", C.teal]].forEach(([txt, col]) => {
        lg.append("rect").attr("x", lx).attr("y", -6).attr("width", 11).attr("height", 11).attr("fill", col);
        lg.append("text").attr("x", lx + 15).attr("y", 4).attr("fill", C.text).attr("font-size", 10).text(txt);
        lx += txt.length * 5.4 + 36;
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // TAB 3b — proliferation scatter: instruments vs Hansen p.
  // ------------------------------------------------------------------
  function buildProlifScatter(container) {
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");
    function update(grid) {
      const W = 540, H = 300;
      const margin = { top: 30, right: 18, bottom: 64, left: 50 };
      const w = W - margin.left - margin.right;
      const h = H - margin.top - margin.bottom;
      d3.select(container).selectAll("svg").remove();
      const svg = d3.select(container).append("svg")
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear().domain([0, 150]).range([0, w]);
      const y = d3.scaleLinear().domain([0, 0.55]).range([h, 0]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text")
        .attr("transform", `translate(${w/2},${h+34})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("Number of instruments");
      g.append("text")
        .attr("transform", `rotate(-90) translate(${-h/2},${-36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("Hansen p-value");

      // p = 0.05 rejection line.
      g.append("line").attr("x1", 0).attr("x2", w)
        .attr("y1", y(0.05)).attr("y2", y(0.05))
        .attr("stroke", C.orange).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", 4).attr("y", y(0.05) + 14)
        .attr("fill", C.orange).attr("font-size", 9.5)
        .text("rejected below p = 0.05");

      // Roodman ceiling at N = 140 firms.
      g.append("line").attr("x1", x(140)).attr("x2", x(140)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.muted).attr("stroke-width", 1.5).attr("stroke-dasharray", "2 4");
      g.append("text").attr("x", x(140) - 4).attr("y", 12)
        .attr("text-anchor", "end").attr("fill", C.muted).attr("font-size", 9.5)
        .text("N = 140 firms (Roodman's ceiling)");

      grid.forEach(d => {
        const grp = g.append("g").style("cursor", "pointer");
        const col = d.collapsed ? C.teal : C.steel;
        if (d.collapsed) {
          // Diamond.
          const s = 7;
          grp.append("path")
            .attr("d", `M ${x(d.n_instruments)} ${y(d.hansen_p) - s} L ${x(d.n_instruments) + s} ${y(d.hansen_p)} L ${x(d.n_instruments)} ${y(d.hansen_p) + s} L ${x(d.n_instruments) - s} ${y(d.hansen_p)} Z`)
            .attr("fill", col).attr("stroke", "#0f1729").attr("stroke-width", 1.2);
        } else {
          grp.append("circle")
            .attr("cx", x(d.n_instruments)).attr("cy", y(d.hansen_p)).attr("r", 7)
            .attr("fill", col).attr("stroke", "#0f1729").attr("stroke-width", 1.2);
        }
        grp.append("text")
          .attr("x", x(d.n_instruments)).attr("y", y(d.hansen_p) - 11)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 9)
          .text(`lags ${d.window}`);

        grp.on("mousemove", function (ev) {
          const rect = container.getBoundingClientRect();
          tooltip.html(
            `<div><strong style="color:${col}">lags ${d.window}${d.collapsed ? ", collapsed" : ", full matrix"}</strong></div>` +
            `<div><span class='tooltip-key'>instruments =</span> <span class='tooltip-val'>${d.n_instruments}</span></div>` +
            `<div><span class='tooltip-key'>ρ̂ =</span> <span class='tooltip-val'>${d.rho.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>Hansen p =</span> <span class='tooltip-val'>${d.hansen_p.toFixed(4)}</span></div>` +
            `<div><span class='tooltip-key'>AR(2) p =</span> <span class='tooltip-val'>${d.ar2_p.toFixed(4)}</span></div>`
          ).classed("show", true)
           .style("left", (ev.clientX - rect.left + 12) + "px")
           .style("top",  (ev.clientY - rect.top  + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });
      });

      // Legend below the axis label.
      const lg = g.append("g").attr("transform", `translate(${(w - 320) / 2},${h + 44})`);
      lg.append("circle").attr("cx", 6).attr("cy", 5).attr("r", 6).attr("fill", C.steel);
      lg.append("text").attr("x", 17).attr("y", 9).attr("fill", C.text).attr("font-size", 10)
        .text("Full instrument matrix");
      lg.append("path").attr("d", "M 166 -1 L 172 5 L 166 11 L 160 5 Z").attr("fill", C.teal);
      lg.append("text").attr("x", 178).attr("y", 9).attr("fill", C.text).attr("font-size", 10)
        .text("Collapsed instruments");
    }
    return { update };
  }

  const dg = {
    tests: buildTestBars(document.getElementById("dg-tests")),
    prolif: buildProlifScatter(document.getElementById("dg-prolif")),
  };

  // ------------------------------------------------------------------
  // TAB 3c — "What would worry you?" quiz.
  // ------------------------------------------------------------------
  const QUIZ_FEEDBACK = [
    { // AR(1) p = 0.000
      fine:  "Correct — AR(1) rejection is mechanical good news. Differencing makes Δε(t) and Δε(t−1) share ε(t−1), so consecutive differenced errors MUST be negatively correlated when the model is right. It is the absence of AR(1) rejection that should raise eyebrows.",
      worry: "Not this one. AR(1) rejection is mechanical: Δε(t) and Δε(t−1) share ε(t−1) by construction, so the test must reject when the model is right. The test that must stay clean is AR(2) — and here it does (p = 0.994).",
    },
    { // AR(2) p = 0.994
      fine:  "Correct — a high AR(2) p-value is exactly what you want: no second-order serial correlation, so the t−2 instruments are protected. The 'p near 1 is suspicious' warning applies to the Hansen J test (which loses power as instruments proliferate), not to AR(2).",
      worry: "Not here. AR(2) must NOT reject, so p = 0.994 is a clean pass — the t−2 instruments are protected. The 'p near 1 is a red flag' rule applies to the Hansen J test, whose p-value drifts toward 1 mechanically as instruments proliferate.",
    },
    { // Hansen p = 0.97 with 130 instruments
      worry: "Correct — worry. With 130 instruments against 140 groups, the Hansen test is overwhelmed: the overidentification matrix is near-singular, the test has no power, and p ≈ 1 is the signature of overfitting, not validity (Roodman 2009). The post's grid shows the drift experimentally: 68 → 113 instruments pushed p from 0.035 to 0.235 with the model unchanged. Collapse the instruments and re-read.",
      fine:  "This one should worry you. Hansen is two-tailed in spirit: with 130 instruments against 140 groups the test is overwhelmed and p ≈ 1 signals overfitting, not validity (Roodman 2009). The post's own grid shows the mechanical drift: 68 → 113 instruments pushed p from 0.035 to 0.235 with the model unchanged.",
    },
    { // diff GMM hugging the FE bound
      worry: "Correct — worry. This is Bond's (2002) weak-instrument symptom: when ρ is near 1, lagged levels barely predict future differences, and difference GMM is dragged toward the biased FE bound. Passing Hansen and AR(2) does not clear it — the post's fix is system GMM, which lands at 0.927 with the same clean diagnostics.",
      fine:  "This is the trap the post is built around. An estimate within one SE of the FE lower bound on a persistent series is Bond's (2002) weak-instrument symptom — the printed tests pass, but the bracket check fails. The post's fix is system GMM (0.927, inside the bracket, same clean diagnostics).",
    },
  ];

  document.querySelectorAll(".quiz").forEach((card, qi) => {
    const feedbackEl = card.querySelector(".quiz-feedback");
    card.querySelectorAll("button[data-pick]").forEach(btn => {
      btn.addEventListener("click", () => {
        const pick = btn.dataset.pick;
        const correct = pick === card.dataset.answer;
        const fb = QUIZ_FEEDBACK[qi] || {};
        feedbackEl.textContent = (correct ? "✓ " : "✗ ") + (fb[pick] || "");
        feedbackEl.hidden = false;
        feedbackEl.style.color = correct ? C.teal : C.orange;
        feedbackEl.style.fontStyle = "normal";
        card.querySelectorAll("button[data-pick]").forEach(b => {
          b.style.borderColor = "";
          b.style.color = "";
        });
        btn.style.borderColor = correct ? C.teal : C.orange;
        btn.style.color = correct ? C.teal : C.orange;
      });
    });
  });

  // ------------------------------------------------------------------
  // TAB 4 — Method Chooser: decision tree + recommendation.
  // ------------------------------------------------------------------
  const MC_RECS = {
    // key: `${tSmall}-${persistent}-${endog}`
    "no-any-no": {
      title: "Recommendation: fixed effects with clustered SEs",
      body: "With a long panel (T ≳ 20–25), Nickell bias — order −(1+ρ)/T — is small enough to live with, and FE's transparency beats GMM's machinery. Verify with Tab 1: at T = 20 the simulated FE bar nearly touches the truth.",
      note: "Still run pooled OLS alongside and record the bracket — it is a free diagnostic. If ρ̂_FE and ρ̂_OLS are far apart at your T, reconsider.",
    },
    "no-any-yes": {
      title: "Recommendation: fixed effects + instruments for the endogenous regressors (FE-IV)",
      body: "A long panel tames Nickell bias on the lag, but endogenous regressors (wages that respond to shocks, for instance) still need instruments. Use FE with 2SLS for those regressors, or GMM with gmm(x, lags) treating them as predetermined/endogenous.",
      note: "Record the OLS-FE bracket for the lag coefficient anyway — it costs nothing and catches surprises.",
    },
    "yes-yes-any": {
      title: "Recommendation: system GMM, collapsed instruments, two-step with Windmeijer SEs",
      body: "Short panel + high persistence is exactly where difference GMM fails quietly: lagged levels barely predict future differences, so its instruments are weak and the estimate hugs the biased FE bound (the post: 0.679 vs FE's 0.626). System GMM adds the levels equation instrumented by lagged differences — informative even at ρ near 1 — and the post's headline (0.927, inside the bracket, AR(2) p = 0.994, Hansen p = 0.462) comes from exactly this recipe. Treat endogenous regressors with gmm(x, 2:...) and predetermined ones with gmm(x, 1:...).",
      note: "Say out loud that you are buying identification with mean stationarity (untestable), collapse the instruments, report the count vs the number of groups, and check the estimate lands inside YOUR bracket.",
    },
    "yes-no-no": {
      title: "Recommendation: difference GMM (two-step, Windmeijer SEs)",
      body: "With moderate persistence, lagged levels are informative instruments for the differenced equation, so Arellano-Bond difference GMM works as designed — no extra mean-stationarity assumption needed. Strictly exogenous regressors enter as iv(x). Anderson-Hsiao is consistent here too but wastes information (the post: SE 0.478 with one instrument vs 0.089 with 91).",
      note: "Check the result against your OLS-FE bracket anyway: an estimate hugging the FE bound is a weak-instrument symptom even when Hansen and AR(2) pass.",
    },
    "yes-no-yes": {
      title: "Recommendation: difference GMM with gmm() instruments for the endogenous regressors",
      body: "Moderate persistence keeps difference GMM's instruments informative, and the same internal-instrument logic extends to other endogenous or predetermined regressors: instrument them with their own lags — gmm(x, 2:...) if endogenous, gmm(x, 1:...) if predetermined (the post's replication example treats wages exactly this way with gmm(w, 1:3)).",
      note: "Watch the instrument count — it grows quickly when several variables get gmm() treatment. Collapse before it approaches the number of groups, and verify with the bracket and AR(2)/Hansen.",
    },
  };

  function mc_key() {
    const tSmall = document.querySelector("input[name='mc-t']:checked").value;
    const persistent = document.querySelector("input[name='mc-rho']:checked").value;
    const endog = document.querySelector("input[name='mc-endog']:checked").value;
    if (tSmall === "no") return endog === "yes" ? "no-any-yes" : "no-any-no";
    if (persistent === "yes") return "yes-yes-any";
    return endog === "yes" ? "yes-no-yes" : "yes-no-no";
  }

  // Decision-tree diagram. Nodes laid out manually; active path highlighted.
  function mc_drawTree() {
    const container = document.getElementById("mc-tree");
    if (!container) return;
    const W = 880, H = 350;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g");

    const tSmall = document.querySelector("input[name='mc-t']:checked").value;
    const persistent = document.querySelector("input[name='mc-rho']:checked").value;
    const endog = document.querySelector("input[name='mc-endog']:checked").value;
    const key = mc_key();

    // node: {id, x, y, w, label lines, kind}
    const nodes = {
      q1:    { x: 90,  y: 165, w: 150, lines: ["T small?", "(< ~20)"], kind: "q" },
      fe:    { x: 320, y: 60,  w: 190, lines: ["Fixed effects", "(+ IV if regressors", "endogenous)"], kind: "rec", active: tSmall === "no" },
      q2:    { x: 320, y: 230, w: 160, lines: ["Persistent?", "(ρ ≳ 0.8)"], kind: "q", active: tSmall === "yes" },
      sys:   { x: 590, y: 140, w: 230, lines: ["System GMM", "collapsed instruments,", "two-step + Windmeijer"], kind: "rec", active: tSmall === "yes" && persistent === "yes" },
      q3:    { x: 590, y: 280, w: 170, lines: ["Endogenous", "regressors?"], kind: "q", active: tSmall === "yes" && persistent === "no" },
      diffG: { x: 800, y: 225, w: 150, lines: ["Diff GMM", "+ gmm(x, ...)"], kind: "rec", active: tSmall === "yes" && persistent === "no" && endog === "yes" },
      diffI: { x: 800, y: 310, w: 150, lines: ["Diff GMM", "+ iv(x)"], kind: "rec", active: tSmall === "yes" && persistent === "no" && endog === "no" },
    };
    const edges = [
      { from: "q1", to: "fe",    label: "no",  active: tSmall === "no" },
      { from: "q1", to: "q2",    label: "yes", active: tSmall === "yes" },
      { from: "q2", to: "sys",   label: "yes", active: tSmall === "yes" && persistent === "yes" },
      { from: "q2", to: "q3",    label: "no",  active: tSmall === "yes" && persistent === "no" },
      { from: "q3", to: "diffG", label: "yes", active: tSmall === "yes" && persistent === "no" && endog === "yes" },
      { from: "q3", to: "diffI", label: "no",  active: tSmall === "yes" && persistent === "no" && endog === "no" },
    ];

    edges.forEach(e => {
      const a = nodes[e.from], b = nodes[e.to];
      const x1 = a.x + a.w / 2, y1 = a.y;
      const x2 = b.x - b.w / 2, y2 = b.y;
      const mx = (x1 + x2) / 2;
      g.append("path")
        .attr("d", `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`)
        .attr("fill", "none")
        .attr("stroke", e.active ? C.teal : C.faint)
        .attr("stroke-width", e.active ? 3 : 1.5);
      g.append("text")
        .attr("x", mx).attr("y", (y1 + y2) / 2 - 6)
        .attr("text-anchor", "middle")
        .attr("fill", e.active ? C.teal : C.muted)
        .attr("font-size", 11).attr("font-weight", e.active ? 700 : 400)
        .text(e.label);
    });

    Object.values(nodes).forEach(n => {
      const isRec = n.kind === "rec";
      const lineH = 14;
      const boxH = n.lines.length * lineH + 16;
      const isOn = n.active === true || (n === nodes.q1); // q1 is always on the path
      g.append("rect")
        .attr("x", n.x - n.w / 2).attr("y", n.y - boxH / 2)
        .attr("width", n.w).attr("height", boxH)
        .attr("rx", isRec ? 10 : 6)
        .attr("fill", isRec ? (isOn ? "rgba(0,212,200,0.14)" : "rgba(232,236,242,0.04)") : "rgba(106,155,204,0.10)")
        .attr("stroke", isOn ? (isRec ? C.teal : C.steel) : C.faint)
        .attr("stroke-width", isOn ? 2 : 1);
      n.lines.forEach((ln, li) => {
        g.append("text")
          .attr("x", n.x).attr("y", n.y - boxH / 2 + 14 + li * lineH)
          .attr("text-anchor", "middle")
          .attr("fill", isOn ? C.text : C.muted)
          .attr("font-size", 11).attr("font-weight", li === 0 ? 600 : 400)
          .text(ln);
      });
    });
  }

  function mc_update() {
    const rec = MC_RECS[mc_key()];
    const t = document.getElementById("mc-rec-title");
    const b = document.getElementById("mc-rec-body");
    const n = document.getElementById("mc-rec-note");
    if (t) t.textContent = rec.title;
    if (b) b.textContent = rec.body;
    if (n) n.textContent = rec.note;
    mc_drawTree();
  }
  document.querySelectorAll("#pane-chooser input[type='radio']").forEach(el => {
    el.addEventListener("change", mc_update);
  });
  mc_update();

  // ------------------------------------------------------------------
  // Load results.json and populate Tabs 2 & 3.
  // ------------------------------------------------------------------
  fetch("data/results.json")
    .then(r => r.json())
    .then(data => {
      if (data.bracket) {
        BRACKET.fe = data.bracket.fe;
        BRACKET.ols = data.bracket.ols;
      }
      lad.data = data;
      lad_refresh();
      dg.tests.update(data.diagnostics || []);
      dg.prolif.update(data.proliferation || []);
    })
    .catch(err => {
      console.error("Failed to load results.json:", err);
      ["lad-chart", "dg-tests", "dg-prolif"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML =
          `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
      });
    });

  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
