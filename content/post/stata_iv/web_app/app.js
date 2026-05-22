// app.js — IV tutorial Interactive Lab.
// Wires DOM controls in index.html to a custom IV DGP, a scatter pair, OLS/IV
// estimators, and a forest plot loaded from data/results.json. Uses Mulberry32
// from window.DGP for seeded RNG; everything else is built locally to keep the
// vocabulary IV-native (π, β, γ, first-stage F, reduced form).

(function () {
  "use strict";

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

  // ------------------------------------------------------------------
  // Colour palette (mirrors charts.js / styles.css).
  // ------------------------------------------------------------------
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
    confounder: "#1a3a8a",
  };

  // ------------------------------------------------------------------
  // IV DGP (built on top of window.DGP.mulberry32 / makeNormal).
  //   Z ~ N(0, 1)               instrument
  //   U ~ N(0, 1)               unobserved confounder
  //   X = pi * Z + gamma * U + eps_x      (first stage; eps_x ~ N(0, 1))
  //   Y = beta * X + gamma * U + eps_y    (structural; eps_y ~ N(0, 1))
  //
  //   Cov(X, U)  = gamma                  -> OLS is biased
  //   Cov(Z, U)  = 0                      -> IV is consistent
  //   First-stage slope of X on Z = pi    (when Z and X are demeaned)
  //   Reduced-form slope of Y on Z = beta * pi
  //   2SLS = reduced / first = beta       (the truth, asymptotically)
  // ------------------------------------------------------------------
  function simulate_iv(opts) {
    const n = Math.max(20, opts.n | 0);
    const pi = +opts.pi;
    const beta = +opts.beta;
    const gamma = +opts.gamma;
    const seed = (opts.seed >>> 0) || 1;
    const rng = window.DGP.mulberry32(seed);
    const normal = window.DGP.makeNormal(rng);

    const Z = new Float64Array(n);
    const U = new Float64Array(n);
    const X = new Float64Array(n);
    const Y = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      Z[i] = normal();
      U[i] = normal();
      X[i] = pi * Z[i] + gamma * U[i] + normal();
      Y[i] = beta * X[i] + gamma * U[i] + normal();
    }
    return { n, Z, U, X, Y, pi, beta, gamma };
  }

  // Simple regression y = a + b*x; returns slope, intercept, t-statistic of slope.
  function ols(x, y, n) {
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { sx += x[i]; sy += y[i]; }
    const mx = sx / n, my = sy / n;
    let sxx = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - mx;
      sxx += dx * dx;
      sxy += dx * (y[i] - my);
    }
    const slope = sxx > 1e-12 ? sxy / sxx : 0;
    const intercept = my - slope * mx;
    // Residual variance, slope SE, F-stat.
    let rss = 0;
    for (let i = 0; i < n; i++) {
      const yhat = intercept + slope * x[i];
      const r = y[i] - yhat;
      rss += r * r;
    }
    const df = Math.max(1, n - 2);
    const sig2 = rss / df;
    const seSlope = sxx > 1e-12 ? Math.sqrt(sig2 / sxx) : Infinity;
    const tSlope = seSlope > 0 ? slope / seSlope : 0;
    // First-stage F is t^2 for one regressor.
    const F = tSlope * tSlope;
    return { slope, intercept, seSlope, tSlope, F, rss, sig2 };
  }

  // ------------------------------------------------------------------
  // TAB 1 — IV DAG static SVG.
  // ------------------------------------------------------------------
  function draw_iv_dag(container) {
    const W = 720, H = 340;
    container.innerHTML = "";
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Arrow marker definitions.
    const defs = svg.append("defs");
    function arrow(id, color) {
      defs.append("marker")
        .attr("id", id).attr("viewBox", "0 -5 10 10")
        .attr("refX", 9).attr("refY", 0).attr("markerWidth", 8).attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", color);
    }
    arrow("arr-steel", C.steel);
    arrow("arr-orange", C.orange);
    arrow("arr-teal", C.teal);
    arrow("arr-confound", C.confounder);
    arrow("arr-red", "#d9576e");

    // Node positions.
    const ZX = 110, XX = 360, YX = 610, UX = 360;
    const TY = 200, UY = 70;

    function node(cx, cy, w, h, fill, label, sub) {
      const g = svg.append("g");
      g.append("rect")
        .attr("x", cx - w / 2).attr("y", cy - h / 2)
        .attr("width", w).attr("height", h)
        .attr("rx", 10).attr("fill", fill).attr("stroke", "#141413").attr("stroke-width", 1.5);
      g.append("text").attr("x", cx).attr("y", cy - 4)
        .attr("text-anchor", "middle").attr("fill", "#fff")
        .attr("font-size", 17).attr("font-weight", 700).text(label);
      g.append("text").attr("x", cx).attr("y", cy + 16)
        .attr("text-anchor", "middle").attr("fill", "#fff")
        .attr("font-size", 11).attr("opacity", 0.85).text(sub);
    }
    node(ZX, TY, 170, 64, C.steel,  "Z = logem4",        "settler mortality");
    node(XX, TY, 170, 64, C.orange, "X = avexpr",        "modern institutions");
    node(YX, TY, 170, 64, C.teal,   "Y = logpgp95",      "log GDP per capita");
    node(UX, UY, 250, 56, C.confounder, "U = unobserved confounders", "(geography? culture? human capital?)");

    function path(x1, y1, x2, y2, color, marker, dash, label, lx, ly) {
      svg.append("line")
        .attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)
        .attr("stroke", color).attr("stroke-width", 2.5)
        .attr("marker-end", `url(#${marker})`)
        .attr("stroke-dasharray", dash || null);
      svg.append("text")
        .attr("x", lx).attr("y", ly)
        .attr("fill", color).attr("font-size", 11.5)
        .attr("text-anchor", "middle").text(label);
    }

    // Z -> X  (first stage)
    path(ZX + 85, TY, XX - 85, TY, C.steel, "arr-steel", null,
         "first stage  π̂ = −0.607  (F = 16.32)", (ZX + XX) / 2, TY - 14);
    // X -> Y  (causal effect, what we want)
    path(XX + 85, TY, YX - 85, TY, C.orange, "arr-orange", null,
         "causal effect  β̂_IV = 0.944  ← what we want", (XX + YX) / 2, TY - 14);
    // U -> X  (confounder)
    path(UX - 40, UY + 28, XX - 28, TY - 32, C.confounder, "arr-confound", "5 4",
         "biases OLS", (UX + XX) / 2 - 50, (UY + TY) / 2 - 8);
    // U -> Y
    path(UX + 40, UY + 28, YX - 28, TY - 32, C.confounder, "arr-confound", "5 4",
         "biases OLS", (UX + YX) / 2 + 50, (UY + TY) / 2 - 8);
    // Z -.-> Y  (forbidden; exclusion restriction)
    svg.append("path")
      .attr("d", `M ${ZX} ${TY + 32} Q ${(ZX + YX) / 2} ${H - 30} ${YX} ${TY + 32}`)
      .attr("fill", "none").attr("stroke", "#d9576e").attr("stroke-width", 2)
      .attr("stroke-dasharray", "6 5").attr("marker-end", "url(#arr-red)");
    svg.append("text")
      .attr("x", (ZX + YX) / 2).attr("y", H - 14)
      .attr("text-anchor", "middle").attr("fill", "#d9576e").attr("font-size", 12)
      .attr("font-style", "italic")
      .text("exclusion restriction: NO direct arrow (this is the assumption you cannot test)");
  }

  draw_iv_dag(document.getElementById("intro-dag"));

  // ------------------------------------------------------------------
  // Generic scatter-with-fitline chart builder used in Tab 2.
  // ------------------------------------------------------------------
  function scatter_with_fit(container, opts) {
    const W = 460, H = 280;
    const margin = { top: 22, right: 18, bottom: 44, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    container.innerHTML = "";
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const title = svg.append("text").attr("x", W / 2).attr("y", 14)
      .attr("text-anchor", "middle").attr("fill", C.text)
      .attr("font-size", 13).attr("font-weight", 600).text(opts.title || "");

    g.append("text").attr("transform", `translate(${w / 2},${h + 34})`)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
      .text(opts.xlab || "x");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-36})`)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
      .text(opts.ylab || "y");

    function update(data) {
      g.selectAll(".pt, .fit, .axis, .gridline").remove();
      if (!data.x || data.x.length === 0) return;
      const xs = data.x, ys = data.y, n = xs.length;
      const xExt = d3.extent(xs), yExt = d3.extent(ys);
      const xPad = Math.max(0.1, (xExt[1] - xExt[0]) * 0.06);
      const yPad = Math.max(0.1, (yExt[1] - yExt[0]) * 0.08);
      const x = d3.scaleLinear().domain([xExt[0] - xPad, xExt[1] + xPad]).range([0, w]);
      const y = d3.scaleLinear().domain([yExt[0] - yPad, yExt[1] + yPad]).range([h, 0]);

      // Grid.
      g.append("g").attr("class", "gridline")
        .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(""))
        .selectAll("line").attr("stroke", C.grid);
      g.selectAll(".gridline path").attr("stroke", "none");

      // Axes.
      g.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".axis path, .axis line").attr("stroke", C.muted);

      // Points.
      g.selectAll(".pt").data(d3.range(n)).enter().append("circle")
        .attr("class", "pt")
        .attr("cx", i => x(xs[i])).attr("cy", i => y(ys[i]))
        .attr("r", 3).attr("fill", C.steel).attr("opacity", 0.75);

      // Fit line.
      const fit = ols(xs, ys, n);
      const xMin = x.domain()[0], xMax = x.domain()[1];
      g.append("line").attr("class", "fit")
        .attr("x1", x(xMin)).attr("y1", y(fit.intercept + fit.slope * xMin))
        .attr("x2", x(xMax)).attr("y2", y(fit.intercept + fit.slope * xMax))
        .attr("stroke", C.orange).attr("stroke-width", 2.5);

      // Slope label.
      g.append("text").attr("class", "fit")
        .attr("x", w - 6).attr("y", 14)
        .attr("text-anchor", "end")
        .attr("fill", C.orange).attr("font-size", 12)
        .text(`slope = ${fit.slope.toFixed(3)} (F = ${fit.F.toFixed(2)})`);

      title.text(opts.title || "");
      return fit;
    }
    return { update, setTitle: t => title.text(t) };
  }

  // ------------------------------------------------------------------
  // TAB 2 — First-Stage Lab.
  // ------------------------------------------------------------------
  const fs = {
    n: 64, pi: -0.60, beta: 0.94, gamma: 0.50, seed: 42,
    firstChart: scatter_with_fit(document.getElementById("fs-firststage"), {
      title: "First stage: X on Z", xlab: "Z (instrument)", ylab: "X (endogenous regressor)",
    }),
    rfChart: scatter_with_fit(document.getElementById("fs-reducedform"), {
      title: "Reduced form: Y on Z", xlab: "Z (instrument)", ylab: "Y (outcome)",
    }),
  };

  function fs_refit() {
    const sim = simulate_iv({ n: fs.n, pi: fs.pi, beta: fs.beta, gamma: fs.gamma, seed: fs.seed });
    fs.sim = sim;

    // Re-wrap typed-array slices for ols().
    const Zarr = Array.from(sim.Z);
    const Xarr = Array.from(sim.X);
    const Yarr = Array.from(sim.Y);
    const fsFit = fs.firstChart.update({ x: Zarr, y: Xarr });
    const rfFit = fs.rfChart.update({ x: Zarr, y: Yarr });
    const olsFit = ols(Xarr, Yarr, sim.n);

    const piHat = fsFit.slope;
    const rfSlope = rfFit.slope;
    const ivBeta = Math.abs(piHat) > 0.02 ? rfSlope / piHat : NaN;

    document.getElementById("fs-stat-pi").textContent  = piHat.toFixed(3);
    document.getElementById("fs-stat-f").textContent   = fsFit.F.toFixed(2);
    document.getElementById("fs-stat-rf").textContent  = rfSlope.toFixed(3);
    document.getElementById("fs-stat-iv").textContent  = Number.isFinite(ivBeta) ? ivBeta.toFixed(3) : "—";
    document.getElementById("fs-stat-ols").textContent = olsFit.slope.toFixed(3);

    // Colour the F-stat by strength.
    const fEl = document.getElementById("fs-stat-f");
    if (fsFit.F < 10) fEl.style.color = "#d9576e";
    else if (fsFit.F < 16.38) fEl.style.color = C.orange;
    else fEl.style.color = C.teal;
  }
  const fs_refit_d = debounce(fs_refit, 80);

  function fs_bind(id, key, valId, fmt) {
    document.getElementById(id).addEventListener("input", e => {
      fs[key] = +e.target.value;
      document.getElementById(valId).textContent = fmt(fs[key]);
      fs_refit_d();
    });
  }
  fs_bind("fs-n",     "n",     "fs-n-val",     v => v.toFixed(0));
  fs_bind("fs-pi",    "pi",    "fs-pi-val",    v => v.toFixed(2));
  fs_bind("fs-beta",  "beta",  "fs-beta-val",  v => v.toFixed(2));
  fs_bind("fs-gamma", "gamma", "fs-gamma-val", v => v.toFixed(2));

  document.getElementById("fs-reseed").addEventListener("click", () => {
    fs.seed = Math.floor(Math.random() * 1e9) + 1;
    fs_refit();
  });
  document.getElementById("fs-reset").addEventListener("click", () => {
    fs.n = 64; fs.pi = -0.60; fs.beta = 0.94; fs.gamma = 0.50; fs.seed = 42;
    document.getElementById("fs-n").value = fs.n;
    document.getElementById("fs-pi").value = fs.pi;
    document.getElementById("fs-beta").value = fs.beta;
    document.getElementById("fs-gamma").value = fs.gamma;
    document.getElementById("fs-n-val").textContent = fs.n.toFixed(0);
    document.getElementById("fs-pi-val").textContent = fs.pi.toFixed(2);
    document.getElementById("fs-beta-val").textContent = fs.beta.toFixed(2);
    document.getElementById("fs-gamma-val").textContent = fs.gamma.toFixed(2);
    fs_refit();
  });
  fs_refit();

  // ------------------------------------------------------------------
  // TAB 3 — OLS vs IV Showdown.
  // ------------------------------------------------------------------
  const sh = {
    n: 64, pi: -0.60, beta: 0.94, gamma: 0.50, seed: 7,
  };

  function sh_bind(id, key, valId, fmt) {
    document.getElementById(id).addEventListener("input", e => {
      sh[key] = +e.target.value;
      document.getElementById(valId).textContent = fmt(sh[key]);
    });
  }
  sh_bind("sh-n",     "n",     "sh-n-val",     v => v.toFixed(0));
  sh_bind("sh-pi",    "pi",    "sh-pi-val",    v => v.toFixed(2));
  sh_bind("sh-beta",  "beta",  "sh-beta-val",  v => v.toFixed(2));
  sh_bind("sh-gamma", "gamma", "sh-gamma-val", v => v.toFixed(2));

  // Histogram chart builder for OLS vs IV distributions.
  function dual_histogram(container) {
    const W = 720, H = 320;
    const margin = { top: 30, right: 24, bottom: 50, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    container.innerHTML = "";
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Static legend.
    const lg = svg.append("g").attr("transform", `translate(${W - 220},${4})`);
    lg.append("rect").attr("width", 200).attr("height", 22).attr("fill", "rgba(15,23,41,0.6)")
      .attr("stroke", C.line).attr("rx", 4);
    lg.append("circle").attr("cx", 12).attr("cy", 11).attr("r", 5).attr("fill", C.orange).attr("opacity", 0.8);
    lg.append("text").attr("x", 22).attr("y", 14).attr("fill", C.text).attr("font-size", 11).text("OLS");
    lg.append("circle").attr("cx", 60).attr("cy", 11).attr("r", 5).attr("fill", C.teal).attr("opacity", 0.9);
    lg.append("text").attr("x", 70).attr("y", 14).attr("fill", C.text).attr("font-size", 11).text("IV (2SLS)");
    lg.append("line").attr("x1", 130).attr("x2", 145).attr("y1", 11).attr("y2", 11)
      .attr("stroke", C.steel).attr("stroke-width", 2);
    lg.append("text").attr("x", 150).attr("y", 14).attr("fill", C.text).attr("font-size", 11).text("true β");

    function update(data) {
      g.selectAll("*").remove();
      const all = data.olsArr.concat(data.ivArr);
      if (all.length === 0) return;
      const trueB = data.beta_true;
      const ext = d3.extent(all.concat([trueB]));
      const span = Math.max(0.4, ext[1] - ext[0]);
      const pad = span * 0.08;
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([0, w]);
      const nBins = 22;
      const bin = d3.bin().domain(x.domain()).thresholds(nBins);
      const binsO = bin(data.olsArr);
      const binsI = bin(data.ivArr);
      const maxC = d3.max(binsO.concat(binsI), d => d.length) || 1;
      const y = d3.scaleLinear().domain([0, maxC]).range([h, 0]);

      function drawBars(bins, color, opacity) {
        g.selectAll(null).data(bins).enter().append("rect")
          .attr("x", d => x(d.x0))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", color).attr("opacity", opacity);
      }
      drawBars(binsO, C.orange, 0.62);
      drawBars(binsI, C.teal,   0.80);

      // True β line.
      g.append("line").attr("x1", x(trueB)).attr("x2", x(trueB))
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", C.steel).attr("stroke-width", 2);
      g.append("text").attr("x", x(trueB) + 4).attr("y", 10)
        .attr("fill", C.steel).attr("font-size", 11)
        .text(`true β = ${trueB.toFixed(2)}`);

      // Axes.
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.append("g").call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);
      g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Estimated β̂ across 100 simulated datasets");
    }
    return { update };
  }
  const shHist = dual_histogram(document.getElementById("sh-hist"));

  document.getElementById("sh-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sh-progress > div");
    const progLabel = document.getElementById("sh-progress-label");
    const histEl = document.getElementById("sh-hist");

    const N_SIMS = 100;
    const olsArr = [];
    const ivArr = [];
    const fArr = [];

    let i = 0;
    function step() {
      const batch = 4;
      const t0 = performance.now();
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const sim = simulate_iv({
          n: sh.n, pi: sh.pi, beta: sh.beta, gamma: sh.gamma, seed: sh.seed + i + 1,
        });
        const Zarr = Array.from(sim.Z);
        const Xarr = Array.from(sim.X);
        const Yarr = Array.from(sim.Y);
        const fsFit = ols(Zarr, Xarr, sim.n);
        const rfFit = ols(Zarr, Yarr, sim.n);
        const olsFit = ols(Xarr, Yarr, sim.n);
        if (Math.abs(fsFit.slope) > 0.02) {
          ivArr.push(rfFit.slope / fsFit.slope);
        }
        olsArr.push(olsFit.slope);
        fArr.push(fsFit.F);
      }
      const pct = (i / N_SIMS) * 100;
      progBar.style.width = pct + "%";
      progLabel.textContent = `simulation ${i} / ${N_SIMS} (${(performance.now() - t0).toFixed(0)} ms / batch)`;
      if (i < N_SIMS) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = `done (${N_SIMS} simulations)`;
        histEl.style.display = "block";
        shHist.update({ olsArr, ivArr, beta_true: sh.beta });

        function mean(a) { return a.reduce((s, x) => s + x, 0) / Math.max(1, a.length); }
        function sd(a) {
          if (a.length < 2) return 0;
          const m = mean(a);
          let s = 0; for (const x of a) s += (x - m) * (x - m);
          return Math.sqrt(s / (a.length - 1));
        }
        function rmse(a, target) {
          if (a.length === 0) return 0;
          let s = 0; for (const x of a) s += (x - target) * (x - target);
          return Math.sqrt(s / a.length);
        }
        const olsMean = mean(olsArr), ivMean = mean(ivArr);
        const olsSD   = sd(olsArr),   ivSD   = sd(ivArr);
        const olsRMSE = rmse(olsArr, sh.beta), ivRMSE = rmse(ivArr, sh.beta);
        const meanF   = mean(fArr);

        document.getElementById("sh-ols-mean").textContent = olsMean.toFixed(3);
        document.getElementById("sh-ols-bias").textContent = (olsMean - sh.beta).toFixed(3);
        document.getElementById("sh-ols-sd").textContent   = olsSD.toFixed(3);
        document.getElementById("sh-ols-rmse").textContent = olsRMSE.toFixed(3);

        document.getElementById("sh-iv-mean").textContent = ivMean.toFixed(3);
        document.getElementById("sh-iv-bias").textContent = (ivMean - sh.beta).toFixed(3);
        document.getElementById("sh-iv-sd").textContent   = ivSD.toFixed(3);
        document.getElementById("sh-iv-rmse").textContent = ivRMSE.toFixed(3);
        document.getElementById("sh-iv-meanf").textContent = meanF.toFixed(2);
        btn.disabled = false;
      }
    }
    step();
  });

  // ------------------------------------------------------------------
  // TAB 4 — Forest plot from data/results.json.
  // ------------------------------------------------------------------
  function forest_iv(container) {
    const W = 760, H = 460;
    const margin = { top: 30, right: 200, bottom: 50, left: 220 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    container.innerHTML = "";
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    function update(rows) {
      g.selectAll("*").remove();
      svg.selectAll(".lbl-axis-y").remove();
      if (!rows || rows.length === 0) return;

      const xExt = d3.extent(rows.flatMap(r => [r.ci_lo, r.ci_hi]));
      const xPad = Math.max(0.1, (xExt[1] - xExt[0]) * 0.08);
      const x = d3.scaleLinear().domain([xExt[0] - xPad, xExt[1] + xPad]).range([0, w]);
      const y = d3.scaleBand().domain(rows.map(r => r.method)).range([0, h]).padding(0.35);

      // Zero line.
      g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.muted).attr("stroke-dasharray", "3 3").attr("stroke-width", 1);

      // OLS reference line at 0.522.
      g.append("line").attr("x1", x(0.522)).attr("x2", x(0.522)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.orange).attr("stroke-dasharray", "5 4").attr("stroke-width", 1.5)
        .attr("opacity", 0.55);
      g.append("text").attr("x", x(0.522)).attr("y", -8)
        .attr("text-anchor", "middle").attr("fill", C.orange).attr("font-size", 10)
        .text("OLS baseline 0.52");

      // IV main reference line.
      g.append("line").attr("x1", x(0.944)).attr("x2", x(0.944)).attr("y1", 0).attr("y2", h)
        .attr("stroke", C.teal).attr("stroke-dasharray", "5 4").attr("stroke-width", 1.5)
        .attr("opacity", 0.55);
      g.append("text").attr("x", x(0.944)).attr("y", -8)
        .attr("text-anchor", "middle").attr("fill", C.teal).attr("font-size", 10)
        .text("IV main 0.94");

      // Rows.
      const rg = g.selectAll(".row").data(rows).enter().append("g")
        .attr("transform", r => `translate(0,${y(r.method) + y.bandwidth() / 2})`);

      function colorOf(r) {
        if (r.method === "OLS") return C.orange;
        if (r.method.startsWith("IV: euro1900")) return C.teal;
        return C.steel;
      }

      rg.append("line")
        .attr("x1", r => x(r.ci_lo)).attr("x2", r => x(r.ci_hi))
        .attr("y1", 0).attr("y2", 0)
        .attr("stroke", r => colorOf(r)).attr("stroke-width", 2);
      rg.append("line")
        .attr("x1", r => x(r.ci_lo)).attr("x2", r => x(r.ci_lo))
        .attr("y1", -5).attr("y2", 5)
        .attr("stroke", r => colorOf(r)).attr("stroke-width", 2);
      rg.append("line")
        .attr("x1", r => x(r.ci_hi)).attr("x2", r => x(r.ci_hi))
        .attr("y1", -5).attr("y2", 5)
        .attr("stroke", r => colorOf(r)).attr("stroke-width", 2);
      rg.append("circle")
        .attr("cx", r => x(r.estimate)).attr("cy", 0).attr("r", 5)
        .attr("fill", r => colorOf(r))
        .style("cursor", "pointer")
        .on("mouseover", (event, r) => {
          tooltip.classed("show", true).html(
            `<div><strong>${r.method}</strong></div>` +
            `<div><span class="tooltip-key">family:</span> <span class="tooltip-val">${r.outcome}</span></div>` +
            `<div><span class="tooltip-key">β̂:</span> <span class="tooltip-val">${r.estimate.toFixed(3)}</span></div>` +
            `<div><span class="tooltip-key">SE:</span> <span class="tooltip-val">${r.se.toFixed(3)}</span></div>` +
            `<div><span class="tooltip-key">95% CI:</span> <span class="tooltip-val">[${r.ci_lo.toFixed(2)}, ${r.ci_hi.toFixed(2)}]</span></div>` +
            (r.firstF != null
              ? `<div><span class="tooltip-key">First-stage F:</span> <span class="tooltip-val">${r.firstF.toFixed(2)}</span></div>`
              : "")
          );
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.pageX + 12) + "px")
                 .style("top",  (event.pageY - 18) + "px");
        })
        .on("mouseout", () => tooltip.classed("show", false));

      // Estimate label at right.
      rg.append("text")
        .attr("x", w + 8).attr("y", 4)
        .attr("fill", C.text).attr("font-size", 11)
        .text(r => `${r.estimate.toFixed(2)} ` +
                   `(${r.firstF != null ? "F=" + r.firstF.toFixed(1) : "—"})`);

      // Method labels left.
      const yAxis = svg.append("g").attr("class", "lbl-axis-y")
        .attr("transform", `translate(${margin.left - 6},${margin.top})`)
        .call(d3.axisLeft(y).tickSize(0));
      yAxis.selectAll("text").attr("fill", C.text).attr("font-size", 12);
      yAxis.selectAll("path, line").attr("stroke", "none");

      // x-axis.
      g.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(7))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
        .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
        .text("Coefficient on avexpr (log GDP per capita per institution-point)");
    }
    return { update };
  }
  const fp = {
    chart: forest_iv(document.getElementById("fp-chart")),
    data: null,
  };
  function fp_refresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    const rows = fp.data.estimates.filter(r =>
      outcomes.includes(r.outcome) && methods.includes(r.method)
    );
    fp.chart.update(rows);
  }
  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });
  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[stata_iv web_app] uncaught error:", e.error);
  });
})();
