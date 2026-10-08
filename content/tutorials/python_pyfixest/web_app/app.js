// app.js — wires the DOM controls for python_pyfixest to dgp/lasso/charts.
// Topic: high-dimensional fixed effects (one-way / two-way / three-way),
// the within transformation, clustered standard errors, and the Mincer wage panel.
// Runs after window.DGP, window.LASSO, window.CHARTS are defined.

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

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ------------------------------------------------------------------
  // True coefficient (a 10% wage effect, in the spirit of the Mincer
  // panel's union premium under one-way FE — 0.078).
  // ------------------------------------------------------------------
  const TRUE_BETA = 0.10;

  // ------------------------------------------------------------------
  // Numeric helpers — hand-rolled OLS via normal equations + Gauss-
  // Jordan inversion to keep the app dependency-free apart from D3.
  // ------------------------------------------------------------------
  function inv(M, k) {
    const A = new Float64Array(k * 2 * k);
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) A[i * 2 * k + j] = M[i * k + j];
      A[i * 2 * k + k + i] = 1;
    }
    for (let i = 0; i < k; i++) {
      let piv = i;
      let best = Math.abs(A[i * 2 * k + i]);
      for (let r = i + 1; r < k; r++) {
        const v = Math.abs(A[r * 2 * k + i]);
        if (v > best) { best = v; piv = r; }
      }
      if (best < 1e-12) return null;
      if (piv !== i) {
        for (let c = 0; c < 2 * k; c++) {
          const tmp = A[i * 2 * k + c];
          A[i * 2 * k + c] = A[piv * 2 * k + c];
          A[piv * 2 * k + c] = tmp;
        }
      }
      const pv = A[i * 2 * k + i];
      for (let c = 0; c < 2 * k; c++) A[i * 2 * k + c] /= pv;
      for (let r = 0; r < k; r++) {
        if (r === i) continue;
        const factor = A[r * 2 * k + i];
        if (factor === 0) continue;
        for (let c = 0; c < 2 * k; c++) {
          A[r * 2 * k + c] -= factor * A[i * 2 * k + c];
        }
      }
    }
    const out = new Float64Array(k * k);
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) out[i * k + j] = A[i * 2 * k + k + j];
    }
    return out;
  }

  function ols(X, y, n, k) {
    const XtX = new Float64Array(k * k);
    const Xty = new Float64Array(k);
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < k; a++) {
        const xa = X[i * k + a];
        Xty[a] += xa * y[i];
        for (let b = 0; b < k; b++) {
          XtX[a * k + b] += xa * X[i * k + b];
        }
      }
    }
    const inverse = inv(XtX, k);
    if (!inverse) return null;
    const beta = new Float64Array(k);
    for (let a = 0; a < k; a++) {
      let s = 0;
      for (let b = 0; b < k; b++) s += inverse[a * k + b] * Xty[b];
      beta[a] = s;
    }
    let yMean = 0;
    for (let i = 0; i < n; i++) yMean += y[i];
    yMean /= n;
    let sst = 0, sse = 0;
    for (let i = 0; i < n; i++) {
      let yhat = 0;
      for (let a = 0; a < k; a++) yhat += X[i * k + a] * beta[a];
      sst += (y[i] - yMean) * (y[i] - yMean);
      sse += (y[i] - yhat) * (y[i] - yhat);
    }
    const r2 = sst > 0 ? 1 - sse / sst : 0;
    return { beta, r2 };
  }

  // ------------------------------------------------------------------
  // Panel data simulator.
  //   N workers, T periods. Each worker has an intercept alpha_i ~ N(0, h^2).
  //   Treatment x_it is correlated with alpha_i via rho:
  //     x_it = rho * (alpha_i / h) + sqrt(1 - rho^2) * z_it, z_it ~ N(0, 1)
  //   y_it = alpha_i + TRUE_BETA * x_it + 0.20 * eps_it
  // ------------------------------------------------------------------
  function simulatePanel(opts) {
    const N = opts.N, T = opts.T, h = opts.h, rho = opts.rho;
    const seed = opts.seed >>> 0;
    const rng = DGP.mulberry32(seed || 1);
    const normal = DGP.makeNormal(rng);
    const nObs = N * T;
    const xv = new Float64Array(nObs);
    const yv = new Float64Array(nObs);
    const wid = new Int32Array(nObs);
    const tid = new Int32Array(nObs);
    const alpha = new Float64Array(N);
    for (let i = 0; i < N; i++) alpha[i] = h * normal();

    const rhoSafe = Math.max(-0.99, Math.min(0.99, rho));
    const sqrt1mr2 = Math.sqrt(1 - rhoSafe * rhoSafe);
    let k = 0;
    for (let i = 0; i < N; i++) {
      const aStd = h > 1e-6 ? alpha[i] / h : 0;
      for (let t = 0; t < T; t++) {
        const z = normal();
        const x = rhoSafe * aStd + sqrt1mr2 * z;
        xv[k] = x;
        yv[k] = alpha[i] + TRUE_BETA * x + 0.20 * normal();
        wid[k] = i; tid[k] = t;
        k++;
      }
    }
    return { xv, yv, wid, tid, N, T, nObs };
  }

  // Pooled OLS: y = a + beta * x
  function fitPooledOLS(sim) {
    const n = sim.nObs;
    const k = 2;
    const X = new Float64Array(n * k);
    for (let i = 0; i < n; i++) {
      X[i * k + 0] = 1;
      X[i * k + 1] = sim.xv[i];
    }
    const r = ols(X, sim.yv, n, k);
    return r ? { intercept: r.beta[0], slope: r.beta[1], r2: r.r2 } : null;
  }

  // Fixed effects: demean both x and y by worker, then OLS slope (no intercept).
  function fitFE(sim) {
    const N = sim.N, n = sim.nObs;
    const xMean = new Float64Array(N);
    const yMean = new Float64Array(N);
    const cnt = new Int32Array(N);
    for (let i = 0; i < n; i++) {
      xMean[sim.wid[i]] += sim.xv[i];
      yMean[sim.wid[i]] += sim.yv[i];
      cnt[sim.wid[i]]++;
    }
    for (let i = 0; i < N; i++) {
      if (cnt[i] > 0) { xMean[i] /= cnt[i]; yMean[i] /= cnt[i]; }
    }
    const xd = new Float64Array(n), yd = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      xd[i] = sim.xv[i] - xMean[sim.wid[i]];
      yd[i] = sim.yv[i] - yMean[sim.wid[i]];
    }
    let xx = 0, xy = 0;
    for (let i = 0; i < n; i++) { xx += xd[i] * xd[i]; xy += xd[i] * yd[i]; }
    if (xx < 1e-12) return null;
    const slope = xy / xx;
    let yMeanAll = 0;
    for (let i = 0; i < n; i++) yMeanAll += yd[i];
    yMeanAll /= n;
    let sst = 0, sse = 0;
    for (let i = 0; i < n; i++) {
      const yhat = slope * xd[i];
      sst += (yd[i] - yMeanAll) * (yd[i] - yMeanAll);
      sse += (yd[i] - yhat) * (yd[i] - yhat);
    }
    const r2 = sst > 0 ? 1 - sse / sst : 0;
    let xAll = 0, yAll = 0;
    for (let i = 0; i < n; i++) { xAll += sim.xv[i]; yAll += sim.yv[i]; }
    xAll /= n; yAll /= n;
    const intercept = yAll - slope * xAll;
    return { intercept, slope, r2 };
  }

  // ------------------------------------------------------------------
  // TAB 1 — Within transformation animation + variation bars.
  // ------------------------------------------------------------------
  CHARTS.within_animation(document.getElementById("intro-anim"));

  // Variation_decomposition + forest data come from results.json.
  let fpData = null;
  const fpChart = CHARTS.forest_plot(document.getElementById("fp-chart"));

  function fp_refresh() {
    if (!fpData) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fpChart.update(fpData.estimates, methods, outcomes);
  }
  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  fetch("data/results.json").then(r => r.json()).then(data => {
    if (Array.isArray(data.variation)) {
      CHARTS.variation_bars(document.getElementById("intro-var")).update(data.variation);
    }
    fpData = data;
    fp_refresh();
    if (Array.isArray(data.se_table)) renderSEAtable(data.se_table);
  }).catch(err => {
    document.getElementById("intro-var").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // TAB 2 — Panel FE Simulator.
  // ------------------------------------------------------------------
  const sim2 = {
    N: 200, T: 4, h: 1.00, rho: 0.70, seed: 7,
    scatter: CHARTS.panel_scatter(document.getElementById("sim-scatter")),
    hist: CHARTS.beta_histograms(document.getElementById("sim-hist")),
  };

  function fmt3(x) { return (x === null || !Number.isFinite(x)) ? "—" : x.toFixed(3); }

  function sim2_refit() {
    const data = simulatePanel({
      N: sim2.N, T: sim2.T, h: sim2.h, rho: sim2.rho, seed: sim2.seed,
    });
    sim2.data = data;
    sim2.olsFit = fitPooledOLS(data);
    sim2.feFit = fitFE(data);
    sim2_render();
  }

  function sim2_render() {
    if (!sim2.olsFit || !sim2.feFit) {
      ["sim-ols-b","sim-ols-bias","sim-ols-r2",
       "sim-fe-b","sim-fe-bias","sim-fe-r2"].forEach(id => {
        document.getElementById(id).textContent = "—";
      });
      return;
    }
    document.getElementById("sim-ols-b").textContent = fmt3(sim2.olsFit.slope);
    document.getElementById("sim-ols-bias").textContent =
      ((sim2.olsFit.slope - TRUE_BETA) >= 0 ? "+" : "") + (sim2.olsFit.slope - TRUE_BETA).toFixed(3);
    document.getElementById("sim-ols-r2").textContent = fmt3(sim2.olsFit.r2);
    document.getElementById("sim-fe-b").textContent = fmt3(sim2.feFit.slope);
    document.getElementById("sim-fe-bias").textContent =
      ((sim2.feFit.slope - TRUE_BETA) >= 0 ? "+" : "") + (sim2.feFit.slope - TRUE_BETA).toFixed(3);
    document.getElementById("sim-fe-r2").textContent = fmt3(sim2.feFit.r2);

    const pts = [];
    for (let i = 0; i < sim2.data.nObs; i++) {
      pts.push([sim2.data.xv[i], sim2.data.yv[i], sim2.data.wid[i], sim2.data.tid[i]]);
    }
    const xArr = Array.from(sim2.data.xv);
    const yArr = Array.from(sim2.data.yv);
    const xRange = [d3.min(xArr) - 0.3, d3.max(xArr) + 0.3];
    const yRange = [d3.min(yArr) - 0.3, d3.max(yArr) + 0.3];
    sim2.scatter.update({
      points: pts,
      truth_intercept: 0,
      truth_slope: TRUE_BETA,
      pols_intercept: sim2.olsFit.intercept,
      pols_slope: sim2.olsFit.slope,
      fe_intercept: sim2.feFit.intercept,
      fe_slope: sim2.feFit.slope,
      xRange, yRange,
      nWorkers: sim2.data.N,
    });
  }

  const onSimChange = debounce(sim2_refit, 100);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim2.N = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim2.N;
    onSimChange();
  });
  document.getElementById("sim-t").addEventListener("input", e => {
    sim2.T = +e.target.value;
    document.getElementById("sim-t-val").textContent = sim2.T;
    onSimChange();
  });
  document.getElementById("sim-h").addEventListener("input", e => {
    sim2.h = +e.target.value;
    document.getElementById("sim-h-val").textContent = sim2.h.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-r").addEventListener("input", e => {
    sim2.rho = +e.target.value;
    document.getElementById("sim-r-val").textContent = sim2.rho.toFixed(2);
    onSimChange();
  });
  document.getElementById("sim-reseed").addEventListener("click", () => {
    sim2.seed = Math.floor(Math.random() * 1e9) + 1;
    sim2_refit();
  });
  document.getElementById("sim-reset").addEventListener("click", () => {
    sim2.N = 200; sim2.T = 4; sim2.h = 1.00; sim2.rho = 0.70; sim2.seed = 7;
    document.getElementById("sim-n").value = sim2.N;
    document.getElementById("sim-t").value = sim2.T;
    document.getElementById("sim-h").value = sim2.h;
    document.getElementById("sim-r").value = sim2.rho;
    document.getElementById("sim-n-val").textContent = sim2.N;
    document.getElementById("sim-t-val").textContent = sim2.T;
    document.getElementById("sim-h-val").textContent = sim2.h.toFixed(2);
    document.getElementById("sim-r-val").textContent = sim2.rho.toFixed(2);
    sim2_refit();
  });

  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const histEl = document.getElementById("sim-hist");
    const histStats = document.getElementById("sim-hist-stats");

    const N_SIMS = 100;
    const beta_pols = [];
    const beta_fe = [];

    let i = 0;
    function step() {
      const end = Math.min(N_SIMS, i + 2);
      for (; i < end; i++) {
        const data = simulatePanel({
          N: sim2.N, T: sim2.T, h: sim2.h, rho: sim2.rho,
          seed: sim2.seed + i + 1,
        });
        const o = fitPooledOLS(data);
        const f = fitFE(data);
        if (o && Number.isFinite(o.slope)) beta_pols.push(o.slope);
        if (f && Number.isFinite(f.slope)) beta_fe.push(f.slope);
      }
      const pct = (i / N_SIMS) * 100;
      progBar.style.width = pct + "%";
      progLabel.textContent = `simulation ${i} / ${N_SIMS}`;
      if (i < N_SIMS) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = `done (${N_SIMS} simulations)`;
        histEl.style.display = "block";
        histStats.style.display = "grid";
        sim2.hist.update({ beta_pols, beta_fe, beta_true: TRUE_BETA });
        const meanP = d3.mean(beta_pols);
        const meanF = d3.mean(beta_fe);
        const sdP = d3.deviation(beta_pols);
        const sdF = d3.deviation(beta_fe);
        document.getElementById("sim-ols-mean").textContent = (meanP ?? 0).toFixed(3);
        document.getElementById("sim-ols-sd").textContent   = (sdP  ?? 0).toFixed(3);
        document.getElementById("sim-fe-mean").textContent  = (meanF ?? 0).toFixed(3);
        document.getElementById("sim-fe-sd").textContent    = (sdF  ?? 0).toFixed(3);
        btn.disabled = false;
      }
    }
    step();
  });

  sim2_refit();

  // ------------------------------------------------------------------
  // TAB 4 — Clustered SE Showdown.
  // ------------------------------------------------------------------
  // Render the static SE table from §8 of the post.
  function renderSEAtable(rows) {
    const container = document.getElementById("se-table");
    if (!container) return;
    const iidSE = rows[0].se;
    const html = `
      <table style="width:100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(232,236,242,0.18); color: #8b9dc3;">
            <th style="text-align:left; padding:6px 10px;">SE method</th>
            <th style="text-align:right; padding:6px 10px;">SE(X1)</th>
            <th style="text-align:right; padding:6px 10px;">t-statistic</th>
            <th style="text-align:right; padding:6px 10px;">p-value</th>
            <th style="text-align:right; padding:6px 10px;">vs iid</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => {
            const ratio = r.se / iidSE;
            const color = ratio > 1.20 ? "#d97757" : ratio < 0.95 ? "#6a9bcc" : "#e8ecf2";
            return `<tr style="border-bottom: 1px solid rgba(232,236,242,0.06);">
              <td style="padding:6px 10px; color: #e8ecf2;">${r.name}</td>
              <td style="text-align:right; padding:6px 10px; font-variant-numeric: tabular-nums;">${r.se.toFixed(4)}</td>
              <td style="text-align:right; padding:6px 10px; font-variant-numeric: tabular-nums;">${r.t.toFixed(3)}</td>
              <td style="text-align:right; padding:6px 10px; font-variant-numeric: tabular-nums;">${r.p < 0.0001 ? "&lt; 0.0001" : r.p.toFixed(4)}</td>
              <td style="text-align:right; padding:6px 10px; font-variant-numeric: tabular-nums; color: ${color};">${ratio.toFixed(2)}×</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>`;
    container.innerHTML = html;

    // Also draw a small bar chart of the SE values.
    drawSEChart(rows);
  }

  function drawSEChart(rows) {
    const container = document.getElementById("se-chart");
    if (!container) return;
    container.innerHTML = "";
    const W = 720, H = 280;
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("width", "100%");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(rows.map(r => r.name)).range([0, w]).padding(0.30);
    const yMax = d3.max(rows, r => r.se) * 1.15;
    const y = d3.scaleLinear().domain([0, yMax]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x))
      .selectAll("text").attr("fill", "#8b9dc3")
      .attr("text-anchor", "end").attr("transform", "rotate(-25)");
    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".3f")))
      .selectAll("text").attr("fill", "#8b9dc3");
    g.selectAll(".domain, .tick line").attr("stroke", "#8b9dc3");

    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h/2}, ${-52})`)
      .attr("text-anchor", "middle").attr("fill", "#e8ecf2").attr("font-size", 12)
      .text("Standard error of X1");

    const palette = ["#6a9bcc", "#5a82a8", "#d97757", "#e8956a", "#00d4c8"];
    g.selectAll("rect.bar").data(rows).enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.se))
      .attr("width", x.bandwidth())
      .attr("height", d => h - y(d.se))
      .attr("fill", (d, i) => palette[i % palette.length])
      .attr("opacity", 0.9);

    g.selectAll("text.val").data(rows).enter().append("text")
      .attr("class", "val")
      .attr("x", d => x(d.name) + x.bandwidth() / 2)
      .attr("y", d => y(d.se) - 6)
      .attr("text-anchor", "middle")
      .attr("fill", "#e8ecf2").attr("font-size", 11).attr("font-weight", 600)
      .text(d => d.se.toFixed(4));
  }

  // Interactive cluster-inflation slider.
  const cl = { b: -1.019, iidSE: 0.0858, mult: 1.40 };

  function cl_render() {
    document.getElementById("cl-b-val").textContent = cl.b.toFixed(3);
    document.getElementById("cl-iid-val").textContent = cl.iidSE.toFixed(4);
    document.getElementById("cl-mult-val").textContent = cl.mult.toFixed(2);

    const tIid = Math.abs(cl.b) / cl.iidSE;
    const seClust = cl.iidSE * cl.mult;
    const tClust = seClust > 1e-9 ? Math.abs(cl.b) / seClust : NaN;
    document.getElementById("cl-iid-t").textContent = Number.isFinite(tIid) ? tIid.toFixed(3) : "—";
    document.getElementById("cl-clust-t").textContent = Number.isFinite(tClust) ? tClust.toFixed(3) : "—";

    document.getElementById("cl-iid-sig").textContent = tIid > 1.96 ? "Yes" : "No";
    document.getElementById("cl-iid-sig").style.color = tIid > 1.96 ? "#00d4c8" : "#d97757";
    document.getElementById("cl-clust-sig").textContent = tClust > 1.96 ? "Yes" : "No";
    document.getElementById("cl-clust-sig").style.color = tClust > 1.96 ? "#00d4c8" : "#d97757";
  }

  document.getElementById("cl-b").addEventListener("input", e => {
    cl.b = +e.target.value; cl_render();
  });
  document.getElementById("cl-iid").addEventListener("input", e => {
    cl.iidSE = +e.target.value; cl_render();
  });
  document.getElementById("cl-mult").addEventListener("input", e => {
    cl.mult = +e.target.value; cl_render();
  });
  cl_render();

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app/python_pyfixest] uncaught error:", e.error);
  });
})();
