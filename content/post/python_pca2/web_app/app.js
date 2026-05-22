// app.js — wires the DOM controls to dgp/lasso/charts for the
// python_pca2 web app. Tab 1 reuses CHARTS.l1_vs_l2_animation as a
// "shifting vs fixed yardstick" metaphor. Tabs 2 and 4 implement small
// PCA-specific compute kernels (3x3 covariance, power iteration for
// the leading eigenvector — fast enough for 100-sim batch). Tab 3
// reuses CHARTS.forest_plot on the post's real PC1-weight numbers.

(function () {
  "use strict";

  // ---- Tab switching ---------------------------------------------------------
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

  // ---- Generic debounce ------------------------------------------------------
  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ====================================================================
  // TAB 1 — Shifting vs fixed yardstick (reuse L1/L2 animation)
  // ====================================================================
  CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));

  // ====================================================================
  // PCA kernel — power iteration on a small 3x3 covariance matrix.
  // For three indicators this converges in ~30 iterations.
  // ====================================================================
  const PCA = (function () {
    function colMeans(X, n, p) {
      const m = new Float64Array(p);
      for (let i = 0; i < n; i++) for (let j = 0; j < p; j++) m[j] += X[i * p + j];
      for (let j = 0; j < p; j++) m[j] /= n;
      return m;
    }
    function colStds(X, n, p, mu) {
      const s = new Float64Array(p);
      for (let i = 0; i < n; i++) for (let j = 0; j < p; j++) {
        const v = X[i * p + j] - mu[j]; s[j] += v * v;
      }
      for (let j = 0; j < p; j++) s[j] = Math.sqrt(s[j] / n) || 1;
      return s;
    }
    function standardise(X, n, p, mu, sd) {
      const Z = new Float64Array(n * p);
      for (let i = 0; i < n; i++) for (let j = 0; j < p; j++) {
        Z[i * p + j] = (X[i * p + j] - mu[j]) / sd[j];
      }
      return Z;
    }
    function cov3(Z, n) {
      const C = [0,0,0, 0,0,0, 0,0,0];
      for (let i = 0; i < n; i++) {
        const a = Z[i*3], b = Z[i*3+1], c = Z[i*3+2];
        C[0] += a*a; C[1] += a*b; C[2] += a*c;
        C[3] += b*a; C[4] += b*b; C[5] += b*c;
        C[6] += c*a; C[7] += c*b; C[8] += c*c;
      }
      for (let k = 0; k < 9; k++) C[k] /= n;
      return C;
    }
    // Power iteration for the largest eigenvector of a 3x3 symmetric matrix.
    function leadingEigen3(C) {
      let v = [1, 1, 1];
      for (let it = 0; it < 50; it++) {
        const u0 = C[0]*v[0] + C[1]*v[1] + C[2]*v[2];
        const u1 = C[3]*v[0] + C[4]*v[1] + C[5]*v[2];
        const u2 = C[6]*v[0] + C[7]*v[1] + C[8]*v[2];
        const n = Math.sqrt(u0*u0 + u1*u1 + u2*u2) || 1;
        v = [u0/n, u1/n, u2/n];
      }
      // Eigenvalue = v' C v.
      const cv0 = C[0]*v[0] + C[1]*v[1] + C[2]*v[2];
      const cv1 = C[3]*v[0] + C[4]*v[1] + C[5]*v[2];
      const cv2 = C[6]*v[0] + C[7]*v[1] + C[8]*v[2];
      const lambda = v[0]*cv0 + v[1]*cv1 + v[2]*cv2;
      // Sign convention: force first entry positive.
      if (v[0] < 0) v = [-v[0], -v[1], -v[2]];
      // Total variance of standardised data = p = 3.
      const total = (C[0] + C[4] + C[8]);
      return { v, lambda, var_explained: lambda / total };
    }
    function pcaPipeline(X, n, p) {
      const mu = colMeans(X, n, p);
      const sd = colStds(X, n, p, mu);
      const Z = standardise(X, n, p, mu, sd);
      const C = cov3(Z, n);
      const eig = leadingEigen3(C);
      // PC1 scores.
      const scores = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        scores[i] = Z[i*3]*eig.v[0] + Z[i*3+1]*eig.v[1] + Z[i*3+2]*eig.v[2];
      }
      let s = 0; for (let i = 0; i < n; i++) s += scores[i];
      const mean = s / n;
      return { weights: eig.v, var_explained: eig.var_explained,
               pc1_mean: mean, scores, mu, sd };
    }
    return { pcaPipeline };
  })();

  // ====================================================================
  // TAB 2 — PCA Simulator
  // ====================================================================
  const sim = {
    n: 150, income_shock: -0.20, edu_gain: 0.15, noise: 0.30, seed: 42,
  };

  // Build a 2-period DGP for 3 indicators (education / health / income).
  // Each region has a latent "development" score; the three observed
  // indicators are noisy linear functions of it. Period 2 shifts the
  // means: income_shock on income, edu_gain on education.
  function buildPanel(state) {
    const rng = DGP.mulberry32(state.seed || 1);
    const randn = DGP.makeNormal(rng);
    const n = state.n, p = 3;
    const X_p1 = new Float64Array(n * p);
    const X_p2 = new Float64Array(n * p);
    // Latent baseline development.
    const dev1 = new Float64Array(n), dev2 = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      dev1[i] = randn();                // mean 0, sd 1
      dev2[i] = randn();
    }
    // Loadings on the latent factor (not too uniform; income loads slightly more).
    const lam = [0.85, 0.80, 0.95];
    // Period-2 mean shifts (in z-units).
    const shifts_p2 = [state.edu_gain, 0.05, state.income_shock];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < p; j++) {
        // P1: lam[j]*dev1 + noise
        X_p1[i*p + j] = lam[j] * dev1[i] + state.noise * randn();
        // P2: shift + lam[j]*dev2 + noise
        X_p2[i*p + j] = shifts_p2[j] + lam[j] * dev2[i] + state.noise * randn();
      }
    }
    // Stacked.
    const X_pool = new Float64Array(2 * n * p);
    for (let k = 0; k < n * p; k++) {
      X_pool[k] = X_p1[k];
      X_pool[n * p + k] = X_p2[k];
    }
    return { X_p1, X_p2, X_pool, n, p };
  }

  function runSimAnalysis(state) {
    const panel = buildPanel(state);
    const n = panel.n, p = panel.p;
    const pool = PCA.pcaPipeline(panel.X_pool, 2 * n, p);
    const pp_p1 = PCA.pcaPipeline(panel.X_p1, n, p);
    const pp_p2 = PCA.pcaPipeline(panel.X_p2, n, p);
    // PC1 means under pooled, by period.
    let s1 = 0, s2 = 0;
    for (let i = 0; i < n; i++) { s1 += pool.scores[i]; s2 += pool.scores[n + i]; }
    const pool_pc1_p1 = s1 / n, pool_pc1_p2 = s2 / n;
    // Weight drift.
    const drift = [
      pp_p2.weights[0] - pp_p1.weights[0],
      pp_p2.weights[1] - pp_p1.weights[1],
      pp_p2.weights[2] - pp_p1.weights[2],
    ];
    const avg_drift = (Math.abs(drift[0]) + Math.abs(drift[1]) + Math.abs(drift[2])) / 3;
    return {
      pool, pp_p1, pp_p2,
      pool_pc1_p1, pool_pc1_p2,
      drift, avg_drift,
      pp_pc1_p1: pp_p1.pc1_mean,  // exactly 0 by construction
      pp_pc1_p2: pp_p2.pc1_mean,
    };
  }

  // Bar chart of weights for the simulator (pooled vs P1 vs P2).
  function makeWeightsChart(container) {
    const W = 720, H = 280;
    const margin = { top: 28, right: 24, bottom: 50, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    container.innerHTML = "";
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
    const root = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const C = CHARTS.C;
    function update(data) {
      root.selectAll("*").remove();
      const groups = ["Education", "Health", "Income"];
      const series = [
        { name: "Pooled",     color: C.teal,   vals: data.pool.weights },
        { name: "Per-period 2013", color: C.steel,  vals: data.pp_p1.weights },
        { name: "Per-period 2019", color: C.orange, vals: data.pp_p2.weights },
      ];
      const x0 = d3.scaleBand().domain(groups).range([0, w]).padding(0.22);
      const x1 = d3.scaleBand().domain(series.map(s => s.name)).range([0, x0.bandwidth()]).padding(0.1);
      const yMin = Math.min(0, d3.min(series.flatMap(s => s.vals)));
      const yMax = Math.max(1, d3.max(series.flatMap(s => s.vals)) + 0.05);
      const y = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);
      root.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x0))
        .selectAll("text").attr("fill", C.text).attr("font-size", 12);
      root.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      root.selectAll(".domain, .tick line").attr("stroke", C.muted);
      // Zero line.
      root.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
      // Title.
      root.append("text").attr("x", w / 2).attr("y", -10)
        .attr("text-anchor", "middle").attr("fill", C.text)
        .attr("font-size", 13).attr("font-weight", 600)
        .text("PC1 weights — simulated 2-period panel");
      // Bars.
      groups.forEach((g, gi) => {
        series.forEach(s => {
          const v = s.vals[gi];
          root.append("rect")
            .attr("x", x0(g) + x1(s.name))
            .attr("y", Math.min(y(0), y(v)))
            .attr("width", x1.bandwidth())
            .attr("height", Math.abs(y(v) - y(0)))
            .attr("fill", s.color).attr("opacity", 0.85);
          root.append("text")
            .attr("x", x0(g) + x1(s.name) + x1.bandwidth() / 2)
            .attr("y", y(v) - 4)
            .attr("text-anchor", "middle")
            .attr("fill", C.text).attr("font-size", 10)
            .text(v.toFixed(3));
        });
      });
      // Legend.
      const lg = root.append("g").attr("transform", `translate(${w - 270},${-2})`);
      series.forEach((s, i) => {
        lg.append("rect").attr("x", i * 90).attr("y", 0).attr("width", 12).attr("height", 12)
          .attr("fill", s.color);
        lg.append("text").attr("x", i * 90 + 16).attr("y", 10)
          .attr("fill", C.text).attr("font-size", 11).text(s.name);
      });
    }
    return { update };
  }

  const simChart = makeWeightsChart(document.getElementById("sim-weights-chart"));

  // Histogram for sim batch results.
  function makeDriftHist(container) {
    const W = 720, H = 260;
    const margin = { top: 18, right: 24, bottom: 38, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    container.innerHTML = "";
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const C = CHARTS.C;
    function update(data) {
      g.selectAll("*").remove();
      const all = data.drifts_pp.concat(data.drifts_pool);
      if (all.length === 0) return;
      const ext = [0, Math.max(0.05, d3.max(all))];
      const x = d3.scaleLinear().domain([ext[0], ext[1] * 1.05]).range([0, w]);
      const bin = d3.bin().domain(x.domain()).thresholds(20);
      const binsPP = bin(data.drifts_pp);
      const binsPool = bin(data.drifts_pool);
      const maxC = d3.max(binsPP.concat(binsPool), d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);
      function draw(bins, color, opacity) {
        g.selectAll(null).data(bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", color).attr("opacity", opacity);
      }
      draw(binsPP, C.orange, 0.7);
      draw(binsPool, C.teal,   0.85);
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 32})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Average |Δw| across 100 simulations");
      // Legend.
      const lg = g.append("g").attr("transform", `translate(${w - 200},${10})`);
      lg.append("rect").attr("x", 0).attr("y", 0).attr("width", 12).attr("height", 12).attr("fill", C.orange).attr("opacity", 0.7);
      lg.append("text").attr("x", 16).attr("y", 10).attr("fill", C.text).attr("font-size", 11).text("Per-period drift");
      lg.append("rect").attr("x", 0).attr("y", 18).attr("width", 12).attr("height", 12).attr("fill", C.teal);
      lg.append("text").attr("x", 16).attr("y", 28).attr("fill", C.text).attr("font-size", 11).text("Pooled drift (≈ 0)");
    }
    return { update };
  }
  const simHist = makeDriftHist(document.getElementById("sim-hist"));

  function fmt3(x) { return (x === null || !Number.isFinite(x)) ? "—" : x.toFixed(3); }
  function fmt4(x) { return (x === null || !Number.isFinite(x)) ? "—" : x.toFixed(4); }
  function fmtPct(x) { return (x === null || !Number.isFinite(x)) ? "—" : (x * 100).toFixed(1) + "%"; }

  function simRender() {
    const r = runSimAnalysis(sim);
    document.getElementById("sim-pool-edu").textContent = fmt3(r.pool.weights[0]);
    document.getElementById("sim-pool-hea").textContent = fmt3(r.pool.weights[1]);
    document.getElementById("sim-pool-inc").textContent = fmt3(r.pool.weights[2]);
    document.getElementById("sim-pool-var").textContent = fmtPct(r.pool.var_explained);
    document.getElementById("sim-pool-shift").textContent = fmt3(r.pool_pc1_p2 - r.pool_pc1_p1);
    document.getElementById("sim-pp-edu").textContent =
      `${fmt3(r.pp_p1.weights[0])} → ${fmt3(r.pp_p2.weights[0])}`;
    document.getElementById("sim-pp-hea").textContent =
      `${fmt3(r.pp_p1.weights[1])} → ${fmt3(r.pp_p2.weights[1])}`;
    document.getElementById("sim-pp-inc").textContent =
      `${fmt3(r.pp_p1.weights[2])} → ${fmt3(r.pp_p2.weights[2])}`;
    document.getElementById("sim-pp-drift").textContent = fmt3(r.avg_drift);
    document.getElementById("sim-pp-shift").textContent = fmt3(r.pp_pc1_p2 - r.pp_pc1_p1);
    simChart.update(r);
  }

  const onSimChange = debounce(simRender, 100);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim.n = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim.n;
    onSimChange();
  });
  document.getElementById("sim-ish").addEventListener("input", e => {
    sim.income_shock = +e.target.value;
    document.getElementById("sim-ish-val").textContent = sim.income_shock.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-eg").addEventListener("input", e => {
    sim.edu_gain = +e.target.value;
    document.getElementById("sim-eg-val").textContent = sim.edu_gain.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-noise").addEventListener("input", e => {
    sim.noise = +e.target.value;
    document.getElementById("sim-noise-val").textContent = sim.noise.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-reseed").addEventListener("click", () => {
    sim.seed = Math.floor(Math.random() * 1e9) + 1;
    simRender();
  });
  document.getElementById("sim-reset").addEventListener("click", () => {
    sim.n = 150; sim.income_shock = -0.20; sim.edu_gain = 0.15; sim.noise = 0.30; sim.seed = 42;
    document.getElementById("sim-n").value = sim.n;
    document.getElementById("sim-ish").value = sim.income_shock;
    document.getElementById("sim-eg").value = sim.edu_gain;
    document.getElementById("sim-noise").value = sim.noise;
    document.getElementById("sim-n-val").textContent = sim.n;
    document.getElementById("sim-ish-val").textContent = sim.income_shock.toFixed(2);
    document.getElementById("sim-eg-val").textContent = sim.edu_gain.toFixed(2);
    document.getElementById("sim-noise-val").textContent = sim.noise.toFixed(2);
    simRender();
  });

  // 100-sim batch.
  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const histEl = document.getElementById("sim-hist");
    const histStats = document.getElementById("sim-hist-stats");
    const N_SIMS = 100;
    const drifts_pp = [];
    const drifts_pool = [];
    let i = 0;
    function step() {
      const batch = 4;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const r = runSimAnalysis({ ...sim, seed: sim.seed + i + 1 });
        drifts_pp.push(r.avg_drift);
        // For pooled "drift" we compute against a re-seed: how much does
        // the pooled weight vector change between two independent
        // realisations? Use the within-period split distance.
        const w = r.pool.weights;
        // Compare pooled weights across two halves of the pooled data
        // (cheap proxy: just record the L2 deviation of the pooled
        // weights from a fixed reference [0.577, 0.577, 0.577] scaled).
        // To get a meaningful comparison with per-period drift, compute
        // pooled-vs-pooled drift between consecutive seeds.
        if (i > 0) {
          // Compare against previous pooled weights to get a drift metric.
        }
        drifts_pool.push(0); // populated below
      }
      const pct = (i / N_SIMS) * 100;
      progBar.style.width = pct + "%";
      progLabel.textContent = `simulation ${i} / ${N_SIMS}`;
      if (i < N_SIMS) {
        setTimeout(step, 0);
      } else {
        // Compute pooled drift as deviation of each pooled weight vector
        // from the mean pooled weight vector across the batch — a fair
        // analog to "how much do the per-period weights drift between
        // periods within the same dataset".
        // Re-run to capture pooled weights across batch.
        const poolWeights = [];
        for (let k = 0; k < N_SIMS; k++) {
          const r2 = runSimAnalysis({ ...sim, seed: sim.seed + k + 1 });
          poolWeights.push(r2.pool.weights.slice());
        }
        const meanW = [0, 0, 0];
        for (const w of poolWeights) { meanW[0] += w[0]; meanW[1] += w[1]; meanW[2] += w[2]; }
        meanW[0] /= N_SIMS; meanW[1] /= N_SIMS; meanW[2] /= N_SIMS;
        const drifts_pool_real = poolWeights.map(w =>
          (Math.abs(w[0] - meanW[0]) + Math.abs(w[1] - meanW[1]) + Math.abs(w[2] - meanW[2])) / 3
        );
        progLabel.textContent = `done (${N_SIMS} simulations)`;
        histEl.style.display = "block";
        histStats.style.display = "grid";
        simHist.update({ drifts_pp, drifts_pool: drifts_pool_real });
        const meanPP = d3.mean(drifts_pp);
        const sdPP   = d3.deviation(drifts_pp);
        const meanPL = d3.mean(drifts_pool_real);
        const sdPL   = d3.deviation(drifts_pool_real);
        document.getElementById("sim-pp-meandrift").textContent  = fmt4(meanPP);
        document.getElementById("sim-pp-sddrift").textContent    = fmt4(sdPP);
        document.getElementById("sim-pool-meandrift").textContent = fmt4(meanPL);
        document.getElementById("sim-pool-sddrift").textContent   = fmt4(sdPL);
        btn.disabled = false;
      }
    }
    step();
  });

  // Initial sim render.
  simRender();

  // ====================================================================
  // TAB 3 — Forest plot of real PC1 weights (data/results.json)
  // ====================================================================
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
    bars: CHARTS.selection_bars(document.getElementById("fp-bars")),
    data: null,
  };
  function fpRefresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, outcomes);
    fp.bars.update(fp.data.selection || [], outcomes);
  }
  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fpRefresh);
  });

  // ====================================================================
  // TAB 4 — SHDI validation: simple bar chart of R² values.
  // ====================================================================
  function makeValBars(container) {
    const W = 720, H = 280;
    const margin = { top: 28, right: 24, bottom: 50, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    container.innerHTML = "";
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
    const root = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const C = CHARTS.C;
    function update(data) {
      root.selectAll("*").remove();
      const groups = ["Cross-sectional levels", "Dynamic changes"];
      const series = [
        { name: "Pooled PCA",     color: C.teal,   vals: [data.pooled_level_r2, data.pooled_change_r2] },
        { name: "Per-period PCA", color: C.orange, vals: [data.perperiod_level_r2, data.perperiod_change_r2] },
      ];
      const x0 = d3.scaleBand().domain(groups).range([0, w]).padding(0.3);
      const x1 = d3.scaleBand().domain(series.map(s => s.name)).range([0, x0.bandwidth()]).padding(0.1);
      const y  = d3.scaleLinear().domain([0.95, 1.0]).range([h, 0]);
      root.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x0))
        .selectAll("text").attr("fill", C.text).attr("font-size", 12);
      root.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted);
      root.selectAll(".domain, .tick line").attr("stroke", C.muted);
      root.append("text").attr("x", w / 2).attr("y", -10)
        .attr("text-anchor", "middle").attr("fill", C.text)
        .attr("font-size", 13).attr("font-weight", 600)
        .text("R² vs official SHDI — pooled wins on both axes");
      root.append("text").attr("transform", `rotate(-90) translate(${-h/2},${-44})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11)
        .text("R²  (zoomed to 0.95 — 1.00)");
      groups.forEach((g, gi) => {
        series.forEach(s => {
          const v = s.vals[gi];
          root.append("rect")
            .attr("x", x0(g) + x1(s.name))
            .attr("y", y(v))
            .attr("width", x1.bandwidth())
            .attr("height", h - y(v))
            .attr("fill", s.color).attr("opacity", 0.85);
          root.append("text")
            .attr("x", x0(g) + x1(s.name) + x1.bandwidth() / 2)
            .attr("y", y(v) - 6)
            .attr("text-anchor", "middle")
            .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
            .text(v.toFixed(4));
        });
      });
      // Legend.
      const lg = root.append("g").attr("transform", `translate(${w - 230},${0})`);
      series.forEach((s, i) => {
        lg.append("rect").attr("x", i * 110).attr("y", 0).attr("width", 12).attr("height", 12).attr("fill", s.color);
        lg.append("text").attr("x", i * 110 + 16).attr("y", 10)
          .attr("fill", C.text).attr("font-size", 11).text(s.name);
      });
    }
    return { update };
  }
  const valBars = makeValBars(document.getElementById("val-bars-chart"));

  // ---- Forest-plot data loader (consumes results.json) -----------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fpRefresh();
    if (data.validation) {
      valBars.update(data.validation);
      // Also populate the tab-4 stat cards from JSON to make data the SoT.
      document.getElementById("val-pool-r2").textContent  = data.validation.pooled_level_r2.toFixed(4);
      document.getElementById("val-pp-r2").textContent    = data.validation.perperiod_level_r2.toFixed(4);
      document.getElementById("val-r2-diff").textContent  =
        (data.validation.pooled_level_r2 - data.validation.perperiod_level_r2).toFixed(4);
      document.getElementById("val-poolc-r2").textContent = data.validation.pooled_change_r2.toFixed(4);
      document.getElementById("val-ppc-r2").textContent   = data.validation.perperiod_change_r2.toFixed(4);
      document.getElementById("val-rc2-diff").textContent =
        (data.validation.pooled_change_r2 - data.validation.perperiod_change_r2).toFixed(4);
      document.getElementById("val-disagree").textContent =
        `${data.validation.n_direction_disagree} / ${data.validation.n_regions}`;
      document.getElementById("val-rho").textContent = data.validation.spearman_rank_change.toFixed(4);
    }
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[python_pca2 app] uncaught error:", e.error);
  });
})();
