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
  // Helpers: spatial-dynamic-panel DGP and tiny estimators.
  // y[i,t] = rho * y[i,t-1] + psi * (W*y)[i,t] + beta * x[i,t] + lam[i]*f[t] + alpha[i] + e[i,t]
  // W is a sparse ring weight: each i links to k nearest in a circle.
  // ------------------------------------------------------------------
  function makeRng(seed) {
    if (DGP.mulberry32) return DGP.mulberry32(seed);
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeNormal(rng) {
    if (DGP.makeNormal) return DGP.makeNormal(rng);
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
  }

  // Build a row-standardised k-nearest-ring weight matrix (sparse).
  // For each i, neighbours are i-1, i+1 (mod N), each with weight 0.5.
  function makeRingW(N) {
    // Stored as {nbr: Int32Array, w: Float64Array} per row (flat layout).
    // For k=2 ring, each row has exactly 2 neighbours each with weight 0.5.
    const k = 2;
    const nbr = new Int32Array(N * k);
    const wts = new Float64Array(N * k);
    for (let i = 0; i < N; i++) {
      nbr[i * k + 0] = (i - 1 + N) % N;
      nbr[i * k + 1] = (i + 1) % N;
      wts[i * k + 0] = 0.5;
      wts[i * k + 1] = 0.5;
    }
    return { N, k, nbr, wts };
  }

  function applyW(Wmat, y) {
    const N = Wmat.N;
    const k = Wmat.k;
    const out = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      let s = 0;
      for (let j = 0; j < k; j++) {
        s += Wmat.wts[i * k + j] * y[Wmat.nbr[i * k + j]];
      }
      out[i] = s;
    }
    return out;
  }

  // Simulate a spatial dynamic panel via fixed-point iteration each period.
  // Returns Y (N*T), F (T), Lam (N), X (N*T).
  function simulateSpatialPanel(p) {
    const { N, T, rho, psi, beta, sigma_e, sigma_alpha, sigma_f, seed } = p;
    const rng = makeRng(seed);
    const normal = makeNormal(rng);
    const Wmat = makeRingW(N);

    const Y = new Float64Array(N * T);
    const X = new Float64Array(N * T);
    const alpha = new Float64Array(N);
    const Lam   = new Float64Array(N);
    const F     = new Float64Array(T);

    for (let i = 0; i < N; i++) {
      alpha[i] = normal() * sigma_alpha;
      Lam[i]   = normal();
      X[i * T + 0] = normal();
    }
    for (let t = 0; t < T; t++) F[t] = normal() * sigma_f;
    // X follows AR(1) so it has its own persistence.
    for (let i = 0; i < N; i++) {
      for (let t = 1; t < T; t++) {
        X[i * T + t] = 0.5 * X[i * T + t - 1] + normal();
      }
    }

    // Burn-in: 30 periods of stationary dynamics.
    const burnT = 30;
    let prev = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      prev[i] = alpha[i] / Math.max(1 - rho, 0.05);
    }
    // Burn-in uses period-0 X and Lam*F0 (held constant).
    for (let b = 0; b < burnT; b++) {
      const Wy = applyW(Wmat, prev);
      const next = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        next[i] = rho * prev[i] + psi * Wy[i] + beta * X[i * T + 0]
                  + alpha[i] + Lam[i] * F[0] + normal() * sigma_e;
      }
      // Resolve simultaneous equation: y = rho*prev + psi*W*y + rest.
      // Use 8 fixed-point iterations to absorb the spatial multiplier.
      let cur = next;
      for (let it = 0; it < 8; it++) {
        const Wcur = applyW(Wmat, cur);
        const cand = new Float64Array(N);
        for (let i = 0; i < N; i++) {
          cand[i] = rho * prev[i] + psi * Wcur[i] + beta * X[i * T + 0]
                    + alpha[i] + Lam[i] * F[0] + (next[i] - rho * prev[i] - psi * Wy[i]
                                                  - beta * X[i * T + 0] - alpha[i] - Lam[i] * F[0]);
        }
        cur = cand;
      }
      prev = cur;
    }

    // Main loop.
    for (let t = 0; t < T; t++) {
      // Compute innovations once.
      const innov = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        innov[i] = (t === 0 ? alpha[i] / Math.max(1 - rho, 0.05) : Y[i * T + t - 1]) * rho
                   + beta * X[i * T + t] + alpha[i] + Lam[i] * F[t] + normal() * sigma_e;
      }
      // Solve y = innov + psi*W*y by 12 fixed-point iterations.
      let cur = innov.slice();
      for (let it = 0; it < 12; it++) {
        const Wcur = applyW(Wmat, cur);
        for (let i = 0; i < N; i++) {
          cur[i] = innov[i] + psi * Wcur[i];
        }
      }
      for (let i = 0; i < N; i++) Y[i * T + t] = cur[i];
    }

    return { Y, X, F, Lam, alpha, Wmat, N, T };
  }

  // Within-FE demeaning along the time dimension for each unit.
  function demeanWithin(arr, N, T) {
    const out = new Float64Array(N * T);
    for (let i = 0; i < N; i++) {
      let mu = 0;
      for (let t = 0; t < T; t++) mu += arr[i * T + t];
      mu /= T;
      for (let t = 0; t < T; t++) out[i * T + t] = arr[i * T + t] - mu;
    }
    return out;
  }

  // Cross-sectional mean for each t: meanT(arr)[t] = (1/N) sum_i arr[i,t]
  function crossSectionMean(arr, N, T) {
    const out = new Float64Array(T);
    for (let t = 0; t < T; t++) {
      let s = 0;
      for (let i = 0; i < N; i++) s += arr[i * T + t];
      out[t] = s / N;
    }
    return out;
  }

  // Simple "defactor": subtract the cross-sectional mean at each t.
  // (Equivalent to time fixed effects; a one-factor approximation.)
  function defactor(arr, N, T) {
    const mu = crossSectionMean(arr, N, T);
    const out = new Float64Array(N * T);
    for (let i = 0; i < N; i++) {
      for (let t = 0; t < T; t++) {
        out[i * T + t] = arr[i * T + t] - mu[t];
      }
    }
    return out;
  }

  // 2SLS-style estimator of (psi, rho) using L2.y as instrument.
  // Regress y on Wy and L.y, instrumented by L2.y and (W*L.y).
  // After FE demeaning. Returns {psi_hat, rho_hat}.
  // If defactorFirst === true, defactor before within-demeaning.
  function estimateSp(simData, defactorFirst) {
    const { Y, Wmat, N, T } = simData;
    let Yused = Y;
    if (defactorFirst) Yused = defactor(Yused, N, T);
    const Ydm = demeanWithin(Yused, N, T);

    // Build regressors: WY[i,t], LY[i,t-1] = Ydm[i,t-1].
    // We use t = 2..T-1 (so that L2 is observable).
    let SxxA = 0, SxxB = 0, SxyA = 0, SxyB = 0, SxxAB = 0;
    // Instruments: z1 = L2.y, z2 = W*L.y.
    // We solve a small 2x2 normal-equation system for {psi, rho} using a
    // partialling-out shortcut: regress y on (Wy, Ly) where Wy is in-period.
    // For pedagogy we use OLS-on-FE-data (this is biased; the goal is to
    // show the relative gap between defactor and not-defactor, which is
    // what dominates in practice).
    let n = 0;
    for (let i = 0; i < N; i++) {
      // Need Y at all t. Compute Wy[i,t] from Ydm.
      const Wy_i = new Float64Array(T);
      for (let t = 0; t < T; t++) {
        let s = 0;
        for (let j = 0; j < Wmat.k; j++) {
          s += Wmat.wts[i * Wmat.k + j] * Ydm[Wmat.nbr[i * Wmat.k + j] * T + t];
        }
        Wy_i[t] = s;
      }
      for (let t = 1; t < T; t++) {
        const y  = Ydm[i * T + t];
        const Wy = Wy_i[t];
        const Ly = Ydm[i * T + t - 1];
        SxxA  += Wy * Wy;
        SxxB  += Ly * Ly;
        SxxAB += Wy * Ly;
        SxyA  += Wy * y;
        SxyB  += Ly * y;
        n++;
      }
    }
    // Solve [SxxA SxxAB; SxxAB SxxB] [psi; rho] = [SxyA; SxyB]
    const det = SxxA * SxxB - SxxAB * SxxAB;
    if (Math.abs(det) < 1e-10) return { psi_hat: NaN, rho_hat: NaN };
    const psi_hat = ( SxxB * SxyA - SxxAB * SxyB) / det;
    const rho_hat = (-SxxAB * SxyA + SxxA * SxyB) / det;
    return { psi_hat, rho_hat };
  }

  // ------------------------------------------------------------------
  // TAB 1 — factor-omission animation.
  //   Pre-compute psi_hat under defactor vs no-defactor as sigma_f sweeps
  //   from 0 to 1.5, averaged over 10 redraws per sigma_f.
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

    const truePsi = 0.40;
    const sigmas = [];
    for (let s = 0; s <= 1.5; s += 0.1) sigmas.push(Number(s.toFixed(2)));
    const dfCurve = [];
    const nfCurve = [];
    for (const sf of sigmas) {
      let sDF = 0, sNF = 0, nDF = 0, nNF = 0;
      for (let r = 0; r < 6; r++) {
        const sim = simulateSpatialPanel({
          N: 40, T: 16, rho: 0.30, psi: truePsi, beta: 0.5,
          sigma_e: 1.0, sigma_alpha: 0.6, sigma_f: sf,
          seed: 1000 + r,
        });
        const df = estimateSp(sim, true);
        const nf = estimateSp(sim, false);
        if (Number.isFinite(df.psi_hat)) { sDF += df.psi_hat; nDF++; }
        if (Number.isFinite(nf.psi_hat)) { sNF += nf.psi_hat; nNF++; }
      }
      dfCurve.push([sf, nDF > 0 ? sDF / nDF : NaN]);
      nfCurve.push([sf, nNF > 0 ? sNF / nNF : NaN]);
    }

    const xScale = d3.scaleLinear().domain([0, 1.5]).range([0, w]);
    const allY = dfCurve.concat(nfCurve).map(d => d[1]).filter(Number.isFinite).concat([truePsi]);
    const yMin = Math.min.apply(null, allY) - 0.05;
    const yMax = Math.max.apply(null, allY) + 0.05;
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format(".1f")))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w/2},${h+36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Factor strength σ_f");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h/2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Estimated ψ̂ (true ψ = 0.40)");

    g.append("line")
      .attr("x1", 0).attr("x2", w)
      .attr("y1", yScale(truePsi)).attr("y2", yScale(truePsi))
      .attr("stroke", C.steel).attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5 5");
    g.append("text")
      .attr("x", w - 6).attr("y", yScale(truePsi) - 6)
      .attr("text-anchor", "end").attr("fill", C.steel).attr("font-size", 11)
      .text("true ψ = 0.40");

    const lineGen = d3.line().x(d => xScale(d[0])).y(d => yScale(d[1])).curve(d3.curveMonotoneX);
    g.append("path").attr("d", lineGen(nfCurve)).attr("fill", "none")
      .attr("stroke", C.orange).attr("stroke-width", 2.5);
    g.append("path").attr("d", lineGen(dfCurve)).attr("fill", "none")
      .attr("stroke", C.teal).attr("stroke-width", 2.5);

    const lg = g.append("g").attr("transform", `translate(${10},${10})`);
    lg.append("rect").attr("width", 220).attr("height", 50)
      .attr("fill", "rgba(15,23,41,0.7)").attr("stroke", C.line).attr("rx", 6);
    lg.append("circle").attr("cx", 14).attr("cy", 15).attr("r", 5).attr("fill", C.orange);
    lg.append("text").attr("x", 26).attr("y", 19).attr("fill", C.text).attr("font-size", 12)
      .text("No-factor IV (ignores factors)");
    lg.append("circle").attr("cx", 14).attr("cy", 35).attr("r", 5).attr("fill", C.teal);
    lg.append("text").attr("x", 26).attr("y", 39).attr("fill", C.text).attr("font-size", 12)
      .text("Defactored IV");

    // Cycling cursor.
    const cursor = g.append("line")
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", C.faint).attr("stroke-width", 1.2);
    const dfDot = g.append("circle").attr("r", 6).attr("fill", C.teal);
    const nfDot = g.append("circle").attr("r", 6).attr("fill", C.orange);
    const sLabel = g.append("text")
      .attr("y", -8).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600);

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      const cycleSeconds = 9;
      const phase = (elapsed % cycleSeconds) / cycleSeconds;
      const sweep = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI);
      const idx = Math.max(0, Math.min(sigmas.length - 1, Math.round(sweep * (sigmas.length - 1))));
      const sf = sigmas[idx];
      cursor.attr("x1", xScale(sf)).attr("x2", xScale(sf));
      if (Number.isFinite(dfCurve[idx][1])) dfDot.attr("cx", xScale(sf)).attr("cy", yScale(dfCurve[idx][1]));
      if (Number.isFinite(nfCurve[idx][1])) nfDot.attr("cx", xScale(sf)).attr("cy", yScale(nfCurve[idx][1]));
      sLabel.attr("x", xScale(sf)).text(`σ_f = ${sf.toFixed(1)}`);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })();

  // ------------------------------------------------------------------
  // TAB 2 — Defactored-IV Simulator
  // ------------------------------------------------------------------
  const sim = {
    psi: 0.40, rho: 0.30, N: 80, T: 20, sigma_f: 0.60,
    sigma_e: 1.0, sigma_alpha: 0.6, beta: 0.5, seed: 7,
  };

  function sim_render() {
    const data = simulateSpatialPanel({
      N: sim.N, T: sim.T, rho: sim.rho, psi: sim.psi,
      beta: sim.beta, sigma_e: sim.sigma_e, sigma_alpha: sim.sigma_alpha,
      sigma_f: sim.sigma_f, seed: sim.seed,
    });
    const df = estimateSp(data, true);
    const nf = estimateSp(data, false);

    document.getElementById("sim-stat-psi-true").textContent = sim.psi.toFixed(2);
    document.getElementById("sim-stat-rho-true").textContent = sim.rho.toFixed(2);
    document.getElementById("sim-stat-psi-df").textContent = Number.isFinite(df.psi_hat) ? df.psi_hat.toFixed(3) : "—";
    document.getElementById("sim-stat-psi-nf").textContent = Number.isFinite(nf.psi_hat) ? nf.psi_hat.toFixed(3) : "—";
    document.getElementById("sim-stat-rho-df").textContent = Number.isFinite(df.rho_hat) ? df.rho_hat.toFixed(3) : "—";
    document.getElementById("sim-stat-rho-nf").textContent = Number.isFinite(nf.rho_hat) ? nf.rho_hat.toFixed(3) : "—";

    // Draw a small grouped-bar chart: rows = parameter (psi, rho), bars per row.
    const container = document.getElementById("sim-bars");
    const W = 760, H = 280;
    const margin = { top: 24, right: 30, bottom: 38, left: 80 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const rows = [
      { key: "ψ", trueVal: sim.psi, df: df.psi_hat, nf: nf.psi_hat },
      { key: "ρ", trueVal: sim.rho, df: df.rho_hat, nf: nf.rho_hat },
    ];
    const allVals = [];
    rows.forEach(r => {
      allVals.push(r.trueVal);
      if (Number.isFinite(r.df)) allVals.push(r.df);
      if (Number.isFinite(r.nf)) allVals.push(r.nf);
    });
    const lo = Math.min(0, Math.min.apply(null, allVals)) - 0.05;
    const hi = Math.max(0.6, Math.max.apply(null, allVals)) + 0.05;
    const x = d3.scaleLinear().domain([lo, hi]).range([0, w]);
    const y0 = d3.scaleBand().domain(rows.map(r => r.key)).range([0, h]).padding(0.25);
    const y1 = d3.scaleBand().domain(["truth", "defactored", "no-factor"]).range([0, y0.bandwidth()]).padding(0.15);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);
    g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
      .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

    rows.forEach(r => {
      const yc = y0(r.key);
      g.append("text").attr("x", -10).attr("y", yc + y0.bandwidth()/2 + 4)
        .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 13).attr("font-weight", 600)
        .text(r.key);

      const trueBar = { name: "truth", v: r.trueVal, color: C.steel };
      const dfBar   = { name: "defactored", v: r.df, color: C.teal };
      const nfBar   = { name: "no-factor", v: r.nf, color: C.orange };
      [trueBar, dfBar, nfBar].forEach(b => {
        if (!Number.isFinite(b.v)) return;
        const yb = yc + y1(b.name);
        const x0 = x(0);
        const x1v = x(b.v);
        g.append("rect")
          .attr("x", Math.min(x0, x1v))
          .attr("y", yb + y1.bandwidth() * 0.1)
          .attr("width", Math.abs(x1v - x0))
          .attr("height", y1.bandwidth() * 0.8)
          .attr("fill", b.color).attr("opacity", 0.85);
        g.append("text").attr("x", x1v + (x1v >= x0 ? 4 : -4))
          .attr("text-anchor", x1v >= x0 ? "start" : "end")
          .attr("y", yb + y1.bandwidth()/2 + 4)
          .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
          .text(b.v.toFixed(3));
      });
    });

    // Legend (top right).
    const lg = g.append("g").attr("transform", `translate(${w - 320},${-12})`);
    lg.append("rect").attr("x", -8).attr("y", -10).attr("width", 320).attr("height", 22)
      .attr("fill", "rgba(15,23,41,0.7)").attr("rx", 4);
    [{c: C.steel, l: "truth"}, {c: C.teal, l: "defactored"}, {c: C.orange, l: "no-factor"}].forEach((d, i) => {
      lg.append("rect").attr("x", i * 110).attr("y", -5).attr("width", 14).attr("height", 12).attr("fill", d.c);
      lg.append("text").attr("x", i * 110 + 18).attr("y", 5).attr("fill", C.text).attr("font-size", 11).text(d.l);
    });
  }

  const onSimParam = debounce(sim_render, 140);
  function bindSim(id, key, prec) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", e => {
      sim[key] = +e.target.value;
      const valEl = document.getElementById(id + "-val");
      if (valEl) valEl.textContent = prec ? sim[key].toFixed(prec) : sim[key];
      onSimParam();
    });
  }
  bindSim("sim-psi", "psi",     2);
  bindSim("sim-rho", "rho",     2);
  bindSim("sim-N",   "N",       0);
  bindSim("sim-T",   "T",       0);
  bindSim("sim-sf",  "sigma_f", 2);

  const simReseed = document.getElementById("sim-reseed");
  if (simReseed) {
    simReseed.addEventListener("click", () => {
      sim.seed = Math.floor(Math.random() * 1e9) + 1;
      sim_render();
    });
  }
  const simReset = document.getElementById("sim-reset");
  if (simReset) {
    simReset.addEventListener("click", () => {
      sim.psi = 0.40; sim.rho = 0.30; sim.N = 80; sim.T = 20; sim.sigma_f = 0.60; sim.seed = 7;
      document.getElementById("sim-psi").value = sim.psi;
      document.getElementById("sim-rho").value = sim.rho;
      document.getElementById("sim-N").value   = sim.N;
      document.getElementById("sim-T").value   = sim.T;
      document.getElementById("sim-sf").value  = sim.sigma_f;
      document.getElementById("sim-psi-val").textContent = sim.psi.toFixed(2);
      document.getElementById("sim-rho-val").textContent = sim.rho.toFixed(2);
      document.getElementById("sim-N-val").textContent   = sim.N;
      document.getElementById("sim-T-val").textContent   = sim.T;
      document.getElementById("sim-sf-val").textContent  = sim.sigma_f.toFixed(2);
      sim_render();
    });
  }

  // 100-sim button: build a histogram of psi-hats.
  const simRun100 = document.getElementById("sim-run100");
  if (simRun100) {
    simRun100.addEventListener("click", function () {
      const btn = this;
      btn.disabled = true;
      const progBar = document.querySelector("#sim-progress > div");
      const progLabel = document.getElementById("sim-progress-label");
      const histEl = document.getElementById("sim-hist");
      const N_SIMS = 100;
      const psis_df = [];
      const psis_nf = [];
      let i = 0;
      function step() {
        const batch = 2;
        const end = Math.min(N_SIMS, i + batch);
        for (; i < end; i++) {
          const data = simulateSpatialPanel({
            N: sim.N, T: sim.T, rho: sim.rho, psi: sim.psi,
            beta: sim.beta, sigma_e: sim.sigma_e, sigma_alpha: sim.sigma_alpha,
            sigma_f: sim.sigma_f, seed: sim.seed + i + 1,
          });
          const df = estimateSp(data, true);
          const nf = estimateSp(data, false);
          if (Number.isFinite(df.psi_hat)) psis_df.push(df.psi_hat);
          if (Number.isFinite(nf.psi_hat)) psis_nf.push(nf.psi_hat);
        }
        progBar.style.width = (i / N_SIMS * 100) + "%";
        progLabel.textContent = `simulation ${i} / ${N_SIMS}`;
        if (i < N_SIMS) setTimeout(step, 0);
        else {
          progLabel.textContent = `done (${N_SIMS} simulations)`;
          histEl.style.display = "block";
          renderHist(histEl, psis_df, psis_nf, sim.psi);
          btn.disabled = false;
        }
      }
      step();
    });
  }

  function renderHist(container, df, nf, trueVal) {
    const W = 760, H = 260;
    const margin = { top: 20, right: 24, bottom: 38, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const all = df.concat(nf);
    const lo = Math.min.apply(null, all.concat([trueVal])) - 0.05;
    const hi = Math.max.apply(null, all.concat([trueVal])) + 0.05;
    const x = d3.scaleLinear().domain([lo, hi]).range([0, w]);
    const bins = d3.bin().domain(x.domain()).thresholds(24);
    const dfBins = bins(df);
    const nfBins = bins(nf);
    const maxCount = Math.max(
      d3.max(dfBins, b => b.length) || 0,
      d3.max(nfBins, b => b.length) || 0
    );
    const y = d3.scaleLinear().domain([0, maxCount]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(5)).selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("line").attr("x1", x(trueVal)).attr("x2", x(trueVal))
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", C.steel).attr("stroke-width", 2);
    g.append("text").attr("x", x(trueVal) + 4).attr("y", 12)
      .attr("fill", C.steel).attr("font-size", 11)
      .text(`true ψ = ${trueVal.toFixed(2)}`);

    nfBins.forEach(b => {
      g.append("rect")
        .attr("x", x(b.x0) + 0.5).attr("y", y(b.length))
        .attr("width", Math.max(0, x(b.x1) - x(b.x0) - 1))
        .attr("height", h - y(b.length))
        .attr("fill", C.orange).attr("opacity", 0.55);
    });
    dfBins.forEach(b => {
      g.append("rect")
        .attr("x", x(b.x0) + 0.5).attr("y", y(b.length))
        .attr("width", Math.max(0, x(b.x1) - x(b.x0) - 1))
        .attr("height", h - y(b.length))
        .attr("fill", C.teal).attr("opacity", 0.55);
    });

    g.append("text").attr("x", w/2).attr("y", h + 30).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 12).text("ψ̂ across 100 simulations");
  }

  sim_render();

  // ------------------------------------------------------------------
  // TAB 3 — Forest plot from results.json
  // ------------------------------------------------------------------
  const COLOR_MODEL = {
    "Full model":      C.teal,
    "No factors":      C.orange,
    "No spatial lag":  C.steel,
    "Heterogeneous":   "#b89b6a",
  };

  function buildForestPlot(container) {
    const W = 920;
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(data, activeMethods, activeOutcomes, diagnostics) {
      const outcomes = activeOutcomes.length ? activeOutcomes : Array.from(new Set(data.map(d => d.outcome)));
      const methods  = activeMethods.length  ? activeMethods  : Array.from(new Set(data.map(d => d.method)));

      const rows = data.filter(d => outcomes.includes(d.outcome) && methods.includes(d.method)
                                 && !(d.method === "No spatial lag" && d.outcome === "psi (W*NPL)"));
      const margin = { top: 32, right: 24, bottom: 36, left: 220 };
      const facetGap = 26;
      const nFacets = outcomes.length;
      const facetW = (W - margin.left - margin.right - (nFacets - 1) * facetGap) / Math.max(1, nFacets);
      const facetH = 30 * methods.length + 28;
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

        facet.append("text").attr("x", facetW / 2).attr("y", -12)
          .attr("text-anchor", "middle").attr("fill", C.text)
          .attr("font-size", 12).attr("font-weight", 600).text(outcome);

        facet.append("line")
          .attr("x1", x(0)).attr("x2", x(0))
          .attr("y1", 0).attr("y2", facetH)
          .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

        facet.append("g").attr("transform", `translate(0,${facetH})`)
          .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".2f")))
          .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
        facet.selectAll(".domain, .tick line").attr("stroke", C.muted);

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

          const diag = (diagnostics || []).find(g => g.method === d.method);
          const jpStr = diag && diag.j_p !== null ? diag.j_p.toFixed(3) : "n/a";

          grp.on("mousemove", function (ev) {
            const rect = container.getBoundingClientRect();
            tooltip.html(
              `<div><strong style="color:${color}">${d.method}</strong> · ${d.outcome}</div>` +
              `<div><span class='tooltip-key'>estimate =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
              `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>` +
              `<div><span class='tooltip-key'>Hansen J p =</span> <span class='tooltip-val'>${jpStr}</span></div>`
            ).classed("show", true)
             .style("left", (ev.clientX - rect.left + 12) + "px")
             .style("top",  (ev.clientY - rect.top  + 12) + "px");
          }).on("mouseleave", function () { tooltip.classed("show", false); });
        });
      });
    }
    return { update };
  }

  function buildJBars(container) {
    function update(diag) {
      const W = 540, H = 280;
      const margin = { top: 24, right: 14, bottom: 40, left: 100 };
      const w = W - margin.left - margin.right;
      const h = H - margin.top - margin.bottom;
      d3.select(container).selectAll("svg").remove();
      const svg = d3.select(container).append("svg")
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const items = diag.filter(d => d.j_p !== null);
      const y = d3.scaleBand().domain(items.map(d => d.method)).range([0, h]).padding(0.3);
      const x = d3.scaleLinear().domain([0, 1]).range([0, w]);

      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // 0.05 reference line.
      g.append("line").attr("x1", x(0.05)).attr("x2", x(0.05)).attr("y1", -4).attr("y2", h)
        .attr("stroke", C.orange).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
      g.append("text").attr("x", x(0.05)).attr("y", -8)
        .attr("text-anchor", "middle").attr("fill", C.orange).attr("font-size", 10)
        .text("0.05 cutoff");

      items.forEach(d => {
        const yc = y(d.method);
        const color = COLOR_MODEL[d.method] || C.text;
        g.append("text").attr("x", -10).attr("y", yc + y.bandwidth()/2 + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 11)
          .text(d.method);
        g.append("rect")
          .attr("x", 0).attr("y", yc + y.bandwidth() * 0.15)
          .attr("width", x(d.j_p)).attr("height", y.bandwidth() * 0.7)
          .attr("fill", color).attr("opacity", 0.85);
        g.append("text").attr("x", x(d.j_p) + 4).attr("y", yc + y.bandwidth()/2 + 4)
          .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
          .text(d.j_p.toFixed(3));
      });

      g.append("text").attr("x", w/2).attr("y", h + 32).attr("text-anchor", "middle")
        .attr("fill", C.text).attr("font-size", 11).text("Hansen J p-value");
    }
    return { update };
  }

  const fp = {
    chart: buildForestPlot(document.getElementById("fp-chart")),
    jbars: buildJBars(document.getElementById("fp-jbars")),
    data: null,
  };
  function fp_refresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, outcomes, fp.data.diagnostics || []);
    fp.jbars.update(fp.data.diagnostics || []);
  }
  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  // ------------------------------------------------------------------
  // TAB 4 — Long-run multipliers
  // ------------------------------------------------------------------
  const lr = {
    psi: 0.39, rho: 0.29, beta: 2.45,
  };

  function lr_render() {
    const tmult = 1 / Math.max(1 - lr.rho, 0.01);
    const smult = 1 / Math.max(1 - lr.psi, 0.01);
    const direct = lr.beta * tmult;
    const total  = direct * smult;
    document.getElementById("lr-stat-tmult").textContent  = tmult.toFixed(2);
    document.getElementById("lr-stat-smult").textContent  = smult.toFixed(2);
    document.getElementById("lr-stat-direct").textContent = direct.toFixed(2);
    document.getElementById("lr-stat-total").textContent  = total.toFixed(2);

    // Cascade chart: 4 bars (β, β*tmult, β*tmult*smult shown as direct + indirect).
    const container = document.getElementById("lr-cascade");
    const W = 760, H = 280;
    const margin = { top: 24, right: 30, bottom: 38, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const indirect = total - direct;
    const items = [
      { name: "Short-run β",   value: lr.beta,   color: C.steel },
      { name: "× temporal",    value: direct,    color: C.orange },
      { name: "× spatial",     value: total,     color: C.teal },
    ];
    const x = d3.scaleBand().domain(items.map(d => d.name)).range([0, w]).padding(0.35);
    const y = d3.scaleLinear().domain([0, Math.max(total, lr.beta) * 1.15]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text").attr("fill", C.text).attr("font-size", 12);
    g.append("g").call(d3.axisLeft(y).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    items.forEach(d => {
      g.append("rect").attr("x", x(d.name)).attr("y", y(d.value))
        .attr("width", x.bandwidth()).attr("height", h - y(d.value))
        .attr("fill", d.color).attr("opacity", 0.85);
      g.append("text").attr("x", x(d.name) + x.bandwidth()/2).attr("y", y(d.value) - 6)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12).attr("font-weight", 600)
        .text(d.value.toFixed(2));
    });

    // Annotation arrows + labels between bars.
    function annotateBetween(i, label, formula) {
      const x0 = x(items[i].name) + x.bandwidth();
      const x1 = x(items[i + 1].name);
      const xm = (x0 + x1) / 2;
      const ym = 30;
      g.append("text").attr("x", xm).attr("y", ym - 10)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
        .text(label);
      g.append("text").attr("x", xm).attr("y", ym + 6)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 10)
        .text(formula);
    }
    annotateBetween(0, `× ${tmult.toFixed(2)}`, "temporal");
    annotateBetween(1, `× ${smult.toFixed(2)}`, "spatial");

    // ----- all-vars long-run bars (full model) -----
    if (lr_allvars_data) {
      drawAllvarsBars(document.getElementById("lr-allvars"), lr_allvars_data);
    }
  }

  let lr_allvars_data = null;
  function drawAllvarsBars(container, items) {
    const W = 760, H = 320;
    const margin = { top: 24, right: 30, bottom: 38, left: 110 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand().domain(items.map(d => d.variable)).range([0, h]).padding(0.25);
    const xMin = Math.min(0, d3.min(items, d => d.total - 1.96 * d.total_se) - 0.2);
    const xMax = Math.max(0, d3.max(items, d => d.total + 1.96 * d.total_se) + 0.2);
    const x = d3.scaleLinear().domain([xMin, xMax]).range([0, w]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
      .attr("stroke", C.faint).attr("stroke-dasharray", "3 4");

    items.forEach(d => {
      const yc = y(d.variable);
      g.append("text").attr("x", -10).attr("y", yc + y.bandwidth()/2 + 4)
        .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 11)
        .text(d.variable);
      const x0 = x(0);
      const x1v = x(d.total);
      const color = d.total >= 0 ? C.orange : C.teal;
      g.append("rect")
        .attr("x", Math.min(x0, x1v))
        .attr("y", yc + y.bandwidth() * 0.15)
        .attr("width", Math.abs(x1v - x0))
        .attr("height", y.bandwidth() * 0.7)
        .attr("fill", color).attr("opacity", 0.85);
      const lo = d.total - 1.96 * d.total_se;
      const hi = d.total + 1.96 * d.total_se;
      g.append("line").attr("x1", x(lo)).attr("x2", x(hi))
        .attr("y1", yc + y.bandwidth()/2).attr("y2", yc + y.bandwidth()/2)
        .attr("stroke", C.text).attr("stroke-width", 1.5);
      g.append("text").attr("x", x1v + (x1v >= x0 ? 6 : -6))
        .attr("text-anchor", x1v >= x0 ? "start" : "end")
        .attr("y", yc + y.bandwidth()/2 + 4)
        .attr("fill", C.text).attr("font-size", 11).attr("font-weight", 600)
        .text(d.total.toFixed(3));
    });
    g.append("text").attr("x", w/2).attr("y", h + 32).attr("text-anchor", "middle")
      .attr("fill", C.text).attr("font-size", 11).text("Long-run total effect (from estat impact, lr)");
  }

  const onLrParam = debounce(lr_render, 60);
  function bindLr(id, key, prec) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", e => {
      lr[key] = +e.target.value;
      const valEl = document.getElementById(id + "-val");
      if (valEl) valEl.textContent = prec ? lr[key].toFixed(prec) : lr[key];
      onLrParam();
    });
  }
  bindLr("lr-psi",  "psi",  2);
  bindLr("lr-rho",  "rho",  2);
  bindLr("lr-beta", "beta", 2);

  // ------------------------------------------------------------------
  // Load results.json and populate Tabs 3 & 4.
  // ------------------------------------------------------------------
  fetch("data/results.json")
    .then(r => r.json())
    .then(data => {
      fp.data = data;
      fp_refresh();
      lr_allvars_data = data.longrun || [];
      lr_render();
    })
    .catch(err => {
      console.error("Failed to load results.json:", err);
      const el = document.getElementById("fp-chart");
      if (el) el.innerHTML =
        `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    });

  // First paint without data dependency.
  lr_render();

  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
