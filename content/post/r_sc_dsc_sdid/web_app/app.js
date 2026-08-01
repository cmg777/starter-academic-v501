/* app.js — state and wiring for the synthetic-control ladder lab.
   All numbers come from web_app/data/results.json, produced by analysis.R.
   Nothing is estimated in the browser. */
(function () {
  "use strict";

  const METHODS = [
    { key: "DiD",  label: "Difference-in-differences",
      blurb: "Every donor counts the same, plus a unit fixed effect. Its pre-treatment fit error is four times synthetic control's, and its answer is nearly double." },
    { key: "SC",   label: "Synthetic control",
      blurb: "Weights on the simplex, chosen to track the UK before the referendum. No intercept, so the blend must match the level as well as the shape." },
    { key: "DSC",  label: "Demeaned SC",
      blurb: "The same problem on demeaned outcomes, plus a constant offset. Here the offset is tiny, which tells you the plain SC fit was already level-balanced." },
    { key: "SDID", label: "Synthetic DiD",
      blurb: "Identical unit weights to DSC. The only change is that the offset is a lambda-weighted average of pre-treatment gaps instead of a flat one." },
    { key: "MASC", label: "MASC",
      blurb: "A cross-validated blend of ten-nearest-neighbour matching and synthetic control. The data buy about 16 per cent matching." },
    { key: "ASCM", label: "Augmented SC",
      blurb: "Non-negativity is dropped and a ridge penalty pulls the weights back toward the SC solution. Eight donors end up with negative weight." }
  ];

  const state = { method: "SDID", horizon: "loss_2018Q4", placeboH: "h1", stat: "RMSE" };
  let D = null;

  const el = id => document.getElementById(id);

  function buttons(container, items, activeFn, onClick) {
    const c = el(container);
    c.innerHTML = "";
    items.forEach(it => {
      const b = document.createElement("button");
      b.className = "pill" + (activeFn(it) ? " active" : "");
      b.textContent = it.label;
      b.setAttribute("aria-pressed", activeFn(it) ? "true" : "false");
      b.addEventListener("click", () => { onClick(it); render(); });
      c.appendChild(b);
    });
  }

  function counterfactual(key) {
    const w = D.weights[key];
    const b = D.bias_adjustment[key] || 0;
    return D.outcome.uk.map((_, t) =>
      D.outcome.donors.reduce((s, series, j) => s + w[j] * series[t], 0) + b);
  }

  function render() {
    const m = METHODS.find(x => x.key === state.method);
    const dates = D.meta.quarters.map(q => {
      const y = +q.slice(0, 4), qq = +q.slice(5);
      return y + (qq - 1) / 4;
    });
    const treatDate = dates[D.meta.t0];               // t0 pre-periods -> index t0 is the first treated
    const syn = counterfactual(state.method);
    const uk  = D.outcome.uk;
    const gaps = uk.map((v, i) => v - syn[i]);
    const evalIdx = Object.values(D.meta.eval).map(v => v - 1);

    buttons("method-buttons", METHODS,
            it => it.key === state.method,
            it => { state.method = it.key; });

    Charts.paths("#chart-paths", dates, uk, syn, treatDate, m.label);
    Charts.gap("#chart-gap", dates, gaps, treatDate, D.meta.quarters, evalIdx);

    const row = D.results.find(r =>
      r.method === m.label || r.method.replace(/ \(i\)$/, "") === state.method ||
      r.method === state.method || r.method === state.method + " (i)");
    const l18 = row ? row.loss_2018Q4 : -100 * gaps[D.meta.eval["2018Q4"] - 1];
    const l19 = row ? row.loss_2019Q4 : -100 * gaps[D.meta.eval["2019Q4"] - 1];
    const nz  = D.weights[state.method].filter(v => Math.abs(v) > 0.001).length;

    el("readout").innerHTML = `
      <div class="stat"><span class="num">${l18.toFixed(2)}%</span>
        <span class="lab">shortfall at 2018Q4</span></div>
      <div class="stat"><span class="num">${l19.toFixed(2)}%</span>
        <span class="lab">shortfall at 2019Q4</span></div>
      <div class="stat"><span class="num">${nz}</span>
        <span class="lab">donors with weight above 0.001</span></div>
      <p class="blurb">${m.blurb}</p>`;

    Charts.weights("#chart-weights", D.meta.donors, D.weights[state.method], m.label);
    Charts.lambda("#chart-lambda", D.meta.quarters.slice(0, D.meta.t0), D.lambda.i);

    const HORIZONS = [
      { key: "loss_2018Q4", label: "At 2018Q4" },
      { key: "loss_2019Q4", label: "At 2019Q4" }
    ];
    buttons("horizon-buttons", HORIZONS,
            it => it.key === state.horizon,
            it => { state.horizon = it.key; });
    const born = state.horizon === "loss_2018Q4" ? D.meta.born_2018 : D.meta.born_2019;
    const ladderRows = D.results.filter(r => r.method !== "SC (exact QP)");
    Charts.ladder("#chart-ladder", ladderRows, state.horizon, born);

    const PL = [
      { key: "h1", label: "Graded 1 quarter ahead" },
      { key: "h4", label: "Graded 4 quarters ahead" },
      { key: "paper", label: "As published (mixed horizons)" }
    ];
    buttons("placebo-buttons", PL,
            it => it.key === state.placeboH,
            it => { state.placeboH = it.key; });
    const plRows = state.placeboH === "h1" ? D.placebo_h1
                 : state.placeboH === "h4" ? D.placebo_h4
                 : D.placebo;
    Charts.placebo("#chart-placebo", plRows, state.stat);

    const notes = {
      h1: "Graded on the same one-quarter task, the three SDID variants are indistinguishable — 0.0067, 0.0066 and 0.0066 — and all three beat every other rung.",
      h4: "At a four-quarter horizon all three SDID variants tie exactly at 0.0134, and the ordering below them is unchanged.",
      paper: "This is the published table. It grades SDID (ii) and (iii) four quarters ahead but everyone else one quarter ahead, which is why those two look twice as bad. Switch to a matched horizon and the gap disappears."
    };
    el("placebo-note").textContent = notes[state.placeboH];

    Charts.solver("#chart-solver", D.solver_ladder);
  }

  fetch("data/results.json")
    .then(r => r.json())
    .then(json => { D = json; render(); })
    .catch(err => {
      const p = document.createElement("p");
      p.className = "error";
      p.textContent = "Could not load data/results.json (" + err +
        "). Run `Rscript analysis.R` from the post folder to regenerate it.";
      document.querySelector("main").prepend(p);
    });

  window.addEventListener("resize", () => { if (D) render(); });
})();
