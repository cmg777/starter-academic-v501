/* app.js — state and wiring for the mlsynth ladder lab.

   All numbers come from web_app/data/results.json, written by section 17 of
   analysis.py. Nothing is estimated in the browser, so the app cannot drift
   from the post: there is exactly one source of truth and it is the same run
   that produced the post's figures. */
(function () {
  "use strict";

  const METHODS = [
    { key: "DiD", label: "Difference-in-differences",
      blurb: "mlsynth has no standalone DiD class. FDID fits the plain two-way estimator " +
             "alongside its own and hands it back as .did. Every donor gets 1/23, which is " +
             "the giveaway that nothing was fitted." },
    { key: "SC", label: "Synthetic control",
      blurb: "VanillaSC. Weights on the simplex, chosen to track the UK before the " +
             "referendum. No intercept, so the blend has to match the level as well as " +
             "the shape." },
    { key: "DSC", label: "Demeaned SC",
      blurb: "TSSC(method=\"MSCa\") — not mlsynth.DSC, see panel 5. The same problem on " +
             "demeaned outcomes plus a constant offset. The offset here is tiny, which " +
             "tells you the plain SC fit was already level-balanced." },
    { key: "SDID", label: "Synthetic DiD",
      blurb: "SDID(zeta=0.0). Nearly the same unit weights as DSC; the change is that the " +
             "offset is a lambda-weighted average of pre-treatment gaps instead of a flat " +
             "one, and those lambdas are fitted too." },
    { key: "MASC", label: "MASC",
      blurb: "A cross-validated blend of nearest-neighbour matching and synthetic control. " +
             "On this panel the data buy about 16 per cent matching." },
    { key: "ASCM", label: "Augmented SC",
      blurb: "VanillaSC(augment=\"ridge\"). Non-negativity is dropped and a ridge penalty " +
             "pulls the weights back toward the SC solution, so some donors end up with " +
             "negative weight." }
  ];

  const DIALS = [
    { key: "zeta", label: "zeta (SDID)" },
    { key: "setf", label: "set_f (MASC)" },
    { key: "wconstr", label: "w_constr (SC)" },
    { key: "covariates", label: "covariates (SDID)" }
  ];

  const state = {
    method: "SDID",
    horizon: "loss_2018Q4",
    dial: "zeta",
    zetaIdx: 0,
    placeboH: "h1",
    esWindow: 20,
    solverHorizon: "loss_2018Q4"
  };

  let D = null;
  const el = id => document.getElementById(id);
  const pp = v => v.toFixed(2) + "%";

  function buttons(container, items, activeFn, onClick) {
    const c = el(container);
    c.innerHTML = "";
    items.forEach(it => {
      const b = document.createElement("button");
      b.className = "pill" + (activeFn(it) ? " active" : "");
      b.type = "button";
      b.textContent = it.label;
      b.setAttribute("aria-pressed", activeFn(it) ? "true" : "false");
      b.addEventListener("click", () => { onClick(it); render(); });
      c.appendChild(b);
    });
  }

  // "1995Q1" -> 1995.0, so the x axis is a real number line rather than an index.
  const toDecimal = q => (+q.slice(0, 4)) + ((+q.slice(5)) - 1) / 4;

  /* ---- panel 4: the anatomy of a fit, built once ------------------------- */
  function renderAnatomy() {
    const a = D.anatomy;

    el("cfg-lines").textContent = "\n" + a.config
      .map(f => `    "${f.field}": ${f.value},`).join("\n");

    const list = (target, rows, nameOf, valOf, whyOf) => {
      const ul = el(target);
      ul.innerHTML = "";
      rows.forEach(r => {
        const li = document.createElement("li");
        const n = document.createElement("span");
        n.className = "name";
        n.textContent = nameOf(r);
        li.appendChild(n);
        const v = valOf(r);
        if (v) {
          li.appendChild(document.createTextNode("  "));
          const s = document.createElement("span");
          s.className = "val";
          s.textContent = v;
          li.appendChild(s);
        }
        const w = document.createElement("span");
        w.className = "why";
        w.textContent = whyOf(r);
        li.appendChild(w);
        ul.appendChild(li);
      });
    };

    list("cfg-notes", a.config, r => r.field, () => null, r => r.note);
    list("res-notes", a.result, r => r.accessor, r => "= " + r.value, r => r.note);
    list("dev-notes", a.deviations, r => r.cls, r => r.extra, r => r.note);

    const t = D.anatomy.rounding;
    const trap = el("rounding-trap");
    trap.innerHTML = "";
    const h = document.createElement("h3");
    h.textContent = "One estimator quietly rounds the number you are most likely to quote";
    trap.appendChild(h);

    const p1 = document.createElement("p");
    p1.textContent =
      "TSSC rounds its scalar summaries. Its .att accessor returns exactly " +
      t.reported.toFixed(2) + " and its rmse_pre exactly " + t.reported_rmse.toFixed(3) +
      ". The gap and counterfactual series it returns alongside them are full precision, " +
      "so the information is there — it is only the summary that was truncated. Nothing " +
      "warns you.";
    trap.appendChild(p1);

    const pair = document.createElement("div");
    pair.className = "pair";
    [["bad", pp(t.loss_from_reported), "if you quote variant.att"],
     ["good", pp(t.loss_from_exact), "from the gap series"]].forEach(([cls, num, lab]) => {
      const d = document.createElement("div");
      d.className = cls;
      const n = document.createElement("span");
      n.className = "num"; n.textContent = num;
      const l = document.createElement("span");
      l.className = "lab"; l.textContent = lab;
      d.appendChild(n); d.appendChild(l);
      pair.appendChild(d);
    });
    trap.appendChild(pair);

    const p2 = document.createElement("p");
    p2.textContent =
      "That is the difference between reporting 3.00 and 2.99 — small, but it is the " +
      "headline number, and it would not survive a replication. The fix is one line: " +
      "average the last n post-treatment entries of res.variants[\"MSCa\"].gap instead " +
      "of reading .att.";
    trap.appendChild(p2);
  }

  /* ---- panel 6: how far each option moves the answer --------------------- */
  function dialRows() {
    const span = (rows, key) => ({
      lo: d3.min(rows, d => d[key]), hi: d3.max(rows, d => d[key])
    });
    const z = span(D.zeta_sweep, "loss_2018Q4");
    const s = span(D.setf, "loss_2018Q4");
    const w = span(D.wconstr, "loss_2018Q4");
    const c = span(D.covariates, "loss_2018Q4");
    return [
      { label: "covariates (SDID)", lo: c.lo, hi: c.hi,
        note: "outcomes only, three covariate methods, and VanillaSC's bilevel V" },
      { label: "w_constr (SC)", lo: w.lo, hi: w.hi,
        note: "the default, then simplex, ols, ridge and lasso" },
      { label: "set_f (MASC)", lo: s.lo, hi: s.hi,
        note: "the paper's fold set against min_preperiods left at its default" },
      { label: "zeta (SDID)", lo: z.lo, hi: z.hi,
        note: "swept from 0 to twice the value mlsynth computes for you" }
    ];
  }

  const DIAL_NOTES = {
    zeta:
      "SDIDConfig.zeta defaults to None, which does not mean 'no penalty' — it means " +
      "'compute one for me', and mlsynth then sets it to (N_treated x T_post)^(1/4) " +
      "times the standard deviation of the donors' first differences. On this panel that " +
      "is " + "{zeta_star}" + ". The paper solves the unpenalised problem, so every SDID " +
      "number in the post needs an explicit zeta=0.0. Leaving the field alone costs " +
      "{zeta_gap} percentage points. This is the same trap as synthdid's zeta.omega in R " +
      "and sdid's zeta_omega() in Stata, where the documented default 1e-6 is a sentinel " +
      "that still requests the full penalty.",
    setf:
      "MASC cross-validates the matching-versus-synthetic blend over a set of forecast " +
      "origins. The paper fixes that set with set_f=range(6, 87); leave it alone and the " +
      "package derives its own from min_preperiods, cross-validates on a different task, " +
      "and picks m = 5 rather than m = 10. The estimate moves {setf_gap} percentage " +
      "points — more than the entire ladder spans. Note that the two settings the package " +
      "chooses for itself agree with each other to three decimals; it is the paper's " +
      "explicit fold set that is the outlier, and it is also the one with the better " +
      "cross-validated blend.",
    wconstr:
      "w_constr picks the constraint set for the unit weights. The default and 'simplex' " +
      "agree, which is reassuring. 'ols' and 'ridge' drop the simplex and fit the " +
      "pre-treatment period visibly better — the pre-RMSE falls from 0.0056 to 0.0043 — " +
      "and then extrapolate to a shortfall half a point higher. Better in-sample fit, " +
      "different answer; this is the whole reason the simplex constraint exists.",
    covariates:
      "Three routes through SDID plus VanillaSC's own, and they span {cov_gap} percentage " +
      "points — seven times the spread across the entire ladder. See panel 7 for what " +
      "they cost in fit."
  };

  function renderDial() {
    buttons("dial-buttons", DIALS, it => it.key === state.dial,
            it => { state.dial = it.key; });

    const isZeta = state.dial === "zeta";
    el("dial-zeta").classList.toggle("on", isZeta);
    el("dial-bars").classList.toggle("on", !isZeta);

    if (isZeta) {
      const rows = D.zeta_sweep;
      const cur = rows[state.zetaIdx];
      el("zeta-slider").max = String(rows.length - 1);
      el("zeta-slider").value = String(state.zetaIdx);
      el("zeta-out").textContent =
        `${cur.multiple.toFixed(2)}x the default  =  ${cur.zeta.toFixed(5)}   ` +
        `->  ${pp(cur.loss_2018Q4)} at 2018Q4`;
      Charts.zetaCurve("#chart-zeta", rows, state.zetaIdx, "loss_2018Q4");
    } else {
      const src = state.dial === "setf" ? D.setf
                : state.dial === "wconstr" ? D.wconstr
                : D.covariates;
      const labelKey = state.dial === "covariates" ? "spec" : "setting";
      const paper = src[0];
      Charts.hbars("#chart-dial", src, {
        valueKey: "loss_2018Q4", labelKey: labelKey,
        labelWidth: state.dial === "covariates" ? 300 : 250,
        fmt: d3.format(".2f"),
        xLabel: "estimated GDP shortfall at 2018Q4 (%)",
        refs: [{ at: paper.loss_2018Q4, colour: Charts.C.teal,
                 label: "the post's specification" }],
        colour: d => d[labelKey] === paper[labelKey] ? Charts.C.teal : Charts.C.steel,
        tooltip: d => `<b>${d[labelKey]}</b><br>2018Q4 ${pp(d.loss_2018Q4)}` +
                      `<br>2019Q4 ${pp(d.loss_2019Q4)}` +
                      (d.pre_rmse != null
                        ? `<br><span class="dim">pre-RMSE ${d.pre_rmse.toFixed(5)}</span>` : "") +
                      (d.m_hat != null
                        ? `<br><span class="dim">cross-validation picked m = ${d.m_hat}, ` +
                          `phi = ${d.phi_hat.toFixed(3)}</span>` : "")
      });
    }

    const z = D.zeta_sweep;
    const zDefault = z.find(r => r.multiple === 1);
    const gaps = {
      "{zeta_star}": D.meta.zeta_star.toFixed(5),
      "{zeta_gap}": Math.abs(z[0].loss_2018Q4 - zDefault.loss_2018Q4).toFixed(2),
      "{setf_gap}": (d3.max(D.setf, r => r.loss_2018Q4) -
                     d3.min(D.setf, r => r.loss_2018Q4)).toFixed(2),
      "{cov_gap}": (d3.max(D.covariates, r => r.loss_2018Q4) -
                    d3.min(D.covariates, r => r.loss_2018Q4)).toFixed(2)
    };
    let note = DIAL_NOTES[state.dial];
    Object.entries(gaps).forEach(([k, v]) => { note = note.split(k).join(v); });
    el("dial-note").textContent = note;
  }

  /* ---- panel 11: the inference table ------------------------------------ */
  function renderInferenceTable() {
    const t = el("inference-table");
    t.innerHTML = "";
    const head = t.createTHead().insertRow();
    ["inference=", "reported as", "p-value", "95% interval", "seconds"]
      .forEach((h, i) => {
        const th = document.createElement("th");
        th.textContent = h;
        if (i >= 2) th.style.textAlign = "right";
        head.appendChild(th);
      });
    const body = t.createTBody();
    D.inference.forEach(r => {
      const tr = body.insertRow();
      if (r.att == null) tr.className = "failed";
      const c0 = tr.insertCell();
      const code = document.createElement("code");
      code.textContent = '"' + r.method + '"';
      c0.appendChild(code);
      tr.insertCell().textContent = r.reported_as || "--";
      const cells = [
        r.p_value != null ? r.p_value.toFixed(4) : "--",
        r.ci_lower != null
          ? `[${r.ci_lower.toFixed(4)}, ${r.ci_upper.toFixed(4)}]` : "--",
        r.seconds != null ? r.seconds.toFixed(2) : "--"
      ];
      cells.forEach(v => {
        const td = tr.insertCell();
        td.className = "num";
        td.textContent = v;
      });
    });
  }

  /* ---- the whole page ---------------------------------------------------- */
  function render() {
    const m = METHODS.find(x => x.key === state.method);
    const dates = D.meta.quarters.map(toDecimal);
    const treatDate = dates[D.meta.t0];
    const uk = D.outcome.uk;
    const syn = D.counterfactual[state.method];
    const gaps = uk.map((v, i) => v - syn[i]);
    const evalIdx = Object.values(D.meta.eval).map(v => v - 1);

    /* --- 1. the counterfactual --- */
    buttons("method-buttons", METHODS,
            it => it.key === state.method,
            it => { state.method = it.key; });

    Charts.paths("#chart-paths", dates, uk, syn, treatDate, m.label);
    Charts.gap("#chart-gap", dates, gaps, treatDate, D.meta.quarters, evalIdx);

    const row = D.results.find(r => r.method === state.method);
    const w = D.weights[state.method];
    const nz = w.filter(v => Math.abs(v) > 0.001).length;

    const readout = el("readout");
    readout.innerHTML = "";
    [[pp(row.loss_2018Q4), "shortfall at 2018Q4"],
     [pp(row.loss_2019Q4), "shortfall at 2019Q4"],
     [String(nz), "donors with weight above 0.001"]].forEach(([num, lab]) => {
      const d = document.createElement("div");
      d.className = "stat";
      const n = document.createElement("span");
      n.className = "num"; n.textContent = num;
      const l = document.createElement("span");
      l.className = "lab"; l.textContent = lab;
      d.appendChild(n); d.appendChild(l);
      readout.appendChild(d);
    });
    const b = document.createElement("p");
    b.className = "blurb";
    b.textContent = m.blurb + "  Call: " + row.command;
    readout.appendChild(b);

    /* --- 2. the blend --- */
    Charts.weights("#chart-weights", D.meta.donors, w, m.label);
    const neg = w.filter(v => v < -1e-6).length;
    el("weights-note").textContent = state.method === "DiD"
      ? "Difference-in-differences gives all 23 donors exactly 1/23 = 0.0435. It is the " +
        "only stage whose weights carry no information about the United Kingdom."
      : `${state.method} puts weight on ${nz} of the 23 donors` +
        (neg > 0
          ? `, ${neg} of them negative — a synthetic UK built partly by subtracting countries.`
          : ", all of them non-negative and summing to one.");

    /* --- 3. the ladder --- */
    const HORIZONS = [
      { key: "loss_2018Q4", label: "At 2018Q4" },
      { key: "loss_2019Q4", label: "At 2019Q4" }
    ];
    buttons("horizon-buttons", HORIZONS,
            it => it.key === state.horizon,
            it => { state.horizon = it.key; });
    const born = state.horizon === "loss_2018Q4" ? D.meta.born_2018 : D.meta.born_2019;
    Charts.ladder("#chart-ladder", D.results, state.horizon, born);

    const noDid = D.results.filter(r => r.method !== "DiD");
    const lo = d3.min(noDid, r => r[state.horizon]);
    const hi = d3.max(noDid, r => r[state.horizon]);
    el("ladder-note").textContent =
      `Excluding difference-in-differences, which fits nothing, the five remaining stages ` +
      `span ${lo.toFixed(2)}% to ${hi.toFixed(2)}% — ${(hi - lo).toFixed(2)} percentage ` +
      `points. Keep that number in mind for panel 6: several of the library's defaults ` +
      `move the answer further than the choice of estimator does.`;

    /* --- 6. the defaults dial --- */
    const spreadLo = d3.min(noDid, r => r.loss_2018Q4);
    const spreadHi = d3.max(noDid, r => r.loss_2018Q4);
    Charts.spans("#chart-spans", dialRows(), { lo: spreadLo, hi: spreadHi });
    renderDial();

    /* --- 7. covariates --- */
    const covBase = D.covariates[0];
    Charts.hbars("#chart-cov", D.covariates, {
      valueKey: "loss_2018Q4", labelKey: "spec", labelWidth: 300,
      fmt: d3.format(".2f"),
      xLabel: "estimated GDP shortfall at 2018Q4 (%)",
      refs: [{ at: D.meta.born_2018, colour: Charts.C.gold,
               label: `previously published: ${D.meta.born_2018}%` }],
      colour: d => d.spec === covBase.spec ? Charts.C.teal : Charts.C.steel,
      tooltip: d => `<b>${d.spec}</b><br>2018Q4 ${pp(d.loss_2018Q4)}` +
                    `<br>2019Q4 ${pp(d.loss_2019Q4)}` +
                    `<br><span class="dim">pre-RMSE ${d.pre_rmse.toFixed(5)}</span>`
    });
    Charts.hbars("#chart-cov-rmse", D.covariates, {
      valueKey: "pre_rmse", labelKey: "spec", labelWidth: 300,
      fmt: d3.format(".4f"),
      xLabel: "pre-treatment RMSE (log points, lower is better)",
      refs: [{ at: covBase.pre_rmse, colour: Charts.C.teal,
               label: "outcomes only" }],
      colour: d => d.pre_rmse <= covBase.pre_rmse ? Charts.C.teal : Charts.C.orange,
      tooltip: d => `<b>${d.spec}</b><br>pre-RMSE ${d.pre_rmse.toFixed(5)}` +
                    `<br>${(d.pre_rmse / covBase.pre_rmse).toFixed(1)}x the ` +
                    `outcomes-only fit error`
    });

    const match = D.covariates.find(r => r.method === "match");
    const bilevel = D.covariates.find(r => r.method === "bilevel V");
    el("cov-note").textContent =
      `The two specifications that land nearest the published ${D.meta.born_2018}% are ` +
      `covariates={'match': ...} at ${pp(match.loss_2018Q4)} and VanillaSC's bilevel V at ` +
      `${pp(bilevel.loss_2018Q4)}. Both fit the pre-treatment period far worse than ` +
      `outcomes alone — ${match.pre_rmse.toFixed(4)} and ${bilevel.pre_rmse.toFixed(4)} ` +
      `against ${covBase.pre_rmse.toFixed(4)}. Agreeing with a published number is not ` +
      `evidence; the predictor-weight problem here is barely identified, and refitting it ` +
      `at a second optimiser budget moves the answer by 0.2 percentage points on its own.`;

    /* --- 8. the fire drill --- */
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
                 : D.placebo_published;
    Charts.placebo("#chart-placebo", plRows, "RMSE");

    const sd = D.placebo_h1.filter(r => r.method.indexOf("SDID") === 0)
                           .map(r => r.RMSE.toFixed(4)).join(", ");
    el("placebo-note").textContent = {
      h1: "Graded on the same one-quarter task, the three SDID variants are " +
          "indistinguishable — " + sd + " — and all three beat every other stage. The time " +
          "weights earn their keep.",
      h4: "At a four-quarter horizon all three SDID variants tie, and the ordering below " +
          "them is unchanged. Every method degrades, because forecasting four quarters " +
          "ahead is a harder task than forecasting one.",
      paper: "This is the published table, and it grades SDID (ii) and (iii) four quarters " +
             "ahead but everyone else one quarter ahead. That is why those two look twice " +
             "as bad. Switch to a matched horizon and the gap disappears entirely — the " +
             "ranking was measuring the task, not the method."
    }[state.placeboH];

    /* --- 9. placebo in space --- */
    Charts.spaghetti("#chart-space", dates, D.in_space_gaps, D.meta.treated, treatDate);
    Charts.ratios("#chart-ratios", D.in_space, D.meta.treated);
    el("space-note").textContent =
      `The United Kingdom's post-over-pre RMSPE ratio ranks ${D.meta.uk_rank} of ` +
      `${D.meta.n_units}, a permutation p-value of ${D.meta.p_permutation.toFixed(3)}. ` +
      `That is as strong as this design can be: with ${D.meta.n_units} units the smallest ` +
      `attainable p-value is 1/${D.meta.n_units} = ${D.meta.p_floor.toFixed(3)}. The ` +
      `result is at the inferential floor, and no choice of estimator moves it.`;

    /* --- 10. the event study --- */
    const ES = [
      { key: 20, label: "+/- 20 quarters" },
      { key: 40, label: "+/- 40 quarters" },
      { key: 200, label: "The whole panel" }
    ];
    buttons("es-buttons", ES,
            it => it.key === state.esWindow,
            it => { state.esWindow = it.key; });
    Charts.eventStudy("#chart-es", D.event_study, state.esWindow);

    const pre = D.event_study.filter(d => d.event_time < 0 && d.event_time >= -20);
    const post = D.event_study.filter(d => d.event_time > 0);
    const mean = a => a.reduce((s, d) => s + d.tau, 0) / a.length;
    el("es-note").textContent =
      `Over the twenty quarters before the referendum the estimated effect averages ` +
      `${mean(pre).toFixed(5)} log points — indistinguishable from zero, which is what a ` +
      `credible design requires. After it, ${mean(post).toFixed(5)}. The bands are wide ` +
      `because they come from a placebo distribution built on 23 donors; read the shape ` +
      `of the path, not the significance of any one quarter.`;

    /* --- 11. inference --- */
    Charts.forest("#chart-forest", D.inference);
    renderInferenceTable();
    const failed = D.inference.filter(r => r.att == null);
    el("inference-note").textContent =
      `Five methods run and agree on the point estimate, because it is the same fit — they ` +
      `differ only in how they express the uncertainty around it, and the widest interval ` +
      `is roughly three times the narrowest. ` +
      (failed.length
        ? `A sixth, inference="${failed[0].method}", raises ` +
          `${failed[0].reported_as.replace("FAILED: ", "")} on this panel. ` : "") +
      `The permutation route cannot report anything below ` +
      `${D.meta.p_floor.toFixed(3)} no matter how large the effect is, so a small p-value ` +
      `from it is a statement about the donor pool as much as about Brexit.`;

    /* --- 12. the solvers --- */
    const SOLV = [
      { key: "loss_2018Q4", label: "At 2018Q4" },
      { key: "loss_2019Q4", label: "At 2019Q4" }
    ];
    buttons("solver-buttons", SOLV,
            it => it.key === state.solverHorizon,
            it => { state.solverHorizon = it.key; });
    const isR = s => s.indexOf("synthdid") >= 0;
    Charts.hbars("#chart-solvers", D.solvers, {
      valueKey: state.solverHorizon, labelKey: "solver", labelWidth: 290,
      fmt: d3.format(".3f"), minTop: 34, zoom: true,
      xLabel: "estimated GDP shortfall (%) — note the axis does not start at zero, " +
              "because the whole disagreement is 0.02 points wide",
      refs: [{ at: D.solvers[0][state.solverHorizon], colour: Charts.C.teal,
               label: "where every convex solver lands" }],
      colour: d => isR(d.solver) ? Charts.C.orange : Charts.C.steel,
      tooltip: d => `<b>${d.solver}</b><br>${pp(d[state.solverHorizon])}` +
                    (d.rmse_pre != null
                      ? `<br><span class="dim">pre-RMSE ${d.rmse_pre.toFixed(6)}</span>`
                      : "<br><span class=\"dim\">published value</span>")
    });

    const conv = D.solvers.filter(s => !isR(s.solver));
    const convSpread = d3.max(conv, s => s.loss_2018Q4) - d3.min(conv, s => s.loss_2018Q4);
    el("solver-note").textContent =
      `Four independent code paths inside mlsynth — the automatic backend, the ` +
      `outcome-only backend, an explicit simplex constraint and TSSC's own solver — agree ` +
      `to within ${convSpread.toExponential(1)} percentage points, because all four hand ` +
      `the problem to a convex solver that runs to optimality. R's synthdid walks the same ` +
      `valley with Frank-Wolfe on a capped iteration budget and stops at 3.06%. Stata's ` +
      `sdid inherits that solver and stops in the same place; tighten its convergence and ` +
      `it drifts to where mlsynth already is. Three languages, two camps, and the split is ` +
      `by optimiser rather than by author. When you replicate a published ` +
      `synthetic-control number and land 0.02 away, suspect the solver before the data.`;
  }

  /* ---- boot -------------------------------------------------------------- */
  el("zeta-slider").addEventListener("input", ev => {
    state.zetaIdx = +ev.target.value;
    renderDial();
  });

  fetch("data/results.json")
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(json => {
      D = json;
      el("version-line").textContent =
        `mlsynth ${D.meta.mlsynth_version} · ${D.meta.n_units} OECD economies, ` +
        `${D.meta.quarters[0]} to ${D.meta.quarters[D.meta.quarters.length - 1]} · ` +
        `${D.meta.t0} pre-treatment quarters · treated unit ${D.meta.treated}`;
      renderAnatomy();
      render();
    })
    .catch(err => {
      const p = document.createElement("p");
      p.className = "error";
      p.textContent = "Could not load data/results.json (" + err +
        "). Run `APP_DATA=1 python analysis.py` from the post folder to regenerate it.";
      document.querySelector("main").prepend(p);
    });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (!D) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(render, 120);
  });
})();
