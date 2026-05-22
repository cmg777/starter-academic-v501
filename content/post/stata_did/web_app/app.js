// app.js — Difference-in-Differences in Stata interactive lab.
// Wires DOM controls to dgp/charts modules. Uses a small inline DiD simulator
// (single treatment date, 2 periods) because the post is a textbook 2x2 DiD
// case study (no staggering). Reuses DGP.mulberry32 + DGP.makeNormal for
// consistent seed semantics across the bundle.

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
    // The animation builder takes a 'delta' but the chart's internal scale is
    // log-employment in [4.5, 6.3] — fine for the qualitative animation. The
    // GPA-scale numbers are made concrete in Tabs 2-4 with custom drawing.
    anim.update({ delta: 0.04 });
  })();

  // ===========================================================================
  // TAB 2: parallel-trends lab — GPA-scale, single treatment date
  // ===========================================================================
  (function initParallelTrends() {
    const c = document.getElementById("pt-chart");
    if (!c) return;
    const W = 720, H = 360;
    const m = { top: 30, right: 24, bottom: 50, left: 60 };
    const w = W - m.left - m.right, hh = H - m.top - m.bottom;
    c.innerHTML = "";
    const svg = d3.select(c).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);
    const C = CHARTS.C;

    // Two-period DiD: t=-2 is pre, t=+1 is post. Treatment at t=0.
    const periods = [-2, +1];
    const x = d3.scaleLinear().domain([-2.5, 1.5]).range([0, w]);
    const y = d3.scaleLinear().domain([40, 110]).range([hh, 0]);

    g.append("g").attr("transform", `translate(0,${hh})`)
      .call(d3.axisBottom(x).tickValues(periods).tickFormat(d => d < 0 ? "Pre" : "Post"))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(y).ticks(7))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text").attr("transform", `translate(${w / 2},${hh + 38})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Time period");
    g.append("text").attr("transform", `rotate(-90) translate(${-hh / 2},${-46})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("GPA (0–100 scale)");

    // Treatment dividing line halfway between pre and post
    g.append("line").attr("x1", x(-0.5)).attr("x2", x(-0.5)).attr("y1", 0).attr("y2", hh)
      .attr("stroke", C.muted).attr("stroke-dasharray", "3 4");
    g.append("text").attr("x", x(-0.5) + 6).attr("y", 14)
      .attr("fill", C.muted).attr("font-size", 11).text("treatment");

    const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveLinear);
    const pControl = g.append("path").attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2.8);
    const pCF = g.append("path").attr("fill", "none").attr("stroke", C.muted).attr("stroke-width", 2.2).attr("stroke-dasharray", "5 4");
    const pObs = g.append("path").attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.8);

    // Markers
    const mControl = g.selectAll(".m-c").data(periods).enter().append("circle")
      .attr("class", "m-c").attr("r", 5).attr("fill", C.steel);
    const mCF = g.selectAll(".m-cf").data(periods).enter().append("circle")
      .attr("class", "m-cf").attr("r", 5).attr("fill", C.muted);
    const mObs = g.selectAll(".m-o").data(periods).enter().append("circle")
      .attr("class", "m-o").attr("r", 5).attr("fill", C.orange);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${W - 260},${8})`);
    [["Comparison (control)", C.steel, false],
     ["Counterfactual treated", C.muted, true],
     ["Observed treated", C.orange, false]].forEach((d, i) => {
      const yy = i * 16;
      legend.append("line").attr("x1", 0).attr("x2", 22)
        .attr("y1", yy + 6).attr("y2", yy + 6)
        .attr("stroke", d[1]).attr("stroke-width", 2.4)
        .attr("stroke-dasharray", d[2] ? "5 4" : "0");
      legend.append("text").attr("x", 28).attr("y", yy + 10)
        .attr("fill", C.text).attr("font-size", 11).text(d[0]);
    });

    const attLabel = g.append("text").attr("fill", C.teal)
      .attr("font-size", 13).attr("font-weight", 600).attr("text-anchor", "end")
      .attr("x", w - 6).attr("y", 18);

    // Anchor values from the post:
    //   control_pre = 71.22, control_post = 82.10  (drift = 10.88)
    //   treated_pre = 60.17
    function update() {
      const delta = +document.getElementById("pt-d").value;
      const pre = +document.getElementById("pt-pre").value;
      document.getElementById("pt-d-val").textContent = delta.toFixed(3);
      document.getElementById("pt-pre-val").textContent = pre.toFixed(3);

      const cPre = 71.22, cPost = 82.10;
      const tPre = 60.17;
      // Counterfactual treated = treated_pre + control's change + pre-trend slope
      // (pre-trend slope is a per-period extra drift in the treated group)
      const cfPost = tPre + (cPost - cPre) + pre;
      // Observed treated = counterfactual + true treatment effect delta
      const tPost = cfPost + delta;

      const controlPath = [[-2, cPre], [+1, cPost]];
      const cfPath = [[-2, tPre], [+1, cfPost]];
      const obsPath = [[-2, tPre], [+1, tPost]];

      pControl.attr("d", line(controlPath));
      pCF.attr("d", line(cfPath));
      pObs.attr("d", line(obsPath));

      mControl.data(controlPath).attr("cx", d => x(d[0])).attr("cy", d => y(d[1]));
      mCF.data(cfPath).attr("cx", d => x(d[0])).attr("cy", d => y(d[1]));
      mObs.data(obsPath).attr("cx", d => x(d[0])).attr("cy", d => y(d[1]));

      // Simple 2×2 DiD on observed lines: (T_post - T_pre) - (C_post - C_pre)
      const att_hat = (tPost - tPre) - (cPost - cPre);
      const truth = delta;
      const bias = att_hat - truth;

      document.getElementById("pt-att").textContent = att_hat.toFixed(3);
      document.getElementById("pt-true").textContent = truth.toFixed(3);
      document.getElementById("pt-bias").textContent = bias.toFixed(3);
      attLabel.text("DiD α̂:  " + (att_hat >= 0 ? "+" : "") + att_hat.toFixed(2) + " GPA pts");
    }

    document.getElementById("pt-d").addEventListener("input", update);
    document.getElementById("pt-pre").addEventListener("input", update);
    update();
  })();

  // ===========================================================================
  // TAB 3: DiD vs ITS simulator — single-cohort 2×2 design
  // ===========================================================================
  // Simulate a panel: nT treated schools, nC = n_per - 10 comparison schools.
  // Outcome: Y_it = school_FE + secular_trend * (t > 0) + delta * treat * (t > 0) + noise.
  // DiD: (Y_treat_post - Y_treat_pre) - (Y_ctrl_post - Y_ctrl_pre)
  // ITS: Y_treat_post - Y_treat_pre  (no control)
  function did_vs_its_panel(nPerGroup, delta, trend, sigma, seed) {
    const rng = DGP.mulberry32(seed);
    const norm = DGP.makeNormal(rng);
    const nT = 10;
    const nC = Math.max(5, nPerGroup - nT);
    const baseT = 60.17;   // treated pre mean
    const baseC = 71.22;   // control pre mean

    // Simulate pre and post outcomes for each school
    let yT_pre = 0, yT_post = 0, yC_pre = 0, yC_post = 0;
    for (let i = 0; i < nT; i++) {
      const fe = norm() * sigma;
      yT_pre  += baseT + fe + norm() * sigma;
      yT_post += baseT + fe + trend + delta + norm() * sigma;
    }
    for (let i = 0; i < nC; i++) {
      const fe = norm() * sigma;
      yC_pre  += baseC + fe + norm() * sigma;
      yC_post += baseC + fe + trend + norm() * sigma;
    }
    yT_pre /= nT; yT_post /= nT;
    yC_pre /= nC; yC_post /= nC;

    const did = (yT_post - yT_pre) - (yC_post - yC_pre);
    const its = yT_post - yT_pre;

    return { did, its, true_att: delta };
  }

  (function initShowdown() {
    const cmp = CHARTS.did_2x2_chart(document.getElementById("sh-compare"));
    const hist = CHARTS.did_sim_histograms(document.getElementById("sh-hist"));

    const state = { n: 35, delta: 25, trend: 10.88, sigma: 3, seed: 7 };

    function refit() {
      const r = did_vs_its_panel(state.n, state.delta, state.trend, state.sigma, state.seed);
      state.last = r;
      document.getElementById("sh-cs-alpha").textContent = Number.isFinite(r.did) ? r.did.toFixed(3) : "—";
      document.getElementById("sh-cs-true").textContent = r.true_att.toFixed(3);
      document.getElementById("sh-cs-bias").textContent = (r.did - r.true_att).toFixed(3);
      document.getElementById("sh-tw-alpha").textContent = Number.isFinite(r.its) ? r.its.toFixed(3) : "—";
      document.getElementById("sh-tw-true").textContent = r.true_att.toFixed(3);
      document.getElementById("sh-tw-bias").textContent = (r.its - r.true_att).toFixed(3);
      // Reuse the bar chart but rename labels via shape: (true, ITS, DiD)
      cmp.update({ true_att: r.true_att, twfe_est: r.its, cs_est: r.did });
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
    bind("sh-d", "delta", 3);
    bind("sh-g", "trend", 3);
    bind("sh-s", "sigma", 2);

    document.getElementById("sh-run").addEventListener("click", function () {
      const N = 100;
      const itsArr = [], didArr = [];
      let i = 0;
      const tick = () => {
        const end = Math.min(N, i + 4);
        for (; i < end; i++) {
          const r = did_vs_its_panel(state.n, state.delta, state.trend, state.sigma, state.seed + i + 1);
          if (Number.isFinite(r.its)) itsArr.push(r.its);
          if (Number.isFinite(r.did)) didArr.push(r.did);
        }
        document.querySelector("#sh-progress > div").style.width = (i / N * 100) + "%";
        if (i < N) setTimeout(tick, 0);
        else {
          document.getElementById("sh-hist").style.display = "block";
          // Reuse hist with twfe = ITS, cs = DiD
          hist.update({ twfe: itsArr, cs: didArr, true_att: state.last.true_att });
        }
      };
      tick();
    });
    refit();
  })();

  // ===========================================================================
  // TAB 4: forest plot + event study (bound to results.json)
  // ===========================================================================
  (function initForestAndEvent() {
    const fp = CHARTS.did_forest_plot(document.getElementById("fp-chart"));
    const es = CHARTS.did_event_study(document.getElementById("es-chart"));
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
    }).catch(err => {
      console.error("Failed to load results.json:", err);
      const fpc = document.getElementById("fp-chart");
      if (fpc) fpc.innerHTML = '<div style="padding:20px;color:#d97757;">Could not load data/results.json — forest plot disabled.</div>';
    });
  })();

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[stata_did web_app] uncaught error:", e.error);
  });
})();
