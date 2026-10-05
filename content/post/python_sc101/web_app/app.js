// app.js: connects the controls of index.html to the chart builders of
// charts.js. It loads data/results.json, fills every number on the page from
// that file, and redraws a chart whenever a control changes. It runs after
// window.CHARTS is defined.

(function () {
  "use strict";

  const DATA_URL = "data/results.json?v=20261005";
  const CH = window.CHARTS;
  const U = CH.util;
  const C = CH.C;
  const fmt = U.fmt;
  const tipHtml = CH.tipHtml;

  // Colors of the estimator tour; Stata keeps its gold everywhere.
  const TOUR_COLORS = {
    vanillasc_adh: C.steel,
    vanillasc_outcome: C.teal,
    sdid: C.sage,
    clustersc_pcr: C.lavender,
    twfe_did: C.muted,
  };

  // Settings of every control; null cutoff means that no state is removed.
  const state = {
    M: null,
    recipeView: "all",
    pathsView: "paths",
    showStata: false,
    showAverage: false,
    cutoff: 2,
    side: "left",
    fakeYear: null,
    intimeView: "gap",
    looPick: null,
    tourOn: {},
  };

  const byId = id => document.getElementById(id);

  function setText(id, text) {
    const el = byId(id);
    if (el) el.textContent = text;
  }

  // Small DOM builder: tag, attributes, and children (strings or nodes).
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(k => {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(c => {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  // ------------------------------------------------------------------
  // Tabs: click, arrow keys, Home and End, the navigation cards of the
  // first tab, and a hash such as #tour in the address.
  // ------------------------------------------------------------------
  const tabs = Array.from(document.querySelectorAll(".tab-strip [role='tab']"));
  const panes = tabs.map(t => byId(t.getAttribute("aria-controls")));

  function activateTab(paneId, focus) {
    tabs.forEach(btn => {
      const on = btn.dataset.pane === paneId;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
      if (on && focus) btn.focus();
    });
    panes.forEach(p => {
      const on = p.id === paneId;
      p.classList.toggle("active", on);
      p.hidden = !on;
    });
    // A hidden pane has no width, so its charts are drawn once visible.
    renderPane(paneId);
  }

  function setHash(paneId) {
    try {
      history.replaceState(null, "", "#" + paneId.replace("pane-", ""));
    } catch (e) {
      // Some sandboxed viewers forbid history changes; the tabs still work.
    }
  }

  tabs.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      activateTab(btn.dataset.pane, false);
      setHash(btn.dataset.pane);
    });
    btn.addEventListener("keydown", ev => {
      let j = null;
      if (ev.key === "ArrowRight") j = (i + 1) % tabs.length;
      else if (ev.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
      else if (ev.key === "Home") j = 0;
      else if (ev.key === "End") j = tabs.length - 1;
      if (j !== null) {
        ev.preventDefault();
        activateTab(tabs[j].dataset.pane, true);
        setHash(tabs[j].dataset.pane);
      }
    });
  });

  document.querySelectorAll(".cta-card[data-goto]").forEach(card => {
    const go = () => {
      activateTab(card.dataset.goto, false);
      setHash(card.dataset.goto);
      window.scrollTo({ top: 0 });
    };
    card.addEventListener("click", go);
    card.addEventListener("keydown", ev => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        go();
      }
    });
  });

  function paneFromHash() {
    const key = (window.location.hash || "").replace("#", "");
    const id = "pane-" + key;
    return panes.some(p => p.id === id) ? id : null;
  }

  function activePane() {
    const p = panes.find(x => x.classList.contains("active"));
    return p ? p.id : "pane-intro";
  }

  // A link or an edited address such as #tour opens the matching tab.
  window.addEventListener("hashchange", () => {
    const id = paneFromHash();
    if (id && id !== activePane()) activateTab(id, false);
  });

  // ------------------------------------------------------------------
  // Numbers in the prose: every element with data-v gets its text from the
  // model, so no number in index.html is typed by hand.
  // ------------------------------------------------------------------
  function bindValues(V) {
    document.querySelectorAll("[data-v]").forEach(node => {
      const key = node.getAttribute("data-v");
      if (!(key in V)) {
        console.error("[python_sc101 web app] no value for data-v=" + key);
        return;
      }
      node.textContent = V[key];
    });
  }

  function fillTiles() {
    const M = state.M;
    const D = M.D;
    setText("tile-att", M.V.att);
    setText("tile-stata", M.V.att_stata);
    setText("tile-rmse", M.V.rmse);
    setText("tile-rank", `${D.placebo.rank_ca} of ${M.nUnits}`);
    setText("tile-p", `p = ${M.V.p_all}`);
    setText("tile-donors", `${M.nPos} of ${M.nDonors}`);
    setText("tile-donors-sub", `led by ${M.top.state} (${fmt(M.top.ml, 3)})`);
  }

  // ------------------------------------------------------------------
  // Tab 1: observed and synthetic California.
  // ------------------------------------------------------------------
  function renderIntro() {
    const M = state.M;
    CH.lineChart(byId("intro-chart"), {
      aria: `Cigarette sales in California and in synthetic California, ${U.span(M.firstYear, M.lastYear)}`,
      h: 330,
      hCompact: 260,
      x: M.years,
      yLabel: "Cigarette sales (packs per capita)",
      yLabelCompact: "Packs per capita",
      shades: [{ from: M.treatYear, to: M.lastYear }],
      vlines: [{ x: M.treatYear, label: `Proposition 99 (${M.treatYear})` }],
      series: [
        { y: M.ca, color: C.orange, width: 2.8, cls: "path-ca" },
        { y: M.synth, color: C.steel, width: 2.4, dash: "7 5", cls: "path-synth" },
      ],
      tip: i => tipHtml(String(M.years[i]), [
        ["California", fmt(M.ca[i], 1)],
        ["Synthetic California", fmt(M.synth[i], 2)],
        ["Gap", fmt(M.gap[i], 2)],
      ]),
      legend: [
        { label: "California (observed)", color: C.orange },
        { label: "Synthetic California (mlsynth)", color: C.steel, dash: "7 5" },
      ],
    });
  }

  // ------------------------------------------------------------------
  // Tab 2: donor weights, predictor balance, predictor weights, and paths.
  // ------------------------------------------------------------------
  function buildBalanceTable() {
    const M = state.M;
    // Shares and logarithms need four decimals; sales and prices need two.
    const val = x => fmt(x, Math.abs(x) < 20 ? 4 : 2);
    const pct = (x, big) => el("span", { class: big ? "pct big" : "pct", text: ` (${U.fmtSigned(x, 2)}%)` });
    const head = el("tr", {}, [
      el("th", { text: "Predictor" }),
      el("th", { class: "num", text: "California" }),
      el("th", { class: "num", text: "Synthetic (mlsynth)" }),
      el("th", { class: "num", text: "Donor average" }),
      el("th", { class: "num", text: "Synthetic (Stata log)" }),
    ]);
    const body = M.balance.map(r => el("tr", {}, [
      el("td", { title: r.name, text: r.label }),
      el("td", { class: "num", text: val(r.treated) }),
      el("td", { class: "num" }, [val(r.synthetic), pct(r.pctSyn, false)]),
      el("td", { class: "num" }, [val(r.average), pct(r.pctAvg, Math.abs(r.pctAvg) >= 5)]),
      el("td", { class: "num", text: val(r.stata) }),
    ]));
    const foot = el("tr", {}, [
      el("td", { text: "Mean absolute percent gap" }),
      el("td", { class: "num", text: "" }),
      el("td", { class: "num", text: `${M.V.mapg_syn}%` }),
      el("td", { class: "num", text: `${M.V.mapg_avg}%` }),
      el("td", { class: "num", text: "" }),
    ]);
    const table = el("table", { class: "data balance" }, [
      el("thead", {}, [head]),
      el("tbody", {}, body),
      el("tfoot", {}, [foot]),
    ]);
    const host = byId("balance-table");
    host.textContent = "";
    host.appendChild(table);
  }

  function renderRecipeBars() {
    const M = state.M;
    const rows = state.recipeView === "pos"
      ? M.donorRows.filter(r => r.ml > 1e-9 || r.stata > 1e-9)
      : M.donorRows;
    CH.donorBars(byId("recipe-bars"), rows, {
      aria: `Donor weights of ${rows.length} states: mlsynth bars and Stata ticks`,
    });
  }

  function renderVChart() {
    const M = state.M;
    CH.pairedBars(byId("v-chart"), M.balance.map(r => ({ label: r.label, a: r.vMl, b: r.vStata })), {
      aria: "Predictor weights V of mlsynth and Stata for the seven predictors",
      xLabel: "Weight on the diagonal of V",
      aName: "mlsynth (VanillaSC)",
      bName: "Stata (synth2)",
    });
  }

  function renderRecipePaths() {
    const M = state.M;
    const D = M.D;
    const gapView = state.pathsView === "gap";
    const post = M.postYears;
    const series = [];
    const leg = [];
    if (!gapView) {
      if (state.showAverage) {
        series.push({ y: M.avgPath, color: C.grey, width: 2.2, dash: "4 4", cls: "path-avg" });
      }
      series.push({ y: M.ca, color: C.orange, width: 2.8, cls: "path-ca" });
      series.push({ y: M.synth, color: C.steel, width: 2.4, dash: "7 5", cls: "path-synth" });
      if (state.showStata) {
        series.push({ y: M.stataSynth, color: C.gold, width: 1.8, dash: "2 3", cls: "path-stata" });
      }
      leg.push({ label: "California (observed)", color: C.orange });
      leg.push({ label: "Synthetic California (mlsynth)", color: C.steel, dash: "7 5" });
      if (state.showStata) leg.push({ label: "Synthetic California with the Stata weights", color: C.gold, dash: "2 3", width: 2 });
      if (state.showAverage) leg.push({ label: "Simple average of the donors", color: C.grey, dash: "4 4" });
    } else {
      if (state.showAverage) {
        series.push({ y: M.ca.map((v, t) => v - M.avgPath[t]), color: C.grey, width: 2.2, dash: "4 4", cls: "path-avg" });
      }
      series.push({ y: M.gap, color: C.teal, width: 2.6, cls: "path-gap", points: true, r: 2.6 });
      series.push({ x: post, y: post.map(() => D.baseline.att), color: C.orange, width: 2.2, dash: "7 5", cls: "path-att" });
      if (state.showStata) {
        series.push({ y: M.stataGap, color: C.gold, width: 1.8, dash: "2 3", cls: "path-stata" });
      }
      leg.push({ label: "Gap: California minus synthetic California", color: C.teal });
      leg.push({ label: `ATT, ${U.span(M.treatYear, M.lastYear)}: ${M.V.att}`, color: C.orange, dash: "7 5" });
      if (state.showStata) leg.push({ label: "Gap with the Stata weights", color: C.gold, dash: "2 3", width: 2 });
      if (state.showAverage) leg.push({ label: "California minus the donor average", color: C.grey, dash: "4 4" });
    }
    CH.lineChart(byId("recipe-paths"), {
      aria: gapView
        ? "Yearly gap between California and synthetic California, with the ATT"
        : "Cigarette sales in California and in synthetic California",
      h: 380,
      hCompact: 290,
      x: M.years,
      yLabel: gapView ? "Gap (packs per capita)" : "Cigarette sales (packs per capita)",
      yLabelCompact: gapView ? "Gap (packs)" : "Packs per capita",
      includeZero: gapView,
      shades: [{ from: M.treatYear, to: M.lastYear }],
      vlines: [{ x: M.treatYear, label: `Proposition 99 (${M.treatYear})` }],
      hlines: gapView ? [{ y: 0 }] : [],
      series,
      tip: i => {
        const rows = [];
        if (!gapView) {
          rows.push(["California", fmt(M.ca[i], 1)]);
          rows.push(["Synthetic (mlsynth)", fmt(M.synth[i], 2)]);
          if (state.showStata) rows.push(["Synthetic (Stata weights)", fmt(M.stataSynth[i], 2)]);
          if (state.showAverage) rows.push(["Donor average", fmt(M.avgPath[i], 2)]);
        } else {
          rows.push(["Gap (mlsynth)", fmt(M.gap[i], 2)]);
          if (state.showStata) rows.push(["Gap (Stata weights)", fmt(M.stataGap[i], 2)]);
          if (state.showAverage) rows.push(["California minus average", fmt(M.ca[i] - M.avgPath[i], 2)]);
        }
        return tipHtml(String(M.years[i]), rows);
      },
      legend: leg,
    });
  }

  function renderRecipe() {
    renderRecipeBars();
    renderVChart();
    renderRecipePaths();
  }

  // ------------------------------------------------------------------
  // Tab 3: in-space placebo test, in-time placebo, and leave-one-out.
  // ------------------------------------------------------------------
  function cutInfo() {
    return state.M.cut[String(state.cutoff)];
  }

  function renderCutStats() {
    const M = state.M;
    const info = cutInfo();
    const res = info.res;
    const n = res.n_kept;
    setText("cut-kept", String(n));
    setText("cut-kept-sub", `of ${M.nUnits} states`);
    setText("cut-rank", `${res.rank} of ${n}`);
    setText("cut-p", fmt(res.p, 3));
    setText("cut-p-sub", `rank divided by states kept, ${res.rank}/${n}`);
    setText("cut-floor", `${res.n_left_min} of ${M.t1}`);
    setText("cut-floor-sub", `left-sided p at its floor of 1/${n} = ${fmt(1 / n, 3)}`);
    setText("cut-removed", res.excluded.length
      ? `Removed (${res.excluded.length}): ${res.excluded.join(", ")}.`
      : "No state is removed.");
  }

  function renderSpaghetti() {
    const M = state.M;
    const kept = cutInfo().kept;
    const placebos = kept.filter(u => u.state !== M.treated);
    const ca = kept.find(u => u.state === M.treated);
    const host = byId("spaghetti");
    let near = null;
    const nearest = (i, yv) => {
      let best = null;
      let bd = Infinity;
      placebos.forEach(u => {
        const d = Math.abs(u.gap[i] - yv);
        if (d < bd) { bd = d; best = u; }
      });
      return best;
    };
    CH.lineChart(host, {
      aria: `Gaps of California and ${placebos.length} retained placebo states, ${U.span(M.firstYear, M.lastYear)}`,
      h: 360,
      hCompact: 290,
      x: M.years,
      yLabel: "Gap (packs per capita)",
      yLabelCompact: "Gap (packs)",
      includeZero: true,
      vlines: [{ x: M.treatYear, label: String(M.treatYear) }],
      hlines: [{ y: 0 }],
      series: placebos.map(u => ({ y: u.gap, color: C.grey, width: 1.2, opacity: 0.9, cls: "path-placebo", key: u.state }))
        .concat([{ y: ca.gap, color: C.orange, width: 3, cls: "path-ca" }]),
      onHover: (i, yv) => {
        near = nearest(i, yv);
        d3.select(host).selectAll("path.path-placebo")
          .classed("hl", function () { return near !== null && this.getAttribute("data-key") === near.state; })
          .filter(function () { return near !== null && this.getAttribute("data-key") === near.state; })
          .raise();
      },
      onLeave: () => {
        d3.select(host).selectAll("path.path-placebo").classed("hl", false);
      },
      tip: i => {
        const below = placebos.filter(u => u.gap[i] <= ca.gap[i]).length;
        return tipHtml(String(M.years[i]), [
          ["California", fmt(ca.gap[i], 2)],
          near ? [`Nearest line: ${near.state}`, fmt(near.gap[i], 2)] : null,
          i >= M.t0 ? ["Placebos at or below California", `${below} of ${placebos.length}`] : null,
        ]);
      },
      legend: [
        { label: "California", color: C.orange, width: 3 },
        { label: `Retained placebo states (${placebos.length})`, color: C.grey, width: 1.6 },
      ],
    });
  }

  function renderPointwise() {
    const M = state.M;
    const D = M.D;
    const res = cutInfo().res;
    const n = res.n_kept;
    const side = state.side;
    const p = res.pointwise[side];
    const showStata = state.cutoff === D.pointwise.cutoff;
    const sp = D.pointwise.stata[side];
    const color = side === "left" ? C.teal : (side === "two" ? C.steel : C.lightOrange);
    const post = M.postYears;
    const top = side === "right"
      ? 1.04
      : Math.max(0.3, d3.max(p.concat(showStata ? sp : [])) * 1.25);
    // Reference lines carry no text on the chart; the legend names them, so
    // no label can collide with a marker.
    const floor = 1 / n;
    const atFloor = Math.abs(floor - 0.05) < 1e-12;
    const hlines = [
      { y: 0.05, color: C.orange, dash: "6 4" },
      { y: 0.1, color: C.light, dash: "2 4" },
    ];
    if (!atFloor) hlines.push({ y: floor, color: C.muted, dash: "1 3" });
    const series = [{ x: post, y: p, color, width: 2, points: true, r: 4.2, cls: "pw-line", pointCls: "pw-dot" }];
    if (showStata) {
      series.push({ x: post, y: sp, color: C.gold, line: false, points: true, hollow: true, r: 7.5, pointCls: "pw-stata" });
    }
    const sideName = { left: "Left-sided", two: "Two-sided", right: "Right-sided" }[side];
    const ca = cutInfo().kept.find(u => u.state === M.treated);
    CH.lineChart(byId("pointwise"), {
      aria: `${sideName} pointwise placebo p-values, ${U.span(post[0], post[post.length - 1])}, with ${n} retained states`,
      h: 360,
      hCompact: 290,
      x: post,
      xDomain: [post[0] - 0.5, post[post.length - 1] + 0.5],
      xTicks: post,
      xTicksCompact: post.filter((y, k) => k % 3 === 0),
      yDomain: [0, top],
      yLabel: "Placebo p-value",
      yFormat: d3.format(".2f"),
      hlines,
      series,
      tip: i => tipHtml(String(post[i]), [
        [`${sideName} p (mlsynth)`, fmt(p[i], 3)],
        showStata ? ["Stata p", fmt(sp[i], 3)] : null,
        ["Gap of California", fmt(ca.gap[M.t0 + i], 2)],
      ]),
      legend: [
        { label: `${sideName} p-value, mlsynth`, color, kind: "dot" },
        showStata ? { label: "Stata value (cut(2) only)", color: C.gold, kind: "hollow" } : null,
        { label: atFloor ? `p = 0.05, also the floor 1/${n}` : "p = 0.05", color: C.orange, dash: "6 4", width: 1.6 },
        { label: "p = 0.10", color: C.light, dash: "2 4", width: 1.6 },
        atFloor ? null : { label: `Floor 1/${n} = ${fmt(floor, 3)}`, color: C.muted, dash: "1 3", width: 1.6 },
      ].filter(Boolean),
    });
  }

  function renderRanking() {
    const M = state.M;
    const c = state.cutoff;
    const rows = M.units.map(u => ({
      state: u.state,
      ratio: u.ratio,
      kept: c === null || u.pre_rel <= c,
      isTreated: u.state === M.treated,
      pre_mspe: u.pre_mspe,
      post_mspe: u.post_mspe,
      pre_rel: u.pre_rel,
      stataRatio: M.stataTable[u.state] ? M.stataTable[u.state].ratio : undefined,
    }));
    CH.rankingBars(byId("ranking"), rows, {
      aria: `MSPE ratios of all ${rows.length} states, with the states kept by the current filter highlighted`,
    });
  }

  function intimeFit() {
    return state.M.intime.fits.find(f => f.fake_year === state.fakeYear);
  }

  function renderIntimeStats() {
    const M = state.M;
    const fit = intimeFit();
    const fy = fit.fake_year;
    setText("it-rmse", fmt(fit.pre_rmspe, 3));
    setText("it-rmse-sub", `fitted to ${U.span(M.firstYear, fy - 1)}`);
    setText("it-fake", fmt(fit.fake_gap_mean, 2));
    setText("it-fake-sub", `packs per capita, ${U.span(fy, M.treatYear - 1)}`);
    setText("it-post", fmt(fit.post_gap_mean, 2));
    setText("it-post-sub", `${U.span(M.treatYear, M.lastYear)}, same fit`);
    setText("it-share", fmt(fit.fake_gap_mean / M.D.baseline.att, 2));
    const w = U.positiveWeights(M.states, fit.weights, 1e-6)
      .map(p => `${p[0]} ${fmt(p[1], 3)}`).join(", ");
    setText("it-weights", `Donors of the fit with a fake start in ${fy}: ${w}.`);
  }

  function renderIntime() {
    const M = state.M;
    const D = M.D;
    const fit = intimeFit();
    const fy = fit.fake_year;
    const gapView = state.intimeView === "gap";
    const series = [];
    const leg = [];
    const stataFake = D.stata.intime;
    const showStata = gapView && stataFake.fake_year === fy;
    const fakeYears = M.years.filter(y => y >= fy && y < M.treatYear);
    if (gapView) {
      series.push({ y: fit.gap, color: C.teal, width: 2.6, cls: "it-gap", points: true, r: 2.6 });
      if (showStata) {
        series.push({ x: fakeYears, y: stataFake.fake_gaps, color: C.gold, line: false, points: true, hollow: true, r: 7, pointCls: "it-stata" });
      }
      leg.push({ label: `Gap with a fake start in ${fy}`, color: C.teal });
      if (showStata) leg.push({ label: "Stata fake gaps", color: C.gold, kind: "hollow" });
    } else {
      series.push({ y: M.ca, color: C.orange, width: 2.8, cls: "path-ca" });
      series.push({ y: fit.synthetic, color: C.steel, width: 2.4, dash: "7 5", cls: "it-synth" });
      leg.push({ label: "California (observed)", color: C.orange });
      leg.push({ label: `Synthetic California fitted to ${U.span(M.firstYear, fy - 1)}`, color: C.steel, dash: "7 5" });
    }
    leg.push({ label: "Fake post-treatment years", color: C.gold, kind: "band", opacity: 0.25 });
    CH.lineChart(byId("intime-chart"), {
      aria: `In-time placebo with a fake start in ${fy}: ${gapView ? "yearly gap" : "observed and synthetic paths"}`,
      h: 360,
      hCompact: 290,
      x: M.years,
      yLabel: gapView ? "Gap (packs per capita)" : "Cigarette sales (packs per capita)",
      yLabelCompact: gapView ? "Gap (packs)" : "Packs per capita",
      includeZero: gapView,
      shades: [{ from: fy, to: M.treatYear, color: C.gold, opacity: 0.12, cls: "it-shade" }],
      vlines: [
        { x: fy, color: C.gold, dash: "6 4", label: `Fake start (${fy})`, anchor: "end" },
        { x: M.treatYear, label: `Proposition 99 (${M.treatYear})` },
      ],
      hlines: gapView ? [{ y: 0 }] : [],
      series,
      tip: i => {
        const t = M.years[i];
        const rows = gapView
          ? [["Gap, fake-date fit", fmt(fit.gap[i], 2)], ["Baseline gap", fmt(M.gap[i], 2)]]
          : [["California", fmt(M.ca[i], 1)], ["Synthetic, fake-date fit", fmt(fit.synthetic[i], 2)]];
        const k = fakeYears.indexOf(t);
        if (showStata && k >= 0) rows.push(["Stata fake gap", fmt(stataFake.fake_gaps[k], 2)]);
        return tipHtml(String(t), rows);
      },
      legend: leg,
    });
  }

  function looFit() {
    return state.looPick ? state.M.loo.fits.find(f => f.dropped === state.looPick) : null;
  }

  function renderLooStats() {
    const M = state.M;
    const L = M.loo;
    setText("loo-att-range", `${fmt(L.att_range[0], 2)} to ${fmt(L.att_range[1], 2)}`);
    setText("loo-g-range", `${fmt(L.gap_2000_range[0], 2)} to ${fmt(L.gap_2000_range[1], 2)}`);
    const fit = looFit();
    if (fit) {
      const w = U.positiveWeights(M.states, fit.weights, 1e-6);
      setText("loo-sel-att", fmt(fit.att, 2));
      setText("loo-sel-rmse", `without ${fit.dropped}; pre-treatment RMSE ${fmt(fit.pre_rmse, 3)}`);
      setText("loo-sel-top", w[0][0]);
      setText("loo-sel-top-sub", `weight ${fmt(w[0][1], 3)}, the largest of ${w.length} donors in this refit`);
    } else {
      setText("loo-sel-att", "none");
      setText("loo-sel-rmse", "select a refit above");
      setText("loo-sel-top", "none");
      setText("loo-sel-top-sub", "select a refit above");
    }
  }

  function renderLoo() {
    const M = state.M;
    const D = M.D;
    const fit = looFit();
    const post = M.postYears;
    const sl = D.stata.loo;
    const series = [
      { y: M.gap, color: C.teal, width: 2.6, cls: "loo-base" },
      { x: post, y: sl.effect_min, color: C.gold, width: 1.6, dash: "5 4", cls: "loo-stata" },
      { x: post, y: sl.effect_max, color: C.gold, width: 1.6, dash: "5 4", cls: "loo-stata" },
    ];
    if (fit) series.push({ y: fit.gap, color: C.lavender, width: 2.2, cls: "loo-line", points: true, r: 2.4 });
    CH.lineChart(byId("loo-chart"), {
      aria: `Leave-one-out band of ${D.loo.fits.length} refits around the baseline gap${fit ? ", with the refit without " + fit.dropped : ""}`,
      h: 360,
      hCompact: 290,
      x: M.years,
      yLabel: "Gap (packs per capita)",
      yLabelCompact: "Gap (packs)",
      includeZero: true,
      band: { lo: M.looBand.lo, hi: M.looBand.hi, color: C.teal, opacity: 0.2, cls: "loo-band" },
      vlines: [{ x: M.treatYear, label: `Proposition 99 (${M.treatYear})` }],
      hlines: [{ y: 0 }],
      series,
      tip: i => {
        const k = i - M.t0;
        return tipHtml(String(M.years[i]), [
          ["Baseline gap", fmt(M.gap[i], 2)],
          ["Refit band", `${fmt(M.looBand.lo[i], 2)} to ${fmt(M.looBand.hi[i], 2)}`],
          fit ? [`Without ${fit.dropped}`, fmt(fit.gap[i], 2)] : null,
          k >= 0 ? ["Stata range", `${fmt(sl.effect_min[k], 2)} to ${fmt(sl.effect_max[k], 2)}`] : null,
        ]);
      },
      legend: [
        { label: "Baseline gap", color: C.teal },
        { label: "Range of the refit gaps", color: C.teal, kind: "band", opacity: 0.3 },
        fit ? { label: `Refit without ${fit.dropped}`, color: C.lavender } : null,
        { label: "Stata range (loo option)", color: C.gold, dash: "5 4", width: 2 },
      ].filter(Boolean),
    });
  }

  function renderRobust() {
    renderSpaghetti();
    renderPointwise();
    renderRanking();
    renderIntime();
    renderLoo();
  }

  // ------------------------------------------------------------------
  // Tab 4: estimator tour, comparison table, and configuration code.
  // ------------------------------------------------------------------
  function tourWithPaths() {
    return state.M.tour.filter(t => t.counterfactual);
  }

  function renderTourPaths() {
    const M = state.M;
    const on = tourWithPaths().filter(t => state.tourOn[t.key]);
    const series = [{ y: M.ca, color: C.orange, width: 2.8, cls: "path-ca" }]
      .concat(on.map(t => ({ y: t.counterfactual, color: TOUR_COLORS[t.key], width: 2.2, dash: "7 5", cls: "tour-path", key: t.key })));
    CH.lineChart(byId("tour-paths"), {
      aria: `Observed California and the counterfactual paths of ${on.length} mlsynth estimators`,
      h: 380,
      hCompact: 300,
      x: M.years,
      yLabel: "Cigarette sales (packs per capita)",
      yLabelCompact: "Packs per capita",
      shades: [{ from: M.treatYear, to: M.lastYear }],
      vlines: [{ x: M.treatYear, label: `Proposition 99 (${M.treatYear})` }],
      series,
      tip: i => tipHtml(String(M.years[i]), [["California", fmt(M.ca[i], 1)]]
        .concat(on.map(t => [t.estimator, fmt(t.counterfactual[i], 2)]))),
      legend: [{ label: "California (observed)", color: C.orange }]
        .concat(on.map(t => ({ label: t.estimator, color: TOUR_COLORS[t.key], dash: "7 5" }))),
    });
  }

  function renderTourDots() {
    const M = state.M;
    const D = M.D;
    const rows = M.tour.map(t => ({
      label: t.estimator,
      value: t.att,
      color: TOUR_COLORS[t.key] || C.light,
      hollow: !t.counterfactual,
      cls: t.counterfactual ? "att-dot" : "att-dot att-ref",
      tip: [
        ["ATT", fmt(t.att, 2)],
        ["Pre-treatment RMSE", fmt(t.pre_rmse, 3)],
        ["Gap in 2000", fmt(t.gap_2000, 2)],
        ["Inference", t.inference],
      ],
    }));
    CH.dotPlot(byId("tour-dots"), rows, {
      aria: `ATT of ${rows.length} estimators with the Stata ATT as a reference line`,
      avoid: D.stata.baseline.att,
      xLabel: `ATT, ${U.span(M.treatYear, M.lastYear)} (packs per capita)`,
      refs: [
        { value: 0, color: C.zero, width: 1 },
        { value: D.stata.baseline.att, color: C.gold, dash: "5 4", width: 1.8, cls: "stata-line", label: `Stata synth2: ${M.V.att_stata}` },
      ],
      legend: [
        { label: "mlsynth estimator", color: C.light, kind: "dot" },
        { label: "TWFE reference", color: C.muted, kind: "hollow" },
        { label: "Stata ATT (synth2)", color: C.gold, dash: "5 4", width: 2 },
      ],
    });
  }

  function buildTourTable() {
    const M = state.M;
    const head = el("tr", {}, [
      el("th", { text: "Estimator" }),
      el("th", { text: "mlsynth call" }),
      el("th", { text: "What it matches" }),
      el("th", { text: "Weight rule" }),
      el("th", { text: "Donors" }),
      el("th", { class: "num", text: "Pre-treatment RMSE" }),
      el("th", { class: "num", text: "ATT" }),
    ]);
    const body = M.tour.map(t => {
      const isCode = !!t.counterfactual;
      const sw = el("span", { class: "swatch", style: `background:${TOUR_COLORS[t.key] || C.light}; display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:6px;` });
      return el("tr", { class: isCode ? "" : "ref" }, [
        el("td", { "data-label": "Estimator" }, [sw, t.estimator]),
        el("td", { "data-label": "mlsynth call" }, [isCode ? el("code", { text: t.call }) : t.call]),
        el("td", { "data-label": "What it matches", text: t.matches }),
        el("td", { "data-label": "Weight rule", text: t.weight_rule }),
        el("td", { "data-label": "Donors", text: t.donors }),
        el("td", { class: "num", "data-label": "Pre-treatment RMSE", text: fmt(t.pre_rmse, 3) }),
        el("td", { class: "num", "data-label": "ATT", text: fmt(t.att, 2) }),
      ]);
    });
    const table = el("table", { class: "data tour" }, [el("thead", {}, [head]), el("tbody", {}, body)]);
    const host = byId("tour-table");
    host.textContent = "";
    host.appendChild(table);
  }

  // Python code for each configuration, built from the metadata of the run.
  function codeBlocks() {
    const M = state.M;
    const meta = M.D.meta;
    const q = s => JSON.stringify(s);
    // Comment lines wrap at about 46 characters, so the blocks stay narrow
    // on a phone.
    const comment = text => {
      const out = [];
      let line = "#";
      text.split(" ").forEach(word => {
        if (line.length + word.length + 1 > 46 && line !== "#") {
          out.push(line);
          line = "#";
        }
        line += " " + word;
      });
      out.push(line);
      return out;
    };
    const base = comment("Data keys that every mlsynth estimator needs").concat([
      "base = {",
      "    \"df\": panel,",
      `    "outcome": ${q(meta.outcome)},`,
      "    \"treat\": \"treated\",",
      "    \"unitid\": \"state\",",
      "    \"time\": \"year\",",
      "    \"display_graphs\": False,",
      "}",
    ]);
    const preds = meta.predictors;
    const predLines = [];
    for (let k = 0; k < preds.length; k += 4) {
      predLines.push("        " + preds.slice(k, k + 4).map(q).join(", ") + ",");
    }
    const winLines = preds.map(p => `        ${q(p)}: (${meta.windows[p][0]}, ${meta.windows[p][1]}),`);
    const adh = M.tourAdh;
    const baseline = [].concat(
      comment(`${adh.estimator} (the baseline)`),
      comment(`Matches ${adh.matches}`),
      ["config = {", "    **base,", "    \"covariates\": ["],
      predLines,
      ["    ],", "    \"covariate_windows\": {"],
      winLines,
      [
        "    },",
        `    "backend": ${q(meta.backend)},`,
        `    "canonical_v": ${q(meta.canonical_v)},`,
        `    "seed": ${meta.seed},`,
        "    \"inference\": False,",
        "}",
        "res = VanillaSC(config).fit()",
      ],
    );
    const call = (t, name) => comment(t.estimator).concat(comment(`Matches ${t.matches}`), [
      `${name} = ${t.call}.fit()`,
    ]);
    return [
      { title: "Shared data keys", lines: base, cls: "code-base" },
      { title: `Baseline: ${adh.estimator}`, lines: baseline, cls: "code-adh" },
      { title: M.tourOut.estimator, lines: call(M.tourOut, "res_outcome"), cls: "code-outcome" },
      { title: M.tourSdid.estimator, lines: call(M.tourSdid, "res_sdid"), cls: "code-sdid" },
      { title: M.tourPcr.estimator, lines: call(M.tourPcr, "res_clus"), cls: "code-pcr" },
    ];
  }

  function buildCode() {
    const host = byId("code-grid");
    host.textContent = "";
    codeBlocks().forEach(b => {
      const code = el("code", { text: b.lines.join("\n") });
      host.appendChild(el("div", { class: "code-card " + b.cls }, [
        el("h4", { text: b.title }),
        el("pre", { class: "code" }, [code]),
      ]));
    });
  }

  function renderTour() {
    renderTourPaths();
    renderTourDots();
  }

  // ------------------------------------------------------------------
  // Controls built from the data: fake years, refits, and estimators.
  // ------------------------------------------------------------------
  function radio(name, value, label, checked) {
    const input = el("input", { type: "radio", name, value });
    input.checked = !!checked;
    return el("label", {}, [input, " " + label]);
  }

  function buildControls() {
    const M = state.M;
    const D = M.D;

    const fg = byId("fake-group");
    fg.textContent = "";
    D.intime.fake_years.forEach(y => fg.appendChild(radio("fake-year", String(y), String(y), y === state.fakeYear)));

    const lg = byId("loo-group");
    lg.textContent = "";
    lg.appendChild(radio("loo-pick", "none", "Band only", state.looPick === null));
    D.loo.dropped.forEach(s => lg.appendChild(radio("loo-pick", s, `Without ${s}`, s === state.looPick)));

    const tg = byId("tour-checks");
    tg.textContent = "";
    tourWithPaths().forEach(t => {
      const input = el("input", { type: "checkbox", value: t.key, class: "tour-check" });
      input.checked = !!state.tourOn[t.key];
      const sw = el("span", { class: "swatch", style: `background:${TOUR_COLORS[t.key]}` });
      tg.appendChild(el("label", {}, [input, " ", sw, " " + t.estimator]));
    });
  }

  function wireControls() {
    document.querySelectorAll("input[name='recipe-view']").forEach(n => n.addEventListener("change", () => {
      state.recipeView = n.value;
      renderRecipeBars();
    }));
    document.querySelectorAll("input[name='paths-view']").forEach(n => n.addEventListener("change", () => {
      state.pathsView = n.value;
      renderRecipePaths();
    }));
    byId("show-stata").addEventListener("change", ev => {
      state.showStata = ev.target.checked;
      renderRecipePaths();
    });
    byId("show-average").addEventListener("change", ev => {
      state.showAverage = ev.target.checked;
      renderRecipePaths();
    });
    document.querySelectorAll("input[name='cutoff']").forEach(n => n.addEventListener("change", () => {
      state.cutoff = n.value === "none" ? null : Number(n.value);
      renderCutStats();
      renderSpaghetti();
      renderPointwise();
      renderRanking();
    }));
    document.querySelectorAll("input[name='pw-side']").forEach(n => n.addEventListener("change", () => {
      state.side = n.value;
      renderPointwise();
    }));
    byId("fake-group").addEventListener("change", ev => {
      state.fakeYear = Number(ev.target.value);
      renderIntimeStats();
      renderIntime();
    });
    document.querySelectorAll("input[name='intime-view']").forEach(n => n.addEventListener("change", () => {
      state.intimeView = n.value;
      renderIntime();
    }));
    byId("loo-group").addEventListener("change", ev => {
      state.looPick = ev.target.value === "none" ? null : ev.target.value;
      renderLooStats();
      renderLoo();
    });
    byId("tour-checks").addEventListener("change", ev => {
      state.tourOn[ev.target.value] = ev.target.checked;
      renderTourPaths();
    });
  }

  // ------------------------------------------------------------------
  // Redraws by pane, on display and after a change in width.
  // ------------------------------------------------------------------
  function renderPane(paneId) {
    if (!state.M) return;
    if (paneId === "pane-intro") renderIntro();
    else if (paneId === "pane-recipe") renderRecipe();
    else if (paneId === "pane-robust") renderRobust();
    else if (paneId === "pane-tour") renderTour();
  }

  let lastWidth = window.innerWidth;
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      renderPane(activePane());
    }, 150);
  });

  function showError(message) {
    const box = byId("app-error");
    if (box) {
      box.textContent = message;
      box.hidden = false;
    }
    document.querySelectorAll(".chart-area").forEach(node => {
      node.textContent = "";
      node.appendChild(el("div", { class: "chart-placeholder", text: "This chart could not be drawn." }));
    });
  }

  // ------------------------------------------------------------------
  // Start: check D3, load the data, fill the page, and draw the first tab.
  // ------------------------------------------------------------------
  if (typeof window.d3 === "undefined") {
    showError("The D3 library could not be loaded from d3js.org, so the charts cannot be drawn. Please check the connection and reload the page.");
    return;
  }

  fetch(DATA_URL).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }).then(D => {
    state.M = U.buildModel(D);
    state.fakeYear = D.intime.default;
    state.looPick = D.loo.dropped[0];
    tourWithPaths().forEach(t => { state.tourOn[t.key] = true; });
    bindValues(state.M.V);
    fillTiles();
    buildBalanceTable();
    buildTourTable();
    buildCode();
    buildControls();
    wireControls();
    renderCutStats();
    renderIntimeStats();
    renderLooStats();
    const start = paneFromHash();
    if (start) activateTab(start, false);
    else renderPane(activePane());
    document.body.setAttribute("data-ready", "true");
  }).catch(err => {
    console.error("[python_sc101 web app] failed to load or draw:", err);
    showError(`The file data/results.json could not be loaded or drawn (${err.message}).`);
  });
})();
