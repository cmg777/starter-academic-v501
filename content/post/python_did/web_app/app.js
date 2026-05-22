// app.js — wires the DOM controls in index.html to dgp/charts and a small
// inline 2x2 DiD estimator. Runs after window.DGP, window.LASSO, window.CHARTS.

(function () {
  "use strict";

  // ---- Tab switching --------------------------------------------------------
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

  // ---- TAB 1 — concept animation -------------------------------------------
  CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));

  // ---- 2x2 DiD simulator -----------------------------------------------------
  // Simulate a balanced 2x2 panel:
  //   half units treated (T=1), half control (T=0); two periods pre+post.
  //   Y = mu + alpha_T * T  +  (lambda + pt_gap * T) * Post  +  ATT * T * Post + eps
  //   pt_gap is the per-period extra trend of the treated group (= violation).
  //   ATT is the true treatment effect on the treated.
  // Returns {att_hat, se, t, ci_lo, ci_hi, n_obs, mean_TC_pre, ...}
  function simulate_did(opts) {
    const n = Math.max(20, opts.n | 0);
    const att_true = +opts.att;
    const pt_gap = +opts.pt_gap;
    const sigma = +opts.sigma;
    const seed = (opts.seed >>> 0) || 1;
    const rng = DGP.mulberry32(seed);
    const normal = DGP.makeNormal(rng);

    const halfN = Math.floor(n / 2);
    // Each unit has 2 obs (pre, post). Generate sums for the 4 cells.
    // sum[treated][post] and count[treated][post]
    const sum = [[0, 0], [0, 0]];
    const cnt = [[0, 0], [0, 0]];
    const sumsq = [[0, 0], [0, 0]];

    // Common time trend
    const baseTrend = 1.0;
    // Treated baseline level shift
    const treatedShift = 0.5;
    const mu = 10.0;

    for (let u = 0; u < n; u++) {
      const treated = u < halfN ? 1 : 0;
      // unit-level random effect
      const unit_re = 0.6 * normal();
      for (let post = 0; post < 2; post++) {
        const trend = (baseTrend + pt_gap * treated) * post;
        const treat_effect = att_true * treated * post;
        const y = mu + treatedShift * treated + trend + treat_effect + unit_re + sigma * normal();
        sum[treated][post] += y;
        cnt[treated][post] += 1;
        sumsq[treated][post] += y * y;
      }
    }

    const mean = [
      [sum[0][0] / cnt[0][0], sum[0][1] / cnt[0][1]],
      [sum[1][0] / cnt[1][0], sum[1][1] / cnt[1][1]],
    ];
    const att_hat = (mean[1][1] - mean[1][0]) - (mean[0][1] - mean[0][0]);

    // Pooled variance for SE on the interaction (classical 2x2).
    let rss = 0, df = 0;
    for (let t = 0; t < 2; t++) {
      for (let p = 0; p < 2; p++) {
        const m = mean[t][p];
        const ss = sumsq[t][p] - cnt[t][p] * m * m;
        rss += ss;
        df += cnt[t][p] - 1;
      }
    }
    const s2 = rss / Math.max(1, df);
    // Var of (m11 - m10) - (m01 - m00) under iid errors:
    //   = s2 * (1/n11 + 1/n10 + 1/n01 + 1/n00)
    let invSum = 0;
    for (let t = 0; t < 2; t++)
      for (let p = 0; p < 2; p++) invSum += 1 / cnt[t][p];
    const se = Math.sqrt(s2 * invSum);
    const t = att_hat / se;
    const z = 1.96;
    return {
      att_hat, se, t, ci_lo: att_hat - z * se, ci_hi: att_hat + z * se,
      mean, n_obs: 2 * n,
    };
  }

  const sim = {
    n: 200, att: 5.00, pt: 0.00, sigma: 1.00, seed: 42,
    cmp: CHARTS.alpha_compare(document.getElementById("sim-compare")),
    hist: CHARTS.alpha_histograms(document.getElementById("sim-hist")),
  };

  function fmt(x, d) {
    d = (d === undefined) ? 3 : d;
    if (x === null || x === undefined) return "—";
    if (!Number.isFinite(x)) return "—";
    return x.toFixed(d);
  }

  function sim_refit() {
    const res = simulate_did({
      n: sim.n, att: sim.att, pt_gap: sim.pt, sigma: sim.sigma, seed: sim.seed,
    });
    sim.res = res;
    sim_render();
  }

  function sim_render() {
    const r = sim.res;
    document.getElementById("sim-att-hat").textContent = fmt(r.att_hat);
    document.getElementById("sim-att-se").textContent  = fmt(r.se, 4);
    document.getElementById("sim-t").textContent       = fmt(r.t, 2);
    document.getElementById("sim-ci-lo").textContent   = fmt(r.ci_lo);
    document.getElementById("sim-ci-hi").textContent   = fmt(r.ci_hi);
    document.getElementById("sim-true-att").textContent = sim.att.toFixed(2);
    document.getElementById("sim-bias").textContent = fmt(r.att_hat - sim.att);
    document.getElementById("sim-bias-src").textContent =
      Math.abs(sim.pt) < 1e-6 ? "(none — parallel trends hold)"
                              : `pre-trend gap = ${sim.pt.toFixed(2)}`;
    const covers = (sim.att >= r.ci_lo && sim.att <= r.ci_hi);
    document.getElementById("sim-covers").textContent = covers ? "yes" : "no";

    sim.cmp.update({
      rigorous: r.att_hat,     // "DL (rigorous)" → ATT̂
      cv: sim.att + sim.pt * 2.5,  // crude expected biased estimator under parallel-trend violation; for the chart's "naive" track
      alpha_true: sim.att,
    });
  }

  const onSimParam = debounce(sim_refit, 80);
  document.getElementById("sim-n").addEventListener("input", e => {
    sim.n = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim.n;
    onSimParam();
  });
  document.getElementById("sim-att").addEventListener("input", e => {
    sim.att = +e.target.value;
    document.getElementById("sim-att-val").textContent = sim.att.toFixed(2);
    onSimParam();
  });
  document.getElementById("sim-pt").addEventListener("input", e => {
    sim.pt = +e.target.value;
    document.getElementById("sim-pt-val").textContent = sim.pt.toFixed(2);
    onSimParam();
  });
  document.getElementById("sim-s").addEventListener("input", e => {
    sim.sigma = +e.target.value;
    document.getElementById("sim-s-val").textContent = sim.sigma.toFixed(2);
    onSimParam();
  });

  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const histEl = document.getElementById("sim-hist");
    const histStats = document.getElementById("sim-hist-stats");

    const N_SIMS = 100;
    const ests = [];
    let nCover = 0;
    let i = 0;
    function step() {
      const batch = 4;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const r = simulate_did({
          n: sim.n, att: sim.att, pt_gap: sim.pt, sigma: sim.sigma,
          seed: sim.seed + i + 1,
        });
        if (Number.isFinite(r.att_hat)) {
          ests.push(r.att_hat);
          if (sim.att >= r.ci_lo && sim.att <= r.ci_hi) nCover++;
        }
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
        // The histogram chart expects two arrays; pass the same array twice
        // with a dummy second one (empty) by re-using the simulator.
        sim.hist.update({
          alphas_rig: ests,
          alphas_cv: [],
          alpha_true: sim.att,
        });
        const meanEst = ests.reduce((a, b) => a + b, 0) / Math.max(1, ests.length);
        let varEst = 0;
        for (const e of ests) varEst += (e - meanEst) * (e - meanEst);
        const sdEst = Math.sqrt(varEst / Math.max(1, ests.length - 1));
        document.getElementById("sim-mean").textContent     = meanEst.toFixed(3);
        document.getElementById("sim-sd").textContent       = sdEst.toFixed(3);
        document.getElementById("sim-emp-bias").textContent = (meanEst - sim.att).toFixed(3);
        document.getElementById("sim-cov").textContent      = (nCover / N_SIMS * 100).toFixed(0) + "%";
        btn.disabled = false;
      }
    }
    step();
  });

  sim_refit();

  // ---- TAB 3 — Forest plot from real data ----------------------------------
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
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

  // ---- TAB 4 — HonestDiD sensitivity slider --------------------------------
  // Renders an interactive line/band chart of CI vs M. The data is loaded
  // alongside the forest-plot results.json (honest_did array).

  function h_render(data, M_target) {
    const container = document.getElementById("h-sens");
    if (!container) return;
    // Interpolate the CI at M = M_target.
    const arr = data.honest_did.slice().sort((a, b) => a.M - b.M);
    function interp(field) {
      if (M_target <= arr[0].M) return arr[0][field];
      if (M_target >= arr[arr.length - 1].M) return arr[arr.length - 1][field];
      for (let i = 0; i < arr.length - 1; i++) {
        if (M_target >= arr[i].M && M_target <= arr[i + 1].M) {
          const f = (M_target - arr[i].M) / (arr[i + 1].M - arr[i].M);
          return arr[i][field] + f * (arr[i + 1][field] - arr[i][field]);
        }
      }
      return arr[arr.length - 1][field];
    }
    const ci_lo = interp("ci_lo");
    const ci_hi = interp("ci_hi");
    const att = 2.5958;

    document.getElementById("h-ci-lo").textContent = ci_lo.toFixed(4);
    document.getElementById("h-ci-hi").textContent = ci_hi.toFixed(4);
    document.getElementById("h-width").textContent = (ci_hi - ci_lo).toFixed(4);
    document.getElementById("h-sig").textContent   = ci_lo > 0 ? "yes" : "no";

    // Draw the line/band chart.
    const W = 720, H = 320;
    const margin = { top: 22, right: 24, bottom: 50, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    container.innerHTML = "";
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 15]).range([0, w]);
    const yExt = [
      Math.min(0, d3.min(arr, d => d.ci_lo)) - 0.3,
      d3.max(arr, d => d.ci_hi) + 0.3,
    ];
    const y = d3.scaleLinear().domain(yExt).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(8))
      .selectAll("text").attr("fill", "#8b9dc3");
    g.append("g").call(d3.axisLeft(y).ticks(6))
      .selectAll("text").attr("fill", "#8b9dc3");
    g.selectAll(".domain, .tick line").attr("stroke", "#8b9dc3");

    g.append("text").attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle").attr("fill", "#e8ecf2").attr("font-size", 12)
      .text("Sensitivity parameter  M");
    g.append("text").attr("transform", `rotate(-90) translate(${-h / 2},${-42})`)
      .attr("text-anchor", "middle").attr("fill", "#e8ecf2").attr("font-size", 12)
      .text("ATT — robust 95% CI");

    // Band.
    const area = d3.area()
      .x(d => x(d.M))
      .y0(d => y(d.ci_lo))
      .y1(d => y(d.ci_hi))
      .curve(d3.curveMonotoneX);
    g.append("path").datum(arr).attr("fill", "#6a9bcc").attr("opacity", 0.22).attr("d", area);
    // Borders.
    const line = d3.line().x(d => x(d.M)).curve(d3.curveMonotoneX);
    g.append("path").datum(arr).attr("fill", "none").attr("stroke", "#6a9bcc")
      .attr("stroke-width", 2).attr("d", line.y(d => y(d.ci_lo)));
    g.append("path").datum(arr).attr("fill", "none").attr("stroke", "#6a9bcc")
      .attr("stroke-width", 2).attr("d", line.y(d => y(d.ci_hi)));

    // Zero line.
    g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
      .attr("stroke", "#e8ecf2").attr("stroke-width", 1).attr("opacity", 0.4);
    // ATT line.
    g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(att)).attr("y2", y(att))
      .attr("stroke", "#00d4c8").attr("stroke-dasharray", "4 4").attr("stroke-width", 1.5);
    g.append("text").attr("x", w - 6).attr("y", y(att) - 6)
      .attr("text-anchor", "end").attr("fill", "#00d4c8").attr("font-size", 11)
      .text(`ATT = ${att.toFixed(2)}`);

    // Current-M cursor.
    g.append("line").attr("x1", x(M_target)).attr("x2", x(M_target))
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", "#d97757").attr("stroke-dasharray", "4 4").attr("stroke-width", 1.5);
    g.append("circle").attr("cx", x(M_target)).attr("cy", y(ci_lo))
      .attr("r", 5).attr("fill", "#d97757");
    g.append("circle").attr("cx", x(M_target)).attr("cy", y(ci_hi))
      .attr("r", 5).attr("fill", "#d97757");
    g.append("text").attr("x", x(M_target) + 6).attr("y", 14)
      .attr("fill", "#d97757").attr("font-size", 11)
      .text(`M = ${M_target.toFixed(1)}`);
  }

  function setupHonest(data) {
    const slider = document.getElementById("h-m");
    const val = document.getElementById("h-m-val");
    function update() {
      const M = +slider.value;
      val.textContent = M.toFixed(1);
      h_render(data, M);
    }
    slider.addEventListener("input", update);
    update();
  }

  // ---- Data loader ----------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
    setupHonest(data);
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    const msg = `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    document.getElementById("fp-chart").innerHTML = msg;
    document.getElementById("h-sens").innerHTML = msg;
  });

  // ---- Global error handler -------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
