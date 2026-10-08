// app.js — wires sliders to charts for the Ring DiD web app.
// Runs after window.DGP, window.LASSO (boilerplate, used by smoke test), and
// window.CHARTS are defined.

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

  // ------------------------------------------------------------------
  // Shared utility — debounce for slider-driven recomputes.
  // ------------------------------------------------------------------
  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // Seeded RNG: re-use DGP.mulberry32 from the boilerplate.
  function makeRng(seed) { return DGP.mulberry32(seed >>> 0); }
  function boxMuller(rng) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // ------------------------------------------------------------------
  // TAB 1 — Hero 3-numbers bar.
  // ------------------------------------------------------------------
  CHARTS.three_numbers_bars(document.getElementById("intro-three-numbers"), [
    { name: "Parametric ring DiD",       sub: "inner ring = (0, 0.1] mi · headline",      value_pct: -5.78,  color: CHARTS.C.orange },
    { name: "Sample-weighted NP ATT",     sub: "binsreg, average inside 0.1 mi",            value_pct: -12.40, color: CHARTS.C.teal },
    { name: "NP bin 1 (closest ~300 ft)", sub: "where the effect concentrates",             value_pct: -20.60, color: CHARTS.C.steel },
  ]);

  // ------------------------------------------------------------------
  // TAB 2 — Ring-choice lab.
  // ------------------------------------------------------------------
  const rc = {
    cut: 0.10,
    chart: CHARTS.ringchoice_curve(document.getElementById("rc-curve")),
  };
  // ATT(d) interpolated from the post's three anchor points.
  function rc_att_at(cut) {
    const anchors = [
      { cut: 0.05, att_log: -0.0661, att_pct: -6.40, se: 0.0383, ci_lo: -0.1411, ci_hi:  0.0089 },
      { cut: 0.10, att_log: -0.0560, att_pct: -5.45, se: 0.0239, ci_lo: -0.1029, ci_hi: -0.0092 },
      { cut: 0.15, att_log: -0.0431, att_pct: -4.21, se: 0.0180, ci_lo: -0.0784, ci_hi: -0.0077 },
    ];
    if (cut <= anchors[0].cut) return anchors[0];
    if (cut >= anchors[anchors.length - 1].cut) return anchors[anchors.length - 1];
    for (let i = 0; i < anchors.length - 1; i++) {
      if (cut >= anchors[i].cut && cut <= anchors[i + 1].cut) {
        const t = (cut - anchors[i].cut) / (anchors[i + 1].cut - anchors[i].cut);
        const lerp = (a, b) => a * (1 - t) + b * t;
        return {
          cut,
          att_log: lerp(anchors[i].att_log, anchors[i + 1].att_log),
          att_pct: lerp(anchors[i].att_pct, anchors[i + 1].att_pct),
          se:      lerp(anchors[i].se,      anchors[i + 1].se),
          ci_lo:   lerp(anchors[i].ci_lo,   anchors[i + 1].ci_lo),
          ci_hi:   lerp(anchors[i].ci_hi,   anchors[i + 1].ci_hi),
        };
      }
    }
    return anchors[1];
  }
  function rc_refresh() {
    const row = rc_att_at(rc.cut);
    rc.chart.update({ current_cut: rc.cut });
    document.getElementById("rc-cut-val").textContent = rc.cut.toFixed(2);
    document.getElementById("rc-att-log").textContent = row.att_log.toFixed(4);
    document.getElementById("rc-att-pct").textContent = row.att_pct.toFixed(2) + " %";
    const ciLoPct = (Math.exp(row.ci_lo) - 1) * 100;
    const ciHiPct = (Math.exp(row.ci_hi) - 1) * 100;
    document.getElementById("rc-ci").textContent =
      `[${ciLoPct.toFixed(1)} %, ${ciHiPct.toFixed(1)} %]`;
  }
  document.getElementById("rc-cut").addEventListener("input", e => {
    rc.cut = +e.target.value;
    rc_refresh();
  });
  rc_refresh();

  // ------------------------------------------------------------------
  // TAB 3 — Simulator.
  //   τ(d) = A · exp(−k · d) · 1{d ≤ dt}
  //   Generate n units with d ~ Uniform(0, 1.5), Δy_i = τ(d_i) + σ·ε_i.
  //   Parametric ring DiD at cut d̄: τ̂ = mean(Δy_i | d_i ≤ d̄) − mean(Δy_i | d_i > d̄).
  // ------------------------------------------------------------------
  const sm = {
    A: 1.50, k: 2.30, dt: 0.75, cut: 0.75, n: 300, sigma: 0.20, seed: 42,
    chart: CHARTS.simulator_curve(document.getElementById("sm-curve")),
    hist:  CHARTS.tauhat_histogram(document.getElementById("sm-hist")),
  };

  function truth_avg_in_ring(A, k, dt, cut) {
    // True average τ over distances d in [0, min(cut, dt)] is integral / cut
    // (since outside dt, τ = 0, but inner ring includes them with weight 1).
    // For a uniform draw on [0, 1.5], the average τ among units with d ≤ cut
    // is (1/cut) · integral_0^cut τ(d) dd = (1/cut) · integral_0^min(cut,dt) A·exp(-k·d) dd
    //   = (A / (k·cut)) · (1 - exp(-k · min(cut, dt)))
    const u = Math.min(cut, dt);
    if (cut <= 0) return 0;
    return (A / (k * cut)) * (1 - Math.exp(-k * u));
  }

  function simulate_once(seed) {
    const rng = makeRng(seed);
    const n = sm.n;
    let sum_in = 0, n_in = 0, sum_out = 0, n_out = 0;
    let sum_in_sq = 0, sum_out_sq = 0;
    for (let i = 0; i < n; i++) {
      const d = rng() * 1.5;
      const tau = (d <= sm.dt) ? sm.A * Math.exp(-sm.k * d) : 0;
      const dy = tau + sm.sigma * boxMuller(rng);
      if (d <= sm.cut) { sum_in  += dy; n_in  += 1; sum_in_sq  += dy * dy; }
      else             { sum_out += dy; n_out += 1; sum_out_sq += dy * dy; }
    }
    const mean_in  = n_in  > 0 ? sum_in  / n_in  : 0;
    const mean_out = n_out > 0 ? sum_out / n_out : 0;
    const var_in  = n_in  > 1 ? (sum_in_sq  - n_in  * mean_in  * mean_in)  / (n_in  - 1) : 0;
    const var_out = n_out > 1 ? (sum_out_sq - n_out * mean_out * mean_out) / (n_out - 1) : 0;
    const tauhat = mean_in - mean_out;
    const se = Math.sqrt(Math.max(0, var_in / Math.max(1, n_in) + var_out / Math.max(1, n_out)));
    return { tauhat, se, n_in, n_out };
  }

  function sm_refresh() {
    document.getElementById("sm-a-val").textContent  = sm.A.toFixed(2);
    document.getElementById("sm-k-val").textContent  = sm.k.toFixed(2);
    document.getElementById("sm-dt-val").textContent = sm.dt.toFixed(2);
    document.getElementById("sm-cut-val").textContent = sm.cut.toFixed(2);
    document.getElementById("sm-n-val").textContent  = sm.n;
    document.getElementById("sm-sig-val").textContent = sm.sigma.toFixed(2);

    const truth = truth_avg_in_ring(sm.A, sm.k, sm.dt, sm.cut);
    const fit = simulate_once(sm.seed);
    sm.chart.update({
      A: sm.A, k: sm.k, dt: sm.dt, cut: sm.cut,
      truth_avg: truth, tauhat: fit.tauhat, n: sm.n, sigma: sm.sigma,
    });
    document.getElementById("sm-truth").textContent  = truth.toFixed(3);
    document.getElementById("sm-tauhat").textContent = fit.tauhat.toFixed(3);
    document.getElementById("sm-se").textContent     = fit.se.toFixed(4);
    document.getElementById("sm-bias").textContent   = (fit.tauhat - truth).toFixed(3);
  }
  const sm_refresh_d = debounce(sm_refresh, 100);
  document.getElementById("sm-a").addEventListener("input",  e => { sm.A     = +e.target.value; sm_refresh_d(); });
  document.getElementById("sm-k").addEventListener("input",  e => { sm.k     = +e.target.value; sm_refresh_d(); });
  document.getElementById("sm-dt").addEventListener("input", e => { sm.dt    = +e.target.value; sm_refresh_d(); });
  document.getElementById("sm-cut").addEventListener("input",e => { sm.cut   = +e.target.value; sm_refresh_d(); });
  document.getElementById("sm-n").addEventListener("input",  e => { sm.n     = +e.target.value; sm_refresh_d(); });
  document.getElementById("sm-sig").addEventListener("input",e => { sm.sigma = +e.target.value; sm_refresh_d(); });

  document.getElementById("sm-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sm-progress > div");
    const progLabel = document.getElementById("sm-progress-label");
    const histEl = document.getElementById("sm-hist");
    const histStats = document.getElementById("sm-hist-stats");
    const truth = truth_avg_in_ring(sm.A, sm.k, sm.dt, sm.cut);
    const N_SIMS = 100;
    const taus = [];
    let i = 0;
    function step() {
      const batch = 4;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const fit = simulate_once(sm.seed + i + 1);
        if (Number.isFinite(fit.tauhat)) taus.push(fit.tauhat);
      }
      progBar.style.width = (i / N_SIMS * 100) + "%";
      progLabel.textContent = `simulation ${i} / ${N_SIMS}`;
      if (i < N_SIMS) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = `done (${N_SIMS} simulations)`;
        histEl.style.display = "block";
        histStats.style.display = "grid";
        sm.hist.update({ taus, truth, cut: sm.cut, dt: sm.dt });
        document.getElementById("sm-mean").textContent = (d3.mean(taus) ?? 0).toFixed(3);
        document.getElementById("sm-sd").textContent   = (d3.deviation(taus) ?? 0).toFixed(3);
        document.getElementById("sm-hist-truth").textContent = truth.toFixed(3);
        btn.disabled = false;
      }
    }
    step();
  });

  sm_refresh();

  // ------------------------------------------------------------------
  // TAB 4 — Forest plot + binsreg step curve.
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
    bins:  CHARTS.binsreg_step(document.getElementById("fp-bins")),
    data: null,
  };
  function fp_refresh() {
    if (!fp.data) return;
    const methods = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods);
  }
  document.querySelectorAll("#fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });
  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
    if (data.rings_lr_curve) fp.bins.update(data.rings_lr_curve);
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // Global error handler
  window.addEventListener("error", function (e) {
    console.error("[ring-did app] uncaught error:", e.error);
  });
})();
