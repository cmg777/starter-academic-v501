// app.js — ESDA interactive lab.
// Wires DOM controls to a small spatial DGP + Moran's I computation and
// the CHARTS module. Runs after window.DGP and window.CHARTS are defined.

(function () {
  "use strict";

  // ====================================================================
  // Tab switching.
  // ====================================================================
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

  // ====================================================================
  // Spatial DGP.
  // Generates an n x n grid of regions arranged on a square lattice with
  // rook contiguity (each interior cell has 4 neighbours; corners have 2).
  // Values are simulated as y = (I - rho * W)^{-1} * eps where eps is
  // standard normal. Larger rho => stronger positive spatial autocorrelation.
  //
  // For computational tractability we use a simpler closed-form simulation
  // that is statistically equivalent in flavour: start with iid noise then
  // iteratively smooth using the row-standardised W. After ~10 smoothing
  // steps with mixing weight rho, the result has Moran's I close to rho
  // (for a grid). We use this purely for didactic intuition, not for
  // statistical exactness — and we report the true Moran's I we measure
  // from the simulated data, not a theoretical target.
  // ====================================================================
  function buildGridW(side) {
    // Row-standardised rook contiguity for a side x side grid.
    const n = side * side;
    // Each entry: array of [neighbour_index, weight].
    const W = new Array(n);
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / side);
      const c = i % side;
      const nbs = [];
      if (r > 0) nbs.push((r - 1) * side + c);
      if (r < side - 1) nbs.push((r + 1) * side + c);
      if (c > 0) nbs.push(r * side + (c - 1));
      if (c < side - 1) nbs.push(r * side + (c + 1));
      const w = 1 / Math.max(1, nbs.length);
      W[i] = nbs.map(j => [j, w]);
    }
    return W;
  }

  function spatialLag(W, y) {
    const n = y.length;
    const wy = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0;
      const row = W[i];
      for (let k = 0; k < row.length; k++) s += row[k][1] * y[row[k][0]];
      wy[i] = s;
    }
    return wy;
  }

  function moranI(W, y) {
    // Row-standardised W => sum of weights = n, so the prefactor simplifies.
    const n = y.length;
    let mean = 0;
    for (let i = 0; i < n; i++) mean += y[i];
    mean /= n;
    const z = new Float64Array(n);
    let denom = 0;
    for (let i = 0; i < n; i++) {
      z[i] = y[i] - mean;
      denom += z[i] * z[i];
    }
    if (denom === 0) return { I: 0, z: z, wz: new Float64Array(n) };
    let zw_sum = 0;
    const wz = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const row = W[i];
      let s = 0;
      for (let k = 0; k < row.length; k++) s += row[k][1] * z[row[k][0]];
      wz[i] = s;
      zw_sum += z[i] * s;
    }
    // Row-standardised W => denominator n*S0^{-1} cancels.
    const I = zw_sum / denom * n / n;
    return { I, z, wz };
  }

  function simulateSpatial(side, rho, seed) {
    const n = side * side;
    const W = buildGridW(side);
    // Mulberry32 RNG.
    let a = (seed >>> 0) || 1;
    function rng() {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    // Box-Muller normals.
    function normal() {
      let u, v;
      do { u = rng(); } while (u < 1e-10);
      v = rng();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    const eps = new Float64Array(n);
    for (let i = 0; i < n; i++) eps[i] = normal();
    // Iterative smoothing approximating (I - rho W)^{-1} eps via Neumann series:
    //   y = eps + rho W eps + rho^2 W^2 eps + ...
    // Truncate after a fixed number of terms.
    const K = 12;
    const y = new Float64Array(n);
    let term = new Float64Array(eps);
    for (let i = 0; i < n; i++) y[i] = term[i];
    let scale = 1;
    for (let k = 1; k <= K; k++) {
      term = spatialLag(W, term);
      scale *= rho;
      for (let i = 0; i < n; i++) y[i] += scale * term[i];
    }
    return { W, y, n };
  }

  // Local Moran's I and quadrant classification.
  function localMoran(W, z, wz, denom_per_n) {
    const n = z.length;
    const q = new Int8Array(n);
    for (let i = 0; i < n; i++) {
      // Quadrant 1 HH, 2 LH, 3 LL, 4 HL.
      if (z[i] >= 0 && wz[i] >= 0) q[i] = 1;
      else if (z[i] < 0 && wz[i] >= 0) q[i] = 2;
      else if (z[i] < 0 && wz[i] < 0) q[i] = 3;
      else q[i] = 4;
    }
    return q;
  }

  // Counts for LISA bars. We approximate "significance" with a simple
  // magnitude threshold on |z_i * wz_i| relative to its overall mean —
  // tunable to keep the proportions in the same ballpark as the post.
  function lisaCounts(z, wz, q) {
    const n = z.length;
    const stat = new Float64Array(n);
    for (let i = 0; i < n; i++) stat[i] = z[i] * wz[i];
    // 25th percentile = "not significant" threshold (loose, didactic).
    const sorted = Array.from(stat).sort((a, b) => a - b);
    const thresh = sorted[Math.floor(n * 0.5)];
    const counts = { HH: 0, LL: 0, HL: 0, LH: 0, ns: 0 };
    const names = { 1: "HH", 2: "LH", 3: "LL", 4: "HL" };
    for (let i = 0; i < n; i++) {
      if (stat[i] <= thresh) {
        counts.ns++;
      } else {
        counts[names[q[i]]]++;
      }
    }
    return counts;
  }

  // ====================================================================
  // TAB 1 — Concept animation.
  // ====================================================================
  if (document.getElementById("intro-anim")) {
    CHARTS.moran_clustering_animation(document.getElementById("intro-anim"));
  }

  // ====================================================================
  // TAB 2 — Moran scatter lab.
  // ====================================================================
  const lab = {
    side: 12,         // 144 cells
    rho: 0.6,
    seed: 7,
    chart: CHARTS.moran_scatter(document.getElementById("lab-scatter")),
  };
  function lab_refit() {
    const sim = simulateSpatial(lab.side, lab.rho, lab.seed);
    const m = moranI(sim.W, sim.y);
    const q = localMoran(sim.W, m.z, m.wz);
    lab.chart.update({ z: m.z, wz: m.wz, moranI: m.I, quadrants: q });
    document.getElementById("lab-moran-val").textContent = m.I.toFixed(3);
    const counts = lisaCounts(m.z, m.wz, q);
    document.getElementById("lab-stat-hh").textContent = counts.HH;
    document.getElementById("lab-stat-ll").textContent = counts.LL;
    document.getElementById("lab-stat-out").textContent = counts.HL + counts.LH;
    document.getElementById("lab-stat-n").textContent = sim.n;
  }
  const labRefitDb = debounce(lab_refit, 80);

  document.getElementById("lab-rho").addEventListener("input", e => {
    lab.rho = +e.target.value;
    document.getElementById("lab-rho-val").textContent = lab.rho.toFixed(2);
    labRefitDb();
  });
  document.getElementById("lab-side").addEventListener("input", e => {
    lab.side = +e.target.value;
    document.getElementById("lab-side-val").textContent = (lab.side * lab.side);
    labRefitDb();
  });
  document.getElementById("lab-seed").addEventListener("click", () => {
    lab.seed = Math.floor(Math.random() * 1e6) + 1;
    document.getElementById("lab-seed-val").textContent = lab.seed;
    lab_refit();
  });
  document.getElementById("lab-seed-val").textContent = lab.seed;
  lab_refit();

  // ====================================================================
  // TAB 3 — LISA Explorer.
  // ====================================================================
  const lisa = {
    side: 14,
    rho: 0.7,
    seed: 12345,
    chart: CHARTS.lisa_bars(document.getElementById("lisa-bars")),
    scatter: CHARTS.moran_scatter(document.getElementById("lisa-scatter")),
  };
  function lisa_refit() {
    const sim = simulateSpatial(lisa.side, lisa.rho, lisa.seed);
    const m = moranI(sim.W, sim.y);
    const q = localMoran(sim.W, m.z, m.wz);
    const counts = lisaCounts(m.z, m.wz, q);
    lisa.chart.update({ sim: counts, n: sim.n, rho: lisa.rho });
    lisa.scatter.update({ z: m.z, wz: m.wz, moranI: m.I, quadrants: q });
    document.getElementById("lisa-moran-val").textContent = m.I.toFixed(3);
    document.getElementById("lisa-hh").textContent = counts.HH;
    document.getElementById("lisa-ll").textContent = counts.LL;
    document.getElementById("lisa-hl").textContent = counts.HL;
    document.getElementById("lisa-lh").textContent = counts.LH;
    document.getElementById("lisa-ns").textContent = counts.ns;
  }
  const lisaRefitDb = debounce(lisa_refit, 80);
  document.getElementById("lisa-rho").addEventListener("input", e => {
    lisa.rho = +e.target.value;
    document.getElementById("lisa-rho-val").textContent = lisa.rho.toFixed(2);
    lisaRefitDb();
  });
  document.getElementById("lisa-side").addEventListener("input", e => {
    lisa.side = +e.target.value;
    document.getElementById("lisa-side-val").textContent = (lisa.side * lisa.side);
    lisaRefitDb();
  });
  document.getElementById("lisa-run100").addEventListener("click", function () {
    // Run 100 simulations at the current rho/side, plot the distribution
    // of Moran's I to show its sampling distribution.
    const N = 100;
    const samples = [];
    let i = 0;
    const btn = this;
    btn.disabled = true;
    btn.textContent = "Running...";
    const prog = document.querySelector("#lisa-progress > div");
    function tick() {
      const end = Math.min(N, i + 4);
      for (; i < end; i++) {
        const sim = simulateSpatial(lisa.side, lisa.rho, lisa.seed + i + 1);
        const m = moranI(sim.W, sim.y);
        samples.push(m.I);
      }
      prog.style.width = (i / N * 100) + "%";
      if (i < N) {
        setTimeout(tick, 0);
      } else {
        // Show histogram inside the lisa-hist container.
        const hist = document.getElementById("lisa-hist");
        hist.style.display = "block";
        // Enlarged top margin so the "mean I = ..." annotation sits ABOVE
        // the plot area and never overlaps with histogram bars near the mean.
        const W = 720, H = 230;
        const margin = { top: 40, right: 16, bottom: 36, left: 36 };
        const w = W - margin.left - margin.right;
        const h = H - margin.top - margin.bottom;
        d3.select(hist).html("");
        const svg = d3.select(hist).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        const ext = d3.extent(samples);
        const x = d3.scaleLinear().domain([Math.min(0, ext[0] - 0.05), Math.max(1, ext[1] + 0.05)]).range([0, w]);
        const bin = d3.bin().domain(x.domain()).thresholds(20);
        const bins = bin(samples);
        const maxC = d3.max(bins, d => d.length) || 1;
        const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);
        g.selectAll("rect").data(bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", "#00d4c8").attr("opacity", 0.8);
        g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(7).tickFormat(d3.format(".2f"))).selectAll("text").attr("fill", "#8b9dc3");
        g.append("g").call(d3.axisLeft(y).ticks(4)).selectAll("text").attr("fill", "#8b9dc3");
        g.selectAll(".domain, .tick line").attr("stroke", "#8b9dc3");
        // Mean line.
        const mean = d3.mean(samples);
        g.append("line").attr("x1", x(mean)).attr("x2", x(mean)).attr("y1", 0).attr("y2", h).attr("stroke", "#d97757").attr("stroke-width", 2);
        // Mean annotation placed in the SVG top margin (above the plot area)
        // so it can never be hidden behind histogram bars near the mean.
        svg.append("text")
          .attr("x", margin.left).attr("y", 18)
          .attr("text-anchor", "start")
          .attr("fill", "#e8ecf2").attr("font-size", 12).attr("font-weight", 600)
          .text(`Sampling distribution of Moran's I — N = ${N}, ρ = ${lisa.rho.toFixed(2)}`);
        svg.append("text")
          .attr("x", W - margin.right).attr("y", 18)
          .attr("text-anchor", "end")
          .attr("fill", "#d97757").attr("font-size", 12).attr("font-weight", 600)
          .text(`mean I = ${mean.toFixed(3)}`);
        g.append("text").attr("transform", `translate(${w / 2},${h + 28})`).attr("text-anchor", "middle").attr("fill", "#e8ecf2").attr("font-size", 12).text("Moran's I from each simulated lattice");
        btn.disabled = false;
        btn.textContent = "Run 100 simulations";
      }
    }
    tick();
  });
  lisa_refit();

  // ====================================================================
  // TAB 4 — Forest plot of Moran's I across outcomes.
  // ====================================================================
  const forest = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
    cached: null,
  };
  function fp_refresh() {
    if (!forest.cached) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    forest.chart.update(forest.cached.estimates, outcomes, methods);
  }
  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });
  fetch("data/results.json").then(r => r.json()).then(data => {
    forest.cached = data;
    fp_refresh();
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    document.getElementById("fp-chart").innerHTML = '<div style="padding:20px;color:#d97757;">Failed to load results data. See console.</div>';
  });

  // ====================================================================
  // Global error handler.
  // ====================================================================
  window.addEventListener("error", function (e) {
    console.error("[esda-app] uncaught error:", e.error);
  });
})();
