// app.js — interactive companion to the r_did2 post.
// Wires DOM controls to CHARTS modules. Runs after window.CHARTS, window.DGP,
// and window.LASSO are defined.

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

  // ---- TAB 1: Parallel-trends animation -------------------------------------
  if (window.CHARTS && typeof CHARTS.parallel_trends_animation === "function") {
    CHARTS.parallel_trends_animation(document.getElementById("intro-anim"));
  }

  // ---- TAB 2: Weighting simulator -------------------------------------------
  (function () {
    const elU   = document.getElementById("dgp-eff-urban");
    const elR   = document.getElementById("dgp-eff-rural");
    const elS   = document.getElementById("dgp-share");
    const elP   = document.getElementById("dgp-popratio");
    if (!elU) return; // tab not present
    const elUV  = document.getElementById("dgp-eff-urban-val");
    const elRV  = document.getElementById("dgp-eff-rural-val");
    const elSV  = document.getElementById("dgp-share-val");
    const elPV  = document.getElementById("dgp-popratio-val");
    const elAU  = document.getElementById("dgp-att-unw");
    const elAW  = document.getElementById("dgp-att-wt");
    const elGap = document.getElementById("dgp-gap");
    const elFlip= document.getElementById("dgp-flip");

    const chart = CHARTS.did_dgp_chart(document.getElementById("dgp-trajectories"));

    // Simulate two cohorts (large-urban, small-rural) sharing a linear pre-trend.
    // Both cohorts get the same trend; only the post-period jump differs.
    // The control group is shared across both (parallel trend, no jump).
    function rebuild() {
      const effU = +elU.value;
      const effR = +elR.value;
      const share = +elS.value;          // urban share of counties
      const ratio = +elP.value;          // pop ratio urban/rural

      elUV.textContent = (effU >= 0 ? "+" : "") + effU.toFixed(1);
      elRV.textContent = (effR >= 0 ? "+" : "") + effR.toFixed(1);
      elSV.textContent = share.toFixed(2);
      elPV.textContent = ratio.toFixed(0);

      // Build a small deterministic county-level cohort.
      // Treated counties: share*N urban, (1-share)*N rural.
      // Control counties: same shape, no jump.
      const years = d3.range(-5, 6); // -5..+5
      const T0Idx = 5;

      const baseTreatedUrban = 320;
      const baseTreatedRural = 470;
      const baseControlUrban = 365;
      const baseControlRural = 480;
      const slope = 6;

      // Per-cohort treated mean trajectory.
      function trajT(base, eff) {
        return years.map((e, i) => base + slope * e + (i >= T0Idx ? eff : 0));
      }
      function trajC(base) {
        return years.map((e, i) => base + slope * e);
      }

      const tu = trajT(baseTreatedUrban, effU);  // treated urban
      const tr = trajT(baseTreatedRural, effR);  // treated rural
      const cu = trajC(baseControlUrban);
      const cr = trajC(baseControlRural);

      // Unweighted: equal-weight each cohort.
      // Weighted: urban (large pop) dominates by `ratio`.
      const nCohortU = share;
      const nCohortR = 1 - share;
      const popU = ratio;
      const popR = 1;

      function wmean(vU, vR, wU, wR) {
        return vU.map((u, i) => (wU * u + wR * vR[i]) / (wU + wR));
      }

      const treatUnw = wmean(tu, tr, nCohortU, nCohortR);
      const ctrlUnw  = wmean(cu, cr, nCohortU, nCohortR);
      const wU = nCohortU * popU;
      const wR = nCohortR * popR;
      const treatWt  = wmean(tu, tr, wU, wR);
      const ctrlWt   = wmean(cu, cr, wU, wR);

      chart.update({ years, treat_unw: treatUnw, ctrl_unw: ctrlUnw, treat_wt: treatWt, ctrl_wt: ctrlWt });

      // ATT computations (use cell-means DiD on e = -1 vs e = +5).
      const ePreIdx = 4;  // e = -1
      const ePostIdx = 10; // e = +5
      function attFor(treat, ctrl) {
        const tPre = treat[ePreIdx];
        const tPost = treat[ePostIdx];
        const cPre = ctrl[ePreIdx];
        const cPost = ctrl[ePostIdx];
        return (tPost - tPre) - (cPost - cPre);
      }
      const attUnw = attFor(treatUnw, ctrlUnw);
      const attWt  = attFor(treatWt, ctrlWt);
      const gap = Math.abs(attUnw - attWt);
      const flip = (Math.sign(attUnw) !== Math.sign(attWt) && Math.abs(attUnw) > 0.01 && Math.abs(attWt) > 0.01);

      elAU.textContent = (attUnw >= 0 ? "+" : "") + attUnw.toFixed(2);
      elAW.textContent = (attWt  >= 0 ? "+" : "") + attWt.toFixed(2);
      elGap.textContent = gap.toFixed(2);
      elFlip.textContent = flip ? "yes — opposite signs" : "no";
      elFlip.style.color = flip ? "#d97757" : "#8b9dc3";
    }

    [elU, elR, elS, elP].forEach(el => el.addEventListener("input", rebuild));
    rebuild();
  })();

  // ---- Data loader: results.json --------------------------------------------
  let APP_DATA = null;
  function loadData(cb) {
    if (APP_DATA) return cb(APP_DATA);
    fetch("data/results.json")
      .then(r => r.json())
      .then(j => { APP_DATA = j; cb(j); })
      .catch(err => {
        console.error("[r_did2 app] failed to load results.json:", err);
        const el = document.getElementById("fp-chart");
        if (el) el.innerHTML = `<div class="note" style="padding:18px;">Could not load data/results.json: ${err.message}</div>`;
      });
  }

  // ---- TAB 3: Forest plot ----------------------------------------------------
  (function () {
    const container = document.getElementById("fp-chart");
    if (!container) return;
    const methodsRoot = document.getElementById("fp-methods");
    const weightsRoot = document.getElementById("fp-weights");
    const chart = CHARTS.did_forest(container);

    function activeMethods() {
      return Array.from(methodsRoot.querySelectorAll("input:checked")).map(i => i.value);
    }
    function activeWeights() {
      return Array.from(weightsRoot.querySelectorAll("input:checked")).map(i => i.value);
    }

    function redraw() {
      loadData(data => {
        chart.update(data.estimates, activeMethods(), activeWeights());
      });
    }
    methodsRoot.addEventListener("change", redraw);
    weightsRoot.addEventListener("change", redraw);
    redraw();
  })();

  // ---- TAB 4: Event study ----------------------------------------------------
  (function () {
    const container = document.getElementById("ev-chart");
    if (!container) return;
    const root = document.getElementById("ev-toggle");
    const chart = CHARTS.event_study_chart(container);

    function flags() {
      const checked = Array.from(root.querySelectorAll("input:checked")).map(i => i.value);
      return { unw: checked.includes("unweighted"), wt: checked.includes("weighted") };
    }

    function redraw() {
      loadData(data => {
        const f = flags();
        chart.update(data.event_study, f.unw, f.wt);
      });
    }
    root.addEventListener("change", redraw);
    redraw();
  })();

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[r_did2 app] uncaught error:", e.error);
  });
})();
