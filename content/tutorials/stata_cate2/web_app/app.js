// app.js — stata_cate2 web app.
// Wires the DOM controls in index.html to dgp/lasso/charts modules and
// adds two custom D3 widgets (GATE bar chart, heterogeneity simulator chart)
// not currently in the shared charts.js library.
//
// Runs after window.DGP, window.LASSO, window.CHARTS, and d3 are defined.

(function () {
  "use strict";

  // ---- Site dark-theme tokens (mirror of CHARTS internal palette) -------
  const C = {
    bg:    "#1f2b5e",
    panel: "#182447",
    steel: "#6a9bcc",
    orange:"#d97757",
    teal:  "#00d4c8",
    text:  "#e8ecf2",
    muted: "#8b9dc3",
    faint: "rgba(232, 236, 242, 0.15)",
  };

  // ---- Tab switching ----------------------------------------------------
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

  // ---- Debounce helper --------------------------------------------------
  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ====================================================================
  // TAB 1 — Concept animation (L1-vs-L2 stand-in for ATE-vs-CATE).
  // ====================================================================
  // We reuse the existing l1_vs_l2_animation chart as a generic "two
  // curves under one knob" sketch. The Tab-1 narrative reframes it as
  // "constant τ (flat) vs conditional τ(x) (curved)" — the L1/L2 metaphor
  // maps onto the constant/conditional distinction faithfully enough.
  CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));

  // ====================================================================
  // TAB 2 — GATE Explorer (custom D3 bar chart on baked GATE data).
  // ====================================================================
  let dataCache = null;

  const gateLabels = {
    "gates_exec_ntl_1v0":   { x: "Executive Constraints (1 = weakest, 6 = strongest)", title: "GATEs — NTL 1v0 (Mining) by exec_con", testIdx: 0 },
    "gates_exec_ntl_3v1":   { x: "Executive Constraints (1 = weakest, 6 = strongest)", title: "GATEs — NTL 3v1 (Price+) by exec_con", testIdx: 1 },
    "gates_qog_ntl_1v0":    { x: "Quality of Government (quartiles, Q1 = lowest)",     title: "GATEs — NTL 1v0 (Mining) by QoG quartile", testIdx: 2 },
    "gates_qog_ntl_3v1":    { x: "Quality of Government (quartiles, Q1 = lowest)",     title: "GATEs — NTL 3v1 (Price+) by QoG quartile", testIdx: 3 },
    "gates_exec_conf_1v0":  { x: "Executive Constraints (1 = weakest, 6 = strongest)", title: "GATEs — Conflict 1v0 by exec_con", testIdx: 4 },
  };

  function makeGateChart(container) {
    const W = 880, H = 380;
    const margin = { top: 36, right: 28, bottom: 56, left: 70 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(rows, opts) {
      g.selectAll("*").remove();

      const groupKey = rows[0].hasOwnProperty("exec_con") ? "exec_con" : "qog_q";
      const xs = rows.map(r => String(r[groupKey]));
      const yLo = d3.min(rows, r => r.ci_lo);
      const yHi = d3.max(rows, r => r.ci_hi);
      const yPad = Math.max(0.05, (yHi - yLo) * 0.15);
      const x = d3.scaleBand().domain(xs).range([0, w]).padding(0.25);
      const y = d3.scaleLinear().domain([Math.min(0, yLo - yPad), yHi + yPad]).range([h, 0]).nice();

      // Title
      svg.append("text")
        .attr("x", W / 2).attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", C.text).attr("font-size", 14).attr("font-weight", 600)
        .text(opts.title);

      // Axes
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 11);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("g")
        .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 11);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Zero line
      g.append("line")
        .attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      // Axis labels
      g.append("text")
        .attr("x", w / 2).attr("y", h + 42)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
        .text(opts.xlab);
      g.append("text")
        .attr("transform", "rotate(-90)").attr("x", -h / 2).attr("y", -50)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
        .text("GATE estimate (log-NTL units)");

      // Bars + CI whiskers
      rows.forEach(r => {
        const xc = x(String(r[groupKey])) + x.bandwidth() / 2;
        const color = r.gate >= 0 ? C.teal : C.orange;

        // CI rect (faded)
        g.append("rect")
          .attr("x", x(String(r[groupKey])))
          .attr("y", y(Math.max(r.ci_hi, 0)))
          .attr("width", x.bandwidth())
          .attr("height", Math.abs(y(r.ci_hi) - y(r.ci_lo)))
          .attr("fill", color).attr("opacity", 0.22);

        // CI whisker
        g.append("line").attr("x1", xc).attr("x2", xc)
          .attr("y1", y(r.ci_lo)).attr("y2", y(r.ci_hi))
          .attr("stroke", color).attr("stroke-width", 2);
        g.append("line").attr("x1", xc - 7).attr("x2", xc + 7)
          .attr("y1", y(r.ci_lo)).attr("y2", y(r.ci_lo))
          .attr("stroke", color).attr("stroke-width", 2);
        g.append("line").attr("x1", xc - 7).attr("x2", xc + 7)
          .attr("y1", y(r.ci_hi)).attr("y2", y(r.ci_hi))
          .attr("stroke", color).attr("stroke-width", 2);

        // Point estimate
        g.append("circle").attr("cx", xc).attr("cy", y(r.gate)).attr("r", 6)
          .attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 1.2);

        // Value label above point
        g.append("text")
          .attr("x", xc).attr("y", y(r.gate) - 12)
          .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
          .text(r.gate.toFixed(3));
      });
    }
    return { update };
  }

  const gateChart = makeGateChart(document.getElementById("gate-chart"));

  function refreshGates() {
    if (!dataCache) return;
    const key = document.getElementById("gate-key").value;
    const rows = dataCache[key];
    const cfg = gateLabels[key];
    gateChart.update(rows, { title: cfg.title, xlab: cfg.x });

    const t = dataCache.heterogeneity_tests[cfg.testIdx];
    document.getElementById("gate-chi2").textContent = t.chi2.toFixed(2);
    document.getElementById("gate-df").textContent   = t.df;
    document.getElementById("gate-p").textContent    = t.p < 0.0001 ? "< 0.0001" : t.p.toFixed(4);
    document.getElementById("gate-verdict").textContent = t.p < 0.05 ? "reject H₀" : "do not reject";
    document.getElementById("gate-ngroups").textContent = rows.length;
  }
  document.getElementById("gate-key").addEventListener("change", refreshGates);

  // ====================================================================
  // TAB 3 — Heterogeneity Simulator (custom DGP + chi-squared test).
  // ====================================================================
  // True model:
  //   y(0) = α₀ + α₁ · (x − 3.5) + ε
  //   y(1) = y(0) + τ(x),    τ(x) = τ₀ + θ · (x − 3.5)
  // x ∈ {1,..,6} uniform; treatment ~ Bernoulli(0.5).
  // We estimate GATE(g) = mean[y | x = g, d = 1] − mean[y | x = g, d = 0]
  // then run an unweighted chi-squared homogeneity test on the per-group
  // estimates.

  const sim = {
    n: 300, t0: 0.25, theta: -0.04, sigma: 0.30, seed: 42,
  };

  // Lightweight Mulberry32 seeded RNG.
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Box-Muller standard normal.
  function rnorm(rng) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function simulateOnce(params) {
    const rng = makeRng(params.seed);
    const n = params.n;
    const t0 = params.t0, theta = params.theta, sigma = params.sigma;
    // Allocate per-group sums.
    const sum1 = new Float64Array(7), n1 = new Int32Array(7);
    const sum0 = new Float64Array(7), n0 = new Int32Array(7);
    let totT = 0, totC = 0, sumT = 0, sumC = 0;
    for (let i = 0; i < n; i++) {
      const x = 1 + Math.floor(rng() * 6); // 1..6
      const d = rng() < 0.5 ? 1 : 0;
      const tau = t0 + theta * (x - 3.5);
      const eps = sigma * rnorm(rng);
      const y0 = -1.1 + 0.02 * (x - 3.5) + eps;
      const y = d ? (y0 + tau) : y0;
      if (d) { sum1[x] += y; n1[x]++; sumT += y; totT++; }
      else   { sum0[x] += y; n0[x]++; sumC += y; totC++; }
    }
    const gates = [];
    for (let g = 1; g <= 6; g++) {
      const m1 = n1[g] ? sum1[g] / n1[g] : NaN;
      const m0 = n0[g] ? sum0[g] / n0[g] : NaN;
      // Variance of difference assuming sigma is unknown; use σ² ≈ sigma²
      // and finite-sample SE = sqrt(σ²/n1 + σ²/n0).
      const se = Math.sqrt((sigma * sigma) * (1 / Math.max(1, n1[g]) + 1 / Math.max(1, n0[g])));
      gates.push({ x: g, gate: m1 - m0, se, n1: n1[g], n0: n0[g] });
    }
    const ate = (sumT / Math.max(1, totT)) - (sumC / Math.max(1, totC));
    // χ² of homogeneity: sum_g ((gate_g - gate_pooled)/se_g)^2
    // pooled = inverse-variance weighted mean.
    const w = gates.map(r => Number.isFinite(r.gate) ? 1 / (r.se * r.se) : 0);
    const wsum = w.reduce((a, b) => a + b, 0);
    const wgate = gates.reduce((a, r, i) => a + (Number.isFinite(r.gate) ? r.gate * w[i] : 0), 0);
    const pooled = wsum > 0 ? wgate / wsum : NaN;
    let chi2 = 0;
    gates.forEach((r, i) => {
      if (Number.isFinite(r.gate) && r.se > 0) {
        chi2 += Math.pow((r.gate - pooled) / r.se, 2);
      }
    });
    return { gates, ate, chi2, pooled };
  }

  // χ²(df=5) survival function via Wilson-Hilferty approximation.
  function chi2_p(chi2, df) {
    if (chi2 <= 0) return 1;
    const z = (Math.pow(chi2 / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df));
    // upper-tail normal
    const p = 0.5 * (1 - erf(z / Math.SQRT2));
    return Math.max(0, Math.min(1, p));
  }
  function erf(x) {
    // Abramowitz-Stegun 7.1.26.
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  function makeSimChart(container) {
    const W = 880, H = 360;
    const margin = { top: 28, right: 28, bottom: 56, left: 70 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    function update(payload) {
      g.selectAll("*").remove();
      svg.selectAll("text.title").remove();

      const xs = [1, 2, 3, 4, 5, 6];
      const allYs = payload.gates.flatMap(r => [r.gate - 1.96 * r.se, r.gate + 1.96 * r.se])
                       .concat(payload.truth);
      const yLo = d3.min(allYs);
      const yHi = d3.max(allYs);
      const pad = Math.max(0.05, (yHi - yLo) * 0.15);
      const x = d3.scaleBand().domain(xs.map(String)).range([0, w]).padding(0.25);
      const y = d3.scaleLinear().domain([Math.min(0, yLo - pad), yHi + pad]).range([h, 0]).nice();

      svg.append("text").attr("class", "title")
        .attr("x", W / 2).attr("y", 18)
        .attr("text-anchor", "middle")
        .attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600)
        .text("Simulated GATEs by exec_con — truth (orange dashed) vs cross-fit estimate (teal)");

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 11);
      g.append("g")
        .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 11);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("line")
        .attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

      g.append("text")
        .attr("x", w / 2).attr("y", h + 42)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
        .text("Executive Constraints group (1 = weakest, 6 = strongest)");
      g.append("text")
        .attr("transform", "rotate(-90)").attr("x", -h / 2).attr("y", -50)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 12)
        .text("GATE — outcome units");

      // Truth line (orange dashed)
      const truthLine = d3.line()
        .x((d, i) => x(String(i + 1)) + x.bandwidth() / 2)
        .y(d => y(d));
      g.append("path").datum(payload.truth)
        .attr("d", truthLine)
        .attr("fill", "none").attr("stroke", C.orange)
        .attr("stroke-width", 2).attr("stroke-dasharray", "5 4");

      payload.truth.forEach((t, i) => {
        g.append("circle")
          .attr("cx", x(String(i + 1)) + x.bandwidth() / 2)
          .attr("cy", y(t)).attr("r", 4)
          .attr("fill", C.orange).attr("opacity", 0.85);
      });

      // Estimate bars + whiskers
      payload.gates.forEach(r => {
        const xc = x(String(r.x)) + x.bandwidth() / 2;
        const ciLo = r.gate - 1.96 * r.se;
        const ciHi = r.gate + 1.96 * r.se;
        g.append("line").attr("x1", xc).attr("x2", xc)
          .attr("y1", y(ciLo)).attr("y2", y(ciHi))
          .attr("stroke", C.teal).attr("stroke-width", 2);
        g.append("line").attr("x1", xc - 7).attr("x2", xc + 7)
          .attr("y1", y(ciLo)).attr("y2", y(ciLo))
          .attr("stroke", C.teal).attr("stroke-width", 2);
        g.append("line").attr("x1", xc - 7).attr("x2", xc + 7)
          .attr("y1", y(ciHi)).attr("y2", y(ciHi))
          .attr("stroke", C.teal).attr("stroke-width", 2);
        g.append("circle").attr("cx", xc).attr("cy", y(r.gate)).attr("r", 5)
          .attr("fill", C.teal).attr("stroke", "#fff").attr("stroke-width", 1);
      });
    }
    return { update };
  }
  const simChart = makeSimChart(document.getElementById("sim-chart"));

  function refreshSim() {
    const out = simulateOnce({
      n: sim.n, t0: sim.t0, theta: sim.theta, sigma: sim.sigma, seed: sim.seed,
    });
    // Truth at each x.
    const truth = [1, 2, 3, 4, 5, 6].map(x => sim.t0 + sim.theta * (x - 3.5));
    truth.forEach((v, i) => {
      document.getElementById("sim-t" + (i + 1)).textContent = v.toFixed(3);
      const g = out.gates[i];
      document.getElementById("sim-g" + (i + 1)).textContent = Number.isFinite(g.gate) ? g.gate.toFixed(3) : "—";
    });
    const p = chi2_p(out.chi2, 5);
    document.getElementById("sim-chi2").textContent = out.chi2.toFixed(2);
    document.getElementById("sim-p").textContent = p < 0.0001 ? "< 0.0001" : p.toFixed(4);
    document.getElementById("sim-ate").textContent = out.ate.toFixed(3);
    document.getElementById("sim-reject").textContent = p < 0.05 ? "reject H₀" : "do not reject";
    simChart.update({ gates: out.gates, truth });
  }

  const onSimChange = debounce(refreshSim, 100);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim.n = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim.n;
    onSimChange();
  });
  document.getElementById("sim-t").addEventListener("input", e => {
    sim.t0 = +e.target.value;
    document.getElementById("sim-t-val").textContent = sim.t0.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-th").addEventListener("input", e => {
    sim.theta = +e.target.value;
    document.getElementById("sim-th-val").textContent = sim.theta.toFixed(3);
    onSimChange();
  });
  document.getElementById("sim-s").addEventListener("input", e => {
    sim.sigma = +e.target.value;
    document.getElementById("sim-s-val").textContent = sim.sigma.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-reseed").addEventListener("click", () => {
    sim.seed = Math.floor(Math.random() * 1e9) + 1;
    refreshSim();
  });
  document.getElementById("sim-reset").addEventListener("click", () => {
    sim.n = 300; sim.t0 = 0.25; sim.theta = -0.04; sim.sigma = 0.30; sim.seed = 42;
    document.getElementById("sim-n").value = sim.n;
    document.getElementById("sim-t").value = sim.t0;
    document.getElementById("sim-th").value = sim.theta;
    document.getElementById("sim-s").value = sim.sigma;
    document.getElementById("sim-n-val").textContent = sim.n;
    document.getElementById("sim-t-val").textContent = sim.t0.toFixed(2);
    document.getElementById("sim-th-val").textContent = sim.theta.toFixed(3);
    document.getElementById("sim-s-val").textContent = sim.sigma.toFixed(2);
    refreshSim();
  });

  // ---- Monte-Carlo button (100 sims) ------------------------------------
  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const stats = document.getElementById("sim-mc-stats");

    const N_SIMS = 100;
    const ates = [], chis = [];
    let nRej = 0;
    let i = 0;

    function step() {
      const batch = 4;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const out = simulateOnce({
          n: sim.n, t0: sim.t0, theta: sim.theta, sigma: sim.sigma,
          seed: sim.seed + i + 1,
        });
        ates.push(out.ate);
        chis.push(out.chi2);
        const p = chi2_p(out.chi2, 5);
        if (p < 0.05) nRej++;
      }
      const pct = (i / N_SIMS) * 100;
      progBar.style.width = pct + "%";
      progLabel.textContent = `simulation ${i} / ${N_SIMS}`;
      if (i < N_SIMS) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = `done (${N_SIMS} simulations)`;
        stats.style.display = "grid";
        const meanA = d3.mean(ates);
        const sdA = d3.deviation(ates);
        const meanC = d3.mean(chis);
        document.getElementById("sim-mc-mean").textContent = (meanA ?? 0).toFixed(3);
        document.getElementById("sim-mc-sd").textContent   = (sdA ?? 0).toFixed(3);
        document.getElementById("sim-mc-rej").textContent  = ((nRej / N_SIMS) * 100).toFixed(0) + "%";
        document.getElementById("sim-mc-chi").textContent  = (meanC ?? 0).toFixed(2);
        btn.disabled = false;
      }
    }
    step();
  });

  // Initial sim render
  refreshSim();

  // ====================================================================
  // TAB 4 — ATE Forest Plot (CHARTS.forest_plot on baked §7 estimates).
  // ====================================================================
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
  };

  function fpRefresh() {
    if (!dataCache) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(dataCache.estimates, methods, outcomes);
  }
  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fpRefresh);
  });

  // ---- Load baked results.json and bootstrap Tab 2 + Tab 4 -------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    dataCache = data;
    refreshGates();
    fpRefresh();
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    document.getElementById("gate-chart").innerHTML =
      '<div style="padding:20px;color:#d97757;">Failed to load results.json — GATE explorer disabled.</div>';
    document.getElementById("fp-chart").innerHTML =
      '<div style="padding:20px;color:#d97757;">Failed to load results.json — forest plot disabled.</div>';
  });

  // ---- Global error handler --------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[stata_cate2 app] uncaught error:", e.error);
  });
})();
