// app.js — wires the DOM controls in index.html to the chart builders
// for the r_sc_bayes_spatial interactive app.
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
  document.querySelectorAll("a.ts-link[data-goto]").forEach(a => {
    a.addEventListener("click", ev => {
      ev.preventDefault();
      activateTab(a.dataset.goto);
    });
  });

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ---- TAB 1 — simplex vs horseshoe animation -------------------------------
  CHARTS.simplex_vs_horseshoe(document.getElementById("intro-anim"));

  // ---- Shared data store -----------------------------------------------------
  const store = { data: null };

  // ---- TAB 2 — Donor weights -------------------------------------------------
  const dw = {
    chart: CHARTS.donor_weights(document.getElementById("dw-bars")),
    stage: "stage1",
  };

  function dw_render() {
    if (!store.data) return;
    const cap = document.getElementById("dw-caption");
    const active = document.getElementById("dw-stat-active");
    const top = document.getElementById("dw-stat-top");
    const top4 = document.getElementById("dw-stat-top4");
    const att = document.getElementById("dw-stat-att");
    if (dw.stage === "stage1") {
      const w = store.data.stage1_weights;
      dw.chart.update({
        weights: w.map(d => ({ state: d.state, weight: d.weight })),
        color: "#6a9bcc",
        showCI: false,
        ylabel: "Donor weight αⱼ (simplex)"
      });
      cap.textContent = "Stage 1: 99.8% of the mass on Utah, Nevada, Montana, Connecticut. The remaining 34 donors are essentially zero.";
      active.textContent = "4";
      top.textContent = "0.327 (Utah)";
      top4.textContent = "97.5%";
      att.textContent = "−18.46";
    } else if (dw.stage === "stage2") {
      const a = store.data.stage2_alpha;
      dw.chart.update({
        weights: a.map(d => ({ state: d.state, weight: d.mean, lo95: d.lo95, hi95: d.hi95 })),
        color: "#00d4c8",
        showCI: true,
        ylabel: "Posterior mean αⱼ (horseshoe) ± 95% CrI"
      });
      cap.textContent = "Stage 2: 23 donors carry mean posterior weight above 0.01. But only Nevada's 95% CrI excludes zero — the rest are statistically consistent with no contribution.";
      active.textContent = "23";
      top.textContent = "0.218 (Connecticut)";
      const sum4 = a.slice(0, 4).reduce((s, d) => s + d.mean, 0);
      top4.textContent = (sum4 * 100).toFixed(1) + "%";
      att.textContent = "−15.84";
    }
  }

  document.querySelectorAll("#dw-stages input[name='dw-stage']").forEach(el => {
    el.addEventListener("change", e => {
      dw.stage = e.target.value;
      dw_render();
    });
  });

  // ---- TAB 3 — Spillover & ρ -------------------------------------------------
  const sp = {
    bars: CHARTS.spillover_bars(document.getElementById("sp-bars")),
    traj: CHARTS.trajectory(document.getElementById("sp-traj")),
    rho: 0.22,
    nevExp: -3.75,
  };

  function sp_render_bars() {
    if (!store.data) return;
    sp.bars.update({ spillovers: store.data.spillovers, topN: 8 });
  }

  function sp_render_traj() {
    if (!store.data) return;
    // Construct an interpolated trajectory: at rho=0 use Stage 2 path, at rho=0.22 use Stage 3 path,
    // beyond rho=0.22 extrapolate. Each year's synthetic shifts toward (synthetic_obs - nevExp * rho_share).
    const s2 = store.data.stage2_gap;   // has gap_lo95/hi95 for the band
    const s3 = store.data.stage3_gap;
    const treatYear = 1988;

    // Map by year for fast lookup; build a single series running the full Stage 2 span
    // (with pre-period bands from gap_lo95 if available) but with a synthetic that interpolates
    // toward the SAR fit as the user moves ρ.
    const points = [];
    const s2ByYear = new Map(s2.map(d => [d.year, d]));
    const s3ByYear = new Map(s3.map(d => [d.year, d]));
    const stage1ByYear = new Map(store.data.stage1_gap.map(d => [d.year, d]));

    // For each year we want: observed (from stage 1, which has all years), and an interpolated synthetic.
    const allYears = store.data.stage1_gap.map(d => d.year);
    for (const yr of allYears) {
      const obs = stage1ByYear.get(yr).observed;
      const s2d = s2ByYear.get(yr);
      const s3d = s3ByYear.get(yr);

      // Compute baseline (rho=0 ⇒ Stage 2) and SAR (rho=0.22 ⇒ Stage 3)
      const synth0 = s2d ? s2d.synthetic : stage1ByYear.get(yr).synthetic;
      const synthSAR = s3d ? s3d.synthetic : synth0;
      // Linear interpolation: 0 at rho=0, 1 at rho=0.22
      // Beyond rho=0.22, exaggerate slightly
      const weight = Math.min(1.5, sp.rho / 0.22);

      // Nevada exposure adjustment: scale the SAR drift by user-set nevExp ratio
      const nevScale = sp.nevExp / -3.75;  // baseline is -3.75
      const synth = synth0 + weight * nevScale * (synthSAR - synth0);

      const point = { year: yr, observed: obs, synthetic: synth, period: yr < treatYear ? "pre" : "post" };
      if (s2d && s2d.gap_lo95 !== undefined) {
        point.gap_lo95 = s2d.gap_lo95;
        point.gap_hi95 = s2d.gap_hi95;
      }
      points.push(point);
    }

    sp.traj.update({
      points,
      treatYear,
      hasBand: true,
    });
  }

  function sp_render_stats() {
    if (!store.data) return;
    const r = store.data.rho_posterior;
    document.getElementById("sp-rho-mean").textContent = r.mean.toFixed(3);
    document.getElementById("sp-rho-ci").textContent =
      `[${r.q025.toFixed(3)}, ${r.q975.toFixed(3)}]`;
    document.getElementById("sp-rho-ess").textContent = r.ess.toFixed(0);
    const nv = store.data.spillovers.find(d => d.state === "Nevada");
    document.getElementById("sp-nv").textContent = nv ? nv.avg_spillover.toFixed(2) : "—";
  }

  document.getElementById("sp-rho-slider").addEventListener("input", e => {
    sp.rho = +e.target.value;
    document.getElementById("sp-rho-val").textContent = sp.rho.toFixed(2);
    sp_render_traj();
  });
  document.getElementById("sp-nev-exp").addEventListener("input", e => {
    sp.nevExp = +e.target.value;
    document.getElementById("sp-nev-exp-val").textContent = sp.nevExp.toFixed(2);
    sp_render_traj();
  });

  // ---- TAB 4 — Cross-stage forest plot --------------------------------------
  const fp = {
    chart: CHARTS.stage_forest(document.getElementById("fp-chart")),
    traj:  CHARTS.trajectory(document.getElementById("fp-traj")),
  };

  function fp_render() {
    if (!store.data) return;
    const methods = Array.from(document.querySelectorAll("#fp-methods input:checked"))
      .map(el => el.value);
    fp.chart.update(store.data.estimates, methods);
  }

  function fp_render_traj() {
    if (!store.data) return;
    const pts = store.data.stage1_gap.map(d => ({
      year: d.year, observed: d.observed, synthetic: d.synthetic
    }));
    fp.traj.update({ points: pts, treatYear: 1988, hasBand: false });
  }

  document.querySelectorAll("#fp-methods input").forEach(el => {
    el.addEventListener("change", fp_render);
  });

  // ---- Data loader -----------------------------------------------------------
  fetch("data/results.json")
    .then(r => r.json())
    .then(data => {
      store.data = data;
      dw_render();
      sp_render_bars();
      sp_render_traj();
      sp_render_stats();
      fp_render();
      fp_render_traj();
    })
    .catch(err => {
      console.error("Failed to load results.json:", err);
      document.getElementById("fp-chart").innerHTML =
        `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    });

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
