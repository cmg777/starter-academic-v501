// app.js — Difference-in-Differences interactive lab
// Wires DOM controls to dgp/charts modules. Uses a small inline DiD simulator
// (2 cohorts + never-treated) because lasso.js is a generic LASSO helper and
// the template DGPs are LASSO-oriented; reusing DGP.rng_seeded + DGP.norm
// keeps the seed semantics consistent across the bundle.

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

  // ===========================================================================
  // TAB 1: parallel-trends animation (re-used as static intro chart)
  // ===========================================================================
  (function initIntroAnim() {
    const c = document.getElementById("intro-anim");
    if (!c) return;
    const anim = CHARTS.parallel_trends_animation(c);
    anim.update({ delta: -0.030 });
  })();

  // ===========================================================================
  // TAB 2: parallel-trends lab
  // ===========================================================================
  (function initParallelTrends() {
    const c = document.getElementById("pt-chart");
    if (!c) return;
    // Re-use the parallel-trends animation but override draw so we control delta + pre-trend.
    // The animation builder only takes delta; we extend it here by drawing manually.
    const W = 720, H = 380;
    const m = { top: 30, right: 24, bottom: 80, left: 56 };
    const w = W - m.left - m.right, hh = H - m.top - m.bottom;
    c.innerHTML = "";
    const svg = d3.select(c).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);
    const C = CHARTS.C;

    const periods = [-2, -1, 0, 1, 2, 3];
    const x = d3.scaleLinear().domain([-2.2, 3.2]).range([0, w]);
    const y = d3.scaleLinear().domain([4.5, 6.3]).range([hh, 0]);

    g.append("g").attr("transform", `translate(0,${hh})`)
      .call(d3.axisBottom(x).tickValues(periods).tickFormat(d => (d <= 0 ? "t" + d : "t+" + d)))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text").attr("transform", `translate(${w / 2},${hh + 36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Time relative to treatment");
    g.append("text").attr("transform", `rotate(-90) translate(${-hh / 2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Log teen employment (mean)");

    g.append("line").attr("x1", x(-0.5)).attr("x2", x(-0.5)).attr("y1", 0).attr("y2", hh)
      .attr("stroke", C.muted).attr("stroke-dasharray", "3 4");
    g.append("text").attr("x", x(-0.5) + 6).attr("y", 14)
      .attr("fill", C.muted).attr("font-size", 11).text("treatment");

    const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX);
    const pControl = g.append("path").attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2.6);
    const pCF = g.append("path").attr("fill", "none").attr("stroke", C.muted).attr("stroke-width", 2).attr("stroke-dasharray", "5 4");
    const pObs = g.append("path").attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.8);

    // Legend placed below the plot (outside data area) with a background rect
    const legendItems = [
      ["Control (untreated)", C.steel, false],
      ["Counterfactual treated", C.muted, true],
      ["Observed treated", C.orange, false],
    ];
    const legend = svg.append("g")
      .attr("transform", `translate(${m.left},${H - 4})`);
    legend.append("rect")
      .attr("x", -4).attr("y", -14)
      .attr("width", w + 8).attr("height", 16)
      .attr("fill", "rgba(15,23,41,0.7)").attr("rx", 4);
    let lx = 0;
    legendItems.forEach((d) => {
      legend.append("line").attr("x1", lx).attr("x2", lx + 22)
        .attr("y1", -6).attr("y2", -6)
        .attr("stroke", d[1]).attr("stroke-width", 2.4)
        .attr("stroke-dasharray", d[2] ? "5 4" : "0");
      legend.append("text").attr("x", lx + 28).attr("y", -2)
        .attr("fill", C.text).attr("font-size", 11).text(d[0]);
      lx += 28 + d[0].length * 6.6 + 14;
    });

    // ATT annotation (with background rect for legibility)
    g.append("rect")
      .attr("fill", "rgba(15,23,41,0.72)").attr("rx", 3)
      .attr("y", 4).attr("height", 16).attr("width", 200)
      .attr("x", w - 204);
    const attLabel = g.append("text").attr("fill", C.teal)
      .attr("font-size", 12).attr("text-anchor", "end")
      .attr("x", w - 6).attr("y", 16);

    function update() {
      const delta = +document.getElementById("pt-d").value;
      const pre = +document.getElementById("pt-pre").value;
      document.getElementById("pt-d-val").textContent = delta.toFixed(3);
      document.getElementById("pt-pre-val").textContent = pre.toFixed(3);

      // Control: mild upward drift
      const controlPath = periods.map(t => [t, 5.55 + 0.015 * t]);
      // Counterfactual: control + initial gap + pre-trend slope * t (treated drifts faster)
      const gap0 = 0.10;
      const cfPath = periods.map(t => [t, 5.55 + gap0 + (0.015 + pre) * t]);
      // Observed treated: counterfactual + delta * (t+1) for t>=0
      const obsPath = periods.map(t => {
        const base = 5.55 + gap0 + (0.015 + pre) * t;
        return [t, t >= 0 ? base + delta * (t + 1) : base];
      });

      pControl.attr("d", line(controlPath));
      pCF.attr("d", line(cfPath));
      pObs.attr("d", line(obsPath));

      // Simple 2×2 DiD: (Y_T at t+3 - Y_T at t-2) - (Y_C at t+3 - Y_C at t-2)
      const yT3 = obsPath[5][1], yT0 = obsPath[0][1];
      const yC3 = controlPath[5][1], yC0 = controlPath[0][1];
      const att_hat = (yT3 - yT0) - (yC3 - yC0);
      const truth = delta * (3 + 1); // cumulative true effect at t+3
      const bias = att_hat - truth;

      document.getElementById("pt-att").textContent = att_hat.toFixed(4);
      document.getElementById("pt-true").textContent = truth.toFixed(4);
      document.getElementById("pt-bias").textContent = bias.toFixed(4);
      attLabel.text("DiD α̂ at t+3:  " + (att_hat >= 0 ? "+" : "") + att_hat.toFixed(3));
    }

    document.getElementById("pt-d").addEventListener("input", update);
    document.getElementById("pt-pre").addEventListener("input", update);
    update();
  })();

  // ===========================================================================
  // TAB 3: TWFE vs CS showdown — small DiD DGP
  // ===========================================================================
  // Simulate 3-cohort staggered DiD:
  //   - 1 never-treated cohort (G = 0)
  //   - 1 early-treated cohort (G = A)
  //   - 1 late-treated cohort  (G = A + gap)
  // True dynamics: effect grows linearly in event time at rate dyn.
  // TWFE: regress Y on unit + time + post(D_it) — recovered via demeaning shortcut.
  // CS:   compute ATT(g,t) for each cohort vs never-treated, then average.
  function did_panel(nPerCohort, dyn, gap, sigma, seed) {
    const T = 6;                  // total time periods (1..T)
    const gA = 2, gB = 2 + gap;   // treatment dates (must satisfy gB <= T)
    const rng = DGP.mulberry32(seed);
    const norm = DGP.makeNormal(rng);
    const cohorts = [0, gA, gB];
    const units = [];
    let uid = 0;
    cohorts.forEach((g, ci) => {
      for (let i = 0; i < nPerCohort; i++) {
        // unit fixed effect: small heterogeneity
        const eta = norm() * 0.2 + ci * 0.05;
        units.push({ id: uid++, g, eta });
      }
    });
    // Time FE
    const theta = d3.range(T).map(t => 0.015 * t);

    // Build a panel of length units.length * T
    const N = units.length;
    const Y = new Float64Array(N * T);
    const D = new Float64Array(N * T);
    units.forEach(u => {
      for (let t = 0; t < T; t++) {
        const calT = t + 1;
        const treated = (u.g > 0) && (calT >= u.g);
        const e = treated ? (calT - u.g + 1) * dyn : 0;
        const noise = norm() * sigma;
        Y[u.id * T + t] = u.eta + theta[t] + e + noise;
        D[u.id * T + t] = treated ? 1 : 0;
      }
    });

    // ---- TWFE via within-transform: demean Y and D by unit and by time.
    // For a balanced panel, double-demean → regress demeaned Y on demeaned D.
    const yMeanU = new Float64Array(N), dMeanU = new Float64Array(N);
    const yMeanT = new Float64Array(T), dMeanT = new Float64Array(T);
    let yGrand = 0, dGrand = 0;
    for (let i = 0; i < N; i++) {
      for (let t = 0; t < T; t++) {
        const yy = Y[i * T + t], dd = D[i * T + t];
        yMeanU[i] += yy; dMeanU[i] += dd;
        yMeanT[t] += yy; dMeanT[t] += dd;
        yGrand += yy; dGrand += dd;
      }
    }
    for (let i = 0; i < N; i++) { yMeanU[i] /= T; dMeanU[i] /= T; }
    for (let t = 0; t < T; t++) { yMeanT[t] /= N; dMeanT[t] /= N; }
    yGrand /= N * T; dGrand /= N * T;
    let num = 0, den = 0;
    for (let i = 0; i < N; i++) {
      for (let t = 0; t < T; t++) {
        const ytil = Y[i * T + t] - yMeanU[i] - yMeanT[t] + yGrand;
        const dtil = D[i * T + t] - dMeanU[i] - dMeanT[t] + dGrand;
        num += dtil * ytil;
        den += dtil * dtil;
      }
    }
    const twfe = den > 1e-12 ? num / den : NaN;

    // ---- CS-style: For each treated cohort g, for each post-treatment t (calT>=g),
    // compute ATT(g, t) = (Y_treated_at_t - Y_treated_at_g-1) - (Y_control_at_t - Y_control_at_g-1)
    // where control = never-treated cohort (g=0). Then average over (g, t) weighted by # post-periods.
    const neverIds = units.filter(u => u.g === 0).map(u => u.id);
    let attSum = 0, attCount = 0;
    [gA, gB].forEach(g => {
      const treatIds = units.filter(u => u.g === g).map(u => u.id);
      const tBaseIdx = g - 1 - 1; // base period index in 0..T-1 ; calT = g-1 → t-index = g-1-1
      if (tBaseIdx < 0) return;
      for (let calT = g; calT <= T; calT++) {
        const tIdx = calT - 1;
        let yTpost = 0, yTbase = 0, yCpost = 0, yCbase = 0;
        treatIds.forEach(id => { yTpost += Y[id * T + tIdx]; yTbase += Y[id * T + tBaseIdx]; });
        neverIds.forEach(id => { yCpost += Y[id * T + tIdx]; yCbase += Y[id * T + tBaseIdx]; });
        yTpost /= treatIds.length; yTbase /= treatIds.length;
        yCpost /= neverIds.length; yCbase /= neverIds.length;
        const attgt = (yTpost - yTbase) - (yCpost - yCbase);
        attSum += attgt;
        attCount += 1;
      }
    });
    const cs = attCount > 0 ? attSum / attCount : NaN;

    // True overall ATT (analytic): average of dyn * (calT - g + 1) across the same (g, t) cells
    let trueSum = 0, trueCount = 0;
    [gA, gB].forEach(g => {
      for (let calT = g; calT <= T; calT++) {
        trueSum += dyn * (calT - g + 1);
        trueCount += 1;
      }
    });
    const true_att = trueCount > 0 ? trueSum / trueCount : NaN;

    return { twfe, cs, true_att };
  }

  (function initShowdown() {
    const cmp = CHARTS.did_2x2_chart(document.getElementById("sh-compare"));
    const hist = CHARTS.did_sim_histograms(document.getElementById("sh-hist"));

    const state = { n: 200, dyn: -0.020, gap: 2, sigma: 0.10, seed: 7 };

    function refit() {
      const r = did_panel(state.n, state.dyn, state.gap, state.sigma, state.seed);
      state.last = r;
      document.getElementById("sh-cs-alpha").textContent = Number.isFinite(r.cs) ? r.cs.toFixed(4) : "—";
      document.getElementById("sh-cs-true").textContent = r.true_att.toFixed(4);
      document.getElementById("sh-cs-bias").textContent = (r.cs - r.true_att).toFixed(4);
      document.getElementById("sh-tw-alpha").textContent = Number.isFinite(r.twfe) ? r.twfe.toFixed(4) : "—";
      document.getElementById("sh-tw-true").textContent = r.true_att.toFixed(4);
      document.getElementById("sh-tw-bias").textContent = (r.twfe - r.true_att).toFixed(4);
      cmp.update({ true_att: r.true_att, twfe_est: r.twfe, cs_est: r.cs });
    }

    const onParam = debounce(refit, 120);
    function bind(id, key, prec) {
      const el = document.getElementById(id);
      el.addEventListener("input", e => {
        const v = +e.target.value;
        state[key] = v;
        document.getElementById(id + "-val").textContent = prec === 0 ? v : v.toFixed(prec);
        onParam();
      });
    }
    bind("sh-n", "n", 0);
    bind("sh-d", "dyn", 3);
    bind("sh-g", "gap", 0);
    bind("sh-s", "sigma", 2);

    document.getElementById("sh-run").addEventListener("click", function () {
      const N = 100;
      const twfeArr = [], csArr = [];
      let i = 0;
      const tick = () => {
        const end = Math.min(N, i + 2);
        for (; i < end; i++) {
          const r = did_panel(state.n, state.dyn, state.gap, state.sigma, state.seed + i + 1);
          if (Number.isFinite(r.twfe)) twfeArr.push(r.twfe);
          if (Number.isFinite(r.cs)) csArr.push(r.cs);
        }
        document.querySelector("#sh-progress > div").style.width = (i / N * 100) + "%";
        if (i < N) setTimeout(tick, 0);
        else {
          document.getElementById("sh-hist").style.display = "block";
          hist.update({ twfe: twfeArr, cs: csArr, true_att: state.last.true_att });
        }
      };
      tick();
    });
    refit();
  })();

  // ===========================================================================
  // TAB 4: forest plot + event study + HonestDiD (all bound to results.json)
  // ===========================================================================
  (function initForestAndEvent() {
    const fp = CHARTS.did_forest_plot(document.getElementById("fp-chart"));
    const es = CHARTS.did_event_study(document.getElementById("es-chart"));
    const hd = CHARTS.honestdid_chart(document.getElementById("hd-chart"));
    let cached = null;

    function refreshForest() {
      if (!cached) return;
      const methods = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(e => e.value);
      fp.update(cached.estimates, methods);
    }
    function refreshEvent() {
      if (!cached) return;
      const series = Array.from(document.querySelectorAll("#es-methods input:checked")).map(e => e.value);
      es.update(cached.event_study || {}, series);
    }

    document.querySelectorAll("#fp-methods input").forEach(el => el.addEventListener("change", refreshForest));
    document.querySelectorAll("#es-methods input").forEach(el => el.addEventListener("change", refreshEvent));

    fetch("data/results.json").then(r => r.json()).then(data => {
      cached = data;
      refreshForest();
      refreshEvent();
      hd.update(data.honestdid || []);
    }).catch(err => {
      console.error("Failed to load results.json:", err);
      const fpc = document.getElementById("fp-chart");
      if (fpc) fpc.innerHTML = '<div style="padding:20px;color:#d97757;">Could not load data/results.json — forest plot disabled.</div>';
    });
  })();

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[r_did web_app] uncaught error:", e.error);
  });
})();
