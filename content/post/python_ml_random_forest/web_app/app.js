/* app.js — controller for the Random Forest + Cross-Validation lab.
   Loads data/results.json, wires the tabs and controls, and (re)draws charts. */

(function () {
  "use strict";

  let DATA = null;       // parsed results.json
  let cvRound = 1;       // active round in the fold diagram (0 = all)
  let pfMetric = "r2";   // active per-fold metric
  let oofView = "scatter";
  let oofFolds = new Set([1, 2, 3, 4, 5]);
  let fiMethod = "permutation";

  /* ---------- tab switching ---------- */
  function activateTab(paneId) {
    document.querySelectorAll(".tab").forEach(b => {
      const on = b.dataset.pane === paneId;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".tab-pane").forEach(p =>
      p.classList.toggle("active", p.id === paneId));
    renderActive(paneId);
  }
  function wireTabs() {
    document.querySelectorAll(".tab").forEach(b =>
      b.addEventListener("click", () => activateTab(b.dataset.pane)));
    document.querySelectorAll(".cta-card[data-goto]").forEach(c =>
      c.addEventListener("click", () => activateTab(c.dataset.goto)));
  }

  /* ---------- per-tab renderers ---------- */
  function renderCV() {
    cvFoldDiagram("cv-folds", cvRound, DATA.model_summary);
    const cap = document.getElementById("cv-folds-caption");
    if (cap) {
      cap.textContent = cvRound === 0
        ? "All five rounds: each fold (column) is the test set exactly once — read down the orange diagonal."
        : `Round ${cvRound}: Fold ${cvRound} is held out for testing; Folds ` +
          [1, 2, 3, 4, 5].filter(f => f !== cvRound).join(", ") + " train the model.";
    }
  }
  function renderFolds() {
    perFoldBars("pf-chart", DATA.fold_metrics, pfMetric, DATA.model_summary);
    const s = DATA.model_summary, dec = pfMetric === "r2" ? 3 : 2;
    const vals = DATA.fold_metrics.map(f => ({ fold: f.fold, v: f[pfMetric] }));
    const lo = vals.reduce((a, b) => b.v < a.v ? b : a);
    const hi = vals.reduce((a, b) => b.v > a.v ? b : a);
    const label = { r2: "R²", rmse: "RMSE", mae: "MAE" }[pfMetric];
    setText("pf-mean", s["mean_" + pfMetric].toFixed(dec));
    setText("pf-metric-label", label);
    setText("pf-sd", "±" + s["std_" + pfMetric].toFixed(dec));
    setText("pf-min", lo.v.toFixed(dec));
    setText("pf-min-sub", "Fold " + lo.fold);
    setText("pf-max", hi.v.toFixed(dec));
    setText("pf-max-sub", "Fold " + hi.fold);
  }
  function renderOOF() {
    if (oofView === "scatter") {
      oofScatter("oof-chart", DATA.oof, oofFolds, DATA.model_summary);
    } else {
      distOverlay("oof-chart", DATA.oof, DATA.model_summary);
    }
    const w = document.getElementById("oof-fold-filter-wrap");
    if (w) w.style.display = oofView === "scatter" ? "block" : "none";
    const s = DATA.model_summary;
    setText("oof-r2", s.pooled_r2.toFixed(3));
    setText("oof-err", `${s.pooled_rmse.toFixed(2)} / ${s.pooled_mae.toFixed(2)}`);
    setText("oof-sd", `${s.pred_std.toFixed(2)} vs ${s.target_std.toFixed(2)}`);
    setText("oof-sd-sub", `${s.std_shrinkage_pct.toFixed(0)}% narrower`);
    setText("oof-ks", `D = ${s.ks_stat.toFixed(3)}`);
  }
  function renderImp() {
    const items = DATA.importance[fiMethod];
    const color = fiMethod === "permutation" ? COL.orange : COL.steel;
    const xlabel = fiMethod === "permutation"
      ? "Mean decrease in R² (permutation)" : "Mean decrease in impurity (MDI)";
    importanceBars("fi-chart", items, color, xlabel);
    tuningBars("tuning-chart", DATA.tuning);
  }
  function renderActive(paneId) {
    const id = paneId || document.querySelector(".tab-pane.active").id;
    if (id === "pane-cv") renderCV();
    else if (id === "pane-folds") renderFolds();
    else if (id === "pane-oof") renderOOF();
    else if (id === "pane-imp") renderImp();
  }

  /* ---------- controls ---------- */
  function buildCvRoundButtons() {
    const wrap = document.getElementById("cv-round-buttons");
    if (!wrap) return;
    const opts = [];
    for (let r = 1; r <= DATA.model_summary.n_folds; r++) opts.push({ v: r, label: "Round " + r });
    opts.push({ v: 0, label: "All rounds" });
    opts.forEach(o => {
      const b = document.createElement("button");
      b.className = "action secondary";
      b.textContent = o.label;
      b.addEventListener("click", () => {
        cvRound = o.v;
        wrap.querySelectorAll("button").forEach(x => x.classList.remove("active-round"));
        b.classList.add("active-round");
        renderCV();
      });
      if (o.v === cvRound) b.classList.add("active-round");
      wrap.appendChild(b);
    });
  }
  function buildOofFoldFilter() {
    const wrap = document.getElementById("oof-folds");
    if (!wrap) return;
    for (let f = 1; f <= DATA.model_summary.n_folds; f++) {
      const lab = document.createElement("label");
      lab.innerHTML = `<input type="checkbox" value="${f}" checked> Fold ${f}`;
      lab.querySelector("input").addEventListener("change", (e) => {
        const v = +e.target.value;
        if (e.target.checked) oofFolds.add(v); else oofFolds.delete(v);
        if (oofFolds.size === 0) { oofFolds.add(v); e.target.checked = true; }
        renderOOF();
      });
      wrap.appendChild(lab);
    }
  }
  function wireRadios() {
    document.querySelectorAll('#pf-metric input').forEach(i =>
      i.addEventListener("change", () => { pfMetric = i.value; if (i.checked) renderFolds(); }));
    document.querySelectorAll('#oof-view input').forEach(i =>
      i.addEventListener("change", () => { if (i.checked) { oofView = i.value; renderOOF(); } }));
    document.querySelectorAll('#fi-method input').forEach(i =>
      i.addEventListener("change", () => { if (i.checked) { fiMethod = i.value; renderImp(); } }));
  }

  /* ---------- helpers ---------- */
  function setText(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; }
  function fillHeadline() {
    const s = DATA.model_summary;
    setText("cv-nobs", s.n_obs);
    setText("cv-pooled", s.pooled_r2.toFixed(3));
    setText("cv-spread", `${s.mean_r2.toFixed(3)} ± ${s.std_r2.toFixed(3)}`);
  }

  let resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderActive(), 150);
  }

  /* ---------- boot ---------- */
  d3.json("data/results.json").then(data => {
    DATA = data;
    fillHeadline();
    buildCvRoundButtons();
    buildOofFoldFilter();
    wireTabs();
    wireRadios();
    window.addEventListener("resize", onResize);
    const valid = ["pane-cv", "pane-folds", "pane-oof", "pane-imp"];
    const fromHash = (location.hash || "").replace("#", "");
    activateTab(valid.includes(fromHash) ? fromHash : "pane-cv");
  }).catch(err => {
    const main = document.querySelector("main");
    if (main) {
      const d = document.createElement("div");
      d.className = "card";
      d.innerHTML = "<h3>Could not load data</h3><p class='note'>" +
        "results.json failed to load (" + err + "). If you opened this file directly " +
        "(file://), serve the folder over HTTP instead.</p>";
      main.prepend(d);
    }
  });
})();
