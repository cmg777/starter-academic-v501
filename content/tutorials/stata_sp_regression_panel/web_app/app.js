// app.js — Spatial Panel Regression interactive lab.
// Wires DOM controls to (i) a cross-border spillover lattice animation,
// (ii) a dynamic SDM simulator that trades habit persistence tau against
// spatial dependence rho on panel data, and (iii) a direct/indirect/total
// effects forest plot built from the post's results.json.
//
// Runs after window.DGP, window.LASSO, and window.CHARTS are defined.

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
  // Tab 1: Intro animation (reuse the L1/L2 shrinkage animation).
  // ====================================================================
  CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));

  // ====================================================================
  // Lattice utilities (rook contiguity on a 7x7 grid).
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

  const W_LATTICE = buildRookW(SIDE);

  // Apply (I + rho*W + (rho*W)^2 + ...) v  =  (I - rho*W)^{-1} v approx.
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
  // Tab 2: Cross-border spillover animation.
  // ====================================================================
  const spState = {
    shocks: new Float64Array(N),
    rho: 0.27,
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
  document.getElementById("sp-sdm").addEventListener("click", () => {
    spState.rho = 0.27;
    document.getElementById("sp-rho").value = "0.27";
    document.getElementById("sp-rho-val").textContent = "0.27";
    renderSpGrid();
  });
  document.getElementById("sp-dyn").addEventListener("click", () => {
    spState.rho = 0.08;
    document.getElementById("sp-rho").value = "0.08";
    document.getElementById("sp-rho-val").textContent = "0.08";
    renderSpGrid();
  });

  // Default: drop a shock on the centre cell.
  spState.shocks[Math.floor(N / 2)] = 1;
  renderSpGrid();

  // ====================================================================
  // Tab 3: Dynamic SDM simulator on a 7x7 lattice, T = 30 years.
  //
  // Simulate y_{it} = tau*y_{i,t-1} + (I - rho*W)^{-1} * (X*beta + W*X*theta + eps)
  // (per year, with autoregression on the dependent variable). Then estimate
  // rho_hat from:
  //   (a) a static SDM (ignoring the lagged y), via grid-search profile LL,
  //   (b) a dynamic SDM (including y_{i,t-1} as a regressor).
  // ====================================================================
  const T_YEARS = 30;
  const dyState = {
    tau: 0.65,
    rho: 0.08,
    theta: -0.21,
    sigma: 0.06,
    seed: 4242,
  };

  function olsFit(y, X) {
    // y: Float64Array of length n; X: array of arrays (each row k regressors)
    const n = y.length;
    const k = X[0].length;
    const Xb = X.map(row => [1].concat(row));
    const kb = k + 1;
    const XtX = Array.from({ length: kb }, () => new Float64Array(kb));
    const Xty = new Float64Array(kb);
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < kb; a++) {
        Xty[a] += Xb[i][a] * y[i];
        for (let b = 0; b < kb; b++) XtX[a][b] += Xb[i][a] * Xb[i][b];
      }
    }
    const A = XtX.map((row, idx) => Array.from(row).concat([Xty[idx]]));
    for (let i = 0; i < kb; i++) {
      let pivot = A[i][i];
      if (Math.abs(pivot) < 1e-12) {
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

  // Simulate the panel: prices and incomes constant per state across t,
  // dynamic outcome with tau, rho, theta.
  function simulatePanel(tau, rho, theta, sigma, seed) {
    const rng = DGP.mulberry32(seed);
    const normal = DGP.makeNormal(rng);

    // State-level fixed regressors (one draw per state, held across t).
    const logp = new Float64Array(N);
    const logy = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      logp[i] = 3.65 + 0.28 * normal();
      logy[i] = 1.62 + 0.21 * normal();
    }
    const Wlogp = spatialLag(W_LATTICE, logp);

    const beta_p = -0.30;
    const beta_y = 0.10;
    const intercept = 4.5;

    // Panel: y[t][i].
    const y = [];
    // Initialise t = 0: static SDM realisation.
    const y0 = new Float64Array(N);
    const eps0 = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      y0[i] = intercept + beta_p * logp[i] + beta_y * logy[i] + theta * Wlogp[i] + sigma * normal();
    }
    const yInit = multiplierApply(W_LATTICE, rho, y0, 25);
    y.push(yInit);

    for (let t = 1; t < T_YEARS; t++) {
      const yPrev = y[t - 1];
      const inner = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        inner[i] = intercept * (1 - tau)  // keep level stable
          + tau * yPrev[i]
          + beta_p * logp[i] + beta_y * logy[i]
          + theta * Wlogp[i]
          + sigma * normal();
      }
      const yT = multiplierApply(W_LATTICE, rho, inner, 25);
      y.push(yT);
    }
    return { y: y, logp: logp, logy: logy, Wlogp: Wlogp };
  }

  // Stack a panel into long format (drop t=0 if useLag, optionally include
  // lagged y). Returns { yVec, X, n }.
  function stackPanel(panel, useLag) {
    const { y, logp, logy, Wlogp } = panel;
    const tStart = useLag ? 1 : 0;
    const obs = (T_YEARS - tStart) * N;
    const yVec = new Float64Array(obs);
    const X = new Array(obs);
    let r = 0;
    for (let t = tStart; t < T_YEARS; t++) {
      const yT = y[t];
      const yPrev = useLag ? y[t - 1] : null;
      for (let i = 0; i < N; i++) {
        yVec[r] = yT[i];
        if (useLag) X[r] = [logp[i], logy[i], Wlogp[i], yPrev[i]];
        else X[r] = [logp[i], logy[i], Wlogp[i]];
        r++;
      }
    }
    return { yVec, X, n: obs };
  }

  // Estimate rho via grid-search concentrated likelihood on a stacked panel.
  // Per-period spatial transformation: y* = (I - rho*W) y, then OLS on X.
  function estimateRhoStatic(panel) {
    let bestRho = 0, bestLL = -Infinity;
    for (let rho = -0.20; rho <= 0.80; rho += 0.02) {
      // For each period, apply transformation.
      const obs = T_YEARS * N;
      const yT = new Float64Array(obs);
      const Xstacked = new Array(obs);
      let r = 0;
      for (let t = 0; t < T_YEARS; t++) {
        const wy = spatialLag(W_LATTICE, panel.y[t]);
        for (let i = 0; i < N; i++) {
          yT[r] = panel.y[t][i] - rho * wy[i];
          Xstacked[r] = [panel.logp[i], panel.logy[i], panel.Wlogp[i]];
          r++;
        }
      }
      const beta = olsFit(yT, Xstacked);
      let ssr = 0;
      for (let i = 0; i < obs; i++) {
        let fit = beta[0];
        for (let j = 0; j < Xstacked[i].length; j++) fit += beta[j + 1] * Xstacked[i][j];
        const res = yT[i] - fit;
        ssr += res * res;
      }
      const logJac = obs * Math.log(Math.max(1e-9, 1 - rho * rho)) / 2;
      const ll = logJac - (obs / 2) * Math.log(Math.max(1e-9, ssr / obs));
      if (ll > bestLL) { bestLL = ll; bestRho = rho; }
    }
    return bestRho;
  }

  // Dynamic SDM: same as static but include lagged y in X and drop t=0.
  function estimateRhoDynamic(panel) {
    let bestRho = 0, bestLL = -Infinity, bestTau = 0;
    for (let rho = -0.20; rho <= 0.80; rho += 0.02) {
      const obs = (T_YEARS - 1) * N;
      const yT = new Float64Array(obs);
      const Xstacked = new Array(obs);
      let r = 0;
      for (let t = 1; t < T_YEARS; t++) {
        const wy = spatialLag(W_LATTICE, panel.y[t]);
        for (let i = 0; i < N; i++) {
          yT[r] = panel.y[t][i] - rho * wy[i];
          Xstacked[r] = [panel.logp[i], panel.logy[i], panel.Wlogp[i], panel.y[t - 1][i]];
          r++;
        }
      }
      const beta = olsFit(yT, Xstacked);
      let ssr = 0;
      for (let i = 0; i < obs; i++) {
        let fit = beta[0];
        for (let j = 0; j < Xstacked[i].length; j++) fit += beta[j + 1] * Xstacked[i][j];
        const res = yT[i] - fit;
        ssr += res * res;
      }
      const logJac = obs * Math.log(Math.max(1e-9, 1 - rho * rho)) / 2;
      const ll = logJac - (obs / 2) * Math.log(Math.max(1e-9, ssr / obs));
      if (ll > bestLL) {
        bestLL = ll; bestRho = rho;
        // tau is the last coefficient in beta (lagged y).
        bestTau = beta[beta.length - 1];
      }
    }
    return { rho: bestRho, tau: bestTau };
  }

  function renderDynamicSim() {
    const panel = simulatePanel(dyState.tau, dyState.rho, dyState.theta, dyState.sigma, dyState.seed);
    const rhoStatic = estimateRhoStatic(panel);
    const dyn = estimateRhoDynamic(panel);

    document.getElementById("tr-tau").textContent = dyState.tau.toFixed(2);
    document.getElementById("tr-rho").textContent = dyState.rho.toFixed(2);
    document.getElementById("tr-th").textContent = dyState.theta.toFixed(2);
    document.getElementById("tr-s").textContent = dyState.sigma.toFixed(2);

    document.getElementById("es-rho-static").textContent = rhoStatic.toFixed(3);
    document.getElementById("es-rho-dyn").textContent = dyn.rho.toFixed(3);
    document.getElementById("es-tau").textContent = dyn.tau.toFixed(3);
    document.getElementById("es-gap").textContent = Math.abs(rhoStatic - dyn.rho).toFixed(3);

    renderDynamicChart(rhoStatic, dyn.rho, dyState.rho);
  }

  function renderDynamicChart(rhoStatic, rhoDyn, rhoTrue) {
    const container = document.getElementById("dy-chart");
    container.innerHTML = "";
    const W = 720, H = 300;
    const margin = { top: 44, right: 70, bottom: 64, left: 170 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("text").attr("x", w / 2).attr("y", -28)
      .attr("text-anchor", "middle").attr("fill", "#e8ecf2")
      .attr("font-size", 14).attr("font-weight", 600)
      .text("Estimated ρ̂ across specifications");

    const xMin = Math.min(-0.05, rhoStatic, rhoDyn, rhoTrue) - 0.05;
    const xMax = Math.max(0.6, rhoStatic, rhoDyn, rhoTrue) + 0.10;
    const x = d3.scaleLinear().domain([xMin, xMax]).range([0, w]);
    const y = d3.scaleBand().domain(["Static SDM (ignores τ)", "Dynamic SDM (with τ)"])
      .range([0, h]).padding(0.45);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", "#8b9dc3");
    g.selectAll(".domain, .tick line").attr("stroke", "#8b9dc3");

    // Y-axis labels.
    ["Static SDM (ignores τ)", "Dynamic SDM (with τ)"].forEach(lab => {
      g.append("text")
        .attr("x", -10).attr("y", y(lab) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end").attr("fill", "#e8ecf2").attr("font-size", 12)
        .text(lab);
    });

    // Truth line (vertical). Place the label BELOW the chart (above the
    // x-axis label slot) so it cannot collide with the chart title at the top.
    g.append("line")
      .attr("x1", x(rhoTrue)).attr("x2", x(rhoTrue))
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", "#00d4c8").attr("stroke-width", 2).attr("stroke-dasharray", "4 3");
    // Anchor the truth label so it stays inside the plotting area.
    const trueX = x(rhoTrue);
    const trueAnchor = trueX < 30 ? "start" : (trueX > w - 30 ? "end" : "middle");
    g.append("text")
      .attr("x", trueX)
      .attr("y", -10)
      .attr("text-anchor", trueAnchor)
      .attr("fill", "#00d4c8").attr("font-size", 11).attr("font-weight", 600)
      .text(`true ρ = ${rhoTrue.toFixed(2)}`);

    // Static bar.
    g.append("rect")
      .attr("x", x(Math.min(0, rhoStatic)))
      .attr("y", y("Static SDM (ignores τ)"))
      .attr("width", Math.abs(x(rhoStatic) - x(0)))
      .attr("height", y.bandwidth())
      .attr("fill", "#d97757");
    // Value label: position inside the chart bounds; flip alignment when the
    // bar tip is too close to the right edge so the number is not clipped.
    const sX = x(rhoStatic);
    const sFlip = sX > w - 50;
    g.append("text")
      .attr("x", sX + (sFlip ? -6 : 6))
      .attr("y", y("Static SDM (ignores τ)") + y.bandwidth() / 2 + 4)
      .attr("text-anchor", sFlip ? "end" : "start")
      .attr("fill", "#e8ecf2").attr("font-size", 12).attr("font-weight", 600)
      .text(rhoStatic.toFixed(3));

    // Dynamic bar.
    g.append("rect")
      .attr("x", x(Math.min(0, rhoDyn)))
      .attr("y", y("Dynamic SDM (with τ)"))
      .attr("width", Math.abs(x(rhoDyn) - x(0)))
      .attr("height", y.bandwidth())
      .attr("fill", "#6a9bcc");
    const dX = x(rhoDyn);
    const dFlip = dX > w - 50;
    g.append("text")
      .attr("x", dX + (dFlip ? -6 : 6))
      .attr("y", y("Dynamic SDM (with τ)") + y.bandwidth() / 2 + 4)
      .attr("text-anchor", dFlip ? "end" : "start")
      .attr("fill", "#e8ecf2").attr("font-size", 12).attr("font-weight", 600)
      .text(rhoDyn.toFixed(3));

    g.append("text").attr("x", w / 2).attr("y", h + 44)
      .attr("text-anchor", "middle").attr("fill", "#8b9dc3").attr("font-size", 11)
      .text("ρ̂ (estimated spatial autoregressive parameter)");
  }

  const debouncedRender = debounce(renderDynamicSim, 100);

  document.getElementById("dy-tau").addEventListener("input", e => {
    dyState.tau = +e.target.value;
    document.getElementById("dy-tau-val").textContent = dyState.tau.toFixed(2);
    debouncedRender();
  });
  document.getElementById("dy-rho").addEventListener("input", e => {
    dyState.rho = +e.target.value;
    document.getElementById("dy-rho-val").textContent = dyState.rho.toFixed(2);
    debouncedRender();
  });
  document.getElementById("dy-th").addEventListener("input", e => {
    dyState.theta = +e.target.value;
    document.getElementById("dy-th-val").textContent = dyState.theta.toFixed(2);
    debouncedRender();
  });
  document.getElementById("dy-s").addEventListener("input", e => {
    dyState.sigma = +e.target.value;
    document.getElementById("dy-s-val").textContent = dyState.sigma.toFixed(2);
    debouncedRender();
  });
  document.getElementById("dy-reseed").addEventListener("click", () => {
    dyState.seed = (dyState.seed + 1) % 100000;
    renderDynamicSim();
  });
  document.getElementById("dy-reset").addEventListener("click", () => {
    dyState.tau = 0.65; dyState.rho = 0.08; dyState.theta = -0.21; dyState.sigma = 0.06;
    document.getElementById("dy-tau").value = "0.65";
    document.getElementById("dy-rho").value = "0.08";
    document.getElementById("dy-th").value = "-0.21";
    document.getElementById("dy-s").value = "0.06";
    document.getElementById("dy-tau-val").textContent = "0.65";
    document.getElementById("dy-rho-val").textContent = "0.08";
    document.getElementById("dy-th-val").textContent = "-0.21";
    document.getElementById("dy-s-val").textContent = "0.06";
    renderDynamicSim();
  });

  renderDynamicSim();

  // ====================================================================
  // Tab 4: Direct / Indirect / Total effects forest plot.
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
      const c = document.getElementById("fp-chart");
      if (c) c.innerHTML = `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    });

  function renderForest() {
    const container = document.getElementById("fp-chart");
    container.innerHTML = "";
    const regressor = (document.querySelector('input[name="regressor"]:checked') || {}).value || "logp";
    const activeMethods = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);

    const effects = ["Direct", "Indirect", "Total"];
    const data = resultsData.estimates.filter(d => {
      if (!d.outcome.startsWith(regressor + " ")) return false;
      if (!activeMethods.includes(d.method)) return false;
      return true;
    });

    const W = 880;
    const margin = { top: 44, right: 28, bottom: 44, left: 140 };
    const facetGap = 28;
    const facetW = (W - margin.left - margin.right - (effects.length - 1) * facetGap) / effects.length;
    const facetH = 34 * activeMethods.length + 30;
    const totalH = margin.top + facetH + margin.bottom;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${totalH}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const colorMap = {
      "Pooled OLS":     "#8b9dc3",
      "Region FE":      "#8b9dc3",
      "Time FE":        "#8b9dc3",
      "Two-way FE":     "#6a9bcc",
      "SDM":            "#d97757",
      "SDM (Lee-Yu)":   "#d97757",
      "Dyn SDM (tau)":  "#00d4c8",
      "Dyn SDM (full)": "#00d4c8",
    };

    effects.forEach((effect, ei) => {
      const facet = svg.append("g")
        .attr("transform", `translate(${margin.left + ei * (facetW + facetGap)},${margin.top})`);
      const subset = data.filter(d => d.outcome === regressor + " " + effect);
      const allVals = subset.flatMap(d => [d.ci_lo, d.ci_hi]);
      allVals.push(0);
      const ext = d3.extent(allVals);
      const pad = Math.max(0.05, (ext[1] - ext[0]) * 0.08);
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, facetW]);
      const y = d3.scaleBand().domain(activeMethods).range([0, facetH]).padding(0.35);

      facet.append("text").attr("x", facetW / 2).attr("y", -22)
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
            .attr("text-anchor", "end").attr("fill", "#e8ecf2").attr("font-size", 12)
            .attr("font-weight", 600).text(m);
        });
      }

      subset.forEach(d => {
        const yc = y(d.method) + y.bandwidth() / 2;
        const grp = facet.append("g").style("cursor", "default");
        grp.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc)
          .attr("stroke", colorMap[d.method] || "#e8ecf2").attr("stroke-width", 2);
        grp.append("line")
          .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
          .attr("y1", yc - 4).attr("y2", yc + 4)
          .attr("stroke", colorMap[d.method] || "#e8ecf2").attr("stroke-width", 2);
        grp.append("line")
          .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
          .attr("y1", yc - 4).attr("y2", yc + 4)
          .attr("stroke", colorMap[d.method] || "#e8ecf2").attr("stroke-width", 2);
        grp.append("circle")
          .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
          .attr("fill", colorMap[d.method] || "#e8ecf2")
          .attr("stroke", "#fff").attr("stroke-width", 1);
        // Value label above each dot, clamped inside the facet width so the
        // number cannot overflow into the next facet or off the SVG edge.
        const labelX = Math.max(12, Math.min(facetW - 12, x(d.estimate)));
        grp.append("text")
          .attr("x", labelX)
          .attr("y", yc - 10)
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
