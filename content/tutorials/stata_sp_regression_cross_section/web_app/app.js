// app.js — Cross-sectional spatial regression interactive lab.
// Wires DOM controls to a simple 7x7 lattice spatial DGP, spillover animation,
// and a direct/indirect/total effects forest plot built from the post's
// results.json. Runs after window.DGP, window.LASSO, and window.CHARTS are
// defined.

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
  // Tab 1: Intro animation (reuse the L1 vs L2 / shrinkage animation).
  // ====================================================================
  CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));

  // ====================================================================
  // Lattice utilities — used by both Tab 2 (spillover animation) and
  // Tab 3 (DGP simulator).
  //
  // We build a 7x7 grid (49 cells, matching the Columbus n) with rook
  // contiguity (each interior cell has 4 neighbours). The spatial weight
  // matrix W is row-standardised: each row's weights sum to 1.
  // ====================================================================
  const SIDE = 7;
  const N = SIDE * SIDE;

  function buildRookW(side) {
    const n = side * side;
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
    if (denom === 0) return 0;
    let num = 0;
    for (let i = 0; i < n; i++) {
      const row = W[i];
      let s = 0;
      for (let k = 0; k < row.length; k++) s += row[k][1] * z[row[k][0]];
      num += z[i] * s;
    }
    // For row-standardized W, sum of all weights = n => prefactor = 1.
    return num / denom;
  }

  const W_LATTICE = buildRookW(SIDE);

  // Apply (I + rho*W + (rho*W)^2 + ... + (rho*W)^k) v approximately.
  // Equivalent to a power-series approximation of (I - rho*W)^{-1} v.
  function multiplierApply(W, rho, v, steps) {
    const n = v.length;
    let out = new Float64Array(n);
    let term = new Float64Array(v);
    for (let i = 0; i < n; i++) out[i] = term[i];
    for (let s = 0; s < steps; s++) {
      const next = spatialLag(W, term);
      let maxchg = 0;
      for (let i = 0; i < n; i++) {
        next[i] *= rho;
        out[i] += next[i];
        if (Math.abs(next[i]) > maxchg) maxchg = Math.abs(next[i]);
      }
      term = next;
      if (maxchg < 1e-8) break;
    }
    return out;
  }

  // ====================================================================
  // Tab 2: Spillover Animation.
  // ====================================================================
  const spState = {
    shocks: new Float64Array(N), // initial shock vector
    rho: 0.43,
    iter: 15,
  };

  function renderSpGrid() {
    const container = document.getElementById("sp-grid");
    container.innerHTML = "";
    const W = 540, H = 540;
    const cellSize = W / SIDE;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Compute response = (I - rho*W)^{-1} approx applied to shocks.
    const response = multiplierApply(W_LATTICE, spState.rho, spState.shocks, spState.iter);

    let maxVal = 0;
    for (let i = 0; i < N; i++) if (Math.abs(response[i]) > maxVal) maxVal = Math.abs(response[i]);
    if (maxVal < 1e-6) maxVal = 1;

    const color = d3.scaleLinear()
      .domain([0, maxVal * 0.5, maxVal])
      .range(["#0f1729", "#d97757", "#ffd6c1"])
      .clamp(true);

    for (let i = 0; i < N; i++) {
      const r = Math.floor(i / SIDE);
      const c = i % SIDE;
      const g = svg.append("g")
        .attr("transform", `translate(${c * cellSize},${r * cellSize})`)
        .style("cursor", "pointer")
        .on("click", () => {
          // Toggle: if already shocked, remove. Otherwise, drop a unit shock.
          if (Math.abs(spState.shocks[i]) > 0.01) {
            spState.shocks[i] = 0;
          } else {
            spState.shocks[i] = 1;
          }
          renderSpGrid();
        });
      g.append("rect")
        .attr("x", 1).attr("y", 1)
        .attr("width", cellSize - 2).attr("height", cellSize - 2)
        .attr("fill", color(Math.max(0, response[i])))
        .attr("stroke", spState.shocks[i] > 0.01 ? "#00d4c8" : "rgba(232,236,242,0.25)")
        .attr("stroke-width", spState.shocks[i] > 0.01 ? 3 : 1);
      g.append("text")
        .attr("x", cellSize / 2)
        .attr("y", cellSize / 2 + 5)
        .attr("text-anchor", "middle")
        .attr("fill", response[i] > maxVal * 0.5 ? "#0f1729" : "#e8ecf2")
        .attr("font-size", 11)
        .attr("font-weight", spState.shocks[i] > 0.01 ? 700 : 400)
        .text(response[i].toFixed(2));
    }

    // Update stat row.
    const amp = 1 / Math.max(0.05, 1 - spState.rho);
    document.getElementById("sp-amp").textContent = amp.toFixed(2);
    let reach = 0, mx = 0;
    for (let i = 0; i < N; i++) {
      if (Math.abs(response[i]) > 0.05) reach++;
      if (Math.abs(response[i]) > mx) mx = Math.abs(response[i]);
    }
    document.getElementById("sp-reach").textContent = reach.toString();
    document.getElementById("sp-max").textContent = mx.toFixed(2);
  }

  document.getElementById("sp-rho").addEventListener("input", e => {
    spState.rho = +e.target.value;
    document.getElementById("sp-rho-val").textContent = spState.rho.toFixed(2);
    renderSpGrid();
  });
  document.getElementById("sp-iter").addEventListener("input", e => {
    spState.iter = +e.target.value;
    document.getElementById("sp-iter-val").textContent = spState.iter.toString();
    renderSpGrid();
  });
  document.getElementById("sp-clear").addEventListener("click", () => {
    spState.shocks = new Float64Array(N);
    renderSpGrid();
  });

  // Default: drop a shock on the centre cell.
  spState.shocks[Math.floor(N / 2)] = 1;
  renderSpGrid();

  // ====================================================================
  // Tab 3: DGP simulator.
  //
  // Simulate y = (I - rho*W)^{-1} * (X*beta + W*X*theta + u),
  // where u = (I - lambda*W)^{-1} * eps and eps ~ N(0, sigma^2).
  //
  // Estimate rho via concentrated profile likelihood on a grid (pedagogical;
  // not Stata's full ML). Estimate lambda from the OLS residuals' Moran's I.
  // ====================================================================
  const dgpState = {
    rho: 0.40,
    lambda: 0.00,
    theta: -1.20,
    sigma: 5.00,
    seed: 4242,
  };

  function simulateColumbus(rho, lambda, theta, sigma, seed) {
    const rng = DGP.mulberry32(seed);
    const normal = DGP.makeNormal(rng);
    const inc = new Float64Array(N);
    const hoval = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      inc[i] = 14.38 + 5.76 * normal();
      hoval[i] = 38.44 + 18.46 * normal();
    }
    // Centred OLS-friendly version: build y0 = X*beta + W*X*theta.
    const beta_inc = -1.0;
    const beta_hoval = -0.3;
    const wIncRaw = spatialLag(W_LATTICE, inc);
    const y0 = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      y0[i] = 35 + beta_inc * inc[i] + beta_hoval * hoval[i] + theta * wIncRaw[i];
    }
    // Error: u = (I - lambda*W)^{-1} * eps
    const eps = new Float64Array(N);
    for (let i = 0; i < N; i++) eps[i] = sigma * normal();
    const u = multiplierApply(W_LATTICE, lambda, eps, 25);
    // Outcome: y = (I - rho*W)^{-1} * (y0 + u)
    const inner = new Float64Array(N);
    for (let i = 0; i < N; i++) inner[i] = y0[i] + u[i];
    const y = multiplierApply(W_LATTICE, rho, inner, 25);
    return { y: y, inc: inc, hoval: hoval, W_inc: wIncRaw };
  }

  // OLS estimate for y ~ inc + hoval (no intercept handled separately).
  function olsFit(y, X) {
    const n = y.length;
    const k = X[0].length;
    // Add intercept column.
    const Xb = X.map(row => [1].concat(row));
    const kb = k + 1;
    // X'X (kb x kb), X'y (kb).
    const XtX = Array.from({ length: kb }, () => new Float64Array(kb));
    const Xty = new Float64Array(kb);
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < kb; a++) {
        Xty[a] += Xb[i][a] * y[i];
        for (let b = 0; b < kb; b++) XtX[a][b] += Xb[i][a] * Xb[i][b];
      }
    }
    // Gauss-Jordan solve.
    const A = XtX.map((row, idx) => Array.from(row).concat([Xty[idx]]));
    for (let i = 0; i < kb; i++) {
      let pivot = A[i][i];
      if (Math.abs(pivot) < 1e-12) {
        // Find row with non-zero pivot.
        for (let r = i + 1; r < kb; r++) {
          if (Math.abs(A[r][i]) > 1e-12) {
            const tmp = A[i]; A[i] = A[r]; A[r] = tmp;
            pivot = A[i][i];
            break;
          }
        }
      }
      if (Math.abs(pivot) < 1e-12) return new Float64Array(kb);
      for (let c = 0; c <= kb; c++) A[i][c] /= pivot;
      for (let r = 0; r < kb; r++) {
        if (r === i) continue;
        const f = A[r][i];
        if (Math.abs(f) < 1e-15) continue;
        for (let c = 0; c <= kb; c++) A[r][c] -= f * A[i][c];
      }
    }
    const coefs = new Float64Array(kb);
    for (let i = 0; i < kb; i++) coefs[i] = A[i][kb];
    return coefs;
  }

  // Estimate rho via a quick grid search of profile log-likelihood.
  // For each rho in a grid, transform y* = (I - rho*W)*y, then OLS y* ~ X,
  // and pick the rho that maximises log|I - rho*W| - (n/2)*log(SSR/n).
  // We approximate log|I - rho*W| via the trace expansion (small for our
  // lattice). This is intentionally rough; the goal is pedagogy, not match
  // Stata's ML exactly.
  function estimateRho(y, X) {
    const n = y.length;
    let bestRho = 0, bestLL = -Infinity;
    for (let rho = -0.5; rho <= 0.9; rho += 0.05) {
      const wy = spatialLag(W_LATTICE, y);
      const yt = new Float64Array(n);
      for (let i = 0; i < n; i++) yt[i] = y[i] - rho * wy[i];
      const beta = olsFit(yt, X);
      let ssr = 0;
      for (let i = 0; i < n; i++) {
        let fit = beta[0];
        for (let j = 0; j < X[i].length; j++) fit += beta[j + 1] * X[i][j];
        const r = yt[i] - fit;
        ssr += r * r;
      }
      // Crude Jacobian: log|I - rho*W| ~ -(n*rho^2)/2 * E[w_ii^2] (approx).
      // For our 7x7 rook, average row sum of |w_ij|^2 ~ 1/4. We use a simple
      // approximation: log|I - rho*W| ~ n * log(1 - rho^2)/2 for moderate rho.
      const logJac = n * Math.log(Math.max(1e-9, 1 - rho * rho)) / 2;
      const ll = logJac - (n / 2) * Math.log(Math.max(1e-9, ssr / n));
      if (ll > bestLL) { bestLL = ll; bestRho = rho; }
    }
    return bestRho;
  }

  // Estimate lambda from OLS residuals via a small grid that maximises
  // a Moran-style criterion.
  function estimateLambda(y, X) {
    const n = y.length;
    const beta = olsFit(y, X);
    const resid = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let fit = beta[0];
      for (let j = 0; j < X[i].length; j++) fit += beta[j + 1] * X[i][j];
      resid[i] = y[i] - fit;
    }
    const I = moranI(W_LATTICE, resid);
    // For our rook lattice, max possible Moran's I is around 1, so use a
    // rough monotonic mapping: lambda ~ I when |I| is small.
    return Math.max(-0.7, Math.min(0.9, I * 1.05));
  }

  function renderDgpSim() {
    const sim = simulateColumbus(dgpState.rho, dgpState.lambda, dgpState.theta, dgpState.sigma, dgpState.seed);
    const y = sim.y;
    const X = new Array(N);
    const Xsdm = new Array(N);
    for (let i = 0; i < N; i++) {
      X[i] = [sim.inc[i], sim.hoval[i]];
      Xsdm[i] = [sim.inc[i], sim.hoval[i], sim.W_inc[i]];
    }
    const olsBeta = olsFit(y, X);
    const sdmBeta = olsFit(y, Xsdm);
    const rhoHat = estimateRho(y, X);
    const lamHat = estimateLambda(y, X);
    const I = moranI(W_LATTICE, y);

    document.getElementById("tr-rho").textContent = dgpState.rho.toFixed(2);
    document.getElementById("tr-lam").textContent = dgpState.lambda.toFixed(2);
    document.getElementById("tr-th").textContent = dgpState.theta.toFixed(2);
    document.getElementById("tr-mi").textContent = I.toFixed(3);

    document.getElementById("es-rho").textContent = rhoHat.toFixed(3);
    document.getElementById("es-lam").textContent = lamHat.toFixed(3);
    document.getElementById("es-binc").textContent = olsBeta[1].toFixed(3);
    document.getElementById("es-sdmbinc").textContent = sdmBeta[1].toFixed(3);

    // Render a scatter of y vs Wy on the chart area.
    renderDgpChart(y);
  }

  function renderDgpChart(y) {
    const container = document.getElementById("dgp-chart");
    container.innerHTML = "";
    const W = 720, H = 320;
    const margin = { top: 24, right: 28, bottom: 48, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Moran scatter: y (z-standardised) vs Wy (z-standardised).
    const wy = spatialLag(W_LATTICE, y);
    let mY = 0, mWy = 0;
    for (let i = 0; i < N; i++) { mY += y[i]; mWy += wy[i]; }
    mY /= N; mWy /= N;
    let sY = 0, sWy = 0;
    for (let i = 0; i < N; i++) { sY += (y[i] - mY) ** 2; sWy += (wy[i] - mWy) ** 2; }
    sY = Math.sqrt(sY / N); sWy = Math.sqrt(sWy / N);

    const pts = [];
    for (let i = 0; i < N; i++) {
      pts.push({ x: (y[i] - mY) / Math.max(1e-9, sY), y: (wy[i] - mWy) / Math.max(1e-9, sWy) });
    }
    const ext = d3.extent(pts.flatMap(p => [p.x, p.y]));
    const pad = (ext[1] - ext[0]) * 0.1 + 0.5;
    const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
    const yS = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([h, 0]);

    // Axes.
    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".1f")))
      .selectAll("text").attr("fill", "#8b9dc3");
    g.append("g").call(d3.axisLeft(yS).ticks(6).tickFormat(d3.format(".1f")))
      .selectAll("text").attr("fill", "#8b9dc3");
    g.selectAll(".domain, .tick line").attr("stroke", "#8b9dc3");

    // Zero lines.
    g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
      .attr("stroke", "rgba(232,236,242,0.15)").attr("stroke-dasharray", "3 4");
    g.append("line").attr("x1", 0).attr("x2", w).attr("y1", yS(0)).attr("y2", yS(0))
      .attr("stroke", "rgba(232,236,242,0.15)").attr("stroke-dasharray", "3 4");

    // Best-fit line (slope = Moran's I).
    const I = moranI(W_LATTICE, y);
    g.append("line")
      .attr("x1", x(ext[0] - pad)).attr("x2", x(ext[1] + pad))
      .attr("y1", yS(I * (ext[0] - pad))).attr("y2", yS(I * (ext[1] + pad)))
      .attr("stroke", "#d97757").attr("stroke-width", 2);
    g.append("text").attr("x", w - 8).attr("y", 14)
      .attr("text-anchor", "end").attr("fill", "#d97757").attr("font-size", 12)
      .text(`Moran's I = ${I.toFixed(3)}`);

    // Points.
    g.selectAll("circle.pt").data(pts).enter().append("circle")
      .attr("class", "pt")
      .attr("cx", d => x(d.x)).attr("cy", d => yS(d.y))
      .attr("r", 4).attr("fill", "#00d4c8").attr("opacity", 0.75);

    g.append("text").attr("transform", `translate(${w / 2},${h + 38})`)
      .attr("text-anchor", "middle").attr("fill", "#e8ecf2").attr("font-size", 12)
      .text("Standardised y (own value)");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", "#e8ecf2").attr("font-size", 12)
      .text("Standardised Wy (neighbour avg)");
  }

  const debouncedRender = debounce(renderDgpSim, 80);

  document.getElementById("dgp-rho").addEventListener("input", e => {
    dgpState.rho = +e.target.value;
    document.getElementById("dgp-rho-val").textContent = dgpState.rho.toFixed(2);
    debouncedRender();
  });
  document.getElementById("dgp-lam").addEventListener("input", e => {
    dgpState.lambda = +e.target.value;
    document.getElementById("dgp-lam-val").textContent = dgpState.lambda.toFixed(2);
    debouncedRender();
  });
  document.getElementById("dgp-th").addEventListener("input", e => {
    dgpState.theta = +e.target.value;
    document.getElementById("dgp-th-val").textContent = dgpState.theta.toFixed(2);
    debouncedRender();
  });
  document.getElementById("dgp-s").addEventListener("input", e => {
    dgpState.sigma = +e.target.value;
    document.getElementById("dgp-s-val").textContent = dgpState.sigma.toFixed(2);
    debouncedRender();
  });
  document.getElementById("dgp-reseed").addEventListener("click", () => {
    dgpState.seed = (dgpState.seed + 1) % 100000;
    renderDgpSim();
  });
  document.getElementById("dgp-reset").addEventListener("click", () => {
    dgpState.rho = 0.40; dgpState.lambda = 0.00; dgpState.theta = -1.20; dgpState.sigma = 5.00;
    document.getElementById("dgp-rho").value = "0.40";
    document.getElementById("dgp-lam").value = "0.00";
    document.getElementById("dgp-th").value = "-1.20";
    document.getElementById("dgp-s").value = "5.00";
    document.getElementById("dgp-rho-val").textContent = "0.40";
    document.getElementById("dgp-lam-val").textContent = "0.00";
    document.getElementById("dgp-th-val").textContent = "-1.20";
    document.getElementById("dgp-s-val").textContent = "5.00";
    renderDgpSim();
  });

  renderDgpSim();

  // ====================================================================
  // Tab 4: Direct / Indirect / Total Effects forest plot.
  // ====================================================================
  let resultsData = { estimates: [] };
  fetch("data/results.json")
    .then(r => r.json())
    .then(data => {
      resultsData = data;
      renderForest();
    })
    .catch(err => {
      console.error("Failed to load results.json:", err);
    });

  function renderForest() {
    const container = document.getElementById("fp-chart");
    container.innerHTML = "";
    const regressor = (document.querySelector('input[name="regressor"]:checked') || {}).value || "INC";
    const activeMethods = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);

    const effects = ["Direct", "Indirect", "Total"];
    const data = resultsData.estimates.filter(d => {
      if (!d.outcome.startsWith(regressor + " ")) return false;
      if (!activeMethods.includes(d.method)) return false;
      return true;
    });

    const W = 880;
    const margin = { top: 30, right: 24, bottom: 40, left: 110 };
    const facetGap = 28;
    const facetW = (W - margin.left - margin.right - (effects.length - 1) * facetGap) / effects.length;
    const facetH = 30 * activeMethods.length + 30;
    const totalH = margin.top + facetH + margin.bottom;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${totalH}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const colorMap = {
      "OLS":  "#8b9dc3",
      "SAR":  "#d97757",
      "SEM":  "#d97757",
      "SLX":  "#00d4c8",
      "SDM":  "#00d4c8",
      "SDEM": "#00d4c8",
      "SAC":  "#6a9bcc",
      "GNS":  "#6a9bcc",
    };

    effects.forEach((effect, ei) => {
      const facet = svg.append("g")
        .attr("transform", `translate(${margin.left + ei * (facetW + facetGap)},${margin.top})`);
      const subset = data.filter(d => d.outcome === regressor + " " + effect);
      const allVals = subset.flatMap(d => [d.ci_lo, d.ci_hi]);
      allVals.push(0);
      const ext = d3.extent(allVals);
      const pad = Math.max(0.1, (ext[1] - ext[0]) * 0.08);
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, facetW]);
      const y = d3.scaleBand().domain(activeMethods).range([0, facetH]).padding(0.35);

      facet.append("text").attr("x", facetW / 2).attr("y", -12)
        .attr("text-anchor", "middle").attr("fill", "#e8ecf2").attr("font-size", 14)
        .attr("font-weight", 600).text(`${regressor} — ${effect} effect`);

      facet.append("line")
        .attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", facetH)
        .attr("stroke", "rgba(232,236,242,0.18)").attr("stroke-dasharray", "3 4");

      facet.append("g").attr("transform", `translate(0,${facetH})`)
        .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", "#8b9dc3").attr("font-size", 10);
      facet.selectAll(".domain, .tick line").attr("stroke", "#8b9dc3");

      if (ei === 0) {
        activeMethods.forEach(m => {
          svg.append("text")
            .attr("x", margin.left - 12)
            .attr("y", margin.top + y(m) + y.bandwidth() / 2 + 4)
            .attr("text-anchor", "end").attr("fill", "#e8ecf2").attr("font-size", 13)
            .attr("font-weight", 600).text(m);
        });
      }

      subset.forEach(d => {
        const yc = y(d.method) + y.bandwidth() / 2;
        const g = facet.append("g").style("cursor", "default");
        g.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc)
          .attr("stroke", colorMap[d.method] || "#e8ecf2").attr("stroke-width", 2);
        g.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
          .attr("y1", yc - 4).attr("y2", yc + 4)
          .attr("stroke", colorMap[d.method] || "#e8ecf2").attr("stroke-width", 2);
        g.append("line")
          .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
          .attr("y1", yc - 4).attr("y2", yc + 4)
          .attr("stroke", colorMap[d.method] || "#e8ecf2").attr("stroke-width", 2);
        g.append("circle")
          .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
          .attr("fill", colorMap[d.method] || "#e8ecf2")
          .attr("stroke", "#fff").attr("stroke-width", 1);
        g.append("text")
          .attr("x", x(d.estimate))
          .attr("y", yc - 9)
          .attr("text-anchor", "middle")
          .attr("fill", colorMap[d.method] || "#e8ecf2")
          .attr("font-size", 10)
          .text(d.estimate.toFixed(2));
      });
    });
  }

  document.querySelectorAll("#fp-regressor input").forEach(el => {
    el.addEventListener("change", renderForest);
  });
  document.querySelectorAll("#fp-methods input").forEach(el => {
    el.addEventListener("change", renderForest);
  });

})();
